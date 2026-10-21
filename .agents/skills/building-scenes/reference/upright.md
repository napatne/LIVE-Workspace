# Upright and square frames

How to lay out a film that will be watched on a phone held upright (9:16) or in a square feed
slot (1:1). It is a different layout from the wide one, not the wide one cropped.

## Contents

- [The frame](#the-frame)
- [Where the platform covers the frame](#where-the-platform-covers-the-frame)
- [Centre on the safe box, not the frame](#centre-on-the-safe-box-not-the-frame)
- [Type sizes for a phone held upright](#type-sizes-for-a-phone-held-upright)
- [The caption panel](#the-caption-panel)
- [Diagrams in a tall frame](#diagrams-in-a-tall-frame)
- [When the shape changes after scenes exist](#when-the-shape-changes-after-scenes-exist)
- [Sources and measurements](#sources-and-measurements)

## The frame

| Shape | Size built here | Where it goes |
| --- | --- | --- |
| Upright 9:16 | **1080×1920** | TikTok, Instagram Reels, YouTube Shorts, phone stories |
| Square 1:1 | **1080×1080** | Feed posts, some course platforms |

Frame rate as the brief recorded — 30 unless the film is built on footage. Put `WIDTH`, `HEIGHT`
and `FPS` in one constants file and derive every position from them; the registration reads the
same constants. Platform minimums and recommended sizes are in the dated block at the end.

**Phones taller than 9:16 trim or pad the edges**, so nothing that matters goes right up to any
edge, even where no platform button sits.

## Where the platform covers the frame

On TikTok, Reels and Shorts the app draws over the video: the account name, the post's caption
and the sound title along the bottom, a column of buttons up the right, search and tabs across
the top. Anything under them is unreadable. The platforms publish these zones for **ads**; the
ordinary feed uses the same layout, but nobody publishes it separately, and it moves between app
versions. Treat the numbers as the best available, not as exact.

Margins to keep clear, in pixels of a 1080×1920 frame:

| Platform | Top | Right | Bottom | Left | Status |
| --- | --- | --- | --- | --- | --- |
| Instagram Reels (Meta) | 269 (14%) | 65 (6%) | 672 (35%) | 65 (6%) | Read from Meta's own ads guide |
| YouTube Shorts | 288 | 192 | 672 | 48 | Estimate: Google prints them on an image; read by a third party |
| TikTok | 240 | 120 | 660 | 120 | Estimate: from TikTok's downloadable files, read by a third party |
| **All three** | **288** | **192** | **672** | **120** | The largest of each |

**The all-three safe box is x 120–888, y 288–1248: 768 wide, 960 tall.** Build to it unless the
brief names one platform, and then use that platform's row. TikTok says its zone shrinks as the
post caption grows; a long caption covers more than the table shows.

**Square** has no published overlay zone that this file could find. Keep the wide film's margin
as a proportion — 140px of 1920 is about 7%, so about 76px on each edge of 1080 — and check the
result in the platform's own preview before posting.

## Centre on the safe box, not the frame

The safe box is not in the middle of the frame. Its centre is at (504, 768); the frame's is at
(540, 960). A title centred on the frame sits 192px low and drifts into the caption zone; a figure
centred on the frame loses its lower third to the account name.

```ts
// From the brief's platform, or the all-three row.
export const SAFE = { top: 288, right: 192, bottom: 672, left: 120 } as const;
export const BOX = {
  x: SAFE.left,
  y: SAFE.top,
  w: WIDTH - SAFE.left - SAFE.right,   // 768
  h: HEIGHT - SAFE.top - SAFE.bottom,  // 960
};
export const BOX_CX = BOX.x + BOX.w / 2;
export const BOX_CY = BOX.y + BOX.h / 2;
```

Everything that carries meaning is placed from `BOX`. Backgrounds, surfaces and texture still
fill the whole frame — the box is where reading happens, not where the picture stops.

## Type sizes for a phone held upright

An upright film fills a phone's width, so the whole 1080px frame is a few centimetres across.

- **The floor in `asu-visual-style/typography.md` still holds** — nothing below it, ever. On a
  phone it is a floor, not a working size.
- **Working minimums for a 1080-wide frame**, from the vendored Remotion guidance
  (`remotion-best-practices/remotion-create/video-layout.md`): **headline 84px, important
  supporting text 44px.** Captions are supporting text, so 44px is their minimum.
- **Weights and contrast** follow the style card and `asu-visual-style` as for any film.

**Fewer words per line.** At 44px bold, the rough width estimate in
[diagrams.md](diagrams.md) (`length × size × 0.58`) gives about 30 characters across the 768px
box — around five words, not the nine a wide caption holds. Chunk captions to fit and measure the
real text rather than trusting the estimate.

Check sizes by looking at a still **on a phone**, at full screen. A monitor at full size flatters
small type.

## The caption panel

- **Its bottom edge sits on the safe box's bottom** (y 1248 for all three), above the platform's
  own caption and buttons — not at the bottom of the frame.
- **Its sides stay inside the box** (x 120–888), so the right-hand button column never covers the
  end of a line.
- **Two lines at most.** A third climbs into the picture.
- **The figure stops above the panel**, with the same clearance rule as the wide frame: derive the
  figure area's bottom from the panel's top, never type both.

## Diagrams in a tall frame

The wide trap — a circle sized by the height leaves the width empty — turns over: a shape sized
by the width leaves the height empty, and a left-to-right row gets narrow.

- **Run sequences top to bottom.** A flow of three to five steps stacks; across 768px, three boxes
  side by side is about the limit before labels shrink to the floor.
- **Bars run sideways, stacked down the box**, so each label has the full width.
- **A cycle becomes an upright ellipse**, two radii as in the wide frame, sized to the box.
- **Match the viewBox to the box (4:5 for the all-three box)**, not to the frame, or it letterboxes.
- **Split a busy figure over two beats** rather than shrinking it.
- **Headings start at the top of the box**, not at the top of the frame.

## When the shape changes after scenes exist

Take the change, say what it costs, and never say it is too late.

- **Do not crop.** A wide film cut down to 9:16 loses its sides, its text and its figures, and
  ignores the platform zones. Do not offer it as the cheap option.
- **Re-author the layout, scene by scene.** Same script, same timing, same timeline and score —
  the shape changes positions, not lengths. New positions come from the new constants and the
  safe box. It is close to the original layout work again; say so.
- **Pictures are a shape too.** A 16:9 image may need re-framing or a new one (`creating-assets`).
- **Ask what happens to the wide registrations**, and record the answer in the brief as theirs, in
  a new row rather than by editing the old one:
  - *Switch* — the upright compositions replace the wide ones once they play. Git keeps the old.
  - *Keep both* — register the upright film under its own IDs (`<Film>Upright`) in the same
    registration file, in a subfolder. Every later change is then made twice.
  - *Keep the wide as superseded* — move it to a `Superseded-wide` subfolder until they say
    delete it, if a venue may still want wide.

## Sources and measurements

Accessed **2026-10-21** unless stated. Platform layouts and published zones change; re-check
before relying on a number.

- **Meta (Instagram Reels)**: Meta Ads Guide, Instagram Reels video —
  <https://www.facebook.com/business/ads-guide/update/video/instagram-reels>. "Consider leaving
  at least 14% of the top, 35% of the bottom, and 6% on each side" free of text and logos;
  recommends 9:16 at 1440×2560. Percentages converted to 1080×1920 here.
- **YouTube Shorts**: Google Ads Help, *Use square and vertical video* —
  <https://support.google.com/google-ads/answer/9128498?hl=en>. Shows a 1080×1920 safe-zone image
  whose pixel values could not be read directly. The figures in the table are Socialync's reading
  of that image, checked by them 2026-10-11 —
  <https://www.socialync.io/tools/safe-zones/youtube-shorts>. **Estimate.**
- **TikTok**: TikTok Ads Help, *Auction In-Feed Ads* (updated June 2026) —
  <https://ads.tiktok.com/help/article/tiktok-auction-in-feed-ads?lang=en>. Gives no pixel
  margins in text; offers downloadable safe-zone files; says the zone depends on shape, caption
  length and add-ons. Recommends 9:16 at 540×960 or larger. The figures in the table are
  Socialync's reading of those files (drawn on 720×1280, scaled), checked by them 2026-10-11 —
  <https://www.socialync.io/tools/safe-zones/tiktok>. **Estimate.**
- **2026-10-20 test run**: an assistant estimated a safe box of top 300, right 150, bottom 480,
  left ~100 with no source. Its bottom margin is about 190px short of every published figure
  above; it is superseded by the table.
