import { ReactNode } from 'react';
import { Paper, SxProps, Theme } from '@mui/material';
import { tokens } from '@neverdieguy/tokens';

export type BaseCardSurface = 'paper' | 'elevated';

export interface BaseCardProps {
  children: ReactNode;
  /** Surface tone. Maps to the BONES "Surface" variant. */
  surface?: BaseCardSurface;
  hover?: boolean;
  padding?: number;
  onClick?: () => void;
  sx?: SxProps<Theme>;
}

export function BaseCard({
  children,
  surface = 'paper',
  hover = false,
  padding = 3,
  onClick,
  sx,
}: BaseCardProps) {
  return (
    <Paper
      onClick={onClick}
      sx={{
        p: padding,
        backgroundColor:
          surface === 'elevated'
            ? tokens.colors.background.elevated
            : tokens.colors.background.paper,
        border: `1px solid ${tokens.colors.border}`,
        borderRadius: '30px',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        ...(hover && {
          '&:hover': {
            borderColor: tokens.colors.primary,
            transform: 'translateY(-2px)',
          },
        }),
        ...sx,
      }}
    >
      {children}
    </Paper>
  );
}
