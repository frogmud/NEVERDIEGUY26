/**
 * Market Chat Hook
 *
 * Manages the interactive chat stream in the market.
 * - NPCs greet players when available
 * - Players can send messages to NPCs
 * - Purchases and gifts appear in the stream
 * - Uses the NPC chat system for responses
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import {
  selectResponse,
  createFallbackResponse,
  ALL_NPC_PERSONALITIES,
  ALL_TEMPLATES,
  createDefaultRelationship,
  getOrCreateConversation,
  loadNPCChatStorage,
  saveNPCChatStorage,
  addMessage as addStorageMessage,
} from '../data/npc-chat';
import type {
  MoodType,
  ResponseContext,
  NPCConversation,
  NPCChatStorage,
} from '../data/npc-chat/types';
import { shops } from '../data/wiki/entities/shops';
import { travelers } from '../data/wiki/entities/travelers';
import { wanderers } from '../data/wiki/entities/wanderers';
import type { Item, Shop, Traveler, Wanderer } from '../data/wiki/types';

// ============================================
// Types
// ============================================

export type MarketChatMessageType =
  | 'npc_greeting'
  | 'npc_farewell'
  | 'npc_message'
  | 'npc_to_npc' // NPCs chatting with each other
  | 'player_message'
  | 'purchase'
  | 'gift_sent'
  | 'gift_received'
  | 'ambient'
  | 'system';

export interface MarketChatMessage {
  id: string;
  type: MarketChatMessageType;
  content: string;
  timestamp: number;
  // For NPC messages
  npcSlug?: string;
  npcName?: string;
  npcAvatar?: string;
  mood?: MoodType;
  // For NPC-to-NPC chatter
  targetNpcSlug?: string;
  targetNpcName?: string;
  // For system/purchase/gift messages
  itemSlug?: string;
  itemName?: string;
  price?: number;
  recipientName?: string;
}

export interface MarketNpcInfo {
  slug: string;
  name: string;
  avatar: string;
  type: 'vendor' | 'traveler' | 'wanderer';
  isAvailable: boolean;
}

// ============================================
// Hook
// ============================================

export function useMarketChat() {
  const [messages, setMessages] = useState<MarketChatMessage[]>([]);
  const [storage, setStorage] = useState<NPCChatStorage | null>(null);
  const [hasGreeted, setHasGreeted] = useState<Set<string>>(new Set());

  // Load storage on mount
  useEffect(() => {
    const loaded = loadNPCChatStorage();
    setStorage(loaded);
  }, []);

  // Get all available NPCs in the market
  const availableNpcs = useMemo((): MarketNpcInfo[] => {
    const npcs: MarketNpcInfo[] = [];

    // Add vendors - use the proprietor's info for chat, not the shop's
    shops.forEach((shop) => {
      if (shop.position) {
        // Find the proprietor's wanderer entity for their name and portrait
        const vendorSlug = shop.proprietor || shop.slug;
        const vendor = wanderers.find((w) => w.slug === vendorSlug);
        npcs.push({
          slug: vendorSlug,
          name: vendor?.name || shop.name, // Use vendor name if available
          avatar: vendor?.portrait || shop.portrait || '', // Use vendor portrait
          type: 'vendor',
          isAvailable: true, // Simplified - would use useMarketAvailability
        });
      }
    });

    // Add travelers
    travelers.forEach((traveler) => {
      if (traveler.marketPosition) {
        npcs.push({
          slug: traveler.slug,
          name: traveler.name,
          avatar: traveler.portrait || '',
          type: 'traveler',
          isAvailable: true,
        });
      }
    });

    // Add wanderers (non-shop ones)
    wanderers.forEach((wanderer) => {
      const isShopProprietor = shops.some((s) => s.proprietor === wanderer.slug);
      if (wanderer.marketPosition && !isShopProprietor) {
        npcs.push({
          slug: wanderer.slug,
          name: wanderer.name,
          avatar: wanderer.portrait || '',
          type: 'wanderer',
          isAvailable: true,
        });
      }
    });

    return npcs;
  }, []);

  // Generate unique message ID
  const generateId = useCallback(() => {
    return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Get NPC info by slug
  const getNpcInfo = useCallback((npcSlug: string): MarketNpcInfo | undefined => {
    return availableNpcs.find((n) => n.slug === npcSlug);
  }, [availableNpcs]);

  // Create response context for NPC chat system
  const createContext = useCallback((npcSlug: string, playerMessage?: string): ResponseContext => {
    return {
      runSeed: `market-${Date.now()}`,
      roomIndex: 0,
      currentDomain: 'market',
      playerGold: 1000,
      playerIntegrity: 100,
      playerLuckyNumber: 7,
      heat: 0,
      playerMessage,
      relationship: storage?.relationships[npcSlug] || createDefaultRelationship(npcSlug),
      isDirectConversation: !!playerMessage,
    };
  }, [storage]);

  // Add a message to the chat
  const addMessage = useCallback((message: Omit<MarketChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: MarketChatMessage = {
      ...message,
      id: generateId(),
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, newMessage]);
    return newMessage;
  }, [generateId]);

  // Add a player message (associated with an NPC for per-conversation tracking)
  const addPlayerMessage = useCallback((content: string, targetNpcSlug: string) => {
    const newMessage: MarketChatMessage = {
      id: generateId(),
      type: 'player_message',
      content,
      timestamp: Date.now(),
      npcSlug: targetNpcSlug, // Associate with the target NPC for filtering
    };
    setMessages((prev) => [...prev, newMessage]);
    return newMessage;
  }, [generateId]);

  // Generate and add an NPC greeting
  const greetFromNpc = useCallback((npcSlug: string) => {
    // Don't greet twice
    if (hasGreeted.has(npcSlug)) return;

    const npcInfo = getNpcInfo(npcSlug);
    if (!npcInfo) return;

    // Try to get personality and templates
    const personality = ALL_NPC_PERSONALITIES.find((p) => p.slug === npcSlug);
    if (!personality) {
      // Fallback greeting for NPCs without full chat config
      addMessage({
        type: 'npc_greeting',
        content: `*${npcInfo.name} notices you*`,
        npcSlug,
        npcName: npcInfo.name,
        npcAvatar: npcInfo.avatar,
        mood: 'neutral',
      });
      setHasGreeted((prev) => new Set(prev).add(npcSlug));
      return;
    }

    const context = createContext(npcSlug);
    const conversation: NPCConversation | undefined = storage
      ? getOrCreateConversation(storage, npcSlug).conversation
      : undefined;

    const response = selectResponse(
      npcSlug,
      'shop_open',
      context,
      ALL_TEMPLATES,
      personality,
      conversation
    );

    if (response) {
      addMessage({
        type: 'npc_greeting',
        content: response.text,
        npcSlug,
        npcName: npcInfo.name,
        npcAvatar: npcInfo.avatar,
        mood: response.mood,
      });
    } else {
      // Fallback
      addMessage({
        type: 'npc_greeting',
        content: `*${npcInfo.name} waves*`,
        npcSlug,
        npcName: npcInfo.name,
        npcAvatar: npcInfo.avatar,
        mood: 'neutral',
      });
    }

    setHasGreeted((prev) => new Set(prev).add(npcSlug));
  }, [hasGreeted, getNpcInfo, createContext, storage, addMessage]);

  // Send a player message and get NPC response
  const sendPlayerMessage = useCallback((content: string, targetNpcSlug: string) => {
    const npcInfo = getNpcInfo(targetNpcSlug);
    if (!npcInfo) return;

    // Add player message (associated with target NPC)
    addPlayerMessage(content, targetNpcSlug);

    // Generate NPC response
    const personality = ALL_NPC_PERSONALITIES.find((p) => p.slug === targetNpcSlug);
    if (!personality) {
      // Fallback response
      setTimeout(() => {
        addMessage({
          type: 'npc_message',
          content: `*${npcInfo.name} nods thoughtfully*`,
          npcSlug: targetNpcSlug,
          npcName: npcInfo.name,
          npcAvatar: npcInfo.avatar,
          mood: 'neutral',
        });
      }, 500);
      return;
    }

    const context = createContext(targetNpcSlug, content);
    const conversation: NPCConversation | undefined = storage
      ? getOrCreateConversation(storage, targetNpcSlug).conversation
      : undefined;

    const response = selectResponse(
      targetNpcSlug,
      'playerMessage',
      context,
      ALL_TEMPLATES,
      personality,
      conversation
    );

    // Simulate typing delay
    setTimeout(() => {
      if (response) {
        addMessage({
          type: 'npc_message',
          content: response.text,
          npcSlug: targetNpcSlug,
          npcName: npcInfo.name,
          npcAvatar: npcInfo.avatar,
          mood: response.mood,
        });
      } else {
        // Use fallback response system instead of "..."
        const fallback = createFallbackResponse(
          targetNpcSlug,
          'neutral',
          `fallback-${targetNpcSlug}-${Date.now()}`
        );
        addMessage({
          type: 'npc_message',
          content: fallback.text,
          npcSlug: targetNpcSlug,
          npcName: npcInfo.name,
          npcAvatar: npcInfo.avatar,
          mood: fallback.mood,
        });
      }
    }, 600);
  }, [getNpcInfo, createContext, storage, addMessage, addPlayerMessage]);

  // Record a purchase in the chat
  const recordPurchase = useCallback((
    item: Item,
    shop: Shop,
    price: number
  ) => {
    addMessage({
      type: 'purchase',
      content: `You purchased ${item.name} for ${price}g`,
      itemSlug: item.slug,
      itemName: item.name,
      price,
      npcName: shop.name,
    });

    // NPC reaction
    const npcSlug = shop.proprietor || shop.slug;
    const npcInfo = getNpcInfo(npcSlug);
    if (npcInfo) {
      setTimeout(() => {
        const reactions = [
          'Pleasure doing business!',
          'A fine choice.',
          '*counts the gold*',
          'Come back soon!',
          'This will serve you well.',
        ];
        const reaction = reactions[Math.floor(Math.random() * reactions.length)];
        addMessage({
          type: 'npc_message',
          content: reaction,
          npcSlug,
          npcName: npcInfo.name,
          npcAvatar: npcInfo.avatar,
          mood: 'pleased',
        });
      }, 800);
    }
  }, [getNpcInfo, addMessage]);

  // Record a gift in the chat
  const recordGift = useCallback((
    item: Item,
    recipientSlug: string,
    recipientName: string
  ) => {
    addMessage({
      type: 'gift_sent',
      content: `You gifted ${item.name} to ${recipientName}`,
      itemSlug: item.slug,
      itemName: item.name,
      recipientName,
    });

    // NPC reaction to gift
    const npcInfo = getNpcInfo(recipientSlug);
    if (npcInfo) {
      setTimeout(() => {
        const gratefulReactions = [
          `*${recipientName} looks pleased* "How thoughtful..."`,
          '"I shall treasure this."',
          '*accepts the gift with a nod* "You have my thanks."',
          '"A gift? For me? How... unexpected."',
          '*examines the item carefully* "This is appreciated."',
        ];
        const reaction = gratefulReactions[Math.floor(Math.random() * gratefulReactions.length)];
        addMessage({
          type: 'npc_message',
          content: reaction,
          npcSlug: recipientSlug,
          npcName: npcInfo.name,
          npcAvatar: npcInfo.avatar,
          mood: 'pleased',
        });
      }, 800);
    }
  }, [getNpcInfo, addMessage]);

  // Add system message
  const addSystemMessage = useCallback((content: string) => {
    addMessage({
      type: 'system',
      content,
    });
  }, [addMessage]);

  // Clear chat history
  const clearMessages = useCallback(() => {
    setMessages([]);
    setHasGreeted(new Set());
  }, []);

  // Trigger initial greetings from available NPCs
  const triggerInitialGreetings = useCallback(() => {
    // Pick 2-3 random NPCs to greet
    const available = availableNpcs.filter((n) => n.isAvailable);
    const shuffled = [...available].sort(() => Math.random() - 0.5);
    const greeters = shuffled.slice(0, Math.min(3, shuffled.length));

    greeters.forEach((npc, index) => {
      setTimeout(() => {
        greetFromNpc(npc.slug);
      }, 500 + index * 1000);
    });
  }, [availableNpcs, greetFromNpc]);

  // Ambient NPC-to-NPC chatter phrases
  const ambientChatter = useMemo(() => [
    // General market banter
    { line: 'Business been slow today...', response: 'The market ebbs and flows.' },
    { line: 'Did you hear about the void incursion?', response: 'Best not to speak of it here.' },
    { line: 'Got any new stock?', response: 'Always something interesting coming through.' },
    { line: '*glances around suspiciously*', response: '*nods knowingly*' },
    { line: 'The One has been quiet lately.', response: "That's usually when things get interesting." },
    { line: 'Another day in the market...', response: 'Another gold piece earned.' },
    { line: 'Watch yourself out there.', response: 'Always do.' },
    { line: 'Travelers bring the strangest tales.', response: 'And stranger goods.' },
    { line: 'The domains are restless.', response: "When aren't they?" },
    { line: '*counts inventory*', response: '*adjusts wares*' },
  ], []);

  // Generate ambient NPC chatter between two random NPCs
  const generateAmbientChatter = useCallback(() => {
    const available = availableNpcs.filter((n) => n.isAvailable);
    if (available.length < 2) return;

    // Pick two random different NPCs
    const shuffled = [...available].sort(() => Math.random() - 0.5);
    const npc1 = shuffled[0];
    const npc2 = shuffled[1];

    // Pick random chatter
    const chatter = ambientChatter[Math.floor(Math.random() * ambientChatter.length)];

    // First NPC speaks
    const msg1: MarketChatMessage = {
      id: generateId(),
      type: 'npc_to_npc',
      content: chatter.line,
      timestamp: Date.now(),
      npcSlug: npc1.slug,
      npcName: npc1.name,
      npcAvatar: npc1.avatar,
      targetNpcSlug: npc2.slug,
      targetNpcName: npc2.name,
      mood: 'neutral',
    };
    setMessages((prev) => [...prev, msg1]);

    // Second NPC responds after delay
    setTimeout(() => {
      const msg2: MarketChatMessage = {
        id: generateId(),
        type: 'npc_to_npc',
        content: chatter.response,
        timestamp: Date.now(),
        npcSlug: npc2.slug,
        npcName: npc2.name,
        npcAvatar: npc2.avatar,
        targetNpcSlug: npc1.slug,
        targetNpcName: npc1.name,
        mood: 'neutral',
      };
      setMessages((prev) => [...prev, msg2]);
    }, 1500 + Math.random() * 1000);
  }, [availableNpcs, ambientChatter, generateId]);

  // Start ambient chatter loop
  const startAmbientChatter = useCallback(() => {
    // Generate chatter every 15-30 seconds
    const scheduleNext = () => {
      const delay = 15000 + Math.random() * 15000;
      return setTimeout(() => {
        generateAmbientChatter();
        scheduleNext();
      }, delay);
    };

    // Start after initial delay
    const initialDelay = setTimeout(() => {
      generateAmbientChatter();
      scheduleNext();
    }, 5000);

    return () => clearTimeout(initialDelay);
  }, [generateAmbientChatter]);

  return {
    messages,
    availableNpcs,
    addMessage,
    sendPlayerMessage,
    recordPurchase,
    recordGift,
    addSystemMessage,
    clearMessages,
    greetFromNpc,
    triggerInitialGreetings,
    getNpcInfo,
    generateAmbientChatter,
    startAmbientChatter,
  };
}
