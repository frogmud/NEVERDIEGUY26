import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Button,
  Dialog,
  DialogContent,
  Grow,
  Zoom,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  AutoAwesomeSharp as RareIcon,
  CardGiftcardSharp as ChestIcon,
  ReplaySharp as ReplayIcon,
} from '@mui/icons-material';
import { tokens } from '../../theme';
import { PageHeader } from '../../components/Placeholder';
import { CardSection } from '../../components/CardSection';

// Mock loot pool
const lootPool = [
  { id: '1', name: 'Golden Dice', rarity: 'legendary', type: 'dice' },
  { id: '2', name: 'Shadow Cloak', rarity: 'epic', type: 'cosmetic' },
  { id: '3', name: 'Fire Essence', rarity: 'rare', type: 'material' },
  { id: '4', name: 'Health Potion', rarity: 'common', type: 'consumable' },
  { id: '5', name: 'Lucky Charm', rarity: 'uncommon', type: 'accessory' },
  { id: '6', name: 'Void Crystal', rarity: 'epic', type: 'material' },
  { id: '7', name: 'XP Boost', rarity: 'rare', type: 'consumable' },
  { id: '8', name: 'Meteor Dice', rarity: 'rare', type: 'dice' },
];

const rarityConfig: Record<string, { color: string; label: string; glow: string }> = {
  common: { color: tokens.colors.text.secondary, label: 'Common', glow: '0 0 20px rgba(150,150,150,0.5)' },
  uncommon: { color: tokens.colors.success, label: 'Uncommon', glow: '0 0 30px rgba(34,197,94,0.5)' },
  rare: { color: tokens.colors.secondary, label: 'Rare', glow: '0 0 40px rgba(0,229,255,0.5)' },
  epic: { color: tokens.colors.game.epic, label: 'Epic', glow: '0 0 50px rgba(168,85,247,0.6)' },
  legendary: { color: tokens.colors.warning, label: 'Legendary', glow: '0 0 60px rgba(255,167,38,0.7)' },
};

interface LootRevealProps {
  open: boolean;
  onClose: () => void;
  onCollect: () => void;
  item: typeof lootPool[0] | null;
}

