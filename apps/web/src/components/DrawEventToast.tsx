/**
 * DrawEventToast - Display draw event bonuses during combat
 *
 * Shows toast notifications for special dice patterns:
 * - Lucky Straight, High Roller, Element Surge, Wild Surge, Cursed Hand
 *
 * NEVER DIE GUY
 */

import { useEffect, useState, useCallback } from 'react';
import { Box, Typography, keyframes } from '@mui/material';
import {
  TrendingUpSharp as BonusIcon,
  TrendingDownSharp as PenaltyIcon,
  AutoAwesomeSharp as SpecialIcon,
} from '@mui/icons-material';
import { tokens } from '../theme';
import type { DrawEvent } from '@ndg/ai-engine';

// Slide up + glow animation
const slideUp = keyframes`
  0% {
    transform: translateY(20px) scale(0.95);
    opacity: 0;
  }
  15% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
  85% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
  100% {
    transform: translateY(-10px) scale(0.95);
    opacity: 0;
  }
`;

const pulseGlow = keyframes`
  0%, 100% {
    box-shadow: 0 0 10px var(--glow-color, #FFD700),
                0 0 20px var(--glow-color, #FFD700),
                inset 0 0 5px var(--glow-color, #FFD700);
  }
  50% {
    box-shadow: 0 0 20px var(--glow-color, #FFD700),
                0 0 40px var(--glow-color, #FFD700),
                inset 0 0 10px var(--glow-color, #FFD700);
  }
`;

interface DrawEventToastProps {
  event: DrawEvent | null;
  onComplete?: () => void;
  duration?: number;
}

export function DrawEventToast({
  event,
  onComplete,
  duration = 3000,
}: DrawEventToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (event) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        onComplete?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [event, duration, onComplete]);

  if (!visible || !event) return null;

  const isNegative = event.bonus < 0 || event.multiplier < 1;
  const Icon = isNegative ? PenaltyIcon : event.type === 'wild-surge' ? SpecialIcon : BonusIcon;

  // Format the bonus/multiplier display
  const bonusText = event.bonus >= 0 ? `+${event.bonus}` : `${event.bonus}`;
  const multiplierText = event.multiplier !== 1 ? `x${event.multiplier.toFixed(2)}` : '';

  // Handle rainbow gradient for wild surge
  const isRainbow = event.color.includes('gradient');
  const borderStyle = isRainbow
    ? { background: event.color, padding: '2px', borderRadius: tokens.radius.lg + 2 }
    : { border: `2px solid ${event.color}`, borderRadius: tokens.radius.lg };

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 120,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1400,
        animation: `${slideUp} ${duration}ms ease-out forwards`,
      }}
    >
      {/* Outer wrapper for rainbow border */}
      <Box sx={isRainbow ? borderStyle : {}}>
        <Box
          sx={{
            backgroundColor: tokens.colors.background.paper,
            ...(!isRainbow ? borderStyle : { borderRadius: tokens.radius.lg }),
            '--glow-color': isRainbow ? '#FFD700' : event.color,
            animation: `${pulseGlow} 1s ease-in-out infinite`,
            p: 2,
            minWidth: 200,
            maxWidth: 300,
          }}
        >
          {/* Header row */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              mb: 1,
            }}
          >
            {/* Icon */}
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                backgroundColor: `${event.color}20`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon
                sx={{
                  fontSize: 18,
                  color: isRainbow ? tokens.colors.warning : event.color,
                }}
              />
            </Box>

            {/* Event name */}
            <Typography
              sx={{
                fontFamily: tokens.fonts.gaming,
                fontWeight: 700,
                fontSize: '1rem',
                color: isRainbow ? tokens.colors.warning : event.color,
                textShadow: `0 0 10px ${isRainbow ? tokens.colors.warning : event.color}40`,
              }}
            >
              {event.name}
            </Typography>
          </Box>

          {/* Bonus/Multiplier display */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              py: 1,
            }}
          >
            {event.bonus !== 0 && (
              <Typography
                sx={{
                  fontFamily: tokens.fonts.gaming,
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: isNegative ? tokens.colors.error : tokens.colors.success,
                }}
              >
                {bonusText}
              </Typography>
            )}
            {multiplierText && (
              <Typography
                sx={{
                  fontFamily: tokens.fonts.gaming,
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  color: isNegative ? tokens.colors.error : tokens.colors.warning,
                }}
              >
                {multiplierText}
              </Typography>
            )}
          </Box>

          {/* Description */}
          <Typography
            sx={{
              fontSize: '0.75rem',
              color: tokens.colors.text.secondary,
              textAlign: 'center',
            }}
          >
            {event.description}
          </Typography>

          {/* Element tag for element surge */}
          {event.element && (
            <Box
              sx={{
                mt: 1,
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <Typography
                sx={{
                  fontSize: '0.6rem',
                  color: event.color,
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  px: 1,
                  py: 0.25,
                  borderRadius: 1,
                  backgroundColor: `${event.color}20`,
                }}
              >
                {event.element}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}

/**
 * Hook for managing draw event toast queue
 * Events are shown one at a time with a small delay between them
 */
export function useDrawEventToast() {
  const [queue, setQueue] = useState<DrawEvent[]>([]);
  const [currentEvent, setCurrentEvent] = useState<DrawEvent | null>(null);

  // Process queue when current event clears
  useEffect(() => {
    if (!currentEvent && queue.length > 0) {
      const [next, ...rest] = queue;
      setCurrentEvent(next);
      setQueue(rest);
    }
  }, [currentEvent, queue]);

  const showEvent = useCallback((event: DrawEvent) => {
    setQueue((prev) => [...prev, event]);
  }, []);

  const showEvents = useCallback((events: DrawEvent[]) => {
    setQueue((prev) => [...prev, ...events]);
  }, []);

  const clearCurrent = useCallback(() => {
    setCurrentEvent(null);
  }, []);

  const clearAll = useCallback(() => {
    setQueue([]);
    setCurrentEvent(null);
  }, []);

  return {
    currentEvent,
    showEvent,
    showEvents,
    clearCurrent,
    clearAll,
  };
}
