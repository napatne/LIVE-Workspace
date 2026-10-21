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
folder to hand out: `out/<project>/` with `index.html`, every path as an MP4, and a version for
anyone who cannot see the screen.

**Then go to** `viewing-and-rendering` to watch each path, and back here to build the hand-out.

---

## What it is

**The film draws its own questions.** No pop-up, no form over the video: the question is a scene,
the options are part of the picture, and they are real buttons — reachable by Tab, pressed by Enter,
found by a screen reader. The page around the film only stops the Player on a question, remembers
the answer, steps over the detours that do not apply, and forgets answers when the viewer rewinds.

**Everything stays in the browser.** Nothing is sent, stored or logged. The hand-out is a folder,
not a service — no server, no account, no process left running on anyone's machine.

**One film, two ways of playing it.** In Studio and in renders, the answers are given as plain
settings and the film lays out only the segments those answers play — so **every path is an
ordinary video** that can be watched, reviewed and handed out. On the page, every segment is laid
out and the page seeks over every segment whose answer was not given.

## Where it can go

Say this when someone asks where they can put it, before they plan around it:

- **It keeps no score and reports to nothing.** No SCORM, no xAPI, no LTI; nothing reaches a
  gradebook. If a grade is needed, pair the film with a quiz in their learning platform.
- **Uploading the single `index.html` to a learning platform is untested.** It may be served as a
  page that runs, or as a file that downloads. Try one upload before promising it.
- **Many mail systems block `.html` attachments.** Send the folder as a zip, or put it on a shared
  drive.
- **The MP4s go anywhere a video goes.**

## The decisions in it

Each one theirs, or yours said out loud and written into the brief:

| Decision | Default if they have no view |
| --- | --- |
| **Whether it is interactive at all** | Not, unless asked. An interactive film is more work to make and to review |
| **Click or type** | **Click only.** Typing stops the film for longer, breaks on phones, and collects what someone wrote |
| **How many questions, and what each leads to** | One or two. Each option leads to a short reaction, a short detour, or a recap — and every path rejoins the main line |
| **What the content describes** | If it shows a real process — an institution's policy, a form, a procedure — use the real one only if they give the details. Otherwise make a generic one, and say on the first and last frame that it is made up. A drawn screen such as an inbox or a login form is fine; a real product's screen is not |
| **Music** | **None, said out loud.** A question holds the film for as long as the viewer takes, so a score timed to the frames cannot stay in step. Say that it is unsolved, and that it is why |
| **What is handed out** | The page, every path as an MP4, and **a version for someone who cannot see it** — see below. Raise it at the plan, not at the hand-out |

### A version for someone who cannot see it

The MP4s are for anyone who cannot or will not use the page. **They are not an alternative for a
blind viewer**: a film whose words are on screen and whose sound is silent says nothing to them. Offer
one of these, and put it in the hand-out folder:

- **A text version** — the script and every question, with what each answer leads to, as plain text.
  The cheapest, and it works with every screen reader.
- **A narrated path** — a voice reading what is on screen (`adding-narration`). More work, and it
  needs the voice decision made.

## The limits, and why

Built into the kit, and enforced when the film loads — a film that breaks them throws before it
can be rendered:

- **2 or 3 options a question. At most 3 questions. At most 2 jumps.** A *jump* is a question with
  at least one detour that depends on its answer — the film's only branching. A question with no
  detour, whose answer changes only a reaction, is not a jump.
- **Every detour rejoins the main line.** No tree.

A question may have a detour for more than one of its answers. The page steps over every detour
whose answer was not given, wherever it sits.

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
   film. Settle the version for someone who cannot see it, and say there is no music, in the same
   turn.
