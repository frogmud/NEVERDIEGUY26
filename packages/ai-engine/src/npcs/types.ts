/**
 * NPC Types
 *
 * Enhanced NPC configuration types that extend the base personality system
 * with behavioral archetypes, goals, and game-specific attributes.
 */

import type { NPCIdentity, NPCCategory, MoodType, TemplatePool, ResponseTemplate } from '../core/types';
import type { BehavioralArchetype } from '../personality/behavioral-patterns';
import type { TopicAffinity } from '../social/conversation-threading';
import type { Quirk, EmotionalTrigger } from '../personality/personality-dynamics';

// Stub type for removed search modules (MVP cleanup)
export interface NPCGoal {
  type: string;
  priority: number;
  target?: string;
  description?: string;
  targetMood?: string;
  conditions?: Array<{ type: string; comparison: string; value: number }>;
}

// ============================================
// Enhanced NPC Configuration
// ============================================

export interface EnhancedNPCConfig {
  // Identity
  identity: NPCIdentity;

  // Behavioral archetype
  archetype: BehavioralArchetype;

  // Base personality traits
  sociability: number;  // 0-1, tendency to initiate conversation
  defaultMood: MoodType;

  // Response weights by pool type
  basePoolWeights: Partial<Record<TemplatePool, number>>;

  // Templates for this NPC
  templates: ResponseTemplate[];

  // Enhanced features
  quirks: Quirk[];
  triggers: EmotionalTrigger[];
  topicAffinity: TopicAffinity;

  // Goals and objectives
  primaryGoals: NPCGoal[];
  secondaryGoals: NPCGoal[];

  // Game-specific attributes
  gameAttributes: NPCGameAttributes;
}

export interface NPCGameAttributes {
  // Shop/trade related
  isShopkeeper: boolean;
  tradeItems?: string[];
  priceModifier?: number;

  // Location info
  preferredLocations?: string[];
  homeLocation?: string;

  // Combat/encounter related
  threatLevel?: number;  // 0-10
  canBeFought?: boolean;

  // Lore/story flags
  isMainCharacter?: boolean;
  questGiver?: boolean;
  knowledgeDomains?: string[];

  // Sprite/visual info
  spriteKey?: string;
  portraitKey?: string;
}

// ============================================
// NPC Category Defaults
// ============================================

export const CATEGORY_DEFAULTS: Record<NPCCategory, Partial<EnhancedNPCConfig>> = {
  pantheon: {
    archetype: 'predator',
    sociability: 0.3,
    defaultMood: 'neutral',
    topicAffinity: {
      preferred: ['lore', 'threat', 'game_meta', 'philosophy'],
      avoided: ['alliance', 'personal'],
      expertise: ['lore', 'game_meta'],
      triggers: ['alliance', 'emotional'],
    },
    gameAttributes: {
      isShopkeeper: false,
      threatLevel: 8,
      canBeFought: true,
      isMainCharacter: true,
    },
  },
  wanderers: {
    archetype: 'merchant',
    sociability: 0.7,
    defaultMood: 'pleased',
    topicAffinity: {
      preferred: ['business', 'gossip', 'practical', 'humor'],
      avoided: ['threat', 'emotional'],
      expertise: ['business', 'practical'],
      triggers: ['threat', 'lore'],
    },
    gameAttributes: {
      isShopkeeper: true,
      threatLevel: 2,
      canBeFought: false,
    },
  },
  travelers: {
    archetype: 'diplomat',
    sociability: 0.6,
    defaultMood: 'curious',
    topicAffinity: {
      preferred: ['alliance', 'practical', 'personal', 'gossip'],
      avoided: ['lore', 'philosophy'],
      expertise: ['practical', 'alliance'],
      triggers: ['threat', 'philosophy'],
    },
    gameAttributes: {
      isShopkeeper: false,
      threatLevel: 4,
      canBeFought: true,
    },
  },
  shop: {
    archetype: 'merchant',
    sociability: 0.8,
    defaultMood: 'pleased',
    topicAffinity: {
      preferred: ['business', 'gossip'],
      avoided: ['threat', 'philosophy'],
      expertise: ['business'],
      triggers: ['threat'],
    },
    gameAttributes: {
      isShopkeeper: true,
      threatLevel: 1,
      canBeFought: false,
    },
  },
};

// ============================================
// NPC Registry Entry
// ============================================

export interface NPCRegistryEntry {
  config: EnhancedNPCConfig;
  active: boolean;
  lastSeen?: number;  // Turn number when last seen
  currentLocation?: string;
}

// ============================================
// Factory Functions
// ============================================

export function createEnhancedNPCConfig(
  identity: NPCIdentity,
  overrides: Partial<EnhancedNPCConfig> = {}
): EnhancedNPCConfig {
  const categoryDefaults = CATEGORY_DEFAULTS[identity.category] || CATEGORY_DEFAULTS.wanderers;

  return {
    identity,
    archetype: overrides.archetype ?? categoryDefaults.archetype ?? 'diplomat',
    sociability: overrides.sociability ?? categoryDefaults.sociability ?? 0.5,
    defaultMood: overrides.defaultMood ?? categoryDefaults.defaultMood ?? 'neutral',
    basePoolWeights: overrides.basePoolWeights ?? {},
    templates: overrides.templates ?? [],
    quirks: overrides.quirks ?? [],
    triggers: overrides.triggers ?? [],
    topicAffinity: overrides.topicAffinity ?? categoryDefaults.topicAffinity ?? {
      preferred: [],
      avoided: [],
      expertise: [],
      triggers: [],
    },
    primaryGoals: overrides.primaryGoals ?? [],
    secondaryGoals: overrides.secondaryGoals ?? [],
    gameAttributes: {
      ...categoryDefaults.gameAttributes,
      ...overrides.gameAttributes,
      isShopkeeper: overrides.gameAttributes?.isShopkeeper ?? categoryDefaults.gameAttributes?.isShopkeeper ?? false,
    },
  };
}

export function npcConfigToPersonality(config: EnhancedNPCConfig): {
  identity: NPCIdentity;
  sociability: number;
  defaultMood: MoodType;
  basePoolWeights: Partial<Record<TemplatePool, number>>;
  templates: ResponseTemplate[];
} {
  return {
    identity: config.identity,
    sociability: config.sociability,
    defaultMood: config.defaultMood,
    basePoolWeights: config.basePoolWeights,
    templates: config.templates,
  };
}
