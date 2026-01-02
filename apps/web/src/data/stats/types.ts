// Dice-Themed Stat System Types
// 7 core stats tied to dice/Die-rectors, invisible to players

import type { LuckyNumber, DieSides, Element } from '../wiki/types';

// The 7 core stats
export type StatKey = 'luck' | 'essence' | 'grit' | 'shadow' | 'fury' | 'resilience' | 'swiftness';

// Base stats for all characters (Travelers, Enemies)
export interface BaseStats {
  luck: LuckyNumber;      // Player's die affinity (0-7)
  essence: number;        // d4/Void - Base power, reality manipulation
  grit: number;           // d6/Earth - Mixing stat, endurance, HP pool (John's domain)
  shadow: number;         // d8/Death - Evasion, stealth, dodge
  fury: number;           // d10/Fire - Attack power, damage output
  resilience: number;     // d12/Ice - Defense, damage reduction
  swiftness: number;      // d20/Wind - Speed, action priority
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
  maxHp: number;          // Based on john (mixing stat)
  damage: number;         // Based on fury + essence
  defense: number;        // Based on resilience
  dodgeChance: number;    // Based on shadow (0-1)
  critChance: number;     // Based on luck + swiftness (0-1)
  critMultiplier: number; // Based on essence + luck
  actionSpeed: number;    // Based on swiftness
  lootBonus: number;      // Based on luck
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

// Non-luck stats (for calculations that exclude luck)
export const COMBAT_STAT_KEYS: Exclude<StatKey, 'luck'>[] = ['essence', 'grit', 'shadow', 'fury', 'resilience', 'swiftness'];
