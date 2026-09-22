# Access

What this project can reach outside itself, and what it costs. One entry, because one thing is
needed.

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
| **Cost** | The speech models have a free tier. Checked 2026-08-09 — **verify before relying on it**, because provider pricing ages faster than anything else in this repository |

### Four things about it that cost time to learn

**The free tier is 10 requests per day, per model.** Not per key and not per project — per model.
Measured by hitting it. A seventeen-line script cannot be read one line per call in a day.

**So batch by scene.** One call can read several lines with natural pauses between them; split the
returned audio locally afterwards. Five calls covers a whole film and leaves room for retries.

**Changing model gives a fresh allowance, and a different voice.** Never mix models inside one
film's narration — the voice audibly changes.

**A batched call can silently drop a line.** The audio comes back valid, plausible in length, and
missing a sentence. `scripts/tts-verify.mjs` exists for this: it transcribes the audio back and
compares it against the script. Run it on anything you generate.

Two smaller ones. The API returns raw headerless PCM (`audio/l16`, 24 kHz mono), which nothing
plays until a WAV header is prepended — `tts-generate.mjs` does that. And a harmless prompt is
occasionally refused as prohibited content; rewording usually clears it.

## Music

There is no free tier for music generation on this key — every call is a real charge. Nothing
here calls it.

## Paid services generally

This project was built for nothing, and the rules in `AGENTS.md` hold: free tools first, no paid
image, video, audio or cloud call without explicit approval for that specific call, and no
subscriptions, trials or stored payment methods.

Anyone proposing a paid step should say which single thing is blocked without it, the exact
feature, the number of attempts, and the total cost.
