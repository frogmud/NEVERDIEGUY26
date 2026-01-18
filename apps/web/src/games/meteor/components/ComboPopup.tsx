import { Box, Typography, keyframes } from '@mui/material';
import type { ComboResult } from '../comboDetector';
import { tokens } from '../../../theme';
import { EASING, POP } from '../../../utils/transitions';

// Gaming font style
const gamingFont = { fontFamily: tokens.fonts.gaming };

// Combo name entrance - overshoot scale
const comboNamePop = keyframes`
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.5);
  }
  60% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(${POP.dramatic});
  }
  100% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
`;

// Multiplier delayed entrance
const multiplierSlide = keyframes`
  0% {
    opacity: 0;
    transform: translateY(-10px) scale(0.8);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`;

// Full combo popup with exit
const comboFull = keyframes`
  0% {
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  85% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -60%) scale(0.9);
  }
`;

interface ComboPopupProps {
  combo: ComboResult | null;
}

export function ComboPopup({ combo }: ComboPopupProps) {
  if (!combo) return null;

  return (
    <Box
      sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 90,
        textAlign: 'center',
        animation: `${comboFull} 1.5s ${EASING.smooth} forwards`,
      }}
    >
      {/* Combo name with overshoot */}
      <Typography
        sx={{
          ...gamingFont,
          fontSize: '3.75rem',
          fontWeight: 700,
          color: combo.color,
          textShadow: `0 0 30px ${combo.color}, 0 0 60px ${combo.color}`,
          letterSpacing: '0.1em',
          animation: `${comboNamePop} 0.5s ${EASING.organic} forwards`,
        }}
      >
        {combo.displayName}
      </Typography>

      {/* Multiplier appears after combo name (150ms delay) */}
      <Typography
        sx={{
          ...gamingFont,
          fontSize: '1.875rem',
          color: '#fff',
          textShadow: '0 0 10px rgba(0,0,0,0.8)',
          mt: 1,
          animation: `${multiplierSlide} 0.3s ${EASING.organic} 0.15s forwards`,
          opacity: 0, // Start hidden, animation reveals
        }}
      >
        {combo.multiplier}x
      </Typography>
    </Box>
  );
}
