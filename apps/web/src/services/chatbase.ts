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

function fallbackResponse(npcSlug: string, pool: TemplatePool): ChatResponse {
  const fallbacks: Record<string, { text: string; mood: MoodType }> = {
    greeting: { text: '...', mood: 'neutral' },
    farewell: { text: 'Until next time.', mood: 'neutral' },
    idle: { text: '*observes silently*', mood: 'neutral' },
    reaction: { text: 'Hmm.', mood: 'curious' },
    threat: { text: 'We shall see.', mood: 'threatening' },
    salesPitch: { text: 'Care to browse?', mood: 'neutral' },
    gamblingTrashTalk: { text: 'The dice decide.', mood: 'neutral' },
    gamblingBrag: { text: 'Victory is mine.', mood: 'pleased' },
    gamblingFrustration: { text: 'Curse these dice!', mood: 'annoyed' },
    lore: { text: 'There are mysteries here.', mood: 'cryptic' },
    hint: { text: 'Be careful.', mood: 'neutral' },
    challenge: { text: 'Prove yourself.', mood: 'neutral' },
  };

  const fallback = fallbacks[pool] || fallbacks.idle;

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
 * Look up dialogue for an NPC (MVP: returns fallbacks only)
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
