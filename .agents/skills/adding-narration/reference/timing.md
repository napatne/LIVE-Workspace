# Fitting narration to the video

## Speaking rate — the number everything else depends on

**Narration delivers about 100 words per minute.** Measured from this project's own shipped
Rasalgethi output: 95 wpm counting allotted clip time, ~107 counting pure speech, and the two
longest lines — the ones that actually overrun a section — at 87 and 105.

**The packs are written to 150 wpm.** That is a sound budget for *reading captions*. It is not
what the voice does.

**So a narrated video runs roughly 50% longer than its written seconds**, and essentially every
section overruns. That is expected, it is not a mistake in the script, and the reconciliation
below is how it is handled.

> Earlier versions of this file and the pack README said 137 wpm. Measured against the repo's
> own audio that is about 44% optimistic.

## The mistake that costs a rebuild

**An explainer's section durations are decided before the narration exists.** `sections.ts`
declares `seconds: 14`, `planSections` turns that into frames, and `calculateMetadata` derives
the total — all from numbers written by hand against a 150-words-per-minute estimate.

**Then the audio comes back and it is not 14 seconds.**

The Lexi Mentors film hit exactly this. A round of script changes went in, narration was
regenerated, and **all three character scenes turned out too short for the new audio.** What
looked like a wording change silently required three footage re-times, and it cost most of a
session.

**So: measure the audio and reconcile it before you build anything.**

## Reconciling

Measure each section's audio and compare against its planned `seconds`:

```
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

`planSections` renormalises: `scale = (targetSeconds - 3) / Σ kept seconds`. **Widen a section
and you grow the denominator, so every other section is squeezed to pay for it and the total
stays pinned where it was.**

Run against a real 60-second script, widening the three overrunning sections and leaving
`targetSeconds` at 60:

```
demand       gets  7.33s, audio is  7.4s   CLIPPED
supply       gets  7.80s, audio is  7.9s   CLIPPED
shift        gets 10.33s, audio is 10.6s   CLIPPED  ← this one fitted before
```

**Three sections clipped, one of them newly.** And the total never moves, so the "it comes out
longer, alright?" conversation can never happen.

### What to actually do

**Raise the section seconds AND `targetSeconds` together.**

1. For each section, `new = max(planned, measured + 0.4)`. The 0.4 covers the 2–3 frame lead-in
   plus a tail so no consonant is clipped.
2. Set `targetSeconds = 3 + Σ new`. That puts `scale` back on exactly 1.0, so every section
   plays its written length.

Same script, done properly: `scale` back to **1.0000**, **0 sections clipped**.

**Expect a big jump, not a small one.** The worked numbers above are illustrative. At the real
100 wpm rate, a 60-second request reconciles to **around 95–100 seconds**. Tell them that
honestly:

> With the voice on it this runs a lot longer than the written version — about a minute and a
> half rather than a minute. Speech is slower than reading. Nothing's cut and none of the
> wording changes. Alright, or shall I trim it back to fit a minute?

**If they want the original length, that means cutting material**, which goes back through the
the interview's step 6 script gate. Do not speed the delivery up.

### Crossing a tier boundary — common, not an edge case

`targetSeconds` feeds `versionFor()`, which picks the tier set **by threshold**. Raising it can
cross 60 or 120 and pull in a whole tier of sections **that have no audio at all**.

**Because narration runs ~50% long, this fires for most requests between about 76 and 120
seconds.** It is not a narrow band. A 110-second request reconciles past 120, gains five
`extended` sections nobody recorded, and `scale` drops back below 1.0 — so every narrated
section is clipped again *and* there are silent sections. Worse than where you started.

**The formula is not a fixed point.** `targetSeconds = 3 + Σ new` sums the sections kept at the
*old* target, but raising the target changes which sections are kept.

**Do this instead — cap at the tier boundary:**

1. Compute the prescribed `targetSeconds = 3 + Σ new`.
2. **If it crosses a boundary** (60 or 120), do **not** use it. Set `targetSeconds` to the
   boundary minus 0.1 — e.g. **119.9** — so the tier stays as it was.
3. Re-run the planner. `scale` will now be slightly under 1.0, so re-check for clipping.
4. **Still clipped?** The script genuinely does not fit under that boundary with narration. Say
   so and offer the honest choice:

   > Spoken, this comes to about two and a half minutes — past what this version covers. I can
   > either add the extra material and make it a proper two-minute-plus video, or trim a couple
   > of sentences to keep it under. Which would you rather?

   Going up a tier is legitimate if they agree — but then **the new sections need narration
   generating too**, which is more requests from the day's quota.

### If they want the original length

Shortening a line means going back through the interview's step 6 script gate — they approved specific
words. **Do not speed up the delivery**; it makes the narration harder to follow, which is the
one thing the video exists to avoid.

## Placing it

Keep the placement in data, not in JSX. The Lexi film uses one JSON file as the single source
of truth for every cue, read by both the build script and the composition — so moving a sound
is an edit to one number in one place.

For an explainer it is simpler, because narration is per section:

A section's audio is **a batch file plus two trim points**, because nothing is cut into
separate files — see [splitting.md](splitting.md):

```ts
// in sections.ts, beside the script
export const AUDIO: Record<string, { src: string; from: number; to: number }> = {
  hook:   { src: "assets/<slug>/audio/batch-a.wav", from: 0.12, to: 4.30 },
  demand: { src: "assets/<slug>/audio/batch-a.wav", from: 5.20, to: 12.60 },
  // ...
};
```

```tsx
<Sequence name={section.id} from={from} durationInFrames={durationInFrames} layout="none">
  <SectionScene section={section} durationInFrames={durationInFrames} />
  {clip ? (
    <Audio
      src={staticFile(clip.src)}
      trimBefore={Math.round(clip.from * fps)}
      trimAfter={Math.round(clip.to * fps)}
      volume={fade}
    />
  ) : null}
