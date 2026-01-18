import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, AppBar, Toolbar, InputBase, IconButton, Tooltip, Typography } from '@mui/material';
import {
  SearchSharp as SearchIcon,
  MenuSharp as MenuIcon,
  SettingsSharp as SettingsIcon,
  HelpOutlineSharp as HelpIcon,
  InfoSharp as AboutIcon,
} from '@mui/icons-material';
import { tokens } from '../../theme';
import { searchEntities, type AnyEntity } from '../../data/wiki';
import { HEADER_HEIGHT } from './navItems';
import { SearchPopover } from './SearchPopover';

interface AppTopbarProps {
  isMobile?: boolean;
  onMenuClick?: () => void;
}

export function AppTopbar({ isMobile = false, onMenuClick }: AppTopbarProps) {
  const navigate = useNavigate();

  // Search popover state
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

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: tokens.colors.background.default,
        borderBottom: `1px solid ${tokens.colors.border}`,
        // Ensure topbar is above 3D canvas and always receives pointer events
        zIndex: 1100,
        pointerEvents: 'auto',
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

        {/* Actions - Help, Settings, About */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Tooltip title="Help" arrow>
            <IconButton
              onClick={() => navigate('/help')}
              sx={{
                width: 32,
                height: 32,
                color: tokens.colors.text.secondary,
                '&:hover': { color: tokens.colors.text.primary },
              }}
            >
              <HelpIcon sx={{ fontSize: '1.1rem' }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Settings" arrow>
            <IconButton
              onClick={() => navigate('/settings')}
              sx={{
                width: 32,
                height: 32,
                color: tokens.colors.text.secondary,
                '&:hover': { color: tokens.colors.text.primary },
              }}
            >
              <SettingsIcon sx={{ fontSize: '1.1rem' }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="About" arrow>
            <IconButton
              onClick={() => navigate('/about')}
              sx={{
                width: 32,
                height: 32,
                color: tokens.colors.text.secondary,
                '&:hover': { color: tokens.colors.text.primary },
              }}
            >
              <AboutIcon sx={{ fontSize: '1.1rem' }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
