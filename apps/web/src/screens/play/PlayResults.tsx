import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  Container,
} from '@mui/material';
import {
  EmojiEventsSharp as TrophyIcon,
  HomeSharp as HomeIcon,
  ReplaySharp as ReplayIcon,
  LeaderboardSharp as LeaderboardIcon,
} from '@mui/icons-material';
import { tokens } from '../../theme';
import { CircleIcon } from '../../components';

// Mock result data - in real app this would come from game state/route params
const mockResult = {
  victory: true,
  xpEarned: 150,
  streakDays: 8,
  streakMaintained: true,
  rankChange: 3,
  previousRank: 45,
  newRank: 42,
};

export function PlayResults() {
  const navigate = useNavigate();
  const result = mockResult;

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Paper
        sx={{
          p: 4,
          textAlign: 'center',
          backgroundColor: tokens.colors.background.paper,
          border: `1px solid ${tokens.colors.border}`,
        }}
      >
        {/* Outcome */}
        <CircleIcon
          icon={<TrophyIcon sx={{ color: tokens.colors.text.secondary }} />}
          size="xxl"
          centered
          mb={3}
        />

        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          {result.victory ? 'Victory' : 'Defeat'}
        </Typography>
        <Typography variant="body1" sx={{ color: tokens.colors.text.secondary, mb: 4 }}>
          {result.victory ? 'Well played!' : 'Better luck next time'}
        </Typography>

        {/* Stats */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 2,
            mb: 4,
          }}
        >
          <Box
            sx={{
              p: 2,
              bgcolor: tokens.colors.background.elevated,
              borderRadius: 1,
            }}
          >
            <Typography variant="caption" sx={{ color: tokens.colors.text.disabled }}>
              XP Earned
            </Typography>
            <Typography variant="h6">+{result.xpEarned}</Typography>
          </Box>

          <Box
            sx={{
              p: 2,
              bgcolor: tokens.colors.background.elevated,
              borderRadius: 1,
            }}
          >
            <Typography variant="caption" sx={{ color: tokens.colors.text.disabled }}>
              Streak
            </Typography>
            <Typography variant="h6">
              {result.streakDays} days
            </Typography>
          </Box>

          <Box
            sx={{
              p: 2,
              bgcolor: tokens.colors.background.elevated,
              borderRadius: 1,
              gridColumn: '1 / -1',
            }}
          >
            <Typography variant="caption" sx={{ color: tokens.colors.text.disabled }}>
              Rank
            </Typography>
            <Typography variant="h6">
              #{result.newRank}
              {result.rankChange !== 0 && (
                <Typography
                  component="span"
                  variant="body2"
                  sx={{ ml: 1, color: tokens.colors.text.secondary }}
                >
                  ({result.rankChange > 0 ? '+' : ''}{result.rankChange} from #{result.previousRank})
                </Typography>
              )}
            </Typography>
          </Box>
        </Box>

        {/* Actions */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Button
            variant="contained"
            size="large"
            fullWidth
            startIcon={<HomeIcon />}
            onClick={() => navigate('/', {
              state: {
                fromGame: true,
                victory: result.victory,
                xpEarned: result.xpEarned,
                rankChange: result.rankChange,
              }
            })}
          >
            Return Home
          </Button>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<ReplayIcon />}
              onClick={() => navigate('/play')}
            >
              Play Again
            </Button>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<LeaderboardIcon />}
              onClick={() => navigate('/leaderboard')}
            >
              Leaderboard
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}
