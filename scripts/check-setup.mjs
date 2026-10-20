// Look at this machine before installing anything: what is here, what is too
// old, what is missing, and how THIS machine would fix each one.
//
//   node scripts/check-setup.mjs
//
// The installing is the assistant's job, but only what is actually needed, and
// only after telling the person. That starts with an accurate picture: someone
// may have Node already but too old, an FFmpeg that is missing the filters the
// scripts use, or packages half-installed. Each needs a different fix, and the
// right update for Node depends on how it was installed - a version manager, the
// Windows installer, Homebrew - so this says which.
//
// It only reads. It installs nothing, downloads nothing, changes nothing.
// Written for old Node too (no fetch, no newer syntax): it has to run on the
// version it may be about to report as too old.

import { execFileSync, execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import * as fs from "node:fs";
import { arch, platform } from "node:os";
import { join } from "node:path";
import process from "node:process";

const NODE_MIN = [22, 12, 0];
// The filters scripts/ call. A minimal FFmpeg build can lack any of them and
// still answer `ffmpeg -version`, so the version alone proves nothing.
const FILTERS = [
  "setpts", "minterpolate", "silenceremove", "afade", "loudnorm", "alimiter", "acompressor",
  "ebur128", "volumedetect", "silencedetect", "blackdetect", "freezedetect", "tile", "scale",
];
const DISK_MIN_GB = 1.5;

const os = platform();
// Real executables run without a shell. npm is a .cmd script on Windows, which
// Node will only start through one - so npm alone goes through the shell there,
// as one fixed string with nothing from outside in it.
const sh = (cmd, args) => {
  const opts = { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] };
  try {
    if (os === "win32" && cmd === "npm") return execSync(`npm ${args.join(" ")}`, opts);
    return execFileSync(cmd, args, opts);
  } catch {
    return null;
  }
};
// FFmpeg's tools take -version; most others take --version.
const has = (cmd, flag = "--version") => sh(cmd, [flag]) !== null;

const rows = [];
const needed = [];
const row = (name, value, verdict, fix) => rows.push({ name, value, verdict, fix });

// --- Node ------------------------------------------------------------------------
const nodeVersion = process.versions.node;
const parts = nodeVersion.split(".").map(Number);
const tooOld = parts[0] < NODE_MIN[0] || (parts[0] === NODE_MIN[0] && parts[1] < NODE_MIN[1]);

// Where this Node came from decides how to update it without breaking anything.
const exe = process.execPath.replace(/\\/g, "/").toLowerCase();
const env = process.env;
let source;
let update;
if (env.NVM_HOME || exe.includes("/nvm/")) {
  source = "nvm-windows";
  update = "nvm install lts  then  nvm use lts";
} else if (env.NVM_DIR || exe.includes("/.nvm/")) {
  source = "nvm";
  update = "nvm install 22  then  nvm alias default 22";
} else if (exe.includes("volta")) {
  source = "Volta";
  update = "volta install node@22";
} else if (exe.includes("fnm")) {
  source = "fnm";
  update = "fnm install 22  then  fnm default 22";
} else if (exe.includes("/opt/homebrew/") || exe.includes("/usr/local/cellar/") || exe.includes("/usr/local/opt/")) {
  source = "Homebrew";
  update = "brew upgrade node";
} else if (os === "win32") {
  source = "the Windows installer";
  update = has("winget") ? "winget upgrade OpenJS.NodeJS.LTS  (or winget install OpenJS.NodeJS.LTS)" : "the LTS installer from https://nodejs.org";
} else if (exe.startsWith("/usr/bin/")) {
  source = "the system package manager";
  update = "the LTS installer from https://nodejs.org, or the NodeSource packages - a distribution's own node is often old";
} else {
  source = "unknown";
  update = "the LTS installer from https://nodejs.org";
}
if (tooOld) {
  row("Node.js", `v${nodeVersion}`, "TOO OLD", `needs ${NODE_MIN.slice(0, 2).join(".")} or newer. Installed with ${source}; update: ${update}. Then restart the assistant.`);
  needed.push("update Node.js");
} else {
  row("Node.js", `v${nodeVersion}`, "ok", `installed with ${source}`);
}

