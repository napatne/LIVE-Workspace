import { PAPER_TEXT_FILTER_ID } from "./Paper";
import { settle } from "./theme";

export type Word = { text: string; color: string };

/**
 * One word, placed by hand rather than typed.
 *
 * Every word gets the same spring but a different arrival frame, and the
 * frame it is driven off is expected to already be quantised on twos, so the
 * pop steps like the rest of the paper. A small deterministic rotation per
 * word keeps a line from reading as a single text run that happened to
 * animate.
 *
 * Extracted from `SceneOne.tsx` (2026-09-02) once a second scene needed the
 * same pop.
 *
 * **Every word carries the film's paper texture as of 2026-09-02** — see
 * `PAPER_TEXT_FILTER_ID`. It is applied here rather than at the call sites so
 * that the change reached every line in the film at once, which is what the
 * note asked for; the two pieces of type that must NOT have it (the clapboard
 * slug and scene 5's intertitle) do not use this component.
 *
 * The filter therefore scales with the arrival pop instead of sitting still in
 * page space. That is thirteen frames of very slightly growing grain per word
 * and it is not worth a wrapper element to avoid — a transformed wrapper is
 * promoted to its own raster layer, which is what cost scene 3's storyboard
 * sheet its sharpness.
 */
export const PoppedWord: React.FC<{
  word: Word;
  index: number;
  frame: number;
  /** The frame the FIRST word (index 0) begins arriving. */
  appearFrame: number;
  /** Frames between one word's arrival and the next. */
  stagger?: number;
  fontFamily: string;
  fontSize: number;
  /** `settle()` period for the pop spring — raise it to slow the settle. */
  settlePeriod?: number;
}> = ({
  word,
  index,
  frame,
  appearFrame,
  stagger = 2,
  fontFamily,
  fontSize,
  settlePeriod,
}) => {
  const t = frame - (appearFrame + index * stagger);
  const s = settle(t, settlePeriod);
  const tilt = (index % 2 === 0 ? 1 : -1) * (1.1 + (index % 3) * 0.35);

  return (
    <span
      style={{
        display: "inline-block",
        fontFamily,
        fontSize,
        lineHeight: 1,
        color: word.color,
        filter: `url(#${PAPER_TEXT_FILTER_ID})`,
        opacity: t <= 0 ? 0 : 1,
        scale: t <= 0 ? 0 : s,
        rotate: `${tilt * (1 - Math.min(1, Math.max(0, s)))}deg`,
      }}
    >
      {word.text}
    </span>
  );
};
