#!/usr/bin/env ts-node
/**
 * NPC Trade Economy Analyzer
 *
 * Simulates player-NPC shop interactions to balance the gold economy.
 * Run with: npx ts-node scripts/trade-economy-sim.ts
 *
 * Answers:
 * - Are travelers overcharging?
 * - Is gold too scarce or too abundant?
 * - What's the optimal haggle success rate?
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { createSeededRng, type SeededRng } from '../src/core/seeded-rng';
import { ALL_NPCS } from '../src/npcs/definitions';
import type { BehavioralArchetype } from '../src/personality/behavioral-patterns';
import type { MoodType } from '../src/core/types';

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================
// Configuration
// ============================================

const SESSIONS_TO_SIMULATE = 5000;
const SHOPS_PER_SESSION = 3;          // Player visits ~3 shops per run
const SEED = `economy-${Date.now()}`;
const OUTPUT_PATH = './logs/trade-economy.json';
const CUMULATIVE_PATH = './logs/cumulative-trade-economy.json';

// ============================================
// NPC Merchant Profiles
// ============================================

interface MerchantProfile {
  slug: string;
  name: string;
  category: 'traveler' | 'wanderer' | 'pantheon' | 'cosmic_horror';
  archetype: BehavioralArchetype;
  basePriceModifier: number;      // 1.0 = fair, >1 = expensive, <1 = cheap
  haggleResistance: number;       // 0-1, higher = harder to haggle
  stockQuality: number;           // 0-1, higher = better items
  moodVolatility: number;         // How much mood affects prices
}

// Build merchant profiles from NPC definitions
function buildMerchantProfiles(): MerchantProfile[] {
  const profiles: MerchantProfile[] = [];

  // Category-based defaults
  const categoryDefaults: Record<string, Partial<MerchantProfile>> = {
    travelers: { basePriceModifier: 1.2, haggleResistance: 0.3, stockQuality: 0.6 },
    wanderers: { basePriceModifier: 0.9, haggleResistance: 0.5, stockQuality: 0.5 },
    pantheon: { basePriceModifier: 1.5, haggleResistance: 0.8, stockQuality: 0.9 },
    cosmic_horror: { basePriceModifier: 2.0, haggleResistance: 0.9, stockQuality: 1.0 },
  };

  // Archetype modifiers
  const archetypeModifiers: Record<BehavioralArchetype, Partial<MerchantProfile>> = {
    diplomat: { basePriceModifier: 0.95, haggleResistance: 0.4 },
    hothead: { basePriceModifier: 1.1, haggleResistance: 0.6, moodVolatility: 0.3 },
    calculator: { basePriceModifier: 1.0, haggleResistance: 0.7 },
    wildcard: { basePriceModifier: 1.0, haggleResistance: 0.5, moodVolatility: 0.4 },
    stoic: { basePriceModifier: 1.0, haggleResistance: 0.8, moodVolatility: 0.05 },
  };

  for (const npc of ALL_NPCS) {
    const catKey = npc.identity.category as string;
    const catDefaults = categoryDefaults[catKey] || categoryDefaults['wanderers'];
    const archMods = archetypeModifiers[npc.archetype] || {};

    profiles.push({
      slug: npc.identity.slug,
      name: npc.identity.name,
      category: catKey === 'travelers' ? 'traveler' : catKey === 'wanderers' ? 'wanderer' : catKey as any,
      archetype: npc.archetype,
      basePriceModifier: (catDefaults.basePriceModifier || 1.0) * (archMods.basePriceModifier || 1.0),
      haggleResistance: (catDefaults.haggleResistance || 0.5) + (archMods.haggleResistance || 0) * 0.2,
      stockQuality: catDefaults.stockQuality || 0.5,
      moodVolatility: archMods.moodVolatility || 0.1,
    });
  }

  return profiles;
}

// ============================================
// Item Economy
// ============================================

interface ShopItem {
  id: string;
  name: string;
  tier: 'common' | 'uncommon' | 'rare' | 'legendary';
  basePrice: number;
  desirability: number;    // 0-1, how much player wants it
}

const SHOP_ITEMS: ShopItem[] = [
  { id: 'health-potion', name: 'Health Potion', tier: 'common', basePrice: 15, desirability: 0.9 },
  { id: 'iron-dice', name: 'Iron Dice', tier: 'common', basePrice: 25, desirability: 0.7 },
  { id: 'lucky-charm', name: 'Lucky Charm', tier: 'common', basePrice: 20, desirability: 0.6 },
  { id: 'basic-shield', name: 'Basic Shield', tier: 'common', basePrice: 30, desirability: 0.5 },
  { id: 'gold-finder', name: 'Gold Finder', tier: 'uncommon', basePrice: 50, desirability: 0.8 },
  { id: 'crit-lens', name: 'Crit Lens', tier: 'uncommon', basePrice: 60, desirability: 0.75 },
  { id: 'void-shard', name: 'Void Shard', tier: 'rare', basePrice: 100, desirability: 0.85 },
  { id: 'obsidian-die', name: 'Obsidian Die', tier: 'rare', basePrice: 120, desirability: 0.9 },
  { id: 'meteor-core', name: 'Meteor Core', tier: 'legendary', basePrice: 200, desirability: 0.95 },
  { id: 'phoenix-feather', name: 'Phoenix Feather', tier: 'legendary', basePrice: 180, desirability: 0.85 },
];

// ============================================
// Player Simulation
// ============================================

interface PlayerState {
  gold: number;
  items: string[];
  haggleSkill: number;     // 0-1, improves with attempts
  reputation: number;       // -1 to 1, affects NPC attitudes
}

interface ShopSession {
  merchantSlug: string;
  merchantMood: MoodType;
  itemsOffered: ShopItem[];
  transactions: Transaction[];
  haggleAttempts: number;
  haggleSuccesses: number;
  goldSpent: number;
  itemsBought: string[];
}

interface Transaction {
  itemId: string;
  basePrice: number;
  finalPrice: number;
  haggled: boolean;
  haggleSuccess: boolean;
  purchased: boolean;
}

// ============================================
// Shop Interaction Logic
// ============================================

function generateMood(rng: SeededRng): MoodType {
  const moods: MoodType[] = ['hostile', 'wary', 'neutral', 'warm', 'elated'];
  const weights = [0.1, 0.2, 0.4, 0.2, 0.1];
  const roll = rng.random('mood');
  let cumulative = 0;
  for (let i = 0; i < moods.length; i++) {
    cumulative += weights[i];
    if (roll < cumulative) return moods[i];
  }
  return 'neutral';
}

function getMoodPriceModifier(mood: MoodType, volatility: number): number {
  const moodMods: Record<MoodType, number> = {
    hostile: 1.3,
    wary: 1.1,
    neutral: 1.0,
    warm: 0.9,
    elated: 0.8,
  };
  const baseMod = moodMods[mood] || 1.0;
  return 1 + (baseMod - 1) * volatility;
}

function selectShopItems(merchant: MerchantProfile, rng: SeededRng): ShopItem[] {
  const available = [...SHOP_ITEMS];

  // Filter by stock quality
  const filtered = available.filter(item => {
    const tierThreshold = { common: 0, uncommon: 0.3, rare: 0.6, legendary: 0.85 }[item.tier];
    return merchant.stockQuality >= tierThreshold || rng.random('stock') < 0.2;
  });

  // Select 3-5 items
  const shuffled = rng.shuffle(filtered, 'shopItems');
  const count = 3 + Math.floor(rng.random('itemCount') * 3);
  return shuffled.slice(0, count);
}

function calculatePrice(
  item: ShopItem,
  merchant: MerchantProfile,
  mood: MoodType,
  playerRep: number
): number {
  let price = item.basePrice;

  // Merchant markup
  price *= merchant.basePriceModifier;

  // Mood modifier
  price *= getMoodPriceModifier(mood, merchant.moodVolatility);

  // Reputation modifier (-10% to +10%)
  price *= (1 - playerRep * 0.1);

  // Add some variance
  price *= 0.95 + Math.random() * 0.1;

  return Math.round(price);
}

function attemptHaggle(
  basePrice: number,
  merchant: MerchantProfile,
  playerSkill: number,
  rng: SeededRng
): { success: boolean; newPrice: number } {
  const successChance = Math.max(0.05, playerSkill - merchant.haggleResistance + 0.3);
  const success = rng.random('haggle') < successChance;

  if (success) {
    const discount = 0.1 + rng.random('discount') * 0.15; // 10-25% off
    return { success: true, newPrice: Math.round(basePrice * (1 - discount)) };
  }

  // Failed haggle might anger merchant
  const priceIncrease = rng.random('anger') < 0.2 ? 1.05 : 1.0;
  return { success: false, newPrice: Math.round(basePrice * priceIncrease) };
}

function shouldBuyItem(
  item: ShopItem,
  price: number,
  playerGold: number,
  playerItems: string[]
): boolean {
  // Already have it
  if (playerItems.includes(item.id)) return false;

  // Can't afford
  if (price > playerGold) return false;

  // Decision based on desirability and price ratio
  const valueRatio = item.basePrice / price;
  const buyChance = item.desirability * valueRatio * 0.8;

  return Math.random() < buyChance;
}

function simulateShopSession(
  merchant: MerchantProfile,
  player: PlayerState,
  rng: SeededRng
): ShopSession {
  const mood = generateMood(rng);
  const items = selectShopItems(merchant, rng);
  const transactions: Transaction[] = [];

  let haggleAttempts = 0;
  let haggleSuccesses = 0;
  let goldSpent = 0;
  const itemsBought: string[] = [];

  for (const item of items) {
    let price = calculatePrice(item, merchant, mood, player.reputation);
    let haggled = false;
    let haggleSuccess = false;

    // Consider haggling for expensive items
    if (price > 40 && rng.random('tryHaggle') < 0.6) {
      haggled = true;
      haggleAttempts++;
      const result = attemptHaggle(price, merchant, player.haggleSkill, rng);
      haggleSuccess = result.success;
      price = result.newPrice;
      if (haggleSuccess) haggleSuccesses++;
    }

    const purchased = shouldBuyItem(item, price, player.gold - goldSpent, [...player.items, ...itemsBought]);

    transactions.push({
      itemId: item.id,
      basePrice: item.basePrice,
      finalPrice: price,
      haggled,
      haggleSuccess,
      purchased,
    });

    if (purchased) {
      goldSpent += price;
      itemsBought.push(item.id);
    }
  }

  return {
    merchantSlug: merchant.slug,
    merchantMood: mood,
    itemsOffered: items,
    transactions,
    haggleAttempts,
    haggleSuccesses,
    goldSpent,
    itemsBought,
  };
}

// ============================================
// Full Session Simulation
// ============================================

interface SessionResult {
  shops: ShopSession[];
  startingGold: number;
  endingGold: number;
  goldSpent: number;
  goldEarned: number;     // From gameplay between shops
  itemsAcquired: string[];
  totalHaggleAttempts: number;
  totalHaggleSuccesses: number;
}

function simulateFullSession(
  merchants: MerchantProfile[],
  sessionSeed: string
): SessionResult {
  const rng = createSeededRng(sessionSeed);

  const player: PlayerState = {
    gold: 100,             // Starting gold
    items: [],
    haggleSkill: 0.3 + rng.random('skill') * 0.3,
    reputation: (rng.random('rep') - 0.5) * 0.4,
  };

  const startingGold = player.gold;
  const shops: ShopSession[] = [];
  let goldEarned = 0;

  // Simulate visiting shops
  for (let i = 0; i < SHOPS_PER_SESSION; i++) {
    // Pick a random merchant
    const merchant = merchants[Math.floor(rng.random('merchant') * merchants.length)];

    const session = simulateShopSession(merchant, player, rng);
    shops.push(session);

    // Update player state
    player.gold -= session.goldSpent;
    player.items.push(...session.itemsBought);

    // Earn gold between shops (gameplay rewards)
    const earned = Math.floor(30 + rng.random('earn') * 40);
    goldEarned += earned;
    player.gold += earned;

    // Improve haggle skill
    player.haggleSkill = Math.min(0.8, player.haggleSkill + session.haggleAttempts * 0.02);

    // Rep changes based on behavior
    if (session.haggleSuccesses > 0) {
      player.reputation -= 0.02; // NPCs don't like being haggled
    }
    if (session.goldSpent > 50) {
      player.reputation += 0.05; // Big spenders get respect
    }
  }

  return {
    shops,
    startingGold,
    endingGold: player.gold,
    goldSpent: shops.reduce((s, sh) => s + sh.goldSpent, 0),
    goldEarned,
    itemsAcquired: player.items,
    totalHaggleAttempts: shops.reduce((s, sh) => s + sh.haggleAttempts, 0),
    totalHaggleSuccesses: shops.reduce((s, sh) => s + sh.haggleSuccesses, 0),
  };
}

// ============================================
// Statistics
// ============================================

interface EconomyStats {
  totalSessions: number;
  avgGoldSpent: number;
  avgGoldEarned: number;
  netGoldFlow: number;        // Positive = players accumulating, negative = draining
  inflationIndex: number;     // 1.0 = balanced, >1 = inflation, <1 = deflation

  avgItemsBought: number;
  avgHaggleRate: number;
  avgHaggleSuccess: number;

  merchantStats: Record<string, {
    visits: number;
    avgPriceMarkup: number;
    haggleSuccessRate: number;
    goldExtracted: number;
  }>;

  categoryStats: Record<string, {
    avgMarkup: number;
    haggleResistance: number;
    playerSatisfaction: number;
  }>;

  itemPopularity: Record<string, {
    offered: number;
    purchased: number;
    avgPrice: number;
    purchaseRate: number;
  }>;

  priceDistribution: {
    under20: number;
    under50: number;
    under100: number;
    over100: number;
  };
}

function computeStatistics(
  results: SessionResult[],
  merchants: MerchantProfile[]
): EconomyStats {
  const total = results.length;

  let totalSpent = 0;
  let totalEarned = 0;
  let totalItems = 0;
  let totalHaggleAttempts = 0;
  let totalHaggleSuccesses = 0;

  const merchantStats: Record<string, { visits: number; goldExtracted: number; haggleAttempts: number; haggleSuccesses: number; markups: number[] }> = {};
  const itemStats: Record<string, { offered: number; purchased: number; prices: number[] }> = {};
  const priceDistribution = { under20: 0, under50: 0, under100: 0, over100: 0 };

  for (const merchant of merchants) {
    merchantStats[merchant.slug] = { visits: 0, goldExtracted: 0, haggleAttempts: 0, haggleSuccesses: 0, markups: [] };
  }

  for (const item of SHOP_ITEMS) {
    itemStats[item.id] = { offered: 0, purchased: 0, prices: [] };
  }

  for (const result of results) {
    totalSpent += result.goldSpent;
    totalEarned += result.goldEarned;
    totalItems += result.itemsAcquired.length;
    totalHaggleAttempts += result.totalHaggleAttempts;
    totalHaggleSuccesses += result.totalHaggleSuccesses;

    for (const shop of result.shops) {
      const ms = merchantStats[shop.merchantSlug];
      if (ms) {
        ms.visits++;
        ms.goldExtracted += shop.goldSpent;
        ms.haggleAttempts += shop.haggleAttempts;
        ms.haggleSuccesses += shop.haggleSuccesses;
      }

      for (const tx of shop.transactions) {
        const is = itemStats[tx.itemId];
        if (is) {
          is.offered++;
          is.prices.push(tx.finalPrice);
          if (tx.purchased) is.purchased++;
        }

        const markup = tx.finalPrice / tx.basePrice;
        if (ms) ms.markups.push(markup);

        if (tx.finalPrice < 20) priceDistribution.under20++;
        else if (tx.finalPrice < 50) priceDistribution.under50++;
        else if (tx.finalPrice < 100) priceDistribution.under100++;
        else priceDistribution.over100++;
      }
    }
  }

  // Compute merchant averages
  const merchantOutput: EconomyStats['merchantStats'] = {};
  for (const [slug, data] of Object.entries(merchantStats)) {
    if (data.visits > 0) {
      merchantOutput[slug] = {
        visits: data.visits,
        avgPriceMarkup: data.markups.length > 0 ? data.markups.reduce((a, b) => a + b, 0) / data.markups.length : 1.0,
        haggleSuccessRate: data.haggleAttempts > 0 ? data.haggleSuccesses / data.haggleAttempts : 0,
        goldExtracted: data.goldExtracted,
      };
    }
  }

  // Compute category stats
  const categoryStats: EconomyStats['categoryStats'] = {};
  const categories = ['traveler', 'wanderer', 'pantheon', 'cosmic_horror'] as const;
  for (const cat of categories) {
    const catMerchants = merchants.filter(m => m.category === cat);
    const avgMarkup = catMerchants.reduce((s, m) => s + m.basePriceModifier, 0) / catMerchants.length;
    const avgResist = catMerchants.reduce((s, m) => s + m.haggleResistance, 0) / catMerchants.length;

    // Player satisfaction = inverse of markup * (1 - haggle resistance)
    const satisfaction = (1 / avgMarkup) * (1 - avgResist * 0.5);

    categoryStats[cat] = {
      avgMarkup,
      haggleResistance: avgResist,
      playerSatisfaction: satisfaction,
    };
  }

  // Compute item stats
  const itemPopularity: EconomyStats['itemPopularity'] = {};
  for (const [id, data] of Object.entries(itemStats)) {
    if (data.offered > 0) {
      itemPopularity[id] = {
        offered: data.offered,
        purchased: data.purchased,
        avgPrice: data.prices.length > 0 ? data.prices.reduce((a, b) => a + b, 0) / data.prices.length : 0,
        purchaseRate: data.purchased / data.offered,
      };
    }
  }

  const avgGoldSpent = totalSpent / total;
  const avgGoldEarned = totalEarned / total;
  const netGoldFlow = avgGoldEarned - avgGoldSpent;
  const inflationIndex = avgGoldEarned / Math.max(1, avgGoldSpent);

  return {
    totalSessions: total,
    avgGoldSpent,
    avgGoldEarned,
    netGoldFlow,
    inflationIndex,
    avgItemsBought: totalItems / total,
    avgHaggleRate: totalHaggleAttempts / (total * SHOPS_PER_SESSION),
    avgHaggleSuccess: totalHaggleAttempts > 0 ? totalHaggleSuccesses / totalHaggleAttempts : 0,
    merchantStats: merchantOutput,
    categoryStats,
    itemPopularity,
    priceDistribution,
  };
}

// ============================================
// Main Runner
// ============================================

async function main() {
  console.log('='.repeat(70));
  console.log('NPC TRADE ECONOMY ANALYZER');
  console.log('='.repeat(70));
  console.log(`Simulating ${SESSIONS_TO_SIMULATE.toLocaleString()} player sessions...`);
  console.log(`Shops per session: ${SHOPS_PER_SESSION}`);
  console.log('='.repeat(70));
  console.log('');

  const startTime = Date.now();

  const merchants = buildMerchantProfiles();
  console.log(`Loaded ${merchants.length} merchant profiles`);

  const results: SessionResult[] = [];

  for (let i = 0; i < SESSIONS_TO_SIMULATE; i++) {
    const sessionSeed = `${SEED}-session-${i}`;
    const result = simulateFullSession(merchants, sessionSeed);
    results.push(result);

    if ((i + 1) % 500 === 0) {
      const pct = (((i + 1) / SESSIONS_TO_SIMULATE) * 100).toFixed(0);
      process.stdout.write(`\rProgress: ${pct}% (${i + 1}/${SESSIONS_TO_SIMULATE})`);
    }
  }

  console.log('\n');

  const stats = computeStatistics(results, merchants);
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  // Print results
  console.log('='.repeat(70));
  console.log('ECONOMY OVERVIEW');
  console.log('='.repeat(70));

  const flowIndicator = stats.netGoldFlow > 0 ? 'INFLATING' : stats.netGoldFlow < -5 ? 'DEFLATING' : 'STABLE';
  console.log(`Economy Status: ${flowIndicator}`);
  console.log(`Inflation Index: ${stats.inflationIndex.toFixed(2)} (1.0 = balanced)`);
  console.log('');
  console.log(`Avg Gold Spent per Session:  ${stats.avgGoldSpent.toFixed(0)}`);
  console.log(`Avg Gold Earned per Session: ${stats.avgGoldEarned.toFixed(0)}`);
  console.log(`Net Gold Flow: ${stats.netGoldFlow > 0 ? '+' : ''}${stats.netGoldFlow.toFixed(0)} per session`);
  console.log('');
  console.log(`Avg Items Bought: ${stats.avgItemsBought.toFixed(1)}`);
  console.log(`Avg Haggle Rate: ${(stats.avgHaggleRate * 100).toFixed(0)}% of shops`);
  console.log(`Haggle Success Rate: ${(stats.avgHaggleSuccess * 100).toFixed(0)}%`);
  console.log('');

  console.log('='.repeat(70));
  console.log('CATEGORY BREAKDOWN');
  console.log('='.repeat(70));
  console.log('Category        | Avg Markup | Haggle Resist | Player Satisfaction');
  console.log('-'.repeat(70));
  for (const [cat, data] of Object.entries(stats.categoryStats)) {
    const markup = `${(data.avgMarkup * 100).toFixed(0)}%`.padStart(10);
    const resist = `${(data.haggleResistance * 100).toFixed(0)}%`.padStart(13);
    const satisfaction = `${(data.playerSatisfaction * 100).toFixed(0)}%`.padStart(19);
    console.log(`${cat.padEnd(15)} |${markup} |${resist} |${satisfaction}`);
  }
  console.log('');

  console.log('='.repeat(70));
  console.log('TOP 5 MERCHANTS BY GOLD EXTRACTED');
  console.log('='.repeat(70));
  const sortedMerchants = Object.entries(stats.merchantStats)
    .sort((a, b) => b[1].goldExtracted - a[1].goldExtracted)
    .slice(0, 5);
  for (const [slug, data] of sortedMerchants) {
    const merchant = merchants.find(m => m.slug === slug);
    console.log(`  ${merchant?.name.padEnd(20) || slug.padEnd(20)} ${data.goldExtracted.toLocaleString()} gold (${data.visits} visits, ${(data.avgPriceMarkup * 100).toFixed(0)}% markup)`);
  }
  console.log('');

  console.log('='.repeat(70));
  console.log('ITEM PURCHASE RATES');
  console.log('='.repeat(70));
  const sortedItems = Object.entries(stats.itemPopularity)
    .sort((a, b) => b[1].purchaseRate - a[1].purchaseRate);
  for (const [id, data] of sortedItems) {
    const item = SHOP_ITEMS.find(i => i.id === id);
    const rate = (data.purchaseRate * 100).toFixed(0);
    console.log(`  ${item?.name.padEnd(20) || id.padEnd(20)} ${rate}% purchase rate (avg ${data.avgPrice.toFixed(0)} gold)`);
  }
  console.log('');

  console.log('='.repeat(70));
  console.log('PRICE DISTRIBUTION');
  console.log('='.repeat(70));
  const totalPrices = stats.priceDistribution.under20 + stats.priceDistribution.under50 +
                      stats.priceDistribution.under100 + stats.priceDistribution.over100;
  console.log(`  Under 20g:  ${((stats.priceDistribution.under20 / totalPrices) * 100).toFixed(0)}%`);
  console.log(`  20-49g:     ${((stats.priceDistribution.under50 / totalPrices) * 100).toFixed(0)}%`);
  console.log(`  50-99g:     ${((stats.priceDistribution.under100 / totalPrices) * 100).toFixed(0)}%`);
  console.log(`  100g+:      ${((stats.priceDistribution.over100 / totalPrices) * 100).toFixed(0)}%`);
  console.log('');

  // Recommendations
  console.log('='.repeat(70));
  console.log('RECOMMENDATIONS');
  console.log('='.repeat(70));
  if (stats.inflationIndex > 1.2) {
    console.log('  - INFLATION WARNING: Players accumulating gold too fast');
    console.log('  - Consider: Increase base prices or reduce gold rewards');
  } else if (stats.inflationIndex < 0.8) {
    console.log('  - DEFLATION WARNING: Players gold-starved');
    console.log('  - Consider: Reduce prices or increase gold rewards');
  } else {
    console.log('  - Economy is balanced');
  }

  if (stats.avgHaggleSuccess < 0.2) {
    console.log('  - Haggle success too low, players may feel frustrated');
  } else if (stats.avgHaggleSuccess > 0.5) {
    console.log('  - Haggle success too high, reduces merchant profitability');
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
    sessionsSimulated: SESSIONS_TO_SIMULATE,
    durationSeconds: parseFloat(elapsed),
    statistics: stats,
    merchants: merchants.map(m => ({
      slug: m.slug,
      name: m.name,
      category: m.category,
      archetype: m.archetype,
      priceModifier: m.basePriceModifier,
      haggleResistance: m.haggleResistance,
    })),
  };

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2));
  console.log(`\nSaved to: ${OUTPUT_PATH}`);
}

main().catch(console.error);
