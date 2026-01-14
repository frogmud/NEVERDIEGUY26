/**
 * DiceTypes - Guide to all dice types in the game
 */

import { Link as RouterLink } from 'react-router-dom';
import { Box, Typography, Paper, Breadcrumbs, Link as MuiLink } from '@mui/material';
import { NavigateNextSharp as NextIcon } from '@mui/icons-material';
import { tokens } from '../../theme';

interface DiceInfo {
  name: string;
  sides: number;
  damage: string;
  description: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

const diceTypes: DiceInfo[] = [
  {
    name: 'D4',
    sides: 4,
    damage: '1-4',
    description: 'The humble pyramid. Low damage but fast throws. Great for building combos.',
    rarity: 'common',
  },
  {
    name: 'D6',
    sides: 6,
    damage: '1-6',
    description: 'The classic cube. Balanced damage and throw speed. Your reliable workhorse.',
    rarity: 'common',
  },
  {
    name: 'D8',
    sides: 8,
    damage: '1-8',
    description: 'The octahedron. Solid mid-range damage. Popular choice for consistent runs.',
    rarity: 'uncommon',
  },
  {
    name: 'D10',
    sides: 10,
    damage: '1-10',
    description: 'The decahedron. Higher variance but strong potential. Favored by risk-takers.',
    rarity: 'rare',
  },
  {
    name: 'D12',
    sides: 12,
    damage: '1-12',
    description: 'The dodecahedron. Hefty damage with moderate speed. For the ambitious.',
    rarity: 'epic',
  },
  {
    name: 'D20',
    sides: 20,
    damage: '1-20',
    description: 'The icosahedron. Maximum damage potential but slow throws. The ultimate die.',
    rarity: 'legendary',
  },
];

const rarityColors: Record<string, string> = {
  common: tokens.colors.rarity.common,
  uncommon: tokens.colors.rarity.uncommon,
  rare: tokens.colors.rarity.rare,
  epic: tokens.colors.rarity.epic,
  legendary: tokens.colors.rarity.legendary,
};

export function DiceTypes() {
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
          Dice Types
        </Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Dice Types
        </Typography>
        <Typography variant="body2" sx={{ color: tokens.colors.text.secondary }}>
          D4, D6, D8, D10, D12, D20 explained
        </Typography>
      </Box>

      {/* Introduction */}
      <Paper sx={{ bgcolor: tokens.colors.background.paper, borderRadius: '20px', p: 3, mb: 3 }}>
        <Typography variant="body2" sx={{ color: tokens.colors.text.secondary, lineHeight: 1.7 }}>
          Dice are your primary weapons in Never Die Guy. Each die type has different damage
          ranges, throw speeds, and rarities. Build your loadout strategically to maximize
          damage and survive longer runs.
        </Typography>
      </Paper>

      {/* Dice Grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2, mb: 3 }}>
        {diceTypes.map((die) => (
          <Paper
            key={die.name}
            sx={{
              bgcolor: tokens.colors.background.paper,
              borderRadius: '20px',
              overflow: 'hidden',
              border: `2px solid ${rarityColors[die.rarity]}`,
            }}
          >
            <Box
              sx={{
                px: 2,
                py: 1.5,
                bgcolor: tokens.colors.background.elevated,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Typography sx={{ fontWeight: 600, fontFamily: tokens.fonts.gaming }}>
                  {die.name}
                </Typography>
              </Box>
              <Typography
                sx={{
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  color: rarityColors[die.rarity],
                }}
              >
                {die.rarity}
              </Typography>
            </Box>
            <Box sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                <Typography variant="body2" sx={{ color: tokens.colors.text.secondary }}>
                  Sides
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {die.sides}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                <Typography variant="body2" sx={{ color: tokens.colors.text.secondary }}>
                  Damage Range
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500, color: tokens.colors.primary }}>
                  {die.damage}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: tokens.colors.text.secondary, lineHeight: 1.6 }}>
                {die.description}
              </Typography>
            </Box>
          </Paper>
        ))}
      </Box>

      {/* Tips */}
      <Paper sx={{ bgcolor: tokens.colors.background.paper, borderRadius: '20px', overflow: 'hidden', mb: 3 }}>
        <Box sx={{ px: 3, py: 2.25, borderBottom: `1px solid ${tokens.colors.border}` }}>
          <Typography sx={{ fontWeight: 600, fontSize: '1.125rem' }}>
            Tips & Strategies
          </Typography>
        </Box>
        <Box sx={{ p: 3 }}>
          {[
            { tip: 'Mix dice types for balanced damage and consistent throws.' },
            { tip: 'D4s are great for building combo multipliers quickly.' },
            { tip: 'Save D20s for bosses where high damage spikes matter.' },
            { tip: 'Higher rarity dice often have special effects beyond damage.' },
            { tip: 'Check the Diepedia for synergies between dice and items.' },
          ].map((item, i, arr) => (
            <Typography
              key={i}
              variant="body2"
              sx={{
                color: tokens.colors.text.secondary,
                pb: i < arr.length - 1 ? 1.5 : 0,
                mb: i < arr.length - 1 ? 1.5 : 0,
                borderBottom: i < arr.length - 1 ? `1px solid ${tokens.colors.border}` : 'none',
                lineHeight: 1.6,
              }}
            >
              {item.tip}
            </Typography>
          ))}
        </Box>
      </Paper>

      {/* Related */}
      <Paper sx={{ bgcolor: tokens.colors.background.paper, borderRadius: '20px', overflow: 'hidden' }}>
        <Box sx={{ px: 3, py: 2.25, borderBottom: `1px solid ${tokens.colors.border}` }}>
          <Typography sx={{ fontWeight: 600, fontSize: '1.125rem' }}>
            Related Guides
          </Typography>
        </Box>
        {[
          { title: 'Getting Started', desc: 'Learn the basics of dice combat', path: '/help/guide/basics' },
          { title: 'Combat System', desc: 'Master throws, combos, and specials', path: '/help/guide/combat' },
          { title: 'Items & Equipment', desc: 'Gear that enhances your dice', path: '/wiki/items' },
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
