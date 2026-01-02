import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Container,
  Button,
  TextField,
  Chip,
  Collapse,
  InputAdornment,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  ArrowBackSharp as BackIcon,
  SearchSharp as SearchIcon,
  FilterListSharp as FilterIcon,
  ClearSharp as ClearIcon,
  ExpandMoreSharp as ExpandIcon,
  ExpandLessSharp as CollapseIcon,
} from '@mui/icons-material';
import { tokens, RARITY_COLORS } from '../../theme';
import { PageHeader } from '../../components/Placeholder';
import { CardSection } from '../../components/CardSection';

interface SearchResult {
  id: string;
  name: string;
  type: 'item' | 'enemy' | 'location' | 'npc';
  rarity?: string;
  element?: string;
  description: string;
}

const mockResults: SearchResult[] = [
  { id: '1', name: 'Void Blade', type: 'item', rarity: 'Legendary', element: 'Void', description: 'A blade forged in the void itself.' },
  { id: '2', name: 'Fire Grenade', type: 'item', rarity: 'Rare', element: 'Fire', description: 'Explosive pyrotechnic device.' },
  { id: '3', name: 'Ice Bow', type: 'item', rarity: 'Epic', element: 'Ice', description: 'Fires arrows of frozen time.' },
  { id: '4', name: 'Void Spawn', type: 'enemy', element: 'Void', description: 'Creatures born from nothingness.' },
  { id: '5', name: 'Fire Imp', type: 'enemy', element: 'Fire', description: 'Mischievous fire elementals.' },
  { id: '6', name: 'Frost Giant', type: 'enemy', element: 'Ice', description: 'Towering ice creatures.' },
  { id: '7', name: 'Null Providence', type: 'location', element: 'Void', description: 'The One\'s void domain.' },
  { id: '8', name: 'Infernus', type: 'location', element: 'Fire', description: 'Robert\'s eternal flame domain.' },
  { id: '9', name: 'Mr. Bones', type: 'npc', description: 'The skeletal shopkeeper.' },
  { id: '10', name: 'Dr. Maxwell', type: 'npc', description: 'Pyromaniac scientist.' },
];

const elements = ['Void', 'Earth', 'Death', 'Fire', 'Ice', 'Wind', 'Neutral'];
const rarities = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Unique'];
const contentTypes = ['item', 'enemy', 'location', 'npc'];

const elementColors: Record<string, string> = {
  Void: '#7C4DFF',
  Earth: '#8D6E63',
  Death: '#455A64',
  Fire: '#FF5722',
  Ice: '#00BCD4',
  Wind: '#4CAF50',
  Neutral: '#9E9E9E',
};

