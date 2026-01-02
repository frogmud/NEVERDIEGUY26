/**
 * All Items View - Shows all purchasable items across all vendors
 *
 * Aggregates inventory from all shops with item details, filtering, and sorting.
 */

import { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputBase,
  Grid,
  Tooltip,
} from '@mui/material';
import {
  SearchSharp as SearchIcon,
  StorefrontSharp as ShopIcon,
  HelpOutlineSharp as UnknownIcon,
} from '@mui/icons-material';
import { tokens, RARITY_COLORS } from '../../theme';
import { shops } from '../../data/wiki/entities/shops';
import { getItemBySlug } from '../../data/wiki/entities/items';
import { useMarketAvailability } from '../../hooks/useMarketAvailability';
import { MarketSidebar } from './MarketSidebar';
import type { Shop, Item, InventoryItem } from '../../data/wiki/types';

// Selected item for sidebar
interface SelectedItem {
  item: Item;
  shop: Shop;
  inventoryEntry: InventoryItem;
}

// Aggregated shop item with source info
interface ShopItem {
  item: Item;
  inventoryEntry: InventoryItem;
  shop: Shop;
  isAvailable: boolean;
}

// Sort options
type SortOption = 'name' | 'price-asc' | 'price-desc' | 'rarity' | 'type' | 'vendor';

// Rarity order for sorting
const RARITY_ORDER = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Unique'];

