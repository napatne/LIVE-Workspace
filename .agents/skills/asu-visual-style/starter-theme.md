# Starter theme

**Copy this into the video you are building.** It is the whole of `color.md` and
`typography.md` expressed as code, so you don't have to transcribe hex values by hand — which
is how `#747474` ends up in a video it should never be in.

Read the other files for *why*. This is the *what*.

```ts
// ASU visual style. Colours, sizes and spacing verified against ASU's
// published brand and accessibility guides on 2026-09-19 — see the other
// files in this folder for sources and for what is NOT from ASU.

// Arial: named by the brand guide as the primary digital/web/system font for
// non-Adobe applications. Nothing to load — it is a system font, so there is
// no font-loading step that can fail. Neue Haas Grotesk is ASU's first choice
// for video but is licensed and cannot ship in a public repo.
// NOT Roboto. NOT Inter. The brand guide forbids additional fonts.
export const ASU_FONT =
  'Arial, Helvetica, "Nimbus Sans L", "Liberation Sans", FreeSans, sans-serif';

// Arial has 400 and 700 only. 500/600/900 are synthesised and look smeared.
export const WEIGHT = { regular: 400, bold: 700 } as const;

export const ASU = {
  // Primary — the brand
  maroon: "#8C1D40",
  gold: "#FFC627",
  black: "#000000",
  white: "#FFFFFF",

  // Secondary — for charts with more than two series
  green: "#78BE20",
  blue: "#00A3E0",
  orange: "#FF7F32",
  copper: "#AF674B",
  turquoise: "#4AB7C4",
  pink: "#E74973",

  // Grayscale. ASU Gray #747474 is deliberately absent — see the note below.
  gray1: "#191919",
  gray2: "#484848",
  gray4: "#BFBFBF",
  gray5: "#D0D0D0",
  gray6: "#E8E8E8",
  gray7: "#FAFAFA",
} as const;

// ASU Gray #747474 is deliberately absent from this block. It is a real brand
// colour and it passes on PURE WHITE (4.67:1) — but on the warm background
// below it is 4.44:1, which fails AA for body text. Since that background is
// what this theme uses, reaching for it is a trap. Use gray2 (8.69:1).

export type Theme = {
  background: string;
  ink: string;
  inkSoft: string;
  primary: string;
  accent: string;
  figureStroke: string;
  onAccent: string;
  figureStrokeAlt: string;
  captionBackground: string;
  captionInk: string;
};

// NO `as const` here. With it, primary narrows to the literal "#8C1D40" and
// NEUTRAL's navy is not assignable, so the two cannot sit in one Record and
// the theme cannot be a prop. Annotate with Theme instead.
export const THEME: Theme = {
  // NOT an ASU colour. A warm off-white that reads better than pure white on
  // screen; every pair below was computed against it. ASU White #FFFFFF is the
  // brand value and is also fine — but if you switch, recompute, because
  // #747474 flips from failing to passing across exactly this difference.
  background: "#FBF9F4",
  ink: ASU.gray1,        // 16.71:1 on the background
  inkSoft: ASU.gray2,    //  8.69:1 — secondary text, axes
  primary: ASU.maroon,   //  8.44:1 — headings, diagram strokes
  accent: ASU.gold,      //  FILL ONLY. 1.49:1 on this background (1.57:1 on
                         //  pure white). Both fail 4.5:1 — ASU bans gold text
                         //  on light outright.
  figureStroke: ASU.maroon,

  // Text sitting ON a gold fill — cycle nodes, flow boxes. 11.18:1.
  // You need this: the obvious guess is white, which is 1.57:1 and is one
  // of the four combinations ASU bans outright.
  onAccent: ASU.gray1,

  // A meaning-carrying line that is NOT maroon. Gold is 1.49:1 and fails
  // the 3:1 WCAG wants for graphical objects — it is a fill, never a line
  // that means something. Copper is an ASU secondary at 4.10:1.
  figureStrokeAlt: ASU.copper,

  captionBackground: "rgba(26, 26, 26, 0.86)",
  captionInk: ASU.white,
};

// Larger than web type: a video is watched at a distance, often in a small
// window. Nothing below 22px. Use WEIGHT.bold or WEIGHT.regular — nothing else.
export const TYPE = {
  title: 104,
  subtitle: 44,
  heading: 62,
  bullet: 38,
  caption: 40,
} as const;

// NO figureLabel here. Text inside a diagram is drawn in viewBox units, not
// pixels, so a number in this pixel scale is meaningless there and invites
// exactly the mistake that shrank every label by 40% when the viewBox moved.
// Figure text is FIGURE_TEXT in .agents/skills/building-scenes/reference/diagrams.md, derived from the
// viewBox so the two cannot drift apart again.


// ASU requires line spacing of at least 1.5.
export const LINE_HEIGHT = 1.5;
```

