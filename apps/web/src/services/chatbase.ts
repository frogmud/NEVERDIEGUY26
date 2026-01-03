/**
 * Client-side Chatbase Lookup Service
 *
 * Bundles NPC dialogue data at build time for instant in-browser lookups.
 * No server required - all lookups happen client-side.
 */

import type { MoodType, TemplatePool } from '@ndg/shared';

// Import all NPC chatbase files (bundled at build time)
import theOne from '@ndg/ai-engine/chatbase/npcs/the-one.json';
import stitchUpGirl from '@ndg/ai-engine/chatbase/npcs/stitch-up-girl.json';
import theGeneral from '@ndg/ai-engine/chatbase/npcs/the-general.json';
import xtreme from '@ndg/ai-engine/chatbase/npcs/xtreme.json';
import mrKevin from '@ndg/ai-engine/chatbase/npcs/mr-kevin.json';
import bodyCount from '@ndg/ai-engine/chatbase/npcs/body-count.json';
import clausen from '@ndg/ai-engine/chatbase/npcs/clausen.json';
import drVoss from '@ndg/ai-engine/chatbase/npcs/dr-voss.json';
import drMaxwell from '@ndg/ai-engine/chatbase/npcs/dr-maxwell.json';
import booG from '@ndg/ai-engine/chatbase/npcs/boo-g.json';
import kingJames from '@ndg/ai-engine/chatbase/npcs/king-james.json';
import boots from '@ndg/ai-engine/chatbase/npcs/boots.json';
import john from '@ndg/ai-engine/chatbase/npcs/john.json';
import keithMan from '@ndg/ai-engine/chatbase/npcs/keith-man.json';
import willy from '@ndg/ai-engine/chatbase/npcs/willy.json';
import peter from '@ndg/ai-engine/chatbase/npcs/peter.json';
import mrBones from '@ndg/ai-engine/chatbase/npcs/mr-bones.json';
import willyOneEye from '@ndg/ai-engine/chatbase/npcs/willy-one-eye.json';

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

interface ChatbaseFile {
  npc: {
    slug: string;
    name: string;
    category: string;
  };
  entries: ChatbaseEntry[];
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
}

export interface ChatResponse {
  text: string;
  mood: MoodType;
  source: 'chatbase' | 'fallback';
  entryId?: string;
  confidence: number;
}

type MoodBucket = 'hostile' | 'negative' | 'neutral' | 'positive' | 'generous';

// ============================================
// Registry
// ============================================

const chatbaseRegistry: Map<string, ChatbaseEntry[]> = new Map();

function registerNPC(data: ChatbaseFile) {
  if (data?.npc?.slug && Array.isArray(data.entries)) {
    chatbaseRegistry.set(data.npc.slug, data.entries);
  }
}

// Register all NPCs at module load
registerNPC(theOne as ChatbaseFile);
registerNPC(stitchUpGirl as ChatbaseFile);
registerNPC(theGeneral as ChatbaseFile);
registerNPC(xtreme as ChatbaseFile);
registerNPC(mrKevin as ChatbaseFile);
registerNPC(bodyCount as ChatbaseFile);
registerNPC(clausen as ChatbaseFile);
registerNPC(drVoss as ChatbaseFile);
registerNPC(drMaxwell as ChatbaseFile);
registerNPC(booG as ChatbaseFile);
registerNPC(kingJames as ChatbaseFile);
registerNPC(boots as ChatbaseFile);
registerNPC(john as ChatbaseFile);
registerNPC(keithMan as ChatbaseFile);
registerNPC(willy as ChatbaseFile);
registerNPC(peter as ChatbaseFile);
registerNPC(mrBones as ChatbaseFile);
registerNPC(willyOneEye as ChatbaseFile);

// ============================================
// Lookup Logic
// ============================================

function quantizeMood(mood: MoodType): MoodBucket {
  switch (mood) {
    case 'threatening':
    case 'angry':
      return 'hostile';
    case 'annoyed':
    case 'fearful':
    case 'scared':
    case 'sad':
      return 'negative';
    case 'neutral':
    case 'curious':
    case 'cryptic':
      return 'neutral';
    case 'pleased':
    case 'amused':
      return 'positive';
    case 'generous':
      return 'generous';
    default:
      return 'neutral';
  }
}

