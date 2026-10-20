---
name: making-interactive-video
description: Makes a video the viewer takes part in - the film stops on a question drawn inside it, the viewer clicks an answer, and the film plays on, stepping into or over a short detour - delivered as one web page that opens by double-click with no server, plus every path rendered as an ordinary video. Use when someone wants an interactive video, a choose-your-path or branching film, a quiz or a check-your-understanding inside a video, a film that asks the viewer something, or a click-through page to hand out.
---

# Making interactive video

**Use this when** the viewer should choose something while the film plays.

**You need first** the story approved in words (`building-a-video` step 3) **including where the
viewer chooses, what each option leads to, and how every path ends** — drawn as a small diagram the
person has said yes to. And the look, from `choosing-a-visual-style`.

**This produces** an interactive film, a page that plays it and opens without a server, and one
folder to hand out: `out/<project>/` with `index.html` and every path as an MP4.

**Then go to** `viewing-and-rendering` to watch each path, and back here to build the hand-out.

---

## What it is

**The film draws its own questions.** No pop-up, no form over the video: the question is a scene,
the options are part of the picture, and they are real buttons — reachable by Tab, pressed by Enter,
found by a screen reader. The page around the film only stops the Player on a question, remembers
the answer, steps over a detour that does not apply, and forgets answers when the viewer rewinds.

**Everything stays in the browser.** Nothing is sent, stored or logged. The hand-out is a folder,
not a service — no server, no account, no process left running on anyone's machine.

**One film, two ways of playing it.** In Studio and in renders, the answers are given as plain
settings and the film lays out only the segments those answers play — so **every path is an
ordinary video** that can be watched, reviewed and handed out. On the page, every segment is laid
out and the page seeks over the ones that do not apply.

## The decisions in it

Each one theirs, or yours said out loud and written into the brief:

| Decision | Default if they have no view |
| --- | --- |
| **Whether it is interactive at all** | Not, unless asked. An interactive film is more work to make and to review |
| **Click or type** | **Click only.** Typing stops the film for longer, breaks on phones, and collects what someone wrote |
| **How many questions, and what each leads to** | One or two. Each option leads to a short reaction, a short detour, or a recap — and every path rejoins the main line |
| **What the content describes** | If it shows a real process — an institution's policy, a form, a procedure — use the real one only if they give the details. Otherwise make a generic one, and say on the first and last frame that it is made up |
| **What is handed out** | The page and every path as an MP4, in one folder |

## The limits, and why

Built into the kit, and enforced when the film loads — a film that breaks them throws before it
can be rendered:

- **2 or 3 options a question. At most 3 questions. At most 2 of them able to skip a detour.**
- **Every detour rejoins the main line.** No tree.

These keep the number of paths small enough that **every one of them can be rendered and watched.**
A film with four paths gets four reviews; a branching tree gets one, of whichever path someone
happened to click. If a story needs more, that is a conversation with the person, not a limit to
work around.

**Rewinding before a question forgets its answer**, and every answer after it, so the viewer can
choose again. That is a rule of the kit, not a setting.

## The kit

| Where | What |
| --- | --- |
| `src/interactive/kit/model.ts` | The segment table, the limits, the layout of each path, the rewind rule. Pure functions — no React |
| `src/interactive/kit/choice.tsx` | `useChoice`, `useAnswers` and `OptionButton` — what a scene needs to ask and react |
| `src/interactive/kit/InteractiveFilm.tsx` | `createInteractiveFilm(segments, scenes)` — the film component |
| `src/interactive/kit/useChoicePlayer.ts` | The page's rules for the Player — stop, remember, skip, forget |
| `src/interactive/demo/` | A complete small film to **copy**: one question, one detour, two paths |
| `web/interactive-demo/` | Its page and its single-file build — copy it too |
| `web/inline-into-html.mts` | The build plugin that makes one html file Chrome opens from disk |

## Making one

1. **The paths, in words, approved.** A sentence per segment and a diagram:

   ```text
   intro ─▶ ask: route ─┬─ short ───────────────▶ end
                        └─ long ─▶ detour-long ─▶ end
   ```

   The person says yes to this before any scene exists — it is the story gate for an interactive
   film.
2. **Copy the demo.** `src/interactive/demo/` → `src/interactive/<project>/`, and
   `web/interactive-demo/` → `web/<project>/`. Rename the names inside, import the new
   `Registrations` into `src/Root.tsx`, and add `"<project>"` and `"<project>:build"` scripts to
   `package.json` beside `interactive` and `interactive:build`.
3. **Write the segment table** (`segments.ts`): every segment's length; `ask` on a question
   (`choice`, its `options`, and `holdAt`, the frame the film waits on); `onlyIf` on a detour. List
   every path in `PATHS` — each becomes a composition.
4. **Write the scenes**, one per segment id. The question scene is the one to copy carefully from
   the demo's `AskRoute`: the options drawn as part of the picture inside `OptionButton`, the frame
   held at `holdAt` until there is an answer, the chosen option shown as chosen. Give every segment
   a short fade in and out so a jump over a detour never pops.
5. **Watch every path in Studio** — `Interactive-<project>` in the sidebar, one composition per
   path. This is where the person reviews the film itself.
6. **Try the page**: `npm run <project>` starts a page on `localhost` for authoring. Stop it when
   done.
7. **Build the hand-out and test it**:

   ```console
   node scripts/interactive-handout.mjs --config web/<project>/vite.config.mts --prefix <Film>- --out out/<project>
   ```

   It builds the page, renders and finishes every path, measures each, clicks through the page in a
   real browser, and lists the folder. To test the page on its own:
   `node scripts/test-interactive-page.mjs out/<project>/index.html --answer <choice>=<option>`.

## Never call it working without clicking it

A page here was once reported as working and **nobody had clicked it** — an invisible layer sat over
every button and swallowed the clicks. `scripts/test-interactive-page.mjs` exists for this: real
mouse and key events in real time, checking that the film stops on each question, that the option is
the topmost thing under the pointer, that a click records the answer, that it plays to the end, that
Start again forgets, that the keyboard works, and that nothing errors. It also prints every jump of
the playhead — a skipped detour shows as one, so the line should match the path you asked for.

**And check what the test looked at.** One run passed only because it sampled the last frame a
moment before the page reset; another "failure" was the test sending an Enter no keyboard sends.

Then put the page in front of the person, and let them click it. Whether it works *for a viewer* is
theirs to say.

## What is not done, and should be said

- **Only Chrome and Edge on a desktop have been tried.** Not Safari, not Firefox, not a phone, not a
  screen reader. Say so before anyone promises them.
- **The Player's progress bar includes the skipped detours**, so on a short path it jumps forward.
  Unsolved.
- **Music on an interactive film is not solved.** A question holds the film for as long as the
  viewer takes, so a score timed to the frames cannot stay in step. Ask before promising music on one.
- **Tab reaches the Player's controls before the options** — six presses to the first option.

The failures behind every rule in the kit, and their fixes, are in
[`reference/what-breaks.md`](reference/what-breaks.md). Read it before changing anything in `kit/`.

## Reference

- [`reference/what-breaks.md`](reference/what-breaks.md) — every bug found while building the kit,
  what caused it, and what fixed it.
- `src/interactive/demo/` and `web/interactive-demo/` — the complete example to copy.
