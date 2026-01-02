/**
 * FriendRequestDialog - Send a friend request with optional message
 */

import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Avatar,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { PersonAddSharp as AddFriendIcon } from '@mui/icons-material';
import { tokens } from '../../theme';
import { CircleIcon } from '../../components';
import { BaseDialog, SuccessDialog } from '../../components/dialogs';

interface FriendRequestDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userName: string;
  userRank?: number;
}

export function FriendRequestDialog({
  open,
  onClose,
  onConfirm,
  userName,
  userRank = 1,
}: FriendRequestDialogProps) {
  const [message, setMessage] = useState('');

  const handleConfirm = () => {
    onConfirm();
    setMessage('');
  };

  const handleClose = () => {
    onClose();
    setMessage('');
  };

  return (
    <BaseDialog open={open} onClose={handleClose} title="Add Friend">
      <DialogContent sx={{ paddingTop: '24px !important' }}>
        <CircleIcon icon={<AddFriendIcon />} color={tokens.colors.primary} mb={2} />

        <Typography
          variant="body1"
          sx={{ color: tokens.colors.text.secondary, mb: 3, textAlign: 'center' }}
        >
          Send friend request to {userName}?
        </Typography>

        {/* User preview */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            p: 2,
            bgcolor: tokens.colors.background.elevated,
            borderRadius: 1,
            mb: 3,
          }}
        >
          <Avatar
            sx={{
              bgcolor: userRank <= 3 ? tokens.colors.primary : tokens.colors.background.paper,
            }}
          >
            {userName.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {userName}
            </Typography>
            <Typography variant="caption" sx={{ color: tokens.colors.text.disabled }}>
              Rank #{userRank}
            </Typography>
          </Box>
        </Box>

        {/* Optional message */}
        <TextField
          fullWidth
          label="Add a message (optional)"
          placeholder="Hey, let's play together!"
          multiline
          rows={2}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          inputProps={{ maxLength: 150 }}
          helperText={`${message.length}/150`}
          FormHelperTextProps={{
            sx: { textAlign: 'right', mr: 0 },
          }}
        />
      </DialogContent>
      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Button variant="outlined" onClick={handleClose}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleConfirm}>
          Send Request
        </Button>
      </DialogActions>
    </BaseDialog>
  );
}

// Confirmation dialog shown after request is sent
interface FriendRequestSentDialogProps {
  open: boolean;
  onClose: () => void;
  userName: string;
}

export function FriendRequestSentDialog({
  open,
  onClose,
  userName,
}: FriendRequestSentDialogProps) {
  return (
    <SuccessDialog
      open={open}
      onClose={onClose}
      icon={<AddFriendIcon />}
      title="Request Sent!"
      message={`${userName} will be notified of your friend request`}
    />
  );
}
