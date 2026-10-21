// The delivery standard: one place for the loudness every finished film goes out
// at, so the script that sets it and the script that checks it cannot disagree.
//
//   import { DELIVERY_LUFS, DELIVERY_TRUE_PEAK_DB } from "./lib/delivery.mjs";
//
// Read by scripts/finish-video.mjs (which applies the targets),
// scripts/check-render.mjs (which measures against them) and
// scripts/score/lib/render.mjs (which levels a score toward them).
//
// A TARGET is what a script aims for when it sets the level. A TOLERANCE is how
// far a measurement may sit from the target before a check mentions it. They
// are different numbers on purpose: loudnorm lands within a fraction of a LU of
// its target, not exactly on it, and a check that flagged every 0.2 LU would
// cry wolf on every finished film. A measurement outside the tolerance means
// the file was not finished, or something changed after it was.

/** Integrated loudness every delivered film is set to, in LUFS. */
export const DELIVERY_LUFS = -14;

/**
 * The true-peak ceiling the finishing step aims under, in dBTP. A little under
 * the usual -1.5 because AAC overshoots a hot master on decode: at 192 kbps the
 * encoder alone added 1.4 dB of true peak to the transients, at 320 kbps 0.2 dB
 * (measured 2026-10-19).
 */
export const DELIVERY_TRUE_PEAK_DB = -2;

/** How far integrated loudness may sit from DELIVERY_LUFS before a check notes it, in LU. */
export const LUFS_TOLERANCE = 1;

/**
 * How far above DELIVERY_TRUE_PEAK_DB a measured true peak may sit before a
 * check notes it, in dB. The AAC encode after finishing can add a few tenths,
 * so a finished file can read slightly over the target and still be safe;
 * past -1 dBTP it can clip once someone else re-encodes it.
 */
export const TRUE_PEAK_TOLERANCE_DB = 1;
