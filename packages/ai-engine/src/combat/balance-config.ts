/**
 * Balance Configuration - Centralized tuning constants
 *
 * Turn-based multiplier decay creates tension without punishing slow thinkers.
 * NEVER DIE GUY
 */

// ============================================
// TURN-BASED TIME PRESSURE SYSTEM
// ============================================

export interface TimerConfig {
  /** Turns before decay starts (grace period) */
  graceTurns: number;
  /** Score multiplier reduction per turn after grace (-5% = 0.05) */
  decayPerTurn: number;
  /** Minimum multiplier floor (can't go below 60%) */
  minMultiplier: number;
  /** Bonus multiplier per unused turn on victory (+10% = 0.10) */
  earlyFinishBonus: number;
  /** Animation duration in ms (kept for transition timing) */
  animationDuration: number;
}

export const TIMER_CONFIG: TimerConfig = {
  graceTurns: 2,
  decayPerTurn: 0.05,
  minMultiplier: 0.60,
  earlyFinishBonus: 0.10,
  animationDuration: 500,
};

/**
 * Room-type specific overrides for timer config
 * - Elite: Slightly lower floor (0.55)
 * - Boss: More grace (3 turns), slower decay, lower floor (0.50)
 */
export const TIMER_CONFIG_BY_ROOM: Record<
  'normal' | 'elite' | 'boss',
  Partial<TimerConfig>
> = {
  normal: {},
  elite: { minMultiplier: 0.55 },
  boss: { graceTurns: 3, decayPerTurn: 0.04, minMultiplier: 0.50 },
};

export type RoomType = 'normal' | 'elite' | 'boss';

/**
 * Get merged timer config for a room type
 */
export function getTimerConfigForRoom(roomType: RoomType): TimerConfig {
  return { ...TIMER_CONFIG, ...TIMER_CONFIG_BY_ROOM[roomType] };
}

/**
 * Calculate time pressure multiplier for current turn
 * @param turnNumber - Current turn (1-indexed)
 * @param roomType - Room type for config lookup
 * @returns Multiplier between minMultiplier and 1.0
 */
export function getTimePressureMultiplier(
  turnNumber: number,
  roomType: RoomType = 'normal'
): number {
  const config = getTimerConfigForRoom(roomType);

  if (turnNumber <= config.graceTurns) {
    return 1.0;
  }

  const decayTurns = turnNumber - config.graceTurns;
  const decay = decayTurns * config.decayPerTurn;

  return Math.max(config.minMultiplier, 1.0 - decay);
}

/**
 * Calculate early finish bonus multiplier
 * @param turnsRemaining - Unused turns at victory
 * @returns Bonus multiplier (1.0 = no bonus, 1.3 = 30% bonus)
 */
export function getEarlyFinishBonus(turnsRemaining: number): number {
  return 1.0 + turnsRemaining * TIMER_CONFIG.earlyFinishBonus;
}

/**
 * Check if currently in grace period
 */
export function isInGracePeriod(
  turnNumber: number,
  roomType: RoomType = 'normal'
): boolean {
  const config = getTimerConfigForRoom(roomType);
  return turnNumber <= config.graceTurns;
}

// ============================================
// FLAT EVENT CONFIG (6 events, 1 per domain)
// ============================================

export const FLAT_EVENT_CONFIG = {
  /** Score goals by domain (1-indexed) - scaled for 3 throws */
  goals: [0, 500, 750, 1100, 1500, 2000, 2500],

  /** Gold rewards by domain (1-indexed) */
  goldRewards: [0, 75, 125, 175, 250, 350, 500],

  /** Throws per event (bullet mode: 3 instead of 5) */
  throwsPerEvent: 3,

  /** Trades per event (bullet mode: 1 instead of 2) */
  tradesPerEvent: 1,

  /** Event duration in ms (bullet mode: 20s instead of 45s) */
  eventDurationMs: 20000,

  /** Grace period before decay starts (bullet mode: 3s instead of 5s) */
  gracePeriodMs: 3000,

  /** Decay config (Model B - Escalating) */
  decay: {
    /** Base decay rate (% of goal per second) */
    baseRate: 0.003,
    /** Decay acceleration over time */
    acceleration: 1.5,
    /** Score floor (can't go negative) */
    scoreFloor: 0,
  },
} as const;

/**
 * Get score goal for a domain (flat structure)
 */
export function getFlatScoreGoal(domainId: number): number {
  return FLAT_EVENT_CONFIG.goals[domainId] || 800;
}

