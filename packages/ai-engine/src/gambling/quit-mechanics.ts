/**
 * Gambling Quit Mechanics
 *
 * Handles NPC decisions to quit gambling sessions and return later.
 * Quit decisions are based on:
 * - Loss streaks
 * - Bad beats
 * - Gold lost
 * - Archetype personality
 * - Current mood
 */

import type { MoodType } from '../core/types';
import type { PlayerMatchState, CeeloEvent, PlayerCategory } from '../games/ceelo/types';
import type { BehavioralArchetype } from '../personality/behavioral-patterns';
import { getQuitThreshold } from './mood-mapping';

// ============================================
// Quit State Types
// ============================================

export interface QuitState {
  npcSlug: string;
  quitTurn: number;
  quitTimestamp: number;
  reason: QuitReason;
  cooldownTurns: number;
  returnTurn: number | null;  // null = not yet determined
  returnedEarly: boolean;
}

export type QuitReason = 'tilt' | 'streak_ended' | 'bad_beat' | 'rage' | 'broke' | 'voluntary';

export interface QuitDecision {
  shouldQuit: boolean;
  quitScore: number;
  reason: QuitReason;
  cooldown: number;
  message?: string;
}

export interface QuitConfig {
  minLossStreakToQuit: number;     // Default: 4
  badBeatQuitChance: number;        // Default: 0.3
  quitCooldownTurnsMin: number;     // Default: 10
  quitCooldownTurnsMax: number;     // Default: 20
  returnEarlyChancePerTurn: number; // Default: 0.15 (after half cooldown)
  announceQuitChance: number;       // Default: 0.8
  silentQuitChance: number;         // Default: 0.2
  brokeThreshold: number;           // Default: -100 (gold)
}

export const DEFAULT_QUIT_CONFIG: QuitConfig = {
  minLossStreakToQuit: 4,
  badBeatQuitChance: 0.3,
  quitCooldownTurnsMin: 10,
  quitCooldownTurnsMax: 20,
  returnEarlyChancePerTurn: 0.15,
  announceQuitChance: 0.8,
  silentQuitChance: 0.2,
  brokeThreshold: -100,
};

// ============================================
// Quit Decision Context
// ============================================

export interface QuitContext {
  playerState: PlayerMatchState;
  currentMood: MoodType;
  archetype: BehavioralArchetype;
  category: PlayerCategory;
  lastEvent: CeeloEvent;
  currentTurn: number;
  config: QuitConfig;
}

// ============================================
// Quit Evaluation Functions
// ============================================

/**
 * Determine if an NPC should quit based on context
 */
