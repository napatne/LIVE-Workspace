# Structure and timing

How a script becomes a timeline, and how one script serves any requested length.

> **Speaking rate: about 100 wpm, not 150.** The 150 wpm in the topic-pack README is a
> *writing budget* for fitting words to a section. Measured against this project's own shipped
> narration the real delivered rate is **~100 wpm** (95 counting allotted clip time, ~107
> counting pure speech). A cold agent computed a script's spoken length at 150 and concluded a
> 45-second video would be two-thirds silence; at the measured rate it was not. **Use 100 wpm
> whenever you are reasoning about how long something will actually sound.**

## Contents

- [The script is data](#the-script-is-data) — the `Section` and `Figure` shapes
- [The three versions](#the-three-versions) — tiers, and what plays at each length
- [Turning that into frames](#turning-that-into-frames) — `planSections`, scale, dropped sections
- [Deriving the duration](#deriving-the-duration) — `calculateMetadata`, never a typed total
- [The contracts between the shared pieces](#the-contracts-between-the-shared-pieces)
- [Assembling](#assembling)
- [Laying out a section](#laying-out-a-section) — what any layout must prove
- [The title card](#the-title-card) · [One thing not to "fix"](#one-thing-not-to-fix) · [The end card](#the-end-card)
- [No voice means no audio track](#no-voice-means-no-audio-track)
- [Motion](#motion)

**Timing and tier arithmetic here are utilities to call. Layout and motion are yours to
decide per video** — this file says what a layout has to satisfy, never what it looks like.

## The script is data

Write `sections.ts` first. Everything else derives from it.

**These types live in `shared/types.ts`, not in a topic folder.** `shared/plan.ts` consumes a
`Section`, so a topic-local declaration would force explainer two to import out of explainer
one — the exact drift `shared/` exists to prevent.

```ts
// shared/types.ts
export type Tier = "core" | "standard" | "extended";

/**
 * What each beat's picture IS, as data — not what it looks like.
 *
 * This union names the shapes that happen to recur, so a script can say "this
 * beat is a comparison" without saying how comparisons are drawn. **Rendering
 * is per video** and comes from the style decision; two videos can share this
 * union and look nothing alike.
 *
 * **Extend it whenever a script needs a shape that is not here.** It is a
 * convenience for reuse, not a closed vocabulary, and an earlier version that
 * read as closed had agents substituting a flow chart for a colour wheel
 * rather than adding a case. A shape only one subject could ever want belongs
 * in that video's own folder, passed in, so shared code never imports from one
 * topic.
 */
export type Figure =
  | { type: "cycle"; nodes: string[] }
  | { type: "flow"; steps: string[] }
  | { type: "bars"; items: { label: string; value: number }[] }
  | { type: "bell"; bands?: boolean }
  | {
      type: "crossing";
      rising: string;
      falling: string;
      pointLabel?: string;
      xLabel?: string;
      yLabel?: string;
    }
  | { type: "image"; src: string; alt: string };

export type Section = {
  id: string;
  tier: Tier;
  seconds: number;
  heading?: string;
  /** Spoken and shown as the caption. Exactly the words approved at the interview's step 6. */
  narration: string;
  /**
   * The silent-with-no-captions case only (workflow step 3, "no" to words on
   * screen). Two or three words per entry — the labels that appear instead of
   * the sentence. `narration` still holds the approved sentence as the record
   * of what the beat means, but with captions off nothing renders it.
   */
  onScreen?: string[];
  figure?: Figure;
  bullets?: string[];
};
```

> **Why `onScreen` exists.** A cold run took the silent, no-captions branch and found the type
> could not hold the result: `narration` is documented as the caption text and renders nowhere
> when captions are off, and the only other candidate — `bullets` — is described in this same
> file as unproven and means something else. The branch was reachable from the workflow before
> anything could carry it. **Do not overload `narration` with phrases**; the approved sentence
> has to survive somewhere, because it is what the person agreed to at the interview's step 6.

> **`bullets` without a `figure` leaves a hole, and the types will not stop you.** Both fields
> are optional and independent, so a section carrying only bullets compiles, lints, and renders
> with the figure area — about 600px of the frame — completely empty. It looks broken and
> nothing warns. **Give every section a figure, or lay the section out differently when there
> isn't one**; do not leave the figure slot reserved and unfilled.

### Timing when there is no voice and no captions

**Keep the written seconds exactly as they are, and treat them as hold time for the picture.**

The section seconds are a *reading* budget at 150 wpm. Strip the captions and there is
nothing to read and nothing to speak, so the number loses its basis — but do not recompute it:

- `planSections` derives everything from those numbers, and the 30/60/120 arithmetic only
  closes if they are untouched.
- Re-timing a shipped pack inside someone's session is authoring a pack while they wait, which
  `.agents/skills/building-a-video/topics/README.md` forbids.
- The time is not empty. The animation that replaced the words fills it.

**Then look at it before rendering.** The beat that had the most words to read is the one most
likely to drag now that it has three. If it does, move seconds from it into a neighbour and
**tell the person you did** — do not silently re-time an approved plan.

```ts
// sections.ts, continued
export const TITLE = "What is Photosynthesis?";
export const SUBTITLE = "How plants build themselves out of light";

export const SECTIONS: Section[] = [
  {
    id: "hook",
    tier: "core",
    seconds: 6,
    narration:
      "Every plant you have ever seen built itself, mostly out of air and sunlight.",
    figure: { type: "flow", steps: ["Light", "Leaf", "Growth"] },
  },
  // ...
];
```

**Never reword the narration while building.** The person approved specific sentences. If one
does not fit, go back and ask — do not quietly edit it.

## The three versions

The topic scripts in `.agents/skills/building-a-video/topics/` come in tiers that add up exactly. A version plays
whole sections at their written pace, so nothing is raced and no sentence is deleted.

| Asked for | Plays | Section time | + title | Total |
| --- | --- | --- | --- | --- |
| 30 seconds | `core` | 27s | 3s | **30s** |
| 60 seconds | `core` + `standard` | 57s | 3s | **60s** |
| 120 seconds | all three | 117s | 3s | **120s** |

**In between, play the nearest version down and hold each scene longer.** 45 seconds is the
30-second version slowed; 90 seconds is the 60-second version slowed.

**30 seconds is the floor.** Below it, fitting the length means racing the narration or
deleting sentences. The `building-a-video` skill step 2 tells the agent to offer something honest
instead.

### Writing your own script to these tiers

"Use the same shape" is not enough to act on. The three shipped scripts are all built to the
same budget, and a new one should match it:

| Tier | Section time | Sections | Roughly |
| --- | --- | --- | --- |
| `core` | **27s** | 4–5 | ~68 words |
| `standard` | **30s** | 3 | ~75 words |
| `extended` | **60s** | 5 | ~150 words |

Plus the 3-second title card, that gives **30 / 60 / 120 seconds exactly**.

**Write `core` first, and read it back on its own.** It is the whole video at 30 seconds, so it
has to stand up unaided — a hook, the explanation, a one-line recap. If it only makes sense
with the later tiers attached, the material is in the wrong place.

**`standard` is what you would add given a normal minute:** an example, the scale of it, why it
matters.

**`extended` is depth for two minutes:** mechanism, edge cases, history, caveats. Nothing here
may be load-bearing — the 30- and 60-second versions never show it.

**Check the arithmetic before building.** The tiers must sum to 27 / 30 / 60. If they do not,
the version the person asked for will not land on the number they gave you.

**Growing an existing script for a longer request means writing new material**, not stretching
the old. If someone moves 60 → 90 seconds, that is the 60-second version held slightly longer.
60 → 120 means the `extended` tier actually has to exist.

## Turning that into frames

Pure function, so `calculateMetadata` and the component derive identical timings from the same
input. **The duration is never typed by hand.**

```ts
const FPS = 30;
// Matches `titleSeconds` in the topic scripts' frontmatter. If you ever change
// one, change both — nothing reads the frontmatter value automatically, so it
// is a number that looks authoritative and is inert.
const TITLE_SECONDS = 3;
const MIN_SECTION_FRAMES = 36; // below this nothing is readable

const TIERS: Record<number, Tier[]> = {
  30: ["core"],
  60: ["core", "standard"],
  120: ["core", "standard", "extended"],
};

/** The largest written version that fits inside the target. */
const versionFor = (targetSeconds: number): Tier[] => {
  const cuts = [120, 60, 30];
  for (const c of cuts) {
    if (targetSeconds >= c) return TIERS[c];
  }
  return TIERS[30];
};

/**
 * The 30-second floor is a real constraint, not advice. `targetSeconds` is a
 * free input prop, so a stray 20 would otherwise scale `core` to 0.63 and race
 * every line. Clamp it here — prose in a document cannot stop a prop.
 */
const FLOOR_SECONDS = 30;

// shared/plan.ts — takes `sections` as a PARAMETER. It cannot close over a
// topic's SECTIONS constant, because it lives in shared/ and serves every topic.
export const planSections = (sections: Section[], rawTargetSeconds = 60) => {
  const targetSeconds = Math.max(FLOOR_SECONDS, rawTargetSeconds);
  const tiers = versionFor(targetSeconds);
  const kept = sections.filter((s) => tiers.includes(s.tier));
  const dropped = sections.filter((s) => !tiers.includes(s.tier));

  const keptSeconds = kept.reduce((t, s) => t + s.seconds, 0);
  // Stretch the chosen version to land on the number exactly. Because the
  // version was chosen to fit, this only ever slows things down slightly —
  // it never compresses narration.
  const scale =
    keptSeconds === 0 ? 1 : (targetSeconds - TITLE_SECONDS) / keptSeconds;

  const titleFrames = Math.round(TITLE_SECONDS * FPS);
  let cursor = titleFrames;
  const planned = kept.map((section) => {
    const durationInFrames = Math.max(
      MIN_SECTION_FRAMES,
      Math.round(section.seconds * scale * FPS),
    );
    const entry = { section, from: cursor, durationInFrames };
    cursor += durationInFrames;
    return entry;
  });

  // Report BOTH clamps. requestedFrames must come from the RAW request, not
  // the already-floored one — otherwise asking for 20 seconds returns 900
  // frames with clamped:false and the person is never told their number was
  // overridden.
  const requestedFrames = Math.round(rawTargetSeconds * FPS);
  return {
    titleFrames, planned, totalFrames: cursor, dropped,
    requestedFrames,
    flooredTo: targetSeconds !== rawTargetSeconds ? targetSeconds : null,
    // Per-section Math.round accumulates, so the tolerance has to scale with
    // the section count. At one frame, a 12-section script reports
    // clamped:true at dozens of ordinary lengths with nothing clamped.
    // Measured: 18 of 151 integer targets and 451 of 4000 fractional ones.
    clamped:
      Math.abs(cursor - requestedFrames) > Math.ceil(kept.length / 2) + 1,
  };
};
```

**Tell the person which sections were dropped**, at the interview's step 6 when you show the script — not
sprung on them at delivery.

### The clamp can break the promise

`MIN_SECTION_FRAMES` raises any section that would fall below 36 frames, but `scale` was
computed from the unclamped totals. **If the clamp ever fires, `totalFrames` no longer equals
`targetSeconds × FPS`** and the video quietly runs longer than asked.

It does not fire at 30/60/120 for the three shipped topics, so today it is latent. It will fire
on a script with very short sections at a short target.

**The planner reports both, and they are different things.** `flooredTo` is set when the
request was below 30 seconds and got raised to the floor. `clamped` is set when
`MIN_SECTION_FRAMES` stretched an individual section.

**Do not report one as the other.** At `targetSeconds: 20` both fire — `flooredTo: 30` plus a
300-frame difference — and telling the person *"the shortest sections can't go below about a
second"* would be false. What happened is that their whole request was below the floor.

- `flooredTo` set → *"The shortest this one goes is 30 seconds, so that's what I've made."*
- `clamped` set, `flooredTo` null → *"A couple of the shortest parts needed a bit more room,
  so it's a second or two over."*
- **Both set** → lead with the floor, then the stretch: *"The shortest this one goes is 30
  seconds — and the shortest parts can't go below about a second, so it comes out at 34."*

**Say it, and render it anyway.** Do not just log it, and do not present the arithmetic as
exact when it is not.

## Deriving the duration

```tsx
export const calculateMetadata: CalculateMetadataFunction<Props> = ({ props }) => ({
  durationInFrames: planSections(SECTIONS, props.targetSeconds).totalFrames,
  fps: FPS,
});
```

```tsx
<Composition
  id="Explainer-photosynthesis"
  component={PhotosynthesisVideo}
  calculateMetadata={calculateMetadata}
  defaultProps={{ targetSeconds: 60, captions: true, theme: "asu" as const }}
  durationInFrames={1800}   // placeholder; calculateMetadata overrides it
  fps={30}
  width={1920}
  height={1080}
/>
```

**`as const` on the theme matters.** Under `strict`, a bare `theme: "asu"` widens to `string`
and will not narrow to the theme union — a compile error the example otherwise walks you into.

**This matters.** The older per-film compositions in `Root.tsx` carry hand-typed durations that
must be kept in step with the code by hand, and `AGENTS.md` flags that as a live trap. Do not
add another one.

**Verify it before rendering — but not the way that looks obvious:**

```bash
npx remotion compositions   # the printed duration must match what they asked for
```

**That check alone proves nothing.** The placeholder `durationInFrames={1800}` is *also* the
right answer for 60 seconds at 30fps, so if `calculateMetadata` silently failed the output
would be identical. Prove it runs by asking for a different length:

```bash
npx remotion compositions --props='{"targetSeconds":30}'   # must print 900, not 1800
```

If that still prints 1800, `calculateMetadata` is not wired up and every length the person
asks for will be ignored.

## The contracts between the shared pieces

**Two agents building two explainers must produce the same signatures**, or `shared/` stops
being shared. These are the ones that were being invented:

> **Resolve `theme` once, at the top of the video component**, and put the result in the context:
> `const theme = typeof t === "string" ? THEMES[t] : t;`. Everything downstream reads a `Theme`
> and never needs to know which form arrived.
>
> **A described theme still has to pass contrast.** Build the object, then compute every pair
> it produces — `asu-visual-style/accessibility.md` has the calculator. A look someone
> described in words is not exempt from being readable.

```ts
// shared/types.ts
export type ThemeName = "asu" | "neutral";

/**
 * Step 5 option 3 lets the person describe a look in their own words, so the
 * theme prop has to accept more than the two shipped names. A Theme object is
 * a valid value; `THEMES[name]` only runs for the string form.
 *
 * Without this, "you tell me the style" is a question the build cannot answer.
 * A cold run picked option 3, described a dark neon look, and found there was
 * no way to pass it.
 */
import type { Theme } from "./theme";   // defined in asu-visual-style/starter-theme.md

export type ThemeChoice = ThemeName | Theme;

export type ExplainerProps = {
  sections: Section[];
  title: string;
  subtitle?: string;
  targetSeconds?: number;
  captions?: boolean;
  theme?: ThemeChoice;
  endCardSeconds?: number;
  /** section id -> one clip. Absent means the video is silent. */
  audio?: Record<string, { src: string; from: number; to: number }>;
};
```

**The components that draw belong to the video, not to `shared/`.** Shapes worth keeping
consistent *within* one video:

```tsx
// <video>/Video.tsx - the assembly. Reads its plan from shared/plan.ts,
// then draws however this video draws.
export const Video: React.FC<VideoProps> = ({ ... }) => ...

// <video>/layout.tsx - how one section is arranged. THIS VIDEO'S answer;
// see "Laying out a section" for what any answer has to prove.
export const SectionScene: React.FC<{
  section: Section;
  durationInFrames: number;
  captions: boolean;
}> = ({ ... }) => ...

// <video>/figures/index.tsx - dispatches on figure.type.
// The SCENE computes progress and passes it down; a figure never calls
// useCurrentFrame() itself, so a review gallery can drive it too.
export const FigureView: React.FC<{
  figure: Figure;
  progress: number;
}> = ({ ... }) => ...

// <video>/figures/Gallery.tsx - every figure this video uses, full frame,
// one after another. A review tool; see step 7.
export const FigureGallery: React.FC<{ ... }> = ({ ... }) => ...
```

**Keeping a figure free of `useCurrentFrame()` is the one contract worth honouring** whatever
the style: pass `progress` in. It is what lets a review gallery hold a figure at any point, and
it costs nothing.

> **This section used to end "a topic composition should be about thirty lines — if yours is
> longer, something that belongs in `shared/` is sitting in it."** That sentence pushed every
> distinctive thing out of the video and into common code, which is how four separate builds
> arrived at four identical-looking videos. **A composition being long is not a smell.** Only
> the arithmetic belongs in `shared/`.

## Assembling

```tsx
<AbsoluteFill style={{ backgroundColor: THEME.background, fontFamily: ASU_FONT }}>
  <Sequence name="Title" durationInFrames={titleFrames} layout="none">
    <TitleCard title={TITLE} subtitle={SUBTITLE} />
  </Sequence>

  {planned.map(({ section, from, durationInFrames }) => (
    <Sequence
      key={section.id}
      name={section.id}
      from={from}
      durationInFrames={durationInFrames}
      layout="none"
    >
      <SectionScene section={section} durationInFrames={durationInFrames} />
      {audio?.[section.id] ? <Audio src={staticFile(audio[section.id])} /> : null}
    </Sequence>
  ))}
</AbsoluteFill>
```

Three things that are easy to get wrong:

- **`layout="none"`** on these sequences. The scenes position themselves absolutely, and the
  default flex wrapper fights them.
- **Name every `Sequence` and `AbsoluteFill`.** The names appear in the Studio timeline — the
  difference between a debuggable video and a wall of grey bars.
- **Keep `audio` optional.** A video with no narration must still render; do not write code
  that assumes audio exists.

## Laying out a section

**Hold a layout still within one video, and design it fresh for each video.** A viewer who has
learned where to look in your first section should not have to relearn at the second — that is
a real argument, and it is an argument about *one* video. It was previously written here as
"fixed on purpose", with exact coordinates, and the result was that four separately built
videos were identical apart from their words.

**What a layout has to prove**, whatever shape you give it:

| | |
| --- | --- |
| Nothing overlaps the caption | A tall figure must stop above it, not run under it |
| Nothing meaningful sits outside the safe margin | Labels anchored at an edge are the usual offender |
| Text clears its background at 4.5:1, meaningful shapes at 3:1 | Computed against what is *actually* behind them |
| The figure fills the space it is given | A shape sized for a different frame reads as a small island |
| Positions are derived, not typed twice | Same rule as durations — two numbers that must agree, calculate one |

**One arrangement that satisfies all of that**, from the worked explainer — a heading top-left,
the figure centred in the space between heading and caption, the caption band across the
bottom. Its one non-obvious number: **when captions are on, the figure area has to stop about
190px from the bottom rather than 120px**, or a tall diagram runs underneath the caption panel.

**Take that as evidence the constraints are satisfiable, not as the arrangement to use.** A
figure can be full-bleed with the caption over it, the picture can sit beside the text rather
than above it, a scene can carry no caption band at all. What cannot change is the column on
the right of the table above.

**`bullets` take a 110px row** directly under the figure area, centred, at `TYPE.bullet` in
`inkSoft`. **Separate them with a visible divider, not just a gap** — at 40px two bullets read
as one run-on line ("68% within one   95% within two"). Use a `·` in `gray4` between them, or
at least 120px of space. Three or fewer, and the figure area shrinks
by that much when they are present. No shipped script uses them, so treat this as the
specification rather than something proven.

## The title card

Every explainer opens with one, for **3 seconds**:

- Title in `ink`, 104px, **weight 700**, centred. **Not 900** — Arial has 400 and 700 only,
  and anything else is synthesised into a smeared approximation. See
  `asu-visual-style/typography.md`.
- **A gold rule sweeping out underneath it** — about 460px wide, 10px tall, fully rounded.
  This is the one motif carried across every video in the series; keep it.
- Subtitle below in `inkSoft`, 44px, if there is one.

## One thing not to "fix"

`tsconfig.json` sets `lib: ["es2015"]`, and the planner above uses `Array.prototype.includes`,
which is ES2016. **It compiles fine here** — the transitive types widen the lib. Verified by
building against it, not assumed.

Do not rewrite it as `indexOf` to pre-empt an error that does not happen.

## The end card

`asu-visual-style/logo.md` says "default placement: the end card", so one has to exist for
that to mean anything.

**Add one only when there is something to put on it** — a logo, or a closing line the script
asks for. A video that has neither should end on its recap, not on a blank card.

When you do add one:

- **2 seconds**, after the last section, and its frames come **out of the section budget** —
  bolting them on afterwards turns a 60-second video into 62.

  `planSections` needs a parameter for it, since whether a video has an end card is a
  per-topic decision:

  ```ts
  export const planSections = (
    sections: Section[],
    rawTargetSeconds = 60,
    endCardSeconds = 0,
  ) => {
    // ...
    const scale = (targetSeconds - TITLE_SECONDS - endCardSeconds) / keptSeconds;
    // ... and after the section loop:
    const endCardFrames = Math.round(endCardSeconds * FPS);
    const endCardFrom = cursor;
    cursor += endCardFrames;
  ```

  Return `endCardFrom` and `endCardFrames` alongside the rest so the composition can place it.
- **Same background** as everything else. Nothing else on it but the thing it is carrying.
- **If it holds a logo**, its isolation zone is the whole point of using an end card — nothing
  else competes, so the rule satisfies itself. Half the sunburst's height clear on all four
  sides.
- **Fade in over 10–12 frames and hold.** Do not animate the logo's shape.
- Because it comes out of the same budget, a 60-second video with an end card is still 60
  seconds — the sections give up 2s between them. Nothing to warn the person about.

## No voice means no audio track

Remotion adds a **silent stereo AAC track by default**. On a 60-second video that is about
2.4MB of a 4.0MB file — 60% of the deliverable is silence — and it pushes the container
duration to 60.053s, which quietly breaks the exact-length guarantee everything above works to
establish.

**If the person said no to a voice, render muted:**

```bash
npx remotion render <Id> out/<slug>.mp4 --muted
```

Measured on a real build: 4.0MB with the silent track, **1.6MB muted**, and the container
duration lands on exactly 60.000000s instead of 60.053333s.

## Motion

- **Everything derives from `useCurrentFrame()`.** No CSS transitions, ever.
- **Entrances are 8–12 frames.** Slower feels sluggish at this length.
- `spring()` for anything physical — a title landing. `interpolate()` with
  `Easing.inOut(Easing.cubic)` for anything travelling.
- **Always clamp**: `extrapolateLeft: "clamp", extrapolateRight: "clamp"`. Without it, values
  run past the end of the range and shapes fly off screen.
