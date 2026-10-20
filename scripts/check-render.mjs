// Measure a rendered video, so nobody has to judge by eye what a number can say.
//
//   node scripts/check-render.mjs <video.mp4> [--composition <Id>] [--no-sheet]
//
// Reports facts, never a verdict: size, frame rate, length (against the
// composition's own length, if given), colour range, the audio track and its
// loudness, and stretches of black, frozen picture and silence. Writes a
// contact sheet - a grid of small frames across the whole video - beside it as
// <name>-sheet.jpg, so a person can see the film at a glance.
//
// Exit code 1 only for a measured mismatch: an unreadable file, or a size,
// frame rate or length that disagrees with the composition. A black, frozen or
// silent stretch is reported and does not fail: a held title or a dramatic
// pause looks exactly like a fault to a filter. Whether it is one is the
// person's call - see working-practice.
//
// Per AGENTS.md: FFmpeg arguments are arrays, the input is validated, and each
// command is printed before it runs. Needs a full system FFmpeg - the filters
// used here (ebur128, blackdetect, freezedetect, silencedetect, tile) are not
// all in the copy Remotion bundles.

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { basename, dirname, extname, join } from "node:path";
import { argv, exit } from "node:process";

// Remotion's and Vite's own entry files, run with node: no shell, the same on
// every platform (Node refuses to run npx's .cmd shim without one on Windows).
const REMOTION_CLI = "node_modules/@remotion/cli/remotion-cli.js";

// The delivery standard, the same constant scripts/finish-video.mjs applies.
const DELIVERY_LUFS = -14;
const DELIVERY_TRUE_PEAK = -1;

// Thresholds for the stretch detectors. Short enough to catch a dropped scene,
// long enough not to report every cut through black or every held beat.
const BLACK_MIN_S = 0.5;
const FREEZE_MIN_S = 2;
const SILENCE_MIN_S = 1;
const SILENCE_DB = -50;
const SHEET_TILES = 36;
const SHEET_COLUMNS = 6;

const args = argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
};
const video = args.find((a, i) => !a.startsWith("--") && !args[i - 1]?.startsWith("--composition"));
const composition = flag("composition");
const wantSheet = !args.includes("--no-sheet");

if (!video) {
  console.error("usage: node scripts/check-render.mjs <video.mp4> [--composition <Id>] [--no-sheet]");
  exit(1);
}
if (!existsSync(video)) {
  console.error(`No file at ${video}.`);
  exit(1);
}

const run = (cmd, cmdArgs, { show = true } = {}) => {
  if (show) console.log(`$ ${cmd} ${cmdArgs.join(" ")}`);
  const r = spawnSync(cmd, cmdArgs, {
    encoding: "utf8",
    maxBuffer: 256 * 1024 * 1024,
  });
  if (r.error?.code === "ENOENT") {
    console.error(`${cmd} is not on PATH. A full system FFmpeg is required - see installing-the-toolchain.`);
    exit(1);
  }
  return r;
};

const seconds = (s) => `${Number(s).toFixed(2)} s`;
const facts = [];
const notes = [];
const defects = [];

// --- What the file says about itself -------------------------------------
const probe = run("ffprobe", ["-v", "error", "-show_streams", "-show_format", "-of", "json", video]);
if (probe.status !== 0) {
  console.error(`ffprobe could not read ${video}:\n${probe.stderr}`);
  exit(1);
}
const info = JSON.parse(probe.stdout);
const v = info.streams.find((s) => s.codec_type === "video");
const a = info.streams.find((s) => s.codec_type === "audio");
if (!v && !a) {
  console.error(`${video} has neither picture nor sound.`);
  exit(1);
}
// An audio file on its own - a score from scripts/score/ - gets the sound
// checks only.
const fps = v ? v.r_frame_rate.split("/").map(Number).reduce((n, d) => n / d) : null;
// The picture's own length. The container's runs a little longer whenever an
// AAC track is present, because the encoder pads the audio's start.
const duration = Number(v?.duration ?? a?.duration ?? info.format.duration);
const frames = v ? (v.nb_frames ? Number(v.nb_frames) : Math.round(duration * fps)) : null;
const fullRange = v && (v.pix_fmt?.startsWith("yuvj") || v.color_range === "pc");

if (v) {
  facts.push(`size ${v.width}×${v.height}, ${Number.isInteger(fps) ? fps : fps.toFixed(3)} fps, ${v.codec_name}`);
  facts.push(`length ${seconds(duration)}, ${frames} frames`);
  facts.push(`colour ${v.pix_fmt}${v.color_range ? `, range ${v.color_range}` : ""}${v.color_space ? `, ${v.color_space}` : ""}`);
} else {
  facts.push(`sound only, length ${seconds(duration)}`);
}
if (fullRange) {
  notes.push("The picture is full-range. Some players show that washed out or crushed - run scripts/finish-video.mjs before it goes anywhere.");
}

// --- Against the composition, if one was named ---------------------------
if (composition && v) {
  const list = run("node", [REMOTION_CLI, "compositions"]);
  const line = `${list.stdout}`.split(/\r?\n/).find((l) => l.trim().split(/\s+/)[0] === composition);
  if (!line) {
    defects.push(`No composition called "${composition}" in \`npx remotion compositions\`.`);
  } else {
    // A row reads: <id>  <fps>  <w>x<h>  <frames> (<seconds> sec)
    const m = line.match(/^\s*\S+\s+(\d+(?:\.\d+)?)\s+(\d+)x(\d+)\s+(\d+)/);
    if (!m) {
      notes.push(`Could not read the composition row: "${line.trim()}"`);
    } else {
      const [, cFps, cW, cH, cFrames] = m.map(Number);
      facts.push(`composition ${composition}: ${cW}×${cH}, ${cFps} fps, ${cFrames} frames`);
      if (cW !== v.width || cH !== v.height) defects.push(`Size is ${v.width}×${v.height}; the composition is ${cW}×${cH}.`);
      if (Math.abs(cFps - fps) > 0.01) defects.push(`Frame rate is ${fps}; the composition is ${cFps}.`);
      if (Math.abs(cFrames - frames) > 1) {
        defects.push(`${frames} frames; the composition is ${cFrames}. A partial render (--frames) explains this; anything else is a fault.`);
      }
    }
  }
}

