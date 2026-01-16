/**
 * Home - Character Chatter Landing Page
 *
 * Random NPC greets the player on each load.
 * Every incarnation is a new Guy meeting these NPCs for the first time.
 *
 * NEVER DIE GUY
 */

import { useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import { tokens } from '../../theme';
import { HomeChatter } from '../../components/HomeChatter';

// Generate a random 9-digit player number (zero-padded)
function generatePlayerNumber(): string {
  const num = Math.floor(1 + Math.random() * 999999999);
  return String(num).padStart(9, '0');
}

export function Home() {
  // Generate player number once on mount
  const playerNumber = useMemo(() => generatePlayerNumber(), []);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        bgcolor: tokens.colors.background.default,
      }}
    >
      {/* Welcome message */}
      <Typography
        sx={{
          fontFamily: tokens.fonts.gaming,
          fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2.1rem' },
          color: tokens.colors.text.secondary,
          mb: 4,
          letterSpacing: '0.05em',
        }}
      >
        welcome neverdieguy#{playerNumber}
      </Typography>

      <HomeChatter />
    </Box>
  );
}
