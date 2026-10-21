import { Player, type PlayerRef } from "@remotion/player";
import { useRef } from "react";
import { createRoot } from "react-dom/client";
import { useChoicePlayer } from "../../src/interactive/kit/useChoicePlayer";
import { DemoFilm } from "../../src/interactive/demo/DemoFilm";
import { DEMO_FULL, DEMO_LABELS } from "../../src/interactive/demo/segments";

/**
 * The page around the Player. The film draws its own questions; the rules for
 * stopping, remembering, skipping and forgetting are all in useChoicePlayer.
 * What is left here is words and layout - the part to change for a new film.
 *
 * `?rate=3` plays faster, for reviewing. Every rule is frame-based, so speed
 * does not change what happens.
 */
const rate = Number(new URLSearchParams(window.location.search).get("rate")) || 1;
const FPS = 30;

const App: React.FC = () => {
  const player = useRef<PlayerRef>(null);
  const status = useRef<HTMLDivElement>(null);
  const { answers, waitingFor, choices, inputProps, restart } = useChoicePlayer(player, DEMO_FULL, status);

  return (
    <main style={{ maxWidth: 1280, margin: "0 auto", padding: "24px 16px" }}>
      <h1 style={{ fontSize: 22, margin: "0 0 4px" }}>Interactive demo</h1>
      <p style={{ margin: "0 0 14px", color: "#4a4a4a", fontSize: 15 }}>
        Press play and answer the question when the film asks it. Go back before the question to answer it
        again. Nothing you choose leaves this page.
      </p>

      <Player
        ref={player}
        component={DemoFilm}
        inputProps={inputProps}
        durationInFrames={DEMO_FULL.total}
        compositionWidth={1920}
        compositionHeight={1080}
        fps={FPS}
        controls
        playbackRate={rate}
        moveToBeginningWhenEnded={false}
        clickToPlay={false}
        spaceKeyToPlayOrPause={false}
        acknowledgeRemotionLicense
        style={{ width: "100%", aspectRatio: "16 / 9" }}
      />

      {/*
        Also the test hooks for scripts/test-interactive-page.mjs: data-total,
        data-fps, data-waiting and data-answers here; useChoicePlayer adds
        data-frame, data-segment, data-played and data-segments.
      */}
      <div
        ref={status}
        data-answers={JSON.stringify(answers)}
        data-waiting={waitingFor ?? ""}
        data-total={DEMO_FULL.total}
        data-fps={FPS}
        style={{ display: "flex", flexWrap: "wrap", gap: 24, alignItems: "center", marginTop: 12, fontSize: 14 }}
      >
        {choices.map((c) => (
          <span key={c.choice}>
            {DEMO_LABELS[c.choice] ?? c.choice}:{" "}
            <strong>{answers[c.choice] === undefined ? "—" : (DEMO_LABELS[answers[c.choice]] ?? answers[c.choice])}</strong>
          </span>
        ))}
        <span style={{ opacity: 0.6 }}>
          {waitingFor ? `Waiting for your answer: ${DEMO_LABELS[waitingFor] ?? waitingFor}` : ""}
        </span>
        <button type="button" onClick={restart} style={{ marginLeft: "auto" }}>
          Start again
        </button>
      </div>
    </main>
  );
};

createRoot(document.getElementById("root") as HTMLElement).render(<App />);
