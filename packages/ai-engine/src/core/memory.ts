/**
 * Memory System
 *
 * NPCs remember events, form trauma bonds, and develop opinions.
 * Memory influences response selection and mood.
 */

import type { MemoryEvent, NPCMemory } from './types';

// ============================================
// Constants
// ============================================

const MAX_SHORT_TERM = 10;
const MAX_LONG_TERM = 20;
const TRAUMA_BOND_THRESHOLD = 30;
// P1 FIX: Lowered from 6 to 5 so "bad trade" events (weight=5) are remembered
const EMOTIONAL_WEIGHT_FOR_LONG_TERM = 5;

// ============================================
// Factory Functions
// ============================================

export function createDefaultMemory(slug: string): NPCMemory {
  return {
    slug,
    shortTerm: [],
    longTerm: [],
    traumaBonds: {},
    opinions: {},
    deaths: 0,
    witnessedDeaths: 0,
  };
}

// ============================================
// Memory Operations
// ============================================

let eventIdCounter = 0;

function generateEventId(): string {
  return `evt_${Date.now()}_${++eventIdCounter}`;
}

export function addMemoryEvent(
  memory: NPCMemory,
  event: Omit<MemoryEvent, 'id'>
): NPCMemory {
  const fullEvent: MemoryEvent = {
    ...event,
    id: generateEventId(),
  };

  // Add to short-term
  const shortTerm = [fullEvent, ...memory.shortTerm].slice(0, MAX_SHORT_TERM);

  // Promote to long-term if significant
  let longTerm = memory.longTerm;
  if (event.emotionalWeight >= EMOTIONAL_WEIGHT_FOR_LONG_TERM) {
    longTerm = [fullEvent, ...memory.longTerm]
      .sort((a, b) => b.emotionalWeight - a.emotionalWeight)
      .slice(0, MAX_LONG_TERM);
  }

  // Update trauma bonds
  // P1 FIX: Deduplicate involvedNPCs to prevent duplicate NPCs doubling trauma bond increment
  let traumaBonds = { ...memory.traumaBonds };
  if (event.type === 'death' || event.type === 'witnessed_death' || event.type === 'conflict') {
    const uniqueNPCs = [...new Set(event.involvedNPCs)];
    for (const npcSlug of uniqueNPCs) {
      if (npcSlug !== memory.slug) {
        traumaBonds[npcSlug] = (traumaBonds[npcSlug] || 0) + event.emotionalWeight;
      }
    }
  }

  // Track deaths
  let deaths = memory.deaths;
  let witnessedDeaths = memory.witnessedDeaths;
  if (event.type === 'death') {
    deaths++;
  } else if (event.type === 'witnessed_death') {
    witnessedDeaths++;
  }

  return {
    ...memory,
    shortTerm,
    longTerm,
    traumaBonds,
    deaths,
    witnessedDeaths,
  };
}

export function recordDeath(
  memory: NPCMemory,
  witnesses: string[] = []
): NPCMemory {
  return addMemoryEvent(memory, {
    type: 'death',
    timestamp: Date.now(),
    involvedNPCs: [memory.slug, ...witnesses],
    details: `Died. Witnessed by: ${witnesses.length > 0 ? witnesses.join(', ') : 'no one'}`,
    emotionalWeight: 8,
  });
}

export function recordWitnessedDeath(
  memory: NPCMemory,
  victimSlug: string,
  otherWitnesses: string[] = []
): NPCMemory {
  return addMemoryEvent(memory, {
    type: 'witnessed_death',
    timestamp: Date.now(),
    involvedNPCs: [memory.slug, victimSlug, ...otherWitnesses],
    details: `Witnessed ${victimSlug}'s death`,
    emotionalWeight: 6,
  });
}

export function recordConversation(
  memory: NPCMemory,
  participants: string[],
  topic?: string
): NPCMemory {
  return addMemoryEvent(memory, {
    type: 'conversation',
    timestamp: Date.now(),
    involvedNPCs: participants,
    details: topic || 'General conversation',
    emotionalWeight: 2,
  });
}

export function recordTrade(
  memory: NPCMemory,
  tradingPartner: string,
  wasGood: boolean
): NPCMemory {
  return addMemoryEvent(memory, {
    type: 'trade',
    timestamp: Date.now(),
    involvedNPCs: [memory.slug, tradingPartner],
    details: wasGood ? 'Good trade' : 'Bad trade',
    emotionalWeight: wasGood ? 3 : 5,
  });
}

