/**
 * Lucky Die System - Consolidated Alliance Configuration
 *
 * The Lucky Die connects:
 * - Die type (d4, d6, d8, d10, d12, d20)
 * - Die-rector patron (The One, John, Peter, Robert, Alice, Jane)
 * - Domain (Null Providence, Mechanarium, Shadow Keep, Infernus, Frost Reach, Aberrant)
 * - Element (Void, Earth, Death, Fire, Ice, Wind)
 *
 * First roll of a run determines the player's Lucky Die (highest value wins).
 * Ties let player choose which die to "boost" (maxes out AND becomes Lucky Die).
 *
 * NEVER DIE GUY
 */

import type { LuckyDie, Element, DieSides } from '../wiki/types';
import { tokens } from '../../theme';

// ============================================================
// LUCKY DIE CONFIG - Single Source of Truth
// ============================================================

export interface LuckyDieInfo {
  dieSides: DieSides | null;   // null for 'none' and 'all'
  dierector: string | null;    // Pantheon slug
  domain: string | null;       // Domain slug
  element: Element | null;
  color: string;
  description: string;
  tier: 1 | 2 | 3 | 4 | 5 | 6 | null;
}

export const LUCKY_DIE_CONFIG: Record<LuckyDie, LuckyDieInfo> = {
  'none': {
    dieSides: null,
    dierector: null,
    domain: null,
    element: null,
    color: tokens.colors.text.disabled,
    description: 'No Die-rector patron. You walk alone, outside the favor system.',
    tier: null,
  },
  'd4': {
    dieSides: 4,
    dierector: 'the-one',
    domain: 'null-providence',
    element: 'Void',
    color: tokens.colors.primary,  // Red
    description: 'The One watches over you. Void energy pulses through your d4 rolls.',
    tier: 1,
  },
  'd6': {
    dieSides: 6,
    dierector: 'john',
    domain: 'mechanarium',
    element: 'Earth',
    color: '#ff9100',  // Orange
    description: 'John\'s mechanical precision guides your d6. Earth and stone answer your call.',
    tier: 2,
  },
  'd8': {
    dieSides: 8,
    dierector: 'peter',
    domain: 'shadow-keep',
    element: 'Death',
    color: '#9c27b0',  // Purple
    description: 'Peter grants you shadow\'s embrace. Your d8 carries the weight of death.',
    tier: 3,
  },
  'd10': {
    dieSides: 10,
    dierector: 'robert',
    domain: 'infernus',
    element: 'Fire',
    color: tokens.colors.success,  // Green (fire = life)
    description: 'Robert\'s flames fuel your d10. Fire burns in your favor.',
    tier: 4,
  },
  'd12': {
    dieSides: 12,
    dierector: 'alice',
    domain: 'frost-reach',
    element: 'Ice',
    color: tokens.colors.secondary,  // Cyan
    description: 'Alice\'s cold logic sharpens your d12. Ice preserves what matters.',
    tier: 5,
  },
  'd20': {
    dieSides: 20,
    dierector: 'jane',
    domain: 'aberrant',
    element: 'Wind',
    color: tokens.colors.warning,  // Gold
    description: 'Jane\'s chaos empowers your d20. The wind carries your destiny.',
    tier: 6,
  },
  'all': {
    dieSides: null,
    dierector: 'board-room',
    domain: null,
    element: null,
    color: '#ffffff',  // White
    description: 'The Board Room grants favor on all dice. Every roll carries potential blessing.',
    tier: null,
  },
};

// ============================================================
// LUCKY DIE BONUSES - Streamlined System
// ============================================================

export const LUCKY_DIE_BONUSES = {
  // When rolling YOUR Lucky Die:
  goldBonus: 1.20,       // +20% gold on matching die
  critBonus: 2,          // +2 to crit threshold (easier crits)

  // When in YOUR Lucky Die's domain:
  domainBonus: 1.15,     // +15% score in aligned domain

  // NPC interactions:
  shopDiscount: 0.90,    // -10% prices from aligned NPCs
  relationshipBoost: 1,  // +1 starting relationship with aligned NPCs
} as const;

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Get Lucky Die config by die type
 */
export function getLuckyDieInfo(die: LuckyDie): LuckyDieInfo {
  return LUCKY_DIE_CONFIG[die];
}

/**
 * Get color for a Lucky Die
 */
export function getLuckyDieColor(die: LuckyDie): string {
  return LUCKY_DIE_CONFIG[die]?.color || tokens.colors.text.disabled;
}

/**
 * Convert legacy lucky number (0-7) to LuckyDie
 */
export function luckyNumberToLuckyDie(num: number): LuckyDie {
  switch (num) {
    case 0: return 'none';
    case 1: return 'd4';
    case 2: return 'd6';
    case 3: return 'd8';
    case 4: return 'd10';
    case 5: return 'd12';
    case 6: return 'd20';
    case 7: return 'all';
    default: return 'none';
  }
}

