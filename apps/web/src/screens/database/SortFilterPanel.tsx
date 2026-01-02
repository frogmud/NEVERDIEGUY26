import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Container,
  Button,
  Chip,
  Divider,
  Slider,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from '@mui/material';
import {
  ArrowBackSharp as BackIcon,
  SortSharp as SortIcon,
  FilterListSharp as FilterIcon,
  RestartAltSharp as ResetIcon,
} from '@mui/icons-material';
import { tokens, RARITY_COLORS } from '../../theme';
import { PageHeader } from '../../components/Placeholder';
import { CardSection } from '../../components/CardSection';

const elements = ['Void', 'Earth', 'Death', 'Fire', 'Ice', 'Wind'];
const tiers = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Unique'];
const itemTypes = ['Weapon', 'Armor', 'Accessory', 'Consumable', 'Material', 'Quest Item'];

const elementColors: Record<string, string> = {
  Void: '#7C4DFF',
  Earth: '#8D6E63',
  Death: '#455A64',
  Fire: '#FF5722',
  Ice: '#00BCD4',
  Wind: '#4CAF50',
};

export function SortFilterPanel() {
  const navigate = useNavigate();

  // Sort state
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Filter state
  const [selectedElements, setSelectedElements] = useState<string[]>([]);
  const [selectedTiers, setSelectedTiers] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [levelRange, setLevelRange] = useState<number[]>([1, 50]);
  const [showEquippable, setShowEquippable] = useState(false);
  const [showOwned, setShowOwned] = useState(false);

  const hasActiveFilters =
    selectedElements.length > 0 ||
    selectedTiers.length > 0 ||
    selectedTypes.length > 0 ||
    levelRange[0] > 1 ||
    levelRange[1] < 50 ||
    showEquippable ||
    showOwned;

  const activeFilterCount =
    selectedElements.length +
    selectedTiers.length +
    selectedTypes.length +
    (levelRange[0] > 1 || levelRange[1] < 50 ? 1 : 0) +
    (showEquippable ? 1 : 0) +
    (showOwned ? 1 : 0);

  const toggleElement = (element: string) => {
    setSelectedElements(prev =>
      prev.includes(element) ? prev.filter(e => e !== element) : [...prev, element]
    );
  };

  const toggleTier = (tier: string) => {
    setSelectedTiers(prev =>
      prev.includes(tier) ? prev.filter(t => t !== tier) : [...prev, tier]
    );
  };

  const toggleType = (type: string) => {
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const resetFilters = () => {
    setSelectedElements([]);
    setSelectedTiers([]);
    setSelectedTypes([]);
    setLevelRange([1, 50]);
    setShowEquippable(false);
    setShowOwned(false);
  };

  const handleApply = () => {
    // In real app, would apply filters and navigate back
    navigate(-1);
  };

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
        title="Sort & Filter"
        subtitle="Customize your database view"
      />

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 3,
            p: 2,
            bgcolor: `${tokens.colors.primary}10`,
            borderRadius: 1,
            border: `1px solid ${tokens.colors.primary}30`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterIcon sx={{ color: tokens.colors.primary, fontSize: 20 }} />
            <Typography variant="body2" sx={{ color: tokens.colors.primary }}>
              {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} active
            </Typography>
          </Box>
          <Button
            size="small"
            startIcon={<ResetIcon />}
            onClick={resetFilters}
            sx={{ color: tokens.colors.error }}
          >
            Reset All
          </Button>
        </Box>
      )}

      {/* Sort Section */}
      <CardSection sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <SortIcon sx={{ color: tokens.colors.text.secondary }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Sort By
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Field</InputLabel>
            <Select
              value={sortBy}
              label="Field"
              onChange={(e) => setSortBy(e.target.value)}
            >
              <MenuItem value="name">Name</MenuItem>
              <MenuItem value="level">Level</MenuItem>
              <MenuItem value="rarity">Rarity</MenuItem>
              <MenuItem value="element">Element</MenuItem>
              <MenuItem value="date">Date Added</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Order</InputLabel>
            <Select
              value={sortOrder}
              label="Order"
              onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
            >
              <MenuItem value="asc">Ascending</MenuItem>
              <MenuItem value="desc">Descending</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </CardSection>

      {/* Element Filter */}
      <CardSection sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ mb: 2, color: tokens.colors.text.secondary }}>
          Element
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {elements.map((element) => (
            <Chip
              key={element}
              label={element}
              size="small"
              onClick={() => toggleElement(element)}
              sx={{
                bgcolor: selectedElements.includes(element)
                  ? `${elementColors[element]}40`
                  : tokens.colors.background.elevated,
                color: selectedElements.includes(element)
                  ? elementColors[element]
                  : tokens.colors.text.secondary,
                border: selectedElements.includes(element)
                  ? `1px solid ${elementColors[element]}`
                  : '1px solid transparent',
                '&:hover': {
                  bgcolor: `${elementColors[element]}30`,
                },
              }}
            />
          ))}
        </Box>
      </CardSection>

      {/* Rarity Filter */}
      <CardSection sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ mb: 2, color: tokens.colors.text.secondary }}>
          Rarity Tier
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {tiers.map((tier) => {
            const tierColor = RARITY_COLORS[tier.toLowerCase() as keyof typeof RARITY_COLORS] || tokens.colors.text.primary;
            return (
              <Chip
                key={tier}
                label={tier}
                size="small"
                onClick={() => toggleTier(tier)}
                sx={{
                  bgcolor: selectedTiers.includes(tier)
                    ? `${tierColor}40`
                    : tokens.colors.background.elevated,
                  color: selectedTiers.includes(tier)
                    ? tierColor
                    : tokens.colors.text.secondary,
                  border: selectedTiers.includes(tier)
                    ? `1px solid ${tierColor}`
                    : '1px solid transparent',
                  '&:hover': {
                    bgcolor: `${tierColor}30`,
                  },
                }}
              />
            );
          })}
        </Box>
      </CardSection>

      {/* Item Type Filter */}
      <CardSection sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ mb: 2, color: tokens.colors.text.secondary }}>
          Item Type
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {itemTypes.map((type) => (
            <Chip
              key={type}
              label={type}
              size="small"
              onClick={() => toggleType(type)}
              sx={{
                bgcolor: selectedTypes.includes(type)
                  ? `${tokens.colors.secondary}40`
                  : tokens.colors.background.elevated,
                color: selectedTypes.includes(type)
                  ? tokens.colors.secondary
                  : tokens.colors.text.secondary,
                border: selectedTypes.includes(type)
                  ? `1px solid ${tokens.colors.secondary}`
                  : '1px solid transparent',
                '&:hover': {
                  bgcolor: `${tokens.colors.secondary}30`,
                },
              }}
            />
          ))}
        </Box>
      </CardSection>

      {/* Level Range */}
      <CardSection sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ mb: 1, color: tokens.colors.text.secondary }}>
          Level Range
        </Typography>
        <Typography variant="body2" sx={{ mb: 2, fontFamily: tokens.fonts.gaming }}>
          {levelRange[0]} - {levelRange[1]}
        </Typography>
        <Slider
          value={levelRange}
          onChange={(_, value) => setLevelRange(value as number[])}
          min={1}
          max={50}
          valueLabelDisplay="auto"
          sx={{
            color: tokens.colors.primary,
            '& .MuiSlider-thumb': {
              bgcolor: tokens.colors.primary,
            },
          }}
        />
      </CardSection>

      {/* Quick Toggles */}
      <CardSection sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ mb: 2, color: tokens.colors.text.secondary }}>
          Quick Filters
        </Typography>
        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                checked={showEquippable}
                onChange={(e) => setShowEquippable(e.target.checked)}
              />
            }
            label={<Typography variant="body2">Show only equippable items</Typography>}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={showOwned}
                onChange={(e) => setShowOwned(e.target.checked)}
              />
            }
            label={<Typography variant="body2">Show only items I own</Typography>}
          />
        </FormGroup>
      </CardSection>

      {/* Apply Button */}
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          variant="outlined"
          fullWidth
          onClick={() => navigate(-1)}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          fullWidth
          onClick={handleApply}
        >
          Apply Filters
        </Button>
      </Box>
    </Container>
  );
}
