import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Link, TextField, Alert, CircularProgress } from '@mui/material';
import { tokens } from '../../theme';
import { AuthLayout } from '../../components/AuthLayout';
import { useAuth } from '../../contexts/AuthContext';

export function Login() {
  const navigate = useNavigate();
  const { signIn, isLoading, error, clearError } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await signIn(username, password);
    if (success) {
      navigate('/home');
    }
  };

  return (
    <AuthLayout
      title="Sign In"
      subtitle="Enter your credentials to continue"
      footerText="Don't have an account?"
      footerLinkText="Sign up"
      footerLinkTo="/signup"
    >
      <Box component="form" onSubmit={handleSubmit}>
        {error && (
          <Alert severity="error" onClose={clearError} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TextField
          fullWidth
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={isLoading}
          sx={{ mb: 2 }}
          autoFocus
        />

        <TextField
          fullWidth
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
          sx={{ mb: 3 }}
        />

        <Button
          fullWidth
          type="submit"
          variant="contained"
          size="large"
          disabled={isLoading || !username || !password}
          sx={{ mb: 2 }}
        >
          {isLoading ? <CircularProgress size={24} /> : 'Sign In'}
        </Button>
      </Box>

      <Box sx={{ textAlign: 'center' }}>
        <Link
          component="button"
          variant="body2"
          onClick={() => navigate('/forgot-password')}
          sx={{ color: tokens.colors.text.secondary }}
        >
          Forgot password?
        </Link>
      </Box>
    </AuthLayout>
  );
}
