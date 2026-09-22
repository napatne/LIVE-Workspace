import { loadFont as loadArchivoBlack } from "@remotion/google-fonts/ArchivoBlack";
import { loadFont as loadBerkshireSwash } from "@remotion/google-fonts/BerkshireSwash";
import {
  AbsoluteFill,
  Easing,
  Freeze,
  Img,
  useCurrentFrame,
} from "remotion";
import { asset, GEOMETRY, PaperFilters, PaperPiece, placeByContent } from "./Paper";
import { PoppedWord, type Word } from "./PoppedWord";
import {
  COLORS,
  EASE_IN,
  EASE_OUT,
  HEIGHT,
  onTwos,
  ramp,
  seeded,
  WIDTH,
} from "./theme";
import { SceneOne } from "./SceneOne";

const { fontFamily: display } = loadArchivoBlack();
const { fontFamily: cardFace } = loadBerkshireSwash();

/**
 * Scene 5 · Silent era — 522f.
 *
 * > *The film notices it is silent, says so on an intertitle, and gets a
 * > soundtrack laid under it.*
 *
 * Built to a scene plan since folded into the storyboard, which replaced
 * the storyboard's scene 5 ("the verdict") on 2026-09-02. There is deliberately
 * **no rejection beat, no thumbs pose, no saturate drain-and-flood and no red
 * slash** here; do not reintroduce them from `storyboard.md`, which is stale on
 * this scene.
 *
 * The one thing with no precedent elsewhere in the film: the rectangle at the
 * centre is not a still and not a `<Plate>`. It is the real `SceneOne`
 * component, mounted read-only and held by `<Freeze>` at a playhead this file
 * computes — so the picture genuinely plays, freezes, and plays again. There is
 * no plate dependency and no second capture pass.
 *
 * **Every beat frame is a constant below.** Scene timings start as estimates and
 * are settled once all six scenes can be watched in sequence, so re-timing this
 * scene is editing the block below rather than hunting through JSX.
 *
 * ---
 * **Director notes, 2026-09-02, on the first build. All four are built in:**
 *
 * 1. *"this first opening scene, we need to make a timeline too so show that
 *    this is a preview of film"* — the picture track now carries a scrubber: a
 *    played region and a playhead marker driven by the same computed playhead
 *    the picture is. It moves while the film plays, stops dead when the film
 *    freezes, and snaps back to zero when the film restarts, so the pause and
 *    the restart read without any icon.
 * 2. *"i need the placard to cover it all"* — the intertitle is full frame
 *    (1920x1080), not a 1180x620 card sitting on the page.
 * 3. *"the sound layer we need a better signifier saying that lets add sound or
 *    work on sound"* — the noteheads-and-dashes stave is replaced by a real
 *    symmetric audio waveform, and the tool is a speaker with radiating waves
 *    rather than a music note. Both are bigger.
 * 4. *"the clapping hands need to point inwards or flip and make it smaller and
 *    in the frame currently its overflowing"* and *"the yay belongs outside the
 *    frame beneath the sound layer, between hands not in the frame"* — the
 *    hands are smaller, rotated inward about their own wrists, and fully inside
 *    the composition; `Yay!!` has moved off the picture to below the audio
 *    track, in the gap between the two pairs.
 *
 * Note 4 forced the whole lower third up: `Yay!!` cannot sit under the audio
 * track at the old geometry without leaving the frame. The picture is 960x540
 * at y=104 (was 1000x563 at y=110) and both tracks moved up with it. Reported
 * to the director rather than done silently.
 */

export const SCENE_FIVE_DURATION = 522;

/**
 * The scrubber track's denominator, in frames. **Not scene 1's duration.**
 *
 * This was written as `SCENE_ONE_FRAMES = 162` and documented as "SceneOne's
 * own length", on the strength of scene 1's file header. Both were wrong by the
 * time this file was written: `LIVE_SCENE_ONE` is **114**, and scene 1's header
 * saying 162 is itself stale — it was trimmed 162 -> 114 earlier the same day and
 * the comment never followed. Corrected 2026-09-02 during the reconciliation
 * pass; scene 1's own header is the collaborator's file and was left alone.
 *
 * **Do not "fix" this to 114.** The playhead reaches 126 before the film pauses
 * (`PAUSE_AT_LOCAL`), so a 114-frame denominator would put the marker at the far
 * end of the track at the moment the film is supposed to stop *partway* — the
 * pause would read as the film having finished, which is the opposite of the
 * beat. The track is the film's timeline, and the picture inside it is scene 1
 * standing in for the whole film; the denominator belongs to the track.
 *
 * If the director wants the track to genuinely measure scene 1, the pause has to
 * move to about f142 and every beat after it shifts. That is a re-time, not a
 * constant.
 */
const PREVIEW_TRACK_FRAMES = 162;

// ---------------------------------------------------------------------------
// Beats. Provisional — see the note above.
// ---------------------------------------------------------------------------

