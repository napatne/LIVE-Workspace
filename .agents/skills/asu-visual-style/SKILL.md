---
name: asu-visual-style
description: ASU brand colours, typography, logo rules and accessibility standards for video and images, with every value cited and dated. Use before choosing any colour, font, type size or caption style, before placing a logo, and before deciding whether a visual needs describing - and read its accessibility file whichever visual style was chosen.
---

# ASU Visual Style

**Use this when** the brand route was chosen in `choosing-a-visual-style`, or when any specific
colour, typeface, size or logo placement has to be settled.

**You need first** confirmation that the person actually asked for ASU branding. An `asu.edu`
address is not that confirmation.

**This produces** values that can be defended, each traceable to a published source.

**Then go to** `creating-assets`, or back to whatever was being built.

**Read `accessibility.md` even if the brand was declined.** Contrast, captions and describing
visuals are not brand decisions.

---

Every video and image made in this project follows ASU's brand and accessibility standards.
This skill carries the verified values so nobody has to guess, and nobody invents their own
palette.

**All values here were checked against ASU's own published guides on 2026-09-19.** They will
age — brand guides change. The sources are listed at the bottom of each file; check them
before relying on anything that matters.

## The six things you cannot get wrong

1. **Maroon `#8C1D40` and gold `#FFC627`.** These are the brand. Don't approximate them.
2. **Gold is a fill, never text on a light background.** Gold on pure white is **1.57:1**; on
   our `#FBF9F4` background it is **1.49:1**. Both are far under the 4.5:1 floor — ASU bans it
   outright, and the maths says it is close to invisible.
3. **Arial.** ASU's brand guide names it and says *"do not use any additional fonts."*
   Not Roboto, not Inter. It is a system font, so there is nothing to load.
4. **Captions.** ASU requires them on new recorded video shown to students, employees or
   the public, and says to *aim for 95% accuracy or higher*. Raw auto-captions do not qualify.
5. **4.5:1 minimum contrast** for text. WCAG 2.1 level AA is ASU's stated standard for all
   digital content.
6. **Never recreate the ASU logo.** Not in SVG, not in code, not from memory. It comes from an
   official PNG or it does not appear. This project draws everything else in code — the logo is
   the exception. See [logo.md](logo.md).

## Where the files are

Every file named below sits beside this one, in `.agents/skills/asu-visual-style/`. Read them
from there. Not finding an installed skill by this name is not permission to work from memory —
that is exactly the failure this exists to prevent.


## Read the one you need

| File | When |
| --- | --- |
| [color.md](color.md) | Choosing any colour. Has the full palette, every contrast ratio, and the four banned combinations. |
| [typography.md](typography.md) | Choosing a font, size, weight or spacing. |
| [accessibility.md](accessibility.md) | Captions, describing visuals, motion, and how to check contrast yourself. |
| [logo.md](logo.md) | **Before placing an ASU logo in anything.** Clear space, minimum size, and what is forbidden. |
| [starter-theme.md](starter-theme.md) | **Start here when writing code.** Every value above as one copy-paste block. |

## What this skill does not claim

It **follows** ASU's published standards. It does not certify anything as ASU-approved, and
you should not tell anyone their video is "ASU compliant" — that is a claim someone can check,
and accessibility compliance covers more than colour and captions.

Say what was done: *"captions are on, and the colours meet AA contrast."* Let someone with
authority decide whether that clears their bar.

## When ASU style applies

Only when the person wants it. Someone outside ASU, or making something personal, should not
have maroon and gold imposed on them. The `building-a-video` skill asks them directly.

**If they said no**, use a neutral palette and ignore everything here except the accessibility
rules in [accessibility.md](accessibility.md) — contrast, captions and describing visuals are
not ASU-specific, they are what makes a video usable at all.

## Sources

- ASU colour palette — <https://brandguide.asu.edu/brand-elements/design/color>
- ASU fonts and typography — <https://brandguide.asu.edu/brand-elements/design/fonts>
- ASU accessible typography — <https://accessibility.asu.edu/articles/typography>
- ASU video captioning guidelines — <https://accessibility.asu.edu/articles/video>
- ASU video and audio accessibility — <https://accessibility.asu.edu/video-audio-content-accessibility>
- ASU logo — <https://brandguide.asu.edu/brand-elements/logos/asu-logo>
- ASU unit logos and marks — <https://brandguide.asu.edu/brand-elements/logos/units>
