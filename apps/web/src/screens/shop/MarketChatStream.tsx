/**
 * Market Chat Stream
 *
 * Simplified chat interface for market interactions.
 *
 * Layout (top to bottom):
 * 1. Header: NPC avatar tabs, Report, Close
 * 2. Title: Current context/conversation title
 * 3. Chat: Scrollable message area
 * 4. Highlight: Today's Deal banner
 * 5. Input: Message field with quick action CTAs
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Avatar,
  Paper,
  Chip,
  Badge,
  Button,
} from '@mui/material';
import {
  SendSharp as SendIcon,
  ShoppingBagSharp as PurchaseIcon,
  CardGiftcardSharp as GiftIcon,
  ChatSharp as ChatIcon,
  CloseSharp as CloseIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { tokens } from '../../theme';
import type { MarketChatMessage, MarketNpcInfo } from '../../hooks/useMarketChat';
import type { MoodType } from '@ndg/shared';

// ============================================
// Types
// ============================================

interface MarketChatStreamProps {
  messages: MarketChatMessage[];
  availableNpcs: MarketNpcInfo[];
  onSendMessage: (content: string, targetNpcSlug: string) => void;
  onClose?: () => void;
}

// ============================================
// Mood Colors
// ============================================

const MOOD_COLORS: Record<MoodType, string> = {
  generous: tokens.colors.success,
  pleased: tokens.colors.success,
  neutral: tokens.colors.text.secondary,
  amused: tokens.colors.secondary,
  cryptic: '#a855f7',
  annoyed: tokens.colors.warning,
  threatening: tokens.colors.error,
  fearful: tokens.colors.warning,
  angry: tokens.colors.error,
  scared: tokens.colors.warning,
  sad: tokens.colors.text.secondary,
  curious: '#a855f7',
};

// ============================================
// Quick Actions
// ============================================

const QUICK_ACTIONS = [
  { label: 'Greet', message: 'Hello!' },
  { label: 'Thanks', message: 'Thank you!' },
  { label: 'Goodbye', message: 'Farewell!' },
  { label: 'Deal?', message: "What's the best you can do?" },
  { label: 'Secret', message: "I've got a secret..." },
];

// ============================================
// Component
// ============================================

export function MarketChatStream({
  messages,
  availableNpcs,
  onSendMessage,
  onClose,
}: MarketChatStreamProps) {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState('');
  const [activeNpcSlug, setActiveNpcSlug] = useState<string | null>(null);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get active NPC info
  const activeNpc = activeNpcSlug
    ? availableNpcs.find((n) => n.slug === activeNpcSlug)
    : null;

  // Filter messages for active conversation
  const activeMessages = activeNpcSlug
    ? messages.filter((m) => m.npcSlug === activeNpcSlug)
    : messages;

  // Auto-scroll disabled - was causing UX issues
  // useEffect(() => {
  //   messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  // }, [activeMessages]);

  // Track unread messages per NPC
  useEffect(() => {
    const counts: Record<string, number> = {};
    messages.forEach((msg) => {
      if (msg.npcSlug && msg.npcSlug !== activeNpcSlug) {
        counts[msg.npcSlug] = (counts[msg.npcSlug] || 0) + 1;
      }
    });
    setUnreadCounts(counts);
  }, [messages, activeNpcSlug]);

  const handleSend = () => {
    if (!inputValue.trim() || !activeNpcSlug) return;
    onSendMessage(inputValue.trim(), activeNpcSlug);
    setInputValue('');
  };

  const handleQuickAction = (message: string) => {
    if (!activeNpcSlug) return;
    onSendMessage(message, activeNpcSlug);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNpcClick = (npcSlug: string) => {
    setActiveNpcSlug(npcSlug);
    // Clear unread for this NPC
    setUnreadCounts((prev) => ({ ...prev, [npcSlug]: 0 }));
  };

  // Get message type icon
  const getMessageIcon = (type: MarketChatMessage['type']) => {
    switch (type) {
      case 'purchase':
        return <PurchaseIcon sx={{ fontSize: 14, color: tokens.colors.warning }} />;
      case 'gift_sent':
      case 'gift_received':
        return <GiftIcon sx={{ fontSize: 14, color: tokens.colors.success }} />;
      default:
        return null;
    }
  };

  // Format timestamp
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // NPCs with messages (for tabs)
  const npcsWithMessages = availableNpcs.filter((npc) =>
    messages.some((m) => m.npcSlug === npc.slug)
  );

  return (
    <Paper
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        bgcolor: tokens.colors.background.paper,
        borderRadius: '20px',
        overflow: 'hidden',
        border: `1px solid ${tokens.colors.border}`,
      }}
    >
      {/* Header: NPC Tabs + Actions */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          px: 2,
          py: 1.5,
          borderBottom: `1px solid ${tokens.colors.border}`,
          bgcolor: tokens.colors.background.default,
        }}
      >
        {/* NPC Avatar Tabs */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
          {npcsWithMessages.length === 0 ? (
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                bgcolor: tokens.colors.background.elevated,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ChatIcon sx={{ fontSize: 20, color: tokens.colors.text.disabled }} />
            </Box>
          ) : (
            npcsWithMessages.map((npc) => (
              <Badge
                key={npc.slug}
                badgeContent={unreadCounts[npc.slug] || 0}
                color="error"
                sx={{
                  '& .MuiBadge-badge': {
                    fontSize: '0.6rem',
                    height: 16,
                    minWidth: 16,
                  },
                }}
              >
                <Avatar
                  src={npc.avatar}
                  onClick={() => handleNpcClick(npc.slug)}
                  sx={{
                    width: 40,
                    height: 40,
                    cursor: 'pointer',
                    border: activeNpcSlug === npc.slug
                      ? `3px solid ${tokens.colors.secondary}`
                      : `3px solid transparent`,
                    transition: 'all 0.15s ease',
                    '&:hover': {
                      borderColor: tokens.colors.secondary,
                      transform: 'scale(1.05)',
                    },
                  }}
                />
              </Badge>
            ))
          )}
        </Box>

        {/* Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography
            sx={{
              fontSize: '0.85rem',
              color: tokens.colors.text.secondary,
              cursor: 'pointer',
              '&:hover': { color: tokens.colors.text.primary },
            }}
          >
            Report
          </Typography>

          {onClose && (
            <IconButton
              onClick={onClose}
              sx={{
                color: tokens.colors.text.secondary,
                '&:hover': { color: tokens.colors.text.primary },
              }}
            >
              <CloseIcon />
            </IconButton>
          )}
        </Box>
      </Box>

      {/* Title */}
      <Box
        sx={{
          px: 3,
          py: 2,
          bgcolor: tokens.colors.background.elevated,
          borderBottom: `1px solid ${tokens.colors.border}`,
        }}
      >
        <Typography
          sx={{
            fontSize: '1.5rem',
            fontWeight: 600,
            lineHeight: 1.3,
          }}
        >
          {activeNpc
            ? `Conversation with ${activeNpc.name}`
            : 'Market Chat'}
        </Typography>
      </Box>

      {/* Chat Messages */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
          bgcolor: tokens.colors.background.default,
        }}
      >
        {activeMessages.length === 0 ? (
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: tokens.colors.text.disabled,
              textAlign: 'center',
              p: 3,
            }}
          >
            <ChatIcon sx={{ fontSize: 48, mb: 2, opacity: 0.3 }} />
            <Typography sx={{ fontSize: '1rem', mb: 0.5 }}>
              {activeNpc ? `Start chatting with ${activeNpc.name}` : 'No messages yet'}
            </Typography>
            <Typography sx={{ fontSize: '0.8rem', opacity: 0.7 }}>
              Click on an NPC in the market to start a conversation
            </Typography>
          </Box>
        ) : (
          activeMessages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              formatTime={formatTime}
              getMessageIcon={getMessageIcon}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </Box>

      {/* Input Area */}
      <Box
        sx={{
          p: 2,
          bgcolor: tokens.colors.background.elevated,
        }}
      >
        {/* Message Input */}
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <TextField
            fullWidth
            size="small"
            placeholder={activeNpc ? `Message ${activeNpc.name}...` : 'Select an NPC to chat...'}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={!activeNpcSlug}
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: tokens.colors.background.paper,
                borderRadius: '12px',
                '& fieldset': {
                  borderColor: tokens.colors.border,
                },
                '&:hover fieldset': {
                  borderColor: tokens.colors.secondary,
                },
                '&.Mui-focused fieldset': {
                  borderColor: tokens.colors.secondary,
                },
              },
            }}
          />
          <IconButton
            onClick={handleSend}
            disabled={!inputValue.trim() || !activeNpcSlug}
            sx={{
              bgcolor: tokens.colors.secondary,
              color: '#000',
              borderRadius: '12px',
              width: 44,
              '&:hover': {
                bgcolor: tokens.colors.secondary,
                opacity: 0.9,
              },
              '&.Mui-disabled': {
                bgcolor: tokens.colors.text.disabled,
                color: tokens.colors.background.paper,
              },
            }}
          >
            <SendIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>

        {/* Quick Actions */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
          {QUICK_ACTIONS.map((action) => (
            <Chip
              key={action.label}
              label={action.label}
              onClick={() => handleQuickAction(action.message)}
              disabled={!activeNpcSlug}
              sx={{
                bgcolor: tokens.colors.background.paper,
                border: `1px solid ${tokens.colors.border}`,
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: `${tokens.colors.secondary}15`,
                  borderColor: tokens.colors.secondary,
                },
                '&.Mui-disabled': {
                  opacity: 0.5,
                },
              }}
            />
          ))}
        </Box>
      </Box>
    </Paper>
  );
}

