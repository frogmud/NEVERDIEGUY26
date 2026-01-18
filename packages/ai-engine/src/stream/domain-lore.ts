/**
 * Domain-Specific Lore Pools
 *
 * Each domain has its own pool of lore, rumors, and secrets.
 * NPCs can reference these based on their knowledge and the current domain.
 */

// ============================================
// Domain Lore Types
// ============================================

export interface DomainLore {
  id: string;
  domain: string;
  /** How secret is this (public, common, rare, secret) */
  secrecy: 'public' | 'common' | 'rare' | 'secret';
  /** Full content */
  content: string;
  /** Short reference for templates */
  shortForm: string;
  /** NPCs who definitely know this */
  knownBy: string[];
}

// ============================================
// Earth - The Starting Domain
// ============================================

export const EARTH_LORE: DomainLore[] = [
  {
    id: 'earth-001',
    domain: 'earth',
    secrecy: 'public',
    content: 'Earth is where all journeys begin. And often end.',
    shortForm: 'Earth is the beginning',
    knownBy: ['willy', 'stitch-up-girl', 'boots', 'peter'],
  },
  {
    id: 'earth-002',
    domain: 'earth',
    secrecy: 'common',
    content: 'The merchants of Earth trade in more than goods. They trade in hope.',
    shortForm: 'merchants trade hope here',
    knownBy: ['willy', 'xtreme', 'keith-man'],
  },
  {
    id: 'earth-003',
    domain: 'earth',
    secrecy: 'rare',
    content: "Peter claims Earth as his domain, but it was here before him. Something else shaped it first.",
    shortForm: 'Peter was not first here',
    knownBy: ['willy', 'mr-bones', 'boots'],
  },
  {
    id: 'earth-004',
    domain: 'earth',
    secrecy: 'secret',
    content: 'Beneath Earth lies a door. It leads somewhere the Die-rectors cannot reach.',
    shortForm: 'a hidden door exists',
    knownBy: ['stitch-up-girl', 'the-general-traveler'],
  },
  {
    id: 'earth-005',
    domain: 'earth',
    secrecy: 'public',
    content: 'The familiar realm. Stable. Grounded. Deceptively simple.',
    shortForm: 'deceptively simple',
    knownBy: ['peter', 'boots', 'keith-man'],
  },
];

// ============================================
// Frost Reach - The Frozen Domain
// ============================================

export const FROST_REACH_LORE: DomainLore[] = [
  {
    id: 'frost-001',
    domain: 'frost-reach',
    secrecy: 'public',
    content: 'Frost Reach freezes more than flesh. It freezes time itself.',
    shortForm: 'time freezes here',
    knownBy: ['jane', 'stitch-up-girl', 'boots'],
  },
  {
    id: 'frost-002',
    domain: 'frost-reach',
    secrecy: 'common',
    content: 'Jane rules Frost Reach with patience. Glacial patience. Endless patience.',
    shortForm: 'Jane is endlessly patient',
    knownBy: ['jane', 'the-general-traveler', 'willy'],
  },
  {
    id: 'frost-003',
    domain: 'frost-reach',
    secrecy: 'rare',
    content: "The ice preserves memories. Walk deep enough, you'll hear them.",
    shortForm: 'ice holds memories',
    knownBy: ['jane', 'mr-bones', 'clausen'],
  },
  {
    id: 'frost-004',
    domain: 'frost-reach',
    secrecy: 'secret',
    content: 'Frost Reach was not always frozen. Jane brought the cold to escape something worse.',
    shortForm: 'the cold hides something',
    knownBy: ['the-one', 'jane'],
  },
  {
    id: 'frost-005',
    domain: 'frost-reach',
    secrecy: 'common',
    content: "Cold preserves. Heat destroys. That's not philosophy. That's physics.",
    shortForm: 'cold preserves',
    knownBy: ['jane', 'dr-voss', 'stitch-up-girl'],
  },
];

// ============================================
// Infernus - The Burning Domain
// ============================================

