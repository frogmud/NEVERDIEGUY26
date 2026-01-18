/**
 * AsciiParticle - Individual particle in the ASCII animation system
 *
 * Each particle represents a single ASCII character that can be
 * animated with physics (scatter/reform effects).
 */

export interface AsciiParticle {
  /** Unique identifier */
  id: number;

  /** The ASCII character to render */
  char: string;

  /** Current position */
  x: number;
  y: number;

  /** Target position (for reform animations) */
  targetX: number;
  targetY: number;

  /** Velocity */
  vx: number;
  vy: number;

  /** Visual properties */
  scale: number;
  opacity: number;
  rotation: number;
  color: string;

  /** Remaining lifetime in ms (0 = immortal until manually killed) */
  lifetime: number;

  /** Grid position for formation reference */
  gridX: number;
  gridY: number;

  /** Is particle active in pool */
  active: boolean;
}

/** Configuration for particle physics */
export interface ParticlePhysics {
  /** Gravity force (pixels/s^2, positive = down) */
  gravity: number;

  /** Air resistance (0-1, higher = more drag) */
  drag: number;

  /** Spring strength for reform (0-1) */
  springStrength: number;

  /** Spring damping (0-1) */
  springDamping: number;
}

/** Default physics configuration */
export const DEFAULT_PHYSICS: ParticlePhysics = {
  gravity: 200,
  drag: 0.02,
  springStrength: 0.15,
  springDamping: 0.85,
};

/** Create a new particle with defaults */
export function createParticle(
  id: number,
  char: string,
  x: number,
  y: number,
  gridX: number,
  gridY: number
): AsciiParticle {
  return {
    id,
    char,
    x,
    y,
    targetX: x,
    targetY: y,
    vx: 0,
    vy: 0,
    scale: 1,
    opacity: 1,
    rotation: 0,
    color: '#ffffff',
    lifetime: 0,
    gridX,
    gridY,
    active: true,
  };
}

/** Reset a particle for reuse from pool */
export function resetParticle(
  particle: AsciiParticle,
  char: string,
  x: number,
  y: number,
  gridX: number,
  gridY: number
): void {
  particle.char = char;
  particle.x = x;
  particle.y = y;
  particle.targetX = x;
  particle.targetY = y;
  particle.vx = 0;
  particle.vy = 0;
  particle.scale = 1;
  particle.opacity = 1;
  particle.rotation = 0;
  particle.color = '#ffffff';
  particle.lifetime = 0;
  particle.gridX = gridX;
  particle.gridY = gridY;
  particle.active = true;
}
