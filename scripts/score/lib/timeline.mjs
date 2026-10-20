// The film's timeline, for the score. The resolving itself lives in
// src/lib/timeline.mjs, which the film's scenes import too - one implementation,
// so picture and music cannot disagree about where a frame is. This file adds
// only what the music needs: reading the JSON from disk, the gain curve, and
// the tempos that keep a beat on a whole frame.

import { readFileSync } from "node:fs";
import { resolveTimeline } from "../../../src/lib/timeline.mjs";

export const loadTimeline = (path) => ({ ...resolveTimeline(JSON.parse(readFileSync(path, "utf8")), path), path });

/**
 * The gain the music gets at every moment: ducked under reading or speech,
 * silent where the film wants silence. Ramps are short so nothing clicks and
 * long enough that nothing pumps.
 */
export const gainCurve = (timeline, { rampFrames = 6 } = {}) => {
  const ramp = rampFrames / timeline.fps;
  const shape = (t, from, to) => {
    // 0 outside the range, 1 inside it, linear ramps leading in and out.
    if (t <= from - ramp || t >= to + ramp) return 0;
    if (t < from) return (t - (from - ramp)) / ramp;
    if (t > to) return (to + ramp - t) / ramp;
    return 1;
  };
  const ducks = timeline.ducks.map((d) => ({ from: d.from / timeline.fps, to: d.to / timeline.fps, db: d.db }));
  const silences = timeline.silences.map((s) => ({ from: s.from / timeline.fps, to: s.to / timeline.fps }));
  return (t) => {
    let gain = 1;
    for (const d of ducks) {
      const k = shape(t, d.from, d.to);
      if (k > 0) gain *= 10 ** ((d.db * k) / 20);
    }
    for (const s of silences) gain *= 1 - shape(t, s.from, s.to);
    return gain;
  };
};

/**
 * Tempos whose beat lands on a whole frame. When picture is cut to music, a
 * beat that falls between two frames lands a frame early or late at random
 * along the film; a tempo from this list never does.
 */
export const frameLockedTempos = (fps, { min = 60, max = 180 } = {}) => {
  const out = [];
  for (let framesPerBeat = 1; framesPerBeat <= fps * 2; framesPerBeat++) {
    const bpm = (fps * 60) / framesPerBeat;
    if (bpm >= min && bpm <= max) out.push({ bpm: Number(bpm.toFixed(3)), framesPerBeat });
  }
  return out.sort((a, b) => a.bpm - b.bpm);
};
