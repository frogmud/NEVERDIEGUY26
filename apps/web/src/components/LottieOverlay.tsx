import { useEffect, useRef } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { Box } from '@mui/material';

export type LottieType = 'confetti' | 'skull' | 'star' | 'energy';

const LOTTIE_PATHS: Record<LottieType, string> = {
  confetti: '/lottie/confetti.lottie',
  skull: '/lottie/skull.lottie',
  star: '/lottie/star.lottie',
  energy: '/lottie/energy.lottie',
};

interface LottieOverlayProps {
  type: LottieType;
  play: boolean;
  onComplete?: () => void;
  size?: number;
}

export function LottieOverlay({ type, play, onComplete, size = 120 }: LottieOverlayProps) {
  const hasPlayed = useRef(false);

  useEffect(() => {
    if (play && !hasPlayed.current) {
      hasPlayed.current = true;
      // Auto-complete after animation duration (roughly 2s for most)
      const timer = setTimeout(() => {
        onComplete?.();
        hasPlayed.current = false;
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [play, onComplete]);

  if (!play) return null;

  return (
    <Box
      sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: size,
        height: size,
        pointerEvents: 'none',
        zIndex: 10,
      }}
    >
      <DotLottieReact
        src={LOTTIE_PATHS[type]}
        autoplay
        loop={false}
        style={{ width: '100%', height: '100%' }}
      />
    </Box>
  );
}

// Inline trigger version - shows lottie briefly then hides
interface LottieTriggerProps {
  type: LottieType;
  trigger: number; // increment to trigger
  size?: number;
  centered?: boolean;
  behind?: boolean; // render behind content (z-index: 0)
}

export function LottieTrigger({ type, trigger, size = 120, centered = true, behind = false }: LottieTriggerProps) {
  const lastTrigger = useRef(0);
  const show = trigger > lastTrigger.current;

  useEffect(() => {
    if (trigger > 0) {
      const timer = setTimeout(() => {
        lastTrigger.current = trigger;
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [trigger]);

  if (!show) return null;

  return (
    <Box
      sx={{
        position: centered ? 'absolute' : 'relative',
        top: centered ? '50%' : 'auto',
        left: centered ? '50%' : 'auto',
        transform: centered ? 'translate(-50%, -50%)' : 'none',
        width: size,
        height: size,
        pointerEvents: 'none',
        zIndex: behind ? 0 : 10,
      }}
    >
      <DotLottieReact
        src={LOTTIE_PATHS[type]}
        autoplay
        loop={false}
        style={{ width: '100%', height: '100%' }}
      />
    </Box>
  );
}
