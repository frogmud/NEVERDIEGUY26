#!/usr/bin/env ts-node
/**
 * Economy Monte Carlo Simulation
 *
 * Simulates 10K arena runs to analyze balance, progression, and economy.
 * Tests all 4 loadouts across 6 domains with canonical formulas.
 *
 * Run with: npx tsx audit/economy-sim.ts --runs=10000
 */

import { createSeededRng, type SeededRng } from '../packages/ai-engine/src/core/seeded-rng';

// Balance config imports
import {
  TIER_CONFIG,
  getTierForDomain,
  WANDERER_EFFECTS,
  applyHeatReward,
  SHOP_PRICING,
  getTierPriceMultiplier,
  GOLD_REWARDS,
  GOLD_CONFIG,
  calculateGoldGain,
  calculateGoldReward,
  LUCKY_SYNERGY,
  getLuckySynergy,
  INTEGRITY_CONFIG,
  TIMER_CONFIG,
  getTimePressureMultiplier,
} from '../apps/web/src/data/balance-config';

import { DOMAIN_CONFIGS, getDomainOrder, getDomainPosition } from '../apps/web/src/data/domains';

import {
  computeStats,
  type BaseStats,
  type ComputedStats,
} from '../apps/web/src/data/stats/calculator';

import { DEFAULT_BASE_STATS, type StatKey } from '../apps/web/src/data/stats/types';
import { LOADOUT_PRESETS, type LoadoutPreset } from '../apps/web/src/data/loadouts';

// ============================================
// Types
// ============================================

interface PlayerState {
  loadout: LoadoutPreset;
  luckyNumber: number;
  baseStats: BaseStats;
  computedStats: ComputedStats;
  currentHP: number;
  gold: number;
  items: string[];
  domainsCleared: number;
  roomsCleared: number;
  totalScore: number;
  heat: number;
  favor: number;
  calm: number;
  deaths: number;
}

interface RoomResult {
  success: boolean;
  scoreAchieved: number;
  hpLost: number;
  goldEarned: number;
  timePressureMultiplier: number;
  turnsUsed: number;
}

interface RunResult {
  loadoutId: string;
  luckyNumber: number;
  domainsCleared: number;
  roomsCleared: number;
  finalScore: number;
  finalGold: number;
  deaths: number;
  victory: boolean;
  goldPerDomain: number[];
  scorePerDomain: number[];
  hpAtDomainEnd: number[];
  highestTier: number;
  avgTimePressure: number;
  totalLuckySynergyGold: number;
}

interface SimulationConfig {
  runs: number;
  seed: string;
  verbose: boolean;
}

// ============================================
// Simulation Logic
// ============================================

function createPlayer(loadout: LoadoutPreset, luckyNumber: number, rng: SeededRng): PlayerState {
  // Base stats from loadout
  const baseStats: BaseStats = {
    ...DEFAULT_BASE_STATS,
    luck: luckyNumber as BaseStats['luck'],
  };

  // Apply loadout bonuses
  for (const [stat, bonus] of Object.entries(loadout.statBonus)) {
    if (stat !== 'luck' && stat in baseStats) {
      baseStats[stat as StatKey] += bonus;
    }
  }

  const computedStats = computeStats(baseStats, []);

  return {
    loadout,
    luckyNumber,
    baseStats,
    computedStats,
    currentHP: computedStats.maxHp,
    gold: 0, // Starting gold = 0 (balance-config.ts line 30 comment)
    items: [],
    domainsCleared: 0,
    roomsCleared: 0,
    totalScore: 0,
    heat: 0,
    favor: 0,
    calm: 0,
    deaths: 0,
  };
}

