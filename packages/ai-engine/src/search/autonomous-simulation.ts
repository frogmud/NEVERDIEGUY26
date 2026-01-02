/**
 * Autonomous Simulation System
 *
 * Background NPC-to-NPC interaction loop that runs while the player plays.
 * Detects interesting events, builds storylines, and develops player mythology.
 */

import type { ResponseTemplate, MoodType } from '../core/types';
import type { NPCBehaviorState, BehavioralState } from '../personality/behavioral-patterns';
import type {
  AutonomousConfig,
  SimulationSnapshot,
  InterestingEvent,
  InterestEventType,
  Storyline,
  StorylineType,
  BehaviorAnomaly,
  AnomalyType,
  ConversationMove,
} from './search-types';
import {
  cloneSnapshot,
  simulateSingleTurn,
  getNextSpeaker,
  getNextPool,
  generateCandidateMoves,
  isInterestingState,
  createNodeRng,
} from './simulation-utils';
import { ConversationSearchEngine } from './conversation-search';
import { getObjectivesForNPC } from './npc-goals';
import { createSeededRng } from '../core/seeded-rng';

// ============================================
// Autonomous Simulation Runner
// ============================================

export class AutonomousSimulation {
  private config: AutonomousConfig;
  private templates: ResponseTemplate[];
  private searchEngine: ConversationSearchEngine;

  private events: InterestingEvent[];
  private storylines: Map<string, Storyline>;
  private anomalies: BehaviorAnomaly[];

  private isRunning: boolean;
  private batchPromise: Promise<void> | null;
  private totalCycles: number;

  private recentMessages: string[];
  private stateHashes: number[];

  constructor(config: Partial<AutonomousConfig> = {}, templates: ResponseTemplate[] = []) {
    this.config = { ...getDefaultAutonomousConfig(), ...config };
    this.templates = templates;
    this.searchEngine = new ConversationSearchEngine();
    this.searchEngine.setTemplates(templates);

    this.events = [];
    this.storylines = new Map();
    this.anomalies = [];

    this.isRunning = false;
    this.batchPromise = null;
    this.totalCycles = 0;

    this.recentMessages = [];
    this.stateHashes = [];
  }

  setTemplates(templates: ResponseTemplate[]): void {
    this.templates = templates;
    this.searchEngine.setTemplates(templates);
  }

