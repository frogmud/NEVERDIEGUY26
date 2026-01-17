/**
 * NPC Chat System Types
 *
 * Event-driven NPC messaging integrated into the run loop.
 * NPCs message players at meaningful beats (room clear, shop open, boss sighted, etc.)
 */

// ============================================
// Context Windows (When Chat Happens)
// ============================================

export type ChatContext = 'combat' | 'transition' | 'hub';

export interface ContextConfig {
  context: ChatContext;
  maxInboundPerRoom: number;
  allowOutbound: boolean;
  uiFormat: 'toast' | 'popup' | 'fullDM';
  typingDelay: number; // ms - combat is instant, hub is slow
}

export const CONTEXT_CONFIGS: Record<ChatContext, ContextConfig> = {
  combat: {
    context: 'combat',
    maxInboundPerRoom: 3, // Allow greeting + situational triggers
    allowOutbound: false,
    uiFormat: 'toast',
    typingDelay: 0,
  },
  transition: {
    context: 'transition',
    maxInboundPerRoom: 1, // +1 boss stinger exception handled separately
    allowOutbound: true,
    uiFormat: 'popup',
    typingDelay: 300,
  },
  hub: {
    context: 'hub',
    maxInboundPerRoom: 999, // Unlimited in hub
    allowOutbound: true,
    uiFormat: 'fullDM',
    typingDelay: 600,
  },
};

// ============================================
// Event-Driven Triggers
// ============================================

export type NPCTriggerEvent =
  | 'room_clear'
  | 'shop_open'
  | 'boss_sighted'
  | 'player_death'
  | 'relic_found'
  | 'low_integrity' // < 30%
  | 'high_heat' // > 70
  | 'domain_enter'
  | 'favor_threshold' // crossed +50 or -50
  | 'run_start'
  | 'run_end'
  | 'dice_rolled' // doubles/triples/straight - Die-rector commentary
  // Combat situation triggers (context-aware)
  | 'close_to_goal' // score > 80% of target
  | 'final_turn' // 1-2 turns remaining
  | 'big_roll' // single roll > 15
  | 'comeback' // was losing badly, now catching up
  | 'crushing_it' // score way ahead of pace
  | 'guardian_slain'; // destroyed a guardian

// ============================================
// Dice Roll Event Payload
// ============================================

export type DiceRarity = 'common' | 'doubles' | 'triples' | 'straight';

export interface DiceRollEventPayload {
  rarity: DiceRarity;
  matchedValue?: number;        // The value that doubled/tripled
  involvedDice: string[];       // Which dice types participated (e.g., ['d6', 'd6', 'd8'])
  primaryDie: string;           // Highest die used (determines which Die-rector comments)
  totalScore: number;           // Sum of all dice values
}

// ============================================
// Combat Game State (Rich Context)
// ============================================

export interface CombatGameState {
  // Score progress
  currentScore: number;
  targetScore: number;
  scoreProgress: number;        // 0-1, currentScore/targetScore

  // Turn pressure
  turnsRemaining: number;
  totalTurns: number;
  turnProgress: number;         // 0-1, how far through combat

  // Last action
  lastRollTotal: number;
  lastDiceUsed: string[];       // e.g., ['d6', 'd8', 'd12']

  // Momentum
  isWinning: boolean;           // on pace to win
  isComeback: boolean;          // was behind, now catching up
  isCrushingIt: boolean;        // way ahead of pace

  // Domain info
  domain: number;
  domainName: string;

  // Multiplier
  multiplier: number;
}

export interface TriggerConfig {
  event: NPCTriggerEvent;
  eligibleNPCs: string[]; // Which NPCs can respond
  probability: number; // 0-1, chance of firing
  cooldownRooms: number; // Min rooms between this trigger type
  contextOverride?: ChatContext; // Force specific context
}

// ============================================
// Template Pools and Moods
// ============================================

