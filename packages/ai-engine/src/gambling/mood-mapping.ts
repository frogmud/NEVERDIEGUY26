/**
 * Gambling Mood Mapping
 *
 * Maps gambling events to mood transitions for NPCs.
 * Handles how wins, losses, streaks, and special events affect NPC emotional states.
 */

import type { MoodType } from '../core/types';
import type { CeeloEventType, PlayerMatchState, PlayerCategory } from '../games/ceelo/types';
import type { BehavioralArchetype } from '../personality/behavioral-patterns';

// ============================================
// Mood Transition Types
// ============================================

export interface MoodTransition {
  fromMood: MoodType | '*';  // '*' means any mood
  toMood: MoodType;
  trigger: CeeloEventType;
  conditions?: MoodCondition[];
  intensity: number;  // 0-100, how strongly this affects mood
  probability: number;  // 0-1, chance of this transition occurring
}

export interface MoodCondition {
  type: 'streak' | 'lossStreak' | 'goldLost' | 'relationship' | 'archetype';
  comparison: 'gte' | 'lte' | 'eq' | 'gt' | 'lt';
  value: number | string;
}

export interface GamblingMoodContext {
  currentMood: MoodType;
  moodIntensity: number;
  playerState: PlayerMatchState;
  opponentState?: PlayerMatchState;
  archetype: BehavioralArchetype;
  category: PlayerCategory;
  eventType: CeeloEventType;
  wasBadBeat?: boolean;
  hadTrips?: boolean;
  streakBroken?: boolean;
  previousStreak?: number;
}

// ============================================
// Mood Transition Rules
// ============================================

export const MOOD_TRANSITIONS: MoodTransition[] = [
  // ============================================
  // WINNING
  // ============================================

  // Standard win reactions
  { fromMood: '*', toMood: 'pleased', trigger: 'round_ended', intensity: 60, probability: 0.7,
    conditions: [{ type: 'streak', comparison: 'gte', value: 1 }] },
  { fromMood: 'neutral', toMood: 'amused', trigger: 'round_ended', intensity: 50, probability: 0.3,
    conditions: [{ type: 'streak', comparison: 'gte', value: 1 }] },
  { fromMood: 'annoyed', toMood: 'neutral', trigger: 'round_ended', intensity: 40, probability: 0.5,
    conditions: [{ type: 'streak', comparison: 'gte', value: 1 }] },
  { fromMood: 'angry', toMood: 'annoyed', trigger: 'round_ended', intensity: 50, probability: 0.6,
    conditions: [{ type: 'streak', comparison: 'gte', value: 1 }] },

  // Instant win (4-5-6)
  { fromMood: '*', toMood: 'pleased', trigger: 'instant_win', intensity: 80, probability: 0.9 },
  { fromMood: 'neutral', toMood: 'amused', trigger: 'instant_win', intensity: 70, probability: 0.4 },

  // Trips rolled
  { fromMood: '*', toMood: 'pleased', trigger: 'trips_rolled', intensity: 70, probability: 0.8 },
  { fromMood: 'pleased', toMood: 'amused', trigger: 'trips_rolled', intensity: 60, probability: 0.4 },

  // ============================================
  // LOSING
  // ============================================

  // Standard loss reactions
  { fromMood: '*', toMood: 'annoyed', trigger: 'round_ended', intensity: 60, probability: 0.5,
    conditions: [{ type: 'lossStreak', comparison: 'gte', value: 1 }] },
  { fromMood: 'pleased', toMood: 'neutral', trigger: 'round_ended', intensity: 40, probability: 0.6,
    conditions: [{ type: 'lossStreak', comparison: 'gte', value: 1 }] },
  { fromMood: 'annoyed', toMood: 'angry', trigger: 'round_ended', intensity: 70, probability: 0.6,
    conditions: [{ type: 'lossStreak', comparison: 'gte', value: 2 }] },

  // Instant loss (1-2-3)
  { fromMood: '*', toMood: 'annoyed', trigger: 'instant_loss', intensity: 70, probability: 0.7 },
  { fromMood: 'annoyed', toMood: 'angry', trigger: 'instant_loss', intensity: 75, probability: 0.5 },

  // ============================================
  // STREAKS
  // ============================================

  // Starting a streak
  { fromMood: '*', toMood: 'pleased', trigger: 'streak_started', intensity: 70, probability: 0.9 },

  // Extending a streak
  { fromMood: 'pleased', toMood: 'amused', trigger: 'streak_extended', intensity: 75, probability: 0.5,
    conditions: [{ type: 'streak', comparison: 'gte', value: 5 }] },
  { fromMood: 'pleased', toMood: 'threatening', trigger: 'streak_extended', intensity: 70, probability: 0.4,
    conditions: [{ type: 'streak', comparison: 'gte', value: 5 }] },
  { fromMood: '*', toMood: 'pleased', trigger: 'streak_extended', intensity: 80, probability: 0.9 },

  // Streak broken
  { fromMood: '*', toMood: 'angry', trigger: 'streak_broken', intensity: 85, probability: 0.7 },
  { fromMood: '*', toMood: 'sad', trigger: 'streak_broken', intensity: 75, probability: 0.3,
    conditions: [{ type: 'streak', comparison: 'gte', value: 5 }] },
  { fromMood: 'pleased', toMood: 'annoyed', trigger: 'streak_broken', intensity: 70, probability: 0.8 },

  // ============================================
  // SPECIAL EVENTS
  // ============================================

  // Bad beat (lost with good roll)
  { fromMood: '*', toMood: 'angry', trigger: 'bad_beat', intensity: 90, probability: 0.8 },
  { fromMood: 'angry', toMood: 'threatening', trigger: 'bad_beat', intensity: 85, probability: 0.3 },

  // Upset victory (beat someone on a streak)
  { fromMood: '*', toMood: 'amused', trigger: 'upset_victory', intensity: 75, probability: 0.7 },
  { fromMood: 'fearful', toMood: 'pleased', trigger: 'upset_victory', intensity: 80, probability: 0.8 },
  { fromMood: 'neutral', toMood: 'pleased', trigger: 'upset_victory', intensity: 70, probability: 0.9 },

  // Perfect round (4-5-6 vs 1-2-3)
  { fromMood: '*', toMood: 'amused', trigger: 'perfect_round', intensity: 90, probability: 0.9 },
  { fromMood: 'pleased', toMood: 'threatening', trigger: 'perfect_round', intensity: 80, probability: 0.4 },

  // ============================================
  // PLAYER EVENTS
  // ============================================

  // Player quit (observer reaction)
  { fromMood: '*', toMood: 'amused', trigger: 'player_quit', intensity: 50, probability: 0.5 },
  { fromMood: 'neutral', toMood: 'curious', trigger: 'player_quit', intensity: 40, probability: 0.3 },

  // Player returned
  { fromMood: '*', toMood: 'neutral', trigger: 'player_returned', intensity: 50, probability: 1.0 },
  { fromMood: 'angry', toMood: 'annoyed', trigger: 'player_returned', intensity: 40, probability: 0.7 },
];

