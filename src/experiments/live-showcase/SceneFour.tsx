import { loadFont as loadArchivoBlack } from "@remotion/google-fonts/ArchivoBlack";
import { AbsoluteFill, Easing, Img, interpolate, useCurrentFrame } from "remotion";
import {
  asset,
  GEOMETRY,
  PaperFilters,
  PaperPiece,
  placeByContent,
  SHEET_PANELS,
} from "./Paper";
import { PoppedWord, type Word } from "./PoppedWord";
import {
  COLORS,
  EASE_IN_OUT,
  EASE_OUT,
  HEIGHT,
  onTwos,
  ramp,
  settle,
  WIDTH,
} from "./theme";

const { fontFamily: display } = loadArchivoBlack();

/** Scene 4 · Stitching. Re-timed through director motion review. */
export const SCENE_FOUR_DURATION = 520;

/**
 * ---
 * ## Rebuilt 2026-09-02 — the staircase, the timelines and the merge
 *
 *   > *"on the next compose and stitch scene we again have to explicitly say
 *   > that here we create scenes, work on each part of storyboard, in a crisp
 *   > way. and then we need to drop the staircase, rather just have them in a
 *   > linear line parallelly producing the scene as now. and also the timelines
 *   > need to grow as scenes grow, not in the end, but run ahead. and when we
 *   > stitch the scene we can magically merge 3 parallel agents into one
 *   > cohesive one."*
 *
 * Four changes, and three of them are about the same thing: the scene was
 * showing parallel work in a shape that reads as sequence.
 *
 * 1. **The staircase is gone.** The three compositions descended left to right,
 *    each lower than the last, which is the universal picture of one thing
 *    following another. They now sit in a row at one height, which is the
 *    picture of three things happening at once. Nothing else about them
 *    changed; they still arrive staggered, because three objects landing on the
 *    same frame reads as one object.
 * 2. **Each timeline grows with its own scene, and finishes before it.** All
 *    three strips used to appear together at f354, after every shimmer had
 *    stopped — a result being reported rather than work being done. Each strip
 *    now starts a few frames after its own composition lands and is full about
 *    24 frames before its shimmer ends, so it visibly runs ahead of the work
 *    it is measuring.
 * 3. **The line.** The film is silent, so what the scene is doing has to be on
 *    the frame in words — the same note that put a second line into scene 3.
 *    `Each panel becomes a scene.` names the operation the audience is
 *    watching, in the slot the stitch line later takes.
 * 4. **The merge.** At the stitch, the three marks leave their compositions,
 *    converge above the growing strip and become one — the same fusion move
 *    scene 2 uses to make the film LLM-agnostic, played a second time to say
 *    that three parallel workers have become one cut. It is the same asset in
 *    all four places, which is what makes the gesture legible rather than
 *    magical for its own sake.
 */

// Opening approval beat.
const SUPERB_HAND_IN = 50;
const SUPERB_HAND_LAND = 80;
const SUPERB_WORD_IN = 84;
const SUPERB_BOB_IN = 96;
const SUPERB_OUT_START = 130;
const SUPERB_OUT_END = 160;

/** The line naming the work, up while the work happens. */
const PANEL_LINE_IN = 166;
const PANEL_LINE_OUT_START = 350;
const PANEL_LINE_OUT_END = 364;

/**
 * The three compositions: scrap, agent mark, then working shimmer.
 *
 * **Compressed and overlapped, 2026-09-02.** They used to land 50 frames apart
 * with shimmers that barely overlapped, which at a row of three reads as a
 * relay. 16 frames apart with shimmers running together is three people
 * working, which is what the scene is about.
 */
const CLAUDE_SCRAP_LAND = 190;
const CLAUDE_MARK_LAND = 218;
const CLAUDE_SHIMMER_IN = 236;
const CLAUDE_SHIMMER_OUT = 320;

const CHATGPT_SCRAP_LAND = 206;
const CHATGPT_MARK_LAND = 234;
const CHATGPT_SHIMMER_IN = 252;
const CHATGPT_SHIMMER_OUT = 336;

const GEMINI_SCRAP_LAND = 222;
const GEMINI_MARK_LAND = 250;
const GEMINI_SHIMMER_IN = 268;
const GEMINI_SHIMMER_OUT = 352;

