/**
 * Event-Driven NPC Trigger System
 *
 * NPCs ping on game events, not player whim.
 * Rate limited to prevent spam and preserve meaningful moments.
 */

import type {
  NPCTriggerEvent,
  TriggerConfig,
  ChatContext,
  RateLimitState,
  TemplatePool,
  DiceRollEventPayload,
} from './types';
import { CONTEXT_CONFIGS } from './types';

// ============================================
// Trigger Configurations
// ============================================

/**
 * Default trigger configurations for each event type
 */
export const TRIGGER_CONFIGS: TriggerConfig[] = [
  // Room transitions
  {
    event: 'room_clear',
    eligibleNPCs: ['the-one', 'robert', 'alice', 'jane', 'willy', 'mr-bones'],
    probability: 0.15, // 15% chance per room
    cooldownRooms: 3,
  },

  // Shop events - high priority for merchants
  {
    event: 'shop_open',
    eligibleNPCs: ['willy', 'mr-bones', 'dr-maxwell', 'king-james'],
    probability: 0.8, // 80% chance when entering shop
    cooldownRooms: 0, // No cooldown for shop messages
    contextOverride: 'hub',
  },

  // Boss encounters - dramatic moments
  {
    event: 'boss_sighted',
    eligibleNPCs: ['the-one', 'robert', 'peter', 'alice', 'jane', 'john'],
    probability: 0.6, // 60% chance for boss warning
    cooldownRooms: 0, // Boss stinger exception
    contextOverride: 'transition',
  },

  // Death - Die-rectors comment on mortality
  {
    event: 'player_death',
    eligibleNPCs: ['the-one', 'peter', 'mr-bones'],
    probability: 0.4, // 40% chance
    cooldownRooms: 1,
    contextOverride: 'transition',
  },

  // Relic discovery
  {
    event: 'relic_found',
    eligibleNPCs: ['willy', 'the-one', 'king-james'],
    probability: 0.5,
    cooldownRooms: 2,
  },

  // Low health warning
  {
    event: 'low_integrity',
    eligibleNPCs: ['mr-bones', 'peter', 'the-one'],
    probability: 0.3,
    cooldownRooms: 5, // Don't spam when dying repeatedly
  },

  // High heat - NPCs get nervous
  {
    event: 'high_heat',
    eligibleNPCs: ['willy', 'robert', 'mr-bones'],
    probability: 0.25,
    cooldownRooms: 4,
  },

  // Domain entry - domain owner greets
  {
    event: 'domain_enter',
    eligibleNPCs: ['the-one', 'john', 'peter', 'robert', 'alice', 'jane'],
    probability: 0.7, // High chance for domain owner
    cooldownRooms: 0, // Per-domain, not per-room
    contextOverride: 'transition',
  },

  // Favor milestone
  {
    event: 'favor_threshold',
    eligibleNPCs: [], // Filled dynamically based on which NPC hit threshold
    probability: 1.0, // Always fire when threshold crossed
    cooldownRooms: 0,
  },

  // Run lifecycle
  {
    event: 'run_start',
    eligibleNPCs: ['the-one', 'willy', 'mr-bones'],
    probability: 0.5,
    cooldownRooms: 0,
    contextOverride: 'transition',
  },
  {
    event: 'run_end',
    eligibleNPCs: ['the-one', 'peter', 'mr-bones'],
    probability: 0.6,
    cooldownRooms: 0,
    contextOverride: 'hub',
  },

  // Dice roll events - Die-rectors comment on doubles/triples
  {
    event: 'dice_rolled',
    eligibleNPCs: ['the-one', 'john', 'peter', 'robert', 'alice', 'jane'],
    probability: 0.6, // 60% chance for Die-rector commentary on special rolls
    cooldownRooms: 0, // Can fire each special roll
    contextOverride: 'combat',
  },
];

// ============================================
// Trigger to Pool Mapping
// ============================================

/**
 * Map trigger events to appropriate template pools
 */
export function mapTriggerToPool(event: NPCTriggerEvent): TemplatePool {
  const mapping: Record<NPCTriggerEvent, TemplatePool> = {
    room_clear: 'reaction',
    shop_open: 'salesPitch',
    boss_sighted: 'threat',
    player_death: 'reaction',
    relic_found: 'reaction',
    low_integrity: 'hint',
    high_heat: 'threat',
    domain_enter: 'greeting',
    favor_threshold: 'reaction',
    run_start: 'greeting',
    run_end: 'farewell',
    dice_rolled: 'reaction',
  };
  return mapping[event];
}

