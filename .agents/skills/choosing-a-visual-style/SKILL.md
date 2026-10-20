---
name: choosing-a-visual-style
description: Decides what a video looks like - palette, edges, motion, type and texture - from a catalogue of styles that can be made here, and writes that decision down as a style card an assistant can build to. Use when the look is undecided, when someone asks what styles are possible or says "you pick the style", when someone asks for brand or ASU compliance, when images generated separately do not look like they belong to one film, or before generating any asset at all.
---

# Choosing a visual style

**Use this when** the look has not been settled, or when what has been generated does not hold
together as one film.

**You need first** a subject, an audience, and the story approved in words (`building-a-video`
step 3). Style follows all three. Chosen before them, it produces a video that looks considered and
says nothing.

**This produces** a style card in `content/<project>/docs/style.md` — five specific answers, plus how
things move, what it sounds like, and what goes wrong in it — and a style preamble reusable verbatim
at the head of every image prompt.

**Then go to** `creating-assets`.

---

## Why this comes before anything is made

The style decides what pictures are needed, what colours they are, how they move, and what the text
looks like. Changed later, most of that work happens again.

It also decides whether the video looks like one thing. Assembled from pictures made at different
times under no shared rule, a video reads as a collage of accidents. The rules agreed up front are
what prevent that.

## Ask which of three routes the person wants

Ask. Do not infer the answer from their email domain, their institution, or the subject matter.

| Route | What it means | What it costs them |
| --- | --- | --- |
| **They bring the look** | They have references, or a style in mind. They describe it; turn it into specifics | Most control, most of their time |
| **Choose from three** | Given the subject, the audience and the story, propose three distinct styles that can be made here and recommend one | Choosing is easier than inventing, and they keep every veto |
| **Brand compliance** | An institution's colours and typefaces settle most of it | Least decision. Read `asu-visual-style` for the ASU values |

**The worked example's paper collage is one style, not the house style.** It is in this folder
because one film was made in it. Offer it when it fits the subject, never by default.

## Proposing three

Pick three from [`reference/styles.md`](reference/styles.md) that suit the subject and differ from
each other — not three palettes of one look. One line each: what it looks like, and what it is good
at. Then recommend one and say why, in a sentence.

> Three ways this could look:
>
> 1. **Whiteboard** — drawn line by line as it's explained; good for a process with steps.
> 2. **Flat vector** — clean shapes and bold colour; good for something friendly and quick.
> 3. **Blueprint** — white lines on deep blue, labelled like a diagram; good for how a thing is built.
>
> I'd go with the whiteboard — your subject is a sequence, and drawing it in order explains it.
> Which one?

**"You pick"** is an answer: take your recommendation, say it in one line, and write it into the
brief as yours (`building-a-video` → `reference/decisions.md`). Then build the style card and show
them **one still in that style** before anything else is drawn — a style chosen from a sentence is
the easiest decision in the project to have got wrong.

**If they did not ask for a brand, do not apply one.** An `asu.edu` address is not an instruction,
and neither is the word "class" or "students". If something comes back maroon and gold unasked, a
decision that was theirs has been made for them.

**Declining a brand does not decline the accessibility rules.** Readable contrast, captions, and
describing what is on screen apply on all three routes. Those live in `asu-visual-style` too, in
`accessibility.md`, and they are the part that is not about any institution.

Whichever route, the outcome is the same shape: five answers, written down. A proposed or brand-led
style still has to end up as rules, because rules are what stop it drifting across a whole video.

## Choosing, when the person has no reference in mind

**Start from work that already exists.** Ask them for two or three videos they like, and watch those
for rules rather than for ideas.

Then three questions about what comes back:

1. **Can this actually be made here?** A style resting on hand-drawn character animation needs an
   animator. A style resting on flat shapes and text does not.
2. **Does it suit the subject?** A soft, warm look and a serious subject undercut each other. So do
   a cold, precise look and a playful one.
3. **Will it survive being made twenty times?** A whole video needs many pictures. A style that
   depends on one perfect illustration falls apart across a set.

The style to pick is the repeatable one, not the one that looks best once.

**If the person has references, ask for stills rather than descriptions.** A paused frame settles
palette, edges and texture in a single look. The same thing in words takes a paragraph and still
leaves room to interpret it differently.

## Write the decision as rules, not adjectives

A rule is specific enough to be broken. An adjective is not, and two people will read it two ways.

| Not a rule | A rule |
| --- | --- |
| Warm and friendly | Backgrounds are always `#F4F1EA`, never white |
| Nice animation | Everything moves in steps, 15 a second, never smooth |
| Clean and modern | No gradients, no drop shadows, no 3D |

The test: look at a finished frame and say whether it follows the rule. If that cannot be answered,
it is not yet a rule.

**Write down what it must not look like, in one sentence.** *Not a dashboard demo, not a slide deck,
not a cartoon, not a generic motion-graphics template.* One sentence like that rules out most of
what gets produced by default when nothing has been said.

## The five things to pin down

Get a short answer to each before anything is generated.

**Colours.** Hex codes, not names. Six or seven is plenty. Then what each one is *for* — a colour
that means something is worth more than a colour that is merely present. If red means a cut or a
rejection, it cannot also be a background. Keep them in one file in the code, so changing a value
changes the whole video.

