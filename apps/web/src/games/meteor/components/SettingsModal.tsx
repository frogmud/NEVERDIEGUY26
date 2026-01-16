import { Box, Button, Dialog, DialogContent, Typography, Switch, FormControlLabel } from '@mui/material';
import {
  SettingsSharp as SettingsIcon,
  RestartAltSharp as RestartIcon,
  HomeSharp as HomeIcon,
  BarChartSharp as StatsIcon,
  PlayArrowSharp as ResumeIcon,
  SkipNextSharp as SkipIcon,
  SpeedSharp as SpeedIcon,
} from '@mui/icons-material';
import { tokens } from '../../../theme';
import { useGameSettings } from '../../../contexts/GameSettingsContext';

// Gaming font style
const gamingFont = { fontFamily: tokens.fonts.gaming };

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  onRestart: () => void;
  onMainMenu?: () => void;
  onStats?: () => void;
  onSkip?: () => void;
}

export function SettingsModal({
  open,
  onClose,
  onRestart,
  onMainMenu,
  onStats,
  onSkip,
}: SettingsModalProps) {
  const { gameSpeed, setGameSpeed } = useGameSettings();
  const isFastMode = gameSpeed >= 1.5;

  const handleSpeedToggle = () => {
    setGameSpeed(isFastMode ? 1 : 2);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          bgcolor: tokens.colors.background.paper,
          border: `2px solid ${tokens.colors.border}`,
          borderRadius: 2,
          minWidth: 320,
        },
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography
            variant="h5"
            sx={{ ...gamingFont, mb: 3, color: tokens.colors.text.primary }}
          >
            Paused
          </Typography>

          {/* Menu buttons */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {/* Resume - most prominent */}
            <Button
              variant="contained"
              startIcon={<ResumeIcon />}
              onClick={onClose}
              sx={{
                bgcolor: tokens.colors.success,
                color: '#fff',
                ...gamingFont,
                fontSize: '1.125rem',
                py: 1.5,
                justifyContent: 'flex-start',
                pl: 3,
                '&:hover': { bgcolor: '#28a745' },
              }}
            >
              Resume
            </Button>

            {/* Quick Settings - Speed Toggle */}
            <Box
              sx={{
                bgcolor: tokens.colors.background.elevated,
                borderRadius: 1,
                px: 2,
                py: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SpeedIcon sx={{ color: tokens.colors.text.secondary, fontSize: 20 }} />
                <Typography sx={{ ...gamingFont, fontSize: '0.85rem', color: tokens.colors.text.primary }}>
                  Fast Mode
                </Typography>
              </Box>
              <Switch
                checked={isFastMode}
                onChange={handleSpeedToggle}
                size="small"
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: tokens.colors.success,
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    bgcolor: tokens.colors.success,
                  },
                }}
              />
            </Box>

            {/* Skip Room - warning styled */}
            {onSkip && (
              <Button
                variant="contained"
                startIcon={<SkipIcon />}
                onClick={() => {
                  onSkip();
                  onClose();
                }}
                sx={{
                  bgcolor: tokens.colors.error,
                  color: '#fff',
                  ...gamingFont,
                  fontSize: '0.9rem',
                  py: 1.5,
                  justifyContent: 'flex-start',
                  pl: 3,
                  '&:hover': { bgcolor: '#c0392b' },
                }}
              >
                Skip Event
              </Button>
            )}

            <Button
              variant="contained"
              startIcon={<RestartIcon />}
              onClick={() => {
                onRestart();
                onClose();
              }}
              sx={{
                bgcolor: tokens.colors.background.elevated,
                color: tokens.colors.text.primary,
                ...gamingFont,
                fontSize: '0.9rem',
                py: 1.5,
                justifyContent: 'flex-start',
                pl: 3,
                '&:hover': { bgcolor: tokens.colors.border },
              }}
            >
              New Run
            </Button>

            <Button
              variant="contained"
              startIcon={<HomeIcon />}
              onClick={onMainMenu}
              sx={{
                bgcolor: tokens.colors.background.elevated,
                color: tokens.colors.text.primary,
                ...gamingFont,
                fontSize: '0.9rem',
                py: 1.5,
                justifyContent: 'flex-start',
                pl: 3,
                '&:hover': { bgcolor: tokens.colors.border },
              }}
            >
              Main Menu
            </Button>

            <Button
              variant="contained"
              startIcon={<StatsIcon />}
              onClick={onStats}
              sx={{
                bgcolor: tokens.colors.background.elevated,
                color: tokens.colors.text.primary,
                ...gamingFont,
                fontSize: '0.9rem',
                py: 1.5,
                justifyContent: 'flex-start',
                pl: 3,
                '&:hover': { bgcolor: tokens.colors.border },
              }}
            >
              Stats
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
