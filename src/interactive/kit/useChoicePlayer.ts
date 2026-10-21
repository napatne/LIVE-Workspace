import type { PlayerRef } from "@remotion/player";
import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from "react";
import type { ChoiceLive } from "./choice";
import {
  answersAfterSeek,
  choicePoints,
  pendingChoice,
  segmentIndexAt,
  skipTarget,
  type Answers,
  type Layout,
} from "./model";

/**
 * Interactive video kit — the page's rules, for any film.
 *
 * The film draws its own questions (no overlay, no form); this hook does only
 * what a Player cannot do for itself:
 *
 *  1. **Stop on a question** and keep the Player there until it is answered —
 *     scrubbing past an unanswered question puts the playhead back on it.
 *  2. **Remember the answers.**
 *  3. **Jump over a detour that does not apply** - any detour, whenever the
 *     playhead enters one: after the question's own reaction has played, or
 *     on a scrub that lands inside it. However many detours follow a question,
 *     the page plays the same segments as that path's rendered video.
 *  4. **Forget on rewind.** Landing before a question unanswers it and every
 *     question after it, so each is asked again.
 *
 * Everything stays in the browser. Nothing is sent, stored or logged.
 *
 * Give the Player these props, or the rules fight the Player's own defaults:
 *   moveToBeginningWhenEnded={false}  — its jump to frame 0 at the end reads as
 *                                       a rewind and wipes every answer
 *   clickToPlay={false}               — a click must reach the film's buttons
 *   spaceKeyToPlayOrPause={false}     — Space on a focused button presses it
 */
/**
 * @param status optional element for a test harness to read without the page
 *               re-rendering 30 times a second. The hook writes on it:
 *                 data-frame    the frame on screen, every frame
 *                 data-segment  the id of the segment playing
 *                 data-played   JSON array of the segment ids played since
 *                               frame 0, in order (a rewind trims it)
 *                 data-segments JSON array of the segment table: id, onlyIf
 *               scripts/test-interactive-page.mjs compares data-played with
 *               the path the answers should play.
 */
export const useChoicePlayer = (
  player: RefObject<PlayerRef | null>,
  full: Layout,
  status?: RefObject<HTMLElement | null>,
) => {
  const choices = useMemo(() => choicePoints(full), [full]);
  const [answers, setAnswers] = useState<Answers>({});
  const [waitingFor, setWaitingFor] = useState<string | null>(null);

  // The frame listener reads these refs, not state: after a click the Player
  // resumes in the same tick, before React has re-rendered, and a stale
  // "unanswered" would pause it straight back on the question.
  const answersRef = useRef<Answers>({});
  const waitingRef = useRef<string | null>(null);

  const setAnswersBoth = useCallback((next: Answers) => {
    answersRef.current = next;
    setAnswers(next);
  }, []);
  const setWaiting = useCallback((choice: string | null) => {
    waitingRef.current = choice;
    setWaitingFor(choice);
  }, []);

  useEffect(() => {
    const p = player.current;
    if (!p) return;

    if (status?.current) {
      status.current.dataset.segments = JSON.stringify(
        full.placed.map((x) => ({ id: x.spec.id, onlyIf: x.spec.onlyIf ?? null })),
      );
    }
    // Indices into full.placed of the segments played since frame 0.
    let played: number[] = [];

    const onFrame = (e: { detail: { frame: number } }) => {
      const now = e.detail.frame;
      if (status?.current) status.current.dataset.frame = String(now);

      // 4 · Forget on rewind.
      const kept = answersAfterSeek(full, answersRef.current, now);
      if (Object.keys(kept).length !== Object.keys(answersRef.current).length) {
        setAnswersBoth(kept);
      }

      // 1 · Stop on a question, and stay there until it is answered.
      const open = pendingChoice(full, answersRef.current, now);
      if (open) {
        if (now !== open.hold) p.seekTo(open.hold);
        if (p.isPlaying()) p.pause();
        if (waitingRef.current !== open.choice) setWaiting(open.choice);
        return;
      }
      if (waitingRef.current !== null) setWaiting(null);

      // 3 · Jump over a detour that does not apply. The frame listener runs
      // after the frame is painted, so the film draws a skipped detour as
      // empty background (InteractiveFilm) - nothing of it shows meanwhile.
      const to = skipTarget(full, answersRef.current, now);
      if (to !== null) {
        if (to !== now) p.seekTo(to);
        return;
      }

      // Only a segment that plays is recorded, so a skipped one never is.
      const at = segmentIndexAt(full, now);
      if (at >= 0 && played[played.length - 1] !== at) {
        played = played.filter((i) => i < at);
        played.push(at);
        if (status?.current) {
          status.current.dataset.segment = full.placed[at].spec.id;
          status.current.dataset.played = JSON.stringify(played.map((i) => full.placed[i].spec.id));
        }
      }
    };

    // With the Player's rewind-at-end off, Play on the closing card restarts
    // only from the very last frame - and a Player can end a frame or two
    // short of it, after which Play does nothing. So park it on the last frame
    // when it ends. Seeking there fires `ended` again, synchronously, before
    // the frame updates - so the guard is a flag, not a frame check.
    let parking = false;
    const onEnded = () => {
      if (parking || p.getCurrentFrame() >= full.total - 1) return;
      parking = true;
      p.seekTo(full.total - 1);
      parking = false;
    };

    p.addEventListener("frameupdate", onFrame);
    p.addEventListener("ended", onEnded);
    return () => {
      p.removeEventListener("frameupdate", onFrame);
      p.removeEventListener("ended", onEnded);
    };
  }, [player, full, status, setAnswersBoth, setWaiting]);

  const pick = useCallback(
    (choice: string, option: string) => {
      const next = { ...answersRef.current, [choice]: option };
      setAnswersBoth(next);
      setWaiting(null);
      // The question's own reaction plays to its last frame; the frame
      // listener steps over any detour this answer does not play.
      player.current?.play();
    },
    [player, setAnswersBoth, setWaiting],
  );

  // Start again pauses and rewinds now, and plays only after React has
  // committed that pause. Calling play() straight away was sometimes lost: the
  // click test found the film stopped on frame 0 after Start again in 2 of
  // about 30 runs (2026-10-21). The likely cause, read from the Player's
  // source: a click in the moment the Player ends finds its playback loop
  // already stopped but its "playing" state not yet false, so play() leaves it
  // marked as playing with no loop running.
  const [restarts, setRestarts] = useState(0);
  const restart = useCallback(() => {
    setAnswersBoth({});
    setWaiting(null);
    player.current?.pause();
    player.current?.seekTo(0);
    setRestarts((n) => n + 1);
  }, [player, setAnswersBoth, setWaiting]);
  useEffect(() => {
    if (restarts > 0) player.current?.play();
  }, [restarts, player]);

  const live = useMemo<ChoiceLive>(() => ({ waitingFor, pick }), [waitingFor, pick]);
  /** Pass as the Player's inputProps. */
  const inputProps = useMemo(() => ({ answers, all: true, live }), [answers, live]);

  return { answers, waitingFor, choices, inputProps, restart };
};
