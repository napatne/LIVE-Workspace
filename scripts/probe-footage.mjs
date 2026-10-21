// Say what a clip is before a film is built from it: one line of facts per
// video file, so nobody plans a shot around footage they have not measured.
//
//   node scripts/probe-footage.mjs <file-or-dir> [--film-fps 30]
//
// Given a folder, it reads every video file directly inside it (not in
// sub-folders). For each clip it reports:
//
//   - length, in seconds and frames
//   - frame rate: the nominal rate (r_frame_rate) against the average
//     (avg_frame_rate). Phones record at a variable frame rate, and the two
//     then disagree; frame numbers no longer land evenly in time, so it is
//     flagged
//   - size and shape: wide, upright or square
//   - sound: whether there is an audio stream, its codec and channels
//   - with --film-fps (default 30, the workspace's usual rate), whether the
//     clip's rate matches the film's
//
// It reports facts, never a verdict, and changes nothing. Exit code 1 only if
// nothing could be read.
//
// Per AGENTS.md: ffprobe arguments are arrays, inputs are validated, and each
// command is printed before it runs.

import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, statSync } from "node:fs";
import { extname, join } from "node:path";
import { argv, exit } from "node:process";

const VIDEO_EXTENSIONS = [".mp4", ".mov", ".m4v", ".mkv", ".webm", ".avi", ".mts", ".m2ts", ".3gp", ".mpg", ".mpeg", ".wmv"];
const DEFAULT_FILM_FPS = 30;
const USAGE = "usage: node scripts/probe-footage.mjs <file-or-dir> [--film-fps 30]";

const args = argv.slice(2);
const fpsAt = args.indexOf("--film-fps");
const filmFps = fpsAt >= 0 ? Number(args[fpsAt + 1]) : DEFAULT_FILM_FPS;
const target = args.find((a, i) => !a.startsWith("--") && !(fpsAt >= 0 && i === fpsAt + 1));

if (args.includes("--help") || !target) {
  console.error(USAGE);
  exit(1);
}
const unknown = args.filter((a) => a.startsWith("--") && a !== "--film-fps");
if (unknown.length) {
  console.error(`Unknown option ${unknown.join(", ")}.\n${USAGE}`);
  exit(1);
}
if (!Number.isFinite(filmFps) || filmFps <= 0) {
  console.error("--film-fps needs the film's frame rate, such as 30.");
  exit(1);
}
if (!existsSync(target)) {
  console.error(`No file or folder at ${target}.`);
  exit(1);
}

let files;
if (statSync(target).isDirectory()) {
  files = readdirSync(target)
    .filter((f) => VIDEO_EXTENSIONS.includes(extname(f).toLowerCase()))
    .sort()
    .map((f) => join(target, f))
    .filter((f) => statSync(f).isFile());
  if (!files.length) {
    console.error(`No video files directly inside ${target} (looked for ${VIDEO_EXTENSIONS.join(" ")}).`);
    exit(1);
  }
} else {
  files = [target];
}

const ratio = (r) => {
  const [n, d] = String(r ?? "").split("/").map(Number);
  return d ? n / d : n;
};
const rate = (n) => (Number.isInteger(n) ? String(n) : n.toFixed(3));

let read = 0;
for (const file of files) {
  const probeArgs = ["-v", "error", "-show_streams", "-show_format", "-of", "json", file];
  console.log(`$ ffprobe ${probeArgs.join(" ")}`);
  const r = spawnSync("ffprobe", probeArgs, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  if (r.error?.code === "ENOENT") {
    console.error("ffprobe is not on PATH. A full system FFmpeg is required - see installing-the-toolchain.");
    exit(1);
  }
  if (r.status !== 0) {
    console.log(`\n${file}\n  could not be read: ${r.stderr.trim().slice(-300)}\n`);
    continue;
  }
  const info = JSON.parse(r.stdout);
  const v = info.streams.find((s) => s.codec_type === "video" && s.disposition?.attached_pic !== 1);
  const audio = info.streams.filter((s) => s.codec_type === "audio");
  const facts = [];
  const flags = [];

  if (!v) {
    facts.push("no video stream");
  } else {
    read++;
    const nominal = ratio(v.r_frame_rate);
    const average = ratio(v.avg_frame_rate);
    const length = Number(v.duration ?? info.format.duration);
    const frames = v.nb_frames ? Number(v.nb_frames) : Math.round(length * (average || nominal));
    facts.push(`length ${length.toFixed(2)} s, ${frames} frames`);

    const vfr = Number.isFinite(average) && average > 0 && Math.abs(average - nominal) > 0.01;
    facts.push(`frame rate ${rate(nominal)} fps nominal (${v.r_frame_rate}), ${Number.isFinite(average) && average > 0 ? rate(average) : "?"} fps average (${v.avg_frame_rate})`);
    if (vfr) flags.push("variable frame rate: the nominal and average rates differ, so frame numbers do not land evenly in time. Convert it to a constant rate before placing beats on it.");

    // A phone often stores upright video as wide pixels plus a rotation tag.
    const rotation = Number(v.side_data_list?.find((d) => d.rotation !== undefined)?.rotation ?? v.tags?.rotate ?? 0);
    const turned = Math.abs(rotation) % 180 === 90;
    const w = turned ? v.height : v.width;
    const h = turned ? v.width : v.height;
    const shape = w === h ? "square" : w > h ? "wide" : "upright";
    facts.push(`size ${w}×${h}, ${shape}${turned ? ` (stored ${v.width}×${v.height}, rotated ${rotation}°)` : ""}, ${v.codec_name}`);

    const playRate = vfr ? average : nominal;
    if (Math.abs(playRate - filmFps) > 0.01) {
      flags.push(`${rate(playRate)} fps does not match the film's ${filmFps} fps: Remotion will drop or repeat frames to fit, and frame numbers in the clip are not frame numbers in the film.`);
    } else {
      facts.push(`matches the film's ${filmFps} fps`);
    }
  }

  if (!audio.length) {
    facts.push("no sound");
  } else {
    const a = audio[0];
    facts.push(`sound: ${a.codec_name}, ${a.channels} ch${a.sample_rate ? `, ${a.sample_rate} Hz` : ""}${audio.length > 1 ? ` (and ${audio.length - 1} more audio stream${audio.length > 2 ? "s" : ""})` : ""}`);
  }

  console.log(`\n${file}`);
  for (const f of facts) console.log(`  ${f}`);
  for (const f of flags) console.log(`  !! ${f}`);
  console.log("");
}

console.log("These are measurements. Whether a clip is right for the film is for the person to say.");
exit(read ? 0 : 1);
