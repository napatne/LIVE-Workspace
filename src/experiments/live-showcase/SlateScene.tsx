import { AbsoluteFill, Easing, interpolate } from "remotion";
import {
  ARM_OPEN,
  BOARD_BOTTOM_Y,
  BOARD_CENTER_Y,
  BOARD_CONTENT_W,
  Clapboard,
} from "./Clapboard";
import { PaperFilters, PaperPiece, type Tint } from "./Paper";
import { EASE_IN_OUT, FPS, seeded, WIDTH } from "./theme";

/**
 * The clapboard beat: the shared standalone slate and the transition between
 * scenes. The background racks out of focus and frosts over; the clapboard and
 * confetti always stay sharp.
 *
 * At 88 frames:
 *
 *   0 -> 13     board stamps in sharp, arm open
 *   13 -> 18    board squash/settle, arm still open
 *   18 -> 21    arm snaps shut, hard and un-eased
 *   21 -> 72    board holds shut while confetti falls, lands near the bottom
 *               of the clapboard, and rests long enough to read the slug
 *   72 -> 80    background starts racking back in behind the sharp board
 *   80 -> 84    board gets a short stamped shove out, still fully opaque
 *   84 -> 88    board is gone
 *
 * **Trimmed from 108 to 88 on 2026-09-02** — *"in the video clapboard cut it
 * off a bit earlier the scene ending is a bit too long"*. All twenty frames come
 * out of the hold, and nothing else moved: the stamp, the settle and the snap
 * are untouched, and the out-stamp keeps its own 4-frame length. The hold is the
 * only phase that can pay for a trim, because it is the only one that is a
 * duration rather than an action.
 *
 * The floor on the hold is the confetti, not the slug: the last scrap settles
 * around f66 (its fall is real-time seconds, not a fraction of the join), so a
 * hold ending before ~f70 would rack the background back in over paper still in
 * the air. At 72 there are six frames of the pile at rest.
 */
const POP_END = 13;
const SNAP_START = 18;
const SNAP_END = 21;
const OUT_START = 72;
const BOARD_OUT_START = 80;
const BOARD_CUT = 84;

const SCENE_BLUR = 28;
const SCENE_PUSH = 1.04;
const FROST_ALPHA = 0.72;

const STAMP_IN = Easing.bezier(0.72, 0, 1, 0.5);
const STAMP_OUT = Easing.bezier(0.72, 0, 1, 0.5);

const CONFETTI_COUNT = 30;
const CONFETTI = [
  "texture/scrap-01.png",
  "texture/scrap-02.png",
  "texture/scrap-03.png",
  "texture/scrap-04.png",
  "texture/scrap-05.png",
  "texture/scrap-06.png",
];

/**
 * Kit scraps are grayscale by design and every colour in this film is applied
 * in code. Keep this mixed palette: all-paper confetti previously read as
 * debris against the slate.
 */
const CONFETTI_TINTS: Tint[] = ["paper", "red", "butter", "periwinkle"];

/**
 * Each scrap file's own aspect (w/h), measured off the PNGs 2026-09-02.
 *
 * The kit is not six versions of the same shape: `scrap-02` is a 144x516
 * sliver, `scrap-01` is wider than it is tall. A scrap only lies flat if its
 * LONG axis ends up horizontal, so the landing needs to know which way each
 * file is drawn — snapping every piece to the same angle leaves the slivers
 * standing on end, which is exactly what the pile is meant to stop.
 */
const CONFETTI_ASPECT = [404 / 360, 144 / 516, 428 / 448, 392 / 580, 388 / 516, 288 / 320];

/** The quarter turn that puts this scrap's long axis across the frame. */
const flatBase = (n: number) => (CONFETTI_ASPECT[n % CONFETTI.length] < 0.95 ? 90 : 0);

