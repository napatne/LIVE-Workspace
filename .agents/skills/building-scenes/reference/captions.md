# Captions

**On by default, and mandatory whenever the video has audio.**

> ASU: new recorded video intended for students, employees or the public must have edited
> auto-captions or manual captions, and its guidance is to **aim for 95% accuracy or higher**.
> Raw auto-generated captions do not qualify. See `asu-visual-style/accessibility.md`.

### The two cases are not the same

**With narration, captions are a requirement.** Not a setting, not a preference, and not
something to offer to turn off. The `building-a-video` skill step 3 says to state it in one clause and
move on.

**With no narration, there is no audio to caption** — so the requirement does not bite, and
what is left is a design question the workflow asks: *do you want the words on screen?*

- **Yes** — the default, and what the three ready-made packs are written for. The sentences
  are the video's only voice.
- **No** — a legitimate pattern, and one that shipped here: a 90-second silent film with
  no caption panel at all, carrying its meaning through typography and motion. **It was
  removed when this repository was cut down to one film**, so there is no longer a copy in
  `src/` to study — the description here is the whole of it. **But the
  script has to be rewritten as short on-screen phrases to suit it.** A sentence script with
  no voice and no captions is a video that says nothing.

**Never build that last combination.** If you arrive at no voice, no captions and a script of
full sentences, something has gone wrong in the interview — go back and fix it rather than
rendering it.

## Where the text comes from

**The section's `narration` string** — the same words the voice reads, and the same words the
person approved at the interview's step 6.

Do not write separate caption copy, and do not transcribe the audio. Generating captions from
the script means accuracy is not in question — nothing was ever guessed. It also means the
caption and the voice cannot drift apart.

## Chunking

**Put it in `shared/caption-text.ts`** — beside `Captions.tsx`, not inside `figures/`.

**Not `captions.ts`.** It differs from `Captions.tsx` only in case, and on Windows or macOS
TypeScript fails with **TS1149** — *"File name differs from already included file name only in
casing"* — plus a **TS2305** on the component import, because `./Captions` silently resolves to
the wrong file. That second error is the nastier one: the import binds to the chunker and the
component vanishes.

**The whole function, assembled.** Earlier drafts of this file showed `chunkNarration`,
`softBreak` and `mergeOrphans` as three separate snippets that were never wired together — and
the `chunkNarration` shown did not call the other two, so copy-pasting it reproduced the exact
orphan bug this file warns about. Use this:

```ts
const WORDS_PER_CHUNK = 9;
const MIN_CHUNK = 3;

/**
 * Last comma/semicolon/colon/em-dash anywhere in the window, else the hard
 * limit. The em dash matters: the three shipped packs use 16-28 of them each,
 * roughly a third of all their separators, and leaving it out threw away that
 * many natural break points. It catches both `word—` and a standalone `—`
 * token, and in both cases the dash stays at the end of the line, which is
 * where it belongs.
 */
const softBreak = (words: string[], limit: number): number => {
  for (let i = limit - 1; i >= 1; i--) {
    if (/[,;:—]$/.test(words[i])) return i + 1;
  }
  return limit;
};

export const chunkNarration = (
  narration: string,
  keepTogether: string[] = [],
): string[] => {
  const words = narration.trim().split(/\s+/).filter(Boolean);
  const chunks: string[] = [];
  let i = 0;

  while (i < words.length) {
    const window = words.slice(i, i + WORDS_PER_CHUNK);

    // A sentence ending inside the window is the best break there is.
    let take = window.findIndex((w) => /[.!?]$/.test(w));
    take = take >= 0 ? take + 1 : softBreak(window, window.length);

    // Never split a phrase the video is teaching.
    for (const phrase of keepTogether) {
      const parts = phrase.split(/\s+/);
      const at = i + take - 1;
      for (let k = 1; k < parts.length; k++) {
        const startsAt = at - k + 1;
        if (startsAt < i) continue;
        const slice = words.slice(startsAt, startsAt + parts.length)
          .join(" ").replace(/[.,;:]$/, "");
        if (slice.toLowerCase() === phrase.toLowerCase()) take = startsAt - i;
      }
    }

    if (take <= 0) take = Math.min(WORDS_PER_CHUNK, words.length - i);
    chunks.push(words.slice(i, i + take).join(" "));
    i += take;
  }

  // Fold any runt back into the one before it.
  return chunks.reduce<string[]>((acc, c) => {
    if (acc.length > 0 && c.split(/\s+/).length < MIN_CHUNK) {
      acc[acc.length - 1] += " " + c;
    } else {
      acc.push(c);
    }
    return acc;
  }, []);
};
```

**Pass `keepTogether` per topic.** Export it from the topic's `sections.ts` — for photosynthesis
`["carbon dioxide"]`, for colour theory `["colour wheel"]`.

