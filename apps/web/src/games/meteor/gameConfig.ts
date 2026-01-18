// Game configuration for Dice Meteor
// Defines domains, events, rewards, and progression

import { getDomainPosition, isFinale } from '../../data/domains';

// ============================================
// Balance Constants (pulled by selectors)
// ============================================

/** Number of events (zones) per domain before advancing */
export const EVENTS_PER_DOMAIN = 3;

/** Events required before boss appears */
export const BOSS_THRESHOLD = 3;

/** Integrity thresholds for status display */
export const INTEGRITY_THRESHOLDS = {
  warning: 60,
  critical: 30,
} as const;

export type EventType = 'small' | 'big' | 'boss';
export type GamePhase =
  | 'event_select'    // Legacy: Door selector screen (deprecated in Round 30)
  | 'door_select'     // NEW: Door overlay on Phaser game
  | 'playing'         // Active gameplay in room
  | 'event_complete'  // Room results overlay
  | 'shop'            // Requisition (between rooms/domains)
  | 'encounter'       // Wanderer encounter
  | 'audit_warning'   // Pre-boss prep
  | 'game_over';      // Thread corrupted or archived

// Ledger event types for run history
export type LedgerEventType =
  | 'THREAD_START'
  | 'PROTOCOL_ROLL'
  | 'SHOP_BUY'
  | 'ROOM_CLEAR'
  | 'DOOR_PICK'
  | 'WANDERER_CHOICE'
  | 'AUDIT_CLEAR';

// Structured ledger event (not strings)
export interface LedgerEvent {
  type: LedgerEventType;
  timestamp: number;
  payload: Record<string, unknown>;
}

// Protocol Roll result (3D6)
export interface ProtocolRoll {
  domain: number;    // 1-6: Maps to starting domain + UI flavor
  modifier: number;  // 1-6: Difficulty scalar
  sponsor: number;   // 1-6: Wanderer bias + starter perk tag
}

export interface EventConfig {
  type: EventType;
  label: string;
  badgeColor: string;
  badgeBorder: string;
  badgeTextColor: string;
  scoreGoalMultiplier: number; // Multiplied by domain base goal
  rewardTier: number; // 1-5, affects gold payout
  summonModifier: number; // 0 = normal, -1 = one less summon
  skippable: boolean;
}

export interface DomainConfig {
  id: number;
  name: string;
  baseScoreGoal: number;
  baseSummons: number;
  baseTributes: number;
  events: EventConfig[];
}

// Event templates
export const EVENT_TEMPLATES: Record<EventType, Omit<EventConfig, 'scoreGoalMultiplier'>> = {
  small: {
    type: 'small',
    label: 'Small',
    badgeColor: '#d4b896',
    badgeBorder: '#a08060',
    badgeTextColor: '#5a4a3a',
    rewardTier: 1,
    summonModifier: 0,
    skippable: true,
  },
  big: {
    type: 'big',
    label: 'Big',
    badgeColor: '#5a8a9a',
    badgeBorder: '#3a6a7a',
    badgeTextColor: '#1a3a4a',
    rewardTier: 2,
    summonModifier: 0,
    skippable: true,
  },
  boss: {
    type: 'boss',
    label: 'Boss',
    badgeColor: '#c4a000',
    badgeBorder: '#8a7000',
    badgeTextColor: '#3a3000',
    rewardTier: 3,
    summonModifier: -1, // Boss gives -1 summon
    skippable: false,
  },
};

// Gold reward calculation based on tier and domain position
// Uses domain position in progression order (not raw ID) for scaling
export function calculateGoldReward(tier: number, domain: number): number {
  const baseRewards = [0, 50, 100, 200]; // tier 1, 2, 3
  const position = getDomainPosition(domain);
  const domainMultiplier = 1 + (position - 1) * 0.5; // Position 1 = 1x, Position 6 = 3.5x
  return Math.floor((baseRewards[tier] || 50) * domainMultiplier);
}

// Format reward display string
export function formatRewardTier(tier: number): string {
  return '$'.repeat(tier + 2) + '+'; // tier 1 = $$$+, tier 2 = $$$$+, tier 3 = $$$$$+
}

