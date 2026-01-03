/**
 * Interaction Engine
 *
 * Drives NPC-to-NPC conversations with autonomous turn-taking.
 * Supports player interjection and observable stat changes.
 */

import type {
  NPCPersonality,
  SimulationContext,
  ChatMessage,
  ObservedStatChange,
  ConversationState,
  InteractionTurn,
  MoodType,
  TemplatePool,
  NPCDashboardState,
} from './types';
import { createSeededRng } from './seeded-rng';
import {
  createRelationshipStore,
  modifyStat,
  recordEvent,
  deriveMoodState,
  wouldInitiateConversation,
  type RelationshipStore,
} from './relationship';
import {
  createMemoryStore,
  recordConversation,
  updateOpinion,
  getOpinion,
  hasTraumaBond,
  type MemoryStore,
} from './memory';
import {
  selectResponse,
  createUsageState,
  markTemplateUsed,
  type SelectionInput,
} from './response-selector';
import { detectIntent, intentToPool } from './intent-detector';

// ============================================
// Engine State
// ============================================

export interface EngineState {
  npcs: Map<string, NPCPersonality>;
  relationships: RelationshipStore;
  memories: MemoryStore;
  conversations: ConversationState[];
  currentConversation: ConversationState | null;
  context: SimulationContext;
  usageStates: Map<string, ReturnType<typeof createUsageState>>;
  allStatChanges: ObservedStatChange[];
  turnHistory: InteractionTurn[];
}

export function createEngineState(
  npcs: NPCPersonality[],
  seed: string
): EngineState {
  const npcMap = new Map<string, NPCPersonality>();
  for (const npc of npcs) {
    npcMap.set(npc.identity.slug, npc);
  }

  return {
    npcs: npcMap,
    relationships: createRelationshipStore(),
    memories: createMemoryStore(),
    conversations: [],
    currentConversation: null,
    context: {
      seed,
      turnNumber: 0,
      activeNPCs: npcs.map((n) => n.identity.slug),
      playerPresent: true,
      location: 'Market Square',
      recentEvents: [],
    },
    usageStates: new Map(),
    allStatChanges: [],
    turnHistory: [],
  };
}

// ============================================
// Conversation Management
// ============================================

let conversationIdCounter = 0;

function createConversation(participants: string[]): ConversationState {
  return {
    id: `conv_${++conversationIdCounter}`,
    participants,
    turns: [],
    startTime: Date.now(),
    lastActivity: Date.now(),
    mood: 'neutral',
  };
}

// ============================================
// Turn Selection
// ============================================

function selectNextSpeaker(
  state: EngineState,
  excludeSlugs: string[] = []
): string | null {
  const rng = createSeededRng(`${state.context.seed}:speaker:${state.context.turnNumber}`);

  const candidates = state.context.activeNPCs.filter(
    (slug) => !excludeSlugs.includes(slug)
  );

  if (candidates.length === 0) return null;

  const weighted = candidates.map((slug) => {
    const npc = state.npcs.get(slug);
    if (!npc) return { slug, weight: 0 };

    let weight = npc.sociability * 100;

    const memory = state.memories.get(slug);
    if (Object.keys(memory.traumaBonds).length > 0) {
      weight += 20;
    }
    if (Object.values(memory.opinions).some((o) => Math.abs(o) > 50)) {
      weight += 15;
    }

    const recentSpeakers = state.turnHistory.slice(-3).map((t) => t.speaker);
    if (recentSpeakers.includes(slug)) {
      weight *= 0.3;
    }

    return { slug, weight };
  });

  const items = weighted.map((w) => ({ item: w.slug, weight: Math.max(1, w.weight) }));
  return rng.randomWeighted(items, 'speaker') ?? null;
}

function selectTarget(
  state: EngineState,
  speakerSlug: string
): string | null {
  const rng = createSeededRng(`${state.context.seed}:target:${speakerSlug}:${state.context.turnNumber}`);

  const candidates = state.context.activeNPCs.filter((slug) => slug !== speakerSlug);
  if (candidates.length === 0) return null;

  const speaker = state.npcs.get(speakerSlug);
  if (!speaker) return null;

  const weighted = candidates.map((targetSlug) => {
    let weight = 50;

    const rel = state.relationships.get(speakerSlug, targetSlug);
    weight += Math.abs(rel.stats.respect) * 0.5;
    weight += rel.stats.familiarity * 0.3;

    const memory = state.memories.get(speakerSlug);
    if (hasTraumaBond(memory, targetSlug)) {
      weight += 30;
    }

    const opinion = getOpinion(memory, targetSlug);
    weight += Math.abs(opinion) * 0.4;

    return { slug: targetSlug, weight };
  });

  const items = weighted.map((w) => ({ item: w.slug, weight: Math.max(1, w.weight) }));
  return rng.randomWeighted(items, 'target') ?? null;
}

