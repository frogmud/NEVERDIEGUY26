import { useState, useMemo, useCallback, useEffect } from 'react';
import { Box, Typography, Button, Chip, keyframes, Snackbar, Tooltip } from '@mui/material';
import {
  ArrowForwardSharp as ContinueIcon,
  CheckCircleSharp as CheckIcon,
} from '@mui/icons-material';
import { DURATION, EASING, GLOW } from '../../utils/transitions';
import { useStaggeredEntrance } from '../../hooks';
import { tokens } from '../../theme';
import { createSeededRng, getRequisitionPool, getEmptyPoolMessage } from '../../data/pools';
import { applyFavorDiscount, getTierPriceMultiplier, SHOP_PRICING, applyRerollCalmReduction, type LuckySynergyLevel } from '../../data/balance-config';
import type { Item, Rarity } from '../../data/wiki/types';

const gamingFont = { fontFamily: tokens.fonts.gaming };

// Vendor animation
const slideIn = keyframes`
  0% { opacity: 0; transform: translateX(-30px); }
  100% { opacity: 1; transform: translateX(0); }
`;

// Shake animation for "can't afford" feedback
const shake = keyframes`
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-8px); }
  40% { transform: translateX(8px); }
  60% { transform: translateX(-6px); }
  80% { transform: translateX(6px); }
`;

// Domain-specific shop vendors
interface ShopVendor {
  name: string;
  sprite: string;
  sprite2?: string;
  greeting: string;
  wikiSlug: string;
}

