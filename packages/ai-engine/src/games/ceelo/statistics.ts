/**
 * Cee-lo Statistics Manager
 *
 * Tracks and aggregates player statistics across multiple matches.
 * Provides leaderboard generation and career stats management.
 */

import type {
  PlayerCareerStats,
  LeaderboardEntry,
  MatchResult,
  PlayerMatchState,
  DieValue,
  PlayerCategory,
  CeeloPlayer,
} from './types';

// ============================================
// Sort Criteria Type
// ============================================

export type SortCriteria = 'winRate' | 'wins' | 'netGold' | 'streak' | 'matches';

// ============================================
// Statistics Manager Class
// ============================================

export class CeeloStatisticsManager {
  private careerStats: Map<string, PlayerCareerStats>;
  private matchHistory: MatchResult[];
  private players: Map<string, CeeloPlayer>;

  constructor() {
    this.careerStats = new Map();
    this.matchHistory = [];
    this.players = new Map();
  }

  // ============================================
  // Player Registration
  // ============================================

  /**
   * Register a player for stat tracking
   */
  registerPlayer(player: CeeloPlayer): void {
    this.players.set(player.id, player);

    if (!this.careerStats.has(player.id)) {
      this.careerStats.set(player.id, this.createEmptyCareerStats(player));
    }
  }

  /**
   * Register multiple players
   */
  registerPlayers(players: CeeloPlayer[]): void {
    for (const player of players) {
      this.registerPlayer(player);
    }
  }

