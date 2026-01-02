/**
 * Cee-lo Match Orchestration
 *
 * Manages the lifecycle of a Cee-lo match including:
 * - Match creation and initialization
 * - Turn order determination and reset
 * - Round execution
 * - Player quit handling
 * - Match result generation
 */

import { createSeededRng, type SeededRng } from '../../core/seeded-rng';
import {
  rollUntilValid,
  compareOutcomes,
  determineTurnOrder,
  isBadBeat,
  isPerfectRound,
  formatRoll,
  formatOutcome,
} from './dice';
import type {
  CeeloPlayer,
  PlayerMatchState,
  MatchConfig,
  MatchState,
  MatchResult,
  RoundResult,
  PlayerStanding,
  CeeloEvent,
  CeeloEventType,
  CeeloEventHandler,
  BetCalculation,
  BetContext,
  DieValue,
  DEFAULT_MATCH_CONFIG,
} from './types';

// ============================================
// Match Creation
// ============================================

/**
 * Create initial player match state
 */
function createPlayerMatchState(playerId: string): PlayerMatchState {
  return {
    playerId,
    wins: 0,
    losses: 0,
    pushes: 0,
    currentStreak: 0,
    rollStats: {
      instantWins: 0,
      instantLosses: 0,
      trips: 0,
      points: {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
        6: 0,
      } as Record<DieValue, number>,
      totalRerolls: 0,
    },
    goldWon: 0,
    goldLost: 0,
    isActive: true,
  };
}

/**
 * Create a new match
 */
export function createMatch(
  matchId: string,
  players: CeeloPlayer[],
  config: Partial<MatchConfig> = {}
): MatchState {
  const fullConfig: MatchConfig = {
    seed: config.seed ?? matchId,
    maxRounds: config.maxRounds,
    targetWins: config.targetWins,
    rollsPerOrderReset: config.rollsPerOrderReset ?? 30,
    enableQuits: config.enableQuits ?? true,
    baseBets: config.baseBets ?? {
      traveler: 10,
      wanderer: 15,
      pantheon: 20,
      cosmic_horror: 5,
    },
  };

  const rng = createSeededRng(fullConfig.seed);
  const playerIds = players.map(p => p.id);
  const turnOrder = determineTurnOrder(rng, playerIds);

  const playerStates: Record<string, PlayerMatchState> = {};
  for (const player of players) {
    playerStates[player.id] = createPlayerMatchState(player.id);
  }

  return {
    matchId,
    config: fullConfig,
    status: 'pending',
    players,
    playerStates,
    activePlayers: new Set(playerIds),
    turnOrder,
    currentShooterIndex: 0,
    rounds: [],
    totalRolls: 0,
    rollsSinceOrderReset: 0,
    rng,
    startTime: Date.now(),
  };
}

// ============================================
// Event Creation
// ============================================

function createEvent(
  type: CeeloEventType,
  state: MatchState,
  primaryPlayerId: string,
  data: Record<string, unknown> = {},
  secondaryPlayerId?: string,
  emotionalWeight: number = 3
): CeeloEvent {
  return {
    type,
    matchId: state.matchId,
    roundNumber: state.rounds.length + 1,
    timestamp: Date.now(),
    primaryPlayerId,
    secondaryPlayerId,
    data,
    emotionalWeight,
  };
}

// ============================================
// Betting Calculations
// ============================================

/**
 * Calculate bet amount based on player state and context
 */
export function calculateBet(context: BetContext, config: MatchConfig): BetCalculation {
  const { playerState, opponentState, playerCategory } = context;
  const baseBet = config.baseBets[playerCategory];

  // Streak multiplier: 1.0 + (streak * 0.2), max 2.0
  const streakMultiplier = Math.min(2.0, 1.0 + Math.max(0, playerState.currentStreak) * 0.2);

  // Confidence bonus: based on win rate vs opponent
  // If player has more wins than losses, boost bet
  const winDiff = playerState.wins - playerState.losses;
  const opponentWinDiff = opponentState.wins - opponentState.losses;
  const confidenceBonus = winDiff > opponentWinDiff ? 1.2 : 1.0;

  // Tilt penalty: losing streaks make players bet recklessly (1.5x)
  const tiltPenalty = playerState.currentStreak <= -3 ? 1.5 : 1.0;

  const finalBet = Math.round(baseBet * streakMultiplier * confidenceBonus * tiltPenalty);

  return {
    baseBet,
    streakMultiplier,
    confidenceBonus,
    tiltPenalty,
    finalBet,
  };
}

