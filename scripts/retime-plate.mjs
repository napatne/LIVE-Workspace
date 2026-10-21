// Re-time sections of a silent performance plate.
//
//   node scripts/retime-plate.mjs <in.mp4> <out.mp4> <spec> [...] [--film-fps <n>]
//
// Each spec is `startFrame:endFrame:factor[:smooth]` against the SOURCE plate,
// in order. `factor` > 1 slows the section down, < 1 speeds it up. An open end
// (`210::1`) runs to the last frame.
//
//   node scripts/retime-plate.mjs in.mp4 out.mp4 0:102:3.0 102:210:1 210::1 --film-fps 30
//
// A gap between one section's end and the next one's start DROPS those source
// frames. That is how damaged frames are removed: generated footage sometimes
// renders a few frames badly, and a gap skips them. The script prints anything
// it drops rather than doing it silently.
//
// The output is picture only. A clip with sound loses it here - the script
// says so when the input has an audio stream. Re-timed sound would be
// stretched or chopped, so lay the clip's own sound separately in the film.
//
// `smooth` runs the section through `minterpolate`, which synthesises true
// intermediate frames instead of repeating each source frame `factor` times.
// At 3x, repetition means the clip is really playing at 8fps and reads as a
// stutter; interpolation keeps it fluid. It is slow - measured 2026-10-20 at
// about 10 minutes for 2 s of 1080p at quarter speed - and can warp
// fast-moving edges, so use it only where the stutter is actually visible.
//
// The frame mapping printed at the end is built from the frame count actually
// written, not from the arithmetic, so it holds even when FFmpeg rounds a
// section. With --film-fps it is printed in the film's frames as well as the
// clip's, for a clip whose frame rate differs from the composition's.
//
// Why one filtergraph rather than several files concatenated afterwards: the
// scene components play the result as a single continuous <Video>. A plate cut
// into several <Video> instances can glitch at each join as one player hands
// over to the next, so the join has to happen here, in one pass.
//
// Sections are slowed, never frozen. A dead-still frame held for several
// seconds reads as a broken video; slowed motion reads as deliberate.
//
// Per AGENTS.md: args are passed as an array, inputs are validated, and the
// command is printed before it runs. Needs a full system FFmpeg: setpts and
// minterpolate are not in the copy Remotion bundles.

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { argv, exit } from "node:process";

const USAGE = "usage: node scripts/retime-plate.mjs <in.mp4> <out.mp4> <start:end:factor[:smooth]> [...] [--film-fps <n>]";
const raw = argv.slice(2);
const fpsAt = raw.indexOf("--film-fps");
const filmFps = fpsAt >= 0 ? Number(raw[fpsAt + 1]) : null;
const rest = raw.filter((_, i) => fpsAt < 0 || (i !== fpsAt && i !== fpsAt + 1));
const [input, output, ...specs] = rest;

if (raw.includes("--help") || !input || !output || specs.length === 0) {
  console.error(USAGE);
  exit(1);
}
const unknown = rest.filter((a) => a.startsWith("--"));
if (unknown.length) {
  console.error(`Unknown option ${unknown.join(", ")}.\n${USAGE}`);
  exit(1);
}
if (fpsAt >= 0 && (!Number.isFinite(filmFps) || filmFps <= 0)) {
  console.error("--film-fps needs the film's frame rate, such as 30.");
  exit(1);
}

if (!existsSync(input)) {
  console.error(`input not found: ${input}`);
  exit(1);
}

const probe = spawnSync(
  "ffprobe",
  [
    "-v", "error",
    "-count_frames",
    "-select_streams", "v:0",
    "-show_entries", "stream=nb_read_frames,r_frame_rate,avg_frame_rate",
    "-of", "json",
    input,
  ],
  { encoding: "utf8" },
);
if (probe.error?.code === "ENOENT") {
  console.error("ffprobe is not on PATH. A full system FFmpeg is required - see installing-the-toolchain.");
  exit(1);
}
if (probe.status !== 0) {
  console.error(probe.stderr?.slice(-400) ?? "ffprobe failed");
  exit(1);
}
const stream = JSON.parse(probe.stdout).streams?.[0];
if (!stream) {
  console.error(`${input} has no video stream.`);
  exit(1);
}
const ratio = (r) => {
  const [n, d] = String(r).split("/").map(Number);
  return d ? n / d : n;
};
const sourceFrames = Number(stream.nb_read_frames);
const fps = ratio(stream.r_frame_rate);
const avgFps = ratio(stream.avg_frame_rate);
console.log(`${input}: ${sourceFrames} frames at ${fps}fps`);