export const INFERNUS_LORE: DomainLore[] = [
  {
    id: 'infernus-001',
    domain: 'infernus',
    secrecy: 'public',
    content: 'Infernus burns eternally. The flames have never dimmed since Alice arrived.',
    shortForm: 'eternal fire',
    knownBy: ['alice', 'dr-maxwell', 'body-count'],
  },
  {
    id: 'infernus-002',
    domain: 'infernus',
    secrecy: 'common',
    content: "Fire transforms what it touches. In Infernus, everything is mid-transformation.",
    shortForm: 'everything transforms here',
    knownBy: ['alice', 'dr-maxwell'],
  },
  {
    id: 'infernus-003',
    domain: 'infernus',
    secrecy: 'rare',
    content: "Dr. Maxwell's library existed here before the flames. Now it burns with them.",
    shortForm: 'the burning library',
    knownBy: ['dr-maxwell', 'alice'],
  },
  {
    id: 'infernus-004',
    domain: 'infernus',
    secrecy: 'secret',
    content: 'The fire that burns in Infernus is not natural. It feeds on something. Something from before.',
    shortForm: 'unnatural fire',
    knownBy: ['alice', 'the-one'],
  },
  {
    id: 'infernus-005',
    domain: 'infernus',
    secrecy: 'common',
    content: 'The ash in Infernus remembers what it used to be. If you listen closely.',
    shortForm: 'ash remembers',
    knownBy: ['dr-maxwell', 'body-count'],
  },
];

// ============================================
// Shadow Keep - The Death Domain
// ============================================

export const SHADOW_KEEP_LORE: DomainLore[] = [
  {
    id: 'shadow-001',
    domain: 'shadow-keep',
    secrecy: 'public',
    content: "Shadow Keep is where death lives. Ironic, isn't it?",
    shortForm: 'where death lives',
    knownBy: ['rhea', 'mr-bones', 'john'],
  },
  {
    id: 'shadow-002',
    domain: 'shadow-keep',
    secrecy: 'common',
    content: 'The shadows here are not absence of light. They are presence of something else.',
    shortForm: 'shadows have presence',
    knownBy: ['rhea', 'the-general-traveler', 'body-count'],
  },
  {
    id: 'shadow-003',
    domain: 'shadow-keep',
    secrecy: 'rare',
    content: "Rhea embraces all who die. But some, she holds longer than others.",
    shortForm: 'Rhea chooses who stays',
    knownBy: ['rhea', 'mr-bones'],
  },
  {
    id: 'shadow-004',
    domain: 'shadow-keep',
    secrecy: 'secret',
    content: 'The Keep existed before the Die-rectors. They merely claimed it. The shadows remember the true rulers.',
    shortForm: 'older than Die-rectors',
    knownBy: ['rhea', 'the-one'],
  },
  {
    id: 'shadow-005',
    domain: 'shadow-keep',
    secrecy: 'common',
    content: 'Death is just a door. Shadow Keep is where the doors are kept.',
    shortForm: 'doors of death',
    knownBy: ['rhea', 'mr-bones', 'the-general-wanderer'],
  },
];

// ============================================
// Null Providence - The Void Domain
// ============================================

export const NULL_PROVIDENCE_LORE: DomainLore[] = [
  {
    id: 'null-001',
    domain: 'null-providence',
    secrecy: 'public',
    content: 'Null Providence is the space between. Between what? Between everything.',
    shortForm: 'the between space',
    knownBy: ['the-one', 'dr-voss', 'king-james'],
  },
  {
    id: 'null-002',
    domain: 'null-providence',
    secrecy: 'common',
    content: "The One claims the void as their domain. The void doesn't disagree.",
    shortForm: 'The One owns the void',
    knownBy: ['the-one', 'john', 'king-james'],
  },
  {
    id: 'null-003',
    domain: 'null-providence',
    secrecy: 'rare',
    content: 'Dr. Voss has measured the void. The measurements change every time.',
    shortForm: 'the void changes',
    knownBy: ['dr-voss', 'clausen'],
  },
  {
    id: 'null-004',
    domain: 'null-providence',
    secrecy: 'secret',
    content: 'The void is not empty. It is full of what was erased. Everything erased ends up here.',
    shortForm: 'repository of the erased',
    knownBy: ['the-one', 'dr-voss'],
  },
  {
    id: 'null-005',
    domain: 'null-providence',
    secrecy: 'common',
    content: 'King James rules a kingdom of nothing. He says that is everything.',
    shortForm: 'kingdom of nothing',
    knownBy: ['king-james', 'mr-kevin', 'clausen'],
  },
];

// ============================================
// Aberrant - The Chaos Domain
// ============================================

