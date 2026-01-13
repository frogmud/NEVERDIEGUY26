/**
 * HomeChatter - Character greeting component for homepage
 *
 * Flow:
 * 1. NPC sprite appears with initial greeting
 * 2. Typing indicator "..." appears
 * 3. Buttons are available immediately (user can interrupt)
 * 4. NPC keeps adding ambient messages if user waits
 * 5. Click navigates immediately
 *
 * NEVER DIE GUY
 */

import { useState, useEffect, useMemo, useRef } from 'react';
import { Box, Typography, Button, Link, keyframes } from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { tokens } from '../theme';
import {
  getRandomGreeter,
  getRandomGreeting,
  type HomeGreeter,
} from '../data/home-greeters';

// ============================================
// Animations
// ============================================

const slideInSprite = keyframes`
  0% {
    opacity: 0;
    transform: translateX(-40px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
`;

const fadeIn = keyframes`
  0% { opacity: 0; transform: translateY(8px); }
  100% { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 0.4; }
  50% { opacity: 1; }
`;

// ============================================
// Types
// ============================================

type RouteChoice = 'play' | 'wiki' | 'about';

const ROUTE_PATHS: Record<RouteChoice, string> = {
  play: '/play',
  wiki: '/wiki',
  about: '/about',
};

// Fallback ambient messages (used if character has no ambient array)
const FALLBACK_AMBIENT = [
  '...',
  'Take your time.',
  'The universe can wait.',
  'Ready when you are.',
  'No pressure.',
];

// ============================================
// Component
// ============================================

