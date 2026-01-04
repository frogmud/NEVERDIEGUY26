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

// MVP Nav: 4 simple entries, no dropdowns
// Play is accessible without auth; Wiki, Progress, Barter require auth
export const navItems: NavItem[] = [
  { label: 'Play', iconSrc: '/assets/nav/nav1-play.svg', path: '/play' },
  { label: 'Wiki', iconSrc: '/assets/nav/nav2-wiki.svg', path: '/wiki', requiresAuth: true },
  { label: 'Progress', iconSrc: '/assets/nav/nav3-progress.svg', path: '/progress', requiresAuth: true },
  { label: 'Barter', iconSrc: '/assets/nav/nav4-market.svg', path: '/shop', requiresAuth: true },
];

export const DRAWER_WIDTH_COLLAPSED = 58;
export const DRAWER_WIDTH_EXPANDED = 140;
export const HEADER_HEIGHT = 56;
