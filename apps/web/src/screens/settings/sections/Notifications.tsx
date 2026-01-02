/**
 * Notifications - Push and email notification preferences
 */

import { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { tokens } from '../../../theme';
import { SectionHeader } from '../../../components/SectionHeader';
import { CardSection } from '../../../components/CardSection';
import { SettingRow } from '../../../components/SettingRow';
import {
  loadNotificationSettings,
  saveNotificationSettings,
  type NotificationSettingsData,
} from '../../../data/player/storage';

export function NotificationsSection() {
  // Load settings from storage
  const [settings, setSettings] = useState<NotificationSettingsData>(loadNotificationSettings);

  // Persist on change
  useEffect(() => {
    saveNotificationSettings(settings);
  }, [settings]);

  const toggleSetting = (key: keyof NotificationSettingsData) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <Box>
      <SectionHeader
        title="Notifications"
        subtitle="Control how you receive updates"
        sx={{ mb: 3 }}
      />

      {/* Push Notifications */}
      <CardSection padding={0} sx={{ mb: 3 }}>
        <Box sx={{ px: 3, py: 2, borderBottom: `1px solid ${tokens.colors.border}` }}>
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            Push Notifications
          </Typography>
        </Box>
        <SettingRow
          title="Enable Push Notifications"
          description="Receive notifications on your device"
          checked={settings.pushEnabled}
          onChange={() => toggleSetting('pushEnabled')}
        />
        <SettingRow
          title="NPC Messages"
          description="Messages from shopkeepers and wanderers"
          checked={settings.pushNPCMessages}
          onChange={() => toggleSetting('pushNPCMessages')}
          disabled={!settings.pushEnabled}
        />
        <SettingRow
          title="Challenges"
          description="New challenges and reminders"
          checked={settings.pushChallenges}
          onChange={() => toggleSetting('pushChallenges')}
          disabled={!settings.pushEnabled}
        />
        <SettingRow
          title="Achievements"
          description="When you earn achievements or rewards"
          checked={settings.pushAchievements}
          onChange={() => toggleSetting('pushAchievements')}
          disabled={!settings.pushEnabled}
        />
        <SettingRow
          title="System Updates"
          description="Important announcements and maintenance"
          checked={settings.pushSystem}
          onChange={() => toggleSetting('pushSystem')}
          disabled={!settings.pushEnabled}
          isLast
        />
      </CardSection>

      {/* Email Notifications */}
      <CardSection padding={0}>
        <Box sx={{ px: 3, py: 2, borderBottom: `1px solid ${tokens.colors.border}` }}>
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            Email Notifications
          </Typography>
        </Box>
        <SettingRow
          title="Enable Email Notifications"
          description="Receive emails about your account"
          checked={settings.emailEnabled}
          onChange={() => toggleSetting('emailEnabled')}
        />
        <SettingRow
          title="Weekly Digest"
          description="Summary of your weekly progress"
          checked={settings.emailWeeklyDigest}
          onChange={() => toggleSetting('emailWeeklyDigest')}
          disabled={!settings.emailEnabled}
        />
        <SettingRow
          title="Promotions & Events"
          description="Special offers and in-game events"
          checked={settings.emailPromotions}
          onChange={() => toggleSetting('emailPromotions')}
          disabled={!settings.emailEnabled}
        />
        <SettingRow
          title="New Features"
          description="Updates about new game features"
          checked={settings.emailNewFeatures}
          onChange={() => toggleSetting('emailNewFeatures')}
          disabled={!settings.emailEnabled}
          isLast
        />
      </CardSection>
    </Box>
  );
}
