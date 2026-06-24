import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Tooltip,
  Collapse,
  IconButton,
  InputBase,
  Popover,
  Paper,
  Menu,
  MenuItem,
  Divider,
} from '@mui/material';
import {
  ExpandMoreSharp as ExpandIcon,
  ExpandLessSharp as CollapseIcon,
  SearchSharp as SearchIcon,
  Group as FriendsIcon,
  Build as BuildIcon,
  HelpOutlineSharp as HelpIcon,
  Info as InfoIcon,
  LogoutSharp as LogoutIcon,
  HomeSharp as HomeViewIcon,
} from '@mui/icons-material';
import { tokens, sxPatterns } from '../../theme';
import { navItems, type NavItem, DRAWER_WIDTH_COLLAPSED, DRAWER_WIDTH_EXPANDED, HEADER_HEIGHT } from './navItems';
import { useAuth } from '../../contexts';
import { useSoundContext } from '../../contexts/SoundContext';
import { searchEntities, type AnyEntity } from '../../data/wiki';
import { getCategoryInfo, getElementInfo } from '../../data/wiki/helpers';
import type { Domain } from '../../data/wiki/types';
import { loadCurrentSeed, hasSavedRun, getRunHistoryStats } from '../../data/player/storage';
import { Switch } from '@neverdieguy/ui';
import { useGameSettings } from '../../contexts/GameSettingsContext';

interface AppSidebarProps {
  expanded: boolean;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
  onToggleExpand?: () => void;
  isMobile?: boolean;
}

