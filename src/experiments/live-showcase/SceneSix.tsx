import { loadFont as loadArchivoBlack } from "@remotion/google-fonts/ArchivoBlack";
import { AbsoluteFill, Img, useCurrentFrame } from "remotion";
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
  settle,
  WIDTH,
} from "./theme";

const { fontFamily: display } = loadArchivoBlack();

/** Scene 6 · The LIVE card. The hold is the film's adjustable slack. */
export const SCENE_SIX_DURATION = 450;

const CLOSING_LINE_IN = 50;
const LIVE_IN = 62;
const QR_BACKING_RELEASE = 74;
const QR_BACKING_LAND = 90;
const QR_BACKING_SETTLED = 94;
const QR_CODE_REVEAL = 94;
const EXPANSION_IN = 96;
// The three arrival frames. **Named after the vendors the marks used to be**,
// and kept that way deliberately: `AGENT_ARRIVAL_DURATION` is derived from
// `GEMINI_IN` and renaming them is a rename of six call sites for no change on
// screen. They are three staggered arrivals, nothing more.
const CLAUDE_IN = 104;
const CHATGPT_IN = 118;
const GEMINI_IN = 132;
const HANDS_IN = 108;
const HAND_STAGGER = 4;
const HOLD_START = 150;

const LEFT_TITLE: Word[] = [
  { text: "Your", color: COLORS.ink },
  { text: "turn.", color: COLORS.ink },
];
const LIVE_WORD: Word[] = [{ text: "LIVE", color: COLORS.red }];

const QR_BACKING_X = 620;
const QR_BACKING_Y = 30;
const QR_BACKING_WIDTH = 680;
const QR_X = 745;
const QR_Y = 370;
const QR_SIZE = 430;

const AGENT_NODE = 140;
const AGENT_ARRIVAL_DURATION = HOLD_START - GEMINI_IN;
const HAND_ARRIVAL_DURATION = 14;

/**
 * **One mark, six times, 2026-09-02.**
 *
 * The film went LLM-agnostic in scene 2 — three branded marks fall in, fuse
 * into `agents/ai-generic.png`, and that disc is every agent from scene 3 to
 * the end. This scene used to close on two tidy columns of Claude / ChatGPT /
 * Gemini, which named three vendors on the frame the audience scans a QR code
 * off. It now closes on the film's own mark.
 *
 *   > *"in scene 6 we will just use generic ai logo with random placements with
 *   > the hands"*
 *
 * So the columns are gone too. The six discs are scattered through the same two
 * margin bands the floating hands already occupy, at six sizes and six tilts —
 * **six identical circles in a grid read as copies of one file, which is
 * exactly what they are**, and the scatter plus the size and tilt variance is
 * what stops them looking it. Nothing here is randomised at render time; the
 * numbers are typed, so the frame is identical on every render.
 *
 * They stay clear of the centre column, which the QR card, the `LIVE`
 * wordmark, the expansion and `Your turn.` own between x=580 and x=1340. That
 * corridor is the only hard constraint in this table.
 */
type AgentSpec = {
  name: string;
  file: "agents/ai-generic.png";
  x: number;
  y: number;
  side: -1 | 1;
  appearFrame: number;
  markWidth: number;
  markOffset: readonly [number, number];
  /** Degrees. The disc is a circle, so this shows up as the `Ai` leaning. */
  tilt: number;
  phase: number;
  periodX: number;
  periodY: number;
  ampX: number;
  ampY: number;
  bobPeriod: number;
  bobHeight: number;
};

const MARK = "agents/ai-generic.png" as const;

