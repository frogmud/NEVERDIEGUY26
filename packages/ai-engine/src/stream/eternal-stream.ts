/**
 * NPC Eternal Stream Generator
 *
 * Immortals chat on a cursed app platform across infinite "days" (seeds).
 * Each seed + domain combo produces a deterministic conversation stream.
 *
 * Core API:
 *   generateDayStream(seed: string, domainSlug: string, count: number): StreamEntry[]
 */

import { createSeededRng, type SeededRng } from '../core/seeded-rng';
import { getRelationshipFromGraph, type RelationshipType } from '../social/social-graph';
import { getNPCKnowledge, type KnowledgePiece } from '../social/knowledge-system';

import type {
  StreamEntry,
  StreamEntryType,
  StreamReaction,
  ReactionType,
  StreamConfig,
  StreamState,
  DomainContext,
  VoiceProfile,
} from './types';
import { DEFAULT_STREAM_CONFIG } from './types';

import {
  VOICE_PROFILES,
  DOMAIN_CONTEXTS,
  getVoiceProfile,
  getDomainContext,
  getDomainResidents,
} from './voice-profiles';

import {
  ALL_TEMPLATES,
  getTemplatesForDomain,
  fillTemplate,
  type TemplateContext,
  type StreamTemplate,
  REACTIONS,
  OPINIONS,
  TIME_UNITS,
  INTENSITIES,
  SHARED_EVENTS,
  FLAWS,
  BEHAVIORS,
  LORE_FACTS,
  DIRECTOR_FACTS,
  ORIGIN_FACTS,
} from './stream-templates';

// ============================================
// Stream Generation Core
// ============================================

/**
 * Generate a deterministic day stream for a seed + domain combo
 */
export function generateDayStream(
  seed: string,
  domainSlug: string,
  count: number,
  config: StreamConfig = DEFAULT_STREAM_CONFIG
): StreamEntry[] {
  // Create deterministic RNG from seed + domain
  const streamSeed = `eternal:${seed}:${domainSlug}`;
  const rng = createSeededRng(streamSeed);

  // Get domain context
  const domain = getDomainContext(domainSlug);
  if (!domain) {
    // Fallback to earth if domain not found
    return generateDayStream(seed, 'earth', count, config);
  }

  // Get active NPCs for this domain
  const activeNPCs = selectActiveNPCs(domain, rng);
  if (activeNPCs.length === 0) {
    return [];
  }

  // Initialize state
  const state: StreamState = {
    seed,
    domainSlug,
    activeNPCs,
    entries: [],
    currentTime: 0,
    nextEntryTime: calculateNextEntryTime(0, rng, config),
  };

  // Generate entries
  for (let i = 0; i < count; i++) {
    const entry = generateEntry(state, domain, rng, config, i);
    state.entries.push(entry);
    state.currentTime = entry.timestamp;
    state.nextEntryTime = calculateNextEntryTime(state.currentTime, rng, config);
  }

  return state.entries;
}

/**
 * Generate a single stream entry
 */
function generateEntry(
  state: StreamState,
  domain: DomainContext,
  rng: SeededRng,
  config: StreamConfig,
  index: number
): StreamEntry {
  // Select speaker
  const speakerSlug = rng.randomChoice(state.activeNPCs, `speaker:${index}`)!;
  const speaker = getVoiceProfile(speakerSlug);

  if (!speaker) {
    // Fallback: generate minimal entry
    return {
      id: `${state.seed}:${state.domainSlug}:${index}`,
      speakerSlug,
      speakerName: speakerSlug,
      type: 'idle',
      content: '...',
      timestamp: state.nextEntryTime,
    };
  }

  // Select entry type
  const entryType = selectEntryType(rng, config, index);

  // Generate content based on type
  const { content, mentionsNPC, knowledgeId } = generateContent(
    entryType,
    speaker,
    domain,
    state,
    rng,
    index
  );

  return {
    id: `${state.seed}:${state.domainSlug}:${index}`,
    speakerSlug,
    speakerName: speaker.name,
    type: entryType,
    content,
    mentionsNPC,
    knowledgeId,
    timestamp: state.nextEntryTime,
  };
}

