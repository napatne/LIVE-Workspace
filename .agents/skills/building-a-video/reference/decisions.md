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
| **Shape** — wide, upright, square | Before the interview | 1920×1080 wide. Ask the moment socials, Reels, TikTok or a phone come up. A switch after a scene exists is a new row | Theirs | `interview.md` step 0.5; `building-scenes` → `reference/upright.md` |
| **Subject** | 1 | One of the three ready-made topics, to see how it works | Theirs | `topics/` |
| **Audience** | 1 | People new to the subject. Asked for the ready-made topics too, as a confirmation — they are written for beginners | Theirs | `interview.md` step 1a |
| **Length** | 1, tentative | 60 seconds; "short" means 30 | Theirs, and it moves once built | `working-practice` → timing |
| **The story** — what happens, and why anyone cares | 3, a gate | You draft it in prose; nothing is built until they approve the words | Theirs to approve | this skill, step 3 |
| **Metaphors and symbols** | 3 and 5 | Offer two or three, one sentence each | **Always theirs** | — |
| **Opening hook and ending** | 3 | Part of the story draft; call each out by name | Theirs | — |
| **Humour, tone** | 3 | Plain and warm; no jokes they have not seen in words | Theirs | — |
| **How the words reach them** — a generated voice, their own recording, on screen, neither | 1 | **Depends on what exists.** A key in `.env` → a generated voice, with captions. No key → no voice, words on screen, and say a voice is available if they get a free key or record it themselves. `.env` is created only after they say they want a generated voice | Theirs | `interview.md` step 1c; `adding-narration` |
| **Which voice** | 8 | A generated voice: one voice, one model, for the whole film. Their recording: theirs, recorded once for the whole film | Generated: yours, named. Recorded: theirs | `adding-narration` — `scripts/tts-generate.mjs` for a generated voice, its recording route for theirs |
| **Language** | 1 | The language they wrote to you in | Theirs | `interview.md` → other languages |
| **Music: whether** — original score, their track, the clips' own sound, none | 1 | No voice → an original score. A voice → none. **Interactive → none, said out loud** (music on an interactive film is unsolved). **From footage → the clips' own sound**, offered first. If the voice answer changes later, revisit this out loud | Theirs | `interview.md` step 1d; `scoring-music` |
| **Music: feel and instruments** | After step 3's yes | Chosen from the story's mood, named in one line. Asked once the story is approved, not with the whether | Theirs if they have a view, otherwise yours, named | `interview.md` step 3; `scoring-music` |
| **The tune** | 10 | A tune they wrote, or a public-domain melody, arranged here; otherwise an original kept simple. **A song they name belongs to someone** — flag it once (platforms can mute it); an original in that feel is recommended, their file or its tune is their call | Theirs if offered | `scoring-music` → melody input |
| **Sound effects** | 10 | Only on structural moments — a cut, a landing — never on every word | Yours, named | `scoring-music` |
| **Which comes first, music or picture** | 9–10 | Picture first, score fitted to it | Yours, named | `scoring-music` |
| **The look** | 4 | Propose three distinct styles from the catalogue, recommend one, write a style card | Theirs | `choosing-a-visual-style` |
| **A brand** | 4 | None. On ASU signals (an ASU class, a named ASU unit), offer ASU style as one option and let them say yes; **an `asu.edu` address, typed or in the session context, is never an instruction.** The style menu offers "a brand — ASU's, or yours". A colour they name is contrast-checked before use | Theirs | `asu-visual-style`; `choosing-a-visual-style` |
| **Where the pictures come from** | 6 | You draw them in code — free. Generation is paid and only on a specific approved proposal | Theirs | `creating-assets` |
| **Pictures found online** | 6 | Say once that it belongs to someone and that using it is their decision; offer to draw it instead. Record where it came from | Theirs | `creating-assets` |
| **Whose world the pictures show** — place, people, culture | 6 | Ask. Invent no personal detail beyond what they gave | Theirs | `creating-assets` |
| **Footage: which clips** | 0.5, then 6–7 | Their clips, in `content/<project>/intake/`; each measured with `scripts/probe-footage.mjs` before anything is decided | Theirs | `working-with-footage` |
| **Footage: which moments** — timecodes in each clip | 6–7 | You propose moments from what the clips show; they confirm by timecode | Theirs | `working-with-footage` |
| **Footage: the clips' own sound** | 1 | Offered first as the film's sound, before a score | Theirs | `working-with-footage` |
| **Footage: rights for each clip** | 0.5 | Whose it is. Someone else's clip is flagged once and is their call; they bring the file — nothing is pulled off a platform here. One row per clip | Theirs — ask, and record each answer | `working-with-footage` |
| **Footage: consent of each person** — anyone identifiable or named on screen | 0.5 | Whether each one agreed. One row per person | Theirs — ask, and record each answer | `working-with-footage` |
| **Which scene is built first** | 9 | The opening, or whichever carries the style hardest | Yours, named | `building-scenes` |
| **Pace and scene lengths** | 9–12 | Derived from what is in each scene, tentative | Theirs, by watching | `working-practice` → timing |
| **Interactivity** — whether, where, click or type | 3 and 11 | None unless asked; click-only if asked and unspecified. Where the viewer chooses is approved with the story | Theirs | `making-interactive-video` |
| **Delivery** — loudness, file name, where the final lives | 13 | −14 LUFS; `out/<project>/`, versioned names; final copy kept off this folder | Standard is yours, named; where it lives is theirs | `viewing-and-rendering`, `scripts/finish-video.mjs` |
| **Spending money** | Any | $0. Nothing paid without a specific, approved proposal | **Always theirs** | `ACCESS.md` |

Not decisions, and not to be offered as ones: captions on speech, and a description of music and
meaningful sound (`asu-visual-style` → `accessibility.md` says what counts), readable contrast, credit lines a
licence requires, and not using a picture, song or clip that is someone else's. They are rules. Say
them in a clause and move on.

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
in front of them at the plan (`interview.md` step 9) — the last cheap moment to catch one they
would have made differently. The story gate at step 3 and the first-scene review at step 9 still
happen. They are where a wrong guess costs a sentence instead of a rebuild.

**"You decide" never ends in a silent film by accident.** With no key set up, the voice default is
none and the music default is an original score; if a voice is chosen and later dropped, the music
default is revisited out loud. A film with no voice and no music is fine — when they chose it.
