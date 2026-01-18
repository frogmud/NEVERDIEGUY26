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
import { Box, Typography, keyframes, Tooltip, Dialog, DialogTitle, DialogContent } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { useNavigate, useOutletContext } from 'react-router-dom';
import type { ShellContext } from './Shell';
import { tokens } from '../theme';
import {
  HOME_GREETERS,
  getRandomGreeting,
  getGreeterById,
  getDomainSlugFromId,
  getRelationshipDialogue,
  type HomeGreeter,
} from '../data/home-greeters';

// ============================================
// Preloaded NPC Cache (stable, never changes)
// ============================================

/**
 * Static NPC lookup map - precomputed at module load.
 * This ensures message rendering is NEVER affected by
 * dynamic participant changes (joins/leaves/refreshes).
 */
const NPC_CACHE: Map<string, HomeGreeter> = new Map();
const VALID_NPCS: HomeGreeter[] = [];

// Preload all valid NPCs at module initialization
(() => {
  for (const npc of HOME_GREETERS) {
    if (npc?.id && npc?.name && npc?.ambient?.length) {
      NPC_CACHE.set(npc.id, npc);
      NPC_CACHE.set(npc.name.toLowerCase(), npc); // Also index by lowercase name
      VALID_NPCS.push(npc);
    }
  }
})();

/** Get NPC from preloaded cache by id or name */
function getNpcFromCache(idOrName: string): HomeGreeter | undefined {
  return NPC_CACHE.get(idOrName) || NPC_CACHE.get(idOrName.toLowerCase());
}

/** Get all valid NPCs (have id, name, and ambient messages) */
function getValidNpcs(): HomeGreeter[] {
  return VALID_NPCS;
}
import {
  selectNextSpeaker,
  createMultiNPCConversation,
  addConversationTurn,
  type MultiNPCConversationState,
} from '@ndg/ai-engine';
import { hasSavedRun, loadSavedRun } from '../data/player/storage';
import { generateLoadout, getItemImage, LOADOUT_ITEMS, type StartingLoadout } from '../data/decrees';

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

const slideDown = keyframes`
  0% { transform: translateY(-100%); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
`;

const popUp = keyframes`
  0% { transform: translateY(20px) scale(0.95); opacity: 0; }
  100% { transform: translateY(0) scale(1); opacity: 1; }
`;

const streamSlideIn = keyframes`
  0% { transform: translateX(100%); }
  100% { transform: translateX(0); }
`;

const uiFadeIn = keyframes`
  0% { opacity: 0; transform: translateY(-10px); }
  100% { opacity: 1; transform: translateY(0); }
`;

const blink = keyframes`
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
`;

// Boot sequence phases
type BootPhase = 'slide' | 'loading1' | 'ascii' | 'skeleton' | 'active';

/**
 * ASCII Boot: Skull + THIS IS NEVER DIE GUY
 */
function generateAsciiBoot(): string[] {
  return [
    '        ████████',
    '      ████████████',
    '    ████████████████',
    '  ████████████████████',
    '  ████████████████████',
    '████████████████████████',
    '████████████████████████',
    '████      ████      ████',
    '████      ████      ████',
    '████      ████      ████',
    '  ████          ████',
    '  ██████  ██  ██████',
    '    ████████████████',
    '    ██  ████████  ██',
    '    ██  ████████  ██',
    '      ████████████',
    '',
    '     THIS IS NEVER',
    '      DIE GUY[TM]',
    '',
    '  a pantheon production',
  ];
}

/**
 * Generate a funny player alias from seed
 * e.g., "guy_12345", "xX_guy12345_Xx", "guy.12345.exe"
 */
function generatePlayerAlias(seed: string): string {
  const prefixes = ['guy_', 'xX_guy', 'the_guy_', 'l33t_guy', 'pro_guy_', 'guy.', 'not_a_guy_', ''];
  const suffixes = ['', '_Xx', '.exe', '_pro', '_main', '_irl', '_2024', '_real'];
  const seedNum = parseInt(seed, 10) || 0;
  const prefix = prefixes[seedNum % prefixes.length];
  const suffix = suffixes[Math.floor(seedNum / 100) % suffixes.length];
  return `${prefix}${seed}${suffix}`;
}

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
  type: 'npc' | 'system' | 'answer' | 'quip' | 'ad';
  timestamp: number;
  reactions?: EmojiReaction[];
  // Ad-specific fields
  adImage?: string;
  adLink?: string;
  adSubtitle?: string;
}

/** Inline ad definition */
interface StreamAd {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  link: string;
  domains: number[]; // Which domains this ad is relevant to (empty = all)
}

