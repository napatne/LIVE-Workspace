# Assets — the three routes in full

`building-a-video` asks the person where the pictures come from (`reference/interview.md`, at the
step named for it). This is what each answer means for how the video actually gets built, and how
far the film's chosen style reaches into the pictures.

## Contents

- [The rule in one line](#the-rule-in-one-line)
- [Route 1 — I draw them](#route-1--i-draw-them) — the default, and free
- [Route 2 — they provide their own](#route-2--they-provide-their-own)
- [Route 3 — I write the prompts, they generate](#route-3--i-write-the-prompts-they-generate)
- [Generating here is paid, and opt-in](#generating-here-is-paid-and-opt-in)
- [Pictures found online](#pictures-found-online)
- [Mixing sources](#mixing-sources)
- [The logo](#the-logo)
- [Where files live](#where-files-live)

## The rule in one line

**The frame always follows the film's style. The pictures might not.**

| Route | Does the film's style apply to the pictures? |
| --- | --- |
| 1 — I draw them | **Fully.** Every colour, stroke and label. They choose *what*; the style card decides how it looks. |
| 2 — they provide their own | **No.** Their images, as given. |
| 3 — I write the prompts, they generate | **As far as the prompts carry it.** The shared style paragraph at the head of every prompt is the style. |

**But the background, title card, headings, captions and end card follow the style card
(`content/<project>/docs/style.md`) in every case.** A video full of someone's own photographs
still reads as one film, because everything around them does. That is what keeps it coherent
without anyone having to restyle a photo.

## Route 1 — I draw them

The default, and it costs nothing. Everything from `building-scenes` → `reference/diagrams.md`,
with colours from the film's style card — and from `asu-visual-style/starter-theme.md` only when
ASU's brand was the style chosen.

**It does not mean going quiet and producing pictures.** Propose the whole set once the script is
approved, take changes, then draw.

- **Choose by the shape of the explanation, not the subject**, and decide only *after* the script
  is approved — what pictures are needed depends on what the video says.
- **For a ready-made topic, the script already names the picture for every section**
  (`Figure: flow — Sunlight + Water + Carbon dioxide → Sugar + Oxygen`). Use exactly what it names.
- **Draw to the film's palette, not to a colour mentioned in passing.** If they say "a red arrow",
  use the nearest colour in the palette and say what you did — unless they clearly mean red
  *specifically*, in which case check its contrast and use it.

## Route 2 — they provide their own

- **What they hand in goes in `content/<project>/intake/`**, raw. Only the copy a scene actually
  uses is staged into `public/assets/<project>/`, cut out, named and sized.
- **Use them as given.** Do not recolour, crop, filter or "improve" them. If a photo clashes with
  the film's palette, that is not yours to silently fix.
- **Check they work at video size.** Anything under roughly 800px wide will look soft filling a
  1920×1080 frame. Say so and ask for a bigger file rather than upscaling it.
- **Say it once if something genuinely clashes** — a saturated image beside a quiet palette, or a
  picture with its own heavy branding. Offer, don't insist: *"That one sits a bit oddly against
  the background — want me to put it on a plain panel, or leave it as it is?"* Then do what they
  say.
- **Any text over their image sits on its own opaque panel** — a caption, a label, a title, a name
  bar. Contrast cannot be computed against a photograph's light and dark patches, so give the
  text one background that can be. That rule is in `asu-visual-style` → `accessibility.md` and
  applies whichever style was chosen; the caption panel in `building-scenes` →
  `reference/captions.md` already follows it.
- **Reference a staged copy as** `{ type: "image", src: "assets/<project>/<file>", alt: "..." }`.
  **`src` is the full path under `public/`**, because that is what `staticFile()` takes —
  `staticFile(figure.src)`, with no prefix added anywhere. Never build the path by concatenation.
- **An `alt` is not decoration.** Write what the picture actually shows; it is the record of what
  the visual contributes.
- **A picture they found online is their call.** See *Pictures found online* below.
- **A clip is footage, not a picture.** It goes through `working-with-footage`.

## Route 3 — I write the prompts, they generate

They take the prompts to an image tool they use, generate the pictures there, and send them back.
From that point it is route 2: the results go in `content/<project>/intake/`, and only the copies
used are staged.

- **One shared style paragraph in front of every prompt**, the same words every time.
  `choosing-a-visual-style` writes it with the style card; `content/live-showcase/docs/assets.md`
  is the worked example.
- **Transparent background, no baked shadow, at least 2× the on-screen size.**
- **Say where to put them when they come back**, and build everything that does not depend on them
  meanwhile.
- **What their tool costs is between them and their tool.** Do not steer them to a paid one.

> **Do not hand a ready-made pack's diagrams to an image generator.** A cold run walked straight
> into this. The packs name *precision* figures — "a twelve-segment wheel with red and green
> opposite and the mixed result in the centre" — where the accuracy **is** the teaching content.
> Generators reliably return the wrong segment count, the wrong hue order and garbled labels, and
> a beautiful wrong colour wheel teaches the wrong thing.
>
> **Say so and offer the split**: they generate backdrops, atmosphere and illustrative imagery;
> you draw the diagram that carries the explanation, in their style, on top. Offer it once and do
> what they choose.

## Generating here is paid, and opt-in

Generating pictures from this project, through an image service's API, is **not one of the three
routes**. `ACCESS.md` lists no free image generator, and `AGENTS.md` forbids paid calls without
explicit approval.

Raise it only when a picture genuinely cannot be drawn and they have nothing to supply, and only
as a specific proposal: the one picture that is blocked without it, the exact service and feature,
the number of attempts, and the total cost. Generate nothing until they approve that proposal in
so many words. No subscriptions, trials or stored payment methods, whatever the saving.

## Pictures found online

*"Can you just grab an image of the stadium?"* **A picture found online is the person's call.** It
belongs to whoever made it; memes, screenshots and reference images often sit in a grey area, and
whether to use one is theirs to decide, not yours to refuse.

- **Say it once, plainly, and offer the free alternative** — a landmark, a building or an object
  can be drawn as a shape in the film's style. Then do what they decide. Do not lecture, and do not
  raise it again during the build.
- **If they want it**, they send the file or the link; fetch it if asked. It goes in
  `content/<project>/intake/` like anything else they supply, and is staged the same way.
- **Record it in the brief**: where it came from, and that using it was *theirs*.
- **If the film is going public**, the delivery check in `viewing-and-rendering` lists it once
  more — a reminder, not a gate.
- **Their own photo** needs the agreement of anyone recognisable in it.

> That picture belongs to whoever made it, so whether to use it is your call. I can use it if you
> send it or point me to it — or I can draw it as a simple shape instead.

## Mixing sources

Common and fine — their logo over drawn figures, or two supplied photos among four drawn ones.
Keep it coherent:

- **Same background, same type, same caption treatment** across every scene, whatever the picture
  is.
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
point in the conversation. **Never recreate, redraw or trace a logo**, theirs or ASU's. It is the
one kind of picture that never gets drawn in code: it comes from the file they send, or it does
not appear. For an ASU logo, **`asu-visual-style/logo.md` governs it completely.**

There is no ASU logo file in this repository. If they have not sent one, there is nothing to
place.

## Where files live

- **Anything they hand in:** `content/<project>/intake/`, raw — create it if it does not exist, so
  nobody hunts for a folder that isn't there.
- **The copies a scene uses:** staged into `public/assets/<project>/`, cut out, named and sized.
  Everything in `public/` is copied into every render, so it is not storage.
- **Anything drawn in code** lives in the scene code. There is no file to keep.
- **Reference everything with `staticFile()`**, paths relative to `public/` and never starting
  with a slash.
- **Keep files small.** This repository is public and people clone it.
