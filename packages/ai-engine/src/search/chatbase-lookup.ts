/**
 * Chatbase Lookup Engine
 *
 * Chess-engine-style instant lookup for pre-computed dialogue responses.
 * Provides O(1) response selection for common conversation contexts,
 * with fallback to MCTS search for novel situations.
 */

import * as fs from 'fs';
import * as path from 'path';

import type { TemplatePool, MoodType, RelationshipStats } from '../core/types';
import type { BehavioralState, NPCBehaviorState } from '../personality/behavioral-patterns';
import type { TopicCategory, ConversationThread } from '../social/conversation-threading';
import type { SimulationSnapshot, NPCObjectives } from './search-types';

import type {
  ChatbaseEntry,
  ChatbaseContextKey,
  ChatbaseLookupResult,
  ChatbaseLookupConfig,
  ChatbaseManifest,
  ChatbaseNPCFile,
  MoodBucket,
  RelationshipBucket,
  TrustBucket,
  FamiliarityBucket,
  TensionBucket,
} from './chatbase-types';

import {
  DEFAULT_CHATBASE_CONFIG,
  computeChatbaseKey,
  quantizeMood,
  quantizeRelationship,
  quantizeTrust,
  quantizeFamiliarity,
  quantizeTopicDepth,
  quantizeTension,
} from './chatbase-types';

import { createSeededRng, type SeededRng } from '../core/seeded-rng';

// ============================================
// Chatbase Lookup Engine
// ============================================

export class ChatbaseLookupEngine {
  private config: ChatbaseLookupConfig;
  private manifest: ChatbaseManifest | null = null;
  private npcEntries: Map<string, ChatbaseEntry[]> = new Map();
  private lookupIndex: Map<string, ChatbaseEntry[]> = new Map();
  private loadedNPCs: Set<string> = new Set();
  private chatbasePath: string;

  // Stats
  private stats = {
    lookups: 0,
    hits: 0,
    fuzzyHits: 0,
    misses: 0,
  };

  constructor(chatbasePath: string, config?: Partial<ChatbaseLookupConfig>) {
    this.chatbasePath = chatbasePath;
    this.config = { ...DEFAULT_CHATBASE_CONFIG, ...config };
  }

  // ============================================
  // Initialization
  // ============================================

  /**
   * Load the chatbase manifest and optionally preload all NPCs
   */
  load(preloadAll: boolean = false): boolean {
    const manifestPath = path.join(this.chatbasePath, 'manifest.json');

    if (!fs.existsSync(manifestPath)) {
      console.warn(`Chatbase manifest not found at ${manifestPath}`);
      return false;
    }

    try {
      const content = fs.readFileSync(manifestPath, 'utf-8');
      this.manifest = JSON.parse(content);

      if (preloadAll) {
        this.preloadAllNPCs();
      }

      return true;
    } catch (err) {
      console.error('Failed to load chatbase manifest:', err);
      return false;
    }
  }

  /**
   * Preload all NPC entries into memory
   */
  private preloadAllNPCs(): void {
    if (!this.manifest) return;

    const npcsDir = path.join(this.chatbasePath, 'npcs');
    const files = fs.readdirSync(npcsDir).filter(f => f.endsWith('.json'));

    for (const file of files) {
      const slug = file.replace('.json', '');
      this.loadNPC(slug);
    }
  }

  /**
   * Lazy-load entries for a specific NPC
   */
  private loadNPC(slug: string): void {
    if (this.loadedNPCs.has(slug)) return;

    const npcPath = path.join(this.chatbasePath, 'npcs', `${slug}.json`);

    if (!fs.existsSync(npcPath)) {
      this.loadedNPCs.add(slug); // Mark as attempted
      return;
    }

    try {
      const content = fs.readFileSync(npcPath, 'utf-8');
      const npcFile: ChatbaseNPCFile = JSON.parse(content);

      this.npcEntries.set(slug, npcFile.entries);
      this.loadedNPCs.add(slug);

      // Index entries for lookup
      for (const entry of npcFile.entries) {
        this.indexEntry(entry);
      }
    } catch (err) {
      console.error(`Failed to load NPC file for ${slug}:`, err);
      this.loadedNPCs.add(slug);
    }
  }

