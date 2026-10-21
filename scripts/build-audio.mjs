// Cut and condition a film's audio cues - narration lines and sound effects -
// into one WAV each, ready for the film to place.
//
//   node scripts/build-audio.mjs --cues <cues.json> --src <dir> --out <dir>
//
// All three are required, so it works for any film:
//   --cues  the cue manifest (shape below)
//   --src   the folder each cue's "src" is read from, e.g. content/<project>/intake
//   --out   where the finished WAVs go, e.g. public/assets/<project>/audio
//
// The manifest:
// {
//   "fps": 30,
//   "cues": [
//     { "id": "01-hello", "src": "hello-take2.wav", "type": "vo", "frame": 45 },
//     { "id": "whoosh", "src": "sfx/whoosh.wav", "type": "sfx", "frame": 300,
//       "start": 0.4, "duration": 1.2, "gainDb": -3, "fadeIn": 0.01, "fadeOut": 0.2 }
//   ]
// }
// "type" is "vo" (voice) or "sfx" (effect). "frame" is where the film places
// the cue, used here only to report its end and catch overlaps. "start" and
// "duration" (seconds) cut a region of the source; "gainDb" trims one cue's
// level; "fadeIn"/"fadeOut" (seconds) override the fades for one cue. The whole
// manifest is checked before FFmpeg runs at all.
//
// For each cue:
//
//   1. trim to the requested region
//   2. strip leading/trailing near-silence, so every clip starts on its sound
//   3. normalise to a common RMS, with a peak ceiling so nothing clips
//   4. apply short fades at both edges
//
// Step 4 is the one that fixes the abrupt starts and stops. A cut that lands
// mid-waveform produces a step discontinuity, which is heard as a click; a
// fade of even 10ms removes it without being audible as a fade.
//
// Every cue comes out mono, 48 kHz, 16-bit, whatever the source was - the
// script prints this as it starts. Its working file goes in out/.audio-tmp/
// (never public/, which is copied into every render) and is removed whether
// the build succeeds or fails.
//
// Per AGENTS.md: FFmpeg args are passed as arrays, inputs are validated, and
// every command is printed before it runs. Needs a full system FFmpeg:
// silenceremove and afade are not in the copy Remotion bundles.

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, statSync } from "node:fs";
import { join } from "node:path";
import { argv, exit, pid } from "node:process";

// Voice sits above effects so narration stays intelligible under them. These
// are starting points for the mix, not a final balance. A single cue can be
// trimmed further with `gainDb` in the manifest, so one loud effect can be
// held down without dropping every other effect with it.
const TARGET_RMS_DB = { vo: -24, sfx: -26 };
const PEAK_CEILING_DB = -3;

// Long enough that a cut does not sound abrupt, short enough not to be heard
// as a fade on speech. A cue can override either edge - an interruption that
// has to stop dead, for instance, wants a much shorter fadeOut.
const FADE = { vo: { in: 0.045, out: 0.11 }, sfx: { in: 0.04, out: 0.16 } };
const TYPES = Object.keys(TARGET_RMS_DB);
const SAMPLE_RATE = 48000;
const CHANNELS = 1;

const USAGE = "usage: node scripts/build-audio.mjs --cues <cues.json> --src <dir> --out <dir>";
const args = argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
};
const CUES = flag("cues");
const SRC_ROOT = flag("src");
const OUT_DIR = flag("out");

if (args.includes("--help") || !CUES || !SRC_ROOT || !OUT_DIR || [CUES, SRC_ROOT, OUT_DIR].some((v) => v.startsWith("--"))) {
  console.error(USAGE);
  if (args.length && !args.includes("--help")) console.error("All three of --cues, --src and --out are required.");
  exit(1);
}
const unknown = args.filter((a) => a.startsWith("--") && !["--cues", "--src", "--out", "--help"].includes(a));
if (unknown.length) {
  console.error(`Unknown option ${unknown.join(", ")}.\n${USAGE}`);
  exit(1);
}
if (!existsSync(CUES)) {
  console.error(`No cue manifest at ${CUES}.`);
  exit(1);
}
if (!existsSync(SRC_ROOT) || !statSync(SRC_ROOT).isDirectory()) {
  console.error(`--src ${SRC_ROOT} is not a folder.`);
  exit(1);
}

