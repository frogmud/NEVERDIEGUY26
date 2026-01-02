#!/usr/bin/env ts-node
/**
 * Roguelike Run Outcome Simulator
 *
 * Monte Carlo simulation of full roguelike runs (3 ante x 3 levels x 3 rooms).
 * Run with: npx ts-node scripts/run-roguelike-sim.ts
 *
 * Answers:
 * - What % of runs reach each ante?
 * - Where do players die most often?
 * - Which item combos correlate with success?
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

const RUNS_TO_SIMULATE = 10000;
const SEED = `roguelike-${Date.now()}`;
const OUTPUT_PATH = './logs/run-outcomes.json';
const CUMULATIVE_PATH = './logs/cumulative-run-outcomes.json';

// ============================================
// Game Structure
// ============================================

interface RunConfig {
  anteLevels: number;        // 3 antes
  roomsPerLevel: number;     // 3 rooms per level
  startingHealth: number;
  startingGold: number;
  itemSlots: number;
}

const DEFAULT_CONFIG: RunConfig = {
  anteLevels: 3,
  roomsPerLevel: 3,
  startingHealth: 100,
  startingGold: 50,
  itemSlots: 5,
};

// ============================================
// Room Types
// ============================================

type RoomType = 'combat' | 'shop' | 'event' | 'boss' | 'rest';

interface Room {
  type: RoomType;
  difficulty: number;      // 1-10
  goldReward: number;
  damageRange: [number, number];
}

const ROOM_POOLS: Record<number, RoomType[]> = {
  1: ['combat', 'combat', 'shop', 'event', 'rest'],
  2: ['combat', 'combat', 'combat', 'shop', 'event'],
  3: ['combat', 'combat', 'boss', 'shop', 'event'],
};

// ============================================
// Items
// ============================================

interface Item {
  id: string;
  name: string;
  tier: 'common' | 'uncommon' | 'rare' | 'legendary';
  effect: ItemEffect;
  synergies: string[];      // Item IDs this synergizes with
}

type ItemEffect = {
  type: 'damage_mult' | 'damage_flat' | 'heal' | 'gold_mult' | 'reroll' | 'shield' | 'lucky';
  value: number;
};

const ITEM_POOL: Item[] = [
  { id: 'iron-dice', name: 'Iron Dice', tier: 'common', effect: { type: 'damage_flat', value: 5 }, synergies: ['steel-grip'] },
  { id: 'steel-grip', name: 'Steel Grip', tier: 'common', effect: { type: 'damage_mult', value: 1.1 }, synergies: ['iron-dice'] },
  { id: 'lucky-coin', name: 'Lucky Coin', tier: 'uncommon', effect: { type: 'lucky', value: 0.1 }, synergies: ['gold-magnet'] },
  { id: 'gold-magnet', name: 'Gold Magnet', tier: 'uncommon', effect: { type: 'gold_mult', value: 1.25 }, synergies: ['lucky-coin'] },
  { id: 'healing-salve', name: 'Healing Salve', tier: 'common', effect: { type: 'heal', value: 10 }, synergies: [] },
  { id: 'obsidian-die', name: 'Obsidian Die', tier: 'rare', effect: { type: 'damage_mult', value: 1.3 }, synergies: ['void-shard'] },
  { id: 'void-shard', name: 'Void Shard', tier: 'rare', effect: { type: 'damage_flat', value: 15 }, synergies: ['obsidian-die'] },
  { id: 'phoenix-feather', name: 'Phoenix Feather', tier: 'legendary', effect: { type: 'heal', value: 50 }, synergies: [] },
  { id: 'meteor-core', name: 'Meteor Core', tier: 'legendary', effect: { type: 'damage_mult', value: 1.5 }, synergies: ['obsidian-die', 'void-shard'] },
  { id: 'shield-rune', name: 'Shield Rune', tier: 'uncommon', effect: { type: 'shield', value: 15 }, synergies: [] },
  { id: 'reroll-token', name: 'Reroll Token', tier: 'common', effect: { type: 'reroll', value: 1 }, synergies: [] },
  { id: 'chaos-orb', name: 'Chaos Orb', tier: 'rare', effect: { type: 'damage_mult', value: 1.2 }, synergies: ['lucky-coin', 'reroll-token'] },
];

// ============================================
// Run State
// ============================================

interface RunState {
  health: number;
  maxHealth: number;
  gold: number;
  items: Item[];
  currentAnte: number;
  currentRoom: number;
  totalDamageDealt: number;
  totalDamageTaken: number;
  roomsCleared: number;
  synergiesActivated: number;
}

interface RunResult {
  seed: string;
  success: boolean;
  deathAnte: number | null;
  deathRoom: number | null;
  deathRoomType: RoomType | null;
  finalGold: number;
  roomsCleared: number;
  itemsCollected: string[];
  synergiesActivated: number;
  totalDamageDealt: number;
  totalDamageTaken: number;
}

// ============================================
// Simulation Logic
// ============================================

function generateRoom(ante: number, roomIndex: number, rng: SeededRng): Room {
  const pool = ROOM_POOLS[ante] || ROOM_POOLS[1];
  const type = pool[Math.floor(rng.random('roomType') * pool.length)];

  // Boss always in room 3 of ante 3
  const finalType = (ante === 3 && roomIndex === 2) ? 'boss' : type;

  const baseDifficulty = ante * 2 + roomIndex;
  const difficulty = Math.min(10, baseDifficulty + Math.floor(rng.random('difficulty') * 2));

  return {
    type: finalType,
    difficulty,
    goldReward: Math.floor(10 + difficulty * 5 + rng.random('gold') * 20),
    damageRange: [difficulty * 3, difficulty * 8],
  };
}

function calculateDamageOutput(state: RunState, rng: SeededRng): number {
  let baseDamage = 20 + state.currentAnte * 10;
  let multiplier = 1;

  for (const item of state.items) {
    if (item.effect.type === 'damage_flat') {
      baseDamage += item.effect.value;
    } else if (item.effect.type === 'damage_mult') {
      multiplier *= item.effect.value;
    } else if (item.effect.type === 'lucky' && rng.random('lucky') < item.effect.value) {
      multiplier *= 1.5; // Lucky crit
    }
  }

  // Check synergies
  const itemIds = new Set(state.items.map(i => i.id));
  for (const item of state.items) {
    for (const synergy of item.synergies) {
      if (itemIds.has(synergy)) {
        multiplier *= 1.15; // 15% synergy bonus
        state.synergiesActivated++;
      }
    }
  }

  return Math.floor(baseDamage * multiplier * (0.8 + rng.random('variance') * 0.4));
}

function processRoom(state: RunState, room: Room, rng: SeededRng): boolean {
  switch (room.type) {
    case 'combat':
    case 'boss': {
      const enemyHealth = room.difficulty * 15 * (room.type === 'boss' ? 3 : 1);
      let remainingHealth = enemyHealth;

      while (remainingHealth > 0 && state.health > 0) {
        // Player attacks
        const damage = calculateDamageOutput(state, rng);
        remainingHealth -= damage;
        state.totalDamageDealt += damage;

        if (remainingHealth <= 0) break;

        // Enemy attacks
        const [minDmg, maxDmg] = room.damageRange;
        let incomingDamage = Math.floor(minDmg + rng.random('enemyDmg') * (maxDmg - minDmg));

        // Apply shields
        for (const item of state.items) {
          if (item.effect.type === 'shield') {
            incomingDamage = Math.max(0, incomingDamage - item.effect.value);
          }
        }

        state.health -= incomingDamage;
        state.totalDamageTaken += incomingDamage;
      }

      if (state.health <= 0) return false;

      state.gold += room.goldReward;
      break;
    }

    case 'shop': {
      // Offer 3 random items
      const available = ITEM_POOL.filter(i => !state.items.find(si => si.id === i.id));
      const shuffled = rng.shuffle([...available], 'shopShuffle');
      const offers = shuffled.slice(0, 3);

      for (const item of offers) {
        const price = { common: 20, uncommon: 40, rare: 80, legendary: 150 }[item.tier];
        if (state.gold >= price && state.items.length < DEFAULT_CONFIG.itemSlots) {
          // Buy with 70% chance if affordable
          if (rng.random('buy') < 0.7) {
            state.gold -= price;
            state.items.push(item);
          }
        }
      }
      break;
    }

    case 'event': {
      // Random event outcomes
      const roll = rng.random('event');
      if (roll < 0.3) {
        state.gold += Math.floor(20 + rng.random('eventGold') * 30);
      } else if (roll < 0.5) {
        state.health = Math.min(state.maxHealth, state.health + 20);
      } else if (roll < 0.7) {
        state.health -= Math.floor(10 + rng.random('eventDmg') * 15);
      } else {
        // Free item
        const available = ITEM_POOL.filter(i =>
          !state.items.find(si => si.id === i.id) &&
          (i.tier === 'common' || i.tier === 'uncommon')
        );
        if (available.length > 0 && state.items.length < DEFAULT_CONFIG.itemSlots) {
          const item = available[Math.floor(rng.random('freeItem') * available.length)];
          state.items.push(item);
        }
      }

      if (state.health <= 0) return false;
      break;
    }

    case 'rest': {
      // Heal 25% max health
      const heal = Math.floor(state.maxHealth * 0.25);
      state.health = Math.min(state.maxHealth, state.health + heal);

      // Apply healing items
      for (const item of state.items) {
        if (item.effect.type === 'heal') {
          state.health = Math.min(state.maxHealth, state.health + item.effect.value);
        }
      }
      break;
    }
  }

  state.roomsCleared++;
  return true;
}

function simulateRun(runSeed: string, config: RunConfig): RunResult {
  const rng = createSeededRng(runSeed);

  const state: RunState = {
    health: config.startingHealth,
    maxHealth: config.startingHealth,
    gold: config.startingGold,
    items: [],
    currentAnte: 1,
    currentRoom: 0,
    totalDamageDealt: 0,
    totalDamageTaken: 0,
    roomsCleared: 0,
    synergiesActivated: 0,
  };

  for (let ante = 1; ante <= config.anteLevels; ante++) {
    state.currentAnte = ante;

    for (let roomIdx = 0; roomIdx < config.roomsPerLevel; roomIdx++) {
      state.currentRoom = roomIdx;
      const room = generateRoom(ante, roomIdx, rng);

      const survived = processRoom(state, room, rng);

      if (!survived) {
        return {
          seed: runSeed,
          success: false,
          deathAnte: ante,
          deathRoom: roomIdx + 1,
          deathRoomType: room.type,
          finalGold: state.gold,
          roomsCleared: state.roomsCleared,
          itemsCollected: state.items.map(i => i.id),
          synergiesActivated: state.synergiesActivated,
          totalDamageDealt: state.totalDamageDealt,
          totalDamageTaken: state.totalDamageTaken,
        };
      }
    }
  }

  return {
    seed: runSeed,
    success: true,
    deathAnte: null,
    deathRoom: null,
    deathRoomType: null,
    finalGold: state.gold,
    roomsCleared: state.roomsCleared,
    itemsCollected: state.items.map(i => i.id),
    synergiesActivated: state.synergiesActivated,
    totalDamageDealt: state.totalDamageDealt,
    totalDamageTaken: state.totalDamageTaken,
  };
}

// ============================================
// Statistics
// ============================================

interface RunStatistics {
  totalRuns: number;
  successfulRuns: number;
  successRate: number;

  deathsByAnte: Record<number, number>;
  deathsByRoom: Record<number, number>;
  deathsByRoomType: Record<RoomType, number>;

  avgRoomsCleared: number;
  avgFinalGold: number;
  avgDamageDealt: number;
  avgDamageTaken: number;

  itemPickRates: Record<string, number>;
  itemWinRates: Record<string, { picked: number; wins: number; winRate: number }>;
  synergyCombos: Record<string, { count: number; wins: number; winRate: number }>;

  difficultyByRoom: Array<{ ante: number; room: number; deathRate: number }>;
}

function computeStatistics(results: RunResult[]): RunStatistics {
  const total = results.length;
  const successful = results.filter(r => r.success).length;

  const deathsByAnte: Record<number, number> = { 1: 0, 2: 0, 3: 0 };
  const deathsByRoom: Record<number, number> = { 1: 0, 2: 0, 3: 0 };
  const deathsByRoomType: Record<RoomType, number> = { combat: 0, shop: 0, event: 0, boss: 0, rest: 0 };

  const itemPicks: Record<string, number> = {};
  const itemWins: Record<string, number> = {};
  const synergyCounts: Record<string, { count: number; wins: number }> = {};

  let totalRoomsCleared = 0;
  let totalFinalGold = 0;
  let totalDamageDealt = 0;
  let totalDamageTaken = 0;

  const roomDeaths: Record<string, number> = {};

  for (const result of results) {
    totalRoomsCleared += result.roomsCleared;
    totalFinalGold += result.finalGold;
    totalDamageDealt += result.totalDamageDealt;
    totalDamageTaken += result.totalDamageTaken;

    // Track item stats
    for (const itemId of result.itemsCollected) {
      itemPicks[itemId] = (itemPicks[itemId] || 0) + 1;
      if (result.success) {
        itemWins[itemId] = (itemWins[itemId] || 0) + 1;
      }
    }

    // Track synergy combos
    const sorted = [...result.itemsCollected].sort();
    for (let i = 0; i < sorted.length; i++) {
      for (let j = i + 1; j < sorted.length; j++) {
        const combo = `${sorted[i]}+${sorted[j]}`;
        if (!synergyCounts[combo]) {
          synergyCounts[combo] = { count: 0, wins: 0 };
        }
        synergyCounts[combo].count++;
        if (result.success) {
          synergyCounts[combo].wins++;
        }
      }
    }

    if (!result.success && result.deathAnte && result.deathRoom && result.deathRoomType) {
      deathsByAnte[result.deathAnte]++;
      deathsByRoom[result.deathRoom]++;
      deathsByRoomType[result.deathRoomType]++;

      const key = `${result.deathAnte}-${result.deathRoom}`;
      roomDeaths[key] = (roomDeaths[key] || 0) + 1;
    }
  }

  // Compute item win rates
  const itemWinRates: Record<string, { picked: number; wins: number; winRate: number }> = {};
  for (const [itemId, picks] of Object.entries(itemPicks)) {
    const wins = itemWins[itemId] || 0;
    itemWinRates[itemId] = {
      picked: picks,
      wins,
      winRate: picks > 0 ? wins / picks : 0,
    };
  }

  // Compute synergy win rates
  const synergyCombos: Record<string, { count: number; wins: number; winRate: number }> = {};
  for (const [combo, data] of Object.entries(synergyCounts)) {
    if (data.count >= 10) { // Only include combos with enough data
      synergyCombos[combo] = {
        ...data,
        winRate: data.count > 0 ? data.wins / data.count : 0,
      };
    }
  }

  // Difficulty by room
  const difficultyByRoom: Array<{ ante: number; room: number; deathRate: number }> = [];
  for (let ante = 1; ante <= 3; ante++) {
    for (let room = 1; room <= 3; room++) {
      const key = `${ante}-${room}`;
      const deaths = roomDeaths[key] || 0;
      difficultyByRoom.push({
        ante,
        room,
        deathRate: total > 0 ? deaths / total : 0,
      });
    }
  }

  return {
    totalRuns: total,
    successfulRuns: successful,
    successRate: total > 0 ? successful / total : 0,
    deathsByAnte,
    deathsByRoom,
    deathsByRoomType,
    avgRoomsCleared: total > 0 ? totalRoomsCleared / total : 0,
    avgFinalGold: total > 0 ? totalFinalGold / total : 0,
    avgDamageDealt: total > 0 ? totalDamageDealt / total : 0,
    avgDamageTaken: total > 0 ? totalDamageTaken / total : 0,
    itemPickRates: Object.fromEntries(
      Object.entries(itemPicks).map(([id, count]) => [id, count / total])
    ),
    itemWinRates,
    synergyCombos,
    difficultyByRoom,
  };
}

// ============================================
// Main Runner
// ============================================

async function main() {
  console.log('='.repeat(70));
  console.log('ROGUELIKE RUN OUTCOME SIMULATOR');
  console.log('='.repeat(70));
  console.log(`Simulating ${RUNS_TO_SIMULATE.toLocaleString()} runs...`);
  console.log(`Seed: ${SEED}`);
  console.log('='.repeat(70));
  console.log('');

  const startTime = Date.now();
  const results: RunResult[] = [];

  const masterRng = createSeededRng(SEED);

  for (let i = 0; i < RUNS_TO_SIMULATE; i++) {
    const runSeed = `${SEED}-run-${i}-${masterRng.random('runSeed')}`;
    const result = simulateRun(runSeed, DEFAULT_CONFIG);
    results.push(result);

    if ((i + 1) % 1000 === 0) {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      const pct = (((i + 1) / RUNS_TO_SIMULATE) * 100).toFixed(0);
      process.stdout.write(`\rProgress: ${pct}% (${i + 1}/${RUNS_TO_SIMULATE}) - ${elapsed}s`);
    }
  }

  console.log('\n');

  const stats = computeStatistics(results);
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  // Print results
  console.log('='.repeat(70));
  console.log('RESULTS');
  console.log('='.repeat(70));
  console.log('');

  console.log(`Success Rate: ${(stats.successRate * 100).toFixed(2)}% (${stats.successfulRuns}/${stats.totalRuns})`);
  console.log(`Avg Rooms Cleared: ${stats.avgRoomsCleared.toFixed(1)} / 9`);
  console.log(`Avg Final Gold: ${stats.avgFinalGold.toFixed(0)}`);
  console.log('');

  console.log('DEATHS BY ANTE:');
  for (const [ante, count] of Object.entries(stats.deathsByAnte)) {
    const pct = ((count / stats.totalRuns) * 100).toFixed(1);
    console.log(`  Ante ${ante}: ${count} deaths (${pct}%)`);
  }
  console.log('');

  console.log('DEATHS BY ROOM TYPE:');
  for (const [type, count] of Object.entries(stats.deathsByRoomType)) {
    if (count > 0) {
      const pct = ((count / stats.totalRuns) * 100).toFixed(1);
      console.log(`  ${type.padEnd(10)}: ${count} deaths (${pct}%)`);
    }
  }
  console.log('');

  console.log('DIFFICULTY CURVE (death rate per room):');
  console.log('        Room 1    Room 2    Room 3');
  for (let ante = 1; ante <= 3; ante++) {
    const rooms = stats.difficultyByRoom.filter(d => d.ante === ante);
    const rates = rooms.map(r => `${(r.deathRate * 100).toFixed(1)}%`.padStart(8));
    console.log(`Ante ${ante}: ${rates.join('  ')}`);
  }
  console.log('');

  console.log('TOP 5 ITEMS BY WIN RATE:');
  const sortedItems = Object.entries(stats.itemWinRates)
    .filter(([_, data]) => data.picked >= 100)
    .sort((a, b) => b[1].winRate - a[1].winRate)
    .slice(0, 5);
  for (const [itemId, data] of sortedItems) {
    const item = ITEM_POOL.find(i => i.id === itemId);
    console.log(`  ${item?.name.padEnd(20) || itemId.padEnd(20)} ${(data.winRate * 100).toFixed(1)}% win rate (${data.picked} picks)`);
  }
  console.log('');

  console.log('TOP 5 SYNERGY COMBOS:');
  const sortedCombos = Object.entries(stats.synergyCombos)
    .sort((a, b) => b[1].winRate - a[1].winRate)
    .slice(0, 5);
  for (const [combo, data] of sortedCombos) {
    console.log(`  ${combo.padEnd(30)} ${(data.winRate * 100).toFixed(1)}% win rate (${data.count} occurrences)`);
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
    runsSimulated: RUNS_TO_SIMULATE,
    durationSeconds: parseFloat(elapsed),
    statistics: stats,
  };

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2));
  console.log(`\nSaved to: ${OUTPUT_PATH}`);

  // Update cumulative stats
  let cumulative = { totalRuns: 0, totalWins: 0, sessions: 0 };
  if (fs.existsSync(CUMULATIVE_PATH)) {
    cumulative = JSON.parse(fs.readFileSync(CUMULATIVE_PATH, 'utf-8'));
  }
  cumulative.totalRuns += RUNS_TO_SIMULATE;
  cumulative.totalWins += stats.successfulRuns;
  cumulative.sessions++;
  fs.writeFileSync(CUMULATIVE_PATH, JSON.stringify(cumulative, null, 2));
  console.log(`Cumulative: ${cumulative.totalRuns.toLocaleString()} total runs across ${cumulative.sessions} sessions`);
}

main().catch(console.error);
