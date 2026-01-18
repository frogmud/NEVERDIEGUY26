/**
 * Die-rector Favor System
 *
 * Items are eternal treasures collected by Die-rectors, not combat stat sticks.
 * Giving preferred items to Die-rectors earns favor, which provides bonuses.
 * Disliked items reduce favor. Favor affects combat multipliers and NPC relationships.
 */

// Element type matches wiki/types.ts but defined locally to avoid cross-package imports
export type Element = 'Fire' | 'Ice' | 'Earth' | 'Wind' | 'Death' | 'Void';

// ============================================
// Configuration
// ============================================

export interface FavorConfig {
  // Favor range
  minFavor: number;           // -100
  maxFavor: number;           // 100

  // Favor gain/loss from items
  preferredItemFavor: number;       // +15 per preferred item
  dislikedItemFavor: number;        // -10 per disliked item
  preferredElementFavor: number;    // +8 per matching element
  preferredCategoryFavor: number;   // +5 per matching category

  // Bonuses at different favor levels
  favorBonusThresholds: {
    friendly: number;      // 25+ favor
    allied: number;        // 50+ favor
    devoted: number;       // 75+ favor
    hostile: number;       // -25 or below
    enemy: number;         // -50 or below
  };

  // Combat multipliers at each threshold
  bonusMultipliers: {
    devoted: number;       // 1.5x score
    allied: number;        // 1.3x score
    friendly: number;      // 1.15x score
    neutral: number;       // 1.0x score
    hostile: number;       // 0.9x score
    enemy: number;         // 0.75x score
  };

  // Favor decay per domain clear (favor trends toward 0 over time)
  favorDecayRate: number;  // 0.1 = 10% decay toward neutral
}

export const DEFAULT_FAVOR_CONFIG: FavorConfig = {
  minFavor: -100,
  maxFavor: 100,
  preferredItemFavor: 15,
  dislikedItemFavor: -10,
  preferredElementFavor: 8,
  preferredCategoryFavor: 5,
  favorBonusThresholds: {
    friendly: 25,
    allied: 50,
    devoted: 75,
    hostile: -25,
    enemy: -50,
  },
  bonusMultipliers: {
    devoted: 1.5,
    allied: 1.3,
    friendly: 1.15,
    neutral: 1.0,
    hostile: 0.9,
    enemy: 0.75,
  },
  favorDecayRate: 0.1,
};

// ============================================
// Types
// ============================================

export type FavorLevel = 'devoted' | 'allied' | 'friendly' | 'neutral' | 'hostile' | 'enemy';

export interface FavorState {
  [dieRectorSlug: string]: number; // -100 to 100
}

export interface FavorBonus {
  scoreMultiplier: number;
  goldMultiplier: number;
  favorLevel: FavorLevel;
  description: string;
}

export interface DieRectorPreferences {
  slug: string;
  preferredItems?: string[];      // Item slugs they love
  dislikedItems?: string[];       // Item slugs they dislike
  preferredElements?: Element[];  // Elements they favor
  collectsCategory?: string[];    // Item types they collect
}

// ============================================
// Favor Calculation
// ============================================

/**
 * Calculate favor change when giving an item to a Die-rector
 */
export function calculateFavorChange(
  itemSlug: string,
  itemElement: Element | undefined,
  itemCategory: string | undefined,
  dieRectorPreferences: DieRectorPreferences,
  config: FavorConfig = DEFAULT_FAVOR_CONFIG
): number {
  let favorChange = 0;

  // Check preferred items (strongest bonus)
  if (dieRectorPreferences.preferredItems?.includes(itemSlug)) {
    favorChange += config.preferredItemFavor;
  }

  // Check disliked items (penalty)
  if (dieRectorPreferences.dislikedItems?.includes(itemSlug)) {
    favorChange += config.dislikedItemFavor; // Already negative
  }

  // Check preferred element (moderate bonus)
  if (itemElement && dieRectorPreferences.preferredElements?.includes(itemElement)) {
    favorChange += config.preferredElementFavor;
  }

  // Check collected category (minor bonus)
  if (itemCategory && dieRectorPreferences.collectsCategory?.includes(itemCategory)) {
    favorChange += config.preferredCategoryFavor;
  }

  return favorChange;
}

/**
 * Get favor level from favor value
 */
