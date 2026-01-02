/**
 * Stats - Player statistics widget
 *
 * Shows games/deaths summary and expandable sections for:
 * - 1v1 Rating (with interactive chart)
 * - Arena stats
 * - Active Favors (buffs/debuffs)
 */

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Paper, Typography, Slider } from '@mui/material';
import { tokens } from '../../../theme';
import { CardHeader, ExpandableSection, AssetImage } from '../../../components/ds';
import { loadPlayerData } from '../../../data/player/storage';

// Placeholder rating history - will be tracked per-session in future
const RATING_HISTORY = [
  { rating: 1200, date: 'Jan', games: 5, result: '+15' },
  { rating: 1250, date: 'Feb', games: 8, result: '+50' },
  { rating: 1180, date: 'Mar', games: 6, result: '-70' },
  { rating: 1300, date: 'Apr', games: 10, result: '+120' },
  { rating: 1280, date: 'May', games: 4, result: '-20' },
  { rating: 1350, date: 'Jun', games: 7, result: '+70' },
  { rating: 1320, date: 'Jul', games: 3, result: '-30' },
  { rating: 1400, date: 'Aug', games: 9, result: '+80' },
  { rating: 1380, date: 'Sep', games: 5, result: '-20' },
  { rating: 1369, date: 'Now', games: 3, result: '-11' },
];

// Favor system will be tied to Die-rectors in future
const MOCK_FAVORS = {
  buffs: [] as { name: string; effect: string; timeLeft: string }[],
  debuffs: [] as { name: string; effect: string; timeLeft: string }[],
};

