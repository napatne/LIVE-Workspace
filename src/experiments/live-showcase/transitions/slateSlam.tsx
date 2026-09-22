import type {
  TransitionPresentation,
  TransitionPresentationComponentProps,
} from "@remotion/transitions";
import { SlateBackdrop, SlateForeground } from "../SlateScene";

/**
 * `slateSlam` — the clapboard beat, wired up as the join between two scenes.
 *
 * **This file is deliberately thin.** The beat itself — every phase boundary,
 * the snap, the jolt, the confetti, the blur — lives in `../SlateScene.tsx`,
 * and the prop lives in `../Clapboard.tsx`. They were pulled out of here on
 * 2026-09-02 when the director asked for the clapboard to be *"its own scene
 * not part of the style test"*. It is registered on its own as the
 * `LiveShowcaseSlate` composition in `Root.tsx`, alongside `LiveShowcaseSceneOne`
 * and `LiveShowcaseSceneTwo` — three separate scenes, each scrubbable alone.
 *
 * **Why it is still a `TransitionPresentation` and not a plain sequence.** The
 * beat has to blur the OUTGOING and INCOMING scenes, and a
 * `TransitionSeries.Sequence` cannot see its neighbours — only a presentation
 * is handed both. A true standalone sequence would push blur code into the tail
 * of every scene and the head of the next, and the blur could no longer follow
 * the board's own timing. Confirmed with the director before building.
 *
 * The exported name and signature are otherwise unchanged from the slide
 * version, so `StyleTest.tsx` and the Milestone 7 master composition need only
 * to pass the join's length.
 *
 * **How a presentation renders.** Remotion mounts this component TWICE per
 * frame — once with `presentationDirection: "exiting"` wrapping the outgoing
 * scene, once with `"entering"` wrapping the incoming one, the entering pass
 * drawn on top. The beat is split along exactly that seam: `SlateBackdrop`
 * racks the outgoing scene out of focus, `SlateForeground` draws the incoming
 * scene, the jolt, the board and the confetti over it.
 *
 * Each scene has to be rendered inside its own pass to see its own frame
 * numbers — mounting the outgoing scene inside the entering pass would run it
 * on the INCOMING sequence's timeline. That is the whole reason the beat is two
 * components rather than one.
 */

type SlateSlamProps = {
  /** e.g. "SCENE 2 · TAKE 1 · LIVE". The transition labels the film for free. */
  slug: string;
  /** The length of the join, in frames — the confetti runs on real time. */
  durationInFrames: number;
};

const SlateSlamPresentation: React.FC<
  TransitionPresentationComponentProps<SlateSlamProps>
> = ({ children, presentationDirection, presentationProgress, passedProps }) => {
  if (presentationDirection === "exiting") {
    return (
      <SlateBackdrop
        progress={presentationProgress}
        durationInFrames={passedProps.durationInFrames}
      >
        {children}
      </SlateBackdrop>
    );
  }

  return (
    <SlateForeground
      slug={passedProps.slug}
      progress={presentationProgress}
      durationInFrames={passedProps.durationInFrames}
    >
      {children}
    </SlateForeground>
  );
};

export const slateSlam = (
  props: SlateSlamProps,
): TransitionPresentation<SlateSlamProps> => {
  return { component: SlateSlamPresentation, props };
};