const AGENTS: readonly AgentSpec[] = [
  {
    name: "Mark 1",
    file: MARK,
    x: 330,
    y: 175,
    side: -1,
    appearFrame: CLAUDE_IN,
    markWidth: 108,
    markOffset: [-3, 2],
    tilt: -5,
    phase: 0,
    periodX: 109,
    periodY: 151,
    ampX: 10,
    ampY: 9,
    bobPeriod: 163,
    bobHeight: 7,
  },
  {
    name: "Mark 2",
    file: MARK,
    x: 452,
    y: 430,
    side: -1,
    appearFrame: CHATGPT_IN,
    markWidth: 88,
    markOffset: [3, -2],
    tilt: 4,
    phase: 43,
    periodX: 137,
    periodY: 97,
    ampX: 11,
    ampY: 8,
    bobPeriod: 185,
    bobHeight: 8,
  },
  {
    name: "Mark 3",
    file: MARK,
    x: 312,
    y: 688,
    side: -1,
    appearFrame: GEMINI_IN,
    markWidth: 118,
    markOffset: [-2, -3],
    tilt: -3,
    phase: 89,
    periodX: 167,
    periodY: 127,
    ampX: 9,
    ampY: 11,
    bobPeriod: 201,
    bobHeight: 6,
  },
  {
    name: "Mark 4",
    file: MARK,
    x: 1412,
    y: 198,
    side: 1,
    appearFrame: CLAUDE_IN,
    markWidth: 94,
    markOffset: [3, 2],
    tilt: 6,
    phase: 117,
    periodX: 149,
    periodY: 107,
    ampX: 10,
    ampY: 9,
    bobPeriod: 163,
    bobHeight: 7,
  },
  {
    name: "Mark 5",
    file: MARK,
    x: 1318,
    y: 466,
    side: 1,
    appearFrame: CHATGPT_IN,
    markWidth: 116,
    markOffset: [-3, -2],
    tilt: -6,
    phase: 151,
    periodX: 127,
    periodY: 173,
    ampX: 11,
    ampY: 8,
    bobPeriod: 185,
    bobHeight: 8,
  },
  {
    name: "Mark 6",
    file: MARK,
    x: 1452,
    y: 700,
    side: 1,
    appearFrame: GEMINI_IN,
    markWidth: 100,
    markOffset: [2, -3],
    tilt: 3,
    phase: 193,
    periodX: 179,
    periodY: 131,
    ampX: 9,
    ampY: 11,
    bobPeriod: 201,
    bobHeight: 6,
  },
];

const bobArc = (t: number, period: number, height: number) => {
  if (t <= 0) return 0;
  const p = (t % period) / period;
  return -height * 4 * p * (1 - p);
};

type HandSpec = {
  x: number;
  y: number;
  side: -1 | 1;
  width: number;
  rotate: number;
  phase: number;
  periodX: number;
  periodY: number;
  ampX: number;
  ampY: number;
};

const HANDS: readonly HandSpec[] = [
  { x: 120, y: 300, side: -1, width: 104, rotate: 145, phase: 9, periodX: 137, periodY: 173, ampX: 10, ampY: 13 },
  { x: 245, y: 565, side: -1, width: 88, rotate: 210, phase: 37, periodX: 151, periodY: 127, ampX: 12, ampY: 9 },
  { x: 115, y: 790, side: -1, width: 112, rotate: 175, phase: 71, periodX: 163, periodY: 139, ampX: 9, ampY: 14 },
  { x: 265, y: 900, side: -1, width: 82, rotate: 225, phase: 103, periodX: 181, periodY: 149, ampX: 11, ampY: 8 },
  { x: 1685, y: 300, side: 1, width: 106, rotate: 220, phase: 131, periodX: 157, periodY: 191, ampX: 10, ampY: 12 },
  { x: 1570, y: 575, side: 1, width: 90, rotate: 155, phase: 167, periodX: 173, periodY: 137, ampX: 12, ampY: 10 },
  { x: 1670, y: 820, side: 1, width: 114, rotate: 200, phase: 199, periodX: 193, periodY: 161, ampX: 9, ampY: 13 },
];

