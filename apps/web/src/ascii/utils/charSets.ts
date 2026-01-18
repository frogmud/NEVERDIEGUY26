/**
 * ASCII Character Sets
 *
 * Character arrays ordered by visual density (lightest to darkest).
 * Used for brightness-to-character mapping.
 */

/** Dense gradient - good for detailed formations like the skull */
export const CHAR_SET_DENSE = ' .:-=+*#%@';

/** Standard ASCII art gradient */
export const CHAR_SET_STANDARD = ' .,:;+*?%$#@';

/** Minimal set - high performance, blocky look */
export const CHAR_SET_MINIMAL = ' .:#';

/** Block characters - pixel-perfect retro aesthetic */
export const CHAR_SET_BLOCK = ' .:@#';

/** Death/explosion effects */
export const CHAR_SET_DEATH = 'X+*@#';

/** Spark/particle effects */
export const CHAR_SET_SPARK = '*+.';

/** Score/number display */
export const CHAR_SET_SCORE = '0123456789';

/**
 * Map a brightness value (0-1) to a character from the set.
 * 0 = lightest (space), 1 = darkest (last char)
 */
export function brightnessToChar(
  brightness: number,
  charSet: string = CHAR_SET_DENSE
): string {
  const clamped = Math.max(0, Math.min(1, brightness));
  const index = Math.floor(clamped * (charSet.length - 1));
  return charSet[index];
}

/**
 * Get character for a given luminance (inverse of brightness).
 * White (1.0 luminance) -> darkest char
 * Black (0.0 luminance) -> space
 */
export function luminanceToChar(
  luminance: number,
  charSet: string = CHAR_SET_DENSE
): string {
  // Luminance maps directly to character density
  return brightnessToChar(luminance, charSet);
}