export const ABERRANT_LORE: DomainLore[] = [
  {
    id: 'aberrant-001',
    domain: 'aberrant',
    secrecy: 'public',
    content: 'Reality bends and breaks in Aberrant. Robert likes it that way.',
    shortForm: 'reality breaks here',
    knownBy: ['robert', 'boo-g', 'xtreme'],
  },
  {
    id: 'aberrant-002',
    domain: 'aberrant',
    secrecy: 'common',
    content: "The wind in Aberrant whispers secrets. Some are true. Most aren't.",
    shortForm: 'whispering winds',
    knownBy: ['robert', 'clausen', 'boots'],
  },
  {
    id: 'aberrant-003',
    domain: 'aberrant',
    secrecy: 'rare',
    content: 'The chaos in Aberrant is not random. It follows a pattern too complex to perceive.',
    shortForm: 'chaos has a pattern',
    knownBy: ['robert', 'dr-voss'],
  },
  {
    id: 'aberrant-004',
    domain: 'aberrant',
    secrecy: 'secret',
    content: 'Robert was not always like this. The wind changed him. The wind is still changing him.',
    shortForm: 'Robert is still changing',
    knownBy: ['the-one', 'robert'],
  },
  {
    id: 'aberrant-005',
    domain: 'aberrant',
    secrecy: 'common',
    content: 'In Aberrant, yesterday might be tomorrow. Or never. Time is a suggestion here.',
    shortForm: 'time is a suggestion',
    knownBy: ['robert', 'clausen', 'boo-g'],
  },
];

// ============================================
// Cross-Domain Lore
// ============================================

export const CROSS_DOMAIN_LORE: DomainLore[] = [
  {
    id: 'cross-001',
    domain: 'all',
    secrecy: 'public',
    content: 'The Die-rectors each claim a domain, but their power extends everywhere.',
    shortForm: 'Die-rector power is everywhere',
    knownBy: ['willy', 'stitch-up-girl', 'the-general-traveler'],
  },
  {
    id: 'cross-002',
    domain: 'all',
    secrecy: 'common',
    content: 'The game has rules. Breaking them is possible. Surviving that is another matter.',
    shortForm: 'rules can be broken',
    knownBy: ['mr-bones', 'the-general-traveler', 'boots'],
  },
  {
    id: 'cross-003',
    domain: 'all',
    secrecy: 'rare',
    content: 'The Die-rectors were once players. The best players. Or the worst.',
    shortForm: 'Die-rectors were players',
    knownBy: ['mr-bones', 'the-one', 'willy'],
  },
  {
    id: 'cross-004',
    domain: 'all',
    secrecy: 'secret',
    content: 'There is a seventh domain. Unmarked. Unreached. Unspoken.',
    shortForm: 'a seventh domain exists',
    knownBy: ['the-one', 'mr-bones'],
  },
  {
    id: 'cross-005',
    domain: 'all',
    secrecy: 'common',
    content: 'Death is not the end. But the true end? No one speaks of it.',
    shortForm: 'the true end is unknown',
    knownBy: ['rhea', 'mr-bones', 'clausen'],
  },
];

// ============================================
// Registry
// ============================================

export const DOMAIN_LORE_POOLS: Record<string, DomainLore[]> = {
  'earth': EARTH_LORE,
  'frost-reach': FROST_REACH_LORE,
  'infernus': INFERNUS_LORE,
  'shadow-keep': SHADOW_KEEP_LORE,
  'null-providence': NULL_PROVIDENCE_LORE,
  'aberrant': ABERRANT_LORE,
  'all': CROSS_DOMAIN_LORE,
};

/**
 * Get lore for a specific domain
 */
export function getDomainLore(domainSlug: string): DomainLore[] {
  const domainSpecific = DOMAIN_LORE_POOLS[domainSlug] || [];
  const crossDomain = DOMAIN_LORE_POOLS['all'] || [];
  return [...domainSpecific, ...crossDomain];
}

/**
 * Get lore an NPC knows about a domain
 */
export function getNPCDomainLore(npcSlug: string, domainSlug: string): DomainLore[] {
  const allLore = getDomainLore(domainSlug);
  return allLore.filter(lore => lore.knownBy.includes(npcSlug));
}

/**
 * Get lore by secrecy level
 */
export function getLoreBySecrecy(
  domainSlug: string,
  maxSecrecy: 'public' | 'common' | 'rare' | 'secret'
): DomainLore[] {
  const secrecyLevels = ['public', 'common', 'rare', 'secret'];
  const maxIndex = secrecyLevels.indexOf(maxSecrecy);
  const allLore = getDomainLore(domainSlug);
  return allLore.filter(lore => secrecyLevels.indexOf(lore.secrecy) <= maxIndex);
}

/**
 * Get shared lore between two NPCs
 */
export function getSharedLore(npc1: string, npc2: string, domainSlug: string): DomainLore[] {
  const allLore = getDomainLore(domainSlug);
  return allLore.filter(lore =>
    lore.knownBy.includes(npc1) && lore.knownBy.includes(npc2)
  );
}
