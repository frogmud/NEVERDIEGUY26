/**
 * Client-side Chatbase Lookup Service
 *
 * MVP: Returns fallback responses only.
 * Full chatbase JSON data can be re-added post-MVP.
 */

import type { MoodType, TemplatePool } from '@ndg/shared';
import type { CombatGameState } from '../data/npc-chat/types';

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

function fallbackResponse(npcSlug: string, pool: TemplatePool): ChatResponse {
  const poolResponses = FALLBACK_POOLS[pool] || FALLBACK_POOLS.idle;

  // Pick a random response from the pool
  const fallback = poolResponses[Math.floor(Math.random() * poolResponses.length)];

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
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!res.ok) {
      console.warn('[chatbase] API error, using fallback');
      return fallbackResponse(request.npcSlug, request.pool);
    }
    return res.json();
  } catch (err) {
    console.warn('[chatbase] API unreachable, using fallback:', err);
    return fallbackResponse(request.npcSlug, request.pool);
  }
}

/**
 * Synchronous lookup (uses fallbacks only - for hooks that can't await)
 * Call lookupDialogueAsync when possible for API responses
 */
export function lookupDialogue(request: ChatRequest): ChatResponse {
  return fallbackResponse(request.npcSlug, request.pool);
}

/**
 * Get all registered NPC slugs (MVP: empty)
 */
export function getRegisteredNPCs(): string[] {
  return [];
}

/**
 * Get entry count for an NPC (MVP: 0)
 */
export function getNPCEntryCount(_slug: string): number {
  return 0;
}

/**
 * Get total entries across all NPCs (MVP: 0)
 */
export function getTotalEntryCount(): number {
  return 0;
}

/**
 * Get available pools for an NPC (MVP: empty)
 */
export function getNPCPools(_slug: string): string[] {
  return [];
}