## Using it

**Read it through a context, never by importing `THEME` directly.** The person can change
their mind about ASU colours during refinement — the `building-a-video` skill rule 7 — and that has to
be a prop change, not a file edit.

```tsx
// shared/theme.ts
export const ThemeContext = React.createContext<Theme>(THEME);
export const useTheme = () => React.useContext(ThemeContext);

// shared/types.ts — the prop accepts a shipped name OR a described theme.
// Step 5 option 3 lets someone describe a look in their own words, so a
// closed union of "asu" | "neutral" would make that question unanswerable.
export type ThemeChoice = ThemeName | Theme;

// the composition root — resolve ONCE, then pass the object down
const theme = typeof themeProp === "string" ? THEMES[themeProp] : themeProp;

<ThemeContext.Provider value={theme}>
  {/* ASU_FONT, not theme.font — `Theme` has no font member and never had one.
      The brand guide forbids additional fonts, so the family is fixed for every
      theme and does not belong in the palette. */}
  <AbsoluteFill style={{ backgroundColor: theme.background, fontFamily: ASU_FONT }}>

// every component below it
const theme = useTheme();
```

**Never write `THEMES[themeProp]` at the point of use.** It throws `undefined` the moment the
prop is an object rather than a name, and the failure is a blank background rather than an
error. Resolve it once at the root and let everything below read a `Theme`.

**Every snippet in `building-scenes` writes `THEME.x` for brevity. Read that as `theme.x` from
`useTheme()`.** Copy-pasting them literally builds a video whose `theme` prop does nothing —
and it will compile, lint and render, so nothing tells you.

Set the font once on the root. SVG `<text>` inherits `font-family` through CSS, so diagram
labels pick it up without being set individually.

## When the person said no to ASU style

Keep the structure, drop the brand. Swap `primary` and `accent` for a neutral pair, keep the
greys and the type scale, and **keep every accessibility rule** — contrast, captions and
describing your visuals are not ASU-specific.

```ts
export const NEUTRAL: Theme = {
  ...THEME,
  primary: "#1F3A5F",        // 10.91:1 on the background
  accent: "#E8B04B",         // fill only, 1.86:1 — same rule as gold
  figureStroke: "#1F3A5F",
  // MUST be overridden. Spreading THEME otherwise leaves ASU Copper in a
  // theme the person chose BECAUSE they said no to ASU style.
  figureStrokeAlt: "#6B4C8A", // 6.6:1, and clearly distinct from the navy
  onAccent: "#191919",       // 8.99:1 on the amber
};

// The two shipped themes in one map. A described theme (step 5 option 3)
// is not in here — it arrives as a Theme object and skips the lookup.
export const THEMES: Record<ThemeName, Theme> = {
  asu: THEME,
  neutral: NEUTRAL,
};
```

**Compute the contrast on anything you substitute.** The script is in
[accessibility.md](accessibility.md). Do not assume a colour that looks dark enough is dark
enough — `#747474` looks fine and fails.

**A described theme is a whole palette to check, not one colour.** Build the object, then
compute every pair it produces — text on background, figure stroke on background, label on
fill. Someone describing a look in words has not agreed to an unreadable one, and they cannot
tell from the description that it will be.

**On a dark background, the figure specs in `.agents/skills/building-scenes/reference/diagrams.md` invert.** Those
outline-and-gap rules were measured against the light page: the `ink` outline they specify
is near-invisible on black. **Recompute them for the background you actually have** — the
principle holds (every boundary carried by an outline *or* a gap, never only by fill) but the
colours that carry it swap over.

## Quick contrast reference

Everything in `THEME` above already passes against `background`. These were computed, not
estimated — the caption figure accounts for the panel's 86% opacity compositing over the
background:

| Pair | Ratio | AA text |
| --- | --- | --- |
| `ink` on `background` | 16.71:1 | pass |
| `primary` on `background` | 8.44:1 | pass |
| `inkSoft` on `background` | 8.69:1 | pass |
| `captionInk` on `captionBackground` | 11.51:1 | pass — **at full opacity**; see below |
| `onAccent` on `accent` (gold fill) | 11.18:1 | pass |
| `figureStrokeAlt` on `background` | 4.10:1 | pass — and clears 3:1 for graphics |
| **`accent` on `background`** | **1.49:1** | **fails — fill only, never a line or text** |

**The caption figure is the steady state.** `captions.md` fades the whole panel in over five
frames, so mid-fade the composited contrast passes through ~1.4:1 and ~3.6:1 before settling.
That is a transition, not a state, and WCAG applies to states — but do not quote 11.51:1 as if
it held for every frame. Keep the fade short.
