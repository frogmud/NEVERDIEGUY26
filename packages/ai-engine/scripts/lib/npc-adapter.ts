/**
 * NPC Adapter - Bridge between canonical NPC definitions and script formats
 *
 * Scripts often need a simpler NPC format than EnhancedNPCConfig.
 * This adapter provides conversion utilities.
 */

import {
  ALL_NPCS,
  WANDERER_NPCS,
  TRAVELER_NPCS,
  PANTHEON_NPCS,
  getNPCDefinition,
  type EnhancedNPCConfig,
} from '../../src/npcs/definitions';

// ============================================
// Simplified NPC Definition (for scripts)
// ============================================

export interface SimpleNPC {
  slug: string;
  name: string;
  category: 'wanderer' | 'traveler' | 'pantheon';
  personality: string;
  luckyNumber: number;
  voice: string;
  quirks: string[];
  catchphrases: string[];
  obsessions: string[];
  rivals: string[];
  archetype: string;
  defaultMood: string;
  sociability: number;
}

// ============================================
// Conversion
// ============================================

/**
 * Convert EnhancedNPCConfig to SimpleNPC format
 */
export function toSimpleNPC(npc: EnhancedNPCConfig): SimpleNPC {
  // Extract voice from quirks
  const speechQuirk = npc.quirks?.find(q => q.type === 'speech_pattern');

  // Build personality string
  const personality = `${npc.archetype}, ${npc.defaultMood} by default`;

  // Extract obsessions from topicAffinity
  const obsessions = [
    ...(npc.topicAffinity?.preferred || []),
    ...(npc.topicAffinity?.expertise || []),
  ];

  // Extract catchphrases from templates (if any)
  const catchphrases: string[] = npc.templates
    ?.filter(t => t.pool === 'greeting' || t.pool === 'reaction')
    .slice(0, 3)
    .map(t => t.text) || [];

  // Map category
  const categoryMap: Record<string, 'wanderer' | 'traveler' | 'pantheon'> = {
    wanderers: 'wanderer',
    travelers: 'traveler',
    pantheon: 'pantheon',
  };

  return {
    slug: npc.identity.slug,
    name: npc.identity.name,
    category: categoryMap[npc.identity.category] || 'wanderer',
    personality,
    luckyNumber: 7, // Default - could be extracted from lore if present
    voice: speechQuirk?.description || 'speaks normally',
    quirks: npc.quirks?.map(q => q.description) || [],
    catchphrases,
    obsessions,
    rivals: [], // Would need social graph data
    archetype: npc.archetype,
    defaultMood: npc.defaultMood,
    sociability: npc.sociability,
  };
}

/**
 * Get all NPCs in simple format
 */
export function getAllSimpleNPCs(): SimpleNPC[] {
  return ALL_NPCS.map(toSimpleNPC);
}

/**
 * Get NPCs by category in simple format
 */
export function getSimpleNPCsByCategory(category: 'wanderer' | 'traveler' | 'pantheon'): SimpleNPC[] {
  const categoryMap: Record<string, EnhancedNPCConfig[]> = {
    wanderer: WANDERER_NPCS,
    traveler: TRAVELER_NPCS,
    pantheon: PANTHEON_NPCS,
  };

  return (categoryMap[category] || []).map(toSimpleNPC);
}

/**
 * Get simple NPC by slug
 */
export function getSimpleNPC(slug: string): SimpleNPC | null {
  const npc = getNPCDefinition(slug);
  return npc ? toSimpleNPC(npc) : null;
}

// ============================================
// Pre-computed Lists (for quick access)
// ============================================

/**
 * All NPCs in simple format (pre-computed)
 */
export const SIMPLE_ALL_NPCS = getAllSimpleNPCs();

/**
 * Wanderers in simple format
 */
export const SIMPLE_WANDERERS = getSimpleNPCsByCategory('wanderer');

/**
 * Travelers in simple format
 */
export const SIMPLE_TRAVELERS = getSimpleNPCsByCategory('traveler');

/**
 * Pantheon in simple format
 */
export const SIMPLE_PANTHEON = getSimpleNPCsByCategory('pantheon');

// ============================================
// Re-export canonical sources
// ============================================

export {
  ALL_NPCS,
  WANDERER_NPCS,
  TRAVELER_NPCS,
  PANTHEON_NPCS,
  getNPCDefinition,
  type EnhancedNPCConfig,
};
