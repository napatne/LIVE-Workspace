# Colour

Verified against <https://brandguide.asu.edu/brand-elements/design/color> on **2026-09-19**.

## The palette

### Primary — the brand

| Name | Hex |
| --- | --- |
| ASU Maroon | `#8C1D40` |
| ASU Gold | `#FFC627` |
| ASU Rich Black | `#000000` |
| ASU White | `#FFFFFF` |

### Secondary — for diagrams that need more than two colours

| Name | Hex | | Name | Hex |
| --- | --- | --- | --- | --- |
| Green | `#78BE20` | | Copper | `#AF674B` |
| Blue | `#00A3E0` | | Turquoise | `#4AB7C4` |
| Orange | `#FF7F32` | | Pink | `#E74973` |
| Gray | `#747474` | | | |

**Use these rather than inventing colours** when a chart needs several series. They are
sanctioned, and they sit together properly.

> **None of them is safe for text, and only two clear 3:1 for a shape.** Measured against the
> page background `#FBF9F4`:
>
> | | | Ratio | Text (4.5:1) | Shape (3:1) |
> | --- | --- | --- | --- | --- |
> | Green | `#78BE20` | 2.17:1 | no | **no** |
> | Blue | `#00A3E0` | 2.73:1 | no | **no** |
> | Orange | `#FF7F32` | 2.39:1 | no | **no** |
> | Turquoise | `#4AB7C4` | 2.25:1 | no | **no** |
> | Pink | `#E74973` | 3.57:1 | no | yes |
> | Copper | `#AF674B` | 4.10:1 | no | yes |
> | Gray | `#747474` | 4.44:1 | **no** — see the `#747474` warning below | yes |
>
> **So: fills and series colours, never labels.** Put every label in `ink` or Gray 2, not in
> the colour of the thing it names. And if a shape has to stand alone at these ratios, give it
> an outline the way `diagrams.md` does for the wheel — the outline carries the boundary the
> fill cannot.
>
> A cold run reached for this table for a three-series bar chart and had to compute the
> numbers itself to find out four of the seven were unusable. They are here now.

### Grayscale

| Step | Hex | Use |
| --- | --- | --- |
| Gray 1 | `#191919` | Body text, diagram labels |
| Gray 2 | `#484848` | Secondary text, axes |
| Gray 3 | `#747474` | **Read the trap below before using this.** |
| Gray 4 | `#BFBFBF` | Borders |
| Gray 5 | `#D0D0D0` | Dividers |
| Gray 6 | `#E8E8E8` | Panel fills |
| Gray 7 | `#FAFAFA` | Page background |

## As tokens

```ts
export const ASU = {
  maroon: "#8C1D40",
  gold: "#FFC627",
  black: "#000000",
  white: "#FFFFFF",

  green: "#78BE20",
  blue: "#00A3E0",
  orange: "#FF7F32",
  // Gray 3. Passes on pure white (4.67:1), FAILS on a warm off-white
  // background (4.44:1). Read the warning below before reaching for it.
  gray: "#747474",
  copper: "#AF674B",
  turquoise: "#4AB7C4",
  pink: "#E74973",

  gray1: "#191919",
  gray2: "#484848",
  gray4: "#BFBFBF",
  gray5: "#D0D0D0",
  gray6: "#E8E8E8",
  gray7: "#FAFAFA",
} as const;
```

For video, a warm off-white background `#FBF9F4` reads better than pure white and still
clears AA against every text colour below. Pure `#FFFFFF` is also fine and is the brand value.

## What is banned, and why

ASU explicitly forbids four combinations. These are the measured contrast ratios:

| Combination | Ratio | Verdict |
| --- | --- | --- |
| **Gold text on white** | **1.57:1** | banned — effectively invisible |
| **White text on gold** | **1.57:1** | banned — same pair inverted |
| **Maroon text on black** | **2.36:1** | banned |
| **Black text on maroon** | **2.36:1** | banned |

**The rule that follows: gold is a fill colour.** Use it behind things — shape fills,
highlights, the rule under a title. Never set type in gold on anything light.

## What passes

| Text on background | Ratio | AA text (4.5:1) |
| --- | --- | --- |
| Maroon on white | 8.88:1 | pass |
| Maroon on `#FBF9F4` | 8.44:1 | pass |
| White on maroon | 8.88:1 | pass |
| Gold on black | 13.36:1 | pass |
| Black on gold | 13.36:1 | pass |
| Gold on maroon | 5.65:1 | pass |
| Maroon on gold | 5.65:1 | pass |
| Gray 1 on `#FBF9F4` | 16.71:1 | pass |
| Gray 2 on `#FBF9F4` | 8.69:1 | pass |
| White on black | 21.00:1 | pass |

### One trap worth knowing

**ASU Gray `#747474` passes on pure white and fails on our background.**

| On | Ratio | AA body text |
| --- | --- | --- |
| `#FFFFFF` — ASU White | **4.67:1** | passes, barely |
| `#FBF9F4` — this project's background | **4.44:1** | **fails** |

A difference that small flipping the verdict is exactly why you compute rather than eyeball.
It is a real brand colour, so it is easy to reach for and easy to get wrong.

**Use Gray 2 `#484848` for secondary text** — 8.69:1 on either background, and visually almost
the same.

## How to use them

- **Maroon carries meaning.** Headings, the strokes of a diagram, the thing being emphasised.
- **Gold carries attention.** Filled shapes, the one element you want looked at.
- **Don't flood large areas with maroon** — it goes muddy at 1080p, and it forces white text,
  which limits what else can sit on it.
- **Two colours is usually enough.** Reach into the secondary palette only when a chart
  genuinely has more than two series to distinguish.
- **Never encode meaning in colour alone.** Someone who cannot distinguish two of these hues
  must still be able to read the chart — label the series, or vary the shape as well.

## Before you commit to a pair

Compute it. Do not eyeball it. The script is in [accessibility.md](accessibility.md).
