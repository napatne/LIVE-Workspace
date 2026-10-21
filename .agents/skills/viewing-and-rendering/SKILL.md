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

The person does not have to type any of this. Run the renders, stills and checks yourself, and tell
them the path each file landed at. **The live preview is the one thing to offer rather than start**:
it is a server left running in a terminal, it holds memory for as long as it is open, and a
half-scale render often answers the same question. The steps below are the same things done by
hand, and are worth describing once so they can recognise it when something has not worked.

## Watching

Two ways, and the person chooses. Say what each costs.

**A quick render, no server.** Nothing is left running, and it works on a shared or headless
machine:

```console
npx remotion render <Name> out/<name>-look.mp4 --scale=0.5
```

Half the width and height, so it renders faster than a full one. Tell them the path and let them
open it in any player. For one scene, render that scene's own composition.

**The live preview**, if they want it:

```console
npm install     # once, ever
npm run dev     # opens a browser tab
```

Leave the terminal open — closing it closes the preview. Stop it when they are done with it.

In the tab, the left-hand list holds one folder per video, with the video inside it. **If the list
looks empty, the folders are closed** — the arrow beside a folder opens it. The name matters
exactly: no spaces, capitals preserved, and it is what a render command needs.

**Every scene is registered on its own, inside a `Scenes` folder.** Playing one scene by itself is
the most useful thing here. Giving notes means watching the same twenty seconds repeatedly, and
that beats scrubbing for it inside the whole film each time.

The preview reloads itself whenever the code changes. There is nothing to press.

**On 8 GB of memory**, prefer the half-scale render to the preview, and never run the preview and a
full render at once.

## Rendering

If the preview is running, render from a second terminal so it keeps running.

```console
npx remotion compositions                                         # every video and its real length
npx remotion render <Name> out/my-video.mp4 --color-space=bt709    # save it
npx remotion still <Name> out/check.png --frame=180                # one moment, as a picture
```

The flags that matter:

| Flag | When |
| --- | --- |
| `--color-space=bt709` | Every HD render (1280×720 and up). Without it the file carries the older standard-definition colour matrix, and some players shift the colours |
| `--scale=0.5` | A quick look, on a render or a still. Not for delivery |
| `--muted` | **Only when the film has no audio at all** — no voice, no music, no effects. It drops the audio track |
| `--concurrency=1` | A small machine; see *Long renders and small machines* |
| `--timeout=120000` | A busy machine; see *Long renders and small machines* |

**A film with no audio still gets an audio track unless it is rendered `--muted`** — a silent AAC
track, the whole length of the film. That is expected and harmless. `check-render.mjs` reports it as
present and silent; say so, so nobody reads "audio present" as sound. Never add `--muted` to a film
with a score or effects: it deletes them.

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
anything is re-timed. Delete them rather than trusting them. **And every scene has two frame
numbers**: its own, counted from the start of its composition, and the film's, counted from the
start of the whole film. Ask for and quote a still by composition and that composition's own frame
— *`LiveShowcaseSceneFour` f300* — not by the film's frame, which moves every time an earlier scene
changes length.

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
composition's own length, frame count, colour range, the video and audio stream lengths, whether
the audio is silent, integrated loudness, loudness range (ebur128 LRA) and true peak, stretches of
black, stretches of frozen picture, and stretches of silence.

It writes a **contact sheet**: at most 36 small frames spread evenly across the whole film, in a
grid — one a second for a film under 36 seconds, further apart for anything longer. It goes beside
the video unless `--sheet-dir <dir>` says otherwise. **Keep sheets out of any folder that is handed
to people** — send them to `out/<project>-review/`, beside the hand-out folder, not inside it.

**Read its output as a list of facts, not a verdict.** It never says a file is good, and neither do
you. Three of its facts need a sentence of context before you pass them on:

- **"Frozen" means the picture changed by less than a threshold for two seconds or more.** That may
  be a held title or a reading beat on purpose. It may also be real motion that is small or thin —
  a line drawing on, a few lights switching on in one corner — which falls under the threshold. So
  check a frozen stretch against what the code animates before calling it a freeze. To confirm a
  shorter beat, such as a hold you have just re-timed by a second, lower the minimum:
  `--freeze-min 0.5`.
- **An audio track that ends before the picture is flagged**, and the gap counts as silence. Remotion
  mixes each audio element only for the frames it plays, so the track ends at the last frame any
  sound is placed — a film whose last line of narration ends early has a soundless tail, not a quiet
  one. To make the track run the film's full length, place one audio file that does: a score already
  does, from frame 0; otherwise a silent WAV of the film's length, placed with `<Audio>` at frame 0.
  Re-run the check; the two stream lengths should then agree.
- **A length that disagrees with `--composition`** is either a fault in the render or a sign that
  the code changed since this render was made. Check which before reporting a fault: an old render
  measured against new code always disagrees.

Run it on every render that is going to a person, and say what it found in plain words: *"It's 71
seconds, the right size, no black gaps; the music sits at the usual web loudness. There's a
three-second still at the end — that's the closing card."*

## Finishing a file for delivery

**First ask where it will be played** — a website, a social feed, a room, a broadcaster. The answer
picks the size and the level, and it is cheaper to ask than to re-deliver.

```console
node scripts/finish-video.mjs out/my-video.mp4 out/my-video-final.mp4
node scripts/finish-video.mjs out/my-video.mp4 out/my-video-web.mp4 --web   # smaller file
```

