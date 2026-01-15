import type { Item } from '../../types';

/**
 * NDG Quest Items - All quest-related items
 *
 * Includes: Keys, Books, Currency, Maps, Letters, Misc Quest Items
 */

export const questItems: Item[] = [
  // ============================================
  // KEYS (14 items)
  // ============================================

  {
    slug: 'alices-key',
    name: "Alice's Key",
    category: 'items',
    itemType: 'Quest',
    rarity: 'Rare',
    value: 0,
    element: 'Ice',
    tier: 3,
    level: 1,
    image: '/assets/items/artifacts/alices-key.svg',
    description: "A key made of crystallized time. Opens Alice's personal chambers in Frost Reach.",
    effects: [
      { name: 'Temporal Lock', description: "Unlocks Alice's sanctum." },
    ],
    obtainMethods: [
      { type: 'quest', source: 'alice-trust', rate: '100%' },
    ],
    seeAlso: ['alice', 'frost-reach'],
    diceEffects: [
      { trigger: 'onMax', die: 12, effect: 'Temporal Unlock: Reveal hidden time-locked chest' },
    ],
  },
  {
    slug: 'armory-key',
    name: 'Armory Key',
    category: 'items',
    itemType: 'Quest',
    rarity: 'Uncommon',
    value: 0,
    element: 'Neutral',
    tier: 2,
    level: 1,
    image: '/assets/items/quest/key-armory-gold.svg',
    description: 'A military key that opens armory doors. The General keeps these under lock.',
    effects: [
      { name: 'Armory Access', description: 'Opens weapon storage rooms.' },
    ],
    obtainMethods: [
      { type: 'enemy', source: 'skeleton-warrior', location: 'shadow-keep', rate: '5%' },
      { type: 'shop', source: 'command-and-supply', rate: 'Special Request' },
    ],
    seeAlso: ['the-general', 'shadow-keep'],
    diceEffects: [
      { trigger: 'onMax', die: 6, effect: 'Master Access: Unlock bonus weapon cache' },
    ],
  },
  {
    slug: 'chest-key',
    name: 'Chest Key',
    category: 'items',
    itemType: 'Quest',
    rarity: 'Common',
    value: 0,
    element: 'Neutral',
    tier: 1,
    level: 1,
    image: '/assets/items/quest/key-chests-gold.svg',
    description: 'A generic key that opens standard chests. Common but always useful.',
    effects: [
      { name: 'Unlock Chest', description: 'Opens one locked chest. Consumed on use.' },
    ],
    obtainMethods: [
      { type: 'enemy', source: 'skeleton-warrior', location: 'earth', rate: '10%' },
      { type: 'shop', source: 'xtremes-xchange', rate: 'In Stock' },
    ],
    seeAlso: ['earth'],
    diceEffects: [
      { trigger: 'onMax', die: 6, effect: 'Lucky Find: Not consumed on use' },
    ],
  },
  {
    slug: 'deathroom-key',
    name: 'Deathroom Key',
    category: 'items',
    itemType: 'Quest',
    rarity: 'Rare',
    value: 0,
    element: 'Death',
    tier: 3,
    level: 1,
    image: '/assets/items/quest/key-deathroom-gold.svg',
    description: "A bone key that opens Shadow Keep's inner sanctum. Peter guards these jealously.",
    effects: [
      { name: 'Death Gate', description: "Opens the path to Peter's throne room." },
    ],
    obtainMethods: [
      { type: 'enemy', source: 'skeleton-knight', location: 'shadow-keep', rate: '3%' },
    ],
    seeAlso: ['peter', 'shadow-keep'],
    diceEffects: [
      { trigger: 'onMax', die: 8, effect: 'Death Passage: Reveal shortcut to throne room' },
    ],
  },
  {
    slug: 'frostreach-key',
    name: 'Frost Reach Key',
    category: 'items',
    itemType: 'Quest',
    rarity: 'Rare',
    value: 0,
    element: 'Ice',
    tier: 3,
    level: 1,
    image: '/assets/items/quest/key-frostreach-special.svg',
    description: 'An ice-cold key that never melts. Opens the frozen gates of Frost Reach.',
    effects: [
      { name: 'Frozen Gate', description: 'Opens sealed ice barriers.' },
    ],
    obtainMethods: [
      { type: 'enemy', source: 'frost-elemental', location: 'frost-reach', rate: '5%' },
    ],
    seeAlso: ['alice', 'frost-reach'],
    diceEffects: [
      { trigger: 'onMax', die: 12, effect: 'Perfect Thaw: Gate opens without triggering alarm' },
    ],
  },
  {
    slug: 'infernal-key',
    name: 'Infernal Key',
    category: 'items',
    itemType: 'Quest',
    rarity: 'Rare',
    value: 0,
    element: 'Fire',
    tier: 3,
    level: 1,
    image: '/assets/items/quest/key-infernal-special.svg',
    description: "A key forged in hellfire. Opens the sealed chambers of Infernus.",
    effects: [
      { name: 'Flame Lock', description: 'Opens fire-sealed doors.' },
    ],
    obtainMethods: [
      { type: 'enemy', source: 'fire-imp', location: 'infernus', rate: '5%' },
    ],
    seeAlso: ['robert', 'infernus'],
    diceEffects: [
      { trigger: 'onMax', die: 10, effect: 'Fireproof Entry: No fire damage while door opens' },
    ],
  },
  {
    slug: 'iron-key',
    name: 'Iron Key',
    category: 'items',
    itemType: 'Quest',
    rarity: 'Common',
    value: 0,
    element: 'Earth',
    tier: 1,
    level: 1,
    image: '/assets/items/quest/key-common-iron.svg',
    description: 'A sturdy iron key. Opens basic iron locks throughout the domains.',
    effects: [
      { name: 'Iron Lock', description: 'Opens iron-locked doors and gates.' },
    ],
    obtainMethods: [
      { type: 'enemy', source: 'skeleton-warrior', location: 'earth', rate: '15%' },
      { type: 'shop', source: 'command-and-supply', rate: 'In Stock' },
    ],
    seeAlso: ['john', 'earth'],
    diceEffects: [
      { trigger: 'onMax', die: 6, effect: 'Skeleton Key: Opens any iron lock in area' },
    ],
  },
  {
    slug: 'janes-key',
    name: "Jane's Key",
    category: 'items',
    itemType: 'Quest',
    rarity: 'Rare',
    value: 0,
    element: 'Wind',
    tier: 3,
    level: 1,
    image: '/assets/items/artifacts/janes-key.svg',
    description: "A key that floats on air. Opens Jane's private hangar in Aberrant.",
    effects: [
      { name: 'Hangar Access', description: "Unlocks Jane's aircraft bay." },
    ],
    obtainMethods: [
      { type: 'quest', source: 'jane-trust', rate: '100%' },
    ],
    seeAlso: ['jane', 'aberrant'],
    diceEffects: [
      { trigger: 'onMax', die: 20, effect: 'Tailwind: Reveal secret aircraft upgrade' },
    ],
  },
  {
    slug: 'johns-keys',
    name: "John's Keys",
    category: 'items',
    itemType: 'Quest',
    rarity: 'Rare',
    value: 0,
    element: 'Earth',
    tier: 3,
    level: 1,
    image: '/assets/items/artifacts/johns-key.svg',
    description: "A ring of keys belonging to John. Opens various storage areas across Earth domain.",
    effects: [
      { name: 'Earth Access', description: 'Opens all standard locks in Earth domain.' },
    ],
    obtainMethods: [
      { type: 'quest', source: 'john-trust', rate: '100%' },
    ],
    seeAlso: ['john', 'earth'],
    diceEffects: [
      { trigger: 'onMax', die: 6, effect: 'Master Keyring: Reveal hidden Earth cache' },
    ],
  },
  {
    slug: 'mecha-key',
    name: 'Mecha Key',
    category: 'items',
    itemType: 'Quest',
    rarity: 'Uncommon',
    value: 0,
    element: 'Neutral',
    tier: 2,
    level: 1,
    image: '/assets/items/quest/key-mechanarium-special.svg',
    description: 'A high-tech key card. Opens mechanical doors and security systems.',
    effects: [
      { name: 'Tech Access', description: 'Bypasses electronic locks.' },
    ],
    obtainMethods: [
      { type: 'enemy', source: 'security-bot', location: 'null-providence', rate: '8%' },
    ],
    seeAlso: ['dr-voss', 'null-providence'],
    diceEffects: [
      { trigger: 'onMax', die: 6, effect: 'Override: Disable security system in area' },
    ],
  },
  {
    slug: 'peters-key',
    name: "Peter's Key",
    category: 'items',
    itemType: 'Quest',
    rarity: 'Rare',
    value: 0,
    element: 'Death',
    tier: 3,
    level: 1,
    image: '/assets/items/artifacts/peters-key.svg',
    description: "A skeletal key fashioned from Peter's own bone. Opens his personal vault.",
    effects: [
      { name: 'Death Vault', description: "Unlocks Peter's treasury." },
    ],
    obtainMethods: [
      { type: 'quest', source: 'peter-trust', rate: '100%' },
    ],
    seeAlso: ['peter', 'shadow-keep'],
    diceEffects: [
      { trigger: 'onMax', die: 8, effect: 'Death Bounty: Reveal extra treasure in vault' },
    ],
  },
  {
    slug: 'roberts-key',
    name: "Robert's Key",
    category: 'items',
    itemType: 'Quest',
    rarity: 'Rare',
    value: 0,
    element: 'Fire',
    tier: 3,
    level: 1,
    image: '/assets/items/artifacts/roberts-key.svg',
    description: "A key perpetually on fire. Opens Robert's forge in Infernus.",
    effects: [
      { name: 'Forge Access', description: "Unlocks Robert's personal workshop." },
    ],
    obtainMethods: [
      { type: 'quest', source: 'robert-trust', rate: '100%' },
    ],
    seeAlso: ['robert', 'infernus'],
    diceEffects: [
      { trigger: 'onMax', die: 10, effect: 'Forge Master: Reveal secret crafting recipe' },
    ],
  },
  {
    slug: 'shadow-key',
    name: 'Shadow Key',
    category: 'items',
    itemType: 'Quest',
    rarity: 'Rare',
    value: 0,
    element: 'Death',
    tier: 3,
    level: 1,
    image: '/assets/items/quest/key-shadow-special.svg',
    description: 'A key made of solidified shadow. Opens hidden passages in Shadow Keep.',
    effects: [
      { name: 'Shadow Path', description: 'Reveals and opens hidden shadow doors.' },
    ],
    obtainMethods: [
      { type: 'enemy', source: 'shadow-fiend', location: 'shadow-keep', rate: '4%' },
    ],
    seeAlso: ['peter', 'shadow-keep'],
    diceEffects: [
      { trigger: 'onMax', die: 8, effect: 'Shadow Walk: Phase through next shadow barrier' },
    ],
  },
  {
    slug: 'void-key',
    name: 'Void Key',
    category: 'items',
    itemType: 'Quest',
    rarity: 'Epic',
    value: 0,
    element: 'Void',
    tier: 4,
    level: 1,
    image: '/assets/items/quest/key-void-special.svg',
    description: "A key that exists partially outside reality. Opens The One's sealed chambers.",
    effects: [
      { name: 'Void Lock', description: 'Opens void-sealed barriers.' },
      { name: 'Reality Slip', description: 'Holder occasionally phases through thin walls.' },
    ],
    obtainMethods: [
      { type: 'enemy', source: 'void-spawn', location: 'null-providence', rate: '2%' },
    ],
    seeAlso: ['the-one', 'null-providence'],
    diceEffects: [
      { trigger: 'onMax', die: 4, effect: 'Reality Breach: Open portal to secret void chamber' },
    ],
  },

  // ============================================
  // BOOKS & LORE (5 items)
  // ============================================

  {
    slug: 'bible',
    name: 'Bible',
    category: 'items',
    itemType: 'Quest',
    rarity: 'Uncommon',
    value: 50,
    element: 'Neutral',
    tier: 2,
    level: 1,
    image: '/assets/items/armor/bible.svg',
    description: 'A holy book of great spiritual significance. Provides comfort in dark times.',
    effects: [
      { name: 'Holy Text', description: '+20% resistance to fear and dark magic.' },
      { name: 'Read', description: 'Contains lore about the Pantheon.' },
    ],
    obtainMethods: [
      { type: 'shop', source: 'the-burning-pages', rate: 'In Stock' },
    ],
    seeAlso: ['the-one'],
    diceEffects: [
      { trigger: 'onRoll', die: 6, effect: 'Divine Passage: Reveal lore fragment on high roll' },
    ],
  },
  {
    slug: 'diepedia-vol-1',
    name: 'Diepedia Vol. 1',
    category: 'items',
    itemType: 'Quest',
    rarity: 'Rare',
    value: 100,
    element: 'Neutral',
    tier: 3,
    level: 1,
    image: '/assets/items/quest/diepedia-vol1.svg',
    description: "The first volume of the comprehensive guide to dying. Essential reading for adventurers.",
    effects: [
      { name: 'Knowledge', description: 'Reveals basic enemy weaknesses when equipped.' },
      { name: 'Collector', description: 'Part of the Diepedia set.' },
    ],
    obtainMethods: [
      { type: 'shop', source: 'the-burning-pages', rate: 'In Stock' },
    ],
    seeAlso: ['dr-maxwell', 'the-burning-pages'],
    diceEffects: [
      { trigger: 'onRoll', die: 6, effect: 'Study: Reveal extra weakness on high roll' },
    ],
  },
  {
    slug: 'diepedia-vol-2',
    name: 'Diepedia Vol. 2',
    category: 'items',
    itemType: 'Quest',
    rarity: 'Rare',
    value: 100,
    element: 'Neutral',
    tier: 3,
    level: 1,
    image: '/assets/items/quest/diepedia-vol2.svg',
    description: 'The second volume covers advanced death mechanics and resurrection theory.',
    effects: [
      { name: 'Advanced Knowledge', description: 'Reveals boss weaknesses when equipped.' },
      { name: 'Collector', description: 'Part of the Diepedia set.' },
    ],
    obtainMethods: [
      { type: 'shop', source: 'the-burning-pages', rate: 'Rare Stock' },
    ],
    seeAlso: ['dr-maxwell', 'the-burning-pages'],
    diceEffects: [
      { trigger: 'onMax', die: 6, effect: 'Master Study: Reveal boss secret phase' },
    ],
  },
  {
    slug: 'dr-voss-diary',
    name: "Dr. Voss' Diary",
    category: 'items',
    itemType: 'Quest',
    rarity: 'Epic',
    value: 200,
    element: 'Void',
    tier: 4,
    level: 1,
    image: '/assets/items/quest/dr-voss-diary.svg',
    description: "Dr. Voss's personal research journal. Contains dangerous knowledge about the void.",
    effects: [
      { name: 'Forbidden Knowledge', description: 'Unlocks void crafting recipes.' },
      { name: 'Instability', description: 'Reading too much causes temporary madness.' },
    ],
    obtainMethods: [
      { type: 'quest', source: 'voss-trust', rate: '100%' },
      { type: 'enemy', source: 'void-spawn', location: 'null-providence', rate: '1%' },
    ],
    seeAlso: ['dr-voss', 'null-providence', 'void-research-lab'],
    diceEffects: [
      { trigger: 'onRoll', die: 4, effect: 'Insight: Void knowledge scales with roll' },
    ],
  },
  {
    slug: 'maxwells-book',
    name: "Maxwell's Book",
    category: 'items',
    itemType: 'Quest',
    rarity: 'Epic',
    value: 200,
    element: 'Fire',
    tier: 4,
    level: 1,
    image: '/assets/items/quest/maxwells-textbook.svg',
    description: "Dr. Maxwell's spellbook containing his most powerful fire incantations.",
    effects: [
      { name: 'Pyromaniac', description: 'Unlocks advanced fire crafting recipes.' },
      { name: 'Burning Knowledge', description: '+15% fire damage when equipped.' },
    ],
    obtainMethods: [
      { type: 'quest', source: 'maxwell-trust', rate: '100%' },
    ],
    seeAlso: ['dr-maxwell', 'the-burning-pages', 'infernus'],
    diceEffects: [
      { trigger: 'onMax', die: 10, effect: 'Inferno Insight: Reveal legendary fire recipe' },
    ],
  },

  // ============================================
  // CURRENCY & PLACARDS (5 items)
  // ============================================

  {
    slug: 'token',
    name: 'Token',
    category: 'items',
    itemType: 'Currency',
    rarity: 'Common',
    value: 5,
    element: 'Neutral',
    tier: 1,
    level: 1,
    image: '/assets/items/materials/currency-token.svg',
    description: 'A special token worth 5 credits. Used in some shops for bulk transactions.',
    effects: [
      { name: 'Token Value', description: 'Worth 5 credits.' },
    ],
    seeAlso: ['xtremes-xchange'],
    diceEffects: [
      { trigger: 'onMax', die: 6, effect: 'Token Bonus: Worth 10 credits instead' },
    ],
  },
  {
    slug: 'bronze-placard',
    name: 'Bronze Placard',
    category: 'items',
    itemType: 'Currency',
    rarity: 'Uncommon',
    value: 50,
    element: 'Neutral',
    tier: 2,
    level: 1,
    image: '/assets/items/quest/placard-bronze.svg',
    description: 'A bronze achievement marker. Can be traded for special items.',
    effects: [
      { name: 'Achievement', description: 'Trade for Uncommon items at select shops.' },
    ],
    obtainMethods: [
      { type: 'quest', source: 'bronze-challenges', rate: '100%' },
    ],
    seeAlso: ['command-and-supply'],
    diceEffects: [
      { trigger: 'onMax', die: 6, effect: 'Upgraded Trade: Access Rare tier items' },
    ],
  },
  {
    slug: 'silver-placard',
    name: 'Silver Placard',
    category: 'items',
    itemType: 'Currency',
    rarity: 'Rare',
    value: 100,
    element: 'Neutral',
    tier: 3,
    level: 1,
    image: '/assets/items/quest/placard-silver.svg',
    description: 'A silver achievement marker. Proof of significant accomplishment.',
    effects: [
      { name: 'Achievement', description: 'Trade for Rare items at select shops.' },
    ],
    obtainMethods: [
      { type: 'quest', source: 'silver-challenges', rate: '100%' },
    ],
    seeAlso: ['command-and-supply'],
    diceEffects: [
      { trigger: 'onMax', die: 6, effect: 'Upgraded Trade: Access Epic tier items' },
    ],
  },
  {
    slug: 'gold-placard',
    name: 'Gold Placard',
    category: 'items',
    itemType: 'Currency',
    rarity: 'Epic',
    value: 250,
    element: 'Neutral',
    tier: 4,
    level: 1,
    image: '/assets/items/quest/placard-gold.svg',
    description: 'A gold achievement marker. Only the most dedicated earn these.',
    effects: [
      { name: 'Achievement', description: 'Trade for Epic items at select shops.' },
    ],
    obtainMethods: [
      { type: 'quest', source: 'gold-challenges', rate: '100%' },
    ],
    seeAlso: ['command-and-supply'],
    diceEffects: [
      { trigger: 'onMax', die: 6, effect: 'Legendary Trade: Access Legendary tier items' },
    ],
  },
  {
    slug: 'gold-ribbon',
    name: 'Gold Ribbon',
    category: 'items',
    itemType: 'Currency',
    rarity: 'Rare',
    value: 100,
    element: 'Neutral',
    tier: 3,
    level: 1,
    image: '/assets/items/armor/first-place-ribbon.svg',
    description: 'A decorative ribbon awarded for excellence. The General hands these out personally.',
    effects: [
      { name: 'Commendation', description: '+10% reputation gain with military factions.' },
    ],
    obtainMethods: [
      { type: 'quest', source: 'military-excellence', rate: '100%' },
    ],
    seeAlso: ['the-general', 'command-and-supply'],
    diceEffects: [
      { trigger: 'onMax', die: 6, effect: 'Honored: Double reputation gain for this quest' },
    ],
  },

  // ============================================
  // MAPS & NAVIGATION (4 items)
  // ============================================

  {
    slug: 'domain-map',
    name: 'Domain Map',
    category: 'items',
    itemType: 'Quest',
    rarity: 'Uncommon',
    value: 50,
    element: 'Neutral',
    tier: 2,
    level: 1,
    image: '/assets/items/quest/domain-map.svg',
    description: 'A map showing the layout of a single domain. Essential for exploration.',
    effects: [
      { name: 'Cartography', description: 'Reveals unexplored areas of one domain.' },
    ],
    obtainMethods: [
      { type: 'shop', source: 'xtremes-xchange', rate: 'In Stock' },
    ],
    seeAlso: ['xtreme'],
    diceEffects: [
      { trigger: 'onMax', die: 6, effect: 'Full Survey: Reveal all secrets in domain' },
    ],
  },
  {
    slug: 'nexus-map',
    name: 'Nexus Map',
    category: 'items',
    itemType: 'Quest',
    rarity: 'Rare',
    value: 100,
    element: 'Neutral',
    tier: 3,
    level: 1,
    image: '/assets/items/quest/nexus-map.svg',
    description: 'A map of the Nexus, the hub connecting all domains. Shows all portal locations.',
    effects: [
      { name: 'Portal Network', description: 'Reveals all fast travel points.' },
    ],
    obtainMethods: [
      { type: 'quest', source: 'nexus-explorer', rate: '100%' },
    ],
    seeAlso: ['the-dying-saucer'],
    diceEffects: [
      { trigger: 'onMax', die: 6, effect: 'Master Navigator: Unlock secret portal' },
    ],
  },
  {
    slug: 'pinned-map',
    name: 'Pinned Map',
    category: 'items',
    itemType: 'Quest',
    rarity: 'Common',
    value: 20,
    element: 'Neutral',
    tier: 1,
    level: 1,
    image: '/assets/items/quest/pin-dropped.svg',
    description: 'A map with various locations marked with pins. Someone was tracking something.',
    effects: [
      { name: 'Clue', description: 'May reveal hidden quest locations.' },
    ],
    obtainMethods: [
      { type: 'chest', source: 'random-chest', location: 'earth', rate: '5%' },
    ],
    seeAlso: ['earth'],
    diceEffects: [
      { trigger: 'onMax', die: 6, effect: 'X Marks the Spot: Guaranteed hidden quest reveal' },
    ],
  },

  // ============================================
  // LETTERS & DOCUMENTS (4 items)
  // ============================================

  {
    slug: 'priority-mail',
    name: 'Priority Mail',
    category: 'items',
    itemType: 'Quest',
    rarity: 'Common',
    value: 10,
    element: 'Neutral',
    tier: 1,
    level: 1,
    image: '/assets/items/quest/long-distance-mail.svg',
    description: 'An urgent letter that needs delivery. The contents are sealed.',
    effects: [
      { name: 'Delivery', description: 'Deliver to the addressee for a reward.' },
    ],
    obtainMethods: [
      { type: 'quest', source: 'courier-jobs', rate: '100%' },
    ],
    seeAlso: ['the-dying-saucer'],
    diceEffects: [
      { trigger: 'onMax', die: 6, effect: 'Express Delivery: Double delivery reward' },
    ],
  },
  {
    slug: 'rsvp-no',
    name: 'RSVP: No',
    category: 'items',
    itemType: 'Quest',
    rarity: 'Uncommon',
    value: 25,
    element: 'Neutral',
    tier: 2,
    level: 1,
    image: '/assets/items/quest/rsvp-no.svg',
    description: "A formal decline to an invitation. Someone really didn't want to attend.",
    effects: [
      { name: 'Social', description: 'Proof of declining a formal invitation.' },
    ],
    seeAlso: ['null-providence'],
    diceEffects: [
      { trigger: 'onMax', die: 6, effect: 'Polite Refusal: NPC respects your decision more' },
    ],
  },
  {
    slug: 'sealed-letter',
    name: 'Sealed Letter',
    category: 'items',
    itemType: 'Quest',
    rarity: 'Uncommon',
    value: 30,
    element: 'Neutral',
    tier: 2,
    level: 1,
    image: '/assets/items/quest/king-james-sealed-letter.svg',
    description: 'A letter sealed with wax. The contents are private and important.',
    effects: [
      { name: 'Confidential', description: 'Contains important information for a specific NPC.' },
    ],
    obtainMethods: [
      { type: 'quest', source: 'messenger-jobs', rate: '100%' },
    ],
    seeAlso: ['the-dying-saucer'],
    diceEffects: [
      { trigger: 'onRoll', die: 6, effect: 'Peek Inside: Glimpse letter content on high roll' },
    ],
  },
  {
    slug: 'bloody-good-song',
    name: 'Bloody Good Song',
    category: 'items',
    itemType: 'Quest',
    rarity: 'Rare',
    value: 100,
    element: 'Death',
    tier: 3,
    level: 1,
    image: '/assets/items/weapons/melee-bloody-instrument.svg',
    description: "Sheet music written in blood. Boo G's darkest composition, kept under lock.",
    effects: [
      { name: 'Dark Melody', description: 'Can be performed to summon shadow creatures.' },
      { name: 'Cursed Art', description: 'Player takes 10% max HP damage when performing.' },
    ],
    obtainMethods: [
      { type: 'quest', source: 'boo-g-secret', rate: '100%' },
    ],
    seeAlso: ['boo-g', 'peter', 'shadow-keep'],
    diceEffects: [
      { trigger: 'onMax', die: 8, effect: 'Perfect Performance: No HP cost, summon elite shadow' },
    ],
  },
];
