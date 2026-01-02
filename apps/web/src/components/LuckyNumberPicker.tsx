// LuckyNumberPicker - Select your Die-rector patron / lucky number
import { Box, Typography } from '@mui/material';
import { tokens } from '../theme';
import { DICE_CONFIG, getDiceColor } from '../data/dice';
import { DiceShape } from './DiceShapes';
import type { LuckyNumber } from '../data/wiki/types';
import { AllInclusiveSharp, BlockSharp } from '@mui/icons-material';

interface LuckyNumberPickerProps {
  value: LuckyNumber;
  onChange: (value: LuckyNumber) => void;
  showLabels?: boolean;
  compact?: boolean;
}

export function LuckyNumberPicker({
  value,
  onChange,
  showLabels = true,
  compact = false,
}: LuckyNumberPickerProps) {
  const diceSize = compact ? 48 : 64;
  const specialSize = compact ? 40 : 56;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        alignItems: 'center',
      }}
    >
      {/* Die-rector dice grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: compact ? 'repeat(3, 1fr)' : 'repeat(6, 1fr)',
          gap: compact ? 2 : 3,
        }}
      >
        {DICE_CONFIG.map((config) => {
          const isSelected = value === config.luckyNumber;
          const color = getDiceColor(config.sides);

          return (
            <Box
              key={config.sides}
              onClick={() => onChange(config.luckyNumber)}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1,
                cursor: 'pointer',
                opacity: isSelected ? 1 : 0.6,
                transition: 'all 0.2s ease',
                '&:hover': {
                  opacity: 1,
                  transform: 'scale(1.05)',
                },
              }}
            >
              <Box
                sx={{
                  position: 'relative',
                }}
              >
                <DiceShape
                  sides={config.sides}
                  size={diceSize}
                  color={isSelected ? color : `${color}40`}
                  value={config.luckyNumber}
                />
              </Box>

              {showLabels && (
                <Box sx={{ textAlign: 'center' }}>
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      fontWeight: 600,
                      color: isSelected ? color : tokens.colors.text.secondary,
                      textTransform: 'capitalize',
                    }}
                  >
                    {config.dierector.replace('-', ' ')}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      fontSize: '0.65rem',
                      color: tokens.colors.text.disabled,
                    }}
                  >
                    {config.domain}
                  </Typography>
                </Box>
              )}
            </Box>
          );
        })}
      </Box>

      {/* Special options: None (0) and All (7) */}
      <Box
        sx={{
          display: 'flex',
          gap: 4,
          pt: 2,
          borderTop: `1px solid ${tokens.colors.border}`,
        }}
      >
        {/* None option */}
        <Box
          onClick={() => onChange(0)}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1,
            cursor: 'pointer',
            opacity: value === 0 ? 1 : 0.6,
            transition: 'all 0.2s ease',
            '&:hover': {
              opacity: 1,
            },
          }}
        >
          <Box
            sx={{
              width: specialSize,
              height: specialSize,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: value === 0 ? tokens.colors.text.disabled : 'transparent',
              border: `2px solid ${tokens.colors.text.disabled}`,
              transition: 'all 0.2s ease',
            }}
          >
            <BlockSharp
              sx={{
                fontSize: specialSize * 0.5,
                color: value === 0 ? tokens.colors.background.default : tokens.colors.text.disabled,
              }}
            />
          </Box>
          {showLabels && (
            <Typography
              variant="caption"
              sx={{
                fontWeight: 600,
                color: value === 0 ? tokens.colors.text.primary : tokens.colors.text.secondary,
              }}
            >
              None
            </Typography>
          )}
        </Box>

        {/* All option */}
        <Box
          onClick={() => onChange(7)}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1,
            cursor: 'pointer',
            opacity: value === 7 ? 1 : 0.6,
            transition: 'all 0.2s ease',
            '&:hover': {
              opacity: 1,
            },
          }}
        >
          <Box
            sx={{
              width: specialSize,
              height: specialSize,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: value === 7 ? tokens.colors.text.primary : 'transparent',
              border: `2px solid ${value === 7 ? tokens.colors.text.primary : tokens.colors.text.disabled}`,
              transition: 'all 0.2s ease',
            }}
          >
            <AllInclusiveSharp
              sx={{
                fontSize: specialSize * 0.5,
                color: value === 7 ? tokens.colors.background.default : tokens.colors.text.disabled,
              }}
            />
          </Box>
          {showLabels && (
            <Typography
              variant="caption"
              sx={{
                fontWeight: 600,
                color: value === 7 ? tokens.colors.text.primary : tokens.colors.text.secondary,
              }}
            >
              All
            </Typography>
          )}
        </Box>
      </Box>

      {/* Selected description */}
      {showLabels && (
        <Box
          sx={{
            textAlign: 'center',
            mt: 1,
            p: 2,
            backgroundColor: tokens.colors.background.elevated,
            borderRadius: tokens.radius.md,
            maxWidth: 320,
          }}
        >
          <Typography variant="body2" sx={{ color: tokens.colors.text.secondary }}>
            {getDescription(value)}
          </Typography>
        </Box>
      )}
    </Box>
  );
}