// Domain-relevant wiki ads
const STREAM_ADS: StreamAd[] = [
  // Daily Wiki - Earth domain starter guide
  {
    id: 'daily-wiki',
    title: 'Daily Wiki',
    subtitle: 'Earth Domain guide +100g',
    image: '/assets/items/quest/diepedia-vol1.svg',
    link: '/wiki/domains/earth',
    domains: [],
  },
  // Domain-specific ads
  {
    id: 'wiki-earth',
    title: 'Earth Domain',
    subtitle: 'Learn the basics',
    image: '/illustrations/newgame.svg',
    link: '/wiki/domains/earth',
    domains: [1],
  },
  {
    id: 'wiki-frost',
    title: 'Frost Reach',
    subtitle: 'Survive the cold',
    image: '/illustrations/weaknesses.svg',
    link: '/wiki/domains/frost-reach',
    domains: [2],
  },
  {
    id: 'wiki-infernus',
    title: 'Infernus',
    subtitle: 'Embrace the flames',
    image: '/illustrations/deaths.svg',
    link: '/wiki/domains/infernus',
    domains: [3],
  },
  {
    id: 'wiki-shadow',
    title: 'Shadow Keep',
    subtitle: 'Face the darkness',
    image: '/illustrations/history.svg',
    link: '/wiki/domains/shadow-keep',
    domains: [4],
  },
  {
    id: 'wiki-null',
    title: 'Null Providence',
    subtitle: 'Enter the void',
    image: '/illustrations/review.svg',
    link: '/wiki/domains/null-providence',
    domains: [5],
  },
  {
    id: 'wiki-aberrant',
    title: 'Aberrant',
    subtitle: 'Reality bends here',
    image: '/illustrations/options.svg',
    link: '/wiki/domains/aberrant',
    domains: [6],
  },
  ];

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
 * Render message text with @mentions AND bare NPC names highlighted.
 * Uses the STATIC NPC_CACHE for lookups - completely independent of
 * who is currently in the room. This prevents blank messages when
 * NPCs join/leave/refresh.
 *
 * Only links the FIRST mention of each NPC - subsequent mentions
 * of the same name are rendered as plain text.
 *
 * Also highlights player alias mentions (e.g., "@guy_12345")
 */
