/**
 * CombatSystem - Guide to combat mechanics
 */

import { Link as RouterLink } from 'react-router-dom';
import { Box, Typography, Paper, Breadcrumbs, Link as MuiLink } from '@mui/material';
import { NavigateNextSharp as NextIcon } from '@mui/icons-material';
import { tokens } from '../../theme';
import { AssetImage } from '../../components/ds';

export function CombatSystem() {
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
          Combat System
        </Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <AssetImage src="/illustrations/combat.svg" alt="Combat System" width={64} height={64} fallback="hide" />
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Combat System
          </Typography>
          <Typography variant="body2" sx={{ color: tokens.colors.text.secondary }}>
            How battles work
          </Typography>
        </Box>
      </Box>

      {/* Overview */}
      <Paper sx={{ bgcolor: tokens.colors.background.paper, borderRadius: '20px', p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Combat Overview
        </Typography>
        <Typography variant="body2" sx={{ color: tokens.colors.text.secondary, mb: 2, lineHeight: 1.7 }}>
          Combat in Never Die Guy revolves around throwing dice at a planet where enemies roam.
          Each throw deals damage based on the dice result, modified by your items and active
          effects. The goal is to defeat all enemies before they overwhelm you.
        </Typography>
        <Typography variant="body2" sx={{ color: tokens.colors.text.secondary, lineHeight: 1.7 }}>
          Battles are turn-based at their core, but the throwing mechanic adds real-time skill
          elements. Where your dice lands matters, and chaining hits builds powerful combos.
        </Typography>
      </Paper>

      {/* Damage Calculation */}
      <Paper sx={{ bgcolor: tokens.colors.background.paper, borderRadius: '20px', overflow: 'hidden', mb: 3 }}>
        <Box sx={{ px: 3, py: 2.25, borderBottom: `1px solid ${tokens.colors.border}` }}>
          <Typography sx={{ fontWeight: 600, fontSize: '1.125rem' }}>
            Damage Calculation
          </Typography>
        </Box>
        <Box sx={{ p: 3 }}>
          <Typography variant="body2" sx={{ color: tokens.colors.text.secondary, mb: 2, lineHeight: 1.7 }}>
            When you throw a die, damage is calculated in this order:
          </Typography>

          {[
            { step: 'Base Roll', desc: 'The die face value (e.g., rolling 5 on a D6)' },
            { step: 'Weapon Bonus', desc: 'Flat damage added by equipped weapons' },
            { step: 'Combo Multiplier', desc: 'Bonus from consecutive successful hits' },
            { step: 'Critical Check', desc: 'Max roll triggers critical for 2x damage' },
            { step: 'Enemy Weakness', desc: 'Some enemies take extra damage from certain dice' },
            { step: 'Final Damage', desc: 'Total applied to enemy health' },
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
              <Typography
                sx={{
                  fontFamily: tokens.fonts.gaming,
                  fontSize: '0.75rem',
                  color: tokens.colors.secondary,
                  minWidth: 100,
                }}
              >
                {item.step}
              </Typography>
              <Typography variant="body2" sx={{ color: tokens.colors.text.secondary }}>
                {item.desc}
              </Typography>
            </Box>
          ))}
        </Box>
      </Paper>

      {/* Combos */}
      <Paper sx={{ bgcolor: tokens.colors.background.paper, borderRadius: '20px', overflow: 'hidden', mb: 3 }}>
        <Box sx={{ px: 3, py: 2.25, borderBottom: `1px solid ${tokens.colors.border}` }}>
          <Typography sx={{ fontWeight: 600, fontSize: '1.125rem' }}>
            Combo System
          </Typography>
        </Box>
        <Box sx={{ p: 3 }}>
          <Typography variant="body2" sx={{ color: tokens.colors.text.secondary, mb: 2, lineHeight: 1.7 }}>
            Consecutive hits build your combo meter. The higher your combo, the more damage
            each subsequent hit deals. Missing a throw or taking damage resets your combo.
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, mb: 2 }}>
            {[
              { combo: 'x1', mult: '1.0x', color: tokens.colors.text.secondary },
              { combo: 'x3', mult: '1.2x', color: tokens.colors.rarity.uncommon },
              { combo: 'x5', mult: '1.5x', color: tokens.colors.rarity.rare },
              { combo: 'x10', mult: '2.0x', color: tokens.colors.rarity.legendary },
            ].map((item) => (
              <Box
                key={item.combo}
                sx={{
                  bgcolor: tokens.colors.background.elevated,
                  borderRadius: 2,
                  p: 1.5,
                  textAlign: 'center',
                }}
              >
                <Typography sx={{ fontFamily: tokens.fonts.gaming, fontSize: '0.75rem', color: item.color, mb: 0.5 }}>
                  {item.combo}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {item.mult}
                </Typography>
              </Box>
            ))}
          </Box>

          <Typography variant="body2" sx={{ color: tokens.colors.text.secondary, lineHeight: 1.7 }}>
            Pro tip: Use fast D4s to build combos quickly, then switch to high-damage dice
            like D12 or D20 to capitalize on the multiplier.
          </Typography>
        </Box>
      </Paper>

      {/* Enemy Patterns */}
      <Paper sx={{ bgcolor: tokens.colors.background.paper, borderRadius: '20px', overflow: 'hidden', mb: 3 }}>
        <Box sx={{ px: 3, py: 2.25, borderBottom: `1px solid ${tokens.colors.border}` }}>
          <Typography sx={{ fontWeight: 600, fontSize: '1.125rem' }}>
            Enemy Patterns
          </Typography>
        </Box>
        <Box sx={{ p: 3 }}>
          <Typography variant="body2" sx={{ color: tokens.colors.text.secondary, mb: 2, lineHeight: 1.7 }}>
            Enemies on the planet move in predictable patterns. Learning these patterns helps
            you land hits more consistently. Each enemy type has unique behaviors:
          </Typography>

          {[
            { type: 'Roamers', desc: 'Move slowly across the planet surface. Easy targets.' },
            { type: 'Lurkers', desc: 'Stay in one spot until provoked, then dash away.' },
            { type: 'Swarmer', desc: 'Travel in groups. Hit one to scatter the rest.' },
            { type: 'Bosses', desc: 'Have multiple phases with different attack patterns.' },
          ].map((item, i, arr) => (
            <Box
              key={item.type}
              sx={{
                pb: i < arr.length - 1 ? 1.5 : 0,
                mb: i < arr.length - 1 ? 1.5 : 0,
                borderBottom: i < arr.length - 1 ? `1px solid ${tokens.colors.border}` : 'none',
              }}
            >
              <Typography sx={{ fontWeight: 500, mb: 0.5, color: tokens.colors.secondary }}>
                {item.type}
              </Typography>
              <Typography variant="body2" sx={{ color: tokens.colors.text.secondary }}>
                {item.desc}
              </Typography>
            </Box>
          ))}
        </Box>
      </Paper>

      {/* Related */}
      <Paper sx={{ bgcolor: tokens.colors.background.paper, borderRadius: '20px', overflow: 'hidden' }}>
        <Box sx={{ px: 3, py: 2.25, borderBottom: `1px solid ${tokens.colors.border}` }}>
          <Typography sx={{ fontWeight: 600, fontSize: '1.125rem' }}>
            Learn More
          </Typography>
        </Box>
        {[
          { title: 'Dice Types', desc: 'Understanding your weapons', path: '/help/guide/dice' },
          { title: 'Enemies', desc: 'Full bestiary in the Diepedia', path: '/wiki/enemies' },
          { title: 'Items', desc: 'Gear to enhance your combat power', path: '/wiki/items' },
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
