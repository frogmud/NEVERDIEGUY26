/**
 * QuickChatPanel - Pre-baked chat phrases for multiplayer
 *
 * No free text - just quick phrases organized by category.
 * Also shows recent chat messages from other players.
 *
 * NEVER DIE GUY
 */

import { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  IconButton,
  Collapse,
  Fade,
  Chip,
} from '@mui/material';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import CloseIcon from '@mui/icons-material/Close';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import RemoveIcon from '@mui/icons-material/Remove';
import { tokens } from '../../../theme';
import { useParty } from '../../../contexts';
import { QUICK_CHAT_PHRASES, type ChatEvent, type QuickChatCategory } from '@ndg/ai-engine/multiplayer';

// ============================================
// CHAT BUBBLE (shows recent messages)
// ============================================

interface ChatBubbleProps {
  event: ChatEvent;
}

function ChatBubble({ event }: ChatBubbleProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Fade in={visible} timeout={300}>
      <Box
        sx={{
          bgcolor: tokens.surface.elevated,
          border: `1px solid ${tokens.surface.border}`,
          borderRadius: 2,
          px: 1.5,
          py: 0.75,
          mb: 0.5,
        }}
      >
        <Typography variant="caption" color="text.secondary">
          {event.playerName}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {event.text}
        </Typography>
      </Box>
    </Fade>
  );
}

// ============================================
// PHRASE BUTTON
// ============================================

interface PhraseButtonProps {
  phraseId: string;
  text: string;
  category: QuickChatCategory;
  onClick: () => void;
  disabled?: boolean;
}

function PhraseButton({ text, category, onClick, disabled }: PhraseButtonProps) {
  const getCategoryColor = () => {
    switch (category) {
      case 'positive':
        return tokens.status.success;
      case 'negative':
        return tokens.status.error;
      case 'neutral':
        return tokens.text.secondary;
      default:
        return tokens.accent.primary;
    }
  };

  return (
    <Button
      variant="outlined"
      size="small"
      onClick={onClick}
      disabled={disabled}
      sx={{
        borderColor: getCategoryColor(),
        color: getCategoryColor(),
        textTransform: 'none',
        fontSize: '0.8rem',
        py: 0.5,
        px: 1.5,
        minWidth: 0,
        '&:hover': {
          borderColor: getCategoryColor(),
          bgcolor: `${getCategoryColor()}20`,
        },
      }}
    >
      {text}
    </Button>
  );
}

// ============================================
// QUICK CHAT PANEL
// ============================================

interface QuickChatPanelProps {
  position?: 'bottom-left' | 'bottom-right';
}

export function QuickChatPanel({ position = 'bottom-left' }: QuickChatPanelProps) {
  const { connected, roomState, chatMessages, sendQuickChat, myPlayer } = useParty();
  const [expanded, setExpanded] = useState(false);
  const [cooldown, setCooldown] = useState(false);

  // Filter out own messages for display
  const otherMessages = chatMessages
    .filter((msg) => msg.playerId !== myPlayer?.id)
    .slice(-3);

  const handleSend = useCallback(
    (phraseId: string) => {
      if (cooldown) return;
      sendQuickChat(phraseId);
      setCooldown(true);
      setTimeout(() => setCooldown(false), 2000);
    },
    [sendQuickChat, cooldown]
  );

  if (!connected || !roomState || roomState.phase !== 'racing') {
    return null;
  }

  const positionStyles = {
    'bottom-left': { bottom: 16, left: 16 },
    'bottom-right': { bottom: 16, right: 16 },
  };

  const phrasesByCategory = QUICK_CHAT_PHRASES.reduce(
    (acc, phrase) => {
      if (!acc[phrase.category]) acc[phrase.category] = [];
      acc[phrase.category].push(phrase);
      return acc;
    },
    {} as Record<QuickChatCategory, typeof QUICK_CHAT_PHRASES>
  );

  return (
    <Box
      sx={{
        position: 'fixed',
        ...positionStyles[position],
        zIndex: 1000,
      }}
    >
      {/* Incoming messages */}
      <Box sx={{ mb: 1 }}>
        {otherMessages.map((msg) => (
          <ChatBubble key={msg.id} event={msg} />
        ))}
      </Box>

      {/* Chat panel */}
      <Paper
        elevation={8}
        sx={{
          bgcolor: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(8px)',
          borderRadius: 2,
          border: `1px solid ${tokens.surface.border}`,
          overflow: 'hidden',
        }}
      >
        {/* Toggle button */}
        <Box
          onClick={() => setExpanded(!expanded)}
          sx={{
            px: 2,
            py: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            cursor: 'pointer',
            '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.05)' },
          }}
        >
          <ChatBubbleIcon fontSize="small" />
          <Typography variant="body2" sx={{ flex: 1 }}>
            Quick Chat
          </Typography>
          <IconButton size="small" sx={{ p: 0.5 }}>
            {expanded ? <CloseIcon fontSize="small" /> : null}
          </IconButton>
        </Box>

        {/* Phrase grid */}
        <Collapse in={expanded}>
          <Box sx={{ p: 1.5, borderTop: `1px solid ${tokens.surface.border}` }}>
            {/* Positive */}
            <Box sx={{ mb: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                <SentimentSatisfiedAltIcon sx={{ fontSize: 14, color: tokens.status.success }} />
                <Typography variant="caption" color="text.secondary">
                  Positive
                </Typography>
              </Box>
              <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                {phrasesByCategory.positive?.map((phrase) => (
                  <PhraseButton
                    key={phrase.id}
                    phraseId={phrase.id}
                    text={phrase.text}
                    category={phrase.category}
                    onClick={() => handleSend(phrase.id)}
                    disabled={cooldown}
                  />
                ))}
              </Stack>
            </Box>

            {/* Negative */}
            <Box sx={{ mb: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                <SentimentVeryDissatisfiedIcon sx={{ fontSize: 14, color: tokens.status.error }} />
                <Typography variant="caption" color="text.secondary">
                  Negative
                </Typography>
              </Box>
              <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                {phrasesByCategory.negative?.map((phrase) => (
                  <PhraseButton
                    key={phrase.id}
                    phraseId={phrase.id}
                    text={phrase.text}
                    category={phrase.category}
                    onClick={() => handleSend(phrase.id)}
                    disabled={cooldown}
                  />
                ))}
              </Stack>
            </Box>

            {/* Neutral */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                <RemoveIcon sx={{ fontSize: 14, color: tokens.text.secondary }} />
                <Typography variant="caption" color="text.secondary">
                  Neutral
                </Typography>
              </Box>
              <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                {phrasesByCategory.neutral?.map((phrase) => (
                  <PhraseButton
                    key={phrase.id}
                    phraseId={phrase.id}
                    text={phrase.text}
                    category={phrase.category}
                    onClick={() => handleSend(phrase.id)}
                    disabled={cooldown}
                  />
                ))}
              </Stack>
            </Box>

            {/* Cooldown indicator */}
            {cooldown && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', mt: 1, textAlign: 'center' }}
              >
                Wait a moment...
              </Typography>
            )}
          </Box>
        </Collapse>
      </Paper>
    </Box>
  );
}
