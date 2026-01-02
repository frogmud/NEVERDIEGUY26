/**
 * Gift Modal
 *
 * Modal for gifting items to NPCs.
 * Shows player's giftable items and handles the gift flow.
 */

import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  IconButton,
  TextField,
  InputAdornment,
  List,
  ListItemButton,
  Chip,
  Button,
  Avatar,
  Divider,
} from '@mui/material';
import {
  CloseSharp as CloseIcon,
  SearchSharp as SearchIcon,
  CardGiftcardSharp as GiftIcon,
  CheckCircleSharp as CheckIcon,
} from '@mui/icons-material';
import { tokens, RARITY_COLORS } from '../../theme';
import { items } from '../../data/wiki/entities/items';
import type { Item } from '../../data/wiki/types';

// ============================================
// Types
// ============================================

interface GiftModalProps {
  open: boolean;
  onClose: () => void;
  recipientSlug: string;
  recipientName: string;
  recipientAvatar?: string;
  onGift: (item: Item) => void;
}

// ============================================
// Giftable Items Filter
// ============================================

// Items that make sense as gifts - exclude weapons and quest items
const GIFTABLE_TYPES = ['Consumable', 'Material', 'Artifact', 'Accessory', 'Gem', 'Crystal'];

function getGiftableItems(): Item[] {
  return items.filter((item) => {
    // Include consumables, materials, artifacts, and accessories
    if (item.itemType && GIFTABLE_TYPES.includes(item.itemType)) {
      return true;
    }
    // Include items that are rare/valuable
    // (removed tags check as Item type doesn't have tags)
    // Include rarer items as potential gifts
    if (['Epic', 'Legendary', 'Unique'].includes(item.rarity || '')) {
      return true;
    }
    return false;
  });
}

// ============================================
// Component
// ============================================

