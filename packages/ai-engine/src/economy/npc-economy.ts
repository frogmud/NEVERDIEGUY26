/**
 * NPC Economy System
 *
 * NPCs have their own gold from ceelo gambling.
 * This affects shop prices and NPC behavior toward players.
 */

import { createSeededRng, type SeededRng } from '../core/seeded-rng';

// ============================================
// Configuration
// ============================================

export interface NPCEconomyConfig {
  // Wealth thresholds
  brokeThreshold: number;          // < this = "broke" (50)
  richThreshold: number;           // > this = "rich" (500)

  // Price modifiers
  brokePriceMultiplier: number;    // Price mult when broke (0.6)
  richPriceMultiplier: number;     // Price mult when rich (1.4)
  neutralPriceMultiplier: number;  // Default (1.0)

  // Lending system
  maxLoanAmount: number;           // Max gold NPC will lend (200)
  loanInterestRate: number;        // Interest per run (0.15 = 15%)
  loanDueInRuns: number;           // Runs until loan is due (3)
  minWealthToLend: number;         // NPC must have this to lend (150)

  // Gambling challenges
  ceeloChallengeChance: number;    // Base chance to challenge (0.30)
  ceeloChallengeMinWealth: number; // Min NPC wealth to challenge (100)
  ceeloChallengeStakes: {
    low: number;                   // 20
    medium: number;                // 50
    high: number;                  // 100
  };

  // NPC-to-NPC gambling
  npcGamblingFrequency: number;    // Matches per "tick" (5)
  npcBetVariance: number;          // Bet size variance (0.3)
}

export const DEFAULT_NPC_ECONOMY_CONFIG: NPCEconomyConfig = {
  brokeThreshold: 50,
  richThreshold: 500,
  brokePriceMultiplier: 0.6,
  richPriceMultiplier: 1.4,
  neutralPriceMultiplier: 1.0,
  maxLoanAmount: 200,
  loanInterestRate: 0.15,
  loanDueInRuns: 3,
  minWealthToLend: 150,
  ceeloChallengeChance: 0.30,
  ceeloChallengeMinWealth: 100,
  ceeloChallengeStakes: {
    low: 20,
    medium: 50,
    high: 100,
  },
  npcGamblingFrequency: 5,
  npcBetVariance: 0.3,
};

// ============================================
// Types
// ============================================

export type WealthTier = 'broke' | 'poor' | 'neutral' | 'comfortable' | 'rich';

export interface NPCWealthRecord {
  npcSlug: string;
  npcName: string;
  npcCategory: string;

  // Current state
  currentGold: number;
  wealthTier: WealthTier;

  // History
  peakWealth: number;
  lowestWealth: number;
  totalWon: number;
  totalLost: number;
  matchesPlayed: number;
  currentStreak: number;        // Positive = wins, negative = losses

  // Lending
  loansGiven: LoanRecord[];
  loansReceived: LoanRecord[];
}

export interface LoanRecord {
  lenderSlug: string;
  borrowerSlug: string;
  principal: number;
  interestRate: number;
  totalOwed: number;
  runIssued: number;
  runDue: number;
  isPaid: boolean;
}

export interface GamblingMatch {
  player1Slug: string;
  player2Slug: string;
  winnerSlug: string;
  stake: number;
  player1Roll: number[];
  player2Roll: number[];
  timestamp: number;
}

export interface NPCEconomyState {
  config: NPCEconomyConfig;
  npcWealth: Map<string, NPCWealthRecord>;
  matchHistory: GamblingMatch[];
  currentRun: number;
  totalGoldCirculated: number;
}

// ============================================
// State Management
// ============================================

export function createNPCEconomyState(
  config: Partial<NPCEconomyConfig> = {}
): NPCEconomyState {
  return {
    config: { ...DEFAULT_NPC_ECONOMY_CONFIG, ...config },
    npcWealth: new Map(),
    matchHistory: [],
    currentRun: 0,
    totalGoldCirculated: 0,
  };
}

export function registerNPC(
  state: NPCEconomyState,
  npcSlug: string,
  npcName: string,
  npcCategory: string,
  startingGold: number
): NPCEconomyState {
  const wealthTier = calculateWealthTier(startingGold, state.config);

  const record: NPCWealthRecord = {
    npcSlug,
    npcName,
    npcCategory,
    currentGold: startingGold,
    wealthTier,
    peakWealth: startingGold,
    lowestWealth: startingGold,
    totalWon: 0,
    totalLost: 0,
    matchesPlayed: 0,
    currentStreak: 0,
    loansGiven: [],
    loansReceived: [],
  };

  return {
    ...state,
    npcWealth: new Map(state.npcWealth).set(npcSlug, record),
  };
}

export function getWealthRecord(
  state: NPCEconomyState,
  npcSlug: string
): NPCWealthRecord | undefined {
  return state.npcWealth.get(npcSlug);
}

