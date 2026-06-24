/**
 * HUDReticle - Fixed center-screen targeting reticle.
 * Shows stacked die shapes for all unheld dice - scales with zoom.
 * Lifted out of CombatTerminal (behavior unchanged).
 */
import { Box } from '@mui/material';
import { tokens } from '../../../../theme';
import { GLOBE_CONFIG } from '../../../../games/globe-meteor/config';
import { DIE_SHAPES, DIE_SIZES, getDieColor } from './dieVisuals';

/**
 * Single die reticle layer - subtle outline only
 */
function DieReticleLayer({ dieType, baseSize }: { dieType: number; baseSize: number }) {
  const shape = DIE_SHAPES[dieType] || DIE_SHAPES[6];
  const color = getDieColor(dieType);
  const sizeMultiplier = DIE_SIZES[dieType] || 0.5;
  const size = baseSize * sizeMultiplier;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      }}
    >
      {/* Outline only - subtle */}
      <polygon
        points={shape.points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        opacity="0.5"
      />
    </svg>
  );
}

/**
 * HUDReticle - Fixed center-screen targeting reticle
 * Shows stacked die shapes for all unheld dice - scales with zoom
 */
export function HUDReticle({
  dice,
  zoomScale = GLOBE_CONFIG.camera.initialDistance,
  domainScale = 1
}: {
  dice: Array<{ sides: number; id: string }>;
  zoomScale?: number;
  domainScale?: number;
}) {
  // Base size at default zoom - represents the spread area on planet
  const baseSize = 200; // 2x larger for better visibility

  // Scale inversely with distance (closer = bigger reticle, farther = smaller)
  // Also scale with domain size (bigger planets = bigger spread area)
  const defaultDistance = GLOBE_CONFIG.camera.initialDistance;
  const zoomFactor = defaultDistance / Math.max(zoomScale, GLOBE_CONFIG.camera.minDistance);
  const adjustedSize = baseSize * zoomFactor * domainScale;

  // Clamp to reasonable bounds
  const finalSize = Math.max(60, Math.min(200, adjustedSize));

  // Sort dice by size (largest first so they render behind)
  const sortedDice = [...dice].sort((a, b) => b.sides - a.sides);

  // Get the primary color (largest die)
  const primaryColor = sortedDice.length > 0 ? getDieColor(sortedDice[0].sides) : tokens.colors.secondary;

  return (
    <Box sx={{ position: 'relative', width: finalSize, height: finalSize }}>
      {/* Stacked die shapes (largest in back) */}
      {sortedDice.map((die) => (
        <DieReticleLayer key={die.id} dieType={die.sides} baseSize={finalSize} />
      ))}

      {/* Center dot - subtle */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 4,
          height: 4,
          bgcolor: primaryColor,
          borderRadius: '50%',
          opacity: 0.6,
        }}
      />
    </Box>
  );
}
