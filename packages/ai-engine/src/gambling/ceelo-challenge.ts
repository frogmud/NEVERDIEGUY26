/**
 * Ceelo Challenge System
 *
 * Player vs NPC gambling matches.
 * Used to settle debts, make quick gold, or just have fun.
 */

import { createSeededRng, type SeededRng } from '../core/seeded-rng';
import {
  simulateCeeloRoll,
  evaluateCeeloRoll,
  compareCeeloRolls,
  type NPCEconomyState,
  getNPCGold,
  calculateWealthTier,
} from '../economy/npc-economy';
import {
  type DebtState,
  payDebt,
  addDebtFromCeeloLoss,
  getDebtToNPC,
} from '../core/death-debt';

// ============================================
// Configuration
// ============================================

export interface CeeloChallengeConfig {
  // Reroll rules
  maxRerollsPerRound: number;      // Max rerolls for no_point (3)
  rerollCost: number;              // Gold cost to reroll (5)

  // Stakes
  minStake: number;                // Minimum bet (10)
  maxStakePercent: number;         // Max % of player gold (0.5)
  npcMaxStakePercent: number;      // Max % of NPC gold to risk (0.3)

  // Debt settlement
  debtClearMultiplier: number;     // Win clears this * stake of debt (1.5)
  debtAddMultiplier: number;       // Loss adds this * stake to debt (1.0)

  // Lucky number bonus
  luckyNumberBonus: number;        // Point boost for lucky number (3)

  // Side bets
  allowSideBets: boolean;
  sideBetOptions: SideBetType[];
}

export const DEFAULT_CEELO_CHALLENGE_CONFIG: CeeloChallengeConfig = {
  maxRerollsPerRound: 3,
  rerollCost: 5,
  minStake: 10,
  maxStakePercent: 0.5,
  npcMaxStakePercent: 0.3,
  debtClearMultiplier: 1.5,
  debtAddMultiplier: 1.0,
  luckyNumberBonus: 3,
  allowSideBets: true,
  sideBetOptions: ['trips', 'instant_456', 'exact_point'],
};

// ============================================
// Types
// ============================================

export type SideBetType = 'trips' | 'instant_456' | 'exact_point' | 'sweep';

export interface SideBet {
  type: SideBetType;
  amount: number;
  targetValue?: number;  // For exact_point
  payout: number;        // Multiplier
}

export interface CeeloRoundState {
  playerRoll: number[];
  npcRoll: number[];
  playerRerolls: number;
  npcRerolls: number;
  playerEval: ReturnType<typeof evaluateCeeloRoll>;
  npcEval: ReturnType<typeof evaluateCeeloRoll>;
  phase: 'rolling' | 'player_reroll' | 'npc_reroll' | 'resolved';
}

export interface CeeloChallengeState {
  config: CeeloChallengeConfig;

  // Participants
  npcSlug: string;
  npcName: string;
  npcLuckyNumber: number;
  playerLuckyNumber: number;

  // Stakes
  stake: number;
  sideBets: SideBet[];

  // Current round
  currentRound: CeeloRoundState | null;

  // Match result
  isComplete: boolean;
  winner: 'player' | 'npc' | 'push' | null;
  playerPayout: number;
  npcPayout: number;

  // Debt changes
  debtCleared: number;
  debtAdded: number;
}

export interface ChallengeResult {
  winner: 'player' | 'npc' | 'push';
  playerRoll: number[];
  npcRoll: number[];
  playerPayout: number;
  npcPayout: number;
  sideBetResults: Array<{
    bet: SideBet;
    won: boolean;
    payout: number;
  }>;
  debtCleared: number;
  debtAdded: number;
  narrative: string[];  // Flavor text for the match
}

// ============================================
// Challenge Initiation
// ============================================

export function canChallenge(
  economyState: NPCEconomyState,
  npcSlug: string,
  playerGold: number,
  stake: number,
  config: CeeloChallengeConfig = DEFAULT_CEELO_CHALLENGE_CONFIG
): { canChallenge: boolean; reason?: string } {
  const npcGold = getNPCGold(economyState, npcSlug);

  if (stake < config.minStake) {
    return { canChallenge: false, reason: `Minimum stake is ${config.minStake} gold` };
  }

  if (stake > playerGold * config.maxStakePercent) {
    return { canChallenge: false, reason: `Can't bet more than ${config.maxStakePercent * 100}% of your gold` };
  }

  if (stake > npcGold * config.npcMaxStakePercent) {
    return { canChallenge: false, reason: `${npcSlug} can't cover that stake` };
  }

  if (npcGold < config.minStake) {
    return { canChallenge: false, reason: `${npcSlug} is too broke to gamble` };
  }

  return { canChallenge: true };
}

