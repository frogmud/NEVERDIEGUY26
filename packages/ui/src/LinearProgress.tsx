import { LinearProgress as MuiLinearProgress, SxProps, Theme } from '@mui/material';
import { tokens } from '@neverdieguy/tokens';

export type LinearProgressColor = 'primary' | 'success' | 'warning' | 'error';

export interface LinearProgressProps {
  /** 0-100. Omit for an indeterminate bar. */
  value?: number;
  color?: LinearProgressColor;
  sx?: SxProps<Theme>;
}

const colorMap: Record<LinearProgressColor, string> = {
  primary: tokens.colors.primary,
  success: tokens.colors.success,
  warning: tokens.colors.warning,
  error: tokens.colors.error,
};

/**
 * LinearProgress - maps to the BONES "LinearProgress" component
 * (Color=Primary|Success|Warning|Error).
 */
export function LinearProgress({ value, color = 'primary', sx }: LinearProgressProps) {
  const barColor = colorMap[color];
  return (
    <MuiLinearProgress
      variant={value === undefined ? 'indeterminate' : 'determinate'}
      value={value}
      sx={{
        height: 6,
        borderRadius: 9999,
        backgroundColor: tokens.colors.background.elevated,
        '& .MuiLinearProgress-bar': {
          backgroundColor: barColor,
          borderRadius: 9999,
        },
        ...sx,
      }}
    />
  );
}
