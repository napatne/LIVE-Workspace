import { loadFont as loadArchivoBlack } from "@remotion/google-fonts/ArchivoBlack";
import { measureText } from "@remotion/layout-utils";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  useCurrentFrame,
} from "remotion";
import {
  asset,
  GEOMETRY,
  PaperFilters,
  PaperPiece,
  placeByContent,
} from "./Paper";
import { PoppedWord, type Word } from "./PoppedWord";
import {
  COLORS,
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
 * Scene 1 · The ask — 162f.
 *
 * Timing stretched 1.35× on 2026-09-02 by director note ("everything is too
 * fast"). Layout, colour, copy and the stamp gesture are unchanged and stay
 * director-approved from earlier the same day — only the beat frames moved.
 *
 * > *The blank page, and a person who wants something on it.*
 *
 * The emptiest frame in the film; it earns the density of scene 6 by starting
 * here. Storyboard rule 2 says density only ever grows, so nothing may be added
 * to this scene that is not already below.
 *
 * Script: the one line in the film split across three colours, following the
 * *Shirley* reference where `1968` is split per digit. Most of the line is ink
 * on bare paper; `you` is signal red, so the opening is a direct address; and
 * `video?` is knocked out white on the periwinkle block that rose to hold it —
 * the goal word, on the only stage in the frame.
 *
 * **The whole line is set at ONE size.** That is the only thing this scene kept
 * from the 2026-09-02 revision round: the block spanning both rows, and the
 * colour-follows-the-paper scheme that came with it, were tried and sent back
 * by the director the same day. `video?` no longer needs to be set larger to
 * carry weight — the block does that.
 *
 * `you` in red is approved (script.md open decision 1, closed 2026-09-02). The
 * copy itself is still open (#4), which is why the block below is measured
 * rather than hardcoded.
 *
 * **The hand stamps onto the page, 2026-09-02** — it supersedes both an
 * earlier slide-in and a damped left-right shake that were themselves
 * director notes from an earlier round. **Hardened later the same day** on the
 * note *"i want the thumbs up to slam down on the screen like a stamp but a
 * harsh stamp like with force"*. See `stamp()` below.
 */

// Words are the last thing to move (script.md). The block lands first at f27,
// and the line only starts arriving after it.
const BLOCK_IN = 3;
const BLOCK_LANDED = 27;
const WORDS_IN = 24;
const WORD_STAGGER = 3;
const HAND_IN = 62;

/** One size for the whole line — the director's note, 2026-09-02. */
const ROW_SIZE = 116;
const ROW_GAP = 34;
const WORD_GAP = 28;

const ROW1_TOP = 236;
const ROW2_TOP = ROW1_TOP + ROW_SIZE + ROW_GAP;

/**
 * The block, in page coordinates — behind `video?` and nothing else.
 *
 * Its height is what the type dictates (one row plus equal padding above and
 * below) and its width follows from `torn-swatch-01`'s own content aspect
 * (1849x516, so 3.583), since the block is placed by HEIGHT and the swatch is
 * never pulled off its aspect. At 116px type that is a 172x616 stage holding a
 * 412px word — about 180px of torn paper past the end of `video?`, which is the
 * same overhang the first pass had at 208px type.
 *
 * The width is still measured rather than assumed: if the copy grows past what
 * the aspect-derived width holds, the width wins and the block gets taller.
 * `script.md` open decision 4 is still open, so it has to survive a re-wording.
 */
const BLOCK_PAD_X = 26;
const BLOCK_PAD_Y = 28;
const BLOCK_LEFT = SAFE_MARGIN - 26;
const BLOCK_TOP = ROW2_TOP - BLOCK_PAD_Y;
const BLOCK_HEIGHT = ROW_SIZE + BLOCK_PAD_Y * 2;

const SWATCH = GEOMETRY["texture/torn-swatch-01.png"];
const SWATCH_ASPECT = SWATCH.content[2] / SWATCH.content[3];

/**
 * The stamp — the hand's arrival, 2026-09-02, **hardened the same day**.
 *
 * Supersedes both the slide-in and the damped left-right shake that preceded
 * it. The director watched the first stamp back and asked for it to "slam down
 * on the screen like a stamp but a harsh stamp like with force", and chose
 * MOTION ONLY when offered a riso jolt or ejected paper — so the earlier
 * "nothing else happens on impact" decision survives intact and only the
 * arrival curve got sharper.
 *
 * Frames are relative to the PIECE's own arrival (`t = 0` at its own
 * `HAND_IN`-derived frame — the butter swatch runs 2 frames ahead of the
 * hand, so it gets its own `t`):
 *
 *   t < 0     not on screen
 *   0 -> 5    falls onto the page: scale 1.85 -> 1.00, opacity 0 -> 1,
 *             rotation -11deg -> 0deg, on STAMP_IN
 *   5 -> 8    impact. Squash: scaleY 0.82, scaleX 1.13, un-eased
 *   8 -> ~20  springs back via settle(t, 9, 0.45)
 *
 * What "harder" cost, versus the first pass: the fall lost 3 frames (8 -> 5),
 * started from more than twice the travel (1.30 -> 1.85 scale), and the squash
 * roughly tripled (0.93/1.04 -> 0.82/1.13).
 *
 * **`FALL_FRAMES` is 5 and not 4 or 6 because the scene is quantised on twos.**
 * `HAND_IN` is even and `f` is even, so `t` is always even: with 5, the fall
 * renders at t = 0, 2, 4 (three stepped frames) and the un-eased squash hold
 * `FALL_FRAMES .. FALL_FRAMES + 3` catches t = 6, 8 (two stepped frames). Do
 * not shorten the hold to buy more speed — one stepped frame of squash is
 * invisible, and the squash is the whole impact.
 */
const FALL_FRAMES = 5;

/**
 * Steeper than the shared `EASE_IN`, and deliberately local to this file.
 *
 * `EASE_IN` (theme.ts) is the film's general accelerate and is used by other
 * scenes; the hand needs to arrive harder than the film does, so the harsher
 * curve belongs to the gesture rather than to the palette.
 */
const STAMP_IN = Easing.bezier(0.7, 0, 1, 0.5);

/** 1 through the un-eased impact hold, 0 either side of it. */
const squashHold = (t: number) =>
  t < FALL_FRAMES
    ? 0
    : t <= FALL_FRAMES + 3
      ? 1
      : 1 - settle(t - (FALL_FRAMES + 3), 9, 0.45);

const stamp = (t: number) => {
  const p = ramp(t, 0, FALL_FRAMES, STAMP_IN);
  const fallScale = interpolate(p, [0, 1], [1.85, 1.0]);
  const fallRotate = interpolate(p, [0, 1], [-11, 0]);

  // 0 before landing, 1 through the un-eased hold, then relaxes toward 0
  // with settle()'s own overshoot standing in for the spring-back.
  const squashAmount = squashHold(t);

  return {
    opacity: p,
    rotate: fallRotate,
    scaleX: fallScale * (1 + 0.13 * squashAmount),
    scaleY: fallScale * (1 - 0.18 * squashAmount),
  };
};

/**
 * Interpolates a per-frame ShadowSpec across the piece's own fall, then
 * COLLAPSES it on impact.
 *
 * The collapse is the piece's own shadow, not a new effect on the frame: while
 * the paper is squashed it is pressed flat against the page, so the hard offset
 * shadow that sold its height has nowhere to fall. It shrinks to ~2px and
 * darkens, then rides `squashHold`'s spring back out. This is what keeps the
 * harder stamp reading as weight rather than as a fast scale.
 */
const shadowFor = (
  t: number,
  far: { x: number; y: number; opacity: number },
  near: { x: number; y: number; opacity: number },
) => {
  const p = ramp(t, 0, FALL_FRAMES, STAMP_IN);
  const flat = squashHold(t);
  return {
    x: interpolate(p, [0, 1], [far.x, near.x]) * (1 - flat) + 2 * flat,
    y: interpolate(p, [0, 1], [far.y, near.y]) * (1 - flat) + 2 * flat,
    opacity:
      interpolate(p, [0, 1], [far.opacity, near.opacity]) * (1 - flat) +
      near.opacity * 1.3 * flat,
  };
};

/** On bare paper, so ink — except `you`, which is the film's one direct address. */
const ROW1: Word[] = [
  { text: "Do", color: COLORS.ink },
  { text: "you", color: COLORS.red },
  { text: "want", color: COLORS.ink },
  { text: "to", color: COLORS.ink },
  { text: "make", color: COLORS.ink },
  { text: "a", color: COLORS.ink },
];

/** Knocked out of the block. */
const ROW2: Word[] = [{ text: "video?", color: COLORS.paper }];

/** The rendered width of a run of words, including the gaps between them. */
const measureRun = (words: Word[]) =>
  words.reduce(
    (w, word, i) =>
      w +
      measureText({ text: word.text, fontFamily: display, fontSize: ROW_SIZE })
        .width +
      (i === 0 ? 0 : WORD_GAP),
    0,
  );

export const SceneOne: React.FC = () => {
  // Paper steps. Everything in this scene derives from `f`, never from the raw
  // frame — see theme.ts `onTwos`.
  const f = onTwos(useCurrentFrame());

  // Measured, never hardcoded — see BLOCK_PAD_Y above.
  const row2W = measureRun(ROW2);
  const blockWidth = Math.max(
    row2W + BLOCK_PAD_X * 2,
    BLOCK_HEIGHT * SWATCH_ASPECT,
  );

  // The block rises from the bottom as a stage, on an ease-out.
  const blockRise = ramp(f, BLOCK_IN, BLOCK_LANDED, EASE_OUT);
  const blockOffset = (1 - blockRise) * 420;

  // The hand stamps onto the page rather than sliding in — 2026-09-02.
  // The butter swatch lands 2 frames ahead of the hand, so the two pieces
  // read as a stack landing rather than one object; each gets its own `t`
  // into the same `stamp()` curve.
  const handT = f - HAND_IN;
  const hand = stamp(handT);
  const swatchT = handT + 2;
  const swatch = stamp(swatchT);

  // Far ends widened with the harder fall — the piece now starts from 1.85
  // scale, so it has to read as starting much further off the page.
  const handShadow = shadowFor(
    handT,
    { x: 78, y: 92, opacity: 0.07 },
    { x: 14, y: 16, opacity: 0.3 },
  );
  const swatchShadow = shadowFor(
    swatchT,
    { x: 52, y: 60, opacity: 0.06 },
    { x: 12, y: 14, opacity: 0.23 },
  );

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.paper }}>
      <PaperFilters />

      {/* The page itself. 1672x941 on disk, scaled to fill — an accepted defect
          carried from the manifest, recorded in the plan. */}
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

      {/* The periwinkle stage. A grayscale kit swatch, tinted here — there is
          no periwinkle file on disk and there should never be one. */}
      <PaperPiece
        name="Periwinkle block"
        src="texture/torn-swatch-01.png"
        tint="periwinkle"
        shadow={{ x: 10, y: 12, opacity: 0.18 }}
        style={{
          ...placeByContent("texture/torn-swatch-01.png", {
            left: BLOCK_LEFT,
            top: BLOCK_TOP,
            width: blockWidth,
          }),
          translate: `0px ${blockOffset}px`,
        }}
      />

      <div
        style={{
          position: "absolute",
          left: SAFE_MARGIN,
          top: ROW1_TOP,
          display: "flex",
          alignItems: "flex-end",
          gap: WORD_GAP,
        }}
      >
        {ROW1.map((w, i) => (
          <PoppedWord
            key={w.text}
            word={w}
            index={i}
            frame={f}
            appearFrame={WORDS_IN}
            stagger={WORD_STAGGER}
            fontFamily={display}
            fontSize={ROW_SIZE}
            settlePeriod={18}
          />
        ))}
      </div>

      {/* Knocked out of the block, so it rides the block's rise. */}
      <div
        style={{
          position: "absolute",
          left: SAFE_MARGIN,
          top: ROW2_TOP,
          display: "flex",
          gap: WORD_GAP,
          translate: `0px ${blockOffset}px`,
        }}
      >
        {ROW2.map((w, i) => (
          <PoppedWord
            key={w.text}
            word={w}
            index={ROW1.length + i}
            frame={f}
            appearFrame={WORDS_IN}
            stagger={WORD_STAGGER}
            fontFamily={display}
            fontSize={ROW_SIZE}
            settlePeriod={18}
          />
        ))}
      </div>

      {/* The human: a torn photographic hand stamped onto a butter swatch,
          with a hard cast shadow. Torn edges are human — storyboard rule 1.

          Only the wrist crops at the frame bottom, which reads as the hand
          entering frame. A pass that dropped it far enough to cut into the
          thumb itself was rejected by the director on 2026-09-02; with the
          block back behind `video?` alone there is nothing forcing it down. */}
      <PaperPiece
        name="Butter swatch"
        src="texture/torn-swatch-02.png"
        tint="butter"
        shadow={swatchShadow}
        style={{
          // Right edge lands at 1740, inside the 140px safe margin. The
          // first pass put it at 1838 and broke it.
          ...placeByContent("texture/torn-swatch-02.png", {
            left: 1120,
            top: 486,
            width: 620,
          }),
          opacity: swatch.opacity,
          scale: `${swatch.scaleX} ${swatch.scaleY}`,
          rotate: `${swatch.rotate * 0.5}deg`,
        }}
      />
      <PaperPiece
        name="Thumbs up"
        src="hands/thumbs-up.png"
        shadow={handShadow}
        style={{
          ...placeByContent("hands/thumbs-up.png", {
            left: 1216,
            top: 520,
            width: 430,
          }),
          transformOrigin: "50% 90%",
          opacity: hand.opacity,
          scale: `${hand.scaleX} ${hand.scaleY}`,
          rotate: `${hand.rotate}deg`,
        }}
      />
    </AbsoluteFill>
  );
};
