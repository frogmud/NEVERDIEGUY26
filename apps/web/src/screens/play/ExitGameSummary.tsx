import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
} from '@mui/material';
import {
  ExitToAppSharp as ExitIcon,
  ReplaySharp as RetryIcon,
  HomeSharp as HomeIcon,
  CheckCircleSharp as CheckIcon,
} from '@mui/icons-material';
import { tokens } from '../../theme';
import { CircleIcon } from '../../components';

// Rewards kept from partial run
interface ExitStats {
  score: number;
  roomsCleared: number;
  totalRooms: number;
  domain: string;
  goldKept: number;
  itemsKept: number;
  xpEarned: number;
}

const MOCK_EXIT_STATS: ExitStats = {
  score: 4250,
  roomsCleared: 1,
  totalRooms: 3,
  domain: 'Frost Caverns',
  goldKept: 180,
  itemsKept: 2,
  xpEarned: 85,
};

export function ExitGameSummary() {
  const navigate = useNavigate();
  const location = useLocation();

  // Calculate stats from progress passed from confirm screen
  const progress = location.state?.progress;
  const stats: ExitStats = progress ? {
    score: progress.score,
    roomsCleared: progress.currentRoom - 1,
    totalRooms: progress.totalRooms,
    domain: progress.domain,
    goldKept: progress.goldCollected,
    itemsKept: progress.itemsFound,
    xpEarned: Math.floor(progress.score / 50), // Partial XP for early exit
  } : MOCK_EXIT_STATS;

  return (
    <Box sx={{ maxWidth: 480, mx: 'auto', py: 4 }}>
      {/* Header */}
      <Paper
        sx={{
          p: 4,
          mb: 3,
          textAlign: 'center',
          bgcolor: tokens.colors.background.paper,
          border: `1px solid ${tokens.colors.border}`,
          borderRadius: 2,
        }}
      >
        <CircleIcon
          icon={<ExitIcon />}
          color={tokens.colors.text.secondary}
          size="xxl"
          centered
          mb={2}
        />
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            mb: 1,
          }}
        >
          Run Complete
        </Typography>
        <Typography sx={{ color: tokens.colors.text.secondary }}>
          {stats.domain} | {stats.roomsCleared}/{stats.totalRooms} events
        </Typography>
      </Paper>

      {/* Rewards Kept */}
      <Paper
        sx={{
          p: 3,
          mb: 3,
          bgcolor: tokens.colors.background.paper,
          border: `1px solid ${tokens.colors.border}`,
          borderRadius: 2,
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: 600, mb: 2, color: tokens.colors.text.secondary }}
        >
          REWARDS KEPT
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="body2">Score</Typography>
            <Typography sx={{ fontFamily: tokens.fonts.mono, fontWeight: 600 }}>
              {stats.score.toLocaleString()}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="body2">Gold</Typography>
            <Typography sx={{ fontFamily: tokens.fonts.mono, fontWeight: 600 }}>
              {stats.goldKept}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="body2">Items</Typography>
            <Typography sx={{ fontWeight: 600 }}>{stats.itemsKept}</Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="body2">XP Earned</Typography>
            <Typography sx={{ fontFamily: tokens.fonts.mono, fontWeight: 600 }}>
              +{stats.xpEarned}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Tip */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          mb: 4,
          p: 2,
          borderRadius: 1,
          bgcolor: tokens.colors.background.elevated,
        }}
      >
        <CheckIcon sx={{ color: tokens.colors.text.secondary, fontSize: 18 }} />
        <Typography variant="body2" sx={{ color: tokens.colors.text.secondary }}>
          The deeper you go, the better the rewards.
        </Typography>
      </Box>

      {/* Actions */}
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          fullWidth
          size="large"
          startIcon={<RetryIcon />}
          onClick={() => navigate('/play')}
          sx={{ py: 1.5 }}
        >
          Play Again
        </Button>
        <Button
          variant="outlined"
          fullWidth
          size="large"
          startIcon={<HomeIcon />}
          onClick={() => navigate('/')}
          sx={{ py: 1.5 }}
        >
          Home
        </Button>
      </Box>
    </Box>
  );
}
