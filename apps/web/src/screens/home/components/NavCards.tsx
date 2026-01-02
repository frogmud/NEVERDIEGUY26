/**
 * NavCards - Navigation card grid
 *
 * Quick-access cards for Market, Arena, and History
 */

import { Box, Paper, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { tokens } from '../../../theme';
import { AssetImage } from '../../../components/ds';

const NAV_CARDS = [
  { title: 'Market', icon: '/illustrations/market.svg', path: '/shop' },
  { title: 'Arena', icon: '/illustrations/arenas.svg', path: '/play' },
  { title: 'History', icon: '/illustrations/stats.svg', path: '/history' },
];

export function NavCards() {
  const navigate = useNavigate();

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.5 }}>
      {NAV_CARDS.map((card) => (
        <Paper
          key={card.title}
          elevation={0}
          onClick={() => navigate(card.path)}
          sx={{
            bgcolor: tokens.colors.background.paper,
            borderRadius: '30px',
            py: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1,
            cursor: 'pointer',
            boxShadow: '0px 3px 1px 0px rgba(0,0,0,0.5)',
            '&:hover': { bgcolor: tokens.colors.background.elevated },
          }}
        >
          <AssetImage
            src={card.icon}
            alt={card.title}
            width={80}
            height={80}
            fallback="hide"
          />
          <Typography sx={{ fontFamily: tokens.fonts.gaming, fontSize: '2rem' }}>
            {card.title}
          </Typography>
        </Paper>
      ))}
    </Box>
  );
}
