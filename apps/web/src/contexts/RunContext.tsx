/**
 * RunContext - Unified game state for /play shell
 *
 * Manages center panel swapping (Balatro-style) and run state.
 * Globe3D for zone selection, combat/shop/doors/summary panels swap in center.
 *
 * Now includes integrated combat state management using ai-engine combat module.
 *
 * NEVER DIE GUY
 */

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
  useEffect,
  type ReactNode,
} from 'react';
import {
  saveRunState,
  loadSavedRun,
  hasSavedRun,
  clearSavedRun,
  addRunToHistory,
  type SavedRunState,
} from '../data/player/storage';
import {
  createInitialGameState,
  createThreadStartEvent,
  createRoomClearEvent,
  createDoorPickEvent,
  createShopBuyEvent,
  type GameState,
  type ProtocolRoll,
  type LedgerEvent,
  DOMAINS,
} from '../games/meteor/gameConfig';
import type { DoorPreview } from '../data/pools';
import type { ZoneMarker, DomainState } from '../types/zones';
import { generateDomain, getNextDomain } from '../data/domains';

// Combat system types from ai-engine
import type {
  CombatPhase,
  Die,
  GridState,
  EntityMap,
} from '@ndg/ai-engine';

// Center panel states (Balatro-style swapping)
export type CenterPanel = 'globe' | 'combat' | 'shop' | 'doors' | 'summary';

// Transition phases for orchestrated panel swaps
export type TransitionPhase = 'idle' | 'exit' | 'wipe' | 'enter';

// Combat state subset for RunContext (serializable)
export interface RunCombatState {
  phase: CombatPhase;
  hand: Die[];
  holdsRemaining: number;     // "Trades" remaining (swap dice for multiplier)
  throwsRemaining: number;    // Throws left this turn (2 per turn)
  targetScore: number;
  currentScore: number;
  multiplier: number;         // Score multiplier (1 base, increases via trades)
  turnsRemaining: number;
  turnNumber: number;
  enemiesSquished: number;
  friendlyHits: number;
  // Grid/entity references (non-serializable, regenerated on load)
  gridRef?: GridState;
  entitiesRef?: EntityMap;
}

// Extended run state with center panel
export interface RunState extends GameState {
  centerPanel: CenterPanel;
  transitionPhase: TransitionPhase;
  pendingPanel: CenterPanel | null; // Panel to switch to after wipe
  domainState: DomainState | null;
  selectedZone: ZoneMarker | null;
  lastRoomScore: number;
  lastRoomGold: number;
  runEnded: boolean;
  // Combat integration
  combatState: RunCombatState | null;
}

// Run context value
interface RunContextValue {
  // State
  state: RunState;

  // Derived values
  isPlaying: boolean;
  currentDomain: typeof DOMAINS[number] | undefined;

  // Panel actions
  setPanel: (panel: CenterPanel) => void;
  transitionToPanel: (panel: CenterPanel) => void;
  setTransitionPhase: (phase: TransitionPhase) => void;
  completeTransition: () => void;

  // Run lifecycle
  startRun: (threadId: string, protocolRoll?: ProtocolRoll, selectedTraveler?: string) => void;
  endRun: (won: boolean) => void;
  resetRun: () => void;

  // Zone selection (Globe3D -> combat)
  selectZone: (zone: ZoneMarker) => void;

  // Combat callbacks
  completeRoom: (score: number, gold: number, stats: { npcsSquished: number; diceThrown: number }) => void;
  failRoom: () => void;

  // Combat actions (Balatro-style dice management)
  initCombat: () => void;
  toggleHoldDie: (dieId: string) => void;
  throwDice: (rollResults: Die[]) => void;
  endCombatTurn: () => void;

  // Shop callbacks
  purchase: (cost: number, itemId: string, category: 'dice' | 'powerup' | 'upgrade') => void;
  continueFromShop: () => void;

  // Door selection
  selectDoor: (door: DoorPreview) => void;

