/**
 * Favor System - Die-rector Memory & Intervention Engine
 *
 * Tracks player-Die-rector relationships across match sets.
 * Die-rectors develop opinions based on how players treat their dice.
 *
 * NEVER DIE GUY
 */

import type { DieSides } from '../combat/balance-config';

// ============================================
// DICE EVENT TYPES
// ============================================

/**
 * Events that affect Die-rector favor
 */
export type DiceEventType =
  | 'ROLLED'    // Used their die in a throw
  | 'HELD'      // Kept their die (didn't trade away)
  | 'CRIT'      // Rolled max value on their die
  | 'TRADED'    // Swapped their die away
  | 'IGNORED'   // Had their die in hand, threw others
  | 'SNAKE';    // Rolled 1 on their die

/**
 * Single dice event for favor calculation
 */
export interface DiceEvent {
  type: DiceEventType;
  dieSides: DieSides;
  playerId: string;
  value?: number;      // Roll value (for ROLLED/CRIT/SNAKE)
  timestamp: number;
}

// ============================================
// FAVOR STATE
// ============================================

/**
 * Die-rector favor threshold states
 */
export type FavorState = 'BLESSED' | 'NEUTRAL' | 'SCORNED';

/**
 * Favor thresholds
 */
export const FAVOR_THRESHOLDS = {
  BLESSED: 50,     // >= 50 = BLESSED
  SCORNED: -50,    // <= -50 = SCORNED
  MIN: -100,
  MAX: 100,
} as const;

/**
 * Per-player favor with a single Die-rector
 */
export interface DierectorFavor {
  dierectorSlug: string;
  score: number;              // -100 to 100
  state: FavorState;
  lastEvent: DiceEventType | null;
  eventCount: number;         // Total events affecting this relationship
  thresholdCrossedAt?: number; // Timestamp when BLESSED/SCORNED was reached
}

/**
 * Player's full favor map across all Die-rectors
 */
export interface PlayerFavorMap {
  playerId: string;
  playerName: string;
  favors: Record<string, DierectorFavor>; // dierectorSlug -> favor
  lastUpdate: number;
}

// ============================================
// DIE-RECTOR PERSONALITY VARIANCE
// ============================================

/**
 * Personality modifiers for favor calculation
 */
export interface PersonalityVariance {
  /** How quickly negative favor decays back to neutral (0 = never, 1 = fast) */
  forgiveness: number;
  /** How long grudges last (0 = forgets immediately, 1 = forever) */
  grudgeRetention: number;
  /** How sensitive to threshold crossings (0.5 = hard to move, 2 = volatile) */
  thresholdSensitivity: number;
  /** Flavor text for personality */
  flavorText: string;
}

/**
 * Die-rector personality by slug
 */
export const DIERECTOR_PERSONALITY: Record<string, PersonalityVariance> = {
  'the-one': {
    forgiveness: 0.2,
    grudgeRetention: 0.3,
    thresholdSensitivity: 0.5,
    flavorText: 'Void is patient. Takes many actions to shift opinion.',
  },
  'john': {
    forgiveness: 0.5,
    grudgeRetention: 0.7,
    thresholdSensitivity: 1.0,
    flavorText: 'Forgives improvement, tracks efficiency.',
  },
  'peter': {
    forgiveness: 0.0,
    grudgeRetention: 1.0,
    thresholdSensitivity: 1.2,
    flavorText: 'Writes everything in his ledger. Holds grudges.',
  },
  'robert': {
    forgiveness: 0.8,
    grudgeRetention: 0.8,
    thresholdSensitivity: 1.5,
    flavorText: 'Quick to anger, quick to respect. Volatile.',
  },
  'alice': {
    forgiveness: 0.1,
    grudgeRetention: 0.1,
    thresholdSensitivity: 0.3,
    flavorText: 'Time is meaningless. Almost impossible to shift.',
  },
  'jane': {
    forgiveness: 0.5,
    grudgeRetention: 0.5,
    thresholdSensitivity: 2.0,
    flavorText: 'Might flip opinion unexpectedly. Chaotic.',
  },
};

// ============================================
// PANTHEON AFFINITY MATRIX
// ============================================

/**
 * Affinity between Die-rectors (-2 to +2)
 * Negative = rivalry, Positive = alliance
 *
 * Used for:
 * - Rivalry sympathy interventions
 * - Shop alliance discounts
 */
export const PANTHEON_AFFINITY: Record<string, Record<string, number>> = {
  'the-one': {
    'john': 0,
    'peter': 1,      // Both embrace inevitability
    'robert': -1,    // Passion vs emptiness
    'alice': 0,
    'jane': 0,
    'rhea': -2,      // Ancient rivalry - Void vs Horror
  },
  'john': {
    'the-one': 0,
    'peter': -2,     // Territorial dispute (Earth vs Shadow)
    'robert': 1,     // Both value action
    'alice': -1,     // Structure vs patience
    'jane': 0,
  },
  'peter': {
    'the-one': 1,
    'john': -2,      // Territorial dispute
    'robert': 0,
    'alice': 1,      // Both patient observers
    'jane': -1,      // Order vs chaos
  },
  'robert': {
    'the-one': -1,
    'john': 1,
    'peter': 0,
    'alice': -2,     // Fire vs Ice (classic rivalry)
    'jane': 2,       // Both embrace intensity (alliance)
  },
  'alice': {
    'the-one': 0,
    'john': -1,
    'peter': 1,
    'robert': -2,    // Ice vs Fire
    'jane': 0,
  },
  'jane': {
    'the-one': 0,
    'john': 0,
    'peter': -1,
    'robert': 2,     // Alliance - both embrace intensity
    'alice': 0,
  },
};

