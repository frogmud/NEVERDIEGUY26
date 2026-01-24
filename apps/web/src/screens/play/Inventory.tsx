import { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Container,
  Tabs,
  Tab,
  Chip,
  Dialog,
  DialogContent,
  Button,
  Tooltip,
} from '@mui/material';
import {
  AutoAwesomeSharp as RareIcon,
  LocalOfferSharp as SellIcon,
  SwapHorizSharp as TradeIcon,
  InventorySharp as EmptyIcon,
} from '@mui/icons-material';
import { tokens } from '../../theme';
import { PageHeader } from '../../components/Placeholder';
import { CardSection } from '../../components/CardSection';
import { usePlayerData } from '../../hooks/usePlayerData';
import { getEntity, type Item } from '../../data/wiki';
import { getItemTooltipContent, hasTooltipContent } from '../../utils/itemTooltips';

// Map wiki ItemType to display categories
function getItemCategory(itemType?: string): string {
  switch (itemType) {
    case 'Weapon': return 'weapon';
    case 'Armor': return 'armor';
    case 'Consumable': return 'consumable';
    case 'Material': return 'material';
    case 'Quest': return 'quest';
    case 'Artifact': return 'artifact';
    case 'Currency': return 'currency';
    default: return 'misc';
  }
}

// Map wiki Rarity to lowercase for styling
function normalizeRarity(rarity?: string): string {
  return (rarity || 'common').toLowerCase();
}

const rarityConfig: Record<string, { color: string; label: string }> = {
  common: { color: tokens.colors.text.secondary, label: 'Common' },
  uncommon: { color: tokens.colors.success, label: 'Uncommon' },
  rare: { color: tokens.colors.secondary, label: 'Rare' },
  epic: { color: '#a855f7', label: 'Epic' },
  legendary: { color: tokens.colors.warning, label: 'Legendary' },
};

const typeFilters = ['all', 'weapon', 'armor', 'consumable', 'material', 'artifact', 'misc'];

// Resolved inventory item with wiki data
interface InventoryDisplayItem {
  id: string;
  slug: string;
  name: string;
  rarity: string;
  type: string;
  quantity: number;
  description?: string;
  value?: number | string;
  wikiItem?: Item; // Full wiki item for tooltip
}

interface ItemCardProps {
  item: InventoryDisplayItem;
  onClick: () => void;
}

function ItemCard({ item, onClick }: ItemCardProps) {
  const rarity = rarityConfig[item.rarity] || rarityConfig.common;

  // Generate tooltip content from wiki item data
  const tooltipContent = item.wikiItem ? getItemTooltipContent(item.wikiItem) : null;
  const hasTooltip = item.wikiItem ? hasTooltipContent(item.wikiItem) : false;

  const cardContent = (
    <Box
      onClick={onClick}
      sx={{
        position: 'relative',
        p: 2,
        borderRadius: 2,
        bgcolor: tokens.colors.background.paper,
        border: `1px solid ${tokens.colors.border}`,
        cursor: 'pointer',
        transition: 'all 0.2s',
        '&:hover': {
          borderColor: rarity.color,
          transform: 'translateY(-2px)',
        },
      }}
    >
      {/* Rarity indicator */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          bgcolor: rarity.color,
          borderRadius: '8px 8px 0 0',
        }}
      />

      {/* Item icon placeholder */}
      <Box
        sx={{
          width: 64,
          height: 64,
          borderRadius: 2,
          bgcolor: `${rarity.color}20`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mx: 'auto',
          mb: 1.5,
          border: `2px solid ${rarity.color}40`,
        }}
      >
        <RareIcon sx={{ fontSize: 28, color: rarity.color }} />
      </Box>

      {/* Item name */}
      <Typography
        variant="body2"
        sx={{
          fontWeight: 600,
          textAlign: 'center',
          mb: 0.5,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {item.name}
      </Typography>

      {/* Quantity */}
      {item.quantity > 1 && (
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            textAlign: 'center',
            color: tokens.colors.text.secondary,
          }}
        >
          x{item.quantity}
        </Typography>
      )}
    </Box>
  );

  // Wrap in tooltip if item has tooltip-worthy content
  if (hasTooltip && tooltipContent) {
    return (
      <Tooltip
        title={tooltipContent}
        placement="top"
        arrow
        enterDelay={400}
        enterNextDelay={400}
        slotProps={{
          tooltip: {
            sx: {
              bgcolor: tokens.colors.background.paper,
              border: `2px solid ${rarity.color}`,
              boxShadow: `0 4px 20px rgba(0,0,0,0.5)`,
              borderRadius: 2,
              p: 0,
            },
          },
          arrow: {
            sx: {
              color: tokens.colors.background.paper,
              '&::before': {
                border: `2px solid ${rarity.color}`,
              },
            },
          },
        }}
      >
        {cardContent}
      </Tooltip>
    );
  }

  return cardContent;
}

interface ItemDetailDialogProps {
  item: InventoryDisplayItem | null;
  open: boolean;
  onClose: () => void;
  onSell?: (item: InventoryDisplayItem) => void;
}

