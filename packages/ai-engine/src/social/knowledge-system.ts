/**
 * Knowledge System
 *
 * Creates information asymmetry between NPCs:
 * - Secrets: Hidden information NPCs can reveal
 * - Rumors: Information that spreads and evolves
 * - Knowledge domains: What each NPC is an expert in
 * - Discovery: How information transfers between NPCs
 */

// ============================================
// Knowledge Types
// ============================================

export type KnowledgeCategory =
  | 'lore'           // World history, backstory
  | 'secret'         // Hidden truths
  | 'rumor'          // May or may not be true
  | 'location'       // Places and paths
  | 'weakness'       // Vulnerabilities of others
  | 'plan'           // Schemes and intentions
  | 'relationship'   // Who knows whom
  | 'item'           // Object information
  | 'skill';         // Abilities and techniques

export type SecrecyLevel =
  | 'public'         // Everyone knows
  | 'common'         // Most know
  | 'uncommon'       // Some know
  | 'rare'           // Few know
  | 'secret'         // Very few know
  | 'forbidden';     // Dangerous to know

export interface KnowledgePiece {
  id: string;
  category: KnowledgeCategory;
  secrecy: SecrecyLevel;
  content: string;
  shortForm: string; // For quick reference in dialogue
  relatedNPCs?: string[];
  relatedTopics?: string[];
  truthValue: number; // 0-1, how true this is (rumors can be false)
  spreadChance: number; // 0-1, likelihood of sharing
  requiresTrust: number; // Min trust level to share
  consequences?: string; // What happens if revealed
}

// ============================================
// Knowledge Database
// ============================================

export const KNOWLEDGE_BASE: Record<string, KnowledgePiece> = {
  'lore-die-rectors-origin': {
    id: 'lore-die-rectors-origin',
    category: 'lore',
    secrecy: 'rare',
    content: 'The Die-rectors were once mortal game designers who transcended through an unknown ritual.',
    shortForm: 'the Die-rectors were once human',
    relatedNPCs: ['the-one', 'john', 'peter', 'robert', 'alice', 'jane'],
    truthValue: 1.0,
    spreadChance: 0.1,
    requiresTrust: 50,
  },
  'lore-the-game': {
    id: 'lore-the-game',
    category: 'lore',
    secrecy: 'common',
    content: 'The game has been running for longer than anyone can remember. Deaths reset, but memories remain.',
    shortForm: 'the game never ends',
    truthValue: 1.0,
    spreadChance: 0.5,
    requiresTrust: 0,
  },
  'rumor-exit-exists': {
    id: 'rumor-exit-exists',
    category: 'rumor',
    secrecy: 'uncommon',
    content: 'They say there\'s a way out of the game. A door that leads to true freedom.',
    shortForm: 'there might be an exit',
    truthValue: 0.6,
    spreadChance: 0.4,
    requiresTrust: 20,
  },
  'rumor-bones-prophecy': {
    id: 'rumor-bones-prophecy',
    category: 'rumor',
    secrecy: 'uncommon',
    content: 'Mr. Bones made a prophecy: a player will end the game itself.',
    shortForm: 'Mr. Bones prophesied the end',
    relatedNPCs: ['mr-bones'],
    truthValue: 0.8,
    spreadChance: 0.3,
    requiresTrust: 25,
  },
  'location-hidden-passage': {
    id: 'location-hidden-passage',
    category: 'location',
    secrecy: 'rare',
    content: 'There\'s a hidden passage behind the market that bypasses the Die-rector checkpoint.',
    shortForm: 'a secret market passage',
    truthValue: 1.0,
    spreadChance: 0.15,
    requiresTrust: 50,
  },
};

// ============================================
// NPC Knowledge Mapping
// ============================================

