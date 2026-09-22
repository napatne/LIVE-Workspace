---
name: building-scenes
description: Turns a storyboard and a folder of pictures into scenes that play - structure, timing, layout, diagrams and on-screen captions, built in Remotion. Use when writing or changing scene code, adding a scene to an existing film, deriving a duration, or when a scene is built but reads wrong on screen.
---

# Building scenes

**Use this when** there is material to build from and something to build.

**You need first** a storyboard, the assets, the style rules, and — if the video has narration —
the audio. Picture is cut to voice, not the other way round.

**This produces** a composition registered in `src/Root.tsx` that plays in the preview.

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

**A scene length is a named constant at the top of its own file**, and the master derives its total
from those. The two disagreeing is how a film ends up cutting off its own last frame.

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

- [`reference/structure.md`](reference/structure.md) — the script as data, the three length tiers,
  turning a script into frames, deriving durations, the contracts between shared pieces,
  assembling, section layout, title and end cards, motion.
- [`reference/diagrams.md`](reference/diagrams.md) — choosing a picture by the shape of the
  explanation, what any figure must satisfy to be legible and accessible, fitting and measuring
  text, and the traps that break an animated diagram whatever its style. Its worked shapes are
  examples, not a menu.
- [`reference/captions.md`](reference/captions.md) — where caption text comes from, chunking,
  timing, styling, leaving room, and SRT if asked.
- [`reference/explainer-architecture.md`](reference/explainer-architecture.md) — the timing and
  assembly utilities a tiered explainer needs, build order, and the PowerShell props trap.
  Utilities to call; they carry no look.
- [`reference/building-a-scene.md`](reference/building-a-scene.md) — the worked example as built:
  its shared kit, the shape of a scene file, and how to check the work without breaking the others.
