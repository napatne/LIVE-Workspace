# Worked examples

Three films, the style each one landed on, and what the choice cost. One of them is in this
repository and can be watched. The other two were made the same way and are not.

## Contents

- Paper cut-out collage, silent — the film in this repository
- A notebook, with narration and drawn characters
- No pictures at all — a film drawn entirely in code
- What the three have in common

---

## Paper cut-out collage, silent

A 70-second film about this repository, registered as `LiveShowcaseFilm`. No sound at all, so every
idea arrives through the picture and through words on screen.

**Why the style suited it.** Shapes and text carry meaning on their own, which a silent film needs.
It can be produced from still pictures rather than drawn animation. And it stays consistent across
many separately made pieces, which mattered at 28 of them.

**How it was chosen.** Three existing videos were watched closely — for rules, not for ideas — and
then **stills from those videos were handed to the assistant directly.** A paused frame settles
palette, edges and texture in one look; the same thing written out takes a paragraph and still
leaves room to interpret it differently.

**What came out of it.** Seven colours, each with a job rather than a mood: red means a cut or a
rejection, green means sound and nothing else. They live in one file — `theme.ts` — so changing a
value changes the film. One typeface. Everything stepped rather than smooth.

**The division of labour.** A person brought the look. The assistant turned it into specifics, then
listed every picture the film needed and sorted them into ones to generate, ones to tint and reuse,
and ones to export from the film itself. **The image prompts were written by the assistant, not by
the person** — it knew what the code needed from each file, such as that a clapboard arm has to be
a separate image in order to swing.

## A notebook, with narration and drawn characters

A 74-second film introducing three people. Off-white paper, sketched handwriting, and a pen that
draws things in and crosses things out. The three people are drawn characters laid on that page.

**Why a notebook.** The subject was people being introduced with warmth and dry comedy. A notebook
is personal, it is allowed to be imperfect, and it supplies one object — the pen — that can act
without being a character.

**The rules around the pen were stricter than expected, and that is what kept it from becoming a
gimmick.** It does not draw every object line by line, erase and redraw scenes, touch a person,
cover text, or stay on screen with no reason to be there.

**One line from the director settled the whole treatment:** the pen is an etched script, not a
brush stroke. A thin scratched line, not a soft ink wash. That distinction shows up in every stroke
in the film. A single sentence at the right moment is worth more than a page of adjectives.

**No photographs of anyone.** Every likeness came from a written description handed to an image
generator, because the director did not have images of these people and would not use them without
permission. Worth being precise about what that achieved: there was a step in the plan for getting
people to agree to appear, and it was never completed — it was made **unnecessary** instead. Those
are different outcomes and the notes said so rather than claiming the gate was passed.

**The frame rate was not a style choice.** The film plays at 24. The spec deliberately left it open
— *24 or 30, decided at the first motion test* — and then the generated character clips came back
at 24. The material decided. The other two films run at 30 because nothing constrained them.

**What it cost.** Anything with a voice comes out roughly half as long again as planned, because
people speak more slowly than they read. A late round of feedback rewrote the narration, and only
while placing it did anyone find that all three character clips were now too short for it —
re-timing every one of them, three jobs where one had been budgeted. The film grew from 62 seconds
to 74. The assistant's own note afterwards: *I under-scoped the timing work at the start.*

## No pictures at all

A 90-second silent film explaining a tool that helps someone judge an idea. Unusually, it contains
no images: everything on screen is drawn by code — circles, lines and text.

**The look.** One character, a plain coloured circle about the size of a large full stop. No face,
no eyes, no arms, no speech bubble — all four banned in writing before anything was built. It
communicates through where it goes, how fast, and where it stops.

**Why.** A faceless shape cannot look like a cheap cartoon. It costs nothing to make and nothing to
change. And in a film about judging something carefully, a thing that moves deliberately and stops
to look is doing the explaining rather than decorating it.

**The rules written first, then checked against every scene.**

- **What it must not look like:** not a dashboard demo, not a slide deck, not a cartoon, not a
  generic motion-graphics template. That one sentence ruled out most of the default output.
- **No fake product screens**, not even drawn ones. The code says so in a comment where it would be
  tempting: *nothing here imitates an interface: it is a card with three ruled lines on it.*
- **Colour means something specific.** One colour for progress and for the thing to look at,
  another for titles and the path, greys for structure. Never a colour because it is pretty.
- **Movement has three parts:** a small pause, the movement, a settled stop.

**Two designs were built and one was thrown away.** Two assistants got the same brief and built
twenty seconds each, separately, told not to look at each other's work. One became the film; the
other is still in the project, still playable, under a note saying what it is. Both had
independently picked the same colours — which is the useful part. What was actually being chosen
was how it moves and how the screen is arranged, not the palette.

**One thing worth copying.** Every number in that film — the size of the dot, the height of a
heading, the gap between a title and the text under it — sits next to a comment saying what went
wrong without it. One reads: headings were landing at eight different heights and five different
sizes, so the eye had to re-find the copy at every cut. One grid, one size. That is why the film
could be picked up months later without anyone rediscovering the same problems.

## What the three have in common

**The taste was brought by a person and the build was done by an assistant**, on all three. That
split is the reusable part: taste does not hand off, and nearly everything after it does.

**Most of the person's time went on watching and saying what was off**, not on deciding up front.
Real corrections from two of these films, none of them in technical language, all of them real
faults:

> the on-screen text appears before the narrator says it

> the maroon dot should animate directly it should not wait for so long

> my colleagues do not know what FIN. is

That last one changed the final words of a film.

**Ask what a scene means before changing it.** One director had to enforce that twice, and the
assistant recorded it as the most useful correction it received: a change made to something whose
meaning has not been agreed is a change neither party can judge.
