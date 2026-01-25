/**
 * Character Profile - Player Stats & NPC Relationships
 *
 * Shows persistent stats (corruption, favor, heat) and current run stats
 *
 * NEVER DIE GUY
 */

import { useMemo } from 'react';
import { Box, Typography, Avatar, LinearProgress } from '@mui/material';
import { Whatshot as WhatshotIcon } from '@mui/icons-material';
import { tokens } from '../../theme';
import {
  loadCorruptionData,
  loadHeatData,
  getRunHistoryStats,
  loadFavorData,
} from '../../data/player/storage';
import { useRunOptional } from '../../contexts/RunContext';
import { useAuth } from '../../contexts/AuthContext';
import { TokenIcon } from '../../components/TokenIcon';

// Die-rector definitions (order by domain)
const DIE_RECTORS = [
  { slug: 'jane', name: 'Jane', domain: 1 },
  { slug: 'john', name: 'John', domain: 2 },
  { slug: 'peter', name: 'Peter', domain: 3 },
  { slug: 'robert', name: 'Robert', domain: 4 },
  { slug: 'alice', name: 'Alice', domain: 5 },
  { slug: 'the-one', name: 'The One', domain: 6 },
];

// Favor tier helper functions
function getFavorLevel(favor: number): string {
  if (favor >= 75) return 'Devoted';
  if (favor >= 50) return 'Allied';
  if (favor >= 25) return 'Friendly';
  if (favor <= -50) return 'Enemy';
  if (favor <= -25) return 'Hostile';
  return 'Neutral';
}

function getTierColor(favor: number): string {
  if (favor >= 75) return tokens.colors.success;      // Devoted - green
  if (favor >= 50) return '#4caf50';                   // Allied - light green
  if (favor >= 25) return '#8bc34a';                   // Friendly - lime
  if (favor <= -50) return tokens.colors.error;        // Enemy - red
  if (favor <= -25) return tokens.colors.warning;      // Hostile - orange
  return tokens.colors.text.secondary;                 // Neutral - gray
}

function getCorruptionColor(level: number): string {
  if (level >= 75) return tokens.colors.error;        // High corruption - red
  if (level >= 50) return tokens.colors.warning;      // Medium - orange
  if (level >= 25) return '#ffd700';                  // Low-medium - gold
  return tokens.colors.text.secondary;                // Safe - gray
}

// Stat Card sub-component
function StatCard({
  label,
  value,
  valueColor,
  icon,
}: {
  label: string;
  value: string;
  valueColor?: string;
  icon?: React.ReactNode;
}) {
  return (
    <Box>
      <Typography
        sx={{
          fontSize: '0.7rem',
          color: tokens.colors.text.secondary,
          textTransform: 'uppercase',
          mb: 0.5,
        }}
      >
        {label}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        {icon}
        <Typography
          sx={{
            fontFamily: tokens.fonts.gaming,
            fontSize: '1.3rem',
            fontWeight: 600,
            color: valueColor || tokens.colors.text.primary,
          }}
        >
          {value}
        </Typography>
      </Box>
    </Box>
  );
}

