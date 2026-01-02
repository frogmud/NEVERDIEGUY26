/**
 * Simulation State Persistence
 *
 * Handles saving and loading simulation state for:
 * - Cee-lo statistics and leaderboard
 * - Rivalry system data
 * - Quit state cooldowns
 * - Chat log sessions
 *
 * Designed to work in both browser (localStorage) and Node.js environments.
 */

import type { PlayerCareerStats, LeaderboardEntry } from '../games/ceelo/types';
import type { RivalryState } from '../gambling/rivalry-system';
import type { QuitState } from '../gambling/quit-mechanics';
import type { ChatLogSession } from './chat-logger';

// ============================================
// Types
// ============================================

export interface SimulationPersistence {
  version: number;
  savedAt: number;
  lastSessionEndTime: number;
  data: {
    statistics: StatisticsPersistence;
    rivalries: RivalriesPersistence;
    quitStates: QuitStatesPersistence;
    chatLogs: ChatLogsPersistence;
  };
}

export interface StatisticsPersistence {
  playerStats: Record<string, PlayerCareerStats>;
  lastLeaderboard: LeaderboardEntry[];
  totalMatchesRun: number;
  totalGoldExchanged: number;
}

export interface RivalriesPersistence {
  rivalries: Record<string, Record<string, RivalryState>>;
  currentTurn: number;
}

export interface QuitStatesPersistence {
  states: Record<string, QuitState>;
  currentTurn: number;
}

export interface ChatLogsPersistence {
  sessions: ChatLogSession[];
  maxRetained: number;
}

export interface PersistenceConfig {
  storageKey: string;
  version: number;
  maxChatSessions: number;
  autoSaveInterval: number; // ms, 0 to disable
}

export const DEFAULT_PERSISTENCE_CONFIG: PersistenceConfig = {
  storageKey: 'ndg-ceelo-simulation',
  version: 1,
  maxChatSessions: 5,
  autoSaveInterval: 0,
};

// ============================================
// Storage Adapter Interface
// ============================================

export interface StorageAdapter {
  get(key: string): string | null;
  set(key: string, value: string): void;
  remove(key: string): void;
}

/**
 * In-memory storage adapter (fallback)
 */
class MemoryStorageAdapter implements StorageAdapter {
  private storage: Map<string, string> = new Map();

  get(key: string): string | null {
    return this.storage.get(key) ?? null;
  }

  set(key: string, value: string): void {
    this.storage.set(key, value);
  }

  remove(key: string): void {
    this.storage.delete(key);
  }
}

/**
 * Browser localStorage adapter
 */
class LocalStorageAdapter implements StorageAdapter {
  get(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  set(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch {
      // Storage full or disabled
    }
  }

  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch {
      // Ignore
    }
  }
}

/**
 * Get the appropriate storage adapter for the current environment
 */
export function getStorageAdapter(): StorageAdapter {
  if (typeof localStorage !== 'undefined') {
    return new LocalStorageAdapter();
  }
  return new MemoryStorageAdapter();
}

// ============================================
// Persistence Manager
// ============================================

export class SimulationPersistenceManager {
  private config: PersistenceConfig;
  private storage: StorageAdapter;
  private autoSaveTimer: ReturnType<typeof setInterval> | null = null;

  constructor(config: Partial<PersistenceConfig> = {}, storage?: StorageAdapter) {
    this.config = { ...DEFAULT_PERSISTENCE_CONFIG, ...config };
    this.storage = storage ?? getStorageAdapter();
  }

  // ============================================
  // Core Save/Load
  // ============================================

  /**
   * Save full simulation state
   */
  save(state: Omit<SimulationPersistence, 'version' | 'savedAt'>): void {
    const persistence: SimulationPersistence = {
      version: this.config.version,
      savedAt: Date.now(),
      ...state,
    };

    // Trim chat logs to max retained
    if (persistence.data.chatLogs.sessions.length > this.config.maxChatSessions) {
      persistence.data.chatLogs.sessions = persistence.data.chatLogs.sessions.slice(
        -this.config.maxChatSessions
      );
    }

    const json = JSON.stringify(persistence);
    this.storage.set(this.config.storageKey, json);
  }

  /**
   * Load simulation state
   */
  load(): SimulationPersistence | null {
    const json = this.storage.get(this.config.storageKey);
    if (!json) return null;

    try {
      const data = JSON.parse(json) as SimulationPersistence;

      // Version migration could happen here
      if (data.version !== this.config.version) {
        return this.migrate(data);
      }

      return data;
    } catch {
      return null;
    }
  }

  /**
   * Check if saved state exists
   */
  hasSavedState(): boolean {
    return this.storage.get(this.config.storageKey) !== null;
  }

  /**
   * Clear saved state
   */
  clear(): void {
    this.storage.remove(this.config.storageKey);
  }

  /**
   * Get time since last session ended
   */
  getTimeSinceLastSession(): number | null {
    const state = this.load();
    if (!state) return null;
    return Date.now() - state.lastSessionEndTime;
  }

  // ============================================
  // Partial Updates
  // ============================================

