// Wiki Entity Types for NDG26

import type { BaseStats, StatModifier } from '../stats/types';

// Categories
export type WikiCategory =
  | 'travelers'
  | 'enemies'
  | 'items'
  | 'domains'
  | 'shops'
  | 'pantheon'
  | 'wanderers'
  | 'trophies'
  | 'factions';

// Rarity levels
export type Rarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary' | 'Unique';

// Difficulty levels
export type Difficulty = 'Easy' | 'Normal' | 'Hard' | 'Extreme';

// Lucky Die - ties to Die-rector, Domain, Element alliance system
// 'none' = no patron, 'all' = Board Room (legendary unlock)
export type LuckyDie = 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20' | 'none' | 'all';

// Legacy lucky number (0-7) - kept for data compatibility, UI uses luckyDie
export type LuckyNumber = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

// Item subtypes
export type ItemType = 'Weapon' | 'Armor' | 'Consumable' | 'Material' | 'Quest' | 'Artifact' | 'Currency';

// Enemy types
export type EnemyType = 'Normal' | 'Elite' | 'Boss' | 'Miniboss';

// Element types tied to dice/Die-rectors
// Element advantage wheel: Void → Earth → Death → Fire → Ice → Wind → Void
export type Element = 'Void' | 'Earth' | 'Death' | 'Fire' | 'Ice' | 'Wind' | 'Neutral';

// Die sides type (matches dice config)
export type DieSides = 4 | 6 | 8 | 10 | 12 | 20;

// Encounter types for domain runs
export type EncounterType = 'combat' | 'elite' | 'boss' | 'shop' | 'rest' | 'event' | 'treasure';

// Time of day periods for market availability (4 periods, 6 hours each)
// Dawn: 6am-12pm, Day: 12pm-6pm, Dusk: 6pm-12am, Night: 12am-6am
export type TimeOfDay = 'dawn' | 'day' | 'dusk' | 'night';

// Market NPC types - vendors sell, others provide services/relationships
export type MarketNpcType = 'vendor' | 'traveler' | 'wanderer';

// Market availability configuration
export interface MarketAvailability {
  always?: boolean;           // 24/7 availability (overrides times)
  times?: TimeOfDay[];        // Which time periods they appear
  days?: number[];            // Days of week (0-6, Sunday=0) for weekly rotation
  chance?: number;            // 1-100% chance to appear when available
  requiresQuest?: string;     // Quest slug required to unlock
}

// Market position for Space Jam style layout
export interface MarketPosition {
  x: string;  // CSS percentage (e.g., '25%')
  y: string;  // CSS percentage (e.g., '50%')
}

// Base entity interface - all types extend this
export interface WikiEntity {
  slug: string;
  name: string;
  category: WikiCategory;
  luckyDie?: LuckyDie;           // Die-rector alliance (d4=The One, d6=John, etc.)
  luckyNumber?: LuckyNumber;     // Legacy (0-7) - kept for data compatibility, UI uses luckyDie
  species?: string;              // Legacy - kept for data compatibility, not displayed in UI
  birthday?: string;             // Legacy - kept for data compatibility, not displayed in UI
  rarity?: Rarity;
  image?: string;
  portrait?: string; // Main wiki image (for characters)
  sprites?: string[]; // Sprite variants (for characters)
  description?: string;
  seeAlso?: string[]; // Related entity slugs
}

// Traveler (playable character)
export interface Traveler extends WikiEntity {
  category: 'travelers';
  origin?: string;
  playStyle?: string;
  availability?: 'Starter' | 'Unlockable' | 'Premium';

  // Invisible dice-themed stats (Luck, Essence, Grit, Shadow, Fury, Resilience, Swiftness)
  baseStats?: BaseStats;

  startingLoadout?: string[]; // Item slugs
  abilities?: Ability[];

  // Market presence (when they appear in the market square)
  marketPosition?: MarketPosition;
  marketAvailability?: MarketAvailability;
  marketRole?: string; // What they do in the market (tips, quests, etc.)
}

// Enemy
export interface Enemy extends WikiEntity {
  category: 'enemies';
  enemyType?: EnemyType;
  hp?: number | string;
  damage?: string;
  defense?: number;
  speed?: number;
  domain?: string; // Domain slug
  locations?: string[]; // Domain slugs where found
  abilities?: Ability[];
  drops?: Drop[];
  phases?: Phase[];
  weaknesses?: string[];
  resistances?: string[];

  // Combat stats (numeric for calculations)
  baseHp?: number;
  baseDamage?: number;
  baseDefense?: number;
  baseSpeed?: number;

  // Invisible dice-themed stats (optional for stat-based enemies)
  baseStats?: Partial<BaseStats>;

  // Dice affinity
  element?: Element;
  preferredDice?: DieSides;
  weakToDice?: DieSides[];
  resistantToDice?: DieSides[];

  // Encounter data
  level?: number;
  encounterWeight?: number; // Spawn probability 1-100
  minFloor?: number;
  maxFloor?: number;

  // Loot modifiers
  lootTable?: LootEntry[];
}

// Item
export interface Item extends WikiEntity {
  category: 'items';
  itemType?: ItemType;
  subtype?: string;
  value?: number | string;
  effects?: Effect[];
  stats?: Stat[];              // Display stats for wiki UI
  statModifiers?: StatModifier[]; // Invisible stat modifiers for gameplay
  obtainMethods?: ObtainMethod[];
  craftingRecipe?: CraftingRecipe;
  usedIn?: string[]; // Item slugs this is used to craft

