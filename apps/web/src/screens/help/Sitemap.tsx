import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  Link as MuiLink,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Breadcrumbs,
  useMediaQuery,
  useTheme,
  Drawer,
  IconButton,
} from '@mui/material';
import { Link } from 'react-router-dom';
import {
  ExpandMoreSharp,
  SportsEsportsSharp,
  AutoStoriesSharp,
  ShoppingCartSharp,
  LeaderboardSharp,
  PeopleSharp,
  NotificationsSharp,
  SettingsSharp,
  HelpSharp,
  GavelSharp,
  LoginSharp,
  SearchSharp,
  ErrorSharp,
  PaletteSharp,
  MapSharp,
  HomeSharp,
  NavigateNextSharp as NextIcon,
  MenuSharp as MenuIcon,
  ChevronLeftSharp as BackIcon,
} from '@mui/icons-material';
import { tokens } from '../../theme';

interface SitemapLink {
  label: string;
  path: string;
  status?: 'active' | 'planned' | 'deprecated';
}

interface SitemapSection {
  title: string;
  icon: React.ReactNode;
  links: SitemapLink[];
}

// ACTUAL ROUTES - Updated Dec 30, 2024
// Status: active = implemented, planned = for future, deprecated = removed from MVP
const sitemapData: SitemapSection[] = [
  {
    title: 'Core',
    icon: <HomeSharp />,
    links: [
      { label: 'Home', path: '/', status: 'active' },
    ],
  },
  {
    title: 'Authentication',
    icon: <LoginSharp />,
    links: [
      { label: 'Login', path: '/login', status: 'active' },
      { label: 'Sign Up', path: '/signup', status: 'active' },
      { label: 'Forgot Password', path: '/forgot-password', status: 'active' },
      { label: 'Reset Password', path: '/reset-password', status: 'active' },
      { label: 'Reset Success', path: '/reset-success', status: 'active' },
      { label: 'Logout', path: '/logout', status: 'active' },
    ],
  },
  {
    title: 'Play',
    icon: <SportsEsportsSharp />,
    links: [
      { label: 'Play Hub', path: '/play', status: 'active' },
      { label: 'Match Results', path: '/play/results', status: 'active' },
      { label: 'Meteor Mode', path: '/play/meteor', status: 'active' },
      { label: 'Globe View', path: '/play/globe', status: 'active' },
      { label: 'Replays', path: '/play/replays', status: 'active' },
      { label: 'Watch Replay', path: '/play/replay/:threadId', status: 'active' },
      { label: 'Spectate', path: '/play/spectate/:matchId', status: 'active' },
      { label: 'Tournament', path: '/play/tournament', status: 'active' },
      { label: 'Match Stats', path: '/play/stats/:threadId', status: 'active' },
      { label: 'Exit Confirm', path: '/play/exit-confirm', status: 'active' },
      { label: 'Exit Summary', path: '/play/exit-summary', status: 'active' },
      { label: 'Inventory', path: '/inventory', status: 'active' },
      { label: 'Loot Drop', path: '/loot', status: 'active' },
    ],
  },
  {
    title: 'Game',
    icon: <MapSharp />,
    links: [
      { label: 'Location Selector', path: '/game/location', status: 'active' },
      { label: 'Fast Travel', path: '/game/fast-travel', status: 'active' },
    ],
  },
  {
    title: 'Wiki (Diepedia)',
    icon: <AutoStoriesSharp />,
    links: [
      { label: 'Wiki Index', path: '/wiki', status: 'active' },
      { label: 'Enemies', path: '/wiki/enemies', status: 'active' },
      { label: 'Domains', path: '/wiki/domains', status: 'active' },
      { label: 'Items', path: '/wiki/items', status: 'active' },
      { label: 'Trophies', path: '/wiki/trophies', status: 'active' },
      { label: 'Travelers', path: '/wiki/travelers', status: 'active' },
      { label: 'Wanderers', path: '/wiki/wanderers', status: 'active' },
      { label: 'Pantheon', path: '/wiki/pantheon', status: 'active' },
      { label: 'Shops', path: '/wiki/shops', status: 'active' },
      { label: 'Soundtrack', path: '/wiki/soundtrack', status: 'active' },
      { label: 'Sound Effects', path: '/wiki/sfx', status: 'active' },
      { label: 'Posters', path: '/wiki/posters', status: 'active' },
      { label: 'Entity Detail', path: '/wiki/:category/:id', status: 'active' },
      { label: 'Faction Lore', path: '/wiki/faction/:id', status: 'active' },
    ],
  },
  {
    title: 'Barter (Shops)',
    icon: <ShoppingCartSharp />,
    links: [
      { label: 'Barter Hub', path: '/shop', status: 'active' },
      { label: 'Shop Detail', path: '/shop/:slug', status: 'active' },
      { label: 'Receipt', path: '/shop/receipt', status: 'active' },
      // P2P marketplace removed from MVP
      { label: 'Player Marketplace', path: '/shop/market', status: 'deprecated' },
      { label: 'Trade Offers', path: '/shop/trade', status: 'deprecated' },
    ],
  },
  {
    title: 'Progress',
    icon: <LeaderboardSharp />,
    links: [
      { label: 'Progress Hub', path: '/progress', status: 'active' },
      { label: 'Leaderboard', path: '/leaderboard', status: 'active' },
      { label: 'History', path: '/history', status: 'active' },
      { label: 'Daily Reward', path: '/rewards/daily', status: 'active' },
    ],
  },
  {
    title: 'Profile',
    icon: <PeopleSharp />,
    links: [
      { label: 'My Profile', path: '/profile', status: 'active' },
      { label: 'Edit Profile', path: '/profile/edit', status: 'active' },
      { label: 'User Profile', path: '/user/:id', status: 'active' },
    ],
  },
  {
    title: 'Search',
    icon: <SearchSharp />,
    links: [
      { label: 'Search', path: '/search', status: 'active' },
      { label: 'Advanced Search', path: '/search/advanced', status: 'active' },
    ],
  },
  {
    title: 'Notifications',
    icon: <NotificationsSharp />,
    links: [
      { label: 'Notification Center', path: '/notifications', status: 'active' },
      { label: 'Level Up', path: '/notifications/level-up', status: 'active' },
    ],
  },
  {
    title: 'Settings',
    icon: <SettingsSharp />,
    links: [
      { label: 'Settings', path: '/settings', status: 'active' },
      // All sections are in single page now (Board, Gameplay, Profile, Interface, Social, Notifications, Account, Membership, Accessibility)
    ],
  },
  {
    title: 'Help',
    icon: <HelpSharp />,
    links: [
      { label: 'Help Center', path: '/help', status: 'active' },
      { label: 'FAQ', path: '/help/faq', status: 'active' },
      { label: 'Contact', path: '/help/contact', status: 'active' },
      { label: 'Sitemap', path: '/help/sitemap', status: 'active' },
    ],
  },
  {
    title: 'Legal',
    icon: <GavelSharp />,
    links: [
      { label: 'Terms of Service', path: '/terms', status: 'active' },
      { label: 'Privacy Policy', path: '/privacy', status: 'active' },
      { label: 'About Us', path: '/about', status: 'active' },
    ],
  },
  {
    title: 'Errors',
    icon: <ErrorSharp />,
    links: [
      { label: '404 Not Found', path: '/404', status: 'active' },
      { label: 'Network Error', path: '/errors/network', status: 'active' },
      { label: 'Maintenance Mode', path: '/maintenance', status: 'active' },
      { label: 'Server Error (500)', path: '/error/500', status: 'active' },
      { label: 'Offline State', path: '/offline', status: 'active' },
    ],
  },
  {
    title: 'Design System',
    icon: <PaletteSharp />,
    links: [
      { label: 'Overview', path: '/design-system', status: 'active' },
    ],
  },
];

