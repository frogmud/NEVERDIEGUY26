import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';
import { ErrorOutlineSharp as ErrorIcon } from '@mui/icons-material';
import { tokens } from '../../theme';

export function ServerError() {
  const navigate = useNavigate();
  const errorId = 'ERR-' + Math.random().toString(36).substring(2, 8).toUpperCase();

  const handleRetry = () => {
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
      <ErrorIcon
        sx={{
          fontSize: 80,
          color: tokens.colors.error,
          mb: 2,
        }}
      />
      <Typography
        variant="h1"
        sx={{
          fontSize: '4rem',
          fontWeight: 700,
          color: tokens.colors.error,
          lineHeight: 1,
          mb: 1,
        }}
      >
        500
      </Typography>
      <Typography variant="h5" sx={{ mb: 1 }}>
        Server Error
      </Typography>
      <Typography
        variant="body1"
        sx={{ color: tokens.colors.text.secondary, mb: 3, maxWidth: 400 }}
      >
        Something went wrong on our end. Our team has been notified and is working on a fix.
      </Typography>
      <Typography
        variant="caption"
        sx={{
          color: tokens.colors.text.disabled,
          mb: 4,
          fontFamily: tokens.fonts.mono,
        }}
      >
        Error ID: {errorId}
      </Typography>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button variant="contained" onClick={handleRetry}>
          Try Again
        </Button>
        <Button variant="outlined" onClick={() => navigate('/home')}>
          Go Home
        </Button>
      </Box>
    </Box>
  );
}
