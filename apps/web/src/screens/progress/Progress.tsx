import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  useMediaQuery,
  Tooltip,
  LinearProgress,
} from '@mui/material';
import {
  CheckCircleSharp as CheckIcon,
  LockSharp as LockIcon,
} from '@mui/icons-material';
import { tokens } from '../../theme';
import { CardSection } from '../../components/CardSection';
import { CardHeader, AssetImage } from '../../components/ds';
import { GuestBlockModal } from '../../components';
import { useAuth } from '../../contexts/AuthContext';


// ============ STREAKS DATA ============
const currentStreak = 42;
const bestStreak = 67;
const totalDays = 156;

// Adaptive calendar: show more days for longer streaks (Wordle-style)
const generateAdaptiveCalendar = () => {
  const today = new Date();

  // Determine how many days to show based on streak
  let daysToShow: number;
  if (currentStreak < 7) {
    daysToShow = 7; // Single week row
  } else if (currentStreak < 14) {
    daysToShow = 14; // Two weeks
  } else if (currentStreak < 28) {
    daysToShow = 21; // Three weeks
  } else {
    daysToShow = 28; // Four weeks max
  }

  // Generate array of dates going backwards from today
  const days: { date: Date; isActive: boolean; isToday: boolean }[] = [];
  for (let i = daysToShow - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dayIndex = daysToShow - 1 - i; // 0 = oldest, daysToShow-1 = today
    const isActive = dayIndex >= daysToShow - currentStreak;
    days.push({
      date,
      isActive,
      isToday: i === 0,
    });
  }

  return { days, daysToShow };
};

const { days: calendarDays, daysToShow } = generateAdaptiveCalendar();

// Heat intensity based on how recent (for gradient effect)
const getHeatIntensity = (index: number, total: number): number => {
  // More recent = more intense
  return 0.4 + (index / total) * 0.6;
};

const milestones = [
  { days: 7, label: '7-Day Streak', reward: 'Bronze Badge', completed: true },
  { days: 30, label: '30-Day Streak', reward: 'Silver Badge', completed: true },
  { days: 100, label: '100-Day Streak', reward: 'Gold Badge', completed: false, remaining: 58 },
  { days: 365, label: '365-Day Streak', reward: 'Legendary Badge', completed: false, remaining: 323 },
];

// ============ METAPROGRESSION DATA ============
const metaStats = [
  { label: 'Total Runs', value: '247', color: tokens.colors.primary },
  { label: 'Best Run', value: 'Floor 12', color: tokens.colors.secondary },
  { label: 'Deaths', value: '205', color: tokens.colors.text.secondary },
  { label: 'Items Found', value: '1,847', color: tokens.colors.success },
];

