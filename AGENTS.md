# LIVE

## STOP — first contact

**If this is the first thing you have been asked in this folder and it is any of these — a
greeting, "what is this", "what can this do", "where do I start", "help", a pasted link, or
anything you cannot confidently route to another skill — invoke the `onboarding` skill and
follow it. Before you answer. No exceptions, no summarising your way past it.**

**Do not answer out of this file.** You have just read a purpose statement, a routing table and a
worked-example spec, and that is enough to make you feel you can explain this workspace yourself.
You cannot. What you would write is a compressed version of this page delivered in one message,
and people do not read it — that has been tested with real newcomers, and it is the most common
way a first session here goes wrong. This file tells *you* where things are. `onboarding` is the
only thing here that knows how to introduce this to a *person*.

**Do not summarise `onboarding` either, and do not deliver it in one go.** It is a script
performed across several turns. It tells you how to pace it, how to read whether someone wants
the long route or the short one, and when to stop.

One thing it settles that nothing else does: **someone who has not been told the limits will ask
for a video this cannot make.** A colleague asked for a film and got a phone-shaped one, because
nothing had said the shape was fixed. That is an onboarding failure, not a build failure.

The rest of this file is for you, once you are past that and working.

## Purpose

A workspace for making short video in code — Remotion, React, TypeScript, generated stills,
optional narration, and controlled FFmpeg utilities — together with the practice for working in it
alongside an AI assistant.

The code is the smaller half. Anyone with a coding assistant can assemble a Remotion project; what
is written down here is how three people actually used one to make films, working in parallel, with
several assistants at once, over a shared repository. That is what the skills below carry.

## Where to start

**Every skill is addressed to an assistant.** What differs is what it does with it afterwards: some
it works from directly, some it draws on while building, some it consumes and then walks a person
through. None of them is a document to hand someone to read.

Each skill lives once, in `.agents/skills/<name>/`. A generated stub under `.claude/skills/` makes
it discoverable to assistants that auto-load skills; assistants that do not, route from this table.
Regenerate the stubs with `node scripts/sync-skills.mjs`.

| Skill | Reach for it when |
| --- | --- |
| **`onboarding`** | Someone has just arrived, asks what this is, or asks where to start |
| **`installing-the-toolchain`** | A fresh machine or clone; a command fails for a missing tool; the preview will not open |
| **`building-a-video`** | Someone wants a video made. **The spine** — it calls the rest in order |
| `choosing-a-visual-style` | The look is undecided, brand compliance is asked for, or images do not match each other |
| `asu-visual-style` | An ASU-branded video is wanted, or any colour, type, logo or caption decision. **Its accessibility file applies whichever style was chosen** |
| `creating-assets` | Scenes need pictures, or the ones generated came back wrong |
| `building-scenes` | Writing or changing scene code |
| `adding-narration` | The video needs a voice, or voice and picture have drifted |
| `viewing-and-rendering` | Watching, checking a frame, or rendering a file |
| `working-practice` | Throughout. Especially before setting durations, before calling work finished, and before writing anything down |
| `working-in-parallel` | More than one assistant or person will work on the same video |
| `collaborating-with-git` | Setting up a repository, sharing one, or undoing something |
| `remotion-best-practices` | Any Remotion API question. Vendored from upstream — see below |

Three of these are entry points: `onboarding`, `installing-the-toolchain` and `building-a-video`.
The rest are reached from inside a job, not chosen from a list.

**Each skill states what it needs before it starts and which skill follows it.** Follow those rather
than this table once you are inside one — the table is an index, and the skills are the graph.

## The worked example

A 70-second silent paper-collage film whose subject is this repository. It is what the skills were
written from, and it is registered as `LiveShowcaseFilm`.

| | |
| --- | --- |
| Frame rate | 30 |
| Resolution | 1920x1080, 16:9 |
| Audio | None. Text carries all meaning |
| Safe margin | 140px |

Its length is not recorded here — `npx remotion compositions` reports it. **A duration copied into a
document is a duration nobody re-checks**, and the documents for this film carried three wrong ones
before the numbers came out of the prose entirely.

