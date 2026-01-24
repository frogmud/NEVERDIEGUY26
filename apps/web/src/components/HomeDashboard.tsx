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
import { Box, Typography, keyframes, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CloseIcon from '@mui/icons-material/Close';
import ForumIcon from '@mui/icons-material/Forum';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useNavigate, useOutletContext, Link as RouterLink } from 'react-router-dom';
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
import { QUICK_PROMPTS, type QuickPrompt } from '../data/stream-prompts';

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
import { refineGreeting } from '@ndg/ai-engine/stream';
import { hasSavedRun, loadSavedRun, loadHeatData, getRunHistoryStats, loadCorruptionData, saveCorruptionData, addCorruption, resetCorruption, getRerollCorruptionCost, type CorruptionData } from '../data/player/storage';
import { generateLoadout, getItemImage, getItemName, generateItemStats, LOADOUT_ITEMS, type StartingLoadout, type SeededItemStats } from '../data/decrees';
import { createSeededRng } from '../data/pools/seededRng';
import { EASING, stagger } from '../utils/transitions';
import { useSoundContext } from '../contexts/SoundContext';

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

const pulseGlow = keyframes`
  0%, 100% { filter: drop-shadow(0 0 15px rgba(233, 4, 65, 0.5)); transform: scale(1); }
  50% { filter: drop-shadow(0 0 30px rgba(233, 4, 65, 0.8)); transform: scale(1.02); }
`;

const slideUp = keyframes`
  0% { transform: translateY(100%); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
`;

const corruptionGlitch = keyframes`
  0%, 100% { opacity: 0.3; transform: translate(0, 0); }
  20% { opacity: 0.5; transform: translate(-1px, 1px); }
  40% { opacity: 0.4; transform: translate(1px, -1px); }
  60% { opacity: 0.6; transform: translate(-1px, 0); }
  80% { opacity: 0.35; transform: translate(1px, 1px); }
`;

// Flickering artifact animation - random glitch stars
const artifactFlicker = keyframes`
  0%, 100% { opacity: 0; }
  10% { opacity: 0.8; }
  15% { opacity: 0; }
  25% { opacity: 0.6; }
  30% { opacity: 0; }
  50% { opacity: 0.9; }
  55% { opacity: 0.2; }
  70% { opacity: 0; }
  85% { opacity: 0.7; }
  90% { opacity: 0; }
`;

const slideDown = keyframes`
  0% { transform: translateY(-100%); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
`;

const popUp = keyframes`
  0% { transform: translateY(20px) scale(0.95); opacity: 0; }
  100% { transform: translateY(0) scale(1); opacity: 1; }
`;

// Balatro-style card entrance with dramatic entrance
const cardDeal = keyframes`
  0% {
    opacity: 0;
    transform: translateY(60px) scale(0.7) rotate(calc(var(--card-rotation, 0deg) * 3));
  }
  60% {
    opacity: 1;
    transform: translateY(-8px) scale(1.05) rotate(var(--card-rotation, 0deg));
  }
  80% {
    transform: translateY(4px) scale(0.98) rotate(calc(var(--card-rotation, 0deg) * 0.5));
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1) rotate(0deg);
  }
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

// Stream message slide-in with scale pop
const messageSlideIn = keyframes`
  0% {
    opacity: 0;
    transform: translateX(30px) scale(0.9);
  }
  50% {
    opacity: 1;
    transform: translateX(-4px) scale(1.03);
  }
  70% {
    transform: translateX(2px) scale(0.99);
  }
  100% {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
`;

// Chunky button wiggle on hover
const buttonWiggle = keyframes`
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-1deg); }
  75% { transform: rotate(1deg); }
`;

// Idle card wiggle - subtle continuous floating effect (Balatro-style)
const idleWiggle = keyframes`
  0%, 100% {
    transform: translateY(0) rotate(var(--base-rotation, 0deg));
  }
  25% {
    transform: translateY(-2px) rotate(calc(var(--base-rotation, 0deg) + 0.5deg));
  }
  50% {
    transform: translateY(-3px) rotate(calc(var(--base-rotation, 0deg) - 0.3deg));
  }
  75% {
    transform: translateY(-1px) rotate(calc(var(--base-rotation, 0deg) + 0.2deg));
  }
