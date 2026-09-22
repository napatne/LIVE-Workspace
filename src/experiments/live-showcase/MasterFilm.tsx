import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { Freeze, Sequence } from "remotion";
import { SceneOne } from "./SceneOne";
import { SceneTwo } from "./SceneTwo";
import { SceneThree } from "./SceneThree";
import { SceneFour, SCENE_FOUR_DURATION } from "./SceneFour";
import { SceneFive, SCENE_FIVE_DURATION } from "./SceneFive";
import { SceneSix, SCENE_SIX_DURATION } from "./SceneSix";
import {
  LIVE_SCENE_ONE,
  LIVE_SCENE_THREE,
  LIVE_SCENE_TWO,
  LIVE_SLAM,
} from "./StyleTest";
import { paperBreath } from "./transitions/paperBreath";
import { slateSlam } from "./transitions/slateSlam";

/**
 * The LIVE showcase, end to end — `LiveShowcaseFilm`.
 *
 * Six scenes, five joins. Every scene composition stays registered on its own in
 * `Root.tsx` so it can still be reviewed and re-rendered alone; this is the
 * delivery composition.
 *
 * ---
 * ## Rebuilt 2026-09-02 after the first master pass
 *
 * The director watched the whole film for the first time and the note was:
 * *"the scenes are not cohesive, the stitches are jumpy and there are overcuts.
 * the transition scenes are choppy and overlap on many other scenes. plus the
 * slaps again and again is irritating — we need the clap only when the second
 * scene starts, that is on the join of the first and second scenes, and at the
 * end when we join the 5th and 6th scenes. Elegantly."*
 *
 * Three separate faults, and the first two turned out to be the same bug.
 *
 * ### 1. The joins were eating the scenes alive
 *
 * A `TransitionSeries` transition does not insert time between its neighbours —
 * it **overlaps** them, consuming its own length off the tail of the outgoing
 * scene *and* off the head of the incoming one. At `LIVE_SLAM` = 88 that is 88
 * frames of scene lost on each side of every join, and `slateSlam` additionally
 * hard-swaps the two scenes at its own frame 21, so the outgoing scene's last
 * ~67 frames are not merely blurred, they are never rendered.
 *
 * Measured against each scene's own last beat, the first master pass was
 * discarding this:
 *
 * | Scene | Last beat | Last frame the master showed | Lost |
 * | --- | --- | --- | --- |
 * | 1 · the ask | hand stamps f62, settles ~f84 | f47 | **the stamp** |
 * | 2 · the team | Sparky full at f144 | f113 | **Sparky, entirely** |
 * |  | *(that scene is gone — see the note below the table)* | | |
 * | 3 · storyboard | ink lines drawn f144-174 | f128 | **all three ink lines** |
 * | 4 · stitching | stitch lands f470 | f453 | the landing |
 * | 5 · silent era | applause f466-488, `Yay!!` f486 | f455 | **the payoff** |
 *
 * And on the incoming side the first 72 frames of every scene came up under
 * blur and frost: scene 2's title (f36) and all three agent marks (f68/82/96),
 * scene 3's hand and its line, scene 5's picture starting to play (f62), scene
 * 6's `Your turn.` and `LIVE` (f50/62). Every scene was entering already in
 * progress and leaving before it finished, which is exactly what "jumpy" and
 * "overcuts" describe.
 *
 * **The fix is the `holdIn` / `holdOut` columns below.** A join now sits on
 * *frozen* frames rather than on live ones: the outgoing scene plays to its last
 * beat and holds there while the join runs, and the incoming scene holds its
 * first frame until the join is over. Nothing is under a board that the audience
 * has not already seen or is not about to see. It also happens to be what a real
 * clapper is — the film stops, the slate claps, the film starts.
 *
 * ### 2. Five claps is not punctuation
 *
 * The board is now used **twice**, at the two structural hinges the director
 * named: **1 → 2**, where the person's ask becomes a crew, and **5 → 6**, where
 * the film is finished and hands off to the audience. The three joins in between
 * are `paperBreath` — the same rack-and-frost material with the board and the
 * confetti removed, 24 frames instead of 88, cross-dissolving rather than
 * swapping. One vocabulary, two volumes; see `transitions/paperBreath.tsx` for
 * why it is a quieter version of the slam rather than a different idea.
 *
 * ### 3. The length is not a constraint any more
 *
 * The six scenes sum to 1981f on their own. **The old master only ever fit the
 * 50-60s band because its five joins were destroying 440 frames of them** — that
 * length was never real, it was scenes being eaten. Giving those frames back put
 * the film near 70s, and the first repair pass then clawed it down to 58s by
 * trimming, including 200 frames off scene 6's end card.
 *
 * The director lifted the ceiling the same day — *"timing is not an issue, it
 * can afford 60-70s"* — and the scene 6 cut was reverted, because it had been
 * made to satisfy an arithmetic target rather than to improve the edit.
 *
 * ---
 * ## Amended 2026-09-02 — scene 2 was rebuilt underneath this table
 *
 * The table above is a record of the FIRST master pass and its beat columns for
 * scene 2 describe a scene that no longer exists: it was 180 frames of three
 * branded marks and a Sparky fade, and it is now 330 frames in which the marks
 * fuse into the film's generic `Ai` disc and that disc becomes the face of the
 * `and you` meme. The diagnosis it records is still exactly right and is why
 * this file is built the way it is — it is left standing as history, not as a
 * description of the current cut.
 *
 * The film measured **2131f / 71.0s** with the rebuilt scene 2 in it, against a
 * 60-70s band — about a second over it. **It is 2101f / 70.0s as of
 * 2026-09-03**, when scene 2's pre-fusion hold lost 30 frames on a note about
 * the marks bobbing twice. That trim was made for the bounce, not for the
 * number; landing on the band's ceiling is a coincidence, not an achievement,
 * and the paragraphs below still stand.
 *
 * All of that second was scene 3, which gained a line the film cannot do
 * without: it is silent, and the director's instruction was that it therefore
 * has to say what is happening in words. Scenes 4 and 5 were rebuilt in the
 * same round and both came out at exactly the length they went in at.
 *
 * **Nothing has been cut to get back under 70**, because the band is a comfort
 * and the standing instruction is not to cut a shot to hit a number. If the
 * director wants it under, the two honest places are scene 5's intertitle hold
 * and scene 4's tail after the stitch lands; both are the director's call, and the two longest static stretches remain
 * the honest place to look: scene 4's three-shimmer block and scene 5's
 * full-frame intertitle hold.
 *
 * **So do not trim anything here to hit a number.** Every `head` and `tail`
 * below now earns its place editorially: it either gives a join clean ground to
 * land on, or removes screen time where genuinely nothing moves. If a future
 * pass wants the film shorter, the honest place is *inside* a scene — scene 4's
 * three-shimmer block and scene 5's full-frame intertitle hold are the two
 * longest static stretches — and that is the director's call, not an agent's.
 */