// --- Check the whole manifest before any FFmpeg run ----------------------
let manifest;
try {
  manifest = JSON.parse(readFileSync(CUES, "utf8"));
} catch (err) {
  console.error(`${CUES} is not valid JSON: ${err.message}`);
  exit(1);
}
const problems = [];
const { cues, fps } = manifest ?? {};
if (!Number.isFinite(fps) || fps <= 0) problems.push(`"fps" must be a positive number (the film's frame rate).`);
if (!Array.isArray(cues) || cues.length === 0) problems.push(`"cues" must be a list with at least one cue.`);
const seen = new Set();
for (const [i, cue] of (Array.isArray(cues) ? cues : []).entries()) {
  const where = `cue ${i + 1}${typeof cue?.id === "string" ? ` ("${cue.id}")` : ""}`;
  if (!cue || typeof cue !== "object") {
    problems.push(`${where} is not an object.`);
    continue;
  }
  if (typeof cue.id !== "string" || !/^[\w.-]+$/.test(cue.id)) problems.push(`${where}: "id" must be a name of letters, digits, ".", "_" or "-" - it becomes the file name.`);
  else if (seen.has(cue.id)) problems.push(`${where}: another cue already has this id.`);
  else seen.add(cue.id);
  if (!TYPES.includes(cue.type)) problems.push(`${where}: "type" is ${JSON.stringify(cue.type)}; it must be one of ${TYPES.map((t) => `"${t}"`).join(", ")}.`);
  if (typeof cue.src !== "string" || !cue.src) problems.push(`${where}: "src" must be a file name inside --src.`);
  else if (!existsSync(join(SRC_ROOT, cue.src))) problems.push(`${where}: no source file at ${join(SRC_ROOT, cue.src)}.`);
  if (!Number.isInteger(cue.frame) || cue.frame < 0) problems.push(`${where}: "frame" must be a whole number of frames, 0 or more.`);
  for (const key of ["start", "duration", "fadeIn", "fadeOut", "gainDb"]) {
    if (cue[key] !== undefined && !Number.isFinite(cue[key])) problems.push(`${where}: "${key}" must be a number.`);
  }
  for (const key of ["start", "fadeIn", "fadeOut"]) {
    if (Number.isFinite(cue[key]) && cue[key] < 0) problems.push(`${where}: "${key}" cannot be negative.`);
  }
  if (Number.isFinite(cue.duration) && cue.duration <= 0) problems.push(`${where}: "duration" must be more than 0.`);
}
if (problems.length) {
  console.error(`${CUES} cannot be built:`);
  for (const p of problems) console.error(`  - ${p}`);
  exit(1);
}

// --- Build ------------------------------------------------------------------
const TMP_DIR = join("out", ".audio-tmp");
const TMP = join(TMP_DIR, `cue-${pid}.wav`);

const ffmpeg = (ffArgs, { quiet = false } = {}) => {
  if (!quiet) console.log(`  $ ffmpeg ${ffArgs.join(" ")}`);
  const r = spawnSync("ffmpeg", ffArgs, { encoding: "utf8" });
  if (r.error?.code === "ENOENT") throw new Error("ffmpeg is not on PATH. A full system FFmpeg is required - see installing-the-toolchain.");
  if (r.status !== 0) throw new Error(r.stderr?.slice(-500) || "ffmpeg failed");
  return r.stderr ?? "";
};

const measure = (file) => {
  const out = ffmpeg(["-hide_banner", "-i", file, "-af", "astats", "-f", "null", "-"], { quiet: true });
  const grab = (label) => {
    const m = out.match(new RegExp(`${label}: (-?[\\d.]+|-?inf)`));
    return m ? parseFloat(m[1]) : NaN;
  };
  return { peak: grab("Peak level dB"), rms: grab("RMS level dB") };
};