// ============================================
// Rate Limiting
// ============================================

/**
 * Create initial rate limit state for a run
 */
export function createRateLimitState(): RateLimitState {
  return {
    messagesThisRoom: 0,
    lastTriggerByType: {} as Record<NPCTriggerEvent, number>,
    bossStingerUsed: false,
  };
}

/**
 * Check if a trigger can fire given current rate limits
 */
export function canTriggerFire(
  event: NPCTriggerEvent,
  config: TriggerConfig,
  state: RateLimitState,
  currentRoom: number,
  context: ChatContext
): { canFire: boolean; reason?: string } {
  const contextConfig = CONTEXT_CONFIGS[context];

  // Check room message limit
  if (state.messagesThisRoom >= contextConfig.maxInboundPerRoom) {
    // Boss stinger exception
    if (event === 'boss_sighted' && !state.bossStingerUsed) {
      return { canFire: true }; // Allow boss stinger as exception
    }
    return { canFire: false, reason: 'room_limit_reached' };
  }

  // Check cooldown
  const lastFired = state.lastTriggerByType[event];
  if (lastFired !== undefined) {
    const roomsSinceLast = currentRoom - lastFired;
    if (roomsSinceLast < config.cooldownRooms) {
      return {
        canFire: false,
        reason: `cooldown: ${config.cooldownRooms - roomsSinceLast} rooms remaining`,
      };
    }
  }

  return { canFire: true };
}

/**
 * Record that a trigger fired (updates rate limit state)
 */
export function recordTriggerFired(
  event: NPCTriggerEvent,
  state: RateLimitState,
  currentRoom: number
): RateLimitState {
  return {
    ...state,
    messagesThisRoom: state.messagesThisRoom + 1,
    lastTriggerByType: {
      ...state.lastTriggerByType,
      [event]: currentRoom,
    },
    bossStingerUsed: event === 'boss_sighted' ? true : state.bossStingerUsed,
  };
}

/**
 * Reset room-specific limits (call when entering new room)
 */
export function resetRoomLimits(state: RateLimitState): RateLimitState {
  return {
    ...state,
    messagesThisRoom: 0,
    bossStingerUsed: false,
  };
}

// ============================================
// Trigger Evaluation
// ============================================

/**
 * Evaluate which NPC should respond to a trigger event
 *
 * Returns the selected NPC slug, or null if no NPC should respond
 */
export function evaluateTrigger(
  event: NPCTriggerEvent,
  currentRoom: number,
  currentDomain: string,
  rng: { chance: (ns: string, pct: number) => boolean; pick: <T>(ns: string, items: T[]) => T | undefined },
  state: RateLimitState,
  context: ChatContext,
  domainOwners: Record<string, string> = DEFAULT_DOMAIN_OWNERS
): { npcSlug: string | null; updatedState: RateLimitState } {
  // Find config for this event
  const config = TRIGGER_CONFIGS.find((c) => c.event === event);
  if (!config) {
    return { npcSlug: null, updatedState: state };
  }

  // Check rate limits
  const effectiveContext = config.contextOverride || context;
  const { canFire, reason } = canTriggerFire(event, config, state, currentRoom, effectiveContext);
  if (!canFire) {
    console.debug(`[NPC Trigger] ${event} blocked: ${reason}`);
    return { npcSlug: null, updatedState: state };
  }

  // Check probability
  const namespace = `trigger:${event}:room:${currentRoom}`;
  if (!rng.chance(namespace, config.probability * 100)) {
    return { npcSlug: null, updatedState: state };
  }

  // Get eligible NPCs
  let eligibleNPCs = [...config.eligibleNPCs];

  // For domain_enter, prioritize domain owner
  if (event === 'domain_enter') {
    const domainOwner = domainOwners[currentDomain];
    if (domainOwner) {
      // Domain owner gets priority
      eligibleNPCs = [domainOwner, ...eligibleNPCs.filter((n) => n !== domainOwner)];
    }
  }

  // Pick an NPC
  const selectedNPC = rng.pick(`${namespace}:select`, eligibleNPCs);
  if (!selectedNPC) {
    return { npcSlug: null, updatedState: state };
  }

  // Update state
  const updatedState = recordTriggerFired(event, state, currentRoom);

  return { npcSlug: selectedNPC, updatedState };
}

