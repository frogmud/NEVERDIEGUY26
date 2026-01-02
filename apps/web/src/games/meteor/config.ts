import Phaser from 'phaser';

// World is 3x3 grid of viewports
export const WORLD_CONFIG = {
  // Full world size (3x3 grid)
  worldWidth: 2400,
  worldHeight: 1500,
  // Single viewport/tile size
  viewportWidth: 800,
  viewportHeight: 500,
  // Targeting zone (center area where meteors can land)
  targetZone: {
    x: 800,  // Start of center tile
    y: 500,
    width: 800,
    height: 500,
  },
};

export const METEOR_CONFIG: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  transparent: true,  // Allow 3D globe to show through
  pixelArt: true,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  scale: {
    mode: Phaser.Scale.RESIZE,  // Resize to fill container
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};

// NPC Rarity configuration
export const NPC_RARITY = {
  common: {
    spawnWeight: 70,
    baseScore: 10,
    scale: 0.8,
    tint: 0xaaaaaa,
    glowAlpha: 0,
  },
  uncommon: {
    spawnWeight: 20,
    baseScore: 50,
    scale: 1.0,
    tint: 0x4ecdc4,
    glowAlpha: 0.2,
  },
  rare: {
    spawnWeight: 8,
    baseScore: 200,
    scale: 1.2,
    tint: 0x9b59b6,
    glowAlpha: 0.4,
  },
  legendary: {
    spawnWeight: 2,
    baseScore: 1000,
    scale: 1.5,
    tint: 0xf1c40f,
    glowAlpha: 0.6,
  },
} as const;

export type NPCRarity = keyof typeof NPC_RARITY;

// Boss NPC types - special NPCs that appear during boss events
export const BOSS_NPC_TYPES = {
  guardian: {
    name: 'Guardian',
    health: 2,          // Takes 2 hits to kill
    speed: 0.5,         // Slower than normal
    scale: 2.0,         // Bigger
    score: 500,
    tint: 0xff4444,     // Red
    glowAlpha: 0.8,
    domains: [1, 2],    // Appears in domains 1-2
  },
  speeder: {
    name: 'Speeder',
    health: 1,
    speed: 2.0,         // Faster than normal
    scale: 0.8,         // Smaller
    score: 300,
    tint: 0x44ff44,     // Green
    glowAlpha: 0.6,
    domains: [3, 4],    // Appears in domains 3-4
  },
  phaser: {
    name: 'Phaser',
    health: 1,
    speed: 1.0,
    scale: 1.0,
    score: 800,
    tint: 0x4444ff,     // Blue
    glowAlpha: 0.9,
    phases: true,       // Blinks in/out of existence
    domains: [5, 6],    // Appears in domains 5-6
  },
} as const;

export type BossNPCType = keyof typeof BOSS_NPC_TYPES;

// Pick a rarity based on spawn weights
export function rollRarity(): NPCRarity {
  const total = Object.values(NPC_RARITY).reduce((sum, r) => sum + r.spawnWeight, 0);
  let roll = Math.random() * total;

  for (const [rarity, config] of Object.entries(NPC_RARITY)) {
    roll -= config.spawnWeight;
    if (roll <= 0) {
      return rarity as NPCRarity;
    }
  }
  return 'common';
}
