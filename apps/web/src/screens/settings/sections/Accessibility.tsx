/**
 * Accessibility - Motion, colors, and assistive features
 */

import { Box, Typography } from '@mui/material';
import { CheckSharp as CheckIcon } from '@mui/icons-material';
import { tokens } from '../../../theme';
import { SectionHeader } from '../../../components/SectionHeader';
import { CardSection } from '../../../components/CardSection';
import { SettingRow } from '../../../components/SettingRow';
import { useSettings } from '../../../contexts/SettingsContext';

const colorblindModes = [
  { id: 'none', name: 'None', description: 'Default colors', enabled: false },
  { id: 'enabled', name: 'Colorblind Mode', description: 'Adjusted color palette for better visibility', enabled: true },
];

export function AccessibilitySection() {
  const {
    reducedMotion,
    setReducedMotion,
    highContrast,
    setHighContrast,
    largeText,
    setLargeText,
    screenReader,
    setScreenReader,
    colorblindMode,
    setColorblindMode,
  } = useSettings();

  return (
    <Box>
      <SectionHeader
        title="Accessibility"
        subtitle="Make the game more comfortable for you"
        sx={{ mb: 3 }}
      />

      {/* Motion & Display */}
      <CardSection padding={0} sx={{ mb: 3 }}>
        <Box sx={{ px: 3, py: 2, borderBottom: `1px solid ${tokens.colors.border}` }}>
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            Motion & Display
          </Typography>
        </Box>
        <SettingRow
          title="Reduced Motion"
          description="Minimize animations and transitions"
          checked={reducedMotion}
          onChange={() => setReducedMotion(!reducedMotion)}
        />
        <SettingRow
          title="High Contrast"
          description="Increase contrast for better visibility"
          checked={highContrast}
          onChange={() => setHighContrast(!highContrast)}
        />
        <SettingRow
          title="Large Text"
          description="Increase text size throughout the app"
          checked={largeText}
          onChange={() => setLargeText(!largeText)}
        />
        <SettingRow
          title="Screen Reader Support"
          description="Optimize for screen readers"
          checked={screenReader}
          onChange={() => setScreenReader(!screenReader)}
          isLast
        />
      </CardSection>

      {/* Colorblind Mode */}
      <CardSection sx={{ p: 3 }}>
        <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
          Color Vision
        </Typography>
        <Typography variant="body2" sx={{ color: tokens.colors.text.secondary, mb: 2.5 }}>
          Adjust colors for different types of color vision
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {colorblindModes.map((mode, index) => (
            <Box
              key={mode.id}
              onClick={() => setColorblindMode(mode.enabled)}
              sx={{
                px: 2,
                py: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                backgroundColor:
                  colorblindMode === mode.enabled
                    ? tokens.colors.background.elevated
                    : 'transparent',
                '&:hover': { backgroundColor: tokens.colors.background.elevated },
                // Match container corner radius on first/last items
                ...(index === 0 && { borderTopLeftRadius: '8px', borderTopRightRadius: '8px' }),
                ...(index === colorblindModes.length - 1 && { borderBottomLeftRadius: '8px', borderBottomRightRadius: '8px' }),
              }}
            >
              <Box>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: colorblindMode === mode.enabled ? 600 : 400 }}
                >
                  {mode.name}
                </Typography>
                <Typography variant="caption" sx={{ color: tokens.colors.text.disabled }}>
                  {mode.description}
                </Typography>
              </Box>
              {colorblindMode === mode.enabled && (
                <CheckIcon sx={{ color: tokens.colors.primary, fontSize: 18 }} />
              )}
            </Box>
          ))}
        </Box>
      </CardSection>
    </Box>
  );
}
