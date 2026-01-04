/**
 * ShopHome - Barter Hub with Market/Tribute/Saucer tabs
 *
 * The central bartering hub where players can:
 * - Market: Browse and purchase items from NPC vendors
 * - Tribute: Offer tribute to King James
 * - Saucer: Access the Dying Saucer hub
 */

import { useState } from 'react';
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
import { usePlayerData } from '../../hooks/usePlayerData';
import { MarketSquareView } from './MarketSquareView';
import { MarketStripView } from './MarketStripView';
import { TributeTab, SaucerTab } from './tabs';

type BarterTab = 'market' | 'tribute' | 'saucer';
type MarketViewMode = 'strip' | 'canvas';

export function ShopHome() {
  const { isAuthenticated } = useAuth();
  const { timeInfo } = useMarketAvailability();
  const { gold } = usePlayerData();
  const [activeTab, setActiveTab] = useState<BarterTab>('market');
  const [viewMode, setViewMode] = useState<MarketViewMode>('strip');

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
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100%', overflow: 'hidden' }}>
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
          {/* View Mode Toggle */}
          <Box
            onClick={() => setViewMode(viewMode === 'strip' ? 'canvas' : 'strip')}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.75,
              px: 1.5,
              py: 0.75,
              borderRadius: '999px',
              bgcolor: viewMode === 'canvas' ? `${tokens.colors.secondary}20` : tokens.colors.background.elevated,
              cursor: 'pointer',
              border: viewMode === 'canvas' ? `1px solid ${tokens.colors.secondary}40` : '1px solid transparent',
              '&:hover': { bgcolor: viewMode === 'canvas' ? `${tokens.colors.secondary}30` : tokens.colors.background.paper },
            }}
          >
            <Toggle3DIcon sx={{ fontSize: '1rem', color: viewMode === 'canvas' ? tokens.colors.secondary : tokens.colors.text.secondary }} />
            <Typography sx={{ fontSize: '0.75rem', color: viewMode === 'canvas' ? tokens.colors.secondary : tokens.colors.text.secondary }}>
              {viewMode === 'strip' ? 'Strip' : 'Canvas'}
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
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        {/* Market Tab */}
        {activeTab === 'market' && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              px: padding,
              overflow: 'hidden',
            }}
          >
            {/* Time indicator - fixed at top */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
                py: 2,
                flexShrink: 0,
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

            {/* Market Content - fills remaining height */}
            <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden' }}>
              {viewMode === 'strip' ? (
                <MarketStripView />
              ) : (
                <MarketSquareView />
              )}
            </Box>
          </Box>
        )}

        {/* Tribute Tab */}
        {activeTab === 'tribute' && <TributeTab />}

        {/* Saucer Tab */}
        {activeTab === 'saucer' && <SaucerTab />}
      </Box>
    </Box>
  );
}
