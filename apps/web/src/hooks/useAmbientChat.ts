/**
 * Ambient NPC Chat Hook - Fire NPC triggers during gameplay
 *
 * Wires the chatbase lookup system into the game loop for ambient commentary:
 * - Domain enter greetings from Die-rectors
 * - Room clear reactions
 * - Dice roll commentary on special rolls
 * - Victory/defeat commentary
 *
 * NEVER DIE GUY
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import type { TemplatePool } from '@ndg/shared';
import type { NPCTriggerEvent, ChatContext, RateLimitState, DiceRollEventPayload } from '../data/npc-chat/types';
import {
  createRateLimitState,
  evaluateTrigger,
  evaluateDiceRollTrigger,
  resetRoomLimits,
  DEFAULT_DOMAIN_OWNERS,
} from '../data/npc-chat/triggers';
import { lookupDialogue, getRegisteredNPCs } from '../services/chatbase';

// Simple seeded RNG for trigger evaluation
function createTriggerRng(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
  }
  const random = () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };

  return {
    chance: (ns: string, pct: number) => {
      // Mix namespace into seed for variety
      let nsHash = 0;
      for (let i = 0; i < ns.length; i++) {
        nsHash = Math.imul(31, nsHash) + ns.charCodeAt(i) | 0;
      }
      const combined = h ^ nsHash;
      const val = ((combined >>> 0) / 4294967296) * 100;
      return val < pct;
    },
    pick: <T>(ns: string, items: T[]): T | undefined => {
      if (items.length === 0) return undefined;
      let nsHash = 0;
      for (let i = 0; i < ns.length; i++) {
        nsHash = Math.imul(31, nsHash) + ns.charCodeAt(i) | 0;
      }
      const combined = h ^ nsHash;
      const idx = Math.abs(combined) % items.length;
      return items[idx];
    },
  };
}

export interface AmbientMessage {
  id: string;
  npcSlug: string;
  npcName: string;
  text: string;
  mood: string;
  timestamp: number;
  context: ChatContext;
  event: NPCTriggerEvent;
}

export interface UseAmbientChatOptions {
  /** Thread/run seed for deterministic RNG */
  threadId?: string;
  /** Current domain slug (e.g., 'earth', 'infernus') */
  currentDomain: string;
  /** Current room number */
  roomNumber: number;
  /** Whether combat is active */
  inCombat: boolean;
  /** Whether in shop */
  inShop: boolean;
  /** Player stats for response context */
  playerStats?: {
    integrity?: number;
    heat?: number;
    gold?: number;
  };
  /** Callback when message should display */
  onMessage?: (message: AmbientMessage) => void;
}

export interface UseAmbientChatReturn {
  /** Current active message (null if none) */
  currentMessage: AmbientMessage | null;
  /** Recent message history */
  messageHistory: AmbientMessage[];
  /** Fire a specific trigger manually */
  fireTrigger: (event: NPCTriggerEvent, payload?: DiceRollEventPayload) => void;
  /** Fire domain enter trigger */
  onDomainEnter: (domainSlug: string) => void;
  /** Fire room clear trigger */
  onRoomClear: () => void;
  /** Fire dice roll trigger with roll info */
  onDiceRoll: (payload: DiceRollEventPayload) => void;
  /** Fire victory trigger */
  onVictory: () => void;
  /** Fire defeat trigger */
  onDefeat: () => void;
  /** Clear current message */
  clearMessage: () => void;
}

/**
 * Hook for ambient NPC chat during gameplay
 */