`;

// Items fly up from bottom - straight path to final position (planet selection style)
// Start at 10% opacity, reach full opacity mid-flight, lock into final position
// After animation completes, card physics (hover/drag/tilt) take over
const itemDropIn = keyframes`
  0% {
    opacity: 0.1;
    transform: translateY(120vh) scale(1.2);
  }
  50% {
    opacity: 0.8;
  }
  80% {
    opacity: 1;
    transform: translateY(20px) scale(1.05);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`;

// Boot sequence phases
// New sequence: skull-hero -> ui-reveal -> items-drop -> active
type BootPhase = 'slide' | 'skull-hero' | 'ui-reveal' | 'items-drop' | 'active' | 'launching';

/**
 * ASCII Skull - NDG skull dome logo with 3D shading
 * Light source from top-left: l,1 (bright) -> U,V,n (mid) -> C,E,@ (dark)
 */
const ASCII_SKULL = [
  '                 llllllllllllll                 ',
  '            ll111UUUUUUUUUUUU111ll             ',
  '         l1UUVVVVVVVVVVVVVVVVVVVVUUl1          ',
  '        1UVVnnnnnnnnnnnnnnnnnnnnnnVVU1         ',
  '       1UVnnnnnnnnnnnnnnnnnnnnnnnnnVU1        ',
  '    l1UVnnnnnnnnnnnnnnnnnnnnnnnnnnnnVU1l      ',
  '    1UVnnnnnnnnnnnnnnnnnnnnnnnnnnnnnVU1       ',
  'l1UUVnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnVUU1l   ',
  '1UVnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnVU1    ',
  'UVnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnVU   ',
  'VnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnV    ',
  'VnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnCV    ',
  'VnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnCV    ',
  'Vnnnnnnn          nnnnnn          nnnnnnnCV   ',
  'Cnnnnnn            nnnn            nnnnnnEC   ',
  'Cnnnnn             nnnn             nnnnnEC   ',
  'Ennnnn             nnnn             nnnnnCE   ',
  'CnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnEC   ',
  'EnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnCE    ',
  'CnnnnnnnnnnnnnnnnnnnCC  CCnnnnnnnnnnnnnnnEC   ',
  'EnnnnnnnnnnnnnnnnnnnCC  CCnnnnnnnnnnnnnnnCE   ',
  '    Ennnnnnnnnnnnnn        nnnnnnnnnnnnEC     ',
  '    CnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnEC      ',
  '        EnnnnnnnnnnnnnnnnnnnnnnnnnnnE         ',
  '        CnnnnnnnnnnnnnnnnnnnnnnnnnnnC         ',
  '        Ennn@@  nnnnnnnnnnnnn  @@nnnE         ',
  '        Cnnn@@  nnnnnnnnnnnnn  @@nnnC         ',
  '         Enn    nnnnnnnnnnnnn    nnE          ',
  '                 nnnn  nnnn                   ',
];

/**
 * Simple loading progress - replaces ASCII UI during boot
 */
const LOADING_STEPS = 8; // Total steps in the loading bar

// Placeholder for backwards compatibility (will be replaced with loading bar)
const ASCII_PROFILE: string[] = [];
const ASCII_BUTTONS: string[] = [];

// Pixel explosion - bigger splat with more spread
const pixelExplode = keyframes`
  0% {
    opacity: 1;
    transform: translate(0, 0) scale(1);
  }
  30% {
    opacity: 1;
    transform: translate(
      calc((var(--ex, 0) - 0.5) * 80px),
      calc((var(--ey, 0) - 0.3) * 60px)
    ) scale(1.5);
  }
  100% {
    opacity: 0;
    transform: translate(
      calc((var(--ex, 0) - 0.5) * 300px),
      calc((var(--ey, 0) - 0.3) * 350px + 150px)
    ) scale(0.3);
  }
`;

// ============================================
// Flickering Artifacts Component - glitchy red stars during loading
// ============================================

const ARTIFACT_CHARS = ['@', '.', '+', '*', 'x', ':', ';', '#', '%'];
const ARTIFACT_COUNT = 40;

function FlickeringArtifacts({ active }: { active: boolean }) {
  const artifacts = useMemo(() => {
    return Array.from({ length: ARTIFACT_COUNT }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      char: ARTIFACT_CHARS[Math.floor(Math.random() * ARTIFACT_CHARS.length)],
      delay: Math.random() * 3000,
      duration: 1500 + Math.random() * 2000,
      size: 0.5 + Math.random() * 0.5,
      opacity: 0.3 + Math.random() * 0.7,
    }));
  }, []);

  if (!active) return null;

  return (
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 5,
        overflow: 'hidden',
      }}
    >
      {artifacts.map((artifact) => (
        <Box
          key={artifact.id}
          sx={{
            position: 'absolute',
            left: `${artifact.x}%`,
            top: `${artifact.y}%`,
            fontFamily: 'monospace',
            fontSize: `${artifact.size}rem`,
            color: tokens.colors.primary,
            opacity: 0,
            animation: `${artifactFlicker} ${artifact.duration}ms ease-in-out ${artifact.delay}ms infinite`,
            textShadow: `0 0 4px ${tokens.colors.primary}, 0 0 8px ${tokens.colors.primary}50`,
            filter: 'blur(0.3px)',
          }}
        >
          {artifact.char}
        </Box>
      ))}
    </Box>
  );
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
// Interactive Item Card Component
// ============================================

interface ItemCardProps {
  itemSlug: string;
  itemName: string;
  itemStats: SeededItemStats;
  category: string;
  baseRotation: number;
  index: number;
  bootPhase: BootPhase;
}

function ItemCard({ itemSlug, itemName, itemStats, category, baseRotation, index, bootPhase }: ItemCardProps) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isPoked, setIsPoked] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);
  const tooltipTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Handle mouse move for physics-like tilt (disabled once tooltip shows for stability)
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || showTooltip) return; // Stop tilting once tooltip visible
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    // Tilt based on mouse position - stronger at edges
    const tiltX = (y - 0.5) * 15; // -7.5 to +7.5 degrees
    const tiltY = (x - 0.5) * -15; // -7.5 to +7.5 degrees (inverted for natural feel)
    setTilt({ x: tiltX, y: tiltY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setIsHovered(false);
    setShowTooltip(false);
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
    }
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    // Longer delay to let card fully settle before showing tooltip
    tooltipTimeoutRef.current = setTimeout(() => {
      setTilt({ x: 0, y: 0 }); // Reset tilt for stable tooltip
      setShowTooltip(true);
    }, 400);
  };

  // Handle mouse down for drag start
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y });
    // Clear tooltip on drag start
    setShowTooltip(false);
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
    }
  };

  // Handle mouse move for dragging with bounds
  useEffect(() => {
    if (!isDragging) return;

    const handleGlobalMouseMove = (e: MouseEvent) => {
      let newX = e.clientX - dragStart.x;
      let newY = e.clientY - dragStart.y;

      // Bounds: prevent dragging too far up (invisible wall at top)
      // Allow some movement up but not off screen
      const maxUp = -150; // Can't go more than 150px up from start
      const maxDown = 300; // Can go 300px down
      const maxHorizontal = 400; // Can go 400px left or right

      newX = Math.max(-maxHorizontal, Math.min(maxHorizontal, newX));
      newY = Math.max(maxUp, Math.min(maxDown, newY));

      setDragOffset({ x: newX, y: newY });
      // Dynamic tilt based on drag velocity/direction (clamped)
      setTilt({
        x: Math.max(-15, Math.min(15, newY * 0.05)),
        y: Math.max(-15, Math.min(15, newX * -0.05))
      });
    };

    const handleGlobalMouseUp = () => {
      setIsDragging(false);
      // Snap back with momentum feel
      setTilt({ x: 0, y: 0 });
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, dragStart]);

  // Handle click for "poke" effect (only if not dragging)
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // If we dragged, don't poke
    if (Math.abs(dragOffset.x) > 5 || Math.abs(dragOffset.y) > 5) return;
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    // Stronger tilt towards click point
    const pokeX = (y - 0.5) * 25;
    const pokeY = (x - 0.5) * -25;
    setTilt({ x: pokeX, y: pokeY });
    setIsPoked(true);
    // Bounce back
    setTimeout(() => {
      setTilt({ x: 0, y: 0 });
      setIsPoked(false);
    }, 150);
  };

  const isDropping = bootPhase === 'items-drop';
  const isActive = bootPhase === 'active';

  // Build transform string based on state
  // Note: Cards maintain horizontal spacing via flexbox gap, not translateX
  const getTransform = () => {
    const dragTranslate = `translate(${dragOffset.x}px, ${dragOffset.y}px)`;
    if (isDragging) {
      return `${dragTranslate} perspective(600px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(1.08)`;
    }
    if (showTooltip) {
      return `${dragTranslate} perspective(600px) rotateX(0deg) rotateY(0deg) translateY(-32px) scale(1.05)`;
    }
    if (isHovered || isPoked) {
      return `${dragTranslate} perspective(600px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateY(-24px) scale(1.03)`;
    }
    return `${dragTranslate} perspective(600px) rotateX(0deg) rotateY(0deg)`;
  };

  return (
    <Box
      ref={cardRef}
      onMouseMove={isDragging ? undefined : handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      sx={{
        width: 260,
        height: 360,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '16px',
        border: `2px solid ${isDragging ? tokens.colors.primary : isHovered ? itemStats.rarityColor : tokens.colors.border}`,
        bgcolor: tokens.colors.background.paper,
        overflow: 'visible',
        position: 'relative',
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        '--card-rotation': `${baseRotation}deg`,
        '--base-rotation': `${baseRotation}deg`,
        // Offset to center: left card (+), center (0), right card (-)
        // 260px card + 24px gap = 284px between card centers
        '--center-offset': `${(1 - index) * 284}px`,
        // Transform with tilt physics and drag offset
        transform: getTransform(),
        // Animation states - disabled when dragging or has been dragged
        animation: isDragging || (dragOffset.x !== 0 || dragOffset.y !== 0)
          ? 'none'
          : isDropping
          ? `${itemDropIn} 900ms ease-out ${index * 50}ms both`
          : isActive && !isHovered
          ? `${idleWiggle} ${3 + index * 0.5}s ease-in-out infinite ${index * 0.3}s`
          : 'none',
        transition: isDragging
          ? 'border-color 100ms ease, box-shadow 100ms ease'
          : isPoked
          ? 'transform 100ms ease-out, border-color 200ms ease, box-shadow 200ms ease'
          : 'transform 200ms ease-out, border-color 200ms ease, box-shadow 200ms ease',
        boxShadow: isDragging
          ? `0 20px 50px rgba(0,0,0,0.5), 0 0 30px ${tokens.colors.primary}40`
          : isHovered
          ? `0 12px 32px rgba(0,0,0,0.4), 0 0 20px ${itemStats.rarityColor}40`
          : '0 4px 12px rgba(0,0,0,0.2)',
        zIndex: isDragging ? 100 : 'auto',
        '&::before': itemStats.edition ? {
          content: '""',
          position: 'absolute',
          inset: -2,
          borderRadius: '18px',
          background: itemStats.edition === 'Holographic'
            ? 'linear-gradient(45deg, #ff000040, #00ff0040, #0000ff40, #ff000040)'
            : itemStats.edition === 'Foil'
            ? 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 50%, rgba(255,255,255,0.2) 100%)'
            : itemStats.edition === 'Polychrome'
            ? 'conic-gradient(from 0deg, #ff000030, #ffff0030, #00ff0030, #00ffff30, #0000ff30, #ff00ff30, #ff000030)'
            : 'none',
          zIndex: -1,
          animation: itemStats.edition === 'Holographic' ? `${pulse} 2s ease-in-out infinite` : 'none',
        } : {},
      }}
    >
      {/* Edition Badge */}
      {itemStats.edition && (
        <Box sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          px: 1,
          py: 0.25,
          borderRadius: '8px',
          bgcolor: 'rgba(0,0,0,0.7)',
          border: '1px solid rgba(255,255,255,0.2)',
          zIndex: 10,
        }}>
          <Typography sx={{
            fontFamily: tokens.fonts.gaming,
            fontSize: '0.65rem',
            color: '#fff',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}>
            {itemStats.edition}
          </Typography>
        </Box>
      )}

      {/* Grid Pattern Background */}
      <Box sx={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
        `,
        backgroundSize: '20px 20px',
        position: 'relative',
        borderRadius: '14px 14px 0 0',
        overflow: 'hidden',
      }}>
        {/* Item Sprite with layered shadow for depth */}
        <Box
          component="img"
          src={getItemImage(itemSlug)}
          alt={itemSlug}
          sx={{
            width: 120,
            height: 120,
            objectFit: 'contain',
            imageRendering: 'pixelated',
            filter: `
              drop-shadow(0 2px 2px rgba(0,0,0,0.2))
              drop-shadow(0 4px 6px rgba(0,0,0,0.25))
              drop-shadow(0 8px 16px rgba(0,0,0,0.3))
            `,
            transition: 'transform 150ms ease, filter 150ms ease',
            transform: isHovered ? 'scale(1.1) translateY(-4px)' : 'scale(1)',
          }}
        />
      </Box>

      {/* Item Label - Bottom */}
      <Box sx={{
        px: 2,
        py: 1.5,
        borderTop: `1px solid ${tokens.colors.border}`,
        bgcolor: tokens.colors.background.elevated,
        borderRadius: '0 0 14px 14px',
      }}>
        <Typography sx={{
          fontFamily: tokens.fonts.gaming,
          fontSize: '0.9rem',
          color: tokens.colors.text.primary,
          textAlign: 'center',
          lineHeight: 1.2,
        }}>
          {itemName}
        </Typography>
        {/* Rarity + Category */}
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, mt: 0.5 }}>
          <Typography sx={{
            fontSize: '0.7rem',
            color: itemStats.rarityColor,
            fontWeight: 600,
            textTransform: 'capitalize',
          }}>
            {itemStats.rarity}
          </Typography>
          <Typography sx={{ fontSize: '0.65rem', color: tokens.colors.text.disabled }}>
            {category}
          </Typography>
        </Box>
      </Box>

      {/* Hover Tooltip - positioned below card to avoid top cutoff */}
      {showTooltip && (
        <Box sx={{
          position: 'absolute',
          top: 'calc(100% + 16px)',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 260,
          bgcolor: tokens.colors.background.paper,
          border: `2px solid ${itemStats.rarityColor}`,
          borderRadius: '12px',
          p: 2,
          zIndex: 9999, // Above toolbar and everything
          boxShadow: `0 8px 32px rgba(0,0,0,0.6), 0 0 20px ${itemStats.rarityColor}40`,
          pointerEvents: 'none', // Don't interfere with card hover
        }}>
          {/* Edition Badge if special */}
          {itemStats.edition && (
            <Box sx={{
              display: 'inline-block',
              px: 1,
              py: 0.25,
              mb: 1.5,
              borderRadius: '6px',
              bgcolor: `${itemStats.rarityColor}20`,
              border: `1px solid ${itemStats.rarityColor}`,
            }}>
              <Typography sx={{
                fontFamily: tokens.fonts.gaming,
                fontSize: '0.65rem',
                color: itemStats.rarityColor,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                {itemStats.edition} Edition
              </Typography>
            </Box>
          )}

          {/* Buffs - Loot Table Style */}
          <Box sx={{ mb: 1.5 }}>
            {itemStats.buffs.map((buff, bi) => (
              <Box key={bi} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}>
                <Box sx={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  bgcolor: itemStats.rarityColor,
                  flexShrink: 0,
                }} />
                <Typography sx={{ fontSize: '0.85rem', color: tokens.colors.text.secondary }}>
                  +{buff.value}{buff.isPercent ? '%' : ''} {buff.stat.charAt(0).toUpperCase() + buff.stat.slice(1)}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Category Info */}
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            py: 1,
            mb: 1,
            borderTop: `1px solid ${tokens.colors.border}`,
            borderBottom: `1px solid ${tokens.colors.border}`,
          }}>
            <Typography sx={{ fontSize: '0.7rem', color: tokens.colors.text.disabled, textTransform: 'uppercase' }}>
              {category}
            </Typography>
            <Typography sx={{ fontSize: '0.7rem', color: itemStats.rarityColor, fontWeight: 600 }}>
              Tier {itemStats.rarity === 'legendary' ? 5 : itemStats.rarity === 'epic' ? 4 : itemStats.rarity === 'rare' ? 3 : itemStats.rarity === 'uncommon' ? 2 : 1}
            </Typography>
          </Box>

          {/* Flavor Text */}
          <Typography sx={{
            fontSize: '0.75rem',
            color: tokens.colors.text.disabled,
            fontStyle: 'italic',
            lineHeight: 1.4,
          }}>
            "{itemStats.flavorText}"
          </Typography>

          {/* Tooltip Arrow - points up since tooltip is below card */}
          <Box sx={{
            position: 'absolute',
            top: -8,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 0,
            height: 0,
            borderLeft: '8px solid transparent',
            borderRight: '8px solid transparent',
            borderBottom: `8px solid ${itemStats.rarityColor}`,
          }} />
        </Box>
      )}
    </Box>
  );
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
 * Apply multi-pass refinement to make greetings unique.
 * Uses local transformations with caching to avoid repetition.
 */
