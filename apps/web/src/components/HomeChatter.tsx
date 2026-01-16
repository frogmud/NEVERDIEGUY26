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
import { Box, Typography, Button, keyframes, Menu, MenuItem, TextField, Autocomplete, Skeleton } from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { tokens } from '../theme';
import {
  HOME_GREETERS,
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
import { lookupDialogueAsync } from '../services/chatbase';
import { generateThreadId } from '../data/pools/seededRng';

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
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [hasNewMessages, setHasNewMessages] = useState(false);

  // Pick greeter based on domain preference (if set) or random
  const greeter = useMemo<HomeGreeter>(() => {
    const preferredDomain = sessionStorage.getItem('ndg-preferred-domain');

    if (preferredDomain) {
      // Filter greeters by preferred domain
      const domainGreeters = HOME_GREETERS.filter(g => {
        const gDomain = GREETER_DOMAINS[g.id];
        return gDomain === preferredDomain || gDomain === 'roaming';
      });

      if (domainGreeters.length > 0) {
        return domainGreeters[Math.floor(Math.random() * domainGreeters.length)];
      }
    }

    // Fallback to random
    return HOME_GREETERS[Math.floor(Math.random() * HOME_GREETERS.length)];
  }, []);
  const initialGreeting = useMemo<string>(() => getRandomGreeting(greeter), [greeter]);

  // Generate session seed once (6-char hex like "A4F2B1") or use stored seed
  const sessionSeed = useMemo(() => {
    const stored = sessionStorage.getItem('ndg-session-seed');
    return stored || generateThreadId();
  }, []);

  // Derive domain for this greeter (handle "roaming" special case)
  const greeterDomain = useMemo(() => {
    const preferredDomain = sessionStorage.getItem('ndg-preferred-domain');
    const domain = GREETER_DOMAINS[greeter.id] || 'earth';

    if (domain === 'roaming') {
      // If preferred domain is set, use it; otherwise pick random
      return preferredDomain || DOMAIN_KEYS[Math.floor(Math.random() * DOMAIN_KEYS.length)];
    }
    return domain;
  }, [greeter.id]);

  // Get display name for domain
  const domainDisplayName = DOMAIN_DISPLAY_NAMES[greeterDomain] || greeterDomain;

  // Messages state - starts with initial greeting
  const [messages, setMessages] = useState<string[]>([initialGreeting]);
  const [isTyping, setIsTyping] = useState(false);
  const [ambientIndex, setAmbientIndex] = useState(0);

  // Loading state for skeleton
  const [isLoading, setIsLoading] = useState(true);

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

  // Grunt state - NDG can grunt to provoke reactions
  const [gruntCooldown, setGruntCooldown] = useState(false);
  const [gruntCount, setGruntCount] = useState(0);

  // Domain picker dropdown
  const [domainMenuAnchor, setDomainMenuAnchor] = useState<HTMLElement | null>(null);
  const domainMenuOpen = Boolean(domainMenuAnchor);

  const handleDomainClick = (event: React.MouseEvent<HTMLElement>) => {
    setDomainMenuAnchor(event.currentTarget);
  };

  const handleDomainClose = () => {
    setDomainMenuAnchor(null);
  };

  const handleDomainSelect = (domainKey: string | null) => {
    handleDomainClose();
    if (domainKey === null) {
      // Random - clear preference and reload
      sessionStorage.removeItem('ndg-preferred-domain');
    } else {
      // Set preference and reload
      sessionStorage.setItem('ndg-preferred-domain', domainKey);
    }
    window.location.reload();
  };

  // Seed input state
  const [seedInput, setSeedInput] = useState(sessionSeed);
  const [isEditingSeed, setIsEditingSeed] = useState(false);

  // Get recent seeds from localStorage for autocomplete
  const recentSeeds = useMemo(() => {
    try {
      const stored = localStorage.getItem('ndg-recent-seeds');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }, []);

  // Save current seed to recent seeds
  useEffect(() => {
    try {
      const stored = localStorage.getItem('ndg-recent-seeds');
      const seeds: string[] = stored ? JSON.parse(stored) : [];
      if (!seeds.includes(sessionSeed)) {
        const updated = [sessionSeed, ...seeds].slice(0, 10); // Keep last 10
        localStorage.setItem('ndg-recent-seeds', JSON.stringify(updated));
      }
    } catch {
      // Ignore storage errors
    }
  }, [sessionSeed]);

  const handleSeedSubmit = (newSeed: string) => {
    const cleanSeed = newSeed.toUpperCase().replace(/[^0-9A-F]/g, '').slice(0, 6);
    if (cleanSeed && cleanSeed !== sessionSeed) {
      sessionStorage.setItem('ndg-session-seed', cleanSeed);
      window.location.reload();
    }
    setIsEditingSeed(false);
  };

  // Reaction types for player responses
  type ReactionType = 'grunt' | 'hmph';

  // Handle grunt/hmph - NDG reacts to a specific message, NPC responds
  const handleGrunt = async (targetMessage: string, reactionType: ReactionType = 'grunt') => {
    if (gruntCooldown || isTyping || pendingInterrupt) return;

    setGruntCooldown(true);
    const newGruntCount = gruntCount + 1;
    setGruntCount(newGruntCount);

    // Show NDG's reaction
    const reactionText = reactionType === 'grunt' ? '*grunt*' : '*hmph*';
    setMessages(prev => [...prev, `You: ${reactionText}`]);

    // Twitch sprite (reacting)
    if (greeter.sprite2) {
      setSpriteFrame(2);
      setTimeout(() => setSpriteFrame(1), 150);
    }

    // NPC reacts after a beat
    setTimeout(async () => {
      setIsTyping(true);

      // Higher enemy chance after multiple grunts
      const enemyChance = Math.min(0.5, 0.15 + newGruntCount * 0.1);
      const shouldSummonEnemy = Math.random() < enemyChance;

      if (shouldSummonEnemy) {
        // Enemy interrupt triggered by grunt
        const interrupt = getRandomInterrupt(greeterDomain);
        if (interrupt) {
          setTimeout(() => {
            setIsTyping(false);
            setMessages(prev => [...prev, interrupt.action]);
            // NPC reaction to enemy
            setTimeout(() => {
              setIsTyping(true);
              setTimeout(() => {
                setIsTyping(false);
                const reaction = getRandomReaction(interrupt);
                setMessages(prev => [...prev, reaction]);
                setGruntCooldown(false);
              }, 1500);
            }, 1000);
          }, 1500);
          return;
        }
      }

      // Normal NPC reaction from chatbase - include the grunted message as context
      // 'grunt' = acknowledgment/agreement, 'hmph' = skepticism/dismissal
      try {
        const response = await lookupDialogueAsync({
          npcSlug: greeter.id,
          pool: 'reaction',
          context: `[${reactionType}] ${targetMessage}`, // Pass reaction type + message
        });
        setTimeout(() => {
          setIsTyping(false);
          setMessages(prev => [...prev, response.text]);
          setGruntCooldown(false);
        }, 1000);
      } catch {
        // Fallback reaction
        setTimeout(() => {
          setIsTyping(false);
          const fallbacks = ['Hmm.', 'Interesting...', '...', 'You have my attention.'];
          setMessages(prev => [...prev, fallbacks[Math.floor(Math.random() * fallbacks.length)]]);
          setGruntCooldown(false);
        }, 1000);
      }
    }, 800);
  };

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
    // Brief loading state for skeleton display
    const loadingTimer = setTimeout(() => setIsLoading(false), 150);
    const spriteTimer = setTimeout(() => setShowSprite(true), 200);
    const buttonsTimer = setTimeout(() => setShowButtons(true), 700);

    // Initial greeting twitch
    if (greeter.sprite2) {
      const twitchTimer = setTimeout(() => {
        setSpriteFrame(2);
        setTimeout(() => setSpriteFrame(1), 150);
      }, 500);
      return () => {
        clearTimeout(loadingTimer);
        clearTimeout(spriteTimer);
        clearTimeout(buttonsTimer);
        clearTimeout(twitchTimer);
      };
    }

    return () => {
      clearTimeout(loadingTimer);
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

  // Check if scrolled to bottom
  const checkIfAtBottom = () => {
    const container = messagesContainerRef.current;
    if (container) {
      const threshold = 50; // pixels from bottom to consider "at bottom"
      const atBottom = container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
      setIsAtBottom(atBottom);
      if (atBottom) {
        setHasNewMessages(false);
      }
    }
  };

  // Auto-scroll only if at bottom, otherwise show "new messages"
  useEffect(() => {
    if (isAtBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else if (messages.length > 1) {
      setHasNewMessages(true);
    }
  }, [messages, isTyping, isAtBottom]);

  // Scroll to bottom when clicking "new messages"
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setHasNewMessages(false);
    setIsAtBottom(true);
  };

  // Handle navigation
  const handleChoice = (route: RouteChoice) => {
    navigate(ROUTE_PATHS[route]);
  };

  // Skeleton loading state
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 1200, overflow: 'hidden' }}>
        {/* Welcome skeleton */}
        <Skeleton
          variant="text"
          sx={{
            width: { xs: 280, sm: 400, md: 500 },
            height: { xs: 40, md: 50 },
            mb: 4,
            bgcolor: 'rgba(255,255,255,0.05)',
          }}
        />

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
          {/* Sprite skeleton */}
          <Box sx={{ width: { xs: 96, sm: 120, md: 150 }, flexShrink: 0 }}>
            <Skeleton
              variant="rectangular"
              sx={{
                width: '100%',
                height: { xs: 150, sm: 180, md: 210 },
                borderRadius: 1,
                bgcolor: 'rgba(255,255,255,0.05)',
              }}
            />
            <Skeleton
              variant="text"
              sx={{ mt: 1.5, width: '80%', mx: 'auto', bgcolor: 'rgba(255,255,255,0.05)' }}
            />
          </Box>

          {/* Chat area skeleton */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
              <Skeleton
                variant="rectangular"
                sx={{
                  width: '90%',
                  height: 60,
                  borderRadius: '12px',
                  bgcolor: 'rgba(255,255,255,0.05)',
                }}
              />
              <Skeleton
                variant="rectangular"
                sx={{
                  width: '70%',
                  height: 50,
                  borderRadius: '12px',
                  bgcolor: 'rgba(255,255,255,0.05)',
                }}
              />
            </Box>

            {/* Button skeletons */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Skeleton
                variant="rectangular"
                sx={{
                  width: 100,
                  height: 48,
                  borderRadius: 1,
                  bgcolor: 'rgba(255,255,255,0.05)',
                }}
              />
              <Skeleton
                variant="rectangular"
                sx={{
                  width: 140,
                  height: 48,
                  borderRadius: 1,
                  bgcolor: 'rgba(255,255,255,0.05)',
                }}
              />
            </Box>
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 1200, overflow: 'hidden' }}>
      {/* Welcome message with domain */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 0.5,
          mb: 4,
          flexWrap: 'wrap',
        }}
      >
        <Typography
          sx={{
            fontFamily: tokens.fonts.gaming,
            fontSize: { xs: '1.3rem', sm: '1.6rem', md: '1.9rem' },
            color: tokens.colors.text.secondary,
            letterSpacing: '0.05em',
          }}
        >
          Welcome to{' '}
          <Box
            component="span"
            onClick={handleDomainClick}
            sx={{
              cursor: 'pointer',
              textDecoration: 'underline',
              textUnderlineOffset: '4px',
              transition: 'color 150ms ease',
              '&:hover': {
                color: tokens.colors.text.primary,
              },
            }}
          >
            {domainDisplayName}
          </Box>
        </Typography>

        {/* Seed input - click to edit, autocomplete with recent seeds */}
        {isEditingSeed ? (
          <Autocomplete
            freeSolo
            size="small"
            options={recentSeeds}
            value={seedInput}
            onInputChange={(_, value) => setSeedInput(value)}
            onChange={(_, value) => {
              if (value) handleSeedSubmit(value);
            }}
            onBlur={() => handleSeedSubmit(seedInput)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSeedSubmit(seedInput);
              if (e.key === 'Escape') {
                setSeedInput(sessionSeed);
                setIsEditingSeed(false);
              }
            }}
            sx={{ width: 120 }}
            slotProps={{
              paper: {
                sx: {
                  bgcolor: '#1a1a1a',
                  border: `1px solid ${tokens.colors.border}`,
                },
              },
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                autoFocus
                variant="standard"
                placeholder="SEED"
                inputProps={{
                  ...params.inputProps,
                  maxLength: 6,
                  style: {
                    fontFamily: tokens.fonts.gaming,
                    fontSize: '1.6rem',
                    color: tokens.colors.text.disabled,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    padding: 0,
                  },
                }}
                sx={{
                  '& .MuiInput-underline:before': { borderColor: tokens.colors.border },
                  '& .MuiInput-underline:hover:before': { borderColor: tokens.colors.text.secondary },
                  '& .MuiInput-underline:after': { borderColor: tokens.colors.primary },
                }}
              />
            )}
          />
        ) : (
          <Typography
            onClick={() => setIsEditingSeed(true)}
            sx={{
              fontFamily: tokens.fonts.gaming,
              fontSize: { xs: '1.3rem', sm: '1.6rem', md: '1.9rem' },
              color: tokens.colors.text.disabled,
              letterSpacing: '0.05em',
              cursor: 'pointer',
              textDecoration: 'underline',
              textDecorationStyle: 'dotted',
              textUnderlineOffset: '4px',
              transition: 'color 150ms ease',
              '&:hover': {
                color: tokens.colors.text.secondary,
              },
            }}
          >
            {sessionSeed}
          </Typography>
        )}

        <Typography
          sx={{
            fontFamily: tokens.fonts.gaming,
            fontSize: { xs: '1.3rem', sm: '1.6rem', md: '1.9rem' },
            color: tokens.colors.text.secondary,
            letterSpacing: '0.05em',
          }}
        >
          , Never Die Guy
        </Typography>
      </Box>

      {/* Domain picker dropdown */}
      <Menu
        anchorEl={domainMenuAnchor}
        open={domainMenuOpen}
        onClose={handleDomainClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        slotProps={{
          paper: {
            sx: {
              bgcolor: '#1a1a1a',
              border: `1px solid ${tokens.colors.border}`,
              minWidth: 180,
            },
          },
        }}
      >
        <MenuItem
          onClick={() => handleDomainSelect(null)}
          sx={{
            fontFamily: tokens.fonts.gaming,
            fontSize: '0.95rem',
            color: tokens.colors.text.secondary,
            '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' },
          }}
        >
          Random
        </MenuItem>
        {Object.entries(DOMAIN_DISPLAY_NAMES).map(([key, name]) => (
          <MenuItem
            key={key}
            onClick={() => handleDomainSelect(key)}
            selected={key === greeterDomain}
            sx={{
              fontFamily: tokens.fonts.gaming,
              fontSize: '0.95rem',
              color: key === greeterDomain ? tokens.colors.text.primary : tokens.colors.text.secondary,
              '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' },
              '&.Mui-selected': { bgcolor: 'rgba(255,255,255,0.08)' },
            }}
          >
            {name}
          </MenuItem>
        ))}
      </Menu>

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
          ref={messagesContainerRef}
          onScroll={checkIfAtBottom}
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            mb: 3,
            maxHeight: 300,
            overflowY: 'auto',
            pr: 1,
            position: 'relative',
            // Hide scrollbar
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': { display: 'none' },
          }}
        >
          {messages.map((msg, i) => {
            const isPlayerMessage = msg.startsWith('You:');
            const isNpcMessage = !isPlayerMessage;
            const canGrunt = isNpcMessage && !gruntCooldown && !isTyping && !pendingInterrupt;

            return (
              <Box
                key={i}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  width: '100%',
                  animation: i === 0 ? 'none' : `${fadeIn} 300ms ease-out`,
                  // Show reaction buttons on hover
                  '& .reaction-btns': {
                    opacity: 0,
                    maxHeight: 0,
                    overflow: 'hidden',
                    transition: 'opacity 150ms ease, max-height 150ms ease',
                  },
                  '&:hover .reaction-btns': {
                    opacity: canGrunt ? 1 : 0,
                    maxHeight: canGrunt ? '40px' : 0,
                  },
                }}
              >
                <Box
                  sx={{
                    bgcolor: isPlayerMessage ? '#2a2a1a' : '#1a1a1a',
                    border: `2px solid ${isPlayerMessage ? '#554400' : '#333'}`,
                    borderRadius: '12px',
                    px: 3,
                    py: 2,
                    flex: 1,
                    position: 'relative',
                    // Chat bubble triangle on right for player messages
                    ...(isPlayerMessage && {
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        right: -10,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: 0,
                        height: 0,
                        borderTop: '8px solid transparent',
                        borderBottom: '8px solid transparent',
                        borderLeft: '10px solid #554400',
                      },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        right: -6,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: 0,
                        height: 0,
                        borderTop: '6px solid transparent',
                        borderBottom: '6px solid transparent',
                        borderLeft: '8px solid #2a2a1a',
                        zIndex: 1,
                      },
                    }),
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: tokens.fonts.gaming,
                      fontSize: isPlayerMessage
                        ? { xs: '1rem', sm: '1.2rem', md: '1.3rem' }
                        : { xs: '1.2rem', sm: '1.4rem', md: '1.5rem' },
                      color: isPlayerMessage ? tokens.colors.warning : tokens.colors.text.primary,
                      lineHeight: 1.5,
                      wordBreak: 'break-word',
                      fontStyle: isPlayerMessage ? 'italic' : 'normal',
                    }}
                  >
                    {isPlayerMessage ? msg.replace('You: ', '') : msg}
                  </Typography>
                </Box>
                {/* Reaction buttons - shows below message on hover */}
                {isNpcMessage && (
                  <Box
                    className="reaction-btns"
                    sx={{
                      display: 'flex',
                      gap: 1,
                      mt: 0.5,
                      pl: 1,
                    }}
                  >
                    <Button
                      onClick={() => handleGrunt(msg, 'grunt')}
                      disabled={!canGrunt}
                      sx={{
                        minWidth: 'auto',
                        px: 1.5,
                        py: 0.25,
                        fontFamily: tokens.fonts.gaming,
                        fontSize: '0.9rem',
                        color: '#555',
                        bgcolor: 'transparent',
                        textTransform: 'none',
                        '&:hover': {
                          color: '#888',
                          bgcolor: 'rgba(255,255,255,0.03)',
                        },
                        '&:disabled': {
                          opacity: 0.3,
                        },
                      }}
                    >
                      grunt
                    </Button>
                    <Button
                      onClick={() => handleGrunt(msg, 'hmph')}
                      disabled={!canGrunt}
                      sx={{
                        minWidth: 'auto',
                        px: 1.5,
                        py: 0.25,
                        fontFamily: tokens.fonts.gaming,
                        fontSize: '0.9rem',
                        color: '#555',
                        bgcolor: 'transparent',
                        textTransform: 'none',
                        '&:hover': {
                          color: '#888',
                          bgcolor: 'rgba(255,255,255,0.03)',
                        },
                        '&:disabled': {
                          opacity: 0.3,
                        },
                      }}
                    >
                      hmph
                    </Button>
                  </Box>
                )}
              </Box>
            );
          })}

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

        {/* New messages indicator */}
        {hasNewMessages && (
          <Button
            onClick={scrollToBottom}
            size="small"
            sx={{
              alignSelf: 'center',
              mb: 2,
              fontFamily: tokens.fonts.gaming,
              fontSize: '0.8rem',
              color: tokens.colors.text.secondary,
              bgcolor: 'rgba(255,255,255,0.05)',
              border: `1px solid ${tokens.colors.border}`,
              borderRadius: '16px',
              px: 2,
              py: 0.5,
              textTransform: 'none',
              animation: `${fadeIn} 200ms ease-out`,
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.1)',
                borderColor: tokens.colors.text.secondary,
              },
            }}
          >
            New messages
          </Button>
        )}

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
        </Box>
      </Box>
      </Box>
    </Box>
  );
}
