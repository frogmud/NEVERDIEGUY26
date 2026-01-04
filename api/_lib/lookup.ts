/**
 * Chatbase Lookup Engine for Vercel Functions
 *
 * Lightweight lookup engine for NPC dialogue selection.
 * Uses static JSON data bundled at build time.
 */

import type { TemplatePool, MoodType } from '../../packages/shared/src/types/index.js';
import { getNPCEntries, getRegisteredNPCs, getTotalEntryCount, type ChatbaseEntry } from './chatbase-data.js';

// ============================================
// Types
// ============================================

export interface LookupRequest {
  npcSlug: string;
  pool: TemplatePool;
  contextHash?: string;
  playerContext?: {
    deaths: number;
    streak: number;
    domain: string;
    ante: number;
  };
}

export interface LookupResult {
  text: string;
  mood: MoodType;
  source: 'chatbase' | 'claude_search' | 'fallback';
  entryId?: string;
  confidence: number;
}

type MoodBucket = 'hostile' | 'negative' | 'neutral' | 'positive' | 'generous';

// ============================================
// Lookup Engine
// ============================================

export class ChatbaseLookup {
  private loaded = false;
  private stats = {
    lookups: 0,
    hits: 0,
    misses: 0,
  };

  /**
   * Initialize the lookup engine
   */
  async initialize(): Promise<void> {
    // Data is statically imported, no async loading needed
    this.loaded = true;
  }

  isLoaded(): boolean {
    return this.loaded;
  }

  getStats() {
    return {
      ...this.stats,
      registeredNPCs: getRegisteredNPCs().length,
      totalEntries: getTotalEntryCount(),
    };
  }

  /**
   * Main lookup function
   */
  async lookup(request: LookupRequest): Promise<LookupResult> {
    this.stats.lookups++;

    // Load NPC entries from static data
    const entries = getNPCEntries(request.npcSlug);

    if (entries.length === 0) {
      this.stats.misses++;
      return this.fallbackResponse(request.npcSlug, request.pool);
    }

    // Filter by pool
    let poolEntries = entries.filter(e => e.pool === request.pool);

    // If no exact pool match, try related pools
    if (poolEntries.length === 0) {
      poolEntries = this.findRelatedPoolEntries(entries, request.pool);
    }

    if (poolEntries.length === 0) {
      this.stats.misses++;
      return this.fallbackResponse(request.npcSlug, request.pool);
    }

    // Select best entry based on context
    const selected = this.selectEntry(poolEntries, request);

    this.stats.hits++;
    return {
      text: selected.text,
      mood: selected.mood,
      source: 'chatbase',
      entryId: selected.id,
      confidence: selected.metrics.interestScore / 100,
    };
  }

  /**
   * Find entries from related pools when exact match not found
   */
  private findRelatedPoolEntries(entries: ChatbaseEntry[], pool: TemplatePool): ChatbaseEntry[] {
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
      npcGossip: ['lore', 'reaction'],
      npcConflict: ['threat', 'challenge'],
      npcReaction: ['reaction', 'idle'],
      alliance: ['greeting', 'reaction'],
      betrayal: ['threat', 'npcConflict'],
      rescue: ['reaction', 'alliance'],
    };

    const related = relatedPools[pool] || ['reaction', 'idle'];

    for (const relatedPool of related) {
      const found = entries.filter(e => e.pool === relatedPool);
      if (found.length > 0) {
        return found;
      }
    }

    return [];
  }

  /**
   * Select best entry using weighted random
   */
  private selectEntry(entries: ChatbaseEntry[], request: LookupRequest): ChatbaseEntry {
    // Filter by mood compatibility if we have player context
    let candidates = entries;

    if (request.playerContext) {
      const moodBucket = this.inferMoodBucket(request.playerContext);
      const moodFiltered = entries.filter(e =>
        this.isMoodCompatible(this.quantizeMood(e.mood), moodBucket)
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

    // Fallback to random
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  /**
   * Infer mood bucket from player context
   */
  private inferMoodBucket(ctx: LookupRequest['playerContext']): MoodBucket {
    if (!ctx) return 'neutral';

    // High death count = more hostile NPCs
    if (ctx.deaths > 100) return 'hostile';
    if (ctx.deaths > 50) return 'negative';

    // Win streak = positive
    if (ctx.streak > 5) return 'positive';
    if (ctx.streak > 10) return 'generous';

    // Loss streak = hostile
    if (ctx.streak < -5) return 'hostile';
    if (ctx.streak < -3) return 'negative';

    return 'neutral';
  }

  /**
   * Quantize mood type to bucket
   */
  private quantizeMood(mood: MoodType): MoodBucket {
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

  /**
   * Check mood compatibility for fuzzy matching
   */
  private isMoodCompatible(entryMood: MoodBucket, targetMood: MoodBucket): boolean {
    if (entryMood === targetMood) return true;

    // Neutral is compatible with everything
    if (entryMood === 'neutral' || targetMood === 'neutral') return true;

    // Group compatibility
    const negativeGroup = ['hostile', 'negative'];
    const positiveGroup = ['positive', 'generous'];

    if (negativeGroup.includes(entryMood) && negativeGroup.includes(targetMood)) return true;
    if (positiveGroup.includes(entryMood) && positiveGroup.includes(targetMood)) return true;

    return false;
  }

  /**
   * Generate fallback response when no chatbase entry found
   */
  private fallbackResponse(npcSlug: string, pool: TemplatePool): LookupResult {
    // Generic fallbacks by pool
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
}

// Singleton instance for reuse across requests
let lookupInstance: ChatbaseLookup | null = null;

export async function getLookupEngine(): Promise<ChatbaseLookup> {
  if (!lookupInstance) {
    lookupInstance = new ChatbaseLookup();
    await lookupInstance.initialize();
  }
  return lookupInstance;
}
