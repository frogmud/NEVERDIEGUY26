/**
 * Domain Tinting
 *
 * Domains tint voice, pools, and UI without per-domain content authoring.
 * Provides instant flavor for cheap.
 */

import type { TemplatePool } from './types';

// ============================================
// Domain Tint Configuration
// ============================================

export interface DomainTint {
  domain: string;

  // Pool weight modifiers (additive to base weights)
  poolModifiers: Partial<Record<TemplatePool, number>>;

  // Variable overrides for templates
  variables: Record<string, string>;

  // UI hints for rendering
  ui: {
    borderGlow: string; // Hex color
    bubbleNoise?: string; // CSS filter or texture class
    ambientIcon?: string; // MUI icon name
    backgroundColor?: string; // Subtle tint for message area
  };
}

// ============================================
// Domain Tint Definitions
// ============================================

export const DOMAIN_TINTS: Record<string, DomainTint> = {
  'null-providence': {
    domain: 'null-providence',
    poolModifiers: {
      lore: 20,
      idle: 15,
      hint: -10, // Less helpful, more cryptic
    },
    variables: {
      '{{hazard}}': 'the void',
      '{{directorName}}': 'The One',
      '{{domainFlavor}}': 'nothingness',
    },
    ui: {
      borderGlow: '#7c4dff', // Purple/void
      ambientIcon: 'AllInclusive',
      backgroundColor: 'rgba(124, 77, 255, 0.05)',
    },
  },

  earth: {
    domain: 'earth',
    poolModifiers: {
      salesPitch: 15,
      hint: 10,
      threat: -10, // John is a builder, not aggressive
    },
    variables: {
      '{{hazard}}': 'the machines',
      '{{directorName}}': 'John',
      '{{domainFlavor}}': 'stone and steel',
    },
    ui: {
      borderGlow: '#8d6e63', // Earth brown
      ambientIcon: 'Terrain',
      backgroundColor: 'rgba(141, 110, 99, 0.05)',
    },
  },

  'shadow-keep': {
    domain: 'shadow-keep',
    poolModifiers: {
      lore: 15,
      threat: 20,
      reaction: 10, // Peter comments on death
    },
    variables: {
      '{{hazard}}': 'the shadows',
      '{{directorName}}': 'Peter',
      '{{domainFlavor}}': 'death and rebirth',
    },
    ui: {
      borderGlow: '#9e9e9e', // Shadowy gray
      bubbleNoise: 'shadow-static',
      ambientIcon: 'NightsStay',
      backgroundColor: 'rgba(158, 158, 158, 0.05)',
    },
  },

  infernus: {
    domain: 'infernus',
    poolModifiers: {
      threat: 25,
      salesPitch: 15,
      challenge: 20,
      hint: -15, // Robert doesn't give hints
    },
    variables: {
      '{{hazard}}': 'the flames',
      '{{directorName}}': 'Robert',
      '{{domainFlavor}}': 'fire and fury',
    },
    ui: {
      borderGlow: '#ff5722', // Fire orange
      ambientIcon: 'Whatshot',
      backgroundColor: 'rgba(255, 87, 34, 0.05)',
    },
  },

  'frost-reach': {
    domain: 'frost-reach',
    poolModifiers: {
      hint: 20,
      lore: 10,
      threat: -10, // Alice is cold but not hostile
    },
    variables: {
      '{{hazard}}': 'the cold',
      '{{directorName}}': 'Alice',
      '{{domainFlavor}}': 'ice and time',
    },
    ui: {
      borderGlow: '#00bcd4', // Ice cyan
      ambientIcon: 'AcUnit',
      backgroundColor: 'rgba(0, 188, 212, 0.05)',
    },
  },

  aberrant: {
    domain: 'aberrant',
    poolModifiers: {
      challenge: 25,
      idle: 20, // Jane is chaotic
      lore: -10, // Hard to get straight answers
    },
    variables: {
      '{{hazard}}': 'the chaos',
      '{{directorName}}': 'Jane',
      '{{domainFlavor}}': 'wind and madness',
    },
    ui: {
      borderGlow: '#e91e63', // Chaotic pink
      bubbleNoise: 'wind-distortion',
      ambientIcon: 'Air',
      backgroundColor: 'rgba(233, 30, 99, 0.05)',
    },
  },

  // Hub areas
  'dying-saucer': {
    domain: 'dying-saucer',
    poolModifiers: {
      salesPitch: 30,
      greeting: 15,
    },
    variables: {
      '{{hazard}}': 'the deals',
      '{{directorName}}': 'the merchants',
      '{{domainFlavor}}': 'commerce',
    },
    ui: {
      borderGlow: '#ffc107', // Gold/merchant
      ambientIcon: 'Store',
      backgroundColor: 'rgba(255, 193, 7, 0.05)',
    },
  },
};

// ============================================
// Tint Application
// ============================================

/**
 * Apply domain tint to pool weights
 */
export function applyDomainTint(
  baseWeights: Partial<Record<TemplatePool, number>>,
  currentDomain: string
): Partial<Record<TemplatePool, number>> {
  const tint = DOMAIN_TINTS[currentDomain];
  if (!tint) return baseWeights;

  const tinted = { ...baseWeights };
  for (const [pool, mod] of Object.entries(tint.poolModifiers)) {
    const poolKey = pool as TemplatePool;
    tinted[poolKey] = Math.max(0, (tinted[poolKey] || 0) + mod);
  }
  return tinted;
}

/**
 * Get domain variables for template processing
 */
export function getDomainVariables(
  currentDomain: string
): Record<string, string> {
  const tint = DOMAIN_TINTS[currentDomain];
  return tint?.variables || {};
}

/**
 * Get UI styling hints for domain
 */
export function getDomainUIHints(currentDomain: string): DomainTint['ui'] | null {
  const tint = DOMAIN_TINTS[currentDomain];
  return tint?.ui || null;
}

/**
 * Check if domain is known
 */
export function isKnownDomain(domain: string): boolean {
  return domain in DOMAIN_TINTS;
}

/**
 * Get all known domains
 */
export function getKnownDomains(): string[] {
  return Object.keys(DOMAIN_TINTS);
}

// ============================================
// Domain Owner Mapping
// ============================================

/**
 * Get the Die-rector who owns a domain
 */
export function getDomainOwner(domain: string): string | null {
  const ownerMap: Record<string, string> = {
    'null-providence': 'the-one',
    earth: 'john',
    'shadow-keep': 'peter',
    infernus: 'robert',
    'frost-reach': 'alice',
    aberrant: 'jane',
  };
  return ownerMap[domain] || null;
}

/**
 * Get the domain owned by a Die-rector
 */
export function getOwnedDomain(npcSlug: string): string | null {
  const domainMap: Record<string, string> = {
    'the-one': 'null-providence',
    john: 'earth',
    peter: 'shadow-keep',
    robert: 'infernus',
    alice: 'frost-reach',
    jane: 'aberrant',
  };
  return domainMap[npcSlug] || null;
}
