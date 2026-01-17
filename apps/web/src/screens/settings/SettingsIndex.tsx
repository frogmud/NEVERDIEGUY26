/**
 * SettingsIndex - Settings hub with right-side sections nav (Wiki pattern)
 *
 * Categories:
 * - Controls: Dice preview and keyboard mapping
 * - Audio: Sound effects and volume
 * - Accessibility: Reduced motion, large text
 */

import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Typography, useMediaQuery, useTheme, Drawer, IconButton, Breadcrumbs, Link as MuiLink } from '@mui/material';
import { MenuSharp as MenuIcon, ChevronLeftSharp as BackIcon, NavigateNextSharp as NextIcon } from '@mui/icons-material';
import { tokens } from '../../theme';

// Section components
import { BoardAndPiecesSection } from './sections/BoardAndPieces';
import { AudioSection } from './sections/Audio';
import { AccessibilitySection } from './sections/Accessibility';

// ============================================
// Types
// ============================================

type SettingsCategory =
  | 'controls'
  | 'audio'
  | 'accessibility';

interface CategoryConfig {
  id: SettingsCategory;
  label: string;
}

// ============================================
// Category Config
// ============================================

const categories: CategoryConfig[] = [
  { id: 'controls', label: 'Controls' },
  { id: 'audio', label: 'Audio' },
  { id: 'accessibility', label: 'Accessibility' },
];

// ============================================
// Component
// ============================================

export function SettingsIndex() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [activeCategory, setActiveCategory] = useState<SettingsCategory>('controls');
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const handleCategoryClick = (category: CategoryConfig) => {
    setActiveCategory(category.id);
    setMobileDrawerOpen(false);
  };

  // Render the active section
  const renderSection = () => {
    switch (activeCategory) {
      case 'controls':
        return <BoardAndPiecesSection />;
      case 'audio':
        return <AudioSection />;
      case 'accessibility':
        return <AccessibilitySection />;
      default:
        return <BoardAndPiecesSection />;
    }
  };

  // Right-side sections nav (wiki pattern)
  const sectionsNav = (
    <Box
      sx={{
        position: { md: 'sticky' },
        top: { md: 80 },
      }}
    >
      <Typography variant="subtitle2" sx={{ mb: 2, color: tokens.colors.text.secondary }}>
        Sections
      </Typography>
      {categories.map((category) => (
        <Typography
          key={category.id}
          variant="body2"
          onClick={() => handleCategoryClick(category)}
          sx={{
            color: activeCategory === category.id ? tokens.colors.text.primary : tokens.colors.secondary,
            fontWeight: activeCategory === category.id ? 600 : 400,
            cursor: 'pointer',
            mb: 1,
            '&:hover': { textDecoration: 'underline' },
            '&:last-child': { mb: 0 },
          }}
        >
          {category.label}
        </Typography>
      ))}
    </Box>
  );

  // Mobile drawer content
  const drawerContent = (
    <Box sx={{ py: 2 }}>
      {categories.map((category) => (
        <Box
          key={category.id}
          onClick={() => handleCategoryClick(category)}
          sx={{
            px: 3,
            py: 1.5,
            cursor: 'pointer',
            bgcolor: activeCategory === category.id ? tokens.colors.background.elevated : 'transparent',
            '&:hover': { bgcolor: tokens.colors.background.elevated },
          }}
        >
          <Typography
            sx={{
              fontSize: '0.9rem',
              fontWeight: activeCategory === category.id ? 600 : 400,
              color: activeCategory === category.id ? tokens.colors.text.primary : tokens.colors.text.secondary,
            }}
          >
            {category.label}
          </Typography>
        </Box>
      ))}
    </Box>
  );

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* Mobile Header */}
      {isMobile && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            mb: 3,
          }}
        >
          <IconButton size="small" onClick={() => setMobileDrawerOpen(true)}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {categories.find(c => c.id === activeCategory)?.label || 'Settings'}
          </Typography>
        </Box>
      )}

      {/* Mobile Drawer */}
      {isMobile && (
        <Drawer
          open={mobileDrawerOpen}
          onClose={() => setMobileDrawerOpen(false)}
          PaperProps={{
            sx: {
              width: 260,
              bgcolor: tokens.colors.background.paper,
            },
          }}
        >
          <Box
            sx={{
              p: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              borderBottom: `1px solid ${tokens.colors.border}`,
            }}
          >
            <IconButton size="small" onClick={() => setMobileDrawerOpen(false)}>
              <BackIcon />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Settings
            </Typography>
          </Box>
          {drawerContent}
        </Drawer>
      )}

      {/* Main Layout - Content left, Sections right */}
      <Box
        sx={{
          display: 'flex',
          gap: 4,
          flexDirection: { xs: 'column', md: 'row' },
          maxWidth: 900,
          mx: 'auto',
        }}
      >
        {/* Main Content */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* Breadcrumbs */}
          <Breadcrumbs
            separator={<NextIcon fontSize="small" sx={{ color: tokens.colors.text.disabled }} />}
            sx={{ mb: 3 }}
          >
            <MuiLink
              component={RouterLink}
              to="/"
              sx={{
                color: tokens.colors.secondary,
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              Home
            </MuiLink>
            <Typography color="text.primary" sx={{ fontSize: '0.875rem' }}>
              Settings
            </Typography>
          </Breadcrumbs>

          {renderSection()}
        </Box>

        {/* Right Sidebar - Sections Nav (desktop only) */}
        {!isMobile && (
          <Box sx={{ width: 160, flexShrink: 0 }}>
            {sectionsNav}
          </Box>
        )}
      </Box>
    </Box>
  );
}