// ============================================
// Turn Order Management
// ============================================

/**
 * Reset turn order (called every N rolls)
 */
function resetTurnOrder(state: MatchState): MatchState {
  const activePlayerIds = Array.from(state.activePlayers);
  const newOrder = determineTurnOrder(state.rng, activePlayerIds);

  return {
    ...state,
    turnOrder: newOrder,
    currentShooterIndex: 0,
    rollsSinceOrderReset: 0,
  };
}

/**
 * Get current shooter
 */
function getCurrentShooter(state: MatchState): CeeloPlayer | null {
  const shooterId = state.turnOrder[state.currentShooterIndex];
  return state.players.find(p => p.id === shooterId) ?? null;
}

/**
 * Advance to next shooter
 */
function advanceShooter(state: MatchState): MatchState {
  let nextIndex = (state.currentShooterIndex + 1) % state.turnOrder.length;

  // Skip inactive players
  while (!state.activePlayers.has(state.turnOrder[nextIndex])) {
    nextIndex = (nextIndex + 1) % state.turnOrder.length;
    // Safety check to prevent infinite loop
    if (nextIndex === state.currentShooterIndex) break;
  }

  return {
    ...state,
    currentShooterIndex: nextIndex,
  };
}

// ============================================
// Round Execution
// ============================================

/**
 * Update player stats after a roll
 */
function updateRollStats(
  playerState: PlayerMatchState,
  rollResult: ReturnType<typeof rollUntilValid>
): PlayerMatchState {
  const { finalOutcome, rerollCount } = rollResult;
  const newStats = { ...playerState.rollStats };

  newStats.totalRerolls += rerollCount;

  switch (finalOutcome.type) {
    case 'instant_win':
      newStats.instantWins++;
      break;
    case 'instant_loss':
      newStats.instantLosses++;
      break;
    case 'trips':
      newStats.trips++;
      break;
    case 'point':
      newStats.points[finalOutcome.value]++;
      break;
  }

  return {
    ...playerState,
    rollStats: newStats,
  };
}

/**
 * Update player state after win/loss
 */
function updatePlayerResult(
  playerState: PlayerMatchState,
  result: 'win' | 'loss' | 'push',
  goldChange: number
): PlayerMatchState {
  const updated = { ...playerState };

  if (result === 'win') {
    updated.wins++;
    updated.goldWon += goldChange;
    updated.currentStreak = Math.max(1, updated.currentStreak + 1);
  } else if (result === 'loss') {
    updated.losses++;
    updated.goldLost += goldChange;
    updated.currentStreak = Math.min(-1, updated.currentStreak - 1);
  } else {
    updated.pushes++;
    // Streak unchanged on push
  }

  return updated;
}

/**
 * Execute a single round of Cee-lo
 */
