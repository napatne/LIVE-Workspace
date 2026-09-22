---
name: installing-the-toolchain
description: Installs and verifies everything needed to build video here - Node, project dependencies, a full FFmpeg, and the browser preview. Use on a fresh machine or a new clone, when a command fails because a tool is missing, when the preview will not open, or when a build stops finding something that worked yesterday.
---

# Installing the toolchain

**Use this when** the folder is new to this machine, or something fails in a way that smells like a
missing tool.

**You need first** the project folder and a terminal.

**This produces** a machine where `npm run dev` opens the preview and a full FFmpeg answers on the
command line.

**Then go to** `onboarding` if the person is new here, or `building-a-video` if they already know
what they want.

---

## Say what is being installed, and why, before running it

In plain terms, at a non-specialist level. Someone agreeing to a command should know what it puts
on their machine. Two of the things below land system-wide and stay there.

| What | Where it lands | Why |
| --- | --- | --- |
| Node.js | System-wide | Runs everything here |
| Project dependencies | Inside this folder, in `node_modules/` | Remotion, React and the rest. Removable by deleting the folder |
| FFmpeg | System-wide | Audio conditioning, re-timing, inspection, conversion |
| Chrome for rendering | Downloaded on first render | Remotion renders through it. Large, and downloaded once |

**Install locally, never globally.** Tools go in as dev dependencies and run through `npx`. A
global install changes a machine outside this project and is not ours to change.

## The order

1. **Node** — version 16 or higher. `node --version`.
2. **`npm install`** — once, in the project folder. Prints a great deal and takes minutes.
3. **FFmpeg** — a full system install. See below for why the bundled one is not enough.
4. **`npm run dev`** — the preview opens a browser tab on its own.
5. **Mention the first-render download once**, so it is not a surprise later.

## How to check, and how to behave

**Test for dependencies with a file, not a directory.** `node_modules/remotion/package.json` has
to exist as a file — a half-finished install leaves the folder behind and passes a directory
check. A file-glob tool that honours ignore rules will report nothing at all, because
`node_modules` is ignored; use a direct listing.

**If it is already fine, say nothing.** Nobody needs to be told their computer is configured
correctly. The best version of this skill is one the person never knew ran.

**Install it yourself rather than handing over a command.** Explain what and why, ask once, then
run it. They opened a chat window, not a terminal.

**Then go straight on to the first question.** Do not report success and wait.

## FFmpeg: the bundled copy is not enough

Remotion ships its own FFmpeg, reachable as `npx remotion ffmpeg` and `npx remotion ffprobe`. It
also renders through its own bundled codec libraries, so **rendering never touches a system
FFmpeg at all.**

Two things follow, and they pull in opposite directions:

- **`which ffmpeg` is the wrong test for the bundled copy.** It is deliberately not on PATH, and a
  check reporting it missing is answering a different question.
- **The bundled build is trimmed, and a full install is still required.** Four filters this
  project's scripts depend on are compiled out of it: `setpts` and `minterpolate` in
  `scripts/retime-plate.mjs`, `silenceremove` and `afade` in `scripts/build-audio.mjs`. Anything
  reaching for `npx remotion ffmpeg` to run either script gets a failure that is hard to read.

Verify with `npx remotion ffmpeg -filters` against the filters a script actually uses, rather than
assuming either copy has them.

## A half-finished install looks exactly like a finished one

Dependency folders can sit there with most of their contents missing, and nothing reports an error
until something tries to use them. **If a build suddenly cannot find something that was obviously
there yesterday, suspect a broken install before suspecting the code.**

**Close the preview before reinstalling anything.** Reinstalling deletes first and installs second.
With the preview holding a file open, the second half fails and the project is left unable to build
at all — this has already cost someone a working session here.

## Do not assume a missing tool from someone else's report

Every *tool is missing* line in this project's history came from one contributor's machine and was
read by others as a fact about the project. It was not. Check on the machine in front of you.

## Reference

- [`reference/INSTALL.md`](reference/INSTALL.md) — getting the folder, opening it in an assistant,
  and what to say first.
- [`reference/SETUP-CHECK.md`](reference/SETUP-CHECK.md) — the step-by-step verification, including
  what to do when Node is missing or too old, and the one time `npm install` is re-run.
- [`reference/PERMISSIONS.md`](reference/PERMISSIONS.md) — what an assistant may run unattended,
  what still asks, what is refused, and the reasoning behind each split.
