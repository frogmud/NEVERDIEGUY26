/**
 * HelpCenter - Help hub with right-side sections nav (Wiki pattern)
 */

import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, useMediaQuery, useTheme, Drawer, IconButton, Breadcrumbs, Link as MuiLink } from '@mui/material';
import { MenuSharp as MenuIcon, ChevronLeftSharp as BackIcon, NavigateNextSharp as NextIcon } from '@mui/icons-material';
import { tokens } from '../../theme';

// ============================================
// Types & Config
// ============================================

type HelpSection = 'guide' | 'faq' | 'contact' | 'shortcuts';

interface SectionConfig {
  id: HelpSection;
  label: string;
}

const sections: SectionConfig[] = [
  { id: 'guide', label: 'Game Guide' },
  { id: 'faq', label: 'FAQ' },
  { id: 'contact', label: 'Contact' },
  { id: 'shortcuts', label: 'Shortcuts' },
];

// ============================================
// Section Components
// ============================================

function GameGuideSection() {
  const navigate = useNavigate();

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
        Game Guide
      </Typography>

      <Paper sx={{ bgcolor: tokens.colors.background.paper, borderRadius: '20px', overflow: 'hidden', mb: 3 }}>
        {[
          { title: 'Getting Started', desc: 'Learn the basics of dice combat', path: '/help/guide/basics' },
          { title: 'Dice Types', desc: 'D4, D6, D8, D10, D12, D20 explained', path: '/help/guide/dice' },
          { title: 'Combat System', desc: 'How battles work', path: '/help/guide/combat' },
          { title: 'Domains', desc: 'Explore the 6 realms', path: '/wiki/domains' },
          { title: 'Items & Equipment', desc: 'Gear up for battle', path: '/wiki/items' },
        ].map((item, i, arr) => (
          <Box
            key={item.title}
            onClick={() => navigate(item.path)}
            sx={{
              px: 3,
              py: 2.5,
              cursor: 'pointer',
              borderBottom: i < arr.length - 1 ? `1px solid ${tokens.colors.border}` : 'none',
              '&:hover': { bgcolor: tokens.colors.background.elevated },
            }}
          >
            <Typography sx={{ fontWeight: 500, mb: 0.5 }}>{item.title}</Typography>
            <Typography variant="body2" sx={{ color: tokens.colors.text.secondary }}>
              {item.desc}
            </Typography>
          </Box>
        ))}
      </Paper>
    </Box>
  );
}

function FAQSection() {
  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
        Frequently Asked Questions
      </Typography>

      <Paper sx={{ bgcolor: tokens.colors.background.paper, borderRadius: '20px', overflow: 'hidden' }}>
        {[
          { q: 'How do I start a new game?', a: 'Click "Play" from the homepage to start a new run.' },
          { q: 'What happens when I lose?', a: 'Your run ends and you start fresh. Part of the roguelike fun!' },
          { q: 'How do dice types work?', a: 'D4 is consistent but low damage, D20 is high risk/reward. Mix and match.' },
          { q: 'What are domains?', a: 'Domains are themed worlds. Clear 3 events per domain, 6 domains total.' },
          { q: 'How do items work?', a: 'Items modify your dice with bonuses and triggered effects. Check the wiki!' },
        ].map((item, i, arr) => (
          <Box
            key={i}
            sx={{
              px: 3,
              py: 2.5,
              borderBottom: i < arr.length - 1 ? `1px solid ${tokens.colors.border}` : 'none',
            }}
          >
            <Typography sx={{ fontWeight: 500, mb: 1, color: tokens.colors.secondary }}>
              {item.q}
            </Typography>
            <Typography variant="body2" sx={{ color: tokens.colors.text.secondary }}>
              {item.a}
            </Typography>
          </Box>
        ))}
      </Paper>
    </Box>
  );
}

function ContactSection() {
  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
        Contact Us
      </Typography>

      <Paper sx={{ bgcolor: tokens.colors.background.paper, borderRadius: '20px', p: 3, mb: 3 }}>
        <Typography variant="body2" sx={{ color: tokens.colors.text.secondary, mb: 3 }}>
          Have a question or feedback? We'd love to hear from you.
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Email</Typography>
            <Typography variant="body2" sx={{ color: tokens.colors.secondary }}>
              kevin@neverdieguy.com
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Discord</Typography>
            <Typography variant="body2" sx={{ color: tokens.colors.secondary }}>
              discord.gg/neverdieguy
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Twitter</Typography>
            <Typography variant="body2" sx={{ color: tokens.colors.secondary }}>
              @neverdieguy
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}