// Count links by status
const activeLinks = sitemapData.reduce((acc, section) =>
  acc + section.links.filter(l => l.status === 'active' || !l.status).length, 0);
const plannedLinks = sitemapData.reduce((acc, section) =>
  acc + section.links.filter(l => l.status === 'planned').length, 0);
const deprecatedLinks = sitemapData.reduce((acc, section) =>
  acc + section.links.filter(l => l.status === 'deprecated').length, 0);
const totalLinks = activeLinks + plannedLinks + deprecatedLinks;

type FilterType = 'all' | 'active' | 'planned' | 'deprecated';

const filterOptions: { id: FilterType; label: string; count: number }[] = [
  { id: 'all', label: 'All Pages', count: totalLinks },
  { id: 'active', label: 'Active', count: activeLinks },
  { id: 'planned', label: 'Planned', count: plannedLinks },
  { id: 'deprecated', label: 'Deprecated', count: deprecatedLinks },
];

export function Sitemap() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [expanded, setExpanded] = useState<string[]>(sitemapData.map(s => s.title));
  const [filter, setFilter] = useState<FilterType>('all');
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const handleToggle = (title: string) => {
    setExpanded((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  };

  const handleFilterClick = (f: FilterType) => {
    setFilter(f);
    setMobileDrawerOpen(false);
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'planned': return tokens.colors.secondary;
      case 'deprecated': return tokens.colors.text.disabled;
      default: return tokens.colors.text.secondary;
    }
  };

  const filterLinks = (links: SitemapLink[]) => {
    if (filter === 'all') return links;
    return links.filter(l => (l.status || 'active') === filter);
  };

  // Right-side sections nav
  const sectionsNav = (
    <Box sx={{ position: { md: 'sticky' }, top: { md: 80 } }}>
      <Typography variant="subtitle2" sx={{ mb: 2, color: tokens.colors.text.secondary }}>
        Filter
      </Typography>
      {filterOptions.map((opt) => (
        <Box
          key={opt.id}
          onClick={() => handleFilterClick(opt.id)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 1,
            cursor: 'pointer',
            '&:hover': { '& .label': { textDecoration: 'underline' } },
          }}
        >
          <Typography
            className="label"
            variant="body2"
            sx={{
              color: filter === opt.id ? tokens.colors.text.primary : tokens.colors.secondary,
              fontWeight: filter === opt.id ? 600 : 400,
            }}
          >
            {opt.label}
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: tokens.colors.text.disabled }}
          >
            {opt.count}
          </Typography>
        </Box>
      ))}

      <Typography variant="subtitle2" sx={{ mt: 4, mb: 2, color: tokens.colors.text.secondary }}>
        Legend
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <Typography variant="caption" sx={{ color: tokens.colors.text.secondary }}>
          Active - Implemented
        </Typography>
        <Typography variant="caption" sx={{ color: tokens.colors.secondary }}>
          Planned - Future feature
        </Typography>
        <Typography variant="caption" sx={{ color: tokens.colors.text.disabled }}>
          Deprecated - Removed
        </Typography>
      </Box>
    </Box>
  );

  // Mobile drawer content
  const drawerContent = (
    <Box sx={{ py: 2 }}>
      {filterOptions.map((opt) => (
        <Box
          key={opt.id}
          onClick={() => handleFilterClick(opt.id)}
          sx={{
            px: 3,
            py: 1.5,
            cursor: 'pointer',
            bgcolor: filter === opt.id ? tokens.colors.background.elevated : 'transparent',
            '&:hover': { bgcolor: tokens.colors.background.elevated },
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <Typography
            sx={{
              fontSize: '0.9rem',
              fontWeight: filter === opt.id ? 600 : 400,
              color: filter === opt.id ? tokens.colors.text.primary : tokens.colors.text.secondary,
            }}
          >
            {opt.label}
          </Typography>
          <Typography variant="caption" sx={{ color: tokens.colors.text.disabled }}>
            {opt.count}
          </Typography>
        </Box>
      ))}
    </Box>
  );

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* Mobile Header */}
      {isMobile && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <IconButton size="small" onClick={() => setMobileDrawerOpen(true)}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Sitemap
          </Typography>
        </Box>
      )}

      {/* Mobile Drawer */}
      {isMobile && (
        <Drawer
          open={mobileDrawerOpen}
          onClose={() => setMobileDrawerOpen(false)}
          PaperProps={{ sx: { width: 260, bgcolor: tokens.colors.background.paper } }}
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
              Filter
            </Typography>
          </Box>
          {drawerContent}
        </Drawer>
      )}

      {/* Main Layout */}
      <Box
        sx={{
          display: 'flex',
          gap: 4,
          flexDirection: { xs: 'column', md: 'row' },
          maxWidth: 1000,
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
              sx={{ color: tokens.colors.secondary, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
            >
              Home
            </MuiLink>
            <MuiLink
              component={RouterLink}
              to="/help"
              sx={{ color: tokens.colors.secondary, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
            >
              Help
            </MuiLink>
            <Typography color="text.primary" sx={{ fontSize: '0.875rem' }}>
              Sitemap
            </Typography>
          </Breadcrumbs>

          <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
            Sitemap
          </Typography>
          <Typography variant="body2" sx={{ color: tokens.colors.text.secondary, mb: 3 }}>
            {activeLinks} active pages across {sitemapData.length} sections
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {sitemapData.map((section) => {
              const filteredLinks = filterLinks(section.links);
              if (filteredLinks.length === 0) return null;

              return (
                <Accordion
                  key={section.title}
                  expanded={expanded.includes(section.title)}
                  onChange={() => handleToggle(section.title)}
                  disableGutters
                  sx={{
                    backgroundColor: tokens.colors.background.paper,
                    '&:before': { display: 'none' },
                    borderRadius: '18px !important',
                    border: `1px solid ${tokens.colors.border}`,
                    overflow: 'hidden',
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreSharp sx={{ color: tokens.colors.text.secondary }} />}
                    sx={{ '&:hover': { backgroundColor: tokens.colors.background.elevated } }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box sx={{ color: tokens.colors.primary, display: 'flex' }}>
                        {section.icon}
                      </Box>
                      <Typography sx={{ fontWeight: 600, fontSize: '0.9rem' }}>
                        {section.title}
                      </Typography>
                      <Chip
                        label={filteredLinks.length}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.7rem',
                          backgroundColor: `${tokens.colors.primary}20`,
                          color: tokens.colors.primary,
                        }}
                      />
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails
                    sx={{
                      backgroundColor: tokens.colors.background.default,
                      borderTop: `1px solid ${tokens.colors.border}`,
                    }}
                  >
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                        gap: 1,
                      }}
                    >
                      {filteredLinks.map((link) => (
                        <Box
                          key={link.path}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            py: 0.5,
                            px: 1,
                          }}
                        >
                          {link.status === 'planned' && (
                            <Box
                              sx={{
                                width: 6,
                                height: 6,
                                borderRadius: '50%',
                                bgcolor: tokens.colors.secondary,
                                flexShrink: 0,
                              }}
                            />
                          )}
                          {link.status === 'deprecated' && (
                            <Box
                              sx={{
                                width: 6,
                                height: 6,
                                borderRadius: '50%',
                                bgcolor: tokens.colors.text.disabled,
                                flexShrink: 0,
                              }}
                            />
                          )}
                          <MuiLink
                            component={Link}
                            to={link.status === 'deprecated' ? '#' : link.path}
                            sx={{
                              color: getStatusColor(link.status),
                              textDecoration: link.status === 'deprecated' ? 'line-through' : 'none',
                              fontSize: '0.8rem',
                              transition: 'all 0.2s',
                              '&:hover': link.status !== 'deprecated' ? {
                                color: tokens.colors.primary,
                              } : {},
                            }}
                          >
                            {link.label}
                          </MuiLink>
                        </Box>
                      ))}
                    </Box>
                  </AccordionDetails>
                </Accordion>
              );
            })}
          </Box>
        </Box>

        {/* Right Sidebar */}
        {!isMobile && (
          <Box sx={{ width: 160, flexShrink: 0 }}>
            {sectionsNav}
          </Box>
        )}
      </Box>
    </Box>
  );
}
