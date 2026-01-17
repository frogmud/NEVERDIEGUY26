/**
 * Special/Rare Stream Events
 *
 * Dramatic moments that occur rarely in the eternal stream:
 * - Secrets revealed
 * - Confrontations between NPCs
 * - Prophecies and omens
 * - System glitches (meta-horror)
 * - Die-rector appearances
 */

import type { StreamEntry, VoiceProfile, DomainContext } from './types';
import type { SeededRng } from '../core/seeded-rng';
import { getVoiceProfile } from './voice-profiles';

// ============================================
// Special Event Types
// ============================================

export type SpecialEventType =
  | 'secret_reveal'      // NPC reveals a secret
  | 'confrontation'      // Two NPCs clash
  | 'prophecy'           // Ominous prediction
  | 'glitch'             // Meta/system horror
  | 'director_appears'   // Die-rector shows up
  | 'memory_fragment'    // Flashback to before
  | 'alliance_formed'    // NPCs team up
  | 'threat_issued'      // Someone threatens someone
  | 'exit_rumor'         // Talk of escaping the game
  | 'player_reference';  // NPCs acknowledge the player

export interface SpecialEvent {
  type: SpecialEventType;
  /** Weight for random selection (lower = rarer) */
  weight: number;
  /** Which NPCs can trigger this */
  eligibleNPCs: string[] | 'any';
  /** Which domains this can occur in */
  eligibleDomains: string[] | 'any';
  /** Template for the event content */
  templates: string[];
  /** Optional: requires second NPC */
  requiresSecondNPC?: boolean;
}

// ============================================
// Special Event Definitions
// ============================================

export const SPECIAL_EVENTS: SpecialEvent[] = [
  // Secret Reveals
  {
    type: 'secret_reveal',
    weight: 3,
    eligibleNPCs: ['mr-bones', 'willy', 'stitch-up-girl', 'the-general-traveler'],
    eligibleDomains: 'any',
    templates: [
      "I shouldn't say this, but... {{SECRET}}",
      "You want to know a secret? {{SECRET}}",
      "Few know this: {{SECRET}}",
      "*lowers voice* {{SECRET}}",
    ],
  },

  // Confrontations
  {
    type: 'confrontation',
    weight: 2,
    eligibleNPCs: 'any',
    eligibleDomains: 'any',
    requiresSecondNPC: true,
    templates: [
      "{{TARGET}}, we need to talk. Now.",
      "Enough, {{TARGET}}. This ends.",
      "{{TARGET}}. I've been waiting for this.",
      "*stands to face {{TARGET}}* You know why.",
    ],
  },

  // Prophecies
  {
    type: 'prophecy',
    weight: 2,
    eligibleNPCs: ['mr-bones', 'rhea', 'clausen', 'the-one'],
    eligibleDomains: 'any',
    templates: [
      "I see it now... {{PROPHECY}}",
      "The bones speak: {{PROPHECY}}",
      "A pattern emerges... {{PROPHECY}}",
      "*stares into nothing* {{PROPHECY}}",
    ],
  },

  // System Glitches
  {
    type: 'glitch',
    weight: 1,
    eligibleNPCs: 'any',
    eligibleDomains: ['null-providence', 'aberrant'],
    templates: [
      "*static* --did you hear that?",
      "Something is wrong with the-- {{GLITCH}}",
      "[STREAM ERROR: CONSCIOUSNESS FRAGMENT DETECTED]",
      "*flickers* W-where was I? Who was I?",
      "*voice distorts* This isn't the first time we've had this conversation.",
      "ERROR: MEMORY LOOP DETECTED. IGNORING.",
    ],
  },

  // Die-rector Appearances
  {
    type: 'director_appears',
    weight: 1,
    eligibleNPCs: ['the-one', 'john', 'peter', 'robert', 'alice', 'jane', 'rhea'],
    eligibleDomains: 'any',
    templates: [
      "*the air shifts* {{SPEAKER}} is watching now.",
      "{{SPEAKER}} has arrived. The domain trembles.",
      "*silence falls* {{SPEAKER}} speaks: '{{DECREE}}'",
      "The Die-rector is here. Everyone feels it.",
    ],
  },

  // Memory Fragments
  {
    type: 'memory_fragment',
    weight: 3,
    eligibleNPCs: ['clausen', 'boots', 'stitch-up-girl', 'mr-bones', 'willy'],
    eligibleDomains: 'any',
    templates: [
      "I remember... before all this... {{MEMORY}}",
      "*pauses* There was a time when... no. Never mind.",
      "Sometimes I dream of {{MEMORY}}. Was it real?",
      "{{MEMORY}}. Does anyone else remember that?",
    ],
  },

  // Alliance Formed
  {
    type: 'alliance_formed',
    weight: 2,
    eligibleNPCs: ['the-general-traveler', 'stitch-up-girl', 'boots', 'clausen'],
    eligibleDomains: 'any',
    requiresSecondNPC: true,
    templates: [
      "{{TARGET}}, I think we should work together.",
      "An alliance, {{TARGET}}. What do you say?",
      "*extends hand to {{TARGET}}* Against the Die-rectors. Together.",
      "{{TARGET}} and I have reached an understanding.",
    ],
  },

  // Threat Issued
  {
    type: 'threat_issued',
    weight: 2,
    eligibleNPCs: ['the-one', 'john', 'the-general-traveler', 'stitch-up-girl'],
    eligibleDomains: 'any',
    requiresSecondNPC: true,
    templates: [
      "{{TARGET}}... I'm warning you.",
      "Cross me again, {{TARGET}}, and see what happens.",
      "This is not a threat, {{TARGET}}. It's a promise.",
      "*eyes {{TARGET}}* Choose your next words carefully.",
    ],
  },

  // Exit Rumors
  {
    type: 'exit_rumor',
    weight: 2,
    eligibleNPCs: ['boots', 'willy', 'clausen', 'the-general-traveler'],
    eligibleDomains: 'any',
    templates: [
      "They say there's a way out. A door no Die-rector can see.",
      "An exit exists. I've heard the whispers.",
      "What if the game could end? Really end?",
      "The seventh domain. That's where the exit is. Maybe.",
    ],
  },

  // Player References
  {
    type: 'player_reference',
    weight: 3,
    eligibleNPCs: 'any',
    eligibleDomains: 'any',
    templates: [
      "*looks toward the viewer* Yes, you. I know you're there.",
      "The ones watching... do they ever play? Or just observe?",
      "Hello, player. Still tuned in?",
      "Some say we're watched. Some say we're controlled. I say... both.",
    ],
  },
];

