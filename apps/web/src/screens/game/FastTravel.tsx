import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Container,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  ArrowBackSharp as BackIcon,
  PlaceSharp as LocationIcon,
  LockSharp as LockedIcon,
  CheckCircleSharp as CheckIcon,
  TravelExploreSharp as TravelIcon,
} from '@mui/icons-material';
import { tokens, dialogPaperProps, RARITY_COLORS } from '../../theme';
import { PageHeader } from '../../components/Placeholder';
import { CardSection } from '../../components/CardSection';

interface Location {
  id: string;
  name: string;
  domain: string;
  domainSlug: string;
  discovered: boolean;
  visited: boolean;
  cost: number;
  description: string;
}

const locations: Location[] = [
  { id: 'saucer-lobby', name: 'Apartment Lobby', domain: 'The Dying Saucer', domainSlug: 'the-dying-saucer', discovered: true, visited: true, cost: 0, description: 'The central hub where all runs begin.' },
  { id: 'saucer-shop', name: 'Mr. Bones Shop', domain: 'The Dying Saucer', domainSlug: 'the-dying-saucer', discovered: true, visited: true, cost: 0, description: 'The skeletal shopkeeper\'s emporium.' },
  { id: 'earth-entrance', name: 'Factory Gate', domain: 'Earth', domainSlug: 'earth', discovered: true, visited: true, cost: 25, description: 'Where geology meets machinery.' },
  { id: 'earth-boss', name: 'Power Core', domain: 'Earth', domainSlug: 'earth', discovered: true, visited: false, cost: 50, description: 'The heart of John\'s domain.' },
  { id: 'shadow-entrance', name: 'Twilight Gate', domain: 'Shadow Keep', domainSlug: 'shadow-keep', discovered: true, visited: true, cost: 25, description: 'The boundary between light and dark.' },
  { id: 'shadow-crypts', name: 'Bone Crypts', domain: 'Shadow Keep', domainSlug: 'shadow-keep', discovered: true, visited: false, cost: 40, description: 'Ancient resting place of the undead.' },
  { id: 'infernus-entrance', name: 'Flame Gate', domain: 'Infernus', domainSlug: 'infernus', discovered: true, visited: false, cost: 25, description: 'The entrance to eternal fire.' },
  { id: 'frost-entrance', name: 'Frozen Gate', domain: 'Frost Reach', domainSlug: 'frost-reach', discovered: false, visited: false, cost: 30, description: 'Where time stands still in ice.' },
  { id: 'aberrant-entrance', name: 'Storm Gate', domain: 'Aberrant', domainSlug: 'aberrant', discovered: false, visited: false, cost: 35, description: 'The chaotic winds await.' },
];

const elementColors: Record<string, string> = {
  'the-dying-saucer': '#9E9E9E',
  'earth': '#8D6E63',
  'shadow-keep': '#455A64',
  'infernus': '#FF5722',
  'frost-reach': '#00BCD4',
  'aberrant': '#4CAF50',
  'null-providence': '#7C4DFF',
};