const report = [];
let failed = false;
try {
  mkdirSync(TMP_DIR, { recursive: true });
  mkdirSync(OUT_DIR, { recursive: true });
  console.log(`Building ${cues.length} cues at ${fps} fps -> ${OUT_DIR}`);
  console.log(`Every cue is written mono, ${SAMPLE_RATE / 1000} kHz, 16-bit, whatever its source was.\n`);

  for (const cue of cues) {
    const src = join(SRC_ROOT, cue.src);
    const out = join(OUT_DIR, `${cue.id}.wav`);
    const fade = {
      in: cue.fadeIn ?? FADE[cue.type].in,
      out: cue.fadeOut ?? FADE[cue.type].out,
    };

    console.log(`${cue.id}  (frame ${cue.frame}, ${cue.type})`);

    // Pass 1 — cut the region, then trim silence off both ends so the clip
    // begins exactly on its first sound rather than on dead air.
    const cutArgs = ["-v", "error", "-y"];
    if (cue.start !== undefined) cutArgs.push("-ss", String(cue.start));
    if (cue.duration !== undefined) cutArgs.push("-t", String(cue.duration));
    cutArgs.push(
      "-i", src,
      "-af",
      [
        "silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.02",
        "areverse",
        "silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.04",
        "areverse",
      ].join(","),
      "-ar", String(SAMPLE_RATE),
      "-ac", String(CHANNELS),
      "-c:a", "pcm_s16le",
      TMP,
    );
    ffmpeg(cutArgs);

    // Pass 2 — level. Aim for a common RMS so cues sit together, but pull the
    // gain back if that would push the peak past the ceiling.
    const { peak, rms } = measure(TMP);
    if (!Number.isFinite(rms) || !Number.isFinite(peak)) {
      throw new Error(`${cue.id}: nothing left after trimming silence - the region of ${src} is silent, or "start"/"duration" miss the sound.`);
    }
    let gain = TARGET_RMS_DB[cue.type] - rms + (cue.gainDb ?? 0);
    if (peak + gain > PEAK_CEILING_DB) gain = PEAK_CEILING_DB - peak;

    const probe = spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", TMP], { encoding: "utf8" });
    const dur = parseFloat(probe.stdout);
    if (!Number.isFinite(dur)) throw new Error(`${cue.id}: ffprobe could not read the length of the cut.`);

    const fadeOutStart = Math.max(0, dur - fade.out);
    ffmpeg([
      "-v", "error", "-y",
      "-i", TMP,
      "-af",
      [
        `volume=${gain.toFixed(2)}dB`,
        `afade=t=in:st=0:d=${fade.in}`,
        `afade=t=out:st=${fadeOutStart.toFixed(3)}:d=${fade.out}`,
      ].join(","),
      "-c:a", "pcm_s16le",
      out,
    ]);

    const after = measure(out);
    report.push({ id: cue.id, frame: cue.frame, type: cue.type, dur, rms: after.rms, peak: after.peak });
    console.log(
      `  -> ${dur.toFixed(2)}s  gain ${gain >= 0 ? "+" : ""}${gain.toFixed(1)}dB  rms ${after.rms.toFixed(1)}  peak ${after.peak.toFixed(1)}\n`,
    );
  }
} catch (err) {
  console.error(`\n${err.message}`);
  console.error(`Stopped. ${report.length} of ${cues.length} cues were written to ${OUT_DIR}.`);
  failed = true;
} finally {
  rmSync(TMP, { force: true });
}
if (failed) exit(1);

console.log("\n=== built ===");
console.log("id                      frame    dur     rms    peak   ends");
for (const r of report) {
  const endFrame = r.frame + Math.ceil(r.dur * fps);
  console.log(
    `${r.id.padEnd(22)} ${String(r.frame).padStart(6)} ${r.dur.toFixed(2).padStart(6)}s ${r.rms.toFixed(1).padStart(7)} ${r.peak.toFixed(1).padStart(7)} ${String(endFrame).padStart(6)}`,
  );
}

// Overlap check: two cues talking over each other is almost always a timing
// mistake rather than an intention, so surface it rather than let it slip
// through to the mix.
const sorted = [...report].sort((a, b) => a.frame - b.frame);
let clash = false;
for (let i = 0; i < sorted.length - 1; i++) {
  const end = sorted[i].frame + Math.ceil(sorted[i].dur * fps);
  if (end > sorted[i + 1].frame) {
    if (!clash) console.log("\n!! overlapping cues:");
    clash = true;
    console.log(
      `   ${sorted[i].id} ends at ${end} but ${sorted[i + 1].id} starts at ${sorted[i + 1].frame}  (${end - sorted[i + 1].frame} frames)`,
    );
  }
}
if (!clash) console.log("\nNo overlapping cues.");
