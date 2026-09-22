# Assets

Every static asset the film uses, what it is for, and the prompt that generated it. The set lives in
`public/assets/live-showcase/`.

**The prompts are the useful part of this document.** A film assembled from separately generated
images only reads as one film if every generation shares a style preamble, and §1 is that preamble.
Anyone making their own film can copy the shape of what follows: one preamble, then one prompt per
asset that says only what differs.

## How to read this

Assets fall into three classes, and the class decides how much work each one is:

| Class | Count | How it is made |
| --- | --- | --- |
| **Hero art** | 12 | Generated individually, from the prompts below |
| **Reusable kit** | 16 | Generated once in greyscale, then tinted and reused in code across the film |
| **Code-drawn** | — | Nothing to supply; see §5 |

Two rules that hold everywhere:

1. **Transparent background, no baked shadow.** Shadows are animated in code so they can squash on
   impact. A baked shadow glues the paper flat to the page and cannot be undone.
2. **Generate at ≥2× final on-screen size.** The film is 1920×1080; anything that fills a third of the
   frame wants to arrive at least 1280px wide.

---

## 1. The style preamble

Paste this ahead of **every** prompt in §2 and §3. It is what makes 28 separately-generated files look
like one film. Do not paraphrase it per asset — an inconsistent preamble is the single most likely way
this set falls apart.

> Paper cut-out collage element for a motion graphics film. Physical cut paper aesthetic — visible paper
> fiber texture, slight surface grain, matte and unglossy, as though scissored or torn from a real sheet
> and scanned flat. Riso-print / screenprint feel. No gradients, no gloss, no drop shadow, no bevel, no
> 3D rendering, no perspective. Photographed perfectly flat, straight on, evenly lit with no directional
> light. Isolated on a fully transparent background. No background elements, no scene, no surface
> beneath it.

### The edge rule — this carries the film's meaning

Edge quality is how the audience learns the difference between the person and the machine, without
being told. It is never violated.

| Subject | Edge | Why |
| --- | --- | --- |
| Anything human — hands, the storyboard sheet, banners, tape | **Torn.** Rough, fibrous, uneven, with a pale feathered fringe where the fibers separate | Human, made by hand, imperfect |
| Anything agent — the three logos, their backing squares | **Cut.** Clean, crisp, deliberate, as if by scissors or a blade | Machine, precise |
| The clapboard | **Cut**, with a slightly hand-wobbled line | It is the tool — precise, but ours |

State the edge explicitly in the prompt. Generators default to clean edges and will quietly ignore
"torn" if it is buried mid-sentence.

### Palette

Give the generator hex values, not color names.

| Role | Hex |
| --- | --- |
| Paper ground | `#F4F1EA` |
| Periwinkle — the tool, the agents | `#5B4EE8` |
| Signal red — the cut, rejection, attention | `#FF4438` |
| Butter — the human, warmth, approval | `#FFC94D` |
| Ink | `#14120F` |
| Halftone gray | `#B8B4AC` |

---

## 2. Hero art

### 2a. The hands — generate as ONE image, then cut apart

**Do not generate these as six separate images.** Six generations produce six different hands: different
skin, different cuff, different wrist angle, different lighting. Scene 5 rotates the thumbs-down pose
continuously into thumbs-up, and that only works if it is demonstrably the same hand.

Generate one image containing all six poses of the same hand, then cut them apart locally.

> [style preamble]
>
> A reference sheet of ONE person's right hand in six gestures, arranged in a 3×2 grid on a plain white
> background, each pose clearly separated with generous space around it. High-contrast black and white
> photography — real photographic hand, not illustrated, not vector, deep blacks and clean whites with
> visible skin texture, printed halftone grain. Every pose is the identical hand with the identical
> shirt cuff, identical lighting, and the wrist entering from the same angle in every panel.
>
> The six gestures: (1) thumbs up, (2) thumbs down, (3) open hand gripping the edge of a sheet of paper
> as if holding it up, (4) two hands together mid-clap, palms apart, (5) the same two hands with palms
> touching, (6) an "OK" / chef's-kiss gesture, fingertips pinched.
>
> Each hand is torn out of paper — a rough, fibrous torn paper edge runs around the outside of each
> cutout, with a pale feathered fringe where the paper fibers separate.

**Then, locally:** cut into six PNGs with transparent backgrounds, named as below. When cutting, keep
the **wrist anchor identical** — the exact point where the wrist meets the frame edge must land at the
same fraction of each image's box, or poses will jump when swapped.

