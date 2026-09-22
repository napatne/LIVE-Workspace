import { Easing, interpolate } from "remotion";

/**
 * Shared visual language for the LIVE showcase — the silent paper-collage film
 * about this repository. The length band was 30-40s, then 50-60s, and is 60-70s
 * as of 2026-09-02. **Do not restate the running time here** — `MasterFilm.tsx`
 * owns it; the figure that used to sit in this line was eight seconds stale.
 *
 * Storyboard:  `content/live-showcase/docs/storyboard.md`
 * Script:      `content/live-showcase/docs/script.md`
 * Assets:      `content/live-showcase/docs/assets.md`
 * Scene guide: `content/live-showcase/docs/building-a-scene.md`
 *
 * Written during the Milestone 1 style test. Milestone 2 extracts the kit from
 * whatever proves out here — so treat everything below as provisional until the
 * director has judged the style test.
 */

export const WIDTH = 1920;
export const HEIGHT = 1080;
export const SAFE_MARGIN = 140;

/** 30 — settled 2026-09-01 by the director. Never mixed within the film. */
export const FPS = 30;

/**
 * Manifest §1. Given to the generator as hex, and used here as hex.
 *
 * `green` is the one addition to the manifest's six, made 2026-09-02 by the
 * director for Scene 5: the audio track laid under the film line needs to read
 * as a different kind of thing from the picture, and green is the convention
 * every editing timeline already uses. It is Risograph Green — a real riso ink,
 * so it belongs in a film whose whole look is riso-print, and it sits beside
 * periwinkle without fighting it. **It means "sound" and nothing else.** Do not
 * spend it on decoration.
 */
export const COLORS = {
  paper: "#F4F1EA",
  periwinkle: "#5B4EE8",
  red: "#FF4438",
  butter: "#FFC94D",
  green: "#00A95C",
  ink: "#14120F",
  halftone: "#B8B4AC",
};

export const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);
export const EASE_IN_OUT = Easing.bezier(0.62, 0, 0.38, 1);
export const EASE_IN = Easing.bezier(0.45, 0, 0.9, 0.45);

/** Clamped 0..1 progress between two frames. */
export const ramp = (
  frame: number,
  start: number,
  end: number,
  easing = EASE_OUT,
) =>
  interpolate(frame, [start, end], [0, 1], {
    easing,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

/**
 * Storyboard rule 3: "Paper steps, the machine glides."
 *
 * Every paper element in the film animates on twos — an effective 15fps — while
 * the clapboard slam runs at the full 30. The contrast is the point, so this is
 * a foundational decision rather than a styling one, and it is one of the three
 * things the style test exists to have judged.
 *
 * Quantise the frame BEFORE deriving any animation from it. Do not quantise the
 * output of an interpolate — that steps the value but leaves the timing smooth,
 * which is the wrong half of the effect.
 *
 *   const f = onTwos(useCurrentFrame());   // 👍
 *   const y = Math.round(smoothY / 2) * 2; // 👎
 */
export const onTwos = (frame: number) => Math.floor(frame / 2) * 2;

/**
 * A spring that overshoots and settles, evaluated at an arbitrary time in
 * frames. Used for paper landing on the page.
 *
 * Deliberately not Remotion's `spring()`: this is sampled on twos, so it has to
 * be a plain function of a (quantised) frame number rather than something tied
 * to the real frame clock.
 */
export const settle = (t: number, period = 13, damping = 0.42) => {
  if (t <= 0) return 0;
  return 1 - Math.exp(-damping * t) * Math.cos((t / period) * Math.PI * 2);
};

/**
 * Deterministic pseudo-random in 0..1 from an integer seed.
 *
 * Confetti, paper drift and riso offsets all need to be identical on every
 * render — Remotion renders frames out of order and in parallel, so anything
 * seeded from Math.random() or from wall-clock time will strobe.
 */
export const seeded = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
