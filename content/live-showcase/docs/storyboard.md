# Storyboard

A 70-second silent paper-collage film whose subject is this repository. A person brings an idea and a
storyboard; AI agents assemble it; the cut notices it has no sound; a finished film hands the work
back to the viewer. The tool is a clapboard reading LIVE.

| | |
| --- | --- |
| Format | 1920×1080, 30fps |
| Audio | None. Text carries all meaning |
| Safe margin | 140px |
| Style | Paper cut-out collage — see [`assets.md`](assets.md) |
| Length | 60–70 seconds |

**No frame counts appear in this document.** Each scene's length lives in its own source file as a
named constant, and `npx remotion compositions` prints the film's. A duration copied into prose is a
duration nobody re-checks.

## The two ideas holding it together

**Collage is not decoration here.** The film is about assembling a video out of pieces, and collage
is the art of assembling an image out of pieces. Scene 4 does not illustrate stitching; it performs
it.

**The film shows itself.** The picture playing inside scene 5 is this film's own opening scene,
mounted live rather than captured as a still. The tool made this; here is this being made.

## The rules the film never breaks

1. **Torn edges are human. Cut edges are machine.** Hands and the storyboard sheet are always torn
   and photographic. The agent marks are always cleanly cut and flat. It does the work narration
   would otherwise do.

2. **Density only grows.** Scene 1 is the emptiest frame in the film, which is what earns the density
   of scene 6. Every scene adds paper. The one subtraction — the pause and grey wash in scene 5 — is
   the setup for that scene's turn.

3. **Paper steps, the machine glides.** Every paper element animates on twos, an effective 15fps. The
   clapboard runs at the full 30. The contrast is the point, and the clapboard is the only object in
   the film that moves smoothly.

4. **One line on screen at a time.** A scene may carry several lines in sequence, and scenes 3, 4 and
   5 do. Two lines never share the frame, because at these speeds a second one cannot be read: the
   outgoing line fades before the next arrives.

   Scene 6 is the exception, deliberately. It is a card rather than speech, it is static, and it
   holds for about fifteen seconds, so its text elements sit together.

5. **The type is paper too.** Every line carries a paper-fibre texture and a slightly deckled edge —
   an SVG filter applied once in `PoppedWord.tsx`, not an asset. Set type on scanned torn paper reads
   as a caption laid over a photograph; the fibre and the deckle are introduced together and neither
   works without the other.

   Three things are exempt: the clapboard slug, which is painted on a slate rather than on paper;
   scene 5's intertitle, which is pastiche of a different medium and belongs apart; and scene 6's
   small expansion line, where a two-pixel deckle is a tenth of the cap height and would chew the
   letterforms rather than roughen them.

6. **A silent film says what it is doing.** There is no narration, so anything the audience must
   understand is on the frame in words. This rule is in tension with rules 2 and 4, and where they
   conflict it wins — it is why scene 3 carries two lines, scene 4 four, and scene 5 labels its own
   interface.

7. **The film does not name a vendor.** Three branded marks appear in scene 2 and are consumed by the
   fusion at the end of it. Every agent from scene 3 onward is `agents/ai-generic.png`. A branded mark
   downstream is a defect.

## The scenes

Six scenes, five joins: two clapboard slams and three quiet dissolves.

### 1 · The ask · `SceneOne.tsx`

> *The blank page, and a person who wants something on it.*

The emptiest frame in the film. A periwinkle torn swatch rises from the bottom as a stage, sized to
sit behind the second row of type alone. The question lands at one size in mixed colours: most of it
ink on bare paper, `you` in signal red, and `video?` knocked out white on the swatch.

A black-and-white photographic hand then stamps onto the page, thumbs up, torn-edged, on a butter
swatch with a hard cast shadow that collapses from a high altitude to its resting offset on impact.

**Motion.** The swatch rises on an ease-out. Words pop on a spring, stepped on twos and staggered a
few frames apart so they read as placed by hand rather than typed. The hand falls, squashes on impact,
springs back with a slight overshoot and stops — no slide, no residual wobble. The butter swatch lands
two frames ahead of the hand, so the two read as a stack landing rather than one object. Nothing else
moves.

### 2 · The team · `SceneTwo.tsx`

> *Three models become one, and then the viewer is in it.*