export function CharacterProfile() {
  const runContext = useRunOptional();
  const { playerNumber } = useAuth();

  // Load persistent data
  const corruptionData = useMemo(() => loadCorruptionData(), []);
  const heatData = useMemo(() => loadHeatData(), []);
  const favorData = useMemo(() => loadFavorData(), []);
  const lifetimeStats = useMemo(() => getRunHistoryStats(), []);

  // Extract state from run context if available
  const state = runContext?.state;

  // Check if we're in an active run (only if RunProvider is available)
  const isInRun = state
    ? (state.centerPanel === 'combat' || state.centerPanel === 'portals' || state.combatState !== null)
    : false;

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: tokens.colors.background.default,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 3,
          py: 2,
          borderBottom: `1px solid ${tokens.colors.border}`,
          flexShrink: 0,
        }}
      >
        <Typography
          sx={{
            fontFamily: tokens.fonts.gaming,
            fontSize: '1.75rem',
            color: tokens.colors.text.primary,
            mb: 0.5,
          }}
        >
          Profile
        </Typography>
        <Typography sx={{ fontSize: '0.9rem', color: tokens.colors.text.secondary }}>
          guy_{playerNumber} - Current status and relationships
        </Typography>
      </Box>

      {/* Two-Column Grid */}
      <Box
        sx={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '3fr 2fr' },
          gap: 3,
          p: 3,
          overflow: 'hidden',
        }}
      >
        {/* Left Column - Character Identity & Relationships */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, overflow: 'auto' }}>
          {/* Corruption Display */}
          <Box
            sx={{
              p: 2,
              border: `2px solid ${getCorruptionColor(corruptionData.level)}`,
              borderRadius: 2,
              bgcolor: tokens.colors.background.paper,
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography sx={{ fontFamily: tokens.fonts.gaming, fontSize: '1.1rem' }}>
                Corruption
              </Typography>
              <Typography
                sx={{
                  fontFamily: tokens.fonts.gaming,
                  fontSize: '1.5rem',
                  color: getCorruptionColor(corruptionData.level),
                }}
              >
                {corruptionData.level}%
              </Typography>
            </Box>

            <LinearProgress
              variant="determinate"
              value={corruptionData.level}
              sx={{
                height: 12,
                borderRadius: 2,
                bgcolor: tokens.colors.background.elevated,
                '& .MuiLinearProgress-bar': {
                  bgcolor: getCorruptionColor(corruptionData.level),
                  borderRadius: 2,
                },
              }}
            />

            {corruptionData.level >= 75 && (
              <Typography sx={{ fontSize: '0.75rem', color: tokens.colors.error, mt: 0.5 }}>
                Trinity encounters more likely
              </Typography>
            )}
          </Box>

          {/* Heat Streak Display */}
          <Box
            sx={{
              p: 2,
              border: `1px solid ${tokens.colors.border}`,
              borderRadius: 2,
              bgcolor: tokens.colors.background.paper,
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            {/* Current Heat */}
            <Box>
              <Typography sx={{ fontSize: '0.7rem', color: tokens.colors.text.secondary, mb: 0.5 }}>
                Current Streak
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <WhatshotIcon
                  sx={{
                    color: heatData.currentHeat > 0 ? tokens.colors.warning : tokens.colors.text.disabled,
                    fontSize: '1.2rem',
                  }}
                />
                <Typography
                  sx={{
                    fontFamily: tokens.fonts.gaming,
                    fontSize: '1.3rem',
                    color: heatData.currentHeat > 0 ? tokens.colors.warning : tokens.colors.text.disabled,
                  }}
                >
                  Heat {heatData.currentHeat}
                </Typography>
              </Box>
            </Box>

            {/* Best Streak */}
            <Box sx={{ textAlign: 'right' }}>
              <Typography sx={{ fontSize: '0.7rem', color: tokens.colors.text.secondary, mb: 0.5 }}>
                Best Streak
              </Typography>
              <Typography
                sx={{
                  fontFamily: tokens.fonts.gaming,
                  fontSize: '1.3rem',
                  color: tokens.colors.primary,
                }}
              >
                Heat {heatData.maxHeatEver}
              </Typography>
            </Box>
          </Box>

          {/* Die-Rector Favor Grid */}
          <Box>
            <Typography
              sx={{
                fontFamily: tokens.fonts.gaming,
                fontSize: '1.1rem',
                mb: 1.5,
                color: tokens.colors.text.primary,
              }}
            >
              Die-rector Relationships
            </Typography>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                gap: 1.5,
              }}
            >
              {DIE_RECTORS.map((director) => {
                const favor = favorData[director.slug] || 0;

                return (
                  <Box
                    key={director.slug}
                    sx={{
                      p: 1.5,
                      border: `1px solid ${tokens.colors.border}`,
                      borderRadius: 2,
                      bgcolor: tokens.colors.background.paper,
                    }}
                  >
                    {/* Portrait & Name */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Avatar
                        src={`/assets/characters/portraits/120px/pantheon-portrait-${director.slug.replace('-', '')}-01.svg`}
                        sx={{ width: 40, height: 40 }}
                      />
                      <Typography sx={{ fontFamily: tokens.fonts.gaming, fontSize: '0.9rem' }}>
                        {director.name}
                      </Typography>
                    </Box>

                    {/* Favor Bar (bidirectional from center) */}
                    <Box
                      sx={{
                        position: 'relative',
                        height: 8,
                        bgcolor: tokens.colors.background.elevated,
                        borderRadius: 1,
                      }}
                    >
                      <Box
                        sx={{
                          position: 'absolute',
                          left: favor >= 0 ? '50%' : `calc(50% - ${Math.abs(favor) / 2}%)`,
                          width: `${Math.abs(favor) / 2}%`,
                          height: '100%',
                          bgcolor: favor >= 0 ? tokens.colors.success : tokens.colors.error,
                          borderRadius: 1,
                        }}
                      />
                    </Box>

                    {/* Tier Label */}
                    <Typography
                      sx={{
                        fontSize: '0.7rem',
                        color: getTierColor(favor),
                        textAlign: 'center',
                        mt: 0.5,
                      }}
                    >
                      {getFavorLevel(favor).toUpperCase()}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Box>

        {/* Right Column - Stats */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, overflow: 'auto' }}>
          {/* Current Run Stats (only if in run) */}
          {isInRun && (
            <Box
              sx={{
                p: 2,
                border: `2px solid ${tokens.colors.primary}`,
                borderRadius: 2,
                bgcolor: tokens.colors.background.paper,
              }}
            >
              <Typography
                sx={{
                  fontFamily: tokens.fonts.gaming,
                  fontSize: '1.1rem',
                  mb: 2,
                  color: tokens.colors.primary,
                }}
              >
                Current Run
              </Typography>

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                {/* Gold */}
                <StatCard
                  label="Gold"
                  value={(state?.gold ?? 0).toLocaleString()}
                  valueColor={tokens.colors.warning}
                />

                {/* HP */}
                <StatCard
                  label="HP"
                  value={`${state?.hp ?? 0}/100`}
                  valueColor={(state?.hp ?? 100) < 30 ? tokens.colors.error : tokens.colors.success}
                />

                {/* Scars */}
                <StatCard
                  label="Scars"
                  value={`${state?.scars ?? 0}/4`}
                  valueColor={(state?.scars ?? 0) >= 3 ? tokens.colors.error : tokens.colors.text.primary}
                />

                {/* Domain */}
                <StatCard
                  label="Domain"
                  value={`D${state?.currentDomain || 1} R${state?.roomNumber || 1}`}
                />
              </Box>
            </Box>
          )}

          {/* Lifetime Stats */}
          <Box
            sx={{
              p: 2,
              border: `1px solid ${tokens.colors.border}`,
              borderRadius: 2,
              bgcolor: tokens.colors.background.paper,
            }}
          >
            <Typography
              sx={{
                fontFamily: tokens.fonts.gaming,
                fontSize: '1.1rem',
                mb: 2,
                color: tokens.colors.text.primary,
              }}
            >
              Lifetime Stats
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Total Runs */}
              <StatCard label="Total Runs" value={lifetimeStats.totalRuns.toString()} />

              {/* Victories */}
              <StatCard
                label="Victories"
                value={lifetimeStats.wins.toString()}
                valueColor={tokens.colors.success}
              />

              {/* Deaths */}
              <StatCard
                label="Deaths"
                value={lifetimeStats.losses.toString()}
                valueColor={tokens.colors.primary}
              />

              {/* Best Score */}
              <StatCard
                label="Best Score"
                value={lifetimeStats.bestScore.toLocaleString()}
                icon={<TokenIcon size={18} />}
              />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