export function getNPCGold(state: NPCEconomyState, npcSlug: string): number {
  return state.npcWealth.get(npcSlug)?.currentGold ?? 0;
}

// ============================================
// Wealth Tier Calculation
// ============================================

export function calculateWealthTier(
  gold: number,
  config: NPCEconomyConfig
): WealthTier {
  if (gold < config.brokeThreshold) return 'broke';
  if (gold < config.brokeThreshold * 2) return 'poor';
  if (gold < config.richThreshold / 2) return 'neutral';
  if (gold < config.richThreshold) return 'comfortable';
  return 'rich';
}

export function getPriceMultiplier(
  state: NPCEconomyState,
  npcSlug: string
): number {
  const record = state.npcWealth.get(npcSlug);
  if (!record) return state.config.neutralPriceMultiplier;

  switch (record.wealthTier) {
    case 'broke':
    case 'poor':
      return state.config.brokePriceMultiplier;
    case 'rich':
      return state.config.richPriceMultiplier;
    default:
      return state.config.neutralPriceMultiplier;
  }
}

// ============================================
// Gambling (NPC vs NPC)
// ============================================

export function simulateCeeloRoll(rng: SeededRng): number[] {
  return [
    Math.floor(rng.random('d1') * 6) + 1,
    Math.floor(rng.random('d2') * 6) + 1,
    Math.floor(rng.random('d3') * 6) + 1,
  ];
}

export function evaluateCeeloRoll(dice: number[]): {
  outcome: 'instant_win' | 'instant_loss' | 'point' | 'no_point' | 'trips';
  pointValue: number;
} {
  const sorted = [...dice].sort((a, b) => a - b);
  const [d1, d2, d3] = sorted;

  // 4-5-6 = instant win
  if (d1 === 4 && d2 === 5 && d3 === 6) {
    return { outcome: 'instant_win', pointValue: 100 };
  }

  // 1-2-3 = instant loss
  if (d1 === 1 && d2 === 2 && d3 === 3) {
    return { outcome: 'instant_loss', pointValue: 0 };
  }

  // Trips
  if (d1 === d2 && d2 === d3) {
    return { outcome: 'trips', pointValue: 50 + d1 };
  }

  // Point (pair + different)
  if (d1 === d2) {
    return { outcome: 'point', pointValue: 10 + d3 };
  }
  if (d2 === d3) {
    return { outcome: 'point', pointValue: 10 + d1 };
  }
  if (d1 === d3) {
    return { outcome: 'point', pointValue: 10 + d2 };
  }

  // No point - would need reroll
  return { outcome: 'no_point', pointValue: -1 };
}

export function compareCeeloRolls(
  roll1: number[],
  roll2: number[]
): 1 | 2 | 0 {
  const eval1 = evaluateCeeloRoll(roll1);
  const eval2 = evaluateCeeloRoll(roll2);

  // Handle no points (simplified - in real game would reroll)
  if (eval1.outcome === 'no_point' && eval2.outcome === 'no_point') return 0;
  if (eval1.outcome === 'no_point') return 2;
  if (eval2.outcome === 'no_point') return 1;

  // Compare point values
  if (eval1.pointValue > eval2.pointValue) return 1;
  if (eval2.pointValue > eval1.pointValue) return 2;
  return 0;
}

