import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Container,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Paper,
  ClickAwayListener,
} from '@mui/material';
import {
  SearchSharp as SearchIcon,
  CloseSharp as CloseIcon,
  HistorySharp as HistoryIcon,
  AutoStoriesSharp as WikiIcon,
  PersonSharp as CharacterIcon,
  InventorySharp as ItemIcon,
  PlaceSharp as LocationIcon,
  MenuBookSharp as GuideIcon,
  SearchOffSharp as NoResultsIcon,
  TrendingUpSharp as TrendingIcon,
  NorthEastSharp as ArrowIcon,
  StorefrontSharp as ShopIcon,
  ExploreSharp as DomainIcon,
  EmojiEventsSharp as TrophyIcon,
  TempleBuddhistSharp as PantheonIcon,
  PestControlSharp as EnemyIcon,
  HikingSharp as TravelerIcon,
  DirectionsWalkSharp as WandererIcon,
  GroupsSharp as FactionIcon,
} from '@mui/icons-material';
import { tokens } from '../../theme';
import { CardSection } from '../../components/CardSection';
import { searchEntities, type AnyEntity, type WikiCategory } from '../../data/wiki';
import { getCategoryInfo } from '../../data/wiki/helpers';

const filterOptions = [
  { id: 'all', label: 'All' },
  { id: 'items', label: 'Items' },
  { id: 'enemies', label: 'Enemies' },
  { id: 'shops', label: 'Shops' },
  { id: 'domains', label: 'Domains' },
  { id: 'pantheon', label: 'Pantheon' },
];

const recentSearches = [
  'void crystal',
  'wandering merchant',
  'fire bomb',
];

const trendingSearches = [
  { text: 'Void Crystal', category: 'items' },
  { text: 'Infernus', category: 'domains' },
  { text: 'Never Die Guy', category: 'travelers' },
  { text: 'Fire Bomb', category: 'items' },
];

// Category icons mapping
const categoryIcons: Record<WikiCategory, typeof WikiIcon> = {
  items: ItemIcon,
  enemies: EnemyIcon,
  shops: ShopIcon,
  wanderers: WandererIcon,
  travelers: TravelerIcon,
  pantheon: PantheonIcon,
  domains: DomainIcon,
  trophies: TrophyIcon,
  factions: FactionIcon,
};

// Max autocomplete suggestions
const MAX_SUGGESTIONS = 8;

