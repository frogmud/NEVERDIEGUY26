/**
 * Gambling Simulation Runner
 *
 * Main orchestrator for running Cee-lo simulations between NPCs.
 * Handles:
 * - Running batches of matches
 * - Managing quit/return states
 * - Generating chat logs
 * - Tracking statistics
 * - Writing to log file
 */

import * as fs from 'fs';
import * as path from 'path';
import { createSeededRng, type SeededRng } from '../core/seeded-rng';
import { ALL_NPCS } from '../npcs/definitions';
import type { EnhancedNPCConfig } from '../npcs/types';
import type { MoodType } from '../core/types';
import {
  runFullMatch,
  createMatch,
  executeRound,
  generateMatchResult,
  CeeloStatisticsManager,
  type CeeloPlayer,
  type MatchResult,
  type CeeloEvent,
  type SimulationConfig,
  type SimulationResult,
  type CeeloChatMessage,
  type PlayerCategory,
} from '../games/ceelo';
import { GamblingEventDispatcher } from './event-dispatcher';
import { RivalryManager } from './rivalry-system';
import { QuitStateManager, evaluateQuitDecision, type QuitContext } from './quit-mechanics';
import type { BehavioralArchetype } from '../personality/behavioral-patterns';

// ============================================
// Simulation Config
// ============================================

export interface FullSimulationConfig extends SimulationConfig {
  playersPerMatch: number;
  logFilePath: string;
  persistStatsPath?: string;
}

export const DEFAULT_SIMULATION_CONFIG: FullSimulationConfig = {
  gamesToSimulate: 50,
  seed: `sim-${Date.now()}`,
  logPath: undefined,
  enableChat: true,
  playersPerMatch: 2,
  logFilePath: './logs/ceelo-chat.log',
};

// ============================================
// NPC State Tracking
// ============================================

interface NPCSimState {
  slug: string;
  name: string;
  category: PlayerCategory;
  archetype: BehavioralArchetype;
  currentMood: MoodType;
  moodIntensity: number;
  luckyNumber: number;
}

// Lucky numbers mapping (24 NPCs total)
const NPC_LUCKY_NUMBERS: Record<string, number> = {
  // Travelers (7)
  'stitch-up-girl': 3, 'the-general-traveler': 2, 'body-count': 6,
  'boots': 7, 'clausen': 4, 'keith-man': 5, 'mr-kevin': 1,
  // Wanderers (8)
  'willy': 5, 'mr-bones': 5, 'boo-g': 6, 'king-james': 1,
  'dr-maxwell': 4, 'the-general-wanderer': 2, 'dr-voss': 3, 'xtreme': 2,
  // Pantheon Die-rectors (6)
  'the-one': 1, 'john': 2, 'peter': 3, 'robert': 4, 'alice': 5, 'jane': 6,
  // Cosmic Horrors (3)
  'rhea': 0, 'zero-chance': 0, 'alien-baby': 0,
};

const COSMIC_HORRORS = ['rhea', 'zero-chance', 'alien-baby'];

function mapCategory(category: string): PlayerCategory {
  if (COSMIC_HORRORS.includes(category)) return 'cosmic_horror';
  switch (category) {
    case 'travelers': return 'traveler';
    case 'wanderers': return 'wanderer';
    case 'pantheon': return 'pantheon';
    default: return 'wanderer';
  }
}

// ============================================
// Gambling Simulation Class
// ============================================

export class GamblingSimulation {
  private config: FullSimulationConfig;
  private rng: SeededRng;
  private statsManager: CeeloStatisticsManager;
  private rivalryManager: RivalryManager;
  private quitManager: QuitStateManager;
  private eventDispatcher: GamblingEventDispatcher;
  private npcStates: Map<string, NPCSimState>;
  private chatLog: CeeloChatMessage[];
  private currentTurn: number;
  private logStream: fs.WriteStream | null;

  constructor(config: Partial<FullSimulationConfig> = {}) {
    this.config = { ...DEFAULT_SIMULATION_CONFIG, ...config };
    this.rng = createSeededRng(this.config.seed);
    this.statsManager = new CeeloStatisticsManager();
    this.rivalryManager = new RivalryManager();
    this.quitManager = new QuitStateManager();
    this.eventDispatcher = new GamblingEventDispatcher(this.rivalryManager);
    this.npcStates = new Map();
    this.chatLog = [];
    this.currentTurn = 0;
    this.logStream = null;

    // Initialize NPC states
    this.initializeNPCs();
  }

