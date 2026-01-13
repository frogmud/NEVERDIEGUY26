/**
 * CombatSystem - Guide to core mechanics
 */

import { Link as RouterLink } from 'react-router-dom';
import { Box, Typography, Paper, Breadcrumbs, Link as MuiLink } from '@mui/material';
import { NavigateNextSharp as NextIcon } from '@mui/icons-material';
import { tokens } from '../../theme';

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
          Scoring System
        </Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Scoring System
        </Typography>
        <Typography variant="body2" sx={{ color: tokens.colors.text.secondary }}>
          How damage and points work
        </Typography>
      </Box>

      {/* Overview */}
      <Paper sx={{ bgcolor: tokens.colors.background.paper, borderRadius: '20px', p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Overview
        </Typography>
        <Typography variant="body2" sx={{ color: tokens.colors.text.secondary, mb: 2, lineHeight: 1.7 }}>
          In NEVER DIE GUY, you throw dice meteors at a planet to deal damage and score points.
          Each throw is calculated based on your dice roll, modified by items and triggered effects.
          Hit score goals to clear events and progress through domains.
        </Typography>
        <Typography variant="body2" sx={{ color: tokens.colors.text.secondary, lineHeight: 1.7 }}>
          The game uses a Balatro-inspired approach where item synergies and triggered effects
          ("procs") create satisfying chains of bonuses. Part of the fun is discovering which
          combinations work well together.
        </Typography>
      </Paper>

      {/* Damage Calculation */}
      <Paper sx={{ bgcolor: tokens.colors.background.paper, borderRadius: '20px', overflow: 'hidden', mb: 3 }}>
        <Box sx={{ px: 3, py: 2.25, borderBottom: `1px solid ${tokens.colors.border}` }}>
          <Typography sx={{ fontWeight: 600, fontSize: '1.125rem' }}>
            Score Calculation
          </Typography>
        </Box>
        <Box sx={{ p: 3 }}>
          <Typography variant="body2" sx={{ color: tokens.colors.text.secondary, mb: 2, lineHeight: 1.7 }}>
            When you throw a die, your score is calculated in phases:
          </Typography>

          {[
            { step: 'Base Roll', desc: 'The die face value (e.g., rolling 5 on a D6)' },
            { step: 'Flat Bonuses', desc: 'Items that add flat damage to your roll' },
            { step: 'Multipliers', desc: 'Items and effects that multiply your total' },
            { step: 'Critical Check', desc: 'Rolling max triggers critical for bonus damage' },
            { step: 'Procs', desc: 'Triggered effects from items activate in sequence' },
            { step: 'Final Score', desc: 'Total points added to your event score' },
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

      {/* Procs and Effects */}
      <Paper sx={{ bgcolor: tokens.colors.background.paper, borderRadius: '20px', overflow: 'hidden', mb: 3 }}>
        <Box sx={{ px: 3, py: 2.25, borderBottom: `1px solid ${tokens.colors.border}` }}>
          <Typography sx={{ fontWeight: 600, fontSize: '1.125rem' }}>
            Procs and Effects
          </Typography>
        </Box>
        <Box sx={{ p: 3 }}>
          <Typography variant="body2" sx={{ color: tokens.colors.text.secondary, mb: 2, lineHeight: 1.7 }}>
            Items can trigger special effects ("procs") based on certain conditions. These appear
            beat-by-beat as your score builds up, so you can see exactly what contributed to your total.
          </Typography>

          {[
            { type: 'On Roll', desc: 'Triggers when you roll certain values (e.g., "On 6+")' },
            { type: 'On Crit', desc: 'Triggers when you roll the maximum value on a die' },
            { type: 'On Throw', desc: 'Triggers every time you throw, regardless of roll' },
            { type: 'Conditional', desc: 'Triggers based on game state (e.g., "If Gold > 100")' },
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

      {/* Dice Strategy */}
      <Paper sx={{ bgcolor: tokens.colors.background.paper, borderRadius: '20px', overflow: 'hidden', mb: 3 }}>
        <Box sx={{ px: 3, py: 2.25, borderBottom: `1px solid ${tokens.colors.border}` }}>
          <Typography sx={{ fontWeight: 600, fontSize: '1.125rem' }}>
            Dice Strategy
          </Typography>
        </Box>
        <Box sx={{ p: 3 }}>
          <Typography variant="body2" sx={{ color: tokens.colors.text.secondary, mb: 2, lineHeight: 1.7 }}>
            Each die type has different strengths. Mix and match to find your style:
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, mb: 2 }}>
            {[
              { die: 'D4-D6', trait: 'Consistent', color: tokens.colors.rarity.common },
              { die: 'D8-D12', trait: 'Balanced', color: tokens.colors.rarity.uncommon },
              { die: 'D20', trait: 'High Risk/Reward', color: tokens.colors.rarity.legendary },
            ].map((item) => (
              <Box
                key={item.die}
                sx={{
                  bgcolor: tokens.colors.background.elevated,
                  borderRadius: 2,
                  p: 1.5,
                  textAlign: 'center',
                }}
              >
                <Typography sx={{ fontFamily: tokens.fonts.gaming, fontSize: '0.75rem', color: item.color, mb: 0.5 }}>
                  {item.die}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.7rem' }}>
                  {item.trait}
                </Typography>
              </Box>
            ))}
          </Box>

          <Typography variant="body2" sx={{ color: tokens.colors.text.secondary, lineHeight: 1.7 }}>
            Pro tip: Some items synergize with specific dice. Check item descriptions for bonuses
            like "D20 throws deal +5 damage" or "D4 throws have 20% crit chance."
          </Typography>
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
          { title: 'Items', desc: 'Gear to enhance your scoring power', path: '/wiki/items' },
          { title: 'Domains', desc: 'The worlds you explore', path: '/wiki/domains' },
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
