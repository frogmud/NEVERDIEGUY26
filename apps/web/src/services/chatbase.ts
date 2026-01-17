/**
 * Client-side Chatbase Lookup Service
 *
 * MVP: Returns fallback responses only.
 * Full chatbase JSON data can be re-added post-MVP.
 */

import { useState, useEffect } from 'react';
import type { MoodType, TemplatePool } from '@ndg/shared';
import type { CombatGameState } from '../data/npc-chat/types';

// ============================================
// Constants
// ============================================

const FETCH_TIMEOUT_MS = 3000; // 3 seconds is generous for dialogue
const MAX_RECENT_FALLBACKS = 5;

// ============================================
// Types
// ============================================

export interface ChatbaseEntry {
  id: string;
  text: string;
  speaker: {
    slug: string;
    name: string;
    category: string;
  };
  pool: string;
  mood: MoodType;
  moodIntensity: number;
  contextTags: string[];
  metrics: {
    interestScore: number;
    source: string;
  };
}

export interface ChatRequest {
  npcSlug: string;
  pool: TemplatePool;
  playerContext?: {
    deaths: number;
    streak: number;
    domain: string;
    ante: number;
  };
  /** Rich game state for template interpolation */
  gameState?: CombatGameState;
  /** Context message being reacted to (e.g., for grunt responses) */
  context?: string;
}

export interface ChatResponse {
  text: string;
  mood: MoodType;
  source: 'chatbase' | 'fallback';
  entryId?: string;
  confidence: number;
}

// ============================================
// Fallback Responses
// ============================================

// Fallback dialogue pools - used when API is unavailable
const FALLBACK_POOLS: Record<string, Array<{ text: string; mood: MoodType }>> = {
  greeting: [
    { text: 'Another soul enters my domain...', mood: 'threatening' },
    { text: 'You dare challenge me here?', mood: 'threatening' },
    { text: 'The dice will decide your fate.', mood: 'cryptic' },
    { text: 'Welcome to your doom, Fixer.', mood: 'threatening' },
    { text: 'I sense... determination. Foolish.', mood: 'curious' },
  ],
  farewell: [
    { text: 'Until next time.', mood: 'neutral' },
    { text: 'Run while you can.', mood: 'threatening' },
    { text: 'We shall meet again...', mood: 'cryptic' },
  ],
  idle: [
    { text: '*observes silently*', mood: 'neutral' },
    { text: 'The sphere watches.', mood: 'cryptic' },
  ],
  reaction: [
    { text: 'Interesting...', mood: 'curious' },
    { text: 'You have my attention.', mood: 'curious' },
    { text: 'Not bad. For a mortal.', mood: 'neutral' },
  ],
  threat: [
    { text: 'The sphere claims another.', mood: 'threatening' },
    { text: 'Your luck has run out.', mood: 'threatening' },
    { text: 'As expected.', mood: 'pleased' },
  ],
  salesPitch: [
    { text: 'Care to browse my wares?', mood: 'neutral' },
    { text: 'I have what you need...', mood: 'curious' },
  ],
  gamblingTrashTalk: [
    { text: 'The dice decide.', mood: 'neutral' },
    { text: 'Fortune favors the bold.', mood: 'curious' },
    { text: 'Roll well, or roll home.', mood: 'neutral' },
    { text: 'Show me what you have.', mood: 'curious' },
  ],
  gamblingBrag: [
    { text: 'Impressive. For a mortal.', mood: 'pleased' },
    { text: 'The dice smile upon you.', mood: 'curious' },
    { text: 'Perhaps you are worthy after all.', mood: 'neutral' },
    { text: 'Well played, Fixer.', mood: 'pleased' },
  ],
  gamblingFrustration: [
    { text: 'Curse these dice!', mood: 'annoyed' },
    { text: 'The sphere mocks me.', mood: 'annoyed' },
  ],
  lore: [
    { text: 'There are mysteries here.', mood: 'cryptic' },
    { text: 'The cosmos holds many secrets.', mood: 'cryptic' },
  ],
  hint: [
    { text: 'Choose wisely.', mood: 'neutral' },
    { text: 'The dice have patterns, if you look.', mood: 'cryptic' },
  ],
  challenge: [
    { text: 'Prove yourself worthy.', mood: 'neutral' },
    { text: 'This is your final chance.', mood: 'threatening' },
    { text: 'One throw remains. Make it count.', mood: 'threatening' },
  ],
};

