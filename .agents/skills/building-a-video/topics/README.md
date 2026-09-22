# Topic Packs

A **topic pack** is a ready-made script for one of the three topics offered in
[the `building-a-video` skill](../SKILL.md) step 1.

A pack is **written words, not code**. It holds the narration, the timing and the picture
for each beat. The agent reads it and builds the Remotion video from it.

## Why packs exist

Most people opening this project do not know what video they want. A pack means they can pick
a topic and get a finished video without answering questions about structure, wording or
pictures — because those answers already exist and have been reviewed by a person.

It also removes the slowest and least reliable step from the common path: nobody has to
invent a script from scratch while the user waits.

Packs do a second job. When someone brings their **own** topic, the agent reads a pack first
and copies **how it is written** — the tone, the tier discipline, the section lengths, the word
budget per second. Those are hard to get right from scratch and a pack has already settled
them.

**Copy the writing, not the pictures.** An earlier version of this line said to copy "diagram
choices" too, so a custom video would "look like it belongs to the same series" — and four
separately built videos came out identical apart from their words. What a video looks like is
decided per video, with the person, in `choosing-a-visual-style`. A pack is a script, and a
script does not carry a look.

## The three packs

| File | Topic | Native length |
| --- | --- | --- |
| [photosynthesis.md](photosynthesis.md) | What is Photosynthesis? | 60s |
| [colour-theory.md](colour-theory.md) | What is Colour Theory? | 60s |
| [supply-and-demand.md](supply-and-demand.md) | What is Supply and Demand? | 60s |

None has recorded narration. They play silent with captions unless someone generates a
voice with `scripts/tts-generate.mjs`.

## What a pack contains

Front matter, then one section per beat:

```markdown
---
slug: photosynthesis
title: What is Photosynthesis?
subtitle: How plants build themselves out of light
audience: complete beginners
titleSeconds: 3
versions:
  "30": core
  "60": core + standard
  "120": core + standard + extended
---

## hook · 6s · core

**Figure:** flow — Light → Leaf → Growth

Every plant you have ever seen built itself, mostly out of air and sunlight.
```

- The heading line is `id · seconds · core|standard|extended`.
- **Figure** names the picture for that beat: `cycle`, `flow`, `bars`, `bell`, `crossing`,
  `wheel` or `ramp`. Choose by the *shape of the explanation*, not the subject — a process is a
  `flow` whether it's photosynthesis or a refund policy. All seven are specified in
  `.agents/skills/building-scenes/reference/diagrams.md` — the first five as shared
  primitives, `wheel` and `ramp` as colour-theory's own, built in its topic folder.
- The paragraph underneath is the narration, **verbatim**. It is spoken and shown as the
  caption, so it must read correctly as text and sound correct aloud.

### The three versions

Every section is labelled **`core`**, **`standard`** or **`extended`**, and each pack opens
with a table saying what plays at each length:

| Asked for | Plays | Section time | + title | Total |
| --- | --- | --- | --- | --- |
| 30 seconds | core | 27s | 3s | **30s** |
| 60 seconds | core + standard | 57s | 3s | **60s** |
| 120 seconds | core + standard + extended | 117s | 3s | **120s** |

> **Every pack's table must carry the captions-only caveat.** The totals are exact for a
> captions-only video and wrong for a narrated one — at ~100 wpm delivery the three shipped
> packs' 60-second cuts speak in **80-88 seconds** (measured 2026-09-22). Copy the callout
> from `photosynthesis.md` into any new pack; a table that promises 60 seconds and delivers
> nearer 85 is the kind of thing nobody notices until someone has already approved it.

**The numbers must add up exactly.** That is the whole point — a version plays whole sections
at their written pace, so nothing is raced and no sentence is quietly deleted. For an
in-between length the agent plays the nearest version down and holds each scene longer.

**30 seconds is the floor.** `core` alone has to make sense as a complete explanation, because
that is all a 30-second video gets. Read it on its own: if it doesn't stand up, the material
is in the wrong tier.

- **`core`** — the irreducible explanation. 27 seconds.
- **`standard`** — what you'd add given a normal minute: an example, the scale of it, why it
  matters. 30 seconds.
- **`extended`** — depth for someone who wants two minutes: mechanism, edge cases, history,
  caveats. 60 seconds.

Check the arithmetic after any edit:

```bash
node -e '
const fs = require("node:fs");
const dir = ".agents/skills/building-a-video/topics";
for (const f of fs.readdirSync(dir).filter((n) => n.endsWith(".md") && n !== "README.md").sort()) {
  const s = fs.readFileSync(dir + "/" + f, "utf8");
  const t = { core: 0, standard: 0, extended: 0 };
  const ids = [];
  for (const m of s.matchAll(/##\s+(\S+)\s+·\s+(\d+)s\s+·\s+(core|standard|extended)/g)) {
    t[m[3]] += +m[2];
    ids.push(m[1]);
  }
  const recapLast = ids[ids.length - 1] === "recap";
  console.log(f, t.core + 3, t.core + t.standard + 3, t.core + t.standard + t.extended + 3,
    "recap-last:" + recapLast);
}
'
```