export function Stats() {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(RATING_HISTORY.length - 1);

  // Load real player stats
  const playerStats = useMemo(() => {
    const data = loadPlayerData();
    return {
      runsCompleted: data.stats.runsCompleted,
      runsWon: data.stats.runsWon,
      deaths: data.stats.runsCompleted - data.stats.runsWon,
      winRate: data.stats.runsCompleted > 0
        ? Math.round((data.stats.runsWon / data.stats.runsCompleted) * 100)
        : 0,
      totalGold: data.stats.totalGoldEarned,
    };
  }, []);

  const handleToggle = (panel: string) => {
    setExpanded(expanded === panel ? null : panel);
  };

  // Chart calculations
  const chartHeight = 80;
  const minRating = 1100;
  const maxRating = 1500;
  const getY = (rating: number) => chartHeight - ((rating - minRating) / (maxRating - minRating)) * chartHeight;
  const getX = (index: number) => (index / (RATING_HISTORY.length - 1)) * 100;

  return (
    <Paper sx={{ bgcolor: tokens.colors.background.paper, borderRadius: '30px', overflow: 'hidden', border: `1px solid ${tokens.colors.border}` }}>
      <CardHeader title="Stats" action="external" actionTooltip="View all stats" onActionClick={() => navigate('/progress/stats')} />

      {/* Games & Deaths summary */}
      <Box sx={{ px: 2, py: 1.5, bgcolor: tokens.colors.background.default }}>
        <StatRow icon="/illustrations/newgame.svg" label="Games" value={playerStats.runsCompleted.toLocaleString()} />
        <StatRow icon="/illustrations/deaths.svg" label="Deaths" value={playerStats.deaths.toLocaleString()} noBorder />
      </Box>

      {/* 1v1 - Expandable with rating chart */}
      <ExpandableSection
        id="1v1"
        icon="/illustrations/1v1.svg"
        title="1v1"
        value={1000}
        expanded={expanded === '1v1'}
        onToggle={handleToggle}
      >
        <RatingChart
          data={RATING_HISTORY}
          selectedIndex={selectedIndex}
          onSelectIndex={setSelectedIndex}
          chartHeight={chartHeight}
          getX={getX}
          getY={getY}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
          <Typography sx={{ fontSize: '0.85rem', color: tokens.colors.text.secondary }}>Highest</Typography>
          <Typography sx={{ fontSize: '0.85rem' }}>
            <Typography component="span" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>1400</Typography>
            <Typography component="span" sx={{ color: tokens.colors.text.disabled, fontSize: '0.85rem' }}> (Aug 2021)</Typography>
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
          <Typography sx={{ fontSize: '0.85rem', color: tokens.colors.text.secondary }}>Games this month</Typography>
          <Typography sx={{ fontSize: '0.85rem', fontWeight: 600 }}>{RATING_HISTORY[selectedIndex].games}</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
          <Typography sx={{ fontSize: '0.85rem', color: tokens.colors.text.secondary }}>Total Games</Typography>
          <Typography sx={{ fontSize: '0.85rem', fontWeight: 600 }}>60</Typography>
        </Box>
        <Typography sx={{ fontSize: '0.85rem', color: tokens.colors.text.secondary, textAlign: 'right', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>
          View Full Stats
        </Typography>
      </ExpandableSection>

      {/* Arena - Expandable */}
      <ExpandableSection
        id="arena"
        icon="/illustrations/arenas.svg"
        title="Arena"
        value={playerStats.runsWon}
        expanded={expanded === 'arena'}
        onToggle={handleToggle}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
          <Typography sx={{ fontSize: '0.85rem', color: tokens.colors.text.secondary }}>Wins</Typography>
          <Typography sx={{ fontSize: '0.85rem', fontWeight: 600 }}>{playerStats.runsWon}</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
          <Typography sx={{ fontSize: '0.85rem', color: tokens.colors.text.secondary }}>Win Rate</Typography>
          <Typography sx={{ fontSize: '0.85rem', fontWeight: 600 }}>{playerStats.winRate}%</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography sx={{ fontSize: '0.85rem', color: tokens.colors.text.secondary }}>Total Runs</Typography>
          <Typography sx={{ fontSize: '0.85rem', fontWeight: 600 }}>{playerStats.runsCompleted}</Typography>
        </Box>
      </ExpandableSection>

      {/* Favors - Expandable (hidden if no active favors) */}
      {(MOCK_FAVORS.buffs.length > 0 || MOCK_FAVORS.debuffs.length > 0) && (
        <ExpandableSection
          id="favors"
          icon="/illustrations/weaknesses.svg"
          title="Favors"
          value={MOCK_FAVORS.buffs.length + MOCK_FAVORS.debuffs.length}
          expanded={expanded === 'favors'}
          onToggle={handleToggle}
        >
          <Typography sx={{ fontSize: '0.75rem', color: tokens.colors.text.secondary, mb: 1.5 }}>
            Active buffs & debuffs from Die-rectors
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {MOCK_FAVORS.buffs.map((buff, i) => (
              <FavorItem key={i} {...buff} variant="buff" />
            ))}
            {MOCK_FAVORS.debuffs.map((debuff, i) => (
              <FavorItem key={i} {...debuff} variant="debuff" />
            ))}
          </Box>
          <Typography sx={{ fontSize: '0.85rem', color: tokens.colors.text.secondary, textAlign: 'right', cursor: 'pointer', mt: 1.5, '&:hover': { textDecoration: 'underline' } }}>
            View All Favors
          </Typography>
        </ExpandableSection>
      )}

      {/* Compare to Me */}
      <Box
        sx={{
          py: 1.5,
          borderTop: `1px solid ${tokens.colors.border}`,
          textAlign: 'center',
        }}
      >
        <Typography
          component="button"
          onClick={() => navigate('/leaderboard')}
          sx={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.75rem',
            color: tokens.colors.text.disabled,
            '&:hover': { color: tokens.colors.text.secondary },
          }}
        >
          Compare to Me
        </Typography>
      </Box>
    </Paper>
  );
}

/** Simple stat row for Games/Deaths summary */
function StatRow({ icon, label, value, noBorder }: { icon: string; label: string; value: string; noBorder?: boolean }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: noBorder ? 0 : 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <AssetImage src={icon} alt="" width={20} height={20} fallback="hide" />
        <Typography sx={{ fontSize: '0.85rem', fontWeight: 600 }}>{label}</Typography>
      </Box>
      <Typography sx={{ fontSize: '0.85rem', fontWeight: 600 }}>{value}</Typography>
    </Box>
  );
}

