import { loadFont as loadArchivoBlack } from "@remotion/google-fonts/ArchivoBlack";
import { AbsoluteFill, Img, interpolate, useCurrentFrame } from "remotion";
import {
  asset,
  GEOMETRY,
  PaperFilters,
  PaperPiece,
  placeByContent,
  type Tint,
} from "./Paper";
import { PoppedWord, type Word } from "./PoppedWord";
import {
  COLORS,
  EASE_IN_OUT,
  EASE_OUT,
  HEIGHT,
  onTwos,
  ramp,
  SAFE_MARGIN,
  settle,
  WIDTH,
} from "./theme";

const { fontFamily: display } = loadArchivoBlack();

/**
 * Scene 2 · The team.
 *
 * > *Three branded models arrive, become one unbranded one, and the answer
 * > turns out to include whoever is watching.*
 *
 * ---
 * ## Rebuilt 2026-09-02 — the film goes LLM-agnostic
 *
 * The director's note, and it is the reason this scene now carries the film's
 * whole thesis rather than just introducing a crew:
 *
 *   > *"we need to point to a generic ai thus making the system llm agnostic.
 *   > the idea is we start with dropping the ai llm logos into the screen and
 *   > then fusing them into this generic logo. thus here on wherever we will
 *   > see ai agents we will use this generic logo ... this starts at scene 3
 *   > and travels all the way till the end. and then the and-you gag, here
 *   > sparky is to be replaced with the spiderman meme with ai face, and the
 *   > meme timings need to land as well so that there should be a slight pause
 *   > with who is your team on top, then bouncy and fusing ais and then at the
 *   > bottom and you with the meme."*
 *
 * **This is the only scene in the film where a vendor is named.** The three
 * branded marks fall, hold, and are consumed by the fusion; from scene 3 on,
 * every agent in this film is `agents/ai-generic.png`. If a branded mark ever
 * reappears downstream, that is a bug, not a callback.
 *
 * ### What changed structurally
 *
 * | | Was | Now |
 * | --- | --- | --- |
 * | The question | one line at the BOTTOM, `Who's your team? and you` | split — question at the TOP, `and you` at the bottom |
 * | The marks | fall, hold, scene ends | fall, hold, **fuse into one disc** |
 * | The closer | Sparky, fading in bottom right | the `and you!` meme, with the fused disc flying in as its FACE |
 * | Length | 180f | 330f — three beats where there was one |
 *
 * The split question is the director's staging and it earns itself: the
 * question is asked at the top, the frame spends its middle answering it three
 * times over and then once, and the last word of the answer lands at the
 * bottom next to the thing pointing at the audience. Read top to bottom, the
 * frame is the sentence.
 *
 * **The fusion is a physical move, not a dissolve.** The three marks converge
 * on their own centroid, shrinking and spinning as they go, and the disc pops
 * out of the pile on the film's `settle` spring four frames before they are
 * gone — so the two events overlap and read as one. A cross-fade would have
 * been easier and would have looked like software; everything else in this
 * film is paper being moved by hand and this had to be too.
 *
 * **The disc then becomes the meme's head**, which is why the meme asset is
 * delivered headless (see `props/and-you.png` in `Paper.tsx`). The fused mark
 * flies down into the gap and lands as the face, so "three models become one"
 * and "and you" are a single continuous move rather than two things that
 * happen near each other.
 *
 * ### What was kept
 *
 * Everything the director settled on the earlier passes, because none of it
 * was reopened:
 *
 * - The marks fall on the `EndingScene` t² curve into a triangle, not a row —
 *   *"maybe in sort of a triangle configuration and they slightly sway"*.
 * - `team?` and `you` are red and `and` is ink — *"can we make and black"*.
 * - The bob and sway periods share no factors, so the three never fall into
 *   phase. **Motion is still the only thing registering a landing** — the cut
 *   squares and the scribble bursts were deleted on an earlier note and are not
 *   coming back.
 * - The closer **fades** rather than slides — *"have sparky fade in instead of
 *   slide in"*. That instruction was about this slot, not about that asset, so
 *   the meme inherits it. The disc flying into it supplies the movement.
 *
 * The triangle moved down 90px because the question moved to the top and
 * Claude's mark was landing under it. The figure only translates; the shape,
 * the fall timings and the optically-matched widths are untouched.
 */

