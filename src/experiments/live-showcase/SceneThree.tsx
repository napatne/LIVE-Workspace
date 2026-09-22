import { loadFont as loadArchivoBlack } from "@remotion/google-fonts/ArchivoBlack";
import { AbsoluteFill, Easing, Img, useCurrentFrame } from "remotion";
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
 * Scene 3 · The storyboard — 195f.
 *
 * > *The human's whole contribution is the plan, and it is handmade and
 * > imperfect.*
 *
 * **195 frames, not 263.** Scenes 1 and 2 were slowed 1.35× on 2026-09-02;
 * scene 3 was never rescaled and the director chose to keep the storyboard's
 * own figure when the beat sheet was approved. So the beats below were designed
 * to fit 195 rather than stretched into it.
 *
 * Every beat was approved by the director in 1–2 second chunks before any of
 * this was written, the same way scene 2 was:
 *
 *   f0-45    the hand travels in with the sheet and the sheet settles
 *   f45-90   the line arrives alone, lower left, and holds
 *   f90-140  the three agents peek in from the edges, cropped, and lean
 *   f140-195 three ink lines draw from the panels to the marks, then 15 still
 *
 * **The halftone field is gone, 2026-09-02.** The approved beat sheet opened on
 * a code-drawn dot field building outward from frame centre — the storyboard's
 * *"a halftone dot field fills the background; this is where processing
 * begins"*. Built, watched, and cut: *"lets get rid of the halftone dot field
 * and just start from the hand entering with the storyboard"*. So the scene now
 * opens on bare paper with the hand already arriving, and the storyboard
 * document's scene 3 description is stale on this point.
 */

/** Content aspect of the two scene-3 pieces, from their measured boxes. */
const SHEET_G = GEOMETRY["props/storyboard-sheet.png"];
const SHEET_ASPECT = SHEET_G.content[2] / SHEET_G.content[3];
const HAND_G = GEOMETRY["hands/holding.png"];
const HAND_ASPECT = HAND_G.content[2] / HAND_G.content[3];

/**
 * The sheet, hard against the right safe margin, leaving the lower left clear
 * for the line.
 *
 * **Moved right on 2026-09-02** — *"can we move the storyboard to the right and
 * the hand more to the left so it actually looks like its holding it as you can
 * see currently the storyboard is too much behind the hand"*. It used to sit at
 * 1010 with the grip 290px in from its left edge, which put the hand under the
 * middle of the sheet rather than on its edge. 1140 with the grip 45px in is
 * the same gesture read correctly: fingers on the corner, sheet held out to the
 * right of them.
 *
 * **Enlarged to 820 and re-anchored to 960 on 2026-09-02**, on a director note
 * with a reference image: the sheet should dominate the upper right, bigger
 * than before. The width still follows from the margin: `SAFE_MARGIN` puts the
 * right limit at 1780, so 960 + 820 lands exactly on it.
 */
const SHEET_W = 820;
const SHEET_H = SHEET_W / SHEET_ASPECT;
const SHEET_LEFT = 960;
/** The board's own edges, which the three hovering marks are placed against. */
const SHEET_RIGHT = SHEET_LEFT + SHEET_W;
// Nudged up from 150 on 2026-09-02, same session: at 150 the sheet's
// lower-left corner sat low enough to cover the thumb along with the rest of
// the grip, which over-hid the hand. 110 clears it.
const SHEET_TOP = 110;
const SHEET_BOTTOM = SHEET_TOP + SHEET_H;

/**
 * The grip, in page coordinates — where the hand's pinch meets the sheet.
 *
 * `holding.png` is a pinch pose: fingers at the top right of its content box,
 * forearm running down to the lower left. The pinch sits at (0.867, 0.250) of
 * the content box, measured off the artwork, and everything about the hand is
 * positioned FROM that point rather than from its own corner — so the sheet can
 * be moved without the hand losing its grip on it.
 */
