import { Typography, SxProps, Theme } from '@mui/material';
import { tokens } from '@neverdieguy/tokens';

export type DataBadgeColor = 'primary' | 'secondary' | 'warning' | 'success' | 'error';
export type DataBadgeRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'unique';

export interface DataBadgeProps {
  label: string;
  /** Semantic color. Ignored when `rarity` is set. */
  color?: DataBadgeColor;
  /**
   * Rarity-ramp tint. When set, overrides `color` and uses the rarity color for
   * the text/border (outlined) or background (filled). Mirrors the BONES
   * DataBadge "Rarity" variant - added during the Code Connect reconciliation
   * pass (see docs/ds/reconciliation.md).
   */
  rarity?: DataBadgeRarity;
  variant?: 'filled' | 'outlined';
  size?: 'sm' | 'md';
  sx?: SxProps<Theme>;
}

const colorMap: Record<DataBadgeColor, string> = {
  primary: tokens.colors.primary,
  secondary: tokens.colors.secondary,
  warning: tokens.colors.warning,
  success: tokens.colors.success,
  error: tokens.colors.error,
};

export function DataBadge({
  label,
  color = 'primary',
  rarity,
  variant = 'outlined',
  size = 'sm',
  sx,
}: DataBadgeProps) {
  const colorValue = rarity ? tokens.colors.rarity[rarity] : colorMap[color];
  const isFilled = variant === 'filled';

  return (
    <Typography
      variant="caption"
      sx={{
        display: 'inline-block',
        px: size === 'sm' ? 1 : 1.5,
        py: size === 'sm' ? 0.25 : 0.5,
        borderRadius: 0.5,
        fontSize: size === 'sm' ? '0.65rem' : '0.75rem',
        fontWeight: 500,
        lineHeight: 1.4,
        ...(isFilled
          ? {
              backgroundColor: colorValue,
              color: '#0a0a0a',
            }
          : {
              backgroundColor: tokens.colors.background.paper,
              border: `1px solid ${colorValue}`,
              color: colorValue,
            }),
        ...sx,
      }}
    >
      {label}
    </Typography>
  );
}