/** 330, up from 180 — see the beat table. `LIVE_SCENE_TWO` is the number. */

/* ------------------------------------------------------------------- beats */

/**
 * **The pause the director asked for is f18 → f62** — the question alone on the
 * page for about a second and a half, which is the one beat in here doing
 * nothing on purpose. The previous cut released the first mark 20 frames after
 * the title and the line never registered as a question at all.
 *
 * It was f18 → f74 for a pass, and the twelve frames came back out: at nearly
 * two seconds a three-word question stops reading as a pause and starts reading
 * as a scene that has not begun. The twelve went to the hold before the fusion
 * instead, where every mark now completes at least one full hop — which is what
 * *"bouncy"* asked for and what 62 frames of hold was too short to deliver.
 */
const TITLE_IN = 18;

/**
 * The three marks are released at f62/76/90 and land 12 frames later, then hold
 * and bounce until the fusion starts. The last of them is down at f102, so the
 * hold is 44 frames.
 *
 * **Was 176, cut to 146 on 2026-09-03** — *"the agents bob about 2 times before
 * becoming the combined AI agent. can we shorten that part a tad bit so they
 * bob like once then combine?"* At 176 the first mark down (Claude, period 61)
 * had 102 frames of hold and got through 1.7 hops, which is what reads as two.
 * At 146 it gets 1.2, and the two later marks under one each.
 *
 * The note this replaces claimed the hold was "longer than every bob period,
 * which is the condition for all three completing a hop". That was never true —
 * Gemini's period is 83 against a 74-frame hold — and the aim is now the
 * opposite anyway: one hop from the earliest mark, not one from all three. The
 * later two are gathered up mid-arc, which is what the fusion catching them
 * looks like.
 *
 * Every beat below moved down by the same 30, so the fusion, the disc, the
 * toss and the answer keep their spacing; only the wait before them is shorter.
 * `LIVE_SCENE_TWO` came down 352 → 322 to match — the scene keeps the same 76
 * frames after its last beat that it had before.
 */
const FUSE_START = 146;
const FUSE_END = 176;

/** The disc emerges from the pile before the marks are gone, so it is one event. */
const DISC_IN = 170;
const DISC_HOLD_FROM = DISC_IN + 8;

/** The toss: the disc leaves the centre and arrives as the meme's face. */
const HEAD_FLIGHT_IN = 218;
const HEAD_FLIGHT_END = 246;

/**
 * The meme fades up under the incoming face, and the answer lands last.
 *
 * **The fade starts on the same frame the disc leaves**, since the figure moved
 * to the centre: at the old right-hand position the two were far enough apart
 * that the meme could begin coming up while the disc still sat on its hold, but
 * centred, the disc's hold is on top of where the figure's chest will be. So
 * they are simultaneous now — the body rises into place as the face flies up to
 * meet it, and neither is ever seen sitting on the other.
 */
const MEME_IN = 218;
const MEME_FULL = 244;
const MEME_HOLD_FROM = MEME_IN + 10;
const ANSWER_IN = 238;

const TITLE_TOP = SAFE_MARGIN;
const ANSWER_TOP = 838;
const WORD_GAP = 28;

/**
 * 108. Unchanged from the single-line version, where it was measured off a
 * still: at 116 the five-word line ran 75px past the right safe margin.
 *
 * The line is now split across two blocks and would fit at 116 again, but both
 * halves are one sentence and have to be set at one size to read as one — and
 * scene 1 already tried mixed sizes within a line and had it reverted.
 */
const TITLE_SIZE = 108;

const QUESTION: Word[] = [
  { text: "Who's", color: COLORS.ink },
  { text: "your", color: COLORS.ink },
  { text: "team?", color: COLORS.red },
];

const ANSWER: Word[] = [
  { text: "and", color: COLORS.ink },
  { text: "you", color: COLORS.red },
];

