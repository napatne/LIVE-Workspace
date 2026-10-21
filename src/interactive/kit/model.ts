/**
 * Interactive video kit — the model. Pure data and pure functions: no React,
 * no Remotion, so it can be run and checked on its own.
 *
 * A film is a list of SEGMENTS in order. Three kinds of thing can happen to a
 * viewer, and all three are the same mechanism:
 *
 *   - a segment carrying `ask` is a CHOICE POINT — the Player stops on its
 *     `holdAt` frame and waits for a click;
 *   - a segment carrying `onlyIf` is a DETOUR — it plays only when that choice
 *     was answered that way;
 *   - everything else is the main line.
 *
 * The web page lays every segment out in one timeline (`"all"`) and *skips*
 * the detours that do not apply, by seeking over them whenever the playhead
 * enters one (`skipTarget`). Studio and renders lay out only the segments one
 * set of answers would play, so one path is one ordinary, reviewable video -
 * and the page plays exactly the segments that video shows.
 *
 * ## The policy
 *
 * 2 or 3 options a question, at most 3 questions, at most 2 of them able to
 * skip a detour, and every detour rejoins the main line. "Able to skip a
 * detour" counts questions, not detours: a question with a detour for each of
 * its options is one of the 2.
 *
 * Small on purpose: a film with these limits has a handful of paths, every one
 * of which can be rendered and watched; a branching tree cannot. `checkPolicy` throws on a film
 * that breaks it, the moment the film is loaded.
 *
 * Rewinding before a question forgets its answer, and every answer after it,
 * so the viewer can choose again — `answersAfterSeek`.
 */

export type Answers = Record<string, string>;

export type SegmentSpec = {
  id: string;
  frames: number;
  /** A detour: plays only when `answers[choice] === option`. */
  onlyIf?: { choice: string; option: string };
  /** A choice point: the Player waits on local frame `holdAt`. */
  ask?: { choice: string; options: readonly string[]; holdAt: number };
};

export type Placed = { spec: SegmentSpec; from: number; to: number };
export type Layout = { placed: Placed[]; total: number };

export const MAX_CHOICES = 3;
export const MIN_OPTIONS = 2;
export const MAX_OPTIONS = 3;
/**
 * A "jump" is a choice that has at least one detour depending on it — the
 * film's only branching. It counts choices, not detours: one choice may have a
 * detour for every option, and still counts once.
 */
export const MAX_JUMPS = 2;

const plays = (spec: SegmentSpec, answers: Answers | "all") =>
  answers === "all" ||
  !spec.onlyIf ||
  answers[spec.onlyIf.choice] === spec.onlyIf.option;

/** Place the segments that play for `answers` (or every segment, for `"all"`). */
export const layout = (
  specs: readonly SegmentSpec[],
  answers: Answers | "all",
): Layout => {
  const placed: Placed[] = [];
  let at = 0;
  for (const spec of specs) {
    if (!plays(spec, answers)) continue;
    placed.push({ spec, from: at, to: at + spec.frames });
    at += spec.frames;
  }
  return { placed, total: at };
};

export type ChoicePoint = {
  choice: string;
  options: readonly string[];
  /** Absolute frame the Player stops on. */
  hold: number;
  /** Absolute frame the choice's own segment ends — where a detour would begin. */
  end: number;
};

/** The choice points of a layout, in the order the viewer meets them. */
export const choicePoints = (full: Layout): ChoicePoint[] => {
  const out: ChoicePoint[] = [];
  for (const p of full.placed) {
    if (!p.spec.ask) continue;
    out.push({
      choice: p.spec.ask.choice,
      options: p.spec.ask.options,
      hold: p.from + p.spec.ask.holdAt,
      end: p.to,
    });
  }
  return out;
};

/** The index in `full.placed` of the segment that holds `frame`, or -1. */
export const segmentIndexAt = (full: Layout, frame: number): number => {
  for (let i = 0; i < full.placed.length; i++) {
    const p = full.placed[i];
    if (frame >= p.from && frame < p.to) return i;
  }
  return -1;
};

