---
name: onboarding
description: Gets a newcomer from nothing to ready - checks and installs what the workspace needs, then offers a short tour of what it is and what it can make, and walks them to their first video. Use at first contact - when someone has just opened, cloned or asked you to set up this folder, says hello, asks what this is or what it can do, asks where to start, opens with a question no other skill clearly covers, or opens by asking for a video - a first message in this folder always comes here first.
---

# Onboarding — introducing this workspace to a person

**Use this when** someone has just arrived and has not yet decided what to make.

**You need first** nothing. This is the entry point, and it assumes no prior contact — not even an
install.

**This produces** a machine that can build video, and a person who knows what this makes, what it
will not make, what it will ask of them, and which way they want to go next.

**Then go to** `building-a-video` if they want one now, or `viewing-and-rendering` if they only want
to watch the example.

---

## Before the first word: make sure it can build

**Run the setup check first** — `installing-the-toolchain` → `reference/SETUP-CHECK.md`: Node
22.12 or newer, the project's packages, a full FFmpeg. It starts by **looking** —
`node --version`, then `node scripts/check-setup.mjs` — so you know what is missing, too old or
incomplete before you say a word about it. Someone who has just cloned this has probably got none
of the packages and maybe an old Node, and a tour that ends in *"now let's install things"* has
wasted their attention.

- **All present → say nothing about it.** Go straight to the opening below.
- **Something missing → install it yourself**, the way the setup check says: what it is and why in
  a sentence, ask once, run it, mention the one-off browser download. Then the opening.
- **If you were asked to clone it** and you are not running inside the folder, work from it by
  path for this session, and say once, at the end of the setup, that next time they should open
  their assistant *in* the folder — that is where its skills load on their own.

## Open with a choice

Once it can build, **one short message**: what this is in one sentence, and a choice.

> This is a folder that makes short videos out of code — you describe what you want and I build
> it. Would you like a quick tour of how it works first, or shall we go straight to making a
> video?

- **Tour** → the short tour (below), one point at a time. The full route only if they ask for
  more.
- **Straight to a video** → the limits in two lines (*What it cannot do*, below — never skipped),
  then `building-a-video`, which opens with a short, scannable outline of how it goes.
- **They already said what they want** — *"make me a video about X"* — **still ask**, in one line
  that takes their request as given: *"Happy to make that. Before we start — would you like a quick
  tour of how this works, or go straight to the video?"* It costs them one word. Skipping it is how
  testers went a whole session without hearing what this can do.
- **They ask to see the example film** — *"show me what it made"*, *"play the example"* — go to
  `viewing-and-rendering` and show them the worked example. Give the limits in two lines when they
  turn to making their own.

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
5. **Do not announce the tour's structure.** No "there are eight things to cover", no "step 3 of
   8", no "welcome to LIVE". You do not yet know how many points you will use, and promising a
   number you then abandon is worse than saying nothing. *Making a video is the opposite:*
   `building-a-video` opens with an outline of its stages, because there the stages are fixed and
   knowing them is what lets someone answer at their own pace.
6. **Do not read this file aloud.** The wording here is the point being made, not a script to
   recite. Say it the way you talk.
7. **They can stop at any time, and that is a success** — not an abandoned onboarding.

## Working out how far to go

**On the tour, the default is the short route** — four points, one per message:

1. **What this is.**
2. **How you work it.**
3. **What it cannot do** — the limits in two lines.
4. **Go** — offer to make a video now, or to keep going.

**The full route** is every point below, in order, one at a time. Take it when they ask for more —
*"tell me more"*, *"how does it all work?"* — or when the signals under *Go longer* say so.

Then read what comes back and adjust. You are choosing the route as you go, not working down a
fixed list:

**Go shorter** when they chose the tour but arrived with a goal already — *"make me a video about
X"* — or when two replies in a row are one or two words with no question in them (*ok*, *got it*,
*sure*, *next*). Compress what is left to the essentials and move.

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

