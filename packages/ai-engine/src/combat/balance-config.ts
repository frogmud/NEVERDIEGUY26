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
// SCORE CONFIGURATION
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
 * Calculate target score for a room
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
// TARGET SCORE REFERENCE
// ============================================
// Domain | Normal | Elite  | Boss
// -------|--------|--------|------
// 1      | 1,000  | 1,500  | 2,000
// 2      | 1,250  | 1,875  | 2,500
// 3      | 1,563  | 2,344  | 3,125
// 4      | 1,953  | 2,930  | 3,906
// 5      | 2,441  | 3,662  | 4,883
// 6      | 3,052  | 4,578  | 6,104
