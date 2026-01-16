/**
 * NDG AI Engine
 *
 * Zero-dependency adaptive AI chat engine for NPC interactions.
 */

// ============================================
// Core Types
// ============================================

export type {
  NPCIdentity,
  NPCCategory,
  MoodType,
  MoodState,
  RelationshipStats,
  RelationshipEvent,
  RelationshipEventType,
  NPCRelationship,
  MemoryEvent,
  NPCMemory,
  TemplatePool,
  MessagePurpose,
  TemplateCondition,
  ResponseTemplate,
  StatEffect,
  ObservedStatChange,
  MessageSender,
  ChatMessage,
  DetectedIntent,
  IntentMatch,
  SimulationContext,
  NPCPersonality,
  InteractionTurn,
  ConversationState,
  NPCDashboardState,
} from './core/types';

// ============================================
// Seeded RNG
// ============================================

export { createSeededRng, generateConversationSeed } from './core/seeded-rng';
export type { SeededRng } from './core/seeded-rng';

// ============================================
// Relationship System
// ============================================

export {
  createDefaultStats,
  createDefaultRelationship,
  modifyStat,
  recordEvent,
  deriveMoodFromRelationship,
  deriveMoodState,
  getDisposition,
  wouldInitiateConversation,
  calculatePriceModifier,
  createRelationshipStore,
} from './core/relationship';
export type { RelationshipStore } from './core/relationship';

// ============================================
// Memory System
// ============================================

export {
  createDefaultMemory,
  addMemoryEvent,
  recordDeath,
  recordWitnessedDeath,
  recordConversation,
  recordTrade,
  recordConflict,
  recordAlliance,
  updateOpinion,
  getOpinion,
  hasTraumaBond,
  getStrongestTraumaBond,
  getTraumaBondStrength,
  getRecentEventsWithNPC,
  getMostMemorableEvent,
  hasRecentConflict,
  createMemoryStore,
  getMemoryVariables,
} from './core/memory';
export type { MemoryStore } from './core/memory';

// ============================================
// Intent Detection
// ============================================

export { detectIntent, detectNPCReference, intentToPool } from './core/intent-detector';

// ============================================
// Response Selection
// ============================================

export {
  selectResponse,
  createUsageState,
  markTemplateUsed,
  resetUsageState,
} from './core/response-selector';
export type {
  SelectionInput,
  SelectionResult,
} from './core/response-selector';

// ============================================
// Interaction Engine
// ============================================

export {
  createEngineState,
  executeNPCTurn,
  handlePlayerInterjection,
  generateDashboardState,
  stepSimulation,
} from './core/interaction-engine';
export type {
  EngineState,
  TurnResult,
  PlayerInterjectionResult,
  SimulationStep,
} from './core/interaction-engine';

// ============================================
// Enhanced Interaction Engine
// ============================================

export {
  createEnhancedEngineState,
  executeEnhancedTurn,
  generateEnhancedDashboard,
  stepEnhancedSimulation,
  handleBehavioralEvent,
} from './core/enhanced-interaction';
export type {
  EnhancedEngineState,
  EnhancedTurnResult,
  EnhancedDashboardState,
  EnhancedSimulationStep,
} from './core/enhanced-interaction';

// ============================================
// Personality Dynamics
// ============================================

export {
  createPersonalityProfile,
  applyQuirks,
  detectTriggers,
  calculateAffinity,
} from './personality/personality-dynamics';
export type {
  PersonalityTrait,
  PersonalityProfile,
  QuirkType,
  Quirk,
  TriggerType,
  EmotionalTrigger,
  PersonalityAffinity,
  SpeechPatternType,
  SpeechPattern,
  TextTransform,
  BehavioralModifier,
} from './personality/personality-dynamics';

// ============================================
// Behavioral Patterns
// ============================================

export {
  ARCHETYPE_DEFINITIONS,
  STATE_MODIFIERS,
  createBehaviorState,
  evaluateTransition,
  transitionState,
  getStateModifiers,
  reactToEvent,
  summarizeBehavior,
} from './personality/behavioral-patterns';
export type {
  BehavioralState,
  StateTransition,
  StateTrigger,
  BehavioralArchetype,
  ArchetypeDefinition,
  NPCBehaviorState,
  TransitionContext,
  StateModifiers,
  BehavioralEvent,
  EventReaction,
  BehaviorSummary,
} from './personality/behavioral-patterns';

// ============================================
// Mood Contagion
// ============================================

