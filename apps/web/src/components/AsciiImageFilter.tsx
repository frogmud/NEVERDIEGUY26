/**
 * AsciiImageFilter - Converts images/videos to ASCII art in real-time
 *
 * Samples pixel brightness and renders APL characters.
 * Works with any image source (img, video, canvas).
 *
 * NEVER DIE GUY
 */

import { useRef, useEffect, useCallback } from 'react';
import { Box } from '@mui/material';

// APL character set ordered by visual density (lightest to darkest)
const APL_CHARS = ' .·∘⋄○⌽⊖⌾⍉←→↑↓⍳⍴~∊⊂⊃∩∪⌷⍸⌹⍟⍱⍲∧∨⊥⊤⌈⌊⍋⍒⍎⍕⌺⍝⎕⍞⌸⍷≡≢';

interface AsciiImageFilterProps {
  /** Source image URL */
  src: string;
  /** Width of the container */
  width: number | string;
  /** Height of the container */
  height: number | string;
  /** Character cell size in pixels */
  cellSize?: number;
  /** Primary color for ASCII characters */
  color?: string;
  /** Glow color for bright areas */
  glowColor?: string;
  /** Contrast exponent (higher = more contrast) */
  contrast?: number;
  /** Opacity of the ASCII overlay (0-1) */
  opacity?: number;
  /** Whether to show the original image behind */
  showOriginal?: boolean;
  /** Callback when image fails to load */
  onError?: () => void;
  /** Additional styles */
  sx?: object;
}

/**
 * Get the character that best matches a brightness value
 */
function getCharForBrightness(brightness: number): string {
  const index = Math.floor(brightness * (APL_CHARS.length - 1));
  return APL_CHARS[Math.max(0, Math.min(APL_CHARS.length - 1, index))];
}

/**
 * AsciiImageFilter - Real-time ASCII art filter for images
 */
export function AsciiImageFilter({
  src,
  width,
  height,
  cellSize = 8,
  color = '#8b7355',
  glowColor = '#c4a882',
  contrast = 1.6,
  opacity = 1,
  showOriginal = false,
  onError,
  sx = {},
}: AsciiImageFilterProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const animationRef = useRef<number>(0);

  const renderAscii = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !img.complete || img.naturalWidth === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Get actual dimensions
    const containerWidth = typeof width === 'number' ? width : canvas.clientWidth || 200;
    const containerHeight = typeof height === 'number' ? height : canvas.clientHeight || 200;

    // Set canvas size
    canvas.width = containerWidth;
    canvas.height = containerHeight;

    // Calculate grid
    const charWidth = cellSize * 0.7;
    const cols = Math.floor(containerWidth / charWidth);
    const rows = Math.floor(containerHeight / cellSize);

    if (cols <= 0 || rows <= 0) return;

    // Create offscreen canvas for image sampling
    const offscreen = document.createElement('canvas');
    offscreen.width = cols;
    offscreen.height = rows;
    const offCtx = offscreen.getContext('2d');
    if (!offCtx) return;

    // Draw image scaled down to grid size for sampling
    offCtx.drawImage(img, 0, 0, cols, rows);
    const imageData = offCtx.getImageData(0, 0, cols, rows);
    const pixels = imageData.data;

    // Clear and set background
    ctx.fillStyle = '#050508';
    ctx.fillRect(0, 0, containerWidth, containerHeight);

    // Set up font
    ctx.font = `${cellSize}px "APL385 Unicode", "IBM Plex Mono", monospace`;
    ctx.textBaseline = 'top';

    // Process each cell
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const idx = (row * cols + col) * 4;

        // Get RGB values
        const r = pixels[idx] / 255;
        const g = pixels[idx + 1] / 255;
        const b = pixels[idx + 2] / 255;
        const a = pixels[idx + 3] / 255;

        // Skip transparent pixels
        if (a < 0.1) continue;

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

        ctx.globalAlpha = (0.7 + brightness * 0.3) * opacity * a;
        ctx.fillText(char, col * charWidth, row * cellSize);
      }
    }

    ctx.globalAlpha = 1;
  }, [width, height, cellSize, color, glowColor, contrast, opacity]);

  // Load image and render
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      imgRef.current = img;
      renderAscii();
    };

    img.onerror = () => {
      onError?.();
    };

    img.src = src;

    return () => {
      imgRef.current = null;
    };
  }, [src, renderAscii, onError]);

  // Re-render when src changes (for animations)
  useEffect(() => {
    if (imgRef.current) {
      renderAscii();
    }
  }, [src, renderAscii]);

  return (
    <Box
      sx={{
        position: 'relative',
        width,
        height,
        overflow: 'hidden',
        ...sx,
      }}
    >
      {/* Original image (hidden or shown behind) */}
      {showOriginal && (
        <Box
          component="img"
          src={src}
          alt=""
          sx={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: 0.3,
          }}
        />
      )}

      {/* ASCII canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
        }}
      />
    </Box>
  );
}

export default AsciiImageFilter;