/* ----------------------------------------------------------------- the joins */

/** The quiet join's length. A breath, not a beat — see `paperBreath.tsx`. */
export const LIVE_BREATH = 24;

type Join =
  | { kind: "slam"; slug: string }
  | { kind: "breath" };

/**
 * One entry per gap between scenes, so `JOINS.length` is always `SCENES.length - 1`.
 *
 * **Scene 1 has no opening join.** Nothing precedes it, so the film opens on the
 * page rather than on a slate.
 *
 * The take numbers used to run 1 → 4 → 32 → 12 → 1 across five boards — a joke
 * about the shoot getting harder and then landing the finale first time. Three
 * of those boards are gone, and a two-beat version of that gag would be
 * arbitrary, so the opening board reads TAKE 1.
 *
 * **The closing board does not, as of 2026-09-02** — *"the last clapper needs
 * to say end scene 6, film end."* A slate that reads TAKE 1 on the way out is
 * announcing a take about to be shot, which is exactly backwards at the point
 * the film is handing over to the audience. `END SCENE 6 · FILM END · LIVE`
 * keeps the three-token shape the audience learned from the opening board and
 * uses both slots to say the same thing twice, which is what a clapper does at
 * the end of a shoot.
 *
 * It is four characters longer than the opening slug and the slug has about
 * half a second to be read. If it does not read at speed, `script.md`'s
 * standing note applies: shorten the slug rather than shrink the type — and
 * `END SCENE 6 · FILM END` without the trailing token is the obvious cut, since
 * the board already has LIVE printed on it.
 */
const JOINS: Join[] = [
  { kind: "slam", slug: "SCENE 2 · TAKE 1 · LIVE" }, // 1 → 2
  { kind: "breath" }, // 2 → 3
  { kind: "breath" }, // 3 → 4
  { kind: "breath" }, // 4 → 5
  { kind: "slam", slug: "END SCENE 6 · FILM END · LIVE" }, // 5 → 6
];