export const NPC_KNOWLEDGE: Record<string, string[]> = {
  'the-one': ['lore-die-rectors-origin', 'lore-the-game'],
  'john': ['lore-die-rectors-origin', 'lore-the-game'],
  'robert': ['lore-die-rectors-origin', 'lore-the-game', 'rumor-exit-exists'],
  'willy': ['lore-the-game', 'location-hidden-passage', 'rumor-bones-prophecy'],
  'mr-bones': ['lore-the-game', 'rumor-bones-prophecy', 'rumor-exit-exists'],
  'stitch-up-girl': ['lore-the-game', 'location-hidden-passage'],
  'boots': ['lore-the-game', 'location-hidden-passage', 'rumor-exit-exists'],
};

// ============================================
// Knowledge Operations
// ============================================

export function getKnowledge(id: string): KnowledgePiece | null {
  return KNOWLEDGE_BASE[id] ?? null;
}

export function getNPCKnowledge(npcSlug: string): KnowledgePiece[] {
  const knowledgeIds = NPC_KNOWLEDGE[npcSlug] || [];
  return knowledgeIds.map(id => KNOWLEDGE_BASE[id]).filter(Boolean);
}

export function knowsAbout(npcSlug: string, knowledgeId: string): boolean {
  return (NPC_KNOWLEDGE[npcSlug] || []).includes(knowledgeId);
}

export function getSharedKnowledge(npc1: string, npc2: string): KnowledgePiece[] {
  const k1 = new Set(NPC_KNOWLEDGE[npc1] || []);
  const k2 = new Set(NPC_KNOWLEDGE[npc2] || []);
  const shared = [...k1].filter(x => k2.has(x));
  return shared.map(id => KNOWLEDGE_BASE[id]).filter(Boolean);
}

export function getExclusiveKnowledge(npc: string, comparedTo: string[]): KnowledgePiece[] {
  const npcKnowledge = new Set(NPC_KNOWLEDGE[npc] || []);
  const othersKnowledge = new Set(comparedTo.flatMap(slug => NPC_KNOWLEDGE[slug] || []));
  const exclusive = [...npcKnowledge].filter(x => !othersKnowledge.has(x));
  return exclusive.map(id => KNOWLEDGE_BASE[id]).filter(Boolean);
}

export function canShare(
  npc: string,
  knowledgeId: string,
  targetTrust: number,
  rng: () => number
): boolean {
  if (!knowsAbout(npc, knowledgeId)) return false;

  const knowledge = KNOWLEDGE_BASE[knowledgeId];
  if (!knowledge) return false;

  if (targetTrust < knowledge.requiresTrust) return false;
  return rng() < knowledge.spreadChance;
}

export function transferKnowledge(from: string, to: string, knowledgeId: string): void {
  if (!knowsAbout(from, knowledgeId)) return;
  if (knowsAbout(to, knowledgeId)) return;

  if (!NPC_KNOWLEDGE[to]) {
    NPC_KNOWLEDGE[to] = [];
  }
  NPC_KNOWLEDGE[to].push(knowledgeId);
}

// ============================================
// Knowledge-based Dialogue Helpers
// ============================================

export function getGossipTopics(npc: string): KnowledgePiece[] {
  return getNPCKnowledge(npc).filter(k =>
    k.category === 'rumor' ||
    (k.category === 'secret' && k.secrecy !== 'forbidden')
  );
}

export function getShareableSecrets(npc: string, targetTrust: number): KnowledgePiece[] {
  return getNPCKnowledge(npc).filter(k =>
    k.category === 'secret' &&
    k.requiresTrust <= targetTrust
  );
}

export function getRelevantKnowledge(npc: string, topic: string): KnowledgePiece[] {
  const lowerTopic = topic.toLowerCase();
  return getNPCKnowledge(npc).filter(k =>
    k.content.toLowerCase().includes(lowerTopic) ||
    k.shortForm.toLowerCase().includes(lowerTopic) ||
    (k.relatedTopics || []).some(t => t.toLowerCase().includes(lowerTopic))
  );
}

export function getKnowledgeAboutNPC(sourceNpc: string, targetNpc: string): KnowledgePiece[] {
  return getNPCKnowledge(sourceNpc).filter(k =>
    (k.relatedNPCs || []).includes(targetNpc)
  );
}
