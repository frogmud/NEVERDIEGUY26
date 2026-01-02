/**
 * NPC Goals System
 *
 * Defines what NPCs want to achieve in conversations.
 * Used by the search engine to evaluate conversation paths.
 */

import type { RelationshipStats } from '../core/types';
import type { BehavioralArchetype } from '../personality/behavioral-patterns';
import type {
  NPCGoal,
  NPCObjectives,
  GoalCondition,
  SimulationSnapshot,
  EvaluationScore,
  EvaluationContext,
  SearchConfig,
} from './search-types';

// ============================================
// Default Goals by Archetype
// ============================================

const ARCHETYPE_GOALS: Record<BehavioralArchetype, Partial<NPCObjectives>> = {
  predator: {
    primary: [
      { type: 'maximize_fear', priority: 80 },
      { type: 'control_conversation', priority: 70 },
      { type: 'maintain_mystery', priority: 60 },
    ],
    secondary: [
      { type: 'maximize_respect', priority: 50 },
      { type: 'provoke_conflict', priority: 40 },
    ],
  },
  prey: {
    primary: [
      { type: 'minimize_fear', priority: 90 },
      { type: 'decrease_tension', priority: 70 },
    ],
    secondary: [
      { type: 'create_alliance', priority: 60 },
      { type: 'gather_information', priority: 50 },
    ],
  },
  merchant: {
    primary: [
      { type: 'maximize_trust', priority: 80 },
      { type: 'extract_debt', priority: 70 },
      { type: 'maximize_familiarity', priority: 60 },
    ],
    secondary: [
      { type: 'share_knowledge', priority: 40 },
      { type: 'create_alliance', priority: 30 },
    ],
  },
  sage: {
    primary: [
      { type: 'share_knowledge', priority: 80 },
      { type: 'maintain_mystery', priority: 70 },
      { type: 'deepen_topic', priority: 60 },
    ],
    secondary: [
      { type: 'maximize_respect', priority: 50 },
      { type: 'gather_information', priority: 40 },
    ],
  },
  warrior: {
    primary: [
      { type: 'maximize_respect', priority: 80 },
      { type: 'maximize_fear', priority: 60 },
    ],
    secondary: [
      { type: 'protect_ally', priority: 70 },
      { type: 'control_conversation', priority: 40 },
    ],
  },
  diplomat: {
    primary: [
      { type: 'decrease_tension', priority: 80 },
      { type: 'create_alliance', priority: 70 },
      { type: 'resolve_conflict', priority: 60 },
    ],
    secondary: [
      { type: 'maximize_trust', priority: 50 },
      { type: 'maximize_familiarity', priority: 40 },
    ],
  },
  trickster: {
    primary: [
      { type: 'entertain_self', priority: 80 },
      { type: 'provoke_conflict', priority: 60 },
      { type: 'change_topic', priority: 50 },
    ],
    secondary: [
      { type: 'spread_rumor', priority: 40 },
      { type: 'increase_tension', priority: 30 },
    ],
  },
  opportunist: {
    primary: [
      { type: 'extract_debt', priority: 80 },
      { type: 'gather_information', priority: 70 },
    ],
    secondary: [
      { type: 'maximize_trust', priority: 50 },
      { type: 'undermine_enemy', priority: 40 },
    ],
  },
  guardian: {
    primary: [
      { type: 'protect_ally', priority: 90 },
      { type: 'decrease_tension', priority: 60 },
    ],
    secondary: [
      { type: 'maximize_fear', priority: 50, activeWhen: [{ type: 'tension', comparison: 'gt', value: 0.5 }] },
      { type: 'hide_knowledge', priority: 40 },
    ],
  },
  loyalist: {
    primary: [
      { type: 'protect_ally', priority: 80 },
      { type: 'maximize_trust', priority: 70 },
    ],
    secondary: [
      { type: 'share_knowledge', priority: 50 },
      { type: 'resolve_conflict', priority: 40 },
    ],
  },
};

// ============================================
// Goal System
// ============================================

export function getDefaultObjectives(archetype: BehavioralArchetype): NPCObjectives {
  const archetypeGoals = ARCHETYPE_GOALS[archetype] || ARCHETYPE_GOALS.diplomat;

  return {
    primary: archetypeGoals.primary || [],
    secondary: archetypeGoals.secondary || [],
    situational: [],
    archetype,
  };
}