const joinLength = (j: Join) =>
  j.kind === "slam" ? LIVE_SLAM : LIVE_BREATH;

/* ---------------------------------------------------------------- the scenes */

/**
 * One row per scene, and **this table is where the film gets re-timed.**
 *
 * Four knobs, all master-side. **None of them edits a scene file** — a scene
 * cut to fit the master stops being reviewable on its own, and three of these
 * were built by separate agents against their own plans.
 *
 * | | |
 * | --- | --- |
 * | `head` | frames of the scene's opening skipped |
 * | `tail` | frames of the scene's ending dropped |
 * | `holdIn` | frames of the scene's **first played frame**, frozen, before it starts |
 * | `holdOut`| frames of the scene's **last played frame**, frozen, after it ends |
 *
 * `head`/`tail` remove dead air. `holdIn`/`holdOut` give the join somewhere to
 * happen that is not on top of a beat — set them to the length of the adjoining
 * join and the join costs the film exactly its own length and buries nothing.
 * That is the whole repair described in the header.
 *
 * Each scene's own first and last beat, so a trim can be checked against
 * something real rather than eyeballed. **No trim below crosses one of these.**
 *
 * | Scene | len | first beat | last beat |
 * | --- | --- | --- | --- |
 * | 1 · the ask | 114 | f3 block | ~f84 hand settled |
 * | 2 · the team | 322 | f18 question | f246 the face lands |
 * | 3 · storyboard | 255 | f2 hand | f186 the storyboard line |
 * | 4 · stitching | 520 | f50 | f470 stitch lands |
 * | 5 · silent era | 522 | f62 film plays | f488 applause lands |
 * | 6 · LIVE card | 450 | f50 line | f150, then a still card |
 */
type SceneSpec = {
  name: string;
  component: React.FC;
  /** The scene's own full length, from its source of truth. */
  duration: number;
  /** Frames to skip off the front. 0 = play from the scene's first frame. */
  head?: number;
  /** Frames to drop off the end. 0 = play to the scene's last frame. */
  tail?: number;
  /** Frozen frames prepended, for an incoming join to land on. */
  holdIn?: number;
  /** Frozen frames appended, for an outgoing join to sit on. */
  holdOut?: number;
};

const SCENES: SceneSpec[] = [
  {
    name: "The ask",
    component: SceneOne,
    duration: LIVE_SCENE_ONE,
    // Ends 4 frames after the hand finishes settling, then holds for the clap.
    tail: 26,
    holdOut: LIVE_SLAM,
  },
  {
    name: "The team",
    component: SceneTwo,
    duration: LIVE_SCENE_TWO,
    /**
     * **Was 24, and 24 became a bug on 2026-09-02.** The scene was rebuilt for
     * the LLM-agnostic revision and its title moved from f36 to f18; a 24-frame
     * head would have started the scene six frames AFTER the question popped,
     * so the film would have opened this scene on a line that was already
     * there. 6 keeps the original intent — the board lifts on an empty page and
     * the title pops twelve frames later — against the beats the scene
     * actually has.
     */
    head: 6,
    holdIn: LIVE_SLAM,
    /**
     * **0, and it must stay 0.** The quiet join dissolves over the last 24
     * frames of what this scene is given, and the scene's payoff — the meme,
     * the fused face and `and you` all up together — is not complete until
     * f246. Every frame trimmed here is taken off the only part of the scene
     * that is worth resting on. There is nothing dead at this end to remove.
     */
    tail: 0,
  },
  {
    name: "The storyboard",
    component: SceneThree,
    duration: LIVE_SCENE_THREE,
    // The hand enters at f2, so the incoming breath needs its own frames.
    holdIn: LIVE_BREATH,
    /**
     * **The ink lines this used to be timed against no longer exist.** The
     * scene was rebuilt on 2026-09-02: the three lines struck from the sheet to
     * the marks are gone, the marks hover on the board instead, and the scene
     * gained a second line — `Build a narrative with your agents.` before
     * `Create your storyboard.` The last beat is now the storyboard line
     * settling around f186 rather than ink finishing at f174, and the scene is
     * 255 frames rather than 195.
     *
     * 4 still holds: the tail is a still frame with three marks drifting on it,
     * the breath has about fifty clear frames after the last word lands, and
     * there is nothing dead here to trim.
     */
    holdOut: 4,
  },
  {
    name: "Stitching",
    component: SceneFour,
    duration: SCENE_FOUR_DURATION,
    head: 26,
    // Plays out. The stitch lands at f470 and sits for 50 frames before the
    // breath starts dissolving over it.
  },
  {
    name: "Silent era",
    component: SceneFive,
    duration: SCENE_FIVE_DURATION,
    head: 30,
    // Plays out. The applause lands f488 and rests to the scene's own end
    // before the board comes in.
    holdOut: LIVE_SLAM,
  },
  {
    name: "The LIVE card",
    component: SceneSix,
    duration: SCENE_SIX_DURATION,
    head: 36,
    holdIn: LIVE_SLAM,
    /**
     * The end card rests ~5.8s after the last agent lands at f150.
     *
     * This was briefly 200 — a cut made purely to get the master under a 60s
     * ceiling, which is the wrong reason to cut anything and was reverted the
     * same day when the director lifted the ceiling to 60-70s. What is left is
     * an editorial trim: the card is still, the QR is up long enough to scan,
     * and the remaining ~3s were the film idling on its own last frame.
     */
    tail: 90,
  },
];

