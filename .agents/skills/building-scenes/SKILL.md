---
name: building-scenes
description: Turns a storyboard and a folder of pictures into scenes that play - structure, timing, layout, diagrams and on-screen captions, built in Remotion. Use when writing or changing scene code, adding a scene to an existing film, deriving a duration, or when a scene is built but reads wrong on screen.
---

# Building scenes

**Use this when** there is material to build from and something to build.

**You need first** a storyboard, the assets, the style rules, and — if the video has narration —
the audio. Picture is cut to voice, not the other way round.

**This produces** compositions registered in the film's own registration file, which `src/Root.tsx`
imports, that play in the preview.

**Then go to** `viewing-and-rendering`.

---

## What decides how it looks — and it is not this skill

**The look comes from the style decision, per video.** `choosing-a-visual-style` settles
palette, edges, motion, type and texture with the person; `asu-visual-style` supplies colour,
type, logo and tone when the brand route was chosen. **Read that decision before you build, and
let it change what you actually draw.**

This skill decides *structure and timing* — what plays when, for how long, derived from what.
Its reference files carry legibility rules, accessibility floors and the traps that break
animated figures. **None of them tells you what a video looks like, and none of them is a
template to fill in.** An earlier version did, and four independent builds came out
indistinguishable apart from their words.

**There are two shapes of job here, and both are first-class:**

| | |
| --- | --- |
| **A film, scene by scene** | Each scene's length comes from what is in it; the master derives its total from the scene table. The worked example is built this way. Use this for anything with its own shape |
| **A short explainer to a length** | A script in tiers that lands on an exact duration. Good for a quick or trial video. The tier arithmetic is a utility you call, not a frame to build inside |

Reaching for the second when the job is the first is how a film ends up as a slide deck.

## Before writing any Remotion code

Read `.agents/skills/remotion-best-practices/SKILL.md` and follow the relevant linked guidance.
It is vendored from upstream and may be behind — `AGENTS.md` says how to check it.

**Where the vendored guidance says to inline or hard-code durations, this workspace's rule wins:**
derive every length and name it once (`AGENTS.md` → Remotion guidance). Upstream prefers inline
numbers so Studio's drag-editing can write back to them; that editing is not used here, and a
number typed in two places is how a film cuts off its own last frame.

The rules that bind every scene here, from `AGENTS.md`: animation derives from `useCurrentFrame()`,
never from CSS transitions or browser timing; static media is referenced with `staticFile()`;
components stay small and reusable; type checking runs after meaningful changes.

## The order that works

1. **Script or beat list first**, as data rather than prose inside a component.
2. **Derive durations from it** — never type a scene length and then fit content to it.
3. **Build the shared kit before the scenes**, if more than one person or assistant will work on
   this. Theme values, background components, shared text components, transitions. Built
   afterwards, every worker invents their own version.
4. **One scene at a time, registered on its own** so it can be watched without the rest.
5. **Assemble the master last**, deriving its length from the scene table rather than typing it.

**A scene length is a named constant at the top of its own file — or, if the film has a score, in
its `timeline.json`** — and the master derives its total from those. The two disagreeing is how a
film ends up cutting off its own last frame.

## A film with a score keeps its lengths in the timeline

The score cannot read a constant inside a scene file. So when a film has music, its section lengths,
transitions and hit points live in **one JSON file, `src/<film>/timeline.json`**, and both sides read
it through the same resolver, `src/lib/timeline.mjs`: the scenes for their `durationInFrames` and
local hit frames, the score for where every cut and hit falls. Change a length there and picture and
music move together. Typed in a scene as well, they drift.

- **The timeline replaces the per-scene constants; it does not sit beside them.** A scene reads
  `TIMELINE.frames("<section>")` instead of declaring its own number.
- **Do not name a section or a hit `end`**, and do not end a name in a hyphen and digits
  (`scene-2`): `end` means the end of the film, and `-2` reads as an offset. The resolver refuses
  both. Use words: `close`, `scene-two`.
- **One person edits the timeline at a time.** It is shared by every scene and by the score.

The file's shape, the position grammar and the master's code are in
`scoring-music` → `reference/writing-a-score.md`. A film with no music needs none of this.

## The frame's shape comes from the brief

Width, height and frame rate are what the brief recorded, read from one place in the film's code —
never a 1920×1080 copied from an example. Landscape 16:9 is the default; upright 9:16 and square
are supported, and they are a different layout, not the wide one cropped. **Before building an
upright or square film, read [`reference/upright.md`](reference/upright.md)** — its frame, the
platform overlays that cover it, type sizes for a phone, and what to do when the shape changes
after scenes exist. A film built on footage usually takes its frame rate from the footage —
`working-with-footage` says how to check it.

## Pictures are props on a surface, not slides