function simulateRoom(
  player: PlayerState,
  domain: number,
  roomNum: number,
  roomType: 'normal' | 'elite' | 'boss',
  rng: SeededRng
): RoomResult {
  const config = getTimerConfigForRoom(roomType);
  const tier = getTierForDomain(player.domainsCleared);

  // Score goal scales with domain, room type, and heat
  const baseGoal = 100 + domain * 50 + (roomType === 'boss' ? 150 : roomType === 'elite' ? 50 : 0);
  const heatMultiplier = Math.pow(1.15, player.heat);
  const scoreGoal = Math.floor(baseGoal * heatMultiplier);

  // Simulate turns - player has ~5-8 turns to win
  const maxTurns = config.graceTurns + 5;
  let turnsUsed = 0;
  let scoreAchieved = 0;
  let totalTimePressure = 0;

  for (let turn = 1; turn <= maxTurns; turn++) {
    turnsUsed = turn;
    const timePressure = getTimePressureMultiplier(turn, roomType);
    totalTimePressure += timePressure;

    // Roll damage (based on player damage stat)
    const baseDamage = player.computedStats.damage;
    const rollVariance = 0.8 + rng.random('roll') * 0.4; // 80-120%
    const damage = Math.floor(baseDamage * rollVariance);

    // Crit chance
    const critRoll = rng.random('crit');
    const isCrit = critRoll < player.computedStats.critChance;
    const critMultiplier = isCrit ? player.computedStats.critMultiplier : 1.0;

    // Final score this turn
    const turnScore = Math.floor(damage * critMultiplier * timePressure);
    scoreAchieved += turnScore;

    if (scoreAchieved >= scoreGoal) {
      break;
    }
  }

  const success = scoreAchieved >= scoreGoal;
  const avgTimePressure = totalTimePressure / turnsUsed;

  // HP loss calculation
  let hpLost = 0;
  if (!success) {
    // Failed room = 25 integrity damage (INTEGRITY_CONFIG.failureDamage)
    hpLost = INTEGRITY_CONFIG.failureDamage;
  } else {
    // Success but took damage based on turns used (simulate combat damage)
    const damagePerTurn = 5 + domain * 2;
    hpLost = Math.floor(damagePerTurn * turnsUsed * (roomType === 'boss' ? 1.5 : 1.0));
  }

  // Gold reward (only on success)
  let goldEarned = 0;
  if (success) {
    const rewardTier = roomType === 'boss' ? 3 : roomType === 'elite' ? 2 : 1;
    const luckySynergy = getLuckySynergy({
      luckyNumber: player.luckyNumber,
      currentDomain: domain,
    });
    const rawGold = calculateGoldReward(rewardTier, domain, player.heat, luckySynergy);
    goldEarned = calculateGoldGain(rawGold, player.gold);
  }

  return {
    success,
    scoreAchieved,
    hpLost,
    goldEarned,
    timePressureMultiplier: avgTimePressure,
    turnsUsed,
  };
}

function simulateRun(
  loadout: LoadoutPreset,
  rng: SeededRng,
  verbose: boolean
): RunResult {
  const luckyNumber = Math.floor(rng.random('lucky') * 8); // 0-7
  const player = createPlayer(loadout, luckyNumber, rng);

  const result: RunResult = {
    loadoutId: loadout.id,
    luckyNumber,
    domainsCleared: 0,
    roomsCleared: 0,
    finalScore: 0,
    finalGold: 0,
    deaths: 0,
    victory: false,
    goldPerDomain: [],
    scorePerDomain: [],
    hpAtDomainEnd: [],
    highestTier: 1,
    avgTimePressure: 0,
    totalLuckySynergyGold: 0,
  };

  const domainOrder = getDomainOrder();
  const totalTimePressure: number[] = [];

  for (let domainIdx = 0; domainIdx < domainOrder.length; domainIdx++) {
    const domain = domainOrder[domainIdx];
    let domainGold = 0;
    let domainScore = 0;

    if (verbose) {
      console.log(`\n[${loadout.name}] Domain ${domain} - HP: ${player.currentHP}/${player.computedStats.maxHp}, Gold: ${player.gold}`);
    }

    // 3 rooms per domain
    for (let roomNum = 1; roomNum <= 3; roomNum++) {
      const roomType: 'normal' | 'elite' | 'boss' =
        roomNum === 3 ? 'boss' :
        (roomNum === 2 && rng.random('elite') < 0.3 && player.heat < 3) ? 'elite' : 'normal';

      // Elite door adds heat
      if (roomType === 'elite') {
        player.heat += 1;
      }

      const roomResult = simulateRoom(player, domain, roomNum, roomType, rng);
      totalTimePressure.push(roomResult.timePressureMultiplier);

      if (roomResult.success) {
        player.roomsCleared++;
        player.totalScore += roomResult.scoreAchieved;
        player.gold += roomResult.goldEarned;
        domainGold += roomResult.goldEarned;
        domainScore += roomResult.scoreAchieved;

        // Track lucky synergy gold
        const luckySynergy = getLuckySynergy({
          luckyNumber: player.luckyNumber,
          currentDomain: domain,
        });
        if (luckySynergy !== 'none') {
          const baseGold = Math.floor(roomResult.goldEarned / LUCKY_SYNERGY.gold[luckySynergy]);
          const bonus = roomResult.goldEarned - baseGold;
          result.totalLuckySynergyGold += bonus;
        }
      } else {
        // Room failed - take damage
        player.deaths++;
        if (verbose) {
          console.log(`  Room ${roomNum} FAILED - Death #${player.deaths}`);
        }
      }

      // Apply HP loss
      player.currentHP = Math.max(0, player.currentHP - roomResult.hpLost);

      // Check for game over
      if (player.currentHP <= 0 && player.deaths >= 3) {
        // Max 3 deaths allowed per run (generous for sim)
        if (verbose) {
          console.log(`  GAME OVER - Too many deaths`);
        }
        result.domainsCleared = domainIdx;
        result.roomsCleared = player.roomsCleared;
        result.finalScore = player.totalScore;
        result.finalGold = player.gold;
        result.deaths = player.deaths;
        result.highestTier = getTierForDomain(domainIdx);
        result.avgTimePressure = totalTimePressure.reduce((a, b) => a + b, 0) / totalTimePressure.length;
        return result;
      }
    }

    // Domain cleared
    player.domainsCleared++;
    result.goldPerDomain.push(domainGold);
    result.scorePerDomain.push(domainScore);
    result.hpAtDomainEnd.push(player.currentHP);

    // Domain clear recovery
    player.currentHP = Math.min(
      player.computedStats.maxHp,
      player.currentHP + INTEGRITY_CONFIG.domainClearRecovery
    );

    if (verbose) {
      console.log(`  Domain ${domain} CLEARED - Gold: +${domainGold}, HP: ${player.currentHP}`);
    }
  }

  // Victory!
  result.domainsCleared = domainOrder.length;
  result.roomsCleared = player.roomsCleared;
  result.finalScore = player.totalScore;
  result.finalGold = player.gold;
  result.deaths = player.deaths;
  result.victory = true;
  result.highestTier = getTierForDomain(result.domainsCleared - 1);
  result.avgTimePressure = totalTimePressure.reduce((a, b) => a + b, 0) / totalTimePressure.length;

  return result;
}