// ============ MAIN PROGRESS PAGE ============
export function Progress() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Responsive padding (match Home.tsx)
  const is1440 = useMediaQuery('(min-width: 1440px)');
  const is1280 = useMediaQuery('(min-width: 1280px)');
  const is1024 = useMediaQuery('(min-width: 1024px)');
  const padding = is1440 ? '60px' : is1280 ? '30px' : is1024 ? '24px' : '18px';

  // Block guests from accessing progress
  if (!isAuthenticated) {
    return (
      <GuestBlockModal
        title="Track Your Progress"
        description="Create an account or sign in to track streaks, achievements, and lifetime stats."
        iconSrc="/assets/nav/nav3-progress.svg"
      />
    );
  }

  return (
    <Box sx={{ p: padding }}>
      {/* Header */}
      <Typography
        variant="h1"
        sx={{
          fontFamily: tokens.fonts.gaming,
          fontSize: '3.5rem',
          textAlign: 'center',
          mb: 4,
        }}
      >
        Progress
      </Typography>

      {/* Navigation Cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
          gap: 1.5,
          mb: 4,
        }}
      >
        {/* Leaderboard Card */}
        <Paper
          elevation={0}
          onClick={() => navigate('/leaderboard')}
          sx={{
            bgcolor: tokens.colors.background.paper,
            borderRadius: '30px',
            py: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1,
            cursor: 'pointer',
            boxShadow: '0px 3px 1px 0px rgba(0,0,0,0.5)',
            '&:hover': { bgcolor: tokens.colors.background.elevated },
          }}
        >
          <AssetImage
            src="/illustrations/leaderboard.svg"
            alt="Leaderboard"
            width={80}
            height={80}
            fallback="hide"
          />
          <Typography sx={{ fontFamily: tokens.fonts.gaming, fontSize: '2rem' }}>
            Leaderboard
          </Typography>
        </Paper>

        {/* History Card */}
        <Paper
          elevation={0}
          onClick={() => navigate('/history')}
          sx={{
            bgcolor: tokens.colors.background.paper,
            borderRadius: '30px',
            py: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1,
            cursor: 'pointer',
            boxShadow: '0px 3px 1px 0px rgba(0,0,0,0.5)',
            '&:hover': { bgcolor: tokens.colors.background.elevated },
          }}
        >
          <AssetImage
            src="/illustrations/stats.svg"
            alt="History"
            width={80}
            height={80}
            fallback="hide"
          />
          <Typography sx={{ fontFamily: tokens.fonts.gaming, fontSize: '2rem' }}>
            History
          </Typography>
        </Paper>

        {/* Coming Soon Card */}
        <Tooltip title="Coming Soon" arrow placement="top">
          <Paper
            elevation={0}
            sx={{
              bgcolor: tokens.colors.background.paper,
              borderRadius: '30px',
              py: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 1,
              boxShadow: '0px 3px 1px 0px rgba(0,0,0,0.5)',
              opacity: 0.6,
              cursor: 'not-allowed',
            }}
          >
            <AssetImage
              src="/illustrations/rewards.svg"
              alt="Daily Rewards"
              width={80}
              height={80}
              fallback="hide"
            />
            <Typography sx={{ fontFamily: tokens.fonts.gaming, fontSize: '2rem', color: tokens.colors.text.secondary }}>
              Rewards
            </Typography>
          </Paper>
        </Tooltip>
      </Box>

      {/* Two Column Layout for Streaks + Meta Stats */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 3,
          mb: 4,
        }}
      >
        {/* Streaks Section */}
        <CardSection padding={0}>
          <CardHeader title="Current Streak" />
          <Box sx={{ p: 3 }}>
            {/* Hero */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <AssetImage
                  src="/icons/fire.svg"
                  alt="Streak"
                  width={32}
                  height={32}
                  fallback="hide"
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                  <Typography sx={{ fontFamily: tokens.fonts.gaming, fontSize: '2.5rem' }}>
                    {currentStreak}
                  </Typography>
                  <Typography variant="body2" sx={{ color: tokens.colors.text.secondary }}>
                    day streak
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: tokens.colors.text.disabled, mt: 0.5 }}>
                  Best: {bestStreak} days · Total: {totalDays} days
                </Typography>
              </Box>
            </Box>

            {/* Milestones */}
            {milestones.map((milestone, i) => {
              const progress = milestone.completed ? 100 : Math.min((currentStreak / milestone.days) * 100, 100);
              return (
                <Box
                  key={milestone.days}
                  sx={{
                    py: 1.5,
                    borderTop: i === 0 ? `1px solid ${tokens.colors.border}` : 'none',
                    borderBottom: `1px solid ${tokens.colors.border}`,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        bgcolor: milestone.completed
                          ? `${tokens.colors.success}20`
                          : tokens.colors.background.elevated,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {milestone.completed ? (
                        <CheckIcon sx={{ fontSize: 18, color: tokens.colors.success }} />
                      ) : (
                        <LockIcon sx={{ fontSize: 18, color: tokens.colors.text.disabled }} />
                      )}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {milestone.label}
                      </Typography>
                    </Box>
                    <Typography
                      variant="caption"
                      sx={{
                        color: milestone.completed
                          ? tokens.colors.success
                          : tokens.colors.text.disabled,
                      }}
                    >
                      {milestone.completed ? 'Done' : `${milestone.remaining} left`}
                    </Typography>
                  </Box>
                  {/* Progress bar for incomplete milestones */}
                  {!milestone.completed && (
                    <Box sx={{ mt: 1, pl: 6 }}>
                      <LinearProgress
                        variant="determinate"
                        value={progress}
                        sx={{
                          height: 4,
                          borderRadius: 2,
                          bgcolor: tokens.colors.background.elevated,
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 2,
                            bgcolor: tokens.colors.primary,
                          },
                        }}
                      />
                      <Typography variant="caption" sx={{ color: tokens.colors.text.disabled, fontSize: '0.7rem' }}>
                        {Math.round(progress)}% complete
                      </Typography>
                    </Box>
                  )}
                </Box>
              );
            })}
          </Box>
        </CardSection>

        {/* Metaprogression Stats */}
        <CardSection padding={0}>
          <CardHeader title="Run Statistics" />
          <Box sx={{ p: 3 }}>
            {/* Stats Grid */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 2,
                mb: 3,
              }}
            >
              {metaStats.map((stat) => (
                <Box
                  key={stat.label}
                  sx={{
                    p: 2,
                    borderRadius: '18px',
                    bgcolor: tokens.colors.background.elevated,
                    textAlign: 'center',
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: tokens.fonts.gaming,
                      fontSize: '3rem',
                      color: stat.color,
                      lineHeight: 1,
                      mb: 0.5,
                    }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography variant="caption" sx={{ color: tokens.colors.text.secondary }}>
                    {stat.label}
                  </Typography>
                </Box>
              ))}
            </Box>

            {/* Adaptive Calendar - Wordle style, grows with streak */}
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, color: tokens.colors.text.secondary }}>
              Last {daysToShow} Days
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: 0.75,
              }}
            >
              {/* Day labels */}
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                <Typography
                  key={i}
                  variant="caption"
                  sx={{
                    textAlign: 'center',
                    color: tokens.colors.text.disabled,
                    fontSize: '0.65rem',
                  }}
                >
                  {day}
                </Typography>
              ))}
              {/* Align first day of range to correct weekday */}
              {calendarDays.length > 0 &&
                Array.from({ length: calendarDays[0].date.getDay() }).map((_, i) => (
                  <Box key={`pad-${i}`} />
                ))}
              {/* Calendar days with heat gradient */}
              {calendarDays.map((day, index) => {
                const intensity = day.isActive ? getHeatIntensity(index, calendarDays.length) : 0;

                return (
                  <Box
                    key={index}
                    sx={{
                      aspectRatio: '1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: day.isActive
                          ? `rgba(233, 4, 65, ${intensity})`
                          : tokens.colors.background.elevated,
                        border: day.isToday
                          ? `2px solid ${tokens.colors.secondary}`
                          : 'none',
                        transition: 'all 0.15s',
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: '0.65rem',
                          lineHeight: 1,
                          fontWeight: day.isActive || day.isToday ? 600 : 400,
                          color: day.isActive
                            ? tokens.colors.text.primary
                            : tokens.colors.text.disabled,
                        }}
                      >
                        {day.date.getDate()}
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
        </CardSection>
      </Box>
    </Box>
  );
}
