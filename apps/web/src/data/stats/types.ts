// Dice-Themed Stat System Types
// 7 core stats tied to dice/Die-rectors, invisible to players

import type { LuckyNumber, DieSides, Element } from '../wiki/types';

// The 7 core stats
export type StatKey = 'luck' | 'essence' | 'grit' | 'shadow' | 'fury' | 'resilience' | 'swiftness';

// Base stats for all characters (Travelers, Enemies)
export interface BaseStats {
  luck: LuckyNumber;      // Player's die affinity (0-7)
  essence: number;        // d4/Void - Base power, crit multiplier
  grit: number;           // d6/Earth - HP pool, endurance (John's domain)
  shadow: number;         // d8/Death - Dodge chance, stealth
  fury: number;           // d10/Fire - Attack damage
  resilience: number;     // d12/Ice - Defense, damage reduction
  swiftness: number;      // d20/Wind - Action speed, minor crit/dodge
}

// Stat modifier from items, effects, or buffs
export interface StatModifier {
  stat: StatKey;
  flat?: number;          // +10 Fury (additive)
  percent?: number;       // +15% Resilience (0.15 = 15%)
  source: string;         // Item slug or effect name for stacking rules
}

// Computed stats after applying modifiers + derived values
export interface ComputedStats extends BaseStats {
  // Derived combat values
  maxHp: number;          // Based on grit + resilience
  damage: number;         // Based on fury + essence
  defense: number;        // Based on resilience
  dodgeChance: number;    // Based on shadow + swiftness (0-0.50)
  critChance: number;     // Based on luck + swiftness (0.05-0.50)
  critMultiplier: number; // Based on luck + essence (1.5-3.0)
  actionSpeed: number;    // Based on swiftness
  lootBonus: number;      // Based on luck (0-0.35)
}

// Configuration linking stats to dice/Die-rectors/elements
export interface StatConfig {
  die: DieSides | 0;      // 0 for luck (all dice)
  dierector: string;      // Entity slug
  element: Element;
  color: string;          // Hex color for UI (even if invisible, useful for effects)
  description: string;    // What this stat does
}

// Stat configuration mapping
export const STAT_CONFIG: Record<StatKey, StatConfig> = {
  luck: {
    die: 0,
    dierector: '', // No Die-rector - Luck is player agency (free will for games)
    element: 'Neutral',
    color: '#FFD700',
    description: 'Favor triggers, crit chance, loot quality - the player\'s will',
  },
  essence: {
    die: 4,
    dierector: 'the-one',
    element: 'Void',
    color: '#FF1744',
    description: 'Base power, reality manipulation, void damage',
  },
  grit: {
    die: 6,
    dierector: 'john',
    element: 'Earth',
    color: '#FFA726',
    description: 'Mixing stat, endurance, HP pool, DoT reduction',
  },
  shadow: {
    die: 8,
    dierector: 'peter',
    element: 'Death',
    color: '#7C4DFF',
    description: 'Dodge chance, stealth duration, ambush damage',
  },
  fury: {
    die: 10,
    dierector: 'robert',
    element: 'Fire',
    color: '#4CAF50',
    description: 'Attack damage, attack speed, berserk threshold',
  },
  resilience: {
    die: 12,
    dierector: 'alice',
    element: 'Ice',
    color: '#00E5FF',
    description: 'Damage reduction, shield strength, freeze resistance',
  },
  swiftness: {
    die: 20,
    dierector: 'jane',
    element: 'Wind',
    color: '#FFEB3B',
    description: 'Turn order, cooldown reduction, escape chance',
  },
};

// Default base stats (for fallback/testing)
export const DEFAULT_BASE_STATS: BaseStats = {
  luck: 0,
  essence: 50,
  grit: 50,
  shadow: 50,
  fury: 50,
  resilience: 50,
  swiftness: 50,
};

// Stat keys as array for iteration
export const STAT_KEYS: StatKey[] = ['luck', 'essence', 'grit', 'shadow', 'fury', 'resilience', 'swiftness'];

/**
 * Non-luck stats (for calculations that exclude luck)
 *
 * DESIGN NOTE: Luck is intentionally excluded from modifiers.
 * Luck represents player agency/choice (die affinity 0-7) and should not
 * be buffed by items. This keeps luck special and prevents stacking exploits.
 */
export const COMBAT_STAT_KEYS: Exclude<StatKey, 'luck'>[] = ['essence', 'grit', 'shadow', 'fury', 'resilience', 'swiftness'];
