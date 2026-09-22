import type {
  TransitionPresentation,
  TransitionPresentationComponentProps,
} from "@remotion/transitions";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import { PaperFilters } from "../Paper";

/**
 * `paperBreath` — the quiet join. The clapboard's little brother.
 *
 * **Why this exists.** Until 2026-09-02 every one of the film's five joins was a
 * `slateSlam`. The director's read of the first master pass was that the clap
 * *"again and again is irritating"*, and that the joins were *"choppy and
 * overlap on many other scenes"*. Both notes have the same cause: an 88-frame
 * board is a full shot, and five of them is five shots of clapboard in a
 * fifty-second film — punctuation used so often it stops being punctuation.
 *
 * So the board now appears **twice**, at the two structural hinges, and the
 * three joins in between are this: the same rack-and-frost material with the
 * board and the confetti taken out.
 *
 * **The film keeps ONE transition vocabulary at two volumes.** That is the whole
 * design. A different kind of wipe or slide at the quiet joins would have been a
 * second visual idea competing with the first; this is the first idea, said
 * softly. Both joins rack out of focus, both push very slightly outward, both
 * pass through the page's own paper white. Only one of them brings furniture.
 *
 * **Nothing is cut here.** Unlike the slam, which hard-swaps the scenes at its
 * frame 21 while the board covers them, this is a true cross-dissolve: the
 * outgoing scene stays mounted and legible for the whole join and the incoming
 * fades up over it. There is no frame at which either scene is discarded, which
 * is precisely the "overcut" the slam was causing at every join it was asked to
 * make.
 *
 * **Why it passes through frost rather than dissolving straight.** Both scenes
 * paint the same opaque `COLORS.paper` ground, so a plain cross-dissolve is two
 * collages briefly superimposed — a double exposure, which is a photographic
 * effect and wrong for cut paper. The frost bump lifts the midpoint toward the
 * page colour, so the read is "one page clears, the next is underneath" rather
 * than "two pages at once". It peaks at the halfway frame and is gone by the
 * end.
 */

/** Softer than the slam's 28 — this is a breath, not a rack-focus. */
const BREATH_BLUR = 9;
/** Barely a push. Enough to feel like the page moves; not a zoom. */
const BREATH_PUSH = 1.018;
/**
 * How far the midpoint lifts toward the paper colour, as an alpha.
 *
 * The slam frosts to 0.72 because a whole clapboard has to sit convincingly in
 * front of the scene. Here the frost only has to stop the two collages reading
 * as superimposed, so it is under half that.
 */
const FROST_PEAK = 0.34;

const PAPER = "244, 241, 234";

const EASE = Easing.bezier(0.4, 0, 0.2, 1);

const Racked: React.FC<{
  blur: number;
  scale: number;
  opacity: number;
  children: React.ReactNode;
}> = ({ blur, scale, opacity, children }) => (
  <AbsoluteFill style={{ overflow: "hidden", opacity }}>
    <AbsoluteFill
      style={{
        filter: blur > 0.01 ? `blur(${blur}px)` : undefined,
        scale: String(scale),
      }}
    >
      {children}
    </AbsoluteFill>
  </AbsoluteFill>
);

const PaperBreathPresentation: React.FC<
  TransitionPresentationComponentProps<Record<string, never>>
> = ({ children, presentationDirection, presentationProgress }) => {
  const p = presentationProgress;

  if (presentationDirection === "exiting") {
    // Stays fully opaque for the whole join. The incoming fades up ON TOP of
    // it, so the cross happens once, in one place, rather than as two opposing
    // fades that dip to a hole in the middle.
    return (
      <Racked
        blur={interpolate(p, [0, 1], [0, BREATH_BLUR], { easing: EASE })}
        scale={interpolate(p, [0, 1], [1, BREATH_PUSH], { easing: EASE })}
        opacity={1}
      >
        {children}
      </Racked>
    );
  }

  const frost = FROST_PEAK * Math.sin(Math.PI * p);

  return (
    <AbsoluteFill>
      <PaperFilters />
      <Racked
        blur={interpolate(p, [0, 1], [BREATH_BLUR, 0], { easing: EASE })}
        scale={interpolate(p, [0, 1], [BREATH_PUSH, 1], { easing: EASE })}
        opacity={interpolate(p, [0, 1], [0, 1], { easing: EASE })}
      >
        {children}
      </Racked>
      {frost > 0.005 ? (
        <AbsoluteFill
          style={{ backgroundColor: `rgba(${PAPER}, ${frost})` }}
        />
      ) : null}
    </AbsoluteFill>
  );
};

export const paperBreath = (): TransitionPresentation<
  Record<string, never>
> => {
  return { component: PaperBreathPresentation, props: {} };
};
