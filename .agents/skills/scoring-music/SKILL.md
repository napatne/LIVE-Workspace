---
name: scoring-music
description: Writes and renders a film's music - an original score on real sampled instruments, or a tune the person brings, arranged and timed to the picture's own timeline, ducked under speech and reading, and levelled for delivery - plus sound effects on structural moments. Use when a video needs music, someone names a mood, a song or a style of music, music and picture have drifted out of sync, the music is too loud, too quiet or "silly", or someone asks what music this can make or whether they can use a track they found.
---

# Scoring music

**Use this when** the interview settled that the film has music (`building-a-video` →
`reference/interview.md` step 3b), or music is being added or changed.

**You need first** the story approved in words, the film's scenes with their lengths, those lengths
in a timeline file the film reads (below), and the style card's sound section
(`choosing-a-visual-style`). Narration, if there is any, generated and measured first.

**This produces** `score.mid` — the score, editable by hand in MuseScore — and
`public/assets/<project>/audio/score.wav`, which the film plays from frame 0, plus a cue table that
says where every hit falls.

**Then go to** `viewing-and-rendering` to render, measure and finish the film.

---

## What this makes, said plainly

Music here is made in code, on this machine, for nothing: real sampled instruments from a free
General MIDI SoundFont, rendered offline, landing on the picture to the frame. **The sound comes
out clean and the timing exact. The tune comes out plain.** An assistant is a better arranger than a
composer — one director's verdict on a score made this way was *"you are producing nice sounds but
you are musically challenged"*, and it was fair.

So the strongest route is always **a real tune, arranged here**: one the person hums and writes
down, picks from the public domain, or writes in MuseScore. Say that the first time music comes up,
once, and offer it. Then do whichever they choose.

**You cannot hear the result, and they can.** Everything that can be measured — sync, length,
level, silence, peaks — you measure. Whether it is good, too busy, too sad or silly is theirs, and
you never describe your own music as good, fitting or effective.

## The decisions in it

Each one is theirs, or yours said out loud and written into the brief
(`building-a-video` → `reference/decisions.md`):

| Decision | Default if they have no view |
| --- | --- |
| **Whether** — score, their track, none | Asked in the interview, step 3b |
| **Feel and instruments** | The style card's sound section; otherwise chosen from the story's mood and named in one line |
| **The tune** | Theirs if offered; a public-domain melody they agree to; otherwise an original kept short and simple, and called an assistant's tune |
| **Music first or picture first** | Picture first — the score is fitted to the cut |
| **Sound effects** | Only on structural moments: a cut, a landing, a reveal |
| **Under a voice** | If there is narration, the score is a bed, well under it |

## Once per machine: the instruments

```console
npm run soundfont
```

Downloads GeneralUser GS (32 MB) into `vendor/soundfonts/`, checked against a pinned hash and kept
out of Git. Its licence allows any use, commercial included, with no credit needed on the music.

## The timeline: one file both sides read

A film with music keeps its timing in **one JSON file** — sections and their lengths, the
transitions between them, the named hits the music answers, the stretches where it ducks under
reading or speech, and the silences. The film's scenes read their lengths from it; the score reads
where everything falls from it. **The same resolver, `src/lib/timeline.mjs`, serves both**, so the
picture and the music cannot disagree about where a frame is. Typed twice, they drift, and the music
lands a beat late on every cut after the first change.

```json
{
  "fps": 30,
  "sections":    [{ "id": "title", "frames": 120 }, { "id": "theme", "frames": 360 }],
  "transitions": [{ "after": "title", "frames": 15 }],
  "hits":     { "turn": "theme+144" },
  "ducks":    [{ "from": "theme+216", "to": "theme+288", "db": -10 }],
  "silences": [{ "from": "theme.end-12", "to": "theme.end" }]
}
```

Where to put it, how the scenes read it, and the position grammar (`"theme+144"`, `"turn"`,
`"theme.end"`) are in [`reference/writing-a-score.md`](reference/writing-a-score.md).

**Duck under every line a viewer has to read, not only under speech.** On a film with no voice, the
music is the only thing competing with the words on screen.

## The score file

One small module per film, `content/<project>/music/score.mjs`. **Start by copying
`scripts/score/example/`** — a timeline, a public-domain tune in ABC, and an arrangement for a small
folk ensemble — and change it, rather than writing from nothing. The API is in
[`reference/writing-a-score.md`](reference/writing-a-score.md).

## How to arrange, from what has gone wrong

- **One continuous score per film.** Separate cues starting and stopping at every scene boundary
  were called *choppy*; one piece running under the whole film, shaped by the timeline, was not.
- **Answer the structure, not every word.** A hit on every line of text, rising runs and ta-da stabs
  were heard as *silly*. Mark the cuts, the turn and the ending; let the rest play.
