# Decisions — what a film involves, and who makes each

**For the assistant.** Every decision below gets made on every film, whether anyone notices or not.
This file exists so that none of them is made by default without the person seeing it.

## Contents

- [The rule](#the-rule)
- [The map](#the-map)
- [The brief](#the-brief)
- [When they say "you decide" to everything](#when-they-say-you-decide-to-everything)

## The rule

A decision is made in one of two ways: **the person chooses it**, or **you choose it out loud** —
what, why, and that it can change, in one sentence. A third way, a decision taken by default that
nobody mentioned, is the one this file is here to stop.

Raise a decision at the step it belongs to. Raised earlier, it is a guess the person cannot judge
yet (music before the story exists). Raised later, it has already been made by whatever was built.

## The map

"Step" is the step in `building-a-video`. "Usually" says who normally owns the decision; it is a
starting point, not a rule — the person can take any of these, or hand any of them to you.

| Decision | Step | Default if they have no view | Usually | Reach for |
| --- | --- | --- | --- | --- |
| **Shape** — wide, upright, square | Before the interview | 1920×1080 wide. Ask the moment socials, Reels, TikTok or a phone come up | Theirs | `interview.md` step 0.5 |
| **Subject** | 1 | One of the three ready-made topics, to see how it works | Theirs | `topics/` |
| **Audience** | 1 | People new to the subject | Theirs | `interview.md` step 1 |
| **Length** | Interview, tentative | 60 seconds; "short" means 30 | Theirs, and it moves once built | `working-practice` → timing |
| **The story** — what happens, and why anyone cares | 3, a gate | You draft it in prose; nothing is built until they approve the words | Theirs to approve | this skill, step 3 |
| **Metaphors and symbols** | 3 and 5 | Offer two or three, one sentence each | **Always theirs** | — |
| **Opening hook and ending** | 3 | Part of the story draft; call each out by name | Theirs | — |
| **Humour, tone** | 3 | Plain and warm; no jokes they have not seen in words | Theirs | — |
| **How the words reach them** — voice, on screen, neither | Interview | A voice, with captions | Theirs | `adding-narration` |
| **Which voice** | 8 | One voice, one model, for the whole film | Yours, named | `adding-narration`, `scripts/tts-generate.mjs` |
| **Language** | Interview | The language they wrote to you in | Theirs | `interview.md` → other languages |
| **Music: whether** — original score, their track, none | Interview | Score if there is no voice; none if there is (see `interview.md` step 3b) | Theirs | `scoring-music` |
| **Music: feel and instruments** | After step 3 | Chosen from the story's mood, named in one line | Theirs if they have a view, otherwise yours, named | `scoring-music` |
| **The tune** | 10 | A tune they bring, or a public-domain melody they agree to, arranged here; otherwise an original kept simple | Theirs if offered | `scoring-music` → melody input |
| **Sound effects** | 10 | Only on structural moments — a cut, a landing — never on every word | Yours, named | `scoring-music` |
| **Which comes first, music or picture** | 9–10 | Picture first, score fitted to it | Yours, named | `scoring-music` |
| **The look** | 4 | Propose three distinct styles, recommend one | Theirs | `choosing-a-visual-style` |
| **A brand** | 4 | None, unless they named ASU or typed an `asu.edu` address | Theirs | `asu-visual-style` |
| **Where the pictures come from** | 6 | You make them | Theirs | `creating-assets` |
| **Whose world the pictures show** — place, people, culture | 6 | Ask. Invent no personal detail beyond what they gave | Theirs | `creating-assets` |
| **Which scene is built first** | 9 | The opening, or whichever carries the style hardest | Yours, named | `building-scenes` |
| **Pace and scene lengths** | 9–12 | Derived from what is in each scene, tentative | Theirs, by watching | `working-practice` → timing |
| **Interactivity** — whether, where, click or type | 3 and 11 | None unless asked; click-only if asked and unspecified | Theirs | `making-interactive-video` |
| **Delivery** — loudness, file name, where the final lives | 13 | −14 LUFS; `out/<project>/`, versioned names; final copy kept off this folder | Standard is yours, named; where it lives is theirs | `viewing-and-rendering`, `scripts/finish-video.mjs` |
| **Spending money** | Any | $0. Nothing paid without a specific, approved proposal | **Always theirs** | `ACCESS.md` |

Not decisions, and not to be offered as ones: captions on anything with a voice, readable contrast,
credit lines a licence requires. They are rules. Say them in a clause and move on.

## The brief

`content/<project>/docs/brief.md` — one file per film, one row per decision, appended as decisions
are made. It is the first thing the next session reads.

```markdown
# Brief — <project>

| Decision | What | Whose, when | Serves |
| --- | --- | --- | --- |
| Subject | How a bill becomes law, UK version | theirs, 2026-10-20 | — |
| Length | about 60 s (tentative) | mine ("you decide"), 2026-10-20 | — |
| Music | original score, guitar and soft percussion | mine ("you decide"), 2026-10-20 | scoring-music |
| Story | approved in words, see story.md | theirs, 2026-10-21 | — |
```

- **"Whose" is one of two words**: *theirs*, or *mine* with the reason it was mine — usually their
  "you decide". Add the date.
- **A changed decision gets a new row, not an edit.** The old row stays as the record of what was
  thought before, the same rule as any other document here.
- **It is short on purpose.** The reasoning lives in the conversation and the agent log; the brief
  is the lookup table.

## When they say "you decide" to everything

Some people want a video, not a conversation. That is fine and it changes nothing above: take every
decision, say each one in a line as you take it, write each into the brief, and put the whole list
in front of them at the plan (`interview.md` step 7) — the last cheap moment to catch one they
would have made differently. The story gate at step 3 and the first-scene review at step 9 still
happen. They are where a wrong guess costs a sentence instead of a rebuild.
