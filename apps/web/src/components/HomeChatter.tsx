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
import { Box, Typography, Button, keyframes, Menu, MenuItem, Skeleton } from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { tokens } from '../theme';
import {
  HOME_GREETERS,
  getRandomGreeting,
  GREETER_DOMAINS,
  GREETER_INTERRUPT_CHANCE,
  GREETER_IGNORE_SENSITIVITY,
  GREETER_IGNORE_RESPONSES,
  DOMAIN_INTERRUPTS,
  DOMAIN_DISPLAY_NAMES,
  getRandomInterrupt,
  getRandomReaction,
  getWelcomeHeadline,
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

  // Get custom welcome headline for this NPC/domain combo
  const welcomeHeadline = useMemo(() => {
    return getWelcomeHeadline(greeter.id, domainDisplayName);
  }, [greeter.id, domainDisplayName]);

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

  // Reaction types for player responses
  type ReactionType = 'grunt' | 'hmph' | 'ignore';

  // Track ignore count for escalation
  const [ignoreCount, setIgnoreCount] = useState(0);

  // Handle grunt/hmph/ignore - NDG reacts to a specific message, NPC responds
  const handleGrunt = async (targetMessage: string, reactionType: ReactionType = 'grunt') => {
    if (gruntCooldown || isTyping || pendingInterrupt) return;

    setGruntCooldown(true);
    const newGruntCount = gruntCount + 1;
    setGruntCount(newGruntCount);

    // Show NDG's reaction
    const reactionTexts: Record<ReactionType, string> = {
      grunt: '*grunt*',
      hmph: '*hmph*',
      ignore: '*looks away*',
    };
    setMessages(prev => [...prev, `You: ${reactionTexts[reactionType]}`]);

    // Twitch sprite (reacting)
    if (greeter.sprite2) {
      setSpriteFrame(2);
      setTimeout(() => setSpriteFrame(1), 150);
    }

    // Handle ignore specially - use local personality responses
    if (reactionType === 'ignore') {
      const newIgnoreCount = ignoreCount + 1;
      setIgnoreCount(newIgnoreCount);

      // Get this NPC's ignore sensitivity
      const sensitivity = GREETER_IGNORE_SENSITIVITY[greeter.id] || 0.5;
      const responses = GREETER_IGNORE_RESPONSES[greeter.id];

      // Chance of annoyed response increases with sensitivity and ignore count
      const annoyedChance = sensitivity + (newIgnoreCount * 0.2);
      const isAnnoyed = Math.random() < annoyedChance;

      // NPC responds after a beat
      setTimeout(() => {
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          if (responses) {
            const pool = isAnnoyed ? responses.annoyed : responses.mild;
            const response = pool[Math.floor(Math.random() * pool.length)];
            setMessages(prev => [...prev, response]);
          } else {
            // Fallback if no responses defined
            const fallback = isAnnoyed ? 'Hello??' : '...';
            setMessages(prev => [...prev, fallback]);
          }
          setGruntCooldown(false);
        }, 1200);
      }, 600);
      return;
    }

    // NPC reacts after a beat (grunt/hmph)
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
            setMessages(prev => [...prev, `Enemy: ${interrupt.enemyName} ${interrupt.action}`]);
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
          setMessages(prev => [...prev, `Enemy: ${interrupt.enemyName} ${interrupt.action}`]);
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

  // Track if user is currently interacting (hovering on messages)
  const [isInteracting, setIsInteracting] = useState(false);

  // Check if scrolled to bottom (can see latest message)
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

  // Auto-scroll only if at bottom AND not interacting
  // Only show "new messages" when scrolled far enough that latest message is hidden
  useEffect(() => {
    const container = messagesContainerRef.current;
    const scrollTimer = setTimeout(() => {
      if (isAtBottom) {
        // At bottom - clear new messages indicator and auto-scroll if not interacting
        setHasNewMessages(false);
        if (!isInteracting) {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
      } else if (container) {
        // Not at bottom - check if we should show "new messages"
        const isScrollable = container.scrollHeight > container.clientHeight;
        const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
        // Show only if scrolled more than 100px from bottom (latest message hidden)
        if (isScrollable && distanceFromBottom > 100) {
          setHasNewMessages(true);
        } else {
          setHasNewMessages(false);
        }
      }
    }, 100);
    return () => clearTimeout(scrollTimer);
  }, [messages, isTyping, isAtBottom, isInteracting]);

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
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        maxWidth: 1200,
        height: '100%',
        maxHeight: 'calc(100vh - 120px)',
        overflow: 'hidden',
      }}>
        {/* Welcome skeleton - 1/5 */}
        <Box sx={{ flex: '0 0 auto', minHeight: '15vh', display: 'flex', alignItems: 'center' }}>
          <Skeleton
            variant="text"
            sx={{
              width: { xs: 280, sm: 400, md: 500 },
              height: { xs: 40, md: 50 },
              bgcolor: 'rgba(255,255,255,0.05)',
            }}
          />
        </Box>

        {/* Chat skeleton - 3/5 */}
        <Box
          sx={{
            flex: '1 1 auto',
            width: '100%',
            maxWidth: 1200,
            display: 'flex',
            gap: { xs: 3, sm: 4 },
            px: { xs: 3, sm: 4 },
            py: 2,
            minHeight: 0,
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

          </Box>
        </Box>

        {/* Button skeletons - 1/5 */}
        <Box sx={{ flex: '0 0 auto', minHeight: '12vh', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
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
    );
  }

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: '100%',
      maxWidth: 1200,
      height: '100%',
      maxHeight: 'calc(100vh - 120px)', // Account for chrome (header/footer)
      overflow: 'hidden',
    }}>
      {/* Welcome headline - 1/5 */}
      <Box
        sx={{
          flex: '0 0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '15vh',
          textAlign: 'center',
          px: { xs: 2, sm: 4, md: 6 },
        }}
      >
        <Typography
          component="h1"
          sx={{
            fontFamily: tokens.fonts.gaming,
            fontWeight: 800,
            fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
            color: tokens.colors.text.primary,
            lineHeight: 1.4,
          }}
        >
          {/* Split headline around domain name to make domain clickable */}
          {welcomeHeadline.split(domainDisplayName).map((part, i, arr) => (
            <span key={i}>
              {part}
              {i < arr.length - 1 && (
                <Box
                  component="span"
                  onClick={handleDomainClick}
                  sx={{
                    textDecoration: 'underline',
                    textDecorationStyle: 'dotted',
                    textUnderlineOffset: '4px',
                    cursor: 'pointer',
                    transition: 'color 150ms ease',
                    '&:hover': {
                      color: tokens.colors.text.secondary,
                    },
                  }}
                >
                  {domainDisplayName}
                </Box>
              )}
            </span>
          ))}
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
              minWidth: 200,
            },
          },
        }}
      >
        {/* Domain selection */}
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="caption" sx={{ color: tokens.colors.text.disabled, fontFamily: tokens.fonts.gaming }}>
            Domain
          </Typography>
        </Box>
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

      {/* Chat area - 3/5 (flex grow) */}
      <Box
        sx={{
          flex: '1 1 auto',
          width: '100%',
          maxWidth: 1200,
          display: 'flex',
          gap: { xs: 3, sm: 4 },
          px: { xs: 3, sm: 4 },
          py: 2,
          minHeight: 0, // Allow flex shrink
          overflow: 'hidden',
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
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          minHeight: { xs: 180, sm: 210, md: 250 },
          '&:hover .wiki-link': {
            color: tokens.colors.secondary,
          },
        }}
      >
        {/* Typing indicator above name */}
        {isTyping && (
          <Typography
            sx={{
              fontFamily: tokens.fonts.gaming,
              fontSize: '1.2rem',
              color: tokens.colors.text.secondary,
              animation: `${pulse} 1s ease-in-out infinite`,
              letterSpacing: '0.15em',
              textAlign: 'center',
              mb: 0.5,
            }}
          >
            ...
          </Typography>
        )}
        {/* Name + wiki link above sprite */}
        <Box sx={{ mb: 1, textAlign: 'center' }}>
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
      </Box>

      {/* Right side - messages, fills available space */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          minHeight: 0, // Allow flex shrink
          overflow: 'hidden',
        }}
      >
        {/* Messages container with gradient overlay */}
        <Box
          sx={{
            position: 'relative',
            height: { xs: 200, sm: 240, md: 280 },
            flexShrink: 0,
            // Top gradient fade
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '24px',
              background: 'linear-gradient(to bottom, #0a0a0a, transparent)',
              pointerEvents: 'none',
              zIndex: 1,
            },
            // Bottom gradient fade
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '24px',
              background: 'linear-gradient(to top, #0a0a0a, transparent)',
              pointerEvents: 'none',
              zIndex: 1,
            },
          }}
        >
        <Box
          ref={messagesContainerRef}
          onScroll={checkIfAtBottom}
          onMouseEnter={() => setIsInteracting(true)}
          onMouseLeave={() => setIsInteracting(false)}
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            gap: 2,
            overflowY: 'auto',
            pl: 2,
            pr: 1,
            // Hidden scrollbar
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': { display: 'none' },
          }}
        >
          {messages.map((msg, i) => {
            const isPlayerMessage = msg.startsWith('You:');
            const isEnemyMessage = msg.startsWith('Enemy:');
            const isNpcMessage = !isPlayerMessage && !isEnemyMessage;
            const canGrunt = isNpcMessage && !gruntCooldown && !isTyping && !pendingInterrupt;
            // Show arrow on latest NPC message (always)
            const isLatestNpcMessage = isNpcMessage && i === messages.length - 1;

            // Message colors
            const getBubbleColors = () => {
              if (isPlayerMessage) return { bg: '#2a2a1a', border: '#554400' };
              if (isEnemyMessage) return { bg: '#2a1a1a', border: '#662222' };
              return { bg: '#1a1a1a', border: '#333' };
            };
            const bubbleColors = getBubbleColors();

            return (
              <Box
                key={i}
                sx={{
                  position: 'relative',
                  width: '100%',
                  animation: i === 0 ? 'none' : `${fadeIn} 300ms ease-out`,
                  // Show reaction buttons on hover (absolute, no layout shift)
                  '& .reaction-btns': {
                    opacity: 0,
                    pointerEvents: 'none',
                    transition: 'opacity 150ms ease',
                  },
                  '&:hover .reaction-btns': {
                    opacity: canGrunt ? 1 : 0,
                    pointerEvents: canGrunt ? 'auto' : 'none',
                  },
                }}
              >
                <Box
                  sx={{
                    bgcolor: bubbleColors.bg,
                    border: `2px solid ${bubbleColors.border}`,
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
                    // Chat bubble triangle on left for latest NPC message (pointing to sprite)
                    ...(isLatestNpcMessage && {
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        left: -14,
                        top: '50%',
                        marginTop: '-10px',
                        width: 0,
                        height: 0,
                        borderTop: '10px solid transparent',
                        borderBottom: '10px solid transparent',
                        borderRight: '14px solid #333',
                      },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        left: -8,
                        top: '50%',
                        marginTop: '-8px',
                        width: 0,
                        height: 0,
                        borderTop: '8px solid transparent',
                        borderBottom: '8px solid transparent',
                        borderRight: '12px solid #1a1a1a',
                        zIndex: 1,
                      },
                    }),
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: tokens.fonts.gaming,
                      fontSize: (isPlayerMessage || isEnemyMessage)
                        ? { xs: '1rem', sm: '1.2rem', md: '1.3rem' }
                        : { xs: '1.2rem', sm: '1.4rem', md: '1.5rem' },
                      color: isPlayerMessage
                        ? tokens.colors.warning
                        : isEnemyMessage
                          ? '#ff6b6b'
                          : tokens.colors.text.primary,
                      lineHeight: 1.5,
                      wordBreak: 'break-word',
                      fontStyle: (isPlayerMessage || isEnemyMessage) ? 'italic' : 'normal',
                    }}
                  >
                    {isPlayerMessage
                      ? msg.replace('You: ', '')
                      : isEnemyMessage
                        ? msg.replace('Enemy: ', '')
                        : msg}
                  </Typography>
                </Box>
                {/* Reaction buttons - overlays below message on hover */}
                {isNpcMessage && (
                  <Box
                    className="reaction-btns"
                    sx={{
                      position: 'absolute',
                      bottom: -24,
                      left: 8,
                      display: 'flex',
                      gap: 0.5,
                      zIndex: 2,
                    }}
                  >
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleGrunt(msg, 'grunt');
                      }}
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
                      onClick={(e) => {
                        e.stopPropagation();
                        handleGrunt(msg, 'hmph');
                      }}
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
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleGrunt(msg, 'ignore');
                      }}
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
                      ignore
                    </Button>
                  </Box>
                )}
              </Box>
            );
          })}

          <div ref={messagesEndRef} />
        </Box>

        {/* New messages indicator - floating overlay at bottom */}
        {hasNewMessages && (
          <Button
            onClick={scrollToBottom}
            size="small"
            sx={{
              position: 'absolute',
              bottom: 32,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 2,
              fontFamily: tokens.fonts.gaming,
              fontSize: '0.75rem',
              color: tokens.colors.text.secondary,
              bgcolor: 'rgba(10,10,10,0.9)',
              border: `1px solid ${tokens.colors.border}`,
              borderRadius: '12px',
              px: 1.5,
              py: 0.25,
              textTransform: 'none',
              animation: `${fadeIn} 200ms ease-out`,
              '&:hover': {
                bgcolor: 'rgba(30,30,30,0.95)',
                borderColor: tokens.colors.text.secondary,
              },
            }}
          >
            New messages
          </Button>
        )}
        </Box>

      </Box>
      </Box>

      {/* Action buttons - 1/5 */}
      <Box
        sx={{
          flex: '0 0 auto',
          display: 'flex',
          gap: 2,
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '12vh',
          py: 2,
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
            fontWeight: 700,
            px: 6,
            py: 2,
            borderRadius: '12px',
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
            fontWeight: 600,
            px: 5,
            py: 2,
            borderRadius: '12px',
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
  );
}