/**
 * Natural confetti shower, not a clapper-end spray.
 *
 * The field opens above and around the board, then falls with sideways drift
 * and flutter. Once it lands, its position and rotation freeze like paper
 * resting on the floor. No origin is derived from the clapboard artwork, so the
 * scraps do not read as coming out of the hinge or the clapper arm.
 *
 * **The landing was rebuilt 2026-09-02** — *"when the confetti falls and hits
 * the ground can you arrange all the pieces so they are horizontal/sort of
 * overlap or pile so that it really looks like they hit the ground"*. Before
 * this, a scrap froze wherever its spin happened to be, which reads as paper
 * hanging in the air rather than lying on a floor. Two things fix it, and they
 * are needed together:
 *
 *   1. **Rotation snaps to lying flat.** Each scrap's landing angle rounds to
 *      the nearest half turn from wherever its spin got to, so the piece comes
 *      to rest on its long edge. It rounds rather than resets, so the spin runs
 *      into the landing instead of jumping to it. A small per-scrap jitter keeps
 *      it from reading as a typeset row.
 *   2. **They squash.** A landed scrap is seen at a shallow angle, so it flattens
 *      vertically and widens slightly. This is the single strongest "on the
 *      floor" cue and the reason the snap in (1) matters — the squash is applied
 *      in the piece's own rotated frame, so it only reads as gravity when the
 *      piece is already near horizontal.
 *
 * **A third and fourth thing were tried and rejected the same day**: gathering
 * the scraps toward the middle of the field so they overlapped, and heaping
 * them on a mound against the board's bottom edge. Both were composition rather
 * than physics, and the director's read was *"they kind of land awkwardly we
 * dont have to force them all to pile up they can just land where they fall"*.
 * Each scrap now lands at whatever x its own drift and flutter reached. Do not
 * re-introduce an arrangement here.
 *
 * The z-sort survives that revert: pieces lower in frame are still drawn last,
 * which is free and is the only depth control a flat collage has.
 */
const G = 780;
const FADE_SECONDS = 0.34;

/**
 * Where the floor is, and how much a scrap's own landing height varies from it.
 *
 * **Not a heap.** A first pass gathered the scraps toward the middle of the
 * field and mounded them against the board's bottom edge; the director's read
 * was *"they kind of land awkwardly we dont have to force them all to pile up
 * they can just land where they fall"*. So the arrangement is gone and each
 * scrap keeps the x its own drift and flutter gave it. What stays is the part
 * that was actually about hitting the ground rather than about composition:
 * the flat landing and the squash below.
 */
const PILE_Y = BOARD_BOTTOM_Y + 8;
const PILE_Y_SPREAD = 56;
/** A landed scrap, seen at a shallow angle. */
const PILE_SQUASH_Y = 0.58;
const PILE_SPREAD_X = 1.07;
/** Degrees either side of flat, so the pile is not a typeset row. */
const PILE_JITTER = 11;

const at = (frame: number, durationInFrames: number) => frame / durationInFrames;

/**
 * One scrap's whole life, as a pure function of its index.
 *
 * Split out of the render so the pieces can be sorted by where they come to
 * rest before they are drawn — painter's order is the only z-control here, and
 * a pile needs the near pieces last.
 */
const scrapSpec = (n: number, fieldLeft: number, fieldWidth: number) => {
  const delay = seeded(n * 17.1 + 0.4) * 0.18;
  const startX = fieldLeft + seeded(n * 2.7 + 0.1) * fieldWidth;
  const startY = BOARD_CENTER_Y - 500 + seeded(n * 4.4 + 0.2) * 260;
  const drift = -110 + seeded(n * 6.2 + 0.3) * 220;
  const lift = -120 + seeded(n * 8.9 + 0.6) * 170;
  const flutterSpeed = 5.5 + seeded(n * 9.3) * 3.5;
  const flutterPhase = seeded(n) * 8;
  const flutterWidth = 18 + seeded(n * 10.7) * 32;
  const size = 24 + seeded(n * 11.3) * 44;
  const spin = seeded(n * 5.5) > 0.5 ? 1 : -1;

  const settleStart = 1.12 + seeded(n * 14.4 + 0.9) * 0.28;
  const settleDuration = 0.22;
  const settleEnd = settleStart + settleDuration;

  // Wherever the drift and flutter left it — no gathering, no mound.
  const restFlutter =
    Math.sin(settleEnd * flutterSpeed + flutterPhase) * flutterWidth;
  const restX = startX + drift * settleEnd + restFlutter;
  const restY = PILE_Y + (seeded(n * 12.6 + 0.8) - 0.5) * PILE_Y_SPREAD;

  // Round the spin to the nearest half turn AWAY FROM THIS FILE'S FLAT ANGLE:
  // the scrap lands on its long edge wherever it happened to be, rather than
  // snapping back to a fixed angle.
  const base = flatBase(n);
  const spunTo = spin * 520 * settleEnd + Math.sin(settleEnd * 11) * 18;
  const restRotate =
    base +
    Math.round((spunTo - base) / 180) * 180 +
    (seeded(n * 15.8 + 0.5) - 0.5) * 2 * PILE_JITTER;

  return {
    n,
    delay,
    startX,
    startY,
    drift,
    lift,
    flutterSpeed,
    flutterPhase,
    flutterWidth,
    size,
    spin,
    settleStart,
    settleDuration,
    restX,
    restY,
    restRotate,
    /**
     * True when this scrap lands on a quarter turn. CSS applies `scale` in the
     * element's OWN rotated frame, so a piece resting at 90° has its local x
     * axis pointing down the screen — the squash has to move to the other axis
     * or it narrows the strip instead of flattening it.
     */
    quarterTurned: base === 90,
    aspect: CONFETTI_ASPECT[n % CONFETTI.length],
  };
};