export function processGamblingMatch(
  state: NPCEconomyState,
  player1Slug: string,
  player2Slug: string,
  stake: number,
  rng: SeededRng
): { state: NPCEconomyState; match: GamblingMatch } {
  const p1Record = state.npcWealth.get(player1Slug);
  const p2Record = state.npcWealth.get(player2Slug);

  if (!p1Record || !p2Record) {
    throw new Error('Both NPCs must be registered');
  }

  // Ensure both can afford stake
  const actualStake = Math.min(stake, p1Record.currentGold, p2Record.currentGold);
  if (actualStake <= 0) {
    throw new Error('Insufficient funds for match');
  }

  const roll1 = simulateCeeloRoll(rng);
  const roll2 = simulateCeeloRoll(rng);
  const result = compareCeeloRolls(roll1, roll2);

  let winnerSlug: string;
  let loserSlug: string;

  if (result === 0) {
    // Push - no money changes hands
    const match: GamblingMatch = {
      player1Slug,
      player2Slug,
      winnerSlug: '',
      stake: 0,
      player1Roll: roll1,
      player2Roll: roll2,
      timestamp: Date.now(),
    };
    return {
      state: {
        ...state,
        matchHistory: [...state.matchHistory, match],
      },
      match,
    };
  }

  winnerSlug = result === 1 ? player1Slug : player2Slug;
  loserSlug = result === 1 ? player2Slug : player1Slug;

  // Update wealth records
  const newWealth = new Map(state.npcWealth);

  const winnerRecord = newWealth.get(winnerSlug)!;
  const loserRecord = newWealth.get(loserSlug)!;

  const newWinnerGold = winnerRecord.currentGold + actualStake;
  const newLoserGold = loserRecord.currentGold - actualStake;

  newWealth.set(winnerSlug, {
    ...winnerRecord,
    currentGold: newWinnerGold,
    wealthTier: calculateWealthTier(newWinnerGold, state.config),
    peakWealth: Math.max(winnerRecord.peakWealth, newWinnerGold),
    totalWon: winnerRecord.totalWon + actualStake,
    matchesPlayed: winnerRecord.matchesPlayed + 1,
    currentStreak: winnerRecord.currentStreak >= 0
      ? winnerRecord.currentStreak + 1
      : 1,
  });

  newWealth.set(loserSlug, {
    ...loserRecord,
    currentGold: newLoserGold,
    wealthTier: calculateWealthTier(newLoserGold, state.config),
    lowestWealth: Math.min(loserRecord.lowestWealth, newLoserGold),
    totalLost: loserRecord.totalLost + actualStake,
    matchesPlayed: loserRecord.matchesPlayed + 1,
    currentStreak: loserRecord.currentStreak <= 0
      ? loserRecord.currentStreak - 1
      : -1,
  });

  const match: GamblingMatch = {
    player1Slug,
    player2Slug,
    winnerSlug,
    stake: actualStake,
    player1Roll: roll1,
    player2Roll: roll2,
    timestamp: Date.now(),
  };

  return {
    state: {
      ...state,
      npcWealth: newWealth,
      matchHistory: [...state.matchHistory, match],
      totalGoldCirculated: state.totalGoldCirculated + actualStake,
    },
    match,
  };
}

// ============================================
// Lending System
// ============================================

export function canLend(
  state: NPCEconomyState,
  lenderSlug: string,
  amount: number
): boolean {
  const record = state.npcWealth.get(lenderSlug);
  if (!record) return false;

  return (
    record.currentGold >= state.config.minWealthToLend &&
    record.currentGold - amount >= state.config.brokeThreshold &&
    amount <= state.config.maxLoanAmount
  );
}

export function issueLoan(
  state: NPCEconomyState,
  lenderSlug: string,
  borrowerSlug: string,
  amount: number
): NPCEconomyState {
  if (!canLend(state, lenderSlug, amount)) {
    return state;
  }

  const lender = state.npcWealth.get(lenderSlug)!;
  const borrower = state.npcWealth.get(borrowerSlug);

  const loan: LoanRecord = {
    lenderSlug,
    borrowerSlug,
    principal: amount,
    interestRate: state.config.loanInterestRate,
    totalOwed: amount,
    runIssued: state.currentRun,
    runDue: state.currentRun + state.config.loanDueInRuns,
    isPaid: false,
  };

  const newWealth = new Map(state.npcWealth);

  // Deduct from lender
  newWealth.set(lenderSlug, {
    ...lender,
    currentGold: lender.currentGold - amount,
    wealthTier: calculateWealthTier(
      lender.currentGold - amount,
      state.config
    ),
    loansGiven: [...lender.loansGiven, loan],
  });

  // Add to borrower (if NPC, otherwise this is a player loan)
  if (borrower) {
    newWealth.set(borrowerSlug, {
      ...borrower,
      currentGold: borrower.currentGold + amount,
      wealthTier: calculateWealthTier(
        borrower.currentGold + amount,
        state.config
      ),
      loansReceived: [...borrower.loansReceived, loan],
    });
  }

  return {
    ...state,
    npcWealth: newWealth,
  };
}

export function applyLoanInterest(state: NPCEconomyState): NPCEconomyState {
  const newWealth = new Map(state.npcWealth);

  for (const [slug, record] of newWealth) {
    const updatedLoansGiven = record.loansGiven.map((loan) => {
      if (loan.isPaid) return loan;

      const interest = Math.floor(loan.totalOwed * loan.interestRate);
      return {
        ...loan,
        totalOwed: loan.totalOwed + interest,
      };
    });

    newWealth.set(slug, {
      ...record,
      loansGiven: updatedLoansGiven,
    });
  }

  return {
    ...state,
    npcWealth: newWealth,
    currentRun: state.currentRun + 1,
  };
}

// ============================================
// Challenge System
// ============================================

