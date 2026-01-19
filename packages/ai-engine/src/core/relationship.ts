/**
 * Relationship System
 *
 * Manages NPC-to-NPC and NPC-to-Player relationships.
 * All stat changes are observable for the dashboard.
 */

import type {
  NPCRelationship,
  RelationshipStats,
  RelationshipEvent,
  RelationshipEventType,
  MoodType,
  MoodState,
  ObservedStatChange,
} from './types';

// ============================================
// Constants
// ============================================

const MAX_HISTORY = 20;

const STAT_BOUNDS: Record<keyof RelationshipStats, [number, number]> = {
  respect: [-100, 100],
  familiarity: [0, 100],
  trust: [-100, 100],
  fear: [0, 100],
  debt: [-1000, 1000],
};

// ============================================
// Factory Functions
// ============================================

export function createDefaultStats(): RelationshipStats {
  return {
    respect: 0,
    familiarity: 0,
    trust: 0,
    fear: 0,
    debt: 0,
  };
}

export function createDefaultRelationship(targetSlug: string): NPCRelationship {
  return {
    targetSlug,
    stats: createDefaultStats(),
    history: [],
    lastInteraction: Date.now(),
    interactionCount: 0,
  };
}

// ============================================
// Stat Manipulation
// ============================================

function clampStat(stat: keyof RelationshipStats, value: number): number {
  const [min, max] = STAT_BOUNDS[stat];
  return Math.max(min, Math.min(max, value));
}

export function modifyStat(
  relationship: NPCRelationship,
  stat: keyof RelationshipStats,
  change: number,
  sourceNPC: string,
  reason: string
): { relationship: NPCRelationship; change: ObservedStatChange } {
  // P0-006 FIX: Guard against null/NaN values
  const rawPreviousValue = relationship.stats[stat];
  const previousValue = Number.isFinite(rawPreviousValue) ? rawPreviousValue : 0;
  const validChange = Number.isFinite(change) ? change : 0;
  const newValue = clampStat(stat, previousValue + validChange);
  const actualChange = newValue - previousValue;

  const observedChange: ObservedStatChange = {
    timestamp: Date.now(),
    sourceNPC,
    targetNPC: relationship.targetSlug,
    stat,
    previousValue,
    newValue,
    change: actualChange,
    reason,
  };

  return {
    relationship: {
      ...relationship,
      stats: {
        ...relationship.stats,
        [stat]: newValue,
      },
    },
    change: observedChange,
  };
}

// ============================================
// Event Recording
// ============================================

export function recordEvent(
  relationship: NPCRelationship,
  type: RelationshipEventType,
  details?: string,
  statChanges?: Partial<RelationshipStats>
): NPCRelationship {
  const event: RelationshipEvent = {
    type,
    timestamp: Date.now(),
    details,
    statChanges,
  };

  return {
    ...relationship,
    history: [event, ...relationship.history].slice(0, MAX_HISTORY),
    lastInteraction: Date.now(),
    interactionCount: relationship.interactionCount + 1,
  };
}

// ============================================
// Mood Derivation
// ============================================

const MOOD_THRESHOLDS: Array<{
  mood: MoodType;
  check: (stats: RelationshipStats) => boolean;
  priority: number;
}> = [
  {
    mood: 'threatening',
    check: (s) => s.respect < -50 && s.fear < 30,
    priority: 10,
  },
  {
    mood: 'fearful',
    check: (s) => s.fear > 70,
    priority: 9,
  },
  {
    mood: 'generous',
    check: (s) => s.respect > 60 && s.trust > 50,
    priority: 8,
  },
  {
    mood: 'pleased',
    check: (s) => s.respect > 30 && s.familiarity > 40,
    priority: 7,
  },
  {
    mood: 'annoyed',
    check: (s) => s.respect < -20 || s.trust < -30,
    priority: 6,
  },
  {
    mood: 'curious',
    check: (s) => s.familiarity < 20 && s.fear < 30,
    priority: 5,
  },
  {
    mood: 'amused',
    check: (s) => s.familiarity > 60 && Math.abs(s.respect) < 30,
    priority: 4,
  },
  {
    mood: 'cryptic',
    check: (s) => s.trust < 0 && s.familiarity > 30,
    priority: 3,
  },
];

export function deriveMoodFromRelationship(
  stats: RelationshipStats,
  defaultMood: MoodType = 'neutral'
): MoodType {
  // Sort by priority descending
  const sorted = [...MOOD_THRESHOLDS].sort((a, b) => b.priority - a.priority);

  for (const { mood, check } of sorted) {
    if (check(stats)) {
      return mood;
    }
  }

  return defaultMood;
}

export function deriveMoodState(
  stats: RelationshipStats,
  previousMood: MoodType,
  defaultMood: MoodType = 'neutral'
): MoodState {
  const current = deriveMoodFromRelationship(stats, defaultMood);

  // Calculate intensity based on stat extremes
  const extremity = Math.max(
    Math.abs(stats.respect),
    Math.abs(stats.trust),
    stats.fear,
    stats.familiarity
  );
  const intensity = Math.min(100, extremity);

  // Determine trend based on respect/trust changes
  const positiveSum = stats.respect + stats.trust;
  let trending: 'improving' | 'stable' | 'declining' = 'stable';
  if (positiveSum > 20) trending = 'improving';
  else if (positiveSum < -20) trending = 'declining';

  return { current, intensity, trending };
}

// ============================================
// Relationship Queries
// ============================================

export function getDisposition(stats: RelationshipStats): 'hostile' | 'unfriendly' | 'neutral' | 'friendly' | 'allied' {
  const score = stats.respect + stats.trust - stats.fear;

  if (score < -80) return 'hostile';
  if (score < -30) return 'unfriendly';
  if (score < 30) return 'neutral';
  if (score < 80) return 'friendly';
  return 'allied';
}

export function wouldInitiateConversation(
  stats: RelationshipStats,
  sociability: number
): boolean {
  // More likely if familiar and not hostile
  const comfort = stats.familiarity + stats.trust - stats.fear;
  const threshold = 50 - (sociability * 100);
  return comfort > threshold;
}

export function calculatePriceModifier(stats: RelationshipStats): number {
  // Positive relationship = discount, negative = markup
  const factor = (stats.respect + stats.trust) / 200; // -1 to 1
  const modifier = 1 - (factor * 0.3); // 0.7 to 1.3
  return Math.max(0.5, Math.min(1.5, modifier));
}

// ============================================
// Relationship Store
// ============================================

export interface RelationshipStore {
  relationships: Record<string, Record<string, NPCRelationship>>;
  get: (fromSlug: string, toSlug: string) => NPCRelationship;
  set: (fromSlug: string, relationship: NPCRelationship) => void;
  getAll: (fromSlug: string) => NPCRelationship[];
}

export function createRelationshipStore(): RelationshipStore {
  const relationships: Record<string, Record<string, NPCRelationship>> = {};

  return {
    relationships,

    get(fromSlug: string, toSlug: string): NPCRelationship {
      if (!relationships[fromSlug]) {
        relationships[fromSlug] = {};
      }
      if (!relationships[fromSlug][toSlug]) {
        relationships[fromSlug][toSlug] = createDefaultRelationship(toSlug);
      }
      return relationships[fromSlug][toSlug];
    },

    set(fromSlug: string, relationship: NPCRelationship): void {
      if (!relationships[fromSlug]) {
        relationships[fromSlug] = {};
      }
      relationships[fromSlug][relationship.targetSlug] = relationship;
    },

    getAll(fromSlug: string): NPCRelationship[] {
      return Object.values(relationships[fromSlug] || {});
    },
  };
}
