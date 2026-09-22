# Getting started

**You don't need to know how to code to use this.** You need two things installed, and the
assistant will do both for you.

## 1. Get the folder

**From the website:** download the zip and unzip it somewhere you'll find again — Documents is
fine. Don't leave it inside the zip; nothing will work.

**From GitHub:** clone or download it the usual way.

## 2. Open it in Claude Code or Codex

Open the folder you just unzipped. Not the folder containing it — **the one with
`package.json` in it.**

## 3. Say what you want

> create a video for me

That's it. If anything is missing, the assistant will tell you what and offer to install it.
**Say yes and it handles the rest.** You won't be asked to type commands.

**Unless your laptop is managed by your employer or university.** Those often block installing
anything, and no assistant can get around that. If it fails, your IT service desk can do it —
ask for **"Node.js, LTS version"** and send them this file. Everything below is what they will
want to know.

---

## What gets installed, and why

**Node.js** — the program that actually builds the video. Free, open source, widely used. Only
installed if you don't already have it, and only after you say yes. **If you already have a
recent enough version, nothing changes.**

**The project's building blocks** — Remotion (which draws and renders the video), React, and
TypeScript. These come from the project's own list; nothing else is added.

**A browser component, on your first render** — about 110MB to download and around 270MB once
it unpacks on disk, fetched automatically by
Remotion so it can draw the frames. It happens once. Your first video will be slower than the
rest because of it.

**Nothing else.** No Python. No global installs. Nothing that changes how your computer works
outside this folder.

---

## If something goes wrong

**"It says Node isn't found, even after installing."**
Close Claude Code and open it again. A program installed while it was running isn't visible to
it until then.

**"The first render is taking forever."**
That's the 270MB browser download. It only happens once. If it's been more than a few minutes,
your connection may be blocked — tell the assistant and it'll say what failed.

**"It's asking me to approve things constantly."**
Check that `.claude/settings.json` exists in the folder. It's what tells Claude Code which
routine commands are fine to run.

**"I want a voice on my video."**
That needs a free Google AI key. The assistant walks you through it — about two minutes, no
credit card. You can also skip it; the video has captions on screen either way.

---

## Wanting to poke around

Not required for making videos, but it's all here:

```console
npm run dev      # opens Remotion Studio in a browser — scrub through any video
npm run lint     # type and style checks
```

Finished videos land in the **out** folder.
