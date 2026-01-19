/**
 * GameTabShop - Compact shop interface for sidebar
 *
 * Displays on D2-6 arrival before combat:
 * - Domain vendor with greeting
 * - 3 purchasable items (vertical layout)
 * - Reroll option
 * - Start Event button
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import { Box, Typography, Button, Chip, Tooltip } from '@mui/material';
import { PlayArrowSharp as PlayIcon, CheckCircleSharp as CheckIcon } from '@mui/icons-material';
import { tokens } from '../../../../theme';
import { createSeededRng, getRequisitionPool } from '../../../../data/pools';
import { applyFavorDiscount, getTierPriceMultiplier, SHOP_PRICING, applyRerollCalmReduction, type LuckySynergyLevel } from '../../../../data/balance-config';
import type { Item, Rarity } from '../../../../data/wiki/types';

const gamingFont = { fontFamily: tokens.fonts.gaming };

// Domain-specific shop vendors
interface ShopVendor {
  name: string;
  sprite: string;
  greeting: string;
}

const DOMAIN_VENDORS: Record<number, ShopVendor> = {
  2: {
    name: 'Mr. Bones',
    sprite: '/assets/market-svg/mr-bones/shop-01.svg',
    greeting: 'Death and taxes.',
  },
  3: {
    name: 'X-treme',
    sprite: '/assets/market-svg/xtreme/shop-01.svg',
    greeting: 'EXTREME deals!',
  },
  4: {
    name: 'The General',
    sprite: '/assets/market-svg/the-general/shop-01.svg',
    greeting: 'Fair prices.',
  },
  5: {
    name: 'Dr. Voss',
    sprite: '/assets/market-svg/dr-voss/shop-01.svg',
    greeting: 'Reality bends.',
  },
  6: {
    name: 'Willy One Eye',
    sprite: '/assets/market-svg/willy/shop-01.svg',
    greeting: 'One eye sees all.',
  },
};

// Rarity colors
const RARITY_COLORS: Record<Rarity, string> = {
  Common: tokens.colors.text.secondary,
  Uncommon: tokens.colors.success,
  Rare: tokens.colors.secondary,
  Epic: tokens.colors.rarity.epic,
  Legendary: tokens.colors.warning,
  Unique: tokens.colors.error,
};

// Base prices by rarity
const BASE_PRICE_BY_RARITY: Record<Rarity, number> = {
  Common: 75,
  Uncommon: 150,
  Rare: 300,
  Epic: 500,
  Legendary: 800,
  Unique: 1200,
};

function calculateItemCost(item: Item, tier: number, favorTokens: number = 0): number {
  const base = BASE_PRICE_BY_RARITY[item.rarity || 'Common'];
  const tierMult = getTierPriceMultiplier(tier);
  const basePrice = Math.floor(base * tierMult);
  return applyFavorDiscount(basePrice, favorTokens);
}

// Generate tooltip content from item data
function getItemTooltipContent(item: Item): React.ReactNode {
  const lines: string[] = [];

  // Effects
  if (item.effects?.length) {
    item.effects.forEach(effect => {
      lines.push(`${effect.name}: ${effect.description}`);
    });
  }

  // Dice effects
  if (item.diceEffects?.length) {
    item.diceEffects.forEach(de => {
      lines.push(`Dice (d${de.die}): ${de.effect}`);
    });
  }

  // Element affinity
  if (item.element && item.element !== 'Neutral') {
    lines.push(`Affinity: ${item.element}`);
  }

  // Persistence
  if (item.persistsAcrossDomains) {
    lines.push('Persists across domains');
  }

  if (lines.length === 0) return null;

  return (
    <Box sx={{ p: 0.5 }}>
      {lines.map((line, i) => (
        <Typography key={`tooltip-line-${i}-${line.slice(0, 20)}`} variant="body2" sx={{ fontSize: '0.75rem' }}>
          {line}
        </Typography>
      ))}
    </Box>
  );
}

interface GameTabShopProps {
  gold: number;
  domainId: number;
  threadId: string;
  tier?: number;
  favorTokens?: number;
  calmBonus?: number;
  luckySynergy?: LuckySynergyLevel;
  onPurchaseItem: (item: Item, cost: number) => void;
  onSpendGold: (amount: number) => void;
  onContinue: () => void;
}

export function GameTabShop({
  gold,
  domainId,
  threadId,
  tier = 1,
  favorTokens = 0,
  calmBonus = 0,
  luckySynergy = 'none',
  onPurchaseItem,
  onSpendGold,
  onContinue,
}: GameTabShopProps) {
  const rerollCost = applyRerollCalmReduction(SHOP_PRICING.baseRerollCost, calmBonus);
  const vendor = DOMAIN_VENDORS[domainId] || DOMAIN_VENDORS[2];

  const [purchasedItems, setPurchasedItems] = useState<string[]>([]);
  const [rerollCount, setRerollCount] = useState(0);
  const [rerollSeed, setRerollSeed] = useState(threadId);

  // Generate items from wiki data
  const displayItems = useMemo(() => {
    const seed = rerollCount === 0 ? threadId : rerollSeed;
    try {
      const rng = createSeededRng(seed);
      const domainSlug = `domain-${domainId}`;
      return getRequisitionPool(
        {
          tier,
          domain: domainSlug,
          count: 3,
          includeOverride: false,
        },
        rng,
        luckySynergy
      );
    } catch {
      return [];
    }
  }, [threadId, rerollCount, rerollSeed, domainId, tier, luckySynergy]);

  // Execute purchase
  const executePurchase = useCallback(
    (item: Item) => {
      const cost = calculateItemCost(item, tier, favorTokens);
      if (gold >= cost && !purchasedItems.includes(item.slug)) {
        onPurchaseItem(item, cost);
        setPurchasedItems((prev) => [...prev, item.slug]);
      }
    },
    [gold, tier, favorTokens, purchasedItems, onPurchaseItem]
  );

  // Handle item click - purchase directly without confirmation
  const handleItemClick = (item: Item) => {
    const cost = calculateItemCost(item, tier, favorTokens);
    if (gold >= cost && !purchasedItems.includes(item.slug)) {
      executePurchase(item);
    }
  };

  // Reroll
  const handleReroll = useCallback(() => {
    if (gold >= rerollCost) {
      onSpendGold(rerollCost);
      setRerollCount((prev) => prev + 1);
      setRerollSeed(`${threadId}-reroll-${rerollCount + 1}`);
    }
  }, [gold, rerollCost, threadId, rerollCount, onSpendGold]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      {/* Vendor Header */}
      <Box
        sx={{
          p: 2,
          borderBottom: `1px solid ${tokens.colors.border}`,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          flexShrink: 0,
        }}
      >
        <Box
          component="img"
          src={vendor.sprite}
          alt={vendor.name}
          sx={{
            width: 48,
            height: 48,
            objectFit: 'contain',
            imageRendering: 'pixelated',
          }}
        />
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ ...gamingFont, fontSize: '0.9rem', color: tokens.colors.text.primary }}>
            {vendor.name}
          </Typography>
          <Typography sx={{ fontSize: '0.75rem', color: tokens.colors.text.secondary }}>
            {vendor.greeting}
          </Typography>
        </Box>
      </Box>

      {/* Gold Display */}
      <Box
        sx={{
          px: 2,
          py: 1.5,
          borderBottom: `1px solid ${tokens.colors.border}`,
          bgcolor: tokens.colors.background.elevated,
          flexShrink: 0,
        }}
      >
        <Typography sx={{ ...gamingFont, fontSize: '1.1rem', color: tokens.colors.warning, textAlign: 'center' }}>
          ${gold}
        </Typography>
      </Box>

      {/* Items List */}
      <Box sx={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
        {displayItems.slice(0, 3).map((item) => {
          const isPurchased = purchasedItems.includes(item.slug);
          const cost = calculateItemCost(item, tier, favorTokens);
          const canAfford = gold >= cost;
          const rarityColor = RARITY_COLORS[item.rarity || 'Common'];
          const tooltipContent = getItemTooltipContent(item);

          return (
            <Tooltip
              key={item.slug}
              title={tooltipContent || ''}
              placement="right"
              arrow
              disableHoverListener={!tooltipContent}
            >
              <Box
                onClick={() => !isPurchased && canAfford && handleItemClick(item)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  p: 1.5,
                  borderBottom: `1px solid ${tokens.colors.border}`,
                  cursor: isPurchased || !canAfford ? 'default' : 'pointer',
                  opacity: isPurchased ? 0.5 : 1,
                  bgcolor: isPurchased ? 'rgba(0,0,0,0.2)' : 'transparent',
                  transition: 'all 100ms ease',
                  '&:hover': {
                    bgcolor: isPurchased || !canAfford ? undefined : tokens.colors.background.elevated,
                  },
                }}
              >
                {/* Item Sprite */}
                <Box
                  component="img"
                  src={item.image || '/assets/items/placeholder.png'}
                  alt=""
                  sx={{
                    width: 40,
                    height: 40,
                    objectFit: 'contain',
                    imageRendering: 'pixelated',
                    filter: isPurchased ? 'grayscale(50%)' : 'none',
                  }}
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                    e.currentTarget.src = '/assets/items/placeholder.png';
                  }}
                />

                {/* Item Info */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    sx={{
                      ...gamingFont,
                      fontSize: '0.8rem',
                      color: tokens.colors.text.primary,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {item.name}
                  </Typography>
                  <Chip
                    label={item.rarity || 'Common'}
                    size="small"
                    sx={{
                      height: 18,
                      fontSize: '0.6rem',
                      bgcolor: `${rarityColor}20`,
                      color: rarityColor,
                      border: `1px solid ${rarityColor}50`,
                      '& .MuiChip-label': { px: 1 },
                    }}
                  />
                </Box>

                {/* Price / Purchased */}
                <Box sx={{ flexShrink: 0, textAlign: 'right' }}>
                  {isPurchased ? (
                    <CheckIcon sx={{ color: tokens.colors.success, fontSize: 20 }} />
                  ) : (
                    <Typography
                      sx={{
                        ...gamingFont,
                        fontSize: '0.9rem',
                        color: canAfford ? tokens.colors.warning : tokens.colors.error,
                      }}
                    >
                      ${cost}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Tooltip>
          );
        })}

        {/* Reroll Option */}
        <Box
          onClick={() => gold >= rerollCost && handleReroll()}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            p: 2,
            borderBottom: `1px solid ${tokens.colors.border}`,
            cursor: gold >= rerollCost ? 'pointer' : 'default',
            opacity: gold >= rerollCost ? 0.8 : 0.4,
            '&:hover': {
              bgcolor: gold >= rerollCost ? tokens.colors.background.elevated : undefined,
              opacity: gold >= rerollCost ? 1 : 0.4,
            },
          }}
        >
          <Typography sx={{ ...gamingFont, fontSize: '0.8rem', color: tokens.colors.text.secondary }}>
            Reroll
          </Typography>
          <Typography sx={{ ...gamingFont, fontSize: '0.85rem', color: tokens.colors.warning }}>
            ${rerollCost}
          </Typography>
        </Box>
      </Box>

      {/* Start Event Button */}
      <Box sx={{ p: 2, flexShrink: 0 }}>
        <Button
          variant="contained"
          fullWidth
          onClick={onContinue}
          startIcon={<PlayIcon />}
          sx={{
            py: 1.5,
            ...gamingFont,
            fontSize: '1rem',
            borderRadius: '12px',
            bgcolor: tokens.colors.success,
            '&:hover': {
              filter: 'brightness(0.85)',
            },
          }}
        >
          START EVENT
        </Button>
      </Box>
    </Box>
  );
}