  async runBatch(
    snapshot: SimulationSnapshot,
    onTurn?: (turn: SimulatedTurn) => void
  ): Promise<BatchResult> {
    const batchEvents: InterestingEvent[] = [];
    const batchAnomalies: BehaviorAnomaly[] = [];
    let currentState = cloneSnapshot(snapshot);

    const startTime = performance.now();

    for (let i = 0; i < this.config.cyclesPerBatch; i++) {
      const result = this.runSingleCycle(currentState);

      if (result.turn) {
        currentState = result.newState;
        this.totalCycles++;

        if (onTurn) {
          onTurn(result.turn);
        }

        const event = this.detectInterestingEvent(result.turn, currentState);
        if (event) {
          batchEvents.push(event);
          this.events.push(event);
          this.updateStorylines(event);
        }

        const anomaly = this.detectAnomaly(result.turn, currentState);
        if (anomaly) {
          batchAnomalies.push(anomaly);
          this.anomalies.push(anomaly);
        }

        if (Math.random() < this.config.playerMythFrequency) {
          this.processPlayerMythology(result.turn, currentState);
        }
      } else {
        break;
      }

      if (i % 5 === 0) {
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
    }

    const timeElapsed = performance.now() - startTime;

    this.decayStorylines(currentState.context.turnNumber);

    return {
      finalState: currentState,
      events: batchEvents,
      anomalies: batchAnomalies,
      cyclesRun: this.config.cyclesPerBatch,
      timeMs: timeElapsed,
      activeStorylines: Array.from(this.storylines.values()).filter(
        (s) => s.status === 'active' || s.status === 'climax'
      ),
    };
  }

  private runSingleCycle(snapshot: SimulationSnapshot): CycleResult {
    const rng = createNodeRng(snapshot, `cycle:${this.totalCycles}`);
    const rngFn = () => rng.random('cycle');

    const speaker = getNextSpeaker(snapshot, rngFn);
    if (!speaker) {
      return { turn: null, newState: snapshot };
    }

    const useSearch = this.shouldUseSearchForNPC(speaker, snapshot);

    let move: ConversationMove | null = null;

    if (useSearch) {
      const objectives = getObjectivesForNPC(speaker, 'diplomat');
      const result = this.searchEngine.quickSearch(snapshot, speaker, objectives);
      if (result.template) {
        move = {
          template: result.template,
          speaker,
          pool: result.template.pool || 'idle',
        };
      }
    } else {
      const pool = getNextPool(snapshot, speaker, rngFn);
      const candidates = generateCandidateMoves(snapshot, this.templates, 3, rngFn);
      if (candidates.length > 0) {
        move = candidates[0];
      }
    }

    if (!move) {
      return { turn: null, newState: snapshot };
    }

    const newState = simulateSingleTurn(snapshot, move);

    this.trackForLoopDetection(move.template.text || '', newState);

    const turn: SimulatedTurn = {
      speaker: move.speaker,
      target: move.target,
      template: move.template,
      pool: move.pool,
      turnNumber: snapshot.context.turnNumber + snapshot.turnOffset,
    };

    return { turn, newState };
  }

  private shouldUseSearchForNPC(npcSlug: string, snapshot: SimulationSnapshot): boolean {
    if (snapshot.thread.tension > 0.6) {
      return true;
    }

    const npcCategory = this.getNPCCategory(npcSlug);
    if (npcCategory === 'pantheon') {
      return true;
    }

    return Math.random() < 0.2;
  }

  private getNPCCategory(npcSlug: string): string {
    const pantheon = ['the-one', 'john', 'peter', 'robert', 'alice', 'jane'];
    if (pantheon.includes(npcSlug)) return 'pantheon';
    return 'other';
  }

  // ============================================
  // Event Detection
  // ============================================

  private detectInterestingEvent(
    turn: SimulatedTurn,
    state: SimulationSnapshot
  ): InterestingEvent | null {
    const eventTypes = this.classifyEvent(turn, state);
    if (eventTypes.length === 0) return null;

    const primaryType = eventTypes[0];
    const interestScore = this.calculateInterestScore(turn, state, eventTypes);

    if (interestScore < this.config.interestThreshold) {
      return null;
    }

    const witnesses = state.activeNPCs.filter(
      (n) => n !== turn.speaker && n !== turn.target
    );

    return {
      id: `event:${turn.turnNumber}:${turn.speaker}`,
      turn: turn.turnNumber,
      timestamp: Date.now(),
      speaker: turn.speaker,
      target: turn.target,
      witnesses,
      type: primaryType,
      description: this.describeEvent(turn, state, primaryType),
      messageContent: turn.template.text || '',
      interestScore,
      tags: eventTypes,
    };
  }

  private classifyEvent(turn: SimulatedTurn, state: SimulationSnapshot): InterestEventType[] {
    const types: InterestEventType[] = [];
    const template = turn.template;

    if (turn.pool === 'threat' || turn.pool === 'npcConflict') {
      if (state.thread.tension > 0.7) {
        types.push('high_tension');
      }
      types.push('conflict_started');
    }

    if (turn.pool === 'npcAlliance') {
      types.push('alliance_formed');
    }

    if (turn.pool === 'lore' || turn.pool === 'npcLore') {
      types.push('knowledge_transfer');
      if (template.isSecret) {
        types.push('secret_revealed');
      }
    }

    if (turn.pool === 'npcGossip' && template.text?.toLowerCase().includes('player')) {
      types.push('player_discussed');
    }

    const behavior = state.behaviorStates.get(turn.speaker);
    if (behavior?.previous && behavior.previous !== behavior.current) {
      types.push('behavioral_shift');
    }

    if (template.effects) {
      if (template.effects.trustDelta && Math.abs(template.effects.trustDelta) >= 15) {
        types.push('relationship_milestone');
      }
      if (template.effects.fearDelta && template.effects.fearDelta >= 20) {
        types.push('high_tension');
      }
    }

    if (turn.target) {
      const familiarity = this.getFamiliarity(state, turn.speaker, turn.target);
      if (familiarity < 10 && template.effects?.familiarityDelta) {
        types.push('first_meeting');
      }
    }

    return types;
  }

  private getFamiliarity(state: SimulationSnapshot, from: string, to: string): number {
    const rels = state.relationships.get(from)?.get(to);
    return rels?.familiarity || 0;
  }

  private calculateInterestScore(
    turn: SimulatedTurn,
    state: SimulationSnapshot,
    eventTypes: InterestEventType[]
  ): number {
    let score = 0;

    const typeScores: Record<InterestEventType, number> = {
      first_meeting: 30,
      secret_revealed: 50,
      alliance_formed: 40,
      alliance_broken: 45,
      betrayal: 60,
      high_tension: 35,
      mood_contagion: 20,
      behavioral_shift: 25,
      player_discussed: 40,
      conflict_started: 35,
      conflict_resolved: 30,
      knowledge_transfer: 25,
      relationship_milestone: 35,
    };

    for (const type of eventTypes) {
      score += typeScores[type] || 10;
    }

    if (state.thread.tension > 0.8) score += 15;
    if (state.thread.participants.size >= 4) score += 10;
    if (isInterestingState(state)) score += 20;

    const witnessCount = state.activeNPCs.length - (turn.target ? 2 : 1);
    score += witnessCount * 5;

    return Math.min(100, score);
  }

  private describeEvent(
    turn: SimulatedTurn,
    state: SimulationSnapshot,
    type: InterestEventType
  ): string {
    const descriptions: Record<InterestEventType, () => string> = {
      first_meeting: () =>
        `${turn.speaker} and ${turn.target} had their first real conversation`,
      secret_revealed: () => `${turn.speaker} revealed a secret to ${turn.target || 'the group'}`,
      alliance_formed: () => `${turn.speaker} formed an alliance with ${turn.target}`,
      alliance_broken: () => `${turn.speaker} broke their alliance with ${turn.target}`,
      betrayal: () => `${turn.speaker} betrayed ${turn.target}`,
      high_tension: () => `Tension peaked during ${turn.speaker}'s confrontation`,
      mood_contagion: () => `${turn.speaker}'s mood spread to nearby NPCs`,
      behavioral_shift: () => {
        const behavior = state.behaviorStates.get(turn.speaker);
        return `${turn.speaker} shifted from ${behavior?.previous} to ${behavior?.current}`;
      },
      player_discussed: () => `${turn.speaker} speculated about the player`,
      conflict_started: () => `${turn.speaker} started a conflict with ${turn.target}`,
      conflict_resolved: () => `${turn.speaker} resolved their conflict with ${turn.target}`,
      knowledge_transfer: () =>
        `${turn.speaker} shared knowledge with ${turn.target || 'the group'}`,
      relationship_milestone: () =>
        `${turn.speaker} and ${turn.target} reached a relationship milestone`,
    };

    return descriptions[type]?.() || `${turn.speaker} did something interesting`;
  }

  // ============================================
  // Storyline Tracking
  // ============================================

  private updateStorylines(event: InterestingEvent): void {
    const participants = [event.speaker, event.target].filter(Boolean) as string[];
    const relatedStorylines = Array.from(this.storylines.values()).filter((s) =>
      participants.some((p) => s.primaryNPCs.includes(p) || s.secondaryNPCs.includes(p))
    );

    if (relatedStorylines.length > 0) {
      for (const storyline of relatedStorylines) {
        storyline.events.push(event.id);
        storyline.lastActivityTurn = event.turn;
        storyline.momentum = Math.min(1, storyline.momentum + 0.1);

        if (event.interestScore > 50 && storyline.tension > 0.7) {
          storyline.status = 'climax';
        } else if (storyline.status === 'emerging' && storyline.events.length >= 3) {
          storyline.status = 'active';
        }
      }
    } else if (event.interestScore >= 40) {
      const storyline = this.createStoryline(event);
      if (storyline) {
        this.storylines.set(storyline.id, storyline);
      }
    }
  }

  private createStoryline(event: InterestingEvent): Storyline | null {
    const type = this.inferStorylineType(event);
    if (!type) return null;

    const participants = [event.speaker, event.target].filter(Boolean) as string[];

    return {
      id: `storyline:${event.id}`,
      type,
      title: this.generateStorylineTitle(type, participants),
      primaryNPCs: participants,
      secondaryNPCs: event.witnesses,
      status: 'emerging',
      startTurn: event.turn,
      lastActivityTurn: event.turn,
      events: [event.id],
      tension: 0.3,
      momentum: 0.5,
    };
  }

  private inferStorylineType(event: InterestingEvent): StorylineType | null {
    if (event.type === 'conflict_started' || event.type === 'high_tension') {
      return 'rivalry';
    }
    if (event.type === 'alliance_formed') {
      return 'alliance';
    }
    if (event.type === 'secret_revealed') {
      return 'mystery';
    }
    if (event.type === 'betrayal') {
      return 'tragedy';
    }
    if (event.type === 'player_discussed') {
      return 'conspiracy';
    }
    return null;
  }

  private generateStorylineTitle(type: StorylineType, participants: string[]): string {
    const titles: Record<StorylineType, string> = {
      rivalry: `The ${participants[0]}-${participants[1]} Rivalry`,
      alliance: `The ${participants[0]}-${participants[1]} Alliance`,
      conspiracy: `The Conspiracy of ${participants[0]}`,
      redemption: `${participants[0]}'s Redemption`,
      tragedy: `The Fall of ${participants[0]}`,
      romance: `${participants[0]} and ${participants[1]}`,
      power_struggle: `The Struggle for Power`,
      mystery: `The Mystery Unfolds`,
    };
    return titles[type] || 'An Unfolding Story';
  }

  private decayStorylines(currentTurn: number): void {
    for (const [id, storyline] of this.storylines) {
      const inactivity = currentTurn - storyline.lastActivityTurn;

      if (inactivity > 20) {
        storyline.momentum -= this.config.storylineDecayRate;

        if (storyline.momentum <= 0) {
          storyline.status = 'abandoned';
        }
      }

      if (storyline.status === 'climax' && inactivity > 5) {
        storyline.status = 'resolved';
      }
    }
  }

  // ============================================
  // Anomaly Detection
  // ============================================

  private detectAnomaly(
    turn: SimulatedTurn,
    state: SimulationSnapshot
  ): BehaviorAnomaly | null {
    const checks: Array<() => BehaviorAnomaly | null> = [
      () => this.checkStuckState(turn.speaker, state),
      () => this.checkConversationLoop(turn, state),
      () => this.checkRelationshipParadox(turn.speaker, state),
      () => this.checkExtremeStats(turn.speaker, state),
    ];

    for (const check of checks) {
      const anomaly = check();
      if (anomaly) return anomaly;
    }

    return null;
  }

  private checkStuckState(npcSlug: string, state: SimulationSnapshot): BehaviorAnomaly | null {
    const behavior = state.behaviorStates.get(npcSlug);
    if (!behavior) return null;

    if (behavior.turnsInState >= this.config.stuckStateThreshold) {
      return {
        type: 'stuck_state',
        npcSlug,
        description: `${npcSlug} stuck in ${behavior.current} for ${behavior.turnsInState} turns`,
        turn: state.context.turnNumber,
        severity: behavior.turnsInState > 25 ? 'high' : 'medium',
        context: { state: behavior.current, turns: behavior.turnsInState },
      };
    }

    return null;
  }

  private checkConversationLoop(
    turn: SimulatedTurn,
    state: SimulationSnapshot
  ): BehaviorAnomaly | null {
    const message = turn.template.text || '';
    const recentMatch = this.recentMessages.filter((m) => m === message).length;

    if (recentMatch >= 3) {
      return {
        type: 'conversation_loop',
        npcSlug: turn.speaker,
        description: `${turn.speaker} repeating the same message`,
        turn: state.context.turnNumber,
        severity: 'medium',
        context: { message, repeatCount: recentMatch },
      };
    }

    return null;
  }

  private checkRelationshipParadox(
    npcSlug: string,
    state: SimulationSnapshot
  ): BehaviorAnomaly | null {
    const rels = state.relationships.get(npcSlug);
    if (!rels) return null;

    for (const [target, stats] of rels) {
      if (stats.trust > 60 && stats.fear > 60) {
        return {
          type: 'relationship_paradox',
          npcSlug,
          description: `${npcSlug} has both high trust (${stats.trust}) and high fear (${stats.fear}) of ${target}`,
          turn: state.context.turnNumber,
          severity: 'low',
          context: { target, stats },
        };
      }
    }

    return null;
  }

  private checkExtremeStats(
    npcSlug: string,
    state: SimulationSnapshot
  ): BehaviorAnomaly | null {
    const rels = state.relationships.get(npcSlug);
    if (!rels) return null;

    for (const [target, stats] of rels) {
      const extremes = Object.entries(stats).filter(
        ([_, value]) => Math.abs(value as number) >= 95
      );

      if (extremes.length >= 3) {
        return {
          type: 'extreme_stats',
          npcSlug,
          description: `${npcSlug} has ${extremes.length} extreme stats with ${target}`,
          turn: state.context.turnNumber,
          severity: 'low',
          context: { target, extremes },
        };
      }
    }

    return null;
  }

  private trackForLoopDetection(message: string, state: SimulationSnapshot): void {
    this.recentMessages.push(message);
    if (this.recentMessages.length > this.config.loopDetectionWindow) {
      this.recentMessages.shift();
    }
  }

  // ============================================
  // Player Mythology
  // ============================================

  private processPlayerMythology(turn: SimulatedTurn, state: SimulationSnapshot): void {
    if (
      turn.template.text?.toLowerCase().includes('player') ||
      turn.template.text?.toLowerCase().includes('newcomer') ||
      turn.template.text?.toLowerCase().includes('the one who')
    ) {
      const event = this.detectInterestingEvent(
        { ...turn, pool: 'npcGossip' },
        state
      );
      if (event && !event.type.includes('player_discussed')) {
        event.type = 'player_discussed';
        this.events.push(event);
      }
    }
  }

  // ============================================
  // Getters
  // ============================================

  getEvents(): InterestingEvent[] {
    return [...this.events];
  }

  getRecentEvents(count: number = 10): InterestingEvent[] {
    return this.events.slice(-count);
  }

  getStorylines(): Storyline[] {
    return Array.from(this.storylines.values());
  }

  getActiveStorylines(): Storyline[] {
    return this.getStorylines().filter(
      (s) => s.status === 'active' || s.status === 'climax'
    );
  }

  getAnomalies(): BehaviorAnomaly[] {
    return [...this.anomalies];
  }

  getTotalCycles(): number {
    return this.totalCycles;
  }

  reset(): void {
    this.events = [];
    this.storylines.clear();
    this.anomalies = [];
    this.recentMessages = [];
    this.stateHashes = [];
    this.totalCycles = 0;
  }

  pruneOldEvents(keepCount: number = 100): void {
    if (this.events.length > keepCount) {
      this.events = this.events.slice(-keepCount);
    }
  }
}

// ============================================
// Types
// ============================================

export interface SimulatedTurn {
  speaker: string;
  target?: string;
  template: ResponseTemplate;
  pool: string;
  turnNumber: number;
}

interface CycleResult {
  turn: SimulatedTurn | null;
  newState: SimulationSnapshot;
}

export interface BatchResult {
  finalState: SimulationSnapshot;
  events: InterestingEvent[];
  anomalies: BehaviorAnomaly[];
  cyclesRun: number;
  timeMs: number;
  activeStorylines: Storyline[];
}

// ============================================
// Factory Functions
// ============================================

function getDefaultAutonomousConfig(): AutonomousConfig {
  return {
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
}

export function createAutonomousSimulation(
  config?: Partial<AutonomousConfig>,
  templates?: ResponseTemplate[]
): AutonomousSimulation {
  return new AutonomousSimulation(config, templates);
}

// ============================================
// Convenience Functions
// ============================================

export async function runSimulationBatch(
  snapshot: SimulationSnapshot,
  templates: ResponseTemplate[],
  config?: Partial<AutonomousConfig>
): Promise<BatchResult> {
  const sim = createAutonomousSimulation(config, templates);
  return sim.runBatch(snapshot);
}

export function summarizeBatch(result: BatchResult): string {
  const lines: string[] = [];

  lines.push(`Ran ${result.cyclesRun} cycles in ${result.timeMs.toFixed(1)}ms`);

  if (result.events.length > 0) {
    lines.push(`\nInteresting Events (${result.events.length}):`);
    for (const event of result.events.slice(0, 5)) {
      lines.push(`  - ${event.description} (score: ${event.interestScore})`);
    }
    if (result.events.length > 5) {
      lines.push(`  ... and ${result.events.length - 5} more`);
    }
  }

  if (result.activeStorylines.length > 0) {
    lines.push(`\nActive Storylines (${result.activeStorylines.length}):`);
    for (const storyline of result.activeStorylines) {
      lines.push(`  - ${storyline.title} [${storyline.status}]`);
    }
  }

  if (result.anomalies.length > 0) {
    lines.push(`\nAnomalies Detected (${result.anomalies.length}):`);
    for (const anomaly of result.anomalies) {
      lines.push(`  - [${anomaly.severity}] ${anomaly.description}`);
    }
  }

  return lines.join('\n');
}
