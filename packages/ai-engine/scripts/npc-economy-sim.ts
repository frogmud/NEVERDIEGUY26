#!/usr/bin/env ts-node
/**
 * NPC Economy Simulation
 *
 * Watch NPCs trade and gamble with their ceelo winnings.
 * Observe emergent economy behavior and wealth distribution.
 *
 * Run with: npx tsx scripts/npc-economy-sim.ts
 *
 * Options:
 *   --rounds=N      Number of gambling rounds (default: 100)
 *   --npcs=N        Number of NPCs to simulate (default: 24)
 *   --seed=X        Random seed for reproducibility
 *   --verbose       Show individual match results
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { createSeededRng } from '../src/core/seeded-rng';
import {
  createNPCEconomyState,
  registerNPC,
  simulateNPCGamblingRound,
  getEconomySnapshot,
  getLeaderboard,
  type NPCEconomyState,
  type EconomySnapshot,
} from '../src/economy/npc-economy';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================
// NPC Definitions (from existing npcs)
// ============================================

interface NPCDef {
  slug: string;
  name: string;
  category: 'traveler' | 'wanderer' | 'pantheon' | 'cosmic_horror';
  startingGold: number;
  luckyNumber: number;
}

const NPC_POOL: NPCDef[] = [
  // Travelers (moderate starting gold)
  { slug: 'stitch-up-girl', name: 'Stitch-Up Girl', category: 'traveler', startingGold: 150, luckyNumber: 3 },
  { slug: 'the-general-traveler', name: 'The General', category: 'traveler', startingGold: 200, luckyNumber: 2 },
  { slug: 'body-count', name: 'Body Count', category: 'traveler', startingGold: 120, luckyNumber: 6 },
  { slug: 'boots', name: 'Boots', category: 'traveler', startingGold: 100, luckyNumber: 7 },
  { slug: 'clausen', name: 'Clausen', category: 'traveler', startingGold: 180, luckyNumber: 4 },
  { slug: 'keith-man', name: 'Keith Man', category: 'traveler', startingGold: 90, luckyNumber: 5 },
  { slug: 'mr-kevin', name: 'Mr. Kevin', category: 'traveler', startingGold: 250, luckyNumber: 1 },

  // Wanderers (shopkeepers, more gold)
  { slug: 'willy', name: 'Willy One Eye', category: 'wanderer', startingGold: 300, luckyNumber: 5 },
  { slug: 'mr-bones', name: 'Mr. Bones', category: 'wanderer', startingGold: 200, luckyNumber: 5 },
  { slug: 'boo-g', name: 'Boo-G', category: 'wanderer', startingGold: 250, luckyNumber: 6 },
  { slug: 'king-james', name: 'King James', category: 'wanderer', startingGold: 400, luckyNumber: 1 },
  { slug: 'dr-maxwell', name: 'Dr. Maxwell', category: 'wanderer', startingGold: 350, luckyNumber: 4 },
  { slug: 'the-general-wanderer', name: 'The General', category: 'wanderer', startingGold: 280, luckyNumber: 2 },
  { slug: 'dr-voss', name: 'Dr. Voss', category: 'wanderer', startingGold: 320, luckyNumber: 3 },
  { slug: 'xtreme', name: 'Xtreme', category: 'wanderer', startingGold: 150, luckyNumber: 2 },

  // Pantheon (wealthy, prideful)
  { slug: 'the-one', name: 'The One', category: 'pantheon', startingGold: 500, luckyNumber: 1 },
  { slug: 'john', name: 'John', category: 'pantheon', startingGold: 450, luckyNumber: 2 },
  { slug: 'peter', name: 'Peter', category: 'pantheon', startingGold: 420, luckyNumber: 3 },
  { slug: 'robert', name: 'Robert', category: 'pantheon', startingGold: 480, luckyNumber: 4 },
  { slug: 'alice', name: 'Alice', category: 'pantheon', startingGold: 400, luckyNumber: 5 },
  { slug: 'jane', name: 'Jane', category: 'pantheon', startingGold: 380, luckyNumber: 6 },

  // Cosmic Horrors (unpredictable, low starting gold but don't care)
  { slug: 'rhea', name: 'Rhea', category: 'cosmic_horror', startingGold: 50, luckyNumber: 0 },
  { slug: 'zero-chance', name: 'Zero Chance', category: 'cosmic_horror', startingGold: 30, luckyNumber: 0 },
  { slug: 'alien-baby', name: 'Alien Baby', category: 'cosmic_horror', startingGold: 75, luckyNumber: 0 },
];

// ============================================
// CLI Options
// ============================================

interface SimOptions {
  rounds: number;
  npcCount: number;
  seed: string;
  verbose: boolean;
}

function parseArgs(): SimOptions {
  const args = process.argv.slice(2);
  const options: SimOptions = {
    rounds: 100,
    npcCount: 24,
    seed: `economy-${Date.now()}`,
    verbose: false,
  };

  for (const arg of args) {
    if (arg.startsWith('--rounds=')) {
      options.rounds = parseInt(arg.split('=')[1], 10);
    } else if (arg.startsWith('--npcs=')) {
      options.npcCount = parseInt(arg.split('=')[1], 10);
    } else if (arg.startsWith('--seed=')) {
      options.seed = arg.split('=')[1];
    } else if (arg === '--verbose') {
      options.verbose = true;
    }
  }

  return options;
}

// ============================================
// Simulation
// ============================================

function initializeEconomy(npcCount: number): NPCEconomyState {
  let state = createNPCEconomyState();

  const npcsToUse = NPC_POOL.slice(0, npcCount);
  for (const npc of npcsToUse) {
    state = registerNPC(
      state,
      npc.slug,
      npc.name,
      npc.category,
      npc.startingGold
    );
  }

  return state;
}

function runSimulation(
  options: SimOptions
): {
  finalState: NPCEconomyState;
  snapshots: EconomySnapshot[];
} {
  const rng = createSeededRng(options.seed);
  let state = initializeEconomy(options.npcCount);
  const snapshots: EconomySnapshot[] = [];

  // Initial snapshot
  snapshots.push(getEconomySnapshot(state));

  console.log('='.repeat(70));
  console.log('NPC ECONOMY SIMULATION');
  console.log('='.repeat(70));
  console.log(`NPCs: ${options.npcCount}`);
  console.log(`Rounds: ${options.rounds}`);
  console.log(`Seed: ${options.seed}`);
  console.log('='.repeat(70));
  console.log('');

  // Initial state
  const initial = snapshots[0];
  console.log('INITIAL STATE');
  console.log(`Total Wealth: ${initial.totalWealth} gold`);
  console.log(`Average Wealth: ${initial.avgWealth.toFixed(0)} gold`);
  console.log(`Gini Coefficient: ${initial.giniCoefficient.toFixed(3)}`);
  console.log('');

  // Run rounds
  for (let round = 1; round <= options.rounds; round++) {
    const prevState = state;
    state = simulateNPCGamblingRound(state, rng);

    // Progress update every 10 rounds
    if (round % 10 === 0 || round === options.rounds) {
      const snapshot = getEconomySnapshot(state);
      snapshots.push(snapshot);

      const matchesThisRound = state.matchHistory.length - prevState.matchHistory.length;
      process.stdout.write(`Round ${round}/${options.rounds}: `);
      process.stdout.write(`${matchesThisRound} matches, `);
      process.stdout.write(`Gini: ${snapshot.giniCoefficient.toFixed(3)}, `);
      process.stdout.write(`Richest: ${snapshot.topEarners[0]?.gold ?? 0}\n`);
    }

    if (options.verbose && state.matchHistory.length > prevState.matchHistory.length) {
      const latestMatch = state.matchHistory[state.matchHistory.length - 1];
      if (latestMatch.winnerSlug) {
        console.log(
          `  ${latestMatch.player1Slug} vs ${latestMatch.player2Slug}: ` +
          `${latestMatch.winnerSlug} wins ${latestMatch.stake} gold`
        );
      }
    }
  }

  return { finalState: state, snapshots };
}

// ============================================
// Report Generation
// ============================================

function generateReport(
  state: NPCEconomyState,
  snapshots: EconomySnapshot[]
): void {
  console.log('');
  console.log('='.repeat(70));
  console.log('FINAL RESULTS');
  console.log('='.repeat(70));
  console.log('');

  const final = snapshots[snapshots.length - 1];
  const initial = snapshots[0];

  console.log('ECONOMY OVERVIEW');
  console.log('-'.repeat(40));
  console.log(`Total Matches Played: ${state.matchHistory.length}`);
  console.log(`Total Gold Circulated: ${state.totalGoldCirculated}`);
  console.log(`Final Total Wealth: ${final.totalWealth} (unchanged)`);
  console.log(`Final Average Wealth: ${final.avgWealth.toFixed(0)} gold`);
  console.log('');

  console.log('WEALTH INEQUALITY');
  console.log('-'.repeat(40));
  console.log(`Initial Gini: ${initial.giniCoefficient.toFixed(3)}`);
  console.log(`Final Gini: ${final.giniCoefficient.toFixed(3)}`);
  const giniChange = final.giniCoefficient - initial.giniCoefficient;
  console.log(`Change: ${giniChange >= 0 ? '+' : ''}${giniChange.toFixed(3)}`);
  console.log('');

  console.log('WEALTH DISTRIBUTION');
  console.log('-'.repeat(40));
  for (const [tier, count] of Object.entries(final.wealthDistribution)) {
    const pct = ((count / state.npcWealth.size) * 100).toFixed(0);
    console.log(`  ${tier.padEnd(12)}: ${count} NPCs (${pct}%)`);
  }
  console.log('');

  console.log('LEADERBOARD (Top 10)');
  console.log('-'.repeat(40));
  const leaderboard = getLeaderboard(state);
  for (let i = 0; i < Math.min(10, leaderboard.length); i++) {
    const entry = leaderboard[i];
    const record = state.npcWealth.get(entry.slug)!;
    const profit = record.totalWon - record.totalLost;
    const profitStr = profit >= 0 ? `+${profit}` : `${profit}`;
    console.log(
      `  ${entry.rank}. ${entry.name.padEnd(20)} ${entry.gold.toString().padStart(5)} gold ` +
      `(${profitStr} net, ${record.matchesPlayed} matches)`
    );
  }
  console.log('');

  console.log('BOTTOM 5');
  console.log('-'.repeat(40));
  for (let i = leaderboard.length - 5; i < leaderboard.length; i++) {
    if (i < 0) continue;
    const entry = leaderboard[i];
    const record = state.npcWealth.get(entry.slug)!;
    const profit = record.totalWon - record.totalLost;
    const profitStr = profit >= 0 ? `+${profit}` : `${profit}`;
    console.log(
      `  ${entry.rank}. ${entry.name.padEnd(20)} ${entry.gold.toString().padStart(5)} gold ` +
      `(${profitStr} net)`
    );
  }
  console.log('');

  console.log('BIGGEST WINNERS');
  console.log('-'.repeat(40));
  const byProfit = Array.from(state.npcWealth.values())
    .map(r => ({ ...r, profit: r.totalWon - r.totalLost }))
    .sort((a, b) => b.profit - a.profit);

  for (let i = 0; i < 5; i++) {
    const r = byProfit[i];
    console.log(`  ${r.npcName}: +${r.profit} gold (${r.matchesPlayed} matches)`);
  }
  console.log('');

  console.log('BIGGEST LOSERS');
  console.log('-'.repeat(40));
  for (let i = byProfit.length - 5; i < byProfit.length; i++) {
    if (i < 0) continue;
    const r = byProfit[i];
    console.log(`  ${r.npcName}: ${r.profit} gold (${r.matchesPlayed} matches)`);
  }
  console.log('');

  console.log('STREAK RECORDS');
  console.log('-'.repeat(40));
  const byStreak = Array.from(state.npcWealth.values())
    .filter(r => r.currentStreak !== 0)
    .sort((a, b) => Math.abs(b.currentStreak) - Math.abs(a.currentStreak));

  for (let i = 0; i < Math.min(5, byStreak.length); i++) {
    const r = byStreak[i];
    const streakType = r.currentStreak > 0 ? 'winning' : 'losing';
    console.log(`  ${r.npcName}: ${Math.abs(r.currentStreak)} ${streakType} streak`);
  }
  console.log('');
}

// ============================================
// Main
// ============================================

async function main() {
  const options = parseArgs();
  const { finalState, snapshots } = runSimulation(options);

  generateReport(finalState, snapshots);

  // Save results
  const logDir = path.join(__dirname, '..', 'logs');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  const outputPath = path.join(logDir, 'npc-economy-sim.json');
  fs.writeFileSync(
    outputPath,
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        seed: options.seed,
        rounds: options.rounds,
        npcCount: options.npcCount,
        finalSnapshot: snapshots[snapshots.length - 1],
        snapshotHistory: snapshots,
        leaderboard: getLeaderboard(finalState),
        matchCount: finalState.matchHistory.length,
        totalCirculated: finalState.totalGoldCirculated,
      },
      null,
      2
    )
  );

  console.log('='.repeat(70));
  console.log(`Results saved to: logs/npc-economy-sim.json`);
  console.log('='.repeat(70));
}

main().catch(console.error);