// Domain configurations
export const DOMAINS: DomainConfig[] = [
  {
    id: 1,
    name: 'The Meadow',
    baseScoreGoal: 3000,
    baseSummons: 3,
    baseTributes: 3,
    events: [
      { ...EVENT_TEMPLATES.small, scoreGoalMultiplier: 0.6 },
      { ...EVENT_TEMPLATES.big, scoreGoalMultiplier: 1.0 },
      { ...EVENT_TEMPLATES.boss, scoreGoalMultiplier: 1.5 },
    ],
  },
  {
    id: 2,
    name: 'The Forest',
    baseScoreGoal: 4000,
    baseSummons: 3,
    baseTributes: 3,
    events: [
      { ...EVENT_TEMPLATES.small, scoreGoalMultiplier: 0.6 },
      { ...EVENT_TEMPLATES.big, scoreGoalMultiplier: 1.0 },
      { ...EVENT_TEMPLATES.boss, scoreGoalMultiplier: 1.5 },
    ],
  },
  {
    id: 3,
    name: 'The Caverns',
    baseScoreGoal: 5000,
    baseSummons: 3,
    baseTributes: 3,
    events: [
      { ...EVENT_TEMPLATES.small, scoreGoalMultiplier: 0.6 },
      { ...EVENT_TEMPLATES.big, scoreGoalMultiplier: 1.0 },
      { ...EVENT_TEMPLATES.boss, scoreGoalMultiplier: 1.5 },
    ],
  },
  {
    id: 4,
    name: 'The Ruins',
    baseScoreGoal: 6500,
    baseSummons: 3,
    baseTributes: 3,
    events: [
      { ...EVENT_TEMPLATES.small, scoreGoalMultiplier: 0.6 },
      { ...EVENT_TEMPLATES.big, scoreGoalMultiplier: 1.0 },
      { ...EVENT_TEMPLATES.boss, scoreGoalMultiplier: 1.5 },
    ],
  },
  {
    id: 5,
    name: 'The Abyss',  // Null Providence - THE FINALE
    baseScoreGoal: 8000,
    baseSummons: 3,
    baseTributes: 3,
    events: [
      { ...EVENT_TEMPLATES.small, scoreGoalMultiplier: 0.6 },
      { ...EVENT_TEMPLATES.big, scoreGoalMultiplier: 1.0 },
      { ...EVENT_TEMPLATES.boss, scoreGoalMultiplier: 1.8 }, // Final boss is harder
    ],
  },
  {
    id: 6,
    name: 'The Throne',  // Aberrant - now early game (position 2)
    baseScoreGoal: 10000,
    baseSummons: 3,
    baseTributes: 3,
    events: [
      { ...EVENT_TEMPLATES.small, scoreGoalMultiplier: 0.6 },
      { ...EVENT_TEMPLATES.big, scoreGoalMultiplier: 1.0 },
      { ...EVENT_TEMPLATES.boss, scoreGoalMultiplier: 1.5 },
    ],
  },
];

// Get event score goal for a specific domain and event
export function getEventScoreGoal(domainId: number, eventIndex: number): number {
  const domain = DOMAINS.find((d) => d.id === domainId);
  if (!domain || !domain.events[eventIndex]) return 5000;
  return Math.floor(domain.baseScoreGoal * domain.events[eventIndex].scoreGoalMultiplier);
}

// Get summons for a specific domain and event
export function getEventSummons(domainId: number, eventIndex: number): number {
  const domain = DOMAINS.find((d) => d.id === domainId);
  if (!domain || !domain.events[eventIndex]) return 3;
  return domain.baseSummons + domain.events[eventIndex].summonModifier;
}

// Get tributes for a specific domain
export function getEventTributes(domainId: number): number {
  const domain = DOMAINS.find((d) => d.id === domainId);
  return domain?.baseTributes ?? 3;
}

// Satchel slot for items brought into run or found as loot
export interface SatchelSlot {
  itemSlug: string;
  quantity: number;
  fromStash?: boolean;          // Track origin for return to stash
}

// Inventory types
export interface Inventory {
  // Existing (run-specific)
  dice: Record<string, number>; // e.g., { d4: 1, d6: 2, ... }
  powerups: string[];
  upgrades: string[];

