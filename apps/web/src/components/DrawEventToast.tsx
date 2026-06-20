/**
 * DrawEventToast - Display low-priority draw event notices during combat
 *
 * Shows toast notifications for special dice patterns:
 * - Lucky Straight, High Roller, Element Surge, Wild Surge, Cursed Hand
 *
 * NEVER DIE GUY
 */

import { useEffect, useState, useCallback } from 'react';
import { Box, Typography } from '@mui/material';
import { tokens } from '../theme';
import type { DrawEvent } from '@ndg/ai-engine';

interface DrawEventToastProps {
  event: DrawEvent | null;
  onComplete?: () => void;
  duration?: number;
}

export function DrawEventToast({
  event,
  onComplete,
  duration = 1400,
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

  // Format the bonus/multiplier display
  const bonusText = event.bonus >= 0 ? `+${event.bonus}` : `${event.bonus}`;
  const multiplierText = event.multiplier !== 1 ? `x${event.multiplier.toFixed(2)}` : '';
  const effectText = [event.bonus !== 0 ? bonusText : '', multiplierText].filter(Boolean).join(' ');
  const noticeText = [event.name, event.element, effectText].filter(Boolean).join(' / ');

  return (
    <Box
      title={event.description}
      sx={{
        width: '100%',
        minHeight: 20,
        px: { xs: 1.5, sm: 2 },
        py: 0.25,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        pointerEvents: 'none',
      }}
    >
      <Typography
        sx={{
          maxWidth: '100%',
          fontFamily: tokens.fonts.mono,
          fontSize: '0.66rem',
          lineHeight: 1.2,
          color: tokens.colors.text.disabled,
          textTransform: 'uppercase',
          letterSpacing: 0,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {noticeText}
      </Typography>
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
