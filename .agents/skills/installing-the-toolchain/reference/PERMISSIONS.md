# Permissions

`settings.json` in this folder ships to `.claude/settings.json`. It decides which commands the
agent can run without stopping to ask.

**The problem it solves:** with no settings file, **every single command raises a prompt.**
Making one video is dozens of them — `npm install`, a typecheck, a lint, five stills, a render.
A non-technical person faces a wall of approval dialogs for routine work and learns to click
yes without reading, which is worse than not prompting at all.

## What is allowed silently

Everything the video workflow actually does:

| Rule | Why |
| --- | --- |
| `Bash(node --version)`, `Bash(npm --version)` | The setup check |
| `Bash(ls node_modules)`, `Bash(ls node_modules/remotion/package.json)` | The setup check's dependency probe. **Exact matches** — not general permission to list directories. The second is the one that matters: a directory can exist and be empty, a file cannot |
| `Bash(npm install)` | Install the project's own dependencies. **Exact match** — not `npm install <anything>`, so it can only install what `package.json` already lists |
| `Bash(npm run *)` | `npm run dev`, `npm run lint` |
| `Bash(npx remotion compositions)`, `... compositions *`, `... still *`, `... render *`, `... studio`, `... studio *`, `... ffprobe *` | The six things building a video actually does. **Listed one by one rather than as `npx remotion *`** — see below |
| `Bash(mkdir *)` | `public/assets/user-uploads/` and friends have to be created when someone sends their own pictures. `mkdir` cannot overwrite a file or delete anything |
| `Bash(npx tsc *)`, `Bash(npx eslint *)` | Typecheck and lint before rendering |
| `Bash(node scripts/*)` | The project's own scripts — TTS generation and verification |
| `Bash(TTS_MODEL=gemini-3.1-flash-tts-preview node scripts/tts-generate.mjs *)` | The narration skill sets the model explicitly rather than trusting a default. **An environment prefix makes the command no longer start with `node`**, so `Bash(node scripts/*)` does not cover it. Naming the one model keeps any *other* model a decision that gets asked about |
| `Read`, `Write`, `Edit`, `Glob`, `Grep` | Writing the video's code and reading the scripts |

## What still asks

| Rule | Why |
| --- | --- |
| `Bash(npx remotion ffmpeg *)` | **The one Remotion subcommand that is a general-purpose tool.** See below |
| `Bash(git *)` | **`AGENTS.md` says never commit unless asked in that message.** Asking makes that structural rather than a rule an agent might forget. |
| `Bash(winget *)`, `Bash(brew *)` | Installing Node is a **system-wide** change. `SETUP-CHECK.md` already requires asking in words; this is the backstop. |
| `Bash(npm uninstall *)`, `Bash(npm update *)` | Changing dependencies is not part of making a video. |

## What is refused outright

| Rule | Why |
| --- | --- |
| `Bash(rm -rf *)` | Nothing in this workflow needs recursive deletion. |
| `Bash(curl *)`, `Bash(wget *)` | No reason to fetch arbitrary things from the internet. Remotion downloads its own browser through its own code path, which this does not block. |
| `Bash(npm publish *)` | This is not a package. |
| `Bash(npm install -g *)`, `Bash(npm i -g *)`, `Bash(npm install --global *)` | Nothing here needs a global install, and globals affect the whole machine. Three spellings because the rules are literal prefixes |
| `Bash(rm -fr *)` | The same command as `rm -rf` with the letters swapped |

## Why `npx remotion *` was split up

It was one rule. An audit pointed out what it let through:

```
npx remotion ffmpeg -i https://example.com/anything out/x.wav
```

**Remotion bundles a complete FFmpeg**, so that wildcard granted a silent arbitrary-URL fetch
and an arbitrary-path overwrite — the exact thing two lines of the deny list exist to prevent.
Denying `curl` while allowing `npx remotion ffmpeg *` is theatre.

So the subcommands that build a video are listed individually, and **`ffmpeg` asks**. It costs
nothing: no skill in this project runs `npx remotion ffmpeg` with arguments — they only cite it
so nobody reaches for a bare `ffmpeg` that is not installed. When audio work genuinely needs it,
one approval before a tool that can write anywhere is the right price.

`ffprobe` stays allowed. It reads and reports; it cannot write.

## Why there is no `Bash(ls *)` or `Bash(find *)`

Both are read-only in the uses this project has, and both were tempting. Neither is in the list.

`find` is not a read-only command — `find . -delete` and `find . -exec rm {} \;` are ordinary
`find`. A wildcard rule cannot tell those from a search. The one place a skill reached for it,
`asu-visual-style/logo.md`, now uses **Glob**, which is already allowed and cannot delete
anything.

`ls` is genuinely harmless, but the only listing this workflow needs is one exact path, so it
is spelled out rather than opened up. **Every wildcard is a guess about what the future will
put after it.** Two exact rules cost nothing.

## Why `Bash(npm install)` is an exact match

`Bash(npm install *)` with a wildcard would let the agent install **any package from the
internet** without asking. The exact form only permits the bare command, which installs
precisely what `package.json` already lists.

`npm install some-package` is not covered and will prompt — which is right. Adding a dependency
is a decision, and `AGENTS.md` says not to add one without explaining the need.

## What it does not do

**It does not make the agent safe, and it is not a security boundary.** It reduces friction on
routine work. The judgement still lives in the instructions: don't commit, don't spend money,
don't install what nobody asked for.

**Two allowed rules combine into arbitrary code execution.** `Write` is unrestricted and
`Bash(node scripts/*)` is allowed, so an agent can write `scripts/whatever.mjs` and run it with
the full Node API — network, filesystem, `child_process`. `Bash(npm run *)` plus `Edit` on
`package.json` is the same door. **This is not an oversight that can be closed here**; building
a video means writing code and running it. It means the deny list stops a mistake, not an
intent.

**The deny list is advisory.** Its patterns are literal prefixes, so `rm --recursive --force`,
`Remove-Item -Recurse -Force`, `curl.exe` and `Invoke-WebRequest` all miss it. They fall through
to *prompt*, not to silent execution, so the cost is false confidence rather than exposure —
but do not read the list as a wall.

**It does not cover `.claude/settings.local.json`.** If someone wants personal overrides, that
is where they go, and it should be gitignored.

## If it is too loose for your setup

`Write` and `Edit` are unrestricted, so the agent can write anywhere in the project without
asking. That is intentional — building a video means writing a dozen files — but a stricter
deployment could narrow them to `Edit(src/explainers/*)` and `Edit(content/*)`.

**Test the change before shipping it.** Too narrow and the person gets prompted mid-build for
something routine, which is exactly the problem this file exists to fix.
