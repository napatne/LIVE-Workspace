// Download the instrument samples the score renders with. Once per machine.
//
//   node scripts/score/fetch-soundfont.mjs
//
// GeneralUser GS 2.0.3 by S. Christian Collins: one 32 MB General MIDI
// SoundFont - pianos, strings, winds, guitars, percussion, about 260
// instruments. Pinned to one commit of the author's own GitHub repository, which
// he offers for exactly this ("automated packaging"; he asks that nobody link
// to the downloads on his website), and checked against a SHA-256 so a changed
// file is refused rather than used.
//
// Licence, from its LICENSE.txt: "You may use GeneralUser GS without
// restriction for your own music creation, private or commercial." Music
// rendered with it needs no credit line. The file itself stays out of Git
// (vendor/soundfonts/ is ignored) - 32 MB in every clone's history is the cost
// this avoids.

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { exit } from "node:process";
import { pathToFileURL } from "node:url";

export const SOUNDFONT = "vendor/soundfonts/GeneralUser-GS.sf2";
const URL =
  "https://github.com/mrbumpy409/GeneralUser-GS/raw/684543d5e5efaef08d02be50dcda8d552478fa60/GeneralUser-GS.sf2";
const SHA256 = "9575028c7a1f589f5770fccc8cff2734566af40cd26ed836944e9a5152688cfe";
const BYTES = 32_319_396;

const hash = (buf) => createHash("sha256").update(buf).digest("hex");

const main = async () => {
  if (existsSync(SOUNDFONT) && hash(readFileSync(SOUNDFONT)) === SHA256) {
    console.log(`${SOUNDFONT} is already here and intact.`);
    return;
  }
  console.log(`Downloading GeneralUser GS (${(BYTES / 1e6).toFixed(0)} MB) from\n  ${URL}`);
  const res = await fetch(URL, { redirect: "follow" });
  if (!res.ok) {
    console.error(`Download failed: HTTP ${res.status}. Check the connection, or download the file by hand to ${SOUNDFONT}.`);
    exit(1);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  const got = hash(buf);
  if (got !== SHA256) {
    console.error(`The file that arrived is not the pinned one (sha256 ${got.slice(0, 16)}…). Not saved.`);
    exit(1);
  }
  mkdirSync(dirname(SOUNDFONT), { recursive: true });
  writeFileSync(`${SOUNDFONT}.part`, buf);
  renameSync(`${SOUNDFONT}.part`, SOUNDFONT);
  console.log(`Saved ${SOUNDFONT} (${buf.length} bytes, checksum matches).`);
};

// Run when called directly; importable for its constant.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