export function HomeChatter() {
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Pick random greeter and greeting on mount
  const greeter = useMemo<HomeGreeter>(() => getRandomGreeter(), []);
  const initialGreeting = useMemo<string>(() => getRandomGreeting(greeter), [greeter]);

  // Messages state - starts with initial greeting
  const [messages, setMessages] = useState<string[]>([initialGreeting]);
  const [isTyping, setIsTyping] = useState(false);
  const [ambientIndex, setAmbientIndex] = useState(0);

  // Animation states
  const [showSprite, setShowSprite] = useState(false);
  const [showButtons, setShowButtons] = useState(false);

  // Sprite frame toggle (swaps when talking)
  const [spriteFrame, setSpriteFrame] = useState(1);

  // Initial animation sequence
  useEffect(() => {
    const spriteTimer = setTimeout(() => setShowSprite(true), 100);
    const buttonsTimer = setTimeout(() => setShowButtons(true), 600);

    // Initial greeting twitch
    if (greeter.sprite2) {
      const twitchTimer = setTimeout(() => {
        setSpriteFrame(2);
        setTimeout(() => setSpriteFrame(1), 150);
      }, 400);
      return () => {
        clearTimeout(spriteTimer);
        clearTimeout(buttonsTimer);
        clearTimeout(twitchTimer);
      };
    }

    return () => {
      clearTimeout(spriteTimer);
      clearTimeout(buttonsTimer);
    };
  }, [greeter.sprite2]);

  // Get ambient messages for this greeter (character-specific or fallback)
  const ambientMessages = greeter.ambient?.length ? greeter.ambient : FALLBACK_AMBIENT;

  // Ambient message cycle
  useEffect(() => {
    if (ambientIndex >= ambientMessages.length) return;

    // Show typing indicator after delay
    const typingTimer = setTimeout(() => {
      setIsTyping(true);
    }, 2500 + ambientIndex * 1500);

    // Add message after typing
    const messageTimer = setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, ambientMessages[ambientIndex]]);
      setAmbientIndex(prev => prev + 1);
      // Twitch sprite when speaking
      if (greeter.sprite2) {
        setSpriteFrame(2);
        setTimeout(() => setSpriteFrame(1), 150);
      }
    }, 4000 + ambientIndex * 1500);

    return () => {
      clearTimeout(typingTimer);
      clearTimeout(messageTimer);
    };
  }, [ambientIndex, ambientMessages]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Handle navigation
  const handleChoice = (route: RouteChoice) => {
    navigate(ROUTE_PATHS[route]);
  };

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 900,
        minHeight: 360,
        display: 'flex',
        gap: { xs: 2, sm: 3 },
        px: { xs: 2, sm: 3 },
        py: 3,
      }}
    >
      {/* Sprite - fixed on left, smaller */}
      <Box
        sx={{
          width: { xs: 64, sm: 80, md: 100 },
          flexShrink: 0,
          opacity: showSprite ? 1 : 0,
          animation: showSprite ? `${slideInSprite} 500ms ease-out` : 'none',
        }}
      >
        <Box
          component="img"
          src={spriteFrame === 2 && greeter.sprite2 ? greeter.sprite2 : (greeter.sprite || greeter.portrait)}
          alt={greeter.name}
          sx={{
            width: '100%',
            height: 'auto',
            maxHeight: { xs: 100, sm: 120, md: 140 },
            objectFit: 'contain',
            imageRendering: 'pixelated',
          }}
        />
        {/* Name + wiki link below sprite */}
        <Box sx={{ mt: 1, textAlign: 'center' }}>
          <Typography
            sx={{
              fontFamily: tokens.fonts.gaming,
              fontSize: { xs: '0.65rem', sm: '0.7rem' },
              color: tokens.colors.text.primary,
            }}
          >
            {greeter.name}
          </Typography>
          <Link
            component={RouterLink}
            to={`/wiki/${greeter.wikiSlug}`}
            sx={{
              fontFamily: tokens.fonts.gaming,
              fontSize: '0.6rem',
              color: tokens.colors.text.disabled,
              textDecoration: 'none',
              '&:hover': { color: tokens.colors.secondary },
            }}
          >
            [wiki]
          </Link>
        </Box>
      </Box>

      {/* Right side - messages + buttons */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
        }}
      >
        {/* Messages container */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
            mb: 2,
            maxHeight: 220,
            overflowY: 'auto',
            pr: 1,
            // Hide scrollbar
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': { display: 'none' },
          }}
        >
          {messages.map((msg, i) => (
            <Box
              key={i}
              sx={{
                bgcolor: '#1a1a1a',
                border: '2px solid #333',
                borderRadius: '8px',
                px: 2.5,
                py: 1.5,
                maxWidth: '95%',
                animation: i === 0 ? 'none' : `${fadeIn} 300ms ease-out`,
              }}
            >
              <Typography
                sx={{
                  fontFamily: tokens.fonts.gaming,
                  fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
                  color: tokens.colors.text.primary,
                  lineHeight: 1.5,
                }}
              >
                {msg}
              </Typography>
            </Box>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <Box
              sx={{
                bgcolor: '#1a1a1a',
                border: '2px solid #333',
                borderRadius: '8px',
                px: 2.5,
                py: 1.5,
                width: 'fit-content',
              }}
            >
              <Typography
                sx={{
                  fontFamily: tokens.fonts.gaming,
                  fontSize: '1.2rem',
                  color: tokens.colors.text.secondary,
                  animation: `${pulse} 1s ease-in-out infinite`,
                  letterSpacing: '0.2em',
                }}
              >
                ...
              </Typography>
            </Box>
          )}

          <div ref={messagesEndRef} />
        </Box>

        {/* Action buttons - always visible once loaded */}
        <Box
          sx={{
            display: 'flex',
            gap: 1.5,
            flexWrap: 'wrap',
            opacity: showButtons ? 1 : 0,
            transition: 'opacity 300ms ease-out',
          }}
        >
          <Button
            variant="contained"
            onClick={() => handleChoice('play')}
            sx={{
              fontFamily: tokens.fonts.gaming,
              fontSize: { xs: '0.85rem', sm: '0.95rem' },
              px: 3,
              py: 1,
              bgcolor: tokens.colors.primary,
              '&:hover': { bgcolor: '#c7033a' },
            }}
          >
            Play
          </Button>
          <Button
            variant="outlined"
            onClick={() => handleChoice('wiki')}
            sx={{
              fontFamily: tokens.fonts.gaming,
              fontSize: { xs: '0.85rem', sm: '0.95rem' },
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
              fontSize: { xs: '0.85rem', sm: '0.95rem' },
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
      </Box>
    </Box>
  );
}