function getTimerConfigForRoom(roomType: 'normal' | 'elite' | 'boss') {
  if (roomType === 'boss') {
    return { ...TIMER_CONFIG, graceTurns: 3, decayPerTurn: 0.04, minMultiplier: 0.50 };
  } else if (roomType === 'elite') {
    return { ...TIMER_CONFIG, minMultiplier: 0.55 };
  }
  return TIMER_CONFIG;
}

// ============================================
// Statistics
// ============================================

interface AggregateStats {
  totalRuns: number;
  byLoadout: Record<string, {
    runs: number;
    winRate: number;
    avgDomainsCleared: number;
    avgRoomsCleared: number;
    avgScore: number;
    avgGold: number;
    avgDeaths: number;
    avgTimePressure: number;
    goldDistribution: { min: number; max: number; mean: number; median: number; stdDev: number };
    scoreDistribution: { min: number; max: number; mean: number; median: number; stdDev: number };
  }>;
  byDomain: Record<number, {
    survivalRate: number;
    avgGoldEarned: number;
    avgScoreEarned: number;
    avgHPRemaining: number;
  }>;
  goldCapAnalysis: {
    runsHittingSoftCap: number;
    runsHittingHardCap: number;
    avgGoldLostToCap: number;
  };
  luckySynergyAnalysis: {
    avgBonusGold: number;
    percentOfTotalGold: number;
  };
  outliers: Array<{
    loadout: string;
    luckyNumber: number;
    finalGold: number;
    finalScore: number;
    domainsCleared: number;
    reason: string;
  }>;
}

function calculateStats(values: number[]): { min: number; max: number; mean: number; median: number; stdDev: number } {
  if (values.length === 0) {
    return { min: 0, max: 0, mean: 0, median: 0, stdDev: 0 };
  }

  const sorted = [...values].sort((a, b) => a - b);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const median =
    sorted.length % 2 === 0
      ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
      : sorted[Math.floor(sorted.length / 2)];
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);

  return { min, max, mean, median, stdDev };
}

