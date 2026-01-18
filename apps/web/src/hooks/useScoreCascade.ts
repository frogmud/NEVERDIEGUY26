import { useState, useEffect, useRef } from 'react';

export interface UseScoreCascadeOptions {
  /** Target value to animate towards */
  targetValue: number;
  /** Interval between ticks (ms) */
  tickInterval?: number;
  /** Maximum number of steps to reach target */
  maxSteps?: number;
  /** Whether animation is enabled */
  enabled?: boolean;
}

export interface UseScoreCascadeReturn {
  /** Current display value (animates toward target) */
  displayValue: number;
  /** Whether animation is currently running */
  isAnimating: boolean;
  /** Immediately set to target value */
  skipToEnd: () => void;
}

/**
 * Hook for animated score/number tick-up effect.
 * Value counts up (or down) to target over multiple steps.
 *
 * @example
 * const { displayValue } = useScoreCascade({ targetValue: score });
 * <Typography>{displayValue}</Typography>
 */
export function useScoreCascade({
  targetValue,
  tickInterval = 30,
  maxSteps = 15,
  enabled = true,
}: UseScoreCascadeOptions): UseScoreCascadeReturn {
  const [displayValue, setDisplayValue] = useState(targetValue);
  const [isAnimating, setIsAnimating] = useState(false);
  const previousTarget = useRef(targetValue);

  useEffect(() => {
    if (!enabled) {
      setDisplayValue(targetValue);
      return;
    }

    // Skip animation if target hasn't changed
    if (targetValue === previousTarget.current) {
      return;
    }

    previousTarget.current = targetValue;
    const startValue = displayValue;
    const diff = targetValue - startValue;

    if (diff === 0) {
      return;
    }

    setIsAnimating(true);

    // Calculate step size (at least 1)
    const stepSize = Math.max(1, Math.ceil(Math.abs(diff) / maxSteps));
    const direction = diff > 0 ? 1 : -1;

    let current = startValue;
    const interval = setInterval(() => {
      current += stepSize * direction;

      // Check if we've reached or passed the target
      if ((direction > 0 && current >= targetValue) || (direction < 0 && current <= targetValue)) {
        setDisplayValue(targetValue);
        setIsAnimating(false);
        clearInterval(interval);
      } else {
        setDisplayValue(current);
      }
    }, tickInterval);

    return () => clearInterval(interval);
  }, [targetValue, tickInterval, maxSteps, enabled]);

  const skipToEnd = () => {
    setDisplayValue(targetValue);
    setIsAnimating(false);
  };

  return { displayValue, isAnimating, skipToEnd };
}
