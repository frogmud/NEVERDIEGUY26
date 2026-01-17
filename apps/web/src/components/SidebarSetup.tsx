import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  Tabs,
  Tab,
  Collapse,
  IconButton,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import Inventory2SharpIcon from '@mui/icons-material/Inventory2Sharp';
import HistorySharpIcon from '@mui/icons-material/HistorySharp';
import AddSharpIcon from '@mui/icons-material/AddSharp';
import AutoAwesomeSharpIcon from '@mui/icons-material/AutoAwesomeSharp';
import EmojiEventsSharpIcon from '@mui/icons-material/EmojiEventsSharp';
import CloseSharpIcon from '@mui/icons-material/CloseSharp';
import BugReportSharpIcon from '@mui/icons-material/BugReportSharp';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CasinoSharpIcon from '@mui/icons-material/CasinoSharp';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ShieldSharpIcon from '@mui/icons-material/ShieldSharp';
import BoltSharpIcon from '@mui/icons-material/BoltSharp';
import FavoriteSharpIcon from '@mui/icons-material/FavoriteSharp';
import { tokens } from '../theme';
import type { GameState, ProtocolRoll } from '../games/meteor/gameConfig';
import type { GameConfig, GameMode } from '../games/meteor/components';
import { getThreadSnapshot, type ThreadSnapshot } from '../state/threadSelectors';
import { createSeededRng, generateThreadId } from '../data/pools';
import { travelers } from '../data/wiki/entities/travelers';
import { LOADOUT_PRESETS, DEFAULT_LOADOUT_ID, type LoadoutPreset } from '../data/loadouts';

// Thread setup step - simplified: just pick traveler and go
type ThreadSetupStep = 'select' | 'ready';

// Extended config with thread identity
export interface ThreadConfig extends GameConfig {
  threadId: string;
  protocolRoll: ProtocolRoll;
  selectedTraveler: string;
  selectedLoadout: string;
  startingItems: string[];
}

interface SidebarSetupProps {
  onStart: (config: ThreadConfig) => void;
  gameState?: GameState; // Optional: pass game state for dev drawer
}

// Lucky number to die mapping for display
const LUCKY_NUMBER_DIE: Record<number, string> = {
  1: 'd4',
  2: 'd6',
  3: 'd6',
  4: 'd10',
  5: 'd12',
  6: 'd20',
  7: 'ALL', // Special: Boots
};

// Gaming font style
const gamingFont = { fontFamily: tokens.fonts.gaming };

// Inventory item type
interface InventoryItem {
  id: string;
  name: string;
  rarity: string;
  type: 'dice' | 'accessory' | 'material' | 'consumable';
  quantity: number;
  equipped: boolean;
}

// Initial mock inventory items for sidebar
const INITIAL_INVENTORY: InventoryItem[] = [
  { id: '1', name: 'Golden Dice', rarity: 'legendary', type: 'dice', quantity: 1, equipped: true },
  { id: '2', name: 'Meteor Dice', rarity: 'rare', type: 'dice', quantity: 1, equipped: false },
  { id: '3', name: 'Lucky Charm', rarity: 'uncommon', type: 'accessory', quantity: 1, equipped: true },
  { id: '4', name: 'Fire Essence', rarity: 'rare', type: 'material', quantity: 15, equipped: false },
  { id: '5', name: 'Health Potion', rarity: 'common', type: 'consumable', quantity: 42, equipped: false },
  { id: '6', name: 'Void Crystal', rarity: 'epic', type: 'material', quantity: 3, equipped: false },
  { id: '7', name: 'XP Boost', rarity: 'rare', type: 'consumable', quantity: 5, equipped: false },
  { id: '8', name: 'Phoenix Feather', rarity: 'legendary', type: 'material', quantity: 1, equipped: false },
];

