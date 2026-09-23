---
name: onboarding
description: Explains what this workspace is, what it can make, and walks a newcomer to their first video. Use at first contact - when someone has just opened or cloned this folder, asks what this is or what it can do, asks where to start, or opens with a question no other skill clearly covers.
---

# Onboarding — introducing this workspace to a person

**Use this when** someone has just arrived and has not yet decided what to make.

**You need first** nothing. This is the entry point, and it assumes no prior contact.

**This produces** a person who knows what this makes, what it will not make, what it will ask of
them, and which way they want to go next.

**Then go to** `building-a-video` if they want one now, `installing-the-toolchain` if nothing runs
yet, or `viewing-and-rendering` if they only want to watch the example.

---

## How to run this

**This is a conversation you perform, not a document you deliver.** Everything below is written
for you to say in your own words, spread across turns. The failure this exists to prevent is one
long message that explains the whole workspace correctly and is not read.

1. **One point per message. Then stop and wait.** Never send two points in one turn, however
   related they look.
2. **Keep each one short.** Three or four sentences. If it wants a list, three items at most. A
   point that needs a paragraph is two points.
3. **End every point with a cue** — one line saying what is next, phrased so they can say yes, ask
   about something else, or leave. The cue is what makes this a path rather than a lecture.
4. **No file paths, commands or jargon in the early points.** Not *composition*, *fps*, *render*,
   *staticFile*, *repo*. Say *video*, *scene*, *length*, *picture*, *folder*. Paths arrive at
   "Where things live" and nowhere before it.
5. **Do not announce the structure.** No "there are eight things to cover", no "step 3 of 8", no
   "welcome to LIVE". You do not yet know how many points you will use, and promising a number you
   then abandon is worse than saying nothing.
6. **Do not read this file aloud.** The wording here is the point being made, not a script to
   recite. Say it the way you talk.
7. **They can stop at any time, and that is a success** — not an abandoned onboarding.

## Working out how far to go

**The default is the full route.** Someone who has said nothing about what they want gets all of
it, one point at a time, until they steer.

Then read what comes back and adjust. You are choosing the route as you go, not working down a
fixed list:

**Go shorter** when they arrive with a goal already — *"make me a video about X"* — or when two
replies in a row are one or two words with no question in them (*ok*, *got it*, *sure*, *next*).
Compress what is left to the essentials and move.

**Skip ahead** the moment they ask for it. *"Just make the video"*, *"skip this"*, *"I've used this
before"* — go. Do not finish the point you were on.

**Go longer** when they ask a question inside a point, say *why* or *how*, push back, or answer
with something specific of their own. Expand that point, and expect the ones after it to want the
same depth.

**Offer the exit** if they have been flat for two turns: *"I can keep going, or we can start making
something and pick this up as it comes."*

**One point is never skipped, on any route: what it cannot do.** Even on the fastest path straight
into building, deliver it in two lines before the interview starts. Someone who is not told the
shape is fixed will ask for a phone-shaped video and find out after they are invested. That has
happened here.

---

## The points

Cover these in this order on the full route. Merge, drop or expand them as the conversation tells
you to — but never move the limits later than they sit here.

### What this is

A folder on their computer that makes videos out of code, and the thing they talk to is you. Two
directions it works in: **made from nothing** — a script, some pictures, and code that draws every
frame — and **made from footage** — existing video as a base, re-cut and re-timed with text and
graphics laid over it.

*Cue:* offer to say how they actually work it.

### How you work it

They describe what they want; you write the code, get the pictures made, time it and render it.
They never have to open a file or learn to code. **What they do is decide and react** — watch it,
say what is wrong, watch it again. That is the whole interface, and it is where most of their time
goes.

*Cue:* offer what making one actually looks like, start to finish.

### What making one actually looks like

You interview them first — what it is about, who it is for, how long, whether it has a voice, what
it should look like, where the pictures come from. Then a script they approve, then pictures, then
the scenes get built, then they watch and say what is off, repeatedly, then it renders to a file.

**Say the honest scale.** The 70-second film in this folder took about a day and a half with two
people, across seven working sessions, through four different target lengths and one complete
rejection of a finished cut. Going round again is the normal shape of this work, not a sign it is
going badly. Someone should be able to tell whether they are starting an afternoon or a month.

*Cue:* offer the limits, and say they are worth hearing before starting rather than after.

### What it cannot do

**This point is mandatory on every route.** Five things, plainly, without apologising for them:

- **Wide only — 1920×1080.** No upright, no phone shape, nothing for Reels, TikTok or Stories. It
  is not a setting that can be changed: every layout in here is built for the wide shape. If
  upright is what they need, say so now, and say this is not the tool for it.
- **About thirty seconds is the floor.** Under that it has to be raced and stops being watchable.
  For five seconds, a still image is usually the better answer.
- **It draws; it does not film.** Text, diagrams, motion graphics, and still pictures moved around
  — not footage of real people or places, unless they bring the footage themselves or a paid
  generation service is connected and approved.
- **Rendering takes real minutes**, not seconds. The preview is instant; the finished file is not.
- **They are the judge, not you.** You will tell them if a file is broken, the wrong size or
  missing its sound. You will not tell them whether it is any good. That call is theirs, always.

*Cue:* ask whether that still works for them, and offer either the next point or going straight to
making something.

### It runs here, and it is free

