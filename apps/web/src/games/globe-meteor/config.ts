/**
 * Globe Meteor Game Configuration
 *
 * Central configuration for the 3D globe-based meteor dice game.
 * NEVER DIE GUY
 */

// Globe visual settings
export const GLOBE_CONFIG = {
  radius: 5,
  segments: 64, // Higher = smoother sphere
  rotationSpeed: 0.001, // Passive rotation when idle

  // Camera defaults
  camera: {
    initialDistance: 15,
    minDistance: 8,
    maxDistance: 30,
    fov: 60,
  },

  // Lighting
  lighting: {
    ambient: 0.3,
    sunIntensity: 1.2,
    sunPosition: [10, 10, 10] as [number, number, number],
  },
};

// Domain planet configuration - size and color based on die association
// d4=smallest (Null Providence) → d20=largest (Aberrant)
export const DOMAIN_PLANET_CONFIG: Record<
  number,
  {
    scale: number;
    color: string;
    glowColor: string;
    element: string;
    die: number;
    name: string;
  }
> = {
  1: {
    scale: 0.6,
    color: '#1a1a2e',
    glowColor: '#4a4a6e',
    element: 'Void',
    die: 4,
    name: 'Null Providence',
  },
  2: {
    scale: 0.8,
    color: '#4a6741',
    glowColor: '#7a9771',
    element: 'Earth',
    die: 6,
    name: 'Earth',
  },
  3: {
    scale: 0.9,
    color: '#2d2d44',
    glowColor: '#5d5d74',
    element: 'Death',
    die: 8,
    name: 'Shadow Keep',
  },
  4: {
    scale: 1.0,
    color: '#8b2500',
    glowColor: '#bb5530',
    element: 'Fire',
    die: 10,
    name: 'Infernus',
  },
  5: {
    scale: 1.2,
    color: '#4a90a4',
    glowColor: '#7ac0d4',
    element: 'Ice',
    die: 12,
    name: 'Frost Reach',
  },
  6: {
    scale: 1.4,
    color: '#6b5b95',
    glowColor: '#9b8bc5',
    element: 'Wind',
    die: 20,
    name: 'Aberrant',
  },
};

// NPC configuration for globe surface
export const NPC_CONFIG = {
  // Spawn settings
  minNPCs: 10,
  maxNPCs: 50,

  // Size based on rarity
  markerSize: {
    common: 0.15,
    uncommon: 0.2,
    rare: 0.25,
    legendary: 0.35,
  },

  // Colors (from NDG theme)
  colors: {
    common: '#90a4ae', // Gray
    uncommon: '#4caf50', // Green
    rare: '#2196f3', // Blue
    legendary: '#ffc107', // Gold
  },

  // Rarity weights for spawning
  rarityWeights: {
    common: 0.6,
    uncommon: 0.25,
    rare: 0.12,
    legendary: 0.03,
  },

  // Score multipliers
  scoreMultiplier: {
    common: 10,
    uncommon: 25,
    rare: 75,
    legendary: 200,
  },

  // Movement settings
  movement: {
    baseSpeed: {
      common: 0.3,
      uncommon: 0.25,
      rare: 0.2,
      legendary: 0.15,
    },
    directionChangeInterval: 2000, // ms before picking new direction
    wanderRadius: 15, // max degrees from spawn point
  },
};

// Combo detection settings
export const COMBO_CONFIG = {
  timeWindow: 1500, // ms window to chain hits
  proximityBonus: 1.5, // multiplier for hits within proximity radius
  proximityRadius: 1.0, // surface distance for proximity bonus
  chainMultiplier: 0.25, // additional multiplier per chain length
  comboTypes: {
    double: { minHits: 2, multiplier: 1.5 },
    triple: { minHits: 3, multiplier: 2.0 },
    mega: { minHits: 5, multiplier: 3.0 },
    ultra: { minHits: 8, multiplier: 5.0 },
  },
};

// Meteor settings
export const METEOR_CONFIG = {
  // Visual
  size: 0.3,
  trailLength: 20,
  color: '#ff1744', // Pinky red (NDG primary)
  glowColor: '#ff5722',

  // Physics - faster for snappy tracer feel
  speed: 0.5, // Base speed (modified by die type)
  impactRadius: 1.6, // Damage radius on globe surface (2x for visibility)
  arcHeight: 0, // No arc - straight shots

  // Effects - faster for snappier feel
  explosionDuration: 700, // ms (was 1000)
  shockwaveSpeed: 2,
  cameraShakeIntensity: 0.05, // Reduced shake
};

// Target reticle
export const RETICLE_CONFIG = {
  innerRadius: 0.3,
  outerRadius: 0.5,
  color: '#00e5ff', // Cyan (eternal)
  pulseSpeed: 2,
};

