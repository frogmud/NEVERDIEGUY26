// Shared helper functions for wiki display
import { tokens } from '../../theme';
import type { Rarity, Difficulty, WikiCategory, EnemyType, ItemType, Element } from './types';
import type { SvgIconComponent } from '@mui/icons-material';
import {
  BlurOnSharp,
  LandscapeSharp,
  SentimentVeryDissatisfiedSharp,
  LocalFireDepartmentSharp,
  AcUnitSharp,
  AirSharp,
  HelpOutlineSharp,
} from '@mui/icons-material';

// Rarity color mapping (accepts string for flexibility with display data)
export function getRarityColor(rarity?: string): string {
  switch (rarity) {
    case 'Common':
      return tokens.colors.text.secondary;
    case 'Uncommon':
      return tokens.colors.success;
    case 'Rare':
      return tokens.colors.secondary;
    case 'Epic':
      return '#9c27b0'; // Purple
    case 'Legendary':
      return tokens.colors.warning;
    case 'Unique':
      return tokens.colors.primary;
    default:
      return tokens.colors.text.secondary;
  }
}

// Difficulty color mapping (accepts string for flexibility with display data)
export function getDifficultyColor(difficulty?: string): string {
  switch (difficulty) {
    case 'Easy':
      return tokens.colors.success;
    case 'Normal':
      return tokens.colors.text.secondary;
    case 'Hard':
      return tokens.colors.warning;
    case 'Extreme':
      return tokens.colors.primary;
    default:
      return tokens.colors.text.secondary;
  }
}

// Enemy type color mapping
export function getEnemyTypeColor(enemyType?: EnemyType): string {
  switch (enemyType) {
    case 'Normal':
      return tokens.colors.text.secondary;
    case 'Elite':
      return tokens.colors.warning;
    case 'Miniboss':
      return '#9c27b0'; // Purple
    case 'Boss':
      return tokens.colors.primary;
    default:
      return tokens.colors.text.secondary;
  }
}

// Item type color mapping
export function getItemTypeColor(itemType?: ItemType): string {
  switch (itemType) {
    case 'Weapon':
      return tokens.colors.primary;
    case 'Armor':
      return tokens.colors.secondary;
    case 'Consumable':
      return tokens.colors.success;
    case 'Material':
      return tokens.colors.warning;
    case 'Quest':
      return '#9c27b0'; // Purple
    case 'Artifact':
      return tokens.colors.warning;
    case 'Currency':
      return '#ffd700'; // Gold
    default:
      return tokens.colors.text.secondary;
  }
}

// Lucky number color mapping (Die-rector themed)
export function getLuckyNumberColor(luckyNumber?: number): string {
  switch (luckyNumber) {
    case 1:
      return tokens.colors.primary; // Red
    case 2:
      return '#ff9100'; // Orange (NDG's number)
    case 3:
      return '#9c27b0'; // Purple (Peter/Shadow)
    case 4:
      return tokens.colors.success; // Green
    case 5:
      return tokens.colors.secondary; // Cyan
    case 6:
      return tokens.colors.warning; // Gold
    default:
      return tokens.colors.text.disabled;
  }
}

// Element color mapping (for visual indicators - returns hex number for Phaser)
export function getElementColor(element: string): number {
  switch (element) {
    case 'Void':
      return 0x7c4dff; // Purple
    case 'Earth':
      return 0x4caf50; // Green
    case 'Death':
      return 0x424242; // Dark gray
    case 'Fire':
      return 0xff5722; // Orange/red
    case 'Ice':
      return 0x00bcd4; // Cyan
    case 'Wind':
      return 0x03a9f4; // Light blue
    default:
      return 0x888888; // Neutral gray
  }
}

// Element color mapping (returns CSS hex string for React components)
export function getElementColorHex(element?: Element | string): string {
  switch (element) {
    case 'Void':
      return '#7c4dff'; // Purple
    case 'Earth':
      return '#4caf50'; // Green
    case 'Death':
      return '#424242'; // Dark gray
    case 'Fire':
      return '#ff5722'; // Orange/red
    case 'Ice':
      return '#00bcd4'; // Cyan
    case 'Wind':
      return '#03a9f4'; // Light blue
    case 'Neutral':
    default:
      return '#888888'; // Neutral gray
  }
}

