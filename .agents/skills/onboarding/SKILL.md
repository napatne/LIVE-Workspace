---
name: onboarding
description: Explains what this workspace is, what it can make, and walks a newcomer to their first video. Use at first contact - when someone has just opened or cloned this folder, asks what this is or what it can do, asks where to start, or opens with a question no other skill clearly covers.
---

# LIVE — a workspace for making video

**Use this when** someone has just arrived and has not yet decided what to make.

**You need first** nothing. This is the entry point, and it assumes no prior contact.

**This produces** a person who knows what this folder does, what it will ask of them, and which of
four next steps they want.

**Then go to** `building-a-video` if they want one now, `installing-the-toolchain` if nothing runs
yet, or `viewing-and-rendering` if they only want to watch the example.

---

**An agent working in this folder makes videos, or edits ones that already exist.** Explainers,
course material, walkthroughs, title sequences, cut-downs of existing footage. If it matters
and it moves, it belongs here.

Two directions:

- **Made from nothing.** A script, some pictures, and code that draws every frame.
- **Made from footage.** Existing video as a base, with text, captions, graphics and timing
  laid over it, re-cut and re-timed.

Understanding the concept and what this workspace is for is worth a few minutes. Learning to
code or to make films is not required — that part is collaborative, and the agent carries it.

---

## What this is

A folder, on a computer. It came from GitHub, downloaded by hand or fetched by an agent, and it
can be opened and browsed like any other folder.

**Everything runs locally.** The code, the preview, the rendering — all of it happens on this
machine, using its processor and its disk. The exception is explicit and opt-in: if a service
is connected for narration or image generation, that particular request goes out, and
`ACCESS.md` says which services those are.

Underneath it is **Node** and **TypeScript**, both free and open source, plus a library called
**Remotion** that builds video the way a web page is built — in code. And **FFmpeg**, which
handles everything to do with existing video files: cutting, re-timing, converting, inspecting.

The consequence that matters: **the video is written down.** It can be changed by changing
words and numbers, remade in minutes, and remade again differently. That is the reason this
exists instead of a video editor.

---

## Three kinds of files

Everything here is one of three things.

### 1. Code — the part that draws

Turns a script and a pile of images into moving pictures, frame by frame, and then into a video
file. It also drives edits to existing footage — trimming, re-timing, laying text and graphics
over a clip.

The agent works here. It rarely needs opening by hand.

### 2. Agentic guides — the part that teaches the agent

The unusual part, and the reason this folder is worth more than the code in it.

- **`AGENTS.md`** — the rules. What to do, what not to, how work gets approved. Every agent
  that opens this folder reads it first. Under Claude Code, `CLAUDE.md` points here, so
  everything starts in the same place.
- **Skills** — packaged know-how, loaded when a job calls for it. Some technical: building a
  composition, laying out a diagram, generating narration. Some **anecdotal** — what was
  learned making real films here, including what went wrong.
- **Logs** — written during use. What was asked for, what worked, what would be done
  differently. The next session reads them. **The more this workspace is used, the better it
  gets at responding**, and that improvement stays in this copy of the folder.

### 3. Assets — pictures, sound and film

Material brought in: photographs, logos, recordings, footage. And finished work going out: a
video to upload, drop into a presentation, hand out as course material, or use as an onboarding
piece.

---

## Where things sit

The four worth knowing by name.

### `content/` — everything brought in, and everything written about the work

One folder per project, split in two:

```text
content/
  project-name/
    intake/     material brought in: images, footage, recordings, reference
    docs/       the project's own documents: storyboard, script, plan, asset list
```

**`intake/` is a workbench, not a filing cabinet.** Things arrive in whatever state they arrive
in; nothing needs tidying first. Files don't have to be moved by hand either — naming them is
enough. *"There are four prop images in my Downloads folder — clapboard, reel, slate and marker
— bring them in"* is a complete instruction, and the agent does the moving.

`docs/` is where the work gets decided before a line of code is written: what happens, in what
order, in what words.

### `public/` — the staging area the code reads from

