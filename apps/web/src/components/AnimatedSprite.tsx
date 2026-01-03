/**
 * AnimatedSprite - Cycles through sprite frames for idle animations
 *
 * Tries SVG first from /assets/market-svg/{slug}/idle-XX.svg
 * Falls back to PNG from /assets/market/{slug}/idle-XX.png
 * Shows placeholder icon when no sprite exists.
 */

import { useState, useEffect, useMemo } from 'react';
import { Box } from '@mui/material';
import { HelpOutlineSharp as PlaceholderIcon } from '@mui/icons-material';

interface AnimatedSpriteProps {
  slug: string;
  basePath?: string; // e.g., '/assets/market'
  frameCount?: number; // If known, otherwise auto-detect
  frameInterval?: number; // ms between frames (default 600)
  width?: number;
  height?: number | 'auto';
  fallbackSrc?: string; // Fallback if no frames found
  isPaused?: boolean;
  preferSvg?: boolean; // Try SVG first (default: true)
  sx?: object;
}

// Known frame counts per NPC (to avoid 404s during detection)
const KNOWN_FRAME_COUNTS: Record<string, number> = {
  'mr-bones': 1,    // idle-02 was wrong sprite, using single frame
  'boo-g': 3,
  'willy': 2,
  'dr-maxwell': 1,  // shop sprite (single frame)
  'king-james': 2,
  'stitch-up-girl': 2,
  'the-general': 3,
  'dr-voss': 1,     // shop sprite (single frame)
  'keith-man': 2,
  'xtreme': 1,      // shop sprite (single frame)
  'clausen': 1,
  'mr-kevin': 2,
  'never-die-guy': 1,
  'body-count': 2,
};

export function AnimatedSprite({
  slug,
  basePath = '/assets/market',
  frameCount,
  frameInterval = 600,
  width = 64,
  height = 'auto',
  fallbackSrc,
  isPaused = false,
  preferSvg = true,
  sx,
}: AnimatedSpriteProps) {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [fallbackStage, setFallbackStage] = useState(0); // 0=svg, 1=png, 2=fallbackSrc, 3=failed

  // Get frame count
  const totalFrames = frameCount || KNOWN_FRAME_COUNTS[slug] || 1;

  // Generate SVG and PNG frame paths
  const { svgPaths, pngPaths } = useMemo(() => {
    const svgBase = basePath.replace('/assets/market', '/assets/market-svg');

    if (totalFrames <= 1) {
      return {
        svgPaths: [`${svgBase}/${slug}/idle-01.svg`],
        pngPaths: [`${basePath}/${slug}/idle-01.png`],
      };
    }

    return {
      svgPaths: Array.from({ length: totalFrames }, (_, i) => {
        const frameNum = String(i + 1).padStart(2, '0');
        return `${svgBase}/${slug}/idle-${frameNum}.svg`;
      }),
      pngPaths: Array.from({ length: totalFrames }, (_, i) => {
        const frameNum = String(i + 1).padStart(2, '0');
        return `${basePath}/${slug}/idle-${frameNum}.png`;
      }),
    };
  }, [basePath, slug, totalFrames]);

  // Cycle through frames
  useEffect(() => {
    if (isPaused || totalFrames <= 1 || fallbackStage >= 3) return;

    const interval = setInterval(() => {
      setCurrentFrame((prev) => (prev + 1) % totalFrames);
    }, frameInterval);

    return () => clearInterval(interval);
  }, [totalFrames, frameInterval, isPaused, fallbackStage]);

  // Reset when slug changes
  useEffect(() => {
    setCurrentFrame(0);
    setFallbackStage(0);
  }, [slug]);

  // Determine current source based on fallback stage
  const currentSrc = useMemo(() => {
    if (fallbackStage === 0 && preferSvg) {
      return svgPaths[currentFrame];
    }
    if (fallbackStage <= 1) {
      return pngPaths[currentFrame];
    }
    if (fallbackStage === 2 && fallbackSrc) {
      return fallbackSrc;
    }
    return null;
  }, [fallbackStage, preferSvg, svgPaths, pngPaths, currentFrame, fallbackSrc]);

  // Handle image load error - progress through fallback chain
  const handleError = () => {
    if (fallbackStage === 0 && preferSvg) {
      // SVG failed, try PNG
      setFallbackStage(1);
    } else if (fallbackStage <= 1 && fallbackSrc) {
      // PNG failed, try fallbackSrc
      setFallbackStage(2);
    } else {
      // All failed
      setFallbackStage(3);
    }
  };

  // Show placeholder when all sources fail
  if (fallbackStage >= 3 || !currentSrc) {
    return (
      <Box
        sx={{
          width,
          height: height === 'auto' ? width : height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'rgba(255,255,255,0.05)',
          borderRadius: '8px',
          border: '1px dashed rgba(255,255,255,0.2)',
          ...sx,
        }}
      >
        <PlaceholderIcon sx={{ fontSize: width * 0.5, color: 'rgba(255,255,255,0.3)' }} />
      </Box>
    );
  }

  return (
    <Box
      component="img"
      src={currentSrc}
      alt={slug}
      onError={handleError}
      sx={{
        width,
        height,
        imageRendering: 'pixelated',
        objectFit: 'contain',
        ...sx,
      }}
    />
  );
}

export default AnimatedSprite;
