import type { Faction } from '../types';

/**
 * Factions - Gameplay teams for 1v1 and arena modes
 *
 * Each faction represents a philosophical alignment tied to a Die-rector's domain.
 * Players can join factions for bonuses, rivalries, and team-based play.
 */
export const factions: Faction[] = [
  // Void Seekers - The One's followers
  {
    slug: 'void-seekers',
    name: 'Void Seekers',
    category: 'factions',
    luckyNumber: 1,
    rarity: 'Epic',
    image: '/assets/factions/faction-icon-void-seekers.svg',
    motto: 'Before two, there was one. Before one, there was nothing.',
    founder: 'the-one',
    homeBase: 'null-providence',
    element: 'Void',
    description: 'Those who seek truth in nothingness. The Void Seekers embrace the philosophy that existence is optional, and true power comes from understanding the baseline of reality itself.',
    members: ['mr-kevin', 'zero-chance'],
    rivals: ['iron-collective'],
    allies: ['shadow-court'],
    bonuses: [
      '+10% dodge chance (reality forgets to hit you)',
      'Void damage ignores 15% of enemy defense',
      'Lucky Number 1 rolls grant brief invulnerability',
    ],
    lore: 'Founded when The One first spoke the words that questioned existence. Members often debate whether they truly exist or are merely probability manifesting.',
    seeAlso: ['the-one', 'null-providence', 'mr-kevin'],
  },

  // Iron Collective - John's builders
  {
    slug: 'iron-collective',
    name: 'Iron Collective',
    category: 'factions',
    luckyNumber: 2,
    rarity: 'Epic',
    image: '/assets/factions/faction-icon-iron-collective.svg',
    motto: 'Everything can be improved. Everything WILL be improved.',
    founder: 'john',
    homeBase: 'earth',
    element: 'Earth',
    description: 'Engineers, builders, and those who believe in the power of mechanical perfection. The Iron Collective sees flesh as a prototype and metal as the final form.',
    members: ['never-die-guy'],
    rivals: ['void-seekers', 'verdant-order'],
    allies: ['flame-wardens'],
    bonuses: [
      '+20% effectiveness with mechanical weapons',
      'Armor repairs 5% per turn',
      'Lucky Number 2 rolls upgrade a random item temporarily',
    ],
    lore: 'John\'s first construction was not a machine, but an ideology. The Collective maintains that all things are simply problems awaiting elegant solutions.',
    seeAlso: ['john', 'earth', 'never-die-guy'],
  },

  // Shadow Court - Peter's undead
  {
    slug: 'shadow-court',
    name: 'Shadow Court',
    category: 'factions',
    luckyNumber: 3,
    rarity: 'Epic',
    image: '/assets/factions/faction-icon-shadow-court.svg',
    motto: 'Death is not an ending. It is a promotion.',
    founder: 'peter',
    homeBase: 'shadow-keep',
    element: 'Death',
    description: 'Those who have touched death and returned, or never truly died at all. The Shadow Court understands that mortality is merely a phase, not a destination.',
    members: ['boots'],
    rivals: ['verdant-order'],
    allies: ['void-seekers'],
    bonuses: [
      '+15% lifesteal on all attacks',
      'Revival costs 25% less',
      'Lucky Number 3 rolls summon a shadow ally',
    ],
    lore: 'Peter established the Court to govern those who exist between life and death. Members often serve as judges in disputes about whether someone is truly gone.',
    seeAlso: ['peter', 'shadow-keep', 'boots'],
  },

  // Flame Wardens - Robert's pyromancers
  {
    slug: 'flame-wardens',
    name: 'Flame Wardens',
    category: 'factions',
    luckyNumber: 4,
    rarity: 'Epic',
    image: '/assets/factions/faction-icon-flame-wardens.svg',
    motto: 'Burn bright. Burn everything.',
    founder: 'robert',
    homeBase: 'infernus',
    element: 'Fire',
    description: 'Pyromancers, berserkers, and those who believe destruction is the purest form of creation. The Flame Wardens embrace chaos and the purifying nature of fire.',
    members: ['xtreme', 'willy'],
    rivals: ['frost-heralds'],
    allies: ['iron-collective'],
    bonuses: [
      '+25% fire damage',
      'Burning enemies take 5% more damage from all sources',
      'Lucky Number 4 rolls trigger a flame burst',
    ],
    lore: 'Born in the heart of Infernus, the Wardens believe that only through destruction can new things be born. They are surprisingly philosophical for arsonists.',
    seeAlso: ['robert', 'infernus'],
  },

  // Frost Heralds - Alice's frozen chosen
  {
    slug: 'frost-heralds',
    name: 'Frost Heralds',
    category: 'factions',
    luckyNumber: 5,
    rarity: 'Epic',
    image: '/assets/factions/faction-icon-frost-heralds.svg',
    motto: 'Patience. Stillness. Victory.',
    founder: 'alice',
    homeBase: 'frost-reach',
    element: 'Ice',
    description: 'Masters of patience and precision, the Frost Heralds believe in calculated strikes and the wisdom of waiting. They freeze their enemies not just physically, but strategically.',
    members: ['dr-voss', 'clausen'],
    rivals: ['flame-wardens'],
    allies: ['verdant-order'],
    bonuses: [
      '+20% ice damage',
      'Slowed enemies have -10% accuracy',
      'Lucky Number 5 rolls freeze an enemy for 1 turn',
    ],
    lore: 'Alice teaches that heat is impatience made manifest. The Heralds meditate in the coldest reaches of Frost Reach, learning to act only when the moment is perfect.',
    seeAlso: ['alice', 'frost-reach'],
  },

  // Verdant Order - Jane's naturalists
  {
    slug: 'verdant-order',
    name: 'Verdant Order',
    category: 'factions',
    luckyNumber: 6,
    rarity: 'Epic',
    image: '/assets/factions/faction-icon-verdant-order.svg',
    motto: 'All things grow. All things return.',
    founder: 'jane',
    homeBase: 'aberrant',
    element: 'Wind',
    description: 'Druids, healers, and those who honor the cycle of growth and decay. The Verdant Order sees themselves as gardeners of reality, tending to the natural order.',
    members: ['stitch-up-girl', 'body-count'],
    rivals: ['iron-collective', 'shadow-court'],
    allies: ['frost-heralds'],
    bonuses: [
      '+15% healing received',
      'Regenerate 3% HP at the start of each turn',
      'Lucky Number 6 rolls cause overgrowth (area denial)',
    ],
    lore: 'Jane planted the first seed of the Order in fertile ground, and it has grown ever since. Members believe that even machines will eventually return to nature.',
    seeAlso: ['jane', 'aberrant'],
  },

  // Board Room - The elite guild
  {
    slug: 'board-room',
    name: 'The Board Room',
    category: 'factions',
    luckyNumber: 7,
    rarity: 'Legendary',
    image: '/assets/factions/faction-icon-board-room.svg',
    motto: 'All numbers. All doors. All possibilities.',
    founder: 'the-one',
    homeBase: undefined, // Transcends the six doors - no physical domain
    element: 'Neutral',
    description: 'An elite faction that transcends the six doors. The Board Room serves all Die-rectors equally and has access to powers from every domain. Membership is by invitation only.',
    members: ['mr-kevin'],
    rivals: ['wandering-stars'],
    allies: ['void-seekers', 'iron-collective', 'shadow-court', 'flame-wardens', 'frost-heralds', 'verdant-order'],
    bonuses: [
      'Lucky Number 7 counts as any number rolled',
      '+5% to all stats',
      'Can use abilities from any faction once per match',
    ],
    lore: 'Legend says the Board Room existed before the six doors were numbered. Its members sit at the table where reality itself is decided by dice rolls.',
    seeAlso: ['the-one', 'mr-kevin'],
  },

  // Wandering Stars - Independent travelers
  {
    slug: 'wandering-stars',
    name: 'Wandering Stars',
    category: 'factions',
    luckyNumber: 0,
    rarity: 'Rare',
    image: '/assets/factions/faction-icon-wandering-stars.svg',
    motto: 'No master. No door. Only the journey.',
    founder: 'never-die-guy',
    element: 'Neutral',
    description: 'Those who refuse to pledge allegiance to any Die-rector. The Wandering Stars believe in freedom above all else, traveling between domains without obligation.',
    members: ['never-die-guy', 'boots', 'keith-man', 'the-general'],
    rivals: ['board-room'],
    allies: [],
    bonuses: [
      '+10% movement speed',
      'No faction penalties in any domain',
      'Lucky Number 0: Reroll any die once per match',
    ],
    lore: 'Not every traveler wants a home. The Wandering Stars formed organically from those who found purpose in the journey itself rather than the destination.',
    seeAlso: ['never-die-guy', 'boots'],
  },
];
