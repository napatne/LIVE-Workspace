import { createInteractiveFilm } from "../kit/InteractiveFilm";
import { DEMO_SCENES } from "./scenes";
import { DEMO_SEGMENTS } from "./segments";

/** The demo, as one component: a path in Studio and renders, every path on the page. */
export const DemoFilm = createInteractiveFilm(DEMO_SEGMENTS, DEMO_SCENES);