/** Beat 1 — the playhead leaves 0 and SceneOne starts playing. */
const FILM_IN = 62;
/** Beat 2 — the playhead stops. */
const PAUSE_AT = 188;
/** Where it stops, in SceneOne's own frames. */
const PAUSE_AT_LOCAL = PAUSE_AT - FILM_IN;

/** Beat 2 — the grey wash sweeps left to right across picture AND track. */
const WASH_IN_START = 188;
const WASH_IN_END = 216;

/** Beat 3 — the intertitle. Hard cuts on both ends; nothing eases. */
const CARD_IN = 238;
const CARD_OUT = 336;

/**
 * Beat 4 — the tool.
 *
 * `TOOL_ENTER` is an addition to the plan, which says the tool "enters from the
 * left" at f280 *and* travels from f280. Those cannot both be literal, so the
 * fly-in gets the dead 12 frames between the card cutting out and the travel
 * starting, and f280 is still the frame it reaches the track's left end and
 * begins laying tape.
 */
const TOOL_ENTER = 336;
const TOOL_IN = 350;
const TOOL_TRAVEL_END = 436;
const TOOL_EXIT_END = 450;

/** Beat 4 — the grey lifts, and the picture starts over with sound under it. */
const WASH_OUT_START = 436;
const WASH_OUT_END = 460;
/**
 * The picture restarts from SceneOne's own frame 0 rather than resuming from
 * `PAUSE_AT_LOCAL`.
 *
 * SceneOne is 114 frames but all of its motion is over by its own frame ~84 —
 * block landed at 27, line in by 39, hand stamped at 62 and settled by ~82. A
 * playhead resumed at 100 would advance a number that changes nothing on
 * screen, so "it plays again" would look identical to "it is still paused" and
 * the whole point of laying the track would be lost. Restarting at 0 puts the
 * block rise, the line and the stamp (local f62, here f410) back on screen, and
 * snaps the scrubber back to the head of the track where it can be seen doing
 * it. Approved by the director 2026-09-02 before this file was written.
 */
const RESUME_AT = 436;

/** Beat 5 — the applause. */
const CLAP_IN = 466;
const CLAP_LANDED = 488;

/**
 * Beat 4 — the line cue, added on the director's note *"the lets add sound line
 * queue."*
 *
 * **This is a third line of copy in a scene that was specified with two.** The
 * director asked for it directly, and the rule it bends is rule 4 in the
 * storyboard — one line on screen at a time, which this still obeys, since the
 * three never share the frame. The rule it answers to is rule 6: a silent film
 * says what it is doing. It is
 * built; the string still needs adding to `script.md` by someone who owns that
 * document.
 *
 * It takes the same slot the shout later takes, so the position reads as the
 * film's own caption line: cue in, cue out, shout in.
 */
const CUE_IN = 344;
const CUE_OUT_START = 432;
const CUE_OUT_END = 446;

/** Beat 6 — the shout. */
const YAY_IN = 486;

// ---------------------------------------------------------------------------
// Layout — page coordinates on 1920 x 1080.
//
// Everything stacks vertically like an editing timeline: picture on top, tracks
// underneath, and now the shout under those. That is the whole spatial idea of
// the scene and it should be obvious at a glance.
// ---------------------------------------------------------------------------

const FILM_W = 960;
const FILM_H = 540; // 16:9
const FILM_X = (WIDTH - FILM_W) / 2; // 480
const FILM_Y = 104;
/** Outside the picture area, so the framed object spans y 92..656. */
const FILM_BORDER = 12;

/** The film line carried in from scene 4 — same construction, same pitch. */
const TRACK_X = 300;
const TRACK_W = 1320;
const PIC_TRACK_Y = 686;
const PIC_TRACK_H = 58;
const AUD_TRACK_Y = 772;
const AUD_TRACK_H = 66;

const TOOL_W = 168;
const TOOL_H = 70;
/** The tool rides the audio track's own centre line. */
const TOOL_Y = AUD_TRACK_Y + AUD_TRACK_H / 2;

/**
 * The applause, after the director's note.
 *
 * Each pair is rotated inward about its own WRIST, which is also what keeps it
 * inside the frame: an upright pair of hands is 1.59x its content width tall in
 * the closed pose and ran off both the frame edge and the tracks. Turned to
 * point at each other they lie along the bottom band instead, and the gap
 * between their fingertips is where `Yay!!` sits.
 */
const CLAP_W = 250;
const CLAP_ROT = 60;
const CLAP_WRIST_Y = 1100;
const CLAP_LEFT_X = 155;
const CLAP_RIGHT_X = WIDTH - 155;
/** Odd and non-dividing, so the two pairs are never in unison. */
const CLAP_PERIOD_LEFT = 7;
const CLAP_PERIOD_RIGHT = 9;

