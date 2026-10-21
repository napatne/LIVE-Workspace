# Fitting narration to the video

## Contents

- [Speaking rate belongs to a voice](#speaking-rate-belongs-to-a-voice)
- [The mistake that costs a rebuild](#the-mistake-that-costs-a-rebuild)
- [Reconciling](#reconciling)
- [Placing it](#placing-it)
- [Levels](#levels)
- [Fades — the click nobody can name](#fades--the-click-nobody-can-name)
- [Captions stay on](#captions-stay-on)
- [Rendering with audio](#rendering-with-audio)
- [Before you call it done](#before-you-call-it-done)
- [Measurements](#measurements)

## Speaking rate belongs to a voice

**There is no single speaking rate for narration.** Each voice has its own, and it is measured from
that voice's audio, not assumed:

- **The generated voice this project has shipped reads at about 100 words per minute.**
- **A person reading their own script is commonly faster, around 130–160 wpm.**

**The packs and the interview write to 150 wpm.** That is a writing budget — a ceiling on how many
words to put against each second of finished video, sound for *reading captions*. It is not what any
voice does.

**So a narrated video runs longer than its written seconds, by an amount set by the voice.** With the
generated voice, scripts written to the budget came out **about 35–45% longer**, and essentially
every section overran. With a person's voice the overrun is much smaller, and some sections may
come in under. Either way it is expected, it is not a mistake in the script, and the reconciliation
below is how it is handled.

**Measure the voice you have.** Once the first batch is generated or the recording is split, divide
its words by its speech time. That is the rate to predict the rest with — not a figure from another
voice.

> Earlier versions of this file and the pack README said 137 wpm, and then 100 wpm for every
> narration. The first was about 44% optimistic for the generated voice; the second is that one
> voice's rate, and a person reading their own script runs well above it.

## The mistake that costs a rebuild

**A film's section lengths are decided before the narration exists.** However the film keeps them —
a constant per scene, a list of sections with their seconds, a `timeline.json` shared with the
score — they were written by hand against the 150 wpm writing budget, and the total is derived from
them.

**Then the audio comes back and it is not the length that was written.**

One earlier film hit exactly this. A round of script changes went in, narration was regenerated, and
**all three character scenes turned out too short for the new audio.** What looked like a wording
change silently required three footage re-times, and it cost most of a session.

**So: measure the audio and reconcile it before you build anything.**

## Reconciling

Measure each section's audio and compare it against its planned seconds:

```text
section        planned   measured
hook              5.0      4.1     ok (under)
demand            7.0      7.4     OVER by 0.4
supply            7.0      7.9     OVER by 0.9
equilibrium       5.0      6.2     OVER by 1.2
```

**Under by a little is fine.** A second of quiet at the end of a section reads as a beat.
**Over is not** — the next section starts on schedule and cuts the line off mid-word.

### Widening a section is not enough, and doing only that makes it worse

This is the step that matters and the obvious fix is wrong.

A film's code often fits its sections into a fixed total by scaling them: something like
`scale = (total - fixed parts) / Σ section seconds`, written per film. **Widen a section and you
grow the denominator, so every other section is squeezed to pay for it and the total stays pinned
where it was.**

Run against a real 60-second script with a planner like that, widening the three overrunning
sections and leaving the total at 60:

```text
demand       gets  7.33s, audio is  7.4s   CLIPPED
supply       gets  7.80s, audio is  7.9s   CLIPPED
shift        gets 10.33s, audio is 10.6s   CLIPPED  ← this one fitted before
```

**Three sections clipped, one of them newly.** And the total never moves, so the "it comes out
longer, alright?" conversation can never happen.

### What to actually do

**Raise the section seconds AND the total together.**

1. For each section, `new = max(planned, measured + 0.4)`. The 0.4 covers the 2–3 frame lead-in
   plus a tail so no consonant is clipped.
2. Set the total to the fixed parts (a title card, say) plus `Σ new`. If the film scales, that puts
   the scale back on exactly 1.0, so every section plays its written length.

Same script, done properly: scale back to **1.0000**, **0 sections clipped**.

**With a generated voice, expect a big jump, not a small one** — the 35–45% above. Tell them that
honestly:

> With the voice on it this runs a lot longer than the written version — about a minute and a
> half rather than a minute. Speech is slower than reading. Nothing's cut and none of the
> wording changes. Alright, or shall I trim it back to fit a minute?

Use the film's own measured numbers in that sentence, not these.

### Crossing a tier boundary

The topic packs choose their sections by tier from the target length: 30 seconds plays `core`, 60
plays `core` and `standard`, 120 adds `extended`. If the film's code picks the tiers from the total,
**raising the total past 60 or 120 pulls in a whole tier of sections that have no audio at all**.

With a generated voice running 35–45% long, that fires for most requests between about 76 and 120
seconds. It is not a narrow band. A 110-second request reconciles past 120, gains the `extended`
sections nobody recorded, and the scale drops back below 1.0 — so every narrated section is clipped
again *and* there are silent sections. Worse than where you started.

**The sum is not a fixed point.** The new total sums the sections kept at the *old* target, but
raising the target changes which sections are kept.

**Pick the tiers from the length that was asked for, not from the reconciled total.** If the film's
code ties the two together, cap instead:

1. Compute the reconciled total.
2. **If it crosses a boundary** (60 or 120), keep the tiers of the requested length, and let the
   total run past the boundary without re-selecting.
3. Re-check for clipping.
4. **Still does not fit?** Say so and offer the honest choice:

   > Spoken, this comes to about two and a half minutes — past what this version covers. I can
   > either add the extra material and make it a proper two-minute-plus video, or trim a couple
   > of sentences to keep it under. Which would you rather?

   Going up a tier is legitimate if they agree — but then **the new sections need narration
   too**: more requests from the day's quota, or another recording session.

### If they want the original length

That means cutting material, and shortening a line goes back through the interview's script gate —
they approved specific words. With their own recording it also means recording again. **Do not speed
up the delivery**; it makes the narration harder to follow, which is the one thing the video exists
to avoid.

## Placing it

**Keep the placement in data, not in JSX.** One map, read by the scenes, says which clip plays in
which section — so moving a line is an edit to one entry in one place. There is no shared module for
this in `src/`; write it per film, beside the film's code:

```ts
// src/<film>/narration.ts
export const NARRATION: Record<string, string> = {
  hook: "assets/<project>/audio/line-01.wav",
  demand: "assets/<project>/audio/line-02.wav",
  // ...
};
```

```tsx
import { Audio } from "@remotion/media";
import { Sequence, staticFile } from "remotion";

const LEAD_IN = 3; // frames

<Sequence name={section.id} from={from} durationInFrames={durationInFrames} layout="none">
  {/* the section's picture */}
  {NARRATION[section.id] ? (
    <Sequence from={LEAD_IN} layout="none">
      <Audio src={staticFile(NARRATION[section.id])} />
    </Sequence>
  ) : null}
</Sequence>
```

The clips come from `scripts/build-audio.mjs`, already trimmed, levelled and faded. If the film plays
slices of a long file instead, each entry carries the file and its two trim points, and the fade goes
on the `<Audio>` — `splitting.md` has that code.

**If the film has a score, the timing lives in its timeline file.** Section lengths, and the ducks
under each spoken line, go in `src/<film>/timeline.json`, read through `src/lib/timeline.mjs` by both
the scenes and the score — see `scoring-music`. Do not keep a second copy of the section lengths
beside the narration map; typed twice, they drift.

**Keep the map optional.** A video with no narration must still render — the normal case on a
fresh clone with no key and no recording — and `building-a-video` treats it as a supported outcome.

**Give each line a small lead-in.** Starting audio on the exact first frame of a section, at
the same instant the figure begins drawing, sounds abrupt. Two or three frames in is enough.

## Levels

From an earlier film's mix, after a round of feedback that the voice was too loud:

| | Target RMS | |
| --- | --- | --- |
| Voice | **−24 dB** | |
| Sound effects | **−26 dB** | Below the voice, so narration stays intelligible |
| Peak ceiling | **−3 dB** | Nothing clips |

These are starting points, not a final balance.

**`scripts/build-audio.mjs` applies them** to every clip it cuts, for any film:
`node scripts/build-audio.mjs --cues <cues.json> --src <dir> --out <dir>`. `splitting.md` has the
cues file. A slice trimmed at render time is not levelled; set its `volume` by hand.

## Fades — the click nobody can name

**Every clip needs a short fade at both edges.** A cut landing mid-waveform is a step
discontinuity, and it is heard as a click. Even 10ms removes it without being audible as a
fade.

An earlier film's first pass used 12ms in and 25ms out, and the feedback was that the narration
was *"scratchy and a bit abrupt with cuts when it starts and when it stops."* It settled on
45ms in and 110ms out — **the fades `build-audio.mjs` applies**, sample-accurately, to every clip it
cuts. Those clips need nothing more.

**Those numbers do not transfer to Remotion.** For a slice trimmed at render time, the `volume`
callback is evaluated in ~83ms blocks, so 45ms is a single step. **Use 12 frames in and 15 out** —
`splitting.md` has the measurements and the code.

**An interruption is the exception.** A line that is meant to be cut off should stop dead;
keep a hard ~15ms tail there (`fadeOut` on that cue).

## Captions stay on

Narration does not replace captions. ASU requires captions on video shown to students,
employees or the public — see `asu-visual-style/accessibility.md`.

**Captions come from the script text**, so the words cannot drift apart and there is nothing to
transcribe. For generated speech, the script is also what the voice was given; for a recording, it
is what the person read — check the listen-through notes for anything they changed.

**The script line is not the prompt.** A generation prompt is a director's note plus two to four
sections' narration joined together — see `generating.md`. Treating one section's narration as one
prompt means one API call per section, which is exactly the quota mistake batching exists to avoid.

**Align captions to each line's measured span.** With one clip per line, every line's start and
length are known: the frame it is placed on, and the length `build-audio.mjs` reported. Spread that
line's caption chunks across that span, weighted by length — not across the whole section, where
the audio starts a few frames late and may end well early. That is much closer than per-section
timing. It is still not word-synced, so do not claim it is.

## Rendering with audio

```bash
npx remotion render <Id> out/<project>.mp4              # any audio: narration, score, effects
npx remotion render <Id> out/<project>.mp4 --muted      # no audio at all
```

**Use `--muted` only when the film has no audio at all** — no voice, no score, no effects. A silent
film with a score is not muted. Without any audio, Remotion otherwise adds a silent stereo AAC
track: on a 60-second video that is about 2.4MB of a 4.0MB file, and it pushes the container
duration past the exact length everything else works to hit.

## Before you call it done

- [ ] Generated speech: `tts-verify.mjs` run, transcript read line by line against the script.
      A recording: listened through against the script, line count matched, the person confirmed
- [ ] Every section's audio measured against its planned duration, and any overrun reconciled
- [ ] The whole video played through once — a clipped word is obvious and only audible
- [ ] Every clip faded at both edges — by `build-audio.mjs`, or 12 frames in and 15 out on a
      render-time slice
- [ ] The total was raised along with the section seconds, and the tiers did not change
- [ ] Captions still on, spread across each line's measured span
- [ ] One voice used throughout — one model, or one recording session
- [ ] On-screen words stay within what the narration says

**Then report facts.** It generated or was split, the check passed, here is the length. Whether it
*sounds* right is theirs to say.

## Measurements

Dated as taken. Re-measure for the voice in front of you.

- **2026-09-22** — the generated voice shipped on the topic packs (Rasalgethi): 95 wpm counting
  allotted clip time, about 107 counting pure speech, the two longest lines at 87 and 105. The
  packs' 60-second cuts, written at 136–150 wpm, spoke in 80–88 s including a 3 s title
  (`building-a-video/topics/README.md`).
- **2026-10-20** — one reader reading their own script (a test-run stand-in): 95 words in 43.4 s of
  speech, about 131 wpm overall and 136–176 wpm per line. One reader; the 130–160 wpm range above is
  a common range for read speech, not a measurement of this workspace's users.
