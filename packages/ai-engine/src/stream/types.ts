/**
 * NPC Eternal Stream Types
 *
 * Immortals chat on a cursed app platform across infinite "days" (seeds).
 * Each seed + domain combo produces a deterministic conversation stream.
 */

// ============================================
// Stream Entry Types
// ============================================

/** The type of stream entry */
export type StreamEntryType =
  | 'idle'         // Ambient musing, thinking out loud
  | 'relationship' // Addressing another NPC by name
  | 'lore'         // Domain/universe knowledge drops
  | 'meta';        // Breaking fourth wall about the eternal broadcast

/** A single entry in the eternal stream */
export interface StreamEntry {
  /** Unique ID for this entry (deterministic from seed) */
  id: string;
  /** NPC slug (e.g., 'willy', 'mr-bones') */
  speakerSlug: string;
  /** Display name (e.g., 'Willy One Eye') */
  speakerName: string;
  /** Entry type determines content category */
  type: StreamEntryType;
  /** The actual dialogue content */
  content: string;
  /** For relationship type: slug of NPC being mentioned */
  mentionsNPC?: string;
  /** Deterministic timestamp in stream (seconds from stream start) */
  timestamp: number;
  /** Optional: knowledge piece ID if this is a lore drop */
  knowledgeId?: string;
  /** Optional: mood when speaking */
  mood?: string;
}

// ============================================
// Voice Profile Types
// ============================================

/** Speech patterns and vocabulary for an NPC */
export interface VoiceProfile {
  slug: string;
  /** Display name */
  name: string;
  /** Speech pattern descriptors */
  patterns: string[];
  /** Key vocabulary/words they use */
  vocabulary: string[];
  /** Topics they like to talk about */
  topics: string[];
  /** NPCs they tease/mock */
  teases: string[];
  /** NPCs they respect/admire */
  respects: string[];
  /** NPCs they avoid/ignore */
  avoids: string[];
  /** Catchphrases or signature lines */
  catchphrases: string[];
  /** Default domains they're associated with */
  homeDomains: string[];
}

// ============================================
// Domain Context Types
// ============================================

/** Context about the domain for stream generation */
export interface DomainContext {
  slug: string;
  name: string;
  element: string;
  description: string;
  /** NPCs commonly found here */
  residents: string[];
  /** Topics relevant to this domain */
  topics: string[];
  /** Environmental descriptors */
  atmosphere: string[];
}

// ============================================
// Stream Generation Config
// ============================================

/** Configuration for stream generation */
export interface StreamConfig {
  /** Minimum time between entries (seconds) */
  minInterval: number;
  /** Maximum time between entries (seconds) */
  maxInterval: number;
  /** Probability weights for entry types */
  typeWeights: Record<StreamEntryType, number>;
  /** Probability of an NPC mentioning another */
  relationshipChance: number;
  /** Probability of a lore drop */
  loreChance: number;
  /** Probability of breaking fourth wall */
  metaChance: number;
}

/** Default stream configuration */
export const DEFAULT_STREAM_CONFIG: StreamConfig = {
  minInterval: 8,
  maxInterval: 45,
  typeWeights: {
    idle: 50,
    relationship: 25,
    lore: 15,
    meta: 10,
  },
  relationshipChance: 0.25,
  loreChance: 0.15,
  metaChance: 0.10,
};

// ============================================
// Claude Refinement Types
// ============================================

/** Input for Claude refinement */
export interface RefinementInput {
  /** The user's question */
  userQuestion: string;
  /** The speaker NPC */
  speaker: VoiceProfile;
  /** Current seed/day */
  seed: string;
  /** Current domain */
  domain: DomainContext;
  /** Recent stream history (last N entries) */
  recentHistory: StreamEntry[];
  /** Optional: specific topic to address */
  topic?: string;
}

/** Output from Claude refinement */
export interface RefinementOutput {
  /** Refined dialogue fitting the NPC voice */
  content: string;
  /** Confidence that this matches the NPC voice (0-1) */
  voiceMatch: number;
  /** Suggested follow-up topics */
  suggestedTopics: string[];
}

// ============================================
// Stream State Types
// ============================================

/** State of an active stream */
export interface StreamState {
  /** Seed for deterministic generation */
  seed: string;
  /** Domain slug */
  domainSlug: string;
  /** NPCs currently in the stream */
  activeNPCs: string[];
  /** Entries generated so far */
  entries: StreamEntry[];
  /** Current stream time (seconds) */
  currentTime: number;
  /** Next scheduled entry time */
  nextEntryTime: number;
}
