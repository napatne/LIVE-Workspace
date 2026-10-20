// A film's timeline, resolved: one implementation, read by both the picture and
// the music.
//
// A film with a score keeps its timing in one JSON file. Its Remotion scenes
// import it (through this file) for their lengths and their hit frames; the
// score (scripts/score/) imports it (through this same file) for where every
// cut, hit, duck and silence falls. One file, one resolver: the picture and the
// music cannot disagree about where frame 249 is.
//
// Plain JavaScript with no imports, so Node runs it as-is and Remotion's
// bundler takes it too. Types are in timeline.d.mts beside it.
//
// The JSON:
// {
//   "fps": 30,
//   "sections":    [{ "id": "intro", "frames": 150 }, { "id": "theme", "frames": 300 }],
//   "transitions": [{ "after": "intro", "frames": 15 }],
//   "hits":     { "title": "intro+45", "reveal": "theme" },
//   "ducks":    [{ "from": "theme+60", "to": "theme+150", "db": -10 }],
//   "silences": [{ "from": "reveal-15", "to": "reveal" }]
// }
//
// A transition overlaps the two sections it joins, as Remotion's
// TransitionSeries does, so it shortens the film by its own length.
//
// A position is a frame number, or a name with an optional offset in frames:
// "theme" (where a section starts), "theme.end", "title" (a hit), "theme+60",
// "reveal-15", or "end" (the last frame of the film).

export const resolveTimeline = (raw, label = "timeline") => {
  const fps = raw.fps;
  if (!Number.isFinite(fps) || fps <= 0) throw new Error(`${label}: "fps" must be a number.`);
  if (!Array.isArray(raw.sections) || !raw.sections.length) throw new Error(`${label}: needs at least one section.`);

  const overlap = {};
  for (const t of raw.transitions ?? []) overlap[t.after] = t.frames;
  let cursor = 0;
  const sections = raw.sections.map((s, i) => {
    const start = cursor;
    cursor += s.frames;
    if (i < raw.sections.length - 1) cursor -= overlap[s.id] ?? 0;
    return { id: s.id, start, frames: s.frames, end: start + s.frames };
  });
  const total = sections[sections.length - 1].end;
  const byId = {};
  for (const s of sections) byId[s.id] = s;
  const hitSpecs = raw.hits ?? {};

  const resolving = new Set();
  const frameOf = (pos) => {
    if (typeof pos === "number") return pos;
    // Names may contain hyphens ("title-card"), so the name is matched lazily and
    // an offset must be digits: "close-12" is close minus 12, "title-card" is a name.
    const m = String(pos).trim().match(/^([\w-]+?)(\.end)?\s*(?:([+-])\s*(\d+))?$/);
    if (!m) throw new Error(`${label}: cannot read the position "${pos}".`);
    const [, name, dotEnd, sign, amount] = m;
    let base;
    if (name === "end") base = total;
    else if (byId[name]) base = dotEnd ? byId[name].end : byId[name].start;
    else if (name in hitSpecs) {
      if (resolving.has(name)) throw new Error(`${label}: the hit "${name}" refers to itself.`);
      resolving.add(name);
      base = frameOf(hitSpecs[name]);
      resolving.delete(name);
    } else {
      throw new Error(`${label}: "${name}" is not a section or a hit.`);
    }
    return base + (sign ? (sign === "+" ? 1 : -1) * Number(amount) : 0);
  };

  const hits = {};
  for (const h of Object.keys(hitSpecs)) hits[h] = frameOf(h);

  return {
    fps,
    total,
    duration: total / fps,
    sections,
    hits,
    ducks: (raw.ducks ?? []).map((d) => ({ from: frameOf(d.from), to: frameOf(d.to), db: d.db ?? -10 })),
    silences: (raw.silences ?? []).map((s) => ({ from: frameOf(s.from), to: frameOf(s.to) })),
    frameOf,
    seconds: (pos) => frameOf(pos) / fps,
    /** A section's length in frames - for a scene's durationInFrames. */
    frames: (id) => {
      if (!byId[id]) throw new Error(`${label}: no section "${id}".`);
      return byId[id].frames;
    },
    /** The transition after a section, in frames (0 if none). */
    transitionFrames: (id) => overlap[id] ?? 0,
    /** A position as a frame inside a section - for a scene that counts from its own frame 0. */
    local: (pos, id) => frameOf(pos) - byId[id].start,
  };
};