| File | Scene | Note |
| --- | --- | --- |
| `hands/thumbs-up.png` | 1, 5 | |
| `hands/thumbs-down.png` | 5 | must rotate into `thumbs-up` around the same wrist point |
| `hands/holding.png` | 3 | grips an empty edge — the sheet is composited separately in code |
| `hands/clap-open.png` | 6 | |
| `hands/clap-closed.png` | 6 | |
| `hands/superb.png` | 5 | optional alternate for the approval beat |

If the grid comes back with inconsistent hands, regenerate the **whole grid** rather than patching one
pose. A patched pose is exactly the failure this approach exists to avoid.

### 2b. The clapboard — TWO separate files

The most important constraint in this document. A one-piece clapboard cannot be animated; the arm has to
hinge. Generate the two files separately, and give the generator the same description of the body in
both prompts so they match.

**`props/clapboard-body.png`**

> [style preamble]
>
> The lower body of a film clapperboard, cut from paper — WITHOUT the hinged clapper stick on top. A
> rectangular slate in deep near-black `#14120F` paper, with the word "LIVE" across it in large bold
> condensed sans-serif letters cut from off-white `#F4F1EA` paper. Below the word, two thin horizontal
> ruled lines suggesting blank information rows. A narrow `#FF4438` red paper strip along the bottom
> edge. Clean cut edges with a very slightly hand-wobbled, imperfect line. Straight-on flat view.

**`props/clapboard-arm.png`**

> [style preamble]
>
> ONLY the hinged clapper stick from the top of a film clapperboard, alone, horizontal, nothing else in
> the image. A long narrow paper bar with alternating diagonal stripes of deep near-black `#14120F` and
> off-white `#F4F1EA`, each stripe hand-cut so the diagonals are slightly irregular and not perfectly
> parallel. A small `#FF4438` red paper circle at the far LEFT end marking the hinge pivot. Clean cut
> edges with a slightly hand-wobbled line. Straight-on flat view.

The red pivot dot is not decoration — it is a registration mark. It tells me exactly where to set
`transformOrigin` so the arm swings on the right point. Keep it in the delivered PNG; it sits under the
body and is never seen.

### 2c. `props/storyboard-sheet.png`

The hero prop of scene 3, and the film's self-reference: it is the storyboard *for this film*.

> [style preamble]
>
> A single sheet of off-white `#F4F1EA` paper with torn, fibrous edges, held straight on. Drawn on it in
> loose black ballpoint pen: a hand-sketched storyboard of six rectangular panels in two rows of three,
> each panel numbered in a small circle at its corner, with quick rough scribbles and stick-figure marks
> inside the panels and a few words of illegible handwritten note beneath each. The look of a real
> storyboard sketched quickly in a notebook — imperfect rectangles, uneven line weight, slightly askew.
> Nothing typeset. No color other than the black pen and the paper.

**Note for whoever generates this:** the director's own hand-drawn storyboard for this film is the
reference. Six panels, matching the six scenes after the 5+6 merge. It reads at a glance as "a
storyboard" and does not need to be legible — do not spend attempts chasing readable panels.

### 2d. The three agent marks

> **Scope narrowed 2026-09-02: these three appear in scene 2 and nowhere else in the film.** The
> director made the film LLM-agnostic — the three branded marks fall in, fuse into one generic mark,
> and every agent from scene 3 to the end is `agents/ai-generic.png` (§2e). The optical-sizing table
> below still governs how the three are drawn in scene 2; it no longer governs anything downstream.
> **Do not reintroduce a branded mark after scene 2.**

Flat cut paper, clean edges, no torn fibers anywhere. These are the machine.

> [style preamble]
>
> The [Claude / OpenAI ChatGPT / Google Gemini] logo mark, cut from a single sheet of flat matte colored
> paper. Clean crisp scissor-cut edges, no torn fibers, no outline, no container shape, no background
> panel. The mark alone, filled flat in [see table], with visible paper fiber texture across the surface.
> Straight-on flat view, isolated on transparent background.

| File | Fill | Note |
| --- | --- | --- |
| `agents/claude.png` | `#F4F1EA` on `#5B4EE8`, or the mark in `#14120F` | |
| `agents/chatgpt.png` | `#14120F` | |
| `agents/gemini.png` | `#5B4EE8` | |

**Size them optically, not by pixel height.** A wordmark and a glyph at the same pixel height read as
wildly different sizes. Set them so they *look* equal, then record the scale factors here so the
composition can use them.

**Measured and recorded 2026-09-02, for Scene 2.** Equal-pixel sizing was never the right baseline for
these three — all three are roughly square glyphs, not a wordmark next to a glyph, but they differ
sharply in how much of their own content box is actually ink. "Optical" is made concrete here as: equal
*visual mass* (alpha-filled pixel count within the measured content box), not equal box height. A mark
with less ink relative to its box (more negative space) is drawn larger to read as the same weight as a
denser one.

