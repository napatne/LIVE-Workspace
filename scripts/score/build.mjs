// Build a film's score: arrangement in, MIDI and audio out, timed to the picture.
//
//   node scripts/score/build.mjs content/<project>/music/score.mjs [--composition <Id>]
//
// The score file is a small module the assistant writes for each film (copy
// scripts/score/example/score.mjs to start). It names the film's timeline and
// returns a Score; this script does the rest:
//
//   1. checks the timeline against the composition, if one is named - a score
//      built for a film of the wrong length is out of sync from the first cut
//   2. writes score.mid beside the score file - open it in MuseScore to read or
//      change any part by hand
//   3. renders it through the SoundFont
//   4. compresses it, applies the timeline's ducks and silences, levels it to
//      one constant, and writes the WAV the film plays - after copying any WAV
//      already there to out/<project>/score-history/, so the last version that
//      was played to someone is never lost
//   5. prints a cue table: every section, hit, duck and silence (start and
//      end), with its frame and its time, and where each hit falls on the
//      beat grid. Only hits are checked against the grid: a section, a duck or
//      a silence follows the picture, not the beat.
//
// The intermediate audio goes in out/.score-tmp/, one file per run, and is
// removed whether the build succeeds or not.
//
// It never says the music is good. Whether it is, is the person's call.

import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { basename, dirname, join, relative, resolve } from "node:path";
import { argv, exit, pid } from "node:process";
import { pathToFileURL } from "node:url";
import * as gm from "./lib/gm.mjs";
import * as melody from "./lib/melody.mjs";
import { renderMidi, fingerprint, peakDb, writeFloatWav, level } from "./lib/render.mjs";
import { Score } from "./lib/score.mjs";
import * as theory from "./lib/theory.mjs";
import { gainCurve, loadTimeline } from "./lib/timeline.mjs";
import { SOUNDFONT } from "./fetch-soundfont.mjs";

// The level the score WAV is written at. With nothing else in the soundtrack it
// is the soundtrack, so it sits close to delivery; under a voice it is a bed,
// about 10 dB below speech. scripts/finish-video.mjs then sets the whole film
// to -14 LUFS either way.
const MUSIC_ONLY_LUFS = -16;
const UNDER_VOICE_LUFS = -24;

const args = argv.slice(2);
const scorePath = args.find((a, i) => !a.startsWith("--") && !args[i - 1]?.startsWith("--"));
const composition = args.includes("--composition") ? args[args.indexOf("--composition") + 1] : undefined;
if (!scorePath || !existsSync(scorePath)) {
  console.error("usage: node scripts/score/build.mjs <score.mjs> [--composition <Id>]");
  if (scorePath) console.error(`No file at ${scorePath}.`);
  exit(1);
}
if (!existsSync(SOUNDFONT)) {
  console.error(`No SoundFont at ${SOUNDFONT}. Fetch it once: node scripts/score/fetch-soundfont.mjs`);
  exit(1);
}

const mod = await import(pathToFileURL(resolve(scorePath)).href);
if (typeof mod.default !== "function" || !mod.timeline) {
  console.error(`${scorePath} must export \`timeline\` (a path) and a default function that returns a Score.`);
  exit(1);
}
const timeline = loadTimeline(mod.timeline);

// Where the outputs go. A score at content/<project>/music/score.mjs writes its
// WAV into public/assets/<project>/audio/, where the film's <Audio> finds it.
const project = basename(dirname(dirname(resolve(scorePath))));
const inContent = basename(dirname(resolve(scorePath))) === "music" && basename(dirname(dirname(dirname(resolve(scorePath))))) === "content";
const midiOut = mod.output?.midi ?? join(dirname(scorePath), "score.mid");
const wavOut = mod.output?.wav ?? (inContent ? join("public", "assets", project, "audio", "score.wav") : join(dirname(scorePath), "score.wav"));
const lufs = mod.underVoice ? UNDER_VOICE_LUFS : MUSIC_ONLY_LUFS;
// Previous WAVs are kept here. For a score outside content/, the folder the
// score file sits in names it (scripts/score/example -> out/example/).
const historyName = inContent ? project : basename(dirname(resolve(scorePath)));
const historyDir = join("out", historyName, "score-history");

// --- 1. The timeline against the composition -----------------------------
if (composition) {
  console.log("$ node node_modules/@remotion/cli/remotion-cli.js compositions");
  // Remotion's own entry file, run with node: no shell, the same on every platform.
  const list = spawnSync("node", ["node_modules/@remotion/cli/remotion-cli.js", "compositions"], { encoding: "utf8" });
  const row = `${list.stdout}`.split(/\r?\n/).find((l) => l.trim().split(/\s+/)[0] === composition);
  const m = row?.match(/^\s*\S+\s+(\d+(?:\.\d+)?)\s+\d+x\d+\s+(\d+)/);
  if (!m) {
    console.error(`No composition called "${composition}" in \`npx remotion compositions\`.`);
    exit(1);
  }
  const [, cFps, cFrames] = m.map(Number);
  if (cFps !== timeline.fps || cFrames !== timeline.total) {
    console.error(`The timeline is ${timeline.total} frames at ${timeline.fps} fps; ${composition} is ${cFrames} at ${cFps}. They must agree before a score can be in sync - make the composition read its lengths from ${timeline.path}.`);
    exit(1);
  }
  console.log(`${composition} and ${timeline.path} agree: ${timeline.total} frames at ${timeline.fps} fps.`);
}