function selectPool(
  state: EngineState,
  speakerSlug: string,
  targetSlug: string | null
): TemplatePool {
  const rng = createSeededRng(`${state.context.seed}:pool:${speakerSlug}:${state.context.turnNumber}`);
  const speaker = state.npcs.get(speakerSlug);
  if (!speaker) return 'idle';

  const weights = speaker.basePoolWeights;
  const pools: Array<{ pool: TemplatePool; weight: number }> = [];

  if (targetSlug) {
    pools.push({ pool: 'npcGreeting', weight: weights.npcGreeting || 15 });
    pools.push({ pool: 'npcReaction', weight: weights.npcReaction || 20 });
    pools.push({ pool: 'npcGossip', weight: weights.npcGossip || 10 });

    const rel = state.relationships.get(speakerSlug, targetSlug);
    if (rel.stats.respect < -30) {
      pools.push({ pool: 'threat', weight: 25 });
    }
    if (rel.stats.familiarity > 50) {
      pools.push({ pool: 'lore', weight: 15 });
    }
  } else {
    pools.push({ pool: 'idle', weight: weights.idle || 20 });
    pools.push({ pool: 'lore', weight: weights.lore || 10 });
    pools.push({ pool: 'greeting', weight: weights.greeting || 15 });
  }

  if (state.context.playerPresent) {
    pools.push({ pool: 'salesPitch', weight: weights.salesPitch || 10 });
    pools.push({ pool: 'hint', weight: weights.hint || 10 });
  }

  const items = pools.map((p) => ({ item: p.pool, weight: p.weight }));
  return rng.randomWeighted(items, 'pool') ?? 'idle';
}

// ============================================
// Turn Execution
// ============================================

export interface TurnResult {
  turn: InteractionTurn;
  state: EngineState;
}

export function executeNPCTurn(
  state: EngineState,
  forceSpeaker?: string,
  forceTarget?: string,
  forcePool?: TemplatePool
): TurnResult | null {
  const speakerSlug = forceSpeaker ?? selectNextSpeaker(state);
  if (!speakerSlug) return null;

  const speaker = state.npcs.get(speakerSlug);
  if (!speaker) return null;

  const targetSlug = forceTarget ?? selectTarget(state, speakerSlug);
  const pool = forcePool ?? selectPool(state, speakerSlug, targetSlug);

  let usageState = state.usageStates.get(speakerSlug);
  if (!usageState) {
    usageState = createUsageState();
    state.usageStates.set(speakerSlug, usageState);
  }

  const relationship = targetSlug
    ? state.relationships.get(speakerSlug, targetSlug)
    : undefined;

  const memory = state.memories.get(speakerSlug);

  const input: SelectionInput = {
    npcSlug: speakerSlug,
    personality: speaker,
    pool,
    context: state.context,
    relationship,
    memory,
    usage: usageState,
    targetNPC: targetSlug ?? undefined,
    variables: targetSlug && state.npcs.get(targetSlug)
      ? { targetName: state.npcs.get(targetSlug)!.identity.name }
      : undefined,
  };

  const result = selectResponse(input);

  if (!result.message) {
    input.pool = 'idle';
    const fallbackResult = selectResponse(input);
    if (!fallbackResult.message) return null;
    result.message = fallbackResult.message;
    result.usedTemplateId = fallbackResult.usedTemplateId;
  }

  if (result.usedTemplateId) {
    state.usageStates.set(
      speakerSlug,
      markTemplateUsed(usageState, result.usedTemplateId, state.context.turnNumber)
    );
  }

  const statChanges: ObservedStatChange[] = [];
  if (result.statChanges.length > 0) {
    for (const change of result.statChanges) {
      if (change.targetNPC && change.stat !== 'mood' && change.stat !== 'opinion') {
        const rel = state.relationships.get(speakerSlug, change.targetNPC);
        const { relationship: updatedRel, change: observedChange } = modifyStat(
          rel,
          change.stat as keyof typeof rel.stats,
          change.change,
          speakerSlug,
          change.reason
        );
        state.relationships.set(speakerSlug, updatedRel);
        statChanges.push(observedChange);
      }

      if (change.stat === 'opinion' && change.targetNPC) {
        const mem = state.memories.get(speakerSlug);
        state.memories.set(updateOpinion(mem, change.targetNPC, change.change));
        statChanges.push(change);
      }
    }
  }

  if (targetSlug) {
    const speakerMemory = state.memories.get(speakerSlug);
    state.memories.set(
      recordConversation(speakerMemory, [speakerSlug, targetSlug])
    );

    const targetMemory = state.memories.get(targetSlug);
    state.memories.set(
      recordConversation(targetMemory, [speakerSlug, targetSlug])
    );

    const rel = state.relationships.get(speakerSlug, targetSlug);
    const { relationship: updatedRel, change: famChange } = modifyStat(
      rel,
      'familiarity',
      2,
      speakerSlug,
      'Had conversation'
    );
    state.relationships.set(speakerSlug, updatedRel);
    statChanges.push(famChange);
  }

  const turn: InteractionTurn = {
    turnNumber: state.context.turnNumber,
    speaker: speakerSlug,
    message: result.message,
    statChanges,
    triggeredEvents: [],
  };

  const newState: EngineState = {
    ...state,
    context: {
      ...state.context,
      turnNumber: state.context.turnNumber + 1,
    },
    turnHistory: [...state.turnHistory, turn],
    allStatChanges: [...state.allStatChanges, ...statChanges],
  };

  return { turn, state: newState };
}

