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
  sessionId?: string; // For deduplication across requests
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

// ============================================
// Session Deduplication Cache
// ============================================
// Prevents same dialogue back-to-back per NPC per session
// Key: `${sessionId}:${npcSlug}` -> Set of recently used entry IDs
const recentEntriesCache = new Map<string, Set<string>>();
const MAX_RECENT_ENTRIES = 5; // Remember last 5 entries per NPC per session
const SESSION_CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

// Track when sessions were last active for cleanup
const sessionLastSeen = new Map<string, number>();

// Cleanup old sessions periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, lastSeen] of sessionLastSeen.entries()) {
    if (now - lastSeen > SESSION_CACHE_TTL_MS) {
      recentEntriesCache.delete(key);
      sessionLastSeen.delete(key);
    }
  }
}, 5 * 60 * 1000); // Clean up every 5 minutes

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
   * Check if text appears truncated (incomplete sentence)
   */
  private isTruncated(text: string): boolean {
    if (!text || text.length < 10) return true;

    const trimmed = text.trim();
    // Valid endings: . ! ? " ' * ) ] (for actions and quotes)
    const validEndings = /[.!?"\'\*\)\]]$/;
    if (validEndings.test(trimmed)) return false;

    // Common truncation patterns (ends with article, conjunction, preposition, comma)
    const truncatedEndings = /\b(the|a|an|to|of|in|for|and|but|or|with|as|at|by|from|my|his|her|its|our|their|this|that|these|those|shall|will|can|may|must|would|could|should),?\s*$/i;
    if (truncatedEndings.test(trimmed)) return true;

    // Ends with comma, colon, or open quote
    if (/[,:\"]$/.test(trimmed)) return true;

    return false;
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

    // Filter by pool, excluding truncated entries
    let poolEntries = entries.filter(e => e.pool === request.pool && !this.isTruncated(e.text));

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
      // Filter out truncated entries from related pools too
      const found = entries.filter(e => e.pool === relatedPool && !this.isTruncated(e.text));
      if (found.length > 0) {
        return found;
      }
    }

    return [];
  }

  /**
   * Select best entry using weighted random with deduplication
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

    // Session deduplication: filter out recently used entries
    if (request.sessionId) {
      const cacheKey = `${request.sessionId}:${request.npcSlug}`;
      const recentIds = recentEntriesCache.get(cacheKey);

      if (recentIds && recentIds.size > 0) {
        const dedupedCandidates = candidates.filter(e => !recentIds.has(e.id));
        // Only use deduped list if we have alternatives
        if (dedupedCandidates.length > 0) {
          candidates = dedupedCandidates;
        }
        // If all candidates were recently used, just return any to avoid empty response
      }
    }

    // Weighted random selection by interest score
    const totalWeight = candidates.reduce((sum, e) => sum + e.metrics.interestScore, 0);
    let roll = Math.random() * totalWeight;

    let selected: ChatbaseEntry | null = null;
    for (const entry of candidates) {
      roll -= entry.metrics.interestScore;
      if (roll <= 0) {
        selected = entry;
        break;
      }
    }

    // Fallback to random
    if (!selected) {
      selected = candidates[Math.floor(Math.random() * candidates.length)];
    }

    // Track this entry as recently used
    if (request.sessionId && selected) {
      this.trackRecentEntry(request.sessionId, request.npcSlug, selected.id);
    }

    return selected;
  }

  /**
   * Track an entry as recently used for deduplication
   */
  private trackRecentEntry(sessionId: string, npcSlug: string, entryId: string): void {
    const cacheKey = `${sessionId}:${npcSlug}`;

    // Update last seen time
    sessionLastSeen.set(cacheKey, Date.now());

    // Get or create recent entries set
    let recentIds = recentEntriesCache.get(cacheKey);
    if (!recentIds) {
      recentIds = new Set();
      recentEntriesCache.set(cacheKey, recentIds);
    }

    // Add new entry
    recentIds.add(entryId);

    // Trim to max size (remove oldest - Sets maintain insertion order)
    if (recentIds.size > MAX_RECENT_ENTRIES) {
      const iterator = recentIds.values();
      recentIds.delete(iterator.next().value);
    }
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
