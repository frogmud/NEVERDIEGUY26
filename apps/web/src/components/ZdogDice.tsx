/**
 * ZdogDice - 3D dice rendered with Zdog
 * Supports d4, d6, d8, d10, d12, d20 with hover interactions
 */

import { useRef, useEffect, useState } from 'react';
import { Anchor, Shape, Rect, Illustration, TAU } from 'zdog';
import { Box } from '@mui/material';

interface ZdogDiceProps {
  sides: 4 | 6 | 8 | 10 | 12 | 20;
  size?: number;
  color: string;
  glowColor?: string;
  selected?: boolean;
  onClick?: () => void;
}

// Golden ratio for icosahedron/dodecahedron
const PHI = (1 + Math.sqrt(5)) / 2;

export function ZdogDice({ sides, size = 48, color, glowColor, selected, onClick }: ZdogDiceProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const illoRef = useRef<Illustration | null>(null);
  const shapeRef = useRef<Anchor | null>(null);
  const animationRef = useRef<number | null>(null);

  // Use refs for animation state to avoid re-renders
  const isHoveredRef = useRef(false);
  const isSelectedRef = useRef(selected || false);
  const targetRotationRef = useRef({ x: 0, y: 0 });
  const currentRotationRef = useRef({ x: 0, y: 0 });
  const idleTimeRef = useRef(0);

  const [isHovered, setIsHovered] = useState(false);

  // Keep selected ref in sync
  useEffect(() => {
    isSelectedRef.current = selected || false;
  }, [selected]);

  // Initialize Zdog once
  useEffect(() => {
    if (!canvasRef.current) return;

    const illo = new Illustration({
      element: canvasRef.current,
      dragRotate: false,
      resize: false,
    });

    illoRef.current = illo;

    // Create the shape
    const anchor = new Anchor({ addTo: illo });
    const scale = size * 0.35;

    switch (sides) {
      case 4:
        createTetrahedron(anchor, scale, color);
        break;
      case 6:
        createCube(anchor, scale, color);
        break;
      case 8:
        createOctahedron(anchor, scale, color);
        break;
      case 10:
        createD10(anchor, scale, color);
        break;
      case 12:
        createDodecahedron(anchor, scale, color);
        break;
      case 20:
        createIcosahedron(anchor, scale, color);
        break;
    }

    shapeRef.current = anchor;

    // Animation loop - use refs to avoid re-renders
    let lastTime = performance.now();

    const animate = () => {
      const now = performance.now();
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      if (shapeRef.current) {
        if (isHoveredRef.current) {
          // Lerp to target rotation on hover
          const lerpFactor = 0.12;
          currentRotationRef.current.x += (targetRotationRef.current.x - currentRotationRef.current.x) * lerpFactor;
          currentRotationRef.current.y += (targetRotationRef.current.y - currentRotationRef.current.y) * lerpFactor;
          shapeRef.current.rotate.x = currentRotationRef.current.x;
          shapeRef.current.rotate.y = currentRotationRef.current.y;
        } else {
          // Idle animation - gentle wobble
          idleTimeRef.current += delta;
          const wobbleX = Math.sin(idleTimeRef.current * 0.5) * 0.15;
          const wobbleY = Math.cos(idleTimeRef.current * 0.7) * 0.2 + idleTimeRef.current * 0.1;
          shapeRef.current.rotate.x = wobbleX;
          shapeRef.current.rotate.y = wobbleY;
          // Sync current rotation for smooth transition
          currentRotationRef.current.x = wobbleX;
          currentRotationRef.current.y = wobbleY;
        }
      }

      illo.updateRenderGraph();
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [sides, size, color]);

  // Handle mouse move for tilt
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || selected) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Convert to rotation (-0.6 to 0.6 radians)
    targetRotationRef.current.x = ((centerY - y) / centerY) * 0.6;
    targetRotationRef.current.y = ((x - centerX) / centerX) * 0.6;
  };

  const handleMouseEnter = () => {
    isHoveredRef.current = true;
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    isHoveredRef.current = false;
    setIsHovered(false);
  };

  const handleClick = () => {
    onClick?.();
  };

  // Determine transform and filter based on state
  const getTransform = () => {
    if (selected) return 'translateY(-20px) scale(1.25)';
    if (isHovered) return 'translateY(-12px) scale(1.15)';
    return 'translateY(0) scale(1)';
  };

  const getFilter = () => {
    const glowCol = glowColor || color;
    if (selected) {
      return `drop-shadow(0 20px 30px rgba(0,0,0,0.5)) drop-shadow(0 0 25px ${glowCol}80)`;
    }
    if (isHovered) {
      return `drop-shadow(0 12px 20px rgba(0,0,0,0.4)) drop-shadow(0 0 15px ${glowCol}50)`;
    }
    return 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))';
  };

  return (
    <Box
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      sx={{
        cursor: 'pointer',
        p: 1.5,
        m: -1.5,
        transition: 'transform 0.3s ease-out, filter 0.3s ease-out',
        transform: getTransform(),
        filter: getFilter(),
      }}
    >
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        style={{ display: 'block' }}
      />
    </Box>
  );
}

