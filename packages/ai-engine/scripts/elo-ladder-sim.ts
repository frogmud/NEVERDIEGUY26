#!/usr/bin/env ts-node
/**
 * Matchmaking ELO Ladder Simulator
 *
 * Simulates 1v1 and vbots ladder to calibrate starting ranks.
 * Run with: npx ts-node scripts/elo-ladder-sim.ts
 *
 * Answers:
 * - What's a good starting ELO?
 * - How many games to stabilize ranking?
 * - Is the K-factor balanced?
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { createSeededRng, type SeededRng } from '../src/core/seeded-rng';

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================
// Configuration
// ============================================

const PLAYERS_TO_SIMULATE = 500;
const MATCHES_PER_PLAYER = 50;
const SEED = `elo-${Date.now()}`;
const OUTPUT_PATH = './logs/elo-ladder.json';

// ============================================
// ELO System Parameters
// ============================================

interface ELOConfig {
  startingELO: number;
  kFactorNew: number;          // K for players with <30 games
  kFactorEstablished: number;  // K for players with 30+ games
  kFactorElite: number;        // K for players above 2400
  volatilityBonus: number;     // Extra K for long streaks
  minELO: number;
  maxELO: number;
}

const DEFAULT_ELO_CONFIG: ELOConfig = {
  startingELO: 1200,
  kFactorNew: 40,
  kFactorEstablished: 20,
  kFactorElite: 10,
  volatilityBonus: 5,
  minELO: 100,
  maxELO: 3000,
};

// ============================================
// Player Model
// ============================================

interface Player {
  id: string;
  trueSkill: number;          // Hidden actual skill (0-100)
  elo: number;
  gamesPlayed: number;
  wins: number;
  losses: number;
  currentStreak: number;       // Positive = wins, negative = losses
  longestWinStreak: number;
  longestLoseStreak: number;
  eloHistory: number[];
  peakELO: number;
  valleyELO: number;
  gamesUntilStable: number | null;
}

// Skill distribution types
type SkillDistribution = 'uniform' | 'normal' | 'bimodal' | 'right_skew';

function generateTrueSkill(distribution: SkillDistribution, rng: SeededRng): number {
  switch (distribution) {
    case 'uniform':
      return rng.random('skill') * 100;

    case 'normal': {
      // Box-Muller transform for normal distribution
      const u1 = rng.random('norm1');
      const u2 = rng.random('norm2');
      const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      return Math.max(0, Math.min(100, 50 + z * 20));
    }

    case 'bimodal': {
      // Two peaks at 30 and 70
      const peak = rng.random('peak') < 0.5 ? 30 : 70;
      const variance = 10;
      const u1 = rng.random('bi1');
      const u2 = rng.random('bi2');
      const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      return Math.max(0, Math.min(100, peak + z * variance));
    }

    case 'right_skew': {
      // Most players are average to good
      const base = rng.random('skew1');
      const boost = rng.random('skew2') * rng.random('skew3');
      return Math.max(0, Math.min(100, 40 + base * 30 + boost * 30));
    }
  }
}

function createPlayer(id: string, trueSkill: number, config: ELOConfig): Player {
  return {
    id,
    trueSkill,
    elo: config.startingELO,
    gamesPlayed: 0,
    wins: 0,
    losses: 0,
    currentStreak: 0,
    longestWinStreak: 0,
    longestLoseStreak: 0,
    eloHistory: [config.startingELO],
    peakELO: config.startingELO,
    valleyELO: config.startingELO,
    gamesUntilStable: null,
  };
}

// ============================================
// Match Simulation
// ============================================

function calculateWinProbability(player1Skill: number, player2Skill: number): number {
  // Skill difference maps to win probability
  // 10 skill points = ~10% win probability shift
  const diff = player1Skill - player2Skill;
  const probability = 1 / (1 + Math.pow(10, -diff / 40));
  return probability;
}

function getKFactor(player: Player, config: ELOConfig): number {
  let k = config.kFactorEstablished;

  if (player.gamesPlayed < 30) {
    k = config.kFactorNew;
  } else if (player.elo > 2400) {
    k = config.kFactorElite;
  }

  // Add volatility bonus for long streaks
  if (Math.abs(player.currentStreak) >= 5) {
    k += config.volatilityBonus;
  }

  return k;
}

function calculateExpectedScore(playerELO: number, opponentELO: number): number {
  return 1 / (1 + Math.pow(10, (opponentELO - playerELO) / 400));
}

function simulateMatch(
  player1: Player,
  player2: Player,
  config: ELOConfig,
  rng: SeededRng
): { winner: Player; loser: Player } {
  const winProbability = calculateWinProbability(player1.trueSkill, player2.trueSkill);
  const player1Wins = rng.random('match') < winProbability;

  return player1Wins
    ? { winner: player1, loser: player2 }
    : { winner: player2, loser: player1 };
}

function updateELO(
  winner: Player,
  loser: Player,
  config: ELOConfig
): void {
  const winnerExpected = calculateExpectedScore(winner.elo, loser.elo);
  const loserExpected = calculateExpectedScore(loser.elo, winner.elo);

  const winnerK = getKFactor(winner, config);
  const loserK = getKFactor(loser, config);

  // Update ELOs
  winner.elo = Math.max(config.minELO, Math.min(config.maxELO,
    winner.elo + winnerK * (1 - winnerExpected)
  ));
  loser.elo = Math.max(config.minELO, Math.min(config.maxELO,
    loser.elo + loserK * (0 - loserExpected)
  ));

  // Update stats
  winner.gamesPlayed++;
  loser.gamesPlayed++;
  winner.wins++;
  loser.losses++;

  // Update streaks
  if (winner.currentStreak > 0) {
    winner.currentStreak++;
  } else {
    winner.currentStreak = 1;
  }
  winner.longestWinStreak = Math.max(winner.longestWinStreak, winner.currentStreak);

  if (loser.currentStreak < 0) {
    loser.currentStreak--;
  } else {
    loser.currentStreak = -1;
  }
  loser.longestLoseStreak = Math.max(loser.longestLoseStreak, Math.abs(loser.currentStreak));

  // Update history and extremes
  winner.eloHistory.push(winner.elo);
  loser.eloHistory.push(loser.elo);
  winner.peakELO = Math.max(winner.peakELO, winner.elo);
  loser.peakELO = Math.max(loser.peakELO, loser.elo);
  winner.valleyELO = Math.min(winner.valleyELO, winner.elo);
  loser.valleyELO = Math.min(loser.valleyELO, loser.elo);

  // Check stability (ELO within 50 of "true" ELO for 5 games)
  checkStability(winner);
  checkStability(loser);
}

function checkStability(player: Player): void {
  if (player.gamesUntilStable !== null) return;

  // True ELO is roughly skill * 20 + 200 (maps 0-100 skill to 200-2200 ELO)
  const trueELO = player.trueSkill * 20 + 200;

  const recentHistory = player.eloHistory.slice(-5);
  if (recentHistory.length < 5) return;

  const allClose = recentHistory.every(elo => Math.abs(elo - trueELO) < 100);
  if (allClose) {
    player.gamesUntilStable = player.gamesPlayed - 5;
  }
}

// ============================================
// Matchmaking
// ============================================

type MatchmakingMode = 'random' | 'elo_close' | 'skill_based';

function findOpponent(
  player: Player,
  pool: Player[],
  mode: MatchmakingMode,
  rng: SeededRng
): Player | null {
  const candidates = pool.filter(p => p.id !== player.id);
  if (candidates.length === 0) return null;

  switch (mode) {
    case 'random':
      return candidates[Math.floor(rng.random('opponent') * candidates.length)];

    case 'elo_close': {
      // Sort by ELO distance
      const sorted = candidates.sort((a, b) =>
        Math.abs(a.elo - player.elo) - Math.abs(b.elo - player.elo)
      );
      // Pick from top 10% closest
      const topN = Math.max(1, Math.floor(sorted.length * 0.1));
      return sorted[Math.floor(rng.random('eloMatch') * topN)];
    }

    case 'skill_based': {
      // Hidden skill-based (for testing fairness)
      const sorted = candidates.sort((a, b) =>
        Math.abs(a.trueSkill - player.trueSkill) - Math.abs(b.trueSkill - player.trueSkill)
      );
      const topN = Math.max(1, Math.floor(sorted.length * 0.1));
      return sorted[Math.floor(rng.random('skillMatch') * topN)];
    }
  }
}

// ============================================
// Ladder Simulation
// ============================================

interface LadderStats {
  players: number;
  matchesPlayed: number;

  eloDistribution: {
    under800: number;
    r800to1200: number;
    r1200to1600: number;
    r1600to2000: number;
    over2000: number;
  };

  avgGamesToStable: number;
  playersNeverStable: number;

  avgELODrift: number;        // How far from starting ELO
  skillELOCorrelation: number;

  winRateByELO: Array<{ eloBracket: string; winRate: number }>;

  matchupFairness: number;    // % of matches within 200 ELO
  upsetRate: number;          // % of matches won by lower ELO

  topPlayers: Array<{ id: string; elo: number; skill: number; games: number }>;
  bottomPlayers: Array<{ id: string; elo: number; skill: number; games: number }>;
}

function computeLadderStats(players: Player[]): LadderStats {
  const totalMatches = players.reduce((s, p) => s + p.gamesPlayed, 0) / 2;

  // ELO distribution
  const eloDist = {
    under800: players.filter(p => p.elo < 800).length,
    r800to1200: players.filter(p => p.elo >= 800 && p.elo < 1200).length,
    r1200to1600: players.filter(p => p.elo >= 1200 && p.elo < 1600).length,
    r1600to2000: players.filter(p => p.elo >= 1600 && p.elo < 2000).length,
    over2000: players.filter(p => p.elo >= 2000).length,
  };

  // Games to stable
  const stablePlayers = players.filter(p => p.gamesUntilStable !== null);
  const avgGamesToStable = stablePlayers.length > 0
    ? stablePlayers.reduce((s, p) => s + (p.gamesUntilStable || 0), 0) / stablePlayers.length
    : 0;

  // ELO drift
  const startingELO = players[0]?.eloHistory[0] || 1200;
  const avgDrift = players.reduce((s, p) => s + Math.abs(p.elo - startingELO), 0) / players.length;

  // Skill-ELO correlation
  const skills = players.map(p => p.trueSkill);
  const elos = players.map(p => p.elo);
  const correlation = calculateCorrelation(skills, elos);

  // Win rate by ELO bracket
  const brackets = [
    { label: '<800', min: 0, max: 800 },
    { label: '800-1200', min: 800, max: 1200 },
    { label: '1200-1600', min: 1200, max: 1600 },
    { label: '1600-2000', min: 1600, max: 2000 },
    { label: '>2000', min: 2000, max: Infinity },
  ];

  const winRateByELO = brackets.map(b => {
    const bracketPlayers = players.filter(p => p.elo >= b.min && p.elo < b.max);
    const totalGames = bracketPlayers.reduce((s, p) => s + p.gamesPlayed, 0);
    const totalWins = bracketPlayers.reduce((s, p) => s + p.wins, 0);
    return {
      eloBracket: b.label,
      winRate: totalGames > 0 ? totalWins / totalGames : 0,
    };
  });

  // Top and bottom players
  const sorted = [...players].sort((a, b) => b.elo - a.elo);
  const topPlayers = sorted.slice(0, 5).map(p => ({
    id: p.id,
    elo: Math.round(p.elo),
    skill: Math.round(p.trueSkill),
    games: p.gamesPlayed,
  }));
  const bottomPlayers = sorted.slice(-5).map(p => ({
    id: p.id,
    elo: Math.round(p.elo),
    skill: Math.round(p.trueSkill),
    games: p.gamesPlayed,
  }));

  return {
    players: players.length,
    matchesPlayed: Math.floor(totalMatches),

    eloDistribution: eloDist,

    avgGamesToStable,
    playersNeverStable: players.length - stablePlayers.length,

    avgELODrift: avgDrift,
    skillELOCorrelation: correlation,

    winRateByELO,

    matchupFairness: 0, // Would need match history to compute
    upsetRate: 0,       // Would need match history to compute

    topPlayers,
    bottomPlayers,
  };
}

function calculateCorrelation(x: number[], y: number[]): number {
  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((s, xi, i) => s + xi * y[i], 0);
  const sumX2 = x.reduce((s, xi) => s + xi * xi, 0);
  const sumY2 = y.reduce((s, yi) => s + yi * yi, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

  return denominator === 0 ? 0 : numerator / denominator;
}

// ============================================
// Main Simulation Loop
// ============================================

async function runLadderSimulation(
  config: ELOConfig,
  matchmaking: MatchmakingMode,
  skillDist: SkillDistribution
): Promise<{ players: Player[]; stats: LadderStats }> {
  const rng = createSeededRng(`${SEED}-${matchmaking}-${skillDist}`);

  // Create players
  const players: Player[] = [];
  for (let i = 0; i < PLAYERS_TO_SIMULATE; i++) {
    const skill = generateTrueSkill(skillDist, rng);
    players.push(createPlayer(`player-${i}`, skill, config));
  }

  // Run matches
  const totalMatches = PLAYERS_TO_SIMULATE * MATCHES_PER_PLAYER / 2;
  for (let i = 0; i < totalMatches; i++) {
    // Pick a random player who hasn't played too many games
    const eligiblePlayers = players.filter(p => p.gamesPlayed < MATCHES_PER_PLAYER);
    if (eligiblePlayers.length < 2) break;

    const player1 = eligiblePlayers[Math.floor(rng.random('p1') * eligiblePlayers.length)];
    const player2 = findOpponent(player1, eligiblePlayers, matchmaking, rng);

    if (!player2) continue;

    const { winner, loser } = simulateMatch(player1, player2, config, rng);
    updateELO(winner, loser, config);
  }

  const stats = computeLadderStats(players);

  return { players, stats };
}

// ============================================
// Main Runner
// ============================================

async function main() {
  console.log('='.repeat(70));
  console.log('MATCHMAKING ELO LADDER SIMULATOR');
  console.log('='.repeat(70));
  console.log(`Players: ${PLAYERS_TO_SIMULATE}`);
  console.log(`Matches per player: ${MATCHES_PER_PLAYER}`);
  console.log('='.repeat(70));
  console.log('');

  const startTime = Date.now();

  // Test different configurations
  const configs: Array<{ name: string; config: ELOConfig; matchmaking: MatchmakingMode; skillDist: SkillDistribution }> = [
    { name: 'Default + Random', config: DEFAULT_ELO_CONFIG, matchmaking: 'random', skillDist: 'normal' },
    { name: 'Default + ELO-Close', config: DEFAULT_ELO_CONFIG, matchmaking: 'elo_close', skillDist: 'normal' },
    { name: 'Low K-Factor', config: { ...DEFAULT_ELO_CONFIG, kFactorNew: 20, kFactorEstablished: 10 }, matchmaking: 'elo_close', skillDist: 'normal' },
    { name: 'High K-Factor', config: { ...DEFAULT_ELO_CONFIG, kFactorNew: 60, kFactorEstablished: 40 }, matchmaking: 'elo_close', skillDist: 'normal' },
    { name: 'Bimodal Skills', config: DEFAULT_ELO_CONFIG, matchmaking: 'elo_close', skillDist: 'bimodal' },
  ];

  const allResults: Array<{ name: string; stats: LadderStats }> = [];

  for (const { name, config, matchmaking, skillDist } of configs) {
    process.stdout.write(`Running ${name}...`);
    const { stats } = await runLadderSimulation(config, matchmaking, skillDist);
    allResults.push({ name, stats });
    console.log(` done`);
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log('');

  // Print comparison
  console.log('='.repeat(70));
  console.log('CONFIGURATION COMPARISON');
  console.log('='.repeat(70));
  console.log('Config               | Corr  | Games2Stable | Drift | Top ELO');
  console.log('-'.repeat(70));
  for (const { name, stats } of allResults) {
    const topELO = stats.topPlayers[0]?.elo || 0;
    console.log(
      `${name.padEnd(20)} | ` +
      `${stats.skillELOCorrelation.toFixed(2).padStart(5)} | ` +
      `${stats.avgGamesToStable.toFixed(0).padStart(12)} | ` +
      `${stats.avgELODrift.toFixed(0).padStart(5)} | ` +
      `${topELO}`
    );
  }
  console.log('');

  // Detailed stats for best config
  const bestConfig = allResults.reduce((best, curr) =>
    curr.stats.skillELOCorrelation > best.stats.skillELOCorrelation ? curr : best
  );

  console.log('='.repeat(70));
  console.log(`BEST CONFIG: ${bestConfig.name}`);
  console.log('='.repeat(70));
  console.log('');

  console.log('ELO Distribution:');
  const dist = bestConfig.stats.eloDistribution;
  console.log(`  <800:      ${dist.under800} (${((dist.under800 / PLAYERS_TO_SIMULATE) * 100).toFixed(0)}%)`);
  console.log(`  800-1200:  ${dist.r800to1200} (${((dist.r800to1200 / PLAYERS_TO_SIMULATE) * 100).toFixed(0)}%)`);
  console.log(`  1200-1600: ${dist.r1200to1600} (${((dist.r1200to1600 / PLAYERS_TO_SIMULATE) * 100).toFixed(0)}%)`);
  console.log(`  1600-2000: ${dist.r1600to2000} (${((dist.r1600to2000 / PLAYERS_TO_SIMULATE) * 100).toFixed(0)}%)`);
  console.log(`  >2000:     ${dist.over2000} (${((dist.over2000 / PLAYERS_TO_SIMULATE) * 100).toFixed(0)}%)`);
  console.log('');

  console.log('Win Rate by ELO Bracket:');
  for (const { eloBracket, winRate } of bestConfig.stats.winRateByELO) {
    console.log(`  ${eloBracket.padEnd(12)} ${(winRate * 100).toFixed(0)}%`);
  }
  console.log('');

  console.log('Top 5 Players:');
  for (const p of bestConfig.stats.topPlayers) {
    console.log(`  ${p.id.padEnd(15)} ELO: ${p.elo} (skill: ${p.skill}, ${p.games} games)`);
  }
  console.log('');

  console.log('Bottom 5 Players:');
  for (const p of bestConfig.stats.bottomPlayers) {
    console.log(`  ${p.id.padEnd(15)} ELO: ${p.elo} (skill: ${p.skill}, ${p.games} games)`);
  }
  console.log('');

  // Recommendations
  console.log('='.repeat(70));
  console.log('RECOMMENDATIONS');
  console.log('='.repeat(70));

  if (bestConfig.stats.skillELOCorrelation < 0.7) {
    console.log('  - WARNING: Low skill-ELO correlation. ELO not reflecting true skill.');
    console.log('  - Consider: More games or adjusted K-factors');
  } else {
    console.log(`  - Good skill-ELO correlation (${bestConfig.stats.skillELOCorrelation.toFixed(2)})`);
  }

  if (bestConfig.stats.avgGamesToStable > 30) {
    console.log('  - Players take too long to reach stable ELO');
    console.log('  - Consider: Higher K-factor for new players');
  } else {
    console.log(`  - Reasonable stabilization time (~${bestConfig.stats.avgGamesToStable.toFixed(0)} games)`);
  }

  console.log('');
  console.log('='.repeat(70));
  console.log(`Completed in ${elapsed}s`);
  console.log('='.repeat(70));

  // Save results
  const logDir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  const output = {
    timestamp: new Date().toISOString(),
    seed: SEED,
    playersSimulated: PLAYERS_TO_SIMULATE,
    matchesPerPlayer: MATCHES_PER_PLAYER,
    durationSeconds: parseFloat(elapsed),
    configurations: allResults,
    recommendations: {
      bestConfig: bestConfig.name,
      correlation: bestConfig.stats.skillELOCorrelation,
      gamesToStable: bestConfig.stats.avgGamesToStable,
    },
  };

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2));
  console.log(`\nSaved to: ${OUTPUT_PATH}`);
}

main().catch(console.error);
