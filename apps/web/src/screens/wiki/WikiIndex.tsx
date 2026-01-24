import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  InputBase,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Pagination,
  Tabs,
  Tab,
  Grid,
  Select,
  MenuItem,
  FormControl,
  Tooltip,
  useMediaQuery,
} from '@mui/material';
import {
  SearchSharp as SearchIcon,
  ViewListSharp as ViewListIcon,
  GridViewSharp as GridViewIcon,
} from '@mui/icons-material';
import IconButton from '@mui/material/IconButton';
import { tokens } from '../../theme';
import { AssetImage, SortableHeader, type SortConfig } from '../../components/ds';
import { GuestBanner } from '../../components';
import { useAuth } from '../../contexts/AuthContext';
import {
  getEntitiesByCategory,
  getCategoryCounts,
  type WikiCategory,
  type AnyEntity,
  type Enemy,
  type Item,
  type Domain,
  type Traveler,
  type Pantheon,
  type Shop,
  type Faction,
} from '../../data/wiki';
import { getRarityColor, getDifficultyColor, slugToName, getEnemyTypeColor, getElementInfo } from '../../data/wiki/helpers';

// =============================================================================
// CONSTANTS
// =============================================================================

const ITEMS_PER_PAGE = 15;

// Standardized column widths - percentages for consistency
// Icon fixed, Name 50%, remaining columns split the rest
const COL = {
  icon: 64,
  name: '50%',
  col3: '25%',
  col4: '25%',
} as const;

// Tab configuration - order matters for display
const TABS = [
  { id: 'items', label: 'Items', categories: ['items'] as WikiCategory[] },
  { id: 'enemies', label: 'Monsters', categories: ['enemies'] as WikiCategory[] },
  { id: 'domains', label: 'Domains', categories: ['domains'] as WikiCategory[] },
  { id: 'characters', label: 'Characters', categories: ['travelers', 'wanderers', 'pantheon'] as WikiCategory[] },
  { id: 'factions', label: 'Factions', categories: ['factions'] as WikiCategory[] },
  { id: 'shops', label: 'Shops', categories: ['shops'] as WikiCategory[] },
  { id: 'trophies', label: 'Trophies', categories: ['trophies'] as WikiCategory[] },
] as const;

type TabId = typeof TABS[number]['id'];