**Two lines on the short and fast routes; the five bullets on the full route or when asked.** The
two lines carry the first two limits — the shape, the floor — and end with an offer of the rest:

> Two things to know first: it's wide unless we choose upright before building starts, and about
> thirty seconds is the shortest it makes. There are a couple more limits if you'd like them.

If their message already runs into another limit — they mentioned footage, or a deadline in
minutes — say that one too, in a line of its own.

---

## The points

Cover these in this order on the full route; the short route takes *What this is*, *How you work
it* and *What it cannot do* (in two lines), then offers to go. Merge, drop or expand them as the
conversation tells you to — but never move the limits later than they sit here.

### What this is

A folder on their computer that makes videos out of code, and the thing they talk to is you. Two
directions it works in: **made from nothing** — a script, some pictures, and code that draws every
frame — and **made from footage** — video they shot or have the rights to, re-cut and re-timed
with text and graphics laid over it, with the agreement of anyone recognisable in it.

*Cue:* offer to say how they actually work it.

### How you work it

They describe what they want; you write the code, get the pictures made, time it and render it.
They never have to open a file or learn to code. **What they do is decide and react** — watch it,
say what is wrong, watch it again. That is the whole interface, and it is where most of their time
goes.

*Cue:* offer what making one actually looks like, start to finish.

### What making one actually looks like

You interview them first — what it is about, who it is for, how long, whether it has a voice,
whether it has music. Then the story in words, which they approve before anything is drawn; then
what it should look like and where the pictures come from; then one scene to judge, then the rest,
then they watch and say what is off, repeatedly, then it renders to a file.

**Every choice is theirs or yours out loud.** They can answer "you decide" to any question, and you
will say what you picked and why, so nothing about their video is decided where they cannot see it.

**Say the honest scale.** A short, simple film — text and shapes, one round of changes — is
roughly an hour from first message to finished file. The worked example in this folder, a film of
about a minute, took about a day and a half with two people, across seven working sessions,
through four different target lengths and one complete rejection of a finished cut. Going round
again is the normal shape of this work, not a sign it is going badly. Someone should be able to
tell whether they are starting an afternoon or a month. (The measurement behind the hour is dated
at the end of this file.)

*Cue:* offer the limits, and say they are worth hearing before starting rather than after.

### What it cannot do

**This point is mandatory on every route.** On the short and fast routes it is two lines — the
shape and the floor — with the rest offered (see *Working out how far to go*). On the full route,
or when they ask, all five, plainly, without apologising for them:

- **Wide by default — 1920×1080.** Upright for Reels, TikTok or Stories, or square, can be built
  — but it has to be chosen before building starts. Every layout is authored for its shape, so
  switching later means redoing the layout, and cropping a finished wide video ruins it.
- **About thirty seconds is the floor.** Under that there is not time to read it, or say it, and
  it stops being watchable. For five seconds, a still image is usually the better answer.
- **It draws; it does not film.** Text, diagrams, motion graphics, and still pictures moved around
  — not footage of real people or places, unless they bring the footage themselves: theirs to use,
  with the agreement of anyone recognisable in it (`working-with-footage`). A picture found
  online is their call: you say once that it belongs to someone, and they decide.
- **Rendering takes real minutes**, not seconds. The preview is instant; the finished file is not.
- **They are the judge, not you.** You will tell them if a file is broken, the wrong size or
  missing its sound. You will not tell them whether it is any good. That call is theirs, always.

*Cue:* ask whether that still works for them, and offer either the next point or going straight to
making something.

### It runs here, and it is free

The code, the preview, the music and the rendering all happen on this machine. Nothing is uploaded
in order to make a video. What it is built on — Node, Remotion, FFmpeg — costs nothing to use here.
Remotion has its own licence rather than an open-source one, and whether it costs anything depends
on who is using it. If they ask on behalf of a company or an institution, point them at
<https://www.remotion.dev/license> rather than answering for them — the terms are Remotion's and
they change. It comes up again at delivery: anyone publishing a film on behalf of an organisation
should have checked it, and `viewing-and-rendering` raises it there.

