/**
 * AsciiGalaxy - Ambient swirling ASCII star field
 *
 * Balatro-style hypnotic background with spiral motion.
 * Supports interactive mode with mouse repulsion + click bursts.
 *
 * NEVER DIE GUY
 */

import { useRef, useEffect, useCallback, useState } from 'react';
import { Box } from '@mui/material';
import { tokens } from '../theme';

// Character set for stars (sparse to dense)
const STAR_CHARS = ' .+*';

interface GalaxyParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  char: string;
  brightness: number;
  depth: number; // 0-1, affects speed and opacity
  angle: number; // orbital angle from center
  radius: number; // distance from center
  angularVelocity: number;
}

interface AsciiGalaxyProps {
  /** Animation mode */
  mode?: 'ambient' | 'interactive';
  /** Primary color for stars */
  color?: string;
  /** Base opacity (0-1) */
  opacity?: number;
  /** Number of particles */
  starCount?: number;
  /** Callback on user interaction */
  onInteraction?: () => void;
}

/**
 * AsciiGalaxy - Renders a swirling ASCII star field
 */
export function AsciiGalaxy({
  mode = 'ambient',
  color = tokens.colors.primary,
  opacity = 0.4,
  starCount = 300,
  onInteraction,
}: AsciiGalaxyProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<GalaxyParticle[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000, active: false });
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Initialize particles
  const initParticles = useCallback((width: number, height: number) => {
    const particles: GalaxyParticle[] = [];
    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.max(width, height) * 0.6;

    for (let i = 0; i < starCount; i++) {
      // Spiral distribution - more particles near center
      const t = Math.random();
      const radius = Math.pow(t, 0.5) * maxRadius; // sqrt for even distribution
      const angle = Math.random() * Math.PI * 2 + (radius / maxRadius) * Math.PI * 4; // spiral arms

      // Depth affects speed and opacity (0 = far/slow, 1 = close/fast)
      const depth = Math.random();

      // Angular velocity - faster near center, with depth variation
      const baseAngularVel = 0.2 + (1 - radius / maxRadius) * 0.3;
      const angularVelocity = baseAngularVel * (0.5 + depth * 0.5);

      // Character based on brightness (depth + random)
      const brightness = 0.3 + depth * 0.5 + Math.random() * 0.2;
      const charIndex = Math.floor(brightness * (STAR_CHARS.length - 1));
      const char = STAR_CHARS[Math.min(charIndex, STAR_CHARS.length - 1)];

      particles.push({
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        vx: 0,
        vy: 0,
        char,
        brightness,
        depth,
        angle,
        radius,
        angularVelocity,
      });
    }

    particlesRef.current = particles;
  }, [starCount]);

  // Handle resize
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        const { width, height } = entry.contentRect;
        setDimensions({ width, height });
        initParticles(width, height);
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, [initParticles]);

  // Mouse tracking for interactive mode
  useEffect(() => {
    if (mode !== 'interactive') return;

    const handleMouseMove = (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        active: true,
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    const handleClick = (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      // Spawn burst of particles
      spawnBurst(clickX, clickY);
      onInteraction?.();
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    canvasRef.current?.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      canvasRef.current?.removeEventListener('click', handleClick);
    };
  }, [mode, onInteraction]);

  // Spawn burst of particles at click position
  const spawnBurst = useCallback((x: number, y: number) => {
    const burstCount = 20;
    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;

    for (let i = 0; i < burstCount; i++) {
      const angle = (i / burstCount) * Math.PI * 2;
      const speed = 100 + Math.random() * 200;
      const depth = Math.random();

      const distFromCenter = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
      const angleFromCenter = Math.atan2(y - centerY, x - centerX);

      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        char: STAR_CHARS[Math.floor(Math.random() * STAR_CHARS.length)],
        brightness: 0.8 + Math.random() * 0.2,
        depth,
        angle: angleFromCenter,
        radius: distFromCenter,
        angularVelocity: 0.3 + Math.random() * 0.2,
      });
    }

    // Trim to max particle count after burst
    if (particlesRef.current.length > starCount + 100) {
      particlesRef.current = particlesRef.current.slice(-starCount);
    }
  }, [dimensions, starCount]);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || dimensions.width === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let running = true;
    lastTimeRef.current = performance.now();

    const animate = (time: number) => {
      if (!running) return;

      const dt = Math.min((time - lastTimeRef.current) / 1000, 0.032);
      lastTimeRef.current = time;

      const { width, height } = dimensions;
      const centerX = width / 2;
      const centerY = height / 2;
      const mouse = mouseRef.current;

      // Clear canvas - use clearRect for transparency, slight trail via low alpha
      ctx.clearRect(0, 0, width, height);

      // Setup font
      ctx.font = '12px "IBM Plex Mono", monospace';
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'center';

      // Update and render particles
      for (const p of particlesRef.current) {
        // Orbital motion
        p.angle += p.angularVelocity * dt;

        // Target position from orbit
        const targetX = centerX + Math.cos(p.angle) * p.radius;
        const targetY = centerY + Math.sin(p.angle) * p.radius;

        // If particle has burst velocity, apply it with decay
        if (Math.abs(p.vx) > 0.1 || Math.abs(p.vy) > 0.1) {
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.vx *= 0.95;
          p.vy *= 0.95;

          // Update radius/angle from new position
          p.radius = Math.sqrt((p.x - centerX) ** 2 + (p.y - centerY) ** 2);
          p.angle = Math.atan2(p.y - centerY, p.x - centerX);
        } else {
          // Smooth interpolation to orbital position
          p.x += (targetX - p.x) * 0.1;
          p.y += (targetY - p.y) * 0.1;
        }

        // Mouse repulsion in interactive mode
        if (mode === 'interactive' && mouse.active) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const repelRadius = 100;

          if (dist < repelRadius && dist > 0) {
            const force = (1 - dist / repelRadius) * 150;
            p.vx += (dx / dist) * force * dt;
            p.vy += (dy / dist) * force * dt;
          }
        }

        // Wrap particles that escape
        if (p.x < -50) p.x = width + 50;
        if (p.x > width + 50) p.x = -50;
        if (p.y < -50) p.y = height + 50;
        if (p.y > height + 50) p.y = -50;

        // Draw particle
        const alpha = p.brightness * opacity * (0.3 + p.depth * 0.7);
        ctx.fillStyle = color;
        ctx.globalAlpha = alpha;
        ctx.fillText(p.char, p.x, p.y);
      }

      ctx.globalAlpha = 1;
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      running = false;
      cancelAnimationFrame(rafRef.current);
    };
  }, [dimensions, mode, color, opacity]);

  // Pause when tab not visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        cancelAnimationFrame(rafRef.current);
      } else {
        lastTimeRef.current = performance.now();
        // Animation will restart via the main effect
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  return (
    <Box
      ref={containerRef}
      sx={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: mode === 'interactive' ? 'auto' : 'none',
        zIndex: 0,
      }}
    >
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
        }}
      />
    </Box>
  );
}

export default AsciiGalaxy;
