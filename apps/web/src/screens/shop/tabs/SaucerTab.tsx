/**
 * SaucerTab - The Dying Saucer interior (simplified homepage)
 * Mini dashboard with game launch and recent history
 */

import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Avatar,
} from '@mui/material';
import { tokens } from '../../../theme';
import { AssetImage } from '../../../components/ds';

// Mock recent games
const RECENT_GAMES = [
  { id: 1, opponent: 'Mr Bones', domain: 'Earth', result: 'Win', when: '2h ago' },
  { id: 2, opponent: 'Willy', domain: 'Fire', result: 'Loss', when: '5h ago' },
  { id: 3, opponent: 'The One', domain: 'Void', result: 'Win', when: '1d ago' },
];

export function SaucerTab() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        maxWidth: 600,
        mx: 'auto',
      }}
    >
      {/* Action Buttons */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {/* Continue */}
        <Paper
          onClick={() => navigate('/play')}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            px: 3,
            py: 2,
            bgcolor: tokens.colors.background.paper,
            border: `1px solid ${tokens.colors.primary}`,
            borderRadius: '30px',
            cursor: 'pointer',
            boxShadow: '0px 3px 1px 0px rgba(0,0,0,0.5)',
            '&:hover': {
              bgcolor: `${tokens.colors.primary}15`,
            },
          }}
        >
          <AssetImage
            src="/illustrations/continue.svg"
            alt="Continue"
            width={40}
            height={40}
            fallback="placeholder"
          />
          <Box>
            <Typography
              sx={{
                fontFamily: tokens.fonts.gaming,
                fontSize: '1.35rem',
                lineHeight: 1.2,
              }}
            >
              Continue
            </Typography>
            <Typography sx={{ color: tokens.colors.text.disabled, fontSize: '0.7rem' }}>
              Domain 2 of 6
            </Typography>
          </Box>
        </Paper>

        {/* New Game */}
        <Paper
          onClick={() => navigate('/play', { state: { mode: 'new' } })}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            px: 3,
            py: 2,
            bgcolor: tokens.colors.background.paper,
            borderRadius: '30px',
            cursor: 'pointer',
            boxShadow: '0px 3px 1px 0px rgba(0,0,0,0.5)',
            '&:hover': {
              bgcolor: tokens.colors.background.elevated,
            },
          }}
        >
          <AssetImage
            src="/illustrations/newgame.svg"
            alt="New Game"
            width={40}
            height={40}
            fallback="placeholder"
          />
          <Typography
            sx={{
              fontFamily: tokens.fonts.gaming,
              fontSize: '1.35rem',
              lineHeight: 1.2,
            }}
          >
            New Game
          </Typography>
        </Paper>

        {/* Review */}
        <Paper
          onClick={() => navigate('/play/review')}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            px: 3,
            py: 2,
            bgcolor: tokens.colors.background.paper,
            borderRadius: '30px',
            cursor: 'pointer',
            boxShadow: '0px 3px 1px 0px rgba(0,0,0,0.5)',
            '&:hover': {
              bgcolor: tokens.colors.background.elevated,
            },
          }}
        >
          <AssetImage
            src="/illustrations/review.svg"
            alt="Review"
            width={40}
            height={40}
            fallback="placeholder"
          />
          <Box>
            <Typography
              sx={{
                fontFamily: tokens.fonts.gaming,
                fontSize: '1.35rem',
                lineHeight: 1.2,
              }}
            >
              Review
            </Typography>
            <Typography sx={{ color: tokens.colors.text.disabled, fontSize: '0.7rem' }}>
              Learn from mistakes
            </Typography>
          </Box>
        </Paper>
      </Box>

      {/* Recent History */}
      <Paper
        sx={{
          bgcolor: tokens.colors.background.paper,
          borderRadius: '20px',
          overflow: 'hidden',
          border: `1px solid ${tokens.colors.border}`,
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2.5,
            py: 1.5,
            borderBottom: `1px solid ${tokens.colors.border}`,
          }}
        >
          <Typography sx={{ fontWeight: 600, fontSize: '0.9rem' }}>
            Recent
          </Typography>
          <Typography
            onClick={() => navigate('/history')}
            sx={{
              fontSize: '0.75rem',
              color: tokens.colors.secondary,
              cursor: 'pointer',
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            View All
          </Typography>
        </Box>

        {/* Games list */}
        {RECENT_GAMES.map((game, i) => (
          <Box
            key={game.id}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              px: 2.5,
              py: 1.5,
              borderBottom: i < RECENT_GAMES.length - 1 ? `1px solid ${tokens.colors.border}` : 'none',
              '&:hover': { bgcolor: tokens.colors.background.elevated },
            }}
          >
            <Avatar
              sx={{
                width: 28,
                height: 28,
                bgcolor: tokens.colors.background.elevated,
                fontSize: '0.7rem',
              }}
            >
              {game.opponent.charAt(0)}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 500 }}>
                vs {game.opponent}
              </Typography>
              <Typography sx={{ fontSize: '0.7rem', color: tokens.colors.text.disabled }}>
                {game.domain}
              </Typography>
            </Box>
            <Typography
              sx={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: game.result === 'Win' ? tokens.colors.success : tokens.colors.primary,
              }}
            >
              {game.result}
            </Typography>
            <Typography sx={{ fontSize: '0.65rem', color: tokens.colors.text.disabled }}>
              {game.when}
            </Typography>
          </Box>
        ))}
      </Paper>
    </Box>
  );
}