const DOMAIN_VENDORS: Record<number, ShopVendor> = {
  1: {
    name: 'Stitch-up Girl',
    sprite: '/assets/market-svg/stitch-up-girl/shop-01.svg',
    sprite2: '/assets/market-svg/stitch-up-girl/shop-02.svg',
    greeting: 'Patch yourself up before the next fight.',
    wikiSlug: 'travelers/stitch-up-girl',
  },
  2: {
    name: 'Mr. Bones',
    sprite: '/assets/market-svg/mr-bones/shop-01.svg',
    greeting: 'Death and taxes. I handle both.',
    wikiSlug: 'wanderers/mr-bones',
  },
  3: {
    name: 'X-treme',
    sprite: '/assets/market-svg/xtreme/shop-01.svg',
    greeting: 'EXTREME deals! Roll the dice!',
    wikiSlug: 'wanderers/xtreme',
  },
  4: {
    name: 'The General',
    sprite: '/assets/market-svg/the-general/shop-01.svg',
    greeting: 'Military precision. Fair prices.',
    wikiSlug: 'wanderers/the-general',
  },
  5: {
    name: 'Dr. Voss',
    sprite: '/assets/market-svg/dr-voss/shop-01.svg',
    greeting: 'Reality is negotiable. So are prices.',
    wikiSlug: 'wanderers/dr-voss',
  },
  6: {
    name: 'Willy One Eye',
    sprite: '/assets/market-svg/willy/shop-01.svg',
    greeting: 'One eye sees more than two ever could.',
    wikiSlug: 'wanderers/willy',
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

// Base prices by rarity (balanced against ~50-100g per room)
const BASE_PRICE_BY_RARITY: Record<Rarity, number> = {
  Common: 75,
  Uncommon: 150,
  Rare: 300,
  Epic: 500,
  Legendary: 800,
  Unique: 1200,
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
        <Typography key={i} variant="body2" sx={{ fontSize: '0.75rem' }}>
          {line}
        </Typography>
      ))}
    </Box>
  );
}


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
  calmBonus?: number; // Reroll cost reduction
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
  calmBonus = 0,
  luckySynergy = 'none',
}: ShopProps) {
  // Calculate reroll cost with calm reduction (base 25g from balance-config)
  const rerollCost = applyRerollCalmReduction(SHOP_PRICING.baseRerollCost, calmBonus);

  const [purchasedItems, setPurchasedItems] = useState<string[]>([]);
  const [purchasingItem, setPurchasingItem] = useState<string | null>(null);

  // "Can't afford" feedback state
  const [showBrokeMessage, setShowBrokeMessage] = useState(false);
  const [brokeShake, setBrokeShake] = useState(false);

  // Vendor sprite animation
  const vendor = DOMAIN_VENDORS[domainId] || DOMAIN_VENDORS[1];
  const [spriteFrame, setSpriteFrame] = useState(1);
  const [showVendor, setShowVendor] = useState(false);

  // Staggered entrance for shop items (3 items + 1 reroll = 4 slots)
  const { getItemStyle } = useStaggeredEntrance({
    itemCount: 4,
    delayPerItem: 80,
    initialDelay: 300, // After vendor slides in
  });

  // Animate vendor on mount
  useEffect(() => {
    const timer = setTimeout(() => setShowVendor(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Sprite twitch animation
  useEffect(() => {
    if (!vendor.sprite2) return;
    const interval = setInterval(() => {
      setSpriteFrame(2);
      setTimeout(() => setSpriteFrame(1), 150);
    }, 2500 + Math.random() * 1500);
    return () => clearInterval(interval);
  }, [vendor.sprite2]);


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
          count: 3, // 3 items + reroll slot
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

  // Trigger "can't afford" feedback
  const triggerBrokeFeedback = useCallback(() => {
    setShowBrokeMessage(true);
    setBrokeShake(true);
    setTimeout(() => setBrokeShake(false), 500);
  }, []);

  // Handle purchase click - purchase directly without confirmation
  const handlePurchaseWikiItem = (item: Item) => {
    if (purchasedItems.includes(item.slug) || purchasingItem) return;

    const cost = calculateItemCost(item, tier, favorTokens);
    if (gold < cost) {
      // Can't afford - show feedback
      triggerBrokeFeedback();
      return;
    }

    executePurchase(item);
  };


  // Reroll state
  const [rerollCount, setRerollCount] = useState(0);
  const [rerollSeed, setRerollSeed] = useState(threadId || '');

  // Handle reroll - generates new items
  const handleReroll = useCallback(() => {
    if (gold >= rerollCost) {
      onPurchase(rerollCost, 'reroll', 'powerup');
      setRerollCount((prev) => prev + 1);
      setRerollSeed(`${threadId}-reroll-${rerollCount + 1}`);
    } else {
      // Can't afford reroll
      triggerBrokeFeedback();
    }
  }, [gold, rerollCost, threadId, rerollCount, onPurchase, triggerBrokeFeedback]);

  // Generate items with reroll seed
  const displayItems = useMemo(() => {
    if (!threadId) return wikiItems;
    if (rerollCount === 0) return wikiItems;
    try {
      const rng = createSeededRng(rerollSeed);
      const domainSlug = `domain-${domainId}`;
      return getRequisitionPool(
        {
          tier,
          domain: domainSlug,
          count: 3,
          includeOverride: isAuditPrep,
        },
        rng,
        luckySynergy
      );
    } catch {
      return wikiItems;
    }
  }, [threadId, rerollCount, rerollSeed, domainId, tier, isAuditPrep, luckySynergy, wikiItems]);

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
      {/* Headline - Vendor/Event Name */}
      <Typography
        component="h1"
        sx={{
          ...gamingFont,
          fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
          fontWeight: 800,
          color: tokens.colors.text.primary,
          textAlign: 'center',
          mb: 3,
        }}
      >
        {vendor.name}
      </Typography>

      {/* Vendor sprite + speech bubble */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 4 }}>
        {/* Vendor Sprite */}
        <Box
          sx={{
            opacity: showVendor ? 1 : 0,
            animation: showVendor ? `${slideIn} 400ms ease-out` : 'none',
            flexShrink: 0,
          }}
        >
          <Box
            component="img"
            src={spriteFrame === 2 && vendor.sprite2 ? vendor.sprite2 : vendor.sprite}
            alt={vendor.name}
            sx={{
              width: { xs: 80, sm: 100 },
              height: 'auto',
              maxHeight: 120,
              objectFit: 'contain',
              imageRendering: 'pixelated',
            }}
          />
          <Typography
            sx={{
              ...gamingFont,
              fontSize: '0.7rem',
              color: tokens.colors.text.disabled,
              textAlign: 'center',
              mt: 0.5,
            }}
          >
            {vendor.name}
          </Typography>
        </Box>

        {/* Speech bubble - no pointer triangle */}
        <Box
          sx={{
            bgcolor: tokens.colors.background.paper,
            border: `2px solid ${tokens.colors.border}`,
            borderRadius: '12px',
            px: 4,
            py: 2.5,
            maxWidth: 400,
          }}
        >
          <Typography
            sx={{
              ...gamingFont,
              fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.5rem' },
              color: tokens.colors.text.primary,
              lineHeight: 1.5,
            }}
          >
            {vendor.greeting}
          </Typography>
        </Box>
      </Box>

      {/* Items Container */}
      <Box
        sx={{
          bgcolor: 'rgba(0,0,0,0.3)',
          border: `1px solid ${tokens.colors.border}`,
          borderRadius: 2,
          p: { xs: 2, sm: 3 },
          mb: 4,
        }}
      >
        {/* Items Row - simplified: price, big sprite, name, rarity tag */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            gap: { xs: 2, sm: 3, md: 4 },
            justifyContent: 'center',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            width: '100%',
            maxWidth: 1000,
          }}
        >
        {/* Display first 3 items - staggered entrance with enhanced hover */}
        {displayItems.slice(0, 3).map((item, index) => {
          const isPurchased = purchasedItems.includes(item.slug);
          const isPurchasing = purchasingItem === item.slug;
          const cost = calculateItemCost(item, tier, favorTokens);
          const canAfford = gold >= cost;
          const rarityColor = RARITY_COLORS[item.rarity || 'Common'];
          const staggerStyle = getItemStyle(index);
          const tooltipContent = getItemTooltipContent(item);

          return (
            <Tooltip
              key={item.slug}
              title={tooltipContent || ''}
              placement="top"
              arrow
              disableHoverListener={!tooltipContent}
            >
              <Box
                onClick={() => handlePurchaseWikiItem(item)}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: isPurchased ? 'default' : 'pointer',
                  minWidth: { xs: 100, sm: 120, md: 140 },
                  // Staggered entrance animation
                  opacity: isPurchased ? 0.5 : staggerStyle.opacity,
                  transform: staggerStyle.transform,
                  transition: staggerStyle.transition,
                  // Balatro-style hover with glow
                  '&:hover': isPurchased ? {} : {
                    transform: 'scale(1.05) translateY(-4px)',
                    filter: `drop-shadow(${GLOW.normal(rarityColor)})`,
                  },
                }}
              >
                {/* Price */}
                <Typography
                  sx={{
                    ...gamingFont,
                    fontSize: { xs: '1.1rem', sm: '1.35rem' },
                    color: isPurchased ? tokens.colors.success : canAfford ? tokens.colors.warning : tokens.colors.error,
                    mb: 1,
                  }}
                >
                  {isPurchased ? (
                    <CheckIcon sx={{ fontSize: 24 }} />
                  ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Box component="img" src="/assets/ui/currency-svg/coin.svg" alt="" sx={{ width: 18, height: 18 }} />
                      {cost}
                    </Box>
                  )}
                </Typography>

                {/* Big Item Sprite */}
                <Box
                  sx={{
                    width: { xs: 80, sm: 100, md: 120 },
                    height: { xs: 80, sm: 100, md: 120 },
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 1.5,
                  }}
                >
                  <Box
                    component="img"
                    src={item.image || '/assets/items/placeholder.png'}
                    alt=""
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      imageRendering: 'pixelated',
                      filter: isPurchased ? 'grayscale(50%)' : 'none',
                    }}
                    onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                      e.currentTarget.src = '/assets/items/placeholder.png';
                    }}
                  />
                </Box>

                {/* Item Name */}
                <Typography
                  sx={{
                    ...gamingFont,
                    fontSize: { xs: '0.8rem', sm: '0.9rem' },
                    color: tokens.colors.text.primary,
                    textAlign: 'center',
                    mb: 1,
                    maxWidth: 140,
                    lineHeight: 1.2,
                  }}
                >
                  {item.name}
                </Typography>

                {/* Rarity Tag */}
                <Chip
                  label={item.rarity || 'Common'}
                  size="small"
                  sx={{
                    height: 24,
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    bgcolor: `${rarityColor}20`,
                    color: rarityColor,
                    border: `1px solid ${rarityColor}50`,
                    '& .MuiChip-label': { px: 1.5 },
                  }}
                />
              </Box>
            </Tooltip>
          );
        })}

        {/* Reroll Requisition slot - staggered as 4th item */}
        <Box
          onClick={handleReroll}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            cursor: 'pointer',
            minWidth: { xs: 100, sm: 120, md: 140 },
            // Staggered entrance (index 3)
            ...getItemStyle(3),
            opacity: gold >= rerollCost ? getItemStyle(3).opacity : 0.6 * getItemStyle(3).opacity,
            // Balatro-style hover
            '&:hover': {
              transform: 'scale(1.05) translateY(-4px)',
              filter: `drop-shadow(${GLOW.subtle(tokens.colors.text.secondary)})`,
            },
          }}
        >
          {/* Price */}
          <Typography
            sx={{
              ...gamingFont,
              fontSize: { xs: '1.1rem', sm: '1.35rem' },
              color: gold >= rerollCost ? tokens.colors.warning : tokens.colors.text.disabled,
              mb: 1,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box component="img" src="/assets/ui/currency-svg/coin.svg" alt="" sx={{ width: 18, height: 18 }} />
              {rerollCost}
            </Box>
          </Typography>

          {/* Reroll text area - no icon */}
          <Box
            sx={{
              width: { xs: 80, sm: 100, md: 120 },
              height: { xs: 80, sm: 100, md: 120 },
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              border: `2px dashed ${tokens.colors.border}`,
              borderRadius: 2,
              mb: 1.5,
            }}
          >
            <Typography
              sx={{
                ...gamingFont,
                fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' },
                color: tokens.colors.text.secondary,
                textAlign: 'center',
                lineHeight: 1.3,
              }}
            >
              reroll
              <br />
              requisition
            </Typography>
          </Box>

          {/* Empty space for alignment with item names + tags */}
          <Box sx={{ height: { xs: 44, sm: 48 } }} />
        </Box>
        </Box>
      </Box>

      {/* Empty state */}
      {useWikiItems && displayItems.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography sx={{ ...gamingFont, fontSize: '1rem', color: tokens.colors.text.disabled }}>
            {getEmptyPoolMessage('requisition')}
          </Typography>
        </Box>
      )}

      {/* Next Event button - Balatro-style */}
      <Button
        variant="contained"
        onClick={onContinue}
        endIcon={<ContinueIcon sx={{ color: tokens.colors.background.default }} />}
        sx={{
          bgcolor: tokens.colors.success,
          color: tokens.colors.background.default,
          ...gamingFont,
          fontSize: { xs: '1rem', sm: '1.25rem' },
          fontWeight: 700,
          px: { xs: 4, sm: 6 },
          py: 1.5,
          transition: `all ${DURATION.fast}ms ${EASING.organic}`,
          boxShadow: `0 4px 16px ${tokens.colors.success}66`,
          '&:hover': {
            transform: 'scale(1.03) translateY(-2px)',
            boxShadow: GLOW.normal(tokens.colors.success),
          },
          '&:active': {
            transform: 'scale(0.97) translateY(2px)',
            transition: 'all 50ms ease-out',
          },
        }}
      >
        Next Event
      </Button>

      {/* "Not enough gold" snackbar */}
      <Snackbar
        open={showBrokeMessage}
        autoHideDuration={2000}
        onClose={() => setShowBrokeMessage(false)}
        message={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography sx={{ ...gamingFont, fontSize: '0.9rem' }}>
              Not enough gold!
            </Typography>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                animation: brokeShake ? `${shake} 0.5s ease` : 'none',
              }}
            >
              <Box component="img" src="/assets/ui/currency-svg/coin.svg" alt="" sx={{ width: 16, height: 16 }} />
              <Typography sx={{ ...gamingFont, fontSize: '1rem', color: tokens.colors.warning }}>
                {gold}
              </Typography>
            </Box>
          </Box>
        }
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{
          '& .MuiSnackbarContent-root': {
            bgcolor: tokens.colors.background.elevated,
            border: `1px solid ${tokens.colors.error}50`,
          },
        }}
      />
    </Box>
  );
}
