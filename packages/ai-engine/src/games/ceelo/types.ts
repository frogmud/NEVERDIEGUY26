/**
 * Cee-lo Dice Game Types
 *
 * Core type definitions for the Cee-lo dice game simulation engine.
 * Standard 3d6 street dice game with shooting and banking mechanics.
 */

import type { SeededRng } from '../../core/seeded-rng';
import type { MoodType } from '../../core/types';
import type { NPCCategory } from '../../core/types';

// ============================================
// Dice Types
// ============================================

export type DieValue = 1 | 2 | 3 | 4 | 5 | 6;

export interface DiceRoll {
  dice: [DieValue, DieValue, DieValue];
  timestamp: number;
  rollNumber: number;
}

// ============================================
// Outcome Types
// ============================================

/**
 * Cee-lo outcomes ranked from best to worst:
 * 1. instant_win (4-5-6)
 * 2. trips (higher is better, 6-6-6 > 1-1-1)
 * 3. point (1-6, higher is better)
 * 4. instant_loss (1-2-3)
 * 5. no_point (must reroll)
 */
export type CeeloOutcome =
  | { type: 'instant_win'; roll: DiceRoll }
  | { type: 'instant_loss'; roll: DiceRoll }
  | { type: 'trips'; value: DieValue; roll: DiceRoll }
  | { type: 'point'; value: DieValue; roll: DiceRoll }
  | { type: 'no_point'; roll: DiceRoll };

export interface RollResult {
  finalOutcome: CeeloOutcome;
  rollHistory: DiceRoll[];
  rerollCount: number;
}

// ============================================
// Player Types
// ============================================

export type PlayerCategory = 'traveler' | 'wanderer' | 'pantheon' | 'cosmic_horror';

export interface CeeloPlayer {
  id: string;
  slug: string;
  name: string;
  category: PlayerCategory;
  luckyNumber: number;  // 0-7, used for flavor only in this engine
}

export interface PlayerMatchState {
  playerId: string;
  wins: number;
  losses: number;
  pushes: number;
  currentStreak: number;  // Positive = win streak, negative = loss streak
  rollStats: {
    instantWins: number;
    instantLosses: number;
    trips: number;
    points: Record<DieValue, number>;  // Count of each point value
    totalRerolls: number;
  };
  goldWon: number;
  goldLost: number;
  isActive: boolean;
  quitRound?: number;
}

// ============================================
// Match Types
// ============================================

export type MatchStatus = 'pending' | 'in_progress' | 'paused' | 'completed';

export interface MatchConfig {
  seed: string;
  maxRounds?: number;          // Optional limit
  targetWins?: number;         // First to X wins (optional)
  rollsPerOrderReset: number;  // Reset turn order every N rolls (default: 30)
  enableQuits: boolean;        // Allow NPCs to quit mid-match
  baseBets: Record<PlayerCategory, number>;
}

export const DEFAULT_MATCH_CONFIG: MatchConfig = {
  seed: 'default',
  rollsPerOrderReset: 30,
  enableQuits: true,
  baseBets: {
    traveler: 10,
    wanderer: 15,
    pantheon: 20,
    cosmic_horror: 5,
  },
};

export interface RoundResult {
  roundNumber: number;
  shooterId: string;
  shooterRoll: RollResult;
  opponentRolls: Record<string, RollResult>;
  winnerId: string | null;  // null = push
  loserId: string | null;
  goldExchanged: number;
  events: CeeloEvent[];
}

export interface MatchState {
  matchId: string;
  config: MatchConfig;
  status: MatchStatus;
  players: CeeloPlayer[];
  playerStates: Record<string, PlayerMatchState>;
  activePlayers: Set<string>;
  turnOrder: string[];
  currentShooterIndex: number;
  rounds: RoundResult[];
  totalRolls: number;
  rollsSinceOrderReset: number;
  rng: SeededRng;
  startTime: number;
  endTime?: number;
}

export interface MatchResult {
  matchId: string;
  startTime: number;
  endTime: number;
  totalRounds: number;
  totalRolls: number;
  standings: PlayerStanding[];
  playerStats: Record<string, PlayerMatchState>;
  notableEvents: CeeloEvent[];
  goldChanges: Record<string, number>;  // playerId -> net gold change
}

