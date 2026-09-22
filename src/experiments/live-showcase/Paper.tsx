import { Img, staticFile } from "remotion";
import { COLORS } from "./theme";

/**
 * Paper primitives for the LIVE showcase.
 *
 * The manifest's single biggest saving (§3) is that the reusable kit was
 * generated ONCE in grayscale with alpha, and every colour in the film is
 * applied here in code. Four torn swatches therefore serve as the periwinkle
 * stage in scene 1, the butter patch under the hand, the banner in scene 2, the
 * red slash in scene 5 and the paint sweeps in scene 6. There are no coloured
 * variants on disk and none should be added.
 */

export const asset = (p: string) => staticFile(`assets/live-showcase/${p}`);

/**
 * Measured from the delivered PNGs, not read off the manifest — every one of
 * these files carries transparent padding around its content, and positioning
 * by the box rather than the content is what makes collage drift.
 *
 * `box` is the file's pixel size; `content` is the opaque bounding box within
 * it, as [x, y, w, h]. Verified 2026-09-01 by decoding the alpha channel.
 */
export const GEOMETRY = {
  "texture/torn-swatch-01.png": { box: [1983, 793], content: [71, 141, 1849, 516] },
  "texture/torn-swatch-02.png": { box: [1536, 1024], content: [80, 50, 1386, 909] },
  "texture/torn-swatch-03.png": { box: [736, 2137], content: [111, 51, 513, 2034] },
  "texture/torn-swatch-04.png": { box: [1404, 1120], content: [17, 58, 1365, 1007] },
  "texture/cut-square-01.png": { box: [524, 524], content: [6, 5, 509, 509] },
  "texture/cut-square-02.png": { box: [664, 476], content: [4, 7, 652, 458] },
  "props/clapboard-body.png": { box: [2246, 1497], content: [187, 65, 1883, 1316] },
  "props/clapboard-arm.png": { box: [2161, 901], content: [98, 327, 1963, 212] },
  "hands/thumbs-up.png": { box: [1254, 1254], content: [248, 100, 721, 954] },
  // NOT the same content box as thumbs-up, which Milestone 5 assumes. See the
  // note on ARM_PIVOT's neighbour below.
  "hands/thumbs-down.png": { box: [1254, 1254], content: [231, 195, 821, 829] },
  // Verified 2026-09-02 by decoding the alpha channel, for Scene 2's optical
  // sizing (assets.md §2d).
  //
  // **These three appear in scene 2 and nowhere else** since the film went
  // LLM-agnostic later the same day. They fall, hold, and are consumed by the
  // fusion; everything downstream uses `agents/ai-generic.png` below.
  "agents/claude.png": { box: [729, 729], content: [65, 65, 607, 608] },
  "agents/chatgpt.png": { box: [796, 796], content: [75, 71, 659, 664] },
  "agents/gemini.png": { box: [706, 706], content: [63, 63, 588, 589] },
  // Content already spans the full box on at least one edge — the burst's
  // paint reaches the file's own bounds. Verified 2026-09-02.
  "texture/scribble-01.png": { box: [484, 420], content: [0, 0, 484, 420] },
  // ---------------------------------------------------------------------
  // Measured 2026-09-02 with `scripts/measure-alpha.mjs` — the decoder the
  // rows above were originally produced by, now kept in the repo instead of
  // being rewritten from scratch every scene. It was validated against
  // existing rows before any new one was trusted: `clapboard-arm`,
  // `agents/claude` and `torn-swatch-02` all reproduced.
  //
  // Two people measured `props/storyboard-sheet.png` independently, from
  // different scenes, and got identical numbers. That is the strongest
  // evidence this table has that the method is sound.
  //
  // Scenes 4, 5 and 6 were built in parallel by three agents, so every row
  // they needed was measured here IN ADVANCE and none of them edited this
  // file. Keep doing that: add a row here rather than measuring inline.
  // ---------------------------------------------------------------------
  // Scene 3 — the sheet the hand carries in, and the hand that carries it.
  // Scene 4 crops panels out of the same sheet; see SHEET_PANELS below.
  "props/storyboard-sheet.png": { box: [1900, 1657], content: [42, 33, 1823, 1561] },
  "hands/holding.png": { box: [1138, 1185], content: [148, 114, 775, 943] },
  // **UNUSED since 2026-09-02.** Sparky, scene 2's old closer, replaced by
  // `props/and-you.png` when the director asked for the Spider-Man meme with
  // the Ai face. The file and this row are kept because nothing else measures
  // it and re-deriving the content box costs more than the line does; nothing
  // in the film references it. Delete both together or not at all.
  "props/scene-2-ending.png": { box: [1024, 1536], content: [132, 10, 784, 1506] },
  // Scene 4 — tape across the seams.
  "texture/tape-01.png": { box: [976, 276], content: [3, 7, 966, 260] },
  "texture/tape-02.png": { box: [1000, 360], content: [4, 7, 990, 344] },
  "texture/tape-03.png": { box: [972, 248], content: [5, 4, 960, 234] },
  // Scenes 4 and 6 — the chef-kiss hand, played rotated +90deg so the pinch
  // points up and the arm enters from below.
  "hands/superb.png": { box: [2091, 2091], content: [548, 708, 1059, 637] },
  // Scene 5 — the clapping pair. See the anchor warning below.
  "hands/clap-open.png": { box: [1842, 1842], content: [373, 376, 1098, 1097] },
  "hands/clap-closed.png": { box: [1715, 1715], content: [438, 190, 811, 1292] },
  // Confetti and scraps.
  "texture/scrap-01.png": { box: [404, 360], content: [3, 4, 394, 348] },
  "texture/scrap-02.png": { box: [144, 516], content: [5, 5, 132, 502] },
  "texture/scrap-03.png": { box: [428, 448], content: [4, 6, 416, 434] },
  "texture/scrap-04.png": { box: [392, 580], content: [6, 3, 378, 567] },
  "texture/scrap-05.png": { box: [388, 516], content: [7, 5, 371, 502] },
  "texture/scrap-06.png": { box: [288, 320], content: [6, 4, 273, 307] },
  // Scene 2 uses scribble-01; scribble-02 is the second burst shape.
  "texture/scribble-02.png": { box: [572, 544], content: [3, 0, 569, 544] },
  // -------------------------------------------------------------- 2026-09-02
  // The generic mark, and the film going LLM-agnostic.
  //
  // *"we need to point to a generic ai thus making the system llm agnostic.
  // the idea is we start with dropping the ai llm logos into the screen and
  // then fusing them into this generic logo, thus here on wherever we will see
  // ai agents we will use this generic logo."*
  //
  // So the three branded marks above now appear ONCE, in scene 2, and are
  // consumed by the fusion at the end of it. `agents/ai-generic.png` is what
  // every scene from 3 onward uses. Do not reintroduce a branded mark
  // downstream — the whole point of the change is that the film does not name
  // a vendor.
  //
  // It is torn paper with a red `Ai` and a gold sparkle already printed on it,
  // so like the branded marks it takes NO `tint`; the paper filters exist to
  // colour flat grayscale artwork and would only muddy this.
  "agents/ai-generic.png": { box: [1268, 1241], content: [34, 14, 1204, 1187] },
  // Scene 2's closer, replacing `props/scene-2-ending.png` (Sparky).
  //
  // **Delivered headless on purpose.** The source had the `Ai` disc pasted on
  // as the figure's head, in paper whose cream is a distance of about 9 from
  // the flat background it sat on — unkeyable. `scripts/key-flat-background.py`
  // therefore clears the head outright and the scene lands
  // `agents/ai-generic.png` into the gap as a separate layer, which is what
  // lets the fused mark fly over and BECOME the face. See `HEAD_IN_FILE` in
  // `SceneTwo.tsx` for where the gap is.
  "props/and-you.png": { box: [620, 870], content: [24, 170, 459, 628] },
} as const;