/** Interactive rating chart with draggable point */
function RatingChart({
  data,
  selectedIndex,
  onSelectIndex,
  chartHeight,
  getX,
  getY,
}: {
  data: typeof RATING_HISTORY;
  selectedIndex: number;
  onSelectIndex: (index: number) => void;
  chartHeight: number;
  getX: (index: number) => number;
  getY: (rating: number) => number;
}) {
  const selected = data[selectedIndex];

  const handleChartClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const newIndex = Math.round(x * (data.length - 1));
    onSelectIndex(Math.max(0, Math.min(data.length - 1, newIndex)));
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    if (e.clientX === 0) return;
    const parent = (e.target as HTMLElement).parentElement;
    if (!parent) return;
    const rect = parent.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const newIndex = Math.round(x * (data.length - 1));
    onSelectIndex(Math.max(0, Math.min(data.length - 1, newIndex)));
  };

  return (
    <Box sx={{ position: 'relative', mb: 2, mt: 1 }}>
      {/* Selected point info */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography sx={{ fontSize: '0.75rem', color: tokens.colors.text.secondary }}>
          {selected.date}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography sx={{ fontSize: '1.25rem', fontWeight: 700 }}>
            {selected.rating}
          </Typography>
          <Typography sx={{
            fontSize: '0.75rem',
            fontWeight: 600,
            color: selected.result.startsWith('+') ? tokens.colors.success : tokens.colors.primary,
          }}>
            {selected.result}
          </Typography>
        </Box>
      </Box>

      {/* Line chart */}
      <Box
        sx={{
          height: chartHeight,
          position: 'relative',
          bgcolor: tokens.colors.background.elevated,
          borderRadius: 1,
          overflow: 'visible',
          cursor: 'pointer',
        }}
        onClick={handleChartClick}
      >
        <svg width="100%" height="100%" viewBox={`0 0 100 ${chartHeight}`} preserveAspectRatio="none" style={{ position: 'absolute', top: 0, left: 0, overflow: 'visible' }}>
          <defs>
            <linearGradient id="chartGradient1v1" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={tokens.colors.text.disabled} stopOpacity="0.3" />
              <stop offset="100%" stopColor={tokens.colors.text.disabled} stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* Area fill */}
          <path
            d={`M0,${getY(data[0].rating)} ${data.map((v, i) => `L${getX(i)},${getY(v.rating)}`).join(' ')} L100,${chartHeight} L0,${chartHeight} Z`}
            fill="url(#chartGradient1v1)"
          />
          {/* Line */}
          <path
            d={`M0,${getY(data[0].rating)} ${data.map((v, i) => `L${getX(i)},${getY(v.rating)}`).join(' ')}`}
            fill="none"
            stroke={tokens.colors.text.disabled}
            strokeWidth="1"
          />
          {/* Data points */}
          {data.map((v, i) => (
            <circle
              key={i}
              cx={getX(i)}
              cy={getY(v.rating)}
              r={i === selectedIndex ? 0 : 2}
              fill={tokens.colors.text.disabled}
              style={{ cursor: 'pointer' }}
              onClick={(e) => { e.stopPropagation(); onSelectIndex(i); }}
            />
          ))}
        </svg>

        {/* Selected point indicator */}
        <Box
          sx={{
            position: 'absolute',
            left: `${getX(selectedIndex)}%`,
            top: `${(getY(selected.rating) / chartHeight) * 100}%`,
            transform: 'translate(-50%, -50%)',
            width: 16,
            height: 16,
            borderRadius: '50%',
            bgcolor: tokens.colors.text.primary,
            border: `3px solid ${tokens.colors.background.paper}`,
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            cursor: 'grab',
            zIndex: 10,
            '&:active': { cursor: 'grabbing' },
          }}
          draggable
          onDrag={handleDrag}
        />

        {/* Vertical line */}
        <Box
          sx={{
            position: 'absolute',
            left: `${getX(selectedIndex)}%`,
            top: `${(getY(selected.rating) / chartHeight) * 100}%`,
            width: 1,
            height: `${100 - (getY(selected.rating) / chartHeight) * 100}%`,
            bgcolor: `${tokens.colors.text.primary}40`,
          }}
        />
      </Box>

      {/* Timeline slider */}
      <Box sx={{ mt: 1, px: 0.5 }}>
        <Slider
          value={selectedIndex}
          min={0}
          max={data.length - 1}
          step={1}
          onChange={(_, value) => onSelectIndex(value as number)}
          sx={{
            '& .MuiSlider-thumb': { width: 12, height: 12, bgcolor: tokens.colors.text.primary },
            '& .MuiSlider-track': { bgcolor: tokens.colors.text.disabled, height: 2 },
            '& .MuiSlider-rail': { bgcolor: tokens.colors.background.elevated, height: 2 },
          }}
        />
      </Box>
    </Box>
  );
}

/** Individual buff/debuff item */
function FavorItem({
  name,
  effect,
  timeLeft,
  variant,
}: {
  name: string;
  effect: string;
  timeLeft: string;
  variant: 'buff' | 'debuff';
}) {
  const color = variant === 'buff' ? tokens.colors.success : tokens.colors.primary;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1, borderRadius: 1, bgcolor: `${color}15` }}>
      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color }} />
      <Box sx={{ flex: 1 }}>
        <Typography sx={{ fontSize: '0.85rem', fontWeight: 600 }}>{name}</Typography>
        <Typography sx={{ fontSize: '0.7rem', color: tokens.colors.text.secondary }}>{effect}</Typography>
      </Box>
      <Typography sx={{ fontSize: '0.7rem', color: tokens.colors.text.disabled }}>{timeLeft}</Typography>
    </Box>
  );
}
