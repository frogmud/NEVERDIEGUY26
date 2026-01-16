import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';
import { tokens } from '../../theme';

// Video data - add more videos here as needed
const videos = [
  { src: '/assets/video/about-demo.mp4' },
  // Add more videos:
  // { src: '/assets/video/combat-demo.mp4' },
  // { src: '/assets/video/shop-demo.mp4' },
];

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
      <Box
        sx={{
          mb: { xs: 5, md: 7 },
        }}
      >
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
            maxWidth: 520,
            lineHeight: 1.6,
          }}
        >
          NEVER DIE GUY is a free, browser-based dice roguelike made by{' '}
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
          . Throw dice, clear zones, and collect loot in quick sessions with endless replayability.
        </Typography>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
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

      {/* Video Gallery */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: videos.length > 1 ? 'repeat(2, 1fr)' : '1fr',
          },
          gap: 3,
        }}
      >
        {videos.map((video, index) => (
          <Box
            key={index}
            sx={{
              borderRadius: 2,
              overflow: 'hidden',
              bgcolor: tokens.colors.background.elevated,
            }}
          >
            <Box
              component="video"
              src={video.src}
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
        ))}
      </Box>
    </Box>
  );
}
