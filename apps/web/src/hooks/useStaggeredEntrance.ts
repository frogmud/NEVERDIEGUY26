import { useState, useEffect, useCallback } from 'react';
import { EASING, DURATION } from '../utils/transitions';

export interface UseStaggeredEntranceOptions {
  /** Number of items to animate */
  itemCount: number;
  /** Delay between each item reveal (ms) */
  delayPerItem?: number;
  /** Initial delay before starting (ms) */
  initialDelay?: number;
  /** Whether animation is enabled */
  enabled?: boolean;
}

export interface UseStaggeredEntranceReturn {
  /** Get sx styles for an item at given index */
  getItemStyle: (index: number) => {
    opacity: number;
    transform: string;
    transition: string;
  };
  /** Whether animation is currently running */
  isAnimating: boolean;
  /** Trigger entrance animation again */
  triggerEntrance: () => void;
  /** Number of currently visible items */
  visibleCount: number;
}

/**
 * Hook for staggered list/grid item entrance animations.
 * Items fade in and slide up sequentially.
 *
 * @example
 * const { getItemStyle } = useStaggeredEntrance({ itemCount: items.length });
 * items.map((item, i) => <Box sx={getItemStyle(i)}>{item}</Box>)
 */
export function useStaggeredEntrance({
  itemCount,
  delayPerItem = 50,
  initialDelay = 0,
  enabled = true,
}: UseStaggeredEntranceOptions): UseStaggeredEntranceReturn {
  const [visibleCount, setVisibleCount] = useState(enabled ? 0 : itemCount);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (!enabled || itemCount === 0) {
      setVisibleCount(itemCount);
      return;
    }

    setIsAnimating(true);
    setVisibleCount(0);

    const timeout = setTimeout(() => {
      let current = 0;
      const interval = setInterval(() => {
        current += 1;
        setVisibleCount(current);

        if (current >= itemCount) {
          clearInterval(interval);
          setIsAnimating(false);
        }
      }, delayPerItem);

      return () => clearInterval(interval);
    }, initialDelay);

    return () => clearTimeout(timeout);
  }, [itemCount, delayPerItem, initialDelay, enabled]);

  const getItemStyle = useCallback(
    (index: number) => ({
      opacity: index < visibleCount ? 1 : 0,
      transform: index < visibleCount ? 'translateY(0) scale(1)' : 'translateY(12px) scale(0.95)',
      transition: `opacity ${DURATION.normal}ms ${EASING.smooth}, transform ${DURATION.normal}ms ${EASING.organic}`,
    }),
    [visibleCount]
  );

  const triggerEntrance = useCallback(() => {
    setVisibleCount(0);
    setIsAnimating(true);
  }, []);

  return { getItemStyle, isAnimating, triggerEntrance, visibleCount };
}