// Mock run history
const runHistory = [
  { id: '1', domain: 'Earth', mode: 'Normal', score: 12450, result: 'win', date: '2h ago', duration: '14:32' },
  { id: '2', domain: 'Infernus', mode: 'Hard', score: 8920, result: 'loss', date: '5h ago', duration: '11:45' },
  { id: '3', domain: 'Frost Reach', mode: 'Normal', score: 15200, result: 'win', date: '1d ago', duration: '18:21' },
  { id: '4', domain: 'Earth', mode: 'Endless', score: 45600, result: 'loss', date: '1d ago', duration: '42:15' },
  { id: '5', domain: 'Aberrant', mode: 'Normal', score: 9800, result: 'loss', date: '2d ago', duration: '12:08' },
  { id: '6', domain: 'Shadow Keep', mode: 'Boss Rush', score: 22100, result: 'win', date: '3d ago', duration: '25:44' },
];

const rarityConfig: Record<string, { color: string; label: string }> = {
  common: { color: tokens.colors.text.secondary, label: 'Common' },
  uncommon: { color: tokens.colors.success, label: 'Uncommon' },
  rare: { color: tokens.colors.secondary, label: 'Rare' },
  epic: { color: '#a855f7', label: 'Epic' },
  legendary: { color: tokens.colors.warning, label: 'Legendary' },
};

type SidebarTab = 'new-game' | 'inventory' | 'history';

// Compact inventory item for sidebar
function SidebarInventoryItem({ item, onClick }: { item: InventoryItem; onClick: () => void }) {
  const rarity = rarityConfig[item.rarity];

  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        p: 1,
        borderRadius: 1,
        bgcolor: tokens.colors.background.elevated,
        border: `1px solid ${tokens.colors.border}`,
        cursor: 'pointer',
        transition: 'all 0.15s',
        '&:hover': {
          borderColor: rarity.color,
          bgcolor: `${rarity.color}10`,
        },
      }}
    >
      {/* Item icon */}
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: 1,
          bgcolor: `${rarity.color}20`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: `1px solid ${rarity.color}40`,
          flexShrink: 0,
        }}
      >
        <AutoAwesomeSharpIcon sx={{ fontSize: 16, color: rarity.color }} />
      </Box>

      {/* Item info */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="caption"
          sx={{
            fontWeight: 600,
            display: 'block',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontSize: '0.7rem',
          }}
        >
          {item.name}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: rarity.color,
            fontSize: '0.6rem',
            textTransform: 'capitalize',
          }}
        >
          {item.rarity}
        </Typography>
      </Box>

      {/* Quantity or equipped badge */}
      {item.equipped ? (
        <Chip
          label="E"
          size="small"
          sx={{
            height: 18,
            minWidth: 18,
            fontSize: '0.55rem',
            bgcolor: tokens.colors.success,
            '& .MuiChip-label': { px: 0.5 },
          }}
        />
      ) : item.quantity > 1 ? (
        <Typography variant="caption" sx={{ color: tokens.colors.text.disabled, fontSize: '0.65rem' }}>
          x{item.quantity}
        </Typography>
      ) : null}
    </Box>
  );
}

// Thread Snapshot Dev Drawer (dev only)
function ThreadSnapshotDrawer({ snapshot }: { snapshot: ThreadSnapshot }) {
  return (
    <Box
      sx={{
        p: 1,
        bgcolor: 'rgba(0,0,0,0.5)',
        borderRadius: 1,
        fontFamily: 'monospace',
        fontSize: '0.55rem',
        color: tokens.colors.text.disabled,
        '& > div': {
          display: 'flex',
          justifyContent: 'space-between',
          borderBottom: `1px solid ${tokens.colors.border}`,
          py: 0.25,
          '&:last-child': { borderBottom: 'none' },
        },
        '& .label': {
          color: tokens.colors.text.secondary,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        },
        '& .value': {
          color: tokens.colors.secondary,
          fontWeight: 600,
        },
      }}
    >
      <div>
        <span className="label">Thread ID</span>
        <span className="value">{snapshot.threadId || '---'}</span>
      </div>
      <div>
        <span className="label">Phase</span>
        <span className="value">{snapshot.phase}</span>
      </div>
      <div>
        <span className="label">Protocol</span>
        <span className="value">
          {snapshot.protocolRoll
            ? `D${snapshot.protocolRoll.domain}/M${snapshot.protocolRoll.modifier}/S${snapshot.protocolRoll.sponsor}`
            : '---'}
        </span>
      </div>
      <div>
        <span className="label">Tier</span>
        <span className="value">{snapshot.tier}</span>
      </div>
      <div>
        <span className="label">Domain/Room</span>
        <span className="value">{snapshot.currentDomain}/{snapshot.currentEvent}</span>
      </div>
      <div>
        <span className="label">Rooms Cleared</span>
        <span className="value">{snapshot.roomsCleared}</span>
      </div>
      <div>
        <span className="label">Gold</span>
        <span className="value" style={{ color: tokens.colors.warning }}>{snapshot.gold}</span>
      </div>
      <div>
        <span className="label">Integrity</span>
        <span
          className="value"
          style={{
            color: snapshot.integrity > 60
              ? tokens.colors.success
              : snapshot.integrity > 30
              ? tokens.colors.warning
              : tokens.colors.error,
          }}
        >
          {snapshot.integrity}%
        </span>
      </div>
      <div>
        <span className="label">Favor/Calm/Heat</span>
        <span className="value">{snapshot.favorTokens}/{snapshot.calmBonus}/{snapshot.heat}</span>
      </div>
      <div>
        <span className="label">Ledger Events</span>
        <span className="value">{snapshot.ledgerLength}</span>
      </div>
    </Box>
  );
}

