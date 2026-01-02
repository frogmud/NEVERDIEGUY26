import type { Shop } from '../types';

export const shops: Shop[] = [
  // The Wandering Market - Willy One Eye
  {
    slug: 'the-wandering-market',
    name: 'The Wandering Market',
    category: 'shops',
    luckyNumber: 5,
    rarity: 'Epic',
    portrait: '/assets/characters/shops/willy.png',
    sprites: ['/assets/characters/shops/sprite-willy.png'],
    description: 'The Wandering Market operates as an interdimensional trading post that materializes wherever profitable opportunities exist. Specializes in crystallized impossibilities, compressed experiences, and items that exist only in the spaces between realities.',
    proprietor: 'willy',
    // Mobile vendor - travels between domains
    travelPattern: ['the-dying-saucer', 'frost-reach', 'shadow-keep', 'null-providence', 'aberrant'],
    specialty: 'Interdimensional Goods & Crystals',
    schedule: 'Whenever profitable opportunities manifest',
    position: { x: '12%', y: '55%' },
    availability: { chance: 70 }, // 70% chance - interdimensional unpredictability
    inventory: [
      { item: 'soul-jar', price: 650, stock: 'Limited' },
      { item: 'death-shard', price: 300, stock: 'Regular' },
      { item: 'time-crystal', price: 850, stock: 'Special Order' },
      { item: 'dimensional-blade', price: 850, stock: 'Limited' },
      { item: 'void-key', price: 150, stock: 'Available' },
    ],
    seeAlso: ['willy', 'never-die-guy', 'mr-bones', 'dr-voss', 'death-shard', 'dimensional-blade', 'soul-jar'],
  },

  // Banco de Bones - Mr. Bones
  {
    slug: 'banco-de-bones',
    name: 'Banco de Bones',
    category: 'shops',
    luckyNumber: 5,
    rarity: 'Rare',
    portrait: '/assets/characters/shops/mr-bones.png',
    sprites: ['/assets/characters/shops/sprite-mr-bones.png'],
    description: 'Banco de Bones operates as the afterlife\'s premier financial institution. Mr. Bones, Death\'s personal accountant, runs this mobile operation from The Dying Saucer, providing currency exchange and elemental item imports across all domains.',
    proprietor: 'mr-bones',
    location: 'the-dying-saucer',
    specialty: 'Currency Exchange & Death Services',
    schedule: '24/7 - Death never sleeps',
    position: { x: '75%', y: '40%' },
    availability: { always: true }, // Death never sleeps
    inventory: [
      { item: 'ethereal-crystal', price: 275, stock: 'In Stock' },
      { item: 'essence-of-dark', price: 180, stock: 'In Stock' },
      { item: 'soul-charge', price: 450, stock: 'Limited' },
      { item: 'null-sphere', price: 350, stock: 'In Stock' },
      { item: 'void-crystal', price: 800, stock: 'Special Order' },
    ],
    seeAlso: ['mr-bones', 'never-die-guy', 'alice', 'stitch-up-girl'],
  },

  // B's Hits - Boo G
  {
    slug: 'bs-hits',
    name: 'B\'s Hits',
    category: 'shops',
    luckyNumber: 6,
    rarity: 'Legendary',
    portrait: '/assets/characters/shops/boo-g.png',
    sprites: ['/assets/characters/shops/sprite-boo-g.png'],
    description: 'B\'s Hits operates as the afterlife\'s premier music and audio equipment shop. Run by legendary spectral MC Boo G, the shop specializes in supernatural sound technology and ghost-written beats from mobile locations between The Dying Saucer and Aberrant.',
    proprietor: 'boo-g',
    location: 'the-dying-saucer',
    specialty: 'Music Equipment & Audio Services',
    schedule: '24/7 - Music never dies',
    position: { x: '8%', y: '20%' },
    availability: { times: ['dusk', 'night'] }, // Late night DJ vibes
    inventory: [
      { item: 'audio-parts', price: 85, stock: 'In Stock' },
      { item: 'audio-streamer', price: 250, stock: 'In Stock' },
      { item: 'beat-booster', price: 120, stock: 'In Stock' },
      { item: 'war-horn', price: 180, stock: 'In Stock' },
    ],
    seeAlso: ['boo-g', 'keith-man', 'body-count', 'jane'],
  },

  // Null Throne Emporium - King James
  {
    slug: 'null-throne-emporium',
    name: 'Null Throne Emporium',
    category: 'shops',
    luckyNumber: 1,
    rarity: 'Legendary',
    portrait: '/assets/characters/shops/king-james.png',
    sprites: ['/assets/characters/shops/sprite-king-james.png'],
    description: 'The Null Throne Emporium operates as the premier void-touched merchandise retailer in Null Providence. Specializes in items that exist at the boundary between real and unreal, offering goods that defy conventional existence.',
    proprietor: 'king-james',
    location: 'null-providence',
    specialty: 'Void Items & Royal Services',
    schedule: 'Exists when the kingdom needs commerce',
    position: { x: '42%', y: '15%' },
    availability: { times: ['day', 'dusk'] }, // Royal court hours
    inventory: [
      { item: 'royal-cloak-of-duality', price: 1000, stock: 'Limited' },
      { item: 'void-axe', price: 500, stock: 'In Stock' },
      { item: 'null-sphere', price: 350, stock: 'In Stock' },
      { item: 'void-key', price: 150, stock: 'Probability-based' },
      { item: 'nulling-scroll', price: 400, stock: 'Limited' },
    ],
    seeAlso: ['king-james', 'mr-kevin', 'the-one', 'null-providence', 'royal-cloak-of-duality', 'void-lord'],
  },

  // The Burning Pages - Dr. Maxwell
  {
    slug: 'the-burning-pages',
    name: 'The Burning Pages',
    category: 'shops',
    luckyNumber: 4,
    rarity: 'Epic',
    portrait: '/assets/characters/shops/dr-maxwell.png',
    sprites: ['/assets/characters/shops/sprite-dr-maxwell.png'],
    description: 'The Burning Pages operates as the multiverse\'s only purveyor of combustible knowledge and self-destructing literature. Every book sold reduces the universe\'s potential apocalypses by one. "Every book burns at the temperature of its truth."',
    proprietor: 'dr-maxwell',
    // Mobile vendor - travels between fire-touched and scholarly domains
    travelPattern: ['the-dying-saucer', 'infernus', 'shadow-keep', 'aberrant'],
    specialty: 'Combustible Books & Fire Items',
    schedule: 'Dawn to dusk - books glow in the dark',
    position: { x: '68%', y: '60%' },
    availability: { times: ['dawn', 'day'] }, // Scholarly hours
    inventory: [
      { item: 'maxwells-book', price: 500, stock: 'Limited' },
      { item: 'blazecaster', price: 750, stock: 'In Stock' },
      { item: 'arcane-grimoire', price: 350, stock: 'Limited' },
      { item: 'fire-grenade', price: 120, stock: 'In Stock' },
      { item: 'infernal-salts', price: 85, stock: 'In Stock' },
    ],
    seeAlso: ['dr-maxwell', 'robert', 'dr-voss', 'clausen', 'arcane-grimoire', 'fire-grenade'],
  },

  // Command & Supply - The General
  {
    slug: 'command-and-supply',
    name: 'Command & Supply',
    category: 'shops',
    luckyNumber: 2,
    rarity: 'Legendary',
    portrait: '/assets/characters/shops/the-general.png',
    sprites: ['/assets/characters/shops/sprite-the-general.png'],
    description: 'Command & Supply operates as the premier military equipment retailer and recruitment center across multiple domains. Run with military precision from Shadow Keep, the shop specializes in field-tested weapons, tactical gear, and military-grade supplies.',
    proprietor: 'the-general',
    location: 'shadow-keep',
    specialty: 'Tactical Gear & Training',
    schedule: '0600-1800 daily - Military schedule',
    position: { x: '85%', y: '18%' },
    availability: { times: ['dawn', 'day'] }, // 0600-1800 military schedule
    inventory: [
      { item: 'rations', price: 40, stock: 'In Stock' },
      { item: 'frag-bomb', price: 150, stock: 'In Stock' },
      { item: 'war-banner', price: 200, stock: 'Limited' },
      { item: 'precision-rifle', price: 800, stock: 'Certification Required' },
    ],
    seeAlso: ['the-general', 'never-die-guy', 'stitch-up-girl', 'body-count'],
  },

  // Void Research Lab - Dr. Voss
  {
    slug: 'void-research-lab',
    name: 'Void Research Lab',
    category: 'shops',
    luckyNumber: 1,
    rarity: 'Epic',
    portrait: '/assets/characters/shops/dr-voss.png',
    sprites: ['/assets/characters/shops/sprite-dr-voss.png'],
    description: 'The Void Research Lab operates as both cutting-edge research facility and retail outlet for experimental void technologies. Dr. Voss turns theoretical void research into practical products for customers brave enough to beta-test reality-bending equipment.',
    proprietor: 'dr-voss',
    location: 'null-providence',
    specialty: 'Experimental Void Equipment',
    schedule: 'When reality permits experimentation',
    position: { x: '55%', y: '42%' },
    availability: { always: true }, // Research never stops
    inventory: [
      { item: 'void-crystal', price: 275, stock: '93% stable' },
      { item: 'null-sphere', price: 350, stock: '78% stable' },
      { item: 'void-shard', price: 200, stock: '85% stable' },
      { item: 'void-axe', price: 500, stock: 'Beta Testing' },
      { item: 'essence-of-void', price: 180, stock: '71% stable' },
    ],
    seeAlso: ['dr-voss', 'king-james', 'never-die-guy', 'the-one'],
  },

  // X-treme's X-change - X-treme
  {
    slug: 'xtremes-xchange',
    name: 'X-treme\'s X-change',
    category: 'shops',
    luckyNumber: 2,
    rarity: 'Epic',
    portrait: '/assets/characters/shops/xtreme.png',
    sprites: ['/assets/characters/shops/sprite-xtreme.png'],
    description: 'X-treme\'s X-change operates as the multiverse\'s most thrilling shopping experience, where dice-based commerce meets high-stakes retail. Every price is determined by dice rolls, every item comes with double-or-nothing options.',
    proprietor: 'xtreme',
    location: 'infernus',
    specialty: 'Dice-Based Commerce & Loot Boxes',
    schedule: '24/7 - Chaos never sleeps!',
    position: { x: '30%', y: '70%' },
    availability: { times: ['dusk', 'night'] }, // Gambling hours
    inventory: [
      { item: 'random-sword', price: 300, stock: 'Roll for price' },
      { item: 'mystery-box-supreme', price: 500, stock: 'EXTREME' },
      { item: 'lucky-charm', price: 150, stock: 'Roll d20 x 15' },
      { item: 'chaos-coin', price: 250, stock: 'Roll d20 x 25' },
      { item: 'dice-of-destiny', price: 750, stock: 'EXTREME Limited' },
    ],
    seeAlso: ['xtreme', 'never-die-guy', 'the-one', 'mr-bones', 'random-sword', 'mystery-box-supreme', 'lucky-charm', 'chaos-coin', 'dice-of-destiny'],
  },
];
