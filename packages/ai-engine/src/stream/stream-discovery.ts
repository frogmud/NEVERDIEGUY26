/**
 * Stream Discovery System
 *
 * Find relevant streams based on:
 * - NPC (who's talking)
 * - Topic (what they're discussing)
 * - Mood (emotional tone)
 * - Domain (where)
 * - Relationships (who's interacting with whom)
 *
 * This is the "radio dial" for tuning into the eternal broadcast.
 */

import type { StreamEntry, DomainContext, VoiceProfile } from './types';
import { DOMAIN_CONTEXTS, getDomainContext, getVoiceProfile, VOICE_PROFILES } from './voice-profiles';
import { generateEnhancedDayStream } from './enhanced-stream';
import {
  Channel,
  createChannel,
  todaySeed,
  dateToSeed,
  seedToDayNumber,
  getAllChannelsForSeed,
} from './eternal-calendar';
import { createSeededRng } from '../core/seeded-rng';

// ============================================
// Discovery Query Types
// ============================================

export interface DiscoveryQuery {
  /** Search for specific NPC(s) */
  npcs?: string[];
  /** Search for topics/keywords */
  topics?: string[];
  /** Search for entry types */
  entryTypes?: Array<'idle' | 'relationship' | 'lore' | 'meta'>;
  /** Search for specific domains */
  domains?: string[];
  /** Search for NPC interactions */
  interactions?: Array<{ from: string; to: string }>;
  /** Mood filter */
  mood?: 'tense' | 'lighthearted' | 'contemplative' | 'ambient';
  /** Date range (for date seeds) */
  dateRange?: { start: Date; end: Date };
  /** Limit results */
  limit?: number;
}

export interface DiscoveryResult {
  /** The channel where this was found */
  channel: Channel;
  /** Matching entries */
  entries: StreamEntry[];
  /** Relevance score (0-1) */
  relevance: number;
  /** Why this matched */
  matchReason: string;
}

// ============================================
// Content Indexing (For Fast Search)
// ============================================

export interface StreamIndex {
  /** Channel ID */
  channelId: string;
  /** Seed */
  seed: string;
  /** Domain */
  domain: string;
  /** NPCs present */
  npcs: string[];
  /** Topics detected */
  topics: string[];
  /** Entry type counts */
  typeCounts: Record<string, number>;
  /** Relationship pairs */
  interactions: Array<{ from: string; to: string }>;
  /** Detected mood */
  mood: string;
  /** Sample entry for preview */
  previewEntry: StreamEntry | null;
}

/**
 * Build an index for a stream (for fast searching)
 */
export function indexStream(
  seed: string,
  domainSlug: string,
  entries: StreamEntry[]
): StreamIndex {
  const npcs = new Set<string>();
  const topics = new Set<string>();
  const typeCounts: Record<string, number> = {};
  const interactions: Array<{ from: string; to: string }> = [];

  for (const entry of entries) {
    npcs.add(entry.speakerSlug);
    typeCounts[entry.type] = (typeCounts[entry.type] || 0) + 1;

    if (entry.mentionsNPC) {
      npcs.add(entry.mentionsNPC);
      interactions.push({ from: entry.speakerSlug, to: entry.mentionsNPC });
    }

    // Extract topics from content
    const content = entry.content.toLowerCase();
    if (content.includes('die-rector') || content.includes('director')) topics.add('die-rectors');
    if (content.includes('death') || content.includes('soul')) topics.add('death');
    if (content.includes('trade') || content.includes('gold') || content.includes('deal')) topics.add('trade');
    if (content.includes('exit') || content.includes('escape') || content.includes('door')) topics.add('escape');
    if (content.includes('fire') || content.includes('burn')) topics.add('fire');
    if (content.includes('ice') || content.includes('cold') || content.includes('frost')) topics.add('ice');
    if (content.includes('void') || content.includes('null')) topics.add('void');
    if (content.includes('wind') || content.includes('chaos')) topics.add('chaos');
    if (content.includes('prophecy') || content.includes('foretold')) topics.add('prophecy');
    if (content.includes('secret') || content.includes('hidden')) topics.add('secrets');
    if (content.includes('revolution') || content.includes('fight')) topics.add('revolution');
    if (content.includes('gambl') || content.includes('bet') || content.includes('dice')) topics.add('gambling');
  }

  // Detect mood
  let mood = 'ambient';
  const loreCount = typeCounts['lore'] || 0;
  const metaCount = typeCounts['meta'] || 0;
  const relationshipCount = typeCounts['relationship'] || 0;

  if (loreCount > entries.length * 0.3) mood = 'contemplative';
  else if (metaCount > entries.length * 0.2) mood = 'meta-aware';
  else if (relationshipCount > entries.length * 0.4) mood = 'social';

  return {
    channelId: `${domainSlug}:${seed}`,
    seed,
    domain: domainSlug,
    npcs: [...npcs],
    topics: [...topics],
    typeCounts,
    interactions,
    mood,
    previewEntry: entries[0] || null,
  };
}

