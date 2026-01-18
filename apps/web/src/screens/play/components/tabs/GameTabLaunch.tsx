/**
 * GameTabLaunch - Simple launch screen
 *
 * Shows domain info and launch button.
 * 1 event per domain, no variant selection needed.
 */

import { Box, Typography, Button } from '@mui/material';
import { PlayArrowSharp as PlayIcon } from '@mui/icons-material';
import { tokens } from '../../../../theme';
import { getFlatScoreGoal, getFlatGoldReward } from '@ndg/ai-engine';

export interface ZoneInfo {
  id: string;
  tier: number;
}

interface GameTabLaunchProps {
  zones: ZoneInfo[];
  selectedZoneId?: string | null;
  onZoneSelect?: (zoneId: string) => void;
  onLaunch?: () => void;
  onBack?: () => void;
  // Run progress
  currentDomain?: number;
  totalDomains?: number;
}

export function GameTabLaunch({
  zones,
  selectedZoneId,
  onZoneSelect,
  onLaunch,
  currentDomain = 1,
}: GameTabLaunchProps) {
  const scoreGoal = getFlatScoreGoal(currentDomain);
  const goldReward = getFlatGoldReward(currentDomain);

  // Auto-select first zone if none selected
  const activeZone = zones.find(z => z.id === selectedZoneId) || zones[0];

  return (
    <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1.5,
          mb: 3,
        }}
      >
        <Box
          component="img"
          src="/logos/ndg-skull-dome.svg"
          alt="NEVERDIEGUY"
          sx={{ width: 32, height: 36 }}
        />
        <Typography
          sx={{
            fontFamily: tokens.fonts.gaming,
            fontSize: '1rem',
            letterSpacing: '0.05em',
            color: tokens.colors.text.primary,
          }}
        >
          DOMAIN {currentDomain}
        </Typography>
      </Box>

      {/* Event Info Card */}
      <Box
        sx={{
          p: 2.5,
          borderRadius: '12px',
          bgcolor: tokens.colors.background.elevated,
          border: `1px solid ${tokens.colors.border}`,
          mb: 3,
        }}
      >
        {/* Stats Row: Goal, Timer, Gold */}
        <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center' }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography sx={{ fontSize: '0.65rem', color: tokens.colors.text.disabled, mb: 0.5 }}>
              Score Goal
            </Typography>
            <Typography
              sx={{
                fontFamily: tokens.fonts.gaming,
                fontSize: '1.1rem',
                color: tokens.colors.text.primary,
              }}
            >
              {scoreGoal.toLocaleString()}
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography sx={{ fontSize: '0.65rem', color: tokens.colors.text.disabled, mb: 0.5 }}>
              Timer
            </Typography>
            <Typography
              sx={{
                fontFamily: tokens.fonts.gaming,
                fontSize: '1.1rem',
                color: tokens.colors.text.primary,
              }}
            >
              20s
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography sx={{ fontSize: '0.65rem', color: tokens.colors.text.disabled, mb: 0.5 }}>
              Gold
            </Typography>
            <Typography
              sx={{
                fontFamily: tokens.fonts.gaming,
                fontSize: '1.1rem',
                color: tokens.colors.warning,
              }}
            >
              {goldReward}g
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Spacer */}
      <Box sx={{ flex: 1 }} />

      {/* Launch Button */}
      <Button
        variant="contained"
        fullWidth
        onClick={() => {
          // Select zone if not selected, then launch
          if (!selectedZoneId && activeZone) {
            onZoneSelect?.(activeZone.id);
          }
          onLaunch?.();
        }}
        startIcon={<PlayIcon />}
        sx={{
          py: 1.5,
          fontFamily: tokens.fonts.gaming,
          fontSize: '1.1rem',
          borderRadius: '12px',
          bgcolor: tokens.colors.primary,
          '&:hover': {
            bgcolor: tokens.colors.primary,
            opacity: 0.9,
          },
        }}
      >
        LAUNCH
      </Button>
    </Box>
  );
}
