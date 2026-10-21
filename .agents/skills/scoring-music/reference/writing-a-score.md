# Writing a score

**For the assistant.** The timeline file, the score file, and the tools between them.

## Contents

- [The timeline file](#the-timeline-file)
- [How the film reads it](#how-the-film-reads-it)
- [The score file](#the-score-file)
- [The API](#the-api)
- [Bringing in a tune](#bringing-in-a-tune)
- [Where public-domain tunes come from](#where-public-domain-tunes-come-from)
- [Cutting picture to music](#cutting-picture-to-music)
- [Sound effects](#sound-effects)

## The timeline file

`src/<film>/timeline.json` — beside the film's code, because the scenes import it.

| Field | What it is |
| --- | --- |
| `fps` | The film's frame rate |
| `sections` | In order: `{ "id", "frames" }`. Usually one per scene |
| `transitions` | `{ "after": "<section id>", "frames" }` — overlaps the two sections it joins, as `TransitionSeries` does |
| `hits` | Named moments the music answers: `{ "turn": "theme+144" }` |
| `ducks` | `{ "from", "to", "db" }` — the music lowered by `db` (default −10) across the range |
| `silences` | `{ "from", "to" }` — the music out entirely |

**Positions** are a frame number, or a name and an optional offset in frames:

- `"theme"` — where the section starts; `"theme.end"` — one past its last frame, which is where the
  next section starts when there is no transition
- `"turn"` — a hit; hits may be written in terms of sections or other hits
- `"theme+144"`, `"turn-12"`, `"turn - 12"` — offsets in frames
- `"end"` — one past the last frame of the film: the frame count. A duck or silence can run to it;
  a hit cannot sit on it

**Naming sections and hits.** An id is letters, digits, `_` and `-`. Two rules keep a name apart
from an offset, and the resolver refuses a timeline that breaks either — in the scenes, in
`npm run score`, and in the render:

- **Nothing is called `end`.** That name already means the end of the film. Call an end card
  `end-card` or `outro`.
- **No id ends in `-<digits>`.** A trailing `-12` is always read as an offset, so a section called
  `when-1` could never be named in a position. Write `when1` or `when-n1`. A hyphen inside a name is
  fine: `title-card`.

It also refuses two sections with one id, a hit with a section's id, a transition after an unknown
section or after the last one, a hit outside frames `0` to `total - 1`, and a duck or silence outside
`0` to `total` or with its `from` after its `to`. Each message says what to change.

**Ducks and silences ramp outside their range.** The music moves over 6 frames *before* `from` and
6 frames *after* `to`, so that nothing clicks. A duck written from the frame the text arrives is
already falling 6 frames earlier; a silence that ends on a hit is still coming back for 6 frames
after it, so the hit lands quiet. To have the music full on a hit, end the silence 6 frames before
it (`"turn-6"`). To have it fully down when the words arrive, start the duck where they arrive.

A section's length in the timeline **is** the scene's length. Change it there, and both the scene
and the score move.

## How the film reads it

```tsx
import timelineJson from "./timeline.json";
import { resolveTimeline } from "../lib/timeline.mjs";

export const TIMELINE = resolveTimeline(timelineJson);
export const FILM_FRAMES = TIMELINE.total; // for <Composition durationInFrames>

// In the master:
<TransitionSeries>
  <TransitionSeries.Sequence durationInFrames={TIMELINE.frames("title")}>
    <Title />
  </TransitionSeries.Sequence>
  <TransitionSeries.Transition
    presentation={fade()}
    timing={linearTiming({ durationInFrames: TIMELINE.transitionFrames("title") })}
  />
  …
</TransitionSeries>
<Audio src={staticFile("assets/<project>/audio/score.wav")} />

// In a scene that counts from its own frame 0, a hit as a local frame:
const TURN = TIMELINE.local("turn", "theme"); // 144
```

Adjust the import path to where the film lives. `src/lib/timeline.mjs` has types beside it
(`timeline.d.mts`), so TypeScript checks every call.

## The score file

`content/<project>/music/score.mjs`. It exports three things:

```js
export const timeline = "src/<film>/timeline.json"; // from the project root
export const underVoice = false;                     // true if narration plays over it
export default async ({ timeline, Score, theory, melody, gm }) => {
  const score = new Score({ timeline, bpm: 100, beatOne: "theme", seed: 7 });
  // … parts and notes …
  return score;
};
```

Optionally `export const output = { midi, wav }` to write somewhere other than the defaults —
`score.mid` beside the score file, and `public/assets/<project>/audio/score.wav`.

Build: `npm run score -- content/<project>/music/score.mjs --composition <FilmId>`.

## The API

**Time.** Everything is in seconds, and every number comes from the timeline or the beat grid:

| Call | Gives |
| --- | --- |
| `score.time("turn")`, `score.time("theme", 2)` | A timeline position, plus optional beats after it |
| `score.beat(8)` | Beat 8 of the grid (beat 0 is `beatOne`) |
| `score.bar(2)`, `score.bar(2, 3)` | Bar 2 (0-based), plus a beat within it |
| `score.beats(4)` | The length of 4 beats |
| `timeline.duration` | The film's length |

**Parts.** `score.part(instrument, { volume, pan, reverb, chorus })` — an instrument by its General
MIDI name (`"flute"`, `"nylon guitar"`, `"acoustic bass"`, `"strings"`, `"harp"`, `"marimba"` …;
the full list is `scripts/score/lib/gm.mjs`, synth leads and pads included), or by its 0-based
General MIDI program number (`score.part(81, …)`). `score.drums()` is the percussion part.

| Call | Does |
| --- | --- |
| `part.note(pitch, start, duration, velocity)` | One note. Pitch is `62` or `"D4"` |
| `part.chord(pitches, start, duration, velocity)` | Several at once |
| `part.play(tune, start, { transpose, from, to, velocity })` | A tune from `melody`, at the score's tempo; `from`/`to` slice it in beats |
| `part.pattern("x-x_", { start, step, repeat, pitches, velocity })` | A rhythm as text: `x` note, `X` accent, `-` rest, `_` hold. `pitches` cycles, or is a function |
| `part.swell(from, to, start, end)` | A crescendo or fade on expression (0–127) |
| `part.cc("reverb", 80, start)` | A controller change |
| `drums.hit("crash", start, velocity)` | One drum. Names in `gm.mjs` → `DRUMS` |
| `drums.pattern("kick", "x---", { start, step, repeat })` | A drum rhythm |
| `score.cue(seconds, "why")` | A line in the printed cue table. Add one for every moment that answers the picture |

**Theory** (`theory`, on `tonal`):

| Call | Gives |
| --- | --- |
| `theory.chords("D", "I V vi IV")` | `["D", "A", "Bm", "G"]` — numerals read as the key's own chords; add `7` for sevenths |
| `theory.notes("Bm", 3)` | The chord's notes from its root in octave 3 |
| `theory.root("Bm", 2)` | The root alone, for a bass line |
| `theory.voiceLead(["D", "A", "Bm", "G"], { low, high })` | Voicings that move as little as possible between chords |
| `theory.scale("D major", "D4", "D5")` | The scale's notes in a range |

`tonal`'s own `Progression.fromRomanNumerals` returns `B`, not `Bm`, for `vi` in D. Use
`theory.chords`.

## Bringing in a tune

`await melody.readMelody("content/<project>/music/tune.abc")` — or a `.mid` file. The result is a
list of notes in **beats**, played at whatever tempo the score sets.

- **ABC** is plain text, and the easiest thing for a person to give you: a tune's notes as letters.
  A few lines is a whole melody:

  ```text
  X:1
  T:Ode to Joy
  M:4/4
  L:1/4
  K:D
  FFGA|AGFE|DDEF|F>E E2|
  ```

  Chord symbols in it are ignored; the score supplies the harmony.
- **MIDI** is what MuseScore, GarageBand and every notation app export. Someone who can play or
  write music can make one in minutes.
- **Notes or a description, not a recording.** You cannot hear or transcribe audio here, so a hummed
  recording is no use to you. Ask for the notes — letter names, a MIDI file, a photo of written
  music typed out — or for a description close enough to write from, and play back what you wrote
  for them to correct.

Whatever the form, **whose tune it is, is their call**: one they wrote or one out of copyright is
free to use; a song they name from a record belongs to someone, so flag that once and let them
decide (`AGENTS.md` → *Rights are the person's call*). Where to find tunes that are free is below.

## Where public-domain tunes come from

Old is not the same as free. **For a tune to be free to use, it must be out of copyright, and so
must the edition you take it from.** A traditional melody is free; a modern arrangement of it, or a modern publisher's
transcription, may not be.

| Source | Status, checked 2026-10-19 |
| --- | --- |
| A composer who died long ago (Beethoven, Mozart, Bach), written out by you or the person | Free |
| OpenScore Lieder and String Quartets | CC0 — free, exportable as MIDI |
| Mutopia Project | Each piece marked Public Domain, CC BY or CC BY-SA — take only those marked Public Domain, or credit as asked |
| **The Session** (thesession.org) | **Do not use.** Its data licence forbids processing it with language-model tools |
| Nottingham Music Database | No licence statement found — do not use |

Say where a tune came from in the brief, and on the end card if its licence asks.

## Cutting picture to music

The default is picture first. When the person wants the picture cut *to* a piece instead — a music
video, a montage on the beat:

1. Choose the tempo first, from `frameLockedTempos(fps)` in `scripts/score/lib/timeline.mjs`, so
   every beat is a whole frame.
2. Set each section's `frames` to a whole number of bars: at 100 BPM and 30 fps a bar of four is
   72 frames.
3. Build the score, read the cue table, and cut the scenes to the bars it lists.

## Sound effects

General MIDI has a percussion kit and a handful of effects (`"applause"`, `"birds"`, `"seashore"`,
`"breath noise"`, `"reverse cymbal"`). For a hit on a structural moment, a drum from the kit — a
crash, a timpani, a woodblock — is usually enough, and stays in the score where its timing is
checked.

**An effect that swells peaks long after its note starts.** A reverse cymbal is quiet at its note-on
and loudest at the end of its sweep, so a note written on the hit peaks well after it. Render it once,
measure where the peak lands relative to the note-on (the loudest point in `score.wav` near the hit),
and start the note that much earlier. Write the measured lead into the score as a named constant
with a comment, so the next change keeps it. The cue table shows note-ons, not peaks.

Foley — paper, footsteps, a door — needs recorded sounds. Use only recordings the person supplies or
ones under CC0, put them in `content/<project>/intake/`, and condition them — trim, fade, level —
with:

```console
node scripts/build-audio.mjs --cues content/<project>/audio-cues.json --src content/<project>/intake --out public/assets/<project>/audio
```

All three flags are required; with none it prints its usage. It checks the cue list before running
FFmpeg. Place each conditioned file with `<Audio>` at its hit frame (`TIMELINE.hits.<name>`).