// ============================================
// Player Interjection
// ============================================

export interface PlayerInterjectionResult {
  playerMessage: ChatMessage;
  npcResponses: InteractionTurn[];
  state: EngineState;
}

let playerMessageIdCounter = 0;

export function handlePlayerInterjection(
  state: EngineState,
  playerText: string,
  targetNPC?: string
): PlayerInterjectionResult {
  const playerMessage: ChatMessage = {
    id: `player_${++playerMessageIdCounter}`,
    sender: { type: 'player' },
    targetAudience: targetNPC || 'all',
    content: playerText,
    timestamp: Date.now(),
  };

  const knownNPCs = Array.from(state.npcs.values()).map((n) => n.identity.name);
  const intent = detectIntent(playerText, knownNPCs);

  const npcResponses: InteractionTurn[] = [];
  let currentState = {
    ...state,
    context: {
      ...state.context,
      turnNumber: state.context.turnNumber + 1,
    },
  };

  const respondents: string[] = [];

  if (targetNPC) {
    respondents.push(targetNPC);
  } else {
    const rng = createSeededRng(`${state.context.seed}:playerReact:${state.context.turnNumber}`);

    for (const [slug, npc] of state.npcs) {
      let reactChance = npc.sociability * 0.5;

      if (intent.intent === 'greeting') reactChance += 0.3;

      if (intent.targetNPC === npc.identity.name) reactChance = 1;

      if (rng.random(`react:${slug}`) < reactChance) {
        respondents.push(slug);
      }
    }

    if (respondents.length === 0 && state.npcs.size > 0) {
      respondents.push(rng.randomChoice(Array.from(state.npcs.keys()), 'fallback')!);
    }
  }

  for (const respondentSlug of respondents.slice(0, 3)) {
    const pool = intentToPool(intent.intent, false);

    const result = executeNPCTurn(
      currentState,
      respondentSlug,
      undefined,
      pool === 'playerInterrupt' ? 'reaction' : pool as TemplatePool
    );

    if (result) {
      npcResponses.push(result.turn);
      currentState = result.state;
    }
  }

  return {
    playerMessage,
    npcResponses,
    state: currentState,
  };
}

// ============================================
// Dashboard State Generation
// ============================================

export function generateDashboardState(
  state: EngineState,
  npcSlug: string
): NPCDashboardState | null {
  const npc = state.npcs.get(npcSlug);
  if (!npc) return null;

  const memory = state.memories.get(npcSlug);

  const relationships = state.context.activeNPCs
    .filter((slug) => slug !== npcSlug)
    .map((targetSlug) => {
      const rel = state.relationships.get(npcSlug, targetSlug);
      const targetNPC = state.npcs.get(targetSlug);
      return {
        targetSlug,
        targetName: targetNPC?.identity.name || targetSlug,
        stats: rel.stats,
      };
    });

  const recentChanges = state.allStatChanges
    .filter((c) => c.sourceNPC === npcSlug || c.targetNPC === npcSlug)
    .slice(-10);

  const primaryRel = relationships[0];
  const moodState = primaryRel
    ? deriveMoodState(primaryRel.stats, npc.defaultMood, npc.defaultMood)
    : {
        current: npc.defaultMood,
        intensity: 50,
        trending: 'stable' as const,
      };

  return {
    slug: npcSlug,
    name: npc.identity.name,
    category: npc.identity.category,
    currentMood: moodState,
    relationships,
    recentChanges,
    memory: {
      shortTermCount: memory.shortTerm.length,
      longTermCount: memory.longTerm.length,
      traumaBondCount: Object.keys(memory.traumaBonds).length,
    },
  };
}

// ============================================
// Simulation Runner
// ============================================

export interface SimulationStep {
  turn: InteractionTurn | null;
  dashboardStates: NPCDashboardState[];
}

export function stepSimulation(state: EngineState): {
  step: SimulationStep;
  newState: EngineState;
} {
  const result = executeNPCTurn(state);

  const dashboardStates = Array.from(state.npcs.keys()).map((slug) =>
    generateDashboardState(result?.state || state, slug)
  ).filter((d): d is NPCDashboardState => d !== null);

  return {
    step: {
      turn: result?.turn || null,
      dashboardStates,
    },
    newState: result?.state || state,
  };
}
