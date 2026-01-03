/**
 * Story Beat Detection System
 *
 * Captures memorable moments during runs that NPCs can reference in dialogue.
 * Beats decay over time - recent events matter more than old ones.
 */

import type { RunResult, PlayerProfile } from './player-profile';

// ============================================
// Core Types
// ============================================

/**
 * Story beat types - memorable events NPCs can reference
 */
export type StoryBeatType =
  | 'close-call'        // Survived with <10% HP
  | 'crushing-victory'  // Dominated boss (>50% HP remaining)
  | 'betrayed-by-rng'   // Died to bad dice (fumble)
  | 'perfect-synergy'   // Item combo triggered for big damage
  | 'comeback-king'     // Won after being down to <20% HP
  | 'streak-breaker'    // Broke 5+ win/loss streak
  | 'first-clear'       // First time clearing a domain
  | 'legendary-roll'    // Natural 20, or triple same
  | 'debt-spiral';      // Died 3+ times, owes multiple NPCs

/**
 * Story beat with decay tracking
 */
export interface StoryBeat {
  type: StoryBeatType;
  createdAtRun: number;  // Run number when created
  domain: number;
  details: Record<string, unknown>;
  ttlRuns: number;       // Expires after this many runs
  weight: number;        // Decays over time (1.0 to 0.0)
}

// ============================================
// TTL Configuration
// ============================================

/**
 * TTL by beat type (runs until expiry)
 */
export const BEAT_TTL: Record<StoryBeatType, number> = {
  'close-call': 5,        // Fresh for 5 runs
  'crushing-victory': 5,
  'betrayed-by-rng': 3,   // Short memory - frustration fades
  'perfect-synergy': 7,   // NPCs remember good plays
  'comeback-king': 10,    // Legendary, lasts longer
  'streak-breaker': 5,
  'first-clear': 15,      // Major milestone
  'legendary-roll': 10,
  'debt-spiral': 8,       // Narrative tension persists
};

// ============================================
// Beat Weight Decay
// ============================================

/**
 * Update story beats with decay weights
 * Removes expired beats and recalculates weights
 */
export function updateStoryBeats(
  beats: StoryBeat[],
  currentRun: number
): StoryBeat[] {
  return beats
    .filter(b => currentRun - b.createdAtRun < b.ttlRuns) // Remove expired
    .map(b => ({
      ...b,
      // Weight decays linearly: 1.0 at creation to 0.0 at expiry
      weight: Math.max(0, 1 - (currentRun - b.createdAtRun) / b.ttlRuns),
    }))
    .sort((a, b) => b.weight - a.weight); // Most recent/relevant first
}

/**
 * Get the most relevant story beat (highest weight)
 */
export function getMostRelevantBeat(beats: StoryBeat[]): StoryBeat | null {
  if (beats.length === 0) return null;
  return beats[0]; // Already sorted by weight
}

/**
 * Get beats of a specific type
 */
export function getBeatsByType(beats: StoryBeat[], type: StoryBeatType): StoryBeat[] {
  return beats.filter(b => b.type === type);
}

/**
 * Check if a beat type is active (exists with weight > threshold)
 */
export function hasBeat(
  beats: StoryBeat[],
  type: StoryBeatType,
  minWeight: number = 0.3
): boolean {
  return beats.some(b => b.type === type && b.weight >= minWeight);
}

// ============================================
// Beat Detection
// ============================================

/**
 * Create a new story beat
 */
function createBeat(
  type: StoryBeatType,
  currentRun: number,
  domain: number,
  details: Record<string, unknown> = {}
): StoryBeat {
  return {
    type,
    createdAtRun: currentRun,
    domain,
    details,
    ttlRuns: BEAT_TTL[type],
    weight: 1.0,
  };
}

/**
 * Detect story beats from a run result
 */
export function detectStoryBeats(
  result: RunResult,
  profile: PlayerProfile,
  currentRun: number
): StoryBeat[] {
  const beats: StoryBeat[] = [];

  // Close Call - survived with <10% HP
  if (result.minHP < 10 && result.survived) {
    beats.push(createBeat('close-call', currentRun, result.domainReached, {
      hpRemaining: result.minHP,
    }));
  }

  // Crushing Victory - dominated boss with >50% HP
  if (result.bossDefeated && result.hpAfterBoss && result.hpAfterBoss > 50) {
    beats.push(createBeat('crushing-victory', currentRun, result.domainReached, {
      hpRemaining: result.hpAfterBoss,
    }));
  }

  // First Clear - reached a new highest domain
  if (result.domainReached > profile.highestDomain) {
    beats.push(createBeat('first-clear', currentRun, result.domainReached, {
      previousHighest: profile.highestDomain,
    }));
  }

  // Legendary Roll
  if (result.legendaryRolls > 0) {
    beats.push(createBeat('legendary-roll', currentRun, result.domainReached, {
      count: result.legendaryRolls,
    }));
  }

  // Perfect Synergy
  if (result.perfectSynergies.length > 0) {
    beats.push(createBeat('perfect-synergy', currentRun, result.domainReached, {
      synergies: result.perfectSynergies,
    }));
  }

  // Betrayed by RNG - died early despite good setup
  if (!result.survived && result.domainReached <= 2 && result.itemsAcquired.length >= 2) {
    beats.push(createBeat('betrayed-by-rng', currentRun, result.domainReached, {
      items: result.itemsAcquired,
    }));
  }

  // Comeback King - won after being at <20% HP at some point
  if (result.survived && result.domainReached >= 6 && result.minHP < 20) {
    beats.push(createBeat('comeback-king', currentRun, result.domainReached, {
      minHP: result.minHP,
    }));
  }

  // Debt Spiral - owes multiple NPCs significant amounts
  const totalDebt = Object.values(profile.debtsTo).reduce((a, b) => a + b, 0);
  const creditorCount = Object.values(profile.debtsTo).filter(d => d > 0).length;
  if (totalDebt > 500 && creditorCount >= 2 && !result.survived) {
    beats.push(createBeat('debt-spiral', currentRun, result.domainReached, {
      totalDebt,
      creditorCount,
    }));
  }

  return beats;
}

// ============================================
// Serialization Helpers
// ============================================

/**
 * Serialize beats for storage
 */
export function serializeBeats(beats: StoryBeat[]): string {
  return JSON.stringify(beats);
}

/**
 * Deserialize beats from storage
 */
export function deserializeBeats(json: string): StoryBeat[] {
  try {
    return JSON.parse(json);
  } catch {
    return [];
  }
}
