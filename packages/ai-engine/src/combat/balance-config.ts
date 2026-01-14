/**
 * Balance Configuration - Centralized tuning constants
 *
 * Timer-based multiplier decay rewards fast, instinctive play.
 * NEVER DIE GUY
 */

// ============================================
// TIMER-BASED MULTIPLIER DECAY
// ============================================

export const TIMER_CONFIG = {
  /** Seconds between multiplier decay steps */
  decayInterval: 10,

  /** Decay factor per step (0.5 = halves each step) */
  decayFactor: 0.5,

  /** Minimum multiplier floor (never goes below) */
  minMultiplier: 1,

  /** When timer starts: 'first_throw' */
  startTrigger: 'first_throw' as const,

  /** Pause timer during throw/resolve animations */
  pauseDuringAnimation: true,

  /** Animation duration in ms (for pause calculation) */
  animationDuration: 500,
} as const;

/**
 * Calculate decayed multiplier based on elapsed time
 * @param baseMultiplier - Starting multiplier (after trades)
 * @param elapsedSeconds - Time since timer started
 * @returns Decayed multiplier (minimum 1)
 */
export function calculateDecayedMultiplier(
  baseMultiplier: number,
  elapsedSeconds: number
): number {
  const decaySteps = Math.floor(elapsedSeconds / TIMER_CONFIG.decayInterval);
  const decayedValue = baseMultiplier * Math.pow(TIMER_CONFIG.decayFactor, decaySteps);
  return Math.max(TIMER_CONFIG.minMultiplier, Math.floor(decayedValue));
}

/**
 * Get seconds until next decay tick
 * @param elapsedSeconds - Time since timer started
 * @returns Seconds remaining until next decay
 */
export function getSecondsUntilDecay(elapsedSeconds: number): number {
  if (elapsedSeconds <= 0) return TIMER_CONFIG.decayInterval;
  const secondsIntoCurrentInterval = elapsedSeconds % TIMER_CONFIG.decayInterval;
  return TIMER_CONFIG.decayInterval - secondsIntoCurrentInterval;
}

// ============================================
// SCORE CONFIGURATION
// ============================================

export const SCORE_CONFIG = {
  /** Base score for domain 1, normal room */
  baseScore: 1000,

  /** Multiplier per domain (1.25 = 25% harder each domain) */
  domainMultiplier: 1.25, // Changed from 1.5 - with persistent multiplier, scores are higher

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
