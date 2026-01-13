/**
 * Home - Simple 2-button landing page
 *
 * MVP: Just Play Game and Explore Wiki
 *
 * NEVER DIE GUY
 */

import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { tokens } from '../../theme';

export function Home() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: 4,
        pt: { xs: 12, sm: 16 },
        px: 4,
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

      {/* Two Buttons */}
      <Box sx={{ display: 'flex', gap: 2, width: '100%', maxWidth: 360 }}>
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate('/play', { state: { practiceMode: true } })}
          sx={{
            flex: 1,
            py: 2.5,
            fontSize: '1.1rem',
            fontWeight: 700,
            borderRadius: '12px',
            textTransform: 'none',
            gap: 1.5,
          }}
        >
          <Box component="img" src="/assets/nav/nav1-play.svg" sx={{ width: 24, height: 24 }} />
          Play
        </Button>
        <Button
          variant="outlined"
          size="large"
          onClick={() => navigate('/wiki')}
          sx={{
            flex: 1,
            py: 2.5,
            fontSize: '1.1rem',
            fontWeight: 700,
            borderRadius: '12px',
            textTransform: 'none',
            gap: 1.5,
            borderColor: tokens.colors.border,
            color: tokens.colors.text.primary,
            '&:hover': {
              borderColor: tokens.colors.primary,
              bgcolor: `${tokens.colors.primary}10`,
            },
          }}
        >
          <Box component="img" src="/assets/nav/nav2-wiki.svg" sx={{ width: 24, height: 24 }} />
          Wiki
        </Button>
      </Box>
    </Box>
  );
}
