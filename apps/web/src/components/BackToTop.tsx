import { useState, useEffect } from 'react';
import { Fab } from '@mui/material';
import { KeyboardArrowUp as UpIcon } from '@mui/icons-material';
import { useLocation } from 'react-router-dom';
import { tokens } from '../theme';

const FAB_SIZE = 40; // MUI small fab size
const FAB_MARGIN = 24; // margin from edge
const FOOTER_HEIGHT = 56; // approximate footer height

/**
 * Floating "Back to Top" button that appears after scrolling down.
 * Also auto-scrolls to top on route changes.
 * Adjusts position to avoid overlapping with footer.
 */
export function BackToTop() {
  const [visible, setVisible] = useState(false);
  const [bottomOffset, setBottomOffset] = useState(FAB_MARGIN);
  const location = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname]);

  // Show/hide button and adjust position based on scroll
  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 300);

      // Calculate if FAB would overlap footer
      const scrollBottom = window.scrollY + window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;
      const distanceFromBottom = docHeight - scrollBottom;

      // When near bottom, push FAB up to avoid footer
      if (distanceFromBottom < FOOTER_HEIGHT + FAB_MARGIN) {
        setBottomOffset(FOOTER_HEIGHT + FAB_MARGIN - distanceFromBottom + FAB_MARGIN);
      } else {
        setBottomOffset(FAB_MARGIN);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!visible) return null;

  return (
    <Fab
      size="small"
      onClick={scrollToTop}
      sx={{
        position: 'fixed',
        bottom: bottomOffset,
        right: FAB_MARGIN,
        bgcolor: tokens.colors.background.elevated,
        color: tokens.colors.text.primary,
        border: `1px solid ${tokens.colors.border}`,
        transition: 'bottom 0.15s ease-out',
        '&:hover': {
          bgcolor: tokens.colors.background.paper,
        },
        zIndex: 1200,
      }}
      aria-label="Back to top"
    >
      <UpIcon />
    </Fab>
  );
}
