// Cut and condition a film's audio cues into public/assets/<film>/audio/.
//
//   node scripts/build-audio.mjs
//
// Reads a cue manifest. For each cue:
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
// Per AGENTS.md: FFmpeg args are passed as arrays, inputs are validated, and
// every command is printed before it runs.

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { exit } from "node:process";

// These three paths are the one thing in this script that is not generic. Point
// them at the film you are building; nothing else here is project-specific.
const CUES = "content/live-showcase/audio-cues.json";
const SRC_ROOT = "content/live-showcase/intake";
const OUT_DIR = "public/assets/live-showcase/audio";
const TMP = join(dirname(OUT_DIR), ".audio-tmp.wav");

// Voice sits above effects so narration stays intelligible under them. These
// are starting points for the mix, not a final balance.
//
// Lowered from -20/-23 on the mentors' note of 2026-08-10 ("the voice over is
// too loud"). A single cue can be trimmed further with `gainDb` in the cue
// JSON — that is how the Nishad sigh is held down without dropping every
// other effect with it.
const TARGET_RMS_DB = { vo: -24, sfx: -26 };
const PEAK_CEILING_DB = -3;

// Fades were 12ms/25ms, which is long enough to kill a click but not long
// enough to stop a cut sounding abrupt — the same note called the narration
// "scratchy and a bit abrupt with cuts when it starts and when it stops".
// These are still short enough not to be heard as fades on speech.
//
// A cue can override either edge. `09-jes-interrupted` does: an interruption
// has to stop dead, so it keeps the old hard 15ms tail.
const FADE = { vo: { in: 0.045, out: 0.11 }, sfx: { in: 0.04, out: 0.16 } };

const run = (args, { quiet = false } = {}) => {
  if (!quiet) console.log(`  $ ffmpeg ${args.join(" ")}`);
  const r = spawnSync("ffmpeg", args, { encoding: "utf8" });
  if (r.status !== 0) {
    console.error(r.stderr?.slice(-500) ?? "ffmpeg failed");
    exit(1);
  }
  return r.stderr ?? "";
};

const measure = (file, filter) => {
  const args = ["-hide_banner", "-i", file];
  if (filter) args.push("-af", `${filter},astats`);
  else args.push("-af", "astats");
  args.push("-f", "null", "-");
  const out = run(args, { quiet: true });
  const grab = (label) => {
    const m = out.match(new RegExp(`${label}: (-?[\\d.]+|-?inf)`));
    return m ? parseFloat(m[1]) : NaN;
  };
  return { peak: grab("Peak level dB"), rms: grab("RMS level dB") };
};

const { cues, fps } = JSON.parse(readFileSync(CUES, "utf8"));

const missing = cues.filter((c) => !existsSync(join(SRC_ROOT, c.src)));
if (missing.length) {
  console.error("Missing source files:");
  for (const c of missing) console.error(`  ${c.id}: ${join(SRC_ROOT, c.src)}`);
  exit(1);
}

mkdirSync(OUT_DIR, { recursive: true });
console.log(`Building ${cues.length} cues at ${fps}fps -> ${OUT_DIR}\n`);

const report = [];

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
    "-i",
    src,
    "-af",
    [
      "silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.02",
      "areverse",
      "silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.04",
      "areverse",
    ].join(","),
    "-ar",
    "48000",
    "-ac",
    "1",
    "-c:a",
    "pcm_s16le",
    TMP,
  );
  run(cutArgs);

  // Pass 2 — level. Aim for a common RMS so cues sit together, but pull the
  // gain back if that would push the peak past the ceiling.
  const { peak, rms } = measure(TMP);
  let gain = TARGET_RMS_DB[cue.type] - rms + (cue.gainDb ?? 0);
  if (peak + gain > PEAK_CEILING_DB) gain = PEAK_CEILING_DB - peak;

  const dur = parseFloat(
    spawnSync(
      "ffprobe",
      ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", TMP],
      { encoding: "utf8" },
    ).stdout,
  );

  const fadeOutStart = Math.max(0, dur - fade.out);
  run([
    "-v",
    "error",
    "-y",
    "-i",
    TMP,
    "-af",
    [
      `volume=${gain.toFixed(2)}dB`,
      `afade=t=in:st=0:d=${fade.in}`,
      `afade=t=out:st=${fadeOutStart.toFixed(3)}:d=${fade.out}`,
    ].join(","),
    "-c:a",
    "pcm_s16le",
    out,
  ]);

  const after = measure(out);
  report.push({
    id: cue.id,
    frame: cue.frame,
    type: cue.type,
    dur,
    rms: after.rms,
    peak: after.peak,
  });
  console.log(
    `  -> ${dur.toFixed(2)}s  gain ${gain >= 0 ? "+" : ""}${gain.toFixed(1)}dB  rms ${after.rms.toFixed(1)}  peak ${after.peak.toFixed(1)}\n`,
  );
}

rmSync(TMP, { force: true });

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
