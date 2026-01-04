/**
 * Account - Email, password, 2FA, and security settings
 * Extracted from Settings.tsx
 */

import { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import {
  CloseSharp as CloseIcon,
  ChevronRightSharp as ChevronRightIcon,
} from '@mui/icons-material';
import { tokens, dialogPaperProps } from '../../../theme';
import { SectionHeader } from '../../../components/SectionHeader';
import { CardSection } from '../../../components/CardSection';

const accountItems = [
  { id: 'email', label: 'Email', value: 'user@example.com' },
  { id: 'password', label: 'Password', value: '********' },
];

export function AccountSection() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<string | null>(null);

  // Form states
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleItemClick = (id: string) => {
    setActiveItem(id);
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
    setActiveItem(null);
    // Reset forms
    setNewEmail('');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const renderDialogContent = () => {
    switch (activeItem) {
      case 'email':
        return (
          <>
            <Typography variant="body2" sx={{ color: tokens.colors.text.secondary, mb: 3 }}>
              Update your email address. You'll need to verify the new email.
            </Typography>
            <TextField
              fullWidth
              label="Current email"
              value="user@example.com"
              disabled
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="New email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="Enter new email"
            />
          </>
        );
      case 'password':
        return (
          <form onSubmit={(e) => e.preventDefault()}>
            <Typography variant="body2" sx={{ color: tokens.colors.text.secondary, mb: 3 }}>
              Choose a strong password with at least 8 characters.
            </Typography>
            <input type="hidden" name="username" autoComplete="username" value="user@example.com" readOnly />
            <TextField
              fullWidth
              label="Current password"
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="New password"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Confirm password"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </form>
        );
      default:
        return null;
    }
  };

  return (
    <Box>
      <SectionHeader
        title="Account"
        subtitle="Manage your account security"
        sx={{ mb: 3 }}
      />

      {/* Account Settings */}
      <CardSection padding={0} sx={{ mb: 3 }}>
        {accountItems.map((item, i) => (
          <Box
            key={item.id}
            onClick={() => handleItemClick(item.id)}
            sx={{
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom:
                i < accountItems.length - 1
                  ? `1px solid ${tokens.colors.border}`
                  : 'none',
              cursor: 'pointer',
              '&:hover': { backgroundColor: tokens.colors.background.elevated },
            }}
          >
            <Box>
              <Typography variant="body1">{item.label}</Typography>
              <Typography variant="caption" sx={{ color: tokens.colors.text.disabled }}>
                {item.value}
              </Typography>
            </Box>
            <ChevronRightIcon sx={{ color: tokens.colors.text.disabled }} />
          </Box>
        ))}
      </CardSection>

      {/* Danger Zone */}
      <CardSection>
        <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5, color: tokens.colors.error }}>
          Danger Zone
        </Typography>
        <Typography variant="body2" sx={{ color: tokens.colors.text.secondary, mb: 3 }}>
          Irreversible actions for your account
        </Typography>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" color="inherit" size="small">
            Export Data
          </Button>
          <Button variant="outlined" color="error" size="small">
            Delete Account
          </Button>
        </Box>
      </CardSection>

      {/* Settings Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={dialogPaperProps}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: `1px solid ${tokens.colors.border}`,
            pb: 2,
          }}
        >
          <Typography variant="h5" component="span">
            {accountItems.find((i) => i.id === activeItem)?.label}
          </Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: '24px !important' }}>
          {renderDialogContent()}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={handleClose}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
