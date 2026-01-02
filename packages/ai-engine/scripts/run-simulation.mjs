#!/usr/bin/env node
/**
 * Cee-lo Simulation Runner (ESM)
 *
 * Run with: npm run build && node scripts/run-simulation.mjs
 */

import { GamblingSimulation } from '../dist/gambling/gambling-simulation.js';
import { CeeloStatisticsManager } from '../dist/games/ceelo/statistics.js';
import * as fs from 'fs';

const BATCH_SIZE = 100;
const BATCHES_TO_RUN = 50;
const DELAY_BETWEEN_BATCHES = 100;

async function runSimulations() {
  console.log('='.repeat(60));
  console.log('CEE-LO SIMULATION RUNNER');
  console.log('='.repeat(60));
  console.log(`Running ${BATCHES_TO_RUN} batches of ${BATCH_SIZE} matches each`);
  console.log(`Total matches: ${BATCHES_TO_RUN * BATCH_SIZE}`);
  console.log('='.repeat(60));
  console.log('');

  // Track aggregated stats across all batches
  const aggregatedStats = new Map();
  let totalGamesPlayed = 0;
  const startTime = Date.now();

  for (let batch = 1; batch <= BATCHES_TO_RUN; batch++) {
    const batchSeed = `batch-${batch}-${Date.now()}`;

    const sim = new GamblingSimulation({
      gamesToSimulate: BATCH_SIZE,
      seed: batchSeed,
      enableChat: false,
      logFilePath: '', // Disable file logging for speed
    });

    const result = await sim.run();
    totalGamesPlayed += result.gamesPlayed;

    // Merge stats from this batch
    for (const entry of result.leaderboard) {
      const existing = aggregatedStats.get(entry.playerId);
      if (existing) {
        existing.wins += entry.wins;
        existing.losses += entry.losses;
        existing.totalGames += entry.totalGames;
        existing.goldWon += entry.goldWon;
        existing.goldLost += entry.goldLost;
        existing.longestWinStreak = Math.max(existing.longestWinStreak, entry.longestWinStreak);
        existing.longestLoseStreak = Math.max(existing.longestLoseStreak, entry.longestLoseStreak);
      } else {
        aggregatedStats.set(entry.playerId, {
          playerId: entry.playerId,
          playerName: entry.playerName,
          category: entry.category,
          wins: entry.wins,
          losses: entry.losses,
          totalGames: entry.totalGames,
          goldWon: entry.goldWon,
          goldLost: entry.goldLost,
          longestWinStreak: entry.longestWinStreak,
          longestLoseStreak: entry.longestLoseStreak,
        });
      }
    }

    // Progress update
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    const pct = ((batch / BATCHES_TO_RUN) * 100).toFixed(0);
    process.stdout.write(`\rBatch ${batch}/${BATCHES_TO_RUN} (${pct}%) - ${totalGamesPlayed} games - ${elapsed}s`);

    // Small delay between batches
    if (batch < BATCHES_TO_RUN) {
      await new Promise(r => setTimeout(r, DELAY_BETWEEN_BATCHES));
    }
  }

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log('\n');

  // Convert to array and calculate win rates
  const leaderboard = Array.from(aggregatedStats.values())
    .map(e => ({
      ...e,
      winRate: e.totalGames > 0 ? e.wins / e.totalGames : 0,
      netGold: e.goldWon - e.goldLost,
    }))
    .sort((a, b) => b.winRate - a.winRate);

  // Print final leaderboard
  console.log('='.repeat(80));
  console.log('FINAL LEADERBOARD - BY WIN RATE');
  console.log('='.repeat(80));
  console.log('');
  console.log('Rank | Name                     | Category      | Games | Wins  | Losses | Win%   | Net Gold');
  console.log('-'.repeat(95));

  leaderboard.forEach((entry, idx) => {
    const rank = String(idx + 1).padStart(4);
    const name = entry.playerName.slice(0, 24).padEnd(24);
    const cat = entry.category.slice(0, 13).padEnd(13);
    const games = String(entry.totalGames).padStart(5);
    const wins = String(entry.wins).padStart(5);
    const losses = String(entry.losses).padStart(6);
    const winRate = (entry.winRate * 100).toFixed(1).padStart(5) + '%';
    const netGoldStr = (entry.netGold >= 0 ? '+' : '') + entry.netGold;

    console.log(`${rank} | ${name} | ${cat} | ${games} | ${wins} | ${losses} | ${winRate} | ${netGoldStr}`);
  });

  console.log('');
  console.log('='.repeat(80));
  console.log('BY CATEGORY SUMMARY');
  console.log('='.repeat(80));

  const categories = ['traveler', 'wanderer', 'pantheon', 'cosmic_horror'];
  for (const cat of categories) {
    const catEntries = leaderboard.filter(e => e.category === cat);
    if (catEntries.length === 0) continue;

    const totalWins = catEntries.reduce((s, e) => s + e.wins, 0);
    const totalLosses = catEntries.reduce((s, e) => s + e.losses, 0);
    const totalGold = catEntries.reduce((s, e) => s + e.netGold, 0);
    const avgWinRate = totalWins / (totalWins + totalLosses);
    const topPlayer = catEntries[0];

    console.log(`\n${cat.toUpperCase()} (${catEntries.length} NPCs)`);
    console.log(`  Avg Win Rate: ${(avgWinRate * 100).toFixed(1)}%`);
    console.log(`  Total Net Gold: ${totalGold >= 0 ? '+' : ''}${totalGold}`);
    console.log(`  Top Performer: ${topPlayer.playerName} (${(topPlayer.winRate * 100).toFixed(1)}%)`);
  }

  console.log('');
  console.log('='.repeat(80));
  console.log(`SIMULATION COMPLETE: ${totalGamesPlayed} games in ${totalTime}s`);
  console.log('='.repeat(80));

  // Save JSON results
  const jsonOutput = {
    timestamp: new Date().toISOString(),
    totalGames: totalGamesPlayed,
    durationSeconds: parseFloat(totalTime),
    batchSize: BATCH_SIZE,
    batchCount: BATCHES_TO_RUN,
    leaderboard: leaderboard.map(e => ({
      slug: e.playerId,
      name: e.playerName,
      category: e.category,
      games: e.totalGames,
      wins: e.wins,
      losses: e.losses,
      winRate: parseFloat((e.winRate * 100).toFixed(2)),
      goldWon: e.goldWon,
      goldLost: e.goldLost,
      netGold: e.netGold,
      longestWinStreak: e.longestWinStreak,
      longestLoseStreak: e.longestLoseStreak,
    })),
    categoryStats: categories.map(cat => {
      const catEntries = leaderboard.filter(e => e.category === cat);
      const totalWins = catEntries.reduce((s, e) => s + e.wins, 0);
      const totalLosses = catEntries.reduce((s, e) => s + e.losses, 0);
      return {
        category: cat,
        npcCount: catEntries.length,
        avgWinRate: parseFloat(((totalWins / (totalWins + totalLosses)) * 100).toFixed(2)),
        totalNetGold: catEntries.reduce((s, e) => s + e.netGold, 0),
      };
    }),
  };

  // Create logs dir if needed
  if (!fs.existsSync('./logs')) {
    fs.mkdirSync('./logs', { recursive: true });
  }

  const outputPath = './logs/simulation-results.json';
  fs.writeFileSync(outputPath, JSON.stringify(jsonOutput, null, 2));
  console.log(`\nResults saved to: ${outputPath}`);
}

runSimulations().catch(err => {
  console.error('Simulation error:', err);
  process.exit(1);
});