Measured by decoding each PNG's alpha channel (script: a from-scratch PNG/zlib decoder, no dependency
added — see `Paper.tsx`'s `GEOMETRY` for the resulting content boxes):

| File | Content box | Filled px (α>10) | `sqrt(filled)` | Display content width |
| --- | --- | --- | --- | --- |
| `agents/claude.png` | 607×608 | 182,577 | 427.3 | **240px** |
| `agents/chatgpt.png` | 659×664 | 224,270 | 473.6 | **236px** |
| `agents/gemini.png` | 588×589 | 130,508 | 361.3 | **275px** |

ChatGPT's rosette is the densest mark (most ink per pixel of its box) and is drawn smallest; Gemini's
four-point sparkle has the most negative space and is drawn largest — the opposite of what equal-height
sizing would do. Formula: display width = content width × (K / sqrt(filled)), K chosen so Claude's
display width lands near 240px. Scale factors relative to a naive equal-250px baseline: **Claude ×0.96,
ChatGPT ×0.94, Gemini ×1.10**. These are the widths `SceneTwo.tsx`'s `AGENTS` array uses.

**Trademark note:** these are third-party marks. Fine for an internal or educational showcase; worth a
second thought before this becomes public-facing marketing. Flagged once; proceeding as directed.
**Materially reduced 2026-09-02** — the marks now appear in one scene of six rather than four, and the
film's closing frame, the one an audience photographs, carries no third-party mark at all.

---

### 2e. `agents/ai-generic.png` — the generic mark

**Added 2026-09-02. Supplied by the director, not generated to a prompt in this document.**

A torn-edged circle of cream paper with a deep red `Ai` and a small gold sparkle printed on it. 1268×1241,
content box `[34, 14, 1204, 1187]`. Like the branded marks it arrives full-colour, so it takes **no
`tint` and no `sharpen`** — the paper filters exist to colour flat grayscale artwork and would only
muddy it.

