# Building a scene

What an assistant needs in order to add or rebuild one scene of this film without breaking the other
five. It is written for this film, and most of it transfers to any collage film built the same way.

**Read this whole file before touching anything.** Then read the scene you are working on, and
`SceneTwo.tsx`, which is the worked example of every pattern here.

## 1. The film

A silent paper-collage film whose subject is this repository. Full description in
[`storyboard.md`](storyboard.md); every word it says is in [`script.md`](script.md).

| Setting | Value |
| --- | --- |
| Frame rate | **30.** Never mixed |
| Resolution | **1920 x 1080** |
| Audio | **None.** Text on screen carries all meaning |
| Safe margin | **140px** on every edge |
| Length | 60-70 seconds. `npx remotion compositions` reports what it currently is |

## 2. The rules the film never breaks

The seven rules are in [`storyboard.md`](storyboard.md) and each one does work that narration would
otherwise do. The four that constrain a scene file most directly:

1. **Torn edges are human, cut edges are machine.** Hands, tape, torn swatches and the storyboard
   sheet are torn and photographic. Agent marks are cleanly cut and flat. They are never mixed.
2. **Density only grows.** A scene is not emptier than the one before it.
3. **Paper steps on twos.** Every paper element quantises its frame through `onTwos`. The clapboard
   is the one thing that moves at the full rate.
4. **One line on screen at a time**, faded out before the next arrives.

And two that are easy to break without noticing: **no branded agent mark after scene 2**, and **the
type carries the paper filter** — which it does automatically, by going through `PoppedWord`.

## 3. What is shared, and what is yours

**Yours:** the scene file you are building, and one appended entry in `src/Root.tsx`.

**Shared, and a change here affects every scene:**

```
src/experiments/live-showcase/theme.ts          the palette, easings, onTwos, settle, seeded
src/experiments/live-showcase/Paper.tsx         asset geometry, tints, PaperPiece, the filters
src/experiments/live-showcase/PoppedWord.tsx    all on-screen type
src/experiments/live-showcase/MasterFilm.tsx    the scene table and the joins
src/experiments/live-showcase/transitions/      slateSlam, paperBreath
```

If a shared file genuinely has to change, say so with the exact change rather than making it
quietly. A scene that only works because the kit moved under it takes the other five with it.

**Re-time in the master's scene table, not in a scene file.** `head`, `tail`, `holdIn` and `holdOut`
in `MasterFilm.tsx` are how a scene is fitted to the film. A scene edited to fit the master stops
being reviewable on its own. And when a scene's length does change, check its master row — `head` and
`tail` are stated in that scene's own frames and do not travel with it.

### Registering a scene

`src/Root.tsx` groups compositions into folders. Inside the `LIVE-showcase` folder there is a
marker:

```tsx
{/* ---- APPEND NEW LIVE SHOWCASE SCENES BELOW THIS LINE ---- */}
```

Append after it, importing the duration constant rather than typing a number:

```tsx
<Composition
  id="LiveShowcaseSceneFour"
  component={SceneFour}
  durationInFrames={SCENE_FOUR_DURATION}
  fps={30}
  width={1920}
  height={1080}
/>
```

Append only, keep the marker line, and add the import beside the other live-showcase imports. A
typed duration and an imported one will disagree eventually, and the composition is what cuts off
its own last frame when they do.

---

## 4. The shared kit

Everything below already exists and is imported by a scene file. It is the whole API a scene needs.
Read `SceneTwo.tsx` once first — it is the worked example of every pattern here.

### From `./theme`

```ts
WIDTH        // 1920
HEIGHT       // 1080
FPS          // 30
SAFE_MARGIN  // 140

COLORS       // { paper, periwinkle, red, butter, ink, halftone }
             // #F4F1EA  #5B4EE8  #FF4438  #FFC94D  #14120F  #B8B4AC

EASE_OUT     // the film's general decelerate — paper landing
EASE_IN      // the film's general accelerate
EASE_IN_OUT  // even travel, used by the slam's lift

onTwos(frame: number): number
  // Quantise the frame BEFORE deriving anything from it:
  //   const f = onTwos(useCurrentFrame());   👍
  //   const y = Math.round(smoothY / 2) * 2; 👎  steps the value, not the timing

ramp(frame, start, end, easing = EASE_OUT): number   // clamped 0..1 progress

settle(t, period = 13, damping = 0.42): number
  // A spring that overshoots and settles. 0 at t <= 0, approaches 1.
  // Sampled on twos, so it is a plain function of a quantised frame — do NOT
  // use Remotion's spring() anywhere in this film.

seeded(n: number): number
  // Deterministic pseudo-random in 0..1. Confetti, scrap ejection and riso
  // jitter MUST use this. Math.random() strobes, because Remotion renders
  // frames out of order and in parallel.
```

### From `./Paper`

