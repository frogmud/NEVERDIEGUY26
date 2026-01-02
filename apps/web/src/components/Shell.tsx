import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Box, Container, useMediaQuery } from '@mui/material';
import { tokens } from '../theme';
import { AppSidebar } from './layout/AppSidebar';
import { AppTopbar } from './layout/AppTopbar';
import { AppFooter } from './layout/AppFooter';
import { BackToTop } from './BackToTop';
import { DRAWER_WIDTH_EXPANDED } from './layout/navItems';

export function Shell() {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [manualCollapse, setManualCollapse] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(max-width: 1024px)');
  const location = useLocation();

  // Sidebar collapses to icon-only at 1024px and below (when not mobile), or when manually collapsed
  const sidebarExpanded = !isTablet && !manualCollapse;

  // Play routes need full height without footer and full width without Container
  const isPlayRoute = location.pathname.startsWith('/play');

  return (
    <Box sx={{ display: 'flex', width: '100%' }}>
      {/* Sidebar - hidden on mobile */}
      <AppSidebar
        expanded={sidebarExpanded}
        mobileOpen={mobileDrawerOpen}
        onMobileClose={() => setMobileDrawerOpen(false)}
        onToggleExpand={() => setManualCollapse(!manualCollapse)}
        isMobile={isMobile}
      />

      {/* Main content area */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
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
            p: isPlayRoute ? 0 : (isMobile ? 0 : 3),
            backgroundColor: tokens.colors.background.default,
            overflow: isPlayRoute ? 'hidden' : 'auto',
            position: 'relative',
            // PlayHub needs full height - don't constrain
            minHeight: isPlayRoute ? 0 : undefined,
          }}
        >
          {isPlayRoute ? (
            // Full-width, full-height for PlayHub canvas
            <Box sx={{ width: '100%', height: '100%' }}>
              <Outlet />
            </Box>
          ) : (
            <Container maxWidth="xl" disableGutters>
              <Outlet />
            </Container>
          )}
        </Box>

        {/* Footer - hidden on PlayHub for full-height canvas */}
        {!isPlayRoute && <AppFooter />}
      </Box>

      {/* Back to top button */}
      <BackToTop />
    </Box>
  );
}