export function AppSidebar({ expanded, mobileOpen = false, onMobileClose, onToggleExpand, isMobile = false }: AppSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { playUIClick } = useSoundContext();
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const { isAuthenticated } = useAuth();
  const { homeView, setHomeView } = useGameSettings();
  // Returning players (resumable run or completed-run history) can switch the home
  // into the stripped "New Guy" launcher. Re-checked on navigation so it stays fresh
  // after a first run, without re-parsing localStorage on every sidebar re-render.
  const isReturning = useMemo(
    () => hasSavedRun() || getRunHistoryStats().totalRuns > 0,
    [location.pathname],
  );

  // Skull pulse state — triggers on logo click, resets on navigation
  const [skullLoading, setSkullLoading] = useState(false);
  useEffect(() => { setSkullLoading(false); }, [location.pathname]);

  // Load seed for username display (synced with HomeDashboard)
  const currentSeed = useMemo(() => loadCurrentSeed() || 'XXXXXX', []);

  // Search state
  const [searchAnchor, setSearchAnchor] = useState<null | HTMLElement>(null);
  const [searchValue, setSearchValue] = useState('');
  const [searchResults, setSearchResults] = useState<AnyEntity[]>([]);
  const searchOpen = Boolean(searchAnchor) && searchValue.length > 0;

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    if (value.trim().length > 1) {
      const results = searchEntities(value).slice(0, 5);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const handleSearchSubmit = () => {
    if (searchValue.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchValue.trim())}`);
      setSearchValue('');
      setSearchAnchor(null);
    }
  };

  const handleResultClick = (entity: AnyEntity) => {
    navigate(`/wiki/${entity.category}/${entity.slug}`);
    setSearchValue('');
    setSearchAnchor(null);
  };

  // Settings flyout menu
  const [settingsAnchor, setSettingsAnchor] = useState<null | HTMLElement>(null);
  const settingsOpen = Boolean(settingsAnchor);

  // Filter nav items based on auth status - hide items that require auth when not authenticated
  const filteredNavItems = useMemo(() => {
    return navItems.filter(item => !item.requiresAuth || isAuthenticated);
  }, [isAuthenticated]);

  const toggleMenu = (label: string) => {
    setExpandedMenus((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  const isItemActive = (item: NavItem): boolean => {
    if (item.path) {
      if (item.path === '/') {
        return location.pathname === '/';
      }
      return location.pathname.startsWith(item.path);
    }
    if (item.children) {
      return item.children.some((child) => child.path && location.pathname.startsWith(child.path));
    }
    return false;
  };

  const drawerWidth = expanded ? DRAWER_WIDTH_EXPANDED : DRAWER_WIDTH_COLLAPSED;

  // On mobile, don't render permanent drawer
  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH_EXPANDED,
            boxSizing: 'border-box',
            backgroundColor: tokens.colors.background.paper,
            borderRight: `1px solid ${tokens.colors.border}`,
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        {/* Logo */}
        <Box
          sx={{
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: HEADER_HEIGHT,
            borderBottom: `1px solid ${tokens.colors.border}`,
            '&:hover': { opacity: 0.8 },
          }}
          onClick={() => { playUIClick(); setSkullLoading(true); navigate('/'); onMobileClose?.(); }}
        >
          <Box
            component="img"
            src="/logos/ndg-skull-dome.svg"
            alt="NDG"
            sx={{
              width: 32,
              height: 36,
              ...(skullLoading && {
                animation: 'ndg-pulse 1.5s ease-in-out infinite',
                '@keyframes ndg-pulse': {
                  '0%, 100%': { opacity: 0.4 },
                  '50%': { opacity: 1 },
                },
              }),
            }}
          />
        </Box>

        {/* Nav items */}
        <Box sx={{ overflow: 'auto', py: 1, flex: 1 }}>
          <List dense disablePadding>
            {filteredNavItems.map((item) => {
              const isActive = isItemActive(item);
              return (
                <ListItemButton
                  key={item.label}
                  onClick={() => {
                    if (item.path) {
                      playUIClick();
                      navigate(item.path);
                      onMobileClose?.();
                    }
                  }}
                  selected={isActive}
                  sx={{ mx: 1, borderRadius: 1, mb: 1.5, ...sxPatterns.selectedItem }}
                >
                  <ListItemIcon sx={{ minWidth: 36, mr: 0.5, color: isActive ? tokens.colors.primary : tokens.colors.text.secondary }}>
                    {item.iconSrc ? (
                      <Box component="img" src={item.iconSrc} alt={item.label} sx={{ width: 28, height: 28 }} />
                    ) : (
                      item.icon
                    )}
                  </ListItemIcon>
                  <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: isActive ? 700 : 600 }} />
                </ListItemButton>
              );
            })}
          </List>
        </Box>
      </Drawer>
    );
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        transition: 'width 200ms ease-in-out',
        // Ensure sidebar is above 3D canvas and always receives pointer events
        zIndex: 1200,
        position: 'relative',
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: tokens.colors.background.paper,
          borderRight: `1px solid ${tokens.colors.border}`,
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 200ms ease-in-out',
          overflowX: 'hidden',
          pt: 0,
          // Force pointer events to ensure nav is always clickable
          pointerEvents: 'auto',
        },
      }}
    >
      {/* Logo */}
      <Box
        sx={{
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: HEADER_HEIGHT,
          borderBottom: `1px solid ${tokens.colors.border}`,
          '&:hover': { opacity: 0.8 },
        }}
        onClick={() => { playUIClick(); setSkullLoading(true); navigate('/'); }}
      >
        <Box
          component="img"
          src="/logos/ndg-skull-dome.svg"
          alt="NDG"
          sx={{
            width: 32,
            height: 36,
            ...(skullLoading && {
              animation: 'ndg-pulse 1.5s ease-in-out infinite',
              '@keyframes ndg-pulse': {
                '0%, 100%': { opacity: 0.4 },
                '50%': { opacity: 1 },
              },
            }),
          }}
        />
      </Box>

      {/* Nav items */}
      <Box
        sx={{
          overflow: 'auto',
          pt: 2,
          pb: 1,
          flex: 1,
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        }}
      >
        <List dense disablePadding>
          {filteredNavItems.map((item) => {
            const isActive = isItemActive(item);
            const hasChildren = item.children && item.children.length > 0;
            const isMenuExpanded = expandedMenus.includes(item.label);

            return (
              <Box key={item.label}>
                <Tooltip title={!expanded ? item.label : ''} placement="right" arrow enterDelay={300} enterNextDelay={300}>
                  <ListItemButton
                    onClick={() => {
                      playUIClick();
                      if (hasChildren) {
                        toggleMenu(item.label);
                      } else if (item.path) {
                        navigate(item.path);
                      }
                    }}
                    selected={isActive && !hasChildren}
                    sx={{
                      mx: 0.5,
                      borderRadius: 1,
                      mb: 1,
                      justifyContent: expanded ? 'flex-start' : 'center',
                      px: expanded ? 1.5 : 1,
                      py: 0.75,
                      ...sxPatterns.selectedItem,
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: expanded ? 32 : 'auto',
                        mr: expanded ? 0.75 : 0,
                        color: isActive ? tokens.colors.primary : tokens.colors.text.secondary,
                      }}
                    >
                      {item.iconSrc ? (
                        <Box component="img" src={item.iconSrc} alt={item.label} sx={{ width: 28, height: 28 }} />
                      ) : (
                        item.icon
                      )}
                    </ListItemIcon>
                    {expanded && (
                      <>
                        <ListItemText
                          primary={item.label}
                          primaryTypographyProps={{
                            fontSize: '0.85rem',
                            fontWeight: isActive ? 700 : 600,
                            whiteSpace: 'nowrap',
                          }}
                        />
                        {hasChildren && (isMenuExpanded ? <CollapseIcon sx={{ fontSize: '0.7rem' }} /> : <ExpandIcon sx={{ fontSize: '0.7rem' }} />)}
                      </>
                    )}
                  </ListItemButton>
                </Tooltip>

                {/* Submenu */}
                {hasChildren && expanded && (
                  <Collapse in={isMenuExpanded} timeout="auto" unmountOnExit>
                    <List dense disablePadding sx={{ pl: 1, pb: 2 }}>
                      {item.children!.map((child) => {
                        if (child.isSection) {
                          return (
                            <Typography
                              key={child.label}
                              variant="caption"
                              sx={{
                                display: 'block',
                                px: 2,
                                pt: 1.5,
                                pb: 0.5,
                                color: tokens.colors.text.disabled,
                                textTransform: 'uppercase',
                                fontSize: '0.6rem',
                                fontWeight: 600,
                                letterSpacing: '0.5px',
                              }}
                            >
                              {child.label}
                            </Typography>
                          );
                        }

                        const isChildActive = !!(
                          child.path && location.pathname.startsWith(child.path)
                        );
                        return (
                          <ListItemButton
                            key={child.label}
                            onClick={() => { if (child.path) { playUIClick(); navigate(child.path); } }}
                            selected={isChildActive}
                            sx={{
                              mx: 1,
                              borderRadius: 1,
                              mb: 0.25,
                              py: 0.5,
                              ...sxPatterns.selectedItem,
                            }}
                          >
                            <ListItemIcon
                              sx={{
                                minWidth: 28,
                                color: isChildActive
                                  ? tokens.colors.primary
                                  : tokens.colors.text.secondary,
                                '& svg': { fontSize: '1rem' },
                              }}
                            >
                              {child.icon}
                            </ListItemIcon>
                            <ListItemText
                              primary={child.label}
                              primaryTypographyProps={{
                                fontSize: '0.75rem',
                                fontWeight: isChildActive ? 500 : 400,
                                whiteSpace: 'nowrap',
                              }}
                            />
                            {child.count !== undefined && (
                              <Typography
                                variant="caption"
                                sx={{
                                  color: tokens.colors.text.disabled,
                                  fontSize: '0.7rem',
                                  ml: 1,
                                }}
                              >
                                {child.count}
                              </Typography>
                            )}
                          </ListItemButton>
                        );
                      })}
                    </List>
                  </Collapse>
                )}
              </Box>
            );
          })}
        </List>
      </Box>

      {/* Bottom section: quick actions + account/settings */}
      <Box sx={{ borderTop: `1px solid ${tokens.colors.border}`, pt: 1.5, pb: 1, pr: expanded ? 0.5 : 0 }}>
        {/* Quick actions: Search + About grouped (Multiplayer coming soon) */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: expanded ? 'row' : 'column',
            justifyContent: expanded ? 'flex-start' : 'center',
            alignItems: 'center',
            gap: 0.5,
            px: expanded ? 1.25 : 0.5,
            pb: 0.5,
          }}
        >
          {/* Search */}
          <Tooltip title="Search" placement={expanded ? 'top' : 'right'} arrow enterDelay={300}>
            <IconButton
              onClick={(e) => { playUIClick(); setSearchAnchor(e.currentTarget); }}
              sx={{
                width: 36,
                height: 36,
                color: tokens.colors.text.disabled,
                '&:hover': { color: tokens.colors.text.secondary, bgcolor: tokens.colors.background.elevated },
              }}
            >
              <SearchIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>

          {/* About */}
          <Tooltip title="About" placement={expanded ? 'top' : 'right'} arrow>
            <IconButton
              onClick={() => { playUIClick(); navigate('/about'); }}
              sx={{
                width: 36,
                height: 36,
                color: tokens.colors.text.disabled,
                '&:hover': { color: tokens.colors.text.secondary, bgcolor: tokens.colors.background.elevated },
              }}
            >
              <InfoIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>

          {/* Multiplayer - coming soon */}
          <Tooltip title="Multiplayer (coming soon)" placement={expanded ? 'top' : 'right'} arrow>
            <span>
              <IconButton
                disabled
                sx={{
                  width: 36,
                  height: 36,
                  color: tokens.colors.text.disabled,
                  opacity: 0.4,
                  '&.Mui-disabled': { color: tokens.colors.text.disabled, opacity: 0.4 },
                }}
              >
                <FriendsIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </span>
          </Tooltip>
        </Box>

        {/* Search Popover with Input and Results */}
        <Popover
          open={Boolean(searchAnchor)}
          anchorEl={searchAnchor}
          onClose={() => { setSearchAnchor(null); setSearchValue(''); setSearchResults([]); }}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          sx={{ ml: 1, mb: 1 }}
        >
          <Paper sx={{ p: 1.5, bgcolor: tokens.colors.background.paper, width: 300 }}>
            {/* Results appear above the input */}
            {searchResults.length > 0 && (
              <Box sx={{ mb: 1.5 }}>
                <Typography variant="caption" sx={{ color: tokens.colors.text.disabled, mb: 1, display: 'block' }}>
                  {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
                </Typography>
                {searchResults.map((entity) => {
                  const categoryInfo = getCategoryInfo(entity.category);
                  const isDomainResult = entity.category === 'domains';
                  const domainElement = isDomainResult ? (entity as Domain).element : undefined;
                  const domainColor = domainElement ? getElementInfo(domainElement)?.color : undefined;
                  return (
                    <Box
                      key={entity.slug}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        p: 1,
                        borderRadius: 1,
                        cursor: 'pointer',
                        '&:hover': { bgcolor: tokens.colors.background.elevated },
                      }}
                      onClick={() => handleResultClick(entity)}
                    >
                      {isDomainResult && domainColor ? (
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            bgcolor: domainColor,
                            boxShadow: `0 0 8px ${domainColor}50`,
                            border: `2px solid ${domainColor}`,
                            flexShrink: 0,
                          }}
                        />
                      ) : (
                        <Box
                          component="img"
                          src={entity.portrait || entity.sprites?.[0] || entity.image || ''}
                          alt={entity.name}
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: 0.5,
                            bgcolor: tokens.colors.background.elevated,
                            objectFit: 'contain',
                          }}
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      )}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.8rem' }} noWrap>
                          {entity.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: categoryInfo.color, fontSize: '0.7rem' }}>
                          {categoryInfo.label}
                        </Typography>
                      </Box>
                    </Box>
                  );
                })}
                <Box
                  sx={{
                    pt: 1,
                    mt: 1,
                    borderTop: `1px solid ${tokens.colors.border}`,
                    textAlign: 'center',
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: tokens.colors.primary,
                      cursor: 'pointer',
                      '&:hover': { textDecoration: 'underline' },
                    }}
                    onClick={handleSearchSubmit}
                  >
                    View all results
                  </Typography>
                </Box>
              </Box>
            )}
            {searchValue.length > 1 && searchResults.length === 0 && (
              <Typography variant="body2" sx={{ color: tokens.colors.text.secondary, textAlign: 'center', py: 1, mb: 1 }}>
                No results found
              </Typography>
            )}
            {/* Search input at bottom */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: tokens.colors.background.elevated,
                borderRadius: 1,
                px: 1.5,
                py: 0.75,
              }}
            >
              <InputBase
                autoFocus
                placeholder="Search wiki..."
                value={searchValue}
                onChange={(e) => handleSearchChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearchSubmit();
                  }
                }}
                sx={{
                  flex: 1,
                  color: tokens.colors.text.primary,
                  fontSize: '0.875rem',
                  '& input::placeholder': {
                    color: tokens.colors.text.disabled,
                    opacity: 1,
                  },
                }}
              />
              <SearchIcon sx={{ color: tokens.colors.text.disabled, fontSize: '1.25rem' }} />
            </Box>
          </Paper>
        </Popover>

        {/* Settings - opens the account + settings popup */}
        <Tooltip title={!expanded ? 'Settings' : ''} placement="right" arrow enterDelay={300}>
          <ListItemButton
            onClick={(e) => { playUIClick(); setSettingsAnchor(e.currentTarget); }}
            selected={settingsOpen}
            sx={{
              mx: 0.5,
              borderRadius: 1,
              justifyContent: expanded ? 'flex-start' : 'center',
              px: expanded ? 1.5 : 1,
              py: 0.75,
              minHeight: 44, // WCAG touch target minimum
              ...sxPatterns.selectedItem,
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: expanded ? 32 : 'auto',
                mr: expanded ? 0.75 : 0,
                color: settingsOpen ? tokens.colors.primary : tokens.colors.text.secondary,
              }}
            >
              <BuildIcon sx={{ fontSize: 22 }} />
            </ListItemIcon>
            {expanded && (
              <ListItemText
                primary="Settings"
                primaryTypographyProps={{
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                }}
              />
            )}
          </ListItemButton>
        </Tooltip>

        {/* Account + settings popup (opens upward from the Settings button) */}
        <Menu
          anchorEl={settingsAnchor}
          open={settingsOpen}
          onClose={() => setSettingsAnchor(null)}
          anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
          transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          sx={{
            '& .MuiPaper-root': {
              bgcolor: tokens.colors.background.paper,
              border: `1px solid ${tokens.colors.border}`,
              borderRadius: 2,
              minWidth: 240,
              mb: 1,
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            },
            '& .MuiList-root': { py: 0.5 },
          }}
        >
          {/* Identity - click to open profile */}
          <MenuItem
            onClick={() => { playUIClick(); navigate('/profile'); setSettingsAnchor(null); }}
            sx={{ display: 'flex', alignItems: 'center', gap: 1.25, px: 1.5, py: 1.25 }}
          >
            <Box sx={{ width: 36, height: 36, borderRadius: '6px', overflow: 'hidden', bgcolor: tokens.colors.background.elevated, flexShrink: 0 }}>
              <Box
                component="img"
                src="/assets/characters/travelers/sprite-never-die-guy-1.png"
                alt={`guy_${currentSeed}`}
                sx={{ width: '140%', height: '140%', objectFit: 'cover', objectPosition: 'top center', imageRendering: 'pixelated', marginLeft: '-20%' }}
              />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: tokens.colors.text.primary, whiteSpace: 'nowrap' }}>
                guy_{currentSeed}
              </Typography>
              <Typography sx={{ fontSize: '0.7rem', color: tokens.colors.text.disabled }}>
                The Fixer
              </Typography>
            </Box>
          </MenuItem>
          <Divider sx={{ borderColor: tokens.colors.border }} />

          {/* All settings */}
          <MenuItem
            onClick={() => { playUIClick(); navigate('/settings'); setSettingsAnchor(null); }}
            sx={{ gap: 1.5, py: 1 }}
          >
            <BuildIcon sx={{ fontSize: 20, color: tokens.colors.text.secondary }} />
            <Typography sx={{ fontSize: '0.85rem' }}>All settings</Typography>
          </MenuItem>

          {/* New Guy view - returning players strip the home down to the launcher */}
          {isReturning && (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, px: 1.5, py: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <HomeViewIcon sx={{ fontSize: 20, color: tokens.colors.text.secondary }} />
                <Typography sx={{ fontSize: '0.85rem' }}>New Guy view</Typography>
              </Box>
              <Switch
                checked={homeView === 'newguy'}
                onChange={(checked) => { playUIClick(); setHomeView(checked ? 'newguy' : 'auto'); }}
                size="small"
              />
            </Box>
          )}

          <Divider sx={{ borderColor: tokens.colors.border }} />

          {/* Help */}
          <MenuItem
            onClick={() => { playUIClick(); navigate('/help'); setSettingsAnchor(null); }}
            sx={{ gap: 1.5, py: 1 }}
          >
            <HelpIcon sx={{ fontSize: 20, color: tokens.colors.text.secondary }} />
            <Typography sx={{ fontSize: '0.85rem' }}>Help & support</Typography>
          </MenuItem>

          {/* Log out */}
          {isAuthenticated && (
            <MenuItem
              onClick={() => { playUIClick(); setSettingsAnchor(null); }}
              sx={{ gap: 1.5, py: 1 }}
            >
              <LogoutIcon sx={{ fontSize: 20, color: tokens.colors.text.secondary }} />
              <Typography sx={{ fontSize: '0.85rem' }}>Log out</Typography>
            </MenuItem>
          )}
        </Menu>
      </Box>

    </Drawer>
  );
}
