import { Typography, SxProps, Theme } from '@mui/material';
import { tokens } from '@neverdieguy/tokens';

export type ChipStyle = 'solid' | 'outline';
export type ChipColor = 'neutral' | 'primary' | 'success' | 'warning' | 'error';

export interface ChipProps {
  label: string;
  variant?: ChipStyle;
  color?: ChipColor;
  sx?: SxProps<Theme>;
}

const colorMap: Record<ChipColor, string> = {
  neutral: tokens.colors.text.secondary,
  primary: tokens.colors.primary,
  success: tokens.colors.success,
  warning: tokens.colors.warning,
  error: tokens.colors.error,
};

/**
 * Chip - compact status/tag pill. Maps to the BONES "Chip" component
 * (Style=Solid|Outline x Color=Neutral|Primary|Success|Warning|Error).
 */
export function Chip({ label, variant = 'solid', color = 'neutral', sx }: ChipProps) {
  const c = colorMap[color];
  const isSolid = variant === 'solid';

  return (
    <Typography
      component="span"
      variant="caption"
      sx={{
        display: 'inline-block',
        px: 1,
        py: 0.25,
        borderRadius: `${tokens.radius.sm}px`,
        fontWeight: 600,
        lineHeight: 1.5,
        ...(isSolid
          ? { backgroundColor: c, color: color === 'neutral' ? tokens.colors.text.primary : '#0a0a0a' }
          : { backgroundColor: 'transparent', border: `1px solid ${c}`, color: c }),
        ...sx,
      }}
    >
      {label}
    </Typography>
  );
}
