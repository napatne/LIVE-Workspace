import { AbsoluteFill } from "remotion";
import { LIVE_SCENE_ONE, SceneOne } from "./SceneOne";
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
 * are each registered as their own composition in `Root.tsx` (since
 * 2026-10-21, in `Registrations.tsx`, which `Root.tsx` imports) —
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
 *
 * Corrected 2026-10-21: only `LIVE_SLAM` and `LIVE_STYLE_TEST_DURATION` are
 * still defined here. The three scene lengths moved into their own scene files;
 * see the note below.
 */

/*
 * The three scene lengths that used to be defined here — `LIVE_SCENE_ONE`,
 * `LIVE_SCENE_TWO` and `LIVE_SCENE_THREE` — moved on 2026-10-21 into
 * `SceneOne.tsx`, `SceneTwo.tsx` and `SceneThree.tsx`, each at the top of its
 * own file like scenes 4 to 6. Their values did not change; their history
 * comments went with them, with dated corrections added where they had gone
 * stale. Nothing imports them from here any more.
 */

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
