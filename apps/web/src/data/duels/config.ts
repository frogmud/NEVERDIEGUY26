// Duel configurations for NPC encounters
// Each wanderer can challenge the player to a Cee-lo style dice duel

import type { DieSides } from '../wiki/types';
import type { EncounterState } from '../../games/meteor/gameConfig';
import { wanderers } from '../wiki/entities/wanderers';

export interface DuelConfig {
  npcSlug: string;
  npcDice: DieSides;
  npcBonus: number;
  reward: { type: 'gold' | 'item'; amount: number };
  domains: number[]; // Which domains this NPC appears in
  encounterChance: number; // 0-100
  aggressive?: boolean; // More likely to appear when player skips events
}

// Duel configurations for each wanderer
export const DUEL_CONFIGS: DuelConfig[] = [
  {
    npcSlug: 'willy',
    npcDice: 12, // d12 - Alice's die (Ice)
    npcBonus: 2,
    reward: { type: 'gold', amount: 100 },
    domains: [1, 2, 3, 4, 5, 6], // Appears everywhere
    encounterChance: 15,
  },
  {
    npcSlug: 'mr-bones',
    npcDice: 8, // d8 - Peter's die (Death)
    npcBonus: 1,
    reward: { type: 'gold', amount: 75 },
    domains: [2, 3, 4, 5], // Mid-game domains
    encounterChance: 20,
    aggressive: true,
  },
  {
    npcSlug: 'boo-g',
    npcDice: 20, // d20 - Jane's die (Wind)
    npcBonus: 0,
    reward: { type: 'gold', amount: 150 },
    domains: [4, 5, 6], // Later domains
    encounterChance: 10,
  },
  {
    npcSlug: 'king-james',
    npcDice: 10, // d10 - Robert's die (Fire)
    npcBonus: 3,
    reward: { type: 'gold', amount: 120 },
    domains: [3, 4, 5, 6],
    encounterChance: 15,
    aggressive: true,
  },
  {
    npcSlug: 'dr-maxwell',
    npcDice: 6, // d6 - John's die (Earth)
    npcBonus: 2,
    reward: { type: 'gold', amount: 60 },
    domains: [1, 2, 3],
    encounterChance: 25,
  },
];

// Get a random encounter for a domain
// skipPressure boosts aggressive NPC encounter chances
export function getRandomEncounter(
  domain: number,
  playerPreferredDice: DieSides = 20,
  skipPressure: number = 0
): EncounterState | null {
  // Filter configs by domain
  const availableConfigs = DUEL_CONFIGS.filter((config) =>
    config.domains.includes(domain)
  );

  if (availableConfigs.length === 0) return null;

  // Roll for each potential encounter
  // Aggressive NPCs get boosted chance based on skipPressure
  for (const config of availableConfigs) {
    const baseChance = config.encounterChance;
    // Each skipPressure point adds +10% to aggressive NPC chance
    const aggroBoost = config.aggressive ? skipPressure * 10 : 0;
    const finalChance = Math.min(baseChance + aggroBoost, 95); // Cap at 95%

    if (Math.random() * 100 < finalChance) {
      const wanderer = wanderers.find((w) => w.slug === config.npcSlug);
      if (!wanderer) continue;

      return {
        npcSlug: config.npcSlug,
        npcName: wanderer.name,
        npcDice: config.npcDice,
        playerDice: playerPreferredDice,
        npcBonus: config.npcBonus,
        drawCount: 0,
        reward: config.reward,
      };
    }
  }

  return null;
}

// Check if an encounter should trigger (base 20% chance)
export function shouldTriggerEncounter(): boolean {
  return Math.random() < 0.2;
}

// Check if a skip-triggered encounter should happen
// Higher skipPressure = higher chance, always prioritizes aggressive NPCs
export function shouldTriggerSkipEncounter(skipPressure: number): boolean {
  // Base 10% + 15% per skip pressure point (stacking)
  const chance = 0.1 + skipPressure * 0.15;
  return Math.random() < Math.min(chance, 0.8); // Cap at 80%
}

// Get an aggressive encounter (for skip triggers)
// Only returns aggressive NPCs, with guaranteed selection if any available
export function getAggressiveEncounter(
  domain: number,
  playerPreferredDice: DieSides = 20
): EncounterState | null {
  // Filter to aggressive NPCs in this domain
  const aggressiveConfigs = DUEL_CONFIGS.filter(
    (config) => config.aggressive && config.domains.includes(domain)
  );

  if (aggressiveConfigs.length === 0) {
    // Fall back to any NPC if no aggressive ones available
    return getRandomEncounter(domain, playerPreferredDice, 0);
  }

  // Pick a random aggressive NPC
  const config = aggressiveConfigs[Math.floor(Math.random() * aggressiveConfigs.length)];
  const wanderer = wanderers.find((w) => w.slug === config.npcSlug);

  if (!wanderer) return null;

  return {
    npcSlug: config.npcSlug,
    npcName: wanderer.name,
    npcDice: config.npcDice,
    playerDice: playerPreferredDice,
    npcBonus: config.npcBonus,
    drawCount: 0,
    reward: config.reward,
  };
}
