// Chords, scales and voicings, on tonal (MIT) - so a score is written in the
// words a musician uses ("I V vi IV in D") and the right notes come out.
//
// One trap, and the reason chords() exists: tonal's own
// Progression.fromRomanNumerals("D", ["vi"]) returns "B", a major chord - lower
// case does not make a numeral minor there. chords() reads each numeral as a
// scale degree and takes the chord the key itself builds on it, so "vi" in D is
// Bm, as anyone reading the score would expect.

import { Chord, Key, Note, Scale } from "tonal";

const DEGREES = { i: 0, ii: 1, iii: 2, iv: 3, v: 4, vi: 5, vii: 6 };

/** "D4" → 62. Numbers pass through. */
export const midi = (note) => (typeof note === "number" ? note : Note.midi(note));

/** 62 → "D4". */
export const name = (number) => Note.fromMidiSharps(number);

/**
 * Chord symbols for a key: chords("D", "I V vi IV") → ["D", "A", "Bm", "G"].
 * Add 7 for the key's seventh chord on that degree: "ii7 V7 I".
 * A minor key takes "Bm" or "B minor".
 */
export const chords = (key, numerals) => {
  const minor = /m$|minor$/i.test(key.trim()) && !/maj/i.test(key);
  const tonic = key.replace(/\s*(minor|major|m)$/i, "").trim();
  const k = minor ? Key.minorKey(tonic).natural : Key.majorKey(tonic);
  const list = Array.isArray(numerals) ? numerals : numerals.trim().split(/\s+/);
  return list.map((numeral) => {
    const m = numeral.match(/^(vii|iii|vi|iv|ii|v|i)(7?)$/i);
    if (!m) return numeral; // already a chord symbol, e.g. "Gsus4"
    const degree = DEGREES[m[1].toLowerCase()];
    return m[2] ? k.chords[degree] : k.triads[degree];
  });
};

/** The notes of a scale as MIDI numbers across a range: scale("D major", "D4", "D5"). */
export const scale = (scaleName, low, high) => {
  const pcs = Scale.get(scaleName).notes.map((n) => Note.chroma(n));
  const out = [];
  for (let n = midi(low); n <= midi(high); n++) if (pcs.includes(n % 12)) out.push(n);
  return out;
};

/** A chord's notes, stacked upward from its root in the given octave: notes("Bm", 3). */
export const notes = (symbol, octave = 4) => {
  const c = Chord.get(symbol);
  if (c.empty) throw new Error(`"${symbol}" is not a chord tonal knows.`);
  let last = -Infinity;
  return c.notes.map((pc) => {
    let n = Note.midi(`${pc}${octave}`);
    while (n <= last) n += 12;
    last = n;
    return n;
  });
};

/** The chord's root as a MIDI number in the given octave: root("Bm", 2) → 47. */
export const root = (symbol, octave = 2) => Note.midi(`${Chord.get(symbol).tonic}${octave}`);

/**
 * Voice a progression so each chord moves as little as possible from the last -
 * the way a player's hand would - inside a range. Returns arrays of MIDI notes.
 */
export const voiceLead = (symbols, { low = "A3", high = "E5", voices = 3 } = {}) => {
  const lo = midi(low);
  const hi = midi(high);
  const candidates = (symbol) => {
    const pcs = Chord.get(symbol).notes.map((n) => Note.chroma(n));
    const pool = [];
    for (let n = lo; n <= hi; n++) if (pcs.includes(n % 12)) pool.push(n);
    // Every run of `voices` consecutive chord tones in range is one voicing.
    const out = [];
    for (let i = 0; i + voices <= pool.length; i++) out.push(pool.slice(i, i + voices));
    return out.length ? out : [pool];
  };
  const cost = (a, b) => a.reduce((sum, n, i) => sum + Math.abs(n - (b[i] ?? n)), 0);
  const result = [];
  for (const symbol of symbols) {
    const options = candidates(symbol);
    const previous = result[result.length - 1];
    const centre = (lo + hi) / 2;
    result.push(
      previous
        ? options.reduce((best, o) => (cost(o, previous) < cost(best, previous) ? o : best))
        : options.reduce((best, o) => (Math.abs(o[1] - centre) < Math.abs(best[1] - centre) ? o : best)),
    );
  }
  return result;
};
