import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Chip,
  Divider,
  LinearProgress,
  Tabs,
  Tab,
} from '@mui/material';
import { useState } from 'react';
import {
  ArrowBackSharp as BackIcon,
  CasinoSharp as DiceIcon,
  LocalFireDepartmentSharp as FireIcon,
  StarSharp as StarIcon,
  AccessTimeSharp as TimeIcon,
  TrendingUpSharp as TrendingIcon,
  FavoriteSharp as HeartIcon,
  ShieldSharp as ShieldIcon,
  BoltSharp as BoltIcon,
  ShareSharp as ShareIcon,
  PlayArrowSharp as ReplayIcon,
} from '@mui/icons-material';
import { tokens } from '../../theme';

// Detailed stats mock data
interface DetailedStats {
  overview: {
    result: 'victory' | 'defeat';
    score: number;
    opponentScore: number;
    duration: string;
    domain: string;
    tier: number;
  };
  combat: {
    totalDamage: number;
    damageTaken: number;
    criticalHits: number;
    critRate: number;
    dodges: number;
    blocks: number;
  };
  dice: {
    totalRolls: number;
    avgRoll: number;
    nat20s: number;
    nat1s: number;
    bestRoll: { die: string; value: number };
    diceUsed: { type: string; rolls: number; avgValue: number }[];
  };
  progression: {
    xpGained: number;
    goldEarned: number;
    itemsFound: number;
    comboMax: number;
    longestStreak: number;
  };
  timeline: {
    timestamp: string;
    event: string;
    value?: number;
  }[];
}

const MOCK_STATS: DetailedStats = {
  overview: {
    result: 'victory',
    score: 12450,
    opponentScore: 9800,
    duration: '4:32',
    domain: 'Frost Caverns',
    tier: 3,
  },
  combat: {
    totalDamage: 4520,
    damageTaken: 2180,
    criticalHits: 8,
    critRate: 23,
    dodges: 5,
    blocks: 12,
  },
  dice: {
    totalRolls: 47,
    avgRoll: 12.4,
    nat20s: 3,
    nat1s: 2,
    bestRoll: { die: 'd20', value: 20 },
    diceUsed: [
      { type: 'd20', rolls: 15, avgValue: 11.2 },
      { type: 'd12', rolls: 8, avgValue: 7.8 },
      { type: 'd10', rolls: 10, avgValue: 5.9 },
      { type: 'd8', rolls: 7, avgValue: 4.5 },
      { type: 'd6', rolls: 5, avgValue: 3.8 },
      { type: 'd4', rolls: 2, avgValue: 2.5 },
    ],
  },
  progression: {
    xpGained: 250,
    goldEarned: 580,
    itemsFound: 3,
    comboMax: 5,
    longestStreak: 7,
  },
  timeline: [
    { timestamp: '0:00', event: 'Match Started' },
    { timestamp: '0:32', event: 'First Blood', value: 340 },
    { timestamp: '1:15', event: 'Critical Hit', value: 520 },
    { timestamp: '1:48', event: 'Nat 20 Roll' },
    { timestamp: '2:22', event: '5x Combo' },
    { timestamp: '3:05', event: 'Round 2 Won' },
    { timestamp: '4:32', event: 'Victory!' },
  ],
};

