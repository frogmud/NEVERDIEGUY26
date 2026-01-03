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
import {
  TOTAL_DOMAINS,
  ROOMS_PER_DOMAIN,
  DOMAINS,
  LUCKY_DIE_BONUSES,
  LUCKY_DIE_ELEMENT,
  LUCKY_DIE_DIRECTOR,
  ELEMENT_WHEEL,
  ELEMENT_MULTIPLIERS,
  getElementMultiplier,
  DICE_CRIT_THRESHOLDS,
  isCrit,
  HEAT_SYSTEM,
  getHeatDifficultyMultiplier,
  getHeatRewardMultiplier,
  GOLD_REWARDS,
  calculateGoldReward as getCanonicalGoldReward,
  calculateScoreGoal,
  DOMAIN_SURVIVAL_TARGETS,
  isLuckyDieAligned,
  type DieSides,
  type Element,
} from '../src/balance/canonical-values';

// Player profile tracking for adaptive dialogue
import {
  createPlayerProfile,
  updatePlayerProfile,
  serializeProfile,
  type PlayerProfile,
  type RunResult as ProfileRunResult,
} from '../src/player/player-profile';
import {
  detectStoryBeats,
  updateStoryBeats,
} from '../src/player/story-beats';

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
  luckyDie: DieSides;           // Player's Lucky Die for this run
  currentDomain: number;         // 1-6 domains (was currentAnte)
  currentRoom: number;           // 1-3 rooms per domain
  heat: number;                  // Heat level (from elite doors)
  totalScore: number;
  rollHoldState: RollHoldState;
}

interface RunResult {
  runNumber: number;
  domainReached: number;          // 1-6 (was anteReached)
  roomsCleared: number;           // Total rooms cleared (max 18)
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
  // New tracking
  luckyDie: DieSides;
  luckyDieAligned: boolean;       // Was Lucky Die aligned with final domain?
  luckyDieGoldBonus: number;      // Total gold bonus from Lucky Die
  elementAdvantage: number;       // Rooms with element advantage
  elementDisadvantage: number;    // Rooms with element disadvantage
  maxHeat: number;                // Max heat reached
  // Player profile tracking
  minHP: number;                  // Lowest HP reached during run
  hpAfterBoss: number;            // HP after last boss fight
  bossDefeated: boolean;          // Defeated at least one boss
  legendaryRolls: number;         // Crit or lucky number rolls
  itemsAcquired: string[];        // Items picked up (for archetype)
  rescueDetails: Array<{ npc: string; cost: number }>; // For profile update
}

interface SimulationStats {
  totalRuns: number;
  avgDomainReached: number;       // Average domain reached (1-6)
  avgRoomsCleared: number;        // Total rooms (max 18)
  avgScore: number;
  winRate: number;                // % that completed all 6 domains
  flumeRate: number;              // % that flumed successfully
  avgDeaths: number;
  avgDebtPerRun: number;
  avgItemsKept: number;
  totalGoldCirculated: number;
  mostCommonRescuer: string;
  giniAtEnd: number;
  // 6-domain survival rates
  domain1Survival: number;
  domain2Survival: number;
  domain3Survival: number;
  domain4Survival: number;
  domain5Survival: number;
  domain6Survival: number;
  // Lucky Die / Element tracking
  luckyDieAlignedRate: number;    // % of runs with aligned Lucky Die
  avgLuckyDieGoldBonus: number;
  elementAdvantageRate: number;   // % of rooms with advantage
  avgHeat: number;
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
  const hpPercent = player.currentHP / player.maxHP;

