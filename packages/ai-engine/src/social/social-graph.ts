/**
 * Social Graph System
 *
 * Defines pre-existing relationships between NPCs:
 * - Historical connections
 * - Alliances and rivalries
 * - Power dynamics
 * - Shared experiences
 */

import type { RelationshipStats } from '../core/types';

// ============================================
// Relationship Types
// ============================================

export type RelationshipType =
  | 'allies'          // Work together
  | 'rivals'          // Compete/conflict
  | 'mentor_student'  // Teaching relationship
  | 'old_friends'     // Long history together
  | 'enemies'         // Active hostility
  | 'acquaintances'   // Know each other
  | 'strangers'       // Never met
  | 'family'          // Blood/created bond
  | 'colleagues'      // Work in same sphere
  | 'former_allies'   // Used to be close
  | 'unrequited'      // One-sided interest
  | 'fear_respect';   // Fears but respects

export interface SocialRelationship {
  type: RelationshipType;
  strength: number; // 1-10
  history?: string;
  sharedEvents?: string[];
  baseStats: Partial<RelationshipStats>;
}

export type SocialGraph = Record<string, Record<string, SocialRelationship>>;

/**
 * Pre-existing relationships between NPCs
 * Format: SOCIAL_GRAPH[fromNPC][toNPC] = relationship
 */
