/**
 * Profile - Edit user profile within settings
 * Avatar, display name, bio, status
 */

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Avatar,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Grid,
} from '@mui/material';
import {
  CloseSharp as CloseIcon,
  Circle as CircleIcon,
  CheckSharp as CheckIcon,
  CameraAltSharp as CameraIcon,
} from '@mui/icons-material';
import { tokens, dialogPaperProps, PRESENCE_COLORS } from '../../../theme';
import { SectionHeader } from '../../../components/SectionHeader';
import { CardSection } from '../../../components/CardSection';
import { loadProfile, saveProfile, type ProfileData } from '../../../data/player/storage';

// Status options
const statusOptions = [
  { id: 'online', label: 'Online', color: PRESENCE_COLORS.online },
  { id: 'away', label: 'Away', color: PRESENCE_COLORS.away },
  { id: 'dnd', label: 'Do Not Disturb', color: PRESENCE_COLORS.busy },
  { id: 'invisible', label: 'Invisible', color: PRESENCE_COLORS.offline },
];

// Avatar color presets (matching EditProfile.tsx and Profile.tsx)
const avatarPresets = [
  { id: 'skull', bg: tokens.colors.primary },
  { id: 'dice', bg: tokens.colors.secondary },
  { id: 'flame', bg: '#ff6b00' },
  { id: 'void', bg: '#7c4dff' },
  { id: 'earth', bg: '#4caf50' },
  { id: 'water', bg: '#2196f3' },
  { id: 'dark', bg: '#424242' },
  { id: 'light', bg: '#ffc107' },
];

const BIO_MAX_LENGTH = 160;

export function ProfileSection() {
  // Form state - loaded from storage
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'online' | 'away' | 'dnd' | 'invisible'>('online');
  const [selectedAvatar, setSelectedAvatar] = useState('skull');

  // Avatar picker dialog
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);

  // Load profile on mount
  useEffect(() => {
    const profile = loadProfile();
    setDisplayName(profile.displayName);
    setBio(profile.bio);
    setSelectedStatus(profile.status);
    setSelectedAvatar(profile.avatarId);
  }, []);

  // Auto-save profile on changes (debounced effect)
  useEffect(() => {
    // Skip initial empty state
    if (!displayName) return;

    const timer = setTimeout(() => {
      saveProfile({
        displayName: displayName.trim() || 'Player',
        bio,
        status: selectedStatus,
        avatarId: selectedAvatar,
        updatedAt: Date.now(),
      });
    }, 500); // Debounce 500ms

    return () => clearTimeout(timer);
  }, [displayName, bio, selectedStatus, selectedAvatar]);

  const handleBioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= BIO_MAX_LENGTH) {
      setBio(value);
    }
  };

  const currentAvatarBg = avatarPresets.find(a => a.id === selectedAvatar)?.bg || tokens.colors.primary;

  return (
    <Box>
      <SectionHeader
        title="Profile"
        subtitle="Edit your public profile information"
        sx={{ mb: 3 }}
      />

      {/* Avatar & Name */}
      <CardSection sx={{ mb: 3, p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3.5 }}>
          <Avatar
            onClick={() => setAvatarDialogOpen(true)}
            sx={{
              width: 80,
              height: 80,
              backgroundColor: currentAvatarBg,
              fontSize: '2rem',
              cursor: 'pointer',
              transition: 'transform 0.2s',
              '&:hover': { transform: 'scale(1.05)' },
            }}
          >
            {displayName.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <TextField
              label="Display Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              fullWidth
              size="small"
              slotProps={{
                input: {
                  sx: { backgroundColor: tokens.colors.background.elevated },
                },
              }}
            />
            <Button
              size="small"
              startIcon={<CameraIcon sx={{ fontSize: 16 }} />}
              onClick={() => setAvatarDialogOpen(true)}
              sx={{ mt: 1, color: tokens.colors.text.secondary }}
            >
              Change Avatar
            </Button>
          </Box>
        </Box>

        {/* Bio */}
        <TextField
          label="Bio"
          value={bio}
          onChange={handleBioChange}
          fullWidth
          multiline
          rows={3}
          placeholder="Tell others about yourself..."
          slotProps={{
            input: {
              sx: { backgroundColor: tokens.colors.background.elevated },
            },
          }}
        />
        <Typography
          variant="caption"
          sx={{
            color: bio.length >= BIO_MAX_LENGTH ? tokens.colors.error : tokens.colors.text.disabled,
            display: 'block',
            textAlign: 'right',
            mt: 0.5,
          }}
        >
          {bio.length}/{BIO_MAX_LENGTH}
        </Typography>
      </CardSection>

      {/* Status */}
      <CardSection sx={{ p: 3 }}>
        <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
          Status
        </Typography>
        <Typography variant="body2" sx={{ color: tokens.colors.text.secondary, mb: 2.5 }}>
          Let others know your availability
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {statusOptions.map((option, index) => (
            <Box
              key={option.id}
              onClick={() => setSelectedStatus(option.id as 'online' | 'away' | 'dnd' | 'invisible')}
              sx={{
                px: 2,
                py: 1.5,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                cursor: 'pointer',
                backgroundColor: selectedStatus === option.id ? tokens.colors.background.elevated : 'transparent',
                '&:hover': { backgroundColor: tokens.colors.background.elevated },
                // Match container corner radius on first/last items
                ...(index === 0 && { borderTopLeftRadius: '8px', borderTopRightRadius: '8px' }),
                ...(index === statusOptions.length - 1 && { borderBottomLeftRadius: '8px', borderBottomRightRadius: '8px' }),
              }}
            >
              <CircleIcon sx={{ color: option.color, fontSize: 12 }} />
              <Typography
                variant="body2"
                sx={{ flex: 1, fontWeight: selectedStatus === option.id ? 600 : 400 }}
              >
                {option.label}
              </Typography>
              {selectedStatus === option.id && (
                <CheckIcon sx={{ color: tokens.colors.primary, fontSize: 18 }} />
              )}
            </Box>
          ))}
        </Box>
      </CardSection>

      {/* Avatar Picker Dialog */}
      <Dialog
        open={avatarDialogOpen}
        onClose={() => setAvatarDialogOpen(false)}
        maxWidth="xs"
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
          <Typography variant="h6" component="span">Choose Avatar Color</Typography>
          <IconButton onClick={() => setAvatarDialogOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={2}>
            {avatarPresets.map((preset) => (
              <Grid size={3} key={preset.id}>
                <Box
                  onClick={() => {
                    setSelectedAvatar(preset.id);
                    setAvatarDialogOpen(false);
                  }}
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <Avatar
                    sx={{
                      width: 48,
                      height: 48,
                      backgroundColor: preset.bg,
                      fontSize: '1.25rem',
                      border: selectedAvatar === preset.id
                        ? `3px solid ${tokens.colors.primary}`
                        : '3px solid transparent',
                      transition: 'transform 0.2s',
                      '&:hover': { transform: 'scale(1.1)' },
                    }}
                  >
                    {displayName.charAt(0).toUpperCase()}
                  </Avatar>
                </Box>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
