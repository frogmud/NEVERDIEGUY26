// Ceelo Dice Combo System
// Special three-dice combinations with multipliers

import { tokens } from '../../theme';

// Combo types in priority order (higher = better)
export type CeeloCombo =
  | 'jackpot'    // 4-5-6
  | 'trips'      // Three of a kind
  | 'point'      // Pair + unique (point value = the unique die)
  | 'nothing'    // No combo (rare - all different, no 4-5-6 or 1-2-3)
  | 'bust';      // 1-2-3

export interface CeeloResult {
  combo: CeeloCombo;
  name: string;
  multiplier: number;
  pointValue?: number;  // Only for 'point' combo
  color: string;
  bgColor: string;
  animation: 'goldGlow' | 'pulse' | 'standard' | 'redFlash';
  soundEffect: 'fanfare' | 'trips' | 'point' | 'nothing' | 'bust';
}

// Combo configurations
const COMBO_CONFIGS: Record<CeeloCombo, Omit<CeeloResult, 'combo' | 'pointValue'>> = {
  jackpot: {
    name: 'Jackpot!',
    multiplier: 2.0,
    color: '#ffd700',            // Gold
    bgColor: 'rgba(255, 215, 0, 0.15)',
    animation: 'goldGlow',
    soundEffect: 'fanfare',
  },
  trips: {
    name: 'Trips!',
    multiplier: 1.5,
    color: tokens.colors.secondary, // Cyan
    bgColor: `${tokens.colors.secondary}20`,
    animation: 'pulse',
    soundEffect: 'trips',
  },
  point: {
    name: 'Point',
    multiplier: 1.0,
    color: tokens.colors.text.primary,
    bgColor: tokens.colors.background.elevated,
    animation: 'standard',
    soundEffect: 'point',
  },
  nothing: {
    name: 'Nothing',
    multiplier: 0.75,
    color: tokens.colors.text.secondary,
    bgColor: tokens.colors.background.elevated,
    animation: 'standard',
    soundEffect: 'nothing',
  },
  bust: {
    name: 'Bust!',
    multiplier: 0.5,
    color: tokens.colors.primary, // Red
    bgColor: `${tokens.colors.primary}20`,
    animation: 'redFlash',
    soundEffect: 'bust',
  },
};

// Detect Ceelo combo from three d6 dice results
export function detectCeeloCombo(dice: [number, number, number]): CeeloResult {
  const sorted = [...dice].sort((a, b) => a - b) as [number, number, number];

  // Check for 4-5-6 (Jackpot) - order doesn't matter
  if (sorted[0] === 4 && sorted[1] === 5 && sorted[2] === 6) {
    return { combo: 'jackpot', ...COMBO_CONFIGS.jackpot };
  }

  // Check for 1-2-3 (Bust) - order doesn't matter
  if (sorted[0] === 1 && sorted[1] === 2 && sorted[2] === 3) {
    return { combo: 'bust', ...COMBO_CONFIGS.bust };
  }

  // Check for Trips (three of a kind)
  if (dice[0] === dice[1] && dice[1] === dice[2]) {
    return { combo: 'trips', ...COMBO_CONFIGS.trips };
  }

  // Check for Point (pair + unique die)
  // Find if there's a pair and get the point value
  const counts: Record<number, number> = {};
  for (const d of dice) {
    counts[d] = (counts[d] || 0) + 1;
  }

  let pairValue: number | null = null;
  let pointValue: number | null = null;

  for (const [value, count] of Object.entries(counts)) {
    if (count === 2) {
      pairValue = parseInt(value);
    } else if (count === 1) {
      pointValue = parseInt(value);
    }
  }

  if (pairValue !== null && pointValue !== null) {
    return {
      combo: 'point',
      pointValue,
      ...COMBO_CONFIGS.point,
      name: `Point ${pointValue}`,
    };
  }

  // Nothing - all different but not 4-5-6 or 1-2-3
  return { combo: 'nothing', ...COMBO_CONFIGS.nothing };
}

// Calculate final score based on base damage and combo
export function applyCeeloMultiplier(baseDamage: number, result: CeeloResult): number {
  let damage = Math.floor(baseDamage * result.multiplier);

  // Point combo: add point value as bonus
  if (result.combo === 'point' && result.pointValue) {
    damage += result.pointValue;
  }

  return damage;
}

// Get display string for combo result
export function formatCeeloResult(result: CeeloResult): string {
  if (result.combo === 'point' && result.pointValue) {
    return `${result.name} (x${result.multiplier} + ${result.pointValue})`;
  }
  return `${result.name} (x${result.multiplier})`;
}

// Special instant-win check for perfect Jackpot
export function isInstantWin(result: CeeloResult): boolean {
  return result.combo === 'jackpot';
}

// Special instant-loss check for Bust
export function isInstantLoss(result: CeeloResult): boolean {
  return result.combo === 'bust';
}

// Export combo configs for UI display
export { COMBO_CONFIGS };
