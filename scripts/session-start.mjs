// Print where the work stands, so a new session starts from the last one's
// handoff instead of from nothing.
//
//   node scripts/session-start.mjs
//
// An assistant starts every session knowing nothing about the last. The
// handoff exists - in agent-logs/, in each film's brief - but only helps if it
// is read, and the moment to read it is before the first action, not after
// the first mistake. This prints, in a few lines:
//
//   - the branch and how much is uncommitted, and since when (with the nudge to
//     offer a checkpoint: nothing else prompts the person to commit)
//   - the last agent log's "Where the next agent picks up"
//   - how many lessons agent-logs/LESSONS.md holds
//   - every film with a brief, and when its last decision was made
//
// Claude Code runs this on its own at session start (.claude/settings.json).
// Any other assistant runs it first, as AGENTS.md says. It reads; it never
// writes, fetches or changes anything.

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { chdir, env } from "node:process";

// Claude Code's hook may start this from wherever the session is; everything
// below is relative to the project root.
if (env.CLAUDE_PROJECT_DIR && existsSync(env.CLAUDE_PROJECT_DIR)) chdir(env.CLAUDE_PROJECT_DIR);

const LOGS = "agent-logs";
const HANDOFF_LINES = 14;

const git = (...args) => {
  const r = spawnSync("git", args, { encoding: "utf8" });
  return r.status === 0 ? r.stdout.trim() : null;
};
// The local calendar date - toISOString() would give UTC, a day ahead by evening.
const day = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const out = [];
const say = (line = "") => out.push(line);

say(`LIVE — where the work stands, ${day(new Date())}`);
say();

// --- Git -------------------------------------------------------------------
const branch = git("branch", "--show-current");
if (branch === null) {
  say("Not a Git repository, or Git is not installed — nothing to report about history.");
} else {
  const head = git("rev-parse", "--short", "HEAD");
  // -uall lists the files inside a new folder, not the folder as one entry.
  const status = git("status", "--porcelain", "-uall") ?? "";
  const changed = status.split("\n").filter(Boolean);
  say(`Branch ${branch || "(detached)"} at ${head}.`);
  if (!changed.length) {
    say("Nothing uncommitted.");
  } else {
    // The oldest change still on disk is a fair guess at how long the work has
    // gone uncommitted. Deleted files have no date and are skipped.
    const dates = changed
      .map((line) => line.slice(3).replace(/^"|"$/g, "").split(" -> ").pop())
      .filter((path) => existsSync(path))
      .map((path) => statSync(path).mtime);
    const oldest = dates.length ? day(new Date(Math.min(...dates))) : "an unknown date";
    say(`${changed.length} file${changed.length === 1 ? "" : "s"} uncommitted, the oldest changed ${oldest}.`);
    say("  → Tell the person, and offer a local checkpoint commit before new work (collaborating-with-git).");
  }
}
say();

// --- The last log's handoff --------------------------------------------------
const logs = existsSync(LOGS)
  ? readdirSync(LOGS).filter((f) => /^\d{3}-\d{4}-\d{2}-\d{2}-.+\.md$/.test(f)).sort()
  : [];
if (!logs.length) {
  say("No agent logs yet. This may be the first session — the keeping-agent-logs skill says how to write one.");
} else {
  const last = logs[logs.length - 1];
  const next = String(Number(last.slice(0, 3)) + 1).padStart(3, "0");
  say(`${logs.length} agent log${logs.length === 1 ? "" : "s"}. Last: ${LOGS}/${last}`);
  const text = readFileSync(join(LOGS, last), "utf8");
  const section = text.match(/^## Where the next agent picks up\s*$([\s\S]*?)(?=^## |(?![\s\S]))/m)?.[1].trim();
  if (section) {
    say("  Where the next agent picks up:");
    const lines = section.split(/\r?\n/);
    for (const line of lines.slice(0, HANDOFF_LINES)) say(`    ${line}`);
    if (lines.length > HANDOFF_LINES) say(`    … (${lines.length - HANDOFF_LINES} more lines in the log)`);
  } else {
    say("  It has no \"Where the next agent picks up\" section — read the whole log.");
  }
  say(`  Read the last two or three logs before acting. The next log number is probably ${next} — check it is free.`);
}
say();

// --- Lessons -----------------------------------------------------------------
const lessonsPath = `${LOGS}/LESSONS.md`;
if (existsSync(lessonsPath)) {
  // Count only under "## Lessons" - the file's own example of a lesson sits above it.
  const text = readFileSync(lessonsPath, "utf8");
  const list = text.slice(Math.max(0, text.search(/^## Lessons\s*$/m)));
  const count = (list.match(/^### /gm) ?? []).length;
  say(count
    ? `${lessonsPath}: ${count} lesson${count === 1 ? "" : "s"} from earlier sessions. Read them before starting.`
    : `${lessonsPath}: no lessons recorded yet.`);
  say();
}

// --- Films with a brief --------------------------------------------------------
const briefs = existsSync("content")
  ? readdirSync("content", { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => join("content", d.name, "docs", "brief.md"))
      .filter((p) => existsSync(p))
  : [];
if (briefs.length) {
  say("Films with a brief (decisions, and whose they were):");
  for (const p of briefs) {
    const text = readFileSync(p, "utf8");
    const rows = text.split("\n").filter((l) => /^\|/.test(l) && !/^\|\s*-/.test(l)).length - 1;
    const dates = text.match(/\d{4}-\d{2}-\d{2}/g) ?? [];
    const latest = dates.sort().pop();
    say(`  ${p} — ${Math.max(rows, 0)} decision${rows === 1 ? "" : "s"}${latest ? `, latest ${latest}` : ""}`);
  }
  say();
}

// --- So: who is this, and what comes first ----------------------------------------
// Checked by files only a finished install produces - the same test as the
// setup check, because a half-finished install leaves an empty node_modules.
const installed = ["node_modules/remotion/package.json", "node_modules/@remotion/cli/package.json"].every((f) => existsSync(f));
const returning = logs.length > 0 || briefs.length > 0;
say("What comes first:");
if (!installed) {
  say("  Not installed yet. Before anything else, look: node scripts/check-setup.mjs says what is");
  say("  missing or too old and this machine's fix for each (installing-the-toolchain →");
  say("  reference/SETUP-CHECK.md). Tell the person the whole list once, then ask once for each.");
}
if (returning) {
  say("  Work is in progress here, so this is a returning person. Read the brief and the last log,");
  say("  say where things stood in one line, and ask one question (building-a-video →");
  say("  reference/interview.md → If they come back later).");
} else {
  say(`  A fresh copy. A first message here is a newcomer's: the onboarding skill${installed ? "" : ", once installed"} -`);
  say("  offer a quick tour or going straight to a video, and let them choose - even when their");
  say("  first message already asks for a video.");
}
say("  A video starts with a short outline of the stages, then questions one at a time or all");
say("  together, as they prefer. Every decision is the person's, or yours said out loud and");
say("  written in the brief (AGENTS.md → Nobody decides silently).");
console.log(out.join("\n"));
