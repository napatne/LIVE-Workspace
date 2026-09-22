import { Composition, Folder } from "remotion";
import {
  LiveShowcaseStyleTest,
  LIVE_SCENE_ONE,
  LIVE_SCENE_THREE,
  LIVE_SCENE_TWO,
  LIVE_SLAM,
  LIVE_STYLE_TEST_DURATION,
} from "./experiments/live-showcase/StyleTest";
import { SceneOne as LiveShowcaseSceneOneComponent } from "./experiments/live-showcase/SceneOne";
import { SceneTwo as LiveShowcaseSceneTwoComponent } from "./experiments/live-showcase/SceneTwo";
import { SceneThree as LiveShowcaseSceneThreeComponent } from "./experiments/live-showcase/SceneThree";
import { LiveShowcaseSlate } from "./experiments/live-showcase/SlateComposition";
import {
  MasterFilm as LiveShowcaseFilmComponent,
  LIVE_FILM_DURATION,
} from "./experiments/live-showcase/MasterFilm";
import {
  SceneFour as LiveShowcaseSceneFourComponent,
  SCENE_FOUR_DURATION,
} from "./experiments/live-showcase/SceneFour";
import {
  SceneFive as LiveShowcaseSceneFiveComponent,
  SCENE_FIVE_DURATION,
} from "./experiments/live-showcase/SceneFive";
import {
  SceneSix as LiveShowcaseSceneSixComponent,
  SCENE_SIX_DURATION,
} from "./experiments/live-showcase/SceneSix";
/**
 * Every composition in the repository, arranged by the thing it belongs to.
 *
 * **A top-level folder is something someone can be shown** — a film, or the
 * explainers. Everything else is a part of one of those and sits one level
 * down.
 *
 * | Folder | What it is |
 * | --- | --- |
 * | `LIVE-showcase` | The film |
 *
 * Explainers built from `.agents/skills/building-scenes` go in a top-level
 * `Explainers` folder, created when the first one is built. Nothing here yet.
 *
 * The film's folder leads with its delivery composition and keeps its scenes in
 * a `Scenes` subfolder. A scene composition exists so that scene can be
 * reviewed and re-rendered on its own; none of them is a deliverable, and
 * putting them a level down is what stops the sidebar reading as twenty equal
 * things.
 *
 * Folder names use hyphens rather than spaces, because Remotion validates them.
 */
export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/*
        ==================================================================
        1 · LIVE showcase — the current film.

        A silent paper-collage film whose subject is this repository. 30fps,
        settled 2026-09-01. Docs: content/live-showcase/docs/README.md.
        ==================================================================
      */}
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
          component={LiveShowcaseFilmComponent}
          durationInFrames={LIVE_FILM_DURATION}
          fps={30}
          width={1920}
          height={1080}
        />

        {/*
          The six scenes and the clapboard, each scrubbable on its own. **None
          of these is a deliverable** — they exist so a scene can be reviewed
          and re-rendered without watching the whole film, which is how every
          one of them was built and judged.

          Append new scenes at the marker at the bottom, in scene order. Do not
          reorder, edit or remove anyone else's.
        */}
        <Folder name="Scenes">
          <Composition
            id="LiveShowcaseSceneOne"
            component={LiveShowcaseSceneOneComponent}
            durationInFrames={LIVE_SCENE_ONE}
            fps={30}
            width={1920}
            height={1080}
          />

          <Composition
            id="LiveShowcaseSceneTwo"
            component={LiveShowcaseSceneTwoComponent}
            durationInFrames={LIVE_SCENE_TWO}
            fps={30}
            width={1920}
            height={1080}
          />

          <Composition
            id="LiveShowcaseSceneThree"
            component={LiveShowcaseSceneThreeComponent}
            durationInFrames={LIVE_SCENE_THREE}
            fps={30}
            width={1920}
            height={1080}
          />

          <Composition
            id="LiveShowcaseSceneFour"
            component={LiveShowcaseSceneFourComponent}
            durationInFrames={SCENE_FOUR_DURATION}
            fps={30}
            width={1920}
            height={1080}
          />

          <Composition
            id="LiveShowcaseSceneFive"
            component={LiveShowcaseSceneFiveComponent}
            durationInFrames={SCENE_FIVE_DURATION}
            fps={30}
            width={1920}
            height={1080}
          />

          <Composition
            id="LiveShowcaseSceneSix"
            component={LiveShowcaseSceneSixComponent}
            durationInFrames={SCENE_SIX_DURATION}
            fps={30}
            width={1920}
            height={1080}
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
            fps={30}
            width={1920}
            height={1080}
          />

          {/* ---- APPEND NEW LIVE SHOWCASE SCENES BELOW THIS LINE ---- */}

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
            fps={30}
            width={1920}
            height={1080}
          />
        </Folder>
      </Folder>
    </>
  );
};