export const SOCIAL_GRAPH: SocialGraph = {
  // Die-rectors relationships abbreviated for library
  'the-one': {
    'john': { type: 'colleagues', strength: 7, baseStats: { respect: 40, familiarity: 80, trust: 30 } },
    'peter': { type: 'colleagues', strength: 6, baseStats: { respect: 20, familiarity: 70, trust: 10 } },
    'robert': { type: 'rivals', strength: 5, baseStats: { respect: 50, familiarity: 90, trust: -20 } },
    'alice': { type: 'acquaintances', strength: 4, baseStats: { respect: 30, familiarity: 60, trust: -10 } },
    'jane': { type: 'allies', strength: 8, baseStats: { respect: 60, familiarity: 85, trust: 50 } },
    'willy': { type: 'acquaintances', strength: 2, baseStats: { respect: -20, familiarity: 30, trust: 0 } },
    'stitch-up-girl': { type: 'enemies', strength: 6, baseStats: { respect: 10, familiarity: 50, trust: -60 } },
  },
  'john': {
    'the-one': { type: 'fear_respect', strength: 9, baseStats: { respect: 70, familiarity: 80, trust: 20, fear: 60 } },
    'peter': { type: 'rivals', strength: 5, baseStats: { respect: -10, familiarity: 60, trust: -20 } },
    'jane': { type: 'allies', strength: 7, baseStats: { respect: 50, familiarity: 70, trust: 40 } },
  },
  'willy': {
    'mr-bones': { type: 'old_friends', strength: 8, baseStats: { respect: 60, familiarity: 90, trust: 70 } },
    'stitch-up-girl': { type: 'allies', strength: 6, baseStats: { respect: 50, familiarity: 60, trust: 50 } },
    'boo-g': { type: 'old_friends', strength: 7, baseStats: { respect: 40, familiarity: 80, trust: 60 } },
    'the-one': { type: 'fear_respect', strength: 5, baseStats: { respect: 20, familiarity: 30, trust: -40, fear: 60 } },
    'boots': { type: 'allies', strength: 6, baseStats: { respect: 45, familiarity: 55, trust: 50 } },
  },
  'stitch-up-girl': {
    'the-general-traveler': { type: 'allies', strength: 9, baseStats: { respect: 70, familiarity: 85, trust: 80 } },
    'body-count': { type: 'allies', strength: 7, baseStats: { respect: 50, familiarity: 70, trust: 60 } },
    'boots': { type: 'old_friends', strength: 7, baseStats: { respect: 55, familiarity: 75, trust: 65 } },
    'clausen': { type: 'allies', strength: 6, baseStats: { respect: 45, familiarity: 65, trust: 55 } },
    'willy': { type: 'allies', strength: 6, baseStats: { respect: 45, familiarity: 60, trust: 50 } },
    'the-one': { type: 'enemies', strength: 8, baseStats: { respect: 0, familiarity: 50, trust: -80, fear: 40 } },
    'peter': { type: 'enemies', strength: 7, baseStats: { respect: -20, familiarity: 50, trust: -60, fear: 30 } },
  },
  'the-general-traveler': {
    'stitch-up-girl': { type: 'allies', strength: 9, baseStats: { respect: 70, familiarity: 85, trust: 80 } },
    'body-count': { type: 'colleagues', strength: 8, baseStats: { respect: 65, familiarity: 75, trust: 70 } },
    'clausen': { type: 'old_friends', strength: 8, baseStats: { respect: 60, familiarity: 90, trust: 85 } },
    'the-one': { type: 'enemies', strength: 9, baseStats: { respect: 20, familiarity: 40, trust: -100, fear: 20 } },
  },

  // ============================================
  // Homepage NPCs - Extended Relationships
  // ============================================

  'mr-bones': {
    'willy': { type: 'old_friends', strength: 8, history: 'Fellow skeletons from the early days', baseStats: { respect: 60, familiarity: 90, trust: 70 } },
    'boo-g': { type: 'allies', strength: 6, history: 'Undead solidarity', baseStats: { respect: 40, familiarity: 70, trust: 50 } },
    'stitch-up-girl': { type: 'acquaintances', strength: 4, baseStats: { respect: 30, familiarity: 50, trust: 30 } },
    'keith-man': { type: 'colleagues', strength: 5, history: 'Both Frost Reach residents', baseStats: { respect: 35, familiarity: 65, trust: 40 } },
    'dr-voss': { type: 'rivals', strength: 4, history: 'Voss once tried to study his bones', baseStats: { respect: 20, familiarity: 45, trust: -20 } },
    'king-james': { type: 'acquaintances', strength: 3, baseStats: { respect: 25, familiarity: 40, trust: 10 } },
  },

  'boo-g': {
    'willy': { type: 'old_friends', strength: 7, history: 'Undead party scene', baseStats: { respect: 40, familiarity: 80, trust: 60 } },
    'mr-bones': { type: 'allies', strength: 6, history: 'Ghost and skeleton solidarity', baseStats: { respect: 45, familiarity: 70, trust: 55 } },
    'boots': { type: 'allies', strength: 7, history: 'Chaos appreciates chaos', baseStats: { respect: 50, familiarity: 75, trust: 65 } },
    'xtreme': { type: 'old_friends', strength: 8, history: 'EXTREME vibes match SPECTRAL vibes', baseStats: { respect: 55, familiarity: 85, trust: 70 } },
    'king-james': { type: 'rivals', strength: 4, history: 'Royalty vs street performer', baseStats: { respect: -10, familiarity: 50, trust: -20 } },
  },

  'keith-man': {
    'mr-kevin': { type: 'allies', strength: 6, history: 'Meta observers recognize each other', baseStats: { respect: 50, familiarity: 60, trust: 50 } },
    'mr-bones': { type: 'colleagues', strength: 5, history: 'Frost Reach neighbors', baseStats: { respect: 40, familiarity: 65, trust: 45 } },
    'boots': { type: 'allies', strength: 6, history: 'Speed meets kicks', baseStats: { respect: 45, familiarity: 60, trust: 55 } },
    'stitch-up-girl': { type: 'acquaintances', strength: 4, baseStats: { respect: 35, familiarity: 45, trust: 40 } },
  },

  'mr-kevin': {
    'keith-man': { type: 'allies', strength: 6, history: 'Pattern watchers', baseStats: { respect: 50, familiarity: 60, trust: 50 } },
    'dr-voss': { type: 'colleagues', strength: 5, history: 'Scientific observers', baseStats: { respect: 45, familiarity: 55, trust: 30 } },
    'clausen': { type: 'acquaintances', strength: 4, history: 'Both Earth residents', baseStats: { respect: 40, familiarity: 50, trust: 35 } },
    'body-count': { type: 'allies', strength: 6, history: 'Data appreciates data', baseStats: { respect: 55, familiarity: 65, trust: 60 } },
  },

  'clausen': {
    'the-general-traveler': { type: 'old_friends', strength: 8, history: 'War buddies from old campaigns', baseStats: { respect: 60, familiarity: 90, trust: 85 } },
    'stitch-up-girl': { type: 'allies', strength: 6, history: 'She patched him up many times', baseStats: { respect: 50, familiarity: 65, trust: 55 } },
    'mr-kevin': { type: 'acquaintances', strength: 4, history: 'Earth neighbors', baseStats: { respect: 35, familiarity: 50, trust: 30 } },
    'body-count': { type: 'colleagues', strength: 5, history: 'Both track the dead', baseStats: { respect: 45, familiarity: 55, trust: 50 } },
    'xtreme': { type: 'rivals', strength: 4, history: 'Chaos vs order', baseStats: { respect: 10, familiarity: 45, trust: -10 } },
  },

  'body-count': {
    'stitch-up-girl': { type: 'allies', strength: 7, history: 'She creates survivors, he counts the rest', baseStats: { respect: 55, familiarity: 70, trust: 60 } },
    'the-general-traveler': { type: 'colleagues', strength: 8, history: 'Both keep records of war', baseStats: { respect: 65, familiarity: 75, trust: 70 } },
    'boots': { type: 'allies', strength: 6, history: 'Both Aberrant chaos agents', baseStats: { respect: 45, familiarity: 65, trust: 55 } },
    'mr-kevin': { type: 'allies', strength: 6, history: 'Statistics enthusiasts', baseStats: { respect: 55, familiarity: 65, trust: 60 } },
    'clausen': { type: 'colleagues', strength: 5, history: 'Tracking the departed', baseStats: { respect: 45, familiarity: 55, trust: 50 } },
  },

  'boots': {
    'boo-g': { type: 'allies', strength: 7, history: 'Chaos recognizes chaos', baseStats: { respect: 50, familiarity: 75, trust: 65 } },
    'xtreme': { type: 'old_friends', strength: 8, history: 'EXTREME KICKING BUDDIES', baseStats: { respect: 60, familiarity: 85, trust: 75 } },
    'stitch-up-girl': { type: 'old_friends', strength: 7, history: 'She patches up kick-related injuries', baseStats: { respect: 55, familiarity: 75, trust: 65 } },
    'willy': { type: 'allies', strength: 6, history: 'Good customer', baseStats: { respect: 45, familiarity: 55, trust: 50 } },
    'body-count': { type: 'allies', strength: 6, history: 'Aberrant neighbors', baseStats: { respect: 45, familiarity: 65, trust: 55 } },
    'keith-man': { type: 'allies', strength: 6, history: 'Fast friends', baseStats: { respect: 45, familiarity: 60, trust: 55 } },
    'king-james': { type: 'rivals', strength: 3, history: 'Kicked his crown once', baseStats: { respect: -5, familiarity: 40, trust: -30 } },
  },

  'dr-maxwell': {
    'dr-voss': { type: 'rivals', strength: 7, history: 'Competing scientific philosophies', baseStats: { respect: 40, familiarity: 80, trust: -30 } },
    'stitch-up-girl': { type: 'colleagues', strength: 5, history: 'Medical professionals', baseStats: { respect: 45, familiarity: 55, trust: 40 } },
    'xtreme': { type: 'allies', strength: 5, history: 'Chaos fuels experiments', baseStats: { respect: 30, familiarity: 55, trust: 35 } },
    'king-james': { type: 'acquaintances', strength: 3, history: 'Royalty once funded research', baseStats: { respect: 20, familiarity: 40, trust: 15 } },
  },

  'xtreme': {
    'boots': { type: 'old_friends', strength: 8, history: 'EXTREME CHAOS PARTNERSHIP', baseStats: { respect: 60, familiarity: 85, trust: 75 } },
    'boo-g': { type: 'old_friends', strength: 8, history: 'EXTREME SPECTRAL VIBES', baseStats: { respect: 55, familiarity: 85, trust: 70 } },
    'dr-maxwell': { type: 'allies', strength: 5, history: 'EXTREME experiments', baseStats: { respect: 35, familiarity: 55, trust: 40 } },
    'willy': { type: 'allies', strength: 6, history: 'Gambles at Willy shop', baseStats: { respect: 40, familiarity: 60, trust: 50 } },
    'clausen': { type: 'rivals', strength: 4, history: 'Order vs EXTREME chaos', baseStats: { respect: 10, familiarity: 45, trust: -15 } },
  },

  'dr-voss': {
    'dr-maxwell': { type: 'rivals', strength: 7, history: 'Academic rivalry', baseStats: { respect: 35, familiarity: 80, trust: -25 } },
    'king-james': { type: 'colleagues', strength: 6, history: 'Both Null Providence elite', baseStats: { respect: 55, familiarity: 70, trust: 45 } },
    'mr-kevin': { type: 'colleagues', strength: 5, history: 'Scientific observation', baseStats: { respect: 45, familiarity: 55, trust: 30 } },
    'mr-bones': { type: 'rivals', strength: 4, history: 'Wanted to study those bones', baseStats: { respect: 25, familiarity: 45, trust: -20 } },
    'stitch-up-girl': { type: 'acquaintances', strength: 4, history: 'Medical professionals with different ethics', baseStats: { respect: 30, familiarity: 50, trust: 20 } },
  },

  'king-james': {
    'dr-voss': { type: 'colleagues', strength: 6, history: 'Null Providence court', baseStats: { respect: 45, familiarity: 70, trust: 40 } },
    'boots': { type: 'rivals', strength: 3, history: 'Never forgave the crown kick', baseStats: { respect: -10, familiarity: 40, trust: -40 } },
    'boo-g': { type: 'rivals', strength: 4, history: 'Peasant performer', baseStats: { respect: -15, familiarity: 50, trust: -25 } },
    'willy': { type: 'acquaintances', strength: 4, history: 'Royal patronage of merchants', baseStats: { respect: 20, familiarity: 50, trust: 25 } },
    'mr-bones': { type: 'acquaintances', strength: 3, history: 'Fellow ancient beings', baseStats: { respect: 30, familiarity: 40, trust: 15 } },
  },

  // The General (Wanderer version - shopkeeper)
  'the-general': {
    'the-general-traveler': { type: 'rivals', strength: 6, history: 'Same name, different paths', baseStats: { respect: 40, familiarity: 70, trust: 20 } },
    'stitch-up-girl': { type: 'allies', strength: 7, history: 'Field medic relationship', baseStats: { respect: 60, familiarity: 75, trust: 70 } },
    'body-count': { type: 'colleagues', strength: 7, history: 'Military logistics', baseStats: { respect: 55, familiarity: 70, trust: 65 } },
    'clausen': { type: 'old_friends', strength: 7, history: 'Old war comrades', baseStats: { respect: 55, familiarity: 80, trust: 75 } },
  },
};