This is the film's agent from scene 3 onward, and it is what the three branded marks fuse into at the
end of scene 2. It is used at six sizes in scene 6, three in scenes 3 and 4, and twice in scene 2 (the
hero disc and the meme's face).

**The `Ai` and the sparkle are artwork, not set type** — see `script.md` §"Not copy".

### 2f. `props/and-you.png` — the closer

**Added 2026-09-02**, replacing `props/scene-2-ending.png` (Sparky), which is now **unused anywhere in
the film**. Its file and its `GEOMETRY` row are retained; nothing references it.

The Spider-Man "and you!" meme with the `Ai` disc as its face, supplied by the director as a fully
opaque RGBA on a flat `#EFEFEF` field. Two things had to be done to it before it could join a collage,
both by `scripts/key-flat-background.py`, which is kept in the repo:

1. **The background was keyed on *paleness* rather than on nearness to a seed colour**, flooding inward
   from the border. The source also carried a faint grey smudge down its lower left, unrelated to the
   figure; keying on paleness removes it in the same pass. Small enclosed pale regions — the highlight
   in the palm, the gaps in the webbing — are refilled afterwards, or the figure comes out full of
   holes.
2. **The head was removed outright, on purpose.** The pasted `Ai` disc is cream paper about nine levels
   away from the background it sat on. No tolerance separates them, and a flood fill leaks through the
   disc's soft edge and fragments the `Ai` into islands. So the file is delivered **headless**, and
   `SceneTwo.tsx` lands `agents/ai-generic.png` into the gap as its own layer — which is better than a
   rescued composite, because it makes the face something the film can animate. The fusion and the gag
   become one move.

Delivered file 620×870, content box `[24, 170, 459, 628]`. The head's centre is at (272, 110) in the
source's own pixels, which is **above** the content box — with the head cut out, the topmost surviving
pixel is the hood. That is not a sign error and `SceneTwo.tsx`'s `HEAD_IN_FILE` records it.

Full-colour, so **no `tint` and no `sharpen`**, for the same reason as the marks.

---

## 3. The reusable kit

Generated once, used across the entire film. **Generate these in grayscale with alpha — no color.**
White-to-gray paper fiber on transparent. Color is applied in code with a multiply blend, which means
four torn swatches serve as the periwinkle stage in scene 1, the butter patch under the hand, the banner
in scene 2, the red slash in scene 5, and the paint sweeps in scene 6.

This is the single biggest saving in the manifest. Do not generate colored variants.

### `texture/torn-swatch-01..04.png`

> [style preamble]
>
> Four separate torn pieces of plain off-white paper, arranged with generous space between them on a
> plain white background. No color, no printing, no marks — blank paper only. Each piece has rough,
> fibrous torn edges on all sides with a pale feathered fringe where the fibers separate. Visible paper
> grain across each surface. Shapes: (1) a wide horizontal band roughly 4:1, (2) a large soft rectangle
> roughly 3:2, (3) a tall vertical strip roughly 1:3, (4) an irregular angular fragment. Flat, straight
> on, evenly lit.

Cut apart into four PNGs.

### `texture/cut-square-01..02.png`

Same idea, but **clean cut edges** — these back the agents, and agents never get torn edges.

> [style preamble]
>
> Two separate squares of plain off-white paper on a plain white background, with generous space between
> them. No color, no printing, no marks. Clean crisp scissor-cut edges, very slightly hand-wobbled so
> the lines are not machine-perfect. Visible paper grain. One a true square, one very slightly wider
> than tall. Flat, straight on, evenly lit.

### `texture/tape-01..03.png`

> [style preamble]
>
> Three separate short strips of matte paper masking tape on a plain white background, generously
> spaced. Each strip torn roughly at both ends with visible fiber fringe, slightly uneven in width,
> lying flat. Plain off-white, no printing, no color, no shine, no shadow. One strip straight, one at a
> slight angle, one slightly curled at a corner.

### `texture/scrap-01..06.png`

Confetti — ejected on every clapboard slam and showered in the final scene.

> [style preamble]
>
> Six small torn paper scraps and fragments on a plain white background, generously spaced, in assorted
> irregular shapes — triangles, slivers, rough squares, a curl. Plain off-white paper with torn fibrous
> edges and visible grain. No color, no printing. Flat, straight on.

### `texture/scribble-01..02.png`

The energy burst behind an agent as it lands.

> [style preamble]
>
> Two separate hand-drawn scribble bursts on a plain white background — dense, rough, energetic pencil
> or crayon hatching radiating outward from a center point, like a child's drawing of an impact. Loose
> and imperfect, visible stroke texture. One a rough starburst, one a dense scrubbed patch. Black on
> white only, no color.

### `texture/paper-ground-1920x1080.png`

One file, laid over the entire film at low opacity.

> A flat scan of a large sheet of plain off-white `#F4F1EA` paper, filling the frame at 1920×1080. Even,
> unlit, no shadows, no vignette, no objects. Visible paper fiber, subtle grain, and very faint tonal
> variation across the sheet — the texture of real uncoated stock. Nothing printed on it.

Opaque, not transparent — this one is a background plate.

---

## 4. Code-drawn — supply nothing

For the avoidance of doubt, none of the following needs an asset:

All on-screen type · halftone dot fields · sound rings and note shapes in scene 5 · scene 5's preview
badge, lane labels and empty-lane outline · every cast shadow · every riso misregistration offset ·
sprocket holes on the film strips · confetti motion and physics · the color drain and flood.

**Type is set in code, not cut from paper.** Both reference frames the director supplied use a clean
bold typeface sitting *on* paper — `1968` in the *Shirley* card is a typeface with per-digit color, and
"Bonjour" sits on a torn periwinkle swatch. Cut-out letterforms would cost ~60 files, freeze the copy,
and look *less* like the references. The paper goes behind the type.

**The paper texture on the type is also code.** Every line carries a paper-fibre multiply and about
two pixels of deckled edge, as an SVG filter — `PAPER_TEXT_FILTER_ID` in `Paper.tsx`, applied once in
`PoppedWord.tsx`. It needs no asset: a texture image masked into glyphs would be a second file fetched
at render time for something a seeded `feTurbulence` does deterministically, and identically on every
render. Three pieces of type are exempt; see [`storyboard.md`](storyboard.md) rule 5.

---

## 5. Delivery

Assets land in `content/live-showcase/intake/` and move to `public/assets/live-showcase/` once
accepted. Everything in `public/` is copied into every Remotion bundle, so anything parked there is
paid for on every preview and every render whether it is used or not.

What to check before accepting one:

- Transparent background, with no residual white halo
- No baked drop shadow
- Edge quality right for its class — torn for human, cut for agent
- Kit assets greyscale rather than pre-coloured
- At least twice its final on-screen size
- The hands visibly the same hand, sharing a wrist anchor
- The clapboard as two files, with the pivot mark on the arm

**Two of those do not hold in this film's own set, and were accepted anyway.**
`props/clapboard-body.png` carries a baked drop shadow, and `texture/paper-ground.png` is
1672×941 rather than 1920×1080. Both were judged good enough to ship. They are recorded here
because a list of rules with no exceptions in it teaches the wrong lesson about how the work
actually goes.

**Two files on disk are used by nothing:** `props/scene-2-ending.png` and `hands/thumbs-down.png`.
Both belonged to earlier versions of scenes that were rebuilt. They are kept rather than deleted, and
nothing references them.

**Nothing here cost money.** Every generation was on a free tier and the project total is $0.
