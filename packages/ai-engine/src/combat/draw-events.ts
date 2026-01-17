/**
 * Draw Events System - Special dice pattern detection
 *
 * Detects patterns like straights, element combos, high rollers, etc.
 * Returns bonus/multiplier adjustments for matching patterns.
 *
 * NEVER DIE GUY
 */

import type { Die, Element } from './dice-hand';
import { DIE_ELEMENTS } from './dice-hand';

// ============================================
// Types
// ============================================

export type DrawEventType =
  | 'lucky-straight'
  | 'high-roller'
  | 'element-surge'
  | 'wild-surge'
  | 'cursed-hand';

export interface DrawEvent {
  type: DrawEventType;
  name: string;
  description: string;
  bonus: number;
  multiplier: number;
  color: string;
  /** For element surge, which element triggered it */
  element?: Element;
  /** Dice that contributed to this event */
  involvedDice: string[];
}

export interface DrawEventConfig {
  type: DrawEventType;
  name: string;
  description: string;
  bonus: number;
  multiplier: number;
  color: string;
}

// ============================================
// Event Configurations
// ============================================

export const DRAW_EVENT_CONFIGS: Record<DrawEventType, DrawEventConfig> = {
  'lucky-straight': {
    type: 'lucky-straight',
    name: 'Lucky Straight',
    description: '3+ consecutive values',
    bonus: 500,
    multiplier: 1.5,
    color: '#FFD700', // Gold
  },
  'high-roller': {
    type: 'high-roller',
    name: 'High Roller',
    description: 'All dice rolled above average',
    bonus: 300,
    multiplier: 1.3,
    color: '#9B59B6', // Purple
  },
  'element-surge': {
    type: 'element-surge',
    name: 'Element Surge',
    description: '3+ dice of same element',
    bonus: 100, // Per die involved
    multiplier: 1.2,
    color: '#00CED1', // Default - overridden by element
  },
  'wild-surge': {
    type: 'wild-surge',
    name: 'Wild Surge',
    description: 'All different elements',
    bonus: 250,
    multiplier: 1.25,
    color: 'linear-gradient(90deg, #FF6B6B, #FFE66D, #4ECDC4, #45B7D1, #96CEB4)', // Rainbow
  },
  'cursed-hand': {
    type: 'cursed-hand',
    name: 'Cursed Hand',
    description: 'All dice rolled below average',
    bonus: -200,
    multiplier: 0.5,
    color: '#E74C3C', // Red
  },
};

// Element colors for element surge
export const ELEMENT_COLORS: Record<Element, string> = {
  Void: '#8E44AD',
  Earth: '#27AE60',
  Death: '#2C3E50',
  Fire: '#E74C3C',
  Ice: '#3498DB',
  Wind: '#1ABC9C',
};

// ============================================
// Detection Functions
// ============================================

/**
 * Check for Lucky Straight (3+ consecutive roll values)
 */
function detectLuckyStraight(dice: Die[]): DrawEvent | null {
  const rolledDice = dice.filter(d => d.rollValue !== null);
  if (rolledDice.length < 3) return null;

  const values = rolledDice.map(d => d.rollValue!).sort((a, b) => a - b);
  const uniqueValues = [...new Set(values)];

  // Find longest consecutive sequence
  let maxStreak = 1;
  let currentStreak = 1;
  let streakDice: string[] = [];
  let currentStreakDice: string[] = [];

  for (let i = 1; i < uniqueValues.length; i++) {
    if (uniqueValues[i] === uniqueValues[i - 1] + 1) {
      currentStreak++;
      // Track which dice are in the streak
      const matchingDice = rolledDice.filter(
        d => d.rollValue === uniqueValues[i] || d.rollValue === uniqueValues[i - 1]
      );
      currentStreakDice = [...new Set([...currentStreakDice, ...matchingDice.map(d => d.id)])];
    } else {
      if (currentStreak > maxStreak) {
        maxStreak = currentStreak;
        streakDice = currentStreakDice;
      }
      currentStreak = 1;
      currentStreakDice = [];
    }
  }

  if (currentStreak > maxStreak) {
    maxStreak = currentStreak;
    streakDice = currentStreakDice;
  }

  if (maxStreak >= 3) {
    const config = DRAW_EVENT_CONFIGS['lucky-straight'];
    return {
      ...config,
      involvedDice: streakDice,
    };
  }

  return null;
}

/**
 * Check for High Roller (all dice above their average)
 * Average = (1 + sides) / 2, so above average means rollValue > sides/2
 */
