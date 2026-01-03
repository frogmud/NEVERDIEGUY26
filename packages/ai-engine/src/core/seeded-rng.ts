/**
 * Seeded Random Number Generator
 *
 * Provides deterministic randomness for reproducible NPC behavior.
 * Same seed = same sequence of "random" values.
 */

export interface SeededRng {
  random: (namespace?: string) => number;
  randomInt: (min: number, max: number, namespace?: string) => number;
  randomChoice: <T>(array: T[], namespace?: string) => T | undefined;
  randomWeighted: <T>(items: Array<{ item: T; weight: number }>, namespace?: string) => T | undefined;
  shuffle: <T>(array: T[], namespace?: string) => T[];
  /** Roll a die with given sides (1 to sides inclusive) */
  roll: (namespace: string, sides: number) => number;
  /** Get index for array selection (0 to length-1) */
  rollIndex: (namespace: string, length: number) => number;
}

/**
 * Simple but effective hash function for seed generation
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Mulberry32 PRNG - fast, simple, good distribution
 */
function mulberry32(seed: number): () => number {
  return function() {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

/**
 * Create a seeded RNG instance
 */
export function createSeededRng(seed: string): SeededRng {
  const baseSeed = hashString(seed);
  const namespaceSeeds: Record<string, () => number> = {};

  function getGenerator(namespace?: string): () => number {
    const key = namespace || '__default__';
    if (!namespaceSeeds[key]) {
      const combinedSeed = namespace
        ? hashString(`${seed}:${namespace}`)
        : baseSeed;
      namespaceSeeds[key] = mulberry32(combinedSeed);
    }
    return namespaceSeeds[key];
  }

  return {
    random(namespace?: string): number {
      return getGenerator(namespace)();
    },

    randomInt(min: number, max: number, namespace?: string): number {
      const r = getGenerator(namespace)();
      return Math.floor(r * (max - min + 1)) + min;
    },

    randomChoice<T>(array: T[], namespace?: string): T | undefined {
      if (array.length === 0) return undefined;
      const index = Math.floor(getGenerator(namespace)() * array.length);
      return array[index];
    },

    randomWeighted<T>(
      items: Array<{ item: T; weight: number }>,
      namespace?: string
    ): T | undefined {
      if (items.length === 0) return undefined;

      const totalWeight = items.reduce((sum, i) => sum + i.weight, 0);
      if (totalWeight <= 0) return items[0]?.item;

      let random = getGenerator(namespace)() * totalWeight;

      for (const { item, weight } of items) {
        random -= weight;
        if (random <= 0) return item;
      }

      return items[items.length - 1]?.item;
    },

    shuffle<T>(array: T[], namespace?: string): T[] {
      const result = [...array];
      const gen = getGenerator(namespace);

      for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(gen() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
      }

      return result;
    },

    roll(namespace: string, sides: number): number {
      const r = getGenerator(namespace)();
      return Math.floor(r * sides) + 1;
    },

    rollIndex(namespace: string, length: number): number {
      const r = getGenerator(namespace)();
      return Math.floor(r * length);
    },
  };
}

/**
 * Generate a conversation seed from context
 */
export function generateConversationSeed(
  participants: string[],
  turnNumber: number,
  baseSeed: string
): string {
  const sorted = [...participants].sort().join(':');
  return `${baseSeed}:${sorted}:${turnNumber}`;
}
