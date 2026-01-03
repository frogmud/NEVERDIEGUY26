/**
 * Enhanced Interaction Engine
 *
 * Extends the base interaction engine with advanced systems:
 * - Personality dynamics with quirks and triggers
 * - Social graph for pre-existing relationships
 * - Knowledge system for secrets and gossip
 * - Mood contagion between NPCs
 * - Conversation threading for topic continuity
 * - Behavioral state machines
 */

import type {
  NPCPersonality,
  SimulationContext,
  InteractionTurn,
  MoodType,
  TemplatePool,
  NPCDashboardState,
  ObservedStatChange,
} from './types';
import { createSeededRng } from './seeded-rng';
import {
  createRelationshipStore,
  modifyStat,
  deriveMoodState,
  type RelationshipStore,
} from './relationship';
import {
  createMemoryStore,
  recordConversation,
  updateOpinion,
  getOpinion,
  type MemoryStore,
} from './memory';
import {
  selectResponse,
  createUsageState,
  markTemplateUsed,
  type SelectionInput,
} from './response-selector';
import { detectIntent, intentToPool } from './intent-detector';

import {
  applyQuirks,
  detectTriggers,
  type EmotionalTrigger,
} from '../personality/personality-dynamics';
import {
  getRelationshipFromGraph,
  getRelationshipDescription,
} from '../social/social-graph';
import {
  getNPCKnowledge,
  getGossipTopics,
  canShare,
  transferKnowledge,
  type KnowledgePiece,
} from '../social/knowledge-system';
import {
  calculateSusceptibility,
  simulateMoodSpread,
  analyzeGroupMood,
  type GroupMoodState,
} from '../personality/mood-contagion';
import {
  createThread,
  startTopic,
  advanceTopic,
  detectTopicFromMessage,
  suggestNextTopic,
  shouldChangeTopic,
  getTopicResponseHint,
  DEFAULT_TOPIC_AFFINITIES,
  type ConversationThread,
} from '../social/conversation-threading';
import {
  createBehaviorState,
  evaluateTransition,
  transitionState,
  reactToEvent,
  getStateModifiers,
  type NPCBehaviorState,
  type TransitionContext,
  type BehavioralEvent,
} from '../personality/behavioral-patterns';
import {
  ENHANCED_PROFILES,
  getEnhancedProfile,
  type EnhancedNPCProfile,
} from '../npcs/npc-enhancements';

// ============================================
// Enhanced Engine State
// ============================================

export interface EnhancedEngineState {
  npcs: Map<string, NPCPersonality>;
  relationships: RelationshipStore;
  memories: MemoryStore;
  context: SimulationContext;
  usageStates: Map<string, ReturnType<typeof createUsageState>>;
  allStatChanges: ObservedStatChange[];
  turnHistory: InteractionTurn[];

  behaviorStates: Map<string, NPCBehaviorState>;
  thread: ConversationThread;
  groupMood: GroupMoodState;
  knowledgeTransfers: Array<{ from: string; to: string; knowledge: string; turn: number }>;
  triggeredEvents: Array<{ npc: string; trigger: EmotionalTrigger; turn: number }>;
  gossipQueue: Array<{ npc: string; knowledge: KnowledgePiece }>;
}