export function getFavorLevel(favor: number, config: FavorConfig = DEFAULT_FAVOR_CONFIG): FavorLevel {
  if (favor >= config.favorBonusThresholds.devoted) return 'devoted';
  if (favor >= config.favorBonusThresholds.allied) return 'allied';
  if (favor >= config.favorBonusThresholds.friendly) return 'friendly';
  if (favor <= config.favorBonusThresholds.enemy) return 'enemy';
  if (favor <= config.favorBonusThresholds.hostile) return 'hostile';
  return 'neutral';
}

/**
 * Get bonuses from favor level
 */
export function getFavorBonus(favor: number, config: FavorConfig = DEFAULT_FAVOR_CONFIG): FavorBonus {
  const favorLevel = getFavorLevel(favor, config);
  const scoreMultiplier = config.bonusMultipliers[favorLevel];
  const goldMultiplier = scoreMultiplier; // Same multiplier for gold

  const descriptions: Record<FavorLevel, string> = {
    devoted: 'Devoted: +50% score and gold in this domain',
    allied: 'Allied: +30% score and gold in this domain',
    friendly: 'Friendly: +15% score and gold in this domain',
    neutral: 'Neutral: No bonuses or penalties',
    hostile: 'Hostile: -10% score and gold in this domain',
    enemy: 'Enemy: -25% score and gold in this domain',
  };

  return {
    scoreMultiplier,
    goldMultiplier,
    favorLevel,
    description: descriptions[favorLevel],
  };
}

// ============================================
// Favor State Management
// ============================================

/**
 * Create initial favor state (all neutral)
 */
export function createFavorState(dieRectorSlugs: string[]): FavorState {
  const state: FavorState = {};
  for (const slug of dieRectorSlugs) {
    state[slug] = 0; // Neutral
  }
  return state;
}

/**
 * Update favor after giving an item to a Die-rector
 */
export function updateFavor(
  state: FavorState,
  dieRectorSlug: string,
  favorChange: number,
  config: FavorConfig = DEFAULT_FAVOR_CONFIG
): FavorState {
  const currentFavor = state[dieRectorSlug] ?? 0;
  const newFavor = Math.max(
    config.minFavor,
    Math.min(config.maxFavor, currentFavor + favorChange)
  );

  return {
    ...state,
    [dieRectorSlug]: newFavor,
  };
}

/**
 * Apply favor decay (trend toward neutral over time)
 */
export function applyFavorDecay(
  state: FavorState,
  config: FavorConfig = DEFAULT_FAVOR_CONFIG
): FavorState {
  const newState: FavorState = {};

  for (const [slug, favor] of Object.entries(state)) {
    if (favor === 0) {
      newState[slug] = 0;
      continue;
    }

    // Decay toward 0
    const decay = favor * config.favorDecayRate;
    const newFavor = Math.abs(favor - decay) < 1 ? 0 : favor - decay;
    newState[slug] = Math.round(newFavor);
  }

  return newState;
}

/**
 * Get favor for a specific Die-rector
 */
export function getFavor(state: FavorState, dieRectorSlug: string): number {
  return state[dieRectorSlug] ?? 0;
}

/**
 * Get all favor bonuses for active domain
 */
export function getActiveFavorBonus(
  state: FavorState,
  domainDieRectorSlug: string | undefined,
  config: FavorConfig = DEFAULT_FAVOR_CONFIG
): FavorBonus | null {
  if (!domainDieRectorSlug) return null;

  const favor = getFavor(state, domainDieRectorSlug);
  return getFavorBonus(favor, config);
}

// ============================================
// Helper Functions
// ============================================

/**
 * Get favor summary for all Die-rectors
 */
export function getFavorSummary(state: FavorState): Array<{ slug: string; favor: number; level: FavorLevel }> {
  return Object.entries(state).map(([slug, favor]) => ({
    slug,
    favor,
    level: getFavorLevel(favor),
  }));
}

/**
 * Get highest favor Die-rector
 */
export function getHighestFavorDieRector(state: FavorState): { slug: string; favor: number } | null {
  let highest: { slug: string; favor: number } | null = null;

  for (const [slug, favor] of Object.entries(state)) {
    if (!highest || favor > highest.favor) {
      highest = { slug, favor };
    }
  }

  return highest;
}

/**
 * Get lowest favor Die-rector
 */
export function getLowestFavorDieRector(state: FavorState): { slug: string; favor: number } | null {
  let lowest: { slug: string; favor: number } | null = null;

  for (const [slug, favor] of Object.entries(state)) {
    if (!lowest || favor < lowest.favor) {
      lowest = { slug, favor };
    }
  }

  return lowest;
}