export function executeRound(
  state: MatchState,
  eventHandler?: CeeloEventHandler
): { state: MatchState; shouldContinue: boolean } {
  // Check if we need to reset turn order
  if (state.rollsSinceOrderReset >= state.config.rollsPerOrderReset) {
    state = resetTurnOrder(state);
    eventHandler?.(createEvent('turn_order_reset', state, state.turnOrder[0], {
      newOrder: state.turnOrder,
    }));
  }

  // Get current shooter and opponent
  const shooter = getCurrentShooter(state);
  if (!shooter) {
    return { state, shouldContinue: false };
  }

  // For simplicity, shooter plays against the next active player in turn order
  const activeOpponents = state.turnOrder.filter(
    id => id !== shooter.id && state.activePlayers.has(id)
  );

  if (activeOpponents.length === 0) {
    return { state: { ...state, status: 'completed' }, shouldContinue: false };
  }

  const opponentId = activeOpponents[0];
  const opponent = state.players.find(p => p.id === opponentId)!;

  // Emit round started event
  const roundNumber = state.rounds.length + 1;
  eventHandler?.(createEvent('round_started', state, shooter.id, {
    roundNumber,
    shooterId: shooter.id,
    opponentId: opponent.id,
  }));

  // Shooter rolls
  const shooterRoll = rollUntilValid(state.rng, shooter.id, state.totalRolls);
  state.totalRolls += shooterRoll.rollHistory.length;
  state.rollsSinceOrderReset += shooterRoll.rollHistory.length;

  eventHandler?.(createEvent('dice_rolled', state, shooter.id, {
    roll: formatRoll(shooterRoll.rollHistory[shooterRoll.rollHistory.length - 1]),
    outcome: formatOutcome(shooterRoll.finalOutcome),
    rerolls: shooterRoll.rerollCount,
  }));

  // Opponent rolls
  const opponentRoll = rollUntilValid(state.rng, opponent.id, state.totalRolls);
  state.totalRolls += opponentRoll.rollHistory.length;
  state.rollsSinceOrderReset += opponentRoll.rollHistory.length;

  eventHandler?.(createEvent('dice_rolled', state, opponent.id, {
    roll: formatRoll(opponentRoll.rollHistory[opponentRoll.rollHistory.length - 1]),
    outcome: formatOutcome(opponentRoll.finalOutcome),
    rerolls: opponentRoll.rerollCount,
  }));

  // Compare outcomes
  const comparison = compareOutcomes(shooterRoll.finalOutcome, opponentRoll.finalOutcome);

  // Calculate bet
  const shooterBetContext: BetContext = {
    playerState: state.playerStates[shooter.id],
    opponentState: state.playerStates[opponent.id],
    playerCategory: shooter.category,
  };
  const betCalc = calculateBet(shooterBetContext, state.config);
  const goldExchanged = betCalc.finalBet;

  // Determine winner/loser
  let winnerId: string | null = null;
  let loserId: string | null = null;
  const events: CeeloEvent[] = [];

  if (comparison === 1) {
    // Shooter wins
    winnerId = shooter.id;
    loserId = opponent.id;
  } else if (comparison === -1) {
    // Opponent wins
    winnerId = opponent.id;
    loserId = shooter.id;
  }
  // comparison === 0 is a push

  // Update player states
  let newPlayerStates = { ...state.playerStates };

  // Update roll stats
  newPlayerStates[shooter.id] = updateRollStats(newPlayerStates[shooter.id], shooterRoll);
  newPlayerStates[opponent.id] = updateRollStats(newPlayerStates[opponent.id], opponentRoll);

  // Update win/loss
  if (winnerId && loserId) {
    const winnerPrevStreak = newPlayerStates[winnerId].currentStreak;
    newPlayerStates[winnerId] = updatePlayerResult(newPlayerStates[winnerId], 'win', goldExchanged);
    newPlayerStates[loserId] = updatePlayerResult(newPlayerStates[loserId], 'loss', goldExchanged);

    // Check for special events
    const winnerOutcome = winnerId === shooter.id ? shooterRoll.finalOutcome : opponentRoll.finalOutcome;
    const loserOutcome = loserId === shooter.id ? shooterRoll.finalOutcome : opponentRoll.finalOutcome;

    // Perfect round
    if (isPerfectRound(winnerOutcome, loserOutcome)) {
      const perfectEvent = createEvent('perfect_round', state, winnerId, {
        winnerId,
        loserId,
      }, loserId, 8);
      events.push(perfectEvent);
      eventHandler?.(perfectEvent);
    }

    // Bad beat
    if (isBadBeat(loserOutcome, winnerOutcome)) {
      const badBeatEvent = createEvent('bad_beat', state, loserId, {
        loserRoll: formatOutcome(loserOutcome),
        winnerRoll: formatOutcome(winnerOutcome),
      }, winnerId, 7);
      events.push(badBeatEvent);
      eventHandler?.(badBeatEvent);
    }

    // Streak events
    const newStreak = newPlayerStates[winnerId].currentStreak;
    if (newStreak === 3) {
      const streakEvent = createEvent('streak_started', state, winnerId, { streak: 3 }, undefined, 5);
      events.push(streakEvent);
      eventHandler?.(streakEvent);
    } else if (newStreak > 3 && newStreak > winnerPrevStreak) {
      const streakEvent = createEvent('streak_extended', state, winnerId, { streak: newStreak }, undefined, 6);
      events.push(streakEvent);
      eventHandler?.(streakEvent);
    }

    // Streak broken
    const loserPrevStreak = state.playerStates[loserId].currentStreak;
    if (loserPrevStreak >= 3) {
      const brokenEvent = createEvent('streak_broken', state, loserId, {
        previousStreak: loserPrevStreak,
        brokenBy: winnerId,
      }, winnerId, 7);
      events.push(brokenEvent);
      eventHandler?.(brokenEvent);
    }

    // Upset victory (beat someone on a streak)
    if (loserPrevStreak >= 3) {
      const upsetEvent = createEvent('upset_victory', state, winnerId, {
        upsetStreak: loserPrevStreak,
      }, loserId, 6);
      events.push(upsetEvent);
      eventHandler?.(upsetEvent);
    }
  } else {
    // Push
    newPlayerStates[shooter.id] = updatePlayerResult(newPlayerStates[shooter.id], 'push', 0);
    newPlayerStates[opponent.id] = updatePlayerResult(newPlayerStates[opponent.id], 'push', 0);
  }

  // Create round result
  const roundResult: RoundResult = {
    roundNumber,
    shooterId: shooter.id,
    shooterRoll,
    opponentRolls: { [opponent.id]: opponentRoll },
    winnerId,
    loserId,
    goldExchanged: winnerId ? goldExchanged : 0,
    events,
  };

  // Emit round ended event
  eventHandler?.(createEvent('round_ended', state, winnerId ?? shooter.id, {
    roundNumber,
    winnerId,
    loserId,
    goldExchanged: winnerId ? goldExchanged : 0,
  }, loserId ?? undefined, 4));

  // Determine next shooter
  let newShooterIndex = state.currentShooterIndex;
  if (winnerId !== shooter.id) {
    // Shooter lost or pushed, advance to next
    newShooterIndex = (state.currentShooterIndex + 1) % state.turnOrder.length;
    // Skip inactive players
    while (!state.activePlayers.has(state.turnOrder[newShooterIndex])) {
      newShooterIndex = (newShooterIndex + 1) % state.turnOrder.length;
    }
  }
  // If shooter won, they stay as shooter (win streak continues)

  // Check end conditions
  let shouldContinue = true;
  let newStatus = state.status;

  if (state.config.maxRounds && roundNumber >= state.config.maxRounds) {
    shouldContinue = false;
    newStatus = 'completed';
  }

  if (state.config.targetWins) {
    const anyoneWon = Object.values(newPlayerStates).some(
      ps => ps.wins >= state.config.targetWins!
    );
    if (anyoneWon) {
      shouldContinue = false;
      newStatus = 'completed';
    }
  }

  if (state.activePlayers.size < 2) {
    shouldContinue = false;
    newStatus = 'completed';
  }

  const newState: MatchState = {
    ...state,
    status: newStatus === 'completed' ? 'completed' : 'in_progress',
    playerStates: newPlayerStates,
    rounds: [...state.rounds, roundResult],
    currentShooterIndex: newShooterIndex,
  };

  return { state: newState, shouldContinue };
}

