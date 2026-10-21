// Click through an interactive page the way a viewer does, and say what happened.
//
//   node scripts/test-interactive-page.mjs out/<project>/index.html [--answer choice=option ...]
//
// Opens the built page from disk in headless Chrome and drives it with REAL
// mouse and key events over the DevTools protocol, in real time at ?rate=3:
//
//   - Play starts the film
//   - it stops on each question, and stays stopped
//   - the option is the topmost thing under the pointer (an invisible layer on
//     top - a transition Remotion keeps mounted - once swallowed every click)
//   - a click records the answer and the film carries on to the end
//   - the segments that played are exactly the path those answers make - the
//     same segments, in the same order, as that path's rendered video
//   - Start again forgets every answer
//   - the first question can be reached with Tab presses and answered with
//     Enter (the number of presses is reported)
//   - nothing is logged as an error
//
// Without --answer, each question gets its first option. One run tests one
// path; scripts/interactive-handout.mjs runs it once for every path.
//
// Why not just look at it: a page here once shipped as working without anyone
// clicking it, and its buttons could not be clicked. Why not a quicker headless
// trick: the Player ignores virtual time and blocks autoplay without a real
// gesture - only real-time events behave like a person.
//
// Reads the page's test hooks, all on one element: data-total, data-fps,
// data-waiting and data-answers from the page (web/interactive-demo/main.tsx);
// data-frame, data-segment, data-played and data-segments from the kit
// (src/interactive/kit/useChoicePlayer.ts).
// Needs the headless Chrome Remotion downloads on its first render.

import { spawn, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { argv, exit, platform } from "node:process";
import { pathToFileURL } from "node:url";

const RATE = 3;
// How many Tab presses to try before saying the option cannot be reached.
const MAX_TABS = 40;

const args = argv.slice(2);
const page = args.find((a, i) => !a.startsWith("--") && args[i - 1] !== "--answer");
const wanted = {};
args.forEach((a, i) => {
  if (a === "--answer") {
    const [choice, option] = (args[i + 1] ?? "").split("=");
    if (!choice || !option) {
      console.error(`--answer needs choice=option, got "${args[i + 1] ?? ""}"`);
      exit(1);
    }
    wanted[choice] = option;
  }
});
if (!page || !existsSync(page)) {
  console.error("usage: node scripts/test-interactive-page.mjs out/<project>/index.html [--answer choice=option ...]");
  exit(1);
}

// --- Find Remotion's headless Chrome, on any platform ----------------------
const findChrome = (dir, depth = 0) => {
  if (!existsSync(dir) || depth > 4) return null;
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (/^chrome-headless-shell(\.exe)?$/.test(name) && statSync(p).isFile()) return p;
    if (statSync(p).isDirectory()) {
      const found = findChrome(p, depth + 1);
      if (found) return found;
    }
  }
  return null;
};
const chromePath = findChrome(join("node_modules", ".remotion", "chrome-headless-shell"));
if (!chromePath) {
  console.error("No headless Chrome yet. Remotion downloads it on the first render - render any still once, then re-run.");
  exit(1);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const waitFor = async (fn, ms = 60000, every = 50) => {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    const v = await fn();
    if (v) return v;
    await sleep(every);
  }
  return null;
};

// The profile goes inside the project (out/ is ignored) and is removed after.
// Port 0 lets the system pick a free port, so two runs at once never collide;
// Chrome writes the one it got into the profile's DevToolsActivePort file.
mkdirSync("out", { recursive: true });
const profile = resolve(mkdtempSync(join("out", ".chrome-test-")));
const chromeArgs = [
  "--remote-debugging-port=0",
  "--disable-gpu",
  "--window-size=1600,1100",
  `--user-data-dir=${profile}`,
  "about:blank",
];
const chrome = spawn(chromePath, chromeArgs, { stdio: "ignore" });
let chromeExited = false;
const exited = new Promise((r) =>
  chrome.on("exit", () => {
    chromeExited = true;
    r();
  }),
);

