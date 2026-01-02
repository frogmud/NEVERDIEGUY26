/**
 * ShopHome - Barter Hub with Market/Tribute/Saucer tabs
 *
 * The central bartering hub where players can:
 * - Market: Browse and purchase items from NPC vendors
 * - Tribute: Offer tribute to King James
 * - Saucer: Access the Dying Saucer hub
 */

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  useMediaQuery,
  Chip,
  Tabs,
  Tab,
} from '@mui/material';
import {
  AccessTimeSharp as TimeIcon,
  ViewInArSharp as Toggle3DIcon,
  ArrowUpwardSharp as UpgradeIcon,
} from '@mui/icons-material';
import { tokens } from '../../theme';
import { GuestBlockModal } from '../../components';
import { useAuth } from '../../contexts/AuthContext';
import { useMarketAvailability } from '../../hooks/useMarketAvailability';
import { useMarketChat } from '../../hooks/useMarketChat';
import { usePlayerData } from '../../hooks/usePlayerData';
import { AllItemsView } from './AllItemsView';
import { MarketSquareView } from './MarketSquareView';
import { MarketChatStream } from './MarketChatStream';
import { GiftModal } from './GiftModal';
import { TributeTab, SaucerTab } from './tabs';
import type { Item } from '../../data/wiki/types';

type BarterTab = 'market' | 'tribute' | 'saucer';

interface GiftTarget {
  slug: string;
  name: string;
  avatar?: string;
}