  // Dice affinity
  element?: Element;
  preferredDice?: DieSides;

  // Combat relevance
  level?: number;
  tier?: 1 | 2 | 3 | 4 | 5 | 6;

  // Dice-based effects
  diceEffects?: DiceEffect[];

  // Domain-scoped inventory: items expire on domain clear unless they persist
  // Legendary/Unique/Epic always persist. Rare items need this flag set to true.
  persistsAcrossDomains?: boolean;
}

// Domain (game world/location)
export interface Domain extends WikiEntity {
  category: 'domains';
  door?: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  dieRector?: string; // Pantheon slug (or 'all' for Board Room)
  element?: Element;
  difficulty?: Difficulty;
  levelRange?: string;
  region?: string; // Parent region name
  requirements?: string; // Unlock requirements
  enemies?: string[]; // Enemy slugs
  items?: string[]; // Item slugs found here
  npcs?: string[]; // Wanderer/Shop slugs
  connectedAreas?: ConnectedArea[];
  quests?: Quest[];

  // Dice mechanics
  preferredDice?: DieSides;
  dicePool?: DieSides[];
  diceBias?: number; // 1-100, how often preferred die appears

  // Run structure
  floors?: number;
  encounterTypes?: EncounterType[];
  bossFloors?: number[];

  // Flume portal data (merged from flumes category)
  flume?: {
    name: string;
    video?: string;
    requirements?: string[];
    cost?: string;
  };
}


// Shop (merchant vendor)
export interface Shop extends WikiEntity {
  category: 'shops';
  proprietor?: string; // Wanderer slug who runs the shop
  location?: string; // Domain slug (null for mobile shops)
  travelPattern?: string[]; // Domain slugs for mobile vendors
  specialty?: string;
  inventory?: InventoryItem[];
  schedule?: string;
  position?: MarketPosition; // Market square position (percentage-based)
  availability?: MarketAvailability; // When this vendor appears
}

// Pantheon (Die-rector / divine being)
export interface Pantheon extends WikiEntity {
  category: 'pantheon';
  domain?: string; // Domain slug they control
  door?: 1 | 2 | 3 | 4 | 5 | 6;
  element?: string;
  role?: string;
  favorEffects?: FavorEffect[];
  corruptionEffects?: string[];
  dialogue?: string[];
  // Invisible dice-themed stats (divine power levels)
  baseStats?: BaseStats;
}

// Wanderer (mobile NPC)
export interface Wanderer extends WikiEntity {
  category: 'wanderers';
  role?: string;
  origin?: string;
  locations?: string[]; // Domain slugs
  services?: string[];
  dialogue?: string[];

  // Market presence (when they appear in the market square)
  marketPosition?: MarketPosition;
  marketAvailability?: MarketAvailability;
}

// Trophy (achievement)
export interface Trophy extends WikiEntity {
  category: 'trophies';
  unlockCondition?: string;
  reward?: string;
  difficulty?: Difficulty;
  progress?: {
    current?: number;
    target?: number;
  };
}

// Faction (gameplay teams for 1v1 and arena modes)
export interface Faction extends WikiEntity {
  category: 'factions';
  motto?: string;
  founder?: string; // Pantheon or Traveler slug
  homeBase?: string; // Domain slug
  element?: Element;
  members?: string[]; // Traveler/Wanderer slugs
  rivals?: string[]; // Faction slugs
  allies?: string[]; // Faction slugs
  bonuses?: string[]; // Gameplay bonuses when playing as this faction
  lore?: string;
}

// Supporting types

export interface Ability {
  name: string;
  damage?: string;
  type?: string;
  cooldown?: string;
  description?: string;
}

export interface Drop {
  item: string; // Item slug
  rate: number; // Percentage
  rarity?: Rarity;
}

export interface Phase {
  phase: number;
  name: string;
  healthRange: string;
  description?: string;
  abilities?: string[];
}

export interface Effect {
  name: string;
  description: string;
}

export interface Stat {
  label: string;
  value: number;
  max?: number;
}

export interface ObtainMethod {
  type: 'enemy' | 'shop' | 'quest' | 'craft' | 'chest' | 'event' | 'starter' | 'drop';
  source: string; // Entity slug
  location?: string;
  rate?: string;
}

export interface CraftingRecipe {
  materials: { item: string; quantity: number }[];
  station?: string;
}

export interface ConnectedArea {
  area: string; // Domain slug
  direction?: string;
  levelRange?: string;
}

export interface Quest {
  name: string;
  type: 'Main' | 'Side' | 'Daily' | 'Event';
  reward?: string;
}

export interface InventoryItem {
  item: string; // Item slug
  price: number | string;
  stock?: number | string; // Number, 'Unlimited', 'Limited', 'In Stock', etc.
}

export interface FavorEffect {
  roll: 1 | 2 | 3 | 4 | 5 | 6;
  effect: string;
}

// Loot entry for probabilistic drops
export interface LootEntry {
  item: string;
  baseRate: number; // Base drop % (1-100)
  bonusDice?: DieSides; // Die that boosts this drop
  bonusMultiplier?: number; // Multiplier when bonus die used
}

// Effect that triggers based on dice
export interface DiceEffect {
  trigger: 'onRoll' | 'onMax' | 'onMin' | 'onMatch';
  die?: DieSides;
  effect: string;
  value?: number;
}

// Union type for any entity
export type AnyEntity = Traveler | Enemy | Item | Domain | Shop | Pantheon | Wanderer | Trophy | Faction;