function inferMoodBucket(ctx?: ChatRequest['playerContext']): MoodBucket {
  if (!ctx) return 'neutral';

  // High death count = more hostile NPCs
  if (ctx.deaths > 100) return 'hostile';
  if (ctx.deaths > 50) return 'negative';

  // Win streak = positive
  if (ctx.streak > 10) return 'generous';
  if (ctx.streak > 5) return 'positive';

  // Loss streak = hostile
  if (ctx.streak < -5) return 'hostile';
  if (ctx.streak < -3) return 'negative';

  return 'neutral';
}

function isMoodCompatible(entryMood: MoodBucket, targetMood: MoodBucket): boolean {
  if (entryMood === targetMood) return true;
  if (entryMood === 'neutral' || targetMood === 'neutral') return true;

  const negativeGroup = ['hostile', 'negative'];
  const positiveGroup = ['positive', 'generous'];

  if (negativeGroup.includes(entryMood) && negativeGroup.includes(targetMood)) return true;
  if (positiveGroup.includes(entryMood) && positiveGroup.includes(targetMood)) return true;

  return false;
}

function findRelatedPoolEntries(entries: ChatbaseEntry[], pool: TemplatePool): ChatbaseEntry[] {
  const relatedPools: Record<string, string[]> = {
    greeting: ['idle', 'reaction'],
    farewell: ['idle', 'reaction'],
    idle: ['greeting', 'reaction'],
    salesPitch: ['greeting', 'idle'],
    threat: ['challenge', 'reaction'],
    challenge: ['threat', 'gamblingTrashTalk'],
    gamblingTrashTalk: ['challenge', 'threat'],
    gamblingBrag: ['gamblingTrashTalk', 'reaction'],
    gamblingFrustration: ['threat', 'reaction'],
    hint: ['lore', 'reaction'],
    lore: ['hint', 'reaction'],
    reaction: ['idle', 'greeting'],
  };

  const related = relatedPools[pool] || ['reaction', 'idle'];

  for (const relatedPool of related) {
    const found = entries.filter(e => e.pool === relatedPool);
    if (found.length > 0) return found;
  }

  return [];
}

function selectEntry(entries: ChatbaseEntry[], request: ChatRequest): ChatbaseEntry {
  let candidates = entries;

  if (request.playerContext) {
    const moodBucket = inferMoodBucket(request.playerContext);
    const moodFiltered = entries.filter(e =>
      isMoodCompatible(quantizeMood(e.mood), moodBucket)
    );
    if (moodFiltered.length > 0) {
      candidates = moodFiltered;
    }
  }

  // Weighted random selection by interest score
  const totalWeight = candidates.reduce((sum, e) => sum + e.metrics.interestScore, 0);
  let roll = Math.random() * totalWeight;

  for (const entry of candidates) {
    roll -= entry.metrics.interestScore;
    if (roll <= 0) {
      return entry;
    }
  }

  return candidates[Math.floor(Math.random() * candidates.length)];
}

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
 * Look up dialogue for an NPC
 */
export function lookupDialogue(request: ChatRequest): ChatResponse {
  const entries = chatbaseRegistry.get(request.npcSlug) || [];

  if (entries.length === 0) {
    return fallbackResponse(request.npcSlug, request.pool);
  }

  // Filter by pool
  let poolEntries = entries.filter(e => e.pool === request.pool);

  // Try related pools if no exact match
  if (poolEntries.length === 0) {
    poolEntries = findRelatedPoolEntries(entries, request.pool);
  }

  if (poolEntries.length === 0) {
    return fallbackResponse(request.npcSlug, request.pool);
  }

  const selected = selectEntry(poolEntries, request);

  return {
    text: selected.text,
    mood: selected.mood,
    source: 'chatbase',
    entryId: selected.id,
    confidence: selected.metrics.interestScore / 100,
  };
}

/**
 * Get all registered NPC slugs
 */
export function getRegisteredNPCs(): string[] {
  return Array.from(chatbaseRegistry.keys());
}

/**
 * Get entry count for an NPC
 */
export function getNPCEntryCount(slug: string): number {
  return chatbaseRegistry.get(slug)?.length || 0;
}

/**
 * Get total entries across all NPCs
 */
export function getTotalEntryCount(): number {
  let count = 0;
  for (const entries of chatbaseRegistry.values()) {
    count += entries.length;
  }
  return count;
}

/**
 * Get available pools for an NPC
 */
export function getNPCPools(slug: string): string[] {
  const entries = chatbaseRegistry.get(slug) || [];
  const pools = new Set<string>();
  for (const entry of entries) {
    pools.add(entry.pool);
  }
  return Array.from(pools);
}