// --- npm -------------------------------------------------------------------------
const npmVersion = sh("npm", ["--version"]);
if (npmVersion) row("npm", npmVersion.trim(), "ok", "");
else {
  row("npm", "-", "MISSING", "comes with Node.js - reinstall Node from https://nodejs.org");
  needed.push("npm (reinstall Node.js)");
}

// --- The project's packages ------------------------------------------------------------
// Checked by a file inside each, not the folder: an interrupted install leaves
// the folders behind, empty.
if (existsSync("package.json")) {
  const pkg = JSON.parse(readFileSync("package.json", "utf8"));
  const wanted = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies });
  const missing = wanted.filter((name) => !existsSync(join("node_modules", name, "package.json")));
  if (!missing.length) row("Packages", `${wanted.length} of ${wanted.length}`, "ok", "");
  else {
    const list = missing.slice(0, 4).join(", ") + (missing.length > 4 ? `, and ${missing.length - 4} more` : "");
    row("Packages", `${wanted.length - missing.length} of ${wanted.length}`, "MISSING", `${list} - install: npm install${tooOld ? " (after Node is updated)" : ""}`);
    needed.push("install the project's packages");
  }
} else {
  row("Packages", "-", "?", "no package.json here - run this from the LIVE folder");
}

// --- FFmpeg --------------------------------------------------------------------------
const ffVersion = sh("ffmpeg", ["-version"]);
const ffInstall = os === "win32" ? "winget install Gyan.FFmpeg" : os === "darwin" ? "brew install ffmpeg" : "the package manager's ffmpeg";
if (!ffVersion) {
  row("FFmpeg", "-", "MISSING", `install: ${ffInstall}. Then restart the assistant.`);
  needed.push("install FFmpeg");
} else {
  // "9.0-full_build-www.gyan.dev" → "9.0": the build name is not the version.
  const v = ffVersion.split("\n")[0].replace(/^ffmpeg version\s+/, "").split(" ")[0].split("-")[0];
  const filters = sh("ffmpeg", ["-hide_banner", "-filters"]) ?? "";
  const lacking = FILTERS.filter((f) => !new RegExp(`\\s${f}\\s`).test(filters));
  const probe = has("ffprobe", "-version");
  if (lacking.length || !probe) {
    row("FFmpeg", v, "INCOMPLETE", `${lacking.length ? `lacks ${lacking.join(", ")}` : "no ffprobe"} - a full build is needed: ${ffInstall}`);
    needed.push("replace FFmpeg with a full build");
  } else {
    row("FFmpeg", v, "ok", "full build - every filter the scripts use, and ffprobe");
  }
}

// --- Disk ------------------------------------------------------------------------------
if (typeof fs.statfsSync === "function") {
  const s = fs.statfsSync(".");
  const gb = (s.bavail * s.bsize) / 1e9;
  if (gb < DISK_MIN_GB) {
    row("Disk", `${gb.toFixed(1)} GB free`, "LOW", `rendering needs about ${DISK_MIN_GB} GB: the browser Remotion downloads, and the videos`);
    needed.push("free some disk space");
  } else row("Disk", `${gb.toFixed(0)} GB free`, "ok", "");
}

// --- Fetched later, on first use - mention, do not install now -------------------------
const later = [];
if (!existsSync(join("node_modules", ".remotion", "chrome-headless-shell"))) {
  later.push("the browser Remotion draws with (~110 MB download, ~270 MB on disk), automatic on the first preview or render");
}
if (!existsSync(join("vendor", "soundfonts", "GeneralUser-GS.sf2"))) {
  later.push("music samples (32 MB), only if a video gets music: npm run soundfont");
}

// --- Report ------------------------------------------------------------------------------
console.log(`Setup check — ${os} ${arch()}\n`);
for (const r of rows) {
  console.log(`  ${r.name.padEnd(9)} ${r.value.padEnd(14)} ${r.verdict.padEnd(10)} ${r.fix}`);
}
if (later.length) {
  console.log("\nFetched later, on first use:");
  for (const l of later) console.log(`  - ${l}`);
}
console.log("");
if (!needed.length) {
  console.log("Nothing to install. Say nothing about setup and carry on.");
} else {
  console.log(`Needed (${needed.length}), in this order: ${needed.join("; ")}.`);
  console.log("Tell the person the whole list in one short message, in plain words - what each is and why -");
  console.log("then ask once for each, and run it yourself. Never hand them a command.");
}
process.exitCode = needed.length ? 1 : 0;
