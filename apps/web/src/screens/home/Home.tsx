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

// Generate a random 5-digit player number
function generatePlayerNumber(): string {
  return String(Math.floor(10000 + Math.random() * 90000));
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
          fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.5rem' },
          color: tokens.colors.text.secondary,
          mb: 3,
          letterSpacing: '0.05em',
        }}
      >
        welcome neverdieguy#{playerNumber}
      </Typography>

      <HomeChatter />
    </Box>
  );
}
