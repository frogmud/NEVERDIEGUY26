/**
 * StatusBanner - Inline status notification bar
 *
 * Design pattern extracted from DailyHits/DailyWiki (Dec 29, 2024)
 * Used for contextual status messages with icon indicators.
 *
 * Variants:
 * - warning: Primary/red background with exclamation icon
 * - success: Green background with check icon
 * - info: Secondary/cyan background with info icon
 */

import { ReactNode } from 'react';
import { Box, Typography } from '@mui/material';
import {
  CheckSharp as CheckIcon,
  InfoSharp as InfoIcon,
} from '@mui/icons-material';
import { tokens } from '../../theme';

export type StatusBannerVariant = 'warning' | 'success' | 'info';

export interface StatusBannerProps {
  /** Visual variant */
  variant: StatusBannerVariant;
  /** Banner content (usually text) */
  children: ReactNode;
  /** Custom icon to override default */
  icon?: ReactNode;
}

// Variant configurations
const VARIANTS: Record<StatusBannerVariant, {
  bgColor: string;
  bgOpacity: string;
  iconColor: string;
  defaultIcon: ReactNode;
}> = {
  warning: {
    bgColor: tokens.colors.primary,
    bgOpacity: '30',
    iconColor: tokens.colors.primary,
    defaultIcon: (
      <Typography sx={{ color: tokens.colors.background.default, fontWeight: 700, fontSize: '0.7rem' }}>
        !
      </Typography>
    ),
  },
  success: {
    bgColor: tokens.colors.success,
    bgOpacity: '25',
    iconColor: tokens.colors.success,
    defaultIcon: <CheckIcon sx={{ color: tokens.colors.background.default, fontSize: 12 }} />,
  },
  info: {
    bgColor: tokens.colors.secondary,
    bgOpacity: '25',
    iconColor: tokens.colors.secondary,
    defaultIcon: <InfoIcon sx={{ color: tokens.colors.background.default, fontSize: 12 }} />,
  },
};

export function StatusBanner({ variant, children, icon }: StatusBannerProps) {
  const config = VARIANTS[variant];

  return (
    <Box
      sx={{
        px: 1.5,
        py: 0.75,
        bgcolor: `${config.bgColor}${config.bgOpacity}`,
        display: 'flex',
        alignItems: 'center',
        gap: 0.75,
      }}
    >
      {/* Circular Icon */}
      <Box
        sx={{
          width: 20,
          height: 20,
          minWidth: 20,
          borderRadius: '50%',
          bgcolor: config.iconColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon ?? config.defaultIcon}
      </Box>

      {/* Content */}
      {typeof children === 'string' ? (
        <Typography sx={{ fontSize: '0.7rem' }}>{children}</Typography>
      ) : (
        children
      )}
    </Box>
  );
}
