/**
 * AsciiPlanetOverlay - ASCII art globe that replaces the 3D mesh
 *
 * Renders a spherical ASCII pattern with domain coloring.
 * Character density creates the illusion of depth/volume.
 * Matches reticle aesthetic - same line weight, transparency, glow.
 *
 * NEVER DIE GUY
 */

import { useRef, useEffect, useMemo } from 'react';
import { Box } from '@mui/material';
import { DOMAIN_PLANET_CONFIG } from '../config';

interface AsciiPlanetOverlayProps {
  /** Domain ID (1-6) for color theming */
  domainId: number;
  /** Size of the overlay in pixels */
  size?: number;
  /** Character size in pixels */
  charSize?: number;
  /** Opacity of the overlay (0-1) */
  opacity?: number;
  /** Enable subtle animation */
  animated?: boolean;
}

// ASCII gradient - sparse to dense (matches reticle thin-line aesthetic)
const CHAR_GRADIENT = ' .:-=+*#@';

// Generate procedural sphere pattern with shading
function generateSphereAscii(cols: number, rows: number): { char: string; brightness: number }[][] {
  const result: { char: string; brightness: number }[][] = [];
  const centerX = cols / 2;
  const centerY = rows / 2;
  const maxRadius = Math.min(cols, rows) / 2 - 1;

  for (let y = 0; y < rows; y++) {
    const row: { char: string; brightness: number }[] = [];
    for (let x = 0; x < cols; x++) {
      const dx = x - centerX;
      const dy = (y - centerY) * 2.0; // Compensate for character aspect ratio
      const dist = Math.sqrt(dx * dx + dy * dy);
      const normalizedDist = dist / maxRadius;

      if (normalizedDist > 1.0) {
        row.push({ char: ' ', brightness: 0 });
      } else {
        // Sphere normal calculation
        const nx = dx / maxRadius;
        const ny = dy / maxRadius / 2.0;
        const nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny));

        // Light from upper-left
        const lightX = -0.4;
        const lightY = -0.3;
        const lightZ = 0.8;
        const lightDot = nx * lightX + ny * lightY + nz * lightZ;

        // Base brightness from lighting
        let brightness = Math.max(0.05, Math.min(1, (lightDot + 0.5) * 0.8));

        // Add subtle noise for terrain texture
        const noise = Math.sin(x * 0.7 + y * 0.5) * 0.08 + Math.cos(x * 0.4 - y * 0.6) * 0.06;
        brightness = Math.max(0.05, Math.min(1, brightness + noise));

        // Rim lighting - brighter at edges for that "volume" feel
        const rimFactor = 1 - nz;
        brightness = Math.min(1, brightness + rimFactor * 0.15);

        // Map brightness to character
        const charIndex = Math.floor(brightness * (CHAR_GRADIENT.length - 1));
        row.push({ char: CHAR_GRADIENT[charIndex], brightness });
      }
    }
    result.push(row);
  }

  return result;
}

export function AsciiPlanetOverlay({
  domainId,
  size = 400,
  charSize = 12,
  opacity = 0.85,
  animated = true,
}: AsciiPlanetOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);
  const animationRef = useRef<number | undefined>(undefined);

  // Get domain-specific colors
  const domainConfig = DOMAIN_PLANET_CONFIG[domainId] || DOMAIN_PLANET_CONFIG[1];
  const primaryColor = domainConfig.color;
  const glowColor = domainConfig.glowColor;

  // Calculate grid dimensions - wider chars need adjustment
  const charWidth = charSize * 0.6;
  const cols = Math.floor(size / charWidth);
  const rows = Math.floor(size / charSize);

  // Generate sphere pattern
  const spherePattern = useMemo(() => generateSphereAscii(cols, rows), [cols, rows]);

  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Set up font - monospace for consistent spacing
      ctx.font = `${charSize}px "Courier New", Courier, monospace`;
      ctx.textBaseline = 'top';

      const time = animated ? frameRef.current * 0.015 : 0;

      // Draw each character
      for (let y = 0; y < spherePattern.length; y++) {
        const row = spherePattern[y];
        for (let x = 0; x < row.length; x++) {
          const { char, brightness } = row[x];
          if (char === ' ') continue;

          // Calculate position
          const px = x * charWidth;
          const py = y * charSize;

          // Subtle breathing animation - varies with position for organic feel
          const breathe = animated
            ? 0.85 + 0.15 * Math.sin(time + x * 0.05 + y * 0.07)
            : 1.0;

          // Color interpolation based on brightness
          // Brighter areas get glow color, darker get primary
          const alpha = brightness * breathe * opacity;

          ctx.fillStyle = brightness > 0.5 ? glowColor : primaryColor;
          ctx.globalAlpha = alpha;
          ctx.fillText(char, px, py);
        }
      }

      frameRef.current++;

      if (animated) {
        animationRef.current = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [spherePattern, charSize, charWidth, primaryColor, glowColor, opacity, animated]);

  return (
    <Box
      sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
        zIndex: 5,
      }}
    >
      {/* Glow backing - soft radial gradient for volume */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: size * 0.85,
          height: size * 0.85,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${primaryColor}25 0%, ${primaryColor}10 40%, transparent 70%)`,
          filter: 'blur(20px)',
        }}
      />

      {/* ASCII canvas */}
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        style={{
          width: size,
          height: size,
          position: 'relative',
        }}
      />
    </Box>
  );
}

export default AsciiPlanetOverlay;