  /**
   * Create empty career stats for a new player
   */
  private createEmptyCareerStats(player: CeeloPlayer): PlayerCareerStats {
    return {
      slug: player.slug,
      name: player.name,
      category: player.category,
      matchesPlayed: 0,
      matchesWon: 0,
      matchWinRate: 0,
      totalWins: 0,
      totalLosses: 0,
      totalPushes: 0,
      roundWinRate: 0,
      instantWins: 0,
      instantLosses: 0,
      tripsRolled: 0,
      pointsSet: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 } as Record<DieValue, number>,
      totalRerolls: 0,
      averageRerolls: 0,
      currentStreak: 0,
      bestWinStreak: 0,
      worstLossStreak: 0,
      totalGoldWon: 0,
      totalGoldLost: 0,
      netGold: 0,
      favoritePoint: null,
      status: 'active',
      lastGameTimestamp: 0,
    };
  }

  // ============================================
  // Match Recording
  // ============================================

  /**
   * Record a completed match and update career stats
   */
  recordMatch(result: MatchResult): void {
    this.matchHistory.push(result);

    // Update each player's career stats
    for (const standing of result.standings) {
      this.updateCareerStats(standing.playerId, result);
    }
  }

  /**
   * Update a player's career stats from a match result
   */
  private updateCareerStats(playerId: string, result: MatchResult): void {
    const stats = this.careerStats.get(playerId);
    if (!stats) return;

    const playerStats = result.playerStats[playerId];
    if (!playerStats) return;

    const standing = result.standings.find(s => s.playerId === playerId);
    if (!standing) return;

    // Match-level stats
    stats.matchesPlayed++;
    if (standing.rank === 1) {
      stats.matchesWon++;
    }
    stats.matchWinRate = stats.matchesWon / stats.matchesPlayed;

    // Round-level stats
    stats.totalWins += playerStats.wins;
    stats.totalLosses += playerStats.losses;
    stats.totalPushes += playerStats.pushes;
    const totalRounds = stats.totalWins + stats.totalLosses;
    stats.roundWinRate = totalRounds > 0 ? stats.totalWins / totalRounds : 0;

    // Detailed roll stats
    stats.instantWins += playerStats.rollStats.instantWins;
    stats.instantLosses += playerStats.rollStats.instantLosses;
    stats.tripsRolled += playerStats.rollStats.trips;
    stats.totalRerolls += playerStats.rollStats.totalRerolls;

    for (const [point, count] of Object.entries(playerStats.rollStats.points)) {
      stats.pointsSet[Number(point) as DieValue] += count;
    }

    // Calculate average rerolls
    const totalRolls = stats.instantWins + stats.instantLosses + stats.tripsRolled +
      Object.values(stats.pointsSet).reduce((a, b) => a + b, 0);
    stats.averageRerolls = totalRolls > 0 ? stats.totalRerolls / totalRolls : 0;

    // Streak tracking
    stats.currentStreak = playerStats.currentStreak;
    if (standing.bestStreak > stats.bestWinStreak) {
      stats.bestWinStreak = standing.bestStreak;
    }
    if (playerStats.currentStreak < stats.worstLossStreak) {
      stats.worstLossStreak = playerStats.currentStreak;
    }

    // Gold stats
    stats.totalGoldWon += playerStats.goldWon;
    stats.totalGoldLost += playerStats.goldLost;
    stats.netGold = stats.totalGoldWon - stats.totalGoldLost;

    // Favorite point
    let maxPointCount = 0;
    let favoritePoint: DieValue | null = null;
    for (const [point, count] of Object.entries(stats.pointsSet)) {
      if (count > maxPointCount) {
        maxPointCount = count;
        favoritePoint = Number(point) as DieValue;
      }
    }
    stats.favoritePoint = favoritePoint;

    // Status update
    stats.status = this.determineStatus(stats);
    stats.lastGameTimestamp = result.endTime;
  }

  /**
   * Determine player status based on stats
   */
  private determineStatus(stats: PlayerCareerStats): 'active' | 'resting' | 'tilted' | 'on_fire' {
    // On fire: 7+ win streak
    if (stats.currentStreak >= 7) {
      return 'on_fire';
    }

    // Tilted: 5+ loss streak or lost 50+ gold in recent matches
    if (stats.currentStreak <= -5) {
      return 'tilted';
    }

    // Resting: determined externally by quit mechanics
    // For now, just return active
    return 'active';
  }

  // ============================================
  // Career Stats Retrieval
  // ============================================

  /**
   * Get career stats for a player
   */
  getCareerStats(playerId: string): PlayerCareerStats | null {
    return this.careerStats.get(playerId) ?? null;
  }

  /**
   * Get all career stats
   */
  getAllCareerStats(): PlayerCareerStats[] {
    return Array.from(this.careerStats.values());
  }

  // ============================================
  // Leaderboard Generation
  // ============================================

  /**
   * Generate leaderboard sorted by given criteria
   */
  getLeaderboard(sortBy: SortCriteria = 'winRate'): LeaderboardEntry[] {
    const entries: LeaderboardEntry[] = Array.from(this.careerStats.values())
      .filter(stats => stats.matchesPlayed > 0)
      .map(stats => ({
        rank: 0,
        slug: stats.slug,
        name: stats.name,
        category: stats.category,
        wins: stats.totalWins,
        losses: stats.totalLosses,
        winRate: stats.roundWinRate,
        currentStreak: stats.currentStreak,
        netGold: stats.netGold,
        status: stats.status,
      }));

    // Sort based on criteria
    entries.sort((a, b) => {
      switch (sortBy) {
        case 'winRate':
          if (b.winRate !== a.winRate) return b.winRate - a.winRate;
          return b.wins - a.wins; // Secondary: total wins
        case 'wins':
          return b.wins - a.wins;
        case 'netGold':
          return b.netGold - a.netGold;
        case 'streak':
          return b.currentStreak - a.currentStreak;
        case 'matches':
          return (b.wins + b.losses) - (a.wins + a.losses);
        default:
          return b.winRate - a.winRate;
      }
    });

    // Assign ranks
    entries.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    return entries;
  }

  /**
   * Get leaderboard filtered by category
   */
  getLeaderboardByCategory(
    category: PlayerCategory,
    sortBy: SortCriteria = 'winRate'
  ): LeaderboardEntry[] {
    return this.getLeaderboard(sortBy).filter(e => e.category === category);
  }

  // ============================================
  // Head-to-Head Stats
  // ============================================

  /**
   * Get head-to-head record between two players
   */
  getHeadToHead(player1Id: string, player2Id: string): {
    player1Wins: number;
    player2Wins: number;
    pushes: number;
    totalMatches: number;
  } {
    let player1Wins = 0;
    let player2Wins = 0;
    let pushes = 0;

    for (const match of this.matchHistory) {
      // Check if both players were in this match
      const p1Stats = match.playerStats[player1Id];
      const p2Stats = match.playerStats[player2Id];

      if (!p1Stats || !p2Stats) continue;

      // For now, we track at match level (who placed higher)
      const p1Standing = match.standings.find(s => s.playerId === player1Id);
      const p2Standing = match.standings.find(s => s.playerId === player2Id);

      if (p1Standing && p2Standing) {
        if (p1Standing.rank < p2Standing.rank) {
          player1Wins++;
        } else if (p2Standing.rank < p1Standing.rank) {
          player2Wins++;
        } else {
          pushes++;
        }
      }
    }

    return {
      player1Wins,
      player2Wins,
      pushes,
      totalMatches: player1Wins + player2Wins + pushes,
    };
  }

  // ============================================
  // Status Management
  // ============================================

  /**
   * Set player status (for external quit/return management)
   */
  setPlayerStatus(playerId: string, status: 'active' | 'resting' | 'tilted' | 'on_fire'): void {
    const stats = this.careerStats.get(playerId);
    if (stats) {
      stats.status = status;
    }
  }

  /**
   * Get active players (not resting)
   */
  getActivePlayers(): PlayerCareerStats[] {
    return Array.from(this.careerStats.values())
      .filter(stats => stats.status !== 'resting');
  }

  /**
   * Get resting players
   */
  getRestingPlayers(): PlayerCareerStats[] {
    return Array.from(this.careerStats.values())
      .filter(stats => stats.status === 'resting');
  }

  // ============================================
  // Serialization
  // ============================================

  /**
   * Export all data for persistence
   */
  export(): {
    careerStats: Record<string, PlayerCareerStats>;
    matchHistory: MatchResult[];
    players: Record<string, CeeloPlayer>;
  } {
    return {
      careerStats: Object.fromEntries(this.careerStats),
      matchHistory: this.matchHistory,
      players: Object.fromEntries(this.players),
    };
  }

  /**
   * Import data from persistence
   */
  import(data: {
    careerStats: Record<string, PlayerCareerStats>;
    matchHistory: MatchResult[];
    players: Record<string, CeeloPlayer>;
  }): void {
    this.careerStats = new Map(Object.entries(data.careerStats));
    this.matchHistory = data.matchHistory;
    this.players = new Map(Object.entries(data.players));
  }

  /**
   * Reset all statistics
   */
  reset(): void {
    this.careerStats.clear();
    this.matchHistory = [];
    // Keep players registered
    for (const player of this.players.values()) {
      this.careerStats.set(player.id, this.createEmptyCareerStats(player));
    }
  }

  // ============================================
  // Analysis Helpers
  // ============================================

  /**
   * Get top performers by a specific stat
   */
  getTopPerformers(
    stat: 'wins' | 'winRate' | 'netGold' | 'bestStreak' | 'tripsRolled',
    limit: number = 5
  ): PlayerCareerStats[] {
    const all = this.getAllCareerStats();

    return all
      .sort((a, b) => {
        switch (stat) {
          case 'wins': return b.totalWins - a.totalWins;
          case 'winRate': return b.roundWinRate - a.roundWinRate;
          case 'netGold': return b.netGold - a.netGold;
          case 'bestStreak': return b.bestWinStreak - a.bestWinStreak;
          case 'tripsRolled': return b.tripsRolled - a.tripsRolled;
        }
      })
      .slice(0, limit);
  }

  /**
   * Get global stats summary
   */
  getGlobalStats(): {
    totalMatches: number;
    totalRounds: number;
    totalGoldExchanged: number;
    averageMatchLength: number;
    mostActivePlayer: string | null;
    biggestWinner: string | null;
    biggestLoser: string | null;
  } {
    const totalMatches = this.matchHistory.length;
    const totalRounds = this.matchHistory.reduce((sum, m) => sum + m.totalRounds, 0);
    const totalGoldExchanged = this.matchHistory.reduce(
      (sum, m) => sum + Object.values(m.goldChanges).reduce((a, b) => a + Math.abs(b), 0) / 2,
      0
    );
    const averageMatchLength = totalMatches > 0 ? totalRounds / totalMatches : 0;

    const all = this.getAllCareerStats();

    const mostActivePlayer = all.length > 0
      ? all.reduce((a, b) => a.matchesPlayed > b.matchesPlayed ? a : b).slug
      : null;

    const biggestWinner = all.length > 0
      ? all.reduce((a, b) => a.netGold > b.netGold ? a : b).slug
      : null;

    const biggestLoser = all.length > 0
      ? all.reduce((a, b) => a.netGold < b.netGold ? a : b).slug
      : null;

    return {
      totalMatches,
      totalRounds,
      totalGoldExchanged,
      averageMatchLength,
      mostActivePlayer,
      biggestWinner,
      biggestLoser,
    };
  }
}

// ============================================
// Singleton Instance (optional)
// ============================================

let globalStatsManager: CeeloStatisticsManager | null = null;

export function getGlobalStatsManager(): CeeloStatisticsManager {
  if (!globalStatsManager) {
    globalStatsManager = new CeeloStatisticsManager();
  }
  return globalStatsManager;
}

export function resetGlobalStatsManager(): void {
  globalStatsManager = null;
}