// ============================================
// Domain Owners (Die-rectors)
// ============================================

export const DEFAULT_DOMAIN_OWNERS: Record<string, string> = {
  'null-providence': 'the-one',
  earth: 'john',
  'shadow-keep': 'peter',
  infernus: 'robert',
  'frost-reach': 'alice',
  aberrant: 'jane',
};

// ============================================
// Die Type to Die-rector Mapping
// ============================================

export const DIE_TO_DIRECTOR: Record<string, string> = {
  d4: 'the-one',
  d6: 'john',
  d8: 'peter',
  d10: 'robert',
  d12: 'alice',
  d20: 'jane',
};

// ============================================
// Dice Roll Trigger Evaluation
// ============================================

/**
 * Evaluate whether a dice roll should trigger Die-rector commentary.
 * Only fires for non-common rolls (doubles, triples, straights).
 * Picks the Die-rector based on the primary die used.
 */
export function evaluateDiceRollTrigger(
  payload: DiceRollEventPayload,
  currentRoom: number,
  rng: { chance: (ns: string, pct: number) => boolean },
  state: RateLimitState
): { npcSlug: string | null; updatedState: RateLimitState } {
  // Only trigger for non-common rolls
  if (payload.rarity === 'common') {
    return { npcSlug: null, updatedState: state };
  }

  // Find config for dice_rolled
  const config = TRIGGER_CONFIGS.find((c) => c.event === 'dice_rolled');
  if (!config) {
    return { npcSlug: null, updatedState: state };
  }

  // Check rate limits
  const { canFire, reason } = canTriggerFire('dice_rolled', config, state, currentRoom, 'combat');
  if (!canFire) {
    console.debug(`[NPC Trigger] dice_rolled blocked: ${reason}`);
    return { npcSlug: null, updatedState: state };
  }

  // Check probability - higher for rarer rolls
  const rarityProbBoost: Record<string, number> = {
    doubles: 0,      // Base probability
    triples: 0.2,    // +20% for triples
    straight: 0.15,  // +15% for straights
  };
  const adjustedProb = config.probability + (rarityProbBoost[payload.rarity] || 0);

  const namespace = `trigger:dice_rolled:room:${currentRoom}:roll:${payload.totalScore}`;
  if (!rng.chance(namespace, adjustedProb * 100)) {
    return { npcSlug: null, updatedState: state };
  }

  // Pick Die-rector based on primary die
  const selectedNPC = DIE_TO_DIRECTOR[payload.primaryDie] || 'the-one';

  // Update state
  const updatedState = recordTriggerFired('dice_rolled', state, currentRoom);

  return { npcSlug: selectedNPC, updatedState };
}

// ============================================
// Context Determination
// ============================================

/**
 * Determine chat context based on game state
 */
export function determineChatContext(
  inCombat: boolean,
  inShop: boolean,
  inHub: boolean,
  betweenRooms: boolean
): ChatContext {
  if (inCombat) return 'combat';
  if (inHub || inShop) return 'hub';
  if (betweenRooms) return 'transition';
  return 'transition'; // Default
}

// ============================================
// Trigger Priority (for when multiple could fire)
// ============================================

/**
 * Priority order for triggers (higher = fires first)
 */
export const TRIGGER_PRIORITY: Record<NPCTriggerEvent, number> = {
  boss_sighted: 100,
  player_death: 90,
  favor_threshold: 80,
  run_end: 75,
  low_integrity: 70,
  relic_found: 60,
  dice_rolled: 58, // Die-rector commentary on special rolls
  shop_open: 55,
  domain_enter: 50,
  run_start: 45,
  high_heat: 40,
  room_clear: 10,
};

/**
 * Sort events by priority (for processing order)
 */
export function sortByPriority(events: NPCTriggerEvent[]): NPCTriggerEvent[] {
  return [...events].sort((a, b) => TRIGGER_PRIORITY[b] - TRIGGER_PRIORITY[a]);
}
