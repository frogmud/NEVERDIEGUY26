// Death and victory quips for the talking skull

export const DEATH_QUIPS = [
  "More like can't stop dying guy",
  "The Die-rectors send their regards.",
  "Try rolling better next time.",
  "Even the dice couldn't save you.",
  "Your thread has been terminated.",
  "Fortune did not favor you today.",
  "The void claims another soul.",
  "Maybe try a different loadout?",
  "That's what we call a skill issue.",
];

export const VICTORY_QUIPS = [
  "Not bad, mortal.",
  "The Die-rectors are pleased.",
  "You've earned your rest... for now.",
  "Fortune favors the bold.",
  "A worthy challenger rises.",
  "The dice were in your favor.",
  "Thread successfully archived.",
  "Death was denied today.",
  "Consider yourself lucky.",
  "Your data persists eternally.",
];

/**
 * Get a random quip based on win/loss state
 */
export function getRandomQuip(isWin: boolean): string {
  const quips = isWin ? VICTORY_QUIPS : DEATH_QUIPS;
  return quips[Math.floor(Math.random() * quips.length)];
}

/**
 * Get a quip by index (for seeded/deterministic selection)
 */
export function getQuipByIndex(isWin: boolean, index: number): string {
  const quips = isWin ? VICTORY_QUIPS : DEATH_QUIPS;
  return quips[index % quips.length];
}
