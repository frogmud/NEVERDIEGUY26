import { Box, AppBar, Toolbar, IconButton, Typography } from '@mui/material';
import { MenuSharp as MenuIcon } from '@mui/icons-material';
import { tokens } from '../../theme';
import { HEADER_HEIGHT } from './navItems';

interface AppTopbarProps {
  isMobile?: boolean;
  onMenuClick?: () => void;
}

/**
 * AppTopbar - Minimal top bar for mobile only
 *
 * Chrome (Search, Settings, Help) has been moved to AppSidebar.
 * Desktop: No top bar needed (sidebar has everything)
 * Mobile: Hamburger menu + centered logo
 */
export function AppTopbar({ isMobile = false, onMenuClick }: AppTopbarProps) {
  // Only render on mobile
  if (!isMobile) {
    return null;
  }

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: tokens.colors.background.default,
        borderBottom: `1px solid ${tokens.colors.border}`,
        zIndex: 1100,
        pointerEvents: 'auto',
      }}
    >
      <Toolbar
        sx={{ gap: 2, minHeight: `${HEADER_HEIGHT}px !important`, height: HEADER_HEIGHT, px: 2 }}
      >
        {/* Hamburger menu */}
        <IconButton onClick={onMenuClick} sx={{ color: tokens.colors.text.primary }}>
          <MenuIcon />
        </IconButton>

        {/* Center logo and brand */}
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
          <Box
            component="img"
            src="/logos/ndg-skull-dome.svg"
            alt="NDG"
            sx={{ width: 24, height: 28 }}
          />
          <Typography
            sx={{
              fontFamily: tokens.fonts.gaming,
              fontSize: '0.85rem',
              color: tokens.colors.text.primary,
            }}
          >
            NEVERDIEGUY
          </Typography>
        </Box>

        {/* Spacer for balance */}
        <Box sx={{ width: 40 }} />
      </Toolbar>
    </AppBar>
  );
}
