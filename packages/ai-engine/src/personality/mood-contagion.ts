/**
 * Mood Contagion System
 *
 * Emotions spread between NPCs based on:
 * - Proximity in conversation
 * - Relationship strength
 * - Personality susceptibility
 * - Message emotional content
 */

import type { MoodType } from '../core/types';

// ============================================
// Mood Properties
// ============================================

export interface MoodProperties {
  valence: number;      // -1 (negative) to 1 (positive)
  arousal: number;      // 0 (calm) to 1 (intense)
  dominance: number;    // 0 (submissive) to 1 (dominant)
  contagiousness: number; // 0-1, how easily it spreads
  resistance: number;   // 0-1, how hard to change from this mood
}

export const MOOD_PROPERTIES: Record<MoodType, MoodProperties> = {
  neutral: {
    valence: 0,
    arousal: 0.3,
    dominance: 0.5,
    contagiousness: 0.1,
    resistance: 0.2,
  },
  pleased: {
    valence: 0.7,
    arousal: 0.4,
    dominance: 0.5,
    contagiousness: 0.6,
    resistance: 0.3,
  },
  annoyed: {
    valence: -0.5,
    arousal: 0.6,
    dominance: 0.6,
    contagiousness: 0.7,
    resistance: 0.5,
  },
  amused: {
    valence: 0.6,
    arousal: 0.5,
    dominance: 0.4,
    contagiousness: 0.8, // Laughter is very contagious
    resistance: 0.2,
  },
  threatening: {
    valence: -0.8,
    arousal: 0.8,
    dominance: 0.9,
    contagiousness: 0.5,
    resistance: 0.7,
  },
  generous: {
    valence: 0.8,
    arousal: 0.3,
    dominance: 0.6,
    contagiousness: 0.4,
    resistance: 0.4,
  },
  cryptic: {
    valence: 0,
    arousal: 0.2,
    dominance: 0.7,
    contagiousness: 0.2,
    resistance: 0.8,
  },
  fearful: {
    valence: -0.7,
    arousal: 0.9,
    dominance: 0.1,
    contagiousness: 0.9, // Fear spreads fast
    resistance: 0.3,
  },
  curious: {
    valence: 0.3,
    arousal: 0.5,
    dominance: 0.4,
    contagiousness: 0.5,
    resistance: 0.3,
  },
  angry: {
    valence: -0.9,
    arousal: 0.9,
    dominance: 0.8,
    contagiousness: 0.7,
    resistance: 0.6,
  },
  scared: {
    valence: -0.8,
    arousal: 0.9,
    dominance: 0.1,
    contagiousness: 0.9,
    resistance: 0.2,
  },
  sad: {
    valence: -0.6,
    arousal: 0.2,
    dominance: 0.3,
    contagiousness: 0.4,
    resistance: 0.5,
  },
  grateful: {
    valence: 0.8,
    arousal: 0.4,
    dominance: 0.4,
    contagiousness: 0.5,
    resistance: 0.3,
  },
};

// ============================================
// Susceptibility Factors
// ============================================

export interface ContagionFactors {
  baseSusceptibility: number;  // 0-1, personality-based
  relationshipMod: number;     // Modifier from relationship
  moodResistance: number;      // Current mood's resistance
  recentExposure: number;      // Diminishing returns
}

export function calculateSusceptibility(
  targetMood: MoodType,
  sourceMood: MoodType,
  relationshipStrength: number,  // 0-100
  familiarity: number,           // 0-100
  targetSociability: number,     // 0-1
  exposureCount: number          // Times exposed to this mood recently
): number {
  const targetProps = MOOD_PROPERTIES[targetMood];
  const sourceProps = MOOD_PROPERTIES[sourceMood];

  // Base susceptibility from personality
  const baseSusceptibility = targetSociability * 0.5 + 0.25;

  // Relationship modifier (stronger relationships = more influence)
  const relMod = (relationshipStrength + familiarity) / 200;

  // Current mood resistance
  const resistance = targetProps.resistance;

  // Diminishing returns on repeated exposure
  const exposureMod = Math.max(0.1, 1 - (exposureCount * 0.15));

  // Source mood contagiousness
  const contagiousness = sourceProps.contagiousness;

  // Calculate final susceptibility
  let susceptibility = baseSusceptibility * contagiousness * exposureMod;
  susceptibility *= (1 + relMod);
  susceptibility *= (1 - resistance * 0.5);

  return Math.max(0, Math.min(1, susceptibility));
}

// ============================================
// Mood Transition
// ============================================

export interface MoodInfluence {
  sourceMood: MoodType;
  sourceNPC: string;
  strength: number;
  timestamp: number;
}

export interface MoodState {
  current: MoodType;
  intensity: number;
  recentInfluences: MoodInfluence[];
  resistanceBuildup: Partial<Record<MoodType, number>>;
}

export function createMoodState(initialMood: MoodType): MoodState {
  return {
    current: initialMood,
    intensity: 50,
    recentInfluences: [],
    resistanceBuildup: {},
  };
}

/**
 * Calculate mood transition from influences
 */