export type TemplatePool =
  | 'greeting'
  | 'farewell'
  | 'idle'
  | 'salesPitch'
  | 'threat'
  | 'challenge'
  | 'hint'
  | 'lore'
  | 'reaction';

export type MoodType =
  | 'neutral'
  | 'pleased'
  | 'annoyed'
  | 'amused'
  | 'threatening'
  | 'generous'
  | 'cryptic'
  | 'curious'
  | 'concerned'
  | 'focused';

// ============================================
// Message Purpose (What the message DOES)
// ============================================

export type MessagePurpose =
  | 'tutorial' // Early game hints
  | 'shop' // Sales, deals, inventory
  | 'warning' // Before danger (boss, trap, heat)
  | 'reward' // After success (drops, achievements)
  | 'lore' // World/character backstory
  | 'challenge' // Duel/competition offer
  | 'meta' // Breaking 4th wall, NDG style
  | 'ambient'; // Flavor, no specific purpose

// ============================================
// Action Payloads (Messages spawn gameplay)
// ============================================

export interface MessageAction {
  type:
    | 'openShop'
    | 'startChallenge'
    | 'grantHint'
    | 'offerDeal'
    | 'unlockPath'
    | 'adjustRelationship'
    | 'grantItem';
  payload?: Record<string, unknown>;
}

// ============================================
// Quick Replies (Verbs, not generic responses)
// ============================================

export type QuickReplyVerbType =
  | 'showStock'
  | 'askHint'
  | 'askLore'
  | 'plead'
  | 'challenge'
  | 'dismiss'
  | 'accept'
  | 'decline'
  | 'browse'
  | 'answer'
  | 'ask'
  | 'negotiate'
  | 'offer';

export interface QuickReplyVerb {
  verb: QuickReplyVerbType;
  label: string;
}

export const QUICK_REPLY_VERBS: Record<string, QuickReplyVerb> = {
  showStock: { verb: 'showStock', label: 'Show me stock' },
  askHint: { verb: 'askHint', label: 'Any shortcuts?' },
  askLore: { verb: 'askLore', label: 'Explain yourself' },
  plead: { verb: 'plead', label: "I'm broke" },
  challenge: { verb: 'challenge', label: 'Fight me' },
  dismiss: { verb: 'dismiss', label: 'Not now' },
  accept: { verb: 'accept', label: 'Accept' },
  decline: { verb: 'decline', label: 'Decline' },
  browse: { verb: 'browse', label: 'Browse' },
  answer: { verb: 'answer', label: 'Answer' },
  ask: { verb: 'ask', label: 'Ask' },
  negotiate: { verb: 'negotiate', label: 'Negotiate' },
  offer: { verb: 'offer', label: 'Make offer' },
};

// ============================================
// Template Conditions
// ============================================

export interface TemplateCondition {
  type:
    | 'favorLevel'
    | 'playerStat'
    | 'recentDeath'
    | 'itemOwned'
    | 'domain'
    | 'heat'
    | 'integrity'
    | 'runCount';
  comparison: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
  value: number | string;
}

// ============================================
// Response Template
// ============================================

export interface ResponseTemplate {
  id: string;
  entitySlug: string;
  pool: TemplatePool;
  mood: MoodType | 'any';

  // Content
  text: string;
  variants?: string[];

  // Purpose (what this message DOES, not just says)
  purpose: MessagePurpose;

  // Selection
  weight: number;
  conditions?: TemplateCondition[];

  // Cooldowns (prevents spam, preserves rare lines)
  cooldown?: {
    rooms?: number; // Min rooms before reuse
    oncePerRun?: boolean; // Only fire once per run
    onceEver?: boolean; // Only fire once ever (stored in player data)
  };

  // Action payload (message can spawn gameplay)
  action?: MessageAction;

  // Quick reply verbs (what player can do next)
  quickReplies?: QuickReplyVerb[];
}

// ============================================
// Personality Configuration
// ============================================

