/**
 * Chatbase Types
 *
 * Chess-engine-style dialogue database for instant O(1) lookups.
 * Pre-computed responses indexed by conversation context.
 *
 * Philosophy: Like Hades' dialogue system or chess tablebases -
 * authored responses indexed for instant retrieval instead of runtime generation.
 */

import type { NPCCategory, MoodType, TemplatePool, MessagePurpose } from '../core/types';
import type { BehavioralState } from '../personality/behavioral-patterns';
import type { TopicCategory } from '../social/conversation-threading';

// ============================================
// Chatbase Entry - Core Data Structure
// ============================================

export interface ChatbaseEntry {
  /** Unique identifier: "cb-{npcSlug}-{contentHash}" */
  id: string;

  /** The dialogue text */
  text: string;

  /** Speaker information */
  speaker: {
    slug: string;
    name: string;
    category: NPCCategory;
  };

  /** Target information (if directed at someone) */
  target?: {
    slug: string;
    name: string;
    category: NPCCategory;
  } | {
    type: 'player';
  };

  /** Response pool classification */
  pool: TemplatePool | 'claude_generated';

  /** Mood when this was generated */
  mood: MoodType;

  /** Mood intensity from -4 (tilted) to +4 (smug) */
  moodIntensity: number;

  /** Context tags for filtering */
  contextTags: string[];

  /** Trigger conditions that make this response relevant */
  triggers?: ChatbaseTriggers;

  /** Quality and source metrics */
  metrics: ChatbaseMetrics;

  /** Extraction metadata */
  metadata: ChatbaseMetadata;
}

export interface ChatbaseTriggers {
  /** Win/loss streak requirement */
  streak?: {
    type: 'win' | 'loss';
    min: number;
  };
  /** Player presence requirement */
  playerPresent?: boolean;
  /** Player debt status */
  playerDebt?: boolean;
  /** Recent event type */
  recentEvent?: string;
  /** Relationship requirements */
  relationship?: {
    respectRange?: 'hate' | 'dislike' | 'neutral' | 'like' | 'revere';
    trustRange?: 'betrayed' | 'wary' | 'neutral' | 'trusted' | 'confidant';
    familiarityRange?: 'stranger' | 'acquaintance' | 'familiar' | 'friend';
  };
}

export interface ChatbaseMetrics {
  /** Interest score 0-100 from simulation */
  interestScore: number;
  /** Source of this entry */
  source: 'eternal_sim' | 'chatter_sim' | 'manual' | 'player_sim' | 'pantheon_sim';
  /** If reclassified from original pool */
  originalPool?: string;
  /** Runtime hit count (updated during gameplay) */
  hitCount?: number;
  /** Last time this was used (timestamp) */
  lastHit?: number;
  /** Whether this is a hand-reviewed canonical response */
  isCanonical?: boolean;
}

export interface ChatbaseMetadata {
  /** Path to source log file */
  extractedFrom: string;
  /** Simulation day (for eternal logs) */
  extractedDay?: number;
  /** Conversation turn (for chatter logs) */
  extractedTurn?: number;
  /** Extraction timestamp */
  extractedAt: string;
  /** Schema version for migrations */
  version: number;
}

// ============================================
// Context Hashing - For Lookup Keys
// ============================================

/**
 * Coarse-grained context key for chatbase lookups.
 * Uses buckets instead of exact values to increase cache hit rates.
 */
export interface ChatbaseContextKey {
  /** NPC identifier */
  npcSlug: string;

  /** Mood bucket (quantized from MoodType) */
  moodBucket: MoodBucket;

  /** Respect bucket (-100 to 100 quantized) */
  respectBucket: RelationshipBucket;

  /** Trust bucket (-100 to 100 quantized) */
  trustBucket: TrustBucket;

  /** Familiarity bucket (0 to 100 quantized) */
  familiarityBucket: FamiliarityBucket;

  /** Current topic category */
  topicCategory: TopicCategory | 'none';

  /** Topic depth bucket */
  topicDepth: 'shallow' | 'medium' | 'deep';

  /** Thread tension bucket */
  threadTensionBucket: TensionBucket;

  /** Current behavioral state */
  behavioralState: BehavioralState;

  /** Response pool being requested */
  pool: TemplatePool;

  /** Optional recent event for reactive responses */
  recentEvent?: string;
}

export type MoodBucket = 'hostile' | 'negative' | 'neutral' | 'positive' | 'generous';
export type RelationshipBucket = 'hate' | 'dislike' | 'neutral' | 'like' | 'revere';
export type TrustBucket = 'betrayed' | 'wary' | 'neutral' | 'trusted' | 'confidant';
export type FamiliarityBucket = 'stranger' | 'acquaintance' | 'familiar' | 'friend';
export type TensionBucket = 'calm' | 'mild' | 'tense' | 'volatile';

