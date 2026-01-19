import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Divider } from '@mui/material';
import { tokens } from '../../theme';

export function AboutUs() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        maxWidth: 900,
        mx: 'auto',
        py: { xs: 4, md: 6 },
        px: { xs: 2, md: 4 },
      }}
    >
      {/* Hero Section */}
      <Box sx={{ mb: { xs: 5, md: 7 } }}>
        {/* Heading */}
        <Typography
          sx={{
            fontFamily: tokens.fonts.gaming,
            fontSize: { xs: '2rem', md: '2.5rem' },
            color: tokens.colors.text.primary,
            mb: 2,
          }}
        >
          About
        </Typography>

        {/* Description */}
        <Typography
          sx={{
            fontSize: { xs: '0.95rem', md: '1rem' },
            color: tokens.colors.text.secondary,
            mb: 4,
            maxWidth: 600,
            lineHeight: 1.7,
          }}
        >
          NEVER DIE GUY is a free, browser-based dice roguelike. Throw meteors at planets, clear zones, and collect loot in quick sessions with endless replayability. Built with love by a small team of indie developers.
        </Typography>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
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
      </Box>

      <Divider sx={{ borderColor: tokens.colors.border, mb: 5 }} />

      {/* Credits Section */}
      <Box sx={{ mb: 5 }}>
        <Typography
          sx={{
            fontFamily: tokens.fonts.gaming,
            fontSize: { xs: '1.4rem', md: '1.6rem' },
            color: tokens.colors.text.primary,
            mb: 3,
          }}
        >
          Credits
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Creator */}
          <Box>
            <Typography
              sx={{
                fontSize: '0.85rem',
                color: tokens.colors.text.disabled,
                textTransform: 'uppercase',
                letterSpacing: 1,
                mb: 0.5,
              }}
            >
              Created by
            </Typography>
            <Box
              component="a"
              href="https://kgrz.design"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                fontSize: '1.1rem',
                color: tokens.colors.text.primary,
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              kgrz.design
            </Box>
          </Box>

          {/* Tech */}
          <Box>
            <Typography
              sx={{
                fontSize: '0.85rem',
                color: tokens.colors.text.disabled,
                textTransform: 'uppercase',
                letterSpacing: 1,
                mb: 0.5,
              }}
            >
              Built with
            </Typography>
            <Typography sx={{ fontSize: '1rem', color: tokens.colors.text.secondary }}>
              React, Three.js, Material-UI
            </Typography>
          </Box>

          {/* Special Thanks */}
          <Box>
            <Typography
              sx={{
                fontSize: '0.85rem',
                color: tokens.colors.text.disabled,
                textTransform: 'uppercase',
                letterSpacing: 1,
                mb: 0.5,
              }}
            >
              Special Thanks
            </Typography>
            <Typography sx={{ fontSize: '1rem', color: tokens.colors.text.secondary, lineHeight: 1.7 }}>
              The roguelike community, Balatro for the inspiration, and everyone who playtests and provides feedback.
            </Typography>
          </Box>
        </Box>
      </Box>

      <Divider sx={{ borderColor: tokens.colors.border, mb: 5 }} />

      {/* Contact / Links */}
      <Box>
        <Typography
          sx={{
            fontFamily: tokens.fonts.gaming,
            fontSize: { xs: '1.4rem', md: '1.6rem' },
            color: tokens.colors.text.primary,
            mb: 3,
          }}
        >
          Connect
        </Typography>

        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          <Box
            component="a"
            href="https://github.com/kgrz"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              fontSize: '1rem',
              color: tokens.colors.text.secondary,
              textDecoration: 'none',
              '&:hover': { color: tokens.colors.text.primary },
            }}
          >
            GitHub
          </Box>
          <Box
            component="a"
            href="https://kgrz.design"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              fontSize: '1rem',
              color: tokens.colors.text.secondary,
              textDecoration: 'none',
              '&:hover': { color: tokens.colors.text.primary },
            }}
          >
            Portfolio
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
