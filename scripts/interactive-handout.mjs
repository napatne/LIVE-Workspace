// Make an interactive film's hand-out: one folder with the page and every path as a video.
//
//   node scripts/interactive-handout.mjs <project> [-- <remotion render flags>]
//
// Reads two files from the project's page folder:
//
//   web/<project>/vite.config.mts  the page's build - its outDir must be out/<project>
//   web/<project>/paths.json       every path, as { "<CompositionId>": { "<choice>": "<option>" } }
//                                  - the same list the film registers its compositions from
//
// What someone is given is one folder named for the project:
//
//   out/<project>/index.html          the interactive page - double-click, no server
//   out/<project>/<CompositionId>.mp4 every path as an ordinary video, for anyone
//                                     who cannot or will not use the page
//
// This script:
//   1. builds the page into out/<project>/
//   2. renders every composition named in paths.json - exactly those ids - into
//      a temporary folder, out/.handout-<project>/
//   3. finishes each (colour range, loudness) and measures it against its
//      composition, with the contact sheet written to out/<project>-review/ (beside
//      the hand-out folder, never inside it, so zipping the folder cannot take it);
//      only a video that passed all three is moved into out/<project>/
//   4. clicks through the page once for every path in paths.json, with that
//      path's answers, using scripts/test-interactive-page.mjs
//   5. lists the folder
//
// Anything after -- goes to every `remotion render`, e.g. `-- --concurrency=2`.
// Renders use --color-space=bt709 (the HD standard) unless a --color-space is
// passed there.
//
// A render, finish or measurement that fails stops the script and removes the
// temporary folder, so nothing half-made reaches the hand-out. A click-through
// that fails is reported and the other paths are still clicked; the script
// then exits 1.
//
// Per AGENTS.md: commands are argument arrays and are printed before they run.

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, rmSync, statSync } from "node:fs";
import { join } from "node:path";
import { argv, exit } from "node:process";

// Remotion's and Vite's own entry files, run with node: no shell, the same on
// every platform (Node refuses to run npx's .cmd shim without one on Windows).
const REMOTION_CLI = "node_modules/@remotion/cli/remotion-cli.js";
const VITE_CLI = "node_modules/vite/bin/vite.js";
const USAGE = "usage: node scripts/interactive-handout.mjs <project> [-- <remotion render flags>]";

const args = argv.slice(2);
const dash = args.indexOf("--");
const own = dash >= 0 ? args.slice(0, dash) : args;
const renderFlags = dash >= 0 ? args.slice(dash + 1) : [];
const [project] = own;
if (!project || own.length !== 1 || !/^[A-Za-z0-9][A-Za-z0-9_-]*$/.test(project)) {
  console.error(USAGE);
  exit(1);
}

// Forward slashes work on every platform, and print the same on each.
const config = `web/${project}/vite.config.mts`;
const pathsFile = `web/${project}/paths.json`;
const out = `out/${project}`;
const review = `${out}-review`;
const tmp = `out/.handout-${project}`;

for (const f of [config, pathsFile]) {
  if (!existsSync(f)) {
    console.error(`No ${f}. An interactive film's page folder, web/${project}/, needs vite.config.mts and paths.json - copy them from web/interactive-demo/.`);
    exit(1);
  }
}

// --- The paths -----------------------------------------------------------
let paths;
try {
  paths = JSON.parse(readFileSync(pathsFile, "utf8"));
} catch (e) {
  console.error(`${pathsFile} is not valid JSON: ${e.message}`);
  exit(1);
}
const isAnswers = (a) =>
  a && typeof a === "object" && !Array.isArray(a) && Object.keys(a).length > 0 && Object.values(a).every((v) => typeof v === "string");
if (!paths || typeof paths !== "object" || Array.isArray(paths) || !Object.keys(paths).length) {
  console.error(`${pathsFile} must be an object of { "<CompositionId>": { "<choice>": "<option>" } }, with at least one path.`);
  exit(1);
}
for (const [id, answers] of Object.entries(paths)) {
  if (!isAnswers(answers)) {
    console.error(`${pathsFile}: "${id}" must map to answers, like { "route": "short" }.`);
    exit(1);
  }
}
const ids = Object.keys(paths);

