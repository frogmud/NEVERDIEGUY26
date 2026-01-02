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
