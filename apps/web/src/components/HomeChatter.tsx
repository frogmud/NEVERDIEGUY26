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
import { Box, Typography, Button, keyframes, Menu, MenuItem, Skeleton, TextField, Autocomplete, Chip, InputAdornment, IconButton } from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import { useNavigate, Link as RouterLink, useOutletContext } from 'react-router-dom';
import type { ShellContext } from './Shell';
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
  getShockReaction,
  type HomeGreeter,
  type EnemyInterrupt,
} from '../data/home-greeters';
import { getAllQuestions, getFaqAnswer, type FaqQuestion } from '../data/home-faq';
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
  const { sidebarWidth } = useOutletContext<ShellContext>();
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

  // Chat input state - NDG can ask questions
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [apiAvailable, setApiAvailable] = useState<boolean | null>(null); // null = checking
  const [selectedQuestion, setSelectedQuestion] = useState<FaqQuestion | null>(null);
  const [awaitingConfirm, setAwaitingConfirm] = useState(false); // Pause ambient until user confirms

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

  // Check API availability on mount
  useEffect(() => {
    const checkApi = async () => {
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ npcSlug: 'mr-bones', pool: 'greeting' }),
        });
        setApiAvailable(response.ok);
      } catch {
        setApiAvailable(false);
      }
    };
    checkApi();
  }, []);

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

  // Helper for async delays
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // Helper to show shock reaction (20% chance)
  const maybeShowShock = async (): Promise<boolean> => {
    const isShocked = Math.random() < 0.2;
    if (isShocked) {
      setIsTyping(true);
      await delay(1200);
      setIsTyping(false);

      const shockLine = getShockReaction(greeter.id);
      setMessages(prev => [...prev, shockLine]);

      if (greeter.sprite2) {
        setSpriteFrame(2);
        setTimeout(() => setSpriteFrame(1), 150);
      }
      await delay(800);
    }
    return isShocked;
  };

  // Handle sending a typed message from NDG (API mode)
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isSending || isTyping) return;

    setIsSending(true);
    const question = inputValue.trim();
    setInputValue('');

    // Add player's message to chat
    setMessages(prev => [...prev, `You: ${question}`]);

    // Twitch sprite (reacting to speech)
    if (greeter.sprite2) {
      setSpriteFrame(2);
      setTimeout(() => setSpriteFrame(1), 150);
    }

    // Maybe show shock reaction
    await maybeShowShock();

    // Get response from API
    setIsTyping(true);

    try {
      const response = await lookupDialogueAsync({
        npcSlug: greeter.id,
        pool: 'reaction',
        context: question,
      });

      await delay(1000 + Math.random() * 500);
      setIsTyping(false);
      setMessages(prev => [...prev, response.text]);
    } catch {
      // Shouldn't happen in API mode, but fallback just in case
      await delay(800);
      setIsTyping(false);
      setMessages(prev => [...prev, "Hmm. Let me think about that..."]);
    }

    if (greeter.sprite2) {
      setSpriteFrame(2);
      setTimeout(() => setSpriteFrame(1), 150);
    }

    setIsSending(false);
  };

  // Handle sending a FAQ question (offline mode)
  const handleSendFaqQuestion = async () => {
    if (!selectedQuestion || isSending || isTyping) return;

    setIsSending(true);
    const faq = selectedQuestion;
    setSelectedQuestion(null);

    // Add player's question
    setMessages(prev => [...prev, `You: ${faq.question}`]);

    if (greeter.sprite2) {
      setSpriteFrame(2);
      setTimeout(() => setSpriteFrame(1), 150);
    }

    await delay(400);

    // Maybe show shock reaction
    await maybeShowShock();

    // Get NPC-personalized response
    setIsTyping(true);
    await delay(800 + Math.random() * 600);
    setIsTyping(false);

    const response = getFaqAnswer(faq.id, greeter.id);
    setMessages(prev => [...prev, response]);

    if (greeter.sprite2) {
      setSpriteFrame(2);
      setTimeout(() => setSpriteFrame(1), 150);
    }

    setIsSending(false);
    setAwaitingConfirm(true); // Pause ambient until confirmed
  };

  // User confirms they read the response, resume ambient
  const handleConfirmRead = () => {
    setAwaitingConfirm(false);
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
    if (awaitingConfirm) return; // Pause ambient while user is reading FAQ response

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
  }, [ambientIndex, ambientMessages, usedCheckpoints, pendingInterrupt, interruptChance, greeterDomain, greeter.sprite2, awaitingConfirm]);

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
        maxWidth: 900,
        mx: 'auto',
        height: '100%',
        maxHeight: 'calc(100vh - 64px)',
        pb: '100px',
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
      maxWidth: 900,
      mx: 'auto',
      height: '100%',
      maxHeight: 'calc(100vh - 64px)', // Account for header only (footer hidden)
      pb: '100px', // Space for fixed chat input at bottom
      overflow: 'hidden',
    }}>
      {/* Welcome headline + action buttons */}
      <Box
        sx={{
          flex: '0 0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          pt: 2,
          pb: 1,
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

        {/* Action buttons - moved here from bottom */}
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            justifyContent: 'center',
            opacity: showButtons ? 1 : 0,
            transition: 'opacity 300ms ease-out',
          }}
        >
          <Button
            variant="contained"
            onClick={() => handleChoice('play')}
            size="small"
            sx={{
              fontFamily: tokens.fonts.gaming,
              fontSize: { xs: '0.9rem', sm: '1rem' },
              fontWeight: 700,
              px: 4,
              py: 1,
              borderRadius: '8px',
              bgcolor: tokens.colors.primary,
              '&:hover': { bgcolor: '#c7033a' },
            }}
          >
            Play
          </Button>
          <Button
            variant="outlined"
            onClick={() => handleChoice('wiki')}
            size="small"
            sx={{
              fontFamily: tokens.fonts.gaming,
              fontSize: { xs: '0.9rem', sm: '1rem' },
              fontWeight: 600,
              px: 3,
              py: 1,
              borderRadius: '8px',
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
            opacity: 1,
            color: '#888',
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
        {/* Name above sprite */}
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
        {/* Visit profile - appears on hover below sprite */}
        <Typography
          className="wiki-link"
          sx={{
            fontFamily: '"Inter", sans-serif',
            fontSize: '0.7rem',
            fontWeight: 500,
            color: '#555',
            opacity: 0,
            transition: 'opacity 150ms ease, color 150ms ease',
            textAlign: 'center',
            mt: 1,
          }}
        >
          visit profile
        </Typography>
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
            gap: 3,
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
                  // Brighten bubble border on hover when reactions available
                  '&:hover .chat-bubble': canGrunt ? {
                    borderColor: '#555',
                  } : {},
                }}
              >
                <Box
                  className="chat-bubble"
                  sx={{
                    bgcolor: bubbleColors.bg,
                    border: `2px solid ${bubbleColors.border}`,
                    borderRadius: '12px',
                    transition: 'border-color 150ms ease',
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
                        fontFamily: '"Inter", sans-serif',
                        fontSize: '0.7rem',
                        fontWeight: 500,
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
                        fontFamily: '"Inter", sans-serif',
                        fontSize: '0.7rem',
                        fontWeight: 500,
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
                        fontFamily: '"Inter", sans-serif',
                        fontSize: '0.7rem',
                        fontWeight: 500,
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

      {/* Chat input - fixed to bottom of viewport, offset for sidebar */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 0,
          left: { xs: 0, md: sidebarWidth },
          right: 0,
          bgcolor: tokens.colors.background.default,
          px: { xs: 2, sm: 3 },
          pt: 1,
          pb: 2,
          zIndex: 10,
          transition: 'left 225ms cubic-bezier(0.4, 0, 0.6, 1)',
        }}
      >
        <Box sx={{ maxWidth: 700, mx: 'auto' }}>
          {/* Awaiting confirm indicator */}
          {awaitingConfirm && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
              <Button
                size="small"
                onClick={handleConfirmRead}
                sx={{
                  fontFamily: '"Inter", sans-serif',
                  fontSize: '0.75rem',
                  color: tokens.colors.text.secondary,
                  textTransform: 'none',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' },
                }}
              >
                Got it
              </Button>
            </Box>
          )}

          {/* API mode: free-form text input with send icon */}
          {apiAvailable && (
            <TextField
              multiline
              maxRows={3}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value.slice(0, 300))}
              placeholder="Ask something..."
              disabled={isSending || isTyping || awaitingConfirm}
              fullWidth
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleSendMessage}
                        disabled={!inputValue.trim() || isSending || isTyping || awaitingConfirm}
                        edge="end"
                        sx={{
                          width: 36,
                          height: 36,
                          minWidth: 36,
                          borderRadius: '50%',
                          bgcolor: inputValue.trim() && !isSending && !isTyping && !awaitingConfirm ? tokens.colors.primary : 'transparent',
                          color: inputValue.trim() && !isSending && !isTyping && !awaitingConfirm ? '#fff' : '#333',
                          '&:hover': {
                            bgcolor: inputValue.trim() ? '#c7033a' : 'transparent',
                            color: inputValue.trim() ? '#fff' : '#333',
                          },
                          '&.Mui-disabled': { color: '#333', bgcolor: 'transparent' },
                          transition: 'all 150ms ease',
                        }}
                      >
                        <ArrowUpwardIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  fontFamily: tokens.fonts.gaming,
                  fontSize: '0.95rem',
                  bgcolor: '#1a1a1a',
                  borderRadius: '20px',
                  '& fieldset': { borderColor: '#333' },
                  '&:hover fieldset': { borderColor: '#444' },
                  '&.Mui-focused fieldset': { borderColor: tokens.colors.text.secondary },
                  '&.Mui-disabled': {
                    bgcolor: '#151515',
                    '& fieldset': { borderColor: '#2a2a2a' },
                  },
                },
                '& .MuiOutlinedInput-input': {
                  color: tokens.colors.text.primary,
                  '&::placeholder': { color: '#555', opacity: 1 },
                },
              }}
            />
          )}

          {/* FAQ mode: single select with chip display and send icon */}
          {!apiAvailable && (
            <>
              {selectedQuestion ? (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    flex: 1,
                  }}
                >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    flex: 1,
                    minHeight: 48,
                    px: 2,
                    pl: 2.5,
                    bgcolor: '#1a1a1a',
                    border: '1px solid #333',
                    borderRadius: '24px',
                  }}
                >
                    <Chip
                      label={selectedQuestion.question}
                      size="small"
                      onDelete={isSending || isTyping || awaitingConfirm ? undefined : () => setSelectedQuestion(null)}
                      sx={{
                        fontFamily: '"Inter", sans-serif',
                        fontSize: '0.8rem',
                        bgcolor: '#2a2a2a',
                        color: tokens.colors.text.primary,
                        '& .MuiChip-deleteIcon': {
                          color: '#555',
                          '&:hover': { color: '#888' },
                        },
                      }}
                    />
                  </Box>
                  <IconButton
                    onClick={handleSendFaqQuestion}
                    disabled={isSending || isTyping || awaitingConfirm}
                    sx={{
                      width: 40,
                      height: 40,
                      minWidth: 40,
                      borderRadius: '50%',
                      bgcolor: !isSending && !isTyping && !awaitingConfirm ? tokens.colors.primary : 'transparent',
                      color: !isSending && !isTyping && !awaitingConfirm ? '#fff' : '#333',
                      '&:hover': {
                        bgcolor: !isSending && !isTyping && !awaitingConfirm ? '#c7033a' : 'transparent',
                        color: '#fff',
                      },
                      '&.Mui-disabled': { color: '#333', bgcolor: 'transparent' },
                      transition: 'all 150ms ease',
                    }}
                  >
                    <ArrowUpwardIcon />
                  </IconButton>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', gap: 1, flex: 1, alignItems: 'center' }}>
                  <Autocomplete
                    options={getAllQuestions()}
                    getOptionLabel={(option) => option.question}
                    value={null}
                    onChange={(_, newValue) => newValue && setSelectedQuestion(newValue)}
                    disabled={isSending || isTyping || awaitingConfirm}
                    groupBy={(option) => option.category === 'mechanics' ? 'Game' : option.category === 'lore' ? 'Lore' : 'Help'}
                    popupIcon={null}
                    forcePopupIcon={false}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder="Select a question..."
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            fontFamily: tokens.fonts.gaming,
                            fontSize: '0.95rem',
                            bgcolor: '#1a1a1a',
                            borderRadius: '24px',
                            pl: 1.5,
                            '& fieldset': { borderColor: '#333' },
                            '&:hover fieldset': { borderColor: '#444' },
                            '&.Mui-focused fieldset': { borderColor: tokens.colors.text.secondary },
                            '&.Mui-disabled': {
                              bgcolor: '#151515',
                              '& fieldset': { borderColor: '#2a2a2a' },
                            },
                          },
                          '& .MuiOutlinedInput-input': {
                            color: tokens.colors.text.primary,
                            pl: 2,
                            '&::placeholder': { color: '#555', opacity: 1 },
                          },
                        }}
                      />
                    )}
                    slotProps={{
                      paper: {
                        sx: {
                          bgcolor: '#1a1a1a',
                          border: '1px solid #333',
                          borderRadius: '12px',
                          mt: 1,
                          '& .MuiAutocomplete-groupLabel': {
                            fontFamily: tokens.fonts.gaming,
                            fontSize: '0.75rem',
                            color: tokens.colors.text.disabled,
                            bgcolor: '#151515',
                            pl: 2.5,
                          },
                          '& .MuiAutocomplete-option': {
                            fontFamily: '"Inter", sans-serif',
                            fontSize: '0.85rem',
                            color: tokens.colors.text.secondary,
                            pl: 3,
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' },
                          },
                        },
                      },
                    }}
                    fullWidth
                  />
                  <IconButton
                    onClick={handleSendFaqQuestion}
                    disabled={true}
                    sx={{
                      width: 40,
                      height: 40,
                      minWidth: 40,
                      borderRadius: '50%',
                      color: '#333',
                      '&.Mui-disabled': { color: '#333' },
                    }}
                  >
                    <ArrowUpwardIcon />
                  </IconButton>
                </Box>
              )}
            </>
          )}

          {/* Disclaimer */}
          <Typography
            sx={{
              fontFamily: '"Inter", sans-serif',
              fontSize: '0.65rem',
              color: '#444',
              textAlign: 'center',
              mt: 1,
            }}
          >
            NPCs may hallucinate. Check the wiki for accurate info.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
