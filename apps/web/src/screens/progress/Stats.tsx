/**
 * Stats - Detailed game statistics and performance metrics
 */

import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  Breadcrumbs,
  Link as MuiLink,
} from '@mui/material';
import {
  NavigateNextSharp as NextIcon,
  TrendingUpSharp as TrendUpIcon,
  TrendingDownSharp as TrendDownIcon,
  RemoveSharp as TrendFlatIcon,
  EmojiEventsSharp as TrophyIcon,
  CasinoSharp as DiceIcon,
  TimerSharp as TimerIcon,
  InventorySharp as InventoryIcon,
  WhatshotSharp as StreakIcon,
  StarSharp as StarIcon,
} from '@mui/icons-material';
import { tokens } from '../../theme';
import { CardSection } from '../../components/CardSection';
import { CardHeader } from '../../components/ds';

// ============================================
// Data
// ============================================

const successMetrics = [
  { label: 'Win Rate', value: '64%', trend: 'up', change: '+3%' },
  { label: 'Avg Score', value: '12,450', trend: 'up', change: '+820' },
  { label: 'Best Combo', value: '24x', trend: 'flat', change: '-' },
  { label: 'Perfect Runs', value: '7', trend: 'up', change: '+2' },
];

const sessionStats = [
  { icon: TimerIcon, label: 'Avg Run Duration', value: '18m 32s', color: tokens.colors.secondary },
  { icon: InventoryIcon, label: 'Items Per Run', value: '14.2', color: tokens.colors.success },
  { icon: DiceIcon, label: 'Throws Per Run', value: '47.8', color: tokens.colors.primary },
  { icon: StreakIcon, label: 'Avg Heat Level', value: '3.2', color: tokens.colors.warning },
];

const weeklyComparison = [
  { metric: 'Runs Completed', thisWeek: 23, lastWeek: 18, diff: '+5' },
  { metric: 'Enemies Defeated', thisWeek: 1247, lastWeek: 1089, diff: '+158' },
  { metric: 'Items Collected', thisWeek: 342, lastWeek: 298, diff: '+44' },
  { metric: 'Deaths', thisWeek: 19, lastWeek: 16, diff: '+3' },
  { metric: 'Gold Earned', thisWeek: 8420, lastWeek: 7150, diff: '+1,270' },
];

const bestRuns = [
  { domain: 'Shadow Realm', score: 24850, date: 'Dec 28', combo: '24x' },
  { domain: 'Inferno', score: 22100, date: 'Dec 27', combo: '18x' },
  { domain: 'Frozen Wastes', score: 19750, date: 'Dec 25', combo: '16x' },
];

const recentPerformance = [
  { date: 'Today', runs: 4, wins: 3, avgScore: 14200 },
  { date: 'Yesterday', runs: 6, wins: 4, avgScore: 12800 },
  { date: 'Dec 29', runs: 5, wins: 3, avgScore: 11500 },
  { date: 'Dec 28', runs: 7, wins: 5, avgScore: 13400 },
  { date: 'Dec 27', runs: 4, wins: 2, avgScore: 10200 },
];

// ============================================
// Component
// ============================================

