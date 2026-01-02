import { ReactNode } from 'react';
import { Box, SxProps, Theme } from '@mui/material';
import { tokens } from '../theme';

// Size presets for convenience
const SIZE_PRESETS = {
  sm: { box: 32, icon: 18 },
  md: { box: 40, icon: 22 },
  lg: { box: 56, icon: 28 },
  xl: { box: 64, icon: 32 },
  xxl: { box: 80, icon: 40 },
} as const;

type SizePreset = keyof typeof SIZE_PRESETS;

export interface CircleIconProps {
  /** The icon element to display */
  icon: ReactNode;
  /** Background color - hex colors auto-add transparency */
  color?: string;
  /** Size as preset (sm/md/lg/xl/xxl) or pixel number */
  size?: SizePreset | number;
  /** Icon size in pixels (auto-calculated from size if not provided) */
  iconSize?: number;
  /** Bottom margin */
  mb?: number;
  /** Center horizontally with mx: 'auto' */
  centered?: boolean;
  /** Additional sx styles */
  sx?: SxProps<Theme>;
}

/**
 * CircleIcon - Unified circular icon wrapper
 *
 * Replaces both IconBadge and IconCircle with a single flexible API.
 *
 * @example
 * // Using size presets
 * <CircleIcon icon={<StarIcon />} size="lg" />
 *
 * @example
 * // Using pixel size with auto-transparency
 * <CircleIcon icon={<CheckIcon />} color="#22c55e" size={64} centered />
 *
 * @example
 * // Dialog header icon pattern
 * <CircleIcon icon={<FlagIcon />} color={tokens.colors.primary} mb={2} centered />
 */
export function CircleIcon({
  icon,
  color = tokens.colors.background.elevated,
  size = 'md',
  iconSize,
  mb,
  centered = false,
  sx,
}: CircleIconProps) {
  // Resolve size to pixels
  const isPreset = typeof size === 'string';
  const boxSize = isPreset ? SIZE_PRESETS[size].box : size;
  const resolvedIconSize = iconSize ?? (isPreset ? SIZE_PRESETS[size].icon : Math.floor(size * 0.5));

  // Auto-add transparency for hex/rgb colors
  const isColorValue = color.startsWith('#') || color.startsWith('rgb');
  const bgColor = isColorValue ? `${color}20` : color;
  const iconColor = isColorValue ? color : undefined;

  return (
    <Box
      sx={{
        width: boxSize,
        height: boxSize,
        borderRadius: '50%',
        backgroundColor: bgColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        ...(centered && { mx: 'auto' }),
        ...(mb !== undefined && { mb }),
        '& .MuiSvgIcon-root': {
          fontSize: resolvedIconSize,
          ...(iconColor && { color: iconColor }),
        },
        // Also support non-MUI svg icons
        '& svg:not(.MuiSvgIcon-root)': {
          width: resolvedIconSize,
          height: resolvedIconSize,
          ...(iconColor && { color: iconColor }),
        },
        ...sx,
      }}
    >
      {icon}
    </Box>
  );
}

// Re-export with legacy names for backwards compatibility
// TODO: Migrate all usages to CircleIcon and remove these
/** @deprecated Use CircleIcon instead */
export const IconBadge = CircleIcon;
/** @deprecated Use CircleIcon instead */
export const IconCircle = CircleIcon;