export function shouldChallengePlayer(
  state: NPCEconomyState,
  npcSlug: string,
  rng: SeededRng
): { shouldChallenge: boolean; suggestedStake: number } {
  const record = state.npcWealth.get(npcSlug);
  if (!record) return { shouldChallenge: false, suggestedStake: 0 };

  if (record.currentGold < state.config.ceeloChallengeMinWealth) {
    return { shouldChallenge: false, suggestedStake: 0 };
  }

  const roll = rng.random('challengeChance');
  if (roll > state.config.ceeloChallengeChance) {
    return { shouldChallenge: false, suggestedStake: 0 };
  }

  // Determine stake based on wealth
  let suggestedStake: number;
  if (record.wealthTier === 'rich') {
    suggestedStake = state.config.ceeloChallengeStakes.high;
  } else if (record.wealthTier === 'comfortable') {
    suggestedStake = state.config.ceeloChallengeStakes.medium;
  } else {
    suggestedStake = state.config.ceeloChallengeStakes.low;
  }

  return { shouldChallenge: true, suggestedStake };
}

// ============================================
// Batch Simulation
// ============================================

export function simulateNPCGamblingRound(
  state: NPCEconomyState,
  rng: SeededRng
): NPCEconomyState {
  const npcs = Array.from(state.npcWealth.keys());
  if (npcs.length < 2) return state;

  let currentState = state;

  for (let i = 0; i < state.config.npcGamblingFrequency; i++) {
    // Pick two random NPCs
    const shuffled = [...npcs].sort(() => rng.random('shuffle') - 0.5);
    const p1 = shuffled[0];
    const p2 = shuffled[1];

    const p1Gold = getNPCGold(currentState, p1);
    const p2Gold = getNPCGold(currentState, p2);

    // Both need enough gold to gamble (broke protection)
    const minGold = Math.min(p1Gold, p2Gold);
    if (minGold < 50) continue;

    // Calculate stake based on MINIMUM wealth (protects the poorer player)
    // Stake is 5-15% of the poorer player's wealth
    const baseStake = Math.floor(minGold * 0.08);
    const variance = (rng.random('stakeVar') - 0.5) * 2 * state.config.npcBetVariance;
    const stake = Math.max(10, Math.min(50, Math.floor(baseStake * (1 + variance))));

    try {
      const { state: newState } = processGamblingMatch(
        currentState,
        p1,
        p2,
        stake,
        rng
      );
      currentState = newState;
    } catch {
      // Skip if match fails
      continue;
    }
  }

  return currentState;
}

// ============================================
// Analysis & Reporting
// ============================================

export interface EconomySnapshot {
  timestamp: number;
  run: number;
  totalWealth: number;
  avgWealth: number;
  giniCoefficient: number;
  wealthDistribution: Record<WealthTier, number>;
  topEarners: Array<{ slug: string; gold: number }>;
  bottomEarners: Array<{ slug: string; gold: number }>;
}

export function calculateGiniCoefficient(
  state: NPCEconomyState
): number {
  const wealths = Array.from(state.npcWealth.values())
    .map((r) => r.currentGold)
    .sort((a, b) => a - b);

  const n = wealths.length;
  if (n === 0) return 0;

  const totalWealth = wealths.reduce((a, b) => a + b, 0);
  if (totalWealth === 0) return 0;

  let sumOfDifferences = 0;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      sumOfDifferences += Math.abs(wealths[i] - wealths[j]);
    }
  }

  return sumOfDifferences / (2 * n * totalWealth);
}

export function getEconomySnapshot(
  state: NPCEconomyState
): EconomySnapshot {
  const records = Array.from(state.npcWealth.values());
  const totalWealth = records.reduce((a, r) => a + r.currentGold, 0);

  const wealthDistribution: Record<WealthTier, number> = {
    broke: 0,
    poor: 0,
    neutral: 0,
    comfortable: 0,
    rich: 0,
  };

  for (const r of records) {
    wealthDistribution[r.wealthTier]++;
  }

  const sorted = [...records].sort((a, b) => b.currentGold - a.currentGold);

  return {
    timestamp: Date.now(),
    run: state.currentRun,
    totalWealth,
    avgWealth: records.length > 0 ? totalWealth / records.length : 0,
    giniCoefficient: calculateGiniCoefficient(state),
    wealthDistribution,
    topEarners: sorted.slice(0, 5).map((r) => ({
      slug: r.npcSlug,
      gold: r.currentGold,
    })),
    bottomEarners: sorted.slice(-5).reverse().map((r) => ({
      slug: r.npcSlug,
      gold: r.currentGold,
    })),
  };
}

export function getLeaderboard(
  state: NPCEconomyState
): Array<{
  rank: number;
  slug: string;
  name: string;
  gold: number;
  tier: WealthTier;
  winRate: number;
}> {
  const records = Array.from(state.npcWealth.values());
  const sorted = [...records].sort((a, b) => b.currentGold - a.currentGold);

  return sorted.map((r, i) => ({
    rank: i + 1,
    slug: r.npcSlug,
    name: r.npcName,
    gold: r.currentGold,
    tier: r.wealthTier,
    winRate: r.matchesPlayed > 0
      ? r.totalWon / (r.totalWon + r.totalLost)
      : 0,
  }));
}
