/**
 * Response Selector
 *
 * Selects appropriate response templates based on context, mood, and relationships.
 * Uses seeded RNG for deterministic selection.
 *
 * Integrates with MCTS search engine for strategic response selection
 * in high-tension or important situations.
 */

import type {
  ResponseTemplate,
  TemplatePool,
  MoodType,
  NPCPersonality,
  SimulationContext,
  ChatMessage,
  ObservedStatChange,
  TemplateCondition,
  RelationshipStats,
  NPCRelationship,
  NPCMemory,
} from './types';
import { createSeededRng, type SeededRng } from './seeded-rng';
import { deriveMoodFromRelationship } from './relationship';
import { getOpinion, hasTraumaBond, hasRecentConflict } from './memory';
import type {
  SearchConfig,
  SimulationSnapshot,
  SearchResult,
  NPCObjectives,
  MemorySnapshot,
} from '../search/search-types';
import type { NPCBehaviorState } from '../personality/behavioral-patterns';
import type { ConversationThread } from '../social/conversation-threading';
import type { ChatbaseLookupEngine } from '../search/chatbase-lookup';
import type { ChatbaseLookupResult } from '../search/chatbase-types';

// ============================================
// Condition Evaluation
// ============================================

interface EvaluationContext {
  mood: MoodType;
  relationship?: NPCRelationship;
  memory?: NPCMemory;
  context: SimulationContext;
}

function evaluateCondition(
  condition: TemplateCondition,
  ctx: EvaluationContext
): boolean {
  const { type, target, comparison, value } = condition;

  let actual: number | string | boolean;

  switch (type) {
    case 'mood':
      actual = ctx.mood;
      break;

    case 'relationship':
      if (!ctx.relationship || !target) return true;
      const stat = target as keyof typeof ctx.relationship.stats;
      actual = ctx.relationship.stats[stat] ?? 0;
      break;

    case 'memory':
      if (!ctx.memory || !target) return true;
      if (target === 'deaths') actual = ctx.memory.deaths;
      else if (target === 'witnessedDeaths') actual = ctx.memory.witnessedDeaths;
      else if (target === 'hasTraumaBond') actual = hasTraumaBond(ctx.memory, value as string);
      else if (target === 'hasRecentConflict') actual = hasRecentConflict(ctx.memory, value as string);
      else return true;
      break;

    case 'context':
      if (!target) return true;
      if (target === 'turnNumber') actual = ctx.context.turnNumber;
      else if (target === 'playerPresent') actual = ctx.context.playerPresent;
      else if (target === 'location') actual = ctx.context.location;
      else return true;
      break;

    case 'random':
      actual = Math.random();
      break;

    default:
      return true;
  }

  if (typeof actual === 'boolean') {
    return comparison === 'eq' ? actual === value : actual !== value;
  }

  if (typeof actual === 'string' && typeof value === 'string') {
    return comparison === 'eq' ? actual === value : actual !== value;
  }

  if (typeof actual === 'number' && typeof value === 'number') {
    switch (comparison) {
      case 'gt': return actual > value;
      case 'lt': return actual < value;
      case 'eq': return actual === value;
      case 'gte': return actual >= value;
      case 'lte': return actual <= value;
      default: return true;
    }
  }

  return true;
}

function evaluateConditions(
  conditions: TemplateCondition[] | undefined,
  ctx: EvaluationContext
): boolean {
  if (!conditions || conditions.length === 0) return true;
  return conditions.every((c) => evaluateCondition(c, ctx));
}

// ============================================
// Template Filtering
// ============================================

interface UsageState {
  recentlyUsed: Set<string>;
  cooldowns: Map<string, number>;
}

function isOnCooldown(
  template: ResponseTemplate,
  usage: UsageState,
  currentTurn: number
): boolean {
  if (!template.cooldown) return false;

  const lastUsedTurn = usage.cooldowns.get(template.id);
  if (lastUsedTurn === undefined) return false;

  if (template.cooldown.turns) {
    return currentTurn - lastUsedTurn < template.cooldown.turns;
  }

  if (template.cooldown.oncePerConversation) {
    return true;
  }

  return false;
}

function getCandidates(
  templates: ResponseTemplate[],
  npcSlug: string,
  pool: TemplatePool,
  mood: MoodType,
  ctx: EvaluationContext,
  usage: UsageState,
  targetNPC?: string
): ResponseTemplate[] {
  return templates.filter((t) => {
    if (t.npcSlug !== npcSlug) return false;
    if (t.pool !== pool) return false;
    if (t.mood !== 'any' && t.mood !== mood) return false;
    if (t.targetNPC && targetNPC && t.targetNPC !== targetNPC) return false;
    if (usage.recentlyUsed.has(t.id)) return false;
    if (isOnCooldown(t, usage, ctx.context.turnNumber)) return false;
    if (!evaluateConditions(t.conditions, ctx)) return false;
    return true;
  });
}

