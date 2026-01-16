/**
 * DomainInfoModal - Shows current domain/zone information
 *
 * Quick reference for the current play state.
 */

import { Box, Dialog, DialogContent, Typography, IconButton, Chip } from '@mui/material';
import { CloseSharp as CloseIcon, WhatshotSharp, AcUnitSharp, PublicSharp } from '@mui/icons-material';
import { tokens } from '../../../theme';
import type { DomainState, EventVariant } from '../../../types/zones';
import { EVENT_VARIANTS } from '../../../types/zones';
import { DOMAIN_CONFIGS } from '../../../data/domains';
import type { LoadoutStats } from '@ndg/ai-engine';

const gamingFont = { fontFamily: tokens.fonts.gaming };

// Element colors
const ELEMENT_COLORS: Record<string, string> = {
  Earth: '#8B4513',
  Fire: '#ff6b35',
  Ice: '#4fc3f7',
  Void: '#9c27b0',
  Death: '#607d8b',
  Wind: '#81c784',
  Neutral: '#9e9e9e',
};

interface DomainInfoModalProps {
  open: boolean;
  onClose: () => void;
  domainState: DomainState | null;
  currentDomain: number;
  roomNumber: number;
  totalScore: number;
  gold: number;
  eventVariant?: EventVariant;
  loadoutStats?: LoadoutStats;
  inventoryItems?: string[];
}