// Dice to meteor mapping (extends existing mechanics)
export const DICE_METEOR_MAP = {
  d4: { meteorCount: (roll: number) => roll, spread: 0.5 },
  d6: { meteorCount: (roll: number) => roll, spread: 0.6 },
  d8: { meteorCount: (roll: number) => roll, spread: 0.7 },
  d10: { meteorCount: (roll: number) => roll, spread: 0.8 },
  d12: { meteorCount: (roll: number) => roll, spread: 0.9 },
  d20: { meteorCount: (roll: number) => roll, spread: 1.2 },
};

// Dice effect differentiation - each die type has unique meteor behavior
export type DieEffectType = 'precision' | 'standard' | 'piercing' | 'cluster' | 'heavy' | 'cataclysm';

export const DICE_EFFECTS: Record<number, {
  type: DieEffectType;
  impactRadius: number;      // Base impact radius multiplier
  damage: number;            // Damage per hit
  aoeMultiplier: number;     // How much AOE spreads
  knockback: number;         // Degrees to push NPCs
  terrainDamage: number;     // 0-1, how much it scars terrain
  color: string;             // Meteor/impact color
  meteorScale: number;       // Visual size multiplier
  speed: number;             // Flight speed multiplier (higher = faster)
}> = {
  4: {
    type: 'precision',
    impactRadius: 0.4,
    damage: 3,
    aoeMultiplier: 0.5,
    knockback: 0,
    terrainDamage: 0.8,
    color: '#9c27b0',    // Purple
    meteorScale: 0.6,
    speed: 2.2,          // Fastest
  },
  6: {
    type: 'standard',
    impactRadius: 0.8,
    damage: 1,
    aoeMultiplier: 1.0,
    knockback: 2,
    terrainDamage: 0.3,
    color: '#4caf50',    // Green
    meteorScale: 1.0,
    speed: 1.8,
  },
  8: {
    type: 'piercing',
    impactRadius: 0.6,
    damage: 2,
    aoeMultiplier: 1.2,
    knockback: 3,
    terrainDamage: 0.4,
    color: '#f44336',    // Red
    meteorScale: 0.9,
    speed: 2.0,
  },
  10: {
    type: 'cluster',
    impactRadius: 0.7,
    damage: 1,
    aoeMultiplier: 1.5,
    knockback: 4,
    terrainDamage: 0.5,
    color: '#ff9800',    // Orange
    meteorScale: 1.1,
    speed: 1.6,
  },
  12: {
    type: 'heavy',
    impactRadius: 1.2,
    damage: 2,
    aoeMultiplier: 1.8,
    knockback: 8,
    terrainDamage: 0.6,
    color: '#2196f3',    // Blue
    meteorScale: 1.4,
    speed: 1.4,
  },
  20: {
    type: 'cataclysm',
    impactRadius: 2.0,
    damage: 1,
    aoeMultiplier: 3.0,
    knockback: 15,
    terrainDamage: 0.2,
    color: '#e91e63',    // Pink
    meteorScale: 1.8,
    speed: 1.2,          // Slowest but biggest
  },
};

// Visual style presets
export const STYLE_PRESETS = {
  lowPoly: {
    segments: 24,
    flatShading: true,
    wireframe: false,
  },
  neonWireframe: {
    segments: 32,
    flatShading: false,
    wireframe: true,
  },
  realistic: {
    segments: 128,
    flatShading: false,
    wireframe: false,
  },
  retro: {
    segments: 16,
    flatShading: true,
    wireframe: false,
  },
};

// Types
export type NPCRarity = 'common' | 'uncommon' | 'rare' | 'legendary';

export type GameMode = 'select' | 'target';

// Game phase for turn-based flow
export type GamePhase = 'select' | 'firing' | 'impact' | 'result';

export interface GlobeNPC {
  id: string;
  lat: number; // -90 to 90
  lng: number; // -180 to 180
  rarity: NPCRarity;
  health: number;
  element?: string;
  // Movement state
  spawnLat: number;
  spawnLng: number;
  velocityLat: number;
  velocityLng: number;
  lastDirectionChange: number;
}

export interface MeteorProjectile {
  id: string;
  startPosition: [number, number, number];
  targetPosition: [number, number, number];
  targetLat: number;
  targetLng: number;
  progress: number; // 0 to 1
  size: number;
  launchTime: number;
  // Die type info for visual differentiation
  dieType: number; // 4, 6, 8, 10, 12, or 20
}

export interface ImpactZone {
  id: string;
  position: [number, number, number];
  lat: number;
  lng: number;
  radius: number;
  timestamp: number;
  // Die type info for effect differentiation
  dieType: number;
  // Roll value for scaling effect intensity
  rollValue?: number;
}

// Roll result for feedback display
export interface RollResultData {
  rolls: Array<{ dieType: number; label: string; roll: number; color: string }>;
  totalMeteors: number;
  timestamp: number;
}

export interface ComboState {
  hits: Array<{ npcId: string; timestamp: number; lat: number; lng: number }>;
  currentChain: number;
  lastHitTime: number;
  comboType: keyof typeof COMBO_CONFIG.comboTypes | null;
}
