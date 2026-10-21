# Permissions

- [Nothing is pre-approved](#nothing-is-pre-approved)
- [Keep them local to this repository](#keep-them-local-to-this-repository)
- [A key is a permission](#a-key-is-a-permission)
- [Rules worth adding as you go](#rules-worth-adding-as-you-go)
- [Worth leaving as a question](#worth-leaving-as-a-question)
- [Worth refusing outright](#worth-refusing-outright)
- [Why `npx remotion *` is better split up](#why-npx-remotion--is-better-split-up)
- [Why not `Bash(ls *)` or `Bash(find *)`](#why-not-bashls--or-bashfind-)
- [Why `Bash(npm install)` should be an exact match](#why-bashnpm-install-should-be-an-exact-match)
- [What rules do not do](#what-rules-do-not-do)

## Nothing is pre-approved

**This repository ships no allow-list.** The shared `.claude/settings.json` holds one thing: the
hook that runs `scripts/session-start.mjs` when a session opens. Every command an assistant runs
asks first, until the person says otherwise.

**Permissions are something each person builds as they go.** When an assistant asks to run a
command and the person approves it for this project, their assistant records a rule, and the next
time it runs without asking. A few sessions in, the routine work — a typecheck, a still, a render
— runs quietly, and what still asks is what deserves a look. Nobody has to decide the whole list
up front, and nobody inherits someone else's.

Say this to a newcomer once, early, so the prompts do not read as something broken: *"I'll ask
before running commands. If you approve one for this project, I won't ask about it again."* And
tell them what a prompt is for: reading it. Clicking yes on everything without reading is worse
than a short list of rules they chose.

## Keep them local to this repository

**Approve rules for this project, not for every project on the machine.** Project-local rules live
in `.claude/settings.local.json`, which this repository's `.gitignore` already keeps out of Git:
they stay on this machine, apply to this folder only, and never reach anyone who clones it.

Avoid the global, user-wide settings for this work. A rule that is right for a video workspace —
`node scripts/*`, say — is a rule nobody meant to grant to every other repository on the machine.

If someone wants to start from a list rather than build one, the rules below are the ones this
workflow uses; they paste into `.claude/settings.local.json`:

```json
{
  "permissions": {
    "allow": [
      "Bash(node --version)", "Bash(npm --version)",
      "Bash(npm install)", "Bash(npm run *)",
      "Bash(npx remotion compositions)", "Bash(npx remotion compositions *)",
      "Bash(npx remotion still *)", "Bash(npx remotion render *)",
      "Bash(npx remotion ffprobe *)",
      "Bash(npx tsc *)", "Bash(npx eslint *)",
      "Bash(node scripts/*)", "Bash(mkdir *)"
    ],
    "deny": [
      "Bash(rm -rf *)", "Bash(rm -fr *)", "Bash(curl *)", "Bash(wget *)",
      "Bash(npm publish *)", "Bash(npm install -g *)", "Bash(npm i -g *)",
      "Bash(npm install --global *)"
    ]
  }
}
```

Other assistants have their own permission files and syntax; the reasoning below carries over.

## A key is a permission

**Putting an API key in `.env` is the person's permission for the assistant to use that
service.** They chose the service and handed over the key; asking again before every call to it
would be the wall of prompts this file is about. So once a key is there, the scripts that use it
— `scripts/tts-generate.mjs` and `scripts/tts-verify.mjs` with the Google key — are theirs to run.

Two things a key does not change:

- **Anything that costs money still goes through the cost rules** (`AGENTS.md` → *Cost rules*): the
  exact paid step, the number of attempts and the total, approved before it runs. A key that also
  works for paid calls is not approval to make them.
- **A key is not created for them.** `.env` is written only after they say they want the service
  (`building-a-video` → `reference/interview.md` → step 1c).

## Rules worth adding as you go

Everything the video workflow routinely does, and why each rule is drawn where it is:

| Rule | Why |
| --- | --- |
| `Bash(node --version)`, `Bash(npm --version)` | The setup check |
| `Bash(ls node_modules)`, `Bash(ls node_modules/remotion/package.json)` | The setup check's dependency probe. **Exact matches** — not general permission to list directories. The second is the one that matters: a directory can exist and be empty, a file cannot |
| `Bash(npm install)` | Install the project's own dependencies. **Exact match** — not `npm install <anything>`, so it can only install what `package.json` already lists |
| `Bash(npm run *)` | `npm run dev`, `npm run lint`, `npm run score` |
| `Bash(npx remotion compositions)`, `... compositions *`, `... still *`, `... render *`, `... ffprobe *` | What building a video actually does. **Listed one by one rather than as `npx remotion *`** — see below |
| `Bash(mkdir *)` | `content/<project>/intake/` and `public/assets/<project>/` have to be created when someone sends their own pictures or clips. `mkdir` cannot overwrite a file or delete anything |
| `Bash(npx tsc *)`, `Bash(npx eslint *)` | Typecheck and lint before rendering |
| `Bash(node scripts/*)` | The project's own scripts — checks, finishing, the score, narration |
| `Bash(TTS_MODEL=gemini-3.1-flash-tts-preview node scripts/tts-generate.mjs *)` | The narration skill sets the model explicitly rather than trusting a default. **An environment prefix makes the command no longer start with `node`**, so `Bash(node scripts/*)` does not cover it. Naming the one model keeps any *other* model a question |

## Worth leaving as a question

| Rule | Why |
| --- | --- |
| `Bash(npx remotion ffmpeg *)` | **The one Remotion subcommand that is a general-purpose tool.** See below |
| `Bash(git *)` | **`AGENTS.md` says never commit unless asked in that message.** A prompt makes that structural rather than a rule an agent might forget |
| `Bash(winget *)`, `Bash(brew *)` | Installing Node is a **system-wide** change. `SETUP-CHECK.md` already requires asking in words; the prompt is the backstop |
| `Bash(npm uninstall *)`, `Bash(npm update *)` | Changing dependencies is not part of making a video |

## Worth refusing outright

| Rule | Why |
| --- | --- |
| `Bash(rm -rf *)`, `Bash(rm -fr *)` | Nothing in this workflow needs recursive deletion. Two spellings because the rules are literal prefixes |
| `Bash(curl *)`, `Bash(wget *)` | No reason to fetch arbitrary things from the internet. Remotion downloads its own browser through its own code path, which this does not block |
| `Bash(npm publish *)` | This is not a package |
| `Bash(npm install -g *)`, `Bash(npm i -g *)`, `Bash(npm install --global *)` | Nothing here needs a global install, and globals affect the whole machine. Three spellings for the same reason |

## Why `npx remotion *` is better split up

As one rule, it lets this through:

```console
npx remotion ffmpeg -i https://example.com/anything out/x.wav
```

**Remotion bundles a complete FFmpeg**, so that wildcard grants a silent arbitrary-URL fetch and
an arbitrary-path overwrite — the exact thing two lines of the deny list exist to prevent. Denying
`curl` while allowing `npx remotion ffmpeg *` is theatre.

So the subcommands that build a video are worth allowing individually, with **`ffmpeg` left to
ask**. It costs nothing: no skill in this project runs `npx remotion ffmpeg` with arguments — they
only cite it so nobody reaches for a bare `ffmpeg` that is not installed. `ffprobe` is safe to
allow. It reads and reports; it cannot write.

## Why not `Bash(ls *)` or `Bash(find *)`

Both are read-only in the uses this project has, and both are tempting.

`find` is not a read-only command — `find . -delete` and `find . -exec rm {} \;` are ordinary
`find`. A wildcard rule cannot tell those from a search. The one place a skill reached for it,
`asu-visual-style/logo.md`, now uses **Glob**, which cannot delete anything.

`ls` is genuinely harmless, but the only listing this workflow needs is one exact path, so it is
better spelled out than opened up. **Every wildcard is a guess about what the future will put
after it.** Two exact rules cost nothing.

## Why `Bash(npm install)` should be an exact match

`Bash(npm install *)` with a wildcard lets the agent install **any package from the internet**
without asking. The exact form only permits the bare command, which installs precisely what
`package.json` already lists.

`npm install some-package` is not covered and will prompt — which is right. Adding a dependency is
a decision, and `AGENTS.md` says not to add one without explaining the need.

## What rules do not do

**They do not make the agent safe, and they are not a security boundary.** They reduce friction on
routine work. The judgement still lives in the instructions: don't commit, don't spend money,
don't install what nobody asked for.

**Two of the rules above combine into arbitrary code execution.** With `Write` unrestricted and
`Bash(node scripts/*)` allowed, an agent can write `scripts/whatever.mjs` and run it with the full
Node API — network, filesystem, `child_process`. `Bash(npm run *)` plus `Edit` on `package.json`
is the same door. **This cannot be closed by rules**; building a video means writing code and
running it. Allowing those two is a choice to trust the instructions, and it is the person's to
make — one more reason the list is built, not shipped.

**A deny list is advisory.** Its patterns are literal prefixes, so `rm --recursive --force`,
`Remove-Item -Recurse -Force`, `curl.exe` and `Invoke-WebRequest` all miss it. They fall through to
a prompt, not to silent execution, so the cost is false confidence rather than exposure — but do
not read the list as a wall.
