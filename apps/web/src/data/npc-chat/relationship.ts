/**
 * Unified Relationship Model
 *
 * Mood is the UI-facing label.
 * Relationship stats are the system-facing truth.
 *
 * Mood = f(relationship, runContext)
 */

import type {
  NPCRelationship,
  RelationshipEvent,
  MoodType,
  MoodGameplayEffects,
  ResponseContext,
} from './types';

// ============================================
// Default Relationship
// ============================================

export function createDefaultRelationship(npcSlug: string): NPCRelationship {
  return {
    npcSlug,
    respect: 0,
    familiarity: 0,
    debt: 0,
    history: [],
    runInteractions: 0,
    lastRoomSeen: -1,
  };
}

// ============================================
// Mood Derivation
// ============================================

/**
 * Derive mood from relationship stats + run context
 *
 * This is the core function that turns persistent relationship
 * data into a situational mood for the current moment.
 */
export function deriveMood(
  relationship: NPCRelationship,
  context: Partial<ResponseContext>
): MoodType {
  // Base score from relationship
  let baseScore = relationship.respect + relationship.familiarity * 0.3;

  // Context modifiers
  if (context.heat !== undefined && context.heat > 70) {
    baseScore -= 20; // High heat makes NPCs nervous
  }
  if (context.playerIntegrity !== undefined && context.playerIntegrity < 30) {
    baseScore += 10; // Pity for dying player
  }
  if (relationship.debt < -50) {
    baseScore -= 30; // Player owes too much
  }
  if (relationship.debt > 50) {
    baseScore += 15; // NPC owes player, feels generous
  }

  // Familiarity bonus for repeated interactions
  if (relationship.runInteractions > 3) {
    baseScore += 5; // Warmed up from talking
  }

  // Map score to mood
  if (baseScore > 60) return 'generous';
  if (baseScore > 30) return 'pleased';
  if (baseScore > -10) return 'neutral';
  if (baseScore > -40) return 'annoyed';
  return 'threatening';
}

/**
 * Derive price modifier from mood and familiarity
 */
export function derivePriceModifier(mood: MoodType, familiarity: number): number {
  const moodBase: Record<MoodType, number> = {
    generous: 0.7,
    pleased: 0.9,
    neutral: 1.0,
    annoyed: 1.2,
    threatening: 1.5,
    amused: 0.95,
    cryptic: 1.1,
  };

  const base = moodBase[mood] ?? 1.0;
  const familiarityDiscount = familiarity * 0.001; // Max 10% from familiarity

  return Math.max(0.5, base - familiarityDiscount); // Floor at 50% discount
}

// ============================================
// Mood Gameplay Effects
// ============================================

export const MOOD_EFFECTS: Record<MoodType, MoodGameplayEffects> = {
  generous: {
    priceModifier: 0.7,
    hintQuality: 'detailed',
    challengeDifficulty: 'easy',
    specialOfferChance: 0.5,
    favorDelta: 3,
  },
  pleased: {
    priceModifier: 0.9,
    hintQuality: 'detailed',
    challengeDifficulty: 'normal',
    specialOfferChance: 0.3,
    favorDelta: 2,
  },
  neutral: {
    priceModifier: 1.0,
    hintQuality: 'helpful',
    challengeDifficulty: 'normal',
    specialOfferChance: 0.1,
    favorDelta: 0,
  },
  amused: {
    priceModifier: 0.95,
    hintQuality: 'helpful',
    challengeDifficulty: 'normal',
    specialOfferChance: 0.2,
    favorDelta: 1,
  },
  cryptic: {
    priceModifier: 1.1,
    hintQuality: 'vague',
    challengeDifficulty: 'normal',
    specialOfferChance: 0.15,
    favorDelta: 0,
  },
  annoyed: {
    priceModifier: 1.2,
    hintQuality: 'vague',
    challengeDifficulty: 'hard',
    specialOfferChance: 0,
    favorDelta: -1,
  },
  threatening: {
    priceModifier: 1.5,
    hintQuality: 'vague',
    challengeDifficulty: 'hard',
    specialOfferChance: 0,
    favorDelta: -2,
  },
};

export function getMoodEffects(mood: MoodType): MoodGameplayEffects {
  return MOOD_EFFECTS[mood] ?? MOOD_EFFECTS.neutral;
}

// ============================================
// Relationship Mutations
// ============================================

/**
 * Record an interaction (increases familiarity)
 */