// Per-NPC fallback overrides - character-appropriate responses
const NPC_FALLBACK_OVERRIDES: Record<string, Partial<typeof FALLBACK_POOLS>> = {
  'stitch-up-girl': {
    greeting: [
      { text: 'Need patching up?', mood: 'neutral' },
      { text: 'You look like you could use some stitches.', mood: 'curious' },
      { text: 'Back again? Your integrity must be rough.', mood: 'neutral' },
    ],
    idle: [
      { text: '*sharpens scissors*', mood: 'neutral' },
      { text: '*checks medical supplies*', mood: 'neutral' },
    ],
    farewell: [
      { text: 'Try not to die out there. Again.', mood: 'neutral' },
      { text: 'Come back if anything falls off.', mood: 'amused' },
    ],
  },
  'mr-bones': {
    greeting: [
      { text: 'Another entry for the ledger...', mood: 'cryptic' },
      { text: 'Your account is... overdue.', mood: 'threatening' },
    ],
    idle: [
      { text: '*rattles thoughtfully*', mood: 'neutral' },
      { text: 'The ledger never lies.', mood: 'cryptic' },
    ],
  },
  'willy': {
    greeting: [
      { text: 'A customer! My favorite kind of person!', mood: 'pleased' },
      { text: 'Hey hey! Looking to buy? Sell? Both?!', mood: 'pleased' },
    ],
    salesPitch: [
      { text: 'Special price! ULTRA special!', mood: 'pleased' },
      { text: 'This item fell through only ONE dimension!', mood: 'curious' },
    ],
    idle: [
      { text: '*rattles merchandise excitedly*', mood: 'neutral' },
    ],
  },
  'boo-g': {
    greeting: [
      { text: 'Yo yo YO! The MC of the afterlife is HERE!', mood: 'pleased' },
      { text: 'What up, fam! Ready to vibe?', mood: 'pleased' },
    ],
    idle: [
      { text: '*floats to an unheard beat*', mood: 'neutral' },
      { text: '*ghostly reverb*', mood: 'neutral' },
    ],
  },
  'the-general': {
    greeting: [
      { text: 'SOLDIER! Report for briefing!', mood: 'neutral' },
      { text: 'At ease. We have tactical matters.', mood: 'neutral' },
    ],
    idle: [
      { text: '*surveys the battlefield*', mood: 'neutral' },
    ],
    farewell: [
      { text: 'Dismissed. Stay sharp out there.', mood: 'neutral' },
    ],
  },
  'dr-maxwell': {
    greeting: [
      { text: 'FASCINATING! A test subject-- I mean, FRIEND!', mood: 'pleased' },
    ],
    idle: [
      { text: '*scribbles notes frantically*', mood: 'curious' },
    ],
    lore: [
      { text: 'The probability matrix is SHIFTING!', mood: 'curious' },
    ],
  },
};

// Track recent fallbacks to avoid repetition
const recentFallbacks: string[] = [];

function fallbackResponse(npcSlug: string, pool: TemplatePool): ChatResponse {
  // Check for NPC-specific overrides first
  const npcOverrides = NPC_FALLBACK_OVERRIDES[npcSlug];
  const poolResponses = npcOverrides?.[pool] || FALLBACK_POOLS[pool] || FALLBACK_POOLS.idle;

  // Filter out recently used responses
  let candidates = poolResponses.filter(r => !recentFallbacks.includes(r.text));
  if (candidates.length === 0) {
    // All responses used recently - reset and use full pool
    candidates = poolResponses;
  }

  // Pick a random response from candidates
  const fallback = candidates[Math.floor(Math.random() * candidates.length)];

  // Track this response
  recentFallbacks.push(fallback.text);
  if (recentFallbacks.length > MAX_RECENT_FALLBACKS) {
    recentFallbacks.shift();
  }

  return {
    text: fallback.text,
    mood: fallback.mood,
    source: 'fallback',
    confidence: 0.1,
  };
}

// ============================================
// Public API
// ============================================

/**
 * Look up dialogue for an NPC
 * Tries /api/chat first, falls back to local on error
 */
export async function lookupDialogueAsync(request: ChatRequest): Promise<ChatResponse> {
  try {
    // Add timeout to prevent hung connections blocking the game
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      // Classify errors: 4xx = bug in code, 5xx = server issue (retry might help)
      if (res.status >= 500) {
        console.warn('[chatbase] Server error (%d), using fallback', res.status);
      } else {
        console.error('[chatbase] Client error (%d) - check request:', res.status, request);
      }
      return fallbackResponse(request.npcSlug, request.pool);
    }

    return res.json();
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      console.warn('[chatbase] Request timeout, using fallback');
    } else {
      console.warn('[chatbase] API unreachable, using fallback:', err);
    }
    return fallbackResponse(request.npcSlug, request.pool);
  }
}

/**
 * React hook for dialogue lookup
 * Returns fallback immediately, updates when API responds
 */
export function useLookupDialogue(request: ChatRequest | null): ChatResponse | null {
  const [response, setResponse] = useState<ChatResponse | null>(() =>
    request ? fallbackResponse(request.npcSlug, request.pool) : null
  );

  useEffect(() => {
    if (!request) {
      setResponse(null);
      return;
    }

    // Set initial fallback
    setResponse(fallbackResponse(request.npcSlug, request.pool));

    // Fire async request and update when it resolves
    lookupDialogueAsync(request).then(setResponse);
  }, [request?.npcSlug, request?.pool]);

  return response;
}

/**
 * Synchronous lookup (uses fallbacks only)
 * @deprecated Use useLookupDialogue hook or lookupDialogueAsync instead
 */
export function lookupDialogue(request: ChatRequest): ChatResponse {
  return fallbackResponse(request.npcSlug, request.pool);
}

/**
 * Get all registered NPC slugs
 * TODO: Implement post-MVP - fetch from /api/chat/stats or bundle at build time
 */
export function getRegisteredNPCs(): string[] {
  return [];
}

/**
 * Get entry count for an NPC
 * TODO: Implement post-MVP - fetch from /api/chat/stats
 */
export function getNPCEntryCount(_slug: string): number {
  return 0;
}

/**
 * Get total entries across all NPCs
 * TODO: Implement post-MVP - fetch from /api/chat/stats
 */
export function getTotalEntryCount(): number {
  return 0;
}

/**
 * Get available pools for an NPC
 * TODO: Implement post-MVP - derive from chatbase data
 */
export function getNPCPools(_slug: string): string[] {
  return [];
}
