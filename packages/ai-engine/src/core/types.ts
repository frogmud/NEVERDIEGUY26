/**
 * Core Types for the NDG AI Engine
 *
 * Portable type definitions for:
 * - NPC Identity and Personality
 * - Relationship and Memory Systems
 * - Template and Response System
 * - Simulation Context
 */

// ============================================
// NPC Identity
// ============================================

export type NPCCategory = 'travelers' | 'wanderers' | 'pantheon' | 'shop';

export interface NPCIdentity {
  slug: string;
  name: string;
  category: NPCCategory;
  title?: string;
  description?: string;
  avatar?: string;
}

// ============================================
// Mood System
// ============================================

export type MoodType =
  | 'neutral'
  | 'pleased'
  | 'annoyed'
  | 'amused'
  | 'threatening'
  | 'generous'
  | 'cryptic'
  | 'fearful'
  | 'curious'
  | 'angry'
  | 'scared'
  | 'sad'
  | 'grateful';

export interface MoodState {
  current: MoodType;
  intensity: number; // 0-100
  trending: 'improving' | 'stable' | 'declining';
}

// ============================================
// Relationship Model
// ============================================

export interface RelationshipStats {
  respect: number;      // -100 to 100
  familiarity: number;  // 0 to 100
  trust: number;        // -100 to 100
  fear: number;         // 0 to 100
  debt: number;         // Positive = they owe us
}

export type RelationshipEventType =
  | 'helped'
  | 'betrayed'
  | 'traded'
  | 'defeated'
  | 'spared'
  | 'gifted'
  | 'insulted'
  | 'praised'
  | 'witnessed_death'
  | 'shared_danger'
  | 'conversation';

export interface RelationshipEvent {
  type: RelationshipEventType;
  timestamp: number;
  details?: string;
  statChanges?: Partial<RelationshipStats>;
}

export interface NPCRelationship {
  targetSlug: string;
  stats: RelationshipStats;
  history: RelationshipEvent[];
  lastInteraction: number;
  interactionCount: number;
}

// ============================================
// Memory System
// ============================================

export interface MemoryEvent {
  id: string;
  type: 'death' | 'witnessed_death' | 'trade' | 'conversation' | 'conflict' | 'alliance';
  timestamp: number;
  involvedNPCs: string[];
  details: string;
  emotionalWeight: number; // 1-10
}

export interface NPCMemory {
  slug: string;
  shortTerm: MemoryEvent[];   // Last 10 events
  longTerm: MemoryEvent[];    // Significant events (max 20)
  traumaBonds: Record<string, number>;
  opinions: Record<string, number>; // slug -> -100 to 100
  deaths: number;
  witnessedDeaths: number;
}

// ============================================
// Template System
// ============================================

export type TemplatePool =
  | 'greeting'
  | 'farewell'
  | 'idle'
  | 'salesPitch'
  | 'bargain'
  | 'threat'
  | 'challenge'
  | 'hint'
  | 'lore'
  | 'reaction'
  | 'npcGreeting'
  | 'npcReaction'
  | 'npcGossip'
  | 'npcLore'
  | 'npcConflict'
  | 'npcAlliance'
  | 'playerInterrupt'
  // Gambling-specific pools (Cee-lo)
  | 'gamblingTrashTalk'    // Pre/during match taunting
  | 'gamblingBrag'         // Post-win boasting
  | 'gamblingFrustration'  // Post-loss venting
  | 'gamblingQuitThreat'   // Threatening to leave
  | 'gamblingQuit'         // Actually leaving
  | 'gamblingReturn'       // Coming back after cooldown
  | 'gamblingRivalry'      // Targeting specific rival
  | 'gamblingWitness'      // Commenting on others' matches
  | 'gamblingStreak';      // Celebrating/lamenting streaks

export type MessagePurpose =
  | 'social'
  | 'trade'
  | 'warning'
  | 'lore'
  | 'challenge'
  | 'reaction'
  | 'gossip'
  | 'ambient'
  | 'general';

