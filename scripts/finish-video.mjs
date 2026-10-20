// Finish a rendered video for delivery: standard colour range, one loudness.
//
//   node scripts/finish-video.mjs <render.mp4> [<out.mp4>] [--audio <score.wav>] [--lufs -14]
//
// Two things a render does not do on its own, both noticed only on someone
// else's screen:
//
//   1. Colour range. A render made from JPEG frames is tagged full-range
//      (yuvj420p) whatever --pixel-format says, and some players then show it
//      washed out or crushed. The picture is converted to TV range. A render
//      that is already TV range is copied untouched.
//   2. Loudness. Every delivered film goes out at ONE level, TARGET_LUFS. If a
//      film sounds too loud or too quiet, change that constant (or pass --lufs)
//      - never the gains inside the mix.
//
// --audio lays a separate track (a score from scripts/score/) over the picture
// instead of the render's own audio. It must match the picture to within a
// frame, or sync is a lie and the script refuses.
//
// Loudness is two-pass, as FFmpeg's loudnorm documentation recommends: measure,
// then apply the measured values in linear mode so the dynamics are left alone.
// The true-peak target sits a little under the usual -1.5 because AAC overshoots
// a hot master on decode: at 192 kbps the encoder alone added 1.4 dB of true
// peak to the transients, at 320 kbps 0.2 dB (measured 2026-10-19).
//
// Per AGENTS.md: FFmpeg arguments are arrays, inputs are validated, and each
// command is printed before it runs. Needs a full system FFmpeg (loudnorm,
// alimiter, ebur128).

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { basename, dirname, extname, join, resolve } from "node:path";
import { argv, exit } from "node:process";

const TARGET_LUFS = -14;
const TRUE_PEAK_DB = -2;
const LRA = 11;
const AUDIO_KBPS = "320k";
const SILENT_BELOW_DB = -80;

const args = argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
};
const positional = args.filter((a, i) => !a.startsWith("--") && !args[i - 1]?.startsWith("--"));
const [input, outArg] = positional;
const score = flag("audio");
const lufs = Number(flag("lufs") ?? TARGET_LUFS);

if (!input) {
  console.error("usage: node scripts/finish-video.mjs <render.mp4> [<out.mp4>] [--audio <score.wav>] [--lufs -14]");
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

// --- Loudness, pass 1: measure -------------------------------------------
let audioFilter = null;
if (audioSource) {
  const measured = run("ffmpeg", [
    "-hide_banner", "-nostats", "-i", audioSource[0], "-vn",
    "-af", `loudnorm=I=${lufs}:TP=${TRUE_PEAK_DB}:LRA=${LRA}:print_format=json`,
    "-f", "null", "-",
  ]).stderr;
  const m = JSON.parse(measured.slice(measured.lastIndexOf("{"), measured.lastIndexOf("}") + 1));
  console.log(`measured: ${m.input_i} LUFS, true peak ${m.input_tp} dBTP, loudness range ${m.input_lra} LU`);
  // Apply in linear mode, resample to the delivery rate, then catch any stray
  // peak. alimiter levels its output up unless level=disabled, which would undo
  // the loudness just set.
  audioFilter = [
    `loudnorm=I=${lufs}:TP=${TRUE_PEAK_DB}:LRA=${LRA}:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true`,
    "aresample=48000",
    "alimiter=limit=0.75:attack=2:release=60:level=disabled",
  ].join(",");
}

// --- Pass 2: write it ------------------------------------------------------
const inputs = ["-i", input];
if (score) inputs.push("-i", score);

const videoArgs = fullRange
  ? [
      // Range only: the matrix is left as it was, so colours do not shift.
      "-vf", "scale=in_range=full:out_range=tv,format=yuv420p",
      "-c:v", "libx264", "-crf", "16", "-preset", "medium",
      "-color_range", "tv",
      ...(v.color_space ? ["-colorspace", v.color_space] : []),
      ...(v.color_primaries ? ["-color_primaries", v.color_primaries] : []),
      ...(v.color_transfer ? ["-color_trc", v.color_transfer] : []),
    ]
  : ["-c:v", "copy"];

let audioArgs;
if (audioFilter) audioArgs = ["-map", audioSource[1], "-af", audioFilter, "-c:a", "aac", "-b:a", AUDIO_KBPS];
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
console.log(`  picture ${dv.width}×${dv.height}, ${dv.pix_fmt}, range ${dv.color_range ?? "untagged"}${fullRange ? " (converted from full range)" : " (copied untouched)"}`);
if (audioFilter) {
  const check = run("ffmpeg", ["-hide_banner", "-nostats", "-i", out, "-vn", "-af", "ebur128=peak=true:framelog=verbose", "-f", "null", "-"], { show: false }).stderr;
  const summary = check.slice(check.lastIndexOf("Summary:"));
  console.log(`  audio ${summary.match(/I:\s+(-?[\d.]+) LUFS/)?.[1] ?? "?"} LUFS (target ${lufs}), true peak ${summary.match(/Peak:\s+(-?[\d.]+) dBFS/)?.[1] ?? "?"} dBTP`);
}
console.log(`  length ${Number(done.format.duration).toFixed(3)} s (render ${picDur.toFixed(3)} s)`);
console.log("\nRun scripts/check-render.mjs on it before it goes anywhere. Whether it sounds right is the person's call.\n");