// A phone records at a variable frame rate: the nominal rate and the average
// disagree. Frame numbers then do not map evenly to time.
if (Number.isFinite(avgFps) && avgFps > 0 && Math.abs(avgFps - fps) > 0.01) {
  console.log(
    `!! the nominal frame rate (${stream.r_frame_rate}) and the average (${stream.avg_frame_rate}, ${avgFps.toFixed(3)}fps) differ: this looks like variable frame rate footage.\n` +
      "   Frame numbers will not land evenly in time. Convert it to a constant rate first (scripts/probe-footage.mjs flags this).",
  );
}

// The output is picture only: say so if the input had sound.
const audioProbe = spawnSync(
  "ffprobe",
  ["-v", "error", "-select_streams", "a", "-show_entries", "stream=index,codec_name", "-of", "csv=p=0", input],
  { encoding: "utf8" },
);
if (audioProbe.status === 0 && audioProbe.stdout.trim()) {
  console.log("!! the input has an audio stream; the output is picture only, so that sound is DROPPED. Lay the clip's own sound in the film separately if it is wanted.");
}

const parsed = specs.map((spec) => {
  const [s, e, f, mode] = spec.split(":");
  const start = Number(s);
  const end = e === "" || e === undefined ? sourceFrames : Number(e);
  const factor = Number(f);
  const smooth = mode === "smooth";
  if (!Number.isFinite(start) || !Number.isFinite(end) || !Number.isFinite(factor) || factor <= 0) {
    console.error(`bad spec: ${spec} (want start:end:factor, factor above 0)`);
    exit(1);
  }
  if (mode !== undefined && !smooth) {
    console.error(`bad spec: ${spec} (the fourth field can only be "smooth")`);
    exit(1);
  }
  if (end <= start) {
    console.error(`bad spec: ${spec} (end must be after start)`);
    exit(1);
  }
  if (end > sourceFrames) {
    console.error(`bad spec: ${spec} (source has only ${sourceFrames} frames)`);
    exit(1);
  }
  return { start, end, factor, smooth };
});

// Sections must run forward and must not overlap — an overlap silently repeats
// frames. A gap is allowed but never silent: it means those source frames are
// being deliberately dropped, so say which ones.
let cursor = 0;
for (const { start, end } of parsed) {
  if (start < cursor) {
    console.error(
      `sections overlap: section starting at ${start} runs back into one that ends at ${cursor}`,
    );
    exit(1);
  }
  if (start > cursor) {
    console.log(`  dropping source frames ${cursor}-${start} (${start - cursor} frames)`);
  }
  cursor = end;
}
if (cursor !== sourceFrames) {
  console.log(`  dropping source frames ${cursor}-${sourceFrames} from the tail`);
}

let predicted = 0;
console.log("\nsection            source     factor    output   mode");
for (const { start, end, factor, smooth } of parsed) {
  const outFrames = (end - start) * factor;
  predicted += outFrames;
  console.log(
    `  ${String(start).padStart(4)}-${String(end).padEnd(4)}      ${String(end - start).padStart(5)}f    ${factor.toFixed(3).padStart(6)}x   ${outFrames.toFixed(1).padStart(7)}f   ${smooth ? "interpolated" : "repeated"}`,
  );
}
console.log(`  total                            ${predicted.toFixed(1).padStart(13)}f  (${(predicted / fps).toFixed(2)}s)\n`);
if (parsed.some((p) => p.smooth && p.factor > 1)) {
  console.log("Smooth sections are slow to encode - minutes per second of 1080p. Let it run.\n");
}

