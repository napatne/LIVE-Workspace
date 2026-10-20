// An example score, to copy for a new film: a public-domain tune arranged for a
// small folk ensemble and timed to a 20-second timeline.
//
//   node scripts/score/build.mjs scripts/score/example/score.mjs
//
// For a real film, copy this file to content/<project>/music/score.mjs, point
// `timeline` at the film's own timeline.json, and replace the arrangement. The
// WAV then lands in public/assets/<project>/audio/score.wav.
//
// The shape to keep, whatever the music:
//   - the tune comes from a file a person can read (melody.abc), not from notes
//     typed into code
//   - every time is read from the timeline or the beat grid, never typed in
//   - every moment the music answers the picture gets a cue(), so the cue table
//     says why each one is there

// Paths are from the project root, where the build is run.
export const timeline = "scripts/score/example/timeline.json";
export const output = { midi: "out/score-example/score.mid", wav: "out/score-example/score.wav" };
// true when narration plays over the music: it is then levelled as a bed, well under the voice.
export const underVoice = false;

export default async ({ timeline, Score, theory, melody }) => {
  // 100 BPM puts every beat on a whole frame at 30 fps (18 frames a beat), so a
  // hit placed on the grid can never land a frame early or late.
  const score = new Score({ timeline, bpm: 100, beatOne: "theme", seed: 7, name: "example" });
  const tune = await melody.readMelody("scripts/score/example/melody.abc");
  const progression = theory.chords("D", "I V I V I"); // one chord a bar: D A D A D

  const pad = score.part("strings", { volume: 82, reverb: 70 });
  const harp = score.part("harp", { volume: 90, pan: 40, reverb: 60 });
  const flute = score.part("flute", { volume: 104, pan: 76, reverb: 50 });
  const guitar = score.part("nylon guitar", { volume: 88, pan: 48, reverb: 35 });
  const bass = score.part("acoustic bass", { volume: 96, reverb: 20 });
  const drums = score.drums({ volume: 74 });

  // Title: a held chord that swells in, and a harp figure on the title card.
  const title = score.time("title");
  pad.chord(theory.notes("D", 3), title, score.time("theme") - title + score.beats(1), 70);
  pad.swell(20, 100, title, score.time("title-card"));
  harp.pattern("xxxx", { start: score.time("title-card"), step: 0.25, pitches: theory.notes("Dmaj7", 4), velocity: 70 });
  score.cue(score.time("title-card"), "harp figure as the title lands");

  // Theme: the tune on flute, first phrase only - sixteen beats.
  flute.play(tune, score.bar(0), { to: 16, velocity: 92 });
  score.cue(score.bar(0), "the tune starts with the first cut into the theme");

  // Accompaniment: guitar picking the chord, bass on the root, light percussion.
  progression.forEach((symbol, bar) => {
    const start = score.bar(bar);
    guitar.pattern("x-xxx-xx", { start, step: 0.5, pitches: theory.voiceLead([symbol], { low: "D3", high: "A4" })[0], velocity: 64 });
    bass.pattern("x_x_", { start, step: 1, pitches: [theory.root(symbol, 2), theory.root(symbol, 2) + 7], velocity: 84 });
  });
  drums.pattern("tambourine", "-x-x", { start: score.bar(0), step: 1, repeat: 5, velocity: 52 });
  drums.pattern("kick", "x---", { start: score.bar(0), step: 1, repeat: 5, velocity: 66 });

  // The turn: a soft cymbal and pizzicato joining, on the hit.
  drums.hit("crash", score.time("turn"), 58);
  score.part("pizzicato strings", { volume: 80, pan: 90 }).pattern("x-x-x-x-", {
    start: score.time("turn"), step: 0.5, repeat: 2, pitches: theory.scale("D major", "D4", "D5"), velocity: 70,
  });
  score.cue(score.time("turn"), "cymbal and pizzicato on the turn");

  // Close: the home chord, and a button on the last hit.
  const close = score.time("close");
  pad.chord(theory.notes("D", 3), close, timeline.duration - close, 76);
  pad.swell(100, 40, score.time("button"), timeline.duration);
  drums.hit("crash", score.time("button"), 70);
  score.part("timpani", { volume: 96 }).note("D2", score.time("button"), 1.5, 96);
  harp.chord(theory.notes("D", 4), score.time("button"), 2, 80);
  score.cue(score.time("button"), "timpani, crash and harp: the button");

  return score;
};
