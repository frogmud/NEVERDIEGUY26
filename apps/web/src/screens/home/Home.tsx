/**
 * Home - Clean homepage implementation following Figma structure
 *
 * Figma-driven responsive layout:
 * - 768px: 18px padding, single column, 732px content width
 * - 1024px: 24px padding, single column, collapsed sidebar
 * - 1280px: 30px padding, two columns, 280px right sidebar
 * - 1440px: 60px padding, two columns, expanded sidebar
 *
 * Shows MarketingLP for signed-out users.
 *
 * NEVER DIE GUY
 */

import { Box, useMediaQuery } from '@mui/material';
import {
  NavCards,
  DailyWiki,
  DailyHits,
  Stats,
  LiveFeed,
  TopBar,
  ActionButtons,
  GameHistory,
  GamesAndChallenges,
} from './components';
import { MarketingLP } from './MarketingLP';
import { useAuth } from '../../contexts/AuthContext';

export function Home() {
  const { hasStartedGame } = useAuth();

  // Show marketing landing page until user starts their first game
  if (!hasStartedGame) {
    return <MarketingLP />;
  }
  // Breakpoints matching Figma
  const is1440 = useMediaQuery('(min-width: 1440px)');
  const is1280 = useMediaQuery('(min-width: 1280px)');
  const is1024 = useMediaQuery('(min-width: 1024px)');

  // Padding based on breakpoint (from Figma)
  const padding = is1440 ? '60px' : is1280 ? '30px' : is1024 ? '24px' : '18px';

  // Two-column layout at 1280px+
  const twoColumn = is1280;

  return (
    <Box sx={{ p: padding, display: 'flex', flexDirection: 'column', gap: 3, maxWidth: '100%', overflowX: 'hidden' }}>
      {/* Row 1: TopBar */}
      <Box sx={{ mb: 1 }}>
        <TopBar />
      </Box>

      {/* Row 2: Action Buttons */}
      <ActionButtons />

      {/* Main content: Two-column at 1280px+ */}
      {twoColumn ? (
        <Box sx={{ display: 'flex', gap: 3 }}>
          {/* Left column */}
          <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <GamesAndChallenges />
            <NavCards />
            <GameHistory />
          </Box>
          {/* Right sidebar */}
          <Box sx={{ width: 320, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <LiveFeed />
            <Stats />
            <DailyHits />
            <DailyWiki />
          </Box>
        </Box>
      ) : (
        /* Single column */
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 }}>
          <GamesAndChallenges />
          <NavCards />
          <GameHistory />
          <LiveFeed />
          <Stats />
          <Box sx={{ display: 'flex', gap: 3 }}>
            <DailyHits />
            <DailyWiki />
          </Box>
        </Box>
      )}
    </Box>
  );
}
