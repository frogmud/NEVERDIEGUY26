/**
 * Social - Status and messaging preferences
 */

import { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import {
  Circle as CircleIcon,
  CheckSharp as CheckIcon,
} from '@mui/icons-material';
import { tokens, PRESENCE_COLORS } from '../../../theme';
import { SectionHeader } from '../../../components/SectionHeader';
import { CardSection } from '../../../components/CardSection';
import { SettingRow } from '../../../components/SettingRow';
import {
  loadProfile,
  saveProfile,
  loadSocialSettings,
  saveSocialSettings,
  type SocialSettingsData,
} from '../../../data/player/storage';

const statusOptions = [
  { id: 'online', label: 'Online', color: PRESENCE_COLORS.online, description: 'Visible to everyone' },
  { id: 'away', label: 'Away', color: PRESENCE_COLORS.away, description: 'Show as away' },
  { id: 'dnd', label: 'Do Not Disturb', color: PRESENCE_COLORS.busy, description: 'No notifications' },
  { id: 'invisible', label: 'Invisible', color: PRESENCE_COLORS.offline, description: 'Appear offline' },
];

const messageOptions = [
  { id: 'everyone', label: 'Everyone' },
  { id: 'friends', label: 'Friends Only' },
  { id: 'none', label: 'No One' },
];

export function SocialSection() {
  // Load status from profile, social settings from storage
  const [selectedStatus, setSelectedStatus] = useState<'online' | 'away' | 'dnd' | 'invisible'>('online');
  const [socialSettings, setSocialSettings] = useState<SocialSettingsData>(loadSocialSettings);

  // Load profile status on mount
  useEffect(() => {
    const profile = loadProfile();
    setSelectedStatus(profile.status);
  }, []);

  // Persist social settings on change
  useEffect(() => {
    saveSocialSettings(socialSettings);
  }, [socialSettings]);

  // Handle status change - update profile
  const handleStatusChange = (status: 'online' | 'away' | 'dnd' | 'invisible') => {
    setSelectedStatus(status);
    const profile = loadProfile();
    saveProfile({ ...profile, status, updatedAt: Date.now() });
  };

  const { whoCanMessage, showOnlineStatus, showActivityStatus } = socialSettings;

  return (
    <Box>
      <SectionHeader
        title="Social"
        subtitle="Privacy and messaging settings"
        sx={{ mb: 3 }}
      />

      {/* Online Status */}
      <CardSection sx={{ mb: 3 }}>
        <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
          Status
        </Typography>
        <Typography variant="body2" sx={{ color: tokens.colors.text.secondary, mb: 3 }}>
          Let others know your availability
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {statusOptions.map((option) => (
            <Box
              key={option.id}
              onClick={() => handleStatusChange(option.id as 'online' | 'away' | 'dnd' | 'invisible')}
              sx={{
                p: 1.5,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                cursor: 'pointer',
                borderRadius: 1,
                backgroundColor:
                  selectedStatus === option.id
                    ? tokens.colors.background.elevated
                    : 'transparent',
                '&:hover': { backgroundColor: tokens.colors.background.elevated },
              }}
            >
              <CircleIcon sx={{ color: option.color, fontSize: 12 }} />
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: selectedStatus === option.id ? 600 : 400 }}
                >
                  {option.label}
                </Typography>
                <Typography variant="caption" sx={{ color: tokens.colors.text.disabled }}>
                  {option.description}
                </Typography>
              </Box>
              {selectedStatus === option.id && (
                <CheckIcon sx={{ color: tokens.colors.primary, fontSize: 18 }} />
              )}
            </Box>
          ))}
        </Box>
      </CardSection>

      {/* Who Can Message */}
      <CardSection sx={{ mb: 3 }}>
        <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
          Who Can Message You
        </Typography>
        <Typography variant="body2" sx={{ color: tokens.colors.text.secondary, mb: 3 }}>
          Control who can send you direct messages
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {messageOptions.map((option) => (
            <Box
              key={option.id}
              onClick={() => setSocialSettings(prev => ({ ...prev, whoCanMessage: option.id as 'everyone' | 'friends' | 'none' }))}
              sx={{
                p: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                borderRadius: 1,
                backgroundColor:
                  whoCanMessage === option.id
                    ? tokens.colors.background.elevated
                    : 'transparent',
                '&:hover': { backgroundColor: tokens.colors.background.elevated },
              }}
            >
              <Typography
                variant="body2"
                sx={{ fontWeight: whoCanMessage === option.id ? 600 : 400 }}
              >
                {option.label}
              </Typography>
              {whoCanMessage === option.id && (
                <CheckIcon sx={{ color: tokens.colors.primary, fontSize: 18 }} />
              )}
            </Box>
          ))}
        </Box>
      </CardSection>

      {/* Privacy Toggles */}
      <CardSection padding={0}>
        <Box sx={{ px: 3, py: 2, borderBottom: `1px solid ${tokens.colors.border}` }}>
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            Privacy
          </Typography>
        </Box>
        <SettingRow
          title="Show Online Status"
          description="Let others see when you're online"
          checked={showOnlineStatus}
          onChange={() => setSocialSettings(prev => ({ ...prev, showOnlineStatus: !prev.showOnlineStatus }))}
        />
        <SettingRow
          title="Show Activity Status"
          description="Show what game mode you're playing"
          checked={showActivityStatus}
          onChange={() => setSocialSettings(prev => ({ ...prev, showActivityStatus: !prev.showActivityStatus }))}
          isLast
        />
      </CardSection>
    </Box>
  );
}
