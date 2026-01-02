/**
 * GettingStarted - Basics guide for new players
 */

import { Link as RouterLink } from 'react-router-dom';
import { Box, Typography, Paper, Breadcrumbs, Link as MuiLink } from '@mui/material';
import { NavigateNextSharp as NextIcon } from '@mui/icons-material';
import { tokens } from '../../theme';
import { AssetImage } from '../../components/ds';

export function GettingStarted() {
  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 800, mx: 'auto' }}>
      {/* Breadcrumbs */}
      <Breadcrumbs
        separator={<NextIcon fontSize="small" sx={{ color: tokens.colors.text.disabled }} />}
        sx={{ mb: 3 }}
      >
        <MuiLink
          component={RouterLink}
          to="/"
          sx={{ color: tokens.colors.secondary, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
        >
          Home
        </MuiLink>
        <MuiLink
          component={RouterLink}
          to="/help"
          sx={{ color: tokens.colors.secondary, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
        >
          Help
        </MuiLink>
        <Typography color="text.primary" sx={{ fontSize: '0.875rem' }}>
          Getting Started
        </Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <AssetImage src="/illustrations/tutorial.svg" alt="Getting Started" width={64} height={64} fallback="hide" />
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Getting Started
          </Typography>
          <Typography variant="body2" sx={{ color: tokens.colors.text.secondary }}>
            Learn the basics of dice combat
          </Typography>
        </Box>
      </Box>

      {/* Introduction */}
      <Paper sx={{ bgcolor: tokens.colors.background.paper, borderRadius: '20px', p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Welcome to Never Die Guy
        </Typography>
        <Typography variant="body2" sx={{ color: tokens.colors.text.secondary, mb: 2, lineHeight: 1.7 }}>
          Never Die Guy is a roguelike dice combat game where you throw dice at planets to defeat
          enemies and collect loot. Each run is unique, with procedurally generated encounters,
          items, and challenges across 8 distinct domains.
        </Typography>
        <Typography variant="body2" sx={{ color: tokens.colors.text.secondary, lineHeight: 1.7 }}>
          Your goal is simple: survive as long as possible, build the best dice loadout, and
          climb the leaderboards. Death is inevitable, but your progress is eternal.
        </Typography>
      </Paper>

      {/* Core Gameplay */}
      <Paper sx={{ bgcolor: tokens.colors.background.paper, borderRadius: '20px', overflow: 'hidden', mb: 3 }}>
        <Box sx={{ px: 3, py: 2.25, borderBottom: `1px solid ${tokens.colors.border}` }}>
          <Typography sx={{ fontWeight: 600, fontSize: '1.125rem' }}>
            Core Gameplay Loop
          </Typography>
        </Box>
        <Box sx={{ p: 3 }}>
          {[
            { step: '1', title: 'Start a Run', desc: 'Choose your starting dice loadout and enter a domain.' },
            { step: '2', title: 'Throw Dice', desc: 'Roll your dice at the planet to deal damage to enemies.' },
            { step: '3', title: 'Collect Rewards', desc: 'Defeat enemies to earn gold, items, and new dice.' },
            { step: '4', title: 'Progress', desc: 'Clear rooms, defeat bosses, and advance through levels.' },
            { step: '5', title: 'Die & Repeat', desc: 'When you fall, keep your unlocks and try again.' },
          ].map((item, i, arr) => (
            <Box
              key={item.step}
              sx={{
                display: 'flex',
                gap: 2,
                pb: i < arr.length - 1 ? 2 : 0,
                mb: i < arr.length - 1 ? 2 : 0,
                borderBottom: i < arr.length - 1 ? `1px solid ${tokens.colors.border}` : 'none',
              }}
            >
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  bgcolor: tokens.colors.primary,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  flexShrink: 0,
                }}
              >
                {item.step}
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 500, mb: 0.5 }}>{item.title}</Typography>
                <Typography variant="body2" sx={{ color: tokens.colors.text.secondary }}>
                  {item.desc}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Paper>

      {/* Your First Run */}
      <Paper sx={{ bgcolor: tokens.colors.background.paper, borderRadius: '20px', overflow: 'hidden', mb: 3 }}>
        <Box sx={{ px: 3, py: 2.25, borderBottom: `1px solid ${tokens.colors.border}` }}>
          <Typography sx={{ fontWeight: 600, fontSize: '1.125rem' }}>
            Your First Run
          </Typography>
        </Box>
        <Box sx={{ p: 3 }}>
          <Typography variant="body2" sx={{ color: tokens.colors.text.secondary, mb: 2, lineHeight: 1.7 }}>
            When you start your first run, you will have a basic loadout of D6 dice. These are
            reliable and deal consistent damage. As you progress, you will find better dice with
            higher damage potential and special effects.
          </Typography>
          <Typography variant="body2" sx={{ color: tokens.colors.text.secondary, mb: 2, lineHeight: 1.7 }}>
            Each domain has 3 levels with 3 rooms each. Clear all rooms in a level to face the
            boss. Defeat the boss to unlock the next level and earn powerful rewards.
          </Typography>
          <Typography variant="body2" sx={{ color: tokens.colors.text.secondary, lineHeight: 1.7 }}>
            Do not worry about dying early. Every run teaches you more about enemy patterns,
            item synergies, and optimal strategies. Use the Diepedia to learn about enemies
            and items you encounter.
          </Typography>
        </Box>
      </Paper>

      {/* Next Steps */}
      <Paper sx={{ bgcolor: tokens.colors.background.paper, borderRadius: '20px', overflow: 'hidden' }}>
        <Box sx={{ px: 3, py: 2.25, borderBottom: `1px solid ${tokens.colors.border}` }}>
          <Typography sx={{ fontWeight: 600, fontSize: '1.125rem' }}>
            Next Steps
          </Typography>
        </Box>
        {[
          { title: 'Dice Types', desc: 'Learn about D4, D6, D8, D10, D12, and D20', path: '/help/guide/dice' },
          { title: 'Combat System', desc: 'Master the art of dice combat', path: '/help/guide/combat' },
          { title: 'Explore Domains', desc: 'Discover the 8 realms of the Diepedia', path: '/wiki/domains' },
        ].map((item, i, arr) => (
          <Box
            key={item.title}
            component={RouterLink}
            to={item.path}
            sx={{
              display: 'block',
              px: 3,
              py: 2.5,
              textDecoration: 'none',
              color: 'inherit',
              borderBottom: i < arr.length - 1 ? `1px solid ${tokens.colors.border}` : 'none',
              '&:hover': { bgcolor: tokens.colors.background.elevated },
            }}
          >
            <Typography sx={{ fontWeight: 500, mb: 0.5, color: tokens.colors.secondary }}>
              {item.title}
            </Typography>
            <Typography variant="body2" sx={{ color: tokens.colors.text.secondary }}>
              {item.desc}
            </Typography>
          </Box>
        ))}
      </Paper>
    </Box>
  );
}