export {
  MOOD_PROPERTIES,
  calculateSusceptibility,
  createMoodState,
  processMoodInfluence,
  analyzeGroupMood,
  simulateMoodSpread,
} from './personality/mood-contagion';
export type {
  MoodProperties,
  ContagionFactors,
  MoodInfluence,
  MoodState as ContagionMoodState,
  GroupMoodState,
  MoodSpreadResult,
} from './personality/mood-contagion';

// ============================================
// Social Graph
// ============================================

export {
  SOCIAL_GRAPH,
  getRelationshipFromGraph,
  getAllRelationships,
  getMutualFriends,
  getMutualEnemies,
  getRelationshipChain,
  getCategoryRelationships,
  getRelationshipDescription,
} from './social/social-graph';
export type {
  RelationshipType,
  SocialRelationship,
  SocialGraph,
} from './social/social-graph';

// ============================================
// Knowledge System
// ============================================

export {
  KNOWLEDGE_BASE,
  NPC_KNOWLEDGE,
  getKnowledge,
  getNPCKnowledge,
  knowsAbout,
  getSharedKnowledge,
  getExclusiveKnowledge,
  canShare,
  transferKnowledge,
  getGossipTopics,
  getShareableSecrets,
  getRelevantKnowledge,
  getKnowledgeAboutNPC,
} from './social/knowledge-system';
export type {
  KnowledgeCategory,
  SecrecyLevel,
  KnowledgePiece,
} from './social/knowledge-system';

// ============================================
// Conversation Threading
// ============================================

export {
  TOPIC_TEMPLATES,
  DEFAULT_TOPIC_AFFINITIES,
  createThread,
  startTopic,
  advanceTopic,
  getActiveTopic,
  shouldChangeTopic,
  suggestNextTopic,
  detectTopicFromMessage,
  summarizeThread,
  getTopicResponseHint,
} from './social/conversation-threading';
export type {
  TopicCategory,
  Topic,
  ConversationThread,
  TopicAffinity,
  ThreadSummary,
  TopicResponseHint,
} from './social/conversation-threading';

// ============================================
// Player Mythology
// ============================================

export {
  PlayerMythologyManager,
  createPlayerMythology,
} from './mythology/player-mythology';
export type {
  PlayerEventType,
  PlayerEventContext,
  NPCPlayerBeliefs,
  SpreadResult,
  DialogueLine,
  FirstMeetingDialogue,
} from './mythology/player-mythology';

// ============================================
// NPC Enhancements
// ============================================

export {
  ENHANCED_PROFILES,
  getEnhancedProfile,
  getAllEnhancedProfiles,
  registerEnhancedProfile,
  getArchetypeForNPC,
} from './npcs/npc-enhancements';
export type {
  EnhancedNPCProfile,
} from './npcs/npc-enhancements';

// ============================================
// NPC Registry
// ============================================

export {
  // Registry operations
  registerNPC,
  unregisterNPC,
  getNPC,
  getAllNPCs,
  getActiveNPCs,
  getNPCsByCategory,
  getNPCsByArchetype,
  getShopkeepers,
  getNPCsByLocation,
  getQuestGivers,
  setNPCActive,
  updateNPCLocation,
  getNPCEntry,
  registerNPCs,
  clearRegistry,
  getRegistrySize,
  createQuickNPC,
  initializeNPCRegistry,
  isRegistryInitialized,
  // NPC definitions
  ALL_NPCS,
  NPC_BY_SLUG,
  NPC_COUNTS,
  getNPCDefinition,
  PANTHEON_NPCS,
  WANDERER_NPCS,
  TRAVELER_NPCS,
  // Individual NPCs - Pantheon
  THE_ONE,
  JOHN,
  PETER,
  ROBERT,
  ALICE,
  JANE,
  RHEA,
  ZERO_CHANCE,
  ALIEN_BABY,
  // Individual NPCs - Wanderers
  WILLY,
  MR_BONES,
  DR_MAXWELL,
  BOO_G,
  THE_GENERAL_WANDERER,
  DR_VOSS,
  XTREME,
  KING_JAMES_WANDERER,
  // Individual NPCs - Travelers
  STITCH_UP_GIRL,
  THE_GENERAL_TRAVELER,
  BODY_COUNT,
  BOOTS,
  CLAUSEN,
  KEITH_MAN,
  MR_KEVIN,
} from './npcs';
export type {
  EnhancedNPCConfig,
  NPCRegistryEntry,
  NPCGameAttributes,
} from './npcs';
export {
  createEnhancedNPCConfig,
  npcConfigToPersonality,
  CATEGORY_DEFAULTS,
} from './npcs';

// ============================================
// Game Adapters
// ============================================

