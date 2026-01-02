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
import { DiceMeteor } from './DiceMeteor';
import type { TimeOfDay, ZoneInfo } from './components/tabs/GameTabLaunch';

// Layout constants
const SIDEBAR_WIDTH = 320;

// Generate a random 6-char hex thread ID
const generateThreadId = () => Math.random().toString(16).slice(2, 8).toUpperCase();

// Time of day based on predicted attack order (1st=Afternoon, 2nd=Night, 3rd=Dawn)
const TIMES_BY_ORDER: TimeOfDay[] = ['afternoon', 'night', 'dawn'];
const getTimeOfDay = (index: number): TimeOfDay => TIMES_BY_ORDER[index] || 'afternoon';

export function PlayHub() {
  const {
    state,
    selectZone,
    resetRun,
    startRun,
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
    summons: 3, // TODO: from combat state
    tributes: 3, // TODO: from combat state
    gold: state.gold || 0,
    domain: state.currentDomain || 1,
    totalDomains: 6,
    event: state.currentEvent || 1,
    totalEvents: 3,
    rollHistory: [], // TODO: wire up roll history from combat
  }), [state]);

  // Handle New Run
  const handleNewRun = () => {
    const threadId = generateThreadId();
    startRun(threadId);
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

  // Handle combat win - pass to RunContext
  const handleCombatWin = useCallback((score: number, stats: { npcsSquished: number; diceThrown: number }) => {
    // Calculate gold reward based on score and zone tier
    const goldEarned = Math.floor(score / 10) + (state.selectedZone?.tier || 1) * 10;
    completeRoom(score, goldEarned, stats);
  }, [completeRoom, state.selectedZone?.tier]);

  // Render DiceMeteor when in combat mode
  if (state.centerPanel === 'combat' && state.selectedZone) {
    return (
      <DiceMeteor
        domain={state.currentDomain || 1}
        eventType={state.selectedZone.eventType}
        tier={state.selectedZone.tier}
        scoreGoal={1000 * state.selectedZone.tier}
        initialSummons={3}
        initialTributes={3}
        gold={state.gold || 0}
        domainName={state.domainState?.name || 'Unknown'}
        roomNumber={state.roomNumber || 1}
        onWin={handleCombatWin}
        onLose={failRoom}
      />
    );
  }

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
      {/* Center: Globe (always visible, same size) */}
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
        <GlobeScene
          npcs={npcs}
          meteors={meteors}
          impacts={impacts}
          onGlobeClick={handleGlobeClick}
          targetPosition={targetPosition}
          style="lowPoly"
          autoRotate={sidebarPhase === 'lobby' && !state.selectedZone}
          onInteraction={() => setLastInteraction(Date.now())}
          isIdle={isIdle}
          zones={state.domainState?.zones || []}
          onZoneClick={selectZone}
          selectedZone={state.selectedZone}
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
