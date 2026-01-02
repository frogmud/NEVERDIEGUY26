/**
 * EventToast Component
 *
 * Toast notification for highlighted NPC messages during gameplay.
 * Appears briefly when important events trigger NPC responses.
 */

import React, { useEffect, useState, useCallback } from 'react';
import type { NPCChatMessage } from '../adapters/phaser-adapter';

// ============================================
// Types
// ============================================

export interface EventToastProps {
  message: NPCChatMessage | null;
  duration?: number;
  position?: 'top' | 'bottom' | 'top-right' | 'bottom-right';
  onDismiss?: () => void;
  onQuickReply?: (verb: string, npcSlug: string) => void;
}

export interface ToastQueueProps {
  messages: NPCChatMessage[];
  duration?: number;
  maxVisible?: number;
  position?: 'top' | 'bottom' | 'top-right' | 'bottom-right';
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

const CATEGORY_BACKGROUNDS: Record<string, string> = {
  pantheon: 'linear-gradient(135deg, #1a0808 0%, #2a0a0a 100%)',
  wanderers: 'linear-gradient(135deg, #081a08 0%, #0a2a0a 100%)',
  travelers: 'linear-gradient(135deg, #08081a 0%, #0a0a2a 100%)',
  shop: 'linear-gradient(135deg, #1a1408 0%, #2a1a0a 100%)',
};

const POSITION_STYLES: Record<string, React.CSSProperties> = {
  top: {
    top: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
  },
  bottom: {
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
  },
  'top-right': {
    top: '20px',
    right: '20px',
  },
  'bottom-right': {
    bottom: '20px',
    right: '20px',
  },
};

// ============================================
// EventToast Component
// ============================================

export function EventToast({
  message,
  duration = 5000,
  position = 'top-right',
  onDismiss,
  onQuickReply,
}: EventToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (message) {
      setIsVisible(true);
      setIsExiting(false);

      const timer = setTimeout(() => {
        setIsExiting(true);
        setTimeout(() => {
          setIsVisible(false);
          onDismiss?.();
        }, 300);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [message, duration, onDismiss]);

  if (!message || !isVisible) {
    return null;
  }

  const categoryColor = CATEGORY_COLORS[message.npcCategory] || '#888888';
  const categoryBg = CATEGORY_BACKGROUNDS[message.npcCategory] || 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)';
  const positionStyle = POSITION_STYLES[position];

  const containerStyle: React.CSSProperties = {
    position: 'fixed',
    zIndex: 9999,
    maxWidth: '360px',
    minWidth: '280px',
    ...positionStyle,
    animation: isExiting
      ? 'toast-exit 0.3s ease-out forwards'
      : 'toast-enter 0.3s ease-out forwards',
  };

  const toastStyle: React.CSSProperties = {
    background: categoryBg,
    borderRadius: '12px',
    padding: '16px',
    boxShadow: `0 4px 20px rgba(0, 0, 0, 0.5), 0 0 0 1px ${categoryColor}33`,
    borderLeft: `4px solid ${categoryColor}`,
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px',
  };

  const avatarStyle: React.CSSProperties = {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: categoryColor,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#fff',
    flexShrink: 0,
  };

  const nameStyle: React.CSSProperties = {
    flex: 1,
    fontSize: '14px',
    fontWeight: 'bold',
    color: categoryColor,
  };

  const closeStyle: React.CSSProperties = {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    border: 'none',
    color: '#888',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    transition: 'all 0.2s ease',
  };

  const textStyle: React.CSSProperties = {
    fontSize: '14px',
    color: '#e0e0e0',
    lineHeight: 1.5,
    whiteSpace: 'pre-wrap',
  };

  const quickReplyContainerStyle: React.CSSProperties = {
    display: 'flex',
    gap: '8px',
    marginTop: '12px',
    flexWrap: 'wrap',
  };

  const quickReplyStyle: React.CSSProperties = {
    padding: '6px 14px',
    fontSize: '12px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    border: `1px solid ${categoryColor}44`,
    borderRadius: '16px',
    color: '#ccc',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  };

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onDismiss?.();
    }, 300);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div style={containerStyle}>
      <div style={toastStyle}>
        <div style={headerStyle}>
          <div style={avatarStyle}>{getInitials(message.npcName)}</div>
          <div style={nameStyle}>{message.npcName}</div>
          <button
            style={closeStyle}
            onClick={handleClose}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
              e.currentTarget.style.color = '#fff';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.color = '#888';
            }}
          >
            x
          </button>
        </div>
        <div style={textStyle}>{message.text}</div>
        {message.quickReplies && message.quickReplies.length > 0 && (
          <div style={quickReplyContainerStyle}>
            {message.quickReplies.map((reply, i) => (
              <button
                key={i}
                style={quickReplyStyle}
                onClick={() => {
                  onQuickReply?.(reply.verb, message.npcSlug);
                  handleClose();
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = `${categoryColor}33`;
                  e.currentTarget.style.borderColor = categoryColor;
                  e.currentTarget.style.color = '#fff';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.borderColor = `${categoryColor}44`;
                  e.currentTarget.style.color = '#ccc';
                }}
              >
                {reply.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Keyframe animations */}
      <style>{`
        @keyframes toast-enter {
          from {
            opacity: 0;
            transform: translateY(-20px) ${position.includes('right') ? '' : 'translateX(-50%)'};
          }
          to {
            opacity: 1;
            transform: translateY(0) ${position.includes('right') ? '' : 'translateX(-50%)'};
          }
        }
        @keyframes toast-exit {
          from {
            opacity: 1;
            transform: translateY(0) ${position.includes('right') ? '' : 'translateX(-50%)'};
          }
          to {
            opacity: 0;
            transform: translateY(-20px) ${position.includes('right') ? '' : 'translateX(-50%)'};
          }
        }
      `}</style>
    </div>
  );
}

// ============================================
// ToastQueue Component (manages multiple toasts)
// ============================================

export function ToastQueue({
  messages,
  duration = 5000,
  maxVisible = 3,
  position = 'top-right',
  onQuickReply,
}: ToastQueueProps) {
  const [displayedMessages, setDisplayedMessages] = useState<NPCChatMessage[]>([]);

  // Track which messages have been displayed
  useEffect(() => {
    const newMessages = messages.filter(
      (msg) => !displayedMessages.some((d) => d.id === msg.id)
    );

    if (newMessages.length > 0) {
      setDisplayedMessages((prev) => {
        const updated = [...prev, ...newMessages];
        // Keep only last maxVisible * 2 to prevent memory leak
        return updated.slice(-maxVisible * 2);
      });
    }
  }, [messages, displayedMessages, maxVisible]);

  const handleDismiss = useCallback((id: string) => {
    setDisplayedMessages((prev) => prev.filter((m) => m.id !== id));
  }, []);

  // Get visible toasts (most recent ones)
  const visibleToasts = displayedMessages.slice(-maxVisible);

  // Calculate stacked positions
  const getStackStyle = (index: number): React.CSSProperties => {
    const baseOffset = position.includes('top') ? 20 : 20;
    const stackOffset = index * 100; // Each toast stacks 100px

    if (position.includes('top')) {
      return { top: `${baseOffset + stackOffset}px` };
    } else {
      return { bottom: `${baseOffset + stackOffset}px` };
    }
  };

  return (
    <>
      {visibleToasts.map((msg, index) => (
        <div
          key={msg.id}
          style={{
            position: 'fixed',
            zIndex: 9999 - index,
            maxWidth: '360px',
            minWidth: '280px',
            right: position.includes('right') ? '20px' : undefined,
            left: !position.includes('right') ? '50%' : undefined,
            transform: !position.includes('right') ? 'translateX(-50%)' : undefined,
            ...getStackStyle(index),
            transition: 'all 0.3s ease',
          }}
        >
          <EventToast
            message={msg}
            duration={duration}
            position={position}
            onDismiss={() => handleDismiss(msg.id)}
            onQuickReply={onQuickReply}
          />
        </div>
      ))}
    </>
  );
}

export default EventToast;