```ts
asset(path: string): string
  // asset("texture/tape-01.png") -> the staticFile() URL. Always use this.

GEOMETRY
  // Every asset your scene needs is ALREADY measured here:
  //   { box: [w, h], content: [x, y, w, h] }
  // `box` is the file; `content` is the opaque bounding box inside it. Files
  // carry transparent padding — positioning by the box is what makes collage
  // drift. If a row you need is missing, say so in your report; do not add it.

placeByContent(key, { left, top, width? | height? }): CSSProperties
  // Give it the rectangle the VISIBLE paper should occupy on the page and it
  // returns the absolute style that puts it there. Supply width or height;
  // the other follows the content's own aspect. Nothing is ever stretched.

PaperFilters
  // Render ONCE per scene, at the top. Defines the tint filters.

PaperPiece
  // <PaperPiece name src tint? shadow? style? />
  //   src     "texture/tape-01.png" — path only, asset() is applied for you
  //   tint    "periwinkle" | "red" | "butter" | "ink" | "paper" | "halftone"
  //           Omit for anything already carrying its own colour: the
  //           photographic hands, the agent marks, the clapboard.
  //   shadow  { x, y, opacity } — hard offset, no blur. Animate it.

ARM_PIVOT   // the clapboard arm's hinge, as a fraction of its own box
```

**The whole reusable kit is grayscale on disk and tinted in code.** There are no coloured variants
of any texture and you must not ask for one — four torn swatches serve as the periwinkle stage in
scene 1, the butter patch under the hand, the red slash in scene 5 and the paint sweeps in scene 6.

### From `./PoppedWord`

```tsx
<PoppedWord word={{ text, color }} index={i} frame={f} appearFrame={N}
            stagger={3} fontFamily={display} fontSize={N} settlePeriod={18} />
```

Words pop on a spring, stepped on twos, staggered so they read as placed by hand. Lay them out in
a flex row with a `gap`. Load the face with:

```ts
import { loadFont as loadArchivoBlack } from "@remotion/google-fonts/ArchivoBlack";
const { fontFamily: display } = loadArchivoBlack();
```

---

## 5. The shape of a scene file

Every scene starts the same way. Copy this.

```tsx
export const SceneFour: React.FC = () => {
  const f = onTwos(useCurrentFrame());          // quantise ONCE, at the top

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.paper }}>
      <PaperFilters />
      <Img
        name="Paper ground"
        src={asset("texture/paper-ground.png")}
        style={{ position: "absolute", left: 0, top: 0, width: WIDTH, height: HEIGHT }}
      />
      {/* your scene, back to front */}
    </AbsoluteFill>
  );
};
```

Also export your duration as a named constant, so the coordinator can register it without
guessing:

```ts
export const SCENE_FOUR_DURATION = 344;
```

**Every animated value derives from `f`.** No CSS transitions, no `animation`, no `Date.now()`, no
`Math.random()`, no `spring()`. If a value does not come from `f`, it is a bug.

---

## 6. Timing

**Every frame count in a scene plan is a starting estimate, not a target to defend.** Scene lengths
in this film were set by watching, not by arithmetic. The numbers exist so that scenes get built at
comparable scale and can be watched next to each other; the real durations get settled afterwards,
once they can be seen in sequence.

So: build to the number you were given, and if a beat wants longer, say so and name the beat and the
change you think it wants. A silent adjustment is the thing to avoid; the observation is useful.
**Do not cut a beat to hit a total.**

Write beat timings as named constants at the top of the file rather than as numbers buried in the
body, so re-timing is editing a short list.

### A join overlaps its neighbours

A transition does not insert time. It consumes its own length off the tail of the outgoing scene and
off the head of the incoming one, so a beat placed near a scene boundary can be overwritten by the
join that follows it — while every number in the plan still adds up. That happened here: three scenes
lost real beats to it before the master was rebuilt.

The master now parks each join on frozen frames — `holdIn` and `holdOut` — so a scene no longer has
to guess the join's length. Two habits still help:

- **Open on the near-bare page.** Nothing that must be read goes in a scene's first frames.
- **End on a hold**, not a beat. Nothing arrives or resolves in the last frames.

Reviewed on its own, a scene built this way opens on bare paper and ends on a still frame. That is
correct rather than a defect, and moving beats outward to "fix" it is what puts them under the join.

---

## 7. Verifying your work

Run both, and both must be clean:

```
npm run lint                 # eslint + tsc, no errors
npx remotion still LiveShowcaseSceneN out/sN-fNNN.png --frame=NNN --scale=0.5
```

Render stills at the frames your plan lists under "Check these frames". Look at them. They catch
geometry blunders — a piece off frame, two pieces overlapping, a shadow on the wrong side.

**A still tells you whether the geometry is right. It cannot tell you whether the scene is any
good.** Only the director judges that.

---

## 8. What not to claim

**An assistant does not judge its own output.** Technical defects are worth reporting — a piece
clipping the frame edge, a wrong resolution, a value that does not derive from the current frame.
Whether a scene looks good, reads well or lands is settled by watching, and that belongs to whoever
the film is for. Say what was built and what was verified.

---

## 9. What to report

Report in the reply rather than writing a summary document. Cover, briefly:

1. The file, and its exported duration constant.
2. The beats placed, and where.
3. The result of `npm run lint`.
4. Which stills were rendered, and what each one ruled out.
5. Anything in the plan that could not be done, or was done differently, and why.
6. Any shared file that needs a change — described, not made.

Then stop, and leave the work uncommitted for review.
