/**
 * Market Square View - Combined NPC view showing vendors, travelers, and wanderers
 *
 * All NPCs appear together in a Space Jam style canvas for the full market experience.
 * Click NPCs to open a menu with View Storefront (vendors) and Gift options.
 */

import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Tooltip,
  Chip,
  Popover,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  StorefrontSharp as VendorIcon,
  DirectionsWalkSharp as TravelerIcon,
  ExploreSharp as WandererIcon,
  InventorySharp as InventoryIcon,
  TipsAndUpdatesSharp as TipsIcon,
  CardGiftcardSharp as GiftIcon,
  MenuBookSharp as WikiIcon,
  ChatSharp as ChatIcon,
  WbTwilightSharp as TimeIcon,
} from '@mui/icons-material';
import { tokens, RARITY_COLORS } from '../../theme';
import { shops } from '../../data/wiki/entities/shops';
import { travelers } from '../../data/wiki/entities/travelers';
import { wanderers } from '../../data/wiki/entities/wanderers';
import { useMarketAvailability, TIME_LABELS } from '../../hooks/useMarketAvailability';
import { AnimatedSprite } from '../../components/AnimatedSprite';
import type { Shop, Traveler, Wanderer, MarketAvailability, MarketPosition } from '../../data/wiki/types';

// Unified NPC type for market display
interface MarketNpc {
  slug: string;
  name: string;
  type: 'vendor' | 'traveler' | 'wanderer';
  rarity?: string;
  spriteSlug: string; // Slug used for AnimatedSprite (proprietor slug for vendors)
  spriteUrl: string;
  position: MarketPosition;
  availability?: MarketAvailability;
  specialty?: string;
  role?: string;
  marketRole?: string;
  itemCount?: number;
  // Original entity for navigation
  entity: Shop | Traveler | Wanderer;
}

interface MarketSquareViewProps {
  onNpcClick?: (npcSlug: string) => void;
  onGiftClick?: (npcSlug: string, npcName: string) => void;
}

