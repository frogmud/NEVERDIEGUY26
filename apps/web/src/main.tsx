import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider, CssBaseline, GlobalStyles } from '@mui/material';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { theme } from './theme';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { SoundProvider } from './contexts/SoundContext';
import { GameSettingsProvider } from './contexts/GameSettingsContext';
import { TutorialProvider } from './contexts/TutorialContext';

const globalStyles = (
  <GlobalStyles
    styles={{
      html: {
        height: '100%',
        margin: 0,
        padding: 0,
        overflowY: 'scroll', // Always show scrollbar to prevent layout shift
      },
      'body, #root': {
        height: '100%',
        margin: 0,
        padding: 0,
      },
      body: {
        backgroundColor: '#0a0a0a',
        color: '#ffffff',
      },
      '*': {
        boxSizing: 'border-box',
      },
      // Large text mode - scale up all text by 20%
      '.large-text': {
        fontSize: '120%',
      },
      // Reduced motion - disable animations
      '.reduced-motion, .reduced-motion *': {
        animationDuration: '0.001ms !important',
        animationIterationCount: '1 !important',
        transitionDuration: '0.001ms !important',
      },
      // Compact mode - reduce spacing globally
      '.compact-mode': {
        // Scale down padding on main containers (not all Paper)
        '& > .MuiBox-root': {
          padding: '12px !important',
        },
        // Tighter card spacing
        '& .MuiCardContent-root': {
          padding: '12px',
        },
        // Reduce margins between sections
        '& .MuiPaper-root': {
          marginBottom: '12px',
        },
        // Tighter typography
        '& .MuiTypography-h4': {
          fontSize: '1.5rem',
          marginBottom: '0.5rem',
        },
        '& .MuiTypography-h5': {
          fontSize: '1.25rem',
          marginBottom: '0.4rem',
        },
        '& .MuiTypography-h6': {
          fontSize: '1rem',
          marginBottom: '0.3rem',
        },
        // Smaller buttons
        '& .MuiButton-root': {
          padding: '6px 12px',
        },
      },
    }}
  />
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {globalStyles}
      <BrowserRouter>
        <SettingsProvider>
          <GameSettingsProvider>
            <SoundProvider>
              <AuthProvider>
                <NotificationProvider>
                  <CartProvider>
                    <TutorialProvider>
                      <App />
                    </TutorialProvider>
                  </CartProvider>
                </NotificationProvider>
              </AuthProvider>
            </SoundProvider>
          </GameSettingsProvider>
        </SettingsProvider>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>
);
