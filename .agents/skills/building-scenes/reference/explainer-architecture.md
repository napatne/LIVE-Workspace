# Explainer architecture

Where to put the parts of a topic-driven explainer so the arithmetic is written once and the
look is written fresh.

> **These are patterns to write per film, not code that exists.** There is no `src/explainers/`
> folder and no `shared/` folder in this repository, and none of `planSections`, `useTheme`,
> `chunkNarration` or `wrapLines` is in `src/`. What `src/` holds is the worked example
> (`src/experiments/live-showcase/`), the interactive kit (`src/interactive/`) and the timeline
> resolver for scored films (`src/lib/timeline.mjs`). Builds that followed this file wrote
> **1,100–1,400 lines before their first frame**. Say that number when someone asks what a video
> costs, and write only the pieces this film needs.

**The split is the whole point.** Timing, tier selection, caption chunking and text measurement
have one right answer and are worth sharing. Layout, figures, palette and motion are the video,
and sharing them is what made four separately built videos identical apart from their words.

## Contents

- The shape of the frame
- What is shared and what is not
- Build order, step by step
- Checking every figure without re-bundling each time
- Commands, including the PowerShell props trap

---
`building-a-video` runs the conversation. The style card from `choosing-a-visual-style` says what
it should look like. **This says how to build it.**

Read it after the script is approved and before you write any code.

## The shape of the frame

**The shape and frame rate the brief recorded** — landscape 16:9 at 30fps unless it says
otherwise. Read width, height and fps from one set of constants in the film's code, and derive
every layout number from them. An upright or square film is a different layout, not the wide
one cropped: see [upright.md](upright.md).

A film built on footage usually takes its frame rate from the footage, not from this default;
`working-with-footage` says how to measure it. Code-drawn films have no such constraint.

## What is shared and what is not

One way to lay the parts out, if more than one explainer will be built. **None of it exists
yet**; create a folder only when something goes in it.

```text
src/<film>/
├── shared/                      ARITHMETIC ONLY. Nothing here draws anything
│   ├── types.ts                 Tier, Section, Figure — what a beat IS, not how it looks
│   ├── plan.ts                  planSections(sections, targetSeconds) → frames, tiers, drops
│   ├── caption-text.ts          chunkNarration. NOT captions.ts — see captions.md
│   └── measure.ts               wrapLines, fitSize(…, floor), the overflow warning
├── Registrations.tsx            this film's compositions; Root.tsx imports it
├── <Name>Video.tsx              the assembly: theme, font, title, sequencing, audio
├── sections.ts                  this video's script and timing, as data
├── theme.ts                     this video's palette, from its style card
├── layout.tsx                   how a section is arranged — this video's answer
└── figures/                     this video's pictures, and Gallery.tsx (below)
```

When a second explainer arrives and wants the same arithmetic, lift `shared/` up a level to
`src/shared/` so neither film imports from the other.

**Everything in `shared/` is a function you call.** None of it renders, none of it imposes a
shape, and you can use any of it without using the rest. That is deliberate: a utility cannot
dictate what a video looks like, and a framework cannot help doing so.

- **`plan.ts` is the one worth having.** Tier selection, seconds→frames, the renormalising
  scale, dropped-section reporting. Four separate builds each rewrote this and each got
  slightly different timing bugs out of it.
- **`caption-text.ts` and `measure.ts` likewise** — chunking and text fitting are fiddly, have
  one right answer, and are where silent defects live. `fitSize` takes the type floor as an
  argument, converted to the figure's viewBox units with `minFigureText` from
  `asu-visual-style/typography.md` — never a bare 22.
- **A film with a score keeps its lengths in `src/<film>/timeline.json`**, not only in
  `plan.ts`'s memory, because the score reads that file. See `structure.md` → *A scored film
  reads its lengths from the timeline*.

**Everything that draws is per video, including the layout, the title card and the figure
gallery.** They are not overhead to be factored away; they are the video. If the second
explainer's layout resembles the first's, that should be because someone chose that, not because
the folder structure made it the path of least resistance.

> **Sharing the look is a decision, not a default.** A project that genuinely wants a matching
> set — a course series, a set of induction videos — can lift the drawing parts into a house
> style once two videos exist and someone has seen both. Record *why*. What does not work is
> assuming it up front: this file used to say the layout, the title card and the figures "are
> identical for every topic" and promised a new topic would be "about thirty lines". Four
> independent builds followed that and produced four videos that differed only in their words.

**Every code snippet in these files writes `THEME.x` for brevity. Read it as `theme.x` from the
theme context you write** — a `useTheme()` hook over a React context is the pattern
`asu-visual-style/starter-theme.md` shows, with the `Theme` type. Copy-pasting the snippets
literally produces a video whose `theme` prop does nothing at all — and it compiles, lints and
renders, so nothing warns you.

**Make the theme a prop, not a module constant.** The person can change their mind at any
point, and *"actually, drop the maroon"* is an obvious refinement request. If the theme is frozen
at authoring time that is a hand-edit; if it is a prop read through a context, it is a prop
change.

