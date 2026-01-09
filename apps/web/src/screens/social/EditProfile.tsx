/**
 * EditProfile - Edit user profile information
 * Basic info: avatar, display name, bio, status
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadProfile, saveProfile } from '../../data/player/storage';
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
import { tokens, dialogPaperProps, PRESENCE_COLORS } from '../../theme';
import { PageHeader } from '../../components/Placeholder';
import { CardSection } from '../../components/CardSection';
import { SectionHeader } from '../../components/SectionHeader';

// Status options (same as Settings.tsx)
const statusOptions = [
  { id: 'online', label: 'Online', color: PRESENCE_COLORS.online },
  { id: 'away', label: 'Away', color: PRESENCE_COLORS.away },
  { id: 'dnd', label: 'Do Not Disturb', color: PRESENCE_COLORS.busy },
  { id: 'invisible', label: 'Invisible', color: PRESENCE_COLORS.offline },
];

// Preset avatar options (icons/colors for MVP)
const avatarPresets = [
  { id: 'skull', emoji: null, bg: tokens.colors.primary },
  { id: 'dice', emoji: null, bg: tokens.colors.secondary },
  { id: 'flame', emoji: null, bg: '#ff6b00' },
  { id: 'void', emoji: null, bg: '#7c4dff' },
  { id: 'earth', emoji: null, bg: '#4caf50' },
  { id: 'water', emoji: null, bg: '#2196f3' },
  { id: 'dark', emoji: null, bg: '#424242' },
  { id: 'light', emoji: null, bg: '#ffc107' },
];

const BIO_MAX_LENGTH = 160;

export function EditProfile() {
  const navigate = useNavigate();

  // Form state - initialized from storage
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'online' | 'away' | 'dnd' | 'invisible'>('online');
  const [selectedAvatar, setSelectedAvatar] = useState('skull');
  const [playerNumber, setPlayerNumber] = useState(1);

  // Avatar picker dialog
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);

  // Load profile on mount
  useEffect(() => {
    const profile = loadProfile();
    setDisplayName(profile.displayName);
    setBio(profile.bio);
    setSelectedStatus(profile.status);
    setSelectedAvatar(profile.avatarId);
    setPlayerNumber(profile.playerNumber);
  }, []);

  const handleBioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= BIO_MAX_LENGTH) {
      setBio(value);
    }
  };

  const handleSave = () => {
    saveProfile({
      displayName: displayName.trim() || 'Player',
      bio,
      status: selectedStatus,
      avatarId: selectedAvatar,
      playerNumber,
      updatedAt: Date.now(),
    });
    navigate('/profile');
  };

  const handleCancel = () => {
    navigate('/profile');
  };

  const currentAvatarBg = avatarPresets.find(a => a.id === selectedAvatar)?.bg || tokens.colors.primary;

  return (
    <Box>
      <PageHeader title="Edit Profile" />

      <CardSection padding={4}>
        {/* Avatar Section */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
          <Avatar
            onClick={() => setAvatarDialogOpen(true)}
            sx={{
              width: 120,
              height: 120,
              mb: 2,
              backgroundColor: currentAvatarBg,
              fontSize: '3rem',
              cursor: 'pointer',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'scale(1.05)',
              },
            }}
          >
            {displayName.charAt(0).toUpperCase()}
          </Avatar>
          <Button
            variant="outlined"
            size="small"
            startIcon={<CameraIcon />}
            onClick={() => setAvatarDialogOpen(true)}
          >
            Change Avatar
          </Button>
        </Box>

        {/* Display Name */}
        <TextField
          label="Display Name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          fullWidth
          sx={{ mb: 3 }}
          helperText="This is how other players see you"
          slotProps={{
            input: {
              sx: { backgroundColor: tokens.colors.background.elevated },
            },
          }}
        />

        {/* Bio */}
        <TextField
          label="Bio"
          value={bio}
          onChange={handleBioChange}
          fullWidth
          multiline
          rows={3}
          placeholder="Tell others about yourself..."
          sx={{ mb: 1 }}
          slotProps={{
            input: {
              sx: { backgroundColor: tokens.colors.background.elevated },
            },
          }}
        />
        <Typography
          variant="caption"
          sx={{
            color: bio.length >= BIO_MAX_LENGTH ? tokens.colors.error : tokens.colors.text.secondary,
            display: 'block',
            textAlign: 'right',
            mb: 3,
          }}
        >
          {bio.length}/{BIO_MAX_LENGTH}
        </Typography>

        {/* Status */}
        <SectionHeader title="Status" subtitle="Let others know your availability" sx={{ mb: 2 }} />
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 4 }}>
          {statusOptions.map((option) => (
            <Box
              key={option.id}
              onClick={() => setSelectedStatus(option.id as 'online' | 'away' | 'dnd' | 'invisible')}
              sx={{
                p: 1.5,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                cursor: 'pointer',
                borderRadius: 1,
                backgroundColor: selectedStatus === option.id ? tokens.colors.background.elevated : 'transparent',
                '&:hover': { backgroundColor: tokens.colors.background.elevated },
              }}
            >
              <CircleIcon sx={{ color: option.color, fontSize: 12 }} />
              <Typography variant="body2" sx={{ flex: 1 }}>{option.label}</Typography>
              {selectedStatus === option.id && (
                <CheckIcon sx={{ color: tokens.colors.primary, fontSize: 18 }} />
              )}
            </Box>
          ))}
        </Box>

        {/* Actions */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" fullWidth onClick={handleCancel}>
            Cancel
          </Button>
          <Button variant="contained" fullWidth onClick={handleSave}>
            Save Changes
          </Button>
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
          <Typography variant="h5" component="span">Choose Avatar</Typography>
          <IconButton onClick={() => setAvatarDialogOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ paddingTop: '24px !important' }}>
          <Typography variant="body2" sx={{ color: tokens.colors.text.secondary, mb: 3 }}>
            Select a color theme for your avatar
          </Typography>
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
                    alignItems: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <Avatar
                    sx={{
                      width: 56,
                      height: 56,
                      backgroundColor: preset.bg,
                      fontSize: '1.5rem',
                      border: selectedAvatar === preset.id
                        ? `3px solid ${tokens.colors.primary}`
                        : '3px solid transparent',
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'scale(1.1)',
                      },
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