export function SearchWithFilters() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(true);

  // Filter state
  const [selectedElements, setSelectedElements] = useState<string[]>([]);
  const [selectedRarities, setSelectedRarities] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  const hasActiveFilters = selectedElements.length > 0 || selectedRarities.length > 0 || selectedTypes.length > 0;

  const toggleElement = (element: string) => {
    setSelectedElements(prev =>
      prev.includes(element) ? prev.filter(e => e !== element) : [...prev, element]
    );
  };

  const toggleRarity = (rarity: string) => {
    setSelectedRarities(prev =>
      prev.includes(rarity) ? prev.filter(r => r !== rarity) : [...prev, rarity]
    );
  };

  const toggleType = (type: string) => {
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const clearFilters = () => {
    setSelectedElements([]);
    setSelectedRarities([]);
    setSelectedTypes([]);
  };

  // Filter results
  const filteredResults = mockResults.filter(result => {
    // Query match
    if (query && !result.name.toLowerCase().includes(query.toLowerCase())) {
      return false;
    }
    // Element filter
    if (selectedElements.length > 0 && result.element && !selectedElements.includes(result.element)) {
      return false;
    }
    // Rarity filter
    if (selectedRarities.length > 0 && result.rarity && !selectedRarities.includes(result.rarity)) {
      return false;
    }
    // Type filter
    if (selectedTypes.length > 0 && !selectedTypes.includes(result.type)) {
      return false;
    }
    return true;
  });

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
        title="Advanced Search"
        subtitle="Search with filters across the wiki"
      />

      {/* Search Input */}
      <TextField
        fullWidth
        placeholder="Search items, enemies, locations, NPCs..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: tokens.colors.text.disabled }} />
            </InputAdornment>
          ),
          endAdornment: query && (
            <InputAdornment position="end">
              <Button size="small" onClick={() => setQuery('')}>
                <ClearIcon sx={{ fontSize: 18 }} />
              </Button>
            </InputAdornment>
          ),
        }}
        sx={{ mb: 2 }}
      />

      {/* Filter Toggle */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Button
          startIcon={<FilterIcon />}
          endIcon={filtersOpen ? <CollapseIcon /> : <ExpandIcon />}
          onClick={() => setFiltersOpen(!filtersOpen)}
          sx={{ color: hasActiveFilters ? tokens.colors.primary : tokens.colors.text.secondary }}
        >
          Filters {hasActiveFilters && `(${selectedElements.length + selectedRarities.length + selectedTypes.length})`}
        </Button>
        {hasActiveFilters && (
          <Button size="small" onClick={clearFilters} sx={{ color: tokens.colors.error }}>
            Clear All
          </Button>
        )}
      </Box>

      {/* Collapsible Filters */}
      <Collapse in={filtersOpen}>
        <CardSection sx={{ mb: 3 }}>
          {/* Element Filter */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1.5, color: tokens.colors.text.secondary }}>
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
          </Box>

          <Divider sx={{ my: 2, borderColor: tokens.colors.border }} />

          {/* Rarity Filter */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1.5, color: tokens.colors.text.secondary }}>
              Rarity
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {rarities.map((rarity) => {
                const rarityColor = RARITY_COLORS[rarity.toLowerCase() as keyof typeof RARITY_COLORS] || tokens.colors.text.primary;
                return (
                  <Chip
                    key={rarity}
                    label={rarity}
                    size="small"
                    onClick={() => toggleRarity(rarity)}
                    sx={{
                      bgcolor: selectedRarities.includes(rarity)
                        ? `${rarityColor}40`
                        : tokens.colors.background.elevated,
                      color: selectedRarities.includes(rarity)
                        ? rarityColor
                        : tokens.colors.text.secondary,
                      border: selectedRarities.includes(rarity)
                        ? `1px solid ${rarityColor}`
                        : '1px solid transparent',
                      '&:hover': {
                        bgcolor: `${rarityColor}30`,
                      },
                    }}
                  />
                );
              })}
            </Box>
          </Box>

          <Divider sx={{ my: 2, borderColor: tokens.colors.border }} />

          {/* Content Type Filter */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1.5, color: tokens.colors.text.secondary }}>
              Content Type
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {contentTypes.map((type) => (
                <Chip
                  key={type}
                  label={type.charAt(0).toUpperCase() + type.slice(1)}
                  size="small"
                  onClick={() => toggleType(type)}
                  sx={{
                    bgcolor: selectedTypes.includes(type)
                      ? `${tokens.colors.primary}40`
                      : tokens.colors.background.elevated,
                    color: selectedTypes.includes(type)
                      ? tokens.colors.primary
                      : tokens.colors.text.secondary,
                    border: selectedTypes.includes(type)
                      ? `1px solid ${tokens.colors.primary}`
                      : '1px solid transparent',
                    '&:hover': {
                      bgcolor: `${tokens.colors.primary}30`,
                    },
                  }}
                />
              ))}
            </Box>
          </Box>
        </CardSection>
      </Collapse>

      {/* Results */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="body2" sx={{ color: tokens.colors.text.secondary }}>
          {filteredResults.length} results
        </Typography>
      </Box>

      <List sx={{ p: 0 }}>
        {filteredResults.map((result, i) => {
          const rarityColor = result.rarity
            ? RARITY_COLORS[result.rarity.toLowerCase() as keyof typeof RARITY_COLORS]
            : tokens.colors.text.primary;

          return (
            <Paper
              key={result.id}
              sx={{
                mb: 1,
                bgcolor: tokens.colors.background.paper,
                border: `1px solid ${tokens.colors.border}`,
                '&:hover': { borderColor: tokens.colors.primary },
                cursor: 'pointer',
              }}
            >
              <ListItem>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle2" sx={{ color: rarityColor }}>
                        {result.name}
                      </Typography>
                      {result.element && (
                        <Chip
                          label={result.element}
                          size="small"
                          sx={{
                            height: 18,
                            fontSize: '0.65rem',
                            bgcolor: `${elementColors[result.element]}30`,
                            color: elementColors[result.element],
                          }}
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                      <Chip
                        label={result.type}
                        size="small"
                        sx={{
                          height: 16,
                          fontSize: '0.6rem',
                          bgcolor: tokens.colors.background.elevated,
                          color: tokens.colors.text.disabled,
                        }}
                      />
                      <Typography variant="caption" sx={{ color: tokens.colors.text.secondary }}>
                        {result.description}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            </Paper>
          );
        })}
      </List>

      {filteredResults.length === 0 && (
        <CardSection sx={{ textAlign: 'center', py: 6 }}>
          <SearchIcon sx={{ fontSize: 48, color: tokens.colors.text.disabled, mb: 2 }} />
          <Typography variant="h6" sx={{ mb: 1 }}>
            No results found
          </Typography>
          <Typography variant="body2" sx={{ color: tokens.colors.text.secondary }}>
            Try adjusting your search or filters
          </Typography>
        </CardSection>
      )}
    </Container>
  );
}
