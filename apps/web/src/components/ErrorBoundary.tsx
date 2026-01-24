import { Component, ReactNode } from 'react';
import { Box, Button, Typography } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import HomeIcon from '@mui/icons-material/Home';
import { tokens } from '../theme';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Global error boundary - catches React errors and displays fallback UI
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error for debugging (could integrate with analytics later)
    console.error('[ErrorBoundary] Caught error:', error);
    console.error('[ErrorBoundary] Component stack:', errorInfo.componentStack);
  }

  handleRefresh = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            bgcolor: tokens.colors.background.default,
            color: tokens.colors.text.primary,
            p: 4,
            textAlign: 'center',
          }}
        >
          <Box
            component="img"
            src="/logos/ndg-skull-dome.svg"
            alt="NEVER DIE GUY"
            sx={{ width: 80, height: 80, mb: 3, opacity: 0.6 }}
          />
          <Typography
            variant="h4"
            sx={{
              fontFamily: tokens.fonts.gaming,
              mb: 2,
              color: tokens.colors.primary,
            }}
          >
            Something went wrong
          </Typography>
          <Typography
            sx={{
              fontFamily: tokens.fonts.mono,
              fontSize: '0.9rem',
              color: tokens.colors.text.secondary,
              mb: 4,
              maxWidth: 400,
            }}
          >
            The game encountered an unexpected error. Your progress has been saved.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={this.handleRefresh}
              sx={{
                borderColor: tokens.colors.border,
                color: tokens.colors.text.primary,
                fontFamily: tokens.fonts.mono,
                '&:hover': {
                  borderColor: tokens.colors.primary,
                  bgcolor: 'transparent',
                },
              }}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<HomeIcon />}
              onClick={this.handleGoHome}
              sx={{
                bgcolor: tokens.colors.primary,
                color: tokens.colors.background.default,
                fontFamily: tokens.fonts.mono,
                '&:hover': {
                  bgcolor: tokens.colors.primary,
                  opacity: 0.9,
                },
              }}
            >
              Go Home
            </Button>
          </Box>
          {import.meta.env.DEV && this.state.error && (
            <Box
              sx={{
                mt: 4,
                p: 2,
                bgcolor: tokens.colors.background.elevated,
                borderRadius: 1,
                maxWidth: 600,
                overflow: 'auto',
              }}
            >
              <Typography
                sx={{
                  fontFamily: tokens.fonts.mono,
                  fontSize: '0.75rem',
                  color: tokens.colors.text.secondary,
                  whiteSpace: 'pre-wrap',
                  textAlign: 'left',
                }}
              >
                {this.state.error.message}
              </Typography>
            </Box>
          )}
        </Box>
      );
    }

    return this.props.children;
  }
}
