/**
 * Graveyard - Run History Viewer
 *
 * Shows past runs with victory/death records, stats, and filtering
 *
 * NEVER DIE GUY
 */

import { useState, useMemo } from 'react';
import { Box, Typography, ToggleButtonGroup, ToggleButton, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { tokens } from '../../theme';
import { loadRunHistory, getRunHistoryStats, loadHeatData } from '../../data/player/storage';
import { RunHistoryCard } from './RunHistoryCard';
import { TokenIcon } from '../../components/TokenIcon';

type FilterOption = 'all' | 'victories' | 'deaths';
type SortOption = 'date' | 'score' | 'heat';

export function Graveyard() {
  const [filter, setFilter] = useState<FilterOption>('all');
  const [sort, setSort] = useState<SortOption>('date');

  // Load data
  const runHistory = useMemo(() => loadRunHistory(), []);
  const stats = useMemo(() => getRunHistoryStats(), []);
  const heatData = useMemo(() => loadHeatData(), []);

  // Filter and sort runs
  const displayedRuns = useMemo(() => {
    let filtered = [...runHistory];

    // Apply filter
    if (filter === 'victories') {
      filtered = filtered.filter((r) => r.won);
    } else if (filter === 'deaths') {
      filtered = filtered.filter((r) => !r.won);
    }

    // Apply sort
    switch (sort) {
      case 'score':
        filtered.sort((a, b) => b.totalScore - a.totalScore);
        break;
      case 'heat':
        filtered.sort((a, b) => (b.stats.heatAtDeath || 0) - (a.stats.heatAtDeath || 0));
        break;
      case 'date':
      default:
        filtered.sort((a, b) => b.timestamp - a.timestamp);
        break;
    }

    return filtered;
  }, [runHistory, filter, sort]);

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
          Graveyard
        </Typography>
        <Typography sx={{ fontSize: '0.9rem', color: tokens.colors.text.secondary }}>
          A record of your journeys through eternity
        </Typography>
      </Box>

      {/* Stats Summary */}
      <Box
        sx={{
          px: 3,
          py: 2,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: 2,
          borderBottom: `1px solid ${tokens.colors.border}`,
          flexShrink: 0,
        }}
      >
        {/* Total Runs */}
        <StatCard label="Total Runs" value={stats.totalRuns.toString()} />

        {/* Victories */}
        <StatCard
          label="Victories"
          value={stats.wins.toString()}
          valueColor={tokens.colors.success}
        />

        {/* Deaths */}
        <StatCard
          label="Deaths"
          value={stats.losses.toString()}
          valueColor={tokens.colors.primary}
        />

        {/* Best Streak */}
        <StatCard
          label="Best Streak"
          value={`Heat ${heatData.maxHeatEver}`}
          valueColor={heatData.maxHeatEver > 0 ? tokens.colors.primary : undefined}
        />

        {/* Best Score */}
        <StatCard
          label="Best Score"
          value={stats.bestScore.toLocaleString()}
          icon={<TokenIcon size={18} />}
        />

        {/* Current Heat */}
        {heatData.currentHeat > 0 && (
          <StatCard
            label="Current Streak"
            value={`Heat ${heatData.currentHeat}`}
            valueColor={tokens.colors.warning}
          />
        )}
      </Box>

      {/* Filters & Sort */}
      <Box
        sx={{
          px: 3,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          borderBottom: `1px solid ${tokens.colors.border}`,
          flexShrink: 0,
          flexWrap: 'wrap',
        }}
      >
        {/* Filter Toggle */}
        <ToggleButtonGroup
          value={filter}
          exclusive
          onChange={(_, value) => value && setFilter(value)}
          size="small"
          sx={{
            '& .MuiToggleButton-root': {
              px: 2,
              py: 0.5,
              fontFamily: tokens.fonts.gaming,
              fontSize: '0.8rem',
              textTransform: 'none',
              color: tokens.colors.text.secondary,
              borderColor: tokens.colors.border,
              '&.Mui-selected': {
                bgcolor: tokens.colors.background.elevated,
                color: tokens.colors.text.primary,
                '&:hover': {
                  bgcolor: tokens.colors.background.elevated,
                },
              },
            },
          }}
        >
          <ToggleButton value="all">All</ToggleButton>
          <ToggleButton value="victories">Victories</ToggleButton>
          <ToggleButton value="deaths">Deaths</ToggleButton>
        </ToggleButtonGroup>

        {/* Spacer */}
        <Box sx={{ flex: 1 }} />

        {/* Sort Dropdown */}
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel
            sx={{
              color: tokens.colors.text.secondary,
              '&.Mui-focused': { color: tokens.colors.text.primary },
            }}
          >
            Sort by
          </InputLabel>
          <Select
            value={sort}
            label="Sort by"
            onChange={(e) => setSort(e.target.value as SortOption)}
            sx={{
              fontFamily: tokens.fonts.gaming,
              fontSize: '0.85rem',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: tokens.colors.border,
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: tokens.colors.text.secondary,
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: tokens.colors.text.primary,
              },
            }}
          >
            <MenuItem value="date">Date</MenuItem>
            <MenuItem value="score">Score</MenuItem>
            <MenuItem value="heat">Heat</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Run List */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          px: 3,
          py: 2,
        }}
      >
        {displayedRuns.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: tokens.colors.text.disabled,
            }}
          >
            <Typography sx={{ fontFamily: tokens.fonts.gaming, fontSize: '1.2rem', mb: 1 }}>
              {filter === 'all' ? 'No runs yet' : `No ${filter} recorded`}
            </Typography>
            <Typography sx={{ fontSize: '0.9rem' }}>
              {filter === 'all'
                ? 'Start a new run to begin your journey'
                : 'Keep playing to fill this list'}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {displayedRuns.map((run) => (
              <RunHistoryCard key={run.id} run={run} />
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}

// Stat card sub-component
interface StatCardProps {
  label: string;
  value: string;
  valueColor?: string;
  icon?: React.ReactNode;
}

function StatCard({ label, value, valueColor, icon }: StatCardProps) {
  return (
    <Box
      sx={{
        p: 1.5,
        borderRadius: 2,
        border: `1px solid ${tokens.colors.border}`,
        bgcolor: tokens.colors.background.paper,
        textAlign: 'center',
      }}
    >
      <Typography
        sx={{
          fontSize: '0.7rem',
          color: tokens.colors.text.secondary,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          mb: 0.5,
        }}
      >
        {label}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
        {icon}
        <Typography
          sx={{
            fontFamily: tokens.fonts.gaming,
            fontSize: '1.25rem',
            color: valueColor || tokens.colors.text.primary,
            fontWeight: 700,
          }}
        >
          {value}
        </Typography>
      </Box>
    </Box>
  );
}
