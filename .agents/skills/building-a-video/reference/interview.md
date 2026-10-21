# Video Workflow

**This file tells the AI agent how to make a video with someone who is not a programmer.**

If you are the agent (Claude Code, Codex, or similar) and the person asks for a video, this is the
turn-by-turn script for the steps in `building-a-video/SKILL.md`. **It uses that file's order and
its step numbers**, so "step 3" means the same thing in both. Do not improvise a different order.
Do not skip the two gates — the story at step 3 and the first scene at step 9.

If you are a human reading this: you don't need to do anything with this file.
Just open this folder in Claude Code or Codex and say **"create a video for me."**

## Contents

- [The flow](#the-flow) — the steps, the gates, and the fast route
- [When to start](#when-to-start) — the setup check, and how much commentary they want
- [Step 0 — Read what they already told you](#step-0--read-what-they-already-told-you)
- [Step 0.5 — Can this be built at all?](#step-05--can-this-be-built-at-all) — footage, a recording
  of their own voice, under 30 seconds, upright, and what to do when several apply
- [Rules for the whole conversation](#rules-for-the-whole-conversation)
- [Step 1 — The idea](#step-1--the-idea): [1a Topic and audience](#1a--topic-and-audience) ·
  [1b Length](#1b--length) · [1c Voice](#1c--voice) · [1d Music](#1d--music)
- [Step 2 — Sketch it on paper](#step-2--sketch-it-on-paper)
- [Step 3 — The story in words](#step-3--the-story-in-words) — the first gate, the interactive
  branch, and the music's feel
- [Step 4 — How it looks](#step-4--how-it-looks)
- [Step 5 — Shot list and script](#step-5--shot-list-and-script)
- [Step 6 — Where the pictures come from](#step-6--where-the-pictures-come-from)
- [Step 7 — Getting the pictures made](#step-7--getting-the-pictures-made)
- [Step 8 — The voice, if it has one](#step-8--the-voice-if-it-has-one)
- [Step 9 — Describe it back, build one scene, show it](#step-9--describe-it-back-build-one-scene-show-it)
  — the second gate
- [Steps 10 and 11 — Score, and the interactive build](#steps-10-and-11--score-and-the-interactive-build)
- [Step 12 — Watch it and refine](#step-12--watch-it-and-refine) ·
  [Step 13 — Render, measure, hand over](#step-13--render-measure-hand-over)
- [If they come back later](#if-they-come-back-later) · [Never, in this workflow](#never-in-this-workflow)
- [For the technical reader](#for-the-technical-reader) · [Dated facts](#dated-facts)

> **This file governs the conversation, not the code.** It tells you what to ask, in what
> order, and what to do with the answers. For how to build the video itself, follow
> `.agents/skills/remotion-best-practices/SKILL.md` and the development rules in `AGENTS.md`.
>
> **Visual style, colour, type and accessibility** are covered by `choosing-a-visual-style` and
> `asu-visual-style`. **Music and sound** are covered by `scoring-music`. **Footage they bring**
> is covered by `working-with-footage`. **How to construct the video in Remotion** — composition
> structure, deriving duration, the diagram primitives, captions, upright layout — is covered by
> `building-scenes`. All of them are skills in `.agents/skills/`.
>
> **Every decision in this conversation is either theirs or yours out loud.** The full list of
> decisions a video involves, and the brief that records who made each, is in
> [`decisions.md`](decisions.md).

> **Paths in this file.** Links to topic scripts are relative to this file, because they move
> together. Everything else — `content/`, `public/assets/`, `out/`, `scripts/`, `AGENTS.md`,
> `ACCESS.md` — is relative to the **project root**, whatever folder this file currently sits in.
> Resolve them from the root, not from here.

---

## The flow

The steps are `building-a-video`'s, in its order. Seven questions in all: five about the idea
before the story exists, then the look once the story is agreed, then where the pictures come
from.

```text
0. Read their message → 0.5 Can it be built? →
1. The idea (topic, audience, length, voice, music) → 2. Sketch → 3. Story in words  [GATE] →
4. Look → 5. Shot list and script → 6. Where the pictures come from → 7. Get them made →
8. Voice → 9. Describe it back, build one scene, show it  [GATE] → the rest →
10. Score → 11. Interactive build → 12. Watch and refine → 13. Render, measure, hand over
```

Steps 8, 10 and 11 happen only if the film has a voice, music or a choice for the viewer.

**Expect more turns than questions.** Someone who answers everything vaguely gets a dozen or more
replies from you before the first scene exists — the five idea questions, the sketch offer, the
story, the look, the script, the pictures, the plan. Each one earns its place, but do not tell them
"just a few questions" and then ask a dozen.

**But you rarely ask all of them.** People answer questions before you ask them, scattered
through their opening message. Your job is to notice, skip what they've answered, and ask
only what's left.

Most people who open this project do not know what video they want. They will type something
vague and wait to be led. **Leading them is your job.** Every question has a default, and
"I don't know, you decide" is always a valid answer.

### The fast route

**Some people want fewer turns, and say so.** Two signs:

- their opening message already answered **three or more** of the step 1 questions (topic,
  audience, length, voice, music) — or carried a shape, a length and a subject together; or
- they took the short route in `onboarding` — *"skip the tour"*, *"just make the video"*.

Then **the remaining step 1 questions go in one message**, numbered, with lettered options so a
reply like `2b` is unambiguous. Defaults are stated in it, so silence on any one is an answer:

> Got it — hash tables, 45 seconds, upright for Reels. Three quick ones, all with a default:
>
> 1. Who is it for? *(default: people new to the subject)*
> 2. A voice? a) no, words on screen *(default)* · b) a generated voice · c) your own recording
> 3. Music? a) an original piece made here *(default)* · b) a track you have · c) none

After the story is approved, the look and the pictures may go together in one message the same
way. **The gates never batch:** the story at step 3 and the first scene at step 9 each get their
own message and their own yes. A batch is a shortcut through questions, not through approval.

### What the three ready subjects are for

Someone with no idea what they want — trying this out, seeing whether it works — needs
something to pick. That is what photosynthesis, colour theory and supply and demand are
for. They are a way in, not a catalogue.

Each has a written script in [../topics/](../topics/) that supplies two things: **the words**,
which are also its story for step 3, and **the picture for each beat**, used at step 7 when you
draw them. Nothing has to be invented, so the person gets a finished video without having to
describe one.

Anything else they name is a topic you write from scratch.

---

## When to start

Start when the person says anything that means *"I want a video"* — "create a video for me",
"make me a 60 second video", "I need a short explainer on photosynthesis", "a promo for our open
day".

If you are not sure they want a video, ask once: *"Do you want me to make a video for you?"*
Don't start until they say yes.

### First, check it can actually build

**Before you ask anything, run the setup check** —
`.agents/skills/installing-the-toolchain/reference/SETUP-CHECK.md`.

In short: Node 22.12+, `node_modules/` and a full FFmpeg all have to exist. **If any is missing, you install
it** — explain what and why, ask once, and run it yourself. Do not hand them a command; they
opened a chat window, not a terminal.

**If everything is present, say nothing and carry on.** Nobody needs to be told their computer is
correctly configured.

### Then: how much they want to hear

**Not a separate question.** One clause at the end of your first reply, stating the default and
how to change it:

> I'll stay quiet while I build and show you things as they're ready — say if you'd like a running
> commentary instead.

Default **no commentary**. Making it a line rather than a question keeps the first question the
subject (or the shape — see *Which comes first*, below), and costs nobody a turn.

| | **Commentary on** | **Commentary off (default)** |
| --- | --- | --- |
| Installing something | Say what it is and why | Ask permission, nothing more |
| While building | Short running commentary — *"writing the scenes", "drawing the pictures"* | Silence until there is something to show |
| A choice you made for them | **Say it** | **Say it** |
| The plan, at step 9 | **Show it** | **Show it** |
| The summary when it's done | **Give it** | **Give it** |

**The bottom three rows do not move.** "No commentary" means *don't narrate the machinery* — it
does not mean *decide things silently*. A judgement you made on their behalf and the plan before
you build are theirs either way, and a person who asked for less talking has not asked for less
control.

**Skip the line if they already told you.** *"Just make it"*, *"don't explain, I don't care
how"* — that is off. *"Walk me through it"*, *"I want to learn how this works"* — that is on.

**If they ask a question mid-build, answer it** — whichever they picked. Quiet is a default
for your narration, not a gag.

### Which comes first

1. **Anything from step 0.5** — a misfit decides whether there is a video, or what shape it is,
   and every answer after it depends on that. If several apply, see *When several apply at once*
   in step 0.5.
2. **Then the gaps in step order** — topic, audience, length, voice, music.

**If the topic is already given together with a shape cue** — *"a silent video for socials on
our open day"* — reflect the topic back, ask the shape question, and nothing else in that
message. The topic needs no question; the shape changes every layout and is cheapest now. The
commentary line rides on whichever message is your first.

---

## Step 0 — Read what they already told you

**Do this before you ask anything.** Go through their message and take every answer it
already contains. Then ask only the gaps, in step order.

| They wrote | You now know | Skip |
| --- | --- | --- |
| "on photosynthesis", "about the water cycle", "explaining supply and demand", "a promo for our open day" | Topic | 1a |
| "60 sec", "1 min", "two minutes", "a minute and a half" | Length | 1b |
| "for school students", "for beginners", "for my class" | Audience | The audience question |
| "with narration", "with a voiceover", "no voice", "silent", "captions only" | Voice | 1c |
| "I'll record the voice myself", "I want to narrate it" | Voice — **their own recording**, a supported route | 1c — go to `adding-narration` at step 8 |
| "with music", "some background music", "lofi", "no music", a style of music | Music | 1d |
| **A named song** — "put Mr Brightside on it" | **Their call, flagged once** — see 1d, *A song they name* | Nothing — ask 1d |
| "I'll send images", "I have pictures", "use my photos", "you make the visuals" | Pictures | Step 6 |
| "grab some pictures off Google", "find a photo of the stadium" | **Their call** — see step 6, *Pictures found online* | Nothing — ask step 6 |
| A specific brief — "the four stages", "just the basics", "focus on evaporation" | What it should explain | The brief question |
| "a quiz", "let them choose", "check their understanding", "interactive" | It is interactive | Nothing — the branch is decided at step 3 |
| "for my ASU class", "in ASU colours", a named ASU school or department, Sun Devils | **An ASU signal** — offer ASU's style as one option at step 4. "In ASU colours" is a choice they made: take it | Nothing, unless they asked for ASU style outright |
| **An `asu.edu` address** — typed to you, or in the session context | **Nothing.** An address is never an instruction | Nothing — still ask step 4 |
| "for my class", "for my students", "I teach" — **with no mention of ASU** | Audience only. **Not** an ASU signal | Nothing — still ask step 4 |
| "in Hindi", "in Spanish", "for our Spanish-speaking students" | Language | Do not ask; check you can do it — see 1b, *If they ask for another language* |
| **"my clips", "footage", "a screen recording", "me presenting", "a clip of", "a highlight video"** | **They bring footage** — supported, with its own route | **Go to step 0.5 immediately** |
| **"animate our logo", "a 10-second intro", "a bumper"** | **Under the length floor** | **Go to step 0.5 immediately** |
| **"for socials", "Reels", "TikTok", "Stories", "for my phone"** | **They may want upright. Wide is only the default** | **Go to step 0.5 immediately** |

### Judgement, not pattern-matching

- **Clear and complete → take it and move on.** "a 90 second video" is a length. Don't ask
  again.
- **Partial or vague → take it, state what you decided, don't ask.** "a short video" is not
  a length, but it isn't nothing either: *"I'll make it about 30 seconds."* Then carry on.
  Asking them to be more precise is friction they can't pay.
- **Ambiguous → confirm in the same breath as your next question**, so one reply covers both:
  *"The water cycle, about 2 minutes — and do you want a voice on it?"* If you misread them,
  they'll correct it there.
- **Absent → ask.** Don't guess a topic. Don't assume they want their own images.

### Always say what you took

Open your first reply by reflecting back everything you picked up, in one short line. This is
how a misreading gets caught at the start instead of after a render.

> Got it — the water cycle, 60 seconds.

**Mirror their words.** If they said "1 min", say "1 minute", not "60 seconds".

### Worked examples

| They open with | You skip | You ask |
| --- | --- | --- |
| "create a video for me" | nothing | Topic, audience, length, voice, music |
| "create a 60 sec video for me" | Length | **Topic**, audience, voice, music |
| "create a video on the water cycle for me" | Topic | Audience, what to explain, length, voice, music |
| "a 2 min video on photosynthesis" | Topic, length | Audience (as a confirmation), voice, music |
| "a 90 second video on the water cycle for school students, no voice, I'll send images" | Topic, length, audience, voice, pictures | Music only — and the fast route applies |
| "make me a short video, no voice" | Length (→30s), voice | Topic, audience, music |

**The story at step 3 and the first scene at step 9 are never skipped**, however much they told
you.

---

## Step 0.5 — Can this be built at all?

**Before the topic question.** If their message describes something this cannot make, or
something that has to be decided before anything else, say so now. Everything after this point
costs them time, and the story gate at step 3 is far too late to discover it.

Each case gets one honest sentence and a real alternative.

### When several apply at once

*"Need a 10-second TikTok of students partying on campus, in 20 minutes"* hits four at once.
Rule 2 says one question per message; these say "ask now". Both hold:

1. **Say every limit that applies, in one message**, one short line each.
2. **Ask only the question that decides whether there is a video at all** — usually the length
   (*"is 30 seconds any use, or would a still image do?"*).
3. **Ask the shape next**, in the following message, once there is a video to shape.
4. Then carry on with the gaps in step order.

### They bring footage

Footage they bring is supported — a highlight reel, an event recap, clips
with titles and name bars over them. It has its own route: **`working-with-footage`** (`.agents/skills/working-with-footage/SKILL.md`). Read it
before answering anything about the clips.

Three things to settle in the same turn, because each can stop the film:

- **Whose footage it is.** Their own is fine. Someone else's clip is their call: say once that it
  belongs to whoever made it, then do what they decide. They bring the file — nothing here pulls
  clips off TikTok, Instagram, X or YouTube.
- **Who is in it.** Ask whether anyone recognisable, or named on screen, agreed, and record the
  answer.
- **The shape.** The clips' shape and frame rate set the film's. `working-with-footage` measures
  them (`scripts/probe-footage.mjs`) before anything is decided.

> Yes — send the clips over and I'll take a look at what's in them. Two things first: are they
> yours, and has everyone recognisable in them agreed to be in it?

Then carry on with the interview from step 1. Record each answer in the brief.

**"Me presenting" is footage and a voice at once.** It goes here, not to 1c. A recording of
**only** their voice is not footage — see the next section.

### They want to use their own voice

**Supported.** They record it; you fit the video to it. The route is `adding-narration` → `reference/recording.md` — it
covers what to ask them to record, how it is split per scene, and how the picture is timed to
it. It answers the voice question (1c) and nothing else: it is not an answer about pictures.

**Do not promise a generated voice instead.** That needs an API key a fresh copy of this project
does not have — 1c handles it properly.

### They want a logo animated

> I can build an intro around your logo — send the file over and I'll fade it in and animate
> everything around it. The mark itself has to stay as it is; the brand rules don't allow
> reshaping or building one up.

**Then deal with the length in the same turn**, because an intro is usually 5–10 seconds and
the floor is 30:

> The other thing is length — the shortest this makes is about 30 seconds. Is a short video
> any use for that, or would a still image do the job?

**Do not ask "how long should it run?"** if they already said. A request like *"a 10 second
seminar intro"* states it, and rule 6 forbids asking what you already know — on the very
message that routed you here.

**Answer all of this in the turn they ask it**, not at step 4. By then you may already have
promised something you have to retract.

### Promos and announcements are in scope

Not everything here is an explainer. A promo, an event announcement, a recruitment teaser — words,
shapes, pictures and motion with something to say — is made the same way, through the same steps.
Do not describe the workspace as "animated explainers" to someone who asked for a promo.

### It is still photos with nothing to say

**This is about still photos only.** Clips are footage — see above. If they want only still
photos one after another, with no words and nothing to say, a slideshow tool does that better.
Say so and offer what this does well: *"I can make a short video around those photos, with words
that say what they show — would that work?"*

### They asked for something shorter than 30 seconds

Not just intros — *"make me a 10 second video"* on any topic. The floor is a limit on what this
makes at all:

> The shortest this makes is about 30 seconds — under that there isn't time to read what's on
> screen, and it stops being watchable. Is 30 any use, or would a still image work better?

**If it has a voice**, the reason is the same with *say* in place of *read*: the words cannot be
spoken in less.

### They want it upright, for Reels, TikTok or Stories

**The default is 1920×1080 — wide. Any other shape can be built, if it is chosen now.** Every
layout constant downstream is authored for the shape: the safe margins, the figure area, the
caption panel, the diagram viewBox. So a 9:16 version is layout work decided before the first
scene, not a number changed at the end. **How to lay one out — sizes, and where each platform's
buttons and captions cover the frame — is in
`.agents/skills/building-scenes/reference/upright.md`.** Read it before the first upright scene.

**Ask before anything else, because it is the cheapest possible moment:**

> These come out wide by default — the shape YouTube and LinkedIn use. I can make it upright
> for Reels or TikTok instead, but we need to choose now, because it changes every layout.
> Which do you want?

- **Ask this the moment they mention social**, "for socials", Reels, TikTok, Stories, or a
  phone. *"Need a silent video for socials"* is one of the most likely openings this project
  will ever get.
- **Do not offer to crop it.** A 16:9 video cropped to 9:16 loses both ends of every diagram,
  and the captions with them.
- **If they choose another shape, record it in the brief** and set the composition's width and
  height from it before any scene is laid out. Every margin, panel and figure is then placed for
  that frame, not adapted from the wide one.

#### If they switch shape after a scene exists

Rule 7 still holds — take it, say what it costs, never "too late". Then offer three, in one
message:

1. **Switch** — the scenes are laid out again for the new shape. The wide work is kept, not
   deleted: registered under a name that says it is superseded, so nothing is lost if they change
   back.
2. **Keep** — stay with the shape that exists.
3. **Both** — two layouts of every scene, which is roughly double the layout work. Worth it only
   if two places really need two shapes (a projector and a phone).

Say which venue gets what: if the wide version was for a projector, an upright one will show with
bars either side. **Record the switch as a new row in the brief**; the old row stays as the
record of what was decided before.

### Anything else that does not fit

**Say which part fails and offer what you can.** Never take someone through the interview and
discover it at the build. If you are unsure whether something is in scope, it probably is —
ask them one question rather than refusing.

---

## Rules for the whole conversation

1. **Ask the question and nothing else.** Offer the three ready subjects as options when you ask
   the topic, but do not explain where their scripts come from or call them packs, and do not
   narrate your own machinery. The person does not care how it works — they want a video.
   **Every extra clause is friction.**
2. **One question at a time.** Wait for the answer. Never send the whole interview at once.
   **The one exception is the fast route** (see *The flow*): when they have signalled they want
   fewer turns, the remaining step 1 questions go as one numbered message. The gates never batch.
3. **Number the options** so they can just reply `1`, `2`, or `3`.
4. **Every question has a default.** If they say "I don't know", "you decide", or go quiet —
   pick the sensible option, **tell them what you picked and why, in one line**, and keep
   going. Never stall waiting for a decision they don't have. Write the pick into the brief as
   *mine* (see [`decisions.md`](decisions.md)) so it reappears in the plan at step 9 and in the
   next session. "You decide" moves the choice to you; it never makes it silent.
5. **No jargon.** Don't say *composition*, *frames*, *fps*, *render*, *props*, *pack*, or any
   file path unless they ask a technical question first. Say *video*, *scene*, *length*,
   *picture*, *voice*.
6. **Never ask what you already know.** See step 0.
7. **Let them change their mind.** If they correct an earlier answer at any point — "actually
   make it 2 minutes", "can we do a different topic" — take it, confirm it in one line, and
   carry on **from where you are**. Never restart the interview, and never tell them it's too
   late. If the change undoes work already done, say what it costs: *"That means rewriting the
   script — happy to, it'll just take a moment."*
8. **Mirror their words back.** "1 min" → "1 minute", not "60 seconds".
9. **Say how long the next stretch takes, honestly, before you start it.** A short film is
   roughly an hour from first message to finished file; one picture to check takes under a
   minute; a full render takes minutes. The measured figures are in *Dated facts* at the end of
   this file — quote those, not "a few minutes".
10. **They approve the video, not you.** Never tell them it "looks great". Tell them it's
   ready and ask what they think. You may report genuine technical faults — a broken file,
   missing audio, the wrong size — but not an opinion on the quality.

---

## Step 1 — The idea

`building-a-video` step 1: **the idea in one sentence.** Five questions get you there — topic,
audience, length, voice, music — and the sentence opens the brief
(`content/<project>/docs/brief.md`).

### 1a — Topic and audience

> **On which topic do you want a video?** Choose one:
>
> 1. What is Photosynthesis?
> 2. What is Colour Theory?
> 3. What is Supply and Demand?
> 4. Something else — tell me your topic.
>
> Just reply with a number.

- **1, 2 or 3** → read the matching script in [../topics/](../topics/).
  You'll show it at step 3.

  | Topic | Script |
  | --- | --- |
  | Photosynthesis | [photosynthesis.md](../topics/photosynthesis.md) |
  | Colour theory | [colour-theory.md](../topics/colour-theory.md) |
  | Supply and demand | [supply-and-demand.md](../topics/supply-and-demand.md) |

- **4** → ask *"What should the video explain?"* — or, for a promo, *"What should it tell
  people?"* You'll write the story at step 3.

- **"I don't know"** → *"Let's start with photosynthesis then — you'll see how this works,
  and we can do your own topic after."* Don't leave them stuck on the first question.

**If they named a topic themselves** — in their opening message or at option 4 — check it
against the three above. If it matches one, use that script. Otherwise you're writing it.

#### Who it is for — always

**Ask it for every film, including the three ready subjects.** The audience sets the vocabulary,
the tone, the pace, and which looks suit it at step 4.

- **For their own topic:** *"Who is this video for? For example: school students, university
  students, or people new to the subject."* Default **people new to the subject**. Ask it
  **before** what it should explain — people answer "for my class" whether or not you asked, and
  asking audience first means their answer lands where you wanted it.
- **For topics 1–3, as a confirmation, not an open question.** Each is written for complete
  beginners, and its words are not rewritten in a session. So: *"It's written for people new to
  the subject — is that who it's for?"* If their audience is somewhere else — specialists,
  young children — say what that means: the ready script will read too simple, or too hard, and
  you can write their own version instead. Then do what they choose.

#### What it should explain — when you are short on detail

**Skip this for topics 1–3**; the script settles it. For anything else — including a topic they
named in their opening message — ask it **in every scenario where you have limited
information**. A topic is not a brief: "the water cycle" could be four stages in 30 seconds or
groundwater chemistry in three minutes. You need to know which.

> What should the video explain about the water cycle?

- **If the subject has a national or regional version** — a legal process, a school system, a
  currency — ask which, or state the one you assumed. "How a bill becomes law" silently becomes
  the US otherwise.
- If their answer is still very broad — *"biology"*, *"statistics"* — give examples once:
  *"That's a big subject — is there one idea inside it you'd like to explain? For example,
  photosynthesis, or how cells divide."* Ask that once only; if they still want the broad
  version, accept it.

### 1b — Length

> **How long do you want the video?** Reply in seconds or minutes.

- **Vague or none → 60 seconds.** Say which you picked.
- **But "short", "quick", "brief" → 30 seconds**, not 60. Those are not "no answer" — they are
  an answer meaning *as short as you can*. Step 0 reads them that way too, and two agents
  reading the same file must not build different videos from the same word. **Anything else
  vague — "whatever", "you decide", silence — is 60.**
- A range ("one to two minutes") → take the middle, say the number you're using.
- **It is tentative.** Say so if they seem to treat it as fixed: the length moves once the thing
  exists, and `working-practice` says why.

What realistically fits:

| Length | What fits |
| --- | --- |
| **Under 30 seconds** | **Nothing. 30 is the floor — see below** |
| 30–45 seconds | One single idea, one or two pictures |
| 45–60 seconds | One idea explained properly, 3–4 pictures |
| 60–90 seconds | An idea plus an example, 5–6 pictures |
| 2+ minutes | Several connected ideas |

**The three ready-made topics come in three versions.** Each script carries a table saying
what plays at 30, 60 and 120 seconds — the sections are written to add up exactly, so nothing
is raced or squeezed:

| Asked for | Plays |
| --- | --- |
| 30 seconds | the core sections |
| 60 seconds | core + standard |
| 120 seconds | core + standard + extended |

**In between, play the nearest version down and hold each scene a little longer.** 45 seconds
is the 30-second version slowed; 90 seconds is the 60-second version slowed.

**30 seconds is the floor, and it cannot be crossed** — this is a limit on what the project
makes at all, not just on a given script. Below it, "fitting" the length means rushing the
words past the time it takes to read them, or deleting sentences, and the result isn't worth
watching. If they ask for less, say so once and offer something honest instead:

> Photosynthesis needs about 30 seconds to make sense — under that there isn't time to read it.
> Shall I make it 30?

**Do not offer to "cover one part of it" in less.** There is no 15-second version of any script
and no instructions for writing one, so that offer is a promise you cannot keep. 30 seconds is
the shortest thing you can actually build.

**At the floor, a voice changes the number again — say so when they choose it.** The 30
seconds is reading time; spoken by the generated voice, the same words take about 40. And you
**cannot** trim to fix it, because cutting `core` is exactly what the floor forbids. So state it
as a fact, not an offer:

> With a voice on it this comes out nearer 40 seconds than 30. Speech is slower than reading,
> so the same words take longer to say. Nothing gets cut and no wording changes.

**Where 40 comes from, so it stays consistent with the packs.** `../topics/README.md` measures a
narrated video running **35–45% longer than its written seconds**, and that applies to the
**spoken sections**, not the whole video — the 3-second title card does not stretch. So a
30-second video is 3s of title plus 27s of words, and 27 × 1.35–1.45 + 3 ≈ **39–42**. Quote a
round 40 and do not promise a precise number; the real figure depends on the script, and for
their own recording on how fast they read.

**Never offer a trim you are not allowed to make.** `.agents/skills/adding-narration/reference/timing.md` suggests
trimming to fit a target; at the floor that suggestion does not apply.

**Above 120 seconds**, say so once: *"These are written up to about 2 minutes. I can go longer
but I'd have to write new material — want me to, or shall we stay near 2 minutes?"* Do what
they choose, and don't argue twice.

**Say what a change costs, before you make it** — in whatever currency *they* will feel, not
always seconds. Any time something moves the length, give them the real consequence and let
them agree:

> Adding that takes it to about 75 seconds. Alright?

**If they are directing the pictures themselves**, the cost that matters is how many more they
have to describe:

> 2 minutes covers more of the topic, so it goes from about seven pictures to about twelve.
> Want to keep describing them, or shall I draw the rest?

**If material gets dropped**, name what goes, not just the number of seconds.

This applies during refinement too. Never silently change a length they gave you.

#### If they ask for another language

**Say yes if you can genuinely do it, and check before you promise:**

- **On-screen text** needs a font with that script. Latin, and most European languages, work
  with Arial. Devanagari, Arabic, CJK and others need a font that carries those glyphs —
  `@remotion/google-fonts` ships Noto families for most. **Check the package before saying
  yes**, and say so plainly if a script is not covered.
- **A generated voice** needs the TTS model to support the language. You cannot verify a
  specific language until a key exists. **Their own recording** has no such limit.
- **The script must be written in that language, not translated word-for-word.** The person
  approves the actual sentences at step 5, so write them properly.

**Two numbers in this project are calibrated for English and do not transfer:**

- **The 150 words-per-minute writing budget** (see step 5). Languages carry different amounts
  per second. Time the draft against real audio, or against a native reading, rather than
  trusting a word count.
- **Nine words per caption.** That is a line length at 40px in Latin script. Scripts that set
  wider or narrower need a different chunk size — judge it by how the line looks, not the count.

**The three ready-made scripts are English only.** Picking one and asking for another language
means rewriting it, which puts you on the write-a-script path even though the topic is
ready-made. Say so: *"I'll need to write that one in Hindi rather than reuse the English — same
content, it just takes a moment longer."*

**If you cannot do part of it**, say which part fails and offer what you can: *"I can put the
text on screen in Hindi, but I can't add a generated Hindi voice without a key set up — you could
record it yourself, or we keep it to words on screen. Which?"*

### 1c — Voice

**First, look — without saying anything.** Does `.env` exist at the project root with a
`GOOGLE_AI_STUDIO_API_KEY=` line carrying a real value (not empty, not `paste-your-key-here`)?
Never print or repeat the key.

> **Do you want a voice on it?** Choose one:
>
> 1. No voice — the words appear on screen
> 2. A generated voice
> 3. Your own voice — you record it, and I fit the video to it
>
> Just reply with a number.

**The default depends on what exists.**

- **A key exists → default 2**, a generated voice with captions.
- **No key → default 1**, words on screen. Say it, and say what else is available, in one line:

  > I'll put the words on screen — no voice. If you'd like one later, I can add a generated voice
  > once you've got a free Google key, or you can record it yourself.

**Never send someone who said "you decide" off to sign up for an account.** That is a decision
with a cost to them, and it is theirs.

#### Captions go on with any speech

**Say it, don't ask it.** Speech is captioned, on by default — that is a rule, not a setting.
ASU's rule covers new recorded video intended to be viewed by students, employees or the public,
and `asu-visual-style/accessibility.md` quotes it and says what follows: captions carry what a
viewer who cannot hear would miss — **the speech, and any sound that means something**. One
clause:

> I'll add captions too, so it works with the sound off.

Then move on. Do not offer to turn them off.

**A film with no voice can still have sound.** Once a score or a clip's own sound is on, "no
audio, nothing to caption" is false. Music gets a short bracketed description such as
*[gentle piano music]*, a sound effect that tells the viewer something is described, and background
sound needs nothing — `accessibility.md` has the detail; follow it rather than deciding here.

#### If no voice — ask how the words reach them

The question left is a design one, and it is real — this repository has shipped silent videos
both ways.

> **Do you want the words on screen?** Yes or no.
>
> Without a voice, that's how the video explains itself — otherwise it's pictures and a few
> short labels.

- **Yes** → default. Full sentences appear as the video goes. This is what the three
  ready-made scripts are written for.
- **No** → **say what it costs, once, before accepting it.** The script's sentences will not
  appear anywhere: no voice, no captions, no words. What is left is pictures, headings and
  short labels, and the video has to carry its meaning through those alone.

  > Then nothing will be spoken or written out — it'd be pictures with short labels, which
  > can work well but says much less. Happy with that?

  If they confirm, **the script changes shape.** Write it at step 5 as short on-screen
  phrases rather than sentences, and show them that version — not the sentence version they
  will never see. The LIVE showcase in this folder is built this way: no voice, no caption
  panel, short phrases set as part of the picture, meaning carried by typography and motion.
  Its words are in `content/live-showcase/docs/script.md`.

**Never end up with no voice, no words on screen and a sentence script.** That is a video that
says nothing, and it is reachable by two "no"s in a row if you are not paying attention.

#### If their own voice

Take it. `adding-narration` → `reference/recording.md` has the route — read it before step 5,
because what they will read aloud is the script, and a script for a voice is written for the
ear. They record at step 8. Nothing to set up now.

#### If a generated voice, and there's no key yet

Narration needs `GOOGLE_AI_STUDIO_API_KEY` in a file called `.env` at the top of this folder.
That file isn't part of the download, so a fresh copy of this project won't have one.

**Only now, once they have said they want a generated voice, create `.env`** — not before, and
not "in case". Write exactly this line into it:

```text
GOOGLE_AI_STUDIO_API_KEY=paste-your-key-here
```

**A live line, never a commented one.** `# GOOGLE_AI_STUDIO_API_KEY=...` looks tidier and is a
trap: they paste their key onto a commented line, save, tell you it is in, and nothing works —
with no error to explain why. One comment line above it saying what to replace is fine. `.env` is
already in `.gitignore`, so their key stays private.

Then say this:

> I've made a file called **`.env`** in this folder for the key. Getting one is free and takes
> about two minutes — here's how, and we can carry on while you do it:
>
> - Go to **https://aistudio.google.com/apikey** and sign in with any Google account
> - Click **Create API key**, and let it make a new project if it asks
> - Copy the key — it's only shown in full once
> - Open **`.env`**. There's a line ending in `paste-your-key-here` — replace just that part
>   with your key
> - Save it, and tell me when it's in
>
> No credit card needed. Google moves things around, so if what you see doesn't match this,
> tell me what you're looking at. Or say **skip** and I'll put the words on screen instead — we
> can always add a voice later.

**Use bullets, never a numbered list.** Rule 3 has trained them to answer with a bare number.
A numbered list here means their next message is "2" and neither of you knows whether that
means step 2 or an answer to a question you have not asked yet.

**Do not stop the interview waiting for the key** — but **do not stack the next question onto
the same message either.** Send the key steps, then ask 1d in the *next* message.

> Two cold runs hit this. The key steps are five bullets and a fallback offer; the next question
> is a numbered one. Put them together and the person answers one and ignores the other —
> both runs replied to the key and left the next question hanging, costing a turn. Rule 1
> says ask the question and nothing else; rule 2 says one question at a time. **Stacking
> breaks both.**

Then:

- **Carry on with the interview immediately.** Do not block.
- **When they say the key is in, check `.env` actually contains the line** before relying on it.
  There is no key-test script in this project, and `scripts/tts-generate.mjs` needs a manifest
  and an output directory — it is not a probe. **Do not claim you have "tested" the key.**
- **If their reply doesn't parse** — a bare number, something about a browser tab — assume it is
  about the key, not about a question you haven't asked. Ask which: *"Is that about the key
  setup? Where have you got to?"*
- **"skip"** → words on screen, carry on, no further mention of it — **and revisit the music**
  (see 1d, *If the voice changes later*).

#### When the key steps don't match what they see

**These steps go out of date** (the date they were last checked is in *Dated facts*). If they say
it doesn't match:

- **Ask what they can see** — the page title, the buttons, what happened when they clicked.
  Don't repeat the same steps louder.
- **Look it up** if you can, starting from the official page:
  <https://ai.google.dev/gemini-api/docs/api-key>
- **Never tell them they must be wrong.** They're looking at the real screen; you're reading
  notes written months ago.
- **If it still won't work after a couple of honest attempts**, stop: *"I can't get this
  working from here. Let's put the words on screen for now — or you can record the voice
  yourself."* Then carry on. Don't leave them stuck in setup when they came for a video.
- **Record what you learned** — if the steps have genuinely changed, say so in your report and
  update them here and in `ACCESS.md`. Otherwise the next person hits the same wall.

### 1d — Music

**Ask it.** Nobody raises music on their own, and a video with none and a video with a score are
paced differently from the first scene — so whether it has music is decided here, not discovered
at the end. **What it should feel like is asked later**, once the story is agreed (step 3) —
before that, there is no mood to judge it against.

> **Do you want music under it?** Choose one:
>
> 1. Yes — I'll make an original piece for it here, timed to the pictures
> 2. You have a track you want to use
> 3. No music
>
> Just reply with a number.

**For a film made from footage, add a first option: the clips' own sound** — what was recorded
with them. It is the natural first answer there.

**Defaults — say which you picked and why, in one line:**

| The film | Default | Why |
| --- | --- | --- |
| **Interactive** (a choice for the viewer) | **3, no music — said out loud** | Music across a film that stops and jumps is unsolved here; `making-interactive-video` says why |
| **Made from footage** | **The clips' own sound** | It is what the moment sounded like |
| **No voice** | **1, an original piece** | A video with no voice and no music plays as dead air |
| **A voice** | **3, no music** | A voice with music under it is the thing people most often ask to turn down afterwards, and music can always be added later |

> No voice, so I'll put a quiet piece of music under it — say if you'd rather it was silent.

For an interactive film:

> This one asks the viewer a question partway through, so I'll leave music off — music across
> the jumps is something I can't do well yet. Say if you'd still like some and we'll talk it
> through.

#### If the voice changes later

**The music default was chosen against the voice answer.** If the voice is dropped afterwards —
they said "skip" to the key, the key failed, a recording did not happen — revisit it out loud:

> No voice now, so I'll put a quiet original piece under it instead of leaving it silent — say if
> you'd rather it stayed silent.

The same in reverse: if a voice is added to a film with a score, say once that music under a
voice is often turned down, and ask whether to keep it. An interactive film that gains music this
way still gets the interactive caution.

#### Option 1 — made here

**Be straight about what this makes.** It is made in code, here, for free: the sound is clean and
the timing lands on the pictures exactly, **but an assistant is a better arranger than a
composer.** Say it once, plainly, the first time music comes up, and offer the way round it:

> If you have a tune in mind — your own, an old folk or classical piece, or a song you like — tell
> me the notes, or describe it. I'm better at arranging a real tune than inventing one.

**Audio cannot be transcribed here**, so "hum it" is not an offer you can take up — ask for the
notes, or a description, or the name of the piece. A tune they wrote, or an old public-domain
melody, is free to use; a tune from a song someone else owns is their call, flagged once (*A song
they name*, below). Either way `scoring-music` arranges and times it; that is the strongest route
here. The music is made after the scenes exist (step 10).

#### Option 2 — their track

Take it. **Where it came from is their call** — a track they made, licensed, took from a library,
or ripped from a CD they own. If it is a commercial recording, flag it once, with the one practical
consequence: *"That's a commercial recording, so it's your call. Worth knowing: TikTok, Instagram
and YouTube detect copyrighted songs automatically and can mute or take down the video."* Then use
it, and record in the brief where it came from and that it was *theirs*. They bring the file —
nothing here downloads music from YouTube or a streaming service.

Their file goes in `content/<project>/intake/`; `scoring-music` places it, fades it and brings it
to the same loudness as everything else.

#### A song they name

*"Put Mr Brightside on it"*. **A song they name belongs to someone — its recording and its tune.**
Flag that once, with the platform point above, and lay out the three ways it can go; then do what
they choose.

> That one's someone else's song, so using it is your call — and platforms can mute a video with a
> commercial song in it. I can make an original with that energy, arrange its tune if you give me
> the notes, or use the track if you send me the file. Which would you like?

- **An original in that feel** is free of the question entirely, and is the one to recommend.
- **Their file** goes through *Option 2*. **Its tune, arranged here**, needs the notes or a
  description (audio cannot be transcribed). Either way the brief records it as *theirs*.

#### Option 3 — none

Accept it and move on. If there is also no voice, mention once that the video will be completely
silent, and carry on with what they chose.

**Then write the one-sentence idea into the brief**, with every answer from step 1 as a row,
*theirs* or *mine*.

---

## Step 2 — Sketch it on paper

**Offer it, once, in one line.** One box per scene, by hand, rough on purpose — the order of the
ideas, not the artwork:

> If you'd like, sketch it on paper first — one box per scene, rough is fine — and send me a
> photo. It's the quickest way to get the film you're picturing. Or I'll work the scenes out
> from what you've told me.

- **They send one** → it goes in `content/<project>/intake/`. Read it back in words — *"Four
  boxes: the problem, the idea, an example, the ask"* — and build the story on it.
- **They'd rather not, or "you decide"** → work it out from their answers and say so. Do not
  ask twice.
- **Topics 1–3** → skip it; the script already sets the order.
- **On the fast route** → fold the offer into the step 1 batch rather than spending a turn on it.

---

## Step 3 — The story in words

**This is the first gate. Nothing in steps 4–9 starts until they have said yes to the words.**
Pictures built on a story nobody agreed are the most expensive mistake on record here.

**Their own topic** — write the story now: what happens, in what order, and why anyone watching
should care, **as plain prose, a paragraph or two**. Not a list of beats: a list of beats
approved is not a story approved. Name the opening hook and the ending, and any metaphor a scene
will lean on — **a metaphor is theirs**: if one is needed and none has been agreed, offer two or
three in a sentence each and let them pick.

**Topics 1–3** — the script is already written, and it is the story. Show it in full as it is,
at the length they chose. Don't rewrite it first.

Show it **as plain text, in the chat** — the actual words. Not a file path, not a summary, and not
the section headings or timings.

> Here's the story — have a quick read, it's much easier to change now than after it's built.
>
> *[the story, or the full script for topics 1–3]*
>
> Shall I go ahead, or would you like to change anything?

- Revise until they're happy. Show the changed version again each time.
- "You decide", "looks fine", or no interest in reading it → treat as a yes and carry on.
- **Never skip this**, even for topics 1–3. They have not seen the script before.
- **A "go ahead" before you have shown the story does not authorise skipping it.** People say
  it to move things along. Show it anyway: *"Here's what it'll say — a quick look and then I'll
  carry on."*
- **Save the approved words** to `content/<project>/docs/story.md` and add a row to the brief.

### If the viewer chooses something

**Decided here, with the story — not later.** Only when they asked for it (a quiz, a choice, a
check of understanding); do not offer it by default, because an interactive film is more work to
make and to review.

When it is wanted, the story includes **where the viewer chooses, what each option leads to, and
how every path ends**, drawn as a small diagram in the chat, and their yes covers both the words
and the diagram. `making-interactive-video` has the limits (how many questions, how many
options) — read it before drafting, so you do not propose a path it cannot build. Then:

- **Music goes to none, said out loud**, if it was on — see 1d's defaults.
- **Every path is rendered as its own ordinary video** as well as the clickable page. Say so, so
  they know what they will be handed.

### Then, if it has music — what it should feel like

**One follow-up only, and only if they seem to care.** The story now has a mood to judge it
against. Give examples so it is answerable — *"calm and warm, bright and playful, big and
cinematic — or name a style you like."* "You decide" → pick from the story's mood, and say it in
one line, as with any default. A named song here gets the same answer as in 1d: its feel can be
matched, its tune cannot be used.

---

## Step 4 — How it looks

`building-a-video` step 4 → **`choosing-a-visual-style`**. Read it before this message: it holds
the catalogue of styles that can be made here, and it ends with a style card in
`content/<project>/docs/style.md`.

**Propose three distinct styles from the catalogue, recommend one, and offer the other two
routes** — all in one message:

> Three ways this could look:
>
> 1. **Whiteboard** — drawn line by line as it's explained; good for a process with steps.
> 2. **Flat vector** — clean shapes and bold colour; good for something friendly and quick.
> 3. **Blueprint** — white lines on deep blue, labelled like a diagram; good for how a thing is built.
> 4. **A brand** — ASU's, or yours
> 5. **Something else** — describe it, or send me a picture of something with the right feel
>
> I'd go with the whiteboard — your story is a sequence, and drawing it in order explains it.
> Which one?

Pick the three to suit the subject, the audience and the story, and to differ from each other —
not three palettes of one look. The three above are an example, not a default set.

Default **your recommendation**.

### 1–3 — one of the three, or "you decide"

Take the choice (or your recommendation, said in one line and written into the brief as *mine*),
then write the style card. `choosing-a-visual-style` shows them **one still in that style** before
anything else is drawn — a style chosen from a sentence is the easiest decision in the project to
have got wrong.

### 4 — A brand

**ASU's** → read `asu-visual-style` before choosing any colour, font or size. Do not work from
memory and do not skip it because no skill by that name is offered — read the files directly. The
exact values are in there, including colour combinations ASU forbids outright and a brand grey
that fails contrast.

**Theirs** → ask for what they have: colours, typefaces, a logo file, a style guide. Then **check
the contrast of every colour they name** against what will sit on it, before you use it. A brand
colour that fails is common: white on a mid teal (#1BA9A6) measured 2.89:1, which fails even for
large text. Say so plainly and offer the nearest that works: *"White on your teal is too faint to
read — a deeper teal keeps the look and stays legible. Shall I?"*

### 5 — They describe it

Ask once, in their words, with examples so the question is answerable — "hand-drawn and sketchy",
"flat and corporate", "dark background with bright colours", or a picture of something with the
right feel. Then **state how you read it** before building: *"So: dark background, bright accents,
rounded shapes. Right?"* A style described in words is the easiest thing in this whole
conversation to get wrong.

- **If they name specific colours, use them** — and check each one's contrast, as for a brand.
- **If they send a picture**, take the palette and the general feel from it. **Do not copy
  someone else's logo, typeface or layout** — `asu-visual-style/logo.md` covers why.

### Never guess this one

- **An `asu.edu` address is never an instruction** — typed to you, or in the session context, a
  username or a machine name. It is not something they told you about this film.
- **When there are ASU signals** — "my ASU class", a named ASU school, college or department, Sun
  Devils — **offer ASU's style as one option and let them say yes.** Mention it in the brand
  option if you like (*"4. A brand — ASU's maroon and gold, or another"*), but do not default to
  it. A student club filming at Sun Devil Stadium has not asked for the university's brand.
- **If they asked for it outright** — "in ASU colours", "ASU branded" — that is their choice.
  Take it and say what you took.
- **Words like class, course, students or teaching are not ASU signals.** A high school teacher
  saying "for my civics students" is not at ASU, and asserting maroon and gold at them is worse
  than asking.

### What does not change, whichever they pick

**Accessibility is not a style.** Whatever they choose:

- text keeps its contrast minimum against whatever sits behind it
- speech is captioned, and music and meaningful sound described
- type stays big enough to read on a phone
- you still describe what is on screen rather than relying on colour alone to carry meaning

`asu-visual-style/accessibility.md` applies to every film, branded or not. Only the **brand**
colours and fonts are ASU's; the rest is what makes any video watchable. **"Not ASU" means
different colours, not unreadable ones** — and if someone asks for something that would make the
video unusable, say so once, offer the nearest thing that works, and do what they decide.

### If they want a logo

**Answer where they ask, not here.** A logo request usually arrives in the opening message or
alongside the pictures question — handle it in that same reply. Do not save it for this step,
which may come two turns too late.

**Check whether they have a file, then say the matching sentence. One sentence either way.**

**They are sending you one** — or might be:

> Send the logo over whenever you have it and I'll put it at the end — say if you'd rather it
> opened with it.

**They asked for "the ASU logo" and have no file:**

> I don't have an ASU logo file here — if you can get one from your department, send it over.
> Otherwise I'll leave it off and the video will still look right.

**There is no ASU logo file in this repository.** Nothing under `public/` has one. Everything
below is yours to know, not theirs to hear — rule 1 applies here as much as anywhere.

- **If they send a file, use it.** It goes in `content/<project>/intake/`. Check it when it
  arrives, not before — raising PNG-versus-SVG before you have seen anything is a problem you
  invented.
- **Do not go hunting for one online.**
- **Never recreate, redraw or trace it.** Official file or nothing. This is the only element in
  this project not drawn in code.
- **Don't ask whether it is the university mark or their department's** — that costs a question
  and you will know when the file arrives. Unit marks have their own rules; check
  `asu-visual-style/logo.md` once you can see what you were given.
- **Don't animate its shape** — no stretching, spinning or building it up piece by piece.
  Fading it in is fine.

---

## Step 5 — Shot list and script

`building-a-video` step 5: turn the story into **what is on screen in each scene**, in order,
roughly how long — and separately, **every word that will appear or be spoken**. For a film with
no voice, that second document is the entire script. Save them in `content/<project>/docs/`.

**Their own topic** — write the script from the approved story: the level from 1a, the length
from 1b, written to **about 150 words per minute of finished video**. Count the words;
overrunning is the most common error. Read a script in [../topics/](../topics/) first and match
its tone and section discipline.

**Two rates, and they are not the same thing:**

| Rate | What it is | Use it for |
| --- | --- | --- |
| **~150 wpm** | A **writing budget** — how many words fit the finished video at a comfortable reading pace. The packs are written to it | Writing any script: how many words go in |
| **~100 wpm** | **One generated voice's measured speaking rate** (`adding-narration/reference/timing.md`) | Predicting how long a generated voice will take to say those words — about 35–45% longer than the written seconds |

**For their own recording, neither is their speed.** Time them reading one paragraph and use that.
If the slot is fixed — a 30-second ad break — and there is a voice, write fewer words, not
faster ones.

**Show the script if it says anything they have not approved.** For their own topic the words are
new — show them in full, as plain text, and get a yes; a story approved in prose is not every
sentence approved. For topics 1–3 the script *was* the story at step 3; show it again only if the
length changed since.

**If the change alters the words, show them again.** A length change is not a pacing change —
the ready-made scripts are written in tiers, so **2 minutes down to 1 minute deletes five whole
sections of a script they already read and approved.** Name what goes, show the shorter script
in full, and get a second yes.

---

## Step 6 — Where the pictures come from

`building-a-video` step 6 → **`creating-assets`**, including whose world the pictures show.

> **Where should the pictures come from?** Choose one:
>
> 1. I draw them — here, free
> 2. You have them — photos, drawings or logos you'll send me
> 3. I write prompts you can paste into an image tool you use
>
> Just reply with a number.

Default **1**. Drawn in code, it costs nothing, and every picture comes out in the agreed style.

**A paid image service is not an option on this list.** `ACCESS.md` lists no free image
generator, and `AGENTS.md` forbids paid calls without a specific, approved proposal — the exact
service, the number of pictures, the total cost. Raise one only if a picture genuinely cannot be
drawn, and only as that proposal.

**Whose world the pictures show** — place, people, culture — is theirs. If a scene shows people
or a place and they have not said whose, ask in one line. Invent no personal detail beyond what
they gave.

### Anything they hand you, at any point, goes in

The options are about **where the main pictures come from**. They are not a limit on what they
can give you. At any moment — before the question, after it, during refinement — they may send a
file and say *"put my school logo in it"*, *"use this photo"*, *"here's our brand colours"*.
**Take it and use it.** Don't tell them it's the wrong moment.

- **It goes in `content/<project>/intake/`**, whatever state it arrives in. Only the copy a scene
  actually uses is staged into `public/assets/<project>/`, cut out, named and sized — everything
  in `public/` is copied into every render, so it is not storage.
- **Say where you'll use it** rather than asking, and invite them to correct you — in **one**
  sentence: *"I'll put the logo on the last scene, say if you'd rather it opened with it."*
- **Don't let it block anything.** If it has not arrived, carry on and pick it up later without
  mentioning it again.
- **If it changes the look of everything** — brand colours, a typeface — apply it across the
  whole video, and check the contrast of each colour (step 4).
- **If it won't work** — wrong file type, too small, unreadable — say exactly what's wrong and
  ask for another.
- **A clip is footage** — it goes through `working-with-footage`, not this step.

### Pictures found online

*"Just grab some pictures of the stadium off Google."* **A picture found online is their call.**
Say once that it belongs to whoever made it and that using it is their decision — memes and
reference images often sit in a grey area — offer the free alternative, then do what they decide.
Do not refuse, lecture or raise it again.

> That photo belongs to whoever took it, so whether to use it is your call. I can use it if you
> send it or point me to it — or I can draw the stadium as a simple shape instead.

- **If they want it**, they send the file or the link; fetch it if asked. It goes in
  `content/<project>/intake/`, and the brief records where it came from and that using it was
  *theirs*.
- **If the film is going public**, it comes up once more in the delivery check
  (`viewing-and-rendering`) — as a reminder, not a gate.
- **Their own photo** needs the agreement of anyone recognisable in it.

### Option 1 — I draw them

Nothing to decide now. The set is proposed at step 7, once the script exists.

### Option 2 — They provide their own

> You can drag the files into this chat, or put them in the **intake** folder for this video and
> tell me when they're there. PNG, JPG or SVG all work.

- Create `content/<project>/intake/` if it doesn't exist, and say its name only if they need to
  put something there.
- **Wait for them.** Don't quietly substitute your own.
- When they say they're done, list back what actually arrived, in plain words: *"I've got
  three — a bell curve, a bar chart and a photo of a classroom."*
- Anything missing or unusable → say exactly what's wrong and ask for a replacement.
- **Fewer images than the video needs → state what you will do, do not ask.** *"I've got three,
  and the video runs to about eight moments — I'll draw the other five to match. Say if you'd
  rather I reused yours instead."* Then carry on.
- **Work out the real number** from the shot list (step 5), not a guess.

### Option 3 — I write the prompts, they generate

Give them one prompt per picture, ready to paste, and **a shared style preamble to put in front
of every one** — `choosing-a-visual-style` writes it with the style card.

- **The preamble is what makes separately generated images look like one video.** Say so, and
  tell them not to reword it per picture. `content/live-showcase/docs/assets.md` is the worked
  example.
- **Ask for transparent backgrounds and no baked shadow** where the picture sits on the page
  rather than filling the frame. A baked shadow glues it flat and cannot be undone.
- **Ask for at least 2× the on-screen size**, for the shape the brief recorded. In a 1920×1080
  frame, something filling a third of the width wants to arrive at least 1280px wide; in an
  upright frame, work it out from that frame's width.
- **Say where to put them when they come back** — dragged into the chat, or into the intake
  folder. From that point this is exactly option 2.
- **Do not wait idly.** Build everything that does not depend on the pictures while they are
  generating, and say that is what you are doing.

**One thing this path cannot do: a ready-made script's diagrams.** Those name *precision* figures
— a twelve-segment wheel with two named hues opposite, a bell curve with the middle shaded —
where the accuracy **is** what the video teaches. Generators reliably return the wrong segment
count, the wrong order and garbled labels. **Say so and offer the split:**

> Generators are great at mood and bad at accuracy — you'd get a lovely wheel with the colours
> in the wrong order, and on this one the wheel *is* the lesson. How about you make the
> backdrops and I draw the wheel precisely on top, in your style?

Offer it once and do what they choose.

---

## Step 7 — Getting the pictures made

`building-a-video` step 7: **work out what the film needs, rather than asking them to guess it.**

Show what you intend to draw, one line each, numbered to match the shot list. **Do not ask them to
imagine it from nothing** — show them something to react to:

> Here's what I'd draw for each part:
>
> 1. *Three ingredients* — three boxes: Sunlight, Water, Carbon dioxide
> 2. *Inside the leaf* — a flow: Sunlight + Water + Carbon dioxide → Sugar + Oxygen
> 3. …
>
> **How does that look — anything you'd like different?**

- **For topics 1–3 the script already names a picture for every section.** Show those. Don't
  redesign them, and don't invent a different set.
- **For their own topic**, choose by the **shape of the explanation, not the subject** — a
  process is a left-to-right flow whether it is photosynthesis or a refund policy. Draw a loop
  only when the thing really returns to where it started.
- **Say why anything recurs.** *"The wheel comes back twice on purpose — one thing to hold onto
  beats three unrelated pictures."*
- **Change what they ask, then show the revised list.** Don't argue for your version twice.
- **If the length changes later, re-show the list.** The set they agreed was for the longer
  video; their "fine" was given to a list that no longer exists.

**Drawn in code, the pictures are made as part of building the scenes** at step 9 — as SVG,
animated from `useCurrentFrame()`. Say so, so they are not waiting for a separate delivery.

---

## Step 8 — The voice, if it has one

`building-a-video` step 8 → **`adding-narration`**. It comes before building, because a voice
decides how long a scene is.

**A generated voice:** read `adding-narration` before generating anything. The two things that
will bite you soonest:

- **The free tier is small and per model** (the figure is in `ACCESS.md`). Batch two to four
  sections per call, never one per sentence, and never retry in a loop — you will exhaust the
  day's quota for everyone using that key.
- **Always run `node scripts/tts-verify.mjs` afterwards.** Batched TTS drops lines silently:
  a clean exit code, plausible audio, and a missing sentence. Nothing else catches it.

If the key turns out to be wrong at generation time, say so then, offer words on screen or their
own recording — and revisit the music (1d).

**Their own recording:** follow `adding-narration` → `reference/recording.md`. Tell them
what to record and how (the approved script, about two seconds of quiet between lines, a quiet
room); the file goes in
`content/<project>/intake/`. If an on-screen label later needs a word they did not record, say
that it means re-recording before you change it.

**Either way, the audio will not be exactly the length you planned for.** Measure it against each
section and widen the section to fit before building. If that changes the total, tell them.

---

## Step 9 — Describe it back, build one scene, show it

**The second gate.** `building-a-video` step 9: the scene descriptions are the last point where a
disagreement costs a sentence. A scene wrong in a paragraph is a rewrite; the same scene wrong on
screen is a rebuild.

### First, the plan

They have answered questions across many turns. Nobody holds all of that in their head. Lay it out
once, in their words, and let them change anything:

> Here's what I'm about to make:
>
> - **Colour theory** — what it is, the wheel, and complementary colours
> - **40 seconds**, no voice, words on screen
> - **Quiet music** under it, made here — *my pick*
> - **Five pictures**, which I'll draw
> - **Whiteboard style** — *my pick*
>
> Scene by scene: it opens on an empty wheel that fills in hue by hue; …
>
> I'll build the opening scene first and show you before I do the rest.
>
> **Anything you'd like to change before I start?**

- **Their inputs, and your picks marked as yours.** Tag every line you decided for them — *my
  pick* is enough. That tag is what lets them see, in one glance, which parts of the video nobody
  asked them about.
- **A short paragraph per scene** — what is on screen and how it moves. That is the description
  `building-a-video` step 9 asks for.
- **Always say how the words reach them** — spoken, on screen, or neither. It is the thing most
  likely to have been decided across two separate questions, and the thing they will most notice
  if it is wrong.
- **No jargon, no file paths, no counts of components.** This is the summary they will read.
- **One question, at the end.** Not a question per line.
- **If they change something, show the revised plan** and ask again.
- **If the change alters the words, go back to step 5** and show the changed script in full.
- **If they have a voice on, a cut *to* 30 seconds does not give them 30 seconds.** Spoken, it
  lands nearer 40, and the trim that would fix it is forbidden. Say it plainly, especially to
  anyone who mentioned a fixed slot:

  > With the voice on, 30 seconds of words takes about 40 to say — so it won't fit a hard
  > 30-second slot. I can drop the voice and put the words on screen, which does fit. Which
  > would you rather?

### Then one scene, and stop

**Build the scene that carries the most** — usually the opening, or whichever carries the style
hardest — through `building-scenes`, and put it in front of them **before building the rest.** A
style that fails on one scene fails on all of them, and one scene is the cheapest place to learn
it. Building the other scenes' code "while you wait" is the habit this gate exists to stop.

Show a picture of it — a single still at half size is quick — and offer to let them see it move:

> Here's the opening scene. Before I build the rest — does this look the way you pictured it?
> If you'd like to see it play, I can open a preview in your browser.

**Don't say "frame"** — it is jargon, and it makes them wonder what they're being shown.

**The preview is an offer, not a default.** If they want it, start it with `npm run dev`, give
them the address it reports, and say it keeps running until you stop it. **On a machine with 8 GB
of memory, stop the preview before a full render** — the two together have pushed renders to an
hour.

**Only after their yes, build the rest.** Then step 10, 11 or 12, whichever comes next.

"Make it in one pass" removes the waiting between steps, not the gates at steps 3 and 9. What
comes out of one pass is still an unreviewed draft, and is reported as one.

---

## Steps 10 and 11 — Score, and the interactive build

**Step 10, if it has music** → `scoring-music`. The score is written against the picture's own
timeline, so it comes once scene lengths exist. If they chose to cut picture *to* a piece of
music instead, this step moves before step 9 — say which order you are using. For a footage film
keeping the clips' own sound, `working-with-footage` covers levelling it.

**Step 11, if it is interactive** → `making-interactive-video`. Decided with the story at step 3;
built now that the scenes it branches between exist. Every path is also rendered as an ordinary
video.

**If they said yes to commentary**, say what you're doing one short line at a time — *"Writing the
scenes,"* *"Making the music,"* *"Rendering the final file."* Not a technical log. **If not**,
stay quiet until there is something to show. **Either way, if something fails, say so** — what
failed, in plain language, and what you are doing about it. A failure is not narration; it is
news, and it goes to everyone.

---

## Step 12 — Watch it and refine

`building-a-video` step 12 → `viewing-and-rendering`. Invite notes explicitly the first time:

> You can ask me for anything — slower, a different picture, reword it, different colours, cut a
> bit, make it longer. Just say it in your own words.

- **Change only what they asked for.** Don't "improve" other things at the same time.
- Unclear ("make it better") → *"Which bit felt off — the pace, the pictures, the wording, or
  the colours?"*
- **Keep the old file.** Don't overwrite — they may prefer the previous one. Name the new one
  so the order is obvious: `water-cycle-v2.mp4`.
- No limit on rounds, and never imply there is one. Three rounds on the timing of one movement
  is normal.

---

## Step 13 — Render, measure, hand over

`building-a-video` step 13 → `viewing-and-rendering`. Run `scripts/check-render.mjs` on the
render before anyone watches it, and `scripts/finish-video.mjs` before it goes to anyone. Tell
them roughly how long the render will take before you start it (see *Dated facts*).

When it's finished, tell them:

- **Where it is, in words they can follow** — finding a file is the step people get stuck on:

  > It's ready — it's saved as `photosynthesis.mp4` in the **out** folder, inside the project
  > folder you downloaded. Double-click it to play.

  If they want to scrub through it, offer the preview (step 9) rather than starting it unasked.
- **How long it actually came out**, and what size and shape.
- If sections were dropped to hit a short length, **say which ones**, so they aren't
  surprised by material going missing.
- Any technical fault the checks found. Not a verdict on whether it is good.
- Then: *"Have a look and tell me what you'd like changed."*

---

## If they come back later

Someone may close the terminal mid-way, or come back days later. `scripts/session-start.mjs`
(it runs on its own in Claude Code) lists every film with a brief and the last session's
handoff. Read the brief — `content/<project>/docs/brief.md` — and the last log before you say
anything, then say where things stood **in one line** and ask **one** question:

> Last time we got the water cycle story approved and picked a calm, guitar-led score. Carry on
> with that, or start something new?

- **Do not re-ask what the brief already holds.** A decision marked *theirs* stands; one marked
  *mine* can be mentioned in passing — *"I'd picked the music; still happy with that?"* — but
  never re-run as a question list.
- **Do not recap the whole project.** One line of where it stood, then the next step. If they
  want more, they will ask.
- **No brief, but unfinished work** in `content/<project>/intake/`, `out/` or `src/`: say what
  you found and offer to continue, the same way.

---

## Never, in this workflow

- Never ask a question they already answered. Read their message first — step 0.
- **Never run the interview on something this cannot build.** Check at step 0.5 and say so
  then, not after they have approved a story.
- Never explain the machinery in a question. Ask the question, nothing else.
- Never skip the story at step 3 or the first scene at step 9.
- Never ask them to open a terminal or type a command. **You run installs yourself**, after
  explaining what and why and getting a yes — see the setup check. The things they do by hand
  are pasting an API key into `.env`, if they want a generated voice, and recording their voice,
  if they chose to.
- Never create `.env` before they have said they want a generated voice.
- Never send someone who said "you decide" to sign up for anything.
- Never tell them it's too late to change an earlier answer.
- Never show a file path unless it's one they need to open or put something into.
- Never call a paid image, video or audio API. Free tools only, and ask before any spend.
- Never leave them stuck on a missing key — give the setup steps, and always offer words on
  screen or their own recording as a way out.
- Never insist stale setup steps are correct when they say the screen looks different.
- Never commit anything to Git unless they ask in that message.
- Never declare the finished video good. They decide that.
- **Never make a decision silently.** Theirs, or yours said out loud and written in the brief.
- Never decide rights for them, either way. Music, a tune, footage or a picture that belongs to
  someone else is flagged once and is then their call, recorded in the brief (`AGENTS.md` →
  *Rights are the person's call*). Never pull media off a social or streaming platform yourself.

---

## For the technical reader

| Answer | Becomes |
| --- | --- |
| Topic | A script in `../topics/`, or one you write |
| Audience | The reading level of each section's words |
| Length | Optional sections dropped shortest-first, then the rest scaled to fit |
| Voice | WAVs from `scripts/tts-generate.mjs`, verified by `tts-verify.mjs`; or their recording, split per `adding-narration` |
| Music | A score from `scripts/score/`, written against the film's timeline — see `scoring-music`; or the clips' own sound |
| Story | `content/<project>/docs/story.md`, approved in words; with the path diagram if interactive |
| Look | `content/<project>/docs/style.md` |
| Pictures | Code-drawn SVG, or supplied files from `content/<project>/intake/` staged into `public/assets/<project>/` |
| Footage | Probed with `scripts/probe-footage.mjs`, handled per `working-with-footage` |
| Output | A rendered `.mp4` in `out/`, checked by `scripts/check-render.mjs` and finished by `scripts/finish-video.mjs` |
| Every choice above | A row in `content/<project>/docs/brief.md`, marked *theirs* or *mine* |

**The film's shape and frame rate are whatever its brief recorded** — 1920×1080 at 30fps unless
they chose otherwise. A film built around footage takes the footage's frame rate instead — a
constraint of that film, not a project default.

Build with Remotion, following `.agents/skills/remotion-best-practices/SKILL.md` and the
development rules in `AGENTS.md`; where the two conflict, `AGENTS.md` wins. Nothing here
overrides those — this file governs the **conversation**, not the code.

---

## Dated facts

Re-check before relying on any of these.

- **Google AI Studio key steps** (1c) — checked **2026-09-19**. Google moves things.
- **The speech models' free tier** — which models are free, and the measured 10 requests per day
  per model, are in `ACCESS.md` (models checked there 2026-10-21; the daily count measured
  2026-08-09).
- **Brand-colour contrast example** (step 4) — white on #1BA9A6 measured 2.89:1, **2026-10-20**.
- **How long things take** — measured **2026-10-20** on a shared machine with several agents
  rendering at once, so a quiet machine will be faster:
  - A 28-second text-and-shapes film went from first message to finished file in **about an
    hour**, including the conversation, two renders and about 25 checking stills.
  - One half-size still took **30–40 seconds**, mostly bundling. Under load one timed out at the
    default 30 seconds.
  - A full render of a 30-second film at 1080×1920 with `--concurrency=2` took **about 2
    minutes**.
  - The worked example (`LiveShowcaseFilm`, about a minute long) rendered in **8 min 20 s** at
    `--concurrency=2` on an Intel Core Ultra 7 155U laptop.
