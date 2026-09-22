// Put every skill where each assistant looks for it.
//
//   node scripts/sync-skills.mjs          check and write
//   node scripts/sync-skills.mjs --check  validate only, write nothing
//
// The skills themselves live once, in .agents/skills/. That folder is the
// tool-neutral convention and it is what ships. But Claude Code only discovers
// skills under .claude/skills/, so a skill that lives only in .agents/ never
// fires on its own - it has to be pointed at by name, every time.
//
// So this writes a stub into .claude/skills/<name>/SKILL.md carrying the same
// frontmatter and a pointer to the real file. Claude matches the description,
// loads the stub, reads one file deeper. No content is duplicated, and there
// is still exactly one copy of every skill to maintain.
//
// Why not a symlink: git on Windows checks a tracked symlink out as a text file
// containing its target path unless core.symlinks is on, which it is not here.
// A symlinked skill works on the machine that made it and arrives broken
// everywhere else.
//
// It also validates each skill against the published Agent Skills spec, because
// a description that breaks the rules does not error - it just quietly stops
// the skill from ever being chosen.

import { readFileSync, writeFileSync, readdirSync, mkdirSync, lstatSync, rmSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";
import { exit } from "node:process";

const SOURCE = ".agents/skills";
const TARGET = ".claude/skills";
const LOCK = "skills-lock.json";

// From the Agent Skills spec. Exceeding these does not throw anywhere; it just
// means the skill is never selected, which is far harder to notice.
const NAME_MAX = 64;
const DESCRIPTION_MAX = 1024;
const NAME_SHAPE = /^[a-z0-9-]+$/;
const RESERVED = ["anthropic", "claude"];

const checkOnly = process.argv.includes("--check");

/** Pull `name` and `description` out of YAML frontmatter without a YAML parser. */
const readFrontmatter = (text) => {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;
  const fields = {};
  for (const line of match[1].split(/\r?\n/)) {
    const pair = line.match(/^(\w+):\s*(.*)$/);
    if (pair) fields[pair[1]] = pair[2].trim();
  }
  return fields;
};

// Hash the LF-normalised bytes, not the raw ones. A CRLF checkout on Windows
// is the same skill, and hashing raw bytes reports drift on every machine that
// checks the file out differently.
const normalisedHash = (text) =>
  createHash("sha256").update(text.replace(/\r\n/g, "\n"), "utf8").digest("hex");

/** Does the description say when to reach for the skill, not just what it does? */
const statesItsTrigger = (description) =>
  description
    .toLowerCase()
    .split(/[^a-z]+/)
    .includes("use");

// Two severities on purpose. The spec rules are fatal: break one and the skill
// is rejected outright. The trigger-clause rule is guidance, not spec - a skill
// missing it still loads, it just gets chosen less reliably. Vendored skills
// fail it routinely and are not ours to rewrite.
const problems = [];
const warnings = [];
const written = [];

if (!existsSync(SOURCE)) {
  console.error(`No ${SOURCE}/ - nothing to sync.`);
  exit(1);
}

const skills = readdirSync(SOURCE, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

for (const dir of skills) {
  const path = join(SOURCE, dir, "SKILL.md");
  if (!existsSync(path)) {
    problems.push(`${dir}: no SKILL.md`);
    continue;
  }

  const fields = readFrontmatter(readFileSync(path, "utf8"));
  if (!fields) {
    problems.push(`${dir}: no YAML frontmatter`);
    continue;
  }

  const { name, description } = fields;

  if (!name) problems.push(`${dir}: frontmatter has no name`);
  else if (name !== dir) problems.push(`${dir}: name is "${name}" but the folder is "${dir}" - they must match`);
  else if (name.length > NAME_MAX) problems.push(`${dir}: name is ${name.length} chars, over the ${NAME_MAX} limit`);
  else if (!NAME_SHAPE.test(name)) problems.push(`${dir}: name must be lowercase letters, numbers and hyphens only`);
  else if (RESERVED.some((word) => name.includes(word))) problems.push(`${dir}: name contains a reserved word`);

  if (!description) problems.push(`${dir}: frontmatter has no description`);
  else if (description.length > DESCRIPTION_MAX) problems.push(`${dir}: description is ${description.length} chars, over the ${DESCRIPTION_MAX} limit`);
  else if (!statesItsTrigger(description)) warnings.push(`${dir}: description never says when to use the skill - that half is what gets matched against`);

  if (problems.some((problem) => problem.startsWith(`${dir}:`))) continue;
  if (checkOnly) continue;

  const stubDir = join(TARGET, dir);
  // A symlink left by an earlier setup shadows the stub. Replace it - see the
  // note on core.symlinks above. On Windows a directory symlink reports as a
  // directory to rmSync, so it needs recursive even though it holds nothing.
  if (existsSync(stubDir) && lstatSync(stubDir).isSymbolicLink()) {
    console.log(`  replacing symlink ${stubDir}`);
    rmSync(stubDir, { recursive: true, force: true });
  }
  mkdirSync(stubDir, { recursive: true });

  writeFileSync(
    join(stubDir, "SKILL.md"),
    `---
name: ${name}
description: ${description}
---

The skill is at \`${SOURCE}/${dir}/\`. Read \`${SOURCE}/${dir}/SKILL.md\` now, and
follow it from there.

This file exists only so the skill is discovered. Do not add content here - it is
regenerated by \`node scripts/sync-skills.mjs\` and anything written here is lost.
`,
    "utf8",
  );
  written.push(dir);
}

// A vendored skill records where it came from and the hash of what was taken.
// Nothing read that hash until now, so the recorded value drifted from the file
// and no session found out - which is the one thing the lock exists to prevent.
if (existsSync(LOCK)) {
  const lock = JSON.parse(readFileSync(LOCK, "utf8"));
  for (const [name, entry] of Object.entries(lock.skills ?? {})) {
    const path = join(SOURCE, name, "SKILL.md");
    if (!existsSync(path)) {
      warnings.push(`${name}: recorded in ${LOCK} but ${path} does not exist`);
      continue;
    }
    if (!entry.computedHash) continue;
    const actual = normalisedHash(readFileSync(path, "utf8"));
    if (actual !== entry.computedHash) {
      warnings.push(
        `${name}: does not match the hash in ${LOCK} (${actual.slice(0, 12)}… vs ${entry.computedHash.slice(0, 12)}…) - either the copy was edited here, or it was refreshed from ${entry.source} without updating the lock`,
      );
    }
  }
}

console.log(`\n${skills.length} skills in ${SOURCE}/`);
if (written.length) console.log(`${written.length} stubs written to ${TARGET}/`);

if (warnings.length) {
  console.warn(`\n${warnings.length} warning${warnings.length === 1 ? "" : "s"}:`);
  for (const warning of warnings) console.warn(`  - ${warning}`);
}

if (problems.length) {
  console.error(`\n${problems.length} problem${problems.length === 1 ? "" : "s"}:`);
  for (const problem of problems) console.error(`  - ${problem}`);
  exit(1);
}

console.log(`All skills valid against the Agent Skills spec.${warnings.length ? " Warnings above are advisory." : ""}\n`);
