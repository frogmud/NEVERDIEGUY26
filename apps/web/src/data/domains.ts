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
export function generateDomain(domainId: number, zoneCount = 3): DomainState {
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

// Get all domain IDs in order
export function getDomainOrder(): number[] {
  return [1, 2, 3, 4, 5, 6];
}

// Get next domain ID, or null if finished
export function getNextDomain(currentId: number): number | null {
  const order = getDomainOrder();
  const currentIndex = order.indexOf(currentId);
  if (currentIndex === -1 || currentIndex >= order.length - 1) {
    return null;
  }
  return order[currentIndex + 1];
}
