# Agent logs

One file per working session, written at the end of it, for whoever works on this next.

A fresh copy has no logs here — only this file, [`TEMPLATE.md`](TEMPLATE.md) and an empty
[`LESSONS.md`](LESSONS.md) — because the logs are yours to write. The sessions that built the film in
this repository kept their logs here and they were removed before it was published; what they
learned was written into the skills instead.

## Why bother

Work on a video runs across many sessions, and an assistant starts each one knowing nothing about
the last. Without a written handoff it re-derives what was already settled, re-proposes ideas that
were tried and dropped, and repeats measurements someone already took.

A log is how a session hands over. It is a summary, not a transcript.

## How to write one

Copy [`TEMPLATE.md`](TEMPLATE.md) to `NNN-YYYY-MM-DD-<assistant>.md` and fill it in. Check the
number is free first — sessions running in parallel have collided on one before.

The sections that earn their place: what you were asked for in the asker's own words, what you
actually changed, what was approved and what is still unreviewed, what you got wrong, and where
the next session picks up.

**The honest sections are the valuable ones.** A log recording only what went well makes the next
session confident about things nobody verified.

## How the logs teach the next session

A log is read by the next session or two and then forgotten. A lesson is read by every session
after it. So:

1. **At the start of a session**, `node scripts/session-start.mjs` prints the last log's handoff and
   how many lessons there are. Read the last two or three logs and [`LESSONS.md`](LESSONS.md) before
   doing anything.
2. **At the end**, after writing the log, hold each thing in *What I got wrong* against
   `LESSONS.md`: a repeat adds this log's number to the lesson; a new mistake that could happen to
   anyone becomes a new lesson.
3. **A lesson seen three times is proposed for the skill that would have prevented it**, so it is
   read at the moment it applies instead of only when someone opens the list.

The `keeping-agent-logs` skill has the detail. The policy — when to write a log, when to update the
current one, and what belongs in it — is in `AGENTS.md`.
