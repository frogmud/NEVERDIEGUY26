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
  loadHeatData,
  saveHeatData,
  incrementHeat,
  resetHeat,
  loadCorruptionData,
  saveCorruptionData,
  type SavedRunState,
} from '../data/player/storage';
import {
  createInitialGameState,
  createThreadStartEvent,
  createRoomClearEvent,
  createDoorPickEvent,
  createShopBuyEvent,
  type GameState,
  type EncounterState,
  type ProtocolRoll,
  type LedgerEvent,
  DOMAINS,
} from '../games/meteor/gameConfig';
import { type ZoneMarker, type DomainState } from '../types/zones';
import { generateDomain, getNextDomain, DOMAIN_CONFIGS } from '../data/domains';
import {
  logRunStart,
  logRoomClear,
  logDomainClear,
  logShopPurchase,
  logRunEnd,
  logDefeat,
} from '../utils/telemetry';
import { getBonusesFromInventory, filterPersistentItems } from '../data/items/combat-effects';
import { getEarlyFinishBonus, calculateGoldGain, filterPersistentItems as filterPersistentItemsByRarity } from '../data/balance-config';
import { type PortalOption, calculateHpAfterTravel, getAvailablePortals, isFinale } from '../data/portal-config';
import { getFlatScoreGoal, getFlatGoldReward, type LoadoutStats } from '@ndg/ai-engine';
import { getLoadoutById, LOADOUT_PRESETS } from '../data/loadouts';

// Combat system types from ai-engine
import type {
  CombatPhase,
  Die,
  GridState,
  EntityMap,
} from '@ndg/ai-engine';

// Encounter system types from ai-engine
import type {
  EnemyEncounter,
  EncounterResult,
  EncounterContext,
} from '@ndg/ai-engine';
import { generateEncounter } from '@ndg/ai-engine';

// Dice bag system for persistent dice across run
import type { DiceBag, DieConfig } from '@ndg/ai-engine';
import {
  createDiceBag,
  drawDiceBagHand,
  throwDiceBagDice,
  tradeDiceBagDice,
  endDiceBagEvent,
  resetDiceBagForEvent,
  addDiceFromConfig,
  removeDiceBagDice,
  rollDiceBagHand,
  toggleDiceBagHold,
  getBagSummary,
  DEFAULT_STARTING_DICE,
  createSeededRng,
} from '@ndg/ai-engine';

// Center panel states (Balatro-style swapping)
// 'portals' replaces doors - shown after combat win (D1-5)
// 'summary' is ONLY for final victory after D6
// shop is now in sidebar (not a center panel)
export type CenterPanel = 'globe' | 'combat' | 'portals' | 'summary';

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
  // Time pressure system (turn-based decay)
  timePressureMultiplier?: number;  // 0.60-1.00, score decay multiplier
  isGracePeriod?: boolean;          // True during first 2 turns (no decay)
  // Grid/entity references (non-serializable, regenerated on load)
  gridRef?: GridState;
  entitiesRef?: EntityMap;
}

// Victory data to be applied atomically during transition
export interface PendingVictory {
  score: number;
  gold: number;
  turnsRemaining: number;  // For early finish bonus calculation
  stats: { npcsSquished: number; diceThrown: number };
  bestThrowScore?: number;  // Best single throw score this event
}

// Early finish bonus info (for victory screen)
export interface RoomBonus {
  turnsRemaining: number;
  bonusMultiplier: number;  // e.g., 1.3 = 30% bonus
  bonusGold: number;        // Just the bonus portion
}

