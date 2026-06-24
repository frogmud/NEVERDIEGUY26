import { useLocation, useNavigate } from 'react-router-dom';
import { Box, BottomNavigation, BottomNavigationAction } from '@mui/material';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import { tokens } from '../../theme';
import { useSoundContext } from '../../contexts/SoundContext';

/**
 * BottomNav - mobile primary navigation (Home / Play / Wiki / You).
 *
 * Matches the Figma mobile frames (Screens page `28:5`). Rendered by Shell on
 * mobile for browse routes only - it is hidden on immersive `/play*` routes.
 * The hamburger drawer (AppSidebar) remains for the long-tail destinations
 * (Graveyard, Settings, Help, Database, Notifications, ...).
 */

export const BOTTOM_NAV_HEIGHT = 64;

type TabValue = 'home' | 'play' | 'wiki' | 'you';

interface Tab {
  label: string;
  value: TabValue;
  path: string;
  iconSrc?: string;
  icon?: React.ReactNode;
}

const TABS: Tab[] = [
  { label: 'Home', value: 'home', path: '/', icon: <HomeRoundedIcon /> },
  { label: 'Play', value: 'play', path: '/play', iconSrc: '/assets/nav/nav1-play.svg' },
  { label: 'Wiki', value: 'wiki', path: '/wiki', iconSrc: '/assets/nav/nav2-wiki.svg' },
  { label: 'You', value: 'you', path: '/profile', icon: <PersonRoundedIcon /> },
];

/** Map the current pathname to the active tab (false = no tab selected). */
function activeTab(pathname: string): TabValue | false {
  if (pathname === '/' || pathname === '/home') return 'home';
  if (pathname.startsWith('/play')) return 'play';
  if (pathname.startsWith('/wiki')) return 'wiki';
  if (pathname === '/profile') return 'you';
  return false;
}

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { playUIClick } = useSoundContext();
  const current = activeTab(location.pathname);

  return (
    <Box
      component="nav"
      aria-label="Primary"
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1100,
        backgroundColor: tokens.colors.background.paper,
        borderTop: `1px solid ${tokens.colors.border}`,
        // Keep the bar clear of the home indicator / gesture area on notched phones.
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <BottomNavigation
        value={current}
        showLabels
        sx={{
          height: BOTTOM_NAV_HEIGHT,
          backgroundColor: 'transparent',
          '& .MuiBottomNavigationAction-root': {
            color: tokens.colors.text.secondary,
            minWidth: 0,
            px: 1,
            '&.Mui-selected': { color: tokens.colors.primary },
          },
          '& .MuiBottomNavigationAction-label': {
            fontSize: '0.7rem',
            mt: 0.5,
            '&.Mui-selected': { fontSize: '0.7rem' },
          },
        }}
      >
        {TABS.map((tab) => {
          const selected = current === tab.value;
          return (
            <BottomNavigationAction
              key={tab.value}
              value={tab.value}
              label={tab.label}
              icon={
                tab.iconSrc ? (
                  <Box
                    component="img"
                    src={tab.iconSrc}
                    alt=""
                    sx={{
                      width: 26,
                      height: 26,
                      imageRendering: 'pixelated',
                      // SVG icons carry their own color, so signal active state via opacity.
                      opacity: selected ? 1 : 0.55,
                      transition: 'opacity 150ms ease',
                    }}
                  />
                ) : (
                  tab.icon
                )
              }
              onClick={() => {
                playUIClick();
                navigate(tab.path);
              }}
            />
          );
        })}
      </BottomNavigation>
    </Box>
  );
}