</Sequence>
```

**Keep the map optional.** A video with no narration must still render — that is the normal
case on a fresh clone with no API key, and the `building-a-video` skill treats it as a supported
outcome.

**Give each line a small lead-in.** Starting audio on the exact first frame of a section, at
the same instant the figure begins drawing, sounds abrupt. Two or three frames in is enough.

## Levels

From the Lexi film's mix, after a round of feedback that the voice was too loud:

| | Target RMS | |
| --- | --- | --- |
| Voice | **−24 dB** | |
| Sound effects | **−26 dB** | Below the voice, so narration stays intelligible |
| Peak ceiling | **−3 dB** | Nothing clips |

These are starting points, not a final balance.

**`scripts/build-audio.mjs` does not apply them for you.** It is hardcoded to the Lexi film's
paths and takes no arguments, so it cannot process an explainer. Apply the levels and fades
with Remotion's `volume` callback instead — [splitting.md](splitting.md) has the code and the
exact fade values.

## Fades — the click nobody can name

**Every clip needs a short fade at both edges.** A cut landing mid-waveform is a step
discontinuity, and it is heard as a click. Even 10ms removes it without being audible as a
fade.

The Lexi film's first pass used 12ms in and 25ms out, and the feedback was that the narration
was *"scratchy and a bit abrupt with cuts when it starts and when it stops."* It settled on
45ms in and 110ms out — **but those are `build-audio.mjs` numbers, and that script processes
samples.**

**They do not transfer to Remotion.** The `volume` callback is evaluated in ~83ms blocks, so
45ms is a single step. **Use 12 frames in and 15 out** — [splitting.md](splitting.md) has the
measurements and the code.

**An interruption is the exception.** A line that is meant to be cut off should stop dead;
keep a hard ~15ms tail there.

## Captions stay on

Narration does not replace captions. ASU requires captions on video shown to students,
employees or the public — see `asu-visual-style/accessibility.md`.

**Both come from the same `narration` field**, so the words cannot drift apart and there is
nothing to transcribe.

**The field is not the prompt.** A prompt is a director's note plus two to four sections'
narration joined together — see [generating.md](generating.md). Treating one section's
`narration` as one prompt means one API call per section, which is exactly the quota mistake
batching exists to avoid.

**Timing can still drift even when the words match.** Captions are spread across the section's
frames; the audio starts a couple of frames late and may end early. Nothing currently aligns
them. Low stakes for an explainer, but do not claim they are frame-synced.

## Rendering with audio

```bash
npx remotion render <Id> out/<slug>.mp4              # with narration
npx remotion render <Id> out/<slug>.mp4 --muted      # no voice
```

**Use `--muted` when there is no narration.** Remotion otherwise adds a silent stereo AAC
track: on a 60-second video that is about 2.4MB of a 4.0MB file, and it pushes the container
duration past the exact length everything else works to hit.

## Before you call it done

- [ ] `tts-verify.mjs` run, transcript read line by line against the script
- [ ] Every section's audio measured against its planned duration, and any overrun reconciled
- [ ] The whole video played through once — a clipped word is obvious and only audible
- [ ] Every clip has fades at both edges — **12 frames in, 15 out**, built on `clipFrames`
- [ ] `targetSeconds` was raised along with the section seconds, and the tier did not change
- [ ] Captions still on
- [ ] One model used throughout

**Then report facts.** It generated, verification passed, here is the length. Whether it
*sounds* right is theirs to say.
