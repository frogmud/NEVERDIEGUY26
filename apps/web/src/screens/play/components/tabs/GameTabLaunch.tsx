/**
 * GameTabLaunch - Zone selection / launch screen
 *
 * Shows all 3 zones in the domain with Tier + Time.
 * Player clicks a zone to select, then launches.
 * Time shifts based on attack order (1st=Afternoon, 2nd=Night, 3rd=Dawn)
 */

import { Box, Typography, Button, ButtonBase } from '@mui/material';
import { PlayArrowSharp as PlayIcon } from '@mui/icons-material';
import { tokens } from '../../../../theme';

// Time of day based on attack order
export type TimeOfDay = 'afternoon' | 'night' | 'dawn';

export interface ZoneInfo {
  id: string;
  tier: number;
  timeOfDay: TimeOfDay;
  isBoss?: boolean;
  bossModifier?: number; // e.g., 1.4 = +40% if skipping
}

interface GameTabLaunchProps {
  zones: ZoneInfo[];
  selectedZoneId?: string | null;
  onZoneSelect?: (zoneId: string) => void;
  onLaunch?: () => void;
  onBack?: () => void;
  seedHash?: string; // For display in zone IDs
  // Run progress
  currentDomain?: number;
  totalDomains?: number;
  currentRoom?: number;
  totalRooms?: number;
  totalScore?: number;
  gold?: number;
}

// Time display config
const TIME_CONFIG: Record<TimeOfDay, { label: string; color: string }> = {
  afternoon: { label: 'Afternoon', color: '#f59e0b' }, // Amber
  night: { label: 'Night', color: '#6366f1' },         // Indigo
  dawn: { label: 'Dawn', color: '#f97316' },           // Orange
};

export function GameTabLaunch({
  zones,
  selectedZoneId,
  onZoneSelect,
  onLaunch,
  onBack,
  seedHash = '######',
  currentDomain = 1,
  totalDomains = 6,
  currentRoom = 1,
  totalRooms = 3,
  totalScore = 0,
  gold = 0,
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
          SELECT ZONE
        </Typography>
      </Box>

      {/* Instructions */}
      <Typography
        sx={{
          fontSize: '0.875rem',
          color: tokens.colors.text.secondary,
          textAlign: 'center',
          mb: 3,
        }}
      >
        Click an event to begin
      </Typography>

      {/* Zone Cards */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
        {zones.map((zone, index) => {
          const isSelected = zone.id === selectedZoneId;
          const timeConfig = TIME_CONFIG[zone.timeOfDay];

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
                  borderRadius: '16px',
                  bgcolor: tokens.colors.background.elevated,
                  border: isSelected
                    ? `2px solid ${tokens.colors.text.primary}`
                    : `1px solid ${tokens.colors.border}`,
                  transition: 'border-color 0.15s, background-color 0.15s',
                  '&:hover': {
                    bgcolor: tokens.colors.background.paper,
                  },
                }}
              >
                {/* Zone Name */}
                <Typography
                  sx={{
                    fontFamily: tokens.fonts.gaming,
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    color: tokens.colors.text.primary,
                    mb: 1,
                  }}
                >
                  Event {index + 1}
                </Typography>

                {/* Tier + Time Row */}
                <Box sx={{ display: 'flex', gap: 3 }}>
                  <Box>
                    <Typography sx={{ fontSize: '0.65rem', color: tokens.colors.text.disabled, mb: 0.25 }}>
                      Tier
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: tokens.fonts.gaming,
                        fontSize: '1rem',
                        color: tokens.colors.secondary,
                      }}
                    >
                      {zone.tier}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: '0.65rem', color: tokens.colors.text.disabled, mb: 0.25 }}>
                      Time
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: tokens.fonts.gaming,
                        fontSize: '0.85rem',
                        color: timeConfig.color,
                      }}
                    >
                      {timeConfig.label}
                    </Typography>
                  </Box>
                  {/* Boss modifier if skipping */}
                  {zone.isBoss && zone.bossModifier && zone.bossModifier > 1 && (
                    <Box sx={{ ml: 'auto' }}>
                      <Typography sx={{ fontSize: '0.65rem', color: tokens.colors.text.disabled, mb: 0.25 }}>
                        Boss
                      </Typography>
                      <Typography
                        sx={{
                          fontFamily: tokens.fonts.gaming,
                          fontSize: '0.85rem',
                          color: tokens.colors.error,
                        }}
                      >
                        +{Math.round((zone.bossModifier - 1) * 100)}%
                      </Typography>
                    </Box>
                  )}
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
