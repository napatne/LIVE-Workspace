import type { PlayerRef } from "@remotion/player";
import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from "react";
import type { ChoiceLive } from "./choice";
import {
  answersAfterSeek,
  choicePoints,
  pendingChoice,
  resumeFrame,
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
 *  3. **Jump over a detour that does not apply**, once the question's own
 *     reaction has played.
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
 * @param status optional element that gets `data-frame` on every frame - for
 *               a test harness to read without re-rendering the page 30 times a second
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
  const jump = useRef<{ at: number; to: number } | null>(null);

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

    const onFrame = (e: { detail: { frame: number } }) => {
      const now = e.detail.frame;
      if (status?.current) status.current.dataset.frame = String(now);

      // 4 · Forget on rewind.
      const kept = answersAfterSeek(full, answersRef.current, now);
      if (Object.keys(kept).length !== Object.keys(answersRef.current).length) {
        setAnswersBoth(kept);
        jump.current = null;
      }

      // 3 · Jump over a detour that does not apply.
      const j = jump.current;
      if (j && now >= j.at) {
        jump.current = null;
        if (now < j.to) p.seekTo(j.to);
        return;
      }

      // 1 · Stop on a question, and stay there until it is answered.
      const open = pendingChoice(full, answersRef.current, now);
      if (open) {
        if (now !== open.hold) p.seekTo(open.hold);
        if (p.isPlaying()) p.pause();
        if (waitingRef.current !== open.choice) setWaiting(open.choice);
      } else if (waitingRef.current !== null) {
        setWaiting(null);
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
      // Carry on from the end of the question's own reaction - over the detour
      // if the answer does not need it, straight into it if it does.
      const point = choices.find((c) => c.choice === choice);
      if (point) {
        const to = resumeFrame(full, choice, next);
        jump.current = to > point.end ? { at: point.end - 2, to } : null;
      }
      player.current?.play();
    },
    [choices, full, player, setAnswersBoth, setWaiting],
  );

  const restart = useCallback(() => {
    jump.current = null;
    setAnswersBoth({});
    setWaiting(null);
    player.current?.seekTo(0);
    player.current?.play();
  }, [player, setAnswersBoth, setWaiting]);

  const live = useMemo<ChoiceLive>(() => ({ waitingFor, pick }), [waitingFor, pick]);
  /** Pass as the Player's inputProps. */
  const inputProps = useMemo(() => ({ answers, all: true, live }), [answers, live]);

  return { answers, waitingFor, choices, inputProps, restart };
};