**Keep the script as data, separate from the components.** The most common follow-up request
is "change the wording" or "make it shorter", and both should be an edit to `sections.ts`, not
surgery on JSX.

## Build order

1. **Write `sections.ts`** from the approved script. Never invent or reword — the person
   approved specific sentences.
2. **Build the theme from the style card** (`content/<project>/docs/style.md`). If the card
   took the ASU brand route, start from the `THEME` block in
   `asu-visual-style/starter-theme.md`; otherwise build the palette the card describes — the
   `NEUTRAL` block there is a starting point, not a default. **Compute the contrast of every
   colour you choose** before using it. The accessibility rules hold either way; only the
   brand is optional.
3. **Build the section components.** Diagrams from [diagrams.md](diagrams.md).
4. **Add captions.** See [captions.md](captions.md).
5. **Register the compositions in the film's own `Registrations.tsx`**, with
   `calculateMetadata` — never a hand-typed `durationInFrames` — and import that file once in
   `src/Root.tsx`. The film gets a top-level `<Folder>` of its own, named for the film; an
   explainer is a film like any other and does not go in a shared `Explainers` folder. Leave
   every existing folder untouched. If more than one person will build scenes, register every
   scene now, against stubs, before anyone starts (`working-in-parallel`).
6. **`npx tsc --noEmit && npx eslint src`.** Both must pass before you render.
7. **Render one still per figure type and look at each one.** Not one still per video — the
   failures in [diagrams.md](diagrams.md) are properties of each figure type, so one still only
   clears one of them.

   **The frame arithmetic can only find figures that actually appear.** That is what a
   `figures/Gallery.tsx` in the video's own folder is for: a registered composition showing
   **every figure this video uses** at full frame, one after another. It draws, so it lives with
   the video, not in `shared/`. Build it against what the script actually calls for — a gallery
   hardcoded to a fixed set silently skips the figures nobody else has ever looked at. Roughly
   90 frames each. **Not side by side.** At a fifth of the width none of the failures it exists
   to catch — does the figure fill its frame, do labels run off, does it collide with the
   caption — is visible at all. Keep it registered, in the film's folder.

   **Watch the tier.** A figure that only appears in `extended` will not render at the default
   length. Pass `targetSeconds: 120` to see it.
8. **Render.**

## Checking every figure without re-bundling each time

**Every `npx remotion still <Id>` bundles the whole project before it draws one frame**, so a
gallery pass of one still per figure pays for the bundle every time (measured at the end of this
file). When you need many frames, bundle once and point each still at the bundle:

```bash
npx remotion bundle --out-dir=out/bundle
npx remotion still out/bundle <GalleryId> out/gallery-f045.png --frame=45
npx remotion still out/bundle <GalleryId> out/gallery-f135.png --frame=135
```

The first argument may be a bundle folder (one with an `index.html` in it) instead of an entry
point; `still`, `render` and `compositions` all accept it. **A bundle is a snapshot of the code
when it was made.** Re-run `npx remotion bundle` after any code change, or you will be checking
the old version. Each still launches its own browser, so this saves the bundling, not the whole
cost.

With a Gallery composition, the frames to check are simply `45`, `135`, `225`… — one per figure,
mid-hold. That is the other reason to have one.

## Commands

```bash
npx remotion compositions                            # what is registered, and how long
npx remotion still <Id> out/preview.png --frame=300  # one still
npx remotion render <Id> out/<slug>.mp4 --color-space=bt709  # the video
npm run dev                                          # the preview, when they want it
npx tsc --noEmit && npx eslint src                   # after every code change
```

Input props: `--props='{"targetSeconds":45}'`.

**On PowerShell, write the JSON to a file and pass the path.** Inline escaping does not work —
PowerShell 5.1 passes the backslashes through literally and Remotion rejects it.

**Write `props.json` with the Write tool**, then:

```bash
npx remotion compositions --props=props.json
```

Use the tool, not the shell. `Out-File -Encoding utf8` writes a BOM in Windows PowerShell 5.1
and Remotion rejects the result as *"neither valid JSON nor a file path to a valid JSON file"*;
the `[System.IO.File]::WriteAllText` form that avoids the BOM is not a permitted command and
would stop to ask. The Write tool is allowed, writes no BOM, and works the same everywhere.

## Measurements

- **2026-10-20**, test run on a shared machine: each `npx remotion still` took 25–40 s, most
  of it bundling; seven stills for one gallery pass took about 3.5 minutes.
- **2026-10-21**, Remotion 4.0.506, one machine: `npx remotion bundle --out-dir=…` took about
  13 s; a still from that bundle took about 14 s each (browser launch and one frame). The flags
  were confirmed in `node_modules/@remotion/cli` (`--out-dir` on `bundle`; a bundle folder
  accepted as the first argument of `still`, `render` and `compositions`).