This scene carries the film's thesis rather than introducing a crew, and it is the only scene in which
a vendor is named. The naming is there to be undone.

The question sits at the top of the frame and holds alone for about a second and a half before
anything answers it. Three branded agent marks then fall into a triangle, hold, and bounce — each on
its own period, sharing no factors, so they never fall into unison and each completes a full hop.

They converge on their own centroid, shrinking and spinning, and the generic `Ai` disc pops out of the
pile on the film's spring a few frames before they are gone, so the two events read as one gesture. A
cross-fade would have been easier and would have read as software; everything else in this film is
paper being moved by hand.

The disc then flies down and becomes the face of the figure at the bottom of the frame —
`props/and-you.png`, delivered headless on purpose, so that three models becoming one and the phrase
`and you` are a single continuous move rather than two things happening near each other. The figure is
centred and points out of the frame at the viewer. It fades up rather than sliding in; the disc flying
into it supplies the movement.

### 3 · The storyboard · `SceneThree.tsx`

> *The human's whole contribution is the plan, and it is handmade and imperfect.*

A torn-edged photographic hand enters from the left holding the storyboard sheet — the storyboard for
this film, six panels in loose ballpoint. It carries a small independent rotation settle, so it reads
as physically held rather than pasted.

The agent marks come in off the frame edges and hover over the board, drawn in front of the sheet.
Each straddles an edge or a corner and each keeps clear of the six drawn panels, because a mark parked
over a panel hides the thing the scene is about. They drift on two slow sines and the film's hop arc,
on periods sharing no factors.

Two lines, in sequence and never sharing the frame: `Build a narrative with your agents.` upper left,
then `Then storyboard it.` lower left.

**Motion.** The hand travels in on an ease-out. The marks arrive with the scene 2 bounce but from the
sides, then settle into their hover.

### 4 · Stitching · `SceneFour.tsx`

> *Assembly, shown rather than described.*

The scene opens on `Superb.` — the approval carried out of scene 3, with the chef's-kiss hand rotated
upright, bobbing at centre, then leaving. The frame empties.

Three composition objects then land, staggered rather than simultaneous, in **a row at one height**.
Each is a panel cropped straight out of the storyboard sheet, mounted on a torn scrap, with one agent
mark sitting on it and bobbing. They are panels 1, 2 and 3 of the sheet, which really are this film's
scenes 1, 2 and 3. A row says three things are happening at once; a staircase would say one thing
follows another.

A shimmer — a band of paler paper — sweeps across each crop as its agent works it. Each composition
grows its own torn timeline strip, starting a few frames after it lands and filling before its shimmer
ends, so the recording visibly runs ahead of the work it measures. Those strips draw linearly rather
than eased: this is a recording being laid down, not paper landing.

At the stitch, the three marks leave their compositions, converge above a fourth unbroken strip
drawing across the full width, and merge into a single `Ai` disc that stands over the finished cut.
It is scene 2's fusion played a second time, to say that three parallel workers have become one cut.

**Motion.** Scraps fall on a `t²` parabola with a squash on landing. Marks land about twelve frames
behind them and bob on non-dividing periods. The shimmer steps on twos with everything else.

### 5 · Silent era · `SceneFive.tsx`

> *The film notices it has no sound, and says so.*

The picture sits at centre playing the actual opening of this film — `SceneOne` mounted live, not a
still — with an editing timeline beneath it. Three things label it, and they are the setup for
everything that follows: a `Preview` badge inside the top left of the picture, styled as an interface
chip rather than as speech; `Picture` and `Sound` lane labels in the gutter; and the sound lane drawn
as a visibly empty dashed outline. One lane full and running, one named and conspicuously empty.

The picture then pauses, and a grey wash sweeps across it and its track together. A silent-era
intertitle card cuts in hard — dark card, double rule border, period display face, a faint film-stock
flicker — and cuts out as hard as it arrived.

A small tool, a circle enclosing a music note drawn in code, then travels left to right beneath the
picture track, laying a green audio track as it goes with a stave of noteheads and speech marks
appearing behind it. The green band grows over the empty outline, so the slot reads as being filled
rather than as something that vanished. As the track completes the grey lifts, the picture plays
again, two pairs of hands clap in from the lower left and right, and `Yay!!` lands at centre.

