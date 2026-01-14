import { Box, Typography, ButtonBase, Chip, Tooltip } from '@mui/material';
import {
  ShieldSharp as ShieldIcon,
  BoltSharp as BoltIcon,
  AutoAwesomeSharp as AutoAwesomeIcon,
  FavoriteSharp as FavoriteIcon,
} from '@mui/icons-material';
import { tokens } from '../../../../theme';
import { LOADOUT_PRESETS, type LoadoutPreset } from '../../../../data/loadouts';

// Icon mapping for loadouts
const LOADOUT_ICONS: Record<string, React.ReactNode> = {
  ShieldSharp: <ShieldIcon sx={{ fontSize: 24 }} />,
  BoltSharp: <BoltIcon sx={{ fontSize: 24 }} />,
  AutoAwesomeSharp: <AutoAwesomeIcon sx={{ fontSize: 24 }} />,
  FavoriteSharp: <FavoriteIcon sx={{ fontSize: 24 }} />,
};

// Player stats configuration
const PLAYER_STATS = [
  { id: 'fury', name: 'Fury', icon: '/icons/stat-fury.svg', color: '#ef4444', description: 'Increases damage dealt per throw' },
  { id: 'grit', name: 'Grit', icon: '/icons/stat-grit.svg', color: '#22c55e', description: 'Bonus starting throws' },
  { id: 'resilience', name: 'Resilience', icon: '/icons/stat-resilience.svg', color: '#3b82f6', description: 'Reduces target score requirements' },
  { id: 'essence', name: 'Essence', icon: '/icons/stat-essence.svg', color: '#f59e0b', description: 'Increases gold rewards' },
];

interface BagTabProps {
  isLobby?: boolean;
  selectedLoadout?: string;
  onLoadoutSelect?: (loadoutId: string) => void;
  /** Player stats from the selected loadout */
  playerStats?: Record<string, number>;
}

