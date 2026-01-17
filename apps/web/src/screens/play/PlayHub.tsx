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
import { Box, Drawer, Fab, useMediaQuery, useTheme } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
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
import type { ZoneInfo } from './components/tabs/GameTabLaunch';

import { EVENT_VARIANTS, type ZoneMarker } from '../../types/zones';
import { LOADOUT_PRESETS, DEFAULT_LOADOUT_ID } from '../../data/loadouts';
import { applyHeatReward } from '../../data/balance-config';
import { getFlatScoreGoal, getFlatGoldReward } from '@ndg/ai-engine';

// Layout constants
const SIDEBAR_WIDTH = 320;

// Generate a random 6-char hex thread ID
const generateThreadId = () => Math.random().toString(16).slice(2, 8).toUpperCase();


// Preview parking spots for lobby (shows available landing zones)
// These are static positions that hint at the game structure
const LOBBY_PREVIEW_ZONES: ZoneMarker[] = [
  { id: 'preview-1', lat: 30, lng: -60, tier: 1, type: 'stable', eventType: 'small', eventVariant: 'swift', cleared: false, rewards: { goldMin: 50, goldMax: 100, lootTier: 1 } },
  { id: 'preview-2', lat: 45, lng: 30, tier: 2, type: 'elite', eventType: 'big', eventVariant: 'standard', cleared: false, rewards: { goldMin: 100, goldMax: 200, lootTier: 2 } },
  { id: 'preview-3', lat: -20, lng: 120, tier: 3, type: 'anomaly', eventType: 'boss', eventVariant: 'grueling', cleared: false, rewards: { goldMin: 200, goldMax: 400, lootTier: 3 } },
  { id: 'preview-4', lat: -45, lng: -120, tier: 1, type: 'stable', eventType: 'small', eventVariant: 'swift', cleared: false, rewards: { goldMin: 50, goldMax: 100, lootTier: 1 } },
  { id: 'preview-5', lat: 10, lng: 170, tier: 2, type: 'elite', eventType: 'big', eventVariant: 'standard', cleared: false, rewards: { goldMin: 100, goldMax: 200, lootTier: 2 } },
  { id: 'preview-6', lat: -60, lng: 60, tier: 4, type: 'anomaly', eventType: 'boss', eventVariant: 'grueling', cleared: false, rewards: { goldMin: 300, goldMax: 600, lootTier: 4 } },
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
    setPendingVictory,
    failRoom,
    continueFromSummary,
    continueFromShop,
    completeFlumeTransition,
    purchase,
    loadRun,
    hasSavedRun,
  } = useRun();

  const { markGameStarted } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const navState = location.state as { practiceMode?: boolean } | null;

  // Mobile responsive: drawer for sidebar on small screens
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md')); // < 900px
  const [drawerOpen, setDrawerOpen] = useState(false);

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

  // Track quick launch mode (skip zone selection)
  const quickLaunchRef = useRef(false);

  // Auto-start run with homepage loadout if available
  useEffect(() => {
    if (state.phase === 'event_select') {
      const storedLoadout = sessionStorage.getItem('ndg-starting-loadout');
      if (storedLoadout) {
        try {
          const loadout = JSON.parse(storedLoadout);
          // Clear immediately so refresh doesn't restart
          sessionStorage.removeItem('ndg-starting-loadout');
          // Check for quick launch mode
          quickLaunchRef.current = loadout.quickLaunch === true;
          // Start run with NPC-offered items
          const threadId = loadout.seed || generateThreadId();
          const items = loadout.items || [];
          // Pass domain as last parameter (startingDomain)
          startRun(threadId, undefined, undefined, 'survivor', items, loadout.domain);
        } catch {
          // Invalid loadout, ignore
          sessionStorage.removeItem('ndg-starting-loadout');
        }
      }
    }
  }, [state.phase, startRun]);

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

  // Auto-select zone and launch when new run starts
  // Quick launch: pick 'standard' variant and go straight to combat
  // Normal: still auto-launches but could show zone select briefly
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
      // Quick launch mode: pick 'standard' variant zone
      // Normal mode: pick random uncleared zone
      const unclearedZones = state.domainState.zones.filter(z => !z.cleared);
      const zones = unclearedZones.length > 0 ? unclearedZones : state.domainState.zones;

      let selectedZoneForLaunch;
      if (quickLaunchRef.current) {
        // Quick launch: prefer 'standard' variant for balanced gameplay
        selectedZoneForLaunch = zones.find(z => z.eventVariant === 'standard') || zones[0];
        quickLaunchRef.current = false; // Reset for future runs
      } else {
        // Normal: random zone
        selectedZoneForLaunch = zones[Math.floor(Math.random() * zones.length)];
      }

      selectZone(selectedZoneForLaunch);
      // Launch into combat immediately
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
  // Event number: clearedCount + 1 (next event to play), or +1 more if zone selected
  const currentEvent = (state.domainState?.clearedCount ?? 0) + (state.selectedZone ? 1 : 0);
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
    event: currentEvent,
    totalEvents: state.domainState?.totalZones ?? 3,
    rollHistory: [],
    eventVariant: state.selectedZone?.eventVariant,
  }), [
    combatGameState?.score,
    combatGameState?.goal,
    combatGameState?.throws,
    combatGameState?.trades,
    combatGameState?.multiplier,
    state.totalScore,
    state.gold,
    state.currentDomain,
    currentEvent,
    state.domainState?.totalZones,
    state.selectedZone?.eventVariant,
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

  // Handle Options button
  const handleOptions = () => {
    setOptionsOpen(true);
  };

  // Handle Info button
  const handleInfo = () => {
    setInfoOpen(true);
  };

  // Build zones list for sidebar with event variants
  // 3 options: swift (easy), standard, grueling (hard)
  const zonesForSidebar: ZoneInfo[] = useMemo(() => {
    const domainZones = state.domainState?.zones || [];
    return domainZones.map((zone) => ({
      id: zone.id,
      tier: zone.tier,
      eventVariant: zone.eventVariant,
    }));
  }, [state.domainState?.zones]);

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

  // Track event variant in a ref for stable gold calculation
  const eventVariantRef = useRef<'swift' | 'standard' | 'grueling'>('standard');
  useEffect(() => {
    eventVariantRef.current = state.selectedZone?.eventVariant || 'standard';
  }, [state.selectedZone?.eventVariant]);

  // Track heat in a ref for stable gold calculation with heat bonus
  const heatRef = useRef<number>(0);
  useEffect(() => {
    heatRef.current = state.heat || 0;
  }, [state.heat]);

  // Track practice mode in a ref for stable callback
  const practiceModeRef = useRef(false);
  useEffect(() => {
    practiceModeRef.current = state.practiceMode;
  }, [state.practiceMode]);

  // Handle combat win - trigger skull wipe then complete room
  // Uses refs instead of state to keep callback reference stable
  // Victory data is stored in context and applied atomically when transition completes
  const handleCombatWin = useCallback((score: number, stats: { npcsSquished: number; diceThrown: number }, turnsRemaining: number, bestThrowScore?: number) => {
    // Practice mode: end immediately with win (no summary/shop)
    if (practiceModeRef.current) {
      endRun(true);
      return;
    }
    // Full run: calculate gold using flat domain-based rewards with variant + heat multipliers
    const baseGold = getFlatGoldReward(currentDomainRef.current);
    const variantMultiplier = EVENT_VARIANTS[eventVariantRef.current].goldMultiplier;
    const withVariant = baseGold * variantMultiplier;
    // Apply heat bonus (20% more gold per heat level)
    const goldEarned = Math.round(applyHeatReward(withVariant, heatRef.current));
    // Store pending victory in context - will be applied atomically when transition completes
    // turnsRemaining is used for early finish bonus calculation
    setPendingVictory({
      score,
      gold: goldEarned,
      stats,
      turnsRemaining,
      eventVariant: eventVariantRef.current,
      bestThrowScore,
    });
    transitionToPanel('summary');
  }, [transitionToPanel, endRun, setPendingVictory]);

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
        {/* Minimal progress strip - thin bar at top edge */}
        {state.phase !== 'event_select' && (
          <Box sx={{ position: 'relative', zIndex: 200, flexShrink: 0 }}>
            <Box
              sx={{
                height: 3,
                bgcolor: 'rgba(255,255,255,0.08)',
                position: 'relative',
              }}
            >
              {/* Progress fill */}
              <Box
                sx={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  height: '100%',
                  width: `${(((state.currentDomain || 1) - 1) / 6) * 100 + ((state.domainState?.clearedCount || 0) / 3 / 6) * 100}%`,
                  bgcolor: tokens.colors.primary,
                  transition: 'width 0.5s ease',
                }}
              />
              {/* Domain end markers - tick marks that extend below */}
              {Array.from({ length: 5 }).map((_, i) => (
                <Box
                  key={i}
                  sx={{
                    position: 'absolute',
                    left: `${((i + 1) / 6) * 100}%`,
                    top: 0,
                    width: 2,
                    height: 8,
                    bgcolor: 'rgba(255,255,255,0.3)',
                    transform: 'translateX(-1px)',
                    borderRadius: '0 0 1px 1px',
                  }}
                />
              ))}
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
              eventType={state.selectedZone?.eventType || 'big'}
              tier={state.selectedZone?.tier || 1}
              scoreGoal={getFlatScoreGoal(state.currentDomain || 1)}
              onWin={handleCombatWin}
              onLose={failRoom}
              isLobby={state.phase === 'event_select' || !state.selectedZone || state.centerPanel !== 'combat'}
              currentDomain={state.currentDomain || 1}
              totalDomains={6}
              currentRoom={state.roomNumber || 1}
              totalRooms={3}
              eventNumber={(state.domainState?.clearedCount || 0) + 1}
              totalScore={state.totalScore || 0}
              gold={state.gold || 0}
              inventoryItems={state.inventory?.powerups || []}
              onFeedUpdate={setCombatFeed}
              onGameStateChange={setCombatGameState}
              isDomainClear={state.domainState ? state.domainState.clearedCount + 1 >= state.domainState.totalZones : false}
              loadoutStats={state.loadoutStats}
              eventVariant={state.selectedZone?.eventVariant || 'standard'}
            />

            {/* Game Over Modal - contained within center area so sidebar stays visible */}
            {state.runEnded && (
              <GameOverModal
                open={true}
                isWin={state.gameWon}
                stats={{
                  // Combat stats
                  bestRoll: state.runStats?.bestRoll || 0,
                  mostRolled: state.runStats?.mostRolled || 'd20',
                  diceRolled: state.runStats?.diceThrown || 0,
                  totalScore: state.totalScore || 0,
                  // Progress stats
                  domains: state.currentDomain || 1,
                  rooms: state.runStats?.eventsCompleted || 1,
                  // Economy stats
                  purchases: state.runStats?.purchases || 0,
                  shopRemixes: state.runStats?.shopRemixes || 0,
                  goldEarned: state.gold || 0,
                  // Performance stats (placeholder until tracking added)
                  totalTimeMs: state.runStats?.totalTimeMs || 0,
                  avgEventTimeMs: state.runStats?.avgEventTimeMs || 0,
                  fastestEventMs: state.runStats?.fastestEventMs || 0,
                  // Variant breakdown (placeholder until tracking added)
                  variantCounts: state.runStats?.variantCounts || { swift: 0, standard: 0, grueling: 0 },
                  // Meta
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

      {/* Right: Sidebar - Drawer on mobile, static on desktop */}
      {isMobile ? (
        <>
          {/* Mobile FAB toggle */}
          <Fab
            size="medium"
            onClick={() => setDrawerOpen(!drawerOpen)}
            sx={{
              position: 'fixed',
              bottom: 16,
              right: 16,
              zIndex: 1200,
              bgcolor: tokens.colors.primary,
              color: '#fff',
              '&:hover': {
                bgcolor: tokens.colors.primary,
                opacity: 0.9,
              },
            }}
          >
            {drawerOpen ? <CloseIcon /> : <MenuIcon />}
          </Fab>
          <Drawer
            anchor="right"
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            PaperProps={{
              sx: {
                width: SIDEBAR_WIDTH,
                bgcolor: tokens.colors.background.paper,
              },
            }}
          >
            <PlaySidebar
              phase={sidebarPhase}
              width={SIDEBAR_WIDTH}
              onNewRun={(loadoutId, items) => {
                handleNewRun(loadoutId, items);
                setDrawerOpen(false); // Close drawer on new run
              }}
              onContinue={() => {
                handleContinue();
                setDrawerOpen(false); // Close drawer on continue
              }}
              onLaunch={() => {
                handleLaunch();
                setDrawerOpen(false); // Close drawer on launch
              }}
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
              isInShop={isInShop}
              isMobile={true}
            />
          </Drawer>
        </>
      ) : (
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
          isInShop={isInShop}
        />
      )}

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
        eventVariant={state.selectedZone?.eventVariant || 'standard'}
        loadoutStats={state.loadoutStats}
        inventoryItems={state.inventory?.powerups || []}
      />


    </Box>
  );
}
