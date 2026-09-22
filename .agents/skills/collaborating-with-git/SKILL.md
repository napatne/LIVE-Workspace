---
name: collaborating-with-git
description: Uses Git and GitHub to keep a video project recoverable and shared - what to track and what to leave out, how the folder travels between people, how to undo, and how to publish it without shipping its whole history. Use when setting up a repository for a video project, when several people share one, when something needs undoing, or when someone asks why any of this needs to be in Git.
---

# Collaborating with Git

**Use this when** the project will outlive one session, or be touched by more than one person.

**You need first** a project folder. Nothing else.

**This produces** a project with a history that can be walked back, and a way for it to reach
someone else's machine.

**Then go to** `working-in-parallel` if more than one worker is about to start.

---

## Why a video project in particular

A video here is text and numbers in files. **That is what makes version control apply to it at
all** — it does not apply to a video editor's project file in any useful way.

Three things follow, and they are the answer to *why do we need Git*:

- **Undo that survives closing the laptop.** Every change is recoverable, not just the ones still
  in an editor's undo stack.
- **A record of why.** A commit message is the only place the reason for a change lives. Six months
  later it is the only thing that explains a value nobody remembers choosing.
- **Two people on one project** without emailing folders around.

## What a video project tracks, and what it does not

The rule: **track what a video is made from, not what it is made into.**

| Tracked | Not tracked | Why |
| --- | --- | --- |
| `src/`, `content/`, `scripts/` | | The film, and how to rebuild it |
| `public/assets/` | | Inputs the code reads. Large, but not reproducible |
| `package.json`, lockfile | `node_modules/` | Reinstallable from the first two |
| Skill and guide files | Per-assistant caches | One canonical copy, not one per tool |
| | `out/` | Renders are reproducible, and large |
| | `.env` | Keys never go in a repository |

**Renders being untracked has a consequence worth stating out loud:** a finished film exists only
on the machine that made it. That has already cost one project its approved final file. Decide
where a delivered video lives — outside the repository — and do it before delivery, not after.

## Commits

- **Commit when something works**, not at the end of a day. A commit that spans four unrelated
  changes cannot be reverted usefully.
- **Say why in the message, not what.** The diff already says what.
- **Never commit on someone's behalf without being asked.** Creating, editing or reviewing work is
  not permission to publish it. This matters more with assistants than with people, because an
  assistant will otherwise commit as a matter of tidiness.
- **Branch rather than working on the default branch**, whenever the work might not land.

## Several people on one project

**Separate what conflicts badly from what conflicts well.**

Code conflicts are mechanical and a type checker catches a bad resolution. **Prose conflicts are
not** — two people editing the same document produce a merge where both versions read fine and
nothing tells you which is right.

So: give each contributor their own folder for anything written, keep shared documents to as few
as possible, and reconcile them deliberately at an agreed moment rather than continuously. For
code, divide by file and follow `working-in-parallel`.

**Anything sequentially numbered collides.** Two people on separate branches both take the next
free number, and the result is an add/add conflict. Either check the number is free immediately
before using it, or use something that does not increment.

## Undoing

- **A change not yet committed:** restore the file from the last commit.
- **A commit that should not have happened:** revert it, which adds a commit undoing it. The
  history keeps both, which is the point.
- **Work that has gone three rounds and got worse:** the version before those rounds was probably
  better. Going back is a legitimate answer, and it is only available if the intermediate states
  were committed.

## Publishing it without shipping the history

**A fork carries the entire history**, so deleting large assets in a later commit does not shrink
what anyone downloads. A repository that accumulated hundreds of megabytes of abandoned footage
stays that size forever from a clone's point of view.

To publish a cleaned version, **build a new repository from the current contents** rather than
forking. The history stays where it is, and what ships is what is there now.

## What an assistant does here, and what it does not

- It runs Git commands when asked, and reports what changed.
- **It does not stage, commit, tag or push unless the instruction in front of it says so.**
- It leaves work uncommitted and describes it for review.
- It never skips hooks or bypasses signing to make a commit succeed.