export function ShopHome() {
  const { isAuthenticated } = useAuth();
  const { timeInfo } = useMarketAvailability();
  const { gold } = usePlayerData();
  const [activeTab, setActiveTab] = useState<BarterTab>('market');
  const marketChat = useMarketChat();

  // Gift modal state (for Market tab)
  const [giftTarget, setGiftTarget] = useState<GiftTarget | null>(null);
  const giftModalOpen = giftTarget !== null;

  // Handle gift click from market square
  const handleGiftClick = (npcSlug: string, npcName: string) => {
    const npcInfo = marketChat.getNpcInfo(npcSlug);
    setGiftTarget({
      slug: npcSlug,
      name: npcName,
      avatar: npcInfo?.avatar,
    });
  };

  // Handle gift completion
  const handleGift = (item: Item) => {
    if (giftTarget) {
      marketChat.recordGift(item, giftTarget.slug, giftTarget.name);
    }
    setGiftTarget(null);
  };

  // Trigger initial greetings when entering market tab
  useEffect(() => {
    if (activeTab === 'market') {
      const timer = setTimeout(() => {
        marketChat.triggerInitialGreetings();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  // Responsive padding (match Home.tsx)
  const is1440 = useMediaQuery('(min-width: 1440px)');
  const is1280 = useMediaQuery('(min-width: 1280px)');
  const is1024 = useMediaQuery('(min-width: 1024px)');
  const padding = is1440 ? '60px' : is1280 ? '30px' : is1024 ? '24px' : '18px';

  // Block guests from accessing barter hub
  if (!isAuthenticated) {
    return (
      <GuestBlockModal
        title="Visit the Barter Hub"
        description="Create an account or sign in to trade items, offer tribute, and access the Dying Saucer."
        iconSrc="/assets/nav/nav4-market.svg"
      />
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      {/* Tab Bar - Rounded toolbar */}
      <Box
        sx={{
          bgcolor: tokens.colors.background.paper,
          borderRadius: '30px',
          boxShadow: '0px 3px 1px 0px rgba(0,0,0,0.5)',
          pl: 3,
          pr: 2,
          height: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 3,
        }}
      >
        {/* Left: Tabs - text only, no icons */}
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          sx={{
            minHeight: 56,
            '& .MuiTab-root': {
              minHeight: 56,
              textTransform: 'none',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: tokens.colors.text.secondary,
              px: 2,
              '&.Mui-selected': {
                color: tokens.colors.text.primary,
                fontWeight: 600,
              },
            },
            '& .MuiTabs-indicator': {
              display: 'none',
            },
          }}
        >
          <Tab value="market" label="Market" />
          <Tab value="tribute" label="Tribute" />
          <Tab value="saucer" label="Saucer" />
        </Tabs>

        {/* Right: Gold controls */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {/* 3D Toggle */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.75,
              px: 1.5,
              py: 0.75,
              borderRadius: '999px',
              bgcolor: tokens.colors.background.elevated,
              cursor: 'pointer',
              '&:hover': { bgcolor: tokens.colors.background.paper },
            }}
          >
            <Toggle3DIcon sx={{ fontSize: '1rem', color: tokens.colors.text.secondary }} />
            <Typography sx={{ fontSize: '0.75rem', color: tokens.colors.text.secondary }}>
              3D
            </Typography>
          </Box>

          {/* Upgrade */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.75,
              px: 1.5,
              py: 0.75,
              borderRadius: '999px',
              bgcolor: tokens.colors.background.elevated,
              cursor: 'pointer',
              '&:hover': { bgcolor: tokens.colors.background.paper },
            }}
          >
            <UpgradeIcon sx={{ fontSize: '1rem', color: tokens.colors.secondary }} />
            <Typography sx={{ fontSize: '0.75rem', color: tokens.colors.secondary }}>
              Upgrade
            </Typography>
          </Box>

          {/* Gold Display */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              pl: 2,
              pr: 2.5,
              py: 0.75,
              borderRadius: '999px',
              bgcolor: tokens.colors.background.elevated,
            }}
          >
            <Box
              component="img"
              src="/assets/ui/currency/coin.png"
              alt="Gold"
              sx={{ width: 20, height: 20 }}
            />
            <Typography
              sx={{
                fontWeight: 600,
                fontSize: '0.875rem',
                color: tokens.colors.warning,
              }}
            >
              {gold.toLocaleString()}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Tab Content */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {/* Market Tab */}
        {activeTab === 'market' && (
          <Box sx={{ p: padding }}>
            {/* Time indicator */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
                mb: 3,
              }}
            >
              <TimeIcon sx={{ fontSize: 18, color: tokens.colors.text.secondary }} />
              <Typography sx={{ color: tokens.colors.text.secondary, fontSize: '0.9rem' }}>
                Current time: <strong style={{ color: tokens.colors.secondary }}>{timeInfo.label}</strong>
                <span style={{ opacity: 0.6 }}> ({timeInfo.range})</span>
              </Typography>
              <Chip
                size="small"
                label={`Next: ${timeInfo.nextLabel} in ${timeInfo.hoursUntilNext}h ${timeInfo.minutesUntilNext}m`}
                sx={{
                  height: 22,
                  fontSize: '0.7rem',
                  bgcolor: `${tokens.colors.secondary}15`,
                  color: tokens.colors.secondary,
                  ml: 1,
                }}
              />
            </Box>

            {/* Market Content - Two Column Layout */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', lg: '1fr 420px' },
                gap: 3,
                // Fill viewport minus chrome (56px), toolbar (56px), time indicator (~60px), padding
                height: { lg: 'calc(100vh - 220px)' },
              }}
            >
              {/* Left: Market Canvas with NPCs */}
              <Box sx={{ minHeight: 0 }}>
                <MarketSquareView
                  onNpcClick={(npcSlug) => marketChat.greetFromNpc(npcSlug)}
                  onGiftClick={handleGiftClick}
                />
              </Box>

              {/* Right: Chat Stream */}
              <Box
                sx={{
                  display: { xs: 'none', lg: 'flex' },
                  flexDirection: 'column',
                  minHeight: 0,
                }}
              >
                <MarketChatStream
                  messages={marketChat.messages}
                  availableNpcs={marketChat.availableNpcs}
                  onSendMessage={marketChat.sendPlayerMessage}
                />
              </Box>
            </Box>
          </Box>
        )}

        {/* Tribute Tab */}
        {activeTab === 'tribute' && <TributeTab />}

        {/* Saucer Tab */}
        {activeTab === 'saucer' && <SaucerTab />}
      </Box>

      {/* Gift Modal (for Market tab) */}
      {giftTarget && (
        <GiftModal
          open={giftModalOpen}
          onClose={() => setGiftTarget(null)}
          recipientSlug={giftTarget.slug}
          recipientName={giftTarget.name}
          recipientAvatar={giftTarget.avatar}
          onGift={handleGift}
        />
      )}
    </Box>
  );
}
