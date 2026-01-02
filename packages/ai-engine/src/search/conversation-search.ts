/**
 * Conversation Search Engine
 *
 * Monte Carlo Tree Search implementation for finding optimal NPC responses.
 * Explores conversation trees to select responses that best achieve NPC goals.
 */

import type { ResponseTemplate, TemplatePool } from '../core/types';
import type {
  SearchConfig,
  SimulationSnapshot,
  ConversationNode,
  ConversationMove,
  NPCObjectives,
  EvaluationScore,
  EvaluationContext,
  SearchResult,
  SearchStats,
  AlternativePath,
} from './search-types';
import { DEFAULT_SEARCH_CONFIG } from './search-types';
import {
  cloneSnapshot,
  simulateSingleTurn,
  generateCandidateMoves,
  isTerminal,
  hashState,
  createNodeRng,
} from './simulation-utils';
import { evaluateState } from './npc-goals';

// ============================================
// Search Engine
// ============================================

export class ConversationSearchEngine {
  private config: SearchConfig;
  private templates: ResponseTemplate[];
  private nodeCache: Map<string, ConversationNode>;
  private rootNode: ConversationNode | null;

  // Stats
  private stats: SearchStats;

  constructor(config?: Partial<SearchConfig>) {
    this.config = { ...DEFAULT_SEARCH_CONFIG, ...config };
    this.templates = [];
    this.nodeCache = new Map();
    this.rootNode = null;
    this.stats = this.createEmptyStats();
  }

  setTemplates(templates: ResponseTemplate[]): void {
    this.templates = templates;
  }