export function recordConflict(
  memory: NPCMemory,
  opponent: string,
  won: boolean
): NPCMemory {
  return addMemoryEvent(memory, {
    type: 'conflict',
    timestamp: Date.now(),
    involvedNPCs: [memory.slug, opponent],
    details: won ? 'Victory' : 'Defeat',
    emotionalWeight: 7,
  });
}

export function recordAlliance(
  memory: NPCMemory,
  ally: string
): NPCMemory {
  return addMemoryEvent(memory, {
    type: 'alliance',
    timestamp: Date.now(),
    involvedNPCs: [memory.slug, ally],
    details: `Formed alliance with ${ally}`,
    emotionalWeight: 6,
  });
}

// ============================================
// Opinion System
// ============================================

export function updateOpinion(
  memory: NPCMemory,
  targetSlug: string,
  change: number
): NPCMemory {
  const current = memory.opinions[targetSlug] || 0;
  const newOpinion = Math.max(-100, Math.min(100, current + change));

  return {
    ...memory,
    opinions: {
      ...memory.opinions,
      [targetSlug]: newOpinion,
    },
  };
}

export function getOpinion(memory: NPCMemory, targetSlug: string): number {
  return memory.opinions[targetSlug] || 0;
}

// ============================================
// Queries
// ============================================

export function hasTraumaBond(memory: NPCMemory, targetSlug: string): boolean {
  return (memory.traumaBonds[targetSlug] || 0) >= TRAUMA_BOND_THRESHOLD;
}

export function getStrongestTraumaBond(memory: NPCMemory): string | null {
  let strongest: string | null = null;
  let highestValue = 0;

  for (const [slug, value] of Object.entries(memory.traumaBonds)) {
    if (value > highestValue) {
      highestValue = value;
      strongest = slug;
    }
  }

  return strongest;
}

export function getTraumaBondStrength(memory: NPCMemory, targetSlug: string): number {
  return memory.traumaBonds[targetSlug] || 0;
}

export function getRecentEventsWithNPC(
  memory: NPCMemory,
  targetSlug: string,
  limit: number = 5
): MemoryEvent[] {
  return memory.shortTerm
    .filter((e) => e.involvedNPCs.includes(targetSlug))
    .slice(0, limit);
}

export function getMostMemorableEvent(memory: NPCMemory): MemoryEvent | null {
  if (memory.longTerm.length === 0) return null;
  return memory.longTerm.reduce((a, b) =>
    a.emotionalWeight > b.emotionalWeight ? a : b
  );
}

export function hasRecentConflict(memory: NPCMemory, targetSlug: string): boolean {
  const recentConflicts = memory.shortTerm.filter(
    (e) => e.type === 'conflict' && e.involvedNPCs.includes(targetSlug)
  );
  return recentConflicts.length > 0;
}

// ============================================
// Memory Store
// ============================================

export interface MemoryStore {
  memories: Record<string, NPCMemory>;
  get: (slug: string) => NPCMemory;
  set: (memory: NPCMemory) => void;
}

export function createMemoryStore(): MemoryStore {
  const memories: Record<string, NPCMemory> = {};

  return {
    memories,

    get(slug: string): NPCMemory {
      if (!memories[slug]) {
        memories[slug] = createDefaultMemory(slug);
      }
      return memories[slug];
    },

    set(memory: NPCMemory): void {
      memories[memory.slug] = memory;
    },
  };
}

// ============================================
// Template Variables from Memory
// ============================================

export function getMemoryVariables(memory: NPCMemory): Record<string, string | number> {
  const strongestBond = getStrongestTraumaBond(memory);
  const mostMemorable = getMostMemorableEvent(memory);

  return {
    myDeaths: memory.deaths,
    witnessedDeaths: memory.witnessedDeaths,
    traumaBondPartner: strongestBond || 'no one',
    traumaBondCount: Object.keys(memory.traumaBonds).length,
    mostMemorableEvent: mostMemorable?.details || 'nothing notable',
    shortTermMemoryCount: memory.shortTerm.length,
    longTermMemoryCount: memory.longTerm.length,
  };
}