// Extended run state with center panel
// Use Omit to exclude currentEncounter from GameState before re-declaring
// This avoids type conflict with EnemyEncounter from ai-engine
export interface RunState extends Omit<GameState, 'currentEncounter'> {
  currentEncounter: EncounterState | null;
  centerPanel: CenterPanel;
  transitionPhase: TransitionPhase;
  pendingPanel: CenterPanel | null; // Panel to switch to after wipe
  pendingVictory: PendingVictory | null; // Victory data to apply when transition completes
  domainState: DomainState | null;
  selectedZone: ZoneMarker | null;
  lastRoomScore: number;
  lastRoomGold: number;
  lastRoomBonus: RoomBonus | null;  // Early finish bonus info for UI
  runEnded: boolean;
  // Combat integration
  combatState: RunCombatState | null;
  // Dice bag (persistent dice collection across run)
  diceBag: DiceBag | null;
  // Practice mode (Battle Now) - single combat, no progression
  practiceMode: boolean;
  // Flume transition (domain-to-domain)
  showingFlume: boolean;
  flumeToDomain: number | null;  // Target domain for flume
  // Scar/Crater HP system (flat structure: 4 scars = game over)
  scars: number;  // 0-4, failed events add 1 scar, 4 = planet destroyed
  // Loadout stats for combat effects (fury, resilience, grit, etc.)
  loadoutStats: LoadoutStats;
  // Track if grit immunity has been used this run
  gritImmunityUsed: boolean;
  // Timing tracking for speedrun stats
  runStartTime: number;    // Timestamp when run started
  eventStartTime: number;  // Timestamp when current event started
  // Portal system (distance-based domain travel)
  visitedDomains: number[];           // Track visited domains for portal generation
  directorAffinity: string | null;    // Die-rector slug from first die (e.g., 'jane')
  travelMultipliers: {                // Applied from last portal choice
    scoreMultiplier: number;          // 1.0 to 1.5
    goldMultiplier: number;           // 1.0 to 1.75
  };
  hp: number;                          // Current HP (100 max, travel damage reduces)
  // Heat system (streak-based difficulty)
  heat: number;                        // Current heat level (resets on death)
  // Enemy encounter system (during flume transit)
  activeEnemyEncounter: EnemyEncounter | null;  // Active encounter during flume
  enemyEncounterIndex: number;                   // Counter for seeded encounter generation
  enemyEncounterResults: EncounterResult[];      // History of encounter outcomes this run
  // Corruption system (0-100, affects Trinity encounter chance)
  corruption: number;
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
  startRun: (threadId: string, protocolRoll?: ProtocolRoll, selectedTraveler?: string, selectedLoadout?: string, startingItems?: string[], startingDomain?: number) => void;
  startPractice: () => void;
  endRun: (won: boolean) => void;
  resetRun: () => void;

  // Zone selection (Globe3D -> combat)
  selectZone: (zone: ZoneMarker) => void;

  // Combat callbacks
  setPendingVictory: (payload: PendingVictory) => void;
  completeRoom: (score: number, gold: number, stats: { npcsSquished: number; diceThrown: number }) => void;
  failRoom: () => void;

  // Combat actions (Balatro-style dice management)
  initCombat: () => void;
  toggleHoldDie: (dieId: string) => void;
  throwDice: (rollResults: Die[]) => void;
  endCombatTurn: () => void;

  // Dice bag actions (persistent dice collection)
  initDiceBag: (startingDice?: DieConfig[]) => void;
  drawDiceBagHand: () => void;
  throwDiceBag: () => void;
  tradeDiceBag: (count?: number) => void;
  endDiceBagEvent: () => void;
  addDiceToBag: (configs: DieConfig[]) => void;
  removeDiceFromBag: (dieIds: string[]) => void;
  toggleDiceBagHold: (dieId: string) => void;
  rollDiceBag: () => void;
  getDiceBagSummary: () => ReturnType<typeof getBagSummary> | null;

  // Shop callbacks
  purchase: (cost: number, itemId: string, category: 'dice' | 'powerup' | 'upgrade') => void;
  continueFromShop: () => void;

  // Portal selection (replaces doors)
  selectPortal: (portal: PortalOption) => void;

  // Summary continue
  continueFromSummary: () => void;

  // Flume transitions
  completeFlumeTransition: () => void;