/**
 * Each strip starts just after its own composition lands and is full well
 * before that composition stops working — *"the timelines need to grow as
 * scenes grow, not in the end, but run ahead."*
 */
const STRIP_LEAD = 6;
const STRIP_AHEAD = 24;

/**
 * **The ending is two beats now, 2026-09-02, and the shimmer block paid for
 * them.**
 *
 *   > *"each panel becomes a scene is good, but we don't say now stitch them
 *   > together — rather we say and when stitched together ... it's a film!"*
 *
 * `Now stitch them together.` was a fourth instruction in a scene that had
 * already given three, and it asked the audience to do something rather than
 * telling them what they were about to see. The replacement is one sentence
 * broken over two beats, with the strip drawing across the gap between them:
 * the film sets up a condition, does the thing, and then names the result.
 * That is the only actual joke this scene has and it needed a gap to land in.
 *
 * **The three shimmers were shortened 30 frames to fund it, and the scene is
 * still 520.** That is not a trim to hit a number — the shimmer block was
 * already the longest stretch in the film where nothing changes, and the
 * frames went straight into a beat that did not exist. If it were not for the
 * new beat they would have stayed where they were.
 *
 * `And when stitched together...` is what the director said and is what this
 * should read. It does not: at 96px four words plus their gaps measure past
 * the frame's usable width, and dropping to a size that fits would leave the
 * two halves of one sentence set differently. `when` is the word that costs
 * the least to lose — the ellipsis already carries the suspension.
 */
const STITCH_LINE_IN = 368;
const STITCH_LINE_OUT_START = 434;
const STITCH_LINE_OUT_END = 448;

/** The payoff, over the finished strip. */
const FILM_LINE_IN = 452;

/** The three marks leaving their scenes and becoming one. */
const MERGE_START = 374;
const MERGE_END = 408;
const MERGED_IN = 400;

const STITCH_IN = 398;
const STITCH_LANDED = 440;

const DROP_FRAMES = 20;
const DROP_HEIGHT = 180;
const MARK_BOB_DELAY = 24;
const LANDING_IMPACT_FRAMES = 6;

const COMP_W = 240;
const COMP_H = (COMP_W * GEOMETRY["texture/scrap-03.png"].content[3]) /
  GEOMETRY["texture/scrap-03.png"].content[2];
const CROP_W = 184;
const CROP_H = 138;
const CROP_LEFT = (COMP_W - CROP_W) / 2;
const CROP_TOP = 56;

const STRIP_W = 420;
const STRIP_H = 58;

/**
 * The row. Three columns one strip wide, at one height — *"drop the staircase,
 * rather just have them in a linear line."*
 *
 * 180 / 740 / 1300 puts the last strip's right edge on 1720, inside the 1780
 * safe margin, with 140px of paper between columns. The composition sits
 * centred over its own strip rather than flush left, so each column reads as
 * one object: a scene, and the timeline it is producing.
 */
const COLUMN_LEFTS = [180, 740, 1300] as const;
const COMP_TOP = 380;
const STRIP_TOP = 660;
const COMP_INSET = (STRIP_W - COMP_W) / 2;

/** Where the three marks meet, above the strip they are about to be stitched into. */
const MERGE_POINT: [number, number] = [960, 800];
const MERGED_W = 152;
const STITCH_LEFT = -60;
const STITCH_TOP = 900;
const STITCH_W = 2040;
const STITCH_H = 100;

const SHIMMER_PASS = 24;
const SHIMMER_W = CROP_W * 0.4;

const SUPERB: Word[] = [{ text: "Superb.", color: COLORS.ink }];
/**
 * **Added 2026-09-02.** The film is silent, so the operation has to be named on
 * the frame — *"we again have to explicitly say that here we create scenes,
 * work on each part of storyboard, in a crisp way."*
 *
 * Four words. It says where the material comes from (a panel), what it becomes
 * (a scene), and that it happens to each of them — which is the whole content
 * of the 200 frames it sits over. `scene.` carries the red for the same reason
 * `team?` does in scene 2: it is the word the sentence is for.
 */
const PANEL_LINE: Word[] = [
  { text: "Each", color: COLORS.ink },
  { text: "panel", color: COLORS.ink },
  { text: "becomes", color: COLORS.ink },
  { text: "a", color: COLORS.ink },
  { text: "scene.", color: COLORS.red },
];

