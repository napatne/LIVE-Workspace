---
name: adding-narration
description: Adds spoken narration to a video - writing for the ear, generating or recording it, splitting it per scene, and fitting the picture to it. Use when a video needs a voice, when narration and picture have drifted apart, when a render comes out with no audio track, or when someone asks about text-to-speech or voiceover.
---

# Adding narration

**Use this when** the video has been decided to have a voice — a generated one, or the person's own.

**You need first** a script, and the decision that this video has sound at all. A silent film
carries meaning through text on screen instead — a different craft and a different set of choices.

**This produces** one audio clip per line under `public/assets/<project>/audio/`, and the per-scene
timings the picture is then cut to.

**Then go to** `building-scenes`.

---

## Two ways to get a voice

- **Generated** — speech synthesis from the script, on a free key (`ACCESS.md`). The workflow is in
  [`reference/generating.md`](reference/generating.md).
- **Recorded** — the person reads the script into a phone or a USB microphone. No key, no account,
  no quota. The workflow is in [`reference/recording.md`](reference/recording.md).

Both end in the same place: one clip per line, cut by `scripts/build-audio.mjs`, and a measured
length for every line. Everything after that — reconciling, placing, levels, captions — is the same
for both.

**A recording is a real route, not a fallback.** When someone has no key and does not want one,
offer it before offering a film with no voice.

## The number everything else depends on

**Speech takes longer than the written plan, and how much longer depends on the voice.** The speaking
rate belongs to one voice, not to narration in general:

- The generated voice this project has shipped reads at about 100 words per minute. Scripts written
  to the 150 wpm writing budget come out **about 35–45% longer** spoken (measured; see the dated
  block).
- A person reading their own script is commonly faster, around 130–160 wpm, so the overrun is much
  smaller.

The 150 wpm budget in the interview is a different thing: a ceiling for how much to write per second
of finished video. It is not how fast anyone speaks.

**Establish the real spoken length before anything downstream is approved.** Measure the audio you
actually have; do not estimate it from a rate. On one film a late rewrite of the narration was found
to have outgrown the picture only while placing it — which meant re-timing every clip, three jobs
where one had been budgeted, and the film grew from 62 seconds to 74.

## The order that works

1. Write the script for the ear.
2. **Get the audio — generate it or record it — and measure it.** Not estimate — measure.
3. **Find the line boundaries** in each file, and measure them
   ([`reference/splitting.md`](reference/splitting.md)).
4. **Cut one clip per line** with `scripts/build-audio.mjs` — trimmed, levelled, faded.
5. **Check it** — a transcript for generated speech, a listen-through for a recording.
6. **Reconcile against the planned durations** — and raise the overall length as well as the
   section length. Widening one section alone squeezes every other one and clips more than it
   fixes. This is the step people skip, and it is the one that costs a rebuild.
7. Place the audio and set levels.
8. Render with audio, and check the track is present.

**Audio first, picture second.** Reversed, every scene gets re-timed.

## Cutting the clips

One account, for both routes: **a recording or a generated batch goes through
`scripts/build-audio.mjs`**, which cuts each line out, strips the near-silence at both ends so the
clip starts on its sound, levels it to a common loudness under a peak ceiling, and fades both edges.

```bash
node scripts/build-audio.mjs --cues content/<project>/audio-cues.json --src content/<project>/intake --out public/assets/<project>/audio
```

All three arguments are required, and it works for any film. The cues file lists every line: which
source file, where in it, which frame of the film it lands on. Its shape is in
[`reference/splitting.md`](reference/splitting.md) → *Cutting clips with build-audio*.

**Trimming a batch at render time instead** — one long file played as slices with `trimBefore` and
`trimAfter` — is fine while the timings are still moving, and for a generated batch whose level is
already even. It levels nothing and needs fades of at least 12 frames. A person's recording always
goes through `build-audio.mjs`: its level drifts, and room noise sits at every edge.

## FFmpeg, and the trap in it

**A full system FFmpeg is required.** Remotion bundles one, reachable as `npx remotion ffmpeg`, but it
is trimmed for rendering: `silenceremove` and `afade`, which `scripts/build-audio.mjs` uses, are
compiled out of it, as are the level-measuring filters. `which ffmpeg` is also the wrong test for the
bundled copy, which is deliberately not on PATH. `node scripts/check-setup.mjs` says whether the full
one is installed.

## Check what came back. Every time.

**Generated speech: transcribe it.** Batched generation silently drops lines. Asking for several at
once and getting fewer back is not an error — nothing fails, no warning appears, and the file plays
perfectly at a plausible length. On one film three sentences went missing and it was nearly shipped.
`scripts/tts-verify.mjs` sends the audio to a transcriber; read what it says against the script. That
catches missing lines, long silences, and the voice reading a stage direction aloud instead of
performing it. It needs the same key as generation.

