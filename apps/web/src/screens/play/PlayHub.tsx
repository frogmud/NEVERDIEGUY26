/**
 * PlayHub - Globe-centric gameplay with persistent sidebar
 *
 * Layout (matching mockups):
 * - Center: 3D Globe (same size always, even during combat)
 * - Right: Sidebar that transforms from lobby (New Run/Continue) to game stats
 *
 * The globe IS the game board - dice are thrown at it via reticle
 */

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import { tokens } from '../../theme';
import { PlaySidebar } from './components';
import { RunSummary } from './components/RunSummary';
import { PlayOptionsModal } from './components/PlayOptionsModal';
import { DomainInfoModal } from './components/DomainInfoModal';
import { Shop } from './Shop';
import { GlobeScene } from '../../games/globe-meteor/GlobeScene';
import { useGlobeMeteorGame } from '../../games/globe-meteor/hooks/useGlobeMeteorGame';
import { useRun } from '../../contexts';
import { useAuth } from '../../contexts/AuthContext';
import { GameOverModal } from '../../games/meteor/components';
import { TransitionWipe } from '../../components/TransitionWipe';
import { CombatTerminal, type FeedEntry, type GameStateUpdate } from './components/CombatTerminal';
import type { TimeOfDay, ZoneInfo } from './components/tabs/GameTabLaunch';

