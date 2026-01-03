import type { Wanderer } from '../types';

export const wanderers: Wanderer[] = [
  // Willy One Eye - Interdimensional Merchant
  {
    slug: 'willy',
    name: 'Willy One Eye',
    category: 'wanderers',
    luckyNumber: 5,
    rarity: 'Epic',
    role: 'Interdimensional Merchant',
    portrait: '/assets/characters/portraits/120px/wanderer-portrait-willy-01.svg',
    sprites: [
      '/assets/market-svg/willy/idle-01.svg',
      '/assets/market-svg/willy/idle-02.svg',
    ],
    description: 'Willy One Eye runs the Wandering Market as an interdimensional trading post where impossibilities become inventory. This cyclopean merchant sees profit potential across all timelines through his massive singular eye, transforming reality tears into trade routes.',
    origin: 'The Space Between',
    species: 'Cyclops (mercantile variant)',
    locations: ['the-wandering-market'],
    services: [
      'Existential goods: soul crystals, compressed regrets',
      'Dimensional items: reality fragments, temporal shards',
      'Impossible objects: things that shouldn\'t exist',
      'Reality exchange across dimensions (5% commission)',
      'Custom impossibilities on commission',
    ],
    dialogue: [
      'One eye sees more than two ever could.',
      'Welcome to the Wandering Market, where everything\'s for sale.',
      'Fixed prices are for dimensions with fixed physics.',
    ],
    seeAlso: ['never-die-guy', 'mr-bones', 'dr-voss', 'dr-maxwell'],
  },

  // Mr. Bones - Death's Accountant
  {
    slug: 'mr-bones',
    name: 'Mr. Bones',
    category: 'wanderers',
    luckyNumber: 5,
    rarity: 'Rare',
    role: 'Financial Services & Elemental Imports',
    portrait: '/assets/characters/portraits/120px/wanderer-portrait-mrbones-01.svg',
    sprites: [
      '/assets/market-svg/mr-bones/idle-01.svg',
    ],
    description: 'Mr. Bones operates as Death\'s personal accountant, managing supernatural commerce from his mobile office at The Dying Saucer. This skeletal merchant monopolizes death documentation and elemental imports across all domains.',
    origin: 'Frost Reach',
    species: 'Skeleton',
    locations: ['the-dying-saucer', 'frost-reach'],
    services: [
      'Death certificate processing',
      'Soul appraisal and trades',
      'Afterlife insurance policies',
      'Cross-dimensional currency exchange',
      'Estate planning and liquidation',
    ],
    dialogue: [
      'Death and taxes are certain. I handle both. Questions?',
      'Your soul has depreciated. Have you considered reinvestment?',
      'Death is just a transition between fiscal years.',
    ],
    seeAlso: ['alice', 'willy', 'xtreme', 'never-die-guy'],
  },

  // Boo G - Spectral MC
  {
    slug: 'boo-g',
    name: 'Boo G',
    category: 'wanderers',
    luckyNumber: 6,
    rarity: 'Legendary',
    role: 'Music Equipment & Audio Services',
    portrait: '/assets/characters/portraits/120px/wanderer-portrait-boog-01.svg',
    sprites: [
      '/assets/market-svg/boo-g/idle-01.svg',
      '/assets/market-svg/boo-g/idle-02.svg',
      '/assets/market-svg/boo-g/idle-03.svg',
    ],
    description: 'Boo G operates as the afterlife\'s premier music merchant and spectral MC. This ghostly entrepreneur runs B\'s Hits from The Dying Saucer, specializing in supernatural sound equipment and ghost-written beats that transcend mortality.',
    origin: 'Aberrant',
    species: 'Ghost',
    birthday: 'May 21, 1972',
    locations: ['the-dying-saucer', 'aberrant'],
    services: [
      'Ghost writing: lyrics by actual ghost',
      'Spectral backup vocals',
      'Atmospheric weather-based beats',
      'Death soundtrack personalization',
      'Afterlife venue booking',
    ],
    dialogue: [
      'They said I couldn\'t drop beats after death. Now I drop beats that make the living drop dead.',
      'Death couldn\'t stop my flow, just gave it echo.',
      'BOO! That\'s my name and what I do to crews.',
    ],
    seeAlso: ['never-die-guy', 'keith-man', 'jane', 'body-count'],
  },

  // King James - Void Merchant King
  {
    slug: 'king-james',
    name: 'King James',
    category: 'wanderers',
    luckyNumber: 1,
    rarity: 'Legendary',
    role: 'Void Items & Royal Services',
    portrait: '/assets/characters/portraits/120px/wanderer-portrait-kingjames-01.svg',
    sprites: [
      '/assets/market-svg/king-james/idle-01.svg',
      '/assets/market-svg/king-james/idle-02.svg',
    ],
    description: 'King James rules the Null Throne Emporium from his floating throne in Null Providence. This void-touched merchant king specializes in items that exist at the boundary between real and unreal, with probability-based pricing.',
    origin: 'Null Providence',
    species: 'Human (Void-touched)',
    locations: ['null-providence'],
    services: [
      'Void weapons: exist only when observed',
      'Null items: probability-based gear',
      'Royal knighthood and citizenship',
      'Reality consultation',
      'Audience with the King',
    ],
    dialogue: [
      'Every crown is heavier in the void. Every throne floats on nothing.',
      'A crown is just a circle that convinced everyone it matters.',
      'In my kingdom, everyone is equally nothing. Equality at last!',
    ],
    seeAlso: ['mr-kevin', 'the-one', 'dr-voss', 'null-providence'],
  },

  // Dr. Maxwell - Pyromaniac Librarian
  {
    slug: 'dr-maxwell',
    name: 'Dr. Maxwell',
    category: 'wanderers',
    luckyNumber: 4,
    rarity: 'Epic',
    role: 'Combustible Books & Fire Items',
    portrait: '/assets/characters/portraits/120px/wanderer-portrait-maxwell-01.svg',
    sprites: [
      '/assets/market-svg/dr-maxwell/idle-01.svg',
    ],
    description: 'Dr. Maxwell operates The Burning Pages, a mobile bookshop specializing in combustible knowledge and self-destructing literature. This pyromaniac librarian trades dangerous texts that literally burn with truth to customers brave enough to read quickly.',
    origin: 'Infernus',
    species: 'Human',
    birthday: 'February 28, 1952',
    locations: ['infernus', 'the-burning-pages'],
    services: [
      'Burning books: knowledge with expiration dates',
      'Fire equipment and pyroclastic tools',
      'Speed reading training',
      'Forbidden knowledge consultation',
      'Pyrobibliology lessons',
    ],
    dialogue: [
      'Knowledge burns brightest just before it turns to ash.',
      'Speed reading isn\'t a skill here—it\'s survival.',
      'Knowledge is power. Power generates heat. Heat causes fire. QED.',
    ],
    seeAlso: ['robert', 'dr-voss', 'clausen', 'willy'],
  },

  // The General - Military Quartermaster
  {
    slug: 'the-general',
    name: 'The General',
    category: 'wanderers',
    luckyNumber: 2,
    rarity: 'Legendary',
    role: 'Military Equipment & Training',
    portrait: '/assets/characters/portraits/120px/shop-portrait-general-02.svg',
    sprites: [
      '/assets/market-svg/the-general/idle-01.svg',
      '/assets/market-svg/the-general/idle-02.svg',
      '/assets/market-svg/the-general/idle-03.svg',
    ],
    description: 'The General operates Command & Supply as the multiverse\'s premier military equipment retailer and recruitment center. This skeletal quartermaster runs operations with tactical precision, evaluating every customer for perfect soldier potential while supplying endless wars.',
    origin: 'The Dying Saucer',
    species: 'Human (Undead)',
    locations: ['shadow-keep', 'command-and-supply'],
    services: [
      'Military weapons: field-tested ordnance',
      'Tactical gear and combat equipment',
      'Basic and advanced training courses',
      'Equipment certification',
      'Combat assessment for soldier potential',
    ],
    dialogue: [
      'Command & Supply isn\'t just a shop—it\'s a military operation.',
      'The perfect soldier dies correctly and reports for duty anyway.',
      'Victory is mandatory. Survival is optional. Purchase is recommended.',
    ],
    seeAlso: ['never-die-guy', 'stitch-up-girl', 'keith-man', 'body-count'],
  },

  // Dr. Voss - Void Scientist
  {
    slug: 'dr-voss',
    name: 'Dr. Voss',
    category: 'wanderers',
    luckyNumber: 3,
    rarity: 'Epic',
    role: 'Experimental Void Equipment',
    portrait: '/assets/characters/portraits/120px/wanderer-portrait-voss-01.svg',
    sprites: [
      '/assets/market-svg/dr-voss/idle-01.svg',
    ],
    description: 'Dr. Voss operates the Void Research Lab as both cutting-edge research facility and retail outlet for experimental void technologies. This void-touched scientist turns theoretical research into practical products for customers brave enough to beta-test reality-bending equipment.',
    origin: 'Shadow Keep',
    species: 'Human (Void-exposed)',
    locations: ['null-providence', 'void-research-lab'],
    services: [
      'Beta testing program for new void items',
      'Research participation studies',
      'Custom void engineering commissions',
      'Reality debugging services',
      'Monthly void subscription deliveries',
    ],
    dialogue: [
      'The void whispers theorems that mathematics forgot.',
      'Side effects are just undocumented features.',
      'Nothing is unstable, but profitably so.',
    ],
    seeAlso: ['never-die-guy', 'king-james', 'dr-maxwell', 'the-one'],
  },

  // X-treme - Skeletal Gambler
  {
    slug: 'xtreme',
    name: 'X-treme',
    category: 'wanderers',
    luckyNumber: 2,
    rarity: 'Epic',
    role: 'Probability-Based Commerce',
    portrait: '/assets/characters/portraits/120px/wanderer-portrait-xtreme-01.svg',
    sprites: [
      '/assets/market-svg/xtreme/idle-01.svg',
    ],
    description: 'X-treme operates X-treme\'s X-change as a skeletal gambler who bet his flesh and lost spectacularly. This glowing red skeleton transforms every transaction into high-stakes gambling where dice determine all prices.',
    origin: 'Earth',
    species: 'Skeleton (high-stakes variant)',
    locations: ['earth', 'xtremes-xchange'],
    services: [
      'Gambling gear: dice, cards, chance items',
      'Mystery boxes with unknown contents',
      'Random weapons with rerolling stats',
      'Double-or-nothing on any purchase',
      'Soul gambling for entire inventory',
    ],
    dialogue: [
      'WELCOME TO X-TREME\'S X-CHANGE!',
      'Why pay retail when you can pay RANDOM?',
      'I bet my flesh and lost! Best decision ever!',
    ],
    seeAlso: ['never-die-guy', 'the-one', 'mr-bones', 'john'],
  },
];
