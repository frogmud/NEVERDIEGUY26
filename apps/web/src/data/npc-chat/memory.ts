/**
 * NPC Memory System
 *
 * NPCs remember their deaths, witnessed deaths, and form trauma bonds.
 * This creates emergent storytelling through shared experience.
 */

// ============================================
// Types
// ============================================

export interface MemoryEvent {
  type: 'death' | 'witnessed_death' | 'squish' | 'witnessed_squish' | 'shared_moment';
  timestamp: number;
  roomIndex: number;
  details?: string;
  involvedNPCs?: string[];
}

export interface MemorableMoment {
  id: string;
  type: 'first_death' | 'mass_casualty' | 'saved_by' | 'betrayed_by' | 'milestone';
  description: string;
  timestamp: number;
  significance: number; // 1-10
}

export interface NPCMemory {
  npcSlug: string;

  // Death tracking
  totalDeaths: number;
  totalWitnessedDeaths: number;
  deathsThisRun: number;
  witnessedDeathsThisRun: number;

  // Recent events (rolling buffer, max 20)
  recentEvents: MemoryEvent[];

  // Trauma bonds - NPCs who have died together or witnessed each other's deaths
  traumaBonds: Record<string, number>; // npcSlug -> bond strength (0-100)

  // Memorable moments (max 5, sorted by significance)
  memorableMoments: MemorableMoment[];

  // Stats
  firstDeathRoom: number | null;
  lastDeathRoom: number | null;
  longestSurvivalStreak: number; // rooms survived without dying
  currentSurvivalStreak: number;
}

export interface MemoryStorage {
  memories: Record<string, NPCMemory>;
  globalStats: {
    totalDeaths: number;
    mostDeaths: string | null;
    strongestBond: { npcs: [string, string]; strength: number } | null;
  };
  version: number;
}

// ============================================
// Constants
// ============================================

const MAX_RECENT_EVENTS = 20;
const MAX_MEMORABLE_MOMENTS = 5;
const TRAUMA_BOND_PER_SHARED_DEATH = 15;
const TRAUMA_BOND_PER_WITNESSED = 5;
const STORAGE_KEY = 'ndg_npc_memory';
const CURRENT_VERSION = 1;

// ============================================
// Default Factories
// ============================================

export function createDefaultMemory(npcSlug: string): NPCMemory {
  return {
    npcSlug,
    totalDeaths: 0,
    totalWitnessedDeaths: 0,
    deathsThisRun: 0,
    witnessedDeathsThisRun: 0,
    recentEvents: [],
    traumaBonds: {},
    memorableMoments: [],
    firstDeathRoom: null,
    lastDeathRoom: null,
    longestSurvivalStreak: 0,
    currentSurvivalStreak: 0,
  };
}

export function createDefaultMemoryStorage(): MemoryStorage {
  return {
    memories: {},
    globalStats: {
      totalDeaths: 0,
      mostDeaths: null,
      strongestBond: null,
    },
    version: CURRENT_VERSION,
  };
}

// ============================================
// Memory Operations
// ============================================

/**
 * Get or create memory for an NPC
 */
export function getMemory(storage: MemoryStorage, npcSlug: string): NPCMemory {
  return storage.memories[npcSlug] || createDefaultMemory(npcSlug);
}

/**
 * Record that an NPC was squished/died
 */