// Filter options per tab with labels
const FILTER_OPTIONS: Record<string, Record<string, { label: string; allLabel: string; options: readonly string[] }>> = {
  items: {
    type: { label: 'Type', allLabel: 'All Types', options: ['Weapon', 'Armor', 'Accessory', 'Consumable', 'Material', 'Key Item'] },
    rarity: { label: 'Rarity', allLabel: 'All Rarities', options: ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Unique'] },
  },
  enemies: {
    type: { label: 'Rank', allLabel: 'All Ranks', options: ['Normal', 'Elite', 'Miniboss', 'Boss'] },
  },
  domains: {
    difficulty: { label: 'Difficulty', allLabel: 'All Difficulties', options: ['Easy', 'Normal', 'Hard', 'Extreme'] },
  },
  characters: {
    type: { label: 'Type', allLabel: 'All Types', options: ['Traveler', 'Wanderer', 'Pantheon'] },
  },
  shops: {
    location: { label: 'Location', allLabel: 'All Locations', options: ['Fixed', 'Mobile'] },
  },
  trophies: {
    rarity: { label: 'Rarity', allLabel: 'All Rarities', options: ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Unique'] },
  },
  factions: {
    element: { label: 'Element', allLabel: 'All Elements', options: ['Void', 'Earth', 'Death', 'Fire', 'Ice', 'Wind', 'Neutral'] },
  },
};

// Map URL category to tab
function categoryToTab(category: string | undefined): TabId {
  if (!category) return 'items';
  const lower = category.toLowerCase();

  // Direct matches
  if (lower === 'items') return 'items';
  if (lower === 'enemies') return 'enemies';
  if (lower === 'domains') return 'domains';
  if (lower === 'travelers' || lower === 'wanderers' || lower === 'pantheon' || lower === 'characters') return 'characters';
  if (lower === 'factions') return 'factions';
  if (lower === 'shops') return 'shops';
  if (lower === 'trophies') return 'trophies';

  return 'items';
}

// =============================================================================
// DICE ANIMATION
// =============================================================================

const DICE_VARIANTS = [
  ['/assets/ui/dice/d4-01.png', '/assets/ui/dice/d4-02.png', '/assets/ui/dice/d4-03.png'],
  ['/assets/ui/dice/d6-01.png', '/assets/ui/dice/d6-02.png', '/assets/ui/dice/d6-03.png'],
  ['/assets/ui/dice/d8-01.png', '/assets/ui/dice/d8-02.png', '/assets/ui/dice/d8-03.png'],
  ['/assets/ui/dice/d10-01.png', '/assets/ui/dice/d10-02.png', '/assets/ui/dice/d10-03.png'],
  ['/assets/ui/dice/d12-01.png', '/assets/ui/dice/d12-02.png', '/assets/ui/dice/d12-03.png'],
  ['/assets/ui/dice/d20-01.png', '/assets/ui/dice/d20-02.png', '/assets/ui/dice/d20-03.png'],
];

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function WikiIndex() {
  const navigate = useNavigate();
  const { category } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();

  // Page from URL (persists across navigation)
  const page = parseInt(searchParams.get('page') || '1', 10);
  const setPage = (newPage: number) => {
    if (newPage === 1) {
      searchParams.delete('page');
    } else {
      searchParams.set('page', String(newPage));
    }
    setSearchParams(searchParams, { replace: true });
  };

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ column: 'name', direction: 'asc' });
  const [filters, setFilters] = useState<Record<string, string | null>>({});
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Dice animation state - random dice variant on each page load
  const [diceVariant] = useState(() => Math.floor(Math.random() * DICE_VARIANTS.length));
  const [diceFrame, setDiceFrame] = useState(0);
  const [diceHovered, setDiceHovered] = useState(false);

  const diceFrames = DICE_VARIANTS[diceVariant];

  // Responsive padding (match Progress.tsx)
  const is1440 = useMediaQuery('(min-width: 1440px)');
  const is1280 = useMediaQuery('(min-width: 1280px)');
  const is1024 = useMediaQuery('(min-width: 1024px)');
  const padding = is1440 ? '60px' : is1280 ? '30px' : is1024 ? '24px' : '18px';

  // Dice animation effect
  useEffect(() => {
    if (diceHovered) return;
    const interval = setInterval(() => {
      setDiceFrame(prev => (prev + 1) % diceFrames.length);
    }, 600);
    return () => clearInterval(interval);
  }, [diceHovered, diceFrames.length]);

  // Derive active tab from URL
  const activeTab = categoryToTab(category);
  const activeTabConfig = TABS.find(t => t.id === activeTab) || TABS[0];

  // Get entities for active tab (combine categories, deduplicate by slug)
  const rawEntities = useMemo(() => {
    const categories = activeTabConfig.categories;
    const entities: AnyEntity[] = [];
    for (const cat of categories) {
      entities.push(...getEntitiesByCategory(cat));
    }
    // Deduplicate by slug - prefer pantheon > travelers > wanderers
    const seen = new Map<string, AnyEntity>();
    const priority: Record<string, number> = { pantheon: 3, travelers: 2, wanderers: 1 };
    for (const entity of entities) {
      const existing = seen.get(entity.slug);
      if (!existing || (priority[entity.category] || 0) > (priority[existing.category] || 0)) {
        seen.set(entity.slug, entity);
      }
    }
    return Array.from(seen.values());
  }, [activeTab]);

  // Filter by search and active filters
  const filteredEntities = useMemo(() => {
    let result = rawEntities;

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(e =>
        e.name.toLowerCase().includes(query) ||
        e.slug.includes(query)
      );
    }

    // Apply filters based on active tab
    Object.entries(filters).forEach(([key, value]) => {
      if (!value) return;

      result = result.filter(entity => {
        switch (key) {
          case 'rarity':
            return (entity as Item).rarity === value;
          case 'type':
            if (activeTab === 'items') return (entity as Item).itemType === value;
            if (activeTab === 'enemies') return (entity as Enemy).enemyType === value;
            if (activeTab === 'characters') {
              const typeMap: Record<string, string> = { 'Traveler': 'travelers', 'Wanderer': 'wanderers', 'Pantheon': 'pantheon' };
              return entity.category === typeMap[value];
            }
            return true;
          case 'difficulty':
            return (entity as Domain).difficulty === value;
          case 'location':
            const shop = entity as Shop;
            const isMobile = shop.travelPattern && shop.travelPattern.length > 0;
            return value === 'Mobile' ? isMobile : !isMobile;
          case 'element':
            return (entity as Faction).element === value;
          default:
            return true;
        }
      });
    });

    return result;
  }, [rawEntities, searchQuery, filters, activeTab]);

  // Sort entities
  const sortedEntities = useMemo(() => {
    if (!sortConfig) return filteredEntities;

    return [...filteredEntities].sort((a, b) => {
      const dir = sortConfig.direction === 'asc' ? 1 : -1;

      switch (sortConfig.column) {
        case 'name':
          return a.name.localeCompare(b.name) * dir;
        case 'rarity': {
          const rarityOrder = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Unique'];
          const rarityA = rarityOrder.indexOf((a as Item).rarity || 'Common');
          const rarityB = rarityOrder.indexOf((b as Item).rarity || 'Common');
          return (rarityA - rarityB) * dir;
        }
        case 'level': {
          const levelA = (a as Enemy).level || 0;
          const levelB = (b as Enemy).level || 0;
          return (levelA - levelB) * dir;
        }
        case 'type': {
          const typeA = (a as Item).itemType || (a as Enemy).enemyType || '';
          const typeB = (b as Item).itemType || (b as Enemy).enemyType || '';
          return typeA.localeCompare(typeB) * dir;
        }
        case 'difficulty': {
          const diffOrder = ['Easy', 'Normal', 'Hard', 'Extreme'];
          const diffA = diffOrder.indexOf((a as Domain).difficulty || 'Normal');
          const diffB = diffOrder.indexOf((b as Domain).difficulty || 'Normal');
          return (diffA - diffB) * dir;
        }
        default:
          return 0;
      }
    });
  }, [filteredEntities, sortConfig]);

  // Paginate
  const totalPages = Math.ceil(sortedEntities.length / ITEMS_PER_PAGE);
  const paginatedEntities = sortedEntities.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  // Reset state when tab changes
  useEffect(() => {
    // Clear page from URL
    if (searchParams.has('page')) {
      searchParams.delete('page');
      setSearchParams(searchParams, { replace: true });
    }
    setFilters({});
    setSearchQuery('');
  }, [activeTab]);

  // Reset page when search or filters change
  useEffect(() => {
    if (searchParams.has('page')) {
      searchParams.delete('page');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchQuery, filters]);

  // Handlers
  const handleTabChange = (_: React.SyntheticEvent, newValue: string) => {
    navigate(`/wiki/${newValue}`);
  };

  const handleSort = (column: string) => {
    setSortConfig(prev => {
      if (prev?.column === column) {
        return { column, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { column, direction: 'asc' };
    });
  };

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  const handleRowClick = (entity: AnyEntity) => {
    const returnTo = page > 1 ? `/wiki/${entity.category}?page=${page}` : `/wiki/${entity.category}`;
    navigate(`/wiki/${entity.category}/${entity.slug}`, { state: { returnTo } });
  };

  // Get category counts for tab badges
  const counts = getCategoryCounts();
  const getTabCount = (tabId: TabId) => {
    const tab = TABS.find(t => t.id === tabId);
    if (!tab) return 0;
    return tab.categories.reduce((sum, cat) => sum + (counts[cat] || 0), 0);
  };

  // =============================================================================
  // RENDER HELPERS
  // =============================================================================

  // Common table row styles
  const rowSx = {
    cursor: 'pointer',
    height: 90,
    '& td': { borderColor: tokens.colors.border, py: 2, verticalAlign: 'middle' },
    '&:hover': { bgcolor: tokens.colors.background.elevated },
  };

  const headRowSx = {
    '& th': { borderColor: tokens.colors.border, bgcolor: tokens.colors.background.elevated, height: 48 },
  };

  // Check if any filters are active
  const hasActiveFilters = Object.values(filters).some(v => v !== null && v !== '');

  // Filter dropdowns for current tab
  const renderFilters = () => {
    const tabFilters = FILTER_OPTIONS[activeTab];
    if (!tabFilters) return null;

    const selectSx = {
      fontSize: '0.875rem',
      color: tokens.colors.text.secondary,
      '& .MuiOutlinedInput-notchedOutline': { borderColor: tokens.colors.border },
      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: tokens.colors.text.disabled },
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: tokens.colors.text.secondary },
      '& .MuiSelect-icon': { color: tokens.colors.text.disabled },
    };

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 3, py: 1.5, borderBottom: `1px solid ${tokens.colors.border}` }}>
        <Typography variant="body2" sx={{ color: tokens.colors.text.disabled, mr: 0.5 }}>Filters</Typography>
        {Object.entries(tabFilters).map(([filterKey, config]) => (
          <FormControl key={filterKey} size="small" sx={{ minWidth: 140 }}>
            <Select
              value={filters[filterKey] || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, [filterKey]: e.target.value || null }))}
              displayEmpty
              sx={selectSx}
              MenuProps={{
                PaperProps: {
                  sx: {
                    bgcolor: tokens.colors.background.paper,
                    border: `1px solid ${tokens.colors.border}`,
                    '& .MuiMenuItem-root': {
                      fontSize: '0.875rem',
                      '&:hover': { bgcolor: tokens.colors.background.elevated },
                      '&.Mui-selected': { bgcolor: tokens.colors.background.elevated },
                    },
                  },
                },
              }}
            >
              <MenuItem value="">{config.allLabel}</MenuItem>
              {config.options.map((option) => (
                <MenuItem key={option} value={option}>{option}</MenuItem>
              ))}
            </Select>
          </FormControl>
        ))}
        {hasActiveFilters && (
          <Typography
            component="span"
            onClick={() => setFilters({})}
            sx={{
              color: tokens.colors.text.disabled,
              fontSize: '0.875rem',
              cursor: 'pointer',
              ml: 1,
              '&:hover': { color: tokens.colors.text.secondary },
            }}
          >
            Clear
          </Typography>
        )}
      </Box>
    );
  };

  // =============================================================================
  // RENDER TABLE BASED ON TAB
  // =============================================================================

  // Common header cell style
  const headerCellSx = { color: tokens.colors.text.disabled, fontSize: '0.75rem', py: 1 };

  const renderItemsTable = () => (
    <>
      <TableHead>
        <TableRow sx={headRowSx}>
          <TableCell sx={{ width: COL.icon }}></TableCell>
          <SortableHeader column="name" label="Name" sortConfig={sortConfig} onSort={handleSort} width={COL.name} />
          <SortableHeader column="rarity" label="Rarity" sortConfig={sortConfig} onSort={handleSort} width={COL.col3} />
          <SortableHeader column="type" label="Type" sortConfig={sortConfig} onSort={handleSort} width={COL.col4} />
        </TableRow>
      </TableHead>
      <TableBody>
        {paginatedEntities.map((entity) => {
          const item = entity as Item;
          return (
            <TableRow
              key={entity.slug}
              onClick={() => handleRowClick(entity)}
              sx={rowSx}
            >
              <TableCell>
                <AssetImage src={entity.sprites?.[0] || entity.image || ''} alt={entity.name} category="items" width={48} height={48} fallback="placeholder" sx={{ borderRadius: 0.5 }} />
              </TableCell>
              <TableCell>
                <Typography variant="body2" sx={{ color: tokens.colors.secondary }}>{entity.name}</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" sx={{ color: getRarityColor(item.rarity) }}>{item.rarity || 'Common'}</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" sx={{ color: tokens.colors.text.secondary }}>{item.itemType || '-'}</Typography>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </>
  );

  const renderEnemiesTable = () => (
    <>
      <TableHead>
        <TableRow sx={headRowSx}>
          <TableCell sx={{ width: COL.icon }}></TableCell>
          <SortableHeader column="name" label="Name" sortConfig={sortConfig} onSort={handleSort} width={COL.name} />
          <SortableHeader column="type" label="Rank" sortConfig={sortConfig} onSort={handleSort} width={COL.col3} />
          <SortableHeader column="level" label="Level" sortConfig={sortConfig} onSort={handleSort} width={COL.col4} />
        </TableRow>
      </TableHead>
      <TableBody>
        {paginatedEntities.map((entity) => {
          const enemy = entity as Enemy;
          return (
            <TableRow
              key={entity.slug}
              onClick={() => handleRowClick(entity)}
              sx={rowSx}
            >
              <TableCell>
                <AssetImage src={entity.sprites?.[0] || entity.image || ''} alt={entity.name} category="enemies" width={48} height={48} fallback="placeholder" sx={{ borderRadius: 0.5 }} />
              </TableCell>
              <TableCell>
                <Typography variant="body2" sx={{ color: tokens.colors.secondary }}>{entity.name}</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" sx={{ color: getEnemyTypeColor(enemy.enemyType as 'Normal' | 'Elite' | 'Miniboss' | 'Boss') }}>
                  {enemy.enemyType || 'Normal'}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">{enemy.level || '-'}</Typography>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </>
  );

  const renderDomainsTable = () => (
    <>
      <TableHead>
        <TableRow sx={headRowSx}>
          <TableCell sx={{ width: COL.icon }}></TableCell>
          <SortableHeader column="name" label="Name" sortConfig={sortConfig} onSort={handleSort} width={COL.name} />
          <SortableHeader column="difficulty" label="Difficulty" sortConfig={sortConfig} onSort={handleSort} width={COL.col3} />
          <TableCell sx={{ ...headerCellSx, width: COL.col4 }}>Level</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {paginatedEntities.map((entity) => {
          const domain = entity as Domain;
          return (
            <TableRow
              key={entity.slug}
              onClick={() => handleRowClick(entity)}
              sx={rowSx}
            >
              <TableCell>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    backgroundColor: getElementInfo(domain.element || 'Neutral')?.color || tokens.colors.primary,
                    boxShadow: `0 0 12px ${getElementInfo(domain.element || 'Neutral')?.color || tokens.colors.primary}50`,
                    border: `2px solid ${getElementInfo(domain.element || 'Neutral')?.color || tokens.colors.primary}`,
                  }}
                />
              </TableCell>
              <TableCell>
                <Typography variant="body2" sx={{ color: tokens.colors.secondary }}>{entity.name}</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" sx={{ color: getDifficultyColor(domain.difficulty || 'Normal') }}>
                  {domain.difficulty || 'Normal'}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">{domain.levelRange || '-'}</Typography>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </>
  );

  const renderCharactersTable = () => (
    <>
      <TableHead>
        <TableRow sx={headRowSx}>
          <TableCell sx={{ width: COL.icon }}></TableCell>
          <SortableHeader column="name" label="Name" sortConfig={sortConfig} onSort={handleSort} width={COL.name} />
          <TableCell sx={{ ...headerCellSx, width: COL.col3 }}>Type</TableCell>
          <TableCell sx={{ ...headerCellSx, width: COL.col4 }}>Lucky #</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {paginatedEntities.map((entity) => {
          const traveler = entity as Traveler;
          const pantheonMember = entity as Pantheon;
          const luckyNum = traveler.luckyNumber || pantheonMember.luckyNumber;
          const typeLabel = entity.category === 'travelers' ? 'Traveler' :
                           entity.category === 'wanderers' ? 'Wanderer' :
                           entity.category === 'pantheon' ? 'Pantheon' : '-';

          return (
            <TableRow
              key={`${entity.category}-${entity.slug}`}
              onClick={() => handleRowClick(entity)}
              sx={rowSx}
            >
              <TableCell>
                <AssetImage src={entity.sprites?.[0] || entity.portrait || entity.image || ''} alt={entity.name} category={entity.category as 'travelers' | 'wanderers' | 'pantheon'} width={48} height={48} fallback="placeholder" sx={{ borderRadius: 0.5 }} />
              </TableCell>
              <TableCell>
                <Typography variant="body2" sx={{ color: tokens.colors.secondary }}>{entity.name}</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" sx={{ color: tokens.colors.text.secondary }}>{typeLabel}</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {luckyNum === 7 ? 'ALL' : luckyNum || '-'}
                </Typography>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </>
  );

  const renderShopsTable = () => (
    <>
      <TableHead>
        <TableRow sx={headRowSx}>
          <TableCell sx={{ width: COL.icon }}></TableCell>
          <SortableHeader column="name" label="Name" sortConfig={sortConfig} onSort={handleSort} width={COL.name} />
          <TableCell sx={{ ...headerCellSx, width: COL.col3 }}>Location</TableCell>
          <TableCell sx={{ width: COL.col4 }}></TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {paginatedEntities
          .filter(e => e.category === 'shops')
          .map((entity) => {
            const shop = entity as Shop;
            const isMobile = shop.travelPattern && shop.travelPattern.length > 0;

            return (
              <TableRow
                key={`shop-${entity.slug}`}
                onClick={() => handleRowClick(entity)}
                sx={rowSx}
              >
                <TableCell>
                  <AssetImage src={entity.sprites?.[0] || entity.portrait || entity.image || ''} alt={entity.name} category="shops" width={48} height={48} fallback="placeholder" sx={{ borderRadius: 0.5 }} />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ color: tokens.colors.secondary }}>{entity.name}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ color: isMobile ? tokens.colors.warning : tokens.colors.text.secondary }}>
                    {isMobile ? 'Mobile' : shop.location ? slugToName(shop.location) : 'Fixed'}
                  </Typography>
                </TableCell>
                <TableCell></TableCell>
              </TableRow>
            );
          })}
      </TableBody>
    </>
  );

  const renderTrophiesTable = () => (
    <>
      <TableHead>
        <TableRow sx={headRowSx}>
          <TableCell sx={{ width: COL.icon }}></TableCell>
          <SortableHeader column="name" label="Name" sortConfig={sortConfig} onSort={handleSort} width={COL.name} />
          <SortableHeader column="rarity" label="Rarity" sortConfig={sortConfig} onSort={handleSort} width={COL.col3} />
          <TableCell sx={{ width: COL.col4 }}></TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {paginatedEntities.map((entity) => {
          const trophy = entity as Item;
          return (
            <TableRow
              key={`trophy-${entity.slug}`}
              onClick={() => handleRowClick(entity)}
              sx={rowSx}
            >
              <TableCell>
                <AssetImage src={entity.sprites?.[0] || entity.image || ''} alt={entity.name} category="trophies" width={48} height={48} fallback="placeholder" sx={{ borderRadius: 0.5 }} />
              </TableCell>
              <TableCell>
                <Typography variant="body2" sx={{ color: tokens.colors.secondary }}>{entity.name}</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" sx={{ color: getRarityColor(trophy.rarity) }}>{trophy.rarity || 'Common'}</Typography>
              </TableCell>
              <TableCell></TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </>
  );

  const renderFactionsTable = () => (
    <>
      <TableHead>
        <TableRow sx={headRowSx}>
          <TableCell sx={{ width: COL.icon }}></TableCell>
          <SortableHeader column="name" label="Name" sortConfig={sortConfig} onSort={handleSort} width={COL.name} />
          <TableCell sx={{ ...headerCellSx, width: COL.col3 }}>Element</TableCell>
          <TableCell sx={{ ...headerCellSx, width: COL.col4 }}>Lucky #</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {paginatedEntities.map((entity) => {
          const faction = entity as Faction;
          return (
            <TableRow
              key={`faction-${entity.slug}`}
              onClick={() => handleRowClick(entity)}
              sx={rowSx}
            >
              <TableCell>
                <AssetImage src={entity.sprites?.[0] || entity.image || ''} alt={entity.name} category="factions" width={48} height={48} fallback="placeholder" sx={{ borderRadius: 0.5 }} />
              </TableCell>
              <TableCell>
                <Typography variant="body2" sx={{ color: tokens.colors.secondary }}>{entity.name}</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" sx={{ color: tokens.colors.text.secondary }}>{faction.element || 'Neutral'}</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {faction.luckyNumber === 7 ? 'ALL' : faction.luckyNumber ?? '-'}
                </Typography>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </>
  );

  const renderTableContent = () => {
    switch (activeTab) {
      case 'items': return renderItemsTable();
      case 'enemies': return renderEnemiesTable();
      case 'domains': return renderDomainsTable();
      case 'characters': return renderCharactersTable();
      case 'factions': return renderFactionsTable();
      case 'shops': return renderShopsTable();
      case 'trophies': return renderTrophiesTable();
      default: return renderItemsTable();
    }
  };

  // =============================================================================
  // MAIN RENDER
  // =============================================================================

  return (
    <Box sx={{ p: padding }}>
      {/* Header */}
      <Typography
        variant="h1"
        sx={{
          fontFamily: tokens.fonts.gaming,
          fontSize: '3.5rem',
          textAlign: 'center',
          mb: 4,
        }}
      >
        Diepedia
      </Typography>

      {/* Guest Banner */}
      {!isAuthenticated && (
        <GuestBanner
          variant="info"
          message="Browsing as guest. Sign in to save favorites and sync preferences across devices."
        />
      )}

      {/* Tabs */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{
            '& .MuiTabs-indicator': { display: 'none' },
            '& .MuiTab-root': {
              color: tokens.colors.text.secondary,
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '1rem',
              minHeight: 56,
              px: 3,
              position: 'relative',
              '&.Mui-selected': {
                color: tokens.colors.text.primary,
                fontWeight: 600,
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 4,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 0,
                  height: 0,
                  borderLeft: '6px solid transparent',
                  borderRight: '6px solid transparent',
                  borderTop: `6px solid ${tokens.colors.text.primary}`,
                },
              },
            },
          }}
        >
          {TABS.map((tab) => (
            <Tab
              key={tab.id}
              value={tab.id}
              label={tab.label}
              disableRipple
            />
          ))}
        </Tabs>

        {/* Random Page Dice */}
        <Tooltip title="Visit random page" followCursor>
          <Box
            onMouseEnter={() => setDiceHovered(true)}
            onMouseLeave={() => setDiceHovered(false)}
            onClick={() => {
              const categories: WikiCategory[] = [
                'items', 'enemies', 'domains',
                'travelers', 'wanderers', 'pantheon',
                'factions', 'shops', 'trophies',
              ];
              const randomCategory = categories[Math.floor(Math.random() * categories.length)];
              const entities = getEntitiesByCategory(randomCategory);
              const randomEntity = entities[Math.floor(Math.random() * entities.length)];
              if (randomEntity) {
                navigate(`/wiki/${randomEntity.category}/${randomEntity.slug}`);
              }
            }}
            sx={{
              width: 28,
              height: 28,
              ml: 2,
              cursor: 'pointer',
              opacity: 0.7,
              transition: 'opacity 0.2s, transform 0.2s',
              '&:hover': {
                opacity: 1,
                transform: 'scale(1.1)',
              },
            }}
          >
            <img
              src={diceFrames[diceFrame]}
              alt="Random page"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                imageRendering: 'pixelated',
              }}
            />
          </Box>
        </Tooltip>
      </Box>

      {/* Table Card */}
      <Paper
        sx={{
          bgcolor: tokens.colors.background.paper,
          border: `1px solid ${tokens.colors.border}`,
          borderRadius: '30px',
          overflow: 'hidden',
          mb: 3,
        }}
      >
        {/* Card Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 3,
            py: 2.25,
            borderBottom: `1px solid ${tokens.colors.border}`,
          }}
        >
          <Typography sx={{ fontWeight: 600, fontSize: '1.125rem' }}>
            {activeTabConfig.label} ({sortedEntities.length})
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Paper
              sx={{
                display: 'flex',
                alignItems: 'center',
                px: 1.5,
                py: 0.5,
                bgcolor: 'transparent',
                border: `1px solid ${tokens.colors.border}`,
                borderRadius: '20px',
              }}
            >
              <InputBase
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{
                  flex: 1,
                  color: tokens.colors.text.primary,
                  fontSize: '0.875rem',
                  width: 120,
                  '& input::placeholder': { color: tokens.colors.text.disabled },
                }}
              />
              <SearchIcon sx={{ color: tokens.colors.text.disabled, fontSize: 18 }} />
            </Paper>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <IconButton
                size="small"
                onClick={() => setViewMode('table')}
                sx={{ color: viewMode === 'table' ? tokens.colors.text.primary : tokens.colors.text.disabled }}
              >
                <ViewListIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => setViewMode('grid')}
                sx={{ color: viewMode === 'grid' ? tokens.colors.text.primary : tokens.colors.text.disabled }}
              >
                <GridViewIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        </Box>

        {/* Filters */}
        {renderFilters()}

        {/* Content - Table or Grid */}
        {viewMode === 'table' ? (
          <TableContainer>
            <Table size="small" key={activeTab}>
              {renderTableContent()}
            </Table>
          </TableContainer>
        ) : (
          <Box sx={{ p: 3, bgcolor: tokens.colors.background.default }}>
            <Grid container spacing={2}>
              {paginatedEntities
                .filter(e => activeTabConfig.categories.includes(e.category as WikiCategory))
                .map((entity) => {
                const item = entity as Item;
                const enemy = entity as Enemy;
                const domain = entity as Domain;
                const shop = entity as Shop;

                // Get subtitle based on tab
                let subtitle = '';
                if (activeTab === 'items' || activeTab === 'trophies') {
                  subtitle = item.rarity || 'Common';
                } else if (activeTab === 'enemies') {
                  subtitle = enemy.enemyType || 'Normal';
                } else if (activeTab === 'domains') {
                  subtitle = domain.difficulty || 'Normal';
                } else if (activeTab === 'characters') {
                  subtitle = entity.category === 'travelers' ? 'Traveler' :
                             entity.category === 'wanderers' ? 'Wanderer' : 'Pantheon';
                } else if (activeTab === 'shops') {
                  const isMobile = shop.travelPattern && shop.travelPattern.length > 0;
                  subtitle = isMobile ? 'Mobile' : 'Fixed';
                } else if (activeTab === 'factions') {
                  const faction = entity as Faction;
                  subtitle = faction.element || 'Neutral';
                }

                // Get color for subtitle
                let subtitleColor = tokens.colors.text.secondary;
                if ((activeTab === 'items' || activeTab === 'trophies') && item.rarity) {
                  subtitleColor = getRarityColor(item.rarity);
                } else if (activeTab === 'enemies' && enemy.enemyType) {
                  subtitleColor = getEnemyTypeColor(enemy.enemyType as 'Normal' | 'Elite' | 'Miniboss' | 'Boss');
                } else if (activeTab === 'domains' && domain.difficulty) {
                  subtitleColor = getDifficultyColor(domain.difficulty);
                }

                // Always prefer sprites in grid view
                const isCharacter = activeTab === 'characters';
                const isShop = activeTab === 'shops';
                const imageSrc = entity.sprites?.[0] || entity.portrait || entity.image || '';

                return (
                  <Grid size={{ xs: 6, sm: 4, md: 3 }} key={`grid-${entity.category}-${entity.slug}`}>
                    <Paper
                      component={RouterLink}
                      to={`/wiki/${entity.category}/${entity.slug}`}
                      state={{ returnTo: page > 1 ? `/wiki/${entity.category}?page=${page}` : `/wiki/${entity.category}` }}
                      elevation={0}
                      sx={{
                        p: 2.5,
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        cursor: 'pointer',
                        textDecoration: 'none',
                        color: 'inherit',
                        bgcolor: tokens.colors.background.paper,
                        boxShadow: '0px 3px 1px 0px rgba(0,0,0,0.5)',
                        borderRadius: '20px',
                        textAlign: 'center',
                        transition: 'background-color 0.15s',
                        '&:hover': { bgcolor: tokens.colors.background.elevated },
                      }}
                    >
                      {(isCharacter || isShop) ? (
                        // Character/Shop cards: fixed height container, sprite scales naturally
                        <Box sx={{
                          height: 72,
                          display: 'flex',
                          alignItems: 'flex-end',
                          justifyContent: 'center',
                          mb: 2,
                        }}>
                          <AssetImage
                            src={imageSrc}
                            alt={entity.name}
                            category={entity.category}
                            width="auto"
                            height="100%"
                            fallback="placeholder"
                            sx={{ objectFit: 'contain', maxWidth: '100%' }}
                          />
                        </Box>
                      ) : activeTab === 'domains' ? (
                        // Domain cards: colored circle
                        <Box
                          sx={{
                            width: 64,
                            height: 64,
                            borderRadius: '50%',
                            mx: 'auto',
                            mb: 2,
                            backgroundColor: getElementInfo(domain.element || 'Neutral')?.color || tokens.colors.primary,
                            boxShadow: `0 0 20px ${getElementInfo(domain.element || 'Neutral')?.color || tokens.colors.primary}50`,
                            border: `2px solid ${getElementInfo(domain.element || 'Neutral')?.color || tokens.colors.primary}`,
                          }}
                        />
                      ) : (
                        // Non-character/non-domain cards: fixed size icons
                        <AssetImage
                          src={imageSrc}
                          alt={entity.name}
                          category={entity.category}
                          width={64}
                          height={64}
                          fallback="placeholder"
                          sx={{ display: 'block', mx: 'auto', mb: 2, borderRadius: 1 }}
                        />
                      )}
                      <Typography sx={{ color: tokens.colors.text.primary, fontWeight: 600, fontSize: '0.9rem', mb: 0.5 }}>
                        {entity.name}
                      </Typography>
                      <Typography sx={{ color: subtitleColor, fontSize: '0.75rem', mt: 'auto' }}>
                        {subtitle}
                      </Typography>
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        )}

        {/* Pagination or Count */}
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2, borderTop: `1px solid ${tokens.colors.border}` }}>
          {totalPages > 1 ? (
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              sx={{
                '& .MuiPaginationItem-root': {
                  color: tokens.colors.text.secondary,
                  borderColor: tokens.colors.border,
                  '&.Mui-selected': {
                    bgcolor: tokens.colors.background.elevated,
                    color: tokens.colors.text.primary,
                  },
                },
              }}
            />
          ) : (
            <Typography variant="body2" sx={{ color: tokens.colors.text.disabled }}>
              Showing {sortedEntities.length} of {sortedEntities.length} {activeTabConfig.label}
            </Typography>
          )}
        </Box>
      </Paper>

      {/* Empty state */}
      {paginatedEntities.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" sx={{ color: tokens.colors.text.disabled, mb: 1 }}>
            No results found
          </Typography>
          <Typography variant="body2" sx={{ color: tokens.colors.text.disabled }}>
            Try adjusting your search or browse a different category
          </Typography>
        </Box>
      )}
    </Box>
  );
}
