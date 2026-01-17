/**
 * Multi-NPC Conversation Engine
 *
 * Drives ambient NPC-to-NPC conversations on the homepage and in-game.
 * NPCs talk based on relationships, domains, and natural turn-taking.
 *
 * Features:
 * - Relationship-driven NPC selection
 * - Affinity-based conversation pairing
 * - Turn-taking with relationship weighting
 * - Player interruption handling
 * - Domain-aware Die-rector anchoring
 */

import type { MoodType, TemplatePool } from '../core/types';
import {
  type RelationshipType,
  type SocialRelationship,
  SOCIAL_GRAPH,
  getRelationshipFromGraph,
  getAllRelationships,
} from './social-graph';
import {
  type ConversationThread,
  type TopicCategory,
  createThread,
  getActiveTopic,
} from './conversation-threading';

// ============================================
// Conversation State Types
// ============================================

export interface ConversationTurn {
  id: string;
  speakerSlug: string;
  speakerName: string;
  spriteKey: string;
  text: string;
  targetSlug?: string;
  mood: MoodType;
  pool: TemplatePool;
  timestamp: number;
}

export interface MultiNPCConversationState {
  id: string;
  participants: string[];
  domainSlug: string;
  dieRectorSlug: string | null;
  turns: ConversationTurn[];
  currentSpeaker: string | null;
  thread: ConversationThread;
  playerNoticed: boolean;
  phase: 'ambient' | 'player_noticed' | 'paused';
  turnCounts: Record<string, number>;
  lastSpeaker: string | null;
  startTime: number;
}

// ============================================
// Relationship-to-Pool Mapping
// ============================================

export const RELATIONSHIP_POOL_MAP: Record<RelationshipType, TemplatePool> = {
  old_friends: 'npcGossip',
  allies: 'npcAlliance',
  rivals: 'npcConflict',
  enemies: 'npcConflict',
  mentor_student: 'hint',
  fear_respect: 'lore',
  colleagues: 'idle',
  acquaintances: 'idle',
  strangers: 'greeting',
  family: 'npcAlliance',
  former_allies: 'npcConflict',
  unrequited: 'npcGossip',
};

export const RELATIONSHIP_TONE_MAP: Record<RelationshipType, ConversationTone> = {
  old_friends: { warmth: 90, tension: 5, formality: 'casual', tone: 'nostalgic' },
  allies: { warmth: 75, tension: 10, formality: 'casual', tone: 'warm' },
  rivals: { warmth: 20, tension: 70, formality: 'formal', tone: 'competitive' },
  enemies: { warmth: 0, tension: 90, formality: 'formal', tone: 'hostile' },
  mentor_student: { warmth: 60, tension: 20, formality: 'casual', tone: 'instructive' },
  fear_respect: { warmth: 30, tension: 50, formality: 'formal', tone: 'deferential' },
  colleagues: { warmth: 40, tension: 20, formality: 'formal', tone: 'professional' },
  acquaintances: { warmth: 30, tension: 15, formality: 'formal', tone: 'neutral' },
  strangers: { warmth: 20, tension: 30, formality: 'formal', tone: 'cautious' },
  family: { warmth: 85, tension: 25, formality: 'casual', tone: 'familiar' },
  former_allies: { warmth: 25, tension: 60, formality: 'formal', tone: 'bitter' },
  unrequited: { warmth: 50, tension: 40, formality: 'casual', tone: 'awkward' },
};

export interface ConversationTone {
  warmth: number;
  tension: number;
  formality: 'casual' | 'formal';
  tone: 'warm' | 'nostalgic' | 'competitive' | 'hostile' | 'instructive' |
        'deferential' | 'professional' | 'neutral' | 'cautious' | 'familiar' |
        'bitter' | 'awkward';
}

// ============================================
// Conversation Affinity
// ============================================

/**
 * Affinity scores by relationship type.
 * Higher = more likely to naturally converse.
 */
export const AFFINITY_SCORES: Record<RelationshipType, number> = {
  old_friends: 90,
  allies: 80,
  family: 85,
  mentor_student: 75,
  colleagues: 60,
  rivals: 50, // They DO talk, just tensely
  former_allies: 45,
  unrequited: 40,
  acquaintances: 35,
  fear_respect: 30,
  enemies: 15, // Avoid but may snipe
  strangers: 5,
};

