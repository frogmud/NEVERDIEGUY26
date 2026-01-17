/**
 * HomeDashboard - Redesigned homepage as intelligent dashboard
 *
 * Layout:
 * - Player toolbar at top (seed, gold, items)
 * - 2 columns: skinny left (NPC stream) | big right (actions + info)
 * - No chat input - questions queue via action buttons
 * - Feed flipped (newest on top, stream-style)
 *
 * Lore context: The app is funded/used by Die-rectors. NPCs are haunting
 * domain streams - nightmare feeds of ambient chatter. NDG watches and
 * participates in this chaos as entertainment.
 *
 * NEVER DIE GUY
 */

import { useState, useEffect, useMemo, useRef } from 'react';
import { Box, Typography, Button, keyframes, IconButton, Chip, Paper, Tooltip } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SettingsIcon from '@mui/icons-material/Settings';
import CasinoIcon from '@mui/icons-material/Casino';
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
import { DOMAIN_CONFIGS } from '../data/domains';
import { getAllQuestions, getFaqAnswer, type FaqQuestion } from '../data/home-faq';
import {
  generateLoadout,
  generateHeadline,
  getLoadoutDomainName,
  getItemImage,
  LOADOUT_ITEMS,
  type StartingLoadout,
} from '../data/decrees';

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

const slideIn = keyframes`
  0% { opacity: 0; transform: translateX(-20px); }
  100% { opacity: 1; transform: translateX(0); }
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

function createAnswerMessage(npc: HomeGreeter, question: string, answer: string): StreamMessage {
  return {
    id: `ans-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    speakerId: npc.id,
    speakerName: npc.name,
    spriteKey: npc.sprite || '/assets/characters/placeholder.svg',
    wikiSlug: npc.wikiSlug,
    text: `[Q: ${question}] ${answer}`,
    type: 'answer',
    timestamp: Date.now(),
  };
}

// ============================================
// Component
// ============================================

