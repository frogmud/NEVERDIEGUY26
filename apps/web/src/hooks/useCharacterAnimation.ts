/**
 * useCharacterAnimation - Hook for animating character sprites
 *
 * Handles frame cycling, timing, and animation state transitions.
 * NEVER DIE GUY
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  CHARACTER_SPRITES,
  type CharacterId,
  type AnimationState,
  type SpriteFrame,
} from '../data/market/sprites';

interface UseCharacterAnimationOptions {
  characterId: CharacterId;
  initialState?: AnimationState;
  autoPlay?: boolean;
}

interface UseCharacterAnimationReturn {
  currentFrame: SpriteFrame | null;
  currentState: AnimationState;
  frameIndex: number;
  isPlaying: boolean;
  play: () => void;
  pause: () => void;
  setAnimation: (state: AnimationState) => void;
  reset: () => void;
}

export function useCharacterAnimation({
  characterId,
  initialState = 'idle',
  autoPlay = true,
}: UseCharacterAnimationOptions): UseCharacterAnimationReturn {
  const character = CHARACTER_SPRITES[characterId];
  const [currentState, setCurrentState] = useState<AnimationState>(initialState);
  const [frameIndex, setFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const timerRef = useRef<number | null>(null);

  // Get current animation
  const animation = character?.animations[currentState];
  const frames = animation?.frames ?? [];
  const currentFrame = frames[frameIndex] ?? null;

  // Clear timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  // Animation loop
  useEffect(() => {
    if (!isPlaying || !currentFrame || frames.length === 0) {
      return;
    }

    timerRef.current = window.setTimeout(() => {
      const nextIndex = frameIndex + 1;

      if (nextIndex >= frames.length) {
        // Animation complete
        if (animation?.loop) {
          setFrameIndex(0);
        } else {
          setIsPlaying(false);
        }
      } else {
        setFrameIndex(nextIndex);
      }
    }, currentFrame.duration);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isPlaying, frameIndex, currentFrame, frames.length, animation?.loop]);

  // Reset when animation state changes
  useEffect(() => {
    setFrameIndex(0);
    if (autoPlay) {
      setIsPlaying(true);
    }
  }, [currentState, autoPlay]);

  const play = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const pause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const setAnimation = useCallback((state: AnimationState) => {
    setCurrentState(state);
  }, []);

  const reset = useCallback(() => {
    setFrameIndex(0);
    setIsPlaying(autoPlay);
  }, [autoPlay]);

  return {
    currentFrame,
    currentState,
    frameIndex,
    isPlaying,
    play,
    pause,
    setAnimation,
    reset,
  };
}

export default useCharacterAnimation;
