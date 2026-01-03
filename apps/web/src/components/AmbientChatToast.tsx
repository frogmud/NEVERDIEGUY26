/**
 * AmbientChatToast - Display NPC commentary during gameplay
 *
 * Shows brief NPC messages as floating toasts that auto-dismiss.
 * Styled to not obstruct gameplay but be noticeable.
 *
 * NEVER DIE GUY
 */

import { Box, Typography, Fade, Avatar } from '@mui/material';
import { tokens } from '../theme';
import type { AmbientMessage } from '../hooks/useAmbientChat';

const gamingFont = { fontFamily: tokens.fonts.gaming };

// NPC avatar colors by slug
const NPC_COLORS: Record<string, string> = {
  'the-one': '#7c4dff',
  john: '#8d6e63',
  peter: '#9e9e9e',
  robert: '#ff5722',
  alice: '#00bcd4',
  jane: '#e91e63',
  willy: '#ffc107',
  'mr-bones': '#607d8b',
  'dr-maxwell': '#4caf50',
  'king-james': '#ffd700',
};

interface AmbientChatToastProps {
  message: AmbientMessage | null;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export function AmbientChatToast({
  message,
  position = 'top-right',
}: AmbientChatToastProps) {
  if (!message) return null;

  const color = NPC_COLORS[message.npcSlug] || tokens.colors.primary;

  // Position styles
  const positionStyles: Record<string, object> = {
    'top-left': { top: 16, left: 16 },
    'top-right': { top: 16, right: 16 },
    'bottom-left': { bottom: 100, left: 16 },
    'bottom-right': { bottom: 100, right: 16 },
  };

  return (
    <Fade in={true} timeout={300}>
      <Box
        sx={{
          position: 'absolute',
          ...positionStyles[position],
          zIndex: 100,
          maxWidth: 280,
          pointerEvents: 'none',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            gap: 1.5,
            alignItems: 'flex-start',
            bgcolor: 'rgba(0,0,0,0.85)',
            border: `1px solid ${color}44`,
            borderRadius: 2,
            p: 1.5,
            boxShadow: `0 0 20px ${color}22`,
          }}
        >
          {/* NPC Avatar */}
          <Avatar
            sx={{
              width: 32,
              height: 32,
              bgcolor: color,
              fontSize: '0.8rem',
              fontWeight: 700,
              ...gamingFont,
            }}
          >
            {message.npcName.charAt(0).toUpperCase()}
          </Avatar>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            {/* NPC Name */}
            <Typography
              sx={{
                ...gamingFont,
                fontSize: '0.75rem',
                color,
                fontWeight: 700,
                mb: 0.5,
              }}
            >
              {message.npcName}
            </Typography>

            {/* Message Text */}
            <Typography
              sx={{
                ...gamingFont,
                fontSize: '0.85rem',
                color: tokens.colors.text.primary,
                lineHeight: 1.4,
              }}
            >
              {message.text}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Fade>
  );
}

export default AmbientChatToast;
