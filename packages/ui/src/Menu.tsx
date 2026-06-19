import { ReactNode } from 'react';
import { Box, Typography, SxProps, Theme } from '@mui/material';
import { tokens } from '@neverdieguy/tokens';

export interface MenuItemProps {
  label: string;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  sx?: SxProps<Theme>;
}

/**
 * MenuItem - a single row in a Menu. Maps to the BONES "MenuItem" component
 * (State=Default|Hover|Selected|Disabled). Selected shows a trailing check.
 */
export function MenuItem({ label, selected, disabled, onClick, sx }: MenuItemProps) {
  return (
    <Box
      role="menuitem"
      aria-disabled={disabled}
      onClick={disabled ? undefined : onClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        px: 1.5,
        py: 1,
        borderRadius: `${tokens.radius.sm}px`,
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        color: selected ? tokens.colors.primary : tokens.colors.text.primary,
        '&:hover': disabled ? undefined : { backgroundColor: tokens.colors.background.elevated },
        ...sx,
      }}
    >
      <Typography variant="body2">{label}</Typography>
      {selected && <Typography variant="body2">✓</Typography>}
    </Box>
  );
}

export interface MenuProps {
  children: ReactNode;
  sx?: SxProps<Theme>;
}

/**
 * Menu - dropdown panel that holds MenuItems.
 */
export function Menu({ children, sx }: MenuProps) {
  return (
    <Box
      role="menu"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 0.25,
        p: 0.5,
        minWidth: 200,
        backgroundColor: tokens.colors.background.paper,
        border: `1px solid ${tokens.colors.border}`,
        borderRadius: `${tokens.radius.md}px`,
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}