**Only multi-word phrases can go in it.** The chunker splits on whitespace
(`narration.split(/\s+/)`), so a hyphenated word is already a single token and can never be
broken — `"split-complementary"` in this list does nothing at all. Listing it looks like
protection and is inert.

**Include the inflections, and check each string is actually in the script.** The match is
exact, so `"colour wheel"` does not protect `colour wheels`.

> **Grep the pack before you list anything.** This example has been wrong twice. It first
> protected `"complementary colour"`, which appears nowhere in the colour-theory script. It
> was then corrected to include `"split-complementary"`, which does appear — but is one
> hyphenated token the chunker cannot split, so it was inert. **Both versions looked like
> protection and provided none.**
>
> Two checks, both cheap: does the phrase occur in the narration at all, and does it contain
> a space? If either answer is no, it does not belong in the list.

**Merging an orphan can push a chunk to 10 or 11 words**, past `WORDS_PER_CHUNK`. That is
intended — a slightly long line beats a one-word panel — but it means the nine-word figure is a
target, not a guarantee. Watch the character count instead; 80 is the real limit.

**Run the real function over the whole script before building** — including tiers the requested
length will not play — and check no chunk is under three words.

**Nine words is about one comfortable line at 40px** across the safe width. Longer and it wraps
to three lines and starts covering the picture. ASU's typography rule caps line length at 80
characters; nine words sits well inside that.

### Don't split a term the video is about

A plain nine-word cut produced this, in a video whose entire subject is the standard deviation:

> *"About sixty-eight percent of everything falls within one standard"*
> *"deviation of the average."*

**Prefer a comma or a sentence end near the limit** rather than cutting at exactly nine words,
and **never break between the words of a term being taught.** A short list of the phrases a
script must not split is worth keeping per topic — for this one, "standard deviation".

**The orphan this prevents was real.** A build produced a caption panel containing the single
word `is.` — the comma that should have broken the line sat outside the search window, the cut
landed at nine words, and the sentence-end rule made the remainder its own chunk.

See the assembled function above.

**Run `mergeOrphans` over the result and look at a caption frame before you ship.** A panel
holding one word is obvious in a still and invisible in the code.

## Timing

Spread the chunks across the section, **weighted by length**. Even division gives a three-word
chunk the same time as a fifteen-word one, which reads as a stutter.

```tsx
const chunks = chunkNarration(section.narration);
const weights = chunks.map((c) => Math.max(c.length, 1));
const totalWeight = weights.reduce((a, b) => a + b, 0);

let elapsed = 0;
let active = chunks[chunks.length - 1];   // fall through to the last chunk
let activeStart = 0;
for (let i = 0; i < chunks.length; i++) {
  const span = (weights[i] / totalWeight) * durationInFrames;
  if (frame < elapsed + span) {
    active = chunks[i];
    activeStart = elapsed;
    break;
  }
  elapsed += span;
}

const opacity = interpolate(frame - activeStart, [0, 5], [0, 1], {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
});
```

**That fallthrough default matters.** Without initialising `active` to the last chunk, rounding
leaves the final frames of a section with no caption at all.

Fade each chunk in from **its own** start, not the section's.

## Styling

```tsx
<div style={{
  position: "absolute", left: 0, right: 0, bottom: 64,
  display: "flex", justifyContent: "center",
  paddingLeft: 160, paddingRight: 160,
}}>
  <span style={{
    backgroundColor: THEME.captionBackground,  // rgba(26,26,26,0.86)
    color: THEME.captionInk,                   // white — 11.51:1 on that panel
    fontSize: TYPE.caption,                    // 40
    fontWeight: 700,   // Arial has 400 and 700 only; 600 is synthesised
    lineHeight: 1.5,                           // ASU requires at least 1.5
    padding: "14px 30px",
    borderRadius: 12,
    textAlign: "center",
    opacity,
  }}>
    {active}
  </span>
</div>
```

**The panel is semi-opaque dark, not bare text.** Text alone becomes unreadable the moment a
diagram passes behind it — and its contrast then depends on whatever happens to be underneath,
which you cannot guarantee.

## Leave room

When captions are on, **the figure area stops at 190px from the bottom** instead of 120px.
Pass the flag down so the scene lays itself out accordingly. Otherwise a tall diagram runs
under the panel.

## SRT, if asked

Remotion ships `@remotion/captions` for parsing and displaying SRT — see the
[remotion-captions skill](../../remotion-best-practices/remotion-captions/REFERENCE.md).
You do not need it for the built-in captions above. Reach for it only if the person wants a
separate subtitle file, or wants to import captions produced elsewhere.

**It is not in `package.json`.** It sits in `node_modules` only because another Remotion
package depends on it, so importing it is a gamble on someone else's dependency tree. If
someone genuinely needs SRT, say that it means adding a dependency, and add it properly —
`npm install @remotion/captions@4.0.506`, matching the version of everything else. That
prompts for approval by design.
