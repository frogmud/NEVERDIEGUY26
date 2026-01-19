import { useState, useMemo } from 'react';
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
  Avatar,
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
  GroupSharp as FriendsIcon,
  SettingsSharp as SettingsIcon,
  HelpOutlineSharp as HelpIcon,
  InfoOutlined as InfoIcon,
  LogoutSharp as LogoutIcon,
  ContrastSharp as ThemeIcon,
  TuneSharp as CustomizeIcon,
} from '@mui/icons-material';
import { tokens, sxPatterns } from '../../theme';
import { navItems, type NavItem, DRAWER_WIDTH_COLLAPSED, DRAWER_WIDTH_EXPANDED, HEADER_HEIGHT } from './navItems';
import { useAuth } from '../../contexts';
import { searchEntities, type AnyEntity } from '../../data/wiki';
import { SearchPopover } from './SearchPopover';

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
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const { isAuthenticated, user, playerNumber } = useAuth();

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
          onClick={() => { navigate('/'); onMobileClose?.(); }}
        >
          <Box
            component="img"
            src="/logos/ndg-skull-dome.svg"
            alt="NDG"
            sx={{ width: 32, height: 36 }}
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
        onClick={() => navigate('/')}
      >
        <Box
          component="img"
          src="/logos/ndg-skull-dome.svg"
          alt="NDG"
          sx={{ width: 32, height: 36 }}
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
                            onClick={() => child.path && navigate(child.path)}
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

      {/* Bottom section: Search, User, Icons */}
      <Box sx={{ borderTop: `1px solid ${tokens.colors.border}`, pt: 1.5, pb: 1 }}>
        {/* Search */}
        <Tooltip title={!expanded ? 'Search' : ''} placement="right" arrow enterDelay={300}>
          <ListItemButton
            onClick={(e) => setSearchAnchor(e.currentTarget)}
            sx={{
              mx: 0.5,
              borderRadius: 1,
              mb: 0.5,
              justifyContent: expanded ? 'flex-start' : 'center',
              px: expanded ? 1.5 : 1,
              py: 0.75,
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: expanded ? 32 : 'auto',
                mr: expanded ? 0.75 : 0,
                color: tokens.colors.text.secondary,
              }}
            >
              <SearchIcon sx={{ fontSize: 22 }} />
            </ListItemIcon>
            {expanded && (
              <ListItemText
                primary="Search"
                primaryTypographyProps={{
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  color: tokens.colors.text.secondary,
                }}
              />
            )}
          </ListItemButton>
        </Tooltip>

        {/* Search Popover with Input */}
        <Popover
          open={Boolean(searchAnchor)}
          anchorEl={searchAnchor}
          onClose={() => { setSearchAnchor(null); setSearchValue(''); }}
          anchorOrigin={{ vertical: 'center', horizontal: 'right' }}
          transformOrigin={{ vertical: 'center', horizontal: 'left' }}
          sx={{ ml: 1 }}
        >
          <Paper sx={{ p: 1.5, bgcolor: tokens.colors.background.paper, width: 280 }}>
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

        {/* Search Results Popover */}
        <SearchPopover
          open={searchOpen}
          anchorEl={searchAnchor}
          onClose={() => { setSearchAnchor(null); setSearchValue(''); }}
          searchValue={searchValue}
          searchResults={searchResults}
          onResultClick={handleResultClick}
          onViewAll={handleSearchSubmit}
        />

        {/* User info */}
        {isAuthenticated && (
          <Tooltip title={!expanded ? `guy_${playerNumber}` : ''} placement="right" arrow enterDelay={300}>
            <ListItemButton
              onClick={() => navigate('/profile')}
              sx={{
                mx: 0.5,
                borderRadius: 1,
                mb: 0.5,
                justifyContent: expanded ? 'flex-start' : 'center',
                px: expanded ? 1.5 : 1,
                py: 0.75,
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: expanded ? 32 : 'auto',
                  mr: expanded ? 0.75 : 0,
                }}
              >
                {/* Avatar cropped at shoulders */}
                <Box sx={{
                  width: 24,
                  height: 24,
                  borderRadius: '4px',
                  overflow: 'hidden',
                  bgcolor: tokens.colors.background.elevated,
                  flexShrink: 0,
                }}>
                  <Box
                    component="img"
                    src="/assets/characters/travelers/sprite-never-die-guy-1.png"
                    alt={user.name}
                    sx={{
                      width: '140%',
                      height: '140%',
                      objectFit: 'cover',
                      objectPosition: 'top center',
                      imageRendering: 'pixelated',
                      marginLeft: '-20%',
                    }}
                  />
                </Box>
              </ListItemIcon>
              {expanded && (
                <ListItemText
                  primary={`guy_${playerNumber}`}
                  primaryTypographyProps={{
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    color: tokens.colors.text.secondary,
                  }}
                />
              )}
            </ListItemButton>
          </Tooltip>
        )}

        {/* Stacked Icons: Multiplayer, Notifications, Settings */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: expanded ? 'row' : 'column',
            justifyContent: expanded ? 'flex-start' : 'center',
            alignItems: 'center',
            gap: expanded ? 0.25 : 0.5,
            px: expanded ? 1.5 : 0.5,
            py: 0.5,
          }}
        >
          {/* Multiplayer - Coming Soon */}
          <Tooltip title="Coming soon" placement={expanded ? 'top' : 'right'} arrow>
            <IconButton
              disabled
              sx={{
                width: 36,
                height: 36,
                color: tokens.colors.text.disabled,
                opacity: 0.5,
                cursor: 'not-allowed',
              }}
            >
              <FriendsIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>

          {/* About / Info */}
          <Tooltip title="About" placement={expanded ? 'top' : 'right'} arrow>
            <IconButton
              onClick={() => navigate('/about')}
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

          {/* Settings with Flyout */}
          <Tooltip title={settingsOpen ? '' : 'Settings'} placement={expanded ? 'top' : 'right'} arrow>
            <IconButton
              onClick={(e) => setSettingsAnchor(e.currentTarget)}
              sx={{
                width: 36,
                height: 36,
                color: settingsOpen ? tokens.colors.text.primary : tokens.colors.text.disabled,
                bgcolor: settingsOpen ? tokens.colors.background.elevated : 'transparent',
                '&:hover': { color: tokens.colors.text.secondary, bgcolor: tokens.colors.background.elevated },
              }}
            >
              <SettingsIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Settings Flyout Menu */}
        <Menu
          anchorEl={settingsAnchor}
          open={settingsOpen}
          onClose={() => setSettingsAnchor(null)}
          anchorOrigin={{ vertical: 'center', horizontal: 'right' }}
          transformOrigin={{ vertical: 'center', horizontal: 'left' }}
          sx={{
            '& .MuiPaper-root': {
              bgcolor: tokens.colors.background.paper,
              border: `1px solid ${tokens.colors.border}`,
              borderRadius: 2,
              minWidth: 200,
              ml: 1,
            },
          }}
        >
          <MenuItem
            onClick={() => { navigate('/settings'); setSettingsAnchor(null); }}
            sx={{ gap: 1.5, py: 1.25 }}
          >
            <SettingsIcon sx={{ fontSize: 20, color: tokens.colors.text.secondary }} />
            <Typography sx={{ fontSize: '0.9rem' }}>All Settings</Typography>
          </MenuItem>
          <MenuItem
            onClick={() => setSettingsAnchor(null)}
            sx={{ gap: 1.5, py: 1.25 }}
          >
            <CustomizeIcon sx={{ fontSize: 20, color: tokens.colors.text.secondary }} />
            <Typography sx={{ fontSize: '0.9rem' }}>Customize Sidebar</Typography>
          </MenuItem>
          <MenuItem
            onClick={() => setSettingsAnchor(null)}
            sx={{ gap: 1.5, py: 1.25 }}
          >
            <ThemeIcon sx={{ fontSize: 20, color: tokens.colors.text.secondary }} />
            <Typography sx={{ fontSize: '0.9rem' }}>Light UI</Typography>
          </MenuItem>
          <Divider sx={{ my: 0.5, borderColor: tokens.colors.border }} />
          <MenuItem
            onClick={() => { navigate('/help'); setSettingsAnchor(null); }}
            sx={{ gap: 1.5, py: 1.25 }}
          >
            <HelpIcon sx={{ fontSize: 20, color: tokens.colors.text.secondary }} />
            <Typography sx={{ fontSize: '0.9rem' }}>Help & Support</Typography>
          </MenuItem>
          <MenuItem
            onClick={() => setSettingsAnchor(null)}
            sx={{ gap: 1.5, py: 1.25 }}
          >
            <LogoutIcon sx={{ fontSize: 20, color: tokens.colors.text.secondary }} />
            <Typography sx={{ fontSize: '0.9rem' }}>Log Out</Typography>
          </MenuItem>
        </Menu>
      </Box>

    </Drawer>
  );
}
