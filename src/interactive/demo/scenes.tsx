import type { ReactNode } from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { OptionButton, useAnswers, useChoice } from "../kit/choice";
import { DEMO_LABELS, DEMO_SEGMENTS } from "./segments";

/**
 * The demo's scenes. Plain on purpose - the look of a real film comes from its
 * style card (choosing-a-visual-style), not from here. What is worth copying is
 * the shape of AskRoute: the question drawn inside the film, real buttons, and
 * the frame held on the question until it is answered.
 */

const C = { ink: "#191919", paper: "#ffffff", accent: "#1f5fbf", soft: "#e8eef8", mute: "#5c5c5c" };
const FONT = 'Arial, "Helvetica Neue", Helvetica, sans-serif';

const ramp = (frame: number, start: number, end: number) =>
  interpolate(frame, [start, end], [0, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

const framesOf = (id: string) => DEMO_SEGMENTS.find((s) => s.id === id)!.frames;

/**
 * A short fade in and out on every segment, so a cut between segments -
 * including the page's jump over a detour - never pops.
 */
const Shell: React.FC<{ id: string; fadeIn?: boolean; fadeOut?: boolean; children: ReactNode }> = ({
  id,
  fadeIn = true,
  fadeOut = true,
  children,
}) => {
  const frame = useCurrentFrame();
  const frames = framesOf(id);
  const opacity = Math.min(fadeIn ? ramp(frame, 0, 8) : 1, fadeOut ? 1 - ramp(frame, frames - 8, frames) : 1);
  return (
    <AbsoluteFill
      style={{
        background: C.paper,
        color: C.ink,
        fontFamily: FONT,
        opacity,
        justifyContent: "center",
        padding: "0 160px",
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

const Line: React.FC<{ at: number; size: number; color?: string; children: ReactNode }> = ({
  at,
  size,
  color = C.ink,
  children,
}) => {
  const t = ramp(useCurrentFrame(), at, at + 14);
  return (
    <div style={{ fontSize: size, lineHeight: 1.2, color, opacity: t, translate: `0px ${(1 - t) * 20}px`, margin: "12px 0" }}>
      {children}
    </div>
  );
};

const Intro: React.FC = () => (
  <Shell id="intro" fadeIn={false}>
    <Line at={0} size={96}>
      An interactive film
    </Line>
    <Line at={10} size={44} color={C.mute}>
      The interactive kit&apos;s own demo: one question, one detour.
    </Line>
  </Shell>
);

const HOLD = DEMO_SEGMENTS.find((s) => s.id === "ask-route")!.ask!.holdAt;

const AskRoute: React.FC = () => {
  const raw = useCurrentFrame();
  const { answer } = useChoice("route");
  // A live Player can run a frame or two past the hold before it pauses; the
  // scene keeps showing the hold frame until there is an answer.
  const frame = answer ? raw : Math.min(raw, HOLD);
  const cards = ramp(frame, 20, 40);
  const decided = ramp(frame, HOLD + 4, HOLD + 20);

  return (
    <Shell id="ask-route">
      <Line at={0} size={84}>
        Which way?
      </Line>
      <div style={{ display: "flex", gap: 48, marginTop: 40, opacity: cards }}>
        {(["short", "long"] as const).map((option) => {
          const chosen = answer === option;
          const dimmed = answer !== null && !chosen;
          return (
            <OptionButton key={option} choice="route" option={option} label={DEMO_LABELS[option]}>
              {({ hover, focus }) => (
                <div
                  style={{
                    width: 640,
                    padding: "48px 56px",
                    borderRadius: 24,
                    background: chosen || hover ? C.accent : C.soft,
                    color: chosen || hover ? C.paper : C.ink,
                    // A visible focus ring: the buttons are reachable by Tab and Enter.
                    outline: focus ? `8px solid ${C.ink}` : "none",
                    outlineOffset: 6,
                    opacity: dimmed ? 1 - 0.6 * decided : 1,
                    fontSize: 56,
                    textAlign: "left",
                  }}
                >
                  {option === "short" ? "The short way" : "The long way"}
                </div>
              )}
            </OptionButton>
          );
        })}
      </div>
    </Shell>
  );
};

const DetourLong: React.FC = () => (
  <Shell id="detour-long">
    <Line at={0} size={72}>
      The long way
    </Line>
    <Line at={12} size={44} color={C.mute}>
      This part plays only for that answer. Answer the other way and the film steps over it.
    </Line>
  </Shell>
);

const End: React.FC = () => {
  const answers = useAnswers();
  return (
    <Shell id="end" fadeOut={false}>
      <Line at={0} size={72}>
        You took {DEMO_LABELS[answers.route] ?? "a way"}.
      </Line>
      <Line at={12} size={44} color={C.mute}>
        Go back before the question to choose again.
      </Line>
    </Shell>
  );
};

export const DEMO_SCENES: Record<string, React.FC> = {
  intro: Intro,
  "ask-route": AskRoute,
  "detour-long": DetourLong,
  end: End,
};