export function recordDeath(
  storage: MemoryStorage,
  npcSlug: string,
  roomIndex: number,
  witnessNPCs: string[] = []
): MemoryStorage {
  const memory = getMemory(storage, npcSlug);

  // Update death counts
  const updatedMemory: NPCMemory = {
    ...memory,
    totalDeaths: memory.totalDeaths + 1,
    deathsThisRun: memory.deathsThisRun + 1,
    firstDeathRoom: memory.firstDeathRoom ?? roomIndex,
    lastDeathRoom: roomIndex,
    currentSurvivalStreak: 0, // Reset streak on death
    recentEvents: [
      {
        type: 'death' as const,
        timestamp: Date.now(),
        roomIndex,
        involvedNPCs: witnessNPCs,
      },
      ...memory.recentEvents,
    ].slice(0, MAX_RECENT_EVENTS),
  };

  // Add first death as memorable moment
  if (memory.totalDeaths === 0) {
    updatedMemory.memorableMoments = addMemorableMoment(updatedMemory.memorableMoments, {
      id: `first-death-${npcSlug}`,
      type: 'first_death',
      description: `First death in room ${roomIndex}`,
      timestamp: Date.now(),
      significance: 8,
    });
  }

  // Update trauma bonds with witnesses
  witnessNPCs.forEach((witnessSlug) => {
    updatedMemory.traumaBonds[witnessSlug] =
      (updatedMemory.traumaBonds[witnessSlug] || 0) + TRAUMA_BOND_PER_SHARED_DEATH;
  });

  let updatedStorage: MemoryStorage = {
    ...storage,
    memories: {
      ...storage.memories,
      [npcSlug]: updatedMemory,
    },
    globalStats: {
      ...storage.globalStats,
      totalDeaths: storage.globalStats.totalDeaths + 1,
    },
  };

  // Update witnessed deaths for witnesses
  witnessNPCs.forEach((witnessSlug) => {
    updatedStorage = recordWitnessedDeath(updatedStorage, witnessSlug, npcSlug, roomIndex);
  });

  // Update most deaths
  updatedStorage = updateMostDeaths(updatedStorage);

  // Update strongest bond
  updatedStorage = updateStrongestBond(updatedStorage);

  return updatedStorage;
}

/**
 * Record that an NPC witnessed another's death
 */
export function recordWitnessedDeath(
  storage: MemoryStorage,
  witnessSlug: string,
  victimSlug: string,
  roomIndex: number
): MemoryStorage {
  const memory = getMemory(storage, witnessSlug);

  const updatedMemory: NPCMemory = {
    ...memory,
    totalWitnessedDeaths: memory.totalWitnessedDeaths + 1,
    witnessedDeathsThisRun: memory.witnessedDeathsThisRun + 1,
    traumaBonds: {
      ...memory.traumaBonds,
      [victimSlug]: (memory.traumaBonds[victimSlug] || 0) + TRAUMA_BOND_PER_WITNESSED,
    },
    recentEvents: [
      {
        type: 'witnessed_death' as const,
        timestamp: Date.now(),
        roomIndex,
        details: `Witnessed ${victimSlug}'s death`,
        involvedNPCs: [victimSlug],
      },
      ...memory.recentEvents,
    ].slice(0, MAX_RECENT_EVENTS),
  };

  return {
    ...storage,
    memories: {
      ...storage.memories,
      [witnessSlug]: updatedMemory,
    },
  };
}

/**
 * Record room survival (increments streak)
 */
export function recordSurvival(
  storage: MemoryStorage,
  npcSlug: string
): MemoryStorage {
  const memory = getMemory(storage, npcSlug);

  const newStreak = memory.currentSurvivalStreak + 1;
  const updatedMemory: NPCMemory = {
    ...memory,
    currentSurvivalStreak: newStreak,
    longestSurvivalStreak: Math.max(memory.longestSurvivalStreak, newStreak),
  };

  return {
    ...storage,
    memories: {
      ...storage.memories,
      [npcSlug]: updatedMemory,
    },
  };
}

/**
 * Reset run-specific memory stats
 */
export function resetRunMemory(storage: MemoryStorage): MemoryStorage {
  const updatedMemories = Object.entries(storage.memories).reduce(
    (acc, [slug, memory]) => {
      acc[slug] = {
        ...memory,
        deathsThisRun: 0,
        witnessedDeathsThisRun: 0,
        currentSurvivalStreak: 0,
      };
      return acc;
    },
    {} as Record<string, NPCMemory>
  );

  return {
    ...storage,
    memories: updatedMemories,
  };
}

// ============================================
// Query Functions
// ============================================

/**
 * Get top trauma bonds for an NPC
 */
export function getTopTraumaBonds(
  storage: MemoryStorage,
  npcSlug: string,
  limit = 3
): Array<{ npcSlug: string; strength: number }> {
  const memory = getMemory(storage, npcSlug);

  return Object.entries(memory.traumaBonds)
    .map(([slug, strength]) => ({ npcSlug: slug, strength }))
    .sort((a, b) => b.strength - a.strength)
    .slice(0, limit);
}

/**
 * Get the strongest trauma bond partner
 */
export function getStrongestBondPartner(
  storage: MemoryStorage,
  npcSlug: string
): string | null {
  const bonds = getTopTraumaBonds(storage, npcSlug, 1);
  return bonds[0]?.npcSlug || null;
}

