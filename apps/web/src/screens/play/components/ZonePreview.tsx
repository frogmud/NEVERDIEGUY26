/**
 * ZonePreview - Sidebar preview of selected zone before launching attack
 *
 * Shows minimap with domain background, zone info, rewards, and launch button.
 * NEVER DIE GUY
 */

import { Box, Button, Typography, Chip, Divider } from '@mui/material';
import {
  RocketLaunchSharp as LaunchIcon,
  StarSharp as TierIcon,
  MonetizationOnSharp as GoldIcon,
  WarningSharp as BossIcon,
} from '@mui/icons-material';

import { ZoneMarker } from '../../../types/zones';
import { tokens } from '../../../theme';

interface ZonePreviewProps {
  zone: ZoneMarker;
  domainBackground: string;
  domainName: string;
  onLaunch: () => void;
}

// Zone type labels
const ZONE_TYPE_LABELS = {
  stable: 'Stable Zone',
  elite: 'Elite Zone',
  anomaly: 'Anomaly Zone',
};

// Zone type colors
const ZONE_TYPE_COLORS = {
  stable: '#44ff44',
  elite: '#ffaa00',
  anomaly: '#ff4444',
};

export function ZonePreview({
  zone,
  domainBackground,
  domainName,
  onLaunch,
}: ZonePreviewProps) {
  const typeColor = ZONE_TYPE_COLORS[zone.type];

  return (
    <Box sx={{ p: 2 }}>
      {/* Minimap preview with domain background */}
      <Box
        sx={{
          aspectRatio: '16/10',
          borderRadius: 2,
          overflow: 'hidden',
          position: 'relative',
          mb: 2,
          border: `2px solid ${typeColor}`,
          boxShadow: `0 0 20px ${typeColor}40`,
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${domainBackground})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'brightness(0.7)',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(180deg, transparent 50%, ${tokens.colors.background.default}ee 100%)`,
          }}
        />

        {/* Zone type badge */}
        <Box sx={{ position: 'absolute', top: 8, left: 8 }}>
          <Chip
            label={ZONE_TYPE_LABELS[zone.type]}
            size="small"
            sx={{
              bgcolor: `${typeColor}33`,
              color: typeColor,
              fontWeight: 600,
              fontSize: '0.7rem',
              borderRadius: 1,
            }}
          />
        </Box>

        {/* Tier badge */}
        <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
          <Chip
            icon={<TierIcon sx={{ fontSize: 14, color: tokens.colors.secondary }} />}
            label={`Tier ${zone.tier}`}
            size="small"
            sx={{
              bgcolor: `${tokens.colors.secondary}33`,
              color: tokens.colors.secondary,
              fontWeight: 600,
              fontSize: '0.7rem',
              borderRadius: 1,
            }}
          />
        </Box>

        {/* Domain name */}
        <Box sx={{ position: 'absolute', bottom: 8, left: 8, right: 8 }}>
          <Typography
            sx={{
              fontFamily: tokens.fonts.gaming,
              fontSize: '0.9rem',
              color: tokens.colors.text.primary,
              textShadow: '0 2px 4px rgba(0,0,0,0.8)',
            }}
          >
            {domainName}
          </Typography>
        </Box>
      </Box>

      {/* Zone info */}
      <Box sx={{ mb: 2 }}>
        <Typography
          variant="h6"
          sx={{
            fontFamily: tokens.fonts.gaming,
            color: typeColor,
            mb: 0.5,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          {zone.type === 'anomaly' && <BossIcon sx={{ fontSize: 20 }} />}
          {ZONE_TYPE_LABELS[zone.type]}
        </Typography>
        <Typography variant="body2" sx={{ color: tokens.colors.text.secondary }}>
          {zone.type === 'anomaly'
            ? 'Defeat the boss to clear this zone'
            : zone.type === 'elite'
            ? 'Stronger enemies with better rewards'
            : 'Standard encounter with balanced difficulty'}
        </Typography>
      </Box>

      <Divider sx={{ my: 2, borderColor: tokens.colors.border }} />

      {/* Rewards preview */}
      <Box sx={{ mb: 2 }}>
        <Typography
          variant="caption"
          sx={{
            color: tokens.colors.text.secondary,
            textTransform: 'uppercase',
            fontWeight: 600,
            letterSpacing: 1,
          }}
        >
          Potential Rewards
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
          <GoldIcon sx={{ fontSize: 20, color: '#ffd700' }} />
          <Typography sx={{ color: tokens.colors.text.primary }}>
            {zone.rewards.goldMin} - {zone.rewards.goldMax} Gold
          </Typography>
        </Box>
        <Typography
          variant="caption"
          sx={{ color: tokens.colors.text.secondary, mt: 0.5, display: 'block' }}
        >
          Loot Tier: {zone.rewards.lootTier}
        </Typography>
      </Box>

      {/* Combat stats */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="caption"
          sx={{
            color: tokens.colors.text.secondary,
            textTransform: 'uppercase',
            fontWeight: 600,
            letterSpacing: 1,
          }}
        >
          Combat Info
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
          <Box>
            <Typography variant="caption" sx={{ color: tokens.colors.text.secondary }}>
              Score Goal
            </Typography>
            <Typography sx={{ color: tokens.colors.text.primary, fontWeight: 600 }}>
              {1000 * zone.tier}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: tokens.colors.text.secondary }}>
              Event Type
            </Typography>
            <Typography sx={{ color: tokens.colors.text.primary, fontWeight: 600 }}>
              {zone.eventType.charAt(0).toUpperCase() + zone.eventType.slice(1)}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Launch button */}
      <Button
        fullWidth
        variant="contained"
        onClick={onLaunch}
        startIcon={<LaunchIcon />}
        sx={{
          py: 1.5,
          bgcolor: typeColor,
          fontFamily: tokens.fonts.gaming,
          fontSize: '1rem',
          '&:hover': {
            bgcolor: typeColor,
            filter: 'brightness(1.2)',
          },
        }}
      >
        LAUNCH ATTACK
      </Button>
    </Box>
  );
}

export default ZonePreview;