export function createEnhancedEngineState(
  npcs: NPCPersonality[],
  seed: string
): EnhancedEngineState {
  const npcMap = new Map<string, NPCPersonality>();
  const behaviorStates = new Map<string, NPCBehaviorState>();

  for (const npc of npcs) {
    npcMap.set(npc.identity.slug, npc);

    const profile = getEnhancedProfile(npc.identity.slug);
    if (profile) {
      behaviorStates.set(npc.identity.slug, createBehaviorState(profile.archetype));
    } else {
      behaviorStates.set(npc.identity.slug, createBehaviorState('diplomat'));
    }
  }

  const relationships = createRelationshipStore();
  for (const npc of npcs) {
    for (const otherNpc of npcs) {
      if (npc.identity.slug === otherNpc.identity.slug) continue;

      const graphRel = getRelationshipFromGraph(npc.identity.slug, otherNpc.identity.slug);
      if (graphRel) {
        const rel = relationships.get(npc.identity.slug, otherNpc.identity.slug);
        rel.stats = { ...rel.stats, ...graphRel.baseStats };
        relationships.set(npc.identity.slug, rel);
      }
    }
  }

  const slugs = npcs.map(n => n.identity.slug);
  const thread = createThread(slugs[0] || 'system');

  return {
    npcs: npcMap,
    relationships,
    memories: createMemoryStore(),
    context: {
      seed,
      turnNumber: 0,
      activeNPCs: slugs,
      playerPresent: true,
      location: 'Market Square',
      recentEvents: [],
    },
    usageStates: new Map(),
    allStatChanges: [],
    turnHistory: [],
    behaviorStates,
    thread,
    groupMood: analyzeGroupMood([]),
    knowledgeTransfers: [],
    triggeredEvents: [],
    gossipQueue: [],
  };
}

// ============================================
// Enhanced Turn Selection
// ============================================