const STITCH_LINE: Word[] = [
  { text: "And", color: COLORS.ink },
  { text: "stitched", color: COLORS.ink },
  { text: "together...", color: COLORS.ink },
];

/**
 * The payoff. **The second line in the film to carry an exclamation mark** —
 * `script.md` still records `Yay!!` as the only one, which is now wrong.
 *
 * It hands straight to scene 5, which opens on that film being previewed and
 * then cuts to a card reading `A silent film.` Three statements in a row about
 * the same object, each one qualifying the last.
 */
const FILM_LINE: Word[] = [
  { text: "It's", color: COLORS.ink },
  { text: "a", color: COLORS.ink },
  { text: "film!", color: COLORS.red },
];

type CompositionSpec = {
  name: string;
  agentFile: "agents/ai-generic.png";
  panelIndex: number;
  /** Index into COLUMN_LEFTS — the scene's column in the row. */
  column: 0 | 1 | 2;
  scrapLand: number;
  markLand: number;
  shimmerIn: number;
  shimmerOut: number;
  markWidth: number;
  markOffset: readonly [number, number];
  bobPeriod: number;
  bobHeight: number;
};

/**
 * **The three composers are one mark as of 2026-09-02**, since the film goes
 * LLM-agnostic in scene 2 and no vendor is named after it. The `name` fields
 * still read Claude / ChatGPT / Gemini because they key this scene's beat
 * constants; they are three workstations, not three vendors.
 *
 * The widths were 88 / 87 / 101, optically matched across three marks of
 * different visual weight (assets.md §2d). That correction is
 * meaningless for one asset used three times — it would just be the same circle
 * drawn at three sizes — so they are now within a few percent, and a little
 * under the old mean because a filled disc sits heavier in the frame than the
 * Gemini spark it replaces.
 */
const MARK = "agents/ai-generic.png" as const;

const COMPOSITIONS: readonly CompositionSpec[] = [
  {
    name: "Claude",
    agentFile: MARK,
    panelIndex: 0,
    column: 0,
    scrapLand: CLAUDE_SCRAP_LAND,
    markLand: CLAUDE_MARK_LAND,
    shimmerIn: CLAUDE_SHIMMER_IN,
    shimmerOut: CLAUDE_SHIMMER_OUT,
    markWidth: 89,
    markOffset: [-4, 3],
    bobPeriod: 163,
    bobHeight: 16,
  },
  {
    name: "ChatGPT",
    agentFile: MARK,
    panelIndex: 1,
    column: 1,
    scrapLand: CHATGPT_SCRAP_LAND,
    markLand: CHATGPT_MARK_LAND,
    shimmerIn: CHATGPT_SHIMMER_IN,
    shimmerOut: CHATGPT_SHIMMER_OUT,
    markWidth: 86,
    markOffset: [4, -3],
    bobPeriod: 185,
    bobHeight: 20,
  },
  {
    name: "Gemini",
    agentFile: MARK,
    panelIndex: 2,
    column: 2,
    scrapLand: GEMINI_SCRAP_LAND,
    markLand: GEMINI_MARK_LAND,
    shimmerIn: GEMINI_SHIMMER_IN,
    shimmerOut: GEMINI_SHIMMER_OUT,
    markWidth: 92,
    markOffset: [-3, -4],
    bobPeriod: 201,
    bobHeight: 13,
  },
];

const stripLeft = (spec: CompositionSpec) => COLUMN_LEFTS[spec.column];
const compLeft = (spec: CompositionSpec) => stripLeft(spec) + COMP_INSET;

/** The mark's resting rect, in PAGE coordinates rather than inside its column. */
const markRect = (spec: CompositionSpec) => {
  const g = GEOMETRY[spec.agentFile];
  const height = spec.markWidth / (g.content[2] / g.content[3]);
  return {
    left: compLeft(spec) + COMP_W - spec.markWidth * 0.45 + spec.markOffset[0],
    top: COMP_TOP - 24 + spec.markOffset[1],
    width: spec.markWidth,
    height,
  };
};

const bobArc = (t: number, period: number, height: number) => {
  if (t <= 0) return 0;
  const p = (t % period) / period;
  return -height * 4 * p * (1 - p);
};

const dropOffset = (f: number, landFrame: number) => {
  const releaseFrame = landFrame - DROP_FRAMES;
  const p = Math.min(1, Math.max(0, (f - releaseFrame) / DROP_FRAMES));
  return -DROP_HEIGHT * (1 - p * p);
};

