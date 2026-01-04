import type { Traveler } from '../types';
import type { BaseStats } from '../../stats/types';

export const travelers: Traveler[] = [
  // Never Die Guy - The protagonist
  {
    slug: 'never-die-guy',
    name: 'Never Die Guy',
    category: 'travelers',
    luckyNumber: 2,
    rarity: 'Legendary',
    portrait: '/assets/characters/portraits/120px/traveler-portrait-neverdieguy-02.svg',
    sprites: [
      '/assets/market-svg/never-die-guy/idle-01.svg',
    ],
    description: 'Never Die Guy transforms each death into tactical advantage. Lucky Number 2 drives his core gameplay loop: first death scouts, second death confirms, pattern mastery achieved. This balanced protagonist excels at learning enemy patterns through strategic failure.',
    origin: 'Earth',
    playStyle: 'Tactical',
    availability: 'Starter',
    species: 'Human (Enhanced)',
    birthday: 'January 1, 1984',
    baseStats: {
      luck: 2,        // His lucky number
      essence: 40,    // Moderate power
      grit: 70,       // HIGH - d6 is his die, mixing mastery
      shadow: 35,     // Below average stealth
      fury: 50,       // Balanced attack
      resilience: 55, // Above average defense
      swiftness: 45,  // Slightly below average speed
    },
    abilities: [
      { name: 'Strategic Death Mastery', description: 'Each death provides tactical information about enemy patterns.', cooldown: 'Passive' },
      { name: 'Enhanced Durability', description: 'Increased resistance to damage.', cooldown: 'Passive' },
      { name: 'Tactical Combat Expertise', description: 'Improved combat efficiency after each death.', cooldown: 'Passive' },
      { name: 'Death Data Integration', description: 'Learn from deaths to improve future attempts.', cooldown: 'Passive' },
    ],
    startingLoadout: ['wooden-bat', 'wooden-shield', 'rations', 'potion', 'backpack'],
    seeAlso: ['stitch-up-girl', 'the-general', 'john', 'the-one', 'willy'],

    // Market presence
    marketPosition: { x: '50%', y: '35%' },
    marketAvailability: { always: true },
    marketRole: 'Tips, Quest Rumors, Training',
  },

  // Stitch Up Girl - The healer sister
  {
    slug: 'stitch-up-girl',
    name: 'Stitch Up Girl',
    category: 'travelers',
    luckyNumber: 3,
    rarity: 'Legendary',
    portrait: '/assets/characters/portraits/120px/traveler-portrait-stitchupgirl-01.svg',
    sprites: [
      '/assets/market-svg/stitch-up-girl/idle-01.svg',
      '/assets/market-svg/stitch-up-girl/idle-02.svg',
    ],
    description: 'Stitch Up Girl emerges from Shadow Keep as the cosmic balance between life and death. Her Lucky Number 3 represents the surgical trinity: cut, heal, survive. Sister to Never Die Guy, she maintains the delicate equilibrium required when death becomes a temporary inconvenience.',
    origin: 'Shadow Keep',
    playStyle: 'Healer',
    availability: 'Starter',
    species: 'Human (Enhanced)',
    birthday: 'October 28, 1986',
    baseStats: {
      luck: 3,        // Her lucky number
      essence: 50,    // Good power (healing requires it)
      grit: 55,       // Above average endurance
      shadow: 70,     // HIGH - d8 is her die, surgical precision
      fury: 35,       // Lower attack (healer)
      resilience: 60, // Good defense (needs to survive to heal)
      swiftness: 45,  // Average speed
    },
    abilities: [
      { name: 'Surgical Combat Mastery', description: 'Precise attacks that can heal or harm.', cooldown: 'Passive' },
      { name: 'Biological Manipulation', description: 'Control over biological processes.', cooldown: '15s' },
      { name: 'Weaponized Prosthetics', description: 'Prosthetic enhancements used in combat.', cooldown: 'Passive' },
      { name: 'Medical Enhancement Integration', description: 'Integrate medical tech for combat bonuses.', cooldown: '30s' },
    ],
    startingLoadout: ['stitchup-scissors', 'medkit', 'better-blood-vial', 'shadow-bomb', 'utiity-belt'],
    seeAlso: ['never-die-guy', 'the-general', 'peter', 'dr-voss'],

    // Market presence
    marketPosition: { x: '20%', y: '30%' },
    marketAvailability: { times: ['dawn', 'day'] },
    marketRole: 'Healing, Medical Advice, Surgery Tips',
  },

  // The General - The undead strategist
  {
    slug: 'the-general',
    name: 'The General',
    category: 'travelers',
    luckyNumber: 2,
    rarity: 'Legendary',
    portrait: '/assets/characters/portraits/120px/traveler-portrait-general-01.svg',
    sprites: [
      '/assets/characters/travelers/general/traveler-sprite-general-idle-01.svg',
      '/assets/characters/travelers/general/traveler-sprite-general-idle-02.svg',
      '/assets/characters/travelers/general/traveler-sprite-general-idle-03.svg',
    ],
    description: 'The General emerges from Earth as undead proof that death improves tactical planning. His Lucky Number 2 represents military duality—life and death, victory and defeat, all unified under proper command structure. This hollow-eyed strategist transforms mortality into the ultimate force multiplier.',
    origin: 'Earth',
    playStyle: 'Tactical',
    availability: 'Starter',
    species: 'Human (Undead)',
    baseStats: {
      luck: 2,        // His lucky number
      essence: 45,    // Moderate power
      grit: 60,       // Good endurance (undead)
      shadow: 30,     // Low stealth (commanding presence)
      fury: 55,       // Above average attack
      resilience: 70, // HIGH - undead durability
      swiftness: 40,  // Below average speed
    },
    abilities: [
      { name: 'Master Field Commander', description: 'Boost nearby allies with tactical commands.', cooldown: '20s' },
      { name: 'Skilled Hand-to-Hand Combatant', description: 'Enhanced melee combat ability.', cooldown: 'Passive' },
      { name: 'Superhuman Physical Capabilities', description: 'Undead strength and endurance.', cooldown: 'Passive' },
      { name: 'Longevity', description: 'Cannot die of natural causes.', cooldown: 'Passive' },
    ],
    startingLoadout: ['war-banner', 'war-horn', 'combat-knife', 'heavy-shield', 'rations'],
    seeAlso: ['never-die-guy', 'stitch-up-girl', 'the-one'],
  },

  // Body Count - The silent assassin
  {
    slug: 'body-count',
    name: 'Body Count',
    category: 'travelers',
    luckyNumber: 6,
    rarity: 'Rare',
    portrait: '/assets/characters/portraits/120px/traveler-portrait-bodycount-01.svg',
    sprites: [
      '/assets/characters/travelers/bodycount/traveler-sprite-bodycount-idle-01.svg',
      '/assets/characters/travelers/bodycount/traveler-sprite-bodycount-idle-02.svg',
    ],
    description: 'Body Count emerges from Aberrant as pure violence given form. Their Lucky Number 6 represents the perfect kill count—not too few to be amateur, not too many to be sloppy. This silent assassin transforms air itself into a weapon, leaving no trace except absence.',
    origin: 'Aberrant',
    playStyle: 'Assassin',
    availability: 'Starter',
    species: 'Unknown',
    birthday: 'June 6, 1998',
    baseStats: {
      luck: 6,        // Their lucky number (d20 affinity)
      essence: 35,    // Lower base power
      grit: 30,       // Low endurance (glass cannon)
      shadow: 75,     // HIGH - master of stealth
      fury: 60,       // Good attack (assassin)
      resilience: 25, // LOW - fragile
      swiftness: 80,  // VERY HIGH - d20 is their die
    },
    abilities: [
      { name: 'Skilled Hand-to-Hand Combatant', description: 'Expert in close combat.', cooldown: 'Passive' },
      { name: 'Silent Weaponry', description: 'Untraceable weapons that make no sound.', cooldown: 'Passive' },
      { name: 'Expert Assassin', description: 'Increased critical hit chance from stealth.', cooldown: 'Passive' },
    ],
    startingLoadout: ['kunai', 'simple-knife', 'lockpick', 'eyepatch', 'sneakers'],
    seeAlso: ['the-general', 'clausen', 'jane', 'keith-man'],

    // Market presence
    marketPosition: { x: '92%', y: '65%' },
    marketAvailability: { times: ['dusk', 'night'], chance: 60 },
    marketRole: 'Stealth Tips, Target Info, Assassination Contracts',
  },

  // Boots - The cosmic cat
  {
    slug: 'boots',
    name: 'Boots',
    category: 'travelers',
    luckyNumber: 7, // ALL (1-6) - special value for all dice affinity
    rarity: 'Legendary',
    portrait: '/assets/characters/portraits/120px/traveler-portrait-boots-01.svg',
    sprites: [
      '/assets/characters/travelers/sprite-boots-1.png',
      '/assets/characters/travelers/sprite-boots-2.png',
      '/assets/characters/travelers/sprite-boots-3.png',
    ],
    description: 'Boots transcends game balance as an Old One who chose cat form over cosmic terror. Their Lucky Number encompasses all possibilities (1-6), making every item compatible and every roll favorable. Unlocked only by petting the apartment cat sufficient times.',
    origin: 'Null Providence',
    playStyle: 'OP',
    availability: 'Unlockable',
    species: 'Old One (Cat Form)',
    baseStats: {
      luck: 7,        // ALL DICE - cosmic favor
      essence: 80,    // HIGH - Old One power
      grit: 80,       // HIGH - cosmic endurance
      shadow: 80,     // HIGH - cat stealth
      fury: 80,       // HIGH - ancient power
      resilience: 80, // HIGH - cosmic durability
      swiftness: 80,  // HIGH - cat reflexes
    },
    abilities: [
      { name: "K-Crew's Biggest Fan", description: 'Moral support that actually helps.', cooldown: 'Passive' },
      { name: 'Flight', description: 'Can fly because cat.', cooldown: 'Passive' },
      { name: 'Nine Lives', description: 'Nine extra lives before true death.', cooldown: 'Passive' },
      { name: 'Indomitable Will', description: 'Cannot be mind controlled.', cooldown: 'Passive' },
      { name: 'Superhuman Everything', description: 'All stats enhanced.', cooldown: 'Passive' },
    ],
    startingLoadout: ['void-crystal', 'null-sphere', 'loaded-die', 'kings-crown', 'dead-old-one'],
    seeAlso: ['rhea', 'mr-kevin', 'keith-man', 'the-one'],
  },

  // Detective Clausen - The red-eyed detective
  {
    slug: 'clausen',
    name: 'Detective Clausen',
    category: 'travelers',
    luckyNumber: 4,
    rarity: 'Epic',
    portrait: '/assets/characters/portraits/120px/traveler-portrait-clausen-01.svg',
    sprites: [
      '/assets/characters/travelers/clausen/traveler-sprite-clausen-idle-01.svg',
    ],
    description: 'Detective Clausen investigates the impossible from Infernus. His Lucky Number 4 represents the four corners of a case: motive, means, opportunity, and the supernatural element that breaks all rules. This red-eyed private eye navigates disadvantage like a second home.',
    origin: 'Infernus',
    playStyle: 'Balanced',
    availability: 'Unlockable',
    species: 'Human (Infernal)',
    birthday: 'April 10, 1967',
    baseStats: {
      luck: 4,        // His lucky number (d10 affinity)
      essence: 50,    // Balanced power
      grit: 50,       // Balanced endurance
      shadow: 45,     // Slightly below average stealth
      fury: 65,       // ABOVE AVERAGE - d10/Fire is his die
      resilience: 50, // Balanced defense
      swiftness: 50,  // Balanced speed
    },
    abilities: [
      { name: 'Dual-Contract Revolver', description: 'Weapon with infernal binding.', cooldown: 'Passive' },
      { name: 'Infernal Alcoholism', description: 'Drinks grant temporary power boosts.', cooldown: '10s' },
      { name: 'Disadvantage Navigation', description: 'Works better under bad odds.', cooldown: 'Passive' },
    ],
    startingLoadout: ['fire-bomb', 'ruby', 'aviators', 'coffee-mostly', 'red-phone'],
    seeAlso: ['body-count', 'robert', 'infernus'],

    // Market presence
    marketPosition: { x: '38%', y: '80%' },
    marketAvailability: { times: ['dusk', 'night'] },
    marketRole: 'Case Files, Investigation Tips, Infernal Contacts',
  },

  // Keith Man - The time-dilated speedster
  {
    slug: 'keith-man',
    name: 'Keith Man',
    category: 'travelers',
    luckyNumber: 5,
    rarity: 'Epic',
    portrait: '/assets/characters/portraits/120px/traveler-portrait-keithman-01.svg',
    sprites: [
      '/assets/characters/travelers/keithman/traveler-sprite-keithman-idle-01.svg',
      '/assets/characters/travelers/keithman/traveler-sprite-keithman-idle-02.svg',
    ],
    description: 'Keith Man moves through Frost Reach faster than time allows. His Lucky Number 5 represents the fifth dimension—time itself—which he has learned to stretch and compress. This dapper speedster treats temporal mechanics as suggestions rather than laws.',
    origin: 'Frost Reach',
    playStyle: 'Speedster',
    availability: 'Unlockable',
    species: 'Human (Temporal)',
    birthday: 'March 18, 1992',
    baseStats: {
      luck: 5,        // His lucky number (d12 affinity)
      essence: 40,    // Lower base power
      grit: 40,       // Lower endurance
      shadow: 55,     // Above average stealth (blur)
      fury: 45,       // Below average attack
      resilience: 60, // ABOVE AVERAGE - d12/Ice is his die
      swiftness: 85,  // VERY HIGH - speedster
    },
    abilities: [
      { name: 'Superhuman Speed', description: 'Move faster than normal humans.', cooldown: 'Passive' },
      { name: 'Enhanced Endurance', description: 'Increased stamina.', cooldown: 'Passive' },
      { name: 'Time Dilation', description: 'Slow down time around self.', cooldown: '30s' },
      { name: 'Agility Across Timelines', description: 'Dodge attacks from alternate timelines.', cooldown: '20s' },
    ],
    startingLoadout: ['chrono-bomb', 'stopwatch', 'sneakers', 'ice-bow', 'frost-crystal'],
    seeAlso: ['mr-kevin', 'alice', 'body-count', 'stitch-up-girl'],

    // Market presence
    marketPosition: { x: '65%', y: '25%' },
    marketAvailability: { times: ['day', 'dusk'] },
    marketRole: 'Speed Training, Time Tricks, Frost Reach Intel',
  },

  // Mr. Kevin - The reality debugger
  {
    slug: 'mr-kevin',
    name: 'Mr. Kevin',
    category: 'travelers',
    luckyNumber: 1,
    rarity: 'Legendary',
    portrait: '/assets/characters/portraits/120px/traveler-portrait-mrkevin-01.svg',
    sprites: [
      '/assets/market-svg/mr-kevin/idle-01.svg',
      '/assets/market-svg/mr-kevin/idle-02.svg',
    ],
    description: 'Mr. Kevin sees through reality from Null Providence. His Lucky Number 1 represents singular focus—finding the one bug that breaks everything. This transparent-eyed prophet partners with The One to quality-test existence itself.',
    origin: 'Null Providence',
    playStyle: 'Balanced',
    availability: 'Unlockable',
    species: 'Human (Null-touched)',
    birthday: 'August 29, 1992',
    baseStats: {
      luck: 1,        // His lucky number (d4 affinity)
      essence: 75,    // VERY HIGH - d4/Void is his die, reality manipulation
      grit: 50,       // Balanced endurance
      shadow: 50,     // Balanced stealth
      fury: 45,       // Below average attack
      resilience: 45, // Below average defense
      swiftness: 55,  // Above average speed
    },
    abilities: [
      { name: 'Flight', description: 'Can fly through null space.', cooldown: 'Passive' },
      { name: 'Energy Blasts', description: 'Fire concentrated null energy.', cooldown: '5s' },
      { name: 'Superhuman Senses', description: 'Perceive bugs in reality.', cooldown: 'Passive' },
      { name: 'Game Awareness', description: 'Knows this is a game.', cooldown: 'Passive' },
    ],
    startingLoadout: ['void-key', 'void-shard', 'compass', 'dr-voss-diary', 'void-staff'],
    seeAlso: ['keith-man', 'the-one', 'king-james', 'boots'],

    // Market presence
    marketPosition: { x: '48%', y: '50%' },
    marketAvailability: { times: ['night', 'dawn'] },
    marketRole: 'Reality Debugging, Void Secrets, Game Tips',
  },
];
