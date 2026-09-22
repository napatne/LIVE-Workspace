# LIVE

**Learner's Intelligent Video Engineer**

A workspace for making short video in code, with an AI assistant doing the building.

## Watch the film first

There is a 70-second film in here whose subject is this repository. Watching it is the fastest way
to understand what this project does.

```console
git clone https://github.com/napatne/LIVE.git
cd LIVE
npm install
npm run dev
```

A browser tab opens. Expand **LIVE-showcase** in the list on the left, click **LiveShowcaseFilm**,
and press play. It has no sound — that is deliberate.

## Start here

**Open this folder in a coding assistant and say what you want.** That is the whole interface. The
assistant reads [`AGENTS.md`](AGENTS.md), finds the skill that matches, and takes it from there.

Three things to say, depending on where you are:

| Say | What happens |
| --- | --- |
| *"What is this?"* | It walks you through the workspace and what it can make |
| *"Nothing runs."* | It installs and verifies Node, the dependencies and FFmpeg |
| *"Make me a video about X."* | It asks what it needs to know and builds one |

You do not have to know which skill is which. `AGENTS.md` holds the routing table if you want to
see it, and the skills themselves are in [`.agents/skills/`](.agents/skills/).

## What this is

Videos here are built out of code rather than dragged around a timeline. That sounds like a
disadvantage and is the opposite: because the video is text, an assistant can read it, change it,
and rebuild it, and every change is something you can undo.

It uses [Remotion](https://www.remotion.dev), a tool for making videos with React and TypeScript.
Pictures are generated as stills, dropped into the project, and animated in code.

**The code is the smaller half of what is here.** Anyone with a coding assistant can assemble a
Remotion project. What is written down in the skills is how three people actually used one — three
films, several assistants running in parallel, one shared repository — and what that taught them.

## What is in here

| Folder | What it holds |
| --- | --- |
| `.agents/skills/` | The skills. Every one of them, once |
| `.claude/skills/` | Generated stubs so assistants that auto-discover skills find them |
| `src/` | The code for every scene |
| `public/assets/` | The pictures the film uses |
| `content/` | The storyboard, script and asset notes for the film |
| `scripts/` | Checked-in utilities — audio, re-timing, skill sync |
| `out/` | Rendered video files. Deliberately not tracked in Git |
| `agent-logs/` | A written handoff per working session. Empty until you write one |

One film ships, as the worked example: **LIVE showcase**, 70 seconds, silent, paper collage, about
this repository. Two others were made here and were removed, so that what ships is one film and the
tools and practice that made it.

## Commands

| Command | What it does |
| --- | --- |
| `npm install` | Install what the project needs. Run once |
| `npm run dev` | Open the preview in a browser |
| `npm run lint` | Check the code for errors |
| `npx remotion compositions` | List every video and its real length |
| `npx remotion render <video> out/<name>.mp4` | Save a video as a file |
| `node scripts/sync-skills.mjs` | Validate the skills and regenerate the stubs |
