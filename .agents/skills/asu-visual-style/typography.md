# Typography

Verified against <https://brandguide.asu.edu/brand-elements/design/fonts> and
<https://accessibility.asu.edu/articles/typography> on **2026-09-19**.

## Which font

**Use Arial.**

ASU's fonts page names exactly these, and adds: *"Do not use any additional fonts, including
decorative and script fronts, as they interfere with the clear articulation of the ASU brand."*

| Font | What the page says it is for |
| --- | --- |
| **Neue Haas Grotesk** | Primary for print, video and Adobe software. Licensed via Adobe Fonts. |
| **Arial** | Primary digital, web and system font for non-Adobe applications. |
| Akzidenz Grotesk | Being phased out; retained for logos and permanent signage. |
| Font Awesome Free | Icon set. |
| Sun Devil Bold | Sun Devil Athletics only. |

**Neue Haas Grotesk is what ASU wants for video, but it is licensed and this repository is
public** — we cannot ship it, and most people opening this project will not have an Adobe
licence. **Arial is the named alternative for non-Adobe applications**, it is on every machine
that will ever render this, and it needs no loading at all.

```ts
// No font loading. Arial is a system font, and the ASU web font stack
// covers machines that spell it differently.
export const ASU_FONT =
  'Arial, Helvetica, "Nimbus Sans L", "Liberation Sans", FreeSans, sans-serif';
```

Apply it on the root `<AbsoluteFill>`. SVG `<text>` inherits `font-family` through CSS, so
diagram labels pick it up without being set individually.

> **Correction, 2026-09-19.** An earlier version of this file told you to use **Roboto** and
> called it "ASU's free secondary, sanctioned by the brand guide." **That was wrong.** The word
> Roboto does not appear on ASU's fonts page at all. It survives in older and unit-level
> sources — a Thunderbird page, an ASU Web Toolkit PDF — but the enterprise brand guide names
> Arial and forbids additions. If you find a project file still specifying Roboto, it predates
> this correction; change it.

**Do not use Inter, Roboto, or any other typeface you happen to like.** The brand guide is
explicit that additional fonts are not permitted.

### Weights

Arial ships **regular (400)** and **bold (700)**. Anything else — 500, 600, 900 — is
**synthesised by the browser** and renders as a smeared approximation.

**Use 400 and 700 only.**

## Sizes

A video is read at a distance and often in a small window, so everything runs larger than it
would on a web page.

```ts
export const TYPE = {
  title: 104,      // title card only
  subtitle: 44,
  heading: 62,     // section heading
  bullet: 38,
  caption: 40,
} as const;

// NO figureLabel here. Text inside a diagram is drawn in viewBox units, not
// pixels, so a number in this pixel scale is meaningless there and invites
// exactly the mistake that shrank every label by 40% when the viewBox moved.
// Figure text is FIGURE_TEXT in .agents/skills/building-scenes/reference/diagrams.md, derived from the
// viewBox so the two cannot drift apart again.

```

**Nothing below 22px.** ASU gives no hard minimum, only that "small fonts are difficult to
read for those with low vision and should be avoided" — 22px is the floor at which text stays
readable when someone watches at quarter size.

**Text inside a diagram is a separate matter.** Figures are drawn in viewBox units, and how
those map to pixels depends on the viewBox. Do not reach into this scale for them — use
`FIGURE_TEXT` from `.agents/skills/building-scenes/reference/diagrams.md`, which derives from the viewBox. A flat number
here silently shrank every diagram label by 40% the last time the viewBox changed.

Weights: **700** for titles, headings, captions and bullets. **400** for body text. Nothing
else — see the weights note above.

## Spacing — ASU's stated numbers

| Rule | Value |
| --- | --- |
| Line spacing within a paragraph | **at least 1.5** |
| Paragraph spacing | **at least 1.5×** the line spacing |
| Line length | **no more than 80 characters** |

The line-length rule is why captions are chunked rather than dumped — see
[accessibility.md](accessibility.md).

## Formatting restrictions

ASU's accessible typography guidance is explicit:

- **Never underline text unless it is a link.** In a video nothing is a link, so **never
  underline**. Use weight or colour for emphasis.
- **All-caps, italics, bold, justified text and decorative fonts: sparingly.** All-caps in
  particular is harder to read and is read oddly by screen readers. A short title card in caps
  is fine; a sentence is not.
- **Don't justify text.** The uneven word spacing creates rivers that make lines hard to
  track.

## Contrast

**4.5:1 minimum** for text against its background. ASU's own web standard is `#2a2a2a` on
white, which is 14.35:1 — they aim well past the minimum, and so should we.

Which pairs pass is in [color.md](color.md). The one to remember: **gold is never text on
anything light.**

## Resizing

ASU requires content to survive 200% enlargement without losing legibility or function. That
rule is written for web pages and does not map cleanly onto a fixed-resolution video — a video
is enlarged by the player, not by reflowing text.

**What it means for us instead:** design so the video is still readable when *shrunk*. Check a
still at a quarter of full size. If a diagram label disappears, it is too small, whatever the
type scale says.
