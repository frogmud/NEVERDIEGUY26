import { Box, Typography } from '@mui/material';
import type { ComboResult } from '../comboDetector';
import { tokens } from '../../../theme';

// Gaming font style
const gamingFont = { fontFamily: tokens.fonts.gaming };

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
        animation: 'comboPopup 1.5s ease-out forwards',
        '@keyframes comboPopup': {
          '0%': {
            opacity: 0,
            transform: 'translate(-50%, -50%) scale(0.5)',
          },
          '15%': {
            opacity: 1,
            transform: 'translate(-50%, -50%) scale(1.2)',
          },
          '30%': {
            transform: 'translate(-50%, -50%) scale(1)',
          },
          '80%': {
            opacity: 1,
            transform: 'translate(-50%, -50%) scale(1)',
          },
          '100%': {
            opacity: 0,
            transform: 'translate(-50%, -60%) scale(0.8)',
          },
        },
      }}
    >
      <Typography
        sx={{
          ...gamingFont,
          fontSize: '3.75rem',
          fontWeight: 700,
          color: combo.color,
          textShadow: `0 0 30px ${combo.color}, 0 0 60px ${combo.color}`,
          letterSpacing: '0.1em',
        }}
      >
        {combo.displayName}
      </Typography>
      <Typography
        sx={{
          ...gamingFont,
          fontSize: '1.875rem',
          color: '#fff',
          textShadow: '0 0 10px rgba(0,0,0,0.8)',
          mt: 1,
        }}
      >
        {combo.multiplier}x
      </Typography>
    </Box>
  );
}