/**
 * ## The collage ground — two big papers, mostly off the page
 *
 * Added 2026-09-03: *"can we explore having like 1-2 background collage papers
 * like big and offset with some color to more so match the collage theme we did
 * in scene 1?"*
 *
 * Scene 1 puts a tinted torn swatch behind its payoff word and a butter patch
 * under its hand; scenes 2, 3 and 4 were `paper-ground` and nothing else, which
 * is why they read as a different, flatter film than the one that opens. These
 * two pieces are that missing layer, built from the same grayscale kit and
 * tinted in code — no coloured files on disk, per `Paper.tsx`'s §3 note.
 *
 * **Both are cropped by the frame on two edges.** That is the whole effect: a
 * piece that runs off the page reads as torn paper larger than the shot, where
 * one sitting fully inside the frame reads as a rectangle someone drew. Only
 * ~740x530 of the periwinkle and ~880x100 of the butter are ever on screen.
 *
 * ### They are placed AROUND the scene, not under it
 *
 * Every position here is a clearance, measured against what the scene already
 * occupies. **Check these before nudging anything:**
 *
 * | | occupies |
 * | --- | --- |
 * | `Who's your team?` | x140 to ~1134, y140-260 |
 * | the triangle of marks | x283-1160, y~300-780 |
 * | the fusion pile | centred on `FUSE_POINT` (717, 545) |
 * | the meme + its lean | x~740-1180, y410-950 |
 * | `and you` | x140-~630, y838-946 |
 *
 * So the two genuinely free regions are the top-right corner beyond x1180 and
 * the bottom strip below y950, and that is where these go.
 *
 * Nothing sits behind the three branded marks on purpose. Claude's mark is
 * orange, ChatGPT's near-black and Gemini's blue, and they take no tint — a
 * periwinkle field behind them would cost contrast on the one scene in the film
 * that names a vendor. The fusion also still happens on bare paper, so the disc
 * popping out of the pile is not competing with a colour field.
 *
 * ### Dead still, and they must stay that way
 *
 * No drift, no bob, no entrance. Two reasons, and the second is a hard one:
 *
 * 1. The scene's own note says motion is the only thing registering a landing.
 *    Every moving thing here is a mark, the disc or the type; ground that moves
 *    competes with the fusion for the eye.
 * 2. **The master freezes this scene's frame 6 under the clapboard slam** — the
 *    join lands on it and holds there for 88 frames. Anything that animated in
 *    before f6 would be invisible in the film and visible only when the scene is
 *    reviewed alone, which is the worst of both.
 */
const GROUND: {
  name: string;
  src: keyof typeof GEOMETRY;
  tint: Tint;
  left: number;
  top: number;
  width: number;
  rotate: number;
  shadow: { x: number; y: number; opacity: number };
}[] = [
  {
    /**
     * The big one. `torn-swatch-04` is the only kit swatch no other scene uses,
     * and at 1365x1007 content it is the only one broad enough to fill a corner
     * without being stretched — nothing here pulls a piece off its own aspect.
     *
     * 1180 wide against 740 visible, so a little over a third of it is on the
     * page. `left` is 1210 rather than 1180 because the -4deg swings its left
     * edge about 30px further left at the bottom, and 1180 would have put torn
     * paper within a few pixels of `team?`.
     */
    name: "Periwinkle ground",
    src: "texture/torn-swatch-04.png",
    tint: "periwinkle",
    left: 1210,
    top: -330,
    width: 1180,
    rotate: -4,
    shadow: { x: 8, y: 10, opacity: 0.14 },
  },
  {
    /**
     * The counterweight, on the opposite diagonal so the frame is not
     * top-heavy. `torn-swatch-01` at 3.58:1 is the film's band shape — it is
     * scene 1's periwinkle stage and scene 4's swatch, which is the kit being
     * reused as intended rather than a collision.
     *
     * `top` is 980 and the +2deg dips the on-page end rather than lifting it,
     * which together keep its torn edge about 35px clear of `and you`'s
     * descenders. **The answer must not land on it**: `you` is red and butter
     * is #FFC94D, and 108px of red on butter is the one pairing in this palette
     * that goes muddy. If this piece ever moves up, the answer moves first.
     */
    name: "Butter ground",
    src: "texture/torn-swatch-01.png",
    tint: "butter",
    left: -190,
    top: 980,
    width: 1120,
    rotate: 2,
    shadow: { x: 6, y: 8, opacity: 0.12 },
  },
];