// ============================================
// Archetype Mood Modifiers
// ============================================

export interface ArchetypeMoodModifiers {
  winMoodBonus: MoodType[];  // Preferred moods when winning
  lossMoodPenalty: number;   // 0-1, how badly losses affect mood
  trashTalkWeight: number;   // Multiplier for trash talk frequency
  quitThreshold: number;     // 1-10, higher = more reluctant to quit
  rivalryIntensityMod: number;  // Multiplier for rivalry development
}

export const ARCHETYPE_MOOD_MODIFIERS: Record<BehavioralArchetype, ArchetypeMoodModifiers> = {
  predator: {
    winMoodBonus: ['threatening', 'pleased'],
    lossMoodPenalty: 0.3,
    trashTalkWeight: 1.5,
    quitThreshold: 8,
    rivalryIntensityMod: 1.3,
  },
  prey: {
    winMoodBonus: ['pleased', 'amused'],
    lossMoodPenalty: 0.6,
    trashTalkWeight: 0.3,
    quitThreshold: 3,
    rivalryIntensityMod: 0.5,
  },
  merchant: {
    winMoodBonus: ['generous', 'pleased'],
    lossMoodPenalty: 0.5,
    trashTalkWeight: 0.5,
    quitThreshold: 5,
    rivalryIntensityMod: 0.5,
  },
  guardian: {
    winMoodBonus: ['pleased'],
    lossMoodPenalty: 0.4,
    trashTalkWeight: 0.6,
    quitThreshold: 6,
    rivalryIntensityMod: 0.7,
  },
  trickster: {
    winMoodBonus: ['amused'],
    lossMoodPenalty: 0.2,
    trashTalkWeight: 2.0,
    quitThreshold: 4,
    rivalryIntensityMod: 0.7,
  },
  sage: {
    winMoodBonus: ['neutral', 'cryptic'],
    lossMoodPenalty: 0.3,
    trashTalkWeight: 0.4,
    quitThreshold: 5,
    rivalryIntensityMod: 0.4,
  },
  warrior: {
    winMoodBonus: ['pleased'],
    lossMoodPenalty: 0.4,
    trashTalkWeight: 1.2,
    quitThreshold: 7,
    rivalryIntensityMod: 1.5,
  },
  diplomat: {
    winMoodBonus: ['pleased'],
    lossMoodPenalty: 0.3,
    trashTalkWeight: 0.3,
    quitThreshold: 4,
    rivalryIntensityMod: 0.4,
  },
  opportunist: {
    winMoodBonus: ['pleased', 'amused'],
    lossMoodPenalty: 0.4,
    trashTalkWeight: 1.0,
    quitThreshold: 5,
    rivalryIntensityMod: 0.8,
  },
  loyalist: {
    winMoodBonus: ['pleased'],
    lossMoodPenalty: 0.5,
    trashTalkWeight: 0.5,
    quitThreshold: 6,
    rivalryIntensityMod: 0.6,
  },
};

