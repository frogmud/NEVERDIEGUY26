/**
 * Chat Logger Utility
 *
 * Handles logging chat messages from gambling simulations
 * to persistent storage for review and debugging.
 *
 * The logger is environment-aware and works in both
 * Node.js (file system) and browser (localStorage/IndexedDB) contexts.
 */

import type { CeeloChatMessage } from '../games/ceelo/types';
import type { MoodType } from '../core/types';

// ============================================
// Types
// ============================================

export interface ChatLogEntry {
  id: string;
  timestamp: number;
  npcSlug: string;
  npcName?: string;
  text: string;
  mood: MoodType;
  matchId?: string;
  roundNumber?: number;
  targetId?: string;
}

export interface ChatLogSession {
  id: string;
  startTime: number;
  endTime?: number;
  entries: ChatLogEntry[];
  metadata: {
    matchCount: number;
    participantCount: number;
    messageCount: number;
  };
}

export interface ChatLoggerConfig {
  maxEntriesPerSession: number;
  maxSessionsRetained: number;
  enableConsoleOutput: boolean;
  enablePersistence: boolean;
  logFilePath?: string;
}

export const DEFAULT_LOGGER_CONFIG: ChatLoggerConfig = {
  maxEntriesPerSession: 10000,
  maxSessionsRetained: 10,
  enableConsoleOutput: false,
  enablePersistence: true,
  logFilePath: undefined,
};

// ============================================
// Chat Logger Class
// ============================================

export class ChatLogger {
  private config: ChatLoggerConfig;
  private currentSession: ChatLogSession | null = null;
  private sessions: ChatLogSession[] = [];
  private entryCount = 0;

  constructor(config: Partial<ChatLoggerConfig> = {}) {
    this.config = { ...DEFAULT_LOGGER_CONFIG, ...config };
  }

  // ============================================
  // Session Management
  // ============================================

  /**
   * Start a new logging session
   */
  startSession(): string {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    this.currentSession = {
      id: sessionId,
      startTime: Date.now(),
      entries: [],
      metadata: {
        matchCount: 0,
        participantCount: 0,
        messageCount: 0,
      },
    };

    return sessionId;
  }

  /**
   * End the current session
   */
  endSession(): ChatLogSession | null {
    if (!this.currentSession) return null;

    this.currentSession.endTime = Date.now();
    this.currentSession.metadata.messageCount = this.currentSession.entries.length;

    const session = this.currentSession;
    this.sessions.push(session);

    // Trim old sessions
    while (this.sessions.length > this.config.maxSessionsRetained) {
      this.sessions.shift();
    }

    this.currentSession = null;
    return session;
  }

  /**
   * Get the current session
   */
  getCurrentSession(): ChatLogSession | null {
    return this.currentSession;
  }

  /**
   * Get all retained sessions
   */
  getAllSessions(): ChatLogSession[] {
    return [...this.sessions];
  }

  // ============================================
  // Logging Methods
  // ============================================

  /**
   * Log a Cee-lo chat message
   */
  logCeeloMessage(message: CeeloChatMessage, npcName?: string): void {
    if (!this.currentSession) {
      this.startSession();
    }

    const entry: ChatLogEntry = {
      id: `msg_${this.entryCount++}`,
      timestamp: message.timestamp,
      npcSlug: message.npcSlug,
      npcName,
      text: message.text,
      mood: message.mood,
      matchId: message.context?.matchId,
      roundNumber: message.context?.roundNumber,
      targetId: message.context?.targetId,
    };

    this.addEntry(entry);
  }

  /**
   * Log a raw text message
   */
  logMessage(
    npcSlug: string,
    text: string,
    mood: MoodType,
    context?: { matchId?: string; roundNumber?: number; targetId?: string; npcName?: string }
  ): void {
    if (!this.currentSession) {
      this.startSession();
    }

    const entry: ChatLogEntry = {
      id: `msg_${this.entryCount++}`,
      timestamp: Date.now(),
      npcSlug,
      npcName: context?.npcName,
      text,
      mood,
      matchId: context?.matchId,
      roundNumber: context?.roundNumber,
      targetId: context?.targetId,
    };

    this.addEntry(entry);
  }

  /**
   * Log multiple messages at once
   */
  logMessages(messages: CeeloChatMessage[], npcNames?: Record<string, string>): void {
    for (const message of messages) {
      this.logCeeloMessage(message, npcNames?.[message.npcSlug]);
    }
  }

