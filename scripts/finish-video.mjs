// Finish a rendered video for delivery: standard colour range, one loudness.
//
//   node scripts/finish-video.mjs <render.mp4> [<out.mp4>] [--audio <score.wav>] [--lufs -14] [--web] [--loudnorm]
//
// Two things a render does not do on its own, both noticed only on someone
// else's screen:
//
//   1. Colour range. A render made from JPEG frames is tagged full-range
//      (yuvj420p) whatever --pixel-format says, and some players then show it
//      washed out or crushed. The picture is converted to TV range. A render
//      that is already TV range is copied untouched.
//   2. Loudness. Every delivered film goes out at ONE level, DELIVERY_LUFS in
//      scripts/lib/delivery.mjs, which scripts/check-render.mjs measures
//      against too. If a film sounds too loud or too quiet, change that
//      constant (or pass --lufs) - never the gains inside the mix.
//
// --web makes a smaller file for web playback: the picture is always
// re-encoded (CRF 23, capped at 8 Mbit/s), even when it is already TV range and
// would otherwise be copied untouched - a copy keeps whatever size the render
// had. Without it the picture is encoded near-lossless (CRF 16) for a master.
//
// Colour matrix: the script never converts it. An HD picture (720 px tall or
// more) tagged BT.601 (bt470bg or smpte170m) gets a warning, because many
// players assume BT.709 at that size; the fix is to re-render with
// --color-space=bt709, not to relabel or convert the finished file here.
//
// --audio lays a separate track (a score from scripts/score/) over the picture
// instead of the render's own audio. It must match the picture to within a
// frame, or sync is a lie and the script refuses.
//
// Loudness is one fixed gain to the target, then a limiter for the peaks that
// gain pushes up - the same method the score build uses
// (scripts/score/lib/render.mjs). The audio is levelled into a temporary WAV
// under out/, measured, corrected once if the limiter took it off target, and
// only then muxed. A fixed gain moves everything by the same amount, so ducks,
// silences and quiet passages keep the depth they were written with.
//
// --loudnorm uses FFmpeg's two-pass loudnorm instead, the method before
// 2026-10-21. loudnorm keeps to linear mode only when the gain it needs would
// not push the true peak past the target; otherwise it falls back to its
// dynamic mode, which narrows ducks (a -10 dB score duck came out about
// -8.8 LU, measured 2026-10-21). Kept for a film that sounds wrong limited -
// very dynamic material, where the limiter would work hard on the peaks.
// The true-peak target, and why it sits under the usual -1.5, is in
// scripts/lib/delivery.mjs.
//
// Per AGENTS.md: FFmpeg arguments are arrays, inputs are validated, and each
// command is printed before it runs. Needs a full system FFmpeg (loudnorm,
// alimiter, ebur128).

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync, statSync } from "node:fs";
import { basename, dirname, extname, join, resolve } from "node:path";
import { argv, exit, pid } from "node:process";
import { DELIVERY_LUFS, DELIVERY_TRUE_PEAK_DB } from "./lib/delivery.mjs";

const LRA = 11;
const AUDIO_KBPS = "320k";
const SILENT_BELOW_DB = -80;

const args = argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
};
// Only --audio and --lufs take a value; --web is a switch and takes none.
const VALUE_FLAGS = ["--audio", "--lufs"];
const positional = args.filter((a, i) => !a.startsWith("--") && !VALUE_FLAGS.includes(args[i - 1]));
const [input, outArg] = positional;
const score = flag("audio");
const lufs = Number(flag("lufs") ?? DELIVERY_LUFS);
const web = args.includes("--web");
const useLoudnorm = args.includes("--loudnorm");
const USAGE = "usage: node scripts/finish-video.mjs <render.mp4> [<out.mp4>] [--audio <score.wav>] [--lufs -14] [--web] [--loudnorm]";

