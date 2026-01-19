/**
 * AsciiDomainViewer - Interactive ASCII-style 3D domain viewer
 *
 * A lightweight viewer for wiki domain pages that renders the domain's
 * planet in ASCII art style. Supports mouse interaction for rotation.
 *
 * NEVER DIE GUY
 */

import { useRef, useMemo, useEffect, useState, useCallback, Suspense } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { tokens } from '../theme';

// Domain color configurations (matches game config)
const DOMAIN_COLORS: Record<string, { base: string; glow: string; element: string; accent: string }> = {
  'null-providence': { base: '#e8e8e8', glow: '#ffffff', element: 'Void', accent: '#1a1a2e' },
  'earth': { base: '#8b7355', glow: '#c4a882', element: 'Earth', accent: '#4a3728' },
  'shadow-keep': { base: '#4a3860', glow: '#8b6ba0', element: 'Death', accent: '#2d2d44' },
  'infernus': { base: '#d84315', glow: '#ff6e40', element: 'Fire', accent: '#8b2500' },
  'frost-reach': { base: '#81d4fa', glow: '#e1f5fe', element: 'Ice', accent: '#4a6fa5' },
  'aberrant': { base: '#2a6a6a', glow: '#4a9a9a', element: 'Chaos', accent: '#4a0080' },
  // Fallbacks for other domains
  'default': { base: '#6b7280', glow: '#9ca3af', element: 'Neutral', accent: '#374151' },
};

// APL character set for ASCII rendering
const APL_CHARS = ' .·∘⋄○⌽⊖⌾⍉←→↑↓⍳⍴~∊⊂⊃∩∪⌷⍸⌹⍟⍱⍲∧∨⊥⊤⌈⌊⍋⍒⍎⍕⌺⍝⎕⍞⌸⍷≡≢';

interface AsciiDomainViewerProps {
  domainSlug: string;
  height?: number;
  cellSize?: number;
  autoRotate?: boolean;
}

/**
 * DomainSphere - The 3D sphere representing the domain planet
 */
function DomainSphere({ color, autoRotate }: { color: string; autoRotate: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (meshRef.current && autoRotate) {
      meshRef.current.rotation.y += delta * 0.15;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[2, 32, 32]} />
      <meshStandardMaterial
        color={color}
        roughness={0.7}
        metalness={0.1}
        emissive={color}
        emissiveIntensity={0.1}
      />
    </mesh>
  );
}

/**
 * AsciiOverlay - Canvas overlay that renders ASCII effect
 */
function AsciiOverlay({
  color,
  glowColor,
  cellSize,
}: {
  color: string;
  glowColor: string;
  cellSize: number;
}) {
  const { gl, scene, camera, size } = useThree();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const pixelsRef = useRef<Uint8Array | null>(null);

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const width = Math.floor(size.width * dpr);
  const height = Math.floor(size.height * dpr);

  const renderTarget = useMemo(() => {
    return new THREE.WebGLRenderTarget(width, height, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      colorSpace: THREE.SRGBColorSpace,
    });
  }, [width, height]);

  useEffect(() => {
    pixelsRef.current = new Uint8Array(width * height * 4);
  }, [width, height]);

  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '10';
    canvas.width = width;
    canvas.height = height;

    const container = gl.domElement.parentElement;
    if (container) {
      container.style.position = 'relative';
      container.appendChild(canvas);
    }

    canvasRef.current = canvas;
    ctxRef.current = canvas.getContext('2d', { alpha: false });

    return () => {
      if (canvas.parentElement) {
        canvas.parentElement.removeChild(canvas);
      }
      canvasRef.current = null;
      ctxRef.current = null;
    };
  }, [gl.domElement, width, height]);

  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.width = width;
      canvasRef.current.height = height;
    }
  }, [width, height]);

  useFrame(() => {
    if (!ctxRef.current || !canvasRef.current || !pixelsRef.current) return;

    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    const pixels = pixelsRef.current;

    const currentRT = gl.getRenderTarget();
    gl.setRenderTarget(renderTarget);
    gl.clear();
    gl.render(scene, camera);
    gl.readRenderTargetPixels(renderTarget, 0, 0, width, height, pixels);
    gl.setRenderTarget(currentRT);

    // Dark background
    ctx.fillStyle = '#0a0a0c';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const fontSize = Math.floor(cellSize * dpr);
    ctx.font = `${fontSize}px "IBM Plex Mono", "Menlo", monospace`;
    ctx.textBaseline = 'top';

    const charWidth = fontSize * 0.6;
    const charHeight = fontSize;
    const cols = Math.floor(width / charWidth);
    const rows = Math.floor(height / charHeight);

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const px = Math.floor((col + 0.5) * charWidth);
        const py = Math.floor((row + 0.5) * charHeight);
        const flippedY = height - 1 - py;

        if (px < 0 || px >= width || flippedY < 0 || flippedY >= height) continue;

        const idx = (flippedY * width + px) * 4;
        const r = pixels[idx] / 255;
        const g = pixels[idx + 1] / 255;
        const b = pixels[idx + 2] / 255;

        let brightness = 0.299 * r + 0.587 * g + 0.114 * b;
        brightness = Math.pow(brightness, 1 / 1.6);

        const charIndex = Math.floor(brightness * (APL_CHARS.length - 1));
        const char = APL_CHARS[Math.max(0, Math.min(APL_CHARS.length - 1, charIndex))];

        if (char === ' ' || brightness < 0.02) continue;

        ctx.fillStyle = brightness > 0.5 ? glowColor : color;
        ctx.globalAlpha = 0.6 + brightness * 0.4;
        ctx.fillText(char, col * charWidth, row * charHeight);
      }
    }
    ctx.globalAlpha = 1;
  }, 100);

  useEffect(() => {
    return () => {
      renderTarget.dispose();
    };
  }, [renderTarget]);

  return null;
}