/**
 * Select entry type based on weights
 */
function selectEntryType(
  rng: SeededRng,
  config: StreamConfig,
  index: number
): StreamEntryType {
  const types: StreamEntryType[] = ['idle', 'relationship', 'lore', 'meta'];
  const weights = types.map(t => ({ item: t, weight: config.typeWeights[t] }));
  return rng.randomWeighted(weights, `type:${index}`) || 'idle';
}

/**
 * Generate content for an entry
 */
function generateContent(
  type: StreamEntryType,
  speaker: VoiceProfile,
  domain: DomainContext,
  state: StreamState,
  rng: SeededRng,
  index: number
): { content: string; mentionsNPC?: string; knowledgeId?: string } {
  // Get templates for this type and domain
  const templates = getTemplatesForDomain(type, domain.slug);
  if (templates.length === 0) {
    return { content: '...' };
  }

  // Weight-based template selection
  const weightedTemplates = templates.map(t => ({ item: t, weight: t.weight }));
  const template = rng.randomWeighted(weightedTemplates, `template:${index}`);

  if (!template) {
    return { content: '...' };
  }

  // Build context for template filling
  const ctx = buildTemplateContext(type, speaker, domain, state, rng, index);

  // Fill template
  const content = fillTemplate(template.template, ctx);

  return {
    content,
    mentionsNPC: type === 'relationship' ? ctx.targetNPC : undefined,
    knowledgeId: type === 'lore' ? getRandomKnowledgeId(speaker.slug, rng, index) : undefined,
  };
}

/**
 * Build context for template filling
 */
function buildTemplateContext(
  type: StreamEntryType,
  speaker: VoiceProfile,
  domain: DomainContext,
  state: StreamState,
  rng: SeededRng,
  index: number
): TemplateContext {
  // Select target NPC for relationship entries
  let targetNPC: string | undefined;
  let targetVoice: VoiceProfile | undefined;

  if (type === 'relationship') {
    targetNPC = selectRelationshipTarget(speaker, state.activeNPCs, rng, index);
    targetVoice = targetNPC ? getVoiceProfile(targetNPC) : undefined;
  }

  // Get relationship context for reaction/opinion
  const relationshipType = targetNPC
    ? categorizeRelationship(speaker, targetNPC)
    : 'neutral';

  // Select random values
  return {
    domain: domain.name,
    element: domain.element,
    seed: state.seed,
    seedDay: seedToDay(state.seed),
    targetNPC: targetVoice?.name || targetNPC,
    randomNPC: selectRandomNPCName(state.activeNPCs, speaker.slug, rng, index),
    catchphrase: rng.randomChoice(speaker.catchphrases, `catchphrase:${index}`) || '...',
    atmosphere: rng.randomChoice(domain.atmosphere, `atmos:${index}`) || 'strange',
    intensity: rng.randomChoice(INTENSITIES, `intensity:${index}`) || 'strange',
    knowledgeShort: getRandomKnowledgeShort(speaker.slug, rng, index),
    knowledgeContent: getRandomKnowledgeContent(speaker.slug, rng, index),
    reaction: selectReaction(relationshipType, rng, index),
    opinion: selectOpinion(relationshipType, rng, index),
    sharedEvent: rng.randomChoice(SHARED_EVENTS, `event:${index}`) || 'the old days',
    timeUnit: rng.randomChoice(TIME_UNITS, `time:${index}`) || 'a while',
    topic: rng.randomChoice(speaker.topics, `topic:${index}`) || 'things',
    flaw: rng.randomChoice(FLAWS, `flaw:${index}`) || 'predictability',
    behavior: rng.randomChoice(BEHAVIORS, `behavior:${index}`) || 'the same',
    loreFact: rng.randomChoice(LORE_FACTS, `lore:${index}`) || '',
    directorFact: rng.randomChoice(DIRECTOR_FACTS, `director:${index}`) || '',
    originFact: rng.randomChoice(ORIGIN_FACTS, `origin:${index}`) || '',
  };
}

// ============================================
// NPC Selection
// ============================================

