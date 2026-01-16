/**
 * DensityMeter - HUD component showing population density tier
 *
 * Displays current NPC count and density tier with color-coded indicator.
 * NEVER DIE GUY
 */

import { Box, Typography, LinearProgress } from '@mui/material';
import { POPULATION_CONFIG, getDensityTier, type DensityTier } from '@ndg/ai-engine';
import { tokens } from '../theme';

interface DensityMeterProps {
  npcCount: number;
  showLabel?: boolean;
  compact?: boolean;
}

// Tier configuration for display
const TIER_DISPLAY: Record<DensityTier, { label: string; color: string }> = {
  sparse: { label: 'Sparse', color: '#4caf50' },
  scattered: { label: 'Scattered', color: '#8bc34a' },
  populated: { label: 'Populated', color: '#ffeb3b' },
  crowded: { label: 'Crowded', color: '#ff9800' },
  swarming: { label: 'Swarming', color: '#f44336' },
};

export function DensityMeter({ npcCount, showLabel = true, compact = false }: DensityMeterProps) {
  const tier = getDensityTier(npcCount);
  const { label, color } = TIER_DISPLAY[tier];

  // Progress as percentage of max population
  const progress = Math.min((npcCount / POPULATION_CONFIG.maxPopulation) * 100, 100);

  if (compact) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 1.5,
          py: 0.5,
          bgcolor: 'rgba(0, 0, 0, 0.6)',
          borderRadius: 1,
          border: `1px solid ${color}`,
        }}
      >
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            bgcolor: color,
            boxShadow: `0 0 6px ${color}`,
          }}
        />
        <Typography
          variant="caption"
          sx={{
            fontFamily: tokens.fonts.gaming,
            color: color,
            fontWeight: 600,
            fontSize: '0.7rem',
          }}
        >
          {npcCount}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: 1,
        bgcolor: 'rgba(0, 0, 0, 0.6)',
        borderRadius: 1,
        border: `1px solid ${color}`,
        minWidth: 120,
      }}
    >
      {showLabel && (
        <Typography
          variant="caption"
          sx={{
            fontFamily: tokens.fonts.gaming,
            color: 'text.secondary',
            fontSize: '0.65rem',
            textTransform: 'uppercase',
            letterSpacing: 1,
            display: 'block',
            mb: 0.5,
          }}
        >
          Population
        </Typography>
      )}

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography
          sx={{
            fontFamily: tokens.fonts.gaming,
            color: color,
            fontWeight: 700,
            fontSize: '0.85rem',
          }}
        >
          {label}
        </Typography>
        <Typography
          sx={{
            fontFamily: tokens.fonts.gaming,
            color: 'text.primary',
            fontWeight: 600,
            fontSize: '0.75rem',
          }}
        >
          {npcCount}/{POPULATION_CONFIG.maxPopulation}
        </Typography>
      </Box>

      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{
          height: 4,
          borderRadius: 2,
          bgcolor: 'rgba(255, 255, 255, 0.1)',
          '& .MuiLinearProgress-bar': {
            bgcolor: color,
            borderRadius: 2,
          },
        }}
      />
    </Box>
  );
}

export default DensityMeter;
