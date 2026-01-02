import Phaser from 'phaser';
import { MeteorNPC } from './entities/MeteorNPC';
import { rollRarity, WORLD_CONFIG, BOSS_NPC_TYPES, type NPCRarity, type BossNPCType } from './config';
import type { MeteorEffect } from './comboDetector';
import { SoundManager } from './SoundManager';
import { ReticleRenderer } from './ReticleRenderer';
import { EffectsManager } from './EffectsManager';
import type { Element, DieSides } from '../../data/wiki/types';
import { getElementMultiplier } from '../../data/dice/mechanics';
import { getDiceConfig } from '../../data/dice/config';

// Die data for meteor drops - includes element for damage calculation
export interface DieData {
  sides: DieSides;
  value: number;
  element: Element;
}

export interface MeteorSceneEvents {
  onNPCSquished?: (rarity: NPCRarity, score: number) => void;
  onMeteorLanded?: (results: { squished: Array<{ rarity: NPCRarity; score: number }> }) => void;
  onMeteorStart?: (positions: Array<{ x: number; y: number }>) => void;
}

export class MeteorScene extends Phaser.Scene {
  private npcs: MeteorNPC[] = [];
  private maxNPCs: number = 80; // More NPCs for zoomed out view
  private spawnTimer: number = 0;
  private nextSpawnTime: number = 600; // Faster spawning
  private callbacks: MeteorSceneEvents = {};
  private targetZoneGraphics?: Phaser.GameObjects.Graphics;
  private isBossEvent: boolean = false;
  private currentDomain: number = 1;
  private bossNPCsSpawned: boolean = false;

  // Camera/panning state
  private isDragging: boolean = false;
  private dragStartX: number = 0;
  private dragStartY: number = 0;
  private cameraStartX: number = 0;
  private cameraStartY: number = 0;

  // Extracted helpers
  private reticleRenderer!: ReticleRenderer;
  private effectsManager!: EffectsManager;

  // Fullscreen tracking
  private isFullscreen: boolean = false;
  private baseWorldWidth: number = WORLD_CONFIG.worldWidth;
  private baseWorldHeight: number = WORLD_CONFIG.worldHeight;
  private boundFullscreenHandler: () => void;

  constructor() {
    super({ key: 'MeteorScene' });
    // Bind handler for proper cleanup
    this.boundFullscreenHandler = () => this.handleFullscreenChange();
  }

  setCallbacks(callbacks: MeteorSceneEvents): void {
    this.callbacks = callbacks;
  }

