/**
 * GameTabNarrativeFork - Narrative-based zone selection
 *
 * Replaces GameTabLaunch with minimal text choices.
 * Zone type (stable/elite/anomaly) is hidden until selection.
 */

import { Box, Typography, ButtonBase } from '@mui/material';
import { tokens } from '../../../../theme';
import { NarrativeFork } from '../../../../games/meteor/components';
import type { ZoneType } from '../../../../data/narrativeForks';
import type { ZoneMarker } from '../../../../types/zones';

interface GameTabNarrativeForkProps {
  /** Current domain slug */
  domainSlug: string;
  /** Domain display name */
  domainName: string;
  /** Available zones in this domain */
  zones: ZoneMarker[];
  /** Called when player selects a narrative path */
  onSelectPath: (zone: ZoneMarker) => void;
  /** Called to go back to lobby */
  onBack?: () => void;
  /** Heat accumulated from skips */
  heat?: number;
  /** Disable during transitions */
  disabled?: boolean;
}

// Map zone type to zone position
// stable = first zone, elite = second, anomaly = third
const ZONE_TYPE_TO_POSITION: Record<ZoneType, number> = {
  stable: 0,
  elite: 1,
  anomaly: 2,
};

export function GameTabNarrativeFork({
  domainSlug,
  domainName,
  zones,
  onSelectPath,
  onBack,
  heat = 0,
  disabled = false,
}: GameTabNarrativeForkProps) {
  const handleSelect = (zoneType: ZoneType, isSkip: boolean) => {
    if (isSkip) {
      // Skip penalty - could trigger heat increase here
      // For now, select the stable zone with a skip flag
      const stableZone = zones[ZONE_TYPE_TO_POSITION.stable];
      if (stableZone) {
        onSelectPath(stableZone);
      }
      return;
    }

    // Map zone type to actual zone
    const zoneIndex = ZONE_TYPE_TO_POSITION[zoneType];
    const selectedZone = zones[zoneIndex];

    if (selectedZone) {
      onSelectPath(selectedZone);
    }
  };

  return (
    <Box
      sx={{
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1.5,
          mb: 2,
        }}
      >
        <Box
          component="img"
          src="/logos/ndg-skull-dome.svg"
          alt="NEVERDIEGUY"
          sx={{ width: 32, height: 36 }}
        />
        <Typography
          sx={{
            fontFamily: tokens.fonts.gaming,
            fontSize: '1rem',
            letterSpacing: '0.05em',
            color: tokens.colors.text.primary,
            textTransform: 'uppercase',
          }}
        >
          {domainName}
        </Typography>
      </Box>

      {/* Heat indicator (if accumulated from skips) */}
      {heat > 0 && (
        <Typography
          sx={{
            fontSize: '0.75rem',
            color: tokens.colors.error,
            textAlign: 'center',
            mb: 1,
          }}
        >
          Heat: +{Math.round(heat * 100)}%
        </Typography>
      )}

      {/* Narrative Fork */}
      <NarrativeFork
        domainSlug={domainSlug}
        onSelect={handleSelect}
        showSkip={heat < 0.6} // Hide skip after too much heat
        disabled={disabled}
      />

      {/* Spacer */}
      <Box sx={{ flex: 1 }} />

      {/* Back Link */}
      <ButtonBase
        onClick={onBack}
        sx={{
          mt: 2,
          py: 1,
          color: tokens.colors.text.secondary,
          fontSize: '0.875rem',
          '&:hover': { color: tokens.colors.text.primary },
        }}
      >
        Abandon Run
      </ButtonBase>
    </Box>
  );
}
