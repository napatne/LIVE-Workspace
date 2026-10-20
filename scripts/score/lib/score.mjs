// A score, written against the film's timeline, that comes out as a standard
// MIDI file.
//
// MIDI on purpose: it is the one format every music tool reads. The same file
// renders here through a General MIDI SoundFont, and opens in MuseScore (free)
// for a person to read, fix or rewrite a line by hand - which matters, because
// the person may be a better composer than the assistant.
//
// Times are seconds. Get them from the timeline (score.time("theme+30")) or
// from the beat grid (score.beat(8), score.bar(2)), never typed as bare
// numbers - a bare number is a cue that stays put when the picture moves.
//
//   const score = new Score({ timeline, bpm: 90, beatOne: "theme" });
//   const flute = score.part("flute", { pan: 44, reverb: 50 });
//   flute.play(tune, score.bar(0));
//   score.drums().pattern("kick", "x---x---", { start: score.bar(0), step: 0.5, repeat: 4 });

import { MIDIBuilder } from "spessasynth_core";
import { drumKey, program } from "./gm.mjs";
import { midi as toMidi } from "./theory.mjs";

const TPQ = 480;
const CC = { volume: 7, pan: 10, expression: 11, reverb: 91, chorus: 93 };

// Small, seeded and dependable: the same seed writes the same score, so a
// re-run is a byte-identical file and any difference is a real change.
const mulberry32 = (seed) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

class Part {
  constructor(score, label, channel, settings) {
    this.score = score;
    this.label = label;
    this.channel = channel;
    this.events = [];
    this.settings = settings;
  }

  /** One note. `pitch` is a MIDI number or a name like "D5". */
  note(pitch, start, duration, velocity = 80) {
    const end = Math.min(start + duration, this.score.length);
    if (start >= this.score.length || end <= start) return this;
    const v = Math.max(1, Math.min(127, Math.round(velocity + (this.score.random() - 0.5) * this.score.humanize)));
    this.events.push({ kind: "note", pitch: toMidi(pitch), start, end, velocity: v });
    return this;
  }

  /** Several notes struck together. */
  chord(pitches, start, duration, velocity = 70) {
    for (const p of pitches) this.note(p, start, duration, velocity);
    return this;
  }

  /**
   * A melody from lib/melody.mjs, placed at `start` and played at the score's
   * tempo. `from`/`to` take a slice of it, in the tune's own beats.
   */
  play(melody, start, { transpose = 0, velocity, legato = 0.95, from = 0, to = Infinity } = {}) {
    for (const n of melody.notes) {
      if (n.beat < from || n.beat >= to) continue;
      this.note(
        n.pitch + transpose,
        start + this.score.beats(n.beat - from),
        this.score.beats(n.beats) * legato,
        velocity ?? n.velocity,
      );
    }
    return this;
  }

  /**
   * A rhythm written as text, one character per step:
   *   x  a note        X  an accented note
   *   -  a rest        _  hold the previous note one more step
   * `pitches` is one pitch, a list cycled hit by hit, or a function of the hit
   * number. `step` is in beats (0.5 = eighth notes in 4/4).
   */
  pattern(rhythm, { start, step = 0.5, repeat = 1, pitches, velocity = 80, accent = 20 }) {
    const steps = rhythm.replace(/\s+/g, "");
    let hit = 0;
    for (let r = 0; r < repeat; r++) {
      for (let i = 0; i < steps.length; i++) {
        const c = steps[i];
        if (c !== "x" && c !== "X") continue;
        let held = 1;
        while (steps[i + held] === "_") held++;
        const pitch = typeof pitches === "function" ? pitches(hit, r) : Array.isArray(pitches) ? pitches[hit % pitches.length] : pitches;
        const at = start + this.score.beats((r * steps.length + i) * step);
        const list = Array.isArray(pitch) ? pitch : [pitch];
        for (const p of list) this.note(p, at, this.score.beats(held * step) * 0.95, velocity + (c === "X" ? accent : 0));
        hit++;
      }
    }
    return this;
  }

  /** A controller change - expression (swells), volume, pan, reverb, chorus, or a raw number. */
  cc(controller, value, start) {
    this.events.push({ kind: "cc", controller: CC[controller] ?? controller, value: Math.round(value), start });
    return this;
  }

  /** A swell or fade on expression (0–127) from `start` to `end`, in small steps. */
  swell(from, to, start, end, steps = 16) {
    for (let i = 0; i <= steps; i++) this.cc("expression", from + ((to - from) * i) / steps, start + ((end - start) * i) / steps);
    return this;
  }
}