  create(): void {
    // Set world bounds to full 3x3 grid
    this.physics.world.setBounds(0, 0, WORLD_CONFIG.worldWidth, WORLD_CONFIG.worldHeight);

    // Create background grid for entire world
    this.createBackground();

    // Initialize extracted helpers
    this.reticleRenderer = new ReticleRenderer(this);
    this.effectsManager = new EffectsManager(this);

    // Spawn initial NPCs
    for (let i = 0; i < 50; i++) {
      this.spawnNPC();
    }

    // Set up camera - ZOOM OUT to see more
    const cam = this.cameras.main;
    cam.setZoom(0.5); // Zoomed out - see 2x the area
    cam.centerOn(
      WORLD_CONFIG.worldWidth / 2,
      WORLD_CONFIG.worldHeight / 2
    );
    // Allow camera to move within world bounds
    cam.setBounds(0, 0, WORLD_CONFIG.worldWidth, WORLD_CONFIG.worldHeight);

    // Set up drag-to-pan
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.isDragging = true;
      this.dragStartX = pointer.x;
      this.dragStartY = pointer.y;
      this.cameraStartX = cam.scrollX;
      this.cameraStartY = cam.scrollY;
    });

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (!this.isDragging) return;

      // Calculate drag distance (account for zoom)
      const zoom = cam.zoom;
      const dx = (this.dragStartX - pointer.x) / zoom;
      const dy = (this.dragStartY - pointer.y) / zoom;

      cam.scrollX = this.cameraStartX + dx;
      cam.scrollY = this.cameraStartY + dy;
    });

    this.input.on('pointerup', () => {
      this.isDragging = false;
    });

    // Handle resize
    this.scale.on('resize', this.handleResize, this);

    // Listen for fullscreen changes
    document.addEventListener('fullscreenchange', this.boundFullscreenHandler);
  }

  shutdown(): void {
    // Clean up fullscreen listener to prevent errors after scene is destroyed
    document.removeEventListener('fullscreenchange', this.boundFullscreenHandler);
  }

  private handleFullscreenChange(): void {
    const wasFullscreen = this.isFullscreen;
    this.isFullscreen = !!document.fullscreenElement;

    if (this.isFullscreen && !wasFullscreen) {
      // Entering fullscreen - expand world 3x
      this.expandWorld(3);
    } else if (!this.isFullscreen && wasFullscreen) {
      // Exiting fullscreen - restore normal world
      this.expandWorld(1);
    }
  }

  private expandWorld(multiplier: number): void {
    // Safety check - physics may not be initialized yet
    if (!this.physics?.world || !this.cameras?.main) {
      return;
    }

    const newWidth = this.baseWorldWidth * multiplier;
    const newHeight = this.baseWorldHeight * multiplier;

    // Update physics bounds
    this.physics.world.setBounds(0, 0, newWidth, newHeight);

    // Update camera bounds
    const cam = this.cameras.main;
    cam.setBounds(0, 0, newWidth, newHeight);

    // Recenter camera
    cam.centerOn(newWidth / 2, newHeight / 2);

    // Recreate background for new size
    this.createExpandedBackground(newWidth, newHeight);

    // Spawn more NPCs if expanding
    if (multiplier > 1) {
      const additionalNPCs = Math.floor(this.maxNPCs * (multiplier - 1));
      for (let i = 0; i < additionalNPCs; i++) {
        this.spawnNPCInArea(newWidth, newHeight);
      }
      // Increase max NPCs for the expanded world
      this.maxNPCs = 80 * multiplier;
    } else {
      this.maxNPCs = 80;
    }
  }

  private createExpandedBackground(width: number, height: number): void {
    // Clear existing background graphics
    this.children.list
      .filter(child => child.type === 'Graphics' && (child as Phaser.GameObjects.Graphics).depth === -2)
      .forEach(child => child.destroy());

    const graphics = this.add.graphics();
    const tileSize = 25;

    // Dense grid
    graphics.lineStyle(1, 0x1a1a1a, 0.5);
    for (let x = 0; x <= width; x += tileSize) {
      graphics.lineBetween(x, 0, x, height);
    }
    for (let y = 0; y <= height; y += tileSize) {
      graphics.lineBetween(0, y, width, y);
    }

    // Major grid lines every 100px
    graphics.lineStyle(1, 0x2a2a2a, 0.8);
    for (let x = 0; x <= width; x += 100) {
      graphics.lineBetween(x, 0, x, height);
    }
    for (let y = 0; y <= height; y += 100) {
      graphics.lineBetween(0, y, width, y);
    }

    graphics.setDepth(-2);
  }

  private spawnNPCInArea(maxWidth: number, maxHeight: number): void {
    if (this.npcs.length >= this.maxNPCs) return;

    const margin = 30;
    const x = margin + Math.random() * (maxWidth - margin * 2);
    const y = margin + Math.random() * (maxHeight - margin * 2);

    const rarity = rollRarity();
    const npc = new MeteorNPC(this, x, y, rarity, {
      width: maxWidth,
      height: maxHeight,
    });

    this.npcs.push(npc);
  }

  private handleResize(gameSize: Phaser.Structs.Size): void {
    // Keep camera centered on world center
    this.cameras.main.centerOn(
      WORLD_CONFIG.worldWidth / 2,
      WORLD_CONFIG.worldHeight / 2
    );
  }

  private createBackground(): void {
    const graphics = this.add.graphics();
    const tileSize = 25; // Smaller tiles = denser grid
    const { worldWidth, worldHeight } = WORLD_CONFIG;

    // Dense grid across entire world
    graphics.lineStyle(1, 0x1a1a1a, 0.5);
    for (let x = 0; x <= worldWidth; x += tileSize) {
      graphics.lineBetween(x, 0, x, worldHeight);
    }
    for (let y = 0; y <= worldHeight; y += tileSize) {
      graphics.lineBetween(0, y, worldWidth, y);
    }

    // Major grid lines every 100px
    graphics.lineStyle(1, 0x2a2a2a, 0.8);
    for (let x = 0; x <= worldWidth; x += 100) {
      graphics.lineBetween(x, 0, x, worldHeight);
    }
    for (let y = 0; y <= worldHeight; y += 100) {
      graphics.lineBetween(0, y, worldWidth, y);
    }

    graphics.setDepth(-2);
  }

  private createTargetZone(): void {
    const { targetZone } = WORLD_CONFIG;
    this.targetZoneGraphics = this.add.graphics();

    // Subtle border around target zone
    this.targetZoneGraphics.lineStyle(2, 0x333333, 0.5);
    this.targetZoneGraphics.strokeRect(
      targetZone.x,
      targetZone.y,
      targetZone.width,
      targetZone.height
    );
    this.targetZoneGraphics.setDepth(1);
  }

  // Called from React when dice selection changes
  public setSelectedDice(dice: number | number[]): void {
    this.reticleRenderer.setSelectedDice(dice);
  }

  private spawnNPC(): void {
    if (this.npcs.length >= this.maxNPCs) return;

    const margin = 30;
    const { worldWidth, worldHeight } = WORLD_CONFIG;

    // Spawn anywhere in the world - they wander freely
    const x = margin + Math.random() * (worldWidth - margin * 2);
    const y = margin + Math.random() * (worldHeight - margin * 2);

    const rarity = rollRarity();

    const npc = new MeteorNPC(this, x, y, rarity, {
      width: worldWidth,
      height: worldHeight,
    });

    this.npcs.push(npc);
  }

  update(time: number, delta: number): void {
    // Update reticle every frame (follows camera)
    const cam = this.cameras.main;
    this.reticleRenderer.update(time, cam.worldView.centerX, cam.worldView.centerY);

    // Spawn new NPCs periodically
    this.spawnTimer += delta;
    if (this.spawnTimer >= this.nextSpawnTime && this.npcs.length < this.maxNPCs) {
      this.spawnNPC();
      this.spawnTimer = 0;
      this.nextSpawnTime = 800 + Math.random() * 1500; // Faster respawns
    }

    // Update NPCs
    this.npcs = this.npcs.filter((npc) => {
      if (npc.isAlive) {
        npc.update(time, delta);

        // Avoid other NPCs (less aggressive to let them spread out)
        this.npcs.forEach((other) => {
          if (other !== npc && other.isAlive) {
            npc.avoidOther(other);
          }
        });
        return true;
      }
      return false;
    });
  }

  // Called from React when dice are summoned
  // Each die spawns meteors equal to its rolled value (roll 20 = 20 meteors!)
  // Now accepts DieData[] for element-based damage
  public dropMeteors(
    diceData: DieData[],
    effect: MeteorEffect = 'normal'
  ): Array<{ x: number; y: number }> {
    const results: Array<{ rarity: NPCRarity; score: number }> = [];
    const positions: Array<{ x: number; y: number }> = [];

    // Get camera center (where reticle is)
    const cam = this.cameras.main;
    const centerX = cam.worldView.centerX;
    const centerY = cam.worldView.centerY;

    // Total meteors = sum of all dice values
    const totalMeteors = diceData.reduce((sum, d) => sum + d.value, 0);

    // Calculate impact positions - spread based on reticle size
    // Also track which die element applies to each position
    const maxRadius = this.reticleRenderer.radius * 0.8;
    let meteorIndex = 0;
    const positionElements: Element[] = []; // Track element per position

    diceData.forEach((die) => {
      // Each die spawns 'value' number of meteors
      for (let i = 0; i < die.value; i++) {
        // Spiral pattern outward from center
        const t = meteorIndex / totalMeteors;
        const spiralAngle = t * Math.PI * 6 + Math.random() * 0.5; // 3 rotations
        const spiralRadius = t * maxRadius + Math.random() * 20;

        const x = centerX + Math.cos(spiralAngle) * spiralRadius;
        const y = centerY + Math.sin(spiralAngle) * spiralRadius;
        positions.push({ x, y });
        positionElements.push(die.element); // Track this meteor's element
        meteorIndex++;
      }
    });

    // Notify React of positions for dice animation
    this.callbacks.onMeteorStart?.(positions);

    // Handle shockwave effect - damages ALL NPCs in visible area
    if (effect === 'shockwave') {
      const delay = 400;
      this.time.delayedCall(delay, () => {
        // Play shockwave sound
        SoundManager.playShockwave();

        // Create epic shockwave visual
        this.effectsManager.createShockwaveEffect(centerX, centerY);

        // Damage all NPCs within shockwave radius of camera center
        const shockwaveRadius = 300;
        this.npcs.forEach((npc) => {
          if (!npc.canBeHit()) return;
          const distance = Phaser.Math.Distance.Between(centerX, centerY, npc.x, npc.y);
          if (distance < shockwaveRadius) {
            const score = npc.isBoss ? npc.takeDamage() : npc.squish();
            if (score > 0) {
              results.push({ rarity: npc.rarity, score });
              this.callbacks.onNPCSquished?.(npc.rarity, score);
              SoundManager.playSquish();
            }
          }
        });
      });

      // Report results
      this.time.delayedCall(delay + 500, () => {
        this.callbacks.onMeteorLanded?.({ squished: results });
      });

      return positions;
    }

    // Handle fizzle effect - no damage, just sad puffs
    if (effect === 'fizzle') {
      // Play fizzle sound once at the start
      this.time.delayedCall(400, () => SoundManager.playFizzle());

      // Faster timing for many meteors
      const fizzleDelay = Math.max(20, 100 / Math.sqrt(totalMeteors));
      positions.forEach((pos, index) => {
        const delay = index * fizzleDelay + 400;
        this.time.delayedCall(delay, () => {
          this.effectsManager.createFizzleEffect(pos.x, pos.y);
        });
      });

      // Report empty results
      const totalDelay = positions.length * fizzleDelay + 400 + 300;
      this.time.delayedCall(totalDelay, () => {
        this.callbacks.onMeteorLanded?.({ squished: [] });
      });

      return positions;
    }

    // Normal, bigblast, or chain effects
    // Faster timing when more meteors (machine gun effect!)
    const meteorDelay = Math.max(15, 80 / Math.sqrt(totalMeteors));

    positions.forEach((pos, index) => {
      const delay = index * meteorDelay + 300;

      this.time.delayedCall(delay, () => {
        // Play impact sound (vary intensity slightly)
        const intensity = 0.3 + Math.random() * 0.4;
        SoundManager.playImpact(intensity);

        // Create meteor impact effect - smaller individual impacts
        const color = effect === 'chain' ? 0x9b59b6 : effect === 'bigblast' ? 0x00e5ff : 0xff4444;
        const impactSize = effect === 'bigblast' ? 8 : 5; // Smaller individual meteors
        this.effectsManager.createMeteorImpact(pos.x, pos.y, impactSize, color);

        // Calculate impact radius - smaller per meteor but more of them!
        let impactRadius = effect === 'bigblast' ? 40 : 25;

        // Check for NPC collisions - with element damage!
        const hitNPCs: MeteorNPC[] = [];
        const meteorElement = positionElements[index];

        this.npcs.forEach((npc) => {
          if (!npc.canBeHit()) return;
          const distance = Phaser.Math.Distance.Between(pos.x, pos.y, npc.x, npc.y);
          if (distance < impactRadius) {
            // Calculate element multiplier
            const elementMultiplier = getElementMultiplier(meteorElement, npc.element);

            // Use takeDamage for bosses (handles multi-hit), squish for regular NPCs
            const baseScore = npc.isBoss ? npc.takeDamage() : npc.squish();

            if (baseScore > 0) {
              // Apply element multiplier to score
              const finalScore = Math.round(baseScore * elementMultiplier);
              hitNPCs.push(npc);
              results.push({ rarity: npc.rarity, score: finalScore });
              this.callbacks.onNPCSquished?.(npc.rarity, finalScore);
              SoundManager.playSquish();

              // Visual feedback for element hits
              if (elementMultiplier > 1) {
                // Advantage hit - show bonus text
                this.effectsManager.showElementFeedback(npc.x, npc.y - 20, 'Super!', 0x00ff00);
              } else if (elementMultiplier < 1) {
                // Weakness hit - show resist text
                this.effectsManager.showElementFeedback(npc.x, npc.y - 20, 'Resist', 0xff6666);
              }
            } else if (npc.isBoss && npc.isAlive) {
              // Boss hit but not dead - play a hit sound
              SoundManager.playImpact(0.3);
            }
          }
        });

        // Chain explosion - each hit triggers secondary explosions
        if (effect === 'chain' && hitNPCs.length > 0) {
          this.time.delayedCall(100, () => {
            hitNPCs.forEach((hitNpc) => {
              this.effectsManager.createChainExplosion(
                hitNpc.x,
                hitNpc.y,
                this.npcs,
                (npc, score) => {
                  results.push({ rarity: npc.rarity, score });
                  this.callbacks.onNPCSquished?.(npc.rarity, score);
                }
              );
            });
          });
        }
      });
    });

    // Report all results after all meteors land
    const totalDelay = positions.length * meteorDelay + 300 + (effect === 'chain' ? 400 : 200);
    this.time.delayedCall(totalDelay, () => {
      this.callbacks.onMeteorLanded?.({ squished: results });
    });

    return positions;
  }

  // Get current NPC count for UI
  public getNPCCount(): number {
    return this.npcs.filter((n) => n.isAlive).length;
  }

  // Set max NPCs (can be configured per domain)
  public setMaxNPCs(max: number): void {
    this.maxNPCs = max;
  }

  // Set boss event mode
  public setBossEvent(isBoss: boolean, domain: number): void {
    this.isBossEvent = isBoss;
    this.currentDomain = domain;

    if (isBoss && !this.bossNPCsSpawned) {
      this.spawnBossNPCs();
      this.bossNPCsSpawned = true;
    }
  }

  // Spawn boss NPCs for the current domain
  private spawnBossNPCs(): void {
    // Determine which boss type to spawn based on domain
    let bossType: BossNPCType = 'guardian';
    for (const [type, config] of Object.entries(BOSS_NPC_TYPES)) {
      if ((config.domains as readonly number[]).includes(this.currentDomain)) {
        bossType = type as BossNPCType;
        break;
      }
    }

    const { targetZone } = WORLD_CONFIG;
    const margin = 100;

    // Spawn 2-3 boss NPCs
    const bossCount = 2 + Math.floor(Math.random() * 2);
    for (let i = 0; i < bossCount; i++) {
      const x = targetZone.x + margin + Math.random() * (targetZone.width - margin * 2);
      const y = targetZone.y + margin + Math.random() * (targetZone.height - margin * 2);

      const boss = new MeteorNPC(this, x, y, 'legendary', {
        width: WORLD_CONFIG.worldWidth,
        height: WORLD_CONFIG.worldHeight,
      }, { bossType });

      this.npcs.push(boss);
    }
  }

  // Reset for new event
  public resetEvent(): void {
    this.bossNPCsSpawned = false;
    this.isBossEvent = false;
  }
}