A generated picture shown full-screen, then zoomed, then dissolved into the next, is a slideshow,
and it reads as one. One film's motion was rejected in exactly those words — *"cheap
powerpoint"* — for paintings moved by strokes, zooms and dissolves.

What worked instead, on the same film's next version: **an authored surface** — a desk, a wall, a
page, a board, drawn in code and present the whole time — **and pictures used as props on it.**
Pinned, taped, held up, slid in, set down. Each one arrives when its words do, and is taken away
when its beat ends.

- **No generated image fills the frame.** The surface is the frame; images sit on it.
- **Each picture shows literally what its words say.** A picture standing in for a metaphor
  nobody agreed is a guess the viewer has to decode — see `working-practice` rule 2.
- **The surface carries continuity.** Light, texture and the camera's position stay put across
  cuts, so a scene change reads as the same world rearranged rather than a new slide.

## One registration file per film

Every film registers its compositions in one file of its own — `src/<film>/Registrations.tsx` —
and `src/Root.tsx` only imports that file and places it. `Root.tsx` is shared by every film in the
folder; three sessions appending to it in one copy left it with imports out of order and three
films' worth of entries tangled together. With one file per film, two people adding films never
edit the same lines. `src/experiments/live-showcase/Registrations.tsx` and
`src/interactive/demo/Registrations.tsx` are working examples.

The film's folder is a top-level `<Folder>` named for the film; its scenes sit one level down. A
film is a film whether it is an explainer, a promo or a cut of footage — there is no separate
folder for explainers.

**Register every scene before any parallel split**, each pointing at a stub component that renders
nothing, and then leave the registration file alone until the merge. A worker then edits only their
own scene file. Appending entries at a marker while others do the same is not safe — the reason is
in `working-in-parallel`.

## Timing is tentative until it is built

Scope durations loosely at the start — a calibration, not a commitment. Solidify them once the
thing exists, and let embellishment move the number. A 30-second target landing at 34 or 28 is the
normal outcome, not a failure.

**Do not cut a shot to hit a frame number.** Trim only what is dead on screen. A video trimmed to
satisfy an arithmetic target is worse than one running slightly long, and the damage is hard to see
afterwards.

**A transition takes time from both scenes it joins.** Budget it once in each, not once in total.

## When two numbers must agree, calculate one from the other

Four separate faults on one film were the same fault: a number typed by hand where it should have
been derived. A dot positioned by coordinate, so it stayed put when its container moved. A line
given a length, so it ran three pixels into the circle at its end. A shape 46 high against a
40-high thing behind it, standing proud top and bottom and reading as a smudge.

Each fix was identical — delete the typed number, calculate it from the thing it has to agree with.
After that they cannot drift, because there is only one number. *It looks right now* is not the
same as *it stays right*.

## Say why a value is what it is

Put the reason beside the number, especially where it was arrived at by fixing something. One
comment on another film reads: headings were landing at eight different heights and five different
sizes, so the eye had to re-find the copy at every cut — one grid, one size. That is why that film
could be picked up months later without anyone rediscovering the same problem.

## Reference

**The code in `structure.md`, `captions.md` and `explainer-architecture.md` is a set of patterns
to write per film, not code that exists.** There is no `src/explainers/` or `shared/` folder, and
none of `planSections`, `useTheme`, `TitleCard` or `SectionScene` is in `src/`. Earlier builds
that followed these files wrote 1,100–1,400 lines before their first frame; say so when someone
asks what a video costs.

- [`reference/structure.md`](reference/structure.md) — the script as data, the three length tiers,
  turning a script into frames, deriving durations, the timeline for a scored film, the contracts
  between shared pieces, assembling, section layout, title and end cards, motion.
- [`reference/upright.md`](reference/upright.md) — upright (9:16) and square frames: platform
  overlay zones, type sizes for a phone, caption placement, diagrams in a tall frame, and changing
  shape after scenes exist.
- [`reference/diagrams.md`](reference/diagrams.md) — choosing a picture by the shape of the
  explanation, what any figure must satisfy to be legible and accessible, fitting and measuring
  text, and the traps that break an animated diagram whatever its style. Its worked shapes are
  examples, not a menu.
- [`reference/captions.md`](reference/captions.md) — where caption text comes from, chunking,
  timing, styling, leaving room, and SRT if asked.
- [`reference/explainer-architecture.md`](reference/explainer-architecture.md) — the timing and
  assembly utilities a tiered explainer needs, build order, checking every figure without
  re-bundling for each still, and the PowerShell props trap. Utilities to write; they carry no
  look.
- [`reference/building-a-scene.md`](reference/building-a-scene.md) — the worked example as built:
  its shared kit, the shape of a scene file, and how to check the work without breaking the others.
