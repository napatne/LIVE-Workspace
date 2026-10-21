# The style card

**For the assistant.** A film's style written down as rules every scene follows. It lives at
`content/<project>/docs/style.md` and is written once the person has chosen a style, before the
first asset or scene.

The ten-section shape is adapted from the `STYLE.md` contract in Lemo-Opuscar
(`lemomo-ai/lemo-opuscar`, MIT), which keeps fifty-odd styles this way. The wording here is ours.

## Contents

- [What goes on a card, and what does not](#what-goes-on-a-card-and-what-does-not)
- [The template](#the-template)
- [Worked example — paper collage](#worked-example--paper-collage)

## What goes on a card, and what does not

**On it:** whatever stays true for every film made in this style — the look, the material, the
colour logic, the type, how things move, how the camera behaves, what it sounds like, the moves it
does well, the mistakes it invites.

**Not on it:** anything belonging to one film — its story, its scenes, its running time, the colour
of one scene's backdrop, its end card, its tune. Those go in the storyboard and the brief. A card
carrying one film's story turns the next film in that style into a copy of the first.

**Rules, not adjectives.** "Warm" is not a rule; "backgrounds are `#F4F1EA`, never white" is. The
test for every line: could someone look at a frame and say whether it was followed?

## The template

```markdown
# <Style name> — style card for <project>

One or two sentences: what the medium is, and what it does on screen.

## 1. Essence, and what it is not
Three to five traits that make one frame read as this style. Then the styles it is easily confused
with, and the line between them.

## 2. Materials
What it is made of and how code imitates it — surfaces, edges, texture, light. Which parts are
drawn in code and which are generated or supplied pictures.

## 3. Colour
Hex values, six or seven at most, each with what it is FOR. What may never be coloured.

## 4. Type
One face (licence checked), two or three sizes, where text lives, and how long a line stays up:
at least max(1.8 s, the time to read it aloud + 0.6 s).

## 5. Motion
Smooth or stepped (on ones, on twos), the easing, how things arrive and leave, what never moves.

## 6. Camera
The moves this style does well and what each one expresses. Transitions allowed and forbidden.

## 7. Sound
Instruments and textures that belong to this world, the sound of its materials, how silence is
used. scoring-music reads this section first.

## 8. Native moves
Moments only this style can do. For each: what it is, and three kinds of content it fits.

## 9. Pitfalls
Mistakes the medium itself invites, each with its fix.

## 10. What varies per film
Which things the story decides each time, named but not filled in: structure, characters, opening,
ending, pace, palette within the colour logic. This film's answers to them go in the storyboard
and the brief, not here.
```

**Section 10 is a list of open questions, not this film's answers.** It says what a film in this
style is free to choose, so the next film knows where it may differ. Writing this film's opening or
pace into it is the one-film content the card must not carry.

## Worked example — paper collage

The style of the LIVE showcase in this folder, written as a card. Its kit is in
`src/experiments/live-showcase/`; its full documents are in `content/live-showcase/docs/`.

**Paper collage.** A film assembled on screen out of torn and cut paper, photographic cut-outs and
printed type — the making of the picture is visible in the picture.

1. **Essence.** Torn edges, flat cut shapes, real paper fibre, pieces that arrive and stay. Not
   scrapbook clutter, not a slideshow of photographs, not a flat-vector explainer with a paper
   texture laid over it.
2. **Materials.** A warm paper ground; torn swatches and photographic cut-outs generated as
   transparent stills; paper fibre and a deckled edge applied to type as an SVG filter
   (`Paper.tsx`, `PoppedWord.tsx`). Shadows are drawn in code so they move as a piece lands.
   **Torn edges are human, cut edges are machine** — hands and sheets are torn, machine marks are cut.
3. **Colour.** Ground `#F4F1EA`; ink `#14120F`; one signal colour (`#FF4438`) reserved for the
   word that matters; spot colours as paper, not as fills. A colour that means something keeps
   that meaning for the whole film (`theme.ts`).
4. **Type.** One face, set as paper — it carries the fibre and the deckle like every other piece.
   One line on screen at a time.
5. **Motion.** **Paper steps, the machine glides**: paper animates on twos (`onTwos` in
   `theme.ts`); only a machine object moves smoothly. Arrive with a small pause, the move, a settled
   stop. Density only grows across the film.
6. **Camera.** Locked off; the page is the frame. Joins are a hard slam (`transitions/slateSlam.tsx`)
   for a change of act, a quiet dissolve (`transitions/paperBreath.tsx`) within one.
7. **Sound.** The worked example is silent on purpose. If scored: paper rustle, snaps and claps as
   foley; plucked and percussive instruments that step like the paper does; silence used as a
   beat, not as an absence.
8. **Native moves.** A piece slammed onto the page (an arrival, a verdict, a joke landing). A page
   built up piece by piece (assembly, a process, a list). A torn reveal (before and after, a
   secret, a correction).
9. **Pitfalls.** Clutter — every piece must earn its place, or the frame reads as a scrapbook.
   Type on scanned paper without fibre reads as a caption pasted on a photo. Generated pieces drift
   apart in style unless every prompt carries the same preamble (`creating-assets`).
10. **What varies.** The story, the signal colour's meaning, which pieces exist, the pace, the
    number of scenes, whether it has music. (The showcase's own answers — silent, which pieces —
    are in its storyboard, not here.)