function aggregateResults(results: RunResult[]): AggregateStats {
  const byLoadout: AggregateStats['byLoadout'] = {};
  const byDomain: AggregateStats['byDomain'] = {};
  const outliers: AggregateStats['outliers'] = [];

  // Initialize loadout stats
  for (const loadout of LOADOUT_PRESETS) {
    byLoadout[loadout.id] = {
      runs: 0,
      winRate: 0,
      avgDomainsCleared: 0,
      avgRoomsCleared: 0,
      avgScore: 0,
      avgGold: 0,
      avgDeaths: 0,
      avgTimePressure: 0,
      goldDistribution: { min: 0, max: 0, mean: 0, median: 0, stdDev: 0 },
      scoreDistribution: { min: 0, max: 0, mean: 0, median: 0, stdDev: 0 },
    };
  }

  // Initialize domain stats
  for (let d = 1; d <= 6; d++) {
    byDomain[d] = {
      survivalRate: 0,
      avgGoldEarned: 0,
      avgScoreEarned: 0,
      avgHPRemaining: 0,
    };
  }

  // Process results
  const loadoutResults: Record<string, RunResult[]> = {};
  for (const loadout of LOADOUT_PRESETS) {
    loadoutResults[loadout.id] = [];
  }

  for (const result of results) {
    loadoutResults[result.loadoutId].push(result);
  }

  let runsHittingSoftCap = 0;
  let runsHittingHardCap = 0;
  let totalGoldLostToCap = 0;
  let totalLuckySynergyGold = 0;
  let totalGoldEarned = 0;

  for (const [loadoutId, runs] of Object.entries(loadoutResults)) {
    const wins = runs.filter(r => r.victory).length;
    const goldValues = runs.map(r => r.finalGold);
    const scoreValues = runs.map(r => r.finalScore);

    byLoadout[loadoutId] = {
      runs: runs.length,
      winRate: wins / runs.length,
      avgDomainsCleared: runs.reduce((a, r) => a + r.domainsCleared, 0) / runs.length,
      avgRoomsCleared: runs.reduce((a, r) => a + r.roomsCleared, 0) / runs.length,
      avgScore: runs.reduce((a, r) => a + r.finalScore, 0) / runs.length,
      avgGold: runs.reduce((a, r) => a + r.finalGold, 0) / runs.length,
      avgDeaths: runs.reduce((a, r) => a + r.deaths, 0) / runs.length,
      avgTimePressure: runs.reduce((a, r) => a + r.avgTimePressure, 0) / runs.length,
      goldDistribution: calculateStats(goldValues),
      scoreDistribution: calculateStats(scoreValues),
    };

    totalLuckySynergyGold += runs.reduce((a, r) => a + r.totalLuckySynergyGold, 0);
    totalGoldEarned += runs.reduce((a, r) => a + r.finalGold, 0);

    // Check for soft/hard cap hits and outliers
    for (const run of runs) {
      if (run.finalGold >= GOLD_CONFIG.softCap) {
        runsHittingSoftCap++;
      }
      if (run.finalGold >= GOLD_CONFIG.hardCap) {
        runsHittingHardCap++;
      }

      // Detect outliers (>3 sigma from mean)
      const goldMean = byLoadout[loadoutId].goldDistribution.mean;
      const goldStdDev = byLoadout[loadoutId].goldDistribution.stdDev;
      if (Math.abs(run.finalGold - goldMean) > 3 * goldStdDev) {
        outliers.push({
          loadout: loadoutId,
          luckyNumber: run.luckyNumber,
          finalGold: run.finalGold,
          finalScore: run.finalScore,
          domainsCleared: run.domainsCleared,
          reason: run.finalGold > goldMean ? 'High gold' : 'Low gold',
        });
      }
    }
  }

  // Calculate domain survival rates
  for (let d = 1; d <= 6; d++) {
    const survived = results.filter(r => r.domainsCleared >= d).length;
    const goldEarned = results
      .filter(r => r.goldPerDomain[d - 1] !== undefined)
      .reduce((a, r) => a + r.goldPerDomain[d - 1], 0);
    const scoreEarned = results
      .filter(r => r.scorePerDomain[d - 1] !== undefined)
      .reduce((a, r) => a + r.scorePerDomain[d - 1], 0);
    const hpRemaining = results
      .filter(r => r.hpAtDomainEnd[d - 1] !== undefined)
      .reduce((a, r) => a + r.hpAtDomainEnd[d - 1], 0);
    const count = results.filter(r => r.goldPerDomain[d - 1] !== undefined).length;

    byDomain[d] = {
      survivalRate: survived / results.length,
      avgGoldEarned: count > 0 ? goldEarned / count : 0,
      avgScoreEarned: count > 0 ? scoreEarned / count : 0,
      avgHPRemaining: count > 0 ? hpRemaining / count : 0,
    };
  }

  return {
    totalRuns: results.length,
    byLoadout,
    byDomain,
    goldCapAnalysis: {
      runsHittingSoftCap,
      runsHittingHardCap,
      avgGoldLostToCap: totalGoldLostToCap / results.length,
    },
    luckySynergyAnalysis: {
      avgBonusGold: totalLuckySynergyGold / results.length,
      percentOfTotalGold: (totalLuckySynergyGold / totalGoldEarned) * 100,
    },
    outliers: outliers.slice(0, 20), // Top 20 outliers
  };
}

// ============================================
// Main
// ============================================