  setConfig(config: Partial<SearchConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Main search function - find the best response for an NPC.
   */
  search(
    snapshot: SimulationSnapshot,
    npcSlug: string,
    objectives: NPCObjectives,
    timeMs?: number
  ): SearchResult {
    const searchTime = timeMs ?? this.config.defaultTimeMs;
    const startTime = performance.now();

    // Reset stats
    this.stats = this.createEmptyStats();
    this.nodeCache.clear();

    // Create root node
    this.rootNode = this.createNode(snapshot, null, null);

    // Run MCTS iterations until time runs out
    while (performance.now() - startTime < searchTime) {
      this.stats.totalIterations++;

      // Selection - find a promising node to expand
      const selectedNode = this.select(this.rootNode);

      // Expansion - add new children
      const expandedNode = this.expand(selectedNode, npcSlug);

      // Simulation - play out randomly
      const simulationScore = this.simulate(expandedNode, npcSlug, objectives);

      // Backpropagation - update all ancestors
      this.backpropagate(expandedNode, simulationScore);
    }

    this.stats.timeElapsedMs = performance.now() - startTime;

    // Select best move from root's children
    return this.selectBestResult(this.rootNode, npcSlug, objectives);
  }

  /**
   * Quick search for less important decisions.
   */
  quickSearch(
    snapshot: SimulationSnapshot,
    npcSlug: string,
    objectives: NPCObjectives
  ): SearchResult {
    return this.search(snapshot, npcSlug, objectives, this.config.fastTimeMs);
  }

  /**
   * Deep search for critical moments.
   */
  deepSearch(
    snapshot: SimulationSnapshot,
    npcSlug: string,
    objectives: NPCObjectives
  ): SearchResult {
    return this.search(snapshot, npcSlug, objectives, this.config.criticalTimeMs);
  }

  // ============================================
  // MCTS Phases
  // ============================================

  private select(node: ConversationNode): ConversationNode {
    while (!isTerminal(node, this.config) && node.isFullyExpanded) {
      node = this.selectChild(node);
    }
    return node;
  }

  private selectChild(node: ConversationNode): ConversationNode {
    if (node.children.length === 0) return node;

    let bestChild = node.children[0];
    let bestUCB = -Infinity;

    for (const child of node.children) {
      if (child.isPruned) continue;

      const ucb = this.calculateUCB(child, node.visits);
      if (ucb > bestUCB) {
        bestUCB = ucb;
        bestChild = child;
      }
    }

    return bestChild;
  }

  private calculateUCB(node: ConversationNode, parentVisits: number): number {
    if (node.visits === 0) return Infinity;

    const exploitation = node.averageValue;
    const exploration =
      this.config.explorationConstant *
      Math.sqrt(Math.log(parentVisits) / node.visits);

    return exploitation + exploration;
  }

  private expand(node: ConversationNode, speaker: string): ConversationNode {
    if (isTerminal(node, this.config)) {
      return node;
    }

    // Generate candidate moves
    const rng = createNodeRng(node.state, node.id);
    const rngFn = () => rng.random('expand');
    const maxCandidates =
      this.config.maxCandidatesAtDepth[node.depth] ||
      this.config.maxCandidatesAtDepth[this.config.maxCandidatesAtDepth.length - 1];

    const moves = generateCandidateMoves(
      node.state,
      this.templates,
      maxCandidates,
      rngFn
    );

    // Filter out already expanded moves
    const existingMoveIds = new Set(
      node.children.map((c) => c.move?.template.id)
    );
    const newMoves = moves.filter((m) => !existingMoveIds.has(m.template.id));

    if (newMoves.length === 0) {
      node.isFullyExpanded = true;
      return node;
    }

    // Create child for first new move
    const move = newMoves[0];
    const newState = simulateSingleTurn(node.state, move);
    const child = this.createNode(newState, move, node);

    node.children.push(child);
    this.stats.nodesCreated++;

    // Check if fully expanded
    if (node.children.length >= maxCandidates) {
      node.isFullyExpanded = true;
    }

    return child;
  }

  private simulate(
    node: ConversationNode,
    npcSlug: string,
    objectives: NPCObjectives
  ): number {
    let currentState = cloneSnapshot(node.state);
    let depth = node.depth;

    // Random playout until terminal or max depth
    while (depth < this.config.maxDepth) {
      const rng = createNodeRng(currentState, `sim:${depth}`);
      const rngFn = () => rng.random('simulate');

      const moves = generateCandidateMoves(
        currentState,
        this.templates,
        3,
        rngFn
      );

      if (moves.length === 0) break;

      // Random move selection
      const move = moves[Math.floor(rngFn() * moves.length)];
      currentState = simulateSingleTurn(currentState, move);
      depth++;
    }

    // Evaluate final state
    const evalContext: EvaluationContext = {
      evaluator: npcSlug,
      objectives,
      originalState: node.state,
      config: this.config,
    };

    const evaluation = evaluateState(currentState, evalContext);
    this.stats.maxDepthReached = Math.max(this.stats.maxDepthReached, depth);

    return evaluation.totalScore;
  }

  private backpropagate(node: ConversationNode, score: number): void {
    let current: ConversationNode | null = node;

    while (current !== null) {
      current.visits++;
      current.totalValue += score;
      current.averageValue = current.totalValue / current.visits;

      // Prune low-performing nodes
      if (
        current.parent &&
        current.visits >= this.config.minVisitsBeforePrune
      ) {
        const siblings = current.parent.children.filter((c) => !c.isPruned);
        if (siblings.length > 1) {
          const avgSiblingValue =
            siblings.reduce((sum, s) => sum + s.averageValue, 0) /
            siblings.length;

          if (
            current.averageValue <
            avgSiblingValue * this.config.pruneThreshold
          ) {
            current.isPruned = true;
            this.stats.nodesPruned++;
          }
        }
      }

      current = current.parent;
    }
  }

  // ============================================
  // Result Selection
  // ============================================

  private selectBestResult(
    root: ConversationNode,
    npcSlug: string,
    objectives: NPCObjectives
  ): SearchResult {
    const validChildren = root.children.filter((c) => !c.isPruned && c.move);

    if (validChildren.length === 0) {
      return this.createFallbackResult();
    }

    // Sort by average value (most visits as tiebreaker)
    validChildren.sort((a, b) => {
      const valueDiff = b.averageValue - a.averageValue;
      if (Math.abs(valueDiff) > 0.01) return valueDiff;
      return b.visits - a.visits;
    });

    const bestChild = validChildren[0];
    const template = bestChild.move!.template;

    // Evaluate the best child's state
    const evalContext: EvaluationContext = {
      evaluator: npcSlug,
      objectives,
      originalState: root.state,
      config: this.config,
    };
    const evaluation = evaluateState(bestChild.state, evalContext);

    // Build alternatives list
    const alternatives: AlternativePath[] = validChildren.slice(1, 4).map((c) => ({
      template: c.move!.template,
      score: c.averageValue,
      visits: c.visits,
      reasoning: `Explored ${c.visits} times, avg score: ${c.averageValue.toFixed(2)}`,
    }));

    // Update stats
    this.stats.averageConfidence = evaluation.confidence;
    this.stats.bestScore = bestChild.averageValue;
    this.stats.worstScore = validChildren[validChildren.length - 1].averageValue;

    return {
      template,
      stats: { ...this.stats },
      evaluation,
      alternatives,
    };
  }

  private createFallbackResult(): SearchResult {
    return {
      template: {
        id: 'fallback',
        npcSlug: 'unknown',
        pool: 'idle' as TemplatePool,
        text: '...',
        weight: 1,
        mood: 'neutral',
        purpose: 'general',
      },
      stats: { ...this.stats },
      evaluation: {
        totalScore: 0,
        breakdown: {
          goalAlignment: 0,
          riskScore: 0,
          narrativeValue: 0,
          opportunityCost: 0,
          conversationFlow: 0,
        },
        confidence: 0,
        achievedGoals: [],
        riskedGoals: [],
        reasoning: 'No valid moves found',
      },
    };
  }

  // ============================================
  // Node Management
  // ============================================

  private createNode(
    state: SimulationSnapshot,
    move: ConversationMove | null,
    parent: ConversationNode | null
  ): ConversationNode {
    const stateHash = hashState(state);

    // Check cache
    const cached = this.nodeCache.get(stateHash);
    if (cached) {
      this.stats.cacheHits++;
      return cached;
    }

    const node: ConversationNode = {
      id: `node:${stateHash}`,
      state,
      move,
      parent,
      children: [],
      visits: 0,
      totalValue: 0,
      averageValue: 0,
      depth: parent ? parent.depth + 1 : 0,
      isFullyExpanded: false,
      isPruned: false,
      isTerminal: false,
    };

    this.nodeCache.set(stateHash, node);
    return node;
  }

  private createEmptyStats(): SearchStats {
    return {
      totalIterations: 0,
      timeElapsedMs: 0,
      maxDepthReached: 0,
      nodesCreated: 0,
      nodesPruned: 0,
      cacheHits: 0,
      averageConfidence: 0,
      bestScore: 0,
      worstScore: 0,
    };
  }

  // ============================================
  // Debugging
  // ============================================

  getStats(): SearchStats {
    return { ...this.stats };
  }

  dumpTree(maxDepth: number = 3): string {
    if (!this.rootNode) return 'No tree';

    const lines: string[] = [];
    this.dumpNode(this.rootNode, 0, maxDepth, lines);
    return lines.join('\n');
  }

  private dumpNode(
    node: ConversationNode,
    depth: number,
    maxDepth: number,
    lines: string[]
  ): void {
    if (depth > maxDepth) return;

    const indent = '  '.repeat(depth);
    const moveStr = node.move
      ? `[${node.move.template.id}]`
      : '[ROOT]';
    const statsStr = `v=${node.visits}, avg=${node.averageValue.toFixed(2)}`;
    const flagsStr = [
      node.isPruned ? 'PRUNED' : '',
      node.isFullyExpanded ? 'FULL' : '',
      node.isTerminal ? 'TERMINAL' : '',
    ]
      .filter(Boolean)
      .join(',');

    lines.push(`${indent}${moveStr} (${statsStr}) ${flagsStr}`);

    for (const child of node.children) {
      this.dumpNode(child, depth + 1, maxDepth, lines);
    }
  }
}

// ============================================
// Factory Functions
// ============================================

export function createSearchEngine(
  config?: Partial<SearchConfig>
): ConversationSearchEngine {
  return new ConversationSearchEngine(config);
}

export function searchForBestResponse(
  snapshot: SimulationSnapshot,
  npcSlug: string,
  objectives: NPCObjectives,
  templates: ResponseTemplate[],
  config?: Partial<SearchConfig>
): SearchResult {
  const engine = createSearchEngine(config);
  engine.setTemplates(templates);
  return engine.search(snapshot, npcSlug, objectives);
}

// ============================================
// Helper Functions
// ============================================

export function shouldUseSearch(
  pool: TemplatePool,
  tension: number,
  config: SearchConfig
): boolean {
  // Always search for certain pools
  if (config.useSearchForPools.includes(pool)) {
    return true;
  }

  // Search when tension is high
  if (tension >= config.minTensionForSearch) {
    return true;
  }

  return false;
}

export function formatSearchStats(stats: SearchStats): string {
  return [
    `Iterations: ${stats.totalIterations}`,
    `Time: ${stats.timeElapsedMs.toFixed(1)}ms`,
    `Depth: ${stats.maxDepthReached}`,
    `Nodes: ${stats.nodesCreated}`,
    `Pruned: ${stats.nodesPruned}`,
    `Cache hits: ${stats.cacheHits}`,
    `Best score: ${stats.bestScore.toFixed(2)}`,
    `Confidence: ${(stats.averageConfidence * 100).toFixed(0)}%`,
  ].join(' | ');
}

export function dumpSearchTree(engine: ConversationSearchEngine): string {
  return engine.dumpTree();
}
