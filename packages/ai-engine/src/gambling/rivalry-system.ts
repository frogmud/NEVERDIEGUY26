/**
 * Gambling Rivalry System
 *
 * Tracks and manages rivalries between NPCs that develop through repeated
 * gambling interactions. Rivalries affect:
 * - Template selection (prefer rivalry-specific lines)
 * - Mood intensity when facing rivals
 * - Betting behavior (higher stakes against rivals)
 */

import type { BehavioralArchetype } from '../personality/behavioral-patterns';
import type { MatchResult, CeeloEvent } from '../games/ceelo/types';
import { getRivalryIntensityMod } from './mood-mapping';

// ============================================
// Rivalry Types
// ============================================

export type RivalryOrigin =
  | 'natural'         // Formed through many matches
  | 'trash_talk'      // Formed from heated words
  | 'bad_beat'        // Formed from devastating loss
  | 'streak_breaker'  // Formed when someone ended a big streak
  | 'underdog'        // Formed when underdog beats favorite repeatedly
  | 'domain_conflict'; // NPCs from opposing domains (e.g., Earth vs Infernus)

export interface RivalryState {
  npcSlug: string;
  opponentSlug: string;
  headToHeadWins: number;
  headToHeadLosses: number;
  lastMatchTurn: number;
  lastMatchTimestamp: number;
  intensity: number;  // 0-100
  origin: RivalryOrigin;
  notableEvents: RivalryEvent[];
  isActive: boolean;
}

export interface RivalryEvent {
  turn: number;
  timestamp: number;
  type: 'bad_beat' | 'streak_break' | 'domination' | 'upset' | 'trash_talk';
  description: string;
  intensityChange: number;
}

export interface RivalryConfig {
  minMatchesForRivalry: number;    // Default: 3
  intensityDecayPerTurn: number;   // Default: 0.5
  intensityGrowthOnMatch: number;  // Default: 5
  badBeatIntensityBonus: number;   // Default: 15
  streakBreakIntensityBonus: number; // Default: 10
  maxRivalriesPerNPC: number;      // Default: 3
  rivalryFadeThreshold: number;    // Default: 10 (below this, rivalry fades)
  dominationThreshold: number;     // Default: 3 (wins ahead to trigger domination)
}

export const DEFAULT_RIVALRY_CONFIG: RivalryConfig = {
  minMatchesForRivalry: 3,
  intensityDecayPerTurn: 0.5,
  intensityGrowthOnMatch: 5,
  badBeatIntensityBonus: 15,
  streakBreakIntensityBonus: 10,
  maxRivalriesPerNPC: 3,
  rivalryFadeThreshold: 10,
  dominationThreshold: 3,
};

// ============================================
// Rivalry Manager
// ============================================

export class RivalryManager {
  // Map of npcSlug -> opponentSlug -> RivalryState
  private rivalries: Map<string, Map<string, RivalryState>>;
  private config: RivalryConfig;
  private currentTurn: number;

  constructor(config: Partial<RivalryConfig> = {}) {
    this.rivalries = new Map();
    this.config = { ...DEFAULT_RIVALRY_CONFIG, ...config };
    this.currentTurn = 0;
  }

  // ============================================
  // Match Recording
  // ============================================