if (!input || args.includes("--help")) {
  console.error(USAGE);
  console.error("  --web        a smaller file for web playback (CRF 23, max 8 Mbit/s); always re-encodes the picture");
  console.error("  --loudnorm   level with FFmpeg's loudnorm instead of a fixed gain and limiter (can narrow ducks)");
  exit(1);
}
const unknown = args.filter((a) => a.startsWith("--") && ![...VALUE_FLAGS, "--web", "--loudnorm"].includes(a));
if (unknown.length) {
  console.error(`Unknown option ${unknown.join(", ")}.
${USAGE}`);
  exit(1);
}
if (!Number.isFinite(lufs)) {
  console.error(`--lufs needs a number, such as ${DELIVERY_LUFS}.`);
  exit(1);
}
for (const f of [input, score].filter(Boolean)) {
  if (!existsSync(f)) {
    console.error(`No file at ${f}.`);
    exit(1);
  }
}
const out = outArg ?? join(dirname(input), `${basename(input, extname(input))}-finished.mp4`);
if (resolve(out) === resolve(input)) {
  console.error("Write the finished file somewhere new - overwriting the render loses the version to go back to.");
  exit(1);
}

const run = (cmd, cmdArgs, { show = true } = {}) => {
  if (show) console.log(`$ ${cmd} ${cmdArgs.join(" ")}`);
  const r = spawnSync(cmd, cmdArgs, { encoding: "utf8", maxBuffer: 256 * 1024 * 1024 });
  if (r.error?.code === "ENOENT") {
    console.error(`${cmd} is not on PATH. A full system FFmpeg is required - see installing-the-toolchain.`);
    exit(1);
  }
  if (r.status !== 0) {
    console.error(r.stderr.slice(-1500));
    exit(r.status ?? 1);
  }
  return r;
};
const probeJson = (file) => JSON.parse(run("ffprobe", ["-v", "error", "-show_streams", "-show_format", "-of", "json", file], { show: false }).stdout);

// --- What we are starting from -------------------------------------------
const info = probeJson(input);
const v = info.streams.find((s) => s.codec_type === "video");
if (!v) {
  console.error(`${input} has no video stream.`);
  exit(1);
}
const [num, den] = v.r_frame_rate.split("/").map(Number);
const fps = num / den;
// The picture's own length; the container's is padded whenever AAC is present.
const picDur = Number(v.duration ?? info.format.duration);
const fullRange = v.pix_fmt?.startsWith("yuvj") || v.color_range === "pc";

// An HD picture tagged with the standard-definition matrix. Remotion tags BT.601
// unless told otherwise; many players assume BT.709 at HD sizes, and colours
// can shift. Converting here would hide which render was wrong, so say it.
if (v.height >= 720 && ["bt470bg", "smpte170m"].includes(v.color_space)) {
  console.log(
    `Warning: ${input} is ${v.width}×${v.height} and tagged ${v.color_space} (BT.601). Many players assume BT.709 at this size, so colours may shift.
` +
      "  This script does not convert colour. Re-render with --color-space=bt709 and finish that file instead.",
  );
}

// Which audio, if any, is going to be finished.
let audioSource = null; // [file, streamSpecifier]
if (score) {
  const audDur = Number(probeJson(score).format.duration);
  if (Math.abs(picDur - audDur) > 1 / fps) {
    console.error(`The audio is ${audDur.toFixed(3)} s and the picture ${picDur.toFixed(3)} s - more than a frame apart. Re-render one of them.`);
    exit(1);
  }
  audioSource = [score, "1:a:0"];
} else if (info.streams.some((s) => s.codec_type === "audio")) {
  const vol = run("ffmpeg", ["-hide_banner", "-nostats", "-i", input, "-vn", "-af", "volumedetect", "-f", "null", "-"], { show: false }).stderr;
  const maxDb = Number(vol.match(/max_volume:\s*(-?[\d.]+|-inf) dB/)?.[1] ?? "-inf");
  if (Number.isFinite(maxDb) && maxDb > SILENT_BELOW_DB) audioSource = [input, "0:a:0"];
  else console.log("The render's audio track is silent - left as it is, no loudness to set.");
} else {
  console.log("No audio track - a silent film. Only the picture is finished.");
}

// --- Loudness ----------------------------------------------------------------
const measure = (file, stream) => {
  const log = run("ffmpeg", ["-hide_banner", "-nostats", "-i", file, "-map", stream, "-af", "ebur128=peak=true:framelog=verbose", "-f", "null", "-"], { show: false }).stderr;
  const summary = log.slice(log.lastIndexOf("Summary:"));
  return {
    lufs: Number(summary.match(/I:\s+(-?[\d.]+) LUFS/)?.[1]),
    truePeak: Number(summary.match(/Peak:\s+(-?[\d.]+|-inf) dBFS/)?.[1]),
    lra: Number(summary.match(/LRA:\s+(-?[\d.]+) LU/)?.[1]),
  };
};