  // Encounter system
  triggerEncounter: () => void;
  completeEncounter: (result: EncounterResult) => void;
  skipEncounter: () => void;

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
  | { type: 'START_RUN'; threadId: string; protocolRoll?: ProtocolRoll; selectedTraveler?: string; selectedLoadout?: string; startingItems?: string[]; startingDomain?: number }
  | { type: 'START_PRACTICE' }
  | { type: 'END_RUN'; won: boolean }
  | { type: 'RESET_RUN' }
  | { type: 'SELECT_ZONE'; zone: ZoneMarker }
  | { type: 'COMPLETE_ROOM'; score: number; gold: number; stats: { npcsSquished: number; diceThrown: number } }
  | { type: 'FAIL_ROOM' }
  | { type: 'PURCHASE'; cost: number; itemId: string; category: 'dice' | 'powerup' | 'upgrade' }
  | { type: 'CONTINUE_FROM_SHOP' }
  | { type: 'SELECT_PORTAL'; portal: PortalOption }
  | { type: 'CONTINUE_FROM_SUMMARY' }
  | { type: 'LOAD_RUN'; savedRun: SavedRunState }
  // Combat actions
  | { type: 'INIT_COMBAT'; combatState: RunCombatState }
  | { type: 'TOGGLE_HOLD_DIE'; dieId: string }
  | { type: 'THROW_DICE'; rollResults: Die[] }
  | { type: 'END_COMBAT_TURN' }
  | { type: 'UPDATE_COMBAT_SCORE'; score: number; enemiesSquished?: number; friendlyHits?: number }
  | { type: 'SET_PENDING_VICTORY'; payload: PendingVictory }
  // Flume transition
  | { type: 'COMPLETE_FLUME_TRANSITION' }
  // Encounter actions
  | { type: 'TRIGGER_ENCOUNTER'; encounter: EnemyEncounter }
  | { type: 'COMPLETE_ENCOUNTER'; result: EncounterResult }
  | { type: 'SKIP_ENCOUNTER' }
  // Dice bag actions
  | { type: 'INIT_DICE_BAG'; startingDice?: DieConfig[] }
  | { type: 'DRAW_DICE_BAG_HAND' }
  | { type: 'THROW_DICE_BAG' }
  | { type: 'TRADE_DICE_BAG'; count?: number }
  | { type: 'END_DICE_BAG_EVENT' }
  | { type: 'ADD_DICE_TO_BAG'; configs: DieConfig[] }
  | { type: 'REMOVE_DICE_FROM_BAG'; dieIds: string[] }
  | { type: 'TOGGLE_DICE_BAG_HOLD'; dieId: string }
  | { type: 'ROLL_DICE_BAG' };

// Initial state
function createInitialRunState(): RunState {
  return {
    ...createInitialGameState(),
    centerPanel: 'globe',
    transitionPhase: 'idle',
    pendingPanel: null,
    pendingVictory: null,
    domainState: generateDomain(1),
    selectedZone: null,
    lastRoomScore: 0,
    lastRoomGold: 0,
    lastRoomBonus: null,
    runEnded: false,
    combatState: null,
    diceBag: null,
    practiceMode: false,
    showingFlume: false,
    flumeToDomain: null,
    scars: 0,  // Start with no scars, 4 = game over
    loadoutStats: {},  // Set when run starts with selected loadout
    gritImmunityUsed: false,
    runStartTime: 0,
    eventStartTime: 0,
    // Portal system
    visitedDomains: [],
    directorAffinity: null,
    travelMultipliers: { scoreMultiplier: 1.0, goldMultiplier: 1.0 },
    hp: 100,  // Start at full HP
    // Heat system
    heat: 0,  // Loaded from storage on START_RUN
    // Enemy encounter system
    activeEnemyEncounter: null,
    enemyEncounterIndex: 0,
    enemyEncounterResults: [],
    // Corruption system
    corruption: 0,
  };
}

// Reducer
function runReducer(state: RunState, action: RunAction): RunState {
  switch (action.type) {
    case 'SET_PANEL':
      return { ...state, centerPanel: action.panel };

    case 'SET_TRANSITION_PHASE':
      return { ...state, transitionPhase: action.phase };

    case 'TRANSITION_TO_PANEL': {
      // Immediate panel swap (no wipe animation)
      // Apply pending victory data if transitioning to portals/summary
      if ((action.panel === 'portals' || action.panel === 'summary') && state.pendingVictory) {
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

        // Calculate early finish bonus
        const turnsRemaining = state.pendingVictory.turnsRemaining;
        const bonusMultiplier = getEarlyFinishBonus(turnsRemaining);
        const baseGold = state.pendingVictory.gold;
        const totalGold = Math.floor(baseGold * bonusMultiplier);
        const bonusGold = totalGold - baseGold;

        // Store bonus info for UI (only if there's a bonus)
        const roomBonus: RoomBonus | null = turnsRemaining > 0 ? {
          turnsRemaining,
          bonusMultiplier,
          bonusGold,
        } : null;

        // Calculate event time for performance stats
        const eventTimeMs = state.eventStartTime > 0 ? Date.now() - state.eventStartTime : 0;
        const newEventTimes = [...(state.runStats.eventTimesMs || []), eventTimeMs];
        const avgEventTimeMs = newEventTimes.length > 0
          ? Math.round(newEventTimes.reduce((a, b) => a + b, 0) / newEventTimes.length)
          : 0;
        const fastestEventMs = newEventTimes.length > 0
          ? Math.min(...newEventTimes.filter(t => t > 0))
          : 0;

        // Update best roll if this event had a better one
        const bestThrowScore = state.pendingVictory.bestThrowScore || 0;
        const newBestRoll = Math.max(state.runStats.bestRoll || 0, bestThrowScore);

        // End dice bag event - consumes exhausted dice permanently
        const updatedDiceBag = state.diceBag ? endDiceBagEvent(state.diceBag) : null;

        return {
          ...state,
          centerPanel: action.panel,
          transitionPhase: 'idle',
          pendingPanel: null,
          domainState: updatedDomainState,
          selectedZone: null,
          lastRoomScore: state.pendingVictory.score,
          lastRoomGold: totalGold,
          lastRoomBonus: roomBonus,
          totalScore: state.totalScore + state.pendingVictory.score,
          gold: state.gold + calculateGoldGain(totalGold, state.gold),
          pendingVictory: null,
          diceBag: updatedDiceBag,
          runStats: {
            ...state.runStats,
            npcsSquished: state.runStats.npcsSquished + state.pendingVictory.stats.npcsSquished,
            diceThrown: state.runStats.diceThrown + state.pendingVictory.stats.diceThrown,
            eventsCompleted: state.runStats.eventsCompleted + 1,
            totalTimeMs: state.runStartTime > 0 ? Date.now() - state.runStartTime : 0,
            avgEventTimeMs,
            fastestEventMs: fastestEventMs > 0 ? fastestEventMs : 0,
            eventTimesMs: newEventTimes,
            bestRoll: newBestRoll,
          },
        };
      }

      // Simple panel swap (no pending victory)
      return {
        ...state,
        centerPanel: action.panel,
        transitionPhase: 'idle',
        pendingPanel: null,
      };
    }

    case 'COMPLETE_TRANSITION': {
      // Wipe completed - swap to pending panel and reset transition state
      // Victory data already applied in TRANSITION_TO_PANEL - no duplicate application
      const newState = {
        ...state,
        centerPanel: state.pendingPanel || state.centerPanel,
        transitionPhase: 'idle' as const,
        pendingPanel: null,
      };

      return newState;
    }

    case 'START_RUN': {
      const threadStartEvent = createThreadStartEvent(
        action.threadId,
        action.protocolRoll,
        action.selectedTraveler
      );
      const initialState = createInitialRunState();
      // Use starting domain from homepage NPC or default to 1
      const domainId = action.startingDomain || 1;
      // Get loadout stats from selected loadout
      const loadout = getLoadoutById(action.selectedLoadout || 'survivor');
      const loadoutStats: LoadoutStats = loadout?.statBonus || {};
      // Load heat from storage (persistent streak)
      const heatData = loadHeatData();
      // Load corruption from storage (persistent across runs)
      const corruptionData = loadCorruptionData();
      return {
        ...initialState,
        centerPanel: 'globe',
        threadId: action.threadId,
        protocolRoll: action.protocolRoll,
        ledger: [threadStartEvent],
        phase: 'playing',
        // Set starting domain (from homepage NPC offering)
        currentDomain: domainId,
        domainState: generateDomain(domainId),
        // Initialize inventory with loadout items
        inventory: {
          ...initialState.inventory,
          powerups: action.startingItems || [],
        },
        // Set loadout stats for combat effects
        loadoutStats,
        gritImmunityUsed: false,
        runStartTime: Date.now(),
        eventStartTime: 0,
        // Portal system - track starting domain as visited
        visitedDomains: [domainId],
        directorAffinity: null,  // Set when first die is picked
        travelMultipliers: { scoreMultiplier: 1.0, goldMultiplier: 1.0 },
        hp: 100,
        // Initialize dice bag for the run
        diceBag: createDiceBag(action.threadId, DEFAULT_STARTING_DICE),
        // Heat system - load current streak
        heat: heatData.currentHeat,
        // Corruption system - load from homepage
        corruption: corruptionData.level,
      };
    }

    case 'START_PRACTICE': {
      // Practice mode: random domain, single combat, no progression
      const randomDomainId = Math.floor(Math.random() * 6) + 1;
      const initialState = createInitialRunState();
      const threadId = `PRACTICE-${Math.random().toString(16).slice(2, 8).toUpperCase()}`;
      return {
        ...initialState,
        centerPanel: 'globe',
        threadId,
        phase: 'playing',
        practiceMode: true,
        currentDomain: randomDomainId,
        domainState: generateDomain(randomDomainId),
        // Initialize dice bag for practice mode
        diceBag: createDiceBag(threadId, DEFAULT_STARTING_DICE),
      };
    }

    case 'END_RUN': {
      // Save run to history (skip for practice mode)
      if (state.threadId && !state.practiceMode) {
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
            heatAtDeath: action.won ? undefined : state.heat,
          },
        });
      }
      // Reset heat on death (streak broken)
      if (!action.won && !state.practiceMode) {
        saveHeatData(resetHeat(loadHeatData()));
      }
      // Persist corruption to storage (carries over to next run)
      if (!state.practiceMode) {
        saveCorruptionData({
          level: state.corruption,
          updatedAt: Date.now(),
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
        scars: saved.scars ?? 0,  // Restore scar count (default 0 for old saves)
        corruption: saved.corruption ?? 0,  // Restore corruption (default 0 for old saves)
      };
    }

    case 'SELECT_ZONE':
      // Store selected zone (transition happens on Launch click, not here)
      return {
        ...state,
        selectedZone: action.zone,
        phase: 'playing',
        eventStartTime: Date.now(),  // Track when event starts for timing stats
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
      // Check for grit immunity (20+ grit = first fail blocked)
      const grit = state.loadoutStats.grit || 0;
      const hasGritImmunity = grit >= 20 && !state.gritImmunityUsed;

      if (hasGritImmunity) {
        // Grit immunity activated - no scar, but immunity is consumed
        return {
          ...state,
          gritImmunityUsed: true,
          selectedZone: null,
          centerPanel: 'globe',  // Back to zone selection
          combatState: null,     // Clear combat state
        };
      }

      // Scar system: failed event adds 1 scar, 4 scars = game over
      const newScars = state.scars + 1;
      const isGameOver = newScars >= 4;

      if (isGameOver) {
        // 4 scars = planet destroyed = game over
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
              heatAtDeath: state.heat,
            },
          });
        }
        // Reset heat on death (streak broken)
        if (!state.practiceMode) {
          saveHeatData(resetHeat(loadHeatData()));
        }
        return {
          ...state,
          scars: newScars,
          runEnded: true,
          gameWon: false,
          phase: 'game_over',
        };
      }

      // Less than 4 scars - add scar and return to zone selection
      // Clear selected zone so player can try again or pick different zone
      return {
        ...state,
        scars: newScars,
        selectedZone: null,
        centerPanel: 'globe',  // Back to zone selection
        combatState: null,     // Clear combat state
      };
    }

    case 'CONTINUE_FROM_SUMMARY':
      // After summary (D6 finale victory), return to globe
      // Shop is now handled in sidebar for D2-6
      return {
        ...state,
        centerPanel: 'globe',
        // Phase stays 'playing' if continuing, or could reset
      };

    case 'PURCHASE': {
      // Validate gold before purchase
      if (state.gold < action.cost) {
        console.warn('Purchase attempted with insufficient gold');
        return state;
      }

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
      const nextDomainId = getNextDomain(state.domainState?.id ?? state.currentDomain);

      if (!nextDomainId) {
        // Final victory! Save run to history
        if (state.threadId && !state.practiceMode) {
          addRunToHistory({
            threadId: state.threadId,
            won: true,
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
            },
          });
        }
        // Log final victory
        logRunEnd(
          true,
          state.totalScore,
          state.gold,
          state.currentDomain || 6,
          state.runStats.eventsCompleted
        );
        return {
          ...state,
          centerPanel: 'globe', // Reset panel so PlayHub shows victory overlay
          runEnded: true,
          gameWon: true,
          phase: 'game_over',
        };
      }

      // DOMAIN TRANSITION - Expire non-persistent items
      // Common/Uncommon items (including starting loadout) expire
      // Epic/Legendary/Unique persist, flagged Rare items persist
      const persistentPowerups = filterPersistentItems(state.inventory.powerups);

      // Log domain clear
      logDomainClear(
        state.currentDomain || 1,
        state.domainState?.name || 'Unknown',
        state.totalScore,
        state.gold || 0
      );

      // Next domain - advance with filtered inventory
      return {
        ...state,
        centerPanel: 'globe',
        domainState: generateDomain(nextDomainId),
        currentDomain: nextDomainId,
        roomNumber: 1,
        completedEvents: [false, false, false],
        phase: 'playing',
        // Expire domain-scoped items
        inventory: {
          ...state.inventory,
          powerups: persistentPowerups,
        },
      };
    }

    case 'SELECT_PORTAL': {
      const { portal } = action;

      // Apply travel damage (can't die from travel - min 1 HP)
      const newHp = calculateHpAfterTravel(state.hp, portal.travelDamage);

      // Expire non-persistent items (Common/Uncommon expire, Epic+ persist)
      const persistentPowerups = filterPersistentItems(state.inventory.powerups);

      // Check if this is the finale (Null Providence)
      const isFinalePortal = isFinale(portal.domainId);

      // Increment heat (completed a domain, moving to next)
      const updatedHeatData = incrementHeat(loadHeatData());
      saveHeatData(updatedHeatData);

      return {
        ...state,
        // Navigate to new domain
        currentDomain: portal.domainId,
        domainState: generateDomain(portal.domainId),
        centerPanel: 'globe',  // Shop shows in sidebar for D2+
        phase: 'playing',
        // Portal system updates
        visitedDomains: [...state.visitedDomains, portal.domainId],
        hp: newHp,
        travelMultipliers: {
          scoreMultiplier: portal.scoreMultiplier,
          goldMultiplier: portal.goldMultiplier,
        },
        // Expire items
        inventory: {
          ...state.inventory,
          powerups: persistentPowerups,
        },
        // Reset room tracking for new domain
        roomNumber: 1,
        selectedZone: null,
        // Heat incremented after domain completion
        heat: updatedHeatData.currentHeat,
      };
    }

    // ============================================
    // Combat Actions
    // ============================================

    case 'SET_PENDING_VICTORY':
      return {
        ...state,
        pendingVictory: action.payload,
      };

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

    // ============================================
    // Encounter Actions
    // ============================================

    case 'TRIGGER_ENCOUNTER': {
      return {
        ...state,
        activeEnemyEncounter: action.encounter,
      };
    }

    case 'COMPLETE_ENCOUNTER': {
      // Apply encounter effects to player state
      let newState = { ...state };

      for (const effect of action.result.effects) {
        switch (effect.type) {
          case 'corruption':
            newState.corruption = Math.min(100, (newState.corruption || 0) + effect.value);
            break;
          case 'grit':
            newState.loadoutStats = {
              ...newState.loadoutStats,
              grit: (newState.loadoutStats.grit || 0) + effect.value,
            };
            break;
          case 'resource':
            if (effect.target === 'health') {
              newState.hp = Math.min(100, Math.max(0, newState.hp + effect.value));
            }
            break;
          // favor, buff, debuff effects would integrate with NPC systems
        }
      }

      return {
        ...newState,
        activeEnemyEncounter: null,
        enemyEncounterIndex: state.enemyEncounterIndex + 1,
        enemyEncounterResults: [...state.enemyEncounterResults, action.result],
      };
    }

    case 'SKIP_ENCOUNTER': {
      // Skip without any effects
      return {
        ...state,
        activeEnemyEncounter: null,
        enemyEncounterIndex: state.enemyEncounterIndex + 1,
      };
    }

    case 'COMPLETE_FLUME_TRANSITION': {
      // Flume animation completed - clear flume state
      // Domain transition should already be applied when flume started
      return {
        ...state,
        showingFlume: false,
        flumeToDomain: null,
      };
    }

    // ============================================
    // Dice Bag Actions
    // ============================================

    case 'INIT_DICE_BAG': {
      const startingDice = action.startingDice || DEFAULT_STARTING_DICE;
      const runId = state.threadId || `run-${Date.now()}`;
      const newBag = createDiceBag(runId, startingDice);
      return {
        ...state,
        diceBag: newBag,
      };
    }

    case 'DRAW_DICE_BAG_HAND': {
      if (!state.diceBag) return state;
      const rng = createSeededRng(state.threadId || 'default');
      const updatedBag = drawDiceBagHand(state.diceBag, rng);
      return {
        ...state,
        diceBag: updatedBag,
      };
    }

    case 'THROW_DICE_BAG': {
      if (!state.diceBag) return state;
      const updatedBag = throwDiceBagDice(state.diceBag);
      return {
        ...state,
        diceBag: updatedBag,
      };
    }

    case 'TRADE_DICE_BAG': {
      if (!state.diceBag) return state;
      const updatedBag = tradeDiceBagDice(state.diceBag, action.count || 0);
      return {
        ...state,
        diceBag: updatedBag,
      };
    }

    case 'END_DICE_BAG_EVENT': {
      if (!state.diceBag) return state;
      const updatedBag = endDiceBagEvent(state.diceBag);
      return {
        ...state,
        diceBag: updatedBag,
      };
    }

    case 'ADD_DICE_TO_BAG': {
      if (!state.diceBag) return state;
      const updatedBag = addDiceFromConfig(state.diceBag, action.configs);
      return {
        ...state,
        diceBag: updatedBag,
      };
    }

    case 'REMOVE_DICE_FROM_BAG': {
      if (!state.diceBag) return state;
      const updatedBag = removeDiceBagDice(state.diceBag, action.dieIds);
      return {
        ...state,
        diceBag: updatedBag,
      };
    }

    case 'TOGGLE_DICE_BAG_HOLD': {
      if (!state.diceBag) return state;
      const updatedBag = toggleDiceBagHold(state.diceBag, action.dieId);
      return {
        ...state,
        diceBag: updatedBag,
      };
    }

    case 'ROLL_DICE_BAG': {
      if (!state.diceBag) return state;
      const rng = createSeededRng(state.threadId || 'default');
      const updatedBag = rollDiceBagHand(state.diceBag, rng);
      return {
        ...state,
        diceBag: updatedBag,
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

  const startRun = useCallback((threadId: string, protocolRoll?: ProtocolRoll, selectedTraveler?: string, selectedLoadout?: string, startingItems?: string[], startingDomain?: number) => {
    logRunStart(selectedLoadout || 'default', threadId);
    dispatch({ type: 'START_RUN', threadId, protocolRoll, selectedTraveler, selectedLoadout, startingItems, startingDomain });
  }, []);

  const startPractice = useCallback(() => {
    dispatch({ type: 'START_PRACTICE' });
  }, []);

  const endRun = useCallback((won: boolean) => {
    logRunEnd(
      won,
      state.totalScore,
      state.gold,
      state.currentDomain || 1,
      state.runStats.eventsCompleted
    );
    dispatch({ type: 'END_RUN', won });
  }, [state.totalScore, state.gold, state.currentDomain, state.runStats.eventsCompleted]);

  const resetRun = useCallback(() => {
    dispatch({ type: 'RESET_RUN' });
  }, []);

  const selectZone = useCallback((zone: ZoneMarker) => {
    dispatch({ type: 'SELECT_ZONE', zone });
  }, []);

  const setPendingVictory = useCallback((payload: PendingVictory) => {
    dispatch({ type: 'SET_PENDING_VICTORY', payload });
  }, []);

  const completeRoom = useCallback((score: number, gold: number, stats: { npcsSquished: number; diceThrown: number }) => {
    // Log room clear with domain-based target
    const domain = state.currentDomain || 1;
    const room = state.roomNumber || 1;
    const targetScore = getFlatScoreGoal(domain);
    logRoomClear(domain, room, score, targetScore, gold, stats.diceThrown);

    // Check if this completes the domain (3/3 zones)
    const clearedAfter = (state.domainState?.clearedCount || 0) + 1;
    if (clearedAfter >= (state.domainState?.totalZones || 3)) {
      const domainName = DOMAIN_CONFIGS[domain]?.name || `Domain ${domain}`;
      logDomainClear(domain, domainName, state.totalScore + score, state.gold + gold);
    }

    dispatch({ type: 'COMPLETE_ROOM', score, gold, stats });
  }, [state.currentDomain, state.roomNumber, state.domainState, state.totalScore, state.gold]);

  const failRoom = useCallback(() => {
    // Log defeat with domain-based target
    const domain = state.currentDomain || 1;
    const targetScore = getFlatScoreGoal(domain);
    logDefeat(
      state.combatState?.currentScore || 0,
      targetScore,
      domain,
      state.roomNumber || 1
    );
    logRunEnd(
      false,
      state.totalScore,
      state.gold,
      state.currentDomain || 1,
      state.runStats.eventsCompleted
    );
    dispatch({ type: 'FAIL_ROOM' });
  }, [state.combatState?.currentScore, state.currentDomain, state.roomNumber, state.totalScore, state.gold, state.runStats.eventsCompleted]);

  // Combat actions
  const initCombat = useCallback(() => {
    // Initialize combat state when entering combat
    // This sets up the initial hand, score targets, etc.

    // Get item bonuses from inventory (powerups + upgrades)
    const allItems = [...(state.inventory?.powerups || []), ...(state.inventory?.upgrades || [])];
    const bonuses = getBonusesFromInventory(allItems);

    // Base values + item bonuses
    const baseThrows = 3;
    const baseTrades = 2;
    const baseMultiplier = 1;

    // Use flat structure: domain-based score goals, 5 throws always
    const domain = state.currentDomain || 1;

    const combatState: RunCombatState = {
      phase: 'draw',
      hand: [], // Will be populated by DiceMeteor component
      holdsRemaining: baseTrades + bonuses.bonusTrades,      // 2 base + item bonuses
      throwsRemaining: baseThrows + bonuses.bonusThrows,     // 3 base + item bonuses
      targetScore: getFlatScoreGoal(domain, state.heat),      // Domain + heat scaling (800-4000 base)
      currentScore: bonuses.startingScore,                    // Start with bonus score
      multiplier: baseMultiplier * bonuses.scoreMultiplier,   // Base multiplier * item bonus
      turnsRemaining: 5,                                      // Flat structure: always 5 throws
      turnNumber: 1,
      enemiesSquished: 0,
      friendlyHits: 0,
    };
    dispatch({ type: 'INIT_COMBAT', combatState });
  }, [state.currentDomain, state.inventory, state.heat]);

  const toggleHoldDie = useCallback((dieId: string) => {
    dispatch({ type: 'TOGGLE_HOLD_DIE', dieId });
  }, []);

  const throwDice = useCallback((rollResults: Die[]) => {
    dispatch({ type: 'THROW_DICE', rollResults });
  }, []);

  const endCombatTurn = useCallback(() => {
    dispatch({ type: 'END_COMBAT_TURN' });
  }, []);

  // Dice bag actions
  const initDiceBag = useCallback((startingDice?: DieConfig[]) => {
    dispatch({ type: 'INIT_DICE_BAG', startingDice });
  }, []);

  const drawDiceBagHandAction = useCallback(() => {
    dispatch({ type: 'DRAW_DICE_BAG_HAND' });
  }, []);

  const throwDiceBagAction = useCallback(() => {
    dispatch({ type: 'THROW_DICE_BAG' });
  }, []);

  const tradeDiceBagAction = useCallback((count?: number) => {
    dispatch({ type: 'TRADE_DICE_BAG', count });
  }, []);

  const endDiceBagEventAction = useCallback(() => {
    dispatch({ type: 'END_DICE_BAG_EVENT' });
  }, []);

  const addDiceToBag = useCallback((configs: DieConfig[]) => {
    dispatch({ type: 'ADD_DICE_TO_BAG', configs });
  }, []);

  const removeDiceFromBag = useCallback((dieIds: string[]) => {
    dispatch({ type: 'REMOVE_DICE_FROM_BAG', dieIds });
  }, []);

  const toggleDiceBagHoldAction = useCallback((dieId: string) => {
    dispatch({ type: 'TOGGLE_DICE_BAG_HOLD', dieId });
  }, []);

  const rollDiceBagAction = useCallback(() => {
    dispatch({ type: 'ROLL_DICE_BAG' });
  }, []);

  const getDiceBagSummaryValue = useCallback(() => {
    if (!state.diceBag) return null;
    return getBagSummary(state.diceBag);
  }, [state.diceBag]);

  const purchase = useCallback((cost: number, itemId: string, category: 'dice' | 'powerup' | 'upgrade') => {
    logShopPurchase(itemId, cost, state.gold - cost);
    dispatch({ type: 'PURCHASE', cost, itemId, category });
  }, [state.gold]);

  const continueFromShop = useCallback(() => {
    dispatch({ type: 'CONTINUE_FROM_SHOP' });
  }, []);

  const selectPortal = useCallback((portal: PortalOption) => {
    dispatch({ type: 'SELECT_PORTAL', portal });
  }, []);

  const continueFromSummary = useCallback(() => {
    dispatch({ type: 'CONTINUE_FROM_SUMMARY' });
  }, []);

  const completeFlumeTransition = useCallback(() => {
    dispatch({ type: 'COMPLETE_FLUME_TRANSITION' });
  }, []);

  // Encounter callbacks
  const triggerEncounter = useCallback(() => {
    // Generate an encounter based on current game state
    const encounterCtx: EncounterContext = {
      runSeed: state.threadId || 'default',
      encounterIndex: state.enemyEncounterIndex,
      currentDomain: state.currentDomain || 1,
      playerHealth: state.hp,
      corruption: state.corruption,
      deathCount: state.scars,
      grit: state.loadoutStats.grit || 0,
      favorStates: {}, // TODO: integrate with favor system
      ignoredCounts: {}, // TODO: track ignored encounters
    };

    const encounter = generateEncounter(encounterCtx);
    dispatch({ type: 'TRIGGER_ENCOUNTER', encounter });
  }, [state.threadId, state.enemyEncounterIndex, state.currentDomain, state.hp, state.corruption, state.scars, state.loadoutStats.grit]);

  const completeEncounter = useCallback((result: EncounterResult) => {
    dispatch({ type: 'COMPLETE_ENCOUNTER', result });
  }, []);

  const skipEncounter = useCallback(() => {
    dispatch({ type: 'SKIP_ENCOUNTER' });
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
    if (state.phase !== 'playing') return;
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
      scars: state.scars,
      corruption: state.corruption,
      savedAt: Date.now(),
    };

    saveRunState(runState);
  }, [state.phase, state.threadId, state.currentDomain, state.roomNumber, state.gold, state.totalScore, state.tier, state.centerPanel, state.domainState, state.selectedZone, state.inventory, state.runStats, state.scars, state.corruption]);

  const value = useMemo<RunContextValue>(() => ({
    state,
    isPlaying,
    currentDomain,
    setPanel,
    transitionToPanel,
    setTransitionPhase,
    completeTransition,
    startRun,
    startPractice,
    endRun,
    resetRun,
    selectZone,
    setPendingVictory,
    completeRoom,
    failRoom,
    initCombat,
    toggleHoldDie,
    throwDice,
    endCombatTurn,
    // Dice bag
    initDiceBag,
    drawDiceBagHand: drawDiceBagHandAction,
    throwDiceBag: throwDiceBagAction,
    tradeDiceBag: tradeDiceBagAction,
    endDiceBagEvent: endDiceBagEventAction,
    addDiceToBag,
    removeDiceFromBag,
    toggleDiceBagHold: toggleDiceBagHoldAction,
    rollDiceBag: rollDiceBagAction,
    getDiceBagSummary: getDiceBagSummaryValue,
    purchase,
    continueFromShop,
    selectPortal,
    continueFromSummary,
    completeFlumeTransition,
    // Encounter system
    triggerEncounter,
    completeEncounter,
    skipEncounter,
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
    startPractice,
    endRun,
    resetRun,
    selectZone,
    setPendingVictory,
    completeRoom,
    failRoom,
    initCombat,
    toggleHoldDie,
    throwDice,
    endCombatTurn,
    // Dice bag
    initDiceBag,
    drawDiceBagHandAction,
    throwDiceBagAction,
    tradeDiceBagAction,
    endDiceBagEventAction,
    addDiceToBag,
    removeDiceFromBag,
    toggleDiceBagHoldAction,
    rollDiceBagAction,
    getDiceBagSummaryValue,
    purchase,
    continueFromShop,
    selectPortal,
    continueFromSummary,
    completeFlumeTransition,
    // Encounter system
    triggerEncounter,
    completeEncounter,
    skipEncounter,
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