Material lands here once it has been prepared — cut out, named, sized, ready to be drawn. The
code reads only from here.

The rule: **`content/` is inbound, `public/` is staged.** A supplied photograph goes in
`content/`. The version with its background removed and a name the code can find goes in
`public/`. The agent handles the move.

Everything in `public/` is copied on every render, whether the video uses it or not — so it is
a staging area, not storage.

### `out/` — finished renders and single frames

Nothing here is precious; all of it can be remade from the code. Safe to delete entirely.

### `.agents/` — where the skills live

For the agent rather than for a person. Under Claude Code, the relevant skills are copied from
here into `.claude/`.

Also worth knowing by name: **`ACCESS.md`**, which lists what is actually connected — which
services have keys, which are free, which cost money.

---

## Seeing the work

Three ways, in increasing order of patience.

**The live preview.** Remotion's own tool, opening in a browser at a local address, running on
this machine. The video can be scrubbed frame by frame and changes appear as they are made.
This is where most of the back-and-forth happens.

**A single frame.** A full render takes many minutes; pulling one frame out as an image takes
seconds. When the question is whether one specific moment looks right, that is the cheap way to
answer it.

**The finished render.** Several quiet minutes, then a video file in `out/`.

One piece of vocabulary appears constantly: **frames**. Video is still pictures shown fast —
usually thirty every second. Frame 90 is three seconds in; a 450-frame scene runs fifteen
seconds. Frames divided by the frame rate gives seconds.

---

## What has to be installed

Three things. **Two go on the computer; everything else stays inside this folder.** Node.js and
FFmpeg are system-wide; the project's own dependencies live in `node_modules/` here and go away
when the folder does.

**An agent installing something says what it is installing and why, at a level a non-specialist can
follow** — before running the command, not after.

Tools install locally and run through `npx`, never with `npm install -g`. A global tool is
invisible in the project, cannot be pinned to a version, and changes behaviour for every other
project on the machine.

The procedure, the verification steps and what to do when one of them fails are in
`installing-the-toolchain`. They are kept in one place so the two cannot drift apart.

## It is code, so it versions and it collaborates

A video here is text and numbers in files. That means the tools built for source code apply to
it directly, which is not true of a video editor's project file.

**Git** keeps the history. Every change to a script, a timing, a colour or a layout is a
recorded step that can be read, compared against what came before, and undone. A version from
last week is still there. Nothing has to be saved as `final-v3-actually-final`.

**GitHub** is the shared copy. Several people can work on the same project at once — one on the
script, one on the visuals — and the changes merge, because they are changes to text rather
than to a single binary file nobody else can open while it is in use. It is also how this
folder arrived, and how an improved version of it reaches anyone else.

**What is tracked, and what is not.** The code, the documents and the staged assets are
versioned. Rendered videos and frame stills are not — `out/` is excluded on purpose, because
they are large and can be remade from what is tracked at any time.

None of this is required to make a single video. It becomes the point the moment a second
person is involved, or a change needs undoing.

---

## This workspace extends

What ships is a floor, not a ceiling. The same folder can reach outside itself:

- **Generative video and images** — services such as Kling, Higgsfield, Gemini or Midjourney,
  for footage and stills that are generated rather than drawn.
- **Speech synthesis** — narration in a chosen voice, generated from the script.
- **Anything else with an interface** — data sources, asset libraries, internal tools.

Three routes, depending on the setup: **MCP connections** inside Claude Code or Codex, **API
keys** in `.env`, or simply **GitHub** for pulling in other work. Most of it costs money and
none of it is required — this workspace makes complete videos with nothing connected at all.
`ACCESS.md` records what is connected, what it costs, and what has been authorised.

---

## Four ways to carry on

**Look around.** Open the folder and browse it. Nothing breaks from reading, and the
three-kinds-of-files map above covers most of what turns up.

**Go deeper.** Everything above is deliberately shallow. An agent here can expand any of it on
request — how code becomes video, what is in `public/` right now, what `AGENTS.md` says.
Appendix A is the technical version in writing.

