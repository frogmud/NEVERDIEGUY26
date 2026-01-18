import { ReactNode } from 'react';
import { Box, Typography, SxProps, Theme } from '@mui/material';
import { tokens } from '../theme';
import { DURATION, EASING } from '../utils/transitions';

export interface ListItemRowProps {
  icon?: ReactNode;
  primary: string;
  secondary?: string;
  action?: ReactNode;
  onClick?: () => void;
  sx?: SxProps<Theme>;
}

export function ListItemRow({
  icon,
  primary,
  secondary,
  action,
  onClick,
  sx,
}: ListItemRowProps) {
  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        py: 1.5,
        px: 2,
        borderRadius: 1,
        cursor: onClick ? 'pointer' : 'default',
        // Balatro-style transitions
        transition: `all ${DURATION.fast}ms ${EASING.smooth}`,
        // Hover with lift effect
        '&:hover': onClick
          ? {
              backgroundColor: tokens.colors.background.elevated,
              transform: 'translateX(4px)',
            }
          : undefined,
        // Active press feedback
        '&:active': onClick
          ? {
              transform: 'translateX(2px)',
              transition: 'all 50ms ease-out',
            }
          : undefined,
        ...sx,
      }}
    >
      {icon && (
        <Box sx={{ color: tokens.colors.text.secondary, display: 'flex' }}>
          {icon}
        </Box>
      )}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {primary}
        </Typography>
        {secondary && (
          <Typography variant="caption" sx={{ color: tokens.colors.text.disabled }}>
            {secondary}
          </Typography>
        )}
      </Box>
      {action}
    </Box>
  );
}
