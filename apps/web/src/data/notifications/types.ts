/**
 * Notification System Types
 *
 * Unified notification system for:
 * - NPC messages (synced from market chat + proactive pushes)
 * - System messages (account, welcome)
 * - Achievement notifications (gold, badges, level up)
 * - Challenge notifications (received, sent, NPC)
 */

import type { MoodType } from '../npc-chat/types';

// ============================================
// Notification Categories
// ============================================

export type NotificationCategory =
  | 'npc'         // NPC messages (from market chat or proactive push)
  | 'system'      // Account-related, welcome, settings
  | 'achievement' // Gold received, badges, level up
  | 'challenge';  // Game challenges (received/sent/NPC)

// ============================================
// NPC Notification Subtypes
// ============================================

export type NPCNotificationType =
  | 'greeting'          // NPC greeted you in market
  | 'message'           // Direct message
  | 'deal'              // Special offer/discount
  | 'reminder'          // Shop open, item back in stock
  | 'gift_reaction'     // Response to gift
  | 'purchase_reaction' // Response to purchase
  | 'challenge';        // NPC challenge invitation

// ============================================
// Achievement Types
// ============================================

export type AchievementType =
  | 'gold'     // Gold received
  | 'badge'    // Badge earned
  | 'level_up' // Level up
  | 'item';    // Special item received

// ============================================
// Challenge Types
// ============================================

export type ChallengeType =
  | 'received'  // Someone challenged you
  | 'sent'      // You sent a challenge
  | 'npc'       // NPC challenge
  | 'suggested'; // System suggested challenge

// ============================================
// Main Notification Interface
// ============================================

export interface Notification {
  id: string;
  category: NotificationCategory;

  // Content
  title: string;
  body: string;

  // Timing
  createdAt: number;
  expiresAt?: number; // For time-limited deals

  // State
  read: boolean;
  dismissed: boolean;

  // NPC-specific (when category === 'npc')
  npc?: {
    slug: string;
    name: string;
    avatar: string;
    mood: MoodType;
    type: NPCNotificationType;
    threadId: string; // Groups messages by NPC
  };

  // Achievement-specific (when category === 'achievement')
  achievement?: {
    type: AchievementType;
    value?: number;      // Gold amount
    badgeSlug?: string;
    level?: number;
  };

  // Challenge-specific (when category === 'challenge')
  challenge?: {
    type: ChallengeType;
    opponentName: string;
    opponentId?: string;
    mode: string;
    domain: string;
  };

  // Action payload (optional navigation/interaction)
  action?: {
    type: 'navigate' | 'open_shop' | 'accept_challenge' | 'view_item' | 'view_npc';
    payload: Record<string, unknown>;
  };
}

// ============================================
// NPC Thread (grouped conversation view)
// ============================================

export interface NPCThread {
  npcSlug: string;
  npcName: string;
  npcAvatar: string;
  lastMessageAt: number;
  unreadCount: number;
  preview: string; // Last message content truncated
}

// ============================================
// Storage Interface
// ============================================

export interface NotificationStorage {
  notifications: Notification[];
  threads: Record<string, NPCThread>; // npcSlug -> thread

  // Global state
  globalStats: {
    totalUnread: number;
    lastChecked: number;
    lastNPCPush: number; // Timestamp of last proactive push (rate limiting)
  };

  // User preferences
  preferences: {
    pushFromNPCs: boolean;
    pushFromSystem: boolean;
    pushFromChallenges: boolean;
  };

  version: number;
}

// ============================================
// Push Message Triggers
// ============================================

export type NPCPushTrigger =
  | 'daily_deal'            // Once per day: special offer
  | 'player_idle'           // Haven't visited market in 24h
  | 'relationship_milestone' // Crossed favor threshold
  | 'gift_followup'         // Delayed reaction to gift
  | 'random_greeting';      // Just saying hi

export interface NPCPushConfig {
  minIntervalMs: number;    // Min ms between pushes from same NPC
  maxDailyPushes: number;   // Max pushes per NPC per day
  triggers: NPCPushTrigger[];
}

// Default push configuration
export const DEFAULT_NPC_PUSH_CONFIG: NPCPushConfig = {
  minIntervalMs: 60 * 60 * 1000, // 1 hour
  maxDailyPushes: 3,
  triggers: ['daily_deal', 'player_idle', 'random_greeting'],
};

// ============================================
// Context for NotificationContext
// ============================================

export interface NotificationContextValue {
  // Data
  notifications: Notification[];
  threads: NPCThread[];
  unreadCount: number;

  // Operations
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  dismissNotification: (id: string) => void;
  clearAll: () => void;

  // NPC-specific
  getThreadMessages: (npcSlug: string) => Notification[];
  pushNPCMessage: (
    npcSlug: string,
    npcName: string,
    npcAvatar: string,
    message: string,
    type: NPCNotificationType,
    mood?: MoodType
  ) => void;

  // Refresh
  checkForNewPushes: () => void;
}
