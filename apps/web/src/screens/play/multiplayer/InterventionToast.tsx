/**
 * InterventionToast - Displays Die-rector blessings and scorns
 *
 * Shows dramatic announcements when Die-rectors intervene.
 * Auto-dismisses after a few seconds.
 *
 * NEVER DIE GUY
 */

import { useEffect, useState, useCallback } from 'react';
import { Box, Paper, Typography, Slide, Stack, Chip, Avatar } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import HeartBrokenIcon from '@mui/icons-material/HeartBroken';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { tokens } from '../../../theme';
import { useInterventions } from '../../../contexts';
import type { InterventionEvent } from '@ndg/ai-engine/multiplayer';

// ============================================
// DIERECTOR DISPLAY CONFIG
// ============================================

interface DierectorDisplay {
  name: string;
  element: string;
  color: string;
  sprite: string;
}

const DIERECTOR_DISPLAY: Record<string, DierectorDisplay> = {
  'the-one': { name: 'The One', element: 'Void', color: '#9c27b0', sprite: 'the-one' },
  'john': { name: 'John', element: 'Earth', color: '#795548', sprite: 'john' },
  'peter': { name: 'Peter', element: 'Death', color: '#424242', sprite: 'peter' },
  'robert': { name: 'Robert', element: 'Fire', color: '#f44336', sprite: 'robert' },
  'alice': { name: 'Alice', element: 'Ice', color: '#03a9f4', sprite: 'alice' },
  'jane': { name: 'Jane', element: 'Wind', color: '#4caf50', sprite: 'jane' },
};

// ============================================
// SINGLE TOAST
// ============================================

interface ToastProps {
  event: InterventionEvent;
  onDismiss: () => void;
}

function Toast({ event, onDismiss }: ToastProps) {
  const [visible, setVisible] = useState(false);
  const display = DIERECTOR_DISPLAY[event.dierectorSlug] ?? {
    name: event.dierectorSlug,
    element: 'Unknown',
    color: '#666',
    sprite: 'unknown',
  };

  const isBlessing = event.type === 'BLESSING';
  const isScorn = event.type === 'SCORN';
  const isRivalry = event.type === 'RIVALRY_SYMPATHY';

  useEffect(() => {
    // Slide in
    const showTimer = setTimeout(() => setVisible(true), 50);

    // Auto dismiss after 5 seconds
    const hideTimer = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 300); // Wait for slide out
    }, 5000);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [onDismiss]);

  const getBorderColor = () => {
    if (isBlessing) return tokens.status.success;
    if (isScorn) return tokens.status.error;
    if (isRivalry) return tokens.status.warning;
    return display.color;
  };

  const getIcon = () => {
    if (isBlessing) return <FavoriteIcon sx={{ color: tokens.status.success }} />;
    if (isScorn) return <HeartBrokenIcon sx={{ color: tokens.status.error }} />;
    if (isRivalry) return <AutoAwesomeIcon sx={{ color: tokens.status.warning }} />;
    return null;
  };

  return (
    <Slide direction="left" in={visible} mountOnEnter unmountOnExit>
      <Paper
        elevation={12}
        sx={{
          p: 2,
          minWidth: 300,
          maxWidth: 400,
          bgcolor: 'rgba(0, 0, 0, 0.9)',
          backdropFilter: 'blur(12px)',
          borderRadius: 2,
          border: `2px solid ${getBorderColor()}`,
          boxShadow: `0 0 20px ${getBorderColor()}40`,
        }}
      >
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
          <Avatar
            sx={{
              width: 40,
              height: 40,
              bgcolor: display.color,
              border: `2px solid ${getBorderColor()}`,
            }}
          >
            {getIcon()}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 700,
                color: display.color,
                textTransform: 'uppercase',
                letterSpacing: 1,
              }}
            >
              {display.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Die-rector of {display.element}
            </Typography>
          </Box>
          <Chip
            label={isBlessing ? 'BLESSING' : isScorn ? 'SCORN' : 'SYMPATHY'}
            size="small"
            sx={{
              bgcolor: getBorderColor(),
              color: '#000',
              fontWeight: 700,
              fontSize: '0.65rem',
            }}
          />
        </Box>

        {/* Message */}
        <Typography
          variant="body2"
          sx={{
            fontStyle: 'italic',
            color: tokens.text.primary,
            mb: 1.5,
            lineHeight: 1.5,
          }}
        >
          "{event.message}"
        </Typography>

        {/* Effects */}
        {event.effects.length > 0 && (
          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
            {event.effects.map((effect, i) => (
              <Chip
                key={i}
                label={effect.description}
                size="small"
                sx={{
                  height: 22,
                  fontSize: '0.7rem',
                  bgcolor: tokens.surface.elevated,
                  border: `1px solid ${getBorderColor()}40`,
                }}
              />
            ))}
          </Stack>
        )}

        {/* Target player */}
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', mt: 1, textAlign: 'right' }}
        >
          {event.playerName}
        </Typography>
      </Paper>
    </Slide>
  );
}

// ============================================
// TOAST CONTAINER
// ============================================

export function InterventionToast() {
  const interventions = useInterventions(5);
  const [queue, setQueue] = useState<InterventionEvent[]>([]);
  const [lastSeen, setLastSeen] = useState<string | null>(null);

  // Add new interventions to queue
  useEffect(() => {
    if (interventions.length === 0) return;

    const latest = interventions[interventions.length - 1];
    if (latest.id !== lastSeen) {
      setQueue((prev) => [...prev, latest]);
      setLastSeen(latest.id);
    }
  }, [interventions, lastSeen]);

  const handleDismiss = useCallback((id: string) => {
    setQueue((prev) => prev.filter((e) => e.id !== id));
  }, []);

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 80,
        right: 16,
        zIndex: 1100,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        pointerEvents: 'none',
        '& > *': { pointerEvents: 'auto' },
      }}
    >
      {queue.slice(-3).map((event) => (
        <Toast key={event.id} event={event} onDismiss={() => handleDismiss(event.id)} />
      ))}
    </Box>
  );
}