export interface NPCPersonalityConfig {
  slug: string;
  name: string;

  // Base pool weights before domain tinting
  basePoolWeights: Partial<Record<TemplatePool, number>>;

  // Active pool weights (may be tinted)
  poolWeights: Partial<Record<TemplatePool, number>>;

  // Mood triggers - conditions that shift mood
  moodTriggers: MoodTrigger[];

  // Default mood when no triggers match
  defaultMood: MoodType;
}

export interface MoodTrigger {
  trigger: TemplateCondition;
  mood: MoodType;
}

// ============================================
// Relationship Model (Mood derives from this)
// ============================================

export interface NPCRelationship {
  npcSlug: string;

  // Core relationship stats (the truth)
  respect: number; // -100 to 100 (earned through actions)
  familiarity: number; // 0 to 100 (increases with interactions)
  debt: number; // Positive = NPC owes player, negative = player owes NPC
  history: RelationshipEvent[]; // Key moments (max 10)

  // Run-specific state (resets each run)
  runInteractions: number;
  lastRoomSeen: number;
}

export interface RelationshipEvent {
  type: 'helped' | 'betrayed' | 'traded' | 'defeated' | 'spared' | 'gifted';
  timestamp: number;
  details?: string;
}

// ============================================
// Conversation State
// ============================================

export interface NPCConversation {
  npcSlug: string;
  messages: ChatMessage[];
  lastInteraction: number;

  // Per-run tracking
  recentlyUsedTemplates: string[]; // Last 5 template IDs (no repeats)
  cooldownsActive: Record<string, number>; // templateId -> roomIndex when used
  usedOncePerRun: string[]; // Templates used this run with oncePerRun flag
}

export interface ChatMessage {
  id: string;
  sender: 'player' | 'npc';
  content: string;
  timestamp: number;
  templateId?: string;
  purpose?: MessagePurpose;
  action?: MessageAction;

  // For determinism debugging
  seed?: string;
}

// ============================================
// Response Context (for selection)
// ============================================

export interface ResponseContext {
  // Run state
  runSeed: string;
  roomIndex: number;
  currentDomain: string;

  // Player state
  playerGold: number;
  playerIntegrity: number;
  playerLuckyNumber: number;
  heat: number;

  // Optional player message (if responding to player)
  playerMessage?: string;

  // Relationship cache
  relationship?: NPCRelationship;

  // Direct conversation flag - excludes ambient templates when true
  isDirectConversation?: boolean;
}

// ============================================
// Selected Response (returned by selector)
// ============================================

export interface SelectedResponse {
  text: string;
  mood: MoodType;
  templateId: string;
  purpose: MessagePurpose;
  quickReplies?: QuickReplyVerb[];

  // ACTION PAYLOAD - message can spawn gameplay
  action?: MessageAction;

  // Seed used (for determinism debugging)
  seed: string;
}

// ============================================
// Mood Effects (gameplay integration)
// ============================================

export interface MoodGameplayEffects {
  priceModifier: number; // 0.7 = 30% discount, 1.5 = 50% markup
  hintQuality: 'vague' | 'helpful' | 'detailed';
  challengeDifficulty: 'easy' | 'normal' | 'hard';
  specialOfferChance: number; // 0-1
  favorDelta: number; // Change to favor after interaction
}

// ============================================
// Storage
// ============================================

export interface NPCChatStorage {
  conversations: Record<string, NPCConversation>;
  relationships: Record<string, NPCRelationship>;
  encounteredNPCs: string[];
  usedOnceEver: string[]; // Templates used with onceEver flag
  globalStats: {
    totalMessages: number;
    mostChatted: string | null;
    lastActive: number;
  };
  version: number;
}

// ============================================
// Rate Limiting State
// ============================================

export interface RateLimitState {
  messagesThisRoom: number;
  lastTriggerByType: Record<NPCTriggerEvent, number>; // roomIndex when last fired
  bossStingerUsed: boolean;
}