The joke works because it is true: the film is silent because it plays at an expo with no audio, and
it says so without making a sound.

**Green enters the palette here** — Risograph Green `#00A95C`. It means sound and nothing else.

All of the interface lives inside one picture group, which the scene draws twice — once in colour and
once drained behind the wash — so it greys out with the picture rather than sitting on top of the beat
untouched.

The tool is not the generic `Ai` disc, because it is a tool rather than an agent, and that is the only
distinction it carries.

### 6 · The LIVE card · `SceneSix.tsx`

> *The film stops being a film and becomes an invitation.*

One sheet, two columns, and no part of the film in it.

On the left: `Your turn.` at the top, agent marks drifting slowly, and the chef's-kiss hand bobbing at
the bottom — the film still playing around. On the right, fixed and completely still: **LIVE**, a
large QR code on a clean cut-paper backing, and the expansion *Learners Intelligent Video Engineer*.

`Your turn.` bookends the film. Scene 1 opens by pointing at the viewer with `you` in signal red, and
the last frame hands it back to them.

Six agent marks are scattered through the same two margin bands the floating hands occupy, at six
sizes and six tilts. Six identical circles in a grid would read as copies of one file, which is what
they are; the scatter and the variance are what stop them looking it. Nothing is randomised at render
time — the numbers are typed, so the frame is identical on every render. They stay clear of the centre
column, which the QR card, the wordmark, the expansion and `Your turn.` own between them.

**The QR is the one element in the film with a functional requirement** — people scan it off the
screen — so it is never tinted, never overlaid, never animated once landed, and keeps its quiet zone.
The requirement beats the styling.

**This scene is the film's slack.** It assembles in about five seconds and then holds. When the film
is re-timed, this is the scene that absorbs the difference.

## The joins

| Join | Beat |
| --- | --- |
| 1 → 2 | `slateSlam` — the board, slug `SCENE 2 · TAKE 1 · LIVE` |
| 2 → 3 | `paperBreath` |
| 3 → 4 | `paperBreath` |
| 4 → 5 | `paperBreath` |
| 5 → 6 | `slateSlam` — the board, slug `END SCENE 6 · FILM END · LIVE` |

**A transition overlaps its neighbours rather than inserting time.** It consumes its own length off
the tail of the outgoing scene and off the head of the incoming one. The master gives every join
frozen ground to stand on — `holdIn` and `holdOut` in `MasterFilm.tsx` — so a beat near a scene
boundary is not overwritten by the join that follows it.

`paperBreath` is the same rack-and-frost material as the slam with the board and the confetti removed:
a cross-dissolve through the page's own paper white. One vocabulary at two volumes, so the board reads
as punctuation rather than as a tic. Nothing is cut inside it; both scenes stay mounted for its whole
length.

### The board · `SlateScene.tsx`, `Clapboard.tsx`

Three files: `SlateScene.tsx` is the beat, `Clapboard.tsx` is the hinged board, and
`transitions/slateSlam.tsx` is the `TransitionPresentation` that drives the beat from a
`TransitionSeries`. `SlateComposition.tsx` registers it as `LiveShowcaseSlate` so the beat can be
reviewed on its own.

The board stamps in sharp, the arm snaps shut over two or three un-eased frames, the board holds shut
and still while the confetti falls, then stamps out. The snap is an absolute length rather than a
fraction, so it never stretches when the join's length is tuned — it is the one gesture in the film
that must not soften.

**Only the background frosts.** The board and the confetti stay sharp throughout, so the beat carries
no scene of its own and can sit between any two scenes.

**The scraps land flat.** A scrap rounds to the nearest half turn from its own file's flat angle and
squashes onto its long edge, so it reads as lying on a floor rather than frozen mid-spin. Each keeps
whatever horizontal position its own drift and flutter reached — they land where they fall rather than
being gathered into a pile.

The arm is a separate asset, hinged at the pivot mark measured in the delivered PNG.

## Music

The film is built silent and the rules above give text all the meaning. A music bed would be a
separate piece of work: `scripts/build-audio.mjs` is a per-cue trimmer and normaliser with no concept
of a continuous bed, so scoring would mean generalising it or writing something new, plus sourcing a
track.
