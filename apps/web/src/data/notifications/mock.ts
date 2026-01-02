/**
 * Mock Notification Data
 *
 * Realistic mock data for development and testing.
 * Includes NPC messages, system notifications, achievements, and challenges.
 */

import type { Notification, NotificationStorage, NPCThread } from './types';

// ============================================
// Time Helpers
// ============================================

const now = Date.now();
const hour = 60 * 60 * 1000;
const day = 24 * hour;

// ============================================
// Mock Notifications
// ============================================

export const MOCK_NOTIFICATIONS: Notification[] = [
  // NPC - Willy Deal (proactive push)
  {
    id: 'notif-1',
    category: 'npc',
    title: 'Willy has a deal for you',
    body: 'Death Shards are 20% off today only! Come by the market before midnight.',
    createdAt: now - (2 * hour),
    read: false,
    dismissed: false,
    npc: {
      slug: 'willy',
      name: 'Willy One Eye',
      avatar: '/assets/characters/shops/sprite-willy-1.png',
      mood: 'generous',
      type: 'deal',
      threadId: 'willy',
    },
    action: {
      type: 'open_shop',
      payload: { shopSlug: 'wandering-market' },
    },
  },

  // Achievement - Gold Received
  {
    id: 'notif-2',
    category: 'achievement',
    title: 'Gold Received!',
    body: 'You earned 500g from Daily Rewards',
    createdAt: now - (3 * hour),
    read: false,
    dismissed: false,
    achievement: {
      type: 'gold',
      value: 500,
    },
    action: {
      type: 'navigate',
      payload: { path: '/rewards/daily' },
    },
  },

  // NPC - The One cryptic message
  {
    id: 'notif-3',
    category: 'npc',
    title: 'The One',
    body: 'The void watches. It always watches. When you roll the d20, remember...',
    createdAt: now - (5 * hour),
    read: true,
    dismissed: false,
    npc: {
      slug: 'the-one',
      name: 'The One',
      avatar: '/assets/characters/pantheon/sprite-the-one-1.png',
      mood: 'cryptic',
      type: 'message',
      threadId: 'the-one',
    },
  },

  // Challenge from Mr. Bones
  {
    id: 'notif-4',
    category: 'challenge',
    title: 'Challenge from Mr. Bones',
    body: '"Care to wager your soul, mortal? Best of 3 in the Dying Saucer."',
    createdAt: now - (6 * hour),
    read: false,
    dismissed: false,
    challenge: {
      type: 'npc',
      opponentName: 'Mr. Bones',
      mode: 'meteor',
      domain: 'the-dying-saucer',
    },
    npc: {
      slug: 'mr-bones',
      name: 'Mr. Bones',
      avatar: '/assets/characters/shops/sprite-mr-bones-1.png',
      mood: 'amused',
      type: 'challenge',
      threadId: 'mr-bones',
    },
    action: {
      type: 'accept_challenge',
      payload: { challengeId: 'challenge-bones-1' },
    },
  },

  // System - Welcome
  {
    id: 'notif-5',
    category: 'system',
    title: 'Welcome to NEVER DIE GUY',
    body: 'Complete your profile to unlock exclusive rewards and climb the leaderboard.',
    createdAt: now - (1 * day),
    read: true,
    dismissed: false,
    action: {
      type: 'navigate',
      payload: { path: '/profile/edit' },
    },
  },

  // NPC - Robert greeting (from market chat sync)
  {
    id: 'notif-6',
    category: 'npc',
    title: 'Robert',
    body: 'Greetings, traveler! My wares are the finest in all the domains.',
    createdAt: now - (1 * day + 2 * hour),
    read: true,
    dismissed: false,
    npc: {
      slug: 'robert',
      name: 'Robert',
      avatar: '/assets/characters/shops/sprite-robert-1.png',
      mood: 'pleased',
      type: 'greeting',
      threadId: 'robert',
    },
  },

  // Achievement - Level Up
  {
    id: 'notif-7',
    category: 'achievement',
    title: 'Level Up!',
    body: 'You reached Level 15! New ability slots unlocked.',
    createdAt: now - (2 * day),
    read: true,
    dismissed: false,
    achievement: {
      type: 'level_up',
      level: 15,
    },
    action: {
      type: 'navigate',
      payload: { path: '/progress' },
    },
  },

  // NPC - Willy reminder (proactive)
  {
    id: 'notif-8',
    category: 'npc',
    title: 'Willy One Eye',
    body: "Haven't seen you in a while! The market's open and I've got new stock.",
    createdAt: now - (2 * day + 5 * hour),
    read: true,
    dismissed: false,
    npc: {
      slug: 'willy',
      name: 'Willy One Eye',
      avatar: '/assets/characters/shops/sprite-willy-1.png',
      mood: 'neutral',
      type: 'reminder',
      threadId: 'willy',
    },
  },

  // Achievement - Badge
  {
    id: 'notif-9',
    category: 'achievement',
    title: 'Badge Earned: First Blood',
    body: 'You defeated your first enemy! The journey begins...',
    createdAt: now - (3 * day),
    read: true,
    dismissed: false,
    achievement: {
      type: 'badge',
      badgeSlug: 'first-blood',
    },
  },

  // System - Account
  {
    id: 'notif-10',
    category: 'system',
    title: 'Email Verified',
    body: 'Your email has been successfully verified. Your account is now secure.',
    createdAt: now - (4 * day),
    read: true,
    dismissed: false,
  },
];

// ============================================
// Mock Threads (computed from notifications)
// ============================================

export const MOCK_THREADS: Record<string, NPCThread> = {
  willy: {
    npcSlug: 'willy',
    npcName: 'Willy One Eye',
    npcAvatar: '/assets/characters/shops/sprite-willy-1.png',
    lastMessageAt: now - (2 * hour),
    unreadCount: 1,
    preview: 'Death Shards are 20% off today only!',
  },
  'the-one': {
    npcSlug: 'the-one',
    npcName: 'The One',
    npcAvatar: '/assets/characters/pantheon/sprite-the-one-1.png',
    lastMessageAt: now - (5 * hour),
    unreadCount: 0,
    preview: 'The void watches. It always watches...',
  },
  'mr-bones': {
    npcSlug: 'mr-bones',
    npcName: 'Mr. Bones',
    npcAvatar: '/assets/characters/shops/sprite-mr-bones-1.png',
    lastMessageAt: now - (6 * hour),
    unreadCount: 1,
    preview: 'Care to wager your soul, mortal?',
  },
  robert: {
    npcSlug: 'robert',
    npcName: 'Robert',
    npcAvatar: '/assets/characters/shops/sprite-robert-1.png',
    lastMessageAt: now - (1 * day + 2 * hour),
    unreadCount: 0,
    preview: 'Greetings, traveler! My wares are...',
  },
};

// ============================================
// Create Mock Storage
// ============================================

export function createMockNotificationStorage(): NotificationStorage {
  const unreadCount = MOCK_NOTIFICATIONS.filter(n => !n.read && !n.dismissed).length;

  return {
    notifications: MOCK_NOTIFICATIONS,
    threads: MOCK_THREADS,
    globalStats: {
      totalUnread: unreadCount,
      lastChecked: now - hour,
      lastNPCPush: now - (2 * hour),
    },
    preferences: {
      pushFromNPCs: true,
      pushFromSystem: true,
      pushFromChallenges: true,
    },
    version: 1,
  };
}
