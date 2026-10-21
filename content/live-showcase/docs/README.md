# The LIVE showcase — documentation

The worked example in this repository: a silent paper-collage film, about a minute long, whose
subject is the repository itself. It is finished, and these three documents describe it as built.

| Document | What it answers |
| --- | --- |
| [`storyboard.md`](storyboard.md) | What the film is. The two ideas behind it, the seven rules it never breaks, all six scenes, and the joins between them |
| [`script.md`](script.md) | Every word that appears on screen, in order, and what is deliberately left unsaid |
| [`assets.md`](assets.md) | What the film is made of, and the prompt that generated each piece. The style preamble in §1 is the reason separately generated images read as one film |

How to add or rebuild a scene without breaking the other five — the shared kit, the shape of a scene
file, and how to check the work — is in the `building-scenes` skill:
[`.agents/skills/building-scenes/reference/building-a-scene.md`](../../../.agents/skills/building-scenes/reference/building-a-scene.md).
[`building-a-scene.md`](building-a-scene.md) in this folder is now only a pointer to it.

[`live-workflow.html`](live-workflow.html) is a standalone visual overview of how the film was made —
the roles, the process, the setup and the lessons — to open in a browser. It was written alongside
the film and has not been revised since; where it and the skills disagree, the skills are current.
*2026-10-21:* moved here from `public/`, where nothing linked to it and every render copied it into
the bundle; its image paths now point back into `public/assets/`.

## Where things are

```
content/live-showcase/
  docs/        these three documents, the pointer to the scene guide, and the workflow page
  intake/      material brought in, before it is accepted

public/assets/live-showcase/     the accepted assets, read by the code
src/experiments/live-showcase/   the film
```

`intake/` is the workbench: raw material arrives there, and only the copies a scene actually uses are
staged into `public/assets/live-showcase/`. Everything under `public/` is copied into every render, so
anything parked there is paid for whether the film uses it or not.

## Reading the film itself

**The code is the authority on anything these documents and it disagree about.** A scene's length is
a named constant at the top of its own file, and `npx remotion compositions` prints the film's —
which is why no frame counts appear in this prose. A duration copied into a document is a duration
nobody re-checks, and this film's documents carried three wrong ones before the numbers came out.

To watch it: `npm run dev`, then open **LIVE-showcase → LiveShowcaseFilm**. Every scene is also
registered on its own, so any one of them can be reviewed without the rest. The film's compositions
are registered in `src/experiments/live-showcase/Registrations.tsx`.

## Corrections

*2026-10-21:* this page used to open "a 70-second silent paper-collage film" and list four documents,
the fourth being a full copy of the scene guide. The duration came out of the prose, and the copy was
replaced with a pointer to the skill's guide, which had been its twin apart from link paths. The claim
that each scene's length is a named constant at the top of its own file was not true for scenes 1–3
until the same day, when their lengths moved out of `StyleTest.tsx` into their own files.
