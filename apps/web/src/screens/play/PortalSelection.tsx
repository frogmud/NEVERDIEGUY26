/**
 * PortalSelection - Distance-based domain travel after combat victory
 *
 * Shows available portals with:
 * - Domain name & element
 * - Distance (1-5 sectors) and travel damage
 * - Score/gold multipliers for risk/reward
 * - Finale shows "???" until committed
 *
 * NEVER DIE GUY
 */

import { useMemo, useCallback } from 'react';
import { Box, Typography, Button, Chip, Alert, keyframes } from '@mui/material';
import {
  TravelExploreSharp as PortalIcon,
  FavoriteSharp as HeartIcon,
  StarSharp as ScoreIcon,
  MonetizationOnSharp as GoldIcon,
  WarningAmberSharp as WarningIcon,
  HelpOutlineSharp as UnknownIcon,
} from '@mui/icons-material';
import { tokens } from '../../theme';
import { useRun } from '../../contexts/RunContext';
import {
  getAvailablePortals,
  type PortalOption,
  DISTANCE_TABLE,
} from '../../data/portal-config';
import { getExpiringItems } from '../../data/balance-config';
import { DOMAIN_CONFIGS } from '../../data/domains';

const gamingFont = { fontFamily: tokens.fonts.gaming };

// Element colors for portal cards
const ELEMENT_COLORS: Record<string, string> = {
  Earth: '#8B4513',
  Ice: '#00CED1',
  Fire: '#FF4500',
  Death: '#4B0082',
  Void: '#1a1a2e',
  Wind: '#98FB98',
  Neutral: '#808080',
};

// Portal card entrance animation
const fadeInUp = keyframes`
  0% { opacity: 0; transform: translateY(20px); }
  100% { opacity: 1; transform: translateY(0); }
`;

// Glow animation for finale portal
const mysteryGlow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(138, 43, 226, 0.3); }
  50% { box-shadow: 0 0 30px rgba(138, 43, 226, 0.6); }