const HAND_PINCH = { x: 0.867, y: 0.25 };
const HAND_W = 380;
const HAND_H = HAND_W / HAND_ASPECT;

/**
 * The hand grips the sheet's lower-left CORNER, its pinch right on the sheet's
 * left edge.
 *
 * **Moved left to 1140 on 2026-09-02**, and this is the third position for it.
 * It went 1010-and-290-in, then 1185-and-45-in on *"the storyboard is too much
 * behind the hand"* — the note that fixed the sheet at 1140 — and now the pinch
 * sits exactly on the sheet's left edge, so the whole sheet is held out to the
 * right of the hand rather than partly behind it.
 *
 * **A real pinch was tried here and rejected.** The director's note asked for
 * the hand *"behind the storyboard but you can see the thumb ... just not the
 * other fingers"*, which is three layers, not two: a flat cut-out cannot be both
 * behind and in front of the paper. It was built — hand under the sheet, the
 * grip moved to (1430, 612) so the finger cluster fell inside the sheet's box,
 * and a second copy of `holding.png` drawn over the sheet clipped to a polygon
 * around the thumb. Rendered and shown, the verdict was:
 *
 *   > *"this looks weird because you can see the fingers and it looks all
 *   > disconnected. you can just revert to the original hand but move the hand a
 *   > bit more to the left"*
 *
 * So the hand was made one piece again, drawn over the sheet, and the gesture
 * was carried by position alone. **Do not re-attempt the clipped-thumb
 * version** — it is not a matter of tuning the polygon; the pose reads as
 * disconnected because the hidden fingers leave the thumb with nothing
 * attaching it to the arm. That warning still applies to any three-layer,
 * exposed-thumb build.
 *
 * **The hand moved wholly behind the sheet on 2026-09-02**, on a director note
 * with a reference image, and shrunk to 380px (≈46% of the sheet's new
 * 820px width) to match it. This is not the rejected build above: it is the
 * plain two-layer version — one hand, entirely behind the sheet, nothing
 * clipped, no exposed thumb. The grip now sits just inside the sheet's
 * lower-left corner (960, 852) rather than on its edge, because the pinch
 * overlapping the paper is simply hidden by it now that the sheet draws on
 * top — that overlap is the occlusion the reference shows.
 */
const GRIP = { x: 993, y: 810 };
const HAND_LEFT = GRIP.x - HAND_PINCH.x * HAND_W;
const HAND_TOP = GRIP.y - HAND_PINCH.y * HAND_H;

/**
 * The travel. The whole group starts clear of the left edge and eases in.
 *
 * A TRAVEL, not a stamp: the stamp is scene 1's gesture and is not spent twice
 * (storyboard, scene 3 motion note — *"hand travels in on an ease-out"*).
 *
 * Starts at f2 rather than f14 since the halftone field it used to enter over
 * was cut: the scene opens ON the hand arriving, which is what the note asked
 * for. It still lands well before the line at f60.
 */
const HAND_IN = 2;
const HAND_LANDED = 26;
const GROUP_OFF_X = -(SHEET_LEFT + SHEET_W + 40);

/**
 * A gentler ease-out than the film's, and deliberately local to this file.
 *
 * `EASE_OUT` (theme.ts) is `bezier(0.16, 1, 0.3, 1)` — an expo-out tuned for
 * things that POP: at a third of its duration it has already covered 85% of
 * the distance. On a 1750px travel that put the sheet at rest by f20, six
 * frames into a twenty-frame move, which is a snap and not the storyboard's
 * *"hand travels in on an ease-out"*. Verified on a still before it was
 * changed.
 *
 * This curve reaches ~60% at the halfway point instead, so the travel is
 * legible for its whole length and still lands soft.
 */
const TRAVEL_IN = Easing.bezier(0.25, 0.55, 0.3, 1);

/**
 * The sheet's own rotation settle, independent of the hand and pivoting about
 * the grip — so it reads as a sheet being HELD, which is the storyboard's whole
 * note on it, rather than as a rectangle pasted to a wrist.
 */
