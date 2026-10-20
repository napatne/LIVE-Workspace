// MIDI in, audio out: real sampled instruments, rendered offline, to the frame.
//
// spessasynth_core (Apache-2.0, pure JavaScript, no compiler) plays the MIDI
// through a General MIDI SoundFont - GeneralUser GS by default, fetched once by
// scripts/score/fetch-soundfont.mjs. Rendering runs faster than real time and
// needs no sound card, so it works the same in a terminal, on any machine.
//
// Two settings that decide whether the music stays in sync, both off by
// default in the library and both set here:
//   - skipToFirstNoteOn: the sequencer otherwise jumps straight to the first
//     note, so a score whose first sound is at 2.0 s would play it at 0.0 s.
//   - loopCount: 0, so nothing repeats past the end.

import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { BasicMIDI, SoundBankLoader, SpessaLog, SpessaSynthProcessor, SpessaSynthSequencer } from "spessasynth_core";

export const SAMPLE_RATE = 48000;
const BLOCK = 128;
const END_FADE_S = 0.05;

SpessaLog.warnEnabled = false;
SpessaLog.infoEnabled = false;

/**
 * Render a MIDI file to two Float32Arrays exactly `seconds` long, with `gain`
 * (a function of time, from lib/timeline.mjs → gainCurve) applied to every sample.
 */
export const renderMidi = async ({ midi, seconds, soundfont, gain = () => 1, sampleRate = SAMPLE_RATE }) => {
  const bank = SoundBankLoader.fromArrayBuffer(readFileSync(soundfont).buffer);
  const synth = new SpessaSynthProcessor(sampleRate, { eventsEnabled: false });
  synth.soundBankManager.addSoundBank(bank, "main");
  await synth.processorInitialized;
  const seq = new SpessaSynthSequencer(synth);
  seq.skipToFirstNoteOn = false;
  seq.loopCount = 0;
  seq.loadNewSongList([BasicMIDI.fromArrayBuffer(midi)]);
  seq.play();

  const total = Math.round(seconds * sampleRate);
  const left = new Float32Array(total);
  const right = new Float32Array(total);
  for (let filled = 0; filled < total; ) {
    seq.processTick();
    const n = Math.min(BLOCK, total - filled);
    synth.process(left, right, filled, n);
    filled += n;
  }

  const fadeFrom = total - Math.round(END_FADE_S * sampleRate);
  for (let i = 0; i < total; i++) {
    let g = gain(i / sampleRate);
    if (i > fadeFrom) g *= (total - i) / (total - fadeFrom); // no click on the last sample
    left[i] *= g;
    right[i] *= g;
  }
  return { left, right, sampleRate };
};

/** A fingerprint of the rendered audio, so two runs can be compared exactly. */
export const fingerprint = ({ left, right }) =>
  createHash("sha256").update(Buffer.from(left.buffer)).update(Buffer.from(right.buffer)).digest("hex").slice(0, 16);

/** The highest absolute sample, in dBFS. */
export const peakDb = ({ left, right }) => {
  let peak = 0;
  for (let i = 0; i < left.length; i++) peak = Math.max(peak, Math.abs(left[i]), Math.abs(right[i]));
  return peak ? 20 * Math.log10(peak) : -Infinity;
};

/** 32-bit float stereo WAV - no clipping, whatever the level, until it is levelled. */
export const writeFloatWav = (path, { left, right, sampleRate }) => {
  const frames = left.length;
  const data = Buffer.alloc(frames * 8);
  for (let i = 0; i < frames; i++) {
    data.writeFloatLE(left[i], i * 8);
    data.writeFloatLE(right[i], i * 8 + 4);
  }
  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + data.length, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(3, 20); // IEEE float
  header.writeUInt16LE(2, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * 8, 28);
  header.writeUInt16LE(8, 32);
  header.writeUInt16LE(32, 34);
  header.write("data", 36);
  header.writeUInt32LE(data.length, 40);
  writeFileSync(path, Buffer.concat([header, data]));
};

const ffmpeg = (args) => {
  console.log(`$ ffmpeg ${args.join(" ")}`);
  const r = spawnSync("ffmpeg", args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  if (r.error?.code === "ENOENT") throw new Error("ffmpeg is not on PATH. A full system FFmpeg is required - see installing-the-toolchain.");
  if (r.status !== 0) throw new Error(r.stderr.slice(-1500));
  return r.stderr;
};

/**
 * Level the score to `lufs` and write it as 24-bit WAV for the film to play.
 *
 * A gentle compressor and a limiter go first. Without them, a score with a few
 * loud hits measures quiet overall, and bringing it up to level pushes those
 * hits into the limiter at the finishing step - about 4 dB of limiting on the
 * first score made this way.
 */
export const level = (input, output, lufs) => {
  const chain = "acompressor=threshold=-20dB:ratio=2:attack=20:release=250:makeup=1,alimiter=limit=0.7:attack=3:release=80:level=disabled";
  const measured = ffmpeg(["-hide_banner", "-nostats", "-i", input, "-af", `${chain},loudnorm=I=${lufs}:TP=-2:LRA=11:print_format=json`, "-f", "null", "-"]);
  const m = JSON.parse(measured.slice(measured.lastIndexOf("{"), measured.lastIndexOf("}") + 1));
  ffmpeg([
    "-hide_banner", "-loglevel", "error", "-y", "-i", input,
    "-af", `${chain},loudnorm=I=${lufs}:TP=-2:LRA=11:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true,aresample=${SAMPLE_RATE}`,
    "-c:a", "pcm_s24le", output,
  ]);
  const check = ffmpeg(["-hide_banner", "-nostats", "-i", output, "-af", "ebur128=peak=true:framelog=verbose", "-f", "null", "-"]);
  const summary = check.slice(check.lastIndexOf("Summary:"));
  return {
    lufs: Number(summary.match(/I:\s+(-?[\d.]+) LUFS/)?.[1]),
    truePeak: Number(summary.match(/Peak:\s+(-?[\d.]+) dBFS/)?.[1]),
  };
};
