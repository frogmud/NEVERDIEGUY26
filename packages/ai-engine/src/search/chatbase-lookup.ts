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
  ChatbaseTriggers,
  MoodBucket,
  RelationshipBucket,
  TrustBucket,
  FamiliarityBucket,
  TensionBucket,
} from './chatbase-types';

import type { PlayerProfile } from '../player/player-profile';
import type { StoryBeat } from '../player/story-beats';
import { getDebtTensionForNPC, type DebtTension } from '../player/debt-tension';
import { hasBeat } from '../player/story-beats';

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
      let roll = rng.random('select') * totalWeight;

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
    const entry = entries[Math.floor(rng.random('pick') * entries.length)];
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

// ============================================
// Player Profile-Aware Selection
// ============================================

/**
 * Check if an entry's triggers match the player profile
 * Returns a match quality score 0-1 (0 = no match, 1 = perfect match)
 */
export function matchesTriggers(
  triggers: ChatbaseTriggers | undefined,
  profile: PlayerProfile,
  npcSlug: string,
  currentRun: number
): { matches: boolean; score: number } {
  if (!triggers) {
    // No triggers = always matches with neutral score
    return { matches: true, score: 0.5 };
  }

  let matchCount = 0;
  let triggerCount = 0;
  let bonusScore = 0;

  // Player archetype check
  if (triggers.playerArchetype) {
    triggerCount++;
    const archetypes = Array.isArray(triggers.playerArchetype)
      ? triggers.playerArchetype
      : [triggers.playerArchetype];
    if (archetypes.includes(profile.archetype)) {
      matchCount++;
      bonusScore += 0.2; // Strong match for archetype
    }
  }

  // Story beat check with decay weighting
  if (triggers.recentStoryBeat) {
    triggerCount++;
    const beats = Array.isArray(triggers.recentStoryBeat)
      ? triggers.recentStoryBeat
      : [triggers.recentStoryBeat];
    const minWeight = triggers.storyBeatMinWeight ?? 0.3;

    for (const beatType of beats) {
      if (hasBeat(profile.storyBeats, beatType, minWeight)) {
        matchCount++;
        // Bonus for highly weighted (recent) beats
        const beat = profile.storyBeats.find(b => b.type === beatType);
        if (beat) {
          bonusScore += 0.15 * beat.weight;
        }
        break;
      }
    }
  }

  // Debt tension check
  if (triggers.debtTension) {
    triggerCount++;
    const tensions = Array.isArray(triggers.debtTension)
      ? triggers.debtTension
      : [triggers.debtTension];
    const currentTension = getDebtTensionForNPC(profile.debtsTo, npcSlug);
    if (tensions.includes(currentTension)) {
      matchCount++;
      // Higher bonus for threatening debt (narrative impact)
      if (currentTension === 'threatening') bonusScore += 0.25;
      else if (currentTension === 'notable') bonusScore += 0.15;
      else if (currentTension === 'minor') bonusScore += 0.05;
    }
  }

  // Player owes me check
  if (triggers.playerOwesMe) {
    triggerCount++;
    const debt = profile.debtsTo[npcSlug] || 0;
    const { min, max } = triggers.playerOwesMe;
    const meetsMin = min === undefined || debt >= min;
    const meetsMax = max === undefined || debt <= max;
    if (meetsMin && meetsMax) {
      matchCount++;
    }
  }

  // Rescue history check
  if (triggers.iRescuedPlayer) {
    triggerCount++;
    const rescueCount = profile.rescuedBy[npcSlug] || 0;
    const minCount = triggers.iRescuedPlayer.minCount ?? 1;
    if (rescueCount >= minCount) {
      matchCount++;
      bonusScore += 0.1; // Narrative callback
    }
  }

  // Recently rescued check
  if (triggers.iRescuedPlayerRecently !== undefined) {
    triggerCount++;
    // Check if rescued in recent runs (would need lastRescueRun tracking)
    const wasRescued = (profile.rescuedBy[npcSlug] || 0) > 0;
    if (triggers.iRescuedPlayerRecently === wasRescued) {
      matchCount++;
    }
  }

  // Streak check
  if (triggers.streak) {
    triggerCount++;
    const { type, min } = triggers.streak;
    const streakValue = type === 'win' ? profile.winStreak : profile.lossStreak;
    if (streakValue >= min) {
      matchCount++;
    }
  }

  // Player debt (legacy, simplified)
  if (triggers.playerDebt !== undefined) {
    triggerCount++;
    const hasDebt = Object.values(profile.debtsTo).some(d => d > 0);
    if (triggers.playerDebt === hasDebt) {
      matchCount++;
    }
  }

  // If no triggers specified, neutral match
  if (triggerCount === 0) {
    return { matches: true, score: 0.5 };
  }

  // Calculate base score from trigger matches
  const baseScore = matchCount / triggerCount;

  // Must match at least 50% of triggers
  const matches = baseScore >= 0.5;

  // Final score with bonuses (capped at 1.0)
  const score = Math.min(1.0, baseScore + bonusScore);

  return { matches, score };
}

/**
 * Score an entry's relevance to the current context and player profile
 */