function detectHighRoller(dice: Die[]): DrawEvent | null {
  const rolledDice = dice.filter(d => d.rollValue !== null);
  if (rolledDice.length < 2) return null;

  const allAboveAverage = rolledDice.every(die => {
    const average = (1 + die.sides) / 2;
    return die.rollValue! > average;
  });

  if (allAboveAverage) {
    const config = DRAW_EVENT_CONFIGS['high-roller'];
    return {
      ...config,
      involvedDice: rolledDice.map(d => d.id),
    };
  }

  return null;
}

/**
 * Check for Element Surge (3+ dice of same element)
 */
function detectElementSurge(dice: Die[]): DrawEvent | null {
  const rolledDice = dice.filter(d => d.rollValue !== null);
  if (rolledDice.length < 3) return null;

  // Count by element
  const elementCounts: Record<Element, Die[]> = {
    Void: [],
    Earth: [],
    Death: [],
    Fire: [],
    Ice: [],
    Wind: [],
  };

  for (const die of rolledDice) {
    elementCounts[die.element].push(die);
  }

  // Find element with 3+ dice
  for (const [element, diceList] of Object.entries(elementCounts)) {
    if (diceList.length >= 3) {
      const config = DRAW_EVENT_CONFIGS['element-surge'];
      return {
        ...config,
        bonus: config.bonus * diceList.length, // +100 per die
        color: ELEMENT_COLORS[element as Element],
        element: element as Element,
        involvedDice: diceList.map(d => d.id),
      };
    }
  }

  return null;
}

/**
 * Check for Wild Surge (all different elements, min 4 dice)
 */
function detectWildSurge(dice: Die[]): DrawEvent | null {
  const rolledDice = dice.filter(d => d.rollValue !== null);
  if (rolledDice.length < 4) return null;

  const elements = new Set(rolledDice.map(d => d.element));

  // All dice must be different elements
  if (elements.size === rolledDice.length) {
    const config = DRAW_EVENT_CONFIGS['wild-surge'];
    return {
      ...config,
      involvedDice: rolledDice.map(d => d.id),
    };
  }

  return null;
}

/**
 * Check for Cursed Hand (all dice below their average)
 * This is a penalty event - triggers when luck is bad
 */
function detectCursedHand(dice: Die[]): DrawEvent | null {
  const rolledDice = dice.filter(d => d.rollValue !== null);
  if (rolledDice.length < 3) return null;

  const allBelowAverage = rolledDice.every(die => {
    const average = (1 + die.sides) / 2;
    return die.rollValue! < average;
  });

  if (allBelowAverage) {
    const config = DRAW_EVENT_CONFIGS['cursed-hand'];
    return {
      ...config,
      involvedDice: rolledDice.map(d => d.id),
    };
  }

  return null;
}

// ============================================
// Main Detection Function
// ============================================

/**
 * Detect all draw events in a hand
 * Returns array of events in priority order (best events first)
 *
 * Priority:
 * 1. Lucky Straight (most valuable)
 * 2. High Roller
 * 3. Element Surge
 * 4. Wild Surge
 * 5. Cursed Hand (penalty - always checked last)
 */
export function detectDrawEvents(hand: Die[]): DrawEvent[] {
  const events: DrawEvent[] = [];

  // Check for positive events (in priority order)
  const straight = detectLuckyStraight(hand);
  if (straight) events.push(straight);

  const highRoller = detectHighRoller(hand);
  if (highRoller) events.push(highRoller);

  const elementSurge = detectElementSurge(hand);
  if (elementSurge) events.push(elementSurge);

  const wildSurge = detectWildSurge(hand);
  if (wildSurge) events.push(wildSurge);

  // Check for negative event only if no positive events triggered
  // This prevents double-punishment
  if (events.length === 0) {
    const cursed = detectCursedHand(hand);
    if (cursed) events.push(cursed);
  }

  return events;
}

/**
 * Calculate total bonus and multiplier from all events
 */
export function calculateEventBonuses(events: DrawEvent[]): {
  totalBonus: number;
  totalMultiplier: number;
} {
  let totalBonus = 0;
  let totalMultiplier = 1;

  for (const event of events) {
    totalBonus += event.bonus;
    // Multipliers stack multiplicatively
    totalMultiplier *= event.multiplier;
  }

  return { totalBonus, totalMultiplier };
}

/**
 * Get a summary description of active events for display
 */
export function getEventSummary(events: DrawEvent[]): string {
  if (events.length === 0) return '';

  return events.map(e => e.name).join(' + ');
}