const landingShape = (f: number, landFrame: number) => {
  if (f < landFrame) return { scaleX: 1, scaleY: 1, shadow: 1 };

  const impactEnd = landFrame + LANDING_IMPACT_FRAMES;
  const impactRelease = ramp(f, landFrame, impactEnd, EASE_OUT);

  if (f <= impactEnd) {
    return {
      scaleX: interpolate(impactRelease, [0, 1], [1.1, 0.97]),
      scaleY: interpolate(impactRelease, [0, 1], [0.82, 1.06]),
      shadow: interpolate(impactRelease, [0, 1], [0.12, 1]),
    };
  }

  const recovery = settle(f - impactEnd, 18, 0.24);
  return {
    scaleX: 0.97 + 0.03 * recovery,
    scaleY: 1.06 - 0.06 * recovery,
    shadow: 1,
  };
};

const StoryboardCrop: React.FC<{
  panelIndex: number;
  f: number;
  shimmerIn: number;
  shimmerOut: number;
}> = ({ panelIndex, f, shimmerIn, shimmerOut }) => {
  const sheet = GEOMETRY["props/storyboard-sheet.png"];
  const [contentX, contentY, contentW, contentH] = sheet.content;
  const [panelX, panelY] = SHEET_PANELS[panelIndex];

  // Each window spans about 29% of the sheet's content width: enough to keep
  // the complete panel and a small border of the surrounding torn sheet.
  const sheetScale = CROP_W / (contentW * 0.29);
  const sheetLeft = CROP_W / 2 - (contentX + panelX * contentW) * sheetScale;
  const sheetTop = CROP_H / 2 - (contentY + panelY * contentH) * sheetScale;

  const shimmerActive = f >= shimmerIn && f < shimmerOut;
  const shimmerPhase = ((f - shimmerIn) % SHIMMER_PASS) / SHIMMER_PASS;
  const shimmerX = interpolate(
    shimmerPhase,
    [0, 1],
    [-SHIMMER_W, CROP_W],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <div
      style={{
        position: "absolute",
        left: CROP_LEFT,
        top: CROP_TOP,
        width: CROP_W,
        height: CROP_H,
        overflow: "hidden",
      }}
    >
      <Img
        name={`Storyboard panel ${panelIndex + 1}`}
        src={asset("props/storyboard-sheet.png")}
        style={{
          position: "absolute",
          left: sheetLeft,
          top: sheetTop,
          width: sheet.box[0] * sheetScale,
          height: sheet.box[1] * sheetScale,
        }}
      />

      {shimmerActive ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: SHIMMER_W,
            height: CROP_H,
            translate: `${shimmerX}px 0px`,
            opacity: 0.55,
            background: `linear-gradient(90deg, transparent 0%, ${COLORS.paper} 48%, transparent 100%)`,
          }}
        />
      ) : null}
    </div>
  );
};

const CompositionObject: React.FC<{
  spec: CompositionSpec;
  f: number;
}> = ({ spec, f }) => {
  const scrapRelease = spec.scrapLand - DROP_FRAMES;
  if (f < scrapRelease) return null;

  const scrapShape = landingShape(f, spec.scrapLand);
  const scrapDropY = dropOffset(f, spec.scrapLand);

  return (
    <div
      style={{
        position: "absolute",
        left: compLeft(spec),
        top: COMP_TOP,
        width: COMP_W,
        height: COMP_H,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          translate: `0px ${scrapDropY}px`,
          scale: `${scrapShape.scaleX} ${scrapShape.scaleY}`,
          transformOrigin: "50% 100%",
        }}
      >
        <PaperPiece
          name={`${spec.name} composition scrap`}
          src="texture/scrap-03.png"
          tint="paper"
          shadow={{
            x: 10 * scrapShape.shadow,
            y: 12 * scrapShape.shadow,
            opacity: 0.18 * scrapShape.shadow,
          }}
          style={placeByContent("texture/scrap-03.png", {
            left: 0,
            top: 0,
            width: COMP_W,
          })}
        />

        <StoryboardCrop
          panelIndex={spec.panelIndex}
          f={f}
          shimmerIn={spec.shimmerIn}
          shimmerOut={spec.shimmerOut}
        />
      </div>

    </div>
  );
};

