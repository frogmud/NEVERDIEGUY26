/**
 * Market Character Sprite Configuration
 *
 * Maps characters to their sprite files and animation states.
 * Sprites resized to ~100px (King James at 300px).
 * NEVER DIE GUY
 */

export type AnimationState = 'idle' | 'shop' | 'walk' | 'back' | 'action';
export type CharacterId = 'willy' | 'mr-bones' | 'general' | 'keith-man' | 'stitch-up-girl' | 'king-james';

export interface SpriteFrame {
  src: string;
  duration: number; // ms per frame
}

export interface CharacterAnimation {
  frames: SpriteFrame[];
  loop: boolean;
}

export interface CharacterSprites {
  id: CharacterId;
  name: string;
  role: 'shop' | 'wanderer' | 'traveler' | 'pantheon';
  portrait: string;
  animations: Partial<Record<AnimationState, CharacterAnimation>>;
}

// Base path for market sprites
const MARKET_BASE = '/assets/market';

/**
 * Character sprite configurations
 */
export const CHARACTER_SPRITES: Record<CharacterId, CharacterSprites> = {
  willy: {
    id: 'willy',
    name: 'Willy',
    role: 'shop',
    portrait: `${MARKET_BASE}/willy/portrait.png`,
    animations: {
      idle: {
        frames: [
          { src: `${MARKET_BASE}/willy/idle-01.png`, duration: 200 },
          { src: `${MARKET_BASE}/willy/idle-02.png`, duration: 200 },
        ],
        loop: true,
      },
      shop: {
        frames: [
          { src: `${MARKET_BASE}/willy/shop-01.png`, duration: 300 },
          { src: `${MARKET_BASE}/willy/shop-02.png`, duration: 300 },
        ],
        loop: true,
      },
      walk: {
        frames: [
          { src: `${MARKET_BASE}/willy/walk-01.png`, duration: 150 },
          { src: `${MARKET_BASE}/willy/walk-02.png`, duration: 150 },
          { src: `${MARKET_BASE}/willy/walk-03.png`, duration: 150 },
          { src: `${MARKET_BASE}/willy/walk-04.png`, duration: 150 },
        ],
        loop: true,
      },
      back: {
        frames: [
          { src: `${MARKET_BASE}/willy/back-01.png`, duration: 200 },
          { src: `${MARKET_BASE}/willy/back-02.png`, duration: 200 },
        ],
        loop: true,
      },
    },
  },

  'mr-bones': {
    id: 'mr-bones',
    name: 'Mr. Bones',
    role: 'wanderer',
    portrait: `${MARKET_BASE}/mr-bones/portrait.png`,
    animations: {
      idle: {
        frames: [
          { src: `${MARKET_BASE}/mr-bones/idle-01.png`, duration: 250 },
          { src: `${MARKET_BASE}/mr-bones/idle-02.png`, duration: 250 },
        ],
        loop: true,
      },
      walk: {
        frames: [
          { src: `${MARKET_BASE}/mr-bones/walk-01.png`, duration: 150 },
          { src: `${MARKET_BASE}/mr-bones/walk-02.png`, duration: 150 },
          { src: `${MARKET_BASE}/mr-bones/walk-03.png`, duration: 150 },
        ],
        loop: true,
      },
    },
  },

  general: {
    id: 'general',
    name: 'The General',
    role: 'wanderer',
    portrait: `${MARKET_BASE}/general/portrait.png`,
    animations: {
      idle: {
        frames: [
          { src: `${MARKET_BASE}/general/idle-01.png`, duration: 300 },
          { src: `${MARKET_BASE}/general/idle-02.png`, duration: 300 },
        ],
        loop: true,
      },
      shop: {
        frames: [
          { src: `${MARKET_BASE}/general/shop-01.png`, duration: 300 },
          { src: `${MARKET_BASE}/general/shop-02.png`, duration: 300 },
        ],
        loop: true,
      },
      back: {
        frames: [
          { src: `${MARKET_BASE}/general/back-01.png`, duration: 300 },
        ],
        loop: true,
      },
      action: {
        frames: [
          { src: `${MARKET_BASE}/general/action-01.png`, duration: 200 },
        ],
        loop: false,
      },
    },
  },

  'keith-man': {
    id: 'keith-man',
    name: 'Keith Man',
    role: 'traveler',
    portrait: `${MARKET_BASE}/keith-man/portrait.png`,
    animations: {
      idle: {
        frames: [
          { src: `${MARKET_BASE}/keith-man/idle-01.png`, duration: 200 },
          { src: `${MARKET_BASE}/keith-man/idle-02.png`, duration: 200 },
        ],
        loop: true,
      },
      shop: {
        frames: [
          { src: `${MARKET_BASE}/keith-man/shop-01.png`, duration: 300 },
        ],
        loop: true,
      },
      walk: {
        frames: [
          { src: `${MARKET_BASE}/keith-man/walk-01.png`, duration: 150 },
          { src: `${MARKET_BASE}/keith-man/walk-02.png`, duration: 150 },
          { src: `${MARKET_BASE}/keith-man/walk-03.png`, duration: 150 },
        ],
        loop: true,
      },
      back: {
        frames: [
          { src: `${MARKET_BASE}/keith-man/back-01.png`, duration: 200 },
        ],
        loop: true,
      },
    },
  },

  'stitch-up-girl': {
    id: 'stitch-up-girl',
    name: 'Stitch-Up Girl',
    role: 'shop',
    portrait: `${MARKET_BASE}/stitch-up-girl/portrait.png`,
    animations: {
      idle: {
        frames: [
          { src: `${MARKET_BASE}/stitch-up-girl/idle-01.png`, duration: 200 },
          { src: `${MARKET_BASE}/stitch-up-girl/idle-02.png`, duration: 200 },
        ],
        loop: true,
      },
      shop: {
        frames: [
          { src: `${MARKET_BASE}/stitch-up-girl/shop-01.png`, duration: 250 },
          { src: `${MARKET_BASE}/stitch-up-girl/shop-02.png`, duration: 250 },
        ],
        loop: true,
      },
      walk: {
        frames: [
          { src: `${MARKET_BASE}/stitch-up-girl/walk-01.png`, duration: 150 },
          { src: `${MARKET_BASE}/stitch-up-girl/walk-02.png`, duration: 150 },
          { src: `${MARKET_BASE}/stitch-up-girl/walk-03.png`, duration: 150 },
        ],
        loop: true,
      },
      back: {
        frames: [
          { src: `${MARKET_BASE}/stitch-up-girl/back-01.png`, duration: 200 },
        ],
        loop: true,
      },
      action: {
        frames: [
          { src: `${MARKET_BASE}/stitch-up-girl/action-01.png`, duration: 200 },
        ],
        loop: false,
      },
    },
  },

  'king-james': {
    id: 'king-james',
    name: 'King James',
    role: 'pantheon',
    portrait: `${MARKET_BASE}/king-james/portrait.png`,
    animations: {
      idle: {
        frames: [
          { src: `${MARKET_BASE}/king-james/idle-01.png`, duration: 400 },
          { src: `${MARKET_BASE}/king-james/idle-02.png`, duration: 400 },
        ],
        loop: true,
      },
      shop: {
        frames: [
          { src: `${MARKET_BASE}/king-james/shop-01.png`, duration: 400 },
        ],
        loop: true,
      },
      walk: {
        frames: [
          { src: `${MARKET_BASE}/king-james/walk-01.png`, duration: 300 },
        ],
        loop: true,
      },
      action: {
        frames: [
          { src: `${MARKET_BASE}/king-james/action-01.png`, duration: 300 },
        ],
        loop: false,
      },
    },
  },
};

/**
 * Get character by role
 */
export function getCharactersByRole(role: CharacterSprites['role']): CharacterSprites[] {
  return Object.values(CHARACTER_SPRITES).filter((c) => c.role === role);
}

/**
 * Get shop characters
 */
export function getShopCharacters(): CharacterSprites[] {
  return getCharactersByRole('shop');
}

/**
 * Get wanderer characters
 */
export function getWandererCharacters(): CharacterSprites[] {
  return getCharactersByRole('wanderer');
}

/**
 * Get all character IDs
 */
export function getAllCharacterIds(): CharacterId[] {
  return Object.keys(CHARACTER_SPRITES) as CharacterId[];
}

export default CHARACTER_SPRITES;
