/**
 * vtracer Command Generator
 * Generates shell commands for vectorization
 */

import type { VtracerPreset, VtracerConfig } from '../types';

/**
 * vtracer preset configurations
 */
export const VTRACER_PRESETS: Record<VtracerPreset, VtracerConfig> = {
  // Icon presets (16, 32, 64px)
  'icon-16': {
    size: 16,
    colorPrecision: 4,
    filterSpeckle: 8,
    cornerThreshold: 45,
    mode: 'polygon',
  },
  'icon-32': {
    size: 32,
    colorPrecision: 5,
    filterSpeckle: 6,
    cornerThreshold: 50,
    mode: 'polygon',
  },
  'icon-64': {
    size: 64,
    colorPrecision: 6,
    filterSpeckle: 4,
    cornerThreshold: 55,
    mode: 'polygon',
  },
  // Portrait presets (60, 120, 240px)
  'portrait-60': {
    size: 60,
    colorPrecision: 6,
    filterSpeckle: 4,
    cornerThreshold: 60,
    mode: 'polygon',
  },
  'portrait-120': {
    size: 120,
    colorPrecision: 8,
    filterSpeckle: 2,
    cornerThreshold: 90,
    mode: 'spline',
  },
  'portrait-240': {
    size: 240,
    colorPrecision: 8,
    filterSpeckle: 1,
    cornerThreshold: 90,
    mode: 'spline',
  },
};

/**
 * Generate vtracer CLI command
 */
export function getVtracerCommand(
  inputPath: string,
  outputPath: string,
  preset: VtracerPreset,
  colorCount?: number
): string {
  const config = VTRACER_PRESETS[preset];
  const colors = colorCount || getDefaultColorCount(preset);

  // ImageMagick preprocessing
  const magickCmd = `magick "${inputPath}" -resize "${config.size}x${config.size}" -fuzz "5%" +dither -colors ${colors} -depth 8 PNG8:temp_${preset}.png`;

  // vtracer command
  const vtracerCmd = [
    'vtracer',
    `--input temp_${preset}.png`,
    `--output "${outputPath}"`,
    '--colormode color',
    '--hierarchical stacked',
    `--mode ${config.mode}`,
    `--filter_speckle ${config.filterSpeckle}`,
    `--color_precision ${config.colorPrecision}`,
    `--corner_threshold ${config.cornerThreshold}`,
  ].join(' \\\n  ');

  return `# ${preset} preset (${config.size}px)\n${magickCmd} && \\\n${vtracerCmd} && \\\nrm temp_${preset}.png`;
}

/**
 * Get default color count based on preset
 */
function getDefaultColorCount(preset: VtracerPreset): number {
  if (preset.startsWith('icon')) {
    const size = parseInt(preset.split('-')[1]);
    return size <= 16 ? 8 : size <= 32 ? 16 : 24;
  }
  // Portraits get more colors
  const size = parseInt(preset.split('-')[1]);
  return size <= 60 ? 24 : size <= 120 ? 48 : 64;
}

/**
 * Generate all preset commands for an asset
 */
export function getAllPresetCommands(
  inputPath: string,
  outputDir: string,
  baseName: string
): Record<VtracerPreset, string> {
  const commands: Partial<Record<VtracerPreset, string>> = {};

  for (const preset of Object.keys(VTRACER_PRESETS) as VtracerPreset[]) {
    const outputPath = `${outputDir}/${baseName}-${preset}.svg`;
    commands[preset] = getVtracerCommand(inputPath, outputPath, preset);
  }

  return commands as Record<VtracerPreset, string>;
}

/**
 * Get preset info for display
 */
export function getPresetInfo(preset: VtracerPreset): {
  label: string;
  description: string;
  size: number;
} {
  const config = VTRACER_PRESETS[preset];

  const descriptions: Record<VtracerPreset, string> = {
    'icon-16': 'Tiny UI icons, high simplification',
    'icon-32': 'Inventory icons, medium detail',
    'icon-64': 'Large icons, good detail',
    'portrait-60': 'Small portraits, sprite-like',
    'portrait-120': 'Standard portraits, smooth curves',
    'portrait-240': 'HD portraits, full detail',
  };

  return {
    label: preset.replace('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    description: descriptions[preset],
    size: config.size,
  };
}
