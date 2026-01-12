import { createTheme } from '@mui/material/styles';

// NDG Design Tokens - aligned with main design system
export const tokens = {
  colors: {
    primary: '#E90441',      // pinky red (accessible)
    secondary: '#00e5ff',    // cyan
    success: '#30d158',      // Apple green (DS aligned)
    error: '#ff453a',        // Apple red (DS aligned)
    warning: '#ffd60a',      // Apple yellow (DS aligned)
    background: {
      default: '#0a0a0a',
      paper: '#1a1a1a',
      elevated: '#242424',
    },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.7)',
      disabled: 'rgba(255, 255, 255, 0.5)',
    },
    border: 'rgba(255, 255, 255, 0.12)',
    // Item rarity colors (game standard)
    rarity: {
      common: '#9e9e9e',     // gray
      uncommon: '#4caf50',   // green
      rare: '#2196f3',       // blue
      epic: '#9c27b0',       // purple
      legendary: '#ff9800',  // orange
      unique: '#e91e63',     // pink
    },
    // Game-specific colors (Dice Meteor)
    game: {
      combo: {
        pair: '#4caf50',     // green
        trips: '#2196f3',    // blue
        quads: '#9c27b0',    // purple
        straight: '#ff9800', // orange
      },
      npc: {
        common: '#9e9e9e',   // gray
        rare: '#2196f3',     // blue
        elite: '#9c27b0',    // purple
        boss: '#ff9800',     // orange
      },
      dice: {
        d4: '#ff5722',       // deep orange
        d6: '#4caf50',       // green
        d8: '#2196f3',       // blue
        d10: '#9c27b0',      // purple
        d12: '#ff9800',      // orange
        d20: '#e91e63',      // pink
      },
      // UI-specific colors used across play screens
      gold: '#c4a000',       // Credits/gold currency
      epic: '#a855f7',       // Epic rarity (alt purple)
      anomaly: '#ec4899',    // Anomaly door type (pink)
      stable: '#6b7280',     // Stable/neutral gray
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  radius: {
    sm: 4,
    md: 8,
    lg: 12,
  },
  fonts: {
    primary: '"Inter", sans-serif',
    mono: '"IBM Plex Mono", monospace',
    gaming: '"m6x11plus", monospace',
  },
};

// Rarity color map - use this in components instead of recreating
// Import: import { RARITY_COLORS } from '../../theme';
export const RARITY_COLORS: Record<string, string> = {
  Common: tokens.colors.rarity.common,
  Uncommon: tokens.colors.rarity.uncommon,
  Rare: tokens.colors.rarity.rare,
  Epic: tokens.colors.rarity.epic,
  Legendary: tokens.colors.rarity.legendary,
  Unique: tokens.colors.rarity.unique,
};

// Role colors for admin screens
export const ROLE_COLORS: Record<string, string> = {
  Admin: tokens.colors.error,
  Moderator: tokens.colors.warning,
  Member: tokens.colors.text.secondary,
};

// Status colors for admin screens
export const STATUS_COLORS: Record<string, string> = {
  Active: tokens.colors.success,
  Inactive: tokens.colors.text.disabled,
  Suspended: tokens.colors.warning,
  Banned: tokens.colors.error,
  Pending: tokens.colors.warning,
};

// Presence colors for user status
export const PRESENCE_COLORS: Record<string, string> = {
  online: tokens.colors.success,
  away: tokens.colors.warning,
  busy: tokens.colors.error,
  offline: tokens.colors.text.disabled,
};

// Severity colors for moderation/alerts (4-level hierarchy)
export const SEVERITY_COLORS: Record<string, string> = {
  low: tokens.colors.text.secondary,
  medium: tokens.colors.warning,      // orange #ffd60a
  high: tokens.colors.warning,
  urgent: tokens.colors.error,
};