  /**
   * Initialize NPC states from definitions
   */
  private initializeNPCs(): void {
    for (const npc of ALL_NPCS) {
      const slug = npc.identity.slug;
      const isCosmicHorror = COSMIC_HORRORS.includes(slug);

      const state: NPCSimState = {
        slug,
        name: npc.identity.name,
        category: isCosmicHorror ? 'cosmic_horror' : mapCategory(npc.identity.category),
        archetype: npc.archetype,
        currentMood: npc.defaultMood,
        moodIntensity: 50,
        luckyNumber: NPC_LUCKY_NUMBERS[slug] ?? 0,
      };

      this.npcStates.set(slug, state);

      // Register with stats manager
      this.statsManager.registerPlayer({
        id: slug,
        slug,
        name: npc.identity.name,
        category: state.category,
        luckyNumber: state.luckyNumber,
      });
    }
  }

  /**
   * Open log file for writing
   */
  private openLogFile(): void {
    if (!this.config.logFilePath) return;

    const logDir = path.dirname(this.config.logFilePath);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    this.logStream = fs.createWriteStream(this.config.logFilePath, { flags: 'a' });
    this.logToFile(`\n${'='.repeat(60)}`);
    this.logToFile(`SIMULATION START: ${new Date().toISOString()}`);
    this.logToFile(`Seed: ${this.config.seed}`);
    this.logToFile(`Games to simulate: ${this.config.gamesToSimulate}`);
    this.logToFile(`${'='.repeat(60)}\n`);
  }

  /**
   * Close log file
   */
  private closeLogFile(): void {
    if (this.logStream) {
      this.logToFile(`\n${'='.repeat(60)}`);
      this.logToFile(`SIMULATION END: ${new Date().toISOString()}`);
      this.logToFile(`${'='.repeat(60)}\n`);
      this.logStream.end();
      this.logStream = null;
    }
  }

  /**
   * Write to log file
   */
  private logToFile(message: string): void {
    if (this.logStream) {
      this.logStream.write(message + '\n');
    }
  }

  /**
   * Log a chat message
   */
  private logChatMessage(msg: CeeloChatMessage): void {
    const timestamp = new Date(msg.timestamp).toISOString();
    const state = this.npcStates.get(msg.npcSlug);
    const name = state?.name ?? msg.npcSlug;
    this.logToFile(`[${timestamp}] ${name.toUpperCase()} (${msg.mood}): "${msg.text}"`);
  }

  /**
   * Get available players (not quitting)
   */
  private getAvailablePlayers(): CeeloPlayer[] {
    const available: CeeloPlayer[] = [];

    for (const [slug, state] of this.npcStates) {
      if (!this.quitManager.isQuitting(slug)) {
        available.push({
          id: slug,
          slug,
          name: state.name,
          category: state.category,
          luckyNumber: state.luckyNumber,
        });
      }
    }

    return available;
  }

  /**
   * Select players for a match
   */
  private selectMatchPlayers(count: number): CeeloPlayer[] {
    const available = this.getAvailablePlayers();
    if (available.length < count) {
      return available;
    }

    // Shuffle and take first N
    const shuffled = this.rng.shuffle(available, 'playerSelect');
    return shuffled.slice(0, count);
  }

