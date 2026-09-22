# The ASU Logo

Verified against <https://brandguide.asu.edu/brand-elements/logos/asu-logo> on **2026-09-19**.

**Read this before putting an ASU logo in anything.** The logo is the one element with hard,
published rules, and getting it wrong is the most visible way to look unofficial.

## Before anything else: there is no logo file here

**This repository contains no ASU logo.** Nothing under `public/` has one. Check before you
promise anything:

Use **Glob** for this, not a shell `find` — it is already permitted, and `find` is not:

```
public/**/*logo*
public/**/*asu*
```

So in practice there are only two situations:

| Situation | What you do |
| --- | --- |
| **They send you a file** | Use it. Check it when it arrives — not before. |
| **They ask for "the ASU logo" and have no file** | Say so plainly, leave it out, carry on. |

> I don't have an ASU logo file here — if you can get one from your department, send it over.
> Otherwise I'll leave it off and the video will still look right.

**Do not go looking for one online.** A logo pulled off a search result is exactly the
"scanned or recreated" case ASU forbids, and you cannot tell an official file from a
third-party copy by looking at it.

If your team wants ASU-styled videos to carry the logo routinely, someone with ASU Brand
Library access should commit an approved PNG to `public/assets/`. Until that happens, treat
the logo as something the person brings, not something the project provides.

## "Can you animate our logo?" — no, and answer it immediately

This is the one thing outright banned, and it is a common request. **Answer in the turn they
ask it**, not later — the `building-a-video` skill step 0.5 has the wording. Promising it and retracting
two turns later is worse than saying so at once.

**What you can do:** fade it in, hold it, move it as a rigid unit, and animate everything
around it. **What you cannot:** reshape it, spin it, build it up stroke by stroke, or recolour
it.

## The rule that comes first

**Never recreate, redraw, trace or approximate the logo.** Not in SVG, not in code, not from
memory. ASU explicitly forbids "scanning or recreating the logo rather than using official
files."

**This project draws its diagrams in code. The logo is the exception.** It must come from an
official file.

Where to get one: the **ASU Brand Library**, linked from
<https://brandguide.asu.edu/brand-elements/logos>. If nobody in the conversation has an
official file, say so and leave the logo out — a wrong logo is worse than no logo.

## File formats

| Format | Use |
| --- | --- |
| **PNG** | Digital, including video. This is what we use. |
| EPS | Print. |
| **SVG** | **Not approved.** Do not use one even if you find one. |

That last line matters here, because SVG is what this project reaches for everywhere else.
For the logo, use a PNG.

## Which version

**Orientations:** horizontal and vertical. Pick whichever fits the space without shrinking the
logo below its minimum.

**Colour versions:**

| Version | Use on |
| --- | --- |
| **Maroon and gold** (preferred) | White, transparent, or a four-colour photograph |
| **White** (reversed) | Black, dark, transparent, or a four-colour photograph |
| **Black** | Limited use, mainly alongside partner logos |

**Never make a gold-only logo.** Converting the logo to gold alone is on ASU's forbidden list.

**Contrast still applies.** Don't put a light logo on a light background or a dark logo on a
dark one. Our standard video background is `#FBF9F4`, so the **maroon and gold version** is the
right default.

## Minimum size

| | Minimum |
| --- | --- |
| Digital | **47 pixels wide** |
| Print | 5/16 inch |

47px is an absolute floor for mobile icons, not a target. **In a 1920×1080 video, a logo below
about 160px wide is illegible** once someone watches in a small window — the 47px rule will not
save you there. Use judgement above the floor.

## Clear space — the "area of isolation"

> No graphic elements, titles, text, background color changes or other design elements may
> occur in this protected space.

**The zone is half the height of the sunburst (½x) on all four sides** — the sunburst, not the
whole logo. Summaries of this page routinely get that wrong. In tight digital
placements it may drop to ¼x, but ½x is preferred — and a video frame is not tight, so use ½x.