export interface PlayerStanding {
  rank: number;
  playerId: string;
  playerName: string;
  wins: number;
  losses: number;
  winRate: number;
  netGold: number;
  bestStreak: number;
  didQuit: boolean;
}

// ============================================
// Event Types
// ============================================

export type CeeloEventType =
  // Match lifecycle
  | 'match_started'
  | 'match_ended'
  | 'turn_order_set'
  | 'turn_order_reset'
  // Round events
  | 'round_started'
  | 'dice_rolled'
  | 'round_ended'
  // Outcome events
  | 'instant_win'
  | 'instant_loss'
  | 'trips_rolled'
  | 'point_set'
  // Streak events
  | 'streak_started'
  | 'streak_extended'
  | 'streak_broken'
  // Special events
  | 'bad_beat'          // Lost with good roll to better
  | 'upset_victory'     // Beat someone on a streak
  | 'perfect_round'     // 4-5-6 against 1-2-3
  // Player events
  | 'player_quit'
  | 'player_returned';

export interface CeeloEvent {
  type: CeeloEventType;
  matchId: string;
  roundNumber: number;
  timestamp: number;
  primaryPlayerId: string;
  secondaryPlayerId?: string;
  data: Record<string, unknown>;
  emotionalWeight: number;  // 1-10, how significant this event is
}

export type CeeloEventHandler = (event: CeeloEvent) => void;

// ============================================
// Betting Types
// ============================================

export interface BetCalculation {
  baseBet: number;
  streakMultiplier: number;
  confidenceBonus: number;
  tiltPenalty: number;
  finalBet: number;
}

export interface BetContext {
  playerState: PlayerMatchState;
  opponentState: PlayerMatchState;
  playerCategory: PlayerCategory;
}

// ============================================
// Chat Integration Types
// ============================================

export interface CeeloChatContext {
  matchId: string;
  roundNumber: number;
  speakerId: string;
  targetId?: string;
  mood: MoodType;
  event: CeeloEvent;
  variables: Record<string, string | number>;
}

export interface CeeloChatMessage {
  npcSlug: string;
  text: string;
  mood: MoodType;
  timestamp: number;
  context: CeeloChatContext;
}

// ============================================
// Statistics Types
// ============================================

export interface PlayerCareerStats {
  slug: string;
  name: string;
  category: PlayerCategory;
  // Match-level stats
  matchesPlayed: number;
  matchesWon: number;
  matchWinRate: number;
  // Round-level stats
  totalWins: number;
  totalLosses: number;
  totalPushes: number;
  roundWinRate: number;
  // Detailed stats
  instantWins: number;
  instantLosses: number;
  tripsRolled: number;
  pointsSet: Record<DieValue, number>;
  totalRerolls: number;
  averageRerolls: number;
  // Streak stats
  currentStreak: number;
  bestWinStreak: number;
  worstLossStreak: number;
  // Gold stats
  totalGoldWon: number;
  totalGoldLost: number;
  netGold: number;
  // Favorite point (most common)
  favoritePoint: DieValue | null;
  // Status
  status: 'active' | 'resting' | 'tilted' | 'on_fire';
  lastGameTimestamp: number;
}

export interface LeaderboardEntry {
  rank: number;
  slug: string;
  name: string;
  category: PlayerCategory;
  wins: number;
  losses: number;
  winRate: number;
  currentStreak: number;
  netGold: number;
  status: 'active' | 'resting' | 'tilted' | 'on_fire';
}

// ============================================
// Simulation Types
// ============================================

export interface SimulationConfig {
  gamesToSimulate: number;
  seed: string;
  logPath?: string;
  enableChat: boolean;
  matchConfig?: Partial<MatchConfig>;
}

export interface SimulationResult {
  gamesPlayed: number;
  startTime: number;
  endTime: number;
  leaderboard: LeaderboardEntry[];
  chatLog: CeeloChatMessage[];
  notableEvents: CeeloEvent[];
}
