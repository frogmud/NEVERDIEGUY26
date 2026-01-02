/**
 * Shop Detail Page
 *
 * Individual shop storefront with:
 * - Hero section with NPC portrait and branding
 * - Shop info bar (schedule, location, lucky number)
 * - Inventory grid with AllItemsView-style cards
 * - Sidebar for item details and purchase flow
 * - Price history and "last sold" mock data
 */

import { useState, useMemo } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Button,
  IconButton,
  useMediaQuery,
  Breadcrumbs,
  Link as MuiLink,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
} from '@mui/material';
import {
  NavigateNextSharp as NavIcon,
  LocalShippingSharp as MobileIcon,
  StorefrontSharp as ShopIcon,
  AccessTimeSharp as ScheduleIcon,
  CasinoSharp as LuckyIcon,
  SearchSharp as SearchIcon,
  SortSharp as SortIcon,
  TrendingUpSharp as TrendingIcon,
  HistorySharp as HistoryIcon,
  ShoppingCartSharp as CartIcon,
} from '@mui/icons-material';
import { tokens, RARITY_COLORS } from '../../theme';
import { AssetImage } from '../../components/ds';
import { shops } from '../../data/wiki/entities/shops';
import { getEntity } from '../../data/wiki';
import { slugToName } from '../../data/wiki/helpers';
import { MarketSidebar } from './MarketSidebar';
import { PurchaseChatDialog } from './PurchaseChatDialog';
import type { Item, InventoryItem, Shop } from '../../data/wiki/types';

// ============================================
// Mock Data
// ============================================

// Mock player gold balance
const PLAYER_GOLD = 5420;

// Mock price history for items
const MOCK_PRICE_HISTORY: Record<string, { price: number; date: string }[]> = {
  'soul-jar': [
    { price: 750, date: '2 days ago' },
    { price: 700, date: '5 days ago' },
    { price: 650, date: '1 week ago' },
  ],
  'bone-dust': [
    { price: 25, date: '1 day ago' },
    { price: 30, date: '3 days ago' },
  ],
};

// Mock last sold data
const MOCK_LAST_SOLD: Record<string, { player: string; timeAgo: string }> = {
  'soul-jar': { player: '@ghost_hunter42', timeAgo: '2h ago' },
  'bone-dust': { player: '@skeleton_king', timeAgo: '30m ago' },
  'cursed-finger': { player: '@dark_mage', timeAgo: '4h ago' },
};

// Mock "interested in" items (what NPC wants to buy)
const MOCK_INTERESTED_IN: Record<string, string[]> = {
  'mr-bones': ['ancient-skull', 'ectoplasm', 'grave-dirt'],
  'willy': ['interdimensional-shard', 'void-essence', 'chaos-orb'],
  'king-james': ['royal-decree', 'crown-jewel', 'golden-scepter'],
  'boo-g': ['ghost-essence', 'spirit-lantern', 'phantom-cloak'],
};

// ============================================
// Component
// ============================================

