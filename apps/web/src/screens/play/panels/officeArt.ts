/**
 * Office art map - ties each Office (and therefore each Face) to its Die-rector
 * portrait SVG, a semantic color, and the Bone shape that reveals it. Used by the
 * Bones/Faces run-loop panels to dogfood the high-fidelity portrait assets.
 */
import type { DataBadgeColor } from '@neverdieguy/ui';
import { tokens } from '../../../theme';

const PORTRAIT_BASE = '/assets/characters/portraits/60px-hifi';

/** Office id -> Die-rector portrait SVG. */
export const OFFICE_PORTRAIT: Record<number, string> = {
  1: `${PORTRAIT_BASE}/pantheon-portrait-theone-01.svg`, // Favor / The One
  2: `${PORTRAIT_BASE}/pantheon-portrait-john-01.svg`,   // Graveyard / John
  3: `${PORTRAIT_BASE}/pantheon-portrait-peter-01.svg`,  // Death / Peter
  4: `${PORTRAIT_BASE}/pantheon-portrait-robert-01.svg`, // Myth / Robert
  5: `${PORTRAIT_BASE}/pantheon-portrait-alice-01.svg`,  // Archive / Alice
  6: `${PORTRAIT_BASE}/pantheon-portrait-jane-01.svg`,   // Corruption / Jane
};

/** Office id -> DataBadge semantic color (not rarity). */
export const OFFICE_BADGE_COLOR: Record<number, DataBadgeColor> = {
  1: 'secondary', // Favor
  2: 'success',   // Graveyard
  3: 'primary',   // Death
  4: 'warning',   // Myth
  5: 'primary',   // Archive
  6: 'error',     // Corruption
};

/** Office id -> raw accent hex for borders/glows. */
export const OFFICE_ACCENT: Record<number, string> = {
  1: tokens.colors.secondary,
  2: tokens.colors.success,
  3: tokens.colors.info,
  4: tokens.colors.warning,
  5: tokens.colors.primary,
  6: tokens.colors.error,
};

/** Bone polygon sides supported by DiceShape. */
export type BoneSides = 4 | 6 | 8 | 10 | 12 | 20;

/**
 * Office id -> Bone shape (polygon sides) that reveals this Office's Face.
 * Gives each Office a distinct Bone silhouette in the reveal strip.
 */
export const OFFICE_BONE_SIDES: Record<number, BoneSides> = {
  1: 8,  // octagon
  2: 4,  // triangle
  3: 20, // d20 octagon-star
  4: 6,  // diamond
  5: 10, // pentagon
  6: 12, // decagon
};
