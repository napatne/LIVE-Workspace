// Types for timeline.mjs, so a scene written in TypeScript can import it.

export type Position = number | string;

export type TimelineJson = {
  fps: number;
  sections: { id: string; frames: number }[];
  transitions?: { after: string; frames: number }[];
  hits?: Record<string, Position>;
  ducks?: { from: Position; to: Position; db?: number }[];
  silences?: { from: Position; to: Position }[];
};

export type Timeline = {
  fps: number;
  /** The film's length in frames. */
  total: number;
  /** The film's length in seconds. */
  duration: number;
  sections: { id: string; start: number; frames: number; end: number }[];
  hits: Record<string, number>;
  ducks: { from: number; to: number; db: number }[];
  silences: { from: number; to: number }[];
  frameOf: (pos: Position) => number;
  seconds: (pos: Position) => number;
  frames: (id: string) => number;
  transitionFrames: (id: string) => number;
  local: (pos: Position, id: string) => number;
};

export declare const resolveTimeline: (raw: TimelineJson, label?: string) => Timeline;