const AgentDrift: React.FC<{ spec: AgentSpec; f: number }> = ({ spec, f }) => {
  const local = f - spec.appearFrame;
  if (local < 0) return null;

  const arrival =
    local >= AGENT_ARRIVAL_DURATION
      ? 1
      : settle(local, AGENT_ARRIVAL_DURATION, 0.35);
  const driftX = Math.sin((f + spec.phase) / spec.periodX) * spec.ampX;
  const driftY = Math.cos((f + spec.phase) / spec.periodY) * spec.ampY;
  const bobY = bobArc(local, spec.bobPeriod, spec.bobHeight);
  const entryProgress = ramp(
    f,
    spec.appearFrame,
    spec.appearFrame + AGENT_ARRIVAL_DURATION,
    EASE_OUT,
  );
  const entryX = spec.side * 64 * (1 - entryProgress);
  const entryY = 22 * (1 - entryProgress);
  const markGeometry = GEOMETRY[spec.file];
  const markHeight =
    spec.markWidth / (markGeometry.content[2] / markGeometry.content[3]);

  return (
    <div
      style={{
        position: "absolute",
        left: spec.x,
        top: spec.y,
        width: AGENT_NODE,
        height: AGENT_NODE,
        translate: `${driftX + entryX}px ${driftY + bobY + entryY}px`,
        scale: arrival,
        transformOrigin: "50% 50%",
      }}
    >
      <PaperPiece
        name={spec.name}
        src={spec.file}
        shadow={{ x: 6, y: 8, opacity: 0.13 }}
        style={{
          ...placeByContent(spec.file, {
            left:
              (AGENT_NODE - spec.markWidth) / 2 + spec.markOffset[0],
            top: (AGENT_NODE - markHeight) / 2 + spec.markOffset[1],
            width: spec.markWidth,
          }),
          // The drift, the bob and the arrival scale all live on the wrapper
          // above; only the fixed tilt is here, so this element keeps a
          // transform slot of its own and the two never fight.
          rotate: `${spec.tilt}deg`,
          transformOrigin: "50% 50%",
        }}
      />
    </div>
  );
};

const FloatingHand: React.FC<{
  spec: HandSpec;
  index: number;
  f: number;
}> = ({ spec, index, f }) => {
  const local = f - (HANDS_IN + index * HAND_STAGGER);
  if (local < 0) return null;

  const arrival =
    local >= HAND_ARRIVAL_DURATION
      ? 1
      : settle(local, 12, 0.46);
  const driftX = Math.sin((f + spec.phase) / spec.periodX) * spec.ampX;
  const driftY = Math.cos((f + spec.phase) / spec.periodY) * spec.ampY;
  const floatRotate = Math.sin((f + spec.phase) / 83) * 2.5;
  const entryProgress = ramp(
    f,
    HANDS_IN + index * HAND_STAGGER,
    HANDS_IN + index * HAND_STAGGER + HAND_ARRIVAL_DURATION,
    EASE_OUT,
  );
  const entryX = spec.side * 108 * (1 - entryProgress);
  const entryY = 34 * (1 - entryProgress);

  return (
    <PaperPiece
      name={`Floating superb hand ${index + 1}`}
      src="hands/superb.png"
      shadow={{ x: 7, y: 9, opacity: 0.16 }}
      style={{
        ...placeByContent("hands/superb.png", {
          left: spec.x,
          top: spec.y,
          width: spec.width,
        }),
        translate: `${driftX + entryX}px ${driftY + entryY}px`,
        rotate: `${spec.rotate + floatRotate}deg`,
        scale: arrival,
        transformOrigin: "50% 50%",
      }}
    />
  );
};