/**
 * Where the page must seek when the playhead is inside a detour these answers
 * do not play, or null when the segment under it plays: the start of the next
 * segment that does. Checked on every frame, so it holds for any number of
 * detours after a question - one per option, or several in a row - and for a
 * scrub, in either direction, that lands inside one.
 *
 * Run it only once no question is pending: a detour of an unanswered question
 * does not "play" either, and `pendingChoice` sends that playhead back to its
 * question instead.
 */
export const skipTarget = (
  full: Layout,
  answers: Answers,
  frame: number,
): number | null => {
  const at = segmentIndexAt(full, frame);
  if (at < 0 || plays(full.placed[at].spec, answers)) return null;
  for (let i = at + 1; i < full.placed.length; i++) {
    if (plays(full.placed[i].spec, answers)) return full.placed[i].from;
  }
  return full.total - 1;
};

/** True when `spec` plays for these answers - a detour of an unanswered choice does not. */
export const segmentPlays = (spec: SegmentSpec, answers: Answers): boolean => plays(spec, answers);

/**
 * The rewind rule. After the playhead lands on `frame`, an answer survives only
 * if its choice point is at or behind it. Landing before a choice point
 * unanswers it — and every one after it, since those are later still. Plays the
 * same for a viewer's scrub and for the film's own seek.
 */
export const answersAfterSeek = (
  full: Layout,
  answers: Answers,
  frame: number,
): Answers => {
  const kept: Answers = {};
  for (const c of choicePoints(full)) {
    if (answers[c.choice] !== undefined && frame >= c.hold) {
      kept[c.choice] = answers[c.choice];
    }
  }
  return kept;
};

/**
 * The first choice the playhead has reached without an answer, or null. The
 * Player must not be left past it: a question cannot be skipped by scrubbing.
 */
export const pendingChoice = (
  full: Layout,
  answers: Answers,
  frame: number,
): ChoicePoint | null => {
  for (const c of choicePoints(full)) {
    if (answers[c.choice] === undefined && frame >= c.hold) return c;
  }
  return null;
};

/** Throws, with a message that says what to change, if the film breaks the policy. */
export const checkPolicy = (specs: readonly SegmentSpec[]): void => {
  const ids = new Set<string>();
  const asks: Record<string, readonly string[]> = {};
  let choices = 0;
  const jumps = new Set<string>();

  for (const s of specs) {
    if (ids.has(s.id)) throw new Error(`Segment id "${s.id}" is used twice`);
    ids.add(s.id);

    if (s.ask) {
      const { choice, options, holdAt } = s.ask;
      choices += 1;
      asks[choice] = options;
      if (options.length < MIN_OPTIONS || options.length > MAX_OPTIONS) {
        throw new Error(
          `Choice "${choice}" has ${options.length} options; the policy is ${MIN_OPTIONS} or ${MAX_OPTIONS}`,
        );
      }
      if (new Set(options).size !== options.length) {
        throw new Error(`Choice "${choice}" repeats an option id`);
      }
      if (holdAt <= 0 || holdAt >= s.frames) {
        throw new Error(
          `Choice "${choice}" holds on frame ${holdAt}, outside its ${s.frames}-frame segment`,
        );
      }
    }

    if (s.onlyIf) {
      const { choice, option } = s.onlyIf;
      const options = asks[choice];
      if (!options) {
        throw new Error(
          `Detour "${s.id}" depends on "${choice}", which is not asked before it`,
        );
      }
      if (options.indexOf(option) < 0) {
        throw new Error(
          `Detour "${s.id}" waits for "${option}", which is not an option of "${choice}"`,
        );
      }
      jumps.add(choice);
    }
  }

  const last = specs[specs.length - 1];
  if (last?.onlyIf) {
    throw new Error(
      `Detour "${last.id}" is the last segment; every detour must rejoin the main line, so end on a segment every path plays`,
    );
  }

  if (choices > MAX_CHOICES) {
    throw new Error(`${choices} choice points; the policy is at most ${MAX_CHOICES}`);
  }
  if (jumps.size > MAX_JUMPS) {
    throw new Error(
      `${jumps.size} choices can jump over a detour; the policy is at most ${MAX_JUMPS}`,
    );
  }
};
