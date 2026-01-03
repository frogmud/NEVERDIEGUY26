/**
 * CharacterSprite - Unified character sprite component
 *
 * Standardizes sprite rendering across all character categories:
 * - 100x100 default container
 * - 300x300 for King James and Rhea (large pantheon characters)
 * - Frame-based animation with category-specific timing
 * - Pixelated rendering for game aesthetic
 *
 * NEVER DIE GUY
 */

import { useState, useEffect, useMemo } from 'react';
import { Box, SxProps, Theme } from '@mui/material';
import { HelpOutlineSharp as PlaceholderIcon } from '@mui/icons-material';
import type { WikiCategory } from '../data/wiki/types';

// ============================================
// Constants
// ============================================

// Default sprite container size
const DEFAULT_SIZE = 100;

// Large characters get 300x300 sprites
const LARGE_CHARACTERS = ['king-james', 'rhea'];

// Known frame counts per character
const KNOWN_FRAME_COUNTS: Record<string, number> = {
  'mr-bones': 2,
  'boo-g': 3,
  'willy': 2,
  'dr-maxwell': 1,
  'king-james': 2,
  'stitch-up-girl': 2,
  'the-general': 3,
  'dr-voss': 1,
  'keith-man': 2,
  'xtreme': 1,
  'clausen': 1,
  'mr-kevin': 2,
  'never-die-guy': 1,
  'body-count': 2,
  'rhea': 2,
  'robert': 2,
  'alien-baby': 2,
};

// Animation speed by category (ms per frame)
const CATEGORY_ANIMATION_SPEEDS: Record<WikiCategory, number> = {
  travelers: 200,   // Friendly, quick movements
  wanderers: 250,   // Mysterious, slightly slower
  pantheon: 400,    // Imposing, slow and deliberate
  shops: 200,       // Shop keepers, standard
  enemies: 150,     // Aggressive, fast
  items: 0,         // No animation
  domains: 0,
  trophies: 0,
  factions: 0,
};

// Base paths for sprite assets (PNG and SVG variants)
const SPRITE_PATHS = {
  market: '/assets/market',
  marketSvg: '/assets/market-svg',
  characters: '/assets/characters',
};

// ============================================
// Types
// ============================================

export interface CharacterSpriteProps {
  /** Character slug (e.g., 'mr-bones', 'king-james') */
  slug: string;
  /** Wiki category for animation speed and fallback */
  category?: WikiCategory;
  /** Override default size (100px, or 300px for large characters) */
  size?: number;
  /** Animation state to display */
  animation?: 'idle' | 'shop' | 'walk' | 'back' | 'action';
  /** Pause animation */
  isPaused?: boolean;
  /** Override frame interval (ms) */
  frameInterval?: number;
  /** Fallback image if sprite not found */
  fallbackSrc?: string;
  /** Click handler */
  onClick?: () => void;
  /** Show border for debugging */
  debug?: boolean;
  /** MUI sx prop */
  sx?: SxProps<Theme>;
}

// ============================================
// Component
// ============================================

