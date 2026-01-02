#!/usr/bin/env ts-node
/**
 * Balance Auto-Tuner
 *
 * Uses genetic algorithm to find optimal balance configuration.
 * Run with: npx tsx scripts/balance-tuner.ts
 *
 * Options:
 *   --generations=N   Number of generations (default: 20)
 *   --population=N    Population size (default: 10)
 *   --runs=N          Runs per evaluation (default: 1000)
 *   --preset=X        Starting preset (brutal|balanced|easy|riskReward)
 *
 * Features:
 *   - Simulates 3 player personas: cautious, balanced, aggressive
 *   - Tracks path choice outcomes (safe vs risky)
 *   - Optimizes for 30% win rate, 7+ items, meaningful risk/reward
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { createSeededRng, type SeededRng } from '../src/core/seeded-rng';
import {
  type BalanceConfig,
  type SimulationMetrics,
  BALANCE_PRESETS,
  perturbConfig,
  calculateFitness,
} from '../src/balance/balance-config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================
// Configuration
// ============================================

interface TunerOptions {
  generations: number;
  populationSize: number;
  runsPerEval: number;
  startingPreset: keyof typeof BALANCE_PRESETS;
  mutationRate: number;
  eliteCount: number;
}

const DEFAULT_OPTIONS: TunerOptions = {
  generations: 20,
  populationSize: 10,
  runsPerEval: 1000,
  startingPreset: 'riskReward',  // New target config
  mutationRate: 0.15,
  eliteCount: 2,
};

// ============================================
// Simulation (inline, uses BalanceConfig)
// ============================================

interface Item {
  id: string;
  name: string;
  tier: 'common' | 'uncommon' | 'rare' | 'legendary';
  effects: Array<{
    type: 'damage_flat' | 'damage_mult' | 'heal' | 'shield' | 'crit' | 'proc';
    value: number;
  }>;
  tags: string[];
  synergies: string[];
}

const ITEMS: Item[] = [
  { id: 'iron-dice', name: 'Iron Dice', tier: 'common', effects: [{ type: 'damage_flat', value: 5 }], tags: ['metal'], synergies: ['steel-grip'] },
  { id: 'steel-grip', name: 'Steel Grip', tier: 'common', effects: [{ type: 'damage_mult', value: 1.1 }], tags: ['metal'], synergies: ['iron-dice'] },
  { id: 'healing-herb', name: 'Healing Herb', tier: 'common', effects: [{ type: 'heal', value: 10 }], tags: ['nature'], synergies: [] },
  { id: 'basic-shield', name: 'Basic Shield', tier: 'common', effects: [{ type: 'shield', value: 5 }], tags: ['defense'], synergies: [] },
  { id: 'lucky-coin', name: 'Lucky Coin', tier: 'common', effects: [{ type: 'proc', value: 0.05 }], tags: ['luck'], synergies: ['rabbits-foot'] },
  { id: 'rabbits-foot', name: "Rabbit's Foot", tier: 'uncommon', effects: [{ type: 'proc', value: 0.1 }, { type: 'crit', value: 0.05 }], tags: ['luck'], synergies: ['lucky-coin'] },
  { id: 'obsidian-die', name: 'Obsidian Die', tier: 'rare', effects: [{ type: 'damage_mult', value: 1.3 }, { type: 'crit', value: 0.1 }], tags: ['dark'], synergies: ['void-shard'] },
  { id: 'void-shard', name: 'Void Shard', tier: 'rare', effects: [{ type: 'damage_flat', value: 15 }], tags: ['dark'], synergies: ['obsidian-die'] },
  { id: 'phoenix-feather', name: 'Phoenix Feather', tier: 'legendary', effects: [{ type: 'heal', value: 40 }], tags: ['fire'], synergies: [] },
  { id: 'meteor-core', name: 'Meteor Core', tier: 'legendary', effects: [{ type: 'damage_mult', value: 1.5 }, { type: 'damage_flat', value: 20 }], tags: ['cosmic'], synergies: [] },
];

// Player persona types for path simulation
type PlayerPersona = 'cautious' | 'balanced' | 'aggressive';

// Path choices at each room
type PathChoice = 'safe' | 'normal' | 'risky';

interface RunState {
  health: number;
  maxHealth: number;
  gold: number;
  items: Item[];
  ante: number;
  room: number;
  tensionMoments: number;  // Times HP dropped below 20%
  pathsTaken: PathChoice[];
}

interface RunResult {
  won: boolean;
  diedAtAnte: number;
  diedAtRoom: number;
  diedToCombat: boolean;
  diedToBoss: boolean;
  roomsCleared: number;
  itemsAcquired: number;
  finalGold: number;
  tensionMoments: number;
  pathsTaken: PathChoice[];
}

function choosePathForPersona(persona: PlayerPersona, rng: SeededRng, healthPercent: number): PathChoice {
  const roll = rng.random('pathChoice');

  // Persona base tendencies
  let riskyChance: number;
  let safeChance: number;

  switch (persona) {
    case 'cautious':
      riskyChance = 0.10;
      safeChance = 0.50;
      break;
    case 'aggressive':
      riskyChance = 0.60;
      safeChance = 0.10;
      break;
    case 'balanced':
    default:
      riskyChance = 0.33;
      safeChance = 0.33;
      break;
  }

  // Adjust based on health - low HP makes cautious players safer, aggressive players still risky
  if (healthPercent < 0.3) {
    if (persona === 'cautious') {
      safeChance += 0.30;
      riskyChance = 0.05;
    } else if (persona === 'balanced') {
      safeChance += 0.20;
      riskyChance -= 0.15;
    }
    // Aggressive stays aggressive even at low HP
  }

  if (roll < riskyChance) return 'risky';
  if (roll < riskyChance + safeChance) return 'safe';
  return 'normal';
}

function simulateRun(config: BalanceConfig, rng: SeededRng, persona: PlayerPersona = 'balanced'): RunResult {
  const state: RunState = {
    health: config.player.startingHealth,
    maxHealth: config.player.startingHealth,
    gold: config.player.startingGold,
    items: [],
    ante: 1,
    room: 1,
    tensionMoments: 0,
    pathsTaken: [],
  };

  let diedToCombat = false;
  let diedToBoss = false;

  for (let ante = 1; ante <= 3; ante++) {
    state.ante = ante;

    for (let room = 1; room <= 3; room++) {
      state.room = room;

      // Choose path based on persona
      const healthPercent = state.health / state.maxHealth;
      const pathChoice = choosePathForPersona(persona, rng, healthPercent);
      state.pathsTaken.push(pathChoice);

      // Path multipliers for this room
      let pathEnemyMult = 1.0;
      let pathRewardMult = 1.0;
      let extraRareChance = 0;

      switch (pathChoice) {
        case 'safe':
          pathEnemyMult = config.paths.safeEnemyMultiplier;
          pathRewardMult = config.paths.safeRewardMultiplier;
          break;
        case 'risky':
          pathEnemyMult = config.paths.riskyEnemyMultiplier;
          pathRewardMult = config.paths.riskyRewardMultiplier;
          extraRareChance = config.paths.riskyRareItemChance;
          break;
        // 'normal' keeps defaults at 1.0
      }

      // Determine room type
      const isBoss = ante === 3 && room === 3;
      const roomRoll = rng.random('roomType');
      const totalWeight = config.rooms.combatWeight + config.rooms.shopWeight + config.rooms.eventWeight + config.rooms.restWeight;

      let roomType: 'combat' | 'shop' | 'event' | 'rest';
      if (isBoss) {
        roomType = 'combat'; // Boss is special combat
      } else if (roomRoll < config.rooms.combatWeight / totalWeight) {
        roomType = 'combat';
      } else if (roomRoll < (config.rooms.combatWeight + config.rooms.shopWeight) / totalWeight) {
        roomType = 'shop';
      } else if (roomRoll < (config.rooms.combatWeight + config.rooms.shopWeight + config.rooms.eventWeight) / totalWeight) {
        roomType = 'event';
      } else {
        roomType = 'rest';
      }

      // Process room
      switch (roomType) {
        case 'combat': {
          // Calculate enemy stats (apply path multiplier)
          let enemyHP = (config.combat.enemyHPBase +
            (ante * config.combat.enemyHPAnteMultiplier) +
            (room * config.combat.enemyHPRoomMultiplier)) * pathEnemyMult;

          let enemyDamage = (config.combat.enemyDamageBase *
            (1 + ante * config.combat.enemyDamageAnteScaling)) * pathEnemyMult;

          if (isBoss) {
            enemyHP *= config.combat.bossHPMultiplier;
            enemyDamage *= config.combat.bossDamageMultiplier;
          }

          // Calculate player damage
          let playerDamage = config.player.baseDamage +
            (ante * config.scaling.playerDamagePerAnte);

          // Apply item effects
          let damageMultiplier = 1;
          let shieldValue = 0;
          let critChance = config.rng.baseCritChance;
          let procChance = config.rng.baseProcChance;

          const itemTags: Record<string, number> = {};
          const itemIds = new Set(state.items.map(i => i.id));

          for (const item of state.items) {
            for (const effect of item.effects) {
              switch (effect.type) {
                case 'damage_flat':
                  playerDamage += effect.value * config.scaling.itemFlatDamageMultiplier;
                  break;
                case 'damage_mult':
                  damageMultiplier *= 1 + (effect.value - 1) * config.scaling.itemPercentMultiplier;
                  break;
                case 'shield':
                  shieldValue += effect.value * config.sustain.shieldEffectiveness;
                  break;
                case 'crit':
                  critChance += effect.value;
                  break;
                case 'proc':
                  procChance += effect.value;
                  break;
              }
            }

            // Track tags
            for (const tag of item.tags) {
              itemTags[tag] = (itemTags[tag] || 0) + 1;
            }

            // Check synergies
            for (const syn of item.synergies) {
              if (itemIds.has(syn)) {
                damageMultiplier *= 1 + config.scaling.synergyBonus;
              }
            }
          }

          // Tag bonuses
          for (const count of Object.values(itemTags)) {
            if (count >= 3) {
              damageMultiplier *= 1 + config.scaling.tagSetBonus3;
            } else if (count >= 2) {
              damageMultiplier *= 1 + config.scaling.tagSetBonus2;
            }
          }

          playerDamage *= damageMultiplier;

          // Combat loop
          while (enemyHP > 0 && state.health > 0) {
            // Player attacks
            let damage = playerDamage * (0.8 + rng.random('dmgVar') * 0.4);

            // Crit check
            if (rng.random('crit') < critChance) {
              damage *= config.rng.baseCritMultiplier;
            }

            // Proc check (bonus damage)
            if (rng.random('proc') < procChance) {
              damage *= 1.5;
            }

            enemyHP -= damage;

            if (enemyHP <= 0) break;

            // Enemy attacks
            const incomingDamage = Math.max(0, enemyDamage - shieldValue) * (0.8 + rng.random('enemyVar') * 0.4);
            state.health -= incomingDamage;

            // Track tension moment if HP dropped below 20%
            if (state.health > 0 && state.health / state.maxHealth < 0.2) {
              state.tensionMoments++;
            }
          }

          if (state.health <= 0) {
            diedToCombat = true;
            diedToBoss = isBoss;
            return {
              won: false,
              diedAtAnte: ante,
              diedAtRoom: room,
              diedToCombat,
              diedToBoss,
              roomsCleared: (ante - 1) * 3 + (room - 1),
              itemsAcquired: state.items.length,
              finalGold: state.gold,
              tensionMoments: state.tensionMoments,
              pathsTaken: state.pathsTaken,
            };
          }

          // Gold reward (apply path multiplier)
          state.gold += Math.floor(config.economy.goldPerRoom * pathRewardMult * (1 + (rng.random('gold') - 0.5) * config.economy.goldVariance * 2));

          // Risky path: chance for rare item drop
          if (extraRareChance > 0 && rng.random('riskyItem') < extraRareChance) {
            const rareItems = ITEMS.filter(i => (i.tier === 'rare' || i.tier === 'legendary') && !state.items.find(si => si.id === i.id));
            if (rareItems.length > 0 && state.items.length < config.player.itemSlots) {
              state.items.push(rareItems[Math.floor(rng.random('pickRare') * rareItems.length)]);
            }
          }
          break;
        }

        case 'shop': {
          // Offer items
          const available = ITEMS.filter(i => !state.items.find(si => si.id === i.id));
          const shuffled = [...available].sort(() => rng.random('shuffle') - 0.5);
          const offers = shuffled.slice(0, 3);

          for (const item of offers) {
            const basePrice = { common: 20, uncommon: 40, rare: 80, legendary: 150 }[item.tier];
            const price = Math.floor(basePrice * config.economy.shopPriceMultiplier);

            if (state.gold >= price && state.items.length < config.player.itemSlots) {
              if (rng.random('buy') < 0.6) { // 60% chance to buy if affordable
                state.gold -= price;
                state.items.push(item);
              }
            }
          }
          break;
        }

        case 'event': {
          const roll = rng.random('event');
          if (roll < config.economy.eventGoldChance) {
            state.gold += Math.floor(15 + rng.random('eventGold') * 25);
          } else if (roll < config.economy.eventGoldChance + 0.2) {
            // Heal event
            state.health = Math.min(state.maxHealth, state.health + 15);
          } else if (roll < config.economy.eventGoldChance + 0.4) {
            // Damage event
            state.health -= Math.floor(5 + rng.random('eventDmg') * 10);
            if (state.health <= 0) {
              return {
                won: false,
                diedAtAnte: ante,
                diedAtRoom: room,
                diedToCombat: false,
                diedToBoss: false,
                roomsCleared: (ante - 1) * 3 + (room - 1),
                itemsAcquired: state.items.length,
                finalGold: state.gold,
                tensionMoments: state.tensionMoments,
                pathsTaken: state.pathsTaken,
              };
            }
          } else {
            // Free common item
            const available = ITEMS.filter(i => i.tier === 'common' && !state.items.find(si => si.id === i.id));
            if (available.length > 0 && state.items.length < config.player.itemSlots) {
              state.items.push(available[Math.floor(rng.random('freeItem') * available.length)]);
            }
          }
          break;
        }

        case 'rest': {
          const healAmount = Math.floor(state.maxHealth * config.sustain.restHealPercent);
          state.health = Math.min(state.maxHealth, state.health + healAmount);

          // Apply heal items
          for (const item of state.items) {
            for (const effect of item.effects) {
              if (effect.type === 'heal') {
                state.health = Math.min(state.maxHealth, state.health + effect.value * config.sustain.healItemMultiplier);
              }
            }
          }
          break;
        }
      }
    }
  }

  // Survived all 9 rooms
  return {
    won: true,
    diedAtAnte: 0,
    diedAtRoom: 0,
    diedToCombat: false,
    diedToBoss: false,
    roomsCleared: 9,
    itemsAcquired: state.items.length,
    finalGold: state.gold,
    tensionMoments: state.tensionMoments,
    pathsTaken: state.pathsTaken,
  };
}

function evaluateConfig(config: BalanceConfig, runs: number, seed: string): SimulationMetrics {
  const rng = createSeededRng(seed);

  // Run simulations across all 3 personas (equal split)
  const personas: PlayerPersona[] = ['cautious', 'balanced', 'aggressive'];
  const runsPerPersona = Math.floor(runs / 3);

  interface PersonaResults {
    results: RunResult[];
    wins: number;
  }

  const byPersona: Record<PlayerPersona, PersonaResults> = {
    cautious: { results: [], wins: 0 },
    balanced: { results: [], wins: 0 },
    aggressive: { results: [], wins: 0 },
  };

  // Run simulations
  for (const persona of personas) {
    for (let i = 0; i < runsPerPersona; i++) {
      const result = simulateRun(config, rng, persona);
      byPersona[persona].results.push(result);
      if (result.won) byPersona[persona].wins++;
    }
  }

  // Combine all results
  const allResults = [...byPersona.cautious.results, ...byPersona.balanced.results, ...byPersona.aggressive.results];
  const totalRuns = allResults.length;

  const wins = allResults.filter(r => r.won).length;
  const losses = allResults.filter(r => !r.won);

  const ante1Survivors = allResults.filter(r => r.won || r.diedAtAnte > 1).length;
  const ante2Survivors = allResults.filter(r => r.won || r.diedAtAnte > 2).length;
  const ante3Survivors = wins;

  const combatDeaths = losses.filter(r => r.diedToCombat).length;
  const bossDeaths = losses.filter(r => r.diedToBoss).length;

  // Calculate path-based win rates
  // "Risky" runs = aggressive persona, "Safe" runs = cautious persona
  const riskyWins = byPersona.aggressive.wins;
  const riskyRuns = byPersona.aggressive.results.length;
  const safeWins = byPersona.cautious.wins;
  const safeRuns = byPersona.cautious.results.length;

  // Average tension moments across all runs
  const totalTension = allResults.reduce((s, r) => s + r.tensionMoments, 0);

  return {
    winRate: wins / totalRuns,
    ante1Survival: ante1Survivors / totalRuns,
    ante2Survival: ante2Survivors / totalRuns,
    ante3Survival: ante3Survivors / totalRuns,
    avgRoomsCleared: allResults.reduce((s, r) => s + r.roomsCleared, 0) / totalRuns,
    avgItemsAcquired: allResults.reduce((s, r) => s + r.itemsAcquired, 0) / totalRuns,
    avgFinalGold: allResults.reduce((s, r) => s + r.finalGold, 0) / totalRuns,
    combatDeathRate: losses.length > 0 ? combatDeaths / losses.length : 0,
    bossDeathRate: losses.length > 0 ? bossDeaths / losses.length : 0,
    // New risk/reward metrics
    riskyPathWinRate: riskyRuns > 0 ? riskyWins / riskyRuns : 0,
    safePathWinRate: safeRuns > 0 ? safeWins / safeRuns : 0,
    avgTensionMoments: totalTension / totalRuns,
    bossDeathPercent: losses.length > 0 ? bossDeaths / losses.length : 0,
  };
}

// ============================================
// Genetic Algorithm
// ============================================

interface Individual {
  config: BalanceConfig;
  metrics: SimulationMetrics | null;
  fitness: number;
}

function createPopulation(baseConfig: BalanceConfig, size: number, rng: SeededRng): Individual[] {
  const population: Individual[] = [];

  // First individual is the base config
  population.push({ config: baseConfig, metrics: null, fitness: Infinity });

  // Rest are mutations
  for (let i = 1; i < size; i++) {
    population.push({
      config: perturbConfig(baseConfig, 0.2, () => rng.random('init')),
      metrics: null,
      fitness: Infinity,
    });
  }

  return population;
}

function crossover(parent1: BalanceConfig, parent2: BalanceConfig, rng: SeededRng): BalanceConfig {
  const pick = <T>(a: T, b: T): T => rng.random('cross') < 0.5 ? a : b;

  return {
    player: pick(parent1.player, parent2.player),
    combat: {
      enemyHPBase: pick(parent1.combat.enemyHPBase, parent2.combat.enemyHPBase),
      enemyHPAnteMultiplier: pick(parent1.combat.enemyHPAnteMultiplier, parent2.combat.enemyHPAnteMultiplier),
      enemyHPRoomMultiplier: pick(parent1.combat.enemyHPRoomMultiplier, parent2.combat.enemyHPRoomMultiplier),
      enemyDamageBase: pick(parent1.combat.enemyDamageBase, parent2.combat.enemyDamageBase),
      enemyDamageAnteScaling: pick(parent1.combat.enemyDamageAnteScaling, parent2.combat.enemyDamageAnteScaling),
      bossHPMultiplier: pick(parent1.combat.bossHPMultiplier, parent2.combat.bossHPMultiplier),
      bossDamageMultiplier: pick(parent1.combat.bossDamageMultiplier, parent2.combat.bossDamageMultiplier),
    },
    scaling: pick(parent1.scaling, parent2.scaling),
    sustain: pick(parent1.sustain, parent2.sustain),
    economy: pick(parent1.economy, parent2.economy),
    rng: pick(parent1.rng, parent2.rng),
    rooms: pick(parent1.rooms, parent2.rooms),
    paths: {
      safeEnemyMultiplier: pick(parent1.paths.safeEnemyMultiplier, parent2.paths.safeEnemyMultiplier),
      safeRewardMultiplier: pick(parent1.paths.safeRewardMultiplier, parent2.paths.safeRewardMultiplier),
      riskyEnemyMultiplier: pick(parent1.paths.riskyEnemyMultiplier, parent2.paths.riskyEnemyMultiplier),
      riskyRewardMultiplier: pick(parent1.paths.riskyRewardMultiplier, parent2.paths.riskyRewardMultiplier),
      riskyRareItemChance: pick(parent1.paths.riskyRareItemChance, parent2.paths.riskyRareItemChance),
      playerRiskTolerance: parent1.paths.playerRiskTolerance, // Keep fixed
    },
    targets: parent1.targets,
  };
}

function evolve(
  population: Individual[],
  options: TunerOptions,
  rng: SeededRng
): Individual[] {
  // Sort by fitness (lower is better)
  population.sort((a, b) => a.fitness - b.fitness);

  const newPopulation: Individual[] = [];

  // Elitism: keep best individuals
  for (let i = 0; i < options.eliteCount; i++) {
    newPopulation.push({ ...population[i] });
  }

  // Fill rest with crossover + mutation
  while (newPopulation.length < options.populationSize) {
    // Tournament selection
    const tournament = (size: number): Individual => {
      let best = population[Math.floor(rng.random('tour') * population.length)];
      for (let i = 1; i < size; i++) {
        const challenger = population[Math.floor(rng.random('tour') * population.length)];
        if (challenger.fitness < best.fitness) {
          best = challenger;
        }
      }
      return best;
    };

    const parent1 = tournament(3);
    const parent2 = tournament(3);

    let childConfig = crossover(parent1.config, parent2.config, rng);

    // Mutation
    if (rng.random('mutate') < options.mutationRate) {
      childConfig = perturbConfig(childConfig, 0.1, () => rng.random('perturb'));
    }

    newPopulation.push({ config: childConfig, metrics: null, fitness: Infinity });
  }

  return newPopulation;
}

// ============================================
// CLI
// ============================================

function parseArgs(): TunerOptions {
  const args = process.argv.slice(2);
  const options = { ...DEFAULT_OPTIONS };

  for (const arg of args) {
    if (arg.startsWith('--generations=')) {
      options.generations = parseInt(arg.split('=')[1], 10);
    } else if (arg.startsWith('--population=')) {
      options.populationSize = parseInt(arg.split('=')[1], 10);
    } else if (arg.startsWith('--runs=')) {
      options.runsPerEval = parseInt(arg.split('=')[1], 10);
    } else if (arg.startsWith('--preset=')) {
      options.startingPreset = arg.split('=')[1] as keyof typeof BALANCE_PRESETS;
    }
  }

  return options;
}

// ============================================
// Main
// ============================================

async function main() {
  const options = parseArgs();

  console.log('='.repeat(70));
  console.log('BALANCE AUTO-TUNER');
  console.log('='.repeat(70));
  console.log(`Starting Preset: ${options.startingPreset}`);
  console.log(`Generations: ${options.generations}`);
  console.log(`Population: ${options.populationSize}`);
  console.log(`Runs per evaluation: ${options.runsPerEval}`);
  console.log('='.repeat(70));
  console.log('');

  const startTime = Date.now();
  const seed = `tuner-${Date.now()}`;
  const rng = createSeededRng(seed);

  const baseConfig = BALANCE_PRESETS[options.startingPreset];
  let population = createPopulation(baseConfig, options.populationSize, rng);

  console.log('Target metrics:');
  console.log(`  Win Rate: ${(baseConfig.targets.overallWinRate * 100).toFixed(0)}%`);
  console.log(`  Ante 1 Survival: ${(baseConfig.targets.ante1SurvivalRate * 100).toFixed(0)}%`);
  console.log(`  Ante 2 Survival: ${(baseConfig.targets.ante2SurvivalRate * 100).toFixed(0)}%`);
  console.log(`  Ante 3 Survival: ${(baseConfig.targets.ante3SurvivalRate * 100).toFixed(0)}%`);
  console.log('');

  let bestEver: Individual = { config: baseConfig, metrics: null, fitness: Infinity };

  for (let gen = 0; gen < options.generations; gen++) {
    process.stdout.write(`Generation ${gen + 1}/${options.generations}... `);

    // Evaluate population
    for (const individual of population) {
      if (individual.metrics === null) {
        individual.metrics = evaluateConfig(individual.config, options.runsPerEval, `${seed}-eval-${gen}`);
        individual.fitness = calculateFitness(individual.metrics, individual.config.targets);
      }
    }

    // Track best
    population.sort((a, b) => a.fitness - b.fitness);
    const best = population[0];

    if (best.fitness < bestEver.fitness) {
      bestEver = { ...best };
    }

    console.log(`Best fitness: ${best.fitness.toFixed(2)} | Win rate: ${(best.metrics!.winRate * 100).toFixed(1)}%`);

    // Early termination if we hit targets
    if (best.fitness < 5) {
      console.log('Reached target fitness!');
      break;
    }

    // Evolve
    population = evolve(population, options, rng);
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log('');
  console.log('='.repeat(70));
  console.log('BEST CONFIGURATION FOUND');
  console.log('='.repeat(70));
  console.log('');

  const best = bestEver;
  console.log('Metrics:');
  console.log(`  Win Rate:        ${(best.metrics!.winRate * 100).toFixed(1)}% (target: ${(best.config.targets.overallWinRate * 100).toFixed(0)}%)`);
  console.log(`  Ante 1 Survival: ${(best.metrics!.ante1Survival * 100).toFixed(1)}%`);
  console.log(`  Ante 2 Survival: ${(best.metrics!.ante2Survival * 100).toFixed(1)}%`);
  console.log(`  Ante 3 Survival: ${(best.metrics!.ante3Survival * 100).toFixed(1)}%`);
  console.log(`  Avg Rooms:       ${best.metrics!.avgRoomsCleared.toFixed(1)} / 9`);
  console.log(`  Avg Items:       ${best.metrics!.avgItemsAcquired.toFixed(1)} (target: ${best.config.targets.avgItemsPerRun})`);
  console.log('');
  console.log('Path Strategy Results:');
  console.log(`  Risky Path Win:  ${(best.metrics!.riskyPathWinRate * 100).toFixed(1)}% (target: 35-40%)`);
  console.log(`  Safe Path Win:   ${(best.metrics!.safePathWinRate * 100).toFixed(1)}% (target: 20-25%)`);
  console.log(`  Path Spread:     ${((best.metrics!.riskyPathWinRate - best.metrics!.safePathWinRate) * 100).toFixed(1)}%`);
  console.log('');
  console.log('Game Feel:');
  console.log(`  Tension Moments: ${best.metrics!.avgTensionMoments.toFixed(2)} per run (target: 1+)`);
  console.log(`  Boss Deaths:     ${(best.metrics!.bossDeathPercent * 100).toFixed(0)}% of losses (target: 30-40%)`);
  console.log(`  Combat Deaths:   ${(best.metrics!.combatDeathRate * 100).toFixed(0)}% of losses`);
  console.log('');

  console.log('Key Parameters:');
  console.log(`  Player Base Damage:     ${best.config.player.baseDamage}`);
  console.log(`  Player Damage/Ante:     ${best.config.scaling.playerDamagePerAnte}`);
  console.log(`  Player Item Slots:      ${best.config.player.itemSlots}`);
  console.log(`  Enemy HP Base:          ${best.config.combat.enemyHPBase}`);
  console.log(`  Enemy HP/Ante:          ${best.config.combat.enemyHPAnteMultiplier}`);
  console.log(`  Enemy Damage Base:      ${best.config.combat.enemyDamageBase}`);
  console.log(`  Enemy Damage Scaling:   ${best.config.combat.enemyDamageAnteScaling.toFixed(2)}`);
  console.log(`  Boss HP Multiplier:     ${best.config.combat.bossHPMultiplier.toFixed(2)}`);
  console.log(`  Item Flat Multiplier:   ${best.config.scaling.itemFlatDamageMultiplier.toFixed(2)}`);
  console.log(`  Synergy Bonus:          ${(best.config.scaling.synergyBonus * 100).toFixed(0)}%`);
  console.log(`  Rest Heal:              ${(best.config.sustain.restHealPercent * 100).toFixed(0)}%`);
  console.log('');
  console.log('Path System:');
  console.log(`  Safe Enemy Mult:        ${best.config.paths.safeEnemyMultiplier.toFixed(2)}`);
  console.log(`  Safe Reward Mult:       ${best.config.paths.safeRewardMultiplier.toFixed(2)}`);
  console.log(`  Risky Enemy Mult:       ${best.config.paths.riskyEnemyMultiplier.toFixed(2)}`);
  console.log(`  Risky Reward Mult:      ${best.config.paths.riskyRewardMultiplier.toFixed(2)}`);
  console.log(`  Risky Rare Chance:      ${(best.config.paths.riskyRareItemChance * 100).toFixed(0)}%`);
  console.log('');

  console.log('='.repeat(70));
  console.log(`Completed in ${elapsed}s`);
  console.log('='.repeat(70));

  // Save best config
  const outputPath = path.join(__dirname, '..', 'logs', 'best-balance-config.json');
  const logDir = path.dirname(outputPath);
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    seed,
    generations: options.generations,
    population: options.populationSize,
    runsPerEval: options.runsPerEval,
    fitness: best.fitness,
    metrics: best.metrics,
    config: best.config,
  }, null, 2));

  console.log(`\nSaved to: logs/best-balance-config.json`);
}

main().catch(console.error);