// ============================================
// Shape Builders
// ============================================

function createTetrahedron(anchor: Anchor, scale: number, color: string) {
  const h = scale;
  const vertices = [
    { x: 0, y: -h, z: 0 },
    { x: h * 0.94, y: h * 0.33, z: 0 },
    { x: -h * 0.47, y: h * 0.33, z: h * 0.82 },
    { x: -h * 0.47, y: h * 0.33, z: -h * 0.82 },
  ];

  const faces = [
    [0, 1, 2],
    [0, 2, 3],
    [0, 3, 1],
    [1, 3, 2],
  ];

  faces.forEach((face, i) => {
    const shade = 1 - i * 0.15;
    new Shape({
      addTo: anchor,
      path: face.map(idx => vertices[idx]),
      color: shadeColor(color, shade),
      fill: true,
      stroke: 1,
    });
  });
}

function createCube(anchor: Anchor, scale: number, color: string) {
  const s = scale * 0.8;

  // Front
  new Rect({
    addTo: anchor,
    width: s * 2,
    height: s * 2,
    translate: { z: s },
    color: shadeColor(color, 1),
    fill: true,
    stroke: 1,
  });

  // Back
  new Rect({
    addTo: anchor,
    width: s * 2,
    height: s * 2,
    translate: { z: -s },
    color: shadeColor(color, 0.6),
    fill: true,
    stroke: 1,
  });

  // Top
  new Rect({
    addTo: anchor,
    width: s * 2,
    height: s * 2,
    translate: { y: -s },
    rotate: { x: TAU / 4 },
    color: shadeColor(color, 0.9),
    fill: true,
    stroke: 1,
  });

  // Bottom
  new Rect({
    addTo: anchor,
    width: s * 2,
    height: s * 2,
    translate: { y: s },
    rotate: { x: TAU / 4 },
    color: shadeColor(color, 0.5),
    fill: true,
    stroke: 1,
  });

  // Right
  new Rect({
    addTo: anchor,
    width: s * 2,
    height: s * 2,
    translate: { x: s },
    rotate: { y: TAU / 4 },
    color: shadeColor(color, 0.8),
    fill: true,
    stroke: 1,
  });

  // Left
  new Rect({
    addTo: anchor,
    width: s * 2,
    height: s * 2,
    translate: { x: -s },
    rotate: { y: TAU / 4 },
    color: shadeColor(color, 0.7),
    fill: true,
    stroke: 1,
  });
}

function createOctahedron(anchor: Anchor, scale: number, color: string) {
  const s = scale;
  const vertices = [
    { x: 0, y: -s, z: 0 }, // top
    { x: s, y: 0, z: 0 },
    { x: 0, y: 0, z: s },
    { x: -s, y: 0, z: 0 },
    { x: 0, y: 0, z: -s },
    { x: 0, y: s, z: 0 }, // bottom
  ];

  const faces = [
    [0, 1, 2], [0, 2, 3], [0, 3, 4], [0, 4, 1],
    [5, 2, 1], [5, 3, 2], [5, 4, 3], [5, 1, 4],
  ];

  faces.forEach((face, i) => {
    const shade = 0.6 + (i % 4) * 0.1;
    new Shape({
      addTo: anchor,
      path: face.map(idx => vertices[idx]),
      color: shadeColor(color, shade),
      fill: true,
      stroke: 1,
    });
  });
}

function createD10(anchor: Anchor, scale: number, color: string) {
  // Simplified d10 as a bipyramid with pentagonal cross-section
  const s = scale;
  const angle = TAU / 5;

  const midVertices = [];
  for (let i = 0; i < 5; i++) {
    midVertices.push({
      x: Math.cos(angle * i) * s,
      y: 0,
      z: Math.sin(angle * i) * s,
    });
  }

  const top = { x: 0, y: -s * 1.2, z: 0 };
  const bottom = { x: 0, y: s * 1.2, z: 0 };

  // Top faces
  for (let i = 0; i < 5; i++) {
    const next = (i + 1) % 5;
    new Shape({
      addTo: anchor,
      path: [top, midVertices[i], midVertices[next]],
      color: shadeColor(color, 0.7 + i * 0.06),
      fill: true,
      stroke: 1,
    });
  }

  // Bottom faces
  for (let i = 0; i < 5; i++) {
    const next = (i + 1) % 5;
    new Shape({
      addTo: anchor,
      path: [bottom, midVertices[next], midVertices[i]],
      color: shadeColor(color, 0.5 + i * 0.06),
      fill: true,
      stroke: 1,
    });
  }
}

