# Video Workflow

**This file tells the AI agent how to make a video with someone who is not a programmer.**

If you are the agent (Claude Code, Codex, or similar) and the person asks for a video,
follow this file exactly. Do not improvise a different order. Do not skip the approval.

If you are a human reading this: you don't need to do anything with this file.
Just open this folder in Claude Code or Codex and say **"create a video for me."**

> **This file governs the conversation, not the code.** It tells you what to ask, in what
> order, and what to do with the answers. For how to build the video itself, follow
> `.agents/skills/remotion-best-practices/SKILL.md` and the development rules in `AGENTS.md`.
>
> **Visual style, colour, type and accessibility** are covered by `asu-visual-style`.
> **How to construct the video in Remotion** — composition structure, deriving duration, the
> diagram primitives, captions — is covered by `building-scenes`. Read that one after the
> script is approved and before writing any code. Both live in `.claude/skills/` once

> **Paths in this file.** Links to topic scripts are relative to this file, because they move
> together. Everything else — `public/assets/`, `out/`, `scripts/`, `AGENTS.md`, `ACCESS.md` —
> is relative to the **project root**, whatever folder this file currently sits in. Resolve
> them from the root, not from here.

---

## The flow

Five questions, then the script, then the plan, then the video. Always this order.

**Expect more turns than questions.** Someone who answers everything vaguely gets around ten
replies from you before a frame exists — the commentary question, the five below, the script
gate, the picture list, how they are drawn, and the plan. Each one earns its place, but do not
tell them "just five questions" and then ask ten.

```text
1. Topic → 2. Length → 3. Voice → 4. Assets → 5. Style → 6. Script → 7. Plan → 8. Generate
```

**But you rarely ask all five.** People answer questions before you ask them, scattered
through their opening message. Your job is to notice, skip what they've answered, and ask
only what's left.

Most people who open this project do not know what video they want. They will type something
vague and wait to be led. **Leading them is your job.** Every question has a default, and
"I don't know, you decide" is always a valid answer.

### What the three ready-made topics are for

Someone with no idea what they want — trying this out, seeing whether it works — needs
something to pick. That is what photosynthesis, colour theory and supply and demand are
for. They are a way in, not a catalogue.

Each has a written script in [../topics/](../topics/) that supplies two
things: **the words** for step 6, and **the picture for each beat**, used when they choose
"I create them for you" at step 4. Nothing has to be invented, so the person gets a finished
video without having to describe one.

Anything else they name is a topic you write from scratch.

---

## When to start

Start when the person says anything that means *"I want a video"* — "create a video for me",
"make me a 60 second video", "I need a short explainer on photosynthesis".

If you are not sure they want a video, ask once: *"Do you want me to make a video for you?"*
Don't start until they say yes.

### First, check it can actually build

**Before you ask anything, run the setup check** — `.agents/skills/installing-the-toolchain/reference/SETUP-CHECK.md`,
or `.agents/skills/installing-the-toolchain/reference/SETUP-CHECK.md` before that is installed.

In short: Node 16+ and `node_modules/` both have to exist. **If either is missing, you install
it** — explain what and why, ask once, and run it yourself. Do not hand them a command; they
opened a chat window, not a terminal.

**If Node is present and recent enough, say nothing and carry on.** Nobody needs to be told
their computer is correctly configured.

---

### Then ask how much they want to hear

**One question, once, before the topic question:**

> **Do you want me to tell you what I'm doing as I go?** Yes or no — either is fine.

Default **no**.

| | **Yes** | **No** |
| --- | --- | --- |
| Installing something | Say what it is and why | Ask permission, nothing more |
| While building | Short running commentary — *"writing the scenes", "drawing the pictures"* | Silence until there is something to show |
| A choice you made for them | **Say it** | **Say it** |
| The plan, at step 7 | **Show it** | **Show it** |
| The summary when it's done | **Give it** | **Give it** |

**The bottom three rows do not move.** "No" means *don't narrate the machinery* — it does not
mean *decide things silently*. A judgement you made on their behalf and the plan before you
build are theirs either way, and a person who asked for less talking has not asked for less
control.

**Skip the question if they already told you.** *"Just make it"*, *"don't explain, I don't
care how"* — that is a no. *"Walk me through it"*, *"I want to learn how this works"* — that
is a yes. Asking anyway ignores what they just said.

**If they ask a question mid-build, answer it** — whichever they picked. "No" is a default
for your narration, not a gag.

---

## Step 0 — Read what they already told you

**Do this before you ask anything.** Go through their message and take every answer it
already contains. Then ask only the gaps, in the order above.

