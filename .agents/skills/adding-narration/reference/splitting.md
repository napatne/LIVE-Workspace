# Splitting narration into lines

## Contents

- [Two FFmpegs](#two-ffmpegs)
- [Two ways to play a line](#two-ways-to-play-a-line)
- [Finding the boundaries — there is no magic number](#finding-the-boundaries--there-is-no-magic-number)
- [The scanner](#the-scanner)
- [Cutting clips with build-audio](#cutting-clips-with-build-audio)
- [Levels](#levels)
- [Fades](#fades)
- [Measuring durations](#measuring-durations)
- [Where the files go](#where-the-files-go)

## Two FFmpegs

Remotion ships a copy — `npx remotion ffmpeg`, `npx remotion ffprobe`, deliberately off PATH. It is
trimmed for rendering: `afade`, `silenceremove` and the level-measuring filters (`volumedetect`,
`astats`, `ebur128`) are compiled out of it.

**A full system FFmpeg, bare `ffmpeg`, is required here**, and `node scripts/check-setup.mjs`
installs it. Everything in this file — converting a recording, cutting clips, measuring levels — uses
the system one.

## Two ways to play a line

Narration arrives as one long file: a generated batch holding several sections, or a person's whole
recording. Each line has to end up playable on its own.

**Cut it into one clip per line with `scripts/build-audio.mjs`.** This is the default, and the only
route for a person's recording. Each clip is trimmed, stripped of the near-silence at both ends,
levelled to a common loudness under a peak ceiling, and faded with sample-accurate fades. The scene
plays the clip whole:

```tsx
import { Audio } from "@remotion/media";
import { staticFile } from "remotion";

<Audio src={staticFile("assets/<project>/audio/line-03.wav")} />
```

**Or trim the long file at render time.** Remotion plays a slice of it:

```tsx
import { Audio } from "@remotion/media";
import { staticFile } from "remotion";

<Audio
  src={staticFile("assets/<project>/audio/batch-a.wav")}
  trimBefore={Math.round(startSeconds * fps)}
  trimAfter={Math.round(endSeconds * fps)}
/>
```

`<Audio>` comes from `@remotion/media`, as the vendored `remotion-markup/audio.md` says; `remotion`
exports an older one too. `trimBefore` and `trimAfter` are in **frames of the film**, not seconds
(`startFrom`/`endAt` are the deprecated names). Verified by rendering: every line lands exactly where
its trims say.

Render-time trimming is fine **while timings are still moving** — nothing to re-cut when a boundary
shifts — and for a **generated batch whose level is already even**. It levels nothing, and its fades
have to be at least 12 frames (see *Fades*). Once the lines are settled, cut the clips.

## Finding the boundaries — there is no magic number

**No silence threshold can separate lines reliably.** Measured on this project's own shipped
generated narration:

| | |
| --- | --- |
| Smallest gap **between** two real lines | **0.150s** |
| Largest pause **inside** one line | **1.051s** |

**Within-line pauses are longer than between-line pauses.** The distributions overlap, so any
single threshold merges real lines, splits single ones, or both. An earlier version of this file
prescribed 0.70s; on the two batches this project actually shipped it gave **6 regions where
there were 8, and 9 where there were 6** — wrong in both directions, so an agent cannot even
learn a correction.

### Instead: sweep to the count you already know

You wrote the manifest or the script, so you know how many lines are in each file.

```js
for (const gap of [0.25, 0.30, 0.35, 0.40, 0.45, 0.50, 0.60, 0.70, 0.85, 1.00, 1.25, 1.50, 1.75, 2.00]) {
  console.log(gap.toFixed(2), (await scan(wavPath, gap)).length, "regions");
}
```

**Take the top of the sweep from the pause that was asked for.** A person asked to leave two seconds
between lines needs the sweep to reach about 2.0 s; their pauses inside a line can run close to a
second, so a sweep stopping at 1.0 s can leave only its last value matching, or none.

- **One threshold gives the right count** → use it, then sanity-check below.
- **Several do** → take the middle; their boundaries will agree.
- **None does** → do not guess. Print the silence list and pick boundaries by hand against your
  script. It is a dozen numbers and you do it once.

**Different files need different thresholds.** The two shipped batches needed 0.50 and 0.70.
Never carry a value from one file to the next.

### Sanity-check every region

A matching count is not proof. Compare each region's duration against what its words should take
**at this voice's rate**. The rate belongs to the voice: work it out from the file itself — the
script's words divided by the total speech time of the regions — rather than borrowing a figure from
another voice. A region half or double its expected length is a wrong boundary even when the count
looks right.

**Under-splitting is the dangerous direction.** Too many regions is obvious. Too few means two
lines share one clip — **the second one plays nothing** — and neither `tts-verify.mjs` nor a
listen-through of the long file will catch it, because both confirm lines are *present*, not that
they were *cut apart* correctly.

## The scanner

It reads **16-bit PCM WAV, mono**, and refuses anything else rather than measuring it wrongly. Generated
speech already arrives that way. A recording from a phone — AAC in an `.m4a`, an MP3, a stereo or
24-bit WAV — has to be converted first, with the system FFmpeg, passing the arguments as an array:

```js
const args = ["-v", "error", "-y", "-i", "in.m4a", "-ac", "1", "-ar", "24000", "-c:a", "pcm_s16le", "out.wav"];
console.log(`$ ffmpeg ${args.join(" ")}`);
spawnSync("ffmpeg", args, { stdio: "inherit" });
```

Scan the converted file, and cut from the same file, so the times line up.

```js
import { readFile } from "node:fs/promises";

const SILENCE = 0.012;    // amplitude floor, 0..1
const WINDOW = 0.02;      // 20ms analysis window
const MIN_REGION = 0.35;  // shorter than this is not a line

// Walk the RIFF chunk table. Do NOT assume data starts at byte 44: any WAV
// ffmpeg wrote carries a LIST/INFO chunk first, and in this repo those put
// `data` at byte 78. Reading metadata as PCM invents a loud region at t=0.
const findChunk = (buf, want) => {
  let off = 12;
  while (off + 8 <= buf.length) {
    const id = buf.toString("ascii", off, off + 4);
    const size = buf.readUInt32LE(off + 4);
    if (id === want) return { start: off + 8, end: Math.min(off + 8 + size, buf.length) };
    off += 8 + size + (size % 2);
  }
  throw new Error(`no ${want.trim()} chunk`);
};

// Read the format instead of assuming it. A 48 kHz or stereo file read as
// 24 kHz mono gives boundaries at the wrong times and no error at all.
const readFormat = (buf) => {
  const { start } = findChunk(buf, "fmt ");
  const format = buf.readUInt16LE(start);
  const channels = buf.readUInt16LE(start + 2);
  const rate = buf.readUInt32LE(start + 4);
  const bits = buf.readUInt16LE(start + 14);
  if (format !== 1 || channels !== 1 || bits !== 16) {
    throw new Error(`want 16-bit PCM mono, got format ${format}, ${channels} ch, ${bits}-bit - convert it first`);
  }
  return rate;
};

export const scan = async (path, minGap) => {
  const buf = await readFile(path);
  const rate = readFormat(buf);
  const { start, end } = findChunk(buf, "data");
  const pcm = buf.subarray(start, end);
  const per = Math.floor(rate * WINDOW);

  const loud = [];
  for (let i = 0; i + per * 2 <= pcm.length; i += per * 2) {
    let peak = 0;
    for (let s = 0; s < per; s++) {
      peak = Math.max(peak, Math.abs(pcm.readInt16LE(i + s * 2)) / 32768);
    }
    loud.push(peak > SILENCE);
  }

  const regions = [];
  let from = null;
  for (let w = 0; w < loud.length; w++) {
    const t = w * WINDOW;
    if (loud[w] && from === null) from = t;
    if (!loud[w] && from !== null) {
      const next = loud.indexOf(true, w);
      const gap = (next === -1 ? loud.length : next) * WINDOW - t;
      if (gap >= minGap) { regions.push([from, t]); from = null; }
    }
  }
  // End on the last LOUD window, not EOF - trailing silence would otherwise
  // inflate the final region and put its fade-out inside the silence.
  if (from !== null) regions.push([from, (loud.lastIndexOf(true) + 1) * WINDOW]);

  return regions.filter(([a, b]) => b - a >= MIN_REGION);
};
```

**Widen each region** when writing it into a cue or converting it to frames — about **0.18s before
and 0.22s after**, which is what the shipped human cut used. The tighter 0.08/0.15 clips consonants.

**A noisy room raises the floor.** `SILENCE` is an amplitude, not a level relative to the file. If
a recording's room hiss sits above it, every gap reads as sound and the sweep finds one region;
raise `SILENCE` until the gaps between lines read as quiet.

## Cutting clips with build-audio

```bash
node scripts/build-audio.mjs --cues <cues.json> --src <dir> --out <dir>
```

All three are required; with none it prints its usage and stops. It works for any film. It checks
the cues file, and each cue's `type`, before it runs FFmpeg, and keeps its temporary files in
`out/.audio-tmp/`, never in `public/`.

- `--cues` — the cues file, conventionally `content/<project>/audio-cues.json`.
- `--src` — the folder each cue's `src` is relative to: `content/<project>/intake/` for a
  recording, or wherever the generated batches were written.
- `--out` — where the clips go: `public/assets/<project>/audio/`.

The cues file:

```json
{
  "fps": 30,
  "cues": [
    { "id": "line-01", "src": "take-1.wav", "type": "vo", "frame": 12, "start": 0.42, "duration": 3.90 },
    { "id": "line-02", "src": "take-1.wav", "type": "vo", "frame": 150, "start": 6.10, "duration": 5.20 },
    { "id": "door", "src": "door.wav", "type": "sfx", "frame": 240, "gainDb": -2 }
  ]
}
```

| Field | What it is |
| --- | --- |
| `fps` | The film's frame rate. Turns each clip's length into frames for the report |
| `id` | The clip's name; it is written as `<id>.wav` |
| `src` | The source file, relative to `--src` |
| `type` | `vo` for speech, `sfx` for an effect. Sets the target level and the fades |
| `frame` | The film frame the clip lands on. Used for the end-frame column and the overlap check; before the picture is timed, use the planned start and update it after reconciling |
| `start` | Optional. Seconds into `src` to start the cut |
| `duration` | Optional. Seconds to keep from `start` |
| `gainDb` | Optional. Extra gain for this clip on top of the target level, to hold one clip down |
| `fadeIn`, `fadeOut` | Optional. Seconds, overriding the type's fades — an interruption that must stop dead takes a short `fadeOut` |

For each cue it cuts `start`/`duration`, strips near-silence (below −50 dB) from both ends so the
clip starts on its sound, writes 16-bit mono at 48 kHz, levels to the type's target RMS — pulling
back if the peak would pass the ceiling — and fades both edges. It prints every FFmpeg command, then
a table of each clip's length, level, peak and end frame, and lists any two cues that talk over each
other.

**Because the edges are stripped, the length in that table is the line's spoken length.** That is
the number to reconcile against the picture.

## Levels

| | Target |
| --- | --- |
| Voice (`vo`) | −24 dB RMS |
| Sound effects (`sfx`) | −26 dB RMS |
| Peak ceiling | −3 dB |

`scripts/build-audio.mjs` applies these to every clip it cuts, and measures the result with the
system FFmpeg; its table shows what each clip came out at. They are starting points for a mix, not
a final balance. A slice trimmed at render time is not levelled at all.

**Remotion applies a −3 dB mono→stereo pan law.** A mono clip lands about 3 dB under whatever
linear gain you set. `linear = 10 ** (dB / 20)`, so −24 dB is 0.063 — expect roughly −27 dB out.

## Fades

Clips cut by `build-audio.mjs` are already faded — 45 ms in and 110 ms out for speech — and need no
fade in Remotion. This section is for slices trimmed at render time.

**Remotion evaluates `volume` in blocks of about 83 ms — roughly 2.5 frames at 30fps — not once
per frame.** Measured from rendered audio at both 24 kHz and 48 kHz, so it is not a source
artifact.

That one fact governs everything here:

| | |
| --- | --- |
| **Use** | **12 frames in, 15 out** |
| Never | fewer than about 8 frames |

**A short fade is worse than no fade.** At 4 in and 6 out the whole ramp is narrower than two
quantization blocks, so it collapses into two or three hard steps. Measured: a sample-to-sample
jump of **5220** where the waveform's own maximum slope was **489** — a **10.7× discontinuity**,
which is an audible click. The fade creates the artifact it exists to remove.

> **Correction.** Earlier versions said 45ms/110ms — taken from `build-audio.mjs`, which is
> sample-accurate and where they are fine — and then 4/6 frames. **Both are wrong here.** 45ms
> is one frame; 4 frames sits inside a single quantization block.

```tsx
import { Audio } from "@remotion/media";
import { interpolate, staticFile } from "remotion";

const FADE_IN = 12;
const FADE_OUT = 15;

// The callback's frame counts from where the clip starts playing,
// 0 .. clipFrames - 1 - not from the section's start or the file's start.
const clipFrames = trimAfter - trimBefore;

<Audio
  src={staticFile(src)}
  trimBefore={trimBefore}
  trimAfter={trimAfter}
  volume={(f) =>
    interpolate(
      f,
      [0, FADE_IN, clipFrames - 1 - FADE_OUT, clipFrames - 1],
      [0, 1, 1, 0],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
    )
  }
/>
```

**Do not use the section's `durationInFrames`.** Reconciling makes every section longer than its
audio, so a ramp built on that starts after the clip has ended and every line cuts hard.

**A region needs at least `FADE_IN + FADE_OUT` plus a few frames** — about 30 at 30fps, one
second. Anything shorter is all fade, which is what `MIN_REGION` keeps out.

## Measuring durations

**Take it from the file you already parsed.** The format chunk gives the sample rate, channels and
bit depth; the `data` chunk's size gives the rest:

```ts
const seconds = dataBytes / (channels * (bits / 8)) / rate;
// 16-bit mono at 24000 Hz, as generated speech arrives: dataBytes / 2 / 24000
// 16-bit mono at 48000 Hz, as build-audio.mjs writes:   dataBytes / 2 / 48000
```

**Do not import `@remotion/media-utils`.** `getAudioDurationInSeconds` does the same job, but
that package **is not in `package.json`** — it is present only because `@remotion/cli` depends
on it. Importing a transitive dependency works until the day it does not, and declaring it buys
nothing over one division.

**Per-line durations come from your region list or from `build-audio.mjs`'s table**, not from the
long file — one file holds several lines.

## Where the files go

| | |
| --- | --- |
| A person's recording, and its converted WAV | `content/<project>/intake/` — git-ignored |
| Generated batches | `content/<project>/narration/` when they are cut into clips; `public/assets/<project>/audio/` only if they are played by render-time trimming |
| The cues file | `content/<project>/audio-cues.json` |
| The generation manifest | `content/<project>/tts-manifest.json` |
| The clips | `public/assets/<project>/audio/` |

Everything in `public/` is copied into every render, so only what a scene plays goes there. **Keep
the long files; they are the source.** A clip can always be re-cut from them; a line regenerated or
re-recorded never comes out the same twice.