export function AllItemsView() {
  const { isAvailable } = useMarketAvailability();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterRarity, setFilterRarity] = useState<string>('all');
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null);

  const handleItemClick = (shopItem: ShopItem) => {
    setSelectedItem({
      item: shopItem.item,
      shop: shopItem.shop,
      inventoryEntry: shopItem.inventoryEntry,
    });
    setSidebarOpen(true);
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
  };

  const handleImageError = (slug: string) => {
    setFailedImages((prev) => new Set(prev).add(slug));
  };

  // Aggregate all items from all shops
  const allShopItems = useMemo(() => {
    const items: ShopItem[] = [];

    shops.forEach((shop) => {
      const shopAvailability = isAvailable(shop.availability);

      shop.inventory?.forEach((invItem) => {
        const itemDetails = getItemBySlug(invItem.item);
        if (itemDetails) {
          items.push({
            item: itemDetails,
            inventoryEntry: invItem,
            shop,
            isAvailable: shopAvailability.isAvailable,
          });
        }
      });
    });

    return items;
  }, [isAvailable]);

  // Get unique item types for filter
  const itemTypes = useMemo(() => {
    const types = new Set<string>();
    allShopItems.forEach((si) => {
      if (si.item.itemType) types.add(si.item.itemType);
    });
    return Array.from(types).sort();
  }, [allShopItems]);

  // Filter and sort items
  const filteredItems = useMemo(() => {
    let filtered = [...allShopItems];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (si) =>
          si.item.name.toLowerCase().includes(query) ||
          si.shop.name.toLowerCase().includes(query) ||
          si.item.description?.toLowerCase().includes(query)
      );
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter((si) => si.item.itemType === filterType);
    }

    // Rarity filter
    if (filterRarity !== 'all') {
      filtered = filtered.filter((si) => si.item.rarity === filterRarity);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.item.name.localeCompare(b.item.name);
        case 'price-asc': {
          const priceA = typeof a.inventoryEntry.price === 'number' ? a.inventoryEntry.price : 9999;
          const priceB = typeof b.inventoryEntry.price === 'number' ? b.inventoryEntry.price : 9999;
          return priceA - priceB;
        }
        case 'price-desc': {
          const priceA = typeof a.inventoryEntry.price === 'number' ? a.inventoryEntry.price : 0;
          const priceB = typeof b.inventoryEntry.price === 'number' ? b.inventoryEntry.price : 0;
          return priceB - priceA;
        }
        case 'rarity': {
          const rarityA = RARITY_ORDER.indexOf(a.item.rarity || 'Common');
          const rarityB = RARITY_ORDER.indexOf(b.item.rarity || 'Common');
          return rarityB - rarityA; // Higher rarity first
        }
        case 'type':
          return (a.item.itemType || '').localeCompare(b.item.itemType || '');
        case 'vendor':
          return a.shop.name.localeCompare(b.shop.name);
        default:
          return 0;
      }
    });

    return filtered;
  }, [allShopItems, searchQuery, sortBy, filterType, filterRarity]);

  // Stats
  const availableNow = allShopItems.filter((i) => i.isAvailable).length;

  // Select styling (matches WikiIndex)
  const selectSx = {
    fontSize: '0.875rem',
    color: tokens.colors.text.secondary,
    '& .MuiOutlinedInput-notchedOutline': { borderColor: tokens.colors.border },
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: tokens.colors.text.disabled },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: tokens.colors.text.secondary },
    '& .MuiSelect-icon': { color: tokens.colors.text.disabled },
  };

  const menuProps = {
    PaperProps: {
      sx: {
        bgcolor: tokens.colors.background.paper,
        border: `1px solid ${tokens.colors.border}`,
        '& .MuiMenuItem-root': {
          fontSize: '0.875rem',
          '&:hover': { bgcolor: tokens.colors.background.elevated },
          '&.Mui-selected': { bgcolor: tokens.colors.background.elevated },
        },
      },
    },
  };

  return (
    <Box>
      {/* Main Card */}
      <Paper
        sx={{
          bgcolor: tokens.colors.background.paper,
          border: `1px solid ${tokens.colors.border}`,
          borderRadius: '30px',
          overflow: 'hidden',
        }}
      >
        {/* Card Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 3,
            py: 2.25,
            borderBottom: `1px solid ${tokens.colors.border}`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography sx={{ fontWeight: 600, fontSize: '1.125rem' }}>
              Items ({filteredItems.length})
            </Typography>
            <Chip
              size="small"
              label={`${availableNow} available now`}
              sx={{
                height: 22,
                fontSize: '0.7rem',
                bgcolor: `${tokens.colors.success}20`,
                color: tokens.colors.success,
              }}
            />
          </Box>
          <Paper
            sx={{
              display: 'flex',
              alignItems: 'center',
              px: 1.5,
              py: 0.5,
              bgcolor: 'transparent',
              border: `1px solid ${tokens.colors.border}`,
              borderRadius: '20px',
            }}
          >
            <InputBase
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{
                flex: 1,
                color: tokens.colors.text.primary,
                fontSize: '0.875rem',
                width: 140,
                '& input::placeholder': { color: tokens.colors.text.disabled },
              }}
            />
            <SearchIcon sx={{ color: tokens.colors.text.disabled, fontSize: 18 }} />
          </Paper>
        </Box>

        {/* Filters Row */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            px: 3,
            py: 1.5,
            borderBottom: `1px solid ${tokens.colors.border}`,
          }}
        >
          <Typography variant="body2" sx={{ color: tokens.colors.text.disabled, mr: 0.5 }}>
            Filters
          </Typography>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              displayEmpty
              sx={selectSx}
              MenuProps={menuProps}
            >
              <MenuItem value="all">All Types</MenuItem>
              {itemTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select
              value={filterRarity}
              onChange={(e) => setFilterRarity(e.target.value)}
              displayEmpty
              sx={selectSx}
              MenuProps={menuProps}
            >
              <MenuItem value="all">All Rarities</MenuItem>
              {RARITY_ORDER.map((rarity) => (
                <MenuItem key={rarity} value={rarity}>
                  {rarity}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              displayEmpty
              sx={selectSx}
              MenuProps={menuProps}
            >
              <MenuItem value="name">Name (A-Z)</MenuItem>
              <MenuItem value="price-asc">Price (Low-High)</MenuItem>
              <MenuItem value="price-desc">Price (High-Low)</MenuItem>
              <MenuItem value="rarity">Rarity (Best)</MenuItem>
              <MenuItem value="type">Type</MenuItem>
              <MenuItem value="vendor">Vendor</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Items Grid */}
        <Box sx={{ p: 3, bgcolor: tokens.colors.background.default }}>
          <Grid container spacing={2}>
            {filteredItems.map((shopItem, idx) => {
              const { item, inventoryEntry, shop, isAvailable: shopAvailable } = shopItem;
              const rarityColor = RARITY_COLORS[item.rarity as keyof typeof RARITY_COLORS] || tokens.colors.text.primary;
              const price =
                typeof inventoryEntry.price === 'number'
                  ? `${inventoryEntry.price}g`
                  : inventoryEntry.price;

              // Get item sprite
              const spriteUrl = item.image || `/assets/items/${item.itemType?.toLowerCase() || 'misc'}/${item.slug}.png`;

              return (
                <Grid key={`${shop.slug}-${item.slug}-${idx}`} size={{ xs: 6, sm: 4, md: 3, lg: 2 }}>
                  <Tooltip
                    title={
                      <Box>
                        <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', mb: 0.5 }}>
                          {item.name}
                        </Typography>
                        {item.description && (
                          <Typography sx={{ fontSize: '0.75rem', color: tokens.colors.text.secondary, mb: 1 }}>
                            {item.description.substring(0, 100)}
                            {item.description.length > 100 ? '...' : ''}
                          </Typography>
                        )}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <ShopIcon sx={{ fontSize: 12, color: tokens.colors.text.disabled }} />
                          <Typography sx={{ fontSize: '0.7rem', color: tokens.colors.text.secondary }}>
                            Sold at {shop.name}
                          </Typography>
                        </Box>
                      </Box>
                    }
                    placement="top"
                    arrow
                    slotProps={{
                      tooltip: {
                        sx: {
                          bgcolor: tokens.colors.background.paper,
                          border: `1px solid ${tokens.colors.border}`,
                          borderRadius: '8px',
                          p: 1.5,
                          maxWidth: 250,
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
                    <Paper
                      elevation={0}
                      onClick={() => handleItemClick(shopItem)}
                      sx={{
                        p: 2.5,
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: '20px',
                        bgcolor: tokens.colors.background.paper,
                        boxShadow: '0px 3px 1px 0px rgba(0,0,0,0.5)',
                        cursor: 'pointer',
                        opacity: shopAvailable ? 1 : 0.5,
                        transition: 'background-color 0.15s',
                        '&:hover': {
                          bgcolor: tokens.colors.background.elevated,
                        },
                      }}
                    >
                      {/* Item image */}
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          mb: 2,
                          height: 64,
                        }}
                      >
                        {failedImages.has(item.slug) ? (
                          <UnknownIcon
                            sx={{
                              fontSize: 56,
                              color: tokens.colors.text.disabled,
                              opacity: 0.4,
                            }}
                          />
                        ) : (
                          <Box
                            component="img"
                            src={spriteUrl}
                            alt={item.name}
                            onError={() => handleImageError(item.slug)}
                            sx={{
                              width: 64,
                              height: 64,
                              imageRendering: 'pixelated',
                              objectFit: 'contain',
                            }}
                          />
                        )}
                      </Box>

                      {/* Item name */}
                      <Typography
                        sx={{
                          fontSize: '0.9rem',
                          fontWeight: 600,
                          textAlign: 'center',
                          mb: 0.5,
                          color: tokens.colors.text.primary,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {item.name}
                      </Typography>

                      {/* Rarity */}
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5, mb: 1.5 }}>
                        <Chip
                          label={item.rarity}
                          size="small"
                          sx={{
                            height: 18,
                            fontSize: '0.65rem',
                            bgcolor: `${rarityColor}25`,
                            color: rarityColor,
                            '& .MuiChip-label': { px: 1 },
                          }}
                        />
                      </Box>

                      {/* Price */}
                      <Typography
                        sx={{
                          fontSize: '1.25rem',
                          fontWeight: 700,
                          textAlign: 'center',
                          color: tokens.colors.warning,
                          fontFamily: tokens.fonts.gaming,
                        }}
                      >
                        {price}
                      </Typography>

                      {/* Vendor indicator */}
                      <Typography
                        sx={{
                          fontSize: '0.7rem',
                          color: tokens.colors.text.secondary,
                          textAlign: 'center',
                          mt: 'auto',
                          pt: 1,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {shop.name}
                      </Typography>

                      {/* Unavailable badge */}
                      {!shopAvailable && (
                        <Chip
                          label="Vendor Away"
                          size="small"
                          sx={{
                            mt: 1.5,
                            width: '100%',
                            height: 20,
                            fontSize: '0.65rem',
                            bgcolor: `${tokens.colors.warning}20`,
                            color: tokens.colors.warning,
                          }}
                        />
                      )}
                    </Paper>
                  </Tooltip>
                </Grid>
              );
            })}
          </Grid>

          {/* Empty state */}
          {filteredItems.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <SearchIcon sx={{ fontSize: 48, color: tokens.colors.text.disabled, mb: 2 }} />
              <Typography sx={{ fontSize: '1.1rem', fontWeight: 600, mb: 1 }}>
                No items found
              </Typography>
              <Typography sx={{ color: tokens.colors.text.secondary }}>
                Try adjusting your search or filters
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
