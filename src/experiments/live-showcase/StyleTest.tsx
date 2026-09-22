import { AbsoluteFill } from "remotion";
import { SceneOne } from "./SceneOne";
import { COLORS } from "./theme";

/**
 * LIVE showcase — Milestone 1 style test.
 *
 * **Built to be judged and thrown away.** It is not a deliverable; it exists so
 * three decisions every later scene inherits can be made now, at the cost of
 * one composition rather than five rebuilt scenes:
 *
 *   1. **Stepping on twos.** Every paper element animates at an effective
 *      15fps. If that reads as broken rather than deliberate, it is a
 *      foundational change and this is the cheapest moment to make it.
 *   2. **The clapboard beat.** A hinged arm, a 2-3 frame un-eased snap, a
 *      sharp stamp in/out, background-only blur, and confetti. Five of these carry the film, and it is the
 *      element most likely to look cheap.
 *   3. **Type on paper.** The manifest bets ~60 files that code-set type on
 *      torn swatches matches the *Shirley* reference, rather than cutting
 *      letterforms out of paper. Worth seeing once at full size before that bet
 *      is locked.
 *
 * The plan is explicit that these are judged SEPARATELY — a yes to the six
 * seconds overall is not a yes to all three.
 *
 * **This file now plays Scene 1 and stops.** Scene 1, the clapboard and Scene 2
 * are each registered as their own composition in `Root.tsx` —
 * `LiveShowcaseSceneOne`, `LiveShowcaseSlate`, `LiveShowcaseSceneTwo` — after
 * the director's 2026-09-02 note that the clapboard should be *"its own scene
 * not part of the style test because its a transition"*. Scene 1 had in fact
 * never been registered at all, which is what made it look as though it lived
 * inside this file. It never did; it is `SceneOne.tsx` and always was.
 *
 * The join went with it: this file used to run `SceneOne -> slateSlam ->
 * SceneTwo`, and the director's follow-up was that *"the style test (scene 1)
 * needs to end after scene 1 so the video clapboard should be cut from it"*.
 * The clapboard beat lives in `LiveShowcaseSlate`; the assembled film that puts
 * the two back together is Milestone 7's job, not this file's.
 *
 * So `LiveShowcaseStyleTest` now plays exactly what `LiveShowcaseSceneOne`
 * plays. Both stay registered because the style test is the composition the
 * director has been reviewing all along; the duplication is deliberate and
 * costs nothing but a row in the studio sidebar.
 *
 * The durations below are exported because they are the single source for this
 * file and for the three sibling compositions.
 */

/**
 * Scene 1's length. Was 120, then 162 after the 1.35× pacing pass, now 114.
 *
 * **Trimmed 2026-09-02** on the director's note that *"the end of scene 1 when
 * everything is still is too long cut it a bit earlier"*. The number is
 * derived, not guessed: the words are all in by f39 plus their settle, and the
 * hand stamps at `HAND_IN` 62, holds its squash to t=8, then rides
 * `settle(t - 8, 9, 0.45)` out — which is within 0.5% of rest by t≈20. So the
 * last visible movement in the scene is ~f84.
 *
 * At 162 that left 78 still frames (2.6s). 114 leaves 30 (1.0s). If it still
 * reads long the next stop is 102; the floor is ~96, below which the hand's
 * spring-back is cut off mid-settle.
 */
export const LIVE_SCENE_ONE = 114;

/**
 * Scene 2's length.
 *
 * **352 as of 2026-09-02, up from 180**, because the scene gained the fusion
 * and the film's whole LLM-agnostic turn happens inside it. It is not a
 * re-timing of the old scene and none of the old trims survive as reasoning:
 * where the 180-frame cut held three marks and a fade, this one asks the
 * question, pauses on it, drops three branded marks, fuses them into one, and
 * throws that into the meme's face. Four beats where there was one.
 *
 * Its history, so nobody re-derives it: 180 before the 1.35× pacing pass, 243
 * after it, 205 after a tail trim, 180 again after a second — *"also cut off
 * scene 2 a bit earlier the ending is too long"* — then 330, then this.
 *
 * The floor is the closing beat, not the marks: `and you` lands at f238 and the
 * face is not on the figure until f246, so anything under ~260 ends the scene
 * on a piece still arriving. **330 cleared that floor and was still wrong**:
 * the master's quiet join dissolves over the last 24 frames of whatever it is
 * given, so the finished frame — meme, face and answer all up — had well under
 * a second at full opacity before it started going away. The payoff of the
 * scene was being watched through a dissolve. 352 gives it about a second and
 * three quarters clean, and the master's `tail` on this scene went to 0 at the
 * same time so none of it is thrown away twice.
 *
 * **This is not slack.** The band is 60–70s and the director's standing
 * instruction is not to cut a shot to hit a number; if the film needs to come
 * down, the honest place is a beat that is doing nothing, and every beat in
 * scene 2 is now doing something.
 *
 * **352 → 322 on 2026-09-03.** The hold before the fusion lost 30 frames on the
 * director's note about the marks bobbing twice (see `FUSE_START` in
 * `SceneTwo.tsx`), and every beat after it moved down by the same 30. Taking the
 * length with them keeps the clean rest after the last beat at the 76 frames
 * this comment argues for; leaving it at 352 would have spent the saving on
 * idling instead of removing it from the film.
 */