// Promise type configs for door selection UI
// Usage: import { PROMISE_CONFIGS } from '../../theme';
export const PROMISE_CONFIGS: Record<string, { color: string; label: string }> = {
  '+Credits': { color: tokens.colors.warning, label: 'Credits' },
  '+Data': { color: tokens.colors.secondary, label: 'Data' },
  'Rare Issuance': { color: tokens.colors.game.epic, label: 'Rare' },
  'Anomaly Chance': { color: tokens.colors.game.anomaly, label: 'Anomaly' },
  'Wanderer Bias': { color: tokens.colors.success, label: 'Wanderer' },
  'Heat Spike': { color: tokens.colors.error, label: 'Heat' },
  'Override': { color: tokens.colors.error, label: 'Override' },
};

// Door type configs for event selection UI
// Usage: import { DOOR_CONFIGS } from '../../theme';
export const DOOR_CONFIGS: Record<string, { color: string; bgColor: string }> = {
  stable: { color: tokens.colors.game.stable, bgColor: `${tokens.colors.game.stable}20` },
  elite: { color: tokens.colors.warning, bgColor: `${tokens.colors.warning}20` },
  anomaly: { color: tokens.colors.game.anomaly, bgColor: `${tokens.colors.game.anomaly}20` },
  audit: { color: tokens.colors.error, bgColor: `${tokens.colors.error}20` },
};

// Reusable sx patterns for consistency
export const sxPatterns = {
  // Selected nav item styling (Shell.tsx)
  selectedItem: {
    '&.Mui-selected': {
      backgroundColor: `${tokens.colors.primary}20`,
      '&:hover': {
        backgroundColor: `${tokens.colors.primary}30`,
      },
    },
  },
  // LinearProgress override (progress bars)
  progressBar: {
    height: 6,
    borderRadius: 3,
    bgcolor: tokens.colors.background.elevated,
    '& .MuiLinearProgress-bar': {
      bgcolor: tokens.colors.primary,
      borderRadius: 3,
    },
  },
  // TextField input styling
  inputField: {
    backgroundColor: tokens.colors.background.elevated,
  },
};

// Dialog PaperProps - use for consistent dialog styling
// Usage: <Dialog PaperProps={dialogPaperProps}>
export const dialogPaperProps = {
  sx: {
    bgcolor: tokens.colors.background.paper,
    border: `1px solid ${tokens.colors.border}`,
  },
};

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: tokens.colors.primary,
    },
    secondary: {
      main: tokens.colors.secondary,
    },
    background: {
      default: tokens.colors.background.default,
      paper: tokens.colors.background.paper,
    },
  },
  typography: {
    fontFamily: '"Inter", sans-serif',
    h1: { fontWeight: 700, fontSize: '2.5rem' },
    h2: { fontWeight: 600, fontSize: '2rem' },
    h3: { fontWeight: 600, fontSize: '1.5rem' },
    h4: { fontWeight: 600, fontSize: '1.25rem' },
    h5: { fontWeight: 500, fontSize: '1rem' },
    h6: { fontWeight: 500, fontSize: '0.875rem' },
    body1: { fontSize: '1rem' },
    body2: { fontSize: '0.875rem' },
    caption: { fontSize: '0.75rem', color: tokens.colors.text.secondary },
  },
  shape: {
    borderRadius: tokens.radius.md,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 400,
          padding: '6px 16px',
          fontSize: '0.875rem',
          borderColor: tokens.colors.border,
          '&.Mui-selected': {
            backgroundColor: `${tokens.colors.primary}20`,
            borderColor: tokens.colors.primary,
            '&:hover': {
              backgroundColor: `${tokens.colors.primary}30`,
            },
          },
        },
        sizeSmall: {
          padding: '4px 12px',
          fontSize: '0.8125rem',
        },
      },
    },
    MuiToggleButtonGroup: {
      styleOverrides: {
        root: {
          gap: 4,
        },
        grouped: {
          borderRadius: '6px !important',
          border: `1px solid ${tokens.colors.border} !important`,
          '&:not(:first-of-type)': {
            marginLeft: 0,
          },
        },
      },
    },
    MuiFormControlLabel: {
      styleOverrides: {
        root: {
          alignItems: 'center',
        },
      },
    },
  },
});