const QrCard: React.FC<{ f: number }> = ({ f }) => {
  if (f < QR_BACKING_RELEASE) return null;

  const fallProgress = Math.min(
    1,
    Math.max(
      0,
      (f - QR_BACKING_RELEASE) /
        (QR_BACKING_LAND - QR_BACKING_RELEASE),
    ),
  );
  const dropY = -900 * (1 - fallProgress * fallProgress);
  const squash =
    f >= QR_BACKING_LAND && f < QR_BACKING_SETTLED
      ? 1 - ramp(f, QR_BACKING_LAND, QR_BACKING_SETTLED, EASE_OUT)
      : 0;
  return (
    <>
      <PaperPiece
        name="QR torn-paper poster"
        src="texture/scrap-04.png"
        style={{
          ...placeByContent("texture/scrap-04.png", {
            left: QR_BACKING_X,
            top: QR_BACKING_Y,
            width: QR_BACKING_WIDTH,
          }),
          translate: `0px ${dropY}px`,
          scale: `${1 + 0.05 * squash} ${1 - 0.08 * squash}`,
          transformOrigin: "50% 100%",
          filter: `brightness(1.12) contrast(1.03) drop-shadow(${12 * (1 - squash) + 2 * squash}px ${14 * (1 - squash) + 2 * squash}px 0 rgba(20, 18, 15, ${0.16 + 0.06 * squash}))`,
        }}
      />

      {/* Functional requirement beats the nominal fade: once present, the QR
          is rendered at full opacity and never animated or filtered. */}
      {f >= QR_CODE_REVEAL ? (
        <div
          style={{
            position: "absolute",
            left: QR_X,
            top: QR_Y,
            width: QR_SIZE,
            height: QR_SIZE,
            overflow: "hidden",
          }}
        >
          <Img
            name="LIVE QR code"
            src={asset("props/qr-live.svg")}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: QR_SIZE,
              height: QR_SIZE * (478 / 420),
            }}
          />
        </div>
      ) : null}
    </>
  );
};

export const SceneSix: React.FC = () => {
  const f = onTwos(useCurrentFrame());
  const expansionT = f - EXPANSION_IN;
  const expansionScale = settle(expansionT, 18, 0.42);

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

      {AGENTS.map((spec) => (
        <AgentDrift key={spec.name} spec={spec} f={f} />
      ))}

      {HANDS.map((spec, index) => (
        <FloatingHand key={index} spec={spec} index={index} f={f} />
      ))}

      <QrCard f={f} />

      <div
        style={{
          position: "absolute",
          left: 580,
          top: 110,
          width: 760,
          display: "flex",
          justifyContent: "center",
        }}
      >
        {LIVE_WORD.map((word, i) => (
          <PoppedWord
            key={word.text}
            word={word}
            index={i}
            frame={f}
            appearFrame={LIVE_IN}
            fontFamily={display}
            fontSize={140}
            settlePeriod={18}
          />
        ))}
      </div>

      <div
        style={{
          position: "absolute",
          left: 580,
          top: 270,
          width: 760,
          textAlign: "center",
          color: COLORS.ink,
          fontFamily: display,
          fontSize: 28,
          fontWeight: 400,
          letterSpacing: -0.25,
          lineHeight: 1.15,
          // **Deliberately NOT carrying PAPER_TEXT_FILTER_ID**, unlike every
          // other line in the film. The filter's deckled edge displaces by
          // about 2px, which is a tenth of this line's cap height — at 28px it
          // chews the letterforms rather than roughening them, and this is the
          // one string in the film that has to survive being read across a
          // room. Everything else set in the film is 52px or larger.

          opacity: expansionT <= 0 ? 0 : 1,
          scale: expansionT <= 0 ? 0 : expansionScale,
          transformOrigin: "50% 50%",
        }}
      >
        Learners Intelligent Video Engineer
      </div>

      <div
        style={{
          position: "absolute",
          left: 620,
          top: 850,
          width: 680,
          display: "flex",
          justifyContent: "center",
          gap: 14,
        }}
      >
        {LEFT_TITLE.map((word, i) => (
          <PoppedWord
            key={word.text}
            word={word}
            index={i}
            frame={f}
            appearFrame={CLOSING_LINE_IN}
            stagger={3}
            fontFamily={display}
            fontSize={52}
            settlePeriod={18}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};