const results = [];
const check = (name, ok, detail = "") => {
  results.push(ok);
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  — ${detail}` : ""}`);
};

// The segment ids the answers should play: every segment, less the detours
// whose question was answered another way - the rule renders lay out by.
const expectedPath = (segments, answers) =>
  segments.filter((s) => !s.onlyIf || answers[s.onlyIf.choice] === s.onlyIf.option).map((s) => s.id);

let ws;
let port = null;
try {
  port = await waitFor(() => {
    try {
      const n = Number(readFileSync(join(profile, "DevToolsActivePort"), "utf8").split(/\r?\n/)[0]);
      return n > 0 ? n : null;
    } catch {
      return null;
    }
  }, 15000, 100);
  if (!port) throw new Error("Chrome did not start (no DevToolsActivePort in its profile).");

  const targets = await waitFor(async () => {
    try {
      const t = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
      return t.find((x) => x.type === "page") ? t : null;
    } catch {
      return null;
    }
  }, 15000, 250);
  if (!targets) throw new Error("Chrome did not offer a page to drive.");
  ws = new WebSocket(targets.find((t) => t.type === "page").webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener("open", r));

  let id = 0;
  const pending = new Map();
  const errors = [];
  ws.addEventListener("message", (m) => {
    const msg = JSON.parse(m.data);
    if (msg.id && pending.has(msg.id)) {
      pending.get(msg.id)(msg);
      pending.delete(msg.id);
    } else if (msg.method === "Runtime.exceptionThrown") {
      errors.push(msg.params.exceptionDetails.exception?.description ?? msg.params.exceptionDetails.text);
    } else if (msg.method === "Runtime.consoleAPICalled" && msg.params.type === "error") {
      errors.push(msg.params.args.map((a) => a.value ?? a.description).join(" "));
    }
  });
  const send = (method, params = {}) =>
    new Promise((r) => {
      const i = ++id;
      pending.set(i, r);
      ws.send(JSON.stringify({ id: i, method, params }));
    });
  const evaluate = async (expr) => (await send("Runtime.evaluate", { expression: expr, returnByValue: true })).result?.result?.value;
  const centre = (sel) =>
    evaluate(`(() => { const r = document.querySelector(${JSON.stringify(sel)})?.getBoundingClientRect(); return r ? [r.x + r.width / 2, r.y + r.height / 2] : null })()`);
  const click = async ([x, y]) => {
    for (const type of ["mouseMoved", "mousePressed", "mouseReleased"]) {
      await send("Input.dispatchMouseEvent", { type, x, y, button: "left", clickCount: 1 });
    }
  };
  const press = async (key) => {
    // A real Enter carries text "\r"; one sent without it is not a keypress a
    // person makes. Tab carries no text, so it goes as a raw key down.
    const keys = {
      Enter: { key: "Enter", code: "Enter", windowsVirtualKeyCode: 13, nativeVirtualKeyCode: 13, text: "\r" },
      Tab: { key: "Tab", code: "Tab", windowsVirtualKeyCode: 9, nativeVirtualKeyCode: 9 },
    };
    const { text, ...k } = keys[key];
    await send("Input.dispatchKeyEvent", { type: text ? "keyDown" : "rawKeyDown", ...k, ...(text ? { text } : {}) });
    await send("Input.dispatchKeyEvent", { type: "keyUp", ...k });
  };

  // Every read of the page also watches the playhead. A seek is a move the
  // Player could not have made by playing: backwards (more than the frame or
  // two it overshoots a question by), or forwards by more than the time since
  // the last read allows at this rate, plus a margin for an uneven frame clock.
  const SEEK_MARGIN = 15;
  const jumps = [];
  let last = null;
  const readState = () =>
    evaluate(`(() => { const s = document.querySelector('[data-answers]'); if (!s) return null; const d = s.dataset; return { frame: Number(d.frame ?? -1), total: Number(d.total ?? 0), fps: Number(d.fps ?? 30), waiting: d.waiting, answers: JSON.parse(d.answers), segment: d.segment ?? null, played: d.played ? JSON.parse(d.played) : null, segments: d.segments ? JSON.parse(d.segments) : null } })()`);
  const state = async () => {
    const now = await readState();
    const at = Date.now();
    if (now && last && now.frame >= 0 && last.frame >= 0) {
      const allowed = ((at - last.at) / 1000) * now.fps * RATE + SEEK_MARGIN;
      const moved = now.frame - last.frame;
      if (moved < -3 || moved > allowed) jumps.push(`${last.frame}→${now.frame}`);
    }
    if (now) last = { frame: now.frame, at };
    return now;
  };

  await send("Runtime.enable");
  await send("Page.enable");
  await send("Page.navigate", { url: `${pathToFileURL(resolve(page)).href}?rate=${RATE}` });

  const first = await waitFor(state, 15000);
  check("the page loads from disk, with its test hooks", Boolean(first), first ? `${first.total} frames` : "no [data-answers] element");
  if (!first) throw new Error("stop");
  const total = first.total;

  const playAt = await waitFor(() => centre('button[aria-label="Play video"]'), 10000);
  check("the Player shows a play button", Boolean(playAt));
  if (!playAt) throw new Error("stop");
  await click(playAt);
  const moving = await waitFor(async () => (await state()).frame > 0, 10000);
  check("Play starts the film", Boolean(moving));

  // Answer every question the film asks, until it ends.
  const asked = [];
  for (;;) {
    const s = await waitFor(async () => {
      const now = await state();
      return now.waiting || now.frame >= total - 2 ? now : null;
    }, 120000);
    if (!s || !s.waiting) break;
    const choice = s.waiting;
    asked.push(choice);

    await sleep(600);
    const held = await state();
    check(`stops on "${choice}" and stays`, held.waiting === choice && held.frame === s.frame, `frame ${s.frame} → ${held.frame}`);

    const option =
      wanted[choice] ??
      (await evaluate(`document.querySelector('button[data-choice="${choice}"]:not([disabled])')?.dataset.option`));
    const sel = `button[data-choice="${choice}"][data-option="${option}"]:not([disabled])`;
    const at = await centre(sel);
    const onTop = at && (await evaluate(`document.elementFromPoint(${at[0]}, ${at[1]})?.closest('button')?.dataset.option === ${JSON.stringify(option)}`));
    check(`the "${option}" option is the topmost thing under the pointer`, Boolean(onTop), at ? "" : `no enabled option "${option}" for "${choice}"`);
    if (!at) break;
    await click(at);
    const got = await waitFor(async () => {
      const now = await state();
      return now.answers[choice] === option && !now.waiting ? now : null;
    }, 5000);
    check(`clicking records ${choice} = ${option} and the film carries on`, Boolean(got));
    if (!got) break;
  }

  const end = await waitFor(async () => {
    const now = await state();
    return now.frame >= total - 2 ? now : null;
  }, 120000, 40);
  check("plays to the end", Boolean(end), end ? `frame ${end.frame} of ${total}, answers ${JSON.stringify(end.answers)}` : "");
  check("asked at least one question", asked.length > 0, asked.join(", "));
  for (const choice of Object.keys(wanted)) {
    if (asked.indexOf(choice) < 0) check(`--answer ${choice}=${wanted[choice]} was asked`, false, "the film never asked it");
  }

  // The segments that played, against the path those answers make.
  if (end) {
    if (!end.played || !end.segments) {
      check("the page reports the segments it played", false, "no data-played / data-segments - the page's useChoicePlayer has no status element, or predates them");
    } else {
      const want = expectedPath(end.segments, end.answers);
      const same = want.length === end.played.length && want.every((x, i) => x === end.played[i]);
      check(
        "played exactly the segments of this path",
        same,
        same ? end.played.join(" → ") : `played ${end.played.join(" → ")}; the path is ${want.join(" → ")}`,
      );
    }
  }
  // A fact, not a pass or a fail: seeks the page made while playing. A skipped
  // detour is one; a detour that should play is not.
  console.log(`      seeks on the way: ${jumps.length ? jumps.join(", ") : "none - every frame played in order"}`);

  // Start again forgets everything.
  const again = await evaluate(
    `(() => { const x = [...document.querySelectorAll('button')].find((e) => e.innerText.trim() === 'Start again'); if (!x) return null; const r = x.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2] })()`,
  );
  if (again) {
    await click(again);
    const cleared = await waitFor(async () => Object.keys((await state()).answers).length === 0, 4000);
    check("Start again forgets every answer", Boolean(cleared));

    // The first question again - reached with Tab and answered with Enter.
    const s = await waitFor(async () => {
      const now = await state();
      return now.waiting ? now : null;
    }, 60000);
    if (s) {
      // Start from the top of the page, as a keyboard user arriving would: a
      // click on the page's empty corner moves the Tab starting point there.
      await click([2, 2]);
      let presses = 0;
      let focused = null;
      while (presses < MAX_TABS) {
        await press("Tab");
        presses += 1;
        focused = await evaluate(`(() => { const e = document.activeElement; return e && e.dataset && e.dataset.choice === ${JSON.stringify(s.waiting)} ? e.dataset.option : null })()`);
        if (focused) break;
      }
      check(`Tab reaches an option of "${s.waiting}"`, Boolean(focused), focused ? `${presses} press${presses === 1 ? "" : "es"} from the top of the page, to "${focused}"` : `not within ${MAX_TABS} presses`);
      if (focused) {
        await press("Enter");
        const byKey = await waitFor(async () => (await state()).answers[s.waiting] === focused, 4000);
        check(`Enter on it answers "${s.waiting}"`, Boolean(byKey));
      }
    } else {
      const now = await state();
      check("after Start again, the first question is asked again", false, `no question within 60 s; the playhead is on frame ${now.frame} (${now.segment ?? "no segment"})`);
    }
  } else {
    check("the page has a Start again button", false);
  }

  check("no errors in the page", errors.length === 0, errors.slice(0, 3).join(" | "));
} catch (e) {
  if (e.message !== "stop") check("the test ran to the end", false, e.message);
} finally {
  await closeChrome();
}