/**
 * Where the six drawn panels sit on `props/storyboard-sheet.png`, as fractions
 * of its CONTENT box — not its file box, and not pixels.
 *
 * Two rows of three, numbered left to right, top row first. **The six panels
 * really are this film's six scenes**: 1 the thumbs-up ask, 2 the three
 * figures, 3 the grid, 4 the strips being stitched, 5 the crossed-out reject,
 * 6 the finished frame with sound. Scene 4 crops panels 1, 2 and 3 out of the
 * sheet as the shots its three agents are composing.
 *
 * Fractions rather than coordinates because the sheet is scaled, translated
 * and tilted differently wherever it appears. Read off the delivered PNG
 * 2026-09-02; the panel boxes are roughly 4:3.
 */
export const SHEET_PANELS: readonly (readonly [number, number])[] = [
  [0.211, 0.251],
  [0.505, 0.254],
  [0.793, 0.267],
  [0.205, 0.656],
  [0.499, 0.658],
  [0.787, 0.667],
];

/**
 * **The clapping pair do NOT share an anchor**, measured 2026-09-02.
 *
 *   clap-open    1098 x 1097 at (373, 376) in an 1842 box
 *   clap-closed   811 x 1292 at (438, 190) in a  1715 box
 *
 * Scene 6 alternates these two poses on a fixed period. Swapped naively at the
 * same box size the hands will jump — the closed pose is much taller and much
 * narrower than the open one, which is what closing a pair of hands actually
 * does, so this is the artwork being right rather than wrong. Place each pose
 * by its own content box with `placeByContent`, pinned at the wrist end (the
 * bottom edge for a hand entering from below), NOT by the file box.
 *
 * This is the same class of defect the note under `ARM_PIVOT` records for the
 * thumbs pair, found the same way, and it is recorded here so Scene 6 does not
 * discover it while animating.
 */