/**
 * Get affinity score between two NPCs.
 * Returns 0-100 indicating how likely they are to naturally converse.
 */
export function getConversationAffinity(npc1: string, npc2: string): number {
  const relationship = getRelationshipFromGraph(npc1, npc2);
  if (relationship) {
    const baseAffinity = AFFINITY_SCORES[relationship.type] || 30;
    // Strength amplifies affinity
    return Math.min(100, baseAffinity + (relationship.strength * 2));
  }

  // Check reverse direction
  const reverseRelationship = getRelationshipFromGraph(npc2, npc1);
  if (reverseRelationship) {
    const baseAffinity = AFFINITY_SCORES[reverseRelationship.type] || 30;
    return Math.min(100, baseAffinity + (reverseRelationship.strength * 2));
  }

  // No relationship = strangers
  return AFFINITY_SCORES.strangers;
}

/**
 * Get the relationship details between two NPCs.
 * Checks both directions and returns the stronger relationship.
 */
export function getRelationshipBetween(npc1: string, npc2: string): {
  relationship: SocialRelationship | null;
  type: RelationshipType;
  strength: number;
  direction: 'forward' | 'reverse' | 'none';
} {
  const forward = getRelationshipFromGraph(npc1, npc2);
  const reverse = getRelationshipFromGraph(npc2, npc1);

  if (forward && reverse) {
    // Use the stronger relationship
    if (forward.strength >= reverse.strength) {
      return { relationship: forward, type: forward.type, strength: forward.strength, direction: 'forward' };
    } else {
      return { relationship: reverse, type: reverse.type, strength: reverse.strength, direction: 'reverse' };
    }
  }

  if (forward) {
    return { relationship: forward, type: forward.type, strength: forward.strength, direction: 'forward' };
  }

  if (reverse) {
    return { relationship: reverse, type: reverse.type, strength: reverse.strength, direction: 'reverse' };
  }

  return { relationship: null, type: 'strangers', strength: 0, direction: 'none' };
}

/**
 * Get the dialogue pool for a conversation between two NPCs.
 */
export function getPoolForRelationship(npc1: string, npc2: string): TemplatePool {
  const { type } = getRelationshipBetween(npc1, npc2);
  return RELATIONSHIP_POOL_MAP[type] || 'idle';
}

/**
 * Get the conversational tone between two NPCs.
 */
export function getToneForRelationship(npc1: string, npc2: string): ConversationTone {
  const { type } = getRelationshipBetween(npc1, npc2);
  return RELATIONSHIP_TONE_MAP[type] || RELATIONSHIP_TONE_MAP.strangers;
}

// ============================================
// NPC Selection for Conversations
// ============================================

export interface ConversationPartnerOptions {
  domainSlug: string;
  domainResidents: string[];
  maxCount?: number;
  includeDieRector?: boolean;
  dieRectorSlug?: string;
  excludeNpcs?: string[];
}

/**
 * Select NPCs for a multi-NPC conversation.
 * Prioritizes NPCs with existing relationships to create natural groups.
 */
export function getConversationPartners(options: ConversationPartnerOptions): string[] {
  const {
    domainResidents,
    maxCount = 4,
    includeDieRector = Math.random() < 0.3,
    dieRectorSlug,
    excludeNpcs = [],
  } = options;

  const selected: string[] = [];
  const available = domainResidents.filter(npc => !excludeNpcs.includes(npc));

  if (available.length === 0) return [];

  // Start with a random anchor NPC
  const anchor = available[Math.floor(Math.random() * available.length)];
  selected.push(anchor);

  // Find NPCs with highest affinity to anchor
  const affinityScores = available
    .filter(npc => npc !== anchor)
    .map(npc => ({
      slug: npc,
      affinity: getConversationAffinity(anchor, npc),
    }))
    .sort((a, b) => b.affinity - a.affinity);

  // Add high-affinity partners
  for (const { slug, affinity } of affinityScores) {
    if (selected.length >= maxCount) break;

    // Skip very low affinity (enemies avoiding each other)
    if (affinity < 10) continue;

    selected.push(slug);
  }

  // Optionally add Die-rector as conversation anchor
  if (includeDieRector && dieRectorSlug && !selected.includes(dieRectorSlug)) {
    // Die-rector takes priority slot
    if (selected.length >= maxCount) {
      selected.pop();
    }
    selected.unshift(dieRectorSlug);
  }

  return selected;
}