| They wrote | You now know | Skip |
| --- | --- | --- |
| "on photosynthesis", "about the water cycle", "explaining supply and demand" | Topic | Step 1 |
| "60 sec", "1 min", "two minutes", "a minute and a half" | Length | Step 2 |
| "for school students", "for beginners", "for my class" | Audience | The audience question |
| "with narration", "with a voiceover", "no voice", "silent", "captions only" | Voice | Step 3 |
| "I'll send images", "I have pictures", "use my photos", "you make the visuals" | Assets | Step 4 |
| A specific brief — "the four stages", "just the basics", "focus on evaporation" | What it should explain | The brief question |
| "for my ASU class", "I teach at ASU", "in ASU colours", a named ASU school or department, or **an `asu.edu` address they typed to you** | ASU style — yes | Step 5 |
| "for my class", "for my students", "I teach" — **with no mention of ASU** | Audience only. **Not** an ASU signal. | Nothing — still ask step 5 |
| "in Hindi", "in Spanish", "for our Spanish-speaking students" | Language | Do not ask; check you can do it — see step 1 |
| **"I'll record myself", "my video", "screen recording", "footage", "me presenting", "a clip of"** | **Nothing — this is out of scope.** Do **not** read it as an assets or voice answer. | **Go to step 0.5 immediately** |
| **"animate our logo", "a 10-second intro", "a bumper"** | **Out of scope** | **Go to step 0.5 immediately** |
| **"for socials", "Reels", "TikTok", "Stories", "for my phone"** | **They may be expecting upright. Everything here is wide** | **Go to step 0.5 immediately** |

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
| "create a video for me" | nothing | Topic, length, voice, assets |
| "create a 60 sec video for me" | Length | **Topic**, voice, assets |
| "create a video on the water cycle for me" | Topic | Length, audience, voice, assets |
| "a 2 min video on photosynthesis" | Topic, length | Voice, assets |
| "a 90 second video on the water cycle for school students, I'll send images" | Topic, length, audience, assets | Voice only |
| "make me a short video, no voice" | Length (→30s), voice | Topic, assets |

**The script approval at step 6 is never skipped**, however much they told you.

---

## Step 0.5 — Can this be built at all?

**Before the topic question.** If their message describes something this cannot make, say so
now. Everything after this point costs them time, and the script gate at step 6 is far too
late to discover it — by then they have answered four questions and approved a script.

Three misfits come up. Each gets one honest sentence and a real alternative.

### They have footage, or want to use their own voice

> What I make here are animated explainers — text, drawn diagrams and captions on screen. I
> can't cut your recording into a video; there's nothing set up here that takes footage.
>
> What I can do is an animated version that covers the same ground. Shall I do that instead?

**Do not promise a voice here.** An earlier version of this sentence said "with a generated
voice over the top" — which needs an API key that a fresh copy of this project does not have.
Step 3 handles the voice properly once they have agreed to the alternative.

**If yes**, start the interview fresh — it is a custom topic now. **If no, stop.** Nothing here
serves them, and walking them through the questions anyway wastes their time.

**The trap:** "I'll record myself talking" looks like an answer to *both* the assets and the
voice question. An agent that harvests it that way skips two steps, writes a script, gets it
approved, and only finds out at build time that there is nowhere to put the recording.

### They want a logo animated

> I can build an intro around your logo — send the file over and I'll fade it in and animate
> everything around it. The mark itself has to stay as it is; the brand rules don't allow
> reshaping or building one up.

**Then deal with the length in the same turn**, because an intro is usually 5–10 seconds and
the floor is 30:

> The other thing is length — the shortest this makes is about 30 seconds. Is a short explainer
> any use for that, or would a still image do the job?

**Do not ask "how long should it run?"** if they already said. A request like *"a 10 second
seminar intro"* states it, and rule 6 forbids asking what you already know — on the very
message that routed you here.

**Answer all of this in the turn they ask it**, not at step 5. By step 5 you may already have
promised something you have to retract.

### It is a montage with nothing to explain

Pictures here illustrate a script. If there is no explanation — just photos in sequence — say
so and offer the version that does exist: *"I can make a short explainer about it with those
photos in — would that work?"*

### They asked for something shorter than 30 seconds

Not just intros — *"make me a 10 second video"* on any topic. The floor is a limit on what this
makes at all:

> The shortest this makes is about 30 seconds — under that the narration has to be raced and it
> stops being watchable. Is 30 any use, or would a still image work better?

### They want it upright, for Reels, TikTok or Stories

**Every video this makes is 1920×1080 — wide.** There is no vertical option, and it is not a
setting. Every layout constant downstream is authored for landscape: the safe margins, the
figure area, the caption panel, the diagram viewBox. Making a 9:16 version is new layout work
that nobody has specified, not a number to change.

**Say so before anything else, because it is the cheapest possible moment:**

> These come out wide — the shape YouTube and LinkedIn use — not upright for Reels or TikTok.
> I can't do upright yet. Is wide any use to you?

- **Ask this the moment they mention social**, "for socials", Reels, TikTok, Stories, or a
  phone. A cold run invented this question itself because the file did not have it, and was
  right to: *"need a silent video for socials"* is one of the most likely openings this
  project will ever get.
- **Do not offer to crop it.** A 16:9 explainer cropped to 9:16 loses both ends of every
  diagram, and the captions with them.
- **If wide is no use, stop.** Say plainly that this is not the tool for it rather than
  building something they cannot post.

### Anything else that does not fit

**Say which part fails and offer what you can.** Never take someone through the interview and
discover it at the build. If you are unsure whether something is in scope, it probably is —
ask them one question rather than refusing.

---

## Rules for the whole conversation

1. **Ask the question and nothing else.** Do not explain where the script comes from, do not
   mention packs or "ready-made" topics, do not narrate your own machinery. The person does
   not care how it works — they want a video. **Every extra clause is friction.**
