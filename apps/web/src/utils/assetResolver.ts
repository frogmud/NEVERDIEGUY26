/**
 * Asset Resolution System
 *
 * Provides SVG-first resolution with PNG fallback.
 * Wiki entities use slugs; this resolves to actual asset paths.
 */

import type { WikiCategory } from '../data/wiki/types';

// Category configuration for asset path resolution
interface CategoryConfig {
  base: string;
  svgVariant?: string;
  pattern: 'slug' | 'slug-prefix' | 'custom';
  prefix?: string;
}

// Category to asset directory mapping
const CATEGORY_PATHS: Record<WikiCategory, CategoryConfig> = {
  enemies: {
    base: '/assets/enemies',
    svgVariant: '/assets/enemies-svg',
    pattern: 'slug',
  },
  items: {
    base: '/assets/items',
    // Items organized by subtype, no bulk SVG variant
    pattern: 'custom',
  },
  travelers: {
    base: '/assets/characters/travelers',
    pattern: 'slug-prefix',
    prefix: 'traveler-portrait-',
  },
  domains: {
    base: '/assets/domains',
    svgVariant: '/assets/domains/backgrounds-svg',
    pattern: 'slug',
  },
  shops: {
    base: '/assets/characters/shops',
    pattern: 'slug-prefix',
    prefix: 'shop-portrait-',
  },
  pantheon: {
    base: '/assets/characters/pantheon',
    pattern: 'slug',
  },
  wanderers: {
    base: '/assets/characters/wanderers',
    pattern: 'slug-prefix',
    prefix: 'wanderer-portrait-',
  },
  trophies: {
    base: '/assets/trophies',
    pattern: 'slug',
  },
  factions: {
    base: '/assets/factions',
    svgVariant: '/assets/factions-svg',
    pattern: 'slug-prefix',
    prefix: 'faction-icon-',
  },
};

// Placeholder paths per category
const PLACEHOLDERS: Record<WikiCategory, string> = {
  enemies: '/assets/placeholders/enemies.png',
  items: '/assets/placeholders/items.png',
  travelers: '/assets/placeholders/travelers.png',
  domains: '/assets/placeholders/domains.png',
  shops: '/assets/placeholders/shops.png',
  pantheon: '/assets/placeholders/pantheon.png',
  wanderers: '/assets/placeholders/wanderers.png',
  trophies: '/assets/placeholders/default.png',
  factions: '/assets/placeholders/default.png',
};

const DEFAULT_PLACEHOLDER = '/assets/placeholders/default.png';

export interface ResolvedAssetPaths {
  svg: string | null;
  png: string;
  placeholder: string;
}

/**
 * Resolves a wiki entity slug to asset paths
 * Returns { svg, png, placeholder } for fallback chain
 */
export function resolveAssetPaths(
  slug: string,
  category: WikiCategory,
  options?: {
    variant?: string;      // e.g., '01', '02' for variants
    subtype?: string;      // For items: 'weapons', 'armor', etc.
  }
): ResolvedAssetPaths {
  const config = CATEGORY_PATHS[category];
  const placeholder = PLACEHOLDERS[category] || DEFAULT_PLACEHOLDER;

  let filename: string;
  let basePath = config.base;

  switch (config.pattern) {
    case 'slug':
      filename = slug;
      break;
    case 'slug-prefix':
      filename = `${config.prefix}${slug}`;
      break;
    case 'custom':
      // Items need subtype routing
      if (category === 'items' && options?.subtype) {
        basePath = `${config.base}/${options.subtype}`;
      }
      filename = slug;
      break;
    default:
      filename = slug;
  }

  if (options?.variant) {
    filename = `${filename}-${options.variant}`;
  }

  const png = `${basePath}/${filename}.png`;
  const svg = config.svgVariant
    ? `${config.svgVariant}/${filename}.svg`
    : null;

  return { svg, png, placeholder };
}

/**
 * Get the best available asset path (SVG preferred)
 * For use in components that need a single src
 */
export function getAssetPath(
  slug: string,
  category: WikiCategory,
  options?: {
    variant?: string;
    subtype?: string;
    preferSvg?: boolean;
  }
): string {
  const paths = resolveAssetPaths(slug, category, options);

  // If SVG variant exists and preferred (default true), return SVG path
  if (paths.svg && (options?.preferSvg ?? true)) {
    return paths.svg;
  }

  return paths.png;
}

/**
 * Get placeholder for a category
 */
export function getCategoryPlaceholder(category: WikiCategory): string {
  return PLACEHOLDERS[category] || DEFAULT_PLACEHOLDER;
}

/**
 * Check if a category has SVG variants
 */
export function hasSvgVariant(category: WikiCategory): boolean {
  return !!CATEGORY_PATHS[category]?.svgVariant;
}
