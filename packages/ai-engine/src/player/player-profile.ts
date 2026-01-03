/**
 * Player Profile System
 *
 * Tracks player behavior across runs to enable adaptive NPC dialogue.
 * Archetypes, story beats, debts, and rescue history influence chatbase lookups.
 */

import type { StoryBeat, StoryBeatType } from './story-beats';

// ============================================
// Core Types
// ============================================

/**
 * 4 Core Archetypes - simplified player classification
 */
export type PlayerArchetype =
  | 'aggressive'  // Damage items, risky paths, fast runs
  | 'defensive'   // Shield/heal items, safe paths, high survival
  | 'chaotic'     // Chaos orb, rerolls, high heat, unpredictable
  | 'balanced';   // No strong pattern, adapts to situation

/**
 * Player profile tracking run history and behavior patterns
 */
export interface PlayerProfile {
  // Identity
  playerName: string;

  // Run history
  totalRuns: number;
  totalDeaths: number;
  totalWins: number;
  highestDomain: number;
  winRate: number;
  winStreak: number;   // Current win streak
  lossStreak: number;  // Current loss streak

  // Item preferences (tracked across runs)
  itemPickCounts: Record<string, number>;
  topSynergies: Array<{ combo: string; winRate: number; count: number }>;

  // Archetype detection
  archetype: PlayerArchetype;
  archetypeScore: Record<PlayerArchetype, number>;

  // Story beats with decay
  storyBeats: StoryBeat[];
  currentRun: number; // For decay calculations

  // NPC relationships (for escalating tension)
  debtsTo: Record<string, number>;
  rescuedBy: Record<string, number>;
  favorWith: Record<string, number>;

  // Metadata
  createdAt: string;
  lastUpdated: string;
}

// ============================================
// Archetype Detection
// ============================================

/**
 * Item categories for archetype scoring
 */
export const ARCHETYPE_ITEMS: Record<PlayerArchetype, string[]> = {
  aggressive: ['meteor-core', 'iron-dice', 'steel-grip', 'obsidian-die'],
  defensive: ['shield-rune', 'healing-salve', 'phoenix-feather'],
  chaotic: ['chaos-orb', 'reroll-token', 'lucky-coin', 'void-shard'],
  balanced: [], // Fallback, no specific items
};

/**
 * Detect player archetype from profile
 */
export function detectArchetype(profile: PlayerProfile): PlayerArchetype {
  const scores: Record<PlayerArchetype, number> = {
    aggressive: 0,
    defensive: 0,
    chaotic: 0,
    balanced: 0,
  };

  // Score by item picks
  for (const [archetype, items] of Object.entries(ARCHETYPE_ITEMS)) {
    for (const item of items) {
      scores[archetype as PlayerArchetype] += profile.itemPickCounts[item] || 0;
    }
  }

  // Aggressive bonus: high death rate (plays fast and loose)
  if (profile.totalRuns > 5 && profile.totalDeaths / profile.totalRuns > 0.6) {
    scores.aggressive += 5;
  }

  // Defensive bonus: survives to late game consistently
  if (profile.highestDomain >= 5) {
    scores.defensive += 5;
  }

  // Chaotic bonus: high variance in outcomes (wins AND losses at extremes)
  // Could track heat levels in future

  // Find highest scoring archetype
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const [topArchetype, topScore] = sorted[0];
  const [, secondScore] = sorted[1];

  // Need clear winner (>30% margin) and minimum score, or fall back to balanced
  if (topScore > secondScore * 1.3 && topScore > 5) {
    return topArchetype as PlayerArchetype;
  }
  return 'balanced';
}

// ============================================
// Profile Creation & Updates
// ============================================

/**
 * Create empty player profile
 */
