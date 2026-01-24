/**
 * MarketingLP - Landing page for signed-out users
 *
 * Chess.com-inspired layout with alternating two-column sections
 */

import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Link } from '@mui/material';
import { tokens } from '../../theme';

// Feature section data
const SECTIONS = [
  {
    id: 'dice',
    title: 'Roll the Dice,\nDefy Death',
    desc: 'Strategic dice-based combat with roguelike progression. Die. Never die. Die again.',
    cta: 'Start Playing',
    ctaPath: '/signup',
    visual: 'dice',
  },
  {
    id: 'bots',
    title: 'Challenge\nUnique Bots',
    desc: 'Face off against Die-rectors with distinct personalities and playstyles.',
    cta: 'Meet the Bots',
    ctaPath: '/wiki/pantheon',
    visual: 'bots',
  },
  {
    id: 'compete',
    title: 'Climb the\nLeaderboard',
    desc: 'Compete against players worldwide. Track your stats and prove your worth.',
    cta: 'View Leaderboard',
    ctaPath: '/leaderboard',
    visual: 'leaderboard',
  },
  {
    id: 'wiki',
    title: 'Explore\nthe Diepedia',
    desc: 'Discover hundreds of items, enemies, and secrets in our comprehensive wiki.',
    cta: 'Browse Wiki',
    ctaPath: '/wiki',
    visual: 'wiki',
  },
];

// Pantheon portraits for bots section
const BOT_PORTRAITS = [
  'pantheon-portrait-john-01.svg',
  'pantheon-portrait-peter-01.svg',
  'pantheon-portrait-robert-01.svg',
  'pantheon-portrait-alice-01.svg',
  'pantheon-portrait-jane-01.svg',
  'pantheon-portrait-theone-01.svg',
  'pantheon-portrait-rhea-01.svg',
  'pantheon-portrait-immortal-king-james-01.svg',
  'pantheon-portrait-zerochance-01.svg',
];

// Video Visual Component
function VideoVisual({ src }: { src: string }) {
  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 480,
        aspectRatio: '16/9',
        borderRadius: '20px',
        bgcolor: tokens.colors.background.paper,
        border: `1px solid ${tokens.colors.border}`,
        overflow: 'hidden',
        p: 1,
      }}
    >
      <Box
        component="video"
        src={src}
        autoPlay
        loop
        muted
        playsInline
        sx={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          borderRadius: '16px',
        }}
      />
    </Box>
  );
}

// Lo-fi Play Screen Visual
function LofiPlayVisual() {
  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 480,
        aspectRatio: '4/3',
        borderRadius: '20px',
        bgcolor: tokens.colors.background.paper,
        border: `1px solid ${tokens.colors.border}`,
        overflow: 'hidden',
        display: 'flex',
      }}
    >
      {/* Main area */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
        {/* Dice toolbar skeleton */}
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Box
              key={i}
              sx={{
                width: 32,
                height: 32,
                borderRadius: '6px',
                bgcolor: tokens.colors.background.elevated,
              }}
            />
          ))}
        </Box>
        {/* Globe placeholder */}
        <Box
          sx={{
            width: 160,
            height: 160,
            borderRadius: '50%',
            bgcolor: tokens.colors.background.elevated,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            my: 'auto',
          }}
        >
          <Box
            component="img"
            src="/logos/ndg-skull-dome.svg"
            alt="Globe"
            sx={{ width: 60, height: 'auto', opacity: 0.4 }}
          />
        </Box>
        {/* Bottom bar skeleton */}
        <Box sx={{ display: 'flex', gap: 1, mt: 2, justifyContent: 'center' }}>
          <Box sx={{ width: 80, height: 28, borderRadius: '14px', bgcolor: tokens.colors.background.elevated }} />
          <Box sx={{ width: 80, height: 28, borderRadius: '14px', bgcolor: tokens.colors.background.elevated }} />
        </Box>
      </Box>
      {/* Sidebar skeleton */}
      <Box
        sx={{
          width: 120,
          bgcolor: tokens.colors.background.elevated,
          borderLeft: `1px solid ${tokens.colors.border}`,
          p: 1.5,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
        }}
      >
        <Box sx={{ height: 12, width: '80%', bgcolor: tokens.colors.background.paper, borderRadius: 1 }} />
        <Box sx={{ height: 8, width: '60%', bgcolor: tokens.colors.background.paper, borderRadius: 1 }} />
        <Box sx={{ flex: 1 }} />
        <Box sx={{ height: 24, bgcolor: tokens.colors.background.paper, borderRadius: '8px' }} />
        <Box sx={{ height: 24, bgcolor: tokens.colors.background.paper, borderRadius: '8px' }} />
      </Box>
    </Box>
  );
}

