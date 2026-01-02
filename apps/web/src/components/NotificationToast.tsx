import { useState, useEffect } from 'react';
import { Box, Typography, Slide } from '@mui/material';
import { tokens } from '../theme';

interface NotificationToastProps {
  message: string;
  icon?: React.ReactNode;
  duration?: number;
  variant?: 'xp' | 'gold' | 'info' | 'success' | 'error';
  position?: 'top-right' | 'top-center' | 'bottom-center';
  onClose?: () => void;
  visible?: boolean;
  /** Stack index for multiple toasts - offsets position */
  index?: number;
}

const variantStyles = {
  xp: {
    bg: `${tokens.colors.secondary}20`,
    border: tokens.colors.secondary,
    color: tokens.colors.secondary,
  },
  gold: {
    bg: `${tokens.colors.warning}20`,
    border: tokens.colors.warning,
    color: tokens.colors.warning,
  },
  info: {
    bg: `${tokens.colors.secondary}20`,
    border: tokens.colors.secondary,
    color: tokens.colors.secondary,
  },
  success: {
    bg: `${tokens.colors.success}20`,
    border: tokens.colors.success,
    color: tokens.colors.success,
  },
  error: {
    bg: `${tokens.colors.error}20`,
    border: tokens.colors.error,
    color: tokens.colors.error,
  },
};

const positionStyles = {
  'top-right': {
    top: 80,
    right: 24,
    left: 'auto',
    transform: 'none',
  },
  'top-center': {
    top: 80,
    left: '50%',
    right: 'auto',
    transform: 'translateX(-50%)',
  },
  'bottom-center': {
    bottom: 100,
    top: 'auto',
    left: '50%',
    right: 'auto',
    transform: 'translateX(-50%)',
  },
};

const TOAST_HEIGHT = 48;
const TOAST_GAP = 8;

export function NotificationToast({
  message,
  icon,
  duration = 2000,
  variant = 'info',
  position = 'top-right',
  onClose,
  visible = true,
  index = 0,
}: NotificationToastProps) {
  const [show, setShow] = useState(visible);
  const style = variantStyles[variant];
  const basePos = positionStyles[position];

  // Calculate stacked position
  const stackOffset = index * (TOAST_HEIGHT + TOAST_GAP);
  const isTop = position.includes('top');
  const pos = {
    ...basePos,
    ...(isTop
      ? { top: 80 + stackOffset }
      : { bottom: 100 + stackOffset }),
  };

  useEffect(() => {
    setShow(visible);
  }, [visible]);

  useEffect(() => {
    if (show && duration > 0) {
      const timer = setTimeout(() => {
        setShow(false);
        onClose?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  return (
    <Slide direction={position.includes('top') ? 'down' : 'up'} in={show} mountOnEnter unmountOnExit>
      <Box
        sx={{
          position: 'fixed',
          zIndex: 9999,
          ...pos,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 2,
            py: 1,
            borderRadius: 2,
            bgcolor: style.bg,
            border: `1px solid ${style.border}`,
            boxShadow: `0 4px 20px ${style.border}40`,
          }}
        >
          {icon && (
            <Box sx={{ display: 'flex', color: style.color }}>
              {icon}
            </Box>
          )}
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              color: style.color,
            }}
          >
            {message}
          </Typography>
        </Box>
      </Box>
    </Slide>
  );
}
