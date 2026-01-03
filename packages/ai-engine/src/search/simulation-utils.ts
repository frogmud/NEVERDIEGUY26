/**
 * Simulation Utilities
 *
 * State cloning, turn simulation, and utility functions for the MCTS search.
 * These enable the search tree to explore conversation paths without mutating
 * the real game state.
 */

import type { ResponseTemplate, RelationshipStats, MoodType, TemplatePool } from '../core/types';
import type { NPCBehaviorState, BehavioralState } from '../personality/behavioral-patterns';
import type { ConversationThread, Topic } from '../social/conversation-threading';
import type {
  SimulationSnapshot,
  MemorySnapshot,
  ConversationNode,
  ConversationMove,
  SearchConfig,
} from './search-types';
import { createSeededRng } from '../core/seeded-rng';

// ============================================
// State Cloning
// ============================================

export function cloneSnapshot(snapshot: SimulationSnapshot): SimulationSnapshot {
  return {
    relationships: cloneRelationships(snapshot.relationships),
    memories: cloneMemories(snapshot.memories),
    behaviorStates: cloneBehaviorStates(snapshot.behaviorStates),
    thread: cloneThread(snapshot.thread),
    context: {
      ...snapshot.context,
      activeNPCs: [...snapshot.context.activeNPCs],
      recentEvents: [...(snapshot.context.recentEvents || [])],
    },
    activeNPCs: [...snapshot.activeNPCs],
    moods: cloneMoods(snapshot.moods),
    usedTemplates: cloneUsedTemplates(snapshot.usedTemplates),
    seed: snapshot.seed,
    turnOffset: snapshot.turnOffset + 1,
  };
}

function cloneRelationships(
  original: Map<string, Map<string, RelationshipStats>>
): Map<string, Map<string, RelationshipStats>> {
  const cloned = new Map<string, Map<string, RelationshipStats>>();

  for (const [npcSlug, innerMap] of original) {
    const clonedInner = new Map<string, RelationshipStats>();
    for (const [targetSlug, stats] of innerMap) {
      clonedInner.set(targetSlug, { ...stats });
    }
    cloned.set(npcSlug, clonedInner);
  }

  return cloned;
}

function cloneMemories(
  original: Map<string, MemorySnapshot>
): Map<string, MemorySnapshot> {
  const cloned = new Map<string, MemorySnapshot>();

  for (const [npcSlug, memory] of original) {
    cloned.set(npcSlug, {
      traumaBonds: { ...memory.traumaBonds },
      opinions: { ...memory.opinions },
      recentConversations: memory.recentConversations,
    });
  }

  return cloned;
}

function cloneBehaviorStates(
  original: Map<string, NPCBehaviorState>
): Map<string, NPCBehaviorState> {
  const cloned = new Map<string, NPCBehaviorState>();

  for (const [npcSlug, state] of original) {
    cloned.set(npcSlug, {
      ...state,
      history: state.history ? [...state.history] : [],
    });
  }

  return cloned;
}

function cloneThread(original: ConversationThread): ConversationThread {
  return {
    id: original.id,
    topics: original.topics.map(cloneTopic),
    activeTopic: original.activeTopic,
    turnCount: original.turnCount,
    participants: new Set(original.participants),
    momentum: original.momentum,
    tension: original.tension,
  };
}

function cloneTopic(original: Topic): Topic {
  return {
    ...original,
    participants: [...original.participants],
    relatedTopics: [...original.relatedTopics],
  };
}

function cloneMoods(
  original: Map<string, { current: MoodType; intensity: number }>
): Map<string, { current: MoodType; intensity: number }> {
  const cloned = new Map<string, { current: MoodType; intensity: number }>();

  for (const [npcSlug, mood] of original) {
    cloned.set(npcSlug, { ...mood });
  }

  return cloned;
}

function cloneUsedTemplates(
  original: Map<string, Set<string>>
): Map<string, Set<string>> {
  const cloned = new Map<string, Set<string>>();

  for (const [pool, templates] of original) {
    cloned.set(pool, new Set(templates));
  }

  return cloned;
}

// ============================================
// Single Turn Simulation
// ============================================

export function simulateSingleTurn(
  snapshot: SimulationSnapshot,
  move: ConversationMove
): SimulationSnapshot {
  const newState = cloneSnapshot(snapshot);
  const { template, speaker, target, pool } = move;

  if (template.effects) {
    applyRelationshipEffects(newState, speaker, target, template.effects);
  }

  updateMoodFromTemplate(newState, speaker, template);
  updateThreadState(newState, speaker, template, pool);
  updateBehaviorState(newState, speaker, template);
  trackTemplateUsage(newState, speaker, template.id, pool);

  newState.turnOffset++;

  return newState;
}

