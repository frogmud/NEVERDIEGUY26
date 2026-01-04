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
  Chip,
  IconButton,
} from '@mui/material';
import {
  ChevronLeftSharp as LeftIcon,
  ChevronRightSharp as RightIcon,
  AccessTimeSharp as TimeIcon,
} from '@mui/icons-material';
import { tokens, RARITY_COLORS } from '../../theme';
import { shops } from '../../data/wiki/entities/shops';
import { useMarketAvailability, TIME_LABELS } from '../../hooks/useMarketAvailability';
import type { Shop } from '../../data/wiki/types';

interface MarketStripViewProps {
  onNpcClick?: (npcSlug: string) => void;
}

export function MarketStripView({ onNpcClick }: MarketStripViewProps) {
  const navigate = useNavigate();
  const { timeInfo, isAvailable } = useMarketAvailability();

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

  return (
    <Box>
      {/* Strip Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          mb: 2,
        }}
      >
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
          />
        ))}
      </Box>

      {/* Scroll Controls + Hint Text */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          mt: 2,
        }}
      >
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

        <Typography
          sx={{
            color: tokens.colors.text.disabled,
            fontSize: '0.8rem',
          }}
        >
          Scroll through vendors to see who is open for business
        </Typography>

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
  );
}

// Individual Vendor Card
interface VendorCardProps {
  shop: Shop & { isAvailable: boolean; availabilityReason?: string };
  isAvailable: boolean;
  onClick: () => void;
}

function VendorCard({ shop, isAvailable, onClick }: VendorCardProps) {
  const rarityColor = RARITY_COLORS[shop.rarity as keyof typeof RARITY_COLORS] || tokens.colors.text.primary;
  const [useSvg, setUseSvg] = useState(true);

  // Get proprietor slug for SVG path (e.g., "willy" from shop.proprietor)
  const proprietorSlug = shop.proprietor || shop.slug;
  const svgPortrait = `/assets/market-svg/${proprietorSlug}/portrait.svg`;

  return (
    <Box
      onClick={isAvailable ? onClick : undefined}
      sx={{
        position: 'relative',
        flexShrink: 0,
        width: 140,
        scrollSnapAlign: 'start',
        cursor: isAvailable ? 'pointer' : 'not-allowed',
        opacity: isAvailable ? 1 : 0.4,
        transition: 'all 0.2s',
        '&:hover': {
          transform: isAvailable ? 'translateY(-4px) scale(1.05)' : 'none',
        },
      }}
    >
      {/* Portrait - transparent background */}
      <Box
        sx={{
          position: 'relative',
          height: 120,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
        }}
      >
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

        {/* Open Indicator */}
        {isAvailable && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: 10,
              height: 10,
              borderRadius: '50%',
              bgcolor: tokens.colors.success,
              boxShadow: `0 0 8px ${tokens.colors.success}`,
            }}
          />
        )}

        {/* Closed Badge */}
        {!isAvailable && (
          <Chip
            label="Closed"
            size="small"
            sx={{
              position: 'absolute',
              top: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              bgcolor: 'rgba(0,0,0,0.8)',
              color: tokens.colors.text.disabled,
              fontSize: '0.6rem',
              height: 18,
            }}
          />
        )}
      </Box>

      {/* Simple Info - Name only */}
      <Box sx={{ textAlign: 'center', mt: 1 }}>
        <Typography
          sx={{
            fontWeight: 600,
            fontSize: '0.8rem',
            color: isAvailable ? tokens.colors.text.primary : tokens.colors.text.disabled,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {shop.name}
        </Typography>
        <Typography
          sx={{
            fontSize: '0.65rem',
            color: rarityColor,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          {shop.rarity}
        </Typography>
      </Box>
    </Box>
  );
}