// --- 2. The score, as MIDI ----------------------------------------------------
const score = await mod.default({ timeline, Score, theory, melody, gm });
if (!(score instanceof Score)) {
  console.error(`${scorePath}'s default function must return a Score.`);
  exit(1);
}
mkdirSync(dirname(midiOut), { recursive: true });
const midi = score.toMidi();
writeFileSync(midiOut, Buffer.from(midi));

// --- 3. Render ------------------------------------------------------------------
const started = Date.now();
// No ducks yet: they go on after the compressor, in level(), so it cannot flatten them.
const audio = await renderMidi({ midi, seconds: timeline.duration, soundfont: SOUNDFONT });
const took = ((Date.now() - started) / 1000).toFixed(1);

// --- 4. Level and write -------------------------------------------------------
mkdirSync(dirname(wavOut), { recursive: true });
let keptAs = null;
if (existsSync(wavOut)) {
  mkdirSync(historyDir, { recursive: true });
  // Local time, so the name matches the clock of the person who ran it.
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  const stamp = `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}_${p(d.getHours())}-${p(d.getMinutes())}-${p(d.getSeconds())}`;
  keptAs = join(historyDir, `score-${stamp}.wav`);
  copyFileSync(wavOut, keptAs);
}
const tmpDir = join("out", ".score-tmp");
mkdirSync(tmpDir, { recursive: true });
const raw = join(tmpDir, `${historyName}-${pid}-${Date.now()}.wav`);
let measured;
try {
  writeFloatWav(raw, audio);
  measured = level(raw, wavOut, lufs, gainCurve(timeline));
} finally {
  rmSync(raw, { force: true });
}

// --- 5. Report ---------------------------------------------------------------
const fmt = (s) => `${s.toFixed(2).padStart(6)} s`;
// Only hits are checked against the beat grid. A section, a duck edge or a
// silence follows the picture, so "off the grid" there is noise, not a fault.
const onGrid = (s) => {
  const b = score.beatAt(s);
  const near = Math.round(b);
  const offFrames = Math.abs(b - near) * (60 / score.bpm) * timeline.fps;
  return offFrames < 0.5 ? `beat ${near}` : `beat ${b.toFixed(2)} (${offFrames.toFixed(1)} frames off the grid)`;
};
const rows = [
  ...timeline.sections.map((s) => ({ frame: s.start, what: `section ${s.id} (${s.frames} frames)` })),
  ...Object.entries(timeline.hits).map(([h, f]) => ({ frame: f, what: `hit ${h}`, grid: true })),
  ...timeline.ducks.flatMap((d) => [
    { frame: d.from, what: `duck ${d.db} dB starts (until frame ${d.to})` },
    { frame: d.to, what: `duck ${d.db} dB ends` },
  ]),
  ...timeline.silences.flatMap((s) => [
    { frame: s.from, what: `silence starts (until frame ${s.to})` },
    { frame: s.to, what: "silence ends" },
  ]),
  ...score.cues.map((c) => ({ frame: Math.round(c.seconds * timeline.fps), what: `music: ${c.label}` })),
].sort((a, b) => a.frame - b.frame);

console.log(`\nCue table — ${timeline.path}, ${score.bpm} BPM, beat 0 at ${fmt(score.beatOneSeconds).trim()}`);
console.log("  (the beat column is filled for hits only)");
for (const r of rows) {
  const beat = r.grid ? onGrid(r.frame / timeline.fps) : "";
  console.log(`  frame ${String(r.frame).padStart(5)}  ${fmt(r.frame / timeline.fps)}  ${beat.padEnd(34)}  ${r.what}`);
}
console.log(`\nwritten:`);
console.log(`  ${relative(".", midiOut)} — the score, editable in MuseScore or any MIDI editor`);
console.log(`  ${relative(".", wavOut)} — ${timeline.duration.toFixed(3)} s (${timeline.total} frames), ${measured.lufs} LUFS, true peak ${measured.truePeak} dBTP`);
console.log(`  rendered in ${took} s; raw render (before compressor and ducks) peak ${peakDb(audio).toFixed(1)} dBFS; fingerprint ${fingerprint(audio)} (the same score always gives the same fingerprint)`);
if (keptAs) console.log(`  ${relative(".", keptAs)} — the WAV that was there before, kept`);
if (inContent) console.log(`\nIn the film: <Audio src={staticFile("assets/${project}/audio/score.wav")} /> at frame 0 of the master.`);
console.log("Whether it sounds right is for the person to say. Play it to them; do not describe it as good.\n");
