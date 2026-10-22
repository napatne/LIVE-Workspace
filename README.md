# LIVE

**Learner's Intelligent Video Engineer**

A workspace for making short video in code, with an AI assistant doing the building.

## Start here — one sentence to your AI agent

You do not install anything yourself, type commands, or edit files. An AI coding agent does all
of it, and you talk to it.

**1. Open an AI coding agent** — **Claude Code** or **Codex**. In the Claude desktop app it is the
tab marked **`</>`**; in other apps look for a **Codex** or **work** tab. It needs **terminal /
command access** turned on — on by default in both, but check.

**2. Paste this:**

> Set up LIVE for me from https://github.com/napatne/LIVE-Workspace — put it in my Documents
> folder, then read its AGENTS.md and follow it.

**3. Say yes when it asks.** It downloads the folder, then checks for and installs what it needs —
**Node.js**, the project's own packages, and **FFmpeg** — asking you once for each and doing the
rest itself. If it installs Node or FFmpeg it may ask you to close and reopen the agent once, so
they show up.

**4. Choose.** It then offers a **quick tour** of what this is and what it can make, or to go
**straight to making a video**. Either is fine; you can stop the tour at any point.

**Every time after that**, open your agent *in* the `LIVE-Workspace` folder and say what you want.
It picks up where you left off — it keeps a short record of every decision, and whose it was.

| Say | What happens |
| --- | --- |
| *"What is this?"* | A short tour, one point at a time |
| *"Make me a video about X."* | It offers a quick tour first, then shows the steps ahead and what the video can include, asks what it needs — one at a time or all at once — and builds it |
| *"Show me the example film."* | It opens the short film this folder made about itself in the preview, or saves it as a video file you can play |
| *"Nothing runs."* | It checks and repairs Node, the packages and FFmpeg |

**Work laptop?** Managed machines often block installing software, and no agent can get around
that. If an install fails, ask your IT service desk for **"Node.js, LTS version"** and **FFmpeg**,
then try again.

You do not have to know which skill is which. [`AGENTS.md`](AGENTS.md) holds the routing table if
you want to see it, and the skills themselves are in [`.agents/skills/`](.agents/skills/).

## The example film

There is a short film in here, about a minute long, whose subject is this repository — watching it is
the fastest way to understand what this does. Ask your agent to show it to you: it opens the preview
in your browser, where the film is **LIVE-showcase → LiveShowcaseFilm** in the list on the left, or,
if a preview is awkward on your machine, saves the film as a video file in `out/`. It has no sound;
that was that film's choice, and a new one can have narration and music.

## What this is

Videos here are built out of code rather than dragged around a timeline. That sounds like a
disadvantage and is the opposite: because the video is text, an assistant can read it, change it,
and rebuild it, and every change is something you can undo.

It uses [Remotion](https://www.remotion.dev), a tool for making videos with React and TypeScript.
Pictures are drawn in code by default, for nothing, and animated there; generated stills from an
image tool of your own work too. Your own photos, video clips and voice recordings can go in as
well — whether to use something that belongs to someone else is your call, and the assistant says
so once.

**The code is the smaller half of what is here.** Anyone with a coding assistant can assemble a
Remotion project. What is written down in the skills is how three people actually used one — three
films, several assistants running in parallel, one shared repository — and what that taught them.

## What is in here

| Folder | What it holds |
| --- | --- |
| `.agents/skills/` | The skills. Every one of them, once |
| `.claude/skills/` | Generated stubs so assistants that auto-discover skills find them |
| `src/` | The code for every scene, the interactive kit (`src/interactive/`) and the shared timeline (`src/lib/`) |
| `web/` | Pages that play a film interactively, each built to one file that opens without a server |
| `public/assets/` | The copies of pictures, sound and footage a scene actually uses. Everything here is copied into every render |
| `content/` | The brief, storyboard, script and asset notes for each film, and in `intake/` the raw material handed in |
| `scripts/` | Checked-in tools — music, measuring and finishing a render, narration, the interactive hand-out, skill sync |
| `vendor/` | Downloaded once, never tracked: the instrument samples the music is played on |
| `out/` | Rendered video files and hand-out folders. Deliberately not tracked in Git |
| `agent-logs/` | A written handoff per working session, and the lessons drawn from them. Empty until you write one |

One film ships, as the worked example: **LIVE showcase**, about a minute long, silent, paper collage,
about this repository (`npx remotion compositions` gives its exact length). Two others were made here
and were removed, so that what ships is one film and the tools and practice that made it. Silent and
paper collage are that film's choices: a new one can have narration and an original score, in any of
the styles the assistant will offer, be cut from your own footage, and ask its viewer questions as
it plays.

## Commands

| Command | What it does |
| --- | --- |
| `npm install` | Install what the project needs. Run once |
| `npm run dev` | Open the preview in a browser |
| `npm run lint` | Check the code for errors |
| `npm run session` | Where the work stands: branch, uncommitted files, the last session's handoff |
| `npx remotion compositions` | List every video and its real length |
| `npx remotion render <video> out/<name>.mp4 --color-space=bt709` | Save a video as a file |
| `npm run check-render -- <file>` | Measure a render: size, length of picture and sound, black or frozen stretches, silence, loudness |
| `npm run finish -- <file>` | Finish a render for delivery: standard colour range, one loudness. Add `--web` for a smaller file |
| `npm run soundfont` | Download the instrument samples for music. Once per machine |
| `npm run score -- <score.mjs>` | Build a film's music from its score file |
| `npm run interactive` | Try the interactive demo in a browser |
| `npm run skills` | Validate the skills and regenerate the stubs |

You will rarely type any of these. The assistant runs them at the step each belongs to —
`AGENTS.md` lists which step that is.