function createDodecahedron(anchor: Anchor, scale: number, color: string) {
  const s = scale * 0.6;

  // Dodecahedron vertices
  const vertices = [
    // Cube vertices (±1, ±1, ±1)
    { x: s, y: s, z: s },
    { x: s, y: s, z: -s },
    { x: s, y: -s, z: s },
    { x: s, y: -s, z: -s },
    { x: -s, y: s, z: s },
    { x: -s, y: s, z: -s },
    { x: -s, y: -s, z: s },
    { x: -s, y: -s, z: -s },
    // Rectangle vertices
    { x: 0, y: s / PHI, z: s * PHI },
    { x: 0, y: s / PHI, z: -s * PHI },
    { x: 0, y: -s / PHI, z: s * PHI },
    { x: 0, y: -s / PHI, z: -s * PHI },
    { x: s / PHI, y: s * PHI, z: 0 },
    { x: s / PHI, y: -s * PHI, z: 0 },
    { x: -s / PHI, y: s * PHI, z: 0 },
    { x: -s / PHI, y: -s * PHI, z: 0 },
    { x: s * PHI, y: 0, z: s / PHI },
    { x: s * PHI, y: 0, z: -s / PHI },
    { x: -s * PHI, y: 0, z: s / PHI },
    { x: -s * PHI, y: 0, z: -s / PHI },
  ];

  const faces = [
    [0, 8, 10, 2, 16], [0, 16, 17, 1, 12], [0, 12, 14, 4, 8],
    [1, 17, 3, 11, 9], [1, 9, 5, 14, 12], [2, 10, 6, 15, 13],
    [2, 13, 3, 17, 16], [3, 13, 15, 7, 11], [4, 14, 5, 19, 18],
    [4, 18, 6, 10, 8], [5, 9, 11, 7, 19], [6, 18, 19, 7, 15],
  ];

  faces.forEach((face, i) => {
    const shade = 0.5 + (i / faces.length) * 0.5;
    new Shape({
      addTo: anchor,
      path: face.map(idx => vertices[idx]),
      color: shadeColor(color, shade),
      fill: true,
      stroke: 1,
    });
  });
}

function createIcosahedron(anchor: Anchor, scale: number, color: string) {
  const s = scale * 0.7;

  // Icosahedron vertices
  const vertices = [
    { x: 0, y: -s, z: -s * PHI },
    { x: 0, y: -s, z: s * PHI },
    { x: 0, y: s, z: -s * PHI },
    { x: 0, y: s, z: s * PHI },
    { x: -s, y: -s * PHI, z: 0 },
    { x: -s, y: s * PHI, z: 0 },
    { x: s, y: -s * PHI, z: 0 },
    { x: s, y: s * PHI, z: 0 },
    { x: -s * PHI, y: 0, z: -s },
    { x: -s * PHI, y: 0, z: s },
    { x: s * PHI, y: 0, z: -s },
    { x: s * PHI, y: 0, z: s },
  ];

  const faces = [
    [0, 2, 10], [0, 10, 6], [0, 6, 4], [0, 4, 8], [0, 8, 2],
    [3, 1, 11], [3, 11, 7], [3, 7, 5], [3, 5, 9], [3, 9, 1],
    [1, 6, 11], [6, 10, 11], [10, 7, 11], [7, 2, 10], [2, 5, 7],
    [5, 8, 2], [8, 9, 5], [9, 4, 8], [4, 1, 9], [1, 4, 6],
  ];

  faces.forEach((face, i) => {
    const shade = 0.5 + (i / faces.length) * 0.5;
    new Shape({
      addTo: anchor,
      path: face.map(idx => vertices[idx]),
      color: shadeColor(color, shade),
      fill: true,
      stroke: 1,
    });
  });
}

// Utility to shade a color
function shadeColor(hex: string, factor: number): string {
  // Handle rgba or hex
  if (hex.startsWith('rgba') || hex.startsWith('rgb')) {
    return hex;
  }

  // Remove # if present
  hex = hex.replace('#', '');

  // Handle shorthand hex
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }

  // Handle hex with alpha (8 chars)
  const hasAlpha = hex.length === 8;
  const alpha = hasAlpha ? hex.slice(6, 8) : '';
  hex = hex.slice(0, 6);

  const r = Math.round(parseInt(hex.slice(0, 2), 16) * factor);
  const g = Math.round(parseInt(hex.slice(2, 4), 16) * factor);
  const b = Math.round(parseInt(hex.slice(4, 6), 16) * factor);

  const clamp = (v: number) => Math.min(255, Math.max(0, v));

  return `#${clamp(r).toString(16).padStart(2, '0')}${clamp(g).toString(16).padStart(2, '0')}${clamp(b).toString(16).padStart(2, '0')}${alpha}`;
}