// ============================================
// Graph Utilities
// ============================================

export function getRelationshipFromGraph(from: string, to: string): SocialRelationship | null {
  return SOCIAL_GRAPH[from]?.[to] ?? null;
}

export function getAllRelationships(npc: string): Array<{ target: string; relationship: SocialRelationship }> {
  const relationships = SOCIAL_GRAPH[npc];
  if (!relationships) return [];
  return Object.entries(relationships).map(([target, relationship]) => ({ target, relationship }));
}

export function getMutualFriends(npc1: string, npc2: string): string[] {
  const conn1 = new Set(Object.keys(SOCIAL_GRAPH[npc1] || {}));
  const conn2 = new Set(Object.keys(SOCIAL_GRAPH[npc2] || {}));
  return [...conn1].filter(x => conn2.has(x));
}

export function getMutualEnemies(npc: string): string[] {
  const relationships = getAllRelationships(npc);
  return relationships
    .filter(r => r.relationship.type === 'enemies' || r.relationship.type === 'rivals')
    .map(r => r.target);
}

export function getRelationshipChain(from: string, to: string): string[] | null {
  // BFS to find connection path
  const visited = new Set<string>();
  const queue: Array<{ node: string; path: string[] }> = [{ node: from, path: [from] }];

  while (queue.length > 0) {
    const { node, path } = queue.shift()!;
    if (node === to) return path;
    if (visited.has(node)) continue;
    visited.add(node);

    const connections = Object.keys(SOCIAL_GRAPH[node] || {});
    for (const next of connections) {
      if (!visited.has(next)) {
        queue.push({ node: next, path: [...path, next] });
      }
    }
  }

  return null;
}

export function getCategoryRelationships(npc: string, type: RelationshipType): string[] {
  const relationships = getAllRelationships(npc);
  return relationships.filter(r => r.relationship.type === type).map(r => r.target);
}

export function getRelationshipDescription(from: string, to: string): string {
  const relationship = getRelationshipFromGraph(from, to);
  if (!relationship) return 'strangers with no history';
  return relationship.history || `${relationship.type} (strength: ${relationship.strength})`;
}
