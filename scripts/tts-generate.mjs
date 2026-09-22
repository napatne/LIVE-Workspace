// Narration and non-verbal audio generation, driven by a manifest.
//
// Free-tier Gemini TTS on the AI Studio key. Reads a manifest of lines, writes
// one WAV per line so each can be placed independently in Remotion.
//
//   node scripts/tts-generate.mjs <manifest.json> <output-dir>
//
// The manifest is a JSON array of { id, voice, prompt }. `prompt` is the full
// text sent to the model, including its director's note — the model speaks the
// line and follows the note as delivery guidance.
//
// Cost: free tier (verified 2026-08-09 on ai.google.dev/gemini-api/docs/pricing).
// Never call a Lyria/image/video model from here — those are paid.

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { argv, exit } from "node:process";

// Free tier allows 10 requests per day PER MODEL, so exhausting one model does
// not block the others. Never mix models within one film's narration though —
// the voice engine differs between them. Override with TTS_MODEL=<id>.
const MODEL = process.env.TTS_MODEL ?? "gemini-3.1-flash-tts-preview";
const SAMPLE_RATE = 24000;

const [manifestPath, outDir] = argv.slice(2);
if (!manifestPath || !outDir) {
  console.error("usage: node scripts/tts-generate.mjs <manifest.json> <out-dir>");
  exit(1);
}

// .env is gitignored, so a fresh clone has none at all. Reading it unguarded
// met that ordinary case with a raw ENOENT stack trace.
let env;
try {
  env = await readFile(".env", "utf8");
} catch {
  console.error(
    "No .env file here. Narration needs a Google AI Studio key, written as\n" +
      "  GOOGLE_AI_STUDIO_API_KEY=<key>\n" +
      "in a .env at the project root. ACCESS.md says where the key comes from\n" +
      "and what it costs — TTS is on the free tier, but the key has to exist.",
  );
  exit(1);
}

const key = env
  .split(/\r?\n/)
  .find((l) => l.startsWith("GOOGLE_AI_STUDIO_API_KEY="))
  ?.slice("GOOGLE_AI_STUDIO_API_KEY=".length)
  .trim()
  .replace(/^["']|["']$/g, "");

if (!key) {
  console.error("GOOGLE_AI_STUDIO_API_KEY not found in .env");
  exit(1);
}

// 44-byte canonical WAV header. The API returns raw little-endian PCM
// (audio/l16), which is headerless, so nothing can play it until we prepend
// this.
const wavHeader = (dataLen, rate = SAMPLE_RATE, channels = 1, bits = 16) => {
  const b = Buffer.alloc(44);
  b.write("RIFF", 0);
  b.writeUInt32LE(36 + dataLen, 4);
  b.write("WAVE", 8);
  b.write("fmt ", 12);
  b.writeUInt32LE(16, 16);
  b.writeUInt16LE(1, 20);
  b.writeUInt16LE(channels, 22);
  b.writeUInt32LE(rate, 24);
  b.writeUInt32LE((rate * channels * bits) / 8, 28);
  b.writeUInt16LE((channels * bits) / 8, 32);
  b.writeUInt16LE(bits, 34);
  b.write("data", 36);
  b.writeUInt32LE(dataLen, 40);
  return b;
};

const speak = async ({ voice, prompt }) => {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } },
          },
        },
      }),
    },
  );

  if (!res.ok) {
    throw new Error(`${res.status} ${(await res.text()).slice(0, 300)}`);
  }

  const json = await res.json();
  const data = json?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!data) {
    throw new Error(`no audio in response: ${JSON.stringify(json).slice(0, 300)}`);
  }
  return Buffer.from(data, "base64");
};

const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
await mkdir(outDir, { recursive: true });

for (const entry of manifest) {
  try {
    const pcm = await speak(entry);
    const out = `${outDir}/${entry.id}.wav`;
    await writeFile(out, Buffer.concat([wavHeader(pcm.length), pcm]));
    const seconds = pcm.length / 2 / SAMPLE_RATE;
    console.log(`ok    ${entry.id.padEnd(24)} ${entry.voice.padEnd(12)} ${MODEL} ${seconds.toFixed(2)}s`);
  } catch (err) {
    console.log(`FAIL  ${entry.id.padEnd(34)} ${entry.voice.padEnd(14)} ${err.message}`);
  }
}