/**
 * The mark on a composition — **lifted out of `CompositionObject` on 2026-09-02
 * so it can leave.**
 *
 * It used to be a child of its column's div and positioned inside it, which
 * made it cheap to place and impossible to animate anywhere else. The merge
 * needs all three to travel across the frame to a shared point, so each is now
 * drawn at page coordinates from `markRect` and the column div holds only the
 * scrap and the panel crop.
 *
 * Three lives, like scene 2's disc: it drops onto its scene, holds and bobs
 * while the scene is worked, and then converges. Shrinking and spinning on the
 * way in is what stops three identical circles sliding together reading as one
 * circle that was always there.
 */
const AgentMark: React.FC<{
  spec: CompositionSpec;
  index: number;
  f: number;
}> = ({ spec, index, f }) => {
  if (f < spec.markLand - DROP_FRAMES || f >= MERGE_END) return null;

  const rect = markRect(spec);
  const shape = landingShape(f, spec.markLand);
  const dropY = dropOffset(f, spec.markLand);
  const bobY =
    f >= spec.markLand
      ? bobArc(
          f - (spec.markLand + MARK_BOB_DELAY),
          spec.bobPeriod,
          spec.bobHeight,
        )
      : 0;

  const mergeP = ramp(f, MERGE_START, MERGE_END, EASE_IN_OUT);
  const width = rect.width * interpolate(mergeP, [0, 1], [1, 0.55]);
  const height = rect.height * interpolate(mergeP, [0, 1], [1, 0.55]);
  const cx = interpolate(
    mergeP,
    [0, 1],
    [rect.left + rect.width / 2, MERGE_POINT[0]],
  );
  const cy = interpolate(
    mergeP,
    [0, 1],
    [rect.top + rect.height / 2 + dropY + bobY, MERGE_POINT[1]],
  );
  // Different turns in different directions, so the pile does not read as one
  // object that was always one object.
  const spin = mergeP * [-38, 44, -50][index];
  const fade = 1 - ramp(f, MERGE_END - 8, MERGE_END, EASE_IN_OUT);

  return (
    <PaperPiece
      name={spec.name}
      src={spec.agentFile}
      // Travelling paper casts nothing; it only sits on a scene while it works.
      shadow={
        mergeP === 0
          ? {
              x: 7 * shape.shadow,
              y: 9 * shape.shadow,
              opacity: 0.18 * shape.shadow,
            }
          : undefined
      }
      style={{
        ...placeByContent(spec.agentFile, {
          left: cx - width / 2,
          top: cy - height / 2,
          width,
        }),
        opacity: fade,
        transformOrigin: "50% 50%",
        ...(mergeP > 0
          ? { rotate: `${spin}deg` }
          : shape.scaleY !== 1
            ? { scale: `${shape.scaleX} ${shape.scaleY}` }
            : {}),
      }}
    />
  );
};

/**
 * The one mark the three become, popping out of the pile before they are gone
 * so the two events read as one — the same overlap scene 2's fusion uses.
 *
 * It holds above the stitched strip for the rest of the scene: the three
 * parallel workers are now one cut, and the thing that made it is still
 * standing over it.
 */
const MergedMark: React.FC<{ f: number }> = ({ f }) => {
  if (f < MERGED_IN) return null;

  const pop = Math.min(1, Math.max(0, settle(f - MERGED_IN, 11)));
  const bobY = bobArc(f - (MERGED_IN + 10), 89, 14);

  return (
    <PaperPiece
      name="Merged mark"
      src={MARK}
      shadow={{ x: 8, y: 10, opacity: 0.16 }}
      style={{
        ...placeByContent(MARK, {
          left: MERGE_POINT[0] - MERGED_W / 2,
          top: MERGE_POINT[1] - MERGED_W / 2 + bobY,
          width: MERGED_W,
        }),
        transformOrigin: "50% 50%",
        ...(pop < 0.999 ? { scale: pop } : {}),
      }}
    />
  );
};