  switch (strategy) {
    case 'aggressive':
      // Rarely flume - push for the win
      // Only bail if critically wounded with significant loot
      return hpPercent < 0.15 && itemValue > 300 && player.currentDomain >= 4;

    case 'conservative':
      // Flume when profitable but not too early
      // Need to be past domain 2 to consider bailing
      if (player.currentDomain < 3) return false;
      // Flume if hurt with good items, or at domain 4+ with decent loot
      return (hpPercent < 0.40 && itemValue > 150) ||
             (player.currentDomain >= 4 && itemValue > 250 && rng.random('flume') < 0.4);

    case 'balanced':
    default:
      // Strategic fluming: don't bail too early
      // Never flume before domain 3
      if (player.currentDomain < 3) return false;

      // Domain 3-4: only flume if seriously hurt with good loot
      if (player.currentDomain <= 4) {
        return hpPercent < 0.25 && itemValue > 200;
      }

      // Domain 5+: consider fluming with good haul or if hurt
      // But still push if healthy
      if (hpPercent > 0.50) return false; // Keep pushing if healthy

      // Hurt with good items = flume decision based on risk
      return itemValue > 300 && rng.random('flume') < 0.3;
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
): { player: PlayerState; success: boolean; scoreAchieved: number; legendaryRolls: number } {
  let legendaryRolls = 0;
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
        legendaryRolls,
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

    // Track legendary rolls (crits + lucky numbers)
    if (crits > 0 || lucky > 0) {
      legendaryRolls += crits + lucky;
    }

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
        legendaryRolls,
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
    legendaryRolls,
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

  // Roll Lucky Die for this run (d4, d6, d8, d10, d12, d20)
  const diePool: DieSides[] = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20'];
  const luckyDie = diePool[Math.floor(rng.random('luckyDie') * diePool.length)];

  let player: PlayerState = {
    maxHP: 100,
    currentHP: 100,
    gold: 50,
    items: [],
    luckyNumber: Math.floor(rng.random('luckyNum') * 6) + 1,
    luckyDie,
    currentDomain: 1,
    currentRoom: 0,
    heat: 0,
    totalScore: 0,
    rollHoldState: createRollHoldState(),
  };

  const result: RunResult = {
    runNumber,
    domainReached: 0,
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
    luckyDie,
    luckyDieAligned: false,
    luckyDieGoldBonus: 0,
    elementAdvantage: 0,
    elementDisadvantage: 0,
    maxHeat: 0,
    // Player profile tracking
    minHP: 100,
    hpAfterBoss: 100,
    bossDefeated: false,
    legendaryRolls: 0,
    itemsAcquired: [],
    rescueDetails: [],
  };

  // 6 domains with 3 rooms each
  for (let domain = 1; domain <= TOTAL_DOMAINS; domain++) {
    player.currentDomain = domain;
    const domainInfo = DOMAINS.find(d => d.id === domain)!;
    const domainElement = domainInfo.element;

    if (verbose) {
      console.log(`\n--- DOMAIN ${domain}: ${domainInfo.name} (${domainElement}) ---`);
    }

    for (let roomNum = 1; roomNum <= ROOMS_PER_DOMAIN; roomNum++) {
      player.currentRoom = roomNum;

      // Determine room type
      const roomType: 'normal' | 'elite' | 'boss' =
        roomNum === 3 ? 'boss' :
        roomNum === 2 && rng.random('elite') < 0.3 ? 'elite' : 'normal';

      // If elite door, add heat
      if (roomType === 'elite') {
        player.heat += HEAT_SYSTEM.eliteDoorHeat;
        result.maxHeat = Math.max(result.maxHeat, player.heat);
      }

      // Create room with canonical scoring
      const room: CombatRoom = {
        ante: domain,  // Map domain to ante for compatibility
        room: roomNum,
        domain: roomType === 'boss' ? 'risky' : roomType === 'elite' ? 'normal' : 'safe',
        isBoss: roomType === 'boss',
      };

      // Use canonical score goal
      const targetScore = calculateScoreGoal(domain, roomNum, roomType, player.heat);

      if (verbose) {
        console.log(`Room ${roomNum} (${roomType}): Target ${targetScore}, Heat ${player.heat}`);
      }

      // Check element advantage
      const playerElement = LUCKY_DIE_ELEMENT[player.luckyDie];
      const elementMult = getElementMultiplier(playerElement, domainElement);
      if (elementMult > 1) {
        result.elementAdvantage++;
      } else if (elementMult < 1) {
        result.elementDisadvantage++;
      }

      // Reset roll/hold state for new room
      player.rollHoldState = createRollHoldState();

      // Combat (with element multiplier affecting damage)
      const combatResult = simulateCombat(
        player,
        room,
        strategy,
        rng,
        { rollHold: DEFAULT_ROLL_HOLD_CONFIG, timeDamage: DEFAULT_TIME_DAMAGE_CONFIG },
        verbose
      );

      player = combatResult.player;
      result.legendaryRolls += combatResult.legendaryRolls;

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
          domain,
          player.maxHP,
          player.gold,
          player.items
        );

        debtState = newDebtState;
        result.rescuers.push(rescueResult.rescuerName);
        result.debtIncurred += rescueResult.debtIncurred;
        result.itemsLost += rescueResult.itemsLost.length;
        result.rescueDetails.push({
          npc: rescueResult.rescuerSlug || rescueResult.rescuerName,
          cost: rescueResult.debtIncurred,
        });

        // Restore player
        player.currentHP = rescueResult.hpRestored;
        player.gold = Math.floor(player.gold * 0.8);
        player.items = player.items.filter(i => !rescueResult.itemsLost.includes(i.id));

        if (verbose) {
          console.log(`  Rescued by ${rescueResult.rescuerName}, debt: ${rescueResult.debtIncurred}`);
        }

        continue;
      }

      result.roomsCleared++;

      // Gold reward using canonical formula
      const isAligned = isLuckyDieAligned(player.luckyDie, domain);
      const goldReward = getCanonicalGoldReward(roomType, domain, player.heat, player.luckyDie);
      player.gold += goldReward;
      result.goldEarned += goldReward;

      // Track Lucky Die bonus
      if (isAligned) {
        result.luckyDieGoldBonus += goldReward * (LUCKY_DIE_BONUSES.goldBonus - 1);
      }

      // Chance for item (scaled by domain)
      if (rng.random('itemDrop') < 0.25 + domain * 0.05) {
        const itemValue = 20 + domain * 20 + (roomType === 'boss' ? 50 : roomType === 'elite' ? 25 : 0);
        const itemId = `item-${runNumber}-${domain}-${roomNum}`;
        player.items.push({
          id: itemId,
          name: `Loot ${domain}.${roomNum}`,
          value: itemValue,
        });
        result.itemsAcquired.push(itemId);
      }

      // Track minHP after combat
      result.minHP = Math.min(result.minHP, player.currentHP);

      // Track boss defeated
      if (roomType === 'boss' && combatResult.success) {
        result.bossDefeated = true;
        result.hpAfterBoss = player.currentHP;
      }
    }

