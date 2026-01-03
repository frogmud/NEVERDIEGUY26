/**
 * Dice Hand System - Balatro-style play/hold mechanics
 *
 * Players draw 5 dice from a pool, can hold some between throws.
 * Limited holds per room adds strategic depth.
 * NEVER DIE GUY
 */

import type { SeededRng } from '../core/seeded-rng';

// ============================================
// Types
// ============================================

export type DieSides = 4 | 6 | 8 | 10 | 12 | 20;

export type Element = 'Void' | 'Earth' | 'Death' | 'Fire' | 'Ice' | 'Wind';

export interface Die {
  id: string;
  sides: DieSides;
  element: Element;
  isHeld: boolean;
  rollValue: number | null; // null until rolled
}

export interface DiceHand {
  dice: Die[];
  maxSize: number;
}

export interface DicePool {
  available: Die[];
  exhausted: Die[];
}

// ============================================
// Constants
// ============================================

export const MAX_HAND_SIZE = 5;
export const DEFAULT_HOLDS_PER_ROOM = 3;

/**
 * Die to element mapping (each die type has a home element)
 */
export const DIE_ELEMENTS: Record<DieSides, Element> = {
  4: 'Void',
  6: 'Earth',
  8: 'Death',
  10: 'Fire',
  12: 'Ice',
  20: 'Wind',
};

// ============================================
// Pool Generation
// ============================================

/**
 * Generate a starting pool of dice for a room
 * Pool composition can be adjusted based on domain/difficulty
 */
export function generateDicePool(
  rng: SeededRng,
  poolSize: number = 15,
  domainId?: number
): DicePool {
  const dice: Die[] = [];
  const dieTypes: DieSides[] = [4, 6, 8, 10, 12, 20];

  // Base distribution: 2-3 of each die type
  for (let i = 0; i < poolSize; i++) {
    const sides = dieTypes[i % dieTypes.length];
    dice.push({
      id: `die-${i}`,
      sides,
      element: DIE_ELEMENTS[sides],
      isHeld: false,
      rollValue: null,
    });
  }

  // Shuffle the pool
  const shuffled = rng.shuffle([...dice]);

  return {
    available: shuffled,
    exhausted: [],
  };
}

/**
 * Generate a weighted pool favoring certain dice types
 */
export function generateWeightedPool(
  rng: SeededRng,
  weights: Partial<Record<DieSides, number>>,
  poolSize: number = 15
): DicePool {
  const dice: Die[] = [];
  const defaultWeights: Record<DieSides, number> = {
    4: 2,
    6: 3,
    8: 3,
    10: 3,
    12: 2,
    20: 2,
  };

  const finalWeights = { ...defaultWeights, ...weights };
  const totalWeight = Object.values(finalWeights).reduce((a, b) => a + b, 0);

  for (let i = 0; i < poolSize; i++) {
    let roll = rng.random(`pool-${i}`) * totalWeight;
    let selectedSides: DieSides = 6; // default

    for (const [sides, weight] of Object.entries(finalWeights)) {
      roll -= weight;
      if (roll <= 0) {
        selectedSides = parseInt(sides) as DieSides;
        break;
      }
    }

    dice.push({
      id: `die-${i}`,
      sides: selectedSides,
      element: DIE_ELEMENTS[selectedSides],
      isHeld: false,
      rollValue: null,
    });
  }

  return {
    available: rng.shuffle([...dice]),
    exhausted: [],
  };
}

// ============================================
// Hand Management
// ============================================

/**
 * Draw dice from pool to fill hand
 * Held dice stay, empty slots filled from pool
 * New dice start HELD - player must unhold to select for throwing
 */