type AgentSpec = {
  name: string;
  file: keyof typeof GEOMETRY;
  /** Where the mark's CONTENT comes to rest, as its centre on the page. */
  centre: [number, number];
  /** Optically sized content width (assets.md §2d), not equal pixels. */
  markWidth: number;
  /** Released above the frame and falls on the EndingScene t² curve. */
  releaseFrame: number;
  /** The frame it lands — fixes the fall length for this agent. */
  landFrame: number;
  /** The hold-bob's own period and height. */
  bobPeriod: number;
  bobHeight: number;
  /** The sway's own period, and amplitude in degrees. */
  swayPeriod: number;
  swayAmp: number;
  /** Degrees this mark turns through on its way into the pile. */
  fuseSpin: number;
};

/**
 * The triangle. Apex high and a little left of centre, base spanning the left
 * two-thirds of the frame, so the figure reads on a diagonal rather than as a
 * row.
 *
 * **Moved down 90px and left of the meme's column, 2026-09-02.** The question
 * moved to the top of the frame and Claude's mark, resting at y=331, was
 * landing across it; and the meme now occupies x≈1310 rightward, which the
 * fading Sparky it replaces did not need clear until much later. Gemini's
 * right edge is at 1160 against the meme's left at 1312.
 *
 * Widths, fall timings and the shape itself are untouched from the pass the
 * director approved — the figure only translates. They are optically matched
 * rather than pixel-matched (assets.md §2d), so scaling them together
 * is the only safe way to resize them, and nothing here resizes them.
 *
 * Bob and sway periods share no factors, so the three never fall into phase
 * over the ~66 frames they hold together — the same discipline as
 * `EndingScene.tsx`'s deliberately non-dividing pairs.
 *
 * `fuseSpin` is new and is the only per-agent value the fusion adds: three
 * different turn amounts, in different directions, so the pile does not read as
 * one object that was always one object.
 */
const AGENTS: AgentSpec[] = [
  {
    name: "Claude",
    file: "agents/claude.png",
    centre: [728, 421],
    markWidth: 253,
    releaseFrame: 62,
    landFrame: 74,
    bobPeriod: 61,
    bobHeight: 24,
    swayPeriod: 89,
    swayAmp: 2.5,
    fuseSpin: -34,
  },
  {
    name: "ChatGPT",
    file: "agents/chatgpt.png",
    centre: [408, 617],
    markWidth: 249,
    releaseFrame: 76,
    landFrame: 88,
    bobPeriod: 71,
    bobHeight: 30,
    swayPeriod: 101,
    swayAmp: -3,
    fuseSpin: 46,
  },
  {
    name: "Gemini",
    file: "agents/gemini.png",
    centre: [1015, 642],
    markWidth: 290,
    releaseFrame: 90,
    landFrame: 102,
    bobPeriod: 83,
    bobHeight: 20,
    swayPeriod: 113,
    swayAmp: 2,
    fuseSpin: -52,
  },
];

/**
 * Where the three meet — their own centroid, lifted 15px.
 *
 * Derived rather than typed so that nudging a triangle point cannot leave the
 * fusion happening somewhere the marks are not actually converging on. The lift
 * is by eye: the marks arrive with their weight low, and a pile that forms
 * dead on the centroid sits slightly heavier than it looks like it should.
 */
const FUSE_POINT: [number, number] = [
  AGENTS.reduce((t, a) => t + a.centre[0], 0) / AGENTS.length,
  AGENTS.reduce((t, a) => t + a.centre[1], 0) / AGENTS.length - 15,
];

/** How small a mark is by the time it disappears into the pile. */
const FUSE_SCALE = 0.5;

/* ------------------------------------------------------------------ helpers */

