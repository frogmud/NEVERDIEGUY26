/**
 * Draw Events - Special bonuses triggered by dice hand composition
 *
 * Events fire during draw/roll phases and provide score bonuses or effects.
 * Inspired by Balatro's joker proc system.
 * NEVER DIE GUY
 */

import type { Die, Element } from './dice-hand';
import { countByElement } from './dice-hand';

// ============================================
// Types
// ============================================

export type DrawEventType =
  | 'element_surge' // 3+ same element in hand
  | 'lucky_straight' // Sequential values (1-2-3-4-5)
  | 'high_roller' // All dice 5+ (on d6, scaled for others)
  | 'cursed_hand' // All 1s or 2s (bad luck event)
  | 'wild_surge'; // All different elements

export interface DrawEvent {
  type: DrawEventType;
  name: string;
  description: string;
  element?: Element; // For element-specific events
  bonus: number; // Flat score bonus
  multiplier: number; // Score multiplier (1.0 = no change)
  triggered: boolean;
}

export interface DrawEventResult {
  events: DrawEvent[];
  totalBonus: number;
  totalMultiplier: number;
}

// ============================================
// Event Detection
// ============================================

/**
 * Check for Element Surge: 3+ dice of same element
 * Bonus: +100 per matching die, 1.2x multiplier
 */
function checkElementSurge(hand: Die[]): DrawEvent | null {
  const counts = countByElement(hand);

  for (const [element, count] of Object.entries(counts) as [Element, number][]) {
    if (count >= 3) {
      return {
        type: 'element_surge',
        name: 'Element Surge',
        description: `${count} ${element} dice aligned!`,
        element,
        bonus: count * 100,
        multiplier: 1.2,
        triggered: true,
      };
    }
  }
  return null;
}

/**
 * Check for Lucky Straight: Sequential roll values (1-2-3-4-5)
 * Only checks rolled dice (non-null rollValue)
 * Bonus: +500, 1.5x multiplier
 */
function checkLuckyStraight(hand: Die[]): DrawEvent | null {
  const rolledValues = hand
    .filter((d) => d.rollValue !== null)
    .map((d) => d.rollValue as number)
    .sort((a, b) => a - b);

  if (rolledValues.length < 5) return null;

  // Check for 1-2-3-4-5 sequence
  const isSequential =
    rolledValues[0] === 1 &&
    rolledValues[1] === 2 &&
    rolledValues[2] === 3 &&
    rolledValues[3] === 4 &&
    rolledValues[4] === 5;

  if (isSequential) {
    return {
      type: 'lucky_straight',
      name: 'Lucky Straight',
      description: '1-2-3-4-5 sequence!',
      bonus: 500,
      multiplier: 1.5,
      triggered: true,
    };
  }
  return null;
}

/**
 * Check for High Roller: All dice roll in top ~33% of their faces
 * (e.g., 5-6 on d6, 9-12 on d12)
 * Bonus: +300, 1.3x multiplier
 */
function checkHighRoller(hand: Die[]): DrawEvent | null {
  const rolledDice = hand.filter((d) => d.rollValue !== null);
  if (rolledDice.length < 3) return null; // Need at least 3 dice

  const allHigh = rolledDice.every((die) => {
    const threshold = Math.ceil(die.sides * 0.67);
    return (die.rollValue as number) >= threshold;
  });

  if (allHigh) {
    return {
      type: 'high_roller',
      name: 'High Roller',
      description: 'All dice rolled high!',
      bonus: 300,
      multiplier: 1.3,
      triggered: true,
    };
  }
  return null;
}

/**
 * Check for Cursed Hand: All dice roll 1 or 2 (bad luck)
 * Penalty: -200, 0.5x multiplier
 */
function checkCursedHand(hand: Die[]): DrawEvent | null {
  const rolledDice = hand.filter((d) => d.rollValue !== null);
  if (rolledDice.length < 3) return null;

  const allCursed = rolledDice.every((die) => {
    const value = die.rollValue as number;
    return value <= 2;
  });

  if (allCursed) {
    return {
      type: 'cursed_hand',
      name: 'Cursed Hand',
      description: 'The dice betray you...',
      bonus: -200,
      multiplier: 0.5,
      triggered: true,
    };
  }
  return null;
}

/**
 * Check for Wild Surge: All 5 elements different
 * Bonus: +250, 1.25x multiplier
 */
function checkWildSurge(hand: Die[]): DrawEvent | null {
  if (hand.length < 5) return null;

  const uniqueElements = new Set(hand.map((d) => d.element));
  if (uniqueElements.size >= 5) {
    return {
      type: 'wild_surge',
      name: 'Wild Surge',
      description: 'Elemental harmony!',
      bonus: 250,
      multiplier: 1.25,
      triggered: true,
    };
  }
  return null;
}

// ============================================
// Main Detection
// ============================================

/**
 * Detect all draw events for a hand
 * Call after rolling dice to check for bonuses
 */
export function detectDrawEvents(hand: Die[]): DrawEventResult {
  const events: DrawEvent[] = [];

  // Check each event type (order = priority for display)
  const luckyStraight = checkLuckyStraight(hand);
  if (luckyStraight) events.push(luckyStraight);

  const highRoller = checkHighRoller(hand);
  if (highRoller) events.push(highRoller);

  const elementSurge = checkElementSurge(hand);
  if (elementSurge) events.push(elementSurge);

  const wildSurge = checkWildSurge(hand);
  if (wildSurge) events.push(wildSurge);

  const cursedHand = checkCursedHand(hand);
  if (cursedHand) events.push(cursedHand);

  // Calculate totals (bonuses additive, multipliers multiplicative)
  const totalBonus = events.reduce((sum, e) => sum + e.bonus, 0);
  const totalMultiplier = events.reduce((product, e) => product * e.multiplier, 1.0);

  return {
    events,
    totalBonus,
    totalMultiplier,
  };
}

/**
 * Apply draw event bonuses to a base score
 */
export function applyDrawEvents(baseScore: number, eventResult: DrawEventResult): number {
  return Math.round((baseScore + eventResult.totalBonus) * eventResult.totalMultiplier);
}
