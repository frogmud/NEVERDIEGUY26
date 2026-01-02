/**
 * Guest Experience Components
 *
 * Reusable components for handling guest/unauthenticated user states.
 */

import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Alert, Paper } from '@mui/material';
import {
  InfoSharp as InfoIcon,
  WarningSharp as WarningIcon,
  PersonAddSharp as SignUpIcon,
  LoginSharp as LoginIcon,
  CloseSharp as CloseIcon,
} from '@mui/icons-material';
import { tokens } from '../theme';

/**
 * GuestBanner - Alert banner for sections accessible to guests
 *
 * Variants:
 * - "warning" (yellow): For Play section - progress not saved
 * - "info" (blue): For Wiki section - preferences notice
 */
interface GuestBannerProps {
  variant: 'warning' | 'info';
  message: string;
  showSignIn?: boolean;
}

export function GuestBanner({ variant, message, showSignIn = true }: GuestBannerProps) {
  const navigate = useNavigate();

  return (
    <Alert
      severity={variant}
      icon={variant === 'warning' ? <WarningIcon /> : <InfoIcon />}
      sx={{
        mb: 3,
        borderRadius: '12px',
        bgcolor: variant === 'warning'
          ? `${tokens.colors.warning}15`
          : `${tokens.colors.secondary}15`,
        border: `1px solid ${variant === 'warning' ? tokens.colors.warning : tokens.colors.secondary}40`,
        '& .MuiAlert-icon': {
          color: variant === 'warning' ? tokens.colors.warning : tokens.colors.secondary,
        },
        '& .MuiAlert-message': {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          gap: 2,
        },
      }}
    >
      <Typography variant="body2" sx={{ color: tokens.colors.text.primary }}>
        {message}
      </Typography>
      {showSignIn && (
        <Button
          size="small"
          variant="outlined"
          onClick={() => navigate('/login')}
          sx={{
            flexShrink: 0,
            borderColor: variant === 'warning' ? tokens.colors.warning : tokens.colors.secondary,
            color: variant === 'warning' ? tokens.colors.warning : tokens.colors.secondary,
            '&:hover': {
              borderColor: variant === 'warning' ? tokens.colors.warning : tokens.colors.secondary,
              bgcolor: `${variant === 'warning' ? tokens.colors.warning : tokens.colors.secondary}20`,
            },
          }}
        >
          Sign In
        </Button>
      )}
    </Alert>
  );
}

/**
 * GuestBlockModal - Full-screen modal blocking access for guests
 *
 * Used for Progress and Market sections where guest access is not allowed.
 */
interface GuestBlockModalProps {
  title: string;
  description: string;
  iconSrc?: string;
}

export function GuestBlockModal({ title, description, iconSrc }: GuestBlockModalProps) {
  const navigate = useNavigate();

  const handleBackdropClick = () => {
    navigate('/');
  };

  return (
    <Box
      onClick={handleBackdropClick}
      sx={{
        position: 'fixed',
        inset: 0,
        bgcolor: 'rgba(0, 0, 0, 0.95)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1300,
        p: 3,
        cursor: 'pointer',
      }}
    >
      <Paper
        onClick={(e) => e.stopPropagation()}
        sx={{
          maxWidth: 420,
          width: '100%',
          bgcolor: tokens.colors.background.paper,
          borderRadius: '30px',
          border: `1px solid ${tokens.colors.border}`,
          cursor: 'default',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 3,
            py: 2.5,
            borderBottom: `1px solid ${tokens.colors.border}`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {iconSrc && (
              <img
                src={iconSrc}
                alt=""
                style={{ width: 24, height: 24 }}
              />
            )}
            <Typography
              sx={{
                fontWeight: 600,
                fontSize: '1.25rem',
                color: tokens.colors.text.primary,
              }}
            >
              {title}
            </Typography>
          </Box>
          <CloseIcon
            onClick={handleBackdropClick}
            sx={{
              fontSize: 20,
              color: tokens.colors.text.disabled,
              cursor: 'pointer',
              '&:hover': { color: tokens.colors.text.secondary },
            }}
          />
        </Box>

        {/* Content */}
        <Box sx={{ p: 3 }}>
          {/* Description */}
          <Typography
            sx={{
              color: tokens.colors.text.secondary,
              mb: 3,
              fontSize: '1.1rem',
              lineHeight: 1.6,
            }}
          >
            {description}
          </Typography>

        {/* Actions */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Button
            variant="contained"
            size="large"
            fullWidth
            startIcon={<SignUpIcon />}
            onClick={() => navigate('/signup')}
            sx={{
              py: 1.5,
              borderRadius: '12px',
              fontWeight: 600,
            }}
          >
            Create Account
          </Button>
          <Button
            variant="outlined"
            size="large"
            fullWidth
            startIcon={<LoginIcon />}
            onClick={() => navigate('/login')}
            sx={{
              py: 1.5,
              borderRadius: '12px',
              fontWeight: 600,
              borderColor: tokens.colors.border,
              color: tokens.colors.text.primary,
              '&:hover': {
                borderColor: tokens.colors.text.secondary,
                bgcolor: 'transparent',
              },
            }}
          >
            Sign In
          </Button>
        </Box>
        </Box>
      </Paper>
    </Box>
  );
}