**Make a video.** The fastest way to understand this is to use it. The instruction is *"create
a video for me"*, which hands over to `building-a-video`, and the agent leads from there — what it's about, how long, whether it needs
narration, what pictures to use. Every question has a default, and "you decide" is always a
valid answer. Three ready-made topics exist for a standing start.

**Take the guided tour.** A complete film was made here and deliberately left behind with all
its working: the storyboard it was planned from, the script, the plan, the individual scenes,
and the finished film. Asking an agent to **walk through the LIVE showcase film from storyboard
to finished video** shows the whole machine working on something real. `viewing-and-rendering` opens
it; `content/live-showcase/docs/` holds what it was planned from.

---

## Appendix A — the technical version

Everything above without the explaining. This is the part for an agent to read first.

### The folder map

```text
content/<project>/intake/   material brought in, unprocessed
content/<project>/docs/     storyboard, script, implementation plan, asset manifest
public/assets/<project>/    staged assets the code draws, via staticFile()
out/                        renders and frame stills — gitignored, reproducible
src/                        the React/TypeScript that draws every frame
scripts/                    FFmpeg helpers — audio conditioning, plate re-timing
.agents/skills/             skills, loaded by agents
AGENTS.md                   rules for anyone working here — the entry point
CLAUDE.md                   a pointer to AGENTS.md
ACCESS.md                   authenticated services, free tiers, costs
.agents/skills/building-a-video/   the interview an agent runs with someone wanting a video
package.json                dependencies; npm install reads this
```

### `src/Root.tsx` is the index

Every renderable thing is registered there as a `<Composition>`. Remotion Studio's sidebar *is*
that file. Unregistered means nonexistent as far as the tooling is concerned.

```tsx
<Composition
  id="LiveShowcaseFilm"                  // the id to render by
  component={MasterFilm}                 // the component that draws it
  durationInFrames={LIVE_FILM_DURATION}  // imported from the scene table, never typed
  fps={30}
  width={1920} height={1080}
/>
```

**Organisation:** one top-level folder per film, leading with its delivery composition, scenes
in a `Scenes` subfolder beneath. The rule, from the file itself — *a top-level folder is a film
someone can be shown.* Scene compositions exist so one scene can be reviewed and re-rendered
without sitting through the whole film.

**Derive durations, never type them twice.** A master's duration is imported from its own scene
table, not written into `Root.tsx`. Typed separately, the two drift and the master cuts off its
own last frame.

### Commands

```console
npm install                      # once, before anything
npm run dev                      # Remotion Studio, in the browser on localhost
npx remotion compositions        # list every renderable id
npx remotion still LiveShowcaseSceneFour out/s4-f090.png --frame=90 --scale=0.5
npx remotion render LiveShowcaseFilm out/live-showcase.mp4
npm run lint                     # eslint + tsc
```

`--scale=0.5` is half resolution — fast, and enough to judge composition and timing. The naming
convention `s4-f090.png` reads as *scene 4, frame 90*; zero-padding keeps the folder sorted.

### FFmpeg

Two copies exist. `npx remotion ffmpeg` and `npx remotion ffprobe` reach Remotion's bundled
n7.1 build — always present, trimmed for rendering. Bare `ffmpeg` and `ffprobe` reach the full
system install, and are what `scripts/*.mjs` invoke directly.

The bundled build has `setpts`, `minterpolate`, `silenceremove` and `afade` compiled out. Run
`npx remotion ffmpeg -filters` to check availability before relying on one.

### Assets

Referenced with `staticFile()`, never a relative path:

```tsx
<Img src={staticFile("assets/live-showcase/props/clapboard.png")} />
```

`public/` is copied wholesale into the bundle on every render, used or not.

### Frame rates

Check the fps of the composition before converting frames to seconds. This repository has
carried films at both 30fps and 24fps. Never mix frame rates within one film.

### Documents versus reality

`content/<project>/docs/` is the authority on **intent**. The code is the truth about **what
exists**. Where they disagree, say which is wrong and let a person decide — don't silently
change either to match the other. `AGENTS.md` carries the full rule.