// ============================================
// Message Bubble Component
// ============================================

interface MessageBubbleProps {
  message: MarketChatMessage;
  formatTime: (timestamp: number) => string;
  getMessageIcon: (type: MarketChatMessage['type']) => React.ReactNode;
}

function MessageBubble({ message, formatTime, getMessageIcon }: MessageBubbleProps) {
  const isPlayerMessage = message.type === 'player_message';
  const isSystemMessage =
    message.type === 'system' ||
    message.type === 'purchase' ||
    message.type === 'gift_sent' ||
    message.type === 'gift_received';
  const moodColor = message.mood ? MOOD_COLORS[message.mood] : tokens.colors.text.secondary;

  // System/purchase/gift messages
  if (isSystemMessage) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1,
          py: 0.75,
        }}
      >
        {getMessageIcon(message.type)}
        <Typography
          sx={{
            fontSize: '0.75rem',
            color:
              message.type === 'purchase'
                ? tokens.colors.warning
                : message.type.includes('gift')
                  ? tokens.colors.success
                  : tokens.colors.text.secondary,
            fontStyle: 'italic',
          }}
        >
          {message.content}
        </Typography>
        <Typography sx={{ fontSize: '0.65rem', color: tokens.colors.text.disabled }}>
          {formatTime(message.timestamp)}
        </Typography>
      </Box>
    );
  }

  // Player messages
  if (isPlayerMessage) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Box
          sx={{
            maxWidth: '80%',
            bgcolor: tokens.colors.secondary,
            color: '#000',
            px: 2,
            py: 1,
            borderRadius: '16px 16px 4px 16px',
          }}
        >
          <Typography sx={{ fontSize: '0.85rem' }}>{message.content}</Typography>
          <Typography sx={{ fontSize: '0.6rem', opacity: 0.6, textAlign: 'right', mt: 0.25 }}>
            {formatTime(message.timestamp)}
          </Typography>
        </Box>
      </Box>
    );
  }

  // NPC messages
  return (
    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
      <Avatar
        src={message.npcAvatar}
        sx={{
          width: 32,
          height: 32,
          border: `2px solid ${moodColor}`,
        }}
      />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        {/* Name and mood */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: tokens.colors.text.primary }}>
            {message.npcName}
          </Typography>
          {message.mood && message.mood !== 'neutral' && (
            <Chip
              size="small"
              label={message.mood}
              sx={{
                height: 16,
                fontSize: '0.6rem',
                bgcolor: `${moodColor}20`,
                color: moodColor,
              }}
            />
          )}
          <Typography sx={{ fontSize: '0.6rem', color: tokens.colors.text.disabled }}>
            {formatTime(message.timestamp)}
          </Typography>
        </Box>

        {/* Message content */}
        <Box
          sx={{
            bgcolor: tokens.colors.background.paper,
            px: 2,
            py: 1,
            borderRadius: '4px 16px 16px 16px',
            maxWidth: '90%',
          }}
        >
          <Typography sx={{ fontSize: '0.85rem', color: tokens.colors.text.primary }}>
            {message.content}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