// Section visual components
function SectionVisual({ type }: { type: string }) {
  const visualStyles = {
    width: '100%',
    maxWidth: 480,
    aspectRatio: '4/3',
    borderRadius: '20px',
    bgcolor: tokens.colors.background.paper,
    border: `1px solid ${tokens.colors.border}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  };

  // Lo-fi visual for dice section
  if (type === 'dice') {
    return <LofiPlayVisual />;
  }

  // Portrait grid for bots section
  if (type === 'bots') {
    return (
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, maxWidth: 400 }}>
        {BOT_PORTRAITS.map((portrait) => (
          <Box
            key={portrait}
            sx={{
              width: 100,
              height: 100,
              borderRadius: '16px',
              bgcolor: tokens.colors.background.elevated,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            <Box
              component="img"
              src={`/assets/characters/portraits/120px/${portrait}`}
              alt={portrait}
              sx={{ width: 80, height: 80, objectFit: 'contain' }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          </Box>
        ))}
      </Box>
    );
  }

  // Lo-fi leaderboard
  if (type === 'leaderboard') {
    return (
      <Box sx={visualStyles}>
        <Box sx={{ width: '100%', p: 3 }}>
          {[1, 2, 3, 4, 5].map((rank) => (
            <Box
              key={rank}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                py: 1.5,
                borderBottom: rank < 5 ? `1px solid ${tokens.colors.border}` : 'none',
              }}
            >
              <Typography
                sx={{
                  width: 28,
                  fontWeight: 700,
                  color: rank === 1 ? tokens.colors.rarity.legendary : rank === 2 ? tokens.colors.rarity.epic : rank === 3 ? tokens.colors.rarity.rare : tokens.colors.text.disabled,
                }}
              >
                {rank}
              </Typography>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  bgcolor: tokens.colors.background.elevated,
                }}
              />
              <Box sx={{ flex: 1 }}>
                <Box sx={{ height: 12, width: `${80 - rank * 10}%`, bgcolor: tokens.colors.background.elevated, borderRadius: 1 }} />
              </Box>
              <Box sx={{ height: 12, width: 60, bgcolor: tokens.colors.background.elevated, borderRadius: 1 }} />
            </Box>
          ))}
        </Box>
      </Box>
    );
  }

  // Video for wiki/diepedia section
  if (type === 'wiki') {
    return <VideoVisual src="/assets/videos/explorediepedia.mp4" />;
  }

  return <Box sx={visualStyles} />;
}

export function MarketingLP() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: tokens.colors.background.default,
      }}
    >
      {/* Hero Section */}
      <Box
        sx={{
          width: '100%',
          maxWidth: 1200,
          mx: 'auto',
          px: { xs: 3, sm: 4, md: 6 },
          pt: { xs: 8, sm: 12, md: 16 },
          pb: { xs: 8, sm: 12 },
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: 'center',
          gap: { xs: 4, md: 8 },
        }}
      >
        {/* Hero Visual - Gameplay Video */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <VideoVisual src="/assets/videos/playing.mp4" />
        </Box>

        {/* Hero Text */}
        <Box
          sx={{
            flex: 1,
            textAlign: { xs: 'center', md: 'left' },
          }}
        >
          <Typography
            sx={{
              fontFamily: tokens.fonts.gaming,
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
              color: tokens.colors.text.primary,
              mb: 2,
              lineHeight: 1.2,
            }}
          >
            Play NEVER DIE GUY
          </Typography>
          <Typography
            sx={{
              fontSize: { xs: '1rem', sm: '1.125rem' },
              color: tokens.colors.text.secondary,
              mb: 4,
              maxWidth: { md: 400 },
            }}
          >
            Enjoyable dice roguelike.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/signup')}
            sx={{
              px: 6,
              py: 2,
              fontSize: '1.125rem',
              fontWeight: 700,
              borderRadius: '12px',
            }}
          >
            Get Started
          </Button>
        </Box>
      </Box>

      {/* Feature Sections - Alternating layout, no gray backgrounds */}
      {SECTIONS.map((section, index) => {
        const isReversed = index % 2 === 1;
        return (
        <Box
          key={section.id}
          sx={{
            width: '100%',
            py: { xs: 8, sm: 10, md: 12 },
          }}
        >
          <Box
            sx={{
              maxWidth: 1200,
              mx: 'auto',
              px: { xs: 3, sm: 4, md: 6 },
              display: 'flex',
              flexDirection: { xs: 'column', md: isReversed ? 'row-reverse' : 'row' },
              alignItems: 'center',
              gap: { xs: 4, md: 8 },
            }}
          >
            {/* Text */}
            <Box
              sx={{
                flex: 1,
                textAlign: { xs: 'center', md: 'left' },
              }}
            >
              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' },
                  color: tokens.colors.text.primary,
                  mb: 2,
                  lineHeight: 1.2,
                  whiteSpace: 'pre-line',
                }}
              >
                {section.title}
              </Typography>
              <Typography
                sx={{
                  fontSize: { xs: '1rem', sm: '1.125rem' },
                  color: tokens.colors.text.secondary,
                  mb: 4,
                  maxWidth: { md: 400 },
                }}
              >
                {section.desc}
              </Typography>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate(section.ctaPath)}
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 600,
                  borderRadius: '12px',
                  borderColor: tokens.colors.border,
                  color: tokens.colors.text.primary,
                  '&:hover': {
                    borderColor: tokens.colors.text.secondary,
                    bgcolor: 'transparent',
                  },
                }}
              >
                {section.cta}
              </Button>
            </Box>

            {/* Visual */}
            <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
              <SectionVisual type={section.visual} />
            </Box>
          </Box>
        </Box>
        );
      })}

      {/* Final CTA Section */}
      <Box
        sx={{
          width: '100%',
          py: { xs: 10, sm: 12, md: 16 },
          textAlign: 'center',
        }}
      >
        <Typography
          sx={{
            fontWeight: 800,
            fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' },
            color: tokens.colors.text.primary,
            mb: 4,
          }}
        >
          Roll, Fight, and Never Die!
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate('/signup')}
          sx={{
            px: 8,
            py: 2,
            fontSize: '1.125rem',
            fontWeight: 700,
            borderRadius: '12px',
          }}
        >
          Get Started
        </Button>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          width: '100%',
          py: 4,
          borderTop: `1px solid ${tokens.colors.border}`,
        }}
      >
        <Box
          sx={{
            maxWidth: 1200,
            mx: 'auto',
            px: { xs: 3, sm: 4, md: 6 },
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link
              component="button"
              onClick={() => navigate('/terms')}
              sx={{ color: tokens.colors.text.secondary, textDecoration: 'none', '&:hover': { color: tokens.colors.text.primary } }}
            >
              Terms
            </Link>
            <Link
              component="button"
              onClick={() => navigate('/privacy')}
              sx={{ color: tokens.colors.text.secondary, textDecoration: 'none', '&:hover': { color: tokens.colors.text.primary } }}
            >
              Privacy
            </Link>
            <Link
              component="button"
              onClick={() => navigate('/help')}
              sx={{ color: tokens.colors.text.secondary, textDecoration: 'none', '&:hover': { color: tokens.colors.text.primary } }}
            >
              Help
            </Link>
          </Box>
          <Typography variant="caption" sx={{ color: tokens.colors.text.disabled }}>
            NEVER DIE GUY is a trademark of Kevin Grzejka Design LLC
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