export function processMoodInfluence(
  state: MoodState,
  influence: MoodInfluence,
  susceptibility: number
): MoodState {
  const newInfluences = [...state.recentInfluences, influence].slice(-10);

  // Check if mood should change
  const currentProps = MOOD_PROPERTIES[state.current];
  const influenceProps = MOOD_PROPERTIES[influence.sourceMood];

  // Build up resistance to repeated same-mood influences
  const resistanceBuildup = { ...state.resistanceBuildup };
  resistanceBuildup[influence.sourceMood] =
    (resistanceBuildup[influence.sourceMood] || 0) + 0.1;

  const effectiveStrength =
    influence.strength * susceptibility *
    (1 - (resistanceBuildup[influence.sourceMood] || 0));

  // Threshold for mood change
  const changeThreshold = 0.4 + currentProps.resistance * 0.3;

  if (effectiveStrength > changeThreshold) {
    // Mood changes
    return {
      current: influence.sourceMood,
      intensity: Math.min(100, 50 + effectiveStrength * 50),
      recentInfluences: newInfluences,
      resistanceBuildup: {},  // Reset resistance on mood change
    };
  }

  // Mood doesn't change, but intensity might
  const intensityChange = calculateIntensityShift(
    currentProps,
    influenceProps,
    effectiveStrength
  );

  return {
    ...state,
    intensity: Math.max(10, Math.min(100, state.intensity + intensityChange)),
    recentInfluences: newInfluences,
    resistanceBuildup,
  };
}

function calculateIntensityShift(
  current: MoodProperties,
  influence: MoodProperties,
  strength: number
): number {
  // Same valence = reinforce, opposite = dampen
  const valenceDiff = Math.abs(current.valence - influence.valence);

  if (valenceDiff < 0.3) {
    // Similar mood, reinforce
    return strength * 20;
  } else if (valenceDiff > 0.8) {
    // Opposite mood, dampen
    return -strength * 15;
  }

  return 0;
}

// ============================================
// Group Mood Dynamics
// ============================================

export interface GroupMoodState {
  dominantMood: MoodType;
  averageValence: number;
  averageArousal: number;
  cohesion: number; // 0-1, how similar everyone's mood is
  tension: number;  // 0-1, presence of opposing moods
}

export function analyzeGroupMood(
  individualMoods: Array<{ mood: MoodType; intensity: number }>
): GroupMoodState {
  if (individualMoods.length === 0) {
    return {
      dominantMood: 'neutral',
      averageValence: 0,
      averageArousal: 0.3,
      cohesion: 1,
      tension: 0,
    };
  }

  // Calculate averages
  let totalValence = 0;
  let totalArousal = 0;
  const moodCounts: Partial<Record<MoodType, number>> = {};

  for (const { mood, intensity } of individualMoods) {
    const props = MOOD_PROPERTIES[mood];
    const weight = intensity / 100;
    totalValence += props.valence * weight;
    totalArousal += props.arousal * weight;
    moodCounts[mood] = (moodCounts[mood] || 0) + 1;
  }

  const count = individualMoods.length;
  const avgValence = totalValence / count;
  const avgArousal = totalArousal / count;

  // Find dominant mood
  let dominantMood: MoodType = 'neutral';
  let maxCount = 0;
  for (const [mood, moodCount] of Object.entries(moodCounts)) {
    if (moodCount > maxCount) {
      maxCount = moodCount;
      dominantMood = mood as MoodType;
    }
  }

  // Calculate cohesion (how similar moods are)
  const cohesion = maxCount / count;

  // Calculate tension (presence of opposing moods)
  let tension = 0;
  const positiveCount = individualMoods.filter(
    m => MOOD_PROPERTIES[m.mood].valence > 0.3
  ).length;
  const negativeCount = individualMoods.filter(
    m => MOOD_PROPERTIES[m.mood].valence < -0.3
  ).length;

  if (positiveCount > 0 && negativeCount > 0) {
    tension = Math.min(positiveCount, negativeCount) / count;
  }

  return {
    dominantMood,
    averageValence: avgValence,
    averageArousal: avgArousal,
    cohesion,
    tension,
  };
}

// ============================================
// Mood Spread Simulation
// ============================================

export interface MoodSpreadResult {
  affectedNPCs: Array<{
    slug: string;
    previousMood: MoodType;
    newMood: MoodType;
    intensityChange: number;
  }>;
  groupMood: GroupMoodState;
}

export function simulateMoodSpread(
  source: { slug: string; mood: MoodType; intensity: number },
  targets: Array<{
    slug: string;
    mood: MoodType;
    intensity: number;
    susceptibility: number;
  }>,
  rng: () => number
): MoodSpreadResult {
  const affectedNPCs: MoodSpreadResult['affectedNPCs'] = [];
  const sourceProps = MOOD_PROPERTIES[source.mood];

  for (const target of targets) {
    const spreadChance = sourceProps.contagiousness * target.susceptibility;

    if (rng() < spreadChance) {
      // Mood spreads
      const influence: MoodInfluence = {
        sourceMood: source.mood,
        sourceNPC: source.slug,
        strength: (source.intensity / 100) * sourceProps.contagiousness,
        timestamp: Date.now(),
      };

      const state = createMoodState(target.mood);
      const newState = processMoodInfluence(state, influence, target.susceptibility);

      if (newState.current !== target.mood) {
        affectedNPCs.push({
          slug: target.slug,
          previousMood: target.mood,
          newMood: newState.current,
          intensityChange: newState.intensity - target.intensity,
        });
      }
    }
  }

  // Calculate new group mood
  const allMoods = [
    { mood: source.mood, intensity: source.intensity },
    ...targets.map(t => {
      const affected = affectedNPCs.find(a => a.slug === t.slug);
      return {
        mood: affected ? affected.newMood : t.mood,
        intensity: affected ? t.intensity + affected.intensityChange : t.intensity,
      };
    }),
  ];

  return {
    affectedNPCs,
    groupMood: analyzeGroupMood(allMoods),
  };
}