export function CharacterSprite({
  slug,
  category,
  size,
  animation = 'idle',
  isPaused = false,
  frameInterval,
  fallbackSrc,
  onClick,
  debug = false,
  sx,
}: CharacterSpriteProps) {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [fallbackStage, setFallbackStage] = useState(0); // 0=svg, 1=png, 2=fallbackSrc, 3=failed

  // Determine sprite size (300 for large characters, otherwise 100)
  const isLargeCharacter = LARGE_CHARACTERS.includes(slug);
  const effectiveSize = size ?? (isLargeCharacter ? 300 : DEFAULT_SIZE);

  // Get frame count
  const totalFrames = KNOWN_FRAME_COUNTS[slug] || 1;

  // Calculate animation speed
  const animSpeed = frameInterval ?? (category ? CATEGORY_ANIMATION_SPEEDS[category] : 200);

  // Build sprite paths based on category (SVG first, PNG fallback)
  const { svgPaths, pngPaths } = useMemo(() => {
    const pngBase = `${SPRITE_PATHS.market}/${slug}`;
    const svgBase = `${SPRITE_PATHS.marketSvg}/${slug}`;

    if (totalFrames <= 1) {
      return {
        svgPaths: [`${svgBase}/${animation}-01.svg`],
        pngPaths: [`${pngBase}/${animation}-01.png`],
      };
    }

    return {
      svgPaths: Array.from({ length: totalFrames }, (_, i) => {
        const frameNum = String(i + 1).padStart(2, '0');
        return `${svgBase}/${animation}-${frameNum}.svg`;
      }),
      pngPaths: Array.from({ length: totalFrames }, (_, i) => {
        const frameNum = String(i + 1).padStart(2, '0');
        return `${pngBase}/${animation}-${frameNum}.png`;
      }),
    };
  }, [slug, animation, totalFrames]);

  // Cycle through frames
  useEffect(() => {
    if (isPaused || totalFrames <= 1 || fallbackStage >= 3 || animSpeed === 0) return;

    const interval = setInterval(() => {
      setCurrentFrame((prev) => (prev + 1) % totalFrames);
    }, animSpeed);

    return () => clearInterval(interval);
  }, [totalFrames, animSpeed, isPaused, fallbackStage]);

  // Reset state when slug changes
  useEffect(() => {
    setCurrentFrame(0);
    setFallbackStage(0);
  }, [slug, animation]);

  // Determine current source based on fallback stage (SVG first)
  const currentSrc = useMemo(() => {
    if (fallbackStage === 0) {
      return svgPaths[currentFrame];
    }
    if (fallbackStage === 1) {
      return pngPaths[currentFrame];
    }
    if (fallbackStage === 2 && fallbackSrc) {
      return fallbackSrc;
    }
    return null;
  }, [fallbackStage, svgPaths, pngPaths, currentFrame, fallbackSrc]);

  // Handle image load error - progress through fallback chain
  const handleError = () => {
    if (fallbackStage === 0) {
      // SVG failed, try PNG
      setFallbackStage(1);
    } else if (fallbackStage === 1 && fallbackSrc) {
      // PNG failed, try fallbackSrc
      setFallbackStage(2);
    } else {
      // All failed
      setFallbackStage(3);
    }
  };

  // Placeholder when sprite not found
  if (fallbackStage >= 3 || !currentSrc) {
    return (
      <Box
        onClick={onClick}
        sx={{
          width: effectiveSize,
          height: effectiveSize,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'rgba(255,255,255,0.05)',
          borderRadius: '8px',
          border: debug ? '1px dashed rgba(255,255,255,0.4)' : '1px dashed rgba(255,255,255,0.2)',
          cursor: onClick ? 'pointer' : 'default',
          ...sx,
        }}
      >
        <PlaceholderIcon sx={{ fontSize: effectiveSize * 0.4, color: 'rgba(255,255,255,0.3)' }} />
      </Box>
    );
  }

  return (
    <Box
      component="img"
      src={currentSrc}
      alt={slug}
      onClick={onClick}
      onError={handleError}
      sx={{
        width: effectiveSize,
        height: effectiveSize,
        objectFit: 'contain',
        imageRendering: 'pixelated',
        cursor: onClick ? 'pointer' : 'default',
        transition: onClick ? 'transform 0.15s ease' : 'none',
        border: debug ? '1px solid rgba(255,0,0,0.3)' : 'none',
        '&:hover': onClick
          ? {
              transform: 'scale(1.05)',
            }
          : {},
        ...sx,
      }}
    />
  );
}

// ============================================
// Utility Functions
// ============================================

/**
 * Get the default sprite size for a character
 */
export function getCharacterSpriteSize(slug: string): number {
  return LARGE_CHARACTERS.includes(slug) ? 300 : DEFAULT_SIZE;
}

/**
 * Check if a character is a large sprite
 */
export function isLargeSprite(slug: string): boolean {
  return LARGE_CHARACTERS.includes(slug);
}

export default CharacterSprite;