export function ShopDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [playerGold, setPlayerGold] = useState(PLAYER_GOLD);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'rarity'>('name');

  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{
    item: Item;
    shop: Shop;
    inventoryEntry: InventoryItem;
  } | null>(null);

  // Responsive padding
  const is1440 = useMediaQuery('(min-width: 1440px)');
  const is1280 = useMediaQuery('(min-width: 1280px)');
  const is1024 = useMediaQuery('(min-width: 1024px)');
  const padding = is1440 ? '60px' : is1280 ? '30px' : is1024 ? '24px' : '18px';

  // Find shop
  const shop = shops.find(s => s.slug === slug);

  // Filter and sort inventory
  const filteredInventory = useMemo(() => {
    if (!shop) return [];

    let items = (shop.inventory || []).map((inv) => {
      const itemData = getEntity(inv.item) as Item | undefined;
      return { inv, itemData };
    });

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      items = items.filter(({ inv, itemData }) =>
        (itemData?.name || slugToName(inv.item)).toLowerCase().includes(query)
      );
    }

    // Sort
    items.sort((a, b) => {
      const nameA = a.itemData?.name || slugToName(a.inv.item);
      const nameB = b.itemData?.name || slugToName(b.inv.item);
      const priceA = typeof a.inv.price === 'number' ? a.inv.price : 0;
      const priceB = typeof b.inv.price === 'number' ? b.inv.price : 0;
      const rarityOrder = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Unique'];
      const rarityA = rarityOrder.indexOf(a.itemData?.rarity || 'Common');
      const rarityB = rarityOrder.indexOf(b.itemData?.rarity || 'Common');

      switch (sortBy) {
        case 'price':
          return priceA - priceB;
        case 'rarity':
          return rarityB - rarityA;
        default:
          return nameA.localeCompare(nameB);
      }
    });

    return items;
  }, [shop, searchQuery, sortBy]);

  if (!shop) {
    return (
      <Box sx={{ p: padding, textAlign: 'center' }}>
        <Typography variant="h4">Shop not found</Typography>
        <Button onClick={() => navigate('/shop')} sx={{ mt: 2 }}>
          Back to Market
        </Button>
      </Box>
    );
  }

  const isMobile = !!shop.travelPattern;
  const rarityColor = RARITY_COLORS[shop.rarity as keyof typeof RARITY_COLORS] || tokens.colors.text.primary;
  const interestedIn = shop.proprietor ? (MOCK_INTERESTED_IN[shop.proprietor] || []) : [];

  const handleItemClick = (inv: InventoryItem, itemData: Item | undefined) => {
    if (!itemData) return;
    setSelectedItem({
      item: itemData,
      shop,
      inventoryEntry: inv,
    });
    setSidebarOpen(true);
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
    setSelectedItem(null);
  };

  return (
    <Box sx={{ p: padding }}>
      {/* Breadcrumbs */}
      <Breadcrumbs
        separator={<NavIcon sx={{ fontSize: 16 }} />}
        sx={{ mb: 3 }}
      >
        <MuiLink
          component={RouterLink}
          to="/shop"
          sx={{
            color: tokens.colors.secondary,
            textDecoration: 'none',
            '&:hover': { textDecoration: 'underline' },
          }}
        >
          Market
        </MuiLink>
        <Typography sx={{ color: tokens.colors.text.primary }}>{shop.name}</Typography>
      </Breadcrumbs>

      {/* Hero Section */}
      <Paper
        sx={{
          borderRadius: '30px',
          overflow: 'hidden',
          bgcolor: tokens.colors.background.paper,
          mb: 4,
          boxShadow: '0px 3px 1px 0px rgba(0,0,0,0.5)',
        }}
      >
        {/* Hero Content */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr auto' },
            gap: { xs: 3, md: 0 },
          }}
        >
          {/* Left: Shop Branding */}
          <Box
            sx={{
              p: { xs: 3, md: 4 },
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            {/* Tags */}
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Chip
                label={shop.rarity}
                size="small"
                sx={{
                  bgcolor: `${rarityColor}25`,
                  color: rarityColor,
                }}
              />
              {isMobile && (
                <Chip
                  icon={<MobileIcon sx={{ fontSize: 14 }} />}
                  label="Mobile Vendor"
                  size="small"
                  sx={{
                    bgcolor: `${tokens.colors.secondary}15`,
                    color: tokens.colors.secondary,
                  }}
                />
              )}
            </Box>

            {/* Shop Name */}
            <Typography
              sx={{
                fontFamily: tokens.fonts.gaming,
                fontSize: { xs: '2rem', md: '2.5rem' },
                fontWeight: 700,
                mb: 1,
              }}
            >
              {shop.name}
            </Typography>

            {/* Specialty/Tagline */}
            <Typography
              sx={{
                fontSize: '1.1rem',
                color: tokens.colors.text.secondary,
                mb: 3,
              }}
            >
              {shop.specialty}
            </Typography>

            {/* Proprietor Link */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  bgcolor: tokens.colors.background.elevated,
                  overflow: 'hidden',
                }}
              >
                <AssetImage
                  src={shop.portrait || '/assets/placeholders/portrait.png'}
                  alt={shop.proprietor ? slugToName(shop.proprietor) : shop.name}
                  width={40}
                  height={40}
                  sx={{ imageRendering: 'pixelated' }}
                />
              </Box>
              <Box>
                <Typography sx={{ fontSize: '0.85rem', color: tokens.colors.text.secondary }}>
                  Proprietor
                </Typography>
                <MuiLink
                  component={RouterLink}
                  to={`/wiki/wanderers/${shop.proprietor || shop.slug}`}
                  sx={{
                    color: tokens.colors.secondary,
                    textDecoration: 'none',
                    fontWeight: 600,
                    '&:hover': { textDecoration: 'underline' },
                  }}
                >
                  {shop.proprietor ? slugToName(shop.proprietor) : shop.name}
                </MuiLink>
              </Box>
            </Box>
          </Box>

          {/* Right: Large Portrait */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              bgcolor: tokens.colors.background.elevated,
              px: { xs: 2, md: 4 },
              pt: { xs: 2, md: 3 },
            }}
          >
            <AssetImage
              src={shop.sprites?.[0] || shop.portrait || '/assets/placeholders/portrait.png'}
              alt={shop.name}
              width={160}
              height={200}
              sx={{
                imageRendering: 'pixelated',
                objectFit: 'contain',
              }}
            />
          </Box>
        </Box>

        {/* Info Bar */}
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: { xs: 2, md: 4 },
            p: 2,
            px: { xs: 3, md: 4 },
            borderTop: `1px solid ${tokens.colors.border}`,
            bgcolor: tokens.colors.background.default,
          }}
        >
          {/* Schedule */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ScheduleIcon sx={{ fontSize: 18, color: tokens.colors.text.secondary }} />
            <Typography sx={{ fontSize: '0.85rem', color: tokens.colors.text.secondary }}>
              {shop.schedule}
            </Typography>
          </Box>

          {/* Location */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {isMobile ? (
              <MobileIcon sx={{ fontSize: 18, color: tokens.colors.secondary }} />
            ) : (
              <ShopIcon sx={{ fontSize: 18, color: tokens.colors.text.secondary }} />
            )}
            <Typography sx={{ fontSize: '0.85rem', color: tokens.colors.text.secondary }}>
              {isMobile
                ? `Travels: ${shop.travelPattern?.map(slugToName).join(' → ')}`
                : slugToName(shop.location || 'Market')}
            </Typography>
          </Box>

          {/* Lucky Number */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LuckyIcon sx={{ fontSize: 18, color: tokens.colors.primary }} />
            <Typography sx={{ fontSize: '0.85rem' }}>
              Lucky #{' '}
              <span style={{ color: tokens.colors.primary, fontWeight: 600 }}>
                {shop.luckyNumber}
              </span>
            </Typography>
          </Box>

          {/* Gold Balance - pill style matching ShopHome */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              ml: 'auto',
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
              {playerGold.toLocaleString()}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Currently Interested In (if any) */}
      {interestedIn.length > 0 && (
        <Paper
          sx={{
            p: 2,
            px: 3,
            mb: 3,
            borderRadius: '16px',
            bgcolor: `${tokens.colors.success}10`,
            border: `1px solid ${tokens.colors.success}30`,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            flexWrap: 'wrap',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CartIcon sx={{ fontSize: 18, color: tokens.colors.success }} />
            <Typography sx={{ fontSize: '0.85rem', color: tokens.colors.success, fontWeight: 600 }}>
              Looking to buy:
            </Typography>
          </Box>
          {interestedIn.map((itemSlug: string) => (
            <Chip
              key={itemSlug}
              label={slugToName(itemSlug)}
              size="small"
              sx={{
                bgcolor: `${tokens.colors.success}20`,
                color: tokens.colors.success,
              }}
            />
          ))}
        </Paper>
      )}

      {/* Inventory Section */}
      <Paper
        sx={{
          borderRadius: '30px',
          overflow: 'hidden',
          bgcolor: tokens.colors.background.paper,
          boxShadow: '0px 3px 1px 0px rgba(0,0,0,0.5)',
        }}
      >
        {/* Toolbar */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            p: 2,
            px: 3,
            borderBottom: `1px solid ${tokens.colors.border}`,
            flexWrap: 'wrap',
          }}
        >
          <Typography sx={{ fontWeight: 600 }}>
            Inventory ({filteredInventory.length})
          </Typography>

          <Box sx={{ flex: 1 }} />

          {/* Search */}
          <TextField
            size="small"
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 18, color: tokens.colors.text.disabled }} />
                </InputAdornment>
              ),
            }}
            sx={{
              width: 200,
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                bgcolor: tokens.colors.background.elevated,
              },
            }}
          />

          {/* Sort */}
          <FormControl size="small">
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              startAdornment={
                <InputAdornment position="start">
                  <SortIcon sx={{ fontSize: 18, color: tokens.colors.text.disabled }} />
                </InputAdornment>
              }
              sx={{
                borderRadius: '12px',
                bgcolor: tokens.colors.background.elevated,
                minWidth: 120,
              }}
            >
              <MenuItem value="name">Name</MenuItem>
              <MenuItem value="price">Price</MenuItem>
              <MenuItem value="rarity">Rarity</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Item Grid */}
        <Box sx={{ p: 3 }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(2, 1fr)',
                sm: 'repeat(3, 1fr)',
                md: 'repeat(4, 1fr)',
                lg: 'repeat(5, 1fr)',
              },
              gap: 2,
            }}
          >
            {filteredInventory.map(({ inv, itemData }) => {
              const itemRarity = itemData?.rarity || 'Common';
              const itemColor = RARITY_COLORS[itemRarity] || tokens.colors.text.primary;
              const price = typeof inv.price === 'number' ? inv.price : 0;
              const canAfford = playerGold >= price;
              const lastSold = MOCK_LAST_SOLD[inv.item];
              const priceHistory = MOCK_PRICE_HISTORY[inv.item];

              return (
                <Paper
                  key={inv.item}
                  onClick={() => handleItemClick(inv, itemData)}
                  elevation={0}
                  sx={{
                    p: 2,
                    bgcolor: tokens.colors.background.elevated,
                    borderRadius: '16px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    boxShadow: '0px 3px 1px 0px rgba(0,0,0,0.5)',
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: tokens.colors.background.paper,
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  {/* Item image */}
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      mx: 'auto',
                      mb: 1.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <AssetImage
                      src={itemData?.image || `/assets/items/${inv.item}.png`}
                      alt={itemData?.name || inv.item}
                      width={64}
                      height={64}
                      fallback="hide"
                      sx={{ imageRendering: 'pixelated' }}
                    />
                  </Box>

                  {/* Item name */}
                  <Typography
                    sx={{
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      mb: 0.5,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {itemData?.name || slugToName(inv.item)}
                  </Typography>

                  {/* Rarity chip */}
                  <Chip
                    label={itemRarity}
                    size="small"
                    sx={{
                      height: 18,
                      fontSize: '0.6rem',
                      bgcolor: `${itemColor}20`,
                      color: itemColor,
                      mb: 1,
                    }}
                  />

                  {/* Price */}
                  <Typography
                    sx={{
                      fontFamily: tokens.fonts.gaming,
                      fontSize: '1rem',
                      color: canAfford ? tokens.colors.warning : tokens.colors.error,
                      mb: 0.5,
                    }}
                  >
                    {typeof inv.price === 'number' ? `${inv.price}g` : inv.price}
                  </Typography>

                  {/* Last sold indicator */}
                  {lastSold && (
                    <Typography
                      sx={{
                        fontSize: '0.65rem',
                        color: tokens.colors.text.disabled,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 0.5,
                      }}
                    >
                      <HistoryIcon sx={{ fontSize: 10 }} />
                      Sold {lastSold.timeAgo}
                    </Typography>
                  )}

                  {/* Price trend indicator */}
                  {priceHistory && priceHistory.length > 0 && (
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 0.5,
                        mt: 0.5,
                      }}
                    >
                      <TrendingIcon
                        sx={{
                          fontSize: 12,
                          color:
                            price > priceHistory[0].price
                              ? tokens.colors.error
                              : tokens.colors.success,
                        }}
                      />
                      <Typography
                        sx={{
                          fontSize: '0.6rem',
                          color:
                            price > priceHistory[0].price
                              ? tokens.colors.error
                              : tokens.colors.success,
                        }}
                      >
                        {price > priceHistory[0].price ? '+' : ''}
                        {price - priceHistory[0].price}g
                      </Typography>
                    </Box>
                  )}
                </Paper>
              );
            })}
          </Box>

          {filteredInventory.length === 0 && (
            <Box sx={{ py: 6, textAlign: 'center' }}>
              <Typography sx={{ color: tokens.colors.text.disabled }}>
                No items match your search
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>

      {/* Market Sidebar */}
      <MarketSidebar
        open={sidebarOpen}
        onClose={handleCloseSidebar}
        selectedItem={selectedItem}
      />
    </Box>
  );
}
