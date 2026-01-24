/**
 * ASCII Character Sets
 * Ordered by visual density (lightest to darkest)
 */

export const CHAR_SET_DENSE = ' .:-=+*#%@';
export const CHAR_SET_STANDARD = ' .,:;+*?%$#@';
export const CHAR_SET_MINIMAL = ' .:#';
export const CHAR_SET_BLOCK = ' .:@#';

export const CHAR_SETS = {
  dense: CHAR_SET_DENSE,
  standard: CHAR_SET_STANDARD,
  minimal: CHAR_SET_MINIMAL,
  block: CHAR_SET_BLOCK,
} as const;

export type CharSetName = keyof typeof CHAR_SETS;

/**
 * Map brightness (0-1) to character
 */
export function brightnessToChar(brightness: number, charSet: string): string {
  const clamped = Math.max(0, Math.min(1, brightness));
  const index = Math.floor(clamped * (charSet.length - 1));
  return charSet[index];
}

/**
 * Map luminance to character (direct mapping)
 */
export function luminanceToChar(luminance: number, charSet: string): string {
  return brightnessToChar(luminance, charSet);
}
