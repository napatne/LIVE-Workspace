// Bring in a tune a person wrote, rather than one an assistant invented.
//
// An assistant arranges far better than it composes: the sound and the timing
// come out right, the tune comes out plain. So the strongest route to music
// here is a real melody - hummed and written down, picked from the public
// domain, or written in MuseScore - arranged and timed by the score.
//
// Two ways in:
//   - ABC notation (.abc, or a string): plain text, the format most folk and
//     traditional tunes are shared in. Read with abcjs (MIT), headless.
//   - A MIDI file (.mid): what MuseScore, GarageBand or any notation app
//     exports. Read with spessasynth_core.
//
// Either way the result is a list of notes measured in BEATS, not seconds, so
// the score can play it at whatever tempo the film needs.

import { readFileSync } from "node:fs";
import { extname } from "node:path";
import { BasicMIDI } from "spessasynth_core";

const toBeats = (midiBytes, sourceLabel) => {
  const mid = BasicMIDI.fromArrayBuffer(midiBytes);
  // Beats come from the file's own tick map, not from one tempo: a file that
  // declares a default tempo and then its real one (abcjs writes both) would
  // otherwise be read a fifth too fast or too slow.
  const beatAt = (seconds) => mid.secondsToMIDITicks(seconds) / mid.timeDivision;
  // One array per track; keep every track that has notes, melody first.
  const voices = mid
    .getNoteTimes()
    .filter((track) => track.length)
    .map((track) =>
      track.map((n) => {
        const beat = beatAt(n.start);
        return {
          pitch: n.midiNote,
          beat: Math.round(beat * 1000) / 1000,
          beats: Math.round((beatAt(n.start + n.length) - beat) * 1000) / 1000,
          velocity: n.velocity,
        };
      }),
    );
  if (!voices.length) throw new Error(`${sourceLabel}: no notes found.`);
  const notes = voices[0];
  const last = notes[notes.length - 1];
  return { notes, voices, length: last.beat + last.beats };
};

/** A melody from ABC text. Chord symbols in the tune are ignored: the score supplies the harmony. */
export const fromAbc = async (abcText, label = "ABC tune") => {
  const abcjs = (await import("abcjs")).default;
  const [tune] = abcjs.parseOnly(abcText);
  if (!tune || !tune.lines?.length) throw new Error(`${label}: abcjs could not read any music in it.`);
  const out = abcjs.synth.getMidiFile(abcText, { midiOutputType: "binary", chordsOff: true });
  const bytes = Array.isArray(out) ? out[0] : out;
  return toBeats(new Uint8Array(bytes).buffer, label);
};

/** A melody from a .abc or .mid file. */
export const readMelody = async (path) => {
  const ext = extname(path).toLowerCase();
  if (ext === ".abc") return fromAbc(readFileSync(path, "utf8"), path);
  if (ext === ".mid" || ext === ".midi") return toBeats(new Uint8Array(readFileSync(path)).buffer, path);
  throw new Error(`${path}: a melody must be .abc or .mid.`);
};
