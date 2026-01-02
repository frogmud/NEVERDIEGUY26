/**
 * Interface - Theme and language preferences
 */

import { Box, Typography } from '@mui/material';
import { CheckSharp as CheckIcon } from '@mui/icons-material';
import { tokens } from '../../../theme';
import { SectionHeader } from '../../../components/SectionHeader';
import { CardSection } from '../../../components/CardSection';
import { SettingRow } from '../../../components/SettingRow';
import { useSettings, LANGUAGES, type Language } from '../../../contexts/SettingsContext';

export function InterfaceSection() {
  const {
    compactMode,
    setCompactMode,
    colorblindMode,
    setColorblindMode,
    language,
    setLanguage,
  } = useSettings();

  return (
    <Box>
      <SectionHeader
        title="Interface"
        subtitle="Appearance and display preferences"
        sx={{ mb: 3 }}
      />

      {/* Display Settings */}
      <CardSection padding={0} sx={{ mb: 3 }}>
        <Box sx={{ px: 3, py: 2, borderBottom: `1px solid ${tokens.colors.border}` }}>
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            Display
          </Typography>
        </Box>
        <SettingRow
          title="Compact Mode"
          description="Reduce spacing and padding for more content"
          checked={compactMode}
          onChange={() => setCompactMode(!compactMode)}
        />
        <SettingRow
          title="Colorblind Mode"
          description="Use alternative color palette for better visibility"
          checked={colorblindMode}
          onChange={() => setColorblindMode(!colorblindMode)}
          isLast
        />
      </CardSection>

      {/* Language */}
      <CardSection>
        <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
          Language
        </Typography>
        <Typography variant="body2" sx={{ color: tokens.colors.text.secondary, mb: 3 }}>
          Choose your preferred language
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {LANGUAGES.map((lang, index) => (
            <Box
              key={lang.code}
              onClick={() => setLanguage(lang.code as Language)}
              sx={{
                px: 2,
                py: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                backgroundColor:
                  language === lang.code
                    ? tokens.colors.background.elevated
                    : 'transparent',
                '&:hover': { backgroundColor: tokens.colors.background.elevated },
                // Match container corner radius on first/last items
                ...(index === 0 && { borderTopLeftRadius: '8px', borderTopRightRadius: '8px' }),
                ...(index === LANGUAGES.length - 1 && { borderBottomLeftRadius: '8px', borderBottomRightRadius: '8px' }),
              }}
            >
              <Typography
                variant="body2"
                sx={{ fontWeight: language === lang.code ? 600 : 400 }}
              >
                {lang.name}
              </Typography>
              {language === lang.code && (
                <CheckIcon sx={{ color: tokens.colors.primary, fontSize: 18 }} />
              )}
            </Box>
          ))}
        </Box>
      </CardSection>
    </Box>
  );
}