// For a smoothed section, minterpolate first synthesises frames at fps*factor
// so there is a real frame for every output frame, and setpts then spaces them
// back out to the timeline rate. Repeating `setpts` alone would just hold each
// source frame `factor` times.
const chains = parsed.map(({ start, end, factor, smooth }, i) => {
  const trim = `[0:v]trim=start_frame=${start}:end_frame=${end},setpts=PTS-STARTPTS`;
  if (!smooth || factor <= 1) {
    return `${trim},setpts=${factor}*(PTS-STARTPTS)[s${i}]`;
  }
  const interpFps = (fps * factor).toFixed(4);
  return `${trim},minterpolate=fps=${interpFps}:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1,setpts=${factor}*(PTS-STARTPTS)[s${i}]`;
});
const labels = parsed.map((_, i) => `[s${i}]`).join("");
const filter = `${chains.join(";")};${labels}concat=n=${parsed.length}:v=1:a=0[v]`;

const args = [
  "-v", "error",
  "-y",
  "-i", input,
  "-filter_complex", filter,
  "-map", "[v]",
  "-r", String(fps),
  "-c:v", "libx264",
  "-preset", "medium",
  "-crf", "17",
  "-pix_fmt", "yuv420p",
  "-an",
  output,
];

console.log(`$ ffmpeg ${args.join(" ")}\n`);
const run = spawnSync("ffmpeg", args, { encoding: "utf8" });
if (run.status !== 0) {
  console.error(run.stderr?.slice(-800) ?? "ffmpeg failed");
  exit(1);
}

const after = spawnSync(
  "ffprobe",
  [
    "-v", "error",
    "-count_frames",
    "-select_streams", "v:0",
    "-show_entries", "stream=nb_read_frames",
    "-of", "csv=p=0",
    output,
  ],
  { encoding: "utf8" },
);
// Take the first CSV field, not the whole line. ffprobe 9.0 terminates a
// single-entry csv=p=0 row with a trailing comma ("201,"), which Number()
// turns into NaN — and `NaN > 2` is false, so this check silently passed
// whatever the render actually produced.
const actual = Number(after.stdout.trim().split(",")[0]);
let measured = predicted;
if (!Number.isFinite(actual)) {
  console.log(`!! could not read a frame count from ffprobe: ${JSON.stringify(after.stdout)}`);
  console.log("!! the mapping below is the arithmetic, not a measurement - check the output's frame count yourself");
} else {
  measured = actual;
  console.log(`${output}: ${actual} frames (${(actual / fps).toFixed(2)}s at ${fps}fps)`);
  if (Math.abs(actual - predicted) > 2) {
    console.log(`!! predicted ${predicted.toFixed(1)} but got ${actual} — check the specs. The mapping below is spread over the ${actual} frames written.`);
  }
}

// Source frame -> output frame, for re-mapping component beats onto the result.
// Each boundary is the arithmetic position scaled to the frame count written,
// so the last section ends exactly on the last frame of the file.
const scale = predicted > 0 ? measured / predicted : 1;
const film = (clipFrame) => Math.round((clipFrame * filmFps) / fps);
console.log(`\nframe mapping (source -> output clip frames at ${fps}fps${filmFps ? ` -> film frames at ${filmFps}fps` : ""}):`);
let outCursor = 0;
for (const { start, end, factor } of parsed) {
  const from = Math.round(outCursor * scale);
  outCursor += (end - start) * factor;
  const to = Math.round(outCursor * scale);
  const filmPart = filmFps ? `   film ${String(film(from)).padStart(4)}-${String(film(to)).padEnd(4)}` : "";
  console.log(
    `  ${String(start).padStart(4)}-${String(end).padEnd(4)} -> clip ${String(from).padStart(4)}-${String(to).padEnd(4)}${filmPart}   (x${factor})`,
  );
}
if (filmFps) {
  console.log(`  whole clip: ${measured} clip frames = ${film(measured)} film frames (${(measured / fps).toFixed(3)} s)`);
  if (Math.abs(filmFps - fps) > 0.01) {
    console.log(`  The clip is ${fps}fps and the film ${filmFps}fps: place beats by the film frames, which is what the composition counts.`);
  }
}