/**
 * The clapboard arm's hinge, as a fraction of its own box.
 *
 * The manifest (§2b) asks for a red `#FF4438` paper circle at the far LEFT end
 * marking the pivot, kept in the delivered PNG because it sits under the body
 * and is never seen. **Verified present 2026-09-01** — a 76×78px red disc whose
 * centroid is at (183.2, 435.8) in the 2161×901 file. These two numbers are
 * that centroid, and they are what the arm rotates around.
 */
export const ARM_PIVOT = { x: 0.0848, y: 0.4837 };

/**
 * Position a piece by its VISIBLE content rather than by its file box.
 *
 * Give the rectangle the torn paper should actually occupy on the 1920x1080
 * page and this returns the style that puts it there, compensating for the
 * file's transparent padding. Supply `width` or `height`; the other follows the
 * content's own aspect so nothing is ever stretched.
 */
export const placeByContent = (
  key: keyof typeof GEOMETRY,
  rect: { left: number; top: number; width?: number; height?: number },
): React.CSSProperties => {
  const g = GEOMETRY[key];
  const [bw, bh] = g.box;
  const [cx, cy, cw, ch] = g.content;

  const scale =
    rect.width !== undefined ? rect.width / cw : (rect.height as number) / ch;

  return {
    position: "absolute",
    left: rect.left - cx * scale,
    top: rect.top - cy * scale,
    width: bw * scale,
    height: bh * scale,
  };
};

/**
 * **Unresolved, for Milestone 5.** The plan makes one continuous rotation from
 * `thumbs-down.png` into `thumbs-up.png` load-bearing for the film's hinge, and
 * says to "verify that anchor holds before building the rest of the scene".
 *
 * Measured 2026-09-01, it does not obviously hold. Both files are 1254x1254,
 * but their opaque content differs in size and position:
 *
 *   thumbs-up    721 x 954 at (248, 100)   content bottom 1054
 *   thumbs-down  821 x 829 at (231, 195)   content bottom 1024
 *
 * A shared wrist anchor would put the wrist at the same fraction of each box.
 * These differ by 125px of content height and 30px of bottom edge, so either
 * the poses were cut to different crops or the wrist genuinely sits elsewhere.
 * This is a measurement, not a judgement about the artwork — the hands may
 * still be the same hand. It means the rotation needs a measured per-pose
 * offset, or the pair needs re-cutting. Not this milestone's problem; recorded
 * so Milestone 5 does not discover it late.
 */

