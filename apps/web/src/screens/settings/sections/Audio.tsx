/**
 * Audio - Sound and volume settings
 */

import { Box, Typography, Slider } from '@mui/material';
import { VolumeUpSharp as VolumeIcon, VolumeOffSharp as MuteIcon } from '@mui/icons-material';
import { tokens } from '../../../theme';
import { SectionHeader } from '../../../components/SectionHeader';
import { CardSection } from '../../../components/CardSection';
import { SettingRow } from '../../../components/SettingRow';
import { useGameSettings } from '../../../contexts/GameSettingsContext';
import { useSoundContext } from '../../../contexts/SoundContext';

export function AudioSection() {
  const { masterVolume, setMasterVolume } = useGameSettings();
  const { soundEnabled, setSoundEnabled, playUIClick } = useSoundContext();

  const handleVolumeChange = (_: Event, value: number | number[]) => {
    const newVolume = (value as number) / 100;
    setMasterVolume(newVolume);
  };

  const handleVolumeCommit = () => {
    // Play a test sound when user releases the slider
    playUIClick();
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
