import type { Pantheon } from '../types';

export const pantheon: Pantheon[] = [
  // The One - Door 1, Null Providence
  {
    slug: 'the-one',
    name: 'The One',
    category: 'pantheon',
    luckyDie: 'd4',
    luckyNumber: 1,
    rarity: 'Legendary',
    door: 1,
    domain: 'null-providence',
    element: 'Void',
    role: 'Die-rector of Null Providence',
    portrait: '/assets/characters/pantheon/the-one.png',
    sprites: [
      '/assets/characters/pantheon/sprite-the-one-1.png',
      '/assets/characters/pantheon/sprite-the-one-2.png',
    ],
    description: 'The One oversees Null Providence where existence itself becomes negotiable. As Die-rector of Door 1, represents the fundamental baseline—the one thing that must exist before anything else. Appears as reality questioning its own existence.',
    baseStats: {
      luck: 1,          // d4 affinity
      essence: 100,     // MAX - Void mastery, reality control
      grit: 50,         // Balanced
      shadow: 70,       // Above average (void/darkness)
      fury: 40,         // Below average (patience, not rage)
      resilience: 60,   // Moderate (reality itself)
      swiftness: 50,    // Balanced
    },
    favorEffects: [
      { roll: 1, effect: 'Null Void: Reality briefly forgets you exist (immunity).' },
      { roll: 2, effect: 'Baseline Reality: Stats reset to base values (buff or debuff).' },
      { roll: 3, effect: 'Singular Focus: One ability becomes twice as powerful.' },
      { roll: 4, effect: 'The Only One: Enemies ignore allies, target only you.' },
      { roll: 5, effect: 'First Principle: Next die roll is automatically 1.' },
      { roll: 6, effect: 'Unity: All party members share your Lucky Number bonus.' },
    ],
    corruptionEffects: [
      'Reality becomes optional rather than mandatory.',
      'Numbers lose their meaning (damage displays corrupted).',
      'Existence flickers between real and theoretical.',
    ],
    dialogue: [
      'Before two, there was one. Before one, there was nothing. I remember nothing.',
      'You exist because I allow the concept of existence.',
      'Roll. Remind yourself what singular focus means.',
    ],
    seeAlso: ['null-providence', 'mr-kevin', 'zero-chance', 'boots'],
  },

  // John - Door 2, Earth
  {
    slug: 'john',
    name: 'John',
    category: 'pantheon',
    luckyDie: 'd6',
    luckyNumber: 2,
    rarity: 'Legendary',
    door: 2,
    domain: 'earth',
    element: 'Earth / Stone',
    role: 'Die-rector of Earth',
    portrait: '/assets/characters/pantheon/john.png',
    sprites: [
      '/assets/characters/pantheon/sprite-john-1.png',
      '/assets/characters/pantheon/sprite-john-2.png',
    ],
    description: 'John controls Door 2 and Earth, a realm where organic meets mechanical. His Lucky Number 2 represents duality—flesh and metal, living and constructed. The master builder who never asks permission to upgrade reality.',
    baseStats: {
      luck: 2,          // d6 affinity
      essence: 55,      // Moderate
      grit: 100,        // MAX - The mixing Die-rector, endurance master
      shadow: 30,       // Low (builder, not hider)
      fury: 60,         // Above average (mechanical power)
      resilience: 80,   // High (metal and stone)
      swiftness: 40,    // Below average (methodical)
    },
    favorEffects: [
      { roll: 1, effect: 'Rust: Mechanical items lose 20% effectiveness.' },
      { roll: 2, effect: 'John\'s Blessing: +30% damage with mechanical weapons.' },
      { roll: 3, effect: 'Overclock: Attack speed doubled for 15 seconds.' },
      { roll: 4, effect: 'Reinforced: +50% armor for current domain.' },
      { roll: 5, effect: 'System Upgrade: Random stat permanently increased.' },
      { roll: 6, effect: 'Earth Mastery: All tech items work at 200% efficiency.' },
    ],
    corruptionEffects: [
      'Organic matter begins showing mechanical corruption.',
      'Machines gain unsettling independence.',
      'The boundary between flesh and metal dissolves.',
    ],
    dialogue: [
      'Everything can be improved. Everything WILL be improved.',
      'Your flesh is temporary. My modifications are eternal.',
      'Roll the die. Let me show you what efficiency means.',
    ],
    seeAlso: ['earth', 'never-die-guy', 'the-one', 'mr-kevin'],
  },

  // Peter - Door 3, Shadow Keep
  {
    slug: 'peter',
    name: 'Peter',
    category: 'pantheon',
    luckyDie: 'd8',
    luckyNumber: 3,
    rarity: 'Legendary',
    door: 3,
    domain: 'shadow-keep',
    element: 'Life / Death',
    role: 'Die-rector of Shadow Keep',
    portrait: '/assets/characters/pantheon/peter.png',
    sprites: [
      '/assets/characters/pantheon/sprite-peter-1.png',
      '/assets/characters/pantheon/sprite-peter-2.png',
      '/assets/characters/pantheon/sprite-peter-3.png',
    ],
    description: 'Peter controls Door 3 and the Shadow Keep, where life and death exist in perpetual negotiation. His Lucky Number 3 represents the trinity of existence—birth, life, death—all domains he influences. Master of the threshold between being and oblivion.',
    baseStats: {
      luck: 3,          // d8 affinity
      essence: 60,      // Above average (life/death control)
      grit: 45,         // Below average
      shadow: 100,      // MAX - Master of shadows and death
      fury: 35,         // Low (patient, calculated)
      resilience: 55,   // Moderate
      swiftness: 70,    // High (evasive, ghostly)
    },
    favorEffects: [
      { roll: 1, effect: 'Curse of Decay: Lose 10% max HP for the duration of the domain.' },
      { roll: 2, effect: 'Shadow Sight: See hidden enemies and traps.' },
      { roll: 3, effect: 'Peter\'s Blessing: +50% damage to undead enemies.' },
      { roll: 4, effect: 'Life Leech: Heal 5% of damage dealt.' },
      { roll: 5, effect: 'Shadow Cloak: 30% chance to avoid attacks.' },
      { roll: 6, effect: 'Domain Master: All drop rates doubled in Shadow Keep.' },
    ],
    corruptionEffects: [
      'Shadows grow aggressive and attack unprovoked.',
      'Light sources dim to near uselessness.',
      'Undead enemies respawn faster.',
    ],
    dialogue: [
      'Death is but a door. I hold the key.',
      'The shadows have whispered of your coming.',
      'Roll the die, traveler. Let fate decide your blessing... or curse.',
    ],
    seeAlso: ['shadow-keep', 'stitch-up-girl', 'body-count', 'shadow-fiend'],
  },

  // Robert - Door 4, Infernus
  {
    slug: 'robert',
    name: 'Robert',
    category: 'pantheon',
    luckyDie: 'd10',
    luckyNumber: 4,
    rarity: 'Legendary',
    door: 4,
    domain: 'infernus',
    element: 'Fire',
    role: 'Die-rector of Infernus',
    portrait: '/assets/characters/pantheon/robert.png',
    sprites: [
      '/assets/characters/pantheon/sprite-robert-1.png',
      '/assets/characters/pantheon/sprite-robert-2.png',
      '/assets/characters/pantheon/sprite-robert-3.png',
    ],
    description: 'Robert controls Door 4 and Infernus, the burning realm where passion and destruction merge. His Lucky Number 4 represents the four cardinal directions of flame—consuming all paths equally. The executive who handles hostile takeovers by making everything hostile.',
    baseStats: {
      luck: 4,          // d10 affinity
      essence: 65,      // Above average (fire power)
      grit: 50,         // Balanced
      shadow: 25,       // Very low (fire illuminates)
      fury: 100,        // MAX - Fire, rage, raw damage
      resilience: 45,   // Below average (offense over defense)
      swiftness: 75,    // High (explosive speed)
    },
    favorEffects: [
      { roll: 1, effect: 'Burnout: Fire damage hurts you 20% more.' },
      { roll: 2, effect: 'Smolder: Attacks inflict burning status.' },
      { roll: 3, effect: 'Flashpoint: Critical hits create explosions.' },
      { roll: 4, effect: 'Robert\'s Blessing: +40% fire damage dealt.' },
      { roll: 5, effect: 'Inferno Aura: Nearby enemies take passive fire damage.' },
      { roll: 6, effect: 'Infernus Mastery: Immune to fire, attacks become fire-based.' },
    ],
    corruptionEffects: [
      'Ambient temperature rises to uncomfortable levels.',
      'Flammable objects ignite spontaneously.',
      'Fire spreads faster and burns longer.',
    ],
    dialogue: [
      'Everything burns eventually. I just accelerate the schedule.',
      'Your resistance is fuel for my domain.',
      'Roll. Let us see if you burn bright or burn out.',
    ],
    seeAlso: ['infernus', 'clausen', 'dr-maxwell'],
  },

  // Alice - Door 5, Frost Reach
  {
    slug: 'alice',
    name: 'Alice',
    category: 'pantheon',
    luckyDie: 'd12',
    luckyNumber: 5,
    rarity: 'Legendary',
    door: 5,
    domain: 'frost-reach',
    element: 'Time / Ice',
    role: 'Die-rector of Frost Reach',
    portrait: '/assets/characters/pantheon/alice.png',
    sprites: [
      '/assets/characters/pantheon/sprite-alice-1.png',
      '/assets/characters/pantheon/sprite-alice-2.png',
      '/assets/characters/pantheon/sprite-alice-3.png',
    ],
    description: 'Alice controls Door 5 and Frost Reach, where time itself freezes into crystalline permanence. Her Lucky Number 5 represents the fifth dimension—time—which she treats as a suggestion rather than a law. The scheduler who triple-books reality.',
    baseStats: {
      luck: 5,          // d12 affinity
      essence: 55,      // Moderate
      grit: 60,         // Above average (frozen endurance)
      shadow: 50,       // Balanced
      fury: 30,         // Low (cold, not rage)
      resilience: 100,  // MAX - Ice, defense, stability
      swiftness: 65,    // Above average (time control)
    },
    favorEffects: [
      { roll: 1, effect: 'Time Slip: Actions occasionally happen twice.' },
      { roll: 2, effect: 'Frozen Moment: Brief immunity after taking damage.' },
      { roll: 3, effect: 'Temporal Echo: Previous attack repeats automatically.' },
      { roll: 4, effect: 'Frost Touch: Attacks slow enemies.' },
      { roll: 5, effect: 'Alice\'s Blessing: +35% movement and attack speed.' },
      { roll: 6, effect: 'Frost Reach Mastery: Time stops for enemies, continues for you.' },
    ],
    corruptionEffects: [
      'Time flows inconsistently—speed up, slow down, repeat.',
      'Moments echo unpredictably, actions happening twice.',
      'Temperature drops to reality-threatening levels.',
    ],
    dialogue: [
      'Time is a river. I am the dam.',
      'Yesterday, tomorrow, now—all happen at my convenience.',
      'Roll. Watch how quickly eternity passes.',
    ],
    seeAlso: ['frost-reach', 'keith-man', 'the-one'],
  },

  // Jane - Door 6, Aberrant
  {
    slug: 'jane',
    name: 'Jane',
    category: 'pantheon',
    luckyDie: 'd20',
    luckyNumber: 6,
    rarity: 'Legendary',
    door: 6,
    domain: 'aberrant',
    element: 'Air / Wind',
    role: 'Die-rector of Aberrant',
    portrait: '/assets/characters/pantheon/jane.png',
    sprites: [
      '/assets/characters/pantheon/sprite-jane-1.png',
      '/assets/characters/pantheon/sprite-jane-2.png',
      '/assets/characters/pantheon/sprite-jane-3.png',
    ],
    description: 'Jane controls Door 6 and Aberrant, where normalcy becomes the true anomaly. Her Lucky Number 6 represents completion and perfection—the final door, the full circle. The operations manager who optimizes reality into beautiful chaos.',
    baseStats: {
      luck: 6,          // d20 affinity
      essence: 50,      // Balanced
      grit: 35,         // Low (chaotic, not sturdy)
      shadow: 65,       // Above average (wind vanishes)
      fury: 55,         // Moderate
      resilience: 40,   // Below average (chaos over stability)
      swiftness: 100,   // MAX - Wind, speed, chaos
    },
    favorEffects: [
      { roll: 1, effect: 'Abnormality: A random stat swaps with another.' },
      { roll: 2, effect: 'Wind Walk: Phase through enemies briefly.' },
      { roll: 3, effect: 'Deviation: Attacks have random bonus effects.' },
      { roll: 4, effect: 'Anomaly Aura: Nearby enemies act erratically.' },
      { roll: 5, effect: 'Perfect Storm: All elements combine in your attacks.' },
      { roll: 6, effect: 'Jane\'s Blessing: +50% to all stats, reality becomes suggestions.' },
    ],
    corruptionEffects: [
      'Physics becomes unreliable—gravity shifts, distances lie.',
      'Normal things become aberrant, aberrations become normal.',
      'Air itself becomes hostile and unpredictable.',
    ],
    dialogue: [
      'Normal is just aberrant that hasn\'t realized it yet.',
      'Breathe deep. Taste the chaos in the air.',
      'Roll. Let abnormality find its perfect form.',
    ],
    seeAlso: ['aberrant', 'body-count', 'boots'],
  },

  // Rhea - Ancient Horror, No Door
  {
    slug: 'rhea',
    name: 'Rhea',
    category: 'pantheon',
    luckyDie: 'none',
    luckyNumber: 0,
    rarity: 'Unique',
    // No domain - Rhea is an observer, not a domain ruler
    element: 'Void / Cosmic',
    role: 'Ancient Horror (Board Observer)',
    portrait: '/assets/characters/pantheon/rhea.png',
    sprites: [
      '/assets/characters/pantheon/sprite-rhea-1.png',
      '/assets/characters/pantheon/sprite-rhea-2.png',
      '/assets/characters/pantheon/sprite-rhea-3.png',
      '/assets/characters/pantheon/sprite-rhea-4.png',
    ],
    description: 'Rhea predates the Die-rectors, an Old One who observes board meetings with unsettling patience. No lucky number—she exists outside the system, evaluating whether reality deserves to continue. The cosmic horror who attends meetings to remind everyone what lurks beyond.',
    baseStats: {
      luck: 0,          // Outside the system
      essence: 95,      // Ancient void power
      grit: 70,         // Eternal endurance
      shadow: 90,       // Cosmic darkness
      fury: 40,         // Patient observer
      resilience: 85,   // Beyond harm
      swiftness: 60,    // Deliberate
    },
    favorEffects: [
      { roll: 1, effect: 'Cosmic Indifference: You become invisible to all entities.' },
      { roll: 2, effect: 'Ancient Whisper: Gain forbidden knowledge (quest hints).' },
      { roll: 3, effect: 'Void Sight: See through walls and illusions.' },
      { roll: 4, effect: 'Eldritch Endurance: Cannot die for 30 seconds.' },
      { roll: 5, effect: 'Reality Tear: Next attack ignores all defenses.' },
      { roll: 6, effect: 'Rhea\'s Gaze: All enemies flee in cosmic terror.' },
    ],
    corruptionEffects: [
      'Geometry becomes non-Euclidean—space folds wrong.',
      'Sanity effects trigger randomly.',
      'The certainty that something ancient watches everything.',
    ],
    dialogue: [
      'I was here before doors. I will remain after doors.',
      'Your Die-rectors play games. I observe whether the game deserves to continue.',
      'Roll your die. It amuses me how much faith you place in numbered cubes.',
    ],
    seeAlso: ['boots', 'the-one', 'alien-old-one', 'zero-chance'],
  },

  // King James - Undying King, No Door
  {
    slug: 'king-james',
    name: 'King James',
    category: 'pantheon',
    luckyDie: 'none',
    luckyNumber: 0,
    rarity: 'Unique',
    // No domain - King James is board chair, not a domain ruler
    element: 'Death / Bureaucracy',
    role: 'Undying King (Board Chair)',
    portrait: '/assets/characters/pantheon/king-james.png',
    sprites: [
      '/assets/characters/pantheon/sprite-king-james-1.png',
      '/assets/characters/pantheon/sprite-king-james-2.png',
      '/assets/characters/pantheon/sprite-king-james-3.png',
      '/assets/characters/pantheon/sprite-king-james-4.png',
    ],
    description: 'King James chairs the Die-rector board despite—or because of—being dead. No lucky number because luck answers to him, not the reverse. The undead executive who discovered that death is just a career transition, and paperwork is eternal.',
    baseStats: {
      luck: 0,          // Luck answers to him
      essence: 70,      // Death power
      grit: 85,         // Undead endurance
      shadow: 75,       // Death affinity
      fury: 50,         // Measured authority
      resilience: 90,   // Cannot truly die
      swiftness: 35,    // Bureaucratic pace
    },
    favorEffects: [
      { roll: 1, effect: 'Royal Decree: All enemies must attack you first.' },
      { roll: 2, effect: 'Undead Authority: Undead enemies serve you temporarily.' },
      { roll: 3, effect: 'Bureaucratic Shield: Damage reduced by paperwork (25%).' },
      { roll: 4, effect: 'King\'s Court: Summon spectral guards.' },
      { roll: 5, effect: 'Death Tax: Enemies drop extra loot.' },
      { roll: 6, effect: 'James\' Blessing: Cannot die; damage delays rather than destroys.' },
    ],
    corruptionEffects: [
      'The dead begin respecting proper hierarchies.',
      'Contracts and obligations become supernaturally binding.',
      'Time moves like bureaucracy—slowly, with forms.',
    ],
    dialogue: [
      'Death was merely a promotion.',
      'The Die-rectors answer to the board. The board answers to me.',
      'Roll. Even kings must acknowledge fate\'s dice.',
    ],
    seeAlso: ['the-general', 'willy', 'mr-bones', 'peter'],
  },

  // Zero Chance - Probability Void, No Door
  {
    slug: 'zero-chance',
    name: 'Zero Chance',
    category: 'pantheon',
    luckyDie: 'none',
    luckyNumber: 0,
    rarity: 'Unique',
    // No domain - Zero Chance manifests when probability breaks
    element: 'Probability / Chaos',
    role: 'Probability Void (Event Deity)',
    portrait: '/assets/characters/pantheon/zero-chance.png',
    sprites: [
      '/assets/characters/pantheon/sprite-zero-chance-1.png',
      '/assets/characters/pantheon/sprite-zero-chance-2.png',
      '/assets/characters/pantheon/sprite-zero-chance-3.png',
      '/assets/characters/pantheon/sprite-zero-chance-4.png',
    ],
    description: 'Zero Chance appears when probability breaks—when the impossible must happen because nothing else is left. No lucky number because zero is the absence of luck. The event deity who ensures that when all options are exhausted, something happens anyway.',
    baseStats: {
      luck: 0,          // Zero is the absence of luck
      essence: 80,      // Probability manipulation
      grit: 50,         // Balanced
      shadow: 60,       // Uncertainty
      fury: 45,         // Neutral force
      resilience: 55,   // Moderate
      swiftness: 90,    // Probability is instant
    },
    favorEffects: [
      { roll: 1, effect: 'Impossible Save: Survive what should kill you.' },
      { roll: 2, effect: 'Probability Lock: Next roll is guaranteed 6.' },
      { roll: 3, effect: 'Chaos Cascade: All nearby dice reroll randomly.' },
      { roll: 4, effect: 'Zero Point: Reset all cooldowns.' },
      { roll: 5, effect: 'Chance Denial: Enemy abilities fail randomly.' },
      { roll: 6, effect: 'Zero Chance Blessing: Reality bends to accommodate your success.' },
    ],
    corruptionEffects: [
      'Impossible things happen constantly.',
      'Probability itself becomes corrupted—certain things fail, impossible things succeed.',
      'Die rolls begin showing numbers that shouldn\'t exist.',
    ],
    dialogue: [
      'When all chances are exhausted, I am what remains.',
      'Zero is not nothing. Zero is the space where probability fears to tread.',
      'Roll. Even zero can produce results.',
    ],
    seeAlso: ['the-one', 'rhea', 'alien-baby', 'alien-old-one', 'void-lord'],
  },

  // Alien Baby - Larval Horror, No Door
  {
    slug: 'alien-baby',
    name: 'Alien Baby',
    category: 'pantheon',
    luckyDie: 'none',
    luckyNumber: 0,
    rarity: 'Unique',
    // No domain - Alien Baby appears during reality's vulnerable moments
    element: 'Chaos / Growth',
    role: 'Larval Horror (Intern of Apocalypse)',
    portrait: '/assets/characters/pantheon/alien-baby.png',
    sprites: [
      '/assets/characters/pantheon/sprite-alien-baby-2.png',
      '/assets/characters/pantheon/sprite-alien-baby-1.png',
    ],
    description: 'Alien Baby manifests during reality\'s vulnerable moments, when existence forgets to baby-proof itself. No lucky number—still learning to count past infinity, keeps getting distracted by destroying conceptual mathematics. The apocalypse intern who makes board meetings into playdate chaos.',
    baseStats: {
      luck: 0,          // Still learning numbers
      essence: 75,      // Raw cosmic potential
      grit: 40,         // Easily distracted
      shadow: 55,       // Dimensional drift
      fury: 85,         // Toddler rampage
      resilience: 70,   // Cosmic durability
      swiftness: 80,    // Unpredictable movement
    },
    favorEffects: [
      { roll: 1, effect: 'Reality Bites: Random objects deleted when touched.' },
      { roll: 2, effect: 'Dimensional Drift: Phase between dimensions randomly.' },
      { roll: 3, effect: 'Babble Blast: Your speech damages enemy sanity.' },
      { roll: 4, effect: 'Toddler Rampage: Movement creates reality tears.' },
      { roll: 5, effect: 'Cosmic Calm: Everything frozen except you.' },
      { roll: 6, effect: 'Baby\'s Joy: Reality becomes playground, all damage becomes hugs.' },
    ],
    corruptionEffects: [
      'Physics becomes suggestions—gravity throws tantrums.',
      'Time takes naps randomly, freezing everything.',
      'Objects become cosmic teething toys.',
    ],
    dialogue: [
      'Goo goo ga VOID!',
      'No meetings! Only play!',
      'Peek-a-boo! Where universe go?',
    ],
    seeAlso: ['alien-old-one', 'rhea', 'zero-chance', 'boots'],
  },

  // Alien Old One - Merged Horror, No Door
  {
    slug: 'alien-old-one',
    name: 'Alien Old One',
    category: 'pantheon',
    luckyDie: 'none',
    luckyNumber: 0,
    rarity: 'Unique',
    // No domain - Alien Old One is two horrors sharing one body
    element: 'Paradox / Tentacles',
    role: 'Merged Horror (Diversity Hire)',
    portrait: '/assets/characters/pantheon/alien-old-one.png',
    sprites: [
      '/assets/characters/pantheon/sprite-alien-old-one-1.png',
      '/assets/characters/pantheon/sprite-alien-old-one-2.png',
      '/assets/characters/pantheon/sprite-alien-old-one-3.png',
      '/assets/characters/pantheon/sprite-alien-old-one-4.png',
    ],
    description: 'Alien Old One manifests when cosmic horror gets company—two nightmares sharing one body, disagreeing on everything except making reality uncomfortable. No lucky number—can\'t agree on one, filed formal complaints about each other\'s suggestions.',
    baseStats: {
      luck: 0,          // Can't agree on one
      essence: 85,      // Dual cosmic power
      grit: 65,         // Contested endurance
      shadow: 70,       // Eldritch darkness
      fury: 75,         // Conflicted rage
      resilience: 75,   // Two bodies in one
      swiftness: 45,    // Coordination issues
    },
    favorEffects: [
      { roll: 1, effect: 'Invasion Mode: Enemies become test subjects.' },
      { roll: 2, effect: 'Madness Mode: Reality questions itself.' },
      { roll: 3, effect: 'Chaos Cascade: Physics takes sides randomly.' },
      { roll: 4, effect: 'Therapy Timeout: Everything pauses to process.' },
      { roll: 5, effect: 'Dual Purpose: All items gain second functions.' },
      { roll: 6, effect: 'Unity Terror: Both horrors combine—reality surrenders.' },
    ],
    corruptionEffects: [
      'Tentacles argue over targets—attacks become unpredictable.',
      'Technology becomes eldritch, magic needs tech support.',
      'Space folds incorrectly as both aspects fight for control.',
    ],
    dialogue: [
      'We come in peace—CONQUEST!—PEACE!—CONQUEST!',
      'Resistance is futile—And hilarious—FUTILE!—HILARIOUS!',
      'We are legion—No we\'re two—LEGION!—TWO!',
    ],
    seeAlso: ['alien-baby', 'rhea', 'zero-chance', 'mr-kevin'],
  },
];
