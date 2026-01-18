/**
 * SVG to ASCII Conversion Utility
 *
 * Converts SVG images to ASCII character grids by sampling
 * luminance values and mapping to characters.
 */

import { luminanceToChar, CHAR_SET_DENSE } from './charSets';

export interface SvgToAsciiOptions {
  /** Number of columns in output grid */
  cols: number;
  /** Number of rows in output grid */
  rows: number;
  /** Character set to use (default: CHAR_SET_DENSE) */
  charSet?: string;
  /** Brightness threshold (0-1, chars below this become spaces) */
  threshold?: number;
  /** Invert brightness (white becomes darkest char) */
  invert?: boolean;
}

/**
 * Convert an SVG image to an ASCII character grid.
 *
 * @param svgUrl URL to the SVG image (can be data URL or file path)
 * @param options Conversion options
 * @returns Promise resolving to array of strings (each string is a row)
 */
export async function svgToAsciiGrid(
  svgUrl: string,
  options: SvgToAsciiOptions
): Promise<string[]> {
  const { cols, rows, charSet = CHAR_SET_DENSE, threshold = 0.1, invert = false } = options;

  // Create offscreen canvas
  const canvas = document.createElement('canvas');
  canvas.width = cols;
  canvas.height = rows;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  // Load and draw SVG
  const img = await loadImage(svgUrl);
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

      // Apply alpha
      luminance *= a / 255;

      // Invert if needed
      if (invert) {
        luminance = 1 - luminance;
      }

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
 * Pre-computed skull ASCII grid (50x56 SVG at 24x28 resolution)
 *
 * This is the result of running svgToAsciiGrid on ndg-skull-dome.svg
 * with cols=24, rows=28. Pre-computed to avoid runtime conversion.
 */
export const SKULL_ASCII_GRID: string[] = [
  '                        ',
  '                        ',
  '      ##########        ',
  '    ##############      ',
  '   ################     ',
  '  ##################    ',
  '  ##################    ',
  '  ##################    ',
  '  ##  ########  ##      ',
  '  ##  ########  ##      ',
  '  ##################    ',
  '  ##################    ',
  '       ########         ',
  '       ########         ',
  '                        ',
  '                        ',
  '    ##############      ',
  '    ##          ##      ',
  '    ##  ######  ##      ',
  '    ##  ######  ##      ',
  '    ##############      ',
  '                        ',
  '                        ',
  '                        ',
  '                        ',
  '                        ',
  '                        ',
  '                        ',
];

/**
 * Generate ASCII grid at runtime (for customization)
 */
export async function generateSkullGrid(
  cols: number = 24,
  rows: number = 28
): Promise<string[]> {
  return svgToAsciiGrid('/logos/ndg-skull-dome.svg', {
    cols,
    rows,
    charSet: CHAR_SET_DENSE,
    threshold: 0.2,
    invert: false,
  });
}
