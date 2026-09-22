# Explainer architecture

Where to put the parts of a topic-driven explainer so the arithmetic is written once and the
look is written fresh.

**The split is the whole point.** Timing, tier selection, caption chunking and text measurement
have one right answer and are worth sharing. Layout, figures, palette and motion are the video,
and sharing them is what made four separately built videos identical apart from their words.

## Contents

- What is shared and what is not
- Build order, step by step
- Commands, including the PowerShell props trap

---
`building-a-video` runs the conversation. `asu-visual-style` says what it should look like.
**This says how to build it.**

Read it after the script is approved at the interview's step 6 and before you write any code.


## The shape of every explainer

**1920×1080, 30fps.**

> The Lexi Mentors film is 24fps because its footage plates are 24. That is a constraint of
> that film, not a project default. Code-drawn explainers are 30.

```
src/explainers/
├── shared/                      ARITHMETIC ONLY. Nothing here draws anything
│   ├── types.ts                 Tier, Section, Figure — what a beat IS, not how it looks
│   ├── plan.ts                  planSections(sections, targetSeconds) → frames, tiers, drops
│   ├── caption-text.ts          chunkNarration. NOT captions.ts — see captions.md
│   └── measure.ts               wrapLines, fitSize, the overflow warning
└── <video-slug>/                EVERYTHING THAT DRAWS
    ├── <Name>Video.tsx          the assembly: theme, font, title, sequencing, audio
    ├── sections.ts              this video's script and timing, as data
    ├── theme.ts                 this video's palette, from its style decision
    ├── layout.tsx               how a section is arranged — this video's answer
    └── figures/                 this video's pictures
```

**Everything in `shared/` is a function you call.** None of it renders, none of it imposes a
shape, and you can use any of it without using the rest. That is deliberate: a utility cannot
dictate what a video looks like, and a framework cannot help doing so.

- **`plan.ts` is the one worth having.** Tier selection, seconds→frames, the renormalising
  scale, dropped-section reporting. Four separate builds each rewrote this and each got
  slightly different timing bugs out of it.
- **`caption-text.ts` and `measure.ts` likewise** — chunking and text fitting are fiddly, have
  one right answer, and are where silent defects live.

**Everything that draws is per video, including the layout and the title card.** They are not
overhead to be factored away; they are the video. If the second explainer's layout resembles
the first's, that should be because someone chose that, not because the folder structure made
it the path of least resistance.

> **Sharing the look is a decision, not a default.** A project that genuinely wants a matching
> set — a course series, a set of induction videos — can lift the drawing parts into a house
> style once two videos exist and someone has seen both. Record *why*. What does not work is
> assuming it up front: this file used to say the layout, the title card and the figures "are
> identical for every topic" and promised a new topic would be "about thirty lines". Four
> independent builds followed that and produced four videos that differed only in their words.

**The thirty-line figure was never true anyway.** With none of `shared/` present, the builds
that hit this wrote 1,100–1,400 lines before their first frame. Say the real number when
someone asks what a video costs.

**Every code snippet in these files writes `THEME.x` for brevity. Read it as `theme.x` from
`useTheme()`.** Copy-pasting them literally produces a video whose `theme` prop does nothing at
all — and it compiles, lints and renders, so nothing warns you. `asu-visual-style/starter-theme.md`
has the context and the `Theme` type.

**Make the theme a prop, not a module constant.** the `building-a-video` interview lets someone change
their mind at any point, and *"actually, drop the maroon"* is an obvious refinement request.
If the theme is frozen at authoring time that is a hand-edit; if it is a `theme: "asu" |
"neutral"` prop read through a context, it is a prop change.

**Keep the script as data, separate from the components.** The most common follow-up request
is "change the wording" or "make it shorter", and both should be an edit to `sections.ts`, not
surgery on JSX.


## Build order

1. **Write `sections.ts`** from the approved script. Never invent or reword — the person
   approved specific sentences at the interview's step 6.
2. **Copy the theme** from `asu-visual-style/starter-theme.md` — **the block matching their
   step 5 answer.** If they said **no** to ASU style, take the `NEUTRAL` block, not `THEME`,
   and **compute the contrast of every colour you substitute** before using it. The
   accessibility rules stay on either way; only the brand colours change.
3. **Build the section components.** Diagrams from [diagrams.md](diagrams.md).
4. **Add captions.** See [captions.md](captions.md).
5. **Register the composition** in `src/Root.tsx`, with `calculateMetadata`. Never a
   hand-typed `durationInFrames`.

   **Put explainers in a top-level `Explainers` folder**, creating it if it does not exist, and
   **leave every existing folder untouched**.

   > This contradicted `Root.tsx` for a while, whose comment reserved the top level for
   > films — and an earlier version of this note claimed the contradiction had been
   > resolved while `Root.tsx` still said otherwise, which is worse than the contradiction
   > it described. **Both now say the same thing:** a top-level folder is something someone
   > can be shown, a film or the explainers, and everything else sits one level down. If you
   > find them disagreeing again, fix the pair, do not write a note saying they agree.
6. **`npx tsc --noEmit && npx eslint src`.** Both must pass before you render.
7. **Render one still per figure type and look at each one.** Not one still per video — the
   failures in [diagrams.md](diagrams.md) are properties of each figure type, so one still only
   clears one of them.

   **The frame arithmetic can only find figures that actually appear.** That is what a
   `figures/Gallery.tsx` in the video's own folder is for: a registered composition showing
   **every figure this video uses** at full frame, one after another. Build it against what
   the script actually calls for — a gallery hardcoded to a fixed set silently skips the
   figures nobody else has ever looked at. Roughly 90
   frames each. **Not side by side.** At a fifth of the width none of the failures it exists to
   catch — does the figure fill its frame, do labels run off, does it collide with the caption —
   is visible at all. Build it once, in `shared/`, and keep it registered — the project
   already keeps style tests registered for the same reason.

   **Watch the tier.** A figure that only appears in `extended` will not render at the default
   length. Pass `targetSeconds: 120` to see it.
8. **Render.**

## Commands

```bash
npx remotion compositions                            # what is registered, and how long
npx remotion still <Id> out/preview.png --frame=300  # the step-7 still
npx remotion render <Id> out/<slug>.mp4              # the video
npx remotion studio                                  # serves on http://localhost:3000
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
