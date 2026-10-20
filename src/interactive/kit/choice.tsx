import {
  createContext,
  useContext,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import type { Answers } from "./model";

/**
 * Interactive video kit — what a scene needs to ask a question and react to
 * the answer. Nothing here knows what the film looks like; the scene draws the
 * cards, this makes them clickable and says what was chosen.
 *
 * Two ways the film is played, one component:
 *
 * - **preview** (Studio, renders): nobody can click, so every answer is already
 *   in `answers` and the scene plays as if the viewer had given it.
 * - **live** (the web page): `live` is present, the Player stops on the hold
 *   frame, and the buttons are real.
 */
export type ChoiceLive = {
  /** The choice the Player is stopped on right now, or null. */
  waitingFor: string | null;
  pick: (choice: string, option: string) => void;
};

export type ChoiceContextValue = {
  mode: "live" | "preview";
  answers: Answers;
  live: ChoiceLive | null;
};

export const ChoiceContext = createContext<ChoiceContextValue | null>(null);

const useChoiceContext = (): ChoiceContextValue => {
  const ctx = useContext(ChoiceContext);
  if (!ctx) {
    throw new Error("Choice scenes must be rendered inside a ChoiceContext.Provider");
  }
  return ctx;
};

/** Every answer so far — for scenes that react to the viewer's path, like a recap. */
export const useAnswers = (): Answers => useChoiceContext().answers;

export const useChoice = (choice: string) => {
  const ctx = useChoiceContext();
  return {
    mode: ctx.mode,
    /** The option chosen, or null if this choice has not been answered. */
    answer: ctx.answers[choice] ?? null,
    /** True only while the Player is stopped here, waiting for a click. */
    waiting: ctx.live !== null && ctx.live.waitingFor === choice,
    pick: (option: string) => ctx.live?.pick(choice, option),
  };
};

export type OptionState = { hover: boolean; focus: boolean };

/**
 * One clickable option. A real `<button>`, so Tab and Enter work and a screen
 * reader finds it, but it draws nothing of its own: the scene passes children
 * as a function of hover/focus and styles the card.
 *
 * It takes the pointer back with `pointer-events: auto`. The film's root sets
 * `none` on everything — Remotion keeps a transition's presentation mounted
 * after the join and it eats clicks (found 2026-10-06) — so only things that
 * mean to be clicked opt in, and only while the question is open.
 */
export const OptionButton: React.FC<{
  choice: string;
  option: string;
  label: string;
  style?: CSSProperties;
  children: (state: OptionState) => ReactNode;
}> = ({ choice, option, label, style, children }) => {
  const { waiting, pick } = useChoice(choice);
  const [hover, setHover] = useState(false);
  const [focus, setFocus] = useState(false);

  return (
    <button
      type="button"
      aria-label={label}
      data-choice={choice}
      data-option={option}
      disabled={!waiting}
      onClick={() => pick(option)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
      style={{
        appearance: "none",
        background: "none",
        border: "none",
        padding: 0,
        margin: 0,
        font: "inherit",
        color: "inherit",
        textAlign: "inherit",
        cursor: waiting ? "pointer" : "default",
        pointerEvents: waiting ? "auto" : "none",
        ...style,
      }}
    >
      {children({ hover: waiting && hover, focus: waiting && focus })}
    </button>
  );
};
