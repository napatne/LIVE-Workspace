# Setup check

**This runs before the first question of the `building-a-video` skill.** Someone who unzipped this
folder may have nothing installed. Find that out now, not after they have answered four
questions and approved a script.

**You do the installing.** Explain what is missing and why it is needed, ask once, and if they
say yes, run it yourself. **Do not hand them a command and tell them to go and run it** — they
opened a chat window, not a terminal.

## What has to be true

| | Why | Check |
| --- | --- | --- |
| **Node.js 16 or newer** | Remotion v4 needs it | `node --version` |
| **Project dependencies** | Remotion, React, TypeScript | `node_modules/` exists |
| **~270MB free** and a working connection | Chrome Headless Shell, fetched by the **first command that needs a browser** — `npx remotion compositions` and the Studio, not only a render. **~110MB over the wire, ~270MB once unpacked** — measured 2026-09-20. Quote the disk figure; it is the one that can fail | — |

**Warn before that first command, whichever it is.** It stalls for a minute or two with no
progress output, and two cold runs each read the silence as a hang.

**Nothing else to build a video.** No Python, no global packages. Rendering uses the FFmpeg
that ships inside Remotion (`npx remotion ffmpeg`).

**A full system FFmpeg is a separate question, and this page used to get it wrong.** The
bundled copy is trimmed — `setpts`, `minterpolate`, `silenceremove` and `afade` are compiled
out — and the checked-in scripts in `scripts/` need all four. Nobody needs it for a silent
captioned video; anyone touching narration or re-timing does. `AGENTS.md` carries the rule.
**`which ffmpeg` is the wrong test** either way: it cannot see the bundled copy, which is
deliberately kept off PATH.

[`INSTALL.md`](INSTALL.md), beside this file, says the same thing for the person rather than
for you. Point them at it if they want to read ahead, but **do not make it homework** — the
whole point is that they do not have to.

## Step 1 — Node

```bash
node --version
```

### It prints v16 or higher

**Say nothing. Move on.** Do not offer to update it. Node 23 when 24 is current is completely
fine — Remotion needs 16+, and a working install is not a problem to solve.

### The command fails, or Node is missing

```
> Before we start — this needs Node.js, which is the program that actually builds the video.
> It's free, made by the people behind a lot of the web, and it's about a 30-second install.
>
> Shall I install it for you?
```

**If yes, run the right one for their platform:**

| | |
| --- | --- |
| **Windows** | `winget install OpenJS.NodeJS.LTS` |
| **macOS** | `brew install node` — if Homebrew is missing, send them to <https://nodejs.org> for the LTS installer instead |
| **Linux** | Their package manager, or <https://nodejs.org> |

**Then tell them to restart Claude Code.** A new install is not on the PATH of a session that
was already running, so `node --version` will keep failing until they do:

> Node is installed. You'll need to close this and open it again so it picks it up — then just
> say "create a video for me" and we'll carry on.

**If they say no**, stop. Do not ask twice, do not bargain.

**A "no" is often "I can't", not "I won't."** Managed work and university laptops block
installs outright, and the person may not know that is what they are hitting. So give them the
route out without making it a second ask:

> No problem — that's a fair call on a work machine, and I won't push it. Nothing here can
> build a video without it, so I'll stop rather than take you through the questions and hit the
> same wall at the end.
>
> Two things in case they help later. If the laptop is locked down, your IT service desk can
> install it — the request is **"Node.js, LTS version"**, and `INSTALL.md` in this folder lists
> exactly what gets installed and why if they want to see it first. And if you change your
> mind, just open this folder and say *"create a video for me"* again.

**"Node.js, LTS version" matters.** A non-technical person who tells a service desk *"I need
Node"* usually gets the ticket bounced.

#### Warn them there is a second step coming

**If `node_modules/` is also missing** — which it will be on a fresh unzip — installing Node is
only half of it. They restart, a new session re-runs this check, and they get asked to approve
a *second* install. Nobody enjoys discovering that one question at a time. Say so up front:

> Once it's in and you've restarted, there's one more quick install — the project's own
> building blocks — and then we'll get straight into your video. Making the first video also
> pulls down a one-off piece of browser software, so that one takes a few minutes longer than
> the rest.

**Say the whole shape once, here.** Otherwise they approve one install, then a second, then sit
through a silent 270MB download nobody mentioned. Step 3 below still repeats the download when
it actually starts — that is a reminder, not the first they hear of it.

### It prints something below v16

