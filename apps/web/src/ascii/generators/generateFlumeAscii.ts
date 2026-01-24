/**
 * Flume ASCII Generator
 *
 * Pre-generates ASCII art frames from flume SVG sequences.
 * Run this in the browser console or as a dev script to generate
 * the ASCII data, then paste into flumeAsciiData.ts
 *
 * Usage (in browser console):
 *   import { generateFlumeAsciiData } from './ascii/generators/generateFlumeAscii';
 *   generateFlumeAsciiData().then(data => console.log(JSON.stringify(data, null, 2)));
 */

import { svgToAsciiGrid } from '../utils/svgToAscii';

// Character set matching the skull/planet aesthetic
const FLUME_CHAR_SET = ' .l1UVn~CE@';

// Domain-to-flume mapping (from PortalSelection)
const DOMAIN_FLUME_MAP: Record<number, { dir: string; frames: number[] }> = {
  1: { dir: 'flume-00001', frames: [1, 10, 20, 30, 40, 50, 60, 70, 80, 90] }, // Earth
  2: { dir: 'flume-00007', frames: [25, 35, 45, 55, 65, 75, 85, 95] },        // Frost
  3: { dir: 'flume-00003', frames: [50, 60, 70, 80, 90, 1, 10, 20, 30, 40] }, // Infernus
  4: { dir: 'flume-00004', frames: [10, 20, 30, 40, 50, 60, 70, 80, 90] },    // Shadow
  5: { dir: 'flume-00010', frames: [1, 10, 20, 30, 40, 50, 60, 70, 80] },     // Null
  6: { dir: 'flume-00005', frames: [70, 80, 90, 1, 10, 20, 30, 40, 50, 60] }, // Aberrant
};

export interface FlumeAsciiFrame {
  frameNum: number;
  grid: string[];
}

export interface FlumeAsciiData {
  domainId: number;
  flumeDir: string;
  frames: FlumeAsciiFrame[];
}

/**
 * Generate ASCII art for a single flume frame
 */
async function generateFrameAscii(
  flumeDir: string,
  frameNum: number,
  cols: number = 28,
  rows: number = 16
): Promise<string[]> {
  const paddedFrame = String(frameNum).padStart(2, '0');
  const url = `/assets/flumes-svg/cursed/${flumeDir}/frame-${paddedFrame}.svg`;

  try {
    const grid = await svgToAsciiGrid(url, {
      cols,
      rows,
      charSet: FLUME_CHAR_SET,
      threshold: 0.15,
      invert: false,
    });
    return grid;
  } catch (error) {
    console.error(`Failed to convert ${url}:`, error);
    return Array(rows).fill(' '.repeat(cols));
  }
}

/**
 * Generate ASCII data for all domains
 * Call this function and copy the output to flumeAsciiData.ts
 */
export async function generateFlumeAsciiData(): Promise<FlumeAsciiData[]> {
  const results: FlumeAsciiData[] = [];

  for (const [domainId, config] of Object.entries(DOMAIN_FLUME_MAP)) {
    console.log(`Generating ASCII for domain ${domainId} (${config.dir})...`);

    const frames: FlumeAsciiFrame[] = [];

    for (const frameNum of config.frames) {
      console.log(`  Frame ${frameNum}...`);
      const grid = await generateFrameAscii(config.dir, frameNum);
      frames.push({ frameNum, grid });
    }

    results.push({
      domainId: parseInt(domainId),
      flumeDir: config.dir,
      frames,
    });
  }

  console.log('Done! Copy the output below to flumeAsciiData.ts');
  return results;
}

/**
 * Quick preview - generate a single frame for testing
 */
export async function previewFrame(domainId: number, frameNum: number): Promise<void> {
  const config = DOMAIN_FLUME_MAP[domainId];
  if (!config) {
    console.error('Invalid domain ID');
    return;
  }

  const grid = await generateFrameAscii(config.dir, frameNum);
  console.log(`Domain ${domainId}, Frame ${frameNum}:`);
  console.log(grid.join('\n'));
}