/**
 * Select active NPCs for this domain stream
 */
function selectActiveNPCs(domain: DomainContext, rng: SeededRng): string[] {
  const residents = [...domain.residents];

  // Shuffle deterministically
  const shuffled = rng.shuffle(residents, 'active-npcs');

  // Take 3-6 NPCs (or all if fewer)
  const count = Math.min(shuffled.length, rng.randomInt(3, 6, 'npc-count'));
  return shuffled.slice(0, count);
}

/**
 * Select a relationship target based on speaker's relationships
 */
function selectRelationshipTarget(
  speaker: VoiceProfile,
  activeNPCs: string[],
  rng: SeededRng,
  index: number
): string | undefined {
  // Filter out self
  const others = activeNPCs.filter(npc => npc !== speaker.slug);
  if (others.length === 0) return undefined;

  // Weight by relationship (teases > respects > others)
  const weighted = others.map(npc => {
    let weight = 1;
    if (speaker.teases.includes(npc)) weight = 3;
    else if (speaker.respects.includes(npc)) weight = 2;
    else if (speaker.avoids.includes(npc)) weight = 0.5;
    return { item: npc, weight };
  });

  return rng.randomWeighted(weighted, `target:${index}`);
}

/**
 * Categorize relationship for reaction/opinion selection
 */
function categorizeRelationship(
  speaker: VoiceProfile,
  target: string
): 'positive' | 'neutral' | 'negative' | 'teasing' {
  if (speaker.teases.includes(target)) return 'teasing';
  if (speaker.respects.includes(target)) return 'positive';
  if (speaker.avoids.includes(target)) return 'negative';
  return 'neutral';
}

/**
 * Select a random NPC name (for {{RANDOM_NPC}} placeholder)
 */
function selectRandomNPCName(
  activeNPCs: string[],
  excludeSlug: string,
  rng: SeededRng,
  index: number
): string {
  const others = activeNPCs.filter(npc => npc !== excludeSlug);
  const slug = rng.randomChoice(others, `random-npc:${index}`) || 'someone';
  const voice = getVoiceProfile(slug);
  return voice?.name || slug;
}

// ============================================
// Reaction & Opinion Selection
// ============================================

function selectReaction(
  relationshipType: 'positive' | 'neutral' | 'negative' | 'teasing',
  rng: SeededRng,
  index: number
): string {
  const pool = REACTIONS[relationshipType] || REACTIONS.neutral;
  return rng.randomChoice(pool, `reaction:${index}`) || 'Hmm';
}

function selectOpinion(
  relationshipType: 'positive' | 'neutral' | 'negative' | 'teasing',
  rng: SeededRng,
  index: number
): string {
  const pool =
    relationshipType === 'positive' ? OPINIONS.respect :
    relationshipType === 'negative' ? OPINIONS.dislike :
    relationshipType === 'teasing' ? OPINIONS.tease :
    OPINIONS.neutral;
  return rng.randomChoice(pool, `opinion:${index}`) || '...';
}

// ============================================
// Knowledge Helpers
// ============================================

function getRandomKnowledgeShort(
  npcSlug: string,
  rng: SeededRng,
  index: number
): string {
  const knowledge = getNPCKnowledge(npcSlug);
  if (knowledge.length === 0) {
    return rng.randomChoice(LORE_FACTS, `lore-fallback:${index}`) || '';
  }
  const piece = rng.randomChoice(knowledge, `knowledge:${index}`);
  return piece?.shortForm || '';
}

function getRandomKnowledgeContent(
  npcSlug: string,
  rng: SeededRng,
  index: number
): string {
  const knowledge = getNPCKnowledge(npcSlug);
  if (knowledge.length === 0) return '';
  const piece = rng.randomChoice(knowledge, `knowledge-content:${index}`);
  return piece?.content || '';
}

function getRandomKnowledgeId(
  npcSlug: string,
  rng: SeededRng,
  index: number
): string | undefined {
  const knowledge = getNPCKnowledge(npcSlug);
  if (knowledge.length === 0) return undefined;
  const piece = rng.randomChoice(knowledge, `knowledge-id:${index}`);
  return piece?.id;
}