/**
 * **`Adding sound.` as of 2026-09-02**, from `Let's add sound.`
 *
 * Same note as the intertitle. `Let's add sound.` is a proposal — it invites
 * the audience to agree to something before it happens. By this frame the tool
 * is already on screen laying the band, so the film is narrating what is
 * happening rather than suggesting it, and the present participle is what says
 * so. It also pairs with the card: `A silent film.` then `Adding sound.` —
 * two statements, a problem and its fix, neither asking anything.
 */
const CUE: Word[] = [
  { text: "Adding", color: COLORS.ink },
  { text: "sound.", color: COLORS.ink },
];
const CUE_SIZE = 84;
const CUE_GAP = 22;

const YAY: Word = { text: "Yay!!", color: COLORS.ink };
const YAY_SIZE = 102;
/** Below the audio track, off the picture entirely — director note 4. */
const YAY_TOP = 854;

// ---------------------------------------------------------------------------
// The picture, the timeline strips, and the scrubber.
// ---------------------------------------------------------------------------

/**
 * One strip of the timeline, built exactly as `SceneFour.tsx` builds it —
 * same sprocket pitch, same sprocket size, same division pitch — so the picture
 * track here reads as the object carried in from scene 4 rather than a
 * lookalike.
 *
 * `torn-swatch-01`'s content is 1849x516, an aspect of 3.58:1, and a timeline
 * band is roughly 21:1. There is no swatch on disk that yields that, so the
 * swatch is given an explicit width and height — non-uniform, which
 * `placeByContent` will not do — inside an `overflow: hidden` box that reveals
 * it left to right. This departs from the kit's "nothing is ever stretched"
 * rule; scene 4 established the departure first and this file matches it rather
 * than inventing a second treatment of the same object.
 */