const failed = results.filter((ok) => !ok).length;
console.log(`\n${results.length - failed} of ${results.length} checks passed.`);
console.log("This says the page works as built. Whether the film is any good is the person's call.\n");
exit(failed ? 1 : 0);

// Close Chrome and remove its profile. kill() ends only the parent process;
// on Windows its children keep the profile locked and removing it throws. So:
// ask the browser to close over DevTools, wait for it to exit, and only then
// force it - taskkill /T takes the whole process tree on Windows. A profile
// that still will not go is a warning, never a failed test.
async function closeChrome() {
  try {
    ws?.close();
  } catch {}
  if (port && !chromeExited) {
    try {
      const { webSocketDebuggerUrl } = await (await fetch(`http://127.0.0.1:${port}/json/version`)).json();
      const browser = new WebSocket(webSocketDebuggerUrl);
      await Promise.race([new Promise((r) => browser.addEventListener("open", r)), sleep(2000)]);
      browser.send(JSON.stringify({ id: 1, method: "Browser.close" }));
    } catch {}
  }
  await Promise.race([exited, sleep(5000)]);
  if (!chromeExited) {
    if (platform === "win32") {
      const cmd = ["taskkill", ["/pid", String(chrome.pid), "/T", "/F"]];
      console.log(`$ ${cmd[0]} ${cmd[1].join(" ")}`);
      spawnSync(cmd[0], cmd[1], { stdio: "ignore" });
    } else {
      chrome.kill("SIGKILL");
    }
    await Promise.race([exited, sleep(5000)]);
  }
  try {
    rmSync(profile, { recursive: true, force: true, maxRetries: 10, retryDelay: 300 });
  } catch (e) {
    console.warn(`warning: could not remove Chrome's profile ${profile} (${e.code ?? e.message}). Delete it by hand once no chrome-headless-shell is running.`);
  }
}
