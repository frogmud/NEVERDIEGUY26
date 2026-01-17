/**
 * usePartyBridge - Bridge between RunContext and PartyContext
 *
 * Automatically syncs local game state to the party room:
 * - Emits dice events for favor tracking
 * - Broadcasts progress updates
 * - Handles finish events
 *
 * NEVER DIE GUY
 */

import { useEffect, useRef, useCallback } from 'react';
import { useRun } from '../contexts/RunContext';
import { useParty } from '../contexts/PartyContext';
import type { DiceEvent } from '@ndg/ai-engine/multiplayer';
import type { DieSides } from '@ndg/ai-engine';

// ============================================
// DICE EVENT DETECTION
// ============================================

interface CombatSnapshot {
  hand: Array<{ id: string; sides: DieSides; held: boolean }>;
  throwsRemaining: number;
  holdsRemaining: number;
  phase: string;
}

/**
 * Detect dice events by comparing combat state snapshots
 */
function detectDiceEvents(
  prev: CombatSnapshot | null,
  curr: CombatSnapshot | null,
  playerId: string
): DiceEvent[] {
  if (!prev || !curr) return [];

  const events: DiceEvent[] = [];
  const now = Date.now();

  // Detect THROW (throws remaining decreased)
  if (curr.throwsRemaining < prev.throwsRemaining) {
    // Find which dice were thrown (not held in prev)
    const thrownDice = prev.hand.filter((d) => !d.held);

    for (const die of thrownDice) {
      events.push({
        type: 'ROLLED',
        dieSides: die.sides,
        playerId,
        timestamp: now,
      });
    }

    // Find which dice were held
    const heldDice = prev.hand.filter((d) => d.held);

    for (const die of heldDice) {
      events.push({
        type: 'HELD',
        dieSides: die.sides,
        playerId,
        timestamp: now,
      });
    }
  }

  // Detect TRADE (holds remaining decreased without throw)
  if (
    curr.holdsRemaining < prev.holdsRemaining &&
    curr.throwsRemaining === prev.throwsRemaining
  ) {
    // Compare hand composition to find traded dice
    const prevIds = new Set(prev.hand.map((d) => d.id));
    const currIds = new Set(curr.hand.map((d) => d.id));

    // Dice that were in prev but not in curr were traded away
    for (const die of prev.hand) {
      if (!currIds.has(die.id)) {
        events.push({
          type: 'TRADED',
          dieSides: die.sides,
          playerId,
          timestamp: now,
        });
      }
    }
  }

  return events;
}

// ============================================
// HOOK
// ============================================

interface UsePartyBridgeOptions {
  /** Enable automatic progress broadcasting */
  autoProgress?: boolean;
  /** Progress broadcast interval in ms */
  progressInterval?: number;
}

export function usePartyBridge(options: UsePartyBridgeOptions = {}) {
  const { autoProgress = true, progressInterval = 2000 } = options;

  const { state } = useRun();
  const {
    connected,
    roomState,
    myPlayerId,
    sendProgress,
    sendDiceEvents,
    finishRace,
  } = useParty();

  // Track previous combat state for diff detection
  const prevCombatRef = useRef<CombatSnapshot | null>(null);

  // ----------------------------------------
  // DICE EVENT DETECTION
  // ----------------------------------------

  useEffect(() => {
    if (!connected || !roomState || roomState.phase !== 'racing') {
      prevCombatRef.current = null;
      return;
    }

    if (!state.combatState) {
      prevCombatRef.current = null;
      return;
    }

    const currentSnapshot: CombatSnapshot = {
      hand: state.combatState.hand.map((d) => ({
        id: d.id,
        sides: d.sides as DieSides,
        held: d.isHeld ?? false,
      })),
      throwsRemaining: state.combatState.throwsRemaining,
      holdsRemaining: state.combatState.holdsRemaining,
      phase: state.combatState.phase,
    };

    // Detect events
    if (myPlayerId) {
      const events = detectDiceEvents(prevCombatRef.current, currentSnapshot, myPlayerId);

      if (events.length > 0) {
        sendDiceEvents(events);
      }
    }

    // Update ref for next comparison
    prevCombatRef.current = currentSnapshot;
  }, [
    connected,
    roomState?.phase,
    state.combatState?.hand,
    state.combatState?.throwsRemaining,
    state.combatState?.holdsRemaining,
    myPlayerId,
    sendDiceEvents,
  ]);

  // ----------------------------------------
  // PROGRESS BROADCASTING
  // ----------------------------------------

  useEffect(() => {
    if (!connected || !roomState || roomState.phase !== 'racing' || !autoProgress) {
      return;
    }

    const broadcastProgress = () => {
      sendProgress({
        currentDomain: state.domainState?.id ?? 1,
        roomsCleared: state.domainState?.clearedCount ?? 0,
        totalScore: state.combatState?.currentScore ?? 0,
      });
    };

    // Broadcast immediately
    broadcastProgress();

    // Then on interval
    const interval = setInterval(broadcastProgress, progressInterval);

    return () => clearInterval(interval);
  }, [
    connected,
    roomState?.phase,
    autoProgress,
    progressInterval,
    sendProgress,
    state.domainState?.id,
    state.domainState?.clearedCount,
    state.combatState?.currentScore,
  ]);

  // ----------------------------------------
  // RUN END DETECTION
  // ----------------------------------------

  useEffect(() => {
    if (!connected || !roomState || roomState.phase !== 'racing') {
      return;
    }

    // Detect victory
    if (state.runEnded && state.centerPanel === 'summary') {
      finishRace({
        status: 'victory',
        finalScore: state.combatState?.currentScore ?? 0,
        finishTime: Date.now(),
      });
    }

    // Detect death (scars >= 4)
    if (state.scars >= 4) {
      finishRace({
        status: 'dead',
        finalScore: state.combatState?.currentScore ?? 0,
        finishTime: Date.now(),
      });
    }
  }, [
    connected,
    roomState?.phase,
    state.runEnded,
    state.centerPanel,
    state.scars,
    state.combatState?.currentScore,
    finishRace,
  ]);

  // ----------------------------------------
  // SHARED SEED INJECTION
  // ----------------------------------------

  // When race starts, the shared seed from room should be used
  // This is handled by the parent component that initiates the run

  return {
    /** Whether bridge is active (connected and racing) */
    active: connected && roomState?.phase === 'racing',
    /** Current race seed from room */
    raceSeed: roomState?.currentSeed ?? null,
    /** Match number */
    matchNumber: roomState?.currentMatchNumber ?? 0,
  };
}

// ============================================
// CRIT/SNAKE DETECTION HELPER
// ============================================

/**
 * Call this when a roll result is known to emit CRIT or SNAKE events
 */
export function useDiceRollResult() {
  const { connected, roomState, sendDiceEvents } = useParty();

  const reportRoll = useCallback(
    (dieSides: DieSides, value: number, playerId: string) => {
      if (!connected || roomState?.phase !== 'racing') return;

      const events: DiceEvent[] = [];
      const now = Date.now();

      // Check for crit (max roll)
      if (value === dieSides) {
        events.push({
          type: 'CRIT',
          dieSides,
          playerId,
          value,
          timestamp: now,
        });
      }

      // Check for snake (rolled 1)
      if (value === 1) {
        events.push({
          type: 'SNAKE',
          dieSides,
          playerId,
          value,
          timestamp: now,
        });
      }

      if (events.length > 0) {
        sendDiceEvents(events);
      }
    },
    [connected, roomState?.phase, sendDiceEvents]
  );

  return { reportRoll };
}
