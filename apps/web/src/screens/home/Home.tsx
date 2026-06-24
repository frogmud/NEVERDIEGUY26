/**
 * Home - landing route (`/`).
 *
 * Picks one of two experiences:
 * - NewGuyHome: the stripped first-time / mobile launcher (Figma `28:6` / `47:41`).
 * - HomeDashboard: the rich returning-user dashboard (2-col + Eternal Stream).
 *
 * Selection (see `homeView` in GameSettingsContext):
 * - Mobile always uses New Guy (the dashboard's 2-col + Eternal Stream doesn't fit
 *   yet - that placement is still being designed).
 * - Otherwise honour an explicit preference; in 'auto', new/first-time users get
 *   New Guy and returning users get the dashboard.
 *
 * NEVER DIE GUY
 */

import { useMemo } from 'react';
import { Box } from '@mui/material';
import { tokens } from '../../theme';
import { HomeDashboard } from '../../components/HomeDashboard';
import { NewGuyHome } from './NewGuyHome';
import { useGameSettings } from '../../contexts/GameSettingsContext';
import { useIsMobile } from '../../components/ds';
import { isReturningPlayer } from '../../data/player/storage';

export function Home() {
  const { homeView } = useGameSettings();
  const isMobile = useIsMobile();

  // A "returning" player has a resumable run or completed-run history.
  const isReturning = useMemo(() => isReturningPlayer(), []);

  // Mobile always gets the launcher; otherwise honor the preference. 'dashboard'
  // (and 'auto' for a returning player) falls through to the dashboard below.
  const showNewGuy =
    isMobile ||
    homeView === 'newguy' ||
    (homeView === 'auto' && !isReturning);

  if (showNewGuy) {
    return <NewGuyHome />;
  }

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
