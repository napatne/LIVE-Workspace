# Access

What this project can reach outside itself, and what it costs. One service is used — speech —
and the rest of this file records what is deliberately not used, so nobody has to find out again.

Rewritten 2026-09-21. It previously registered five services across two films that no longer exist
here; four of them were removed and the fifth is below.

## Speech — Google AI Studio (Gemini)

Needed only if the video has narration. A silent video needs no key and no account, and the film
in this repository is silent.

| | |
| --- | --- |
| **What it is** | Text-to-speech. Send a line of script, get spoken audio back |
| **How it authenticates** | An API key, read from `.env` |
| **The variable** | `GOOGLE_AI_STUDIO_API_KEY` — `scripts/tts-generate.mjs` and `scripts/tts-verify.mjs` read it directly from `.env`, not from the shell |
| **Getting a key** | Free, from [aistudio.google.com](https://aistudio.google.com/apikey). It belongs in `.env`, which is gitignored and never committed |
| **Cost** | The Flash speech models have a free tier: `gemini-3.1-flash-tts-preview` (what the scripts use), `gemini-2.5-flash-preview-tts`, and the newer `gemini-3.8-flash-tts` and `gemini-3.8-flash-lite-tts`. **`gemini-2.5-pro-preview-tts` has none** — every call is charged. Checked 2026-10-21 against Google's pricing page (updated 2026-10-19) — **verify before relying on it**, because provider pricing ages faster than anything else in this repository |

### Four things about it that cost time to learn

**The free tier is small, and counted per model.** Limits apply per project, not per key, and each
model has its own. Google's rate-limit page does not publish the free-tier numbers; each person's
are at [aistudio.google.com/rate-limit](https://aistudio.google.com/rate-limit). Measured by
hitting it (2026-08-09): 10 requests per day per model. A seventeen-line script cannot be read one
line per call in a day.

**So batch by scene.** One call can read several lines with natural pauses between them; split the
returned audio locally afterwards. Five calls covers a whole film and leaves room for retries.

**Changing model gives a fresh allowance, and a different voice** — among the free models only;
`2.5-pro` has no allowance to give. Never mix models inside one film's narration — the voice
audibly changes.

**A batched call can silently drop a line.** The audio comes back valid, plausible in length, and
missing a sentence. `scripts/tts-verify.mjs` exists for this: it transcribes the audio back and
compares it against the script. Run it on anything you generate.

Two smaller ones. The API returns raw headerless PCM (`audio/l16`, 24 kHz mono), which nothing
plays until a WAV header is prepended — `tts-generate.mjs` does that. And a harmless prompt is
occasionally refused as prohibited content; rewording usually clears it.

## Music

**Made here, for nothing.** The `scoring-music` skill writes a score in code and renders it on this
machine through a free General MIDI SoundFont — GeneralUser GS, downloaded once by
`npm run soundfont` (32 MB, from the author's GitHub repository). Its licence allows any use,
commercial included, with no credit needed on the music. Checked 2026-10-19.

Music *generation* through the Google key above (the Lyria models) has no free tier — every call is
a real charge. Nothing here calls it, and nothing needs to. Checked 2026-10-21.

## Images

**Drawn here, in code, for nothing.** No image generator is used. Every Gemini image model has no
free tier — every call is a real charge (checked 2026-10-21 against the same pricing page). Pictures
are drawn in code, supplied by the person, or generated in a tool of their own from prompts written
here (`creating-assets`). A paid image call happens only through the proposal below.

## Paid services generally

This project was built for nothing, and the rules in `AGENTS.md` hold: free tools first, no paid
image, video, audio or cloud call without explicit approval for that specific call, and no
subscriptions, trials or stored payment methods.

Anyone proposing a paid step should say which single thing is blocked without it, the exact
feature, the number of attempts, and the total cost.
