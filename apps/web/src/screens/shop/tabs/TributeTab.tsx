/**
 * TributeTab - King James tribute area
 * Simplified 3-click flow: Select item -> Confirm -> Done
 */

import { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  Tooltip,
} from '@mui/material';
import { tokens, RARITY_COLORS } from '../../../theme';
import { items } from '../../../data/wiki/entities/items';
import type { Item } from '../../../data/wiki/types';

// King James config - using pantheon sprites
const KING_JAMES = {
  name: 'King James',
  title: 'The Undying',
  // Static sprite for idle, animated frames for tribute (1 and 2 only - skip side-facing)
  staticSprite: '/assets/characters/pantheon/sprite-king-james-1.png',
  animatedSprites: [
    '/assets/characters/pantheon/sprite-king-james-1.png',
    '/assets/characters/pantheon/sprite-king-james-2.png',
  ],
};

// Giftable item types
const GIFTABLE_TYPES = ['Consumable', 'Material', 'Artifact', 'Accessory', 'Gem', 'Crystal'];

function getGiftableItems(): Item[] {
  return items.filter((item) => {
    // Must have an image
    if (!item.image) return false;
    // Filter by type or rarity
    if (item.itemType && GIFTABLE_TYPES.includes(item.itemType)) return true;
    if (['Epic', 'Legendary', 'Unique'].includes(item.rarity || '')) return true;
    return false;
  }).slice(0, 12); // Limit to 12 items for 6x2 grid
}

export function TributeTab() {
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [lastTribute, setLastTribute] = useState<Item | null>(null);
  const [frameIndex, setFrameIndex] = useState(0);

  const giftableItems = useMemo(() => getGiftableItems(), []);

  // Only animate during tribute
  useEffect(() => {
    if (!isAnimating) {
      setFrameIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setFrameIndex((prev) => (prev + 1) % KING_JAMES.animatedSprites.length);
    }, 150);
    return () => clearInterval(interval);
  }, [isAnimating]);

  // Handle tribute confirmation
  const handleConfirmTribute = () => {
    if (!selectedItem) return;

    // Trigger animation
    setIsAnimating(true);
    setLastTribute(selectedItem);
    setSelectedItem(null);

    // Reset animation after delay
    setTimeout(() => {
      setIsAnimating(false);
    }, 1500);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        py: 4,
        px: 3,
        minHeight: 600,
      }}
    >
      {/* King James Sprite with animation state */}
      <Box
        sx={{
          position: 'relative',
          mb: 2,
          height: 320, // Fixed height for consistent bottom alignment
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          transform: isAnimating ? 'scale(1.05)' : 'scale(1)',
          transition: 'transform 0.3s ease-out',
        }}
      >
        {/* Glow effect during animation */}
        {isAnimating && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 280,
              height: 280,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${tokens.colors.warning}40 0%, transparent 70%)`,
              animation: 'pulse 0.5s ease-in-out infinite',
              '@keyframes pulse': {
                '0%, 100%': { opacity: 0.6 },
                '50%': { opacity: 1 },
              },
            }}
          />
        )}
        <Box
          component="img"
          src={isAnimating ? KING_JAMES.animatedSprites[frameIndex] : KING_JAMES.staticSprite}
          alt="King James"
          sx={{
            width: isAnimating ? 280 : 260,
            height: 'auto',
            maxHeight: 320,
            imageRendering: 'pixelated',
            objectFit: 'contain',
          }}
        />
      </Box>

      {/* Name */}
      <Typography
        sx={{
          fontSize: '1.5rem',
          fontWeight: 600,
          color: tokens.colors.text.primary,
          mb: 0.5,
        }}
      >
        {KING_JAMES.name}
      </Typography>
      <Typography
        sx={{
          fontSize: '0.875rem',
          color: tokens.colors.text.disabled,
          mb: 3,
          fontStyle: 'italic',
        }}
      >
        {KING_JAMES.title}
      </Typography>

      {/* Inline Item Picker */}
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 420,
          bgcolor: tokens.colors.background.paper,
          borderRadius: '16px',
          p: 2,
          mb: 2,
        }}
      >
        <Typography
          sx={{
            fontSize: '0.8rem',
            fontWeight: 600,
            mb: 1.5,
            color: tokens.colors.text.secondary,
          }}
        >
          Select an offering
        </Typography>

        {/* Item Grid - 6 columns, compact */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(6, 1fr)',
            gap: 1,
          }}
        >
          {giftableItems.map((item) => {
            const isSelected = selectedItem?.slug === item.slug;
            const rarityColor = RARITY_COLORS[item.rarity as keyof typeof RARITY_COLORS] || tokens.colors.text.secondary;

            return (
              <Tooltip key={item.slug} title={item.name} arrow placement="top">
                <Box
                  onClick={() => setSelectedItem(isSelected ? null : item)}
                  sx={{
                    p: 0.75,
                    borderRadius: '8px',
                    bgcolor: isSelected ? `${rarityColor}20` : tokens.colors.background.elevated,
                    border: isSelected ? `2px solid ${rarityColor}` : `1px solid ${tokens.colors.border}`,
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.15s',
                    '&:hover': {
                      bgcolor: `${rarityColor}15`,
                      transform: 'scale(1.05)',
                    },
                  }}
                >
                  {/* Item icon from image field */}
                  {item.image ? (
                    <Box
                      component="img"
                      src={item.image}
                      alt={item.name}
                      sx={{
                        width: 28,
                        height: 28,
                        objectFit: 'contain',
                        mx: 'auto',
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        width: 28,
                        height: 28,
                        mx: 'auto',
                        borderRadius: '6px',
                        bgcolor: `${rarityColor}30`,
                      }}
                    />
                  )}
                </Box>
              </Tooltip>
            );
          })}
        </Box>
      </Paper>

      {/* Confirm Button - Step 2 */}
      <Button
        variant="contained"
        disabled={!selectedItem || isAnimating}
        onClick={handleConfirmTribute}
        sx={{
          px: 4,
          py: 1.5,
          borderRadius: '30px',
          bgcolor: selectedItem ? tokens.colors.primary : tokens.colors.background.elevated,
          color: selectedItem ? '#fff' : tokens.colors.text.disabled,
          fontFamily: tokens.fonts.gaming,
          fontSize: '1.1rem',
          textTransform: 'none',
          '&:hover': {
            bgcolor: selectedItem ? tokens.colors.primary : tokens.colors.background.elevated,
          },
          '&:disabled': {
            bgcolor: tokens.colors.background.elevated,
            color: tokens.colors.text.disabled,
          },
        }}
      >
        {isAnimating ? 'Offering...' : selectedItem ? `Offer ${selectedItem.name}` : 'Select an item'}
      </Button>

      {/* Last tribute confirmation */}
      {lastTribute && !isAnimating && (
        <Chip
          label={`Last tribute: ${lastTribute.name}`}
          size="small"
          sx={{
            mt: 2,
            bgcolor: `${tokens.colors.success}20`,
            color: tokens.colors.success,
          }}
        />
      )}
    </Box>
  );
}