function parseArgs(): SimulationConfig {
  const args = process.argv.slice(2);
  return {
    runs: parseInt(args.find(a => a.startsWith('--runs='))?.split('=')[1] || '10000', 10),
    seed: args.find(a => a.startsWith('--seed='))?.split('=')[1] || `economy-${Date.now()}`,
    verbose: args.includes('--verbose'),
  };
}

async function main() {
  const config = parseArgs();
  const rng = createSeededRng(config.seed);

  console.log('='.repeat(70));
  console.log('ECONOMY MONTE CARLO SIMULATION');
  console.log('='.repeat(70));
  console.log(`Runs: ${config.runs.toLocaleString()}`);
  console.log(`Seed: ${config.seed}`);
  console.log(`Loadouts: ${LOADOUT_PRESETS.length}`);
  console.log(`Domains: ${getDomainOrder().length}`);
  console.log('='.repeat(70));
  console.log('');

  const startTime = Date.now();
  const results: RunResult[] = [];

  // Distribute runs evenly across loadouts
  const runsPerLoadout = Math.floor(config.runs / LOADOUT_PRESETS.length);

  for (let i = 0; i < config.runs; i++) {
    const loadoutIdx = Math.floor(i / runsPerLoadout) % LOADOUT_PRESETS.length;
    const loadout = LOADOUT_PRESETS[loadoutIdx];

    const result = simulateRun(loadout, rng, config.verbose);
    results.push(result);

    if ((i + 1) % 1000 === 0 || i === config.runs - 1) {
      const pct = (((i + 1) / config.runs) * 100).toFixed(1);
      process.stdout.write(`\rProgress: ${pct}% (${i + 1}/${config.runs})`);
    }
  }

  console.log('\n');

  const stats = aggregateResults(results);
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  // Output summary
  console.log('='.repeat(70));
  console.log('SIMULATION SUMMARY');
  console.log('='.repeat(70));
  console.log(`Completed ${stats.totalRuns.toLocaleString()} runs in ${elapsed}s`);
  console.log('');

  console.log('LOADOUT PERFORMANCE');
  console.log('-'.repeat(70));
  for (const [id, data] of Object.entries(stats.byLoadout)) {
    const loadout = LOADOUT_PRESETS.find(l => l.id === id);
    console.log(`${loadout?.name.padEnd(12)} | Win: ${(data.winRate * 100).toFixed(1)}% | Domains: ${data.avgDomainsCleared.toFixed(2)} | Gold: ${data.avgGold.toFixed(0)} | Score: ${data.avgScore.toFixed(0)}`);
  }
  console.log('');

  console.log('DOMAIN SURVIVAL RATES');
  console.log('-'.repeat(70));
  const domainNames = ['Earth', 'Aberrant', 'Frost', 'Infernus', 'Shadow', 'Null Providence'];
  for (let d = 1; d <= 6; d++) {
    const data = stats.byDomain[d];
    console.log(`D${d} ${domainNames[d - 1].padEnd(16)} | Survival: ${(data.survivalRate * 100).toFixed(1)}% | Gold: ${data.avgGoldEarned.toFixed(0)} | HP: ${data.avgHPRemaining.toFixed(0)}`);
  }
  console.log('');

  console.log('GOLD CAP ANALYSIS');
  console.log('-'.repeat(70));
  console.log(`Soft cap hits (${GOLD_CONFIG.softCap}g): ${stats.goldCapAnalysis.runsHittingSoftCap} (${(stats.goldCapAnalysis.runsHittingSoftCap / stats.totalRuns * 100).toFixed(1)}%)`);
  console.log(`Hard cap hits (${GOLD_CONFIG.hardCap}g): ${stats.goldCapAnalysis.runsHittingHardCap} (${(stats.goldCapAnalysis.runsHittingHardCap / stats.totalRuns * 100).toFixed(1)}%)`);
  console.log('');

  console.log('LUCKY SYNERGY ANALYSIS');
  console.log('-'.repeat(70));
  console.log(`Avg bonus gold per run: ${stats.luckySynergyAnalysis.avgBonusGold.toFixed(0)}g`);
  console.log(`Percent of total gold: ${stats.luckySynergyAnalysis.percentOfTotalGold.toFixed(1)}%`);
  console.log('');

  // Save results
  const fs = await import('fs');
  const path = await import('path');
  const outputPath = path.join(__dirname, 'economy-sim-results.json');

  fs.writeFileSync(
    outputPath,
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        config,
        stats,
        sampleResults: results.slice(0, 100),
      },
      null,
      2
    )
  );

  console.log('='.repeat(70));
  console.log(`Results saved to: ${outputPath}`);
  console.log('='.repeat(70));
}

main().catch(console.error);