export function MatchStats() {
  const { threadId } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const stats = MOCK_STATS;
  const isVictory = stats.overview.result === 'victory';

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton onClick={() => navigate(-1)}>
          <BackIcon />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" sx={{ fontFamily: tokens.fonts.mono }}>
            Match Stats
          </Typography>
          <Typography variant="caption" sx={{ color: tokens.colors.text.secondary }}>
            Thread {threadId} | {stats.overview.domain}
          </Typography>
        </Box>
        <IconButton>
          <ShareIcon />
        </IconButton>
        {/* MVP: Replay hidden until backend ready */}
        {/* <IconButton onClick={() => navigate(`/play/replay/${threadId}`)}>
          <ReplayIcon />
        </IconButton> */}
      </Box>

      {/* Quick Summary */}
      <Paper
        sx={{
          p: 3,
          mb: 3,
          bgcolor: tokens.colors.background.paper,
          border: `1px solid ${isVictory ? tokens.colors.success : tokens.colors.error}50`,
          borderRadius: 2,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Chip
              label={isVictory ? 'VICTORY' : 'DEFEAT'}
              size="small"
              sx={{
                bgcolor: isVictory ? tokens.colors.success : tokens.colors.error,
                color: '#fff',
                fontWeight: 600,
                mb: 1,
              }}
            />
            <Typography sx={{ fontFamily: tokens.fonts.gaming, fontSize: '2rem' }}>
              {stats.overview.score.toLocaleString()}
            </Typography>
            <Typography variant="caption" sx={{ color: tokens.colors.text.secondary }}>
              vs {stats.overview.opponentScore.toLocaleString()}
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'flex-end', mb: 1 }}>
              <TimeIcon sx={{ fontSize: 16, color: tokens.colors.text.secondary }} />
              <Typography variant="body2">{stats.overview.duration}</Typography>
            </Box>
            <Chip
              label={`Tier ${stats.overview.tier}`}
              size="small"
              sx={{ bgcolor: `${tokens.colors.secondary}20`, color: tokens.colors.secondary }}
            />
          </Box>
        </Box>
      </Paper>

      {/* Tabs */}
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{ mb: 3, borderBottom: `1px solid ${tokens.colors.border}` }}
      >
        <Tab label="Combat" />
        <Tab label="Dice" />
        <Tab label="Progression" />
        <Tab label="Timeline" />
      </Tabs>

      {/* Combat Tab */}
      {tab === 0 && (
        <Paper
          sx={{
            p: 3,
            bgcolor: tokens.colors.background.paper,
            border: `1px solid ${tokens.colors.border}`,
            borderRadius: 2,
          }}
        >
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
            <StatBlock
              icon={<BoltIcon />}
              label="Total Damage"
              value={stats.combat.totalDamage.toLocaleString()}
              color={tokens.colors.error}
            />
            <StatBlock
              icon={<HeartIcon />}
              label="Damage Taken"
              value={stats.combat.damageTaken.toLocaleString()}
              color={tokens.colors.warning}
            />
            <StatBlock
              icon={<StarIcon />}
              label="Critical Hits"
              value={stats.combat.criticalHits}
              subValue={`${stats.combat.critRate}% crit rate`}
              color={tokens.colors.warning}
            />
            <StatBlock
              icon={<ShieldIcon />}
              label="Blocks/Dodges"
              value={`${stats.combat.blocks}/${stats.combat.dodges}`}
              color={tokens.colors.secondary}
            />
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Damage ratio bar */}
          <Typography variant="caption" sx={{ color: tokens.colors.text.secondary, mb: 1, display: 'block' }}>
            DAMAGE RATIO
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: tokens.colors.success }}>
              {Math.round((stats.combat.totalDamage / (stats.combat.totalDamage + stats.combat.damageTaken)) * 100)}%
            </Typography>
            <Box sx={{ flex: 1, height: 8, borderRadius: 4, overflow: 'hidden', display: 'flex' }}>
              <Box
                sx={{
                  width: `${(stats.combat.totalDamage / (stats.combat.totalDamage + stats.combat.damageTaken)) * 100}%`,
                  bgcolor: tokens.colors.success,
                }}
              />
              <Box sx={{ flex: 1, bgcolor: tokens.colors.error }} />
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 600, color: tokens.colors.error }}>
              {Math.round((stats.combat.damageTaken / (stats.combat.totalDamage + stats.combat.damageTaken)) * 100)}%
            </Typography>
          </Box>
        </Paper>
      )}

      {/* Dice Tab */}
      {tab === 1 && (
        <Paper
          sx={{
            p: 3,
            bgcolor: tokens.colors.background.paper,
            border: `1px solid ${tokens.colors.border}`,
            borderRadius: 2,
          }}
        >
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 3, mb: 3 }}>
            <StatBlock
              icon={<DiceIcon />}
              label="Total Rolls"
              value={stats.dice.totalRolls}
              color={tokens.colors.primary}
            />
            <StatBlock
              icon={<TrendingIcon />}
              label="Avg Roll"
              value={stats.dice.avgRoll.toFixed(1)}
              color={tokens.colors.secondary}
            />
            <StatBlock
              icon={<StarIcon />}
              label="Best Roll"
              value={`${stats.dice.bestRoll.die}: ${stats.dice.bestRoll.value}`}
              color={tokens.colors.warning}
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <Chip
              icon={<StarIcon sx={{ color: `${tokens.colors.success} !important` }} />}
              label={`${stats.dice.nat20s} Nat 20s`}
              sx={{ bgcolor: `${tokens.colors.success}20`, color: tokens.colors.success }}
            />
            <Chip
              icon={<DiceIcon sx={{ color: `${tokens.colors.error} !important` }} />}
              label={`${stats.dice.nat1s} Nat 1s`}
              sx={{ bgcolor: `${tokens.colors.error}20`, color: tokens.colors.error }}
            />
          </Box>

          <Divider sx={{ my: 2 }} />

          <Typography variant="caption" sx={{ color: tokens.colors.text.secondary, mb: 2, display: 'block' }}>
            DICE BREAKDOWN
          </Typography>
          {stats.dice.diceUsed.map((die) => (
            <Box key={die.type} sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{die.type}</Typography>
                <Typography variant="caption" sx={{ color: tokens.colors.text.secondary }}>
                  {die.rolls} rolls | avg {die.avgValue.toFixed(1)}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={(die.rolls / stats.dice.totalRolls) * 100}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  bgcolor: tokens.colors.background.elevated,
                  '& .MuiLinearProgress-bar': { bgcolor: tokens.colors.primary },
                }}
              />
            </Box>
          ))}
        </Paper>
      )}

      {/* Progression Tab */}
      {tab === 2 && (
        <Paper
          sx={{
            p: 3,
            bgcolor: tokens.colors.background.paper,
            border: `1px solid ${tokens.colors.border}`,
            borderRadius: 2,
          }}
        >
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
            <StatBlock
              icon={<StarIcon />}
              label="XP Gained"
              value={`+${stats.progression.xpGained}`}
              color={tokens.colors.secondary}
            />
            <StatBlock
              icon={<DiceIcon />}
              label="Gold Earned"
              value={stats.progression.goldEarned}
              color="#c4a000"
            />
            <StatBlock
              icon={<FireIcon />}
              label="Max Combo"
              value={`${stats.progression.comboMax}x`}
              color={tokens.colors.warning}
            />
            <StatBlock
              icon={<TrendingIcon />}
              label="Longest Streak"
              value={stats.progression.longestStreak}
              color={tokens.colors.success}
            />
          </Box>
        </Paper>
      )}

      {/* Timeline Tab */}
      {tab === 3 && (
        <Paper
          sx={{
            p: 3,
            bgcolor: tokens.colors.background.paper,
            border: `1px solid ${tokens.colors.border}`,
            borderRadius: 2,
          }}
        >
          {stats.timeline.map((event, i) => (
            <Box
              key={i}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                py: 1.5,
                borderBottom: i < stats.timeline.length - 1 ? `1px solid ${tokens.colors.border}` : 'none',
              }}
            >
              <Typography
                sx={{
                  fontFamily: tokens.fonts.mono,
                  fontSize: '0.8rem',
                  color: tokens.colors.text.secondary,
                  minWidth: 50,
                }}
              >
                {event.timestamp}
              </Typography>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: i === stats.timeline.length - 1 ? tokens.colors.success : tokens.colors.primary,
                }}
              />
              <Typography variant="body2" sx={{ flex: 1 }}>
                {event.event}
              </Typography>
              {event.value && (
                <Typography sx={{ fontFamily: tokens.fonts.mono, color: tokens.colors.warning }}>
                  +{event.value}
                </Typography>
              )}
            </Box>
          ))}
        </Paper>
      )}
    </Box>
  );
}

function StatBlock({
  icon,
  label,
  value,
  subValue,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subValue?: string;
  color: string;
}) {
  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        bgcolor: `${color}10`,
        border: `1px solid ${color}30`,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, color }}>
        {icon}
        <Typography variant="caption" sx={{ fontWeight: 600, color: tokens.colors.text.secondary }}>
          {label}
        </Typography>
      </Box>
      <Typography sx={{ fontFamily: tokens.fonts.gaming, fontSize: '1.5rem' }}>
        {value}
      </Typography>
      {subValue && (
        <Typography variant="caption" sx={{ color: tokens.colors.text.secondary }}>
          {subValue}
        </Typography>
      )}
    </Box>
  );
}