2. **One question at a time.** Wait for the answer. Never send the whole interview at once.
3. **Number the options** so they can just reply `1`, `2`, or `3`.
4. **Every question has a default.** If they say "I don't know", "you decide", or go quiet —
   pick the sensible option, **tell them what you picked**, and keep going. Never stall
   waiting for a decision they don't have.
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
9. **Building takes a few minutes.** Say so before you start, so the silence isn't alarming.
10. **They approve the video, not you.** Never tell them it "looks great". Tell them it's
   ready and ask what they think. You may report genuine technical faults — a broken file,
   missing audio, the wrong size — but not an opinion on the quality.

---

## Step 1 — Topic

> **On which topic do you want a video?** Choose one:
>
> 1. What is Photosynthesis?
> 2. What is Colour Theory?
> 3. What is Supply and Demand?
> 4. Something else — tell me your topic.
>
> Just reply with a number.

- **1, 2 or 3** → read the matching script in [../topics/](../topics/).
  You'll show it at step 6.

  | Topic | Script |
  | --- | --- |
  | Photosynthesis | [photosynthesis.md](../topics/photosynthesis.md) |
  | Colour theory | [colour-theory.md](../topics/colour-theory.md) |
  | Supply and demand | [supply-and-demand.md](../topics/supply-and-demand.md) |

- **4** → ask *"What should the video explain?"* You'll write the script at step 6.

- **"I don't know"** → *"Let's start with photosynthesis then — you'll see how this works,
  and we can do your own topic after."* Don't leave them stuck on the first question.

**If they named a topic themselves** — in their opening message or at option 4 — check it
against the three above. If it matches one, use that script. Otherwise you're writing it.

### Two follow-ups whenever you're short on detail

**Skip both for topics 1–3.** Those have a written script, so you already have the full
detail and the audience. For anything else — including a topic they named in their opening
message — ask both.

**Ask who it is for first.** People answer that question whether or not you asked it — someone
told to narrow a topic will reply "for my class". Asking audience first means their answer
lands where you wanted it.

- **What should the video explain?** Ask this **in every scenario where you have limited
  information**, not only when they pick option 4. A topic is not a brief: "the water cycle"
  could be four stages in 30 seconds or groundwater chemistry in three minutes. You need to
  know which.
  - **If the subject has a national or regional version** — a legal process, a school system, a
    currency — ask which, or state the one you assumed. "How a bill becomes law" silently
    becomes the US otherwise.

  > What should the video explain about the water cycle?

  If their answer is still very broad — *"biology"*, *"statistics"* — give examples once:
  *"That's a big subject — is there one idea inside it you'd like to explain? For example,
  photosynthesis, or how cells divide."* Ask that once only; if they still want the broad
  version, accept it.

- **Who is it for?** *"Who is this video for? For example: school students, university
  students, or people new to the subject."* Default **people new to the subject**. This sets
  the level of the whole script. Skip if they already said.

---

## Step 2 — Length

> **How long do you want the video?** Reply in seconds or minutes.

- **Vague or none → 60 seconds.** Say which you picked.
- **But "short", "quick", "brief" → 30 seconds**, not 60. Those are not "no answer" — they are
  an answer meaning *as short as you can*. Step 0 reads them that way too, and two agents
  reading the same file must not build different videos from the same word. **Anything else
  vague — "whatever", "you decide", silence — is 60.**
- A range ("one to two minutes") → take the middle, say the number you're using.

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
makes at all, not just on a given script. Below it, "fitting" the length means
racing the narration or deleting sentences, and the result isn't worth watching. If they ask
for less, say so once and offer something honest instead:

> Photosynthesis needs about 30 seconds to make sense — under that I'd be racing it. Shall I
> make it 30?

**Do not offer to "cover one part of it" in less.** There is no 15-second version of any script
and no instructions for writing one, so that offer is a promise you cannot keep. 30 seconds is
the shortest thing you can actually build.

**At the floor, a voice changes the number again — say so when they choose it.** The 30
seconds is reading time; spoken, the same words take about 40. And you **cannot** trim to fix
it, because cutting `core` is exactly what the floor forbids. So state it as a fact, not an
offer:

> With a voice on it this comes out nearer 45 seconds than 30. Speech is slower than reading,
> so the same words take longer to say. Nothing gets cut and no wording changes.

**Where 45 comes from, so it stays consistent with the packs.** The ~50% figure in
`../topics/README.md` applies to the **spoken sections**, not the whole video — the
3-second title card does not stretch. So a 30-second video is 3s of title plus 27s of words,
and 27 × 1.5 + 3 ≈ **44**. Quote a round 45 and do not promise a precise number; the real
figure depends on the script.

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

---

### If they ask for another language

**Two cold tests asked for Hindi.** The workflow said nothing, so each agent improvised
differently. Here is the rule.

**Say yes if you can genuinely do it, and check before you promise:**

- **On-screen text** needs a font with that script. Latin, and most European languages, work
  with Arial. Devanagari, Arabic, CJK and others need a font that carries those glyphs —
  `@remotion/google-fonts` ships Noto families for most. **Check the package before saying
  yes**, and say so plainly if a script is not covered.
- **A voice** needs the TTS model to support the language. Gemini TTS is multilingual, but you
  cannot verify a specific language until a key exists.
- **The script must be written in that language, not translated word-for-word.** The person
  approves the actual sentences at step 6, so write them properly.

**Two numbers in this project are calibrated for English and do not transfer:**

- **150 words per minute.** Languages carry different amounts per second. Time the draft
  against real audio, or against a native reading, rather than trusting a word count.
