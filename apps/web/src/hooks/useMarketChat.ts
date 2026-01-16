/**
 * Market Chat Hook
 *
 * Manages the interactive chat stream in the market.
 * - NPCs greet players when available
 * - Players can send messages to NPCs
 * - Purchases and gifts appear in the stream
 * - Uses the chatbase lookup system for responses
 */

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import type { MoodType, TemplatePool } from '@ndg/shared';
import { lookupDialogue, getRegisteredNPCs } from '../services/chatbase';
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
  const [hasGreeted, setHasGreeted] = useState<Set<string>>(new Set());

  // Refs for timeout cleanup
  const chatterTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingTimeoutsRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

  // Utility for tracked delayed execution (cleans up on unmount)
  const scheduleDelayed = useCallback((fn: () => void, delay: number) => {
    const id = setTimeout(() => {
      pendingTimeoutsRef.current.delete(id);
      fn();
    }, delay);
    pendingTimeoutsRef.current.add(id);
    return id;
  }, []);

  // Cleanup all timeouts on unmount
  useEffect(() => {
    return () => {
      if (chatterTimeoutRef.current) {
        clearTimeout(chatterTimeoutRef.current);
      }
      pendingTimeoutsRef.current.forEach(clearTimeout);
      pendingTimeoutsRef.current.clear();
    };
  }, []);

  // Get list of NPCs registered in chatbase
  const registeredNPCs = useMemo(() => new Set(getRegisteredNPCs()), []);

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

  // Create player context for chatbase lookup
  const createPlayerContext = useCallback(() => {
    // Could integrate with actual game state here
    return {
      deaths: 0,
      streak: 0,
      domain: 'market',
      ante: 1,
    };
  }, []);

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

    // Check if NPC is in the chatbase
    if (!registeredNPCs.has(npcSlug)) {
      // Fallback greeting for NPCs without chatbase entries
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

    // Try salesPitch first (for vendors), then greeting
    const pools: TemplatePool[] = npcInfo.type === 'vendor'
      ? ['salesPitch', 'greeting', 'idle']
      : ['greeting', 'idle'];

    let response = null;
    for (const pool of pools) {
      response = lookupDialogue({
        npcSlug,
        pool,
        playerContext: createPlayerContext(),
      });
      if (response.source === 'chatbase') break;
    }

    addMessage({
      type: 'npc_greeting',
      content: response?.text || `*${npcInfo.name} nods*`,
      npcSlug,
      npcName: npcInfo.name,
      npcAvatar: npcInfo.avatar,
      mood: response?.mood || 'neutral',
    });

    setHasGreeted((prev) => new Set(prev).add(npcSlug));
  }, [hasGreeted, getNpcInfo, registeredNPCs, createPlayerContext, addMessage]);

  // Send a player message and get NPC response
  const sendPlayerMessage = useCallback((content: string, targetNpcSlug: string) => {
    const npcInfo = getNpcInfo(targetNpcSlug);
    if (!npcInfo) return;

    // Add player message (associated with target NPC)
    addPlayerMessage(content, targetNpcSlug);

    // Generate NPC response from chatbase
    const response = lookupDialogue({
      npcSlug: targetNpcSlug,
      pool: 'reaction',
      playerContext: createPlayerContext(),
    });

    // Simulate typing delay (tracked for cleanup)
    scheduleDelayed(() => {
      addMessage({
        type: 'npc_message',
        content: response.text,
        npcSlug: targetNpcSlug,
        npcName: npcInfo.name,
        npcAvatar: npcInfo.avatar,
        mood: response.mood,
      });
    }, 600);
  }, [getNpcInfo, createPlayerContext, addMessage, addPlayerMessage, scheduleDelayed]);

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

    // NPC reaction from chatbase
    const npcSlug = shop.proprietor || shop.slug;
    const npcInfo = getNpcInfo(npcSlug);
    if (npcInfo) {
      scheduleDelayed(() => {
        // Use positive mood context for purchase reactions
        const response = lookupDialogue({
          npcSlug,
          pool: 'reaction',
          playerContext: { deaths: 0, streak: 5, domain: 'market', ante: 1 },
        });
        addMessage({
          type: 'npc_message',
          content: response.text,
          npcSlug,
          npcName: npcInfo.name,
          npcAvatar: npcInfo.avatar,
          mood: response.mood,
        });
      }, 800);
    }
  }, [getNpcInfo, addMessage, scheduleDelayed]);

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

    // NPC reaction from chatbase (grateful context)
    const npcInfo = getNpcInfo(recipientSlug);
    if (npcInfo) {
      scheduleDelayed(() => {
        const response = lookupDialogue({
          npcSlug: recipientSlug,
          pool: 'reaction',
          playerContext: { deaths: 0, streak: 10, domain: 'market', ante: 1 },
        });
        addMessage({
          type: 'npc_message',
          content: response.text,
          npcSlug: recipientSlug,
          npcName: npcInfo.name,
          npcAvatar: npcInfo.avatar,
          mood: response.mood,
        });
      }, 800);
    }
  }, [getNpcInfo, addMessage, scheduleDelayed]);

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

  // Generate ambient NPC chatter between two random NPCs using chatbase
  const generateAmbientChatter = useCallback(() => {
    const available = availableNpcs.filter((n) => n.isAvailable && registeredNPCs.has(n.slug));
    if (available.length < 2) return;

    // Pick two random different NPCs
    const shuffled = [...available].sort(() => Math.random() - 0.5);
    const npc1 = shuffled[0];
    const npc2 = shuffled[1];

    // Get idle/ambient dialogue from chatbase for first NPC
    const response1 = lookupDialogue({
      npcSlug: npc1.slug,
      pool: 'idle',
      playerContext: createPlayerContext(),
    });

    // First NPC speaks
    const msg1: MarketChatMessage = {
      id: generateId(),
      type: 'npc_to_npc',
      content: response1.text,
      timestamp: Date.now(),
      npcSlug: npc1.slug,
      npcName: npc1.name,
      npcAvatar: npc1.avatar,
      targetNpcSlug: npc2.slug,
      targetNpcName: npc2.name,
      mood: response1.mood,
    };
    setMessages((prev) => [...prev, msg1]);

    // Second NPC responds after delay with their own idle dialogue
    setTimeout(() => {
      const response2 = lookupDialogue({
        npcSlug: npc2.slug,
        pool: 'reaction',
        playerContext: createPlayerContext(),
      });

      const msg2: MarketChatMessage = {
        id: generateId(),
        type: 'npc_to_npc',
        content: response2.text,
        timestamp: Date.now(),
        npcSlug: npc2.slug,
        npcName: npc2.name,
        npcAvatar: npc2.avatar,
        targetNpcSlug: npc1.slug,
        targetNpcName: npc1.name,
        mood: response2.mood,
      };
      setMessages((prev) => [...prev, msg2]);
    }, 1500 + Math.random() * 1000);
  }, [availableNpcs, registeredNPCs, createPlayerContext, generateId]);

  // Start ambient chatter loop (with proper cleanup)
  const startAmbientChatter = useCallback(() => {
    // Generate chatter every 15-30 seconds
    const scheduleNext = () => {
      const delay = 15000 + Math.random() * 15000;
      chatterTimeoutRef.current = setTimeout(() => {
        generateAmbientChatter();
        scheduleNext();
      }, delay);
    };

    // Start after initial delay
    chatterTimeoutRef.current = setTimeout(() => {
      generateAmbientChatter();
      scheduleNext();
    }, 5000);

    // Return cleanup that clears the active chatter timeout
    return () => {
      if (chatterTimeoutRef.current) {
        clearTimeout(chatterTimeoutRef.current);
        chatterTimeoutRef.current = null;
      }
    };
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