  /**
   * Add entry to lookup index
   */
  private indexEntry(entry: ChatbaseEntry): void {
    // Create multiple index keys with varying specificity for fuzzy matching
    const keys = this.generateIndexKeys(entry);

    for (const key of keys) {
      if (!this.lookupIndex.has(key)) {
        this.lookupIndex.set(key, []);
      }
      this.lookupIndex.get(key)!.push(entry);
    }
  }

  /**
   * Generate index keys at different specificity levels
   */
  private generateIndexKeys(entry: ChatbaseEntry): string[] {
    const keys: string[] = [];

    // Most specific: speaker|pool|mood
    keys.push(`${entry.speaker.slug}|${entry.pool}|${quantizeMood(entry.mood)}`);

    // Medium: speaker|pool
    keys.push(`${entry.speaker.slug}|${entry.pool}`);

    // Least specific: speaker only
    keys.push(`${entry.speaker.slug}`);

    return keys;
  }

  // ============================================
  // Lookup Interface
  // ============================================

  /**
   * Main lookup function - find the best response for a context
   */
  lookup(
    snapshot: SimulationSnapshot,
    npcSlug: string,
    pool: TemplatePool,
    _objectives?: NPCObjectives
  ): ChatbaseLookupResult {
    this.stats.lookups++;

    // Ensure NPC is loaded
    this.loadNPC(npcSlug);

    // Extract context key
    const contextKey = this.extractContextKey(snapshot, npcSlug, pool);
    const key = computeChatbaseKey(contextKey);

    // Try exact match
    let entries = this.lookupIndex.get(`${npcSlug}|${pool}|${contextKey.moodBucket}`);
    if (entries && entries.length > 0) {
      this.stats.hits++;
      return this.selectFromEntries(entries, snapshot.seed, key, false);
    }

    // Try fuzzy match (relax mood constraint)
    entries = this.lookupIndex.get(`${npcSlug}|${pool}`);
    if (entries && entries.length > 0) {
      // Filter by compatible moods
      const compatible = entries.filter(e =>
        this.isMoodCompatible(quantizeMood(e.mood), contextKey.moodBucket)
      );
      if (compatible.length > 0) {
        this.stats.fuzzyHits++;
        return this.selectFromEntries(compatible, snapshot.seed, key, true);
      }
    }

    // Try any entry for this NPC and pool
    entries = this.lookupIndex.get(`${npcSlug}|${pool}`);
    if (entries && entries.length > 0) {
      this.stats.fuzzyHits++;
      return this.selectFromEntries(entries, snapshot.seed, key, true);
    }

    // No match found
    this.stats.misses++;
    return {
      source: 'none',
      entry: null,
      confidence: 0,
      key,
    };
  }

  /**
   * Extract context key from simulation snapshot
   */
  private extractContextKey(
    snapshot: SimulationSnapshot,
    npcSlug: string,
    pool: TemplatePool
  ): ChatbaseContextKey {
    // Get NPC's current mood
    const moodData = snapshot.moods.get(npcSlug);
    const mood = moodData?.current || 'neutral';

    // Get relationship with player (if applicable)
    const playerRel = snapshot.relationships.get(npcSlug)?.get('player');
    const respect = playerRel?.respect || 0;
    const trust = playerRel?.trust || 0;
    const familiarity = playerRel?.familiarity || 0;

    // Get thread info
    const thread = snapshot.thread;
    const activeTopic = thread.topics.find(t => t.id === thread.activeTopic);
    const topicCategory: TopicCategory | 'none' = activeTopic?.category || 'none';
    const topicDepth = activeTopic?.depth || 0;
    const tension = (thread as any).tension || 0;

    // Get behavioral state
    const behaviorState = snapshot.behaviorStates.get(npcSlug);
    const state: BehavioralState = behaviorState?.current || 'idle';

    return {
      npcSlug,
      moodBucket: quantizeMood(mood),
      respectBucket: quantizeRelationship(respect),
      trustBucket: quantizeTrust(trust),
      familiarityBucket: quantizeFamiliarity(familiarity),
      topicCategory,
      topicDepth: quantizeTopicDepth(topicDepth),
      threadTensionBucket: quantizeTension(tension),
      behavioralState: state,
      pool,
    };
  }