/**
 * Get gold reward for a domain (flat structure)
 */
export function getFlatGoldReward(domainId: number): number {
  return FLAT_EVENT_CONFIG.goldRewards[domainId] || 75;
}

/**
 * Calculate decay rate at a given time (Model B - Escalating)
 * @param elapsedMs - Time elapsed since event start
 * @param targetScore - Score goal for this event
 * @returns Decay per second at this moment
 */
export function calculateDecayRate(
  elapsedMs: number,
  targetScore: number
): number {
  const { gracePeriodMs, eventDurationMs, decay } = FLAT_EVENT_CONFIG;

  // No decay during grace period
  if (elapsedMs < gracePeriodMs) {
    return 0;
  }

  // Quadratic acceleration after grace period
  const adjustedTime = elapsedMs - gracePeriodMs;
  const adjustedDuration = eventDurationMs - gracePeriodMs;
  const timeRatio = adjustedTime / adjustedDuration;

  const acceleratedRate = decay.baseRate * Math.pow(1 + timeRatio, decay.acceleration);
  return targetScore * acceleratedRate;
}

// ============================================
// COMBAT CAPS (Prevent Abuse)
// ============================================

export const COMBAT_CAPS = {
  /** Max throws per event (base 5 + 2 from items) */
  maxThrows: 7,
  /** Max trades per event (base 2 + 2 from items) */
  maxTrades: 4,
  /** Max multiplier including trade stacking */
  maxMultiplier: 10,
  /** Max element bonus from items (+100% = 2x) */
  maxElementBonus: 1.0,
  /** Max crit chance */
  maxCritChance: 0.25,
  /** Max starting score from items */
  maxStartingScore: 500,
} as const;

// ============================================
// LEGACY SCORE CONFIG (for backwards compatibility)
// ============================================

export const SCORE_CONFIG = {
  /** Base score for domain 1, normal room */
  baseScore: 1000,

  /** Multiplier per domain (1.25 = 25% harder each domain) */
  domainMultiplier: 1.25,

  /** Room type multipliers */
  roomMultipliers: {
    normal: 1.0,
    elite: 1.5,
    boss: 2.0,
  } as const,
} as const;

/**
 * Calculate target score for a room (legacy 3-room-per-domain structure)
 * @deprecated Use getFlatScoreGoal for new flat structure
 */
export function calculateTargetScore(
  domainId: number,
  roomType: 'normal' | 'elite' | 'boss'
): number {
  const domainMult = Math.pow(SCORE_CONFIG.domainMultiplier, domainId - 1);
  const roomMult = SCORE_CONFIG.roomMultipliers[roomType];
  return Math.round(SCORE_CONFIG.baseScore * domainMult * roomMult);
}

// ============================================
// LOADOUT STAT EFFECTS
// ============================================

export type StatKey = 'fury' | 'resilience' | 'grit' | 'swiftness' | 'shadow' | 'essence';

export interface LoadoutStats {
  fury?: number;
  resilience?: number;
  grit?: number;
  swiftness?: number;
  shadow?: number;
  essence?: number;
}

/**
 * Calculate stat effects for combat
 * - Fury: +1% score per point
 * - Resilience: -0.5% decay per point (reduces decay rate)
 * - Grit: Auto-scar-immunity at 20+ (first fail doesn't add scar)
 * - Swiftness: +2s timer per 10 points
 * - Shadow: Only applies to base trades (multiplayer only)
 * - Essence: +2% element bonus per point
 */
export function calculateStatEffects(stats: LoadoutStats): {
  scoreMultiplier: number;
  decayReduction: number;
  hasGritImmunity: boolean;
  timerBonusMs: number;
  elementBonusMultiplier: number;
} {
  const fury = stats.fury || 0;
  const resilience = stats.resilience || 0;
  const grit = stats.grit || 0;
  const swiftness = stats.swiftness || 0;
  const essence = stats.essence || 0;

  return {
    // Fury: +1% score per point
    scoreMultiplier: 1 + (fury * 0.01),

    // Resilience: -0.5% decay per point (capped at 50% reduction)
    decayReduction: Math.min(0.5, resilience * 0.005),

    // Grit: Auto-scar-immunity at 20+
    hasGritImmunity: grit >= 20,

    // Swiftness: +2s per 10 points
    timerBonusMs: Math.floor(swiftness / 10) * 2000,

    // Essence: +2% element bonus per point
    elementBonusMultiplier: 1 + (essence * 0.02),
  };
}

// ============================================
// POPULATION DENSITY SYSTEM
// ============================================