const contentAspect = (file: keyof typeof GEOMETRY) =>
  GEOMETRY[file].content[2] / GEOMETRY[file].content[3];

const markHeight = (a: AgentSpec) => a.markWidth / contentAspect(a.file);

/**
 * The mark's resting content TOP, derived from its triangle point.
 *
 * There is no matching `restLeft` any more: horizontal position is now
 * interpolated from the triangle point toward `FUSE_POINT` on every frame, so
 * the left edge is derived from the animated centre rather than from the rest
 * position.
 */
const restTop = (a: AgentSpec) => a.centre[1] - markHeight(a) / 2;

/**
 * The pivot for both the sway and the landing squash: the bottom centre of the
 * mark's CONTENT, as a percentage of its file box.
 *
 * It has to be the content box and not the file box — every one of these files
 * carries transparent padding, so the file box's bottom centre is a point in the
 * air below the artwork, and a piece rotating about it swings rather than leans.
 */
const contentPivot = (file: keyof typeof GEOMETRY) => {
  const g = GEOMETRY[file];
  const [bw, bh] = g.box;
  const [cx, cy, cw, ch] = g.content;
  return `${(((cx + cw / 2) / bw) * 100).toFixed(2)}% ${(((cy + ch) / bh) * 100).toFixed(2)}%`;
};

/**
 * `4p(1-p)` arc, `EndingScene.tsx`'s own hold-bob — a hop that returns to
 * ground every period rather than a continuous sway, so three agents
 * standing still still read as "holding", not "idle animation".
 */
const bobArc = (t: number, period: number, height: number) => {
  if (t <= 0) return 0;
  const bounceFrame = t % period;
  const p = bounceFrame / period;
  return -height * 4 * p * (1 - p);
};

/**
 * The sway — the other half of the hold, and the thing the director asked for.
 *
 * A plain sine on the mark's rotation, pivoting about the bottom of its own
 * artwork so it leans on its base rather than turning about its middle. Paired
 * with `bobArc` on a period sharing no factors with it, the two never repeat
 * together inside the scene, so the hold drifts instead of looping.
 */
const sway = (t: number, period: number, amp: number) =>
  t <= 0 ? 0 : Math.sin((2 * Math.PI * t) / period) * amp;

/** How far above its own resting place a mark is released. */
const RELEASE_CLEARANCE = 60;

/* -------------------------------------------------------------- the marks */

