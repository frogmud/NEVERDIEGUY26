/**
 * useEternalStream - Consume eternal stream entries for lobby waiting states
 *
 * Generates NPC chatter deterministically from a seed.
 * Uses an interval to "reveal" entries one at a time for animation effect.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  generateEnhancedDayStream,
  todaySeed,
  type StreamEntry,
} from '@ndg/ai-engine/stream';

export interface UseEternalStreamOptions {
  /** Seed for deterministic generation (room code or today's date) */
  seed?: string;
  /** Domain to generate stream for (default: 'earth') */
  domain?: string;
  /** Number of entries to pre-generate (default: 20) */
  bufferSize?: number;
  /** Interval between revealing entries in ms (default: 2500) */
  revealInterval?: number;
  /** Whether stream is active (pauses when false) */
  active?: boolean;
}

export interface UseEternalStreamReturn {
  /** Currently visible entries (newest first) */
  entries: StreamEntry[];
  /** Latest entry (for highlighting) */
  latestEntry: StreamEntry | null;
  /** Pause the reveal timer */
  pause: () => void;
  /** Resume the reveal timer */
  resume: () => void;
  /** Whether stream is currently paused */
  isPaused: boolean;
  /** Current seed being used */
  currentSeed: string;
}

export function useEternalStream(
  options: UseEternalStreamOptions = {}
): UseEternalStreamReturn {
  const {
    seed,
    domain = 'earth',
    bufferSize = 20,
    revealInterval = 2500,
    active = true,
  } = options;

  const effectiveSeed = seed || todaySeed();

  const bufferRef = useRef<StreamEntry[]>([]);
  const [visibleCount, setVisibleCount] = useState(1);
  const [isPaused, setIsPaused] = useState(false);

  // Generate buffer when seed/domain/size changes
  useEffect(() => {
    bufferRef.current = generateEnhancedDayStream(effectiveSeed, domain, bufferSize);
    setVisibleCount(1);
  }, [effectiveSeed, domain, bufferSize]);

  // Progressive reveal timer
  useEffect(() => {
    if (!active || isPaused || visibleCount >= bufferRef.current.length) return;

    const timer = setInterval(() => {
      setVisibleCount((prev) => Math.min(prev + 1, bufferRef.current.length));
    }, revealInterval);

    return () => clearInterval(timer);
  }, [active, isPaused, visibleCount, revealInterval]);

  const pause = useCallback(() => setIsPaused(true), []);
  const resume = useCallback(() => setIsPaused(false), []);

  // Return entries newest-first (reverse of generation order)
  const entries = bufferRef.current.slice(0, visibleCount).reverse();
  const latestEntry = entries[0] || null;

  return {
    entries,
    latestEntry,
    pause,
    resume,
    isPaused,
    currentSeed: effectiveSeed,
  };
}
