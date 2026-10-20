---
name: building-a-video
description: Takes a video from a one-sentence idea to a finished file - asking the questions that shape it (story, words, music, look, pictures), saying who decides each one, and calling the other skills and tools at the step where each is needed. Use when someone wants a video made, asks how to start one, names a subject, accepts an offer to create one, says "you decide", or asks what this workspace can make for them. Opens by offering stock subjects or taking their own.
---

# Building a video

**Use this when** someone wants a video made, whether they arrived through `onboarding` or walked
in cold and said so.

**You need first** a working install. A subject is not required — establishing one is this skill's
first move.

**This produces** a finished, rendered video, plus the brief, storyboard, script and assets it was
built from.

**Then go to** the craft skills as each decision arrives, and `viewing-and-rendering` at the end.

---

## Open with the subject

*What would you like to make?* Then offer the ready-made subjects in
[`topics/`](topics/) for a standing start, and make clear that their own subject is equally
welcome. Someone with nothing particular in mind should not have to invent one to see this work.

## The interview

Seven questions before anything is built. Every one is cheap to decide now and expensive to change
after the film exists, and **every one has a default — "you decide" is always a valid answer.**

| Question | Why it has to be asked |
| --- | --- |
| **What is it about?** | One sentence. If it cannot be written, the video has no subject yet |
| **Who is it for?** | A specific audience changes vocabulary, tone and pace |
| **How long?** | Tentatively. It will move once the thing exists |
| **Narration, or text on screen?** | This one reorders everything downstream |
| **Music under it?** | An original score made here, a track they own, or none. Silence is a choice too, and it changes how every scene is paced |
| **What should it look like?** | Their own style, one of several proposed, or brand compliance |
| **Where do the pictures come from?** | Generated, supplied, or prompts written for them to run |

Expect more than seven. A longer video needs more of them than a thirty-second one, and a film with
a story needs the story agreed in words (step 3 below) before any of the craft questions mean much.

**Ask; do not infer.** Not the style from their email domain, not narration from the subject, not
the audience from the institution, not music from the fact that the last film had some.

## Nobody decides silently

Every decision that shapes the film has an owner, and the person can always see which. There are
only two legitimate ways a decision gets made:

- **They choose it.** Record their words.
- **You choose it out loud.** When they say *"you decide"*, or a decision arrives that they have no
  view on, pick — and say what you picked, why, and that it can change, in one line: *"I'll keep
  the music to guitar and soft percussion — it suits a calm subject. Say if you want something
  bigger."* "You decide" hands you the choice; it does not make the choice invisible.

What is not legitimate is the third way, which is where most surprises come from: **a decision
nobody asked about, taken by default.** Music, the story's shape, the metaphor a scene leans on, the
pace, the ending, which voice, whose world the pictures show. None of these will be raised by the
person unprompted, and each one is noticed only once the film exists. Raise each at the step where
it arrives — [`reference/decisions.md`](reference/decisions.md) lists them all, with the step, the
default, who usually owns it, and the skill or tool that serves it.

**Write every decision into the brief** — `content/<project>/docs/brief.md`, one line each, with
who made it:

```text
| Music | original score, guitar and soft percussion | mine ("you decide"), 2026-10-20 | scoring-music |
| Shape | 1920×1080, wide                            | theirs, 2026-10-20               | —             |
```

The brief is what the next session reads instead of re-deciding. A choice marked *mine* that the
person later overrules is not a failure; a choice nobody can find written down is.

**The metaphor is theirs, always.** If a scene needs a symbol and none has been agreed, offer two or
three in a sentence each and let them pick. Never build a scene on a symbol you invented — a whole
film was once built on four metaphors nobody had agreed, and none survived the first viewing.

The full interview — what each answer rules in and out, what to do when an answer is impossible,
and when to stop and say a thing cannot be built — is in
[`reference/interview.md`](reference/interview.md).

## What to settle before you ask anything

Three things to say up front. Discovering them late is how someone ends up with a video they
cannot use — which has happened here.

- **The default is 1920×1080 — wide.** Any other shape — upright 9:16, square — can be built, but
  only if it is chosen before the first scene: every layout constant is authored for the shape,
  from the safe margins to the caption panel, so another shape is layout work, not a setting.
  **Ask the moment anyone mentions socials, Reels, TikTok, Stories or a phone**, and never offer
  to crop afterwards — a 16:9 explainer cropped to 9:16 loses both ends of every diagram and the
  captions with them.
- **About thirty seconds is the floor.** Under that the thing has to be raced and stops being
  watchable. Offer a still image instead.