const TimelineStrip: React.FC<{
  name: string;
  left: number;
  top: number;
  fullWidth: number;
  currentWidth: number;
  divisions: boolean;
  height?: number;
  tint?: "paper" | "periwinkle";
  timeIndicators?: boolean;
}> = ({
  name,
  left,
  top,
  fullWidth,
  currentWidth,
  divisions,
  height = STRIP_H,
  tint = "paper",
  timeIndicators = false,
}) => {
  // Below a sprocket's width there is nothing to see but a sliver of one, which
  // reads as a speck of dirt on the page rather than as a strip starting.
  if (currentWidth < 8) return null;

  const sprocketPitch = 30;
  const sprocketW = 13;
  const sprocketH = 6;
  const sprocketCount = Math.ceil(fullWidth / sprocketPitch);
  const divisionPitch = 58;
  const divisionCount = Math.ceil(fullWidth / divisionPitch);
  const finishX = Math.min(fullWidth - 36, WIDTH - left - 80);
  const playheadX = Math.min(Math.max(14, currentWidth - 7), finishX);

  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        width: currentWidth,
        height,
        filter: "drop-shadow(9px 11px 0 rgba(20, 18, 15, 0.16))",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
        }}
      >
        <PaperPiece
          name={name}
          src="texture/torn-swatch-01.png"
          tint={tint}
          style={{
            left: 0,
            top: 0,
            width: fullWidth,
            height,
          }}
        />

        {Array.from({ length: sprocketCount }, (_, i) => {
          const x = 10 + i * sprocketPitch;
          if (x >= currentWidth) return null;
          return (
            <div key={`top-${i}`}>
              <div
                style={{
                  position: "absolute",
                  left: x,
                  top: 7,
                  width: sprocketW,
                  height: sprocketH,
                  backgroundColor: timeIndicators ? COLORS.paper : COLORS.ink,
                  opacity: 0.78,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: x,
                  top: height - 13,
                  width: sprocketW,
                  height: sprocketH,
                  backgroundColor: timeIndicators ? COLORS.paper : COLORS.ink,
                  opacity: 0.78,
                }}
              />
            </div>
          );
        })}

        {divisions
          ? Array.from({ length: divisionCount }, (_, i) => {
              const x = (i + 1) * divisionPitch;
              if (x >= currentWidth) return null;
              return (
                <div
                  key={`division-${i}`}
                  style={{
                    position: "absolute",
                    left: x,
                    top: 10,
                    width: 2,
                    height: height - 20,
                    backgroundColor: COLORS.ink,
                    opacity: 0.2,
                  }}
                />
              );
            })
          : null}

        {timeIndicators
          ? Array.from({ length: 11 }, (_, i) => {
              const x = 42 + i * 188;
              if (x + 54 >= currentWidth) return null;
              return (
                <div
                  key={`time-${i}`}
                  style={{
                    position: "absolute",
                    left: x,
                    top: 34,
                    color: COLORS.paper,
                    fontFamily: "monospace",
                    fontSize: 20,
                    fontWeight: 700,
                    letterSpacing: 1,
                  }}
                >
                  {`00:${String(i * 2).padStart(2, "0")}`}
                </div>
              );
            })
          : null}

        {timeIndicators && currentWidth > 24 ? (
          <>
            <div
              style={{
                position: "absolute",
                left: playheadX,
                top: 18,
                width: 7,
                height: height - 36,
                backgroundColor: COLORS.red,
              }}
            />
            <div
              style={{
                position: "absolute",
                left: playheadX - 12,
                top: 14,
                width: 0,
                height: 0,
                borderLeft: "15px solid transparent",
                borderRight: "15px solid transparent",
                borderTop: `16px solid ${COLORS.red}`,
              }}
            />
          </>
        ) : null}
      </div>
    </div>
  );
};

const SuperbBeat: React.FC<{ f: number }> = ({ f }) => {
  const enter = ramp(f, SUPERB_HAND_IN, SUPERB_HAND_LAND, EASE_IN_OUT);
  const exit = ramp(f, SUPERB_OUT_START, SUPERB_OUT_END, EASE_IN_OUT);
  const handShape = landingShape(f, SUPERB_HAND_LAND);
  const bobY =
    f >= SUPERB_BOB_IN && f < SUPERB_OUT_START
      ? bobArc(f - SUPERB_BOB_IN, 34, 38)
      : 0;
  const gestureRotate =
    f >= SUPERB_BOB_IN && f < SUPERB_OUT_START
      ? Math.sin(((f - SUPERB_BOB_IN) / 34) * Math.PI * 2) * 4
      : 0;
  const travelY = (1 - enter) * 1080 + exit * 1080 + bobY * (1 - exit);

  if (f < SUPERB_HAND_IN || f >= SUPERB_OUT_END) return null;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        translate: `0px ${travelY}px`,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 610,
          width: WIDTH,
          display: "flex",
          justifyContent: "center",
        }}
      >
        {SUPERB.map((word, i) => (
          <PoppedWord
            key={word.text}
            word={word}
            index={i}
            frame={f}
            appearFrame={SUPERB_WORD_IN}
            stagger={3}
            fontFamily={display}
            fontSize={132}
            settlePeriod={24}
          />
        ))}
      </div>

      <PaperPiece
        name="Superb hand"
        src="hands/superb.png"
        shadow={{
          x: 12 * handShape.shadow,
          y: 15 * handShape.shadow,
          opacity: 0.24,
        }}
        style={{
          ...placeByContent("hands/superb.png", {
            left: 774,
            top: 300,
            width: 420,
          }),
          rotate: `${180 + gestureRotate}deg`,
          scale: `${handShape.scaleX} ${handShape.scaleY}`,
          transformOrigin: "50% 50%",
        }}
      />
    </div>
  );
};