// ============================================
// Lookup Result
// ============================================

export interface ChatbaseLookupResult {
  /** How the response was obtained */
  source: 'chatbase' | 'mcts' | 'template' | 'none';

  /** The selected entry (if found) */
  entry: ChatbaseEntry | null;

  /** Confidence in this selection 0-1 */
  confidence: number;

  /** The lookup key used */
  key?: string;

  /** Whether this was a fuzzy match */
  fuzzyMatch?: boolean;

  /** Alternative entries considered */
  alternatives?: ChatbaseEntry[];
}

// ============================================
// Storage Structures
// ============================================

export interface ChatbaseManifest {
  /** Schema version */
  version: string;

  /** When chatbase was created */
  createdAt: string;

  /** When chatbase was last updated */
  lastUpdated: string;

  /** Source information */
  sources: {
    eternalLogDirs: string[];
    chatterLogDirs: string[];
    playerSimDirs?: string[];
    pantheonSimDirs?: string[];
    totalDaysProcessed: number;
    totalConversationsProcessed: number;
  };

  /** Statistics */
  stats: {
    totalEntries: number;
    entriesBySpeaker: Record<string, number>;
    entriesByPool: Record<string, number>;
    entriesByMood: Record<string, number>;
    averageInterestScore: number;
    deduplicationRatio: number;
    canonicalCount: number;
  };

  /** Index file references */
  indexes: Array<{
    name: string;
    type: 'by-speaker' | 'by-pool' | 'by-mood' | 'by-context';
    entryCount: number;
    path: string;
  }>;
}

export interface ChatbaseNPCFile {
  /** NPC identification */
  npc: {
    slug: string;
    name: string;
    category: NPCCategory;
  };

  /** Total entries for this NPC */
  entryCount: number;

  /** Pool distribution */
  pools: Record<string, number>;

  /** Mood distribution */
  moods: Record<string, number>;

  /** All entries */
  entries: ChatbaseEntry[];
}

// ============================================
// Lookup Engine Config
// ============================================

export interface ChatbaseLookupConfig {
  /** Enable/disable the lookup system */
  enabled: boolean;

  /** Minimum confidence to accept a chatbase hit (0-1) */
  minConfidence: number;

  /** Whether to store MCTS results back to chatbase */
  learningEnabled: boolean;

  /** Max entries before pruning */
  maxEntries: number;

  /** Prune entries with fewer hits than this */
  minHitCountForRetention: number;

  /** Use alternatives for variety (weighted random) */
  useAlternatives: boolean;

  /** Fallback to MCTS when no chatbase hit */
  fallbackToMCTS: boolean;

  /** Fallback to template selection when no chatbase hit */
  fallbackToTemplates: boolean;

  /** MCTS search time for fallback (ms) */
  mctsTimeMs: number;
}

export const DEFAULT_CHATBASE_CONFIG: ChatbaseLookupConfig = {
  enabled: true,
  minConfidence: 0.7,
  learningEnabled: false,
  maxEntries: 10000,
  minHitCountForRetention: 3,
  useAlternatives: true,
  fallbackToMCTS: true,
  fallbackToTemplates: true,
  mctsTimeMs: 100,
};

// ============================================
// Bucket Quantization Helpers
// ============================================

/**
 * Quantize mood to bucket for lookup key
 */
export function quantizeMood(mood: MoodType): MoodBucket {
  switch (mood) {
    case 'threatening':
    case 'angry':
      return 'hostile';
    case 'annoyed':
    case 'fearful':
    case 'scared':
    case 'sad':
      return 'negative';
    case 'neutral':
    case 'curious':
    case 'cryptic':
      return 'neutral';
    case 'pleased':
    case 'amused':
      return 'positive';
    case 'generous':
      return 'generous';
    default:
      return 'neutral';
  }
}

/**
 * Quantize relationship stat (-100 to 100) to bucket
 */
export function quantizeRelationship(value: number): RelationshipBucket {
  if (value < -60) return 'hate';
  if (value < -20) return 'dislike';
  if (value < 20) return 'neutral';
  if (value < 60) return 'like';
  return 'revere';
}

/**
 * Quantize trust (-100 to 100) to bucket
 */
export function quantizeTrust(value: number): TrustBucket {
  if (value < -60) return 'betrayed';
  if (value < -20) return 'wary';
  if (value < 20) return 'neutral';
  if (value < 60) return 'trusted';
  return 'confidant';
}

/**
 * Quantize familiarity (0 to 100) to bucket
 */
export function quantizeFamiliarity(value: number): FamiliarityBucket {
  if (value < 25) return 'stranger';
  if (value < 50) return 'acquaintance';
  if (value < 75) return 'familiar';
  return 'friend';
}

/**
 * Quantize topic depth (0-10) to bucket
 */
