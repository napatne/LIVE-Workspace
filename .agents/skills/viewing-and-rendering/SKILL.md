---
name: viewing-and-rendering
description: Opens the preview, plays a composition, captures a single frame, renders a finished file, measures it, and finishes it for delivery. Use when someone asks to watch, play, see, check, export or render a video, when a render needs verifying before it goes anywhere, when a video looks washed out or plays too quietly elsewhere, when a render is slow or the machine is short of memory, or when the preview list looks empty or wrong.
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

## Measure it before anyone watches it

```console
node scripts/check-render.mjs out/my-video.mp4 --composition MyVideo
```

It reports what can be measured, and nothing else: resolution, frame rate, length against the
composition's own length, frame count, colour range, whether there is an audio track and whether it
is silent, integrated loudness and true peak, stretches of black, stretches of frozen picture, and
stretches of silence. It writes a contact sheet — one small frame per second or so, in a grid —
beside the video, so a person can see the whole film at a glance.

**Read its output as a list of facts, not a verdict.** A frozen stretch may be a held title on
purpose; a silent one may be the dramatic pause. It finds them so you can say they are there, and
so nobody is surprised. It never says a file is good, and neither do you.

Run it on every render that is going to a person, and say what it found in plain words: *"It's 71
seconds, the right size, no black gaps; the music sits at the usual web loudness. There's a
three-second still at the end — that's the closing card."*

## Finishing a file for delivery

```console
node scripts/finish-video.mjs out/my-video.mp4 out/my-video-final.mp4
```

Two things a render does not do on its own, and both are only noticed on someone else's screen:

- **Colour range.** A render made from JPEG frames comes out tagged full-range (`yuvj420p`),
  whatever `--pixel-format` says, and some players then show it washed out or crushed. Setting the
  pixel format on the render does not fix it — a session here claimed it would, and it does not.
  The script converts the picture to standard TV range.
- **Loudness.** Every delivered film goes out at one level: **−14 LUFS integrated**, true peak
  held near −2 dBTP — the common level for web video, so it plays neither quieter nor louder than
  what is around it. Two films from one workspace once went out 10 dB apart because only one went
  through a finishing step. The level is one constant in the script; if a film sounds too loud or
  too quiet, the person says so and that constant changes, not the mix.

It measures twice and applies once, so dynamics are left alone, and it checks the file it wrote
rather than trusting the settings. A silent film passes through with only the colour fixed.

## Long renders and small machines

- **Anything that may run over ten minutes runs detached** — in the background, with its output
  written to a log file in `out/`, checked by reading the log. Some assistant tools stop a command
  at ten minutes, which kills the render and leaves its browser running.
- **After any render that was stopped or crashed, check for an orphaned headless Chrome** and stop
  it. One ran unnoticed for about six days on an 8 GB laptop.
  - Windows: `Get-Process | Where-Object { $_.Path -like '*remotion*' }`
  - macOS or Linux: `ps aux | grep -i chrome-headless-shell`
- **On 8 GB of memory**, stop the preview first and render with one worker:
  `npx remotion render <Name> out/x.mp4 --concurrency=1`. Full films took about an hour this way on
  one machine, which is slow and finishes. Remotion refuses a media cache below its minimum, so
  leave `--offthreadvideo-cache-size-in-bytes` alone unless an error names it.

## What to report, and what not to

Report technical defects: a corrupt file, the wrong resolution, dropped frames, clipped audio, a
watermark, a length that disagrees with the composition — everything `check-render.mjs` measures.
**Do not report that a render looks or sounds good.** That judgement belongs to the person watching
it — see `working-practice`.
