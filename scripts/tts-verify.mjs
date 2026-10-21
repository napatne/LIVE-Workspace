// Transcribe generated narration back to text, to verify the TTS actually said
// the script and nothing else.
//
//   node scripts/tts-verify.mjs <file.wav> [...]
//
// Uses a text model (gemini-flash-latest), which has its own free-tier quota
// separate from the TTS models — verifying does not eat generation budget.
//
// Takes WAV files only - what scripts/tts-generate.mjs writes - and refuses
// anything else before it calls the API. Exits 1 if any request fails (a bad
// key, a used-up quota), so a failure cannot pass for a transcript.

import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { extname } from "node:path";
import { argv, exit } from "node:process";

const files = argv.slice(2);
if (files.length === 0 || files.includes("--help")) {
  console.error("usage: node scripts/tts-verify.mjs <file.wav> [...]");
  exit(1);
}
for (const file of files) {
  if (!existsSync(file)) {
    console.error(`No file at ${file}.`);
    exit(1);
  }
  if (extname(file).toLowerCase() !== ".wav") {
    console.error(`${file} is not a .wav file. This checks the WAVs scripts/tts-generate.mjs writes; convert anything else to WAV first.`);
    exit(1);
  }
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

let failures = 0;
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

  if (!res.ok) {
    failures++;
    const body = (await res.text()).slice(0, 300);
    const hint =
      res.status === 400 || res.status === 401 || res.status === 403
        ? "The request or the key was refused - check GOOGLE_AI_STUDIO_API_KEY in .env (ACCESS.md says where it comes from)."
        : res.status === 429
          ? "The quota is used up for now - try again later; ACCESS.md lists the limits."
          : "The request failed.";
    console.error(`\n=== ${file} ===\nFAILED: HTTP ${res.status}. ${hint}\n${body}`);
    continue;
  }
  const json = await res.json();
  const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    failures++;
    console.error(`\n=== ${file} ===\nFAILED: no transcript in the response: ${JSON.stringify(json).slice(0, 200)}`);
    continue;
  }
  console.log(`\n=== ${file} ===\n${text.trim()}`);
}
if (failures) {
  console.error(`\n${failures} of ${files.length} file(s) could not be transcribed. Nothing was verified for them.`);
  // exitCode, not exit(): exiting while fetch's connections are still closing
  // crashes Node on Windows with a libuv assertion and the wrong exit code.
  process.exitCode = 1;
}