export function BagTab({ isLobby = false, selectedLoadout, onLoadoutSelect, playerStats }: BagTabProps) {
  // Get stats from selected loadout
  const selectedLoadoutData = LOADOUT_PRESETS.find(l => l.id === selectedLoadout);
  const stats = playerStats || selectedLoadoutData?.statBonus || {};

  return (
    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Player Profile - compact stat display */}
      {!isLobby && (
        <Box
          sx={{
            p: 1.5,
            bgcolor: tokens.colors.background.elevated,
            borderRadius: '12px',
            border: `1px solid ${tokens.colors.border}`,
          }}
        >
          <Typography
            sx={{
              fontSize: '0.65rem',
              color: tokens.colors.text.disabled,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              mb: 1,
            }}
          >
            Profile
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
            {PLAYER_STATS.map((stat) => {
              const value = stats[stat.id] || 0;
              return (
                <Tooltip
                  key={stat.id}
                  title={stat.description}
                  arrow
                  placement="top"
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.75,
                      p: 0.75,
                      bgcolor: 'rgba(255,255,255,0.03)',
                      borderRadius: '8px',
                      cursor: 'help',
                    }}
                  >
                    <Box
                      component="img"
                      src={stat.icon}
                      alt={stat.name}
                      sx={{
                        width: 20,
                        height: 20,
                        filter: 'brightness(0) invert(1)',
                        opacity: value > 0 ? 1 : 0.4,
                      }}
                    />
                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        sx={{
                          fontSize: '0.65rem',
                          color: tokens.colors.text.disabled,
                          lineHeight: 1,
                        }}
                      >
                        {stat.name}
                      </Typography>
                      <Typography
                        sx={{
                        fontFamily: tokens.fonts.gaming,
                        fontSize: '0.85rem',
                        color: value > 0 ? stat.color : tokens.colors.text.disabled,
                        fontWeight: 600,
                        lineHeight: 1.2,
                      }}
                    >
                      {value}
                    </Typography>
                  </Box>
                </Box>
              </Tooltip>
              );
            })}
          </Box>
        </Box>
      )}

      {/* Header */}
      <Typography
        sx={{
          fontSize: '0.75rem',
          color: tokens.colors.text.secondary,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        {isLobby ? 'Select' : 'Current'} <Box component="span" sx={{ color: tokens.colors.text.primary, fontWeight: 600 }}>Loadout</Box>
      </Typography>

      {/* Class Cards */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {LOADOUT_PRESETS.map((loadout) => (
          <LoadoutCard
            key={loadout.id}
            loadout={loadout}
            selected={selectedLoadout === loadout.id}
            expanded={selectedLoadout === loadout.id}
            onClick={() => onLoadoutSelect?.(loadout.id)}
            isLobby={isLobby}
          />
        ))}
      </Box>
    </Box>
  );
}

// Loadout Card Component - shows class with expandable items
interface LoadoutCardProps {
  loadout: LoadoutPreset;
  selected: boolean;
  expanded: boolean;
  onClick: () => void;
  isLobby: boolean;
}

function LoadoutCard({ loadout, selected, expanded, onClick, isLobby }: LoadoutCardProps) {
  const borderColor = selected ? tokens.colors.primary : tokens.colors.border;

  return (
    <ButtonBase
      onClick={onClick}
      disabled={!isLobby}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        p: 0,
        borderRadius: '12px',
        bgcolor: selected ? `${tokens.colors.primary}12` : tokens.colors.background.elevated,
        border: `2px solid ${borderColor}`,
        transition: 'all 0.15s ease',
        textAlign: 'left',
        overflow: 'hidden',
        '&:hover': isLobby ? {
          borderColor: tokens.colors.primary,
          bgcolor: `${tokens.colors.primary}08`,
        } : {},
      }}
    >
      {/* Main row - icon, name, stats */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          p: 1.5,
          width: '100%',
        }}
      >
        {/* Class icon */}
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: '10px',
            bgcolor: selected ? `${tokens.colors.primary}25` : `${tokens.colors.text.secondary}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: selected ? tokens.colors.primary : tokens.colors.text.secondary,
            flexShrink: 0,
          }}
        >
          {LOADOUT_ICONS[loadout.icon] || <ShieldIcon sx={{ fontSize: 24 }} />}
        </Box>

        {/* Class info */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            sx={{
              fontFamily: tokens.fonts.gaming,
              fontWeight: 700,
              fontSize: '1rem',
              color: tokens.colors.text.primary,
              mb: 0.25,
            }}
          >
            {loadout.name}
          </Typography>
          <Typography
            sx={{
              fontSize: '0.75rem',
              color: tokens.colors.text.disabled,
              mb: 0.5,
            }}
          >
            {loadout.playstyle}
          </Typography>
          {/* Stat bonus chips */}
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            {Object.entries(loadout.statBonus).map(([stat, value]) => (
              <Chip
                key={stat}
                label={`+${value} ${stat}`}
                size="small"
                sx={{
                  height: 18,
                  fontSize: '0.6rem',
                  bgcolor: selected ? `${tokens.colors.success}20` : `${tokens.colors.text.secondary}15`,
                  color: selected ? tokens.colors.success : tokens.colors.text.secondary,
                  textTransform: 'capitalize',
                  '& .MuiChip-label': { px: 0.75 },
                }}
              />
            ))}
          </Box>
        </Box>
      </Box>

      {/* Expanded items section */}
      {expanded && (
        <Box
          sx={{
            borderTop: `1px solid ${tokens.colors.border}`,
            p: 1.5,
            bgcolor: 'rgba(0,0,0,0.2)',
          }}
        >
          <Typography
            sx={{
              fontSize: '0.65rem',
              color: tokens.colors.text.disabled,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              mb: 1,
            }}
          >
            Starting Items ({loadout.items.length})
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {loadout.items.map((itemSlug) => (
              <Chip
                key={itemSlug}
                label={formatItemName(itemSlug)}
                size="small"
                sx={{
                  height: 22,
                  fontSize: '0.7rem',
                  bgcolor: tokens.colors.background.elevated,
                  color: tokens.colors.text.primary,
                  border: `1px solid ${tokens.colors.border}`,
                  '& .MuiChip-label': { px: 1 },
                }}
              />
            ))}
          </Box>
        </Box>
      )}
    </ButtonBase>
  );
}

// Format item slug to display name (e.g., "iron-sword" -> "Iron Sword")
function formatItemName(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