`;

interface PortalCardProps {
  portal: PortalOption;
  currentHp: number;
  onSelect: () => void;
  index: number;
}

function PortalCard({ portal, currentHp, onSelect, index }: PortalCardProps) {
  const config = DOMAIN_CONFIGS[portal.domainId];
  const elementColor = ELEMENT_COLORS[portal.element] || ELEMENT_COLORS.Neutral;
  const hpAfterTravel = Math.max(1, currentHp - portal.travelDamage);
  const isLowHp = hpAfterTravel <= 25;

  return (
    <Button
      onClick={onSelect}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        p: 2,
        minWidth: 180,
        maxWidth: 220,
        bgcolor: 'background.paper',
        border: `2px solid ${elementColor}`,
        borderRadius: '12px',
        textTransform: 'none',
        animation: `${fadeInUp} 400ms ease-out`,
        animationDelay: `${index * 100}ms`,
        animationFillMode: 'backwards',
        transition: 'all 150ms ease',
        ...(portal.isUnknown && {
          animation: `${fadeInUp} 400ms ease-out, ${mysteryGlow} 2s ease-in-out infinite`,
          animationDelay: `${index * 100}ms, 0ms`,
        }),
        '&:hover': {
          transform: 'scale(1.05)',
          bgcolor: 'background.elevated',
          borderColor: tokens.colors.primary,
        },
      }}
    >
      {/* Domain name */}
      <Typography
        variant="h6"
        sx={{
          ...gamingFont,
          color: elementColor,
          fontWeight: 700,
          mb: 1,
        }}
      >
        {portal.domainName}
      </Typography>

      {/* Element badge */}
      <Chip
        label={portal.element}
        size="small"
        sx={{
          bgcolor: elementColor,
          color: 'white',
          fontWeight: 600,
          mb: 2,
        }}
      />

      {/* Distance and stats */}
      {portal.isUnknown ? (
        // Finale: Unknown distance
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
            <UnknownIcon sx={{ color: tokens.colors.rarity.epic }} />
            <Typography sx={{ ...gamingFont, fontSize: '1.1rem', color: tokens.colors.rarity.epic }}>
              ??? SECTORS
            </Typography>
          </Box>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
            Distance revealed on arrival
          </Typography>
        </Box>
      ) : (
        // Normal portal: Show distance stats
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          {/* Distance */}
          <Typography sx={{ ...gamingFont, fontSize: '1.3rem', fontWeight: 700, mb: 1 }}>
            {portal.distance} {portal.distance === 1 ? 'SECTOR' : 'SECTORS'}
          </Typography>

          {/* Affinity bonus indicator */}
          {portal.hasAffinityBonus && (
            <Chip
              label="AFFINITY -1"
              size="small"
              sx={{
                bgcolor: tokens.colors.success,
                color: 'white',
                fontSize: '0.65rem',
                height: 18,
                mb: 1,
              }}
            />
          )}

          {/* HP cost */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mb: 0.5 }}>
            <HeartIcon sx={{ fontSize: 16, color: isLowHp ? tokens.colors.error : tokens.colors.error }} />
            <Typography
              sx={{
                fontSize: '0.9rem',
                color: isLowHp ? tokens.colors.error : 'text.primary',
                fontWeight: isLowHp ? 700 : 400,
              }}
            >
              {portal.travelDamage > 0 ? `-${portal.travelDamage} HP` : 'Safe (0 HP)'}
            </Typography>
          </Box>

          {/* HP after travel preview */}
          {portal.travelDamage > 0 && (
            <Typography
              variant="caption"
              sx={{
                color: isLowHp ? tokens.colors.error : 'text.secondary',
                display: 'block',
                mb: 1,
              }}
            >
              ({hpAfterTravel} HP after)
            </Typography>
          )}

          {/* Multipliers */}
          <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center' }}>
            {portal.scoreMultiplier > 1 && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                <ScoreIcon sx={{ fontSize: 14, color: tokens.colors.secondary }} />
                <Typography sx={{ fontSize: '0.8rem', color: tokens.colors.secondary }}>
                  +{Math.round((portal.scoreMultiplier - 1) * 100)}%
                </Typography>
              </Box>
            )}
            {portal.goldMultiplier > 1 && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                <GoldIcon sx={{ fontSize: 14, color: tokens.colors.warning }} />
                <Typography sx={{ fontSize: '0.8rem', color: tokens.colors.warning }}>
                  +{Math.round((portal.goldMultiplier - 1) * 100)}%
                </Typography>
              </Box>
            )}
            {portal.scoreMultiplier === 1 && portal.goldMultiplier === 1 && (
              <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
                No bonus
              </Typography>
            )}
          </Box>
        </Box>
      )}

      {/* Select button */}
      <Box
        sx={{
          mt: 'auto',
          py: 0.5,
          px: 2,
          bgcolor: elementColor,
          borderRadius: '8px',
          opacity: 0.9,
        }}
      >
        <Typography sx={{ ...gamingFont, fontSize: '0.85rem', color: 'white' }}>
          TRAVEL
        </Typography>
      </Box>
    </Button>
  );
}

export default function PortalSelection() {
  const { state, selectPortal } = useRun();
  const { currentDomain, visitedDomains, hp, inventory } = state;

  // Generate available portals
  const portals = useMemo(() => {
    // Use thread ID + domain for deterministic seed
    const seed = `${state.threadId}-portal-${currentDomain}`;
    return getAvailablePortals(
      currentDomain,
      visitedDomains,
      state.inventory?.powerups?.length || 0, // Use powerup count as proxy for favor
      state.directorAffinity,
      seed
    );
  }, [currentDomain, visitedDomains, state.threadId, state.directorAffinity, state.inventory?.powerups?.length]);

  // Check for expiring items (for warning)
  const expiringItems = useMemo(() => {
    const powerups = inventory?.powerups || [];
    // Simple check - items without Epic+ rarity expire
    // In real implementation, would check actual item data
    return powerups.filter(slug => {
      // Common/Uncommon items expire (simplified check)
      return !slug.includes('epic') && !slug.includes('legendary') && !slug.includes('unique');
    });
  }, [inventory?.powerups]);

  const handleSelectPortal = useCallback((portal: PortalOption) => {
    selectPortal(portal);
  }, [selectPortal]);

  if (portals.length === 0) {
    // No portals = victory (shouldn't happen, finale should have 1 portal)
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          p: 4,
        }}
      >
        <Typography variant="h4" sx={{ ...gamingFont }}>
          Victory!
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        p: 4,
        height: '100%',
      }}
    >
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
          <PortalIcon sx={{ fontSize: 32, color: tokens.colors.primary }} />
          <Typography variant="h4" sx={{ ...gamingFont, fontWeight: 700 }}>
            Choose Your Path
          </Typography>
        </Box>
        <Typography sx={{ color: 'text.secondary' }}>
          Farther destinations offer greater rewards... at a cost
        </Typography>
      </Box>

      {/* Current HP indicator */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <HeartIcon sx={{ color: tokens.colors.error }} />
        <Typography sx={{ ...gamingFont, fontSize: '1.1rem' }}>
          Current HP: {hp}/100
        </Typography>
      </Box>

      {/* Portal cards */}
      <Box
        sx={{
          display: 'flex',
          gap: 3,
          flexWrap: 'wrap',
          justifyContent: 'center',
          mb: 4,
        }}
      >
        {portals.map((portal, index) => (
          <PortalCard
            key={portal.domainId}
            portal={portal}
            currentHp={hp}
            onSelect={() => handleSelectPortal(portal)}
            index={index}
          />
        ))}
      </Box>

      {/* Expiring items warning */}
      {expiringItems.length > 0 && (
        <Alert
          severity="warning"
          icon={<WarningIcon />}
          sx={{
            maxWidth: 500,
            bgcolor: 'rgba(255, 152, 0, 0.1)',
            border: '1px solid rgba(255, 152, 0, 0.3)',
          }}
        >
          <Typography variant="body2">
            <strong>{expiringItems.length} item{expiringItems.length > 1 ? 's' : ''}</strong> will expire on teleport.
            Common and Uncommon items do not survive portal travel.
          </Typography>
        </Alert>
      )}

      {/* Distance legend */}
      <Box
        sx={{
          mt: 4,
          p: 2,
          bgcolor: 'background.paper',
          borderRadius: '8px',
          border: '1px solid',
          borderColor: 'divider',
          maxWidth: 600,
        }}
      >
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
          Distance Reference:
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
          {Object.entries(DISTANCE_TABLE).map(([dist, stats]) => (
            <Box key={dist} sx={{ textAlign: 'center', minWidth: 80 }}>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
                {dist} {parseInt(dist) === 1 ? 'sector' : 'sectors'}
              </Typography>
              <Typography sx={{ fontSize: '0.65rem', color: 'text.secondary' }}>
                {stats.damage > 0 ? `-${stats.damage} HP` : 'Safe'}
              </Typography>
              <Typography sx={{ fontSize: '0.65rem', color: tokens.colors.warning }}>
                {stats.gold > 1 ? `+${Math.round((stats.gold - 1) * 100)}% gold` : '-'}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
