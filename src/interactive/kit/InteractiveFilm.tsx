import { useMemo } from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { ChoiceContext, type ChoiceContextValue, type ChoiceLive } from "./choice";
import { checkPolicy, layout, segmentPlays, type Answers, type SegmentSpec } from "./model";

/**
 * Interactive video kit — one film, played two ways.
 *
 * - **Preview** (Studio, renders): `answers` holds every answer, as plain
 *   props. Only the segments those answers play are laid out, so one set of
 *   answers is one ordinary video — which is how each path is reviewed and
 *   rendered.
 * - **Live** (the web page): `all` lays out every segment, `live` is present,
 *   and the page seeks over the detours that do not apply. Those detours draw
 *   nothing: the page's frame listener runs after a frame is painted, so the
 *   frame or two before its seek shows empty background, not the wrong detour.
 */
export type InteractiveFilmProps = {
  answers: Answers;
  /** The page: lay out every segment and let the page seek over detours. */
  all?: boolean;
  /** Present only on the page; its absence is what makes this a preview. */
  live?: ChoiceLive;
};

/**
 * Build the film component from a segment table and one scene per segment id.
 * Fails at load time if a segment has no scene, or the film breaks the policy
 * in `model.ts` - a film that cannot work should not get as far as a render.
 */
export const createInteractiveFilm = (
  segments: readonly SegmentSpec[],
  scenes: Record<string, React.FC>,
  background = "#ffffff",
): React.FC<InteractiveFilmProps> => {
  checkPolicy(segments);
  for (const s of segments) {
    if (!scenes[s.id]) throw new Error(`Segment "${s.id}" has no scene`);
  }

  const Film: React.FC<InteractiveFilmProps> = ({ answers, all = false, live }) => {
    const placed = useMemo(() => layout(segments, all ? "all" : answers).placed, [all, answers]);
    const value = useMemo<ChoiceContextValue>(
      () => ({ mode: live ? "live" : "preview", answers, live: live ?? null }),
      [answers, live],
    );

    return (
      <ChoiceContext.Provider value={value}>
        {/*
          The film ignores the pointer; only a choice's buttons take it back,
          and only while their question is open (see OptionButton). Remotion
          keeps a transition's presentation mounted, invisible, after the join,
          and without this it swallows every click on the page.
        */}
        <AbsoluteFill style={{ background, pointerEvents: "none" }}>
          {placed.map((p) => {
            if (all && !segmentPlays(p.spec, answers)) return null;
            const Scene = scenes[p.spec.id];
            return (
              <Sequence key={p.spec.id} name={p.spec.id} from={p.from} durationInFrames={p.spec.frames}>
                <Scene />
              </Sequence>
            );
          })}
        </AbsoluteFill>
      </ChoiceContext.Provider>
    );
  };
  return Film;
};
