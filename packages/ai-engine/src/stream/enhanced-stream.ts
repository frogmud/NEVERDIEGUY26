/**
 * Enhanced Eternal Stream Generator
 *
 * Integrates all stream subsystems:
 * - NPC-specific templates
 * - Domain lore pools
 * - Thread continuity (NPCs respond to each other)
 * - Special events (rare dramatic moments)
 * - Social graph relationships
 */

import { createSeededRng, type SeededRng } from '../core/seeded-rng';
import { getRelationshipFromGraph } from '../social/social-graph';

import type {
  StreamEntry,
  StreamEntryType,
  StreamConfig,
  StreamState,
  DomainContext,
  VoiceProfile,
} from './types';
import { DEFAULT_STREAM_CONFIG } from './types';

import {
  getVoiceProfile,
  getDomainContext,
  DOMAIN_CONTEXTS,
} from './voice-profiles';

import {
  getTemplatesForDomain,
  fillTemplate,
  type TemplateContext,
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

import { getNPCTemplates, hasNPCOverrides } from './npc-overrides';
import { getNPCDomainLore, type DomainLore } from './domain-lore';
import {
  shouldTriggerResponse,
  generateResponse,
  generateMentionReaction,
  type ResponseContext,
} from './thread-continuity';
import {
  shouldTriggerSpecialEvent,
  selectSpecialEvent,
  createSpecialEventEntry,
  createEventHistory,
  recordSpecialEvent,
  getRecentSpecialCount,
  type SpecialEventHistory,
} from './special-events';

// ============================================
// Enhanced Stream Config
// ============================================

export interface EnhancedStreamConfig extends StreamConfig {
  /** Use NPC-specific templates when available */
  useNPCOverrides: boolean;
  /** Use domain-specific lore */
  useDomainLore: boolean;
  /** Enable thread continuity (responses) */
  enableResponses: boolean;
  /** Enable special events */
  enableSpecialEvents: boolean;
  /** Chance of NPC responding to previous entry */
  responseChance: number;
}

export const DEFAULT_ENHANCED_CONFIG: EnhancedStreamConfig = {
  ...DEFAULT_STREAM_CONFIG,
  useNPCOverrides: true,
  useDomainLore: true,
  enableResponses: true,
  enableSpecialEvents: true,
  responseChance: 0.3,
};

// ============================================
// Enhanced Stream State
// ============================================

interface EnhancedStreamState extends StreamState {
  /** History of special events */
  specialEventHistory: SpecialEventHistory;
  /** Last entry for response tracking */
  lastEntry: StreamEntry | null;
  /** NPCs who have spoken recently (for variety) */
  recentSpeakers: string[];
}

// ============================================
// Main Enhanced Generator
// ============================================

/**
 * Generate an enhanced deterministic day stream
 */
export function generateEnhancedDayStream(
  seed: string,
  domainSlug: string,
  count: number,
  config: EnhancedStreamConfig = DEFAULT_ENHANCED_CONFIG
): StreamEntry[] {
  const streamSeed = `eternal:${seed}:${domainSlug}`;
  const rng = createSeededRng(streamSeed);

  const domain = getDomainContext(domainSlug);
  if (!domain) {
    return generateEnhancedDayStream(seed, 'earth', count, config);
  }

  const activeNPCs = selectActiveNPCs(domain, rng);
  if (activeNPCs.length === 0) return [];

  const state: EnhancedStreamState = {
    seed,
    domainSlug,
    activeNPCs,
    entries: [],
    currentTime: 0,
    nextEntryTime: calculateNextEntryTime(0, rng, config),
    specialEventHistory: createEventHistory(),
    lastEntry: null,
    recentSpeakers: [],
  };

  for (let i = 0; i < count; i++) {
    const entry = generateEnhancedEntry(state, domain, rng, config, i);
    state.entries.push(entry);
    state.lastEntry = entry;
    state.currentTime = entry.timestamp;
    state.nextEntryTime = calculateNextEntryTime(state.currentTime, rng, config);

    // Track recent speakers
    state.recentSpeakers.push(entry.speakerSlug);
    if (state.recentSpeakers.length > 3) {
      state.recentSpeakers.shift();
    }
  }

  return state.entries;
}

/**
 * Generate a single enhanced entry
 */
function generateEnhancedEntry(
  state: EnhancedStreamState,
  domain: DomainContext,
  rng: SeededRng,
  config: EnhancedStreamConfig,
  index: number
): StreamEntry {
  // Check for special event
  if (config.enableSpecialEvents) {
    const recentSpecialCount = getRecentSpecialCount(state.specialEventHistory);
    if (shouldTriggerSpecialEvent(rng, index, recentSpecialCount)) {
      const speakerSlug = selectSpeaker(state, rng, index);
      const speaker = getVoiceProfile(speakerSlug);
      if (speaker) {
        const event = selectSpecialEvent(
          speakerSlug,
          state.domainSlug,
          state.activeNPCs,
          rng,
          index
        );
        if (event) {
          recordSpecialEvent(state.specialEventHistory, event.type, index);
          return createSpecialEventEntry(
            event,
            speaker,
            state.seed,
            state.domainSlug,
            state.activeNPCs,
            state.nextEntryTime,
            rng,
            index
          );
        }
      }
    }
  }

  // Check for response to previous entry
  if (config.enableResponses && state.lastEntry) {
    const responderSlug = selectResponder(state, state.lastEntry, rng, index);
    if (responderSlug) {
      const responder = getVoiceProfile(responderSlug);
      if (responder && shouldTriggerResponse(state.lastEntry, responderSlug, rng, index)) {
        // Check if we should respond to being mentioned
        if (state.lastEntry.mentionsNPC === responderSlug) {
          const content = generateMentionReaction(responder, state.lastEntry, rng, index);
          return {
            id: `${state.seed}:${state.domainSlug}:${index}`,
            speakerSlug: responderSlug,
            speakerName: responder.name,
            type: 'relationship',
            content,
            mentionsNPC: state.lastEntry.speakerSlug,
            timestamp: state.nextEntryTime,
          };
        }

        // General response
        const relationship = getRelationshipFromGraph(responderSlug, state.lastEntry.speakerSlug);
        const ctx: ResponseContext = {
          trigger: state.lastEntry,
          responderSlug,
          relationship: relationship?.type || null,
          responder,
        };
        const content = generateResponse(ctx, rng, index);
        return {
          id: `${state.seed}:${state.domainSlug}:${index}`,
          speakerSlug: responderSlug,
          speakerName: responder.name,
          type: 'relationship',
          content,
          mentionsNPC: state.lastEntry.speakerSlug,
          timestamp: state.nextEntryTime,
        };
      }
    }
  }

  // Standard entry generation
  const speakerSlug = selectSpeaker(state, rng, index);
  const speaker = getVoiceProfile(speakerSlug);

  if (!speaker) {
    return {
      id: `${state.seed}:${state.domainSlug}:${index}`,
      speakerSlug,
      speakerName: speakerSlug,
      type: 'idle',
      content: '...',
      timestamp: state.nextEntryTime,
    };
  }

  const entryType = selectEntryType(rng, config, index);
  const { content, mentionsNPC, knowledgeId } = generateEnhancedContent(
    entryType,
    speaker,
    domain,
    state,
    rng,
    config,
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
 * Select speaker with variety (avoid repeating recent speakers)
 */
function selectSpeaker(
  state: EnhancedStreamState,
  rng: SeededRng,
  index: number
): string {
  // Prefer NPCs who haven't spoken recently
  const weights = state.activeNPCs.map(npc => {
    const recentCount = state.recentSpeakers.filter(s => s === npc).length;
    return { item: npc, weight: Math.max(1, 3 - recentCount) };
  });

  return rng.randomWeighted(weights, `speaker:${index}`) || state.activeNPCs[0];
}

/**
 * Select a responder (someone other than the previous speaker)
 */
function selectResponder(
  state: EnhancedStreamState,
  lastEntry: StreamEntry,
  rng: SeededRng,
  index: number
): string | null {
  const candidates = state.activeNPCs.filter(npc => npc !== lastEntry.speakerSlug);
  if (candidates.length === 0) return null;

  // Prioritize mentioned NPC
  if (lastEntry.mentionsNPC && candidates.includes(lastEntry.mentionsNPC)) {
    if (rng.random(`mention-respond:${index}`) < 0.6) {
      return lastEntry.mentionsNPC;
    }
  }

  return rng.randomChoice(candidates, `responder:${index}`) || null;
}

/**
 * Generate enhanced content using all subsystems
 */
function generateEnhancedContent(
  type: StreamEntryType,
  speaker: VoiceProfile,
  domain: DomainContext,
  state: EnhancedStreamState,
  rng: SeededRng,
  config: EnhancedStreamConfig,
  index: number
): { content: string; mentionsNPC?: string; knowledgeId?: string } {
  // Try NPC-specific templates first
  if (config.useNPCOverrides && hasNPCOverrides(speaker.slug)) {
    const npcTemplates = getNPCTemplates(speaker.slug)
      .filter(t => t.type === type);

    if (npcTemplates.length > 0 && rng.random(`use-npc-template:${index}`) < 0.6) {
      const weighted = npcTemplates.map(t => ({ item: t, weight: t.weight }));
      const template = rng.randomWeighted(weighted, `npc-template:${index}`);
      if (template) {
        const ctx = buildTemplateContext(type, speaker, domain, state, rng, index);
        const content = fillTemplate(template.template, ctx);
        return {
          content,
          mentionsNPC: type === 'relationship' ? ctx.targetNPC : undefined,
        };
      }
    }
  }

  // Try domain lore for lore entries
  if (config.useDomainLore && type === 'lore') {
    const domainLore = getNPCDomainLore(speaker.slug, domain.slug);
    if (domainLore.length > 0 && rng.random(`use-domain-lore:${index}`) < 0.5) {
      const lore = rng.randomChoice(domainLore, `domain-lore:${index}`);
      if (lore) {
        return {
          content: lore.content,
          knowledgeId: lore.id,
        };
      }
    }
  }

  // Fall back to standard templates
  const templates = getTemplatesForDomain(type, domain.slug);
  if (templates.length === 0) {
    // Use catchphrase as absolute fallback
    return {
      content: rng.randomChoice(speaker.catchphrases, `fallback:${index}`) || '...',
    };
  }

  const weighted = templates.map(t => ({ item: t, weight: t.weight }));
  const template = rng.randomWeighted(weighted, `template:${index}`);

  if (!template) {
    return { content: '...' };
  }

  const ctx = buildTemplateContext(type, speaker, domain, state, rng, index);
  const content = fillTemplate(template.template, ctx);

  return {
    content,
    mentionsNPC: type === 'relationship' ? ctx.targetNPC : undefined,
    knowledgeId: type === 'lore' ? getRandomKnowledgeId(speaker.slug, domain.slug, rng, index) : undefined,
  };
}

// ============================================
// Helper Functions
// ============================================

function selectActiveNPCs(domain: DomainContext, rng: SeededRng): string[] {
  const residents = [...domain.residents];
  const shuffled = rng.shuffle(residents, 'active-npcs');
  const count = Math.min(shuffled.length, rng.randomInt(3, 6, 'npc-count'));
  return shuffled.slice(0, count);
}

function selectEntryType(
  rng: SeededRng,
  config: StreamConfig,
  index: number
): StreamEntryType {
  const types: StreamEntryType[] = ['idle', 'relationship', 'lore', 'meta'];
  const weights = types.map(t => ({ item: t, weight: config.typeWeights[t] }));
  return rng.randomWeighted(weights, `type:${index}`) || 'idle';
}

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

function seedToDay(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash = hash & hash;
  }
  const dayNum = Math.abs(hash % 99999) + 1;
  return `Day ${dayNum}`;
}

function buildTemplateContext(
  type: StreamEntryType,
  speaker: VoiceProfile,
  domain: DomainContext,
  state: EnhancedStreamState,
  rng: SeededRng,
  index: number
): TemplateContext {
  let targetNPC: string | undefined;
  let targetVoice: VoiceProfile | undefined;

  if (type === 'relationship') {
    targetNPC = selectRelationshipTarget(speaker, state.activeNPCs, rng, index);
    targetVoice = targetNPC ? getVoiceProfile(targetNPC) : undefined;
  }

  const relationshipType = targetNPC
    ? categorizeRelationship(speaker, targetNPC)
    : 'neutral';

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
    knowledgeShort: getRandomKnowledgeShort(speaker.slug, domain.slug, rng, index),
    knowledgeContent: getRandomKnowledgeContent(speaker.slug, domain.slug, rng, index),
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

function selectRelationshipTarget(
  speaker: VoiceProfile,
  activeNPCs: string[],
  rng: SeededRng,
  index: number
): string | undefined {
  const others = activeNPCs.filter(npc => npc !== speaker.slug);
  if (others.length === 0) return undefined;

  const weighted = others.map(npc => {
    let weight = 1;
    if (speaker.teases.includes(npc)) weight = 3;
    else if (speaker.respects.includes(npc)) weight = 2;
    else if (speaker.avoids.includes(npc)) weight = 0.5;
    return { item: npc, weight };
  });

  return rng.randomWeighted(weighted, `target:${index}`);
}

function categorizeRelationship(
  speaker: VoiceProfile,
  target: string
): 'positive' | 'neutral' | 'negative' | 'teasing' {
  if (speaker.teases.includes(target)) return 'teasing';
  if (speaker.respects.includes(target)) return 'positive';
  if (speaker.avoids.includes(target)) return 'negative';
  return 'neutral';
}

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

function getRandomKnowledgeShort(
  npcSlug: string,
  domainSlug: string,
  rng: SeededRng,
  index: number
): string {
  const domainLore = getNPCDomainLore(npcSlug, domainSlug);
  if (domainLore.length > 0) {
    const lore = rng.randomChoice(domainLore, `lore-short:${index}`);
    return lore?.shortForm || '';
  }
  return rng.randomChoice(LORE_FACTS, `lore-fallback:${index}`) || '';
}

function getRandomKnowledgeContent(
  npcSlug: string,
  domainSlug: string,
  rng: SeededRng,
  index: number
): string {
  const domainLore = getNPCDomainLore(npcSlug, domainSlug);
  if (domainLore.length > 0) {
    const lore = rng.randomChoice(domainLore, `lore-content:${index}`);
    return lore?.content || '';
  }
  return '';
}

function getRandomKnowledgeId(
  npcSlug: string,
  domainSlug: string,
  rng: SeededRng,
  index: number
): string | undefined {
  const domainLore = getNPCDomainLore(npcSlug, domainSlug);
  if (domainLore.length > 0) {
    const lore = rng.randomChoice(domainLore, `lore-id:${index}`);
    return lore?.id;
  }
  return undefined;
}
