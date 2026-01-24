import { useState, useEffect } from 'react';
import { Box, Typography, Button, keyframes } from '@mui/material';
import { PanToolSharp as SwipeIcon, CloseSharp as CloseIcon } from '@mui/icons-material';
import { tokens } from '../theme';
import { useTutorial } from '../contexts';

// Swipe gesture animation
const swipeGesture = keyframes`
  0% {
    transform: translateX(-40px);
    opacity: 0.3;
  }
  50% {
    transform: translateX(40px);
    opacity: 1;
  }
  100% {
    transform: translateX(-40px);
    opacity: 0.3;
  }
`;

// Fade in overlay animation
const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

// Pulse animation for the hand icon
const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
`;

interface TutorialOverlayProps {
  onDismiss?: () => void;
}

export function TutorialOverlay({ onDismiss }: TutorialOverlayProps) {
  const { shouldShowSwipeTutorial, markSwipeTutorialSeen } = useTutorial();
  const [isVisible, setIsVisible] = useState(false);

  // Fade in after delay
  useEffect(() => {
    if (shouldShowSwipeTutorial) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 800); // 800ms delay to let page settle
      return () => clearTimeout(timer);
    }
  }, [shouldShowSwipeTutorial]);

  const handleDismiss = () => {
    markSwipeTutorialSeen();
    setIsVisible(false);
    onDismiss?.();
  };

  // Don't render if shouldn't show or not visible yet
  if (!shouldShowSwipeTutorial || !isVisible) {
    return null;
  }

  return (
    <Box
      onClick={handleDismiss}
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 300,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(4px)',
        animation: `${fadeIn} 0.4s ease-out`,
        cursor: 'pointer',
      }}
    >
      {/* Tutorial content */}
      <Box
        onClick={(e) => e.stopPropagation()} // Prevent dismissing when clicking content
        sx={{
          position: 'relative',
          textAlign: 'center',
          maxWidth: 400,
          px: 4,
          cursor: 'default',
        }}
      >
        {/* Animated hand icon */}
        <Box
          sx={{
            mb: 3,
            animation: `${swipeGesture} 2s ease-in-out infinite`,
          }}
        >
          <SwipeIcon
            sx={{
              fontSize: 80,
              color: tokens.colors.primary,
              filter: `drop-shadow(0 0 20px ${tokens.colors.primary})`,
              animation: `${pulse} 2s ease-in-out infinite`,
            }}
          />
        </Box>

        {/* Tutorial text */}
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            mb: 1,
            color: tokens.colors.text.primary,
          }}
        >
          Swipe to explore
        </Typography>

        <Typography
          variant="body1"
          sx={{
            color: tokens.colors.text.secondary,
            mb: 3,
          }}
        >
          The universe is 3D • Drag to rotate • Scroll to zoom
        </Typography>

        {/* Dismiss button */}
        <Button
          variant="contained"
          onClick={handleDismiss}
          startIcon={<CloseIcon />}
          sx={{
            bgcolor: tokens.colors.primary,
            color: tokens.colors.text.primary,
            fontWeight: 700,
            px: 4,
            py: 1.5,
            borderRadius: 2,
            '&:hover': {
              bgcolor: tokens.colors.primary,
              filter: 'brightness(1.2)',
            },
          }}
        >
          Got it
        </Button>

        {/* Subtle hint */}
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            mt: 2,
            color: tokens.colors.text.disabled,
            fontSize: '0.7rem',
          }}
        >
          Click anywhere to dismiss
        </Typography>
      </Box>
    </Box>
  );
}
