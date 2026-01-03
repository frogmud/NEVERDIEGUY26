/**
 * PlayHub - Globe-centric gameplay with persistent sidebar
 *
 * Layout (matching mockups):
 * - Center: 3D Globe (same size always, even during combat)
 * - Right: Sidebar that transforms from lobby (New Run/Continue) to game stats
 *
 * The globe IS the game board - dice are thrown at it via reticle
 */

import { useState, useMemo, useEffect, useCallback } from 'react';
import { Box } from '@mui/material';
import { tokens } from '../../theme';
import { PlaySidebar } from './components';
import { RunSummary } from './components/RunSummary';
import { PlayOptionsModal } from './components/PlayOptionsModal';
import { DomainInfoModal } from './components/DomainInfoModal';
import { Shop } from './Shop';
import { GlobeScene } from '../../games/globe-meteor/GlobeScene';
import { useGlobeMeteorGame } from '../../games/globe-meteor/hooks/useGlobeMeteorGame';
import { useRun } from '../../contexts';
import { GameOverModal } from '../../games/meteor/components';
import { TransitionWipe } from '../../components/TransitionWipe';
import { CombatTerminal, type FeedEntry } from './components/CombatTerminal';
import type { TimeOfDay, ZoneInfo } from './components/tabs/GameTabLaunch';

import type { ZoneMarker } from '../../types/zones';

// Layout constants
const SIDEBAR_WIDTH = 320;

// Generate a random 6-char hex thread ID
const generateThreadId = () => Math.random().toString(16).slice(2, 8).toUpperCase();

// Time of day based on predicted attack order (1st=Afternoon, 2nd=Night, 3rd=Dawn)
const TIMES_BY_ORDER: TimeOfDay[] = ['afternoon', 'night', 'dawn'];
const getTimeOfDay = (index: number): TimeOfDay => TIMES_BY_ORDER[index] || 'afternoon';

// Preview parking spots for lobby (shows available landing zones)
// These are static positions that hint at the game structure
const LOBBY_PREVIEW_ZONES: ZoneMarker[] = [
  { id: 'preview-1', lat: 30, lng: -60, tier: 1, type: 'stable', eventType: 'small', cleared: false, rewards: { goldMin: 50, goldMax: 100, lootTier: 1 } },
  { id: 'preview-2', lat: 45, lng: 30, tier: 2, type: 'elite', eventType: 'big', cleared: false, rewards: { goldMin: 100, goldMax: 200, lootTier: 2 } },
  { id: 'preview-3', lat: -20, lng: 120, tier: 3, type: 'anomaly', eventType: 'boss', cleared: false, rewards: { goldMin: 200, goldMax: 400, lootTier: 3 } },
  { id: 'preview-4', lat: -45, lng: -120, tier: 1, type: 'stable', eventType: 'small', cleared: false, rewards: { goldMin: 50, goldMax: 100, lootTier: 1 } },
  { id: 'preview-5', lat: 10, lng: 170, tier: 2, type: 'elite', eventType: 'big', cleared: false, rewards: { goldMin: 100, goldMax: 200, lootTier: 2 } },
  { id: 'preview-6', lat: -60, lng: 60, tier: 4, type: 'anomaly', eventType: 'boss', cleared: false, rewards: { goldMin: 300, goldMax: 600, lootTier: 4 } },
];

