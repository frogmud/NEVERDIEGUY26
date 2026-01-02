/**
 * NPC Enhancements
 *
 * Enhanced profiles for NPCs with behavioral archetypes, quirks, triggers,
 * and topic affinities. These extend the base personality system.
 */

import type { BehavioralArchetype } from '../personality/behavioral-patterns';
import type { TopicAffinity, TopicCategory } from '../social/conversation-threading';
import type { Quirk, EmotionalTrigger } from '../personality/personality-dynamics';

// ============================================
// Enhanced NPC Profile
// ============================================

export interface EnhancedNPCProfile {
  slug: string;
  archetype: BehavioralArchetype;
  quirks: Quirk[];
  triggers: EmotionalTrigger[];
  topicAffinity: TopicAffinity;
}

// ============================================
// Default Enhanced Profiles
// ============================================

export const ENHANCED_PROFILES: Record<string, EnhancedNPCProfile> = {
  'the-one': {
    slug: 'the-one',
    archetype: 'predator',
    quirks: [],
    triggers: [],
    topicAffinity: {
      preferred: ['lore', 'threat', 'game_meta', 'philosophy'],
      avoided: ['alliance', 'personal'],
      expertise: ['lore', 'game_meta'],
      triggers: ['alliance', 'emotional'],
    },
  },
  'john': {
    slug: 'john',
    archetype: 'opportunist',
    quirks: [],
    triggers: [],
    topicAffinity: {
      preferred: ['business', 'gossip', 'threat'],
      avoided: ['emotional'],
      expertise: ['business'],
      triggers: ['lore'],
    },
  },
  'peter': {
    slug: 'peter',
    archetype: 'warrior',
    quirks: [],
    triggers: [],
    topicAffinity: {
      preferred: ['threat', 'lore'],
      avoided: ['personal', 'emotional'],
      expertise: ['threat'],
      triggers: ['alliance'],
    },
  },
  'robert': {
    slug: 'robert',
    archetype: 'sage',
    quirks: [],
    triggers: [],
    topicAffinity: {
      preferred: ['lore', 'philosophy', 'personal'],
      avoided: ['threat', 'business'],
      expertise: ['lore', 'philosophy'],
      triggers: ['threat'],
    },
  },
  'alice': {
    slug: 'alice',
    archetype: 'trickster',
    quirks: [],
    triggers: [],
    topicAffinity: {
      preferred: ['gossip', 'humor', 'personal'],
      avoided: ['lore', 'philosophy'],
      expertise: ['gossip', 'humor'],
      triggers: ['lore'],
    },
  },
  'jane': {
    slug: 'jane',
    archetype: 'guardian',
    quirks: [],
    triggers: [],
    topicAffinity: {
      preferred: ['lore', 'threat', 'alliance'],
      avoided: ['gossip', 'humor'],
      expertise: ['lore', 'threat'],
      triggers: ['gossip'],
    },
  },
  'willy': {
    slug: 'willy',
    archetype: 'merchant',
    quirks: [],
    triggers: [],
    topicAffinity: {
      preferred: ['business', 'gossip', 'practical'],
      avoided: ['threat', 'philosophy'],
      expertise: ['business', 'practical'],
      triggers: ['threat'],
    },
  },
  'mr-bones': {
    slug: 'mr-bones',
    archetype: 'sage',
    quirks: [],
    triggers: [],
    topicAffinity: {
      preferred: ['lore', 'philosophy', 'game_meta'],
      avoided: ['business', 'humor'],
      expertise: ['lore', 'philosophy', 'game_meta'],
      triggers: ['humor'],
    },
  },
  'stitch-up-girl': {
    slug: 'stitch-up-girl',
    archetype: 'guardian',
    quirks: [],
    triggers: [],
    topicAffinity: {
      preferred: ['alliance', 'practical', 'personal'],
      avoided: ['threat'],
      expertise: ['practical', 'alliance'],
      triggers: ['threat'],
    },
  },
  'the-general-traveler': {
    slug: 'the-general-traveler',
    archetype: 'warrior',
    quirks: [],
    triggers: [],
    topicAffinity: {
      preferred: ['alliance', 'practical', 'threat'],
      avoided: ['gossip', 'humor'],
      expertise: ['practical', 'alliance'],
      triggers: ['gossip'],
    },
  },
  'boots': {
    slug: 'boots',
    archetype: 'diplomat',
    quirks: [],
    triggers: [],
    topicAffinity: {
      preferred: ['alliance', 'practical', 'gossip'],
      avoided: ['threat'],
      expertise: ['practical'],
      triggers: ['threat'],
    },
  },
  'boo-g': {
    slug: 'boo-g',
    archetype: 'trickster',
    quirks: [],
    triggers: [],
    topicAffinity: {
      preferred: ['humor', 'gossip', 'personal'],
      avoided: ['lore', 'philosophy'],
      expertise: ['humor'],
      triggers: ['threat'],
    },
  },
};

// ============================================
// Profile Accessors
// ============================================

export function getEnhancedProfile(npcSlug: string): EnhancedNPCProfile | null {
  return ENHANCED_PROFILES[npcSlug] ?? null;
}

export function getAllEnhancedProfiles(): EnhancedNPCProfile[] {
  return Object.values(ENHANCED_PROFILES);
}

export function registerEnhancedProfile(profile: EnhancedNPCProfile): void {
  ENHANCED_PROFILES[profile.slug] = profile;
}

export function getArchetypeForNPC(npcSlug: string): BehavioralArchetype {
  return ENHANCED_PROFILES[npcSlug]?.archetype ?? 'diplomat';
}
