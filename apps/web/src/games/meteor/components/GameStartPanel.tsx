import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Divider,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import BoltIcon from '@mui/icons-material/Bolt';
import { tokens } from '../../../theme';
import { DOMAINS } from '../gameConfig';

export type GameMode = 'normal' | 'hard' | 'endless' | 'boss_rush' | 'practice';

export interface GameConfig {
  domain: number;
  mode: GameMode;
  modifiers: {
    permadeath: boolean;
    extraTribute: boolean;
    luckyStart: boolean;
  };
}

interface GameStartPanelProps {
  onStart: (config: GameConfig) => void;
}

const MODE_INFO: Record<GameMode, { label: string; description: string }> = {
  normal: { label: 'Normal', description: 'Standard progression through all events' },
  hard: { label: 'Hard', description: '-1 summon per event' },
  endless: { label: 'Endless', description: 'Survive as long as possible' },
  boss_rush: { label: 'Boss Rush', description: 'Boss events only' },
  practice: { label: 'Practice', description: 'Unlimited summons, no scoring' },
};

export function GameStartPanel({ onStart }: GameStartPanelProps) {
  const [domain, setDomain] = useState<number>(1);
  const [mode, setMode] = useState<GameMode>('normal');
  const [modifiers, setModifiers] = useState({
    permadeath: true,
    extraTribute: false,
    luckyStart: false,
  });

  const handleDomainChange = (_: React.MouseEvent<HTMLElement>, newDomain: number | null) => {
    if (newDomain !== null) {
      setDomain(newDomain);
    }
  };

  const handleModifierChange = (key: keyof typeof modifiers) => {
    setModifiers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleStart = () => {
    onStart({ domain, mode, modifiers });
  };

  const handleQuickPlay = () => {
    onStart({
      domain: 1,
      mode: 'normal',
      modifiers: { permadeath: true, extraTribute: false, luckyStart: false },
    });
  };

  const selectedDomain = DOMAINS.find((d) => d.id === domain);

  return (
    <Paper
      sx={{
        p: 3,
        maxWidth: 360,
        width: '100%',
        bgcolor: 'rgba(26, 26, 26, 0.95)',
        border: `1px solid rgba(255, 255, 255, 0.08)`,
        borderRadius: tokens.radius.lg,
        backdropFilter: 'blur(8px)',
        mx: 2,
      }}
    >
        {/* Header */}
        <Typography
          variant="h6"
          sx={{
            fontFamily: tokens.fonts.gaming,
            textAlign: 'center',
            mb: 3,
            color: tokens.colors.primary,
          }}
        >
          NEW RUN
        </Typography>

        {/* Domain Selection */}
        <Typography variant="subtitle2" sx={{ color: tokens.colors.text.secondary, mb: 1 }}>
          Domain
        </Typography>
        <ToggleButtonGroup
          value={domain}
          exclusive
          onChange={handleDomainChange}
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 1,
            mb: 2,
            '& .MuiToggleButton-root': {
              border: `1px solid ${tokens.colors.border}`,
              borderRadius: `${tokens.radius.sm}px !important`,
              py: 1,
              px: 1.5,
              fontSize: '0.95rem',
              textTransform: 'none',
              '&.Mui-selected': {
                bgcolor: `${tokens.colors.primary}20`,
                borderColor: tokens.colors.primary,
                color: tokens.colors.primary,
                '&:hover': {
                  bgcolor: `${tokens.colors.primary}30`,
                },
              },
            },
          }}
        >
          {DOMAINS.map((d) => (
            <ToggleButton key={d.id} value={d.id}>
              {d.name.replace('The ', '')}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>

        {/* Domain Info */}
        {selectedDomain && (
          <Box
            sx={{
              p: 1.5,
              mb: 2,
              bgcolor: tokens.colors.background.elevated,
              borderRadius: tokens.radius.sm,
            }}
          >
            <Typography variant="caption" sx={{ color: tokens.colors.text.secondary }}>
              Base Score Goal: {selectedDomain.baseScoreGoal.toLocaleString()}
            </Typography>
          </Box>
        )}

        {/* Mode Selection */}
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel
            sx={{
              color: tokens.colors.text.secondary,
              '&.Mui-focused': { color: tokens.colors.primary },
            }}
          >
            Mode
          </InputLabel>
          <Select
            value={mode}
            label="Mode"
            onChange={(e) => setMode(e.target.value as GameMode)}
            sx={{
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: tokens.colors.border,
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: tokens.colors.text.secondary,
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: tokens.colors.primary,
              },
            }}
          >
            {Object.entries(MODE_INFO).map(([key, info]) => (
              <MenuItem key={key} value={key}>
                <Box>
                  <Typography variant="body2">{info.label}</Typography>
                  <Typography variant="caption" sx={{ color: tokens.colors.text.secondary }}>
                    {info.description}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Divider sx={{ my: 2, borderColor: tokens.colors.border }} />

        {/* Modifiers */}
        <Typography variant="subtitle2" sx={{ color: tokens.colors.text.secondary, mb: 1 }}>
          Modifiers
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 3 }}>
          <FormControlLabel
            control={
              <Switch
                checked={modifiers.permadeath}
                onChange={() => handleModifierChange('permadeath')}
                size="small"
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: tokens.colors.primary,
                    '& + .MuiSwitch-track': {
                      backgroundColor: tokens.colors.primary,
                    },
                  },
                }}
              />
            }
            label={
              <Box>
                <Typography variant="body2">Permadeath</Typography>
                <Typography variant="caption" sx={{ color: tokens.colors.text.secondary }}>
                  One loss = game over
                </Typography>
              </Box>
            }
            sx={{ alignItems: 'flex-start', mx: 0 }}
          />
          <FormControlLabel
            control={
              <Switch
                checked={modifiers.extraTribute}
                onChange={() => handleModifierChange('extraTribute')}
                size="small"
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: tokens.colors.secondary,
                    '& + .MuiSwitch-track': {
                      backgroundColor: tokens.colors.secondary,
                    },
                  },
                }}
              />
            }
            label={
              <Box>
                <Typography variant="body2">Extra Tribute</Typography>
                <Typography variant="caption" sx={{ color: tokens.colors.text.secondary }}>
                  +1 tribute per event
                </Typography>
              </Box>
            }
            sx={{ alignItems: 'flex-start', mx: 0 }}
          />
          <FormControlLabel
            control={
              <Switch
                checked={modifiers.luckyStart}
                onChange={() => handleModifierChange('luckyStart')}
                size="small"
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: tokens.colors.warning,
                    '& + .MuiSwitch-track': {
                      backgroundColor: tokens.colors.warning,
                    },
                  },
                }}
              />
            }
            label={
              <Box>
                <Typography variant="body2">Lucky Start</Typography>
                <Typography variant="caption" sx={{ color: tokens.colors.text.secondary }}>
                  Begin with 2x multiplier
                </Typography>
              </Box>
            }
            sx={{ alignItems: 'flex-start', mx: 0 }}
          />
        </Box>

        {/* Start Buttons */}
        <Button
          variant="contained"
          fullWidth
          size="large"
          startIcon={<PlayArrowIcon />}
          onClick={handleStart}
          sx={{
            bgcolor: tokens.colors.success,
            color: '#000',
            fontWeight: 700,
            py: 1.5,
            mb: 1.5,
            '&:hover': {
              bgcolor: '#28b34d',
            },
          }}
        >
          Start Game
        </Button>

        <Button
          variant="outlined"
          fullWidth
          startIcon={<BoltIcon />}
          onClick={handleQuickPlay}
          sx={{
            borderColor: tokens.colors.border,
            color: tokens.colors.text.primary,
            '&:hover': {
              borderColor: tokens.colors.text.secondary,
              bgcolor: 'rgba(255,255,255,0.05)',
            },
          }}
        >
          Quick Play
        </Button>

        {/* Footer flavor */}
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            textAlign: 'center',
            color: tokens.colors.text.disabled,
            mt: 2,
            fontStyle: 'italic',
          }}
        >
          The Die-rectors await your arrival...
        </Typography>
    </Paper>
  );
}