// Get description for selected lucky number
function getDescription(luckyNumber: LuckyNumber): string {
  const descriptions: Record<LuckyNumber, string> = {
    0: 'No Die-rector patron. You walk alone, outside the favor system.',
    1: 'The One watches over you. Void energy pulses through your d4 rolls.',
    2: 'John\'s mechanical precision guides your d6. Earth and stone answer your call.',
    3: 'Peter\'s shadow blessing enhances your d8. Life and death bend to your will.',
    4: 'Robert\'s infernal favor ignites your d10. Fire courses through your dice.',
    5: 'Alice\'s temporal gift chills your d12. Time itself bows to your rolls.',
    6: 'Jane\'s aberrant chaos empowers your d20. Reality becomes a suggestion.',
    7: 'The Board Room grants favor on all dice. Every roll carries potential blessing.',
  };

  return descriptions[luckyNumber];
}

// Size configurations for LuckyNumberBadge
const BADGE_SIZES = {
  sm: { circle: 20, font: '0.65rem', gap: 0.5 },
  md: { circle: 28, font: '0.8rem', gap: 0.75 },
  lg: { circle: 36, font: '1rem', gap: 1 },
} as const;

// Get Die-rector name for a lucky number
function getDierectorName(luckyNumber: LuckyNumber): string | null {
  const config = DICE_CONFIG.find((d) => d.luckyNumber === luckyNumber);
  return config ? config.dierector.replace('-', ' ') : null;
}

interface LuckyNumberBadgeProps {
  value: LuckyNumber;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  onClick?: () => void;
}

// Compact inline version for headers/status - simple circled number
export function LuckyNumberBadge({
  value,
  size = 'sm',
  showLabel = false,
  onClick,
}: LuckyNumberBadgeProps) {
  const sizeConfig = BADGE_SIZES[size];
  const color = getDiceColor(DICE_CONFIG.find((d) => d.luckyNumber === value)?.sides || 6);

  // Special case: None (0)
  if (value === 0) {
    return (
      <Box
        onClick={onClick}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: sizeConfig.gap,
          cursor: onClick ? 'pointer' : 'default',
          opacity: 0.6,
        }}
      >
        <Box
          sx={{
            width: sizeConfig.circle,
            height: sizeConfig.circle,
            borderRadius: '50%',
            border: `2px solid ${tokens.colors.text.disabled}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <BlockSharp sx={{ fontSize: sizeConfig.circle * 0.6, color: tokens.colors.text.disabled }} />
        </Box>
        {showLabel && (
          <Typography variant="caption" sx={{ color: tokens.colors.text.disabled, fontSize: sizeConfig.font }}>
            None
          </Typography>
        )}
      </Box>
    );
  }

  // Special case: All (7)
  if (value === 7) {
    return (
      <Box
        onClick={onClick}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: sizeConfig.gap,
          cursor: onClick ? 'pointer' : 'default',
        }}
      >
        <Box
          sx={{
            width: sizeConfig.circle,
            height: sizeConfig.circle,
            borderRadius: '50%',
            border: `2px solid ${tokens.colors.text.primary}`,
            backgroundColor: tokens.colors.text.primary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <AllInclusiveSharp
            sx={{
              fontSize: sizeConfig.circle * 0.6,
              color: tokens.colors.background.default,
            }}
          />
        </Box>
        {showLabel && (
          <Typography variant="caption" sx={{ color: tokens.colors.text.primary, fontSize: sizeConfig.font }}>
            All
          </Typography>
        )}
      </Box>
    );
  }

  // Standard lucky numbers 1-6: Simple circled number
  const dierectorName = getDierectorName(value);

  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: sizeConfig.gap,
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      <Box
        sx={{
          width: sizeConfig.circle,
          height: sizeConfig.circle,
          borderRadius: '50%',
          border: `2px solid ${color}`,
          backgroundColor: `${color}20`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography
          sx={{
            fontSize: sizeConfig.font,
            fontWeight: 700,
            color: color,
            lineHeight: 1,
          }}
        >
          {value}
        </Typography>
      </Box>
      {showLabel && dierectorName && (
        <Typography
          variant="caption"
          sx={{ color, fontWeight: 600, textTransform: 'capitalize', fontSize: sizeConfig.font }}
        >
          {dierectorName}
        </Typography>
      )}
    </Box>
  );
}
