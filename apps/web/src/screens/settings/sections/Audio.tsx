/**
 * Audio - Sound effects, theme selection, and volume settings
 */

import { Box, Typography, Slider, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { VolumeUpSharp as VolumeIcon, VolumeOffSharp as MuteIcon } from '@mui/icons-material';
import { tokens } from '../../../theme';
import { SectionHeader } from '../../../components/SectionHeader';
import { CardSection } from '../../../components/CardSection';
import { SettingRow } from '../../../components/SettingRow';
import { useGameSettings, type SoundTheme } from '../../../contexts/GameSettingsContext';
import { useSoundContext } from '../../../contexts/SoundContext';

// Sound theme options
const soundThemes: { id: SoundTheme; name: string; description: string }[] = [
  { id: 'synth', name: 'Synth', description: 'Clean electronic sounds' },
  { id: 'medieval', name: 'Medieval', description: 'Drums and gold coins' },
  { id: 'wooden', name: 'Wooden', description: 'Wood and chest sounds' },
  { id: 'stone', name: 'Stone', description: 'Stone and arrow impacts' },
];

export function AudioSection() {
  const { masterVolume, setMasterVolume, soundTheme, setSoundTheme } = useGameSettings();
  const { soundEnabled, setSoundEnabled, playUIClick } = useSoundContext();

  const handleVolumeChange = (_: Event, value: number | number[]) => {
    const newVolume = (value as number) / 100;
    setMasterVolume(newVolume);
  };

  const handleVolumeCommit = () => {
    // Play a test sound when user releases the slider
    playUIClick();
  };

  const handleThemeChange = (_: React.MouseEvent<HTMLElement>, newTheme: SoundTheme | null) => {
    if (newTheme) {
      setSoundTheme(newTheme);
      // Play test sound with new theme
      setTimeout(() => playUIClick(), 100);
    }
  };

  return (
    <Box>
      <SectionHeader
        title="Audio"
        subtitle="Sound effects and volume"
        sx={{ mb: 3 }}
      />

      {/* Sound Toggle */}
      <CardSection padding={0} sx={{ mb: 3 }}>
        <Box sx={{ px: 3, py: 2, borderBottom: `1px solid ${tokens.colors.border}` }}>
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            Sound
          </Typography>
        </Box>
        <SettingRow
          title="Sound Effects"
          description="Enable dice rolls, impacts, and UI sounds"
          checked={soundEnabled}
          onChange={() => setSoundEnabled(!soundEnabled)}
          isLast
        />
      </CardSection>

      {/* Sound Theme */}
      <CardSection sx={{ mb: 3 }}>
        <Typography variant="body1" sx={{ fontWeight: 600, mb: 2 }}>
          Sound Theme
        </Typography>
        <ToggleButtonGroup
          value={soundTheme}
          exclusive
          onChange={handleThemeChange}
          disabled={!soundEnabled}
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1,
            '& .MuiToggleButton-root': {
              flex: '1 1 45%',
              py: 1.5,
              border: `1px solid ${tokens.colors.border}`,
              color: tokens.colors.text.secondary,
              textTransform: 'none',
              '&.Mui-selected': {
                backgroundColor: tokens.colors.background.elevated,
                color: tokens.colors.text.primary,
                fontWeight: 600,
                borderColor: tokens.colors.primary,
              },
              '&:hover': {
                backgroundColor: tokens.colors.background.elevated,
              },
              '&.Mui-disabled': {
                color: tokens.colors.text.disabled,
              },
            },
          }}
        >
          {soundThemes.map((theme) => (
            <ToggleButton key={theme.id} value={theme.id}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" sx={{ fontWeight: 'inherit' }}>
                  {theme.name}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    color: 'inherit',
                    opacity: 0.7,
                    fontSize: '0.7rem',
                  }}
                >
                  {theme.description}
                </Typography>
              </Box>
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </CardSection>

      {/* Volume Slider */}
      <CardSection padding={0}>
        <Box sx={{ px: 3, py: 2, borderBottom: `1px solid ${tokens.colors.border}` }}>
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            Volume
          </Typography>
        </Box>
        <Box sx={{ px: 3, py: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {masterVolume === 0 ? (
              <MuteIcon sx={{ color: tokens.colors.text.secondary }} />
            ) : (
              <VolumeIcon sx={{ color: tokens.colors.text.secondary }} />
            )}
            <Slider
              value={masterVolume * 100}
              onChange={handleVolumeChange}
              onChangeCommitted={handleVolumeCommit}
              disabled={!soundEnabled}
              min={0}
              max={100}
              valueLabelDisplay="auto"
              valueLabelFormat={(v) => `${v}%`}
              sx={{
                flex: 1,
                color: tokens.colors.primary,
                '& .MuiSlider-thumb': {
                  bgcolor: tokens.colors.primary,
                },
                '& .MuiSlider-track': {
                  bgcolor: tokens.colors.primary,
                },
                '& .MuiSlider-rail': {
                  bgcolor: tokens.colors.border,
                },
                '&.Mui-disabled': {
                  color: tokens.colors.text.disabled,
                },
              }}
            />
            <Typography
              sx={{
                minWidth: 40,
                textAlign: 'right',
                fontSize: '0.875rem',
                color: soundEnabled ? tokens.colors.text.primary : tokens.colors.text.disabled,
              }}
            >
              {Math.round(masterVolume * 100)}%
            </Typography>
          </Box>
          <Typography
            variant="caption"
            sx={{ color: tokens.colors.text.secondary, mt: 1, display: 'block' }}
          >
            Adjust the volume for all sound effects
          </Typography>
        </Box>
      </CardSection>
    </Box>
  );
}
