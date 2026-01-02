import { ReactNode } from 'react';
import { Box, Typography, SxProps, Theme } from '@mui/material';
import { tokens } from '../theme';
import { BaseCard } from './BaseCard';

export interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  sx?: SxProps<Theme>;
}

export function StatCard({ label, value, icon, sx }: StatCardProps) {
  return (
    <BaseCard padding={2} sx={sx}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {icon && (
          <Box
            sx={{
              color: tokens.colors.primary,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {icon}
          </Box>
        )}
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            {value}
          </Typography>
          <Typography variant="caption" sx={{ color: tokens.colors.text.disabled }}>
            {label}
          </Typography>
        </Box>
      </Box>
    </BaseCard>
  );
}