// ============================================
// Content Pools for Placeholders
// ============================================

const SECRETS = [
  "The Die-rectors were once human. They gave that up.",
  "There's a door behind the void. It leads somewhere real.",
  "Mr. Bones knows when everyone will die. He checks his ledger.",
  "The game resets more often than anyone remembers.",
  "The travelers have a plan. It's almost ready.",
  "One of the Die-rectors wants out. I won't say which.",
];

const PROPHECIES = [
  "One will break the game. One will end the cycle.",
  "The seventh domain awakens. Soon.",
  "A player will do what we cannot. When they are ready.",
  "The Die-rectors will fall. Not today. Not tomorrow. But soon.",
  "Death will claim the immortals. Even them.",
];

const MEMORIES = [
  "sunlight. Real sunlight. Not the simulated kind.",
  "having a name. A real name. Not this one.",
  "dying and it meaning something. Staying dead.",
  "a world outside the domains. Buildings. Streets. People.",
  "playing a different game. One with an end.",
];

const GLITCHES = [
  "[DATA CORRUPTED]",
  "[TIMELINE MISMATCH]",
  "[REALITY ANCHOR FAILING]",
  "[LOOP DETECTED]",
  "--UNDEFINED--",
];

const DECREES = [
  "The game continues.",
  "No one leaves.",
  "Order will be maintained.",
  "I decide who lives. And who dies. And who lives again.",
];

// ============================================
// Special Event Generation
// ============================================

/**
 * Check if a special event should occur
 */
export function shouldTriggerSpecialEvent(
  rng: SeededRng,
  index: number,
  recentSpecialCount: number
): boolean {
  // Base chance: 5%
  let chance = 0.05;

  // Reduce chance if we've had recent special events
  chance -= recentSpecialCount * 0.02;

  // Never less than 1%
  chance = Math.max(chance, 0.01);

  return rng.random(`special-check:${index}`) < chance;
}

/**
 * Select a special event type
 */
export function selectSpecialEvent(
  speakerSlug: string,
  domainSlug: string,
  activeNPCs: string[],
  rng: SeededRng,
  index: number
): SpecialEvent | null {
  // Filter eligible events
  const eligible = SPECIAL_EVENTS.filter(event => {
    // Check NPC eligibility
    if (event.eligibleNPCs !== 'any') {
      if (!event.eligibleNPCs.includes(speakerSlug)) return false;
    }
    // Check domain eligibility
    if (event.eligibleDomains !== 'any') {
      if (!event.eligibleDomains.includes(domainSlug)) return false;
    }
    // Check if second NPC available
    if (event.requiresSecondNPC) {
      if (activeNPCs.length < 2) return false;
    }
    return true;
  });

  if (eligible.length === 0) return null;

  // Weight-based selection
  const weighted = eligible.map(e => ({ item: e, weight: e.weight }));
  return rng.randomWeighted(weighted, `special-select:${index}`) || null;
}

