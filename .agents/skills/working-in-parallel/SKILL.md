---
name: working-in-parallel
description: Splits one video across several agents or people working at the same time - how to divide the scenes, what each worker owns, which files are shared, and where the seams break. Use when more than one assistant or person will work on the same video, when deciding what to hand to a second assistant, or when parallel work has already collided.
---

# Working in parallel

**Use this when** one video will be worked on by more than one assistant or person at once.

**You need first** a storyboard already divided into scenes, and the shared kit built. Both, before
anyone starts. Splitting earlier than this is what produces the collisions.

**This produces** a division of work where two workers build simultaneously and their output merges
without either re-doing the other's.

**Then go to** `collaborating-with-git` for the mechanics of moving the work between them.

---

## The scene is the unit

Divide by scene, never by layer or by concern. A scene is one file, with one owner, producing one
composition that can be watched on its own. Two people on *the animation* and *the text* of the
same scene are two people editing one file.

Anything finer than a scene shares too much to split. Anything coarser wastes the parallelism.

## Build the shared kit before anyone starts

This is the load-bearing step, and it is the one most often skipped because it feels like delay.

Before the split, one worker builds and everyone agrees on:

- **Theme values** — colours, type sizes, spacing, in one file
- **Background and surface components** — whatever every scene sits on
- **Shared text components** — the way a word appears is a decision made once
- **Transitions** — the joins between scenes belong to neither scene
- **The timing convention** — where a scene's duration is declared and how the master reads it

Skip this and every worker invents their own version. Merging then means choosing between four
near-identical components and re-pointing every scene that used the losers — which costs more than
the parallelism saved.

**Once the kit is shared, it is frozen for the duration.** A change to it is a change to everyone's
work in progress, so it is proposed and agreed, not committed.

## Write the ownership down where the work is

A split held only in someone's head lasts until the first instruction that crosses it. Put the
table in the file everyone reads — `AGENTS.md` or its equivalent — naming scenes and owners
explicitly, including the ones nobody owns yet.

State it as a rule about files, because that is what actually conflicts:

> Scenes 4, 5 and 6 and the master assembly. Do not build, re-time or restyle anything else.

**And say who owns the shared registry.** `src/Root.tsx` lists every composition, so every worker
touches it.

**Register every scene before the split, and do not touch `Root.tsx` again until the merge.**
One person — whoever sets up the kit — adds all the entries up front, each pointing at a stub
component that renders nothing. Workers then only ever edit their own scene file, which no one
else opens. `Root.tsx` is byte-identical on every branch, so there is no conflict to resolve.

This also fixes a second problem: `Root.tsx` is one module graph, so a branch that imports a
scene file another worker has not written yet **cannot compile, preview, still or render
anything at all**. Stubs from the start mean every branch runs on its own from minute one.

> **An append-only marker does not make this safe, and an earlier version of this page said it
> did.** Two workers appending at the same marker is an add/add conflict in the same place. It
> is worse than an ordinary one, because every `<Composition>` block ends in the same four
> byte-identical lines (`fps={30}`, `width={1920}`, `height={1080}`, `/>`), so Git interleaves
> the two hunks instead of stacking them. Resolving it per hunk with "take ours" then pairs one
> worker's `id` with the other's `fps` — **it compiles, it lints, and it silently registers
> three scenes out of six.** A real run hit exactly this.
>
> If you end up merging that conflict anyway, do not resolve it hunk by hunk. Take one side
> whole, re-add the other side's entries by hand, and then check the count: the number of
> `<Composition` tags must equal the number of scenes, and `npx remotion compositions` must
> list every one by name.

## Where the seams actually break

**The transition between two owners' scenes.** It belongs to neither and takes time from both.
Assign it explicitly to one of them, and have the other budget for it too — a join consumes frames
at each end.

**An instruction that crosses the boundary.** A revision round asking for a change to "the opening"
does not know where the split is. The split stops being clean the moment someone acts on it. When
an instruction crosses, say so before working, rather than after.

**Two workers who cannot see each other.** Agents in separate sessions and people on separate
branches share no context at all. Anything sequentially numbered — log files, scene indices — will
collide, because both pick the next free number from the same starting point. Numbering conflicts
are add/add conflicts, which are the annoying kind.

**Prose files.** Two people editing the same document conflict worse than two people editing the
same code, because there is no compiler to tell you which resolution is wrong. Give each
contributor their own file or folder for anything written, and reconcile deliberately rather than
continuously.

## Parallel agents specifically

**Different assistants are worth using for different work**, not only for throughput. Two given the
same brief and told not to look at each other's output produce genuinely different solutions, and
the comparison is informative even when one is discarded. Where that has been done here, both had
independently converged on the same colours — which revealed that the real decision was motion and
layout, not palette.

**One session, one compartment.** An assistant that can see the whole project will help with the
whole project, including the parts it was not given. The boundary has to be in the instruction and
in the file it reads, not implied by what it was asked first.

**Review each scene on its own.** Register every scene as its own composition. Parallel work is
only reviewable if each piece can be watched without the others existing yet.

**Expect to be the integration point.** Assistants do not talk to each other. Whoever is
dispatching the work holds the only complete picture of it, and that is a real job rather than
overhead — it is where the seams get noticed.

## Before merging

- Every scene plays on its own.
- Nobody has edited the shared kit.
- `src/Root.tsx` is unchanged since the split — or, if it was not registered up front, its
  `<Composition` count equals the scene count and `npx remotion compositions` lists them all.
- The master's total is derived from the scene table, not typed.
- Type checking passes on the combined result, not just on each half.
