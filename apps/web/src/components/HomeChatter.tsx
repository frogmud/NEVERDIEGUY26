/**
 * HomeChatter - Character greeting component for homepage
 *
 * Conversation flow:
 * 1. NPC greeting appears (portrait slides in)
 * 2. Player picks a response (Play/Wiki/About)
 * 3. Player's choice appears as right-aligned bubble
 * 4. NPC gives farewell (shepherding)
 * 5. Brief pause, then navigate
 *
 * Using nav directly = instant travel (no shepherding)
 *
 * NEVER DIE GUY
 */

import { useState, useEffect, useMemo } from 'react';
import { Box, Typography, Button, Link, keyframes } from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { tokens } from '../theme';
import {
  getRandomGreeter,
  getRandomGreeting,
  getRandomFarewell,
  type HomeGreeter,
} from '../data/home-greeters';

// ============================================
// Animations
// ============================================

const slideInPortrait = keyframes`
  0% {
    opacity: 0;
    transform: translateX(-80px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
`;

// ============================================
// Types
// ============================================

type ConversationPhase = 'greeting' | 'player-response' | 'farewell' | 'navigating';
type RouteChoice = 'play' | 'wiki' | 'about';

const ROUTE_LABELS: Record<RouteChoice, string> = {
  play: 'Play',
  wiki: 'Explore Wiki',
  about: 'Learn More',
};

const ROUTE_PATHS: Record<RouteChoice, string> = {
  play: '/play',
  wiki: '/wiki',
  about: '/about',
};

// ============================================
// Component
// ============================================

