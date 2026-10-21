import { Composition, Folder } from "remotion";
import { DemoFilm } from "./DemoFilm";
import { DEMO_PATHS, demoDuration } from "./segments";

/**
 * The demo's compositions, one per path, with the ids written in
 * web/interactive-demo/paths.json. Each is an ordinary video - the film
 * laid out for that set of answers - so every path can be watched in Studio and
 * rendered as an MP4 to hand out beside the interactive page.
 *
 * Registered here, not in Root.tsx, so that two people adding films never edit
 * the same lines (building-scenes → one registration file per film).
 */
export const InteractiveDemoRegistrations: React.FC = () => (
  <Folder name="Interactive-demo">
    {Object.keys(DEMO_PATHS).map((id) => (
      <Composition
        key={id}
        id={id}
        component={DemoFilm}
        defaultProps={{ answers: DEMO_PATHS[id] }}
        durationInFrames={demoDuration(DEMO_PATHS[id])}
        fps={30}
        width={1920}
        height={1080}
      />
    ))}
  </Folder>
);