It should print `30 60 120  recap-last:true` for every pack.

**`recap` must be the last section in the file, whatever tier it is.** A version plays its
tiers *in file order*, so a `core` recap sitting fourth means the 60- and 120-second versions
say "here's the summary" a third of the way in and then keep going for another minute. A cold
run caught exactly this in `colour-theory.md`, where the recap sat above the `standard`
sections. The checker above tests for it because reading the file top to bottom does not make
it obvious — every section looks right on its own.

### Length

Write to roughly **150 words per minute** — about 2.5 words per second of section time. A
10-second section is roughly 25 words. Count them.

> **150 is a writing budget. It is not a speaking rate, and it is not how long the audio will
> be.** If you are working out how long something will *sound*, the number you want is **~100
> wpm** — measured from this project's own shipped Rasalgethi narration, 95 counting allotted
> clip time and ~107 counting pure speech. A cold agent used 150 as a speaking rate, concluded
> a video would be two-thirds silence, and told the person so. It was wrong by about 50%.

**So a narrated video runs roughly 35-45% longer than its written seconds.** Every section
overruns; that is expected, and the reconciliation in
`.agents/skills/adding-narration/reference/timing.md` handles it.

**Do not derive that overrun from the 150 budget — measure the words actually written.**
150 wpm × 60s = 150 words, which at ~100 wpm predicts ~90s, and that is where the "a 60-second
script speaks in about 95" figure in earlier versions of this page came from. **All three
shipped packs are under budget**, so the real numbers are lower: 129-142 narration words in
the 60-second cut, written at 136-150 wpm (mean ~141), speaking in **80-88s including the 3s
title** — photosynthesis 82.8s, colour-theory 88.2s, supply-and-demand 80.4s, measured
2026-09-22. A budget is a ceiling to write under, not a description of what was written.

**The 30/60/120 arithmetic holds exactly for captions-only videos**, which is the default.
An earlier note here said 137 wpm; measured against the repo's own audio that was about 44%
optimistic.

**This rate is calibrated for English.** Other languages carry a different amount per second;
time the draft against real audio rather than trusting the word count.

**All three shipped scripts are English only.** A request in another language means writing the
script in that language — properly, not translated word-for-word, since the person approves the
actual sentences. The tier budget (27 / 30 / 60 seconds) still applies; the word counts do not.

## Writing a new pack

1. Write `.agents/skills/building-a-video/topics/<slug>.md` in the format above.
2. Check the word count against the length.
3. Have a person read it. **Packs are the first thing a new user sees.**
4. Check the arithmetic adds up to exactly 30 / 60 / 120, then build it once at each of the
   three lengths.
5. Add the topic to the numbered list in **Step 1** of the `building-a-video` skill, and to the table
   above.

**Do not add a topic to step 1 without a pack behind it.** The person picks the "quick"
option and then waits through a full build — worse than not offering it at all.

## Rules

- **A pack's script is pre-approved *as content*, and the agent never rewrites it during a
  session.** That is the entire point of a pack.
  **This does not mean skipping the interview's step 6.** the `building-a-video` skill requires showing the words to
  the person and getting a go-ahead *every time, including topics 1–3* — they have never seen
  this script, however settled it is on our side. Pre-approved means **we** are not
  re-litigating the wording; it does not mean **they** do not get to read it. An earlier
  version of this bullet said the agent "never asks a user to re-approve it", which a cold
  agent correctly read as licence to skip the one gate the workflow calls unskippable.
- **Packs are written by the team, not inside a user's session.** If an agent finds itself
  authoring a shipped pack while someone waits, something has gone wrong.
- A pack is content. It carries no code — the agent writes that each time, from the skill.
- **When a pack's words fail an accessibility rule, you are deadlocked — escalate, do not
  pick a side.** `asu-visual-style/accessibility.md` requires that every diagram's point is
  stated in the narration; the rule above forbids rewriting the narration in a session. Both
  cannot hold at once, and neither outranks the other. **Build nothing silently either way:**
  put the specific clash to the person — the figure, the words, and the change you would
  make — and let them decide. Ship it as written only if they say so, and record it.

  > The live example is `photosynthesis.md`'s `scale` section: the bar chart shows *Ocean
  > plankton 50, Forests 30, Grassland 20* and the narration states none of the 30, the 20 or
  > "Grassland". Two separate cold runs each found it and each correctly refused to resolve it
  > alone. It is still open — the fix is a pack edit, which belongs to the team, not to a
  > session.
