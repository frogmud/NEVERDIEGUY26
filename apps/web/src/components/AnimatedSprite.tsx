/**
 * AnimatedSprite - Cycles through sprite frames for idle animations
 *
 * Automatically detects available frames in /assets/market/{slug}/idle-XX.png
 * Falls back to single sprite or portrait if no animation frames available.
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
  sx,
}: AnimatedSpriteProps) {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [fallbackFailed, setFallbackFailed] = useState(false);

  // Get frame count
  const totalFrames = frameCount || KNOWN_FRAME_COUNTS[slug] || 1;

  // Generate frame paths
  const framePaths = useMemo(() => {
    if (totalFrames <= 1) {
      // Single frame - use idle-01 or fallback
      return [`${basePath}/${slug}/idle-01.png`];
    }
    return Array.from({ length: totalFrames }, (_, i) => {
      const frameNum = String(i + 1).padStart(2, '0');
      return `${basePath}/${slug}/idle-${frameNum}.png`;
    });
  }, [basePath, slug, totalFrames]);

  // Cycle through frames
  useEffect(() => {
    if (isPaused || totalFrames <= 1 || hasError) return;

    const interval = setInterval(() => {
      setCurrentFrame((prev) => (prev + 1) % totalFrames);
    }, frameInterval);

    return () => clearInterval(interval);
  }, [totalFrames, frameInterval, isPaused, hasError]);

  // Reset frame when slug changes
  useEffect(() => {
    setCurrentFrame(0);
    setHasError(false);
    setFallbackFailed(false);
  }, [slug]);

  const currentSrc = hasError && fallbackSrc ? fallbackSrc : framePaths[currentFrame];

  // Show placeholder when both main sprite and fallback fail
  if (fallbackFailed || (hasError && !fallbackSrc)) {
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
      onError={() => {
        if (!hasError) {
          // Try fallback first
          if (fallbackSrc) {
            setHasError(true);
          } else {
            // No fallback, show placeholder
            setFallbackFailed(true);
          }
        } else {
          // Fallback also failed
          setFallbackFailed(true);
        }
      }}
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