class Failed extends Error {}
const run = (cmd, cmdArgs, { capture = false } = {}) => {
  console.log(`\n$ ${cmd} ${cmdArgs.join(" ")}`);
  const r = spawnSync(cmd, cmdArgs, {
    encoding: "utf8",
    stdio: capture ? "pipe" : "inherit",
    maxBuffer: 64 * 1024 * 1024,
  });
  if (r.status !== 0) {
    if (capture) console.error(r.stderr);
    throw new Failed(`${cmd} ${cmdArgs[0] ?? ""} failed (exit ${r.status ?? r.signal}).`);
  }
  return r.stdout ?? "";
};
const cleanUp = () => rmSync(tmp, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });

const clickFailures = [];
try {
  // 1 · The page.
  run("node", [VITE_CLI, "build", "--config", config]);
  if (!existsSync(join(out, "index.html"))) {
    throw new Failed(`The build did not write ${out}/index.html - the outDir in ${config} must be out/${project}.`);
  }

  // 2-3 · Every path, by its exact composition id.
  const listed = new Set(
    run("node", [REMOTION_CLI, "compositions"], { capture: true })
      .split(/\r?\n/)
      .map((l) => l.trim().split(/\s+/)[0])
      .filter(Boolean),
  );
  const missing = ids.filter((id) => !listed.has(id));
  if (missing.length) {
    throw new Failed(`${pathsFile} names ${missing.join(", ")}, but no composition has that id. Is the film's Registrations imported in src/Root.tsx, and does it register from paths.json?`);
  }

  const flags = renderFlags.some((f) => f.startsWith("--color-space")) ? renderFlags : ["--color-space=bt709", ...renderFlags];
  cleanUp();
  mkdirSync(tmp, { recursive: true });
  mkdirSync(review, { recursive: true });
  for (const id of ids) {
    const raw = join(tmp, `${id}-render.mp4`);
    const finished = join(tmp, `${id}.mp4`);
    run("node", [REMOTION_CLI, "render", id, raw, ...flags]);
    run("node", ["scripts/finish-video.mjs", raw, finished]);
    run("node", ["scripts/check-render.mjs", finished, "--composition", id, "--sheet-dir", review]);
    renameSync(finished, join(out, `${id}.mp4`));
    rmSync(raw, { force: true });
  }
  cleanUp();

  // 4 · Click through the page, once for every path.
  for (const id of ids) {
    const answers = Object.entries(paths[id]).flatMap(([choice, option]) => ["--answer", `${choice}=${option}`]);
    try {
      run("node", ["scripts/test-interactive-page.mjs", join(out, "index.html"), ...answers]);
    } catch (e) {
      if (!(e instanceof Failed)) throw e;
      clickFailures.push(id);
    }
  }
} catch (e) {
  cleanUp();
  console.error(`\n${e instanceof Failed ? e.message : e.stack}`);
  console.error("Stopped. The temporary renders were removed; the hand-out folder holds only what was finished before this.");
  exit(1);
}

// 5 · What is in the folder.
console.log(`\n${out}/`);
for (const f of readdirSync(out).filter((f) => !f.startsWith("."))) {
  const p = join(out, f);
  if (statSync(p).isDirectory()) {
    console.log(`  ${f}/`);
  } else {
    console.log(`  ${f.padEnd(40)} ${(statSync(p).size / 1e6).toFixed(1)} MB`);
  }
}
if (clickFailures.length) {
  console.error(`\nThe click-through failed for: ${clickFailures.join(", ")}. Read its FAIL lines above before handing anything out.`);
  exit(1);
}
console.log(`\nEvery path was rendered, measured and clicked through (${ids.length}). Whether the film is ready to give out is the person's call.\n`);
