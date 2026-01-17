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
import { getDiceColor } from '../../../data/dice';
import { loadBoardSettings, saveBoardSettings, type BoardSettingsData } from '../../../data/player/storage';

// ============================================
// Color themes
// ============================================

type ThemeId = 'classic' | 'monochrome';

const themes: { id: ThemeId; name: string }[] = [
  { id: 'classic', name: 'Classic' },
  { id: 'monochrome', name: 'Monochrome' },
];

const monochromeColors: Record<number, string> = {
  4: '#666666',
  6: '#777777',
  8: '#888888',
  10: '#999999',
  12: '#aaaaaa',
  20: '#bbbbbb',
};

// ============================================
// Keyboard controls
// ============================================

const keyboardControls = [
  { key: 'SPACE', action: 'Throw dice' },
  { key: '1-5', action: 'Toggle hold on die' },
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

  // Get color based on theme
  const getColor = (sides: number) => {
    return theme === 'classic' ? getDiceColor(sides) : monochromeColors[sides];
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
        <Typography variant="body1" sx={{ fontWeight: 600, mb: 3 }}>
          Dice Preview
        </Typography>

        {/* Single d20 centered */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            py: 4,
            px: 2,
            borderRadius: '16px',
            backgroundColor: tokens.colors.background.elevated,
          }}
        >
          <DiceShape
            sides={20}
            size={80}
            color={getColor(20)}
            value={20}
            fontFamily={tokens.fonts.gaming}
            fontScale={0.5}
          />
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
