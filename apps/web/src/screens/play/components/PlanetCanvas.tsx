import { Box } from '@mui/material';
import { tokens } from '../../../theme';

interface PlanetCanvasProps {
  size?: number | string;
}

/**
 * Placeholder for the game canvas where the planet/sphere will be rendered.
 * Will be replaced by Phaser/Three.js canvas when engine is integrated.
 */
export function PlanetCanvas({ size = '100%' }: PlanetCanvasProps) {
  return (
    <Box
      sx={{
        width: typeof size === 'number' ? size : size,
        maxWidth: 500,
        aspectRatio: '1 / 1',
        borderRadius: '50%',
        backgroundColor: '#1a1a1a',
        boxShadow: `inset 0 0 60px rgba(0, 0, 0, 0.5)`,
        // Subtle gradient to give depth
        background: `radial-gradient(circle at 30% 30%, #2a2a2a 0%, #1a1a1a 50%, #0a0a0a 100%)`,
      }}
    />
  );
}
