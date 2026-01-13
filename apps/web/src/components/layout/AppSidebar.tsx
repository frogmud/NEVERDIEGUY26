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
} from '@mui/material';
import {
  ExpandMoreSharp as ExpandIcon,
  ExpandLessSharp as CollapseIcon,
  ChevronLeftSharp as CollapseLeftIcon,
  ChevronRightSharp as ExpandRightIcon,
} from '@mui/icons-material';
import { tokens, sxPatterns } from '../../theme';
import { navItems, type NavItem, DRAWER_WIDTH_COLLAPSED, DRAWER_WIDTH_EXPANDED, HEADER_HEIGHT } from './navItems';
import { useAuth } from '../../contexts';

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
  const { isAuthenticated } = useAuth();

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

      {/* Bottom actions: Collapse toggle only */}
      {onToggleExpand && (
        <Box sx={{ borderTop: `1px solid ${tokens.colors.border}`, py: 2, display: 'flex', justifyContent: 'center' }}>
          <Tooltip title={expanded ? 'Collapse' : 'Expand'} placement="right" arrow enterDelay={300} enterNextDelay={300}>
            <IconButton
              onClick={onToggleExpand}
              size="small"
              sx={{
                color: tokens.colors.text.secondary,
                '&:hover': { bgcolor: tokens.colors.background.elevated },
              }}
            >
              {expanded ? <CollapseLeftIcon sx={{ fontSize: 18 }} /> : <ExpandRightIcon sx={{ fontSize: 18 }} />}
            </IconButton>
          </Tooltip>
        </Box>
      )}
    </Drawer>
  );
}
