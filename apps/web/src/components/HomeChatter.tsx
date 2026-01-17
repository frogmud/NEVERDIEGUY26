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
import { Box, Typography, Button, keyframes, Skeleton, TextField, Autocomplete, Chip, IconButton } from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import RefreshIcon from '@mui/icons-material/Refresh';
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
  getRandomInterrupt,
  getRandomReaction,
  getShockReaction,
  getNpcsForDomain,
  getGreeterById,
  getRandomGreeterForDomain,
  getDomainSlugFromId,
  type HomeGreeter,
  type EnemyInterrupt,
} from '../data/home-greeters';
import { DOMAIN_CONFIGS } from '../data/domains';
import { getAllQuestions, getFaqAnswer, type FaqQuestion } from '../data/home-faq';
import { lookupDialogueAsync } from '../services/chatbase';
import {
  generateLoadout,
  generateHeadline,
  getLoadoutDomainName,
  getLoadoutDomainSlug,
  getItemImage,
  LOADOUT_ITEMS,
  type StartingLoadout,
} from '../data/decrees';

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
  const isInitialMount = useRef(true);

  // Starting loadout system - NPC offers items for a domain
  const [selectedDomain, setSelectedDomain] = useState<number>(() => {
    // Use stored preference or random
    const stored = sessionStorage.getItem('ndg-preferred-domain');
    if (stored) {
      const domainConfig = Object.values(DOMAIN_CONFIGS).find(d => d.slug === stored);
      if (domainConfig) return domainConfig.id;
    }
    const randomDomain = Math.floor(Math.random() * 6) + 1;
    // Save initial random selection
    sessionStorage.setItem('ndg-preferred-domain', getDomainSlugFromId(randomDomain));
    return randomDomain;
  });

  // Tier level (1-6) - separate from domain, can be traded down to reveal items
  const [selectedTier, setSelectedTier] = useState<number>(6);

  const [selectedNpcId, setSelectedNpcId] = useState<string>(() => {
    // Pick random NPC available for selected domain
    const available = getNpcsForDomain(selectedDomain);
    return available[Math.floor(Math.random() * available.length)] || 'mr-kevin';
  });

  const [currentLoadout, setCurrentLoadout] = useState<StartingLoadout>(() =>
    generateLoadout(selectedNpcId, selectedDomain)
  );

  // Get greeter based on selected NPC
  const greeter = useMemo<HomeGreeter>(() => {
    return getGreeterById(selectedNpcId) || HOME_GREETERS[0];
  }, [selectedNpcId]);
  const initialGreeting = useMemo<string>(() => getRandomGreeting(greeter), [greeter]);

  // Domain slug for enemy interrupts
  const greeterDomain = useMemo(() => {
    return getDomainSlugFromId(selectedDomain);
  }, [selectedDomain]);

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


  // Track if user is currently interacting (hovering on messages)
  const [isInteracting, setIsInteracting] = useState(false);

  // Regenerate loadout when domain or NPC changes (skip initial mount - already initialized)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    setCurrentLoadout(generateLoadout(selectedNpcId, selectedDomain));
    sessionStorage.setItem('ndg-preferred-domain', getDomainSlugFromId(selectedDomain));
  }, [selectedNpcId, selectedDomain]);


  // Refresh loadout with new random NPC + domain
  const handleRefreshLoadout = () => {
    // Pick new random domain
    const newDomain = Math.floor(Math.random() * 6) + 1;
    setSelectedDomain(newDomain);
    // Reset tier to max
    setSelectedTier(6);
    // Pick new random NPC available for that domain
    const availableNpcs = getNpcsForDomain(newDomain);
    const newNpcId = availableNpcs[Math.floor(Math.random() * availableNpcs.length)] || 'mr-kevin';
    setSelectedNpcId(newNpcId);
    // Generate loadout with new values
    setCurrentLoadout(generateLoadout(newNpcId, newDomain));
  };

  // Navigate to play with loadout pre-loaded (quick launch - skip zone selection)
  const handleStartLoadout = () => {
    // Store loadout in sessionStorage for PlayHub to read
    // quickLaunch=true skips zone selection and goes straight to combat with 'standard' variant
    sessionStorage.setItem('ndg-starting-loadout', JSON.stringify({
      ...currentLoadout,
      quickLaunch: true,
    }));
    navigate('/play');
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

  // Handle sending a FAQ question (offline mode or quick chip click)
  const handleSendFaqQuestion = async (directFaq?: FaqQuestion) => {
    const faq = directFaq || selectedQuestion;
    if (!faq || isSending || isTyping) return;

    setIsSending(true);
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

  // Ambient chat pauses permanently after user interaction (carousel vibes)
  // User can still ask more questions via the input, but ambient won't auto-resume

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
    if (isInteracting) return; // Pause ambient while user is hovering/deciding

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
  }, [ambientIndex, ambientMessages, usedCheckpoints, pendingInterrupt, interruptChance, greeterDomain, greeter.sprite2, awaitingConfirm, isInteracting]);

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
          <Box sx={{ width: { xs: 120, sm: 150, md: 180 }, flexShrink: 0 }}>
            <Skeleton
              variant="rectangular"
              sx={{
                width: '100%',
                height: { xs: 180, sm: 220, md: 260 },
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
      {/* Mission headline - clickable to start */}
      <Box
        sx={{
          flex: '0 0 auto',
          pt: 2,
          pb: 1,
          px: { xs: 2, sm: 4 },
          textAlign: 'center',
        }}
      >
        <Typography
          component="h1"
          onClick={handleStartLoadout}
          sx={{
            fontFamily: tokens.fonts.gaming,
            fontWeight: 800,
            fontSize: { xs: '1.2rem', sm: '1.6rem', md: '2rem' },
            color: tokens.colors.text.primary,
            lineHeight: 1.4,
            cursor: 'pointer',
            transition: 'all 150ms ease',
            '&:hover': {
              color: tokens.colors.primary,
            },
          }}
        >
          {generateHeadline(currentLoadout)}
        </Typography>
      </Box>

      {/* Loadout row: [items] [?] [spacer] [domain] T# [refresh] - fixed width container */}
      <Box
        sx={{
          flex: '0 0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pb: 3,
          px: { xs: 2, sm: 4 },
          opacity: showButtons ? 1 : 0,
          transition: 'opacity 300ms ease-out',
        }}
      >
        {/* Fixed width inner container for consistent item placement */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: { xs: 2.5, sm: 3 },
            width: { xs: 340, sm: 420 },
          }}
        >
        {/* Items - hover to see name */}
        {currentLoadout.items.slice(0, 2).map((itemSlug, idx) => {
          const itemData = LOADOUT_ITEMS[itemSlug];
          const displayName = itemData
            ? itemSlug.replace(/-/g, ' ').replace(/^(melee|ranged|throwable) /, '')
            : itemSlug.replace(/-/g, ' ');
          return (
            <Box
              key={idx}
              component={RouterLink}
              to={`/wiki/items/${itemSlug}`}
              title={displayName}
              sx={{
                position: 'relative',
                textDecoration: 'none',
                transition: 'transform 150ms ease',
                '&:hover': {
                  transform: 'scale(1.15)',
                },
                '&:hover .item-tooltip': {
                  opacity: 1,
                },
              }}
            >
              <Box
                component="img"
                src={getItemImage(itemSlug)}
                alt={itemSlug}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/assets/items/placeholder.png';
                }}
                sx={{
                  width: { xs: 52, sm: 64 },
                  height: { xs: 52, sm: 64 },
                  imageRendering: 'pixelated',
                }}
              />
              {/* Tooltip on hover */}
              <Typography
                className="item-tooltip"
                sx={{
                  position: 'absolute',
                  top: '100%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  mt: 0.5,
                  fontFamily: '"Inter", sans-serif',
                  fontSize: '0.7rem',
                  color: tokens.colors.text.secondary,
                  textTransform: 'capitalize',
                  whiteSpace: 'nowrap',
                  opacity: 0,
                  transition: 'opacity 150ms ease',
                  pointerEvents: 'none',
                }}
              >
                {displayName}
              </Typography>
            </Box>
          );
        })}

        {/* Mystery item - click to trade tier and reveal */}
        {selectedTier > 1 ? (
          <Box
            component="button"
            type="button"
            onClick={() => {
              // Trade a tier to reveal the third item
              setSelectedTier(prev => Math.max(1, prev - 1));
            }}
            title="Trade a tier to reveal"
            sx={{
              position: 'relative',
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              transition: 'transform 150ms ease',
              '&:hover': {
                transform: 'scale(1.15)',
              },
              '&:hover .mystery-box': {
                borderColor: '#555',
                bgcolor: '#222',
              },
              '&:hover .reveal-hint': {
                opacity: 1,
              },
              '&:focus': { outline: 'none' },
            }}
          >
            <Box
              className="mystery-box"
              sx={{
                width: { xs: 52, sm: 64 },
                height: { xs: 52, sm: 64 },
                bgcolor: '#1a1a1a',
                border: '2px dashed #333',
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 150ms ease',
              }}
            >
              <Typography
                sx={{
                  fontFamily: tokens.fonts.gaming,
                  fontSize: '1.5rem',
                  color: '#444',
                }}
              >
                ?
              </Typography>
            </Box>
            <Typography
              className="reveal-hint"
              sx={{
                position: 'absolute',
                top: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                mt: 0.5,
                fontFamily: '"Inter", sans-serif',
                fontSize: '0.6rem',
                color: tokens.colors.warning,
                whiteSpace: 'nowrap',
                opacity: 0,
                transition: 'opacity 150ms ease',
                pointerEvents: 'none',
              }}
            >
              -1 tier to reveal
            </Typography>
          </Box>
        ) : (
          // Third item revealed (at T1)
          (() => {
            const itemSlug = currentLoadout.items[2];
            const itemData = LOADOUT_ITEMS[itemSlug];
            const displayName = itemData
              ? itemSlug.replace(/-/g, ' ').replace(/^(melee|ranged|throwable) /, '')
              : itemSlug.replace(/-/g, ' ');
            return (
              <Box
                component={RouterLink}
                to={`/wiki/items/${itemSlug}`}
                title={displayName}
                sx={{
                  position: 'relative',
                  textDecoration: 'none',
                  transition: 'transform 150ms ease',
                  '&:hover': {
                    transform: 'scale(1.15)',
                  },
                  '&:hover .item-tooltip': {
                    opacity: 1,
                  },
                }}
              >
                <Box
                  component="img"
                  src={getItemImage(itemSlug)}
                  alt={itemSlug}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/assets/items/placeholder.png';
                  }}
                  sx={{
                    width: { xs: 52, sm: 64 },
                    height: { xs: 52, sm: 64 },
                    imageRendering: 'pixelated',
                  }}
                />
                <Typography
                  className="item-tooltip"
                  sx={{
                    position: 'absolute',
                    top: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    mt: 0.5,
                    fontFamily: '"Inter", sans-serif',
                    fontSize: '0.7rem',
                    color: tokens.colors.text.secondary,
                    textTransform: 'capitalize',
                    whiteSpace: 'nowrap',
                    opacity: 0,
                    transition: 'opacity 150ms ease',
                    pointerEvents: 'none',
                  }}
                >
                  {displayName}
                </Typography>
              </Box>
            );
          })()
        )}

          {/* Spacer - pushes domain to the right */}
          <Box sx={{ flex: 1 }} />

          {/* Domain icon + tier */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Box
              component="img"
              src={`/assets/domains/${getLoadoutDomainSlug(currentLoadout)}.png`}
              alt={getLoadoutDomainName(currentLoadout)}
              title={getLoadoutDomainName(currentLoadout)}
              sx={{
                width: { xs: 32, sm: 40 },
                height: { xs: 32, sm: 40 },
                borderRadius: '50%',
                objectFit: 'cover',
              }}
            />
            <Typography
              sx={{
                fontFamily: tokens.fonts.gaming,
                fontSize: { xs: '1.2rem', sm: '1.5rem' },
                fontWeight: 700,
                color: tokens.colors.text.secondary,
              }}
            >
              T{selectedTier}
            </Typography>
          </Box>
        </Box>

        {/* Refresh button - consistent position outside items container */}
        <IconButton
          onClick={handleRefreshLoadout}
          size="small"
          sx={{
            ml: 2,
            color: '#333',
            '&:hover': { color: tokens.colors.text.secondary, bgcolor: 'transparent' },
          }}
        >
          <RefreshIcon fontSize="small" />
        </IconButton>
      </Box>

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
      {/* Sprite - fixed on left, click to visit wiki (120px target) */}
      <Box
        component={RouterLink}
        to={`/wiki/${greeter.wikiSlug}`}
        sx={{
          width: { xs: 120, sm: 150, md: 180 },
          flexShrink: 0,
          opacity: showSprite ? 1 : 0,
          animation: showSprite ? `${slideInSprite} 500ms ease-out` : 'none',
          textDecoration: 'none',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          minHeight: { xs: 200, sm: 240, md: 280 },
          '&:hover .wiki-hint': {
            opacity: 1,
          },
          '&:hover img': {
            transform: 'scale(1.08)',
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
            maxHeight: { xs: 180, sm: 220, md: 260 },
            objectFit: 'contain',
            imageRendering: 'pixelated',
            transition: 'transform 150ms ease',
          }}
        />
        {/* Wiki hint - appears on hover */}
        <Typography
          className="wiki-hint"
          sx={{
            fontFamily: '"Inter", sans-serif',
            fontSize: '0.65rem',
            fontWeight: 500,
            color: '#555',
            opacity: 0,
            transition: 'opacity 150ms ease',
            textAlign: 'center',
            mt: 1,
          }}
        >
          view profile
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
            const canReact = isNpcMessage && !gruntCooldown && !pendingInterrupt;
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
                    opacity: canReact ? 1 : 0,
                    pointerEvents: canReact ? 'auto' : 'none',
                  },
                  // Highlight bubble on hover when reactions available
                  '&:hover .chat-bubble': canReact ? {
                    borderColor: '#555',
                    bgcolor: '#222',
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
                      gap: 1,
                      zIndex: 2,
                    }}
                  >
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleGrunt(msg, 'grunt');
                      }}
                      disabled={!canReact}
                      sx={{
                        minWidth: 'auto',
                        px: 1.5,
                        py: 0.25,
                        fontFamily: '"Inter", sans-serif',
                        fontSize: '0.7rem',
                        fontWeight: 500,
                        color: '#666',
                        bgcolor: 'transparent',
                        textTransform: 'none',
                        '&:hover': {
                          color: '#aaa',
                          bgcolor: 'rgba(255,255,255,0.05)',
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
                        handleGrunt(msg, 'ignore');
                      }}
                      disabled={!canReact}
                      sx={{
                        minWidth: 'auto',
                        px: 1.5,
                        py: 0.25,
                        fontFamily: '"Inter", sans-serif',
                        fontSize: '0.7rem',
                        fontWeight: 500,
                        color: '#666',
                        bgcolor: 'transparent',
                        textTransform: 'none',
                        '&:hover': {
                          color: '#aaa',
                          bgcolor: 'rgba(255,255,255,0.05)',
                        },
                        '&:disabled': {
                          opacity: 0.3,
                        },
                      }}
                    >
                      shh
                    </Button>
                  </Box>
                )}
              </Box>
            );
          })}

          <div ref={messagesEndRef} />
        </Box>

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
          {/* Quick question chips - shown in both API and FAQ mode */}
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1,
              mb: 1.5,
              justifyContent: 'center',
            }}
          >
            {getAllQuestions().slice(0, 3).map((faq) => (
              <Chip
                key={faq.id}
                label={faq.question.replace('?', '')}
                size="small"
                onClick={() => handleSendFaqQuestion(faq)}
                disabled={isSending || isTyping}
                sx={{
                  fontFamily: '"Inter", sans-serif',
                  fontSize: '0.75rem',
                  height: 28,
                  bgcolor: 'transparent',
                  border: '1px solid #333',
                  color: tokens.colors.text.disabled,
                  cursor: 'pointer',
                  transition: 'all 150ms ease',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.05)',
                    borderColor: '#555',
                    color: tokens.colors.text.secondary,
                  },
                  '&.Mui-disabled': {
                    opacity: 0.4,
                  },
                }}
              />
            ))}
          </Box>

          {/* API mode: Autocomplete with free-form input + FAQ suggestions */}
          {apiAvailable && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                bgcolor: '#1a1a1a',
                border: '2px solid #333',
                borderRadius: '12px',
                px: 3,
                py: 1.5,
                gap: 2,
              }}
            >
              <Autocomplete
                freeSolo
                options={getAllQuestions()} // All questions in dropdown
                getOptionLabel={(option) => typeof option === 'string' ? option : option.question}
                inputValue={inputValue}
                onInputChange={(_, newValue) => setInputValue(newValue.slice(0, 300))}
                onChange={(_, newValue) => {
                  if (newValue && typeof newValue !== 'string') {
                    // Auto-send when FAQ selected from dropdown
                    handleSendFaqQuestion(newValue);
                  }
                }}
                disabled={isSending}
                popupIcon={null}
                forcePopupIcon={false}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Click or start typing..."
                    variant="standard"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && inputValue.trim() && !isSending) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    sx={{
                      '& .MuiInput-root': {
                        fontFamily: tokens.fonts.gaming,
                        fontSize: { xs: '1rem', sm: '1.1rem' },
                        color: tokens.colors.text.primary,
                        '&::before, &::after': { display: 'none' },
                      },
                      '& .MuiInput-input': {
                        padding: 0,
                        '&::placeholder': { color: '#555', opacity: 1 },
                      },
                    }}
                  />
                )}
                slotProps={{
                  paper: {
                    sx: {
                      bgcolor: '#1a1a1a',
                      border: '2px solid #333',
                      borderRadius: '12px',
                      mt: 1,
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
                sx={{ flex: 1 }}
              />
              <IconButton
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isSending}
                sx={{
                  width: 36,
                  height: 36,
                  minWidth: 36,
                  borderRadius: '50%',
                  bgcolor: 'transparent',
                  color: inputValue.trim() && !isSending ? tokens.colors.text.secondary : '#333',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.05)',
                    color: tokens.colors.text.primary,
                  },
                  '&.Mui-disabled': { color: '#333' },
                  transition: 'all 150ms ease',
                }}
              >
                <ArrowUpwardIcon />
              </IconButton>
            </Box>
          )}

          {/* FAQ mode: single select with chip display and send icon */}
          {!apiAvailable && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                bgcolor: '#1a1a1a',
                border: '2px solid #333',
                borderRadius: '12px',
                px: 3,
                py: 1.5,
                gap: 2,
              }}
            >
              {selectedQuestion ? (
                <>
                  <Chip
                    label={selectedQuestion.question}
                    size="small"
                    onDelete={isSending ? undefined : () => setSelectedQuestion(null)}
                    sx={{
                      fontFamily: '"Inter", sans-serif',
                      fontSize: '0.85rem',
                      bgcolor: '#2a2a2a',
                      color: tokens.colors.text.primary,
                      '& .MuiChip-deleteIcon': {
                        color: '#555',
                        '&:hover': { color: '#888' },
                      },
                    }}
                  />
                  <Box sx={{ flex: 1 }} />
                  <IconButton
                    onClick={() => handleSendFaqQuestion()}
                    disabled={isSending}
                    sx={{
                      width: 36,
                      height: 36,
                      minWidth: 36,
                      borderRadius: '50%',
                      bgcolor: 'transparent',
                      color: !isSending ? tokens.colors.text.secondary : '#333',
                      '&:hover': {
                        bgcolor: 'rgba(255,255,255,0.05)',
                        color: tokens.colors.text.primary,
                      },
                      '&.Mui-disabled': { color: '#333' },
                      transition: 'all 150ms ease',
                    }}
                  >
                    <ArrowUpwardIcon />
                  </IconButton>
                </>
              ) : (
                <>
                  <Autocomplete
                    options={getAllQuestions()}
                    getOptionLabel={(option) => option.question}
                    value={null}
                    onChange={(_, newValue) => newValue && setSelectedQuestion(newValue)}
                    disabled={isSending}
                    groupBy={(option) => option.category === 'mechanics' ? 'Game' : option.category === 'lore' ? 'Lore' : 'Help'}
                    popupIcon={null}
                    forcePopupIcon={false}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder="Click or start typing..."
                        variant="standard"
                        sx={{
                          '& .MuiInput-root': {
                            fontFamily: tokens.fonts.gaming,
                            fontSize: { xs: '1rem', sm: '1.1rem' },
                            color: tokens.colors.text.primary,
                            '&::before, &::after': { display: 'none' },
                          },
                          '& .MuiInput-input': {
                            padding: 0,
                            '&::placeholder': { color: '#555', opacity: 1 },
                          },
                        }}
                      />
                    )}
                    slotProps={{
                      paper: {
                        sx: {
                          bgcolor: '#1a1a1a',
                          border: '2px solid #333',
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
                    sx={{ flex: 1 }}
                  />
                  <IconButton
                    disabled={true}
                    sx={{
                      width: 36,
                      height: 36,
                      minWidth: 36,
                      borderRadius: '50%',
                      color: '#333',
                      '&.Mui-disabled': { color: '#333' },
                    }}
                  >
                    <ArrowUpwardIcon />
                  </IconButton>
                </>
              )}
            </Box>
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
