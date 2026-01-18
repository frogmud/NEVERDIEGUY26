/**
 * BoardAndPieces -> Controls
 *
 * Simplified settings section showing:
 * - Single dice preview with theme selection
 * - Keyboard controls reference
 */

import { useState, useEffect } from 'react';
import { Box, Typography, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { tokens } from '../../../theme';
import { SectionHeader } from '../../../components/SectionHeader';
import { CardSection } from '../../../components/CardSection';
import { DiceShape } from '../../../components/DiceShapes';
import { DICE_EFFECTS } from '../../../games/globe-meteor/config';
import { loadBoardSettings, saveBoardSettings, type BoardSettingsData } from '../../../data/player/storage';

// ============================================
// Color themes
// ============================================

type ThemeId = 'classic' | 'monochrome';

const themes: { id: ThemeId; name: string }[] = [
  { id: 'classic', name: 'Classic' },
  { id: 'monochrome', name: 'Monochrome' },
];

// Monochrome uses grayscale progression
const monochromeColors: Record<number, string> = {
  4: 'rgba(255,255,255,0.4)',
  6: 'rgba(255,255,255,0.47)',
  8: 'rgba(255,255,255,0.54)',
  10: 'rgba(255,255,255,0.60)',
  12: 'rgba(255,255,255,0.67)',
  20: 'rgba(255,255,255,0.73)',
};

// ============================================
// Dice types in order
// ============================================

const DICE_TYPES: (4 | 6 | 8 | 10 | 12 | 20)[] = [4, 6, 8, 10, 12, 20];

// ============================================
// Keyboard controls
// ============================================

const keyboardControls = [
  { key: 'SPACE', action: 'Throw dice' },
  { key: '1-6', action: 'Toggle hold on die (see above)' },
  { key: 'H', action: 'Hold all / Release all' },
  { key: 'T', action: 'Trade dice for multiplier' },
];

// ============================================
// Component
// ============================================

export function BoardAndPiecesSection() {
  const [settings, setSettings] = useState<BoardSettingsData>(loadBoardSettings);

  // Persist on change
  useEffect(() => {
    saveBoardSettings(settings);
  }, [settings]);

  const { theme } = settings;

  const updateTheme = (newTheme: ThemeId) => {
    setSettings(prev => ({ ...prev, theme: newTheme }));
  };

  // Get color based on theme - uses actual in-game colors from DICE_EFFECTS
  const getColor = (sides: number) => {
    if (theme === 'monochrome') return monochromeColors[sides];
    return DICE_EFFECTS[sides]?.color || tokens.colors.text.secondary;
  };

  return (
    <Box>
      <SectionHeader
        title="Controls"
        subtitle="Dice appearance and keyboard shortcuts"
        sx={{ mb: 3 }}
      />

      {/* Dice Preview */}
      <CardSection sx={{ mb: 3 }}>
        <Typography variant="body1" sx={{ fontWeight: 600, mb: 2 }}>
          Your Dice
        </Typography>
        <Typography variant="body2" sx={{ color: tokens.colors.text.secondary, mb: 3 }}>
          Hover to preview. Press 1-6 during combat to toggle hold.
        </Typography>

        {/* All 6 dice in a row */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-end',
            gap: { xs: 1.5, sm: 2.5 },
            py: 3,
            px: 2,
            borderRadius: '16px',
            backgroundColor: tokens.colors.background.elevated,
            flexWrap: 'wrap',
          }}
        >
          {DICE_TYPES.map((sides) => (
            <DiceShape
              key={sides}
              sides={sides}
              size={56}
              color={getColor(sides)}
              value={`d${sides}`}
              onClick={() => {}} // Enable hover effects
              fontFamily={tokens.fonts.gaming}
              fontScale={0.35}
            />
          ))}
        </Box>

        {/* Theme Selector */}
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
          <ToggleButtonGroup
            value={theme}
            exclusive
            onChange={(_, val) => val && updateTheme(val)}
            size="small"
            sx={{
              '& .MuiToggleButton-root': {
                px: 3,
                py: 0.75,
                border: `1px solid ${tokens.colors.border}`,
                color: tokens.colors.text.secondary,
                textTransform: 'none',
                '&.Mui-selected': {
                  backgroundColor: tokens.colors.background.elevated,
                  color: tokens.colors.text.primary,
                  fontWeight: 600,
                },
                '&:hover': {
                  backgroundColor: tokens.colors.background.elevated,
                },
              },
            }}
          >
            {themes.map((t) => (
              <ToggleButton key={t.id} value={t.id}>
                {t.name}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>
      </CardSection>

      {/* Keyboard Controls */}
      <CardSection>
        <Typography variant="body1" sx={{ fontWeight: 600, mb: 2 }}>
          Keyboard Controls
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {keyboardControls.map((control, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <Box
                sx={{
                  minWidth: 64,
                  px: 1.5,
                  py: 0.5,
                  borderRadius: '6px',
                  backgroundColor: tokens.colors.background.elevated,
                  border: `1px solid ${tokens.colors.border}`,
                  textAlign: 'center',
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: 'monospace',
                    fontWeight: 600,
                    color: tokens.colors.text.primary,
                  }}
                >
                  {control.key}
                </Typography>
              </Box>
              <Typography
                variant="body2"
                sx={{ color: tokens.colors.text.secondary }}
              >
                {control.action}
              </Typography>
            </Box>
          ))}
        </Box>
      </CardSection>
    </Box>
  );
}