Practically: measure the sunburst's height in the file you were given, halve it, and keep that
much empty margin around the whole logo. Nothing enters it — not a caption panel, not a
diagram edge, not a heading.

**In a video this also means time, not just space.** Don't let a moving element pass through
the isolation zone mid-animation.

## Forbidden

### What the brand guide actually says

Only these are quoted from <https://brandguide.asu.edu/brand-elements/logos/asu-logo>:

- **Do not scan or recreate the logo.** Use the official file.
- **Do not place a light logo on a light background, or a dark one on a dark background.**
- **Do not place it on a busy photograph** where it cannot be read.
- **SVG is not an approved format.** EPS for print, PNG for digital.

### What this project adds

The rules below are **ours, not ASU's** — standard identity practice, and the sort of thing an
official file exists to prevent. Follow them, but **do not tell anyone ASU requires them**; a
summary of the brand guide is not the brand guide.

- Don't stretch or distort the proportions.
- Don't recolour it beyond the versions the Brand Library supplies.
- Don't rotate it.
- Don't add shadows, glows, outlines or bevels.
- Don't make a gold-only version.

For video specifically, also ours:

- **Don't animate its shape.** No squash, stretch, skew, spin or bounce. Fading in, or moving
  the whole logo as a rigid unit, is fine.
- **Don't build it up piece by piece.** Drawing the sunburst stroke by stroke is recreating it,
  which *is* forbidden by ASU.
- **Don't put it over moving artwork.** "Busy background" includes one that is busy only
  briefly.

> **Correction, 2026-09-19.** An earlier version of this file listed all of the above under
> *"ASU lists these as unacceptable modifications"*. Checked against the page: only the four in
> the first list are on it. The rest are sound practice but they were not ASU's words, and
> presenting them as such is exactly the stale-claim problem `AGENTS.md` warns about.

## Putting it in a video

- **Default placement: the end card.** It sits on a clean background with nothing competing,
  which satisfies the isolation rule without effort.
- **If it opens the video**, give it a plain frame of its own rather than layering it over the
  title.
- **A persistent corner logo is possible but risky** — it has to keep its isolation zone clear
  for the whole runtime, across every scene. Only do it if asked, and check every scene.
- **Scale proportionally. Lock the aspect ratio.** In Remotion, set width or height, never
  both to arbitrary values.

```tsx
// Logo from an official PNG, never redrawn. Height derived from the file's
// own aspect ratio so it cannot distort.
<Img
  src={staticFile("assets/asu-logo.png")}
  style={{ width: 320, height: "auto", opacity }}
/>
```

## A unit or sub-brand logo?

ASU has separate rules for unit, college and spirit marks —
<https://brandguide.asu.edu/brand-elements/logos/units>. If someone hands you a logo for a
specific school, department or programme, **it is not the ASU logo and may have different
rules**. Check that page rather than assuming this one applies.

## When a logo file arrives

**Check it now — not before.** Raising file formats before you have seen anything is a problem
you invented, and it violates the workflow's rule about loading questions with clauses.

In order:

1. **Look at what it actually is.** A file called `logo.png` could be the university mark, a
   college or department mark, or their student club's own design. If it is a unit mark, its
   rules are at <https://brandguide.asu.edu/brand-elements/logos/units>, not this page.
2. **If it is an SVG**, ask for a PNG — ASU does not approve SVG. Say it plainly and without
   ceremony: *"Could you send that as a PNG? That's the format ASU approves."*
3. **If it is too small or too low quality**, ask for a better file rather than upscaling it.
   Below roughly 160px wide it will not read in a 1080p video.
4. **Use it as given.** Don't clean it up, recolour it, crop it or trace over it.
5. **Place it** — end card by default, with its isolation zone clear.

**One judgement call worth making silently:** if what arrives is obviously not an official file
— a screenshot, a photo of a sign, something with a white box around it — say what is wrong and
ask for a better one. Do not use it and do not fix it yourself.