  // Summary continue
  continueFromSummary: () => void;

  // Run persistence
  loadRun: () => boolean;
  hasSavedRun: () => boolean;
}

// Actions
type RunAction =
  | { type: 'SET_PANEL'; panel: CenterPanel }
  | { type: 'SET_TRANSITION_PHASE'; phase: TransitionPhase }
  | { type: 'TRANSITION_TO_PANEL'; panel: CenterPanel }
  | { type: 'COMPLETE_TRANSITION' }
  | { type: 'START_RUN'; threadId: string; protocolRoll?: ProtocolRoll; selectedTraveler?: string }
  | { type: 'END_RUN'; won: boolean }
  | { type: 'RESET_RUN' }
  | { type: 'SELECT_ZONE'; zone: ZoneMarker }
  | { type: 'COMPLETE_ROOM'; score: number; gold: number; stats: { npcsSquished: number; diceThrown: number } }
  | { type: 'FAIL_ROOM' }
  | { type: 'PURCHASE'; cost: number; itemId: string; category: 'dice' | 'powerup' | 'upgrade' }
  | { type: 'CONTINUE_FROM_SHOP' }
  | { type: 'SELECT_DOOR'; door: DoorPreview }
  | { type: 'CONTINUE_FROM_SUMMARY' }
  | { type: 'LOAD_RUN'; savedRun: SavedRunState }
  // Combat actions
  | { type: 'INIT_COMBAT'; combatState: RunCombatState }
  | { type: 'TOGGLE_HOLD_DIE'; dieId: string }
  | { type: 'THROW_DICE'; rollResults: Die[] }
  | { type: 'END_COMBAT_TURN' }
  | { type: 'UPDATE_COMBAT_SCORE'; score: number; enemiesSquished?: number; friendlyHits?: number };

// Initial state
function createInitialRunState(): RunState {
  return {
    ...createInitialGameState(),
    centerPanel: 'globe',
    transitionPhase: 'idle',
    pendingPanel: null,
    domainState: generateDomain(1),
    selectedZone: null,
    lastRoomScore: 0,
    lastRoomGold: 0,
    runEnded: false,
    combatState: null,
  };
}