export function DomainInfoModal({
  open,
  onClose,
  domainState,
  currentDomain,
  roomNumber,
  totalScore,
  gold,
  eventVariant = 'standard',
  loadoutStats = {},
  inventoryItems = [],
}: DomainInfoModalProps) {
  const zones = domainState?.zones || [];
  const clearedCount = domainState?.clearedCount || 0;
  const totalZones = domainState?.totalZones || 3;

  // Get domain config for element info
  const domainConfig = DOMAIN_CONFIGS[currentDomain];
  const domainElement = domainConfig?.element || 'Neutral';
  const elementColor = ELEMENT_COLORS[domainElement];

  // Get variant config
  const variantConfig = EVENT_VARIANTS[eventVariant];

  // Calculate active stats
  const fury = loadoutStats.fury || 0;
  const resilience = loadoutStats.resilience || 0;
  const hasStats = fury > 0 || resilience > 0;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          bgcolor: tokens.colors.background.paper,
          border: `2px solid ${tokens.colors.border}`,
          borderRadius: 2,
          minWidth: 340,
          maxWidth: 400,
        },
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ p: 3 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
            <Box>
              <Typography sx={{ fontSize: '0.75rem', color: tokens.colors.text.disabled, letterSpacing: '0.1em' }}>
                DOMAIN {currentDomain}/6
              </Typography>
              <Typography variant="h5" sx={{ ...gamingFont, color: tokens.colors.text.primary }}>
                {domainState?.name || 'Unknown Domain'}
              </Typography>
            </Box>
            <IconButton onClick={onClose} size="small" sx={{ color: tokens.colors.text.secondary }}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Domain Element Info */}
          <Box sx={{ mb: 3, p: 2, bgcolor: tokens.colors.background.elevated, borderRadius: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <PublicSharp sx={{ color: elementColor, fontSize: 18 }} />
              <Typography sx={{ fontSize: '0.75rem', color: tokens.colors.text.disabled, letterSpacing: '0.05em' }}>
                DOMAIN ELEMENT
              </Typography>
            </Box>
            <Typography sx={{ ...gamingFont, fontSize: '1rem', color: elementColor }}>
              {domainElement}
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: tokens.colors.text.secondary, mt: 0.5 }}>
              Matching element dice get +50% score bonus
            </Typography>
          </Box>

          {/* Current Event Variant */}
          <Box sx={{ mb: 3, p: 2, bgcolor: `${variantConfig.color}15`, borderRadius: 1, border: `1px solid ${variantConfig.color}` }}>
            <Typography sx={{ fontSize: '0.75rem', color: tokens.colors.text.disabled, letterSpacing: '0.05em', mb: 0.5 }}>
              EVENT DIFFICULTY
            </Typography>
            <Typography sx={{ ...gamingFont, fontSize: '1.125rem', color: variantConfig.color }}>
              {variantConfig.label}
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: tokens.colors.text.secondary, mt: 0.5 }}>
              {variantConfig.description}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
              <Typography sx={{ fontSize: '0.7rem', color: tokens.colors.text.disabled }}>
                Goal: {Math.round(variantConfig.goalMultiplier * 100)}%
              </Typography>
              <Typography sx={{ fontSize: '0.7rem', color: tokens.colors.text.disabled }}>
                Timer: {Math.round(variantConfig.timerMultiplier * 100)}%
              </Typography>
              <Typography sx={{ fontSize: '0.7rem', color: tokens.colors.text.disabled }}>
                Gold: {Math.round(variantConfig.goldMultiplier * 100)}%
              </Typography>
            </Box>
          </Box>

          {/* Run Stats */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
            <Box sx={{ p: 2, bgcolor: tokens.colors.background.elevated, borderRadius: 1 }}>
              <Typography sx={{ fontSize: '0.7rem', color: tokens.colors.text.disabled, mb: 0.5 }}>
                TOTAL SCORE
              </Typography>
              <Typography sx={{ ...gamingFont, fontSize: '1.25rem', color: tokens.colors.primary }}>
                {totalScore.toLocaleString()}
              </Typography>
            </Box>
            <Box sx={{ p: 2, bgcolor: tokens.colors.background.elevated, borderRadius: 1 }}>
              <Typography sx={{ fontSize: '0.7rem', color: tokens.colors.text.disabled, mb: 0.5 }}>
                GOLD
              </Typography>
              <Typography sx={{ ...gamingFont, fontSize: '1.25rem', color: '#ffd700' }}>
                ${gold}
              </Typography>
            </Box>
          </Box>

          {/* Loadout Stats (if any active) */}
          {hasStats && (
            <Box sx={{ mb: 3 }}>
              <Typography sx={{ fontSize: '0.75rem', color: tokens.colors.text.disabled, mb: 1, letterSpacing: '0.05em' }}>
                ACTIVE BONUSES
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {fury > 0 && (
                  <Chip
                    label={`+${fury}% Score (Fury)`}
                    size="small"
                    sx={{
                      height: 24,
                      fontSize: '0.7rem',
                      bgcolor: `${tokens.colors.primary}20`,
                      color: tokens.colors.primary,
                      border: `1px solid ${tokens.colors.primary}`,
                    }}
                  />
                )}
                {resilience > 0 && (
                  <Chip
                    label={`-${Math.min(50, resilience * 0.5)}% Decay (Res)`}
                    size="small"
                    sx={{
                      height: 24,
                      fontSize: '0.7rem',
                      bgcolor: `${tokens.colors.success}20`,
                      color: tokens.colors.success,
                      border: `1px solid ${tokens.colors.success}`,
                    }}
                  />
                )}
              </Box>
            </Box>
          )}

          {/* Items (if any) */}
          {inventoryItems.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography sx={{ fontSize: '0.75rem', color: tokens.colors.text.disabled, mb: 1, letterSpacing: '0.05em' }}>
                ITEMS ({inventoryItems.length})
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', color: tokens.colors.text.secondary }}>
                {inventoryItems.join(', ')}
              </Typography>
            </Box>
          )}

          {/* Domain Progress */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography sx={{ fontSize: '0.75rem', color: tokens.colors.text.disabled }}>
              Events cleared:
            </Typography>
            <Typography sx={{ ...gamingFont, fontSize: '0.9rem', color: tokens.colors.text.primary }}>
              {clearedCount}/{totalZones}
            </Typography>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
