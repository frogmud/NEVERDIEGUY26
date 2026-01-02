/**
 * MarketSprite - Animated character sprite component
 *
 * Displays market characters with frame-based animation.
 * NEVER DIE GUY
 */

import { Box, type SxProps, type Theme } from '@mui/material';
import { useCharacterAnimation } from '../hooks/useCharacterAnimation';
import { CHARACTER_SPRITES, type CharacterId, type AnimationState } from '../data/market/sprites';

interface MarketSpriteProps {
  characterId: CharacterId;
  animation?: AnimationState;
  size?: number;
  autoPlay?: boolean;
  onClick?: () => void;
  sx?: SxProps<Theme>;
}

/**
 * MarketSprite Component
 *
 * Renders an animated character sprite from the market sprite sheets.
 */
export function MarketSprite({
  characterId,
  animation = 'idle',
  size = 100,
  autoPlay = true,
  onClick,
  sx,
}: MarketSpriteProps) {
  const character = CHARACTER_SPRITES[characterId];
  const { currentFrame } = useCharacterAnimation({
    characterId,
    initialState: animation,
    autoPlay,
  });

  if (!character || !currentFrame) {
    // Fallback to placeholder
    return (
      <Box
        sx={{
          width: size,
          height: size,
          bgcolor: 'background.paper',
          border: '1px dashed',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.75rem',
          color: 'text.secondary',
          ...sx,
        }}
      >
        {characterId}
      </Box>
    );
  }

  return (
    <Box
      onClick={onClick}
      sx={{
        width: size,
        height: size,
        backgroundImage: `url(${currentFrame.src})`,
        backgroundSize: 'contain',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        imageRendering: 'pixelated', // Crisp pixel art
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.1s ease',
        '&:hover': onClick
          ? {
              transform: 'scale(1.05)',
            }
          : {},
        ...sx,
      }}
      role={onClick ? 'button' : undefined}
      aria-label={onClick ? `Select ${character.name}` : undefined}
    />
  );
}

/**
 * MarketPortrait - Static portrait image
 */
interface MarketPortraitProps {
  characterId: CharacterId;
  size?: number;
  onClick?: () => void;
  sx?: SxProps<Theme>;
}

export function MarketPortrait({
  characterId,
  size = 120,
  onClick,
  sx,
}: MarketPortraitProps) {
  const character = CHARACTER_SPRITES[characterId];

  if (!character) {
    return null;
  }

  return (
    <Box
      onClick={onClick}
      sx={{
        width: size,
        height: size,
        backgroundImage: `url(${character.portrait})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        imageRendering: 'pixelated',
        borderRadius: 1,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        '&:hover': onClick
          ? {
              transform: 'scale(1.02)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            }
          : {},
        ...sx,
      }}
      role={onClick ? 'button' : undefined}
      aria-label={onClick ? `View ${character.name}` : undefined}
    />
  );
}

export default MarketSprite;
