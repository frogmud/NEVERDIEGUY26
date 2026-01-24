/**
 * ASCII Art Generation Utilities
 * Converts images to ASCII and generates SVG output
 */

import { luminanceToChar, CHAR_SET_DENSE } from './charSets';
import type { AsciiOptions } from '../types';

/**
 * Convert an image URL to an ASCII character grid
 */
export async function imageToAsciiGrid(
  imageUrl: string,
  options: AsciiOptions
): Promise<string[]> {
  const { cols, rows, charSet = CHAR_SET_DENSE, threshold = 0.1 } = options;

  // Create offscreen canvas
  const canvas = document.createElement('canvas');
  canvas.width = cols;
  canvas.height = rows;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  // Load image
  const img = await loadImage(imageUrl);

  // Draw image to canvas
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, cols, rows);
  ctx.drawImage(img, 0, 0, cols, rows);

  // Get pixel data
  const imageData = ctx.getImageData(0, 0, cols, rows);
  const pixels = imageData.data;

  // Convert to ASCII
  const grid: string[] = [];
  for (let y = 0; y < rows; y++) {
    let row = '';
    for (let x = 0; x < cols; x++) {
      const i = (y * cols + x) * 4;
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      const a = pixels[i + 3];

      // Calculate relative luminance (ITU-R BT.709)
      let luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
      luminance *= a / 255;

      // Apply threshold
      if (luminance < threshold) {
        row += ' ';
      } else {
        row += luminanceToChar(luminance, charSet);
      }
    }
    grid.push(row);
  }

  return grid;
}

/**
 * Generate SVG from ASCII grid
 */
export function asciiGridToSvg(
  grid: string[],
  options: {
    fontSize?: number;
    fontFamily?: string;
    color?: string;
    backgroundColor?: string;
  } = {}
): string {
  const {
    fontSize = 12,
    fontFamily = 'monospace',
    color = '#e0e0e0',
    backgroundColor = 'transparent',
  } = options;

  const lineHeight = fontSize * 1.2;
  const charWidth = fontSize * 0.6; // Approximate monospace width
  const width = grid[0]?.length * charWidth || 0;
  const height = grid.length * lineHeight;

  const textElements = grid
    .map((row, y) => {
      // Escape special XML characters
      const escaped = row
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      return `  <text x="0" y="${(y + 1) * lineHeight}" fill="${color}">${escaped}</text>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <style>
    text {
      font-family: ${fontFamily};
      font-size: ${fontSize}px;
      white-space: pre;
    }
  </style>
  ${backgroundColor !== 'transparent' ? `<rect width="100%" height="100%" fill="${backgroundColor}"/>` : ''}
${textElements}
</svg>`;
}

/**
 * Load an image from URL
 */
function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    img.src = url;
  });
}

/**
 * Default grid sizes
 */
export const ASCII_GRID_PRESETS = {
  small: { cols: 28, rows: 16 },
  medium: { cols: 40, rows: 24 },
  large: { cols: 56, rows: 32 },
} as const;

export type AsciiGridPreset = keyof typeof ASCII_GRID_PRESETS;
