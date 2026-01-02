import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadProfile, type ProfileData } from '../../data/player/storage';
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Button,
  Skeleton,
  Chip,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import {
  Close as CloseIcon,
  Share as ShareIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import { tokens, dialogPaperProps, PRESENCE_COLORS } from '../../theme';
import { PageHeader, StatsRow, CardGrid } from '../../components/Placeholder';
import { CardSection } from '../../components/CardSection';

// Avatar color mapping (matches EditProfile)
const AVATAR_COLORS: Record<string, string> = {
  skull: tokens.colors.primary,
  dice: tokens.colors.secondary,
  flame: '#ff6b00',
  void: '#7c4dff',
  earth: '#4caf50',
  water: '#2196f3',
  dark: '#424242',
  light: '#ffc107',
};

// Status display mapping
const STATUS_COLORS: Record<string, string> = {
  online: PRESENCE_COLORS.online,
  away: PRESENCE_COLORS.away,
  dnd: PRESENCE_COLORS.busy,
  invisible: PRESENCE_COLORS.offline,
};

export function Profile() {
  const navigate = useNavigate();
  const [shareOpen, setShareOpen] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);

  useEffect(() => {
    setProfile(loadProfile());
  }, []);

  const avatarColor = AVATAR_COLORS[profile?.avatarId || 'skull'] || tokens.colors.primary;
  const statusColor = STATUS_COLORS[profile?.status || 'online'] || PRESENCE_COLORS.online;
  const displayName = profile?.displayName || 'Player';

  return (
    <Box>
      {/* Profile header */}
      <CardSection padding={4} sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
        <Box sx={{ position: 'relative' }}>
          <Avatar
            sx={{
              width: 120,
              height: 120,
              backgroundColor: avatarColor,
              fontSize: '3rem',
            }}
          >
            {displayName.charAt(0).toUpperCase()}
          </Avatar>
          {/* Status indicator */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 8,
              right: 8,
              width: 20,
              height: 20,
              borderRadius: '50%',
              backgroundColor: statusColor,
              border: `3px solid ${tokens.colors.background.paper}`,
            }}
          />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" sx={{ mb: 0.5 }}>
            {displayName}
          </Typography>
          {profile?.bio && (
            <Typography variant="body2" sx={{ color: tokens.colors.text.secondary, mb: 1 }}>
              {profile.bio}
            </Typography>
          )}
          <Typography variant="caption" sx={{ color: tokens.colors.text.disabled, display: 'block', mb: 2 }}>
            Member since January 2024
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip label="Level 42" size="small" sx={{ bgcolor: tokens.colors.background.elevated }} />
            <Chip label="Premium" size="small" sx={{ bgcolor: tokens.colors.background.elevated }} />
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<ShareIcon />} onClick={() => setShareOpen(true)}>
            Share
          </Button>
          <Button variant="contained" onClick={() => navigate('/profile/edit')}>Edit Profile</Button>
        </Box>
      </CardSection>

      {/* Share Dialog */}
      <Dialog
        open={shareOpen}
        onClose={() => setShareOpen(false)}
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
          <Typography variant="h5" component="span">Share Profile</Typography>
          <IconButton onClick={() => setShareOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ paddingTop: '32px !important' }}>
          <Typography variant="body2" sx={{ color: tokens.colors.text.secondary, mb: 2 }}>
            Share your profile with friends
          </Typography>
          <TextField
            fullWidth
            value={`https://neverdieguy.com/u/${displayName.toLowerCase().replace(/\s+/g, '-')}`}
            InputProps={{ readOnly: true }}
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: 'flex', gap: 1 }}>
            {['Twitter', 'Facebook', 'Discord', 'Copy'].map((platform) => (
              <Button
                key={platform}
                variant="outlined"
                size="small"
                onClick={() => setShareOpen(false)}
              >
                {platform}
              </Button>
            ))}
          </Box>
        </DialogContent>
      </Dialog>

      {/* Subscription Card */}
      <Paper
        onClick={() => navigate('/subscription/manage')}
        sx={{
          p: 2,
          mb: 4,
          backgroundColor: tokens.colors.background.paper,
          border: `1px solid ${tokens.colors.border}`,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          cursor: 'pointer',
          '&:hover': {
            borderColor: tokens.colors.text.secondary,
          },
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <Typography variant="body2">Premium</Typography>
            <Box
              sx={{
                px: 1,
                py: 0.25,
                borderRadius: 0.5,
                backgroundColor: tokens.colors.success,
                fontSize: '0.65rem',
                fontWeight: 600,
                color: '#000',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Active
            </Box>
          </Box>
          <Typography variant="caption" sx={{ color: tokens.colors.text.secondary }}>
            Renews Dec 19, 2026
          </Typography>
        </Box>
        <ChevronRightIcon sx={{ color: tokens.colors.text.secondary, fontSize: 20 }} />
      </Paper>

      {/* Stats */}
      <StatsRow count={4} />

      {/* Recent activity */}
      <Typography variant="h6" sx={{ mb: 2 }}>
        Recent Activity
      </Typography>
      <Paper
        sx={{
          mb: 4,
          backgroundColor: tokens.colors.background.paper,
          border: `1px solid ${tokens.colors.border}`,
        }}
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <Box
            key={i}
            sx={{
              p: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              borderBottom: i < 4 ? `1px solid ${tokens.colors.border}` : 'none',
            }}
          >
            <Skeleton
              variant="circular"
              width={32}
              height={32}
              sx={{ bgcolor: tokens.colors.background.elevated }}
            />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="40%" sx={{ bgcolor: tokens.colors.background.elevated }} />
            </Box>
            <Typography variant="caption" sx={{ color: tokens.colors.text.disabled }}>
              2h ago
            </Typography>
          </Box>
        ))}
      </Paper>

      {/* Collections */}
      <Typography variant="h6" sx={{ mb: 2 }}>
        Collections
      </Typography>
      <CardGrid count={4} columns={4} />
    </Box>
  );
}
