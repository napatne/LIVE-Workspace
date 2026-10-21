---
name: working-with-footage
description: Builds a film from video someone shot or was given - taking the clips in, probing each one's length, frame rate, shape and sound, asking about rights and the people on screen, choosing moments, staging trimmed copies, placing them in Remotion, slowing a moment down, laying titles and name bars over them, and mixing the clips' own sound. Use when someone says "I have some clips", "make a highlight video from my footage", "use this video I shot", "slow this bit down", "add name bars or titles over my video", "can I use a TikTok clip", or hands over any video file to build from.
---

# Working with footage

**Use this when** the film is made from video the person brings — a highlight reel, an event recap,
a talk with titles over it — or when one clip is wanted inside a film that is otherwise drawn.

**You need first** the clips, and the film's purpose and story agreed through `building-a-video`. A
film made from footage still has a story; here it is told by choosing moments rather than by
drawing them.

**This produces** clips probed and recorded in the brief, rights and consent asked and written
down, trimmed copies staged under `public/assets/<project>/footage/`, scenes that play them with
text and sound over them, and a render ready to check.

**Then go to** `building-scenes` to build the scenes around the clips, then `viewing-and-rendering`
to render, measure and finish.

---

## Intake

**Raw material goes in `content/<project>/intake/`**, as it came off the phone or camera. Do not
rename, re-encode or trim the originals; everything later is made from copies.

**Video and audio in `intake/` are git-ignored**, and so is everything under
`public/assets/<project>/footage/`. Two reasons, rights first:

- **Rights.** A clip belongs to whoever shot it, and the people in it have a say in where it goes. A
  repository copies whatever it holds to everyone who clones it, for ever.
- **Size.** A minute of phone video is hundreds of megabytes, and Git keeps every version.

So the repository carries the code and the brief; the person keeps the footage. Say so when the film
starts: a second machine gets the clips from them, not from Git (`collaborating-with-git`).

## Probe each clip

```bash
node scripts/probe-footage.mjs content/<project>/intake --film-fps 30
```

It takes one file or a folder, and reports for each clip its length, its frame rate — **flagging a
variable frame rate**, which phones often record — its size and shape, whether it has audio, and
whether its rate matches the film's.

**The film's frame rate follows the footage, or is chosen and the clips conformed to it.** If every
clip is 30 fps, the film is 30. If they differ, pick the film's rate — usually the one most clips
share — and record it in the brief. Mixed rates still play: `<Video>` plays a clip by time, so a 60
fps clip in a 30 fps film shows every other frame, and a 24 fps clip in a 30 fps film repeats some
frames, which can judder on a slow pan. **Every number in the film's code is counted in the film's
frames**, whatever the clip's own rate.

**A variable-rate clip is conformed to a constant rate when it is staged** (see *Staging*).

**Shape follows the footage too.** Upright phone clips make an upright film, or sit inside a wide
frame designed around them; cropping an upright clip to fill a wide frame throws most of it away.
Shape is decided before building starts — `building-scenes/reference/upright.md` covers upright and
square. Record it in the brief.

## Rights and consent — asked, and written in the brief

Ask for every clip, before it is used, and write each answer into `content/<project>/docs/brief.md`:

- **Their own footage** — they shot it — is fine.
- **Someone else's clip** — a TikTok, a Reel, a YouTube video — **is their call.** Say once that
  it belongs to whoever made it (asking the creator for the original file is the clean way), then
  do what they decide and record it as *theirs* (`AGENTS.md` → *Rights are the person's call*).
  **They bring the file**: nothing here downloads, rips or screen-records from a platform —
  TikTok, Instagram, X and YouTube gate that anyway.
- **People who can be identified, or who are named on screen** — a name bar, a caption that says
  who they are: ask whether each agreed, and note the answer in the brief. For a child, the
  question is whether a parent or guardian did.
- **Music inside a clip belongs to someone.** A song playing at an event, a track under someone's
  post. Flag it once — platforms detect copyrighted songs and can mute the video — and let them
  choose: keep it, mute that stretch, pick a moment without it, or let the score carry it.

These are their answers, marked *theirs*. A clip with no answer is not staged.

## Choosing the moments

Watch each clip with the person, or have them name the moments, and **write the timecodes into the
brief** — clip, in point, out point, and what happens there:

```text
| Shot | Clip         | In      | Out     | What                        |
| 1    | IMG_4471.MOV | 0:03.2  | 0:09.0  | Doors open, first arrivals  |
| 2    | IMG_4480.MOV | 0:11.5  | 0:15.0  | The jump — slowed           |
```

The brief is then the source of truth for the cut. A changed moment is an edit there first, then in
the code. The length of each shot comes from these timecodes, measured — not typed as a target and
trimmed to fit.

## Staging

**Copy only the trimmed stretch each scene uses into `public/assets/<project>/footage/`.** Everything
in `public/` is copied into every render bundle, so a whole folder of originals there makes every
preview and render slow to start.

Cut each stretch with a little spare at both ends — half a second is plenty — so the trims in code
can move without re-staging. Stage with the full system FFmpeg, arguments as an array, input
checked and the command printed (`AGENTS.md` → *FFmpeg rules*). In one pass, this trims, conforms
the frame rate, and writes H.264 MP4, which every part of the toolchain plays:

```js
// content/<project>/tools/stage-clip.mjs — inside the project, not a temp folder.
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

const [input, output, from, to, fps] = process.argv.slice(2); // seconds, seconds, film fps
if (!input || !output || !from || !to || !fps || !existsSync(input)) {
  console.error("usage: node stage-clip.mjs <in> <out.mp4> <from-s> <to-s> <fps>");
  process.exit(1);
}
mkdirSync(dirname(output), { recursive: true });
const args = [
  "-v", "error", "-y",
  "-ss", from, "-to", to, "-i", input,
  "-vf", `fps=${fps}`,
  "-c:v", "libx264", "-crf", "17", "-pix_fmt", "yuv420p",
  "-c:a", "aac", "-b:a", "192k",
  "-movflags", "+faststart",
  output,
];
console.log(`$ ffmpeg ${args.join(" ")}`);
const r = spawnSync("ffmpeg", args, { encoding: "utf8" });
if (r.status !== 0) { console.error(r.stderr); process.exit(1); }
```

Probe the staged copy again; it should now report a constant rate matching the film's.

## Placing clips

Use `<Video>` from `@remotion/media`. `trimBefore` and `trimAfter` are **frames of the film's
timeline, not seconds** — to skip the first two seconds of a clip in a 30 fps film, `trimBefore` is
`2 * fps`, which is 60, whatever the clip's own frame rate. Read from the installed `@remotion/media`
source, which divides both by the composition's fps, and confirmed by a render.

**The vendored `remotion-markup/embedding-videos.md` says "Values are in seconds". It is wrong** —
its own example passes `2 * fps`. Taken literally, a trim of 0.5 does nothing visible. The vendored
copy is not edited here; trust the example, not the sentence.

```tsx
import { Video } from "@remotion/media";
import { AbsoluteFill, staticFile, useVideoConfig } from "remotion";

export const ShotArrivals: React.FC = () => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill>
      <Video
        src={staticFile("assets/<project>/footage/arrivals.mp4")}
        trimBefore={Math.round(0.5 * fps)}   // the half-second of spare staged in front
        trimAfter={Math.round(6.3 * fps)}
        objectFit="cover"
        muted
      />
    </AbsoluteFill>
  );
};
```

Each shot's length is `trimAfter - trimBefore`, derived from the trims, never typed separately.
Wrap a shot in a `<Sequence>` to place it; where its lengths live follows `building-scenes`.

**The vendored `video-editing.md` says not to compute `from`, `durationInFrames` or `trimBefore`.**
Here they are derived — workspace rules win (`AGENTS.md` → *Remotion guidance*).

## Slowing a moment down

`scripts/retime-plate.mjs` slows or speeds sections of one clip in a single pass. Read its header for
the exact syntax before running it. In outline, each section is `start:end:factor`, with an optional
`:smooth`, in the **clip's own frames**, and `--film-fps` gives the film's rate:

```bash
node scripts/retime-plate.mjs public/assets/<project>/footage/jump.mp4 public/assets/<project>/footage/jump-slow.mp4 0:210:1 210:330:4:smooth 330:480:1 --film-fps 30
```

- **It drops the clip's sound.** The output is silent, and the script warns when the input had
  audio. Slowed sound is not made here; if the moment's sound matters, keep it from an unslowed
  stretch, or let the score carry it, and tell the person which.
- **It prints the frame mapping in clip frames and in film frames.** Place every beat — a title
  landing, a cut — from the film-frame column.
- **`smooth` interpolates new frames and is slow** — minutes per second of 1080p source. **Tell the
  person how long before starting it.** Without `smooth`, each frame is repeated, which is quick but
  stutters at large factors.
- **It can come out a few frames short.** The script measures the frame count it actually wrote and
  builds the printed mapping from that count. **Set the shot's length from the measured count**,
  converted to film frames and rounded down — never from the predicted one, which runs past the end
  of the plate.

## Text over footage

**Every title, name bar, label and caption sits on its own opaque panel.** Contrast against moving
video cannot be computed — the frame behind the words changes — so the panel is what the words are
checked against. Bare text over footage is unreadable the moment something bright passes behind
it, and **a shadow or an outline is not a substitute for the panel**
(`asu-visual-style/accessibility.md` → *Text over footage or photographs*).

**Check the brand colours against the text before using them.** White on a mid-tone brand colour
often fails: white on a teal like `#1BA9A6` measured 2.89:1, under the 3:1 minimum even for large
text. Dark text on the same colour may pass where white fails. Measure every pairing with the
method in `asu-visual-style/accessibility.md` → *Check contrast yourself*, whichever style the film uses, and keep name bars
large enough to read on a phone.

Text over footage is drawn in the scene, frame by frame, like any other Remotion text — never burned
into the staged clip.

## Flashing

**Supplied clips are checked for flashing too**, not only what is animated here. Nothing should
flash more than three times a second, and that rule covers supplied clips
(`asu-visual-style/accessibility.md` → *Motion and flashing*). Strobe lights, camera
flashes at an event, a club's lighting rig, busy high-contrast patterns — watch for them while
choosing moments. If a stretch flashes, cut around it or leave it out, and tell the person why.

## The clips' own sound

For a film made from footage, **the clips' own sound is the first music question**: offer it before
an original score. Record what they choose in the brief.

- **Set each clip's level with `volume`** on its `<Video>`; `muted` on any clip whose sound is not
  wanted.
- **Fade the sound at every cut** with a `volume` callback. Remotion evaluates volume in blocks of
  about 83 ms, so use at least 12 frames in and 15 out at 30 fps — `adding-narration` →
  `reference/splitting.md` → *Fades* has the measurement and the code.
- **Lower it under a title** that has to be read, and under any narration, then bring it back.
- **If only an early shot has sound, the audio track ends early.** Remotion ends the audio stream at
  the last sound, so the file's sound is shorter than its picture. `check-render.mjs` reports both
  lengths and lists the gap as a silent tail. Pad the audio to the picture's length before
  finishing — for example FFmpeg with `-c:v copy -af apad=whole_dur=<picture seconds>`, arguments as
  an array.

```tsx
volume={(f) =>
  interpolate(f, [0, 12, titleIn, titleIn + 12, titleOut, titleOut + 12, shotFrames - 15, shotFrames - 1],
    [0, 1, 1, 0.3, 0.3, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
}
```

## Captions

- **Speech in a clip is always captioned.** Nothing here transcribes video without a key, and
  `tts-verify.mjs` is for generated narration only. Listen, write what is said, have the person
  confirm it, and time each caption to the speech by its place in the film's frames.
- **Meaningful sound that is not speech gets a tag** — `[applause]`, `[crowd cheering]` — when it
  carries something the viewer needs.
- **Music with no speech gets a short bracketed description** — `[upbeat music]`.
- **Background room sound needs no caption.** Chatter under a shot that means nothing is not
  captioned. That is a judgement: record it in the brief, marked *mine* unless they made it.

Captions follow `building-scenes/reference/captions.md` and `asu-visual-style/accessibility.md` →
*Captions are required, not optional* → *What this means for how we build*: on by default, on an
opaque panel.

## Delivery

Render, measure and finish through `viewing-and-rendering`: HD renders take `--color-space=bt709`,
then `scripts/check-render.mjs <file> --composition <Id>`, then `scripts/finish-video.mjs`.

**Busy footage makes large files** — far larger than a drawn film of the same length. Ask where the
film will be played. For a website, `node scripts/finish-video.mjs <file> --web` makes a smaller
file for web playback. A website that autoplays video usually starts it muted, which is one more
reason the titles and captions have to carry the film without its sound.

## What it cannot do

Say these when footage comes up, before building:

- **No tracking.** Text or graphics cannot follow a moving person or object through a shot; they
  sit where they are placed.
- **No keying of moving footage.** Removing a green screen or a background from video is not set up
  here.
- **No stabilising.** Shaky footage stays shaky; choose steadier moments.
- **No generated video.** Footage comes from the person; nothing here films or generates it, and
  paid generation is never called without an approved proposal (`AGENTS.md` → *Cost rules*).
- **No pulling footage off the web.** Nothing here downloads, rips or screen-records from a
  platform; the person brings the file.

What it can do: trim, order and join clips, slow or speed sections, crop and scale, lay text,
panels and drawn graphics over them, and mix their sound with narration or a score.

## Measurements

Dated as taken, from one test run with stand-in clips. Re-measure on the real footage.

- **2026-10-20** — `retime-plate.mjs` `smooth` at quarter speed on 2 s of 1080p source took about
  10 minutes, and wrote 833 frames against 840 predicted.
- **2026-10-20** — a 40 s film from busy footage came out at 111.5 MB after finishing (about 22
  Mbit/s); the render alone was 106 MB. The stand-in clips were noise-like, so real phone footage
  may compress better.
- **2026-10-20** — white on `#1BA9A6` is 2.89:1; white on `#F26B21` is 3.04:1, which passes only
  the large-text minimum.
- **2026-10-20** — with `trimBefore={15}` in a 30 fps film, a 30 fps clip's burned-in timecode read
  source frame 75 at film frame 60: trims are film frames.