export function GiftModal({
  open,
  onClose,
  recipientSlug,
  recipientName,
  recipientAvatar,
  onGift,
}: GiftModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Get giftable items
  const giftableItems = useMemo(() => getGiftableItems(), []);

  // Filter by search
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return giftableItems.slice(0, 50); // Limit initial display
    const query = searchQuery.toLowerCase();
    return giftableItems.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.itemType?.toLowerCase().includes(query) ||
        item.rarity?.toLowerCase().includes(query)
    );
  }, [giftableItems, searchQuery]);

  // Handle item selection
  const handleSelectItem = (item: Item) => {
    setSelectedItem(item);
    setShowConfirmation(true);
  };

  // Handle gift confirmation
  const handleConfirmGift = () => {
    if (selectedItem) {
      onGift(selectedItem);
      handleClose();
    }
  };

  // Handle close
  const handleClose = () => {
    setSearchQuery('');
    setSelectedItem(null);
    setShowConfirmation(false);
    onClose();
  };

  // Cancel confirmation
  const handleCancelConfirmation = () => {
    setSelectedItem(null);
    setShowConfirmation(false);
  };

  // Get item image path
  const getItemImage = (item: Item) => {
    if (item.image) return item.image;
    const category = item.itemType?.toLowerCase() || 'misc';
    return `/assets/items/${category}/${item.slug}.png`;
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: tokens.colors.background.paper,
          borderRadius: '24px',
          maxHeight: '80vh',
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          borderBottom: `1px solid ${tokens.colors.border}`,
          pb: 2,
        }}
      >
        <GiftIcon sx={{ color: tokens.colors.success }} />
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
            Gift to {recipientName}
          </Typography>
          <Typography sx={{ fontSize: '0.8rem', color: tokens.colors.text.secondary }}>
            Select an item to give
          </Typography>
        </Box>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {/* Confirmation View */}
        {showConfirmation && selectedItem ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            {/* Recipient */}
            <Box sx={{ mb: 3 }}>
              <Avatar
                src={recipientAvatar}
                sx={{
                  width: 64,
                  height: 64,
                  mx: 'auto',
                  mb: 1,
                  border: `3px solid ${tokens.colors.success}`,
                }}
              />
              <Typography sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                {recipientName}
              </Typography>
            </Box>

            {/* Arrow */}
            <Typography sx={{ fontSize: '1.5rem', my: 1, color: tokens.colors.text.disabled }}>
              receives
            </Typography>

            {/* Item */}
            <Box
              sx={{
                display: 'inline-flex',
                flexDirection: 'column',
                alignItems: 'center',
                p: 2,
                bgcolor: tokens.colors.background.elevated,
                borderRadius: '16px',
                mb: 3,
              }}
            >
              <Box
                component="img"
                src={getItemImage(selectedItem)}
                alt={selectedItem.name}
                sx={{
                  width: 64,
                  height: 64,
                  imageRendering: 'pixelated',
                  objectFit: 'contain',
                  mb: 1,
                }}
              />
              <Typography sx={{ fontWeight: 600 }}>{selectedItem.name}</Typography>
              <Chip
                size="small"
                label={selectedItem.rarity}
                sx={{
                  mt: 0.5,
                  height: 20,
                  fontSize: '0.7rem',
                  bgcolor: `${RARITY_COLORS[selectedItem.rarity as keyof typeof RARITY_COLORS] || tokens.colors.text.primary}25`,
                  color: RARITY_COLORS[selectedItem.rarity as keyof typeof RARITY_COLORS] || tokens.colors.text.primary,
                }}
              />
            </Box>

            {/* Actions */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="outlined"
                onClick={handleCancelConfirmation}
                sx={{
                  borderColor: tokens.colors.border,
                  color: tokens.colors.text.secondary,
                  borderRadius: '12px',
                  px: 3,
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleConfirmGift}
                startIcon={<GiftIcon />}
                sx={{
                  bgcolor: tokens.colors.success,
                  color: '#fff',
                  borderRadius: '12px',
                  px: 3,
                  '&:hover': {
                    bgcolor: tokens.colors.success,
                    opacity: 0.9,
                  },
                }}
              >
                Give Gift
              </Button>
            </Box>
          </Box>
        ) : (
          <>
            {/* Search */}
            <Box sx={{ p: 2, borderBottom: `1px solid ${tokens.colors.border}` }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: tokens.colors.text.disabled }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    '& fieldset': {
                      borderColor: tokens.colors.border,
                    },
                  },
                }}
              />
              <Typography
                sx={{
                  fontSize: '0.75rem',
                  color: tokens.colors.text.disabled,
                  mt: 1,
                }}
              >
                {filteredItems.length} items available to gift
              </Typography>
            </Box>

            {/* Item List */}
            <List
              sx={{
                maxHeight: 400,
                overflow: 'auto',
                py: 0,
              }}
            >
              {filteredItems.map((item) => {
                const rarityColor =
                  RARITY_COLORS[item.rarity as keyof typeof RARITY_COLORS] ||
                  tokens.colors.text.primary;

                return (
                  <ListItemButton
                    key={item.slug}
                    onClick={() => handleSelectItem(item)}
                    sx={{
                      py: 1.5,
                      px: 2,
                      gap: 1.5,
                      borderBottom: `1px solid ${tokens.colors.border}`,
                      '&:hover': {
                        bgcolor: `${tokens.colors.success}10`,
                      },
                    }}
                  >
                    {/* Item Image */}
                    <Box
                      component="img"
                      src={getItemImage(item)}
                      alt={item.name}
                      sx={{
                        width: 40,
                        height: 40,
                        imageRendering: 'pixelated',
                        objectFit: 'contain',
                      }}
                    />

                    {/* Item Info */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        sx={{
                          fontWeight: 600,
                          fontSize: '0.9rem',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {item.name}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.5, mt: 0.25 }}>
                        <Chip
                          size="small"
                          label={item.rarity}
                          sx={{
                            height: 16,
                            fontSize: '0.6rem',
                            bgcolor: `${rarityColor}25`,
                            color: rarityColor,
                          }}
                        />
                        {item.itemType && (
                          <Chip
                            size="small"
                            label={item.itemType}
                            sx={{
                              height: 16,
                              fontSize: '0.6rem',
                              bgcolor: tokens.colors.background.elevated,
                              color: tokens.colors.text.secondary,
                            }}
                          />
                        )}
                      </Box>
                    </Box>

                    {/* Gift Icon */}
                    <GiftIcon
                      sx={{
                        fontSize: 20,
                        color: tokens.colors.success,
                        opacity: 0.5,
                      }}
                    />
                  </ListItemButton>
                );
              })}

              {filteredItems.length === 0 && (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                  <Typography sx={{ color: tokens.colors.text.disabled }}>
                    No items found
                  </Typography>
                </Box>
              )}
            </List>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