  /**
   * Run a single match
   */
  private async runMatch(matchNumber: number): Promise<MatchResult | null> {
    const players = this.selectMatchPlayers(this.config.playersPerMatch);
    if (players.length < 2) {
      return null;
    }

    const matchId = `match-${matchNumber}-${this.config.seed}`;

    this.logToFile(`\n--- MATCH #${matchNumber} ---`);
    this.logToFile(`Players: ${players.map(p => p.name).join(' vs ')}`);

    // Create event handler for chat generation
    const matchEvents: CeeloEvent[] = [];
    const eventHandler = (event: CeeloEvent) => {
      matchEvents.push(event);

      // Log significant events
      if (event.type === 'round_ended') {
        const winner = event.data['winnerId'] as string;
        const loser = event.data['loserId'] as string;
        const gold = event.data['goldExchanged'] as number;
        const winnerState = this.npcStates.get(winner);
        const loserState = this.npcStates.get(loser);
        if (winner && loser) {
          this.logToFile(`  Round ${event.roundNumber}: ${winnerState?.name} defeats ${loserState?.name} (${gold} gold)`);
        }
      }
    };

    // Run the match
    const result = await runFullMatch(matchId, players, this.config.matchConfig, eventHandler);

    // Process events for chat
    if (this.config.enableChat) {
      this.processMatchEvents(matchEvents, players, result);
    }

    // Update stats
    this.statsManager.recordMatch(result);

    // Update rivalries
    const archetypes: Record<string, BehavioralArchetype> = {};
    for (const p of players) {
      archetypes[p.id] = this.npcStates.get(p.slug)?.archetype ?? 'diplomat';
    }
    this.rivalryManager.recordMatch(result, this.currentTurn, archetypes);

    // Check for quits
    this.processQuitChecks(result, matchEvents);

    // Log match result
    this.logToFile(`Result: ${result.standings[0]?.playerName} wins!`);
    this.logToFile(`Gold changes: ${Object.entries(result.goldChanges).map(([id, g]) => `${this.npcStates.get(id)?.name}: ${g > 0 ? '+' : ''}${g}`).join(', ')}`);

    return result;
  }

  /**
   * Process match events for chat generation
   */
  private processMatchEvents(
    events: CeeloEvent[],
    players: CeeloPlayer[],
    result: MatchResult
  ): void {
    for (const event of events) {
      const primaryState = this.npcStates.get(event.primaryPlayerId);
      if (!primaryState) continue;

      const secondaryState = event.secondaryPlayerId
        ? this.npcStates.get(event.secondaryPlayerId)
        : undefined;

      const dispatchResult = this.eventDispatcher.dispatch({
        event,
        speakerSlug: primaryState.slug,
        speakerName: primaryState.name,
        speakerMood: primaryState.currentMood,
        speakerArchetype: primaryState.archetype,
        targetSlug: secondaryState?.slug,
        targetName: secondaryState?.name,
        playerState: result.playerStats[event.primaryPlayerId],
        opponentState: event.secondaryPlayerId ? result.playerStats[event.secondaryPlayerId] : undefined,
        rng: () => this.rng.random('chat'),
      });

      // Log chat messages
      for (const msg of dispatchResult.messages) {
        this.chatLog.push(msg);
        this.logChatMessage(msg);
      }

      // Apply mood changes
      for (const change of dispatchResult.moodChanges) {
        const state = this.npcStates.get(change.npcSlug);
        if (state) {
          state.currentMood = change.newMood;
          state.moodIntensity = change.newIntensity;
        }
      }
    }
  }

  /**
   * Check if any players should quit after a match
   */
  private processQuitChecks(result: MatchResult, events: CeeloEvent[]): void {
    for (const standing of result.standings) {
      const state = this.npcStates.get(standing.playerId);
      if (!state) continue;

      const playerStats = result.playerStats[standing.playerId];
      const lastEvent = events[events.length - 1];

      const quitContext: QuitContext = {
        playerState: playerStats,
        currentMood: state.currentMood,
        archetype: state.archetype,
        category: state.category,
        lastEvent,
        currentTurn: this.currentTurn,
        config: this.quitManager['config'], // Access internal config
      };

      const decision = evaluateQuitDecision(quitContext, () => this.rng.random('quit'));

      if (decision.shouldQuit) {
        this.quitManager.recordQuit(standing.playerId, this.currentTurn, decision);
        this.logToFile(`  *** ${state.name} QUITS! (${decision.reason}) - Cooldown: ${decision.cooldown} turns`);

        // Generate quit message
        const quitEvent: CeeloEvent = {
          type: 'player_quit',
          matchId: result.matchId,
          roundNumber: result.totalRounds,
          timestamp: Date.now(),
          primaryPlayerId: standing.playerId,
          data: { reason: decision.reason },
          emotionalWeight: 5,
        };

        const dispatchResult = this.eventDispatcher.dispatch({
          event: quitEvent,
          speakerSlug: state.slug,
          speakerName: state.name,
          speakerMood: state.currentMood,
          speakerArchetype: state.archetype,
          playerState: playerStats,
          rng: () => this.rng.random('quitChat'),
        });

        for (const msg of dispatchResult.messages) {
          this.chatLog.push(msg);
          this.logChatMessage(msg);
        }
      }
    }
  }

