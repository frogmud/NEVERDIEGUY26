import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Paper } from '@mui/material';
import { LogoutSharp as LogoutIcon } from '@mui/icons-material';
import { tokens } from '../../theme';
import { useAuth } from '../../contexts/AuthContext';

export function Logout() {
  const navigate = useNavigate();
  const { signOut, user } = useAuth();

  const handleCancel = () => {
    navigate(-1); // Go back to previous page
  };

  const handleLogout = () => {
    signOut();
    navigate('/');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: tokens.colors.background.default,
        p: 2,
      }}
    >
      <Paper
        sx={{
          maxWidth: 400,
          width: '100%',
          p: 4,
          textAlign: 'center',
          backgroundColor: tokens.colors.background.paper,
          border: `1px solid ${tokens.colors.border}`,
        }}
      >
        <Box
          sx={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            bgcolor: tokens.colors.background.elevated,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 3,
          }}
        >
          <LogoutIcon sx={{ fontSize: 36, color: tokens.colors.text.secondary }} />
        </Box>

        <Typography variant="h5" sx={{ mb: 1 }}>
          Sign out?
        </Typography>

        <Typography
          variant="body1"
          sx={{ color: tokens.colors.text.secondary, mb: 4 }}
        >
          You'll need to sign in again to access your account.
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            variant="outlined"
            size="large"
            onClick={handleCancel}
            sx={{ flex: 1 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            size="large"
            onClick={handleLogout}
            sx={{ flex: 1 }}
          >
            Sign Out
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
