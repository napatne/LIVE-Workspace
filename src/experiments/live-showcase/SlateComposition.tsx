import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { SlateScene } from "./SlateScene";
import { COLORS } from "./theme";

/**
 * The clapboard beat as a standalone, scrubbable scene — `LiveShowcaseSlate`.
 *
 * The director's note, 2026-09-02: *"the video clapboard should be its own
 * scene not part of the style test because its a transition"*. This is that
 * scene. It is a review harness, not a deliverable: the film itself plays the
 * beat through `transitions/slateSlam.tsx`, which drives the same
 * `SlateScene.tsx` from a `TransitionSeries`.
 *
 * **No neighbours any more.** This used to freeze Scene 1 on its last frame and
 * Scene 2 on its first, because the beat racked them in and out of focus and
 * reviewing it against an empty frame would have shown nothing. Since the beat
 * frosts over instead of merely blurring — *"it should just have a
 * transparent/frosted glass background no specific other backing so we can put
 * it in between any scenes"* — a neighbour would defeat the point: what the
 * director needs to see is that the beat carries no scene of its own.
 *
 * What sits under the frost here is the film's plain paper, and nothing else.
 * Not a scene, not a texture — the same flat `COLORS.paper` every scene starts
 * from, so the glass has something to be glass against.
 */
export const LiveShowcaseSlate: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.paper }}>
      <SlateScene
        slug="SCENE 2 · TAKE 1 · LIVE"
        progress={frame / durationInFrames}
        durationInFrames={durationInFrames}
      />
    </AbsoluteFill>
  );
};
