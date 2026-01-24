// Simplified wiki types for asset CMS

export type WikiCategory =
  | 'travelers'
  | 'enemies'
  | 'items'
  | 'domains'
  | 'shops'
  | 'pantheon'
  | 'wanderers'
  | 'trophies'
  | 'factions';

export type Rarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary' | 'Unique';

export interface WikiEntity {
  slug: string;
  name: string;
  category: WikiCategory;
  rarity?: Rarity;
  image?: string;
  portrait?: string;
  sprites?: string[];
  description?: string;
  itemType?: string;
  subtype?: string;
}

// vtracer presets
export type VtracerPreset =
  | 'icon-16'
  | 'icon-32'
  | 'icon-64'
  | 'portrait-60'
  | 'portrait-120'
  | 'portrait-240';

export interface VtracerConfig {
  size: number;
  colorPrecision: number;
  filterSpeckle: number;
  cornerThreshold: number;
  mode: 'polygon' | 'spline';
}

// ASCII options
export interface AsciiOptions {
  cols: number;
  rows: number;
  charSet: string;
  threshold: number;
  tintColor?: string;
}

// Asset status
export type AssetStatus = 'exists' | 'missing' | 'error';