// ============================================
// Time Utilities
// ============================================

/**
 * Calculate next entry time based on config
 */
function calculateNextEntryTime(
  currentTime: number,
  rng: SeededRng,
  config: StreamConfig
): number {
  const interval = rng.randomInt(
    config.minInterval,
    config.maxInterval,
    `interval:${currentTime}`
  );
  return currentTime + interval;
}

/**
 * Convert seed to a human-readable "day" string
 */
function seedToDay(seed: string): string {
  // Simple hash to number, then format as day
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash = hash & hash;
  }
  const dayNum = Math.abs(hash % 99999) + 1;
  return `Day ${dayNum}`;
}

// ============================================
// Stream Continuation
// ============================================

/**
 * Continue an existing stream from a given state
 */
export function continueStream(
  state: StreamState,
  additionalCount: number,
  config: StreamConfig = DEFAULT_STREAM_CONFIG
): StreamEntry[] {
  const streamSeed = `eternal:${state.seed}:${state.domainSlug}`;
  const rng = createSeededRng(streamSeed);

  const domain = getDomainContext(state.domainSlug);
  if (!domain) return [];

  // Start from where we left off
  const startIndex = state.entries.length;
  const newEntries: StreamEntry[] = [];

  for (let i = 0; i < additionalCount; i++) {
    const index = startIndex + i;
    const entry = generateEntry(state, domain, rng, config, index);
    state.entries.push(entry);
    newEntries.push(entry);
    state.currentTime = entry.timestamp;
    state.nextEntryTime = calculateNextEntryTime(state.currentTime, rng, config);
  }

  return newEntries;
}

/**
 * Create an initial stream state (for streaming/pagination)
 */
export function createStreamState(
  seed: string,
  domainSlug: string
): StreamState {
  const streamSeed = `eternal:${seed}:${domainSlug}`;
  const rng = createSeededRng(streamSeed);

  const domain = getDomainContext(domainSlug) || DOMAIN_CONTEXTS['earth'];
  const activeNPCs = selectActiveNPCs(domain!, rng);

  return {
    seed,
    domainSlug,
    activeNPCs,
    entries: [],
    currentTime: 0,
    nextEntryTime: 0,
  };
}

// ============================================
// Stream Queries
// ============================================

/**
 * Get entries mentioning a specific NPC
 */
export function getEntriesMentioning(
  entries: StreamEntry[],
  npcSlug: string
): StreamEntry[] {
  return entries.filter(e =>
    e.mentionsNPC === npcSlug ||
    e.speakerSlug === npcSlug
  );
}

/**
 * Get entries by type
 */
export function getEntriesByType(
  entries: StreamEntry[],
  type: StreamEntryType
): StreamEntry[] {
  return entries.filter(e => e.type === type);
}

/**
 * Get entries within a time range
 */
export function getEntriesInRange(
  entries: StreamEntry[],
  startTime: number,
  endTime: number
): StreamEntry[] {
  return entries.filter(e =>
    e.timestamp >= startTime && e.timestamp <= endTime
  );
}

// ============================================
// Export Stream State for UI
// ============================================

export interface StreamSnapshot {
  seed: string;
  domainSlug: string;
  domainName: string;
  dayLabel: string;
  activeNPCs: Array<{ slug: string; name: string }>;
  entries: StreamEntry[];
  totalTime: number;
}

/**
 * Create a snapshot of stream state for UI consumption
 */
export function createStreamSnapshot(state: StreamState): StreamSnapshot {
  const domain = getDomainContext(state.domainSlug);

  return {
    seed: state.seed,
    domainSlug: state.domainSlug,
    domainName: domain?.name || state.domainSlug,
    dayLabel: seedToDay(state.seed),
    activeNPCs: state.activeNPCs.map(slug => ({
      slug,
      name: getVoiceProfile(slug)?.name || slug,
    })),
    entries: state.entries,
    totalTime: state.currentTime,
  };
}

// ============================================
// Reaction Generation
// ============================================

/**
 * Reaction weights based on relationship type
 */