const SHEET_TILT = 4.5;

/**
 * **Two lines now, in sequence — 2026-09-02.**
 *
 *   > *"since there is no audio we will have to explicitly say where [what] is
 *   > happening, so when the storyboard scene starts we will have to say build
 *   > a narrative with your agents ... the storyboard line stays but agentic
 *   > narrative is needed too, as storyboard comes after the narrative. this is
 *   > making more sense."*
 *
 * The film is silent and carries no narration, so anything the audience is
 * meant to understand has to be on the frame in words. This scene used to show
 * a plan arriving and say only `Create your storyboard.` — which named the
 * artefact and skipped the act. The narrative is what the agents are for, and
 * it comes first: you decide what the story is, and only then do you board it.
 *
 * **They never share the frame.** `script.md`'s standing rule is one line at a
 * time, because at these speeds a second one cannot be read; the narrative line
 * is out before the storyboard line arrives.
 *
 * Different slots on purpose. The narrative line takes the empty upper left,
 * beside the board and above the arm, where the eye already is when the sheet
 * lands. The storyboard line keeps the lower-left slot it was approved in,
 * unmoved and unresized — that beat was settled and this change does not
 * reopen it.
 */
const NARRATIVE_IN = 34;
const NARRATIVE_OUT_START = 146;
const NARRATIVE_OUT_END = 160;
const NARRATIVE_SIZE = 84;
const NARRATIVE_TOP = 150;
const NARRATIVE_ROWS: Word[][] = [
  [
    { text: "Build", color: COLORS.ink },
    { text: "a", color: COLORS.ink },
  ],
  [
    { text: "narrative", color: COLORS.ink },
    { text: "with", color: COLORS.ink },
  ],
  [
    { text: "your", color: COLORS.ink },
    { text: "agents.", color: COLORS.red },
  ],
];

/** The line. Two rows, so it fits the column left of the forearm. */
const LINE_IN = 174;
const LINE_STAGGER = 3;
const LINE_SIZE = 92;
const LINE_TOP = 760;
// Nudged left of SAFE_MARGIN on 2026-09-02, same session — a director request
// specific to this line, not a change to the shared safe-frame margin.
const LINE_LEFT = SAFE_MARGIN - 40;
const LINE_ROW_GAP = 12;
const WORD_GAP = 24;
/**
 * **`Then storyboard it.` as of 2026-09-02, from `Create your storyboard.`**
 *
 *   > *"the create your storyboard is a bit off, because the previous line is
 *   > build a narrative, so here the line might be different."*
 *
 * Right, and it is a problem the line only acquired when it got a predecessor.
 * `Create your storyboard.` was written to stand alone and it works alone —
 * but placed after `Build a narrative with your agents.` it restarts rather
 * than continues: two imperatives to make two separate things, with nothing
 * saying the second is the first one taken further. It reads as a list of
 * chores.
 *
 * Using the noun as a verb lets the pronoun do the joining — **`it` is the
 * narrative**, so the sentence cannot be read as a new task. Same slot, same
 * size, still two rows.
 *
 * **The first word was `Now` for one pass and the director sent it back the
 * same day:** *"the lines felt off like build a narrative, and then storyboard
 * it — the `now` seems aggressive."* `Now` is urgency. Put in front of an
 * imperative, immediately after another imperative, it stops being a sequencer
 * and starts being a person raising their voice — and this film is showing
 * someone their own tool, not drilling them.
 *
 * `Then` does the same structural job with none of that: it says the second
 * thing follows the first, which is the entire point of the line existing.
 */
const LINE_ROWS: Word[][] = [
  [{ text: "Then", color: COLORS.ink }],
  [
    { text: "storyboard", color: COLORS.ink },
    { text: "it.", color: COLORS.red },
  ],
];