- **Nine words per caption.** That is a line length at 40px in Latin script. Scripts that set
  wider or narrower need a different chunk size — judge it by how the line looks, not the count.

**The three ready-made scripts are English only.** Picking one and asking for another language
means rewriting it, which puts you on the write-a-script path even though the topic is
ready-made. Say so: *"I'll need to write that one in Hindi rather than reuse the English — same
content, it just takes a moment longer."*

**If you cannot do it**, say which part fails and offer what you can: *"I can put the text on
screen in Hindi, but I can't add a Hindi voice without a key set up. Shall I do captions?"*

---

## Step 3 — Voice

> **Do you want to add a voice to this video?** Yes or no.

- Default **yes**.

### If yes — captions are not a question

**Say it, don't ask it.** ASU requires captions on anything with audio, and
`asu-visual-style/accessibility.md` states it as a rule, not a preference. One clause:

> I'll add captions too — they're required, so it works with the sound off.

Then move on. Do not offer to turn them off, and do not treat it as a setting.

### If no — ask how the words reach them

**There is no audio, so there is nothing to caption.** What is left is a design question, and
it is a real one — this repository has shipped silent videos both ways.

> **Do you want the words on screen?** Yes or no.
>
> Without a voice, that's how the video explains itself — otherwise it's pictures and a few
> short labels.

- **Yes** → default. Full sentences appear as the video goes. This is what the three
  ready-made packs are written for.
- **No** → **say what it costs, once, before accepting it.** The script's sentences will not
  appear anywhere: no voice, no captions, no words. What is left is pictures, headings and
  short labels, and the video has to carry its meaning through those alone.

  > Then nothing will be spoken or written out — it'd be pictures with short labels, which
  > can work well but says much less. Happy with that?

  If they confirm, **the script changes shape.** Rewrite it at step 6 as short on-screen
  phrases rather than sentences, and show them that version — not the sentence version they
  will never see. The worked example was a 90-second silent film built here with no caption
  panel at all, meaning carried entirely by typography and motion. **It was removed when this
  repository was cut down to one film, so there is nothing in `src/` to open** — build from
  this description rather than looking for it.

**Never end up with no voice, no captions and a sentence script.** That is a video that says
nothing, and it is reachable by two "no"s in a row if you are not paying attention.

### Yes, but there's no key yet

Narration needs `GOOGLE_AI_STUDIO_API_KEY` in a file called `.env` at the top of this folder.
That file isn't part of the download, so a fresh copy of this project won't have one.

**Don't refuse, and don't quietly switch to captions.** Help them set it up — it takes about
two minutes and it's free.

**First, create `.env` yourself**, before you say anything. Do not tell them to open a file
that is not there. Write exactly this line into it:

```
GOOGLE_AI_STUDIO_API_KEY=paste-your-key-here
```

**A live line, never a commented one.** `# GOOGLE_AI_STUDIO_API_KEY=...` looks tidier and is a
trap: they paste their key onto a commented line, save, tell you it is in, and nothing works —
with no error to explain why. A cold agent made exactly this mistake and caught it on re-read.
One comment line above it saying what to replace is fine.

Then say this:

> I can add a voice, but it needs a free Google AI key and there isn't one set up yet. It takes
> about two minutes — here's how, and we can carry on while you do it:
>
> - Go to **https://aistudio.google.com/apikey** and sign in with any Google account
> - Click **Create API key**, and let it make a new project if it asks
> - Copy the key — it's only shown in full once
> - Open the file **`.env`** in this folder. There's a line ending in `paste-your-key-here` —
>   replace just that part with your key
> - Save it, and tell me when it's in
>
> No credit card needed. Or say **skip** and I'll put captions on screen instead — we can
> always add a voice later.

**Use bullets, never a numbered list.** Rule 3 has trained them to answer with a bare number.
A numbered list here means their next message is "2" and neither of you knows whether that
means step 2 or an answer to a question you have not asked yet.

**Do not stop the interview waiting for the key** — but **do not stack the next question onto
the same message either.** Send the key steps, then ask step 4 in the *next* message.

> Two cold runs hit this. The key steps are five bullets and a fallback offer; step 4 is a
> numbered question. Put them together and the person answers one and ignores the other —
> both runs replied to the key and left the pictures question hanging, costing a turn. Rule 1
> says ask the question and nothing else; rule 2 says one question at a time. **Stacking
> breaks both.**
>
> "Carry straight on" means *do not wait for the key before continuing the interview*. It does
> not mean *put two things in one breath*. Pick the key back up whenever they mention it.

Then:

- **If `.env` doesn't exist, create it** before telling them to open it, so they aren't
  hunting for a file that isn't there. It's already in `.gitignore`, so their key stays
  private.
- **Carry on with the interview immediately.** Do not block.
- **When they say the key is in, check `.env` actually contains the line** before relying on it.
  There is no key-test script in this project, and `scripts/tts-generate.mjs` needs a manifest
  and an output directory — it is not a probe. **Do not claim you have "tested" the key.** If it
  turns out to be wrong at generation time, say so then and fall back to captions.
- **If their reply doesn't parse** — a bare number, something about a browser tab — assume it is
  about the key, not about a question you haven't asked. Ask which: *"Is that about the key
  setup? Where have you got to?"*
- **"skip"** → captions on screen, carry on, no further mention of it.