export {
  PhaserAdapter,
  createPhaserAdapter,
} from './adapters';
export type {
  GameEventType,
  GameEvent,
  GameEventData,
  NPCChatMessage,
  QuickReply,
  PhaserAdapterConfig,
} from './adapters';

// ============================================
// React Components
// ============================================

export {
  ChatFeed,
  ChatMessageBubble,
  EventToast,
  ToastQueue,
} from './components';
export type {
  ChatFeedProps,
  ChatMessageProps,
  EventToastProps,
  ToastQueueProps,
} from './components';

// ============================================
// Cee-lo Dice Game Engine
// ============================================

export {
  // Dice functions
  rollD6,
  rollDice,
  evaluateRoll,
  compareOutcomes,
  rollUntilValid,
  determineTurnOrder,
  isBadBeat,
  isPerfectRound,
  formatRoll,
  formatOutcome,
  describeOutcome,
  getOutcomeProbabilities,
  // Match functions
  createMatch,
  executeRound,
  handlePlayerQuit,
  generateMatchResult,
  runFullMatch,
  runMatchInBackground,
  calculateBet,
  // Statistics
  CeeloStatisticsManager,
  getGlobalStatsManager,
  resetGlobalStatsManager,
  // NPC conversion
  createCeeloPlayerFromNPC,
  getAllCeeloPlayers,
  getCeeloPlayersByCategory,
  // Constants
  DEFAULT_MATCH_CONFIG,
} from './games/ceelo';
export type {
  // Dice types
  DieValue,
  DiceRoll,
  CeeloOutcome,
  RollResult,
  // Player types
  PlayerCategory,
  CeeloPlayer,
  PlayerMatchState,
  // Match types
  MatchConfig,
  MatchState,
  MatchStatus,
  MatchResult,
  RoundResult,
  PlayerStanding,
  // Event types
  CeeloEventType,
  CeeloEvent,
  CeeloEventHandler,
  // Betting types
  BetCalculation,
  BetContext,
  // Chat integration
  CeeloChatContext,
  CeeloChatMessage,
  // Statistics types
  PlayerCareerStats,
  LeaderboardEntry,
  // Simulation types
  SimulationConfig,
  SimulationResult,
  // Sort criteria
  SortCriteria,
} from './games/ceelo';

// ============================================
// Utilities
// ============================================

export {
  ChatLogger,
  getGlobalChatLogger,
  resetGlobalChatLogger,
  DEFAULT_LOGGER_CONFIG,
} from './utils';
export type {
  ChatLogEntry,
  ChatLogSession,
  ChatLoggerConfig,
} from './utils';

// ============================================
// Roll/Hold Scoring Engine
// ============================================

export {
  createRollHoldState,
  rollDice as rollHoldDice,
  canHold,
  hold,
  roll,
  clearHold,
  simulateRollHoldCombat,
  compareStrategies,
  DEFAULT_ROLL_HOLD_CONFIG,
} from './core/roll-hold-engine';
export type {
  RollHoldConfig,
  DieResult,
  RollResult as HoldRollResult,
  HoldState,
  ScoringResult,
  RollHoldState,
  RollHoldSimConfig,
  RollHoldSimResult,
  StrategyComparison,
} from './core/roll-hold-engine';

// ============================================
// Time-Based Damage System
// ============================================

export {
  createCombatState,
  tickCombat,
  applyScore,
  setPaused,
  isCombatWon,
  isCombatLost,
  getCombatResult,
  calculateTargetScore,
  calculateDrainRate,
  calculateDrainForTime,
  simulateTimeDamageCombat,
  analyzeRoomDifficulty,
  DEFAULT_TIME_DAMAGE_CONFIG,
} from './core/time-damage';
export type {
  TimeDamageConfig,
  DomainType,
  CombatRoom,
  CombatState as TimeDamageCombatState,
  CombatResult,
  TimeDamageSimConfig,
  TimeDamageSimResult,
} from './core/time-damage';

// ============================================
// Death = Debt System
// ============================================

export {
  createDebtState,
  getDebtToNPC,
  getTotalDebt,
  isIndebtedTo,
  isHostileFromDebt,
  selectRescuer,
  calculateRescueDebt,
  processRescue,
  payDebt,
  addDebtFromCeeloLoss,
  applyInterest,
  processFlume,
  getShopPriceMultiplier,
  shouldChallengeToCeelo,
  getDebtSummary,
  DEFAULT_DEATH_DEBT_CONFIG,
} from './core/death-debt';
export type {
  DeathDebtConfig,
  NPCDebtRecord,
  DebtEvent,
  RescueResult,
  FlumeResult,
  DebtState,
  AvailableRescuer,
  DebtSummary,
} from './core/death-debt';

