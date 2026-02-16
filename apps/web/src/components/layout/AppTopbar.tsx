import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, AppBar, Toolbar, IconButton, Typography } from '@mui/material';
import { MenuSharp as MenuIcon } from '@mui/icons-material';
import { tokens } from '../../theme';
import { HEADER_HEIGHT } from './navItems';
import { useSoundContext } from '../../contexts/SoundContext';

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
  const navigate = useNavigate();
  const location = useLocation();
  const { playUIClick } = useSoundContext();
  const [skullLoading, setSkullLoading] = useState(false);
  useEffect(() => { setSkullLoading(false); }, [location.pathname]);

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
        <Box
          onClick={() => { playUIClick(); setSkullLoading(true); navigate('/'); }}
          sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, cursor: 'pointer' }}
        >
          <Box
            component="img"
            src="/logos/ndg-skull-dome.svg"
            alt="NDG"
            sx={{
              width: 24,
              height: 28,
              ...(skullLoading && {
                animation: 'ndg-pulse 1.5s ease-in-out infinite',
                '@keyframes ndg-pulse': {
                  '0%, 100%': { opacity: 0.4 },
                  '50%': { opacity: 1 },
                },
              }),
            }}
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
