import { loadFont as loadOswald } from "@remotion/google-fonts/Oswald";
import { Img } from "remotion";
import { ARM_PIVOT, asset, GEOMETRY } from "./Paper";
import { COLORS, HEIGHT } from "./theme";

/**
 * The clapboard prop, assembled from its two delivered files and hinged on the
 * arm's own registration mark. The beat that drives it lives in
 * `SlateScene.tsx`; this component only positions the body, slug and arm.
 */

const { fontFamily: slugFont } = loadOswald("normal", { weights: ["700"] });

/**
 * The arm's open angle. Negative is counter-clockwise about the hinge.
 * Shallower than the first pass so more of the open arm stays inside frame.
 */
export const ARM_OPEN = -34;

/**
 * The slate's first blank information row, measured as fractions of the
 * visible slate height. The slug sits here so the ruled lines frame it.
 */
const SLUG_ROW = { top: 0.688, bottom: 0.792 };

/**
 * The board's played size. The clapboard is an object, not a full-frame cover;
 * the frosted background in `SlateScene.tsx` hides the scene swap.
 */
export const BOARD_CONTENT_W = 1020;

const ARM_OVERHANG = 1.03;

const BODY_G = GEOMETRY["props/clapboard-body.png"];
const ARM_G = GEOMETRY["props/clapboard-arm.png"];

const BOARD_SLATE_H = (BOARD_CONTENT_W / BODY_G.content[2]) * BODY_G.content[3];
const BOARD_ARM_H =
  ((BOARD_CONTENT_W * ARM_OVERHANG) / ARM_G.content[2]) * ARM_G.content[3];
const BOARD_SLATE_TOP =
  (HEIGHT - (BOARD_SLATE_H + BOARD_ARM_H)) / 2 + BOARD_ARM_H;

/** The board's resting centre, in page coordinates. */
export const BOARD_CENTER_Y = BOARD_SLATE_TOP + BOARD_SLATE_H * 0.5;
export const BOARD_BOTTOM_Y = BOARD_SLATE_TOP + BOARD_SLATE_H;

/** The hinge, in page coordinates: the point the arm rotates about. */
const hingePoint = (contentWidth: number, centerX: number, centerY: number) => {
  const sb = contentWidth / BODY_G.content[2];
  const contentH = BODY_G.content[3] * sb;
  const slateLeft = centerX - contentWidth / 2;
  const slateTop = centerY - contentH / 2;
  const sa = (contentWidth * ARM_OVERHANG) / ARM_G.content[2];

  return {
    x: slateLeft + contentWidth * 0.022,
    y: slateTop - ARM_G.content[3] * sa * 0.5,
  };
};

export const Clapboard: React.FC<{
  contentWidth: number;
  centerX: number;
  centerY: number;
  armAngle: number;
  slugText: string;
}> = ({ contentWidth, centerX, centerY, armAngle, slugText }) => {
  const body = BODY_G;
  const arm = ARM_G;

  const sb = contentWidth / body.content[2];
  const bodyW = body.box[0] * sb;
  const bodyH = body.box[1] * sb;
  const contentH = body.content[3] * sb;

  const slateLeft = centerX - contentWidth / 2;
  const slateTop = centerY - contentH / 2;
  const bodyLeft = slateLeft - body.content[0] * sb;
  const bodyTop = slateTop - body.content[1] * sb;

  const armContentW = contentWidth * ARM_OVERHANG;
  const sa = armContentW / arm.content[2];
  const armW = arm.box[0] * sa;
  const armH = arm.box[1] * sa;

  const pivotX = ARM_PIVOT.x * armW;
  const pivotY = ARM_PIVOT.y * armH;
  const hinge = hingePoint(contentWidth, centerX, centerY);

  return (
    <>
      <Img
        name="Clapboard body"
        src={asset("props/clapboard-body.png")}
        style={{
          position: "absolute",
          left: bodyLeft,
          top: bodyTop,
          width: bodyW,
          height: bodyH,
        }}
        from={-4}
      />
      <div
        style={{
          position: "absolute",
          left: slateLeft,
          top: slateTop + contentH * SLUG_ROW.top,
          width: contentWidth,
          height: contentH * (SLUG_ROW.bottom - SLUG_ROW.top),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: slugFont,
          fontWeight: 700,
          fontSize: contentH * 0.058,
          letterSpacing: contentH * 0.009,
          color: COLORS.paper,
        }}
      >
        {slugText}
      </div>
      <Img
        name="Clapboard arm"
        src={asset("props/clapboard-arm.png")}
        style={{
          position: "absolute",
          left: hinge.x - pivotX,
          top: hinge.y - pivotY,
          width: armW,
          height: armH,
          transformOrigin: `${ARM_PIVOT.x * 100}% ${ARM_PIVOT.y * 100}%`,
          rotate: `${armAngle}deg`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: hinge.x - (77 * (armW / arm.box[0]) * 1.18) / 2,
          top: hinge.y - (77 * (armW / arm.box[0]) * 1.18) / 2,
          width: 77 * (armW / arm.box[0]) * 1.18,
          height: 77 * (armW / arm.box[0]) * 1.18,
          borderRadius: "50%",
          backgroundColor: COLORS.ink,
        }}
      />
    </>
  );
};
