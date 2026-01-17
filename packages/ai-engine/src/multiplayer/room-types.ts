/**
 * Room Types - Shared types for PartyKit rooms
 *
 * Used by both server (party/room.ts) and client hooks.
 *
 * NEVER DIE GUY
 */

import type { DiceEvent, PlayerFavorMap, InterventionEvent } from './index';

// ============================================
// ROOM CONFIGURATION
// ============================================

export type MatchFormat = 'bo1' | 'bo3' | 'bo5' | 'bo7';

export interface RoomConfig {
  matchFormat: MatchFormat;
  maxPlayers: number;
  seed?: string;             // Optional shared seed (random if not provided)
  allowSpectators: boolean;
  hostId: string;
}

// ============================================
// PLAYER STATE
// ============================================

export type PlayerStatus = 'lobby' | 'racing' | 'dead' | 'victory';

export interface RacePlayer {
  id: string;
  name: string;
  status: PlayerStatus;
  connected: boolean;
  isHost: boolean;

  // Progress (updated during race)
  currentDomain: number;      // 1-6
  roomsCleared: number;       // 0-18 (6 domains x 3 rooms)
  totalScore: number;
  lastUpdateTime: number;
}

// ============================================
// MATCH STATE
// ============================================

export interface MatchResult {
  matchNumber: number;
  seed: string;
  rankings: Array<{
    playerId: string;
    playerName: string;
    finalScore: number;
    status: 'victory' | 'dead';
    finishTime: number;
  }>;
  winnerId: string | null;
  durationMs: number;
}

export interface SetScore {
  playerId: string;
  wins: number;
}

// ============================================
// QUICK CHAT
// ============================================

export type QuickChatCategory = 'positive' | 'negative' | 'neutral' | 'custom';

export interface QuickChatPhrase {
  id: string;
  category: QuickChatCategory;
  text: string;
}

export const QUICK_CHAT_PHRASES: QuickChatPhrase[] = [
  // Positive
  { id: 'pos-1', category: 'positive', text: 'Nice throw!' },
  { id: 'pos-2', category: 'positive', text: 'Well played.' },
  { id: 'pos-3', category: 'positive', text: 'Good luck!' },
  { id: 'pos-4', category: 'positive', text: 'GG' },

  // Negative
  { id: 'neg-1', category: 'negative', text: 'Oops.' },
  { id: 'neg-2', category: 'negative', text: 'Not great...' },
  { id: 'neg-3', category: 'negative', text: 'Unfortunate.' },
  { id: 'neg-4', category: 'negative', text: '*sigh*' },

  // Neutral
  { id: 'neu-1', category: 'neutral', text: 'Interesting...' },
  { id: 'neu-2', category: 'neutral', text: 'Hmm.' },
  { id: 'neu-3', category: 'neutral', text: 'One moment.' },
  { id: 'neu-4', category: 'neutral', text: '...' },
];

export interface ChatEvent {
  id: string;
  playerId: string;
  playerName: string;
  phraseId: string;
  text: string;
  timestamp: number;
}

// ============================================
// ROOM STATE (Full snapshot)
// ============================================

export type RoomPhase = 'lobby' | 'countdown' | 'racing' | 'results' | 'set_complete';

export interface RoomState {
  // Room identity
  code: string;
  createdAt: number;

  // Configuration
  config: RoomConfig;

  // Phase
  phase: RoomPhase;
  countdownEnd?: number;         // Timestamp when countdown ends

  // Players
  players: Record<string, RacePlayer>;

  // Current match
  currentMatchNumber: number;
  currentSeed: string;
  matchStartTime?: number;

  // Match history
  matchHistory: MatchResult[];
  setScores: SetScore[];

  // Die-rector memory (persists across match set)
  favorMaps: Record<string, PlayerFavorMap>;

  // Event log (interventions, chat, etc.)
  recentEvents: Array<InterventionEvent | ChatEvent>;
}

// ============================================
// CLIENT -> SERVER MESSAGES
// ============================================

export type ClientMessage =
  | { type: 'JOIN'; playerName: string }
  | { type: 'LEAVE' }
  | { type: 'START_SET' }                                // Host only
  | { type: 'PROGRESS_UPDATE'; progress: ProgressUpdate }
  | { type: 'DICE_EVENTS'; events: DiceEvent[] }
  | { type: 'QUICK_CHAT'; phraseId: string }
  | { type: 'FINISH'; result: PlayerFinishResult }
  | { type: 'NEXT_MATCH' }                               // Host only
  | { type: 'REMATCH' };                                 // Any player (vote)

export interface ProgressUpdate {
  currentDomain: number;
  roomsCleared: number;
  totalScore: number;
}

export interface PlayerFinishResult {
  status: 'victory' | 'dead';
  finalScore: number;
  finishTime: number;
}

// ============================================
// SERVER -> CLIENT MESSAGES
// ============================================

export type ServerMessage =
  | { type: 'ROOM_STATE'; state: RoomState }
  | { type: 'PLAYER_JOINED'; player: RacePlayer }
  | { type: 'PLAYER_LEFT'; playerId: string }
  | { type: 'COUNTDOWN_START'; endsAt: number }
  | { type: 'RACE_START'; seed: string; matchNumber: number }
  | { type: 'PROGRESS_BROADCAST'; playerId: string; progress: ProgressUpdate }
  | { type: 'PLAYER_FINISHED'; playerId: string; result: PlayerFinishResult }
  | { type: 'MATCH_END'; result: MatchResult }
  | { type: 'SET_END'; finalScores: SetScore[]; winnerId: string }
  | { type: 'INTERVENTION'; event: InterventionEvent }
  | { type: 'CHAT'; event: ChatEvent }
  | { type: 'ERROR'; message: string };

// ============================================
// UTILITIES
// ============================================

/**
 * Generate 4-character room code
 */
export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excludes I, O, 0, 1
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

/**
 * Generate match seed
 */
export function generateSeed(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Get wins needed for match format
 */
export function getWinsNeeded(format: MatchFormat): number {
  switch (format) {
    case 'bo1': return 1;
    case 'bo3': return 2;
    case 'bo5': return 3;
    case 'bo7': return 4;
  }
}

/**
 * Check if set is complete
 */
export function isSetComplete(scores: SetScore[], format: MatchFormat): boolean {
  const winsNeeded = getWinsNeeded(format);
  return scores.some((s) => s.wins >= winsNeeded);
}

/**
 * Get set winner (null if incomplete)
 */
export function getSetWinner(scores: SetScore[], format: MatchFormat): string | null {
  const winsNeeded = getWinsNeeded(format);
  const winner = scores.find((s) => s.wins >= winsNeeded);
  return winner?.playerId ?? null;
}
