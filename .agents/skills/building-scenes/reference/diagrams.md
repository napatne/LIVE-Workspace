# Diagrams

Draw pictures in code, animated from `useCurrentFrame()`. Free, deterministic, identical on
every machine, no API key.

**Do not generate AI images for something you can draw.** `ACCESS.md` records that Gemini image
models, Imagen and Veo all have **no free tier**, and `AGENTS.md` forbids calling paid image
APIs. If a diagram genuinely cannot carry the idea, say so and ask.

**This file does not tell you what a figure looks like.** It tells you what any figure has to
satisfy to be legible and accessible, and what goes wrong when you animate one. The look —
palette, edges, motion, type, texture — is decided per video in `choosing-a-visual-style` and
belongs to the person whose video it is.

## Contents

- [The look is not specified here](#the-look-is-not-specified-here)
- [Choose by the shape of the explanation](#choose-by-the-shape-of-the-explanation)
- [What every figure must satisfy](#what-every-figure-must-satisfy)
- [Sizing and text](#sizing-and-text)
- [Motion](#motion)
- [Traps that bite whatever the style](#traps-that-bite-whatever-the-style)
- [Worked examples, which are not a menu](#worked-examples-which-are-not-a-menu)
- [Hues, when the subject is colour](#hues-when-the-subject-is-colour)
- [Check it by looking at it](#check-it-by-looking-at-it)
- [When nothing here fits](#when-nothing-here-fits)

## The look is not specified here

**Four independent builds of this project produced four videos that were indistinguishable
apart from their words.** Every one of them was following this file, and an earlier version of
it was the reason: it published five shapes, mandated their geometry down to the corner radius,
fixed the frame they sat in, and said *"use the one named, do not substitute."* That is a
template, and a template is what it produced.

So, plainly:

| Decided per video, by the person | Fixed, and not yours to trade away |
| --- | --- |
| Palette and what each colour means | Contrast ratios and the accessibility floor |
| Edges — sharp, soft, torn, hand-drawn | Text never below 22px |
| Motion — slide, snap, stepped, drawn | Nothing meaning-bearing carried by colour alone |
| Texture — flat, grain, paper, print | The narration states what the figure shows |
| Whether a figure is a box, a scene, a photograph of a thing, or a word | Nothing flashing more than three times a second |

**The five style answers in `choosing-a-visual-style` are the input to a figure, not just to an
image prompt.** That skill produces decisions about colour, edges, motion, type and texture.
Historically those were compressed into a preamble for image generation and nothing consumed
them here, so figures defaulted to flat boxes forever. **Read the style decision before drawing
anything, and let it change what you draw** — a `flow` under a torn-paper style is torn paper,
under a hand-drawn style it is wobbling ink, under a typographic style it may be three words
and no box at all.

**Everything below the accessibility section is an example or a warning. None of it is a
requirement.**

## Choose by the shape of the explanation

This part is worth keeping: pick the picture from the *shape of the idea*, not from its
subject. A process is a sequence whether it is photosynthesis or a refund policy.

| The idea is… | A shape that reads it |
| --- | --- |
| A closed loop returning to its start | A cycle |
| Ordered steps, cause to effect | A flow |
| Quantities compared | Bars, or anything with comparable extent |
| A distribution, most in the middle | A curve |
| Two forces meeting at a point | A crossing |
| Relationships among hues | A wheel |
| One dimension stepped end to end | A ramp |

**This is a list of shapes that keep recurring, not the set of shapes that exist.** If the
explanation has a shape that is not here, draw that shape. A scale, a map, a stack, a
container filling, a path with a fork, one object rotating to reveal another side — all fine.
The question to answer is *what shape is this idea*, and then *how does this video draw
things*, in that order.

**Reuse within one video is worth more than variety within one video.** A viewer who has
learned to read your diagram once should not have to learn again at the next section — that is
why the colour-theory script returns to a single wheel rather than inventing eleven pictures.
That argument applies *inside* a video. It has never been an argument for every video looking
like every other one.

## What every figure must satisfy

From `asu-visual-style/accessibility.md`. **These hold whatever the style, including styles
that have nothing to do with ASU** — they are not brand rules, they are the floor.

| Must be true | How to prove it |
| --- | --- |
| Text on its background clears **4.5:1** | Compute it. Do not eyeball it |
| A line or shape that *carries meaning* clears **3:1** against what is behind it | Compute it |
| Nothing meaning-bearing is carried by colour alone | Remove the colour and check it still reads |
| Text is never below **22px** | The floor in `asu-visual-style/typography.md` |
| Nothing flashes more than three times a second | Draw-then-hold satisfies this naturally |
| A quantity is never encoded only as a length | Put the number on the bar, and reserve room for it |
| The narration states what the figure shows | Read the script with the pictures removed. If something is lost, the script is wrong |

**Two adjacent fills that both fail are the case people miss.** When shapes sit against each
other rather than against the background — segments of a wheel, cells of a ramp, stacked
areas — the boundary has to be carried by something. An outline and a background-coloured gap
between neighbours will do it: where the fill is too close to the background the outline shows,
and where the fill is too close to the outline the gap shows. **Check that at least one of the
two mechanisms clears 3:1 for every shape**, rather than checking the fills alone.

## Sizing and text

**Derive every coordinate from the frame you are actually drawing into.** Whatever viewBox you
choose, express radii, margins and baselines as fractions of it. Hardcoded numbers tuned for
one frame leave the figure as a small island the moment the frame changes — which is exactly
what happened when this project's own numbers were tuned for 900×620 and the frame later moved.

**Match the viewBox ratio to the box it renders into**, or it letterboxes and leaves dead
bands.

### Fitting a label

**Wrap first, then shrink, then wrap again** — a smaller size fits more words per line, so the
first wrap is stale once the size has dropped. Never shrink below 22.

```tsx
export const layoutLabel = (text: string, maxWidth: number, start: number) => {
  let lines = wrapLines(text, maxWidth, start);
  const size = fitSize(lines, maxWidth, start);      // floors at 22
  if (size !== start) lines = wrapLines(text, maxWidth, size);
  return { lines, size };
};
```

**Every `<tspan>` needs its own `x`**, or every line after the first collapses to the left edge.

### Character counting is not width measurement

A common shortcut estimates width as `text.length * size * 0.58` — an average advance for
regular-weight Latin. **It is wrong often enough to matter:**

| Script | `.length × 0.58` is | Consequence |
| --- | --- | --- |
| Latin, bold | out by up to ±25% | the floor and the overflow check are both loose |
| CJK | **−42%** — glyphs are about one em | a 7-character label overflows with no warning |
| Arabic | **+90%** — shaping joins glyphs | wraps far earlier than needed |
| Combining marks | **+100%** — each mark counted separately | wraps text that would have fit |

**CJK has no spaces, so word wrapping cannot break it at all.** Rendering is fine in every
script tested — Greek, Cyrillic, CJK, Arabic with correct bidi, Devanagari all draw correctly.
It is only the *fitting* that is wrong. Outside Latin, measure rather than count:
`canvas.measureText` at the real font and weight, or `getComputedTextLength()` on the drawn
`<text>`, and break CJK per glyph.

### Catching overflow

A label too long for its shape spills silently, and only a rendered frame shows it. Detect it:

```tsx
const { lines, size } = layoutLabel(label, maxWidth, base);
const widest = Math.max(...lines.map((l) => measure(l, size)));
if (widest > maxWidth) {
  console.warn(`[figure] "${label}" overflows by ${Math.round(widest - maxWidth)}u`);
}
```

**`npm run build` can never print that warning.** It is `remotion bundle` — it compiles and
never executes a component, so a `console.warn` inside one cannot fire. The warning comes from
the browser, so it needs a command that draws a frame *and* a log level that lets browser
output through:

```bash
npx remotion still <CompositionId> out/probe.png --log=verbose
```

At the default level it is swallowed even during a real render. A cold run implemented the
check correctly, ran `npm run build`, saw nothing, and concluded its figures were clean.

**If the label came from an approved script you cannot just shorten it.** Take it back to the
person: *"'Photosynthesis' won't fit inside that circle at a readable size — shall I put it on
two lines, or use a different picture here?"*

## Motion

**One `progress` value, 0 to 1, and a settled hold.** The narration needs something still to
talk over, not a moving target.

```tsx
const drawFrames = Math.min(fps * 2, durationInFrames * 0.6);
const progress = interpolate(frame, [0, drawFrames], [0, 1], {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
});
```

**How** it arrives — drawn, faded, snapped, stepped, torn into place — is a style decision. That
it settles is not.

**Stagger parts so the eye follows the order of the explanation:**

```tsx
const stagger = (progress: number, index: number, count: number): number => {
  const step = 1 / Math.max(count, 1);
  const start = index * step * 0.8;   // 0.8 overlaps slightly; 1.0 feels stilted
  return interpolate(progress, [start, start + step], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
};
```

## Traps that bite whatever the style

These are not about how a figure looks. They are things that break any animated diagram, and
every one of them cost this project real time.

**A connector must never finish before the thing it points at exists.** With one `stagger()`
per index, a link runs on its *source's* schedule and completes while its *destination* is
still fading in — a fully drawn arrow pointing at empty background. It only shows mid-draw, so
a settled still never catches it. Interleave parts and connectors on one `2n`-beat sequence and
cap each connector by its destination:

```tsx
const beats = parts.length * 2;
const partAppear = (i: number) => stagger(progress, i * 2, beats);
const linkAppear = (i: number) => stagger(progress, i * 2 + 1, beats);
const drawn = Math.min(linkAppear(i), 0.5 + 0.5 * partAppear((i + 1) % parts.length));
```

**An arrowhead drawn centre-to-centre hides under the thing it points at**, and the diagram
reads as an undirected mesh. Inset both ends of the connector along its own direction so the
head clears the shape.

**A zero-length line with `strokeLinecap="round"` renders as a stray dot.** Animating an axis by
moving one end *to* the other leaves exactly that at full progress, and it looks like a rogue
artifact. Grow both axes out of the origin instead, so no endpoint ever meets another.

**Attach an arrowhead marker only once its line is nearly drawn**, or it sits on a zero-length
line at the start and flickers.

**`markerUnits="userSpaceOnUse"` is not optional.** The default is `strokeWidth`, so
`markerWidth={10}` on a 4px stroke becomes 40 units — an arrowhead longer than its own shaft,
reading as a floating triangle.

**A circle in a wide frame is a small island.** In anything near 2:1, a shape constrained by the
height leaves a third of the width empty on each side. Use two radii, one per axis.

**Odd counts around a ring leave a gap, and rotating to "fix" it just moves the gap.** An
earlier version of this file said to offset odd counts by half a step; rendered side by side
that moves the gap to the top, which reads worse. A gap at the bottom next to the caption reads
as deliberate space.

**Painting order is load-bearing.** A baseline drawn before the bars is painted over by them and
survives only in the gaps. Draw it after.

**Reserve room for anything sitting outside the plot.** A value above a bar needs headroom taken
out of the plot height, or the tallest bar reaches the ceiling and its number has nowhere to go.
An end label anchored `"middle"` at the right edge runs half off the canvas — anchor it
`"start"` and end the plot early enough that the label finishes inside the frame.

**When a label will not fit where it belongs, move it and draw a leader.** An intersection label
placed literally above its dot lands on both lines; lift it clear and drop a dashed line back
to the point.

## Worked examples, which are not a menu

**One implementation of each recurring shape, shown because the problems in them are real.**
Copy the reasoning, not the rendering. Take colour, weight, edge and motion from the style
decision — the values below are one video's answers, not defaults.

**Cycle.** Parts spaced around an ellipse, starting at the top, going clockwise — that is how a
loop is read. Inset the connectors, cap each by its destination, and expect four to six parts
before labels collide.

**Flow.** Ordered parts across the width, connected in sequence. Divide the full width between
them rather than capping their size — a fixed cap leaves three parts huddled in the middle of
an empty field. Three to five steps before they get too narrow for their labels.

**Bars.** Grow from a baseline, scaled to the largest value present rather than a fixed maximum.
Baseline after the bars, values above them, names below.

**Curve.** Sample a function across the width and draw it progressively:

```tsx
const drawn = Math.max(2, Math.round(steps * progress));
for (let i = 0; i <= drawn; i++) {
  const t = i / steps;
  const x = left + (right - left) * t;
  const z = -3 + 6 * t;                       // a standard normal, as one example
  const y = baseY - Math.exp(-0.5 * z * z) * height;
}
```

Bands, markers and annotations fade in *after* the curve has drawn, from about `progress` 0.6.

**Crossing.** Two lines from opposite corners, the intersection marked once both are drawn.
Both lines carry meaning, so both need 3:1 — and because two lines of similar hue cannot be
told apart by hue, **the end labels carry the distinction**, which the accessibility floor
requires anyway.

## Hues, when the subject is colour

**A figure whose subject is colour cannot take its colours from a brand palette.** A colour
wheel drawn in two brand colours teaches nothing. This is the one place the palette rule yields
— and it yields only for the hue swatches themselves. Outline, labels, background and caption
stay on the video's palette.

**If you draw a wheel of hues, use an RYB wheel unless you mean otherwise.** Generating with
`hsl(i * 30)` puts cyan opposite red, which makes "red and green are opposite" false on screen.
A twelve-hue RYB set, index 0 at the top going clockwise, measured against a `#FBF9F4`
background and a `#191919` outline on 2026-09-22:

| # | Hue | Hex | vs background | vs outline |
| --- | --- | --- | --- | --- |
| 0 | red | `#FE2712` | 3.62 | 4.62 |
| 1 | red-orange | `#FC600A` | **2.93** | 5.71 |
| 2 | orange | `#FB9902` | **2.07** | 8.09 |
| 3 | yellow-orange | `#FCCC1A` | **1.45** | 11.55 |
| 4 | yellow | `#FEFE33` | **1.03** | 16.27 |
| 5 | yellow-green | `#B2D732` | **1.58** | 10.60 |
| 6 | green | `#66B032` | **2.55** | 6.55 |
| 7 | blue-green | `#347C98` | 4.45 | 3.75 |
| 8 | blue | `#0247FE` | 5.98 | **2.79** |
| 9 | blue-violet | `#4424D6` | 8.08 | **2.07** |
| 10 | violet | `#8601AF` | 7.57 | **2.21** |
| 11 | red-violet | `#C21460` | 5.60 | **2.98** |

**Six of twelve fail against that background and four fail against that outline — but none
fails both**, which is the property to preserve. On any other background, recompute; the
numbers above are for this one. Publish the inputs with any measurement added here, or the next
reader cannot check it.

**Marking a segment must survive a viewer who cannot tell the hues apart** — push it out of the
ring, thicken its outline, and label it, rather than relying on which one is lit. **Never set
text in one of the hues.**

**A ramp holds one dimension constant while stepping another.** A saturation ramp that drifts in
value is just a second value ramp — measure it and keep the value roughly flat, or the
distinction the script is drawing disappears.

## Check it by looking at it

**Render one still per figure, not one still per video.** Each failure below is a property of an
individual figure, so one still clears one figure. Checking one and shipping three unlooked-at
is the likeliest way a visible defect reaches the person.

Finding a settled frame: get the total from `npx remotion compositions`, add up the sections in
order until you reach the one you want, and **add at least 60 frames to its start** — figures
draw over about two seconds, and a frame sampled ten frames in shows a half-drawn diagram and
tells you nothing.

```bash
npx remotion still <Id> out/check-crossing.png --frame=930
```

**Then open the image and actually look at it.** The failures that are invisible in code and
obvious in a still, roughly by how often they happen:

- A serif fallback font, because the family was never loaded on the root.
- Labels running off the canvas, or overlapping each other.
- Arrowheads hidden under the thing they point at.
- The figure drawn outside its area, colliding with the heading or the caption.
- Sampling mid-draw and concluding a fine diagram is broken.

## When nothing here fits

Draw what the explanation actually needs. Then decide where it lives:

- **Something any subject could want** — put it with the other shared pieces so the next video
  can use it.
- **Something that only means anything for this subject** — keep it in the video's own folder
  and pass it in, so the shared pieces never import from one topic.

**Then write down what you got wrong the first time**, beside the shape. Most of this file is
that: not descriptions of pictures, but the specific ways each one failed before it worked.
