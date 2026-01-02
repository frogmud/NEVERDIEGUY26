/**
 * NPC Definitions Index
 *
 * Central export for all NPC configurations with archetypes and goals.
 */

// ============================================
// Individual Exports
// ============================================

// Pantheon (Die-rectors and Cosmic Horrors)
export {
  THE_ONE,
  JOHN,
  PETER,
  ROBERT,
  ALICE,
  JANE,
  RHEA,
  ZERO_CHANCE,
  ALIEN_BABY,
  PANTHEON_NPCS,
} from './pantheon';

// Wanderers (Merchants and Neutral Parties)
export {
  WILLY,
  MR_BONES,
  DR_MAXWELL,
  BOO_G,
  THE_GENERAL_WANDERER,
  DR_VOSS,
  XTREME,
  KING_JAMES_WANDERER,
  WANDERER_NPCS,
} from './wanderers';

// Travelers (Friendly Allies)
export {
  STITCH_UP_GIRL,
  THE_GENERAL_TRAVELER,
  BODY_COUNT,
  BOOTS,
  CLAUSEN,
  KEITH_MAN,
  MR_KEVIN,
  TRAVELER_NPCS,
} from './travelers';

// ============================================
// Combined Exports
// ============================================

import { PANTHEON_NPCS } from './pantheon';
import { WANDERER_NPCS } from './wanderers';
import { TRAVELER_NPCS } from './travelers';
import type { EnhancedNPCConfig } from '../types';

/**
 * All NPCs combined
 */
export const ALL_NPCS: EnhancedNPCConfig[] = [
  ...PANTHEON_NPCS,
  ...WANDERER_NPCS,
  ...TRAVELER_NPCS,
];

/**
 * NPC lookup by slug
 */
export const NPC_BY_SLUG: Record<string, EnhancedNPCConfig> = Object.fromEntries(
  ALL_NPCS.map(npc => [npc.identity.slug, npc])
);

/**
 * Get NPC by slug
 */
export function getNPCDefinition(slug: string): EnhancedNPCConfig | null {
  return NPC_BY_SLUG[slug] ?? null;
}

/**
 * Get NPCs by category
 */
export function getNPCsByCategory(category: 'pantheon' | 'wanderers' | 'travelers'): EnhancedNPCConfig[] {
  switch (category) {
    case 'pantheon':
      return PANTHEON_NPCS;
    case 'wanderers':
      return WANDERER_NPCS;
    case 'travelers':
      return TRAVELER_NPCS;
  }
}

/**
 * Get all shopkeeper NPCs
 */
export function getShopkeepers(): EnhancedNPCConfig[] {
  return ALL_NPCS.filter(npc => npc.gameAttributes.isShopkeeper);
}

/**
 * Get NPCs by archetype
 */
export function getNPCsByArchetype(archetype: string): EnhancedNPCConfig[] {
  return ALL_NPCS.filter(npc => npc.archetype === archetype);
}

/**
 * Get NPCs by location
 */
export function getNPCsByLocation(location: string): EnhancedNPCConfig[] {
  return ALL_NPCS.filter(npc =>
    npc.gameAttributes.preferredLocations?.includes(location) ||
    npc.gameAttributes.homeLocation === location
  );
}

/**
 * NPC count by category
 */
export const NPC_COUNTS = {
  pantheon: PANTHEON_NPCS.length,
  wanderers: WANDERER_NPCS.length,
  travelers: TRAVELER_NPCS.length,
  total: ALL_NPCS.length,
};
