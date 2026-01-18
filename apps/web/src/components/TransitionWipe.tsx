/**
 * TransitionWipe - Signature NDG skull wipe transition
 *
 * Balatro-inspired branded wipe between game panels.
 * ASCII skull with particle effects - no scale transforms to prevent skewing.
 */

import { useEffect, useRef } from 'react';
import { Box, keyframes } from '@mui/material';
import { tokens } from '../theme';
import { AsciiCanvas, AsciiCanvasHandle, useWipeAnimation, SKULL_CONFIG } from '../ascii';

// Animation: opacity-only fade in (no scale transform)
const canvasFadeIn = keyframes`
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
`;

// Animation: opacity-only fade out (no scale transform)
const canvasFadeOut = keyframes`
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
`;

// Animation: background fade
const bgFadeOut = keyframes`
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
`;

export type TransitionPhase = 'idle' | 'exit' | 'wipe' | 'enter';

interface TransitionWipeProps {
  /** Current transition phase */
  phase: TransitionPhase;
  /** Callback when wipe animation completes */
  onWipeComplete?: () => void;
  /** Duration of wipe in ms (default: 300) */
  duration?: number;
}

export function TransitionWipe({
  phase,
  onWipeComplete,
  duration = 300,
}: TransitionWipeProps) {
  const canvasRef = useRef<AsciiCanvasHandle>(null);
  const { initialize, start } = useWipeAnimation(() => {
    // Animation complete callback
    onWipeComplete?.();
  });

  // Calculate canvas dimensions based on character dimensions
  const canvasWidth = SKULL_CONFIG.cols * SKULL_CONFIG.charWidth;
  const canvasHeight = SKULL_CONFIG.rows * SKULL_CONFIG.charHeight;

  // Fire callback after animation completes
  useEffect(() => {
    if (phase === 'wipe') {
      // Small delay before starting ASCII animation
      const startTimer = setTimeout(() => {
        start();
      }, 50);

      return () => clearTimeout(startTimer);
    }
  }, [phase, start]);

  // Only render during wipe phase
  if (phase !== 'wipe') {
    return null;
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
        // Wipe background
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          bgcolor: tokens.colors.background.default,
          animation: `${bgFadeOut} ${duration * 0.5}ms ease-out ${duration}ms forwards`,
        },
      }}
    >
      {/* ASCII Skull Canvas - opacity-only animations, no scale transforms */}
      <Box
        sx={{
          position: 'relative',
          animation: `
            ${canvasFadeIn} ${duration * 0.3}ms ease-out forwards,
            ${canvasFadeOut} ${duration * 0.3}ms ease-in ${duration * 0.7}ms forwards
          `,
          filter: `drop-shadow(0 0 15px ${tokens.colors.primary}60)`,
        }}
      >
        <AsciiCanvas
          ref={canvasRef}
          width={canvasWidth}
          height={canvasHeight}
          config={{
            charWidth: SKULL_CONFIG.charWidth,
            charHeight: SKULL_CONFIG.charHeight,
            font: 'IBM Plex Mono, monospace',
            color: tokens.colors.primary,
          }}
          onReady={initialize}
        />
      </Box>
    </Box>
  );
}