/**
 * Get affinity between two Die-rectors
 */
export function getAffinity(slugA: string, slugB: string): number {
  return PANTHEON_AFFINITY[slugA]?.[slugB] ?? 0;
}

/**
 * Get rivals for a Die-rector (affinity <= -2)
 */
export function getRivals(slug: string): string[] {
  const affinities = PANTHEON_AFFINITY[slug] ?? {};
  return Object.entries(affinities)
    .filter(([, value]) => value <= -2)
    .map(([key]) => key);
}

/**
 * Get allies for a Die-rector (affinity >= 2)
 */
export function getAllies(slug: string): string[] {
  const affinities = PANTHEON_AFFINITY[slug] ?? {};
  return Object.entries(affinities)
    .filter(([, value]) => value >= 2)
    .map(([key]) => key);
}

// ============================================
// FAVOR DELTA CALCULATION
// ============================================

/**
 * Base favor deltas by event type
 */
export const BASE_FAVOR_DELTAS: Record<DiceEventType, number> = {
  ROLLED: 3,
  HELD: 2,
  CRIT: 8,
  TRADED: -5,
  IGNORED: -2,
  SNAKE: -1,
};

/**
 * Calculate favor delta with personality variance
 */
export function calculateFavorDelta(
  event: DiceEvent,
  dierectorSlug: string
): number {
  const baseDelta = BASE_FAVOR_DELTAS[event.type];
  const personality = DIERECTOR_PERSONALITY[dierectorSlug];

  if (!personality) return baseDelta;

  // Apply sensitivity (makes thresholds easier/harder to cross)
  let delta = baseDelta * personality.thresholdSensitivity;

  // Jane's chaos: random variance (+/- 30%)
  if (dierectorSlug === 'jane') {
    const variance = 0.7 + Math.random() * 0.6; // 0.7 to 1.3
    delta *= variance;
  }

  return Math.round(delta);
}

/**
 * Apply favor delta and check for threshold crossing
 */
export function applyFavorDelta(
  favor: DierectorFavor,
  delta: number,
  timestamp: number
): { newFavor: DierectorFavor; thresholdCrossed: FavorState | null } {
  const newScore = Math.max(
    FAVOR_THRESHOLDS.MIN,
    Math.min(FAVOR_THRESHOLDS.MAX, favor.score + delta)
  );

  const oldState = favor.state;
  let newState: FavorState = 'NEUTRAL';

  if (newScore >= FAVOR_THRESHOLDS.BLESSED) {
    newState = 'BLESSED';
  } else if (newScore <= FAVOR_THRESHOLDS.SCORNED) {
    newState = 'SCORNED';
  }

  const thresholdCrossed = newState !== oldState ? newState : null;

  return {
    newFavor: {
      ...favor,
      score: newScore,
      state: newState,
      eventCount: favor.eventCount + 1,
      thresholdCrossedAt: thresholdCrossed ? timestamp : favor.thresholdCrossedAt,
    },
    thresholdCrossed,
  };
}

// ============================================
// DIE SIDES TO DIERECTOR MAPPING
// ============================================

/**
 * Map die sides to Die-rector slug
 */
export const DIE_TO_DIERECTOR: Record<DieSides, string> = {
  4: 'the-one',
  6: 'john',
  8: 'peter',
  10: 'robert',
  12: 'alice',
  20: 'jane',
};

/**
 * Get Die-rector slug for a die
 */
export function getDierectorForDie(dieSides: DieSides): string {
  return DIE_TO_DIERECTOR[dieSides];
}

// ============================================
// FACTORY FUNCTIONS
// ============================================

/**
 * Create initial favor state for a player
 */
export function createInitialFavorMap(
  playerId: string,
  playerName: string
): PlayerFavorMap {
  const dierectorSlugs = Object.keys(DIERECTOR_PERSONALITY);
  const favors: Record<string, DierectorFavor> = {};

  for (const slug of dierectorSlugs) {
    favors[slug] = {
      dierectorSlug: slug,
      score: 0,
      state: 'NEUTRAL',
      lastEvent: null,
      eventCount: 0,
    };
  }

  return {
    playerId,
    playerName,
    favors,
    lastUpdate: Date.now(),
  };
}

/**
 * Process a dice event and update favor
 */
export function processDiceEvent(
  favorMap: PlayerFavorMap,
  event: DiceEvent
): {
  updatedMap: PlayerFavorMap;
  thresholdCrossings: Array<{ dierectorSlug: string; newState: FavorState }>;
} {
  const dierectorSlug = getDierectorForDie(event.dieSides);
  const currentFavor = favorMap.favors[dierectorSlug];

  if (!currentFavor) {
    return { updatedMap: favorMap, thresholdCrossings: [] };
  }

  const delta = calculateFavorDelta(event, dierectorSlug);
  const { newFavor, thresholdCrossed } = applyFavorDelta(
    currentFavor,
    delta,
    event.timestamp
  );

  const updatedFavor = {
    ...newFavor,
    lastEvent: event.type,
  };

  const updatedMap: PlayerFavorMap = {
    ...favorMap,
    favors: {
      ...favorMap.favors,
      [dierectorSlug]: updatedFavor,
    },
    lastUpdate: event.timestamp,
  };

  const thresholdCrossings = thresholdCrossed
    ? [{ dierectorSlug, newState: thresholdCrossed }]
    : [];

  return { updatedMap, thresholdCrossings };
}
