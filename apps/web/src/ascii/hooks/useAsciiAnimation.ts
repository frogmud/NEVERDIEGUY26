/**
 * useAsciiAnimation - Hook for managing ASCII animation sequences
 *
 * Handles the state machine for boot sequence animations:
 * - Reform: Particles coalesce into skull
 * - Hold: Skull pulses with glow
 * - Scatter: Skull explodes into particles
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { AsciiEngine, AnimationMode } from '../AsciiEngine';
import { DEFAULT_SKULL, SKULL_CONFIG } from '../presets/skull';

export type AnimationPhase = 'idle' | 'reform' | 'hold' | 'scatter' | 'complete';

export interface UseAsciiAnimationOptions {
  /** ASCII grid to animate (defaults to skull) */
  grid?: string[];
  /** Duration for reform phase in ms */
  reformDuration?: number;
  /** Duration for hold phase in ms */
  holdDuration?: number;
  /** Duration for scatter phase in ms */
  scatterDuration?: number;
  /** Callback when full sequence completes */
  onComplete?: () => void;
  /** Auto-start on mount */
  autoStart?: boolean;
  /** Start with scatter (explosion) instead of reform */
  startWithScatter?: boolean;
}

export interface UseAsciiAnimationReturn {
  /** Current animation phase */
  phase: AnimationPhase;
  /** Initialize the engine with grid data */
  initialize: (engine: AsciiEngine) => void;
  /** Start the animation sequence */
  start: () => void;
  /** Skip to next phase */
  skip: () => void;
  /** Reset to idle */
  reset: () => void;
  /** Get current engine mode */
  engineMode: AnimationMode;
}

/**
 * Hook for managing ASCII animation state
 */
export function useAsciiAnimation(
  options: UseAsciiAnimationOptions = {}
): UseAsciiAnimationReturn {
  const {
    grid = DEFAULT_SKULL,
    reformDuration = 600,
    holdDuration = 400,
    scatterDuration = 800,
    onComplete,
    autoStart = false,
    startWithScatter = false,
  } = options;

  const [phase, setPhase] = useState<AnimationPhase>('idle');
  const engineRef = useRef<AsciiEngine | null>(null);
  const holdTimerRef = useRef<number>(0);

  // Initialize engine with grid
  const initialize = useCallback(
    (engine: AsciiEngine) => {
      engineRef.current = engine;
      engine.loadGrid(grid);

      // Setup completion handler
      engine.onComplete = () => {
        const currentPhase = phase;

        if (currentPhase === 'reform') {
          // Move to hold phase
          setPhase('hold');
          engine.hold();

          // Schedule scatter after hold duration
          holdTimerRef.current = window.setTimeout(() => {
            setPhase('scatter');
            engine.scatter({
              velocity: 500,
              jitter: 0.6,
              lifetime: scatterDuration,
              gravity: true,
            });
          }, holdDuration);
        } else if (currentPhase === 'scatter') {
          // Animation complete
          setPhase('complete');
          onComplete?.();
        }
      };

      // Auto-start if requested
      if (autoStart) {
        startAnimation(engine);
      }
    },
    [grid, holdDuration, scatterDuration, onComplete, autoStart, phase]
  );

  // Start animation helper
  const startAnimation = useCallback(
    (engine: AsciiEngine) => {
      if (startWithScatter) {
        // Start with skull visible, then scatter
        setPhase('hold');
        engine.hold();

        holdTimerRef.current = window.setTimeout(() => {
          setPhase('scatter');
          engine.scatter({
            velocity: 500,
            jitter: 0.6,
            lifetime: scatterDuration,
            gravity: true,
          });
        }, holdDuration);
      } else {
        // Start with reform (particles coalesce)
        setPhase('reform');
        engine.reform({
          duration: reformDuration,
          randomSpawn: true,
        });
      }
    },
    [startWithScatter, reformDuration, holdDuration, scatterDuration]
  );

  // Public start method
  const start = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;
    startAnimation(engine);
  }, [startAnimation]);

  // Skip to next phase
  const skip = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;

    clearTimeout(holdTimerRef.current);

    switch (phase) {
      case 'reform':
        setPhase('hold');
        engine.hold();
        holdTimerRef.current = window.setTimeout(() => {
          setPhase('scatter');
          engine.scatter({
            velocity: 500,
            jitter: 0.6,
            lifetime: scatterDuration,
            gravity: true,
          });
        }, holdDuration);
        break;
      case 'hold':
        setPhase('scatter');
        engine.scatter({
          velocity: 500,
          jitter: 0.6,
          lifetime: scatterDuration,
          gravity: true,
        });
        break;
      case 'scatter':
        setPhase('complete');
        engine.reset();
        onComplete?.();
        break;
    }
  }, [phase, holdDuration, scatterDuration, onComplete]);

  // Reset to idle
  const reset = useCallback(() => {
    clearTimeout(holdTimerRef.current);
    setPhase('idle');
    engineRef.current?.reset();
    engineRef.current?.loadGrid(grid);
  }, [grid]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimeout(holdTimerRef.current);
    };
  }, []);

  return {
    phase,
    initialize,
    start,
    skip,
    reset,
    engineMode: engineRef.current?.mode ?? 'idle',
  };
}

/**
 * Preset animation for TransitionWipe
 *
 * Sequence: reform -> hold -> scatter
 */
export function useWipeAnimation(
  onComplete?: () => void
): UseAsciiAnimationReturn {
  return useAsciiAnimation({
    grid: DEFAULT_SKULL,
    reformDuration: 200,
    holdDuration: 200,
    scatterDuration: 400,
    onComplete,
    autoStart: false,
    startWithScatter: false,
  });
}

/**
 * Preset animation for Home->Play transition
 *
 * Particles reform into skull, then dissolve
 */
export function useReformAnimation(
  onComplete?: () => void
): UseAsciiAnimationReturn {
  return useAsciiAnimation({
    grid: DEFAULT_SKULL,
    reformDuration: 800,
    holdDuration: 300,
    scatterDuration: 500,
    onComplete,
    autoStart: false,
    startWithScatter: false,
  });
}