function ItemDetailDialog({ item, open, onClose, onSell }: ItemDetailDialogProps) {
  if (!item) return null;
  const rarity = rarityConfig[item.rarity] || rarityConfig.common;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: tokens.colors.background.paper,
          borderRadius: 3,
        },
      }}
    >
      <DialogContent sx={{ textAlign: 'center', py: 4 }}>
        {/* Item icon */}
        <Box
          sx={{
            width: 100,
            height: 100,
            borderRadius: 3,
            bgcolor: `${rarity.color}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 2,
            border: `3px solid ${rarity.color}`,
          }}
        >
          <RareIcon sx={{ fontSize: 48, color: rarity.color }} />
        </Box>

        {/* Rarity badge */}
        <Chip
          label={rarity.label}
          size="small"
          sx={{
            mb: 2,
            bgcolor: `${rarity.color}20`,
            color: rarity.color,
            fontWeight: 600,
          }}
        />

        {/* Name */}
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
          {item.name}
        </Typography>

        {/* Type & quantity */}
        <Typography variant="body2" sx={{ color: tokens.colors.text.secondary, mb: 3 }}>
          {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
          {item.quantity > 1 && ` (x${item.quantity})`}
        </Typography>

        {/* Description */}
        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: tokens.colors.background.elevated,
            mb: 3,
          }}
        >
          <Typography variant="body2" sx={{ color: tokens.colors.text.secondary, fontStyle: 'italic' }}>
            {item.description || 'A mysterious item with untold potential.'}
          </Typography>
        </Box>

        {/* Value */}
        {item.value && (
          <Typography variant="body2" sx={{ color: tokens.colors.warning, mb: 3 }}>
            Value: {typeof item.value === 'number' ? `${item.value} gold` : item.value}
          </Typography>
        )}

        {/* Actions */}
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
          {item.type === 'consumable' && (
            <Button variant="contained" color="success" onClick={onClose}>
              Use
            </Button>
          )}
          {item.value && onSell && (
            <Button
              variant="outlined"
              startIcon={<SellIcon />}
              onClick={() => {
                onSell(item);
                onClose();
              }}
            >
              Sell
            </Button>
          )}
          <Button variant="outlined" startIcon={<TradeIcon />} onClick={onClose}>
            Trade
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

export function Inventory() {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedItem, setSelectedItem] = useState<InventoryDisplayItem | null>(null);
  const { stash, gold, sellItem } = usePlayerData();

  // Resolve stash items to display items with wiki data
  const displayItems = useMemo((): InventoryDisplayItem[] => {
    return stash.map((stashItem) => {
      const wikiItem = getEntity(stashItem.itemSlug) as Item | undefined;
      return {
        id: stashItem.id,
        slug: stashItem.itemSlug,
        name: wikiItem?.name || stashItem.itemSlug.replace(/-/g, ' '),
        rarity: normalizeRarity(wikiItem?.rarity),
        type: getItemCategory(wikiItem?.itemType),
        quantity: stashItem.quantity,
        description: wikiItem?.description,
        value: wikiItem?.value,
        wikiItem, // Include full wiki item for tooltip
      };
    });
  }, [stash]);

  const filteredItems = activeTab === 0
    ? displayItems
    : displayItems.filter((item) => item.type === typeFilters[activeTab]);

  const handleSell = (item: InventoryDisplayItem) => {
    const price = typeof item.value === 'number' ? item.value : 0;
    if (price > 0) {
      sellItem(item.id, price, 1);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 2 }}>
      <PageHeader
        title="Inventory"
        subtitle={`${displayItems.length} items | ${gold} gold`}
      />

      {/* Stats Bar */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, overflowX: 'auto', pb: 1 }}>
        {Object.entries(rarityConfig).map(([key, config]) => {
          const count = displayItems.filter((i) => i.rarity === key).length;
          if (count === 0) return null;
          return (
            <Chip
              key={key}
              label={`${config.label}: ${count}`}
              size="small"
              sx={{
                bgcolor: `${config.color}15`,
                color: config.color,
                fontWeight: 500,
              }}
            />
          );
        })}
      </Box>

      {/* Filter Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          variant="scrollable"
          scrollButtons="auto"
        >
          {typeFilters.map((type) => (
            <Tab
              key={type}
              label={type.charAt(0).toUpperCase() + type.slice(1)}
              sx={{ textTransform: 'capitalize' }}
            />
          ))}
        </Tabs>
      </Box>

      {/* Items Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
          gap: 2,
        }}
      >
        {filteredItems.map((item) => (
          <ItemCard
            key={item.id}
            item={item}
            onClick={() => setSelectedItem(item)}
          />
        ))}
      </Box>

      {/* Empty State */}
      {displayItems.length === 0 && activeTab === 0 && (
        <CardSection padding={4} sx={{ textAlign: 'center' }}>
          <EmptyIcon sx={{ fontSize: 48, color: tokens.colors.text.disabled, mb: 2 }} />
          <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
            No items yet
          </Typography>
          <Typography variant="body2" sx={{ color: tokens.colors.text.secondary }}>
            Items you collect during runs will appear here
          </Typography>
        </CardSection>
      )}

      {filteredItems.length === 0 && activeTab !== 0 && displayItems.length > 0 && (
        <CardSection padding={4} sx={{ textAlign: 'center' }}>
          <Typography variant="body1" sx={{ color: tokens.colors.text.secondary }}>
            No items in this category
          </Typography>
        </CardSection>
      )}

      {/* Item Detail Dialog */}
      <ItemDetailDialog
        item={selectedItem}
        open={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        onSell={handleSell}
      />
    </Container>
  );
}
