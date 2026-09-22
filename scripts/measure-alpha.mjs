/**
 * Measure the opaque content box of a PNG — the rectangle its visible paper
 * actually occupies inside a file that is mostly transparent padding.
 *
 * The LIVE showcase positions every piece by its CONTENT, not its file box
 * (see `Paper.tsx`'s `GEOMETRY` and `placeByContent`). Those numbers were
 * originally produced by a throwaway decoder that was never kept, so each new
 * scene had to rediscover how to get them. This is that decoder, kept.
 *
 *   node scripts/measure-alpha.mjs public/assets/live-showcase/hands/holding.png
 *
 * Prints a line ready to paste into `GEOMETRY`. No dependencies — `zlib` is
 * built into Node. Handles 8-bit truecolour+alpha and greyscale+alpha, which
 * is every file this film ships.
 */
import { readFileSync } from "node:fs";
import { inflateSync } from "node:zlib";

const ALPHA_THRESHOLD = 10;

const paeth = (a, b, c) => {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  return pb <= pc ? b : c;
};

const measure = (file) => {
  const buf = readFileSync(file);
  if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error(`not a PNG: ${file}`);

  const width = buf.readUInt32BE(16);
  const height = buf.readUInt32BE(20);
  const depth = buf[24];
  const colorType = buf[25];
  const interlace = buf[28];

  if (depth !== 8) throw new Error(`${file}: only 8-bit supported, got ${depth}`);
  if (interlace !== 0) throw new Error(`${file}: interlaced PNGs unsupported`);
  if (colorType !== 6 && colorType !== 4)
    throw new Error(`${file}: no alpha channel (colour type ${colorType})`);

  const channels = colorType === 6 ? 4 : 2;
  const stride = width * channels;

  // Concatenate every IDAT chunk before inflating — encoders split them.
  const idat = [];
  let p = 8;
  while (p < buf.length) {
    const len = buf.readUInt32BE(p);
    const type = buf.toString("ascii", p + 4, p + 8);
    if (type === "IDAT") idat.push(buf.subarray(p + 8, p + 8 + len));
    if (type === "IEND") break;
    p += len + 12;
  }
  const raw = inflateSync(Buffer.concat(idat));

  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  let filled = 0;

  const prev = Buffer.alloc(stride);
  const line = Buffer.alloc(stride);

  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)];
    const src = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));

    for (let i = 0; i < stride; i++) {
      const a = i >= channels ? line[i - channels] : 0;
      const b = prev[i];
      const c = i >= channels ? prev[i - channels] : 0;
      const x = src[i];
      line[i] =
        filter === 0 ? x
        : filter === 1 ? (x + a) & 0xff
        : filter === 2 ? (x + b) & 0xff
        : filter === 3 ? (x + ((a + b) >> 1)) & 0xff
        : (x + paeth(a, b, c)) & 0xff;
    }

    for (let x = 0; x < width; x++) {
      if (line[x * channels + channels - 1] > ALPHA_THRESHOLD) {
        filled++;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
    line.copy(prev);
  }

  if (maxX < 0) throw new Error(`${file}: fully transparent`);

  return {
    box: [width, height],
    content: [minX, minY, maxX - minX + 1, maxY - minY + 1],
    filled,
  };
};

const files = process.argv.slice(2);
if (files.length === 0) {
  console.error("usage: node scripts/measure-alpha.mjs <file.png> [...]");
  process.exit(1);
}

for (const file of files) {
  const { box, content, filled } = measure(file);
  const key = file.replace(/.*live-showcase\//, "").split(String.fromCharCode(92)).join("/");
  console.log(
    `  "${key}": { box: [${box}], content: [${content}] },` +
      `   // ${filled.toLocaleString()} filled px, sqrt ${Math.sqrt(filled).toFixed(1)}`,
  );
}
