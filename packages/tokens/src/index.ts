/**
 * @neverdieguy/tokens
 *
 * Canonical design tokens for the Never Die Guy design system (BONES).
 *
 * This is the curated, shareable subset of the tokens that live in the app's
 * theme. Values are sourced from `design-system/tokens/*.json` (the brand's
 * primary source) and verified against the live app theme.
 *
 * Deliberately excluded (these stay app-local in apps/web): game-specific maps
 * such as dice / combo / npc colors, gold/anomaly/stable accents, and the
 * door / promise / role / status / presence / severity config maps. Those are
 * gameplay concerns, not design-system primitives.
 */

/**
 * Brand red stays primary. `info` is the interactive/secondary accent that
 * emerged in BONES for surfaces where a saturated red button would be too loud
 * (links, info states). It is its own token, not a primary rebrand. Final value
 * (blue #3b82f6 vs the legacy cyan secondary #00e5ff) is being settled in the
 * Code Connect reconciliation pass - see docs/ds/reconciliation.md.
 */
export const colors = {
  primary: '#E90441', // pinky red - brand accent
  info: '#3b82f6', // interactive / info accent (provisional, under reconciliation)
  secondary: '#00e5ff', // cyan
  success: '#30d158',
  error: '#ff453a',
  warning: '#ffd60a',
  background: {
    default: '#0a0a0a',
    paper: '#1a1a1a',
    elevated: '#242424',
  },
  text: {
    primary: '#ffffff',
    secondary: 'rgba(255, 255, 255, 0.7)',
    disabled: 'rgba(255, 255, 255, 0.5)',
  },
  border: 'rgba(255, 255, 255, 0.12)',
  // Item rarity ramp (6-tier)
  rarity: {
    common: '#9e9e9e',
    uncommon: '#4caf50',
    rare: '#2196f3',
    epic: '#9c27b0',
    legendary: '#ff9800',
    unique: '#e91e63',
  },
};

/** Spacing scale, in px. */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

/** Border-radius scale, in px. */
export const radius = {
  sm: 4,
  md: 8,
  lg: 12,
};

/** Font families. */
export const fonts = {
  primary: '"Inter", sans-serif',
  mono: '"IBM Plex Mono", monospace',
  gaming: '"m6x11plus", monospace',
};

/** Motion tokens (durations in ms, easing as CSS timing functions). */
export const motion = {
  duration: {
    fast: 150,
    normal: 250,
    slow: 400,
  },
  easing: {
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
    organic: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    bouncy: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
};

/** Aggregate of all tokens, for `import { tokens } from '@neverdieguy/tokens'`. */
export const tokens = {
  colors,
  spacing,
  radius,
  fonts,
  motion,
};

export type Tokens = typeof tokens;
