/**
 * BlockUserDialog - Confirmation dialog for blocking a user
 */

import { Typography, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import {
  BlockSharp as BlockIcon,
  VisibilityOffSharp as HideIcon,
  MessageSharp as MessageIcon,
  PersonRemoveSharp as UnfriendIcon,
} from '@mui/icons-material';
import { tokens } from '../../theme';
import { ConfirmDialog } from '../../components/dialogs';

interface BlockUserDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userName: string;
}

export function BlockUserDialog({
  open,
  onClose,
  onConfirm,
  userName,
}: BlockUserDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      onClose={onClose}
      onConfirm={onConfirm}
      title={`Block ${userName}?`}
      icon={<BlockIcon />}
      iconColor={tokens.colors.error}
      confirmLabel="Block User"
      confirmColor="error"
    >
      {/* What blocking does */}
      <Typography
        variant="body2"
        sx={{ color: tokens.colors.text.secondary, mb: 2 }}
      >
        Blocking this user will:
      </Typography>

      <List dense sx={{ mb: 2 }}>
        <ListItem sx={{ px: 0 }}>
          <ListItemIcon sx={{ minWidth: 36 }}>
            <HideIcon fontSize="small" sx={{ color: tokens.colors.text.disabled }} />
          </ListItemIcon>
          <ListItemText
            primary="Hide your profile and activity from them"
            primaryTypographyProps={{
              variant: 'body2',
              color: tokens.colors.text.secondary,
            }}
          />
        </ListItem>
        <ListItem sx={{ px: 0 }}>
          <ListItemIcon sx={{ minWidth: 36 }}>
            <MessageIcon fontSize="small" sx={{ color: tokens.colors.text.disabled }} />
          </ListItemIcon>
          <ListItemText
            primary="Stop messages and challenges from them"
            primaryTypographyProps={{
              variant: 'body2',
              color: tokens.colors.text.secondary,
            }}
          />
        </ListItem>
        <ListItem sx={{ px: 0 }}>
          <ListItemIcon sx={{ minWidth: 36 }}>
            <UnfriendIcon fontSize="small" sx={{ color: tokens.colors.text.disabled }} />
          </ListItemIcon>
          <ListItemText
            primary="Remove you from each other's friends list"
            primaryTypographyProps={{
              variant: 'body2',
              color: tokens.colors.text.secondary,
            }}
          />
        </ListItem>
      </List>

      {/* Reassurance */}
      <Typography
        variant="caption"
        sx={{ color: tokens.colors.text.disabled, display: 'block' }}
      >
        You can unblock this user from your settings at any time.
      </Typography>
    </ConfirmDialog>
  );
}