/** The scene's own frames that actually play, before the frozen holds. */
const body = (s: SceneSpec) => s.duration - (s.head ?? 0) - (s.tail ?? 0);

/** What each scene occupies on the master timeline, holds included. */
const played = (s: SceneSpec) => body(s) + (s.holdIn ?? 0) + (s.holdOut ?? 0);

/**
 * Sum of the played scenes, less the frames the joins overlap.
 *
 * Kept as a derived value rather than a literal so that re-timing above updates
 * `Root.tsx` too — the two must never disagree, and hand-syncing them is exactly
 * how a master composition ends up cutting off its own last frame.
 */
export const LIVE_FILM_DURATION =
  SCENES.reduce((total, s) => total + played(s), 0) -
  JOINS.reduce((total, j) => total + joinLength(j), 0);

/**
 * A scene, with its dead air trimmed and its joins given frozen ground to stand
 * on.
 *
 * `Freeze` overrides the frame for everything below it, so the inner `Sequence`
 * — and the scene inside that — genuinely stops rather than being covered up.
 * The negative-capable `from` runs the scene's own clock ahead of the master's
 * so that `head` skips its opening without the scene knowing it was trimmed.
 */
const Held: React.FC<{ spec: SceneSpec }> = ({ spec }) => {
  const Scene = spec.component;
  const head = spec.head ?? 0;
  const holdIn = spec.holdIn ?? 0;
  const holdOut = spec.holdOut ?? 0;
  const lastBodyFrame = holdIn + body(spec) - 1;

  let node = (
    <Sequence from={holdIn - head} durationInFrames={spec.duration}>
      <Scene />
    </Sequence>
  );

  if (holdOut > 0) {
    node = (
      <Freeze frame={lastBodyFrame} active={(f) => f > lastBodyFrame}>
        {node}
      </Freeze>
    );
  }

  if (holdIn > 0) {
    node = (
      <Freeze frame={holdIn} active={(f) => f < holdIn}>
        {node}
      </Freeze>
    );
  }

  return node;
};

export const MasterFilm: React.FC = () => {
  return (
    <TransitionSeries>
      {SCENES.map((scene, i) => {
        const join = JOINS[i];

        return [
          <TransitionSeries.Sequence
            key={`${scene.name}-scene`}
            durationInFrames={played(scene)}
          >
            <Held spec={scene} />
          </TransitionSeries.Sequence>,

          // The two kinds are written out as separate elements rather than as
          // one element with a ternary `presentation`: `TransitionPresentation`
          // is generic over its own props, so a union of two of them has no
          // common instantiation and will not typecheck.
          join?.kind === "slam" ? (
            <TransitionSeries.Transition
              key={`${scene.name}-join`}
              presentation={slateSlam({
                slug: join.slug,
                durationInFrames: LIVE_SLAM,
              })}
              timing={linearTiming({ durationInFrames: LIVE_SLAM })}
            />
          ) : join ? (
            <TransitionSeries.Transition
              key={`${scene.name}-join`}
              presentation={paperBreath()}
              timing={linearTiming({ durationInFrames: LIVE_BREATH })}
            />
          ) : null,
        ];
      })}
    </TransitionSeries>
  );
};