2. **Copy the demo.** `src/interactive/demo/` → `src/interactive/<project>/`, and
   `web/interactive-demo/` → `web/<project>/`. Rename the names inside — in the page's
   `vite.config.mts`, both its `root` and its build folder, which must be `out/<project>/` — and
   import the new `Registrations` into `src/Root.tsx`. Point the copied `segments.ts` and
   `Registrations.tsx` at the new `web/<project>/paths.json`. For trying the page while authoring (step 6),
   add one script to `package.json` beside `interactive`:
   `"<project>": "vite --config web/<project>/vite.config.mts"`. The hand-out builds the page itself
   and needs no build script.
3. **Write the segment table** (`segments.ts`): every segment's length; `ask` on a question
   (`choice`, its `options`, and `holdAt`, the frame the film waits on); `onlyIf` on a detour. List
   every path in `web/<project>/paths.json`, keyed by composition id —
   `{ "<CompositionId>": { "<choice>": "<option>" } }`. Each becomes a composition, and the hand-out
   renders and clicks through exactly that list.

   **In an MP4 nobody can click**, so the question is on screen only from its arrival until
   `holdAt`; then the path's answer shows. Size the hold for reading the question and every option
   after they have all arrived, not from the segment's first frame. A cue such as *"Pause here and
   decide"*, drawn only when `useChoice(<choice>).mode` is `"preview"`, tells a viewer of the MP4
   to stop the video themselves; the page never shows it.
4. **Write the scenes**, one per segment id. The question scene is the one to copy carefully from
   the demo's `AskRoute`: the options drawn as part of the picture inside `OptionButton`, the frame
   held at `holdAt` until there is an answer, the chosen option shown as chosen. Fade what changes
   at each segment's edges so a jump over a detour never pops — and where a picture is held across
   segments, fade only what changes around it
   ([`reference/what-breaks.md`](reference/what-breaks.md) → *In the film*).
5. **Watch every path** — `Interactive-<project>` in Studio's sidebar, one composition per path, or
   each path rendered at half scale (`viewing-and-rendering`). This is where the person reviews the
   film itself.
6. **Try the page**: `npm run <project>` starts a page on `localhost` for authoring. Stop it when
   done.
7. **Build the hand-out and test it**:

   ```console
   node scripts/interactive-handout.mjs <project>
   node scripts/interactive-handout.mjs <project> -- --concurrency=1   # flags passed to every render
   ```

   It builds the page, renders every path (as its own composition, so each length is checked
   against the code), finishes and measures each, clicks through the page once for **every** path
   in a real browser, and lists the folder. Anything after `--` goes to `remotion render` —
   `--concurrency=1` on a small machine, `--timeout=120000` on a busy one. Contact sheets go to
   `out/<project>-review/`, beside the hand-out folder rather than inside it, so zipping the folder
   cannot take them along. To test the page on its own:
   `node scripts/test-interactive-page.mjs out/<project>/index.html --answer <choice>=<option>`.

## Never call it working without clicking it

A page here was once reported as working and **nobody had clicked it** — an invisible layer sat over
every button and swallowed the clicks. `scripts/test-interactive-page.mjs` exists for this: real
mouse and key events in real time, checking that the film stops on each question, that the option is
the topmost thing under the pointer, that a click records the answer, that the segments that played
are exactly the ones that path should play, that it plays to the end, that Start again forgets, and
that nothing errors. For the keyboard it presses Tab for real until an option has focus, reports how
many presses that took, and then presses Enter.

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
  viewer takes, so a score timed to the frames cannot stay in step. The default is none; say so
  rather than promising music.
- **How many Tab presses reach an option depends on the page.** The click test reports the count
  for the page as built; say that number to anyone who asks about keyboard use, not a remembered one.

The failures behind every rule in the kit, and their fixes, are in
[`reference/what-breaks.md`](reference/what-breaks.md). Read it before changing anything in `kit/`.

## Reference

- [`reference/what-breaks.md`](reference/what-breaks.md) — every bug found while building the kit,
  what caused it, and what fixed it.
- `src/interactive/demo/` and `web/interactive-demo/` — the complete example to copy.
