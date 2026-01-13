/**
 * Accessibility - Motion and display settings
 */

import { Box, Typography } from '@mui/material';
import { tokens } from '../../../theme';
import { SectionHeader } from '../../../components/SectionHeader';
import { CardSection } from '../../../components/CardSection';
import { SettingRow } from '../../../components/SettingRow';
import { useSettings } from '../../../contexts/SettingsContext';

export function AccessibilitySection() {
  const {
    reducedMotion,
    setReducedMotion,
    largeText,
    setLargeText,
  } = useSettings();

  return (
    <Box>
      <SectionHeader
        title="Accessibility"
        subtitle="Make the game more comfortable for you"
        sx={{ mb: 3 }}
      />

      {/* Motion & Display */}
      <CardSection padding={0}>
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
          title="Large Text"
          description="Increase text size throughout the app"
          checked={largeText}
          onChange={() => setLargeText(!largeText)}
          isLast
        />
      </CardSection>
    </Box>
  );
}