export function FastTravel() {
  const navigate = useNavigate();
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const playerGold = 250;

  const discoveredLocations = locations.filter(l => l.discovered);
  const lockedLocations = locations.filter(l => !l.discovered);

  const handleSelect = (location: Location) => {
    setSelectedLocation(location);
    setConfirmOpen(true);
  };

  const handleTravel = () => {
    // In real app, would teleport player
    setConfirmOpen(false);
    navigate('/play');
  };

  const groupedLocations = discoveredLocations.reduce((acc, loc) => {
    if (!acc[loc.domain]) {
      acc[loc.domain] = [];
    }
    acc[loc.domain].push(loc);
    return acc;
  }, {} as Record<string, Location[]>);

  return (
    <Container maxWidth="md" sx={{ py: 2 }}>
      <Button
        startIcon={<BackIcon />}
        onClick={() => navigate(-1)}
        sx={{ mb: 2, color: tokens.colors.text.secondary }}
      >
        Back
      </Button>

      <PageHeader
        title="Fast Travel"
        subtitle="Teleport to discovered locations"
      />

      {/* Gold Balance */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          p: 2,
          bgcolor: tokens.colors.background.elevated,
          borderRadius: 1,
        }}
      >
        <Typography variant="body2" sx={{ color: tokens.colors.text.secondary }}>
          Your Gold
        </Typography>
        <Typography
          variant="h6"
          sx={{
            fontFamily: tokens.fonts.gaming,
            color: RARITY_COLORS.rare,
          }}
        >
          {playerGold} G
        </Typography>
      </Box>

      {/* Discovered Locations by Domain */}
      {Object.entries(groupedLocations).map(([domain, locs]) => (
        <CardSection key={domain} padding={0} sx={{ mb: 2 }}>
          <Box
            sx={{
              p: 2,
              bgcolor: `${elementColors[locs[0].domainSlug]}20`,
              borderBottom: `1px solid ${tokens.colors.border}`,
            }}
          >
            <Typography variant="subtitle2" sx={{ fontFamily: tokens.fonts.gaming }}>
              {domain}
            </Typography>
          </Box>
          <List disablePadding>
            {locs.map((location, i) => (
              <ListItem
                key={location.id}
                disablePadding
                sx={{
                  borderBottom: i < locs.length - 1 ? `1px solid ${tokens.colors.border}` : 'none',
                }}
              >
                <ListItemButton
                  onClick={() => handleSelect(location)}
                  disabled={location.cost > playerGold}
                  sx={{
                    py: 1.5,
                    '&:hover': { bgcolor: tokens.colors.background.elevated },
                    '&.Mui-disabled': { opacity: 0.5 },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {location.visited ? (
                      <CheckIcon sx={{ color: tokens.colors.success, fontSize: 20 }} />
                    ) : (
                      <LocationIcon sx={{ color: tokens.colors.text.secondary, fontSize: 20 }} />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={location.name}
                    secondary={location.description}
                    primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                  <Chip
                    label={location.cost === 0 ? 'Free' : `${location.cost} G`}
                    size="small"
                    sx={{
                      bgcolor: location.cost === 0 ? `${tokens.colors.success}20` : `${RARITY_COLORS.rare}20`,
                      color: location.cost === 0 ? tokens.colors.success : RARITY_COLORS.rare,
                      fontFamily: tokens.fonts.gaming,
                      fontSize: '0.7rem',
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </CardSection>
      ))}

      {/* Locked Locations */}
      {lockedLocations.length > 0 && (
        <CardSection padding={0} sx={{ opacity: 0.5 }}>
          <Box
            sx={{
              p: 2,
              borderBottom: `1px solid ${tokens.colors.border}`,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <LockedIcon sx={{ fontSize: 18, color: tokens.colors.text.disabled }} />
            <Typography variant="subtitle2" sx={{ color: tokens.colors.text.disabled }}>
              Undiscovered ({lockedLocations.length})
            </Typography>
          </Box>
          <Box sx={{ p: 2 }}>
            <Typography variant="caption" sx={{ color: tokens.colors.text.disabled }}>
              Explore domains to discover new fast travel points
            </Typography>
          </Box>
        </CardSection>
      )}

      {/* Travel Confirmation Dialog */}
      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={dialogPaperProps}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TravelIcon sx={{ color: tokens.colors.primary }} />
          Fast Travel
        </DialogTitle>
        <DialogContent>
          {selectedLocation && (
            <>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Travel to <strong>{selectedLocation.name}</strong>?
              </Typography>
              <Box
                sx={{
                  p: 2,
                  bgcolor: tokens.colors.background.elevated,
                  borderRadius: 1,
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="caption" sx={{ color: tokens.colors.text.secondary }}>
                    Domain
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 500 }}>
                    {selectedLocation.domain}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" sx={{ color: tokens.colors.text.secondary }}>
                    Cost
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 600,
                      fontFamily: tokens.fonts.gaming,
                      color: selectedLocation.cost === 0 ? tokens.colors.success : RARITY_COLORS.rare,
                    }}
                  >
                    {selectedLocation.cost === 0 ? 'Free' : `${selectedLocation.cost} G`}
                  </Typography>
                </Box>
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleTravel}>
            Travel
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