const AgentPiece: React.FC<{ agent: AgentSpec; f: number }> = ({
  agent,
  f,
}) => {
  const local = f - agent.releaseFrame;
  if (local < 0 || f >= FUSE_END) return null;

  const height = markHeight(agent);
  const target = restTop(agent);

  // Released clear of the top of the frame and falling on the t² parabola —
  // the same curve as before, but each mark now falls to its own triangle point
  // rather than to a shared row, so the three cover different distances in the
  // same twelve frames and land at different speeds.
  const start = -(height + RELEASE_CLEARANCE);
  const dropFrames = agent.landFrame - agent.releaseFrame;
  const fallP = Math.min(1, local / dropFrames);
  const fallY = start + (target - start) * fallP * fallP;

  const landed = f >= agent.landFrame;
  const holdT = f - (agent.landFrame + 6);
  const bobY = landed ? bobArc(holdT, agent.bobPeriod, agent.bobHeight) : 0;

  // Impact, with nothing else left to register it. The mark squashes onto its
  // own base over four frames while its cast shadow collapses under it. The
  // shadow squash is inherited from the deleted square, which used to carry it,
  // and is kept at four frames because one quantised step was invisible.
  const impact = 1 - ramp(f, agent.landFrame, agent.landFrame + 4, EASE_OUT);
  const squashY = interpolate(impact, [0, 1], [1, 0.9]);
  const shadowScale = interpolate(impact, [0, 1], [1, 0.15]);

  // The fusion. The mark leaves its triangle point for the pile, shrinking and
  // turning as it goes, and its shadow lifts off with it — a piece travelling
  // through the air does not cast the shadow it cast sitting on the page.
  const fuseP = ramp(f, FUSE_START, FUSE_END, EASE_IN_OUT);
  const centreX = interpolate(fuseP, [0, 1], [agent.centre[0], FUSE_POINT[0]]);
  const centreY = interpolate(fuseP, [0, 1], [agent.centre[1], FUSE_POINT[1]]);
  const width = agent.markWidth * interpolate(fuseP, [0, 1], [1, FUSE_SCALE]);
  const fuseRotate = fuseP * agent.fuseSpin;

  // Gone over the last six frames rather than at a hard cut: the disc is
  // already coming up underneath by then and a hard cut would strobe.
  const fadeOut = 1 - ramp(f, FUSE_END - 6, FUSE_END, EASE_IN_OUT);

  const rotate = fuseP > 0 ? fuseRotate : landed ? sway(holdT, agent.swayPeriod, agent.swayAmp) : 0;
  const top = fuseP > 0 ? centreY - (width / agent.markWidth) * height / 2 : landed ? target + bobY : fallY;

  return (
    <PaperPiece
      name={agent.name}
      src={agent.file}
      shadow={
        landed && fuseP < 0.5
          ? {
              x: 10 * shadowScale * (1 - fuseP * 2),
              y: 12 * shadowScale * (1 - fuseP * 2),
              opacity: 0.16 * shadowScale * (1 - fuseP * 2),
            }
          : undefined
      }
      style={{
        ...placeByContent(agent.file, {
          left: centreX - width / 2,
          top,
          width,
        }),
        opacity: fadeOut,
        // One element, one transform slot. The sway, the squash and the fusion
        // spin share a pivot and are composed here rather than nested in
        // wrappers — a transformed wrapper is promoted to its own raster layer,
        // which is what cost scene 3's sheet its sharpness (see
        // `SceneThree.tsx`).
        transformOrigin:
          fuseP > 0 ? "50% 50%" : contentPivot(agent.file),
        ...(Math.abs(rotate) > 0.01 ? { rotate: `${rotate}deg` } : {}),
        ...(fuseP === 0 && squashY < 0.999 ? { scale: `1 ${squashY}` } : {}),
      }}
    />
  );
};

/* ------------------------------------------------------------- the closer */

const MARK = "agents/ai-generic.png" as const;
const MEME = "props/and-you.png" as const;

/**
 * The meme's content rect — **centred, 2026-09-02, by director note.**
 *
 * It sat in the right third, on the safe margin, which is the slot Sparky
 * occupied before it and where a fading closer belongs: off to one side of a
 * frame whose subject is elsewhere. This scene's subject is no longer
 * elsewhere. By the time the figure arrives the marks have been consumed, the
 * disc is the only thing left on the page, and the figure IS the answer to the
 * question at the top — so it takes the middle of the frame and the answer sits
 * under the question in the left column, unmoved.
 *
 * It still points out of the frame at the viewer, which is the job it inherited
 * from Sparky and the reason it survived the swap: the three models answer the
 * question, and then the answer turns out to include whoever is watching.
 */
/**
 * **540, down from 640, and the centring is what forced it.**
 *
 * Against the right safe margin the figure had the whole right of the frame to
 * itself and its height was free. In the middle it shares a column with the
 * question, and at 640 the `Ai` face came up to y164 against a title whose
 * baseline sits at 248 — the head touched `team?`. Rendered and checked, not
 * estimated.
 *
 * At 540 the face clears the title by about 38px and the figure still fills the
 * middle third of the frame. **The face is the constraint, not the feet**: the
 * head sits ABOVE the cut-out's content box (the head was cleared from the
 * source, so the topmost surviving pixel is the hood), so raising or lowering
 * the figure moves the face 146px for every 100px the feet move. If this is
 * resized again, check the face against the title, not the silhouette against
 * the margins.
 */
const MEME_H = 540;
const MEME_W = MEME_H * contentAspect(MEME);
const MEME_LEFT = (WIDTH - MEME_W) / 2;
const MEME_TOP = 950 - MEME_H;