// --- One decode pass for every stretch detector and the loudness ---------
const filterArgs = v ? ["-vf", `blackdetect=d=${BLACK_MIN_S}:pix_th=0.10,freezedetect=n=0.003:d=${FREEZE_MIN_S}`] : [];
if (a) filterArgs.push("-af", `silencedetect=n=${SILENCE_DB}dB:d=${SILENCE_MIN_S},volumedetect,ebur128=peak=true:framelog=verbose`);
const pass = run("ffmpeg", ["-hide_banner", "-nostats", "-i", video, ...filterArgs, "-f", "null", "-"]);
if (pass.status !== 0) {
  defects.push(`The file did not decode cleanly:\n${pass.stderr.slice(-800)}`);
}
const log = pass.stderr;

const stretches = (startKey, endKey) => {
  const starts = [...log.matchAll(new RegExp(`${startKey}:\\s*(-?[\\d.]+)`, "g"))].map((m) => Number(m[1]));
  const ends = [...log.matchAll(new RegExp(`${endKey}:\\s*(-?[\\d.]+)`, "g"))].map((m) => Number(m[1]));
  return starts.map((s, i) => [s, ends[i] ?? duration]);
};
const describe = (list) => list.map(([s, e]) => `${s.toFixed(2)}–${e.toFixed(2)} s`).join(", ");

const black = stretches("black_start", "black_end");
const frozen = [...log.matchAll(/freeze_start:\s*([\d.]+)/g)].map((m, i) => {
  const end = [...log.matchAll(/freeze_end:\s*([\d.]+)/g)][i];
  return [Number(m[1]), end ? Number(end[1]) : duration];
});
if (v) {
  facts.push(black.length ? `black for ${BLACK_MIN_S} s or more: ${describe(black)}` : `no black stretch of ${BLACK_MIN_S} s or more`);
  facts.push(frozen.length ? `frozen for ${FREEZE_MIN_S} s or more: ${describe(frozen)}` : `no frozen stretch of ${FREEZE_MIN_S} s or more`);
}

if (!a) {
  facts.push("no audio track");
} else {
  const maxDb = Number(log.match(/max_volume:\s*(-?[\d.]+|-inf) dB/)?.[1] ?? "-inf");
  if (!Number.isFinite(maxDb) || maxDb < -80) {
    facts.push(`audio track present (${a.codec_name}) and silent throughout`);
  } else {
    const summary = log.slice(log.lastIndexOf("Summary:"));
    const lufs = Number(summary.match(/I:\s+(-?[\d.]+) LUFS/)?.[1]);
    const lra = Number(summary.match(/LRA:\s+([\d.]+) LU/)?.[1]);
    const peak = Number(summary.match(/Peak:\s+(-?[\d.]+|-inf) dBFS/)?.[1]);
    facts.push(`audio ${a.codec_name} ${a.sample_rate} Hz ${a.channels} ch, ${lufs} LUFS integrated, loudness range ${lra} LU, true peak ${peak} dBTP`);
    if (Math.abs(lufs - DELIVERY_LUFS) > 1) {
      notes.push(`Loudness is ${lufs} LUFS; the delivery level is ${DELIVERY_LUFS}. Not finished yet - scripts/finish-video.mjs sets it.`);
    }
    if (peak > DELIVERY_TRUE_PEAK) notes.push(`True peak ${peak} dBTP is above ${DELIVERY_TRUE_PEAK}; it can clip once someone else re-encodes it.`);
    const silent = stretches("silence_start", "silence_end");
    facts.push(silent.length ? `silent for ${SILENCE_MIN_S} s or more: ${describe(silent)}` : `no silence of ${SILENCE_MIN_S} s or more`);
  }
}

// --- Contact sheet --------------------------------------------------------
if (wantSheet && v && pass.status === 0) {
  const tiles = Math.max(1, Math.min(SHEET_TILES, Math.floor(duration)));
  const every = duration / tiles;
  const columns = Math.min(SHEET_COLUMNS, tiles);
  const rows = Math.ceil(tiles / columns);
  const sheet = join(dirname(video), `${basename(video, extname(video))}-sheet.jpg`);
  const made = run("ffmpeg", [
    "-hide_banner", "-loglevel", "error", "-y", "-i", video,
    "-vf", `fps=1/${every.toFixed(4)},scale=320:-2,tile=${columns}x${rows}:padding=4:margin=4`,
    "-frames:v", "1", "-q:v", "3", sheet,
  ]);
  if (made.status === 0) facts.push(`contact sheet ${sheet} — ${tiles} frames, one every ${every.toFixed(2)} s, left to right`);
  else notes.push(`Could not write the contact sheet: ${made.stderr.slice(-300)}`);
}

// --- Report ---------------------------------------------------------------
console.log(`\n${video}`);
for (const f of facts) console.log(`  ${f}`);
if (notes.length) {
  console.log("\nWorth knowing:");
  for (const n of notes) console.log(`  - ${n}`);
}
if (defects.length) {
  console.log("\nMeasured mismatches:");
  for (const d of defects) console.log(`  - ${d}`);
}
console.log("\nThese are measurements. Whether the video works is for the person watching it.\n");
exit(defects.length ? 1 : 0);