export function useAmbientChat({
  threadId,
  currentDomain,
  roomNumber,
  inCombat,
  inShop,
  playerStats = {},
  onMessage,
}: UseAmbientChatOptions): UseAmbientChatReturn {
  const [currentMessage, setCurrentMessage] = useState<AmbientMessage | null>(null);
  const [messageHistory, setMessageHistory] = useState<AmbientMessage[]>([]);
  const rateLimitRef = useRef<RateLimitState>(createRateLimitState());
  const lastRoomRef = useRef<number>(roomNumber);

  // Reset room limits when room changes
  useEffect(() => {
    if (roomNumber !== lastRoomRef.current) {
      rateLimitRef.current = resetRoomLimits(rateLimitRef.current);
      lastRoomRef.current = roomNumber;
    }
  }, [roomNumber]);

  // Create RNG from thread seed
  const rng = createTriggerRng(threadId || `ambient-${Date.now()}`);

  // Determine chat context
  const getContext = useCallback((): ChatContext => {
    if (inCombat) return 'combat';
    if (inShop) return 'hub';
    return 'transition';
  }, [inCombat, inShop]);

  // Map trigger events to chatbase pools
  const triggerToPool = (event: NPCTriggerEvent, payload?: DiceRollEventPayload): TemplatePool => {
    switch (event) {
      case 'domain_enter':
        return 'greeting';
      case 'room_clear':
        return 'reaction';
      case 'dice_rolled':
        if (payload?.rarity === 'triples' || payload?.rarity === 'straight') {
          return 'gamblingBrag';
        }
        return 'gamblingTrashTalk';
      case 'run_end':
        return 'farewell';
      case 'player_death':
        return 'threat';
      default:
        return 'idle';
    }
  };

  // Get registered NPCs for validation
  const registeredNPCs = getRegisteredNPCs();

  // Fire a trigger and get NPC response from chatbase
  const fireTrigger = useCallback((event: NPCTriggerEvent, payload?: DiceRollEventPayload) => {
    const chatContext = getContext();
    let result: { npcSlug: string | null; updatedState: RateLimitState };

    // Use special evaluation for dice rolls
    if (event === 'dice_rolled' && payload) {
      result = evaluateDiceRollTrigger(payload, roomNumber, rng, rateLimitRef.current);
    } else {
      result = evaluateTrigger(
        event,
        roomNumber,
        currentDomain,
        rng,
        rateLimitRef.current,
        chatContext,
        DEFAULT_DOMAIN_OWNERS
      );
    }

    rateLimitRef.current = result.updatedState;

    if (!result.npcSlug) return;

    // Check if NPC is in chatbase
    if (!registeredNPCs.includes(result.npcSlug)) return;

    // Map event to pool and lookup dialogue
    const pool = triggerToPool(event, payload);
    const response = lookupDialogue({
      npcSlug: result.npcSlug,
      pool,
      playerContext: {
        deaths: 0,
        streak: playerStats.heat ?? 0,
        domain: currentDomain,
        ante: roomNumber,
      },
    });

    // Create message
    const message: AmbientMessage = {
      id: `ambient-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      npcSlug: result.npcSlug,
      npcName: result.npcSlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      text: response.text,
      mood: response.mood,
      timestamp: Date.now(),
      context: chatContext,
      event,
    };

    setCurrentMessage(message);
    setMessageHistory(prev => [...prev.slice(-9), message]); // Keep last 10

    onMessage?.(message);

    // Auto-clear after display time based on context
    const displayTime = chatContext === 'combat' ? 3000 : 5000;
    setTimeout(() => {
      setCurrentMessage(prev => prev?.id === message.id ? null : prev);
    }, displayTime);
  }, [currentDomain, roomNumber, rng, getContext, playerStats, onMessage, registeredNPCs]);

  // Convenience methods for specific triggers
  const onDomainEnter = useCallback((domainSlug: string) => {
    fireTrigger('domain_enter');
  }, [fireTrigger]);

  const onRoomClear = useCallback(() => {
    fireTrigger('room_clear');
  }, [fireTrigger]);

  const onDiceRoll = useCallback((payload: DiceRollEventPayload) => {
    fireTrigger('dice_rolled', payload);
  }, [fireTrigger]);

  const onVictory = useCallback(() => {
    fireTrigger('run_end');
  }, [fireTrigger]);

  const onDefeat = useCallback(() => {
    fireTrigger('player_death');
  }, [fireTrigger]);

  const clearMessage = useCallback(() => {
    setCurrentMessage(null);
  }, []);

  return {
    currentMessage,
    messageHistory,
    fireTrigger,
    onDomainEnter,
    onRoomClear,
    onDiceRoll,
    onVictory,
    onDefeat,
    clearMessage,
  };
}

export default useAmbientChat;
