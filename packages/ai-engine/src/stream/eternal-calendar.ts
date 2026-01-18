/**
 * Eternal Calendar System
 *
 * The eternal broadcast exists across infinite "days" (seeds).
 * Users tune into different days to find different conversations.
 *
 * Key concepts:
 * - Seed: The deterministic key (can be date, phrase, number)
 * - Day: Human-readable representation of a seed
 * - Channel: Domain + Seed combination
 * - Frequency: Specific moment in a stream (timestamp)
 */

import { createSeededRng } from '../core/seeded-rng';
import type { StreamEntry, DomainContext } from './types';
import { DOMAIN_CONTEXTS, getDomainContext, getDomainResidents } from './voice-profiles';
import { generateEnhancedDayStream, DEFAULT_ENHANCED_CONFIG } from './enhanced-stream';

// ============================================
// Seed Generation & Parsing
// ============================================

/**
 * Generate a seed from a date
 */
export function dateToSeed(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Generate a seed from today's date
 */
export function todaySeed(): string {
  return dateToSeed(new Date());
}

/**
 * Parse a seed back to a date (if it's a date seed)
 */
export function seedToDate(seed: string): Date | null {
  const match = seed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const [, year, month, day] = match;
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
}

/**
 * Check if a seed is a date-based seed
 */
export function isDateSeed(seed: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(seed);
}

/**
 * Generate a thematic seed from a phrase
 */
export function phraseToSeed(phrase: string): string {
  return phrase.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

/**
 * Convert seed to human-readable day number
 */
export function seedToDayNumber(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash % 99999) + 1;
}

/**
 * Convert seed to display label
 */
export function seedToLabel(seed: string): string {
  if (isDateSeed(seed)) {
    const date = seedToDate(seed);
    if (date) {
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }
  }
  return `Day ${seedToDayNumber(seed)}`;
}

// ============================================
// Channel System
// ============================================

export interface Channel {
  /** Unique channel identifier */
  id: string;
  /** The seed for this channel */
  seed: string;
  /** The domain slug */
  domainSlug: string;
  /** Domain display name */
  domainName: string;
  /** Domain element */
  element: string;
  /** Human-readable day label */
  dayLabel: string;
  /** NPCs broadcasting on this channel */
  activeNPCs: string[];
}

/**
 * Create a channel from seed + domain
 */
export function createChannel(seed: string, domainSlug: string): Channel {
  const domain = getDomainContext(domainSlug);
  if (!domain) {
    return createChannel(seed, 'earth');
  }

  // Determine active NPCs deterministically
  const rng = createSeededRng(`eternal:${seed}:${domainSlug}`);
  const residents = [...domain.residents];
  const shuffled = rng.shuffle(residents, 'active-npcs');
  const count = Math.min(shuffled.length, rng.randomInt(3, 6, 'npc-count'));
  const activeNPCs = shuffled.slice(0, count);

  return {
    id: `${domainSlug}:${seed}`,
    seed,
    domainSlug,
    domainName: domain.name,
    element: domain.element,
    dayLabel: seedToLabel(seed),
    activeNPCs,
  };
}

/**
 * Get all channels for a given seed (one per domain)
 */
export function getAllChannelsForSeed(seed: string): Channel[] {
  return Object.keys(DOMAIN_CONTEXTS).map(slug => createChannel(seed, slug));
}

/**
 * Get all channels for today
 */
export function getTodayChannels(): Channel[] {
  return getAllChannelsForSeed(todaySeed());
}

// ============================================
// Calendar Navigation
// ============================================

export interface CalendarDay {
  seed: string;
  label: string;
  dayNumber: number;
  isToday: boolean;
  channels: Channel[];
}

/**
 * Get calendar days around a seed
 */
export function getCalendarRange(
  centerSeed: string,
  daysBefore: number = 3,
  daysAfter: number = 3
): CalendarDay[] {
  const today = todaySeed();
  const days: CalendarDay[] = [];

  if (isDateSeed(centerSeed)) {
    // Date-based navigation
    const centerDate = seedToDate(centerSeed)!;

    for (let offset = -daysBefore; offset <= daysAfter; offset++) {
      const date = new Date(centerDate);
      date.setDate(date.getDate() + offset);
      const seed = dateToSeed(date);

      days.push({
        seed,
        label: seedToLabel(seed),
        dayNumber: seedToDayNumber(seed),
        isToday: seed === today,
        channels: getAllChannelsForSeed(seed),
      });
    }
  } else {
    // Numeric/hash navigation (generate nearby seeds)
    const baseDayNum = seedToDayNumber(centerSeed);

    for (let offset = -daysBefore; offset <= daysAfter; offset++) {
      const dayNum = baseDayNum + offset;
      const seed = offset === 0 ? centerSeed : `day-${dayNum}`;

      days.push({
        seed,
        label: `Day ${dayNum}`,
        dayNumber: dayNum,
        isToday: seed === today,
        channels: getAllChannelsForSeed(seed),
      });
    }
  }

  return days;
}

/**
 * Get previous/next seeds for navigation
 */
export function getAdjacentSeeds(seed: string): { prev: string; next: string } {
  if (isDateSeed(seed)) {
    const date = seedToDate(seed)!;
    const prev = new Date(date);
    prev.setDate(prev.getDate() - 1);
    const next = new Date(date);
    next.setDate(next.getDate() + 1);
    return {
      prev: dateToSeed(prev),
      next: dateToSeed(next),
    };
  }

  const dayNum = seedToDayNumber(seed);
  return {
    prev: `day-${dayNum - 1}`,
    next: `day-${dayNum + 1}`,
  };
}

// ============================================
// Stream Sampling (For Discovery)
// ============================================

export interface StreamSample {
  channel: Channel;
  /** Sample of entries (first few) */
  entries: StreamEntry[];
  /** Total entries if fully generated */
  totalCount: number;
  /** Dominant mood/theme detected */
  mood: string;
  /** Key topics mentioned */
  topics: string[];
  /** Whether special events are present */
  hasSpecialEvents: boolean;
}

/**
 * Generate a small sample of a stream for preview
 */
export function sampleStream(
  seed: string,
  domainSlug: string,
  sampleSize: number = 5
): StreamSample {
  const channel = createChannel(seed, domainSlug);
  const entries = generateEnhancedDayStream(seed, domainSlug, sampleSize);

  // Analyze sample
  const topics = extractTopics(entries);
  const mood = detectMood(entries);
  const hasSpecialEvents = entries.some(e =>
    e.content.includes('*') || e.content.includes('[')
  );

  return {
    channel,
    entries,
    totalCount: 50, // Typical stream length
    mood,
    topics,
    hasSpecialEvents,
  };
}

/**
 * Extract topics from entries
 */
function extractTopics(entries: StreamEntry[]): string[] {
  const topics = new Set<string>();

  for (const entry of entries) {
    if (entry.type === 'lore') topics.add('lore');
    if (entry.type === 'meta') topics.add('meta');
    if (entry.mentionsNPC) topics.add('relationships');
    if (entry.content.toLowerCase().includes('die-rector')) topics.add('die-rectors');
    if (entry.content.toLowerCase().includes('trade') || entry.content.toLowerCase().includes('gold')) {
      topics.add('trade');
    }
    if (entry.content.toLowerCase().includes('exit') || entry.content.toLowerCase().includes('escape')) {
      topics.add('escape');
    }
  }

  return [...topics];
}

/**
 * Detect dominant mood from entries
 */
function detectMood(entries: StreamEntry[]): string {
  let tension = 0;
  let humor = 0;
  let philosophical = 0;

  for (const entry of entries) {
    const content = entry.content.toLowerCase();

    if (content.includes('!') || content.includes('threat') || content.includes('fight')) {
      tension++;
    }
    if (content.includes('...') || content.includes('hmm') || content.includes('wonder')) {
      philosophical++;
    }
    if (content.includes('ha') || content.includes('lol') || entry.speakerSlug === 'boo-g') {
      humor++;
    }
  }

  if (tension > humor && tension > philosophical) return 'tense';
  if (humor > tension && humor > philosophical) return 'lighthearted';
  if (philosophical > tension && philosophical > humor) return 'contemplative';
  return 'ambient';
}

// ============================================
// Featured/Curated Channels
// ============================================

export interface FeaturedChannel extends Channel {
  /** Why this channel is featured */
  reason: string;
  /** Preview snippet */
  preview: string;
}

/**
 * Get featured channels for discovery
 */
export function getFeaturedChannels(seed: string = todaySeed()): FeaturedChannel[] {
  const rng = createSeededRng(`featured:${seed}`);
  const featured: FeaturedChannel[] = [];

  // Today's hot channel
  const domains = Object.keys(DOMAIN_CONTEXTS);
  const hotDomain = rng.randomChoice(domains, 'hot')!;
  const hotChannel = createChannel(seed, hotDomain);
  const hotSample = sampleStream(seed, hotDomain, 3);

  featured.push({
    ...hotChannel,
    reason: 'Trending Today',
    preview: hotSample.entries[0]?.content || '...',
  });

  // Lore-heavy channel
  const loreDomain = rng.randomChoice(['shadow-keep', 'null-providence', 'frost-reach'], 'lore')!;
  const loreChannel = createChannel(seed, loreDomain);
  const loreSample = sampleStream(seed, loreDomain, 3);

  featured.push({
    ...loreChannel,
    reason: 'Deep Lore',
    preview: loreSample.entries.find(e => e.type === 'lore')?.content || loreSample.entries[0]?.content || '...',
  });

  // Chaotic channel
  const chaosDomain = rng.randomChoice(['aberrant', 'infernus'], 'chaos')!;
  const chaosChannel = createChannel(seed, chaosDomain);
  const chaosSample = sampleStream(seed, chaosDomain, 3);

  featured.push({
    ...chaosChannel,
    reason: 'Reality Unstable',
    preview: chaosSample.entries[0]?.content || '...',
  });

  return featured;
}

// ============================================
// Special Seed Generators
// ============================================

/**
 * Generate themed seeds for special occasions
 */
export const SPECIAL_SEEDS = {
  /** The day the game began (lore-wise) */
  origin: 'day-one',
  /** When the Die-rectors ascended */
  ascension: 'the-ascension',
  /** The prophesied end */
  endTimes: 'end-of-days',
  /** A glitched day */
  glitched: 'error-404',
  /** Maximum chaos */
  chaos: 'entropy-max',
  /** Perfect order */
  order: 'absolute-zero',
} as const;

/**
 * Get a random interesting seed
 */
export function getRandomInterestingSeed(): string {
  const options = [
    todaySeed(),
    ...Object.values(SPECIAL_SEEDS),
    `day-${Math.floor(Math.random() * 10000)}`,
  ];
  return options[Math.floor(Math.random() * options.length)];
}

// ============================================
// Frequency Tuning (Timestamp Navigation)
// ============================================

export interface TuningResult {
  channel: Channel;
  frequency: number; // timestamp
  currentEntry: StreamEntry | null;
  nearbyEntries: StreamEntry[];
}

/**
 * Tune into a specific moment in a stream
 */
export function tuneToFrequency(
  seed: string,
  domainSlug: string,
  targetTimestamp: number,
  windowSize: number = 5
): TuningResult {
  const channel = createChannel(seed, domainSlug);

  // Generate enough entries to reach the timestamp
  // Estimate: average interval is ~25 seconds
  const estimatedCount = Math.ceil((targetTimestamp / 25) + windowSize);
  const entries = generateEnhancedDayStream(seed, domainSlug, estimatedCount);

  // Find entries around the target timestamp
  const nearbyEntries = entries.filter(e =>
    Math.abs(e.timestamp - targetTimestamp) < 60 // Within 60 seconds
  );

  // Find the closest entry
  let currentEntry: StreamEntry | null = null;
  let minDistance = Infinity;
  for (const entry of entries) {
    const distance = Math.abs(entry.timestamp - targetTimestamp);
    if (distance < minDistance) {
      minDistance = distance;
      currentEntry = entry;
    }
  }

  return {
    channel,
    frequency: targetTimestamp,
    currentEntry,
    nearbyEntries: nearbyEntries.length > 0 ? nearbyEntries : entries.slice(-windowSize),
  };
}

/**
 * Get the "now" frequency (latest entry)
 */
export function getCurrentFrequency(
  seed: string,
  domainSlug: string,
  streamLength: number = 20
): TuningResult {
  const entries = generateEnhancedDayStream(seed, domainSlug, streamLength);
  const currentEntry = entries[entries.length - 1];

  return {
    channel: createChannel(seed, domainSlug),
    frequency: currentEntry?.timestamp || 0,
    currentEntry,
    nearbyEntries: entries.slice(-5),
  };
}