const TINTS = {
  periwinkle: COLORS.periwinkle,
  red: COLORS.red,
  butter: COLORS.butter,
  /** Scene 5's audio track. Means "sound"; see the note on COLORS in theme.ts. */
  green: COLORS.green,
  ink: COLORS.ink,
  paper: COLORS.paper,
  halftone: COLORS.halftone,
};

export type Tint = keyof typeof TINTS;

const filterId = (t: Tint) => `live-tint-${t}`;

/**
 * A gentle unsharp mask, for pieces played much smaller than they were drawn.
 *
 * Added 2026-09-02 for scene 3's storyboard sheet: *"the storyboard image
 * itself feels blurry can we fix that"*. It is 1823px of loose ballpoint played
 * at 640, a 2.85x downscale, and thin pen strokes are exactly what bilinear
 * downsampling loses — measured on a 1:1 crop of a render, not guessed at.
 *
 * The convolution runs AFTER the image has been scaled down, so it sharpens the
 * pixels that actually reach the frame. `preserveAlpha` keeps it off the torn
 * edge, which would otherwise gain a hard fringe — the one thing this film
 * cannot have.
 *
 * The kernel sums to 1, so it changes edge contrast and not overall brightness.
 * Scene 4's film-strip thumbnails will have the same problem; this is why it
 * lives here rather than in `SceneThree.tsx`.
 */
export const SHARPEN_FILTER_ID = "live-sharpen";

/**
 * Paper for the type.
 *
 * **Added 2026-09-02 on a sweeping director note** — *"the text over all looks
 * like out of place so we need the text to be also having paper texture"*. It
 * was the one thing on screen still rendered as pure vector: every other mark
 * in this film is a scan of torn paper with fibre in it and a soft irregular
 * edge, and set type beside that reads as a caption laid over a photograph
 * rather than as part of the collage.
 *
 * Two defects are being introduced deliberately, and both are needed — fixing
 * only one leaves the type looking like clean vector that someone dirtied:
 *
 * 1. **Fibre.** A coarse fractal noise, flattened to a narrow band of greys and
 *    multiplied into the glyph, so the ink is uneven the way ink on a rough
 *    sheet is. Mean is a little under 1, so it darkens very slightly overall —
 *    that is what printing on paper does and it is not worth correcting out.
 * 2. **A deckled edge.** A finer noise displacing the glyph by about two
 *    pixels, so the outline is not laser-straight. Kept small on purpose: past
 *    roughly 3px, Archivo Black's thin counters — the hole in an `e`, the gap
 *    in an `a` — start to close up and the word stops being readable at speed.
 *
 * Built the same way as the tint filters below rather than as a CSS mask over a
 * texture image: one filter on one element, no extra DOM per word, and nothing
 * that needs a second asset fetched at render time.
 *
 * **The noise is seeded and does not move.** `feTurbulence` with a fixed seed
 * is deterministic, so the grain is identical on every frame and every re-render.
 * A per-frame seed would crawl, and crawling grain over static type is the most
 * obvious tell in the world that something is generated.
 *
 * Deliberately NOT applied to two things: the clapboard slug, which is painted
 * on a slate and not on paper, and scene 5's intertitle, which is pastiche of a
 * different medium entirely and is supposed to sit apart from the film's own
 * voice.
 */
export const PAPER_TEXT_FILTER_ID = "live-paper-text";

/**
 * Render once per composition. Defines one filter per palette colour.
 *
 * feFlood floods the tint, feComposite clips it to the source's own alpha (so
 * the torn edge and its feathered fringe survive exactly), and feBlend
 * multiplies it back over the original grayscale — which is what keeps the
 * paper fibre visible instead of producing a flat colour silhouette.
 *
 * An SVG filter rather than a CSS mask on purpose: this applies to a real
 * `<Img>`, so Remotion's asset loading still blocks the frame until the file is
 * decoded. A `mask-image` URL is not tracked and can render a frame early.
 */
