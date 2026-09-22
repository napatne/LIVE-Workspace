# Assets and ASU style

The `building-a-video` skill step 4 gives the person two choices for where the pictures come from.
This is what each one means for how the video actually gets built, and how far ASU style
reaches into it.

## The rule in one line

**The frame is always ASU. The pictures might not be.**

| Option | ASU style applies to the pictures? |
| --- | --- |
| 1 — they send their own | **No.** Their images, as given. |
| 2 — you create them | **Fully.** Every colour, stroke and label. |
| 3 — they direct, you draw | **Fully.** They choose *what*; the skill decides how it looks. |

**But the background, title card, headings, captions and end card follow `asu-visual-style` in
every case.** A video full of someone's own photographs still reads as an ASU video, because
everything around them does. That is what keeps the series coherent without anyone having to
restyle a photo.

## Option 1 — they sent you images

- **Use them as given.** Do not recolour, crop, filter or "improve" them. If a photo clashes
  with maroon and gold, that is not yours to silently fix.
- **Check they work at video size.** Anything under roughly 800px wide will look soft filling a
  1920×1080 frame. Say so and ask for a bigger file rather than upscaling it.
- **Say it once if something genuinely clashes** — a bright red image next to maroon, or a
  picture with its own heavy branding. Offer, don't insist: *"That one sits a bit oddly against
  the maroon — want me to put it on a plain background, or leave it as it is?"* Then do what
  they say.
- **Contrast still applies to anything you put on top.** If a caption or label lands over their
  image, it needs its own panel — you cannot know what is behind it. The caption panel in
  `captions.md` already does this.
- **Reference them as** `{ type: "image", src: "assets/user-uploads/<file>", alt: "..." }`.
  **`src` is the full path under `public/`**, because that is what `staticFile()` takes —
  `staticFile(figure.src)`, with no prefix added anywhere. `AGENTS.md` requires static media
  under `public/assets`, and step 4 sends people to `public/assets/user-uploads/`, so the
  `assets/` segment belongs in the string. Never build the path by concatenation.
- **An `alt` is not decoration.** Write what the picture actually shows; it is the record of
  what the visual contributes.

## Option 2 — you create them

Everything from [diagrams.md](../../building-scenes/reference/diagrams.md), with colours from
`asu-visual-style/starter-theme.md`. No decisions to make about style — that is the point.

For the three ready-made topics, **the script already names the picture for every section**
(`Figure: cycle — Sunlight → Water → Sugar → Oxygen`). Use exactly what it names.

For a topic the agent wrote, choose by the **shape of the explanation, not the subject**, and
decide only *after* the script is approved — what pictures are needed depends on what the
video says.

## After option 2 — proposing the set, and the prompts path

**Option 2 does not mean going quiet and producing pictures.** The workflow has the agent
propose the whole set after the script is approved, take changes, and only then ask **how**
they should be made. Two answers.

### They ask you to draw them

The normal path. Draw in code, to the chosen theme's palette — not to any colour they
mentioned in passing. If they say "a red arrow", use the nearest sanctioned colour and say
what you did, unless they clearly mean red *specifically*, in which case check contrast and
use it.

### They ask for prompts to use elsewhere

They take your prompts to Midjourney, ChatGPT or similar, generate the images, and send them
back — from that point it is exactly option 1.

- **One shared preamble in front of every prompt.** That is what makes separately generated
  files look like one video. `content/live-showcase/docs/assets.md` is the worked example.
- **Transparent background, no baked shadow, at least 2× the on-screen size.**
- **Say where to put them when they come back**, and build everything that does not depend on
  them meanwhile.

> **Do not hand a ready-made pack's diagrams to an image generator.** A cold run walked
> straight into this. The packs name *precision* figures — "a twelve-segment wheel with red
> and green opposite and the mixed result in the centre" — where the accuracy **is** the
> teaching content. Generators reliably return the wrong segment count, the wrong hue order
> and garbled labels, and a beautiful wrong colour wheel teaches the wrong thing.
>
> **Say so and offer the split**: they generate backdrops, atmosphere and illustrative
> imagery; you draw the diagram that carries the explanation, in their style, on top. Offer it
> once and do what they choose.

## Mixing sources

Common and fine — their logo over your diagrams, or two supplied photos among four drawn
figures. Keep it coherent:

- **Same background, same type, same caption treatment** across every scene, whatever the
  picture is.
- **Same entrance timing.** A supplied image should fade in over the same 8–12 frames a drawn
  figure does, or the video feels assembled from parts.
- **Same figure area.** Their image sits in the same box a diagram would, `objectFit: "contain"`
  so it is never stretched.

```tsx
<Img
  name={figure.alt}
  src={staticFile(figure.src)}
  style={{
    maxWidth: "100%",
    maxHeight: "100%",
    objectFit: "contain",   // never distort what someone gave you
    opacity: enter,
  }}
/>
```

## The logo

A logo is not the picture set — it is one fixed mark layered on top, and it can arrive at any
point in the conversation. **`asu-visual-style/logo.md` governs it completely**, including the
rule that matters most here: **never recreate, redraw or trace it.** It is the only element in
this project that does not get drawn in code.

There is no ASU logo file in this repository. If they have not sent one, there is nothing to
place.

## Where files live

- **Supplied by them:** `public/assets/user-uploads/` — create it if it does not exist, so
  nobody hunts for a folder that isn't there.
- **Anything you generate and keep:** `public/assets/<topic-slug>/`.
- **Reference everything with `staticFile()`**, paths relative to `public/` and never starting
  with a slash.
- **Keep files small.** This repository is public and people clone it.
