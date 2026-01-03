/**
 * ChatFeed Component
 *
 * Auto-scrolling chat feed for NPC dialog during gameplay.
 * Displays messages in a passive, non-intrusive sidebar format.
 */

import React, { useEffect, useRef, useState } from 'react';
import type { NPCChatMessage } from '../adapters/phaser-adapter';

// ============================================
// Types
// ============================================

export interface ChatFeedProps {
  messages: NPCChatMessage[];
  maxVisibleMessages?: number;
  onQuickReply?: (verb: string, npcSlug: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

export interface ChatMessageProps {
  message: NPCChatMessage;
  onQuickReply?: (verb: string, npcSlug: string) => void;
}

// ============================================
// Style Constants
// ============================================

const CATEGORY_COLORS: Record<string, string> = {
  pantheon: '#ff4444',
  wanderers: '#44aa44',
  travelers: '#4488ff',
  shop: '#ffaa00',
};

const MOOD_ICONS: Record<string, string> = {
  pleased: '(^-^)',
  neutral: '(-_-)',
  cryptic: '(?_?)',
  amused: '(^o^)',
  threatening: '(>_<)',
  curious: '(o_o)',
  focused: '(._. )',
  concerned: '(;_;)',
};

// ============================================
// ChatMessage Component
// ============================================

export function ChatMessageBubble({ message, onQuickReply }: ChatMessageProps) {
  const categoryColor = CATEGORY_COLORS[message.npcCategory] || '#888888';
  const moodIcon = MOOD_ICONS[message.mood] || '';

  const messageStyle: React.CSSProperties = {
    padding: '8px 12px',
    marginBottom: '8px',
    borderRadius: '8px',
    backgroundColor: message.isHighlight ? 'rgba(255, 255, 100, 0.1)' : 'rgba(0, 0, 0, 0.3)',
    borderLeft: `3px solid ${categoryColor}`,
    animation: message.isHighlight ? 'highlight-pulse 2s ease-out' : undefined,
  };

  const nameStyle: React.CSSProperties = {
    fontSize: '12px',
    fontWeight: 'bold',
    color: categoryColor,
    marginBottom: '4px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  };

  const textStyle: React.CSSProperties = {
    fontSize: '14px',
    color: '#e0e0e0',
    lineHeight: 1.4,
    whiteSpace: 'pre-wrap',
  };

  const quickReplyContainerStyle: React.CSSProperties = {
    display: 'flex',
    gap: '8px',
    marginTop: '8px',
    flexWrap: 'wrap',
  };

  const quickReplyStyle: React.CSSProperties = {
    padding: '4px 12px',
    fontSize: '12px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '16px',
    color: '#ccc',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  };

  return (
    <div style={messageStyle}>
      <div style={nameStyle}>
        <span>{message.npcName}</span>
        {moodIcon && <span style={{ opacity: 0.6 }}>{moodIcon}</span>}
      </div>
      <div style={textStyle}>{message.text}</div>
      {message.quickReplies && message.quickReplies.length > 0 && (
        <div style={quickReplyContainerStyle}>
          {message.quickReplies.map((reply, i) => (
            <button
              key={i}
              style={quickReplyStyle}
              onClick={() => onQuickReply?.(reply.verb, message.npcSlug)}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                e.currentTarget.style.color = '#fff';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.color = '#ccc';
              }}
            >
              {reply.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================
// ChatFeed Component
// ============================================

export function ChatFeed({
  messages,
  maxVisibleMessages = 20,
  onQuickReply,
  className,
  style,
}: ChatFeedProps) {
  const feedRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (feedRef.current && isAtBottom) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [messages, isAtBottom]);

  // Track scroll position
  const handleScroll = () => {
    if (feedRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = feedRef.current;
      const atBottom = scrollHeight - scrollTop - clientHeight < 50;
      setIsAtBottom(atBottom);
    }
  };

  const visibleMessages = messages.slice(-maxVisibleMessages);

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    overflow: 'hidden',
    ...style,
  };

  const feedStyle: React.CSSProperties = {
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
    padding: '8px',
    scrollBehavior: 'smooth',
  };

  const headerStyle: React.CSSProperties = {
    padding: '8px 12px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  };

  const emptyStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: '#666',
    fontSize: '14px',
    fontStyle: 'italic',
  };

  const scrollIndicatorStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: '8px',
    left: '50%',
    transform: 'translateX(-50%)',
    padding: '4px 12px',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: '16px',
    fontSize: '11px',
    color: '#888',
    cursor: 'pointer',
    opacity: isAtBottom ? 0 : 1,
    transition: 'opacity 0.2s ease',
    pointerEvents: isAtBottom ? 'none' : 'auto',
  };

  const scrollToBottom = () => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
      setIsAtBottom(true);
    }
  };

  return (
    <div className={className} style={containerStyle}>
      <div style={headerStyle}>NPC Chatter</div>
      <div
        ref={feedRef}
        style={feedStyle}
        onScroll={handleScroll}
      >
        {visibleMessages.length === 0 ? (
          <div style={emptyStyle}>Waiting for NPCs...</div>
        ) : (
          visibleMessages.map((msg) => (
            <ChatMessageBubble
              key={msg.id}
              message={msg}
              onQuickReply={onQuickReply}
            />
          ))
        )}
      </div>
      <div style={scrollIndicatorStyle} onClick={scrollToBottom}>
        New messages below
      </div>

      {/* Keyframe animation for highlights */}
      <style>{`
        @keyframes highlight-pulse {
          0% {
            background-color: rgba(255, 255, 100, 0.3);
            box-shadow: 0 0 10px rgba(255, 255, 100, 0.5);
          }
          100% {
            background-color: rgba(255, 255, 100, 0.1);
            box-shadow: none;
          }
        }
      `}</style>
    </div>
  );
}

export default ChatFeed;