export function createChallenge(
  npcSlug: string,
  npcName: string,
  npcLuckyNumber: number,
  playerLuckyNumber: number,
  stake: number,
  sideBets: SideBet[] = [],
  config: Partial<CeeloChallengeConfig> = {}
): CeeloChallengeState {
  return {
    config: { ...DEFAULT_CEELO_CHALLENGE_CONFIG, ...config },
    npcSlug,
    npcName,
    npcLuckyNumber,
    playerLuckyNumber,
    stake,
    sideBets,
    currentRound: null,
    isComplete: false,
    winner: null,
    playerPayout: 0,
    npcPayout: 0,
    debtCleared: 0,
    debtAdded: 0,
  };
}

// ============================================
// Rolling Logic
// ============================================

export function applyLuckyNumberBonus(
  roll: number[],
  luckyNumber: number,
  bonus: number
): { adjustedPointValue: number; luckyTriggered: boolean } {
  const baseEval = evaluateCeeloRoll(roll);

  if (baseEval.outcome === 'no_point' || luckyNumber <= 0) {
    return { adjustedPointValue: baseEval.pointValue, luckyTriggered: false };
  }

  // Check if lucky number appears in roll
  const hasLucky = roll.includes(luckyNumber);
  if (!hasLucky) {
    return { adjustedPointValue: baseEval.pointValue, luckyTriggered: false };
  }

  return {
    adjustedPointValue: baseEval.pointValue + bonus,
    luckyTriggered: true,
  };
}

export function startRound(
  state: CeeloChallengeState,
  rng: SeededRng
): CeeloChallengeState {
  const playerRoll = simulateCeeloRoll(rng);
  const npcRoll = simulateCeeloRoll(rng);

  const playerEval = evaluateCeeloRoll(playerRoll);
  const npcEval = evaluateCeeloRoll(npcRoll);

  return {
    ...state,
    currentRound: {
      playerRoll,
      npcRoll,
      playerRerolls: 0,
      npcRerolls: 0,
      playerEval,
      npcEval,
      phase: playerEval.outcome === 'no_point' ? 'player_reroll' : 'resolved',
    },
  };
}

export function playerReroll(
  state: CeeloChallengeState,
  rng: SeededRng
): CeeloChallengeState {
  if (!state.currentRound || state.currentRound.phase !== 'player_reroll') {
    return state;
  }

  if (state.currentRound.playerRerolls >= state.config.maxRerollsPerRound) {
    // Force accept current roll
    return {
      ...state,
      currentRound: {
        ...state.currentRound,
        phase: state.currentRound.npcEval.outcome === 'no_point' ? 'npc_reroll' : 'resolved',
      },
    };
  }

  const newRoll = simulateCeeloRoll(rng);
  const newEval = evaluateCeeloRoll(newRoll);

  const needsMoreRerolls = newEval.outcome === 'no_point' &&
    state.currentRound.playerRerolls + 1 < state.config.maxRerollsPerRound;

  return {
    ...state,
    currentRound: {
      ...state.currentRound,
      playerRoll: newRoll,
      playerEval: newEval,
      playerRerolls: state.currentRound.playerRerolls + 1,
      phase: needsMoreRerolls
        ? 'player_reroll'
        : (state.currentRound.npcEval.outcome === 'no_point' ? 'npc_reroll' : 'resolved'),
    },
  };
}

export function npcReroll(
  state: CeeloChallengeState,
  rng: SeededRng
): CeeloChallengeState {
  if (!state.currentRound || state.currentRound.phase !== 'npc_reroll') {
    return state;
  }

  if (state.currentRound.npcRerolls >= state.config.maxRerollsPerRound) {
    return {
      ...state,
      currentRound: {
        ...state.currentRound,
        phase: 'resolved',
      },
    };
  }

  const newRoll = simulateCeeloRoll(rng);
  const newEval = evaluateCeeloRoll(newRoll);

  const needsMoreRerolls = newEval.outcome === 'no_point' &&
    state.currentRound.npcRerolls + 1 < state.config.maxRerollsPerRound;

  return {
    ...state,
    currentRound: {
      ...state.currentRound,
      npcRoll: newRoll,
      npcEval: newEval,
      npcRerolls: state.currentRound.npcRerolls + 1,
      phase: needsMoreRerolls ? 'npc_reroll' : 'resolved',
    },
  };
}

