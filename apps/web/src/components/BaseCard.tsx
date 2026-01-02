import { ReactNode } from 'react';
import { Paper, SxProps, Theme } from '@mui/material';
import { tokens } from '../theme';

export interface BaseCardProps {
  children: ReactNode;
  hover?: boolean;
  padding?: number;
  onClick?: () => void;
  sx?: SxProps<Theme>;
}

export function BaseCard({
  children,
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
        backgroundColor: tokens.colors.background.paper,
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
