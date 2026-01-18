/**
 * AsciiEngine - Core particle physics engine for ASCII animations
 *
 * Handles scatter (explosion) and reform (coalesce) animations
 * for ASCII character particles.
 */

import {
  AsciiParticle,
  ParticlePhysics,
  DEFAULT_PHYSICS,
  createParticle,
  resetParticle,
} from './AsciiParticle';

export type AnimationMode = 'idle' | 'scatter' | 'reform' | 'hold';

export interface AsciiEngineConfig {
  /** Canvas width */
  width: number;
  /** Canvas height */
  height: number;
  /** Character cell width in pixels */
  charWidth: number;
  /** Character cell height in pixels */
  charHeight: number;
  /** Font family for rendering */
  font: string;
  /** Default particle color */
  color: string;
  /** Physics configuration */
  physics: ParticlePhysics;
}

export interface ScatterOptions {
  /** Center point for explosion origin */
  centerX?: number;
  centerY?: number;
  /** Base velocity magnitude */
  velocity?: number;
  /** Random velocity jitter (0-1) */
  jitter?: number;
  /** Particle lifetime in ms (0 = fade based on distance) */
  lifetime?: number;
  /** Apply gravity during scatter */
  gravity?: boolean;
}

export interface ReformOptions {
  /** Duration to complete reform in ms */
  duration?: number;
  /** Delay before starting (for stagger effect) */
  delay?: number;
  /** Spawn particles from random positions */
  randomSpawn?: boolean;
}

const DEFAULT_CONFIG: AsciiEngineConfig = {
  width: 800,
  height: 600,
  charWidth: 7.2,
  charHeight: 14,
  font: 'IBM Plex Mono, monospace',
  color: '#ffffff',
  physics: DEFAULT_PHYSICS,
};

export class AsciiEngine {
  private config: AsciiEngineConfig;
  private particles: AsciiParticle[] = [];
  private particlePool: AsciiParticle[] = [];
  private nextId = 0;

  /** Current animation mode */
  mode: AnimationMode = 'idle';

  /** Animation progress (0-1) */
  progress = 0;

  /** Grid data for formation */
  private grid: string[] = [];
  private gridCols = 0;
  private gridRows = 0;

  /** Formation offset (center the grid) */
  private offsetX = 0;
  private offsetY = 0;

  /** Callbacks */
  onComplete?: () => void;