- **They approve the result, not you.** Report technical faults — a broken file, the wrong size,
  missing audio. Never a verdict on whether it is any good.

## The steps, and what to reach for at each

Each step names the skill or the script that serves it. Reach for it at that step — not before,
when it would be guessing, and not after, when the decision it serves has already been taken by
default.

1. **Write the idea in one sentence.** It forces a decision about what the video is about. Start
   the brief (`content/<project>/docs/brief.md`) with it.
2. **Sketch it on paper.** One box per scene, by hand, rough on purpose. Deciding the order of
   ideas, not the artwork. They can do this or it can be worked out from their answers — but a
   sketch of their own is the fastest route to the film they actually pictured, and it costs ten
   minutes. Changing your mind at this stage costs a pencil line.
3. **Write the story in words, and get it approved — before any picture or scene exists.** What
   happens, in what order, and why anyone watching should care, as plain prose, a paragraph or
   two. Not a list of beats: a list of beats approved is not a story approved, and pictures built
   on unagreed beats are the most expensive mistake on record here (three rejected versions of one
   film, then a fourth that worked because its story was approved in prose first). **This is a
   gate. Nothing in steps 4–9 starts until they have said yes to the words.**
4. **Pick how it looks** → `choosing-a-visual-style`. It ends with a style card in
   `content/<project>/docs/style.md`.
5. **Turn the story into a shot list and a script.** What is on screen in each scene, in what
   order, roughly how long — and separately, every word that will appear. **For a film with no
   voice that second document is the entire script.**
6. **Settle where the pictures come from** → `creating-assets`, including whose world they show.
7. **Get the pictures made.** Work out *what* the film needs rather than asking them to guess it.
8. **Add narration, if it wants one** → `adding-narration`. It comes before building, because a
   voice decides how long a scene is and therefore has to exist before anything is timed to it.
   `scripts/tts-generate.mjs`, then always `scripts/tts-verify.mjs`.
9. **Describe the film back, then build one scene first** → `building-scenes`. A short paragraph
   per scene, what is on screen and how it moves; then build the scene that carries the most —
   usually the opening — and put it in front of them **before building the rest**. A style that
   fails on one scene fails on all of them, and one scene is the cheapest place to learn it.
10. **Score it, if it has music** → `scoring-music`. The score is written against the picture's
    own timeline, so it comes once scene lengths exist. If they chose to cut picture *to* a
    piece of music instead, this step moves up to sit before step 9 — say which order you are
    using.
11. **If it is interactive** → `making-interactive-video`: where the viewer chooses, and what each
    choice plays. Decided with the story at step 3; built once the scenes it branches between
    exist.
12. **Watch it, and take notes in ordinary words** → `viewing-and-rendering`. Repeat until it plays
    right. Many times. Three rounds on the timing of one movement is normal. Rounds are how the
    thing gets found, not evidence of going wrong.
13. **Render, measure, finish** → `viewing-and-rendering`. `scripts/check-render.mjs` reports what
    can be measured — size, length, black or frozen stretches, silence, loudness — before anyone
    watches; `scripts/finish-video.mjs` brings the file to the delivery standard. Then hand it
    over, and they judge it.

## Step 9 is the cheapest review in the project

The scene descriptions are the last point where a disagreement costs a sentence. **A scene wrong in
a paragraph is a rewrite; the same scene wrong on screen is a rebuild.** Put them in front of the
person and wait, rather than describing and continuing in the same breath.

"Make it in one pass" removes the waiting between steps, not the gates at steps 3 and 9. What comes
out of one pass is still an unreviewed draft, and is reported as one.

## The honest scale of this

About a day and a half, two people, idea to finished 70-second film — on a project where the style
was brought in rather than invented and the tooling already existed. Worth saying up front, so
someone can tell whether they are starting an afternoon or a month.

Seven working sessions, four different target lengths, and one complete rejection of a finished cut
also happened inside that. **Going wrong repeatedly is the normal shape of this work.**

## What belongs to the person

Meaning, humour, pace and metaphor. Whether a line reads, whether a joke lands, whether a scene is
too busy. Report whether the thing works as built; leave the verdict on whether it is good. Expect
most of their time to go on watching and saying what is off — see `working-practice`.

## Reference

- [`reference/interview.md`](reference/interview.md) — the full question-by-question workflow:
  when to start, whether it can be built at all, and the rules for the whole conversation.
- [`reference/decisions.md`](reference/decisions.md) — every decision a film involves, the step
  it arrives at, its default, who usually owns it, and the skill or tool that serves it; and the
  brief file that records them.
- [`topics/`](topics/) — ready-made subjects for someone with no particular idea.