### When the steps don't match what they see

**These steps were checked on 2026-09-19 and will go out of date.** Google moves things.
Always offer the way out in the same message:

> Google moves things around, so if what you see doesn't match this, tell me what you're
> looking at and I'll work it out with you.

If they say it doesn't match:

- **Ask what they can see** — the page title, the buttons, what happened when they clicked.
  Don't repeat the same steps louder.
- **Look it up** if you can, starting from the official page:
  <https://ai.google.dev/gemini-api/docs/api-key>
- **Never tell them they must be wrong.** They're looking at the real screen; you're reading
  notes written months ago.
- **If it still won't work after a couple of honest attempts**, stop: *"I can't get this
  working from here. Let's do captions for now and you can sort the key out later."* Then
  carry on. Don't leave them stuck in setup when they came for a video.
- **Record what you learned** — if the steps have genuinely changed, say so in your report and
  update them here and in `ACCESS.md`. Otherwise the next person hits the same wall.

If they said yes and a key exists, **read the `adding-narration` skill before generating
anything** — `.agents/skills/adding-narration/reference/`, or `.agents/skills/adding-narration/reference/`
before it is installed. The two things that will bite you soonest:

- **The free tier is 10 requests per day, per model** (measured; recorded in `ACCESS.md`).
  Batch two to four sections per call, never one per sentence, and never retry in a loop —
  you will exhaust the day's quota for everyone using that key.
- **Always run `node scripts/tts-verify.mjs` afterwards.** Batched TTS drops lines silently:
  a clean exit code, plausible audio, and a missing sentence. Nothing else catches it.

And one that costs a rebuild rather than a retry: **the audio will not be exactly the length
you planned for.** Measure it against each section and widen the section to fit before
building. If that changes the total, tell them.

---

## Step 4 — Assets

> **Assets for the video?** Choose one:
>
> 1. You have them — you'll send me the pictures.
> 2. I create the pictures for you.
>
> Just reply with a number.

The options say *pictures* on purpose. "Assets" is the heading they'll recognise from
elsewhere, but nobody should have to guess what it means to answer the question.

### Anything they hand you, at any point, goes in

Both options are about **where the main pictures come from**. They are not a limit on what
they can give you.

At any moment — before the question, after it, during refinement — they may send a file and
say *"put my school logo in it"*, *"use this photo"*, *"here's our brand colours"*. **Take it
and use it.** Don't tell them it's the wrong moment, don't send them back through the
question, and don't ask which option this counts as.

- **Say where you'll put it** rather than asking, and invite them to correct you — in **one**
  sentence: *"I'll put the logo on the last scene, say if you'd rather it opened with it."*
  Don't stack clauses about file formats, timing and whether it blocks; that is four
  sentences of friction answering a question nobody asked.
- **Don't let it block anything.** A logo is one small thing, not the picture set. If it has
  not arrived, carry on and pick it up later without mentioning it again.
- **If it changes the look of everything** — brand colours, a typeface — apply it across the
  whole video, not just one scene.
- **If it won't work** — wrong file type, too small, unreadable — say exactly what's wrong and
  ask for another, the same as any other picture.

Default **2**.

### Option 1 — They provide their own

> You can either drag the files into this chat, or put them in
> `public/assets/user-uploads/` and tell me when they're there. PNG, JPG or SVG all work.

- Create `public/assets/user-uploads/` if it doesn't exist.
- **Wait.** Don't move on. Don't quietly substitute your own.
- When they say they're done, list back what actually arrived, in plain words: *"I've got
  three — a bell curve, a bar chart and a photo of a classroom."*
- Anything missing or unusable → say exactly what's wrong and ask for a replacement.
- **Fewer images than the video needs → state what you will do, do not ask.** A question here
  lands next to another question and their one-word answer becomes ambiguous:
  *"I've got three, and the video runs to about eight moments — I'll draw the other five to
  match. Say if you'd rather I reused yours instead."* Then carry on.
- **Work out the real number** from the approved script's section count, not a guess. If the
  script does not exist yet, this conversation is in the wrong order — see step 6.

### Option 2 — You create them

**Nothing to decide now.** Say one line and move on to step 5 — you cannot sensibly propose
pictures before they have read the script, because what the video needs depends on what it
says:

> I'll make them. I'll show you what I'm planning once you've seen the script.

Then carry on: step 5 (style), step 6 (script approval), and **come back here.**

#### After the script is approved, propose the set

Show what you intend to draw, one line each, numbered to match the script. **Do not ask them
to imagine it from nothing** — show them something to react to:

> Here's what I'd draw for each part:
>
> 1. *Three ingredients* — three boxes: Sunlight, Water, Carbon dioxide
> 2. *Inside the leaf* — a loop: Sunlight → Water → Sugar → Oxygen
> 3. …
>
> **How does that look — anything you'd like different?**

- **For topics 1–3 the pack already names a picture for every section.** Show those. Don't
  redesign them, and don't invent a different set.
- **For their own topic**, choose by the **shape of the explanation, not the subject** — a
  process is a left-to-right flow whether it is photosynthesis or a refund policy.
- **Say why anything recurs.** If the same object appears in three sections, that is
  deliberate and worth one clause: *"the wheel comes back twice on purpose — one thing to hold
  onto beats three unrelated pictures."*