export function createObjectives(
  archetype: BehavioralArchetype,
  customPrimary?: NPCGoal[],
  customSecondary?: NPCGoal[],
  customSituational?: NPCGoal[]
): NPCObjectives {
  const defaults = getDefaultObjectives(archetype);

  return {
    primary: customPrimary || defaults.primary,
    secondary: customSecondary || defaults.secondary,
    situational: customSituational || defaults.situational,
    archetype,
  };
}

export function isGoalActive(goal: NPCGoal, state: SimulationSnapshot, npcSlug: string): boolean {
  if (!goal.activeWhen || goal.activeWhen.length === 0) {
    return true;
  }

  return goal.activeWhen.every(condition => evaluateGoalCondition(condition, state, npcSlug, goal.targetNPC));
}

export function isGoalCompleted(goal: NPCGoal, state: SimulationSnapshot, npcSlug: string): boolean {
  if (!goal.completedWhen || goal.completedWhen.length === 0) {
    return false;
  }

  return goal.completedWhen.every(condition => evaluateGoalCondition(condition, state, npcSlug, goal.targetNPC));
}

function evaluateGoalCondition(
  condition: GoalCondition,
  state: SimulationSnapshot,
  npcSlug: string,
  targetNPC?: string
): boolean {
  switch (condition.type) {
    case 'relationship': {
      const target = condition.targetNPC || targetNPC;
      if (!target) return false;

      const relMap = state.relationships.get(npcSlug);
      if (!relMap) return false;

      const stats = relMap.get(target);
      if (!stats) return false;

      const stat = condition.stat as keyof RelationshipStats;
      const value = stats[stat] as number;

      return compareValues(value, condition.comparison, condition.value as number);
    }

    case 'mood': {
      const moodData = state.moods.get(npcSlug);
      if (!moodData) return false;

      if (condition.stat === 'current') {
        return compareValues(moodData.current, condition.comparison, condition.value as string);
      }
      if (condition.stat === 'intensity') {
        return compareValues(moodData.intensity, condition.comparison, condition.value as number);
      }
      return false;
    }

    case 'behavioral_state': {
      const behaviorState = state.behaviorStates.get(npcSlug);
      if (!behaviorState) return false;

      return compareValues(behaviorState.current, condition.comparison, condition.value as string);
    }

    case 'turn': {
      return compareValues(state.context.turnNumber, condition.comparison, condition.value as number);
    }

    case 'tension': {
      return compareValues(state.thread.tension, condition.comparison, condition.value as number);
    }

    case 'knowledge': {
      return condition.comparison === 'exists';
    }

    default:
      return true;
  }
}

function compareValues(
  actual: number | string | boolean,
  comparison: GoalCondition['comparison'],
  expected: number | string | boolean
): boolean {
  switch (comparison) {
    case 'eq': return actual === expected;
    case 'neq': return actual !== expected;
    case 'gt': return (actual as number) > (expected as number);
    case 'lt': return (actual as number) < (expected as number);
    case 'gte': return (actual as number) >= (expected as number);
    case 'lte': return (actual as number) <= (expected as number);
    case 'exists': return actual !== undefined && actual !== null;
    default: return false;
  }
}

// ============================================
// Goal Progress Evaluation
// ============================================