import type { ZoneMarker } from '../../types/zones';
import { LOADOUT_PRESETS, DEFAULT_LOADOUT_ID } from '../../data/loadouts';
import { calculateGoldReward } from '../../data/balance-config';

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
    startPractice,
    endRun,
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

  const { markGameStarted } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const navState = location.state as { practiceMode?: boolean } | null;

  // Mark that user has started a game (transforms home page from marketing LP)
  useEffect(() => {
    markGameStarted();
  }, [markGameStarted]);

  // Auto-start practice mode if navigated with practiceMode flag
  useEffect(() => {
    if (navState?.practiceMode && state.phase === 'event_select') {
      startPractice();
      // Clear the navigation state so refresh doesn't restart
      navigate('/play', { replace: true, state: null });
    }
  }, [navState?.practiceMode, state.phase, startPractice, navigate]);

  // Handle Main Menu - navigate to app home
  const handleMainMenu = useCallback(() => {
    resetRun?.();
    navigate('/');
  }, [resetRun, navigate]);

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

  // MVP: Auto-select random zone and launch immediately when new run starts
  // Skip zone selection step for faster gameplay
  useEffect(() => {
    let transitionTimeout: ReturnType<typeof setTimeout> | null = null;

    if (
      state.phase === 'playing' &&
      state.domainState?.zones &&
      state.domainState.zones.length > 0 &&
      !state.selectedZone &&
      state.centerPanel === 'globe' &&
      state.transitionPhase === 'idle'
    ) {
      // Pick random uncleared zone
      const unclearedZones = state.domainState.zones.filter(z => !z.cleared);
      const zones = unclearedZones.length > 0 ? unclearedZones : state.domainState.zones;
      const randomZone = zones[Math.floor(Math.random() * zones.length)];
      selectZone(randomZone);
      // Launch into combat after zone selection
      transitionTimeout = setTimeout(() => {
        transitionToPanel('combat');
      }, 50);
    }

    return () => {
      if (transitionTimeout) {
        clearTimeout(transitionTimeout);
      }
    };
  }, [state.phase, state.domainState?.zones, state.selectedZone, state.centerPanel, state.transitionPhase, selectZone, transitionToPanel]);

  // Determine game phase for sidebar based on state.phase
  // Initial state has phase='event_select', after startRun it's 'playing'
  // 'event_select' -> lobby, 'playing' + globe -> zoneSelect, 'playing' + combat/summary/shop -> playing
  // Keep 'playing' during game_over, summary and shop so player can see their stats in sidebar
  const sidebarPhase = state.phase === 'event_select' ? 'lobby'
    : state.phase === 'game_over' ? 'playing'
    : state.centerPanel === 'combat' ? 'playing'
    : state.centerPanel === 'summary' ? 'playing'
    : state.centerPanel === 'shop' ? 'playing'
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

  // Combat game state (throws, trades, score) from CombatTerminal
  const [combatGameState, setCombatGameState] = useState<GameStateUpdate | null>(null);

  // Build game state for sidebar - uses live combat state when available
  // Use granular dependencies to ensure score updates trigger re-renders
  const gameState = useMemo(() => ({
    enemySprite: '/assets/enemies/shadow-knight.png',
    scoreToBeat: combatGameState?.goal || 1000,
    score: combatGameState?.score ?? state.totalScore ?? 0,
    multiplier: combatGameState?.multiplier ?? 1,
    goal: combatGameState?.goal ?? 1000,
    throws: combatGameState?.throws ?? 3,
    trades: combatGameState?.trades ?? 3,
    gold: state.gold ?? 0,
    domain: state.currentDomain ?? 1,
    totalDomains: 6,
    event: state.currentEvent ?? 1,
    totalEvents: 3,
    rollHistory: [],
  }), [
    combatGameState?.score,
    combatGameState?.goal,
    combatGameState?.throws,
    combatGameState?.trades,
    combatGameState?.multiplier,
    state.totalScore,
    state.gold,
    state.currentDomain,
    state.currentEvent,
  ]);

  // Handle New Run - starts run and shows zone selection
  const handleNewRun = (loadoutId: string, startingItems: string[]) => {
    const threadId = generateThreadId();
    startRun(threadId, undefined, undefined, loadoutId, startingItems);
    // After startRun, sidebar will show zone selection
    // User picks zone, then clicks Launch to start combat
  };

  // Handle Continue - load saved run or start new
  const handleContinue = () => {
    const loaded = loadRun();
    if (!loaded) {
      // No saved run, start fresh with default loadout
      const threadId = generateThreadId();
      const defaultLoadout = LOADOUT_PRESETS.find(l => l.id === DEFAULT_LOADOUT_ID);
      startRun(threadId, undefined, undefined, DEFAULT_LOADOUT_ID, defaultLoadout?.items || []);
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

  // Track selected zone tier in a ref to avoid callback reference changes
  // This prevents the combat engine from reinitializing when zones change
  const selectedZoneTierRef = useRef<number>(1);
  useEffect(() => {
    selectedZoneTierRef.current = state.selectedZone?.tier || 1;
  }, [state.selectedZone?.tier]);

  // Track current domain in a ref for stable gold calculation
  const currentDomainRef = useRef<number>(1);
  useEffect(() => {
    currentDomainRef.current = state.currentDomain || 1;
  }, [state.currentDomain]);

  // Track practice mode in a ref for stable callback
  const practiceModeRef = useRef(false);
  useEffect(() => {
    practiceModeRef.current = state.practiceMode;
  }, [state.practiceMode]);

  // Handle combat win - trigger skull wipe then complete room
  // Uses refs instead of state to keep callback reference stable
  const handleCombatWin = useCallback((score: number, stats: { npcsSquished: number; diceThrown: number }) => {
    // Practice mode: end immediately with win (no summary/shop)
    if (practiceModeRef.current) {
      endRun(true);
      return;
    }
    // Full run: calculate gold using balance config (tier-based, domain-scaled)
    const goldEarned = calculateGoldReward(selectedZoneTierRef.current, currentDomainRef.current);
    // Store pending victory data and trigger transition wipe
    setPendingVictory({ score, gold: goldEarned, stats });
    transitionToPanel('summary');
  }, [transitionToPanel, endRun]);

  // Check if we're in summary or shop mode (rendered in center area, not as early return)
  const isInSummary = state.centerPanel === 'summary' && !state.runEnded;
  const isInShop = state.centerPanel === 'shop' && !state.runEnded;

  return (
    <Box
      sx={{
        display: 'flex',
        height: '100%',
        minHeight: 0,
        maxHeight: '100%',
        bgcolor: tokens.colors.background.default,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Center: Main content area with progress bar and combat */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          minHeight: 0,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Overall Run Progress Bar - shows domain and event progress with checkpoints */}
        {state.phase !== 'event_select' && (
          <Box sx={{ px: 3, pt: 2, pb: 1 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                p: 1,
                px: 2,
                bgcolor: tokens.colors.background.paper,
                border: `1px solid ${tokens.colors.border}`,
                borderRadius: '20px',
              }}
            >
              {/* Progress bar with checkpoints */}
              <Box
                sx={{
                  flex: 1,
                  height: 4,
                  bgcolor: 'rgba(255,255,255,0.1)',
                  borderRadius: 2,
                  position: 'relative',
                }}
              >
                {/* Progress fill - uses clearedCount for accurate event tracking */}
                <Box
                  sx={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    height: '100%',
                    width: `${(((state.currentDomain || 1) - 1) / 6) * 100 + ((state.domainState?.clearedCount || 0) / 3 / 6) * 100}%`,
                    bgcolor: tokens.colors.primary,
                    borderRadius: 2,
                    transition: 'width 0.5s ease',
                  }}
                />
                {/* Checkpoint markers - 6 domains x 3 events = 18 total checkpoints */}
                {Array.from({ length: 6 }).map((_, domainIdx) =>
                  Array.from({ length: 3 }).map((_, eventIdx) => {
                    const totalEvents = domainIdx * 3 + eventIdx;
                    const position = ((totalEvents + 1) / 18) * 100;
                    const isBoss = eventIdx === 2;
                    const currentDomain = state.currentDomain || 1;
                    const clearedInCurrentDomain = state.domainState?.clearedCount || 0;
                    const totalCleared = (currentDomain - 1) * 3 + clearedInCurrentDomain;
                    const isCleared = totalEvents < totalCleared;
                    const isCurrent = totalEvents === totalCleared;

                    return (
                      <Box
                        key={`${domainIdx}-${eventIdx}`}
                        sx={{
                          position: 'absolute',
                          left: `${position}%`,
                          top: '50%',
                          transform: isBoss
                            ? 'translate(-50%, -50%) rotate(45deg)'
                            : 'translate(-50%, -50%)',
                          width: isBoss ? 6 : 6,
                          height: isBoss ? 6 : 6,
                          borderRadius: isBoss ? 1 : '50%',
                          bgcolor: isCleared
                            ? tokens.colors.primary
                            : isCurrent
                            ? tokens.colors.warning
                            : 'rgba(255,255,255,0.2)',
                          border: isCurrent ? `1px solid ${tokens.colors.warning}` : 'none',
                          transition: 'background-color 0.3s ease',
                        }}
                      />
                    );
                  })
                )}
              </Box>
              {/* Compact label */}
              <Typography
                sx={{
                  fontFamily: tokens.fonts.gaming,
                  fontSize: '0.7rem',
                  color: tokens.colors.text.disabled,
                  whiteSpace: 'nowrap',
                }}
              >
                {state.currentDomain || 1}-{(state.domainState?.clearedCount || 0) + 1}
              </Typography>
            </Box>
          </Box>
        )}

        {/* Center Content: Summary, Shop, or Combat Terminal */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 0,
            position: 'relative',
            overflow: isInShop || isInSummary ? 'auto' : 'hidden',
          }}
        >
        {isInSummary ? (
          /* Room Clear Summary */
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
        ) : isInShop ? (
          /* Shop Screen */
          <Box sx={{ width: '100%', height: '100%', overflow: 'auto', py: 4 }}>
            <Shop
              gold={state.gold}
              domainId={state.currentDomain || 1}
              onPurchase={purchase}
              onContinue={continueFromShop}
              threadId={state.threadId}
              tier={state.tier || 1}
            />
          </Box>
        ) : (
          <>
            {/* Tinted overlay on game over - covers center area only, sidebar stays visible */}
            {state.runEnded && (
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  bgcolor: state.gameWon ? 'rgba(48, 209, 88, 0.35)' : 'rgba(233, 4, 65, 0.35)',
                  zIndex: 90,
                  pointerEvents: 'none',
                }}
              />
            )}
            <CombatTerminal
              domain={state.currentDomain || 1}
              eventType={state.selectedZone?.eventType || 'small'}
              tier={state.selectedZone?.tier || 1}
              scoreGoal={state.selectedZone ? 1000 * state.selectedZone.tier : 1000}
              onWin={handleCombatWin}
              onLose={failRoom}
              isLobby={state.phase === 'event_select' || !state.selectedZone || state.centerPanel !== 'combat'}
              currentDomain={state.currentDomain || 1}
              totalDomains={6}
              currentRoom={state.roomNumber || 1}
              totalRooms={3}
              totalScore={state.totalScore || 0}
              gold={state.gold || 0}
              inventoryItems={state.inventory?.powerups || []}
              onFeedUpdate={setCombatFeed}
              onGameStateChange={setCombatGameState}
              isDomainClear={state.domainState ? state.domainState.clearedCount + 1 >= state.domainState.totalZones : false}
            />

            {/* Game Over Modal - contained within center area so sidebar stays visible */}
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
                onMainMenu={handleMainMenu}
                contained
              />
            )}
          </>
        )}
        </Box>
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
        currentDomain={state.currentDomain || 1}
        totalDomains={6}
        currentRoom={state.roomNumber || 1}
        totalRooms={3}
        totalScore={state.totalScore || 0}
        gold={state.gold || 0}
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

    </Box>
  );
}
