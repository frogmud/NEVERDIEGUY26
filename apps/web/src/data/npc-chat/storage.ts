/**
 * NPC Chat Storage
 *
 * Persistent storage for NPC conversations and relationships.
 * Follows pattern from src/data/player/storage.ts
 */

import type {
  NPCChatStorage,
  NPCConversation,
  NPCRelationship,
  ChatMessage,
} from './types';
import { createDefaultRelationship } from './relationship';

// ============================================
// Constants
// ============================================

const STORAGE_KEY = 'ndg_npc_chat';
const CURRENT_VERSION = 1;

// ============================================
// Default Data
// ============================================

export function createDefaultNPCChatStorage(): NPCChatStorage {
  return {
    conversations: {},
    relationships: {},
    encounteredNPCs: [],
    usedOnceEver: [],
    globalStats: {
      totalMessages: 0,
      mostChatted: null,
      lastActive: Date.now(),
    },
    version: CURRENT_VERSION,
  };
}

export function createDefaultConversation(npcSlug: string): NPCConversation {
  return {
    npcSlug,
    messages: [],
    lastInteraction: Date.now(),
    recentlyUsedTemplates: [],
    cooldownsActive: {},
    usedOncePerRun: [],
  };
}

// ============================================
// UUID Generator
// ============================================

