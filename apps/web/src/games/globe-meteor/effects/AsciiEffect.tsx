/**
 * ASCII Post-Processing Effect
 *
 * Renders the 3D scene to ASCII art using shape-vector matching.
 * Based on Alex Harri's technique: https://alexharri.com/blog/ascii-rendering
 *
 * NEVER DIE GUY
 */

import { useRef, useMemo, useEffect, useCallback } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// APL character set ordered by visual density (lightest to darkest)
const APL_CHARS = ' .·∘⋄○⌽⊖⌾⍉←→↑↓⍳⍴~∊⊂⊃∩∪⌷⍸⌹⍟⍱⍲∧∨⊥⊤⌈⌊⍋⍒⍎⍕⌺⍝⎕⍞⌸⍷≡≢';

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
  cellSize = 8,
  color = '#8b7355',
  glowColor = '#c4a882',
  contrast = 1.6,
  enabled = true,
}: AsciiEffectProps) {
  const { gl, scene, camera, size } = useThree();

  // Use device pixel ratio for crisp rendering
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const width = Math.floor(size.width * dpr);
  const height = Math.floor(size.height * dpr);

  // Canvas and context refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  // Pixel buffer ref (reuse to avoid allocation)
  const pixelsRef = useRef<Uint8Array | null>(null);

  // Render target ref - managed manually to ensure proper disposal on resize
  const renderTargetRef = useRef<THREE.WebGLRenderTarget | null>(null);

  // Frame skip for 12fps throttle (GPU readback is expensive)
  const frameSkipRef = useRef(0);
  const FRAME_SKIP = 5; // Run every 5th frame = ~12fps at 60fps base

  // Create/recreate render target on size change, disposing old one first
  useEffect(() => {
    // Dispose old render target if it exists
    if (renderTargetRef.current) {
      renderTargetRef.current.dispose();
    }

    // Create new render target
    renderTargetRef.current = new THREE.WebGLRenderTarget(width, height, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      colorSpace: THREE.SRGBColorSpace,
    });

    // Also update pixel buffer
    pixelsRef.current = new Uint8Array(width * height * 4);

    // Cleanup on unmount
    return () => {
      if (renderTargetRef.current) {
        renderTargetRef.current.dispose();
        renderTargetRef.current = null;
      }
    };
  }, [width, height]);

  // Create overlay canvas
  useEffect(() => {
    if (!enabled) {
      // Remove canvas if disabled
      if (canvasRef.current) {
        canvasRef.current.remove();
        canvasRef.current = null;
        ctxRef.current = null;
      }
      return;
    }

    // Create canvas element
    const canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '10';
    canvas.width = width;
    canvas.height = height;

    // Get the canvas container
    const container = gl.domElement.parentElement;
    if (container) {
      container.style.position = 'relative';
      container.appendChild(canvas);
    }

    canvasRef.current = canvas;
    ctxRef.current = canvas.getContext('2d', { alpha: false });

    return () => {
      if (canvas.parentElement) {
        canvas.parentElement.removeChild(canvas);
      }
      canvasRef.current = null;
      ctxRef.current = null;
    };
  }, [enabled, gl.domElement, width, height]);

  // Update canvas size when viewport changes
  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.width = width;
      canvasRef.current.height = height;
    }
  }, [width, height]);

  // Render ASCII effect - runs AFTER scene render (priority > 0)
  // Throttled to ~12fps to avoid GPU sync stalls from readRenderTargetPixels
  useFrame(() => {
    if (!enabled || !ctxRef.current || !canvasRef.current || !pixelsRef.current || !renderTargetRef.current) return;

    // Throttle to 12fps (every 5th frame) - GPU readback is expensive
    frameSkipRef.current = (frameSkipRef.current + 1) % FRAME_SKIP;
    if (frameSkipRef.current !== 0) return;

    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    const pixels = pixelsRef.current;
    const renderTarget = renderTargetRef.current;

    // Store current render target
    const currentRT = gl.getRenderTarget();

    // Render scene to our target
    gl.setRenderTarget(renderTarget);
    gl.clear();
    gl.render(scene, camera);

    // Read pixels
    gl.readRenderTargetPixels(renderTarget, 0, 0, width, height, pixels);

    // Restore previous render target
    gl.setRenderTarget(currentRT);

    // Clear ASCII canvas with dark background
    ctx.fillStyle = '#050508';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Set up font - use monospace for consistent character width
    const fontSize = Math.floor(cellSize * dpr);
    ctx.font = `${fontSize}px "IBM Plex Mono", "Menlo", monospace`;
    ctx.textBaseline = 'top';

    // Calculate grid
    const charWidth = fontSize * 0.6;
    const charHeight = fontSize;
    const cols = Math.floor(width / charWidth);
    const rows = Math.floor(height / charHeight);

    // Process each cell
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        // Sample center of cell in pixel coordinates
        const px = Math.floor((col + 0.5) * charWidth);
        const py = Math.floor((row + 0.5) * charHeight);

        // WebGL textures are Y-flipped
        const flippedY = height - 1 - py;

        // Bounds check
        if (px < 0 || px >= width || flippedY < 0 || flippedY >= height) continue;

        const idx = (flippedY * width + px) * 4;

        // Get RGB values (0-1)
        const r = pixels[idx] / 255;
        const g = pixels[idx + 1] / 255;
        const b = pixels[idx + 2] / 255;

        // Calculate luminance using standard coefficients
        let brightness = 0.299 * r + 0.587 * g + 0.114 * b;

        // Apply contrast curve
        brightness = Math.pow(brightness, 1 / contrast);

        // Get character based on brightness
        const char = getCharForBrightness(brightness);

        // Skip spaces (empty areas)
        if (char === ' ' || brightness < 0.02) continue;

        // Set color - brighter pixels get glow color
        ctx.fillStyle = brightness > 0.5 ? glowColor : color;
        ctx.globalAlpha = 0.6 + brightness * 0.4;

        // Draw character
        ctx.fillText(char, col * charWidth, row * charHeight);
      }
    }

    ctx.globalAlpha = 1;
  }, 100); // High priority number = runs later, after main render

  return null;
}

export default AsciiEffect;
