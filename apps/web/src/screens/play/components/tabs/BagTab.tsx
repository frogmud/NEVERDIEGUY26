import { useNavigate } from 'react-router-dom';
import { Box, Typography, Grid, ButtonBase } from '@mui/material';
import { InventorySharp as InventoryIcon } from '@mui/icons-material';
import { tokens } from '../../../../theme';

// Mock loadout data - replace with actual game state
const mockLoadout = {
  weapon: {
    name: 'Starter Bow',
    sprite: '/assets/items/weapons/ranged-starter-bow.png',
    rarity: 'common',
  },
  armor: null,
  dice: [
    { id: 'd6-1', type: 'd6', sprite: '/assets/ui/dice/d6-01.png' },
    { id: 'd8-1', type: 'd8', sprite: '/assets/ui/dice/d8-01.png' },
    { id: 'd10-1', type: 'd10', sprite: '/assets/ui/dice/d10-01.png' },
  ],
};

export function BagTab() {
  const navigate = useNavigate();

  return (
    <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography sx={{ fontWeight: 600, fontSize: '1rem' }}>
          Loadout
        </Typography>
        <ButtonBase
          onClick={() => navigate('/play/loadout')}
          sx={{
            fontSize: '0.75rem',
            color: tokens.colors.secondary,
            px: 1,
            py: 0.5,
            borderRadius: 1,
            transition: 'all 0.15s ease',
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.05)',
            },
          }}
        >
          Full Inventory
        </ButtonBase>
      </Box>

      {/* Equipment Slots */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Weapon */}
        <EquipmentSlot
          label="Weapon"
          item={mockLoadout.weapon}
          emptyText="No weapon equipped"
        />

        {/* Armor */}
        <EquipmentSlot
          label="Armor"
          item={mockLoadout.armor}
          emptyText="No armor equipped"
        />
      </Box>

      {/* Dice Section */}
      <Box>
        <Typography
          sx={{
            fontSize: '0.75rem',
            color: tokens.colors.text.secondary,
            mb: 1.5,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          Dice Deck ({mockLoadout.dice.length})
        </Typography>
        <Grid container spacing={1}>
          {mockLoadout.dice.map((die) => (
            <Grid key={die.id} size={{ xs: 4 }}>
              <Box
                sx={{
                  aspectRatio: '1 / 1',
                  bgcolor: tokens.colors.background.elevated,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `1px solid ${tokens.colors.border}`,
                }}
              >
                <Box
                  component="img"
                  src={die.sprite}
                  alt={die.type}
                  sx={{
                    width: '70%',
                    height: '70%',
                    objectFit: 'contain',
                    imageRendering: 'pixelated',
                  }}
                />
              </Box>
            </Grid>
          ))}
          {/* Empty slots */}
          {Array.from({ length: Math.max(0, 6 - mockLoadout.dice.length) }).map(
            (_, i) => (
              <Grid key={`empty-${i}`} size={{ xs: 4 }}>
                <Box
                  sx={{
                    aspectRatio: '1 / 1',
                    bgcolor: tokens.colors.background.default,
                    borderRadius: 2,
                    border: `1px dashed ${tokens.colors.border}`,
                  }}
                />
              </Grid>
            )
          )}
        </Grid>
      </Box>

      {/* View Full Inventory Button */}
      <ButtonBase
        onClick={() => navigate('/play/loadout')}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1,
          py: 1.5,
          borderRadius: 2,
          bgcolor: tokens.colors.background.elevated,
          border: `1px solid ${tokens.colors.border}`,
          color: tokens.colors.text.secondary,
          transition: 'all 0.15s ease',
          '&:hover': {
            bgcolor: tokens.colors.background.paper,
            color: tokens.colors.text.primary,
            borderColor: tokens.colors.text.secondary,
          },
        }}
      >
        <InventoryIcon sx={{ fontSize: 18 }} />
        <Typography sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
          Manage Inventory
        </Typography>
      </ButtonBase>
    </Box>
  );
}

// Equipment Slot Component
interface EquipmentSlotProps {
  label: string;
  item: { name: string; sprite: string; rarity: string } | null;
  emptyText: string;
}

function EquipmentSlot({ label, item, emptyText }: EquipmentSlotProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        p: 1.5,
        borderRadius: 2,
        bgcolor: tokens.colors.background.elevated,
        border: `1px solid ${tokens.colors.border}`,
      }}
    >
      {/* Icon/Sprite */}
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: 1,
          bgcolor: tokens.colors.background.default,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {item ? (
          <Box
            component="img"
            src={item.sprite}
            alt={item.name}
            sx={{
              width: '80%',
              height: '80%',
              objectFit: 'contain',
              imageRendering: 'pixelated',
            }}
          />
        ) : (
          <Box
            sx={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              border: `2px dashed ${tokens.colors.border}`,
            }}
          />
        )}
      </Box>

      {/* Info */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          sx={{
            fontSize: '0.7rem',
            color: tokens.colors.text.disabled,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            mb: 0.25,
          }}
        >
          {label}
        </Typography>
        <Typography
          sx={{
            fontSize: '0.875rem',
            color: item ? tokens.colors.text.primary : tokens.colors.text.secondary,
            fontWeight: item ? 500 : 400,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {item ? item.name : emptyText}
        </Typography>
      </Box>
    </Box>
  );
}