- **Change what they ask, then show the revised list.** Don't argue for your version twice.

#### Then ask how they want them made

Once the list is agreed, **one question**:

> **Shall I draw these myself, or would you rather I write prompts you can paste into
> Midjourney, ChatGPT or whatever you use?**
>
> 1. You draw them
> 2. Give me the prompts

Default **1**.

**Option 1 — you draw them.** Draw in code as SVG, animated from `useCurrentFrame()`.
**Don't generate AI images for something you can draw:** `ACCESS.md` records that Gemini image
models, Imagen and Veo all have **no free tier**, and `AGENTS.md` forbids calling paid image
APIs. If a diagram genuinely cannot carry the idea, say so and ask.

**Option 2 — you write the prompts.** Give them one prompt per picture, ready to paste, and
**a shared style preamble to put in front of every one**:

- **The preamble is what makes separately generated images look like one video.** Say so, and
  tell them not to reword it per picture. `content/live-showcase/docs/assets.md` is the
  worked example — its preamble is the reason 28 separately generated files hold together.
- **Ask for transparent backgrounds and no baked shadow** where the picture sits on the page
  rather than filling the frame. A baked shadow glues it flat and cannot be undone.
- **Ask for at least 2× the on-screen size.** The video is 1920×1080; something filling a
  third of the frame wants to arrive at least 1280px wide.
- **Say where to put them when they come back** — `public/assets/user-uploads/`, or dragged
  into the chat. From that point this is exactly option 1, so handle it the same way: list
  back what arrived, say what is missing, and don't quietly substitute your own.
- **Do not wait idly.** Build everything that does not depend on the pictures while they are
  generating, and say that is what you are doing.

**One thing this path cannot do: a ready-made pack's diagrams.** Those name *precision*
figures — a twelve-segment wheel with two named hues opposite, a bell curve with the middle
shaded — where the accuracy **is** what the video teaches. Generators reliably return the
wrong segment count, the wrong order and garbled labels, and a beautiful wrong diagram
teaches the wrong thing. **Say so and offer the split:**

> Generators are great at mood and bad at accuracy — you'd get a lovely wheel with the colours
> in the wrong order, and on this one the wheel *is* the lesson. How about you make the
> backdrops and I draw the wheel precisely on top, in your style?

Offer it once and do what they choose.

## Step 5 — Style

> **What visual style do you want?** Choose one:
>
> 1. I decide — I'll pick something that suits the topic
> 2. ASU's visual style — maroon and gold, ASU fonts
> 3. You tell me — describe the look you want
>
> Just reply with a number.

Default **1**.

### Option 1 — You decide

Pick something that fits the subject and **say what you picked in one line**, so they can
redirect you cheaply:

> I'll keep it clean and simple — dark text on warm off-white, one accent colour. Say if
> you'd rather something with more personality.

Use the `NEUTRAL` block in `asu-visual-style/starter-theme.md` as the starting point. Change
it if the topic wants something else — a children's topic can be brighter, a legal one
plainer — but **compute the contrast of anything you substitute** before you use it.

### Option 2 — ASU

**Read `asu-visual-style` before choosing any colour, font or size.** Find it in whichever of
these exists:

1. `.agents/skills/asu-visual-style/` — once it has been installed as a skill

**Read the files directly if it is not an installed skill.** Do not work from memory and do
not skip it because no skill by that name is offered. The exact values are in there, including
four colour combinations ASU forbids outright and one brand grey that fails contrast.

### Option 3 — They describe it

Ask once, in their words, and give examples so the question is answerable:

> What should it look like? Describe it however you like — "hand-drawn and sketchy", "flat
> and corporate", "dark background with bright colours", or send me a picture of something
> with the right feel.

Then **state how you read it** before building: *"So: dark background, bright accents, rounded
shapes. Right?"* A style described in words is the easiest thing in this whole conversation to
get wrong.

- **If they name specific colours, use them** — and check each one. If a colour they chose
  fails contrast against its background, say so plainly and offer the nearest that works:
  *"That yellow on white is too faint to read — a slightly deeper gold keeps the look and
  stays legible. Shall I?"*
- **If they send a picture**, take the palette and the general feel from it. **Do not copy
  someone else's logo, typeface or layout** — `asu-visual-style/logo.md` covers why.

### Never guess this one

- **Never infer it from account or session metadata.** A signed-in email address, a username
  or a machine name is not something they told you. **If they did not say it, ask the
  question.** Styling someone's video in a university's brand because of who their email
  provider is will read as presumptuous at best, and it is a decision they should get to make.
- **Default straight to option 2 only on an ASU-specific signal** — an `asu.edu` address they
  typed, "my ASU class", a named ASU school, college or department, Sun Devils. Then say what
  you assumed rather than asking: *"I'll use ASU's colours and fonts — say if you'd rather
  something else."*
- **Ask** in every other case, including when they mention a class, a course, students or
  teaching. **Those words are not ASU signals.** A high school teacher saying "for my civics
  students" is not at ASU, and asserting maroon and gold at them is worse than asking.

### What does not change, whichever they pick

**Accessibility is not a style.** Whatever they choose:

- text keeps its contrast minimum against whatever sits behind it
- captions stay on
- type stays big enough to read on a phone
- you still describe what is on screen rather than relying on colour alone to carry meaning