type AgentSpec = {
  name: string;
  file: keyof typeof GEOMETRY;
  /** Where the mark rests, CROPPED by its edge — the storyboard's "peeking". */
  left: number;
  top: number;
  markWidth: number;
  /** Which way it travels in from, as a unit offset applied before landing. */
  from: [number, number];
  releaseFrame: number;
  landFrame: number;
  /** The 3-5deg lean toward the sheet it settles into. */
  lean: number;
  /** The hover, once landed: its own drift periods, amplitudes and phase. */
  phase: number;
  periodX: number;
  periodY: number;
  ampX: number;
  ampY: number;
  bobPeriod: number;
  bobHeight: number;
};

/**
 * The three marks, hovering ON the board.
 *
 * ---
 * ## Rewritten 2026-09-02 — the lines are gone and the marks came in
 *
 *   > *"the agents and lines metaphor was off ... so it's better to have agents
 *   > close by and hovering around the board"*
 *
 * **What was here until now:** the three marks sat cropped by the frame edges,
 * a third to a half of each off-screen — the storyboard's *"lean in from the
 * edges, peeking"* — and three hand-drawn ballpoint lines were struck from the
 * sheet's panels out to them. That whole apparatus is deleted: `InkLines`, the
 * Catmull-Rom `smoothPath`, the seeded wander, the doubled under-pass, and the
 * `panel` / `lineFrame` fields that aimed them. It is in git if it is ever
 * wanted back.
 *
 * **Why it went.** The lines were a diagram of attention drawn on top of a
 * collage — the one true vector construction in a film made of torn paper and
 * ballpoint, which is why an earlier note had already asked for them to be
 * hand-drawn. That fixed how they looked and not what they said. Three rules
 * radiating from a document to three logos reads as a systems diagram: it
 * asserts a relationship rather than showing one. Marks that are simply
 * *there*, close in and drifting over the sheet, show the same thing and need
 * no notation.
 *
 * **And the peeking is over.** *"actually i do like the idea of them peeking so
 * its fine"* settled an earlier round and is superseded by the note above; the
 * marks are now well inside frame and near the board rather than cropped by the
 * edges. That instruction is dead — do not restore the cropped positions from
 * it.
 *
 * They are drawn AFTER the sheet, so they hover in front of it. Each straddles
 * an edge or a corner of the board and each keeps clear of the six drawn
 * panels: two sit below the sheet's bottom rule where its paper is blank, one
 * over its top-left margin. A mark parked over a panel would hide the very
 * thing the scene is about.
 *
 * Drift periods and amplitudes share no factors between marks — the same
 * discipline as scene 2's bob and sway pairs — so the three never fall into
 * phase over the time they are on screen together and the hover never reads as
 * a loop.
 */
const MARK = "agents/ai-generic.png" as const;

const AGENTS: AgentSpec[] = [
  {
    name: "Top left corner",
    file: MARK,
    left: SHEET_LEFT - 35,
    top: SHEET_TOP + 35,
    markWidth: 150,
    from: [-300, -120],
    releaseFrame: 70,
    landFrame: 88,
    lean: 6,
    phase: 0,
    periodX: 109,
    periodY: 151,
    ampX: 11,
    ampY: 9,
    bobPeriod: 163,
    bobHeight: 8,
  },
  {
    name: "Right edge",
    file: MARK,
    // In the gutter between the sheet's two rows of panels, straddling its
    // right edge without covering either row.
    left: SHEET_RIGHT - 149,
    top: SHEET_TOP + 261,
    markWidth: 138,
    from: [340, 0],
    releaseFrame: 86,
    landFrame: 104,
    lean: -5,
    phase: 43,
    periodX: 137,
    periodY: 97,
    ampX: 9,
    ampY: 12,
    bobPeriod: 185,
    bobHeight: 7,
  },
  {
    name: "Bottom edge",
    file: MARK,
    // Straddling the bottom rule, over the sheet's blank lower margin.
    left: SHEET_LEFT + 164,
    top: SHEET_BOTTOM - 58,
    markWidth: 152,
    from: [120, 320],
    releaseFrame: 102,
    landFrame: 120,
    lean: -4,
    phase: 89,
    periodX: 167,
    periodY: 127,
    ampX: 12,
    ampY: 10,
    bobPeriod: 201,
    bobHeight: 9,
  },
];