// ============================================
// Resolution
// ============================================

export function resolveChallenge(
  state: CeeloChallengeState,
  rng: SeededRng
): { state: CeeloChallengeState; result: ChallengeResult } {
  // Run full match if not started
  let currentState = state;
  if (!currentState.currentRound) {
    currentState = startRound(currentState, rng);
  }

  // Handle rerolls
  while (currentState.currentRound?.phase === 'player_reroll') {
    currentState = playerReroll(currentState, rng);
  }
  while (currentState.currentRound?.phase === 'npc_reroll') {
    currentState = npcReroll(currentState, rng);
  }

  const round = currentState.currentRound!;
  const narrative: string[] = [];

  // Apply lucky number bonuses
  const playerLucky = applyLuckyNumberBonus(
    round.playerRoll,
    currentState.playerLuckyNumber,
    currentState.config.luckyNumberBonus
  );
  const npcLucky = applyLuckyNumberBonus(
    round.npcRoll,
    currentState.npcLuckyNumber,
    currentState.config.luckyNumberBonus
  );

  // Build narrative
  narrative.push(`You rolled [${round.playerRoll.join('-')}]`);
  if (playerLucky.luckyTriggered) {
    narrative.push(`Lucky ${currentState.playerLuckyNumber} triggered! +${currentState.config.luckyNumberBonus} to point`);
  }

  narrative.push(`${currentState.npcName} rolled [${round.npcRoll.join('-')}]`);
  if (npcLucky.luckyTriggered) {
    narrative.push(`Their lucky ${currentState.npcLuckyNumber} triggered!`);
  }

  // Determine winner
  let winner: 'player' | 'npc' | 'push';
  const playerPoint = playerLucky.adjustedPointValue;
  const npcPoint = npcLucky.adjustedPointValue;

  // Handle special cases
  if (round.playerEval.outcome === 'instant_win') {
    winner = 'player';
    narrative.push('4-5-6! Instant win!');
  } else if (round.npcEval.outcome === 'instant_win') {
    winner = 'npc';
    narrative.push(`${currentState.npcName} rolled 4-5-6! Instant win!`);
  } else if (round.playerEval.outcome === 'instant_loss') {
    winner = 'npc';
    narrative.push('1-2-3! Crapped out!');
  } else if (round.npcEval.outcome === 'instant_loss') {
    winner = 'player';
    narrative.push(`${currentState.npcName} crapped out with 1-2-3!`);
  } else if (round.playerEval.outcome === 'no_point' && round.npcEval.outcome === 'no_point') {
    winner = 'push';
    narrative.push('Both failed to set a point. Push!');
  } else if (round.playerEval.outcome === 'no_point') {
    winner = 'npc';
    narrative.push('Failed to set a point!');
  } else if (round.npcEval.outcome === 'no_point') {
    winner = 'player';
    narrative.push(`${currentState.npcName} failed to set a point!`);
  } else {
    // Compare points
    if (playerPoint > npcPoint) {
      winner = 'player';
      narrative.push(`${playerPoint} beats ${npcPoint}!`);
    } else if (npcPoint > playerPoint) {
      winner = 'npc';
      narrative.push(`${npcPoint} beats ${playerPoint}!`);
    } else {
      winner = 'push';
      narrative.push(`Both set ${playerPoint}. Push!`);
    }
  }

  // Calculate payouts
  let playerPayout = 0;
  let npcPayout = 0;
  let debtCleared = 0;
  let debtAdded = 0;

  if (winner === 'player') {
    playerPayout = currentState.stake;
    npcPayout = -currentState.stake;
    debtCleared = Math.floor(currentState.stake * currentState.config.debtClearMultiplier);
    narrative.push(`Won ${currentState.stake} gold!`);
  } else if (winner === 'npc') {
    playerPayout = -currentState.stake;
    npcPayout = currentState.stake;
    debtAdded = Math.floor(currentState.stake * currentState.config.debtAddMultiplier);
    narrative.push(`Lost ${currentState.stake} gold...`);
  } else {
    narrative.push('No gold changes hands.');
  }

  // Process side bets
  const sideBetResults: ChallengeResult['sideBetResults'] = [];
  for (const bet of currentState.sideBets) {
    const won = evaluateSideBet(bet, round.playerRoll, round.playerEval);
    const payout = won ? bet.amount * bet.payout : -bet.amount;
    playerPayout += payout;

    sideBetResults.push({ bet, won, payout });

    if (won) {
      narrative.push(`Side bet '${bet.type}' hit! +${bet.amount * bet.payout} gold`);
    }
  }

  const finalState: CeeloChallengeState = {
    ...currentState,
    isComplete: true,
    winner,
    playerPayout,
    npcPayout,
    debtCleared,
    debtAdded,
  };

  return {
    state: finalState,
    result: {
      winner,
      playerRoll: round.playerRoll,
      npcRoll: round.npcRoll,
      playerPayout,
      npcPayout,
      sideBetResults,
      debtCleared,
      debtAdded,
      narrative,
    },
  };
}