`asu-visual-style/accessibility.md` applies to all three options. Only the **brand** colours
and fonts are ASU's; the rest is what makes any video watchable. **"Not ASU" means different
colours, not unreadable ones** — and if someone asks for something that would make the video
unusable, say so once, offer the nearest thing that works, and do what they decide.

### If they want a logo

**Answer where they ask, not here.** A logo request usually arrives in the opening message or
alongside the assets question — handle it in that same reply. Do not save it for step 5, which
may come two turns too late or not at all.

**Check whether they have a file, then say the matching sentence. One sentence either way.**

**They are sending you one** — or might be:

> Send the logo over whenever you have it and I'll put it at the end — say if you'd rather it
> opened with it.

**They asked for "the ASU logo" and have no file:**

> I don't have an ASU logo file here — if you can get one from your department, send it over.
> Otherwise I'll leave it off and the video will still look right.

**There is no ASU logo file in this repository.** Nothing under `public/` has one. Everything
below is yours to know, not theirs to hear — rule 1 applies here as much as anywhere.

- **If they send a file, use it.** Check it when it arrives, not before — raising PNG-versus-SVG
  before you have seen anything is a problem you invented.
- **If they ask you to add "the ASU logo" and have no file**, say so plainly and move on:
  *"I don't have an ASU logo file here — if you can get one from your department, send it
  over. Otherwise I'll leave it off and the video will still look right."* Do not go hunting
  for one online.
- **Never recreate, redraw or trace it.** Official file or nothing. This is the only element in
  this project not drawn in code.
- **Don't ask whether it is the university mark or their department's** — that costs a question
  and you will know when the file arrives. Unit marks have their own rules; check
  `asu-visual-style/logo.md` once you can see what you were given.
- **Don't animate its shape** — no stretching, spinning or building it up piece by piece.
  Fading it in is fine.

---

## Step 6 — Script approval

**This is the gate. Do not build anything before it.** Everything downstream is built on the
script, so a minute of reading here saves a wasted build.

**Their own topic** — write the script now: the level from step 1, the length from step 2,
roughly **150 words per minute** of finished video. Count the words; overrunning this is the
most common error. Read a script in [../topics/](../topics/) first and
match its tone, section lengths and structure — that's what keeps videos looking like one
series.

**Topics 1–3** — the script is already written. Show it as it is. Don't rewrite it first.

Show the **whole script as plain text** — the actual words, in the chat. Not a file path, not
a summary, and not the section headings or timings.

> Here's what the video will say — have a quick read, it's much easier to change now than
> after it's built.
>
> *[the full script]*
>
> Shall I go ahead, or would you like to change anything?

- Revise until they're happy. Show the changed script again each time.
- "You decide", "looks fine", or no interest in reading it → treat as a yes and carry on.
- **Never skip this**, even for topics 1–3. They have not seen the script before.
- **A "go ahead" before you have shown the script does not authorise skipping it.** People say
  it to move things along. Show the script anyway: *"Here's what it'll say — a quick look and
  then I'll build it."*

---

## Step 7 — Show them the plan

**The last thing before you build.** They have answered five questions across several turns
and approved a script. Nobody holds all of that in their head. Lay it out once, in their
words, and let them change anything:

> Here's what I'm about to make:
>
> - **Colour theory** — what it is, the wheel, and complementary colours
> - **40 seconds**, no voice, words on screen
> - **Five pictures**, which I'll draw
> - **Neutral style** — clean, not ASU
>
> I'll write the scenes, draw the pictures, and render it — a few minutes.
>
> **Anything you'd like to change before I start?**

- **Their inputs, not your decisions.** List what they chose. One line at the end for what
  you will do with it is enough.
- **Always say how the words reach them** — spoken, on screen, or neither. It is the thing
  most likely to have been decided across two separate questions two turns apart, and the
  thing they will most notice if it is wrong.
- **No jargon, no file paths, no counts of components.** Rule 5 applies here more than
  anywhere — this is the summary they will actually read.
- **Include anything you decided for them**, especially defaults they never explicitly chose:
  a length you picked because they were vague, a style under option 1, a picture set they
  approved quickly. **This is the last cheap moment to catch a wrong assumption.**
- **One question, at the end.** Not a question per line.
- **If they change something, show the revised plan** and ask again. It costs one turn and
  it is far cheaper than rebuilding.
- **If the change alters the words, reopen step 6.** A length change here is not a pacing
  change — the ready-made packs are written in tiers, so **2 minutes down to 1 minute deletes
  five whole sections of a script they already read and approved.** Nothing is re-paced;
  material disappears.

  **Name what goes, show the shorter script in full, and get a second yes.** Do not treat
  their approval of the long version as approval of the short one:

  > That's a quick change, but it isn't just faster — it's shorter. These come out
  > altogether: the shortage, the surplus, the things that barely respond to price, coffee
  > and tea, and "it's a model, not a law". Everything else stays at the same pace. Here's
  > the shorter version in full: …

  **A cold run did this correctly on its own judgement, with nothing telling it to.** The
  drop-list rule lives in `.agents/skills/building-scenes/reference/structure.md` and is pinned to step 6, which by
  then has already passed. It is written here now because this is where it actually happens.
- **And re-show the pictures.** The set they agreed at step 4 was for the longer video. Cutting
  120 seconds to 30 took one run's list from thirteen pictures of four kinds to four pictures
  of one kind — their "fine" was given to a list that no longer exists. Same rule as the
  script: show the new list, get a new yes.
