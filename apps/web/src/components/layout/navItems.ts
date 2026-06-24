// Nav item type definitions
export type NavItem = {
  label: string;
  icon?: React.ReactNode;
  iconSrc?: string; // SVG path for custom nav icons
  path?: string;
  children?: NavItem[];
  count?: number;
  isSection?: boolean;
  requiresAuth?: boolean; // If true, hide when not authenticated
};

// Nav icon asset paths - single source so BottomNav and the sidebar agree.
export const PLAY_ICON_SRC = '/assets/nav/nav1-play.svg';
export const WIKI_ICON_SRC = '/assets/nav/nav2-wiki.svg';

// MVP Nav: Core navigation entries (keep minimal)
export const navItems: NavItem[] = [
  { label: 'Play', iconSrc: PLAY_ICON_SRC, path: '/play' },
  { label: 'Wiki', iconSrc: WIKI_ICON_SRC, path: '/wiki' },
];

export const DRAWER_WIDTH_COLLAPSED = 58;
export const DRAWER_WIDTH_EXPANDED = 140;
export const HEADER_HEIGHT = 56;