export function scoreRelevance(
  entry: ChatbaseEntry,
  profile: PlayerProfile,
  npcSlug: string,
  currentRun: number,
  contextTags?: string[]
): number {
  let score = 0;

  // Base score from interest metrics (0-0.3)
  score += (entry.metrics.interestScore / 100) * 0.3;

  // Trigger match score (0-0.4)
  const triggerResult = matchesTriggers(entry.triggers, profile, npcSlug, currentRun);
  if (!triggerResult.matches) {
    return 0; // Hard filter: doesn't match required triggers
  }
  score += triggerResult.score * 0.4;

  // Context tag overlap (0-0.2)
  if (contextTags && entry.contextTags.length > 0) {
    const overlap = entry.contextTags.filter(t => contextTags.includes(t)).length;
    const tagScore = overlap / Math.max(entry.contextTags.length, contextTags.length);
    score += tagScore * 0.2;
  }

  // Canonical bonus (0.1)
  if (entry.metrics.isCanonical) {
    score += 0.1;
  }

  return Math.min(1.0, score);
}

/**
 * Select the best response from entries using player profile context
 */
export function selectResponse(
  entries: ChatbaseEntry[],
  profile: PlayerProfile,
  npcSlug: string,
  currentRun: number,
  seed: string,
  contextTags?: string[]
): ChatbaseLookupResult {
  if (entries.length === 0) {
    return { source: 'none', entry: null, confidence: 0 };
  }

  // Score all entries
  const scored = entries
    .map(entry => ({
      entry,
      score: scoreRelevance(entry, profile, npcSlug, currentRun, contextTags),
    }))
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) {
    return { source: 'none', entry: null, confidence: 0 };
  }

  // Top candidates (within 20% of best score)
  const bestScore = scored[0].score;
  const candidates = scored.filter(s => s.score >= bestScore * 0.8);

  // Weighted random selection from candidates
  const rng = createSeededRng(`select-${seed}-${npcSlug}`);
  const totalWeight = candidates.reduce((sum, c) => sum + c.score, 0);
  let roll = rng.random('pick') * totalWeight;

  for (const candidate of candidates) {
    roll -= candidate.score;
    if (roll <= 0) {
      return {
        source: 'chatbase',
        entry: candidate.entry,
        confidence: candidate.score,
        alternatives: candidates
          .filter(c => c.entry.id !== candidate.entry.id)
          .slice(0, 3)
          .map(c => c.entry),
      };
    }
  }

  // Fallback to top scored
  return {
    source: 'chatbase',
    entry: scored[0].entry,
    confidence: scored[0].score,
    alternatives: scored.slice(1, 4).map(s => s.entry),
  };
}

/**
 * Substitute variables in dialogue text
 * Variables: {{playerName}}, {{debtAmount}}, {{itemName}}, {{domain}}, etc.
 */
export function substituteVariables(
  text: string,
  profile: PlayerProfile,
  npcSlug: string,
  context: Record<string, unknown> = {}
): string {
  let result = text;

  // Player name
  result = result.replace(/\{\{playerName\}\}/g, profile.playerName || 'traveler');

  // Debt amount to this NPC
  const debt = profile.debtsTo[npcSlug] || 0;
  result = result.replace(/\{\{debtAmount\}\}/g, debt.toString());

  // Total debt
  const totalDebt = Object.values(profile.debtsTo).reduce((a, b) => a + b, 0);
  result = result.replace(/\{\{totalDebt\}\}/g, totalDebt.toString());

  // Run stats
  result = result.replace(/\{\{runCount\}\}/g, profile.totalRuns.toString());
  result = result.replace(/\{\{totalDeaths\}\}/g, profile.totalDeaths.toString());
  result = result.replace(/\{\{winStreak\}\}/g, profile.winStreak.toString());
  result = result.replace(/\{\{lossStreak\}\}/g, profile.lossStreak.toString());
  result = result.replace(/\{\{highestDomain\}\}/g, profile.highestDomain.toString());

  // Rescue count
  const rescueCount = profile.rescuedBy[npcSlug] || 0;
  result = result.replace(/\{\{rescueCount\}\}/g, rescueCount.toString());

  // Context-specific variables
  for (const [key, value] of Object.entries(context)) {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    result = result.replace(regex, String(value));
  }

  return result;
}

/**
 * Full lookup pipeline with player profile integration
 */
export function lookupDialogue(
  engine: ChatbaseLookupEngine,
  npcSlug: string,
  pool: string,
  profile: PlayerProfile,
  currentRun: number,
  seed: string,
  contextTags?: string[]
): { text: string; entry: ChatbaseEntry | null; confidence: number } {
  // Get all entries for this NPC and pool
  const entries = engine.getSampleEntries(npcSlug, 100)
    .filter(e => e.pool === pool);

  // Select best response
  const result = selectResponse(entries, profile, npcSlug, currentRun, seed, contextTags);

  if (!result.entry) {
    return { text: '', entry: null, confidence: 0 };
  }

  // Substitute variables
  const text = substituteVariables(result.entry.text, profile, npcSlug);

  // Record hit
  engine.recordHit(result.entry.id);

  return { text, entry: result.entry, confidence: result.confidence };
}