export function SearchPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [activeFilter, setActiveFilter] = useState('all');
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [isSearching, setIsSearching] = useState(!!initialQuery);
  const [results, setResults] = useState<AnyEntity[]>([]);
  const [suggestions, setSuggestions] = useState<AnyEntity[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  // Live suggestions as user types (debounced feel via quick search)
  useEffect(() => {
    if (query.trim().length > 1 && !isSearching) {
      const liveResults = searchEntities(query).slice(0, MAX_SUGGESTIONS);
      setSuggestions(liveResults);
    } else {
      setSuggestions([]);
    }
    setHighlightedIndex(-1);
  }, [query, isSearching]);

  // Full search when query changes or on initial load
  useEffect(() => {
    if (query.trim().length > 0 && isSearching) {
      // Apply category filter
      let searchResults = searchEntities(query);
      if (activeFilter !== 'all') {
        searchResults = searchResults.filter(e => e.category === activeFilter);
      }
      setResults(searchResults);
    } else {
      setResults([]);
    }
  }, [query, isSearching, activeFilter]);

  // Update query from URL param changes
  useEffect(() => {
    const urlQuery = searchParams.get('q') || '';
    if (urlQuery && urlQuery !== query) {
      setQuery(urlQuery);
      setIsSearching(true);
    }
  }, [searchParams]);

  const hasQuery = query.trim().length > 0;
  const hasResults = results.length > 0;
  const showDropdown = showAutocomplete && hasQuery && query.length > 1 && !isSearching && suggestions.length > 0;

  const handleSearch = useCallback((searchQuery: string) => {
    setQuery(searchQuery);
    setShowAutocomplete(false);
    setIsSearching(true);
    setSuggestions([]);
    setHighlightedIndex(-1);
    // Update URL
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery.trim() });
    }
  }, [setSearchParams]);

  const handleSelectSuggestion = useCallback((entity: AnyEntity) => {
    setShowAutocomplete(false);
    setSuggestions([]);
    navigate(`/wiki/${entity.category}/${entity.slug}`);
  }, [navigate]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!showDropdown) {
      if (e.key === 'Enter' && hasQuery) {
        handleSearch(query);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
          handleSelectSuggestion(suggestions[highlightedIndex]);
        } else if (hasQuery) {
          handleSearch(query);
        }
        break;
      case 'Escape':
        setShowAutocomplete(false);
        setHighlightedIndex(-1);
        break;
    }
  }, [showDropdown, hasQuery, query, suggestions, highlightedIndex, handleSearch, handleSelectSuggestion]);

  // Group results by category
  const groupedResults = results.reduce((acc, entity) => {
    const cat = entity.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(entity);
    return acc;
  }, {} as Record<WikiCategory, AnyEntity[]>);

  return (
    <Container maxWidth="md" sx={{ py: 2 }}>
      {/* Search Input with Autocomplete */}
      <ClickAwayListener onClickAway={() => setShowAutocomplete(false)}>
        <Box sx={{ position: 'relative' }}>
          <TextField
            fullWidth
            autoFocus
            ref={inputRef}
            placeholder="Search wiki, characters, items..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowAutocomplete(true);
              setIsSearching(false);
            }}
            onFocus={() => setShowAutocomplete(true)}
            onKeyDown={handleKeyDown}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                backgroundColor: tokens.colors.background.paper,
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: tokens.colors.text.disabled }} />
                </InputAdornment>
              ),
              endAdornment: hasQuery && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => { setQuery(''); setIsSearching(false); }}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {/* Autocomplete Dropdown */}
          {showDropdown && (
            <Paper
              sx={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                mt: -1,
                zIndex: 1000,
                backgroundColor: tokens.colors.background.paper,
                border: `1px solid ${tokens.colors.border}`,
                borderRadius: 1,
                overflow: 'hidden',
                maxHeight: 400,
                overflowY: 'auto',
              }}
            >
              <Typography
                variant="caption"
                sx={{ px: 2, py: 1, display: 'block', color: tokens.colors.text.disabled }}
              >
                Quick Results
              </Typography>
              {suggestions.map((entity, i) => {
                const CategoryIcon = categoryIcons[entity.category] || WikiIcon;
                const categoryInfo = getCategoryInfo(entity.category);
                const isHighlighted = i === highlightedIndex;
                return (
                  <Box
                    key={`${entity.category}-${entity.slug}`}
                    onClick={() => handleSelectSuggestion(entity)}
                    onMouseEnter={() => setHighlightedIndex(i)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      px: 2,
                      py: 1.5,
                      cursor: 'pointer',
                      borderTop: `1px solid ${tokens.colors.border}`,
                      backgroundColor: isHighlighted ? tokens.colors.background.elevated : 'transparent',
                      '&:hover': { backgroundColor: tokens.colors.background.elevated },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, minWidth: 0 }}>
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: 1,
                          bgcolor: `${categoryInfo.color}20`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <CategoryIcon sx={{ fontSize: 18, color: categoryInfo.color }} />
                      </Box>
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }} noWrap>
                          {entity.name}
                        </Typography>
                        {entity.description && (
                          <Typography
                            variant="caption"
                            sx={{ color: tokens.colors.text.secondary, display: 'block' }}
                            noWrap
                          >
                            {entity.description.slice(0, 60)}...
                          </Typography>
                        )}
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0, ml: 1 }}>
                      <Chip
                        label={categoryInfo.label}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.65rem',
                          bgcolor: `${categoryInfo.color}15`,
                          color: categoryInfo.color,
                          border: `1px solid ${categoryInfo.color}30`,
                        }}
                      />
                      <ArrowIcon sx={{ fontSize: 14, color: tokens.colors.text.disabled }} />
                    </Box>
                  </Box>
                );
              })}
              {/* Footer hint */}
              <Box
                sx={{
                  px: 2,
                  py: 1,
                  borderTop: `1px solid ${tokens.colors.border}`,
                  bgcolor: tokens.colors.background.elevated,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Typography variant="caption" sx={{ color: tokens.colors.text.disabled }}>
                  Press Enter to search all results
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      px: 0.5,
                      py: 0.25,
                      bgcolor: tokens.colors.background.paper,
                      border: `1px solid ${tokens.colors.border}`,
                      borderRadius: 0.5,
                      color: tokens.colors.text.secondary,
                      fontSize: '0.65rem',
                    }}
                  >
                    Up/Down
                  </Typography>
                  <Typography variant="caption" sx={{ color: tokens.colors.text.disabled, mx: 0.5 }}>
                    to navigate
                  </Typography>
                </Box>
              </Box>
            </Paper>
          )}
        </Box>
      </ClickAwayListener>

      {/* Filter Chips */}
      <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
        {filterOptions.map((filter) => {
          const isActive = activeFilter === filter.id;
          return (
            <Chip
              key={filter.id}
              label={filter.label}
              onClick={() => setActiveFilter(filter.id)}
              sx={{
                bgcolor: isActive ? tokens.colors.background.elevated : tokens.colors.background.paper,
                color: tokens.colors.text.primary,
                border: `1px solid ${tokens.colors.border}`,
                '&:hover': {
                  bgcolor: tokens.colors.background.elevated,
                },
              }}
            />
          );
        })}
      </Box>

      {/* Content based on state */}
      {!hasQuery || !isSearching ? (
        /* Recent & Trending Searches */
        <Box>
          {/* Trending */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <TrendingIcon sx={{ color: tokens.colors.primary, fontSize: 20 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Trending Now
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {trendingSearches.map((item) => (
                <Chip
                  key={item.text}
                  label={item.text}
                  onClick={() => handleSearch(item.text)}
                  sx={{
                    bgcolor: tokens.colors.background.paper,
                    border: `1px solid ${tokens.colors.border}`,
                    cursor: 'pointer',
                    '&:hover': { borderColor: tokens.colors.primary },
                  }}
                />
              ))}
            </Box>
          </Box>

          {/* Recent */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Recent Searches
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: tokens.colors.text.secondary, cursor: 'pointer', '&:hover': { color: tokens.colors.primary } }}
            >
              Clear
            </Typography>
          </Box>
          <CardSection padding={0}>
            {recentSearches.map((search, i) => (
              <Box
                key={search}
                onClick={() => handleSearch(search)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  p: 2,
                  cursor: 'pointer',
                  borderBottom: i < recentSearches.length - 1 ? `1px solid ${tokens.colors.border}` : 'none',
                  '&:hover': {
                    backgroundColor: tokens.colors.background.elevated,
                  },
                }}
              >
                <HistoryIcon sx={{ color: tokens.colors.text.disabled, fontSize: 20 }} />
                <Typography variant="body1">{search}</Typography>
              </Box>
            ))}
          </CardSection>
        </Box>
      ) : hasResults ? (
        /* Search Results */
        <Box>
          <Typography variant="body2" sx={{ color: tokens.colors.text.secondary, mb: 3 }}>
            Found {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
          </Typography>
          {Object.entries(groupedResults).map(([category, categoryResults]) => {
            const categoryInfo = getCategoryInfo(category as WikiCategory);
            const CategoryIcon = categoryIcons[category as WikiCategory] || WikiIcon;
            return (
              <Box key={category} sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <CategoryIcon sx={{ color: categoryInfo.color, fontSize: 20 }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {categoryInfo.pluralLabel} ({categoryResults.length})
                  </Typography>
                </Box>
                <CardSection padding={0}>
                  {categoryResults.map((entity, i) => {
                    const EntityIcon = categoryIcons[entity.category] || WikiIcon;
                    return (
                      <Box
                        key={entity.slug}
                        onClick={() => navigate(`/wiki/${entity.category}/${entity.slug}`)}
                        sx={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 2,
                          p: 2,
                          cursor: 'pointer',
                          borderBottom: i < categoryResults.length - 1 ? `1px solid ${tokens.colors.border}` : 'none',
                          '&:hover': {
                            backgroundColor: tokens.colors.background.elevated,
                          },
                        }}
                      >
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 1,
                            bgcolor: `${categoryInfo.color}15`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <EntityIcon sx={{ color: categoryInfo.color, fontSize: 20 }} />
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {entity.name}
                          </Typography>
                          <Typography variant="body2" sx={{ color: tokens.colors.text.secondary }} noWrap>
                            {entity.description || `${categoryInfo.label} in the world of Never Die Guy`}
                          </Typography>
                        </Box>
                      </Box>
                    );
                  })}
                </CardSection>
              </Box>
            );
          })}
        </Box>
      ) : (
        /* No Results */
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
          }}
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              bgcolor: tokens.colors.background.elevated,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3,
            }}
          >
            <NoResultsIcon sx={{ fontSize: 40, color: tokens.colors.text.disabled }} />
          </Box>
          <Typography variant="h6" sx={{ mb: 1 }}>
            No results found
          </Typography>
          <Typography variant="body2" sx={{ color: tokens.colors.text.secondary, mb: 3, maxWidth: 300, mx: 'auto' }}>
            We couldn't find anything matching "{query}". Try different keywords or check your spelling.
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Typography variant="body2" sx={{ color: tokens.colors.text.disabled }}>
              Try:
            </Typography>
            {['weapons', 'bosses', 'locations'].map((suggestion) => (
              <Chip
                key={suggestion}
                label={suggestion}
                size="small"
                onClick={() => setQuery(suggestion)}
                sx={{
                  bgcolor: tokens.colors.background.paper,
                  border: `1px solid ${tokens.colors.border}`,
                  cursor: 'pointer',
                }}
              />
            ))}
          </Box>
        </Box>
      )}
    </Container>
  );
}