The code, the preview and the rendering all happen on this machine. Nothing is uploaded in order to
make a video. What it is built on — Node, Remotion, FFmpeg — is free and open source.

The exceptions are opt-in and named: a generated voice or generated images go out to a service and
may cost money. `ACCESS.md` lists which are connected and what each costs, and nothing is spent
without asking them first.

*Cue:* offer where things go when they hand something over.

### Where things live

Three places worth knowing — and they never have to move a file by hand. Naming where something is
is a complete instruction.

- **What they hand in** goes in `content/` — photos, footage, recordings, notes, reference, in
  whatever state it arrives. A workbench, not a filing cabinet.
- **Prepared pictures the video actually draws** sit in `public/`. You move things there once they
  are cut out, named and sized.
- **Finished videos and single frames** land in `out/`. Nothing there is precious; all of it can be
  remade from the rest.

*Cue:* offer the three ways to see the work.

### Seeing the work

Three, in increasing order of patience:

- **The live preview** — opens in their browser, runs on this machine, scrubs frame by frame, and
  updates as changes are made. Most of the back-and-forth happens here.
- **A single frame** — pulled out as an image in seconds. When the question is whether one
  particular moment looks right, this is the cheap way to answer it.
- **The full render** — a few quiet minutes, then a video file they can send, upload or present.

*Cue:* offer what they can do from here.

### Four ways on

Offer these as choices, not as a list to read out:

- **Look around.** Nothing breaks from reading.
- **Go deeper.** Everything so far is deliberately shallow — you can expand any of it on request.
- **Make a video.** *"Create a video for me"* is the whole instruction. Every question has a
  default, and *"you decide"* is always a valid answer. Three ready-made subjects exist for a
  standing start. → `building-a-video`
- **See the worked example.** A complete film was left here with all its working — storyboard,
  script, assets, scenes and the finished video. Walking through it shows the whole machine on
  something real. → `viewing-and-rendering`, and `content/live-showcase/docs/`

---

## When something goes wrong during this

**Nothing runs, or a command fails** → `installing-the-toolchain`. Do not try to fix it inline; it
has the verification steps and the failure cases.

**They ask a technical question mid-way** → answer it properly, then return to where you were.
Appendix A is yours for that. A technical question is not permission to switch into technical
register for the rest of the conversation.

**They ask something no skill covers** → answer it. This skill is also the catch-all for a first
question that routes nowhere else.

---

## Appendix A — the technical version

**This is for you, not for them.** Never recite it during onboarding. It is here so that a
technical question mid-conversation gets a correct answer without leaving the skill.

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

**Organisation:** one top-level folder per film, leading with its delivery composition, scenes in a
`Scenes` subfolder beneath. The rule, from the file itself — *a top-level folder is a film someone
can be shown.* Scene compositions exist so one scene can be reviewed and re-rendered without
sitting through the whole film.

**Derive durations, never type them twice.** A master's duration is imported from its own scene
table, not written into `Root.tsx`. Typed separately, the two drift and the master cuts off its own
last frame.

**1920×1080 is not negotiable in code either.** Every layout constant downstream — safe margins,
figure area, caption panel, diagram viewBox — is authored for landscape. A 9:16 version is new
layout work nobody has specified, not a number to change.

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

### Frames

Video is still pictures shown fast — here, thirty every second. Frame 90 is three seconds in; a
450-frame scene runs fifteen seconds. Frames divided by the frame rate gives seconds. Check the fps
of the composition before converting: this repository has carried films at both 30fps and 24fps.
Never mix frame rates within one film.

### FFmpeg

Two copies exist. `npx remotion ffmpeg` and `npx remotion ffprobe` reach Remotion's bundled n7.1
build — always present, trimmed for rendering. Bare `ffmpeg` and `ffprobe` reach the full system
install, and are what `scripts/*.mjs` invoke directly.

The bundled build has `setpts`, `minterpolate`, `silenceremove` and `afade` compiled out. Run
`npx remotion ffmpeg -filters` to check availability before relying on one.

### Assets

Referenced with `staticFile()`, never a relative path:

```tsx
<Img src={staticFile("assets/live-showcase/props/clapboard.png")} />
```

`public/` is copied wholesale into the bundle on every render, used or not — so it is a staging
area, not storage.

### The three kinds of file, for a technical questioner

**Code** turns a script and a pile of images into frames and then a file, and drives edits to
existing footage. **Agentic guides** — `AGENTS.md`, the skills in `.agents/skills/`, and the logs in
`agent-logs/` — are what makes this folder worth more than the code in it; the more it is used, the
better it responds, and that improvement stays in this copy. **Assets** are what comes in and what
goes out.

### Git, if they ask

A video here is text and numbers, so source-control tools apply to it directly, which is not true
of a video editor's project file. Git keeps every change to a script, a timing, a colour or a
layout as a step that can be read, compared and undone. GitHub is the shared copy, and how several
people work on one film at once. `out/` is excluded on purpose — large, and remakeable from what is
tracked.

None of it is required to make one video. It becomes the point the moment a second person is
involved, or a change needs undoing. → `collaborating-with-git`

### Documents versus reality

`content/<project>/docs/` is the authority on **intent**. The code is the truth about **what
exists**. Where they disagree, say which is wrong and let a person decide — do not silently change
either to match the other. `AGENTS.md` carries the full rule.