  /**
   * Select from matching entries with weighted random
   */
  private selectFromEntries(
    entries: ChatbaseEntry[],
    seed: string,
    key: string,
    fuzzyMatch: boolean
  ): ChatbaseLookupResult {
    const rng = createSeededRng(`chatbase-${seed}-${key}`);

    if (this.config.useAlternatives && entries.length > 1) {
      // Weighted selection by interest score
      const totalWeight = entries.reduce((sum, e) => sum + e.metrics.interestScore, 0);
      let roll = rng() * totalWeight;

      for (const entry of entries) {
        roll -= entry.metrics.interestScore;
        if (roll <= 0) {
          return {
            source: 'chatbase',
            entry,
            confidence: entry.metrics.interestScore / 100,
            key,
            fuzzyMatch,
            alternatives: entries.filter(e => e.id !== entry.id).slice(0, 3),
          };
        }
      }
    }

    // Single selection or fallthrough
    const entry = entries[Math.floor(rng() * entries.length)];
    return {
      source: 'chatbase',
      entry,
      confidence: entry.metrics.interestScore / 100,
      key,
      fuzzyMatch,
      alternatives: entries.length > 1 ? entries.filter(e => e.id !== entry.id).slice(0, 3) : undefined,
    };
  }

  /**
   * Check if two mood buckets are compatible for fuzzy matching
   */
  private isMoodCompatible(entryMood: MoodBucket, targetMood: MoodBucket): boolean {
    // Same mood is always compatible
    if (entryMood === targetMood) return true;

    // Define compatibility groups
    const compatibilityGroups: MoodBucket[][] = [
      ['hostile', 'negative'],     // Negative moods compatible
      ['positive', 'generous'],    // Positive moods compatible
      ['neutral'],                 // Neutral only with itself
    ];

    for (const group of compatibilityGroups) {
      if (group.includes(entryMood) && group.includes(targetMood)) {
        return true;
      }
    }

    // Neutral is partially compatible with everything
    if (entryMood === 'neutral' || targetMood === 'neutral') {
      return true;
    }

    return false;
  }

  // ============================================
  // Dynamic Entry Management
  // ============================================

  /**
   * Add a new entry to the chatbase (for learning from MCTS)
   */
  addEntry(entry: ChatbaseEntry): void {
    const slug = entry.speaker.slug;

    if (!this.npcEntries.has(slug)) {
      this.npcEntries.set(slug, []);
    }

    this.npcEntries.get(slug)!.push(entry);
    this.indexEntry(entry);

    // Update hit count
    if (entry.metrics.hitCount === undefined) {
      entry.metrics.hitCount = 0;
    }
  }

  /**
   * Record a hit on an entry (for tracking usage)
   */
  recordHit(entryId: string): void {
    for (const entries of this.npcEntries.values()) {
      const entry = entries.find(e => e.id === entryId);
      if (entry) {
        entry.metrics.hitCount = (entry.metrics.hitCount || 0) + 1;
        entry.metrics.lastHit = Date.now();
        break;
      }
    }
  }

  /**
   * Mark an entry as canonical (high quality, hand-reviewed)
   */
  markCanonical(entryId: string, isCanonical: boolean = true): void {
    for (const entries of this.npcEntries.values()) {
      const entry = entries.find(e => e.id === entryId);
      if (entry) {
        entry.metrics.isCanonical = isCanonical;
        break;
      }
    }
  }

  /**
   * Prune low-quality entries based on hit count
   */
  prune(): number {
    let pruned = 0;

    for (const [slug, entries] of this.npcEntries) {
      const filtered = entries.filter(e => {
        // Keep canonical entries
        if (e.metrics.isCanonical) return true;

        // Keep entries with enough hits
        if ((e.metrics.hitCount || 0) >= this.config.minHitCountForRetention) return true;

        // Keep high interest score entries
        if (e.metrics.interestScore >= 80) return true;

        pruned++;
        return false;
      });

      this.npcEntries.set(slug, filtered);
    }

    // Rebuild index
    this.lookupIndex.clear();
    for (const entries of this.npcEntries.values()) {
      for (const entry of entries) {
        this.indexEntry(entry);
      }
    }

    return pruned;
  }

  // ============================================
  // Persistence
  // ============================================

