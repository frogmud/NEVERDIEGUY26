/**
 * Gameplay - Dice rolling options and visual effects
 */

import { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { tokens } from '../../../theme';
import { SectionHeader } from '../../../components/SectionHeader';
import { CardSection } from '../../../components/CardSection';
import { SettingRow } from '../../../components/SettingRow';
import { loadGameSettings, saveGameSettings, type GameSettingsData } from '../../../data/player/storage';

export function GameplaySection() {
  // Dice rolling settings - loaded from storage
  const [settings, setSettings] = useState<GameSettingsData>(loadGameSettings);

  // Persist on change
  useEffect(() => {
    saveGameSettings(settings);
  }, [settings]);

  const toggleSetting = (key: keyof GameSettingsData) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <Box>
      <SectionHeader
        title="Gameplay"
        subtitle="Dice rolling and combat options"
        sx={{ mb: 3 }}
      />

      {/* Dice Rolling */}
      <CardSection padding={0} sx={{ mb: 3 }}>
        <Box sx={{ px: 3, py: 2, borderBottom: `1px solid ${tokens.colors.border}` }}>
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            Dice Rolling
          </Typography>
        </Box>
        <SettingRow
          title="Compact Dice Display"
          description="Use smaller dice shapes in the rolling interface"
          checked={settings.compactDice}
          onChange={() => toggleSetting('compactDice')}
          isLast
        />
      </CardSection>

      {/* Visual Effects */}
      <CardSection padding={0}>
        <Box sx={{ px: 3, py: 2, borderBottom: `1px solid ${tokens.colors.border}` }}>
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            Visual Effects
          </Typography>
        </Box>
        <SettingRow
          title="Damage Numbers"
          description="Show floating damage numbers during combat"
          checked={settings.showDamageNumbers}
          onChange={() => toggleSetting('showDamageNumbers')}
        />
        <SettingRow
          title="Screen Shake"
          description="Enable screen shake on critical hits and impacts"
          checked={settings.screenShake}
          onChange={() => toggleSetting('screenShake')}
        />
        <SettingRow
          title="Auto-Roll"
          description="Automatically roll dice when prompted"
          checked={settings.autoRoll}
          onChange={() => toggleSetting('autoRoll')}
          isLast
        />
      </CardSection>
    </Box>
  );
}
