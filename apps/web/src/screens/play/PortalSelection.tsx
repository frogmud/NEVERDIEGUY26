/**
 * PortalSelection - Distance-based domain travel after combat victory
 *
 * Simplified UI:
 * - Animated flume backgrounds
 * - Click to select, Travel button above cards
 * - Unselected cards fade when one is picked
 *
 * NEVER DIE GUY
 */

import { useMemo, useCallback, useState, useEffect } from 'react';
import { Box, Typography, Button, keyframes } from '@mui/material';
import { tokens } from '../../theme';
import { DURATION, EASING, GLOW } from '../../utils/transitions';
import { useRun } from '../../contexts/RunContext';
import { getAvailablePortals, type PortalOption } from '../../data/portal-config';
import { DOMAIN_PLANET_CONFIG } from '../../games/globe-meteor/config';
import { FLUME_ASCII_DATA } from '../../ascii/data/flumeAsciiData';

const gamingFont = { fontFamily: tokens.fonts.gaming };

// Staggered card entrance
const slideIn = keyframes`
  0% { opacity: 0; transform: translateY(40px) scale(0.9); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
`;

// Planet glow pulse
const planetPulse = keyframes`
  0%, 100% { filter: brightness(1); }
  50% { filter: brightness(1.15); }
`;

// Mystery glow for finale
const mysteryPulse = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(138, 43, 226, 0.4); }
  50% { box-shadow: 0 0 40px rgba(138, 43, 226, 0.7); }
`;

// ASCII scanline overlay animation
const asciiScan = keyframes`
  0% { background-position: 0 0; }
  100% { background-position: 0 8px; }
`;

// Selected card glow pulse
const selectedGlow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(255, 255, 255, 0.3); }
  50% { box-shadow: 0 0 35px rgba(255, 255, 255, 0.5); }
`;

// Button fade in
const buttonFadeIn = keyframes`
  0% { opacity: 0; transform: scale(0.9) translateY(8px); }
  100% { opacity: 1; transform: scale(1) translateY(0); }
`;


// ASCII-style overlay with scanlines and character grid
function AsciiOverlay({ isHovered, color }: { isHovered: boolean; color: string }) {
  return (
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        // Scanline effect
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background: `repeating-linear-gradient(
            0deg,
            transparent 0px,
            transparent 2px,
            rgba(0,0,0,0.3) 2px,
            rgba(0,0,0,0.3) 4px
          )`,
          animation: `${asciiScan} 0.5s linear infinite`,
          opacity: isHovered ? 0.6 : 0.4,
          transition: 'opacity 300ms ease',
        },
        // Character grid overlay
        '&::after': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background: `repeating-linear-gradient(
            90deg,
            transparent 0px,
            transparent 6px,
            rgba(255,255,255,0.03) 6px,
            rgba(255,255,255,0.03) 7px
          )`,
          opacity: isHovered ? 0.5 : 0.3,
          transition: 'opacity 300ms ease',
        },
      }}
    />
  );
}

// Animated ASCII flume background for each domain
function AsciiFlumeBackground({ domainId, isHovered }: { domainId: number; isHovered: boolean }) {
  const [frameIndex, setFrameIndex] = useState(0);
  const flumeData = FLUME_ASCII_DATA[domainId];

  useEffect(() => {
    if (!flumeData) return;
    const interval = setInterval(() => {
      setFrameIndex((prev) => (prev + 1) % flumeData.frames.length);
    }, 200);
    return () => clearInterval(interval);
  }, [flumeData]);

  if (!flumeData) return null;

  const frame = flumeData.frames[frameIndex];

  return (
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        opacity: isHovered ? 0.35 : 0.2,
        transition: 'opacity 300ms ease',
      }}
    >
      <Box
        component="pre"
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontFamily: 'monospace',
          fontSize: '6px',
          lineHeight: 1.1,
          color: flumeData.color,
          textShadow: `0 0 4px ${flumeData.color}40`,
          m: 0,
          p: 0,
          whiteSpace: 'pre',
          userSelect: 'none',
        }}
      >
        {frame.join('\n')}
      </Box>
    </Box>
  );
}