export function quantizeTopicDepth(depth: number): 'shallow' | 'medium' | 'deep' {
  if (depth < 4) return 'shallow';
  if (depth < 7) return 'medium';
  return 'deep';
}

/**
 * Quantize tension (0-1) to bucket
 */
export function quantizeTension(tension: number): TensionBucket {
  if (tension < 0.25) return 'calm';
  if (tension < 0.5) return 'mild';
  if (tension < 0.75) return 'tense';
  return 'volatile';
}

/**
 * Compute lookup key from context
 */
export function computeChatbaseKey(ctx: ChatbaseContextKey): string {
  return [
    ctx.npcSlug,
    ctx.moodBucket,
    ctx.respectBucket,
    ctx.trustBucket,
    ctx.familiarityBucket,
    ctx.topicCategory,
    ctx.topicDepth,
    ctx.threadTensionBucket,
    ctx.behavioralState,
    ctx.pool,
    ctx.recentEvent || 'none',
  ].join('|');
}

/**
 * Generate content hash for deduplication
 */
export function hashContent(speaker: string, text: string, target?: string): string {
  const normalized = `${speaker}:${text.toLowerCase().trim()}:${target || ''}`;
  // Simple hash - sufficient for deduplication
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

// ============================================
// Pool Classification Keywords
// ============================================

export const POOL_KEYWORDS: Record<string, string[]> = {
  gamblingTrashTalk: ['dice', 'roll', 'bet', 'ante', 'gold', 'gamble', 'luck', 'ceelo', 'cee-lo'],
  gamblingBrag: ['won', 'victory', 'beat', 'destroyed', 'easy', 'streak', 'taking your'],
  gamblingFrustration: ['lost', 'rigged', 'cursed', 'cold dice', 'unfair', 'cheating'],
  threat: ['pay', 'owe', 'debt', 'consequence', 'warning', 'will regret', 'don\'t forget'],
  lore: ['void', 'sphere', 'death', 'eternal', 'cycle', 'respawn', 'die-rector', 'pantheon'],
  gossip: ['heard', 'word is', 'someone', 'apparently', 'rumor', 'they say', 'between us'],
  greeting: ['hello', 'greetings', 'ah,', 'welcome', 'good to see', 'you\'re back'],
  reaction: ['interesting', 'noticed', 'observed', 'curious', 'hmm', 'I see'],
  salesPitch: ['deal', 'offer', 'buy', 'sell', 'trade', 'price', 'discount', 'special'],
  challenge: ['dare', 'prove', 'show me', 'test', 'worthy', 'coward'],
  hint: ['careful', 'watch out', 'tip', 'advice', 'secret', 'between you and me'],
};

export const MOOD_KEYWORDS: Record<MoodType, string[]> = {
  threatening: ['warning', 'pay', 'owe', 'consequence', 'death', 'regret', 'suffer'],
  amused: ['hah', 'delightful', 'fun', 'entertain', 'adorable', 'amusing', 'heh'],
  annoyed: ['again', 'tired', 'enough', 'stop', 'waste', 'bother'],
  pleased: ['excellent', 'good', 'satisfactory', 'nice', 'pleased', 'happy'],
  curious: ['interesting', 'fascinating', 'wonder', 'curious', 'intriguing'],
  cryptic: ['perhaps', 'mysteries', 'secrets', 'veil', 'shadows', 'riddle'],
  generous: ['gift', 'free', 'take this', 'on me', 'no charge', 'yours'],
  fearful: ['scared', 'afraid', 'worry', 'danger', 'flee', 'hide'],
  neutral: [],
  angry: ['fury', 'rage', 'destroy', 'hate', 'damn', 'curse'],
  scared: ['help', 'run', 'terror', 'please', 'no no', 'don\'t'],
  sad: ['sorry', 'loss', 'miss', 'gone', 'mourn', 'weep'],
};

/**
 * Classify text into a pool using keyword matching
 */
export function classifyPool(text: string, defaultPool: TemplatePool = 'reaction'): TemplatePool {
  const lowerText = text.toLowerCase();

  let bestPool = defaultPool;
  let bestScore = 0;

  for (const [pool, keywords] of Object.entries(POOL_KEYWORDS)) {
    let score = 0;
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        score++;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestPool = pool as TemplatePool;
    }
  }

  return bestPool;
}

/**
 * Infer mood from text using keyword matching
 */
export function inferMood(text: string, defaultMood: MoodType = 'neutral'): MoodType {
  const lowerText = text.toLowerCase();

  let bestMood = defaultMood;
  let bestScore = 0;

  for (const [mood, keywords] of Object.entries(MOOD_KEYWORDS)) {
    let score = 0;
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        score++;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMood = mood as MoodType;
    }
  }

  return bestMood;
}