export function evaluateGoalProgress(
  goal: NPCGoal,
  state: SimulationSnapshot,
  npcSlug: string
): number {
  switch (goal.type) {
    case 'maximize_respect': {
      return evaluateRelationshipGoal(state, npcSlug, goal.targetNPC, 'respect', 100);
    }
    case 'maximize_trust': {
      return evaluateRelationshipGoal(state, npcSlug, goal.targetNPC, 'trust', 100);
    }
    case 'maximize_fear': {
      return evaluateReverseRelationshipGoal(state, npcSlug, goal.targetNPC, 'fear', 100);
    }
    case 'minimize_fear': {
      return 1 - evaluateRelationshipGoal(state, npcSlug, goal.targetNPC, 'fear', 100);
    }
    case 'maximize_familiarity': {
      return evaluateRelationshipGoal(state, npcSlug, goal.targetNPC, 'familiarity', 100);
    }
    case 'minimize_familiarity': {
      return 1 - evaluateRelationshipGoal(state, npcSlug, goal.targetNPC, 'familiarity', 100);
    }
    case 'extract_debt': {
      return evaluateReverseRelationshipGoal(state, npcSlug, goal.targetNPC, 'debt', 100);
    }
    case 'reduce_debt': {
      return 1 - evaluateRelationshipGoal(state, npcSlug, goal.targetNPC, 'debt', 100);
    }
    case 'maintain_mystery': {
      const allFamiliarity = getAverageRelationshipStat(state, npcSlug, 'familiarity');
      return 1 - normalize(allFamiliarity, 0, 100);
    }
    case 'control_conversation': {
      return evaluateConversationControl(state, npcSlug);
    }
    case 'provoke_conflict': {
      return state.thread.tension;
    }
    case 'resolve_conflict': {
      return 1 - state.thread.tension;
    }
    case 'deepen_topic': {
      const activeTopic = state.thread.topics.find(t => t.id === state.thread.activeTopic);
      return activeTopic ? normalize(activeTopic.depth, 0, 10) : 0;
    }
    case 'change_topic': {
      const recentTopics = state.thread.topics.slice(-3);
      const uniqueSubjects = new Set(recentTopics.map(t => t.subject)).size;
      return normalize(uniqueSubjects, 1, 3);
    }
    case 'increase_tension': {
      return state.thread.tension;
    }
    case 'decrease_tension': {
      return 1 - state.thread.tension;
    }
    case 'entertain_self': {
      const topicVariety = new Set(state.thread.topics.slice(-5).map(t => t.category)).size / 5;
      return Math.max(state.thread.tension, topicVariety);
    }
    case 'create_alliance': {
      if (!goal.targetNPC) return 0;
      const trust = getRelationshipStat(state, npcSlug, goal.targetNPC, 'trust');
      const fam = getRelationshipStat(state, npcSlug, goal.targetNPC, 'familiarity');
      return normalize((trust + fam) / 2, 0, 100);
    }
    case 'break_alliance': {
      if (!goal.targetNPC) return 0;
      const trust = getRelationshipStat(state, npcSlug, goal.targetNPC, 'trust');
      return 1 - normalize(trust, -100, 100);
    }
    case 'protect_ally': {
      if (!goal.targetNPC) return 0.5;
      const allyFear = getRelationshipStat(state, goal.targetNPC, npcSlug, 'fear');
      return 1 - normalize(allyFear, 0, 100);
    }
    case 'undermine_enemy': {
      if (!goal.targetNPC) return 0;
      const enemyRespect = getAverageRelationshipStat(state, goal.targetNPC, 'respect');
      return 1 - normalize(enemyRespect, -100, 100);
    }
    case 'share_knowledge':
    case 'spread_rumor': {
      const gossipTopics = state.thread.topics.filter(t => t.category === 'gossip');
      return gossipTopics.length > 0 ? 0.5 + gossipTopics[0].depth * 0.05 : 0;
    }
    case 'hide_knowledge': {
      const secretTopics = state.thread.topics.filter(t =>
        t.category === 'lore' && t.initiator === npcSlug
      );
      return secretTopics.length === 0 ? 1 : 0.5;
    }
    case 'gather_information': {
      const loreTopics = state.thread.topics.filter(t => t.category === 'lore');
      if (loreTopics.length === 0) return 0;
      return normalize(loreTopics.reduce((sum, t) => sum + t.depth, 0), 0, 20);
    }
    case 'end_conversation': {
      return 1 - state.thread.momentum;
    }
    default:
      return 0.5;
  }
}

// ============================================
// Helper Functions
// ============================================

function normalize(value: number, min: number, max: number): number {
  return Math.max(0, Math.min(1, (value - min) / (max - min)));
}

function getRelationshipStat(
  state: SimulationSnapshot,
  fromNPC: string,
  toNPC: string,
  stat: keyof RelationshipStats
): number {
  const relMap = state.relationships.get(fromNPC);
  if (!relMap) return 0;

  const stats = relMap.get(toNPC);
  if (!stats) return 0;

  return stats[stat] as number;
}

