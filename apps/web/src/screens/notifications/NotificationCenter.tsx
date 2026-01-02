/**
 * NotificationCenter - Inbox for all notifications
 *
 * Displays notifications grouped by time period with filtering.
 * Connected to NotificationContext for real data.
 */

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Container,
  Chip,
  Button,
  Avatar,
} from '@mui/material';
import {
  NotificationsSharp as NotificationIcon,
  EmojiEventsSharp as AchievementIcon,
  SportsEsportsSharp as ChallengeIcon,
  InfoSharp as SystemIcon,
  NotificationsOffSharp as EmptyIcon,
  MonetizationOnSharp as GoldIcon,
} from '@mui/icons-material';
import { tokens } from '../../theme';
import { PageHeader } from '../../components/Placeholder';
import { CardSection } from '../../components/CardSection';
import { useNotifications } from '../../contexts/NotificationContext';
import type { Notification, NotificationCategory } from '../../data/notifications/types';

// ============================================
// Filter Options
// ============================================

const filterOptions = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
  { id: 'npc', label: 'NPCs' },
  { id: 'system', label: 'System' },
  { id: 'achievement', label: 'Achievements' },
  { id: 'challenge', label: 'Challenges' },
];

// ============================================
// Time Helpers
// ============================================

function getTimeGroup(timestamp: number): 'today' | 'yesterday' | 'earlier' {
  const now = new Date();
  const date = new Date(timestamp);

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) return 'today';

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  if (isYesterday) return 'yesterday';

  return 'earlier';
}

function formatTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

// ============================================
// Icon Helper
// ============================================

function getCategoryIcon(notification: Notification) {
  // NPC notifications use avatar
  if (notification.npc) {
    return null; // Will use Avatar instead
  }

  // Achievement icons
  if (notification.category === 'achievement') {
    if (notification.achievement?.type === 'gold') {
      return GoldIcon;
    }
    return AchievementIcon;
  }

  // Challenge icon
  if (notification.category === 'challenge') {
    return ChallengeIcon;
  }

  // Default system icon
  return SystemIcon;
}

function getIconColor(notification: Notification): string {
  if (notification.category === 'achievement') {
    if (notification.achievement?.type === 'gold') {
      return '#ffc107'; // Gold color
    }
    return tokens.colors.success;
  }
  if (notification.category === 'challenge') {
    return tokens.colors.primary;
  }
  return tokens.colors.text.secondary;
}

// ============================================
// Component
// ============================================

