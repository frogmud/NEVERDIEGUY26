import { Box, Button, Dialog, DialogContent, Typography } from '@mui/material';
import {
  SettingsSharp as SettingsIcon,
  RestartAltSharp as RestartIcon,
  HomeSharp as HomeIcon,
  BarChartSharp as StatsIcon,
  ArrowBackSharp as BackIcon,
  SkipNextSharp as SkipIcon,
} from '@mui/icons-material';
import { tokens } from '../../../theme';

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
                  fontSize: '1.125rem',
                  py: 1.5,
                  justifyContent: 'flex-start',
                  pl: 3,
                  '&:hover': { bgcolor: '#c0392b' },
                }}
              >
                Skip Room
              </Button>
            )}

            <Button
              variant="contained"
              startIcon={<SettingsIcon />}
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
              Settings
            </Button>

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

            <Button
              variant="contained"
              startIcon={<BackIcon />}
              onClick={onClose}
              sx={{
                bgcolor: '#C4A000',
                color: '#fff',
                ...gamingFont,
                fontSize: '0.9rem',
                py: 1.5,
                justifyContent: 'flex-start',
                pl: 3,
                mt: 1,
                '&:hover': { bgcolor: '#a08300' },
              }}
            >
              Back
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