function applyRelationshipEffects(
  state: SimulationSnapshot,
  speaker: string,
  target: string | undefined,
  effects: ResponseTemplate['effects']
): void {
  if (!effects || !target) return;

  const speakerRels = state.relationships.get(speaker) || new Map();
  const targetStats = speakerRels.get(target) || createDefaultStats();

  if (effects.respectDelta) {
    targetStats.respect = clamp(targetStats.respect + effects.respectDelta, -100, 100);
  }
  if (effects.trustDelta) {
    targetStats.trust = clamp(targetStats.trust + effects.trustDelta, -100, 100);
  }
  if (effects.familiarityDelta) {
    targetStats.familiarity = clamp(targetStats.familiarity + effects.familiarityDelta, 0, 100);
  }
  if (effects.fearDelta) {
    targetStats.fear = clamp(targetStats.fear + effects.fearDelta, 0, 100);
  }
  if (effects.debtDelta) {
    targetStats.debt = clamp(targetStats.debt + effects.debtDelta, -100, 100);
  }

  speakerRels.set(target, targetStats);
  state.relationships.set(speaker, speakerRels);

  if (effects.reciprocal !== false) {
    const targetRels = state.relationships.get(target) || new Map();
    const speakerStats = targetRels.get(speaker) || createDefaultStats();

    if (effects.familiarityDelta) {
      speakerStats.familiarity = clamp(
        speakerStats.familiarity + effects.familiarityDelta * 0.5,
        0,
        100
      );
    }

    targetRels.set(speaker, speakerStats);
    state.relationships.set(target, targetRels);
  }
}

function createDefaultStats(): RelationshipStats {
  return {
    respect: 0,
    trust: 0,
    familiarity: 0,
    fear: 0,
    debt: 0,
  };
}

function updateMoodFromTemplate(
  state: SimulationSnapshot,
  speaker: string,
  template: ResponseTemplate
): void {
  if (!template.tone) return;

  const currentMood = state.moods.get(speaker) || { current: 'neutral' as MoodType, intensity: 50 };

  const toneToMood: Record<string, { mood: MoodType; intensityDelta: number }> = {
    aggressive: { mood: 'angry', intensityDelta: 15 },
    threatening: { mood: 'angry', intensityDelta: 20 },
    friendly: { mood: 'pleased', intensityDelta: 10 },
    mysterious: { mood: 'neutral', intensityDelta: -5 },
    cryptic: { mood: 'neutral', intensityDelta: 0 },
    curious: { mood: 'curious', intensityDelta: 10 },
    dismissive: { mood: 'annoyed', intensityDelta: 5 },
    helpful: { mood: 'pleased', intensityDelta: 10 },
    fearful: { mood: 'scared', intensityDelta: 15 },
    sad: { mood: 'sad', intensityDelta: 10 },
  };

  const shift = toneToMood[template.tone];
  if (shift) {
    if (Math.abs(shift.intensityDelta) >= 10) {
      currentMood.current = shift.mood;
    }
    currentMood.intensity = clamp(currentMood.intensity + shift.intensityDelta, 0, 100);
  }

  state.moods.set(speaker, currentMood);
}

function updateThreadState(
  state: SimulationSnapshot,
  speaker: string,
  template: ResponseTemplate,
  pool: TemplatePool
): void {
  const thread = state.thread;

  thread.participants.add(speaker);

  const poolMomentum: Partial<Record<TemplatePool, number>> = {
    greeting: 0.6,
    idle: -0.1,
    reaction: 0.2,
    salesPitch: 0.3,
    bargain: 0.4,
    hint: 0.5,
    lore: 0.6,
    threat: 0.7,
    npcReaction: 0.4,
    npcGossip: 0.3,
    npcLore: 0.5,
    npcConflict: 0.8,
    npcAlliance: 0.5,
  };
  const momentumDelta = (poolMomentum[pool] ?? 0) * 0.2;
  thread.momentum = clamp(thread.momentum + momentumDelta, 0, 1);

  if (template.tone === 'threatening' || template.tone === 'aggressive') {
    thread.tension = clamp(thread.tension + 0.15, 0, 1);
  } else if (template.tone === 'friendly' || template.tone === 'helpful') {
    thread.tension = clamp(thread.tension - 0.05, 0, 1);
  }

  if (template.category && thread.topics.length > 0) {
    const activeTopic = thread.topics.find((t) => t.id === thread.activeTopic);
    if (activeTopic) {
      if (activeTopic.category === template.category) {
        activeTopic.depth++;
        activeTopic.exhaustion = clamp(activeTopic.exhaustion + 0.1, 0, 1);
      }
      if (!activeTopic.participants.includes(speaker)) {
        activeTopic.participants.push(speaker);
      }
    }
  }
}