  /**
   * Save modified entries back to disk
   */
  save(): void {
    if (!this.manifest) return;

    for (const [slug, entries] of this.npcEntries) {
      const npcPath = path.join(this.chatbasePath, 'npcs', `${slug}.json`);

      // Load existing file to get NPC metadata
      let npcFile: ChatbaseNPCFile;
      if (fs.existsSync(npcPath)) {
        const content = fs.readFileSync(npcPath, 'utf-8');
        npcFile = JSON.parse(content);
        npcFile.entries = entries;
        npcFile.entryCount = entries.length;
      } else {
        // Create new file
        const firstEntry = entries[0];
        npcFile = {
          npc: {
            slug,
            name: firstEntry?.speaker.name || slug,
            category: firstEntry?.speaker.category || 'wanderers',
          },
          entryCount: entries.length,
          pools: {},
          moods: {},
          entries,
        };
      }

      // Recompute pool/mood counts
      npcFile.pools = {};
      npcFile.moods = {};
      for (const entry of entries) {
        npcFile.pools[entry.pool] = (npcFile.pools[entry.pool] || 0) + 1;
        npcFile.moods[entry.mood] = (npcFile.moods[entry.mood] || 0) + 1;
      }

      fs.writeFileSync(npcPath, JSON.stringify(npcFile, null, 2));
    }

    // Update manifest
    this.manifest.lastUpdated = new Date().toISOString();
    fs.writeFileSync(
      path.join(this.chatbasePath, 'manifest.json'),
      JSON.stringify(this.manifest, null, 2)
    );
  }

  // ============================================
  // Stats & Debugging
  // ============================================

  /**
   * Get lookup statistics
   */
  getStats(): {
    lookups: number;
    hits: number;
    fuzzyHits: number;
    misses: number;
    hitRate: number;
    loadedNPCs: number;
    totalEntries: number;
  } {
    let totalEntries = 0;
    for (const entries of this.npcEntries.values()) {
      totalEntries += entries.length;
    }

    const totalHits = this.stats.hits + this.stats.fuzzyHits;

    return {
      ...this.stats,
      hitRate: this.stats.lookups > 0 ? totalHits / this.stats.lookups : 0,
      loadedNPCs: this.loadedNPCs.size,
      totalEntries,
    };
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats = {
      lookups: 0,
      hits: 0,
      fuzzyHits: 0,
      misses: 0,
    };
  }

  /**
   * Check if chatbase is loaded and enabled
   */
  isEnabled(): boolean {
    return this.config.enabled && this.manifest !== null;
  }

  /**
   * Get sample entries for a specific NPC (for light review)
   */
  getSampleEntries(npcSlug: string, count: number = 10): ChatbaseEntry[] {
    this.loadNPC(npcSlug);
    const entries = this.npcEntries.get(npcSlug) || [];

    // Sample diverse entries (different pools/moods)
    const samples: ChatbaseEntry[] = [];
    const seenPools = new Set<string>();
    const seenMoods = new Set<string>();

    // First pass: one from each pool
    for (const entry of entries) {
      if (!seenPools.has(entry.pool) && samples.length < count) {
        samples.push(entry);
        seenPools.add(entry.pool);
        seenMoods.add(entry.mood);
      }
    }

    // Second pass: one from each mood
    for (const entry of entries) {
      if (!seenMoods.has(entry.mood) && !samples.includes(entry) && samples.length < count) {
        samples.push(entry);
        seenMoods.add(entry.mood);
      }
    }

    // Fill remaining with high interest score entries
    const remaining = entries
      .filter(e => !samples.includes(e))
      .sort((a, b) => b.metrics.interestScore - a.metrics.interestScore);

    while (samples.length < count && remaining.length > 0) {
      samples.push(remaining.shift()!);
    }

    return samples;
  }
}

// ============================================
// Factory Function
// ============================================

/**
 * Create and initialize a chatbase lookup engine
 */
export function createChatbaseLookup(
  chatbasePath: string,
  config?: Partial<ChatbaseLookupConfig>,
  preloadAll: boolean = false
): ChatbaseLookupEngine | null {
  const engine = new ChatbaseLookupEngine(chatbasePath, config);

  if (!engine.load(preloadAll)) {
    return null;
  }

  return engine;
}
