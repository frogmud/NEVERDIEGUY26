import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';
import { CheckCircleSharp as CheckIcon } from '@mui/icons-material';
import { CardSection } from '../../components/CardSection';
import { tokens } from '../../theme';

export function ResetSuccess() {
  const navigate = useNavigate();

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
      <CardSection
        padding={4}
        sx={{
          width: '100%',
          maxWidth: 380,
          textAlign: 'center',
        }}
      >
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            bgcolor: tokens.colors.background.elevated,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 3,
          }}
        >
          <CheckIcon sx={{ fontSize: 48, color: tokens.colors.primary }} />
        </Box>

        <Typography variant="h4" sx={{ mb: 1, fontWeight: 600 }}>
          Password reset!
        </Typography>
        <Typography variant="body2" sx={{ mb: 4, color: tokens.colors.text.secondary }}>
          Your password has been successfully updated. You can now sign in with your new password.
        </Typography>

        <Button
          fullWidth
          variant="contained"
          size="large"
          onClick={() => navigate('/login')}
        >
          Sign In
        </Button>
      </CardSection>
    </Box>
  );
}
