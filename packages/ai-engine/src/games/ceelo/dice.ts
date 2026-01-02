/**
 * Cee-lo Dice Mechanics
 *
 * Pure functions for rolling dice and evaluating Cee-lo outcomes.
 * All functions are deterministic when given the same SeededRng state.
 */

import type { SeededRng } from '../../core/seeded-rng';
import type { DieValue, DiceRoll, CeeloOutcome, RollResult } from './types';

// ============================================
// Dice Rolling
// ============================================

/**
 * Roll a single d6
 */
export function rollD6(rng: SeededRng, namespace?: string): DieValue {
  return rng.randomInt(1, 6, namespace) as DieValue;
}

/**
 * Roll 3d6 for Cee-lo
 */
export function rollDice(
  rng: SeededRng,
  rollNumber: number,
  namespace?: string
): DiceRoll {
  const ns = namespace ? `${namespace}:roll${rollNumber}` : `roll${rollNumber}`;
  return {
    dice: [
      rollD6(rng, `${ns}:d1`),
      rollD6(rng, `${ns}:d2`),
      rollD6(rng, `${ns}:d3`),
    ],
    timestamp: Date.now(),
    rollNumber,
  };
}

// ============================================
// Outcome Evaluation
// ============================================

/**
 * Check if dice form a straight (1-2-3 or 4-5-6)
 */
function isStraight(sorted: DieValue[]): '456' | '123' | null {
  if (sorted[0] === 1 && sorted[1] === 2 && sorted[2] === 3) return '123';
  if (sorted[0] === 4 && sorted[1] === 5 && sorted[2] === 6) return '456';
  return null;
}

/**
 * Check if dice are trips (all same value)
 */
function getTripsValue(dice: DieValue[]): DieValue | null {
  if (dice[0] === dice[1] && dice[1] === dice[2]) {
    return dice[0];
  }
  return null;
}

/**
 * Check if dice have a pair and return the point (the non-pair die)
 */
function getPointFromPair(dice: DieValue[]): DieValue | null {
  const sorted = [...dice].sort((a, b) => a - b);

  // First two are a pair, third is the point
  if (sorted[0] === sorted[1] && sorted[1] !== sorted[2]) {
    return sorted[2];
  }

  // Last two are a pair, first is the point
  if (sorted[1] === sorted[2] && sorted[0] !== sorted[1]) {
    return sorted[0];
  }

  return null;
}

/**
 * Evaluate a Cee-lo roll and determine the outcome
 */
export function evaluateRoll(roll: DiceRoll): CeeloOutcome {
  const { dice } = roll;
  const sorted = [...dice].sort((a, b) => a - b) as [DieValue, DieValue, DieValue];

  // Check for straights first (most significant)
  const straight = isStraight(sorted);
  if (straight === '456') {
    return { type: 'instant_win', roll };
  }
  if (straight === '123') {
    return { type: 'instant_loss', roll };
  }

  // Check for trips
  const tripsValue = getTripsValue(dice);
  if (tripsValue !== null) {
    return { type: 'trips', value: tripsValue, roll };
  }

  // Check for point (pair + odd die)
  const pointValue = getPointFromPair(dice);
  if (pointValue !== null) {
    return { type: 'point', value: pointValue, roll };
  }

  // No valid outcome - must reroll
  return { type: 'no_point', roll };
}

// ============================================
// Outcome Comparison
// ============================================

/**
 * Get numeric rank for an outcome (higher is better)
 *
 * Rankings:
 * - instant_win: 100
 * - trips: 50 + trip value (56 for 6-6-6, 51 for 1-1-1)
 * - point: 10 + point value (16 for point 6, 11 for point 1)
 * - instant_loss: 0
 */
function getOutcomeRank(outcome: CeeloOutcome): number {
  switch (outcome.type) {
    case 'instant_win':
      return 100;
    case 'instant_loss':
      return 0;
    case 'trips':
      return 50 + outcome.value;
    case 'point':
      return 10 + outcome.value;
    case 'no_point':
      return -1; // Should never be compared
  }
}

/**
 * Compare two outcomes
 * Returns: 1 if a wins, -1 if b wins, 0 if tie (push)
 */
export function compareOutcomes(
  a: CeeloOutcome,
  b: CeeloOutcome
): 1 | -1 | 0 {
  // no_point should never be compared
  if (a.type === 'no_point' || b.type === 'no_point') {
    throw new Error('Cannot compare no_point outcomes');
  }

  const rankA = getOutcomeRank(a);
  const rankB = getOutcomeRank(b);

  if (rankA > rankB) return 1;
  if (rankA < rankB) return -1;
  return 0;
}

