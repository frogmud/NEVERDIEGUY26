/**
 * PlayOptionsModal - Options menu for zone selection view
 *
 * Shows during zone select phase with options to abandon run, etc.
 */

import { useNavigate } from 'react-router-dom';
import { Box, Button, Dialog, DialogContent, Typography } from '@mui/material';
import {
  ArrowBackSharp as BackIcon,
  HomeSharp as HomeIcon,
  DeleteForeverSharp as AbandonIcon,
  SettingsSharp as SettingsIcon,
} from '@mui/icons-material';
import { tokens } from '../../../theme';

const gamingFont = { fontFamily: tokens.fonts.gaming };

interface PlayOptionsModalProps {
  open: boolean;
  onClose: () => void;
  onAbandonRun?: () => void;
  seedHash?: string;
  domain?: number;
  roomNumber?: number;
}

export function PlayOptionsModal({
  open,
  onClose,
  onAbandonRun,
  seedHash,
  domain = 1,
  roomNumber = 1,
}: PlayOptionsModalProps) {
  const navigate = useNavigate();

  const handleAbandon = () => {
    onAbandonRun?.();
    onClose();
  };

  const handleMainMenu = () => {
    navigate('/');
    onClose();
  };

  const handleSettings = () => {
    navigate('/settings');
    onClose();
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
        <Box sx={{ p: 3 }}>
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography
              variant="h5"
              sx={{ ...gamingFont, color: tokens.colors.text.primary, mb: 1 }}
            >
              Options
            </Typography>
            {seedHash && (
              <Typography
                sx={{
                  fontSize: '0.75rem',
                  color: tokens.colors.text.disabled,
                  fontFamily: 'monospace',
                }}
              >
                Seed: {seedHash} | Domain {domain} | Event {roomNumber}
              </Typography>
            )}
          </Box>

          {/* Menu buttons */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Button
              variant="contained"
              startIcon={<SettingsIcon />}
              onClick={handleSettings}
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
              startIcon={<HomeIcon />}
              onClick={handleMainMenu}
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

            {onAbandonRun && (
              <Button
                variant="contained"
                startIcon={<AbandonIcon />}
                onClick={handleAbandon}
                sx={{
                  bgcolor: `${tokens.colors.error}20`,
                  color: tokens.colors.error,
                  border: `1px solid ${tokens.colors.error}40`,
                  ...gamingFont,
                  fontSize: '0.9rem',
                  py: 1.5,
                  justifyContent: 'flex-start',
                  pl: 3,
                  '&:hover': {
                    bgcolor: `${tokens.colors.error}30`,
                    borderColor: tokens.colors.error,
                  },
                }}
              >
                Abandon Run
              </Button>
            )}

            <Button
              variant="contained"
              startIcon={<BackIcon />}
              onClick={onClose}
              sx={{
                bgcolor: tokens.colors.success,
                color: '#fff',
                ...gamingFont,
                fontSize: '0.9rem',
                py: 1.5,
                justifyContent: 'flex-start',
                pl: 3,
                mt: 1,
                '&:hover': { bgcolor: '#1e8449' },
              }}
            >
              Resume
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
