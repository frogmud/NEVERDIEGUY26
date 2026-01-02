/**
 * @ndg/shared - Shared type definitions for Never Die Guy
 *
 * Zero-dependency types shared across all packages to prevent circular dependencies.
 */

// ============================================
// NPC Types
// ============================================

export type NPCCategory = 'travelers' | 'wanderers' | 'pantheon' | 'shop';

export interface NPCIdentity {
  slug: string;
  name: string;
  category: NPCCategory;
}

// ============================================
// Mood & Relationship Types
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
  | 'angry'
  | 'scared'
  | 'sad'
  | 'curious';

export interface MoodState {
  current: MoodType;
  intensity: number; // 0-100
}

export interface RelationshipStats {
  respect: number;      // -100 to 100
  trust: number;        // -100 to 100
  familiarity: number;  // 0 to 100
  fear: number;         // 0 to 100
  debt: number;         // Gold owed
}

// ============================================
// Template & Pool Types
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
  | 'reaction'
  | 'gamblingTrashTalk'
  | 'gamblingBrag'
  | 'gamblingFrustration'
  | 'npcGossip'
  | 'npcConflict'
  | 'npcReaction'
  | 'alliance'
  | 'betrayal'
  | 'rescue';

export type MessagePurpose =
  | 'social'
  | 'informational'
  | 'transactional'
  | 'reactive'
  | 'strategic';

// ============================================
// Game State Types
// ============================================

export type CenterPanel = 'globe' | 'combat' | 'shop' | 'doors' | 'summary';

export type GamePhase =
  | 'setup'
  | 'event_select'
  | 'door_select'
  | 'playing'
  | 'shop'
  | 'encounter'
  | 'audit_warning'
  | 'game_over';

export interface GameState {
  phase: GamePhase;
  currentDomain: string;
  roomIndex: number;
  ante: number;
  gold: number;
  playerDeaths: number;
  playerIntegrity: number;
  streak: number;
  seed: string;
}

// ============================================
// Dice Types
// ============================================

export type DieType = 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20';

export interface DiceRoll {
  die: DieType;
  value: number;
  element?: string;
}

// ============================================
// Chat Types
// ============================================

export interface ChatMessage {
  id: string;
  sender: NPCIdentity | { type: 'player'; name?: string };
  targetAudience: string;
  content: string;
  timestamp: number;
  mood: MoodType;
  purpose: MessagePurpose;
  templateId?: string;
}

// ============================================
// Chatbase API Types
// ============================================

export interface ChatRequest {
  npcSlug: string;
  contextHash: string;
  pool: TemplatePool;
  playerContext: {
    deaths: number;
    streak: number;
    domain: string;
    ante: number;
  };
}

export interface ChatResponse {
  text: string;
  mood: MoodType;
  source: 'chatbase' | 'claude_search' | 'fallback';
  entryId?: string;
  confidence?: number;
}