export function evaluateQuitDecision(
  context: QuitContext,
  rng: () => number
): QuitDecision {
  const { playerState, currentMood, archetype, lastEvent, config } = context;

  // Get archetype-specific quit threshold (1-10, higher = more reluctant)
  const threshold = getQuitThreshold(archetype);

  let quitScore = 0;
  let reason: QuitReason = 'voluntary';

  // ============================================
  // Loss Streak Contribution
  // ============================================
  const lossStreak = Math.abs(Math.min(0, playerState.currentStreak));
  if (lossStreak >= config.minLossStreakToQuit) {
    quitScore += lossStreak * 15;
    reason = 'tilt';
  }

  // ============================================
  // Bad Beat Contribution
  // ============================================
  if (lastEvent.type === 'bad_beat') {
    quitScore += 30;
    if (rng() < config.badBeatQuitChance) {
      quitScore += 20; // Extra boost for bad beats
    }
    reason = 'bad_beat';
  }

  // ============================================
  // Streak Broken Contribution
  // ============================================
  if (lastEvent.type === 'streak_broken') {
    const previousStreak = lastEvent.data['previousStreak'] as number ?? 0;
    if (previousStreak >= 5) {
      quitScore += 40;
      reason = 'streak_ended';
    } else if (previousStreak >= 3) {
      quitScore += 25;
      reason = 'streak_ended';
    }
  }

  // ============================================
  // Mood Contribution
  // ============================================
  switch (currentMood) {
    case 'angry':
      quitScore += 25;
      if (reason === 'tilt') reason = 'rage';
      break;
    case 'sad':
      quitScore += 15;
      break;
    case 'annoyed':
      quitScore += 10;
      break;
    case 'fearful':
      quitScore += 20;
      break;
    // Positive moods reduce quit chance
    case 'pleased':
    case 'amused':
    case 'generous':
      quitScore -= 20;
      break;
  }

  // ============================================
  // Gold Loss Contribution
  // ============================================
  const netGold = playerState.goldWon - playerState.goldLost;
  if (netGold <= config.brokeThreshold) {
    quitScore += 50;
    reason = 'broke';
  } else if (netGold < -50) {
    quitScore += 15;
  }

  // ============================================
  // Category Contribution
  // ============================================
  // Pantheon members are more prideful, less likely to quit
  if (context.category === 'pantheon') {
    quitScore -= 15;
  }
  // Cosmic horrors don't really care
  if (context.category === 'cosmic_horror') {
    quitScore -= 30;
  }

  // ============================================
  // Threshold Check
  // ============================================
  // Threshold is 1-10, we normalize to score comparison
  // Threshold 10 = need 100+ score to quit
  // Threshold 1 = need 10+ score to quit
  const requiredScore = threshold * 10;
  const shouldQuit = quitScore >= requiredScore;

  // Calculate cooldown if quitting
  let cooldown = 0;
  if (shouldQuit) {
    cooldown = calculateCooldown(quitScore, archetype, config, rng);
  }

  return {
    shouldQuit,
    quitScore,
    reason,
    cooldown,
    message: shouldQuit ? getQuitMessage(reason) : undefined,
  };
}

/**
 * Calculate how long an NPC should be on cooldown
 */
function calculateCooldown(
  quitScore: number,
  archetype: BehavioralArchetype,
  config: QuitConfig,
  rng: () => number
): number {
  const { quitCooldownTurnsMin, quitCooldownTurnsMax } = config;
  const range = quitCooldownTurnsMax - quitCooldownTurnsMin;

  // Higher quit score = longer cooldown
  const intensity = Math.min(1, quitScore / 100);
  const baseCooldown = quitCooldownTurnsMin + Math.floor(range * intensity);

  // Add some variance
  const variance = Math.floor(rng() * 6) - 3; // -3 to +2

  // Archetype adjustments
  let archetypeMod = 0;
  switch (archetype) {
    case 'warrior':
    case 'predator':
      archetypeMod = -2; // Come back faster
      break;
    case 'prey':
    case 'merchant':
      archetypeMod = 2; // Stay away longer
      break;
  }

  return Math.max(quitCooldownTurnsMin, baseCooldown + variance + archetypeMod);
}

/**
 * Get a message describing why the NPC quit
 */
function getQuitMessage(reason: QuitReason): string {
  switch (reason) {
    case 'tilt':
      return 'tilted after too many losses';
    case 'streak_ended':
      return 'devastated by their streak ending';
    case 'bad_beat':
      return 'couldn\'t handle that bad beat';
    case 'rage':
      return 'rage quit';
    case 'broke':
      return 'ran out of gold';
    case 'voluntary':
      return 'decided to step away';
  }
}

// ============================================
// Return Evaluation Functions
// ============================================

/**
 * Evaluate if an NPC should return from quit state
 */