function updateBehaviorState(
  state: SimulationSnapshot,
  speaker: string,
  template: ResponseTemplate
): void {
  const behaviorState = state.behaviorStates.get(speaker);
  if (!behaviorState) return;

  const poolToBehavior: Partial<Record<TemplatePool, BehavioralState>> = {
    threat: 'aggressive',
    bargain: 'trading',
    salesPitch: 'trading',
    hint: 'cautious',
    lore: 'idle',
    npcConflict: 'aggressive',
    npcAlliance: 'guarded',
  };

  const pool = template.pool;
  const newBehavior = pool ? poolToBehavior[pool] : undefined;

  if (newBehavior && newBehavior !== behaviorState.current) {
    if (behaviorState.history && behaviorState.history.length < 10) {
      behaviorState.history.push(behaviorState.current);
    }
    behaviorState.previous = behaviorState.current;
    behaviorState.current = newBehavior;
    behaviorState.turnsInState = 0;
  } else {
    behaviorState.turnsInState = (behaviorState.turnsInState ?? 0) + 1;
  }
}

function trackTemplateUsage(
  state: SimulationSnapshot,
  speaker: string,
  templateId: string,
  pool: TemplatePool
): void {
  const key = `${speaker}:${pool}`;
  const used = state.usedTemplates.get(key) || new Set();
  used.add(templateId);
  state.usedTemplates.set(key, used);
}

// ============================================
// Speaker Selection
// ============================================

export function getNextSpeaker(
  snapshot: SimulationSnapshot,
  rng: () => number
): string | null {
  const { activeNPCs, thread } = snapshot;

  if (activeNPCs.length === 0) return null;
  if (activeNPCs.length === 1) return activeNPCs[0];

  const weights = new Map<string, number>();

  for (const npc of activeNPCs) {
    let weight = 1.0;

    if (thread.topics.length > 0) {
      const lastTopic = thread.topics[thread.topics.length - 1];
      if (lastTopic.participants[lastTopic.participants.length - 1] === npc) {
        weight *= 0.3;
      }
    }

    const activeTopic = thread.topics.find((t) => t.id === thread.activeTopic);
    if (activeTopic?.participants.includes(npc)) {
      weight *= 1.5;
    }

    const mood = snapshot.moods.get(npc);
    if (mood) {
      if (mood.current === 'angry' || mood.current === 'curious') {
        weight *= 1.3;
      } else if (mood.current === 'scared' || mood.current === 'sad') {
        weight *= 0.7;
      }
    }

    const behavior = snapshot.behaviorStates.get(npc);
    if (behavior) {
      if (behavior.current === 'aggressive' || behavior.current === 'engaged') {
        weight *= 1.4;
      } else if (behavior.current === 'fleeing' || behavior.current === 'idle') {
        weight *= 0.6;
      }
    }

    weights.set(npc, Math.max(0.1, weight));
  }

  const totalWeight = Array.from(weights.values()).reduce((a, b) => a + b, 0);
  let roll = rng() * totalWeight;

  for (const [npc, weight] of weights) {
    roll -= weight;
    if (roll <= 0) {
      return npc;
    }
  }

  return activeNPCs[0];
}

