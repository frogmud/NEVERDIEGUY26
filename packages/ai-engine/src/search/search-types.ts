/**
 * Search Types
 *
 * TypeScript interfaces for the chess-engine-style conversation search system.
 * Uses Monte Carlo Tree Search (MCTS) to find optimal NPC responses.
 */

import type {
  ResponseTemplate,
  MoodType,
  RelationshipStats,
  SimulationContext,
  TemplatePool,
} from '../core/types';
import type { NPCBehaviorState, BehavioralArchetype } from '../personality/behavioral-patterns';
import type { ConversationThread } from '../social/conversation-threading';

// ============================================
// Search Configuration
// ============================================

export interface SearchConfig {
  defaultTimeMs: number;
  fastTimeMs: number;
  criticalTimeMs: number;
  maxTimeMs: number;
  maxDepth: number;
  minDepth: number;
  explorationConstant: number;
  minVisitsBeforePrune: number;
  pruneThreshold: number;
  maxCandidatesAtDepth: number[];
  goalWeight: number;
  riskWeight: number;
  narrativeWeight: number;
  opportunityWeight: number;
  flowWeight: number;
  useSearchForPools: TemplatePool[];
  alwaysSearchCategories: string[];
  minTensionForSearch: number;
}

export const DEFAULT_SEARCH_CONFIG: SearchConfig = {
  defaultTimeMs: 100,
  fastTimeMs: 50,
  criticalTimeMs: 200,
  maxTimeMs: 500,
  maxDepth: 4,
  minDepth: 1,
  explorationConstant: Math.SQRT2,
  minVisitsBeforePrune: 3,
  pruneThreshold: 0.5,
  maxCandidatesAtDepth: [8, 6, 5, 4, 3],
  goalWeight: 0.40,
  riskWeight: 0.20,
  narrativeWeight: 0.15,
  opportunityWeight: 0.15,
  flowWeight: 0.10,
  useSearchForPools: ['threat', 'npcReaction', 'lore', 'npcGossip'],
  alwaysSearchCategories: ['pantheon'],
  minTensionForSearch: 0.5,
};

// ============================================
// Simulation Snapshot (Cloneable State)
// ============================================

export interface SimulationSnapshot {
  relationships: Map<string, Map<string, RelationshipStats>>;
  memories: Map<string, MemorySnapshot>;
  behaviorStates: Map<string, NPCBehaviorState>;
  thread: ConversationThread;
  context: SimulationContext;
  activeNPCs: string[];
  moods: Map<string, { current: MoodType; intensity: number }>;
  usedTemplates: Map<string, Set<string>>;
  seed: string;
  turnOffset: number;
}

export interface MemorySnapshot {
  traumaBonds: Record<string, number>;
  opinions: Record<string, number>;
  recentConversations: number;
}

// ============================================
// Search Tree Node
// ============================================

export interface ConversationNode {
  id: string;
  state: SimulationSnapshot;
  move: ConversationMove | null;
  parent: ConversationNode | null;
  children: ConversationNode[];
  visits: number;
  totalValue: number;
  averageValue: number;
  depth: number;
  isFullyExpanded: boolean;
  isPruned: boolean;
  isTerminal: boolean;
  evaluation?: EvaluationScore;
}

export interface ConversationMove {
  template: ResponseTemplate;
  speaker: string;
  target?: string;
  pool: TemplatePool;
}

// ============================================
// NPC Goals
// ============================================

export type GoalType =
  | 'maximize_respect' | 'maximize_trust' | 'maximize_fear'
  | 'minimize_fear' | 'maximize_familiarity' | 'minimize_familiarity'
  | 'extract_debt' | 'reduce_debt'
  | 'share_knowledge' | 'hide_knowledge' | 'gather_information' | 'spread_rumor'
  | 'create_alliance' | 'break_alliance' | 'provoke_conflict' | 'resolve_conflict'
  | 'maintain_mystery' | 'entertain_self' | 'protect_ally' | 'undermine_enemy'
  | 'control_conversation' | 'end_conversation' | 'deepen_topic' | 'change_topic'
  | 'increase_tension' | 'decrease_tension'
  // Extended goal types for NPC definitions
  | 'test_player' | 'establish_mystery' | 'intimidate' | 'complete_trade'
  | 'warn_player' | 'influence_mood' | 'observe_player' | 'guide_player'
  | 'improve_relationship' | 'recruit_ally';

export interface NPCGoal {
  type: GoalType;
  priority: number;
  description?: string;
  targetNPC?: string;
  targetStat?: keyof RelationshipStats;
  targetValue?: number;
  targetMood?: string;
  knowledgeId?: string;
  conditions?: GoalCondition[];
  activeWhen?: GoalCondition[];
  completedWhen?: GoalCondition[];
}

