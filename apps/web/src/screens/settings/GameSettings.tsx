// GameSettings - Gameplay preferences including Lucky Number
import { useState, useEffect } from 'react';
import { Box, Typography, Container, Divider } from '@mui/material';
import { tokens } from '../../theme';
import { PageHeader } from '../../components/Placeholder';
import { BaseCard } from '../../components/BaseCard';
import { SectionHeader } from '../../components/SectionHeader';
import { LuckyNumberPicker, LuckyNumberBadge } from '../../components/LuckyNumberPicker';
import { SettingRow } from '../../components/SettingRow';
import { loadGameSettings, saveGameSettings, type GameSettingsData } from '../../data/player/storage';
import type { LuckyNumber } from '../../data/wiki/types';

export function GameSettings() {
  // Lucky number state (would be from user store in production)
  const [luckyNumber, setLuckyNumber] = useState<LuckyNumber>(2); // Default to NDG's number

  // Load game settings from storage
  const [settings, setSettings] = useState<GameSettingsData>(loadGameSettings);

  // Persist settings on change
  useEffect(() => {
    saveGameSettings(settings);
  }, [settings]);

  const toggleSetting = (key: keyof GameSettingsData) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <Container maxWidth="md">
      <PageHeader
        title="Game Settings"
        subtitle="Configure your gameplay experience"
      />

      {/* Lucky Number Section */}
      <Box sx={{ mb: 4 }}>
        <SectionHeader
          title="Die-rector Patron"
          subtitle="Choose your lucky number to receive favor on matching dice"
          sx={{ mb: 2 }}
        />
        <BaseCard>
          <Box sx={{ p: 3 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 3,
              }}
            >
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  Current Patron
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: tokens.colors.text.disabled }}
                >
                  Your chosen Die-rector grants favor on their associated die
                </Typography>
              </Box>
              <LuckyNumberBadge value={luckyNumber} />
            </Box>

            <Divider sx={{ my: 3 }} />

            <LuckyNumberPicker
              value={luckyNumber}
              onChange={setLuckyNumber}
              showLabels
            />
          </Box>
        </BaseCard>
      </Box>

      {/* Dice Rolling Section */}
      <Box sx={{ mb: 4 }}>
        <SectionHeader
          title="Dice Rolling"
          subtitle="Customize your dice rolling experience"
          sx={{ mb: 2 }}
        />
        <BaseCard padding={0}>
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
        </BaseCard>
      </Box>

      {/* Visual Effects Section */}
      <Box sx={{ mb: 4 }}>
        <SectionHeader
          title="Visual Effects"
          subtitle="Adjust combat and gameplay visuals"
          sx={{ mb: 2 }}
        />
        <BaseCard padding={0}>
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
        </BaseCard>
      </Box>

      {/* Favor Effects Preview */}
      <Box sx={{ mb: 4 }}>
        <SectionHeader
          title="Favor Preview"
          subtitle="Effects you can receive from your Die-rector patron"
          sx={{ mb: 2 }}
        />
        <FavorPreview luckyNumber={luckyNumber} />
      </Box>
    </Container>
  );
}

// Favor effects preview component
import { DICE_CONFIG, getDiceColor } from '../../data/dice';
import { pantheon } from '../../data/wiki/entities/pantheon';
import { DiceShape } from '../../components/DiceShapes';

function FavorPreview({ luckyNumber }: { luckyNumber: LuckyNumber }) {
  if (luckyNumber === 0) {
    return (
      <BaseCard>
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography sx={{ color: tokens.colors.text.disabled, fontStyle: 'italic' }}>
            No Die-rector patron selected. You walk alone, outside the favor system.
          </Typography>
        </Box>
      </BaseCard>
    );
  }

  // For lucky 7 (All), show a summary
  if (luckyNumber === 7) {
    return (
      <BaseCard>
        <Box sx={{ p: 3 }}>
          <Typography
            variant="body2"
            sx={{ color: tokens.colors.text.secondary, mb: 2, textAlign: 'center' }}
          >
            The Board Room grants you access to all Die-rector favors. Roll any die to
            receive blessings from its associated patron.
          </Typography>
          <Box
            sx={{
              display: 'flex',
              gap: 1,
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            {DICE_CONFIG.map((config) => (
              <DiceShape
                key={config.sides}
                sides={config.sides}
                size={32}
                color={getDiceColor(config.sides)}
                value={config.luckyNumber}
              />
            ))}
          </Box>
        </Box>
      </BaseCard>
    );
  }

  // Find the Die-rector for this lucky number
  const diceConfig = DICE_CONFIG.find((d) => d.luckyNumber === luckyNumber);
  const dierector = pantheon.find((p) => p.slug === diceConfig?.dierector);

  if (!diceConfig || !dierector) {
    return null;
  }

  const color = getDiceColor(diceConfig.sides);

  return (
    <BaseCard>
      <Box sx={{ p: 3 }}>
        {/* Die-rector header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            mb: 3,
          }}
        >
          <DiceShape
            sides={diceConfig.sides}
            size={56}
            color={color}
            value={luckyNumber}
          />
          <Box>
            <Typography variant="h6" sx={{ color, fontWeight: 700 }}>
              {dierector.name}
            </Typography>
            <Typography variant="caption" sx={{ color: tokens.colors.text.disabled }}>
              {dierector.role} - {diceConfig.element}
            </Typography>
          </Box>
        </Box>

        {/* Favor effects list */}
        <Typography
          variant="caption"
          sx={{
            color: tokens.colors.text.disabled,
            textTransform: 'uppercase',
            letterSpacing: 1,
            display: 'block',
            mb: 1.5,
          }}
        >
          Favor Effects
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {dierector.favorEffects?.map((favor) => (
            <Box
              key={favor.roll}
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1.5,
                p: 1,
                borderRadius: 1,
                backgroundColor:
                  favor.roll === luckyNumber
                    ? `${color}15`
                    : tokens.colors.background.elevated,
                border:
                  favor.roll === luckyNumber
                    ? `1px solid ${color}40`
                    : '1px solid transparent',
              }}
            >
              <Typography
                sx={{
                  minWidth: 24,
                  textAlign: 'center',
                  fontWeight: 700,
                  color: favor.roll === luckyNumber ? color : tokens.colors.text.secondary,
                  fontFamily: tokens.fonts.mono,
                }}
              >
                {favor.roll}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: tokens.colors.text.primary,
                  flex: 1,
                }}
              >
                {favor.effect}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </BaseCard>
  );
}