const Confetti: React.FC<{ p: number; durationInFrames: number }> = ({
  p,
  durationInFrames,
}) => {
  const snapStart = at(SNAP_START, durationInFrames);
  if (p < snapStart) return null;

  const t = ((p - snapStart) * durationInFrames) / FPS;
  const tEnd = ((1 - snapStart) * durationInFrames) / FPS;
  const fieldWidth = BOARD_CONTENT_W * 1.45;
  const fieldLeft = WIDTH / 2 - fieldWidth / 2;

  // Painter's order: whatever ends up lowest in frame is drawn last, so the
  // front of the pile covers the back of it.
  const specs = new Array(CONFETTI_COUNT)
    .fill(0)
    .map((_, n) => scrapSpec(n, fieldLeft, fieldWidth))
    .sort((a, b) => a.restY - b.restY);

  return (
    <>
      {specs.map((s) => {
        const localT = t - s.delay;
        if (localT < 0) return null;

        const flutter =
          Math.sin(localT * s.flutterSpeed + s.flutterPhase) * s.flutterWidth;

        const fallingY = s.startY + s.lift * localT + 0.5 * G * localT * localT;
        const fallingX = s.startX + s.drift * localT + flutter;
        const fallingRotate =
          s.spin * 520 * localT + Math.sin(localT * 11) * 18;

        const settleP = Math.min(
          1,
          Math.max(0, (localT - s.settleStart) / s.settleDuration),
        );
        const x = fallingX * (1 - settleP) + s.restX * settleP;
        const y = fallingY * (1 - settleP) + s.restY * settleP;
        const rotate = fallingRotate * (1 - settleP) + s.restRotate * settleP;

        // Flattening onto the floor. In the piece's own rotated frame, which is
        // why the rotation snaps to horizontal on the same curve and why the
        // quarter-turned slivers squash on the other axis.
        const squash = 1 - (1 - PILE_SQUASH_Y) * settleP;
        const spread = 1 + (PILE_SPREAD_X - 1) * settleP;
        const scaleX = s.quarterTurned ? squash : spread;
        const scaleY = s.quarterTurned ? spread : squash;

        const fadeIn = Math.min(1, localT / 0.08);
        const fadeOut = Math.max(0, Math.min(1, (tEnd - t) / FADE_SECONDS));
        const opacity = fadeIn * fadeOut;

        if (opacity <= 0.01 || y > 1180) return null;

        return (
          <PaperPiece
            key={s.n}
            name={`Confetti ${s.n}`}
            src={CONFETTI[s.n % CONFETTI.length]}
            tint={CONFETTI_TINTS[Math.floor(seeded(s.n * 13.9) * 4)]}
            style={{
              // Centred on its OWN box, not on a square. `width` is the only
              // dimension set, so a 144x516 sliver is 3.6x taller than it is
              // wide; halving `size` for the vertical offset dropped those
              // pieces ~50px below where the pile puts them, which is what made
              // the landing read as two rows.
              left: x - s.size / 2,
              top: y - s.size / s.aspect / 2,
              width: s.size,
              opacity,
              rotate: `${rotate}deg`,
              ...(settleP > 0 ? { scale: `${scaleX} ${scaleY}` } : {}),
            }}
          />
        );
      })}
    </>
  );
};

/**
 * Every value the beat derives from progress. This is exported because the
 * transition renders in two Remotion passes, and both passes must agree exactly
 * about blur, frost, the scene swap, and the slate motion.
 */
