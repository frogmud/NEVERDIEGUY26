#!/usr/bin/env ts-node
/**
 * Long-Running Arena Simulation
 *
 * Comprehensive simulation designed to run for 30+ minutes.
 * Tests all systems at scale with proper difficulty tuning.
 *
 * Run with: npx tsx scripts/long-run-sim.ts
 *
 * Options:
 *   --duration=N    Run for N minutes (default: 30)
 *   --seed=X        Random seed for reproducibility
 *   --difficulty=X  easy, normal, hard, nightmare (default: normal)
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { createSeededRng, type SeededRng } from '../src/core/seeded-rng';
import {
  createRollHoldState,
  roll,
  hold,
  canHold,
  type RollHoldState,
} from '../src/core/roll-hold-engine';
import {
  createCombatState,
  tickCombat,
  applyScore,
  calculateTargetScore,
  calculateDrainRate,
  type CombatState,
  type CombatRoom,
  type TimeDamageConfig,
} from '../src/core/time-damage';
import {
  createDebtState,
  processRescue,
  processFlume,
  applyInterest,
  getTotalDebt,
  type DebtState,
  type AvailableRescuer,
} from '../src/core/death-debt';
import {
  createNPCEconomyState,
  registerNPC,
  simulateNPCGamblingRound,
  getEconomySnapshot,
  getPriceMultiplier,
  calculateGiniCoefficient,
  type NPCEconomyState,
} from '../src/economy/npc-economy';
import {
  quickCeeloMatch,
} from '../src/gambling/ceelo-challenge';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================
// Difficulty Presets
// ============================================

interface DifficultyConfig {
  name: string;
  timeDamage: Partial<TimeDamageConfig>;
  targetScoreMultiplier: number;
  playerStartHP: number;
  healPerRoom: number;
  deathPenaltyMultiplier: number;
}

const DIFFICULTIES: Record<string, DifficultyConfig> = {
  easy: {
    name: 'Easy',
    timeDamage: {
      baseDrainPerSecond: 8,
      drainScalingPerAnte: 4,
    },
    targetScoreMultiplier: 1.5,
    playerStartHP: 120,
    healPerRoom: 10,
    deathPenaltyMultiplier: 0.5,
  },
  normal: {
    name: 'Normal',
    timeDamage: {
      baseDrainPerSecond: 25,
      drainScalingPerAnte: 14,
    },
    targetScoreMultiplier: 2.2,
    playerStartHP: 80,
    healPerRoom: 0,
    deathPenaltyMultiplier: 1.0,
  },
  hard: {
    name: 'Hard',
    timeDamage: {
      baseDrainPerSecond: 28,
      drainScalingPerAnte: 12,
    },
    targetScoreMultiplier: 2.5,
    playerStartHP: 80,
    healPerRoom: 0,
    deathPenaltyMultiplier: 1.5,
  },
  nightmare: {
    name: 'Nightmare',
    timeDamage: {
      baseDrainPerSecond: 40,
      drainScalingPerAnte: 18,
    },
    targetScoreMultiplier: 3.0,
    playerStartHP: 60,
    healPerRoom: 0,
    deathPenaltyMultiplier: 2.0,
  },
};

// ============================================
// NPC Pool
// ============================================

interface NPCDef {
  slug: string;
  name: string;
  category: 'traveler' | 'wanderer' | 'pantheon';
  startingGold: number;
  luckyNumber: number;
  willingnessToRescue: number;
}

const NPC_POOL: NPCDef[] = [
  { slug: 'stitch-up-girl', name: 'Stitch-Up Girl', category: 'traveler', startingGold: 150, luckyNumber: 3, willingnessToRescue: 0.9 },
  { slug: 'the-general', name: 'The General', category: 'traveler', startingGold: 200, luckyNumber: 2, willingnessToRescue: 0.5 },
  { slug: 'body-count', name: 'Body Count', category: 'traveler', startingGold: 120, luckyNumber: 6, willingnessToRescue: 0.7 },
  { slug: 'boots', name: 'Boots', category: 'traveler', startingGold: 100, luckyNumber: 7, willingnessToRescue: 0.8 },
  { slug: 'clausen', name: 'Clausen', category: 'traveler', startingGold: 180, luckyNumber: 4, willingnessToRescue: 0.6 },
  { slug: 'keith-man', name: 'Keith Man', category: 'traveler', startingGold: 90, luckyNumber: 5, willingnessToRescue: 0.7 },
  { slug: 'mr-kevin', name: 'Mr. Kevin', category: 'traveler', startingGold: 250, luckyNumber: 1, willingnessToRescue: 0.4 },
  { slug: 'willy', name: 'Willy One Eye', category: 'wanderer', startingGold: 300, luckyNumber: 5, willingnessToRescue: 0.6 },
  { slug: 'mr-bones', name: 'Mr. Bones', category: 'wanderer', startingGold: 200, luckyNumber: 5, willingnessToRescue: 0.4 },
  { slug: 'boo-g', name: 'Boo-G', category: 'wanderer', startingGold: 250, luckyNumber: 6, willingnessToRescue: 0.8 },
  { slug: 'king-james', name: 'King James', category: 'wanderer', startingGold: 400, luckyNumber: 1, willingnessToRescue: 0.3 },
  { slug: 'dr-maxwell', name: 'Dr. Maxwell', category: 'wanderer', startingGold: 350, luckyNumber: 4, willingnessToRescue: 0.9 },
  { slug: 'dr-voss', name: 'Dr. Voss', category: 'wanderer', startingGold: 320, luckyNumber: 3, willingnessToRescue: 0.5 },
  { slug: 'xtreme', name: 'Xtreme', category: 'wanderer', startingGold: 150, luckyNumber: 2, willingnessToRescue: 0.7 },
  { slug: 'the-one', name: 'The One', category: 'pantheon', startingGold: 500, luckyNumber: 1, willingnessToRescue: 0.1 },
  { slug: 'john', name: 'John', category: 'pantheon', startingGold: 450, luckyNumber: 2, willingnessToRescue: 0.2 },
  { slug: 'peter', name: 'Peter', category: 'pantheon', startingGold: 420, luckyNumber: 3, willingnessToRescue: 0.15 },
  { slug: 'robert', name: 'Robert', category: 'pantheon', startingGold: 480, luckyNumber: 4, willingnessToRescue: 0.1 },
];

// ============================================
// Types
// ============================================

interface PlayerState {
  maxHP: number;
  currentHP: number;
  gold: number;
  items: Array<{ id: string; value: number; name: string }>;
  luckyNumber: number;
  currentAnte: number;
  currentRoom: number;
  rollHoldState: RollHoldState;
}

interface RunResult {
  runNumber: number;
  anteReached: number;
  roomsCleared: number;
  deaths: number;
  flumed: boolean;
  goldEarned: number;
  goldSpent: number;
  goldGambled: number;
  goldWonGambling: number;
  itemsKept: number;
  itemsLost: number;
  debtIncurred: number;
  debtPaid: number;
  rescuers: string[];
  ceeloMatchesPlayed: number;
  ceeloWins: number;
  timeToComplete: number;
}

interface SimulationStats {
  totalRuns: number;
  totalTime: number;
  runsPerMinute: number;
  avgAnteReached: number;
  avgRoomsCleared: number;
  winRate: number;
  flumeRate: number;
  avgDeaths: number;
  deathRate: number;
  avgDebtPerRun: number;
  avgItemsKept: number;
  totalGoldCirculated: number;
  ceeloWinRate: number;
  totalCeeloMatches: number;
  rescuerBreakdown: Record<string, number>;
  giniOverTime: number[];
  wealthDistributionFinal: Record<string, number>;
  anteDistribution: number[];
  deathsByAnte: number[];
}

type Strategy = 'aggressive' | 'balanced' | 'conservative' | 'gambler';

// ============================================
// CLI Options
// ============================================

interface SimOptions {
  durationMinutes: number;
  seed: string;
  difficulty: string;
}

function parseArgs(): SimOptions {
  const args = process.argv.slice(2);
  const options: SimOptions = {
    durationMinutes: 30,
    seed: `longrun-${Date.now()}`,
    difficulty: 'normal',
  };

  for (const arg of args) {
    if (arg.startsWith('--duration=')) {
      options.durationMinutes = parseInt(arg.split('=')[1], 10);
    } else if (arg.startsWith('--seed=')) {
      options.seed = arg.split('=')[1];
    } else if (arg.startsWith('--difficulty=')) {
      options.difficulty = arg.split('=')[1];
    }
  }

  return options;
}

// ============================================
// Strategy Logic
// ============================================

function pickStrategy(rng: SeededRng): Strategy {
  const roll = rng.random('strategy');
  if (roll < 0.25) return 'aggressive';
  if (roll < 0.50) return 'balanced';
  if (roll < 0.75) return 'conservative';
  return 'gambler';
}

function shouldHoldDice(
  state: RollHoldState,
  lastScore: number,
  targetScore: number,
  currentScore: number,
  strategy: Strategy,
  rng: SeededRng
): boolean {
  if (!canHold(state)) return false;

  const progress = currentScore / targetScore;
  const heldDice = state.holdState.heldDice;
  const heldSum = heldDice.reduce((a, d) => a + d.value, 0);

  switch (strategy) {
    case 'aggressive':
      return lastScore >= 6 && rng.random('hold') < 0.8;

    case 'conservative':
      if (progress > 0.6) return false;
      return lastScore >= 15 && heldSum < 15;

    case 'gambler':
      // Always try to build big combos
      return lastScore >= 5 && rng.random('hold') < 0.9;

    case 'balanced':
    default:
      if (progress > 0.7) return false;
      return lastScore >= 10 && rng.random('hold') < 0.5;
  }
}

function shouldFlume(
  player: PlayerState,
  debtState: DebtState,
  strategy: Strategy,
  rng: SeededRng
): boolean {
  const totalDebt = getTotalDebt(debtState);
  const itemValue = player.items.reduce((a, i) => a + i.value, 0);

  switch (strategy) {
    case 'aggressive':
      return totalDebt > 300 && player.items.length >= 4;

    case 'conservative':
      return player.items.length >= 2 && rng.random('flume') < 0.4;

    case 'gambler':
      // Gamblers never flume - ride or die
      return false;

    case 'balanced':
    default:
      return itemValue > totalDebt * 1.5 && player.items.length >= 3;
  }
}

function shouldGamble(
  player: PlayerState,
  npcGold: number,
  strategy: Strategy,
  rng: SeededRng
): boolean {
  if (player.gold < 20 || npcGold < 20) return false;

  switch (strategy) {
    case 'gambler':
      return rng.random('gamble') < 0.7;
    case 'aggressive':
      return rng.random('gamble') < 0.3;
    case 'balanced':
      return rng.random('gamble') < 0.15;
    case 'conservative':
      return rng.random('gamble') < 0.05;
    default:
      return false;
  }
}

// ============================================
// Combat Simulation
// ============================================

function simulateCombat(
  player: PlayerState,
  room: CombatRoom,
  difficulty: DifficultyConfig,
  strategy: Strategy,
  rng: SeededRng
): { player: PlayerState; success: boolean } {
  const config = {
    ...difficulty.timeDamage,
    baseTargetScore: 50,
    targetScorePerAnte: 30,
    targetScorePerRoom: 15,
    bossTargetMultiplier: 2.5,
    domainDrainModifiers: { safe: 0.5, normal: 1.0, risky: 1.5 },
    pauseDrainOnHold: false,
    bonusTimeOnCrit: 0.5,
    bonusTimeOnLucky: 0.3,
  } as TimeDamageConfig;

  let combatState = createCombatState(room, player.maxHP, player.currentHP, config);

  // Apply difficulty multiplier to target
  const baseTarget = combatState.targetScore;
  const adjustedTarget = Math.floor(baseTarget * difficulty.targetScoreMultiplier);
  combatState = { ...combatState, targetScore: adjustedTarget };

  let rollHoldState = player.rollHoldState;
  const diceFaces = [1, 2, 3, 4, 5, 6];
  const maxTicks = 120;       // More ticks for longer fights
  const tickDuration = 0.25;  // Faster time resolution
  const rollEveryNTicks = 4;  // Roll every 4 ticks = 1 second per roll

  for (let tick = 0; tick < maxTicks; tick++) {
    combatState = tickCombat(combatState, tickDuration);

    if (combatState.currentHP <= 0) {
      return {
        player: { ...player, currentHP: 0, rollHoldState },
        success: false,
      };
    }

    // Only roll every N ticks (simulates throw animation time)
    if (tick % rollEveryNTicks !== 0) continue;

    const { state: newRollState, result } = roll(
      rollHoldState,
      diceFaces,
      rng,
      player.luckyNumber
    );
    rollHoldState = newRollState;

    const lastRoll = newRollState.lastRoll;
    const crits = lastRoll?.critCount ?? 0;
    const lucky = lastRoll?.luckyCount ?? 0;
    combatState = applyScore(combatState, result.finalScore, crits, lucky);

    if (combatState.currentScore >= adjustedTarget) {
      const healAmount = difficulty.healPerRoom;
      return {
        player: {
          ...player,
          currentHP: Math.min(player.maxHP, combatState.currentHP + healAmount),
          rollHoldState,
        },
        success: true,
      };
    }

    if (shouldHoldDice(rollHoldState, result.finalScore, adjustedTarget, combatState.currentScore, strategy, rng)) {
      rollHoldState = hold(rollHoldState);
    }
  }

  return {
    player: { ...player, currentHP: combatState.currentHP, rollHoldState },
    success: combatState.currentScore >= adjustedTarget,
  };
}

// ============================================
// Run Simulation
// ============================================

function simulateRun(
  runNumber: number,
  economyState: NPCEconomyState,
  difficulty: DifficultyConfig,
  rng: SeededRng
): { result: RunResult; economyState: NPCEconomyState; debtState: DebtState } {
  const startTime = Date.now();
  let debtState = createDebtState();
  let currentEconomy = economyState;
  const strategy = pickStrategy(rng);

  let player: PlayerState = {
    maxHP: difficulty.playerStartHP,
    currentHP: difficulty.playerStartHP,
    gold: 50,
    items: [],
    luckyNumber: Math.floor(rng.random('luckyNum') * 6) + 1,
    currentAnte: 1,
    currentRoom: 0,
    rollHoldState: createRollHoldState(),
  };

  const result: RunResult = {
    runNumber,
    anteReached: 0,
    roomsCleared: 0,
    deaths: 0,
    flumed: false,
    goldEarned: 0,
    goldSpent: 0,
    goldGambled: 0,
    goldWonGambling: 0,
    itemsKept: 0,
    itemsLost: 0,
    debtIncurred: 0,
    debtPaid: 0,
    rescuers: [],
    ceeloMatchesPlayed: 0,
    ceeloWins: 0,
    timeToComplete: 0,
  };

  const ANTES = 3;
  const ROOMS_PER_ANTE = 3;
  const domains: Array<'safe' | 'normal' | 'risky'> = ['safe', 'normal', 'risky'];

  for (let ante = 1; ante <= ANTES; ante++) {
    player.currentAnte = ante;

    for (let roomNum = 0; roomNum < ROOMS_PER_ANTE; roomNum++) {
      player.currentRoom = roomNum;

      const room: CombatRoom = {
        ante,
        room: roomNum + 1,
        domain: domains[roomNum % 3],
        isBoss: ante === 3 && roomNum === 2,
      };

      player.rollHoldState = createRollHoldState();

      const combatResult = simulateCombat(player, room, difficulty, strategy, rng);
      player = combatResult.player;

      if (!combatResult.success) {
        result.deaths++;

        const rescuers: AvailableRescuer[] = NPC_POOL
          .filter(n => ['wanderer', 'traveler'].includes(n.category))
          .map(n => ({
            slug: n.slug,
            name: n.name,
            category: n.category,
            relationshipScore: 0,
            currentDebtToPlayer: 0,
            willingnessToRescue: n.willingnessToRescue,
          }));

        const rescuerIdx = Math.floor(rng.random('rescuer') * rescuers.length);
        const { state: newDebtState, result: rescueResult } = processRescue(
          debtState,
          rescuers[rescuerIdx],
          ante,
          player.maxHP,
          player.gold,
          player.items
        );

        debtState = newDebtState;
        result.rescuers.push(rescueResult.rescuerName);
        result.debtIncurred += rescueResult.debtIncurred * difficulty.deathPenaltyMultiplier;
        result.itemsLost += rescueResult.itemsLost.length;

        player.currentHP = rescueResult.hpRestored;
        player.gold = Math.floor(player.gold * 0.8);
        player.items = player.items.filter(i => !rescueResult.itemsLost.includes(i.id));

        continue;
      }

      result.roomsCleared++;

      const goldReward = 10 + ante * 8 + roomNum * 4;
      player.gold += goldReward;
      result.goldEarned += goldReward;

      if (rng.random('itemDrop') < 0.25) {
        const itemValue = 25 + ante * 20;
        player.items.push({
          id: `item-${runNumber}-${ante}-${roomNum}`,
          name: `Loot ${ante}.${roomNum}`,
          value: itemValue,
        });
      }
    }

    result.anteReached = ante;

    // NPC economy tick with wealth floor (broke NPCs do odd jobs)
    for (let i = 0; i < 3; i++) {
      currentEconomy = simulateNPCGamblingRound(currentEconomy, rng);
    }
    // Wealth floor: broke NPCs earn income from other activities
    const updatedWealth = new Map(currentEconomy.npcWealth);
    for (const [slug, record] of updatedWealth) {
      if (record.currentGold < 50) {
        updatedWealth.set(slug, {
          ...record,
          currentGold: record.currentGold + 20, // Odd jobs income
        });
      }
    }
    currentEconomy = { ...currentEconomy, npcWealth: updatedWealth };

    // Shop phase
    if (player.gold >= 30 && rng.random('shop') < 0.6) {
      const shopNPC = NPC_POOL[Math.floor(rng.random('shopNPC') * NPC_POOL.length)];
      const priceMultiplier = getPriceMultiplier(currentEconomy, shopNPC.slug);
      const itemCost = Math.floor(30 * priceMultiplier);

      if (player.gold >= itemCost) {
        player.gold -= itemCost;
        result.goldSpent += itemCost;
        player.items.push({
          id: `shop-${runNumber}-${ante}`,
          name: `Shop Item ${ante}`,
          value: itemCost * 1.3,
        });
      }
    }

    // Ceelo gambling
    if (shouldGamble(player, 100, strategy, rng)) {
      const gamblingNPC = NPC_POOL[Math.floor(rng.random('gamblingNPC') * NPC_POOL.length)];
      const stake = Math.min(player.gold, 50);
      result.goldGambled += stake;
      result.ceeloMatchesPlayed++;

      const matchResult = quickCeeloMatch(
        gamblingNPC.slug,
        gamblingNPC.name,
        gamblingNPC.luckyNumber,
        player.luckyNumber,
        stake,
        rng
      );

      if (matchResult.winner === 'player') {
        player.gold += stake;
        result.goldWonGambling += stake;
        result.ceeloWins++;
      } else if (matchResult.winner === 'npc') {
        player.gold -= stake;
      }
    }

    // Flume decision
    if (ante < ANTES && shouldFlume(player, debtState, strategy, rng)) {
      const { state: newDebtState, result: flumeResult } = processFlume(
        debtState,
        player.items,
        player.gold
      );

      debtState = newDebtState;
      result.flumed = true;
      result.itemsKept = flumeResult.itemsKept.length;
      result.itemsLost += flumeResult.itemsLostToDebt.length;
      result.debtPaid += flumeResult.debtPaid;
      break;
    }

    debtState = applyInterest(debtState);
  }

  if (!result.flumed) {
    result.itemsKept = player.items.length;
  }

  result.timeToComplete = Date.now() - startTime;

  return { result, economyState: currentEconomy, debtState };
}

// ============================================
// Main Simulation Loop
// ============================================

function runLongSimulation(options: SimOptions): SimulationStats {
  const rng = createSeededRng(options.seed);
  const difficulty = DIFFICULTIES[options.difficulty] || DIFFICULTIES.normal;

  // Initialize economy
  let economyState = createNPCEconomyState();
  for (const npc of NPC_POOL) {
    economyState = registerNPC(
      economyState,
      npc.slug,
      npc.name,
      npc.category,
      npc.startingGold
    );
  }

  console.log('='.repeat(70));
  console.log('LONG-RUNNING ARENA SIMULATION');
  console.log('='.repeat(70));
  console.log(`Duration: ${options.durationMinutes} minutes`);
  console.log(`Difficulty: ${difficulty.name}`);
  console.log(`Seed: ${options.seed}`);
  console.log(`HP Drain: ${difficulty.timeDamage.baseDrainPerSecond}/sec base`);
  console.log(`Target Multiplier: ${difficulty.targetScoreMultiplier}x`);
  console.log('='.repeat(70));
  console.log('');
  console.log('Starting simulation... (updates every 60 seconds)');
  console.log('');

  const results: RunResult[] = [];
  const giniOverTime: number[] = [];
  const rescuerCounts: Map<string, number> = new Map();
  const anteDistribution = [0, 0, 0, 0]; // 0, 1, 2, 3 antes
  const deathsByAnte = [0, 0, 0, 0];

  const startTime = Date.now();
  const endTime = startTime + options.durationMinutes * 60 * 1000;
  let lastUpdate = startTime;
  let runNumber = 0;

  while (Date.now() < endTime) {
    runNumber++;

    const { result, economyState: newEconomy } = simulateRun(
      runNumber,
      economyState,
      difficulty,
      rng
    );

    results.push(result);
    economyState = newEconomy;

    anteDistribution[result.anteReached]++;
    for (const rescuer of result.rescuers) {
      rescuerCounts.set(rescuer, (rescuerCounts.get(rescuer) ?? 0) + 1);
    }
    if (result.deaths > 0) {
      deathsByAnte[result.anteReached]++;
    }

    // Update every 60 seconds
    const now = Date.now();
    if (now - lastUpdate >= 60000) {
      const elapsed = (now - startTime) / 1000 / 60;
      const remaining = (endTime - now) / 1000 / 60;
      const gini = calculateGiniCoefficient(economyState);
      giniOverTime.push(gini);

      const winRate = results.filter(r => r.anteReached === 3 && !r.flumed).length / results.length;
      const deathRate = results.filter(r => r.deaths > 0).length / results.length;

      console.log(`[${elapsed.toFixed(1)}m / ${remaining.toFixed(1)}m remaining]`);
      console.log(`  Runs: ${results.length} | Win: ${(winRate * 100).toFixed(1)}% | Deaths: ${(deathRate * 100).toFixed(1)}%`);
      console.log(`  Gini: ${gini.toFixed(3)} | NPC Gold: ${economyState.totalGoldCirculated}`);
      console.log('');

      lastUpdate = now;
    }
  }

  const totalTime = (Date.now() - startTime) / 1000 / 60;
  const snapshot = getEconomySnapshot(economyState);

  const stats: SimulationStats = {
    totalRuns: results.length,
    totalTime,
    runsPerMinute: results.length / totalTime,
    avgAnteReached: results.reduce((a, r) => a + r.anteReached, 0) / results.length,
    avgRoomsCleared: results.reduce((a, r) => a + r.roomsCleared, 0) / results.length,
    winRate: results.filter(r => r.anteReached === 3 && !r.flumed).length / results.length,
    flumeRate: results.filter(r => r.flumed).length / results.length,
    avgDeaths: results.reduce((a, r) => a + r.deaths, 0) / results.length,
    deathRate: results.filter(r => r.deaths > 0).length / results.length,
    avgDebtPerRun: results.reduce((a, r) => a + r.debtIncurred, 0) / results.length,
    avgItemsKept: results.reduce((a, r) => a + r.itemsKept, 0) / results.length,
    totalGoldCirculated: economyState.totalGoldCirculated,
    ceeloWinRate: results.reduce((a, r) => a + r.ceeloWins, 0) /
      Math.max(1, results.reduce((a, r) => a + r.ceeloMatchesPlayed, 0)),
    totalCeeloMatches: results.reduce((a, r) => a + r.ceeloMatchesPlayed, 0),
    rescuerBreakdown: Object.fromEntries(rescuerCounts),
    giniOverTime,
    wealthDistributionFinal: snapshot.wealthDistribution,
    anteDistribution,
    deathsByAnte,
  };

  return stats;
}

// ============================================
// Report Generation
// ============================================

function generateReport(stats: SimulationStats, difficulty: DifficultyConfig): void {
  console.log('');
  console.log('='.repeat(70));
  console.log('FINAL SIMULATION REPORT');
  console.log('='.repeat(70));
  console.log('');

  console.log('PERFORMANCE');
  console.log('-'.repeat(40));
  console.log(`Total Runs: ${stats.totalRuns.toLocaleString()}`);
  console.log(`Total Time: ${stats.totalTime.toFixed(1)} minutes`);
  console.log(`Throughput: ${stats.runsPerMinute.toFixed(1)} runs/minute`);
  console.log('');

  console.log('PROGRESSION');
  console.log('-'.repeat(40));
  console.log(`Average Ante Reached: ${stats.avgAnteReached.toFixed(2)} / 3`);
  console.log(`Average Rooms Cleared: ${stats.avgRoomsCleared.toFixed(1)} / 9`);
  console.log('');

  console.log('ANTE DISTRIBUTION');
  console.log('-'.repeat(40));
  for (let ante = 0; ante <= 3; ante++) {
    const count = stats.anteDistribution[ante];
    const pct = ((count / stats.totalRuns) * 100).toFixed(1);
    const bar = '#'.repeat(Math.floor(parseFloat(pct) / 2));
    console.log(`  Ante ${ante}: ${count.toLocaleString().padStart(6)} (${pct.padStart(5)}%) ${bar}`);
  }
  console.log('');

  console.log('OUTCOMES');
  console.log('-'.repeat(40));
  console.log(`Win Rate (completed all 3 antes): ${(stats.winRate * 100).toFixed(1)}%`);
  console.log(`Flume Rate: ${(stats.flumeRate * 100).toFixed(1)}%`);
  console.log(`Death Rate (runs with 1+ death): ${(stats.deathRate * 100).toFixed(1)}%`);
  console.log(`Average Deaths per Run: ${stats.avgDeaths.toFixed(2)}`);
  console.log('');

  console.log('DEATHS BY ANTE');
  console.log('-'.repeat(40));
  for (let ante = 1; ante <= 3; ante++) {
    const count = stats.deathsByAnte[ante];
    const pct = ((count / stats.totalRuns) * 100).toFixed(1);
    console.log(`  Ante ${ante}: ${count.toLocaleString()} deaths (${pct}% of runs)`);
  }
  console.log('');

  console.log('ECONOMY');
  console.log('-'.repeat(40));
  console.log(`Average Debt per Run: ${stats.avgDebtPerRun.toFixed(0)} gold`);
  console.log(`Average Items Kept: ${stats.avgItemsKept.toFixed(1)}`);
  console.log(`Total NPC Gold Circulated: ${stats.totalGoldCirculated.toLocaleString()}`);
  console.log('');

  console.log('CEELO GAMBLING');
  console.log('-'.repeat(40));
  console.log(`Total Matches: ${stats.totalCeeloMatches.toLocaleString()}`);
  console.log(`Player Win Rate: ${(stats.ceeloWinRate * 100).toFixed(1)}%`);
  console.log('');

  console.log('TOP RESCUERS');
  console.log('-'.repeat(40));
  const sortedRescuers = Object.entries(stats.rescuerBreakdown)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  for (const [name, count] of sortedRescuers) {
    const pct = ((count / stats.totalRuns) * 100).toFixed(1);
    console.log(`  ${name.padEnd(20)} ${count.toLocaleString().padStart(6)} rescues (${pct}%)`);
  }
  console.log('');

  console.log('GINI COEFFICIENT OVER TIME');
  console.log('-'.repeat(40));
  if (stats.giniOverTime.length > 0) {
    const first = stats.giniOverTime[0];
    const last = stats.giniOverTime[stats.giniOverTime.length - 1];
    const max = Math.max(...stats.giniOverTime);
    const min = Math.min(...stats.giniOverTime);
    console.log(`  Start: ${first.toFixed(3)}`);
    console.log(`  End: ${last.toFixed(3)}`);
    console.log(`  Max: ${max.toFixed(3)}`);
    console.log(`  Min: ${min.toFixed(3)}`);
    console.log(`  Change: ${(last - first >= 0 ? '+' : '')}${(last - first).toFixed(3)}`);
  }
  console.log('');

  console.log('FINAL NPC WEALTH DISTRIBUTION');
  console.log('-'.repeat(40));
  for (const [tier, count] of Object.entries(stats.wealthDistributionFinal)) {
    const pct = ((count / 18) * 100).toFixed(0);
    console.log(`  ${tier.padEnd(12)}: ${count} NPCs (${pct}%)`);
  }
  console.log('');
}

// ============================================
// Main
// ============================================

async function main() {
  const options = parseArgs();
  const difficulty = DIFFICULTIES[options.difficulty] || DIFFICULTIES.normal;

  const stats = runLongSimulation(options);
  generateReport(stats, difficulty);

  // Save results
  const logDir = path.join(__dirname, '..', 'logs');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outputPath = path.join(logDir, `long-run-${timestamp}.json`);

  fs.writeFileSync(
    outputPath,
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        options,
        difficulty: difficulty.name,
        stats,
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
