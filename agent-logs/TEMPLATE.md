# Agent log template

Copy this file to `agent-logs/NNN-YYYY-MM-DD-<agent>.md` and fill it in before your session ends.

Write it for the **next agent**, not for the user. The user already knows what happened; the next agent knows nothing. Be honest about failures, wrong turns, and unfinished work — a log that only records successes is worse than no log, because it makes the next agent confident about things that were never verified.

Read the last two or three entries before you start working.

---

## Who I am

Agent name and model, the interface used (Claude Code, Codex, chat), and the session date.

## Where the project was when I started

The milestone in progress, HEAD commit, and anything already uncommitted in the working tree.

## What the user directed

The user's instructions, in their own words where it matters. Include corrections they made to me mid-session — those are usually the most useful thing in this file.

## What I actually did

Files created, changed, moved, or deleted. Commands run that changed state. Services accessed. Anything generated, and where the originals were put.

## What became of it

What the user approved, rejected, or has not yet reviewed. What passed a gate and what did not. If something was rejected, record the reason in the user's words, not my summary of it.

## What I got wrong

Mistakes, false assumptions, things I claimed that turned out not to be true, and anything I did that the user had to correct or undo. This section is not optional.

## Stale or wrong documentation I found

Every place a document disagreed with the repository — composition IDs, paths, frame rates, folder names, durations, service terms — and whether it was corrected or left standing. Record it even if you fixed it, and especially if you did not. This section is not optional either; drift one agent notices and does not write down is drift the next three each rediscover.

## State at handoff

- HEAD commit, and whether anything was committed this session
- Every uncommitted change, by file, and whether it is finished or mid-edit
- Anything broken, stubbed, or left in a half-state
- Budget used, if any (running total against the $5–$10 project ceiling)

## Where the next agent picks up

The next milestone or task, what it depends on, and anything the next agent should read or verify first. Name the open questions you did not resolve.