export const PaperFilters: React.FC = () => (
  <svg
    width={0}
    height={0}
    style={{ position: "absolute" }}
    aria-hidden
  >
    <defs>
      <filter
        id={SHARPEN_FILTER_ID}
        colorInterpolationFilters="sRGB"
        x="0"
        y="0"
        width="100%"
        height="100%"
      >
        <feConvolveMatrix
          order="3"
          kernelMatrix="0 -0.5 0 -0.5 3 -0.5 0 -0.5 0"
          divisor="1"
          preserveAlpha="true"
        />
      </filter>

      {/* See PAPER_TEXT_FILTER_ID. The region is grown past the glyph box so
          the displaced edge is not clipped flat against it. */}
      <filter
        id={PAPER_TEXT_FILTER_ID}
        colorInterpolationFilters="sRGB"
        x="-6%"
        y="-6%"
        width="112%"
        height="112%"
      >
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.62"
          numOctaves="2"
          seed="11"
          result="edgeNoise"
        />
        <feDisplacementMap
          in="SourceGraphic"
          in2="edgeNoise"
          scale="2.2"
          xChannelSelector="R"
          yChannelSelector="G"
          result="deckled"
        />

        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.34"
          numOctaves="3"
          seed="5"
          result="fibreNoise"
        />
        {/* Flatten the noise to greys just under 1, with roughly a tenth of
            range below it. The alpha row is forced opaque so the composite
            below is clipped by the glyph and not by the noise's own alpha.
            **The first version of this was four octaves at 0.09**, which is a
            feature size of about eleven pixels — grain that coarse does not
            read as paper tooth, it reads as staining, and it was very obvious
            on scene 1's `video?` where white type sits on a dark block.
            Finer and shallower: tooth, not dirt. */}
        <feColorMatrix
          in="fibreNoise"
          type="matrix"
          values="0.18 0.18 0.18 0 0.70
                  0.18 0.18 0.18 0 0.70
                  0.18 0.18 0.18 0 0.70
                  0    0    0    0 1"
          result="fibre"
        />
        <feComposite
          in="fibre"
          in2="deckled"
          operator="in"
          result="fibreInGlyph"
        />
        <feBlend in="fibreInGlyph" in2="deckled" mode="multiply" />
      </filter>

      {(Object.keys(TINTS) as Tint[]).map((t) => (
        <filter
          key={t}
          id={filterId(t)}
          colorInterpolationFilters="sRGB"
          x="0"
          y="0"
          width="100%"
          height="100%"
        >
          <feFlood floodColor={TINTS[t]} result="flood" />
          <feComposite in="flood" in2="SourceAlpha" operator="in" result="solid" />
          <feBlend in="solid" in2="SourceGraphic" mode="multiply" />
        </filter>
      ))}
    </defs>
  </svg>
);

export type ShadowSpec = {
  /** Offset in px. The film's shadows are hard — no blur, ever. */
  x: number;
  y: number;
  opacity: number;
};

/**
 * A piece of paper on the page.
 *
 * `tint` is omitted for anything already carrying its own colour — the
 * photographic hands, the agent marks, the clapboard.
 *
 * The shadow is a `drop-shadow` filter rather than a second offset copy so it
 * follows the torn alpha exactly, and it is passed per frame so it can squash
 * on impact (manifest rule 1: shadows are animated in code, never baked).
 */
export const PaperPiece: React.FC<{
  name: string;
  src: string;
  tint?: Tint;
  shadow?: ShadowSpec;
  /** See SHARPEN_FILTER_ID — for pieces played far smaller than they were drawn. */
  sharpen?: boolean;
  style?: React.CSSProperties;
}> = ({ name, src, tint, shadow, sharpen, style }) => {
  const filters = [
    // Before the tint and the shadow: sharpen the artwork, not the colour cast
    // over it or the shadow it throws.
    sharpen ? `url(#${SHARPEN_FILTER_ID})` : null,
    tint ? `url(#${filterId(tint)})` : null,
    shadow
      ? `drop-shadow(${shadow.x}px ${shadow.y}px 0 rgba(20, 18, 15, ${shadow.opacity}))`
      : null,
  ].filter(Boolean);

  return (
    <Img
      name={name}
      src={asset(src)}
      style={{
        position: "absolute",
        ...(filters.length ? { filter: filters.join(" ") } : {}),
        ...style,
      }}
    />
  );
};
