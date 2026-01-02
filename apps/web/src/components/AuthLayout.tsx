import { useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, Link } from '@mui/material';
import { tokens } from '../theme';

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footerText: string;
  footerLinkText: string;
  footerLinkTo: string;
}

export function AuthLayout({
  title,
  subtitle,
  children,
  footerText,
  footerLinkText,
  footerLinkTo,
}: AuthLayoutProps) {
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
      <Paper
        sx={{
          p: 4,
          width: '100%',
          maxWidth: 380,
          backgroundColor: tokens.colors.background.paper,
          border: `1px solid ${tokens.colors.border}`,
        }}
      >
        <Typography variant="h4" sx={{ mb: 1, fontWeight: 600 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" sx={{ mb: 4, color: tokens.colors.text.secondary }}>
            {subtitle}
          </Typography>
        )}

        {children}

        <Box sx={{ mt: 4, pt: 4, borderTop: `1px solid ${tokens.colors.border}`, textAlign: 'center' }}>
          <Typography variant="body2" component="span" sx={{ color: tokens.colors.text.secondary }}>
            {footerText}{' '}
          </Typography>
          <Link
            component="button"
            onClick={() => navigate(footerLinkTo)}
            sx={{ color: tokens.colors.primary, fontSize: '0.875rem', verticalAlign: 'baseline' }}
          >
            {footerLinkText}
          </Link>
        </Box>
      </Paper>
    </Box>
  );
}
