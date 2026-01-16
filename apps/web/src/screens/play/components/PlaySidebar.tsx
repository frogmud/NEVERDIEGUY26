import { useState, useCallback } from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import { tokens } from '../../../theme';
import { GameTab } from './tabs/GameTab';
import { GameTabLaunch, type ZoneInfo } from './tabs/GameTabLaunch';
import { GameTabPlaying } from './tabs/GameTabPlaying';
import { BagTab } from './tabs/BagTab';
import { SettingsTab } from './tabs/SettingsTab';
import { LOADOUT_PRESETS, DEFAULT_LOADOUT_ID } from '../../../data/loadouts';

interface RollHistoryEntry {
  id: number;
  dice: string;
  values: string;
  hits?: number;
  bonus?: string;
}

/** Feed entry types for sidebar history */
type FeedEntryType = 'npc_chat' | 'roll' | 'trade';

interface FeedEntry {
  id: string;
  type: FeedEntryType;
  timestamp: number;
  // NPC chat fields
  npcSlug?: string;
  npcName?: string;
  text?: string;
  mood?: string;
  // Roll fields
  rollNotation?: string;
  rollTotal?: number;
  // Trade fields
  diceTraded?: number;
  multiplierGained?: number;
}

interface GameState {
  enemySprite?: string;
  scoreToBeat: number;
  score: number;
  multiplier: number;
  goal: number;
  throws: number;
  trades: number;
  gold: number;
  domain: number;
  totalDomains: number;
  event: number;
  totalEvents: number;
  rollHistory: RollHistoryEntry[];
}

type GamePhase = 'lobby' | 'zoneSelect' | 'playing';

interface PlaySidebarProps {
  phase?: GamePhase;
  width?: number;
  onNewRun?: (loadoutId: string, startingItems: string[]) => void;
  onContinue?: () => void;
  onLaunch?: () => void;
  onBack?: () => void;
  // Zone selection
  zones?: ZoneInfo[];
  selectedZoneId?: string | null;
  onZoneSelect?: (zoneId: string) => void;
  seedHash?: string;
  // Game state
  gameState?: GameState;
  onOptions?: () => void;
  onInfo?: () => void;
  // Continue button state
  hasSavedRun?: boolean;
  // Combat feed history
  combatFeed?: FeedEntry[];
  // Run progress (for zone select header)
  currentDomain?: number;
  totalDomains?: number;
  currentRoom?: number;
  totalRooms?: number;
  totalScore?: number;
  gold?: number;
  // Shop mode - hides score to beat
  isInShop?: boolean;
}

type LobbyTabValue = 'game' | 'bag' | 'options';

/**
 * State-aware sidebar for the Play screen.
 * - Lobby: New Run / Continue buttons
 * - Zone Select: Shows selected zone info + Launch button
 * - Playing: Shows game stats, roll history, resources
 */
export function PlaySidebar({
  phase = 'lobby',
  width = 320,
  onNewRun,
  onContinue,
  onLaunch,
  onBack,
  zones = [],
  selectedZoneId,
  onZoneSelect,
  seedHash,
  gameState,
  onOptions,
  onInfo,
  hasSavedRun = false,
  combatFeed = [],
  currentDomain = 1,
  totalDomains = 6,
  currentRoom = 1,
  totalRooms = 3,
  totalScore = 0,
  gold = 0,
  isInShop = false,
}: PlaySidebarProps) {
  const [activeTab, setActiveTab] = useState<LobbyTabValue>('game');
  const [selectedLoadout, setSelectedLoadout] = useState<string>(DEFAULT_LOADOUT_ID);

  // Handle new run with selected loadout
  const handleNewRun = useCallback(() => {
    const loadout = LOADOUT_PRESETS.find((l) => l.id === selectedLoadout);
    onNewRun?.(selectedLoadout, loadout?.items || []);
  }, [selectedLoadout, onNewRun]);

  // Default game state for when playing but no state provided
  const defaultGameState: GameState = {
    scoreToBeat: 0,
    score: 0,
    multiplier: 1,
    goal: 0,
    throws: 3,
    trades: 3,
    gold: 0,
    domain: 1,
    totalDomains: 6,
    event: 1,
    totalEvents: 3,
    rollHistory: [],
  };

  const state = gameState || defaultGameState;

  // Lobby UI with tabs
  return (
    <Box
      sx={{
        width,
        flexShrink: 0,
        bgcolor: tokens.colors.background.paper,
        borderLeft: `1px solid ${tokens.colors.border}`,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        maxHeight: '100%',
        minHeight: 0,
        overflow: 'hidden',
      }}
    >
      {/* Tab Navigation */}
      <Box
        sx={{
          borderBottom: `1px solid ${tokens.colors.border}`,
          height: 48,
          flexShrink: 0,
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(_, value) => setActiveTab(value)}
          variant="fullWidth"
          sx={{
            height: 48,
            minHeight: 48,
            '& .MuiTabs-indicator': {
              backgroundColor: tokens.colors.text.primary,
              height: 2,
            },
            '& .MuiTabs-flexContainer': {
              height: 48,
            },
            '& .MuiTab-root': {
              height: 48,
              minHeight: 48,
              fontWeight: 500,
              fontSize: '0.875rem',
              textTransform: 'none',
              color: tokens.colors.text.secondary,
              '&.Mui-selected': {
                color: tokens.colors.text.primary,
              },
            },
          }}
        >
          <Tab value="game" label="Game" />
          <Tab value="bag" label="Bag" />
          <Tab value="options" label="Options" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      <Box sx={{ flex: 1, overflow: 'hidden', minHeight: 0 }}>
        {activeTab === 'game' && (
          phase === 'playing' ? (
            <GameTabPlaying
              enemySprite={state.enemySprite}
              scoreToBeat={state.scoreToBeat}
              hideScoreToBeat={isInShop}
              score={state.score}
              multiplier={state.multiplier}
              goal={state.goal}
              throws={state.throws}
              trades={state.trades}
              gold={state.gold}
              domain={state.domain}
              totalDomains={state.totalDomains}
              event={state.event}
              totalEvents={state.totalEvents}
              rollHistory={state.rollHistory}
              onOptions={onOptions}
              onInfo={onInfo}
              combatFeed={combatFeed}
            />
          ) : phase === 'zoneSelect' ? (
            <GameTabLaunch
              zones={zones}
              selectedZoneId={selectedZoneId}
              onZoneSelect={onZoneSelect}
              onLaunch={onLaunch}
              onBack={onBack}
              seedHash={seedHash}
              currentDomain={currentDomain}
              totalDomains={totalDomains}
              currentRoom={currentRoom}
              totalRooms={totalRooms}
              totalScore={totalScore}
              gold={gold}
            />
          ) : (
            <GameTab
              onNewRun={handleNewRun}
              onContinue={onContinue}
              hasSaveData={hasSavedRun}
              savedProgress={hasSavedRun && currentDomain ? { domain: currentDomain, room: currentRoom || 1 } : undefined}
            />
          )
        )}
        {activeTab === 'bag' && (
          <BagTab
            isLobby={phase === 'lobby' || phase === 'zoneSelect'}
            selectedLoadout={selectedLoadout}
            onLoadoutSelect={setSelectedLoadout}
          />
        )}
        {activeTab === 'options' && <SettingsTab />}
      </Box>
    </Box>
  );
}
