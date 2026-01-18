/**
 * Domain configuration for the game
 * Maps domain IDs to their visual/gameplay properties
 */

import { DomainState, generateDomainZones } from '../types/zones';

export interface DomainConfig {
  id: number;
  name: string;
  slug: string;
  background: string;
  description: string;
  element: 'Neutral' | 'Void' | 'Earth' | 'Death' | 'Fire' | 'Ice' | 'Wind';
}

export const DOMAIN_CONFIGS: Record<number, DomainConfig> = {
  1: {
    id: 1,
    name: 'Earth',
    slug: 'earth',
    background: '/assets/domains/earth.png',
    description: 'The familiar realm, where it all begins.',
    element: 'Earth',
  },
  2: {
    id: 2,
    name: 'Frost Reach',
    slug: 'frost-reach',
    background: '/assets/domains/frost-reach.png',
    description: 'Frozen wastes where cold things dwell.',
    element: 'Ice',
  },
  3: {
    id: 3,
    name: 'Infernus',
    slug: 'infernus',
    background: '/assets/domains/infernus.png',
    description: 'The burning lands of eternal flame.',
    element: 'Fire',
  },
  4: {
    id: 4,
    name: 'Shadow Keep',
    slug: 'shadow-keep',
    background: '/assets/domains/shadow-keep.png',
    description: 'Where darkness takes physical form.',
    element: 'Death',
  },
  5: {
    id: 5,
    name: 'Null Providence',
    slug: 'null-providence',
    background: '/assets/domains/null-providence.png',
    description: 'The void between worlds.',
    element: 'Void',
  },
  6: {
    id: 6,
    name: 'Aberrant',
    slug: 'aberrant',
    background: '/assets/domains/aberrant.png',
    description: 'Reality bends and breaks here.',
    element: 'Wind',
  },
};

// Generate a domain state with zones
// Flat structure: 1 zone per domain (default)
// Legacy structure: 3 zones per domain (small/big/boss)
export function generateDomain(domainId: number, zoneCount = 1): DomainState {
  const config = DOMAIN_CONFIGS[domainId];
  if (!config) {
    throw new Error(`Unknown domain: ${domainId}`);
  }

  return {
    id: config.id,
    name: config.name,
    slug: config.slug,
    background: config.background,
    zones: generateDomainZones(domainId, zoneCount),
    clearedCount: 0,
    totalZones: zoneCount,
  };
}

// ============================================
// DOMAIN PROGRESSION ORDER
// ============================================

// Get all domain IDs in progression order
// Earth -> Aberrant -> Frost -> Infernus -> Shadow -> Null Providence (finale)
export function getDomainOrder(): number[] {
  return [1, 6, 2, 3, 4, 5];
}

// Check if domain is the finale
export function isFinale(domainId: number): boolean {
  const order = getDomainOrder();
  return order[order.length - 1] === domainId;
}

// Get 1-indexed position in progression (for difficulty scaling)
export function getDomainPosition(domainId: number): number {
  const position = getDomainOrder().indexOf(domainId);
  return position === -1 ? 1 : position + 1;
}

// ============================================
// PORTAL POOLS (for future portal selection UI)
// ============================================

// Portal pools - which domains are available after clearing each domain
// Null Providence (5) is always finale, never in pools
export const PORTAL_POOLS: Record<number, number[]> = {
  1: [6, 2, 3, 4],  // After Earth: Aberrant, Frost, Infernus, Shadow (4 options)
  6: [2, 3, 4],     // After Aberrant: Frost, Infernus, Shadow (3 options)
  2: [3, 4],        // After Frost: Infernus, Shadow (2 options, binary)
  3: [4],           // After Infernus: Shadow only (forced)
  4: [5],           // After Shadow: Null Providence (forced finale)
  5: [],            // After Null Providence: Victory (no portals)
};

// How many portals to show from pool
export const PORTAL_DISPLAY_COUNT: Record<number, number> = {
  1: 3,  // Show 3 of 4
  6: 3,  // Show all 3
  2: 2,  // Binary choice
  3: 1,  // Forced
  4: 1,  // Forced finale
  5: 0,  // Victory
};

// Get next domain from portal pool (auto-selects first for now)
// TODO: Replace with player portal selection
export function getNextDomainFromPool(currentDomainId: number): number | null {
  const pool = PORTAL_POOLS[currentDomainId];
  if (!pool || pool.length === 0) return null;
  return pool[0]; // Auto-pick first in pool (linear progression)
}

// Get next domain ID, or null if finished
export function getNextDomain(currentId: number): number | null {
  return getNextDomainFromPool(currentId);
}
