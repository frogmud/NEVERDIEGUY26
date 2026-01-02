/**
 * TransitionWipe - Signature NDG skull wipe transition
 *
 * Balatro-inspired branded wipe between game panels.
 * Skull expands radially from center with pinky-red glow.
 */

import { useEffect } from 'react';
import { Box, keyframes } from '@mui/material';
import { tokens } from '../theme';

// Animation: simple fade in/out - no crazy scaling
const wipeFadeIn = keyframes`
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
`;

// Animation: fade out after wipe completes
const wipeFadeOut = keyframes`
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
`;

// Animation: subtle pulse glow
const skullPulse = keyframes`
  0%, 100% {
    filter: drop-shadow(0 0 10px ${tokens.colors.primary}60);
  }
  50% {
    filter: drop-shadow(0 0 20px ${tokens.colors.primary}80);
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
  // Fire callback after animation completes
  // Note: We use setTimeout instead of onAnimationEnd because MUI's keyframes
  // generates hashed animation names that don't match the literal name
  useEffect(() => {
    if (phase === 'wipe' && onWipeComplete) {
      const timer = setTimeout(onWipeComplete, duration + 150);
      return () => clearTimeout(timer);
    }
  }, [phase, onWipeComplete, duration]);

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
        // Wipe background expands with skull
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          bgcolor: tokens.colors.background.default,
          animation: `${wipeFadeOut} ${duration * 0.5}ms ease-out ${duration}ms forwards`,
        },
      }}
    >
      {/* NDG Skull - simple fade, no scaling */}
      <Box
        component="img"
        src="/logos/ndg-skull-dome.svg"
        alt=""
        sx={{
          width: 48,
          height: 54,
          animation: `
            ${wipeFadeIn} ${duration * 0.3}ms ease-out forwards,
            ${skullPulse} ${duration}ms ease-in-out,
            ${wipeFadeOut} ${duration * 0.3}ms ease-in ${duration * 0.7}ms forwards
          `,
        }}
      />
    </Box>
  );
}