class DrumPart extends Part {
  hit(drum, start, velocity = 90) {
    return this.note(drumKey(drum), start, 0.1, velocity);
  }
  pattern(drum, rhythm, options) {
    return super.pattern(rhythm, { ...options, pitches: drumKey(drum) });
  }
}

export class Score {
  /**
   * @param timeline  from lib/timeline.mjs
   * @param bpm       the tempo. lib/timeline.mjs → frameLockedTempos() lists
   *                  the ones whose beat lands on a whole frame
   * @param beatOne   the timeline position where beat 0 sits: the first cut, the
   *                  first clap, the title. Everything on the beat grid counts from here
   * @param meter     beats per bar
   * @param humanize  random velocity spread, in MIDI steps (0 = machine-exact)
   */
  constructor({ timeline, bpm, beatOne = 0, meter = 4, seed = 1, humanize = 6, name = "score" }) {
    if (!timeline) throw new Error("A score needs the film's timeline.");
    if (!bpm) throw new Error("A score needs a tempo (bpm).");
    this.timeline = timeline;
    this.bpm = bpm;
    this.meter = meter;
    this.name = name;
    this.humanize = humanize;
    this.random = mulberry32(seed);
    this.length = timeline.duration;
    this.beatOneSeconds = timeline.seconds(beatOne);
    this.parts = [];
    this.cues = [];
    this.nextChannel = 0;
  }

  /** Seconds for a timeline position, plus an optional number of beats after it. */
  time(position, beats = 0) {
    return this.timeline.seconds(position) + this.beats(beats);
  }
  /** Seconds for beat n of the grid (beat 0 = beatOne). */
  beat(n) {
    return this.beatOneSeconds + this.beats(n);
  }
  /** Seconds for bar n (0-based), plus a beat within it. */
  bar(n, beatInBar = 0) {
    return this.beat(n * this.meter + beatInBar);
  }
  /** A length of n beats, in seconds. */
  beats(n) {
    return (n * 60) / this.bpm;
  }
  /** Where a moment falls on the beat grid - for the cue table. */
  beatAt(seconds) {
    return ((seconds - this.beatOneSeconds) * this.bpm) / 60;
  }

  /** A named instrument on its own channel. Settings: volume, pan (0 left – 127 right), reverb, chorus (0–127). */
  part(instrument, { label = instrument, volume = 100, pan = 64, reverb = 40, chorus = 0 } = {}) {
    if (this.nextChannel === 9) this.nextChannel++; // channel 10 is percussion
    if (this.nextChannel > 15) throw new Error("A General MIDI score has 15 melodic channels; this one is full.");
    const p = new Part(this, label, this.nextChannel++, { program: program(instrument), volume, pan, reverb, chorus });
    this.parts.push(p);
    return p;
  }

  /** The percussion part (General MIDI channel 10). One per score. */
  drums({ volume = 100, pan = 64, reverb = 30 } = {}) {
    if (!this.drumPart) {
      this.drumPart = new DrumPart(this, "drums", 9, { program: 0, volume, pan, reverb, chorus: 0 });
      this.parts.push(this.drumPart);
    }
    return this.drumPart;
  }

  /** A line in the printed cue table: what the music does at this moment, and why. */
  cue(seconds, label) {
    this.cues.push({ seconds, label });
    return this;
  }

  /** The score as a standard MIDI file (format 1, one track per part). */
  toMidi() {
    const mid = new MIDIBuilder({ name: this.name, timeDivision: TPQ, initialTempo: this.bpm, format: 1 });
    const ticks = (s) => Math.max(0, Math.round(((s * this.bpm) / 60) * TPQ));
    this.parts.forEach((part, i) => {
      const track = i + 1; // track 0 is the tempo track
      mid.addTrack(part.label);
      const { program: prog, volume, pan, reverb, chorus } = part.settings;
      if (part.channel !== 9) mid.programChange(0, track, part.channel, prog);
      mid.controllerChange(0, track, part.channel, CC.volume, volume);
      mid.controllerChange(0, track, part.channel, CC.pan, pan);
      mid.controllerChange(0, track, part.channel, CC.reverb, reverb);
      mid.controllerChange(0, track, part.channel, CC.chorus, chorus);
      mid.controllerChange(0, track, part.channel, CC.expression, 127);
      const sorted = [...part.events].sort((a, b) => a.start - b.start);
      for (const e of sorted) {
        if (e.kind === "cc") mid.controllerChange(ticks(e.start), track, part.channel, e.controller, e.value);
        else {
          mid.noteOn(ticks(e.start), track, part.channel, e.pitch, e.velocity);
          mid.noteOff(ticks(e.end), track, part.channel, e.pitch);
        }
      }
    });
    mid.flush();
    return mid.writeMIDI();
  }
}
