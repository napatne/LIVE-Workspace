// Re-time sections of a silent performance plate.
//
//   node scripts/retime-plate.mjs <in.mp4> <out.mp4> <spec> [...]
//
// Each spec is `startFrame:endFrame:factor[:smooth]` against the SOURCE plate,
// in order. `factor` > 1 slows the section down, < 1 speeds it up. An open end
// (`210::1`) runs to the last frame.
//
//   node scripts/retime-plate.mjs in.mp4 out.mp4 0:102:3.0 102:210:1 210::1
//
// A gap between one section's end and the next one's start DROPS those source
// frames. That is how damaged frames are removed: generated footage sometimes
// renders a few frames badly, and a gap skips them. The script prints anything
// it drops rather than doing it silently.
//
// `smooth` runs the section through `minterpolate`, which synthesises true
// intermediate frames instead of repeating each source frame `factor` times.
// At 3x, repetition means the clip is really playing at 8fps and reads as a
// stutter; interpolation keeps it fluid. It is slow to encode and can warp
// fast-moving edges, so use it only where the stutter is actually visible.
//
// Why one filtergraph rather than several files concatenated afterwards: the
// scene components play the result as a single continuous <Video>. Cutting a
// plate into multiple Remotion instances is what made an earlier Nishad build
// glitch (agent-logs/014), so the join has to happen here, in one pass.
//
// Sections are slowed, never frozen. A dead-still frame held for several
// seconds reads as a broken video; slowed motion reads as deliberate.
//
// Per AGENTS.md: args are passed as an array, inputs are validated, and the
// command is printed before it runs.

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { argv, exit } from "node:process";

const [input, output, ...specs] = argv.slice(2);

if (!input || !output || specs.length === 0) {
  console.error(
    "usage: node scripts/retime-plate.mjs <in.mp4> <out.mp4> <start:end:factor> [...]",
  );
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
    "-show_entries", "stream=nb_read_frames,r_frame_rate",
    "-of", "csv=p=0",
    input,
  ],
  { encoding: "utf8" },
);
if (probe.status !== 0) {
  console.error(probe.stderr?.slice(-400) ?? "ffprobe failed");
  exit(1);
}
const [rate, countRaw] = probe.stdout.trim().split(",");
const sourceFrames = Number(countRaw);
const fps = Number(rate.split("/")[0]) / Number(rate.split("/")[1]);
console.log(`${input}: ${sourceFrames} frames at ${fps}fps`);

const parsed = specs.map((spec) => {
  const [s, e, f, mode] = spec.split(":");
  const start = Number(s);
  const end = e === "" || e === undefined ? sourceFrames : Number(e);
  const factor = Number(f);
  const smooth = mode === "smooth";
  if (!Number.isFinite(start) || !Number.isFinite(end) || !Number.isFinite(factor)) {
    console.error(`bad spec: ${spec} (want start:end:factor)`);
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
if (!Number.isFinite(actual)) {
  console.log(`!! could not read a frame count from ffprobe: ${JSON.stringify(after.stdout)}`);
} else {
  console.log(`${output}: ${actual} frames (${(actual / fps).toFixed(2)}s at ${fps}fps)`);
  if (Math.abs(actual - predicted) > 2) {
    console.log(`!! predicted ${predicted.toFixed(1)} but got ${actual} — check the specs`);
  }
}

// Source frame -> output frame, for re-mapping component beats onto the result.
console.log("\nframe mapping (source -> output):");
let outCursor = 0;
for (const { start, end, factor } of parsed) {
  console.log(
    `  ${String(start).padStart(4)}-${String(end).padEnd(4)} -> ${String(Math.round(outCursor)).padStart(4)}-${String(Math.round(outCursor + (end - start) * factor)).padEnd(4)}   (x${factor})`,
  );
  outCursor += (end - start) * factor;
}
