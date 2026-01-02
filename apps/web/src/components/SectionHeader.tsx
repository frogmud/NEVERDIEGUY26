import { ReactNode } from 'react';
import { Box, Typography, SxProps, Theme } from '@mui/material';

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  action?: ReactNode;
  variant?: 'h5' | 'h6' | 'subtitle1' | 'subtitle2';
  sx?: SxProps<Theme>;
}

export function SectionHeader({
  title,
  subtitle,
  icon,
  action,
  variant = 'h6',
  sx,
}: SectionHeaderProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: subtitle ? 'flex-start' : 'center',
        justifyContent: 'space-between',
        mb: 2,
        ...sx,
      }}
    >
      <Box>
        <Typography
          variant={variant}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          {icon}
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {action}
    </Box>
  );
}