/**
 * Group NPCs into natural conversation clusters based on relationships.
 */
export function getConversationClusters(
  npcs: string[],
  maxClusterSize: number = 4
): string[][] {
  const clusters: string[][] = [];
  const assigned = new Set<string>();

  // Sort NPCs by total relationship count (more connected = cluster anchor)
  const npcConnectivity = npcs.map(npc => ({
    slug: npc,
    connections: getAllRelationships(npc).filter(r =>
      npcs.includes(r.target) && r.relationship.type !== 'enemies'
    ).length,
  })).sort((a, b) => b.connections - a.connections);

  for (const { slug } of npcConnectivity) {
    if (assigned.has(slug)) continue;

    const cluster = [slug];
    assigned.add(slug);

    // Find compatible NPCs for this cluster
    const relationships = getAllRelationships(slug);
    for (const { target, relationship } of relationships) {
      if (assigned.has(target)) continue;
      if (!npcs.includes(target)) continue;
      if (relationship.type === 'enemies') continue;
      if (cluster.length >= maxClusterSize) break;

      cluster.push(target);
      assigned.add(target);
    }

    clusters.push(cluster);
  }

  // Add any unassigned NPCs as singles
  for (const npc of npcs) {
    if (!assigned.has(npc)) {
      clusters.push([npc]);
    }
  }

  return clusters;
}

// ============================================
// Speaker Selection Algorithm
// ============================================

export interface SpeakerWeights {
  npcSlug: string;
  weight: number;
  reasons: string[];
}

/**
 * Select the next speaker in a multi-NPC conversation.
 * Uses relationship-based weighting and turn balance.
 */
export function selectNextSpeaker(
  state: MultiNPCConversationState,
  rng: () => number = Math.random
): string | null {
  const { participants, lastSpeaker, turnCounts } = state;

  if (participants.length === 0) return null;
  if (participants.length === 1) return participants[0];

  const weights: SpeakerWeights[] = participants.map(npc => {
    const weight: SpeakerWeights = { npcSlug: npc, weight: 50, reasons: [] };

    // Rule 1: Cannot repeat immediately
    if (npc === lastSpeaker) {
      weight.weight = 0;
      weight.reasons.push('just spoke');
      return weight;
    }

    // Rule 2: Relationship to last speaker
    if (lastSpeaker) {
      const { type, strength } = getRelationshipBetween(npc, lastSpeaker);

      switch (type) {
        case 'rivals':
          weight.weight += 30 + (strength * 2);
          weight.reasons.push('rival interrupt');
          break;
        case 'enemies':
          weight.weight -= 20;
          weight.reasons.push('avoiding enemy');
          break;
        case 'allies':
        case 'old_friends':
        case 'family':
          weight.weight += 10 + strength;
          weight.reasons.push('supportive response');
          break;
        case 'mentor_student':
          weight.weight += 15;
          weight.reasons.push('teaching moment');
          break;
        case 'fear_respect':
          weight.weight += 5;
          weight.reasons.push('deferential');
          break;
      }
    }

    // Rule 3: Turn balance - underrepresented speakers get boost
    const avgTurns = Object.values(turnCounts).reduce((a, b) => a + b, 0) / participants.length;
    const npcTurns = turnCounts[npc] || 0;
    if (npcTurns < avgTurns) {
      const turnDeficit = avgTurns - npcTurns;
      weight.weight += Math.min(20, turnDeficit * 10);
      weight.reasons.push('turn balance');
    }

    // Ensure minimum weight for eligible speakers
    weight.weight = Math.max(5, weight.weight);

    return weight;
  });

  // Filter out zero-weight (just spoke)
  const eligible = weights.filter(w => w.weight > 0);
  if (eligible.length === 0) return participants[0];

  // Weighted random selection
  const totalWeight = eligible.reduce((sum, w) => sum + w.weight, 0);
  let roll = rng() * totalWeight;

  for (const w of eligible) {
    roll -= w.weight;
    if (roll <= 0) return w.npcSlug;
  }

  return eligible[0].npcSlug;
}

// ============================================
// Conversation State Management
// ============================================

/**
 * Create a new multi-NPC conversation state.
 */
