#!/usr/bin/env ts-node
/**
 * Arena Run Simulation
 *
 * Full integrated simulation of a roguelike run:
 * - Roll/Hold combat with time-based damage
 * - Death creates debt to rescuing NPC
 * - NPC economy affects shop prices
 * - Flume mechanic to escape with items
 *
 * Run with: npx tsx scripts/arena-run-sim.ts
 *
 * Options:
 *   --runs=N        Number of runs to simulate (default: 100)
 *   --seed=X        Random seed for reproducibility
 *   --verbose       Show individual run details
 *   --strategy=X    Player strategy: aggressive, balanced, conservative
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { createSeededRng, type SeededRng } from '../src/core/seeded-rng';
import {
  createRollHoldState,
  roll,
  hold,
  DEFAULT_ROLL_HOLD_CONFIG,
  type RollHoldState,
  type RollHoldConfig,
} from '../src/core/roll-hold-engine';
import {
  createCombatState,
  tickCombat,
  applyScore,
  calculateTargetScore,
  DEFAULT_TIME_DAMAGE_CONFIG,
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
  getDebtSummary,
  DEFAULT_DEATH_DEBT_CONFIG,
  type DebtState,
  type AvailableRescuer,
} from '../src/core/death-debt';
import {
  createNPCEconomyState,
  registerNPC,
  simulateNPCGamblingRound,
  getEconomySnapshot,
  getPriceMultiplier,
  type NPCEconomyState,
} from '../src/economy/npc-economy';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================
// Simulation Types
// ============================================

interface PlayerState {
  maxHP: number;
  currentHP: number;
  gold: number;
  items: Array<{ id: string; value: number; name: string }>;
  luckyNumber: number;
  currentAnte: number;
  currentRoom: number;
  totalScore: number;
  rollHoldState: RollHoldState;
}

interface RunResult {
  runNumber: number;
  anteReached: number;
  roomsCleared: number;
  finalScore: number;
  deaths: number;
  flumed: boolean;
  goldEarned: number;
  goldSpent: number;
  itemsKept: number;
  itemsLost: number;
  debtIncurred: number;
  debtPaid: number;
  rescuers: string[];
}

interface SimulationStats {
  totalRuns: number;
  avgAnteReached: number;
  avgRoomsCleared: number;
  avgScore: number;
  winRate: number;          // % that completed all 3 antes
  flumeRate: number;        // % that flumed successfully
  avgDeaths: number;
  avgDebtPerRun: number;
  avgItemsKept: number;
  totalGoldCirculated: number;
  mostCommonRescuer: string;
  giniAtEnd: number;
}

type Strategy = 'aggressive' | 'balanced' | 'conservative';

// ============================================
// CLI Options
// ============================================

interface SimOptions {
  runs: number;
  seed: string;
  verbose: boolean;
  strategy: Strategy;
}

function parseArgs(): SimOptions {
  const args = process.argv.slice(2);
  const options: SimOptions = {
    runs: 100,
    seed: `arena-${Date.now()}`,
    verbose: false,
    strategy: 'balanced',
  };

  for (const arg of args) {
    if (arg.startsWith('--runs=')) {
      options.runs = parseInt(arg.split('=')[1], 10);
    } else if (arg.startsWith('--seed=')) {
      options.seed = arg.split('=')[1];
    } else if (arg === '--verbose') {
      options.verbose = true;
    } else if (arg.startsWith('--strategy=')) {
      options.strategy = arg.split('=')[1] as Strategy;
    }
  }

  return options;
}

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
  { slug: 'willy', name: 'Willy One Eye', category: 'wanderer', startingGold: 300, luckyNumber: 5, willingnessToRescue: 0.6 },
  { slug: 'mr-bones', name: 'Mr. Bones', category: 'wanderer', startingGold: 200, luckyNumber: 5, willingnessToRescue: 0.4 },
  { slug: 'boo-g', name: 'Boo-G', category: 'wanderer', startingGold: 250, luckyNumber: 6, willingnessToRescue: 0.8 },
  { slug: 'king-james', name: 'King James', category: 'wanderer', startingGold: 400, luckyNumber: 1, willingnessToRescue: 0.3 },
  { slug: 'dr-maxwell', name: 'Dr. Maxwell', category: 'wanderer', startingGold: 350, luckyNumber: 4, willingnessToRescue: 0.9 },
  { slug: 'the-one', name: 'The One', category: 'pantheon', startingGold: 500, luckyNumber: 1, willingnessToRescue: 0.1 },
];

// ============================================
// Strategy Implementations
// ============================================

function shouldHold(
  state: RollHoldState,
  lastScore: number,
  targetScore: number,
  strategy: Strategy,
  rng: SeededRng
): boolean {
  const heldDice = state.holdState.heldDice;
  const heldSum = heldDice.reduce((a, d) => a + d.value, 0);
  const canHoldMore = heldDice.length < (state.config?.maxHeldDice ?? 3);

  switch (strategy) {
    case 'aggressive':
      // Hold on any decent roll, stack multipliers
      return canHoldMore && lastScore >= 8 && rng.random('hold') < 0.7;

    case 'conservative':
      // Only hold on great rolls, aim for safety
      return canHoldMore && lastScore >= 15 && heldSum < 20;

    case 'balanced':
    default:
      // Hold strategically based on target
      const progress = state.totalScore / targetScore;
      if (progress > 0.7) return false; // Don't risk it when close
      return canHoldMore && lastScore >= 10 && rng.random('hold') < 0.5;
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
      // Only flume if heavily in debt
      return totalDebt > 200 && player.items.length >= 3;

    case 'conservative':
      // Flume often to keep items
      return player.items.length >= 2 && rng.random('flume') < 0.6;

    case 'balanced':
    default:
      // Flume based on value vs debt
      return itemValue > totalDebt * 2 && player.items.length >= 2;
  }
}

// ============================================
// Combat Simulation
// ============================================

function simulateCombat(
  player: PlayerState,
  room: CombatRoom,
  strategy: Strategy,
  rng: SeededRng,
  config: { rollHold: RollHoldConfig; timeDamage: TimeDamageConfig },
  verbose: boolean
): { player: PlayerState; success: boolean; scoreAchieved: number } {
  let combatState = createCombatState(
    room,
    player.maxHP,
    player.currentHP,
    config.timeDamage
  );

  let rollHoldState = player.rollHoldState;
  const targetScore = combatState.targetScore;
  const diceFaces = [1, 2, 3, 4, 5, 6]; // Standard d6 pool

  // Simulate combat ticks (10 ticks = ~10 seconds of combat)
  const maxTicks = 30;
  const tickDuration = 1.0; // 1 second per tick

  for (let tick = 0; tick < maxTicks; tick++) {
    // Time damage
    combatState = tickCombat(combatState, tickDuration);

    if (combatState.currentHP <= 0) {
      // Player died
      return {
        player: {
          ...player,
          currentHP: 0,
          rollHoldState,
        },
        success: false,
        scoreAchieved: rollHoldState.totalScore,
      };
    }

    // Roll
    const { state: newRollState, result } = roll(
      rollHoldState,
      diceFaces,
      rng,
      player.luckyNumber
    );
    rollHoldState = newRollState;

    // Get crit/lucky counts from the lastRoll stored in state
    const lastRoll = newRollState.lastRoll;
    const crits = lastRoll?.critCount ?? 0;
    const lucky = lastRoll?.luckyCount ?? 0;
    combatState = applyScore(combatState, result.finalScore, crits, lucky);

    if (verbose && tick % 5 === 0) {
      console.log(
        `  Tick ${tick}: HP=${combatState.currentHP.toFixed(0)}, ` +
        `Score=${combatState.currentScore}/${targetScore}`
      );
    }

    // Check victory
    if (combatState.currentScore >= targetScore) {
      return {
        player: {
          ...player,
          currentHP: combatState.currentHP,
          rollHoldState,
          totalScore: player.totalScore + combatState.currentScore,
        },
        success: true,
        scoreAchieved: combatState.currentScore,
      };
    }

    // Decide to hold
    if (shouldHold(rollHoldState, result.finalScore, targetScore, strategy, rng)) {
      rollHoldState = hold(rollHoldState);
    }
  }

  // Time ran out
  return {
    player: {
      ...player,
      currentHP: combatState.currentHP,
      rollHoldState,
    },
    success: combatState.currentScore >= targetScore,
    scoreAchieved: combatState.currentScore,
  };
}

// ============================================
// Run Simulation
// ============================================

function simulateRun(
  runNumber: number,
  economyState: NPCEconomyState,
  strategy: Strategy,
  rng: SeededRng,
  verbose: boolean
): { result: RunResult; economyState: NPCEconomyState; debtState: DebtState } {
  let debtState = createDebtState();
  let currentEconomy = economyState;

  let player: PlayerState = {
    maxHP: 100,
    currentHP: 100,
    gold: 50,
    items: [],
    luckyNumber: Math.floor(rng.random('luckyNum') * 6) + 1,
    currentAnte: 1,
    currentRoom: 0,
    totalScore: 0,
    rollHoldState: createRollHoldState(),
  };

  const result: RunResult = {
    runNumber,
    anteReached: 0,
    roomsCleared: 0,
    finalScore: 0,
    deaths: 0,
    flumed: false,
    goldEarned: 0,
    goldSpent: 0,
    itemsKept: 0,
    itemsLost: 0,
    debtIncurred: 0,
    debtPaid: 0,
    rescuers: [],
  };

  const ANTES = 3;
  const ROOMS_PER_ANTE = 3;

  for (let ante = 1; ante <= ANTES; ante++) {
    player.currentAnte = ante;

    if (verbose) {
      console.log(`\n--- ANTE ${ante} ---`);
    }

    for (let roomNum = 0; roomNum < ROOMS_PER_ANTE; roomNum++) {
      player.currentRoom = roomNum;

      // Create room
      const room: CombatRoom = {
        ante,
        room: roomNum + 1,
        domain: ['safe', 'normal', 'risky'][roomNum % 3] as 'safe' | 'normal' | 'risky',
        isBoss: ante === 3 && roomNum === 2,
      };

      const targetScore = calculateTargetScore(room, DEFAULT_TIME_DAMAGE_CONFIG);

      if (verbose) {
        console.log(`Room ${roomNum + 1} (${room.domain}): Target ${targetScore}`);
      }

      // Reset roll/hold state for new room
      player.rollHoldState = createRollHoldState();

      // Combat
      const combatResult = simulateCombat(
        player,
        room,
        strategy,
        rng,
        { rollHold: DEFAULT_ROLL_HOLD_CONFIG, timeDamage: DEFAULT_TIME_DAMAGE_CONFIG },
        verbose
      );

      player = combatResult.player;

      if (!combatResult.success) {
        // Player died
        result.deaths++;

        if (verbose) {
          console.log(`  DEATH! Finding rescuer...`);
        }

        // Find rescuer
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

        const { state: newDebtState, result: rescueResult } = processRescue(
          debtState,
          rescuers[Math.floor(rng.random('rescuer') * rescuers.length)],
          ante,
          player.maxHP,
          player.gold,
          player.items
        );

        debtState = newDebtState;
        result.rescuers.push(rescueResult.rescuerName);
        result.debtIncurred += rescueResult.debtIncurred;
        result.itemsLost += rescueResult.itemsLost.length;

        // Restore player
        player.currentHP = rescueResult.hpRestored;
        player.gold = Math.floor(player.gold * 0.8);
        player.items = player.items.filter(i => !rescueResult.itemsLost.includes(i.id));

        if (verbose) {
          console.log(`  Rescued by ${rescueResult.rescuerName}, debt: ${rescueResult.debtIncurred}`);
        }

        // Continue from this room
        continue;
      }

      result.roomsCleared++;

      // Room reward
      const goldReward = 10 + ante * 5 + roomNum * 3;
      player.gold += goldReward;
      result.goldEarned += goldReward;

      // Chance for item
      if (rng.random('itemDrop') < 0.3) {
        const itemValue = 20 + ante * 15;
        player.items.push({
          id: `item-${runNumber}-${ante}-${roomNum}`,
          name: `Loot ${ante}.${roomNum}`,
          value: itemValue,
        });
      }
    }

    result.anteReached = ante;

    // End of ante - shop phase
    // Simulate NPC economy tick
    currentEconomy = simulateNPCGamblingRound(currentEconomy, rng);

    // Optional shop interaction (simplified)
    if (player.gold >= 30 && rng.random('shop') < 0.5) {
      const shopNPC = NPC_POOL[Math.floor(rng.random('shopNPC') * NPC_POOL.length)];
      const priceMultiplier = getPriceMultiplier(currentEconomy, shopNPC.slug);
      const itemCost = Math.floor(25 * priceMultiplier);

      if (player.gold >= itemCost) {
        player.gold -= itemCost;
        result.goldSpent += itemCost;
        player.items.push({
          id: `shop-${runNumber}-${ante}`,
          name: `Shop Item ${ante}`,
          value: itemCost * 1.5,
        });
      }
    }

    // Flume decision at end of ante
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

      if (verbose) {
        console.log(`\nFLUMED at ante ${ante}! Kept ${flumeResult.itemsKept.length} items`);
      }

      break;
    }

    // Apply interest on debt between antes
    debtState = applyInterest(debtState);
  }

  // Run complete
  result.finalScore = player.totalScore;
  if (!result.flumed) {
    result.itemsKept = player.items.length;
  }

  return { result, economyState: currentEconomy, debtState };
}

// ============================================
// Main Simulation
// ============================================

function runSimulation(options: SimOptions): {
  results: RunResult[];
  stats: SimulationStats;
  finalEconomy: NPCEconomyState;
} {
  const rng = createSeededRng(options.seed);

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
  console.log('ARENA RUN SIMULATION');
  console.log('='.repeat(70));
  console.log(`Runs: ${options.runs}`);
  console.log(`Strategy: ${options.strategy}`);
  console.log(`Seed: ${options.seed}`);
  console.log('='.repeat(70));
  console.log('');

  const results: RunResult[] = [];
  const rescuerCounts: Map<string, number> = new Map();
  let totalDebt = 0;

  for (let i = 0; i < options.runs; i++) {
    const { result, economyState: newEconomy } = simulateRun(
      i + 1,
      economyState,
      options.strategy,
      rng,
      options.verbose
    );

    results.push(result);
    economyState = newEconomy;
    totalDebt += result.debtIncurred;

    for (const rescuer of result.rescuers) {
      rescuerCounts.set(rescuer, (rescuerCounts.get(rescuer) ?? 0) + 1);
    }

    // Progress update
    if ((i + 1) % 10 === 0 || i === options.runs - 1) {
      const avgAnte = results.reduce((a, r) => a + r.anteReached, 0) / results.length;
      const winRate = results.filter(r => r.anteReached === 3 && !r.flumed).length / results.length;
      process.stdout.write(
        `Run ${i + 1}/${options.runs}: ` +
        `Avg Ante: ${avgAnte.toFixed(2)}, ` +
        `Win Rate: ${(winRate * 100).toFixed(1)}%\n`
      );
    }
  }

  // Calculate stats
  const finalSnapshot = getEconomySnapshot(economyState);
  const mostCommonRescuer = [...rescuerCounts.entries()]
    .sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'none';

  const stats: SimulationStats = {
    totalRuns: options.runs,
    avgAnteReached: results.reduce((a, r) => a + r.anteReached, 0) / options.runs,
    avgRoomsCleared: results.reduce((a, r) => a + r.roomsCleared, 0) / options.runs,
    avgScore: results.reduce((a, r) => a + r.finalScore, 0) / options.runs,
    winRate: results.filter(r => r.anteReached === 3 && !r.flumed).length / options.runs,
    flumeRate: results.filter(r => r.flumed).length / options.runs,
    avgDeaths: results.reduce((a, r) => a + r.deaths, 0) / options.runs,
    avgDebtPerRun: totalDebt / options.runs,
    avgItemsKept: results.reduce((a, r) => a + r.itemsKept, 0) / options.runs,
    totalGoldCirculated: economyState.totalGoldCirculated,
    mostCommonRescuer,
    giniAtEnd: finalSnapshot.giniCoefficient,
  };

  return { results, stats, finalEconomy: economyState };
}

// ============================================
// Report
// ============================================

function generateReport(stats: SimulationStats, economy: NPCEconomyState): void {
  console.log('');
  console.log('='.repeat(70));
  console.log('SIMULATION RESULTS');
  console.log('='.repeat(70));
  console.log('');

  console.log('PROGRESSION');
  console.log('-'.repeat(40));
  console.log(`Average Ante Reached: ${stats.avgAnteReached.toFixed(2)} / 3`);
  console.log(`Average Rooms Cleared: ${stats.avgRoomsCleared.toFixed(1)} / 9`);
  console.log(`Average Final Score: ${stats.avgScore.toFixed(0)}`);
  console.log('');

  console.log('OUTCOMES');
  console.log('-'.repeat(40));
  console.log(`Win Rate (completed all 3 antes): ${(stats.winRate * 100).toFixed(1)}%`);
  console.log(`Flume Rate: ${(stats.flumeRate * 100).toFixed(1)}%`);
  console.log(`Average Deaths per Run: ${stats.avgDeaths.toFixed(2)}`);
  console.log('');

  console.log('ECONOMY');
  console.log('-'.repeat(40));
  console.log(`Average Debt per Run: ${stats.avgDebtPerRun.toFixed(0)} gold`);
  console.log(`Average Items Kept: ${stats.avgItemsKept.toFixed(1)}`);
  console.log(`Total NPC Gold Circulated: ${stats.totalGoldCirculated}`);
  console.log(`Final Gini Coefficient: ${stats.giniAtEnd.toFixed(3)}`);
  console.log('');

  console.log('RESCUE STATS');
  console.log('-'.repeat(40));
  console.log(`Most Common Rescuer: ${stats.mostCommonRescuer}`);
  console.log('');

  const snapshot = getEconomySnapshot(economy);
  console.log('NPC WEALTH DISTRIBUTION');
  console.log('-'.repeat(40));
  for (const [tier, count] of Object.entries(snapshot.wealthDistribution)) {
    const pct = ((count / economy.npcWealth.size) * 100).toFixed(0);
    console.log(`  ${tier.padEnd(12)}: ${count} NPCs (${pct}%)`);
  }
  console.log('');
}

// ============================================
// Main
// ============================================

async function main() {
  const options = parseArgs();
  const { results, stats, finalEconomy } = runSimulation(options);

  generateReport(stats, finalEconomy);

  // Save results
  const logDir = path.join(__dirname, '..', 'logs');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  const outputPath = path.join(logDir, 'arena-run-sim.json');
  fs.writeFileSync(
    outputPath,
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        seed: options.seed,
        runs: options.runs,
        strategy: options.strategy,
        stats,
        sampleResults: results.slice(0, 10),
        economySnapshot: getEconomySnapshot(finalEconomy),
      },
      null,
      2
    )
  );

  console.log('='.repeat(70));
  console.log(`Results saved to: logs/arena-run-sim.json`);
  console.log('='.repeat(70));
}

main().catch(console.error);