    result.domainReached = domain;
    result.luckyDieAligned = isLuckyDieAligned(player.luckyDie, domain);

    // End of domain - shop phase
    currentEconomy = simulateNPCGamblingRound(currentEconomy, rng);

    // Shop interaction
    if (player.gold >= 30 && rng.random('shop') < 0.5) {
      const shopNPC = NPC_POOL[Math.floor(rng.random('shopNPC') * NPC_POOL.length)];
      let priceMultiplier = getPriceMultiplier(currentEconomy, shopNPC.slug);

      // Apply Lucky Die shop discount if aligned
      if (isLuckyDieAligned(player.luckyDie, domain)) {
        priceMultiplier *= LUCKY_DIE_BONUSES.shopDiscount;
      }

      const itemCost = Math.floor((30 + domain * 10) * priceMultiplier);

      if (player.gold >= itemCost) {
        player.gold -= itemCost;
        result.goldSpent += itemCost;
        player.items.push({
          id: `shop-${runNumber}-${domain}`,
          name: `Shop Item ${domain}`,
          value: itemCost * 1.5,
        });
      }
    }

    // Flume decision at end of domain
    if (domain < TOTAL_DOMAINS && shouldFlume(player, debtState, strategy, rng)) {
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
        console.log(`\nFLUMED at domain ${domain}! Kept ${flumeResult.itemsKept.length} items`);
      }