  /**
   * Process returns at start of each match cycle
   */
  private processReturns(): void {
    const returns = this.quitManager.processReturns(
      this.currentTurn,
      () => this.rng.random('return')
    );

    for (const { npcSlug, returnedEarly } of returns) {
      const state = this.npcStates.get(npcSlug);
      if (!state) continue;

      this.logToFile(`  *** ${state.name} RETURNS! ${returnedEarly ? '(early)' : ''}`);

      // Generate return message
      const returnEvent: CeeloEvent = {
        type: 'player_returned',
        matchId: '',
        roundNumber: 0,
        timestamp: Date.now(),
        primaryPlayerId: npcSlug,
        data: { returnedEarly },
        emotionalWeight: 3,
      };

      const dispatchResult = this.eventDispatcher.dispatch({
        event: returnEvent,
        speakerSlug: state.slug,
        speakerName: state.name,
        speakerMood: 'neutral',
        speakerArchetype: state.archetype,
        playerState: { playerId: npcSlug } as any, // Minimal state for return
        rng: () => this.rng.random('returnChat'),
      });

      for (const msg of dispatchResult.messages) {
        this.chatLog.push(msg);
        this.logChatMessage(msg);
      }

      // Reset mood on return
      state.currentMood = 'neutral';
      state.moodIntensity = 50;
    }
  }

  /**
   * Run the full simulation
   */
  async run(): Promise<SimulationResult> {
    const startTime = Date.now();
    this.openLogFile();

    let gamesPlayed = 0;

    for (let i = 0; i < this.config.gamesToSimulate; i++) {
      this.currentTurn++;

      // Process returns
      this.processReturns();

      // Run match
      const result = await this.runMatch(i + 1);
      if (result) {
        gamesPlayed++;
      }

      // Yield to event loop
      await new Promise(resolve => setTimeout(resolve, 0));
    }

    const endTime = Date.now();

    // Generate leaderboard
    const leaderboard = this.statsManager.getLeaderboard('winRate');

    // Collect notable events
    const notableEvents = this.chatLog
      .filter(msg => msg.context.event.emotionalWeight >= 6)
      .map(msg => msg.context.event);

    this.closeLogFile();

    return {
      gamesPlayed,
      startTime,
      endTime,
      leaderboard,
      chatLog: this.chatLog,
      notableEvents,
    };
  }

  /**
   * Get current stats manager
   */
  getStatsManager(): CeeloStatisticsManager {
    return this.statsManager;
  }

  /**
   * Get rivalry manager
   */
  getRivalryManager(): RivalryManager {
    return this.rivalryManager;
  }

  /**
   * Export simulation state for persistence
   */
  exportState(): {
    stats: ReturnType<CeeloStatisticsManager['export']>;
    rivalries: ReturnType<RivalryManager['export']>;
    quits: ReturnType<QuitStateManager['export']>;
  } {
    return {
      stats: this.statsManager.export(),
      rivalries: this.rivalryManager.export(),
      quits: this.quitManager.export(),
    };
  }

  /**
   * Import simulation state from persistence
   */
  importState(state: ReturnType<GamblingSimulation['exportState']>): void {
    this.statsManager.import(state.stats);
    this.rivalryManager.import(state.rivalries);
    this.quitManager.import(state.quits);
  }
}

// ============================================
// Convenience Functions
// ============================================

/**
 * Run a quick simulation batch
 */
export async function runCeeloBatch(
  gamesToSimulate: number,
  seed?: string
): Promise<SimulationResult> {
  const sim = new GamblingSimulation({
    gamesToSimulate,
    seed: seed ?? `batch-${Date.now()}`,
    enableChat: true,
  });

  return sim.run();
}

/**
 * Run simulation on app startup (time-based batch)
 */
export async function runStartupSimulation(
  lastTimestamp: number,
  gamesPerHour: number = 10,
  maxGames: number = 100
): Promise<SimulationResult> {
  const hoursSinceLastSession = (Date.now() - lastTimestamp) / (1000 * 60 * 60);
  const gamesToSimulate = Math.min(maxGames, Math.floor(hoursSinceLastSession * gamesPerHour));

  if (gamesToSimulate <= 0) {
    return {
      gamesPlayed: 0,
      startTime: Date.now(),
      endTime: Date.now(),
      leaderboard: [],
      chatLog: [],
      notableEvents: [],
    };
  }

  return runCeeloBatch(gamesToSimulate);
}