function generateId(): string {
  return (
    crypto.randomUUID?.() ??
    `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
  );
}

// ============================================
// localStorage Functions
// ============================================

export function loadNPCChatStorage(): NPCChatStorage {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return createDefaultNPCChatStorage();
    }

    const parsed = JSON.parse(stored) as NPCChatStorage;

    // Version migration
    if (parsed.version !== CURRENT_VERSION) {
      return migrateNPCChatStorage(parsed);
    }

    return parsed;
  } catch (error) {
    console.error('Failed to load NPC chat storage:', error);
    return createDefaultNPCChatStorage();
  }
}

export function saveNPCChatStorage(data: NPCChatStorage): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save NPC chat storage:', error);
  }
}

export function clearNPCChatStorage(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// ============================================
// Conversation Operations
// ============================================

export function getConversation(
  storage: NPCChatStorage,
  npcSlug: string
): NPCConversation | undefined {
  return storage.conversations[npcSlug];
}

export function getOrCreateConversation(
  storage: NPCChatStorage,
  npcSlug: string
): { storage: NPCChatStorage; conversation: NPCConversation } {
  let conversation = storage.conversations[npcSlug];

  if (!conversation) {
    conversation = createDefaultConversation(npcSlug);

    return {
      storage: {
        ...storage,
        conversations: {
          ...storage.conversations,
          [npcSlug]: conversation,
        },
        encounteredNPCs: storage.encounteredNPCs.includes(npcSlug)
          ? storage.encounteredNPCs
          : [...storage.encounteredNPCs, npcSlug],
      },
      conversation,
    };
  }

  return { storage, conversation };
}

export function addMessage(
  storage: NPCChatStorage,
  npcSlug: string,
  message: Omit<ChatMessage, 'id' | 'timestamp'>
): NPCChatStorage {
  const { storage: updatedStorage, conversation } = getOrCreateConversation(
    storage,
    npcSlug
  );

  const newMessage: ChatMessage = {
    ...message,
    id: generateId(),
    timestamp: Date.now(),
  };

  const updatedConversation: NPCConversation = {
    ...conversation,
    messages: [...conversation.messages, newMessage],
    lastInteraction: Date.now(),
  };

  // Update message count per NPC for mostChatted tracking
  const messageCounts = Object.entries(updatedStorage.conversations).reduce(
    (acc, [slug, conv]) => {
      acc[slug] = conv.messages.length;
      return acc;
    },
    {} as Record<string, number>
  );
  messageCounts[npcSlug] = (messageCounts[npcSlug] || 0) + 1;

  const mostChatted = Object.entries(messageCounts).sort(
    ([, a], [, b]) => b - a
  )[0]?.[0] || null;

  return {
    ...updatedStorage,
    conversations: {
      ...updatedStorage.conversations,
      [npcSlug]: updatedConversation,
    },
    globalStats: {
      ...updatedStorage.globalStats,
      totalMessages: updatedStorage.globalStats.totalMessages + 1,
      mostChatted,
      lastActive: Date.now(),
    },
  };
}

// ============================================
// Relationship Operations
// ============================================

export function getRelationship(
  storage: NPCChatStorage,
  npcSlug: string
): NPCRelationship {
  return storage.relationships[npcSlug] || createDefaultRelationship(npcSlug);
}

export function updateRelationship(
  storage: NPCChatStorage,
  npcSlug: string,
  updater: (rel: NPCRelationship) => NPCRelationship
): NPCChatStorage {
  const current = getRelationship(storage, npcSlug);
  const updated = updater(current);

  return {
    ...storage,
    relationships: {
      ...storage.relationships,
      [npcSlug]: updated,
    },
  };
}

// ============================================
// Run Lifecycle
// ============================================

/**
 * Reset run-specific state for all NPCs (call at run start)
 */
export function resetRunState(storage: NPCChatStorage): NPCChatStorage {
  const updatedConversations = Object.entries(storage.conversations).reduce(
    (acc, [slug, conv]) => {
      acc[slug] = {
        ...conv,
        recentlyUsedTemplates: [],
        cooldownsActive: {},
        usedOncePerRun: [],
      };
      return acc;
    },
    {} as Record<string, NPCConversation>
  );

  const updatedRelationships = Object.entries(storage.relationships).reduce(
    (acc, [slug, rel]) => {
      acc[slug] = {
        ...rel,
        runInteractions: 0,
        lastRoomSeen: -1,
      };
      return acc;
    },
    {} as Record<string, NPCRelationship>
  );

  return {
    ...storage,
    conversations: updatedConversations,
    relationships: updatedRelationships,
  };
}

// ============================================
// Template Tracking
// ============================================

/**
 * Mark a template as used (for oncePerRun tracking)
 */
export function markTemplateUsedOnce(
  storage: NPCChatStorage,
  npcSlug: string,
  templateId: string,
  onceEver: boolean
): NPCChatStorage {
  const { storage: updatedStorage, conversation } = getOrCreateConversation(
    storage,
    npcSlug
  );

  const updatedConversation: NPCConversation = {
    ...conversation,
    usedOncePerRun: [...conversation.usedOncePerRun, templateId],
  };

  let usedOnceEver = updatedStorage.usedOnceEver;
  if (onceEver && !usedOnceEver.includes(templateId)) {
    usedOnceEver = [...usedOnceEver, templateId];
  }

  return {
    ...updatedStorage,
    conversations: {
      ...updatedStorage.conversations,
      [npcSlug]: updatedConversation,
    },
    usedOnceEver,
  };
}

/**
 * Check if a template was used with onceEver flag
 */
export function wasUsedOnceEver(
  storage: NPCChatStorage,
  templateId: string
): boolean {
  return storage.usedOnceEver.includes(templateId);
}

// ============================================
// Migration
// ============================================

function migrateNPCChatStorage(oldData: NPCChatStorage): NPCChatStorage {
  console.log(
    `Migrating NPC chat storage from v${oldData.version} to v${CURRENT_VERSION}`
  );
  // For future migrations
  return createDefaultNPCChatStorage();
}

// ============================================
// Statistics
// ============================================

export function getNPCChatStats(storage: NPCChatStorage): {
  totalMessages: number;
  totalNPCs: number;
  mostChatted: string | null;
  averageMessagesPerNPC: number;
} {
  const totalMessages = Object.values(storage.conversations).reduce(
    (sum, conv) => sum + conv.messages.length,
    0
  );
  const totalNPCs = storage.encounteredNPCs.length;

  return {
    totalMessages,
    totalNPCs,
    mostChatted: storage.globalStats.mostChatted,
    averageMessagesPerNPC: totalNPCs > 0 ? totalMessages / totalNPCs : 0,
  };
}