let audioFilter = null; // --loudnorm: a filter applied while muxing
let levelled = null; // default: a WAV already at the delivery level
const tmpDir = "out/.finish-tmp";
const tmpWav = `${tmpDir}/${basename(input, extname(input))}-${pid}.wav`;
process.on("exit", () => rmSync(tmpWav, { force: true }));

if (audioSource && useLoudnorm) {
  // Two-pass loudnorm, as FFmpeg's documentation recommends: measure, then
  // apply the measured values asking for linear mode.
  const measured = run("ffmpeg", [
    "-hide_banner", "-nostats", "-i", audioSource[0], "-vn",
    "-af", `loudnorm=I=${lufs}:TP=${DELIVERY_TRUE_PEAK_DB}:LRA=${LRA}:print_format=json`,
    "-f", "null", "-",
  ]).stderr;
  const m = JSON.parse(measured.slice(measured.lastIndexOf("{"), measured.lastIndexOf("}") + 1));
  console.log(`measured: ${m.input_i} LUFS, true peak ${m.input_tp} dBTP, loudness range (loudnorm input LRA) ${m.input_lra} LU`);
  // loudnorm's own test for staying linear: the gain it needs, added to the
  // measured true peak, must stay under the true-peak target.
  const peakAfterGain = Number(m.input_tp) + (lufs - Number(m.input_i));
  if (peakAfterGain > DELIVERY_TRUE_PEAK_DB) {
    console.log(
      `Note: reaching ${lufs} LUFS would put the true peak at ${peakAfterGain.toFixed(1)} dBTP, over ${DELIVERY_TRUE_PEAK_DB}, so loudnorm will run in its dynamic mode, not linear.\n` +
        "  That narrows ducks and dynamics a little. Drop --loudnorm to level with a fixed gain instead.",
    );
  }
  // alimiter levels its output up unless level=disabled, which would undo
  // the loudness just set.
  audioFilter = [
    `loudnorm=I=${lufs}:TP=${DELIVERY_TRUE_PEAK_DB}:LRA=${LRA}:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true`,
    "aresample=48000",
    "alimiter=limit=0.75:attack=2:release=60:level=disabled",
  ].join(",");
} else if (audioSource) {
  // The score is a file of its own (stream 0 when read alone); the render's
  // audio is stream 0:a:0 of the render.
  const stream = "0:a:0";
  const before = measure(audioSource[0], stream);
  if (!Number.isFinite(before.lufs)) {
    console.error("The audio measured silent throughout - nothing to level.");
    exit(1);
  }
  console.log(`measured: ${before.lufs} LUFS, true peak ${before.truePeak} dBTP, loudness range (ebur128 LRA) ${before.lra} LU`);
  // A sample-peak ceiling 1 dB under the true-peak target, for the peaks
  // between samples and the AAC encode. latency=1 keeps the limiter from
  // delaying the sound against the picture.
  const ceiling = (10 ** ((DELIVERY_TRUE_PEAK_DB - 1) / 20)).toFixed(4);
  mkdirSync(tmpDir, { recursive: true });
  const write = (gainDb) =>
    run("ffmpeg", [
      "-hide_banner", "-loglevel", "error", "-y", "-i", audioSource[0], "-map", stream,
      "-af", `volume=${gainDb.toFixed(2)}dB,alimiter=limit=${ceiling}:attack=3:release=80:level=disabled:latency=1,aresample=48000`,
      "-c:a", "pcm_s24le", tmpWav,
    ]);
  let gainDb = lufs - before.lufs;
  write(gainDb);
  let after = measure(tmpWav, "0:a:0");
  // The limiter takes some level off the peaks; correct for it, up to three
  // times - peaky audio loses more to the limiter with each step up.
  for (let i = 0; i < 3 && Math.abs(after.lufs - lufs) > 0.3; i++) {
    gainDb += lufs - after.lufs;
    write(gainDb);
    after = measure(tmpWav, "0:a:0");
  }
  console.log(`levelled: gain ${gainDb >= 0 ? "+" : ""}${gainDb.toFixed(2)} dB, then a limiter at ${(DELIVERY_TRUE_PEAK_DB - 1).toFixed(1)} dBFS -> ${after.lufs} LUFS`);
  // How much loudness the limiter itself removed. A little is normal; a lot
  // means the audio's peaks sit far above its body, and squeezing them
  // narrows ducks and dynamics whichever method sets the level (measured
  // 2026-10-21 on a click track: a 10 dB duck kept about 1 LU either way).
  const limited = gainDb - (after.lufs - before.lufs);
  if (limited > 2) {
    console.log(
      `Note: the limiter took ${limited.toFixed(1)} LU off the peaks. The loudest moments are far above the rest, so ducks and quiet passages come out narrower.\n` +
        "  Lowering the loudest hits in the mix fixes it at the source. Measure a duck in the finished file if its depth matters.",
    );
  }
  if (Math.abs(after.lufs - lufs) > 0.5) {
    console.log(`Note: landed at ${after.lufs} LUFS, not ${lufs}. The limiter could not bring it closer without crushing the peaks.`);
  }
  levelled = tmpWav;
}

