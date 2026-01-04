import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, AppBar, Toolbar, InputBase, IconButton, Badge, Tooltip, Typography, Avatar, Menu, MenuItem, ListItemIcon, Divider } from '@mui/material';
import {
  SearchSharp as SearchIcon,
  InboxSharp as InboxIcon,
  MenuSharp as MenuIcon,
  PublicSharp as CountryIcon,
  StarSharp as StarIcon,
  PersonSharp as ProfileIcon,
  SettingsSharp as SettingsIcon,
  LogoutSharp as LogoutIcon,
} from '@mui/icons-material';
import { tokens } from '../../theme';
import { searchEntities, type AnyEntity } from '../../data/wiki';
import { HEADER_HEIGHT } from './navItems';
import { SearchPopover } from './SearchPopover';
import { NotificationsMenu } from './NotificationsMenu';
import { useAuth, TRAVELER_OPTIONS } from '../../contexts/AuthContext';

interface AppTopbarProps {
  isMobile?: boolean;
  onMenuClick?: () => void;
}

export function AppTopbar({ isMobile = false, onMenuClick }: AppTopbarProps) {
  const navigate = useNavigate();
  const { user, isAuthenticated, signOut, selectedTraveler, selectTraveler, clearTraveler } = useAuth();

  // User menu state
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const userMenuOpen = Boolean(userMenuAnchor);

  // Notification menu state
  const [notifAnchor, setNotifAnchor] = useState<null | HTMLElement>(null);
  const notifOpen = Boolean(notifAnchor);

  // Search popover state
  const [searchAnchor, setSearchAnchor] = useState<null | HTMLElement>(null);
  const [searchValue, setSearchValue] = useState('');
  const [searchResults, setSearchResults] = useState<AnyEntity[]>([]);
  const searchOpen = Boolean(searchAnchor) && searchValue.length > 0;

  const handleSignOut = () => {
    setUserMenuAnchor(null);
    signOut();
    navigate('/');
  };

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

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: tokens.colors.background.default,
        borderBottom: `1px solid ${tokens.colors.border}`,
      }}
    >
      <Toolbar
        sx={{ gap: 2, minHeight: `${HEADER_HEIGHT}px !important`, height: HEADER_HEIGHT, px: 2 }}
      >
        {/* Mobile: Hamburger menu */}
        {isMobile && (
          <IconButton onClick={onMenuClick} sx={{ color: tokens.colors.text.primary }}>
            <MenuIcon />
          </IconButton>
        )}

        {/* Mobile: Center logo and brand */}
        {isMobile ? (
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
        ) : (
          <Box sx={{ flex: 1 }} />
        )}

        {/* Search with popover - pill shaped, hide on mobile */}
        {!isMobile && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: tokens.colors.background.paper,
              borderRadius: '999px',
              px: 2,
              py: 0.75,
              width: 160,
              position: 'relative',
            }}
          >
            <InputBase
              placeholder="Search"
              value={searchValue}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={(e) => setSearchAnchor(e.currentTarget.parentElement)}
              onBlur={() => setTimeout(() => setSearchAnchor(null), 200)}
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
        )}

        {/* Search results popover */}
        <SearchPopover
          open={searchOpen}
          anchorEl={searchAnchor}
          onClose={() => setSearchAnchor(null)}
          searchValue={searchValue}
          searchResults={searchResults}
          onResultClick={handleResultClick}
          onViewAll={handleSearchSubmit}
        />

        {/* Actions - Notifications, Avatar */}
        <Tooltip title="Notifications" arrow>
          <IconButton
            onClick={(e) => setNotifAnchor(e.currentTarget)}
            sx={{
              width: 36,
              height: 36,
              color: tokens.colors.text.secondary,
              '&:hover': { color: tokens.colors.text.primary },
            }}
          >
            <Badge
              badgeContent={99}
              max={99}
              sx={{
                '& .MuiBadge-badge': {
                  backgroundColor: tokens.colors.primary,
                  color: 'white',
                  fontSize: '0.5625rem',
                  fontWeight: 600,
                  minWidth: 16,
                  height: 16,
                  padding: '0 4px',
                },
              }}
            >
              <InboxIcon sx={{ fontSize: '1.25rem' }} />
            </Badge>
          </IconButton>
        </Tooltip>

        {/* Profile Avatar with menu */}
        <Tooltip
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, py: 0.25 }}>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
                @{isAuthenticated && user ? user.name : selectedTraveler ? selectedTraveler.name : 'Guest'}
              </Typography>
              <CountryIcon sx={{ fontSize: 12 }} />
              {isAuthenticated && <StarIcon sx={{ fontSize: 12, color: tokens.colors.warning }} />}
            </Box>
          }
          arrow
          placement="bottom-end"
        >
          <Avatar
            onClick={(e) => setUserMenuAnchor(e.currentTarget)}
            src={selectedTraveler && !isAuthenticated ? selectedTraveler.portrait : undefined}
            sx={{
              width: 32,
              height: 32,
              bgcolor: isAuthenticated ? tokens.colors.primary : selectedTraveler ? tokens.colors.background.paper : tokens.colors.background.elevated,
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: selectedTraveler && !isAuthenticated ? `2px solid ${tokens.colors.primary}` : 'none',
              '&:hover': { opacity: 0.8 },
            }}
          >
            {isAuthenticated && user ? user.name.charAt(0).toUpperCase() : !selectedTraveler ? 'G' : null}
          </Avatar>
        </Tooltip>

        {/* User dropdown menu */}
        <Menu
          anchorEl={userMenuAnchor}
          open={userMenuOpen}
          onClose={() => setUserMenuAnchor(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          PaperProps={{
            sx: {
              mt: 1,
              minWidth: 180,
              bgcolor: tokens.colors.background.paper,
              border: `1px solid ${tokens.colors.border}`,
            },
          }}
        >
          {isAuthenticated && user ? [
              <Box key="user-info" sx={{ px: 2, py: 1.5 }}>
                <Typography sx={{ fontWeight: 600 }}>{user.name}</Typography>
                <Typography variant="caption" sx={{ color: tokens.colors.text.secondary }}>
                  Level {user.level} · {user.points.toLocaleString()} pts
                </Typography>
              </Box>,
              <Divider key="div1" sx={{ borderColor: tokens.colors.border }} />,
              <MenuItem
                key="profile"
                onClick={() => {
                  setUserMenuAnchor(null);
                  navigate('/profile');
                }}
              >
                <ListItemIcon>
                  <ProfileIcon fontSize="small" />
                </ListItemIcon>
                View Profile
              </MenuItem>,
              <MenuItem
                key="settings"
                onClick={() => {
                  setUserMenuAnchor(null);
                  navigate('/settings');
                }}
              >
                <ListItemIcon>
                  <SettingsIcon fontSize="small" />
                </ListItemIcon>
                Settings
              </MenuItem>,
              <Divider key="div2" sx={{ borderColor: tokens.colors.border }} />,
              <MenuItem key="signout" onClick={handleSignOut} sx={{ color: tokens.colors.error }}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" sx={{ color: tokens.colors.error }} />
                </ListItemIcon>
                Sign Out
              </MenuItem>,
            ] : [
              <Box key="traveler-header" sx={{ px: 2, py: 1.5 }}>
                <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                  {selectedTraveler ? selectedTraveler.name : 'Choose Traveler'}
                </Typography>
                <Typography variant="caption" sx={{ color: tokens.colors.text.secondary }}>
                  {selectedTraveler ? 'Playing as this character' : 'Select who you want to be'}
                </Typography>
              </Box>,
              <Divider key="div-travelers" sx={{ borderColor: tokens.colors.border }} />,
              <Box key="traveler-grid" sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, p: 1.5 }}>
                {TRAVELER_OPTIONS.map((traveler) => (
                  <Tooltip key={traveler.slug} title={traveler.name} arrow placement="top">
                    <Avatar
                      src={traveler.portrait}
                      onClick={() => {
                        selectTraveler(traveler.slug);
                        setUserMenuAnchor(null);
                      }}
                      sx={{
                        width: 40,
                        height: 40,
                        cursor: 'pointer',
                        border: selectedTraveler?.slug === traveler.slug ? `2px solid ${tokens.colors.primary}` : `2px solid transparent`,
                        '&:hover': {
                          border: `2px solid ${tokens.colors.text.secondary}`,
                          transform: 'scale(1.1)',
                        },
                        transition: 'all 0.15s ease',
                      }}
                    />
                  </Tooltip>
                ))}
              </Box>,
              selectedTraveler && (
                <Box key="guest-option">
                  <Divider sx={{ borderColor: tokens.colors.border }} />
                  <MenuItem
                    onClick={() => {
                      clearTraveler();
                      setUserMenuAnchor(null);
                    }}
                    sx={{ justifyContent: 'center', color: tokens.colors.text.secondary }}
                  >
                    Play as Guest
                  </MenuItem>
                </Box>
              ),
            ].filter(Boolean)}
        </Menu>

        {/* Notifications dropdown */}
        <NotificationsMenu
          anchorEl={notifAnchor}
          open={notifOpen}
          onClose={() => setNotifAnchor(null)}
          onViewAll={() => {
            setNotifAnchor(null);
            navigate('/notifications');
          }}
        />
      </Toolbar>
    </AppBar>
  );
}