  /**
   * Record a match result and update rivalries
   */
  recordMatch(
    matchResult: MatchResult,
    currentTurn: number,
    archetypes: Record<string, BehavioralArchetype>
  ): void {
    this.currentTurn = currentTurn;

    // For each pair of players, update their head-to-head
    const players = matchResult.standings;
    for (let i = 0; i < players.length; i++) {
      for (let j = i + 1; j < players.length; j++) {
        const player1 = players[i];
        const player2 = players[j];

        // Determine who won this matchup
        const stats1 = matchResult.playerStats[player1.playerId];
        const stats2 = matchResult.playerStats[player2.playerId];

        if (stats1 && stats2) {
          const player1Won = stats1.wins > stats2.wins;
          const player2Won = stats2.wins > stats1.wins;

          if (player1Won) {
            this.updateRivalry(
              player1.playerId,
              player2.playerId,
              'win',
              matchResult,
              archetypes[player1.playerId],
              currentTurn
            );
            this.updateRivalry(
              player2.playerId,
              player1.playerId,
              'loss',
              matchResult,
              archetypes[player2.playerId],
              currentTurn
            );
          } else if (player2Won) {
            this.updateRivalry(
              player2.playerId,
              player1.playerId,
              'win',
              matchResult,
              archetypes[player2.playerId],
              currentTurn
            );
            this.updateRivalry(
              player1.playerId,
              player2.playerId,
              'loss',
              matchResult,
              archetypes[player1.playerId],
              currentTurn
            );
          }
        }
      }
    }

    // Process special events for rivalry intensity
    this.processMatchEvents(matchResult, archetypes, currentTurn);

    // Decay inactive rivalries
    this.decayInactiveRivalries(currentTurn);
  }

  /**
   * Update rivalry between two NPCs
   */
  private updateRivalry(
    npcSlug: string,
    opponentSlug: string,
    result: 'win' | 'loss',
    matchResult: MatchResult,
    archetype: BehavioralArchetype | undefined,
    currentTurn: number
  ): void {
    // Get or create rivalry map for this NPC
    if (!this.rivalries.has(npcSlug)) {
      this.rivalries.set(npcSlug, new Map());
    }
    const npcRivalries = this.rivalries.get(npcSlug)!;

    // Get or create rivalry state
    let rivalry = npcRivalries.get(opponentSlug);
    if (!rivalry) {
      rivalry = this.createEmptyRivalry(npcSlug, opponentSlug, currentTurn);
      npcRivalries.set(opponentSlug, rivalry);
    }

    // Update head-to-head
    if (result === 'win') {
      rivalry.headToHeadWins++;
    } else {
      rivalry.headToHeadLosses++;
    }

    rivalry.lastMatchTurn = currentTurn;
    rivalry.lastMatchTimestamp = Date.now();

    // Calculate intensity growth
    let intensityGrowth = this.config.intensityGrowthOnMatch;

    // Apply archetype modifier
    if (archetype) {
      intensityGrowth *= getRivalryIntensityMod(archetype);
    }

    // Bonus for close matches
    const totalMatches = rivalry.headToHeadWins + rivalry.headToHeadLosses;
    const winDiff = Math.abs(rivalry.headToHeadWins - rivalry.headToHeadLosses);
    if (winDiff <= 2 && totalMatches >= 3) {
      intensityGrowth += 5; // Close rivalry = more intense
    }

    rivalry.intensity = Math.min(100, rivalry.intensity + intensityGrowth);

    // Check if rivalry should become active
    if (!rivalry.isActive && totalMatches >= this.config.minMatchesForRivalry) {
      rivalry.isActive = true;
      rivalry.origin = this.determineRivalryOrigin(rivalry, matchResult);
    }

    // Enforce max rivalries limit
    this.enforceMaxRivalries(npcSlug);
  }