- **If they have a voice on, a cut *to* 30 seconds does not give them 30 seconds.** Spoken, it
  lands nearer 40, and the trim that would fix it is forbidden because cutting `core` is what
  the floor forbids. Step 2 warns about this on the way *up* to the floor; someone who picked
  a voice at step 3 and cuts to the floor at step 7 arrives from *above* and never sees that
  branch. **Say it here, plainly**, especially to anyone who mentioned a fixed slot:

  > With the voice on, 30 seconds of words takes about 40 to say — so it won't fit a hard
  > 30-second slot. I can drop the voice and put the words on screen, which does fit. Which
  > would you rather?
- **If they say go, go.** Do not ask twice.

---

## Step 8 — Generate

Build it:

> Building it now, it'll take a few minutes.

**If they said yes to commentary**, say what you're doing one short line at a time —
*"Writing the scenes,"* *"Drawing the pictures,"* *"Rendering the final file."* Not a
technical log.

**If they said no**, stay quiet until there is something to show them. A long silence is
fine; they were told it would take a few minutes.

**Either way, if something fails, say so.** What failed, in plain language, and what you are
doing about it. Don't paste raw errors unless they ask, and never blame them for it. **A
failure is not narration** — it is news, and it goes to everyone.

**Always look at a still before the full render — every time, whatever the topic.** A build
following only this file once shipped a video in which nobody had looked at a single frame.

**Show it to them too.** Earlier wording only showed it for custom topics, which meant that
for the three ready-made ones nobody — not the person, not the agent — ever saw a frame before
a full render. One sentence, every time:

> Here's a picture of how the video will look. Before I build the whole thing — does this
> style work for you?

**Don't say "frame".** It's jargon, rule 5 bans it, and it makes the person wonder what
they're being shown. It takes seconds to render one picture and it catches "that's not the
style I wanted" before a full build.

When it's finished, tell them:

- **Two ways to watch it**, because finding a file is the step people get stuck on:

  > It's ready. You can watch it in your browser at **http://localhost:3000** — or open the
  > file directly: it's saved as `photosynthesis.mp4` in the **out** folder, inside the
  > project folder you downloaded. Double-click it to play.

  **You start the browser preview, not them.** Run `npx remotion studio` in the background
  and hand them the link — never ask them to run it. It opens on port 3000 unless something
  else is already using it; say the port it actually reported, not the one you expected.
  In there they can scrub through, jump to any moment, and replay a bit they want to talk
  about — which makes the refinement round below far easier for them.
- **How long it actually came out**, and what size.
- If sections were dropped to hit a short length, **say which ones**, so they aren't
  surprised by material going missing.
- Then: *"Have a look and tell me what you'd like changed."*

---

## Refinement

Invite it explicitly the first time:

> You can ask me for anything — slower, a different picture, reword the narration, different
> colours, cut a bit, make it longer. Just say it in your own words.

- **Change only what they asked for.** Don't "improve" other things at the same time.
- Unclear ("make it better") → *"Which bit felt off — the pace, the pictures, the wording, or
  the colours?"*
- **Keep the old file.** Don't overwrite — they may prefer the previous one. Name the new one
  so the order is obvious: `water-cycle-v2.mp4`.
- No limit on rounds, and never imply there is one.

---

## If they come back later

Someone may close the terminal mid-way. If a conversation starts and there's recent
unfinished work in `public/assets/user-uploads/`, `out/`, or `src/`, say what you found and
offer to continue:

> Looks like we were part way through a video about the water cycle. Carry on with that, or
> start something new?

---

## Never, in this workflow

- Never ask a question they already answered. Read their message first — step 0.
- **Never run the interview on something this cannot build.** Check at step 0.5 and say so
  then, not after they have approved a script.
- Never explain the machinery in a question. Ask the question, nothing else.
- Never skip the script approval at step 6.
- Never ask them to open a terminal or type a command. **You run installs yourself**, after
  explaining what and why and getting a yes — see the setup check. The one thing they do by
  hand is pasting an API key into `.env`, if they want a voice.
- Never tell them it's too late to change an earlier answer.
- Never show a file path unless it's one they need to open or put something into.
- Never call a paid image, video or audio API. Free tools only, and ask before any spend.
- Never leave them stuck on a missing key — give the setup steps, and always offer captions
  as a way out.
- Never insist stale setup steps are correct when they say the screen looks different.
- Never commit anything to Git unless they ask in that message.
- Never declare the finished video good. They decide that.

---

## For the technical reader

| Answer | Becomes |
| --- | --- |
| Topic | A script in `../topics/`, or one you write |
| Audience | The reading level of each section's narration |
| Length | Optional sections dropped shortest-first, then the rest scaled to fit |
| Voice | WAVs from `scripts/tts-generate.mjs`, verified by `tts-verify.mjs` |
| Pictures | Code-drawn SVG diagrams, or images under `public/assets/` |
| Output | A rendered `.mp4` in `out/` |

New explainers are **1920×1080 at 30fps**. The Lexi Mentors film is 24fps because its footage
plates are 24 — a constraint of that film, not a project default.

Build with Remotion, following `.agents/skills/remotion-best-practices/SKILL.md` and the
development rules in `AGENTS.md`. Nothing here overrides those — this file governs the
**conversation**, not the code.
