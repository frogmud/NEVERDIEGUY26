/**
 * EternalStreamFeed - Minimal display for eternal stream entries
 *
 * Shows NPC chatter during lobby connecting/waiting states.
 * Newest entry highlighted, older entries fade progressively.
 */

import { Box, Typography, Fade, keyframes } from '@mui/material';
import { tokens } from '../theme';
import type { StreamEntry } from '@ndg/ai-engine/stream';

const fadeIn = keyframes`
  0% { opacity: 0; transform: translateY(4px); }
  100% { opacity: 1; transform: translateY(0); }
`;

interface EternalStreamFeedProps {
  entries: StreamEntry[];
  maxVisible?: number;
}

export function EternalStreamFeed({ entries, maxVisible = 5 }: EternalStreamFeedProps) {
  const visible = entries.slice(0, maxVisible);

  if (visible.length === 0) {
    return (
      <Typography
        variant="body2"
        sx={{
          color: tokens.text.secondary,
          fontStyle: 'italic',
          fontSize: '0.8rem',
        }}
      >
        Tuning in...
      </Typography>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {visible.map((entry, idx) => {
        const isNewest = idx === 0;
        // Progressive fade: newest = 1, older = dimmer
        const opacity = isNewest ? 1 : Math.max(0.3, 0.7 - idx * 0.12);

        return (
          <Fade in key={entry.id} timeout={isNewest ? 400 : 0}>
            <Box
              sx={{
                display: 'flex',
                gap: 1,
                opacity,
                animation: isNewest ? `${fadeIn} 300ms ease-out` : 'none',
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  color: tokens.text.secondary,
                  fontFamily: tokens.fonts.mono,
                  fontSize: '0.7rem',
                  minWidth: 75,
                  flexShrink: 0,
                  textAlign: 'right',
                }}
              >
                {entry.speakerName}:
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: tokens.text.primary,
                  fontSize: '0.8rem',
                  fontStyle: entry.type === 'meta' ? 'italic' : 'normal',
                  lineHeight: 1.4,
                }}
              >
                {entry.content}
              </Typography>
            </Box>
          </Fade>
        );
      })}
    </Box>
  );
}