// Reducer
function runReducer(state: RunState, action: RunAction): RunState {
  switch (action.type) {
    case 'SET_PANEL':
      return { ...state, centerPanel: action.panel };

    case 'SET_TRANSITION_PHASE':
      return { ...state, transitionPhase: action.phase };

    case 'TRANSITION_TO_PANEL':
      // Start transition sequence - set pending panel and begin exit phase
      return {
        ...state,
        transitionPhase: 'exit',
        pendingPanel: action.panel,
      };

    case 'COMPLETE_TRANSITION':
      // Wipe completed - swap to pending panel and reset transition state
      return {
        ...state,
        centerPanel: state.pendingPanel || state.centerPanel,
        transitionPhase: 'idle',
        pendingPanel: null,
      };

    case 'START_RUN': {
      const threadStartEvent = createThreadStartEvent(
        action.threadId,
        action.protocolRoll,
        action.selectedTraveler
      );
      return {
        ...createInitialRunState(),
        centerPanel: 'globe',
        threadId: action.threadId,
        protocolRoll: action.protocolRoll,
        ledger: [threadStartEvent],
        phase: 'playing',
      };
    }

    case 'END_RUN': {
      // Save run to history
      if (state.threadId) {
        addRunToHistory({
          threadId: state.threadId,
          won: action.won,
          totalScore: state.totalScore,
          gold: state.gold,
          domain: state.currentDomain,
          roomsCleared: state.runStats.eventsCompleted,
          stats: {
            bestRoll: state.runStats.bestRoll || 0,
            mostRolled: state.runStats.mostRolled || 'd20',
            diceThrown: state.runStats.diceThrown,
            npcsSquished: state.runStats.npcsSquished,
            purchases: state.runStats.purchases,
            killedBy: action.won ? undefined : state.runStats.killedBy,
          },
        });
      }
      return {
        ...state,
        runEnded: true,
        gameWon: action.won,
        phase: 'game_over',
      };
    }

    case 'RESET_RUN':
      clearSavedRun();
      return createInitialRunState();

    case 'LOAD_RUN': {
      const saved = action.savedRun;
      // Regenerate domain state from saved domain ID
      const restoredDomainState = saved.domainState
        ? {
            ...generateDomain(saved.domainState.id),
            clearedCount: saved.domainState.clearedCount,
          }
        : generateDomain(1);

      // Restore selectedZone from domain zones if we have a saved zone ID
      const restoredSelectedZone = saved.selectedZoneId && restoredDomainState
        ? restoredDomainState.zones.find(z => z.id === saved.selectedZoneId) ?? null
        : null;

      return {
        ...createInitialRunState(),
        threadId: saved.threadId,
        currentDomain: saved.currentDomain,
        roomNumber: saved.roomNumber,
        gold: saved.gold,
        totalScore: saved.totalScore,
        tier: saved.tier,
        phase: saved.phase as RunState['phase'],
        centerPanel: saved.centerPanel as CenterPanel,
        domainState: restoredDomainState,
        selectedZone: restoredSelectedZone,
        inventory: {
          ...createInitialRunState().inventory,
          ...saved.inventory,
        },
        runStats: {
          ...createInitialRunState().runStats,
          ...saved.runStats,
        },
      };
    }

    case 'SELECT_ZONE':
      // Store selected zone (transition happens on Launch click, not here)
      return {
        ...state,
        selectedZone: action.zone,
        phase: 'playing',
      };

    case 'COMPLETE_ROOM': {
      const roomClearEvent = createRoomClearEvent(
        state.roomNumber,
        action.score,
        action.gold
      );
      // Mark zone as cleared in domain state
      const updatedDomainState = state.domainState && state.selectedZone
        ? {
            ...state.domainState,
            zones: state.domainState.zones.map((z) =>
              z.id === state.selectedZone?.id ? { ...z, cleared: true } : z
            ),
            clearedCount: state.domainState.clearedCount + 1,
          }
        : state.domainState;

      return {
        ...state,
        centerPanel: 'summary',
        domainState: updatedDomainState,
        selectedZone: null,
        lastRoomScore: action.score,
        lastRoomGold: action.gold,
        totalScore: state.totalScore + action.score,
        gold: state.gold + action.gold,
        ledger: [...state.ledger, roomClearEvent],
        runStats: {
          ...state.runStats,
          npcsSquished: state.runStats.npcsSquished + action.stats.npcsSquished,
          diceThrown: state.runStats.diceThrown + action.stats.diceThrown,
          eventsCompleted: state.runStats.eventsCompleted + 1,
        },
      };
    }

    case 'FAIL_ROOM': {
      // Save run to history on failure
      if (state.threadId) {
        addRunToHistory({
          threadId: state.threadId,
          won: false,
          totalScore: state.totalScore,
          gold: state.gold,
          domain: state.currentDomain,
          roomsCleared: state.runStats.eventsCompleted,
          stats: {
            bestRoll: state.runStats.bestRoll || 0,
            mostRolled: state.runStats.mostRolled || 'd20',
            diceThrown: state.runStats.diceThrown,
            npcsSquished: state.runStats.npcsSquished,
            purchases: state.runStats.purchases,
            killedBy: state.runStats.killedBy,
          },
        });
      }
      return {
        ...state,
        runEnded: true,
        gameWon: false,
        phase: 'game_over',
      };
    }

    case 'CONTINUE_FROM_SUMMARY':
      return {
        ...state,
        centerPanel: 'shop',
        phase: 'shop',
      };

    case 'PURCHASE': {
      const shopBuyEvent = createShopBuyEvent(action.itemId, action.cost, state.tier);
      const newInventory = { ...state.inventory };

      if (action.category === 'dice') {
        newInventory.dice = { ...state.inventory.dice };
        newInventory.dice[action.itemId] = (newInventory.dice[action.itemId] || 0) + 1;
      } else if (action.category === 'powerup') {
        newInventory.powerups = [...state.inventory.powerups, action.itemId];
      } else if (action.category === 'upgrade') {
        newInventory.upgrades = [...state.inventory.upgrades, action.itemId];
      }

      return {
        ...state,
        gold: state.gold - action.cost,
        inventory: newInventory,
        ledger: [...state.ledger, shopBuyEvent],
        runStats: {
          ...state.runStats,
          purchases: state.runStats.purchases + 1,
        },
      };
    }

    case 'CONTINUE_FROM_SHOP': {
      // Check if all zones in domain are cleared
      const allZonesCleared = state.domainState
        ? state.domainState.clearedCount >= state.domainState.totalZones
        : state.roomNumber >= 3;

      if (!allZonesCleared) {
        // More zones to clear - back to globe for zone selection
        return {
          ...state,
          centerPanel: 'globe',
          phase: 'playing',
        };
      }

      // All zones cleared - advance domain or win
      const nextDomainId = state.domainState
        ? getNextDomain(state.domainState.id)
        : state.currentDomain < 6 ? state.currentDomain + 1 : null;

      if (!nextDomainId) {
        return {
          ...state,
          runEnded: true,
          gameWon: true,
          phase: 'game_over',
        };
      }

      // Next domain - generate new zones, back to globe
      return {
        ...state,
        centerPanel: 'globe',
        domainState: generateDomain(nextDomainId),
        currentDomain: nextDomainId,
        roomNumber: 1,
        completedEvents: [false, false, false],
        phase: 'playing',
      };
    }

    case 'SELECT_DOOR': {
      const doorPickEvent = createDoorPickEvent(
        action.door.doorType,
        action.door.promises,
        state.roomNumber
      );
      return {
        ...state,
        centerPanel: 'combat',
        roomNumber: state.roomNumber + 1,
        phase: 'playing',
        heat: action.door.doorType === 'elite' ? state.heat + 1 : state.heat,
        ledger: [...state.ledger, doorPickEvent],
      };
    }

    // ============================================
    // Combat Actions
    // ============================================

    case 'INIT_COMBAT':
      return {
        ...state,
        combatState: action.combatState,
      };

    case 'TOGGLE_HOLD_DIE': {
      if (!state.combatState) return state;

      const { hand, holdsRemaining } = state.combatState;
      const dieIndex = hand.findIndex((d) => d.id === action.dieId);
      if (dieIndex === -1) return state;

      const die = hand[dieIndex];

      if (die.isHeld) {
        // Unhold is always free
        const newHand = [...hand];
        newHand[dieIndex] = { ...die, isHeld: false };
        return {
          ...state,
          combatState: {
            ...state.combatState,
            hand: newHand,
          },
        };
      } else if (holdsRemaining > 0) {
        // Hold costs 1
        const newHand = [...hand];
        newHand[dieIndex] = { ...die, isHeld: true };
        return {
          ...state,
          combatState: {
            ...state.combatState,
            hand: newHand,
            holdsRemaining: holdsRemaining - 1,
          },
        };
      }

      // No holds remaining
      return state;
    }

    case 'THROW_DICE': {
      if (!state.combatState) return state;

      return {
        ...state,
        combatState: {
          ...state.combatState,
          hand: action.rollResults,
          phase: 'resolve' as CombatPhase,
        },
      };
    }

    case 'UPDATE_COMBAT_SCORE': {
      if (!state.combatState) return state;

      return {
        ...state,
        combatState: {
          ...state.combatState,
          currentScore: state.combatState.currentScore + action.score,
          enemiesSquished: state.combatState.enemiesSquished + (action.enemiesSquished || 0),
          friendlyHits: state.combatState.friendlyHits + (action.friendlyHits || 0),
        },
      };
    }

    case 'END_COMBAT_TURN': {
      if (!state.combatState) return state;

      const { currentScore, targetScore, turnsRemaining } = state.combatState;

      // Check victory
      if (currentScore >= targetScore) {
        return {
          ...state,
          combatState: {
            ...state.combatState,
            phase: 'victory' as CombatPhase,
          },
        };
      }

      // Check defeat
      if (turnsRemaining <= 1) {
        return {
          ...state,
          combatState: {
            ...state.combatState,
            phase: 'defeat' as CombatPhase,
            turnsRemaining: 0,
          },
        };
      }

      // Continue to next turn
      return {
        ...state,
        combatState: {
          ...state.combatState,
          phase: 'draw' as CombatPhase,
          turnsRemaining: turnsRemaining - 1,
          turnNumber: state.combatState.turnNumber + 1,
        },
      };
    }

    default:
      return state;
  }
}

