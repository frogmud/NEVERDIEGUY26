/**
 * Market Strip View - Horizontal scrolling vendor strip
 *
 * Horizontal layout showing vendors in a strip/boulevard style.
 * Click vendor cards to open their storefront or chat.
 */

import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Chip,
  IconButton,
} from '@mui/material';
import {
  StorefrontSharp as VendorIcon,
  ChevronLeftSharp as LeftIcon,
  ChevronRightSharp as RightIcon,
  InventorySharp as InventoryIcon,
  AccessTimeSharp as TimeIcon,
  CardGiftcardSharp as GiftIcon,
} from '@mui/icons-material';
import { tokens, RARITY_COLORS } from '../../theme';
import { shops } from '../../data/wiki/entities/shops';
import { useMarketAvailability, TIME_LABELS } from '../../hooks/useMarketAvailability';
import type { Shop } from '../../data/wiki/types';

interface MarketStripViewProps {
  onNpcClick?: (npcSlug: string) => void;
  onGiftClick?: (npcSlug: string, npcName: string) => void;
}

export function MarketStripView({ onNpcClick, onGiftClick }: MarketStripViewProps) {
  const navigate = useNavigate();
  const { timeInfo, isAvailable } = useMarketAvailability();
  const [scrollPosition, setScrollPosition] = useState(0);

  // Get all shops with availability status
  const vendorData = useMemo(() => {
    return shops.map((shop) => {
      const availability = isAvailable(shop.availability);
      return {
        ...shop,
        isAvailable: availability.isAvailable,
        availabilityReason: availability.reason,
      };
    });
  }, [isAvailable]);

  // Split into available and away vendors
  const { availableVendors, awayVendors } = useMemo(() => {
    const available = vendorData.filter((v) => v.isAvailable);
    const away = vendorData.filter((v) => !v.isAvailable);
    return { availableVendors: available, awayVendors: away };
  }, [vendorData]);

  // Scroll handlers
  const scrollLeft = () => {
    const container = document.getElementById('vendor-strip');
    if (container) {
      container.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    const container = document.getElementById('vendor-strip');
    if (container) {
      container.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  // Handle vendor card click
  const handleVendorClick = (shop: Shop) => {
    onNpcClick?.(shop.proprietor || shop.slug);
    navigate(`/shop/${shop.slug}`);
  };

  // Handle gift click
  const handleGiftClick = (e: React.MouseEvent, shop: Shop) => {
    e.stopPropagation();
    onGiftClick?.(shop.proprietor || shop.slug, shop.name);
  };

  return (
    <Box>
      {/* Strip Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography
            variant="h6"
            sx={{
              fontFamily: tokens.fonts.gaming,
              fontSize: '1.25rem',
            }}
          >
            The Strip
          </Typography>
          <Chip
            size="small"
            icon={<TimeIcon sx={{ fontSize: 14 }} />}
            label={TIME_LABELS[timeInfo.current]}
            sx={{
              bgcolor: `${tokens.colors.secondary}15`,
              color: tokens.colors.secondary,
              fontSize: '0.75rem',
            }}
          />
        </Box>

        {/* Scroll Controls */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            onClick={scrollLeft}
            size="small"
            sx={{
              bgcolor: tokens.colors.background.paper,
              border: `1px solid ${tokens.colors.border}`,
              '&:hover': { bgcolor: tokens.colors.background.elevated },
            }}
          >
            <LeftIcon sx={{ fontSize: 20 }} />
          </IconButton>
          <IconButton
            onClick={scrollRight}
            size="small"
            sx={{
              bgcolor: tokens.colors.background.paper,
              border: `1px solid ${tokens.colors.border}`,
              '&:hover': { bgcolor: tokens.colors.background.elevated },
            }}
          >
            <RightIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>
      </Box>

      {/* Vendor Count */}
      <Typography
        sx={{
          color: tokens.colors.text.disabled,
          fontSize: '0.8rem',
          mb: 2,
        }}
      >
        {availableVendors.length} vendors open now
        {awayVendors.length > 0 && ` - ${awayVendors.length} closed`}
      </Typography>

      {/* Horizontal Strip */}
      <Box
        id="vendor-strip"
        sx={{
          display: 'flex',
          gap: 2,
          overflowX: 'auto',
          pb: 2,
          scrollSnapType: 'x mandatory',
          scrollBehavior: 'smooth',
          // Hide scrollbar but keep functionality
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        }}
      >
        {/* Available Vendors */}
        {availableVendors.map((shop) => (
          <VendorCard
            key={shop.slug}
            shop={shop}
            isAvailable={true}
            onClick={() => handleVendorClick(shop)}
            onGiftClick={(e) => handleGiftClick(e, shop)}
          />
        ))}

        {/* Divider if there are away vendors */}
        {awayVendors.length > 0 && availableVendors.length > 0 && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              px: 2,
              flexShrink: 0,
            }}
          >
            <Box
              sx={{
                width: 2,
                height: 100,
                bgcolor: tokens.colors.border,
                borderRadius: 1,
              }}
            />
          </Box>
        )}

        {/* Away Vendors (grayed out) */}
        {awayVendors.map((shop) => (
          <VendorCard
            key={shop.slug}
            shop={shop}
            isAvailable={false}
            onClick={() => handleVendorClick(shop)}
            onGiftClick={(e) => handleGiftClick(e, shop)}
          />
        ))}
      </Box>

      {/* Hint Text */}
      <Typography
        sx={{
          textAlign: 'center',
          color: tokens.colors.text.disabled,
          fontSize: '0.8rem',
          mt: 2,
        }}
      >
        Click a vendor to enter their shop
      </Typography>
    </Box>
  );
}

// Individual Vendor Card
interface VendorCardProps {
  shop: Shop & { isAvailable: boolean; availabilityReason?: string };
  isAvailable: boolean;
  onClick: () => void;
  onGiftClick: (e: React.MouseEvent) => void;
}

function VendorCard({ shop, isAvailable, onClick, onGiftClick }: VendorCardProps) {
  const rarityColor = RARITY_COLORS[shop.rarity as keyof typeof RARITY_COLORS] || tokens.colors.text.primary;
  const [useSvg, setUseSvg] = useState(true);

  // Get proprietor slug for SVG path (e.g., "willy" from shop.proprietor)
  const proprietorSlug = shop.proprietor || shop.slug;
  const svgPortrait = `/assets/market-svg/${proprietorSlug}/portrait.svg`;

  return (
    <Paper
      onClick={onClick}
      sx={{
        position: 'relative',
        flexShrink: 0,
        width: 200,
        scrollSnapAlign: 'start',
        bgcolor: tokens.colors.background.paper,
        border: `1px solid ${isAvailable ? tokens.colors.border : 'transparent'}`,
        borderRadius: '20px',
        overflow: 'hidden',
        cursor: 'pointer',
        opacity: isAvailable ? 1 : 0.5,
        transition: 'all 0.2s',
        '&:hover': {
          transform: isAvailable ? 'translateY(-4px)' : 'none',
          boxShadow: isAvailable ? '0 8px 24px rgba(0,0,0,0.3)' : 'none',
          borderColor: isAvailable ? tokens.colors.warning : 'transparent',
        },
      }}
    >
      {/* Portrait Area */}
      <Box
        sx={{
          position: 'relative',
          height: 140,
          bgcolor: tokens.colors.background.elevated,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {/* Background Gradient */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(circle at 50% 100%, ${rarityColor}20 0%, transparent 70%)`,
          }}
        />

        {/* Portrait - SVG preferred, PNG fallback */}
        <Box
          component="img"
          src={useSvg ? svgPortrait : shop.portrait}
          alt={shop.name}
          onError={() => useSvg && setUseSvg(false)}
          sx={{
            height: '100%',
            width: 'auto',
            objectFit: 'contain',
            filter: isAvailable ? 'none' : 'grayscale(80%)',
          }}
        />

        {/* Rarity Badge */}
        <Chip
          label={shop.rarity}
          size="small"
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            height: 20,
            fontSize: '0.65rem',
            fontWeight: 600,
            bgcolor: `${rarityColor}30`,
            color: rarityColor,
          }}
        />

        {/* Gift Button */}
        {isAvailable && (
          <IconButton
            onClick={onGiftClick}
            size="small"
            sx={{
              position: 'absolute',
              bottom: 8,
              right: 8,
              bgcolor: 'rgba(0,0,0,0.5)',
              '&:hover': { bgcolor: tokens.colors.success + '40' },
            }}
          >
            <GiftIcon sx={{ fontSize: 16, color: tokens.colors.success }} />
          </IconButton>
        )}

        {/* Closed Overlay */}
        {!isAvailable && (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'rgba(0,0,0,0.5)',
            }}
          >
            <Chip
              label="Closed"
              size="small"
              sx={{
                bgcolor: 'rgba(0,0,0,0.8)',
                color: tokens.colors.text.disabled,
                fontSize: '0.7rem',
              }}
            />
          </Box>
        )}
      </Box>

      {/* Info Area */}
      <Box sx={{ p: 1.5 }}>
        {/* Shop Name */}
        <Typography
          sx={{
            fontWeight: 600,
            fontSize: '0.9rem',
            mb: 0.5,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {shop.name}
        </Typography>

        {/* Specialty */}
        <Typography
          sx={{
            color: tokens.colors.text.secondary,
            fontSize: '0.7rem',
            mb: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {shop.specialty}
        </Typography>

        {/* Item Count */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <InventoryIcon sx={{ fontSize: 12, color: tokens.colors.text.disabled }} />
          <Typography sx={{ fontSize: '0.7rem', color: tokens.colors.text.disabled }}>
            {shop.inventory?.length || 0} items
          </Typography>
        </Box>
      </Box>

      {/* Open Indicator */}
      {isAvailable && (
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            left: 8,
            width: 8,
            height: 8,
            borderRadius: '50%',
            bgcolor: tokens.colors.success,
            boxShadow: `0 0 8px ${tokens.colors.success}`,
          }}
        />
      )}
    </Paper>
  );
}