function evaluateRelationshipGoal(
  state: SimulationSnapshot,
  npcSlug: string,
  targetNPC: string | undefined,
  stat: keyof RelationshipStats,
  maxValue: number
): number {
  if (targetNPC) {
    const value = getRelationshipStat(state, npcSlug, targetNPC, stat);
    return normalize(value, -maxValue, maxValue);
  } else {
    const avg = getAverageRelationshipStat(state, npcSlug, stat);
    return normalize(avg, -maxValue, maxValue);
  }
}

function evaluateReverseRelationshipGoal(
  state: SimulationSnapshot,
  npcSlug: string,
  targetNPC: string | undefined,
  stat: keyof RelationshipStats,
  maxValue: number
): number {
  if (targetNPC) {
    const value = getRelationshipStat(state, targetNPC, npcSlug, stat);
    return normalize(value, 0, maxValue);
  } else {
    let total = 0;
    let count = 0;
    for (const [otherNpc, relMap] of state.relationships) {
      if (otherNpc === npcSlug) continue;
      const stats = relMap.get(npcSlug);
      if (stats) {
        total += stats[stat] as number;
        count++;
      }
    }
    const avg = count > 0 ? total / count : 0;
    return normalize(avg, 0, maxValue);
  }
}

function getAverageRelationshipStat(
  state: SimulationSnapshot,
  npcSlug: string,
  stat: keyof RelationshipStats
): number {
  const relMap = state.relationships.get(npcSlug);
  if (!relMap || relMap.size === 0) return 0;

  let total = 0;
  let count = 0;
  for (const stats of relMap.values()) {
    total += stats[stat] as number;
    count++;
  }

  return count > 0 ? total / count : 0;
}

function evaluateConversationControl(state: SimulationSnapshot, npcSlug: string): number {
  const activeTopic = state.thread.topics.find(t => t.id === state.thread.activeTopic);
  if (!activeTopic) return 0;

  let score = 0;

  if (activeTopic.initiator === npcSlug) {
    score += 0.4;
  }

  if (activeTopic.participants.includes(npcSlug)) {
    score += 0.3;
  }

  score += state.thread.momentum * 0.3;

  return Math.min(1, score);
}

// ============================================
// Full Evaluation Function
// ============================================

export function evaluateState(
  state: SimulationSnapshot,
  context: EvaluationContext
): EvaluationScore {
  const { evaluator, objectives, originalState, config } = context;

  let goalScore = 0;
  let totalPriority = 0;
  const achievedGoals: string[] = [];
  const riskedGoals: string[] = [];

  for (const goal of objectives.primary) {
    if (!isGoalActive(goal, state, evaluator)) continue;

    const progress = evaluateGoalProgress(goal, state, evaluator);
    const weighted = progress * goal.priority;
    goalScore += weighted;
    totalPriority += goal.priority;

    if (progress > 0.7) achievedGoals.push(goal.type);
    if (progress < 0.3) riskedGoals.push(goal.type);
  }

  for (const goal of objectives.secondary) {
    if (!isGoalActive(goal, state, evaluator)) continue;

    const progress = evaluateGoalProgress(goal, state, evaluator);
    const weighted = progress * goal.priority * 0.5;
    goalScore += weighted;
    totalPriority += goal.priority * 0.5;

    if (progress > 0.7) achievedGoals.push(goal.type);
  }

  for (const goal of objectives.situational) {
    if (!isGoalActive(goal, state, evaluator)) continue;

    const progress = evaluateGoalProgress(goal, state, evaluator);
    const weighted = progress * goal.priority;
    goalScore += weighted;
    totalPriority += goal.priority;

    if (progress > 0.7) achievedGoals.push(goal.type);
    if (progress < 0.3) riskedGoals.push(goal.type);
  }

  const normalizedGoalScore = totalPriority > 0 ? (goalScore / totalPriority) * 200 - 100 : 0;

  const riskScore = -calculateRisk(state, evaluator, objectives) * 100;
  const narrativeScore = calculateNarrativeValue(state, evaluator) * 100;
  const opportunityScore = -calculateOpportunityCost(state, originalState, evaluator) * 100;
  const flowScore = calculateFlowQuality(state) * 100;

  const totalScore =
    normalizedGoalScore * config.goalWeight +
    riskScore * config.riskWeight +
    narrativeScore * config.narrativeWeight +
    opportunityScore * config.opportunityWeight +
    flowScore * config.flowWeight;

  const confidence = calculateConfidence(state, context);

  return {
    totalScore: clamp(totalScore, -1000, 1000),
    breakdown: {
      goalAlignment: normalizedGoalScore,
      riskScore,
      narrativeValue: narrativeScore,
      opportunityCost: opportunityScore,
      conversationFlow: flowScore,
    },
    confidence,
    achievedGoals,
    riskedGoals,
  };
}

