import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Box, Container } from '@mui/material';
import { tokens } from '../theme';
import { AppSidebar } from './layout/AppSidebar';
import { AppTopbar } from './layout/AppTopbar';
import { AppFooter } from './layout/AppFooter';
import { BottomNav, BOTTOM_NAV_HEIGHT } from './layout/BottomNav';
import { useIsMobile, useIsTablet } from './ds';
import { BackToTop } from './BackToTop';
import { DRAWER_WIDTH_EXPANDED, DRAWER_WIDTH_COLLAPSED } from './layout/navItems';

// Context for child components to know sidebar state
export interface ShellContext {
  sidebarExpanded: boolean;
  sidebarWidth: number;
}

export function Shell() {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [manualCollapse, setManualCollapse] = useState(false);
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const location = useLocation();

  // Sidebar collapses to icon-only at 1024px and below (when not mobile), or when manually collapsed
  const sidebarExpanded = !isTablet && !manualCollapse;
  const sidebarWidth = isMobile ? 0 : (sidebarExpanded ? DRAWER_WIDTH_EXPANDED : DRAWER_WIDTH_COLLAPSED);

  // Context for child routes
  const shellContext: ShellContext = { sidebarExpanded, sidebarWidth };

  // Play routes need full height without footer and full width without Container
  const isPlayRoute = location.pathname.startsWith('/play');
  // Homepage hides footer (has fixed chat input at bottom)
  const isHomepage = location.pathname === '/';

  return (
    <Box sx={{ display: 'flex', width: '100%', position: 'relative' }}>
      {/* Sidebar - hidden on mobile */}
      <AppSidebar
        expanded={sidebarExpanded}
        mobileOpen={mobileDrawerOpen}
        onMobileClose={() => setMobileDrawerOpen(false)}
        onToggleExpand={() => setManualCollapse(!manualCollapse)}
        isMobile={isMobile}
      />

      {/* Main content area */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          // Play routes need viewport height constraint. dvh (dynamic viewport
          // height) so mobile browser chrome doesn't clip the immersive screens.
          height: isPlayRoute ? '100dvh' : 'auto',
          maxHeight: isPlayRoute ? '100dvh' : undefined,
        }}
      >
        {/* Top bar */}
        <AppTopbar
          isMobile={isMobile}
          onMenuClick={() => setMobileDrawerOpen(true)}
        />

        {/* Page content */}
        <Box
          component="main"
          sx={{
            flex: 1,
            // Mobile (non-play) gets a small gutter + bottom clearance so content
            // isn't hidden behind the fixed BottomNav overlaying the viewport.
            px: isPlayRoute ? 0 : (isMobile ? 2 : 3),
            pt: isPlayRoute ? 0 : (isMobile ? 2 : 3),
            pb: isPlayRoute
              ? 0
              : isMobile
                ? `calc(${BOTTOM_NAV_HEIGHT}px + env(safe-area-inset-bottom) + 8px)`
                : 3,
            backgroundColor: tokens.colors.background.default,
            overflow: isPlayRoute ? 'hidden' : 'auto',
            position: 'relative',
            minHeight: 0,
          }}
        >
          {isPlayRoute ? (
            // Full-width, full-height for PlayHub canvas
            <Box sx={{ width: '100%', height: '100%', minHeight: 0 }}>
              <Outlet context={shellContext} />
            </Box>
          ) : (
            <Container maxWidth="xl" disableGutters>
              <Outlet context={shellContext} />
            </Container>
          )}
        </Box>

        {/* Footer - hidden on PlayHub, Homepage, and mobile (BottomNav replaces it) */}
        {!isPlayRoute && !isHomepage && !isMobile && <AppFooter />}
      </Box>

      {/* Mobile bottom tab bar - browse routes only (hidden on immersive /play) */}
      {isMobile && !isPlayRoute && <BottomNav />}

      {/* Back to top button */}
      <BackToTop />
    </Box>
  );
}