export function PlayHub() {
  const {
    state,
    selectZone,
    resetRun,
    startRun,
    setPanel,
    transitionToPanel,
    setTransitionPhase,
    completeTransition,
    completeRoom,
    failRoom,
    continueFromSummary,
    continueFromShop,
    purchase,
    loadRun,
    hasSavedRun,
  } = useRun();

  // Handle transition phases: exit → wipe → complete
  useEffect(() => {
    if (state.transitionPhase === 'exit') {
      // Brief delay then show wipe
      const timer = setTimeout(() => {
        setTransitionPhase('wipe');
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [state.transitionPhase, setTransitionPhase]);

  // Balatro-style auto-launch: when run starts, auto-select first zone and launch instantly
  useEffect(() => {
    // Check if we just started a run (phase changed to 'playing', have zones, no zone selected yet)
    if (
      state.phase === 'playing' &&
      state.centerPanel === 'globe' &&
      state.domainState?.zones?.length &&
      !state.selectedZone
    ) {
      // Auto-select first zone
      const firstZone = state.domainState.zones[0];
      selectZone(firstZone);

      // Immediately launch into combat - no wipe animation, instant like Continue
      setTimeout(() => {
        setPanel('combat');
      }, 100);
    }
  }, [state.phase, state.centerPanel, state.domainState?.zones, state.selectedZone, selectZone, setPanel]);

  // Determine game phase for sidebar based on state.phase
  // Initial state has phase='event_select', after startRun it's 'playing'
  // 'event_select' -> lobby, 'playing' + globe -> zoneSelect, 'playing' + combat -> playing
  const sidebarPhase = (state.phase === 'event_select' || state.phase === 'game_over') ? 'lobby'
    : state.centerPanel === 'combat' ? 'playing'
    : 'zoneSelect';

  // 3D Globe game state
  const {
    npcs,
    meteors,
    impacts,
    targetPosition,
    handleGlobeClick,
    setLastInteraction,
    isIdle,
  } = useGlobeMeteorGame();

  // Build game state for sidebar
  // TODO: Wire up actual game state from combat system
  const gameState = useMemo(() => ({
    enemySprite: '/assets/enemies/shadow-knight.png', // TODO: from combat state
    scoreToBeat: 1000, // TODO: from combat state
    score: state.totalScore || 0,
    multiplier: 1, // TODO: from combat state
    goal: 1000, // TODO: from combat state
    throws: 3, // TODO: from combat state
    trades: 3, // TODO: from combat state
    gold: state.gold || 0,
    domain: state.currentDomain || 1,
    totalDomains: 6,
    event: state.currentEvent || 1,
    totalEvents: 3,
    rollHistory: [], // TODO: wire up roll history from combat
  }), [state]);

  // Handle New Run - Balatro style: immediately launch into first zone
  const handleNewRun = () => {
    const threadId = generateThreadId();
    startRun(threadId);

    // Auto-select first zone and launch immediately (no friction)
    // The startRun will generate domainState with zones
    // We need a slight delay for state to update, then auto-launch
    setTimeout(() => {
      // This will be handled by useEffect below
    }, 0);
  };

  // Handle Continue - load saved run or start new
  const handleContinue = () => {
    const loaded = loadRun();
    if (!loaded) {
      // No saved run, start fresh
      const threadId = generateThreadId();
      startRun(threadId);
    }
  };

  // Handle Launch (start combat after zone selection)
  const handleLaunch = () => {
    transitionToPanel('combat');
  };

  // Handle Back (return to lobby from zone select)
  const handleBack = () => {
    resetRun?.();
  };

  // Modal state
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);

  // Combat feed history (passed to sidebar)
  const [combatFeed, setCombatFeed] = useState<FeedEntry[]>([]);

  // Pending victory data (for transition wipe)
  const [pendingVictory, setPendingVictory] = useState<{
    score: number;
    gold: number;
    stats: { npcsSquished: number; diceThrown: number };
  } | null>(null);

  // Process pending victory after wipe completes (transition to summary)
  useEffect(() => {
    if (pendingVictory && state.centerPanel === 'summary' && state.transitionPhase === 'idle') {
      // Wipe completed, now actually complete the room
      completeRoom(pendingVictory.score, pendingVictory.gold, pendingVictory.stats);
      setPendingVictory(null);
    }
  }, [pendingVictory, state.centerPanel, state.transitionPhase, completeRoom]);

  // Handle Options button
  const handleOptions = () => {
    setOptionsOpen(true);
  };

  // Handle Info button
  const handleInfo = () => {
    setInfoOpen(true);
  };

  // Build zones list for sidebar with time-of-day
  // Time is predicted based on order (zones listed top-to-bottom = Afternoon, Night, Dawn)
  const zonesForSidebar: ZoneInfo[] = useMemo(() => {
    const domainZones = state.domainState?.zones || [];
    return domainZones.map((zone, index) => ({
      id: zone.id,
      tier: zone.tier,
      timeOfDay: getTimeOfDay(index),
      isBoss: zone.eventType === 'boss',
      // Boss gets buff if you skip zones (each uncleared zone before boss = +20%)
      bossModifier: zone.eventType === 'boss' ? 1 + (index * 0.2) : undefined,
    }));
  }, [state.domainState?.zones, sidebarPhase]);

  // Handle zone selection from sidebar (find zone by id and call selectZone)
  const handleZoneSelectFromSidebar = useCallback((zoneId: string) => {
    const zone = state.domainState?.zones?.find(z => z.id === zoneId);
    if (zone) {
      selectZone(zone);
    }
  }, [state.domainState?.zones, selectZone]);

  // Handle combat win - trigger skull wipe then complete room
  const handleCombatWin = useCallback((score: number, stats: { npcsSquished: number; diceThrown: number }) => {
    // Calculate gold reward based on score and zone tier
    const goldEarned = Math.floor(score / 10) + (state.selectedZone?.tier || 1) * 10;
    // Store pending victory data and trigger transition wipe
    setPendingVictory({ score, gold: goldEarned, stats });
    transitionToPanel('summary');
  }, [transitionToPanel, state.selectedZone?.tier]);

  // Render RunSummary after combat completes
  if (state.centerPanel === 'summary') {
    return (
      <Box sx={{ height: '100%', bgcolor: tokens.colors.background.default }}>
        <RunSummary
          score={state.lastRoomScore}
          gold={state.lastRoomGold}
          totalScore={state.totalScore}
          totalGold={state.gold}
          domainName={state.domainState?.name}
          domainProgress={{
            cleared: state.domainState?.clearedCount || 0,
            total: state.domainState?.totalZones || 3,
          }}
          eventType="small"
          onContinue={continueFromSummary}
        />
      </Box>
    );
  }

  // Render Shop after summary
  if (state.centerPanel === 'shop') {
    return (
      <Box sx={{ height: '100%', bgcolor: tokens.colors.background.default, overflow: 'auto' }}>
        <Shop
          gold={state.gold}
          domainId={state.currentDomain || 1}
          onPurchase={purchase}
          onContinue={continueFromShop}
          threadId={state.threadId}
          tier={state.tier || 1}
        />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        height: '100%',
        minHeight: 0,
        bgcolor: tokens.colors.background.default,
      }}
    >
      {/* Center: Combat Terminal (always visible) */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: 0,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <CombatTerminal
          domain={state.currentDomain || 1}
          eventType={state.selectedZone?.eventType || 'small'}
          tier={state.selectedZone?.tier || 1}
          scoreGoal={state.selectedZone ? 1000 * state.selectedZone.tier : 1000}
          onWin={handleCombatWin}
          onLose={failRoom}
          isLobby={state.phase === 'event_select'}
          onFeedUpdate={setCombatFeed}
        />
      </Box>

      {/* Right: Sidebar (transforms based on game phase) */}
      <PlaySidebar
        phase={sidebarPhase}
        width={SIDEBAR_WIDTH}
        onNewRun={handleNewRun}
        onContinue={handleContinue}
        onLaunch={handleLaunch}
        onBack={handleBack}
        zones={zonesForSidebar}
        selectedZoneId={state.selectedZone?.id}
        onZoneSelect={handleZoneSelectFromSidebar}
        seedHash={state.threadId?.slice(0, 6)}
        gameState={sidebarPhase === 'playing' ? gameState : undefined}
        onOptions={handleOptions}
        onInfo={handleInfo}
        hasSavedRun={hasSavedRun()}
        combatFeed={combatFeed}
      />

      {/* Transition Wipe */}
      <TransitionWipe
        phase={state.transitionPhase}
        onWipeComplete={completeTransition}
      />

      {/* Options Modal */}
      <PlayOptionsModal
        open={optionsOpen}
        onClose={() => setOptionsOpen(false)}
        onAbandonRun={resetRun}
        seedHash={state.threadId?.slice(0, 6)}
        domain={state.currentDomain}
        roomNumber={state.roomNumber}
      />

      {/* Domain Info Modal */}
      <DomainInfoModal
        open={infoOpen}
        onClose={() => setInfoOpen(false)}
        domainState={state.domainState}
        currentDomain={state.currentDomain || 1}
        roomNumber={state.roomNumber || 1}
        totalScore={state.totalScore || 0}
        gold={state.gold || 0}
      />

      {/* Game Over Modal */}
      {state.runEnded && (
        <GameOverModal
          open={true}
          isWin={state.gameWon}
          stats={{
            bestRoll: state.runStats?.bestRoll || 0,
            mostRolled: state.runStats?.mostRolled || 'd20',
            diceRolled: state.runStats?.diceThrown || 0,
            domains: state.currentDomain || 1,
            reloads: state.runStats?.reloads || 0,
            rooms: state.roomNumber || 1,
            purchases: state.runStats?.purchases || 0,
            shopRemixes: state.runStats?.shopRemixes || 0,
            discoveries: state.runStats?.discoveries || 0,
            seed: state.threadId || 'RANDOM',
            killedBy: state.runStats?.killedBy,
          }}
          onNewRun={resetRun}
          onMainMenu={resetRun}
        />
      )}
    </Box>
  );
}
