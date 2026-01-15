import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';
import { tokens } from '../../theme';

export function AboutUs() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        gap: { xs: 4, md: 6 },
        maxWidth: 1100,
        mx: 'auto',
        py: { xs: 4, md: 6 },
        px: { xs: 2, md: 4 },
        alignItems: 'center',
        minHeight: 'calc(100vh - 200px)',
      }}
    >
      {/* Video */}
      <Box
        component="figure"
        sx={{
          flex: { xs: '1', md: '0 0 50%' },
          width: '100%',
          maxWidth: { xs: '100%', md: 560 },
          m: 0,
        }}
      >
        <Box
          sx={{
            borderRadius: 2,
            overflow: 'hidden',
            bgcolor: tokens.colors.background.elevated,
          }}
        >
          <Box
            component="video"
            src="/assets/video/about-demo.mp4"
            autoPlay
            loop
            muted
            playsInline
            sx={{
              width: '100%',
              height: 'auto',
              display: 'block',
            }}
          />
        </Box>
        <Typography
          component="figcaption"
          sx={{
            mt: 1.5,
            fontSize: '0.85rem',
            color: tokens.colors.text.disabled,
            textAlign: 'center',
          }}
        >
          Arena mode gameplay
        </Typography>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1 }}>
        {/* Heading */}
        <Typography
          sx={{
            fontFamily: tokens.fonts.gaming,
            fontSize: { xs: '2.5rem', md: '3.5rem' },
            color: tokens.colors.text.primary,
            mb: 0.5,
          }}
        >
          About
        </Typography>

        {/* Description */}
        <Typography
          sx={{
            fontSize: { xs: '1rem', md: '1.1rem' },
            color: tokens.colors.text.secondary,
            mb: 3,
            maxWidth: 420,
            lineHeight: 1.6,
          }}
        >
          NEVER DIE GUY is a dice-based roguelike where you throw dice at a globe,
          clear zones, and collect loot. Built for quick sessions and endless replayability.
        </Typography>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/play')}
            sx={{
              fontFamily: tokens.fonts.gaming,
              fontSize: '1.1rem',
              px: 4,
              py: 1.5,
              bgcolor: tokens.colors.primary,
              '&:hover': { bgcolor: '#c7033a' },
            }}
          >
            Play Now
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate('/wiki')}
            sx={{
              fontFamily: tokens.fonts.gaming,
              fontSize: '1.1rem',
              px: 4,
              py: 1.5,
              borderColor: tokens.colors.text.primary,
              color: tokens.colors.text.primary,
              '&:hover': {
                borderColor: tokens.colors.text.secondary,
                bgcolor: 'rgba(255,255,255,0.05)',
              },
            }}
          >
            Explore Wiki
          </Button>
        </Box>

        {/* Creator */}
        <Typography sx={{ fontSize: '0.9rem', color: tokens.colors.text.disabled }}>
          By{' '}
          <Box
            component="a"
            href="https://kgrz.design"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              color: tokens.colors.text.secondary,
              textDecoration: 'underline',
              '&:hover': { color: tokens.colors.text.primary },
            }}
          >
            kgrz.design
          </Box>
        </Typography>
      </Box>
    </Box>
  );
}