function refineMessage(npcId: string, message: string): string {
  // Skip refinement for very short messages or fallbacks
  if (!message || message.length < 10 || message === '...') {
    return message;
  }

  try {
    const result = refineGreeting(npcId, message, {
      passes: 5,
      temperature: 0.7,
    });
    return result.refined;
  } catch {
    // Fallback to original on error
    return message;
  }
}

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
  const { sidebarExpanded } = useOutletContext<ShellContext>();
  const { playUIClick } = useSoundContext();
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
    const rawGreeting = getRandomGreeting(greeter);
    const initialMsg = createNPCMessage(greeter, refineMessage(greeter.id, rawGreeting));
    return initialMsg ? [initialMsg] : [];
  });

  const [currentSpeaker, setCurrentSpeaker] = useState<HomeGreeter>(greeter);
  const [isTyping, setIsTyping] = useState(false);
  const [typingText, setTypingText] = useState('');
  const [fullTypingText, setFullTypingText] = useState('');
  const [ambientIndex, setAmbientIndex] = useState(0);

  // Boot sequence state - skip ASCII skull, start at UI reveal (sidebar slides in)
  const [bootPhase, setBootPhase] = useState<BootPhase>('ui-reveal');
  const [asciiRowsVisible, setAsciiRowsVisible] = useState(0);
  const [uiAsciiRowsVisible, setUiAsciiRowsVisible] = useState(0);

  // Player alias based on seed (for NPC mentions)
  const playerAlias = useMemo(() => generatePlayerAlias(currentLoadout.seed), [currentLoadout.seed]);

  // Multi-NPC typing indicators (Slack-style)
  const [typingNpcs, setTypingNpcs] = useState<string[]>([]);

  // Stream visibility (can be hidden by user)
  const [streamEnabled, setStreamEnabled] = useState(true);

  // Stream popover state (dropdown from icon instead of bottom rail)
  const [streamAnchorEl, setStreamAnchorEl] = useState<HTMLElement | null>(null);
  const streamOpen = Boolean(streamAnchorEl);

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

  // Load heat data (streak progress)
  const heatData = useMemo(() => loadHeatData(), []);

  // Load lifetime stats for earnings display
  const lifetimeStats = useMemo(() => getRunHistoryStats(), []);

  // Corruption state - tracks how corrupted the current Guy is
  const [corruptionData, setCorruptionData] = useState<CorruptionData>(() => loadCorruptionData());
  const [rerollCount, setRerollCount] = useState(0);
  const [seedRefreshDialogOpen, setSeedRefreshDialogOpen] = useState(false);

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
  // Reroll Handler - Same Guy, but asks Die-rectors for better loadout (causes corruption)
  // ============================================

  const handleReroll = () => {
    // Guard: Can't reroll at max corruption
    if (corruptionData.level >= 100) return;
    playUIClick();

    // Calculate corruption cost based on reroll count
    const corruptionCost = getRerollCorruptionCost(rerollCount);

    // Add corruption (Die-rectors notice your desperation)
    const newCorruptionData = addCorruption(corruptionData, corruptionCost);
    setCorruptionData(newCorruptionData);
    saveCorruptionData(newCorruptionData);

    // Increment reroll count for escalating costs
    setRerollCount(prev => prev + 1);

    // Pick a random NPC to lead the stream (from preloaded cache)
    const validNpcs = getValidNpcs();
    const newNpcId = validNpcs[Math.floor(Math.random() * validNpcs.length)]?.id || 'mr-kevin';
    setSelectedNpcId(newNpcId);

    // Generate new loadout with new seed (always Earth) - same Guy, different roll
    const newLoadout = generateLoadout(newNpcId, selectedDomain);
    setCurrentLoadout(newLoadout);

    // Quick item swap - just replay the items-drop animation, no full loading screen
    // This keeps the UI responsive and only swaps the cards
    setBootPhase('items-drop');
    setTimeout(() => setBootPhase('active'), 1100);

    // Shuffle NPCs from preloaded cache - visitors through eternity
    const shuffledNpcs = [...validNpcs].sort(() => Math.random() - 0.5);
    const newParticipants = shuffledNpcs.slice(0, 6);
    setParticipants(newParticipants);

    // Reset conversation state
    const domainSlug = getDomainSlugFromId(selectedDomain);
    setConversationState(createMultiNPCConversation(newParticipants.map(p => p.id), domainSlug, null));
  };

  // ============================================
  // Seed Refresh Handler - Creates a NEW Guy instance (resets corruption)
  // ============================================

  const handleSeedRefresh = () => {
    playUIClick();
    setSeedRefreshDialogOpen(false);

    // Reset corruption - new Guy, clean slate
    const freshCorruption = resetCorruption();
    setCorruptionData(freshCorruption);
    setRerollCount(0);

    // Pick a random NPC to lead the stream
    const validNpcs = getValidNpcs();
    const newNpcId = validNpcs[Math.floor(Math.random() * validNpcs.length)]?.id || 'mr-kevin';
    setSelectedNpcId(newNpcId);

    // Generate new loadout with new seed - entirely new Guy
    const newLoadout = generateLoadout(newNpcId, selectedDomain);
    setCurrentLoadout(newLoadout);

    // Reset boot sequence
    setBootPhase('slide');
    setAsciiRowsVisible(0);
    setMessages([]);
    setAmbientIndex(0);
    setIsTyping(false);

    // Shuffle NPCs
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
    // Boot sequence timing - ASCII skull loads -> UI slides in -> items drop, skull explodes
    // ASCII: 29 rows × 25ms = 725ms, then hold to admire
    const timings: Record<BootPhase, { next: BootPhase | null; delay: number }> = {
      slide: { next: 'skull-hero', delay: 100 },           // Brief setup
      'skull-hero': { next: 'ui-reveal', delay: 1800 },    // ASCII loads (725ms) + nice hold (~1s)
      'ui-reveal': { next: 'items-drop', delay: 600 },     // Top rail + stream slide in
      'items-drop': { next: 'active', delay: 1100 },       // Items drop centered, skull explodes, cards spread
      active: { next: null, delay: 0 },
      launching: { next: null, delay: 0 },                  // Launching state (handled by handlePlay)
    };
    // Total: 100 + 1800 + 600 + 900 = 3400ms

    const current = timings[bootPhase];
    if (!current.next) return;

    const timer = setTimeout(() => {
      if (current.next) {
        setBootPhase(current.next);
      }
    }, current.delay);

    return () => clearTimeout(timer);
  }, [bootPhase, currentLoadout.seed]);

  // ============================================
  // ASCII Skull Row-by-Row Reveal
  // ============================================

  useEffect(() => {
    // Keep drawing skull during skull-hero AND ui-reveal phases
    if (bootPhase !== 'skull-hero' && bootPhase !== 'ui-reveal') return;

    if (asciiRowsVisible < ASCII_SKULL.length) {
      const timer = setTimeout(() => {
        setAsciiRowsVisible(prev => prev + 1);
      }, 12); // 12ms per row = ~350ms for 29 rows (super fast!)
      return () => clearTimeout(timer);
    }
  }, [bootPhase, asciiRowsVisible]);

  // ============================================
  // ASCII UI Elements Row-by-Row Reveal (profile + buttons)
  // ============================================

  useEffect(() => {
    if (bootPhase !== 'skull-hero' && bootPhase !== 'ui-reveal') return;

    const totalUiRows = ASCII_PROFILE.length + ASCII_BUTTONS.length;
    if (uiAsciiRowsVisible < totalUiRows) {
      const timer = setTimeout(() => {
        setUiAsciiRowsVisible(prev => prev + 1);
      }, 20); // Slightly slower than skull for staggered feel
      return () => clearTimeout(timer);
    }
  }, [bootPhase, uiAsciiRowsVisible]);

  // ============================================
  // Pre-warm NPC Conversation (during skull-hero phase)
  // ============================================

  useEffect(() => {
    if (bootPhase !== 'skull-hero') return;

    // Pre-generate messages while skull is showing
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
      const rawMsgText = speakerAmbient[Math.floor(Math.random() * speakerAmbient.length)];

      // Skip if blank
      if (!rawMsgText?.trim()) continue;

      // Apply multi-pass refinement for uniqueness
      const refinedText = refineMessage(speaker.id, rawMsgText);
      const msg = createNPCMessage(speaker, refinedText);
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
          // Fallback to ambient - will be refined later
          const rawAmbient = nextSpeaker.ambient?.[ambientIndex % (nextSpeaker.ambient?.length || 1)] || FALLBACK_AMBIENT[ambientIndex % FALLBACK_AMBIENT.length];
          nextMessage = rawAmbient;
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

      // Apply multi-pass refinement for uniqueness
      const refinedMessage = refineMessage(nextSpeaker.id, nextMessage);

      // Start typing
      setCurrentSpeaker(nextSpeaker);
      setFullTypingText(refinedMessage);
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

    // If closed and we have new messages, increment unread
    if (!streamOpen && newMessages > 0) {
      setUnreadCount(prev => prev + newMessages);
    }

    // Update the ref
    lastMessageCountRef.current = currentCount;
  }, [messages.length, streamOpen, bootPhase]);

  // Clear unread when opened
  useEffect(() => {
    if (streamOpen) {
      setUnreadCount(0);
    }
  }, [streamOpen]);

  // ============================================
  // Actions
  // ============================================

  const handlePlay = () => {
    playUIClick();
    // Show launching skull animation
    setBootPhase('launching');

    // Quick launch: skip zone selection and go straight to combat
    sessionStorage.setItem('ndg-starting-loadout', JSON.stringify({
      ...currentLoadout,
      quickLaunch: true,
    }));

    // Brief delay to show skull, then navigate
    setTimeout(() => {
      navigate('/play');
    }, 600);
  };

  const handleQuickPrompt = (prompt: QuickPrompt) => {
    // Inject player question into stream
    const playerQuestion: StreamMessage = {
      id: `question-${Date.now()}`,
      speakerId: 'player',
      speakerName: playerAlias,
      spriteKey: '/assets/ui/token.svg',
      text: prompt.text,
      type: 'system',
      timestamp: Date.now(),
    };
    setMessages(prev => [playerQuestion, ...prev]);

    // Get NPCs who should respond (filter to only those in the room)
    const responderNpcs = participants.filter(p => prompt.responders.includes(p.id));

    // If no responders in room, pick random NPCs from the responder list
    const actualResponders = responderNpcs.length > 0
      ? responderNpcs.slice(0, 1 + Math.floor(Math.random() * 2)) // 1-3 responders
      : participants.slice(0, 1 + Math.floor(Math.random() * 2));

    // Stagger NPC responses
    actualResponders.forEach((npc, idx) => {
      setTimeout(() => {
        // Get response from questionResponses or fallback to ambient
        const responses = npc.questionResponses?.[prompt.id];
        const responseText = responses && responses.length > 0
          ? responses[Math.floor(Math.random() * responses.length)]
          : npc.ambient?.[Math.floor(Math.random() * (npc.ambient?.length || 1))] || '...';

        const answerMsg = createNPCMessage(npc, responseText);
        if (answerMsg) {
          answerMsg.type = 'answer';
          setMessages(prev => [answerMsg, ...prev]);
        }
      }, 800 + idx * 1200 + Math.random() * 800);
    });
  };

  // ============================================
  // Render
  // ============================================


  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh', // Full viewport since top bar removed on desktop
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Top: Player Identity + Badges */}
      <Box sx={{ position: 'relative', px: sidebarExpanded ? 2 : 3, pt: 2, pb: 0, transition: 'padding 200ms ease' }}>
        {/* Profile - fades in during ui-reveal */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          // Fade in during ui-reveal phase
          opacity: bootPhase === 'slide' || bootPhase === 'skull-hero' ? 0 : 1,
          transform: bootPhase === 'slide' || bootPhase === 'skull-hero' ? 'translateY(-10px)' : 'translateY(0)',
          transition: 'opacity 400ms ease-out, transform 400ms ease-out',
        }}>
          {/* Left: Avatar + Username */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Avatar - NDG sprite cropped at shoulders with corruption overlay */}
            <Tooltip title={corruptionData.level > 0 ? `Corruption: ${corruptionData.level}%` : 'Pure'} placement="bottom">
              <Box sx={{
                position: 'relative',
                width: 56,
                height: 56,
                borderRadius: `${tokens.radius.md}px`,
                border: `2px solid ${corruptionData.level > 40 ? '#9333ea' : tokens.colors.border}`,
                overflow: 'hidden',
                flexShrink: 0,
                transition: 'border-color 300ms ease',
              }}>
                <Box
                  component="img"
                  src="/assets/characters/travelers/sprite-never-die-guy-1.png"
                  alt="player"
                  sx={{
                    width: '140%',
                    height: '140%',
                    objectFit: 'cover',
                    objectPosition: 'top center',
                    imageRendering: 'pixelated',
                    marginLeft: '-20%',
                  }}
                />
                {/* Corruption overlay - purple glitch effect */}
                {corruptionData.level > 0 && (
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      background: `linear-gradient(135deg, rgba(147, 51, 234, ${corruptionData.level / 200}) 0%, rgba(88, 28, 135, ${corruptionData.level / 150}) 100%)`,
                      mixBlendMode: 'overlay',
                      animation: corruptionData.level > 60 ? `${corruptionGlitch} 2s ease-in-out infinite` : 'none',
                      pointerEvents: 'none',
                    }}
                  />
                )}
                {/* High corruption - additional glitch lines */}
                {corruptionData.level > 60 && (
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(147, 51, 234, 0.1) 2px, rgba(147, 51, 234, 0.1) 4px)',
                      pointerEvents: 'none',
                      opacity: (corruptionData.level - 60) / 40,
                    }}
                  />
                )}
              </Box>
            </Tooltip>
            {/* Username + Badges */}
            <Box
              onClick={() => navigate('/profile')}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                cursor: 'pointer',
                '&:hover': {
                  opacity: 0.8,
                },
              }}
            >
              {/* Show loading state during boot, then reveal name */}
              {bootPhase === 'ui-reveal' ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Typography sx={{
                    fontFamily: tokens.fonts.gaming,
                    fontSize: '1.1rem',
                    color: tokens.colors.text.disabled,
                  }}>
                    @guy_
                  </Typography>
                  <Typography sx={{
                    fontFamily: tokens.fonts.gaming,
                    fontSize: '1.1rem',
                    color: tokens.colors.text.disabled,
                    animation: `${pulse} 600ms ease-in-out infinite`,
                  }}>
                    ....
                  </Typography>
                </Box>
              ) : (
                <Typography sx={{
                  fontFamily: tokens.fonts.gaming,
                  fontSize: '1.1rem',
                  color: tokens.colors.text.secondary,
                }}>
                  @guy_{currentLoadout.seed}
                </Typography>
              )}
              {/* Globe badge */}
              <Typography component="span" sx={{ fontSize: '1.1rem' }}>
                🌍
              </Typography>
              {/* Star badge */}
              <Typography component="span" sx={{ fontSize: '1.1rem' }}>
                ⭐
              </Typography>
            </Box>
          </Box>

          {/* Right: Stream + DM Icons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Eternal Stream Icon */}
            <Tooltip title="Eternal Stream" placement="bottom">
              <Box
                onClick={(e) => setStreamAnchorEl(streamAnchorEl ? null : e.currentTarget)}
                sx={{
                  position: 'relative',
                  width: 40,
                  height: 40,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '12px',
                  bgcolor: streamOpen ? tokens.colors.background.paper : 'transparent',
                  border: `1px solid ${streamOpen ? tokens.colors.border : 'transparent'}`,
                  cursor: 'pointer',
                  transition: 'all 150ms ease',
                  '&:hover': {
                    bgcolor: tokens.colors.background.paper,
                    border: `1px solid ${tokens.colors.border}`,
                  },
                }}
              >
                <ForumIcon sx={{ fontSize: 22, color: streamOpen ? tokens.colors.primary : tokens.colors.text.secondary }} />
                {/* Unread Badge */}
                {unreadCount > 0 && !streamOpen && (
                  <Box sx={{
                    position: 'absolute',
                    top: -4,
                    right: -4,
                    minWidth: 18,
                    height: 18,
                    borderRadius: '9px',
                    bgcolor: tokens.colors.primary,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    px: 0.5,
                  }}>
                    <Typography sx={{ fontFamily: tokens.fonts.gaming, fontSize: '0.65rem', color: tokens.colors.text.primary }}>
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Tooltip>

          </Box>
        </Box>
      </Box>

      {/* Main Content Area - 2 Column Layout */}
      <Box sx={{
        flex: 1,
        display: 'flex',
        overflow: 'hidden',
        minHeight: 0,
        position: 'relative',
        px: sidebarExpanded ? 2 : 3,
        py: 2,
        gap: sidebarExpanded ? 2 : 4,
        transition: 'padding 200ms ease, gap 200ms ease',
      }}>
        {/* Left Column - Action Buttons */}
        <Box sx={{ position: 'relative', width: sidebarExpanded ? 240 : 260, flexShrink: 0, transition: 'width 200ms ease' }}>
          {/* Lifetime Earnings */}
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2.5,
            mb: 4,
            // Fade in during ui-reveal phase
            opacity: bootPhase === 'slide' || bootPhase === 'skull-hero' ? 0 : 1,
            transform: bootPhase === 'slide' || bootPhase === 'skull-hero' ? 'translateX(-20px)' : 'translateX(0)',
            transition: 'opacity 400ms ease-out, transform 400ms ease-out',
          }}>
            {/* Coin icon - larger */}
            <Box
              component="img"
              src="/assets/ui/token.svg"
              alt=""
              sx={{
                width: 100,
                height: 100,
                imageRendering: 'pixelated',
              }}
            />
            <Box>
              <Typography sx={{
                fontSize: '0.9rem',
                color: tokens.colors.text.secondary,
                mb: 0.5,
              }}>
                Lifetime Earnings
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                <Typography sx={{
                  fontFamily: tokens.fonts.gaming,
                  fontSize: '3rem',
                  color: tokens.colors.text.primary,
                  lineHeight: 1,
                }}>
                  {lifetimeStats.totalGoldEarned >= 1000000
                    ? `${(lifetimeStats.totalGoldEarned / 1000000).toFixed(1)}m`
                    : lifetimeStats.totalGoldEarned >= 1000
                    ? `${(lifetimeStats.totalGoldEarned / 1000).toFixed(1)}k`
                    : lifetimeStats.totalGoldEarned.toLocaleString()}
                </Typography>
                {/* Fire streak indicator if active */}
                {heatData.currentHeat > 0 && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                    <Box
                      component="img"
                      src="/icons/fire.svg"
                      alt=""
                      sx={{ width: 20, height: 20 }}
                    />
                    <Typography sx={{
                      fontFamily: tokens.fonts.gaming,
                      fontSize: '1rem',
                      color: tokens.colors.primary,
                    }}>
                      {heatData.currentHeat}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>

          {/* Real Buttons - staggered fade in */}
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}>
          {/* New Run Button - Primary Pink */}
          <Box
            onClick={bootPhase === 'active' ? handlePlay : undefined}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              py: 2.5,
              borderRadius: '16px',
              bgcolor: tokens.colors.primary,
              cursor: bootPhase === 'active' ? 'pointer' : 'default',
              // Staggered fade in - 100ms delay
              opacity: bootPhase === 'slide' || bootPhase === 'skull-hero' ? 0 : 1,
              transform: bootPhase === 'slide' || bootPhase === 'skull-hero' ? 'translateY(20px)' : 'translateY(0)',
              transition: `opacity 300ms ease-out 100ms, transform 300ms ease-out 100ms, filter 150ms ease, box-shadow 150ms ease`,
              boxShadow: `0 4px 16px rgba(233, 4, 65, 0.4)`,
              '&:hover': bootPhase === 'active' ? {
                filter: 'brightness(1.15)',
                transform: 'scale(1.03) translateY(-2px)',
                boxShadow: `0 8px 24px rgba(233, 4, 65, 0.5)`,
              } : {},
              '&:active': bootPhase === 'active' ? {
                transform: 'scale(0.98)',
              } : {},
            }}
          >
            <Typography sx={{
              fontFamily: tokens.fonts.gaming,
              fontSize: '1.5rem',
              color: tokens.colors.text.primary,
            }}>
              Die
            </Typography>
          </Box>

          {/* Reroll Button - Warning/Gold with corruption cost subtitle */}
          <Box
            onClick={handleReroll}
            sx={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 2,
              borderRadius: '16px',
              bgcolor: tokens.colors.warning,
              cursor: corruptionData.level >= 100 ? 'default' : 'pointer',
              // Staggered fade in - 200ms delay (base opacity affected by corruption)
              opacity: bootPhase === 'slide' || bootPhase === 'skull-hero' ? 0 : (corruptionData.level >= 100 ? 0.6 : 1),
              transform: bootPhase === 'slide' || bootPhase === 'skull-hero' ? 'translateY(20px)' : 'translateY(0)',
              transition: `opacity 300ms ease-out 200ms, transform 300ms ease-out 200ms, filter 150ms ease, box-shadow 150ms ease`,
              boxShadow: `0 4px 16px rgba(234, 179, 8, 0.3)`,
              '&:hover': corruptionData.level < 100 ? {
                filter: 'brightness(1.1)',
                transform: 'scale(1.03) translateY(-2px)',
                boxShadow: `0 8px 24px rgba(234, 179, 8, 0.4)`,
              } : {},
              '&:active': corruptionData.level < 100 ? {
                transform: 'scale(0.98)',
              } : {},
            }}
          >
            <Typography sx={{
              fontFamily: tokens.fonts.gaming,
              fontSize: '1.5rem',
              color: tokens.colors.background.default,
            }}>
              Reroll
            </Typography>
            {/* Corruption cost subtitle */}
            <Typography sx={{
              fontFamily: tokens.fonts.gaming,
              fontSize: '0.75rem',
              color: 'rgba(0, 0, 0, 0.6)',
              mt: 0.25,
            }}>
              {corruptionData.level >= 100 ? 'MAX CORRUPTION' : `+${getRerollCorruptionCost(rerollCount)}% corruption`}
            </Typography>

            {/* Reroll stack sprite - only shows when stacked */}
            {rerollCount > 0 && (
              <Box sx={{
                position: 'absolute',
                right: -36,
                top: '50%',
                transform: 'translateY(-50%)',
              }}>
                <Box
                  component="img"
                  src="/assets/factions/faction-icon-void-seekers.svg"
                  alt="Reroll stacks"
                  sx={{
                    width: 64,
                    height: 64,
                    filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.5))',
                  }}
                />
                {/* Stack count bubble */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: -4,
                    right: -8,
                    minWidth: 24,
                    height: 24,
                    borderRadius: '12px',
                    bgcolor: '#9333ea',
                    border: '2px solid rgba(255,255,255,0.9)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    px: 0.75,
                    boxShadow: '0 0 12px rgba(147, 51, 234, 0.6)',
                  }}
                >
                  <Typography sx={{
                    fontFamily: tokens.fonts.gaming,
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: '#fff',
                    lineHeight: 1,
                  }}>
                    x{rerollCount}
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>

          {/* Continue Button - Disabled Gray (or active if saved run exists) */}
          <Box
            onClick={savedRun ? () => { playUIClick(); navigate('/play?continue=true'); } : undefined}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: savedRun ? 1.5 : 2.5,
              borderRadius: '16px',
              bgcolor: savedRun ? tokens.colors.background.elevated : tokens.colors.background.paper,
              border: `2px solid ${savedRun ? tokens.colors.border : 'transparent'}`,
              cursor: savedRun ? 'pointer' : 'default',
              // Staggered fade in - 300ms delay (base opacity affected by savedRun)
              opacity: bootPhase === 'slide' || bootPhase === 'skull-hero' ? 0 : (savedRun ? 1 : 0.5),
              transform: bootPhase === 'slide' || bootPhase === 'skull-hero' ? 'translateY(20px)' : 'translateY(0)',
              transition: `opacity 300ms ease-out 300ms, transform 300ms ease-out 300ms, background-color 150ms ease`,
              '&:hover': savedRun ? {
                bgcolor: tokens.colors.background.elevated,
                transform: 'scale(1.02)',
              } : {},
            }}
          >
            <Typography sx={{
              fontFamily: tokens.fonts.gaming,
              fontSize: '1.5rem',
              color: savedRun ? tokens.colors.text.primary : tokens.colors.text.disabled,
            }}>
              Continue
            </Typography>
            {savedRun && (
              <Typography sx={{
                fontFamily: tokens.fonts.mono,
                fontSize: '0.7rem',
                color: tokens.colors.text.secondary,
                mt: 0.25,
              }}>
                {savedRun.domainState?.name || `Domain ${savedRun.currentDomain}`} - Room {savedRun.roomNumber}
              </Typography>
            )}
          </Box>

          {/* Race Button - Multiplayer mode */}
          <Box
            onClick={() => { playUIClick(); navigate('/play/multiplayer'); }}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 2.5,
              borderRadius: '16px',
              bgcolor: tokens.colors.background.elevated,
              border: `2px solid ${tokens.colors.border}`,
              cursor: 'pointer',
              // Staggered fade in - 350ms delay
              opacity: bootPhase === 'slide' || bootPhase === 'skull-hero' ? 0 : 1,
              transform: bootPhase === 'slide' || bootPhase === 'skull-hero' ? 'translateY(20px)' : 'translateY(0)',
              transition: `opacity 300ms ease-out 350ms, transform 300ms ease-out 350ms, background-color 150ms ease`,
              '&:hover': {
                bgcolor: tokens.colors.background.elevated,
                transform: 'scale(1.02)',
                borderColor: tokens.colors.primary,
              },
            }}
          >
            <Typography sx={{
              fontFamily: tokens.fonts.gaming,
              fontSize: '1.5rem',
              color: tokens.colors.text.primary,
            }}>
              Race
            </Typography>
            <Typography sx={{
              fontFamily: tokens.fonts.mono,
              fontSize: '0.7rem',
              color: tokens.colors.text.secondary,
              mt: 0.25,
            }}>
              Multiplayer
            </Typography>
          </Box>

          {/* Seed Display - Clickable to create new Guy */}
          <Tooltip title="Create new Guy (resets corruption)" placement="top">
            <Box
              onClick={() => { playUIClick(); setSeedRefreshDialogOpen(true); }}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 0.5,
                mt: 1,
                cursor: 'pointer',
                // Staggered fade in - 400ms delay
                opacity: bootPhase === 'slide' || bootPhase === 'skull-hero' ? 0 : 1,
                transform: bootPhase === 'slide' || bootPhase === 'skull-hero' ? 'translateY(10px)' : 'translateY(0)',
                transition: 'opacity 300ms ease-out 400ms, transform 300ms ease-out 400ms',
                '&:hover': {
                  '& .seed-text': {
                    color: tokens.colors.text.secondary,
                  },
                  '& .refresh-icon': {
                    opacity: 1,
                  },
                },
              }}
            >
              <Typography
                className="seed-text"
                sx={{
                  fontFamily: tokens.fonts.gaming,
                  fontSize: '0.75rem',
                  color: tokens.colors.text.disabled,
                  transition: 'color 150ms ease',
                }}
              >
                seed: #{currentLoadout.seed}
              </Typography>
              <RefreshIcon
                className="refresh-icon"
                sx={{
                  fontSize: 14,
                  color: tokens.colors.text.disabled,
                  opacity: 0,
                  transition: 'opacity 150ms ease',
                }}
              />
            </Box>
          </Tooltip>
          </Box>
        </Box>

        {/* Right Column - Oversized Item Cards */}
        <Box sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          pt: 6,
          gap: 3,
          position: 'relative',
          minWidth: 0,
          overflow: 'hidden',
        }}>
          {/* Oversized Item Cards with Grid Pattern - Balatro Style */}
          {(bootPhase === 'items-drop' || bootPhase === 'active') && (
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              px: 4,
              py: 3,
              zIndex: 5,
            }}>
              {/* Dealer's mat background */}
              <Box sx={{
                bgcolor: 'rgba(30, 30, 35, 0.6)',
                borderRadius: '24px',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                px: 6,
                py: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: sidebarExpanded ? 3 : 4.5,
                // Fade in during ui-reveal phase
                opacity: bootPhase === 'active' ? 1 : 0.8,
                transition: 'opacity 600ms ease-out, transform 200ms ease-out, gap 200ms ease',
                // Responsive scaling: shrink cards before stacking, tighter when sidebar expanded
                transform: sidebarExpanded ? {
                  xs: 'scale(0.45)',
                  sm: 'scale(0.55)',
                  md: 'scale(0.65)',
                  lg: 'scale(0.75)',
                  xl: 'scale(0.85)',
                } : {
                  xs: 'scale(0.5)',
                  sm: 'scale(0.65)',
                  md: 'scale(0.75)',
                  lg: 'scale(0.9)',
                  xl: 'scale(1)',
                },
                transformOrigin: 'center top',
              }}>
                {currentLoadout.items.map((itemSlug, i) => {
                const itemName = getItemName(itemSlug);
                const itemStats = generateItemStats(itemSlug, currentLoadout.seed, i);
                const baseItem = LOADOUT_ITEMS[itemSlug];

                // Stable rotation variance based on index for "dealt" feel
                const baseRotation = (i - 1) * 2; // -2, 0, +2 degrees for subtle tilt

                return (
                  <ItemCard
                    key={`${itemSlug}-${i}`}
                    itemSlug={itemSlug}
                    itemName={itemName}
                    itemStats={itemStats}
                    category={baseItem?.category || 'misc'}
                    baseRotation={baseRotation}
                    index={i}
                    bootPhase={bootPhase}
                  />
                );
                })}
              </Box>
            </Box>
          )}
        </Box>

        {/* Click-outside overlay (invisible, no backdrop) */}
        {streamOpen && (
          <Box
            onClick={() => setStreamAnchorEl(null)}
            sx={{
              position: 'fixed',
              inset: 0,
              zIndex: 1099,
            }}
          />
        )}

        {/* Eternal Stream - Slide-in Sidebar Panel */}
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            right: 0,
            width: 380,
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            bgcolor: tokens.colors.background.elevated,
            borderLeft: `1px solid ${tokens.colors.border}`,
            boxShadow: streamOpen ? '-4px 0 32px rgba(0,0,0,0.3)' : 'none',
            zIndex: 1100,
            // Slide animation
            transform: streamOpen ? 'translateX(0)' : 'translateX(100%)',
            transition: 'transform 250ms ease-out, box-shadow 250ms ease-out',
          }}
        >
              {/* Stream Header - fixed height, click to close */}
              <Box
                onClick={() => setStreamAnchorEl(null)}
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
                    <Tooltip title="Close" placement="bottom">
                      <Box
                        onClick={(e: React.MouseEvent) => { e.stopPropagation(); setStreamAnchorEl(null); }}
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
                        <CloseIcon sx={{ fontSize: 18 }} />
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
              {participants.slice(0, 6).map((npc, idx) => (
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
                    transition: `all 150ms ${EASING.organic}`,
                    textDecoration: 'none',
                    animation: bootPhase === 'active' ? `${fadeIn} 300ms ease-out ${idx * 60}ms both` : 'none',
                    '&:hover': {
                      borderColor: tokens.colors.primary,
                      transform: 'scale(1.15) rotate(5deg)',
                      zIndex: 10,
                    },
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
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    setInviteModalOpen(true);
                  }}
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

            {/* Quick Prompts - NDG's questions */}
            {bootPhase === 'active' && (
              <Box sx={{
                mt: 2,
                pt: 2,
                borderTop: `1px solid ${tokens.colors.border}`,
                display: 'flex',
                flexWrap: 'wrap',
                gap: 1,
              }}>
                <Typography sx={{
                  fontFamily: tokens.fonts.gaming,
                  fontSize: '0.7rem',
                  color: tokens.colors.text.disabled,
                  width: '100%',
                  mb: 0.5,
                }}>
                  Quick Questions
                </Typography>
                {QUICK_PROMPTS.map((prompt, idx) => (
                  <Box
                    key={prompt.id}
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation(); // Prevent stream header minimize
                      handleQuickPrompt(prompt);
                    }}
                    sx={{
                      px: 1.5,
                      py: 0.75,
                      borderRadius: `${tokens.radius.sm}px`,
                      bgcolor: tokens.colors.background.paper,
                      border: `1px solid ${tokens.colors.border}`,
                      cursor: 'pointer',
                      transition: `all 150ms ${EASING.organic}`,
                      animation: `${fadeIn} 300ms ease-out ${800 + idx * 80}ms both`,
                      '&:hover': {
                        bgcolor: tokens.colors.background.elevated,
                        borderColor: tokens.colors.primary,
                        transform: 'translateY(-2px) scale(1.05)',
                        boxShadow: `0 4px 8px rgba(0,0,0,0.2)`,
                      },
                      '&:active': {
                        transform: 'scale(0.95)',
                      },
                    }}
                  >
                    <Typography sx={{
                      fontFamily: tokens.fonts.gaming,
                      fontSize: '0.85rem',
                      color: tokens.colors.text.primary,
                    }}>
                      {prompt.label}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
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
            {/* Skeleton Loader for Chat Stream - chess.com style staggered reveal */}
            {(bootPhase === 'ui-reveal' || bootPhase === 'items-drop') && (
              <Box sx={{ px: 2, py: 2 }}>
                {[85, 70, 90, 65].map((width, i) => (
                  <Box
                    key={i}
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 1.5,
                      mb: 2,
                      opacity: 0,
                      animation: `${fadeIn} 300ms ease-out ${i * 100}ms forwards`,
                    }}
                  >
                    {/* Avatar skeleton */}
                    <Box sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      bgcolor: tokens.colors.background.paper,
                      flexShrink: 0,
                      animation: `${pulse} 1.5s ease-in-out infinite`,
                      animationDelay: `${i * 200}ms`,
                    }} />
                    {/* Content skeleton */}
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{
                        width: 80,
                        height: 12,
                        borderRadius: 1,
                        bgcolor: tokens.colors.background.paper,
                        mb: 1,
                        animation: `${pulse} 1.5s ease-in-out infinite`,
                        animationDelay: `${i * 200 + 50}ms`,
                      }} />
                      <Box sx={{
                        width: `${width}%`,
                        height: 16,
                        borderRadius: 1,
                        bgcolor: tokens.colors.background.paper,
                        animation: `${pulse} 1.5s ease-in-out infinite`,
                        animationDelay: `${i * 200 + 100}ms`,
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
                  // No animation - prevents horizontal overflow
                  bgcolor: msg.type === 'ad' ? 'rgba(74, 222, 128, 0.05)' : msg.type === 'answer' ? 'rgba(255,200,0,0.03)' : 'transparent',
                  transition: 'background-color 150ms ease',
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

      {/* Seed Refresh Confirmation Dialog */}
      <Dialog
        open={seedRefreshDialogOpen}
        onClose={() => setSeedRefreshDialogOpen(false)}
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
          fontFamily: '"Inter", sans-serif',
          fontWeight: 600,
          fontSize: '1.1rem',
          color: tokens.colors.text.primary,
        }}>
          Create New Guy?
        </DialogTitle>
        <DialogContent sx={{ px: 3, py: 2.5 }}>
          <Typography sx={{
            fontSize: '0.9rem',
            color: tokens.colors.text.secondary,
            mb: 2.5,
          }}>
            This will create a brand new Guy instance with:
          </Typography>
          <Box component="ul" sx={{ m: 0, pl: 3, color: tokens.colors.text.secondary }}>
            <Typography component="li" sx={{ fontSize: '0.85rem', mb: 1 }}>
              Fresh starting loadout
            </Typography>
            <Typography component="li" sx={{ fontSize: '0.85rem', mb: 1 }}>
              New chat streams
            </Typography>
            <Typography component="li" sx={{ fontSize: '0.85rem', mb: 1 }}>
              Reset stats
            </Typography>
            <Typography component="li" sx={{ fontSize: '0.85rem' }}>
              Reset corruption
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, pb: 2 }}>
          <Button
            onClick={() => setSeedRefreshDialogOpen(false)}
            sx={{
              color: tokens.colors.text.disabled,
              fontFamily: tokens.fonts.gaming,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSeedRefresh}
            variant="contained"
            sx={{
              bgcolor: tokens.colors.primary,
              fontFamily: tokens.fonts.gaming,
              '&:hover': {
                bgcolor: tokens.colors.primary,
                filter: 'brightness(1.1)',
              },
            }}
          >
            New Guy
          </Button>
        </DialogActions>
      </Dialog>

      {/* Launching Overlay - Full screen skull when generating new seed */}
      {bootPhase === 'launching' && (
        <Box
          sx={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            bgcolor: tokens.colors.background.default,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            animation: `${fadeIn} 200ms ease-out`,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              filter: 'drop-shadow(0 0 20px rgba(233, 4, 65, 0.7))',
              animation: `${pulseGlow} 600ms ease-in-out infinite`,
            }}
          >
            {ASCII_SKULL.map((row, rowIdx) => (
              <Box
                key={rowIdx}
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  height: '0.8rem',
                }}
              >
                {row.split('').map((char, charIdx) => (
                  <Box
                    key={charIdx}
                    component="span"
                    sx={{
                      fontFamily: 'monospace',
                      fontSize: '0.75rem',
                      lineHeight: 1,
                      color: tokens.colors.primary,
                      whiteSpace: 'pre',
                    }}
                  >
                    {char}
                  </Box>
                ))}
              </Box>
            ))}
          </Box>
          <Typography
            sx={{
              mt: 3,
              fontFamily: tokens.fonts.gaming,
              fontSize: '1rem',
              color: tokens.colors.text.secondary,
              opacity: 0.8,
            }}
          >
            Generating fate...
          </Typography>
        </Box>
      )}

    </Box>
  );
}
