import { useNavigate } from 'react-router-dom';
import { Typography, Button } from '@mui/material';
import { tokens } from '../../theme';
import { FormField } from '../../components/Placeholder';
import { AuthLayout } from '../../components/AuthLayout';

export function Signup() {
  const navigate = useNavigate();

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Join the adventure"
      footerText="Already have an account?"
      footerLinkText="Sign in"
      footerLinkTo="/login"
    >
      <FormField />
      <FormField />
      <FormField />

      <Button
        fullWidth
        variant="contained"
        size="large"
        onClick={() => navigate('/home')}
        sx={{ mb: 2 }}
      >
        Create Account
      </Button>

      <Typography variant="caption" sx={{ color: tokens.colors.text.disabled, display: 'block', textAlign: 'center' }}>
        By creating an account, you agree to our Terms of Service and Privacy Policy.
      </Typography>
    </AuthLayout>
  );
}
