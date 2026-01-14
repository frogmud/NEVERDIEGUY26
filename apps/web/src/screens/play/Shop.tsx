import { useState, useMemo, useCallback } from 'react';
import { Box, Typography, Button, Paper, Chip, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import {
  ShoppingCartSharp as CartIcon,
  ArrowForwardSharp as ContinueIcon,
  FavoriteSharp as FavorIcon,
  CheckCircleSharp as CheckIcon,
} from '@mui/icons-material';
import { DURATION } from '../../utils/transitions';
import { tokens } from '../../theme';
import { createSeededRng, getRequisitionPool, getEmptyPoolMessage } from '../../data/pools';
import { applyFavorDiscount, getTierPriceMultiplier, type LuckySynergyLevel } from '../../data/balance-config';
import type { Item, Rarity } from '../../data/wiki/types';

const gamingFont = { fontFamily: tokens.fonts.gaming };

// Rarity colors
const RARITY_COLORS: Record<Rarity, string> = {
  Common: tokens.colors.text.secondary,
  Uncommon: tokens.colors.success,
  Rare: tokens.colors.secondary,
  Epic: '#a855f7',
  Legendary: tokens.colors.warning,
  Unique: tokens.colors.error,
};

// Base prices by rarity
const BASE_PRICE_BY_RARITY: Record<Rarity, number> = {
  Common: 25,
  Uncommon: 50,
  Rare: 100,
  Epic: 200,
  Legendary: 400,
  Unique: 600,
};

// Calculate item cost based on rarity and tier (base price before discounts)
function calculateBaseItemCost(item: Item, tier: number): number {
  const base = BASE_PRICE_BY_RARITY[item.rarity || 'Common'];
  const tierMult = getTierPriceMultiplier(tier);
  return Math.floor(base * tierMult);
}

// Calculate final item cost with favor discount applied
function calculateItemCost(item: Item, tier: number, favorTokens: number = 0): number {
  const basePrice = calculateBaseItemCost(item, tier);
  return applyFavorDiscount(basePrice, favorTokens);
}

// Legacy shop items (fallback when wiki data not available)
interface LegacyShopItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  rarity: Rarity;
}

const LEGACY_SHOP_ITEMS: LegacyShopItem[] = [
  { id: 'd4', name: 'Extra D4', description: '+1 D4 die to your loadout', cost: 30, rarity: 'Common' },
  { id: 'd6', name: 'Extra D6', description: '+1 D6 die to your loadout', cost: 40, rarity: 'Common' },
  { id: 'd8', name: 'Extra D8', description: '+1 D8 die to your loadout', cost: 50, rarity: 'Uncommon' },
  { id: 'd10', name: 'Extra D10', description: '+1 D10 die to your loadout', cost: 60, rarity: 'Uncommon' },
  { id: 'd12', name: 'Extra D12', description: '+1 D12 die to your loadout', cost: 75, rarity: 'Rare' },
  { id: 'd20', name: 'Extra D20', description: '+1 D20 die to your loadout', cost: 100, rarity: 'Rare' },
  { id: 'summon', name: '+1 Summon', description: 'Gain an extra summon this domain', cost: 80, rarity: 'Uncommon' },
  { id: 'tribute', name: '+1 Tribute', description: 'Gain an extra tribute this domain', cost: 60, rarity: 'Common' },
  { id: 'double', name: '2x Next Combo', description: 'Double your next combo multiplier', cost: 120, rarity: 'Rare' },
];

interface ShopProps {
  gold: number;
  domainId: number;
  onPurchase: (cost: number, itemId: string, category: 'dice' | 'powerup' | 'upgrade') => void;
  onContinue: () => void;
  // New props for tier-filtered requisition
  threadId?: string;
  tier?: number;
  isAuditPrep?: boolean; // Include Override item for audit
  onPurchaseItem?: (item: Item, cost: number) => void;
  // Wanderer effects (Round 31)
  favorTokens?: number; // Shop discount per token
  // Lucky Number synergy - boosts rarity tier
  luckySynergy?: LuckySynergyLevel;
}

