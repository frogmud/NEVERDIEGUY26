/**
 * GameTabLaunch - Event selection / launch screen
 *
 * Shows 3 event options with different risk/reward profiles.
 * Player picks one event per domain: Swift (easy), Standard, or Grueling (hard).
 */

import { Box, Typography, Button, ButtonBase } from '@mui/material';
import { PlayArrowSharp as PlayIcon } from '@mui/icons-material';
import { tokens } from '../../../../theme';
import { EVENT_VARIANTS, type EventVariant } from '../../../../types/zones';
import { getFlatScoreGoal, getFlatGoldReward } from '@ndg/ai-engine';

export interface ZoneInfo {
  id: string;
  tier: number;
  eventVariant: EventVariant;
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
  return (
    <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1.5,
          mb: 2,
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
          CHOOSE EVENT
        </Typography>
      </Box>

      {/* Instructions */}
      <Typography
        sx={{
          fontSize: '0.8rem',
          color: tokens.colors.text.secondary,
          textAlign: 'center',
          mb: 2,
        }}
      >
        Pick your challenge for Domain {currentDomain}
      </Typography>

      {/* Event Option Cards */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
        {zones.map((zone) => {
          const isSelected = zone.id === selectedZoneId;
          const variant = EVENT_VARIANTS[zone.eventVariant];
          const baseGoal = getFlatScoreGoal(currentDomain);
          const baseGold = getFlatGoldReward(currentDomain);
          const adjustedGoal = Math.round(baseGoal * variant.goalMultiplier);
          const adjustedGold = Math.round(baseGold * variant.goldMultiplier);
          const timerSecs = Math.round(20 * variant.timerMultiplier); // Base 20s from FLAT_EVENT_CONFIG

          return (
            <ButtonBase
              key={zone.id}
              onClick={() => onZoneSelect?.(zone.id)}
              sx={{
                display: 'block',
                textAlign: 'left',
                width: '100%',
              }}
            >
              <Box
                sx={{
                  p: 2,
                  borderRadius: '12px',
                  bgcolor: tokens.colors.background.elevated,
                  border: isSelected
                    ? `2px solid ${variant.color}`
                    : `1px solid ${tokens.colors.border}`,
                  transition: 'border-color 0.15s, background-color 0.15s',
                  '&:hover': {
                    bgcolor: tokens.colors.background.paper,
                    borderColor: variant.color,
                  },
                }}
              >
                {/* Variant Name + Description */}
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5, mb: 1.5 }}>
                  <Typography
                    sx={{
                      fontFamily: tokens.fonts.gaming,
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      color: variant.color,
                    }}
                  >
                    {variant.label}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '0.75rem',
                      color: tokens.colors.text.disabled,
                    }}
                  >
                    {variant.description}
                  </Typography>
                </Box>

                {/* Stats Row: Goal, Timer, Gold */}
                <Box sx={{ display: 'flex', gap: 2.5 }}>
                  <Box>
                    <Typography sx={{ fontSize: '0.6rem', color: tokens.colors.text.disabled, mb: 0.25 }}>
                      Goal
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: tokens.fonts.gaming,
                        fontSize: '0.95rem',
                        color: tokens.colors.text.primary,
                      }}
                    >
                      {adjustedGoal.toLocaleString()}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: '0.6rem', color: tokens.colors.text.disabled, mb: 0.25 }}>
                      Timer
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: tokens.fonts.gaming,
                        fontSize: '0.95rem',
                        color: tokens.colors.text.primary,
                      }}
                    >
                      {timerSecs}s
                    </Typography>
                  </Box>
                  <Box sx={{ ml: 'auto' }}>
                    <Typography sx={{ fontSize: '0.6rem', color: tokens.colors.text.disabled, mb: 0.25 }}>
                      Gold
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: tokens.fonts.gaming,
                        fontSize: '0.95rem',
                        color: '#c4a000',
                      }}
                    >
                      {adjustedGold}g
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </ButtonBase>
          );
        })}
      </Box>

      {/* Spacer */}
      <Box sx={{ flex: 1 }} />

      {/* Launch Button */}
      <Button
        variant="contained"
        size="large"
        startIcon={<PlayIcon />}
        onClick={onLaunch}
        disabled={!selectedZoneId}
        sx={{
          py: 1.5,
          borderRadius: '16px',
          bgcolor: tokens.colors.success,
          fontFamily: tokens.fonts.gaming,
          fontSize: '1.25rem',
          '&:hover': { bgcolor: '#16a34a' },
          '&.Mui-disabled': {
            bgcolor: tokens.colors.background.elevated,
            color: tokens.colors.text.disabled,
          },
        }}
      >
        Launch
      </Button>
    </Box>
  );
}
