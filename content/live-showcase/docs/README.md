# The LIVE showcase — documentation

The worked example in this repository: a 70-second silent paper-collage film whose subject is the
repository itself. It is finished, and these four documents describe it as built.

| Document | What it answers |
| --- | --- |
| [`storyboard.md`](storyboard.md) | What the film is. The two ideas behind it, the seven rules it never breaks, all six scenes, and the joins between them |
| [`script.md`](script.md) | Every word that appears on screen, in order, and what is deliberately left unsaid |
| [`assets.md`](assets.md) | What the film is made of, and the prompt that generated each piece. The style preamble in §1 is the reason separately generated images read as one film |
| [`building-a-scene.md`](building-a-scene.md) | How to add or rebuild a scene without breaking the other five: the shared kit, the shape of a scene file, and how to check the work |

## Where things are

```
content/live-showcase/
  docs/        these four documents
  intake/      material brought in, before it is accepted

public/assets/live-showcase/     the accepted assets, read by the code
src/experiments/live-showcase/   the film
```

`intake/` is the workbench: files arrive there and move into `public/assets/` once accepted.
Everything under `public/` is copied into every render, so anything parked there is paid for whether
the film uses it or not.

## Reading the film itself

**The code is the authority on anything these documents and it disagree about.** A scene's length is
a named constant at the top of its own file, and `npx remotion compositions` prints the film's —
which is why no frame counts appear in this prose. A duration copied into a document is a duration
nobody re-checks, and this film's documents carried three wrong ones before the numbers came out.

To watch it: `npm run dev`, then open **LIVE-showcase → LiveShowcaseFilm**. Every scene is also
registered on its own, so any one of them can be reviewed without the rest.