// ============================================
// Weighted Selection
// ============================================

function weightedSelect(
  candidates: ResponseTemplate[],
  rng: SeededRng,
  namespace: string
): ResponseTemplate | null {
  if (candidates.length === 0) return null;
  if (candidates.length === 1) return candidates[0];

  const items = candidates.map((t) => ({ item: t, weight: t.weight }));
  return rng.randomWeighted(items, namespace) ?? null;
}

// ============================================
// Variable Processing
// ============================================

interface VariableContext {
  speakerName: string;
  targetName?: string;
  playerName?: string;
  location: string;
  turnNumber: number;
  [key: string]: string | number | undefined;
}

function processVariables(text: string, vars: VariableContext): string {
  return text.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
    const value = vars[varName];
    if (value !== undefined) {
      return String(value);
    }
    return match;
  });
}

// ============================================
// Main Selection Function
// ============================================

export interface SelectionInput {
  npcSlug: string;
  personality: NPCPersonality;
  pool: TemplatePool;
  context: SimulationContext;
  relationship?: NPCRelationship;
  memory?: NPCMemory;
  usage: UsageState;
  targetNPC?: string;
  variables?: Record<string, string | number>;
}

export interface SelectionResult {
  message: ChatMessage | null;
  statChanges: ObservedStatChange[];
  usedTemplateId: string | null;
}

let messageIdCounter = 0;

export function selectResponse(input: SelectionInput): SelectionResult {
  const {
    npcSlug,
    personality,
    pool,
    context,
    relationship,
    memory,
    usage,
    targetNPC,
    variables = {},
  } = input;

  const seed = `${context.seed}:${npcSlug}:${context.turnNumber}:${pool}`;
  const rng = createSeededRng(seed);

  const mood = relationship
    ? deriveMoodFromRelationship(relationship.stats, personality.defaultMood)
    : personality.defaultMood;

  const evalCtx: EvaluationContext = {
    mood,
    relationship,
    memory,
    context,
  };

  let candidates = getCandidates(
    personality.templates,
    npcSlug,
    pool,
    mood,
    evalCtx,
    usage,
    targetNPC
  );

  if (candidates.length === 0) {
    candidates = getCandidates(
      personality.templates,
      npcSlug,
      pool,
      'neutral',
      evalCtx,
      usage,
      targetNPC
    ).filter((t) => t.mood === 'any');
  }

  const template = weightedSelect(candidates, rng, `select:${pool}`);

  if (!template) {
    return { message: null, statChanges: [], usedTemplateId: null };
  }

  const varContext: VariableContext = {
    speakerName: personality.identity.name,
    targetName: targetNPC,
    location: context.location,
    turnNumber: context.turnNumber,
    ...variables,
  };

  const processedText = processVariables(template.text, varContext);

  const message: ChatMessage = {
    id: `msg_${++messageIdCounter}`,
    sender: { type: 'npc', slug: npcSlug },
    targetAudience: targetNPC || (context.playerPresent ? 'player' : 'all'),
    content: processedText,
    timestamp: Date.now(),
    mood,
    purpose: template.purpose,
    templateId: template.id,
  };

  const statChanges: ObservedStatChange[] = [];
  if (template.statEffects) {
    for (const effect of template.statEffects) {
      const change: ObservedStatChange = {
        timestamp: Date.now(),
        sourceNPC: npcSlug,
        targetNPC: effect.target === 'self' ? npcSlug :
                   effect.target === 'target' ? (targetNPC || npcSlug) :
                   effect.target,
        stat: effect.stat,
        previousValue: 0,
        newValue: effect.change,
        change: effect.change,
        reason: effect.reason,
      };
      statChanges.push(change);
    }
  }

  return {
    message,
    statChanges,
    usedTemplateId: template.id,
  };
}

// ============================================
// Usage State Management
// ============================================

export function createUsageState(): UsageState {
  return {
    recentlyUsed: new Set(),
    cooldowns: new Map(),
  };
}

export function markTemplateUsed(
  usage: UsageState,
  templateId: string,
  turnNumber: number
): UsageState {
  const recentlyUsed = new Set(usage.recentlyUsed);
  recentlyUsed.add(templateId);

  const arr = Array.from(recentlyUsed);
  if (arr.length > 3) {
    recentlyUsed.delete(arr[0]);
  }

  const cooldowns = new Map(usage.cooldowns);
  cooldowns.set(templateId, turnNumber);

  return { recentlyUsed, cooldowns };
}

