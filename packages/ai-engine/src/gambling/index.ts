/**
 * Gambling Module
 *
 * NPC gambling simulation system for Cee-lo dice games.
 *
 * Features:
 * - Emotional responses during matches (trash talk, bragging, frustration)
 * - Mood transitions based on game events
 * - Quit/return mechanics for NPCs on tilt
 * - Rivalry tracking between frequent opponents
 * - Full simulation runner with chat logging
 *
 * Usage:
 * ```typescript
 * import { runCeeloBatch, runStartupSimulation, GamblingSimulation } from './gambling';
 *
 * // Quick batch run
 * const result = await runCeeloBatch(50);
 * console.log(result.leaderboard);
 *
 * // Run on app startup based on time since last session
 * const result = await runStartupSimulation(lastSessionTimestamp);
 * ```
 */

// ============================================
// Template Exports
// ============================================

export {
  ALL_GAMBLING_TEMPLATES,
  TRASH_TALK_TEMPLATES,
  BRAG_TEMPLATES,
  FRUSTRATION_TEMPLATES,
  QUIT_THREAT_TEMPLATES,
  QUIT_TEMPLATES,
  RETURN_TEMPLATES,
  RIVALRY_TEMPLATES,
  WITNESS_TEMPLATES,
  STREAK_TEMPLATES,
  getGamblingTemplates,
  getGamblingTemplatesByMood,
} from './gambling-templates';

// ============================================
// Mood Mapping Exports
// ============================================

export {
  MOOD_TRANSITIONS,
  ARCHETYPE_MOOD_MODIFIERS,
  findApplicableTransitions,
  calculateNewMood,
  getTrashTalkProbability,
  getQuitThreshold,
  getRivalryIntensityMod,
  type MoodTransition,
  type MoodCondition,
  type GamblingMoodContext,
  type ArchetypeMoodModifiers,
} from './mood-mapping';

// ============================================
// Quit Mechanics Exports
// ============================================

export {
  QuitStateManager,
  evaluateQuitDecision,
  evaluateReturn,
  DEFAULT_QUIT_CONFIG,
  type QuitState,
  type QuitReason,
  type QuitDecision,
  type QuitConfig,
  type QuitContext,
} from './quit-mechanics';

// ============================================
// Rivalry System Exports
// ============================================

export {
  RivalryManager,
  DEFAULT_RIVALRY_CONFIG,
  type RivalryState,
  type RivalryOrigin,
  type RivalryEvent,
  type RivalryConfig,
} from './rivalry-system';

// ============================================
// Event Dispatcher Exports
// ============================================

export {
  GamblingEventDispatcher,
  type EventHandlerContext,
  type EventHandlerResult,
  type GamblingEventHandler,
} from './event-dispatcher';

// ============================================
// Simulation Exports (Server-only)
// ============================================

// NOTE: GamblingSimulation, runCeeloBatch, runStartupSimulation use Node.js fs/path
// Import directly from '@ndg/ai-engine/server/gambling' for server-side scripts

// ============================================
// Player Ceelo Challenge Exports
// ============================================

export {
  // Config
  DEFAULT_CEELO_CHALLENGE_CONFIG,
  type CeeloChallengeConfig,

  // Types
  type SideBetType,
  type SideBet,
  type CeeloRoundState,
  type CeeloChallengeState,
  type ChallengeResult,

  // Core functions
  canChallenge,
  createChallenge,
  startRound,
  playerReroll,
  npcReroll,
  resolveChallenge,
  quickCeeloMatch,

  // Lucky number
  applyLuckyNumberBonus,

  // Integration
  applyChallengeToEconomy,
  applyChallengeToDebt,
} from './ceelo-challenge';
