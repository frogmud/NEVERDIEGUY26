import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Container } from '@mui/material';
import { SupportAgentSharp as SupportIcon } from '@mui/icons-material';
import { tokens } from '../theme';

export function NotFoundStandalone() {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: '100vh', width: '100%', backgroundColor: tokens.colors.background.default }}>
      {/* Header */}
      <Box
        sx={{
          py: 2,
          px: 4,
          borderBottom: `1px solid ${tokens.colors.border}`,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: tokens.colors.primary,
            cursor: 'pointer',
          }}
          onClick={() => navigate('/')}
        >
          NEVER DIE GUY
        </Typography>
      </Box>

      {/* Main content */}
      <Container
        maxWidth="sm"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 'calc(100vh - 160px)',
          textAlign: 'center',
          py: 4,
        }}
      >
        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: '6rem', md: '10rem' },
            fontWeight: 700,
            color: tokens.colors.primary,
            lineHeight: 1,
            mb: 2,
          }}
        >
          404
        </Typography>
        <Typography variant="h4" sx={{ mb: 2, fontWeight: 600 }}>
          Page Not Found
        </Typography>
        <Typography
          variant="body1"
          sx={{ color: tokens.colors.text.secondary, mb: 4, maxWidth: 400 }}
        >
          The page you're looking for doesn't exist or has been moved. Check the URL or navigate back to safety.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Button variant="contained" size="large" onClick={() => navigate('/')}>
            Go Home
          </Button>
          <Button
            variant="outlined"
            size="large"
            startIcon={<SupportIcon />}
            onClick={() => navigate('/help')}
          >
            Contact Support
          </Button>
        </Box>
      </Container>

      {/* Footer */}
      <Box
        sx={{
          py: 3,
          px: 2,
          borderTop: `1px solid ${tokens.colors.border}`,
          textAlign: 'center',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, mb: 2 }}>
          <Typography
            variant="body2"
            sx={{ cursor: 'pointer', '&:hover': { color: tokens.colors.primary } }}
            onClick={() => navigate('/terms')}
          >
            Terms
          </Typography>
          <Typography
            variant="body2"
            sx={{ cursor: 'pointer', '&:hover': { color: tokens.colors.primary } }}
            onClick={() => navigate('/privacy')}
          >
            Privacy
          </Typography>
          <Typography
            variant="body2"
            sx={{ cursor: 'pointer', '&:hover': { color: tokens.colors.primary } }}
            onClick={() => navigate('/help')}
          >
            Help
          </Typography>
        </Box>
        <Typography variant="caption" sx={{ color: tokens.colors.text.disabled }}>
          NDG26 Prototype v1
        </Typography>
      </Box>
    </Box>
  );
}
