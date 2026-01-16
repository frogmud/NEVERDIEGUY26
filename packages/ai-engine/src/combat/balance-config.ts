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
