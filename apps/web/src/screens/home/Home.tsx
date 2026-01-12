/**
 * Home - Simple 2-button landing page
 *
 * MVP: Just Play Game and Explore Wiki
 *
 * NEVER DIE GUY
 */

import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { SportsEsportsSharp, AutoStoriesSharp, BoltSharp } from '@mui/icons-material';
import { tokens } from '../../theme';
import { MarketingLP } from './MarketingLP';
import { useAuth } from '../../contexts/AuthContext';

export function Home() {
  const { hasStartedGame } = useAuth();
  const navigate = useNavigate();

  // Show marketing landing page until user starts their first game
  if (!hasStartedGame) {
    return <MarketingLP />;
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        p: 4,
        bgcolor: tokens.colors.background.default,
      }}
    >
      {/* Logo / Title */}
      <Box sx={{ textAlign: 'center' }}>
        <Box
          component="img"
          src="/logos/ndg-skull-dome.svg"
          alt="NEVER DIE GUY"
          sx={{ width: 80, height: 'auto', mb: 2, opacity: 0.9 }}
        />
        <Typography
          sx={{
            fontFamily: tokens.fonts.gaming,
            fontSize: { xs: '1.5rem', sm: '2rem' },
            color: tokens.colors.text.primary,
            letterSpacing: '0.05em',
          }}
        >
          NEVER DIE GUY
        </Typography>
      </Box>

      {/* Main Buttons */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          width: '100%',
          maxWidth: 400,
        }}
      >
        {/* Primary: Battle Now - jump straight into combat */}
        <Button
          variant="contained"
          size="large"
          startIcon={<BoltSharp />}
          onClick={() => navigate('/play', { state: { practiceMode: true } })}
          sx={{
            py: 3,
            fontSize: '1.25rem',
            fontWeight: 700,
            borderRadius: '16px',
            textTransform: 'none',
          }}
        >
          Battle Now
        </Button>

        {/* Secondary row */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            size="large"
            startIcon={<SportsEsportsSharp />}
            onClick={() => navigate('/play')}
            sx={{
              flex: 1,
              py: 2,
              fontSize: '1rem',
              fontWeight: 600,
              borderRadius: '12px',
              textTransform: 'none',
              borderColor: tokens.colors.border,
              color: tokens.colors.text.primary,
              '&:hover': {
                borderColor: tokens.colors.primary,
                bgcolor: `${tokens.colors.primary}10`,
              },
            }}
          >
            Full Run
          </Button>

          <Button
            variant="outlined"
            size="large"
            startIcon={<AutoStoriesSharp />}
            onClick={() => navigate('/wiki')}
            sx={{
              flex: 1,
              py: 2,
              fontSize: '1rem',
              fontWeight: 600,
              borderRadius: '12px',
              textTransform: 'none',
              borderColor: tokens.colors.border,
              color: tokens.colors.text.primary,
              '&:hover': {
                borderColor: tokens.colors.primary,
                bgcolor: `${tokens.colors.primary}10`,
              },
            }}
          >
            Wiki
          </Button>
        </Box>
      </Box>

      {/* Quick Links */}
      <Box sx={{ display: 'flex', gap: 3, mt: 2 }}>
        <Typography
          component="button"
          onClick={() => navigate('/settings')}
          sx={{
            background: 'none',
            border: 'none',
            color: tokens.colors.text.secondary,
            fontSize: '0.875rem',
            cursor: 'pointer',
            '&:hover': { color: tokens.colors.text.primary },
          }}
        >
          Settings
        </Typography>
        <Typography
          component="button"
          onClick={() => navigate('/help')}
          sx={{
            background: 'none',
            border: 'none',
            color: tokens.colors.text.secondary,
            fontSize: '0.875rem',
            cursor: 'pointer',
            '&:hover': { color: tokens.colors.text.primary },
          }}
        >
          Help
        </Typography>
      </Box>
    </Box>
  );
}
