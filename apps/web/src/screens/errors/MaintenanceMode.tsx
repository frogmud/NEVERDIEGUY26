import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Button,
  LinearProgress,
} from '@mui/material';
import {
  BuildSharp as MaintenanceIcon,
  RefreshSharp as RefreshIcon,
  NotificationsActiveSharp as NotifyIcon,
} from '@mui/icons-material';
import { tokens } from '../../theme';

interface MaintenanceModeProps {
  estimatedEnd?: string;
  progress?: number;
  message?: string;
}

export function MaintenanceMode({
  estimatedEnd = '2:00 PM EST',
  progress = 65,
  message = 'We\'re performing scheduled maintenance to improve your experience.',
}: MaintenanceModeProps) {
  const [notifyEnabled, setNotifyEnabled] = useState(false);
  const [countdown, setCountdown] = useState(3600); // 1 hour in seconds

  // Simulate countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatCountdown = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  const handleNotify = () => {
    setNotifyEnabled(true);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: tokens.colors.background.default,
        p: 3,
      }}
    >
      <Container maxWidth="sm">
        <Box sx={{ textAlign: 'center' }}>
          {/* Animated Icon */}
          <Box
            sx={{
              width: 120,
              height: 120,
              borderRadius: '50%',
              bgcolor: `${tokens.colors.warning}15`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 4,
              animation: 'pulse 2s infinite',
              '@keyframes pulse': {
                '0%, 100%': { transform: 'scale(1)', opacity: 1 },
                '50%': { transform: 'scale(1.05)', opacity: 0.8 },
              },
            }}
          >
            <MaintenanceIcon sx={{ fontSize: 56, color: tokens.colors.warning }} />
          </Box>

          {/* Title */}
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
            Under Maintenance
          </Typography>

          {/* Message */}
          <Typography
            variant="body1"
            sx={{ color: tokens.colors.text.secondary, mb: 4, maxWidth: 400, mx: 'auto' }}
          >
            {message}
          </Typography>

          {/* Progress */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="caption" sx={{ color: tokens.colors.text.secondary }}>
                Progress
              </Typography>
              <Typography variant="caption" sx={{ color: tokens.colors.warning }}>
                {progress}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: tokens.colors.background.elevated,
                '& .MuiLinearProgress-bar': {
                  bgcolor: tokens.colors.warning,
                },
              }}
            />
          </Box>

          {/* Countdown */}
          <Box
            sx={{
              p: 3,
              mb: 4,
              borderRadius: 2,
              bgcolor: tokens.colors.background.paper,
              border: `1px solid ${tokens.colors.border}`,
            }}
          >
            <Typography variant="caption" sx={{ color: tokens.colors.text.secondary }}>
              Estimated time remaining
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, color: tokens.colors.warning, my: 1 }}>
              {formatCountdown(countdown)}
            </Typography>
            <Typography variant="caption" sx={{ color: tokens.colors.text.disabled }}>
              Expected completion: {estimatedEnd}
            </Typography>
          </Box>

          {/* Actions */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            {notifyEnabled ? (
              <Button
                variant="contained"
                disabled
                startIcon={<NotifyIcon />}
                sx={{ bgcolor: tokens.colors.success }}
              >
                We'll notify you!
              </Button>
            ) : (
              <Button
                variant="contained"
                startIcon={<NotifyIcon />}
                onClick={handleNotify}
              >
                Notify Me When Ready
              </Button>
            )}
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => window.location.reload()}
            >
              Check Status
            </Button>
          </Box>

          {/* Social Links */}
          <Box sx={{ mt: 4 }}>
            <Typography variant="caption" sx={{ color: tokens.colors.text.disabled, display: 'block', mb: 1 }}>
              Follow us for updates
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                size="small"
                sx={{ color: tokens.colors.text.secondary }}
              >
                Twitter/X
              </Button>
              <Button
                size="small"
                sx={{ color: tokens.colors.text.secondary }}
              >
                Discord
              </Button>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

// Demo wrapper
export function MaintenanceModeDemo() {
  return <MaintenanceMode />;
}