export function HomeChatter() {
  const navigate = useNavigate();

  // Pick random greeter and greeting on mount (stays fixed)
  const greeter = useMemo<HomeGreeter>(() => getRandomGreeter(), []);
  const greeting = useMemo<string>(() => getRandomGreeting(greeter), [greeter]);

  // Conversation state
  const [phase, setPhase] = useState<ConversationPhase>('greeting');
  const [chosenRoute, setChosenRoute] = useState<RouteChoice | null>(null);
  const [farewell, setFarewell] = useState<string>('');

  // Animation state
  const [showDialogue, setShowDialogue] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  const [showPlayerResponse, setShowPlayerResponse] = useState(false);
  const [showFarewell, setShowFarewell] = useState(false);

  // Initial animation sequence
  useEffect(() => {
    const dialogueTimer = setTimeout(() => setShowDialogue(true), 300);
    const buttonsTimer = setTimeout(() => setShowButtons(true), 700);

    return () => {
      clearTimeout(dialogueTimer);
      clearTimeout(buttonsTimer);
    };
  }, []);

  // Handle player choice
  const handleChoice = (route: RouteChoice) => {
    setChosenRoute(route);
    setPhase('player-response');
    setShowButtons(false);

    // Show player response bubble
    setTimeout(() => {
      setShowPlayerResponse(true);
    }, 100);

    // Get and show farewell
    setTimeout(() => {
      const farewellText = getRandomFarewell(greeter, route);
      setFarewell(farewellText);
      setPhase('farewell');
      setShowFarewell(true);
    }, 800);

    // Navigate after farewell
    setTimeout(() => {
      setPhase('navigating');
      navigate(ROUTE_PATHS[route], route === 'play' ? { state: { practiceMode: true } } : undefined);
    }, 2400);
  };

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 1000,
        minHeight: 400,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Main content area */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'flex-start',
          gap: 3,
          px: { xs: 3, sm: 4 },
          py: 4,
          bgcolor: tokens.colors.background.default,
          position: 'relative',
          minHeight: 320,
        }}
      >
        {/* Portrait */}
        <Box
          sx={{
            width: { xs: 160, sm: 200, md: 260 },
            height: { xs: 160, sm: 200, md: 260 },
            flexShrink: 0,
            animation: `${slideInPortrait} 600ms ease-out forwards`,
          }}
        >
          <Box
            component="img"
            src={greeter.portrait}
            alt={greeter.name}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              imageRendering: 'pixelated',
            }}
          />
        </Box>

        {/* Conversation area */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            minHeight: 280,
          }}
        >
          {/* Character name + wiki link */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              opacity: showDialogue ? 1 : 0,
              transition: 'opacity 400ms ease-out',
            }}
          >
            <Typography
              sx={{
                fontFamily: tokens.fonts.gaming,
                fontSize: { xs: '1rem', sm: '1.25rem' },
                color: tokens.colors.text.primary,
                letterSpacing: '0.05em',
              }}
            >
              {greeter.name}
            </Typography>
            <Link
              component={RouterLink}
              to={`/wiki/${greeter.wikiSlug}`}
              sx={{
                fontFamily: tokens.fonts.gaming,
                fontSize: { xs: '0.7rem', sm: '0.8rem' },
                color: tokens.colors.text.secondary,
                textDecoration: 'none',
                '&:hover': {
                  color: tokens.colors.primary,
                },
              }}
            >
              [wiki]
            </Link>
          </Box>

          {/* NPC Greeting */}
          <Box
            sx={{
              bgcolor: '#1a1a1a',
              border: '3px solid #333',
              borderRadius: '6px',
              px: 3,
              py: 2,
              position: 'relative',
              maxWidth: '90%',
              opacity: showDialogue ? 1 : 0,
              transform: showDialogue ? 'translateY(0)' : 'translateY(10px)',
              transition: 'opacity 400ms ease-out, transform 400ms ease-out',
              // Speech bubble pointer
              '&::before': {
                content: '""',
                position: 'absolute',
                left: -12,
                top: 20,
                width: 0,
                height: 0,
                borderTop: '10px solid transparent',
                borderBottom: '10px solid transparent',
                borderRight: '12px solid #333',
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                left: -7,
                top: 23,
                width: 0,
                height: 0,
                borderTop: '7px solid transparent',
                borderBottom: '7px solid transparent',
                borderRight: '9px solid #1a1a1a',
              },
            }}
          >
            <Typography
              sx={{
                fontFamily: tokens.fonts.gaming,
                fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' },
                color: tokens.colors.text.primary,
                lineHeight: 1.6,
              }}
            >
              {greeting}
            </Typography>
          </Box>

          {/* Response buttons (only in greeting phase) */}
          {phase === 'greeting' && (
            <Box
              sx={{
                display: 'flex',
                gap: 1.5,
                flexWrap: 'wrap',
                mt: 1,
                opacity: showButtons ? 1 : 0,
                transition: 'opacity 300ms ease-out',
              }}
            >
              <Button
                variant="contained"
                onClick={() => handleChoice('play')}
                sx={{
                  fontFamily: tokens.fonts.gaming,
                  fontSize: { xs: '0.9rem', sm: '1rem' },
                  px: 3,
                  py: 1,
                  bgcolor: tokens.colors.primary,
                  '&:hover': {
                    bgcolor: '#c7033a',
                  },
                }}
              >
                Play
              </Button>
              <Button
                variant="outlined"
                onClick={() => handleChoice('wiki')}
                sx={{
                  fontFamily: tokens.fonts.gaming,
                  fontSize: { xs: '0.9rem', sm: '1rem' },
                  px: 3,
                  py: 1,
                  borderColor: tokens.colors.border,
                  color: tokens.colors.text.primary,
                  '&:hover': {
                    borderColor: tokens.colors.text.secondary,
                    bgcolor: 'rgba(255,255,255,0.05)',
                  },
                }}
              >
                Explore Wiki
              </Button>
              <Button
                variant="outlined"
                onClick={() => handleChoice('about')}
                sx={{
                  fontFamily: tokens.fonts.gaming,
                  fontSize: { xs: '0.9rem', sm: '1rem' },
                  px: 3,
                  py: 1,
                  borderColor: tokens.colors.border,
                  color: tokens.colors.text.secondary,
                  '&:hover': {
                    borderColor: tokens.colors.text.secondary,
                    bgcolor: 'rgba(255,255,255,0.05)',
                  },
                }}
              >
                Learn More
              </Button>
            </Box>
          )}

          {/* Player response bubble (right-aligned) */}
          {chosenRoute && showPlayerResponse && (
            <Box
              sx={{
                alignSelf: 'flex-end',
                bgcolor: tokens.colors.primary,
                border: `3px solid ${tokens.colors.primary}`,
                borderRadius: '6px',
                px: 3,
                py: 1.5,
                maxWidth: '80%',
                opacity: showPlayerResponse ? 1 : 0,
                transform: showPlayerResponse ? 'translateY(0)' : 'translateY(10px)',
                transition: 'opacity 300ms ease-out, transform 300ms ease-out',
              }}
            >
              <Typography
                sx={{
                  fontFamily: tokens.fonts.gaming,
                  fontSize: { xs: '0.9rem', sm: '1rem' },
                  color: '#fff',
                  lineHeight: 1.5,
                }}
              >
                {ROUTE_LABELS[chosenRoute]}
              </Typography>
            </Box>
          )}

          {/* NPC Farewell */}
          {farewell && (
            <Box
              sx={{
                bgcolor: '#1a1a1a',
                border: '3px solid #333',
                borderRadius: '6px',
                px: 3,
                py: 2,
                position: 'relative',
                maxWidth: '90%',
                opacity: showFarewell ? 1 : 0,
                transform: showFarewell ? 'translateY(0)' : 'translateY(10px)',
                transition: 'opacity 400ms ease-out, transform 400ms ease-out',
                // Speech bubble pointer
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  left: -12,
                  top: 20,
                  width: 0,
                  height: 0,
                  borderTop: '10px solid transparent',
                  borderBottom: '10px solid transparent',
                  borderRight: '12px solid #333',
                },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  left: -7,
                  top: 23,
                  width: 0,
                  height: 0,
                  borderTop: '7px solid transparent',
                  borderBottom: '7px solid transparent',
                  borderRight: '9px solid #1a1a1a',
                },
              }}
            >
              <Typography
                sx={{
                  fontFamily: tokens.fonts.gaming,
                  fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' },
                  color: tokens.colors.text.primary,
                  lineHeight: 1.6,
                }}
              >
                {farewell}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}