/**
 * The hole where the head was, in the source file's own 620x870 pixels — the
 * circle `scripts/key-flat-background.py` clears — expressed relative to the
 * file's CONTENT origin so it survives being scaled onto the page.
 *
 * The head centre is ABOVE the content box (a negative y), which is correct and
 * is not a sign error: with the head cut out, the topmost surviving pixel is
 * the hood at y=170, and the head sat at y=110.
 *
 * The disc is played slightly wider than the hole so no rim of paper ground
 * shows around the face. `168` against a `156` hole is the whole margin, and it
 * is the number to change if a seam ever appears.
 */
const HEAD_IN_FILE = { cx: 272 - 24, cy: 110 - 170, d: 168 };

const memeScale = MEME_W / GEOMETRY[MEME].content[2];
const HEAD_W = HEAD_IN_FILE.d * memeScale;
const HEAD_REST: [number, number] = [
  MEME_LEFT + HEAD_IN_FILE.cx * memeScale,
  MEME_TOP + HEAD_IN_FILE.cy * memeScale,
];

/** The disc's hero size, at the centre of the frame before it is thrown. */
const DISC_W = 300;

/** The toss arcs rather than slides — paper thrown, not paper dragged. */
const FLIGHT_ARC = 90;

const MEME_BOB_PERIOD = 97;
const MEME_BOB_HEIGHT = 18;
const MEME_SWAY_PERIOD = 127;
const MEME_SWAY_AMP = -2.5;

const DISC_BOB_PERIOD = 67;
const DISC_BOB_HEIGHT = 22;

/** The meme's own lean pivot: the bottom centre of its content, on the page. */
const MEME_PIVOT: [number, number] = [
  MEME_LEFT + MEME_W / 2,
  MEME_TOP + MEME_H,
];

/**
 * Where the face sits once it is the face.
 *
 * The meme bobs and leans, and the head has to go with it or the figure comes
 * apart. Rather than nest the disc inside a transformed wrapper — which would
 * promote both to their own raster layer and cost them their sharpness, the
 * defect recorded in `SceneThree.tsx` — the head's resting point is rotated
 * about the meme's own pivot arithmetically and the bob is added after.
 */
const headOnBody = (bobY: number, leanDeg: number): [number, number] => {
  const rad = (leanDeg * Math.PI) / 180;
  const dx = HEAD_REST[0] - MEME_PIVOT[0];
  const dy = HEAD_REST[1] - MEME_PIVOT[1];
  return [
    MEME_PIVOT[0] + dx * Math.cos(rad) - dy * Math.sin(rad),
    MEME_PIVOT[1] + dx * Math.sin(rad) + dy * Math.cos(rad) + bobY,
  ];
};

const Meme: React.FC<{ f: number }> = ({ f }) => {
  if (f < MEME_IN) return null;

  const opacity = ramp(f, MEME_IN, MEME_FULL, EASE_IN_OUT);
  const holdT = f - MEME_HOLD_FROM;
  const bobY = bobArc(holdT, MEME_BOB_PERIOD, MEME_BOB_HEIGHT);
  const rotate = sway(holdT, MEME_SWAY_PERIOD, MEME_SWAY_AMP);

  return (
    <PaperPiece
      name="And you"
      src={MEME}
      shadow={{ x: 10, y: 12, opacity: 0.16 }}
      style={{
        ...placeByContent(MEME, {
          left: MEME_LEFT,
          top: MEME_TOP + bobY,
          height: MEME_H,
        }),
        opacity,
        transformOrigin: contentPivot(MEME),
        ...(Math.abs(rotate) > 0.01 ? { rotate: `${rotate}deg` } : {}),
      }}
    />
  );
};

/**
 * The fused mark — the film's generic agent, born here and used everywhere
 * after.
 *
 * Three lives in one element: it pops out of the pile, holds at the centre of
 * the frame long enough to be recognised as its own thing, and is then thrown
 * into the meme's empty head. Splitting it into three components would let the
 * three states drift apart; there is only ever one disc on screen.
 */