**A person's recording: listen, count, confirm.** `tts-verify.mjs` is for generated speech only — it
needs a key, and its prompt and file handling are written for synthesis output. A recording is
checked three ways instead:

- **Listen through it against the script**, line by line, and note anything skipped or changed.
- **The line count from splitting** matches the number of lines in the script.
- **The person confirms** that what they hear is what they meant to say. It is their voice, and they
  are the approval authority on it.

**Checking the duration catches none of this.** The file is plausibly long either way.

## Generated speech: four more that will bite

**The free tier is counted per model, per day** — not per key, not per project. A ten-section
video generated one call per section can use a whole day's allowance.

**Different models read at different speeds.** One has been measured reading roughly twice as
fast as another. Regenerate on a different model and every timing built against the first is
wrong. **Never mix models within one video.**

**Batch by section, never by sentence.** Per-sentence calls exhaust the quota; whole-script calls
are where lines go missing unnoticed.

**Check for a key before starting, not after the script is approved.** No key means no generated
voice — which is a conversation for the interview in `building-a-video`, and where a recording is
offered.

## Which voice is a decision

The voice — which one, how fast, how warm — is heard in every second of the film. If they have a
view, use it. If they say "you decide", pick one, play them one generated line before the whole
script, and say which you picked and why. Record it in the brief (`building-a-video` →
`reference/decisions.md`) with the model name, because one voice on one model for the whole film is
the rule, and the next session needs to know which. If the voice is their own, record that too.

## On-screen words stay inside the recorded words

When the narration is someone's own recording, **the script can no longer be fixed by editing it** —
every change is a re-record. So an on-screen label the narration never says cannot be reconciled
with the voice by rewriting a line. Keep labels and titles within the words that were recorded. If
the person wants a term on screen that the recording does not say, tell them before changing it
that matching the voice would mean recording that line again, and let them choose.

## Narration with music under it

Music sits under a voice, never beside it. `scoring-music` lowers the score under every spoken line
and lets it back up in the gaps, from the same timings this skill produces — so get and measure the
narration first, then score against it.

## Fades are not optional

A cut landing mid-waveform is a step discontinuity, and it is heard as a click. A fade of even 10ms
removes it without being audible as a fade. `scripts/build-audio.mjs` fades every clip it cuts, with
sample-accurate fades. A slice trimmed at render time has to be faded with Remotion's `volume`
callback instead, and that needs much longer fades — [`reference/splitting.md`](reference/splitting.md)
→ *Fades* has why.

## A note about volume is not always about volume

One sound was described as too loud and unpleasant. It was made quieter, and became — in the
description given at the time — ghostly. The note had been about the character of the sound, not
its level, and the fix was a different sound played louder than the first. Re-read a note before
adjusting the same value twice.

## The vendored voiceover page does not apply here

`remotion-best-practices/remotion-markup/voiceover.md` says to recommend ElevenLabs and ask for an
API key when no provider is named. **Do not.** Free tools first, and no paid call without a specific
approved proposal (`AGENTS.md` → *Cost rules*; workspace rules win where the vendored guidance
conflicts, `AGENTS.md` → *Remotion guidance*). Here the routes are the free key in `ACCESS.md`, or
the person's own voice.

## Reference

- [`reference/generating.md`](reference/generating.md) — the manifest, batching around quotas,
  voices, verification, refusals, and what comes back.
- [`reference/recording.md`](reference/recording.md) — the person's own voice: recording it,
  converting it, splitting it, checking it.
- [`reference/splitting.md`](reference/splitting.md) — finding boundaries, the scanner, the cues
  file and `build-audio.mjs`, render-time trimming, levels, fades, measuring durations, where files
  go.
- [`reference/timing.md`](reference/timing.md) — speaking rate, the mistake that costs a rebuild,
  reconciling script against picture, placing, levels, fades, captions, rendering with audio.
- `ACCESS.md` — what speech synthesis is reachable here, its free tier, and its cost. Treat those
  terms as claims to re-check.

## Measurements

Dated as taken. Re-measure for the voice in front of you rather than reusing these.

- **2026-09-22** — the generated voice shipped on this project's topic packs: about 100 wpm (95
  counting allotted clip time, about 107 counting pure speech). Scripts written at 136–150 wpm spoke
  35–45% longer than their written seconds (`building-a-video/topics/README.md`).
- **2026-10-20** — one reader (a test-run stand-in for a person reading their own script): 95 words
  in 43.4 s of speech, about 131 wpm overall, 136–176 wpm per line. One reader, one script; not a
  norm.
- **2026-10-20** — `build-audio.mjs` levelled every clip of that recording to −24.0 dB RMS.
