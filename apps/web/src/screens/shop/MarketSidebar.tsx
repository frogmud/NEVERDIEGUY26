/**
 * Market Sidebar - Item details and purchase flow for the Market
 *
 * Opens when clicking an item, shows wiki data and triggers NPC purchase dialogue.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Drawer,
  Typography,
  IconButton,
  Button,
  Chip,
  Divider,
  Avatar,
} from '@mui/material';
import {
  CloseSharp as CloseIcon,
  StorefrontSharp as ShopIcon,
  InfoOutlined as InfoIcon,
  ShoppingBagSharp as BagIcon,
  ChatSharp as ChatIcon,
  CheckCircleSharp as CheckIcon,
} from '@mui/icons-material';
import { tokens, RARITY_COLORS } from '../../theme';
import { PurchaseChatDialog } from './PurchaseChatDialog';
import type { Item, Shop, InventoryItem } from '../../data/wiki/types';

interface SelectedItem {
  item: Item;
  shop: Shop;
  inventoryEntry: InventoryItem;
}

interface PurchasedItem {
  item: Item;
  shop: Shop;
  pricePaid: number;
  timestamp: number;
}

interface MarketSidebarProps {
  open: boolean;
  onClose: () => void;
  selectedItem: SelectedItem | null;
}

export function MarketSidebar({ open, onClose, selectedItem }: MarketSidebarProps) {
  const navigate = useNavigate();
  const [purchaseChatOpen, setPurchaseChatOpen] = useState(false);
  const [purchasedItems, setPurchasedItems] = useState<PurchasedItem[]>([]);

  const handlePurchaseClick = () => {
    if (selectedItem) {
      setPurchaseChatOpen(true);
    }
  };

  const handlePurchaseComplete = (success: boolean, finalPrice: number) => {
    if (success && selectedItem) {
      // Add to purchased items
      setPurchasedItems((prev) => [
        {
          item: selectedItem.item,
          shop: selectedItem.shop,
          pricePaid: finalPrice,
          timestamp: Date.now(),
        },
        ...prev,
      ]);
    }
  };

  const handleClosePurchaseChat = () => {
    setPurchaseChatOpen(false);
  };

  // Calculate total spent this session
  const totalSpent = purchasedItems.reduce((sum, p) => sum + p.pricePaid, 0);

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: {
            width: 400,
            bgcolor: tokens.colors.background.paper,
            borderLeft: `1px solid ${tokens.colors.border}`,
          },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 2,
            borderBottom: `1px solid ${tokens.colors.border}`,
          }}
        >
          <Typography sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
            Market
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          {/* Selected Item Details */}
          {selectedItem && (
            <Box sx={{ p: 3, bgcolor: tokens.colors.background.default }}>
              {/* Item Image */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  mb: 2,
                }}
              >
                <Box
                  component="img"
                  src={
                    selectedItem.item.image ||
                    `/assets/items/${selectedItem.item.itemType?.toLowerCase() || 'misc'}/${selectedItem.item.slug}.png`
                  }
                  alt={selectedItem.item.name}
                  sx={{
                    width: 96,
                    height: 96,
                    imageRendering: 'pixelated',
                    objectFit: 'contain',
                  }}
                />
              </Box>

              {/* Item Name & Rarity */}
              <Typography
                sx={{
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  textAlign: 'center',
                  mb: 1,
                }}
              >
                {selectedItem.item.name}
              </Typography>

              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 2 }}>
                <Chip
                  label={selectedItem.item.rarity}
                  size="small"
                  sx={{
                    bgcolor: `${RARITY_COLORS[selectedItem.item.rarity as keyof typeof RARITY_COLORS] || tokens.colors.text.primary}25`,
                    color: RARITY_COLORS[selectedItem.item.rarity as keyof typeof RARITY_COLORS] || tokens.colors.text.primary,
                  }}
                />
                {selectedItem.item.itemType && (
                  <Chip
                    label={selectedItem.item.itemType}
                    size="small"
                    sx={{
                      bgcolor: tokens.colors.background.elevated,
                      color: tokens.colors.text.secondary,
                    }}
                  />
                )}
              </Box>

              {/* Description */}
              {selectedItem.item.description && (
                <Typography
                  sx={{
                    fontSize: '0.875rem',
                    color: tokens.colors.text.secondary,
                    textAlign: 'center',
                    mb: 2,
                    lineHeight: 1.5,
                  }}
                >
                  {selectedItem.item.description}
                </Typography>
              )}

              {/* Vendor */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1,
                  mb: 3,
                }}
              >
                <Avatar
                  src={selectedItem.shop.portrait}
                  sx={{ width: 24, height: 24 }}
                />
                <Typography sx={{ fontSize: '0.8rem', color: tokens.colors.text.secondary }}>
                  Sold by {selectedItem.shop.name}
                </Typography>
              </Box>

              {/* Price & Purchase */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  p: 2,
                  bgcolor: tokens.colors.background.paper,
                  borderRadius: '16px',
                  boxShadow: '0px 3px 1px 0px rgba(0,0,0,0.5)',
                }}
              >
                <Typography
                  sx={{
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    color: tokens.colors.warning,
                    fontFamily: tokens.fonts.gaming,
                    flex: 1,
                  }}
                >
                  {typeof selectedItem.inventoryEntry.price === 'number'
                    ? `${selectedItem.inventoryEntry.price}g`
                    : selectedItem.inventoryEntry.price}
                </Typography>
                <Button
                  variant="contained"
                  onClick={handlePurchaseClick}
                  startIcon={<ChatIcon />}
                  sx={{
                    bgcolor: tokens.colors.secondary,
                    color: '#000',
                    fontWeight: 600,
                    borderRadius: '12px',
                    px: 3,
                    '&:hover': {
                      bgcolor: tokens.colors.secondary,
                      opacity: 0.9,
                    },
                  }}
                >
                  Purchase
                </Button>
              </Box>

              {/* Wiki Link */}
              <Button
                variant="text"
                size="small"
                startIcon={<InfoIcon />}
                onClick={() => navigate(`/wiki/items/${selectedItem.item.slug}`)}
                sx={{
                  mt: 2,
                  color: tokens.colors.text.secondary,
                  '&:hover': { color: tokens.colors.secondary },
                }}
              >
                View full wiki page
              </Button>
            </Box>
          )}

          {/* Purchased Items Section */}
          <Divider sx={{ borderColor: tokens.colors.border }} />

          <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <BagIcon sx={{ fontSize: 20, color: tokens.colors.text.secondary }} />
              <Typography sx={{ fontWeight: 600 }}>
                Purchases ({purchasedItems.length})
              </Typography>
            </Box>

            {purchasedItems.length === 0 ? (
              <Typography
                sx={{
                  color: tokens.colors.text.disabled,
                  fontSize: '0.875rem',
                  textAlign: 'center',
                  py: 4,
                }}
              >
                No purchases yet
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {purchasedItems.map((purchase, index) => (
                  <PurchasedItemRow key={`${purchase.item.slug}-${index}`} purchase={purchase} />
                ))}
              </Box>
            )}
          </Box>
        </Box>

        {/* Footer - Total Spent */}
        {purchasedItems.length > 0 && (
          <Box
            sx={{
              p: 2,
              borderTop: `1px solid ${tokens.colors.border}`,
              bgcolor: tokens.colors.background.elevated,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Typography sx={{ color: tokens.colors.text.secondary }}>
                Total Spent
              </Typography>
              <Typography
                sx={{
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: tokens.colors.warning,
                  fontFamily: tokens.fonts.gaming,
                }}
              >
                {totalSpent}g
              </Typography>
            </Box>
          </Box>
        )}
      </Drawer>

      {/* Purchase Chat Dialog */}
      {selectedItem && (
        <PurchaseChatDialog
          open={purchaseChatOpen}
          onClose={handleClosePurchaseChat}
          item={selectedItem.item}
          shop={selectedItem.shop}
          inventoryEntry={selectedItem.inventoryEntry}
          onPurchaseComplete={handlePurchaseComplete}
        />
      )}
    </>
  );
}