const TopLine: React.FC<{
  words: Word[];
  appearFrame: number;
  f: number;
  opacity?: number;
}> = ({ words, appearFrame, f, opacity = 1 }) => (
  <div
    style={{
      position: "absolute",
      left: 0,
      top: 110,
      width: WIDTH,
      display: "flex",
      justifyContent: "center",
      gap: 28,
      opacity,
    }}
  >
    {words.map((word, i) => (
      <PoppedWord
        key={word.text}
        word={word}
        index={i}
        frame={f}
        appearFrame={appearFrame}
        stagger={5}
        fontFamily={display}
        fontSize={96}
        settlePeriod={24}
      />
    ))}
  </div>
);

export const SceneFour: React.FC = () => {
  const f = onTwos(useCurrentFrame());

  /**
   * Each strip's own growth, on its own clock.
   *
   * Linear rather than eased: this is a recording being laid down, not a piece
   * of paper landing, and an ease-out would have it sprint and then creep.
   * The 1.04 overshoot the single shared strip used is gone with it — an
   * overshoot is an arrival, and these do not arrive, they fill up.
   */
  const stripWidth = (spec: CompositionSpec) =>
    STRIP_W *
    ramp(
      f,
      spec.scrapLand + STRIP_LEAD,
      spec.shimmerOut - STRIP_AHEAD,
      Easing.linear,
    );

  const stitchWidth =
    STITCH_W * ramp(f, STITCH_IN, STITCH_LANDED, EASE_IN_OUT);

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

      <SuperbBeat f={f} />

      {COMPOSITIONS.map((spec) => (
        <TimelineStrip
          key={`${spec.name}-timeline`}
          name={`${spec.name} timeline`}
          left={stripLeft(spec)}
          top={STRIP_TOP}
          fullWidth={STRIP_W}
          currentWidth={stripWidth(spec)}
          divisions
        />
      ))}

      <TimelineStrip
        name="Stitched continuous timeline"
        left={STITCH_LEFT}
        top={STITCH_TOP}
        fullWidth={STITCH_W}
        currentWidth={stitchWidth}
        divisions={false}
        height={STITCH_H}
        tint="periwinkle"
        timeIndicators
      />

      {COMPOSITIONS.map((spec) => (
        <CompositionObject key={spec.name} spec={spec} f={f} />
      ))}

      {COMPOSITIONS.map((spec, i) => (
        <AgentMark key={`${spec.name}-mark`} spec={spec} index={i} f={f} />
      ))}

      <MergedMark f={f} />

      {/* Two lines, never together, both in the same top slot: the scene names
          what it is doing, then names what happens to it. */}
      {f < PANEL_LINE_OUT_END ? (
        <TopLine
          words={PANEL_LINE}
          appearFrame={PANEL_LINE_IN}
          f={f}
          opacity={1 - ramp(f, PANEL_LINE_OUT_START, PANEL_LINE_OUT_END)}
        />
      ) : null}

      {f < STITCH_LINE_OUT_END ? (
        <TopLine
          words={STITCH_LINE}
          appearFrame={STITCH_LINE_IN}
          f={f}
          opacity={1 - ramp(f, STITCH_LINE_OUT_START, STITCH_LINE_OUT_END)}
        />
      ) : null}

      <TopLine words={FILM_LINE} appearFrame={FILM_LINE_IN} f={f} />
    </AbsoluteFill>
  );
};