export function recordInteraction(
  relationship: NPCRelationship,
  roomIndex: number
): NPCRelationship {
  return {
    ...relationship,
    familiarity: Math.min(100, relationship.familiarity + 1),
    runInteractions: relationship.runInteractions + 1,
    lastRoomSeen: roomIndex,
  };
}

/**
 * Add a relationship event to history
 */
export function addRelationshipEvent(
  relationship: NPCRelationship,
  event: Omit<RelationshipEvent, 'timestamp'>
): NPCRelationship {
  const newEvent: RelationshipEvent = {
    ...event,
    timestamp: Date.now(),
  };

  // Keep only last 10 events
  const newHistory = [...relationship.history, newEvent].slice(-10);

  // Calculate respect change based on event type
  const respectDelta = getEventRespectDelta(event.type);

  return {
    ...relationship,
    history: newHistory,
    respect: Math.max(-100, Math.min(100, relationship.respect + respectDelta)),
  };
}

function getEventRespectDelta(
  eventType: RelationshipEvent['type']
): number {
  const deltas: Record<RelationshipEvent['type'], number> = {
    helped: 15,
    gifted: 10,
    traded: 3,
    spared: 20,
    defeated: -10,
    betrayed: -25,
  };
  return deltas[eventType] ?? 0;
}

/**
 * Adjust debt (positive = NPC owes player)
 */
export function adjustDebt(
  relationship: NPCRelationship,
  amount: number
): NPCRelationship {
  return {
    ...relationship,
    debt: relationship.debt + amount,
  };
}

/**
 * Reset run-specific state (call at run start)
 */
export function resetRunState(relationship: NPCRelationship): NPCRelationship {
  return {
    ...relationship,
    runInteractions: 0,
    lastRoomSeen: -1,
  };
}

// ============================================
// Favor Level (Compressed Projection)
// ============================================

/**
 * Get favor level as a single number (-100 to 100)
 * This is the "compressed projection" of the relationship
 */
export function getFavorLevel(relationship: NPCRelationship): number {
  return Math.round(
    relationship.respect * 0.6 +
      relationship.familiarity * 0.3 +
      Math.min(30, Math.max(-30, relationship.debt * 0.1))
  );
}

/**
 * Describe favor level in human terms
 */
export function describeFavorLevel(favorLevel: number): string {
  if (favorLevel > 75) return 'beloved';
  if (favorLevel > 50) return 'favored';
  if (favorLevel > 25) return 'friendly';
  if (favorLevel > 0) return 'neutral';
  if (favorLevel > -25) return 'cool';
  if (favorLevel > -50) return 'unfriendly';
  if (favorLevel > -75) return 'hostile';
  return 'despised';
}

// ============================================
// Threshold Detection
// ============================================

/**
 * Check if favor crossed a threshold (for triggering events)
 */
export function checkFavorThreshold(
  oldFavor: number,
  newFavor: number
): { crossed: boolean; direction: 'up' | 'down'; threshold: number } | null {
  const thresholds = [-75, -50, -25, 0, 25, 50, 75];

  for (const threshold of thresholds) {
    if (oldFavor < threshold && newFavor >= threshold) {
      return { crossed: true, direction: 'up', threshold };
    }
    if (oldFavor >= threshold && newFavor < threshold) {
      return { crossed: true, direction: 'down', threshold };
    }
  }

  return null;
}

// ============================================
// Mood Display Helpers
// ============================================

export interface MoodDisplay {
  color: string;
  icon: string; // MUI icon name
  label: string;
}

export function getMoodDisplay(mood: MoodType): MoodDisplay {
  const displays: Record<MoodType, MoodDisplay> = {
    generous: { color: '#4caf50', icon: 'CardGiftcard', label: 'Generous' },
    pleased: { color: '#8bc34a', icon: 'SentimentSatisfied', label: 'Pleased' },
    neutral: { color: '#9e9e9e', icon: 'SentimentNeutral', label: 'Neutral' },
    amused: { color: '#2196f3', icon: 'EmojiEmotions', label: 'Amused' },
    cryptic: { color: '#673ab7', icon: 'Psychology', label: 'Cryptic' },
    annoyed: { color: '#ff9800', icon: 'SentimentDissatisfied', label: 'Annoyed' },
    threatening: { color: '#f44336', icon: 'Warning', label: 'Threatening' },
  };
  return displays[mood];
}