  /**
   * Process match events for rivalry intensity boosts
   */
  private processMatchEvents(
    matchResult: MatchResult,
    archetypes: Record<string, BehavioralArchetype>,
    currentTurn: number
  ): void {
    for (const event of matchResult.notableEvents) {
      if (event.type === 'bad_beat' && event.secondaryPlayerId) {
        this.addRivalryEvent(
          event.primaryPlayerId,
          event.secondaryPlayerId,
          {
            turn: currentTurn,
            timestamp: Date.now(),
            type: 'bad_beat',
            description: `Lost with ${event.data['loserRoll']} to ${event.data['winnerRoll']}`,
            intensityChange: this.config.badBeatIntensityBonus,
          }
        );
      }

      if (event.type === 'streak_broken' && event.secondaryPlayerId) {
        const previousStreak = event.data['previousStreak'] as number ?? 0;
        this.addRivalryEvent(
          event.primaryPlayerId,
          event.secondaryPlayerId,
          {
            turn: currentTurn,
            timestamp: Date.now(),
            type: 'streak_break',
            description: `${previousStreak}-game streak broken`,
            intensityChange: this.config.streakBreakIntensityBonus + Math.floor(previousStreak / 2),
          }
        );
      }

      if (event.type === 'upset_victory' && event.secondaryPlayerId) {
        this.addRivalryEvent(
          event.primaryPlayerId,
          event.secondaryPlayerId,
          {
            turn: currentTurn,
            timestamp: Date.now(),
            type: 'upset',
            description: `Upset victory against streak holder`,
            intensityChange: 8,
          }
        );
      }
    }
  }

  /**
   * Add a notable event to a rivalry
   */
  private addRivalryEvent(
    npcSlug: string,
    opponentSlug: string,
    event: RivalryEvent
  ): void {
    const rivalry = this.getRivalry(npcSlug, opponentSlug);
    if (rivalry) {
      rivalry.notableEvents.push(event);
      rivalry.intensity = Math.min(100, rivalry.intensity + event.intensityChange);

      // Keep only last 10 events
      if (rivalry.notableEvents.length > 10) {
        rivalry.notableEvents = rivalry.notableEvents.slice(-10);
      }
    }
  }

  // ============================================
  // Rivalry Queries
  // ============================================

  /**
   * Get rivalry between two NPCs
   */
  getRivalry(npcSlug: string, opponentSlug: string): RivalryState | null {
    return this.rivalries.get(npcSlug)?.get(opponentSlug) ?? null;
  }

  /**
   * Get all active rivalries for an NPC
   */
  getActiveRivalries(npcSlug: string): RivalryState[] {
    const npcRivalries = this.rivalries.get(npcSlug);
    if (!npcRivalries) return [];

    return Array.from(npcRivalries.values())
      .filter(r => r.isActive)
      .sort((a, b) => b.intensity - a.intensity);
  }

  /**
   * Get top rival for an NPC
   */
  getTopRival(npcSlug: string): RivalryState | null {
    const active = this.getActiveRivalries(npcSlug);
    return active.length > 0 ? active[0] : null;
  }

  /**
   * Check if two NPCs are rivals
   */
  areRivals(npcSlug1: string, npcSlug2: string): boolean {
    const rivalry = this.getRivalry(npcSlug1, npcSlug2);
    return rivalry?.isActive ?? false;
  }

  /**
   * Get rivalry intensity between two NPCs (0 if no rivalry)
   */
  getRivalryIntensity(npcSlug: string, opponentSlug: string): number {
    const rivalry = this.getRivalry(npcSlug, opponentSlug);
    return rivalry?.isActive ? rivalry.intensity : 0;
  }

  // ============================================
  // Rivalry Maintenance
  // ============================================

  /**
   * Create an empty rivalry state
   */
  private createEmptyRivalry(
    npcSlug: string,
    opponentSlug: string,
    currentTurn: number
  ): RivalryState {
    return {
      npcSlug,
      opponentSlug,
      headToHeadWins: 0,
      headToHeadLosses: 0,
      lastMatchTurn: currentTurn,
      lastMatchTimestamp: Date.now(),
      intensity: 0,
      origin: 'natural',
      notableEvents: [],
      isActive: false,
    };
  }