// --- Pass 2: write it ------------------------------------------------------
const inputs = ["-i", input];
if (levelled) inputs.push("-i", levelled);
else if (score) inputs.push("-i", score);

// Re-encode when the range needs converting, or when --web asks for a smaller
// file; otherwise copy the picture untouched.
const reencode = fullRange || web;
const videoArgs = reencode
  ? [
      // Range only: the matrix is left as it was, so colours do not shift.
      "-vf", fullRange ? "scale=in_range=full:out_range=tv,format=yuv420p" : "format=yuv420p",
      "-c:v", "libx264", "-preset", "medium",
      ...(web ? ["-crf", "23", "-maxrate", "8M", "-bufsize", "16M"] : ["-crf", "16"]),
      "-color_range", "tv",
      ...(v.color_space ? ["-colorspace", v.color_space] : []),
      ...(v.color_primaries ? ["-color_primaries", v.color_primaries] : []),
      ...(v.color_transfer ? ["-color_trc", v.color_transfer] : []),
    ]
  : ["-c:v", "copy"];

let audioArgs;
if (levelled) audioArgs = ["-map", "1:a:0", "-c:a", "aac", "-b:a", AUDIO_KBPS];
else if (audioFilter) audioArgs = ["-map", audioSource[1], "-af", audioFilter, "-c:a", "aac", "-b:a", AUDIO_KBPS];
else if (info.streams.some((s) => s.codec_type === "audio")) audioArgs = ["-map", "0:a:0", "-c:a", "copy"];
else audioArgs = [];

mkdirSync(dirname(out), { recursive: true });
run("ffmpeg", [
  "-hide_banner", "-loglevel", "error", "-y",
  ...inputs,
  "-map", "0:v:0", ...videoArgs,
  ...audioArgs,
  "-t", picDur.toFixed(6), "-movflags", "+faststart",
  out,
]);

// --- Check what was written, not what was asked for ---------------------
const done = probeJson(out);
const dv = done.streams.find((s) => s.codec_type === "video");
console.log(`\nfinished: ${out}`);
console.log(`  picture ${dv.width}×${dv.height}, ${dv.pix_fmt}, range ${dv.color_range ?? "untagged"}${fullRange ? " (converted from full range)" : reencode ? " (re-encoded)" : " (copied untouched)"}${web ? ", web size (CRF 23, max 8 Mbit/s)" : ""}`);
console.log(`  file ${(statSync(out).size / 1024 / 1024).toFixed(1)} MB (render ${(statSync(input).size / 1024 / 1024).toFixed(1)} MB)`);
if (levelled || audioFilter) {
  const check = run("ffmpeg", ["-hide_banner", "-nostats", "-i", out, "-vn", "-af", "ebur128=peak=true:framelog=verbose", "-f", "null", "-"], { show: false }).stderr;
  const summary = check.slice(check.lastIndexOf("Summary:"));
  console.log(`  audio ${summary.match(/I:\s+(-?[\d.]+) LUFS/)?.[1] ?? "?"} LUFS (target ${lufs}), true peak ${summary.match(/Peak:\s+(-?[\d.]+) dBFS/)?.[1] ?? "?"} dBTP, ${useLoudnorm ? "loudnorm" : "fixed gain + limiter"}`);
}
console.log(`  length ${Number(done.format.duration).toFixed(3)} s (render ${picDur.toFixed(3)} s)`);
console.log("\nRun scripts/check-render.mjs on it before it goes anywhere. Whether it sounds right is the person's call.\n");