// ============================================
// Search Functions
// ============================================

/**
 * Search for streams matching a query
 */
export function searchStreams(
  query: DiscoveryQuery,
  seedsToSearch: string[] = [todaySeed()],
  streamSize: number = 20
): DiscoveryResult[] {
  const results: DiscoveryResult[] = [];
  const domains = query.domains || Object.keys(DOMAIN_CONTEXTS);

  for (const seed of seedsToSearch) {
    for (const domain of domains) {
      const entries = generateEnhancedDayStream(seed, domain, streamSize);
      const index = indexStream(seed, domain, entries);
      const { score, reason } = scoreMatch(query, index, entries);

      if (score > 0) {
        results.push({
          channel: createChannel(seed, domain),
          entries: filterEntries(entries, query),
          relevance: score,
          matchReason: reason,
        });
      }
    }
  }

  // Sort by relevance
  results.sort((a, b) => b.relevance - a.relevance);

  // Apply limit
  if (query.limit) {
    return results.slice(0, query.limit);
  }

  return results;
}

/**
 * Score how well a stream matches a query
 */
function scoreMatch(
  query: DiscoveryQuery,
  index: StreamIndex,
  entries: StreamEntry[]
): { score: number; reason: string } {
  let score = 0;
  const reasons: string[] = [];

  // NPC match
  if (query.npcs) {
    const npcMatches = query.npcs.filter(npc => index.npcs.includes(npc));
    if (npcMatches.length > 0) {
      score += 0.3 * (npcMatches.length / query.npcs.length);
      reasons.push(`Features ${npcMatches.join(', ')}`);
    }
  }

  // Topic match
  if (query.topics) {
    const topicMatches = query.topics.filter(t =>
      index.topics.includes(t) ||
      entries.some(e => e.content.toLowerCase().includes(t.toLowerCase()))
    );
    if (topicMatches.length > 0) {
      score += 0.3 * (topicMatches.length / query.topics.length);
      reasons.push(`Discusses ${topicMatches.join(', ')}`);
    }
  }

  // Entry type match
  if (query.entryTypes) {
    const typeMatches = query.entryTypes.filter(t => (index.typeCounts[t] || 0) > 0);
    if (typeMatches.length > 0) {
      score += 0.2 * (typeMatches.length / query.entryTypes.length);
      reasons.push(`Contains ${typeMatches.join(', ')} entries`);
    }
  }

  // Interaction match
  if (query.interactions) {
    const interactionMatches = query.interactions.filter(q =>
      index.interactions.some(i => i.from === q.from && i.to === q.to)
    );
    if (interactionMatches.length > 0) {
      score += 0.4 * (interactionMatches.length / query.interactions.length);
      reasons.push(`${interactionMatches.map(i => `${i.from} talks to ${i.to}`).join(', ')}`);
    }
  }

  // Mood match
  if (query.mood && index.mood === query.mood) {
    score += 0.1;
    reasons.push(`${query.mood} mood`);
  }

  return {
    score: Math.min(score, 1),
    reason: reasons.join('; ') || 'General match',
  };
}

/**
 * Filter entries to only those matching the query
 */
function filterEntries(entries: StreamEntry[], query: DiscoveryQuery): StreamEntry[] {
  return entries.filter(entry => {
    // NPC filter
    if (query.npcs) {
      const matches = query.npcs.includes(entry.speakerSlug) ||
        (entry.mentionsNPC && query.npcs.includes(entry.mentionsNPC));
      if (!matches) return false;
    }

    // Topic filter
    if (query.topics) {
      const content = entry.content.toLowerCase();
      const matches = query.topics.some(t => content.includes(t.toLowerCase()));
      if (!matches) return false;
    }

    // Entry type filter
    if (query.entryTypes && !query.entryTypes.includes(entry.type)) {
      return false;
    }

    return true;
  });
}

// ============================================
// Quick Search Helpers
// ============================================

/**
 * Find streams featuring a specific NPC
 */
export function findStreamsWithNPC(
  npcSlug: string,
  seedsToSearch: string[] = [todaySeed()],
  limit: number = 5
): DiscoveryResult[] {
  return searchStreams(
    { npcs: [npcSlug], limit },
    seedsToSearch
  );
}

/**
 * Find streams where two NPCs interact
 */
export function findInteractions(
  npc1: string,
  npc2: string,
  seedsToSearch: string[] = [todaySeed()],
  limit: number = 5
): DiscoveryResult[] {
  return searchStreams(
    {
      npcs: [npc1, npc2],
      interactions: [
        { from: npc1, to: npc2 },
        { from: npc2, to: npc1 },
      ],
      limit,
    },
    seedsToSearch
  );
}