// Element icon mapping - returns MUI icon component for each element
// Usage: const Icon = getElementIcon('Fire'); return <Icon sx={{ color: getElementColorHex('Fire') }} />
export function getElementIcon(element?: Element | string): SvgIconComponent {
  switch (element) {
    case 'Void':
      return BlurOnSharp; // Void/blur effect
    case 'Earth':
      return LandscapeSharp; // Mountains/terrain
    case 'Death':
      return SentimentVeryDissatisfiedSharp; // Skull-like face
    case 'Fire':
      return LocalFireDepartmentSharp; // Flame
    case 'Ice':
      return AcUnitSharp; // Snowflake
    case 'Wind':
      return AirSharp; // Air/wind
    case 'Neutral':
    default:
      return HelpOutlineSharp; // Unknown/neutral
  }
}

// Element display info with icon, color, and Die-rector mapping
export interface ElementInfo {
  element: Element;
  icon: SvgIconComponent;
  color: string;
  dierector: string;
  luckyNumber: 1 | 2 | 3 | 4 | 5 | 6;
}

export function getElementInfo(element: Element): ElementInfo | null {
  const elementMap: Record<Exclude<Element, 'Neutral'>, ElementInfo> = {
    Void: { element: 'Void', icon: BlurOnSharp, color: '#7c4dff', dierector: 'The One', luckyNumber: 1 },
    Earth: { element: 'Earth', icon: LandscapeSharp, color: '#4caf50', dierector: 'John', luckyNumber: 2 },
    Death: { element: 'Death', icon: SentimentVeryDissatisfiedSharp, color: '#424242', dierector: 'Peter', luckyNumber: 3 },
    Fire: { element: 'Fire', icon: LocalFireDepartmentSharp, color: '#ff5722', dierector: 'Robert', luckyNumber: 4 },
    Ice: { element: 'Ice', icon: AcUnitSharp, color: '#00bcd4', dierector: 'Alice', luckyNumber: 5 },
    Wind: { element: 'Wind', icon: AirSharp, color: '#03a9f4', dierector: 'Jane', luckyNumber: 6 },
  };

  return element === 'Neutral' ? null : elementMap[element];
}

// Category display info
export interface CategoryInfo {
  label: string;
  pluralLabel: string;
  description: string;
  color: string;
}

export function getCategoryInfo(category: WikiCategory): CategoryInfo {
  const info: Record<WikiCategory, CategoryInfo> = {
    travelers: {
      label: 'Traveler',
      pluralLabel: 'Travelers',
      description: 'Playable characters and their abilities',
      color: tokens.colors.secondary,
    },
    enemies: {
      label: 'Enemy',
      pluralLabel: 'Enemies',
      description: 'Combat opponents and bosses',
      color: tokens.colors.primary,
    },
    items: {
      label: 'Item',
      pluralLabel: 'Items',
      description: 'Weapons, consumables, and equipment',
      color: tokens.colors.warning,
    },
    domains: {
      label: 'Domain',
      pluralLabel: 'Domains',
      description: 'Game worlds and locations',
      color: tokens.colors.success,
    },
    shops: {
      label: 'Shop',
      pluralLabel: 'Shops',
      description: 'Merchant vendors and trading posts',
      color: '#ffd700',
    },
    pantheon: {
      label: 'Die-rector',
      pluralLabel: 'Pantheon',
      description: 'Divine beings controlling the domains',
      color: tokens.colors.primary,
    },
    wanderers: {
      label: 'Wanderer',
      pluralLabel: 'Wanderers',
      description: 'Mobile NPCs and merchants',
      color: tokens.colors.secondary,
    },
    trophies: {
      label: 'Trophy',
      pluralLabel: 'Trophies',
      description: 'Achievements and rewards',
      color: tokens.colors.warning,
    },
    factions: {
      label: 'Faction',
      pluralLabel: 'Factions',
      description: 'Gameplay teams for 1v1 and arena modes',
      color: tokens.colors.primary,
    },
  };

  return info[category] || {
    label: category,
    pluralLabel: category,
    description: '',
    color: tokens.colors.text.secondary,
  };
}

// Format drop rate for display
export function formatDropRate(rate: number): string {
  if (rate === 100) return 'Guaranteed';
  if (rate >= 50) return `${rate}% (Common)`;
  if (rate >= 20) return `${rate}% (Uncommon)`;
  if (rate >= 5) return `${rate}% (Rare)`;
  return `${rate}% (Very Rare)`;
}

// Get placeholder image path
export function getPlaceholderImage(category: WikiCategory): string {
  return `/assets/wiki/${category}/placeholder.png`;
}

// Convert slug to display name
export function slugToName(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Convert name to slug
export function nameToSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');
}
