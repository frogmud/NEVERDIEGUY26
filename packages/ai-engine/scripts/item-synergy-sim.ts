#!/usr/bin/env ts-node
/**
 * Item Synergy Matrix Simulator
 *
 * Exhaustive item combination testing to find broken or underpowered pairs.
 * Run with: npx ts-node scripts/item-synergy-sim.ts
 *
 * Answers:
 * - Which item pairs are S-tier (>150% baseline)?
 * - Which combos are F-tier (<50% baseline)?
 * - What's the power curve across tiers?
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

const TRIALS_PER_COMBO = 1000;
const SEED = `synergy-${Date.now()}`;
const OUTPUT_PATH = './logs/item-synergy.json';
const CUMULATIVE_PATH = './logs/cumulative-item-synergy.json';

// ============================================
// Item Definitions
// ============================================

type ItemTier = 'common' | 'uncommon' | 'rare' | 'legendary';
type EffectType = 'damage_flat' | 'damage_mult' | 'damage_percent' | 'crit_chance' | 'crit_mult' |
                  'gold_mult' | 'heal_flat' | 'heal_percent' | 'shield' | 'reroll' | 'lucky_proc';

interface ItemEffect {
  type: EffectType;
  value: number;
  trigger?: 'on_hit' | 'on_crit' | 'on_kill' | 'passive' | 'on_roll';
}

interface Item {
  id: string;
  name: string;
  tier: ItemTier;
  effects: ItemEffect[];
  synergies: string[];        // Items that boost this one
  antiSynergies: string[];    // Items that conflict
  tags: string[];             // For category bonuses
}

const ITEM_POOL: Item[] = [
  // Common tier
  {
    id: 'iron-dice',
    name: 'Iron Dice',
    tier: 'common',
    effects: [{ type: 'damage_flat', value: 5, trigger: 'passive' }],
    synergies: ['steel-grip', 'forge-hammer'],
    antiSynergies: [],
    tags: ['metal', 'dice'],
  },
  {
    id: 'steel-grip',
    name: 'Steel Grip',
    tier: 'common',
    effects: [{ type: 'damage_mult', value: 1.1, trigger: 'passive' }],
    synergies: ['iron-dice', 'titanium-knuckles'],
    antiSynergies: ['silk-gloves'],
    tags: ['metal', 'grip'],
  },
  {
    id: 'lucky-penny',
    name: 'Lucky Penny',
    tier: 'common',
    effects: [{ type: 'lucky_proc', value: 0.05, trigger: 'on_roll' }],
    synergies: ['rabbits-foot', 'four-leaf'],
    antiSynergies: [],
    tags: ['luck', 'gold'],
  },
  {
    id: 'healing-herb',
    name: 'Healing Herb',
    tier: 'common',
    effects: [{ type: 'heal_flat', value: 5, trigger: 'on_kill' }],
    synergies: ['nature-blessing'],
    antiSynergies: ['poison-vial'],
    tags: ['nature', 'heal'],
  },
  {
    id: 'basic-shield',
    name: 'Basic Shield',
    tier: 'common',
    effects: [{ type: 'shield', value: 10, trigger: 'passive' }],
    synergies: ['reinforced-plating'],
    antiSynergies: [],
    tags: ['defense'],
  },

  // Uncommon tier
  {
    id: 'rabbits-foot',
    name: "Rabbit's Foot",
    tier: 'uncommon',
    effects: [
      { type: 'lucky_proc', value: 0.1, trigger: 'on_roll' },
      { type: 'crit_chance', value: 0.05, trigger: 'passive' },
    ],
    synergies: ['lucky-penny', 'four-leaf', 'horseshoe'],
    antiSynergies: [],
    tags: ['luck'],
  },
  {
    id: 'gold-magnet',
    name: 'Gold Magnet',
    tier: 'uncommon',
    effects: [{ type: 'gold_mult', value: 1.25, trigger: 'passive' }],
    synergies: ['lucky-penny', 'merchant-badge'],
    antiSynergies: [],
    tags: ['gold'],
  },
  {
    id: 'titanium-knuckles',
    name: 'Titanium Knuckles',
    tier: 'uncommon',
    effects: [
      { type: 'damage_flat', value: 8, trigger: 'passive' },
      { type: 'crit_mult', value: 1.2, trigger: 'on_crit' },
    ],
    synergies: ['steel-grip', 'berserker-rage'],
    antiSynergies: ['silk-gloves'],
    tags: ['metal', 'grip'],
  },
  {
    id: 'nature-blessing',
    name: 'Nature Blessing',
    tier: 'uncommon',
    effects: [
      { type: 'heal_percent', value: 0.02, trigger: 'passive' },
      { type: 'damage_mult', value: 1.05, trigger: 'passive' },
    ],
    synergies: ['healing-herb', 'forest-spirit'],
    antiSynergies: ['poison-vial', 'void-shard'],
    tags: ['nature', 'heal'],
  },
  {
    id: 'reinforced-plating',
    name: 'Reinforced Plating',
    tier: 'uncommon',
    effects: [{ type: 'shield', value: 20, trigger: 'passive' }],
    synergies: ['basic-shield', 'fortress-wall'],
    antiSynergies: ['glass-cannon'],
    tags: ['defense', 'metal'],
  },

  // Rare tier
  {
    id: 'obsidian-die',
    name: 'Obsidian Die',
    tier: 'rare',
    effects: [
      { type: 'damage_mult', value: 1.3, trigger: 'passive' },
      { type: 'crit_chance', value: 0.1, trigger: 'passive' },
    ],
    synergies: ['void-shard', 'shadow-cloak'],
    antiSynergies: ['holy-relic'],
    tags: ['dark', 'dice'],
  },
  {
    id: 'void-shard',
    name: 'Void Shard',
    tier: 'rare',
    effects: [
      { type: 'damage_flat', value: 15, trigger: 'passive' },
      { type: 'damage_percent', value: 0.1, trigger: 'on_crit' },
    ],
    synergies: ['obsidian-die', 'chaos-orb'],
    antiSynergies: ['nature-blessing', 'holy-relic'],
    tags: ['dark', 'void'],
  },
  {
    id: 'berserker-rage',
    name: 'Berserker Rage',
    tier: 'rare',
    effects: [
      { type: 'damage_mult', value: 1.4, trigger: 'passive' },
      { type: 'crit_mult', value: 1.5, trigger: 'on_crit' },
    ],
    synergies: ['titanium-knuckles', 'blood-pact'],
    antiSynergies: ['reinforced-plating', 'basic-shield'],
    tags: ['rage', 'damage'],
  },
  {
    id: 'four-leaf',
    name: 'Four-Leaf Clover',
    tier: 'rare',
    effects: [
      { type: 'lucky_proc', value: 0.15, trigger: 'on_roll' },
      { type: 'gold_mult', value: 1.1, trigger: 'passive' },
    ],
    synergies: ['rabbits-foot', 'lucky-penny', 'horseshoe'],
    antiSynergies: [],
    tags: ['luck', 'nature'],
  },
  {
    id: 'glass-cannon',
    name: 'Glass Cannon',
    tier: 'rare',
    effects: [
      { type: 'damage_mult', value: 1.8, trigger: 'passive' },
      { type: 'shield', value: -20, trigger: 'passive' },
    ],
    synergies: ['berserker-rage'],
    antiSynergies: ['reinforced-plating', 'basic-shield', 'fortress-wall'],
    tags: ['glass', 'damage'],
  },

  // Legendary tier
  {
    id: 'meteor-core',
    name: 'Meteor Core',
    tier: 'legendary',
    effects: [
      { type: 'damage_mult', value: 1.5, trigger: 'passive' },
      { type: 'damage_flat', value: 25, trigger: 'passive' },
      { type: 'crit_mult', value: 2.0, trigger: 'on_crit' },
    ],
    synergies: ['obsidian-die', 'void-shard', 'cosmic-dust'],
    antiSynergies: [],
    tags: ['cosmic', 'fire'],
  },
  {
    id: 'phoenix-feather',
    name: 'Phoenix Feather',
    tier: 'legendary',
    effects: [
      { type: 'heal_flat', value: 50, trigger: 'on_kill' },
      { type: 'heal_percent', value: 0.1, trigger: 'passive' },
    ],
    synergies: ['nature-blessing', 'healing-herb'],
    antiSynergies: ['void-shard'],
    tags: ['fire', 'heal', 'mythic'],
  },
  {
    id: 'horseshoe',
    name: 'Golden Horseshoe',
    tier: 'legendary',
    effects: [
      { type: 'lucky_proc', value: 0.25, trigger: 'on_roll' },
      { type: 'crit_chance', value: 0.15, trigger: 'passive' },
      { type: 'gold_mult', value: 1.5, trigger: 'passive' },
    ],
    synergies: ['rabbits-foot', 'four-leaf', 'lucky-penny'],
    antiSynergies: [],
    tags: ['luck', 'gold', 'mythic'],
  },
  {
    id: 'cosmic-dust',
    name: 'Cosmic Dust',
    tier: 'legendary',
    effects: [
      { type: 'damage_percent', value: 0.25, trigger: 'passive' },
      { type: 'crit_chance', value: 0.2, trigger: 'passive' },
    ],
    synergies: ['meteor-core', 'void-shard'],
    antiSynergies: [],
    tags: ['cosmic', 'void'],
  },
];

// ============================================
// Combat Simulation
// ============================================

interface CombatContext {
  baseDamage: number;
  baseHealth: number;
  enemyHealth: number;
  goldEarned: number;
}

interface CombatResult {
  totalDamage: number;
  turnsToKill: number;
  critCount: number;
  luckyProcs: number;
  finalHealth: number;
  goldEarned: number;
  effectiveScore: number;
}

function simulateCombat(items: Item[], rng: SeededRng, ctx: CombatContext): CombatResult {
  let health = ctx.baseHealth;
  let totalDamage = 0;
  let turns = 0;
  let critCount = 0;
  let luckyProcs = 0;
  let goldMult = 1;
  let enemyHp = ctx.enemyHealth;

  // Aggregate passive effects
  let flatDamage = ctx.baseDamage;
  let damageMult = 1;
  let damagePercent = 0;
  let critChance = 0.05;
  let critMult = 1.5;
  let shield = 0;
  let luckyChance = 0;
  let healFlat = 0;
  let healPercent = 0;

  // Check for synergies and anti-synergies
  const itemIds = new Set(items.map(i => i.id));
  let synergyBonus = 1;
  let antiSynergyPenalty = 1;

  for (const item of items) {
    for (const syn of item.synergies) {
      if (itemIds.has(syn)) {
        synergyBonus *= 1.15; // 15% per synergy
      }
    }
    for (const anti of item.antiSynergies) {
      if (itemIds.has(anti)) {
        antiSynergyPenalty *= 0.85; // 15% penalty per anti-synergy
      }
    }
  }

  // Check for tag bonuses
  const tagCounts: Record<string, number> = {};
  for (const item of items) {
    for (const tag of item.tags) {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    }
  }
  let tagBonus = 1;
  for (const [tag, count] of Object.entries(tagCounts)) {
    if (count >= 3) {
      tagBonus *= 1.2; // 20% bonus for 3+ of same tag
    } else if (count >= 2) {
      tagBonus *= 1.1; // 10% bonus for 2 of same tag
    }
  }

  // Apply passive effects
  for (const item of items) {
    for (const effect of item.effects) {
      if (effect.trigger === 'passive' || effect.trigger === undefined) {
        switch (effect.type) {
          case 'damage_flat': flatDamage += effect.value; break;
          case 'damage_mult': damageMult *= effect.value; break;
          case 'damage_percent': damagePercent += effect.value; break;
          case 'crit_chance': critChance += effect.value; break;
          case 'crit_mult': critMult += effect.value - 1; break;
          case 'shield': shield += effect.value; break;
          case 'gold_mult': goldMult *= effect.value; break;
          case 'heal_percent': healPercent += effect.value; break;
        }
      }
    }
  }

  // Combat loop
  while (enemyHp > 0 && health > 0 && turns < 100) {
    turns++;

    // Check lucky procs
    for (const item of items) {
      for (const effect of item.effects) {
        if (effect.trigger === 'on_roll' && effect.type === 'lucky_proc') {
          if (rng.random('lucky') < effect.value) {
            luckyProcs++;
            damageMult *= 1.3; // Lucky roll bonus
          }
        }
      }
    }

    // Calculate damage
    let damage = flatDamage * damageMult * synergyBonus * antiSynergyPenalty * tagBonus;

    // Check for crit
    const isCrit = rng.random('crit') < critChance;
    if (isCrit) {
      critCount++;
      damage *= critMult;

      // Apply on_crit effects
      for (const item of items) {
        for (const effect of item.effects) {
          if (effect.trigger === 'on_crit') {
            switch (effect.type) {
              case 'damage_percent': damage *= (1 + effect.value); break;
              case 'crit_mult': damage *= effect.value; break;
            }
          }
        }
      }
    }

    // Apply percent damage
    damage *= (1 + damagePercent);

    totalDamage += damage;
    enemyHp -= damage;

    // Enemy attacks back (simplified)
    const enemyDamage = Math.max(0, 15 - shield);
    health -= enemyDamage;

    // Passive healing
    health += health * healPercent;
  }

  // Apply on_kill effects
  if (enemyHp <= 0) {
    for (const item of items) {
      for (const effect of item.effects) {
        if (effect.trigger === 'on_kill' && effect.type === 'heal_flat') {
          health = Math.min(ctx.baseHealth, health + effect.value);
          healFlat += effect.value;
        }
      }
    }
  }

  const goldEarned = Math.floor(ctx.goldEarned * goldMult);

  // Compute effective score (normalized)
  const damageScore = totalDamage / ctx.enemyHealth;
  const survivalScore = Math.max(0, health) / ctx.baseHealth;
  const efficiencyScore = Math.max(0, (20 - turns) / 20);
  const goldScore = goldEarned / ctx.goldEarned;

  const effectiveScore = (damageScore * 0.4 + survivalScore * 0.3 + efficiencyScore * 0.2 + goldScore * 0.1);

  return {
    totalDamage,
    turnsToKill: turns,
    critCount,
    luckyProcs,
    finalHealth: Math.max(0, health),
    goldEarned,
    effectiveScore,
  };
}

// ============================================
// Synergy Analysis
// ============================================

interface ComboResult {
  item1: string;
  item2: string;
  avgScore: number;
  avgDamage: number;
  avgTurns: number;
  avgCrits: number;
  avgLucky: number;
  avgHealth: number;
  avgGold: number;
  trials: number;
  tier: 'S' | 'A' | 'B' | 'C' | 'D' | 'F';
  hasSynergy: boolean;
  hasAntiSynergy: boolean;
}

function tierFromScore(score: number, baseline: number): 'S' | 'A' | 'B' | 'C' | 'D' | 'F' {
  const ratio = score / baseline;
  if (ratio >= 1.5) return 'S';
  if (ratio >= 1.25) return 'A';
  if (ratio >= 1.0) return 'B';
  if (ratio >= 0.75) return 'C';
  if (ratio >= 0.5) return 'D';
  return 'F';
}

function analyzeCombo(item1: Item, item2: Item, baseline: number): ComboResult {
  const rng = createSeededRng(`${item1.id}-${item2.id}`);
  const items = [item1, item2];

  const ctx: CombatContext = {
    baseDamage: 20,
    baseHealth: 100,
    enemyHealth: 150,
    goldEarned: 50,
  };

  let totalScore = 0;
  let totalDamage = 0;
  let totalTurns = 0;
  let totalCrits = 0;
  let totalLucky = 0;
  let totalHealth = 0;
  let totalGold = 0;

  for (let i = 0; i < TRIALS_PER_COMBO; i++) {
    const result = simulateCombat(items, rng, ctx);
    totalScore += result.effectiveScore;
    totalDamage += result.totalDamage;
    totalTurns += result.turnsToKill;
    totalCrits += result.critCount;
    totalLucky += result.luckyProcs;
    totalHealth += result.finalHealth;
    totalGold += result.goldEarned;
  }

  const avgScore = totalScore / TRIALS_PER_COMBO;
  const hasSynergy = item1.synergies.includes(item2.id) || item2.synergies.includes(item1.id);
  const hasAntiSynergy = item1.antiSynergies.includes(item2.id) || item2.antiSynergies.includes(item1.id);

  return {
    item1: item1.id,
    item2: item2.id,
    avgScore,
    avgDamage: totalDamage / TRIALS_PER_COMBO,
    avgTurns: totalTurns / TRIALS_PER_COMBO,
    avgCrits: totalCrits / TRIALS_PER_COMBO,
    avgLucky: totalLucky / TRIALS_PER_COMBO,
    avgHealth: totalHealth / TRIALS_PER_COMBO,
    avgGold: totalGold / TRIALS_PER_COMBO,
    trials: TRIALS_PER_COMBO,
    tier: tierFromScore(avgScore, baseline),
    hasSynergy,
    hasAntiSynergy,
  };
}

function computeBaseline(): number {
  // Single common item baseline
  const rng = createSeededRng('baseline');
  const items = [ITEM_POOL.find(i => i.id === 'iron-dice')!];

  const ctx: CombatContext = {
    baseDamage: 20,
    baseHealth: 100,
    enemyHealth: 150,
    goldEarned: 50,
  };

  let total = 0;
  for (let i = 0; i < TRIALS_PER_COMBO; i++) {
    const result = simulateCombat(items, rng, ctx);
    total += result.effectiveScore;
  }
  return total / TRIALS_PER_COMBO;
}

// ============================================
// Main Runner
// ============================================

async function main() {
  console.log('='.repeat(70));
  console.log('ITEM SYNERGY MATRIX SIMULATOR');
  console.log('='.repeat(70));
  console.log(`Testing all item pairs (${ITEM_POOL.length} items = ${ITEM_POOL.length * (ITEM_POOL.length - 1) / 2} combos)`);
  console.log(`Trials per combo: ${TRIALS_PER_COMBO.toLocaleString()}`);
  console.log('='.repeat(70));
  console.log('');

  const startTime = Date.now();

  // Compute baseline
  console.log('Computing baseline...');
  const baseline = computeBaseline();
  console.log(`Baseline score: ${baseline.toFixed(3)}`);
  console.log('');

  // Test all combos
  const results: ComboResult[] = [];
  const totalCombos = ITEM_POOL.length * (ITEM_POOL.length - 1) / 2;
  let comboCount = 0;

  for (let i = 0; i < ITEM_POOL.length; i++) {
    for (let j = i + 1; j < ITEM_POOL.length; j++) {
      const result = analyzeCombo(ITEM_POOL[i], ITEM_POOL[j], baseline);
      results.push(result);
      comboCount++;

      if (comboCount % 20 === 0) {
        const pct = ((comboCount / totalCombos) * 100).toFixed(0);
        process.stdout.write(`\rProgress: ${pct}% (${comboCount}/${totalCombos})`);
      }
    }
  }

  console.log('\n');

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  // Sort by score
  results.sort((a, b) => b.avgScore - a.avgScore);

  // Tier breakdown
  const tierCounts: Record<string, number> = { S: 0, A: 0, B: 0, C: 0, D: 0, F: 0 };
  for (const r of results) {
    tierCounts[r.tier]++;
  }

  // Print results
  console.log('='.repeat(70));
  console.log('TIER DISTRIBUTION');
  console.log('='.repeat(70));
  for (const tier of ['S', 'A', 'B', 'C', 'D', 'F']) {
    const count = tierCounts[tier];
    const pct = ((count / results.length) * 100).toFixed(1);
    const bar = '#'.repeat(Math.floor(count / 2));
    console.log(`${tier}: ${String(count).padStart(3)} (${pct.padStart(5)}%) ${bar}`);
  }
  console.log('');

  console.log('='.repeat(70));
  console.log('S-TIER COMBOS (Potentially Broken)');
  console.log('='.repeat(70));
  const sTier = results.filter(r => r.tier === 'S');
  for (const r of sTier.slice(0, 10)) {
    const item1 = ITEM_POOL.find(i => i.id === r.item1)!;
    const item2 = ITEM_POOL.find(i => i.id === r.item2)!;
    const synLabel = r.hasSynergy ? ' [SYN]' : '';
    console.log(`  ${item1.name} + ${item2.name}${synLabel}`);
    console.log(`    Score: ${r.avgScore.toFixed(3)} | Dmg: ${r.avgDamage.toFixed(0)} | Turns: ${r.avgTurns.toFixed(1)}`);
  }
  console.log('');

  console.log('='.repeat(70));
  console.log('F-TIER COMBOS (Underpowered)');
  console.log('='.repeat(70));
  const fTier = results.filter(r => r.tier === 'F');
  for (const r of fTier.slice(0, 10)) {
    const item1 = ITEM_POOL.find(i => i.id === r.item1)!;
    const item2 = ITEM_POOL.find(i => i.id === r.item2)!;
    const antiLabel = r.hasAntiSynergy ? ' [ANTI]' : '';
    console.log(`  ${item1.name} + ${item2.name}${antiLabel}`);
    console.log(`    Score: ${r.avgScore.toFixed(3)} | Dmg: ${r.avgDamage.toFixed(0)} | Turns: ${r.avgTurns.toFixed(1)}`);
  }
  console.log('');

  console.log('='.repeat(70));
  console.log('SYNERGY VALIDATION');
  console.log('='.repeat(70));
  const definedSynergies = results.filter(r => r.hasSynergy);
  const synergiesWorking = definedSynergies.filter(r => r.tier === 'S' || r.tier === 'A').length;
  console.log(`Defined synergies: ${definedSynergies.length}`);
  console.log(`Working as intended (A/S tier): ${synergiesWorking} (${((synergiesWorking / definedSynergies.length) * 100).toFixed(0)}%)`);

  const definedAnti = results.filter(r => r.hasAntiSynergy);
  const antiWorking = definedAnti.filter(r => r.tier === 'D' || r.tier === 'F').length;
  console.log(`Defined anti-synergies: ${definedAnti.length}`);
  console.log(`Working as intended (D/F tier): ${antiWorking} (${((antiWorking / definedAnti.length) * 100).toFixed(0)}%)`);
  console.log('');

  console.log('='.repeat(70));
  console.log(`Completed in ${elapsed}s`);
  console.log('='.repeat(70));

  // Save results
  const logDir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  // Build synergy matrix for heatmap
  const matrix: Record<string, Record<string, number>> = {};
  for (const item of ITEM_POOL) {
    matrix[item.id] = {};
  }
  for (const r of results) {
    matrix[r.item1][r.item2] = r.avgScore;
    matrix[r.item2][r.item1] = r.avgScore;
  }

  const output = {
    timestamp: new Date().toISOString(),
    seed: SEED,
    trialsPerCombo: TRIALS_PER_COMBO,
    baseline,
    durationSeconds: parseFloat(elapsed),
    tierCounts,
    sTier: sTier.slice(0, 20),
    fTier: fTier.slice(0, 20),
    allResults: results,
    matrix,
    items: ITEM_POOL.map(i => ({ id: i.id, name: i.name, tier: i.tier, tags: i.tags })),
  };

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2));
  console.log(`\nSaved to: ${OUTPUT_PATH}`);
}

main().catch(console.error);