// ============================================
// Player Quit Handling
// ============================================

/**
 * Handle a player quitting the match
 */
export function handlePlayerQuit(
  state: MatchState,
  playerId: string,
  eventHandler?: CeeloEventHandler
): MatchState {
  if (!state.activePlayers.has(playerId)) {
    return state;
  }

  const newActivePlayers = new Set(state.activePlayers);
  newActivePlayers.delete(playerId);

  const newPlayerStates = { ...state.playerStates };
  newPlayerStates[playerId] = {
    ...newPlayerStates[playerId],
    isActive: false,
    quitRound: state.rounds.length,
  };

  // Emit quit event
  eventHandler?.(createEvent('player_quit', state, playerId, {
    quitRound: state.rounds.length,
    playerStats: newPlayerStates[playerId],
  }, undefined, 5));

  // Check if match should end
  let newStatus = state.status;
  if (newActivePlayers.size < 2) {
    newStatus = 'completed';
  }

  // Update shooter if quitter was current shooter
  let newShooterIndex = state.currentShooterIndex;
  if (state.turnOrder[state.currentShooterIndex] === playerId) {
    newShooterIndex = (newShooterIndex + 1) % state.turnOrder.length;
    while (!newActivePlayers.has(state.turnOrder[newShooterIndex]) && newActivePlayers.size > 0) {
      newShooterIndex = (newShooterIndex + 1) % state.turnOrder.length;
    }
  }

  return {
    ...state,
    status: newStatus,
    activePlayers: newActivePlayers,
    playerStates: newPlayerStates,
    currentShooterIndex: newShooterIndex,
  };
}

// ============================================
// Match Result Generation
// ============================================

/**
 * Generate final match result
 */
