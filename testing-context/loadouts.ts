/**
 * Loadout Presets - Starting loadouts for new runs
 *
 * Each loadout provides a different playstyle with starting items
 * from the wiki. Items are selected based on tier 1-2 availability
 * to keep starting gear balanced.
 */

export type StatKey = 'fury' | 'resilience' | 'grit' | 'swiftness' | 'shadow' | 'essence';

export interface LoadoutPreset {
  id: string;
  name: string;
  description: string;
  playstyle: string;
  icon: string; // MUI icon name
  items: string[]; // Item slugs from wiki
  statBonus: Partial<Record<StatKey, number>>; // Visual indicator of strengths
}

export const LOADOUT_PRESETS: LoadoutPreset[] = [
  {
    id: 'warrior',
    name: 'Warrior',
    description: '+1 Throw, +20% Fire damage',
    playstyle: 'Tank & Damage',
    icon: 'ShieldSharp',
    items: ['worn-dice-bag', 'fire-ember'],
    statBonus: { fury: 20, resilience: 15, grit: 10 },
  },
  {
    id: 'rogue',
    name: 'Rogue',
    description: '+1 Trade, +20% Wind damage',
    playstyle: 'Speed & Crits',
    icon: 'BoltSharp',
    items: ['traders-coin', 'wind-feather'],
    statBonus: { swiftness: 25, shadow: 20, fury: 10 },
  },
  {
    id: 'mage',
    name: 'Mage',
    description: '+10% Score, +20% Void damage',
    playstyle: 'Essence & Elements',
    icon: 'AutoAwesomeSharp',
    items: ['lucky-charm', 'void-crystal'],
    statBonus: { essence: 25, fury: 15, swiftness: 10 },
  },
  {
    id: 'survivor',
    name: 'Survivor',
    description: '+1 Throw, +10% Score',
    playstyle: 'Sustain & Endurance',
    icon: 'FavoriteSharp',
    items: ['worn-dice-bag', 'lucky-charm'],
    statBonus: { grit: 20, resilience: 15, essence: 10 },
  },
];

// Helper to get loadout by ID
export function getLoadoutById(id: string): LoadoutPreset | undefined {
  return LOADOUT_PRESETS.find(loadout => loadout.id === id);
}

// Default loadout for new players
export const DEFAULT_LOADOUT_ID = 'survivor';