export type DensityTier = 'sparse' | 'scattered' | 'populated' | 'crowded' | 'swarming';

export const POPULATION_CONFIG = {
  /** Initial NPC count at event start */
  initialCount: 12,
  /** NPCs spawned per second */
  spawnRate: 3,
  /** Burst spawn times (ms from start) */
  burstIntervals: [6000, 10000] as const,
  /** NPCs per burst spawn */
  burstSize: 5,
  /** Max NPCs (performance cap) */
  maxPopulation: 60,

  /** Density tier definitions */
  tiers: {
    sparse:    { min: 0,  max: 20, color: '#4caf50', label: 'Sparse' },
    scattered: { min: 20, max: 35, color: '#8bc34a', label: 'Scattered' },
    populated: { min: 35, max: 45, color: '#ffeb3b', label: 'Populated' },
    crowded:   { min: 45, max: 55, color: '#ff9800', label: 'Crowded' },
    swarming:  { min: 55, max: 60, color: '#f44336', label: 'Swarming' },
  } as const,
} as const;

/**
 * Get current density tier based on NPC count
 */
export function getDensityTier(npcCount: number): DensityTier {
  const { tiers } = POPULATION_CONFIG;
  if (npcCount >= tiers.swarming.min) return 'swarming';
  if (npcCount >= tiers.crowded.min) return 'crowded';
  if (npcCount >= tiers.populated.min) return 'populated';
  if (npcCount >= tiers.scattered.min) return 'scattered';
  return 'sparse';
}

/**
 * Get tier config for current density
 */
export function getDensityTierConfig(npcCount: number) {
  const tier = getDensityTier(npcCount);
  return { tier, ...POPULATION_CONFIG.tiers[tier] };
}

// ============================================
// DIE-DENSITY EFFICIENCY MATRIX
// ============================================

export type DieSides = 4 | 6 | 8 | 10 | 12 | 20;

export interface DieDensityConfig {
  sparse: number;
  scattered: number;
  populated: number;
  crowded: number;
  swarming: number;
  identity: string;
  loreQuote: string;
}

/**
 * Die efficiency by density tier
 * d4 excels at sparse, d20 excels at swarming
 */
export const DIE_DENSITY_EFFICIENCY: Record<DieSides, DieDensityConfig> = {
  4: {  // "The Surgeon" - Void - The One
    sparse: 1.5, scattered: 1.3, populated: 1.0, crowded: 0.8, swarming: 0.6,
    identity: 'The Surgeon',
    loreQuote: 'The One rewards patience. In stillness, see the one target that matters.',
  },
  6: {  // "The Builder" - Earth - John
    sparse: 0.9, scattered: 1.0, populated: 1.1, crowded: 1.1, swarming: 1.0,
    identity: 'The Builder',
    loreQuote: 'John builds upon what exists. Neither flood nor drought moves the earth.',
  },
  8: {  // "The Reaper" - Death - Peter
    sparse: 0.7, scattered: 0.9, populated: 1.2, crowded: 1.4, swarming: 1.2,
    identity: 'The Reaper',
    loreQuote: 'Peter counts the living. More souls, greater harvest.',
  },
  10: { // "The Inferno" - Fire - Robert
    sparse: 0.6, scattered: 0.8, populated: 1.1, crowded: 1.3, swarming: 1.5,
    identity: 'The Inferno',
    loreQuote: 'Robert\'s fire hungers. Give it fuel, and it consumes all.',
  },
  12: { // "The Glacier" - Ice - Alice
    sparse: 1.0, scattered: 1.1, populated: 1.2, crowded: 1.25, swarming: 1.3,
    identity: 'The Glacier',
    loreQuote: 'Alice freezes opportunity. The longer you wait, the more she preserves.',
  },
  20: { // "The Storm" - Wind - Jane (REBALANCED)
    sparse: 0.4, scattered: 0.6, populated: 0.9, crowded: 1.1, swarming: 1.3,
    identity: 'The Storm',
    loreQuote: 'Jane\'s wind scatters. In emptiness, it finds nothing. In crowds, everyone.',
  },
};

/**
 * Get density efficiency for a die at current NPC count
 */
export function getDensityEfficiency(dieSides: DieSides, npcCount: number): number {
  const tier = getDensityTier(npcCount);
  return DIE_DENSITY_EFFICIENCY[dieSides][tier];
}

/**
 * Get die identity and lore
 */
export function getDieIdentity(dieSides: DieSides): { identity: string; loreQuote: string } {
  const { identity, loreQuote } = DIE_DENSITY_EFFICIENCY[dieSides];
  return { identity, loreQuote };
}

