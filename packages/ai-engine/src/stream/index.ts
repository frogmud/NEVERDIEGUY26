/**
 * NPC Eternal Stream System
 *
 * Immortals chat on a cursed app platform across infinite "days" (seeds).
 * Each seed + domain combo produces a deterministic conversation stream.
 *
 * Core API:
 *   generateDayStream(seed, domainSlug, count) - Basic stream
 *   generateEnhancedDayStream(seed, domainSlug, count) - Full-featured stream
 */

// ============================================
// Types
// ============================================

export type {
  StreamEntryType,
  StreamEntry,
  VoiceProfile,
  DomainContext,
  StreamConfig,
  StreamState,
  RefinementInput,
  RefinementOutput,
} from './types';

export { DEFAULT_STREAM_CONFIG } from './types';

// ============================================
// Voice Profiles
// ============================================

export {
  // Individual profiles
  WILLY_VOICE,
  MR_BONES_VOICE,
  DR_MAXWELL_VOICE,
  BOO_G_VOICE,
  THE_GENERAL_WANDERER_VOICE,
  DR_VOSS_VOICE,
  XTREME_VOICE,
  KING_JAMES_VOICE,
  STITCH_UP_GIRL_VOICE,
  THE_GENERAL_TRAVELER_VOICE,
  BODY_COUNT_VOICE,
  BOOTS_VOICE,
  CLAUSEN_VOICE,
  KEITH_MAN_VOICE,
  MR_KEVIN_VOICE,
  THE_ONE_VOICE,
  JOHN_VOICE,
  PETER_VOICE,
  ROBERT_VOICE,
  ALICE_VOICE,
  JANE_VOICE,
  RHEA_VOICE,
  // Registry
  VOICE_PROFILES,
  getVoiceProfile,
  getAllVoiceProfiles,
  // Domain contexts
  DOMAIN_CONTEXTS,
  getDomainContext,
  getDomainResidents,
} from './voice-profiles';

// ============================================
// Stream Templates
// ============================================

export {
  IDLE_TEMPLATES,
  RELATIONSHIP_TEMPLATES,
  LORE_TEMPLATES,
  META_TEMPLATES,
  ALL_TEMPLATES,
  getTemplatesForType,
  getTemplatesForDomain,
  getTemplatesForMood,
  fillTemplate,
  // Pools
  REACTIONS,
  OPINIONS,
  TIME_UNITS,
  INTENSITIES,
  SHARED_EVENTS,
  FLAWS,
  BEHAVIORS,
  LORE_FACTS,
  DIRECTOR_FACTS,
  ORIGIN_FACTS,
} from './stream-templates';

export type {
  StreamTemplate,
  TemplateContext,
} from './stream-templates';

// ============================================
// NPC-Specific Overrides
// ============================================

export {
  // Individual NPC templates
  WILLY_TEMPLATES,
  MR_BONES_TEMPLATES,
  STITCH_UP_GIRL_TEMPLATES,
  XTREME_TEMPLATES,
  BOO_G_TEMPLATES,
  THE_GENERAL_TRAVELER_TEMPLATES,
  THE_ONE_TEMPLATES,
  DR_MAXWELL_TEMPLATES,
  BOOTS_TEMPLATES,
  CLAUSEN_TEMPLATES,
  BODY_COUNT_TEMPLATES,
  KING_JAMES_TEMPLATES,
  DR_VOSS_TEMPLATES,
  // Registry
  NPC_TEMPLATE_OVERRIDES,
  getNPCTemplates,
  hasNPCOverrides,
} from './npc-overrides';

// ============================================
// Domain Lore
// ============================================

export {
  // Domain-specific lore
  EARTH_LORE,
  FROST_REACH_LORE,
  INFERNUS_LORE,
  SHADOW_KEEP_LORE,
  NULL_PROVIDENCE_LORE,
  ABERRANT_LORE,
  CROSS_DOMAIN_LORE,
  // Registry
  DOMAIN_LORE_POOLS,
  getDomainLore,
  getNPCDomainLore,
  getLoreBySecrecy,
  getSharedLore,
} from './domain-lore';

export type { DomainLore } from './domain-lore';

// ============================================
// Thread Continuity
// ============================================