// Context
const RunContext = createContext<RunContextValue | null>(null);

// Provider
export function RunProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(runReducer, undefined, createInitialRunState);

  // Derived values
  const isPlaying = state.centerPanel === 'combat';
  const currentDomain = DOMAINS.find((d) => d.id === state.currentDomain);

  // Actions
  const setPanel = useCallback((panel: CenterPanel) => {
    dispatch({ type: 'SET_PANEL', panel });
  }, []);

  const setTransitionPhase = useCallback((phase: TransitionPhase) => {
    dispatch({ type: 'SET_TRANSITION_PHASE', phase });
  }, []);

  const transitionToPanel = useCallback((panel: CenterPanel) => {
    dispatch({ type: 'TRANSITION_TO_PANEL', panel });
  }, []);

  const completeTransition = useCallback(() => {
    dispatch({ type: 'COMPLETE_TRANSITION' });
  }, []);

  const startRun = useCallback((threadId: string, protocolRoll?: ProtocolRoll, selectedTraveler?: string) => {
    dispatch({ type: 'START_RUN', threadId, protocolRoll, selectedTraveler });
  }, []);

  const endRun = useCallback((won: boolean) => {
    dispatch({ type: 'END_RUN', won });
  }, []);

  const resetRun = useCallback(() => {
    dispatch({ type: 'RESET_RUN' });
  }, []);

  const selectZone = useCallback((zone: ZoneMarker) => {
    dispatch({ type: 'SELECT_ZONE', zone });
  }, []);

  const completeRoom = useCallback((score: number, gold: number, stats: { npcsSquished: number; diceThrown: number }) => {
    dispatch({ type: 'COMPLETE_ROOM', score, gold, stats });
  }, []);

  const failRoom = useCallback(() => {
    dispatch({ type: 'FAIL_ROOM' });
  }, []);

  // Combat actions
  const initCombat = useCallback(() => {
    // Initialize combat state when entering combat
    // This sets up the initial hand, score targets, etc.
    const combatState: RunCombatState = {
      phase: 'draw',
      hand: [], // Will be populated by DiceMeteor component
      holdsRemaining: 2,    // "Trades" - swap dice for multiplier (2 per room)
      throwsRemaining: 3,   // 3 throws per turn
      targetScore: (state.selectedZone?.tier || 1) * 1000,
      currentScore: 0,
      multiplier: 1,        // Score multiplier (increases via trades)
      turnsRemaining: state.selectedZone?.eventType === 'boss' ? 8 : state.selectedZone?.eventType === 'big' ? 6 : 5,
      turnNumber: 1,
      enemiesSquished: 0,
      friendlyHits: 0,
    };
    dispatch({ type: 'INIT_COMBAT', combatState });
  }, [state.selectedZone]);

  const toggleHoldDie = useCallback((dieId: string) => {
    dispatch({ type: 'TOGGLE_HOLD_DIE', dieId });
  }, []);

  const throwDice = useCallback((rollResults: Die[]) => {
    dispatch({ type: 'THROW_DICE', rollResults });
  }, []);

  const endCombatTurn = useCallback(() => {
    dispatch({ type: 'END_COMBAT_TURN' });
  }, []);

  const purchase = useCallback((cost: number, itemId: string, category: 'dice' | 'powerup' | 'upgrade') => {
    dispatch({ type: 'PURCHASE', cost, itemId, category });
  }, []);

  const continueFromShop = useCallback(() => {
    dispatch({ type: 'CONTINUE_FROM_SHOP' });
  }, []);

  const selectDoor = useCallback((door: DoorPreview) => {
    dispatch({ type: 'SELECT_DOOR', door });
  }, []);

  const continueFromSummary = useCallback(() => {
    dispatch({ type: 'CONTINUE_FROM_SUMMARY' });
  }, []);

  // Load saved run from localStorage
  const loadRun = useCallback(() => {
    const savedRun = loadSavedRun();
    if (savedRun) {
      dispatch({ type: 'LOAD_RUN', savedRun });
      return true;
    }
    return false;
  }, []);

  // Check if there's a saved run
  const checkHasSavedRun = useCallback(() => {
    return hasSavedRun();
  }, []);

  // Auto-save run state when playing (not in lobby or game over)
  useEffect(() => {
    // Only save if we're in an active run
    if (state.phase !== 'playing' && state.phase !== 'shop') return;
    if (!state.threadId) return;

    const runState: SavedRunState = {
      threadId: state.threadId,
      currentDomain: state.currentDomain,
      roomNumber: state.roomNumber,
      gold: state.gold,
      totalScore: state.totalScore,
      tier: state.tier,
      phase: state.phase,
      centerPanel: state.centerPanel,
      domainState: state.domainState ? {
        id: state.domainState.id,
        name: state.domainState.name,
        clearedCount: state.domainState.clearedCount,
        totalZones: state.domainState.totalZones,
      } : null,
      selectedZoneId: state.selectedZone?.id ?? null,
      inventory: state.inventory,
      runStats: {
        npcsSquished: state.runStats.npcsSquished,
        diceThrown: state.runStats.diceThrown,
        eventsCompleted: state.runStats.eventsCompleted,
        purchases: state.runStats.purchases,
      },
      savedAt: Date.now(),
    };

    saveRunState(runState);
  }, [state.phase, state.threadId, state.currentDomain, state.roomNumber, state.gold, state.totalScore, state.tier, state.centerPanel, state.domainState, state.selectedZone, state.inventory, state.runStats]);

  const value = useMemo<RunContextValue>(() => ({
    state,
    isPlaying,
    currentDomain,
    setPanel,
    transitionToPanel,
    setTransitionPhase,
    completeTransition,
    startRun,
    endRun,
    resetRun,
    selectZone,
    completeRoom,
    failRoom,
    initCombat,
    toggleHoldDie,
    throwDice,
    endCombatTurn,
    purchase,
    continueFromShop,
    selectDoor,
    continueFromSummary,
    loadRun,
    hasSavedRun: checkHasSavedRun,
  }), [
    state,
    isPlaying,
    currentDomain,
    setPanel,
    transitionToPanel,
    setTransitionPhase,
    completeTransition,
    startRun,
    endRun,
    resetRun,
    selectZone,
    completeRoom,
    failRoom,
    initCombat,
    toggleHoldDie,
    throwDice,
    endCombatTurn,
    purchase,
    continueFromShop,
    selectDoor,
    continueFromSummary,
    loadRun,
    checkHasSavedRun,
  ]);

  return <RunContext.Provider value={value}>{children}</RunContext.Provider>;
}

// Hook
export function useRun(): RunContextValue {
  const context = useContext(RunContext);
  if (!context) {
    throw new Error('useRun must be used within a RunProvider');
  }
  return context;
}