What a render does not do on its own, all of it noticed only on someone else's screen:

- **Colour range.** A render made from JPEG frames comes out tagged full-range (`yuvj420p`),
  whatever `--pixel-format` says, and some players then show it washed out or crushed. Setting the
  pixel format on the render does not fix it — a session here claimed it would, and it does not.
  The script converts the picture to standard TV range.
- **Colour matrix.** HD should be BT.709. Render with `--color-space=bt709`; the finishing script
  warns when an HD file arrives tagged `bt470bg` (the standard-definition matrix), and does not
  convert it silently. If it warns, re-render with the flag rather than shipping it.
- **Loudness.** Every delivered film goes out at one level: **−14 LUFS integrated**, true peak
  held near −2 dBTP — the common level for web video, so it plays neither quieter nor louder than
  what is around it. It gets there with one fixed gain and a limiter, so ducks and quiet passages
  keep their depth; `--loudnorm` uses FFmpeg's loudnorm instead, for a film that sounds wrong
  limited. The script says when the limiter is working hard. Two films from one workspace once went out 10 dB apart because only one went
  through a finishing step. Both numbers are constants in `scripts/lib/delivery.mjs`, which the
  finishing script applies and `check-render.mjs` measures against, so the two cannot disagree. If
  a film sounds too loud or too quiet, the person says so and the constant changes, not the mix.
- **Size, with `--web`.** A smaller file for web playback — a video that autoplays on a website, or
  anywhere the size of the download matters. It always re-encodes, at lower quality than the
  default. Use the default for an upload a platform will re-encode anyway.

It measures twice and applies once, so dynamics are left alone, and it checks the file it wrote
rather than trusting the settings. A silent film passes through with only the colour fixed.

### Other destinations

| Where it plays | Level | What else |
| --- | --- | --- |
| A website, a social platform | The default, −14 LUFS | `--web` if it autoplays on a page or size matters; the default for an upload a platform re-encodes |
| A room — a lecture hall, a projector, a screen at an event | No standard applies. Deliver at the default and **set the level in the room**, on its own system, before the audience arrives | Ask the screen's resolution and what plays the file. Play the whole film there once |
| Broadcast | **The broadcaster's delivery spec**, which overrides everything here. Reference figures are in *Versions and measurements* | The constant sets every film's level, so propose a one-off level to the person rather than editing it |

### Before it goes anywhere public

Ask, and write the answers into the brief, before a file is uploaded, sent outside the team or
published:

- **Third-party marks** — logos, brand names, product screens — anywhere in the picture.
- **Characters** someone else owns, and pictures someone else made.
- **People who can be identified**, and whether each agreed.
- **Music and sound**: whose it is, whether its licence allows this use, and whether it needs a
  credit.
- **The Remotion licence**, if they publish on behalf of a company or an institution. Point them at
  <https://www.remotion.dev/license> rather than answering for them — the terms are Remotion's.

These are theirs to clear. Your part is to name what is on screen, so nothing reaches the public
unnoticed.

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
- **On a busy machine** — other renders running, other assistants working — a render or a still can
  fail before it starts with *"Timed out after 30000ms while setting up the headless browser"*. Run
  it again with `--timeout=120000`. Nothing in the film is wrong.

How long a render takes depends on the machine and on what else it is doing. The figures measured
here are at the end of this file; plan from them, and say they are one machine's.

## What to report, and what not to

Report technical defects: a corrupt file, the wrong resolution, dropped frames, clipped audio, a
watermark, a length that disagrees with the composition — everything `check-render.mjs` measures.
**Do not report that a render looks or sounds good.** That judgement belongs to the person watching
it — see `working-practice`.

## Versions and measurements

*Flags checked 2026-10-21 against the installed Remotion 4.0.506.* `--color-space` accepts
`default`, `bt601`, `bt709` and `bt2020-ncl`; `default` is BT.601 in this version, and Remotion says
BT.709 becomes the default in 5.0. `--muted`, `--scale` and `--timeout` exist with the meanings
above. With no audio element at all, Remotion writes a silent track. Audio from `@remotion/media`
elements is mixed only for the frames each one plays, and is not padded to the film's end.

*Render times, 2026-10-20, one shared Windows machine (Intel Core Ultra 7 155U) with eight agents
rendering at once.* Expect faster on a machine doing nothing else.

| Job | Time |
| --- | --- |
| Full render, the worked example (70 s at that date), 1920×1080, `--concurrency=2` | 8 m 20 s |
| Full render, 30 s at 1080×1920, `--concurrency=2` | about 2 min |
| One still at `--scale=0.5` | 30–40 s, mostly bundling |
| `finish-video.mjs` | under 30 s |
| `retime-plate.mjs` `smooth` at 1080p, 2 s of source | about 10 min |

*Loudness references, checked 2026-10-21.* Web: −14 LUFS is common practice, not a published
standard; platforms do not all publish the level they normalise to. Broadcast, Europe: EBU R 128
(version 5.0, November 2023, tech.ebu.ch/publications/r128) sets −23 LUFS. Broadcast, North
America: ATSC A/85, −24 LKFS ±2 dB with true peak at −2 dBTP, taken from secondary sources; a
revision was reported in July 2026, so read the current text before using either figure. A room:
no loudness standard applies.
