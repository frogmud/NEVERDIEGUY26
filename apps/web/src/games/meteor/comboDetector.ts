// Cee-Lo style combo detection for Dice Meteor
// Combos affect both score multipliers AND meteor effects

export type ComboType = 'jackpot' | 'snake_eyes' | 'trips' | 'pair' | 'none';

export type MeteorEffect = 'shockwave' | 'chain' | 'bigblast' | 'fizzle' | 'normal';

export interface ComboResult {
  type: ComboType;
  multiplier: number;
  meteorEffect: MeteorEffect;
  displayName: string;
  color: string;
}

// Combo configuration
const COMBOS: Record<ComboType, Omit<ComboResult, 'type'>> = {
  jackpot: {
    multiplier: 5,
    meteorEffect: 'shockwave',
    displayName: '4-5-6!',
    color: '#C4A000', // gold
  },
  snake_eyes: {
    multiplier: 0,
    meteorEffect: 'fizzle',
    displayName: '1-2-3...',
    color: '#ff1744', // red
  },
  trips: {
    multiplier: 3,
    meteorEffect: 'chain',
    displayName: 'TRIPS!',
    color: '#9b59b6', // purple
  },
  pair: {
    multiplier: 1.5,
    meteorEffect: 'bigblast',
    displayName: 'PAIR',
    color: '#00e5ff', // cyan
  },
  none: {
    multiplier: 1,
    meteorEffect: 'normal',
    displayName: '',
    color: '#ffffff',
  },
};

/**
 * Check if array contains exact values 4, 5, 6 (in any order)
 */
function has456(values: number[]): boolean {
  const has4 = values.includes(4);
  const has5 = values.includes(5);
  const has6 = values.includes(6);
  return has4 && has5 && has6;
}

/**
 * Check if array contains exact values 1, 2, 3 (in any order)
 */
function has123(values: number[]): boolean {
  const has1 = values.includes(1);
  const has2 = values.includes(2);
  const has3 = values.includes(3);
  return has1 && has2 && has3;
}

/**
 * Check for trips (3 or more of the same value)
 */
function hasTrips(values: number[]): boolean {
  const counts = new Map<number, number>();
  for (const v of values) {
    counts.set(v, (counts.get(v) || 0) + 1);
  }
  for (const count of counts.values()) {
    if (count >= 3) return true;
  }
  return false;
}

/**
 * Check for pair (2 of the same value)
 */
function hasPair(values: number[]): boolean {
  const counts = new Map<number, number>();
  for (const v of values) {
    counts.set(v, (counts.get(v) || 0) + 1);
  }
  for (const count of counts.values()) {
    if (count >= 2) return true;
  }
  return false;
}

/**
 * Detect combo from rolled dice values
 * Priority: 4-5-6 > 1-2-3 > Trips > Pair > None
 */
export function detectCombo(values: number[]): ComboResult {
  // Need at least 3 dice for 4-5-6 or 1-2-3
  if (values.length >= 3) {
    if (has456(values)) {
      return { type: 'jackpot', ...COMBOS.jackpot };
    }
    if (has123(values)) {
      return { type: 'snake_eyes', ...COMBOS.snake_eyes };
    }
    if (hasTrips(values)) {
      return { type: 'trips', ...COMBOS.trips };
    }
  }

  // Pair only needs 2 dice
  if (values.length >= 2 && hasPair(values)) {
    return { type: 'pair', ...COMBOS.pair };
  }

  return { type: 'none', ...COMBOS.none };
}