export function getNextPool(
  snapshot: SimulationSnapshot,
  speaker: string,
  rng: () => number
): TemplatePool {
  const { thread, moods, behaviorStates } = snapshot;
  const behavior = behaviorStates.get(speaker);
  const mood = moods.get(speaker);

  const poolWeights: Partial<Record<TemplatePool, number>> = {
    greeting: 0,
    idle: 0.2,
    reaction: 0.1,
    salesPitch: 0,
    bargain: 0,
    hint: 0.1,
    lore: 0.15,
    threat: 0,
    npcReaction: 0.15,
    npcGossip: 0.2,
    npcLore: 0.1,
    npcConflict: 0,
    npcAlliance: 0,
  };

  if (thread.tension > 0.6) {
    poolWeights.threat = 0.3;
    poolWeights.npcConflict = 0.25;
    poolWeights.npcGossip = 0.05;
    poolWeights.idle = 0.05;
  } else if (thread.tension < 0.3) {
    poolWeights.npcAlliance = 0.15;
    poolWeights.npcGossip = 0.3;
    poolWeights.idle = 0.15;
  }

  if (mood) {
    if (mood.current === 'angry') {
      poolWeights.threat = (poolWeights.threat || 0) + 0.2;
      poolWeights.npcConflict = (poolWeights.npcConflict || 0) + 0.15;
    } else if (mood.current === 'curious') {
      poolWeights.lore = (poolWeights.lore || 0) + 0.2;
      poolWeights.npcLore = (poolWeights.npcLore || 0) + 0.15;
    } else if (mood.current === 'pleased') {
      poolWeights.npcAlliance = (poolWeights.npcAlliance || 0) + 0.2;
      poolWeights.npcGossip = (poolWeights.npcGossip || 0) + 0.1;
    }
  }

  if (behavior) {
    if (behavior.current === 'trading') {
      poolWeights.salesPitch = 0.3;
      poolWeights.bargain = 0.25;
    } else if (behavior.current === 'aggressive') {
      poolWeights.threat = (poolWeights.threat || 0) + 0.25;
    }
  }

  const pools = Object.keys(poolWeights) as TemplatePool[];
  const totalWeight = Object.values(poolWeights).reduce((a, b) => (a ?? 0) + (b ?? 0), 0) ?? 0;
  let roll = rng() * totalWeight;

  for (const pool of pools) {
    roll -= poolWeights[pool] ?? 0;
    if (roll <= 0) {
      return pool;
    }
  }

  return 'idle';
}

// ============================================
// Terminal State Detection
// ============================================

export function isTerminal(node: ConversationNode, config: SearchConfig): boolean {
  if (node.depth >= config.maxDepth) {
    return true;
  }

  if (node.state.activeNPCs.length === 0) {
    return true;
  }

  if (node.state.thread.momentum < 0.1) {
    return true;
  }

  const activeTopic = node.state.thread.topics.find(
    (t) => t.id === node.state.thread.activeTopic
  );
  if (activeTopic && activeTopic.exhaustion >= 1.0) {
    const hasAlternatives = node.state.thread.topics.some(
      (t) => t.id !== activeTopic.id && t.exhaustion < 0.8
    );
    if (!hasAlternatives) {
      return true;
    }
  }

  return false;
}

export function isInterestingState(snapshot: SimulationSnapshot): boolean {
  if (snapshot.thread.tension > 0.8) {
    return true;
  }

  if (snapshot.thread.participants.size >= 4) {
    return true;
  }

  const activeTopic = snapshot.thread.topics.find(
    (t) => t.id === snapshot.thread.activeTopic
  );
  if (activeTopic && activeTopic.depth >= 5) {
    return true;
  }

  return false;
}

// ============================================
// State Hashing
// ============================================

export function hashState(snapshot: SimulationSnapshot): string {
  const parts: string[] = [];

  parts.push(`t:${snapshot.thread.activeTopic || 'none'}`);
  parts.push(`m:${Math.round(snapshot.thread.momentum * 10)}`);
  parts.push(`x:${Math.round(snapshot.thread.tension * 10)}`);

  const moodParts: string[] = [];
  for (const npc of snapshot.activeNPCs.sort()) {
    const mood = snapshot.moods.get(npc);
    if (mood) {
      moodParts.push(`${npc}:${mood.current}`);
    }
  }
  parts.push(`moods:[${moodParts.join(',')}]`);

  const behaviorParts: string[] = [];
  for (const npc of snapshot.activeNPCs.sort()) {
    const behavior = snapshot.behaviorStates.get(npc);
    if (behavior) {
      behaviorParts.push(`${npc}:${behavior.current}`);
    }
  }
  parts.push(`behaviors:[${behaviorParts.join(',')}]`);

  parts.push(`turn:${snapshot.turnOffset}`);

  return parts.join('|');
}

export function fastHash(snapshot: SimulationSnapshot): number {
  let hash = 0;

  const str = `${snapshot.thread.activeTopic}${snapshot.turnOffset}`;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }

  hash ^= Math.round(snapshot.thread.tension * 100);
  hash ^= Math.round(snapshot.thread.momentum * 100) << 8;

  return hash;
}

// ============================================
// Candidate Move Generation
// ============================================

