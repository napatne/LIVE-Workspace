---
name: viewing-and-rendering
description: Opens the preview, plays a composition, captures a single frame, and renders a finished file. Use when someone asks to watch, play, see, check, export or render a video, when the preview list looks empty or wrong, or when a render needs verifying before it goes anywhere.
---

# Viewing and rendering

**Use this when** something exists and needs looking at, or is finished and needs to become a file.

**You need first** a registered composition and an installed project.

**This produces** a video file in `out/`, or a frame checked on screen.

**Then go to** `building-a-video` if watching turned up changes. Otherwise this is the last step.

---

## Do it for them, and say where the result went

The person does not have to type any of this. Run it, tell them when the preview is open, and tell
them the path the finished file landed at. The steps below are the same thing done by hand, and are
worth describing once so they can recognise it when something has not worked.

## Watching

```console
npm install     # once, ever
npm run dev     # opens a browser tab
```

Leave the terminal open — closing it closes the preview.

In the tab, the left-hand list holds one folder per video, with the video inside it. **If the list
looks empty, the folders are closed** — the arrow beside a folder opens it. The name matters
exactly: no spaces, capitals preserved, and it is what a render command needs.

**Every scene is registered on its own, inside a `Scenes` folder.** Playing one scene by itself is
the most useful thing here. Giving notes means watching the same twenty seconds repeatedly, and
that beats scrubbing for it inside the whole film each time.

The preview reloads itself whenever the code changes. There is nothing to press.

## Rendering

Open a second terminal so the preview keeps running.

```console
npx remotion compositions                          # every video and its real length
npx remotion render <Name> out/my-video.mp4        # save it
npx remotion still <Name> out/check.png --frame=180 # one moment, as a picture
```

`out/` is not tracked in version control, because video files are large and are rebuilt from the
code whenever they are needed. A freshly cloned project has an empty `out/` and nothing is missing.

**That also means a finished film exists only on the machine that rendered it.** It has already
happened here that an approved final file was later nowhere to be found. Decide where a delivered
video actually lives, off this folder.

## Five things worth knowing

**Name files so a version can be returned to.** `my-video-v2-faster-opening.mp4`, not `final.mp4`.
Naming a file after what changed in it is what makes going back possible.

**Where the exported file and the preview disagree, the exported file is the truth.** It is what
people will watch.

**A still cannot tell you whether a movement works.** It shows what is on screen, never how it
moves. Only playing it answers that.

**Stills go stale silently.** A picture captured at frame 180 stops matching the film the moment
anything is re-timed. Delete them rather than trusting them.

**Every render leaves about 61MB in the system temp directory, whether it succeeds or not** —
measured 2026-09-22. Nothing cleans it up, and it is outside the project, so it does not show
in `git status` and nobody notices until a disk fills. A long session of re-renders is
gigabytes. Clear the temp directory occasionally, and do not interpret a full disk mid-session
as a Remotion fault.

## What to report, and what not to

Report technical defects: a corrupt file, the wrong resolution, dropped frames, clipped audio, a
watermark, a length that disagrees with the composition. **Do not report that a render looks good.**
That judgement belongs to the person watching it — see `working-practice`.
