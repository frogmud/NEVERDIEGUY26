import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
} from '@mui/material';
import {
  ExitToAppSharp as ExitIcon,
  PlayArrowSharp as StayIcon,
  CheckSharp as CheckIcon,
} from '@mui/icons-material';
import { tokens } from '../../theme';
import { CircleIcon } from '../../components';

// Mock current game progress (in real app, would come from game state or location state)
interface GameProgress {
  score: number;
  currentRoom: number;
  totalRooms: number;
  domain: string;
  goldCollected: number;
  itemsFound: number;
}

const MOCK_PROGRESS: GameProgress = {
  score: 4250,
  currentRoom: 2,
  totalRooms: 3,
  domain: 'Frost Caverns',
  goldCollected: 180,
  itemsFound: 2,
};

export function ExitGameConfirm() {
  const navigate = useNavigate();
  const location = useLocation();

  // Get progress from location state or use mock
  const progress = (location.state?.progress as GameProgress) || MOCK_PROGRESS;

  const handleStay = () => {
    // Go back to game
    navigate(-1);
  };

  const handleLeave = () => {
    // Navigate to exit summary with current progress
    navigate('/play/exit-summary', { state: { progress } });
  };

  // Calculate what player will keep
  const xpEarned = Math.floor(progress.score / 50);

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
          End Run?
        </Typography>
        <Typography sx={{ color: tokens.colors.text.secondary }}>
          {progress.domain} | Event {progress.currentRoom}/{progress.totalRooms}
        </Typography>
      </Paper>

      {/* What You'll Keep */}
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
          YOU'LL KEEP
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="body2">Score</Typography>
            <Typography sx={{ fontFamily: tokens.fonts.mono, fontWeight: 600 }}>
              {progress.score.toLocaleString()}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="body2">Gold</Typography>
            <Typography sx={{ fontFamily: tokens.fonts.mono, fontWeight: 600 }}>
              {progress.goldCollected}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="body2">Items</Typography>
            <Typography sx={{ fontWeight: 600 }}>{progress.itemsFound}</Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="body2">XP</Typography>
            <Typography sx={{ fontFamily: tokens.fonts.mono, fontWeight: 600 }}>
              +{xpEarned}
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
          Going deeper earns better rewards.
        </Typography>
      </Box>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          fullWidth
          size="large"
          startIcon={<StayIcon />}
          onClick={handleStay}
          sx={{ py: 1.5 }}
        >
          Keep Playing
        </Button>
        <Button
          variant="outlined"
          fullWidth
          size="large"
          startIcon={<ExitIcon />}
          onClick={handleLeave}
          sx={{ py: 1.5 }}
        >
          End Run
        </Button>
      </Box>
    </Box>
  );
}