export const slatePhases = (p: number, durationInFrames: number) => {
  const popEnd = at(POP_END, durationInFrames);
  const snapStart = at(SNAP_START, durationInFrames);
  const snapEnd = at(SNAP_END, durationInFrames);
  const outStart = at(OUT_START, durationInFrames);
  const boardOutStart = at(BOARD_OUT_START, durationInFrames);
  const boardCut = at(BOARD_CUT, durationInFrames);

  const outBlur = interpolate(p, [0, popEnd], [0, SCENE_BLUR], {
    easing: EASE_IN_OUT,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const inBlur = interpolate(p, [outStart, 1], [SCENE_BLUR, 0], {
    easing: EASE_IN_OUT,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const outPush = interpolate(p, [0, popEnd], [1, SCENE_PUSH], {
    easing: EASE_IN_OUT,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const inPush = interpolate(p, [outStart, 1], [SCENE_PUSH, 1], {
    easing: EASE_IN_OUT,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const pop = interpolate(p, [0, popEnd], [0, 1], {
    easing: STAMP_IN,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const leave = interpolate(p, [boardOutStart, boardCut], [0, 1], {
    easing: STAMP_OUT,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const armAngle = interpolate(p, [snapStart, snapEnd], [ARM_OPEN, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const frost =
    interpolate(p, [0, popEnd], [0, 1], {
      easing: EASE_IN_OUT,
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }) *
    interpolate(p, [outStart, 1], [1, 0], {
      easing: EASE_IN_OUT,
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

  const stampSquash = interpolate(
    p,
    [popEnd, snapStart, snapEnd],
    [1, 0.45, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  return {
    outBlur,
    inBlur,
    outPush,
    inPush,
    armAngle,
    frost,
    outgoingVisible: p < snapEnd,
    boardScaleX:
      interpolate(pop, [0, 1], [1.52, 1]) *
      (1 + 0.1 * stampSquash) *
      interpolate(leave, [0, 1], [1, 1.08]),
    boardScaleY:
      interpolate(pop, [0, 1], [1.52, 1]) *
      (1 - 0.12 * stampSquash) *
      interpolate(leave, [0, 1], [1, 0.92]),
    boardY:
      interpolate(pop, [0, 1], [-54, 0]) +
      interpolate(leave, [0, 1], [0, -86]),
    boardOpacity: p >= boardCut ? 0 : pop,
  };
};

const Racked: React.FC<{
  blur: number;
  scale: number;
  children: React.ReactNode;
}> = ({ blur, scale, children }) => (
  <AbsoluteFill style={{ overflow: "hidden" }}>
    <AbsoluteFill
      style={{
        filter: blur > 0.01 ? `blur(${blur}px)` : undefined,
        scale: String(scale),
      }}
    >
      {children}
    </AbsoluteFill>
  </AbsoluteFill>
);

const FrostPlate: React.FC<{ frost: number }> = ({ frost }) => {
  if (frost <= 0.01) return null;
  return (
    <AbsoluteFill
      style={{
        backgroundColor: `rgba(244, 241, 234, ${FROST_ALPHA * frost})`,
      }}
    />
  );
};

export const SlateBackdrop: React.FC<{
  progress: number;
  durationInFrames: number;
  children?: React.ReactNode;
}> = ({ progress, durationInFrames, children }) => {
  const { outBlur, outPush, outgoingVisible, frost } = slatePhases(
    progress,
    durationInFrames,
  );
  if (!outgoingVisible) return <AbsoluteFill />;
  return (
    <>
      <Racked blur={outBlur} scale={outPush}>
        {children}
      </Racked>
      <FrostPlate frost={frost} />
    </>
  );
};

export const SlateForeground: React.FC<{
  slug: string;
  progress: number;
  durationInFrames: number;
  children?: React.ReactNode;
}> = ({ slug, progress, durationInFrames, children }) => {
  const p = progress;
  const {
    inBlur,
    inPush,
    armAngle,
    frost,
    outgoingVisible,
    boardScaleX,
    boardScaleY,
    boardY,
    boardOpacity,
  } = slatePhases(p, durationInFrames);

  const showIncoming = !outgoingVisible;

  return (
    <AbsoluteFill>
      <PaperFilters />

      {showIncoming ? (
        <>
          <Racked blur={inBlur} scale={inPush}>
            {children}
          </Racked>
          <FrostPlate frost={frost} />
        </>
      ) : null}

      <AbsoluteFill
        style={{
          scale: `${boardScaleX} ${boardScaleY}`,
          translate: `0px ${boardY}px`,
          opacity: boardOpacity,
        }}
      >
        <Clapboard
          contentWidth={BOARD_CONTENT_W}
          centerX={WIDTH / 2}
          centerY={BOARD_CENTER_Y}
          armAngle={armAngle}
          slugText={slug}
        />
      </AbsoluteFill>

      <Confetti p={p} durationInFrames={durationInFrames} />
    </AbsoluteFill>
  );
};

export const SlateScene: React.FC<{
  slug: string;
  progress: number;
  durationInFrames: number;
  outgoing?: React.ReactNode;
  incoming?: React.ReactNode;
}> = ({ slug, progress, durationInFrames, outgoing, incoming }) => (
  <AbsoluteFill>
    <SlateBackdrop progress={progress} durationInFrames={durationInFrames}>
      {outgoing}
    </SlateBackdrop>
    <SlateForeground
      slug={slug}
      progress={progress}
      durationInFrames={durationInFrames}
    >
      {incoming}
    </SlateForeground>
  </AbsoluteFill>
);