export function Stats() {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendUpIcon sx={{ fontSize: 16, color: tokens.colors.success }} />;
      case 'down': return <TrendDownIcon sx={{ fontSize: 16, color: tokens.colors.error }} />;
      default: return <TrendFlatIcon sx={{ fontSize: 16, color: tokens.colors.text.secondary }} />;
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 900, mx: 'auto' }}>
      {/* Breadcrumbs */}
      <Breadcrumbs
        separator={<NextIcon fontSize="small" sx={{ color: tokens.colors.text.disabled }} />}
        sx={{ mb: 3 }}
      >
        <MuiLink
          component={RouterLink}
          to="/"
          sx={{ color: tokens.colors.secondary, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
        >
          Home
        </MuiLink>
        <MuiLink
          component={RouterLink}
          to="/progress"
          sx={{ color: tokens.colors.secondary, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
        >
          Progress
        </MuiLink>
        <Typography color="text.primary" sx={{ fontSize: '0.875rem' }}>
          Stats
        </Typography>
      </Breadcrumbs>

      {/* Header */}
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 4 }}>
        Game Statistics
      </Typography>

      {/* Success Metrics */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
        {successMetrics.map((metric) => (
          <CardSection key={metric.label} sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="caption" sx={{ color: tokens.colors.text.secondary, display: 'block', mb: 0.5 }}>
              {metric.label}
            </Typography>
            <Typography sx={{ fontFamily: tokens.fonts.gaming, fontSize: '1.75rem', mb: 0.5 }}>
              {metric.value}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
              {getTrendIcon(metric.trend)}
              <Typography variant="caption" sx={{
                color: metric.trend === 'up' ? tokens.colors.success :
                       metric.trend === 'down' ? tokens.colors.error :
                       tokens.colors.text.secondary
              }}>
                {metric.change}
              </Typography>
            </Box>
          </CardSection>
        ))}
      </Box>

      {/* Session Stats */}
      <CardSection padding={0} sx={{ mb: 3 }}>
        <CardHeader title="Session Averages" />
        <Box sx={{ p: 3, display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' }, gap: 2 }}>
          {sessionStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Box key={stat.label} sx={{ textAlign: 'center' }}>
                <Icon sx={{ fontSize: 28, color: stat.color, mb: 1 }} />
                <Typography sx={{ fontFamily: tokens.fonts.gaming, fontSize: '1.25rem', mb: 0.5 }}>
                  {stat.value}
                </Typography>
                <Typography variant="caption" sx={{ color: tokens.colors.text.secondary }}>
                  {stat.label}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </CardSection>

      {/* Weekly Comparison */}
      <CardSection padding={0} sx={{ mb: 3 }}>
        <CardHeader title="This Week vs Last Week" />
        <Box sx={{ p: 3 }}>
          {weeklyComparison.map((item, i) => (
            <Box
              key={item.metric}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                py: 1.5,
                borderBottom: i < weeklyComparison.length - 1 ? `1px solid ${tokens.colors.border}` : 'none',
              }}
            >
              <Typography variant="body2" sx={{ flex: 1 }}>
                {item.metric}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Typography variant="body2" sx={{ color: tokens.colors.text.secondary, width: 60, textAlign: 'right' }}>
                  {item.lastWeek.toLocaleString()}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, width: 60, textAlign: 'right' }}>
                  {item.thisWeek.toLocaleString()}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    color: item.diff.startsWith('+') ? tokens.colors.success : tokens.colors.error,
                    width: 60,
                    textAlign: 'right',
                  }}
                >
                  {item.diff}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </CardSection>

      {/* Best Runs */}
      <CardSection padding={0} sx={{ mb: 3 }}>
        <CardHeader title="Best Runs" action={<TrophyIcon sx={{ fontSize: 20, color: tokens.colors.rarity.legendary }} />} />
        <Box sx={{ p: 3 }}>
          {bestRuns.map((run, i) => (
            <Box
              key={run.domain}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                py: 1.5,
                borderBottom: i < bestRuns.length - 1 ? `1px solid ${tokens.colors.border}` : 'none',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    bgcolor: i === 0 ? tokens.colors.rarity.legendary :
                             i === 1 ? tokens.colors.text.secondary :
                             tokens.colors.rarity.uncommon,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                  }}
                >
                  {i + 1}
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {run.domain}
                  </Typography>
                  <Typography variant="caption" sx={{ color: tokens.colors.text.disabled }}>
                    {run.date}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: tokens.colors.secondary }}>
                  {run.score.toLocaleString()}
                </Typography>
                <Typography variant="caption" sx={{ color: tokens.colors.primary }}>
                  {run.combo} combo
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </CardSection>

      {/* Recent Performance */}
      <CardSection padding={0}>
        <CardHeader title="Recent Performance" />
        <Box sx={{ p: 3 }}>
          {recentPerformance.map((day, i) => (
            <Box
              key={day.date}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                py: 1.5,
                borderBottom: i < recentPerformance.length - 1 ? `1px solid ${tokens.colors.border}` : 'none',
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 500, width: 80 }}>
                {day.date}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{day.runs}</Typography>
                  <Typography variant="caption" sx={{ color: tokens.colors.text.disabled }}>runs</Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: tokens.colors.success }}>{day.wins}</Typography>
                  <Typography variant="caption" sx={{ color: tokens.colors.text.disabled }}>wins</Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: tokens.colors.secondary }}>{day.avgScore.toLocaleString()}</Typography>
                  <Typography variant="caption" sx={{ color: tokens.colors.text.disabled }}>avg</Typography>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      </CardSection>
    </Box>
  );
}
