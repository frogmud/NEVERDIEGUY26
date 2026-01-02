/**
 * Home Screen Utilities
 *
 * Shared utilities for homepage components
 */

// =============================================================================
// SEEDED RANDOM
// =============================================================================

/**
 * Simple seeded random using sin function
 * Returns a value between 0 and 1
 */
export function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

/**
 * Get a daily seed based on year + day of year
 * Same day = same seed for deterministic daily rotation
 */
export function getDailySeed(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  return now.getFullYear() * 1000 + dayOfYear;
}

// =============================================================================
// DAILY WIKI STORAGE
// =============================================================================

const DAILY_WIKI_KEY = 'ndg_daily_wiki';

interface DailyWikiStatus {
  date: string;
  read: boolean;
}

/**
 * Get the current daily wiki read status from localStorage
 * Resets automatically on new day
 */
export function getDailyWikiStatus(): DailyWikiStatus {
  const today = new Date().toDateString();
  try {
    const stored = localStorage.getItem(DAILY_WIKI_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Reset if it's a new day
      if (parsed.date !== today) {
        return { date: today, read: false };
      }
      return parsed;
    }
  } catch {
    // Ignore parse errors
  }
  return { date: today, read: false };
}

/**
 * Mark the daily wiki as read for today
 */
export function setDailyWikiRead(): void {
  const today = new Date().toDateString();
  localStorage.setItem(DAILY_WIKI_KEY, JSON.stringify({ date: today, read: true }));
}
