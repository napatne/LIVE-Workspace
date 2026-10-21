import { LiveShowcaseRegistrations } from "./experiments/live-showcase/Registrations";
import { InteractiveDemoRegistrations } from "./interactive/demo/Registrations";

/**
 * Every composition in the repository, arranged by the thing it belongs to.
 *
 * **A top-level folder is something someone can be shown** — a film, or the
 * interactive demo. Everything else is a part of one of those and sits one
 * level down.
 *
 * | Folder | What it is | Registered in |
 * | --- | --- | --- |
 * | `LIVE-showcase` | The worked example film | `src/experiments/live-showcase/Registrations.tsx` |
 * | `Interactive-demo` | The interactive kit's demo, one composition per path | `src/interactive/demo/Registrations.tsx` |
 *
 * Each film registers its compositions in its own Registrations file (see
 * building-scenes); Root.tsx only imports them. Register every scene before
 * any parallel split.
 *
 * Until 2026-10-21 this file also said that explainers go in a top-level
 * `Explainers` folder, and held the LIVE showcase's nine compositions inline
 * with an append-at-the-marker comment. The compositions moved unchanged into
 * the film's own Registrations file; the marker went because appending at it
 * during parallel work is unsafe (working-in-parallel).
 *
 * Folder names use hyphens rather than spaces, because Remotion validates them.
 */
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <LiveShowcaseRegistrations />
      <InteractiveDemoRegistrations />
    </>
  );
};