// ============================================
// Component Evaluation Functions
// ============================================

function calculateRisk(
  state: SimulationSnapshot,
  npcSlug: string,
  objectives: NPCObjectives
): number {
  let risk = 0;

  if (state.thread.tension > 0.7) {
    const hasPowerfulEnemy = state.activeNPCs.some(slug => {
      if (slug === npcSlug) return false;
      const relMap = state.relationships.get(npcSlug);
      const stats = relMap?.get(slug);
      return stats && stats.respect < -30;
    });
    if (hasPowerfulEnemy) risk += 0.4;
  }

  const avgTrust = getAverageRelationshipStat(state, npcSlug, 'trust');
  if (avgTrust < -30) risk += 0.3;

  const avgFear = getAverageRelationshipStat(state, npcSlug, 'fear');
  if (avgFear > 50) risk += 0.2;

  const behaviorState = state.behaviorStates.get(npcSlug);
  if (behaviorState) {
    if (behaviorState.current === 'fleeing' || behaviorState.current === 'threatened') {
      risk += 0.3;
    }
  }

  return clamp(risk, 0, 1);
}

function calculateNarrativeValue(state: SimulationSnapshot, npcSlug: string): number {
  let narrative = 0;

  const recentTopics = state.thread.topics.slice(-5);
  const uniqueCategories = new Set(recentTopics.map(t => t.category)).size;
  narrative += normalize(uniqueCategories, 1, 5) * 0.25;

  const avgDepth = recentTopics.length > 0
    ? recentTopics.reduce((sum, t) => sum + t.depth, 0) / recentTopics.length
    : 0;
  narrative += normalize(avgDepth, 0, 10) * 0.25;

  const tensionScore = 1 - Math.abs(state.thread.tension - 0.5) * 2;
  narrative += tensionScore * 0.25;

  const hasSecretReveal = recentTopics.some(t =>
    t.category === 'lore' || t.subject.includes('secret')
  );
  if (hasSecretReveal) narrative += 0.25;

  return clamp(narrative, 0, 1);
}

function calculateOpportunityCost(
  currentState: SimulationSnapshot,
  originalState: SimulationSnapshot,
  npcSlug: string
): number {
  let cost = 0;

  const momentumLoss = originalState.thread.momentum - currentState.thread.momentum;
  if (momentumLoss > 0.2) cost += momentumLoss * 0.3;

  const activeTopic = currentState.thread.topics.find(t => t.id === currentState.thread.activeTopic);
  if (activeTopic && activeTopic.exhaustion > 0.8 && activeTopic.depth < 3) {
    cost += 0.3;
  }

  if (currentState.thread.tension < 0.3 && originalState.thread.tension > 0.3) {
    cost += 0.2;
  }

  return clamp(cost, 0, 1);
}

function calculateFlowQuality(state: SimulationSnapshot): number {
  let flow = 0.5;

  flow += state.thread.momentum * 0.3;

  const activeTopic = state.thread.topics.find(t => t.id === state.thread.activeTopic);
  if (activeTopic) {
    flow += (1 - activeTopic.exhaustion) * 0.2;
  }

  const participantCount = state.thread.participants.size;
  if (participantCount >= 2 && participantCount <= 4) {
    flow += 0.1;
  }

  return clamp(flow, 0, 1);
}

