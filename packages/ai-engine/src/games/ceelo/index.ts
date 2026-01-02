/**
 * Cee-lo Dice Game Engine
 *
 * A portable, deterministic Cee-lo dice game simulation engine.
 *
 * Features:
 * - Standard 3d6 Cee-lo rules (4-5-6, 1-2-3, trips, points)
 * - Seeded RNG for reproducible results
 * - Turn order management with periodic resets
 * - Win streaks and player quit handling
 * - Variable betting based on streaks and confidence
 * - Comprehensive statistics tracking
 * - Event-driven architecture for chat integration
 */

// ============================================
// Type Exports
// ============================================

export type {
  // Dice types
  DieValue,
  DiceRoll,
  CeeloOutcome,
  RollResult,
  // Player types
  PlayerCategory,
  CeeloPlayer,
  PlayerMatchState,
  // Match types
  MatchConfig,
  MatchState,
  MatchStatus,
  MatchResult,
  RoundResult,
  PlayerStanding,
  // Event types
  CeeloEventType,
  CeeloEvent,
  CeeloEventHandler,
  // Betting types
  BetCalculation,
  BetContext,
  // Chat integration
  CeeloChatContext,
  CeeloChatMessage,
  // Statistics types
  PlayerCareerStats,
  LeaderboardEntry,
  // Simulation types
  SimulationConfig,
  SimulationResult,
} from './types';

export { DEFAULT_MATCH_CONFIG } from './types';

// ============================================
// Dice Function Exports
// ============================================

export {
  rollD6,
  rollDice,
  evaluateRoll,
  compareOutcomes,
  rollUntilValid,
  determineTurnOrder,
  isBadBeat,
  isPerfectRound,
  formatRoll,
  formatOutcome,
  describeOutcome,
  getOutcomeProbabilities,
} from './dice';

// ============================================
// Match Function Exports
// ============================================

export {
  createMatch,
  executeRound,
  handlePlayerQuit,
  generateMatchResult,
  runFullMatch,
  runMatchInBackground,
  calculateBet,
} from './match';

// ============================================
// Statistics Exports
// ============================================

export {
  CeeloStatisticsManager,
  getGlobalStatsManager,
  resetGlobalStatsManager,
  type SortCriteria,
} from './statistics';

// ============================================
// Convenience Functions
// ============================================

import { ALL_NPCS } from '../../npcs/definitions';
import type { CeeloPlayer, PlayerCategory } from './types';

/**
 * Convert NPC category to Cee-lo player category
 */
function mapNPCCategory(category: string): PlayerCategory {
  switch (category) {
    case 'travelers':
      return 'traveler';
    case 'wanderers':
      return 'wanderer';
    case 'pantheon':
      return 'pantheon';
    default:
      return 'wanderer';
  }
}

/**
 * Cosmic horror slugs (luck 0, outside the system)
 */
const COSMIC_HORROR_SLUGS = [
  'rhea',
  'zero-chance',
  'alien-baby',
];

/**
 * Lucky numbers by NPC slug (from ndg26z data)
 * Total: 24 NPCs (9 Pantheon + 8 Wanderers + 7 Travelers)
 */
const NPC_LUCKY_NUMBERS: Record<string, number> = {
  // Travelers (7)
  'stitch-up-girl': 3,
  'the-general-traveler': 2,
  'body-count': 6,
  'boots': 7,
  'clausen': 4,
  'keith-man': 5,
  'mr-kevin': 1,
  // Wanderers (8)
  'willy': 5,
  'mr-bones': 5,
  'boo-g': 6,
  'king-james': 1, // Void Merchant King
  'dr-maxwell': 4,
  'the-general-wanderer': 2,
  'dr-voss': 3,
  'xtreme': 2,
  // Pantheon Die-rectors (6)
  'the-one': 1,
  'john': 2,
  'peter': 3,
  'robert': 4,
  'alice': 5,
  'jane': 6,
  // Cosmic Horrors (3) - luck 0
  'rhea': 0,
  'zero-chance': 0,
  'alien-baby': 0,
};

/**
 * Create CeeloPlayer from NPC definition
 */
export function createCeeloPlayerFromNPC(npcSlug: string): CeeloPlayer | null {
  const npc = ALL_NPCS.find(n => n.identity.slug === npcSlug);
  if (!npc) return null;

  const isCosmicHorror = COSMIC_HORROR_SLUGS.includes(npcSlug);
  const category: PlayerCategory = isCosmicHorror
    ? 'cosmic_horror'
    : mapNPCCategory(npc.identity.category);

  return {
    id: npc.identity.slug,
    slug: npc.identity.slug,
    name: npc.identity.name,
    category,
    luckyNumber: NPC_LUCKY_NUMBERS[npcSlug] ?? 0,
  };
}

/**
 * Get all NPCs as CeeloPlayers
 */
export function getAllCeeloPlayers(): CeeloPlayer[] {
  return ALL_NPCS.map(npc => {
    const isCosmicHorror = COSMIC_HORROR_SLUGS.includes(npc.identity.slug);
    const category: PlayerCategory = isCosmicHorror
      ? 'cosmic_horror'
      : mapNPCCategory(npc.identity.category);

    return {
      id: npc.identity.slug,
      slug: npc.identity.slug,
      name: npc.identity.name,
      category,
      luckyNumber: NPC_LUCKY_NUMBERS[npc.identity.slug] ?? 0,
    };
  });
}

/**
 * Get CeeloPlayers by category
 */
export function getCeeloPlayersByCategory(category: PlayerCategory): CeeloPlayer[] {
  return getAllCeeloPlayers().filter(p => p.category === category);
}