export function createPlayerProfile(): PlayerProfile {
  const now = new Date().toISOString();
  return {
    playerName: 'Never Die Guy',

    totalRuns: 0,
    totalDeaths: 0,
    totalWins: 0,
    highestDomain: 0,
    winRate: 0,
    winStreak: 0,
    lossStreak: 0,

    itemPickCounts: {},
    topSynergies: [],

    archetype: 'balanced',
    archetypeScore: { aggressive: 0, defensive: 0, chaotic: 0, balanced: 0 },

    storyBeats: [],
    currentRun: 0,

    debtsTo: {},
    rescuedBy: {},
    favorWith: {},

    createdAt: now,
    lastUpdated: now,
  };
}

/**
 * Run result data for profile updates
 */
export interface RunResult {
  survived: boolean;
  domainReached: number;
  roomsCleared: number;
  finalScore: number;

  // HP tracking for story beats
  minHP: number;
  hpAfterBoss?: number;
  bossDefeated: boolean;

  // Items
  itemsAcquired: string[];
  itemsLost: string[];

  // Economy
  goldEarned: number;
  goldSpent: number;

  // Rescues
  rescuers: Array<{ npc: string; cost: number }>;

  // Special events
  legendaryRolls: number;
  perfectSynergies: string[];
}

/**
 * Update player profile after a run
 */
export function updatePlayerProfile(
  profile: PlayerProfile,
  result: RunResult,
  newBeats: StoryBeat[]
): PlayerProfile {
  const updated = { ...profile };
  const now = new Date().toISOString();

  // Update run counts
  updated.totalRuns++;
  updated.currentRun++;
  if (!result.survived) updated.totalDeaths++;
  if (result.survived && result.domainReached >= 6) updated.totalWins++;

  // Update win rate
  updated.winRate = updated.totalWins / updated.totalRuns;

  // Update streaks
  if (result.survived && result.domainReached >= 6) {
    updated.winStreak++;
    updated.lossStreak = 0;
  } else if (!result.survived) {
    updated.lossStreak++;
    updated.winStreak = 0;
  }

  // Update highest domain
  updated.highestDomain = Math.max(updated.highestDomain, result.domainReached);

  // Update item picks
  for (const item of result.itemsAcquired) {
    updated.itemPickCounts[item] = (updated.itemPickCounts[item] || 0) + 1;
  }

  // Update debts from rescues
  for (const rescue of result.rescuers) {
    updated.debtsTo[rescue.npc] = (updated.debtsTo[rescue.npc] || 0) + rescue.cost;
    updated.rescuedBy[rescue.npc] = (updated.rescuedBy[rescue.npc] || 0) + 1;
  }

  // Add new story beats and keep most recent 10
  updated.storyBeats = [...newBeats, ...updated.storyBeats].slice(0, 10);

  // Re-detect archetype
  updated.archetype = detectArchetype(updated);
  updated.archetypeScore = calculateArchetypeScores(updated);

  updated.lastUpdated = now;

  return updated;
}

/**
 * Calculate archetype scores for visibility
 */
function calculateArchetypeScores(profile: PlayerProfile): Record<PlayerArchetype, number> {
  const scores: Record<PlayerArchetype, number> = {
    aggressive: 0,
    defensive: 0,
    chaotic: 0,
    balanced: 0,
  };

  for (const [archetype, items] of Object.entries(ARCHETYPE_ITEMS)) {
    for (const item of items) {
      scores[archetype as PlayerArchetype] += profile.itemPickCounts[item] || 0;
    }
  }

  if (profile.totalRuns > 5 && profile.totalDeaths / profile.totalRuns > 0.6) {
    scores.aggressive += 5;
  }

  if (profile.highestDomain >= 5) {
    scores.defensive += 5;
  }

  return scores;
}

// ============================================
// Serialization
// ============================================

/**
 * Serialize profile for storage
 */
export function serializeProfile(profile: PlayerProfile): string {
  return JSON.stringify(profile, null, 2);
}

/**
 * Deserialize profile from storage
 */
export function deserializeProfile(json: string): PlayerProfile {
  const parsed = JSON.parse(json);
  // Ensure all fields exist (for backwards compatibility)
  return {
    ...createPlayerProfile(),
    ...parsed,
  };
}