export function createMultiNPCConversation(
  participants: string[],
  domainSlug: string,
  dieRectorSlug?: string | null
): MultiNPCConversationState {
  const turnCounts: Record<string, number> = {};
  for (const p of participants) {
    turnCounts[p] = 0;
  }

  return {
    id: `conv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    participants,
    domainSlug,
    dieRectorSlug: dieRectorSlug || null,
    turns: [],
    currentSpeaker: null,
    thread: createThread(participants[0] || 'system'),
    playerNoticed: false,
    phase: 'ambient',
    turnCounts,
    lastSpeaker: null,
    startTime: Date.now(),
  };
}

/**
 * Add a turn to the conversation.
 */
export function addConversationTurn(
  state: MultiNPCConversationState,
  turn: Omit<ConversationTurn, 'id' | 'timestamp'>
): MultiNPCConversationState {
  const newTurn: ConversationTurn = {
    ...turn,
    id: `turn-${state.turns.length}-${Date.now()}`,
    timestamp: Date.now(),
  };

  return {
    ...state,
    turns: [...state.turns, newTurn],
    currentSpeaker: turn.speakerSlug,
    lastSpeaker: turn.speakerSlug,
    turnCounts: {
      ...state.turnCounts,
      [turn.speakerSlug]: (state.turnCounts[turn.speakerSlug] || 0) + 1,
    },
  };
}

/**
 * Handle player interruption (grunt/wake up).
 * All NPCs pause and react with surprise.
 */
export function handlePlayerInterrupt(
  state: MultiNPCConversationState
): MultiNPCConversationState {
  return {
    ...state,
    playerNoticed: true,
    phase: 'player_noticed',
    currentSpeaker: null,
  };
}

/**
 * Pause the conversation (e.g., player started typing).
 */
export function pauseConversation(
  state: MultiNPCConversationState
): MultiNPCConversationState {
  return {
    ...state,
    phase: 'paused',
    currentSpeaker: null,
  };
}

/**
 * Get context for API request when generating a turn.
 */
export function getConversationContext(
  state: MultiNPCConversationState,
  speakerSlug: string,
  targetSlug?: string
): {
  pool: TemplatePool;
  tone: ConversationTone;
  relationshipType: RelationshipType;
  previousText?: string;
  targetNpcSlug?: string;
} {
  const target = targetSlug || state.lastSpeaker || state.participants.find(p => p !== speakerSlug);

  if (!target) {
    return {
      pool: 'idle',
      tone: RELATIONSHIP_TONE_MAP.strangers,
      relationshipType: 'strangers',
    };
  }

  const { type } = getRelationshipBetween(speakerSlug, target);
  const lastTurn = state.turns[state.turns.length - 1];

  return {
    pool: RELATIONSHIP_POOL_MAP[type] || 'idle',
    tone: RELATIONSHIP_TONE_MAP[type] || RELATIONSHIP_TONE_MAP.strangers,
    relationshipType: type,
    previousText: lastTurn?.text,
    targetNpcSlug: target,
  };
}

// ============================================
// Conversation Summary
// ============================================

export interface ConversationSummary {
  participantCount: number;
  turnCount: number;
  dominantSpeaker: string | null;
  relationshipHighlights: Array<{
    npc1: string;
    npc2: string;
    type: RelationshipType;
    interactions: number;
  }>;
  phase: 'ambient' | 'player_noticed' | 'paused';
  durationMs: number;
}

export function summarizeConversation(state: MultiNPCConversationState): ConversationSummary {
  // Find dominant speaker
  let dominantSpeaker: string | null = null;
  let maxTurns = 0;
  for (const [npc, turns] of Object.entries(state.turnCounts)) {
    if (turns > maxTurns) {
      maxTurns = turns;
      dominantSpeaker = npc;
    }
  }

  // Track relationship interactions
  const interactions: Record<string, number> = {};
  for (const turn of state.turns) {
    if (turn.targetSlug) {
      const key = [turn.speakerSlug, turn.targetSlug].sort().join('-');
      interactions[key] = (interactions[key] || 0) + 1;
    }
  }

  const relationshipHighlights = Object.entries(interactions)
    .map(([key, count]) => {
      const [npc1, npc2] = key.split('-');
      const { type } = getRelationshipBetween(npc1, npc2);
      return { npc1, npc2, type, interactions: count };
    })
    .sort((a, b) => b.interactions - a.interactions)
    .slice(0, 5);

  return {
    participantCount: state.participants.length,
    turnCount: state.turns.length,
    dominantSpeaker,
    relationshipHighlights,
    phase: state.phase,
    durationMs: Date.now() - state.startTime,
  };
}
