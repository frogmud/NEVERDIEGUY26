/**
 * AsciiCanvas - React component for rendering ASCII animations
 *
 * Wraps the AsciiEngine and provides a canvas element with
 * automatic RAF-based rendering.
 */

import { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { AsciiEngine, AsciiEngineConfig } from './AsciiEngine';

export interface AsciiCanvasProps {
  /** Width of the canvas */
  width: number;
  /** Height of the canvas */
  height: number;
  /** Engine configuration */
  config?: Partial<AsciiEngineConfig>;
  /** CSS styles for the canvas */
  style?: React.CSSProperties;
  /** CSS class name */
  className?: string;
  /** Called when engine is ready */
  onReady?: (engine: AsciiEngine) => void;
}

export interface AsciiCanvasHandle {
  /** Get the ASCII engine instance */
  getEngine: () => AsciiEngine | null;
  /** Get the canvas element */
  getCanvas: () => HTMLCanvasElement | null;
}

/**
 * AsciiCanvas component with imperative handle for engine access
 */
export const AsciiCanvas = forwardRef<AsciiCanvasHandle, AsciiCanvasProps>(
  function AsciiCanvas(
    { width, height, config, style, className, onReady },
    ref
  ) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const engineRef = useRef<AsciiEngine | null>(null);
    const rafRef = useRef<number>(0);
    const lastTimeRef = useRef<number>(0);

    // Expose engine via ref
    useImperativeHandle(ref, () => ({
      getEngine: () => engineRef.current,
      getCanvas: () => canvasRef.current,
    }));

    // Initialize engine
    useEffect(() => {
      const engine = new AsciiEngine({
        width,
        height,
        ...config,
      });
      engineRef.current = engine;

      // Notify parent
      onReady?.(engine);

      return () => {
        engine.dispose();
        engineRef.current = null;
      };
    }, []); // Only init once

    // Update engine dimensions
    useEffect(() => {
      engineRef.current?.resize(width, height);
    }, [width, height]);

    // Animation loop
    useEffect(() => {
      const canvas = canvasRef.current;
      const engine = engineRef.current;
      if (!canvas || !engine) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      let running = true;
      lastTimeRef.current = performance.now();

      const animate = (time: number) => {
        if (!running) return;

        const deltaTime = time - lastTimeRef.current;
        lastTimeRef.current = time;

        // Cap delta to prevent huge jumps
        const clampedDelta = Math.min(deltaTime, 32);

        // Update and render
        engine.update(clampedDelta);
        engine.render(ctx);

        rafRef.current = requestAnimationFrame(animate);
      };

      rafRef.current = requestAnimationFrame(animate);

      return () => {
        running = false;
        cancelAnimationFrame(rafRef.current);
      };
    }, []);

    return (
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{
          display: 'block',
          ...style,
        }}
        className={className}
      />
    );
  }
);