- **A real ensemble, not one timbre.** A score where everything was a synth tone was *"all synth
  type"*; the director wanted *"percussion, air, whistles, bass… as needed"*. Pick a family from the
  style card's sound section and give it a low end, a middle and a top.
- **Anchor beat one on a picture event** — the first cut, a clap, the title — and choose a tempo
  whose beat lands on a whole frame (`frameLockedTempos(fps)` lists them; at 30 fps, 90, 100 and 120
  BPM are 20, 18 and 15 frames a beat). The cue table then shows any hit that is off the grid.
- **Silence is a tool.** A held breath before a reveal, the music dropping out for a joke. Write it
  into the timeline as a silence, not as missing notes.
- **Fixed seed.** The same score file always renders the same audio — the build prints a
  fingerprint — so a difference between two renders is always a real change.

## Build it

```console
npm run score -- content/<project>/music/score.mjs --composition <FilmId>
```

It refuses if the timeline and the composition disagree on length, then writes `score.mid` and
`score.wav`, and prints the cue table: every section, hit, duck, silence and music cue, with its
frame, its time, and its place on the beat grid. **Read the table before anyone listens** — a hit
three frames off the grid is visible there and nearly invisible by ear.

Then in the film's master, once, at frame 0:

```tsx
<Audio src={staticFile("assets/<project>/audio/score.wav")} />
```

No `volume` prop. The level is set by the build, and the whole film's loudness by finishing.

## Under a voice

Set `export const underVoice = true` in the score file. The score is then levelled as a bed,
about 10 dB under speech, and every narrated stretch should be a duck in the timeline — taken from
the narration timings `adding-narration` measured, not estimated.

## Hand it over, and take notes

Render the film, run `scripts/check-render.mjs` on it, finish it with `scripts/finish-video.mjs`
(one delivery level, −14 LUFS), then **play it to them and ask what they think.** Report only what
was measured.

Their notes, and what each one usually means:

- **"Too loud" or "too quiet"** — the whole film: change the finishing constant, not the mix. Under
  the words only: deepen the ducks.
- **"Silly", "cheesy", "busy"** — the character, not the level. Fewer hits, fewer notes, simpler
  parts. Making it quieter does not fix it.
- **"Choppy"** — it stops and starts. Join it into one continuous piece.
- **The tune itself, twice** — stop rewriting it. Ask for a melody, a reference piece or a
  public-domain tune, and arrange that. A third rewrite of an assistant's tune is the same tune.

**Checking audio you cannot hear:** compare, never judge in the absolute. Against the previous
render, against the timeline, against a reference they named. "Louder than v2 by 3 LU" is a fact;
"well balanced" is a guess dressed as one.

## Their own track, or a song they found

A file they made, licensed, or took from a library that permits it goes in
`content/<project>/intake/`; place it with `<Audio>` the same way and let finishing set the level.
**A song from YouTube or a streaming service cannot be used, however it is asked for** — offer an
original in that feel instead.

## Credits

GeneralUser GS needs no credit. Any other SoundFont or sample pack: read its licence before using
it, and put the credit line it requires on the end card. CC BY sample packs require one; two
versions of one film used a CC BY piano with no credit line, and could not be published as they
were.

## Reference

- [`reference/writing-a-score.md`](reference/writing-a-score.md) — the timeline in full, how the
  film reads it, the score API, bringing in a tune, music-first cutting, and public-domain sources.
- `scripts/score/example/` — a complete worked score to copy.
- `scripts/score/build.mjs`, `scripts/score/lib/` — the tool. Each file says what it is for.

## Versions and measurements

*Dated 2026-10-19, on Windows 11, Node 24.*

- `spessasynth_core` 4.3.22 (Apache-2.0) renders; `tonal` 6.4.3 (MIT) for theory; `abcjs` 6.7.1
  (MIT) reads ABC. **`tonal` 6.5.0 and 6.5.1 do not load in Node** — their `main` points at a file
  the package does not contain. Stay on 6.4.3 until a release fixes it.
- `spessasynth_core` asks for its Vorbis decoder at version `latest`; `package.json` pins it with
  an `overrides` entry.
- GeneralUser GS 2.0.3, 32,319,396 bytes, sha256 `9575028c…` (full hash in
  `scripts/score/fetch-soundfont.mjs`).
- The 20-second example renders in 1.6 s. The first note lands within one 128-sample block
  (2.7 ms at 48 kHz) of its written time — under a tenth of a frame.
- Through Remotion and `finish-video.mjs`, a score written at −16 LUFS came out at −14.2 LUFS,
  true peak −2.5 dBTP.
- AAC at 192 kbps added 1.4 dB of true-peak overshoot to a hot master; at 320 kbps, 0.2 dB. The
  finishing script encodes at 320.