// ============================================
// DIE-SPECIFIC DECAY MODIFIERS
// ============================================

export interface DieDecayConfig {
  /** Multiplier applied to base decay rate */
  decayMultiplier: number;
  /** Multiplier for grace period duration */
  graceMultiplier: number;
  /** Lore reason for the modifier */
  loreReason: string;
}

/**
 * Decay modifiers by die type
 * d4/d12 preserve score (slow decay), d10/d20 bleed fast
 */
export const DIE_DECAY_MODIFIERS: Record<DieSides, DieDecayConfig> = {
  4:  { decayMultiplier: 0.5,  graceMultiplier: 1.5, loreReason: 'The Void preserves.' },
  6:  { decayMultiplier: 0.8,  graceMultiplier: 1.2, loreReason: 'Earth endures.' },
  8:  { decayMultiplier: 0.6,  graceMultiplier: 1.0, loreReason: 'Death is permanent.' },
  10: { decayMultiplier: 1.5,  graceMultiplier: 0.7, loreReason: 'Fire burns fast.' },
  12: { decayMultiplier: 0.3,  graceMultiplier: 2.0, loreReason: 'Ice freezes time.' },
  20: { decayMultiplier: 1.3,  graceMultiplier: 0.8, loreReason: 'Wind carries away.' },
};

/**
 * Get decay modifier for a die type
 */
export function getDieDecayModifier(dieSides: DieSides): DieDecayConfig {
  return DIE_DECAY_MODIFIERS[dieSides];
}

/**
 * Calculate weighted decay based on dice thrown this event
 * @param elapsedMs - Time elapsed since event start
 * @param targetScore - Score goal for this event
 * @param thrownDice - Array of die types thrown so far
 * @returns Decay per second at this moment
 */
export function calculateWeightedDecay(
  elapsedMs: number,
  targetScore: number,
  thrownDice: DieSides[]
): number {
  const baseDecay = calculateDecayRate(elapsedMs, targetScore);

  if (thrownDice.length === 0) return baseDecay;

  // Average decay modifier from thrown dice
  const avgDecayMod = thrownDice.reduce((sum, die) =>
    sum + DIE_DECAY_MODIFIERS[die].decayMultiplier, 0
  ) / thrownDice.length;

  return baseDecay * avgDecayMod;
}

/**
 * Get effective grace period based on thrown dice
 * @param thrownDice - Array of die types thrown so far
 * @returns Adjusted grace period in ms
 */
export function getEffectiveGracePeriod(thrownDice: DieSides[]): number {
  if (thrownDice.length === 0) return FLAT_EVENT_CONFIG.gracePeriodMs;

  const avgGraceMod = thrownDice.reduce((sum, die) =>
    sum + DIE_DECAY_MODIFIERS[die].graceMultiplier, 0
  ) / thrownDice.length;

  return Math.round(FLAT_EVENT_CONFIG.gracePeriodMs * avgGraceMod);
}

// ============================================
// FLAT STRUCTURE REFERENCE (BULLET MODE: 3 throws, 20s timer)
// ============================================
// Domain | Goal  | Gold | Avg Throw | 3 Throws | Notes
// -------|-------|------|-----------|----------|-------
// 1      |   500 |  75g |    200    |  600     | Clearable (20% margin)
// 2      |   750 | 125g |    200    |  600     | Needs 1.25x mult
// 3      | 1,100 | 175g |    200    |  600     | Needs 1.8x mult
// 4      | 1,500 | 250g |    200    |  600     | Needs 2.5x mult
// 5      | 2,000 | 350g |    200    |  600     | Needs 3.3x mult
// 6      | 2,500 | 500g |    200    |  600     | Needs 4.2x mult
//
// Total run time target: 2-5 minutes (6 events x 20s = 2 min timers)
//
// DENSITY EFFICIENCY REFERENCE
// ============================================
// Time | Pop | d4 Eff | d6 Eff | d20 Eff | Best Die
// -----|-----|--------|--------|---------|----------
// 0s   | 12  | 1.5x   | 0.9x   | 0.4x    | d4
// 4s   | 24  | 1.3x   | 1.0x   | 0.6x    | d4
// 8s   | 36  | 1.0x   | 1.1x   | 0.9x    | d8 (1.2x)
// 12s  | 48  | 0.8x   | 1.1x   | 1.1x    | d8 (1.4x)
// 16s  | 58  | 0.6x   | 1.0x   | 1.3x    | d10/d20
