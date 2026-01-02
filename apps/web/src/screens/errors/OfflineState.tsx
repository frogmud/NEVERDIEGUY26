import { useState } from 'react';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import { WifiOffSharp as OfflineIcon } from '@mui/icons-material';
import { tokens } from '../../theme';

export function OfflineState() {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);
    // Simulate connection check
    await new Promise(resolve => setTimeout(resolve, 2000));
    // In real app, would check navigator.onLine or ping server
    setIsRetrying(false);
    // For demo, just reload
    window.location.reload();
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        textAlign: 'center',
        px: 2,
      }}
    >
      <OfflineIcon
        sx={{
          fontSize: 80,
          color: tokens.colors.text.disabled,
          mb: 3,
        }}
      />
      <Typography variant="h4" sx={{ mb: 1, fontWeight: 600 }}>
        You're Offline
      </Typography>
      <Typography
        variant="body1"
        sx={{ color: tokens.colors.text.secondary, mb: 4, maxWidth: 400 }}
      >
        Check your internet connection and try again. Some features may be limited while offline.
      </Typography>
      <Button
        variant="contained"
        onClick={handleRetry}
        disabled={isRetrying}
        startIcon={isRetrying ? <CircularProgress size={16} color="inherit" /> : null}
        sx={{ minWidth: 180 }}
      >
        {isRetrying ? 'Checking...' : 'Retry Connection'}
      </Button>

      {/* Cached content notice */}
      <Box
        sx={{
          mt: 6,
          p: 2,
          bgcolor: tokens.colors.background.elevated,
          borderRadius: 1,
          border: `1px solid ${tokens.colors.border}`,
          maxWidth: 400,
        }}
      >
        <Typography variant="caption" sx={{ color: tokens.colors.text.secondary }}>
          Some previously viewed content may still be available. Browse your saved items in the meantime.
        </Typography>
      </Box>
    </Box>
  );
}