export function drawHand(
  pool: DicePool,
  currentHand: Die[],
  rng: SeededRng
): { hand: Die[]; pool: DicePool } {
  // Keep held dice
  const heldDice = currentHand.filter((d) => d.isHeld);
  const drawCount = MAX_HAND_SIZE - heldDice.length;

  // Draw from pool
  const drawn = pool.available.slice(0, drawCount);
  const remaining = pool.available.slice(drawCount);

  // New dice start HELD (player unholds to select for throwing)
  const newDice = drawn.map((d) => ({
    ...d,
    isHeld: true,
    rollValue: null,
  }));

  return {
    hand: [...heldDice, ...newDice],
    pool: {
      available: remaining,
      exhausted: [...pool.exhausted],
    },
  };
}

/**
 * Roll unheld dice in hand (held dice keep their values)
 */
export function rollHand(hand: Die[], rng: SeededRng): Die[] {
  return hand.map((die) => {
    // Held dice keep their current roll value
    if (die.isHeld) {
      return die;
    }
    // Unheld dice get new roll value
    return {
      ...die,
      rollValue: rng.roll(`roll-${die.id}-${Date.now()}`, die.sides),
    };
  });
}

/**
 * Toggle hold status on a die
 * Both holding and unholding are free - no resource cost
 */
export function toggleHold(
  hand: Die[],
  dieId: string,
  holdsRemaining: number
): { hand: Die[]; holdsRemaining: number } | null {
  const dieIndex = hand.findIndex((d) => d.id === dieId);
  if (dieIndex === -1) return null;

  const die = hand[dieIndex];
  const newHand = [...hand];
  newHand[dieIndex] = { ...die, isHeld: !die.isHeld };

  // holdsRemaining passed through unchanged (not consumed)
  return { hand: newHand, holdsRemaining };
}

/**
 * Discard played dice (non-held) and draw new ones
 * New dice start HELD - player must unhold to select for throwing
 */
export function discardAndDraw(
  hand: Die[],
  pool: DicePool,
  rng: SeededRng
): { hand: Die[]; pool: DicePool } {
  const heldDice = hand.filter((d) => d.isHeld);
  const discarded = hand.filter((d) => !d.isHeld);

  // Move discarded to exhausted
  const newExhausted = [...pool.exhausted, ...discarded];

  // Draw new dice
  const drawCount = MAX_HAND_SIZE - heldDice.length;
  const drawn = pool.available.slice(0, drawCount);
  const remaining = pool.available.slice(drawCount);

  // New dice start HELD (player unholds to select for throwing)
  const newDice = drawn.map((d) => ({
    ...d,
    isHeld: true,
    rollValue: null,
  }));

  // Also reset held dice rolls for next throw
  const resetHeld = heldDice.map((d) => ({
    ...d,
    rollValue: null,
  }));

  return {
    hand: [...resetHeld, ...newDice],
    pool: {
      available: remaining,
      exhausted: newExhausted,
    },
  };
}

// ============================================
// Hand Analysis
// ============================================

/**
 * Get total roll value of hand
 */
export function getHandTotal(hand: Die[]): number {
  return hand.reduce((sum, die) => sum + (die.rollValue || 0), 0);
}

/**
 * Count dice by element
 */
export function countByElement(hand: Die[]): Record<Element, number> {
  const counts: Record<Element, number> = {
    Void: 0,
    Earth: 0,
    Death: 0,
    Fire: 0,
    Ice: 0,
    Wind: 0,
  };

  for (const die of hand) {
    counts[die.element]++;
  }

  return counts;
}

/**
 * Check for element combos (3+ of same element)
 */
export function getElementCombos(hand: Die[]): Element[] {
  const counts = countByElement(hand);
  return (Object.entries(counts) as [Element, number][])
    .filter(([, count]) => count >= 3)
    .map(([element]) => element);
}

/**
 * Get held dice count
 */
export function getHeldCount(hand: Die[]): number {
  return hand.filter((d) => d.isHeld).length;
}

/**
 * Check if pool is empty
 */
export function isPoolEmpty(pool: DicePool): boolean {
  return pool.available.length === 0;
}

/**
 * Get pool remaining count
 */
export function getPoolRemaining(pool: DicePool): number {
  return pool.available.length;
}