  // New (satchel system)
  satchel: SatchelSlot[];       // Items brought from stash
  loot: SatchelSlot[];          // Items found during run
  activeItem: string | null;    // Currently equipped item slug (in sidebar)
  satchelCapacity: number;      // Max slots (default: 5)
}

// Initial game state
export interface GameState {
  phase: GamePhase;
  currentDomain: number;
  currentEvent: number; // 0, 1, 2 for the three events (rooms) - legacy
  roomNumber: number;   // 1, 2, 3 for rooms in current domain (Round 30)
  completedEvents: boolean[]; // Track which events are done [false, false, false]
  gold: number;
  totalScore: number; // Accumulated across all events
  inventory: Inventory;
  gameWon: boolean; // True if all domains cleared, false if died
  domainPressure: number; // Accumulated from encounter draws (affects next event difficulty)
  skipPressure: number; // Accumulated from skipping events (increases aggressive encounters)
  currentEncounter: EncounterState | null; // Active encounter if any
  runStats: {
    npcsSquished: number;
    diceThrown: number;
    eventsCompleted: number;
    eventsSkipped: number;
    encountersWon: number;
    encountersLost: number;
    // Round 48: New stats for GameOverModal
    bestRoll: number;
    mostRolled: string;
    reloads: number;
    purchases: number;
    shopRemixes: number;
    discoveries: number;
    killedBy?: string;
    // Speedrun stats
    totalTimeMs: number;
    avgEventTimeMs: number;
    fastestEventMs: number;
    eventTimesMs: number[];  // Track individual event times
    variantCounts: { swift: number; standard: number; grueling: number };
  };

  // Thread Identity (Round 28)
  threadId: string;           // 6-char hex seed (master RNG seed)
  protocolRoll?: ProtocolRoll; // Result of Protocol Roll (3D6)

  // Tier System (Round 28)
  tier: number;               // Requisition pool tier (1-5)

  // Wanderer State (Round 28)
  favorTokens: number;        // Accumulated from Accept choices
  calmBonus: number;          // Accumulated from Decline choices (reduces reroll cost)
  heat: number;               // Accumulated from Provoke choices (harder doors, better rewards)

  // Ledger (Round 28)
  ledger: LedgerEvent[];      // Structured run history for Archive

  // Integrity (future - placeholder for now)
  integrity: number;          // 100 max, game over at 0
}

// Encounter state for Cee-lo style duels
export interface EncounterState {
  npcSlug: string;
  npcName: string;
  npcDice: number; // Die sides for NPC
  playerDice: number; // Die sides for player
  npcBonus: number;
  drawCount: number;
  reward: { type: 'gold' | 'item'; amount: number };
}

// Default starting dice (1 of each)
export const DEFAULT_DICE_INVENTORY: Record<string, number> = {
  d4: 1,
  d6: 1,
  d8: 1,
  d10: 1,
  d12: 1,
  d20: 1,
};

export function createInitialGameState(): GameState {
  return {
    phase: 'event_select',
    currentDomain: 1,
    currentEvent: 0,
    roomNumber: 1,  // Round 30: Start at room 1
    completedEvents: [false, false, false],
    gold: 0,
    totalScore: 0,
    gameWon: false,
    domainPressure: 0,
    skipPressure: 0,
    currentEncounter: null,
    inventory: {
      dice: { ...DEFAULT_DICE_INVENTORY },
      powerups: [],
      upgrades: [],
      satchel: [],
      loot: [],
      activeItem: null,
      satchelCapacity: 5,
    },
    runStats: {
      npcsSquished: 0,
      diceThrown: 0,
      eventsCompleted: 0,
      eventsSkipped: 0,
      encountersWon: 0,
      encountersLost: 0,
      // Round 48: New stats for GameOverModal
      bestRoll: 0,
      mostRolled: 'd20',
      reloads: 0,
      purchases: 0,
      shopRemixes: 0,
      discoveries: 0,
      // Speedrun stats
      totalTimeMs: 0,
      avgEventTimeMs: 0,
      fastestEventMs: 0,
      eventTimesMs: [],
      variantCounts: { swift: 0, standard: 0, grueling: 0 },
    },
    // Thread Identity (Round 28)
    threadId: '',              // Set when thread is started
    protocolRoll: undefined,   // Set after Protocol Roll
    // Tier System (Round 28)
    tier: 1,
    // Wanderer State (Round 28)
    favorTokens: 0,
    calmBonus: 0,
    heat: 0,
    // Ledger (Round 28)
    ledger: [],
    // Integrity (Round 28)
    integrity: 100,
  };
}

