/**
 * Deterministic RNG with namespaced seeds
 *
 * The threadId is the master seed. Every "random" pull uses a namespaced seed
 * to ensure reproducibility (same threadId = same sequence of events).
 *
 * Usage:
 *   const rng = createSeededRng(threadId);
 *   const shopItems = rng.shuffle(pool, "requisition:tier:1:shop:enter");
 *   const doorChoice = rng.pick(doors, "doorSelect:roomIndex:3");
 */

// Simple but effective hash function (cyrb53)
function hashString(str: string, seed: number = 0): number {
  let h1 = 0xdeadbeef ^ seed;
  let h2 = 0x41c6ce57 ^ seed;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}

// Mulberry32 PRNG - fast, seedable, good distribution
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface SeededRng {
  /** Get a random float [0, 1) for a namespaced operation */
  random(namespace: string): number;

  /** Get a random integer [0, max) for a namespaced operation */
  int(namespace: string, max: number): number;

  /** Get a random integer [min, max] for a namespaced operation */
  range(namespace: string, min: number, max: number): number;

  /** Pick a random item from an array */
  pick<T>(namespace: string, items: T[]): T | undefined;

  /** Pick N random items from an array (without replacement) */
  pickN<T>(namespace: string, items: T[], count: number): T[];

  /** Shuffle an array (returns new array) */
  shuffle<T>(namespace: string, items: T[]): T[];

  /** Roll a dice (1 to sides, inclusive) */
  roll(namespace: string, sides: number): number;

  /** Roll multiple dice and sum */
  rollSum(namespace: string, count: number, sides: number): number;

  /** Check if a probability check passes (0-100) */
  chance(namespace: string, percent: number): boolean;

  /** The master seed (threadId) */
  readonly seed: string;
}

/**
 * Create a seeded RNG instance from a threadId
 *
 * Each namespace creates a deterministic sub-seed, so:
 * - Same threadId + same namespace = same sequence
 * - Different namespaces don't interfere with each other
 */
export function createSeededRng(threadId: string): SeededRng {
  // Convert threadId to numeric seed
  const masterSeed = hashString(threadId);

  // Cache PRNGs per namespace to maintain sequence
  const prngs = new Map<string, () => number>();

  function getPrng(namespace: string): () => number {
    let prng = prngs.get(namespace);
    if (!prng) {
      // Create unique seed for this namespace
      const namespaceSeed = hashString(namespace, masterSeed);
      prng = mulberry32(namespaceSeed);
      prngs.set(namespace, prng);
    }
    return prng;
  }

  return {
    seed: threadId,

    random(namespace: string): number {
      return getPrng(namespace)();
    },

    int(namespace: string, max: number): number {
      return Math.floor(getPrng(namespace)() * max);
    },

    range(namespace: string, min: number, max: number): number {
      const prng = getPrng(namespace);
      return Math.floor(prng() * (max - min + 1)) + min;
    },

    pick<T>(namespace: string, items: T[]): T | undefined {
      if (items.length === 0) return undefined;
      const prng = getPrng(namespace);
      return items[Math.floor(prng() * items.length)];
    },

    pickN<T>(namespace: string, items: T[], count: number): T[] {
      if (items.length === 0 || count <= 0) return [];
      const shuffled = this.shuffle(namespace, items);
      return shuffled.slice(0, Math.min(count, items.length));
    },

    shuffle<T>(namespace: string, items: T[]): T[] {
      const result = [...items];
      const prng = getPrng(namespace);
      // Fisher-Yates shuffle
      for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(prng() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
      }
      return result;
    },

    roll(namespace: string, sides: number): number {
      return this.range(namespace, 1, sides);
    },

    rollSum(namespace: string, count: number, sides: number): number {
      let total = 0;
      const prng = getPrng(namespace);
      for (let i = 0; i < count; i++) {
        total += Math.floor(prng() * sides) + 1;
      }
      return total;
    },

    chance(namespace: string, percent: number): boolean {
      return getPrng(namespace)() * 100 < percent;
    },
  };
}

/**
 * Generate a new threadId (6-char hex)
 * Used when starting a new thread
 */
export function generateThreadId(): string {
  const chars = '0123456789ABCDEF';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars[Math.floor(Math.random() * 16)];
  }
  return result;
}

/**
 * Generate a daily seed based on current date
 * Same day = same seed worldwide
 */
export function getDailySeed(): string {
  const now = new Date();
  const dateStr = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
  const hash = hashString(dateStr);
  return hash.toString(16).toUpperCase().slice(0, 6);
}
