import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';
import { tokens } from '../theme';

export function NotFound() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        textAlign: 'center',
      }}
    >
      <Typography
        variant="h1"
        sx={{
          fontSize: '8rem',
          fontWeight: 700,
          color: tokens.colors.primary,
          lineHeight: 1,
          mb: 2,
        }}
      >
        404
      </Typography>
      <Typography variant="h5" sx={{ mb: 1 }}>
        Page Not Found
      </Typography>
      <Typography
        variant="body1"
        sx={{ color: tokens.colors.text.secondary, mb: 4, maxWidth: 400 }}
      >
        The page you're looking for doesn't exist or has been moved.
      </Typography>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button variant="contained" onClick={() => navigate('/home')}>
          Go Home
        </Button>
        <Button variant="outlined" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </Box>
    </Box>
  );
}
