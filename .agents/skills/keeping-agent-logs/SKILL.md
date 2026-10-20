---
name: keeping-agent-logs
description: Starts a working session from the last one's handoff and ends it with an honest log, then turns what went wrong into lessons the next session reads - so the workspace learns across sessions instead of repeating them. Use at the start of a session, when asked for a summary, status or handoff, when someone says "where were we", "pick up where we left off" or "what did we do last time", before a session ends, or when a mistake looks like one made before.
---

# Keeping agent logs

**Use this when** a session starts, a summary or handoff is asked for, or a session is ending.

**You need first** nothing. On a fresh clone `agent-logs/` holds only its README, the template and
an empty lessons file, and that is normal.

**This produces** one log per session in `agent-logs/`, and lessons in `agent-logs/LESSONS.md` that
every later session reads before it starts.

**Then go to** whatever the log says is next — or `onboarding` if there is no log and the person is
new here.

---

## Why this exists

An assistant starts every session knowing nothing about the last. Without a written handoff it
re-decides what was settled, re-proposes what was tried and dropped, and repeats measurements
someone already took. People do too, in less detail. A log is how one session hands over to the
next. **Lessons are how the workspace stops making the same mistake** — a mistake written in one log
and never read again is a mistake the next three sessions each make once.

## At the start

1. **Run `node scripts/session-start.mjs`.** Claude Code runs it on its own at session start
   (`.claude/settings.json`); any other assistant runs it first. It prints the branch, what is
   uncommitted and since when, the last log's *Where the next agent picks up*, how many lessons there
   are, and every film with a brief.
2. **Read the last two or three logs and `agent-logs/LESSONS.md`** before acting.
3. **Check live state before repeating anything a log or a summary says.** Run
   `git branch --show-current` and `git status` yourself. One session told its director it was on
   `main` because a session-start snapshot said so; it was not. The next two sessions checked, because
   that log said to.
4. **Read every claim about the environment as one machine's.** *"FFmpeg is not installed"* in a log
   describes the machine that wrote it. Check the one in front of you.

If uncommitted work is waiting, tell the person and offer a local checkpoint before new work starts
(`collaborating-with-git`).

## Writing the log

**When:** when a summary, status or handoff is asked for, and once more before the session ends.
Not after every action. If a summary was asked for mid-session, update that same entry later rather
than starting a second.

**The file:** `agent-logs/NNN-YYYY-MM-DD-<assistant>.md`, from `agent-logs/TEMPLATE.md`. **List the
folder and take the next free number immediately before writing.** Two sessions on two branches once
both took the same number and collided when the branches met; the session-start script suggests the
next number, and it is only a suggestion.

**What makes a log worth reading:**

- **Their words, not your summary of them.** Directions and corrections quoted. The corrections are
  usually the most useful lines in the file.
- **What became of each thing:** approved, rejected (with their reason, in their words), or not yet
  seen. Never let "built" read as "approved".
- **What you got wrong.** Not optional. A log of successes makes the next session confident about
  things nobody checked.
- **Every stale document you found, and the fix you propose for it.** Found-and-noted is not enough:
  one stale statement was logged by three sessions and fixed by none. Either fix it and say so, or
  write the exact fix as a proposal the person can say yes to.
- **The decisions made, and whose they were** — or a pointer to the film's brief, where they are
  recorded (`building-a-video` → `reference/decisions.md`).
- **State at handoff:** the commit, every uncommitted file, anything half-done, money spent.

**Copy in what the next reader needs.** A link to a file outside this folder — a personal notes
folder, another repository, a download — is a dead link on every other machine. Quote the part that
matters.

**This repository may be public.** A log pushed to it is published. Name no one who is not part of
the work, quote no one's personal history, and include no private paths.

## Learning from the logs

After writing the log, **take each item in *What I got wrong* and hold it against
`agent-logs/LESSONS.md`**:

- **Already there** → add this log's number to that lesson's *Seen in* line. A lesson seen three
  times is worth more than a new one seen once.
- **New, and likely to happen again to someone else** → add it, in the shape below.
- **Specific to this one film or one slip** → leave it in the log only.

```markdown
### Check the branch yourself; do not trust a snapshot

A session-start snapshot said `main`; the work was on another branch. Run
`git branch --show-current` before saying where the work is.

Seen in: 007, 011
Would have been caught by: keeping-agent-logs (at the start, step 3)
```

**Write the rule, then the reason, so it makes sense to someone arriving today** — not *"don't do
what I did"* (`working-practice` rule 6). And name the skill that would have caught it.

**When a lesson reaches three sightings, propose moving it into that skill.** Say so in the reply:
*"'Check the branch yourself' has now come up three times — shall I add it to keeping-agent-logs?"*
A lesson in a skill is read at the moment it applies; a lesson in a list is read only if someone
opens the list. The person decides; do not edit the skill unasked.

## What a log is not

- **Not a transcript.** What was decided and why, not every command.
- **Not the film's documentation.** A film's intent lives in `content/<project>/docs/`, its
  decisions in the brief. The log is the session's account and points to them. Where a film also
  keeps its own session notes, say in the log which one is the record of what happened.
- **Not a progress report.** It is written for the next assistant, who knows nothing — not to show
  the person that work was done.
