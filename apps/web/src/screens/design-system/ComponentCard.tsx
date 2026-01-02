import { Box, Typography, Chip, Paper } from '@mui/material';
import { ReactNode } from 'react';
import { tokens } from '../../theme';

interface ComponentCardProps {
  name: string;
  category: string;
  description: string;
  preview: ReactNode;
  onClick?: () => void;
}

export function ComponentCard({ name, category, description, preview, onClick }: ComponentCardProps) {
  return (
    <Paper
      onClick={onClick}
      sx={{
        bgcolor: tokens.colors.background.paper,
        border: `1px solid ${tokens.colors.border}`,
        borderRadius: 2,
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        '&:hover': onClick
          ? {
              borderColor: tokens.colors.primary,
              transform: 'translateY(-2px)',
              boxShadow: `0 4px 12px ${tokens.colors.primary}20`,
            }
          : {},
      }}
    >
      <Box sx={{ p: 2.5 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
            {name}
          </Typography>
          <Chip
            label={category}
            size="small"
            sx={{
              height: 20,
              fontSize: '0.6875rem',
              bgcolor: `${tokens.colors.primary}15`,
              color: tokens.colors.primary,
              fontWeight: 500,
              border: 'none',
            }}
          />
        </Box>

        {/* Description */}
        <Typography
          variant="body2"
          sx={{
            color: tokens.colors.text.secondary,
            fontSize: '0.8125rem',
            mb: 2,
            lineHeight: 1.4,
          }}
        >
          {description}
        </Typography>

        {/* Preview */}
        <Box
          sx={{
            pt: 2,
            borderTop: `1px solid ${tokens.colors.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 60,
            pointerEvents: 'none',
          }}
        >
          {preview}
        </Box>
      </Box>
    </Paper>
  );
}
