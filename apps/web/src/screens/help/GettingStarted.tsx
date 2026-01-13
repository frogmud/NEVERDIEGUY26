/**
 * GettingStarted - Basics guide for new players
 */

import { Link as RouterLink } from 'react-router-dom';
import { Box, Typography, Paper, Breadcrumbs, Link as MuiLink } from '@mui/material';
import { NavigateNextSharp as NextIcon } from '@mui/icons-material';
import { tokens } from '../../theme';

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
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Getting Started
        </Typography>
        <Typography variant="body2" sx={{ color: tokens.colors.text.secondary }}>
          Learn the basics
        </Typography>
      </Box>

      {/* Introduction */}
      <Paper sx={{ bgcolor: tokens.colors.background.paper, borderRadius: '20px', p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Welcome to NEVER DIE GUY
        </Typography>
        <Typography variant="body2" sx={{ color: tokens.colors.text.secondary, mb: 2, lineHeight: 1.7 }}>
          NEVER DIE GUY is a roguelike dice game where you throw meteor dice at planets to score points.
          Each run takes you through 6 unique domains with 3 events each. Collect items, discover
          synergies, and aim for high scores.
        </Typography>
        <Typography variant="body2" sx={{ color: tokens.colors.text.secondary, lineHeight: 1.7 }}>
          The game is inspired by Balatro's scoring chains - watch your points build up as items
          trigger effects and multiply your rolls. Part of the fun is discovering which combinations
          work best together.
        </Typography>
      </Paper>

      {/* Core Gameplay */}
      <Paper sx={{ bgcolor: tokens.colors.background.paper, borderRadius: '20px', overflow: 'hidden', mb: 3 }}>
        <Box sx={{ px: 3, py: 2.25, borderBottom: `1px solid ${tokens.colors.border}` }}>
          <Typography sx={{ fontWeight: 600, fontSize: '1.125rem' }}>
            How to Play
          </Typography>
        </Box>
        <Box sx={{ p: 3 }}>
          {[
            { step: '1', title: 'Start a Run', desc: 'Click Play to begin. You start with a hand of dice.' },
            { step: '2', title: 'Throw Dice', desc: 'Select a die and throw it at the planet to score points.' },
            { step: '3', title: 'Hit the Goal', desc: 'Reach the score goal to clear the event.' },
            { step: '4', title: 'Collect Items', desc: 'Visit shops and encounter NPCs to build your loadout.' },
            { step: '5', title: 'Progress', desc: 'Clear 3 events per domain, 6 domains total to win.' },
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
            Tips for New Players
          </Typography>
        </Box>
        <Box sx={{ p: 3 }}>
          <Typography variant="body2" sx={{ color: tokens.colors.text.secondary, mb: 2, lineHeight: 1.7 }}>
            You start with a set of dice ranging from D4 to D20. Lower dice (D4, D6) are more
            consistent but deal less damage. Higher dice (D12, D20) can roll big numbers but are
            riskier. Mix and match based on your items.
          </Typography>
          <Typography variant="body2" sx={{ color: tokens.colors.text.secondary, mb: 2, lineHeight: 1.7 }}>
            Pay attention to item descriptions. Many items trigger effects based on specific
            conditions like "On crit" or "On roll 6+". Building around these synergies is key
            to achieving high scores.
          </Typography>
          <Typography variant="body2" sx={{ color: tokens.colors.text.secondary, lineHeight: 1.7 }}>
            The wiki has detailed information on all items, NPCs, and domains. Use it to plan
            your strategy and learn what each item does before you find it in-game.
          </Typography>
        </Box>
      </Paper>

      {/* Next Steps */}
      <Paper sx={{ bgcolor: tokens.colors.background.paper, borderRadius: '20px', overflow: 'hidden' }}>
        <Box sx={{ px: 3, py: 2.25, borderBottom: `1px solid ${tokens.colors.border}` }}>
          <Typography sx={{ fontWeight: 600, fontSize: '1.125rem' }}>
            Learn More
          </Typography>
        </Box>
        {[
          { title: 'Dice Types', desc: 'Learn about D4, D6, D8, D10, D12, and D20', path: '/help/guide/dice' },
          { title: 'Scoring System', desc: 'How damage and points are calculated', path: '/help/guide/combat' },
          { title: 'Explore Domains', desc: 'Discover the 6 realms', path: '/wiki/domains' },
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
