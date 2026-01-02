import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Link } from '@mui/material';
import { CheckCircleSharp as CheckIcon } from '@mui/icons-material';
import { CardSection } from '../../components/CardSection';
import { tokens } from '../../theme';
import { FormField } from '../../components/Placeholder';

export function ResetPassword() {
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
        }}
      >
        <Typography variant="h4" sx={{ mb: 1, fontWeight: 600 }}>
          Create new password
        </Typography>
        <Typography variant="body2" sx={{ mb: 4, color: tokens.colors.text.secondary }}>
          Your new password must be different from previously used passwords.
        </Typography>

        <FormField />
        <FormField />

        {/* Password requirements */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="caption" sx={{ color: tokens.colors.text.secondary, display: 'block', mb: 1 }}>
            Password must contain:
          </Typography>
          {['At least 8 characters', 'One uppercase letter', 'One number or symbol'].map((req, i) => (
            <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <CheckIcon sx={{ fontSize: 16, color: tokens.colors.text.disabled }} />
              <Typography variant="caption" sx={{ color: tokens.colors.text.disabled }}>
                {req}
              </Typography>
            </Box>
          ))}
        </Box>

        <Button
          fullWidth
          variant="contained"
          size="large"
          onClick={() => navigate('/reset-success')}
          sx={{ mb: 2 }}
        >
          Reset Password
        </Button>

        <Box sx={{ textAlign: 'center' }}>
          <Link
            component="button"
            variant="body2"
            onClick={() => navigate('/login')}
            sx={{ color: tokens.colors.text.secondary }}
          >
            Back to sign in
          </Link>
        </Box>
      </CardSection>
    </Box>
  );
}