export function Shop({
  gold,
  domainId,
  onPurchase,
  onContinue,
  threadId,
  tier = 1,
  isAuditPrep = false,
  onPurchaseItem,
  favorTokens = 0,
  luckySynergy = 'none',
}: ShopProps) {
  const hasDiscount = favorTokens > 0;
  const [purchasedItems, setPurchasedItems] = useState<string[]>([]);
  const [purchasingItem, setPurchasingItem] = useState<string | null>(null);
  const [confirmItem, setConfirmItem] = useState<Item | null>(null);

  // Threshold for confirmation dialog (Epic+ items or cost > 50% of gold)
  const requiresConfirmation = useCallback(
    (item: Item, cost: number) => {
      const rarity = item.rarity || 'Common';
      const isExpensiveRarity = ['Epic', 'Legendary', 'Unique'].includes(rarity);
      const isHighCost = gold > 0 && cost > gold * 0.5;
      return isExpensiveRarity || isHighCost;
    },
    [gold]
  );

  // Generate tier-filtered items from wiki data (deterministic)
  // Lucky synergy boosts effective tier for better rarity
  const wikiItems = useMemo(() => {
    if (!threadId) return [];
    try {
      const rng = createSeededRng(threadId);
      const domainSlug = `domain-${domainId}`;
      return getRequisitionPool(
        {
          tier,
          domain: domainSlug,
          count: 4, // Hades-style limited inventory
          includeOverride: isAuditPrep,
        },
        rng,
        luckySynergy
      );
    } catch {
      return [];
    }
  }, [threadId, tier, domainId, isAuditPrep, luckySynergy]);

  const useWikiItems = wikiItems.length > 0;

  // Actually execute the purchase (Round 31)
  const executePurchase = useCallback(
    (item: Item) => {
      const cost = calculateItemCost(item, tier, favorTokens);
      if (gold >= cost && !purchasedItems.includes(item.slug) && !purchasingItem) {
        setPurchasingItem(item.slug);
        setTimeout(() => {
          onPurchaseItem?.(item, cost);
          setPurchasedItems((prev) => [...prev, item.slug]);
          setPurchasingItem(null);
        }, DURATION.normal);
      }
    },
    [gold, tier, favorTokens, purchasedItems, purchasingItem, onPurchaseItem]
  );

  // Handle purchase click - show confirmation for expensive items (Round 31)
  const handlePurchaseWikiItem = (item: Item) => {
    const cost = calculateItemCost(item, tier, favorTokens);
    if (gold >= cost && !purchasedItems.includes(item.slug) && !purchasingItem) {
      if (requiresConfirmation(item, cost)) {
        setConfirmItem(item);
      } else {
        executePurchase(item);
      }
    }
  };

  // Confirm purchase from dialog (Round 31)
  const handleConfirmPurchase = () => {
    if (confirmItem) {
      executePurchase(confirmItem);
      setConfirmItem(null);
    }
  };

  const handleCancelPurchase = () => {
    setConfirmItem(null);
  };

  // Calculate discount percentage for display
  const discountPercent = hasDiscount ? Math.round(favorTokens * 15) : 0;

  const handlePurchaseLegacy = (item: LegacyShopItem) => {
    if (gold >= item.cost && !purchasedItems.includes(item.id)) {
      onPurchase(item.cost, item.id, 'dice');
      setPurchasedItems((prev) => [...prev, item.id]);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100%',
        p: 3,
      }}
    >
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Typography
          sx={{
            ...gamingFont,
            fontSize: '0.75rem',
            color: tokens.colors.text.disabled,
            letterSpacing: '0.1em',
            mb: 0.5,
          }}
        >
          REQUISITION
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
          <CartIcon sx={{ fontSize: 24, color: '#c4a000' }} />
          <Typography sx={{ ...gamingFont, fontSize: '1.5rem', color: tokens.colors.text.primary }}>
            Tier {tier} Issuance
          </Typography>
        </Box>
        {isAuditPrep && (
          <Chip
            label="AUDIT PREP"
            size="small"
            sx={{
              mt: 1,
              height: 20,
              fontSize: '0.625rem',
              bgcolor: `${tokens.colors.error}20`,
              color: tokens.colors.error,
              border: `1px solid ${tokens.colors.error}40`,
            }}
          />
        )}
        {hasDiscount && (
          <Chip
            icon={<FavorIcon sx={{ fontSize: 12 }} />}
            label={`${discountPercent}% OFF`}
            size="small"
            sx={{
              mt: 1,
              ml: isAuditPrep ? 1 : 0,
              height: 20,
              fontSize: '0.625rem',
              bgcolor: `${tokens.colors.success}20`,
              color: tokens.colors.success,
              border: `1px solid ${tokens.colors.success}40`,
              '& .MuiChip-icon': { color: tokens.colors.success },
            }}
          />
        )}
      </Box>

      {/* Gold display */}
      <Paper
        sx={{
          bgcolor: tokens.colors.background.elevated,
          border: `1px solid ${tokens.colors.border}`,
          borderRadius: 1,
          px: 3,
          py: 1,
          mb: 3,
        }}
      >
        <Typography sx={{ ...gamingFont, fontSize: '1.5rem', color: '#c4a000' }}>
          {gold} Credits
        </Typography>
      </Paper>

      {/* Wiki Items Row (Hades-style limited inventory) */}
      {useWikiItems ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            gap: 2,
            justifyContent: 'center',
            flexWrap: 'wrap',
            width: '100%',
            maxWidth: 900,
            mb: 4,
          }}
        >
          {wikiItems.map((item) => {
            const isPurchased = purchasedItems.includes(item.slug);
            const isPurchasing = purchasingItem === item.slug;
            const baseCost = calculateBaseItemCost(item, tier);
            const cost = calculateItemCost(item, tier, favorTokens);
            const canAfford = gold >= cost;
            const rarityColor = RARITY_COLORS[item.rarity || 'Common'];
            const showOriginalPrice = hasDiscount && baseCost !== cost;

            return (
              <Paper
                key={item.slug}
                sx={{
                  bgcolor: tokens.colors.background.paper,
                  border: `2px solid ${isPurchased ? tokens.colors.success : `${rarityColor}40`}`,
                  borderRadius: 1,
                  p: 1.5,
                  display: 'flex',
                  flexDirection: 'column',
                  width: 180,
                  flexShrink: 0,
                  opacity: isPurchased ? 0.6 : 1,
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: isPurchased ? tokens.colors.success : rarityColor,
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                {/* Item Header */}
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1 }}>
                  {item.image && (
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: 1,
                        bgcolor: `${rarityColor}10`,
                        border: `1px solid ${rarityColor}30`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        overflow: 'hidden',
                      }}
                    >
                      <Box
                        component="img"
                        src={item.image}
                        alt={item.name}
                        sx={{
                          width: 28,
                          height: 28,
                          objectFit: 'contain',
                        }}
                        onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </Box>
                  )}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      sx={{
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        color: tokens.colors.text.primary,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {item.name}
                    </Typography>
                    <Chip
                      label={item.rarity}
                      size="small"
                      sx={{
                        height: 16,
                        fontSize: '0.625rem',
                        bgcolor: `${rarityColor}15`,
                        color: rarityColor,
                        border: `1px solid ${rarityColor}30`,
                        '& .MuiChip-label': { px: 0.5 },
                      }}
                    />
                  </Box>
                </Box>

                {/* Item Type */}
                <Typography
                  sx={{
                    fontSize: '0.75rem',
                    color: tokens.colors.text.disabled,
                    mb: 1,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  {item.itemType || 'Item'}
                </Typography>

                {/* Description */}
                <Typography
                  sx={{
                    fontSize: '0.65rem',
                    color: tokens.colors.text.secondary,
                    mb: 1.5,
                    flex: 1,
                    lineHeight: 1.4,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {item.description || 'A mysterious item from the archive.'}
                </Typography>

                {/* Price and Buy */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                    {showOriginalPrice && (
                      <Typography
                        sx={{
                          ...gamingFont,
                          fontSize: '0.75rem',
                          color: tokens.colors.text.disabled,
                          textDecoration: 'line-through',
                        }}
                      >
                        {baseCost}c
                      </Typography>
                    )}
                    <Typography
                      sx={{
                        ...gamingFont,
                        fontSize: '0.75rem',
                        color: showOriginalPrice ? tokens.colors.success : '#c4a000',
                      }}
                    >
                      {cost}c
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    size="small"
                    disabled={isPurchased || isPurchasing || !canAfford}
                    onClick={() => handlePurchaseWikiItem(item)}
                    startIcon={isPurchased ? <CheckIcon sx={{ fontSize: 14 }} /> : undefined}
                    sx={{
                      minWidth: 60,
                      bgcolor: isPurchased
                        ? tokens.colors.success
                        : isPurchasing
                        ? `${rarityColor}80`
                        : canAfford
                        ? rarityColor
                        : tokens.colors.background.elevated,
                      color: '#fff',
                      ...gamingFont,
                      fontSize: '0.75rem',
                      py: 0.5,
                      transition: 'all 150ms ease-out',
                      transform: isPurchasing ? 'scale(0.97)' : 'scale(1)',
                      '&:hover': {
                        bgcolor: isPurchased ? tokens.colors.success : rarityColor,
                        filter: 'brightness(1.1)',
                      },
                      '&.Mui-disabled': {
                        bgcolor: isPurchased
                          ? tokens.colors.success
                          : isPurchasing
                          ? `${rarityColor}80`
                          : tokens.colors.background.elevated,
                        color: isPurchased || isPurchasing ? '#fff' : tokens.colors.text.disabled,
                      },
                    }}
                  >
                    {isPurchased ? 'Owned' : isPurchasing ? '...' : 'Buy'}
                  </Button>
                </Box>
              </Paper>
            );
          })}
        </Box>
      ) : (
        /* Legacy Items Grid (fallback) */
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: 2,
            width: '100%',
            maxWidth: 700,
            mb: 4,
          }}
        >
          {LEGACY_SHOP_ITEMS.map((item) => {
            const isPurchased = purchasedItems.includes(item.id);
            const canAfford = gold >= item.cost;
            const rarityColor = RARITY_COLORS[item.rarity];

            return (
              <Paper
                key={item.id}
                sx={{
                  bgcolor: tokens.colors.background.paper,
                  border: `1px solid ${isPurchased ? tokens.colors.success : `${rarityColor}40`}`,
                  borderRadius: 1,
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  opacity: isPurchased ? 0.6 : 1,
                }}
              >
                <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', mb: 0.5 }}>{item.name}</Typography>
                <Chip
                  label={item.rarity}
                  size="small"
                  sx={{
                    width: 'fit-content',
                    height: 18,
                    fontSize: '0.625rem',
                    bgcolor: `${rarityColor}15`,
                    color: rarityColor,
                    mb: 1,
                  }}
                />
                <Typography
                  sx={{
                    fontSize: '0.7rem',
                    color: tokens.colors.text.secondary,
                    mb: 1.5,
                    flex: 1,
                  }}
                >
                  {item.description}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography sx={{ ...gamingFont, fontSize: '1rem', color: '#c4a000' }}>
                    {item.cost}c
                  </Typography>
                  <Button
                    variant="contained"
                    size="small"
                    disabled={isPurchased || !canAfford}
                    onClick={() => handlePurchaseLegacy(item)}
                    sx={{
                      bgcolor: isPurchased ? tokens.colors.success : canAfford ? '#c4a000' : tokens.colors.background.elevated,
                      ...gamingFont,
                      fontSize: '0.65rem',
                      '&:hover': {
                        bgcolor: isPurchased ? tokens.colors.success : '#a08300',
                      },
                      '&.Mui-disabled': {
                        bgcolor: isPurchased ? tokens.colors.success : tokens.colors.background.elevated,
                        color: isPurchased ? '#fff' : tokens.colors.text.disabled,
                      },
                    }}
                  >
                    {isPurchased ? 'Owned' : 'Buy'}
                  </Button>
                </Box>
              </Paper>
            );
          })}
        </Box>
      )}

      {/* Empty state */}
      {useWikiItems && wikiItems.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography sx={{ ...gamingFont, fontSize: '1rem', color: tokens.colors.text.disabled }}>
            {getEmptyPoolMessage('requisition')}
          </Typography>
        </Box>
      )}

      {/* Continue button */}
      <Button
        variant="contained"
        onClick={onContinue}
        endIcon={<ContinueIcon />}
        sx={{
          bgcolor: tokens.colors.success,
          ...gamingFont,
          fontSize: '1.125rem',
          px: 4,
          py: 1.5,
          '&:hover': { bgcolor: '#1e8449' },
        }}
      >
        Continue
      </Button>

      {/* Confirmation Dialog (Round 31) */}
      <Dialog
        open={Boolean(confirmItem)}
        onClose={handleCancelPurchase}
        PaperProps={{
          sx: {
            bgcolor: tokens.colors.background.paper,
            border: `1px solid ${tokens.colors.border}`,
            borderRadius: 2,
            minWidth: 280,
          },
        }}
      >
        <DialogTitle sx={{ ...gamingFont, fontSize: '1.125rem', pb: 1 }}>Confirm Purchase</DialogTitle>
        <DialogContent>
          {confirmItem && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography sx={{ fontWeight: 600 }}>{confirmItem.name}</Typography>
              <Chip
                label={confirmItem.rarity}
                size="small"
                sx={{
                  width: 'fit-content',
                  height: 18,
                  fontSize: '0.625rem',
                  bgcolor: `${RARITY_COLORS[confirmItem.rarity || 'Common']}15`,
                  color: RARITY_COLORS[confirmItem.rarity || 'Common'],
                }}
              />
              <Typography sx={{ fontSize: '0.75rem', color: tokens.colors.text.secondary }}>
                {confirmItem.description || 'A mysterious item from the archive.'}
              </Typography>
              <Typography sx={{ ...gamingFont, fontSize: '1.125rem', color: '#c4a000', mt: 1 }}>
                Cost: {calculateItemCost(confirmItem, tier, favorTokens)}c
              </Typography>
              <Typography sx={{ fontSize: '0.7rem', color: tokens.colors.text.disabled }}>
                Remaining: {gold - calculateItemCost(confirmItem, tier, favorTokens)}c
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCancelPurchase} sx={{ color: tokens.colors.text.secondary }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmPurchase}
            sx={{
              bgcolor: confirmItem ? RARITY_COLORS[confirmItem.rarity || 'Common'] : tokens.colors.primary,
              ...gamingFont,
              fontSize: '0.7rem',
            }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