// ============================================
// Mood Calculation Functions
// ============================================

/**
 * Check if a mood condition is satisfied
 */
function evaluateCondition(
  condition: MoodCondition,
  context: GamblingMoodContext
): boolean {
  let value: number | string;

  switch (condition.type) {
    case 'streak':
      value = Math.max(0, context.playerState.currentStreak);
      break;
    case 'lossStreak':
      value = Math.abs(Math.min(0, context.playerState.currentStreak));
      break;
    case 'goldLost':
      value = context.playerState.goldLost;
      break;
    case 'archetype':
      value = context.archetype;
      break;
    default:
      return true;
  }

  switch (condition.comparison) {
    case 'eq': return value === condition.value;
    case 'gt': return value > condition.value;
    case 'gte': return value >= condition.value;
    case 'lt': return value < condition.value;
    case 'lte': return value <= condition.value;
    default: return true;
  }
}

/**
 * Find applicable mood transitions for a given context
 */
export function findApplicableTransitions(
  context: GamblingMoodContext
): MoodTransition[] {
  return MOOD_TRANSITIONS.filter(transition => {
    // Check trigger matches
    if (transition.trigger !== context.eventType) {
      return false;
    }

    // Check from mood matches
    if (transition.fromMood !== '*' && transition.fromMood !== context.currentMood) {
      return false;
    }

    // Check all conditions
    if (transition.conditions) {
      for (const condition of transition.conditions) {
        if (!evaluateCondition(condition, context)) {
          return false;
        }
      }
    }

    return true;
  });
}

/**
 * Calculate new mood based on gambling event
 */
export function calculateNewMood(
  context: GamblingMoodContext,
  rng: () => number
): { newMood: MoodType; newIntensity: number } {
  const applicableTransitions = findApplicableTransitions(context);

  if (applicableTransitions.length === 0) {
    return { newMood: context.currentMood, newIntensity: context.moodIntensity };
  }

  // Get archetype modifiers
  const archetypeMods = ARCHETYPE_MOOD_MODIFIERS[context.archetype] ?? ARCHETYPE_MOOD_MODIFIERS.diplomat;

  // Apply probability check to each transition
  const rolledTransitions = applicableTransitions.filter(t => {
    let probability = t.probability;

    // Adjust probability based on archetype
    if (context.eventType === 'round_ended' && context.playerState.currentStreak < 0) {
      // Losing - apply loss mood penalty
      probability *= (1 + archetypeMods.lossMoodPenalty);
    }

    return rng() < probability;
  });

  if (rolledTransitions.length === 0) {
    return { newMood: context.currentMood, newIntensity: context.moodIntensity };
  }

  // Pick highest intensity transition
  const bestTransition = rolledTransitions.reduce((a, b) =>
    a.intensity > b.intensity ? a : b
  );

  // Check if archetype prefers this mood when winning
  let finalMood = bestTransition.toMood;
  if (context.playerState.currentStreak > 0 && archetypeMods.winMoodBonus.length > 0) {
    // 30% chance to use preferred win mood
    if (rng() < 0.3) {
      finalMood = archetypeMods.winMoodBonus[Math.floor(rng() * archetypeMods.winMoodBonus.length)];
    }
  }

  // Calculate new intensity
  let newIntensity = bestTransition.intensity;

  // Decay intensity slightly if maintaining same mood
  if (finalMood === context.currentMood) {
    newIntensity = Math.min(100, context.moodIntensity + 10);
  }

  return { newMood: finalMood, newIntensity };
}

/**
 * Get trash talk probability for an NPC
 */
export function getTrashTalkProbability(archetype: BehavioralArchetype): number {
  const mods = ARCHETYPE_MOOD_MODIFIERS[archetype] ?? ARCHETYPE_MOOD_MODIFIERS.diplomat;
  return Math.min(1.0, 0.3 * mods.trashTalkWeight);
}

/**
 * Get quit threshold for an NPC
 */
export function getQuitThreshold(archetype: BehavioralArchetype): number {
  const mods = ARCHETYPE_MOOD_MODIFIERS[archetype] ?? ARCHETYPE_MOOD_MODIFIERS.diplomat;
  return mods.quitThreshold;
}

/**
 * Get rivalry intensity modifier for an NPC
 */
export function getRivalryIntensityMod(archetype: BehavioralArchetype): number {
  const mods = ARCHETYPE_MOOD_MODIFIERS[archetype] ?? ARCHETYPE_MOOD_MODIFIERS.diplomat;
  return mods.rivalryIntensityMod;
}