export interface GoalCondition {
  type: 'relationship' | 'mood' | 'behavioral_state' | 'turn' | 'tension' | 'knowledge' | 'favorLevel';
  stat?: string;
  comparison: 'eq' | 'neq' | 'gt' | 'lt' | 'gte' | 'lte' | 'exists';
  value?: number | string | boolean;
  targetNPC?: string;
}

export interface NPCObjectives {
  primary: NPCGoal[];
  secondary: NPCGoal[];
  situational: NPCGoal[];
  archetype: BehavioralArchetype;
}

// ============================================
// Evaluation
// ============================================

export interface EvaluationScore {
  totalScore: number;
  breakdown: {
    goalAlignment: number;
    riskScore: number;
    narrativeValue: number;
    opportunityCost: number;
    conversationFlow: number;
  };
  confidence: number;
  achievedGoals: string[];
  riskedGoals: string[];
  reasoning?: string;
}

export interface EvaluationContext {
  evaluator: string;
  objectives: NPCObjectives;
  originalState: SimulationSnapshot;
  config: SearchConfig;
}

// ============================================
// Search Results
// ============================================

export interface SearchResult {
  template: ResponseTemplate;
  stats: SearchStats;
  evaluation: EvaluationScore;
  alternatives?: AlternativePath[];
}

export interface SearchStats {
  totalIterations: number;
  timeElapsedMs: number;
  maxDepthReached: number;
  nodesCreated: number;
  nodesPruned: number;
  cacheHits: number;
  averageConfidence: number;
  bestScore: number;
  worstScore: number;
}

export interface AlternativePath {
  template: ResponseTemplate;
  score: number;
  visits: number;
  reasoning?: string;
}

// ============================================
// Player Mythology
// ============================================

export type MythStatus = 'unknown' | 'rumored' | 'legend' | 'prophecy';

export interface PlayerMyth {
  status: MythStatus;
  theories: PlayerTheory[];
  expectations: Map<string, number>;
  rumorSources: Map<string, string[]>;
  knownFacts: string[];
  suspectedTraits: string[];
}

export interface PlayerTheory {
  originNPC: string;
  content: string;
  shortForm: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  believers: string[];
  doubters: string[];
  spreadTurn: number;
}

// ============================================
// Autonomous Simulation
// ============================================

export interface AutonomousConfig {
  cyclesPerBatch: number;
  batchIntervalMs: number;
  interestThreshold: number;
  maxStoredEvents: number;
  playerMythFrequency: number;
  mythEvolutionRate: number;
  stuckStateThreshold: number;
  loopDetectionWindow: number;
  storylineMinTurns: number;
  storylineDecayRate: number;
}

export const DEFAULT_AUTONOMOUS_CONFIG: AutonomousConfig = {
  cyclesPerBatch: 20,
  batchIntervalMs: 1000,
  interestThreshold: 30,
  maxStoredEvents: 100,
  playerMythFrequency: 0.15,
  mythEvolutionRate: 0.1,
  stuckStateThreshold: 15,
  loopDetectionWindow: 10,
  storylineMinTurns: 5,
  storylineDecayRate: 0.1,
};

export interface InterestingEvent {
  id: string;
  turn: number;
  timestamp: number;
  speaker: string;
  target?: string;
  witnesses: string[];
  type: InterestEventType;
  description: string;
  messageContent: string;
  interestScore: number;
  tags: string[];
}

export type InterestEventType =
  | 'first_meeting' | 'secret_revealed' | 'alliance_formed' | 'alliance_broken'
  | 'betrayal' | 'high_tension' | 'mood_contagion' | 'behavioral_shift'
  | 'player_discussed' | 'conflict_started' | 'conflict_resolved'
  | 'knowledge_transfer' | 'relationship_milestone';

export interface Storyline {
  id: string;
  type: StorylineType;
  title: string;
  primaryNPCs: string[];
  secondaryNPCs: string[];
  status: 'emerging' | 'active' | 'climax' | 'resolved' | 'abandoned';
  startTurn: number;
  lastActivityTurn: number;
  events: string[];
  tension: number;
  momentum: number;
}

export type StorylineType =
  | 'rivalry' | 'alliance' | 'conspiracy' | 'redemption'
  | 'tragedy' | 'romance' | 'power_struggle' | 'mystery';

// ============================================
// Edge Case Detection
// ============================================

export interface BehaviorAnomaly {
  type: AnomalyType;
  npcSlug: string;
  description: string;
  turn: number;
  severity: 'low' | 'medium' | 'high';
  context: Record<string, unknown>;
}

export type AnomalyType =
  | 'stuck_state' | 'conversation_loop' | 'relationship_paradox'
  | 'dead_end_topic' | 'missing_templates' | 'extreme_stats' | 'orphan_knowledge';
