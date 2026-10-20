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
//   - Start again forgets every answer
//   - the first question can be answered with the keyboard (Tab target, Enter)
//   - nothing is logged as an error
//
// Why not just look at it: a page here once shipped as working without anyone
// clicking it, and its buttons could not be clicked. Why not a quicker headless
// trick: the Player ignores virtual time and blocks autoplay without a real
// gesture - only real-time events behave like a person.
//
// Reads the page's test hooks: data-frame, data-total, data-waiting and
// data-answers on one element (web/interactive-demo/main.tsx has them).
// Needs the headless Chrome Remotion downloads on its first render.

import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, readdirSync, rmSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { argv, exit } from "node:process";
import { pathToFileURL } from "node:url";

const args = argv.slice(2);
const page = args.find((a, i) => !a.startsWith("--") && args[i - 1] !== "--answer");
const wanted = {};
args.forEach((a, i) => {
  if (a === "--answer") {
    const [choice, option] = args[i + 1].split("=");
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
const profile = mkdtempSync(join("out", ".chrome-test-"));
const port = 9400 + Math.floor(Math.random() * 400);
const chrome = spawn(chromePath, [
  `--remote-debugging-port=${port}`,
  "--disable-gpu",
  "--window-size=1600,1100",
  `--user-data-dir=${resolve(profile)}`,
  "about:blank",
]);

const results = [];
const check = (name, ok, detail = "") => {
  results.push(ok);
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  — ${detail}` : ""}`);
};

let ws;
try {
  const targets = await waitFor(async () => {
    try {
      const t = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
      return t.find((x) => x.type === "page") ? t : null;
    } catch {
      return null;
    }
  }, 15000, 250);
  if (!targets) throw new Error("Chrome did not start.");
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
  // Every read of the page also watches the playhead: a jump of more than 20
  // frames between two reads is a seek - a skipped detour, a snap back to an
  // unanswered question, or a restart.
  const jumps = [];
  let lastFrame = null;
  const readState = () =>
    evaluate(`(() => { const s = document.querySelector('[data-answers]'); return s ? { frame: Number(s.dataset.frame ?? -1), total: Number(s.dataset.total ?? 0), waiting: s.dataset.waiting, answers: JSON.parse(s.dataset.answers) } : null })()`);
  const state = async () => {
    const now = await readState();
    if (now && lastFrame !== null && Math.abs(now.frame - lastFrame) > 20) jumps.push(`${lastFrame}→${now.frame}`);
    if (now) lastFrame = now.frame;
    return now;
  };

  await send("Runtime.enable");
  await send("Page.enable");
  await send("Page.navigate", { url: `${pathToFileURL(resolve(page)).href}?rate=3` });

  const first = await waitFor(state, 15000);
  check("the page loads from disk, with its test hooks", Boolean(first), first ? `${first.total} frames` : "no [data-answers] element");
  if (!first) throw new Error("stop");
  const total = first.total;

  const playAt = await waitFor(() => centre('button[aria-label="Play video"]'), 10000);
  check("the Player shows a play button", Boolean(playAt));
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
    check(`the "${option}" option is the topmost thing under the pointer`, Boolean(onTop));
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
  // A fact to read against the film's segments, not a pass or a fail: a
  // skipped detour should be here, and a detour that should play should not.
  console.log(`      playhead jumps on the way: ${jumps.length ? jumps.join(", ") : "none - every frame played"}`);

  // Start again forgets everything.
  const again = await evaluate(
    `(() => { const x = [...document.querySelectorAll('button')].find((e) => e.innerText.trim() === 'Start again'); if (!x) return null; const r = x.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2] })()`,
  );
  if (again) {
    await click(again);
    const cleared = await waitFor(async () => Object.keys((await state()).answers).length === 0, 4000);
    check("Start again forgets every answer", Boolean(cleared));

    // The first question again - answered with the keyboard this time.
    const s = await waitFor(async () => {
      const now = await state();
      return now.waiting ? now : null;
    }, 60000);
    if (s) {
      const option = await evaluate(`document.querySelector('button[data-choice="${s.waiting}"]:not([disabled])')?.dataset.option`);
      await evaluate(`document.querySelector('button[data-choice="${s.waiting}"][data-option="${option}"]').focus()`);
      for (const type of ["keyDown", "keyUp"]) {
        // A real Enter carries text "\r"; a synthetic one without it is not a keypress a person makes.
        await send("Input.dispatchKeyEvent", { type, key: "Enter", code: "Enter", windowsVirtualKeyCode: 13, nativeVirtualKeyCode: 13, ...(type === "keyDown" ? { text: "\r" } : {}) });
      }
      const byKey = await waitFor(async () => (await state()).answers[s.waiting] === option, 4000);
      check(`"${s.waiting}" can be answered with the keyboard`, Boolean(byKey));
    } else {
      check("after Start again, the first question is asked again", false, "no question within 60 s");
    }
  } else {
    check("the page has a Start again button", false);
  }

  check("no errors in the page", errors.length === 0, errors.slice(0, 3).join(" | "));
} catch (e) {
  if (e.message !== "stop") check("the test ran to the end", false, e.message);
} finally {
  try {
    ws?.close();
  } catch {}
  chrome.kill();
  await sleep(500);
  rmSync(profile, { recursive: true, force: true });
}

const failed = results.filter((ok) => !ok).length;
console.log(`\n${results.length - failed} of ${results.length} checks passed.`);
console.log("This says the page works as built. Whether the film is any good is the person's call.\n");
exit(failed ? 1 : 0);
