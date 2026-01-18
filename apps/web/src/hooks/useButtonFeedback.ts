import { useState, useCallback, useMemo } from 'react';
import { EASING, DURATION, GLOW } from '../utils/transitions';

export interface UseButtonFeedbackOptions {
  /** Color for glow effect on hover */
  glowColor?: string;
  /** Scale multiplier on hover (default 1.03) */
  scaleHover?: number;
  /** Scale multiplier on press (default 0.97) */
  scalePress?: number;
  /** Whether button is disabled */
  disabled?: boolean;
}

export interface UseButtonFeedbackReturn {
  /** Get sx styles based on current state */
  getSx: () => Record<string, unknown>;
  /** Event handlers to spread on the element */
  handlers: {
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    onMouseDown: () => void;
    onMouseUp: () => void;
  };
  /** Whether button is currently pressed */
  isPressed: boolean;
  /** Whether button is currently hovered */
  isHovered: boolean;
}

/**
 * Hook for Balatro-style button hover/press feedback.
 * Provides scale, glow, and immediate press response.
 *
 * @example
 * const { getSx, handlers } = useButtonFeedback({ glowColor: '#ff0000' });
 * <ButtonBase sx={getSx()} {...handlers}>Click me</ButtonBase>
 */
export function useButtonFeedback({
  glowColor,
  scaleHover = 1.03,
  scalePress = 0.97,
  disabled = false,
}: UseButtonFeedbackOptions = {}): UseButtonFeedbackReturn {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const handlers = useMemo(
    () => ({
      onMouseEnter: () => !disabled && setIsHovered(true),
      onMouseLeave: () => {
        setIsHovered(false);
        setIsPressed(false);
      },
      onMouseDown: () => !disabled && setIsPressed(true),
      onMouseUp: () => setIsPressed(false),
    }),
    [disabled]
  );

  const getSx = useCallback(() => {
    const base = {
      transition: `all ${DURATION.fast}ms ${EASING.organic}`,
      cursor: disabled ? 'not-allowed' : 'pointer',
    };

    if (disabled) {
      return {
        ...base,
        opacity: 0.4,
      };
    }

    if (isPressed) {
      return {
        ...base,
        transform: `scale(${scalePress}) translateY(2px)`,
        transition: 'all 50ms ease-out',
        ...(glowColor && { boxShadow: GLOW.subtle(glowColor) }),
      };
    }

    if (isHovered) {
      return {
        ...base,
        transform: `scale(${scaleHover})`,
        ...(glowColor && { boxShadow: GLOW.normal(glowColor) }),
      };
    }

    return base;
  }, [disabled, isPressed, isHovered, scaleHover, scalePress, glowColor]);

  return { getSx, handlers, isPressed, isHovered };
}