  /**
   * Add entry to current session
   */
  private addEntry(entry: ChatLogEntry): void {
    if (!this.currentSession) return;

    this.currentSession.entries.push(entry);

    // Console output if enabled
    if (this.config.enableConsoleOutput) {
      const moodEmoji = getMoodIndicator(entry.mood);
      const name = entry.npcName ?? entry.npcSlug;
      console.log(`[${moodEmoji}] ${name}: ${entry.text}`);
    }

    // Trim if over limit
    if (this.currentSession.entries.length > this.config.maxEntriesPerSession) {
      this.currentSession.entries.shift();
    }
  }

  // ============================================
  // Match Tracking
  // ============================================

  /**
   * Record that a match occurred (for metadata)
   */
  recordMatch(participantCount: number): void {
    if (this.currentSession) {
      this.currentSession.metadata.matchCount++;
      this.currentSession.metadata.participantCount = Math.max(
        this.currentSession.metadata.participantCount,
        participantCount
      );
    }
  }

  // ============================================
  // Export Methods
  // ============================================

  /**
   * Export current session as formatted text
   */
  exportSessionAsText(sessionId?: string): string {
    const session = sessionId
      ? this.sessions.find(s => s.id === sessionId)
      : this.currentSession;

    if (!session) return '';

    const lines: string[] = [];
    lines.push(`=== Chat Log Session: ${session.id} ===`);
    lines.push(`Started: ${new Date(session.startTime).toISOString()}`);
    if (session.endTime) {
      lines.push(`Ended: ${new Date(session.endTime).toISOString()}`);
    }
    lines.push(`Matches: ${session.metadata.matchCount}`);
    lines.push(`Messages: ${session.entries.length}`);
    lines.push('');
    lines.push('--- Messages ---');
    lines.push('');

    let currentMatchId = '';
    for (const entry of session.entries) {
      // Add match separator if changed
      if (entry.matchId && entry.matchId !== currentMatchId) {
        currentMatchId = entry.matchId;
        lines.push('');
        lines.push(`[Match: ${currentMatchId}]`);
      }

      const time = new Date(entry.timestamp).toLocaleTimeString();
      const name = entry.npcName ?? entry.npcSlug;
      const moodIndicator = getMoodIndicator(entry.mood);
      const target = entry.targetId ? ` (to ${entry.targetId})` : '';

      lines.push(`[${time}] ${moodIndicator} ${name}${target}: ${entry.text}`);
    }

    return lines.join('\n');
  }

  /**
   * Export current session as JSON
   */
  exportSessionAsJson(sessionId?: string): string {
    const session = sessionId
      ? this.sessions.find(s => s.id === sessionId)
      : this.currentSession;

    if (!session) return '{}';

    return JSON.stringify(session, null, 2);
  }

  /**
   * Get entries for a specific match
   */
  getMatchEntries(matchId: string, sessionId?: string): ChatLogEntry[] {
    const session = sessionId
      ? this.sessions.find(s => s.id === sessionId)
      : this.currentSession;

    if (!session) return [];

    return session.entries.filter(e => e.matchId === matchId);
  }

  /**
   * Get entries by NPC
   */
  getNpcEntries(npcSlug: string, sessionId?: string): ChatLogEntry[] {
    const session = sessionId
      ? this.sessions.find(s => s.id === sessionId)
      : this.currentSession;

    if (!session) return [];

    return session.entries.filter(e => e.npcSlug === npcSlug);
  }

  // ============================================
  // Utility Methods
  // ============================================

  /**
   * Clear all data
   */
  clear(): void {
    this.currentSession = null;
    this.sessions = [];
    this.entryCount = 0;
  }

  /**
   * Get total entry count across all sessions
   */
  getTotalEntryCount(): number {
    let count = this.currentSession?.entries.length ?? 0;
    for (const session of this.sessions) {
      count += session.entries.length;
    }
    return count;
  }
}

// ============================================
// Helper Functions
// ============================================

/**
 * Get a text indicator for mood
 */
function getMoodIndicator(mood: MoodType): string {
  switch (mood) {
    case 'pleased':
      return '+';
    case 'neutral':
      return '=';
    case 'annoyed':
      return '-';
    case 'angry':
      return '!';
    case 'sad':
      return '~';
    case 'grateful':
      return '*';
    case 'curious':
      return '?';
    default:
      return ' ';
  }
}

// ============================================
// Singleton Instance
// ============================================

let globalLogger: ChatLogger | null = null;

/**
 * Get or create the global chat logger
 */
export function getGlobalChatLogger(config?: Partial<ChatLoggerConfig>): ChatLogger {
  if (!globalLogger) {
    globalLogger = new ChatLogger(config);
  }
  return globalLogger;
}

/**
 * Reset the global chat logger
 */
export function resetGlobalChatLogger(): void {
  if (globalLogger) {
    globalLogger.clear();
  }
  globalLogger = null;
}
