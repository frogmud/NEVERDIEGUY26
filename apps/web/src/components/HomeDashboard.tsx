/**
 * HomeDashboard - 2-column homepage dashboard
 *
 * Layout:
 * - Top rail: username, total score, multiplayer, continue (if saved), gold
 * - Center column (flex): Starting loadout items + Begin button
 * - Right column (340px): Eternal Stream with Daily Wiki banner
 *
 * NEVER DIE GUY
 */

import { useState, useEffect, useMemo, useRef } from 'react';
import { Box, Typography, keyframes, Tooltip } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useNavigate, Link as RouterLink, useOutletContext } from 'react-router-dom';
import type { ShellContext } from './Shell';
import { tokens } from '../theme';
import {
  HOME_GREETERS,
  getRandomGreeting,
  getNpcsForDomain,
  getGreeterById,
  getDomainSlugFromId,
  getRelationshipDialogue,
  type HomeGreeter,
} from '../data/home-greeters';
import {
  getConversationPartners,
  selectNextSpeaker,
  createMultiNPCConversation,
  addConversationTurn,
  type MultiNPCConversationState,
} from '@ndg/ai-engine';
import { hasSavedRun, loadSavedRun } from '../data/player/storage';
import { generateLoadout, getItemImage, getLoadoutDomainName, LOADOUT_ITEMS, type StartingLoadout } from '../data/decrees';

// ============================================
// Animations
// ============================================

const fadeIn = keyframes`
  0% { opacity: 0; transform: translateY(-4px); }
  100% { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 0.4; }
  50% { opacity: 1; }
`;

const slideUp = keyframes`
  0% { transform: translateY(100%); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
`;

const blink = keyframes`
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
`;

// Boot sequence phases
type BootPhase = 'slide' | 'loading1' | 'waking' | 'loading2' | 'active';

// ============================================
// Types
// ============================================

/** Emoji reaction from an NPC */
interface EmojiReaction {
  emoji: string;
  npcId: string;
  npcName: string;
}

/** Multi-NPC chat message with speaker info */
interface StreamMessage {
  id: string;
  speakerId: string;
  speakerName: string;
  spriteKey: string;
  wikiSlug?: string;
  text: string;
  type: 'npc' | 'system' | 'answer' | 'quip';
  timestamp: number;
  reactions?: EmojiReaction[];
}

// Reaction emoji pool (using text emoji since no actual emojis per rules)
const REACTION_EMOJIS = ['skull', 'fire', 'eyes', 'think', 'laugh', 'hmm', 'wow'];

// Quick quip pools for NPCs reacting to each other
const QUICK_QUIPS = [
  '*sighs*',
  'Ha!',
  'Interesting...',
  'Oh?',
  '*nods*',
  '...',
  'Hmph.',
  '*chuckles*',
  'Indeed.',
  'Curious.',
];

// Fallback ambient messages
const FALLBACK_AMBIENT = [
  '...',
  'Take your time.',
  'The universe can wait.',
  'Ready when you are.',
];

/**
 * Render message text with @mentions highlighted
 * @mentions are formatted as @NpcName and link to wiki
 */
