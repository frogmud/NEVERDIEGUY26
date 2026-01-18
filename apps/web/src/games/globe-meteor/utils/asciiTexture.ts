/**
 * APL/ASCII Texture Generator
 *
 * Generates dynamic canvas textures with APL characters for 3D spheres.
 * Updates based on camera position for that "living" feel.
 * Uses density-sorted APL glyphs for proper visual gradient.
 *
 * NEVER DIE GUY
 */

import * as THREE from 'three';

// APL character set - ordered by visual density (lightest to darkest)
// Based on Harri's technique for probability corruption rendering
const APL_BY_DENSITY = [
  // Lightest (empty/sparse)
  ' ', '.', '¯', '∘', '⋄', '∙',
  // Light
  '○', '⌽', '⊖', '⌾', '⍉',
  // Light-Medium
  '←', '→', '↑', '↓', '⍳', '⍴', '~',
  // Medium
  '∊', '⊂', '⊃', '∩', '∪', '⌷', '⍸',
  // Medium-Dark
  '⌹', '⍟', '⍱', '⍲', '∧', '∨', '⊥', '⊤',
  // Dark
  '⌈', '⌊', '⍋', '⍒', '⍎', '⍕',
  // Darkest (most filled)
  '⌺', '⍝', '⎕', '⍞', '⌸', '⍷', '⌻', '⍀', '⌿', '⍂', '≡', '≢',
];

// Flattened gradient string for quick lookup
const APL_GRADIENT = APL_BY_DENSITY.join('');

// APL operators for terrain features (medium density)
const APL_TERRAIN = '⍳⍴⍵⍺∊⍷⌈⌊×÷⌽⊖⍉↑↓⊂⊃⌷⍋⍒∇∆';

// High-energy glyphs for bright spots (solid/filled glyphs)
const APL_BRIGHT = '⎕⌸⌹⍞≡≢⌺⍷';

// Seeded random for consistent terrain
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
}

interface AsciiTextureOptions {
  width?: number;
  height?: number;
  charSize?: number;
  primaryColor?: string;
  glowColor?: string;
  /** Light direction for shading [x, y, z] normalized */
  lightDir?: [number, number, number];
  /** Seed for terrain generation */
  seed?: number;
  /** Time offset for animation */
  time?: number;
}

/**
 * AsciiTextureManager - Creates and updates ASCII textures dynamically
 */
export class AsciiTextureManager {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private texture: THREE.CanvasTexture;
  private options: Required<AsciiTextureOptions>;
  private terrainMap: number[][] = [];
  private glyphMap: string[][] = [];

  constructor(options: AsciiTextureOptions = {}) {
    this.options = {
      width: options.width ?? 2048,      // Higher resolution for crispness
      height: options.height ?? 1024,
      charSize: options.charSize ?? 16,   // Larger chars for APL glyphs
      primaryColor: options.primaryColor ?? '#8b7355',
      glowColor: options.glowColor ?? '#a89078',
      lightDir: options.lightDir ?? [-0.3, 0.4, 0.8],
      seed: options.seed ?? 42,
      time: options.time ?? 0,
    };

    // Create canvas
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.options.width;
    this.canvas.height = this.options.height;
    this.ctx = this.canvas.getContext('2d')!;

    // Generate static terrain and glyph maps
    this.generateTerrainMap();
    this.generateGlyphMap();

    // Create texture
    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.wrapS = THREE.RepeatWrapping;
    this.texture.wrapT = THREE.ClampToEdgeWrapping;

    // Initial render
    this.render();
  }

  private generateTerrainMap(): void {
    const { width, height, charSize, seed } = this.options;
    const charWidth = charSize * 0.7;  // APL glyphs are roughly square
    const cols = Math.floor(width / charWidth);
    const rows = Math.floor(height / charSize);

    this.terrainMap = [];
    for (let row = 0; row < rows; row++) {
      const rowData: number[] = [];
      for (let col = 0; col < cols; col++) {
        // Multi-octave noise for terrain
        const n1 = seededRandom(seed + col * 0.1 + row * 0.13) * 0.5;
        const n2 = seededRandom(seed + col * 0.3 + row * 0.27) * 0.3;
        const n3 = seededRandom(seed + col * 0.7 + row * 0.61) * 0.2;
        rowData.push(n1 + n2 + n3);
      }
      this.terrainMap.push(rowData);
    }
  }

  private generateGlyphMap(): void {
    const { width, height, charSize, seed } = this.options;
    const charWidth = charSize * 0.7;  // APL glyphs are roughly square
    const cols = Math.floor(width / charWidth);
    const rows = Math.floor(height / charSize);

    this.glyphMap = [];
    for (let row = 0; row < rows; row++) {
      const rowData: string[] = [];
      for (let col = 0; col < cols; col++) {
        // Pick a random terrain glyph for variety
        const glyphSeed = seededRandom(seed * 2 + col * 7 + row * 13);
        if (glyphSeed > 0.85) {
          // Occasional special glyph
          const idx = Math.floor(glyphSeed * APL_TERRAIN.length) % APL_TERRAIN.length;
          rowData.push(APL_TERRAIN[idx]);
        } else {
          rowData.push(''); // Will use gradient-based glyph
        }
      }
      this.glyphMap.push(rowData);
    }
  }

