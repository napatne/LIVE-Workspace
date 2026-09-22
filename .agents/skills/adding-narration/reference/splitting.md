# Splitting a batch

**FFmpeg ships with Remotion** — `npx remotion ffmpeg`, `npx remotion ffprobe`, version n7.1.
Bare `ffmpeg` is not on PATH, so `which ffmpeg` says it is missing. That check is wrong.

> **It is a cut-down build.** `silencedetect` and `loudnorm` are available; **`volumedetect`,
> `astats`, `ebur128` and `afade` are not** — compiled with `--disable-filters` and a short
> allow-list. You can find silences but you **cannot measure levels** with it. See *Levels*.

## Don't cut the files. Trim them at render time.

Batching gives you `batch-a.wav` holding three sections' worth of speech. The obvious next step
is to cut it into three files. **Don't.** Remotion plays a slice:

```tsx
<Audio
  src={staticFile("assets/<slug>/audio/batch-a.wav")}
  trimBefore={Math.round(startSeconds * fps)}
  trimAfter={Math.round(endSeconds * fps)}
/>
```

Both are in **frames**, and both exist in Remotion 4.0.506 (`startFrom`/`endAt` are the
deprecated names). **Verified by rendering:** every line lands exactly where its trims say.

A section's audio is therefore a batch file plus two numbers. Nothing is cut, nothing can drift.

## Finding the boundaries — there is no magic number

**No silence threshold can separate lines reliably.** Measured on this project's own shipped
narration:

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

You wrote the manifest, so you know how many lines are in each batch.

```js
for (const gap of [0.25, 0.30, 0.35, 0.40, 0.45, 0.50, 0.60, 0.70, 0.85, 1.00]) {
  console.log(gap.toFixed(2), (await scan(wavPath, gap)).length, "regions");
}
```

- **One threshold gives the right count** → use it, then sanity-check below.
- **Several do** → take the middle; their boundaries will agree.
- **None does** → do not guess. Print the silence list and pick boundaries by hand against your
  script. It is a dozen numbers and you do it once.

**Different batches need different thresholds.** The two shipped ones needed 0.50 and 0.70.
Never carry a value from one batch to the next.

### Sanity-check every region

A matching count is not proof. Compare each region's duration against what that line should
take at roughly **100 words per minute** (see *Speaking rate* in [timing.md](timing.md)). A
region half or double its expected length is a wrong boundary even when the count looks right.

**Under-splitting is the dangerous direction.** Too many regions is obvious. Too few means two
sections share one clip — **the second section plays nothing** — and `tts-verify.mjs` will not
catch it, because it confirms lines are *present*, not that they were *cut apart* correctly.

### The scanner

```js
import { readFile } from "node:fs/promises";

const SILENCE = 0.012;    // amplitude floor, 0..1
const WINDOW = 0.02;      // 20ms analysis window
const MIN_REGION = 0.35;  // shorter than this is not a line

// Parse the RIFF chunk table. Do NOT assume data starts at byte 44: any WAV
// ffmpeg wrote carries a LIST/INFO chunk first, and in this repo those put
// `data` at byte 78. Reading metadata as PCM invents a loud region at t=0.
const findData = (buf) => {
  let off = 12;
  while (off + 8 <= buf.length) {
    const id = buf.toString("ascii", off, off + 4);
    const size = buf.readUInt32LE(off + 4);
    if (id === "data") return { start: off + 8, end: off + 8 + size };
    off += 8 + size + (size % 2);
  }
  throw new Error("no data chunk");
};

export const scan = async (path, minGap, rate = 24000) => {
  const buf = await readFile(path);
  const { start, end } = findData(buf);
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

**Widen each region** when converting to frames — about **0.18s before and 0.22s after**, which
is what the shipped human cut used. The tighter 0.08/0.15 clips consonants.

## Levels

| | Target |
| --- | --- |
| Voice | −24 dB RMS |
| Sound effects | −26 dB RMS |
| Peak ceiling | −3 dB |

**You cannot verify these with the bundled ffmpeg** — `volumedetect`, `astats` and `ebur128` are
all compiled out. Treat them as a starting point and judge by listening, or install a full
ffmpeg if measurement matters. **`scripts/build-audio.mjs` applies them for the Lexi film only**;
it is hardcoded to that film's paths and takes no arguments.

**Remotion applies a −3 dB mono→stereo pan law.** A mono TTS clip lands about 3 dB under
whatever linear gain you set. `linear = 10 ** (dB / 20)`, so −24 dB is 0.063 — expect roughly
−27 dB out.

## Fades

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
const FADE_IN = 12;
const FADE_OUT = 15;

// The callback sees the CLIP's frames, 0 .. clipFrames - 1, not the section's.
// Verified against Remotion 4.0.506: <Audio> wraps the trims in a Sequence and
// useFrameForVolumeProp cancels the offset exactly.
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

**Do not use the section's `durationInFrames`.** `timing.md` makes every section longer than its
audio, so a ramp built on that starts after the clip has ended and every line cuts hard.

**A region needs at least `FADE_IN + FADE_OUT` plus a few frames** — about 30 at 30fps, one
second. Anything shorter is all fade, which is what `MIN_REGION` keeps out.

## Measuring durations

**Take it from the file you already parsed.** You walked the RIFF chunk table to find `data`;
its size is the only thing a duration needs:

```ts
// 16-bit mono at 24000Hz — what the TTS returns
const seconds = dataBytes / 2 / 24000;
```

**Do not import `@remotion/media-utils`.** `getAudioDurationInSeconds` does the same job, but
that package **is not in `package.json`** — it is present only because `@remotion/cli` depends
on it. Importing a transitive dependency works until the day it does not, and declaring it buys
nothing over one division.

**Per-section durations come from your region list**, not from the file — one batch holds
several sections.

## Where the files go

| | |
| --- | --- |
| Batch WAVs | `public/assets/<slug>/audio/` |
| The manifest | `content/<slug>/tts-manifest.json` |
| The region list | Beside the sections, as data — see [timing.md](timing.md) |

**Keep the batches; they are the source.** Nothing is cut, so the batch file *is* the asset the
video plays.