export function generateMatchResult(state: MatchState): MatchResult {
  const endTime = Date.now();

  // Generate standings sorted by wins
  const standings: PlayerStanding[] = state.players.map(player => {
    const ps = state.playerStates[player.id];
    const totalGames = ps.wins + ps.losses;
    const winRate = totalGames > 0 ? ps.wins / totalGames : 0;

    // Calculate best streak from round history
    let bestStreak = 0;
    let currentStreak = 0;
    for (const round of state.rounds) {
      if (round.winnerId === player.id) {
        currentStreak++;
        bestStreak = Math.max(bestStreak, currentStreak);
      } else if (round.loserId === player.id) {
        currentStreak = 0;
      }
    }

    return {
      rank: 0, // Will be set after sorting
      playerId: player.id,
      playerName: player.name,
      wins: ps.wins,
      losses: ps.losses,
      winRate,
      netGold: ps.goldWon - ps.goldLost,
      bestStreak,
      didQuit: !ps.isActive,
    };
  });

  // Sort by wins (desc), then by net gold (desc)
  standings.sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins;
    return b.netGold - a.netGold;
  });

  // Assign ranks
  standings.forEach((s, i) => {
    s.rank = i + 1;
  });

  // Collect notable events
  const notableEvents = state.rounds
    .flatMap(r => r.events)
    .filter(e => e.emotionalWeight >= 6);

  // Calculate gold changes
  const goldChanges: Record<string, number> = {};
  for (const [id, ps] of Object.entries(state.playerStates)) {
    goldChanges[id] = ps.goldWon - ps.goldLost;
  }

  return {
    matchId: state.matchId,
    startTime: state.startTime,
    endTime,
    totalRounds: state.rounds.length,
    totalRolls: state.totalRolls,
    standings,
    playerStats: state.playerStates,
    notableEvents,
    goldChanges,
  };
}

// ============================================
// Full Match Execution
// ============================================

/**
 * Run a complete match from start to finish
 */
export async function runFullMatch(
  matchId: string,
  players: CeeloPlayer[],
  config?: Partial<MatchConfig>,
  eventHandler?: CeeloEventHandler
): Promise<MatchResult> {
  let state = createMatch(matchId, players, config);

  // Start event
  eventHandler?.(createEvent('match_started', state, players[0].id, {
    players: players.map(p => ({ id: p.id, name: p.name })),
    turnOrder: state.turnOrder,
  }));

  eventHandler?.(createEvent('turn_order_set', state, state.turnOrder[0], {
    turnOrder: state.turnOrder,
  }));

  state = { ...state, status: 'in_progress' };

  // Execute rounds
  let shouldContinue = true;
  while (shouldContinue && state.activePlayers.size >= 2) {
    const result = executeRound(state, eventHandler);
    state = result.state;
    shouldContinue = result.shouldContinue;

    // Yield to event loop for async-friendly execution
    await new Promise(resolve => setTimeout(resolve, 0));
  }

  state = { ...state, status: 'completed', endTime: Date.now() };

  // End event
  const matchResult = generateMatchResult(state);
  eventHandler?.(createEvent('match_ended', state, matchResult.standings[0]?.playerId ?? players[0].id, {
    winner: matchResult.standings[0]?.playerName,
    totalRounds: matchResult.totalRounds,
  }));

  return matchResult;
}

/**
 * Run a match in background with cancellation support
 */
export function runMatchInBackground(
  matchId: string,
  players: CeeloPlayer[],
  config?: Partial<MatchConfig>,
  eventHandler?: CeeloEventHandler
): { cancel: () => void; promise: Promise<MatchResult> } {
  let cancelled = false;

  const promise = new Promise<MatchResult>(async (resolve, reject) => {
    try {
      let state = createMatch(matchId, players, config);

      eventHandler?.(createEvent('match_started', state, players[0].id, {
        players: players.map(p => ({ id: p.id, name: p.name })),
      }));

      state = { ...state, status: 'in_progress' };

      while (!cancelled && state.activePlayers.size >= 2) {
        const result = executeRound(state, eventHandler);
        state = result.state;

        if (!result.shouldContinue) break;

        await new Promise(resolve => setTimeout(resolve, 0));
      }

      if (cancelled) {
        state = { ...state, status: 'paused' };
      } else {
        state = { ...state, status: 'completed' };
      }

      resolve(generateMatchResult(state));
    } catch (error) {
      reject(error);
    }
  });

  return {
    cancel: () => { cancelled = true; },
    promise,
  };
}