export interface TemplateCondition {
  type: 'mood' | 'relationship' | 'memory' | 'context' | 'random';
  target?: string;
  comparison: 'gt' | 'lt' | 'eq' | 'gte' | 'lte' | 'has' | 'lacks';
  value: number | string | boolean;
}

export interface ResponseTemplate {
  id: string;
  npcSlug?: string;
  pool?: TemplatePool;
  mood?: MoodType | 'any';
  text: string;
  weight: number;
  purpose?: MessagePurpose;
  conditions?: TemplateCondition[];
  cooldown?: {
    turns?: number;
    oncePerConversation?: boolean;
  };
  statEffects?: StatEffect[];
  targetNPC?: string;
  targetType?: 'player' | 'npc' | 'all';
  effects?: TemplateEffects;
  tone?: string;
  category?: string;
  moodRequirement?: MoodType;
  moodBonus?: MoodType[];
  tensionRange?: { min: number; max: number };
  relationshipRequirement?: {
    stat: string;
    min?: number;
    max?: number;
  };
  isSecret?: boolean;
}

export interface TemplateEffects {
  respectDelta?: number;
  trustDelta?: number;
  familiarityDelta?: number;
  fearDelta?: number;
  debtDelta?: number;
  reciprocal?: boolean;
}

// ============================================
// Stat Effects (Observable Changes)
// ============================================

export interface StatEffect {
  target: 'self' | 'target' | 'player' | string;
  stat: keyof RelationshipStats | 'mood' | 'opinion';
  change: number;
  reason: string;
}

export interface ObservedStatChange {
  timestamp: number;
  sourceNPC: string;
  targetNPC: string;
  stat: string;
  previousValue: number;
  newValue: number;
  change: number;
  reason: string;
}

// ============================================
// Messages
// ============================================

export type MessageSender =
  | { type: 'npc'; slug: string }
  | { type: 'player' }
  | { type: 'system' };

export interface ChatMessage {
  id: string;
  sender: MessageSender;
  targetAudience: 'all' | 'player' | string;
  content: string;
  timestamp: number;
  mood?: MoodType;
  purpose?: MessagePurpose;
  templateId?: string;
  statEffects?: ObservedStatChange[];
}

// ============================================
// Intent Detection
// ============================================

export type DetectedIntent =
  | 'greeting'
  | 'farewell'
  | 'question'
  | 'trade'
  | 'challenge'
  | 'compliment'
  | 'insult'
  | 'gossip'
  | 'lore'
  | 'help'
  | 'unknown';

export interface IntentMatch {
  intent: DetectedIntent;
  confidence: number;
  matchedPattern?: string;
  targetNPC?: string;
}

// ============================================
// Simulation Context
// ============================================

export interface SimulationContext {
  seed: string;
  turnNumber: number;
  activeNPCs: string[];
  playerPresent: boolean;
  location: string;
  recentEvents?: string[];
}

// ============================================
// NPC Personality Config
// ============================================

export interface NPCPersonality {
  identity: NPCIdentity;
  basePoolWeights: Partial<Record<TemplatePool, number>>;
  defaultMood: MoodType;
  moodVolatility: number;
  sociability: number;
  aggression: number;
  loyalty: number;
  curiosity: number;
  templates: ResponseTemplate[];
  archetype?: string;
}

// ============================================
// Interaction Engine Types
// ============================================

export interface InteractionTurn {
  turnNumber: number;
  speaker: string;
  message: ChatMessage;
  statChanges: ObservedStatChange[];
  triggeredEvents: string[];
}

export interface ConversationState {
  id: string;
  participants: string[];
  turns: InteractionTurn[];
  startTime: number;
  lastActivity: number;
  topic?: string;
  mood: MoodType;
}

// ============================================
// Dashboard Display Types
// ============================================

export interface NPCDashboardState {
  slug: string;
  name: string;
  category: NPCCategory;
  currentMood: MoodState;
  relationships: Array<{
    targetSlug: string;
    targetName: string;
    stats: RelationshipStats;
  }>;
  recentChanges: ObservedStatChange[];
  memory: {
    shortTermCount: number;
    longTermCount: number;
    traumaBondCount: number;
  };
}