export function NotificationCenter() {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  const [activeFilter, setActiveFilter] = useState('all');

  // Group notifications by time period
  const groupedNotifications = useMemo(() => {
    const groups = {
      today: [] as Notification[],
      yesterday: [] as Notification[],
      earlier: [] as Notification[],
    };

    notifications.forEach((notification) => {
      const group = getTimeGroup(notification.createdAt);
      groups[group].push(notification);
    });

    return groups;
  }, [notifications]);

  // Filter notifications
  const filterNotifications = (items: Notification[]): Notification[] => {
    return items.filter((item) => {
      if (activeFilter === 'all') return true;
      if (activeFilter === 'unread') return !item.read;
      if (activeFilter === 'npc') return item.category === 'npc';
      if (activeFilter === 'system') return item.category === 'system';
      if (activeFilter === 'achievement') return item.category === 'achievement';
      if (activeFilter === 'challenge') return item.category === 'challenge';
      return true;
    });
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }

    // Handle action navigation
    if (notification.action) {
      const { type, payload } = notification.action;
      switch (type) {
        case 'navigate':
          if (payload.path && typeof payload.path === 'string') {
            navigate(payload.path);
          }
          break;
        case 'open_shop':
          navigate('/shop');
          break;
        case 'view_item':
          if (payload.itemSlug && typeof payload.itemSlug === 'string') {
            navigate(`/wiki/items/${payload.itemSlug}`);
          }
          break;
        case 'view_npc':
          if (payload.npcSlug && typeof payload.npcSlug === 'string') {
            const category = (payload.category as string) || 'travelers';
            navigate(`/wiki/${category}/${payload.npcSlug}`);
          }
          break;
        case 'accept_challenge':
          navigate('/play');
          break;
      }
    }
  };

  const hasNotifications = notifications.length > 0;

  const renderNotificationGroup = (title: string, items: Notification[]) => {
    const filteredItems = filterNotifications(items);
    if (filteredItems.length === 0) return null;

    return (
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="subtitle2"
          sx={{ color: tokens.colors.text.secondary, mb: 2 }}
        >
          {title}
        </Typography>
        <CardSection padding={0}>
          {filteredItems.map((notification, i) => {
            const Icon = getCategoryIcon(notification);
            const iconColor = getIconColor(notification);
            const hasAvatar = !!notification.npc;

            return (
              <Box
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 2,
                  p: 2,
                  cursor: 'pointer',
                  borderBottom:
                    i < filteredItems.length - 1
                      ? `1px solid ${tokens.colors.border}`
                      : 'none',
                  backgroundColor: notification.read
                    ? 'transparent'
                    : tokens.colors.background.elevated,
                  '&:hover': {
                    backgroundColor: tokens.colors.background.elevated,
                  },
                }}
              >
                {/* Icon or Avatar */}
                {hasAvatar ? (
                  <Avatar
                    src={notification.npc?.avatar}
                    alt={notification.npc?.name}
                    sx={{
                      width: 40,
                      height: 40,
                      bgcolor: tokens.colors.background.elevated,
                    }}
                  >
                    {notification.npc?.name?.charAt(0)}
                  </Avatar>
                ) : (
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      bgcolor: notification.read
                        ? tokens.colors.background.elevated
                        : `${iconColor}20`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {Icon && (
                      <Icon
                        sx={{
                          fontSize: 20,
                          color: notification.read
                            ? tokens.colors.text.secondary
                            : iconColor,
                        }}
                      />
                    )}
                  </Box>
                )}

                {/* Content */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: notification.read ? 400 : 600 }}
                  >
                    {notification.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: tokens.colors.text.secondary,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {notification.body}
                  </Typography>
                </Box>

                {/* Time and unread indicator */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    flexShrink: 0,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{ color: tokens.colors.text.disabled }}
                  >
                    {formatTimeAgo(notification.createdAt)}
                  </Typography>
                  {!notification.read && (
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: tokens.colors.primary,
                      }}
                    />
                  )}
                </Box>
              </Box>
            );
          })}
        </CardSection>
      </Box>
    );
  };

  return (
    <Container maxWidth="md" sx={{ py: 2 }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          mb: 3,
        }}
      >
        <PageHeader
          title="Inbox"
          subtitle={unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
        />
        {unreadCount > 0 && (
          <Button
            variant="text"
            size="small"
            onClick={markAllAsRead}
            sx={{ color: tokens.colors.primary }}
          >
            Mark all read
          </Button>
        )}
      </Box>

      {/* Filter Chips */}
      <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
        {filterOptions.map((filter) => {
          const isActive = activeFilter === filter.id;
          return (
            <Chip
              key={filter.id}
              label={filter.label}
              onClick={() => setActiveFilter(filter.id)}
              sx={{
                bgcolor: isActive
                  ? tokens.colors.background.elevated
                  : tokens.colors.background.paper,
                color: tokens.colors.text.primary,
                border: `1px solid ${tokens.colors.border}`,
                '&:hover': {
                  bgcolor: tokens.colors.background.elevated,
                },
              }}
            />
          );
        })}
      </Box>

      {/* Notification Groups */}
      {hasNotifications ? (
        <>
          {renderNotificationGroup('Today', groupedNotifications.today)}
          {renderNotificationGroup('Yesterday', groupedNotifications.yesterday)}
          {renderNotificationGroup('Earlier', groupedNotifications.earlier)}
        </>
      ) : (
        /* Empty State */
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
          }}
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              bgcolor: tokens.colors.background.elevated,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3,
            }}
          >
            <EmptyIcon sx={{ fontSize: 40, color: tokens.colors.text.disabled }} />
          </Box>
          <Typography variant="h6" sx={{ mb: 1 }}>
            No notifications
          </Typography>
          <Typography variant="body2" sx={{ color: tokens.colors.text.secondary }}>
            You're all caught up! Check back later for updates.
          </Typography>
        </Box>
      )}
    </Container>
  );
}