The exceptions are opt-in and named: a generated voice or generated images go out to a service and
may cost money. `ACCESS.md` lists which are connected and what each costs, and nothing is spent
without asking them first.

*Cue:* offer where things go when they hand something over.

### Where things live

Three places worth knowing — and they never have to move a file by hand. Naming where something is
is a complete instruction.

- **What they hand in** goes in the film's intake folder, `content/<project>/intake/` — photos,
  footage, recordings, notes, reference, in whatever state it arrives. A workbench, not a filing
  cabinet. Footage and recordings there stay on this machine; they are not shared with the rest of
  the folder's history.
- **Prepared copies the video actually uses** sit in `public/assets/<project>/`. You stage a copy
  there once it is cut out, named and sized — and only the ones a scene uses, because everything
  in `public/` is copied into every render.
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
content/<project>/intake/   material brought in, unprocessed — video and audio there are gitignored
content/<project>/docs/     brief, story, storyboard, script, style card, asset manifest
public/assets/<project>/    staged copies the code draws, via staticFile() — only what a scene uses
out/                        renders and frame stills — gitignored, reproducible
src/                        the React/TypeScript that draws every frame
scripts/                    setup check, narration, audio conditioning, footage probing and
                            re-timing, score, render checks and finishing
.agents/skills/             skills, loaded by agents
AGENTS.md                   rules for anyone working here — the entry point
CLAUDE.md                   a pointer to AGENTS.md
ACCESS.md                   authenticated services, free tiers, costs
package.json                dependencies; npm install reads this
```

### `src/Root.tsx` is the index

Every renderable thing is registered as a `<Composition>`, in its film's own `Registrations.tsx`,
and `src/Root.tsx` imports each film's file. Remotion Studio's sidebar *is* that list.
Unregistered means nonexistent as far as the tooling is concerned. The worked example's are in
`src/experiments/live-showcase/Registrations.tsx`:

```tsx
<Composition
  id="LiveShowcaseFilm"                  // the id to render by
  component={MasterFilm}                 // the component that draws it
  durationInFrames={LIVE_FILM_DURATION}  // imported from the scene table, never typed
  fps={FPS}
  width={WIDTH} height={HEIGHT}          // from the film's theme, named once
/>
```

**Organisation:** one top-level folder per film, leading with its delivery composition, scenes in a
`Scenes` subfolder beneath. The rule, from the file itself — *a top-level folder is a film someone
can be shown.* Scene compositions exist so one scene can be reviewed and re-rendered without
sitting through the whole film.

**Derive durations, never type them twice.** A master's duration is imported from its own scene
table, not written into `Root.tsx`. Typed separately, the two drift and the master cuts off its own
last frame.

**1920×1080 is the default, not a free number.** Every layout constant downstream — safe margins,
figure area, caption panel, diagram viewBox — is authored for the composition's shape. A 9:16
version is new layout work decided before the first scene, not a number changed at the end.

### Commands

```console
npm install                      # once, before anything
npm run dev                      # Remotion Studio, in the browser on localhost
npx remotion compositions        # list every renderable id
npx remotion still LiveShowcaseSceneFour out/s4-f090.png --frame=90 --scale=0.5
npx remotion render LiveShowcaseFilm out/live-showcase.mp4
npm run lint                     # eslint + tsc
node scripts/probe-footage.mjs content/<project>/intake/ --film-fps 30   # length, fps, shape, sound per clip
node scripts/build-audio.mjs --cues <cues.json> --src <dir> --out <dir>  # all three required
node scripts/check-render.mjs out/<file>.mp4 --composition <Id>          # measure a render
node scripts/finish-video.mjs out/<file>.mp4                             # delivery colour range and loudness
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

## Measurements

Dated as taken. Re-measure rather than quoting them as fixed.

- **2026-10-20**, shared machine with several agents rendering at once: a 28-second
  text-and-shapes film went from first message to finished file in about an hour, including the
  conversation, two renders and about 25 checking stills.
