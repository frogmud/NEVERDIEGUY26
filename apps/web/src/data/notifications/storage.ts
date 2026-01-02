/**
 * Notification Storage
 *
 * localStorage persistence for notifications with version migration support.
 * Follows the pattern from npc-chat/storage.ts
 */

import type { NotificationStorage, Notification, NPCThread } from './types';

const STORAGE_KEY = 'ndg_notifications';
const CURRENT_VERSION = 1;

// ============================================
// Default Storage State
// ============================================

function createDefaultStorage(): NotificationStorage {
  return {
    notifications: [],
    threads: {},
    globalStats: {
      totalUnread: 0,
      lastChecked: Date.now(),
      lastNPCPush: 0,
    },
    preferences: {
      pushFromNPCs: true,
      pushFromSystem: true,
      pushFromChallenges: true,
    },
    version: CURRENT_VERSION,
  };
}

// ============================================
// Load / Save Operations
// ============================================

export function loadNotificationStorage(): NotificationStorage {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return createDefaultStorage();
    }

    const parsed = JSON.parse(raw) as NotificationStorage;

    // Version migration
    if (!parsed.version || parsed.version < CURRENT_VERSION) {
      return migrateStorage(parsed);
    }

    return parsed;
  } catch (error) {
    console.error('Failed to load notification storage:', error);
    return createDefaultStorage();
  }
}

export function saveNotificationStorage(storage: NotificationStorage): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storage));
  } catch (error) {
    console.error('Failed to save notification storage:', error);
  }
}

// ============================================
// Migration
// ============================================

function migrateStorage(old: Partial<NotificationStorage>): NotificationStorage {
  // For now, just create fresh storage on version mismatch
  // Can add specific migrations as needed
  console.log('Migrating notification storage from version', old.version);
  return createDefaultStorage();
}

// ============================================
// Helper Operations
// ============================================

export function generateNotificationId(): string {
  return `notif-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function addNotificationToStorage(
  storage: NotificationStorage,
  notification: Omit<Notification, 'id' | 'createdAt'>
): NotificationStorage {
  const newNotification: Notification = {
    ...notification,
    id: generateNotificationId(),
    createdAt: Date.now(),
  };

  const notifications = [newNotification, ...storage.notifications];

  // Update NPC thread if applicable
  let threads = { ...storage.threads };
  if (notification.npc) {
    const { slug, name, avatar } = notification.npc;
    threads[slug] = {
      npcSlug: slug,
      npcName: name,
      npcAvatar: avatar,
      lastMessageAt: newNotification.createdAt,
      unreadCount: (threads[slug]?.unreadCount || 0) + (notification.read ? 0 : 1),
      preview: notification.body.substring(0, 50) + (notification.body.length > 50 ? '...' : ''),
    };
  }

  // Update unread count
  const totalUnread = notification.read
    ? storage.globalStats.totalUnread
    : storage.globalStats.totalUnread + 1;

  return {
    ...storage,
    notifications,
    threads,
    globalStats: {
      ...storage.globalStats,
      totalUnread,
    },
  };
}

export function markNotificationRead(
  storage: NotificationStorage,
  notificationId: string
): NotificationStorage {
  const notification = storage.notifications.find(n => n.id === notificationId);
  if (!notification || notification.read) {
    return storage;
  }

  const notifications = storage.notifications.map(n =>
    n.id === notificationId ? { ...n, read: true } : n
  );

  // Update thread unread count
  let threads = { ...storage.threads };
  if (notification.npc) {
    const thread = threads[notification.npc.slug];
    if (thread) {
      threads[notification.npc.slug] = {
        ...thread,
        unreadCount: Math.max(0, thread.unreadCount - 1),
      };
    }
  }

  return {
    ...storage,
    notifications,
    threads,
    globalStats: {
      ...storage.globalStats,
      totalUnread: Math.max(0, storage.globalStats.totalUnread - 1),
    },
  };
}

export function markAllNotificationsRead(storage: NotificationStorage): NotificationStorage {
  const notifications = storage.notifications.map(n => ({ ...n, read: true }));

  // Reset all thread unread counts
  const threads: Record<string, NPCThread> = {};
  Object.entries(storage.threads).forEach(([slug, thread]) => {
    threads[slug] = { ...thread, unreadCount: 0 };
  });

  return {
    ...storage,
    notifications,
    threads,
    globalStats: {
      ...storage.globalStats,
      totalUnread: 0,
      lastChecked: Date.now(),
    },
  };
}

export function dismissNotificationFromStorage(
  storage: NotificationStorage,
  notificationId: string
): NotificationStorage {
  const notification = storage.notifications.find(n => n.id === notificationId);
  if (!notification) {
    return storage;
  }

  const notifications = storage.notifications.map(n =>
    n.id === notificationId ? { ...n, dismissed: true } : n
  );

  // Adjust unread count if the notification was unread
  const unreadDelta = notification.read ? 0 : 1;

  return {
    ...storage,
    notifications,
    globalStats: {
      ...storage.globalStats,
      totalUnread: Math.max(0, storage.globalStats.totalUnread - unreadDelta),
    },
  };
}

export function clearAllNotifications(storage: NotificationStorage): NotificationStorage {
  return {
    ...storage,
    notifications: [],
    threads: {},
    globalStats: {
      ...storage.globalStats,
      totalUnread: 0,
    },
  };
}

export function getThreadMessages(
  storage: NotificationStorage,
  npcSlug: string
): Notification[] {
  return storage.notifications
    .filter(n => n.npc?.slug === npcSlug && !n.dismissed)
    .sort((a, b) => b.createdAt - a.createdAt);
}

export function getVisibleNotifications(storage: NotificationStorage): Notification[] {
  return storage.notifications
    .filter(n => !n.dismissed)
    .sort((a, b) => b.createdAt - a.createdAt);
}

export function getThreads(storage: NotificationStorage): NPCThread[] {
  return Object.values(storage.threads).sort((a, b) => b.lastMessageAt - a.lastMessageAt);
}
