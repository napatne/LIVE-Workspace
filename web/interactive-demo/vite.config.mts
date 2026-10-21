import { defineConfig } from "vite";
import { inlineIntoHtml, singleFileBuild } from "../inline-into-html.mjs";

/**
 * The interactive demo's page. From the project root:
 *
 *   npm run interactive         a dev server for authoring, on localhost:5175
 *   npm run interactive:build   out/interactive-demo/index.html, which opens
 *                               WITHOUT a server
 *
 * To start a new interactive film, copy this folder to web/<project>/, change
 * the two names below that say "interactive-demo", put the film's paths in its
 * paths.json, and add one script to package.json, "<project>", for the
 * authoring page. No build script is needed:
 * `node scripts/interactive-handout.mjs <project>` builds the page itself,
 * from web/<project>/vite.config.mts into out/<project>/.
 *
 * `publicDir` is off: a film drawn in code needs none, and the project's own
 * public/ would otherwise be copied into every build. A film with images
 * points this at a small folder of its own - and references them by relative
 * path, not staticFile(), which resolves to the Remotion server, not a file.
 */
export default defineConfig({
  root: "web/interactive-demo",
  base: "./",
  publicDir: false,
  server: { port: 5175 },
  plugins: [inlineIntoHtml()],
  build: singleFileBuild("../../out/interactive-demo"),
});
