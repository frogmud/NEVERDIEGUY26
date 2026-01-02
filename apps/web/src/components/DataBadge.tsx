import { Typography, SxProps, Theme } from '@mui/material';
import { tokens } from '../theme';

export interface DataBadgeProps {
  label: string;
  color?: 'primary' | 'secondary' | 'warning' | 'success' | 'error';
  variant?: 'filled' | 'outlined';
  size?: 'sm' | 'md';
  sx?: SxProps<Theme>;
}

const colorMap = {
  primary: tokens.colors.primary,
  secondary: tokens.colors.secondary,
  warning: tokens.colors.warning,
  success: tokens.colors.success,
  error: tokens.colors.error,
};

export function DataBadge({
  label,
  color = 'primary',
  variant = 'outlined',
  size = 'sm',
  sx,
}: DataBadgeProps) {
  const colorValue = colorMap[color];
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