function selectNextSpeakerEnhanced(
  state: EnhancedEngineState,
  excludeSlugs: string[] = []
): string | null {
  const rng = createSeededRng(`${state.context.seed}:speaker:${state.context.turnNumber}`);

  const candidates = state.context.activeNPCs.filter(
    (slug) => !excludeSlugs.includes(slug)
  );

  if (candidates.length === 0) return null;

  const weighted = candidates.map((slug) => {
    const npc = state.npcs.get(slug);
    const behaviorState = state.behaviorStates.get(slug);
    const profile = getEnhancedProfile(slug);
    if (!npc) return { slug, weight: 0 };

    let weight = npc.sociability * 100;

    if (behaviorState) {
      const modifiers = getStateModifiers(behaviorState.current);
      weight *= (1 + modifiers.sociabilityMod);
    }

    if (state.gossipQueue.some(g => g.npc === slug)) {
      weight += 40;
    }

    if (profile) {
      const active = state.thread.topics.find(t => t.id === state.thread.activeTopic);
      if (active && profile.topicAffinity.expertise.includes(active.category)) {
        weight += 30;
      }
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

function selectTargetEnhanced(
  state: EnhancedEngineState,
  speakerSlug: string
): string | null {
  const rng = createSeededRng(`${state.context.seed}:target:${speakerSlug}:${state.context.turnNumber}`);

  const candidates = state.context.activeNPCs.filter((slug) => slug !== speakerSlug);
  if (candidates.length === 0) return null;

  const speaker = state.npcs.get(speakerSlug);
  const speakerProfile = getEnhancedProfile(speakerSlug);
  if (!speaker) return null;

  const weighted = candidates.map((targetSlug) => {
    let weight = 50;

    const graphRel = getRelationshipFromGraph(speakerSlug, targetSlug);
    if (graphRel) {
      weight += graphRel.strength * 5;
      if (graphRel.type === 'enemies' || graphRel.type === 'rivals') {
        weight += 20;
      }
    }

    const speakerKnowledge = getNPCKnowledge(speakerSlug);
    const targetKnowledge = getNPCKnowledge(targetSlug);
    const sharedTopics = speakerKnowledge.filter(k =>
      targetKnowledge.some(tk => tk.id === k.id)
    );
    weight += sharedTopics.length * 5;

    const rel = state.relationships.get(speakerSlug, targetSlug);
    weight += Math.abs(rel.stats.respect) * 0.3;
    weight += rel.stats.familiarity * 0.2;

    return { slug: targetSlug, weight };
  });

  const items = weighted.map((w) => ({ item: w.slug, weight: Math.max(1, w.weight) }));
  return rng.randomWeighted(items, 'target') ?? null;
}

function selectPoolEnhanced(
  state: EnhancedEngineState,
  speakerSlug: string,
  targetSlug: string | null
): TemplatePool {
  const rng = createSeededRng(`${state.context.seed}:pool:${speakerSlug}:${state.context.turnNumber}`);
  const speaker = state.npcs.get(speakerSlug);
  const profile = getEnhancedProfile(speakerSlug);
  const behaviorState = state.behaviorStates.get(speakerSlug);
  if (!speaker) return 'idle';

  const weights = speaker.basePoolWeights;
  const pools: Array<{ pool: TemplatePool; weight: number }> = [];

  if (profile) {
    const hint = getTopicResponseHint(state.thread, profile.topicAffinity);
    for (const pref of hint.poolPreference) {
      pools.push({ pool: pref as TemplatePool, weight: 25 });
    }
  }

  if (behaviorState) {
    const modifiers = getStateModifiers(behaviorState.current);
    for (const [pool, bias] of Object.entries(modifiers.responseBias)) {
      pools.push({ pool: pool as TemplatePool, weight: bias ?? 0 });
    }
  }

  const pendingGossip = state.gossipQueue.find(g => g.npc === speakerSlug);
  if (pendingGossip) {
    pools.push({ pool: 'npcGossip', weight: 40 });
  }

  if (targetSlug) {
    pools.push({ pool: 'npcGreeting', weight: weights.npcGreeting || 15 });
    pools.push({ pool: 'npcReaction', weight: weights.npcReaction || 20 });
    pools.push({ pool: 'npcGossip', weight: weights.npcGossip || 10 });

    const rel = state.relationships.get(speakerSlug, targetSlug);
    if (rel.stats.respect < -30) {
      pools.push({ pool: 'threat', weight: 30 });
    }
  } else {
    pools.push({ pool: 'idle', weight: weights.idle || 20 });
    pools.push({ pool: 'lore', weight: weights.lore || 10 });
  }

  if (pools.length === 0) {
    pools.push({ pool: 'idle', weight: 50 });
  }

  const items = pools.map((p) => ({ item: p.pool, weight: p.weight }));
  return rng.randomWeighted(items, 'pool') ?? 'idle';
}

// ============================================
// Enhanced Turn Execution
// ============================================

export interface EnhancedTurnResult {
  turn: InteractionTurn;
  state: EnhancedEngineState;
  moodSpread?: { from: string; to: string; mood: MoodType }[];
  knowledgeShared?: { piece: KnowledgePiece; recipient: string }[];
  triggersActivated?: EmotionalTrigger[];
  behaviorTransition?: { from: string; to: string };
}

export function executeEnhancedTurn(
  state: EnhancedEngineState,
  forceSpeaker?: string,
  forceTarget?: string,
  forcePool?: TemplatePool
): EnhancedTurnResult | null {
  const speakerSlug = forceSpeaker ?? selectNextSpeakerEnhanced(state);
  if (!speakerSlug) return null;

  const speaker = state.npcs.get(speakerSlug);
  const profile = getEnhancedProfile(speakerSlug);
  if (!speaker) return null;

  const rng = createSeededRng(`${state.context.seed}:turn:${state.context.turnNumber}`);

  const targetSlug = forceTarget ?? selectTargetEnhanced(state, speakerSlug);
  const pool = forcePool ?? selectPoolEnhanced(state, speakerSlug, targetSlug);

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

  let result = selectResponse(input);

  if (!result.message) {
    input.pool = 'idle';
    const fallbackResult = selectResponse(input);
    if (!fallbackResult.message) return null;
    result = fallbackResult;
  }

  let finalMessage = result.message!;
  if (profile && profile.quirks.length > 0) {
    const modifiedContent = applyQuirks(result.message!.content, profile.quirks, () => rng.random('quirk'));
    finalMessage = { ...result.message!, content: modifiedContent };
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
    state.memories.set(recordConversation(speakerMemory, [speakerSlug, targetSlug]));

    const targetMemory = state.memories.get(targetSlug);
    state.memories.set(recordConversation(targetMemory, [speakerSlug, targetSlug]));

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

  // Enhanced features
  const detectedTopic = detectTopicFromMessage(finalMessage.content);
  let updatedThread = state.thread;

  if (detectedTopic && !updatedThread.activeTopic) {
    updatedThread = startTopic(updatedThread, detectedTopic, speakerSlug);
  } else if (updatedThread.activeTopic) {
    const contribution = statChanges.some(c => c.change > 0) ? 'positive' :
                         statChanges.some(c => c.change < 0) ? 'negative' : 'neutral';
    updatedThread = advanceTopic(updatedThread, speakerSlug, contribution);

    if (shouldChangeTopic(updatedThread) && profile) {
      const nextTopic = suggestNextTopic(
        updatedThread,
        speakerSlug,
        profile.topicAffinity,
        () => rng.random('topic')
      );
      if (nextTopic) {
        updatedThread = startTopic(updatedThread, nextTopic, speakerSlug);
      }
    }
  }

  const moodSpread: { from: string; to: string; mood: MoodType }[] = [];
  const currentMood = deriveMoodState(
    relationship?.stats || { respect: 0, familiarity: 0, trust: 0, fear: 0, debt: 0 },
    speaker.defaultMood,
    speaker.defaultMood
  );

  if (targetSlug && currentMood.intensity > 60) {
    const targets = state.context.activeNPCs
      .filter(slug => slug !== speakerSlug)
      .map(slug => {
        const targetNpc = state.npcs.get(slug);
        if (!targetNpc) return null;

        const rel = state.relationships.get(speakerSlug, slug);
        const susceptibility = calculateSusceptibility(
          targetNpc.defaultMood,
          currentMood.current,
          rel.stats.trust,
          rel.stats.familiarity,
          targetNpc.sociability,
          0
        );

        return {
          slug,
          mood: targetNpc.defaultMood,
          intensity: 50,
          susceptibility,
        };
      })
      .filter((t): t is NonNullable<typeof t> => t !== null);

    const spreadResult = simulateMoodSpread(
      { slug: speakerSlug, mood: currentMood.current, intensity: currentMood.intensity },
      targets,
      () => rng.random('spread')
    );

    for (const affected of spreadResult.affectedNPCs) {
      moodSpread.push({
        from: speakerSlug,
        to: affected.slug,
        mood: affected.newMood,
      });
    }

    state.groupMood = spreadResult.groupMood;
  }

  const knowledgeShared: { piece: KnowledgePiece; recipient: string }[] = [];
  if (targetSlug && pool === 'npcGossip') {
    const speakerKnowledge = getNPCKnowledge(speakerSlug);
    const targetRel = state.relationships.get(speakerSlug, targetSlug);

    for (const knowledge of speakerKnowledge) {
      if (canShare(speakerSlug, knowledge.id, targetRel.stats.trust, () => rng.random('knowledge'))) {
        transferKnowledge(speakerSlug, targetSlug, knowledge.id);
        knowledgeShared.push({ piece: knowledge, recipient: targetSlug });
        state.knowledgeTransfers.push({
          from: speakerSlug,
          to: targetSlug,
          knowledge: knowledge.id,
          turn: state.context.turnNumber,
        });
      }
    }

    state.gossipQueue = state.gossipQueue.filter(g => g.npc !== speakerSlug);
  }

  const triggersActivated: EmotionalTrigger[] = [];
  if (profile && profile.triggers.length > 0 && targetSlug) {
    const activated = detectTriggers(finalMessage.content, speakerSlug, profile.triggers);
    triggersActivated.push(...activated);

    for (const trigger of activated) {
      state.triggeredEvents.push({
        npc: speakerSlug,
        trigger,
        turn: state.context.turnNumber,
      });

      if (trigger.reaction?.statEffects) {
        for (const effect of trigger.reaction.statEffects) {
          if (targetSlug) {
            const rel = state.relationships.get(speakerSlug, targetSlug);
            const { relationship: updatedRel, change: effectChange } = modifyStat(
              rel,
              effect.stat as keyof typeof rel.stats,
              effect.change,
              speakerSlug,
              `Trigger: ${trigger.type}`
            );
            state.relationships.set(speakerSlug, updatedRel);
            statChanges.push(effectChange);
          }
        }
      }
    }
  }

  let behaviorTransition: { from: string; to: string } | undefined;
  const behaviorState = state.behaviorStates.get(speakerSlug);
  if (behaviorState && profile) {
    const transitionContext: TransitionContext = {
      turnCount: state.context.turnNumber,
      currentMood: currentMood.current,
      relationship: relationship?.stats || { respect: 0, familiarity: 0, trust: 0, fear: 0, debt: 0 },
      messageIntent: pool,
      presentNPCs: state.context.activeNPCs,
      presentCategories: [...new Set(
        state.context.activeNPCs
          .map(slug => state.npcs.get(slug)?.identity.category)
          .filter((c): c is NonNullable<typeof c> => !!c)
      )],
      tension: updatedThread.tension,
    };

    const newState = evaluateTransition(behaviorState, transitionContext, () => rng.random('behavior'));
    if (newState && newState !== behaviorState.current) {
      behaviorTransition = { from: behaviorState.current, to: newState };
      state.behaviorStates.set(
        speakerSlug,
        transitionState(behaviorState, newState, state.context.turnNumber)
      );
    }
  }

  const gossipTopics = getGossipTopics(speakerSlug);
  if (gossipTopics.length > 0 && rng.random('gossip-queue') < 0.3) {
    const topic = gossipTopics[Math.floor(rng.random('gossip-select') * gossipTopics.length)];
    if (!state.gossipQueue.some(g => g.npc === speakerSlug)) {
      state.gossipQueue.push({ npc: speakerSlug, knowledge: topic });
    }
  }

  const turn: InteractionTurn = {
    turnNumber: state.context.turnNumber,
    speaker: speakerSlug,
    message: finalMessage,
    statChanges,
    triggeredEvents: triggersActivated.map(t => t.type),
  };

  const newState: EnhancedEngineState = {
    ...state,
    context: {
      ...state.context,
      turnNumber: state.context.turnNumber + 1,
    },
    turnHistory: [...state.turnHistory, turn],
    allStatChanges: [...state.allStatChanges, ...statChanges],
    thread: updatedThread,
  };

  return {
    turn,
    state: newState,
    moodSpread: moodSpread.length > 0 ? moodSpread : undefined,
    knowledgeShared: knowledgeShared.length > 0 ? knowledgeShared : undefined,
    triggersActivated: triggersActivated.length > 0 ? triggersActivated : undefined,
    behaviorTransition,
  };
}

// ============================================
// Enhanced Dashboard
// ============================================

export interface EnhancedDashboardState extends NPCDashboardState {
  behaviorState: string;
  archetype: string;
  knownSecrets: number;
  pendingGossip: boolean;
  socialConnections: Array<{
    target: string;
    relationshipType: string;
    strength: number;
  }>;
  activeTriggers: string[];
}

export function generateEnhancedDashboard(
  state: EnhancedEngineState,
  npcSlug: string
): EnhancedDashboardState | null {
  const npc = state.npcs.get(npcSlug);
  if (!npc) return null;

  const memory = state.memories.get(npcSlug);
  const profile = getEnhancedProfile(npcSlug);
  const behaviorState = state.behaviorStates.get(npcSlug);
  const knowledge = getNPCKnowledge(npcSlug);

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
    : { current: npc.defaultMood, intensity: 50, trending: 'stable' as const };

  const socialConnections = state.context.activeNPCs
    .filter(slug => slug !== npcSlug)
    .map(targetSlug => {
      const graphRel = getRelationshipFromGraph(npcSlug, targetSlug);
      if (!graphRel) return null;
      return {
        target: targetSlug,
        relationshipType: graphRel.type,
        strength: graphRel.strength,
      };
    })
    .filter((c): c is NonNullable<typeof c> => c !== null);

  const activeTriggers = state.triggeredEvents
    .filter(t => t.npc === npcSlug && t.turn >= state.context.turnNumber - 5)
    .map(t => t.trigger.type);

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
    behaviorState: behaviorState?.current || 'idle',
    archetype: profile?.archetype || 'diplomat',
    knownSecrets: knowledge.filter(k => k.category === 'secret').length,
    pendingGossip: state.gossipQueue.some(g => g.npc === npcSlug),
    socialConnections,
    activeTriggers: [...new Set(activeTriggers)],
  };
}

// ============================================
// Enhanced Simulation Step
// ============================================

export interface EnhancedSimulationStep {
  turn: InteractionTurn | null;
  dashboardStates: EnhancedDashboardState[];
  groupMood: GroupMoodState;
  threadSummary: {
    activeTopic: string | null;
    momentum: number;
    tension: number;
  };
  events: {
    moodSpread: { from: string; to: string; mood: MoodType }[];
    knowledgeShared: { knowledge: string; from: string; to: string }[];
    triggersActivated: { npc: string; trigger: string }[];
    behaviorTransitions: { npc: string; from: string; to: string }[];
  };
}

export function stepEnhancedSimulation(state: EnhancedEngineState): {
  step: EnhancedSimulationStep;
  newState: EnhancedEngineState;
} {
  const result = executeEnhancedTurn(state);

  const newState = result?.state || state;

  const dashboardStates = Array.from(newState.npcs.keys())
    .map((slug) => generateEnhancedDashboard(newState, slug))
    .filter((d): d is EnhancedDashboardState => d !== null);

  const activeTopic = newState.thread.topics.find(t => t.id === newState.thread.activeTopic);

  return {
    step: {
      turn: result?.turn || null,
      dashboardStates,
      groupMood: newState.groupMood,
      threadSummary: {
        activeTopic: activeTopic?.subject || null,
        momentum: newState.thread.momentum,
        tension: newState.thread.tension,
      },
      events: {
        moodSpread: result?.moodSpread || [],
        knowledgeShared: (result?.knowledgeShared || []).map(k => ({
          knowledge: k.piece.shortForm,
          from: result!.turn.speaker,
          to: k.recipient,
        })),
        triggersActivated: (result?.triggersActivated || []).map(t => ({
          npc: result!.turn.speaker,
          trigger: t.type,
        })),
        behaviorTransitions: result?.behaviorTransition
          ? [{ npc: result.turn.speaker, ...result.behaviorTransition }]
          : [],
      },
    },
    newState,
  };
}

// ============================================
// Event Handling
// ============================================

export function handleBehavioralEvent(
  state: EnhancedEngineState,
  event: BehavioralEvent,
  affectedNPC: string
): EnhancedEngineState {
  const profile = getEnhancedProfile(affectedNPC);
  const behaviorState = state.behaviorStates.get(affectedNPC);

  if (!profile || !behaviorState) return state;

  const reaction = reactToEvent(behaviorState, event, profile.archetype);

  let newState = { ...state };

  if (reaction.stateChange) {
    newState.behaviorStates.set(
      affectedNPC,
      transitionState(behaviorState, reaction.stateChange, state.context.turnNumber)
    );
  }

  if (reaction.relationshipChanges) {
    for (const change of reaction.relationshipChanges) {
      const rel = newState.relationships.get(affectedNPC, change.slug);
      const { relationship: updatedRel } = modifyStat(
        rel,
        change.stat,
        change.change,
        affectedNPC,
        `Event: ${event.type}`
      );
      newState.relationships.set(affectedNPC, updatedRel);
    }
  }

  return newState;
}
