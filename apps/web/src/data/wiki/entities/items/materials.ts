import type { Item } from '../../types';

/**
 * NDG Materials - All material-type items
 *
 * Includes: Crystals, Clusters, Salts, Gems, Essences, and crafting resources
 */

export const materials: Item[] = [
  // ============================================
  // ENRICHED MATERIALS (4 items)
  // ============================================

  // Void Crystal - Epic Material
  {
    slug: 'void-crystal',
    name: 'Void Crystal',
    category: 'items',
    luckyNumber: 1,
    rarity: 'Epic',
    itemType: 'Material',
    subtype: 'Crystal',
    image: '/assets/items/materials/void-crystal.svg',
    description: 'A crystallized fragment of the void, pulsing with unstable nothingness. Dr. Voss rates it at 93% existentially stable.',
    value: 275,
    effects: [
      { name: 'Void Resonance', description: 'Can be used to craft void-aligned equipment.' },
      { name: 'Reality Instability', description: 'Has a 7% chance to phase out of existence.' },
    ],
    obtainMethods: [
      { type: 'shop', source: 'void-research-lab', rate: '93% stable' },
      { type: 'shop', source: 'banco-de-bones', rate: 'Special Order' },
      { type: 'enemy', source: 'void-lord', location: 'null-providence', rate: '25%' },
    ],
    seeAlso: ['dr-voss', 'null-providence', 'essence-of-void'],
    element: 'Void',
    preferredDice: 4,
    level: 30,
    tier: 4,
    diceEffects: [
      { trigger: 'onMax', die: 4, effect: 'Phase Refine: Crafted item gains +1 tier quality' },
    ],
  },

  // Shadow Essence - Uncommon Material
  {
    slug: 'shadow-essence',
    name: 'Shadow Essence',
    category: 'items',
    itemType: 'Material',
    sprites: ['/assets/items/materials/shadow-essence.svg'],
    luckyNumber: 3,
    rarity: 'Uncommon',
    description: 'Concentrated darkness harvested from Shadow Keep. Essential for shadow-aligned crafting.',
    value: 40,
    effects: [
      { name: 'Dark Infusion', description: 'Used to enchant items with shadow properties.' },
    ],
    stats: [
      { label: 'Shadow Power', value: 40, max: 100 },
      { label: 'Purity', value: 50, max: 100 },
    ],
    obtainMethods: [
      { type: 'enemy', source: 'shadow-fiend', location: 'shadow-keep', rate: '25%' },
      { type: 'enemy', source: 'skeleton-knight', location: 'shadow-keep', rate: '15%' },
      { type: 'shop', source: 'banco-de-bones', rate: 'In Stock' },
    ],
    seeAlso: ['peter', 'shadow-keep'],
    element: 'Death',
    preferredDice: 8,
    tier: 2,
    level: 10,
    diceEffects: [
      { trigger: 'onRoll', die: 8, effect: 'Shadow Surge: Infusion potency scales with roll' },
    ],
  },

  // Ruby - Rare Material
  {
    slug: 'ruby',
    name: 'Ruby',
    category: 'items',
    itemType: 'Material',
    subtype: 'Gem',
    luckyNumber: 4,
    rarity: 'Rare',
    image: '/assets/items/materials/ruby.svg',
    description: 'A fiery red gem from Infernus. Robert prizes these for their inner flame.',
    value: 200,
    effects: [
      { name: 'Fire Socket', description: 'Adds +10 fire damage when socketed.' },
    ],
    stats: [
      { label: 'Fire Power', value: 50, max: 100 },
      { label: 'Purity', value: 80, max: 100 },
    ],
    obtainMethods: [
      { type: 'enemy', source: 'fire-imp', location: 'infernus', rate: '10%' },
      { type: 'chest', source: 'ruby-deposit', location: 'infernus', rate: '15%' },
    ],
    seeAlso: ['robert', 'infernus'],
    element: 'Fire',
    preferredDice: 10,
    tier: 3,
    level: 15,
    diceEffects: [
      { trigger: 'onMax', die: 10, effect: 'Flawless Cut: Socket bonus doubled' },
    ],
  },

  // Diamond - Epic Material
  {
    slug: 'diamond',
    name: 'Diamond',
    category: 'items',
    itemType: 'Material',
    subtype: 'Gem',
    sprites: ['/assets/items/materials/sapphire.svg'],
    luckyNumber: 6,
    rarity: 'Epic',
    description: "The rarest gem, formed under extreme pressure in Aberrant's chaotic depths. Channels luck itself when socketed.",
    value: 500,
    effects: [
      { name: 'Luck Channeling', description: 'Equipment socketed with diamond gains +10% critical chance.' },
      { name: 'Prismatic Reflection', description: 'Has a 5% chance to reflect incoming magic damage.' },
    ],
    stats: [
      { label: 'Purity', value: 100, max: 100 },
      { label: 'Luck Resonance', value: 85, max: 100 },
    ],
    obtainMethods: [
      { type: 'enemy', source: 'air-elemental', location: 'aberrant', rate: '8%' },
      { type: 'chest', source: 'diamond-deposit', location: 'aberrant', rate: '10%' },
      { type: 'shop', source: 'xtremes-xchange', rate: 'Roll d20 x 25' },
    ],
    seeAlso: ['jane', 'aberrant', 'xtreme'],
    element: 'Wind',
    preferredDice: 20,
    tier: 4,
    level: 30,
    diceEffects: [
      { trigger: 'onMax', die: 20, effect: 'Perfect Clarity: Prismatic effect guaranteed on craft' },
    ],
  },

  // ============================================
  // CRYSTALS & CLUSTERS (8 items - enriched)
  // ============================================

  {
    slug: 'ethereal-crystal',
    name: 'Ethereal Crystal',
    category: 'items',
    itemType: 'Material',
    subtype: 'Crystal',
    rarity: 'Uncommon',
    value: 75,
    element: 'Neutral',
    tier: 2,
    level: 15,
    image: '/assets/items/materials/ethereal-crystal.svg',
    description: 'A crystal from between dimensions. Useful for enchanting.',
    effects: [
      { name: 'Ethereal Infusion', description: 'Used to add ethereal properties to items.' },
    ],
    diceEffects: [
      { trigger: 'onMax', die: 6, effect: 'Stable Infusion: Enchantment success guaranteed' },
    ],
  },
  {
    slug: 'ethereal-cluster',
    name: 'Ethereal Cluster',
    category: 'items',
    itemType: 'Material',
    subtype: 'Crystal',
    rarity: 'Rare',
    value: 150,
    element: 'Neutral',
    tier: 3,
    level: 20,
    image: '/assets/items/materials/ethereal-crystal-cluster.svg',
    description: 'Multiple ethereal crystals grown together. More potent than singles.',
    effects: [
      { name: 'Major Ethereal Infusion', description: 'Used for high-tier ethereal enchantments.' },
    ],
    diceEffects: [
      { trigger: 'onMax', die: 6, effect: 'Cluster Resonance: Enchantment gains bonus effect' },
    ],
  },
  {
    slug: 'frost-crystal',
    name: 'Frost Crystal',
    category: 'items',
    itemType: 'Material',
    subtype: 'Crystal',
    rarity: 'Uncommon',
    value: 75,
    element: 'Ice',
    tier: 2,
    level: 15,
    image: '/assets/items/materials/frost-crystal.svg',
    description: 'A crystal of frozen time. Alice has a collection.',
    effects: [
      { name: 'Frost Infusion', description: 'Used to add ice properties to items.' },
    ],
    seeAlso: ['alice', 'frost-reach'],
    diceEffects: [
      { trigger: 'onMax', die: 12, effect: 'Frozen Perfect: Ice enchant gains slow effect' },
    ],
  },
  {
    slug: 'frost-cluster',
    name: 'Frost Cluster',
    category: 'items',
    itemType: 'Material',
    subtype: 'Crystal',
    rarity: 'Rare',
    value: 150,
    element: 'Ice',
    tier: 3,
    level: 20,
    image: '/assets/items/materials/frost-cluster.svg',
    description: 'A formation of frost crystals. Radiates cold.',
    effects: [
      { name: 'Major Frost Infusion', description: 'Used for high-tier ice enchantments.' },
    ],
    seeAlso: ['alice', 'frost-reach'],
    diceEffects: [
      { trigger: 'onMax', die: 12, effect: 'Absolute Zero: Ice enchant can freeze enemies solid' },
    ],
  },
  {
    slug: 'infernal-crystal',
    name: 'Infernal Crystal',
    category: 'items',
    itemType: 'Material',
    subtype: 'Crystal',
    rarity: 'Uncommon',
    value: 75,
    element: 'Fire',
    tier: 2,
    level: 15,
    image: '/assets/items/materials/infernal-crystal.svg',
    description: 'A crystal formed in the heart of Infernus. Warm to the touch.',
    effects: [
      { name: 'Fire Infusion', description: 'Used to add fire properties to items.' },
    ],
    seeAlso: ['robert', 'infernus'],
    diceEffects: [
      { trigger: 'onMax', die: 10, effect: 'Ember Flare: Fire enchant gains burn damage' },
    ],
  },
  {
    slug: 'infernal-cluster',
    name: 'Infernal Cluster',
    category: 'items',
    itemType: 'Material',
    subtype: 'Crystal',
    rarity: 'Rare',
    value: 150,
    element: 'Fire',
    tier: 3,
    level: 20,
    image: '/assets/items/materials/infernal-crystal-cluster.svg',
    description: 'Multiple infernal crystals merged by heat. Handle with care.',
    effects: [
      { name: 'Major Fire Infusion', description: 'Used for high-tier fire enchantments.' },
    ],
    seeAlso: ['robert', 'infernus'],
    diceEffects: [
      { trigger: 'onMax', die: 10, effect: 'Inferno Core: Fire enchant can cause explosions' },
    ],
  },
  {
    slug: 'void-cluster',
    name: 'Void Cluster',
    category: 'items',
    itemType: 'Material',
    subtype: 'Crystal',
    rarity: 'Epic',
    value: 300,
    element: 'Void',
    tier: 4,
    level: 25,
    image: '/assets/items/materials/void-cluster.svg',
    description: 'A cluster of void crystals. Dr. Voss is still trying to understand how they stay together.',
    effects: [
      { name: 'Major Void Infusion', description: 'Used for high-tier void enchantments.' },
    ],
    seeAlso: ['dr-voss', 'null-providence'],
    diceEffects: [
      { trigger: 'onMax', die: 4, effect: 'Void Harmony: Void enchant can phase through blocks' },
    ],
  },

  // ============================================
  // SALTS (4 items - enriched)
  // ============================================

  {
    slug: 'ethereal-salts',
    name: 'Ethereal Salts',
    category: 'items',
    itemType: 'Material',
    rarity: 'Uncommon',
    value: 50,
    element: 'Neutral',
    tier: 2,
    level: 10,
    image: '/assets/items/consumables/ethereal-salts.svg',
    description: 'Crystallized ethereal energy. Used in alchemy.',
    effects: [
      { name: 'Alchemy Base', description: 'Base material for ethereal potions.' },
    ],
    diceEffects: [
      { trigger: 'onMax', die: 6, effect: 'Pure Distillation: Potion gains +50% duration' },
    ],
  },
  {
    slug: 'frost-salts',
    name: 'Frost Salts',
    category: 'items',
    itemType: 'Material',
    rarity: 'Uncommon',
    value: 50,
    element: 'Ice',
    tier: 2,
    level: 10,
    image: '/assets/items/consumables/frost-salts.svg',
    description: 'Frozen salts from Frost Reach. Never melt.',
    effects: [
      { name: 'Cold Alchemy', description: 'Base material for ice-based concoctions.' },
    ],
    seeAlso: ['alice', 'frost-reach'],
    diceEffects: [
      { trigger: 'onMax', die: 12, effect: 'Cryo Catalyst: Ice potion gains freeze chance' },
    ],
  },
  {
    slug: 'infernal-salts',
    name: 'Infernal Salts',
    category: 'items',
    itemType: 'Material',
    rarity: 'Uncommon',
    value: 50,
    element: 'Fire',
    tier: 2,
    level: 10,
    image: '/assets/items/consumables/infernal-salts.svg',
    description: 'Salts from Infernus that retain their heat. Spicy.',
    effects: [
      { name: 'Fire Alchemy', description: 'Base material for fire-based concoctions.' },
    ],
    seeAlso: ['robert', 'infernus'],
    diceEffects: [
      { trigger: 'onMax', die: 10, effect: 'Volatile Mix: Fire potion deals area damage' },
    ],
  },
  {
    slug: 'void-salts',
    name: 'Void Salts',
    category: 'items',
    itemType: 'Material',
    rarity: 'Rare',
    value: 100,
    element: 'Void',
    tier: 3,
    level: 15,
    image: '/assets/items/consumables/void-salts.svg',
    description: 'Salts that shouldn\'t exist. Yet here they are.',
    effects: [
      { name: 'Void Alchemy', description: 'Base material for void-based concoctions.' },
    ],
    seeAlso: ['dr-voss', 'null-providence'],
    diceEffects: [
      { trigger: 'onMax', die: 4, effect: 'Paradox Brew: Void potion negates one debuff' },
    ],
  },

  // ============================================
  // GEMS (2 additional items - enriched)
  // ============================================

  {
    slug: 'amethyst',
    name: 'Amethyst',
    category: 'items',
    itemType: 'Material',
    subtype: 'Gem',
    rarity: 'Uncommon',
    value: 75,
    element: 'Void',
    tier: 2,
    level: 10,
    image: '/assets/items/materials/amethyst.svg',
    description: 'A purple gem with void affinity. Dr. Voss uses them for calibration.',
    effects: [
      { name: 'Void Socket', description: 'Adds +5 void damage when socketed.' },
    ],
    seeAlso: ['dr-voss', 'null-providence'],
    diceEffects: [
      { trigger: 'onMax', die: 4, effect: 'Calibrated: Socket bonus becomes +10 void damage' },
    ],
  },
  {
    slug: 'malachite',
    name: 'Malachite',
    category: 'items',
    itemType: 'Material',
    subtype: 'Gem',
    rarity: 'Uncommon',
    value: 60,
    element: 'Earth',
    tier: 2,
    level: 10,
    image: '/assets/items/materials/malachite.svg',
    description: 'A green gem infused with earth energy. John finds them calming.',
    effects: [
      { name: 'Earth Socket', description: 'Adds +5 earth defense when socketed.' },
    ],
    seeAlso: ['john', 'earth'],
    diceEffects: [
      { trigger: 'onMax', die: 6, effect: 'Grounded: Socket bonus becomes +10 earth defense' },
    ],
  },

  // ============================================
  // ESSENCES & RESOURCES (14 items - enriched)
  // ============================================

  {
    slug: 'ember-fragment',
    name: 'Ember Fragment',
    category: 'items',
    itemType: 'Material',
    rarity: 'Uncommon',
    value: 40,
    element: 'Fire',
    tier: 2,
    level: 10,
    image: '/assets/items/materials/ember-fragment.svg',
    description: 'A piece of eternal ember. Never goes out.',
    effects: [
      { name: 'Fire Component', description: 'Used in fire-aligned crafting.' },
    ],
    seeAlso: ['robert', 'infernus'],
    diceEffects: [
      { trigger: 'onMax', die: 10, effect: 'Eternal Flame: Crafted item gains permanent burn aura' },
    ],
  },
  {
    slug: 'essence-of-dark',
    name: 'Essence of Dark',
    category: 'items',
    itemType: 'Material',
    rarity: 'Rare',
    value: 150,
    element: 'Death',
    tier: 3,
    level: 20,
    image: '/assets/items/materials/essence-of-dark.svg',
    description: 'Pure concentrated darkness. Peter\'s favorite.',
    effects: [
      { name: 'Dark Core', description: 'Required for high-tier shadow equipment.' },
    ],
    seeAlso: ['peter', 'shadow-keep'],
    diceEffects: [
      { trigger: 'onRoll', die: 8, effect: 'Shadow Potency: Darkness scales with roll value' },
    ],
  },
  {
    slug: 'essence-of-void',
    name: 'Essence of Void',
    category: 'items',
    itemType: 'Material',
    sprites: ['/assets/items/materials/essence-of-void.svg'],
    rarity: 'Epic',
    value: 300,
    element: 'Void',
    tier: 4,
    level: 30,
    description: 'The pure essence of nothingness. Paradoxically, very valuable.',
    effects: [
      { name: 'Void Core', description: 'Required for legendary void equipment.' },
    ],
    seeAlso: ['the-one', 'null-providence'],
    diceEffects: [
      { trigger: 'onRoll', die: 4, effect: 'Void Potency: Nothingness scales with roll value' },
    ],
  },
  {
    slug: 'evo-catalyst',
    name: 'Evo Catalyst',
    category: 'items',
    itemType: 'Material',
    sprites: ['/assets/items/materials/evo-catalyst.svg'],
    rarity: 'Rare',
    value: 200,
    element: 'Neutral',
    tier: 3,
    level: 25,
    description: 'A catalyst that accelerates item evolution.',
    effects: [
      { name: 'Evolution', description: 'Used to upgrade equipment tier.' },
    ],
    diceEffects: [
      { trigger: 'onMax', die: 6, effect: 'Perfect Evolution: Item keeps all stats through upgrade' },
    ],
  },
  {
    slug: 'glowy-rock',
    name: 'Glowy Rock',
    category: 'items',
    itemType: 'Material',
    rarity: 'Common',
    value: 15,
    element: 'Neutral',
    tier: 1,
    level: 3,
    image: '/assets/items/consumables/glowy-rock.svg',
    description: 'A rock that glows. Science hasn\'t figured out why.',
    effects: [
      { name: 'Light Source', description: 'Can be used to light dark areas.' },
    ],
    diceEffects: [
      { trigger: 'onMax', die: 6, effect: 'Beacon: Light radius doubled' },
    ],
  },
  {
    slug: 'gold-pebble',
    name: 'Gold Pebble',
    category: 'items',
    itemType: 'Material',
    rarity: 'Common',
    value: 25,
    element: 'Neutral',
    tier: 1,
    level: 5,
    image: '/assets/items/materials/gold-pebble.svg',
    description: 'A small nugget of gold. Shiny.',
    effects: [
      { name: 'Currency Base', description: 'Can be smelted into gold coins.' },
    ],
    diceEffects: [
      { trigger: 'onMax', die: 6, effect: 'Pure Gold: Smelting yields double coins' },
    ],
  },
  {
    slug: 'shadow-shard',
    name: 'Shadow Shard',
    category: 'items',
    itemType: 'Material',
    rarity: 'Rare',
    value: 100,
    element: 'Death',
    tier: 3,
    level: 15,
    image: '/assets/items/materials/shadow-shard.svg',
    description: 'A shard of solidified shadow. Cuts light itself.',
    effects: [
      { name: 'Shadow Component', description: 'Used in shadow-aligned crafting.' },
    ],
    seeAlso: ['peter', 'shadow-keep'],
    diceEffects: [
      { trigger: 'onMax', die: 8, effect: 'Darkened: Crafted item gains stealth bonus' },
    ],
  },
  {
    slug: 'soul-charge',
    name: 'Soul Charge',
    category: 'items',
    itemType: 'Material',
    rarity: 'Rare',
    value: 150,
    element: 'Death',
    tier: 3,
    level: 20,
    image: '/assets/items/consumables/soul-charge.svg',
    description: 'A battery of captured soul energy. Ethically questionable.',
    effects: [
      { name: 'Soul Power', description: 'Powers soul-based equipment and abilities.' },
    ],
    seeAlso: ['peter', 'shadow-keep'],
    diceEffects: [
      { trigger: 'onRoll', die: 8, effect: 'Soul Surge: Energy output scales with roll' },
    ],
  },
  {
    slug: 'upgrade-core',
    name: 'Upgrade Core',
    category: 'items',
    itemType: 'Material',
    sprites: ['/assets/items/materials/upgrade-core.svg'],
    rarity: 'Rare',
    value: 200,
    element: 'Neutral',
    tier: 3,
    level: 20,
    description: 'A core used to upgrade equipment. Very handy.',
    effects: [
      { name: 'Upgrade', description: 'Increases equipment stats.' },
    ],
    diceEffects: [
      { trigger: 'onMax', die: 6, effect: 'Perfect Upgrade: Stat increase doubled' },
    ],
  },
  {
    slug: 'void-shard',
    name: 'Void Shard',
    category: 'items',
    itemType: 'Material',
    sprites: ['/assets/items/materials/void-cluster.svg'],
    rarity: 'Uncommon',
    value: 50,
    element: 'Void',
    tier: 2,
    level: 10,
    description: 'A small piece of the void. Handle with existential care.',
    effects: [
      { name: 'Void Component', description: 'Used in void-aligned crafting.' },
    ],
    seeAlso: ['dr-voss', 'null-providence'],
    diceEffects: [
      { trigger: 'onMax', die: 4, effect: 'Stable Fragment: No risk of phasing out during craft' },
    ],
  },
  {
    slug: 'void-lantern',
    name: 'Void Lantern',
    category: 'items',
    itemType: 'Material',
    sprites: ['/assets/items/materials/void-lantern.svg'],
    rarity: 'Rare',
    value: 150,
    element: 'Void',
    tier: 3,
    level: 20,
    description: 'A lantern that emits void light. Illuminates nothing, but reveals truth.',
    effects: [
      { name: 'Void Light', description: 'Reveals hidden objects and pathways.' },
    ],
    seeAlso: ['dr-voss', 'null-providence'],
    diceEffects: [
      { trigger: 'onMax', die: 4, effect: 'Deep Truth: Reveals secret doors and hidden loot' },
    ],
  },
  {
    slug: 'void-orb',
    name: 'Void Orb',
    category: 'items',
    itemType: 'Material',
    sprites: ['/assets/items/materials/void-orb.svg'],
    rarity: 'Epic',
    value: 350,
    element: 'Void',
    tier: 4,
    level: 30,
    description: 'A perfectly spherical concentration of void energy.',
    effects: [
      { name: 'Void Sphere', description: 'Required for crafting legendary void items.' },
    ],
    seeAlso: ['the-one', 'null-providence'],
    diceEffects: [
      { trigger: 'onMax', die: 4, effect: 'Perfect Void: Legendary craft gains unique void ability' },
    ],
  },
  {
    slug: 'corruption',
    name: 'Corruption',
    category: 'items',
    itemType: 'Material',
    sprites: ['/assets/items/materials/corruption.svg'],
    rarity: 'Rare',
    value: 150,
    element: 'Death',
    tier: 3,
    level: 20,
    description: 'Crystallized corruption. Handle with extreme caution.',
    effects: [
      { name: 'Corrupt', description: 'Adds corruption to items, increasing power but adding drawbacks.' },
    ],
    seeAlso: ['peter', 'shadow-keep'],
    diceEffects: [
      { trigger: 'onMax', die: 8, effect: 'Controlled Taint: Gain power without drawback' },
    ],
  },
  {
    slug: 'corruption-2-0',
    name: 'Corruption 2.0',
    category: 'items',
    itemType: 'Material',
    sprites: ['/assets/items/materials/corruption-2-0.svg'],
    rarity: 'Epic',
    value: 300,
    element: 'Death',
    tier: 4,
    level: 30,
    description: 'Advanced corruption. Now with 50% more existential dread.',
    effects: [
      { name: 'Major Corrupt', description: 'Significantly increases power with significant drawbacks.' },
    ],
    seeAlso: ['peter', 'shadow-keep'],
    diceEffects: [
      { trigger: 'onMax', die: 8, effect: 'Mastered Darkness: Major power with minor drawback' },
    ],
  },

  // ============================================
  // MISC MATERIALS (5 items - enriched)
  // ============================================

  {
    slug: 'audio-parts',
    name: 'Audio Parts',
    category: 'items',
    itemType: 'Material',
    sprites: ['/assets/items/materials/audio-parts.svg'],
    rarity: 'Uncommon',
    value: 30,
    element: 'Neutral',
    tier: 2,
    level: 5,
    description: 'Components for audio equipment. Boo G always needs more.',
    effects: [
      { name: 'Tech Component', description: 'Used to craft audio equipment.' },
    ],
    seeAlso: ['boo-g'],
    diceEffects: [
      { trigger: 'onMax', die: 6, effect: 'Quality Parts: Crafted audio has +1 tier quality' },
    ],
  },
  {
    slug: 'blood-bucket',
    name: 'Blood Bucket',
    category: 'items',
    itemType: 'Material',
    sprites: ['/assets/items/materials/bucket-of-blood.svg'],
    rarity: 'Uncommon',
    value: 40,
    element: 'Death',
    tier: 2,
    level: 8,
    description: 'A bucket of blood. Don\'t ask whose.',
    effects: [
      { name: 'Blood Component', description: 'Used in blood magic crafting.' },
    ],
    seeAlso: ['peter', 'shadow-keep'],
    diceEffects: [
      { trigger: 'onMax', die: 8, effect: 'Fresh Blood: Blood magic potency doubled' },
    ],
  },
  {
    slug: 'wet-sack',
    name: 'Wet Sack',
    category: 'items',
    itemType: 'Material',
    sprites: ['/assets/items/materials/wet-sack.svg'],
    rarity: 'Common',
    value: 5,
    element: 'Neutral',
    tier: 1,
    level: 1,
    description: 'A wet sack. Contains mysterious moisture.',
    effects: [
      { name: 'Water Source', description: 'Can be wrung out for water.' },
    ],
    diceEffects: [
      { trigger: 'onMax', die: 6, effect: 'Pure Water: Water extracted has healing properties' },
    ],
  },

  // ============================================
  // SHOP-EXCLUSIVE MATERIALS
  // ============================================

  // Death Shard - The Wandering Market (Dark/Mortality theme)
  {
    slug: 'death-shard',
    name: 'Death Shard',
    category: 'items',
    itemType: 'Material',
    subtype: 'Crystal',
    sprites: ['/assets/items/materials/shadow-shard.svg'],
    luckyNumber: 3,
    rarity: 'Epic',
    value: 400,
    element: 'Death',
    tier: 4,
    level: 30,
    description: "A crystallized fragment of mortality itself, harvested from the boundary between life and death. Willy found these in a place he refuses to name. Essential for crafting items that blur the line between living and dead.",
    effects: [
      { name: 'Mortality Essence', description: 'Used to craft death-aspected legendary equipment.' },
      { name: 'Life Echo', description: 'While held, gain 5% life steal on all attacks.' },
      { name: 'Memento', description: 'Slightly increases experience gained from defeating enemies.' },
    ],
    stats: [
      { label: 'Death Power', value: 85, max: 100 },
      { label: 'Purity', value: 70, max: 100 },
    ],
    obtainMethods: [
      { type: 'shop', source: 'the-wandering-market', rate: 'Rare Stock' },
      { type: 'enemy', source: 'void-lord', location: 'null-providence', rate: '15%' },
    ],
    seeAlso: ['willy', 'peter', 'shadow-keep', 'dimensional-blade', 'soul-jar'],
    diceEffects: [
      { trigger: 'onMax', die: 8, effect: 'Mortality Link: Crafted item gains lifesteal' },
    ],
  },

  // Time Crystal - Frost Reach (Ice/Time theme)
  {
    slug: 'time-crystal',
    name: 'Time Crystal',
    category: 'items',
    itemType: 'Material',
    subtype: 'Crystal',
    sprites: ['/assets/items/materials/frost-crystal.svg'],
    luckyNumber: 5,
    rarity: 'Epic',
    value: 450,
    element: 'Ice',
    tier: 4,
    level: 32,
    description: "A crystal that contains a frozen moment in time. Alice cultivates these in Frost Reach's deepest temporal gardens. Looking into one, you can see echoes of moments that haven't happened yet.",
    effects: [
      { name: 'Temporal Infusion', description: 'Used to craft time-aspected legendary equipment.' },
      { name: 'Moment Frozen', description: 'While held, +10% cooldown reduction on all abilities.' },
      { name: 'Prescience', description: 'Occasionally glimpse enemy attack patterns before they happen.' },
    ],
    stats: [
      { label: 'Temporal Power', value: 90, max: 100 },
      { label: 'Purity', value: 95, max: 100 },
    ],
    obtainMethods: [
      { type: 'shop', source: 'frost-reach', rate: 'Domain Exclusive' },
      { type: 'chest', source: 'temporal-cache', location: 'frost-reach', rate: '8%' },
    ],
    seeAlso: ['alice', 'frost-reach', 'chrono-dagger', 'chrono-bomb'],
    diceEffects: [
      { trigger: 'onMax', die: 12, effect: 'Frozen Moment: Crafted item gains cooldown reduction' },
    ],
  },

  // Soul Jar - The Wandering Market (Necromantic/Spirit theme)
  {
    slug: 'soul-jar',
    name: 'Soul Jar',
    category: 'items',
    itemType: 'Material',
    isElite: true,
    sprites: ['/assets/items/consumables/soul-charge.svg'],
    luckyNumber: 3,
    rarity: 'Epic',
    value: 500,
    element: 'Death',
    tier: 4,
    level: 35,
    description: "A sealed vessel containing captured soul energy. Willy acquires these through 'arrangements' he won't discuss. The souls inside whisper secrets to those who listen - whether you want them to or not.",
    effects: [
      { name: 'Soul Repository', description: 'Used to craft soul-powered legendary equipment.' },
      { name: 'Whispers', description: 'While held, occasionally receive cryptic hints about nearby secrets.' },
      { name: 'Soul Surge', description: 'Can be consumed to fully restore mana/energy.' },
    ],
    stats: [
      { label: 'Soul Power', value: 95, max: 100 },
      { label: 'Containment', value: 80, max: 100 },
    ],
    obtainMethods: [
      { type: 'shop', source: 'the-wandering-market', rate: 'Special Arrangement' },
      { type: 'enemy', source: 'skeleton-knight', location: 'shadow-keep', rate: '5%' },
    ],
    seeAlso: ['willy', 'peter', 'shadow-keep', 'dimensional-blade', 'death-shard', 'mr-bones'],
    diceEffects: [
      { trigger: 'onRoll', die: 8, effect: 'Soul Whisper: Crafting insight scales with roll' },
    ],
  },

  // Bone Dust - Common Material
  {
    slug: 'bone-dust',
    name: 'Bone Dust',
    category: 'items',
    sprites: ['/assets/items/materials/bone-dust.svg'],
    luckyNumber: 3,
    rarity: 'Common',
    itemType: 'Material',
    subtype: 'Powder',
    description: 'Fine powder ground from the bones of the undead. A staple crafting material in Shadow Keep, used in potions, enchantments, and various necromantic recipes.',
    value: 5,
    element: 'Death',
    tier: 1,
    level: 1,
    effects: [
      { name: 'Necromantic Base', description: 'Common ingredient in death-aligned crafting.' },
    ],
    stats: [
      { label: 'Purity', value: 30, max: 100 },
    ],
    obtainMethods: [
      { type: 'enemy', source: 'skeleton-archer', location: 'shadow-keep', rate: '60%' },
      { type: 'enemy', source: 'skeleton-barb', location: 'shadow-keep', rate: '40%' },
      { type: 'enemy', source: 'skeleton-knight', location: 'shadow-keep', rate: '50%' },
    ],
    seeAlso: ['peter', 'shadow-keep', 'mr-bones'],
  },

  // Cursed Finger Bone - Uncommon Material (crafting component)
  {
    slug: 'cursed-finger-bone',
    name: 'Cursed Finger Bone',
    category: 'items',
    sprites: ['/assets/items/consumables/cursed-finger.svg'],
    luckyNumber: 3,
    rarity: 'Uncommon',
    itemType: 'Material',
    subtype: 'Body Part',
    description: 'A skeletal finger still twitching with residual curse energy. Collectors prize these macabre digits for their potent magical properties.',
    value: 25,
    element: 'Death',
    tier: 2,
    level: 10,
    effects: [
      { name: 'Curse Conduit', description: 'Used to craft curse-inflicting equipment.' },
      { name: 'Twitchy', description: 'Points toward nearby hidden treasures occasionally.' },
    ],
    stats: [
      { label: 'Curse Power', value: 45, max: 100 },
    ],
    obtainMethods: [
      { type: 'enemy', source: 'skeleton-knight', location: 'shadow-keep', rate: '15%' },
    ],
    seeAlso: ['peter', 'shadow-keep', 'skeleton-knight'],
  },
];