const FusedMark: React.FC<{ f: number }> = ({ f }) => {
  if (f < DISC_IN) return null;

  const pop = settle(f - DISC_IN, 11);
  const flight = ramp(f, HEAD_FLIGHT_IN, HEAD_FLIGHT_END, EASE_IN_OUT);
  const landed = f >= HEAD_FLIGHT_END;

  const memeHoldT = f - MEME_HOLD_FROM;
  const memeBobY = bobArc(memeHoldT, MEME_BOB_PERIOD, MEME_BOB_HEIGHT);
  const memeLean = sway(memeHoldT, MEME_SWAY_PERIOD, MEME_SWAY_AMP);
  const [headX, headY] = headOnBody(memeBobY, memeLean);

  // Before the throw the disc bobs on its own; after it, it belongs to the
  // figure and inherits the figure's bob and lean instead.
  const soloBobY = bobArc(f - DISC_HOLD_FROM, DISC_BOB_PERIOD, DISC_BOB_HEIGHT);

  const cx = interpolate(flight, [0, 1], [FUSE_POINT[0], headX]);
  const cy =
    interpolate(flight, [0, 1], [FUSE_POINT[1] + soloBobY, headY]) -
    // A single hump, zero at both ends, so the throw leaves and arrives
    // cleanly and only rises in between.
    FLIGHT_ARC * 4 * flight * (1 - flight);

  const width = interpolate(flight, [0, 1], [DISC_W, HEAD_W]);
  const scale = Math.min(1, Math.max(0, pop));

  return (
    <PaperPiece
      name="Ai"
      src={MARK}
      // In the air, and on a face, it casts nothing. It only sits on the page
      // during the hold at the centre.
      shadow={
        flight === 0
          ? { x: 10, y: 12, opacity: 0.16 }
          : undefined
      }
      style={{
        ...placeByContent(MARK, {
          left: cx - width / 2,
          top: cy - width / 2,
          width,
        }),
        transformOrigin: "50% 50%",
        ...(scale < 0.999 ? { scale } : {}),
        ...(landed && Math.abs(memeLean) > 0.01
          ? { rotate: `${memeLean}deg` }
          : {}),
      }}
    />
  );
};

/* ----------------------------------------------------------------- the scene */

const Line: React.FC<{
  words: Word[];
  appearFrame: number;
  top: number;
  f: number;
}> = ({ words, appearFrame, top, f }) => (
  <div
    style={{
      position: "absolute",
      left: SAFE_MARGIN,
      top,
      display: "flex",
      alignItems: "flex-end",
      gap: WORD_GAP,
    }}
  >
    {words.map((w, i) => (
      <PoppedWord
        key={w.text}
        word={w}
        index={i}
        frame={f}
        appearFrame={appearFrame}
        stagger={3}
        fontFamily={display}
        fontSize={TITLE_SIZE}
        settlePeriod={18}
      />
    ))}
  </div>
);

export const SceneTwo: React.FC = () => {
  const f = onTwos(useCurrentFrame());

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.paper }}>
      <PaperFilters />

      <Img
        name="Paper ground"
        src={asset("texture/paper-ground.png")}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: WIDTH,
          height: HEIGHT,
        }}
      />

      {/* The collage ground: two big tinted papers running off opposite
          corners. Above the page and below everything that moves — see GROUND. */}
      {GROUND.map((g) => (
        <PaperPiece
          key={g.name}
          name={g.name}
          src={g.src}
          tint={g.tint}
          shadow={g.shadow}
          style={{
            ...placeByContent(g.src, {
              left: g.left,
              top: g.top,
              width: g.width,
            }),
            rotate: `${g.rotate}deg`,
          }}
        />
      ))}

      {AGENTS.map((agent) => (
        <AgentPiece key={agent.name} agent={agent} f={f} />
      ))}

      <Meme f={f} />
      <FusedMark f={f} />

      {/* The question at the top and its answer at the bottom, with the frame's
          middle spent answering it. Two blocks rather than one line — see the
          header. */}
      <Line words={QUESTION} appearFrame={TITLE_IN} top={TITLE_TOP} f={f} />
      <Line words={ANSWER} appearFrame={ANSWER_IN} top={ANSWER_TOP} f={f} />
    </AbsoluteFill>
  );
};
