import { useState, useEffect } from 'react';
import { Dialog, Paper, Box, Typography, Button, IconButton, List, ListItem, ListItemIcon, ListItemText, keyframes } from '@mui/material';
import {
  CloseSharp,
  TouchAppSharp,
  ZoomInSharp,
  SettingsSharp,
  FullscreenSharp,
  FlagSharp
} from '@mui/icons-material';
import { tokens } from '../theme';
import { useTutorial } from '../contexts';

// Staggered fade-in animation for list items
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

// Subtle bounce animation for icons (nudging to use features)
const iconBounce = keyframes`
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
`;

interface TutorialModalProps {
  open: boolean;
  onClose: () => void;
}

export function TutorialModal({ open, onClose }: TutorialModalProps) {
  const { markNewRunTutorialSeen } = useTutorial();
  const [showItems, setShowItems] = useState(false);

  // Trigger staggered animation when modal opens
  useEffect(() => {
    if (open) {
      setShowItems(false);
      const timer = setTimeout(() => setShowItems(true), 200);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const handleClose = () => {
    markNewRunTutorialSeen();
    onClose();
  };

  const tutorialPoints = [
    { icon: TouchAppSharp, text: 'Click to spin the globe' },
    { icon: ZoomInSharp, text: 'Scroll to zoom in and out' },
    { icon: SettingsSharp, text: 'Adjust graphics settings (bottom-left, pauses timer)' },
    { icon: FullscreenSharp, text: 'Play in fullscreen mode (bottom-right)' },
    { icon: FlagSharp, text: 'Report any issues (flag icon)' },
  ];

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: 'transparent',
          boxShadow: 'none',
          overflow: 'visible',
        },
      }}
      BackdropProps={{
        sx: {
          bgcolor: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(4px)',
        },
      }}
    >
      {/* Close button */}
      <IconButton
        onClick={handleClose}
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          zIndex: 10,
          color: '#fff',
        }}
      >
        <CloseSharp />
      </IconButton>

      {/* Content container */}
      <Box sx={{ position: 'relative', pt: 8 }}>
        {/* Skull logo */}
        <Box
          component="img"
          src="/logos/ndg-skull-dome.svg"
          alt="Never Die Guy"
          sx={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 80,
            height: 80,
            filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.3))',
            zIndex: 1,
          }}
        />

        {/* Speech bubble */}
        <Paper
          sx={{
            bgcolor: tokens.colors.background.paper,
            color: tokens.colors.text.primary,
            p: 3,
            borderRadius: 2,
            mt: 5,
            position: 'relative',
            border: `1px solid ${tokens.colors.border}`,
            '&::before': {
              content: '""',
              position: 'absolute',
              top: -10,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '10px solid transparent',
              borderRight: '10px solid transparent',
              borderBottom: `10px solid ${tokens.colors.background.paper}`,
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              top: -11,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '11px solid transparent',
              borderRight: '11px solid transparent',
              borderBottom: `11px solid ${tokens.colors.border}`,
              zIndex: -1,
            },
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, textAlign: 'center' }}>
            Welcome to NEVER DIE GUY!
          </Typography>

          <List sx={{ py: 0 }}>
            {tutorialPoints.map((point, index) => (
              <ListItem
                key={index}
                sx={{
                  py: 0.5,
                  opacity: showItems ? 1 : 0,
                  animation: showItems ? `${fadeInUp} 0.4s ease-out ${index * 0.1}s forwards` : 'none',
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <point.icon
                    sx={{
                      color: '#fff',
                      fontSize: 24,
                      animation: showItems ? `${iconBounce} 1.5s ease-in-out ${index * 0.1 + 0.5}s infinite` : 'none',
                    }}
                  />
                </ListItemIcon>
                <ListItemText
                  primary={point.text}
                  primaryTypographyProps={{ fontSize: '0.9rem' }}
                />
              </ListItem>
            ))}
          </List>

          <Button
            variant="contained"
            onClick={handleClose}
            fullWidth
            sx={{
              mt: 2,
              bgcolor: tokens.colors.primary,
              color: tokens.colors.text.primary,
              fontWeight: 700,
              py: 1.5,
              fontSize: '1rem',
              '&:hover': {
                bgcolor: tokens.colors.primary,
                filter: 'brightness(1.2)',
              },
            }}
          >
            Got it, Let's Play!
          </Button>
        </Paper>
      </Box>
    </Dialog>
  );
}