export function HomeDashboard() {
  const navigate = useNavigate();
  const { sidebarWidth } = useOutletContext<ShellContext>();
  const streamRef = useRef<HTMLDivElement>(null);

  // Domain and NPC state
  const [selectedDomain, setSelectedDomain] = useState<number>(() => {
    const stored = sessionStorage.getItem('ndg-preferred-domain');
    if (stored) {
      const domainConfig = Object.values(DOMAIN_CONFIGS).find(d => d.slug === stored);
      if (domainConfig) return domainConfig.id;
    }
    return Math.floor(Math.random() * 6) + 1;
  });

  const [selectedNpcId, setSelectedNpcId] = useState<string>(() => {
    const available = getNpcsForDomain(selectedDomain);
    return available[Math.floor(Math.random() * available.length)] || 'mr-kevin';
  });

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
  const [ambientIndex, setAmbientIndex] = useState(0);

  // Queued questions (from action buttons)
  const [questionQueue, setQuestionQueue] = useState<FaqQuestion[]>([]);
  const [isProcessingQuestion, setIsProcessingQuestion] = useState(false);

  // Player state (would come from context in real app)
  const [playerGold] = useState(100);
  const [playerSeed] = useState(() => Math.random().toString(36).slice(2, 8).toUpperCase());

  // ============================================
  // Question Queue Processing
  // ============================================

  // Queue a question from action button
  const queueQuestion = (faq: FaqQuestion) => {
    setQuestionQueue(prev => [...prev, faq]);
  };

  // Process queued questions - answers appear in stream
  useEffect(() => {
    if (questionQueue.length === 0 || isProcessingQuestion) return;

    const processNext = async () => {
      setIsProcessingQuestion(true);
      const faq = questionQueue[0];

      // Brief typing delay
      setIsTyping(true);
      await new Promise(r => setTimeout(r, 800 + Math.random() * 400));
      setIsTyping(false);

      // Get answer from current speaker
      const answer = getFaqAnswer(faq.id, currentSpeaker.id);
      const answerMsg = createAnswerMessage(currentSpeaker, faq.question, answer);

      // Prepend to stream (newest first)
      setMessages(prev => [answerMsg, ...prev]);

      // Remove from queue
      setQuestionQueue(prev => prev.slice(1));
      setIsProcessingQuestion(false);
    };

    processNext();
  }, [questionQueue, isProcessingQuestion, currentSpeaker]);

  // ============================================
  // Ambient Stream Flow
  // ============================================

  useEffect(() => {
    // Don't add ambient if processing questions
    if (isProcessingQuestion || questionQueue.length > 0) return;

    const timer = setTimeout(() => {
      setIsTyping(true);
    }, 3000 + ambientIndex * 1500);

    const messageTimer = setTimeout(() => {
      setIsTyping(false);

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

      // Prepend to stream (newest first)
      const newMsg = createNPCMessage(nextSpeaker, nextMessage);
      setMessages(prev => {
        if (prev[0]?.text === nextMessage) return prev; // Skip duplicates
        return [newMsg, ...prev];
      });

      setConversationState(prev => addConversationTurn(prev, {
        speakerSlug: nextSpeaker.id,
        speakerName: nextSpeaker.name,
        spriteKey: nextSpeaker.sprite || '',
        text: nextMessage,
        mood: 'neutral',
        pool: 'idle',
      }));

      setCurrentSpeaker(nextSpeaker);
      setAmbientIndex(prev => prev + 1);
    }, 4500 + ambientIndex * 1500);

    return () => {
      clearTimeout(timer);
      clearTimeout(messageTimer);
    };
  }, [ambientIndex, isProcessingQuestion, questionQueue.length, conversationState, currentSpeaker, participants]);

  // ============================================
  // Actions
  // ============================================

  const handlePlay = () => {
    sessionStorage.setItem('ndg-starting-loadout', JSON.stringify(currentLoadout));
    navigate('/play');
  };

  const handleRefresh = () => {
    const domainNpcs = getNpcsForDomain(selectedDomain);
    const newNpcId = domainNpcs[Math.floor(Math.random() * domainNpcs.length)] || 'mr-kevin';
    setSelectedNpcId(newNpcId);
    setCurrentLoadout(generateLoadout(newNpcId, selectedDomain));
  };

  // ============================================
  // Render
  // ============================================

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      maxHeight: 'calc(100vh - 64px)',
      overflow: 'hidden',
    }}>
      {/* Player Toolbar */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 3,
        py: 1.5,
        borderBottom: '1px solid #222',
        bgcolor: '#0d0d0d',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Tooltip title="Your seed">
            <Typography sx={{ fontFamily: tokens.fonts.gaming, fontSize: '0.85rem', color: '#666' }}>
              SEED: {playerSeed}
            </Typography>
          </Tooltip>
          <Tooltip title="Gold">
            <Typography sx={{ fontFamily: tokens.fonts.gaming, fontSize: '0.9rem', color: tokens.colors.warning }}>
              {playerGold}g
            </Typography>
          </Tooltip>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {currentLoadout.items.slice(0, 3).map((itemSlug, idx) => (
            <Tooltip key={idx} title={itemSlug.replace(/-/g, ' ')}>
              <Box
                component="img"
                src={getItemImage(itemSlug)}
                alt={itemSlug}
                sx={{ width: 28, height: 28, imageRendering: 'pixelated', opacity: 0.8 }}
              />
            </Tooltip>
          ))}
        </Box>
      </Box>

      {/* Main 2-Column Layout */}
      <Box sx={{
        flex: 1,
        display: 'flex',
        overflow: 'hidden',
        gap: 0,
      }}>
        {/* Left Column - NPC Stream (skinny) */}
        <Box sx={{
          width: { xs: '100%', md: 340 },
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          borderRight: { md: '1px solid #222' },
          overflow: 'hidden',
        }}>
          {/* Big Sprite at Top */}
          <Box
            component={RouterLink}
            to={`/wiki/${greeter.wikiSlug}`}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              py: 3,
              px: 2,
              textDecoration: 'none',
              borderBottom: '1px solid #1a1a1a',
              '&:hover img': { transform: 'scale(1.05)' },
            }}
          >
            <Box
              component="img"
              src={greeter.sprite || greeter.portrait}
              alt={greeter.name}
              sx={{
                width: 140,
                height: 'auto',
                maxHeight: 180,
                objectFit: 'contain',
                imageRendering: 'pixelated',
                transition: 'transform 150ms ease',
              }}
            />
            <Typography sx={{
              fontFamily: tokens.fonts.gaming,
              fontSize: '1rem',
              color: tokens.colors.text.primary,
              mt: 1,
            }}>
              {greeter.name}
            </Typography>
            <Typography sx={{
              fontFamily: '"Inter", sans-serif',
              fontSize: '0.7rem',
              color: '#555',
            }}>
              {getLoadoutDomainName(currentLoadout)}
            </Typography>
          </Box>

          {/* Stream Feed (newest on top) */}
          <Box
            ref={streamRef}
            sx={{
              flex: 1,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 0,
              scrollbarWidth: 'thin',
              '&::-webkit-scrollbar': { width: 4 },
              '&::-webkit-scrollbar-thumb': { bgcolor: '#333', borderRadius: 2 },
            }}
          >
            {/* Typing indicator at top when active */}
            {isTyping && (
              <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #1a1a1a' }}>
                <Typography sx={{
                  fontFamily: tokens.fonts.gaming,
                  fontSize: '1rem',
                  color: '#555',
                  animation: `${pulse} 1s ease-in-out infinite`,
                }}>
                  {currentSpeaker.name} ...
                </Typography>
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
                      width: 32,
                      height: 32,
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

        {/* Right Column - Actions + Info (big) */}
        <Box sx={{
          flex: 1,
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          p: 3,
          overflow: 'auto',
        }}>
          {/* Headline */}
          <Typography
            onClick={handlePlay}
            sx={{
              fontFamily: tokens.fonts.gaming,
              fontSize: '1.6rem',
              fontWeight: 800,
              color: tokens.colors.text.primary,
              mb: 3,
              cursor: 'pointer',
              '&:hover': { color: tokens.colors.primary },
            }}
          >
            {generateHeadline(currentLoadout)}
          </Typography>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 4 }}>
            <Button
              variant="contained"
              startIcon={<PlayArrowIcon />}
              onClick={handlePlay}
              sx={{
                bgcolor: tokens.colors.primary,
                fontFamily: tokens.fonts.gaming,
                fontSize: '1rem',
                px: 3,
                py: 1.5,
                '&:hover': { bgcolor: tokens.colors.primaryDark },
              }}
            >
              Enter {getLoadoutDomainName(currentLoadout)}
            </Button>
            <Button
              variant="outlined"
              startIcon={<MenuBookIcon />}
              component={RouterLink}
              to="/wiki"
              sx={{
                borderColor: '#444',
                color: tokens.colors.text.secondary,
                fontFamily: tokens.fonts.gaming,
                '&:hover': { borderColor: '#666', bgcolor: 'rgba(255,255,255,0.02)' },
              }}
            >
              Wiki
            </Button>
            <IconButton onClick={handleRefresh} sx={{ color: '#555', '&:hover': { color: '#888' } }}>
              <RefreshIcon />
            </IconButton>
          </Box>

          {/* Quick Questions (queue into stream) */}
          <Typography sx={{
            fontFamily: tokens.fonts.gaming,
            fontSize: '0.8rem',
            color: '#555',
            mb: 1.5,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
          }}>
            Ask the Residents
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 4 }}>
            {getAllQuestions().slice(0, 6).map((faq) => (
              <Chip
                key={faq.id}
                label={faq.question.replace('?', '')}
                size="small"
                onClick={() => queueQuestion(faq)}
                disabled={questionQueue.some(q => q.id === faq.id)}
                sx={{
                  fontFamily: '"Inter", sans-serif',
                  fontSize: '0.75rem',
                  bgcolor: 'transparent',
                  border: '1px solid #333',
                  color: '#888',
                  cursor: 'pointer',
                  '&:hover': { borderColor: '#555', color: tokens.colors.text.secondary },
                  '&.Mui-disabled': { opacity: 0.4 },
                }}
              />
            ))}
          </Box>

          {/* Roulette / Domain Info Placeholder */}
          <Paper sx={{
            p: 3,
            bgcolor: '#111',
            border: '1px solid #222',
            borderRadius: 2,
          }}>
            <Typography sx={{
              fontFamily: tokens.fonts.gaming,
              fontSize: '0.9rem',
              color: '#555',
              mb: 2,
            }}>
              Domain Intel
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Box>
                <Typography sx={{ fontSize: '0.7rem', color: '#444', textTransform: 'uppercase' }}>
                  Residents
                </Typography>
                <Typography sx={{ fontFamily: tokens.fonts.gaming, color: tokens.colors.text.secondary }}>
                  {participants.length} NPCs
                </Typography>
              </Box>
              <Box>
                <Typography sx={{ fontSize: '0.7rem', color: '#444', textTransform: 'uppercase' }}>
                  Domain
                </Typography>
                <Typography sx={{ fontFamily: tokens.fonts.gaming, color: tokens.colors.text.secondary }}>
                  {getLoadoutDomainName(currentLoadout)}
                </Typography>
              </Box>
              <Box>
                <Typography sx={{ fontSize: '0.7rem', color: '#444', textTransform: 'uppercase' }}>
                  Rooms
                </Typography>
                <Typography sx={{ fontFamily: tokens.fonts.gaming, color: tokens.colors.text.secondary }}>
                  3 zones
                </Typography>
              </Box>
            </Box>
          </Paper>

          {/* Deployment / Status Placeholder */}
          <Box sx={{ mt: 'auto', pt: 4 }}>
            <Typography sx={{ fontSize: '0.65rem', color: '#333' }}>
              Die-rector Network v0.1 // Stream {greeterDomain}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
