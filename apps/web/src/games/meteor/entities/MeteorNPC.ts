import Phaser from 'phaser';
import { NPC_RARITY, BOSS_NPC_TYPES, type NPCRarity, type BossNPCType } from '../config';
import type { Element } from '../../../data/wiki/types';
import { getElementColor } from '../../../data/wiki/helpers';

// Element wheel for random assignment
const ELEMENTS: Element[] = ['Void', 'Earth', 'Death', 'Fire', 'Ice', 'Wind'];

export interface BossConfig {
  bossType: BossNPCType;
}

export class MeteorNPC extends Phaser.GameObjects.Container {
  public rarity: NPCRarity;
  public isAlive: boolean = true;
  public baseScore: number;
  public isBoss: boolean = false;
  public bossType?: BossNPCType;
  public health: number = 1;
  public element: Element = 'Neutral';

  private sprite: Phaser.GameObjects.Ellipse;
  private glow: Phaser.GameObjects.Ellipse;
  private currentDirection: { x: number; y: number } = { x: 0, y: 0 };
  private directionChangeTimer: number = 0;
  private baseAlpha: number = 0.8;
  private worldBounds: { width: number; height: number };
  private speedMultiplier: number = 1;
  private isPhased: boolean = false;
  private phaseTimer?: Phaser.Time.TimerEvent;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    rarity: NPCRarity,
    worldBounds: { width: number; height: number },
    bossConfig?: BossConfig
  ) {
    super(scene, x, y);

    this.rarity = rarity;
    this.worldBounds = worldBounds;

    // Assign element: common = Neutral, uncommon+ = random element
    if (rarity === 'common') {
      this.element = 'Neutral';
    } else {
      this.element = ELEMENTS[Math.floor(Math.random() * ELEMENTS.length)];
    }

    // Handle boss configuration
    let scale: number;
    let tint: number;
    let glowAlpha: number;

    if (bossConfig) {
      this.isBoss = true;
      this.bossType = bossConfig.bossType;
      const bossTypeConfig = BOSS_NPC_TYPES[bossConfig.bossType];
      this.baseScore = bossTypeConfig.score;
      this.health = bossTypeConfig.health;
      this.speedMultiplier = bossTypeConfig.speed;
      scale = bossTypeConfig.scale;
      tint = bossTypeConfig.tint;
      glowAlpha = bossTypeConfig.glowAlpha;

      // Set up phasing for phaser boss type
      if ('phases' in bossTypeConfig && bossTypeConfig.phases) {
        this.startPhasing();
      }
    } else {
      const config = NPC_RARITY[rarity];
      this.baseScore = config.baseScore;
      scale = config.scale;
      tint = config.tint;
      glowAlpha = config.glowAlpha;
    }

    // Create glow effect (behind sprite)
    const glowSize = 24 * scale;
    this.glow = scene.add.ellipse(0, 0, glowSize * 2, glowSize * 2, tint, glowAlpha);
    this.add(this.glow);

    // Create main sprite (simple ellipse for now)
    const size = 16 * scale;
    this.sprite = scene.add.ellipse(0, 0, size, size * 0.8, tint);
    this.add(this.sprite);

    // Boss indicator ring
    if (bossConfig) {
      const ring = scene.add.circle(0, 0, size * 0.7, undefined, 0);
      ring.setStrokeStyle(2, 0xffffff, 0.5);
      this.add(ring);
    }

    // Element indicator ring (for non-common NPCs with elements)
    if (this.element !== 'Neutral') {
      const elementColor = getElementColor(this.element);
      const elementRing = scene.add.circle(0, size * 0.5, size * 0.25, undefined, 0);
      elementRing.setStrokeStyle(2, elementColor, 0.8);
      this.add(elementRing);
    }

    // Physics body
    scene.physics.add.existing(this);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setCircle(size / 2);
    body.setOffset(-size / 2, -size / 2);

    // Initial random direction
    this.changeDirection();

    // Floating animation
    scene.tweens.add({
      targets: this.sprite,
      y: '-=3',
      duration: 1500 + Math.random() * 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Glow pulsing
    if (glowAlpha > 0) {
      scene.tweens.add({
        targets: this.glow,
        alpha: glowAlpha * 1.5,
        scaleX: 1.2,
        scaleY: 1.2,
        duration: 2000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }

    scene.add.existing(this);
    this.setDepth(10 + Math.random() * 10);
  }

  changeDirection(): void {
    const angle = Math.random() * Math.PI * 2;
    const speed = (20 + Math.random() * 30) * this.speedMultiplier;
    this.currentDirection = {
      x: Math.cos(angle) * speed,
      y: Math.sin(angle) * speed,
    };
    // Speeders change direction more often
    const baseTimer = this.speedMultiplier > 1 ? 1000 : 2000;
    this.directionChangeTimer = baseTimer + Math.random() * 3000;
  }

  // Start phasing behavior (for Phaser boss type)
  private startPhasing(): void {
    this.phaseTimer = this.scene.time.addEvent({
      delay: 2000 + Math.random() * 2000,
      callback: () => {
        this.isPhased = !this.isPhased;
        // Visual feedback for phasing
        this.scene.tweens.add({
          targets: [this.sprite, this.glow],
          alpha: this.isPhased ? 0.2 : this.baseAlpha,
          duration: 300,
          ease: 'Power2',
        });
      },
      loop: true,
    });
  }

  // Check if NPC can be hit (not phased)
  public canBeHit(): boolean {
    return this.isAlive && !this.isPhased;
  }

  avoidOther(other: MeteorNPC): void {
    const distance = Phaser.Math.Distance.Between(this.x, this.y, other.x, other.y);
    if (distance < 60 && distance > 0) {
      const avoidX = (this.x - other.x) / distance;
      const avoidY = (this.y - other.y) / distance;

      this.currentDirection.x += avoidX * 20;
      this.currentDirection.y += avoidY * 20;

      // Limit speed
      const currentSpeed = Math.sqrt(
        this.currentDirection.x ** 2 + this.currentDirection.y ** 2
      );
      if (currentSpeed > 60) {
        this.currentDirection.x = (this.currentDirection.x / currentSpeed) * 60;
        this.currentDirection.y = (this.currentDirection.y / currentSpeed) * 60;
      }
    }
  }

  update(time: number, delta: number): void {
    if (!this.isAlive) return;

    // Update position
    this.x += (this.currentDirection.x * delta) / 1000;
    this.y += (this.currentDirection.y * delta) / 1000;

    // Bounce off world bounds
    const margin = 30;
    if (this.x < margin) {
      this.x = margin;
      this.currentDirection.x = Math.abs(this.currentDirection.x);
    }
    if (this.x > this.worldBounds.width - margin) {
      this.x = this.worldBounds.width - margin;
      this.currentDirection.x = -Math.abs(this.currentDirection.x);
    }
    if (this.y < margin) {
      this.y = margin;
      this.currentDirection.y = Math.abs(this.currentDirection.y);
    }
    if (this.y > this.worldBounds.height - margin) {
      this.y = this.worldBounds.height - margin;
      this.currentDirection.y = -Math.abs(this.currentDirection.y);
    }

    // Direction change timer
    this.directionChangeTimer -= delta;
    if (this.directionChangeTimer <= 0) {
      this.changeDirection();
    }

    // Pulsing alpha
    this.sprite.setAlpha(this.baseAlpha + Math.sin(time * 0.002) * 0.15);
  }

  // Take damage - returns score if killed, 0 if still alive
  takeDamage(): number {
    if (!this.isAlive || this.isPhased) return 0;

    this.health -= 1;

    if (this.health <= 0) {
      return this.squish();
    }

    // Boss took hit but not dead - flash red
    this.scene.tweens.add({
      targets: [this.sprite, this.glow],
      alpha: 0.2,
      duration: 100,
      yoyo: true,
      repeat: 2,
    });

    // Shake the boss
    const originalX = this.x;
    this.scene.tweens.add({
      targets: this,
      x: originalX + 5,
      duration: 50,
      yoyo: true,
      repeat: 3,
      onComplete: () => {
        this.x = originalX;
      },
    });

    return 0; // No score until fully dead
  }

  squish(): number {
    if (!this.isAlive) return 0;

    this.isAlive = false;
    const score = this.baseScore;

    // Stop phasing timer if exists
    if (this.phaseTimer) {
      this.phaseTimer.destroy();
    }

    // Squish animation
    this.scene.tweens.add({
      targets: [this.sprite, this.glow],
      scaleY: 0.1,
      scaleX: 1.5,
      alpha: 0,
      duration: 200,
      ease: 'Power2',
      onComplete: () => {
        this.destroy();
      },
    });

    // Particle burst - use boss tint if boss
    const tint = this.isBoss && this.bossType
      ? BOSS_NPC_TYPES[this.bossType].tint
      : NPC_RARITY[this.rarity].tint;

    const particles = this.scene.add.particles(this.x, this.y, undefined, {
      speed: { min: 50, max: 150 },
      scale: { start: 0.4, end: 0 },
      lifespan: 400,
      quantity: this.isBoss ? 16 : 8, // More particles for bosses
      emitting: false,
    });

    // Create particle texture on the fly
    const textureKey = this.isBoss ? 'particle-boss-' + this.bossType : 'particle-' + this.rarity;
    const graphics = this.scene.add.graphics();
    graphics.fillStyle(tint);
    graphics.fillCircle(4, 4, 4);
    graphics.generateTexture(textureKey, 8, 8);
    graphics.destroy();

    particles.setTexture(textureKey);
    particles.explode();

    this.scene.time.delayedCall(500, () => {
      particles.destroy();
    });

    return score;
  }
}
