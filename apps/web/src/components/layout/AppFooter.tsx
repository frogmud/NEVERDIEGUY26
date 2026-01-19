import { Box, Typography, Link as MuiLink } from '@mui/material';
import { Link } from 'react-router-dom';
import { tokens } from '../../theme';

const footerLinks = [
  { label: 'Graveyard', path: '/graveyard' },
  { label: 'Terms', path: '/terms' },
  { label: 'Privacy', path: '/privacy' },
  { label: 'Help', path: '/help' },
  { label: 'Bones', path: '/design-system' },
];

export function AppFooter() {
  return (
    <Box
      component="footer"
      sx={{
        borderTop: `1px solid ${tokens.colors.border}`,
        py: 2,
        px: 3,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: tokens.colors.background.paper,
        flexShrink: 0,
      }}
    >
      {/* Brand - gaming font needs 1.5x size to match other text visually */}
      <Typography
        variant="caption"
        sx={{
          color: tokens.colors.text.secondary,
          fontFamily: tokens.fonts.gaming,
          fontSize: '1.125rem',
          letterSpacing: '0.05em',
        }}
      >
        NEVER DIE GUY© 2026
      </Typography>

      {/* Links */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {footerLinks.map((link) => (
          <MuiLink
            key={link.path}
            component={Link}
            to={link.path}
            sx={{
              color: tokens.colors.text.disabled,
              textDecoration: 'none',
              fontSize: '0.75rem',
              transition: 'color 0.2s',
              '&:hover': {
                color: tokens.colors.text.primary,
              },
            }}
          >
            {link.label}
          </MuiLink>
        ))}
      </Box>

      {/* Version */}
      <Typography
        variant="caption"
        sx={{
          color: tokens.colors.text.disabled,
          fontSize: '0.7rem',
        }}
      >
        v1.0.0
      </Typography>
    </Box>
  );
}
