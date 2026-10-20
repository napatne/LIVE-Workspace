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
 * the detours that do not apply, by seeking over them. Studio and renders lay
 * out only the segments one set of answers would play, so one path is one
 * ordinary, reviewable video.
 *
 * ## The policy
 *
 * 2 or 3 options a question, at most 3 questions, at most 2 of them able to
 * skip a detour, and every detour rejoins the main line. Small on purpose: a
 * film with these limits has a handful of paths, every one of which can be
 * rendered and watched; a branching tree cannot. `checkPolicy` throws on a film
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
/** A "jump" is a choice that can skip a detour — the film's only branching. */
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

/**
 * Where playback carries on once `choice` is answered: the start of the first
 * later segment that still plays. Equal to the choice's `end` when nothing is
 * skipped.
 */
export const resumeFrame = (
  full: Layout,
  choice: string,
  answers: Answers,
): number => {
  let passed = false;
  for (const p of full.placed) {
    if (passed && plays(p.spec, answers)) return p.from;
    if (p.spec.ask && p.spec.ask.choice === choice) passed = true;
  }
  return full.total;
};

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

  if (choices > MAX_CHOICES) {
    throw new Error(`${choices} choice points; the policy is at most ${MAX_CHOICES}`);
  }
  if (jumps.size > MAX_JUMPS) {
    throw new Error(
      `${jumps.size} choices can jump over a detour; the policy is at most ${MAX_JUMPS}`,
    );
  }
};
