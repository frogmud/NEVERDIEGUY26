/**
 * Telemetry logging for balance data
 *
 * Outputs timestamped console logs for tracking economy/scoring during playtests.
 * Format: [NDG] MM:SS - Event description | Data
 *
 * NEVER DIE GUY
 */

let runStartTime: number | null = null;

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function getElapsed(): string {
  if (!runStartTime) return '00:00';
  return formatTime(Date.now() - runStartTime);
}

function log(message: string, data?: Record<string, unknown>): void {
  const timestamp = getElapsed();
  const dataStr = data ? ` | ${Object.entries(data).map(([k, v]) => `${k}: ${v}`).join(' | ')}` : '';
  console.log(`[NDG] ${timestamp} - ${message}${dataStr}`);
}

// ============================================
// Public API
// ============================================

export function logRunStart(loadoutId: string, threadId: string): void {
  runStartTime = Date.now();
  log('Run started', { loadout: loadoutId, seed: threadId });
}

export function logRoomStart(domain: number, room: number, targetScore: number): void {
  log(`Room ${domain}-${room} started`, { target: targetScore });
}

export function logThrow(
  throwNumber: number,
  diceRolled: number,
  scoreGained: number,
  totalScore: number,
  multiplier: number
): void {
  log(`Throw ${throwNumber}`, {
    dice: diceRolled,
    gained: `+${scoreGained}`,
    total: totalScore,
    mult: `${multiplier}x`,
  });
}

export function logTrade(diceTraded: number, newMultiplier: number): void {
  log(`Trade`, { dice: diceTraded, mult: `${newMultiplier}x` });
}

export function logRoomClear(
  domain: number,
  room: number,
  score: number,
  targetScore: number,
  goldEarned: number,
  throwsUsed: number
): void {
  log(`Room ${domain}-${room} cleared`, {
    score: `${score}/${targetScore}`,
    gold: `+${goldEarned}`,
    throws: throwsUsed,
  });
}

export function logDomainClear(
  domainId: number,
  domainName: string,
  totalScore: number,
  totalGold: number
): void {
  log(`DOMAIN CLEAR: ${domainName}`, {
    domain: domainId,
    score: totalScore,
    gold: totalGold,
  });
}

export function logShopPurchase(
  itemId: string,
  cost: number,
  goldRemaining: number
): void {
  log(`Shop purchase`, { item: itemId, cost, remaining: goldRemaining });
}

export function logRunEnd(
  won: boolean,
  finalScore: number,
  finalGold: number,
  domainsCleared: number,
  roomsCleared: number
): void {
  const result = won ? 'VICTORY' : 'DEFEAT';
  log(`Run ended: ${result}`, {
    score: finalScore,
    gold: finalGold,
    domains: domainsCleared,
    rooms: roomsCleared,
    time: getElapsed(),
  });
  runStartTime = null;
}

export function logDefeat(
  score: number,
  targetScore: number,
  domain: number,
  room: number
): void {
  log(`DEFEAT`, {
    score: `${score}/${targetScore}`,
    location: `${domain}-${room}`,
  });
}
