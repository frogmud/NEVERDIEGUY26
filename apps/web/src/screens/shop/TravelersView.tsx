/**
 * Travelers View - Shows playable characters in the Market for relationship building
 *
 * Travelers appear in the market at certain times to offer tips, quests, and build relationships.
 */

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Tooltip,
  Chip,
} from '@mui/material';
import {
  AccessTimeSharp as TimeIcon,
  TipsAndUpdatesSharp as TipsIcon,
  FavoriteSharp as RelationshipIcon,
} from '@mui/icons-material';
import { tokens, RARITY_COLORS } from '../../theme';
import { travelers } from '../../data/wiki/entities/travelers';
import { useMarketAvailability, TIME_LABELS } from '../../hooks/useMarketAvailability';
import type { Traveler } from '../../data/wiki/types';

// Filter travelers who have market presence
function getTravelersWithMarketPresence(): Traveler[] {
  return travelers.filter((t) => t.marketPosition);
}

export function TravelersView() {
  const navigate = useNavigate();
  const { timeInfo, isAvailable } = useMarketAvailability();

  // Get travelers with market positions
  const marketTravelers = useMemo(() => getTravelersWithMarketPresence(), []);

  return (
    <Box>
      {/* Intro text */}
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Typography sx={{ color: tokens.colors.text.secondary, fontSize: '0.9rem' }}>
          Meet fellow travelers, build relationships, and unlock special quests
        </Typography>
      </Box>

      {/* Space Jam Style Traveler Canvas */}
      <Paper
        sx={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16/9',
          bgcolor: tokens.colors.background.elevated,
          borderRadius: '30px',
          overflow: 'hidden',
          border: `1px solid ${tokens.colors.border}`,
        }}
      >
        {/* Background gradient - slightly different from vendors */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(ellipse at 50% 30%, ${tokens.colors.secondary}10 0%, transparent 50%),
                         radial-gradient(ellipse at 50% 100%, ${tokens.colors.background.paper} 0%, transparent 70%)`,
            pointerEvents: 'none',
          }}
        />

        {/* Traveler Sprites */}
        {marketTravelers.map((traveler) => {
          const rarityColor = RARITY_COLORS[traveler.rarity as keyof typeof RARITY_COLORS] || tokens.colors.text.primary;
          const spriteUrl = traveler.sprites?.[0] || traveler.portrait;

          // Check availability
          const availability = isAvailable(traveler.marketAvailability);

          return (
            <Tooltip
              key={traveler.slug}
              title={
                <Box sx={{ minWidth: 200 }}>
                  {/* Header */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography sx={{ fontWeight: 600, fontSize: '0.9rem', flex: 1 }}>
                      {traveler.name}
                    </Typography>
                    <Chip
                      label={traveler.rarity}
                      size="small"
                      sx={{
                        height: 18,
                        fontSize: '0.65rem',
                        bgcolor: `${rarityColor}30`,
                        color: rarityColor,
                      }}
                    />
                  </Box>

                  {/* Availability status */}
                  {!availability.isAvailable && (
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        mb: 1,
                        p: 0.75,
                        borderRadius: '6px',
                        bgcolor: `${tokens.colors.warning}15`,
                        border: `1px solid ${tokens.colors.warning}30`,
                      }}
                    >
                      <TimeIcon sx={{ fontSize: 14, color: tokens.colors.warning }} />
                      <Typography sx={{ fontSize: '0.75rem', color: tokens.colors.warning }}>
                        {availability.reason}
                      </Typography>
                    </Box>
                  )}

                  {/* Play style */}
                  <Typography sx={{ fontSize: '0.75rem', color: tokens.colors.text.secondary, mb: 1 }}>
                    {traveler.playStyle} • {traveler.origin}
                  </Typography>

                  {/* Market role */}
                  {traveler.marketRole && (
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5, mb: 1 }}>
                      <TipsIcon sx={{ fontSize: 14, color: tokens.colors.secondary, mt: 0.25 }} />
                      <Typography sx={{ fontSize: '0.75rem', color: tokens.colors.text.secondary }}>
                        {traveler.marketRole}
                      </Typography>
                    </Box>
                  )}

                  {/* Relationship hint */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      pt: 1,
                      borderTop: `1px solid ${tokens.colors.border}`,
                    }}
                  >
                    <RelationshipIcon sx={{ fontSize: 12, color: tokens.colors.error }} />
                    <Typography sx={{ fontSize: '0.7rem', color: tokens.colors.text.disabled }}>
                      Click to interact and build relationship
                    </Typography>
                  </Box>
                </Box>
              }
              arrow
              placement="top"
              slotProps={{
                tooltip: {
                  sx: {
                    bgcolor: tokens.colors.background.paper,
                    border: `1px solid ${tokens.colors.border}`,
                    borderRadius: '12px',
                    p: 1.5,
                    maxWidth: 260,
                  },
                },
                arrow: {
                  sx: {
                    color: tokens.colors.background.paper,
                    '&::before': {
                      border: `1px solid ${tokens.colors.border}`,
                    },
                  },
                },
              }}
            >
              <Box
                onClick={() => availability.isAvailable && navigate(`/wiki/travelers/${traveler.slug}`)}
                sx={{
                  position: 'absolute',
                  left: traveler.marketPosition?.x || '50%',
                  top: traveler.marketPosition?.y || '50%',
                  transform: 'translate(-50%, -50%)',
                  cursor: availability.isAvailable ? 'pointer' : 'not-allowed',
                  opacity: availability.isAvailable ? 1 : 0.4,
                  filter: availability.isAvailable ? 'none' : 'grayscale(100%)',
                  transition: 'opacity 0.2s, filter 0.2s',
                }}
              >
                {/* Sprite */}
                <img
                  src={spriteUrl}
                  alt={traveler.name}
                  style={{
                    width: 64,
                    height: 'auto',
                    imageRendering: 'pixelated',
                  }}
                />

                {/* Name label below sprite */}
                <Typography
                  sx={{
                    position: 'absolute',
                    bottom: -18,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontSize: '0.65rem',
                    color: availability.isAvailable ? tokens.colors.text.secondary : tokens.colors.warning,
                    whiteSpace: 'nowrap',
                    textAlign: 'center',
                  }}
                >
                  {availability.isAvailable ? traveler.name : availability.reason}
                </Typography>
              </Box>
            </Tooltip>
          );
        })}
      </Paper>

      {/* Hint text */}
      <Typography
        sx={{
          textAlign: 'center',
          mt: 2,
          color: tokens.colors.text.disabled,
          fontSize: '0.875rem',
        }}
      >
        Click a traveler to interact and build your relationship
      </Typography>

      {/* Availability Legend */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          gap: 3,
          mt: 2,
          flexWrap: 'wrap',
        }}
      >
        {(['dawn', 'day', 'dusk', 'night'] as const).map((time) => {
          const isCurrentTime = time === timeInfo.current;
          const travelersAtTime = marketTravelers.filter((t) => {
            if (t.marketAvailability?.always) return true;
            if (!t.marketAvailability?.times) return true;
            return t.marketAvailability.times.includes(time);
          });

          return (
            <Box
              key={time}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                p: 1,
                px: 1.5,
                borderRadius: '8px',
                bgcolor: isCurrentTime ? `${tokens.colors.secondary}15` : 'transparent',
                border: isCurrentTime ? `1px solid ${tokens.colors.secondary}40` : '1px solid transparent',
              }}
            >
              <Typography
                sx={{
                  fontSize: '0.8rem',
                  fontWeight: isCurrentTime ? 600 : 400,
                  color: isCurrentTime ? tokens.colors.secondary : tokens.colors.text.secondary,
                }}
              >
                {TIME_LABELS[time]}
              </Typography>
              <Chip
                size="small"
                label={`${travelersAtTime.length} travelers`}
                sx={{
                  height: 18,
                  fontSize: '0.65rem',
                  bgcolor: isCurrentTime ? tokens.colors.secondary : tokens.colors.text.disabled,
                  color: isCurrentTime ? '#000' : tokens.colors.text.primary,
                }}
              />
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
