import Phaser from 'phaser';
import type { NPCRarity } from './config';
import type { MeteorNPC } from './entities/MeteorNPC';
import { SoundManager } from './SoundManager';

export interface ChainExplosionResult {
  rarity: NPCRarity;
  score: number;
}

/**
 * Manages all visual effects for the meteor game:
 * - Meteor impacts
 * - Shockwave effects
 * - Chain explosions
 * - Fizzle effects
 */
export class EffectsManager {
  constructor(private scene: Phaser.Scene) {}

  /**
   * Create a meteor impact effect at the given position
   */
  createMeteorImpact(
    x: number,
    y: number,
    diceValue: number,
    color: number = 0xff4444
  ): void {
    // Impact flash
    const flash = this.scene.add.circle(x, y, 20 + diceValue * 2, color, 0.8);
    flash.setDepth(50);

    this.scene.tweens.add({
      targets: flash,
      scale: 3,
      alpha: 0,
      duration: 300,
      ease: 'Power2',
      onComplete: () => flash.destroy(),
    });

    // Screen shake based on dice value
    this.scene.cameras.main.shake(
      100 + diceValue * 10,
      0.005 + diceValue * 0.001
    );

    // Impact ring - slightly lighter version of color
    const ring = this.scene.add.circle(x, y, 10, undefined, 0);
    ring.setStrokeStyle(3, color);
    ring.setDepth(49);

    this.scene.tweens.add({
      targets: ring,
      scale: 4 + diceValue * 0.5,
      alpha: 0,
      duration: 400,
      ease: 'Power2',
      onComplete: () => ring.destroy(),
    });

    // Dice value indicator - convert color to hex string
    const colorHex = '#' + color.toString(16).padStart(6, '0');
    const text = this.scene.add.text(x, y - 30, String(diceValue), {
      fontSize: '24px',
      color: colorHex,
      fontStyle: 'bold',
    });
    text.setOrigin(0.5);
    text.setDepth(60);

    this.scene.tweens.add({
      targets: text,
      y: y - 60,
      alpha: 0,
      duration: 800,
      ease: 'Power2',
      onComplete: () => text.destroy(),
    });
  }

  /**
   * Create a shockwave effect centered at camera position
   */
  createShockwaveEffect(centerX: number, centerY: number): void {
    // Big flash
    const flash = this.scene.add.circle(centerX, centerY, 50, 0xc4a000, 0.9);
    flash.setDepth(50);

    this.scene.tweens.add({
      targets: flash,
      scale: 10,
      alpha: 0,
      duration: 500,
      ease: 'Power2',
      onComplete: () => flash.destroy(),
    });

    // Multiple expanding rings
    for (let i = 0; i < 3; i++) {
      const ring = this.scene.add.circle(
        centerX,
        centerY,
        20 + i * 30,
        undefined,
        0
      );
      ring.setStrokeStyle(4, 0xffd700);
      ring.setDepth(49);

      this.scene.time.delayedCall(i * 100, () => {
        this.scene.tweens.add({
          targets: ring,
          scale: 15,
          alpha: 0,
          duration: 600,
          ease: 'Power2',
          onComplete: () => ring.destroy(),
        });
      });
    }

    // Epic screen shake
    this.scene.cameras.main.shake(300, 0.02);

    // 4-5-6 text
    const text = this.scene.add.text(centerX, centerY - 50, '4-5-6!', {
      fontSize: '48px',
      color: '#ffd700',
      fontStyle: 'bold',
    });
    text.setOrigin(0.5);
    text.setDepth(60);

    this.scene.tweens.add({
      targets: text,
      y: centerY - 100,
      scale: 1.5,
      alpha: 0,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => text.destroy(),
    });
  }

  /**
   * Create a chain explosion effect at hit location
   * Returns callback to check for NPC hits
   */
  createChainExplosion(
    x: number,
    y: number,
    npcs: MeteorNPC[],
    onNPCHit: (npc: MeteorNPC, score: number) => void
  ): void {
    // Visual effect
    const flash = this.scene.add.circle(x, y, 15, 0x9b59b6, 0.8);
    flash.setDepth(50);

    this.scene.tweens.add({
      targets: flash,
      scale: 2.5,
      alpha: 0,
      duration: 250,
      ease: 'Power2',
      onComplete: () => flash.destroy(),
    });

    // Chain ring
    const ring = this.scene.add.circle(x, y, 10, undefined, 0);
    ring.setStrokeStyle(2, 0xbb77dd);
    ring.setDepth(49);

    this.scene.tweens.add({
      targets: ring,
      scale: 3,
      alpha: 0,
      duration: 300,
      ease: 'Power2',
      onComplete: () => ring.destroy(),
    });

    // Check for nearby NPCs
    const chainRadius = 60;
    npcs.forEach((npc) => {
      if (!npc.canBeHit()) return;
      const distance = Phaser.Math.Distance.Between(x, y, npc.x, npc.y);
      if (distance < chainRadius && distance > 10) {
        const score = npc.isBoss ? npc.takeDamage() : npc.squish();
        if (score > 0) {
          onNPCHit(npc, score);
          SoundManager.playSquish();
        }
      }
    });
  }

  /**
   * Create a fizzle effect - sad puff of smoke for failed attacks
   */
  createFizzleEffect(x: number, y: number): void {
    // Gray puff
    const puff = this.scene.add.circle(x, y, 15, 0x666666, 0.6);
    puff.setDepth(50);

    this.scene.tweens.add({
      targets: puff,
      scale: 2,
      alpha: 0,
      duration: 400,
      ease: 'Power1',
      onComplete: () => puff.destroy(),
    });

    // Sad text
    const text = this.scene.add.text(x, y - 20, '...', {
      fontSize: '18px',
      color: '#666666',
    });
    text.setOrigin(0.5);
    text.setDepth(60);

    this.scene.tweens.add({
      targets: text,
      y: y - 40,
      alpha: 0,
      duration: 600,
      ease: 'Power1',
      onComplete: () => text.destroy(),
    });

    // Tiny shake (disappointment)
    this.scene.cameras.main.shake(50, 0.002);
  }

  /**
   * Show element feedback text (Super! or Resist)
   */
  showElementFeedback(x: number, y: number, text: string, color: number): void {
    const colorHex = '#' + color.toString(16).padStart(6, '0');
    const feedback = this.scene.add.text(x, y, text, {
      fontSize: '16px',
      color: colorHex,
      fontStyle: 'bold',
    });
    feedback.setOrigin(0.5);
    feedback.setDepth(65);

    this.scene.tweens.add({
      targets: feedback,
      y: y - 30,
      alpha: 0,
      duration: 600,
      ease: 'Power2',
      onComplete: () => feedback.destroy(),
    });
  }

  /**
   * Clean up resources (if any persistent objects exist)
   */
  destroy(): void {
    // Nothing persistent to clean up currently
  }
}
