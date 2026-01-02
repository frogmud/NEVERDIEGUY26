/**
 * Gameplay - Die-rector patron selection and dice rolling options
 * Extracted from GameSettings.tsx
 */

import { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { tokens } from '../../../theme';
import { SectionHeader } from '../../../components/SectionHeader';
import { CardSection } from '../../../components/CardSection';
import { SettingRow } from '../../../components/SettingRow';
import { LuckyNumberPicker, LuckyNumberBadge } from '../../../components/LuckyNumberPicker';
import { DiceShape } from '../../../components/DiceShapes';
import { DICE_CONFIG, getDiceColor } from '../../../data/dice';
import { pantheon } from '../../../data/wiki/entities/pantheon';
import { loadGameSettings, saveGameSettings, type GameSettingsData } from '../../../data/player/storage';
import type { LuckyNumber } from '../../../data/wiki/types';

export function GameplaySection() {
  // Lucky number state (TODO: requires user confirmation per CLAUDE.md)
  const [luckyNumber, setLuckyNumber] = useState<LuckyNumber>(2);

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
        subtitle="Die-rector patron and dice options"
        sx={{ mb: 3 }}
      />

      {/* Die-rector Patron */}
      <CardSection padding={0} sx={{ mb: 3 }}>
        <Box
          sx={{
            px: 3,
            py: 2,
            borderBottom: `1px solid ${tokens.colors.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              Die-rector Patron
            </Typography>
            <Typography variant="body2" sx={{ color: tokens.colors.text.secondary }}>
              Choose your lucky number to receive favor on matching dice
            </Typography>
          </Box>
          <LuckyNumberBadge value={luckyNumber} />
        </Box>

        <Box sx={{ p: 3 }}>
          <LuckyNumberPicker value={luckyNumber} onChange={setLuckyNumber} showLabels />

          {/* Favor Preview */}
          {luckyNumber > 0 && luckyNumber < 7 && (
            <Box sx={{ mt: 3 }}>
              <FavorPreview luckyNumber={luckyNumber} />
            </Box>
          )}
        </Box>
      </CardSection>

      {/* Dice Rolling */}
      <CardSection padding={0} sx={{ mb: 3 }}>
        <Box sx={{ px: 3, py: 2, borderBottom: `1px solid ${tokens.colors.border}` }}>
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            Dice Rolling
          </Typography>
        </Box>
        <SettingRow
          title="Show Favor Effects"
          description="Display Die-rector blessing toasts on lucky rolls"
          checked={settings.showFavorEffects}
          onChange={() => toggleSetting('showFavorEffects')}
        />
        <SettingRow
          title="Reroll 1s on Preferred Dice"
          description="Automatically reroll natural 1s on your patron's die"
          checked={settings.rerollOnesOnPreferred}
          onChange={() => toggleSetting('rerollOnesOnPreferred')}
        />
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

// Favor preview component
function FavorPreview({ luckyNumber }: { luckyNumber: LuckyNumber }) {
  const diceConfig = DICE_CONFIG.find((d) => d.luckyNumber === luckyNumber);
  const dierector = pantheon.find((p) => p.slug === diceConfig?.dierector);

  if (!diceConfig || !dierector) return null;

  const color = getDiceColor(diceConfig.sides);

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        backgroundColor: tokens.colors.background.elevated,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <DiceShape sides={diceConfig.sides} size={40} color={color} value={luckyNumber} />
        <Box>
          <Typography variant="body2" sx={{ color, fontWeight: 600 }}>
            {dierector.name}
          </Typography>
          <Typography variant="caption" sx={{ color: tokens.colors.text.disabled }}>
            {dierector.role}
          </Typography>
        </Box>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        {dierector.favorEffects?.slice(0, 2).map((favor) => (
          <Typography key={favor.roll} variant="caption" sx={{ color: tokens.colors.text.secondary }}>
            Roll {favor.roll}: {favor.effect}
          </Typography>
        ))}
      </Box>
    </Box>
  );
}