// Traveler Selection Card
function TravelerCard({
  traveler,
  selected,
  synergy,
  onClick,
}: {
  traveler: typeof travelers[0];
  selected: boolean;
  synergy: 'strong' | 'weak' | 'none';
  onClick: () => void;
}) {
  const synergyColors = {
    strong: tokens.colors.success,
    weak: tokens.colors.warning,
    none: tokens.colors.text.disabled,
  };
  const synergyColor = synergyColors[synergy];
  const borderColor = selected ? tokens.colors.primary : synergy === 'strong' ? tokens.colors.success : tokens.colors.border;

  return (
    <Box
      onClick={onClick}
      sx={{
        p: 1,
        borderRadius: 1,
        bgcolor: selected ? `${tokens.colors.primary}15` : tokens.colors.background.elevated,
        border: `1px solid ${borderColor}`,
        cursor: 'pointer',
        transition: 'all 0.15s',
        '&:hover': {
          borderColor: tokens.colors.primary,
          bgcolor: `${tokens.colors.primary}10`,
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {/* Traveler icon placeholder */}
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: 1,
            bgcolor: `${tokens.colors.primary}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.8rem',
            flexShrink: 0,
          }}
        >
          {traveler.name.charAt(0)}
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 600,
                fontSize: '0.7rem',
                color: selected ? tokens.colors.primary : tokens.colors.text.primary,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {traveler.name}
            </Typography>
            {selected && (
              <CheckCircleOutlineIcon sx={{ fontSize: 14, color: tokens.colors.primary }} />
            )}
          </Box>

          {/* Lucky number + synergy indicator */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Chip
              label={`${LUCKY_NUMBER_DIE[traveler.luckyNumber ?? 0] ?? '?'} #${traveler.luckyNumber ?? '?'}`}
              size="small"
              sx={{
                height: 16,
                fontSize: '0.5rem',
                bgcolor: `${synergyColor}20`,
                color: synergyColor,
                border: `1px solid ${synergyColor}40`,
                '& .MuiChip-label': { px: 0.5 },
              }}
            />
            {synergy === 'strong' && (
              <Typography sx={{ fontSize: '0.5rem', color: tokens.colors.success }}>
                SYNERGY
              </Typography>
            )}
          </Box>
        </Box>
      </Box>

      {/* Play style */}
      <Typography
        variant="caption"
        sx={{
          color: tokens.colors.text.disabled,
          fontSize: '0.5rem',
          display: 'block',
          mt: 0.5,
        }}
      >
        {traveler.playStyle} | {traveler.origin}
      </Typography>
    </Box>
  );
}

// Icon mapping for loadouts
const LOADOUT_ICONS: Record<string, React.ReactNode> = {
  ShieldSharp: <ShieldSharpIcon sx={{ fontSize: 18 }} />,
  BoltSharp: <BoltSharpIcon sx={{ fontSize: 18 }} />,
  AutoAwesomeSharp: <AutoAwesomeSharpIcon sx={{ fontSize: 18 }} />,
  FavoriteSharp: <FavoriteSharpIcon sx={{ fontSize: 18 }} />,
};

// Loadout Selection Card
function LoadoutCard({
  loadout,
  selected,
  onClick,
}: {
  loadout: LoadoutPreset;
  selected: boolean;
  onClick: () => void;
}) {
  const borderColor = selected ? tokens.colors.primary : tokens.colors.border;

  return (
    <Box
      onClick={onClick}
      sx={{
        p: 1.5,
        borderRadius: 1,
        bgcolor: selected ? `${tokens.colors.primary}15` : tokens.colors.background.elevated,
        border: `2px solid ${borderColor}`,
        cursor: 'pointer',
        transition: 'all 0.15s',
        '&:hover': {
          borderColor: tokens.colors.primary,
          bgcolor: `${tokens.colors.primary}10`,
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        {/* Loadout icon */}
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 1,
            bgcolor: selected ? `${tokens.colors.primary}30` : `${tokens.colors.text.secondary}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: selected ? tokens.colors.primary : tokens.colors.text.secondary,
            flexShrink: 0,
          }}
        >
          {LOADOUT_ICONS[loadout.icon] || <ShieldSharpIcon sx={{ fontSize: 18 }} />}
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: '0.8rem',
                color: selected ? tokens.colors.primary : tokens.colors.text.primary,
                ...gamingFont,
              }}
            >
              {loadout.name}
            </Typography>
            {selected && (
              <CheckCircleOutlineIcon sx={{ fontSize: 16, color: tokens.colors.primary }} />
            )}
          </Box>

          {/* Playstyle tag */}
          <Typography
            sx={{
              fontSize: '0.6rem',
              color: tokens.colors.text.disabled,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {loadout.playstyle}
          </Typography>
        </Box>
      </Box>

      {/* Description */}
      <Typography
        variant="caption"
        sx={{
          color: tokens.colors.text.secondary,
          fontSize: '0.65rem',
          display: 'block',
          mt: 1,
        }}
      >
        {loadout.description}
      </Typography>

      {/* Stat bonus chips */}
      <Box sx={{ display: 'flex', gap: 0.5, mt: 1, flexWrap: 'wrap' }}>
        {Object.entries(loadout.statBonus).map(([stat, value]) => (
          <Chip
            key={stat}
            label={`+${value} ${stat}`}
            size="small"
            sx={{
              height: 18,
              fontSize: '0.5rem',
              bgcolor: `${tokens.colors.secondary}20`,
              color: tokens.colors.secondary,
              border: `1px solid ${tokens.colors.secondary}30`,
              textTransform: 'capitalize',
              '& .MuiChip-label': { px: 0.5 },
            }}
          />
        ))}
      </Box>

      {/* Starting items count */}
      <Typography
        variant="caption"
        sx={{
          color: tokens.colors.text.disabled,
          fontSize: '0.5rem',
          display: 'block',
          mt: 0.75,
        }}
      >
        {loadout.items.length} starting items
      </Typography>
    </Box>
  );
}

// Run history item
function RunHistoryItem({ run }: { run: typeof runHistory[0] }) {
  const isWin = run.result === 'win';

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        p: 1,
        borderRadius: 1,
        bgcolor: tokens.colors.background.elevated,
        border: `1px solid ${tokens.colors.border}`,
        cursor: 'pointer',
        transition: 'all 0.15s',
        '&:hover': {
          borderColor: tokens.colors.text.secondary,
          bgcolor: 'rgba(255,255,255,0.03)',
        },
      }}
    >
      {/* Result icon */}
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: 1,
          bgcolor: isWin ? `${tokens.colors.success}20` : `${tokens.colors.error}20`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: `1px solid ${isWin ? tokens.colors.success : tokens.colors.error}40`,
          flexShrink: 0,
        }}
      >
        {isWin ? (
          <EmojiEventsSharpIcon sx={{ fontSize: 16, color: tokens.colors.success }} />
        ) : (
          <CloseSharpIcon sx={{ fontSize: 16, color: tokens.colors.error }} />
        )}
      </Box>

      {/* Run info */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="caption"
          sx={{
            fontWeight: 600,
            display: 'block',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontSize: '0.7rem',
          }}
        >
          {run.domain}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: tokens.colors.text.disabled,
            fontSize: '0.6rem',
          }}
        >
          {run.mode} · {run.duration}
        </Typography>
      </Box>

      {/* Score and date */}
      <Box sx={{ textAlign: 'right' }}>
        <Typography
          variant="caption"
          sx={{
            fontWeight: 600,
            display: 'block',
            fontSize: '0.7rem',
            color: isWin ? tokens.colors.success : tokens.colors.text.primary,
            ...gamingFont,
          }}
        >
          {run.score.toLocaleString()}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: tokens.colors.text.disabled,
            fontSize: '0.55rem',
          }}
        >
          {run.date}
        </Typography>
      </Box>
    </Box>
  );
}

// Check if dev mode (only show dev drawer in development)
const isDev = import.meta.env.DEV;

export function SidebarSetup({ onStart, gameState }: SidebarSetupProps) {
  const [activeTab, setActiveTab] = useState<SidebarTab>('new-game');
  const [inventoryFilter, setInventoryFilter] = useState<string>('all');
  const [devDrawerOpen, setDevDrawerOpen] = useState(false);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>(INITIAL_INVENTORY);

  // Handle inventory item click - use consumables, toggle equip for others
  const handleItemClick = (item: InventoryItem) => {
    if (item.type === 'consumable') {
      // Use consumable immediately
      if (item.quantity <= 0) return;
      setInventoryItems((prev) =>
        prev
          .map((i) => (i.id === item.id ? { ...i, quantity: i.quantity - 1 } : i))
          .filter((i) => i.quantity > 0)
      );
      return;
    }
    // Toggle equipped state for equipment/accessories/dice
    setInventoryItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, equipped: !i.equipped } : i))
    );
  };

  // Simplified thread setup - traveler and loadout selection
  const [selectedTraveler, setSelectedTraveler] = useState<string>('never-die-guy');
  const [showTravelerPicker, setShowTravelerPicker] = useState(false);
  const [selectedLoadout, setSelectedLoadout] = useState<string>(DEFAULT_LOADOUT_ID);
  const [showLoadoutPicker, setShowLoadoutPicker] = useState(false);

  // Get thread snapshot if game state is available
  const threadSnapshot = gameState ? getThreadSnapshot(gameState) : null;

  // Get selected traveler data
  const selectedTravelerData = travelers.find((t) => t.slug === selectedTraveler);

  // Get selected loadout data
  const selectedLoadoutData = LOADOUT_PRESETS.find((l) => l.id === selectedLoadout);

  // Start immediately - no Protocol Roll ceremony
  // Protocol will be derived from first combat dice selection
  const handleStart = () => {
    const threadId = generateThreadId();

    // Generate a minimal protocol roll for backward compatibility
    // This will be overridden by first combat dice selection
    const rng = createSeededRng(threadId);
    const roll: ProtocolRoll = {
      domain: 1, // Default - will be determined by zone selection
      modifier: rng.roll('protocol:modifier', 6),
      sponsor: rng.roll('protocol:sponsor', 6),
    };

    const loadout = LOADOUT_PRESETS.find((l) => l.id === selectedLoadout);
    const config: ThreadConfig = {
      domain: roll.domain,
      mode: 'normal' as GameMode,
      modifiers: { permadeath: true, extraTribute: false, luckyStart: false },
      threadId,
      protocolRoll: roll,
      selectedTraveler,
      selectedLoadout,
      startingItems: loadout?.items || [],
    };
    onStart(config);
  };

  const filteredInventoryItems = inventoryFilter === 'all'
    ? inventoryItems
    : inventoryItems.filter((item) => item.type === inventoryFilter);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Tab Navigation */}
      <Tabs
        value={activeTab}
        onChange={(_, v) => setActiveTab(v)}
        variant="fullWidth"
        sx={{
          minHeight: 40,
          borderBottom: `1px solid ${tokens.colors.border}`,
          '& .MuiTab-root': {
            minHeight: 40,
            py: 0,
            px: 1,
            fontSize: '0.65rem',
            textTransform: 'none',
            color: tokens.colors.text.disabled,
            ...gamingFont,
            '&.Mui-selected': {
              color: '#fff',
            },
          },
          '& .MuiTabs-indicator': {
            bgcolor: '#fff',
          },
        }}
      >
        <Tab
          value="new-game"
          icon={<AddSharpIcon sx={{ fontSize: 16 }} />}
          iconPosition="start"
          label="New"
        />
        <Tab
          value="inventory"
          icon={<Inventory2SharpIcon sx={{ fontSize: 16 }} />}
          iconPosition="start"
          label="Items"
        />
        <Tab
          value="history"
          icon={<HistorySharpIcon sx={{ fontSize: 16 }} />}
          iconPosition="start"
          label="History"
        />
      </Tabs>

      {/* Tab Content */}
      {activeTab === 'new-game' && (
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Selected Traveler Display */}
          <Box
            onClick={() => {
              setShowTravelerPicker(!showTravelerPicker);
              setShowLoadoutPicker(false);
            }}
            sx={{
              p: 1.5,
              borderBottom: `1px solid ${tokens.colors.border}`,
              cursor: 'pointer',
              bgcolor: showTravelerPicker ? tokens.colors.background.elevated : 'transparent',
              transition: 'all 0.15s',
              '&:hover': {
                bgcolor: tokens.colors.background.elevated,
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {/* Traveler icon */}
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 1,
                    bgcolor: `${tokens.colors.primary}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1rem',
                    border: `1px solid ${tokens.colors.primary}40`,
                  }}
                >
                  {selectedTravelerData?.name.charAt(0) || 'N'}
                </Box>
                <Box>
                  <Typography
                    sx={{
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      color: tokens.colors.text.primary,
                    }}
                  >
                    {selectedTravelerData?.name || 'Never Die Guy'}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Chip
                      label={`${LUCKY_NUMBER_DIE[selectedTravelerData?.luckyNumber ?? 0] ?? '?'} #${selectedTravelerData?.luckyNumber ?? '?'}`}
                      size="small"
                      sx={{
                        height: 16,
                        fontSize: '0.5rem',
                        bgcolor: `${tokens.colors.secondary}20`,
                        color: tokens.colors.secondary,
                        '& .MuiChip-label': { px: 0.5 },
                      }}
                    />
                    <Typography sx={{ fontSize: '0.55rem', color: tokens.colors.text.disabled }}>
                      {selectedTravelerData?.playStyle}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <IconButton size="small" sx={{ p: 0.5 }}>
                {showTravelerPicker ? (
                  <ExpandLessIcon sx={{ fontSize: 20, color: tokens.colors.text.secondary }} />
                ) : (
                  <ExpandMoreIcon sx={{ fontSize: 20, color: tokens.colors.text.secondary }} />
                )}
              </IconButton>
            </Box>
          </Box>

          {/* Traveler Picker (collapsible) */}
          <Collapse in={showTravelerPicker}>
            <Box sx={{ p: 1, maxHeight: 300, overflow: 'auto' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                {travelers.map((traveler) => (
                  <TravelerCard
                    key={traveler.slug}
                    traveler={traveler}
                    selected={selectedTraveler === traveler.slug}
                    synergy="none"
                    onClick={() => {
                      setSelectedTraveler(traveler.slug);
                      setShowTravelerPicker(false);
                    }}
                  />
                ))}
              </Box>
            </Box>
          </Collapse>

          {/* Selected Loadout Display */}
          <Box
            onClick={() => {
              setShowLoadoutPicker(!showLoadoutPicker);
              setShowTravelerPicker(false);
            }}
            sx={{
              p: 1.5,
              borderBottom: `1px solid ${tokens.colors.border}`,
              cursor: 'pointer',
              bgcolor: showLoadoutPicker ? tokens.colors.background.elevated : 'transparent',
              transition: 'all 0.15s',
              '&:hover': {
                bgcolor: tokens.colors.background.elevated,
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {/* Loadout icon */}
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 1,
                    bgcolor: `${tokens.colors.secondary}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: `1px solid ${tokens.colors.secondary}40`,
                    color: tokens.colors.secondary,
                  }}
                >
                  {selectedLoadoutData && LOADOUT_ICONS[selectedLoadoutData.icon]}
                </Box>
                <Box>
                  <Typography
                    sx={{
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      color: tokens.colors.text.primary,
                    }}
                  >
                    {selectedLoadoutData?.name || 'Survivor'}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Typography sx={{ fontSize: '0.55rem', color: tokens.colors.text.disabled }}>
                      {selectedLoadoutData?.playstyle}
                    </Typography>
                    <Typography sx={{ fontSize: '0.5rem', color: tokens.colors.secondary }}>
                      ({selectedLoadoutData?.items.length || 0} items)
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <IconButton size="small" sx={{ p: 0.5 }}>
                {showLoadoutPicker ? (
                  <ExpandLessIcon sx={{ fontSize: 20, color: tokens.colors.text.secondary }} />
                ) : (
                  <ExpandMoreIcon sx={{ fontSize: 20, color: tokens.colors.text.secondary }} />
                )}
              </IconButton>
            </Box>
          </Box>

          {/* Loadout Picker (collapsible) */}
          <Collapse in={showLoadoutPicker}>
            <Box sx={{ p: 1, maxHeight: 400, overflow: 'auto' }}>
              <Typography
                variant="caption"
                sx={{
                  color: tokens.colors.text.disabled,
                  fontSize: '0.55rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  display: 'block',
                  mb: 1,
                }}
              >
                Choose Your Loadout
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {LOADOUT_PRESETS.map((loadout) => (
                  <LoadoutCard
                    key={loadout.id}
                    loadout={loadout}
                    selected={selectedLoadout === loadout.id}
                    onClick={() => {
                      setSelectedLoadout(loadout.id);
                      setShowLoadoutPicker(false);
                    }}
                  />
                ))}
              </Box>
            </Box>
          </Collapse>

          {/* Main content area - Ready to play */}
          {!showTravelerPicker && !showLoadoutPicker && (
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', p: 2 }}>
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <CasinoSharpIcon sx={{ fontSize: 56, color: tokens.colors.primary, mb: 1.5 }} />
                <Typography
                  variant="body2"
                  sx={{
                    color: tokens.colors.text.primary,
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    mb: 0.5,
                  }}
                >
                  Ready to Play
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: tokens.colors.text.disabled,
                    fontSize: '0.65rem',
                    display: 'block',
                  }}
                >
                  Select a zone on the globe to begin
                </Typography>
              </Box>

              <Button
                variant="contained"
                fullWidth
                startIcon={<PlayArrowIcon />}
                onClick={handleStart}
                sx={{
                  bgcolor: tokens.colors.primary,
                  color: '#fff',
                  fontWeight: 700,
                  py: 1.5,
                  ...gamingFont,
                  fontSize: '0.85rem',
                  '&:hover': { bgcolor: tokens.colors.primary, filter: 'brightness(1.1)' },
                }}
              >
                START
              </Button>
            </Box>
          )}
        </Box>
      )}

      {activeTab === 'inventory' && (
        <>
          {/* Filter chips */}
          <Box
            sx={{
              p: 1,
              borderBottom: `1px solid ${tokens.colors.border}`,
              display: 'flex',
              gap: 0.5,
              flexWrap: 'wrap',
            }}
          >
            {['all', 'dice', 'consumable', 'material'].map((filter) => (
              <Chip
                key={filter}
                label={filter.charAt(0).toUpperCase() + filter.slice(1)}
                size="small"
                onClick={() => setInventoryFilter(filter)}
                sx={{
                  height: 22,
                  fontSize: '0.6rem',
                  bgcolor: inventoryFilter === filter ? `${tokens.colors.primary}20` : tokens.colors.background.elevated,
                  color: inventoryFilter === filter ? tokens.colors.primary : tokens.colors.text.secondary,
                  borderColor: inventoryFilter === filter ? tokens.colors.primary : tokens.colors.border,
                  border: '1px solid',
                  '&:hover': {
                    bgcolor: `${tokens.colors.primary}15`,
                  },
                }}
              />
            ))}
          </Box>

          {/* Inventory items list */}
          <Box sx={{ flex: 1, overflow: 'auto', p: 1, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
            {filteredInventoryItems.length > 0 ? (
              filteredInventoryItems.map((item) => (
                <SidebarInventoryItem
                  key={item.id}
                  item={item}
                  onClick={() => handleItemClick(item)}
                />
              ))
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="caption" sx={{ color: tokens.colors.text.disabled }}>
                  No items in this category
                </Typography>
              </Box>
            )}
          </Box>

          {/* Stats footer */}
          <Box
            sx={{
              p: 1.5,
              borderTop: `1px solid ${tokens.colors.border}`,
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <Typography variant="caption" sx={{ color: tokens.colors.text.disabled, fontSize: '0.6rem' }}>
              {inventoryItems.length} items
            </Typography>
            <Typography variant="caption" sx={{ color: tokens.colors.text.disabled, fontSize: '0.6rem' }}>
              {inventoryItems.filter((i) => i.equipped).length} equipped
            </Typography>
          </Box>
        </>
      )}

      {activeTab === 'history' && (
        <>
          {/* Stats summary */}
          <Box
            sx={{
              p: 1.5,
              borderBottom: `1px solid ${tokens.colors.border}`,
              display: 'flex',
              gap: 2,
              justifyContent: 'center',
            }}
          >
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="caption" sx={{ color: tokens.colors.text.disabled, fontSize: '0.55rem', display: 'block' }}>
                Wins
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, color: tokens.colors.success, ...gamingFont, fontSize: '0.8rem' }}>
                {runHistory.filter((r) => r.result === 'win').length}
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="caption" sx={{ color: tokens.colors.text.disabled, fontSize: '0.55rem', display: 'block' }}>
                Losses
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, color: tokens.colors.error, ...gamingFont, fontSize: '0.8rem' }}>
                {runHistory.filter((r) => r.result === 'loss').length}
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="caption" sx={{ color: tokens.colors.text.disabled, fontSize: '0.55rem', display: 'block' }}>
                Best
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, color: tokens.colors.warning, ...gamingFont, fontSize: '0.8rem' }}>
                {Math.max(...runHistory.map((r) => r.score)).toLocaleString()}
              </Typography>
            </Box>
          </Box>

          {/* Run history list */}
          <Box sx={{ flex: 1, overflow: 'auto', p: 1, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
            {runHistory.map((run) => (
              <RunHistoryItem key={run.id} run={run} />
            ))}
          </Box>

          {/* Footer */}
          <Box
            sx={{
              p: 1.5,
              borderTop: `1px solid ${tokens.colors.border}`,
              textAlign: 'center',
            }}
          >
            <Typography variant="caption" sx={{ color: tokens.colors.text.disabled, fontSize: '0.6rem' }}>
              {runHistory.length} runs · Last 7 days
            </Typography>
          </Box>
        </>
      )}

      {/* Dev Drawer - Thread Snapshot (dev mode only) */}
      {isDev && threadSnapshot && (
        <Box sx={{ borderTop: `1px solid ${tokens.colors.border}`, mt: 'auto' }}>
          {/* Toggle header */}
          <Box
            onClick={() => setDevDrawerOpen(!devDrawerOpen)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 1.5,
              py: 0.75,
              cursor: 'pointer',
              bgcolor: devDrawerOpen ? 'rgba(255,0,0,0.05)' : 'transparent',
              '&:hover': {
                bgcolor: 'rgba(255,0,0,0.08)',
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <BugReportSharpIcon sx={{ fontSize: 14, color: tokens.colors.error }} />
              <Typography
                variant="caption"
                sx={{
                  fontSize: '0.55rem',
                  color: tokens.colors.error,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  fontWeight: 600,
                }}
              >
                Thread Snapshot
              </Typography>
            </Box>
            <IconButton size="small" sx={{ p: 0.25 }}>
              {devDrawerOpen ? (
                <ExpandMoreIcon sx={{ fontSize: 16, color: tokens.colors.text.disabled }} />
              ) : (
                <ExpandLessIcon sx={{ fontSize: 16, color: tokens.colors.text.disabled }} />
              )}
            </IconButton>
          </Box>

          {/* Collapsible content */}
          <Collapse in={devDrawerOpen}>
            <Box sx={{ px: 1, pb: 1 }}>
              <ThreadSnapshotDrawer snapshot={threadSnapshot} />
            </Box>
          </Collapse>
        </Box>
      )}
    </Box>
  );
}
