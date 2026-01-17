/**
 * NPC Chat System
 *
 * Event-driven NPC messaging integrated into the run loop.
 * NPCs message players at meaningful beats, not as a standalone feature.
 */

// Types
export type {
  ChatContext,
  ContextConfig,
  NPCTriggerEvent,
  TriggerConfig,
  TemplatePool,
  MoodType,
  MessagePurpose,
  MessageAction,
  QuickReplyVerb,
  TemplateCondition,
  ResponseTemplate,
  NPCPersonalityConfig,
  MoodTrigger,
  NPCRelationship,
  RelationshipEvent,
  NPCConversation,
  ChatMessage,
  ResponseContext,
  SelectedResponse,
  MoodGameplayEffects,
  NPCChatStorage,
  RateLimitState,
  // Dice roll events
  DiceRarity,
  DiceRollEventPayload,
} from './types';

export { CONTEXT_CONFIGS, QUICK_REPLY_VERBS } from './types';

// Triggers
export {
  TRIGGER_CONFIGS,
  mapTriggerToPool,
  createRateLimitState,
  canTriggerFire,
  recordTriggerFired,
  resetRoomLimits,
  evaluateTrigger,
  DEFAULT_DOMAIN_OWNERS,
  determineChatContext,
  TRIGGER_PRIORITY,
  sortByPriority,
  // Dice roll triggers
  DIE_TO_DIRECTOR,
  evaluateDiceRollTrigger,
} from './triggers';

// Relationship
export {
  createDefaultRelationship,
  deriveMood,
  derivePriceModifier,
  MOOD_EFFECTS,
  getMoodEffects,
  recordInteraction,
  addRelationshipEvent,
  adjustDebt,
  resetRunState as resetRelationshipRunState,
  getFavorLevel,
  describeFavorLevel,
  checkFavorThreshold,
  getMoodDisplay,
} from './relationship';

// Intent Detection
export {
  detectIntent,
  intentToPool,
  detectIntentPool,
} from './intent-detector';
export type { DetectedIntent, IntentMatch } from './intent-detector';

// Variable Processing
export {
  processVariables,
  findUndefinedVariables,
  getKnownVariables,
  buildVariableContext,
  extractVariables,
  hasVariables,
} from './variable-processor';
export type { VariableContext, CombatContext } from './variable-processor';

// Domain Tinting
export {
  DOMAIN_TINTS,
  applyDomainTint,
  getDomainVariables,
  getDomainUIHints,
  isKnownDomain,
  getKnownDomains,
  getDomainOwner,
  getOwnedDomain,
} from './domain-tint';
export type { DomainTint } from './domain-tint';

// Response Selection
export {
  getChatSeed,
  selectResponse,
  createFallbackResponse,
  markTemplateUsed,
  isRecentlyUsed,
  isOnCooldown,
} from './response-selector';
export type { SeedContext } from './response-selector';

// Storage
export {
  createDefaultNPCChatStorage,
  createDefaultConversation,
  loadNPCChatStorage,
  saveNPCChatStorage,
  clearNPCChatStorage,
  getConversation,
  getOrCreateConversation,
  addMessage,
  getRelationship,
  updateRelationship,
  resetRunState,
  markTemplateUsedOnce,
  wasUsedOnceEver,
  getNPCChatStats,
} from './storage';

// NPC Configs & Templates
export {
  // Pantheon (Die-rectors)
  THE_ONE_PERSONALITY,
  THE_ONE_TEMPLATES,
  JOHN_PERSONALITY,
  JOHN_TEMPLATES,
  PETER_PERSONALITY,
  PETER_TEMPLATES,
  ROBERT_PERSONALITY,
  ROBERT_TEMPLATES,
  ALICE_PERSONALITY,
  ALICE_TEMPLATES,
  JANE_PERSONALITY,
  JANE_TEMPLATES,
  // Wanderers
  WILLY_PERSONALITY,
  WILLY_TEMPLATES,
  MR_BONES_PERSONALITY,
  MR_BONES_TEMPLATES,
  DR_MAXWELL_PERSONALITY,
  DR_MAXWELL_TEMPLATES,
  KING_JAMES_PERSONALITY,
  KING_JAMES_TEMPLATES,
  BOO_G_PERSONALITY,
  BOO_G_TEMPLATES,
  THE_GENERAL_WANDERER_PERSONALITY,
  THE_GENERAL_WANDERER_TEMPLATES,
  DR_VOSS_PERSONALITY,
  DR_VOSS_TEMPLATES,
  XTREME_PERSONALITY,
  XTREME_TEMPLATES,
  // Travelers
  STITCH_UP_GIRL_PERSONALITY,
  STITCH_UP_GIRL_TEMPLATES,
  THE_GENERAL_TRAVELER_PERSONALITY,
  THE_GENERAL_TRAVELER_TEMPLATES,
  BODY_COUNT_PERSONALITY,
  BODY_COUNT_TEMPLATES,
  BOOTS_PERSONALITY,
  BOOTS_TEMPLATES,
  CLAUSEN_PERSONALITY,
  CLAUSEN_TEMPLATES,
  KEITH_MAN_PERSONALITY,
  KEITH_MAN_TEMPLATES,
  MR_KEVIN_PERSONALITY,
  MR_KEVIN_TEMPLATES,
  // Cosmic Horrors (Pantheon)
  RHEA_PERSONALITY,
  RHEA_TEMPLATES,
  ALIEN_BABY_PERSONALITY,
  ALIEN_BABY_TEMPLATES,
  ZERO_CHANCE_PERSONALITY,
  ZERO_CHANCE_TEMPLATES,
  // Utilities
  ALL_NPC_PERSONALITIES,
  ALL_TEMPLATES,
  getPersonality,
  getTemplatesForNPC,
  NPC_CATEGORIES,
  getNPCCategory,
  isTraveler,
  isWanderer,
  isPantheon,
  isDirector, // deprecated, use isPantheon
  type NPCCategory,
} from './npcs';

// Memory System
export {
  // Factories
  createDefaultMemory,
  createDefaultMemoryStorage,
  // Operations
  getMemory,
  recordDeath,
  recordWitnessedDeath,
  recordSurvival,
  resetRunMemory,
  // Queries
  getTopTraumaBonds,
  getStrongestBondPartner,
  hasTraumaBond,
  getDeathStats,
  // Persistence
  loadMemoryStorage,
  saveMemoryStorage,
  clearMemoryStorage,
  // Template helpers
  getMemoryVariables,
} from './memory';
export type {
  MemoryEvent,
  MemorableMoment,
  NPCMemory,
  MemoryStorage,
} from './memory';

// QA Harness
export {
  lintTemplate,
  lintNPCTemplates,
  lintAll,
  formatLintResults,
  runSimulation,
  verifyDeterminism,
  testCooldowns,
  formatSimulationResults,
  runFullQA,
} from './qa';
export type {
  LintSeverity,
  LintIssue,
  LintResult,
  SimulationConfig,
  SimulationResult,
} from './qa';