/**
 * Find streams about a topic
 */
export function findStreamsByTopic(
  topic: string,
  seedsToSearch: string[] = [todaySeed()],
  limit: number = 5
): DiscoveryResult[] {
  return searchStreams(
    { topics: [topic], limit },
    seedsToSearch
  );
}

/**
 * Find lore-heavy streams
 */
export function findLoreStreams(
  seedsToSearch: string[] = [todaySeed()],
  limit: number = 5
): DiscoveryResult[] {
  return searchStreams(
    { entryTypes: ['lore'], limit },
    seedsToSearch
  );
}

/**
 * Find meta/fourth-wall streams
 */
export function findMetaStreams(
  seedsToSearch: string[] = [todaySeed()],
  limit: number = 5
): DiscoveryResult[] {
  return searchStreams(
    { entryTypes: ['meta'], limit },
    seedsToSearch
  );
}

// ============================================
// Recommendation Engine
// ============================================

export interface Recommendation {
  channel: Channel;
  reason: string;
  confidence: number;
  preview: StreamEntry[];
}

/**
 * Get recommended channels based on user preferences
 */
export function getRecommendations(
  preferences: {
    favoriteNPCs?: string[];
    favoriteTopics?: string[];
    favoriteDomains?: string[];
    recentlyViewed?: string[]; // channel IDs to avoid
  },
  seed: string = todaySeed(),
  count: number = 3
): Recommendation[] {
  const recommendations: Recommendation[] = [];
  const domains = Object.keys(DOMAIN_CONTEXTS);
  const rng = createSeededRng(`recommend:${seed}`);

  // Build a query from preferences
  const query: DiscoveryQuery = {
    npcs: preferences.favoriteNPCs,
    topics: preferences.favoriteTopics,
    domains: preferences.favoriteDomains,
    limit: count * 2, // Get extra for filtering
  };

  // Search recent seeds
  const seeds = [seed];
  for (let i = 1; i <= 3; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    seeds.push(dateToSeed(date));
  }

  const results = searchStreams(query, seeds);

  // Filter out recently viewed
  const filtered = results.filter(r =>
    !preferences.recentlyViewed?.includes(r.channel.id)
  );

  // Convert to recommendations
  for (const result of filtered.slice(0, count)) {
    recommendations.push({
      channel: result.channel,
      reason: result.matchReason,
      confidence: result.relevance,
      preview: result.entries.slice(0, 3),
    });
  }

  // Fill with random if not enough
  while (recommendations.length < count) {
    const randomDomain = rng.randomChoice(domains, `fill-${recommendations.length}`)!;
    const channel = createChannel(seed, randomDomain);

    if (!preferences.recentlyViewed?.includes(channel.id)) {
      const entries = generateEnhancedDayStream(seed, randomDomain, 5);
      recommendations.push({
        channel,
        reason: 'Explore something new',
        confidence: 0.3,
        preview: entries.slice(0, 3),
      });
    }
  }

  return recommendations;
}

// ============================================
// NPC Finder (Where is X today?)
// ============================================

export interface NPCLocation {
  npc: VoiceProfile;
  channels: Array<{
    channel: Channel;
    entryCount: number;
    sampleEntry: StreamEntry | null;
  }>;
}

/**
 * Find where an NPC is broadcasting today
 */
export function findNPC(
  npcSlug: string,
  seed: string = todaySeed()
): NPCLocation | null {
  const npc = getVoiceProfile(npcSlug);
  if (!npc) return null;

  const channels: NPCLocation['channels'] = [];

  for (const domainSlug of Object.keys(DOMAIN_CONTEXTS)) {
    const channel = createChannel(seed, domainSlug);

    if (channel.activeNPCs.includes(npcSlug)) {
      const entries = generateEnhancedDayStream(seed, domainSlug, 10);
      const npcEntries = entries.filter(e =>
        e.speakerSlug === npcSlug || e.mentionsNPC === npcSlug
      );

      if (npcEntries.length > 0) {
        channels.push({
          channel,
          entryCount: npcEntries.length,
          sampleEntry: npcEntries[0],
        });
      }
    }
  }

  // Sort by entry count (most active first)
  channels.sort((a, b) => b.entryCount - a.entryCount);

  return {
    npc,
    channels,
  };
}

/**
 * Find all NPCs and their locations for today
 */
export function getAllNPCLocations(seed: string = todaySeed()): NPCLocation[] {
  return Object.keys(VOICE_PROFILES)
    .map(slug => findNPC(slug, seed))
    .filter((loc): loc is NPCLocation => loc !== null && loc.channels.length > 0);
}
