"""
Cut the "and you!" Spider-Man out of its flat background, and take its head off.

Written 2026-09-02 for scene 2's closing gag, which replaces Sparky.

`and you!.png` arrived fully opaque on a flat #EFEFEF field with the film's
paper `Ai` disc pasted on as the figure's head. Two problems:

**1. The disc cannot be keyed around.** Its cream paper is ~#F2EEE6 — a
distance of about 9 from the background in RGB, closer than the background is
to its own compression noise. No tolerance separates them, and a flood fill
leaks through the disc's soft edge and eats it from the inside, fragmenting the
`Ai` into islands. Raising or lowering the tolerance trades one failure for the
other.

**So the head comes off deliberately rather than accidentally.** Everything
inside `HEAD` below is cleared, and the scene places `agents/ai-generic.png` —
the same disc, delivered clean with real alpha — as a separate layer on top.
That is better than a rescued composite: the head becomes something the film
can animate, so scene 2's three marks can fuse into the disc and the disc can
fly over and land as the figure's head. The gag and the fusion become one move
instead of two.

**2. A faint grey smudge runs down the lower-left of the source**, unrelated to
the figure. It is pale and touches the border, so keying on *paleness* rather
than on nearness-to-a-seed-colour removes it in the same pass as the
background.

Small enclosed pale regions — the highlight in the palm, the gaps inside the
webbing — are refilled afterwards, or the figure comes out full of holes.

The alpha edge is feathered by about a pixel. Every other cut-out in this film
has a soft torn fringe; a binary alpha would read as the one pasted element in
a collage of torn paper, which is exactly what it must not do.

    python scripts/key-flat-background.py

Not part of the render. Run once, commit the output, forget it.
"""

from collections import deque

import numpy as np
from PIL import Image, ImageFilter

SRC = "C:/Users/npatne/Downloads/and you!.png"
DST = "public/assets/live-showcase/props/and-you.png"

# The pasted disc, as a circle in the source's own 620x870 pixels, generous
# enough to take the disc's feathered edge with it. Read off the delivered PNG.
HEAD = (272, 110, 78)

# "Pale" — bright and close to neutral. The suit is saturated red and blue and
# its outlines are near-black, so nothing of the figure qualifies.
PALE_LIGHTNESS = 210
PALE_SATURATION = 34

# Enclosed pale regions up to this many pixels are figure, not background.
HOLE_MAX = 4000


def main() -> None:
    im = Image.open(SRC).convert("RGBA")
    rgb = np.asarray(im, dtype=np.int16)[:, :, :3]
    h, w = rgb.shape[:2]

    pale = (rgb.max(axis=2) > PALE_LIGHTNESS) & (
        rgb.max(axis=2) - rgb.min(axis=2) < PALE_SATURATION
    )

    # Flood the pale field inward from the border. Only pale pixels connected to
    # the outside go; a pale island in the middle of the figure stays for now.
    outside = np.zeros((h, w), dtype=bool)
    q = deque()

    def seed(y: int, x: int) -> None:
        if pale[y, x] and not outside[y, x]:
            outside[y, x] = True
            q.append((y, x))

    for x in range(w):
        seed(0, x)
        seed(h - 1, x)
    for y in range(h):
        seed(y, 0)
        seed(y, w - 1)

    while q:
        y, x = q.popleft()
        for ny, nx in ((y - 1, x), (y + 1, x), (y, x - 1), (y, x + 1)):
            if 0 <= ny < h and 0 <= nx < w and pale[ny, nx] and not outside[ny, nx]:
                outside[ny, nx] = True
                q.append((ny, nx))

    # Give back the small enclosed pale islands the pass above left behind —
    # they are highlights and web gaps, not background.
    keep = ~outside
    islands = pale & keep
    seen = islands.copy()
    for sy in range(h):
        for sx in range(w):
            if not seen[sy, sx]:
                continue
            blob = []
            stack = [(sy, sx)]
            seen[sy, sx] = False
            while stack:
                y, x = stack.pop()
                blob.append((y, x))
                for ny, nx in ((y - 1, x), (y + 1, x), (y, x - 1), (y, x + 1)):
                    if 0 <= ny < h and 0 <= nx < w and seen[ny, nx]:
                        seen[ny, nx] = False
                        stack.append((ny, nx))
            if len(blob) > HOLE_MAX:
                # Too big to be a highlight. The disc's remains land here.
                for y, x in blob:
                    keep[y, x] = False

    # And take the head off outright.
    cx, cy, r = HEAD
    ys, xs = np.ogrid[:h, :w]
    keep &= (xs - cx) ** 2 + (ys - cy) ** 2 > r * r

    alpha = Image.fromarray(np.where(keep, 255, 0).astype(np.uint8), mode="L")
    alpha = alpha.filter(ImageFilter.GaussianBlur(0.8))

    im.putalpha(alpha)
    im.save(DST)

    print(f"{SRC} -> {DST}")
    print(f"  kept {int(keep.sum())} of {h * w} px ({100 * keep.sum() / (h * w):.1f}%)")
    print(f"  head cleared at {HEAD}")


if __name__ == "__main__":
    main()