export function resetUsageState(): UsageState {
  return createUsageState();
}

// ============================================
// Strategic Selection (Search-Enhanced)
// ============================================

export interface StrategicSelectionInput extends SelectionInput {
  allTemplates?: ResponseTemplate[];
  relationships?: Map<string, Map<string, RelationshipStats>>;
  memories?: Map<string, MemorySnapshot>;
  behaviorStates?: Map<string, NPCBehaviorState>;
  thread?: ConversationThread;
  moods?: Map<string, { current: MoodType; intensity: number }>;
  useSearch?: boolean;
  searchConfig?: Partial<SearchConfig>;
  forceSearchTime?: number;
  /** Chatbase lookup engine for instant response selection */
  chatbaseLookup?: ChatbaseLookupEngine;
  /** Skip chatbase lookup (force template/search) */
  skipChatbase?: boolean;
}

export interface StrategicSelectionResult extends SelectionResult {
  usedSearch: boolean;
  usedChatbase: boolean;
  searchStats?: {
    iterations: number;
    timeMs: number;
    depth: number;
    alternatives: number;
  };
  chatbaseStats?: {
    key: string;
    fuzzyMatch: boolean;
    alternatives: number;
  };
  confidence?: number;
}

export function selectStrategicResponse(
  input: StrategicSelectionInput
): StrategicSelectionResult {
  const {
    npcSlug,
    personality,
    pool,
    chatbaseLookup,
    skipChatbase,
    relationships,
    memories,
    behaviorStates,
    thread,
    moods,
    context,
  } = input;

  // Step 1: Try chatbase lookup first (if enabled)
  if (chatbaseLookup && chatbaseLookup.isEnabled() && !skipChatbase) {
    // Build a minimal snapshot for lookup
    const snapshot: SimulationSnapshot = {
      relationships: relationships || new Map(),
      memories: memories || new Map(),
      behaviorStates: behaviorStates || new Map(),
      thread: thread || {
        id: 'default',
        topics: [],
        activeTopic: null,
        turnCount: context.turnNumber,
        participants: new Set([npcSlug]),
        momentum: 0.5,
        tension: 0,
        sentiment: 0,
        topicHistory: [],
      } as any,
      context,
      activeNPCs: [npcSlug],
      moods: moods || new Map([[npcSlug, { current: personality.defaultMood, intensity: 50 }]]),
      usedTemplates: new Map(),
      seed: context.seed,
      turnOffset: 0,
    };

    const lookupResult = chatbaseLookup.lookup(snapshot, npcSlug, pool);

    if (lookupResult.source === 'chatbase' && lookupResult.entry) {
      // Build message from chatbase entry
      const entry = lookupResult.entry;
      const message: ChatMessage = {
        id: `msg_chatbase_${Date.now()}`,
        sender: { type: 'npc', slug: npcSlug },
        targetAudience: entry.target
          ? ('slug' in entry.target ? entry.target.slug : 'player')
          : (context.playerPresent ? 'player' : 'all'),
        content: entry.text,
        timestamp: Date.now(),
        mood: entry.mood,
        purpose: 'social', // Default purpose
        templateId: entry.id,
      };

      // Record the hit
      chatbaseLookup.recordHit(entry.id);

      return {
        message,
        statChanges: [],
        usedTemplateId: entry.id,
        usedSearch: false,
        usedChatbase: true,
        chatbaseStats: {
          key: lookupResult.key || '',
          fuzzyMatch: lookupResult.fuzzyMatch || false,
          alternatives: lookupResult.alternatives?.length || 0,
        },
        confidence: lookupResult.confidence,
      };
    }
  }

  // Step 2: Fall back to template selection
  const result = selectResponse(input);
  return {
    ...result,
    usedSearch: false,
    usedChatbase: false,
  };
}

export function explainSearchDecision(
  pool: TemplatePool,
  npcCategory: string,
  tension: number
): string {
  const reasons: string[] = [];

  const strategicPools: TemplatePool[] = ['threat', 'npcReaction', 'lore', 'npcGossip', 'npcConflict'];
  if (strategicPools.includes(pool)) {
    reasons.push(`Strategic pool: ${pool}`);
  }

  if (npcCategory === 'pantheon') {
    reasons.push('Pantheon NPC (always strategic)');
  }

  if (tension >= 0.5) {
    reasons.push(`High tension: ${(tension * 100).toFixed(0)}%`);
  }

  if (reasons.length === 0) {
    return 'Simple selection (no strategic factors)';
  }

  return `Using MCTS search: ${reasons.join(', ')}`;
}