  /**
   * Save just statistics
   */
  saveStatistics(stats: StatisticsPersistence): void {
    const current = this.load();
    if (current) {
      current.data.statistics = stats;
      current.savedAt = Date.now();
      this.storage.set(this.config.storageKey, JSON.stringify(current));
    } else {
      this.save({
        lastSessionEndTime: Date.now(),
        data: {
          statistics: stats,
          rivalries: { rivalries: {}, currentTurn: 0 },
          quitStates: { states: {}, currentTurn: 0 },
          chatLogs: { sessions: [], maxRetained: this.config.maxChatSessions },
        },
      });
    }
  }

  /**
   * Save just rivalries
   */
  saveRivalries(rivalries: RivalriesPersistence): void {
    const current = this.load();
    if (current) {
      current.data.rivalries = rivalries;
      current.savedAt = Date.now();
      this.storage.set(this.config.storageKey, JSON.stringify(current));
    }
  }

  /**
   * Save just quit states
   */
  saveQuitStates(quitStates: QuitStatesPersistence): void {
    const current = this.load();
    if (current) {
      current.data.quitStates = quitStates;
      current.savedAt = Date.now();
      this.storage.set(this.config.storageKey, JSON.stringify(current));
    }
  }

  /**
   * Append chat log session
   */
  appendChatLog(session: ChatLogSession): void {
    const current = this.load();
    if (current) {
      current.data.chatLogs.sessions.push(session);
      // Trim
      if (current.data.chatLogs.sessions.length > this.config.maxChatSessions) {
        current.data.chatLogs.sessions = current.data.chatLogs.sessions.slice(
          -this.config.maxChatSessions
        );
      }
      current.savedAt = Date.now();
      this.storage.set(this.config.storageKey, JSON.stringify(current));
    }
  }

  // ============================================
  // Auto-save
  // ============================================

  /**
   * Start auto-save with given state provider
   */
  startAutoSave(getState: () => Omit<SimulationPersistence, 'version' | 'savedAt'>): void {
    if (this.config.autoSaveInterval <= 0) return;

    this.stopAutoSave();
    this.autoSaveTimer = setInterval(() => {
      this.save(getState());
    }, this.config.autoSaveInterval);
  }

  /**
   * Stop auto-save
   */
  stopAutoSave(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
  }

  // ============================================
  // Migration
  // ============================================

  /**
   * Migrate old version to current
   */
  private migrate(old: SimulationPersistence): SimulationPersistence {
    // For now, just update version and return
    // Future migrations would handle schema changes
    return {
      ...old,
      version: this.config.version,
    };
  }

  // ============================================
  // Utilities
  // ============================================

  /**
   * Create empty persistence state
   */
  static createEmpty(maxChatSessions: number = 5): SimulationPersistence {
    return {
      version: 1,
      savedAt: Date.now(),
      lastSessionEndTime: Date.now(),
      data: {
        statistics: {
          playerStats: {},
          lastLeaderboard: [],
          totalMatchesRun: 0,
          totalGoldExchanged: 0,
        },
        rivalries: {
          rivalries: {},
          currentTurn: 0,
        },
        quitStates: {
          states: {},
          currentTurn: 0,
        },
        chatLogs: {
          sessions: [],
          maxRetained: maxChatSessions,
        },
      },
    };
  }

  /**
   * Export persistence data as JSON string
   */
  export(): string {
    const data = this.load();
    return JSON.stringify(data, null, 2);
  }

  /**
   * Import persistence data from JSON string
   */
  import(json: string): boolean {
    try {
      const data = JSON.parse(json) as SimulationPersistence;
      this.storage.set(this.config.storageKey, JSON.stringify(data));
      return true;
    } catch {
      return false;
    }
  }
}

// ============================================
// Singleton Instance
// ============================================

let globalPersistence: SimulationPersistenceManager | null = null;

/**
 * Get or create global persistence manager
 */
export function getGlobalPersistence(
  config?: Partial<PersistenceConfig>
): SimulationPersistenceManager {
  if (!globalPersistence) {
    globalPersistence = new SimulationPersistenceManager(config);
  }
  return globalPersistence;
}

/**
 * Reset global persistence manager
 */
export function resetGlobalPersistence(): void {
  if (globalPersistence) {
    globalPersistence.stopAutoSave();
  }
  globalPersistence = null;
}

// ============================================
// Convenience Functions
// ============================================

/**
 * Calculate matches to run based on time since last session
 * Returns number of matches to simulate to "catch up"
 */
export function calculateCatchUpMatches(
  timeSinceLastSession: number,
  config: {
    matchesPerHour: number;
    maxCatchUpMatches: number;
    minTimeBetweenBatches: number; // ms
  }
): number {
  const { matchesPerHour, maxCatchUpMatches, minTimeBetweenBatches } = config;

  // If less than min time, no catch-up needed
  if (timeSinceLastSession < minTimeBetweenBatches) {
    return 0;
  }

  const hours = timeSinceLastSession / (1000 * 60 * 60);
  const calculatedMatches = Math.floor(hours * matchesPerHour);

  return Math.min(calculatedMatches, maxCatchUpMatches);
}