function ShortcutsSection() {
  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
        Keyboard Shortcuts
      </Typography>

      <Paper sx={{ bgcolor: tokens.colors.background.paper, borderRadius: '20px', overflow: 'hidden' }}>
        {[
          { keys: 'Space', action: 'Roll dice' },
          { keys: 'R', action: 'Reset throw' },
          { keys: '1-6', action: 'Select dice slot' },
          { keys: 'Tab', action: 'Cycle targets' },
          { keys: 'Esc', action: 'Open menu / Cancel' },
          { keys: '?', action: 'Show shortcuts' },
        ].map((item, i, arr) => (
          <Box
            key={item.keys}
            sx={{
              px: 3,
              py: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: i < arr.length - 1 ? `1px solid ${tokens.colors.border}` : 'none',
            }}
          >
            <Typography variant="body2" sx={{ color: tokens.colors.text.secondary }}>
              {item.action}
            </Typography>
            <Box
              sx={{
                px: 1.5,
                py: 0.5,
                bgcolor: tokens.colors.background.elevated,
                borderRadius: 1,
                fontFamily: 'monospace',
                fontSize: '0.8rem',
              }}
            >
              {item.keys}
            </Box>
          </Box>
        ))}
      </Paper>
    </Box>
  );
}

// ============================================
// Main Component
// ============================================

export function HelpCenter() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState<HelpSection>('guide');
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const handleSectionClick = (section: SectionConfig) => {
    setActiveSection(section.id);
    setMobileDrawerOpen(false);
  };

  // Render the active section
  const renderSection = () => {
    switch (activeSection) {
      case 'guide':
        return <GameGuideSection />;
      case 'faq':
        return <FAQSection />;
      case 'contact':
        return <ContactSection />;
      case 'shortcuts':
        return <ShortcutsSection />;
      default:
        return <GameGuideSection />;
    }
  };

  // Right-side sections nav
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
      {sections.map((section) => (
        <Typography
          key={section.id}
          variant="body2"
          onClick={() => handleSectionClick(section)}
          sx={{
            color: activeSection === section.id ? tokens.colors.text.primary : tokens.colors.secondary,
            fontWeight: activeSection === section.id ? 600 : 400,
            cursor: 'pointer',
            mb: 1,
            '&:hover': { textDecoration: 'underline' },
            '&:last-child': { mb: 0 },
          }}
        >
          {section.label}
        </Typography>
      ))}

      {/* Quick Links */}
      <Typography variant="subtitle2" sx={{ mt: 4, mb: 2, color: tokens.colors.text.secondary }}>
        Quick Links
      </Typography>
      {[
        { label: 'Wiki', path: '/wiki' },
        { label: 'Settings', path: '/settings' },
        { label: 'Sitemap', path: '/help/sitemap' },
      ].map((link) => (
        <Typography
          key={link.path}
          variant="body2"
          onClick={() => navigate(link.path)}
          sx={{
            color: tokens.colors.secondary,
            cursor: 'pointer',
            mb: 1,
            '&:hover': { textDecoration: 'underline' },
            '&:last-child': { mb: 0 },
          }}
        >
          {link.label}
        </Typography>
      ))}
    </Box>
  );

  // Mobile drawer content
  const drawerContent = (
    <Box sx={{ py: 2 }}>
      {sections.map((section) => (
        <Box
          key={section.id}
          onClick={() => handleSectionClick(section)}
          sx={{
            px: 3,
            py: 1.5,
            cursor: 'pointer',
            bgcolor: activeSection === section.id ? tokens.colors.background.elevated : 'transparent',
            '&:hover': { bgcolor: tokens.colors.background.elevated },
          }}
        >
          <Typography
            sx={{
              fontSize: '0.9rem',
              fontWeight: activeSection === section.id ? 600 : 400,
              color: activeSection === section.id ? tokens.colors.text.primary : tokens.colors.text.secondary,
            }}
          >
            {section.label}
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
            {sections.find(s => s.id === activeSection)?.label || 'Help'}
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
              Help
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
              Help
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