      break;
    }

    // Apply interest on debt between domains
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
  playerProfile: PlayerProfile;
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

  // Initialize player profile for tracking across runs
  let playerProfile = createPlayerProfile();

  console.log('='.repeat(70));
  console.log('ARENA RUN SIMULATION (6-Domain Structure)');
  console.log('='.repeat(70));
  console.log(`Runs: ${options.runs}`);
  console.log(`Strategy: ${options.strategy}`);
  console.log(`Seed: ${options.seed}`);
  console.log(`Domains: ${TOTAL_DOMAINS} x ${ROOMS_PER_DOMAIN} rooms = ${TOTAL_DOMAINS * ROOMS_PER_DOMAIN} total`);
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

    // Convert to ProfileRunResult format and update player profile
    const profileResult: ProfileRunResult = {
      survived: result.domainReached === TOTAL_DOMAINS && !result.flumed,
      domainReached: result.domainReached,
      roomsCleared: result.roomsCleared,
      finalScore: result.finalScore,
      minHP: result.minHP,
      hpAfterBoss: result.hpAfterBoss,
      bossDefeated: result.bossDefeated,
      itemsAcquired: result.itemsAcquired,
      itemsLost: [], // Not tracked per-item
      goldEarned: result.goldEarned,
      goldSpent: result.goldSpent,
      rescuers: result.rescueDetails,
      legendaryRolls: result.legendaryRolls,
      perfectSynergies: [], // Future: track item combos
    };

    // Detect story beats from this run
    const storyBeats = detectStoryBeats(profileResult, playerProfile, i + 1);

    // Update player profile
    playerProfile = updatePlayerProfile(playerProfile, profileResult, storyBeats);

    // Decay existing story beats
    playerProfile.storyBeats = updateStoryBeats(playerProfile.storyBeats, i + 1);

    for (const rescuer of result.rescuers) {
      rescuerCounts.set(rescuer, (rescuerCounts.get(rescuer) ?? 0) + 1);
    }

    // Progress update
    if ((i + 1) % 10 === 0 || i === options.runs - 1) {
      const avgDomain = results.reduce((a, r) => a + r.domainReached, 0) / results.length;
      const winRate = results.filter(r => r.domainReached === TOTAL_DOMAINS && !r.flumed).length / results.length;
      process.stdout.write(
        `Run ${i + 1}/${options.runs}: ` +
        `Avg Domain: ${avgDomain.toFixed(2)}/${TOTAL_DOMAINS}, ` +
        `Win Rate: ${(winRate * 100).toFixed(1)}%\n`
      );
    }
  }

  // Calculate domain survival rates
  const domainSurvival = [0, 0, 0, 0, 0, 0];
  for (const r of results) {
    for (let d = 0; d < r.domainReached; d++) {
      domainSurvival[d]++;
    }
  }

  // Calculate stats
  const finalSnapshot = getEconomySnapshot(economyState);
  const mostCommonRescuer = [...rescuerCounts.entries()]
    .sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'none';

  const totalRooms = results.reduce((a, r) => a + r.elementAdvantage + r.elementDisadvantage, 0);

  const stats: SimulationStats = {
    totalRuns: options.runs,
    avgDomainReached: results.reduce((a, r) => a + r.domainReached, 0) / options.runs,
    avgRoomsCleared: results.reduce((a, r) => a + r.roomsCleared, 0) / options.runs,
    avgScore: results.reduce((a, r) => a + r.finalScore, 0) / options.runs,
    winRate: results.filter(r => r.domainReached === TOTAL_DOMAINS && !r.flumed).length / options.runs,
    flumeRate: results.filter(r => r.flumed).length / options.runs,
    avgDeaths: results.reduce((a, r) => a + r.deaths, 0) / options.runs,
    avgDebtPerRun: totalDebt / options.runs,
    avgItemsKept: results.reduce((a, r) => a + r.itemsKept, 0) / options.runs,
    totalGoldCirculated: economyState.totalGoldCirculated,
    mostCommonRescuer,
    giniAtEnd: finalSnapshot.giniCoefficient,
    // 6-domain survival rates
    domain1Survival: domainSurvival[0] / options.runs,
    domain2Survival: domainSurvival[1] / options.runs,
    domain3Survival: domainSurvival[2] / options.runs,
    domain4Survival: domainSurvival[3] / options.runs,
    domain5Survival: domainSurvival[4] / options.runs,
    domain6Survival: domainSurvival[5] / options.runs,
    // Lucky Die / Element tracking
    luckyDieAlignedRate: results.filter(r => r.luckyDieAligned).length / options.runs,
    avgLuckyDieGoldBonus: results.reduce((a, r) => a + r.luckyDieGoldBonus, 0) / options.runs,
    elementAdvantageRate: totalRooms > 0 ? results.reduce((a, r) => a + r.elementAdvantage, 0) / totalRooms : 0,
    avgHeat: results.reduce((a, r) => a + r.maxHeat, 0) / options.runs,
  };

  return { results, stats, finalEconomy: economyState, playerProfile };
}

// ============================================
// Report
// ============================================

