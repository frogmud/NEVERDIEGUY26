import { useState } from 'react';
import {
  Box,
  Typography,
  Container,
  Button,
} from '@mui/material';
import {
  WifiOffSharp as OfflineIcon,
  RefreshSharp as RetryIcon,
  CloudOffSharp as CloudOffIcon,
  SignalWifiOffSharp as NoSignalIcon,
} from '@mui/icons-material';
import { tokens } from '../../theme';
import { AsciiGalaxy } from '../../components/AsciiGalaxy';

interface NetworkErrorProps {
  type?: 'connection' | 'timeout' | 'server';
  onRetry?: () => void;
}

const errorConfig = {
  connection: {
    icon: OfflineIcon,
    title: 'No Internet Connection',
    message: 'Please check your network settings and try again.',
  },
  timeout: {
    icon: NoSignalIcon,
    title: 'Connection Timed Out',
    message: 'The server took too long to respond. Please try again.',
  },
  server: {
    icon: CloudOffIcon,
    title: 'Server Unavailable',
    message: 'Our servers are temporarily down. Please try again later.',
  },
};

export function NetworkError({ type = 'connection', onRetry }: NetworkErrorProps) {
  const [retrying, setRetrying] = useState(false);
  const config = errorConfig[type];
  const Icon = config.icon;

  const handleRetry = () => {
    setRetrying(true);
    // Simulate retry
    setTimeout(() => {
      setRetrying(false);
      onRetry?.();
    }, 2000);
  };

  return (
    <Container maxWidth="sm" sx={{ position: 'relative' }}>
      {/* Interactive galaxy background */}
      {retrying && <AsciiGalaxy mode="interactive" opacity={0.4} starCount={120} />}

      <Box
        sx={{
          minHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          py: 4,
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Icon */}
        <Box
          sx={{
            width: 120,
            height: 120,
            borderRadius: '50%',
            bgcolor: `${tokens.colors.error}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 4,
          }}
        >
          <Icon sx={{ fontSize: 56, color: tokens.colors.error }} />
        </Box>

        {/* Title */}
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
          {config.title}
        </Typography>

        {/* Message */}
        <Typography
          variant="body1"
          sx={{ color: tokens.colors.text.secondary, mb: 4, maxWidth: 300 }}
        >
          {config.message}
        </Typography>

        {/* Retry Button */}
        <Button
          variant="contained"
          size="large"
          startIcon={<RetryIcon />}
          onClick={handleRetry}
          disabled={retrying}
          sx={{ minWidth: 160 }}
        >
          {retrying ? 'Retrying...' : 'Try Again'}
        </Button>

        {/* Help Link */}
        <Typography
          variant="body2"
          sx={{
            mt: 3,
            color: tokens.colors.text.disabled,
          }}
        >
          Need help?{' '}
          <Box
            component="span"
            sx={{
              color: tokens.colors.secondary,
              cursor: 'pointer',
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            Contact Support
          </Box>
        </Typography>
      </Box>
    </Container>
  );
}

// Demo wrapper to show all error types
export function NetworkErrorDemo() {
  const [errorType, setErrorType] = useState<'connection' | 'timeout' | 'server'>('connection');

  return (
    <Box>
      {/* Type Selector */}
      <Box
        sx={{
          position: 'fixed',
          top: 80,
          right: 16,
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          bgcolor: tokens.colors.background.paper,
          p: 2,
          borderRadius: 2,
          border: `1px solid ${tokens.colors.border}`,
        }}
      >
        <Typography variant="caption" sx={{ color: tokens.colors.text.secondary }}>
          Error Type:
        </Typography>
        {(['connection', 'timeout', 'server'] as const).map((type) => (
          <Button
            key={type}
            size="small"
            variant={errorType === type ? 'contained' : 'outlined'}
            onClick={() => setErrorType(type)}
            sx={{ textTransform: 'capitalize' }}
          >
            {type}
          </Button>
        ))}
      </Box>

      <NetworkError type={errorType} onRetry={() => console.log('Retry clicked')} />
    </Box>
  );
}
