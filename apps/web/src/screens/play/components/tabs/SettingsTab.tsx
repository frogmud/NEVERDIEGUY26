import { Box, Typography, Switch, Slider } from '@mui/material';
import {
  VolumeUpSharp as SoundIcon,
  MusicNoteSharp as MusicIcon,
  SpeedSharp as SpeedIcon,
  Brightness6Sharp as ThemeIcon,
  TerminalSharp as AsciiIcon,
} from '@mui/icons-material';
import { tokens } from '../../../../theme';
import { useSoundContext } from '../../../../contexts/SoundContext';
import { useGameSettings } from '../../../../contexts/GameSettingsContext';

export function SettingsTab() {
  // Sound from global context (persisted)
  const { soundEnabled, setSoundEnabled, playUIClick } = useSoundContext();

  // Game settings from global context (persisted)
  const {
    gameSpeed,
    setGameSpeed,
    animationsEnabled,
    setAnimationsEnabled,
    musicEnabled,
    setMusicEnabled,
    asciiMode,
    setAsciiMode,
  } = useGameSettings();

  return (
    <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2, height: '100%' }}>
      {/* Header */}
      <Typography sx={{ fontWeight: 600, fontSize: '1rem', mb: 1 }}>
        Quick Settings
      </Typography>

      {/* Sound Toggle */}
      <SettingRow
        icon={<SoundIcon sx={{ fontSize: 20 }} />}
        label="Sound Effects"
        control={
          <Switch
            checked={soundEnabled}
            onChange={(e) => { playUIClick(); setSoundEnabled(e.target.checked); }}
            size="small"
          />
        }
      />

      {/* Music Toggle */}
      <SettingRow
        icon={<MusicIcon sx={{ fontSize: 20 }} />}
        label="Music"
        control={
          <Switch
            checked={musicEnabled}
            onChange={(e) => { playUIClick(); setMusicEnabled(e.target.checked); }}
            size="small"
          />
        }
      />

      {/* Game Speed */}
      <Box
        sx={{
          p: 2,
          borderRadius: 2,
          bgcolor: tokens.colors.background.elevated,
          border: `1px solid ${tokens.colors.border}`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
          <SpeedIcon sx={{ fontSize: 20, color: tokens.colors.text.secondary }} />
          <Typography sx={{ fontSize: '0.875rem', flex: 1 }}>
            Game Speed
          </Typography>
          <Typography
            sx={{
              fontSize: '0.75rem',
              color: tokens.colors.text.secondary,
              fontFamily: 'monospace',
            }}
          >
            {gameSpeed}x
          </Typography>
        </Box>
        <Slider
          value={gameSpeed}
          onChange={(_, value) => setGameSpeed(value as number)}
          onChangeCommitted={() => playUIClick()}
          min={0.5}
          max={2}
          step={0.25}
          marks={[
            { value: 0.5, label: '0.5x' },
            { value: 1, label: '1x' },
            { value: 2, label: '2x' },
          ]}
          sx={{
            '& .MuiSlider-markLabel': {
              fontSize: '0.65rem',
              color: tokens.colors.text.disabled,
            },
          }}
        />
      </Box>

      {/* Animations Toggle */}
      <SettingRow
        icon={<ThemeIcon sx={{ fontSize: 20 }} />}
        label="Animations"
        control={
          <Switch
            checked={animationsEnabled}
            onChange={(e) => { playUIClick(); setAnimationsEnabled(e.target.checked); }}
            size="small"
          />
        }
      />

      {/* ASCII Graphics Toggle */}
      <SettingRow
        icon={<AsciiIcon sx={{ fontSize: 20 }} />}
        label="ASCII Graphics"
        control={
          <Switch
            checked={asciiMode}
            onChange={(e) => { playUIClick(); setAsciiMode(e.target.checked); }}
            size="small"
          />
        }
      />
    </Box>
  );
}

// Setting Row Component
interface SettingRowProps {
  icon: React.ReactNode;
  label: string;
  control: React.ReactNode;
}

function SettingRow({ icon, label, control }: SettingRowProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        p: 2,
        borderRadius: 2,
        bgcolor: tokens.colors.background.elevated,
        border: `1px solid ${tokens.colors.border}`,
      }}
    >
      <Box sx={{ color: tokens.colors.text.secondary }}>{icon}</Box>
      <Typography sx={{ fontSize: '0.875rem', flex: 1 }}>{label}</Typography>
      {control}
    </Box>
  );
}
