/**
 * Home - Character Chatter Landing Page
 *
 * Random NPC greets the player on each load.
 * Every incarnation is a new Guy meeting these NPCs for the first time.
 *
 * NEVER DIE GUY
 */

import { Box } from '@mui/material';
import { tokens } from '../../theme';
import { HomeChatter } from '../../components/HomeChatter';

export function Home() {
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
      <HomeChatter />
    </Box>
  );
}
