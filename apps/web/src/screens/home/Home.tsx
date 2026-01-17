/**
 * Home - Dashboard Landing Page
 *
 * 2-column layout: NPC stream (left) | Actions + Info (right)
 * NPCs chat in a stream, questions queue via buttons, answers appear in feed.
 *
 * NEVER DIE GUY
 */

import { Box } from '@mui/material';
import { tokens } from '../../theme';
import { HomeDashboard } from '../../components/HomeDashboard';
// Legacy: import { HomeChatter } from '../../components/HomeChatter';

export function Home() {
  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: tokens.colors.background.default,
      }}
    >
      <HomeDashboard />
    </Box>
  );
}