/**
 * Scene 2's arrival, reused: the `4p(1-p)` overshoot that lets a piece arrive
 * with weight without a second curve. Here it drives an offset that decays to
 * zero rather than a fall, because these come in sideways.
 */
const AgentPiece: React.FC<{ agent: AgentSpec; f: number }> = ({
  agent,
  f,
}) => {
  if (f < agent.releaseFrame) return null;

  const p = ramp(f, agent.releaseFrame, agent.landFrame, EASE_OUT);
  const offX = agent.from[0] * (1 - p);
  const offY = agent.from[1] * (1 - p);

  // The lean arrives after the mark does, over its own 10 frames, so the
  // gesture reads as "settling in to look" rather than as an entry angle.
  const lean = agent.lean * ramp(f, agent.landFrame, agent.landFrame + 10);

  // The hover. Two slow sines on different periods plus the film's own hop
  // arc, all gated on the landing so nothing drifts while it is still
  // travelling. **This is the only thing left saying the marks are attending to
  // the board** now that the ink lines are gone, so it is load-bearing rather
  // than decoration — the same position the sway holds in scene 2.
  const hoverT = f - agent.landFrame;
  const driftX =
    hoverT > 0 ? Math.sin((f + agent.phase) / agent.periodX) * agent.ampX : 0;
  const driftY =
    hoverT > 0 ? Math.cos((f + agent.phase) / agent.periodY) * agent.ampY : 0;
  const bobY = bobArc(hoverT, agent.bobPeriod, agent.bobHeight);
  // A degree and a half of tilt on its own slow period, so the lean breathes
  // instead of holding a fixed angle for four seconds.
  const tilt =
    hoverT > 0
      ? Math.sin((f + agent.phase) / (agent.bobPeriod * 0.7)) * 1.5
      : 0;

  return (
    <PaperPiece
      name={agent.name}
      src={agent.file}
      shadow={{ x: 9, y: 11, opacity: 0.14 }}
      style={{
        ...placeByContent(agent.file, {
          left: agent.left + offX + driftX,
          top: agent.top + offY + driftY + bobY,
          width: agent.markWidth,
        }),
        rotate: `${lean + tilt}deg`,
      }}
    />
  );
};

/** `4p(1-p)`, the film's hop arc — see scene 2. */
function bobArc(t: number, period: number, height: number) {
  if (t <= 0) return 0;
  const p = (t % period) / period;
  return -height * 4 * p * (1 - p);
}

/**
 * A line set as rows of popped words, with one continuous stagger running
 * across all of them — so a sentence broken over three rows still reads as one
 * line being placed word by word rather than as three lines arriving.
 */
