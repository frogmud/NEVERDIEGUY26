import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Switch, Slider, ButtonBase } from '@mui/material';
import {
  SettingsSharp as SettingsIcon,
  VolumeUpSharp as SoundIcon,
  MusicNoteSharp as MusicIcon,
  SpeedSharp as SpeedIcon,
  Brightness6Sharp as ThemeIcon,
} from '@mui/icons-material';
import { tokens } from '../../../../theme';

export function SettingsTab() {
  const navigate = useNavigate();

  // Local state for quick settings
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [gameSpeed, setGameSpeed] = useState(1);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);

  return (
    <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 1,
        }}
      >
        <Typography sx={{ fontWeight: 600, fontSize: '1rem' }}>
          Quick Settings
        </Typography>
        <ButtonBase
          onClick={() => navigate('/settings')}
          sx={{
            fontSize: '0.75rem',
            color: tokens.colors.secondary,
            px: 1,
            py: 0.5,
            borderRadius: 1,
            transition: 'all 0.15s ease',
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.05)',
            },
          }}
        >
          All Settings
        </ButtonBase>
      </Box>

      {/* Sound Toggle */}
      <SettingRow
        icon={<SoundIcon sx={{ fontSize: 20 }} />}
        label="Sound Effects"
        control={
          <Switch
            checked={soundEnabled}
            onChange={(e) => setSoundEnabled(e.target.checked)}
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
            onChange={(e) => setMusicEnabled(e.target.checked)}
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
            onChange={(e) => setAnimationsEnabled(e.target.checked)}
            size="small"
          />
        }
      />

      {/* Full Settings Link */}
      <ButtonBase
        onClick={() => navigate('/settings')}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1,
          py: 1.5,
          mt: 1,
          borderRadius: 2,
          bgcolor: tokens.colors.background.elevated,
          border: `1px solid ${tokens.colors.border}`,
          color: tokens.colors.text.secondary,
          transition: 'all 0.15s ease',
          '&:hover': {
            bgcolor: tokens.colors.background.paper,
            color: tokens.colors.text.primary,
            borderColor: tokens.colors.text.secondary,
          },
        }}
      >
        <SettingsIcon sx={{ fontSize: 18 }} />
        <Typography sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
          All Settings
        </Typography>
      </ButtonBase>
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
