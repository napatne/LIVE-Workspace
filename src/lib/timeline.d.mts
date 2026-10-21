// Types for timeline.mjs, so a scene written in TypeScript can import it.

/** A frame number, or a name with an optional offset: "theme", "theme.end", "title", "theme+60", "close - 12", "end". */
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
  /** The film's length in frames - also what the position "end" resolves to, one past the last frame. */
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

/**
 * Resolve a timeline JSON. Throws on anything it would otherwise have to guess:
 * an id called "end" or ending in "-<digits>", duplicate or colliding ids, a
 * transition after an unknown or the last section, a hit outside [0, total - 1],
 * a duck or silence outside [0, total] or running backwards.
 */
export declare const resolveTimeline: (raw: TimelineJson, label?: string) => Timeline;