// Purchased item row component
function PurchasedItemRow({ purchase }: { purchase: PurchasedItem }) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        p: 1.5,
        bgcolor: tokens.colors.background.paper,
        borderRadius: '12px',
      }}
    >
      {/* Success icon */}
      <CheckIcon sx={{ fontSize: 18, color: tokens.colors.success }} />

      {/* Image */}
      <Box
        component="img"
        src={
          purchase.item.image ||
          `/assets/items/${purchase.item.itemType?.toLowerCase() || 'misc'}/${purchase.item.slug}.png`
        }
        alt={purchase.item.name}
        sx={{
          width: 36,
          height: 36,
          imageRendering: 'pixelated',
          objectFit: 'contain',
        }}
      />

      {/* Name & Shop */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          sx={{
            fontSize: '0.85rem',
            fontWeight: 600,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {purchase.item.name}
        </Typography>
        <Typography sx={{ fontSize: '0.7rem', color: tokens.colors.text.disabled }}>
          from {purchase.shop.name}
        </Typography>
      </Box>

      {/* Price paid */}
      <Typography
        sx={{
          fontWeight: 600,
          color: purchase.pricePaid === 0 ? tokens.colors.success : tokens.colors.warning,
          fontFamily: tokens.fonts.gaming,
          fontSize: '0.9rem',
        }}
      >
        {purchase.pricePaid === 0 ? 'FREE' : `${purchase.pricePaid}g`}
      </Typography>
    </Box>
  );
}