const REACTION_WEIGHTS: Record<string, Record<ReactionType, number>> = {
  positive: { love: 30, like: 50, dislike: 5, report: 0 },
  neutral: { love: 5, like: 40, dislike: 20, report: 5 },
  negative: { love: 0, like: 10, dislike: 50, report: 20 },
  teasing: { love: 10, like: 35, dislike: 35, report: 5 },
};

/**
 * Generate deterministic reactions for an entry based on active NPCs
 */
export function generateReactions(
  entry: StreamEntry,
  activeNPCs: string[],
  rng: SeededRng,
  reactionChance: number = 0.35
): StreamReaction[] {
  const reactions: StreamReaction[] = [];
  const speaker = getVoiceProfile(entry.speakerSlug);
  if (!speaker) return reactions;

  // Other NPCs may react
  const otherNPCs = activeNPCs.filter(npc => npc !== entry.speakerSlug);

  for (const npcSlug of otherNPCs) {
    // Deterministic chance to react
    const shouldReact = rng.random(`react:${entry.id}:${npcSlug}`) < reactionChance;
    if (!shouldReact) continue;

    const reactor = getVoiceProfile(npcSlug);
    if (!reactor) continue;

    // Determine reaction type based on relationship
    const relationshipType = categorizeNPCRelationship(reactor, entry.speakerSlug);
    const weights = REACTION_WEIGHTS[relationshipType] || REACTION_WEIGHTS.neutral;

    const reactionType = selectWeightedReaction(weights, rng, `${entry.id}:${npcSlug}`);

    reactions.push({
      reactorSlug: npcSlug,
      reactorName: reactor.name,
      type: reactionType,
      timestamp: entry.timestamp + rng.randomInt(1, 10, `react-time:${entry.id}:${npcSlug}`),
    });
  }

  return reactions;
}

/**
 * Categorize relationship between two NPCs
 */
function categorizeNPCRelationship(
  reactor: VoiceProfile,
  speakerSlug: string
): 'positive' | 'neutral' | 'negative' | 'teasing' {
  if (reactor.teases.includes(speakerSlug)) return 'teasing';
  if (reactor.respects.includes(speakerSlug)) return 'positive';
  if (reactor.avoids.includes(speakerSlug)) return 'negative';
  return 'neutral';
}

/**
 * Select a reaction type based on weights
 */
function selectWeightedReaction(
  weights: Record<ReactionType, number>,
  rng: SeededRng,
  key: string
): ReactionType {
  const items: Array<{ item: ReactionType; weight: number }> = [
    { item: 'love', weight: weights.love },
    { item: 'like', weight: weights.like },
    { item: 'dislike', weight: weights.dislike },
    { item: 'report', weight: weights.report },
  ];
  return rng.randomWeighted(items, key) || 'like';
}

/**
 * Generate a stream with reactions attached
 */
export function generateDayStreamWithReactions(
  seed: string,
  domainSlug: string,
  count: number,
  config: StreamConfig = DEFAULT_STREAM_CONFIG,
  reactionChance: number = 0.35
): StreamEntry[] {
  const entries = generateDayStream(seed, domainSlug, count, config);
  const streamSeed = `eternal:${seed}:${domainSlug}`;
  const rng = createSeededRng(streamSeed);

  // Get active NPCs for reactions
  const domain = getDomainContext(domainSlug);
  const activeNPCs = domain ? selectActiveNPCs(domain, rng) : [];

  // Attach reactions to each entry
  return entries.map(entry => ({
    ...entry,
    reactions: generateReactions(entry, activeNPCs, rng, reactionChance),
  }));
}

// ============================================
// NPC Tagging System
// ============================================

/**
 * Detect and tag NPCs mentioned in content
 */
export function detectTaggedNPCs(
  content: string,
  activeNPCs: string[]
): string[] {
  const tagged: string[] = [];

  for (const npcSlug of activeNPCs) {
    const voice = getVoiceProfile(npcSlug);
    if (!voice) continue;

    // Check for @mentions or name references
    const namePattern = new RegExp(`@?${voice.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i');
    if (namePattern.test(content)) {
      tagged.push(npcSlug);
    }
  }

  return tagged;
}