  constructor(config: Partial<AsciiEngineConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /** Update canvas dimensions */
  resize(width: number, height: number): void {
    this.config.width = width;
    this.config.height = height;
    this.calculateOffset();
  }

  /** Load a character grid (array of strings, each string is a row) */
  loadGrid(grid: string[]): void {
    this.grid = grid;
    this.gridRows = grid.length;
    this.gridCols = Math.max(...grid.map((row) => row.length));
    this.calculateOffset();
    this.createParticlesFromGrid();
  }

  /** Calculate offset to center the grid */
  private calculateOffset(): void {
    const gridWidth = this.gridCols * this.config.charWidth;
    const gridHeight = this.gridRows * this.config.charHeight;
    this.offsetX = (this.config.width - gridWidth) / 2;
    this.offsetY = (this.config.height - gridHeight) / 2;
  }

  /** Create particles from loaded grid */
  private createParticlesFromGrid(): void {
    // Return existing particles to pool
    for (const p of this.particles) {
      p.active = false;
      this.particlePool.push(p);
    }
    this.particles = [];

    // Create particles for non-space characters
    for (let row = 0; row < this.grid.length; row++) {
      const line = this.grid[row];
      for (let col = 0; col < line.length; col++) {
        const char = line[col];
        if (char !== ' ') {
          const x = this.offsetX + col * this.config.charWidth;
          const y = this.offsetY + row * this.config.charHeight;
          const particle = this.getParticle(char, x, y, col, row);
          this.particles.push(particle);
        }
      }
    }
  }

  /** Get a particle from pool or create new */
  private getParticle(
    char: string,
    x: number,
    y: number,
    gridX: number,
    gridY: number
  ): AsciiParticle {
    const pooled = this.particlePool.pop();
    if (pooled) {
      resetParticle(pooled, char, x, y, gridX, gridY);
      return pooled;
    }
    return createParticle(this.nextId++, char, x, y, gridX, gridY);
  }

  /**
   * Start scatter animation - particles explode outward
   */
  scatter(options: ScatterOptions = {}): void {
    const {
      centerX = this.config.width / 2,
      centerY = this.config.height / 2,
      velocity = 400,
      jitter = 0.5,
      lifetime = 2000,
      gravity = true,
    } = options;

    this.mode = 'scatter';
    this.progress = 0;

    for (const p of this.particles) {
      // Calculate direction from center
      const dx = p.x - centerX;
      const dy = p.y - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;

      // Normalize and apply velocity with jitter
      const jitterX = (Math.random() - 0.5) * jitter;
      const jitterY = (Math.random() - 0.5) * jitter;
      const speed = velocity * (0.8 + Math.random() * 0.4);

      p.vx = (dx / dist + jitterX) * speed;
      p.vy = (dy / dist + jitterY) * speed;

      // Set lifetime with some variation
      p.lifetime = lifetime * (0.8 + Math.random() * 0.4);

      // Random rotation velocity
      p.rotation = (Math.random() - 0.5) * 10;
    }

    // Store gravity setting
    (this as any)._scatterGravity = gravity;
  }

  /**
   * Start reform animation - particles coalesce into formation
   */
  reform(options: ReformOptions = {}): void {
    const { duration = 800, randomSpawn = true } = options;

    this.mode = 'reform';
    this.progress = 0;

    for (const p of this.particles) {
      // Store target position (formation position)
      p.targetX = this.offsetX + p.gridX * this.config.charWidth;
      p.targetY = this.offsetY + p.gridY * this.config.charHeight;

      if (randomSpawn) {
        // Spawn from random edge positions
        const edge = Math.floor(Math.random() * 4);
        switch (edge) {
          case 0: // Top
            p.x = Math.random() * this.config.width;
            p.y = -50;
            break;
          case 1: // Right
            p.x = this.config.width + 50;
            p.y = Math.random() * this.config.height;
            break;
          case 2: // Bottom
            p.x = Math.random() * this.config.width;
            p.y = this.config.height + 50;
            break;
          case 3: // Left
            p.x = -50;
            p.y = Math.random() * this.config.height;
            break;
        }
      }

      // Reset visual state
      p.opacity = 0.3;
      p.scale = 0.5;
      p.vx = 0;
      p.vy = 0;
    }

    // Store duration for progress calculation
    (this as any)._reformDuration = duration;
    (this as any)._reformStart = performance.now();
  }

  /**
   * Hold animation - particles in formation with subtle pulse
   */
  hold(): void {
    this.mode = 'hold';
    this.progress = 0;

    // Ensure particles are at formation positions
    for (const p of this.particles) {
      p.x = this.offsetX + p.gridX * this.config.charWidth;
      p.y = this.offsetY + p.gridY * this.config.charHeight;
      p.vx = 0;
      p.vy = 0;
      p.opacity = 1;
      p.scale = 1;
    }
  }

  /**
   * Update particle physics (call every frame)
   * @param deltaTime Time since last frame in ms
   */
  update(deltaTime: number): void {
    const dt = deltaTime / 1000; // Convert to seconds
    const { physics } = this.config;

    switch (this.mode) {
      case 'scatter':
        this.updateScatter(dt, physics);
        break;
      case 'reform':
        this.updateReform(dt, physics);
        break;
      case 'hold':
        this.updateHold(dt);
        break;
    }
  }

  private updateScatter(dt: number, physics: ParticlePhysics): void {
    const useGravity = (this as any)._scatterGravity ?? true;
    let allDead = true;

    for (const p of this.particles) {
      if (!p.active) continue;

      // Apply gravity
      if (useGravity) {
        p.vy += physics.gravity * dt;
      }

      // Apply drag
      p.vx *= 1 - physics.drag;
      p.vy *= 1 - physics.drag;

      // Update position
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      // No rotation - keeps characters clean and readable
      // p.rotation += p.vx * 0.01 * dt;

      // Update lifetime and opacity
      if (p.lifetime > 0) {
        p.lifetime -= dt * 1000; // Convert dt (seconds) back to ms
        p.opacity = Math.max(0, p.lifetime / 1000);
        if (p.lifetime <= 0) {
          p.active = false;
        } else {
          allDead = false;
        }
      } else {
        allDead = false;
      }
    }

    // Check completion
    if (allDead && this.onComplete) {
      this.mode = 'idle';
      this.onComplete();
    }
  }

  private updateReform(dt: number, physics: ParticlePhysics): void {
    const duration = (this as any)._reformDuration ?? 800;
    const start = (this as any)._reformStart ?? performance.now();
    const elapsed = performance.now() - start;
    this.progress = Math.min(1, elapsed / duration);

    // Easing function (ease-out cubic)
    const ease = 1 - Math.pow(1 - this.progress, 3);

    let allArrived = true;

    for (const p of this.particles) {
      if (!p.active) continue;

      // Spring physics toward target
      const dx = p.targetX - p.x;
      const dy = p.targetY - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 1) {
        // Apply spring force
        const strength = physics.springStrength * (1 + ease * 2);
        p.vx += dx * strength;
        p.vy += dy * strength;

        // Apply damping
        p.vx *= physics.springDamping;
        p.vy *= physics.springDamping;

        // Update position
        p.x += p.vx;
        p.y += p.vy;

        allArrived = false;
      } else {
        // Snap to target
        p.x = p.targetX;
        p.y = p.targetY;
        p.vx = 0;
        p.vy = 0;
      }

      // Fade in and scale up
      p.opacity = Math.min(1, 0.3 + ease * 0.7);
      p.scale = 0.5 + ease * 0.5;
    }

    // Check completion
    if (this.progress >= 1 && allArrived && this.onComplete) {
      this.mode = 'hold';
      this.onComplete();
    }
  }