function calculateConfidence(state: SimulationSnapshot, context: EvaluationContext): number {
  let confidence = 0.7;

  const relCount = state.relationships.size;
  confidence += Math.min(relCount * 0.02, 0.15);

  const topicCount = state.thread.topics.length;
  confidence += Math.min(topicCount * 0.02, 0.1);

  const hasActiveStates = state.behaviorStates.size > 0;
  if (hasActiveStates) confidence += 0.05;

  return clamp(confidence, 0.5, 1);
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

// ============================================
// NPC-Specific Goal Profiles
// ============================================

export const NPC_GOAL_PROFILES: Record<string, NPCObjectives> = {
  'the-one': createObjectives('predator', [
    { type: 'maintain_mystery', priority: 90 },
    { type: 'maximize_respect', priority: 80 },
    { type: 'control_conversation', priority: 70 },
  ], [
    { type: 'hide_knowledge', priority: 60 },
    { type: 'maximize_fear', priority: 50 },
  ], [
    { type: 'maximize_fear', priority: 95, activeWhen: [{ type: 'relationship', stat: 'respect', comparison: 'lt', value: 0 }] },
  ]),

  'john': createObjectives('opportunist', [
    { type: 'gather_information', priority: 80 },
    { type: 'control_conversation', priority: 70 },
    { type: 'maximize_respect', priority: 60 },
  ], [
    { type: 'extract_debt', priority: 50 },
    { type: 'undermine_enemy', priority: 40, targetNPC: 'the-one' },
  ]),

  'peter': createObjectives('warrior', [
    { type: 'maximize_fear', priority: 90 },
    { type: 'maximize_respect', priority: 70 },
  ], [
    { type: 'provoke_conflict', priority: 60 },
    { type: 'control_conversation', priority: 40 },
  ]),

  'robert': createObjectives('sage', [
    { type: 'share_knowledge', priority: 80 },
    { type: 'deepen_topic', priority: 70 },
    { type: 'decrease_tension', priority: 60 },
  ], [
    { type: 'protect_ally', priority: 50 },
    { type: 'gather_information', priority: 40 },
  ]),

  'alice': createObjectives('trickster', [
    { type: 'entertain_self', priority: 90 },
    { type: 'provoke_conflict', priority: 70 },
    { type: 'change_topic', priority: 60 },
  ], [
    { type: 'spread_rumor', priority: 50 },
    { type: 'increase_tension', priority: 40 },
  ]),

  'jane': createObjectives('guardian', [
    { type: 'control_conversation', priority: 80 },
    { type: 'maximize_respect', priority: 70 },
    { type: 'end_conversation', priority: 60 },
  ], [
    { type: 'hide_knowledge', priority: 50 },
    { type: 'decrease_tension', priority: 40 },
  ]),

  'willy': createObjectives('merchant', [
    { type: 'maximize_trust', priority: 80 },
    { type: 'maximize_familiarity', priority: 70 },
    { type: 'extract_debt', priority: 60 },
  ], [
    { type: 'share_knowledge', priority: 50 },
    { type: 'create_alliance', priority: 40 },
  ]),

  'mr-bones': createObjectives('sage', [
    { type: 'maintain_mystery', priority: 80 },
    { type: 'share_knowledge', priority: 70 },
    { type: 'deepen_topic', priority: 60 },
  ], [
    { type: 'gather_information', priority: 50 },
    { type: 'maximize_respect', priority: 40 },
  ]),

  'stitch-up-girl': createObjectives('guardian', [
    { type: 'protect_ally', priority: 90 },
    { type: 'decrease_tension', priority: 70 },
    { type: 'maximize_trust', priority: 60 },
  ], [
    { type: 'share_knowledge', priority: 50 },
    { type: 'create_alliance', priority: 40 },
  ]),

  'the-general-traveler': createObjectives('warrior', [
    { type: 'protect_ally', priority: 90 },
    { type: 'maximize_respect', priority: 70 },
    { type: 'control_conversation', priority: 60 },
  ], [
    { type: 'gather_information', priority: 50 },
    { type: 'create_alliance', priority: 40 },
  ]),
};

export function getObjectivesForNPC(npcSlug: string, archetype: BehavioralArchetype): NPCObjectives {
  return NPC_GOAL_PROFILES[npcSlug] || getDefaultObjectives(archetype);
}
