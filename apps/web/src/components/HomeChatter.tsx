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
import { Box, Typography, Button, keyframes } from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { tokens } from '../theme';
import {
  getRandomGreeter,
  getRandomGreeting,
  GREETER_DOMAINS,
  GREETER_INTERRUPT_CHANCE,
  DOMAIN_INTERRUPTS,
  DOMAIN_DISPLAY_NAMES,
  getRandomInterrupt,
  getRandomReaction,
  type HomeGreeter,
  type EnemyInterrupt,
} from '../data/home-greeters';

// Generate a random 9-digit player number (zero-padded)
function generatePlayerNumber(): string {
  const num = Math.floor(1 + Math.random() * 999999999);
  return String(num).padStart(9, '0');
}

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

// All domain keys for random selection (roaming characters)
const DOMAIN_KEYS = Object.keys(DOMAIN_INTERRUPTS);

export function HomeChatter() {
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Pick random greeter and greeting on mount
  const greeter = useMemo<HomeGreeter>(() => getRandomGreeter(), []);
  const initialGreeting = useMemo<string>(() => getRandomGreeting(greeter), [greeter]);

  // Generate player number once
  const playerNumber = useMemo(() => generatePlayerNumber(), []);

  // Derive domain for this greeter (handle "roaming" special case)
  const greeterDomain = useMemo(() => {
    const domain = GREETER_DOMAINS[greeter.id] || 'earth';
    if (domain === 'roaming') {
      // Pick random domain for roaming characters like Willy
      return DOMAIN_KEYS[Math.floor(Math.random() * DOMAIN_KEYS.length)];
    }
    return domain;
  }, [greeter.id]);

  // Get display name for domain
  const domainDisplayName = DOMAIN_DISPLAY_NAMES[greeterDomain] || greeterDomain;

  // Messages state - starts with initial greeting
  const [messages, setMessages] = useState<string[]>([initialGreeting]);
  const [isTyping, setIsTyping] = useState(false);
  const [ambientIndex, setAmbientIndex] = useState(0);

  // Animation states
  const [showSprite, setShowSprite] = useState(false);
  const [showButtons, setShowButtons] = useState(false);

  // Sprite frame toggle (swaps when talking)
  const [spriteFrame, setSpriteFrame] = useState(1);

  // Enemy interrupt state - checkpoints based on dice sides (d4, d6, d8, d10, d12)
  // Interrupts can happen at ambient indices 1, 3, 5, 7, 9 (every other starting at 1)
  const INTERRUPT_CHECKPOINTS = [1, 3, 5, 7, 9];
  const [usedCheckpoints, setUsedCheckpoints] = useState<Set<number>>(new Set());
  const [pendingInterrupt, setPendingInterrupt] = useState<EnemyInterrupt | null>(null);

  // Safety timeout - clear pendingInterrupt if stuck for > 10 seconds
  // This prevents the interrupt flow from getting permanently blocked
  useEffect(() => {
    if (pendingInterrupt) {
      const safetyTimer = setTimeout(() => {
        setPendingInterrupt(null);
      }, 10000);
      return () => clearTimeout(safetyTimer);
    }
  }, [pendingInterrupt]);

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
  // Filter to remove duplicates, shuffle for variety
  const ambientMessages = useMemo(() => {
    const source = greeter.ambient?.length ? greeter.ambient : FALLBACK_AMBIENT;
    // Remove messages that overlap with greeting
    const filtered = source.filter((msg, i) => {
      // Skip if exact match with greeting
      if (msg === initialGreeting) return false;
      // Skip if ambient is contained in greeting (e.g., greeting ends with this phrase)
      if (initialGreeting.includes(msg)) return false;
      // Skip if greeting is contained in ambient
      if (msg.includes(initialGreeting)) return false;
      // Skip if same as previous message in the array
      if (i > 0 && msg === source[i - 1]) return false;
      return true;
    });
    // Shuffle for variety (Fisher-Yates)
    const shuffled = [...filtered];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, [greeter.ambient, initialGreeting]);

  // Get interrupt chance for this greeter
  const interruptChance = GREETER_INTERRUPT_CHANCE[greeter.id] || 0.2;

  // Ambient message cycle with interrupt support at dice-based checkpoints
  useEffect(() => {
    if (ambientIndex >= ambientMessages.length) return;

    // Check for interrupt at checkpoint indices (1, 3, 5, 7, 9)
    const isCheckpoint = INTERRUPT_CHECKPOINTS.includes(ambientIndex);
    const checkpointUsed = usedCheckpoints.has(ambientIndex);
    const shouldTryInterrupt = isCheckpoint && !checkpointUsed;
    const interruptRoll = shouldTryInterrupt ? Math.random() : 1;
    const willInterrupt = interruptRoll < interruptChance;

    if (willInterrupt && !pendingInterrupt) {
      // Get a random enemy interrupt for this domain
      const interrupt = getRandomInterrupt(greeterDomain);
      if (interrupt) {
        setPendingInterrupt(interrupt);
        setUsedCheckpoints(prev => new Set([...prev, ambientIndex]));

        // Show typing, then enemy action
        const typingTimer = setTimeout(() => {
          setIsTyping(true);
        }, 2500 + ambientIndex * 1500);

        // Show enemy action
        const enemyTimer = setTimeout(() => {
          setIsTyping(false);
          setMessages(prev => [...prev, interrupt.action]);
          // Twitch sprite (reacting to enemy)
          if (greeter.sprite2) {
            setSpriteFrame(2);
            setTimeout(() => setSpriteFrame(1), 150);
          }
        }, 4000 + ambientIndex * 1500);

        // Show character reaction after enemy
        const reactionTimer = setTimeout(() => {
          setIsTyping(true);
        }, 5000 + ambientIndex * 1500);

        const reactionMsgTimer = setTimeout(() => {
          setIsTyping(false);
          const reaction = getRandomReaction(interrupt);
          setMessages(prev => [...prev, reaction]);
          setPendingInterrupt(null);
          setAmbientIndex(prev => prev + 1);
          // Twitch sprite when speaking
          if (greeter.sprite2) {
            setSpriteFrame(2);
            setTimeout(() => setSpriteFrame(1), 150);
          }
        }, 6500 + ambientIndex * 1500);

        return () => {
          clearTimeout(typingTimer);
          clearTimeout(enemyTimer);
          clearTimeout(reactionTimer);
          clearTimeout(reactionMsgTimer);
        };
      }
    }

    // Normal ambient flow (no interrupt)
    // Show typing indicator after delay
    const typingTimer = setTimeout(() => {
      setIsTyping(true);
    }, 2500 + ambientIndex * 1500);

    // Add message after typing
    const messageTimer = setTimeout(() => {
      setIsTyping(false);
      // Ensure we don't add a duplicate of the last message
      const nextMessage = ambientMessages[ambientIndex];
      setMessages(prev => {
        const lastMsg = prev[prev.length - 1];
        if (lastMsg === nextMessage) {
          // Skip duplicate, try next
          return prev;
        }
        return [...prev, nextMessage];
      });
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
  }, [ambientIndex, ambientMessages, usedCheckpoints, pendingInterrupt, interruptChance, greeterDomain, greeter.sprite2]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Handle navigation
  const handleChoice = (route: RouteChoice) => {
    navigate(ROUTE_PATHS[route]);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 1200, overflow: 'hidden' }}>
      {/* Welcome message with domain */}
      <Typography
        sx={{
          fontFamily: tokens.fonts.gaming,
          fontSize: { xs: '1.3rem', sm: '1.6rem', md: '1.9rem' },
          color: tokens.colors.text.secondary,
          mb: 4,
          letterSpacing: '0.05em',
          textAlign: 'center',
          textWrap: 'balance', // Keep welcome message balanced
        }}
      >
        Welcome to {domainDisplayName}, neverdieguy#{playerNumber}
      </Typography>

      <Box
        sx={{
          width: '100%',
          maxWidth: 1200,
          minHeight: 480,
          display: 'flex',
          gap: { xs: 3, sm: 4 },
          px: { xs: 3, sm: 4 },
          py: 4,
        }}
      >
      {/* Sprite - fixed on left, entire area clickable */}
      <Box
        component={RouterLink}
        to={`/wiki/${greeter.wikiSlug}`}
        sx={{
          width: { xs: 96, sm: 120, md: 150 },
          flexShrink: 0,
          opacity: showSprite ? 1 : 0,
          animation: showSprite ? `${slideInSprite} 500ms ease-out` : 'none',
          textDecoration: 'none',
          cursor: 'pointer',
          '&:hover .wiki-link': {
            color: tokens.colors.secondary,
          },
        }}
      >
        <Box
          component="img"
          src={spriteFrame === 2 && greeter.sprite2 ? greeter.sprite2 : (greeter.sprite || greeter.portrait)}
          alt={greeter.name}
          sx={{
            width: '100%',
            height: 'auto',
            maxHeight: { xs: 150, sm: 180, md: 210 },
            objectFit: 'contain',
            imageRendering: 'pixelated',
          }}
        />
        {/* Name + wiki link below sprite */}
        <Box sx={{ mt: 1.5, textAlign: 'center' }}>
          <Typography
            sx={{
              fontFamily: tokens.fonts.gaming,
              fontSize: { xs: '0.9rem', sm: '1rem' },
              color: tokens.colors.text.primary,
            }}
          >
            {greeter.name}
          </Typography>
          <Typography
            className="wiki-link"
            sx={{
              fontFamily: tokens.fonts.gaming,
              fontSize: '0.8rem',
              color: tokens.colors.text.disabled,
              transition: 'color 150ms ease',
            }}
          >
            [wiki]
          </Typography>
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
            gap: 2,
            mb: 3,
            maxHeight: 300,
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
                borderRadius: '12px',
                px: 3,
                py: 2,
                width: '100%',
                animation: i === 0 ? 'none' : `${fadeIn} 300ms ease-out`,
              }}
            >
              <Typography
                sx={{
                  fontFamily: tokens.fonts.gaming,
                  fontSize: { xs: '1.2rem', sm: '1.4rem', md: '1.5rem' },
                  color: tokens.colors.text.primary,
                  lineHeight: 1.5,
                  wordBreak: 'break-word',
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
                borderRadius: '12px',
                px: 3,
                py: 2,
                width: 'fit-content',
              }}
            >
              <Typography
                sx={{
                  fontFamily: tokens.fonts.gaming,
                  fontSize: '1.6rem',
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
            gap: 2,
            flexWrap: 'wrap',
            alignItems: 'center',
            maxWidth: '95%',
            opacity: showButtons ? 1 : 0,
            transition: 'opacity 300ms ease-out',
          }}
        >
          <Button
            variant="contained"
            onClick={() => handleChoice('play')}
            sx={{
              fontFamily: tokens.fonts.gaming,
              fontSize: { xs: '1.1rem', sm: '1.25rem' },
              px: 4,
              py: 1.5,
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
              fontSize: { xs: '1.1rem', sm: '1.25rem' },
              px: 4,
              py: 1.5,
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
          {/* Tertiary button - right aligned */}
          <Button
            variant="text"
            onClick={() => handleChoice('about')}
            sx={{
              ml: 'auto',
              fontFamily: tokens.fonts.gaming,
              fontSize: { xs: '0.9rem', sm: '1rem' },
              px: 2,
              py: 1,
              color: tokens.colors.text.disabled,
              '&:hover': {
                color: tokens.colors.text.secondary,
                bgcolor: 'transparent',
              },
            }}
          >
            What is NEVER DIE GUY?
          </Button>
        </Box>
      </Box>
      </Box>
    </Box>
  );
}
