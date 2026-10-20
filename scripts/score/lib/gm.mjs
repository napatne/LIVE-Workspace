// General MIDI names, so a score says "flute" rather than 73.
//
// Every General MIDI SoundFont - GeneralUser GS included - puts the same
// instrument at the same program number, which is what makes a score file
// portable: it opens in MuseScore with the right instruments, and renders here
// with real sampled ones. Program numbers are 0-based, as MIDI sends them.

export const INSTRUMENTS = {
  piano: 0, "bright piano": 1, "electric piano": 4, harpsichord: 6, celesta: 8,
  glockenspiel: 9, "music box": 10, vibraphone: 11, marimba: 12, xylophone: 13,
  "tubular bells": 14, "church organ": 19, "reed organ": 20, accordion: 21, harmonica: 22,
  "nylon guitar": 24, "steel guitar": 25, "jazz guitar": 26, "electric guitar": 27,
  "acoustic bass": 32, "electric bass": 33, "fretless bass": 35, "synth bass": 38,
  violin: 40, viola: 41, cello: 42, contrabass: 43, "tremolo strings": 44,
  "pizzicato strings": 45, harp: 46, timpani: 47, strings: 48, "slow strings": 49,
  "synth strings": 50, choir: 52, "voice oohs": 53,
  trumpet: 56, trombone: 57, tuba: 58, "muted trumpet": 59, "french horn": 60, brass: 61,
  "soprano sax": 64, "alto sax": 65, "tenor sax": 66, oboe: 68, "english horn": 69,
  bassoon: 70, clarinet: 71, piccolo: 72, flute: 73, recorder: 74, "pan flute": 75,
  "blown bottle": 76, shakuhachi: 77, whistle: 78, ocarina: 79,
  "warm pad": 89, "choir pad": 91, "halo pad": 94,
  sitar: 104, banjo: 105, shamisen: 106, koto: 107, kalimba: 108, bagpipe: 109,
  fiddle: 110, shanai: 111, "steel drums": 114, woodblock: 115, taiko: 116,
  "melodic tom": 117, "reverse cymbal": 119, "fret noise": 120, "breath noise": 121,
  seashore: 122, birds: 123, applause: 126,
};

// Percussion lives on MIDI channel 10 (index 9), one sound per key.
export const DRUMS = {
  kick: 36, "side stick": 37, snare: 38, clap: 39, "snare rim": 40,
  "low tom": 41, "closed hat": 42, "floor tom": 43, "pedal hat": 44, "mid tom": 47,
  "open hat": 46, "high tom": 50, crash: 49, ride: 51, "ride bell": 53, tambourine: 54,
  splash: 55, cowbell: 56, "bongo high": 60, "bongo low": 61, "conga mute": 62,
  "conga high": 63, "conga low": 64, "timbale high": 65, "timbale low": 66,
  cabasa: 69, maracas: 70, guiro: 73, claves: 75, "woodblock high": 76,
  "woodblock low": 77, "triangle mute": 80, triangle: 81,
};

export const program = (name) => {
  if (typeof name === "number") return name;
  const p = INSTRUMENTS[name.toLowerCase()];
  if (p === undefined) {
    throw new Error(`No General MIDI instrument called "${name}". Known: ${Object.keys(INSTRUMENTS).join(", ")}`);
  }
  return p;
};

export const drumKey = (name) => {
  if (typeof name === "number") return name;
  const k = DRUMS[name.toLowerCase()];
  if (k === undefined) throw new Error(`No drum called "${name}". Known: ${Object.keys(DRUMS).join(", ")}`);
  return k;
};