/**
 * Check if two NPCs have a strong trauma bond
 */
export function hasTraumaBond(
  storage: MemoryStorage,
  npc1: string,
  npc2: string,
  threshold = 30
): boolean {
  const memory1 = getMemory(storage, npc1);
  const memory2 = getMemory(storage, npc2);

  return (
    (memory1.traumaBonds[npc2] || 0) >= threshold ||
    (memory2.traumaBonds[npc1] || 0) >= threshold
  );
}

/**
 * Get death-related statistics for an NPC
 */
export function getDeathStats(
  storage: MemoryStorage,
  npcSlug: string
): {
  totalDeaths: number;
  deathsThisRun: number;
  witnessedDeaths: number;
  longestStreak: number;
  currentStreak: number;
} {
  const memory = getMemory(storage, npcSlug);

  return {
    totalDeaths: memory.totalDeaths,
    deathsThisRun: memory.deathsThisRun,
    witnessedDeaths: memory.totalWitnessedDeaths,
    longestStreak: memory.longestSurvivalStreak,
    currentStreak: memory.currentSurvivalStreak,
  };
}

// ============================================
// Helper Functions
// ============================================

function addMemorableMoment(
  moments: MemorableMoment[],
  newMoment: MemorableMoment
): MemorableMoment[] {
  const updated = [...moments, newMoment]
    .sort((a, b) => b.significance - a.significance)
    .slice(0, MAX_MEMORABLE_MOMENTS);

  return updated;
}

function updateMostDeaths(storage: MemoryStorage): MemoryStorage {
  let mostDeaths: string | null = null;
  let maxDeaths = 0;

  Object.entries(storage.memories).forEach(([slug, memory]) => {
    if (memory.totalDeaths > maxDeaths) {
      maxDeaths = memory.totalDeaths;
      mostDeaths = slug;
    }
  });

  return {
    ...storage,
    globalStats: {
      ...storage.globalStats,
      mostDeaths,
    },
  };
}

function updateStrongestBond(storage: MemoryStorage): MemoryStorage {
  let strongestBond: { npcs: [string, string]; strength: number } | null = null;
  let maxStrength = 0;

  Object.entries(storage.memories).forEach(([slug, memory]) => {
    Object.entries(memory.traumaBonds).forEach(([partnerSlug, strength]) => {
      if (strength > maxStrength) {
        maxStrength = strength;
        strongestBond = { npcs: [slug, partnerSlug], strength };
      }
    });
  });

  return {
    ...storage,
    globalStats: {
      ...storage.globalStats,
      strongestBond,
    },
  };
}

// ============================================
// Persistence
// ============================================

export function loadMemoryStorage(): MemoryStorage {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return createDefaultMemoryStorage();
    }

    const parsed = JSON.parse(stored) as MemoryStorage;

    if (parsed.version !== CURRENT_VERSION) {
      return createDefaultMemoryStorage();
    }

    return parsed;
  } catch (error) {
    console.error('Failed to load memory storage:', error);
    return createDefaultMemoryStorage();
  }
}

export function saveMemoryStorage(storage: MemoryStorage): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storage));
  } catch (error) {
    console.error('Failed to save memory storage:', error);
  }
}

export function clearMemoryStorage(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// ============================================
// Template Variable Helpers
// ============================================

/**
 * Get memory variables for template substitution
 */
export function getMemoryVariables(
  storage: MemoryStorage,
  npcSlug: string
): Record<string, string | number> {
  const memory = getMemory(storage, npcSlug);
  const strongestPartner = getStrongestBondPartner(storage, npcSlug);
  const topBonds = getTopTraumaBonds(storage, npcSlug, 3);

  return {
    myTotalDeaths: memory.totalDeaths,
    myDeathsThisRun: memory.deathsThisRun,
    witnessedDeaths: memory.totalWitnessedDeaths,
    witnessedDeathsThisRun: memory.witnessedDeathsThisRun,
    survivalStreak: memory.currentSurvivalStreak,
    longestSurvivalStreak: memory.longestSurvivalStreak,
    sharedTraumaWith: strongestPartner || 'no one',
    traumaBondCount: topBonds.length,
    firstDeathRoom: memory.firstDeathRoom ?? 'never',
    lastDeathRoom: memory.lastDeathRoom ?? 'never',
  };
}
