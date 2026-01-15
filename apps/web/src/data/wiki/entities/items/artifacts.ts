import type { Item } from '../../types';

/**
 * NDG Artifacts - All artifact-type items
 *
 * Includes: Accessories, Equipment, Unique Items, Cursed Items
 */

export const artifacts: Item[] = [
  // ============================================
  // ENRICHED ARTIFACTS (from original)
  // ============================================

  // War Banner - Rare Artifact
  {
    slug: 'war-banner',
    name: 'War Banner',
    category: 'items',
    luckyNumber: 2,
    rarity: 'Rare',
    itemType: 'Artifact',
    image: '/assets/items/armor/war-banner.svg',
    description: "A rallying standard from The General's countless campaigns. Inspires nearby allies to fight harder.",
    value: 200,
    effects: [
      { name: 'Rally', description: 'Allies within 10m gain +15% attack.' },
      { name: 'Morale Boost', description: 'Reduces fear effects by 50%.' },
    ],
    obtainMethods: [
      { type: 'shop', source: 'command-and-supply', rate: 'Limited' },
    ],
    seeAlso: ['the-general', 'shadow-keep'],
    element: 'Earth',
    preferredDice: 6,
    level: 20,
    tier: 3,
    diceEffects: [
      { trigger: 'onRoll', die: 6, effect: 'Rally: Allies gain attack bonus equal to roll' },
    ],
  },

  // War Horn - Uncommon Artifact
  {
    slug: 'war-horn',
    name: 'War Horn',
    category: 'items',
    luckyNumber: 2,
    rarity: 'Uncommon',
    itemType: 'Artifact',
    image: '/assets/items/armor/war-horn.svg',
    description: 'A thunderous horn that echoes across battlefields. Boo G added bass, The General added purpose.',
    value: 180,
    effects: [
      { name: 'Battle Cry', description: 'Stuns nearby enemies for 2 seconds.' },
      { name: 'Intimidation', description: 'Reduces enemy attack by 10% for 30 seconds.' },
    ],
    obtainMethods: [
      { type: 'shop', source: 'bs-hits', rate: 'In Stock' },
      { type: 'shop', source: 'command-and-supply', rate: 'In Stock' },
    ],
    seeAlso: ['boo-g', 'the-general'],
    element: 'Earth',
    preferredDice: 6,
    level: 15,
    tier: 2,
    diceEffects: [
      { trigger: 'onMax', die: 6, effect: 'Battle Cry: Stun all nearby enemies for 2 seconds' },
    ],
  },

  // ============================================
  // ACCESSORIES & EQUIPMENT (19 items)
  // ============================================

  {
    slug: 'aviators',
    name: 'Aviators',
    category: 'items',
    itemType: 'Artifact',
    rarity: 'Uncommon',
    value: 50,
    element: 'Wind',
    tier: 2,
    level: 5,
    image: '/assets/items/armor/aviators.svg',
    description: 'Classic pilot sunglasses. Jane wears a pair just like these when she flies.',
    effects: [
      { name: 'Sun Shield', description: 'Immune to blind effects from bright light.' },
      { name: 'Cool Factor', description: '+5% critical chance while outdoors.' },
    ],
    seeAlso: ['jane', 'aberrant'],
    diceEffects: [
      { trigger: 'onMax', die: 20, effect: 'Top Gun: Critical chance doubled for 10 seconds' },
    ],
  },
  {
    slug: 'backpack',
    name: 'Backpack',
    category: 'items',
    itemType: 'Artifact',
    rarity: 'Common',
    value: 40,
    element: 'Neutral',
    tier: 1,
    level: 1,
    image: '/assets/items/armor/backpack.svg',
    description: 'A sturdy canvas backpack. Essential for any adventurer.',
    effects: [
      { name: 'Extra Storage', description: '+4 inventory slots.' },
    ],
    obtainMethods: [
      { type: 'shop', source: 'xtremes-xchange', rate: 'In Stock' },
    ],
    seeAlso: ['never-die-guy'],
    diceEffects: [
      { trigger: 'onMax', die: 6, effect: 'Deep Pockets: Find bonus item in loot' },
    ],
  },
  {
    slug: 'badge',
    name: 'Badge',
    category: 'items',
    itemType: 'Artifact',
    rarity: 'Common',
    value: 20,
    element: 'Neutral',
    tier: 1,
    level: 1,
    image: '/assets/items/armor/badge.svg',
    description: 'An official-looking badge. May or may not grant actual authority.',
    effects: [
      { name: 'Authority', description: 'NPCs are 10% more likely to cooperate.' },
    ],
    obtainMethods: [
      { type: 'shop', source: 'command-and-supply', rate: 'In Stock' },
    ],
    seeAlso: ['the-general'],
    diceEffects: [
      { trigger: 'onMax', die: 6, effect: 'Official Business: NPC guaranteed to cooperate' },
    ],
  },
  {
    slug: 'compass',
    name: 'Compass',
    category: 'items',
    itemType: 'Artifact',
    rarity: 'Common',
    value: 30,
    element: 'Neutral',
    tier: 1,
    level: 1,
    image: '/assets/items/armor/compass.svg',
    description: 'Always points north. Unless you are in Null Providence, where it just spins.',
    effects: [
      { name: 'Navigation', description: 'Reveals nearby points of interest on the map.' },
    ],
    obtainMethods: [
      { type: 'shop', source: 'xtremes-xchange', rate: 'In Stock' },
    ],
    seeAlso: ['aberrant'],
    diceEffects: [
      { trigger: 'onMax', die: 6, effect: 'True North: Reveal all secrets in current area' },
    ],
  },
  {
    slug: 'crutch',
    name: 'Crutch',
    category: 'items',
    itemType: 'Artifact',
    rarity: 'Common',
    value: 15,
    element: 'Neutral',
    tier: 1,
    level: 1,
    image: '/assets/items/armor/crutch.svg',
    description: 'A wooden crutch. Useful for getting around when injured.',
    effects: [
      { name: 'Hobble', description: 'Movement speed penalty reduced when injured.' },
      { name: 'Improvised Weapon', description: 'Can be used as a weak melee weapon.' },
    ],
    seeAlso: ['shadow-keep'],
    diceEffects: [
      { trigger: 'onMax', die: 6, effect: 'Walking Wounded: No movement penalty when injured' },
    ],
  },
  {
    slug: 'duffel-bag',
    name: 'Duffel Bag',
    category: 'items',
    itemType: 'Artifact',
    rarity: 'Uncommon',
    value: 60,
    element: 'Neutral',
    tier: 2,
    level: 5,
    image: '/assets/items/armor/duffel-bag.svg',
    description: 'A large canvas bag for hauling loot. Xtreme swears by these.',
    effects: [
      { name: 'Heavy Hauler', description: '+8 inventory slots.' },
      { name: 'Organized', description: 'Items weigh 10% less.' },
    ],
    obtainMethods: [
      { type: 'shop', source: 'xtremes-xchange', rate: 'In Stock' },
    ],
    seeAlso: ['xtreme'],
    diceEffects: [
      { trigger: 'onMax', die: 6, effect: 'Bottomless Bag: Items weigh nothing for this zone' },
    ],
  },
  {
    slug: 'eyepatch',
    name: 'Eyepatch',
    category: 'items',
    itemType: 'Artifact',
    rarity: 'Common',
    value: 25,
    element: 'Death',
    tier: 1,
    level: 1,
    image: '/assets/items/armor/eyepatch.svg',
    description: 'Covers one eye. Looks menacing, impairs depth perception.',
    effects: [
      { name: 'Dark Adaptation', description: 'Night vision in covered eye when removed.' },
      { name: 'Intimidating', description: '+5% fear chance on enemies.' },
    ],
    seeAlso: ['peter', 'shadow-keep'],
    diceEffects: [
      { trigger: 'onMax', die: 8, effect: 'Dread Gaze: Fear chance doubled for 30 seconds' },
    ],
  },
  {
    slug: 'gas-mask',
    name: 'Gas Mask',
    category: 'items',
    itemType: 'Artifact',
    rarity: 'Uncommon',
    value: 75,
    element: 'Neutral',
    tier: 2,
    level: 10,
    image: '/assets/items/armor/gas-mask.svg',
    description: 'Filters out toxic air. Essential in Infernus and certain parts of Shadow Keep.',
    effects: [
      { name: 'Toxin Filter', description: 'Immune to poison gas and toxic fog.' },
      { name: 'Muffled', description: 'Voice is harder to hear through the mask.' },
    ],
    obtainMethods: [
      { type: 'shop', source: 'command-and-supply', rate: 'In Stock' },
    ],
    seeAlso: ['infernus', 'shadow-keep'],
    diceEffects: [
      { trigger: 'onMax', die: 6, effect: 'Sealed: Immune to all airborne effects' },
    ],
  },
  {
    slug: 'guitar',
    name: 'Guitar',
    category: 'items',
    itemType: 'Artifact',
    rarity: 'Uncommon',
    value: 100,
    element: 'Neutral',
    tier: 2,
    level: 5,
    image: '/assets/items/weapons/melee-guitar.svg',
    description: "A six-string acoustic guitar. Boo G's instrument of choice for intimate performances.",
    effects: [
      { name: 'Serenade', description: 'Playing music can calm hostile NPCs.' },
      { name: 'Campfire Bonus', description: '+20% HP recovery at rest sites.' },
    ],
    obtainMethods: [
      { type: 'shop', source: 'bs-hits', rate: 'In Stock' },
    ],
    seeAlso: ['boo-g'],
    diceEffects: [
      { trigger: 'onMax', die: 6, effect: 'Perfect Harmony: All hostile NPCs become friendly' },
    ],
  },
  {
    slug: 'hook-hand',
    name: 'Hook Hand',
    category: 'items',
    itemType: 'Artifact',
    rarity: 'Uncommon',
    value: 60,
    element: 'Death',
    tier: 2,
    level: 8,
    image: '/assets/items/weapons/melee-hook-hand.svg',
    description: 'A metal hook prosthetic. Lost a hand? This is the stylish solution.',
    effects: [
      { name: 'Hook Strike', description: 'Unarmed attacks deal +10 damage.' },
      { name: 'Grapple', description: 'Can grab ledges and enemies.' },
    ],
    seeAlso: ['peter', 'shadow-keep'],
    diceEffects: [
      { trigger: 'onMax', die: 8, effect: 'Pirate Grip: Grappled enemies cannot escape' },
    ],
  },
  {
    slug: 'lockpick',
    name: 'Lockpick',
    category: 'items',
    itemType: 'Artifact',
    rarity: 'Common',
    value: 20,
    element: 'Neutral',
    tier: 1,
    level: 1,
    image: '/assets/items/quest/lockpick.svg',
    description: 'A thin metal pick for opening locks. Single use, so stock up.',
    effects: [
      { name: 'Unlock', description: 'Opens one locked chest or door. Consumed on use.' },
    ],
    obtainMethods: [
      { type: 'shop', source: 'xtremes-xchange', rate: 'In Stock' },
      { type: 'shop', source: 'banco-de-bones', rate: 'In Stock' },
    ],
    seeAlso: ['xtreme'],
    diceEffects: [
      { trigger: 'onMax', die: 6, effect: 'Master Pick: Not consumed on use' },
    ],
  },
  {
    slug: 'radio',
    name: 'Radio',
    category: 'items',
    itemType: 'Artifact',
    rarity: 'Uncommon',
    value: 60,
    element: 'Neutral',
    tier: 2,
    level: 5,
    image: '/assets/items/armor/radio.svg',
    description: 'A portable radio receiver. Sometimes picks up strange transmissions from other domains.',
    effects: [
      { name: 'Intel', description: 'Occasionally reveals enemy positions.' },
      { name: 'Morale Music', description: '+5% damage while playing music.' },
    ],
    obtainMethods: [
      { type: 'shop', source: 'bs-hits', rate: 'In Stock' },
    ],
    seeAlso: ['boo-g'],
    diceEffects: [
      { trigger: 'onMax', die: 6, effect: 'Clear Signal: All enemy positions revealed' },
    ],
  },
  {
    slug: 'robo-leg',
    name: 'Robo Leg',
    category: 'items',
    itemType: 'Artifact',
    rarity: 'Rare',
    value: 200,
    element: 'Neutral',
    tier: 3,
    level: 20,
    image: '/assets/items/armor/robo-leg.svg',
    description: 'A mechanical prosthetic leg with enhanced capabilities. Better than the original.',
    effects: [
      { name: 'Enhanced Sprint', description: '+20% movement speed.' },
      { name: 'Hydraulic Kick', description: 'Kick attacks deal +30 damage.' },
      { name: 'Jump Boost', description: '+50% jump height.' },
    ],
    obtainMethods: [
      { type: 'shop', source: 'xtremes-xchange', rate: 'Special Order' },
    ],
    seeAlso: ['xtreme'],
    diceEffects: [
      { trigger: 'onMax', die: 6, effect: 'Turbo Boost: Triple movement speed for 5 seconds' },
    ],
  },
  {
    slug: 'shovel',
    name: 'Shovel',
    category: 'items',
    itemType: 'Artifact',
    rarity: 'Common',
    value: 25,
    element: 'Earth',
    tier: 1,
    level: 1,
    image: '/assets/items/armor/shovel.svg',
    description: 'A sturdy digging tool. John uses one just like this to tend his domain.',
    effects: [
      { name: 'Dig', description: 'Can excavate buried treasure and hidden items.' },
      { name: 'Bonk', description: 'Usable as a weak melee weapon.' },
    ],
    obtainMethods: [
      { type: 'shop', source: 'command-and-supply', rate: 'In Stock' },
    ],
    seeAlso: ['john', 'earth'],
    diceEffects: [
      { trigger: 'onMax', die: 6, effect: 'Treasure Hunter: Find rare item when digging' },
    ],
  },
  {
    slug: 'sponge',
    name: 'Sponge',
    category: 'items',
    itemType: 'Artifact',
    rarity: 'Common',
    value: 5,
    element: 'Neutral',
    tier: 1,
    level: 1,
    image: '/assets/items/armor/sponge.svg',
    description: 'An absorbent sponge. Surprisingly useful for cleaning up after battles.',
    effects: [
      { name: 'Absorb', description: 'Can soak up liquids and remove status effects from surfaces.' },
    ],
    seeAlso: ['earth'],
    diceEffects: [
      { trigger: 'onMax', die: 6, effect: 'Super Absorbent: Remove all ground hazards in area' },
    ],
  },
  {
    slug: 'stopwatch',
    name: 'Stopwatch',
    category: 'items',
    itemType: 'Artifact',
    rarity: 'Uncommon',
    value: 75,
    element: 'Ice',
    tier: 2,
    level: 10,
    image: '/assets/items/armor/stopwatch.svg',
    description: 'A precision timepiece. Alice tinkered with this one to work across time zones.',
    effects: [
      { name: 'Time Check', description: 'Shows exact time remaining on all buffs and debuffs.' },
      { name: 'Chrono Sense', description: 'Slows perception of time slightly during combat.' },
    ],
    obtainMethods: [
      { type: 'shop', source: 'the-burning-pages', rate: 'In Stock' },
    ],
    seeAlso: ['alice', 'frost-reach'],
    diceEffects: [
      { trigger: 'onMax', die: 12, effect: 'Time Stop: Freeze time for 2 seconds' },
    ],
  },
  {
    slug: 'utiity-belt',
    name: 'Utility Belt',
    category: 'items',
    itemType: 'Artifact',
    rarity: 'Uncommon',
    value: 80,
    element: 'Neutral',
    tier: 2,
    level: 10,
    image: '/assets/items/armor/utility-belt.svg',
    description: 'A belt with many pouches and loops. Keeps your consumables within easy reach.',
    effects: [
      { name: 'Quick Access', description: 'Use consumables 20% faster.' },
      { name: 'Organized', description: '+4 consumable slots.' },
    ],
    obtainMethods: [
      { type: 'shop', source: 'command-and-supply', rate: 'In Stock' },
    ],
    seeAlso: ['the-general'],
    diceEffects: [
      { trigger: 'onMax', die: 6, effect: 'Instant Access: Next consumable use is instant' },
    ],
  },

  // ============================================
  // UNIQUE & LEGENDARY ARTIFACTS (5 items)
  // ============================================

  {
    slug: 'kings-crown',
    name: "King's Crown",
    category: 'items',
    itemType: 'Artifact',
    rarity: 'Legendary',
    value: 1000,
    element: 'Neutral',
    tier: 5,
    level: 40,
    image: '/assets/items/armor/king-james-crown.svg',
    description: "King James' royal crown, a symbol of authority over Null Providence. Heavy is the head.",
    effects: [
      { name: 'Royal Authority', description: 'All NPCs treat you as royalty.' },
      { name: 'Commanding Presence', description: '+25% to all party member stats.' },
      { name: 'Heavy Crown', description: '-10% movement speed.' },
    ],
    obtainMethods: [
      { type: 'enemy', source: 'king-james', location: 'null-providence', rate: '100%' },
    ],
    seeAlso: ['king-james', 'null-providence'],
    diceEffects: [
      { trigger: 'onMax', die: 6, effect: 'Royal Decree: All allies gain +50% stats for 10 seconds' },
    ],
  },
  {
    slug: 'angel',
    name: 'Angel',
    category: 'items',
    itemType: 'Artifact',
    rarity: 'Legendary',
    value: 1000,
    element: 'Neutral',
    tier: 5,
    level: 40,
    image: '/assets/items/consumables/guardian-angel.svg',
    description: 'A small angelic figurine that glows with divine light. Grants protection from the beyond.',
    effects: [
      { name: 'Divine Protection', description: 'Survive one fatal blow per day with 1 HP.' },
      { name: 'Holy Aura', description: 'Undead enemies deal 25% less damage to you.' },
      { name: 'Blessed', description: '+20% healing received.' },
    ],
    obtainMethods: [
      { type: 'quest', source: 'pantheon-pilgrimage', rate: '100%' },
    ],
    seeAlso: ['the-one', 'shadow-keep'],
    diceEffects: [
      { trigger: 'onMax', die: 6, effect: 'Divine Intervention: Full HP restored once per day' },
    ],
  },
  {
    slug: 'angel-disguise',
    name: 'Angel Disguise',
    category: 'items',
    itemType: 'Artifact',
    rarity: 'Epic',
    value: 500,
    element: 'Neutral',
    tier: 4,
    level: 30,
    image: '/assets/items/armor/disguise.svg',
    description: 'A costume with fake wings and a halo. Fools some, amuses others.',
    effects: [
      { name: 'False Divinity', description: 'Weak enemies may flee in awe.' },
      { name: 'Imposter', description: 'Holy enemies are initially confused.' },
    ],
    obtainMethods: [
      { type: 'shop', source: 'xtremes-xchange', rate: 'Rare Stock' },
    ],
    seeAlso: ['xtreme'],
    diceEffects: [
      { trigger: 'onMax', die: 6, effect: 'Convincing Act: All enemies flee in awe' },
    ],
  },
  {
    slug: 'dead-old-one',
    name: 'Dead Old One',
    category: 'items',
    itemType: 'Artifact',
    rarity: 'Legendary',
    value: 2000,
    element: 'Void',
    tier: 5,
    level: 50,
    image: '/assets/items/artifacts/old-one-unborn.svg',
    description: 'The preserved remains of an ancient void entity. Even in death, it whispers secrets.',
    effects: [
      { name: 'Eldritch Knowledge', description: 'Reveals hidden void items and passages.' },
      { name: 'Whispers', description: 'Occasionally provides cryptic hints about the future.' },
      { name: 'Corruption Risk', description: '1% chance per use to gain a random curse.' },
    ],
    obtainMethods: [
      { type: 'enemy', source: 'the-one', location: 'null-providence', rate: '10%' },
    ],
    seeAlso: ['the-one', 'null-providence', 'dr-voss'],
    diceEffects: [
      { trigger: 'onMax', die: 4, effect: 'Ancient Wisdom: Reveal next boss attack pattern' },
    ],
  },
  {
    slug: 'loaded-die',
    name: 'Loaded Die',
    category: 'items',
    itemType: 'Artifact',
    rarity: 'Epic',
    value: 500,
    element: 'Neutral',
    tier: 4,
    level: 25,
    image: '/assets/items/armor/my-die.svg',
    description: 'A die weighted to always land on its best face. Cheating has never felt so good.',
    effects: [
      { name: 'Fixed Roll', description: 'Once per combat, guarantee a maximum dice roll.' },
      { name: 'Risky Business', description: 'If caught cheating, enemies become enraged.' },
    ],
    obtainMethods: [
      { type: 'shop', source: 'xtremes-xchange', rate: 'Under the Counter' },
    ],
    seeAlso: ['xtreme', 'aberrant'],
    diceEffects: [
      { trigger: 'onMax', die: 6, effect: 'Perfect Cheat: Guaranteed max roll not detected' },
    ],
  },
  {
    slug: 'lucky-you',
    name: 'Lucky You',
    category: 'items',
    itemType: 'Artifact',
    rarity: 'Epic',
    value: 400,
    element: 'Neutral',
    tier: 4,
    level: 20,
    image: '/assets/items/armor/lucky-you.svg',
    description: "A four-leaf clover preserved in resin. Jane found it in Aberrant's wind-swept fields.",
    effects: [
      { name: 'Fortune', description: '+15% critical hit chance.' },
      { name: 'Lucky Find', description: '+10% rare item drop rate.' },
      { name: 'Serendipity', description: 'Occasionally find extra gold after battles.' },
    ],
    obtainMethods: [
      { type: 'chest', source: 'hidden-grove', location: 'aberrant', rate: '5%' },
    ],
    seeAlso: ['jane', 'aberrant'],
    diceEffects: [
      { trigger: 'onMax', die: 20, effect: 'Jackpot: All luck bonuses tripled for this combat' },
    ],
  },

  // ============================================
  // CURSED ITEMS (11 items)
  // ============================================

  {
    slug: 'cursed-eye',
    name: 'Cursed Eye',
    category: 'items',
    itemType: 'Artifact',
    rarity: 'Rare',
    value: 150,
    element: 'Death',
    tier: 3,
    level: 15,
    image: '/assets/items/armor/cursed-eye.svg',
    description: 'A preserved eye that still moves. It sees things you wish it would not.',
    effects: [
      { name: 'Dark Vision', description: 'See invisible enemies and hidden traps.' },
      { name: 'Paranoia', description: 'Sometimes shows threats that are not real.' },
    ],
    obtainMethods: [
      { type: 'enemy', source: 'skeleton-knight', location: 'shadow-keep', rate: '8%' },
    ],
    seeAlso: ['peter', 'shadow-keep'],
    diceEffects: [
      { trigger: 'onMax', die: 8, effect: 'True Sight: See through all illusions and invisibility' },
    ],
  },
  {
    slug: 'cursed-finger',
    name: 'Cursed Finger',
    category: 'items',
    itemType: 'Artifact',
    rarity: 'Rare',
    value: 100,
    element: 'Death',
    tier: 3,
    level: 15,
    image: '/assets/items/consumables/cursed-finger.svg',
    description: 'A severed finger that still twitches. Points toward danger... or treasure.',
    effects: [
      { name: 'Dowsing', description: 'Points toward nearest valuable item.' },
      { name: 'Curse Transfer', description: '5% chance to transfer a curse to enemies on hit.' },
    ],
    obtainMethods: [
      { type: 'enemy', source: 'skeleton-warrior', location: 'shadow-keep', rate: '5%' },
    ],
    seeAlso: ['shadow-keep'],
    diceEffects: [
      { trigger: 'onMax', die: 8, effect: 'Guaranteed Transfer: Curse always transfers on hit' },
    ],
  },
  {
    slug: 'cursed-finger-uneaten',
    name: 'Cursed Finger (Uneaten)',
    category: 'items',
    itemType: 'Artifact',
    rarity: 'Rare',
    value: 120,
    element: 'Death',
    tier: 3,
    level: 15,
    image: '/assets/items/artifacts/cursed-finger-uneaten.svg',
    description: 'A cursed finger in pristine condition. Someone resisted the urge to consume it.',
    effects: [
      { name: 'Temptation', description: 'Can be eaten for a powerful but random effect.' },
      { name: 'Preserved Curse', description: 'While held, +10% damage against undead.' },
    ],
    obtainMethods: [
      { type: 'chest', source: 'cursed-chest', location: 'shadow-keep', rate: '10%' },
    ],
    seeAlso: ['shadow-keep', 'peter'],
    diceEffects: [
      { trigger: 'onMax', die: 8, effect: 'Forbidden Feast: Eating grants only beneficial effects' },
    ],
  },
  {
    slug: 'cursed-glass-eye',
    name: 'Cursed Glass Eye',
    category: 'items',
    itemType: 'Artifact',
    rarity: 'Epic',
    value: 250,
    element: 'Death',
    tier: 4,
    level: 25,
    image: '/assets/items/armor/cursed-eye.svg',
    description: 'A glass eye that captures souls. Those who look into it see their own death.',
    effects: [
      { name: 'Soul Capture', description: 'Killing enemies stores their souls (max 5).' },
      { name: 'Release', description: 'Expend stored souls to deal massive dark damage.' },
      { name: 'Mortality Mirror', description: 'Enemies that see it have reduced morale.' },
    ],
    obtainMethods: [
      { type: 'enemy', source: 'void-spawn', location: 'shadow-keep', rate: '3%' },
    ],
    seeAlso: ['peter', 'shadow-keep', 'null-providence'],
    diceEffects: [
      { trigger: 'onMax', die: 8, effect: 'Soul Harvest: Store 3 souls from one kill' },
    ],
  },
  {
    slug: 'cursed-leg',
    name: 'Cursed Leg',
    category: 'items',
    itemType: 'Artifact',
    rarity: 'Rare',
    value: 150,
    element: 'Death',
    tier: 3,
    level: 15,
    image: '/assets/items/artifacts/cursed-leg.svg',
    description: 'A skeletal leg that walks on its own. Creepy, but surprisingly helpful.',
    effects: [
      { name: 'Undead Servant', description: 'Summons a skeletal minion once per day.' },
      { name: 'Cursed Walk', description: 'Movement leaves a trail of minor curses.' },
    ],
    obtainMethods: [
      { type: 'enemy', source: 'skeleton-warrior', location: 'shadow-keep', rate: '6%' },
    ],
    seeAlso: ['shadow-keep'],
    diceEffects: [
      { trigger: 'onMax', die: 8, effect: 'Legion: Summon 3 skeletal minions at once' },
    ],
  },
  {
    slug: 'cursed-whistle',
    name: 'Cursed Whistle',
    category: 'items',
    itemType: 'Artifact',
    rarity: 'Rare',
    value: 100,
    element: 'Death',
    tier: 3,
    level: 15,
    image: '/assets/items/armor/cursed-whistle.svg',
    description: 'A bone whistle that only the dead can hear. Calling them might not be wise.',
    effects: [
      { name: 'Summon Dead', description: 'Attracts nearby undead enemies to your location.' },
      { name: 'Death Lure', description: 'Can be used to draw undead away from an area.' },
    ],
    obtainMethods: [
      { type: 'enemy', source: 'skeleton-knight', location: 'shadow-keep', rate: '7%' },
    ],
    seeAlso: ['peter', 'shadow-keep'],
    diceEffects: [
      { trigger: 'onMax', die: 8, effect: 'Command Undead: Summoned undead fight for you' },
    ],
  },
  {
    slug: 'snake-eye',
    name: 'Snake Eye',
    category: 'items',
    itemType: 'Artifact',
    rarity: 'Rare',
    value: 150,
    element: 'Death',
    tier: 3,
    level: 18,
    image: '/assets/items/armor/snake-eye.svg',
    description: "A serpent's eye preserved in dark magic. Grants a predator's instincts.",
    effects: [
      { name: 'Predator Vision', description: 'See enemy health bars and weak points.' },
      { name: 'Cold Blooded', description: '+15% damage against targets below 30% HP.' },
    ],
    obtainMethods: [
      { type: 'enemy', source: 'void-spawn', location: 'shadow-keep', rate: '5%' },
    ],
    seeAlso: ['shadow-keep'],
    diceEffects: [
      { trigger: 'onMax', die: 8, effect: 'Execute: Instantly kill enemies below 10% HP' },
    ],
  },
  {
    slug: 'tombstone',
    name: 'Tombstone',
    category: 'items',
    itemType: 'Artifact',
    rarity: 'Rare',
    value: 100,
    element: 'Death',
    tier: 3,
    level: 15,
    image: '/assets/items/armor/tombstone.svg',
    description: 'A miniature tombstone with your name on it. The date is blank... for now.',
    effects: [
      { name: 'Memento Mori', description: 'Take 10% less damage when below 25% HP.' },
      { name: 'Grave Marker', description: 'Drop location is always marked on death.' },
    ],
    obtainMethods: [
      { type: 'chest', source: 'graveyard', location: 'shadow-keep', rate: '15%' },
    ],
    seeAlso: ['peter', 'shadow-keep'],
    diceEffects: [
      { trigger: 'onMax', die: 8, effect: 'Cheating Death: Revive with 50% HP once per day' },
    ],
  },

  // ============================================
  // TRADE & MERCHANT ARTIFACTS (3 items)
  // ============================================

  {
    slug: 'merchants-hook',
    name: "Merchant's Hook",
    category: 'items',
    itemType: 'Artifact',
    rarity: 'Rare',
    value: 150,
    element: 'Neutral',
    tier: 3,
    level: 15,
    image: '/assets/items/armor/merchant-hook.svg',
    description: "A hook used by traveling merchants to display wares. Xtreme's signature item.",
    effects: [
      { name: 'Haggle', description: '+15% better prices when buying and selling.' },
      { name: 'Display', description: 'Items you sell appear more valuable to buyers.' },
    ],
    obtainMethods: [
      { type: 'shop', source: 'xtremes-xchange', rate: 'Loyalty Reward' },
    ],
    seeAlso: ['xtreme'],
    diceEffects: [
      { trigger: 'onMax', die: 6, effect: 'Master Haggle: 50% discount on next purchase' },
    ],
  },
  {
    slug: 'traders-talisman',
    name: "Trader's Talisman",
    category: 'items',
    itemType: 'Artifact',
    rarity: 'Rare',
    value: 200,
    element: 'Neutral',
    tier: 3,
    level: 15,
    image: '/assets/items/armor/traders-talisman.svg',
    description: 'A lucky charm passed between merchants. Brings fortune to transactions.',
    effects: [
      { name: 'Fortune', description: '+20% gold from all sources.' },
      { name: 'Merchant Network', description: 'Unlock rare items in shops.' },
    ],
    obtainMethods: [
      { type: 'quest', source: 'merchant-guild', rate: '100%' },
    ],
    seeAlso: ['xtreme', 'banco-de-bones'],
    diceEffects: [
      { trigger: 'onMax', die: 6, effect: 'Golden Touch: Double gold from next 3 sources' },
    ],
  },

  // ============================================
  // MUSIC & AUDIO ARTIFACTS (4 items)
  // ============================================

  {
    slug: 'audio-streamer',
    name: 'Audio Streamer',
    category: 'items',
    itemType: 'Artifact',
    rarity: 'Uncommon',
    value: 60,
    element: 'Neutral',
    tier: 2,
    level: 5,
    image: '/assets/items/consumables/audio-stream-enhancer.svg',
    description: "A device for broadcasting music. Boo G uses these at his concerts.",
    effects: [
      { name: 'Broadcast', description: 'Music effects reach a wider area.' },
      { name: 'Sound Quality', description: '+10% effectiveness of sound-based abilities.' },
    ],
    obtainMethods: [
      { type: 'shop', source: 'bs-hits', rate: 'In Stock' },
    ],
    seeAlso: ['boo-g'],
    diceEffects: [
      { trigger: 'onMax', die: 6, effect: 'Max Volume: Sound effects reach entire area' },
    ],
  },
  {
    slug: 'beat-booster',
    name: 'Beat Booster',
    category: 'items',
    itemType: 'Artifact',
    rarity: 'Rare',
    value: 150,
    element: 'Neutral',
    tier: 3,
    level: 15,
    image: '/assets/items/consumables/beat-booster.svg',
    description: "Amplifies rhythm-based attacks. Boo G's secret weapon for his drop.",
    effects: [
      { name: 'Rhythm Boost', description: '+25% damage on beat-timed attacks.' },
      { name: 'Bass Drop', description: 'Critical hits create a shockwave.' },
    ],
    obtainMethods: [
      { type: 'shop', source: 'bs-hits', rate: 'Premium' },
    ],
    seeAlso: ['boo-g'],
    diceEffects: [
      { trigger: 'onMax', die: 6, effect: 'Perfect Rhythm: All attacks are beat-timed for 10 seconds' },
    ],
  },
  {
    slug: 'twin-dongs',
    name: 'Twin Dongs',
    category: 'items',
    itemType: 'Artifact',
    rarity: 'Uncommon',
    value: 50,
    element: 'Neutral',
    tier: 2,
    level: 5,
    image: '/assets/items/consumables/twin-dongs.svg',
    description: 'A pair of small bells that ring in harmony. Makes a pleasant sound.',
    effects: [
      { name: 'Chime', description: 'Ring to attract attention or signal allies.' },
      { name: 'Resonance', description: '+5% damage to sonic-weak enemies.' },
    ],
    obtainMethods: [
      { type: 'shop', source: 'bs-hits', rate: 'In Stock' },
    ],
    seeAlso: ['boo-g'],
    diceEffects: [
      { trigger: 'onMax', die: 6, effect: 'Harmonic Chime: Stun all sonic-weak enemies' },
    ],
  },

  // ============================================
  // UTILITY ARTIFACTS (8 items)
  // ============================================

  {
    slug: 'cardboard-box',
    name: 'Cardboard Box',
    category: 'items',
    itemType: 'Artifact',
    rarity: 'Common',
    value: 5,
    element: 'Neutral',
    tier: 1,
    level: 1,
    image: '/assets/items/armor/cardboard-box.svg',
    description: 'A simple cardboard box. Surprisingly effective for hiding.',
    effects: [
      { name: 'Stealth Box', description: 'Crouch inside to become nearly invisible to enemies.' },
      { name: 'Fragile', description: 'Breaks after taking any damage.' },
    ],
    seeAlso: ['shadow-keep'],
    diceEffects: [
      { trigger: 'onMax', die: 6, effect: 'Tactical Espionage: Box survives one hit' },
    ],
  },
  {
    slug: 'holdem',
    name: "Hold'em",
    category: 'items',
    itemType: 'Artifact',
    rarity: 'Uncommon',
    value: 50,
    element: 'Neutral',
    tier: 2,
    level: 5,
    image: '/assets/items/armor/holdem.svg',
    description: 'A deck of playing cards. Good for passing time or gambling.',
    effects: [
      { name: 'Gamble', description: 'Play cards with NPCs for gold.' },
      { name: 'Card Trick', description: 'Distract enemies briefly.' },
    ],
    obtainMethods: [
      { type: 'shop', source: 'xtremes-xchange', rate: 'In Stock' },
    ],
    seeAlso: ['xtreme', 'aberrant'],
    diceEffects: [
      { trigger: 'onMax', die: 6, effect: 'Royal Flush: Win any gambling game instantly' },
    ],
  },
  {
    slug: 'hunters-mirror',
    name: "Hunter's Mirror",
    category: 'items',
    itemType: 'Artifact',
    rarity: 'Rare',
    value: 150,
    element: 'Death',
    tier: 3,
    level: 15,
    image: '/assets/items/armor/hunters-mirror.svg',
    description: 'A mirror that shows the true nature of creatures. Essential for hunting shapeshifters.',
    effects: [
      { name: 'True Sight', description: 'Reveals disguised and shapeshifted enemies.' },
      { name: 'Reflection', description: 'Small chance to reflect magic attacks.' },
    ],
    obtainMethods: [
      { type: 'shop', source: 'banco-de-bones', rate: 'Special Order' },
    ],
    seeAlso: ['peter', 'shadow-keep'],
    diceEffects: [
      { trigger: 'onMax', die: 8, effect: 'Perfect Reflection: Reflect next magic attack' },
    ],
  },
  {
    slug: 'red-phone',
    name: 'Red Phone',
    category: 'items',
    itemType: 'Artifact',
    rarity: 'Rare',
    value: 150,
    element: 'Fire',
    tier: 3,
    level: 15,
    image: '/assets/items/armor/presidential-phone.svg',
    description: 'A hotline to Infernus. Robert answers if he is not busy burning things.',
    effects: [
      { name: 'Fire Call', description: 'Summon a small fire spirit to assist in combat.' },
      { name: 'Hot Tip', description: 'Robert occasionally provides hints about fire-related content.' },
    ],
    obtainMethods: [
      { type: 'quest', source: 'robert-favor', rate: '100%' },
    ],
    seeAlso: ['robert', 'infernus'],
    diceEffects: [
      { trigger: 'onMax', die: 10, effect: 'Direct Line: Robert sends a powerful fire spirit' },
    ],
  },
  {
    slug: 'stitchup-scissors',
    name: 'Stitch-Up Scissors',
    category: 'items',
    itemType: 'Artifact',
    rarity: 'Rare',
    value: 150,
    element: 'Neutral',
    tier: 3,
    level: 15,
    image: '/assets/items/weapons/melee-stichup-scissors.svg',
    description: 'Medical scissors used for field surgery. Cuts and heals in equal measure.',
    effects: [
      { name: 'Field Surgery', description: 'Remove bleeding and deep wound effects.' },
      { name: 'Precision Cut', description: '+20% critical damage with blade weapons.' },
    ],
    obtainMethods: [
      { type: 'shop', source: 'command-and-supply', rate: 'Medical Stock' },
    ],
    seeAlso: ['the-general'],
    diceEffects: [
      { trigger: 'onMax', die: 6, effect: 'Perfect Surgery: Remove all negative effects' },
    ],
  },

  // ============================================
  // SHOP-EXCLUSIVE ARTIFACTS
  // ============================================

  // Arcane Grimoire - The Burning Pages (Arcane/Fire theme)
  {
    slug: 'arcane-grimoire',
    name: 'Arcane Grimoire',
    category: 'items',
    itemType: 'Artifact',
    luckyNumber: 4,
    rarity: 'Epic',
    value: 600,
    element: 'Fire',
    tier: 4,
    level: 30,
    image: '/assets/items/quest/maxwells-textbook.svg',
    description: "An ancient spellbook from Dr. Maxwell's personal collection. The pages are warm to the touch and occasionally catch fire when opened to particularly dangerous chapters. Contains forbidden knowledge of pyroclastic magic.",
    effects: [
      { name: 'Arcane Knowledge', description: '+25% damage on fire-based abilities.' },
      { name: 'Spell Amplification', description: 'Magic attacks have +15% area of effect.' },
      { name: 'Burning Wisdom', description: 'Reading reveals one random enemy weakness per area.' },
    ],
    stats: [
      { label: 'Magic Power', value: 80, max: 100 },
      { label: 'Fire Affinity', value: 90, max: 100 },
    ],
    obtainMethods: [
      { type: 'shop', source: 'the-burning-pages', rate: 'Scholar Stock' },
    ],
    seeAlso: ['dr-maxwell', 'robert', 'infernus', 'blazecaster'],
    diceEffects: [
      { trigger: 'onMax', die: 10, effect: 'Arcane Surge: Next spell costs no mana', value: 1 },
    ],
  },

  // ============================================
  // LOADOUT STARTER ITEMS
  // ============================================

  {
    slug: 'worn-dice-bag',
    name: 'Worn Dice Bag',
    category: 'items',
    itemType: 'Artifact',
    luckyNumber: 7,
    rarity: 'Common',
    value: 50,
    element: 'Neutral',
    tier: 1,
    level: 1,
    image: '/assets/items/accessory/worn-dice-bag.svg',
    description: 'A well-used leather pouch for carrying dice. The fabric is soft from years of handling. Grants an extra throw per combat.',
    effects: [
      { name: 'Extra Throw', description: '+1 throw per combat.' },
    ],
    obtainMethods: [
      { type: 'starter', source: 'Warrior Loadout', rate: 'Starting Item' },
    ],
    seeAlso: ['never-die-guy'],
  },

  {
    slug: 'traders-coin',
    name: "Trader's Coin",
    category: 'items',
    itemType: 'Artifact',
    luckyNumber: 5,
    rarity: 'Common',
    value: 50,
    element: 'Neutral',
    tier: 1,
    level: 1,
    image: '/assets/items/accessory/traders-coin.svg',
    description: 'A lucky coin carried by traveling merchants. Flipping it brings good fortune in trades. Grants an extra trade per combat.',
    effects: [
      { name: 'Extra Trade', description: '+1 trade per combat.' },
    ],
    obtainMethods: [
      { type: 'starter', source: 'Rogue Loadout', rate: 'Starting Item' },
    ],
    seeAlso: ['willy'],
  },

  {
    slug: 'fire-ember',
    name: 'Fire Ember',
    category: 'items',
    itemType: 'Artifact',
    luckyNumber: 4,
    rarity: 'Common',
    value: 75,
    element: 'Fire',
    tier: 1,
    level: 1,
    image: '/assets/items/materials/fire-ember.svg',
    description: 'A perpetually smoldering ember from the depths of Infernus. Warm to the touch but never burns the holder.',
    effects: [
      { name: 'Fire Attunement', description: '+25% Fire damage.' },
    ],
    obtainMethods: [
      { type: 'starter', source: 'Warrior Loadout', rate: 'Starting Item' },
      { type: 'drop', source: 'Infernus enemies', rate: 'Common' },
    ],
    seeAlso: ['robert', 'infernus'],
  },

  {
    slug: 'wind-feather',
    name: 'Wind Feather',
    category: 'items',
    itemType: 'Artifact',
    luckyNumber: 6,
    rarity: 'Common',
    value: 75,
    element: 'Wind',
    tier: 1,
    level: 1,
    image: '/assets/items/materials/wind-feather.svg',
    description: 'A feather that constantly floats and drifts, pulled by unseen currents from the Aberrant reaches.',
    effects: [
      { name: 'Wind Attunement', description: '+25% Wind damage.' },
    ],
    obtainMethods: [
      { type: 'starter', source: 'Rogue Loadout', rate: 'Starting Item' },
      { type: 'drop', source: 'Aberrant enemies', rate: 'Common' },
    ],
    seeAlso: ['jane', 'aberrant'],
  },

  {
    slug: 'earth-stone',
    name: 'Earth Stone',
    category: 'items',
    itemType: 'Artifact',
    luckyNumber: 2,
    rarity: 'Common',
    value: 75,
    element: 'Earth',
    tier: 1,
    level: 1,
    image: '/assets/items/materials/earth-stone.svg',
    description: 'A dense, perfectly smooth stone from the mechanical forges of Earth. Hums with latent energy.',
    effects: [
      { name: 'Earth Attunement', description: '+25% Earth damage.' },
    ],
    obtainMethods: [
      { type: 'drop', source: 'Earth enemies', rate: 'Common' },
    ],
    seeAlso: ['john', 'earth'],
  },

  {
    slug: 'death-sigil',
    name: 'Death Sigil',
    category: 'items',
    itemType: 'Artifact',
    luckyNumber: 3,
    rarity: 'Common',
    value: 75,
    element: 'Death',
    tier: 1,
    level: 1,
    image: '/assets/items/materials/death-sigil.svg',
    description: 'A small medallion bearing the mark of Shadow Keep. Cold to the touch, it resonates with necrotic energy.',
    effects: [
      { name: 'Death Attunement', description: '+25% Death damage.' },
    ],
    obtainMethods: [
      { type: 'drop', source: 'Shadow Keep enemies', rate: 'Common' },
    ],
    seeAlso: ['peter', 'shadow-keep'],
  },

  {
    slug: 'ice-shard',
    name: 'Ice Shard',
    category: 'items',
    itemType: 'Artifact',
    luckyNumber: 5,
    rarity: 'Common',
    value: 75,
    element: 'Ice',
    tier: 1,
    level: 1,
    image: '/assets/items/materials/ice-shard.svg',
    description: 'A crystal shard from Frost Reach that never melts. Emanates a constant chill.',
    effects: [
      { name: 'Ice Attunement', description: '+25% Ice damage.' },
    ],
    obtainMethods: [
      { type: 'drop', source: 'Frost Reach enemies', rate: 'Common' },
    ],
    seeAlso: ['alice', 'frost-reach'],
  },

  // ============================================
  // SHOP GAMEPLAY ITEMS
  // ============================================

  {
    slug: 'extra-throw',
    name: 'Extra Throw Token',
    category: 'items',
    itemType: 'Artifact',
    luckyNumber: 7,
    rarity: 'Uncommon',
    value: 100,
    element: 'Neutral',
    tier: 2,
    level: 5,
    image: '/assets/items/accessory/extra-throw.svg',
    description: 'A mystical token that grants the holder one additional throw per combat.',
    effects: [
      { name: 'Bonus Throw', description: '+1 throw per combat.' },
    ],
    obtainMethods: [
      { type: 'shop', source: 'Any Wanderer Shop', rate: 'Common Stock' },
    ],
  },

  {
    slug: 'extra-trade',
    name: 'Extra Trade Token',
    category: 'items',
    itemType: 'Artifact',
    luckyNumber: 5,
    rarity: 'Uncommon',
    value: 100,
    element: 'Neutral',
    tier: 2,
    level: 5,
    image: '/assets/items/accessory/extra-trade.svg',
    description: 'A mystical token that grants the holder one additional trade per combat.',
    effects: [
      { name: 'Bonus Trade', description: '+1 trade per combat.' },
    ],
    obtainMethods: [
      { type: 'shop', source: 'Any Wanderer Shop', rate: 'Common Stock' },
    ],
  },

  {
    slug: 'score-booster',
    name: 'Score Booster',
    category: 'items',
    itemType: 'Artifact',
    luckyNumber: 7,
    rarity: 'Uncommon',
    value: 150,
    element: 'Neutral',
    tier: 2,
    level: 10,
    image: '/assets/items/accessory/score-booster.svg',
    description: 'An enchanted talisman that amplifies the value of successful dice rolls.',
    effects: [
      { name: 'Score Boost', description: '+20% base score multiplier.' },
    ],
    obtainMethods: [
      { type: 'shop', source: 'Any Wanderer Shop', rate: 'Uncommon Stock' },
    ],
  },

  {
    slug: 'gold-magnet',
    name: 'Gold Magnet',
    category: 'items',
    itemType: 'Artifact',
    luckyNumber: 5,
    rarity: 'Uncommon',
    value: 125,
    element: 'Neutral',
    tier: 2,
    level: 8,
    image: '/assets/items/accessory/gold-magnet.svg',
    description: 'A peculiar device that attracts gold coins from defeated enemies.',
    effects: [
      { name: 'Gold Attraction', description: '+25% gold from combat.' },
    ],
    obtainMethods: [
      { type: 'shop', source: 'Willy', rate: 'Rare Stock' },
    ],
    seeAlso: ['willy'],
  },

  {
    slug: 'elemental-prism',
    name: 'Elemental Prism',
    category: 'items',
    itemType: 'Artifact',
    luckyNumber: 6,
    rarity: 'Rare',
    value: 300,
    element: 'Neutral',
    tier: 3,
    level: 15,
    image: '/assets/items/accessory/elemental-prism.svg',
    description: 'A crystalline prism that refracts elemental energy, boosting all damage types equally.',
    effects: [
      { name: 'Prismatic Boost', description: '+10% damage for all elements.' },
    ],
    obtainMethods: [
      { type: 'shop', source: 'Dr. Maxwell', rate: 'Rare Stock' },
    ],
    seeAlso: ['dr-maxwell'],
  },

  {
    slug: 'head-start',
    name: 'Head Start Badge',
    category: 'items',
    itemType: 'Artifact',
    luckyNumber: 1,
    rarity: 'Rare',
    value: 250,
    element: 'Neutral',
    tier: 3,
    level: 12,
    image: '/assets/items/accessory/head-start.svg',
    description: 'A badge that grants an immediate score bonus at the start of combat.',
    effects: [
      { name: 'Head Start', description: 'Start combat with 500 score.' },
    ],
    obtainMethods: [
      { type: 'shop', source: 'Any Wanderer Shop', rate: 'Rare Stock' },
    ],
  },

  {
    slug: 'dice-masters-gloves',
    name: "Dice Master's Gloves",
    category: 'items',
    itemType: 'Artifact',
    luckyNumber: 7,
    rarity: 'Epic',
    value: 500,
    element: 'Neutral',
    tier: 4,
    level: 25,
    image: '/assets/items/accessory/dice-masters-gloves.svg',
    description: 'Legendary gloves worn by master dice throwers. Greatly enhances throw capability and score potential.',
    effects: [
      { name: 'Master Throws', description: '+2 throws per combat.' },
      { name: 'Precision Grip', description: '+10% base score multiplier.' },
    ],
    obtainMethods: [
      { type: 'shop', source: 'Willy', rate: 'Legendary Stock' },
      { type: 'drop', source: 'Boss enemies', rate: 'Very Rare' },
    ],
    seeAlso: ['willy', 'king-james'],
  },

  {
    slug: 'merchants-blessing',
    name: "Merchant's Blessing",
    category: 'items',
    itemType: 'Artifact',
    luckyNumber: 5,
    rarity: 'Epic',
    value: 450,
    element: 'Neutral',
    tier: 4,
    level: 20,
    image: '/assets/items/accessory/merchants-blessing.svg',
    description: 'A blessing bestowed by the wandering merchants guild. Greatly enhances trading and gold acquisition.',
    effects: [
      { name: 'Trade Mastery', description: '+2 trades per combat.' },
      { name: 'Golden Touch', description: '+50% gold from combat.' },
    ],
    obtainMethods: [
      { type: 'shop', source: 'Willy', rate: 'Legendary Stock' },
    ],
    seeAlso: ['willy'],
  },
];