// Helper to create a THREAD_START ledger event
export function createThreadStartEvent(threadId: string, protocolRoll?: ProtocolRoll, selectedTraveler?: string): LedgerEvent {
  return {
    type: 'THREAD_START',
    timestamp: Date.now(),
    payload: {
      threadId,
      protocolRoll,
      selectedTraveler,
    },
  };
}

// Helper to create a PROTOCOL_ROLL ledger event
export function createProtocolRollEvent(protocolRoll: ProtocolRoll): LedgerEvent {
  return {
    type: 'PROTOCOL_ROLL',
    timestamp: Date.now(),
    payload: {
      domain: protocolRoll.domain,
      modifier: protocolRoll.modifier,
      sponsor: protocolRoll.sponsor,
    },
  };
}

// Helper to create a DOOR_PICK ledger event
export function createDoorPickEvent(doorType: string, promises: string[], roomIndex: number): LedgerEvent {
  return {
    type: 'DOOR_PICK',
    timestamp: Date.now(),
    payload: {
      doorType,
      promises,
      roomIndex,
    },
  };
}

// Helper to create a ROOM_CLEAR ledger event
export function createRoomClearEvent(roomIndex: number, score: number, goldEarned: number): LedgerEvent {
  return {
    type: 'ROOM_CLEAR',
    timestamp: Date.now(),
    payload: {
      roomIndex,
      score,
      goldEarned,
    },
  };
}

// Helper to create a SHOP_BUY ledger event
export function createShopBuyEvent(itemSlug: string, cost: number, tier: number): LedgerEvent {
  return {
    type: 'SHOP_BUY',
    timestamp: Date.now(),
    payload: {
      itemSlug,
      cost,
      tier,
    },
  };
}

// Helper to create a WANDERER_CHOICE ledger event
export function createWandererChoiceEvent(
  wandererSlug: string,
  choice: 'accept' | 'decline' | 'provoke',
  effect: { favorTokens?: number; calmBonus?: number; heat?: number }
): LedgerEvent {
  return {
    type: 'WANDERER_CHOICE',
    timestamp: Date.now(),
    payload: {
      wandererSlug,
      choice,
      effect,
    },
  };
}

// Helper to create an AUDIT_CLEAR ledger event
export function createAuditClearEvent(domainId: number, bossDefeated: boolean): LedgerEvent {
  return {
    type: 'AUDIT_CLEAR',
    timestamp: Date.now(),
    payload: {
      domainId,
      bossDefeated,
    },
  };
}

// Helper to add a ledger event to state
export function addLedgerEvent(state: GameState, event: LedgerEvent): GameState {
  return {
    ...state,
    ledger: [...state.ledger, event],
  };
}

// ============================================
// PROTOCOL DERIVATION FROM COMBAT DICE
// First combat dice selection determines run "protocol"
// ============================================

/**
 * Die type to Die-rector (Pantheon) mapping
 * Each die type has an associated Die-rector who influences the run
 */
export const DIE_DIRECTOR_MAP: Record<string, { slug: string; name: string; element: string; domain: string }> = {
  d4:  { slug: 'the-one', name: 'The One', element: 'Void', domain: 'null-providence' },
  d6:  { slug: 'john', name: 'John', element: 'Earth', domain: 'earth' },
  d8:  { slug: 'peter', name: 'Peter', element: 'Death', domain: 'shadow-keep' },
  d10: { slug: 'robert', name: 'Robert', element: 'Fire', domain: 'infernus' },
  d12: { slug: 'alice', name: 'Alice', element: 'Ice', domain: 'frost-reach' },
  d20: { slug: 'jane', name: 'Jane', element: 'Wind', domain: 'aberrant' },
};

/**
 * Element affinity order (for combo/advantage calculations)
 */
export const ELEMENT_WHEEL = ['Void', 'Earth', 'Death', 'Fire', 'Ice', 'Wind'] as const;
export type Element = typeof ELEMENT_WHEEL[number];

