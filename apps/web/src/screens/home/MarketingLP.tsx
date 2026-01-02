/**
 * MarketingLP - Landing page for signed-out users
 *
 * Chess.com-inspired layout with alternating two-column sections
 */

import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Link } from '@mui/material';
import {
  CasinoSharp as DiceIcon,
  SmartToySharp as BotIcon,
  MenuBookSharp as WikiIcon,
  EmojiEventsSharp as TrophyIcon,
} from '@mui/icons-material';
import { tokens } from '../../theme';

// Feature section data
const SECTIONS = [
  {
    id: 'dice',
    title: 'Roll the Dice,\nDefy Death',
    desc: 'Strategic dice-based combat with roguelike progression. Every roll matters.',
    cta: 'Start Playing',
    ctaPath: '/signup',
    icon: DiceIcon,
    visual: 'dice',
  },
  {
    id: 'bots',
    title: 'Challenge\nUnique Bots',
    desc: 'Face off against Die-rectors with distinct personalities and playstyles.',
    cta: 'Meet the Bots',
    ctaPath: '/wiki/pantheon',
    icon: BotIcon,
    visual: 'bots',
  },
  {
    id: 'compete',
    title: 'Climb the\nLeaderboard',
    desc: 'Compete against players worldwide. Track your stats and prove your worth.',
    cta: 'View Leaderboard',
    ctaPath: '/leaderboard',
    icon: TrophyIcon,
    visual: 'leaderboard',
  },
  {
    id: 'wiki',
    title: 'Explore\nthe Diepedia',
    desc: 'Discover hundreds of items, enemies, and secrets in our comprehensive wiki.',
    cta: 'Browse Wiki',
    ctaPath: '/wiki',
    icon: WikiIcon,
    visual: 'wiki',
  },
];

// Placeholder visual component
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

  // Different placeholder visuals based on type
  if (type === 'dice') {
    return (
      <Box sx={visualStyles}>
        <Box
          component="img"
          src="/logos/ndg-skull-dome.svg"
          alt="Dice"
          sx={{ width: 160, height: 'auto', opacity: 0.6 }}
        />
      </Box>
    );
  }

  if (type === 'bots') {
    return (
      <Box sx={visualStyles}>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.5, p: 3 }}>
          {['john', 'mr-bones', 'xtreme', 'willy', 'voss', 'maxwell', 'bones', 'boo', 'thegeneral'].map((name) => (
            <Box
              key={name}
              sx={{
                width: 64,
                height: 64,
                borderRadius: '12px',
                bgcolor: tokens.colors.background.elevated,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Box
                component="img"
                src={`/assets/characters/shops/${name}.png`}
                alt={name}
                sx={{ width: 48, height: 48, imageRendering: 'pixelated' }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            </Box>
          ))}
        </Box>
      </Box>
    );
  }

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

  if (type === 'wiki') {
    return (
      <Box sx={visualStyles}>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1.5, p: 3 }}>
          {Array.from({ length: 12 }).map((_, i) => (
            <Box
              key={i}
              sx={{
                width: 56,
                height: 56,
                borderRadius: '8px',
                bgcolor: tokens.colors.background.elevated,
              }}
            />
          ))}
        </Box>
      </Box>
    );
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
        {/* Hero Visual */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <Box
            sx={{
              width: '100%',
              maxWidth: 400,
              aspectRatio: '1',
              borderRadius: '24px',
              bgcolor: tokens.colors.background.paper,
              border: `1px solid ${tokens.colors.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Box
              component="img"
              src="/logos/ndg-skull-dome.svg"
              alt="Never Die Guy"
              sx={{ width: '60%', height: 'auto' }}
            />
          </Box>
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
            Enjoyable dice roguelike. Die. Never die. Die again.
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

      {/* Feature Sections - Alternating Layout */}
      {SECTIONS.map((section, index) => {
        const isReversed = index % 2 === 1;
        const Icon = section.icon;

        return (
          <Box
            key={section.id}
            sx={{
              width: '100%',
              py: { xs: 8, sm: 10, md: 12 },
              bgcolor: index % 2 === 0 ? 'transparent' : tokens.colors.background.paper,
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
              {/* Visual */}
              <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                <SectionVisual type={section.visual} />
              </Box>

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
                  startIcon={<Icon />}
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
