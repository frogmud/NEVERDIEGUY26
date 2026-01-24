/**
 * MissionBriefing - The General's pre-mission briefing modal
 *
 * Shown once at run start as an overlay on top of the globe.
 * The General is a dismissive military jerk who "confirms the rules"
 * with characteristic condescension.
 *
 * NEVER DIE GUY
 */

import { useState, useEffect, useMemo } from 'react';
import { Box, Typography, Button, keyframes } from '@mui/material';
import { tokens } from '../../theme';
import { useRun } from '../../contexts/RunContext';

const gamingFont = { fontFamily: tokens.fonts.gaming };

// Backdrop fade in
const backdropFadeIn = keyframes`
  0% { opacity: 0; }
  100% { opacity: 1; }
`;

// Content entrance animation - fly up from bottom center
const contentEnter = keyframes`
  0% { opacity: 0; transform: translate(-50%, 100vh); }
  100% { opacity: 1; transform: translate(-50%, -50%); }
`;


// The General's dismissive briefing lines
const BRIEFING_LINES = [
  "Another clone. Wonderful. Try not to die immediately this time.",
  "Your objective: survive. The bar is low, yet you'll likely fail.",
  "Six domains. Eighteen rooms. Infinite disappointment. Dismissed.",
  "Listen carefully, I won't repeat myself. Actually, I won't explain at all. Figure it out.",
  "Command has assigned you to planet cleanup. Again. How inspiring.",
  "You're the Fixer. Fix things. Or don't. We have more clones.",
  "The Die-rectors are watching. They're always watching. They're very bored.",
  "Standard protocol: throw dice, destroy things, try not to embarrass us.",
  "Your predecessors lasted an average of four rooms. I expect similar performance.",
  "Mission parameters: classified. Success criteria: also classified. Good luck.",
];

export default function MissionBriefing() {
  const { dismissBriefing, state } = useRun();
  const [showButton, setShowButton] = useState(false);

  // Pick a random briefing line based on threadId (consistent per run)
  const briefingLine = useMemo(() => {
    const seed = state.threadId || 'default';
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = ((hash << 5) - hash) + seed.charCodeAt(i);
      hash |= 0;
    }
    return BRIEFING_LINES[Math.abs(hash) % BRIEFING_LINES.length];
  }, [state.threadId]);

  // Show button after brief delay (let text sink in)
  useEffect(() => {
    const timer = setTimeout(() => setShowButton(true), 800);
    return () => clearTimeout(timer);
  }, []);


  return (
    <>
      {/* Backdrop overlay */}
      <Box
        onClick={dismissBriefing}
        sx={{
          position: 'fixed',
          inset: 0,
          bgcolor: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(4px)',
          zIndex: 1300,
          animation: `${backdropFadeIn} 300ms ease-out`,
        }}
      />

      {/* Modal content */}
      <Box
        sx={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1301,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          maxWidth: 440,
          width: '90%',
          p: 4,
          borderRadius: '12px',
          bgcolor: 'background.paper',
          animation: `${contentEnter} 500ms cubic-bezier(0.16, 1, 0.3, 1)`,
        }}
      >
        {/* Portrait */}
        <Box
          sx={{
            width: 120,
            height: 120,
            mb: 2,
            borderRadius: '8px',
            overflow: 'hidden',
            bgcolor: 'background.default',
          }}
        >
          <Box
            component="img"
            src="/assets/characters/portraits/120px/shop-portrait-general-02.svg"
            alt="The General"
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </Box>

        {/* Name */}
        <Typography
          variant="h5"
          sx={{
            ...gamingFont,
            color: 'text.primary',
            mb: 0.5,
            textTransform: 'uppercase',
            letterSpacing: 2,
          }}
        >
          The General
        </Typography>

        {/* Title */}
        <Typography
          variant="caption"
          sx={{
            color: 'text.secondary',
            mb: 3,
            fontStyle: 'italic',
          }}
        >
          Command & Supply
        </Typography>

        {/* Briefing text */}
        <Box
          sx={{
            width: '100%',
            textAlign: 'center',
            mb: 3,
            px: 1,
          }}
        >
          <Typography
            variant="body1"
            sx={{
              color: 'text.primary',
              fontSize: '1rem',
              lineHeight: 1.6,
            }}
          >
            "{briefingLine}"
          </Typography>
        </Box>

        {/* Dismiss button */}
        {showButton && (
          <Button
            variant="outlined"
            onClick={dismissBriefing}
            sx={{
              ...gamingFont,
              color: 'text.secondary',
              borderColor: 'divider',
              px: 4,
              py: 1,
              fontSize: '0.9rem',
              textTransform: 'uppercase',
              letterSpacing: 1,
              '&:hover': {
                borderColor: 'text.secondary',
                bgcolor: 'action.hover',
              },
            }}
          >
            Go Away
          </Button>
        )}
      </Box>
    </>
  );
}