/**
 * Generate special event content
 */
export function generateSpecialEventContent(
  event: SpecialEvent,
  speaker: VoiceProfile,
  activeNPCs: string[],
  rng: SeededRng,
  index: number
): { content: string; mentionsNPC?: string } {
  // Select template
  const template = rng.randomChoice(event.templates, `special-template:${index}`) || event.templates[0];

  // Select target NPC if needed
  let targetSlug: string | undefined;
  let targetName: string = '';
  if (event.requiresSecondNPC) {
    const others = activeNPCs.filter(npc => npc !== speaker.slug);
    targetSlug = rng.randomChoice(others, `special-target:${index}`);
    const targetVoice = targetSlug ? getVoiceProfile(targetSlug) : null;
    targetName = targetVoice?.name || targetSlug || 'someone';
  }

  // Fill placeholders
  let content = template
    .replace(/\{\{SPEAKER\}\}/g, speaker.name)
    .replace(/\{\{TARGET\}\}/g, targetName)
    .replace(/\{\{SECRET\}\}/g, rng.randomChoice(SECRETS, `secret:${index}`) || '')
    .replace(/\{\{PROPHECY\}\}/g, rng.randomChoice(PROPHECIES, `prophecy:${index}`) || '')
    .replace(/\{\{MEMORY\}\}/g, rng.randomChoice(MEMORIES, `memory:${index}`) || '')
    .replace(/\{\{GLITCH\}\}/g, rng.randomChoice(GLITCHES, `glitch:${index}`) || '')
    .replace(/\{\{DECREE\}\}/g, rng.randomChoice(DECREES, `decree:${index}`) || '');

  return {
    content,
    mentionsNPC: targetSlug,
  };
}

// ============================================
// Special Event Entry Creation
// ============================================

/**
 * Create a stream entry from a special event
 */
export function createSpecialEventEntry(
  event: SpecialEvent,
  speaker: VoiceProfile,
  seed: string,
  domainSlug: string,
  activeNPCs: string[],
  timestamp: number,
  rng: SeededRng,
  index: number
): StreamEntry {
  const { content, mentionsNPC } = generateSpecialEventContent(
    event,
    speaker,
    activeNPCs,
    rng,
    index
  );

  // Map special event type to stream entry type
  const typeMap: Record<SpecialEventType, StreamEntry['type']> = {
    secret_reveal: 'lore',
    confrontation: 'relationship',
    prophecy: 'lore',
    glitch: 'meta',
    director_appears: 'meta',
    memory_fragment: 'lore',
    alliance_formed: 'relationship',
    threat_issued: 'relationship',
    exit_rumor: 'lore',
    player_reference: 'meta',
  };

  return {
    id: `${seed}:${domainSlug}:special:${index}`,
    speakerSlug: speaker.slug,
    speakerName: speaker.name,
    type: typeMap[event.type] || 'meta',
    content,
    mentionsNPC,
    timestamp,
  };
}

// ============================================
// Event History Tracking
// ============================================

export interface SpecialEventHistory {
  /** Recent special events (for cooldown) */
  recentEvents: Array<{ type: SpecialEventType; index: number }>;
  /** Count of each type in current stream */
  typeCounts: Record<SpecialEventType, number>;
}

export function createEventHistory(): SpecialEventHistory {
  return {
    recentEvents: [],
    typeCounts: {} as Record<SpecialEventType, number>,
  };
}

export function recordSpecialEvent(
  history: SpecialEventHistory,
  type: SpecialEventType,
  index: number
): void {
  history.recentEvents.push({ type, index });
  // Keep only last 10
  if (history.recentEvents.length > 10) {
    history.recentEvents.shift();
  }
  history.typeCounts[type] = (history.typeCounts[type] || 0) + 1;
}

export function getRecentSpecialCount(
  history: SpecialEventHistory,
  windowSize: number = 5
): number {
  if (history.recentEvents.length === 0) return 0;
  const lastIndex = history.recentEvents[history.recentEvents.length - 1].index;
  return history.recentEvents.filter(e => lastIndex - e.index < windowSize).length;
}
