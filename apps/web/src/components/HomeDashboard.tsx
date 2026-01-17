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
import { Box, Typography, keyframes } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
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
import { generateLoadout, type StartingLoadout } from '../data/decrees';

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

// ============================================
// Types
// ============================================

/** Multi-NPC chat message with speaker info */
interface StreamMessage {
  id: string;
  speakerId: string;
  speakerName: string;
  spriteKey: string;
  wikiSlug?: string;
  text: string;
  type: 'npc' | 'system' | 'answer';
  timestamp: number;
}

// Fallback ambient messages
const FALLBACK_AMBIENT = [
  '...',
  'Take your time.',
  'The universe can wait.',
  'Ready when you are.',
];

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
  const [currentLoadout] = useState<StartingLoadout>(() =>
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

      // Get message - 30% chance for relationship dialogue
      let nextMessage: string;
      const useRelationship = participants.length > 1 && Math.random() < 0.3;

      if (useRelationship) {
        const others = participants.filter(p => p.id !== nextSpeaker.id);
        const target = others[Math.floor(Math.random() * others.length)];
        const relLine = getRelationshipDialogue(nextSpeaker.id, target.id);
        nextMessage = relLine || (nextSpeaker.ambient?.[ambientIndex % (nextSpeaker.ambient?.length || 1)] || FALLBACK_AMBIENT[ambientIndex % FALLBACK_AMBIENT.length]);
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
  }, [ambientIndex, isTyping, conversationState, currentSpeaker, participants]);

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

    // Reset typing state
    setIsTyping(false);
    setTypingText('');
    setFullTypingText('');
    setAmbientIndex(prev => prev + 1);
  }, [isTyping, typingText, fullTypingText, currentSpeaker]);

  // ============================================
  // Actions
  // ============================================

  const handlePlay = () => {
    sessionStorage.setItem('ndg-starting-loadout', JSON.stringify(currentLoadout));
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
    }}>
      {/* Top Rail - Player Identity */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        gap: { xs: 2, md: 4 },
        px: 3,
        py: 1.5,
        borderBottom: '1px solid #222',
        bgcolor: '#0a0a0a',
        flexWrap: 'wrap',
      }}>
        {/* Username */}
        <Typography sx={{ fontFamily: tokens.fonts.gaming, fontSize: '1.2rem', color: tokens.colors.text.primary }}>
          @player
        </Typography>

        {/* Total Score */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            component="img"
            src="/assets/ui/token.svg"
            alt="score"
            sx={{ width: 48, height: 48 }}
          />
          <Box>
            <Typography sx={{ fontSize: '0.75rem', color: '#888' }}>
              Total Score
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
              <Typography sx={{ fontFamily: tokens.fonts.gaming, fontSize: '2rem', fontWeight: 700, color: tokens.colors.text.primary }}>
                {playerGold >= 1000000 ? `${(playerGold / 1000000).toFixed(1)}m` : playerGold >= 1000 ? `${(playerGold / 1000).toFixed(1)}k` : playerGold.toLocaleString()}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box
                  component="img"
                  src="/icons/fire.svg"
                  alt="streak"
                  sx={{ width: 20, height: 20 }}
                />
                <Typography sx={{ fontFamily: tokens.fonts.gaming, fontSize: '1rem', color: '#ff6b35' }}>
                  4
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Play Multiplayer */}
        <Box
          onClick={() => navigate('/play')}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            cursor: 'pointer',
            px: 1.5,
            py: 0.5,
            borderRadius: 1,
            border: '1px solid #333',
            transition: 'all 150ms ease',
            '&:hover': { borderColor: '#555', bgcolor: '#1a1a1a' },
          }}
        >
          <Box
            component="img"
            src="/illustrations/1v1.svg"
            alt="multiplayer"
            sx={{ width: 24, height: 24, objectFit: 'contain' }}
          />
          <Typography sx={{ fontFamily: tokens.fonts.gaming, fontSize: '0.8rem', color: '#888' }}>
            Multiplayer
          </Typography>
        </Box>

        {/* Continue Button - only if saved run exists */}
        {savedRun && (
          <Box
            onClick={() => navigate('/play?continue=true')}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              cursor: 'pointer',
              px: 1.5,
              py: 0.5,
              borderRadius: 1,
              bgcolor: tokens.colors.background.elevated,
              border: `1px solid ${tokens.colors.border}`,
              transition: 'all 150ms ease',
              '&:hover': { borderColor: tokens.colors.text.secondary, bgcolor: tokens.colors.background.paper },
            }}
          >
            <Typography sx={{ fontFamily: tokens.fonts.gaming, fontSize: '0.8rem', color: tokens.colors.text.primary }}>
              Continue
            </Typography>
            <Typography sx={{ fontSize: '0.7rem', color: tokens.colors.text.secondary }}>
              D{savedRun.currentDomain}R{savedRun.roomNumber || 1}
            </Typography>
          </Box>
        )}

        {/* Gold (pushed right) */}
        <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <Box
            component="img"
            src="/assets/ui/currency/coin.png"
            alt="gold"
            sx={{ width: 20, height: 20, imageRendering: 'pixelated' }}
            onError={(e: React.SyntheticEvent<HTMLImageElement>) => { e.currentTarget.style.display = 'none'; }}
          />
          <Typography sx={{ fontFamily: tokens.fonts.gaming, fontSize: '1.1rem', color: tokens.colors.warning }}>
            {playerGold}
          </Typography>
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
          {/* Item Cards */}
          <Box sx={{ display: 'flex', alignItems: 'stretch', gap: 2 }}>
            {[
              { image: '/assets/items/armor/hero-cape.svg', rarity: 'Uncommon' },
              { image: '/assets/items/armor/king-james-crown.svg', rarity: 'Uncommon' },
              { image: '/assets/items/consumables/health-potion.svg', rarity: 'Common' },
            ].map((item, i) => (
              <Box
                key={i}
                sx={{
                  width: 160,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  borderRadius: 2,
                  border: '1px solid #333',
                  bgcolor: '#111',
                  p: 2,
                  gap: 2,
                }}
              >
                {/* Item Sprite */}
                <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', py: 2 }}>
                  <Box
                    component="img"
                    src={item.image}
                    alt="item"
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
                  bgcolor: item.rarity === 'Uncommon' ? '#1a4d1a' : '#444',
                  border: `1px solid ${item.rarity === 'Uncommon' ? '#2d7a2d' : '#555'}`,
                }}>
                  <Typography sx={{
                    fontFamily: tokens.fonts.gaming,
                    fontSize: '0.85rem',
                    color: item.rarity === 'Uncommon' ? '#6ddf6d' : '#ccc',
                  }}>
                    {item.rarity}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>

          {/* Seed Display */}
          <Typography sx={{ fontFamily: tokens.fonts.gaming, fontSize: '0.75rem', color: '#555' }}>
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
              '&:hover': { bgcolor: '#c7033a', borderColor: '#c7033a', transform: 'scale(1.02)' },
            }}
          >
            <Typography sx={{ fontFamily: tokens.fonts.gaming, fontSize: '2rem', color: '#fff' }}>
              Begin
            </Typography>
          </Box>
        </Box>

        {/* Right Column - Eternal Stream */}
        <Box sx={{
          width: { xs: '100%', md: 340 },
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          borderLeft: { md: '1px solid #222' },
          overflow: 'hidden',
          height: '100%',
          bgcolor: '#0f0f0f',
        }}>
          {/* Stream Header - fixed height */}
          <Box sx={{ p: 2, flexShrink: 0 }}>
            {/* Title Row */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Typography sx={{ fontFamily: tokens.fonts.gaming, fontSize: '1.2rem', color: tokens.colors.text.primary }}>
                  Eternal Stream
                </Typography>
                <Box sx={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  bgcolor: '#333',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  '&:hover': { bgcolor: '#444' },
                }}>
                  <Typography sx={{ fontSize: '0.7rem', color: '#888' }}>i</Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  onClick={() => setAmbientIndex(prev => prev + 1)}
                  sx={{
                    cursor: 'pointer',
                    color: '#666',
                    '&:hover': { color: '#999' },
                  }}
                >
                  <Typography sx={{ fontSize: '1.1rem' }}>↻</Typography>
                </Box>
                <Box sx={{ cursor: 'pointer', color: '#666', '&:hover': { color: '#999' } }}>
                  <Typography sx={{ fontSize: '1.1rem' }}>×</Typography>
                </Box>
              </Box>
            </Box>
            {/* Filter Dropdowns */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Typography sx={{ fontSize: '0.75rem', color: '#666' }}>Filters</Typography>
              <Box sx={{
                flex: 1,
                height: 36,
                borderRadius: 1,
                bgcolor: '#1a1a1a',
                border: '1px solid #333',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                px: 1,
                cursor: 'pointer',
              }}>
                <KeyboardArrowDownIcon sx={{ fontSize: 18, color: '#666' }} />
              </Box>
              <Box sx={{
                flex: 1,
                height: 36,
                borderRadius: 1,
                bgcolor: '#1a1a1a',
                border: '1px solid #333',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                px: 1,
                cursor: 'pointer',
              }}>
                <KeyboardArrowDownIcon sx={{ fontSize: 18, color: '#666' }} />
              </Box>
            </Box>

            {/* Daily Wiki Banner - fixed under filters, full width */}
            <Box
              component={RouterLink}
              to="/wiki"
              sx={{
                mt: 2,
                mx: -2,
                mb: -2,
                px: 2,
                py: 1.5,
                bgcolor: 'rgba(74, 222, 128, 0.08)',
                borderTop: '1px solid rgba(74, 222, 128, 0.2)',
                borderBottom: '1px solid rgba(74, 222, 128, 0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                textDecoration: 'none',
                transition: 'all 150ms ease',
                '&:hover': { bgcolor: 'rgba(74, 222, 128, 0.12)' },
              }}
            >
              <Box
                component="img"
                src="/assets/items/quest/diepedia-vol1.svg"
                alt="diepedia"
                sx={{ width: 36, height: 36, flexShrink: 0 }}
              />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontFamily: tokens.fonts.gaming, fontSize: '0.75rem', color: '#4ade80' }}>
                  Daily Wiki
                </Typography>
                <Typography sx={{ fontSize: '0.7rem', color: '#a3e6a3' }}>
                  +100g reward available
                </Typography>
              </Box>
              <ChevronRightIcon sx={{ fontSize: 20, color: '#4ade80' }} />
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
              '&::-webkit-scrollbar-thumb': { bgcolor: '#333', borderRadius: 2 },
            }}
          >
            {/* Active typing message at top */}
            {isTyping && typingText && (
              <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #1a1a1a', bgcolor: '#0f0f0f' }}>
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
                      color: '#666',
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

            {/* Messages (newest first) */}
            {messages.map((msg, i) => (
              <Box
                key={msg.id}
                sx={{
                  px: 2,
                  py: 1.5,
                  borderBottom: '1px solid #1a1a1a',
                  animation: i === 0 ? `${fadeIn} 200ms ease-out` : 'none',
                  bgcolor: msg.type === 'answer' ? 'rgba(255,200,0,0.03)' : 'transparent',
                  '&:hover': { bgcolor: '#111' },
                }}
              >
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
                      color: '#666',
                      mb: 0.25,
                    }}>
                      {msg.speakerName}
                    </Typography>
                    <Typography sx={{
                      fontFamily: tokens.fonts.gaming,
                      fontSize: i === 0 ? '0.95rem' : '0.85rem',
                      color: i === 0 ? tokens.colors.text.primary : '#888',
                      lineHeight: 1.4,
                      wordBreak: 'break-word',
                    }}>
                      {msg.text}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