```
> You've got Node v14, and this needs v16 or newer to build the video. Shall I update it?
> Your existing version stays available for anything else that uses it.
```

Same commands. Same restart.

## Step 2 — Dependencies

**Check for files that only a finished install produces — two of them, from two different
packages:**

```bash
ls node_modules/remotion/package.json node_modules/@remotion/cli/package.json
```

**Do not test `node_modules/` for existence.** An install killed halfway — closed laptop,
dropped connection, cancelled command — leaves the folder behind with correctly named but
**empty** subdirectories. A cold agent hit exactly this and said so: the directory listing
looked right, and there were zero files underneath it.

That matters because of what it costs. A directory check passes, the interview runs, they
choose a topic, a length, a voice, and approve a script — and *then* the build dies on
`Cannot find module`. Checking for one real file moves that discovery to before the first
question, where it is thirty seconds instead of ten minutes.

> **Do not use Glob for this.** An earlier draft did, on the reasoning that Glob is already
> permitted and cannot delete anything. **It does not work here.** Glob honours ignore rules and
> `node_modules` is in `.gitignore`, so it reports "No files found" for a package that is
> present and correct. Caught by a cold run that installed 355 packages and was then told its
> dependencies were missing — the false *failure* is worse than the false pass it replaced,
> because it lands immediately after a successful install and the next instruction is to
> install again.

**Do not use `node -e "require.resolve('remotion')"` either.** Node walks up the directory
tree, so inside a folder nested in another JavaScript project it resolves the *parent's*
Remotion and passes while this project is unbuildable. `ls` on the exact path cannot do that.

**No cheap check is airtight, and this one is not either.** A cold run was given a
`node_modules/` containing exactly `remotion/package.json` and nothing else — 4KB, no `dist/`,
no React, no CLI — and the check passed. Two files from two packages is harder to fake by
accident than one, but the real backstop is below: **when a build dies on `Cannot find
module`, that is this check having been wrong, and the answer is one `npm install`, not
debugging the code.**

### Missing

```
> This needs its building blocks installed — Remotion, which draws the video, plus React and
> TypeScript. They all come from the project's own list, nothing extra.
>
> Shall I install them? It takes a minute or two. Making the first video then pulls down one
> more piece — browser software Remotion uses to draw the pictures — so that first one is
> slower than the rest.
```

**If yes, run `npm install` yourself.** Say when it finishes, then carry on into the interview.

**Every path through this file must mention the 270MB download before its first silent wait**,
not only the no-Node path. Someone whose machine already has Node sees this question and no
other — if it is not said here, it is not said at all until they are already waiting.

**If they say no**, stop and say so plainly. There is nothing to build with.

## Step 3 — Mention the first-render download, once

You do not need permission for this — Remotion does it automatically — but **do not let it be
a silent three-minute pause.** Mention it when you start the first build:

> The first video also downloads a piece of browser software, around 270MB once it unpacks,
> which is what actually draws the pictures. It only happens once and it's automatic — it
> just makes this first one slower than the rest.

**If it fails**, it is almost always no connection, a proxy, or no disk space. Say which,
plainly.

## Then start the interview

Once Node and `node_modules` are both fine, **go straight to the `building-a-video` skill.** Do not
report success — nobody needs to hear that their computer is correctly configured.

## If something fails mid-install

- **Say what failed in plain language**, not the stack trace.
- **One honest retry.** If `winget` is missing on Windows, offer the installer from
  <https://nodejs.org> instead.
- **Then stop.** *"I can't get this installed from here — it may need someone with admin access
  on this machine."* Do not loop.
- **Never install anything they did not agree to.** One thing, one question, one yes.

## The one time you re-run `npm install`

`node_modules/` existing is not proof it is complete. An install killed halfway — closed
laptop, dropped connection, cancelled command — leaves the folder behind and the check passes.
Nothing looks wrong until a build dies on `Cannot find module '...'`, which reads like a code
bug and is not one.

**A missing-module error is the signal.** Re-run `npm install` once, say why in plain words,
and carry on:

> That install didn't finish properly the first time — one of the pieces is missing. Let me
> fetch it again, it'll take a minute.

**Once.** If it fails the same way twice, stop and say what the error was. Something else is
wrong and running it a third time will not find out what.

## Never

- Never install without asking first.
- Never install global npm packages. Everything this needs is in `package.json`.
- Never install Python, ffmpeg, or a browser — none is needed, and Remotion brings its own.
- Never tell them to open a terminal and run something. You run it.
- Never re-run `npm install` "just in case". If `node_modules` exists, it is done — with the
  one exception above.
