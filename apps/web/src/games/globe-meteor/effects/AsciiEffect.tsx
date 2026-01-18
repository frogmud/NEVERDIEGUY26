/**
 * ASCII Post-Processing Effect
 *
 * Renders the 3D scene to ASCII art using shape-vector matching.
 * Based on Alex Harri's technique: https://alexharri.com/blog/ascii-rendering
 *
 * NEVER DIE GUY
 */

import { useRef, useMemo, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// APL character set ordered by visual density (lightest to darkest)
const APL_CHARS = ' .·∘⋄○⌽⊖⌾⍉←→↑↓⍳⍴~∊⊂⊃∩∪⌷⍸⌹⍟⍱⍲∧∨⊥⊤⌈⌊⍋⍒⍎⍕⌺⍝⎕⍞⌸⍷≡≢';

// Precomputed character brightness values (0-1)
const CHAR_BRIGHTNESS: number[] = [];

interface AsciiEffectProps {
  /** Character cell size in pixels */
  cellSize?: number;
  /** Primary color for ASCII characters */
  color?: string;
  /** Glow color for bright areas */
  glowColor?: string;
  /** Contrast exponent (higher = more contrast) */
  contrast?: number;
  /** Enable the effect */
  enabled?: boolean;
}

/**
 * Precompute brightness values for each character
 * This is a simplified version - ideally we'd measure actual glyph density
 */
function initCharBrightness() {
  if (CHAR_BRIGHTNESS.length > 0) return;

  for (let i = 0; i < APL_CHARS.length; i++) {
    // Linear mapping based on position in density-sorted array
    CHAR_BRIGHTNESS.push(i / (APL_CHARS.length - 1));
  }
}

/**
 * Find the character that best matches a brightness value
 */
function getCharForBrightness(brightness: number): string {
  const index = Math.floor(brightness * (APL_CHARS.length - 1));
  return APL_CHARS[Math.max(0, Math.min(APL_CHARS.length - 1, index))];
}

/**
 * AsciiEffect - Post-processing effect that converts 3D scene to ASCII
 */
export function AsciiEffect({
  cellSize = 12,
  color = '#8b7355',
  glowColor = '#c4a882',
  contrast = 1.8,
  enabled = true,
}: AsciiEffectProps) {
  const { gl, scene, camera, size } = useThree();

  // Initialize character brightness lookup
  useMemo(() => initCharBrightness(), []);

  // Create render target for capturing the scene
  const renderTarget = useMemo(() => {
    return new THREE.WebGLRenderTarget(size.width, size.height, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
    });
  }, [size.width, size.height]);

  // Canvas for ASCII output
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  // Create overlay canvas
  useEffect(() => {
    if (!enabled) return;

    // Create canvas element
    const canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '10';
    canvas.width = size.width;
    canvas.height = size.height;

    // Get the canvas container
    const container = gl.domElement.parentElement;
    if (container) {
      container.appendChild(canvas);
    }

    canvasRef.current = canvas;
    ctxRef.current = canvas.getContext('2d');

    return () => {
      if (container && canvas.parentElement === container) {
        container.removeChild(canvas);
      }
      canvasRef.current = null;
      ctxRef.current = null;
    };
  }, [enabled, gl.domElement, size.width, size.height]);

  // Update canvas size when viewport changes
  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.width = size.width;
      canvasRef.current.height = size.height;
    }
  }, [size.width, size.height]);

  // Render ASCII effect each frame
  useFrame(() => {
    if (!enabled || !ctxRef.current || !canvasRef.current) return;

    const ctx = ctxRef.current;
    const canvas = canvasRef.current;

    // Render scene to texture
    gl.setRenderTarget(renderTarget);
    gl.render(scene, camera);
    gl.setRenderTarget(null);

    // Read pixels from render target
    const pixels = new Uint8Array(size.width * size.height * 4);
    gl.readRenderTargetPixels(renderTarget, 0, 0, size.width, size.height, pixels);

    // Clear ASCII canvas
    ctx.fillStyle = '#050508';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Set up font
    ctx.font = `${cellSize}px "APL385 Unicode", "IBM Plex Mono", monospace`;
    ctx.textBaseline = 'top';

    const cols = Math.floor(size.width / (cellSize * 0.7));
    const rows = Math.floor(size.height / cellSize);
    const cellWidth = size.width / cols;
    const cellHeight = size.height / rows;

    // Process each cell
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        // Sample center of cell
        const px = Math.floor((col + 0.5) * cellWidth);
        const py = Math.floor((row + 0.5) * cellHeight);

        // Flip Y because WebGL texture is upside down
        const flippedY = size.height - 1 - py;
        const idx = (flippedY * size.width + px) * 4;

        // Get RGB values
        const r = pixels[idx] / 255;
        const g = pixels[idx + 1] / 255;
        const b = pixels[idx + 2] / 255;

        // Calculate luminance
        let brightness = 0.299 * r + 0.587 * g + 0.114 * b;

        // Apply contrast enhancement
        brightness = Math.pow(brightness, 1 / contrast);

        // Get character
        const char = getCharForBrightness(brightness);

        if (char === ' ') continue;

        // Set color based on brightness
        if (brightness > 0.6) {
          ctx.fillStyle = glowColor;
        } else {
          ctx.fillStyle = color;
        }

        ctx.globalAlpha = 0.7 + brightness * 0.3;
        ctx.fillText(char, col * cellWidth, row * cellHeight);
      }
    }

    ctx.globalAlpha = 1;
  }, 1); // Run after scene render

  // Cleanup render target
  useEffect(() => {
    return () => {
      renderTarget.dispose();
    };
  }, [renderTarget]);

  return null;
}

export default AsciiEffect;