export {
  // Response generation
  RESPONSE_TEMPLATES,
  shouldTriggerResponse,
  generateResponse,
  // Conversation threading
  detectThread,
  getThreadContinuation,
  // Direct address
  generateDirectAddress,
  // Mention reactions
  generateMentionReaction,
} from './thread-continuity';

export type {
  ResponseContext,
  ResponseTemplate,
  ConversationThread,
  DirectAddress,
} from './thread-continuity';

// ============================================
// Special Events
// ============================================

export {
  // Event definitions
  SPECIAL_EVENTS,
  // Event generation
  shouldTriggerSpecialEvent,
  selectSpecialEvent,
  generateSpecialEventContent,
  createSpecialEventEntry,
  // History tracking
  createEventHistory,
  recordSpecialEvent,
  getRecentSpecialCount,
} from './special-events';

export type {
  SpecialEventType,
  SpecialEvent,
  SpecialEventHistory,
} from './special-events';

// ============================================
// Basic Stream Generation
// ============================================

export {
  // Main generator
  generateDayStream,
  // Continuation
  continueStream,
  createStreamState,
  // Queries
  getEntriesMentioning,
  getEntriesByType,
  getEntriesInRange,
  // Snapshot
  createStreamSnapshot,
} from './eternal-stream';

export type {
  StreamSnapshot,
} from './eternal-stream';

// ============================================
// Enhanced Stream Generation
// ============================================

export {
  // Enhanced generator (recommended)
  generateEnhancedDayStream,
  DEFAULT_ENHANCED_CONFIG,
} from './enhanced-stream';

export type {
  EnhancedStreamConfig,
} from './enhanced-stream';

// ============================================
// Claude Refinement
// ============================================

export {
  // Prompt building
  buildRefinementSystemPrompt,
  buildRefinementUserPrompt,
  // Input/Output
  prepareRefinementInput,
  parseRefinementResponse,
  // Quick fallback
  generateQuickResponse,
  // Claude API
  buildClaudeRequest,
  DEFAULT_REFINEMENT_CONFIG,
  // Entry creation
  createEntryFromRefinement,
} from './claude-refinement';

export type {
  ClaudeRefinementConfig,
} from './claude-refinement';

// ============================================
// Eternal Calendar (Seeds, Days, Channels)
// ============================================

export {
  // Seed utilities
  dateToSeed,
  todaySeed,
  seedToDate,
  isDateSeed,
  phraseToSeed,
  seedToDayNumber,
  seedToLabel,
  // Channel creation
  createChannel,
  getAllChannelsForSeed,
  getTodayChannels,
  // Calendar navigation
  getCalendarRange,
  getAdjacentSeeds,
  // Stream sampling
  sampleStream,
  // Featured channels
  getFeaturedChannels,
  // Special seeds
  SPECIAL_SEEDS,
  getRandomInterestingSeed,
  // Frequency tuning
  tuneToFrequency,
  getCurrentFrequency,
} from './eternal-calendar';

export type {
  Channel,
  CalendarDay,
  StreamSample,
  FeaturedChannel,
  TuningResult,
} from './eternal-calendar';

// ============================================
// Stream Discovery (Search & Find)
// ============================================

export {
  // Indexing
  indexStream,
  // Search
  searchStreams,
  // Quick finders
  findStreamsWithNPC,
  findInteractions,
  findStreamsByTopic,
  findLoreStreams,
  findMetaStreams,
  // Recommendations
  getRecommendations,
  // NPC locator
  findNPC,
  getAllNPCLocations,
} from './stream-discovery';

export type {
  DiscoveryQuery,
  DiscoveryResult,
  StreamIndex,
  Recommendation,
  NPCLocation,
} from './stream-discovery';

// ============================================
// Claude-Powered Tuning
// ============================================

export {
  // Local interpretation
  interpretQueryLocally,
  tuneLocal,
  // Claude integration
  buildTuningSystemPrompt,
  buildTuningUserPrompt,
  parseTuningResponse,
  executeTuning,
  buildClaudeTuningRequest,
  DEFAULT_TUNING_CONFIG,
  // Hybrid tuning
  tune,
} from './claude-tuning';

export type {
  TuningRequest,
  TuningResponse,
  TuningIntent,
  TunedChannel,
  ClaudeTuningConfig,
} from './claude-tuning';
