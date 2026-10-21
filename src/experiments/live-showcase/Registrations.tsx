import { Composition, Folder } from "remotion";
import { LiveShowcaseStyleTest, LIVE_SLAM, LIVE_STYLE_TEST_DURATION } from "./StyleTest";
import { SceneOne, LIVE_SCENE_ONE } from "./SceneOne";
import { SceneTwo, LIVE_SCENE_TWO } from "./SceneTwo";
import { SceneThree, LIVE_SCENE_THREE } from "./SceneThree";
import { SceneFour, SCENE_FOUR_DURATION } from "./SceneFour";
import { SceneFive, SCENE_FIVE_DURATION } from "./SceneFive";
import { SceneSix, SCENE_SIX_DURATION } from "./SceneSix";
import { LiveShowcaseSlate } from "./SlateComposition";
import { MasterFilm, LIVE_FILM_DURATION } from "./MasterFilm";
import { FPS, HEIGHT, WIDTH } from "./theme";

/**
 * The LIVE showcase's compositions — the worked example film.
 *
 * A silent paper-collage film whose subject is this repository. 30fps,
 * settled 2026-09-01. Docs: `content/live-showcase/docs/README.md`.
 *
 * Registered here, not in `Root.tsx`, so that two people adding films never
 * edit the same lines (building-scenes → one registration file per film).
 * Moved out of `Root.tsx` on 2026-10-21; the compositions, their IDs and their
 * order did not change.
 *
 * Frame rate and size come from `theme.ts` (`FPS`, `WIDTH`, `HEIGHT`), so the
 * film's format is set in one place rather than typed into every composition.
 *
 * The film's folder leads with its delivery composition and keeps its scenes in
 * a `Scenes` subfolder. A scene composition exists so that scene can be
 * reviewed and re-rendered on its own; none of them is a deliverable, and
 * putting them a level down is what stops the sidebar reading as twenty equal
 * things.
 */
export const LiveShowcaseRegistrations: React.FC = () => (
  <Folder name="LIVE-showcase">
    {/*
      The delivery composition: all six scenes, joined by TWO clapboard
      slams — 1 -> 2 and 5 -> 6, each carrying a slug — and three quiet
      `paperBreath` dissolves in between. It was five slams until
      2026-09-02; see MasterFilm.tsx for why that changed.

      Duration is DERIVED from MasterFilm's own scene table, not typed
      here — re-timing a scene there updates this automatically. The two
      disagreeing is how a master ends up cutting off its own last frame.
    */}
    <Composition
      id="LiveShowcaseFilm"
      component={MasterFilm}
      durationInFrames={LIVE_FILM_DURATION}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
    />

    {/*
      The six scenes and the clapboard, each scrubbable on its own. **None
      of these is a deliverable** — they exist so a scene can be reviewed
      and re-rendered without watching the whole film, which is how every
      one of them was built and judged.

      Register every scene here before any parallel split, each pointing at
      a stub component that renders nothing until its scene is built, and do
      not touch this file again until the merge. Workers then only ever edit
      their own scene file. Appending at a marker is not safe: two workers
      adding at the same place is a conflict Git can interleave into one
      worker's `id` with the other's settings (working-in-parallel). Do not
      reorder, edit or remove anyone else's.
    */}
    <Folder name="Scenes">
      <Composition
        id="LiveShowcaseSceneOne"
        component={SceneOne}
        durationInFrames={LIVE_SCENE_ONE}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />

      <Composition
        id="LiveShowcaseSceneTwo"
        component={SceneTwo}
        durationInFrames={LIVE_SCENE_TWO}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />

      <Composition
        id="LiveShowcaseSceneThree"
        component={SceneThree}
        durationInFrames={LIVE_SCENE_THREE}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />

      <Composition
        id="LiveShowcaseSceneFour"
        component={SceneFour}
        durationInFrames={SCENE_FOUR_DURATION}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />

      <Composition
        id="LiveShowcaseSceneFive"
        component={SceneFive}
        durationInFrames={SCENE_FIVE_DURATION}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />

      <Composition
        id="LiveShowcaseSceneSix"
        component={SceneSix}
        durationInFrames={SCENE_SIX_DURATION}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />

      {/*
        The clapboard, on its own — not a scene of the film but a join,
        registered separately because the director asked on 2026-09-02 for
        it to be "its own scene not part of the style test". It carries no
        scene of its own and can sit between any two: the frame frosts
        over, the board pops up sharp, the arm slams, the frost clears.
        Reviewed here over plain paper with no neighbours at all.
      */}
      <Composition
        id="LiveShowcaseSlate"
        component={LiveShowcaseSlate}
        durationInFrames={LIVE_SLAM}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
    </Folder>

    {/*
      Milestone 1's style test. Scene 1 and nothing else since 2026-09-02,
      when the clapboard was cut out of it — so it plays exactly what
      `LiveShowcaseSceneOne` plays. **Built to be judged and thrown away.**
      Kept registered because it is what the film's whole look was approved
      against, not because anything still needs it.
    */}
    <Folder name="Style-tests">
      <Composition
        id="LiveShowcaseStyleTest"
        component={LiveShowcaseStyleTest}
        durationInFrames={LIVE_STYLE_TEST_DURATION}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
    </Folder>
  </Folder>
);
