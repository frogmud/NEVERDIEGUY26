import type { Domain } from '../types';

export const domains: Domain[] = [
  // Null Providence - Door 1, The One
  {
    slug: 'null-providence',
    name: 'Null Providence',
    category: 'domains',
    luckyNumber: 1,
    rarity: 'Legendary',
    door: 1,
    dieRector: 'the-one',
    element: 'Void',
    difficulty: 'Extreme',
    levelRange: '35-45',
    image: '/assets/domains/null-providence.png',
    description: 'Null Providence manifests when Door 1 opens, revealing The One\'s void domain. The imprisoned god rules this paradoxical realm where nothingness achieved form and absence became aggressive. Divine favor determines whether you harness the void or join the collection of things that used to exist.',
    enemies: ['void-spawn', 'time-elemental', 'time-scavenger', 'time-wraith', 'clock-sentinel', 'shadow-fiend', 'recurceror', 'tentacle-beast', 'void-lord'],
    items: ['void-essence', 'void-blade', 'void-crystal', 'null-sphere'],
    npcs: ['king-james', 'dr-voss'],
    connectedAreas: [
      { area: 'shadow-keep', direction: 'South', levelRange: '25-35' },
      { area: 'the-dying-saucer', direction: 'Portal', levelRange: '1-50' },
    ],
    quests: [
      { name: 'Face the Void', type: 'Main', reward: 'Void Heart' },
      { name: 'Existence Drain', type: 'Side', reward: 'Reality Anchor' },
    ],
    seeAlso: ['the-one', 'void-lord', 'mr-kevin', 'king-james'],
    // Dice roguelike run structure
    preferredDice: 4,
    dicePool: [4, 6, 8, 10, 12, 20],
    diceBias: 40,
    floors: 15,
    encounterTypes: ['combat', 'elite', 'boss', 'event', 'treasure'],
    bossFloors: [5, 10, 15],
    // Flume portal data
    flume: {
      name: 'Flume of Null',
      video: '/assets/flumes/cursed/flume-00001.mp4',
      requirements: ['Complete all 5 other doors', 'Level 50 or higher recommended'],
      cost: '500 Gold or 1 Void Token',
    },
  },

  // Earth - Door 2, John
  {
    slug: 'earth',
    name: 'Earth',
    category: 'domains',
    luckyNumber: 2,
    rarity: 'Epic',
    door: 2,
    dieRector: 'john',
    element: 'Earth',
    difficulty: 'Normal',
    levelRange: '10-20',
    image: '/assets/domains/earth.png',
    description: 'Earth manifests when Door 2 opens, revealing John\'s hybrid stone-machine domain. The Glitch transformed this planet where geology merged with technology - mountains sprout circuit boards, rivers flow with coolant, and bedrock processes data at tectonic speeds.',
    enemies: ['cow', 'crab', 'myconid', 'steam-sentry'],
    items: ['iron-boots', 'mecha-bow'],
    npcs: ['the-general'],
    connectedAreas: [
      { area: 'the-dying-saucer', direction: 'Portal', levelRange: '1-50' },
      { area: 'crystal-caverns', direction: 'Underground', levelRange: '15-25' },
    ],
    quests: [
      { name: 'Factory Floor', type: 'Main', reward: 'Power Core' },
      { name: 'Circuit Breaker', type: 'Side', reward: 'Tech Components' },
    ],
    seeAlso: ['john', 'never-die-guy', 'the-general', 'xtreme'],
    // Dice roguelike run structure
    preferredDice: 6,
    dicePool: [4, 6, 8, 10, 12, 20],
    diceBias: 35,
    floors: 10,
    encounterTypes: ['combat', 'elite', 'boss', 'shop', 'rest'],
    bossFloors: [5, 10],
    // Flume portal data
    flume: {
      name: 'Flume of Earth',
      video: '/assets/flumes/cursed/flume-00002.mp4',
      requirements: ['Complete "The Second Door" quest', 'Level 20 or higher recommended'],
      cost: '75 Gold or 1 Earth Token',
    },
  },

  // Shadow Keep - Door 3, Peter
  {
    slug: 'shadow-keep',
    name: 'Shadow Keep',
    category: 'domains',
    luckyNumber: 3,
    rarity: 'Epic',
    door: 3,
    dieRector: 'peter',
    element: 'Death',
    difficulty: 'Hard',
    levelRange: '25-35',
    image: '/assets/domains/shadow-keep.png',
    description: 'Shadow Keep manifests when Door 3 opens, revealing Peter\'s twilight domain. The Hidden Director rules this paradoxical realm where life and shadow dance as equals. Divine favor determines whether you master the duality or split into separate, hostile entities.',
    enemies: ['bat', 'skeleton-archer', 'skeleton-barb', 'skeleton-knight', 'ludwig', 'makora', 'makora-reborn'],
    items: ['shadow-essence', 'dark-gem', 'bone-fragment', 'shadowblade'],
    npcs: ['dr-voss', 'the-general'],
    connectedAreas: [
      { area: 'null-providence', direction: 'North', levelRange: '35-45' },
      { area: 'bone-yard', direction: 'East', levelRange: '20-25' },
      { area: 'the-dying-saucer', direction: 'Portal', levelRange: '1-50' },
    ],
    quests: [
      { name: 'Into the Darkness', type: 'Main', reward: 'Shadow Key' },
      { name: 'Lost Souls', type: 'Side', reward: 'Twilight Crystal' },
    ],
    seeAlso: ['peter', 'shadow-fiend', 'stitch-up-girl', 'body-count'],
    // Dice roguelike run structure
    preferredDice: 8,
    dicePool: [4, 6, 8, 10, 12, 20],
    diceBias: 35,
    floors: 12,
    encounterTypes: ['combat', 'elite', 'boss', 'event', 'rest'],
    bossFloors: [4, 8, 12],
    // Flume portal data
    flume: {
      name: 'Flume of Shadow',
      video: '/assets/flumes/cursed/flume-00003.mp4',
      requirements: ['Complete "The Third Door" quest', 'Level 25 or higher recommended'],
      cost: '100 Gold or 1 Shadow Token',
    },
  },

  // Infernus - Door 4, Robert
  {
    slug: 'infernus',
    name: 'Infernus',
    category: 'domains',
    luckyNumber: 4,
    rarity: 'Epic',
    door: 4,
    dieRector: 'robert',
    element: 'Fire',
    difficulty: 'Hard',
    levelRange: '20-30',
    image: '/assets/domains/infernus.png',
    description: 'Infernus manifests when Door 4 opens, revealing Robert\'s eternal flame domain. The god of Chance rules this pyroclastic nightmare where fire gained sentience and attitude. Divine favor determines whether you harness the flames or join the permanent barbecue.',
    enemies: ['fire-imp', 'camel', 'lava-golem', 'skeleton-demon', 'succubus', 'mephisto'],
    items: ['infernal-bow', 'blazecaster', 'fire-grenade', 'infernal-salts', 'infernal-crystal'],
    npcs: ['dr-maxwell', 'xtreme'],
    connectedAreas: [
      { area: 'the-dying-saucer', direction: 'Portal', levelRange: '1-50' },
      { area: 'crimson-domain', direction: 'South', levelRange: '10-20' },
    ],
    quests: [
      { name: 'Through the Fire', type: 'Main', reward: 'Fire Core' },
      { name: 'Ash Gardens', type: 'Side', reward: 'Pyroclastic Relic' },
    ],
    seeAlso: ['robert', 'clausen', 'dr-maxwell', 'fire-imp'],
    // Dice roguelike run structure
    preferredDice: 10,
    dicePool: [4, 6, 8, 10, 12, 20],
    diceBias: 35,
    floors: 12,
    encounterTypes: ['combat', 'elite', 'boss', 'shop', 'treasure'],
    bossFloors: [4, 8, 12],
    // Flume portal data
    flume: {
      name: 'Flume of Infernus',
      video: '/assets/flumes/cursed/flume-00004.mp4',
      requirements: ['Complete "The Fourth Door" quest', 'Level 35 or higher recommended'],
      cost: '150 Gold or 1 Fire Token',
    },
  },

  // Frost Reach - Door 5, Alice
  {
    slug: 'frost-reach',
    name: 'Frost Reach',
    category: 'domains',
    luckyNumber: 5,
    rarity: 'Epic',
    door: 5,
    dieRector: 'alice',
    element: 'Ice',
    difficulty: 'Hard',
    levelRange: '25-35',
    image: '/assets/domains/frost-reach.png',
    description: 'Frost Reach manifests when Door 5 opens, revealing Alice\'s frozen time domain. The Clock-Faced Maiden rules this crystalline nightmare where ice and time merge into one devastating force. Divine favor determines whether you harness temporal frost or become another frozen statue in her collection.',
    enemies: ['ice-wraith', 'frost-giant-i', 'frost-giant-ii', 'frost-giant-iii'],
    items: ['time-crystal', 'ice-bow', 'frost-blade'],
    npcs: ['mr-bones', 'willy'],
    connectedAreas: [
      { area: 'the-dying-saucer', direction: 'Portal', levelRange: '1-50' },
      { area: 'frozen-wastes', direction: 'North', levelRange: '30-40' },
    ],
    quests: [
      { name: 'Frozen in Time', type: 'Main', reward: 'Temporal Shard' },
      { name: 'Clock Tower', type: 'Side', reward: 'Ice Crystal' },
    ],
    seeAlso: ['alice', 'keith-man', 'mr-bones', 'frost-giant-iii'],
    // Dice roguelike run structure
    preferredDice: 12,
    dicePool: [4, 6, 8, 10, 12, 20],
    diceBias: 35,
    floors: 12,
    encounterTypes: ['combat', 'elite', 'boss', 'rest', 'event'],
    bossFloors: [4, 8, 12],
    // Flume portal data
    flume: {
      name: 'Flume of Frost',
      video: '/assets/flumes/cursed/flume-00005.mp4',
      requirements: ['Complete "The Fifth Door" quest', 'Level 40 or higher recommended'],
      cost: '175 Gold or 1 Ice Token',
    },
  },

  // Aberrant - Door 6, Jane
  {
    slug: 'aberrant',
    name: 'Aberrant',
    category: 'domains',
    luckyNumber: 6,
    rarity: 'Legendary',
    door: 6,
    dieRector: 'jane',
    element: 'Wind',
    difficulty: 'Extreme',
    levelRange: '35-45',
    image: '/assets/domains/aberrant.png',
    description: 'Aberrant manifests when Door 6 opens, revealing Jane\'s chaotic wind domain. The Howling Goddess rules this aerial nightmare where atmosphere itself wages war on stability. Divine favor determines whether you surf the jetstreams or dissolve into them.',
    enemies: ['chicken', 'carniflower', 'spore-cloud', 'twisted-sapling', 'vine-strangler', 'gear-construct', 'air-elemental', 'ancient-treant', 'wretched-beast', 'abominable'],
    items: ['windcutter', 'aberrant-bow', 'wind-shard'],
    npcs: ['boo-g'],
    connectedAreas: [
      { area: 'the-dying-saucer', direction: 'Portal', levelRange: '1-50' },
      { area: 'thunder-spire', direction: 'Up', levelRange: '30-40' },
    ],
    quests: [
      { name: 'Ride the Wind', type: 'Main', reward: 'Wind Core' },
      { name: 'Sky Anchor', type: 'Side', reward: 'Chaos Fragment' },
    ],
    seeAlso: ['jane', 'body-count', 'boo-g', 'boots'],
    // Dice roguelike run structure
    preferredDice: 20,
    dicePool: [4, 6, 8, 10, 12, 20],
    diceBias: 40,
    floors: 15,
    encounterTypes: ['combat', 'elite', 'boss', 'event', 'treasure'],
    bossFloors: [5, 10, 15],
    // Flume portal data
    flume: {
      name: 'Flume of Aberrant',
      video: '/assets/flumes/cursed/flume-00006.mp4',
      requirements: ['Complete "The Sixth Door" quest', 'Level 45 or higher recommended'],
      cost: '200 Gold or 1 Wind Token',
    },
  },

  // The Dying Saucer - Central Hub
  {
    slug: 'the-dying-saucer',
    name: 'The Dying Saucer',
    category: 'domains',
    luckyNumber: 0,
    rarity: 'Unique',
    element: 'Neutral',
    difficulty: 'Easy',
    levelRange: '1-50',
    image: '/assets/domains/the-dying-saucer.png',
    description: 'The Dying Saucer serves as the central hub where every run begins and every death returns you. This crashed UFO apartment complex houses six numbered doors, each leading to a different domain. The saucer itself is a massive d6 - choosing a door triggers the cosmic dice roll that determines your divine favor.',
    npcs: ['willy', 'mr-bones', 'boo-g', 'king-james', 'dr-maxwell', 'the-general', 'dr-voss', 'xtreme'],
    connectedAreas: [
      { area: 'null-providence', direction: 'Door 1', levelRange: '35-45' },
      { area: 'earth', direction: 'Door 2', levelRange: '10-20' },
      { area: 'shadow-keep', direction: 'Door 3', levelRange: '25-35' },
      { area: 'infernus', direction: 'Door 4', levelRange: '20-30' },
      { area: 'frost-reach', direction: 'Door 5', levelRange: '25-35' },
      { area: 'aberrant', direction: 'Door 6', levelRange: '35-45' },
      { area: 'the-board-room', direction: 'Door 7 (Hidden)', levelRange: '50' },
    ],
    seeAlso: ['never-die-guy', 'stitch-up-girl', 'the-general', 'willy', 'mr-bones'],
    // Hub - no run structure (starting point)
    dicePool: [4, 6, 8, 10, 12, 20],
    diceBias: 0,
    encounterTypes: ['shop', 'rest'],
    // Flume portal data (Return to Nexus)
    flume: {
      name: 'Return to Nexus',
      video: '/assets/flumes/cursed/flume-00010.mp4',
      requirements: ['Must be in a safe zone', 'No active combat'],
      cost: 'Free',
    },
  },

  // The Board Room - Door 7, All Die-rectors
  {
    slug: 'the-board-room',
    name: 'The Board Room',
    category: 'domains',
    luckyNumber: 7,
    rarity: 'Unique',
    door: 7,
    dieRector: 'all',
    element: 'Neutral',
    difficulty: 'Extreme',
    levelRange: '50',
    requirements: '100+ deaths to unlock Door 7',
    image: '/assets/domains/board-room-fisheye.png',
    description: 'The Board Room manifests after 100 deaths when Door 7 appears unmarked in the apartment nexus. This corporate meeting space serves as neutral ground where all six Die-rectors convene to discuss quarterly death reports, divine favor algorithms, and domain budget allocations. The One dials in via void-screen from imprisonment.',
    connectedAreas: [
      { area: 'the-dying-saucer', direction: 'Exit', levelRange: '1-50' },
      { area: 'null-providence', direction: 'The One\'s Portal', levelRange: '35-45' },
    ],
    quests: [
      { name: 'Board Meeting', type: 'Event', reward: 'Corporate Card Key' },
      { name: 'Exit Interview', type: 'Side', reward: 'Die-rector\'s Gavel' },
    ],
    seeAlso: ['the-one', 'john', 'peter', 'robert', 'alice', 'jane', 'king-james'],
    // Dice roguelike run structure - All Die-rectors gauntlet
    dicePool: [4, 6, 8, 10, 12, 20],
    diceBias: 0,
    floors: 6,
    encounterTypes: ['boss', 'event'],
    bossFloors: [1, 2, 3, 4, 5, 6],
  },
];