function generateReport(stats: SimulationStats, economy: NPCEconomyState): void {
  console.log('');
  console.log('='.repeat(70));
  console.log('SIMULATION RESULTS (6-Domain Structure)');
  console.log('='.repeat(70));
  console.log('');

  console.log('PROGRESSION');
  console.log('-'.repeat(40));
  console.log(`Average Domain Reached: ${stats.avgDomainReached.toFixed(2)} / ${TOTAL_DOMAINS}`);
  console.log(`Average Rooms Cleared: ${stats.avgRoomsCleared.toFixed(1)} / ${TOTAL_DOMAINS * ROOMS_PER_DOMAIN}`);
  console.log(`Average Final Score: ${stats.avgScore.toFixed(0)}`);
  console.log('');

  console.log('DOMAIN SURVIVAL RATES');
  console.log('-'.repeat(40));
  const domainNames = ['Null Providence', 'Earth', 'Shadow Keep', 'Infernus', 'Frost Reach', 'Aberrant'];
  const targetRates = [
    DOMAIN_SURVIVAL_TARGETS.domain1,
    DOMAIN_SURVIVAL_TARGETS.domain2,
    DOMAIN_SURVIVAL_TARGETS.domain3,
    DOMAIN_SURVIVAL_TARGETS.domain4,
    DOMAIN_SURVIVAL_TARGETS.domain5,
    DOMAIN_SURVIVAL_TARGETS.domain6,
  ];
  const actualRates = [
    stats.domain1Survival,
    stats.domain2Survival,
    stats.domain3Survival,
    stats.domain4Survival,
    stats.domain5Survival,
    stats.domain6Survival,
  ];
  for (let i = 0; i < 6; i++) {
    const diff = actualRates[i] - targetRates[i];
    const indicator = Math.abs(diff) < 0.05 ? '' : diff > 0 ? '+' : '-';
    console.log(
      `  Domain ${i + 1} (${domainNames[i].padEnd(14)}): ` +
      `${(actualRates[i] * 100).toFixed(1)}% ` +
      `(target: ${(targetRates[i] * 100).toFixed(0)}%) ${indicator}`
    );
  }
  console.log('');

  console.log('OUTCOMES');
  console.log('-'.repeat(40));
  console.log(`Win Rate (completed all 6 domains): ${(stats.winRate * 100).toFixed(1)}%`);
  console.log(`Flume Rate: ${(stats.flumeRate * 100).toFixed(1)}%`);
  console.log(`Average Deaths per Run: ${stats.avgDeaths.toFixed(2)}`);
  console.log('');

  console.log('LUCKY DIE & ELEMENTS');
  console.log('-'.repeat(40));
  console.log(`Lucky Die Aligned Rate: ${(stats.luckyDieAlignedRate * 100).toFixed(1)}%`);
  console.log(`Average Lucky Die Gold Bonus: ${stats.avgLuckyDieGoldBonus.toFixed(0)} gold`);
  console.log(`Element Advantage Rate: ${(stats.elementAdvantageRate * 100).toFixed(1)}%`);
  console.log(`Average Max Heat: ${stats.avgHeat.toFixed(1)}`);
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
  const { results, stats, finalEconomy, playerProfile } = runSimulation(options);

  generateReport(stats, finalEconomy);

  // Player profile summary
  console.log('PLAYER PROFILE');
  console.log('-'.repeat(40));
  console.log(`Archetype: ${playerProfile.archetype}`);
  console.log(`Win Rate: ${(playerProfile.winRate * 100).toFixed(1)}%`);
  console.log(`Highest Domain: ${playerProfile.highestDomain}`);
  console.log(`Active Story Beats: ${playerProfile.storyBeats.length}`);
  if (playerProfile.storyBeats.length > 0) {
    console.log(`  Recent: ${playerProfile.storyBeats.slice(0, 3).map(b => b.type).join(', ')}`);
  }
  const creditors = Object.entries(playerProfile.debtsTo).filter(([, v]) => v > 0);
  if (creditors.length > 0) {
    console.log(`Debts: ${creditors.map(([k, v]) => `${k}: ${v}g`).join(', ')}`);
  }
  console.log('');

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
        playerProfile,
      },
      null,
      2
    )
  );

  // Also save player profile separately for chatbase lookups
  const profilePath = path.join(logDir, 'player-profile.json');
  fs.writeFileSync(profilePath, serializeProfile(playerProfile));

  console.log('='.repeat(70));
  console.log(`Results saved to: logs/arena-run-sim.json`);
  console.log(`Player profile saved to: logs/player-profile.json`);
  console.log('='.repeat(70));
}

main().catch(console.error);