  private updateHold(dt: number): void {
    // Subtle breathing effect
    const time = performance.now() / 1000;
    const pulse = Math.sin(time * 2) * 0.05 + 1;

    for (const p of this.particles) {
      p.scale = pulse;
    }
  }

  /**
   * Render particles to canvas context
   */
  render(ctx: CanvasRenderingContext2D): void {
    ctx.clearRect(0, 0, this.config.width, this.config.height);
    ctx.font = `${this.config.charHeight}px ${this.config.font}`;
    ctx.textBaseline = 'top';

    for (const p of this.particles) {
      if (!p.active || p.opacity <= 0) continue;

      ctx.save();
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;

      // Apply transforms
      ctx.translate(p.x, p.y);
      if (p.rotation !== 0) {
        ctx.rotate(p.rotation);
      }
      if (p.scale !== 1) {
        ctx.scale(p.scale, p.scale);
      }

      // Draw character
      ctx.fillText(p.char, 0, 0);
      ctx.restore();
    }
  }

  /** Get current particle count (active) */
  get particleCount(): number {
    return this.particles.filter((p) => p.active).length;
  }

  /** Get all particles (for debugging) */
  getParticles(): readonly AsciiParticle[] {
    return this.particles;
  }

  /** Reset engine state */
  reset(): void {
    this.mode = 'idle';
    this.progress = 0;
    for (const p of this.particles) {
      p.active = false;
      this.particlePool.push(p);
    }
    this.particles = [];
  }

  /** Dispose and clean up */
  dispose(): void {
    this.reset();
    this.particlePool = [];
  }
}
