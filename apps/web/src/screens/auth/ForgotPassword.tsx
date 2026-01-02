import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Link } from '@mui/material';
import { CardSection } from '../../components/CardSection';
import { tokens } from '../../theme';
import { FormField } from '../../components/Placeholder';

export function ForgotPassword() {
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
          Reset Password
        </Typography>
        <Typography variant="body2" sx={{ mb: 4, color: tokens.colors.text.secondary }}>
          Enter your email address and we'll send you a link to reset your password.
        </Typography>

        <FormField />

        <Button
          fullWidth
          variant="contained"
          size="large"
          onClick={() => navigate('/check-email')}
          sx={{ mb: 2 }}
        >
          Send Reset Link
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