const Rows: React.FC<{
  rows: Word[][];
  appearFrame: number;
  left: number;
  top: number;
  size: number;
  f: number;
  opacity?: number;
}> = ({ rows, appearFrame, left, top, size, f, opacity = 1 }) => {
  let placed = 0;
  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        display: "flex",
        flexDirection: "column",
        gap: LINE_ROW_GAP,
        opacity,
      }}
    >
      {rows.map((row, r) => {
        const offset = placed;
        placed += row.length;
        return (
          <div
            key={r}
            style={{ display: "flex", alignItems: "flex-end", gap: WORD_GAP }}
          >
            {row.map((w, i) => (
              <PoppedWord
                key={w.text}
                word={w}
                index={offset + i}
                frame={f}
                appearFrame={appearFrame}
                stagger={LINE_STAGGER}
                fontFamily={display}
                fontSize={size}
                settlePeriod={18}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
};

export const SceneThree: React.FC = () => {
  const f = onTwos(useCurrentFrame());

  // The whole hand-and-sheet group travels in as one piece.
  const travel = ramp(f, HAND_IN, HAND_LANDED, TRAVEL_IN);
  const groupX = GROUP_OFF_X * (1 - travel);

  // ...and the sheet alone keeps settling after the group has stopped, about
  // the grip point.
  const tilt = SHEET_TILT * (1 - settle(f - HAND_LANDED, 15, 0.34));

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

      {/*
        The hand is drawn first and the sheet on top of it, so the sheet's
        lower-left corner covers the fingers — which is the whole difference
        between standing behind a sheet and holding one in front of your body.
        This is the reverse of how it was built originally (sheet first, hand
        on top, fingers overlapping the paper's corner): that was reversed on
        a 2026-09-02 director note with a reference image asking for the hand
        behind the sheet. A three-layer, exposed-thumb version of "behind" was
        tried earlier the same day and rejected — see the note on `GRIP`. This
        is not that: it is the plain two-layer swap, one hand wholly behind,
        nothing clipped.

        **Positioned by `left`, not by a transform on a wrapper.** The travel
        used to be a `translate` on a div around both pieces. A transformed
        wrapper is promoted to its own raster layer, and the sheet — a 1823px
        drawing displayed at 820 — is the one piece in the film whose fine pen
        lines that costs anything: it rendered visibly softer than the hand
        beside it. Both pieces take the offset in their own coordinates instead.
      */}
      <PaperPiece
        name="Hand holding the storyboard"
        src="hands/holding.png"
        shadow={{ x: 14, y: 17, opacity: 0.22 }}
        style={placeByContent("hands/holding.png", {
          left: HAND_LEFT + groupX,
          top: HAND_TOP,
          width: HAND_W,
        })}
      />

      <PaperPiece
        name="Storyboard sheet"
        src="props/storyboard-sheet.png"
        sharpen
        shadow={{ x: 16, y: 20, opacity: 0.18 }}
        style={{
          ...placeByContent("props/storyboard-sheet.png", {
            left: SHEET_LEFT + groupX,
            top: SHEET_TOP,
            width: SHEET_W,
          }),
          // Dropped entirely once the settle has run out rather than left at
          // `0deg`: a rotate of any value is still a transform, and the point
          // of the note above is that the sheet spends most of the scene
          // untransformed and therefore sharp.
          ...(Math.abs(tilt) > 0.01
            ? {
                transformOrigin: `${GRIP.x - SHEET_LEFT + SHEET_G.content[0] * (SHEET_W / SHEET_G.content[2])}px ${
                  GRIP.y - SHEET_TOP + SHEET_G.content[1] * (SHEET_W / SHEET_G.content[2])
                }px`,
                rotate: `${tilt}deg`,
              }
            : {}),
        }}
      />

      {/* **After the sheet, so they hover in front of it** — the whole point of
          the change that removed the ink lines. Before it they were drawn
          underneath and anything overlapping the paper was simply hidden by
          it, which is why they had to be parked out at the frame edges. */}
      {AGENTS.map((a) => (
        <AgentPiece key={a.name} agent={a} f={f} />
      ))}

      {/* The narrative, upper left beside the board. Gone before the storyboard
          line arrives — see the note on NARRATIVE_IN. */}
      {f < NARRATIVE_OUT_END ? (
        <Rows
          rows={NARRATIVE_ROWS}
          appearFrame={NARRATIVE_IN}
          left={LINE_LEFT}
          top={NARRATIVE_TOP}
          size={NARRATIVE_SIZE}
          f={f}
          opacity={1 - ramp(f, NARRATIVE_OUT_START, NARRATIVE_OUT_END)}
        />
      ) : null}

      {/* Lower left, below the sheet and clear of the forearm — the approved
          slot, unmoved. */}
      <Rows
        rows={LINE_ROWS}
        appearFrame={LINE_IN}
        left={LINE_LEFT}
        top={LINE_TOP}
        size={LINE_SIZE}
        f={f}
      />
    </AbsoluteFill>
  );
};