interface PortalCardProps {
  portal: PortalOption;
  currentHp: number;
  isSelected: boolean;
  hasSelection: boolean;
  onSelect: () => void;
  index: number;
}

function PortalCard({ portal, currentHp, isSelected, hasSelection, onSelect, index }: PortalCardProps) {
  const planetConfig = DOMAIN_PLANET_CONFIG[portal.domainId];
  const hpAfterTravel = Math.max(1, currentHp - portal.travelDamage);
  const isLowHp = hpAfterTravel <= 25;
  const isSafe = portal.travelDamage === 0;
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Box
      onClick={onSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-end',
        p: 0,
        width: 180,
        height: 240,
        bgcolor: tokens.colors.background.paper,
        border: isSelected ? `2px solid ${tokens.colors.text.primary}` : `2px solid ${tokens.colors.border}`,
        borderRadius: '12px',
        opacity: 0,
        animation: isSelected
          ? `${slideIn} 500ms ease-out forwards, ${selectedGlow} 2s ease-in-out infinite`
          : `${slideIn} 500ms ease-out forwards`,
        animationDelay: `${index * 200}ms`,
        transition: `all ${DURATION.fast}ms ${EASING.organic}`,
        overflow: 'hidden',
        position: 'relative',
        cursor: 'pointer',
        // Fade non-selected when one is picked
        filter: hasSelection && !isSelected ? 'brightness(0.5)' : 'brightness(1)',
        transform: isSelected ? 'scale(1.05)' : 'scale(1)',
        // Balatro-style hover with lift
        '&:hover': {
          transform: isSelected ? 'scale(1.05)' : 'scale(1.03) translateY(-4px)',
          borderColor: tokens.colors.text.secondary,
          boxShadow: isSelected ? undefined : GLOW.subtle(tokens.colors.text.secondary),
        },
      }}
    >
      {/* Animated ASCII flume background */}
      {!portal.isUnknown && (
        <AsciiFlumeBackground domainId={portal.domainId} isHovered={isHovered || isSelected} />
      )}

      {/* ASCII scanline overlay */}
      <AsciiOverlay isHovered={isHovered || isSelected} color={planetConfig?.color || '#666'} />

      {/* Unknown portal background */}
      {portal.isUnknown && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at 50% 30%, #6a5acd, #1a0a2e)',
            animation: `${mysteryPulse} 2s ease-in-out infinite`,
          }}
        />
      )}

      {/* Dark gradient for text readability */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 50%, transparent 80%)',
          pointerEvents: 'none',
        }}
      />

      {/* Planet circle */}
      <Box
        sx={{
          position: 'absolute',
          top: '30%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 60,
          height: 60,
          borderRadius: '50%',
          background: portal.isUnknown
            ? 'radial-gradient(circle at 30% 30%, #8b7ec8, #4a3a6e)'
            : `radial-gradient(circle at 30% 30%, ${planetConfig?.glowColor || '#666'}, ${planetConfig?.color || '#333'})`,
          boxShadow: portal.isUnknown
            ? '0 0 20px rgba(138, 43, 226, 0.5)'
            : `0 4px 16px ${planetConfig?.color || '#333'}60`,
          animation: `${planetPulse} 3s ease-in-out infinite`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1,
        }}
      >
        {portal.isUnknown && (
          <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: 'rgba(255,255,255,0.9)', fontFamily: tokens.fonts.gaming }}>
            ?
          </Typography>
        )}
      </Box>

      {/* Content */}
      <Box sx={{ position: 'relative', zIndex: 2, p: 1.5, width: '100%', textAlign: 'center' }}>
        <Typography
          sx={{
            ...gamingFont,
            fontSize: '0.95rem',
            fontWeight: 700,
            color: tokens.colors.text.primary,
            mb: 0.5,
            textShadow: '0 2px 4px rgba(0,0,0,0.7)',
          }}
        >
          {portal.domainName}
        </Typography>

        {portal.isUnknown ? (
          <Typography sx={{ ...gamingFont, fontSize: '0.8rem', color: tokens.colors.rarity.epic, textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
            ???
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            <Typography sx={{ ...gamingFont, fontSize: '0.85rem', color: tokens.colors.text.secondary, textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
              {portal.distance} {portal.distance === 1 ? 'sector' : 'sectors'}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
              <Box
                component="img"
                src="/assets/items/consumables/Heart-Half.svg"
                alt=""
                sx={{ width: 10, height: 10 }}
              />
              <Typography
                sx={{
                  fontSize: '0.7rem',
                  color: isSafe ? tokens.colors.success : isLowHp ? tokens.colors.error : tokens.colors.text.disabled,
                }}
              >
                {isSafe ? '+' : `-${portal.travelDamage}`}
              </Typography>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default function PortalSelection() {
  const { state, selectPortal } = useRun();
  const { currentDomain, visitedDomains, hp } = state;
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const portals = useMemo(() => {
    const seed = `${state.threadId}-portal-${currentDomain}`;
    return getAvailablePortals(
      currentDomain,
      visitedDomains,
      state.inventory?.powerups?.length || 0,
      state.directorAffinity,
      seed
    );
  }, [currentDomain, visitedDomains, state.threadId, state.directorAffinity, state.inventory?.powerups?.length]);

  const selectedPortal = portals.find(p => p.domainId === selectedId);

  const handleCardClick = useCallback((domainId: number) => {
    setSelectedId(prev => prev === domainId ? null : domainId);
  }, []);

  const handleTravel = useCallback(() => {
    if (selectedPortal) {
      selectPortal(selectedPortal);
    }
  }, [selectedPortal, selectPortal]);

  if (portals.length === 0) return null;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 4,
        height: '100%',
        minHeight: 400,
      }}
    >
      {/* Header */}
      <Typography variant="h5" sx={{ ...gamingFont, fontWeight: 700, mb: 0.5, color: tokens.colors.text.primary }}>
        Choose Your Path
      </Typography>
      <Typography sx={{ fontSize: '0.85rem', color: tokens.colors.text.secondary, mb: 3 }}>
        Farther journeys yield greater rewards
      </Typography>

      {/* Travel button - fades in when selected */}
      <Box sx={{ height: 48, mb: 2, display: 'flex', alignItems: 'center' }}>
        {selectedPortal ? (
          <Button
            variant="contained"
            onClick={handleTravel}
            sx={{
              ...gamingFont,
              px: 4,
              py: 1,
              fontSize: '1rem',
              bgcolor: tokens.colors.text.primary,
              color: tokens.colors.background.default,
              borderRadius: '8px',
              // Fade in animation
              animation: `${buttonFadeIn} 300ms ${EASING.organic}`,
              transition: `all ${DURATION.fast}ms ${EASING.organic}`,
              boxShadow: `0 4px 16px rgba(255,255,255,0.2)`,
              // Balatro-style hover/press
              '&:hover': {
                bgcolor: tokens.colors.text.secondary,
                transform: 'scale(1.03) translateY(-2px)',
                boxShadow: GLOW.normal(tokens.colors.text.primary),
              },
              '&:active': {
                transform: 'scale(0.97) translateY(2px)',
                transition: 'all 50ms ease-out',
              },
            }}
          >
            TRAVEL TO {selectedPortal.domainName.toUpperCase()}
          </Button>
        ) : (
          <Typography sx={{ fontSize: '0.8rem', color: tokens.colors.text.disabled }}>
            Select a destination
          </Typography>
        )}
      </Box>

      {/* Current HP */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 3 }}>
        <Box component="img" src="/assets/items/consumables/Heart-Full.svg" alt="" sx={{ width: 16, height: 16 }} />
        <Typography sx={{ ...gamingFont, fontSize: '0.9rem' }}>
          {hp}
        </Typography>
      </Box>

      {/* Portal cards */}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
        {portals.map((portal, index) => (
          <PortalCard
            key={portal.domainId}
            portal={portal}
            currentHp={hp}
            isSelected={selectedId === portal.domainId}
            hasSelection={selectedId !== null}
            onSelect={() => handleCardClick(portal.domainId)}
            index={index}
          />
        ))}
      </Box>
    </Box>
  );
}