/**
 * Derive protocol from first combat dice selection
 * Called when player makes their first dice throw of the run
 */
export interface DerivedProtocol {
  primaryDie: string;           // Most impactful die selected (highest sides)
  primaryDirector: string;      // Die-rector slug for primary die
  primaryElement: Element;      // Element affinity
  diceCount: number;            // How many dice were thrown
  affinity: 'single' | 'dual' | 'multi';  // Single die vs multi-die throw
}

export function deriveProtocolFromDice(selectedDice: string[]): DerivedProtocol {
  if (selectedDice.length === 0) {
    // Fallback: no dice selected (shouldn't happen)
    return {
      primaryDie: 'd20',
      primaryDirector: 'jane',
      primaryElement: 'Wind',
      diceCount: 0,
      affinity: 'single',
    };
  }

  // Primary die is the one with highest sides (most impactful)
  const dieSides: Record<string, number> = { d4: 4, d6: 6, d8: 8, d10: 10, d12: 12, d20: 20 };
  const sortedDice = [...selectedDice].sort((a, b) => (dieSides[b] || 0) - (dieSides[a] || 0));
  const primaryDie = sortedDice[0];

  const director = DIE_DIRECTOR_MAP[primaryDie] || DIE_DIRECTOR_MAP.d20;

  return {
    primaryDie,
    primaryDirector: director.slug,
    primaryElement: director.element as Element,
    diceCount: selectedDice.length,
    affinity: selectedDice.length === 1 ? 'single' : selectedDice.length === 2 ? 'dual' : 'multi',
  };
}

// ============================================
// DICE RARITY DETECTION FOR COMBAT
// Doubles/triples trigger Die-rector commentary
// ============================================

export type DiceRarity = 'common' | 'doubles' | 'triples' | 'straight';

export interface DiceRarityResult {
  rarity: DiceRarity;
  matchedValue?: number;        // The value that doubled/tripled
  involvedDice?: string[];      // Which dice types participated
}

/**
 * Detect special rolls from combat dice results
 * Used to trigger Die-rector reactions
 */
export function detectDiceRarity(results: { die: string; value: number }[]): DiceRarityResult {
  if (results.length < 2) {
    return { rarity: 'common' };
  }

  const values = results.map((r) => r.value);
  const diceTypes = results.map((r) => r.die);

  // Check for triples (3+ of same value)
  const valueCounts = values.reduce((acc, v) => {
    acc[v] = (acc[v] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  for (const [value, count] of Object.entries(valueCounts)) {
    if (count >= 3) {
      return {
        rarity: 'triples',
        matchedValue: parseInt(value),
        involvedDice: diceTypes,
      };
    }
    if (count >= 2) {
      return {
        rarity: 'doubles',
        matchedValue: parseInt(value),
        involvedDice: diceTypes,
      };
    }
  }

  // Check for straight (sequential values)
  const sortedValues = [...values].sort((a, b) => a - b);
  let isStraight = true;
  for (let i = 1; i < sortedValues.length; i++) {
    if (sortedValues[i] !== sortedValues[i - 1] + 1) {
      isStraight = false;
      break;
    }
  }
  if (isStraight && sortedValues.length >= 3) {
    return {
      rarity: 'straight',
      involvedDice: diceTypes,
    };
  }

  return { rarity: 'common' };
}

/**
 * Get the Die-rector who should comment on a dice roll
 * Based on the primary die used in the roll
 */
export function getDirectorForDice(dieType: string): { slug: string; name: string } | null {
  const director = DIE_DIRECTOR_MAP[dieType];
  return director ? { slug: director.slug, name: director.name } : null;
}

// Ledger event for protocol derivation
export function createProtocolDerivedEvent(protocol: DerivedProtocol, selectedDice: string[]): LedgerEvent {
  return {
    type: 'PROTOCOL_ROLL', // Reusing existing type for backward compatibility
    timestamp: Date.now(),
    payload: {
      derivedFrom: 'first_combat_dice',
      selectedDice,
      primaryDie: protocol.primaryDie,
      primaryDirector: protocol.primaryDirector,
      primaryElement: protocol.primaryElement,
      affinity: protocol.affinity,
    },
  };
}