function renderMessageWithMentions(
  text: string,
  participants: HomeGreeter[],
  navigate: ReturnType<typeof useNavigate>
): React.ReactNode {
  // Find @mentions in text (case insensitive)
  const mentionRegex = /@([A-Za-z\s]+?)(?=[\s,!?.;:]|$)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = mentionRegex.exec(text)) !== null) {
    // Add text before the mention
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    const mentionName = match[1].trim();
    const mentionedNpc = participants.find(
      p => p.name.toLowerCase().includes(mentionName.toLowerCase())
    );

    if (mentionedNpc) {
      parts.push(
        <Box
          component="span"
          key={match.index}
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/wiki/${mentionedNpc.wikiSlug}`);
          }}
          sx={{
            color: tokens.colors.secondary,
            cursor: 'pointer',
            fontWeight: 600,
            '&:hover': { textDecoration: 'underline' },
          }}
        >
          @{mentionedNpc.name}
        </Box>
      );
    } else {
      // Unknown mention, render as-is
      parts.push(`@${mentionName}`);
    }

    lastIndex = mentionRegex.lastIndex;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}

// ============================================
// Helper Functions
// ============================================

function createNPCMessage(greeter: HomeGreeter, text: string): StreamMessage {
  return {
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    speakerId: greeter.id,
    speakerName: greeter.name,
    spriteKey: greeter.sprite || '/assets/characters/placeholder.svg',
    wikiSlug: greeter.wikiSlug,
    text,
    type: 'npc',
    timestamp: Date.now(),
  };
}

// ============================================
// Component
// ============================================

export function HomeDashboard() {
  const navigate = useNavigate();
  useOutletContext<ShellContext>(); // Required for layout
  const streamRef = useRef<HTMLDivElement>(null);

  // Always start at domain 1 - no persistence or random jumping
  const selectedDomain = 1;

  // Pick a random NPC from domain 1 residents
  const [selectedNpcId] = useState<string>(() => {
    const available = getNpcsForDomain(selectedDomain);
    return available[Math.floor(Math.random() * available.length)] || 'mr-kevin';
  });

  // Generate loadout for display (seed only - items acquired in-run)
  // Regenerates when filters change
  const [currentLoadout, setCurrentLoadout] = useState<StartingLoadout>(() =>
    generateLoadout(selectedNpcId, selectedDomain)
  );

  // Lead greeter (big sprite)
  const greeter = useMemo<HomeGreeter>(() => {
    return getGreeterById(selectedNpcId) || HOME_GREETERS[0];
  }, [selectedNpcId]);

  const greeterDomain = useMemo(() => getDomainSlugFromId(selectedDomain), [selectedDomain]);

  // Multi-NPC participants for this domain's stream
  const [participants, setParticipants] = useState<HomeGreeter[]>(() => {
    const domainNpcs = getNpcsForDomain(selectedDomain);
    const partners = getConversationPartners({
      domainSlug: greeterDomain,
      domainResidents: domainNpcs,
      maxCount: Math.min(6, domainNpcs.length),
    });
    return partners
      .map(id => getGreeterById(id))
      .filter((g): g is HomeGreeter => g !== undefined);
  });

  // Conversation engine state
  const [conversationState, setConversationState] = useState<MultiNPCConversationState>(() =>
    createMultiNPCConversation(participants.map(p => p.id), greeterDomain, null)
  );

  // Stream messages - newest first (prepend new messages)
  const [messages, setMessages] = useState<StreamMessage[]>(() => [
    createNPCMessage(greeter, getRandomGreeting(greeter)),
  ]);

  const [currentSpeaker, setCurrentSpeaker] = useState<HomeGreeter>(greeter);
  const [isTyping, setIsTyping] = useState(false);
  const [typingText, setTypingText] = useState('');
  const [fullTypingText, setFullTypingText] = useState('');
  const [ambientIndex, setAmbientIndex] = useState(0);

  // Boot sequence state
  const [bootPhase, setBootPhase] = useState<BootPhase>('slide');
  const [bootText, setBootText] = useState('');
  const [bootFullText, setBootFullText] = useState('');

  // Multi-NPC typing indicators (Slack-style)
  const [typingNpcs, setTypingNpcs] = useState<string[]>([]);

  // Stream visibility (can be hidden by user)
  const [streamEnabled, setStreamEnabled] = useState(true);

  // Player state (would come from context in real app)
  const [playerGold] = useState(100);

  // Check for saved run
  const savedRun = useMemo(() => {
    if (hasSavedRun()) {
      return loadSavedRun();
    }
    return null;
  }, []);

  // ============================================
  // Refresh Handler - Rerolls everything
  // ============================================

  const handleRefresh = () => {
    // Pick random domain (1-6)
    const newDomain = Math.floor(Math.random() * 6) + 1;

    // Generate new loadout with new seed
    const newLoadout = generateLoadout(selectedNpcId, newDomain);
    setCurrentLoadout(newLoadout);

    // Reset boot sequence to replay
    setBootPhase('slide');
    setBootText('');
    setBootFullText('');
    setMessages([]);
    setAmbientIndex(0);
    setIsTyping(false);

    // Update participants for new domain
    const domainSlug = getDomainSlugFromId(newDomain);
    const domainNpcs = getNpcsForDomain(newDomain);
    const partners = getConversationPartners({
      domainSlug,
      domainResidents: domainNpcs,
      maxCount: Math.min(6, domainNpcs.length),
    });
    const newParticipants = partners
      .map(id => getGreeterById(id))
      .filter((g): g is HomeGreeter => g !== undefined);
    setParticipants(newParticipants);
    setConversationState(createMultiNPCConversation(newParticipants.map(p => p.id), domainSlug, null));
  };

  // ============================================
  // Boot Sequence
  // ============================================

  useEffect(() => {
    // Boot sequence timing
    const timings: Record<BootPhase, { next: BootPhase | null; delay: number; text?: string }> = {
      slide: { next: 'loading1', delay: 600 },
      loading1: { next: 'waking', delay: 1000, text: 'loading...' },
      waking: { next: 'loading2', delay: 0, text: `never die guy ${currentLoadout.seed} wakes up` },
      loading2: { next: 'active', delay: 500, text: 'loading...' },
      active: { next: null, delay: 0 },
    };

    const current = timings[bootPhase];
    if (!current.next) return;

    // Set boot text if specified
    if (current.text && bootPhase !== 'waking') {
      setBootText(current.text);
    } else if (bootPhase === 'waking') {
      // Typewriter effect for "wakes up" message
      setBootFullText(current.text || '');
      setBootText('');
    }

    const timer = setTimeout(() => {
      if (current.next) {
        setBootPhase(current.next);
      }
    }, current.delay);

    return () => clearTimeout(timer);
  }, [bootPhase, currentLoadout.seed]);

  // Boot typewriter effect for "wakes up" message
  useEffect(() => {
    if (bootPhase !== 'waking' || !bootFullText) return;

    if (bootText.length < bootFullText.length) {
      const timer = setTimeout(() => {
        setBootText(bootFullText.slice(0, bootText.length + 1));
      }, 35); // Slightly slower for dramatic effect
      return () => clearTimeout(timer);
    } else {
      // Typewriter complete, advance to next phase
      const timer = setTimeout(() => setBootPhase('loading2'), 800);
      return () => clearTimeout(timer);
    }
  }, [bootPhase, bootText, bootFullText]);

  // ============================================
  // Typewriter Effect
  // ============================================

  useEffect(() => {
    if (!isTyping || !fullTypingText) return;

    if (typingText.length < fullTypingText.length) {
      const timer = setTimeout(() => {
        setTypingText(fullTypingText.slice(0, typingText.length + 1));
      }, 25 + Math.random() * 25); // 25-50ms per character
      return () => clearTimeout(timer);
    }
  }, [isTyping, typingText, fullTypingText]);

  // ============================================
  // Ambient Stream Flow
  // ============================================

  useEffect(() => {
    // Don't start ambient until boot is complete
    if (bootPhase !== 'active') return;
    // Don't add ambient if stream is paused
    if (!streamEnabled) return;
    // Don't add ambient if already typing
    if (isTyping) return;

    const timer = setTimeout(() => {
      // Select next speaker
      const nextSpeakerId = selectNextSpeaker(conversationState);
      let nextSpeaker = nextSpeakerId
        ? participants.find(p => p.id === nextSpeakerId) || currentSpeaker
        : currentSpeaker;

      // Avoid same speaker twice
      if (nextSpeaker.id === conversationState.lastSpeaker) {
        const others = participants.filter(p => p.id !== nextSpeaker.id);
        if (others.length > 0) {
          nextSpeaker = others[Math.floor(Math.random() * others.length)];
        }
      }

      // Get message - 30% chance for relationship dialogue with @mention
      let nextMessage: string;
      const useRelationship = participants.length > 1 && Math.random() < 0.3;

      if (useRelationship) {
        const others = participants.filter(p => p.id !== nextSpeaker.id);
        const target = others[Math.floor(Math.random() * others.length)];
        const relLine = getRelationshipDialogue(nextSpeaker.id, target.id);
        if (relLine) {
          // 50% chance to prepend with @mention for more Slack-like feel
          const addMention = Math.random() < 0.5;
          nextMessage = addMention ? `@${target.name}, ${relLine.charAt(0).toLowerCase()}${relLine.slice(1)}` : relLine;
        } else {
          nextMessage = nextSpeaker.ambient?.[ambientIndex % (nextSpeaker.ambient?.length || 1)] || FALLBACK_AMBIENT[ambientIndex % FALLBACK_AMBIENT.length];
        }
      } else {
        const speakerAmbient = nextSpeaker.ambient || FALLBACK_AMBIENT;
        nextMessage = speakerAmbient[ambientIndex % speakerAmbient.length];
      }

      // Start typing
      setCurrentSpeaker(nextSpeaker);
      setFullTypingText(nextMessage);
      setTypingText('');
      setIsTyping(true);
    }, 3000 + Math.min(ambientIndex, 5) * 500);

    return () => clearTimeout(timer);
  }, [ambientIndex, isTyping, conversationState, currentSpeaker, participants, bootPhase, streamEnabled]);

  // When typing completes, add message to stream
  useEffect(() => {
    if (!isTyping || !fullTypingText) return;
    if (typingText.length < fullTypingText.length) return;

    // Typing complete - add to stream
    const newMsg = createNPCMessage(currentSpeaker, fullTypingText);
    setMessages(prev => {
      if (prev[0]?.text === fullTypingText) return prev; // Skip duplicates
      return [newMsg, ...prev];
    });

    setConversationState(prev => addConversationTurn(prev, {
      speakerSlug: currentSpeaker.id,
      speakerName: currentSpeaker.name,
      spriteKey: currentSpeaker.sprite || '',
      text: fullTypingText,
      mood: 'neutral',
      pool: 'idle',
    }));

    // 30% chance for emoji reaction from another NPC
    if (participants.length > 1 && Math.random() < 0.3) {
      const reactors = participants.filter(p => p.id !== currentSpeaker.id);
      const reactor = reactors[Math.floor(Math.random() * reactors.length)];
      const emoji = REACTION_EMOJIS[Math.floor(Math.random() * REACTION_EMOJIS.length)];

      // Add reaction to the most recent message after a delay
      setTimeout(() => {
        setMessages(prev => {
          if (prev.length === 0) return prev;
          const updated = [...prev];
          const mostRecent = { ...updated[0] };
          mostRecent.reactions = [
            ...(mostRecent.reactions || []),
            { emoji, npcId: reactor.id, npcName: reactor.name },
          ];
          updated[0] = mostRecent;
          return updated;
        });
      }, 1000 + Math.random() * 1500);
    }

    // 15% chance for a quick quip from another NPC
    if (participants.length > 1 && Math.random() < 0.15) {
      const quippers = participants.filter(p => p.id !== currentSpeaker.id);
      const quipper = quippers[Math.floor(Math.random() * quippers.length)];
      const quip = QUICK_QUIPS[Math.floor(Math.random() * QUICK_QUIPS.length)];

      // Add quip as a mini-message after a delay
      setTimeout(() => {
        const quipMsg: StreamMessage = {
          id: `quip-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          speakerId: quipper.id,
          speakerName: quipper.name,
          spriteKey: quipper.sprite || '/assets/characters/placeholder.svg',
          wikiSlug: quipper.wikiSlug,
          text: quip,
          type: 'quip',
          timestamp: Date.now(),
        };
        setMessages(prev => [quipMsg, ...prev]);
      }, 1500 + Math.random() * 2000);
    }

    // Reset typing state
    setIsTyping(false);
    setTypingText('');
    setFullTypingText('');
    setAmbientIndex(prev => prev + 1);
  }, [isTyping, typingText, fullTypingText, currentSpeaker, participants]);

  // ============================================
  // Actions
  // ============================================

  const handlePlay = () => {
    // Quick launch: skip zone selection and go straight to combat
    sessionStorage.setItem('ndg-starting-loadout', JSON.stringify({
      ...currentLoadout,
      quickLaunch: true,
    }));
    navigate('/play');
  };

  // ============================================
  // Render
  // ============================================


  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100vh - 64px)',
      overflow: 'hidden',
      animation: `${slideUp} 500ms ease-out forwards`,
    }}>
      {/* Top Rail - Chunky Toolbar */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        px: 3,
        py: 1.5,
      }}>
        {/* Player Identity + Score Group */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          px: 2,
          py: 1.5,
          borderRadius: `${tokens.radius.lg}px`,
          bgcolor: tokens.colors.background.elevated,
        }}>
          {/* Token Icon */}
          <Box
            component="img"
            src="/assets/ui/token.svg"
            alt="score"
            sx={{ width: 40, height: 40, flexShrink: 0 }}
          />
          {/* Score + Streak */}
          <Box>
            <Typography sx={{
              fontFamily: tokens.fonts.gaming,
              fontSize: '1.5rem',
              fontWeight: 700,
              color: tokens.colors.text.primary,
              lineHeight: 1,
            }}>
              {playerGold >= 1000000 ? `${(playerGold / 1000000).toFixed(1)}m` : playerGold >= 1000 ? `${(playerGold / 1000).toFixed(1)}k` : playerGold.toLocaleString()}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
              <Typography sx={{ fontSize: '0.7rem', color: tokens.colors.text.secondary }}>
                @player
              </Typography>
              <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: tokens.colors.text.disabled }} />
              <Box
                component="img"
                src="/icons/fire.svg"
                alt="streak"
                sx={{ width: 14, height: 14 }}
              />
              <Typography sx={{ fontFamily: tokens.fonts.gaming, fontSize: '0.75rem', color: tokens.colors.warning }}>
                4
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Gold Chip */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 2,
          py: 1.5,
          borderRadius: `${tokens.radius.lg}px`,
          bgcolor: tokens.colors.background.elevated,
        }}>
          <Box
            component="img"
            src="/assets/ui/currency/coin.png"
            alt="gold"
            sx={{ width: 24, height: 24, imageRendering: 'pixelated' }}
            onError={(e: React.SyntheticEvent<HTMLImageElement>) => { e.currentTarget.style.display = 'none'; }}
          />
          <Typography sx={{ fontFamily: tokens.fonts.gaming, fontSize: '1.1rem', color: tokens.colors.warning }}>
            {playerGold}g
          </Typography>
        </Box>

        {/* Spacer */}
        <Box sx={{ flex: 1 }} />

        {/* Action Buttons Group */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {/* Continue Button - only if saved run exists */}
          {savedRun && (
            <Box
              onClick={() => navigate('/play?continue=true')}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                px: 2.5,
                py: 1.5,
                borderRadius: `${tokens.radius.lg}px`,
                bgcolor: tokens.colors.background.elevated,
                cursor: 'pointer',
                transition: 'all 150ms ease',
                '&:hover': { bgcolor: tokens.colors.background.paper },
              }}
            >
              <Typography sx={{ fontFamily: tokens.fonts.gaming, fontSize: '0.9rem', color: tokens.colors.text.primary }}>
                Continue
              </Typography>
              <Box sx={{
                px: 1,
                py: 0.25,
                borderRadius: `${tokens.radius.sm}px`,
                bgcolor: tokens.colors.background.paper,
              }}>
                <Typography sx={{ fontFamily: tokens.fonts.gaming, fontSize: '0.7rem', color: tokens.colors.text.secondary }}>
                  D{savedRun.currentDomain}R{savedRun.roomNumber || 1}
                </Typography>
              </Box>
            </Box>
          )}

          {/* Multiplayer Button */}
          <Box
            onClick={() => navigate('/play')}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              px: 2.5,
              py: 1.5,
              borderRadius: `${tokens.radius.lg}px`,
              bgcolor: tokens.colors.background.elevated,
              cursor: 'pointer',
              transition: 'all 150ms ease',
              '&:hover': { bgcolor: tokens.colors.background.paper },
            }}
          >
            <Box
              component="img"
              src="/illustrations/1v1.svg"
              alt="multiplayer"
              sx={{ width: 24, height: 24, objectFit: 'contain' }}
            />
            <Typography sx={{ fontFamily: tokens.fonts.gaming, fontSize: '0.9rem', color: tokens.colors.text.secondary }}>
              1v1
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Main 2-Column Layout */}
      <Box sx={{
        flex: 1,
        display: 'flex',
        overflow: 'hidden',
        minHeight: 0,
      }}>
        {/* Center Column - Starting Loadout */}
        <Box sx={{
          flex: 1,
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
          gap: 3,
        }}>
          {/* Domain Title */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography sx={{ fontSize: '0.75rem', color: tokens.colors.text.disabled, mb: 0.5 }}>
              Destination
            </Typography>
            <Typography sx={{
              fontFamily: tokens.fonts.gaming,
              fontSize: '1.5rem',
              color: tokens.colors.text.primary,
              animation: `${fadeIn} 300ms ease-out`,
            }}>
              {getLoadoutDomainName(currentLoadout)}
            </Typography>
          </Box>

          {/* Item Cards - from loadout */}
          <Box sx={{ display: 'flex', alignItems: 'stretch', gap: 2 }}>
            {currentLoadout.items.map((itemSlug, i) => {
              const itemData = LOADOUT_ITEMS[itemSlug];
              const rarity = itemData?.rarity || 1;
              const rarityLabel = rarity >= 3 ? 'Rare' : rarity >= 2 ? 'Uncommon' : 'Common';
              const isRare = rarity >= 3;
              const isUncommon = rarity >= 2;

              return (
                <Box
                  key={`${itemSlug}-${i}`}
                  sx={{
                    width: 160,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    borderRadius: 2,
                    border: `1px solid ${isRare ? 'rgba(168, 85, 247, 0.4)' : isUncommon ? 'rgba(74, 222, 128, 0.3)' : tokens.colors.border}`,
                    bgcolor: tokens.colors.background.paper,
                    p: 2,
                    gap: 2,
                    animation: `${fadeIn} 300ms ease-out ${i * 100}ms both`,
                  }}
                >
                  {/* Item Sprite */}
                  <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', py: 2 }}>
                    <Box
                      component="img"
                      src={getItemImage(itemSlug)}
                      alt={itemSlug}
                      sx={{
                        width: 80,
                        height: 80,
                        objectFit: 'contain',
                        imageRendering: 'pixelated',
                      }}
                    />
                  </Box>
                  {/* Rarity Badge */}
                  <Box sx={{
                    px: 2.5,
                    py: 0.75,
                    borderRadius: '20px',
                    bgcolor: isRare ? 'rgba(168, 85, 247, 0.15)' : isUncommon ? 'rgba(74, 222, 128, 0.15)' : tokens.colors.background.elevated,
                    border: `1px solid ${isRare ? 'rgba(168, 85, 247, 0.3)' : isUncommon ? 'rgba(74, 222, 128, 0.3)' : tokens.colors.border}`,
                  }}>
                    <Typography sx={{
                      fontFamily: tokens.fonts.gaming,
                      fontSize: '0.85rem',
                      color: isRare ? '#a855f7' : isUncommon ? tokens.colors.success : tokens.colors.text.secondary,
                    }}>
                      {rarityLabel}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>

          {/* Seed Display */}
          <Typography sx={{ fontFamily: tokens.fonts.gaming, fontSize: '0.75rem', color: tokens.colors.text.disabled }}>
            seed: #{currentLoadout.seed}
          </Typography>

          {/* Begin Button */}
          <Box
            onClick={handlePlay}
            sx={{
              width: '100%',
              maxWidth: 520,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 100,
              py: 3,
              borderRadius: '12px',
              bgcolor: tokens.colors.primary,
              border: `2px solid ${tokens.colors.primary}`,
              cursor: 'pointer',
              transition: 'all 150ms ease',
              '&:hover': { filter: 'brightness(1.1)', transform: 'scale(1.02)' },
            }}
          >
            <Typography sx={{ fontFamily: tokens.fonts.gaming, fontSize: '2rem', color: tokens.colors.text.primary }}>
              Begin
            </Typography>
          </Box>
        </Box>

        {/* Right Column - Eternal Stream (free floating with rounded corners) */}
        <Box sx={{
          width: { xs: '100%', md: 360 },
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          height: '100%',
          p: { md: 2 },
          pl: { md: 1 },
        }}>
        <Box sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          borderRadius: { md: `${tokens.radius.lg}px` },
          bgcolor: tokens.colors.background.elevated,
          border: { md: `1px solid ${tokens.colors.border}` },
        }}>
          {/* Stream Header - fixed height */}
          <Box sx={{ p: 2, flexShrink: 0 }}>
            {/* Title Row */}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
              <Box>
                <Typography sx={{ fontFamily: tokens.fonts.gaming, fontSize: '1.2rem', color: tokens.colors.text.primary }}>
                  Eternal Stream
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', color: tokens.colors.text.disabled, mt: 0.5 }}>
                  NPCs hang out here between runs.
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
                <Tooltip title="Reroll seed and NPCs" placement="bottom">
                  <Box
                    onClick={handleRefresh}
                    sx={{
                      width: 28,
                      height: 28,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '50%',
                      cursor: 'pointer',
                      color: tokens.colors.text.disabled,
                      transition: 'all 150ms ease',
                      '&:hover': { color: tokens.colors.text.secondary, bgcolor: tokens.colors.background.paper },
                    }}
                  >
                    <RefreshIcon sx={{ fontSize: 18 }} />
                  </Box>
                </Tooltip>
                <Tooltip title={streamEnabled ? "Pause feed" : "Resume feed"} placement="bottom">
                  <Box
                    onClick={() => setStreamEnabled(prev => !prev)}
                    sx={{
                      width: 28,
                      height: 28,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '50%',
                      cursor: 'pointer',
                      color: tokens.colors.text.disabled,
                      transition: 'all 150ms ease',
                      '&:hover': { color: tokens.colors.text.secondary, bgcolor: tokens.colors.background.paper },
                    }}
                  >
                    {streamEnabled ? <PauseIcon sx={{ fontSize: 18 }} /> : <PlayArrowIcon sx={{ fontSize: 18 }} />}
                  </Box>
                </Tooltip>
              </Box>
            </Box>

            {/* Daily Wiki Banner */}
            <Box
              component={RouterLink}
              to="/wiki"
              sx={{
                mt: 1.5,
                px: 1.5,
                py: 1.5,
                borderRadius: `${tokens.radius.md}px`,
                bgcolor: 'rgba(74, 222, 128, 0.08)',
                border: '1px solid rgba(74, 222, 128, 0.15)',
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                textDecoration: 'none',
                transition: 'all 150ms ease',
                '&:hover': { bgcolor: 'rgba(74, 222, 128, 0.12)', borderColor: 'rgba(74, 222, 128, 0.25)' },
              }}
            >
              <Box
                component="img"
                src="/assets/items/quest/diepedia-vol1.svg"
                alt="diepedia"
                sx={{ width: 36, height: 36, flexShrink: 0 }}
              />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontFamily: tokens.fonts.gaming, fontSize: '0.75rem', color: tokens.colors.success }}>
                  Daily Wiki
                </Typography>
                <Typography sx={{ fontSize: '0.7rem', color: tokens.colors.success, opacity: 0.7 }}>
                  +100g reward available
                </Typography>
              </Box>
              <ChevronRightIcon sx={{ fontSize: 20, color: tokens.colors.success }} />
            </Box>

            {/* NPC Avatar Row - who's in the room */}
            <Box sx={{
              mt: 1.5,
              display: 'flex',
              alignItems: 'center',
              gap: 0.75,
            }}>
              {participants.slice(0, 6).map((npc) => (
                <Box
                  key={npc.id}
                  component={RouterLink}
                  to={`/wiki/${npc.wikiSlug}`}
                  sx={{
                    position: 'relative',
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    overflow: 'hidden',
                    bgcolor: tokens.colors.background.paper,
                    border: `2px solid ${typingNpcs.includes(npc.id) ? tokens.colors.success : tokens.colors.border}`,
                    cursor: 'pointer',
                    transition: 'all 150ms ease',
                    '&:hover': { borderColor: tokens.colors.primary, transform: 'scale(1.1)' },
                  }}
                  title={npc.name}
                >
                  <Box
                    component="img"
                    src={npc.portrait || npc.sprite || '/assets/characters/placeholder.svg'}
                    alt={npc.name}
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      imageRendering: 'pixelated',
                    }}
                  />
                  {/* Online indicator */}
                  <Box sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: tokens.colors.success,
                    border: `1.5px solid ${tokens.colors.background.elevated}`,
                  }} />
                </Box>
              ))}
              {participants.length > 6 && (
                <Typography sx={{ fontFamily: tokens.fonts.gaming, fontSize: '0.7rem', color: tokens.colors.text.disabled, ml: 0.5 }}>
                  +{participants.length - 6}
                </Typography>
              )}
            </Box>
          </Box>

          {/* Stream Feed (newest on top) */}
          <Box
            ref={streamRef}
            sx={{
              flex: 1,
              minHeight: 0,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 0,
              scrollbarWidth: 'thin',
              '&::-webkit-scrollbar': { width: 4 },
              '&::-webkit-scrollbar-thumb': { bgcolor: tokens.colors.border, borderRadius: 2 },
            }}
          >
            {/* Boot Sequence Display */}
            {bootPhase !== 'active' && (
              <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                py: 6,
                gap: 1,
              }}>
                <Typography sx={{
                  fontFamily: 'monospace',
                  fontSize: '0.85rem',
                  color: tokens.colors.text.disabled,
                  letterSpacing: '0.05em',
                }}>
                  {bootPhase === 'waking' ? bootText : bootText}
                  {(bootPhase === 'loading1' || bootPhase === 'loading2') && (
                    <Box
                      component="span"
                      sx={{
                        display: 'inline-block',
                        animation: `${blink} 1s step-end infinite`,
                      }}
                    >
                      _
                    </Box>
                  )}
                  {bootPhase === 'waking' && bootText.length < bootFullText.length && (
                    <Box
                      component="span"
                      sx={{
                        display: 'inline-block',
                        width: '8px',
                        height: '1em',
                        bgcolor: tokens.colors.primary,
                        ml: 0.25,
                        animation: `${blink} 0.5s step-end infinite`,
                        verticalAlign: 'text-bottom',
                      }}
                    />
                  )}
                </Typography>
              </Box>
            )}

            {/* Paused Indicator */}
            {bootPhase === 'active' && !streamEnabled && (
              <Box sx={{
                px: 2,
                py: 1,
                borderBottom: `1px solid ${tokens.colors.border}`,
                bgcolor: 'rgba(255,255,255,0.02)',
              }}>
                <Typography sx={{
                  fontFamily: tokens.fonts.gaming,
                  fontSize: '0.75rem',
                  color: tokens.colors.text.disabled,
                  fontStyle: 'italic',
                }}>
                  Feed paused
                </Typography>
              </Box>
            )}

            {/* Slack-style Typing Indicator */}
            {bootPhase === 'active' && streamEnabled && isTyping && (
              <Box sx={{
                px: 2,
                py: 1,
                borderBottom: `1px solid ${tokens.colors.border}`,
                bgcolor: 'transparent',
              }}>
                <Typography sx={{
                  fontFamily: tokens.fonts.gaming,
                  fontSize: '0.75rem',
                  color: tokens.colors.text.disabled,
                  fontStyle: 'italic',
                }}>
                  {currentSpeaker.name} is typing
                  <Box
                    component="span"
                    sx={{ animation: `${pulse} 1.2s ease-in-out infinite` }}
                  >
                    ...
                  </Box>
                </Typography>
              </Box>
            )}

            {/* Active typing message at top */}
            {bootPhase === 'active' && streamEnabled && isTyping && typingText && (
              <Box sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${tokens.colors.border}`, bgcolor: tokens.colors.background.paper }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                  <Box
                    component="img"
                    src={currentSpeaker.sprite || '/assets/characters/placeholder.svg'}
                    alt={currentSpeaker.name}
                    sx={{
                      width: 56,
                      height: 56,
                      objectFit: 'contain',
                      imageRendering: 'pixelated',
                      flexShrink: 0,
                    }}
                  />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{
                      fontFamily: tokens.fonts.gaming,
                      fontSize: '0.7rem',
                      color: tokens.colors.text.disabled,
                      mb: 0.25,
                    }}>
                      {currentSpeaker.name}
                    </Typography>
                    <Typography sx={{
                      fontFamily: tokens.fonts.gaming,
                      fontSize: '0.95rem',
                      color: tokens.colors.text.primary,
                      lineHeight: 1.4,
                    }}>
                      {typingText}
                      <Box
                        component="span"
                        sx={{
                          display: 'inline-block',
                          width: '2px',
                          height: '1em',
                          bgcolor: tokens.colors.primary,
                          ml: 0.25,
                          animation: `${pulse} 0.5s ease-in-out infinite`,
                          verticalAlign: 'text-bottom',
                        }}
                      />
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )}

            {/* Messages (newest first) - only show after boot */}
            {bootPhase === 'active' && messages.map((msg, i) => (
              <Box
                key={msg.id}
                sx={{
                  px: 2,
                  py: msg.type === 'quip' ? 0.75 : 1.5,
                  borderBottom: msg.type === 'quip' ? 'none' : `1px solid ${tokens.colors.border}`,
                  animation: i === 0 ? `${fadeIn} 200ms ease-out` : 'none',
                  bgcolor: msg.type === 'answer' ? 'rgba(255,200,0,0.03)' : 'transparent',
                  '&:hover': { bgcolor: tokens.colors.background.paper },
                }}
              >
                {/* Quip messages - compact, no avatar */}
                {msg.type === 'quip' ? (
                  <Box sx={{ pl: 8.5 }}>
                    <Typography sx={{
                      fontFamily: tokens.fonts.gaming,
                      fontSize: '0.8rem',
                      color: tokens.colors.text.disabled,
                      fontStyle: 'italic',
                    }}>
                      <Box component="span" sx={{ color: tokens.colors.text.secondary, fontStyle: 'normal' }}>
                        {msg.speakerName}:
                      </Box>{' '}
                      {msg.text}
                    </Typography>
                  </Box>
                ) : (
                  /* Regular NPC messages */
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                    <Box
                      component="img"
                      src={msg.spriteKey}
                      alt={msg.speakerName}
                      sx={{
                        width: 56,
                        height: 56,
                        objectFit: 'contain',
                        imageRendering: 'pixelated',
                        flexShrink: 0,
                        opacity: i === 0 ? 1 : 0.6,
                      }}
                    />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{
                        fontFamily: tokens.fonts.gaming,
                        fontSize: '0.7rem',
                        color: tokens.colors.text.disabled,
                        mb: 0.25,
                      }}>
                        {msg.speakerName}
                      </Typography>
                      <Typography
                        component="div"
                        sx={{
                          fontFamily: tokens.fonts.gaming,
                          fontSize: i === 0 ? '0.95rem' : '0.85rem',
                          color: i === 0 ? tokens.colors.text.primary : tokens.colors.text.secondary,
                          lineHeight: 1.4,
                          wordBreak: 'break-word',
                        }}
                      >
                        {renderMessageWithMentions(msg.text, participants, navigate)}
                      </Typography>
                      {/* Emoji Reactions */}
                      {msg.reactions && msg.reactions.length > 0 && (
                        <Box sx={{ display: 'flex', gap: 0.5, mt: 0.75, flexWrap: 'wrap' }}>
                          {msg.reactions.map((reaction, ri) => (
                            <Box
                              key={ri}
                              title={`${reaction.npcName} reacted`}
                              sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 0.5,
                                px: 1,
                                py: 0.25,
                                borderRadius: '12px',
                                bgcolor: tokens.colors.background.paper,
                                border: `1px solid ${tokens.colors.border}`,
                                fontSize: '0.7rem',
                                color: tokens.colors.text.secondary,
                                animation: `${fadeIn} 300ms ease-out`,
                              }}
                            >
                              <Box component="span" sx={{ fontFamily: tokens.fonts.gaming }}>
                                {reaction.emoji}
                              </Box>
                            </Box>
                          ))}
                        </Box>
                      )}
                    </Box>
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        </Box>
        </Box>
      </Box>
    </Box>
  );
}