function renderMessageWithMentions(text: string, playerAlias?: string): React.ReactNode {
  if (!text) return text;

  // Use all valid NPCs from the static cache for matching
  const allNpcs = getValidNpcs();

  // Build patterns for NPCs + player alias
  // Sort by name length descending to match longer names first
  const sortedNpcs = [...allNpcs].sort((a, b) => b.name.length - a.name.length);
  const namePatterns = sortedNpcs.map(p => p.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

  // Add player alias pattern if provided
  if (playerAlias) {
    namePatterns.unshift(playerAlias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  }

  if (namePatterns.length === 0) return text;

  const combinedPattern = new RegExp(`@?(${namePatterns.join('|')})`, 'gi');

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;
  let keyCounter = 0;

  // Track which NPCs have already been linked (by lowercase name)
  const alreadyMentioned = new Set<string>();

  while ((match = combinedPattern.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    const matchedName = match[1];
    const hasAtSymbol = match[0].startsWith('@');
    const nameLower = matchedName.toLowerCase();

    // Check if this is the player alias
    const isPlayerMention = playerAlias && nameLower === playerAlias.toLowerCase();

    if (isPlayerMention) {
      // Always link player mentions (they're special)
      parts.push(
        <Box
          component="span"
          key={`mention-${keyCounter++}`}
          sx={{
            color: tokens.colors.warning,
            fontWeight: 700,
            textDecoration: 'underline',
            textUnderlineOffset: '2px',
          }}
        >
          {hasAtSymbol ? '@' : ''}{playerAlias}
        </Box>
      );
    } else {
      // Look up NPC from static cache
      const mentionedNpc = getNpcFromCache(matchedName);

      if (mentionedNpc) {
        // Only link the FIRST mention of this NPC
        if (!alreadyMentioned.has(nameLower)) {
          alreadyMentioned.add(nameLower);
          parts.push(
            <Box
              component="a"
              key={`mention-${keyCounter++}`}
              href={`/wiki/${mentionedNpc.wikiSlug}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
              sx={{
                color: tokens.colors.secondary,
                cursor: 'pointer',
                fontWeight: 600,
                textDecoration: 'underline',
                textUnderlineOffset: '2px',
                '&:hover': { color: tokens.colors.primary },
              }}
            >
              {hasAtSymbol ? '@' : ''}{mentionedNpc.name}
            </Box>
          );
        } else {
          // Already mentioned - render as plain text (no link)
          parts.push(matchedName);
        }
      } else {
        // Fallback
        parts.push(match[0]);
      }
    }

    lastIndex = combinedPattern.lastIndex;
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

function createNPCMessage(greeter: HomeGreeter, text: string): StreamMessage | null {
  // Guard against blank messages
  const safeText = text?.trim();
  if (!safeText) return null;

  return {
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    speakerId: greeter.id,
    speakerName: greeter.name,
    spriteKey: greeter.sprite || '/assets/characters/placeholder.svg',
    wikiSlug: greeter.wikiSlug,
    text: safeText,
    type: 'npc',
    timestamp: Date.now(),
  };
}

function createAdMessage(ad: StreamAd): StreamMessage {
  return {
    id: `ad-${ad.id}-${Date.now()}`,
    speakerId: 'system',
    speakerName: ad.title,
    spriteKey: ad.image,
    text: ad.title,
    type: 'ad',
    timestamp: Date.now(),
    adImage: ad.image,
    adLink: ad.link,
    adSubtitle: ad.subtitle,
  };
}

function getRelevantAds(domainId: number): StreamAd[] {
  return STREAM_ADS.filter(ad =>
    ad.domains.length === 0 || ad.domains.includes(domainId)
  );
}

function pickRandomAd(domainId: number, excludeIds: string[] = []): StreamAd | null {
  const relevant = getRelevantAds(domainId).filter(ad => !excludeIds.includes(ad.id));
  if (relevant.length === 0) return null;
  return relevant[Math.floor(Math.random() * relevant.length)];
}

// Daily Wiki cooldown (1 hour)
const DAILY_WIKI_COOLDOWN_KEY = 'ndg-daily-wiki-clicked';
const DAILY_WIKI_COOLDOWN_MS = 60 * 60 * 1000; // 1 hour

function isDailyWikiOnCooldown(): boolean {
  const lastClicked = localStorage.getItem(DAILY_WIKI_COOLDOWN_KEY);
  if (!lastClicked) return false;
  const elapsed = Date.now() - parseInt(lastClicked, 10);
  return elapsed < DAILY_WIKI_COOLDOWN_MS;
}

function markDailyWikiClicked(): void {
  localStorage.setItem(DAILY_WIKI_COOLDOWN_KEY, Date.now().toString());
}

// ============================================
// Component
// ============================================

export function HomeDashboard() {
  const navigate = useNavigate();
  useOutletContext<ShellContext>(); // Required for layout
  const streamRef = useRef<HTMLDivElement>(null);

  // Always Earth (domain 1) - but each refresh is a different "day" in eternity
  // NPCs from across the cosmos visit, items shift, the eternal stream flows on
  const selectedDomain = 1;

  // Pick a random NPC - can be from any domain (visitors through eternity)
  const [selectedNpcId, setSelectedNpcId] = useState<string>(() => {
    const validNpcs = getValidNpcs();
    return validNpcs[Math.floor(Math.random() * validNpcs.length)]?.id || 'mr-kevin';
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

  // Multi-NPC participants - shuffled from all domains (visitors through eternity)
  const [participants, setParticipants] = useState<HomeGreeter[]>(() => {
    const validNpcs = getValidNpcs();
    const shuffledNpcs = [...validNpcs].sort(() => Math.random() - 0.5);
    return shuffledNpcs.slice(0, 6);
  });

  // Conversation engine state
  const [conversationState, setConversationState] = useState<MultiNPCConversationState>(() =>
    createMultiNPCConversation(participants.map(p => p.id), greeterDomain, null)
  );

  // Stream messages - newest first (prepend new messages)
  const [messages, setMessages] = useState<StreamMessage[]>(() => {
    const initialMsg = createNPCMessage(greeter, getRandomGreeting(greeter));
    return initialMsg ? [initialMsg] : [];
  });

  const [currentSpeaker, setCurrentSpeaker] = useState<HomeGreeter>(greeter);
  const [isTyping, setIsTyping] = useState(false);
  const [typingText, setTypingText] = useState('');
  const [fullTypingText, setFullTypingText] = useState('');
  const [ambientIndex, setAmbientIndex] = useState(0);

  // Boot sequence state
  const [bootPhase, setBootPhase] = useState<BootPhase>('slide');
  const [bootText, setBootText] = useState('');
  const [asciiRowsVisible, setAsciiRowsVisible] = useState(0);

  // Player alias based on seed (for NPC mentions)
  const playerAlias = useMemo(() => generatePlayerAlias(currentLoadout.seed), [currentLoadout.seed]);

  // Multi-NPC typing indicators (Slack-style)
  const [typingNpcs, setTypingNpcs] = useState<string[]>([]);

  // Stream visibility (can be hidden by user)
  const [streamEnabled, setStreamEnabled] = useState(true);

  // Stream minimized state (starts minimized, expands after boot)
  const [streamMinimized, setStreamMinimized] = useState(true);

  // Unread message count (accumulates when minimized)
  const [unreadCount, setUnreadCount] = useState(0);

  // Track last message count to detect new messages
  const lastMessageCountRef = useRef(0);

  // Invite modal state
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  // Player state (would come from context in real app)
  const [playerGold] = useState(100);

  // Check for saved run
  const savedRun = useMemo(() => {
    if (hasSavedRun()) {
      return loadSavedRun();
    }
    return null;
  }, []);

  // Get available NPCs to invite (not already in stream)
  const availableToInvite = useMemo(() => {
    const currentIds = participants.map(p => p.id);
    return getValidNpcs().filter(g => !currentIds.includes(g.id));
  }, [participants]);

  // ============================================
  // Invite NPC Handler
  // ============================================

  const handleInviteNpc = (npc: HomeGreeter) => {
    setInviteModalOpen(false);

    // Add a player invite message
    const inviteMsg: StreamMessage = {
      id: `invite-${Date.now()}`,
      speakerId: 'player',
      speakerName: 'You',
      spriteKey: '/assets/ui/token.svg',
      text: `invited ${npc.name} to the stream.`,
      type: 'system',
      timestamp: Date.now(),
    };
    setMessages(prev => [inviteMsg, ...prev]);

    // Add the NPC to participants
    setParticipants(prev => [...prev, npc]);

    // After a short delay, have the NPC say hello
    setTimeout(() => {
      const greeting = getRandomGreeting(npc);
      const greetMsg = createNPCMessage(npc, greeting || `*${npc.name} waves*`);
      if (greetMsg) {
        setMessages(prev => [greetMsg, ...prev]);
      }
    }, 800 + Math.random() * 500);
  };

  // ============================================
  // Refresh Handler - Rerolls everything
  // ============================================

  const handleRefresh = () => {
    // New "day" in eternity - same destination (Earth), but different cosmic configuration
    // Pick a random NPC to lead the stream (from preloaded cache)
    const validNpcs = getValidNpcs();
    const newNpcId = validNpcs[Math.floor(Math.random() * validNpcs.length)]?.id || 'mr-kevin';
    setSelectedNpcId(newNpcId);

    // Generate new loadout with new seed (always Earth)
    const newLoadout = generateLoadout(newNpcId, selectedDomain);
    setCurrentLoadout(newLoadout);

    // Reset boot sequence to replay
    setBootPhase('slide');
    setBootText('');
    setAsciiRowsVisible(0);
    setMessages([]);
    setAmbientIndex(0);
    setIsTyping(false);

    // Shuffle NPCs from preloaded cache - visitors through eternity
    const shuffledNpcs = [...validNpcs].sort(() => Math.random() - 0.5);
    const newParticipants = shuffledNpcs.slice(0, 6);
    setParticipants(newParticipants);

    // Reset conversation state
    const domainSlug = getDomainSlugFromId(selectedDomain);
    setConversationState(createMultiNPCConversation(newParticipants.map(p => p.id), domainSlug, null));
  };

  // ============================================
  // Boot Sequence
  // ============================================

  useEffect(() => {
    // Boot sequence timing - ASCII then skeleton loader
    const timings: Record<BootPhase, { next: BootPhase | null; delay: number; text?: string }> = {
      slide: { next: 'loading1', delay: 600 },
      loading1: { next: 'ascii', delay: 1200, text: 'loading...' },
      ascii: { next: 'skeleton', delay: 5000 }, // Skull + welcome (20 rows x 200ms + pause)
      skeleton: { next: 'active', delay: 1800 }, // Skeleton loader for stream
      active: { next: null, delay: 0 },
    };

    const current = timings[bootPhase];
    if (!current.next) return;

    // Set boot text if specified
    if (current.text) {
      setBootText(current.text);
    }

    const timer = setTimeout(() => {
      if (current.next) {
        setBootPhase(current.next);
        setAsciiRowsVisible(0); // Reset for next phase
      }
    }, current.delay);

    return () => clearTimeout(timer);
  }, [bootPhase, currentLoadout.seed]);

  // ============================================
  // ASCII Row-by-Row Animation
  // ============================================

  useEffect(() => {
    if (bootPhase !== 'ascii') return;

    const lines = generateAsciiBoot();

    // Reveal rows one by one
    if (asciiRowsVisible < lines.length) {
      const timer = setTimeout(() => {
        setAsciiRowsVisible(prev => prev + 1);
      }, 200); // 200ms per row
      return () => clearTimeout(timer);
    }
  }, [bootPhase, asciiRowsVisible]);

  // ============================================
  // Pre-warm NPC Conversation (during ASCII boot)
  // ============================================

  useEffect(() => {
    if (bootPhase !== 'ascii') return;

    // Pre-generate messages while ASCII art is showing
    const warmupMessages: StreamMessage[] = [];
    const usedSpeakers = new Set<string>();

    // Generate 3-4 messages from different NPCs
    const messageCount = 3 + Math.floor(Math.random() * 2);

    for (let i = 0; i < messageCount; i++) {
      // Pick a speaker we haven't used yet
      const availableSpeakers = participants.filter(p => !usedSpeakers.has(p.id));
      if (availableSpeakers.length === 0) break;

      const speaker = availableSpeakers[Math.floor(Math.random() * availableSpeakers.length)];
      usedSpeakers.add(speaker.id);

      // Get a message from their ambient pool
      const speakerAmbient = speaker.ambient || FALLBACK_AMBIENT;
      const msgText = speakerAmbient[Math.floor(Math.random() * speakerAmbient.length)];

      // Skip if blank
      if (!msgText?.trim()) continue;

      const msg = createNPCMessage(speaker, msgText);
      if (msg) {
        warmupMessages.push(msg);
      }
    }

    // Queue these messages to appear when boot completes
    if (warmupMessages.length > 0) {
      setMessages(warmupMessages.reverse()); // Reverse so oldest is at bottom
    }
  }, [bootPhase, participants]);

  // ============================================
  // Player Joins Chat (after boot completes)
  // ============================================

  useEffect(() => {
    if (bootPhase !== 'active') return;

    // Add "GUY #seed has joined" message after a short delay
    const timer = setTimeout(() => {
      const joinMsg: StreamMessage = {
        id: `player-join-${Date.now()}`,
        speakerId: 'player',
        speakerName: playerAlias,
        spriteKey: '/assets/ui/token.svg',
        text: `${playerAlias} has joined the chat.`,
        type: 'system',
        timestamp: Date.now(),
      };
      setMessages(prev => [joinMsg, ...prev]);
    }, 800 + Math.random() * 500);

    return () => clearTimeout(timer);
  }, [bootPhase, playerAlias]);

  // ============================================
  // Typewriter Effect (for NPC messages)
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

      // Get message - 30% chance for relationship dialogue, 15% chance to mention player
      let nextMessage: string = '';
      const roll = Math.random();

      if (roll < 0.15) {
        // 15% chance: Mention the player directly
        const playerGreetings = [
          `Hey @${playerAlias}, welcome to the stream.`,
          `@${playerAlias} just joined? Fresh meat.`,
          `*nods at @${playerAlias}*`,
          `@${playerAlias}, you ready for this?`,
          `Good to see you, @${playerAlias}.`,
          `@${playerAlias}... interesting alias.`,
          `Another Guy enters. Welcome, @${playerAlias}.`,
        ];
        nextMessage = playerGreetings[Math.floor(Math.random() * playerGreetings.length)];
      } else if (roll < 0.45 && participants.length > 1) {
        // 30% chance: Relationship dialogue with @mention
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
        // Regular ambient
        const speakerAmbient = nextSpeaker.ambient || FALLBACK_AMBIENT;
        nextMessage = speakerAmbient[ambientIndex % speakerAmbient.length] || '';
      }

      // Guard: skip if message is blank (hydration safety)
      if (!nextMessage?.trim()) {
        nextMessage = FALLBACK_AMBIENT[Math.floor(Math.random() * FALLBACK_AMBIENT.length)];
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

    // Typing complete - add to stream (skip if blank)
    const newMsg = createNPCMessage(currentSpeaker, fullTypingText);
    if (newMsg) {
      setMessages(prev => {
        if (prev[0]?.text === fullTypingText) return prev; // Skip duplicates
        return [newMsg, ...prev];
      });
    }

    setConversationState(prev => addConversationTurn(prev, {
      speakerSlug: currentSpeaker.id,
      speakerName: currentSpeaker.name,
      spriteKey: currentSpeaker.sprite || '',
      text: fullTypingText,
      mood: 'neutral',
      pool: 'idle',
    }));

    // Each NPC has 20% chance to react - allows multiple reactions
    if (participants.length > 1) {
      const potentialReactors = participants.filter(p => p.id !== currentSpeaker.id);
      potentialReactors.forEach((reactor, idx) => {
        if (Math.random() < 0.2) {
          const emoji = REACTION_EMOJIS[Math.floor(Math.random() * REACTION_EMOJIS.length)];
          // Stagger reaction timing so they don't all appear at once
          setTimeout(() => {
            setMessages(prev => {
              if (prev.length === 0) return prev;
              const updated = [...prev];
              const mostRecent = { ...updated[0] };
              // Avoid duplicate reactions from same NPC
              const existingReactorIds = (mostRecent.reactions || []).map(r => r.npcId);
              if (existingReactorIds.includes(reactor.id)) return prev;
              mostRecent.reactions = [
                ...(mostRecent.reactions || []),
                { emoji, npcId: reactor.id, npcName: reactor.name },
              ];
              updated[0] = mostRecent;
              return updated;
            });
          }, 800 + idx * 400 + Math.random() * 800);
        }
      });
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
  // Inline Ad Insertion
  // ============================================

  // Insert initial ad when boot completes
  useEffect(() => {
    if (bootPhase !== 'active') return;

    // Insert Daily Wiki ad after a short delay (if not on cooldown)
    const timer = setTimeout(() => {
      if (!isDailyWikiOnCooldown()) {
        const dailyWiki = STREAM_ADS.find(ad => ad.id === 'daily-wiki');
        if (dailyWiki) {
          setMessages(prev => [createAdMessage(dailyWiki), ...prev]);
        }
      } else {
        // Show a different domain-relevant ad instead
        const ad = pickRandomAd(currentLoadout.domain, ['daily-wiki']);
        if (ad) {
          setMessages(prev => [createAdMessage(ad), ...prev]);
        }
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [bootPhase, currentLoadout.domain]);

  // Periodic ad insertion (~60 seconds)
  useEffect(() => {
    if (bootPhase !== 'active') return;
    if (!streamEnabled) return;

    const interval = setInterval(() => {
      // Get recent ad IDs to avoid repeating
      const recentAdIds = messages
        .filter(m => m.type === 'ad')
        .slice(0, 3)
        .map(m => m.speakerName);

      // Exclude daily-wiki if on cooldown
      const excludeIds = [...recentAdIds];
      if (isDailyWikiOnCooldown()) {
        excludeIds.push('daily-wiki');
      }

      // Pick a relevant ad for current domain
      const ad = pickRandomAd(currentLoadout.domain, excludeIds);
      if (ad) {
        setMessages(prev => [createAdMessage(ad), ...prev]);
      }
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [bootPhase, streamEnabled, currentLoadout.domain, messages]);

  // ============================================
  // NPCs Coming and Going
  // ============================================

  useEffect(() => {
    if (bootPhase !== 'active') return;
    if (!streamEnabled) return;

    // Every 15-25 seconds, an NPC might arrive or leave
    const interval = setInterval(() => {
      const action = Math.random();

      if (action < 0.4 && participants.length > 2) {
        // 40% chance: Someone leaves (if more than 2 participants)
        const leaverIdx = Math.floor(Math.random() * participants.length);
        const leaver = participants[leaverIdx];

        // Guard: skip if leaver is invalid
        if (!leaver?.name) return;

        // Add a "left" system message
        const leaveMsg: StreamMessage = {
          id: `leave-${Date.now()}`,
          speakerId: 'system',
          speakerName: leaver.name,
          spriteKey: leaver.sprite || '/assets/characters/placeholder.svg',
          wikiSlug: leaver.wikiSlug,
          text: `${leaver.name} has left the stream.`,
          type: 'system',
          timestamp: Date.now(),
        };
        setMessages(prev => [leaveMsg, ...prev]);
        setParticipants(prev => prev.filter((_, i) => i !== leaverIdx));

      } else if (action < 0.8 && participants.length < 8) {
        // 40% chance: Someone arrives (if less than 8 participants)
        const currentIds = participants.map(p => p.id);
        const available = HOME_GREETERS.filter(g => g?.id && g?.name && g?.ambient?.length && !currentIds.includes(g.id));

        if (available.length > 0) {
          const newcomer = available[Math.floor(Math.random() * available.length)];

          // Guard: skip if newcomer is invalid
          if (!newcomer?.name) return;

          // Add a "joined" system message
          const joinMsg: StreamMessage = {
            id: `join-${Date.now()}`,
            speakerId: 'system',
            speakerName: newcomer.name,
            spriteKey: newcomer.sprite || '/assets/characters/placeholder.svg',
            wikiSlug: newcomer.wikiSlug,
            text: `${newcomer.name} has joined the stream.`,
            type: 'system',
            timestamp: Date.now(),
          };
          setMessages(prev => [joinMsg, ...prev]);
          setParticipants(prev => [...prev, newcomer]);
        }
      }
      // 20% chance: Nothing happens (quiet moment)
    }, 15000 + Math.random() * 10000);

    return () => clearInterval(interval);
  }, [bootPhase, streamEnabled, participants]);

  // ============================================
  // Unread Count Tracking (when minimized)
  // ============================================

  useEffect(() => {
    if (bootPhase !== 'active') return;

    const currentCount = messages.length;
    const newMessages = currentCount - lastMessageCountRef.current;

    // If minimized and we have new messages, increment unread
    if (streamMinimized && newMessages > 0) {
      setUnreadCount(prev => prev + newMessages);
    }

    // Update the ref
    lastMessageCountRef.current = currentCount;
  }, [messages.length, streamMinimized, bootPhase]);

  // Clear unread when expanded
  useEffect(() => {
    if (!streamMinimized) {
      setUnreadCount(0);
    }
  }, [streamMinimized]);

  // Auto-expand stream after boot completes
  useEffect(() => {
    if (bootPhase !== 'active') return;

    // Delay expansion so other UI settles first
    const timer = setTimeout(() => {
      setStreamMinimized(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [bootPhase]);

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
      position: 'relative',
    }}>
      {/* Top Rail - Chunky Toolbar */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        px: 3,
        py: 1.5,
        animation: `${uiFadeIn} 500ms ease-out 1.2s both`,
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

      {/* Main Content Area */}
      <Box sx={{
        flex: 1,
        display: 'flex',
        overflow: 'hidden',
        minHeight: 0,
        position: 'relative',
      }}>
        {/* Center Column - Starting Loadout (full width now) */}
        <Box sx={{
          flex: 1,
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
          gap: 3,
        }}>
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
                    animation: `${popUp} 500ms ease-out ${400 + i * 150}ms both`,
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
          <Typography sx={{
            fontFamily: tokens.fonts.gaming,
            fontSize: '0.75rem',
            color: tokens.colors.text.disabled,
            animation: `${uiFadeIn} 500ms ease-out 1.2s both`,
          }}>
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
              animation: `${uiFadeIn} 500ms ease-out 1.2s both`,
              '&:hover': { filter: 'brightness(1.1)', transform: 'scale(1.02)' },
            }}
          >
            <Typography sx={{ fontFamily: tokens.fonts.gaming, fontSize: '2rem', color: tokens.colors.text.primary }}>
              Begin
            </Typography>
          </Box>
        </Box>

        {/* Floating Chat Window - Eternal Stream */}
        <Box sx={{
          position: 'absolute',
          bottom: 16,
          right: 16,
          width: streamMinimized ? 'auto' : 380,
          height: streamMinimized ? 'auto' : '70%',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 100,
          animation: `${streamSlideIn} 700ms ease-out both`,
        }}>
          {/* Minimized Tab */}
          {streamMinimized ? (
            <Box
              onClick={() => setStreamMinimized(false)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                px: 2,
                py: 1.5,
                borderRadius: `${tokens.radius.lg}px`,
                bgcolor: tokens.colors.background.elevated,
                border: `1px solid ${tokens.colors.border}`,
                cursor: 'pointer',
                transition: 'all 150ms ease',
                '&:hover': { bgcolor: tokens.colors.background.paper, transform: 'translateY(-2px)' },
              }}
            >
              <Typography sx={{ fontFamily: tokens.fonts.gaming, fontSize: '0.95rem', color: tokens.colors.text.primary }}>
                Eternal Stream
              </Typography>
              {unreadCount > 0 && (
                <Box sx={{
                  minWidth: 22,
                  height: 22,
                  borderRadius: '11px',
                  bgcolor: tokens.colors.primary,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  px: 0.75,
                }}>
                  <Typography sx={{ fontFamily: tokens.fonts.gaming, fontSize: '0.75rem', color: tokens.colors.text.primary }}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Typography>
                </Box>
              )}
              <KeyboardArrowUpIcon sx={{ fontSize: 20, color: tokens.colors.text.disabled, ml: 0.5 }} />
            </Box>
          ) : (
            /* Expanded Chat Window */
            <Box sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              borderRadius: `${tokens.radius.lg}px`,
              bgcolor: tokens.colors.background.elevated,
              border: `1px solid ${tokens.colors.border}`,
              boxShadow: '0 4px 32px rgba(0,0,0,0.3)',
            }}>
              {/* Stream Header - fixed height, click to minimize */}
              <Box
                onClick={() => setStreamMinimized(true)}
                sx={{
                  px: 2,
                  pt: 2,
                  pb: 1.5,
                  flexShrink: 0,
                  borderBottom: `1px solid ${tokens.colors.border}`,
                  cursor: 'pointer',
                  transition: 'background-color 150ms ease',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' },
                }}
              >
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
                        onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleRefresh(); }}
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
                        onClick={(e: React.MouseEvent) => { e.stopPropagation(); setStreamEnabled(prev => !prev); }}
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
                    <Tooltip title="Minimize" placement="bottom">
                      <Box
                        onClick={(e: React.MouseEvent) => { e.stopPropagation(); setStreamMinimized(true); }}
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
                        <KeyboardArrowDownIcon sx={{ fontSize: 18 }} />
                      </Box>
                    </Tooltip>
                  </Box>
                </Box>

              {/* NPC Avatar Row - who's in the room */}
              <Box sx={{
                mt: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
              }}>
              {participants.slice(0, 6).map((npc) => (
                <Box
                  key={npc.id}
                  component="a"
                  href={`/wiki/${npc.wikiSlug}`}
                  target="_blank"
                  rel="noopener noreferrer"
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
                    textDecoration: 'none',
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

              {/* Invite NPC button */}
              {availableToInvite.length > 0 && (
                <Box
                  onClick={() => setInviteModalOpen(true)}
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    bgcolor: tokens.colors.background.paper,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    ml: 0.5,
                    transition: 'all 150ms ease',
                    color: tokens.colors.text.disabled,
                    flexShrink: 0,
                    '&:hover': {
                      color: tokens.colors.success,
                      bgcolor: 'rgba(74, 222, 128, 0.15)',
                    },
                  }}
                >
                  <PersonAddIcon sx={{ fontSize: 16 }} />
                </Box>
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
              scrollbarWidth: 'thin',
              '&::-webkit-scrollbar': { width: 4 },
              '&::-webkit-scrollbar-thumb': { bgcolor: tokens.colors.border, borderRadius: 2 },
            }}
          >
            {/* Boot Sequence Display */}
            {bootPhase !== 'active' && bootPhase !== 'skeleton' && (
              <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                py: 6,
                overflow: 'visible',
              }}>
                {/* ASCII: Skull + WELCOME TO NEVER DIE GUY */}
                {bootPhase === 'ascii' && (
                  <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    overflow: 'visible',
                  }}>
                    {generateAsciiBoot().map((line, i) => (
                      <Typography
                        key={i}
                        sx={{
                          fontFamily: 'monospace',
                          fontSize: '0.75rem',
                          color: tokens.colors.primary,
                          letterSpacing: '0.01em',
                          lineHeight: 1.15,
                          whiteSpace: 'pre',
                          opacity: i < asciiRowsVisible ? 1 : 0,
                          transform: i < asciiRowsVisible ? 'translateY(0)' : 'translateY(-8px)',
                          transition: 'all 200ms ease-out',
                        }}
                      >
                        {line || '\u00A0'}
                      </Typography>
                    ))}
                  </Box>
                )}

                {/* Loading text */}
                {bootPhase !== 'ascii' && (
                  <Typography sx={{
                    fontFamily: 'monospace',
                    fontSize: '0.85rem',
                    color: tokens.colors.text.disabled,
                    letterSpacing: '0.05em',
                  }}>
                    {bootText}
                  </Typography>
                )}
              </Box>
            )}

            {/* Skeleton Loader for Chat Stream */}
            {bootPhase === 'skeleton' && (
              <Box sx={{ px: 2, py: 2 }}>
                {[85, 70, 90, 65].map((width, i) => (
                  <Box
                    key={i}
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 1.5,
                      mb: 2,
                      animation: `${pulse} 1.5s ease-in-out infinite`,
                      animationDelay: `${i * 200}ms`,
                    }}
                  >
                    {/* Avatar skeleton */}
                    <Box sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      bgcolor: tokens.colors.background.paper,
                      flexShrink: 0,
                    }} />
                    {/* Content skeleton */}
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{
                        width: 80,
                        height: 12,
                        borderRadius: 1,
                        bgcolor: tokens.colors.background.paper,
                        mb: 1,
                      }} />
                      <Box sx={{
                        width: `${width}%`,
                        height: 16,
                        borderRadius: 1,
                        bgcolor: tokens.colors.background.paper,
                      }} />
                    </Box>
                  </Box>
                ))}
              </Box>
            )}

            {/* Status Bar - Always rendered, content changes */}
            {bootPhase === 'active' && (
              <Box sx={{
                px: 2,
                py: 1,
                borderBottom: `1px solid ${tokens.colors.border}`,
                bgcolor: 'transparent',
                minHeight: 32, // Fixed height to prevent layout shift
                display: 'flex',
                alignItems: 'center',
              }}>
                {/* Paused Indicator */}
                <Typography sx={{
                  fontFamily: tokens.fonts.gaming,
                  fontSize: '0.75rem',
                  color: tokens.colors.text.disabled,
                  fontStyle: 'italic',
                  opacity: !streamEnabled ? 1 : 0,
                  position: !streamEnabled ? 'relative' : 'absolute',
                  pointerEvents: !streamEnabled ? 'auto' : 'none',
                  transition: 'opacity 150ms ease',
                }}>
                  Feed paused
                </Typography>

                {/* Typing Indicator */}
                <Typography sx={{
                  fontFamily: tokens.fonts.gaming,
                  fontSize: '0.75rem',
                  color: tokens.colors.text.disabled,
                  fontStyle: 'italic',
                  opacity: streamEnabled && isTyping ? 1 : 0,
                  position: streamEnabled && isTyping ? 'relative' : 'absolute',
                  pointerEvents: streamEnabled && isTyping ? 'auto' : 'none',
                  transition: 'opacity 150ms ease',
                }}>
                  {currentSpeaker.name} is typing...
                </Typography>

                {/* Active but not typing - subtle indicator */}
                <Typography sx={{
                  fontFamily: tokens.fonts.gaming,
                  fontSize: '0.75rem',
                  color: tokens.colors.text.disabled,
                  fontStyle: 'italic',
                  opacity: streamEnabled && !isTyping ? 0.5 : 0,
                  position: streamEnabled && !isTyping ? 'relative' : 'absolute',
                  pointerEvents: 'none',
                  transition: 'opacity 150ms ease',
                }}>
                  {participants.length} online
                </Typography>
              </Box>
            )}

            {/* Messages (newest first) - only show after boot */}
            {bootPhase === 'active' && messages.filter(m => m.text?.trim()).map((msg, i) => (
              <Box
                key={msg.id}
                sx={{
                  px: 2,
                  py: msg.type === 'quip' || msg.type === 'system' ? 0.5 : 1.5,
                  borderBottom: msg.type === 'quip' || msg.type === 'system' ? 'none' : `1px solid ${tokens.colors.border}`,
                  animation: i === 0 ? `${fadeIn} 200ms ease-out` : 'none',
                  bgcolor: msg.type === 'ad' ? 'rgba(74, 222, 128, 0.05)' : msg.type === 'answer' ? 'rgba(255,200,0,0.03)' : 'transparent',
                  '&:hover': { bgcolor: msg.type === 'ad' ? 'rgba(74, 222, 128, 0.08)' : msg.type === 'system' ? 'transparent' : tokens.colors.background.paper },
                }}
              >
                {/* Inline Ad */}
                {msg.type === 'ad' ? (
                  <Box
                    component="a"
                    href={msg.adLink || '/wiki'}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      // Mark Daily Wiki as clicked for cooldown
                      if (msg.id.startsWith('ad-daily-wiki')) {
                        markDailyWikiClicked();
                      }
                    }}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      textDecoration: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <Box
                      component="img"
                      src={msg.adImage}
                      alt={msg.speakerName}
                      sx={{ width: 36, height: 36, flexShrink: 0, objectFit: 'contain' }}
                    />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontFamily: tokens.fonts.gaming, fontSize: '0.8rem', color: tokens.colors.success }}>
                        {msg.speakerName}
                      </Typography>
                      <Typography sx={{ fontSize: '0.7rem', color: tokens.colors.success, opacity: 0.7 }}>
                        {msg.adSubtitle}
                      </Typography>
                    </Box>
                    <ChevronRightIcon sx={{ fontSize: 20, color: tokens.colors.success, flexShrink: 0 }} />
                  </Box>
                ) : msg.type === 'quip' ? (
                  /* Quip messages - compact, no avatar */
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
                ) : msg.type === 'system' ? (
                  /* System messages - join/leave notifications */
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}>
                    <Box
                      component="img"
                      src={msg.spriteKey}
                      alt={msg.speakerName}
                      sx={{
                        width: 20,
                        height: 20,
                        objectFit: 'contain',
                        imageRendering: 'pixelated',
                        opacity: 0.6,
                        borderRadius: '50%',
                      }}
                    />
                    <Typography sx={{
                      fontFamily: tokens.fonts.gaming,
                      fontSize: '0.7rem',
                      color: msg.text.includes('joined') ? tokens.colors.success : tokens.colors.text.disabled,
                      fontStyle: 'italic',
                    }}>
                      {msg.text}
                    </Typography>
                  </Box>
                ) : (
                  /* Regular NPC messages */
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                    <Box
                      component={msg.wikiSlug ? 'a' : 'div'}
                      href={msg.wikiSlug ? `/wiki/${msg.wikiSlug}` : undefined}
                      target={msg.wikiSlug ? '_blank' : undefined}
                      rel={msg.wikiSlug ? 'noopener noreferrer' : undefined}
                      sx={{ textDecoration: 'none' }}
                    >
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
                          cursor: msg.wikiSlug ? 'pointer' : 'default',
                          transition: 'transform 150ms ease',
                          '&:hover': msg.wikiSlug ? { transform: 'scale(1.05)' } : {},
                        }}
                      />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        component={msg.wikiSlug ? 'a' : 'span'}
                        href={msg.wikiSlug ? `/wiki/${msg.wikiSlug}` : undefined}
                        target={msg.wikiSlug ? '_blank' : undefined}
                        rel={msg.wikiSlug ? 'noopener noreferrer' : undefined}
                        sx={{
                          fontFamily: tokens.fonts.gaming,
                          fontSize: '0.7rem',
                          color: tokens.colors.text.disabled,
                          mb: 0.25,
                          display: 'block',
                          textDecoration: 'none',
                          cursor: msg.wikiSlug ? 'pointer' : 'default',
                          '&:hover': msg.wikiSlug ? { color: tokens.colors.text.secondary } : {},
                        }}
                      >
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
                        {renderMessageWithMentions(msg.text, playerAlias)}
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
        )}
        </Box>
      </Box>

      {/* Invite NPC Modal */}
      <Dialog
        open={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: tokens.colors.background.elevated,
            border: `1px solid ${tokens.colors.border}`,
            borderRadius: `${tokens.radius.lg}px`,
          },
        }}
      >
        <DialogTitle sx={{
          fontFamily: tokens.fonts.gaming,
          fontSize: '1.1rem',
          color: tokens.colors.text.primary,
          borderBottom: `1px solid ${tokens.colors.border}`,
          pb: 1.5,
        }}>
          Invite to Stream
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
            {availableToInvite.map((npc) => (
              <Box
                key={npc.id}
                onClick={() => handleInviteNpc(npc)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  px: 2.5,
                  py: 1.5,
                  cursor: 'pointer',
                  borderBottom: `1px solid ${tokens.colors.border}`,
                  transition: 'all 150ms ease',
                  '&:hover': {
                    bgcolor: tokens.colors.background.paper,
                  },
                  '&:last-child': { borderBottom: 'none' },
                }}
              >
                <Box
                  component="img"
                  src={npc.portrait || npc.sprite || '/assets/characters/placeholder.svg'}
                  alt={npc.name}
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    imageRendering: 'pixelated',
                    border: `2px solid ${tokens.colors.border}`,
                  }}
                />
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{
                    fontFamily: tokens.fonts.gaming,
                    fontSize: '0.95rem',
                    color: tokens.colors.text.primary,
                  }}>
                    {npc.name}
                  </Typography>
                  <Typography sx={{
                    fontSize: '0.7rem',
                    color: tokens.colors.text.disabled,
                    fontStyle: 'italic',
                  }}>
                    {npc.ambient?.[0]?.slice(0, 40)}...
                  </Typography>
                </Box>
                <PersonAddIcon sx={{ fontSize: 20, color: tokens.colors.text.disabled }} />
              </Box>
            ))}
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