export function generateCandidateMoves(
  snapshot: SimulationSnapshot,
  templates: ResponseTemplate[],
  maxCandidates: number,
  rng: () => number
): ConversationMove[] {
  const candidates: ConversationMove[] = [];

  const speaker = getNextSpeaker(snapshot, rng);
  if (!speaker) return candidates;

  const pool = getNextPool(snapshot, speaker, rng);

  const validTemplates = templates.filter((t) => {
    if (t.npcSlug && t.npcSlug !== speaker) return false;
    if (t.pool && t.pool !== pool) return false;

    const usedKey = `${speaker}:${pool}`;
    const used = snapshot.usedTemplates.get(usedKey);
    if (used?.has(t.id)) return false;

    if (t.moodRequirement) {
      const mood = snapshot.moods.get(speaker);
      if (!mood || mood.current !== t.moodRequirement) return false;
    }

    if (t.relationshipRequirement) {
      const req = t.relationshipRequirement;
      const target = snapshot.activeNPCs.find((n) => n !== speaker);
      if (target) {
        const rels = snapshot.relationships.get(speaker)?.get(target);
        if (rels) {
          const stat = req.stat as keyof RelationshipStats;
          const value = rels[stat] as number;
          if (req.min !== undefined && value < req.min) return false;
          if (req.max !== undefined && value > req.max) return false;
        }
      }
    }

    return true;
  });

  const scored = validTemplates.map((t) => ({
    template: t,
    score: scoreTemplateForState(t, snapshot, speaker, rng),
  }));
  scored.sort((a, b) => b.score - a.score);

  const topTemplates = scored.slice(0, maxCandidates);

  for (const { template } of topTemplates) {
    let target: string | undefined;
    if (template.targetType === 'player') {
      target = 'player';
    } else if (template.targetType === 'npc') {
      target = snapshot.activeNPCs.find((n) => n !== speaker);
    }

    candidates.push({
      template,
      speaker,
      target,
      pool,
    });
  }

  return candidates;
}

function scoreTemplateForState(
  template: ResponseTemplate,
  snapshot: SimulationSnapshot,
  speaker: string,
  rng: () => number
): number {
  let score = template.weight || 1;

  const mood = snapshot.moods.get(speaker);
  if (mood && template.moodBonus) {
    if (template.moodBonus.includes(mood.current)) {
      score *= 1.5;
    }
  }

  if (template.tensionRange) {
    const tension = snapshot.thread.tension;
    if (tension >= template.tensionRange.min && tension <= template.tensionRange.max) {
      score *= 1.3;
    }
  }

  const activeTopic = snapshot.thread.topics.find(
    (t) => t.id === snapshot.thread.activeTopic
  );
  if (activeTopic && template.category === activeTopic.category) {
    score *= 1.4;
  }

  score *= 0.9 + rng() * 0.2;

  return score;
}

// ============================================
// Snapshot Creation from Engine State
// ============================================

export function createSnapshotFromEngineState(
  relationships: Map<string, Map<string, RelationshipStats>>,
  memories: Map<string, MemorySnapshot>,
  behaviorStates: Map<string, NPCBehaviorState>,
  thread: ConversationThread,
  context: SimulationSnapshot['context'],
  moods: Map<string, { current: MoodType; intensity: number }>,
  seed: string
): SimulationSnapshot {
  return {
    relationships: cloneRelationships(relationships),
    memories: cloneMemories(memories),
    behaviorStates: cloneBehaviorStates(behaviorStates),
    thread: cloneThread(thread),
    context: {
      ...context,
      activeNPCs: [...context.activeNPCs],
      recentEvents: [...(context.recentEvents || [])],
    },
    activeNPCs: [...context.activeNPCs],
    moods: cloneMoods(moods),
    usedTemplates: new Map(),
    seed,
    turnOffset: 0,
  };
}

// ============================================
// Utility Functions
// ============================================

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function createNodeRng(
  snapshot: SimulationSnapshot,
  nodeId: string
): ReturnType<typeof createSeededRng> {
  const seed = `${snapshot.seed}:${snapshot.turnOffset}:${nodeId}`;
  return createSeededRng(seed);
}

export function estimateStateComplexity(snapshot: SimulationSnapshot): number {
  let complexity = 1.0;

  complexity *= 1 + snapshot.activeNPCs.length * 0.2;

  if (snapshot.thread.tension > 0.5) {
    complexity *= 1.3;
  }

  const activeTopic = snapshot.thread.topics.find(
    (t) => t.id === snapshot.thread.activeTopic
  );
  if (activeTopic && activeTopic.depth > 3) {
    complexity *= 1.2;
  }

  return complexity;
}
