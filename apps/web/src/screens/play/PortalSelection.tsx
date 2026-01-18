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
import { useRun } from '../../contexts/RunContext';
import { getAvailablePortals, type PortalOption } from '../../data/portal-config';
import { DOMAIN_PLANET_CONFIG } from '../../games/globe-meteor/config';

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

// Map domain IDs to visually distinct flume sequences
// Spread across all 12 sequences for variety, with different start frames and speeds
const DOMAIN_FLUME_CONFIG: Record<number, { dir: string; startFrame: number; step: number; interval: number; loop: boolean }> = {
  1: { dir: 'flume-00001', startFrame: 1, step: 2, interval: 120, loop: true },   // Earth - organic
  2: { dir: 'flume-00007', startFrame: 25, step: 3, interval: 100, loop: true },  // Frost - crystalline
  3: { dir: 'flume-00003', startFrame: 50, step: 2, interval: 90, loop: true },   // Infernus - fiery
  4: { dir: 'flume-00004', startFrame: 10, step: 2, interval: 130, loop: true },  // Shadow - dark wisps
  5: { dir: 'flume-00010', startFrame: 1, step: 2, interval: 140, loop: false },  // Null - void (no loop)
  6: { dir: 'flume-00005', startFrame: 70, step: 2, interval: 110, loop: true },  // Aberrant - weird
};

const FRAME_COUNT = 100;

// Animated flume background with per-domain variation
function AnimatedFlumeBackground({ domainId, isHovered }: { domainId: number; isHovered: boolean }) {
  const config = DOMAIN_FLUME_CONFIG[domainId];
  const [frameIndex, setFrameIndex] = useState(config?.startFrame || 1);
  const [hasError, setHasError] = useState(false);
  const [stopped, setStopped] = useState(false);

  useEffect(() => {
    if (hasError || !config || stopped) return;
    const interval = setInterval(() => {
      setFrameIndex(prev => {
        const next = prev + config.step;
        if (next > FRAME_COUNT) {
          if (config.loop) {
            return 1;
          } else {
            setStopped(true);
            return FRAME_COUNT;
          }
        }
        return next;
      });
    }, config.interval);
    return () => clearInterval(interval);
  }, [hasError, config, stopped]);

  if (hasError || !config) return null;

  return (
    <Box
      component="img"
      src={`/assets/flumes-svg/cursed/${config.dir}/frame-${String(frameIndex).padStart(2, '0')}.svg`}
      alt=""
      onError={() => setHasError(true)}
      sx={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        // Dull when not hovered, vibrant on hover
        opacity: isHovered ? 0.9 : 0.5,
        filter: isHovered ? 'saturate(1) brightness(1)' : 'saturate(0.4) brightness(0.7)',
        transition: 'opacity 300ms ease, filter 300ms ease',
      }}
    />
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
        animation: `${slideIn} 500ms ease-out forwards`,
        animationDelay: `${index * 200}ms`,
        transition: 'all 200ms ease',
        overflow: 'hidden',
        position: 'relative',
        cursor: 'pointer',
        // Fade non-selected when one is picked
        filter: hasSelection && !isSelected ? 'brightness(0.5)' : 'brightness(1)',
        transform: isSelected ? 'scale(1.05)' : 'scale(1)',
        '&:hover': {
          transform: isSelected ? 'scale(1.05)' : 'scale(1.02)',
          borderColor: tokens.colors.text.secondary,
        },
      }}
    >
      {/* Full-bleed animated background */}
      {!portal.isUnknown && <AnimatedFlumeBackground domainId={portal.domainId} isHovered={isHovered || isSelected} />}

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

      {/* Travel button - only shows when selected */}
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
              '&:hover': {
                bgcolor: tokens.colors.text.secondary,
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
