/**
 * DailyHits - Daily shop deals widget
 *
 * Shows today's featured shopkeeper and rotating item selection.
 * Shopkeeper and items change daily based on seeded random.
 */

import { useMemo } from 'react';
import { Box, Paper, Tooltip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { tokens } from '../../../theme';
import { CardHeader, useMidnightCountdown, StatusBanner, AssetImage } from '../../../components/ds';
import { getEntitiesByCategory, type Item } from '../../../data/wiki';
import { getDailySeed, seededRandom } from '../utils';

// Shop keepers - proprietor slugs from shops.ts
const SHOP_KEEPERS = ['king-james', 'xtreme', 'willy', 'dr-voss', 'dr-maxwell', 'mr-bones', 'boo-g', 'the-general'];

// Map itemType to asset folder for fallback paths
const ITEM_TYPE_TO_FOLDER: Record<string, string> = {
  'Weapon': 'weapons',
  'Armor': 'armor',
  'Consumable': 'consumables',
  'Material': 'materials',
  'Accessory': 'artifacts',
  'Key Item': 'quest',
};

export function DailyHits() {
  const navigate = useNavigate();
  const countdown = useMidnightCountdown();

  // Get today's seed for deterministic rotation
  const dailySeed = getDailySeed();
  const todaysShopKeeper = SHOP_KEEPERS[dailySeed % SHOP_KEEPERS.length];

  // Get items from wiki data - rotate 5 items daily
  const allItems = getEntitiesByCategory('items') as Item[];
  const dailyItems = useMemo(() => {
    const seed = dailySeed;
    const shuffled = [...allItems].sort(
      (a, b) => seededRandom(seed + allItems.indexOf(a)) - seededRandom(seed + allItems.indexOf(b))
    );
    return shuffled.slice(0, 5).map((item, i) => {
      // Build fallback path from itemType if image not set
      const folder = ITEM_TYPE_TO_FOLDER[item.itemType || ''] || 'items';
      const fallbackPath = `/assets/items/${folder}/${item.slug}.svg`;
      return {
        type: i < 2 ? 'sell' : 'buy',
        name: item.name,
        slug: item.slug,
        image: item.image || fallbackPath,
      };
    });
  }, [allItems, dailySeed]);

  // Format shopkeeper name for tooltip
  const shopKeeperDisplayName = todaysShopKeeper
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (s) => s.toUpperCase());

  return (
    <Paper sx={{ bgcolor: tokens.colors.background.paper, borderRadius: '30px', overflow: 'hidden', border: `1px solid ${tokens.colors.border}` }}>
      <CardHeader
        title="Daily Hits"
        infoTooltip="Daily shop deals - resets at midnight EST"
        tooltipPlacement="top"
      />

      {/* Status banner */}
      <StatusBanner variant="warning">
        New Daily Hits in {countdown}
      </StatusBanner>

      {/* Shop and items display */}
      <Box sx={{ bgcolor: tokens.colors.background.elevated, p: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
        {/* Shop keeper sprite */}
        <Tooltip title={`${shopKeeperDisplayName} - View Wiki`} arrow>
          <Box
            onClick={() => navigate(`/wiki/wanderers/${todaysShopKeeper}`)}
            sx={{
              width: 80,
              height: 120,
              flexShrink: 0,
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              cursor: 'pointer',
              '&:hover': { opacity: 0.8 },
            }}
          >
            <AssetImage
              src={`/assets/characters/shops/sprite-${todaysShopKeeper}.png`}
              alt={todaysShopKeeper}
              category="wanderers"
              fallback="placeholder"
              pixelated
              sx={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
              }}
            />
          </Box>
        </Tooltip>

        {/* Items grid - 2 rows: 3 then 2 */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, flex: 1, pr: 2 }}>
          {/* Row 1: 3 items */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            {dailyItems.slice(0, 3).map((item, i) => (
              <ItemSlot key={i} item={item} navigate={navigate} />
            ))}
          </Box>
          {/* Row 2: 2 items */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            {dailyItems.slice(3, 5).map((item, i) => (
              <ItemSlot key={i} item={item} navigate={navigate} />
            ))}
          </Box>
        </Box>
      </Box>
    </Paper>
  );
}

/** Individual item slot in the grid */
function ItemSlot({
  item,
  navigate,
}: {
  item: { name: string; slug: string; image: string };
  navigate: (path: string) => void;
}) {
  return (
    <Tooltip title={`${item.name} - View in Wiki`} arrow>
      <Box
        onClick={() => navigate(`/wiki/items/${item.slug}`)}
        sx={{
          width: 56,
          height: 56,
          cursor: 'pointer',
          transition: 'transform 0.15s',
          '&:hover': { transform: 'scale(1.1)' },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <AssetImage
          src={item.image}
          alt={item.name}
          category="items"
          fallback="placeholder"
          pixelated
          sx={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
          }}
        />
      </Box>
    </Tooltip>
  );
}
