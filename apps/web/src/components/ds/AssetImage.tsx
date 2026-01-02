/**
 * AssetImage - Consistent image component with fallback handling
 *
 * Design pattern extracted from Homepage (Dec 29, 2024)
 * Enhanced with SVG-first resolution (Jan 2, 2026)
 *
 * Fallback chain:
 * 1. Try SVG variant (if available and preferSvg=true)
 * 2. Fall back to PNG source
 * 3. Fall back to category-specific placeholder
 * 4. Final fallback → default placeholder or hide
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { Box, SxProps, Theme } from '@mui/material';
import type { WikiCategory } from '../../data/wiki/types';
import { resolveAssetPaths, getCategoryPlaceholder } from '../../utils/assetResolver';

const DEFAULT_PLACEHOLDER = '/assets/placeholders/default.png';

export interface AssetImageProps {
  /** Primary image source (explicit path) */
  src?: string;
  /** Entity slug for automatic path resolution */
  slug?: string;
  /** Alt text for accessibility */
  alt: string;
  /** Wiki category (required for slug resolution and placeholders) */
  category?: WikiCategory;
  /** Prefer SVG over PNG when using slug resolution (default: true) */
  preferSvg?: boolean;
  /** Item subtype for items category (e.g., 'weapons', 'armor') */
  subtype?: string;
  /** Variant suffix (e.g., '01', '02') */
  variant?: string;
  /** Image width */
  width?: number | string;
  /** Image height */
  height?: number | string;
  /** Fallback behavior: 'hide' removes image, 'placeholder' shows fallback */
  fallback?: 'hide' | 'placeholder';
  /** Apply pixelated rendering for game sprites */
  pixelated?: boolean;
  /** Apply consistent padding for breathing room (default: true for icons/items) */
  padded?: boolean;
  /** Object fit mode (default: 'contain') */
  objectFit?: 'contain' | 'cover' | 'fill' | 'none';
  /** Click handler */
  onClick?: () => void;
  /** MUI sx prop for additional styling */
  sx?: SxProps<Theme>;
  /** Additional class name */
  className?: string;
}

export function AssetImage({
  src,
  slug,
  alt,
  category,
  preferSvg = true,
  subtype,
  variant,
  width,
  height,
  fallback = 'hide',
  pixelated = false,
  padded = false,
  objectFit = 'contain',
  onClick,
  sx,
  className,
}: AssetImageProps) {
  // Resolve paths from slug or use explicit src
  const resolvedPaths = useMemo(() => {
    if (slug && category) {
      return resolveAssetPaths(slug, category, { subtype, variant });
    }
    return null;
  }, [slug, category, subtype, variant]);

  // Determine initial source (SVG preferred if available)
  const initialSrc = useMemo(() => {
    if (resolvedPaths) {
      return preferSvg && resolvedPaths.svg ? resolvedPaths.svg : resolvedPaths.png;
    }
    return src || '';
  }, [resolvedPaths, preferSvg, src]);

  // Fallback stage: 0=initial, 1=tried SVG, 2=tried PNG, 3=tried placeholder, 4=hidden
  const [fallbackStage, setFallbackStage] = useState(0);
  const [currentSrc, setCurrentSrc] = useState(initialSrc);

  // Reset when source changes
  useEffect(() => {
    setCurrentSrc(initialSrc);
    setFallbackStage(0);
  }, [initialSrc]);

  const handleError = useCallback(() => {
    if (fallback === 'hide' && !resolvedPaths) {
      // No resolution chain, just hide
      setFallbackStage(4);
      return;
    }

    // Fallback chain for resolved paths
    if (resolvedPaths) {
      if (fallbackStage === 0 && preferSvg && resolvedPaths.svg) {
        // SVG failed, try PNG
        setCurrentSrc(resolvedPaths.png);
        setFallbackStage(1);
        return;
      }

      if (fallbackStage <= 1 && fallback === 'placeholder') {
        // PNG failed, try placeholder
        setCurrentSrc(resolvedPaths.placeholder);
        setFallbackStage(2);
        return;
      }

      if (fallbackStage === 2 && currentSrc !== DEFAULT_PLACEHOLDER) {
        // Category placeholder failed, try default
        setCurrentSrc(DEFAULT_PLACEHOLDER);
        setFallbackStage(3);
        return;
      }
    } else if (fallback === 'placeholder') {
      // No resolution, but placeholder mode - try category placeholder
      const categoryPlaceholder = category ? getCategoryPlaceholder(category) : DEFAULT_PLACEHOLDER;

      if (fallbackStage === 0 && currentSrc !== categoryPlaceholder) {
        setCurrentSrc(categoryPlaceholder);
        setFallbackStage(2);
        return;
      }

      if (fallbackStage === 2 && currentSrc !== DEFAULT_PLACEHOLDER) {
        setCurrentSrc(DEFAULT_PLACEHOLDER);
        setFallbackStage(3);
        return;
      }
    }

    // All fallbacks exhausted, hide
    setFallbackStage(4);
  }, [category, currentSrc, fallback, fallbackStage, preferSvg, resolvedPaths]);

  if (fallbackStage === 4) {
    return null;
  }

  return (
    <Box
      component="img"
      src={currentSrc}
      alt={alt}
      className={className}
      onClick={onClick}
      onError={handleError}
      sx={{
        width,
        height,
        objectFit,
        ...(padded && {
          padding: '8%',
          boxSizing: 'border-box',
        }),
        ...(pixelated && {
          imageRendering: 'pixelated',
        }),
        ...(onClick && {
          cursor: 'pointer',
          '&:hover': { opacity: 0.8 },
        }),
        ...sx,
      }}
    />
  );
}