export function evaluateReturn(
  quitState: QuitState,
  currentTurn: number,
  config: QuitConfig,
  rng: () => number
): { shouldReturn: boolean; returnedEarly: boolean } {
  const turnsQuitted = currentTurn - quitState.quitTurn;

  // Guaranteed return after full cooldown
  if (turnsQuitted >= quitState.cooldownTurns) {
    return { shouldReturn: true, returnedEarly: false };
  }

  // Must wait at least half cooldown before early return chance
  const halfCooldown = Math.floor(quitState.cooldownTurns / 2);
  if (turnsQuitted < halfCooldown) {
    return { shouldReturn: false, returnedEarly: false };
  }

  // Chance to return early, increasing each turn after half cooldown
  const turnsOverHalf = turnsQuitted - halfCooldown;
  const earlyReturnChance = config.returnEarlyChancePerTurn * turnsOverHalf;

  if (rng() < earlyReturnChance) {
    return { shouldReturn: true, returnedEarly: true };
  }

  return { shouldReturn: false, returnedEarly: false };
}

// ============================================
// Quit State Manager
// ============================================

export class QuitStateManager {
  private quitStates: Map<string, QuitState>;
  private config: QuitConfig;

  constructor(config: Partial<QuitConfig> = {}) {
    this.quitStates = new Map();
    this.config = { ...DEFAULT_QUIT_CONFIG, ...config };
  }

  /**
   * Record an NPC quitting
   */
  recordQuit(
    npcSlug: string,
    currentTurn: number,
    decision: QuitDecision
  ): QuitState {
    const quitState: QuitState = {
      npcSlug,
      quitTurn: currentTurn,
      quitTimestamp: Date.now(),
      reason: decision.reason,
      cooldownTurns: decision.cooldown,
      returnTurn: null,
      returnedEarly: false,
    };

    this.quitStates.set(npcSlug, quitState);
    return quitState;
  }

  /**
   * Record an NPC returning
   */
  recordReturn(npcSlug: string, currentTurn: number, returnedEarly: boolean): void {
    const quitState = this.quitStates.get(npcSlug);
    if (quitState) {
      quitState.returnTurn = currentTurn;
      quitState.returnedEarly = returnedEarly;
    }
    // Remove from active quit states
    this.quitStates.delete(npcSlug);
  }

  /**
   * Check if an NPC is currently quit
   */
  isQuitting(npcSlug: string): boolean {
    return this.quitStates.has(npcSlug);
  }

  /**
   * Get quit state for an NPC
   */
  getQuitState(npcSlug: string): QuitState | null {
    return this.quitStates.get(npcSlug) ?? null;
  }

  /**
   * Get all NPCs currently on quit cooldown
   */
  getQuittingNPCs(): string[] {
    return Array.from(this.quitStates.keys());
  }

  /**
   * Process returns for all quitting NPCs
   */
  processReturns(
    currentTurn: number,
    rng: () => number
  ): Array<{ npcSlug: string; returnedEarly: boolean }> {
    const returns: Array<{ npcSlug: string; returnedEarly: boolean }> = [];

    for (const [npcSlug, quitState] of this.quitStates) {
      const { shouldReturn, returnedEarly } = evaluateReturn(
        quitState,
        currentTurn,
        this.config,
        rng
      );

      if (shouldReturn) {
        this.recordReturn(npcSlug, currentTurn, returnedEarly);
        returns.push({ npcSlug, returnedEarly });
      }
    }

    return returns;
  }

  /**
   * Get remaining cooldown turns for an NPC
   */
  getRemainingCooldown(npcSlug: string, currentTurn: number): number {
    const quitState = this.quitStates.get(npcSlug);
    if (!quitState) return 0;

    const turnsQuitted = currentTurn - quitState.quitTurn;
    return Math.max(0, quitState.cooldownTurns - turnsQuitted);
  }

  /**
   * Export quit states for persistence
   */
  export(): Record<string, QuitState> {
    return Object.fromEntries(this.quitStates);
  }

  /**
   * Import quit states from persistence
   */
  import(states: Record<string, QuitState>): void {
    this.quitStates = new Map(Object.entries(states));
  }

  /**
   * Clear all quit states
   */
  clear(): void {
    this.quitStates.clear();
  }
}
