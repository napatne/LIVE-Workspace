import { layout, type Answers, type SegmentSpec } from "../kit/model";
import paths from "../../../web/interactive-demo/paths.json";

/**
 * The interactive kit's own demo: one question, one detour, two paths. It
 * exists to show the mechanism and to test it - copy this folder to start a
 * real interactive film, then replace the segments and the scenes.
 *
 *   intro ─▶ ask: route ─┬─ short ───────────────▶ end
 *                        └─ long ─▶ detour-long ─▶ end
 *
 * Frames are real frames at 30 fps.
 */
export const DEMO_SEGMENTS: readonly SegmentSpec[] = [
  { id: "intro", frames: 90 },
  { id: "ask-route", frames: 150, ask: { choice: "route", options: ["short", "long"], holdAt: 60 } },
  { id: "detour-long", frames: 120, onlyIf: { choice: "route", option: "long" } },
  { id: "end", frames: 120 },
];

/**
 * Every path a viewer can take, keyed by its exact composition id - each one
 * registered and rendered as a plain video. The list lives in the page's
 * folder, web/interactive-demo/paths.json, because scripts/interactive-handout.mjs
 * reads it too: the compositions registered and the videos handed out are the
 * same list, and the hand-out clicks through the page once per entry.
 */
export const DEMO_PATHS: Record<string, Answers> = paths;

/** Words for the page around the Player: each question, and each option. */
export const DEMO_LABELS: Record<string, string> = {
  route: "Which way",
  short: "the short way",
  long: "the long way",
};

export const demoDuration = (answers: Answers): number => layout(DEMO_SEGMENTS, answers).total;

/** Every segment in one timeline - what the web page's Player plays. */
export const DEMO_FULL = layout(DEMO_SEGMENTS, "all");
