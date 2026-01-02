#!/usr/bin/env ts-node
/**
 * Cee-lo Simulation Runner
 *
 * Run with: npx ts-node scripts/run-simulation.ts
 *
 * This will run continuous batches of Cee-lo matches and output
 * stats to help calibrate luck values.
 */

import { GamblingSimulation } from '../src/gambling/gambling-simulation';
import { CeeloStatisticsManager } from '../src/games/ceelo/statistics';

const BATCH_SIZE = 100;          // Matches per batch
const BATCHES_TO_RUN = 50;       // Total batches (50 * 100 = 5000 matches)
const DELAY_BETWEEN_BATCHES = 500; // ms

async function runSimulations() {
  console.log('='.repeat(60));
  console.log('CEE-LO SIMULATION RUNNER');
  console.log('='.repeat(60));
  console.log(`Running ${BATCHES_TO_RUN} batches of ${BATCH_SIZE} matches each`);
  console.log(`Total matches: ${BATCHES_TO_RUN * BATCH_SIZE}`);
  console.log('='.repeat(60));
  console.log('');

  const globalStats = new CeeloStatisticsManager();
  let totalGamesPlayed = 0;
  const startTime = Date.now();

  for (let batch = 1; batch <= BATCHES_TO_RUN; batch++) {
    const batchSeed = `batch-${batch}-${Date.now()}`;

    const sim = new GamblingSimulation({
      gamesToSimulate: BATCH_SIZE,
      seed: batchSeed,
      enableChat: false, // Disable chat for speed
      logFilePath: './logs/ceelo-simulation.log',
    });

    const result = await sim.run();
    totalGamesPlayed += result.gamesPlayed;

    // Merge stats
    const batchStats = sim.getStatsManager();
    for (const entry of batchStats.getLeaderboard('totalGames')) {
      const existing = globalStats['playerStats'].get(entry.playerId);
      if (existing) {
        existing.wins += entry.wins;
        existing.losses += entry.losses;
        existing.totalGames += entry.totalGames;
        existing.goldWon += entry.goldWon;
        existing.goldLost += entry.goldLost;
        existing.longestWinStreak = Math.max(existing.longestWinStreak, entry.longestWinStreak);
        existing.longestLoseStreak = Math.max(existing.longestLoseStreak, entry.longestLoseStreak);
      } else {
        globalStats.registerPlayer({
          id: entry.playerId,
          slug: entry.playerId,
          name: entry.playerName,
          category: entry.category,
          luckyNumber: 0,
        });
        const newStats = globalStats['playerStats'].get(entry.playerId)!;
        newStats.wins = entry.wins;
        newStats.losses = entry.losses;
        newStats.totalGames = entry.totalGames;
        newStats.goldWon = entry.goldWon;
        newStats.goldLost = entry.goldLost;
        newStats.longestWinStreak = entry.longestWinStreak;
        newStats.longestLoseStreak = entry.longestLoseStreak;
      }
    }

    // Progress update
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    const pct = ((batch / BATCHES_TO_RUN) * 100).toFixed(0);
    console.log(`Batch ${batch}/${BATCHES_TO_RUN} complete (${pct}%) - ${totalGamesPlayed} games - ${elapsed}s elapsed`);

    // Delay between batches
    if (batch < BATCHES_TO_RUN) {
      await new Promise(r => setTimeout(r, DELAY_BETWEEN_BATCHES));
    }
  }

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);

  // Print final leaderboard
  console.log('');
  console.log('='.repeat(60));
  console.log('FINAL LEADERBOARD - BY WIN RATE');
  console.log('='.repeat(60));
  console.log('');

  const leaderboard = globalStats.getLeaderboard('winRate');
  console.log('Rank | Name                     | Games | Wins  | Losses | Win%   | Net Gold');
  console.log('-'.repeat(80));

  leaderboard.forEach((entry, idx) => {
    const rank = String(idx + 1).padStart(4);
    const name = entry.playerName.padEnd(24);
    const games = String(entry.totalGames).padStart(5);
    const wins = String(entry.wins).padStart(5);
    const losses = String(entry.losses).padStart(6);
    const winRate = (entry.winRate * 100).toFixed(1).padStart(5) + '%';
    const netGold = (entry.goldWon - entry.goldLost);
    const netGoldStr = (netGold >= 0 ? '+' : '') + netGold;

    console.log(`${rank} | ${name} | ${games} | ${wins} | ${losses} | ${winRate} | ${netGoldStr}`);
  });

  console.log('');
  console.log('='.repeat(60));
  console.log('BY CATEGORY');
  console.log('='.repeat(60));

  const categories = ['traveler', 'wanderer', 'pantheon', 'cosmic_horror'] as const;
  for (const cat of categories) {
    const catEntries = leaderboard.filter(e => e.category === cat);
    if (catEntries.length === 0) continue;

    const totalWins = catEntries.reduce((s, e) => s + e.wins, 0);
    const totalLosses = catEntries.reduce((s, e) => s + e.losses, 0);
    const totalGold = catEntries.reduce((s, e) => s + (e.goldWon - e.goldLost), 0);
    const avgWinRate = totalWins / (totalWins + totalLosses);

    console.log(`${cat.toUpperCase().padEnd(15)} | Avg Win Rate: ${(avgWinRate * 100).toFixed(1)}% | Net Gold: ${totalGold >= 0 ? '+' : ''}${totalGold}`);
  }

  console.log('');
  console.log('='.repeat(60));
  console.log(`SIMULATION COMPLETE: ${totalGamesPlayed} games in ${totalTime}s`);
  console.log('='.repeat(60));

  // Export raw data as JSON
  const jsonOutput = {
    timestamp: new Date().toISOString(),
    totalGames: totalGamesPlayed,
    durationSeconds: parseFloat(totalTime),
    leaderboard: leaderboard.map(e => ({
      slug: e.playerId,
      name: e.playerName,
      category: e.category,
      games: e.totalGames,
      wins: e.wins,
      losses: e.losses,
      winRate: e.winRate,
      goldWon: e.goldWon,
      goldLost: e.goldLost,
      netGold: e.goldWon - e.goldLost,
      longestWinStreak: e.longestWinStreak,
      longestLoseStreak: e.longestLoseStreak,
    })),
  };

  const fs = await import('fs');
  const outputPath = './logs/simulation-results.json';
  fs.writeFileSync(outputPath, JSON.stringify(jsonOutput, null, 2));
  console.log(`\nResults saved to: ${outputPath}`);
}

runSimulations().catch(console.error);
