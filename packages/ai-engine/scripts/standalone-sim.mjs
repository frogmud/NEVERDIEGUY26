#!/usr/bin/env node
/**
 * Standalone Cee-lo Simulation
 *
 * Self-contained script that doesn't require building the full project.
 * Run with: node scripts/standalone-sim.mjs
 *
 * For continuous mode: node scripts/standalone-sim.mjs --continuous
 */

import * as fs from 'fs';

const CONTINUOUS_MODE = process.argv.includes('--continuous');
const RUN_FOREVER = process.argv.includes('--forever');

// ============================================
// Seeded RNG (Mulberry32)
// ============================================

function mulberry32(seed) {
  return function() {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

// ============================================
// NPC Data (24 NPCs)
// ============================================

const NPCS = [
  // Travelers (7)
  { slug: 'stitch-up-girl', name: 'Stitch Up Girl', category: 'traveler', luckyNumber: 3 },
  { slug: 'the-general-traveler', name: 'The General', category: 'traveler', luckyNumber: 2 },
  { slug: 'body-count', name: 'Body Count', category: 'traveler', luckyNumber: 6 },
  { slug: 'boots', name: 'Boots', category: 'traveler', luckyNumber: 7 },
  { slug: 'clausen', name: 'Detective Clausen', category: 'traveler', luckyNumber: 4 },
  { slug: 'keith-man', name: 'Keith Man', category: 'traveler', luckyNumber: 5 },
  { slug: 'mr-kevin', name: 'Mr. Kevin', category: 'traveler', luckyNumber: 1 },
  // Wanderers (8)
  { slug: 'willy', name: 'Willy One Eye', category: 'wanderer', luckyNumber: 5 },
  { slug: 'mr-bones', name: 'Mr. Bones', category: 'wanderer', luckyNumber: 5 },
  { slug: 'boo-g', name: 'Boo G', category: 'wanderer', luckyNumber: 6 },
  { slug: 'king-james', name: 'King James', category: 'wanderer', luckyNumber: 1 },
  { slug: 'dr-maxwell', name: 'Dr. Maxwell', category: 'wanderer', luckyNumber: 4 },
  { slug: 'the-general-wanderer', name: 'The General', category: 'wanderer', luckyNumber: 2 },
  { slug: 'dr-voss', name: 'Dr. Voss', category: 'wanderer', luckyNumber: 3 },
  { slug: 'xtreme', name: 'X-treme', category: 'wanderer', luckyNumber: 2 },
  // Pantheon Die-rectors (6)
  { slug: 'the-one', name: 'The One', category: 'pantheon', luckyNumber: 1 },
  { slug: 'john', name: 'John', category: 'pantheon', luckyNumber: 2 },
  { slug: 'peter', name: 'Peter', category: 'pantheon', luckyNumber: 3 },
  { slug: 'robert', name: 'Robert', category: 'pantheon', luckyNumber: 4 },
  { slug: 'alice', name: 'Alice', category: 'pantheon', luckyNumber: 5 },
  { slug: 'jane', name: 'Jane', category: 'pantheon', luckyNumber: 6 },
  // Cosmic Horrors (3)
  { slug: 'rhea', name: 'Rhea', category: 'cosmic_horror', luckyNumber: 0 },
  { slug: 'zero-chance', name: 'Zero Chance', category: 'cosmic_horror', luckyNumber: 0 },
  { slug: 'alien-baby', name: 'Alien Baby', category: 'cosmic_horror', luckyNumber: 0 },
];

// ============================================
// Cee-lo Dice Logic
// ============================================

function rollDice(rng) {
  return [
    Math.floor(rng() * 6) + 1,
    Math.floor(rng() * 6) + 1,
    Math.floor(rng() * 6) + 1,
  ];
}

function evaluateRoll(dice) {
  const sorted = [...dice].sort((a, b) => a - b);
  const [a, b, c] = sorted;

  // 4-5-6: Instant win
  if (a === 4 && b === 5 && c === 6) {
    return { type: 'instant_win', rank: 100 };
  }

  // 1-2-3: Instant loss
  if (a === 1 && b === 2 && c === 3) {
    return { type: 'instant_loss', rank: 0 };
  }

  // Trips
  if (a === b && b === c) {
    return { type: 'trips', value: a, rank: 50 + a };
  }

  // Point (two matching, third is point)
  if (a === b) {
    return { type: 'point', value: c, rank: 10 + c };
  }
  if (b === c) {
    return { type: 'point', value: a, rank: 10 + a };
  }
  if (a === c) {
    return { type: 'point', value: b, rank: 10 + b };
  }

  // No valid combination
  return { type: 'nothing', rank: -1 };
}

function rollUntilValid(rng, maxAttempts = 10) {
  for (let i = 0; i < maxAttempts; i++) {
    const dice = rollDice(rng);
    const result = evaluateRoll(dice);
    if (result.type !== 'nothing') {
      return { dice, result };
    }
  }
  // Force a result
  return { dice: [1, 1, 1], result: { type: 'trips', value: 1, rank: 51 } };
}

function compareOutcomes(a, b) {
  if (a.rank > b.rank) return 1;
  if (a.rank < b.rank) return -1;
  return 0;
}

// ============================================
// Match Simulation
// ============================================

function runMatch(player1, player2, rng) {
  const roll1 = rollUntilValid(rng);
  const roll2 = rollUntilValid(rng);

  const comparison = compareOutcomes(roll1.result, roll2.result);

  if (comparison > 0) {
    return { winner: player1, loser: player2, winnerRoll: roll1, loserRoll: roll2 };
  } else if (comparison < 0) {
    return { winner: player2, loser: player1, winnerRoll: roll2, loserRoll: roll1 };
  } else {
    // Tie - re-roll
    return runMatch(player1, player2, rng);
  }
}

// ============================================
// Statistics Tracking
// ============================================

class StatsManager {
  constructor() {
    this.stats = new Map();
  }

  ensurePlayer(player) {
    if (!this.stats.has(player.slug)) {
      this.stats.set(player.slug, {
        slug: player.slug,
        name: player.name,
        category: player.category,
        luckyNumber: player.luckyNumber,
        wins: 0,
        losses: 0,
        goldWon: 0,
        goldLost: 0,
        currentStreak: 0,
        longestWinStreak: 0,
        longestLoseStreak: 0,
        instantWins: 0,
        instantLosses: 0,
        trips: 0,
      });
    }
  }

  recordResult(winner, loser, winnerRoll, loserRoll, betAmount) {
    this.ensurePlayer(winner);
    this.ensurePlayer(loser);

    const winnerStats = this.stats.get(winner.slug);
    const loserStats = this.stats.get(loser.slug);

    // Update wins/losses
    winnerStats.wins++;
    loserStats.losses++;

    // Update gold
    winnerStats.goldWon += betAmount;
    loserStats.goldLost += betAmount;

    // Update streaks
    if (winnerStats.currentStreak >= 0) {
      winnerStats.currentStreak++;
    } else {
      winnerStats.currentStreak = 1;
    }
    winnerStats.longestWinStreak = Math.max(winnerStats.longestWinStreak, winnerStats.currentStreak);

    if (loserStats.currentStreak <= 0) {
      loserStats.currentStreak--;
    } else {
      loserStats.currentStreak = -1;
    }
    loserStats.longestLoseStreak = Math.max(loserStats.longestLoseStreak, Math.abs(loserStats.currentStreak));

    // Track special outcomes
    if (winnerRoll.result.type === 'instant_win') winnerStats.instantWins++;
    if (winnerRoll.result.type === 'trips') winnerStats.trips++;
    if (loserRoll.result.type === 'instant_loss') loserStats.instantLosses++;
  }

  getLeaderboard() {
    const entries = Array.from(this.stats.values());
    return entries
      .map(s => ({
        ...s,
        totalGames: s.wins + s.losses,
        winRate: s.wins + s.losses > 0 ? s.wins / (s.wins + s.losses) : 0,
        netGold: s.goldWon - s.goldLost,
      }))
      .sort((a, b) => b.winRate - a.winRate);
  }
}

// ============================================
// Persistent Stats (loads/saves cumulative data)
// ============================================

const CUMULATIVE_FILE = './logs/cumulative-stats.json';

function loadCumulativeStats(statsManager) {
  if (!fs.existsSync(CUMULATIVE_FILE)) return 0;

  try {
    const data = JSON.parse(fs.readFileSync(CUMULATIVE_FILE, 'utf8'));
    for (const entry of data.leaderboard) {
      const npc = NPCS.find(n => n.slug === entry.slug);
      if (!npc) continue;

      statsManager.ensurePlayer(npc);
      const s = statsManager.stats.get(entry.slug);
      s.wins = entry.wins;
      s.losses = entry.losses;
      s.goldWon = entry.goldWon;
      s.goldLost = entry.goldLost;
      s.longestWinStreak = entry.longestWinStreak;
      s.longestLoseStreak = entry.longestLoseStreak;
      s.instantWins = entry.instantWins || 0;
      s.instantLosses = entry.instantLosses || 0;
      s.trips = entry.trips || 0;
    }
    return data.totalMatches || 0;
  } catch (e) {
    console.log('Could not load previous stats, starting fresh');
    return 0;
  }
}

function saveCumulativeStats(statsManager, totalMatches, runNumber) {
  const leaderboard = statsManager.getLeaderboard();

  const output = {
    timestamp: new Date().toISOString(),
    runNumber,
    totalMatches,
    leaderboard: leaderboard.map(e => ({
      slug: e.slug,
      name: e.name,
      category: e.category,
      luckyNumber: e.luckyNumber,
      games: e.totalGames,
      wins: e.wins,
      losses: e.losses,
      winRate: parseFloat((e.winRate * 100).toFixed(2)),
      goldWon: e.goldWon,
      goldLost: e.goldLost,
      netGold: e.netGold,
      longestWinStreak: e.longestWinStreak,
      longestLoseStreak: e.longestLoseStreak,
      instantWins: e.instantWins,
      instantLosses: e.instantLosses,
      trips: e.trips,
    })),
  };

  if (!fs.existsSync('./logs')) {
    fs.mkdirSync('./logs', { recursive: true });
  }

  // Save cumulative (overwrites)
  fs.writeFileSync(CUMULATIVE_FILE, JSON.stringify(output, null, 2));

  // Also save timestamped snapshot
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  fs.writeFileSync(`./logs/sim-${timestamp}.json`, JSON.stringify(output, null, 2));

  return output;
}

function printLeaderboard(leaderboard, totalMatches, runTime) {
  console.log('');
  console.log('='.repeat(100));
  console.log(`LEADERBOARD - ${totalMatches.toLocaleString()} TOTAL MATCHES`);
  console.log('='.repeat(100));
  console.log('');
  console.log('Rank | Name                     | Category      | Lucky# | Games  | Wins   | Win%   | Net Gold  | W-Streak');
  console.log('-'.repeat(105));

  leaderboard.forEach((entry, idx) => {
    const rank = String(idx + 1).padStart(4);
    const name = entry.name.slice(0, 24).padEnd(24);
    const cat = entry.category.slice(0, 13).padEnd(13);
    const lucky = String(entry.luckyNumber).padStart(6);
    const games = String(entry.totalGames).padStart(6);
    const wins = String(entry.wins).padStart(6);
    const winRate = (entry.winRate * 100).toFixed(2).padStart(6) + '%';
    const netGold = (entry.netGold >= 0 ? '+' : '') + String(entry.netGold).padStart(8);
    const streak = String(entry.longestWinStreak).padStart(8);

    console.log(`${rank} | ${name} | ${cat} | ${lucky} | ${games} | ${wins} | ${winRate} | ${netGold} | ${streak}`);
  });

  // Category summary
  console.log('');
  console.log('='.repeat(100));
  console.log('CATEGORY SUMMARY');
  console.log('='.repeat(100));

  const categories = ['traveler', 'wanderer', 'pantheon', 'cosmic_horror'];
  for (const cat of categories) {
    const catEntries = leaderboard.filter(e => e.category === cat);
    if (catEntries.length === 0) continue;

    const totalWins = catEntries.reduce((s, e) => s + e.wins, 0);
    const totalLosses = catEntries.reduce((s, e) => s + e.losses, 0);
    const totalGold = catEntries.reduce((s, e) => s + e.netGold, 0);
    const avgWinRate = totalWins / (totalWins + totalLosses);
    const topPlayer = catEntries[0];
    const bottomPlayer = catEntries[catEntries.length - 1];

    console.log(`\n${cat.toUpperCase()} (${catEntries.length} NPCs)`);
    console.log(`  Avg Win Rate: ${(avgWinRate * 100).toFixed(2)}%`);
    console.log(`  Total Net Gold: ${totalGold >= 0 ? '+' : ''}${totalGold}`);
    console.log(`  Best: ${topPlayer.name} (${(topPlayer.winRate * 100).toFixed(2)}%)`);
    console.log(`  Worst: ${bottomPlayer.name} (${(bottomPlayer.winRate * 100).toFixed(2)}%)`);
  }

  // Lucky number analysis
  console.log('');
  console.log('='.repeat(100));
  console.log('LUCKY NUMBER ANALYSIS');
  console.log('='.repeat(100));

  for (let lucky = 0; lucky <= 7; lucky++) {
    const luckyEntries = leaderboard.filter(e => e.luckyNumber === lucky);
    if (luckyEntries.length === 0) continue;

    const totalWins = luckyEntries.reduce((s, e) => s + e.wins, 0);
    const totalLosses = luckyEntries.reduce((s, e) => s + e.losses, 0);
    const avgWinRate = totalWins / (totalWins + totalLosses);

    console.log(`Lucky #${lucky}: ${(avgWinRate * 100).toFixed(2)}% avg win rate (${luckyEntries.length} NPCs)`);
  }

  console.log('');
  console.log('='.repeat(100));
  console.log(`Run completed in ${runTime}s | Total: ${totalMatches.toLocaleString()} matches`);
  console.log('='.repeat(100));
}

// ============================================
// Main Simulation
// ============================================

const BATCH_SIZE = 100;
const BATCHES = 50;
const MATCHES_PER_RUN = BATCH_SIZE * BATCHES;

async function runSimulation(stats, previousMatches, runNumber) {
  const runStart = Date.now();

  console.log('');
  console.log('='.repeat(70));
  console.log(`CEE-LO SIMULATION - RUN #${runNumber}`);
  console.log('='.repeat(70));
  console.log(`Previous matches: ${previousMatches.toLocaleString()}`);
  console.log(`This run: ${MATCHES_PER_RUN.toLocaleString()} matches`);
  console.log('='.repeat(70));

  for (let batch = 1; batch <= BATCHES; batch++) {
    const batchSeed = `run${runNumber}-batch${batch}-${Date.now()}`;
    const rng = mulberry32(hashString(batchSeed));

    for (let match = 0; match < BATCH_SIZE; match++) {
      // Select two random players
      const shuffled = [...NPCS].sort(() => rng() - 0.5);
      const player1 = shuffled[0];
      const player2 = shuffled[1];

      // Calculate bet (base 10-50 gold)
      const betAmount = Math.floor(rng() * 40) + 10;

      // Run match
      const result = runMatch(player1, player2, rng);

      // Record stats
      stats.recordResult(result.winner, result.loser, result.winnerRoll, result.loserRoll, betAmount);
    }

    const elapsed = ((Date.now() - runStart) / 1000).toFixed(1);
    const pct = ((batch / BATCHES) * 100).toFixed(0);
    process.stdout.write(`\rBatch ${batch}/${BATCHES} (${pct}%) - ${elapsed}s`);
  }

  const runTime = ((Date.now() - runStart) / 1000).toFixed(1);
  const totalMatches = previousMatches + MATCHES_PER_RUN;

  // Save and print
  saveCumulativeStats(stats, totalMatches, runNumber);
  const leaderboard = stats.getLeaderboard();
  printLeaderboard(leaderboard, totalMatches, runTime);

  console.log(`\nSaved to: ${CUMULATIVE_FILE}`);

  return totalMatches;
}

// ============================================
// Main Entry Point
// ============================================

async function main() {
  if (!fs.existsSync('./logs')) {
    fs.mkdirSync('./logs', { recursive: true });
  }

  const stats = new StatsManager();
  let totalMatches = loadCumulativeStats(stats);
  let runNumber = Math.floor(totalMatches / MATCHES_PER_RUN) + 1;

  if (totalMatches > 0) {
    console.log(`Loaded ${totalMatches.toLocaleString()} previous matches from ${CUMULATIVE_FILE}`);
  }

  if (CONTINUOUS_MODE || RUN_FOREVER) {
    console.log('\n*** CONTINUOUS MODE - Press Ctrl+C to stop ***\n');

    while (true) {
      totalMatches = await runSimulation(stats, totalMatches, runNumber);
      runNumber++;

      if (!RUN_FOREVER) {
        // Pause between runs in continuous mode
        console.log('\nNext run in 5 seconds... (Ctrl+C to stop)');
        await new Promise(r => setTimeout(r, 5000));
      }
    }
  } else {
    // Single run
    await runSimulation(stats, totalMatches, runNumber);
  }
}

main().catch(console.error);