export function MarketSquareView({ onNpcClick, onGiftClick }: MarketSquareViewProps) {
  const navigate = useNavigate();
  const { timeInfo, isAvailable } = useMarketAvailability();

  // Popover state
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [selectedNpc, setSelectedNpc] = useState<MarketNpc | null>(null);
  const popoverOpen = Boolean(anchorEl);

  // Combine all NPCs into unified list
  const allNpcs = useMemo(() => {
    const npcs: MarketNpc[] = [];

    // Add vendors (shops) - use proprietor slug for sprites
    shops.forEach((shop) => {
      if (shop.position) {
        const proprietorSlug = shop.proprietor || shop.slug;
        npcs.push({
          slug: shop.slug,
          name: shop.name,
          type: 'vendor',
          rarity: shop.rarity,
          spriteSlug: proprietorSlug, // Use proprietor for AnimatedSprite
          spriteUrl: shop.sprites?.[0] || shop.portrait || '',
          position: shop.position,
          availability: shop.availability,
          specialty: shop.specialty,
          itemCount: shop.inventory?.length || 0,
          entity: shop,
        });
      }
    });

    // Add travelers with market positions
    travelers.forEach((traveler) => {
      if (traveler.marketPosition) {
        npcs.push({
          slug: traveler.slug,
          name: traveler.name,
          type: 'traveler',
          rarity: traveler.rarity,
          spriteSlug: traveler.slug,
          spriteUrl: traveler.sprites?.[0] || traveler.portrait || '',
          position: traveler.marketPosition,
          availability: traveler.marketAvailability,
          role: traveler.playStyle,
          marketRole: traveler.marketRole,
          entity: traveler,
        });
      }
    });

    // Add wanderers with market positions (non-vendor ones)
    wanderers.forEach((wanderer) => {
      // Skip wanderers who are shop proprietors (already shown as vendors)
      const isShopProprietor = shops.some((s) => s.proprietor === wanderer.slug);
      if (wanderer.marketPosition && !isShopProprietor) {
        npcs.push({
          slug: wanderer.slug,
          name: wanderer.name,
          type: 'wanderer',
          rarity: wanderer.rarity,
          spriteSlug: wanderer.slug,
          spriteUrl: wanderer.sprites?.[0] || wanderer.portrait || '',
          position: wanderer.marketPosition,
          availability: wanderer.marketAvailability,
          role: wanderer.role,
          entity: wanderer,
        });
      }
    });

    return npcs;
  }, []);

  // Get type icon
  const getTypeIcon = (type: 'vendor' | 'traveler' | 'wanderer') => {
    switch (type) {
      case 'vendor':
        return <VendorIcon sx={{ fontSize: 12 }} />;
      case 'traveler':
        return <TravelerIcon sx={{ fontSize: 12 }} />;
      case 'wanderer':
        return <WandererIcon sx={{ fontSize: 12 }} />;
    }
  };

  // Get type label
  const getTypeLabel = (type: 'vendor' | 'traveler' | 'wanderer') => {
    switch (type) {
      case 'vendor':
        return 'Vendor';
      case 'traveler':
        return 'Traveler';
      case 'wanderer':
        return 'Wanderer';
    }
  };

  // Get type color
  const getTypeColor = (type: 'vendor' | 'traveler' | 'wanderer') => {
    switch (type) {
      case 'vendor':
        return tokens.colors.warning; // Gold for vendors
      case 'traveler':
        return tokens.colors.secondary; // Cyan for travelers
      case 'wanderer':
        return '#a855f7'; // Purple for wanderers
    }
  };

  // Handle NPC click - opens popover menu
  const handleNpcClick = (event: React.MouseEvent<HTMLElement>, npc: MarketNpc) => {
    setAnchorEl(event.currentTarget);
    setSelectedNpc(npc);
    // Also notify parent for chat greeting
    onNpcClick?.(npc.slug);
  };

  // Close popover
  const handleClosePopover = () => {
    setAnchorEl(null);
    setSelectedNpc(null);
  };

  // Menu actions
  const handleViewStorefront = () => {
    if (selectedNpc?.type === 'vendor') {
      navigate(`/shop/${selectedNpc.slug}`);
    }
    handleClosePopover();
  };

  const handleViewWiki = () => {
    if (!selectedNpc) return;
    switch (selectedNpc.type) {
      case 'vendor':
        navigate(`/wiki/wanderers/${selectedNpc.slug}`);
        break;
      case 'traveler':
        navigate(`/wiki/travelers/${selectedNpc.slug}`);
        break;
      case 'wanderer':
        navigate(`/wiki/wanderers/${selectedNpc.slug}`);
        break;
    }
    handleClosePopover();
  };

  const handleGift = () => {
    if (selectedNpc) {
      onGiftClick?.(selectedNpc.slug, selectedNpc.name);
    }
    handleClosePopover();
  };

  // Split NPCs by availability
  const { presentNpcs, awayNpcs } = useMemo(() => {
    const present: MarketNpc[] = [];
    const away: MarketNpc[] = [];
    allNpcs.forEach((npc) => {
      if (isAvailable(npc.availability).isAvailable) {
        present.push(npc);
      } else {
        away.push(npc);
      }
    });
    return { presentNpcs: present, awayNpcs: away };
  }, [allNpcs, isAvailable]);

  // Count by type (from present NPCs only for display counts)
  const stats = useMemo(() => {
    const vendorCount = presentNpcs.filter((n) => n.type === 'vendor').length;
    const travelerCount = presentNpcs.filter((n) => n.type === 'traveler').length;
    const wandererCount = presentNpcs.filter((n) => n.type === 'wanderer').length;
    return { vendorCount, travelerCount, wandererCount, presentCount: presentNpcs.length, total: allNpcs.length };
  }, [presentNpcs, allNpcs]);

  return (
    <Box>
      {/* Stats bar */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1.5,
          mb: 3,
          flexWrap: 'wrap',
        }}
      >
        <Chip
          icon={<VendorIcon sx={{ fontSize: 14 }} />}
          label={`${stats.vendorCount} Vendors`}
          size="small"
          sx={{ bgcolor: `${tokens.colors.warning}20`, color: tokens.colors.warning }}
        />
        <Chip
          icon={<TravelerIcon sx={{ fontSize: 14 }} />}
          label={`${stats.travelerCount} Travelers`}
          size="small"
          sx={{ bgcolor: `${tokens.colors.secondary}20`, color: tokens.colors.secondary }}
        />
        {stats.wandererCount > 0 && (
          <Chip
            icon={<WandererIcon sx={{ fontSize: 14 }} />}
            label={`${stats.wandererCount} Wanderers`}
            size="small"
            sx={{ bgcolor: 'rgba(168, 85, 247, 0.2)', color: '#a855f7' }}
          />
        )}
        <Tooltip
          title={
            <Box sx={{ minWidth: 200 }}>
              <Typography sx={{ fontWeight: 600, fontSize: '0.8rem', mb: 1, color: tokens.colors.success }}>
                Here Now ({presentNpcs.length})
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1.5 }}>
                {presentNpcs.map((npc) => (
                  <Chip
                    key={npc.slug}
                    label={npc.name}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: '0.65rem',
                      bgcolor: `${getTypeColor(npc.type)}20`,
                      color: getTypeColor(npc.type),
                    }}
                  />
                ))}
              </Box>
              {awayNpcs.length > 0 && (
                <>
                  <Typography sx={{ fontWeight: 600, fontSize: '0.8rem', mb: 1, color: tokens.colors.text.disabled }}>
                    Away ({awayNpcs.length})
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {awayNpcs.map((npc) => (
                      <Chip
                        key={npc.slug}
                        label={npc.name}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.65rem',
                          bgcolor: 'rgba(255,255,255,0.05)',
                          color: tokens.colors.text.disabled,
                        }}
                      />
                    ))}
                  </Box>
                </>
              )}
            </Box>
          }
          arrow
          placement="bottom"
          slotProps={{
            tooltip: {
              sx: {
                bgcolor: tokens.colors.background.paper,
                border: `1px solid ${tokens.colors.border}`,
                borderRadius: '12px',
                p: 1.5,
                maxWidth: 320,
              },
            },
            arrow: {
              sx: {
                color: tokens.colors.background.paper,
                '&::before': { border: `1px solid ${tokens.colors.border}` },
              },
            },
          }}
        >
          <Chip
            label={`${stats.presentCount}/${stats.total} here now`}
            size="small"
            sx={{ bgcolor: `${tokens.colors.success}20`, color: tokens.colors.success, cursor: 'help' }}
          />
        </Tooltip>
      </Box>

      {/* Space Jam Style Market Canvas */}
      <Paper
        sx={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16/9',
          bgcolor: tokens.colors.background.elevated,
          borderRadius: '30px',
          overflow: 'hidden',
          border: `1px solid ${tokens.colors.border}`,
        }}
      >
        {/* Background gradient */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(ellipse at 30% 20%, ${tokens.colors.secondary}08 0%, transparent 40%),
                         radial-gradient(ellipse at 70% 80%, ${tokens.colors.warning}08 0%, transparent 40%),
                         radial-gradient(ellipse at 50% 100%, ${tokens.colors.background.paper} 0%, transparent 70%)`,
            pointerEvents: 'none',
          }}
        />

        {/* NPC Sprites - Only show present NPCs */}
        {presentNpcs.map((npc) => {
          const rarityColor = RARITY_COLORS[npc.rarity as keyof typeof RARITY_COLORS] || tokens.colors.text.primary;
          const typeColor = getTypeColor(npc.type);

          return (
            <Tooltip
              key={`${npc.type}-${npc.slug}`}
              title={
                <Box sx={{ minWidth: 180 }}>
                  {/* Header */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography sx={{ fontWeight: 600, fontSize: '0.9rem', flex: 1 }}>
                      {npc.name}
                    </Typography>
                    <Chip
                      label={npc.rarity}
                      size="small"
                      sx={{
                        height: 18,
                        fontSize: '0.65rem',
                        bgcolor: `${rarityColor}30`,
                        color: rarityColor,
                      }}
                    />
                  </Box>

                  {/* Type badge */}
                  <Box sx={{ mb: 1 }}>
                    <Chip
                      icon={getTypeIcon(npc.type)}
                      label={getTypeLabel(npc.type)}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '0.65rem',
                        bgcolor: `${typeColor}20`,
                        color: typeColor,
                      }}
                    />
                  </Box>

                  {/* Specialty/Role */}
                  <Typography sx={{ fontSize: '0.75rem', color: tokens.colors.text.secondary, mb: 1 }}>
                    {npc.specialty || npc.role || npc.marketRole}
                  </Typography>

                  {/* Type-specific info */}
                  {npc.type === 'vendor' && npc.itemCount !== undefined && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <InventoryIcon sx={{ fontSize: 12, color: tokens.colors.text.disabled }} />
                      <Typography sx={{ fontSize: '0.7rem', color: tokens.colors.text.secondary }}>
                        {npc.itemCount} items for sale
                      </Typography>
                    </Box>
                  )}

                  {npc.type === 'traveler' && npc.marketRole && (
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5 }}>
                      <TipsIcon sx={{ fontSize: 12, color: tokens.colors.secondary, mt: 0.25 }} />
                      <Typography sx={{ fontSize: '0.7rem', color: tokens.colors.text.secondary }}>
                        {npc.marketRole}
                      </Typography>
                    </Box>
                  )}
                </Box>
              }
              arrow
              placement="top"
              slotProps={{
                tooltip: {
                  sx: {
                    bgcolor: tokens.colors.background.paper,
                    border: `1px solid ${tokens.colors.border}`,
                    borderRadius: '12px',
                    p: 1.5,
                    maxWidth: 260,
                  },
                },
                arrow: {
                  sx: {
                    color: tokens.colors.background.paper,
                    '&::before': {
                      border: `1px solid ${tokens.colors.border}`,
                    },
                  },
                },
              }}
            >
              <Box
                onClick={(e) => handleNpcClick(e, npc)}
                sx={{
                  position: 'absolute',
                  left: npc.position.x,
                  top: npc.position.y,
                  transform: 'translate(-50%, -50%)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translate(-50%, -50%) scale(1.1)',
                  },
                }}
              >
                {/* Type indicator ring */}
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: -4,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: npc.type === 'vendor' ? 70 : 54,
                    height: 4,
                    borderRadius: '2px',
                    bgcolor: typeColor,
                    opacity: 0.6,
                  }}
                />

                {/* Sprite - static for vendors, animated for others */}
                {npc.type === 'vendor' ? (
                  <Box
                    component="img"
                    src={npc.spriteUrl}
                    alt={npc.name}
                    sx={{
                      width: 80,
                      height: 'auto',
                      imageRendering: 'pixelated',
                      objectFit: 'contain',
                    }}
                  />
                ) : (
                  <AnimatedSprite
                    slug={npc.spriteSlug}
                    basePath="/assets/market"
                    width={64}
                    fallbackSrc={npc.spriteUrl}
                    frameInterval={800}
                  />
                )}
              </Box>
            </Tooltip>
          );
        })}
      </Paper>

      {/* Hint text */}
      <Typography
        sx={{
          textAlign: 'center',
          mt: 2,
          color: tokens.colors.text.disabled,
          fontSize: '0.875rem',
        }}
      >
        Click to interact - vendors for shopping, travelers for relationships
      </Typography>

      {/* Current Time Indicator */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          mt: 2,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.75,
            p: 1,
            px: 1.5,
            borderRadius: '8px',
            bgcolor: `${tokens.colors.secondary}15`,
            border: `1px solid ${tokens.colors.secondary}40`,
          }}
        >
          <TimeIcon sx={{ fontSize: 16, color: tokens.colors.secondary }} />
          <Typography
            sx={{
              fontSize: '0.8rem',
              fontWeight: 600,
              color: tokens.colors.secondary,
            }}
          >
            {TIME_LABELS[timeInfo.current]}
          </Typography>
        </Box>
      </Box>

      {/* NPC Click Menu Popover */}
      <Popover
        open={popoverOpen}
        anchorEl={anchorEl}
        onClose={handleClosePopover}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        slotProps={{
          paper: {
            sx: {
              bgcolor: tokens.colors.background.paper,
              border: `1px solid ${tokens.colors.border}`,
              borderRadius: '16px',
              mt: 1,
              minWidth: 200,
              boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            },
          },
        }}
      >
        {selectedNpc && (
          <Box>
            {/* NPC Header */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                p: 2,
                borderBottom: `1px solid ${tokens.colors.border}`,
              }}
            >
              {selectedNpc.type === 'vendor' ? (
                <Box
                  component="img"
                  src={selectedNpc.spriteUrl}
                  alt={selectedNpc.name}
                  sx={{
                    width: 40,
                    height: 'auto',
                    imageRendering: 'pixelated',
                    objectFit: 'contain',
                  }}
                />
              ) : (
                <AnimatedSprite
                  slug={selectedNpc.spriteSlug}
                  basePath="/assets/market"
                  width={40}
                  fallbackSrc={selectedNpc.spriteUrl}
                  frameInterval={600}
                />
              )}
              <Box>
                <Typography sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
                  {selectedNpc.name}
                </Typography>
                <Chip
                  size="small"
                  label={selectedNpc.type}
                  sx={{
                    height: 18,
                    fontSize: '0.6rem',
                    bgcolor: `${getTypeColor(selectedNpc.type)}20`,
                    color: getTypeColor(selectedNpc.type),
                  }}
                />
              </Box>
            </Box>

            {/* Menu Options */}
            <List sx={{ py: 0.5 }}>
              {/* Chat option - always available */}
              <ListItemButton
                onClick={handleClosePopover}
                sx={{
                  py: 1,
                  px: 2,
                  '&:hover': { bgcolor: `${tokens.colors.secondary}15` },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <ChatIcon sx={{ fontSize: 20, color: tokens.colors.secondary }} />
                </ListItemIcon>
                <ListItemText
                  primary="Chat"
                  primaryTypographyProps={{ fontSize: '0.85rem' }}
                />
              </ListItemButton>

              {/* View Storefront - vendors only */}
              {selectedNpc.type === 'vendor' && (
                <ListItemButton
                  onClick={handleViewStorefront}
                  sx={{
                    py: 1,
                    px: 2,
                    '&:hover': { bgcolor: `${tokens.colors.warning}15` },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <VendorIcon sx={{ fontSize: 20, color: tokens.colors.warning }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="View Storefront"
                    secondary={`${selectedNpc.itemCount} items`}
                    primaryTypographyProps={{ fontSize: '0.85rem' }}
                    secondaryTypographyProps={{ fontSize: '0.7rem' }}
                  />
                </ListItemButton>
              )}

              {/* Gift option - always available */}
              <ListItemButton
                onClick={handleGift}
                sx={{
                  py: 1,
                  px: 2,
                  '&:hover': { bgcolor: `${tokens.colors.success}15` },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <GiftIcon sx={{ fontSize: 20, color: tokens.colors.success }} />
                </ListItemIcon>
                <ListItemText
                  primary="Gift"
                  primaryTypographyProps={{ fontSize: '0.85rem' }}
                />
              </ListItemButton>

              <Divider sx={{ my: 0.5, borderColor: tokens.colors.border }} />

              {/* View Wiki */}
              <ListItemButton
                onClick={handleViewWiki}
                sx={{
                  py: 1,
                  px: 2,
                  '&:hover': { bgcolor: `${tokens.colors.text.secondary}15` },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <WikiIcon sx={{ fontSize: 20, color: tokens.colors.text.secondary }} />
                </ListItemIcon>
                <ListItemText
                  primary="View Wiki Page"
                  primaryTypographyProps={{ fontSize: '0.85rem' }}
                />
              </ListItemButton>
            </List>
          </Box>
        )}
      </Popover>
    </Box>
  );
}
