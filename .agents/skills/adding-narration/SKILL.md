---
name: adding-narration
description: Adds spoken narration to a video - writing for the ear, generating or recording it, splitting it per scene, and fitting the picture to it. Use when a video needs a voice, when narration and picture have drifted apart, when a render comes out with no audio track, or when someone asks about text-to-speech or voiceover.
---

# Adding narration

**Use this when** the video has been decided to have a voice.

**You need first** a script, and the decision that this video has sound at all. A silent film
carries meaning through text on screen instead — a different craft and a different set of choices.

**This produces** audio files under `public/assets/<project>/audio/`, and the per-scene timings the
picture is then cut to.

**Then go to** `building-scenes`.

---

## The number everything else depends on

**Anything with a voice comes out roughly half as long again as planned**, because people speak
more slowly than they read. A minute of written script is about a minute and a half spoken.

Establish the real spoken length before anything downstream is approved. On one film a late
rewrite of the narration was discovered to have outgrown the picture only while placing it — which
meant re-timing every clip, three jobs where one had been budgeted, and the film grew from 62
seconds to 74.

## The order that works

1. Write the script for the ear.
2. **Generate the audio and measure it.** Not estimate — measure.
3. Split it per scene, trimming at render time rather than cutting the files.
4. **Find the section boundaries** in each batch, and measure them.
5. **Reconcile against the planned durations** — and raise the overall target as well as the
   section length. Widening one section alone squeezes every other one and clips more than it
   fixes. This is the step people skip, and it is the one that costs a rebuild.
6. Place the audio and set levels.
7. Render with audio, and check the track is present.

**Audio first, picture second.** Reversed, every scene gets re-timed.

## FFmpeg, and the trap in it

Remotion bundles an FFmpeg, reachable as `npx remotion ffmpeg` and `npx remotion ffprobe`.
`which ffmpeg` is the wrong test for it — the bundled copy is deliberately not on PATH, and a
check reporting it missing is wrong.

**But the bundled build is trimmed for rendering, and four filters this toolchain depends on are
compiled out of it**: `setpts` and `minterpolate`, used by `scripts/retime-plate.mjs`, and
`silenceremove` and `afade`, used by `scripts/build-audio.mjs`. Both scripts need a full system
FFmpeg. Verified by running `npx remotion ffmpeg -filters` against the filters those scripts use.

## Verify what came back. Every time.

**Batched generation silently drops lines.** Asking for several at once and getting fewer back is
not an error — nothing fails, no warning appears, and the file plays perfectly at a plausible
length. On one film three sentences went missing and it was nearly shipped.

Send the finished audio to a transcriber and compare what it says against the script. That catches
three things at once: missing lines, long silences, and the voice reading a stage direction aloud
instead of performing it.

**Checking the duration catches none of them.** The file is plausibly long either way.

## Four more that will bite

**The free tier is counted per model, per day** — not per key, not per project. A ten-section
video generated one call per section can use a whole day's allowance.

**Different models read at different speeds.** One has been measured reading roughly twice as
fast as another. Regenerate on a different model and every timing built against the first is
wrong. **Never mix models within one video.**

**Batch by section, never by sentence.** Per-sentence calls exhaust the quota; whole-script calls
are where lines go missing unnoticed.

**Check the API key before starting, not after the script is approved.** No key, no narration, and
that is a conversation to have during the interview in `building-a-video`.

## Fades are not optional

A cut landing mid-waveform is a step discontinuity, and it is heard as a click. A fade of even 10ms
removes it without being audible as a fade. `scripts/build-audio.mjs` does this, along with
trimming to the cue, stripping near-silence so every clip starts on its sound, and normalising to a
common level under a peak ceiling.

## A note about volume is not always about volume

One sound was described as too loud and unpleasant. It was made quieter, and became — in the
description given at the time — ghostly. The note had been about the character of the sound, not
its level, and the fix was a different sound played louder than the first. Re-read a note before
adjusting the same value twice.

## Reference

- [`reference/generating.md`](reference/generating.md) — the manifest, batching around quotas,
  voices, verification, refusals, and what comes back.
- [`reference/splitting.md`](reference/splitting.md) — trimming at render time rather than cutting
  files, finding boundaries, the scanner, levels, fades, measuring durations, where files go.
- [`reference/timing.md`](reference/timing.md) — speaking rate, the mistake that costs a rebuild,
  reconciling script against picture, placing, levels, fades, captions, rendering with audio.
- `ACCESS.md` — what speech synthesis is reachable here, its free tier, and its cost. Treat those
  terms as claims to re-check.
