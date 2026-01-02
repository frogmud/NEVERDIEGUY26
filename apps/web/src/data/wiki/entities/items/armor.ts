import type { Item } from '../../types';

/**
 * NDG Armor - All armor-type items
 *
 * Includes: Shields, Boots, Helmets, Chestplates, Capes
 */

export const armor: Item[] = [
  // ============================================
  // ENRICHED ARMOR (1 item)
  // ============================================

  // Iron Boots - Uncommon Armor
  {
    slug: 'iron-boots',
    name: 'Iron Boots',
    category: 'items',
    itemType: 'Armor',
    subtype: 'Boots',
    luckyNumber: 2,
    rarity: 'Uncommon',
    image: '/assets/items/armor/iron-boots.svg',
    description: 'Sturdy boots reinforced with iron plates. Heavy but protective.',
    value: 100,
    effects: [
      { name: 'Grounded', description: 'Cannot be knocked back by weak attacks.' },
    ],
    stats: [
      { label: 'Defense', value: 18, max: 50 },
      { label: 'Weight', value: 60, max: 100 },
    ],
    obtainMethods: [
      { type: 'shop', source: 'command-and-supply', rate: 'In Stock' },
      { type: 'enemy', source: 'skeleton-warrior', location: 'earth', rate: '12%' },
      { type: 'craft', source: 'blacksmith' },
    ],
    seeAlso: ['john', 'earth'],
    element: 'Earth',
    preferredDice: 6,
    tier: 2,
    level: 8,
    diceEffects: [
      { trigger: 'onMax', die: 6, effect: 'Immovable: Immune to knockback for 3 seconds' },
    ],
  },

  // ============================================
  // SKELETON ARMOR (10 items - enriched)
  // ============================================

  // --- SHIELDS ---
  {
    slug: 'wooden-shield',
    name: 'Wooden Shield',
    category: 'items',
    itemType: 'Armor',
    subtype: 'Shield',
    rarity: 'Common',
    value: 25,
    element: 'Neutral',
    tier: 1,
    level: 1,
    image: '/assets/items/weapons/shield-homemade.svg',
    description: 'A basic wooden shield. Better than nothing.',
    effects: [
      { name: 'Block', description: 'Reduces incoming damage by 10%.' },
    ],
    diceEffects: [
      { trigger: 'onMax', die: 6, effect: 'Perfect Block: Negate all damage from one attack' },
    ],
  },
  {
    slug: 'turtle-shell',
    name: 'Turtle Shell',
    category: 'items',
    itemType: 'Armor',
    subtype: 'Shield',
    rarity: 'Uncommon',
    value: 60,
    element: 'Earth',
    tier: 2,
    level: 8,
    image: '/assets/items/armor/turtle-shell.svg',
    description: 'A shell repurposed as a shield. The turtle was already done with it.',
    effects: [
      { name: 'Shell Defense', description: 'Crouch to gain +50% damage reduction.' },
    ],
    seeAlso: ['john', 'earth'],
    diceEffects: [
      { trigger: 'onMax', die: 6, effect: 'Turtle Time: Become invulnerable while crouching for 2 seconds' },
    ],
  },
  {
    slug: 'heavy-shield',
    name: 'Heavy Shield',
    category: 'items',
    itemType: 'Armor',
    subtype: 'Shield',
    rarity: 'Uncommon',
    value: 80,
    element: 'Earth',
    tier: 2,
    level: 10,
    image: '/assets/items/weapons/shield-heavy.svg',
    description: 'A reinforced iron shield. Slow to raise but hard to break.',
    effects: [
      { name: 'Fortress', description: 'Block incoming projectiles completely while raised.' },
    ],
    seeAlso: ['the-general'],
    diceEffects: [
      { trigger: 'onMax', die: 6, effect: 'Shield Bash: Stun attacker when blocking' },
    ],
  },

  // --- BOOTS ---
  {
    slug: 'sneakers',
    name: 'Sneakers',
    category: 'items',
    itemType: 'Armor',
    subtype: 'Boots',
    rarity: 'Common',
    value: 30,
    element: 'Neutral',
    tier: 1,
    level: 1,
    image: '/assets/items/armor/sneakers.svg',
    description: 'Comfortable everyday footwear. Good for running away.',
    effects: [
      { name: 'Sprint', description: '+5% movement speed.' },
    ],
    diceEffects: [
      { trigger: 'onMax', die: 6, effect: 'Quick Escape: Burst of speed when hit' },
    ],
  },
  {
    slug: 'hero-boots',
    name: 'Hero Boots',
    category: 'items',
    itemType: 'Armor',
    subtype: 'Boots',
    rarity: 'Rare',
    value: 200,
    element: 'Neutral',
    tier: 3,
    level: 20,
    image: '/assets/items/armor/hero-boots.svg',
    description: 'Boots worn by legendary heroes. Look good, feel powerful.',
    effects: [
      { name: 'Heroic Stride', description: '+15% movement speed.' },
      { name: 'Sure-Footed', description: 'Immune to slippery terrain.' },
    ],
    diceEffects: [
      { trigger: 'onMax', die: 6, effect: 'Heroic Leap: Jump distance doubled' },
    ],
  },
  {
    slug: 'rocket-boots',
    name: 'Rocket Boots',
    category: 'items',
    itemType: 'Armor',
    subtype: 'Boots',
    rarity: 'Epic',
    value: 400,
    element: 'Fire',
    tier: 4,
    level: 30,
    image: '/assets/items/armor/rocket-boots.svg',
    description: 'Boots with built-in thrusters. Robert helped with the fire part.',
    effects: [
      { name: 'Jet Boost', description: 'Double jump available.' },
      { name: 'Hover', description: 'Hold jump to hover briefly.' },
    ],
    seeAlso: ['robert', 'infernus'],
    diceEffects: [
      { trigger: 'onMax', die: 10, effect: 'Afterburner: Leave fire trail that damages enemies' },
    ],
  },

  // --- CHESTPLATE ---
  {
    slug: 'spiked-vest',
    name: 'Spiked Vest',
    category: 'items',
    itemType: 'Armor',
    subtype: 'Chestplate',
    rarity: 'Uncommon',
    value: 100,
    element: 'Neutral',
    tier: 2,
    level: 10,
    image: '/assets/items/armor/spiked-vest.svg',
    description: 'A vest covered in metal spikes. Hugging not recommended.',
    effects: [
      { name: 'Thorns', description: 'Melee attackers take 5 damage.' },
    ],
    diceEffects: [
      { trigger: 'onMax', die: 6, effect: 'Spike Burst: Thorns damage tripled for 3 seconds' },
    ],
  },

  // --- HELMET ---
  {
    slug: 'hero-helm',
    name: 'Hero Helm',
    category: 'items',
    itemType: 'Armor',
    subtype: 'Helmet',
    rarity: 'Rare',
    value: 200,
    element: 'Neutral',
    tier: 3,
    level: 20,
    image: '/assets/items/armor/hero-helmet.svg',
    description: 'A helmet that makes you look heroic. Also protects your head.',
    effects: [
      { name: 'Clear Vision', description: 'Immune to blind effects.' },
    ],
    diceEffects: [
      { trigger: 'onMax', die: 6, effect: 'Eagle Eye: Reveal hidden enemies nearby' },
    ],
  },

  // --- CAPE & MISC ---
  {
    slug: 'hero-cape',
    name: 'Hero Cape',
    category: 'items',
    itemType: 'Armor',
    rarity: 'Rare',
    value: 200,
    element: 'Neutral',
    tier: 3,
    level: 20,
    image: '/assets/items/armor/hero-cape.svg',
    description: 'A flowing cape that billows dramatically. No practical benefit, maximum style.',
    effects: [
      { name: 'Dramatic Entry', description: 'First attack in combat deals +10% damage.' },
    ],
    diceEffects: [
      { trigger: 'onMax', die: 6, effect: 'Grand Entrance: First attack deals double damage' },
    ],
  },
  {
    slug: 'hero-holster',
    name: 'Hero Holster',
    category: 'items',
    itemType: 'Armor',
    rarity: 'Rare',
    value: 150,
    element: 'Neutral',
    tier: 3,
    level: 18,
    image: '/assets/items/armor/hero-holster.svg',
    description: 'A utility holster for quick weapon access.',
    effects: [
      { name: 'Quick Draw', description: 'Swap weapons 20% faster.' },
    ],
    diceEffects: [
      { trigger: 'onMax', die: 6, effect: 'Flash Swap: Instant weapon swap with bonus attack' },
    ],
  },

  // ============================================
  // SHOP-EXCLUSIVE ARMOR
  // ============================================

  // Royal Cloak of Duality - Null Throne Emporium (Royal/Duality theme)
  {
    slug: 'royal-cloak-of-duality',
    name: 'Royal Cloak of Duality',
    category: 'items',
    itemType: 'Armor',
    subtype: 'Cape',
    luckyNumber: 2,
    rarity: 'Legendary',
    value: 2000,
    element: 'Void',
    tier: 5,
    level: 45,
    image: '/assets/items/armor/hero-cape.svg',
    description: "King James' ceremonial cloak, woven from threads of existence and non-existence. One side protects, the other negates. The duality of the Null Throne made manifest.",
    effects: [
      { name: 'Dual Nature', description: 'Toggle between Defense Mode (+50% damage reduction) and Negation Mode (+50% damage dealt).' },
      { name: 'Royal Presence', description: 'Enemies are 20% less likely to target you.' },
      { name: 'Null Shield', description: 'Once per battle, completely negate one attack.' },
    ],
    stats: [
      { label: 'Defense', value: 85, max: 100 },
      { label: 'Void Power', value: 90, max: 100 },
    ],
    statModifiers: [
      { stat: 'resilience', flat: 30, source: 'royal-cloak-of-duality' },
      { stat: 'essence', flat: 25, source: 'royal-cloak-of-duality' },
    ],
    obtainMethods: [
      { type: 'shop', source: 'null-throne-emporium', rate: 'Royal Exclusive' },
    ],
    seeAlso: ['king-james', 'null-providence', 'the-one'],
    diceEffects: [
      { trigger: 'onMax', die: 4, effect: 'Duality Shift: Instantly switch modes with bonus effect', value: 1 },
    ],
  },
];
