// Transcribe generated narration back to text, to verify the TTS actually said
// the script and nothing else.
//
//   node scripts/tts-verify.mjs <file.wav> [...]
//
// Uses a text model (gemini-flash-latest), which has its own free-tier quota
// separate from the TTS models — verifying does not eat generation budget.

import { readFile } from "node:fs/promises";
import { argv, exit } from "node:process";

const files = argv.slice(2);
if (files.length === 0) {
  console.error("usage: node scripts/tts-verify.mjs <file.wav> [...]");
  exit(1);
}

// .env is gitignored, so a fresh clone has none at all. Reading it unguarded
// met that ordinary case with a raw ENOENT stack trace.
let env;
try {
  env = await readFile(".env", "utf8");
} catch {
  console.error(
    "No .env file here. Verifying narration needs a Google AI Studio key,\n" +
      "written as GOOGLE_AI_STUDIO_API_KEY=<key> in a .env at the project root.\n" +
      "ACCESS.md says where the key comes from and what it costs.",
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

for (const file of files) {
  const audio = await readFile(file);
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: "Transcribe this audio exactly. Write each distinct spoken utterance on its own line, in order. Include every word you hear, including any instructions or stage directions the speaker may have read aloud by mistake. If there is a long silence, write [silence]. Output only the transcript.",
              },
              {
                inlineData: {
                  mimeType: "audio/wav",
                  data: audio.toString("base64"),
                },
              },
            ],
          },
        ],
      }),
    },
  );

  const json = await res.json();
  const text =
    json?.candidates?.[0]?.content?.parts?.[0]?.text ??
    `ERROR ${res.status}: ${JSON.stringify(json).slice(0, 200)}`;
  console.log(`\n=== ${file} ===\n${text.trim()}`);
}