export const LIVE_SCENE_TWO = 322;

/**
 * 88 frames, not the storyboard's 20.
 *
 * Lengthened five times and then trimmed once, all 2026-09-02, every one of
 * the lengthenings by the director
 * watching it and saying the same thing in different words:
 *
 *   20 -> 32  *"the live clapboard will need a bit more time... because you
 *             can barely register it its too fast"*
 *   32 -> 44  *"once the arm slaps it moves up a bit too quickly can it stay
 *             for a tad bit longer and then go up"*
 *   44 -> 50  *"when the clapboard's arm slams down it moves up too fast — a
 *             tad bit slower so there's time to register it and the confetti"*
 *   50 -> 66  *"the transition video clapboard is moving too fast"*
 *   66 -> 108 *"a tad bit slower when the video clapboard slaps onto the
 *             screen", plus 1-2s more total so the confetti can rest near the
 *             bottom of the board while the slug is readable*
 *
 * **The board no longer lifts, and the length survived that.** The beat was
 * rebuilt as a rack focus between the third and fourth notes (see
 * `SlateScene.tsx`); the frames the first three bought went into the hold and
 * the rack-out instead of into a lift. The underlying note has never changed —
 * *there is not enough time to register the slam* — so the length keeps growing
 * whatever the mechanism is.
 *
 * **Then 108 -> 88**, the first time the note has gone the other way: *"in the
 * video clapboard cut it off a bit earlier the scene ending is a bit too long"*.
 * Every one of those 20 frames comes out of the post-snap hold, so the run-up
 * the five lengthenings bought is untouched — what was too long was the tail
 * after the confetti had settled, not the slam. See `SlateScene.tsx` for why the
 * hold cannot go below ~72 frames without racking the background back in over
 * scraps still falling.
 *
 * **The snap stays ~3 frames through all lengthenings.** See `SlateScene.tsx`.
 *
 * **The board is no longer used at every join.** This was a change to the
 * storyboard's 20-frame figure for all five joins, and the note here used to
 * cost it out as `5 * (88 - 20)` = 340 frames against the budget. That
 * arithmetic is dead: on 2026-09-02 the director cut the clap back to **two**
 * joins — 1 -> 2 and 5 -> 6 — because five of them *"again and again is
 * irritating"*. The three joins in between are the 24-frame `paperBreath`.
 * `MasterFilm.tsx` owns the join table; this constant is only the board's own
 * length.
 */
export const LIVE_SLAM = 88;

/**
 * Scene 3's length — 195f, the storyboard's own figure.
 *
 * **Not rescaled 1.35×** like scenes 1 and 2, by director decision 2026-09-02
 * when the scene 3 beat sheet was approved. The beats were designed to fit 195
 * rather than the storyboard's beats being stretched into 263.
 *
 * **255 as of 2026-09-02, up from 195.** The scene gained a second line. The
 * film is silent and carries no narration, so the director's note was that it
 * has to say what is happening in words: `Build a narrative with your agents.`
 * now precedes `Create your storyboard.`, because the narrative is the thing
 * the agents are for and the board comes after it. The two never share the
 * frame, so the scene has to be long enough to place one, hold it, take it
 * away and place the other — 195 could not do that without either line being
 * unreadable.
 *
 * The storyboard line itself is untouched: same slot, same size, same two rows.
 * It arrives at f174 instead of f60 and holds to the end.
 */
export const LIVE_SCENE_THREE = 255;

/**
 * The style test is Scene 1 and nothing else, so it is exactly Scene 1's
 * length. It used to be `LIVE_SCENE_ONE + SLAM_TAIL - LIVE_SLAM`, which was the
 * same arithmetic written the long way round because there was a join in here.
 *
 * The master composition's arithmetic is no longer this simple and no longer
 * lives here: the joins are two slams and three breaths of different lengths,
 * and the scenes carry trims and frozen holds. See `LIVE_FILM_DURATION` in
 * `MasterFilm.tsx`, which derives it.
 */
export const LIVE_STYLE_TEST_DURATION = LIVE_SCENE_ONE;

export const LiveShowcaseStyleTest: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.paper }}>
      <SceneOne />
    </AbsoluteFill>
  );
};
