// FavorEffectToast - Display Die-rector blessing/curse effects
import { useEffect, useState } from 'react';
import { Box, Typography, keyframes } from '@mui/material';
import { tokens } from '../theme';
import { getDiceColor, DICE_CONFIG } from '../data/dice';
import type { FavorEffect } from '../data/dice/favor';

// Slide in animation
const slideIn = keyframes`
  0% {
    transform: translateX(100%);
    opacity: 0;
  }
  10% {
    transform: translateX(0);
    opacity: 1;
  }
  90% {
    transform: translateX(0);
    opacity: 1;
  }
  100% {
    transform: translateX(100%);
    opacity: 0;
  }
`;


interface FavorEffectToastProps {
  effect: FavorEffect | null;
  onComplete?: () => void;
  duration?: number;
}

export function FavorEffectToast({
  effect,
  onComplete,
  duration = 4000,
}: FavorEffectToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (effect) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        onComplete?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [effect, duration, onComplete]);

  if (!visible || !effect) return null;

  // Find the dice config for this Die-rector
  const diceConfig = DICE_CONFIG.find((d) => d.dierector === effect.dierectorSlug);
  const color = diceConfig ? getDiceColor(diceConfig.sides) : tokens.colors.primary;

  // Check if it's a blessing (roll matches lucky number) or curse (roll 1)
  const isCurse = effect.roll === 1;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 80,
        right: 16,
        zIndex: 1400,
        animation: `${slideIn} ${duration}ms ease-in-out forwards`,
      }}
    >
      <Box
        sx={{
          backgroundColor: tokens.colors.background.paper,
          border: `2px solid ${color}`,
          borderRadius: tokens.radius.lg,
          p: 2,
          minWidth: 280,
          maxWidth: 340,
          color: color,
        }}
      >
        {/* Header with Die-rector name */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            mb: 1.5,
          }}
        >
          {/* Die-rector icon placeholder */}
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              backgroundColor: `${color}20`,
              border: `2px solid ${color}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography
              sx={{
                fontSize: '1rem',
                fontWeight: 700,
                color: color,
              }}
            >
              {effect.roll}
            </Typography>
          </Box>

          <Box>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 700,
                color: color,
                lineHeight: 1.2,
              }}
            >
              {effect.dierector}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: tokens.colors.text.disabled,
                fontSize: '0.65rem',
              }}
            >
              {isCurse ? 'Disfavor' : 'Blessing'} - {effect.domain}
            </Typography>
          </Box>
        </Box>

        {/* Effect text */}
        <Typography
          variant="body2"
          sx={{
            color: tokens.colors.text.primary,
            lineHeight: 1.4,
            fontStyle: 'italic',
          }}
        >
          {effect.effect}
        </Typography>

        {/* Element tag */}
        <Box
          sx={{
            mt: 1.5,
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: `${color}80`,
              fontSize: '0.6rem',
              textTransform: 'uppercase',
              letterSpacing: 1,
            }}
          >
            {effect.element}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

// Hook for managing favor toast state
export function useFavorToast() {
  const [effect, setEffect] = useState<FavorEffect | null>(null);

  const showFavor = (favorEffect: FavorEffect) => {
    setEffect(favorEffect);
  };

  const clearFavor = () => {
    setEffect(null);
  };

  return {
    effect,
    showFavor,
    clearFavor,
  };
}