const TimelineStrip: React.FC<{
  name: string;
  left: number;
  top: number;
  height: number;
  fullWidth: number;
  currentWidth: number;
  tint: "paper" | "green";
  divisions: boolean;
  children?: React.ReactNode;
}> = ({
  name,
  left,
  top,
  height,
  fullWidth,
  currentWidth,
  tint,
  divisions,
  children,
}) => {
  if (currentWidth <= 0) return null;

  // The swatch's opaque paper only occupies part of the stretched strip (see
  // PAPER_L / PAPER_R below). Sprockets and divisions are laid inside that, not
  // across the box — drawn from x=0 they float off both torn ends in mid air.
  const g = GEOMETRY["texture/torn-swatch-01.png"];
  const paperL = (g.content[0] / g.box[0]) * fullWidth;
  const paperR = ((g.content[0] + g.content[2]) / g.box[0]) * fullWidth;

  const sprocketPitch = 30;
  const sprocketW = 13;
  const sprocketH = 6;
  const sprocketFirst = paperL + 10;
  const sprocketLast = paperR - 10 - sprocketW;
  const sprocketCount = Math.ceil((sprocketLast - sprocketFirst) / sprocketPitch);
  const divisionPitch = 58;
  const divisionFirst = paperL + 16;
  const divisionCount = Math.ceil((paperR - 16 - divisionFirst) / divisionPitch);

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
      <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
        <PaperPiece
          name={name}
          src="texture/torn-swatch-01.png"
          tint={tint}
          style={{ left: 0, top: 0, width: fullWidth, height }}
        />

        {Array.from({ length: sprocketCount }, (_, i) => {
          const x = sprocketFirst + i * sprocketPitch;
          if (x >= currentWidth || x > sprocketLast) return null;
          return (
            <div key={`sprocket-${i}`}>
              <div
                style={{
                  position: "absolute",
                  left: x,
                  top: 7,
                  width: sprocketW,
                  height: sprocketH,
                  backgroundColor: COLORS.ink,
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
                  backgroundColor: COLORS.ink,
                  opacity: 0.78,
                }}
              />
            </div>
          );
        })}

        {divisions
          ? Array.from({ length: divisionCount }, (_, i) => {
              const x = divisionFirst + (i + 1) * divisionPitch;
              if (x >= currentWidth || x > paperR - 16) return null;
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

        {children}
      </div>
    </div>
  );
};

/**
 * The scrubber — director note 1, *"make a timeline too so show that this is a
 * preview of film."*
 *
 * Driven by the SAME playhead the picture is, so it is not decoration: it
 * advances while the film plays, stops on the frame the film freezes, and snaps
 * back to the head when the film restarts. That is what makes the rectangle
 * above read as a preview being played rather than a picture hanging on a wall.
 */
const Scrubber: React.FC<{ playhead: number }> = ({ playhead }) => {
  const p = Math.min(1, Math.max(0, playhead / PREVIEW_TRACK_FRAMES));
  const x = TRACK_X + p * TRACK_W;

  return (
    <>
      {/* The part that has played. */}
      <div
        style={{
          position: "absolute",
          left: TRACK_X,
          top: PIC_TRACK_Y,
          width: p * TRACK_W,
          height: PIC_TRACK_H,
          backgroundColor: COLORS.ink,
          opacity: 0.12,
        }}
      />
      {/* The head itself, with a cut-paper cap so it reads as a handle. */}
      <div
        style={{
          position: "absolute",
          left: x - 2,
          top: PIC_TRACK_Y - 14,
          width: 4,
          height: PIC_TRACK_H + 28,
          backgroundColor: COLORS.ink,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: x - 11,
          top: PIC_TRACK_Y - 24,
          width: 22,
          height: 14,
          backgroundColor: COLORS.ink,
        }}
      />
    </>
  );
};

/**
 * The music sheet on the green band.
 *
 * Third treatment of this band, and back to what the plan originally specified:
 * *"a thin horizontal stave rule with small noteheads and short speech-pattern
 * marks."* Build one used that; build two replaced it with a symmetric audio
 * waveform on the director's note that the sound layer needed a stronger
 * signifier; build three is the director asking for the music-sheet reference
 * back — so this is a real five-line stave with noteheads at varying pitch,
 * stems, beams, and speech dashes between them, on the taller 66px band.
 *
 * Pitches, kinds and spacing come from `seeded()`, never `Math.random()` —
 * Remotion renders frames out of order and in parallel, so anything else
 * strobes. They are laid out across the FULL band width and revealed by the
 * strip's own clip, which is what makes them appear as the tool passes them
 * rather than all at once.
 */
const STAVE_PITCH = 9;
const STEM_H = 18;

/**
 * Where the torn paper's VISIBLE edges fall inside a `TRACK_W`-wide strip.
 *
 * The strip stretches `torn-swatch-01`'s whole 1983px file to `TRACK_W`, and
 * that file carries transparent padding: its content starts 71px in and ends at
 * 1920. Scaled, the paper only occupies x 47..1278 of the 1320 box. Drawing the
 * stave from x=10 left rules hanging off the left of the band in mid air, and
 * running the tool to x=1320 walked it 42px past the paper it was supposed to
 * be laying. Everything drawn on or driven by this band is bounded by these two
 * numbers instead of by the box.
 */
const SWATCH = GEOMETRY["texture/torn-swatch-01.png"];
const PAPER_L = (SWATCH.content[0] / SWATCH.box[0]) * TRACK_W;
const PAPER_R =
  ((SWATCH.content[0] + SWATCH.content[2]) / SWATCH.box[0]) * TRACK_W;

const SHEET_MARKS = (() => {
  const marks: {
    x: number;
    step: number;
    kind: number;
    len: number;
    beam: boolean;
  }[] = [];
  let x = PAPER_L + 16;
  for (let i = 0; x < PAPER_R - 34; i++) {
    const kind = seeded(i * 5 + 71) < 0.68 ? 0 : 1; // 0 notehead, 1 speech dash
    // -3..3 half-steps off the middle rule, so notes sit on lines and spaces.
    const step = Math.round(seeded(i * 13 + 3) * 6) - 3;
    const len = kind === 0 ? 12 : 7 + Math.round(seeded(i * 3 + 11) * 22);
    const beam = kind === 0 && seeded(i * 17 + 41) < 0.4;
    marks.push({ x, step, kind, len, beam });
    x += len + 12 + Math.round(seeded(i * 7 + 29) * 20);
  }
  return marks;
})();

const MusicSheet: React.FC = () => {
  const mid = AUD_TRACK_H / 2;

  return (
    <>
      {[-2, -1, 0, 1, 2].map((k) => (
        <div
          key={`stave-${k}`}
          style={{
            position: "absolute",
            left: PAPER_L + 8,
            top: mid + k * STAVE_PITCH,
            width: PAPER_R - PAPER_L - 16,
            height: 1.6,
            backgroundColor: COLORS.ink,
            opacity: 0.38,
          }}
        />
      ))}

      {SHEET_MARKS.map((m, i) => {
        if (m.kind === 1) {
          return (
            <div
              key={`dash-${i}`}
              style={{
                position: "absolute",
                left: m.x,
                top: mid - 2,
                width: m.len,
                height: 4,
                backgroundColor: COLORS.ink,
                opacity: 0.55,
              }}
            />
          );
        }

        const y = mid + m.step * (STAVE_PITCH / 2);
        return (
          <div key={`note-${i}`}>
            <div
              style={{
                position: "absolute",
                left: m.x,
                top: y - 4.75,
                width: 12,
                height: 9.5,
                borderRadius: "50%",
                backgroundColor: COLORS.ink,
                rotate: "-18deg",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: m.x + 9.6,
                top: y - STEM_H,
                width: 2.6,
                height: STEM_H,
                backgroundColor: COLORS.ink,
              }}
            />
            {m.beam ? (
              <div
                style={{
                  position: "absolute",
                  left: m.x + 9.6,
                  top: y - STEM_H,
                  width: 22,
                  height: 4,
                  backgroundColor: COLORS.ink,
                }}
              />
            ) : null}
          </div>
        );
      })}
    </>
  );
};

/**
 * The picture and the picture track, as one object.
 *
 * Rendered TWICE by the scene — once in colour and once behind a `grayscale`
 * filter — so the wash can be swept across both as a single left-to-right
 * movement by clipping the grey copy. A uniform `saturate()` ramp would drain
 * them evenly and there would be no sweep, which is the half of the beat that
 * says the picture and the track are one thing.
 */
/**
 * The preview UI — a badge on the picture and a label on each lane.
 *
 * **Added 2026-09-02, and it is the setup the gag was missing.** The director's
 * note on this scene was that the joke does not land *"since we never said
 * sound was missing in the first place, or that we are previewing the frame"*.
 * Both of those were true of the build: the rectangle in the middle was a
 * playing picture with a scrubber under it, which reads as a preview only if
 * you already know that is what you are looking at, and the empty space where
 * the audio track would go was simply empty space.
 *
 * So the scene now says both, in the language it is already speaking — this is
 * an editing timeline, and editing timelines label their lanes:
 *
 * - **`Preview`**, a bordered badge inside the top left of the picture. It is
 *   set in the film's own face but styled as a chip rather than as speech, the
 *   same way the `<tts>` tool is, so it does not read as one of the film's
 *   lines.
 * - **`Picture` and `Sound`**, in the gutter left of the two lanes. They exist
 *   as a PAIR — one lane full and running, one lane named and conspicuously
 *   empty. That contrast is the whole setup, and neither label does the job on
 *   its own.
 * - **The empty lane's outline**, so `Sound` has something visibly hollow to
 *   label rather than floating beside bare paper.
 *
 * All of it lives inside `PictureGroup`, which the scene draws twice — once in
 * colour and once drained behind the wash — so the UI greys out with the
 * picture instead of sitting on top of the beat untouched.
 */
const LANE_LABEL_SIZE = 32;

const LaneLabel: React.FC<{ text: string; top: number; height: number }> = ({
  text,
  top,
  height,
}) => (
  <div
    style={{
      position: "absolute",
      left: 0,
      top,
      width: TRACK_X - 18,
      height,
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-end",
      fontFamily: display,
      fontSize: LANE_LABEL_SIZE,
      lineHeight: 1,
      letterSpacing: 0.5,
      color: COLORS.ink,
      opacity: 0.55,
    }}
  >
    {text}
  </div>
);

const PreviewBadge: React.FC = () => (
  <div
    style={{
      position: "absolute",
      left: FILM_X + 22,
      top: FILM_Y + 22,
      padding: "9px 20px 11px",
      backgroundColor: COLORS.paper,
      border: `4px solid ${COLORS.ink}`,
      borderRadius: 10,
      fontFamily: display,
      fontSize: 30,
      lineHeight: 1,
      letterSpacing: 0.5,
      color: COLORS.ink,
    }}
  >
    Preview
  </div>
);

const PictureGroup: React.FC<{ playhead: number }> = ({ playhead }) => (
  <>
    <div
      style={{
        position: "absolute",
        left: FILM_X - FILM_BORDER,
        top: FILM_Y - FILM_BORDER,
        width: FILM_W + FILM_BORDER * 2,
        height: FILM_H + FILM_BORDER * 2,
        backgroundColor: COLORS.ink,
        filter: "drop-shadow(16px 18px 0 rgba(20, 18, 15, 0.2))",
      }}
    />
    <div
      style={{
        position: "absolute",
        left: FILM_X,
        top: FILM_Y,
        width: FILM_W,
        height: FILM_H,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: WIDTH,
          height: HEIGHT,
          transform: `scale(${FILM_W / WIDTH})`,
          transformOrigin: "top left",
        }}
      >
        {/* Read-only. `SceneOne.tsx` is not modified by this scene. */}
        <Freeze frame={playhead}>
          <SceneOne />
        </Freeze>
      </div>
    </div>

    <PreviewBadge />

    <TimelineStrip
      name="Picture track"
      left={TRACK_X}
      top={PIC_TRACK_Y}
      height={PIC_TRACK_H}
      fullWidth={TRACK_W}
      currentWidth={TRACK_W}
      tint="paper"
      divisions
    />
    <Scrubber playhead={playhead} />

    {/* The empty lane, drawn UNDER where the green band will be laid. It is
        never removed — the band simply grows over it, so the outline reads as
        the slot being filled rather than as a thing that disappeared. */}
    <div
      style={{
        position: "absolute",
        left: TRACK_X,
        top: AUD_TRACK_Y,
        width: TRACK_W,
        height: AUD_TRACK_H,
        border: `3px dashed ${COLORS.ink}`,
        opacity: 0.22,
        boxSizing: "border-box",
      }}
    />

    <LaneLabel text="Picture" top={PIC_TRACK_Y} height={PIC_TRACK_H} />
    <LaneLabel text="Sound" top={AUD_TRACK_Y} height={AUD_TRACK_H} />
  </>
);

// ---------------------------------------------------------------------------
// Beat 3 — the intertitle.
// ---------------------------------------------------------------------------

/** A rule flourish: a diamond with a short dash either side, centred on a rule. */
const Ornament: React.FC<{ top: number }> = ({ top }) => (
  <div
    style={{
      position: "absolute",
      left: 0,
      top,
      width: "100%",
      height: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 14,
    }}
  >
    <div style={{ width: 46, height: 5, backgroundColor: COLORS.paper }} />
    <div
      style={{
        width: 24,
        height: 24,
        backgroundColor: COLORS.paper,
        rotate: "45deg",
      }}
    />
    <div style={{ width: 46, height: 5, backgroundColor: COLORS.paper }} />
  </div>
);

/**
 * The silent-era card. **Full frame** — director note 2, *"i need the placard
 * to cover it all."* The first build floated a 1180x620 card on the page, which
 * left the picture and the tracks visible around it and read as a caption laid
 * over the film rather than as the film stopping to say something.
 *
 * The one place in the film where type is not set in the film's own face, and a
 * deliberate style break in a film that is otherwise strict — the break is what
 * makes the gag land. It cuts in and out on one frame each: no fade, no scale,
 * nothing eased, because that hardness is what reads as an intertitle rather
 * than a caption.
 *
 * ---
 * **The card reads `Is this a silent film?` — a rhetorical question, arrived at
 * on the second attempt.**
 *
 * It has been three things in one day and the middle one is the instructive
 * one. It began as `Are we still in the silent era?`, became `A silent film.`,
 * and is now a question again — **but not the same question, and not for the
 * same reason it failed the first time.**
 *
 *   > *"in scene 5 again the gag is not delivered since we never said sound was
 *   > missing in the first place, or that we are previewing the frame ... so we
 *   > will have to say preview, then rather than the rhetorical question of
 *   > silent era, we will have to say silent film and adding sound, something
 *   > like this ... to the UI"*
 *
 * **Why the first question failed:** it asked the audience to notice an absence
 * the film had never pointed at. Nothing on screen up to that frame had said
 * the picture was a preview, and nothing had said it had no sound, so it landed
 * as a non-sequitur. **The setup was missing, not the line.** That setup now
 * exists upstream and is the real fix: the `Preview` badge on the picture, and
 * the pair of lane labels with `Sound` sitting over a visibly EMPTY lane.
 *
 * **Why the statement then failed too**, on the director's note the same day:
 *
 *   > *"and the gag ... 'is this a silent film?' — this is a rhetorical
 *   > question rather than a statement, since we never explain why we grey out
 *   > and stop."*
 *
 * `A silent film.` is a label, and a label has nothing to say about the two
 * strangest things that just happened on screen — **the picture stopped dead
 * and the colour drained out of it, and the film never explains either.** A
 * statement walks past that. A question is the film noticing it, which is the
 * only thing that makes the pause and the wash read as deliberate rather than
 * as a glitch.
 *
 * So the form came back and the content did not. `Are we still in the silent
 * era?` was a joke about film history that the film had not set up; `Is this a
 * silent film?` is a question about the thing the audience is looking at, asked
 * over a labelled empty sound lane. Same punctuation, different question.
 *
 * One line rather than two, because it is short enough to be one and an
 * intertitle broken over two lines for no reason reads as a caption again.
 */
const SilentCard: React.FC<{ f: number }> = ({ f }) => {
  // Period film stock never sat still. Stepped on twos with everything else, so
  // it is a texture rather than a strobe.
  const flicker = 0.94 + 0.06 * seeded(f);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.ink }}>
      <AbsoluteFill style={{ opacity: flicker }}>
      {/* Double rule: a thick outer line and a thin inner one. */}
      <div
        style={{
          position: "absolute",
          inset: 66,
          border: `7px solid ${COLORS.paper}`,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 90,
          border: `2px solid ${COLORS.paper}`,
        }}
      />
      <Ornament top={69} />
      <Ornament top={HEIGHT - 69} />

      <div
        style={{
          position: "absolute",
          inset: 90,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: cardFace,
          fontSize: 132,
          lineHeight: 1.4,
          color: COLORS.paper,
          textAlign: "center",
        }}
      >
        <div>Is this a silent film?</div>
      </div>
      </AbsoluteFill>

      {/* Corners darker than the centre. */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(0,0,0,0) 34%, rgba(0,0,0,0.66) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Beat 4 — the tool.
// ---------------------------------------------------------------------------

/**
 * Not one of the three agent marks — those are real companies. This is a tool,
 * so it is a plain coded glyph: no paper, no backing square, no torn edge. It
 * is a machine passing through, and it does not stay.
 *
 * **A letter mark, not a picture** — director note, 2026-09-02: *"this icon
 * still never clicks as tts.. so can we add a letter mark instead of this
 * random icon? like &lt;tts&gt; ... just for cleanliness and clarity."*
 *
 * Three drawn glyphs were tried and all three failed the same way: a music note
 * said "music", a stock speaker said "volume", and a text-lines-plus-waves mark
 * had to be decoded before it said anything. None of them survive being seen
 * for two seconds at expo distance. The name does, so the tool is now its own
 * name: `<tts>` set in the film's own display face inside a cut token.
 *
 * The angle brackets do real work. They make it a tag rather than a word, which
 * is what keeps it reading as a machine in a frame full of torn paper — and the
 * token is cleanly cut with a coded fill, never paper, per storyboard rule 1.
 */
const AudioTool: React.FC<{ x: number }> = ({ x }) => (
  <div
    style={{
      position: "absolute",
      // The tape ends where the machine begins: the token's leading half sits
      // ahead of the green, overlapping its edge by a little so the two read as
      // one moving object rather than a label floating beside a band.
      left: x - TOOL_H / 2,
      top: TOOL_Y - TOOL_H / 2,
      width: TOOL_W,
      height: TOOL_H,
      boxSizing: "border-box",
      borderRadius: 12,
      backgroundColor: COLORS.paper,
      border: `5px solid ${COLORS.ink}`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: display,
      fontSize: 38,
      lineHeight: 1,
      letterSpacing: 0.5,
      color: COLORS.ink,
      filter: "drop-shadow(7px 8px 0 rgba(20, 18, 15, 0.2))",
    }}
  >
    {"<tts>"}
  </div>
);

// ---------------------------------------------------------------------------
// Beat 5 — the applause.
// ---------------------------------------------------------------------------

type ClapPose = "hands/clap-open.png" | "hands/clap-closed.png";
const CLAP_POSES: readonly ClapPose[] = [
  "hands/clap-open.png",
  "hands/clap-closed.png",
];

const ClapPair: React.FC<{
  f: number;
  name: string;
  wristX: number;
  rotate: number;
  period: number;
  mirror: boolean;
  /** The left pair arrives first. */
  delay: number;
}> = ({ f, name, wristX, rotate, period, mirror, delay }) => {
  if (f < CLAP_IN + delay) return null;

  const rise = 1 - ramp(f, CLAP_IN + delay, CLAP_LANDED + delay, EASE_OUT);
  const pose = CLAP_POSES[Math.floor((f - CLAP_IN) / period) % 2];

  /**
   * Each pose is placed by its OWN content box, pinned at the wrist end — the
   * two do not share an anchor (the measured note in `Paper.tsx`: the closed
   * pose is 811x1292 content and the open one 1098x1097, so the closed pair is
   * ~1.6x as tall and much narrower). A same-box swap is what would jump.
   */
  const g = GEOMETRY[pose];
  const [cx, cy, cw, ch] = g.content;
  const scale = CLAP_W / cw;
  const contentH = ch * scale;

  /**
   * The wrist: the content box's bottom centre, in element pixels. Rotating
   * about it is what makes the hand swing inward from a fixed point instead of
   * orbiting its own file box — and because the origin sits on the content's
   * horizontal centre, `scaleX(-1)` mirrors the paper in place, so the
   * content-vs-file-box offset never has to be corrected out.
   */
  const originX = (cx + cw / 2) * scale;
  const originY = (cy + ch) * scale;

  return (
    <PaperPiece
      name={name}
      src={pose}
      shadow={{ x: 12, y: 14, opacity: 0.2 }}
      style={{
        ...placeByContent(pose, {
          left: wristX - CLAP_W / 2,
          top: CLAP_WRIST_Y - contentH,
          width: CLAP_W,
        }),
        // Individual `translate` applies before `transform`, so the slide-up
        // happens in unrotated screen space and the hands still enter straight
        // from below.
        translate: `0px ${rise * 260}px`,
        transformOrigin: `${originX}px ${originY}px`,
        transform: `rotate(${rotate}deg)${mirror ? " scaleX(-1)" : ""}`,
      }}
    />
  );
};

// ---------------------------------------------------------------------------

export const SceneFive: React.FC = () => {
  // Paper steps. Everything below derives from `f` — see theme.ts `onTwos`.
  const f = onTwos(useCurrentFrame());

  /**
   * The playhead the picture is held at. Plays, freezes, plays again — the
   * whole structural idea of the scene, and the reason it needs no plate.
   */
  const playhead =
    f < FILM_IN
      ? 0
      : f < PAUSE_AT
        ? f - FILM_IN
        : f < RESUME_AT
          ? PAUSE_AT_LOCAL
          : f - RESUME_AT;

  // The wash. Swept on from the left as the picture freezes, swept off from the
  // left again as the track completes — so the colour comes back following the
  // direction the sound was laid in.
  const washIn = ramp(f, WASH_IN_START, WASH_IN_END, EASE_OUT);
  const washOut = ramp(f, WASH_OUT_START, WASH_OUT_END, EASE_OUT);
  const greyClip = `inset(0px ${WIDTH - washIn * WIDTH}px 0px ${washOut * WIDTH}px)`;

  // The tool, and the green band it is laying. The band is drawn to the tool's
  // own x and no further — the tool is making it, and that only reads if the
  // paper never runs ahead of the glyph.
  // Travel runs between the torn paper's own visible edges, not the strip box —
  // see PAPER_L / PAPER_R — so the glyph sits exactly on the growing edge for
  // the whole beat instead of leading it at the start and overrunning it at the
  // end.
  const toolX =
    f < TOOL_IN
      ? TRACK_X + PAPER_L - (1 - ramp(f, TOOL_ENTER, TOOL_IN, EASE_OUT)) * 480
      : f < TOOL_TRAVEL_END
        ? TRACK_X +
          PAPER_L +
          ramp(f, TOOL_IN, TOOL_TRAVEL_END, Easing.linear) * (PAPER_R - PAPER_L)
        : TRACK_X +
          PAPER_R +
          ramp(f, TOOL_TRAVEL_END, TOOL_EXIT_END, EASE_IN) * 460;
  const greenW = Math.max(0, Math.min(TRACK_W, toolX - TRACK_X));
  const toolVisible = f >= TOOL_ENTER && f < TOOL_EXIT_END;

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

      {/* The picture and its track, in colour. */}
      <AbsoluteFill>
        <PictureGroup playhead={playhead} />
      </AbsoluteFill>

      {/* The same object drained, clipped to the sweep. Both copies read the
          same playhead, so the frozen frame is identical under the wash. */}
      <AbsoluteFill
        style={{
          clipPath: greyClip,
          filter: "grayscale(1) contrast(0.9) brightness(1.05)",
        }}
      >
        <PictureGroup playhead={playhead} />
        <div
          style={{
            position: "absolute",
            left: FILM_X,
            top: FILM_Y,
            width: FILM_W,
            height: FILM_H,
            backgroundColor: COLORS.halftone,
            opacity: 0.34,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: TRACK_X,
            top: PIC_TRACK_Y,
            width: TRACK_W,
            height: PIC_TRACK_H,
            backgroundColor: COLORS.halftone,
            opacity: 0.34,
          }}
        />
      </AbsoluteFill>

      {/* The audio track. Does not exist until the tool lays it. */}
      <TimelineStrip
        name="Audio track"
        left={TRACK_X}
        top={AUD_TRACK_Y}
        height={AUD_TRACK_H}
        fullWidth={TRACK_W}
        currentWidth={greenW}
        tint="green"
        divisions={false}
      >
        <MusicSheet />
      </TimelineStrip>

      {toolVisible ? <AudioTool x={toolX} /> : null}

      {/* Turned to face each other, and small enough to stay inside the frame
          — director note 4. The gap between their fingertips is where the
          shout goes. */}
      <ClapPair
        f={f}
        name="Clapping hands, left"
        wristX={CLAP_LEFT_X}
        rotate={CLAP_ROT}
        period={CLAP_PERIOD_LEFT}
        mirror
        delay={0}
      />
      <ClapPair
        f={f}
        name="Clapping hands, right"
        wristX={CLAP_RIGHT_X}
        rotate={-CLAP_ROT}
        period={CLAP_PERIOD_RIGHT}
        mirror={false}
        delay={6}
      />

      {/* The line cue. Pops in as the tool arrives, leaves as it finishes, and
          is gone well before the shout takes the same slot. */}
      {f >= CUE_IN && f < CUE_OUT_END ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: YAY_TOP,
            width: WIDTH,
            display: "flex",
            justifyContent: "center",
            gap: CUE_GAP,
            opacity: 1 - ramp(f, CUE_OUT_START, CUE_OUT_END, EASE_IN),
          }}
        >
          {CUE.map((w, i) => (
            <PoppedWord
              key={w.text}
              word={w}
              index={i}
              frame={f}
              appearFrame={CUE_IN}
              stagger={3}
              fontFamily={display}
              fontSize={CUE_SIZE}
              settlePeriod={18}
            />
          ))}
        </div>
      ) : null}

      {/* A shout, not a sentence. Off the picture, under the sound layer,
          between the hands — director note 4. */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: YAY_TOP,
          width: WIDTH,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <PoppedWord
          word={YAY}
          index={0}
          frame={f}
          appearFrame={YAY_IN}
          fontFamily={display}
          fontSize={YAY_SIZE}
          settlePeriod={16}
        />
      </div>

      {/* Cuts in hard on one frame and out just as hard, and covers the whole
          frame — director note 2. Rendered last so nothing sits over it. */}
      {f >= CARD_IN && f < CARD_OUT ? <SilentCard f={f} /> : null}
    </AbsoluteFill>
  );
};
