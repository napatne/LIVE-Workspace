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
// TransitionSeries does, so it shortens the film by its own length. It must
// name a section that has another one after it.
//
// A position is a frame number, or a name with an optional offset in frames:
// "theme" (where a section starts), "theme.end" (one past its last frame),
// "title" (a hit), "theme+60", "reveal-15", "reveal - 15", or "end" (one past
// the last frame of the film - the frame count, so a duck or silence can run to
// it, but a hit cannot sit on it).
//
// The rule that keeps a name and an offset apart: a section or hit id is
// letters, digits, "_" and "-", and may not END in "-<digits>". So in a
// position, a trailing "-<digits>" is always an offset, with or without spaces:
// "close-12" and "close - 12" both mean twelve frames before close, and
// "title-card" is a name. An id such as "when-1" is refused where it is
// declared, because every position naming it would read as "when" minus 1.
//
// The resolver refuses, rather than guesses, when:
//   - a section or hit is called "end" (that name means the end of the film)
//   - an id ends in "-<digits>", or holds anything but letters, digits, _ and -
//   - two sections share an id, or a hit shares a section's id
//   - a transition names an unknown section, or the last one
//   - a hit falls outside the film: [0, total - 1]
//   - a duck or silence runs outside [0, total], or its "from" is after its "to"

const ID = /^[A-Za-z0-9_-]+$/;
const ENDS_IN_OFFSET = /-\d+$/;
// name, optional ".end", optional offset. The name is lazy so that a trailing
// "-<digits>" goes to the offset; ids can never end that way (checked below).
const POSITION = /^([A-Za-z0-9_-]+?)(\.end)?(?:\s*([+-])\s*(\d+))?$/;

export const resolveTimeline = (raw, label = "timeline") => {
  const fail = (msg) => {
    throw new Error(`${label}: ${msg}`);
  };
  const fps = raw.fps;
  if (!Number.isFinite(fps) || fps <= 0) fail(`"fps" must be a number.`);
  if (!Array.isArray(raw.sections) || !raw.sections.length) fail("needs at least one section.");

  const hitSpecs = raw.hits ?? {};
  const checkId = (id, kind) => {
    if (typeof id !== "string" || !ID.test(id)) {
      fail(`the ${kind} id ${JSON.stringify(id)} may hold only letters, digits, "_" and "-".`);
    }
    if (id === "end") fail(`a ${kind} cannot be called "end" - that name means the end of the film. Call it "end-card", "outro" or similar.`);
    if (ENDS_IN_OFFSET.test(id)) {
      fail(`the ${kind} id "${id}" ends in "-<digits>", so every position naming it would read as "${id.replace(ENDS_IN_OFFSET, "")}" with an offset. Rename it ("${id.replace(/-(\d+)$/, "$1")}" or "${id.replace(/-(\d+)$/, "-n$1")}").`);
    }
  };

  const byId = {};
  for (const s of raw.sections) {
    checkId(s.id, "section");
    if (byId[s.id]) fail(`two sections are called "${s.id}".`);
    if (!Number.isInteger(s.frames) || s.frames <= 0) fail(`section "${s.id}" needs a whole, positive number of frames.`);
    byId[s.id] = true;
  }
  for (const h of Object.keys(hitSpecs)) {
    checkId(h, "hit");
    if (byId[h]) fail(`"${h}" is both a section and a hit. Give the hit its own name.`);
  }

  const overlap = {};
  const lastId = raw.sections[raw.sections.length - 1].id;
  for (const t of raw.transitions ?? []) {
    if (!byId[t.after]) fail(`a transition is after "${t.after}", which is not a section.`);
    if (t.after === lastId) fail(`a transition is after "${t.after}", the last section - there is nothing for it to lead into.`);
    if (overlap[t.after] !== undefined) fail(`two transitions are after "${t.after}".`);
    overlap[t.after] = t.frames;
  }

  let cursor = 0;
  const sections = raw.sections.map((s, i) => {
    const start = cursor;
    cursor += s.frames;
    if (i < raw.sections.length - 1) cursor -= overlap[s.id] ?? 0;
    return { id: s.id, start, frames: s.frames, end: start + s.frames };
  });
  const total = sections[sections.length - 1].end;
  for (const s of sections) byId[s.id] = s;

  const resolving = new Set();
  const hitFrame = (name) => {
    if (resolving.has(name)) fail(`the hit "${name}" refers to itself.`);
    resolving.add(name);
    const f = frameOf(hitSpecs[name]);
    resolving.delete(name);
    return f;
  };
  const frameOf = (pos) => {
    if (typeof pos === "number") return pos;
    const m = String(pos).trim().match(POSITION);
    if (!m) fail(`cannot read the position "${pos}".`);
    const [, name, dotEnd, sign, amount] = m;
    let base;
    if (name === "end") {
      if (dotEnd) fail(`cannot read the position "${pos}" - "end" is already the end of the film.`);
      base = total;
    } else if (byId[name]) {
      base = dotEnd ? byId[name].end : byId[name].start;
    } else if (Object.hasOwn(hitSpecs, name)) {
      if (dotEnd) fail(`cannot read the position "${pos}" - "${name}" is a hit, and only a section has an end.`);
      base = hitFrame(name);
    } else {
      fail(`"${name}" is not a section or a hit (in the position "${pos}").`);
    }
    return base + (sign ? (sign === "+" ? 1 : -1) * Number(amount) : 0);
  };

  const hits = {};
  for (const h of Object.keys(hitSpecs)) {
    const f = hitFrame(h);
    if (f < 0 || f > total - 1) {
      fail(`the hit "${h}" (${JSON.stringify(hitSpecs[h])}) is frame ${f}, outside the film's frames 0-${total - 1}.`);
    }
    hits[h] = f;
  }

  const span = (kind, i, d) => {
    const from = frameOf(d.from);
    const to = frameOf(d.to);
    const where = `${kind} ${i + 1} (${JSON.stringify(d.from)} to ${JSON.stringify(d.to)})`;
    if (from < 0 || to > total) fail(`${where} is frames ${from}-${to}, outside the film's 0-${total}.`);
    if (from > to) fail(`${where} starts at frame ${from}, after it ends at ${to}.`);
    return { from, to };
  };

  return {
    fps,
    total,
    duration: total / fps,
    sections,
    hits,
    ducks: (raw.ducks ?? []).map((d, i) => ({ ...span("duck", i, d), db: d.db ?? -10 })),
    silences: (raw.silences ?? []).map((s, i) => span("silence", i, s)),
    frameOf,
    seconds: (pos) => frameOf(pos) / fps,
    /** A section's length in frames - for a scene's durationInFrames. */
    frames: (id) => {
      if (!byId[id]) fail(`no section "${id}".`);
      return byId[id].frames;
    },
    /** The transition after a section, in frames (0 if none). */
    transitionFrames: (id) => overlap[id] ?? 0,
    /** A position as a frame inside a section - for a scene that counts from its own frame 0. */
    local: (pos, id) => {
      if (!byId[id]) fail(`no section "${id}".`);
      return frameOf(pos) - byId[id].start;
    },
  };
};
