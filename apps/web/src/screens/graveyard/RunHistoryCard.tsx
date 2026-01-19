/**
 * RunHistoryCard - Individual run entry for Graveyard screen
 *
 * Displays run details: victory/death status, domain progress, score, heat, timestamp
 *
 * NEVER DIE GUY
 */

import { Box, Typography, Tooltip } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { tokens } from '../../theme';
import type { RunHistoryEntry } from '../../data/player/storage';

// Domain names for display
const DOMAIN_NAMES: Record<number, string> = {
  1: 'Earth',
  2: 'Caverns',
  3: 'Ocean',
  4: 'Sky',
  5: 'Void',
  6: 'Core',
};

interface RunHistoryCardProps {
  run: RunHistoryEntry;
}

export function RunHistoryCard({ run }: RunHistoryCardProps) {
  const domainName = DOMAIN_NAMES[run.domain] || `Domain ${run.domain}`;
  const progressText = run.won
    ? 'Victory - All Domains Cleared'
    : `Reached ${domainName} - Room ${run.roomsCleared % 3 || 3}`;

  // Format timestamp
  const date = new Date(run.timestamp);
  const dateStr = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
  });
  const timeStr = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  // Format duration if available
  const durationStr = run.duration
    ? `${Math.floor(run.duration / 60000)}m ${Math.floor((run.duration % 60000) / 1000)}s`
    : null;

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        border: `1px solid ${run.won ? tokens.colors.success : tokens.colors.border}`,
        bgcolor: run.won ? 'rgba(76, 175, 80, 0.05)' : tokens.colors.background.paper,
        transition: 'all 150ms ease',
        '&:hover': {
          borderColor: run.won ? tokens.colors.success : tokens.colors.text.secondary,
          bgcolor: run.won ? 'rgba(76, 175, 80, 0.08)' : tokens.colors.background.elevated,
        },
      }}
    >
      {/* Header: Status + Score */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        {/* Status Icon + Label */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {run.won ? (
            <CheckCircleIcon sx={{ fontSize: 24, color: tokens.colors.success }} />
          ) : (
            <CancelIcon sx={{ fontSize: 24, color: tokens.colors.primary }} />
          )}
          <Typography
            sx={{
              fontFamily: tokens.fonts.gaming,
              fontSize: '1rem',
              color: run.won ? tokens.colors.success : tokens.colors.primary,
              fontWeight: 700,
            }}
          >
            {run.won ? 'VICTORY' : 'YOU DIED'}
          </Typography>
        </Box>

        {/* Score */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <Box
            component="img"
            src="/assets/ui/token.svg"
            alt=""
            sx={{ width: 20, height: 20 }}
          />
          <Typography
            sx={{
              fontFamily: tokens.fonts.gaming,
              fontSize: '1.25rem',
              color: tokens.colors.text.primary,
              fontWeight: 700,
            }}
          >
            {run.totalScore.toLocaleString()}
          </Typography>
        </Box>
      </Box>

      {/* Progress + Killed By */}
      <Typography
        sx={{
          fontSize: '0.9rem',
          color: tokens.colors.text.secondary,
          mb: 1,
        }}
      >
        {progressText}
      </Typography>

      {/* Killed By (if death) */}
      {!run.won && run.stats.killedBy && (
        <Typography
          sx={{
            fontSize: '0.85rem',
            color: tokens.colors.text.disabled,
            fontStyle: 'italic',
            mb: 1,
          }}
        >
          Slain by {run.stats.killedBy}
        </Typography>
      )}

      {/* Stats Row: Heat, Gold, Duration, Date */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        {/* Heat at Death (if applicable) */}
        {run.stats.heatAtDeath !== undefined && run.stats.heatAtDeath > 0 && (
          <Tooltip title="Heat level at time of death" placement="top">
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                px: 0.75,
                py: 0.25,
                borderRadius: '6px',
                bgcolor: 'rgba(255, 59, 63, 0.1)',
                border: `1px solid ${tokens.colors.primary}`,
              }}
            >
              <Typography
                sx={{
                  fontFamily: tokens.fonts.gaming,
                  fontSize: '0.75rem',
                  color: tokens.colors.primary,
                }}
              >
                Heat {run.stats.heatAtDeath}
              </Typography>
            </Box>
          </Tooltip>
        )}

        {/* Gold Earned */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box
            component="img"
            src="/assets/ui/currency-svg/coin.svg"
            alt=""
            sx={{ width: 14, height: 14 }}
          />
          <Typography sx={{ fontSize: '0.8rem', color: tokens.colors.warning }}>
            {run.gold.toLocaleString()}
          </Typography>
        </Box>

        {/* Duration */}
        {durationStr && (
          <Typography sx={{ fontSize: '0.8rem', color: tokens.colors.text.disabled }}>
            {durationStr}
          </Typography>
        )}

        {/* Spacer */}
        <Box sx={{ flex: 1 }} />

        {/* Timestamp */}
        <Typography sx={{ fontSize: '0.75rem', color: tokens.colors.text.disabled }}>
          {dateStr} {timeStr}
        </Typography>
      </Box>
    </Box>
  );
}
