# Recording your own voice

The narration is the person reading their own script. No key, no account, no quota, and a voice
the audience may already know. This file covers it from the microphone to checked clips.

## Contents

- [Before they record](#before-they-record)
- [Where the file goes](#where-the-file-goes)
- [Converting it for the scanner](#converting-it-for-the-scanner)
- [Splitting it into lines](#splitting-it-into-lines)
- [Cutting the clips](#cutting-the-clips)
- [Checking it](#checking-it)
- [Changing words after it is recorded](#changing-words-after-it-is-recorded)

## Before they record

The script is approved first. Every change after this point is a re-record, so the words should be
settled before anyone presses record.

Tell them, in plain words:

- **A quiet room.** Soft furnishings help — a bedroom beats a kitchen. Close the window, silence the
  phone's notifications, turn off a fan if they can.
- **A phone or a USB microphone is enough.** The phone's own voice recorder app is fine. Hold or
  prop it about a hand-span from the mouth, a little off to one side so breath does not pop into it,
  and keep it in the same place for the whole session.
- **Read the script as written**, one line after another. The script is laid out one line per clip;
  a line may be a sentence or a short paragraph.
- **Leave about two seconds of quiet between lines.** That pause is what lets the recording be split
  by machine. Ask for it explicitly; people close up the gaps when they are concentrating.
- **A stumble is fine.** Stop, leave the two-second pause, and read that whole line again from its
  start. Ask them to tell you which lines they re-read.
- **Pick-ups later in the same place.** A line re-recorded another day, in another room or at another
  distance, sounds different from its neighbours.

## Where the file goes

**Into `content/<project>/intake/`**, as it came off the device — an `.m4a`, `.mp3` or `.wav`, whatever
the recorder wrote. Do not rename it in ways that lose the original.

Video and audio in `intake/` are git-ignored: a recording is someone's voice and does not travel in
the repository (`collaborating-with-git`). Record in the brief that the narration is their own
recording, and the file's name.

## Converting it for the scanner

The scanner in [splitting.md](splitting.md) reads only **16-bit PCM, mono, 24 kHz WAV** — the format
generated speech arrives in. It does not read the file's format header, so anything else either
fails with "no data chunk" or is measured at the wrong rate without any error. A phone recording is
almost never in that format. Convert it first, with the full system FFmpeg:

```js
// content/<project>/tools/convert-recording.mjs — inside the project, not a temp folder.
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";

const [input, output] = process.argv.slice(2);
if (!input || !output || !existsSync(input)) {
  console.error("usage: node content/<project>/tools/convert-recording.mjs <in.m4a> <out.wav>");
  process.exit(1);
}
const args = ["-v", "error", "-y", "-i", input, "-ac", "1", "-ar", "24000", "-c:a", "pcm_s16le", output];
console.log(`$ ffmpeg ${args.join(" ")}`);
const r = spawnSync("ffmpeg", args, { encoding: "utf8" });
if (r.status !== 0) { console.error(r.stderr); process.exit(1); }
```

Arguments go as an array, the input is checked and the command printed before it runs, per
`AGENTS.md` → *FFmpeg rules*. Write the converted file beside the original in `intake/`, and use it
for every step after this one, so the times the scanner finds are times in the file that gets cut.

## Splitting it into lines

Find the boundaries with the scanner in [splitting.md](splitting.md), sweeping the minimum gap until
the number of regions matches the number of lines — plus one for each line they told you they
re-read.

**Take the top of the sweep from the pause you asked for.** If they were asked for two seconds, sweep
up to about 2.0 s. A reader's pauses inside a line can run close to a second, so a sweep that stops
at 1.0 s can miss the only value that works.

**Sanity-check against this reader's rate, not a generated voice's.** Count the script's words,
divide by the total speech time the regions cover, and you have their words per minute. A region
half or double the length its words predict at that rate is a wrong boundary.

Where a line was read twice, keep the later take unless they say otherwise.

## Cutting the clips

Write a cues file with one cue per line — `"type": "vo"`, `src` the converted WAV, `start` and
`duration` from the regions, widened a little at each edge — and run:

```bash
node scripts/build-audio.mjs --cues content/<project>/audio-cues.json --src content/<project>/intake --out public/assets/<project>/audio
```

It strips the room's near-silence from each end, levels every clip to the same loudness under a peak
ceiling, and fades both edges. The cues file's fields are in [splitting.md](splitting.md) →
*Cutting clips with build-audio*. Room noise louder than the strip threshold is not removed; if
clips start on a hiss, widen less.

## Checking it

`scripts/tts-verify.mjs` is for generated speech only: it needs a key, and it is written for
synthesis output. A recording is checked three ways:

1. **Listen through it against the script**, line by line. Note anything skipped, swapped or
   reworded.
2. **The line count from splitting** matches the script's line count, after the re-reads are set
   aside.
3. **The person confirms** what they hear. Play it back, or point them at the clips, and ask.

A clean count with a skipped word in the middle is still a skipped word, and only listening finds
it. Report what you checked and what you found; whether it sounds right is theirs to say.

## Changing words after it is recorded

**Editing the script no longer fixes anything.** The recording is the narration. If the person
later wants a title or label on screen that the narration never says, the voice and the picture now
disagree, and the only way to make the voice match is to record that line again.

So keep on-screen words within the recorded words. When a change would step outside them, say so
before making it — *"that puts a term on screen the narration doesn't say; matching it would mean
re-recording that line"* — and let them choose. Often the picture's point is already carried by what
was said, and the label can stand.
