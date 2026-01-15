/**
 * Thread Selectors - Derived values from GameState
 *
 * Pure functions that compute derived state without side effects.
 * Used by UI components to avoid direct GameState manipulation.
 */

import type { GameState, LedgerEvent } from '../games/meteor/gameConfig';
import { DOMAINS } from '../games/meteor/gameConfig';

/**
 * Check if a thread (run) exists and can be resumed
 */
export function hasActiveThread(state: GameState): boolean {
  return (
    state.threadId !== '' &&
    state.phase !== 'game_over' &&
    state.currentDomain >= 1
  );
}

/**
 * Get display label for the current thread
 */
export function getThreadLabel(state: GameState): string {
  if (!state.threadId) return 'NO THREAD';
  return `THREAD-${state.threadId}`;
}

/**
 * Get the current domain name
 */
export function getCurrentDomainName(state: GameState): string {
  const domain = DOMAINS.find((d) => d.id === state.currentDomain);
  return domain?.name || 'Unknown';
}

/**
 * Get protocol roll summary string
 */
export function getProtocolRollSummary(state: GameState): string {
  const { protocolRoll } = state;
  if (!protocolRoll) return 'UNROLLED';

  const domain = DOMAINS.find((d) => d.id === protocolRoll.domain);
  const domainName = domain?.name || `Domain ${protocolRoll.domain}`;

  const modLabels = ['Standard', 'Harsh', 'Volatile', 'Cursed', 'Chaotic', 'Doomed'];
  const modLabel = modLabels[protocolRoll.modifier - 1] || 'Unknown';

  return `${domainName} | ${modLabel} | Sponsor ${protocolRoll.sponsor}`;
}

/**
 * Get loadout hash (summary of equipped items)
 */
export function getLoadoutHash(state: GameState): string {
  const { inventory } = state;
  if (!inventory) return '---';

  const diceCount = Object.values(inventory.dice || {}).reduce((a, b) => a + b, 0);
  const powerupCount = (inventory.powerups || []).length;
  const upgradeCount = (inventory.upgrades || []).length;

  return `${diceCount}D/${powerupCount}P/${upgradeCount}U`;
}

/**
 * Get current tier display
 */
export function getTierDisplay(state: GameState): string {
  return `TIER ${state.tier || 1}`;
}

/**
 * Get integrity percentage
 */
export function getIntegrityPercent(state: GameState): number {
  return state.integrity ?? 100;
}

/**
 * Get integrity status label
 */
export function getIntegrityStatus(state: GameState): 'nominal' | 'warning' | 'critical' {
  const integrity = state.integrity ?? 100;
  if (integrity > 60) return 'nominal';
  if (integrity > 30) return 'warning';
  return 'critical';
}

/**
 * Get room progress (e.g., "Room 2/3")
 */
export function getRoomProgress(state: GameState): string {
  const completed = state.completedEvents?.filter(Boolean).length || 0;
  const total = 3; // Events per domain
  return `Room ${completed}/${total}`;
}

/**
 * Get audit progress (how close to boss)
 */
export function getAuditProgress(state: GameState): { current: number; threshold: number } {
  const completed = state.completedEvents?.filter(Boolean).length || 0;
  return {
    current: completed,
    threshold: 3, // Boss after 3 events
  };
}

/**
 * Check if audit (boss) is next
 */
export function isAuditImminent(state: GameState): boolean {
  const { current, threshold } = getAuditProgress(state);
  return current >= threshold - 1;
}

/**
 * Get wanderer state summary
 */
export function getWandererStateSummary(state: GameState): string {
  const favor = state.favorTokens || 0;
  const calm = state.calmBonus || 0;
  const heat = state.heat || 0;

  const parts: string[] = [];
  if (favor > 0) parts.push(`+${favor} Favor`);
  if (calm > 0) parts.push(`+${calm} Calm`);
  if (heat > 0) parts.push(`+${heat} Heat`);

  return parts.length > 0 ? parts.join(' | ') : 'Neutral';
}

/**
 * Get effective reroll cost (affected by calmBonus)
 */
export function getEffectiveRerollCost(baseCost: number, state: GameState): number {
  const calmReduction = state.calmBonus || 0;
  return Math.max(0, baseCost - calmReduction);
}

/**
 * Get last N ledger events
 */
export function getRecentLedgerEvents(state: GameState, count: number = 5): LedgerEvent[] {
  const ledger = state.ledger || [];
  return ledger.slice(-count);
}

/**
 * Count ledger events by type
 */
export function getLedgerEventCounts(
  state: GameState
): Record<LedgerEvent['type'], number> {
  const ledger = state.ledger || [];
  const counts: Record<string, number> = {
    THREAD_START: 0,
    SHOP_BUY: 0,
    ROOM_CLEAR: 0,
    DOOR_PICK: 0,
    WANDERER_CHOICE: 0,
    AUDIT_CLEAR: 0,
  };

  for (const event of ledger) {
    if (event.type in counts) {
      counts[event.type]++;
    }
  }

  return counts as Record<LedgerEvent['type'], number>;
}

/**
 * Check if this is a fresh new thread (no progress yet)
 */
export function isFreshThread(state: GameState): boolean {
  return (
    state.currentDomain === 1 &&
    state.currentEvent === 0 &&
    !state.completedEvents?.some(Boolean) &&
    (state.ledger?.length || 0) <= 1 // Only THREAD_START event
  );
}

/**
 * Thread snapshot for dev drawer
 */
export interface ThreadSnapshot {
  threadId: string;
  protocolRoll: GameState['protocolRoll'];
  tier: number;
  currentDomain: number;
  currentEvent: number;
  roomsCleared: number;
  gold: number;
  integrity: number;
  favorTokens: number;
  calmBonus: number;
  heat: number;
  ledgerLength: number;
  phase: string;
}

export function getThreadSnapshot(state: GameState): ThreadSnapshot {
  return {
    threadId: state.threadId || '',
    protocolRoll: state.protocolRoll,
    tier: state.tier || 1,
    currentDomain: state.currentDomain,
    currentEvent: state.currentEvent,
    roomsCleared: state.completedEvents?.filter(Boolean).length || 0,
    gold: state.gold,
    integrity: state.integrity ?? 100,
    favorTokens: state.favorTokens || 0,
    calmBonus: state.calmBonus || 0,
    heat: state.heat || 0,
    ledgerLength: state.ledger?.length || 0,
    phase: state.phase,
  };
}
