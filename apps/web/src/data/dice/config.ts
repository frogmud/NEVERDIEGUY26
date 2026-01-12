// Dice Configuration - Links dice types to Die-rector alliances
import type { LuckyDie, LuckyNumber, Element, DieSides } from '../wiki/types';

// Re-export DieSides for convenience
export type { DieSides } from '../wiki/types';

// Die colors by type
const DIE_COLORS: Record<LuckyDie, string> = {
  none: '#666666',
  d4: '#9c27b0',   // Purple (The One - Void)
  d6: '#8b7355',   // Brown (John - Earth)
  d8: '#424242',   // Dark gray (Peter - Death)
  d10: '#d84315',  // Orange (Robert - Fire)
  d12: '#81d4fa',  // Ice blue (Alice - Ice)
  d20: '#26a69a',  // Teal (Jane - Wind)
  all: '#ffd700',  // Gold (All)
};

// Get color for a die type
function getLuckyDieColor(die: LuckyDie): string {
  return DIE_COLORS[die] || DIE_COLORS.none;
}

// Dice configuration with Die-rector mappings and roguelike properties
export interface DiceConfig {
  sides: DieSides;
  label: string;
  luckyDie: LuckyDie;            // Die-rector alliance (d4=The One, etc.)
  luckyNumber: LuckyNumber;      // Legacy (deprecated - use luckyDie)
  dierector: string;
  domain: string;
  element: Element;

  // Roguelike properties
  tier: 1 | 2 | 3 | 4 | 5 | 6;
  damageRange: [number, number];
  lootBonus: number; // % bonus to loot rarity
  critThreshold: number; // Roll >= this for crit
}

// Core dice types mapped to Die-rectors
// Element wheel: Void -> Earth -> Death -> Fire -> Ice -> Wind -> Void
export const DICE_CONFIG: DiceConfig[] = [
  {
    sides: 4, label: 'd4', luckyDie: 'd4', luckyNumber: 1,
    dierector: 'the-one', domain: 'null-providence', element: 'Void',
    tier: 1, damageRange: [1, 4], lootBonus: 0, critThreshold: 4,
  },
  {
    sides: 6, label: 'd6', luckyDie: 'd6', luckyNumber: 2,
    dierector: 'john', domain: 'mechanarium', element: 'Earth',
    tier: 2, damageRange: [1, 6], lootBonus: 5, critThreshold: 6,
  },
  {
    sides: 8, label: 'd8', luckyDie: 'd8', luckyNumber: 3,
    dierector: 'peter', domain: 'shadow-keep', element: 'Death',
    tier: 3, damageRange: [1, 8], lootBonus: 10, critThreshold: 7,
  },
  {
    sides: 10, label: 'd10', luckyDie: 'd10', luckyNumber: 4,
    dierector: 'robert', domain: 'infernus', element: 'Fire',
    tier: 4, damageRange: [1, 10], lootBonus: 15, critThreshold: 9,
  },
  {
    sides: 12, label: 'd12', luckyDie: 'd12', luckyNumber: 5,
    dierector: 'alice', domain: 'frost-reach', element: 'Ice',
    tier: 5, damageRange: [1, 12], lootBonus: 20, critThreshold: 11,
  },
  {
    sides: 20, label: 'd20', luckyDie: 'd20', luckyNumber: 6,
    dierector: 'jane', domain: 'aberrant', element: 'Wind',
    tier: 6, damageRange: [1, 20], lootBonus: 30, critThreshold: 18,
  },
];

// Get dice config by sides
export function getDiceConfig(sides: number): DiceConfig | undefined {
  return DICE_CONFIG.find(d => d.sides === sides);
}

// Get Die-rector color for a dice type
export function getDiceColor(sides: number): string {
  const config = getDiceConfig(sides);
  return config ? getLuckyDieColor(config.luckyDie) : getLuckyDieColor('none');
}

// Get all dice types as a simple array (for components)
export function getDiceTypes() {
  return DICE_CONFIG.map(d => ({
    sides: d.sides,
    label: d.label,
    color: getDiceColor(d.sides),
  }));
}