function LootReveal({ open, onClose, onCollect, item }: LootRevealProps) {
  const [revealed, setRevealed] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (open) {
      setRevealed(false);
      setShowDetails(false);
      // Auto reveal after delay
      const timer1 = setTimeout(() => setRevealed(true), 800);
      const timer2 = setTimeout(() => setShowDetails(true), 1200);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [open]);

  if (!item) return null;
  const rarity = rarityConfig[item.rarity];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: 'transparent',
          boxShadow: 'none',
          overflow: 'visible',
        },
      }}
    >
      <DialogContent
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 400,
          py: 4,
        }}
      >
        {/* Chest / Pre-reveal */}
        {!revealed && (
          <Zoom in={!revealed}>
            <Box
              sx={{
                width: 150,
                height: 150,
                borderRadius: 4,
                bgcolor: tokens.colors.background.elevated,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: 'shake 0.5s infinite',
                '@keyframes shake': {
                  '0%, 100%': { transform: 'rotate(-3deg)' },
                  '50%': { transform: 'rotate(3deg)' },
                },
              }}
            >
              <ChestIcon sx={{ fontSize: 80, color: tokens.colors.warning }} />
            </Box>
          </Zoom>
        )}

        {/* Revealed Item */}
        {revealed && (
          <Grow in={revealed}>
            <Box sx={{ textAlign: 'center' }}>
              {/* Item glow effect */}
              <Box
                sx={{
                  width: 140,
                  height: 140,
                  borderRadius: '50%',
                  bgcolor: `${rarity.color}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 3,
                  boxShadow: rarity.glow,
                  border: `3px solid ${rarity.color}`,
                  animation: 'pulse 2s infinite',
                  '@keyframes pulse': {
                    '0%, 100%': { transform: 'scale(1)' },
                    '50%': { transform: 'scale(1.05)' },
                  },
                }}
              >
                <RareIcon sx={{ fontSize: 64, color: rarity.color }} />
              </Box>

              {/* Rarity banner */}
              <Zoom in={showDetails} style={{ transitionDelay: '200ms' }}>
                <Box
                  sx={{
                    display: 'inline-block',
                    px: 3,
                    py: 0.5,
                    mb: 2,
                    borderRadius: 1,
                    bgcolor: rarity.color,
                    color: '#000',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    fontSize: '0.75rem',
                    letterSpacing: '0.1em',
                  }}
                >
                  {rarity.label}
                </Box>
              </Zoom>

              {/* Item name */}
              <Zoom in={showDetails} style={{ transitionDelay: '400ms' }}>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 800,
                    color: '#fff',
                    textShadow: `0 0 20px ${rarity.color}`,
                    mb: 1,
                  }}
                >
                  {item.name}
                </Typography>
              </Zoom>

              {/* Item type */}
              <Zoom in={showDetails} style={{ transitionDelay: '600ms' }}>
                <Typography
                  variant="body1"
                  sx={{ color: tokens.colors.text.secondary, mb: 4 }}
                >
                  {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                </Typography>
              </Zoom>

              {/* Action button */}
              <Zoom in={showDetails} style={{ transitionDelay: '800ms' }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={onCollect}
                  sx={{ minWidth: 160 }}
                >
                  Collect
                </Button>
              </Zoom>
            </Box>
          </Grow>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function LootDrop() {
  const [showLoot, setShowLoot] = useState(false);
  const [currentItem, setCurrentItem] = useState<typeof lootPool[0] | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [collectedItem, setCollectedItem] = useState<typeof lootPool[0] | null>(null);

  const handleCollect = () => {
    setCollectedItem(currentItem);
    setShowLoot(false);
    setShowNotification(true);
  };

  const openLoot = (rarity?: string) => {
    let pool = lootPool;
    if (rarity) {
      pool = lootPool.filter((i) => i.rarity === rarity);
    }
    const randomItem = pool[Math.floor(Math.random() * pool.length)];
    setCurrentItem(randomItem);
    setShowLoot(true);
  };

  return (
    <Container maxWidth="md" sx={{ py: 2 }}>
      <PageHeader
        title="Loot Drops"
        subtitle="Reward reveal animations"
      />

      {/* Demo Triggers */}
      <CardSection padding={3} sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ mb: 2 }}>
          Click to open a loot drop:
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            startIcon={<ChestIcon />}
            onClick={() => openLoot()}
          >
            Random Loot
          </Button>
          {Object.entries(rarityConfig).map(([key, config]) => (
            <Button
              key={key}
              variant="outlined"
              onClick={() => openLoot(key)}
              sx={{
                borderColor: config.color,
                color: config.color,
                '&:hover': {
                  borderColor: config.color,
                  bgcolor: `${config.color}10`,
                },
              }}
            >
              {config.label}
            </Button>
          ))}
        </Box>
      </CardSection>

      {/* Animation Phases */}
      <CardSection padding={3}>
        <Typography variant="subtitle2" sx={{ mb: 2 }}>
          Loot Drop Animation Phases:
        </Typography>
        <Box component="ol" sx={{ m: 0, pl: 3, color: tokens.colors.text.secondary }}>
          <li>Chest shaking animation (anticipation)</li>
          <li>Zoom out chest, zoom in item</li>
          <li>Rarity glow effect based on item tier</li>
          <li>Staggered reveal: rarity banner, name, type</li>
          <li>Pulsing glow on revealed item</li>
          <li>Collect button appears last</li>
        </Box>
      </CardSection>

      {/* Loot Reveal Dialog */}
      <LootReveal
        open={showLoot}
        onClose={() => setShowLoot(false)}
        onCollect={handleCollect}
        item={currentItem}
      />

      {/* Collection Notification */}
      <Snackbar
        open={showNotification}
        autoHideDuration={3000}
        onClose={() => setShowNotification(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setShowNotification(false)}
          severity="success"
          variant="filled"
          sx={{
            bgcolor: collectedItem ? rarityConfig[collectedItem.rarity]?.color : tokens.colors.success,
            color: '#000',
            fontWeight: 600,
          }}
        >
          {collectedItem?.name} added to inventory!
        </Alert>
      </Snackbar>
    </Container>
  );
}
