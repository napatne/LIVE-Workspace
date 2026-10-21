# Generating

## Contents

- [The manifest](#the-manifest)
- [Batching — the thing the quota forces](#batching--the-thing-the-quota-forces)
- [Voices](#voices)
- [Verify. Every time.](#verify-every-time)
- [When a prompt is refused](#when-a-prompt-is-refused)
- [When verification finds a missing line](#when-verification-finds-a-missing-line)
- [What comes back](#what-comes-back)
- [Budgeting a day](#budgeting-a-day)

## The manifest

`scripts/tts-generate.mjs` takes a JSON array and an output directory:

```bash
node scripts/tts-generate.mjs <manifest.json> content/<project>/narration
```

Each entry is `{ id, voice, prompt }`. One entry becomes one WAV named `<id>.wav`, and **one
API call** — which is the number that matters.

```json
[
  {
    "id": "batch-a",
    "voice": "Rasalgethi",
    "prompt": "Read these lines clearly and unhurriedly, pausing a beat between each.\n\nEvery plant you have ever seen built itself, mostly out of air and sunlight.\n\nA plant needs three things. Sunlight on its leaves. Water from its roots. And carbon dioxide, taken straight out of the air.\n\nInside the leaf, sunlight turns that water and carbon dioxide into sugar. The plant keeps the sugar and releases the oxygen."
  }
]
```

**`prompt` is the whole text sent to the model, including the direction.** The model reads the
lines and follows the note as delivery guidance. There is no separate field for it — and a
prompt is **several sections joined**, never one section's `narration` on its own.

**End the direction with "Do not read this instruction aloud."** The model sometimes speaks the
stage direction; `tts-verify.mjs` catches it, but it is cheaper to prevent than to spend another
request regenerating.

**Blank lines between the lines are the contract** the split depends on — they are what makes
the model pause. Ask for the pause explicitly in the direction.

**The manifest lives at `content/<project>/tts-manifest.json`**, beside the film's brief. The
batches it produces go in `content/<project>/narration/`, where `scripts/build-audio.mjs` cuts them
into one clip per line in `public/assets/<project>/audio/`. Only the clips go in `public/`, because
everything there is copied into every render.

## Batching — the thing the quota forces

**Ten requests per day, per model.** A six-section video is six calls if you go one per
section, which leaves four for the entire rest of the day including retries.

**Batch two to four sections per call.** Give the model a direction that produces a usable gap
between lines, then find the boundaries and cut one clip per line with `scripts/build-audio.mjs`
(or, while timings are still moving, play each slice with `trimBefore`/`trimAfter`).

**A full system FFmpeg is required.** The copy bundled with Remotion (`npx remotion ffmpeg`) is
trimmed: `silenceremove` and `afade`, which `scripts/build-audio.mjs` uses, are compiled out of
it. [splitting.md](splitting.md) covers finding the boundaries, cutting the clips and placing them.

**One film here got 15 narration cues out of 3 API calls** — two scene batches plus one
separate line. Fifteen separate calls would have been one and a half days of quota. **That
film has since been removed from this repository**, so the cue file it was counted from is
gone; the ratio is the part worth keeping.

### Batch by tier, not by file order

A film built from a topic pack plays **whole tiers** — `core`, then `standard`, then
`extended` — chosen by length, and the packs put `recap` — a `core` section — last in file
order, after every `extended` one. Batch on adjacency and a 30-second version needs the extended
batch to play one line.

**Group each tier's sections into their own batches.** Then a 30-second video needs only the
core batch, a 60-second one needs core + standard, and dropping a tier drops whole files.

**Do not batch the whole script into one call.** The longer the prompt, the more likely a line
goes missing — the observed failures were at three and four lines, and they got worse with
length. Two to four is the working range.

## Voices

`prebuiltVoiceConfig.voiceName`. One earlier film used **Rasalgethi** for narration and **Charon**
and **Leda** for short non-verbal sounds. Rasalgethi was picked by the director from a
four-way audition — *"i loved this one! it has that sarcastic tone to it."*

**There is no voice list in this repository.** Gemini's prebuilt voice names are in Google's
own docs — <https://ai.google.dev/gemini-api/docs/speech-generation> — and that page is the
thing to trust, not a list copied here that would go stale.

**Default to Rasalgethi** unless they ask for something else. It is the one voice this project
has actually shipped, and auditioning costs requests you may want later.

**Audition on the model you will ship on.** The director picked Rasalgethi from
`gemini-3.1-flash-tts-preview` samples, then that day's quota ran out and v1 shipped on
`gemini-2.5-flash-preview-tts` — a different engine, reading roughly twice as fast. It had to
be regenerated later on the engine it was chosen for.

### Which models are free

**`gemini-2.5-pro-preview-tts` has no free tier.** An earlier session found it returning **429 on
the first call of the day**, and Google's pricing page lists it as paid only. Do not reach for it
when a free model's quota runs out — every call is charged. The free ones, and the date they were
checked, are in `ACCESS.md`. If you need a fresh quota, switch to another free model, knowing the
voice engine changes with it.

**Set the model explicitly** so a default cannot change under you:

```bash
# bash
TTS_MODEL=gemini-3.1-flash-tts-preview node scripts/tts-generate.mjs content/<project>/tts-manifest.json content/<project>/narration
```

**On Windows, use the Bash tool for this**, not PowerShell. The bash form above is one command,
so once the person approves it for this project it stops asking — a key in `.env` is already their
permission to use the service (`installing-the-toolchain` → `reference/PERMISSIONS.md`). The
PowerShell equivalent cannot become a rule as cleanly:

```powershell
# Works, but asks every time. PowerShell tool calls do not carry shell state between
# them, so the two lines must go as one ';'-joined string - and a rule for that string
# matches nothing else.
$env:TTS_MODEL = 'gemini-3.1-flash-tts-preview'
node scripts/tts-generate.mjs content/<project>/tts-manifest.json content/<project>/narration
```

If you genuinely have no Bash tool, run `node scripts/tts-generate.mjs ...` on its own — that
form fits a plain `node scripts/*` rule. **Read the top of `scripts/tts-generate.mjs` first and confirm its default
model is still the one you want**, because dropping the prefix is exactly the thing the
explicit-model rule above exists to prevent.

**Run from the project root.** Both scripts read `.env` relative to the working directory.

Switching model grants a fresh 10/day. **It also changes the voice and the pace**, so switching
mid-video means regenerating all of it.

## Verify. Every time.

```bash
node scripts/tts-verify.mjs content/<project>/narration/batch-a.wav content/<project>/narration/batch-b.wav
```

**Name the files.** PowerShell does not glob-expand for native commands, so `*.wav` arrives at
the script literally.

It transcribes the audio back with a text model and prints what was actually said. That model
has **its own quota**, separate from the TTS models — so verifying does not spend generation
budget. It is still a rate-limited free-tier model uploading the whole WAV inline, so do not
loop it.

**It is for generated speech only.** It sends every file as `audio/wav`, and its transcription
prompt is written for synthesis — it asks for stage directions read aloud by mistake. A person's
own recording is checked by listening through it against the script, matching the line count from
splitting, and the person confirming — see [recording.md](recording.md).

**What it checks before it calls anything:** that `.env` exists and that it holds
`GOOGLE_AI_STUDIO_API_KEY`. Either missing, it prints a plain message saying what is needed and
stops with exit code 1. It also checks each response's status, so a rejected request — a bad key, a
spent quota — is reported as an error for that file rather than printed as though it were a
transcript. Still read every file's output: one failed file among several is easy to miss, and a
transcript that came back is only as good as your comparison against the script.

**Read the transcript against your script, line by line.** You are looking for:

- **A missing line.** The failure this exists to catch. `"First —"`, `"Thank you."` and
  `"Moving on."` all vanished from one film's audio and nothing else noticed.
- **A direction read aloud.** The model sometimes speaks the stage direction. The verify prompt
  specifically asks for those to be transcribed.
- **`[silence]`** where a line should be.

**A clean exit code means nothing here, twice over.** The generator reports `ok` and a duration
for a file missing a third of its content — and it also **exits 0 when every single entry
failed**, because failures are caught per-entry and printed as `FAIL`. Read the lines, not the
status.

**With no `.env`, or no key in it, both scripts say so in plain words and stop** with exit code 1
— the message names the variable and points at `ACCESS.md`. That is the normal state of a fresh
clone. `.env` is created only once the person has said they want a generated voice and will get a
key; until then, the scripts are not the place to find out it is missing.

## When a prompt is refused

`PROHIBITED_CONTENT` fires on innocuous text. A request for "a dry, disappointed huff" at "a
joke he considers beneath the occasion" was blocked outright; a reworded version passed.

**Reword once and retry. Do not conclude the capability is gone**, and do not burn three
requests hammering the same phrasing.

## When verification finds a missing line

**Regenerate that batch — one request — and do not re-split the old file.** A missing line is
missing; there is nothing to recover from the audio.

**Regenerating re-reads every line in that batch** at slightly different lengths, so any
duration reconciliation already done for those sections is void. Redo it for the whole batch,
not just the line that was missing. This is why batches are split on adjacency: a rewrite to
one section only invalidates its own batch.

## What comes back

`audio/l16; rate=24000; channels=1` — raw headerless little-endian PCM, base64. Nothing plays
it until a 44-byte WAV header is prepended. `tts-generate.mjs` already does this; if you ever
write your own path, you must too.

Duration in seconds is `bytes / 2 / 24000`.

## Budgeting a day

| Calls | For |
| --- | --- |
| 1–2 | **Auditioning a voice**, if they have not chosen one |
| 2–4 | The narration itself, batched |
| 3–4 | **Held back for retries and a regenerate after feedback** |

Leave headroom. A rewrite after the person hears it is normal, and finding the quota gone is
how a film ends up shipping on the wrong engine.