  /**
   * Determine origin of a rivalry
   */
  private determineRivalryOrigin(
    rivalry: RivalryState,
    matchResult: MatchResult
  ): RivalryOrigin {
    // Check for specific origins based on events
    const hasBackBeat = rivalry.notableEvents.some(e => e.type === 'bad_beat');
    const hasStreakBreak = rivalry.notableEvents.some(e => e.type === 'streak_break');
    const hasUpset = rivalry.notableEvents.some(e => e.type === 'upset');

    if (hasBackBeat) return 'bad_beat';
    if (hasStreakBreak) return 'streak_breaker';
    if (hasUpset) return 'underdog';

    // Close rivalry = natural
    const totalMatches = rivalry.headToHeadWins + rivalry.headToHeadLosses;
    const winDiff = Math.abs(rivalry.headToHeadWins - rivalry.headToHeadLosses);
    if (totalMatches >= 5 && winDiff <= 2) {
      return 'natural';
    }

    return 'natural';
  }

  /**
   * Decay inactive rivalries over time
   */
  private decayInactiveRivalries(currentTurn: number): void {
    for (const [npcSlug, rivalries] of this.rivalries) {
      for (const [opponentSlug, rivalry] of rivalries) {
        const turnsSinceMatch = currentTurn - rivalry.lastMatchTurn;

        // Decay intensity for inactive rivalries
        if (turnsSinceMatch > 5) {
          rivalry.intensity -= this.config.intensityDecayPerTurn * turnsSinceMatch;
          rivalry.intensity = Math.max(0, rivalry.intensity);

          // Deactivate if intensity falls below threshold
          if (rivalry.intensity < this.config.rivalryFadeThreshold) {
            rivalry.isActive = false;
          }
        }
      }
    }
  }

  /**
   * Enforce maximum rivalries per NPC
   */
  private enforceMaxRivalries(npcSlug: string): void {
    const npcRivalries = this.rivalries.get(npcSlug);
    if (!npcRivalries) return;

    const activeRivalries = Array.from(npcRivalries.values())
      .filter(r => r.isActive)
      .sort((a, b) => b.intensity - a.intensity);

    // Deactivate weakest rivalries if over limit
    if (activeRivalries.length > this.config.maxRivalriesPerNPC) {
      for (let i = this.config.maxRivalriesPerNPC; i < activeRivalries.length; i++) {
        activeRivalries[i].isActive = false;
      }
    }
  }

  // ============================================
  // Template Selection Helpers
  // ============================================

  /**
   * Get rivalry weight modifier for template selection
   * Returns multiplier (1.0 = no bonus, 2.0 = double weight for rivalry templates)
   */
  getRivalryTemplateWeight(npcSlug: string, opponentSlug: string): number {
    const intensity = this.getRivalryIntensity(npcSlug, opponentSlug);
    if (intensity === 0) return 1.0;

    // Intensity 50 = 1.5x weight, intensity 100 = 2.0x weight
    return 1.0 + (intensity / 100);
  }

  /**
   * Should use rivalry-specific template?
   */
  shouldUseRivalryTemplate(
    npcSlug: string,
    opponentSlug: string,
    rng: () => number
  ): boolean {
    const intensity = this.getRivalryIntensity(npcSlug, opponentSlug);
    if (intensity === 0) return false;

    // 30% base chance + intensity bonus
    const chance = 0.3 + (intensity / 200);
    return rng() < chance;
  }

  // ============================================
  // Serialization
  // ============================================

  /**
   * Export rivalries for persistence
   */
  export(): Record<string, Record<string, RivalryState>> {
    const result: Record<string, Record<string, RivalryState>> = {};
    for (const [npcSlug, rivalries] of this.rivalries) {
      result[npcSlug] = Object.fromEntries(rivalries);
    }
    return result;
  }

  /**
   * Import rivalries from persistence
   */
  import(data: Record<string, Record<string, RivalryState>>): void {
    this.rivalries.clear();
    for (const [npcSlug, rivalries] of Object.entries(data)) {
      this.rivalries.set(npcSlug, new Map(Object.entries(rivalries)));
    }
  }

  /**
   * Clear all rivalries
   */
  clear(): void {
    this.rivalries.clear();
  }
}