// ============================================
// NPC Economy System
// ============================================

export {
  createNPCEconomyState,
  registerNPC as registerNPCEconomy,
  getWealthRecord,
  getNPCGold,
  calculateWealthTier,
  getPriceMultiplier,
  simulateCeeloRoll,
  evaluateCeeloRoll,
  compareCeeloRolls,
  processGamblingMatch,
  canLend,
  issueLoan,
  applyLoanInterest,
  shouldChallengePlayer,
  simulateNPCGamblingRound,
  calculateGiniCoefficient,
  getEconomySnapshot,
  getLeaderboard as getEconomyLeaderboard,
  DEFAULT_NPC_ECONOMY_CONFIG,
} from './economy/npc-economy';
export type {
  NPCEconomyConfig,
  WealthTier,
  NPCWealthRecord,
  LoanRecord,
  GamblingMatch,
  NPCEconomyState,
  EconomySnapshot,
} from './economy/npc-economy';

// ============================================
// Combat System (Grid-Based Turn Combat)
// ============================================

export {
  // Grid Generator
  TILE_TYPES,
  generateGrid,
  getCellAt,
  getAdjacentCells,
  getCellsByType,
  getWalkableCells,
  isCellWalkable,
  gridToAscii,
  // Dice Hand System
  MAX_HAND_SIZE,
  DEFAULT_HOLDS_PER_ROOM,
  DIE_ELEMENTS,
  generateDicePool,
  generateWeightedPool,
  drawHand as drawDiceHand,
  rollHand,
  toggleHold as toggleDiceHold,
  discardAndDraw,
  getHandTotal,
  countByElement,
  getElementCombos,
  getHeldCount,
  isPoolEmpty,
  getPoolRemaining,
  // Combat Engine
  CombatEngine,
  createCombatEngine,
  // Scoring
  SCORE_MODIFIERS,
  getElementMultiplier,
  calculateHitScore,
  calculateCombo,
  calculateElementCombo,
  calculateTurnSummary,
  calculateTargetScore as calculateCombatTargetScore,
  calculateGoldReward,
  // Flat event config (6 events per run)
  FLAT_EVENT_CONFIG,
  COMBAT_CAPS,
  getFlatScoreGoal,
  getFlatGoldReward,
  calculateDecayRate,
  calculateStatEffects,
  // Population Density System
  POPULATION_CONFIG,
  getDensityTier,
  getDensityTierConfig,
  // Die-Density Efficiency Matrix
  DIE_DENSITY_EFFICIENCY,
  getDensityEfficiency,
  getDieIdentity,
  // Die-Specific Decay Modifiers
  DIE_DECAY_MODIFIERS,
  getDieDecayModifier,
  calculateWeightedDecay,
  getEffectiveGracePeriod,
} from './combat';
export type { StatKey, LoadoutStats, DensityTier, DieDensityConfig, DieDecayConfig, BalanceDieSides } from './combat';
export type {
  // Grid types
  TileType,
  GridCell,
  GridState,
  RoomType,
  // Dice types
  DieSides,
  Element,
  Die,
  DiceHand,
  DicePool,
  // Combat types
  CombatPhase,
  Entity,
  EntityMap,
  CombatState,
  CombatCommand,
  CombatConfig,
  // Scoring types
  HitResult,
  ComboResult,
  ElementComboResult,
  TurnSummary,
} from './combat';

// ============================================
// Player Profile System
// ============================================

export {
  createPlayerProfile,
  updatePlayerProfile,
  detectArchetype,
  serializeProfile,
  deserializeProfile,
  ARCHETYPE_ITEMS,
} from './player';
export type {
  PlayerArchetype,
  PlayerProfile,
  RunResult,
} from './player';

export {
  detectStoryBeats,
  updateStoryBeats,
  BEAT_TTL,
} from './player/story-beats';
export type {
  StoryBeat,
  StoryBeatType,
} from './player/story-beats';

export {
  getDebtTension,
  DEBT_THRESHOLDS,
} from './player/debt-tension';
export type {
  DebtTension,
} from './player/debt-tension';

// ============================================
// Item System
// ============================================

export {
  DEFAULT_COMBAT_STATS,
  RARITY_CONFIG,
  calculateShopPrice,
  validateItem,
  generateStatBlock,
  mergeItemStats,
} from './items';
export type {
  ItemCategory,
  ItemRarity,
  ItemElement,
  CombatStats,
  EffectTrigger,
  ItemEffect,
  ItemDefinition,
  RarityConfig,
} from './items';