function evaluateSideBet(
  bet: SideBet,
  roll: number[],
  evaluation: ReturnType<typeof evaluateCeeloRoll>
): boolean {
  switch (bet.type) {
    case 'trips':
      return evaluation.outcome === 'trips';
    case 'instant_456':
      return evaluation.outcome === 'instant_win';
    case 'exact_point':
      return evaluation.outcome === 'point' && evaluation.pointValue === (10 + (bet.targetValue ?? 0));
    case 'sweep':
      // Win main bet + all side bets
      return evaluation.outcome === 'instant_win' || evaluation.outcome === 'trips';
    default:
      return false;
  }
}

// ============================================
// Economy/Debt Integration
// ============================================

export function applyChallengeToEconomy(
  economyState: NPCEconomyState,
  challengeState: CeeloChallengeState
): NPCEconomyState {
  if (!challengeState.isComplete) return economyState;

  const record = economyState.npcWealth.get(challengeState.npcSlug);
  if (!record) return economyState;

  const newGold = record.currentGold + challengeState.npcPayout;
  const newWealth = new Map(economyState.npcWealth);

  newWealth.set(challengeState.npcSlug, {
    ...record,
    currentGold: Math.max(0, newGold),
    wealthTier: calculateWealthTier(newGold, economyState.config),
    peakWealth: Math.max(record.peakWealth, newGold),
    lowestWealth: Math.min(record.lowestWealth, newGold),
    totalWon: challengeState.npcPayout > 0
      ? record.totalWon + challengeState.npcPayout
      : record.totalWon,
    totalLost: challengeState.npcPayout < 0
      ? record.totalLost + Math.abs(challengeState.npcPayout)
      : record.totalLost,
    matchesPlayed: record.matchesPlayed + 1,
    currentStreak: challengeState.winner === 'npc'
      ? (record.currentStreak >= 0 ? record.currentStreak + 1 : 1)
      : (record.currentStreak <= 0 ? record.currentStreak - 1 : -1),
  });

  return {
    ...economyState,
    npcWealth: newWealth,
    totalGoldCirculated: economyState.totalGoldCirculated + Math.abs(challengeState.stake),
  };
}

export function applyChallengeToDebt(
  debtState: DebtState,
  challengeState: CeeloChallengeState
): DebtState {
  if (!challengeState.isComplete) return debtState;

  let newState = debtState;

  if (challengeState.debtCleared > 0) {
    // Player won - clear some debt
    const currentDebt = getDebtToNPC(debtState, challengeState.npcSlug);
    const amountToClcear = Math.min(challengeState.debtCleared, currentDebt);
    if (amountToClcear > 0) {
      newState = payDebt(newState, challengeState.npcSlug, amountToClcear, 'ceelo_win');
    }
  }

  if (challengeState.debtAdded > 0) {
    // Player lost - add debt
    const npcRecord = debtState.npcDebts.get(challengeState.npcSlug);
    newState = addDebtFromCeeloLoss(
      newState,
      challengeState.npcSlug,
      npcRecord?.npcName ?? challengeState.npcName,
      npcRecord?.npcCategory ?? 'wanderer',
      challengeState.debtAdded
    );
  }

  return newState;
}

// ============================================
// Quick Match (single function for simple use)
// ============================================

export function quickCeeloMatch(
  npcSlug: string,
  npcName: string,
  npcLuckyNumber: number,
  playerLuckyNumber: number,
  stake: number,
  rng: SeededRng,
  config?: Partial<CeeloChallengeConfig>
): ChallengeResult {
  const challenge = createChallenge(
    npcSlug,
    npcName,
    npcLuckyNumber,
    playerLuckyNumber,
    stake,
    [],
    config
  );

  const { result } = resolveChallenge(challenge, rng);
  return result;
}
