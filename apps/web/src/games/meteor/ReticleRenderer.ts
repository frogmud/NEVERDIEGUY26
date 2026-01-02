import Phaser from 'phaser';

/**
 * Handles all reticle drawing for the meteor game.
 * The reticle shows targeting area and reflects the currently selected dice.
 */
export class ReticleRenderer {
  private graphics: Phaser.GameObjects.Graphics;
  private scene: Phaser.Scene;
  private selectedDice: number[] = [];
  private _radius: number = 50;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.graphics = scene.add.graphics();
    this.graphics.setDepth(100);
  }

  /**
   * Get the current reticle radius (based on largest selected die)
   */
  get radius(): number {
    return this._radius;
  }

  /**
   * Update the selected dice for reticle display
   */
  setSelectedDice(dice: number | number[]): void {
    if (typeof dice === 'number') {
      // Legacy: if just a count is passed, create array of d6s
      this.selectedDice = Array(dice).fill(6);
    } else {
      this.selectedDice = dice;
    }
  }

  /**
   * Update the reticle each frame - call from scene's update method
   */
  update(time: number, centerX: number, centerY: number): void {
    this.graphics.clear();

    const pulse = Math.sin(time / 200) * 0.15 + 0.85;
    const slowPulse = Math.sin(time / 500) * 0.1;

    // If no dice selected, show default crosshair
    if (this.selectedDice.length === 0) {
      this.graphics.lineStyle(1, 0x666666, 0.4);
      const crossSize = 15;
      this.graphics.lineBetween(
        centerX - crossSize,
        centerY,
        centerX + crossSize,
        centerY
      );
      this.graphics.lineBetween(
        centerX,
        centerY - crossSize,
        centerX,
        centerY + crossSize
      );
      this.graphics.strokeCircle(centerX, centerY, 25);
      return;
    }

    // Draw layered reticles for each die (largest first, so smallest is on top)
    const sortedDice = [...this.selectedDice].sort((a, b) => b - a);

    sortedDice.forEach((die, index) => {
      const sides = this.getDicePolygonSides(die);
      const baseRadius = this.getDiceRadius(die);
      const color = this.getDiceColor(die);

      // Slight offset for layered effect
      const layerOffset = index * 2;
      const radius = baseRadius - layerOffset;

      // Rotation animation (slower for larger dice)
      const rotationSpeed = 0.0003 / (die / 10);
      const rotation = time * rotationSpeed + slowPulse;

      // Outer glow
      this.graphics.lineStyle(4, color, 0.2 * pulse);
      this.drawPolygon(centerX, centerY, radius + 5, sides, rotation);

      // Main shape
      this.graphics.lineStyle(2, color, 0.7 * pulse);
      this.drawPolygon(centerX, centerY, radius, sides, rotation);

      // Inner shape (smaller, slightly offset rotation)
      this.graphics.lineStyle(1, color, 0.4 * pulse);
      this.drawPolygon(centerX, centerY, radius * 0.6, sides, -rotation * 0.5);
    });

    // Central crosshair
    const crossSize = 8;
    this.graphics.lineStyle(1, 0xffffff, 0.6);
    this.graphics.lineBetween(
      centerX - crossSize,
      centerY,
      centerX + crossSize,
      centerY
    );
    this.graphics.lineBetween(
      centerX,
      centerY - crossSize,
      centerX,
      centerY + crossSize
    );

    // Central dot
    this.graphics.fillStyle(0xffffff, 0.8);
    this.graphics.fillCircle(centerX, centerY, 3);

    // Update stored radius (use largest die)
    this._radius = this.getDiceRadius(Math.max(...this.selectedDice));
  }

  /**
   * Get polygon sides based on dice type
   */
  private getDicePolygonSides(diceSides: number): number {
    switch (diceSides) {
      case 4:
        return 3; // d4 = triangle
      case 6:
        return 4; // d6 = square
      case 8:
        return 8; // d8 = octagon
      case 10:
        return 10; // d10 = decagon
      case 12:
        return 12; // d12 = dodecagon
      case 20:
        return 20; // d20 = almost circle
      default:
        return 6;
    }
  }

  /**
   * Get radius based on dice value (larger dice = bigger reticle)
   */
  private getDiceRadius(diceSides: number): number {
    // Scale from 70 (d4) to 240 (d20) - doubled for visibility
    const minRadius = 70;
    const maxRadius = 240;
    const t = (diceSides - 4) / (20 - 4); // normalize 4-20 to 0-1
    return minRadius + t * (maxRadius - minRadius);
  }

  /**
   * Get color based on dice type
   */
  private getDiceColor(diceSides: number): number {
    switch (diceSides) {
      case 4:
        return 0x8b4513; // brown
      case 6:
        return 0xcd853f; // tan
      case 8:
        return 0x9b59b6; // purple
      case 10:
        return 0x27ae60; // green
      case 12:
        return 0x2980b9; // blue
      case 20:
        return 0xc4a000; // gold
      default:
        return 0x666666;
    }
  }

  /**
   * Draw a regular polygon
   */
  private drawPolygon(
    centerX: number,
    centerY: number,
    radius: number,
    sides: number,
    rotation: number = 0
  ): void {
    const angleStep = (Math.PI * 2) / sides;
    const startAngle = rotation - Math.PI / 2; // Start from top

    this.graphics.beginPath();
    for (let i = 0; i <= sides; i++) {
      const angle = startAngle + i * angleStep;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      if (i === 0) {
        this.graphics.moveTo(x, y);
      } else {
        this.graphics.lineTo(x, y);
      }
    }
    this.graphics.closePath();
    this.graphics.strokePath();
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.graphics.destroy();
  }
}
