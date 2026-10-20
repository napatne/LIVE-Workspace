# Styles that can be made here

**For the assistant.** The catalogue to propose from. Each entry is a starting point for a style
card ([`style-card.md`](style-card.md)), not a finished one — the card is written for the film once
the person has chosen.

## Contents

- [How to use this](#how-to-use-this)
- [Drawn entirely in code](#drawn-entirely-in-code) — free, and changeable to the last minute
- [Built around pictures](#built-around-pictures) — needs generated or supplied stills
- [Adding a style](#adding-a-style)

## How to use this

Pick three that suit the subject and **differ from each other**, say one line about each, recommend
one, and let the person choose (`SKILL.md` → Proposing three). Then show one still in the chosen
style before building anything else.

**"Built in code"** means every frame is drawn by the code — shapes, lines, text, filters. No image
generator, no cost, and any colour or shape can still change after the film exists. **"Built around
pictures"** needs stills from a generator or from the person; see `creating-assets` for what that
involves and costs.

Every entry's sound line is a starting point for `scoring-music`.

`@remotion/paths` and `@remotion/shapes`, named below, arrive in `node_modules/` with Remotion but
are not declared in `package.json`. Before a scene imports one, add it at the same pinned version as
`remotion` and say why — `AGENTS.md` asks for that on every dependency.

## Drawn entirely in code

**Flat vector.** Clean geometric shapes, bold flat colour, rounded corners, no texture.

- *Good for:* friendly, quick explainers; processes; anything for a general audience.
- *Built with:* SVG and CSS shapes, `@remotion/shapes`.
- *Watch for:* looking like a generic template. Give it one distinctive shape language (all
  circles, all cut corners) and hold it.
- *Sound:* light percussion, pizzicato strings, marimba or vibraphone.

**Whiteboard.** Black marker on white, drawn line by line as the idea is explained.

- *Good for:* step-by-step explanations; science; "how does X work".
- *Built with:* SVG paths drawn on from the frame number (`evolvePath` in `@remotion/paths`, or a
  stroke dash offset); handwriting set in a single-line font.
- *Watch for:* drawing too fast to follow; text that appears as a block instead of being written.
- *Sound:* soft marker foley on each stroke; piano or guitar, sparse.

**Blueprint.** White and pale-blue line work on deep blue, dimension lines, labelled parts.

- *Good for:* how something is built or organised; engineering; systems.
- *Built with:* SVG line work, a fine grid, monospaced labels.
- *Watch for:* decorative grid noise; labels too small to read on a phone.
- *Sound:* ticking or clock-like percussion, plucked strings, low pulses.

**Kinetic type.** The words are the picture — one or two typefaces on a strict grid, strong
contrast, type that moves with purpose.

- *Good for:* an argument, a set of principles, a quote; short films; no illustration budget.
- *Built with:* text and layout only (`@remotion/layout-utils` to fit and measure text).
- *Watch for:* two lines competing on screen — one line at a time; motion that is decoration.
- *Sound:* music-led and rhythmic; cuts that land on the beat.

**Data story.** Charts that build, then get annotated with what they mean.

- *Good for:* numbers, trends, comparisons.
- *Built with:* SVG charts drawn from the real data, values animated from the frame.
- *Watch for:* animating the chart rather than the point; colour that encodes nothing.
- *Sound:* sparse; a soft tick as each value lands.

**Ink line.** A sketchy pen line that "boils" — redrawn slightly differently every couple of frames,
as hand-drawn animation does.

- *Good for:* personal stories, humour, warmth.
- *Built with:* SVG paths with a small seeded jitter regenerated on twos.
- *Watch for:* boil so strong it reads as nervous; inconsistent line weight between scenes.
- *Sound:* acoustic guitar, whistling, woodwind.

**Watercolour.** Soft washes that bloom and bleed, on visible paper.

- *Good for:* gentle subjects, nature, children and all-ages audiences.
- *Built with:* SVG turbulence and displacement filters for wash edges and blooms. A session here
  painted a whole film this way in code, characters included.
- *Watch for:* stacked washes turning to mud; text contrast on a wash (measure it — one title
  measured 4.3:1 and had to move to ink); overlapping washes making accidental shapes (one figure's
  head and body overlapped into what read as a frowning mouth).
- *Sound:* harp, strings, flute, soft piano.

**Risograph print.** Two or three spot inks, halftone dots, slight mis-registration between colours.

- *Good for:* editorial or zine energy; culture and community subjects.
- *Built with:* SVG pattern fills for halftone, a few pixels' offset between ink layers, a grain
  filter.
- *Watch for:* mis-registration on small text — keep type on one ink layer.
- *Sound:* lo-fi drums, bass, simple keys.

## Built around pictures

**Paper collage** — the LIVE showcase in this folder. Torn and cut paper, photographic cut-outs,
type made of paper; the picture is visibly assembled.

- *Good for:* films about making, assembling or craft; anything that should feel handmade.
- *Built with:* generated transparent stills (the showcase used 28) on a code-drawn ground; the kit
  in `src/experiments/live-showcase/` — `Paper.tsx`, `PoppedWord.tsx`, `onTwos` in `theme.ts`,
  `transitions/slateSlam.tsx` and `paperBreath.tsx`.
- *Watch for:* clutter; generated pieces drifting apart in style (one shared preamble on every
  prompt).
- *Sound:* paper foley — rustle, snap, clap; plucked and percussive instruments.
- *Full card:* [`style-card.md`](style-card.md) → worked example.

**Props on a surface.** Illustrations or photographs pinned, taped or held on a code-drawn surface —
a desk, a wall, a board.

- *Good for:* stories with places and people; a personal history; anything that needs real images.
- *Built with:* stills from a generator or the person, on an authored surface (`building-scenes` →
  props on a surface).
- *Watch for:* turning into a slideshow — no image fills the frame; whose world the pictures show
  (`creating-assets`).
- *Sound:* room tone; the foley of the surface (pins, tape, paper); whatever the story's world
  sounds like.

## Adding a style

When a person invents a style, or a new one is built for a film, it can join this list for the next
person:

1. Its card exists and a film was made with it.
2. Add one entry here in the same five lines — what it is, good for, built with, watch for, sound.
3. Point at the code that draws it, if any of it is reusable.

Lemo-Opuscar (`lemomo-ai/lemo-opuscar`, MIT) keeps about fifty styles in this shape — ukiyo-e,
shadow puppetry, woodcut, Swiss motion graphics, 80s cel anime and more — and is worth reading for
vocabulary when a person asks for something not listed here. Read its `STYLE.md` files as
reference; its demos are browser canvas plus Python audio, and none of that code is used here.
