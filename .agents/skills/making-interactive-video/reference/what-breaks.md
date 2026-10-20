# What breaks in an interactive film

**For the assistant.** Every one of these happened while the kit was built, and each is why some
line in `src/interactive/kit/` or `web/` looks the way it does. Read it before changing either.

## Contents

- [In the film](#in-the-film)
- [In the page](#in-the-page)
- [In the build](#in-the-build)
- [In testing](#in-testing)
- [Pace](#pace)

## In the film

**An invisible layer swallows every click.** Remotion keeps a transition's presentation mounted
after the join, at opacity 0, on top of everything — so no button underneath could be clicked, and
nothing looked wrong. Found with `document.elementsFromPoint` on the paused page. *Fix:* the film's
root sets `pointer-events: none`; `OptionButton` takes it back with `auto`, and only while its
question is open. Anything new that should be clickable must opt in the same way.

**The Player runs a frame or two past the hold before it pauses.** *Fix:* the question scene clamps
its frame to `holdAt` until there is an answer (`Math.min(frame, HOLD)` in the demo's `AskRoute`).

**A jump over a detour pops.** *Fix:* every segment fades in and out over a few frames, so the seek
lands on a fade, not a cut.

**A film animated on twos.** A hold on an odd frame is a frame the stepping never shows. Hold on an
even frame.

## In the page

**The Player stops on the question straight after the click.** After a click the Player resumes in
the same tick, before React re-renders, so a frame listener reading state still saw "unanswered" and
paused again. *Fix:* answers and the waiting question are kept in refs as well as state
(`useChoicePlayer`).

**The end of the film wipes every answer.** By default the Player jumps back to frame 0 when it
ends, and the rewind rule reads that as a scrub. The first full test passed anyway, because it
sampled the last frame just before the reset. *Fix:* `moveToBeginningWhenEnded={false}`.

**Then Play does nothing on the closing card.** With that off, the Player restarts only from its
exact last frame, and at speed it stopped one short. Parking it on the last frame in an `ended`
handler recursed forever, because `seekTo` fires `ended` again, synchronously, before the frame
updates. *Fix:* a re-entrancy flag, not a frame check.

**Player defaults that fight buttons in the film.** `clickToPlay={false}` — a click must reach the
film's buttons, not toggle playback. `spaceKeyToPlayOrPause={false}` — Space on a focused button
must press it; with Space bound, the Player also pulls focus back to its own play button whenever
playback changes, which steals it from anything the viewer was using.

**`staticFile()` does not work in the page.** Outside Remotion's bundler it resolves to the Remotion
server's path, which does not exist under `file://`. A film with images gives the page's Vite config
its own small `publicDir` and refers to them by relative path.

## In the build

**Chrome will not run a module script from `file://`.** A page that needs a server cannot be emailed
or opened from a shared folder. *Fix:* `web/inline-into-html.mts` builds one classic script inlined
into `index.html`, with relative paths. Check the build: `grep -c 'type="module"' index.html` must
print 0.

**A rebuild deleted the MP4s beside the page.** Vite empties its output folder by default, and the
hand-out keeps page and videos in one folder. *Fix:* `emptyOutDir: false`, set in `singleFileBuild`.

**`@vitejs/plugin-react` will not install.** It wants a newer Babel than Remotion Studio pins. It is
not used: Vite compiles TSX without it; only hot reload while authoring is lost.

**`tsconfig.json` targets ES2015's library.** `Object.entries`, `Array.prototype.includes` and
`padStart` fail the type check in `src/`. Use `Object.keys`, `indexOf`, and string concatenation, or
raise `lib` deliberately and say so.

**Silent films get a silent audio track** when rendered. Harmless; `check-render.mjs` reports it as
present and silent.

## In testing

**Headless shortcuts do not drive the Player.** `--virtual-time-budget` does not advance it, and
autoplay is blocked without a real gesture. Only real-time DevTools events — a real click on the
Player's own "Play video" button — behave like a person. `scripts/test-interactive-page.mjs` does
this.

**A keyboard test that fails for the test's reasons.** A real Enter key carries the text `"\r"`; one
sent without it is a keypress no keyboard makes, and the page was wrongly blamed for ignoring it.

**Frame numbers typed into a test go stale** the moment a segment is re-timed. Read them from the
page (`data-total`) or from the segment table, never from memory.

**Headless Chrome leaves things behind.** A test that is stopped mid-run can leave the browser
running and its profile folder on disk. The test script keeps its profile under `out/` and removes
it; after a crash, check for a `chrome-headless-shell` process and stop it
(`viewing-and-rendering` → long renders).

## Pace

**"It's a bit fast"** about a whole interactive film was answered with one number rather than
scene-by-scene edits: every scene written in the frames it was first timed in, read through a scene
clock that divides the real frame by a `PACE` constant, and every segment length and hold multiplied
by it. 1.25 made everything a quarter longer, and was approved. Add it when a film needs it; the
demo does not.