`content/live-showcase/docs/README.md` says which of its four documents answers what. Two other
films were made in this repository and were removed, so that what ships is one film and the tools
and practice that made it.

**Do not cut a shot to hit a frame number.** Trim only what is dead on screen.

## Access registry

`ACCESS.md` records what this project can reach outside itself, the key it needs, and what it costs.
Read it before assuming a capability is missing or setting one up from scratch, and treat its
pricing and limits as claims to re-check — provider terms age faster than anything else here.

## Artifacts and temporary files

- **Every temporary file, scratch script or intermediate output goes inside this repository**, not
  in a system temp directory or an agent scratchpad. Whoever is working here needs to see what was
  made without opening another window.
- **Do not create documents, reports, summaries or published pages unless asked.** Report in the
  reply. Write a file only when a file is asked for.

## Remotion guidance

Before modifying Remotion code, read `.agents/skills/remotion-best-practices/SKILL.md` and follow
the relevant linked guidance.

**It is a vendored copy, and Remotion moves.** `skills-lock.json` records where it came from —
`remotion-dev/skills`, at `skills/remotion-best-practices/SKILL.md` — and the content hash of the
copy here. That copy was current on the day it was taken and is not updated by anything in this
repository.

So on first use in a fresh clone, check it against the source before trusting it on anything
version-sensitive: an API name, a package version, a recommended pattern. Fetch the upstream file,
diff it against the local one, and say what differs rather than assuming either side is right. If
upstream has moved, prefer upstream and say the local copy is behind.

This is a read-and-compare step, not an update step. Replacing the vendored copy changes what every
future session reads, so propose it rather than doing it.

## Development rules

- Use TypeScript.
- Keep components small and reusable.
- Use Remotion APIs for animation, sequencing, timing, and composition.
- Derive animation from `useCurrentFrame()`.
- Do not use CSS transitions or browser-timed animations.
- Store static media in `public/assets`.
- Reference static media with `staticFile()`.
- Prefer deterministic animation over generated video.
- Do not add TailwindCSS.
- Do not add dependencies without explaining the need.
- Do not restructure the project without explaining why.
- Run type checking after meaningful code changes.

## Writing a skill here

Every file in `.agents/skills/` follows the same contract, so that a file read on its own still
works.

- **Frontmatter is two fields**, `name` and `description`, per the Agent Skills spec. The name is
  lowercase letters, numbers and hyphens, matches its folder, and cannot contain `claude` or
  `anthropic`. The description is third person, at most 1024 characters, and says both what the
  skill does and **when to reach for it, in the words someone would actually say** — not in ours.
- **The body opens with four lines**: *Use this when*, *You need first*, *This produces*, *Then go
  to*. The last two are what make the set a graph rather than a pile.
- **Keep `SKILL.md` under 500 lines.** Past that, split into reference files beside it.
- **Reference files stay one level deep from `SKILL.md`.** An assistant following a pointer out of a
  pointer reads part of the file and acts on half the information.
- **A reference file over 100 lines opens with a table of contents**, for the same reason.
- **Every section stands alone.** No "as described above" across files — under progressive
  disclosure a file is often read by itself.
- **Nothing time-bound in the body.** Versions, prices, model names and provider terms go in one
  dated block at the end.
- **Measurements go at the bottom, dated, as they are taken.** Not into the opening as though they
  had been known in advance.

`node scripts/sync-skills.mjs` checks the mechanical half of this and regenerates the stubs. It
fails on anything the spec forbids and warns on the rest.

## Human review and Git rules

- Treat all agent-created or agent-modified work as a draft for human review.
- Never stage, commit, amend, tag, push, or otherwise publish changes unless the user explicitly
  requests that Git action in the current instruction.
- A request to create, edit, review, summarize, or compact work does not imply permission to commit
  it.
- Leave changes uncommitted and report them for review unless explicitly told otherwise.

## You do not own this process

- Work here runs across many sessions, and an assistant starts each one knowing nothing about the
  last. You are working on one compartment of something that began before you and continues after.