/**
 * SceneContent - The 3D scene contents
 */
function SceneContent({
  domainColor,
  glowColor,
  cellSize,
  autoRotate,
}: {
  domainColor: string;
  glowColor: string;
  cellSize: number;
  autoRotate: boolean;
}) {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
      <pointLight position={[-5, -5, -5]} intensity={0.3} color={glowColor} />

      {/* Planet */}
      <DomainSphere color={domainColor} autoRotate={autoRotate} />

      {/* Stars background */}
      <Stars radius={50} depth={30} count={500} factor={3} fade speed={0.5} />

      {/* Camera controls */}
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        rotateSpeed={0.5}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={(Math.PI * 3) / 4}
      />

      {/* ASCII overlay */}
      <AsciiOverlay color={domainColor} glowColor={glowColor} cellSize={cellSize} />
    </>
  );
}

/**
 * AsciiDomainViewer - Main component
 */
export function AsciiDomainViewer({
  domainSlug,
  height = 200,
  cellSize = 10,
  autoRotate = true,
}: AsciiDomainViewerProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Get domain-specific colors
  const colors = DOMAIN_COLORS[domainSlug] || DOMAIN_COLORS['default'];

  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => setIsHovered(false), []);

  return (
    <Box
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      sx={{
        width: '100%',
        height,
        borderRadius: '20px',
        overflow: 'hidden',
        bgcolor: '#0a0a0c',
        border: `1px solid ${colors.accent}60`,
        position: 'relative',
        cursor: 'grab',
        transition: 'border-color 300ms ease',
        '&:hover': {
          borderColor: `${colors.base}80`,
        },
        '&:active': { cursor: 'grabbing' },
      }}
    >
      {/* Element badge */}
      <Box
        sx={{
          position: 'absolute',
          top: 12,
          left: 12,
          px: 1.5,
          py: 0.5,
          borderRadius: 1,
          bgcolor: `${colors.accent}cc`,
          border: `1px solid ${colors.base}60`,
          zIndex: 20,
        }}
      >
        <Typography
          variant="caption"
          sx={{
            fontFamily: tokens.fonts.mono,
            fontSize: '0.65rem',
            color: colors.glow,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
          }}
        >
          {colors.element}
        </Typography>
      </Box>

      {/* Interaction hint */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 8,
          right: 12,
          opacity: isHovered ? 0.8 : 0.4,
          transition: 'opacity 200ms',
          zIndex: 20,
        }}
      >
        <Typography
          variant="caption"
          sx={{
            fontFamily: tokens.fonts.mono,
            fontSize: '0.6rem',
            color: tokens.colors.text.secondary,
          }}
        >
          drag to rotate
        </Typography>
      </Box>

      {/* 3D Canvas */}
      <Suspense
        fallback={
          <Box
            sx={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CircularProgress size={24} sx={{ color: colors.base }} />
          </Box>
        }
      >
        <Canvas
          camera={{ position: [0, 0, 6], fov: 50 }}
          gl={{ antialias: true, alpha: false }}
          dpr={[1, 2]}
        >
          <SceneContent
            domainColor={colors.base}
            glowColor={colors.glow}
            cellSize={cellSize}
            autoRotate={autoRotate && !isHovered}
          />
        </Canvas>
      </Suspense>
    </Box>
  );
}

export default AsciiDomainViewer;
