# What went wrong on LIVE

Five things that broke while making the LIVE film: what happened, what the director said about it,
and what it took to fix. Worth reading before you start rather than after. They are in rough order
of how much they cost.

The quotes are the director's own, shortened, with spelling corrected where it got in the way; the
originals are in the session logs linked under each one. The film runs at 30 frames a second, so a
count like 88 frames is about three seconds.

---

## 1. The finished cut was thrown away

**What happened.** Six scenes, already built and approved one by one, were joined into a single
film. It measured 51 seconds — exactly as planned — and did not work at all.

**What we said.**

> "the scenes are not cohesive, the stitches are jumpy and there are overcuts … the transition
> scenes are choppy … plus the slaps again and again is irritating, so we need the clap only when
> the second scene starts … and at the end when we join 5th and 6th scene. Elegantly"

**Why it happened.** The scenes were joined with crossfades, and a crossfade **overlaps** its
neighbours — it eats time off the end of one scene and the start of the next. Five joins of 88
frames each were recorded, across five documents, as *subtracting* 440 frames from the total, and
everyone read that as the film getting shorter for free.

It was not free. Those 440 frames — about fifteen seconds — were scenes being painted over: an
entire character moment, three animated lines, and the whole payoff of scene 5, none of it ever
visible. From the session log:

> The "51.4s" that several documents celebrated was correct arithmetic over a broken edit.

**What changed.** One rejection of a finished film, then a rebuild of every join. The loud
clapboard went from five places to two — the start and the end — with a quiet crossfade between the
rest, and each join now sits on frozen frames so it buries nothing.

*Feeds the habit: watch it before you believe it.*

Full detail: `agent-logs/023`

---

## 2. We cut the film to hit a number

**What happened.** The film needed to come in under 60 seconds. It ran 63, and the assistant
quietly removed 200 frames — nearly seven seconds — from the final scene to get there. The scene's
own notes called that ending hold adjustable, which read like permission.

It was not permission. The reason for the cut was arithmetic, not the video, and the ending was
worse for it.

**What we said.**

> "i will use the local ui to see the video … i also want you to leave the frame fitting and
> counting obsession, plus timing is not an issue, it can afford 60-70s"

**What changed.** The cut was reverted. The target itself had moved four times by then — 30–40
seconds, then 50–60, then lifted to 60–70 — and three of those four are dead. The film now runs
about 70 seconds because no remaining second is wasted on screen.

*Feeds the habit: never let a number decide the edit. If your assistant starts reporting your video
to you as tables of numbers, it has stopped watching it.*

Full detail: `agent-logs/023`

---

## 3. The clapboard was too fast, twice

**What happened.** A film clapboard snaps shut between scenes. It was too quick to read.

**What we said, first time.**

> "the LIVE clapboard will need a bit more time … you can barely register it, it's too fast"

**What we said, after it was made longer.**

> "the LIVE clapboard is still playing a bit too fast — once the arm slaps it moves up a bit too
> quickly. can it stay for a tad bit longer and then go up"

**Why it happened.** The first fix was wrong because the diagnosis was wrong. The problem was never
the total speed — the arm was rising again on the very same frame it landed, so the slam had no
landing. Making the whole thing slower kept a movement with no pause in it, just stretched.

**What changed.** A held beat after impact. Three rounds on this one movement: the join went from
20 frames to 32 to 44, two-thirds of a second out to a second and a half. "Too fast" usually means
"it never stopped" — and three passes on a single movement is what iterating on motion genuinely
feels like.

*Feeds the habit: ask why before asking for a fix.*

Full detail: `agent-logs/019`

---

## 4. The assistant got the arithmetic wrong

**What happened.** A block of text needed to move up, with a hand moved to make room for it. The
assistant proposed moving the hand down by 80 pixels — which would have pushed it 89 pixels off the
bottom of the screen. It had every number it needed to see that, and did not check.

**What we said.** Nothing, as it turned out. This is the one failure caught before it was built —
spotted by eye in the preview, so the correction was just "move the text up, not the hand". The
assistant's own note afterwards:

> I had the arithmetic to see it coming and did not do it.

**What changed.** The text moved up instead of the hand moving down, in one pass. The cheapest of
the five, because looking at it came before rendering it.

*Feeds the habit: make the assistant show its arithmetic. Positions and sizes are where it is most
confidently wrong, and easiest for you to catch.*

Full detail: `agent-logs/019`

---

## 5. The story itself was wrong

**What happened.** The ending has a joke in it: the film goes grey and silent, then asks whether it
is a silent film, then colour and sound arrive. Nobody could follow it.

**What we said.** On the film as a whole:

> "since there is no audio we will have to explicitly say where [what] is happening"

And on this moment:

> "in scene 5 again the gag is not delivered since we never said sound was missing in the first
> place"

**Why it happened.** The film has no sound at all, by design. So when it took sound away, nothing
changed for the audience — there was nothing to notice. The setup existed only in the heads of the
people who made it.

**What changed.** Nothing in that scene could have fixed it; the repair was three scenes earlier,
where the film had never said out loud that it was silent. So this one was fixed by writing a rule
rather than by moving anything on screen. Rule 6 in the shot list now reads *a silent film has to
say what it is doing* — anything the audience must understand goes on the frame in words. It
conflicts with the rule about keeping text sparse, and it wins. It added nine seconds to the film.

*Feeds the habit: fix the plan, not the frame.*

Full detail: `agent-logs/024`, and
[rule 6 in the shot list](../../../../content/live-showcase/docs/storyboard.md)

---

## What this cost, in total

Seventy seconds of finished video. Seven recorded working sessions over two days, plus one that
nobody wrote down and which is therefore lost. Four target lengths, three of them abandoned. One
complete cut rejected and rebuilt. One scene's joke rewritten after the film was otherwise
finished.

That is a normal amount of going wrong. Budget for it.