**Edges.** How shapes end: sharp and geometric, soft and rounded, rough and hand-torn. This is the
strongest single signal of a style and the one most often left undecided.

**Motion.** How things arrive and leave — slide, fade, drop, snap — and whether the movement is
smooth or stepped. One behaviour, reused. A video where every element moves differently reads as
broken rather than varied.

A pattern worth copying: **a small pause, the movement, then a settled stop.** Nothing drifts,
nothing bounces decoratively, and nothing is moving while the viewer is meant to be reading.

**Type.** One typeface. Two or three sizes. Then a decision about whether text sits on top of the
picture or is made of the same material as it.

**Texture.** Flat and clean, or grain, paper fibre, print marks. Flat is easier. Texture is more
distinctive and has to be applied to everything, or it reads as an accident.

## The style preamble

Once the five answers exist, compress them into one paragraph and **paste that paragraph at the head
of every image-generation prompt, unchanged.** It is the single reason separately generated images
read as one film. `creating-assets` uses it on every asset; the worked example keeps its own in
`content/live-showcase/docs/assets.md`.

## Two things that decide the style without being style decisions

**Footage sets the frame rate.** If the video contains footage of any kind — filmed or generated —
it arrives at some rate and that rate wins. Leave the frame rate open until the first motion test
rather than choosing a number and then fighting the material. Where nothing constrains it, 30 is
the default here.

**Whether real people appear is decided before the look is.** A style built on written descriptions
handed to an image generator, rather than on photographs, means no likeness of anyone is used
without their agreement. That removes the question rather than answering it, and the two are worth
distinguishing when the decision is recorded.

## Some subjects need no pictures at all

Where the subject is an idea rather than a thing, a video can be drawn entirely in code — shapes,
lines and text, no generated assets. It costs nothing to change, it cannot look like a cheap
cartoon, and for a subject about judgement or process it often explains better than illustration
would.

**Deciding to use no images is a style decision like any other**, and gets written down with the
same five answers minus texture.

One rule belongs with it: **no invented interfaces.** No pretend buttons, browser windows or
features, even drawn ones. A film about a real tool that shows a made-up version of it is
misrepresenting what the tool does.

## The style card

The five answers are the start of the card, not all of it. A style also decides how a scene is
filmed and what it sounds like, and if those are left open each scene invents its own. Write the
card to `content/<project>/docs/style.md` with ten short sections — the shape is in
[`reference/style-card.md`](reference/style-card.md):

1. **Essence, and what it is not** — the three to five traits that make one frame read as this
   style, and the styles it is easily confused with.
2. **Materials** — what it is made of, and how code imitates it.
3. **Colour** — the five-answers palette, with what each colour is *for*.
4. **Type** — face, sizes, and whether text sits on the picture or is made of it.
5. **Motion** — stepped or smooth, the easing, how things arrive and leave, what never moves.
6. **Camera** — the moves this style does well and what each expresses.
7. **Sound** — the instruments and textures that belong to this world. It is what
   `scoring-music` reads first, so the music matches the picture by design rather than by luck.
8. **Native moves** — the moments only this style can do.
9. **Pitfalls** — the mistakes the medium itself invites, each with its fix.
10. **What varies per film** — what stays open for the story to decide.

**Only what holds for every film in the style goes on the card.** This film's story, its palette
choices for one scene, its running time — those go in the storyboard. A card that carries one film's
story makes the next film in that style a copy of the first.

**A style the person invents gets a card too**, and it can join the catalogue for the next film:
[`reference/styles.md`](reference/styles.md) says how.

## Hand the rules over before any code

Put the card — or at least the five answers — in front of whoever builds, before the first scene is
asked for.

Two things that buys. The look stops being reinvented, differently, on each request. And there is
something to point at when a frame comes back wrong: *this breaks rule 3* is a faster correction
than *this looks off*.

## What is judged by watching

Contrast ratios can be measured. Whether the film looks like one thing cannot.

**Never report a style as working.** Technical defects are reportable — a ratio under 4.5:1, a
banned colour combination, a typeface that is not the one agreed. Whether it looks right is the
person's call, and expect most of their time on this to go on watching and saying what is off.

Expect to be told the same thing twice. When a correction is made and the result is still wrong,
the note may have been about the *character* of a thing rather than its *degree* — quieter when the
problem was the sound itself, smaller when the problem was the shape. Re-read the note before
adjusting the same value again.

## Reference

- [`reference/styles.md`](reference/styles.md) — the catalogue: styles that can be made here, what
  each is good at, how it is built in code, and what it costs. Paper collage is the first entry.
- [`reference/style-card.md`](reference/style-card.md) — the ten-section card to fill in for a
  film's style, with the paper-collage card as its worked example.
- [`reference/worked-examples.md`](reference/worked-examples.md) — three films, the style each one
  landed on, and what the choice cost.
- `asu-visual-style` — ASU colour, typography, logo and accessibility, with every value cited and
  dated. Read it before choosing any colour if the brand route was picked, and read its
  `accessibility.md` whichever route was picked.
- `creating-assets` — the next step, and where the style preamble gets used.