  /**
   * Update the texture with new light direction
   */
  update(lightDir?: [number, number, number], time?: number): void {
    if (lightDir) {
      this.options.lightDir = lightDir;
    }
    if (time !== undefined) {
      this.options.time = time;
    }
    this.render();
    this.texture.needsUpdate = true;
  }

  /**
   * Apply contrast enhancement (Harri technique)
   * Makes dark areas darker and bright areas brighter
   */
  private applyContrast(brightness: number, exponent: number = 1.8): number {
    return Math.pow(brightness, exponent);
  }

  /**
   * Render the ASCII art to canvas
   */
  private render(): void {
    const { width, height, charSize, primaryColor, glowColor, lightDir, time } = this.options;
    const charWidth = charSize * 0.7;  // APL glyphs are roughly square
    const cols = Math.floor(width / charWidth);
    const rows = Math.floor(height / charSize);

    // Clear canvas and fill with solid dark background
    this.ctx.clearRect(0, 0, width, height);
    this.ctx.fillStyle = '#050508';  // Near-black with slight blue tint
    this.ctx.fillRect(0, 0, width, height);

    // Set up font - APL385 with IBM Plex Mono fallback
    this.ctx.font = `${charSize}px "APL385 Unicode", "IBM Plex Mono", monospace`;
    this.ctx.textBaseline = 'top';

    // Normalize light direction
    const lLen = Math.sqrt(lightDir[0] ** 2 + lightDir[1] ** 2 + lightDir[2] ** 2);
    const lx = lightDir[0] / lLen;
    const ly = lightDir[1] / lLen;
    const lz = lightDir[2] / lLen;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        // UV coordinates (0-1)
        const u = col / cols;
        const v = row / rows;

        // Convert UV to sphere normal (equirectangular projection)
        const theta = u * Math.PI * 2;
        const phi = v * Math.PI;

        const nx = Math.sin(phi) * Math.cos(theta);
        const ny = Math.cos(phi);
        const nz = Math.sin(phi) * Math.sin(theta);

        // Lighting calculation
        const lightDot = nx * lx + ny * ly + nz * lz;

        // Rim lighting at edges for depth
        const rimFactor = 1 - Math.abs(nz);
        const rimLight = rimFactor * 0.12;

        // Get terrain height
        const terrain = this.terrainMap[row]?.[col] ?? 0;

        // Base brightness from lighting + terrain + rim
        let brightness = Math.max(0.08, Math.min(1, (lightDot + 0.6) * 0.65 + terrain * 0.2 + rimLight));

        // Apply contrast enhancement
        brightness = this.applyContrast(brightness);

        // Subtle time-based shimmer (reduced from 0.05 to 0.02)
        const shimmer = Math.sin(time * 0.5 + col * 0.05 + row * 0.04) * 0.02;
        brightness = Math.max(0.05, Math.min(1, brightness + shimmer));

        // Pick character from density-sorted APL set
        let char: string;
        const specialGlyph = this.glyphMap[row]?.[col];

        if (specialGlyph && brightness > 0.3) {
          // Use pre-assigned terrain glyph
          char = specialGlyph;
        } else if (brightness > 0.8) {
          // Bright spots get high-energy glyphs (solid/filled)
          const idx = Math.floor((brightness - 0.8) * 5 * APL_BRIGHT.length) % APL_BRIGHT.length;
          char = APL_BRIGHT[idx];
        } else {
          // Standard gradient from density-sorted set
          const charIndex = Math.floor(brightness * (APL_GRADIENT.length - 1));
          char = APL_GRADIENT[charIndex];
        }

        if (char === ' ') continue;

        // Position
        const px = col * charWidth;
        const py = row * charSize;

        // Color - interpolate based on brightness
        if (brightness > 0.65) {
          this.ctx.fillStyle = glowColor;
        } else if (brightness > 0.35) {
          this.ctx.fillStyle = primaryColor;
        } else {
          // Darker areas - slightly dimmer version of primary
          this.ctx.fillStyle = primaryColor;
        }

        this.ctx.globalAlpha = 0.65 + brightness * 0.35;
        this.ctx.fillText(char, px, py);
      }
    }
  }

  getTexture(): THREE.CanvasTexture {
    return this.texture;
  }

  dispose(): void {
    this.texture.dispose();
  }
}

/**
 * Simple function for static texture generation (backwards compatible)
 */
export function generateAsciiTexture(options: AsciiTextureOptions = {}): THREE.CanvasTexture {
  const manager = new AsciiTextureManager(options);
  return manager.getTexture();
}
