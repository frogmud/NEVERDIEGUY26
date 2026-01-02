/**
 * NPC Registry
 *
 * Central registry for all NPCs with their enhanced configurations.
 * Provides lookup, filtering, and management functions.
 */

import type { NPCCategory, MoodType } from '../core/types';
import type { BehavioralArchetype } from '../personality/behavioral-patterns';
import type {
  EnhancedNPCConfig,
  NPCRegistryEntry,
} from './types';
import { createEnhancedNPCConfig, CATEGORY_DEFAULTS } from './types';
import { registerEnhancedProfile } from './npc-enhancements';

// ============================================
// Registry State
// ============================================

const registry: Map<string, NPCRegistryEntry> = new Map();

// ============================================
// Registry Operations
// ============================================

export function registerNPC(config: EnhancedNPCConfig): void {
  registry.set(config.identity.slug, {
    config,
    active: true,
  });

  // Also register in enhanced profiles for backward compatibility
  registerEnhancedProfile({
    slug: config.identity.slug,
    archetype: config.archetype,
    quirks: config.quirks,
    triggers: config.triggers,
    topicAffinity: config.topicAffinity,
  });
}

export function unregisterNPC(slug: string): void {
  registry.delete(slug);
}

export function getNPC(slug: string): EnhancedNPCConfig | null {
  return registry.get(slug)?.config ?? null;
}

export function getAllNPCs(): EnhancedNPCConfig[] {
  return Array.from(registry.values()).map(e => e.config);
}

export function getActiveNPCs(): EnhancedNPCConfig[] {
  return Array.from(registry.values())
    .filter(e => e.active)
    .map(e => e.config);
}

// ============================================
// Filtering
// ============================================

export function getNPCsByCategory(category: NPCCategory): EnhancedNPCConfig[] {
  return getAllNPCs().filter(npc => npc.identity.category === category);
}

export function getNPCsByArchetype(archetype: BehavioralArchetype): EnhancedNPCConfig[] {
  return getAllNPCs().filter(npc => npc.archetype === archetype);
}

export function getShopkeepers(): EnhancedNPCConfig[] {
  return getAllNPCs().filter(npc => npc.gameAttributes.isShopkeeper);
}

export function getNPCsByLocation(location: string): EnhancedNPCConfig[] {
  return Array.from(registry.values())
    .filter(e => e.currentLocation === location)
    .map(e => e.config);
}

export function getQuestGivers(): EnhancedNPCConfig[] {
  return getAllNPCs().filter(npc => npc.gameAttributes.questGiver);
}

// ============================================
// State Management
// ============================================

export function setNPCActive(slug: string, active: boolean): void {
  const entry = registry.get(slug);
  if (entry) {
    entry.active = active;
  }
}

export function updateNPCLocation(slug: string, location: string, turn: number): void {
  const entry = registry.get(slug);
  if (entry) {
    entry.currentLocation = location;
    entry.lastSeen = turn;
  }
}

export function getNPCEntry(slug: string): NPCRegistryEntry | null {
  return registry.get(slug) ?? null;
}

// ============================================
// Bulk Operations
// ============================================

export function registerNPCs(configs: EnhancedNPCConfig[]): void {
  for (const config of configs) {
    registerNPC(config);
  }
}

export function clearRegistry(): void {
  registry.clear();
}

export function getRegistrySize(): number {
  return registry.size;
}

// ============================================
// Quick NPC Creation
// ============================================

export function createQuickNPC(
  slug: string,
  name: string,
  category: NPCCategory,
  archetype?: BehavioralArchetype,
  options?: Partial<EnhancedNPCConfig>
): EnhancedNPCConfig {
  return createEnhancedNPCConfig(
    {
      slug,
      name,
      category,
      title: options?.identity?.title,
    },
    {
      archetype,
      ...options,
    }
  );
}

// ============================================
// Re-exports
// ============================================

export type {
  EnhancedNPCConfig,
  NPCRegistryEntry,
  NPCGameAttributes,
} from './types';

export {
  createEnhancedNPCConfig,
  npcConfigToPersonality,
  CATEGORY_DEFAULTS,
} from './types';

export type {
  EnhancedNPCProfile,
} from './npc-enhancements';

export {
  getEnhancedProfile,
  getAllEnhancedProfiles,
  registerEnhancedProfile,
  getArchetypeForNPC,
  ENHANCED_PROFILES,
} from './npc-enhancements';

// ============================================
// NPC Definitions
// ============================================

export {
  // Pantheon
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
  // Wanderers
  WILLY,
  MR_BONES,
  DR_MAXWELL,
  BOO_G,
  THE_GENERAL_WANDERER,
  DR_VOSS,
  XTREME,
  KING_JAMES_WANDERER,
  WANDERER_NPCS,
  // Travelers
  STITCH_UP_GIRL,
  THE_GENERAL_TRAVELER,
  BODY_COUNT,
  BOOTS,
  CLAUSEN,
  KEITH_MAN,
  MR_KEVIN,
  TRAVELER_NPCS,
  // Combined
  ALL_NPCS,
  NPC_BY_SLUG,
  NPC_COUNTS,
  getNPCDefinition,
} from './definitions';

// ============================================
// Initialization
// ============================================

import { ALL_NPCS } from './definitions';

/**
 * Initialize the NPC registry with all defined NPCs.
 * Call this once at application startup.
 */
export function initializeNPCRegistry(): void {
  registerNPCs(ALL_NPCS);
}

/**
 * Check if the registry has been initialized
 */
export function isRegistryInitialized(): boolean {
  return registry.size > 0;
}