/**
 * Determine if this is a "bad beat" (lost with a good roll)
 * A bad beat is losing when you had trips or point 5-6
 */
export function isBadBeat(
  loserOutcome: CeeloOutcome,
  winnerOutcome: CeeloOutcome
): boolean {
  if (loserOutcome.type === 'instant_loss' || loserOutcome.type === 'no_point') {
    return false;
  }

  // Lost with trips is always a bad beat (unless opponent had higher trips or 4-5-6)
  if (loserOutcome.type === 'trips') {
    return true;
  }

  // Lost with point 5 or 6 is a bad beat
  if (loserOutcome.type === 'point' && loserOutcome.value >= 5) {
    return true;
  }

  return false;
}

/**
 * Check if this is a "perfect round" (4-5-6 vs 1-2-3)
 */
export function isPerfectRound(
  winnerOutcome: CeeloOutcome,
  loserOutcome: CeeloOutcome
): boolean {
  return (
    winnerOutcome.type === 'instant_win' &&
    loserOutcome.type === 'instant_loss'
  );
}

// ============================================
// Rolling Until Valid Outcome
// ============================================

/**
 * Roll dice until a valid outcome (not no_point) is achieved
 */
export function rollUntilValid(
  rng: SeededRng,
  playerId: string,
  startingRollNumber: number
): RollResult {
  const rollHistory: DiceRoll[] = [];
  let rollNumber = startingRollNumber;
  let outcome: CeeloOutcome;

  do {
    const roll = rollDice(rng, rollNumber, playerId);
    rollHistory.push(roll);
    outcome = evaluateRoll(roll);
    rollNumber++;
  } while (outcome.type === 'no_point');

  return {
    finalOutcome: outcome,
    rollHistory,
    rerollCount: rollHistory.length - 1,
  };
}

// ============================================
// Turn Order Determination
// ============================================

/**
 * Determine turn order by having all players roll d6
 * Highest roll goes first. Ties are resolved by re-rolling.
 */
export function determineTurnOrder(
  rng: SeededRng,
  playerIds: string[]
): string[] {
  if (playerIds.length === 0) return [];
  if (playerIds.length === 1) return [...playerIds];

  // Roll for each player
  const rolls: Array<{ id: string; value: DieValue }> = playerIds.map(id => ({
    id,
    value: rollD6(rng, `turnOrder:${id}`),
  }));

  // Sort by roll value (descending)
  rolls.sort((a, b) => b.value - a.value);

  // Check for ties at the top
  const topRoll = rolls[0].value;
  const tiedAtTop = rolls.filter(r => r.value === topRoll);

  if (tiedAtTop.length > 1) {
    // Recursively resolve ties
    const tiedIds = tiedAtTop.map(r => r.id);
    const resolvedTies = determineTurnOrder(rng, tiedIds);
    const restOfPlayers = rolls
      .filter(r => r.value !== topRoll)
      .map(r => r.id);
    return [...resolvedTies, ...restOfPlayers];
  }

  return rolls.map(r => r.id);
}

// ============================================
// Utility Functions
// ============================================

/**
 * Format a dice roll for display
 */
export function formatRoll(roll: DiceRoll): string {
  return `[${roll.dice.join('-')}]`;
}

/**
 * Format an outcome for display
 */
export function formatOutcome(outcome: CeeloOutcome): string {
  switch (outcome.type) {
    case 'instant_win':
      return '4-5-6! INSTANT WIN!';
    case 'instant_loss':
      return '1-2-3... INSTANT LOSS';
    case 'trips':
      return `TRIPS ${outcome.value}s!`;
    case 'point':
      return `Point: ${outcome.value}`;
    case 'no_point':
      return 'No point - reroll';
  }
}

/**
 * Get human-readable outcome description
 */
export function describeOutcome(outcome: CeeloOutcome): string {
  switch (outcome.type) {
    case 'instant_win':
      return 'rolled the legendary 4-5-6';
    case 'instant_loss':
      return 'crapped out with 1-2-3';
    case 'trips':
      return `rolled triple ${outcome.value}s`;
    case 'point':
      return `set a point of ${outcome.value}`;
    case 'no_point':
      return 'got nothing and must reroll';
  }
}

/**
 * Calculate probability information for outcomes
 */
export function getOutcomeProbabilities(): Record<string, number> {
  // Based on 216 possible 3d6 combinations
  return {
    instant_win: 6 / 216,      // 2.78% (one way to get 4-5-6)
    instant_loss: 6 / 216,     // 2.78% (one way to get 1-2-3)
    trips_any: 6 / 216,        // 2.78% (6 ways, one per face)
    point_any: 90 / 216,       // 41.67% (pairs with odd die out)
    no_point: 108 / 216,       // 50% (everything else)
  };
}