/**
 * Convert LuckyDie to legacy lucky number (for compatibility)
 */
export function luckyDieToNumber(die: LuckyDie): number {
  switch (die) {
    case 'none': return 0;
    case 'd4': return 1;
    case 'd6': return 2;
    case 'd8': return 3;
    case 'd10': return 4;
    case 'd12': return 5;
    case 'd20': return 6;
    case 'all': return 7;
    default: return 0;
  }
}

/**
 * Convert die sides to LuckyDie
 */
export function dieSidesToLuckyDie(sides: DieSides): LuckyDie {
  return `d${sides}` as LuckyDie;
}

/**
 * Check if player's Lucky Die is aligned with a domain
 */
export function isAlignedDomain(playerDie: LuckyDie, domainSlug: string): boolean {
  if (playerDie === 'all') return true;  // Board Room aligns with all
  if (playerDie === 'none') return false;
  const config = LUCKY_DIE_CONFIG[playerDie];
  return config?.domain === domainSlug;
}

/**
 * Check if player's Lucky Die is aligned with an NPC
 * (NPC must have luckyDie field matching player's)
 */
export function isAlignedNPC(playerDie: LuckyDie, npcLuckyDie?: LuckyDie): boolean {
  if (!npcLuckyDie) return false;
  if (playerDie === 'all' || npcLuckyDie === 'all') return true;
  return playerDie === npcLuckyDie;
}

/**
 * Calculate gold bonus when rolling a specific die
 */
export function getGoldBonus(playerLuckyDie: LuckyDie, rolledDie: DieSides): number {
  if (playerLuckyDie === 'all') return LUCKY_DIE_BONUSES.goldBonus;
  if (playerLuckyDie === 'none') return 1.0;
  const dieString = `d${rolledDie}` as LuckyDie;
  return dieString === playerLuckyDie ? LUCKY_DIE_BONUSES.goldBonus : 1.0;
}

/**
 * Calculate crit bonus when rolling a specific die
 */
export function getCritBonus(playerLuckyDie: LuckyDie, rolledDie: DieSides): number {
  if (playerLuckyDie === 'all') return LUCKY_DIE_BONUSES.critBonus;
  if (playerLuckyDie === 'none') return 0;
  const dieString = `d${rolledDie}` as LuckyDie;
  return dieString === playerLuckyDie ? LUCKY_DIE_BONUSES.critBonus : 0;
}

/**
 * Calculate domain score bonus
 */
export function getDomainBonus(playerLuckyDie: LuckyDie, domainSlug: string): number {
  return isAlignedDomain(playerLuckyDie, domainSlug)
    ? LUCKY_DIE_BONUSES.domainBonus
    : 1.0;
}

/**
 * Calculate shop price modifier
 */
export function getShopPriceModifier(playerLuckyDie: LuckyDie, shopLuckyDie?: LuckyDie): number {
  return isAlignedNPC(playerLuckyDie, shopLuckyDie)
    ? LUCKY_DIE_BONUSES.shopDiscount
    : 1.0;
}

// ============================================================
// FIRST ROLL DETERMINATION
// ============================================================

export interface RollResult {
  die: DieSides;
  value: number;
}

/**
 * Determine Lucky Die from first roll results.
 * Returns the die with highest value.
 * If tie, returns array of tied dice for player choice.
 */
export function determineFirstRollLuckyDie(
  rolls: RollResult[]
): { luckyDie: LuckyDie; tiedDice: LuckyDie[] | null } {
  if (rolls.length === 0) {
    return { luckyDie: 'none', tiedDice: null };
  }

  // Find max value
  const maxValue = Math.max(...rolls.map(r => r.value));

  // Find all dice with max value
  const winners = rolls.filter(r => r.value === maxValue);

  if (winners.length === 1) {
    // Clear winner
    return {
      luckyDie: `d${winners[0].die}` as LuckyDie,
      tiedDice: null,
    };
  }

  // Tie - return all tied dice for player choice
  return {
    luckyDie: `d${winners[0].die}` as LuckyDie, // Default to first
    tiedDice: winners.map(w => `d${w.die}` as LuckyDie),
  };
}

/**
 * Get all Lucky Die options for UI (excludes hidden 'none' and 'all')
 */
export function getSelectableLuckyDice(): LuckyDie[] {
  return ['d4', 'd6', 'd8', 'd10', 'd12', 'd20'];
}

/**
 * Get display label for Lucky Die
 */
export function getLuckyDieLabel(die: LuckyDie): string {
  if (die === 'none') return 'None';
  if (die === 'all') return 'All';
  return die.toUpperCase();
}
