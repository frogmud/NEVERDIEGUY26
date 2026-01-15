/**
 * Notification Context
 *
 * Manages notification state throughout the app.
 * Provides access to notifications, NPC threads, and notification actions.
 *
 * Usage:
 *   import { useNotifications } from '../contexts/NotificationContext';
 *   const { notifications, unreadCount, addNotification, markAsRead } = useNotifications();
 */

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type {
  Notification,
  NPCThread,
  NotificationContextValue,
  NPCNotificationType,
} from '../data/notifications/types';
import type { MoodType } from '../data/npc-chat/types';
import {
  loadNotificationStorage,
  saveNotificationStorage,
  addNotificationToStorage,
  markNotificationRead,
  markAllNotificationsRead,
  dismissNotificationFromStorage,
  clearAllNotifications,
  getThreadMessages as getThreadMessagesFromStorage,
  getVisibleNotifications,
  getThreads,
} from '../data/notifications/storage';

const NotificationContext = createContext<NotificationContextValue | null>(null);

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  // Load storage on mount
  const [storage, setStorage] = useState(() => loadNotificationStorage());

  // Persist storage changes
  useEffect(() => {
    saveNotificationStorage(storage);
  }, [storage]);

  // Computed values
  const notifications = getVisibleNotifications(storage);
  const threads = getThreads(storage);
  const unreadCount = storage.globalStats.totalUnread;

  // Add notification
  const addNotification = useCallback(
    (notification: Omit<Notification, 'id' | 'createdAt'>) => {
      setStorage(prev => addNotificationToStorage(prev, notification));
    },
    []
  );

  // Mark single notification as read
  const markAsRead = useCallback((id: string) => {
    setStorage(prev => markNotificationRead(prev, id));
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setStorage(prev => markAllNotificationsRead(prev));
  }, []);

  // Dismiss notification
  const dismissNotification = useCallback((id: string) => {
    setStorage(prev => dismissNotificationFromStorage(prev, id));
  }, []);

  // Clear all notifications
  const clearAll = useCallback(() => {
    setStorage(prev => clearAllNotifications(prev));
  }, []);

  // Get messages for a specific NPC thread
  const getThreadMessages = useCallback(
    (npcSlug: string) => {
      return getThreadMessagesFromStorage(storage, npcSlug);
    },
    [storage]
  );

  // Push NPC message (used by market chat sync and proactive pushes)
  const pushNPCMessage = useCallback(
    (
      npcSlug: string,
      npcName: string,
      npcAvatar: string,
      message: string,
      type: NPCNotificationType,
      mood: MoodType = 'neutral'
    ) => {
      const notification: Omit<Notification, 'id' | 'createdAt'> = {
        category: 'npc',
        title: npcName,
        body: message,
        read: false,
        dismissed: false,
        npc: {
          slug: npcSlug,
          name: npcName,
          avatar: npcAvatar,
          mood,
          type,
          threadId: npcSlug,
        },
        action: {
          type: 'view_npc',
          payload: { npcSlug },
        },
      };

      setStorage(prev => {
        const updated = addNotificationToStorage(prev, notification);
        return {
          ...updated,
          globalStats: {
            ...updated.globalStats,
            lastNPCPush: Date.now(),
          },
        };
      });
    },
    []
  );

  // Check for new proactive pushes (called on app load or periodically)
  const checkForNewPushes = useCallback(() => {
    // This is a placeholder for the NPC pusher logic
    // In a real implementation, this would check triggers and generate pushes
    // For now, just update the lastChecked timestamp
    setStorage(prev => ({
      ...prev,
      globalStats: {
        ...prev.globalStats,
        lastChecked: Date.now(),
      },
    }));
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        threads,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        dismissNotification,
        clearAll,
        getThreadMessages,
        pushNPCMessage,
        checkForNewPushes,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

// Convenience hook for just the unread count (e.g., for badges)
export function useUnreadCount() {
  const { unreadCount } = useNotifications();
  return unreadCount;
}

// Convenience hook for NPC threads
export function useNPCThreads() {
  const { threads, getThreadMessages } = useNotifications();
  return { threads, getThreadMessages };
}
