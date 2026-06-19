import { ReactNode } from 'react';
import { Drawer as MuiDrawer, Box, Typography, IconButton } from '@mui/material';
import { tokens } from '@neverdieguy/tokens';

export interface DrawerProps {
  open: boolean;
  title?: string;
  onClose?: () => void;
  children?: ReactNode;
  anchor?: 'left' | 'right';
  width?: number;
}

/**
 * Drawer - side panel shell with a header + close. Maps to the BONES "Drawer" component
 * (State=Default|Empty). The body content is a slot (the BONES default fills it with the
 * Eternal Stream chat).
 */
export function Drawer({
  open,
  title,
  onClose,
  children,
  anchor = 'right',
  width = 360,
}: DrawerProps) {
  return (
    <MuiDrawer
      open={open}
      onClose={onClose}
      anchor={anchor}
      PaperProps={{
        sx: {
          width,
          backgroundColor: tokens.colors.background.paper,
          borderLeft: `1px solid ${tokens.colors.border}`,
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1.5,
          borderBottom: `1px solid ${tokens.colors.border}`,
        }}
      >
        <Typography sx={{ fontWeight: 600 }}>{title}</Typography>
        {onClose && (
          <IconButton aria-label="close" size="small" onClick={onClose} sx={{ color: tokens.colors.text.secondary }}>
            ×
          </IconButton>
        )}
      </Box>
      <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>{children}</Box>
    </MuiDrawer>
  );
}
