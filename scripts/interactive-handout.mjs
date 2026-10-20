// Make an interactive film's hand-out: one folder with the page and every path as a video.
//
//   node scripts/interactive-handout.mjs --config web/<project>/vite.config.mts --prefix <Film>- --out out/<project>
//
// What someone is given is one folder named for the project:
//
//   out/<project>/index.html        the interactive page - double-click, no server
//   out/<project>/<Film>-<Path>.mp4 every path as an ordinary video, for anyone
//                                   who cannot or will not use the page
//
// Not a dist/ here, an out/ there and a scratch/ somewhere else. This script:
//   1. builds the page (the config's outDir must be the same --out folder)
//   2. renders every composition whose id starts with --prefix
//   3. finishes each (colour range, loudness) and measures it
//   4. clicks through the page with scripts/test-interactive-page.mjs
//   5. lists the folder
//
// Per AGENTS.md: commands are argument arrays and are printed before they run.

import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, rmSync, statSync } from "node:fs";
import { join } from "node:path";
import { argv, exit } from "node:process";

// Remotion's and Vite's own entry files, run with node: no shell, the same on
// every platform (Node refuses to run npx's .cmd shim without one on Windows).
const REMOTION_CLI = "node_modules/@remotion/cli/remotion-cli.js";
const VITE_CLI = "node_modules/vite/bin/vite.js";

const flag = (name) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 ? argv[i + 1] : undefined;
};
const config = flag("config");
const prefix = flag("prefix");
const out = flag("out");
if (!config || !prefix || !out || !existsSync(config)) {
  console.error("usage: node scripts/interactive-handout.mjs --config web/<project>/vite.config.mts --prefix <Film>- --out out/<project>");
  exit(1);
}

const run = (cmd, args, { capture = false } = {}) => {
  console.log(`\n$ ${cmd} ${args.join(" ")}`);
  const r = spawnSync(cmd, args, {
    encoding: "utf8",
    stdio: capture ? "pipe" : "inherit",
    maxBuffer: 64 * 1024 * 1024,
  });
  if (r.status !== 0) {
    if (capture) console.error(r.stderr);
    console.error(`${cmd} failed.`);
    exit(r.status ?? 1);
  }
  return r.stdout ?? "";
};

// 1 · The page.
run("node", [VITE_CLI, "build", "--config", config]);
if (!existsSync(join(out, "index.html"))) {
  console.error(`The build did not write ${out}/index.html - the config's outDir and --out must be the same folder.`);
  exit(1);
}

// 2-3 · Every path.
const list = run("node", [REMOTION_CLI, "compositions"], { capture: true });
const ids = list
  .split(/\r?\n/)
  .map((l) => l.trim().split(/\s+/)[0])
  .filter((id) => id && id.startsWith(prefix));
if (!ids.length) {
  console.error(`No composition starts with "${prefix}".`);
  exit(1);
}
for (const id of ids) {
  const raw = join(out, `.${id}-render.mp4`);
  run("node", [REMOTION_CLI, "render", id, raw]);
  run("node", ["scripts/finish-video.mjs", raw, join(out, `${id}.mp4`)]);
  rmSync(raw, { force: true });
  run("node", ["scripts/check-render.mjs", join(out, `${id}.mp4`), "--no-sheet"]);
}

// 4 · Click through it.
run("node", ["scripts/test-interactive-page.mjs", join(out, "index.html")]);

// 5 · What is in the folder.
console.log(`\n${out}/`);
for (const f of readdirSync(out).filter((f) => !f.startsWith("."))) {
  console.log(`  ${f.padEnd(40)} ${(statSync(join(out, f)).size / 1e6).toFixed(1)} MB`);
}
console.log("\nThe folder is the hand-out. Whether the film is ready to give out is the person's call.\n");
