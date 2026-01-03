/**
 * React hook for NPC chat dialogue
 *
 * Provides easy access to chatbase lookups from React components.
 */

import { useState, useCallback } from 'react';
import type { TemplatePool, MoodType } from '@ndg/shared';
import {
  lookupDialogue,
  getRegisteredNPCs,
  getNPCPools,
  getNPCEntryCount,
  type ChatResponse,
} from '../services/chatbase';

export interface UseNPCChatOptions {
  npcSlug: string;
  playerContext?: {
    deaths: number;
    streak: number;
    domain: string;
    ante: number;
  };
}

export interface UseNPCChatResult {
  /** Current dialogue response */
  dialogue: ChatResponse | null;
  /** Get dialogue for a specific pool */
  getDialogue: (pool: TemplatePool) => ChatResponse;
  /** Get a new random dialogue for the same pool */
  refresh: () => void;
  /** Current pool being used */
  currentPool: TemplatePool | null;
  /** Available pools for this NPC */
  availablePools: string[];
  /** Total entries for this NPC */
  entryCount: number;
  /** Whether NPC exists in chatbase */
  isRegistered: boolean;
}

/**
 * Hook for interacting with NPC dialogue
 *
 * @example
 * ```tsx
 * const { dialogue, getDialogue } = useNPCChat({ npcSlug: 'the-general' });
 *
 * useEffect(() => {
 *   getDialogue('greeting');
 * }, []);
 *
 * return <div>{dialogue?.text}</div>;
 * ```
 */
export function useNPCChat(options: UseNPCChatOptions): UseNPCChatResult {
  const { npcSlug, playerContext } = options;

  const [dialogue, setDialogue] = useState<ChatResponse | null>(null);
  const [currentPool, setCurrentPool] = useState<TemplatePool | null>(null);

  const registeredNPCs = getRegisteredNPCs();
  const isRegistered = registeredNPCs.includes(npcSlug);
  const availablePools = isRegistered ? getNPCPools(npcSlug) : [];
  const entryCount = isRegistered ? getNPCEntryCount(npcSlug) : 0;

  const getDialogue = useCallback(
    (pool: TemplatePool): ChatResponse => {
      const response = lookupDialogue({
        npcSlug,
        pool,
        playerContext,
      });
      setDialogue(response);
      setCurrentPool(pool);
      return response;
    },
    [npcSlug, playerContext]
  );

  const refresh = useCallback(() => {
    if (currentPool) {
      getDialogue(currentPool);
    }
  }, [currentPool, getDialogue]);

  return {
    dialogue,
    getDialogue,
    refresh,
    currentPool,
    availablePools,
    entryCount,
    isRegistered,
  };
}

/**
 * Simple one-shot dialogue lookup (no state)
 */
export function useDialogueLookup() {
  return useCallback(
    (
      npcSlug: string,
      pool: TemplatePool,
      playerContext?: UseNPCChatOptions['playerContext']
    ): ChatResponse => {
      return lookupDialogue({ npcSlug, pool, playerContext });
    },
    []
  );
}

export type { ChatResponse, TemplatePool, MoodType };
