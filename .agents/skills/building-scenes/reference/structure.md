# Structure and timing

How a script becomes a timeline, and how one script serves any requested length.

**These are patterns to write per film, not code that exists.** `shared/types.ts`,
`shared/plan.ts`, `planSections`, `useTheme`, `TitleCard` and `SectionScene` are not in `src/` —
nothing below can be imported. Write the pieces this film needs, in the film's own folder
(`src/<film>/`). Earlier builds that followed these files wrote 1,100–1,400 lines before their
first frame. The one piece of shared timing code that does exist is `src/lib/timeline.mjs`, for
films with a score — see
[A scored film reads its lengths from the timeline](#a-scored-film-reads-its-lengths-from-the-timeline).

> **Speaking rate: measure the voice you have.** The 150 wpm in the topic-pack README is a
> *writing budget* for fitting words to a section, not a speaking rate. The one text-to-speech
> voice this project measured delivered about **100 wpm** (95 counting allotted clip time, ~107
> counting pure speech). That is one voice's rate, not a rule — a different voice, or a person
> reading, will differ. A cold agent computed a script's spoken length at 150 and concluded a
> 45-second video would be two-thirds silence; at the measured rate it was not. **Reason about
> how long something will sound from the measured rate of the voice actually being used**, and
> measure it from the first generated or recorded line.

## Contents

- [The script is data](#the-script-is-data) — the `Section` and `Figure` shapes
- [The three versions](#the-three-versions) — tiers, and what plays at each length
- [Turning that into frames](#turning-that-into-frames) — `planSections`, scale, dropped sections
- [Deriving the duration](#deriving-the-duration) — `calculateMetadata`, never a typed total
- [A scored film reads its lengths from the timeline](#a-scored-film-reads-its-lengths-from-the-timeline)
- [The contracts between the shared pieces](#the-contracts-between-the-shared-pieces)
- [Assembling](#assembling)
- [Laying out a section](#laying-out-a-section) — what any layout must prove
- [The title card](#the-title-card) · [One thing not to "fix"](#one-thing-not-to-fix) · [The end card](#the-end-card)
- [No audio at all means no audio track](#no-audio-at-all-means-no-audio-track)
- [Motion](#motion)

**Timing and tier arithmetic here are utilities to call. Layout and motion are yours to
decide per video** — this file says what a layout has to satisfy, never what it looks like.

## The script is data

Write `sections.ts` first. Everything else derives from it.

**Put these types beside the planner that consumes them, not inside one topic's script.** With
one explainer, that is the film's own `shared/types.ts`. When a second explainer wants the same
planner, move both up to `src/shared/` — otherwise explainer two imports out of explainer one,
which is the drift a shared folder exists to prevent. Neither folder exists until you write it.

```ts
// shared/types.ts — to be written; not in src/
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
  /** Spoken and shown as the caption. Exactly the words the person approved in the script. */
  narration: string;
  /**
   * The silent-with-no-captions case only (no voice, and "no" to words on
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
> has to survive somewhere, because it is what the person agreed to when they approved the script.

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
deleting sentences. `building-a-video` tells the agent to offer something honest instead.

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

// shared/plan.ts (to be written) — takes `sections` as a PARAMETER. It cannot
// close over a topic's SECTIONS constant, because it serves every topic.
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

**Tell the person which sections were dropped** when you show them the script — not
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
// src/<film>/Registrations.tsx — Root.tsx imports this file and places it.
// WIDTH, HEIGHT and FPS are this film's constants, set from the shape the brief
// recorded (16:9 1920×1080, 9:16 1080×1920, square 1080×1080). Never type them here.
<Composition
  id="Photosynthesis"
  component={PhotosynthesisVideo}
  calculateMetadata={calculateMetadata}
  defaultProps={{ targetSeconds: 60, captions: true, theme: THEME_CHOICE }}
  durationInFrames={1800}   // placeholder; calculateMetadata overrides it
  fps={FPS}
  width={WIDTH}
  height={HEIGHT}
/>
```

`THEME_CHOICE` is whatever the style card produced — a theme object built from the card, or
`"asu" as const` only when the person chose the ASU brand. **The brand is opt-in**; nothing here
defaults to it.

**`as const` on a theme name matters.** Under `strict`, a bare `theme: "asu"` widens to `string`
and will not narrow to the theme union — a compile error the example otherwise walks you into.

**This matters.** A hand-typed `durationInFrames` has to be kept in step with the code by hand,
and the two drifting is how a composition cuts off its own last frame. Import or derive every
length; never type one.

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

## A scored film reads its lengths from the timeline

`planSections` returns frames in memory. **The score cannot read memory.** It reads one JSON file,
`src/<film>/timeline.json`, through `src/lib/timeline.mjs` — the one piece of shared timing code
that exists in `src/`. So a film with music keeps its section lengths, transitions, hit points,
ducks and silences in that file, and **the scenes read their lengths from it too.** One number
per length, read by both sides; typed in a scene as well, picture and music drift apart and the
music lands late on every cut after the first change.

```tsx
import timelineJson from "./timeline.json";
import { resolveTimeline } from "../lib/timeline.mjs";

export const TIMELINE = resolveTimeline(timelineJson);
// In Registrations.tsx: durationInFrames={TIMELINE.total}
// In the master:        <Sequence durationInFrames={TIMELINE.frames("theme")}> …
// In a scene:           const TURN = TIMELINE.local("turn", "theme"); // a hit, in the scene's own frames
```

Rules that come with it:

- **The timeline replaces per-scene length constants; it does not sit beside them.** A scene
  that declares its own number and also appears in the timeline has two lengths.
- **No section or hit is named `end`.** `end` means one past the last frame of the film, and the
  resolver refuses the name.
- **No name ends in a hyphen and digits** (`scene-2`, `beat-10`). `-2` reads as an offset of two
  frames, so the resolver refuses those too. Use `scene-two`, `close`, `title-card`. Names hold
  only letters, digits, `_` and `-`, and a hit cannot share a section's name.
- **One person edits `timeline.json` at a time.** Every scene and the score read it, so it is a
  shared file in the same sense as the theme.
- **A tiered explainer with a score** writes the planner's result into the timeline: run
  `planSections` for the length the person chose, write each kept section's frames into
  `timeline.json`, and build from the file. Changing the length then means regenerating the
  file and rebuilding the score, not changing a prop.

The full shape of the file, the position grammar (`"theme+144"`, `"theme.end"`) and the
transitions are in `scoring-music` → `reference/writing-a-score.md`. A film with no music
does not need a timeline.

## The contracts between the shared pieces

**Two agents building two explainers must produce the same signatures**, or a shared folder
stops being shared. None of these exists in `src/` yet; they are the ones that were being
invented, so write them to these shapes:

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
 * Most looks come from a style card, not from a shipped name, so the theme
 * prop has to accept more than the two names. A Theme object is a valid value
 * — and the usual one; `THEMES[name]` only runs for the string form.
 *
 * Without this, a described look is one the build cannot take. A cold run
 * described a dark neon look and found there was no way to pass it.
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
// one after another. A review tool; explainer-architecture.md, build step 7.
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
import { AbsoluteFill, Sequence, staticFile } from "remotion";
import { Audio } from "@remotion/media";
// TitleCard and SectionScene are this film's own components — written per
// video, from its style card. FONT is the family the style card names, loaded
// once (Arial only when the ASU brand was chosen).

<AbsoluteFill style={{ backgroundColor: theme.background, fontFamily: FONT }}>
  {titleFrames > 0 ? (
    <Sequence name="Title" durationInFrames={titleFrames} layout="none">
      <TitleCard title={TITLE} subtitle={SUBTITLE} />
    </Sequence>
  ) : null}

  {planned.map(({ section, from, durationInFrames }) => (
    <Sequence
      key={section.id}
      name={section.id}
      from={from}
      durationInFrames={durationInFrames}
      layout="none"
    >
      <SectionScene section={section} durationInFrames={durationInFrames} />
      {audio?.[section.id] ? <Audio src={staticFile(audio[section.id].src)} /> : null}
    </Sequence>
  ))}
</AbsoluteFill>
```

`<Audio>` comes from `@remotion/media`, which is in `package.json` and is what the vendored
Remotion guidance (`remotion-markup/audio.md`) recommends. The `remotion` package also exports
an `Audio`; use the `@remotion/media` one. How a clip is trimmed and placed is
`adding-narration`'s business.

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
| Nothing meaningful sits outside the safe margin | Labels anchored at an edge are the usual offender. Upright and square: the platform safe box in [upright.md](upright.md) |
| Text clears its background at 4.5:1, meaningful shapes at 3:1 | Computed against what is *actually* behind them |
| The figure fills the space it is given | A shape sized for a different frame reads as a small island |
| Positions are derived, not typed twice | Same rule as durations — two numbers that must agree, calculate one |

**One arrangement that satisfies all of that**, from an earlier 1920×1080 explainer — a heading
top-left, the figure centred in the space between heading and caption, the caption band across
the bottom. Its one non-obvious number: **when captions are on, the figure area has to stop about
190px from the bottom rather than 120px**, or a tall diagram runs underneath the caption panel.
That number is for that wide frame; an upright frame's caption sits above the platform's own UI
([upright.md](upright.md)).

**Take that as evidence the constraints are satisfiable, not as the arrangement to use.** A
figure can be full-bleed with the caption over it, the picture can sit beside the text rather
than above it, a scene can carry no caption band at all. What cannot change is the column on
the right of the table above.

**`bullets` take a 110px row** directly under the figure area, centred, in the video's secondary
text colour. **Separate them with a visible divider, not just a gap** — at 40px two bullets read
as one run-on line ("68% within one   95% within two"). Use a `·` in a quiet colour between them, or
at least 120px of space. Three or fewer, and the figure area shrinks
by that much when they are present. No shipped script uses them, so treat this as the
specification rather than something proven.

## The title card

**Optional, and designed per video.** Whether a film opens on a title at all, and what that
title looks like, comes from the story and the style card — not from this file. Many films are
better opening straight on their first picture.

The tier arithmetic budgets 3 seconds for a title because the shipped topic scripts do. A film
without one sets `TITLE_SECONDS` to 0 and gives the time to the sections — say so if it moves the
length the person asked for.

When there is one, what holds whatever it looks like:

- **Weights the font actually has.** Arial ships 400 and 700 only; anything else is
  synthesised into a smeared approximation. Other families differ — load the weight you use.
  `asu-visual-style/typography.md` has the detail.
- **Contrast and the type floor** from `asu-visual-style` apply, whichever style was chosen.
- **Inside the safe area of the frame actually being used** — on an upright film that is the
  platform safe box in [upright.md](upright.md), not the middle of the frame.

An earlier version of this section fixed a 104px Arial title over a gold rule and called it "the
one motif carried across every video in the series". That was one series' house look, carried
into every style; it is gone on purpose.

## One thing not to "fix"

`tsconfig.json` sets `lib: ["es2015"]`, and the planner above uses `Array.prototype.includes`,
which is ES2016. When an earlier build wrote that planner, **it compiled fine** — the transitive
types widen the lib. The planner is not in `src/` now, so this has not been re-checked since.

If you write it, run `npx tsc --noEmit` and believe the result. Do not rewrite `includes` as
`indexOf` to pre-empt an error that may not happen; change it only if `tsc` actually reports
one.

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
  else competes, so the rule satisfies itself. For the ASU mark, half the sunburst's height
  clear on all four sides (`asu-visual-style/logo.md`); another organisation's logo has its own
  rule.
- **Fade in over 10–12 frames and hold.** Do not animate the logo's shape.
- Because it comes out of the same budget, a 60-second video with an end card is still 60
  seconds — the sections give up 2s between them. Nothing to warn the person about.

## No audio at all means no audio track

Remotion adds a **silent stereo AAC track by default** when a film has no sound. On a 60-second
video that was about 2.4MB of a 4.0MB file — 60% of the deliverable silence — and it pushed the
container duration to 60.053s, which quietly breaks the exact-length guarantee everything above
works to establish.

**Render muted only when the film has no audio at all: no voice, no music, no sound effects,
no sound from footage.**

```bash
npx remotion render <Id> out/<slug>.mp4 --muted
```

**No voice is not the same as no audio.** A film without narration usually has a score, and
`--muted` drops it from the file without a warning — the render succeeds and the music is simply
gone. **A film with a score, effects or clip sound must never be rendered muted.** Check the
brief's music and sound decisions before adding the flag, and run `check-render` afterwards: it
reports whether an audio stream is present.

Measured on a real build with no sound of any kind: 4.0MB with the silent track, **1.6MB
muted**, and the container duration landed on exactly 60.000000s instead of 60.053333s.

## Motion

- **Everything derives from `useCurrentFrame()`.** No CSS transitions, ever.
- **Entrances are 8–12 frames.** Slower feels sluggish at this length.
- `spring()` for anything physical — a title landing. `interpolate()` with
  `Easing.inOut(Easing.cubic)` for anything travelling.
- **Always clamp**: `extrapolateLeft: "clamp", extrapolateRight: "clamp"`. Without it, values
  run past the end of the range and shapes fly off screen.