- Read `content/live-showcase/docs/README.md` and the most recent entries in `agent-logs/`, if there
  are any, before acting. Do not assume context you were not handed.
- Do the milestone in front of you. Do not run past it into the next one because it seems obvious or
  cheap.
- **Do not start a scene, a render or a refactor that was not asked for.** Scope is set in the
  instruction at hand; assumptions stated in one turn are context, not a green light.
- Do not redesign the plan, renumber milestones, compact or expand documents, or restructure the
  project to suit your session. Propose changes; the person you are working with decides.
- **They are the approval authority on anything that reaches human eyes or ears. Never declare your
  own visual or audio output successful.** You may report technical defects — corrupt files, wrong
  resolution, dropped frames, clipped audio, watermarks — but not that something looks good or bad.

## Stale documents

Documents drift from the repository. Treat every document here, **including this one**, as a claim
to verify rather than a fact.

- Before acting on what a document says about the code, check it. Composition IDs, file paths, frame
  rates, folder names, dependencies, and target durations are the usual offenders.
- Where a document and the repository disagree, the repository is the truth about what exists. That
  does not mean the document is the thing to change — the code may be what is wrong. Report the
  contradiction and let the person decide which one is corrected.
- Never propagate a stale claim forward into new work, a plan, a prompt, or a log entry. A wrong
  fact repeated by an assistant becomes much harder to catch.
- Record every staleness you find in your `agent-logs/` entry, fixed or not. Drift that one session
  notices and does not write down is drift the next three each rediscover.
- Date anything that ages: service terms, free-tier limits, pricing, model names, regional
  availability.
- Do not rewrite a document to match reality without saying so plainly in your report. Silent
  reconciliation destroys the evidence that something was wrong.

## Agent log

An agent log is a concise session summary and handoff, not a running activity transcript. It is how
the next session learns where the work stands. `agent-logs/README.md` says why, and
`agent-logs/TEMPLATE.md` is the shape.

- One file per session, named `NNN-YYYY-MM-DD-<assistant>.md`, numbered in order. **Check the number
  is free before you use it** — two sessions once collided on one.
- Do not create or update a log for every tool call, discrete action, or ordinary user turn.
- Write or update it when a summary, status or handoff is asked for, and once more before the
  session ends. Until then, leave the active log unchanged.
- Record who you are, what you worked on, the directions you were given in the giver's own words,
  what actually became of it, what you left uncommitted, and where the next session picks up.
- Report honestly, including what failed, what you got wrong, and what you did not finish.
- Read the last two or three entries before you start, if there are any.

## Cost rules

- Free tools first. The goal is to complete a film here at zero cost.
- Check `ACCESS.md` for currently authenticated integrations, their free-tier balances, and
  per-call cost before proposing a paid step. Check `agent-logs/` for what previous sessions
  already spent — a budget does not reset when the assistant changes.
- Propose the single blocking modality, the exact paid feature, the number of attempts, and the
  total cost. Purchase only after that specific proposal is approved in that instruction.
- Do not call paid image, video, audio, or cloud APIs.
- Do not submit generations or incur charges without explicit approval.
- No subscriptions, auto-renewing trials, auto-refills, or stored payment methods.
- Local rendering and free local tools are allowed.

## FFmpeg rules

- Use Remotion as the primary visual editing system.
- Use FFmpeg for encoding, inspection, audio processing, concatenation, and conversion.
- **A full system FFmpeg is required.** Remotion bundles one, reachable as `npx remotion ffmpeg`,
  but it is trimmed for rendering: `setpts`, `minterpolate`, `silenceremove` and `afade` are
  compiled out, and scripts in `scripts/` depend on all four. `which ffmpeg` is also the wrong test
  for the bundled copy, which is deliberately not on PATH.
- Prefer a checked-in script in `scripts/` over an improvised shell command, so the next person
  runs the same thing you ran.
- Pass FFmpeg arguments as arrays rather than constructing shell command strings.
- Validate input files and print the command before execution.
