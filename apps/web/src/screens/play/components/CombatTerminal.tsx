/**
 * CombatTerminal - Inline combat view that fits within PlayHub layout
 *
 * Uses the real CombatEngine from @ndg/ai-engine for:
 * - Proper dice drawing (Balatro-style)
 * - Turn-based combat with holds
 * - Grid with enemies
 *
 * Visual layer connects to GlobeScene for:
 * - Reticle on dice selection
 * - Meteor animations on throw
 * - Impact effects on resolve
 *
 * NEVER DIE GUY
 */

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { Box, Paper, Typography, IconButton, LinearProgress } from '@mui/material';
import {
  FlagSharp as FlagIcon,
  FullscreenSharp as FullscreenIcon,
} from '@mui/icons-material';
import { CardSection } from '../../../components/CardSection';
import { ReportGameDialog } from '../../../components/ReportGameDialog';
import { TokenIcon } from '../../../components/TokenIcon';
import { GlobeScene } from '../../../games/globe-meteor/GlobeScene';
import { CombatHUD } from '../../../games/meteor/components';
import { useAmbientChat } from '../../../hooks/useAmbientChat';
import { useKeyboardShortcuts } from '../../../hooks/useKeyboardShortcuts';
import { useSoundContext } from '../../../contexts/SoundContext';
import { useGameSettings } from '../../../contexts/GameSettingsContext';
import type { DiceRollEventPayload, DiceRarity, CombatGameState } from '../../../data/npc-chat/types';
import { tokens } from '../../../theme';
import {
  CombatEngine,
  createCombatEngine,
  type CombatState,
  type CombatConfig,
  createSeededRng,
  FLAT_EVENT_CONFIG,
  POPULATION_CONFIG,
  calculateDecayRate,
  calculateStatEffects,
  type LoadoutStats,
  detectDrawEvents,
  calculateEventBonuses,
} from '@ndg/ai-engine';
import { DrawEventToast, useDrawEventToast } from '../../../components/DrawEventToast';
import { DensityMeter } from '../../../components/DensityMeter';
import type { RunCombatState } from '../../../contexts/RunContext';
import type { EventType } from '../../../games/meteor/gameConfig';
import { EVENT_VARIANTS, type EventVariant } from '../../../types/zones';
import type { MeteorProjectile, ImpactZone } from '../../../games/globe-meteor/config';
import type { GuardianData } from '../../../games/globe-meteor/components/Guardian';
import { GLOBE_CONFIG, METEOR_CONFIG, DICE_EFFECTS, DOMAIN_PLANET_CONFIG } from '../../../games/globe-meteor/config';
import { latLngToCartesian } from '../../../games/globe-meteor/utils/sphereCoords';
import { getBonusesFromInventory } from '../../../data/items/combat-effects';
import { getBossForZone, getBossTargetScore, type BossDefinition } from '../../../data/boss-types';
import { BossHeartsHUD } from '../../../games/globe-meteor/components/BossHeartsHUD';

const gamingFont = { fontFamily: tokens.fonts.gaming };

// Die shape SVG paths for HUD reticle (centered at 50,50)
const DIE_SHAPES: Record<number, { points: string }> = {
  4:  { points: '50,15 85,80 15,80' },                    // Triangle
  6:  { points: '50,10 90,50 50,90 10,50' },              // Diamond
  8:  { points: '50,10 87,30 87,70 50,90 13,70 13,30' },  // Hexagon
  10: { points: '50,10 95,40 80,90 20,90 5,40' },         // Pentagon
  12: { points: '50,5 75,15 90,35 90,65 75,85 50,95 25,85 10,65 10,35 25,15' }, // Decagon
  20: { points: '50,8 82,18 92,50 82,82 50,92 18,82 8,50 18,18' }, // Octagon
};

// Die size multipliers for range visualization (d4=smallest, d20=largest)
const DIE_SIZES: Record<number, number> = {
  4: 0.4,
  6: 0.5,
  8: 0.6,
  10: 0.7,
  12: 0.85,
  20: 1.0,
};

// Die colors from config
const getDieColor = (dieType: number): string => {
  const effect = DICE_EFFECTS[dieType];
  return effect?.color || '#4488ff';
};

/**
 * Detect special roll patterns for NPC commentary
 * - Triples: 3+ dice show same value
 * - Doubles: 2 dice show same value
 * - Straight: 3+ consecutive values (e.g., 3-4-5)
 */
function detectRollRarity(values: number[], diceTypes: number[]): DiceRollEventPayload | null {
  if (values.length === 0) return null;

  // Count occurrences of each value
  const valueCounts: Record<number, number> = {};
  for (const v of values) {
    valueCounts[v] = (valueCounts[v] || 0) + 1;
  }

  // Check for triples (3+ same value)
  for (const [val, count] of Object.entries(valueCounts)) {
    if (count >= 3) {
      return {
        rarity: 'triples',
        matchedValue: Number(val),
        involvedDice: diceTypes.map(d => `d${d}`),
        primaryDie: `d${Math.max(...diceTypes)}`,
        totalScore: values.reduce((a, b) => a + b, 0),
      };
    }
  }

  // Check for doubles (2 same value)
  for (const [val, count] of Object.entries(valueCounts)) {
    if (count >= 2) {
      return {
        rarity: 'doubles',
        matchedValue: Number(val),
        involvedDice: diceTypes.map(d => `d${d}`),
        primaryDie: `d${Math.max(...diceTypes)}`,
        totalScore: values.reduce((a, b) => a + b, 0),
      };
    }
  }

  // Check for straight (3+ consecutive values)
  const sortedUnique = [...new Set(values)].sort((a, b) => a - b);
  let longestStreak = 1;
  let currentStreak = 1;
  for (let i = 1; i < sortedUnique.length; i++) {
    if (sortedUnique[i] === sortedUnique[i - 1] + 1) {
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }

  if (longestStreak >= 3) {
    return {
      rarity: 'straight',
      involvedDice: diceTypes.map(d => `d${d}`),
      primaryDie: `d${Math.max(...diceTypes)}`,
      totalScore: values.reduce((a, b) => a + b, 0),
    };
  }

  // Common roll - still fire event for general commentary (20% chance handled by trigger system)
  return {
    rarity: 'common',
    involvedDice: diceTypes.map(d => `d${d}`),
    primaryDie: `d${Math.max(...diceTypes)}`,
    totalScore: values.reduce((a, b) => a + b, 0),
  };
}

/**
 * Single die reticle layer - subtle outline only
 */
function DieReticleLayer({ dieType, baseSize }: { dieType: number; baseSize: number }) {
  const shape = DIE_SHAPES[dieType] || DIE_SHAPES[6];
  const color = getDieColor(dieType);
  const sizeMultiplier = DIE_SIZES[dieType] || 0.5;
  const size = baseSize * sizeMultiplier;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      }}
    >
      {/* Outline only - subtle */}
      <polygon
        points={shape.points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        opacity="0.5"
      />
    </svg>
  );
}

/**
 * HUDReticle - Fixed center-screen targeting reticle
 * Shows stacked die shapes for all unheld dice - scales with zoom
 */
function HUDReticle({
  dice,
  zoomScale = GLOBE_CONFIG.camera.initialDistance,
  domainScale = 1
}: {
  dice: Array<{ sides: number; id: string }>;
  zoomScale?: number;
  domainScale?: number;
}) {
  // Base size at default zoom - represents the spread area on planet
  const baseSize = 200; // 2x larger for better visibility

  // Scale inversely with distance (closer = bigger reticle, farther = smaller)
  // Also scale with domain size (bigger planets = bigger spread area)
  const defaultDistance = GLOBE_CONFIG.camera.initialDistance;
  const zoomFactor = defaultDistance / Math.max(zoomScale, GLOBE_CONFIG.camera.minDistance);
  const adjustedSize = baseSize * zoomFactor * domainScale;

  // Clamp to reasonable bounds
  const finalSize = Math.max(60, Math.min(200, adjustedSize));

  // Sort dice by size (largest first so they render behind)
  const sortedDice = [...dice].sort((a, b) => b.sides - a.sides);

  // Get the primary color (largest die)
  const primaryColor = sortedDice.length > 0 ? getDieColor(sortedDice[0].sides) : '#4488ff';

  return (
    <Box sx={{ position: 'relative', width: finalSize, height: finalSize }}>
      {/* Stacked die shapes (largest in back) */}
      {sortedDice.map((die) => (
        <DieReticleLayer key={die.id} dieType={die.sides} baseSize={finalSize} />
      ))}

      {/* Center dot - subtle */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 4,
          height: 4,
          bgcolor: primaryColor,
          borderRadius: '50%',
          opacity: 0.6,
        }}
      />
    </Box>
  );
}

/**
 * DamageFlash - Visual feedback when damage is dealt
 * Shows a flash effect and floating damage numbers
 */
function DamageFlash({
  impacts,
  scoreGained
}: {
  impacts: Array<{ id: string; dieType: number; timestamp: number }>;
  scoreGained: number;
}) {
  const [flashOpacity, setFlashOpacity] = useState(0);
  const [damageNumbers, setDamageNumbers] = useState<Array<{ id: string; value: number; opacity: number; y: number }>>([]);
  const lastImpactCount = useRef(0);

  // Trigger damage number on new impacts (flash removed for accessibility)
  useEffect(() => {
    if (impacts.length > lastImpactCount.current && impacts.length > 0) {
      // Add damage number for the score gained
      if (scoreGained > 0) {
        const newDamage = {
          id: `dmg-${Date.now()}`,
          value: scoreGained,
          opacity: 1,
          y: 0,
        };
        setDamageNumbers(prev => [...prev, newDamage]);

        // Animate the damage number
        let frame = 0;
        const animateDamage = () => {
          frame++;
          setDamageNumbers(prev =>
            prev.map(d =>
              d.id === newDamage.id
                ? { ...d, opacity: Math.max(0, 1 - frame / 30), y: frame * 2 }
                : d
            ).filter(d => d.opacity > 0)
          );
          if (frame < 30) {
            requestAnimationFrame(animateDamage);
          }
        };
        requestAnimationFrame(animateDamage);
      }
    }
    lastImpactCount.current = impacts.length;
  }, [impacts.length, scoreGained]);

  // Get primary color from latest impact
  const latestImpact = impacts[impacts.length - 1];
  const flashColor = latestImpact ? getDieColor(latestImpact.dieType) : tokens.colors.primary;

  return (
    <>
      {/* Localized flash effect - centered circle at reticle position */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${flashColor}80 0%, ${flashColor}40 40%, transparent 70%)`,
          opacity: flashOpacity,
          transition: 'opacity 0.1s ease-out',
          pointerEvents: 'none',
          zIndex: 15,
        }}
      />

      {/* Floating damage numbers */}
      {damageNumbers.map(dmg => (
        <Typography
          key={dmg.id}
          sx={{
            position: 'absolute',
            top: '40%',
            left: '50%',
            transform: `translate(-50%, -${dmg.y}px)`,
            fontFamily: tokens.fonts.gaming,
            fontSize: '2rem',
            fontWeight: 700,
            color: tokens.colors.warning,
            textShadow: '2px 2px 4px rgba(0,0,0,0.8), 0 0 10px rgba(255,193,7,0.5)',
            opacity: dmg.opacity,
            pointerEvents: 'none',
            zIndex: 20,
          }}
        >
          +{dmg.value.toLocaleString()}
        </Typography>
      ))}
    </>
  );
}

/**
 * EventTimer - Countdown timer with visual states
 * Shows 45s countdown with color escalation and grace period indicator
 */
function EventTimer({
  timeRemainingMs,
  isGracePeriod,
  isPaused,
}: {
  timeRemainingMs: number;
  isGracePeriod: boolean;
  isPaused: boolean;
}) {
  const { eventDurationMs, gracePeriodMs } = FLAT_EVENT_CONFIG;
  const progress = (timeRemainingMs / eventDurationMs) * 100;
  const seconds = Math.ceil(timeRemainingMs / 1000);

  // Color thresholds (from TIMER_BALANCE_SPEC)
  // 45-30s: Green, 30-15s: Yellow, 15-5s: Orange, 5-0s: Red
  const getTimerColor = () => {
    if (isGracePeriod) return '#2196F3'; // Blue during grace
    if (seconds > 30) return tokens.colors.success; // Green
    if (seconds > 15) return tokens.colors.warning; // Yellow
    if (seconds > 5) return '#FF9800'; // Orange
    return tokens.colors.error; // Red
  };

  const color = getTimerColor();

  return (
    <Box sx={{ width: '100%', position: 'relative' }}>
      {/* Timer bar */}
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{
          height: 6,
          borderRadius: 1,
          bgcolor: 'rgba(255,255,255,0.1)',
          '& .MuiLinearProgress-bar': {
            bgcolor: color,
            transition: isPaused ? 'none' : 'transform 0.1s linear',
          },
        }}
      />
      {/* Grace period marker */}
      <Box
        sx={{
          position: 'absolute',
          right: `${(gracePeriodMs / eventDurationMs) * 100}%`,
          top: 0,
          width: 2,
          height: 6,
          bgcolor: 'rgba(255,255,255,0.4)',
        }}
      />
      {/* Time display */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
        <Typography
          sx={{
            fontFamily: tokens.fonts.gaming,
            fontSize: '0.7rem',
            color: isGracePeriod ? '#2196F3' : tokens.colors.text.secondary,
          }}
        >
          {isGracePeriod ? 'GRACE' : seconds <= 5 ? 'HURRY!' : 'TIME'}
        </Typography>
        <Typography
          sx={{
            fontFamily: tokens.fonts.gaming,
            fontSize: '0.85rem',
            fontWeight: 700,
            color,
            textShadow: seconds <= 5 ? `0 0 8px ${color}` : 'none',
          }}
        >
          {seconds}s
        </Typography>
      </Box>
    </Box>
  );
}

/** Feed entry types for sidebar history */
export type FeedEntryType = 'npc_chat' | 'roll' | 'trade';

export interface FeedEntry {
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

/** Game state exposed to parent for sidebar display */
export interface GameStateUpdate {
  throws: number;
  trades: number;
  score: number;
  goal: number;
  multiplier: number;
}

interface CombatTerminalProps {
  domain: number;
  eventType: EventType;
  tier: number;
  scoreGoal: number;
  onWin: (score: number, stats: { npcsSquished: number; diceThrown: number }, turnsRemaining: number, bestThrowScore?: number) => void;
  onLose: () => void;
  isLobby?: boolean;
  // Run progress for header display
  currentDomain?: number;
  totalDomains?: number;
  currentRoom?: number;
  totalRooms?: number;
  /** Event number (1-3) for sky color escalation */
  eventNumber?: number;
  totalScore?: number;
  gold?: number;
  /** Inventory item slugs for combat bonuses */
  inventoryItems?: string[];
  /** Callback when feed history updates */
  onFeedUpdate?: (feed: FeedEntry[]) => void;
  /** Callback when game state changes (throws, trades, score) */
  onGameStateChange?: (state: GameStateUpdate) => void;
  /** True if this is the last zone in the domain (shows "DOMAIN CLEAR" on victory) */
  isDomainClear?: boolean;
  /** Loadout stats for combat effects (fury, resilience, swiftness, essence) */
  loadoutStats?: LoadoutStats;
  /** Event variant for difficulty/reward scaling */
  eventVariant?: EventVariant;
}

// Map EventType to RoomType
function eventTypeToRoomType(eventType: EventType): 'normal' | 'elite' | 'boss' {
  if (eventType === 'boss') return 'boss';
  if (eventType === 'big') return 'elite';
  return 'normal';
}

export function CombatTerminal({
  domain,
  eventType,
  tier,
  scoreGoal,
  onWin,
  onLose,
  isLobby = false,
  currentDomain = 1,
  totalDomains = 6,
  currentRoom = 1,
  totalRooms = 3,
  eventNumber = 1,
  totalScore = 0,
  gold = 0,
  inventoryItems = [],
  isDomainClear = false,
  onFeedUpdate,
  onGameStateChange,
  loadoutStats = {},
  eventVariant = 'standard',
}: CombatTerminalProps) {
  // Calculate stat effects from loadout
  const statEffects = useMemo(() => calculateStatEffects(loadoutStats), [loadoutStats]);

  // Get variant config for goal/timer multipliers
  const variantConfig = EVENT_VARIANTS[eventVariant];
  // Sound effects
  const { playDiceRoll, playImpact, playVictory, playDefeat, playExplosion } = useSoundContext();

  // Game settings (speed affects animation timings)
  const { adjustDelay, gameSpeed } = useGameSettings();

  // Combat engine ref
  const engineRef = useRef<CombatEngine | null>(null);

  // Combat state from engine
  const [engineState, setEngineState] = useState<CombatState | null>(null);

  // Processing state to prevent multiple throws before state updates
  const [isProcessing, setIsProcessing] = useState(false);

  // Feed history (persists across the combat)
  const feedRef = useRef<FeedEntry[]>([]);

  // Visual state for globe
  const [meteors, setMeteors] = useState<MeteorProjectile[]>([]);
  const [impacts, setImpacts] = useState<ImpactZone[]>([]);
  const [guardians, setGuardians] = useState<GuardianData[]>([]);
  const [showVictoryExplosion, setShowVictoryExplosion] = useState(false);
  const [lastScoreGain, setLastScoreGain] = useState(0);
  const [bossIsHit, setBossIsHit] = useState(false);

  // Draw event toast for special dice patterns
  const { currentEvent: drawEvent, showEvents: showDrawEvents, clearCurrent: clearDrawEvent } = useDrawEventToast();

  // Event timer state (45s countdown)
  const [timeRemainingMs, setTimeRemainingMs] = useState<number>(FLAT_EVENT_CONFIG.eventDurationMs);
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const timerStartRef = useRef<number | null>(null);
  const pausedTimeRef = useRef<number>(0);

  // Decay state (Model B - escalating decay)
  const [accumulatedDecay, setAccumulatedDecay] = useState(0);
  const lastDecayTickRef = useRef<number>(0);

  // Population density state (simulated based on time elapsed)
  const [populationCount, setPopulationCount] = useState<number>(POPULATION_CONFIG.initialCount);

  // Boss detection - zone 3 is boss zone
  // DISABLED FOR MVP - boss system felt too heavy, keeping for later
  const boss: BossDefinition | null = null;
  // const boss: BossDefinition | null = useMemo(() => {
  //   if (isLobby) return null;
  //   return getBossForZone(domain, eventNumber);
  // }, [domain, eventNumber, isLobby]);

  // Calculate actual score goal (use boss HP if boss zone, apply variant multiplier)
  const actualScoreGoal = useMemo(() => {
    const baseGoal = boss ? getBossTargetScore(boss) : scoreGoal;
    // Apply variant multiplier (swift = 0.6, standard = 1.0, grueling = 1.5)
    return Math.round(baseGoal * variantConfig.goalMultiplier);
  }, [boss, scoreGoal, variantConfig.goalMultiplier]);
  const [cameraDistance, setCameraDistance] = useState(GLOBE_CONFIG.camera.initialDistance);
  const [centerTarget, setCenterTarget] = useState<{ lat: number; lng: number; point3D: [number, number, number] } | null>(null);
  const [reportOpen, setReportOpen] = useState(false);
  const prevScoreRef = useRef(0);
  const processedMeteorsRef = useRef<Set<string>>(new Set());
  const globeContainerRef = useRef<HTMLDivElement>(null);
  const prevPhaseRef = useRef<string | null>(null);
  const victoryFiredRef = useRef(false);
  const bestThrowScoreRef = useRef(0);  // Track best single throw score for stats

  // Notify parent of game state changes
  useEffect(() => {
    if (engineState && onGameStateChange) {
      onGameStateChange({
        throws: engineState.throwsRemaining,
        trades: engineState.holdsRemaining,
        score: engineState.currentScore,
        goal: engineState.targetScore,
        multiplier: engineState.multiplier,
      });
    }
  }, [engineState, onGameStateChange]);

  // Get domain slug for ambient chat
  const domainSlugs: Record<number, string> = {
    1: 'earth',
    2: 'frost-reach',
    3: 'infernus',
    4: 'shadow-keep',
    5: 'null-providence',
    6: 'aberrant',
  };
  const currentDomainSlug = domainSlugs[domain] || 'earth';

  // Build rich game state for context-aware NPC responses
  const gameState = useMemo(() => {
    if (!engineState) return undefined;
    const maxTurns = eventType === 'boss' ? 8 : eventType === 'big' ? 6 : 5;
    const scoreProgress = engineState.targetScore > 0
      ? engineState.currentScore / engineState.targetScore
      : 0;
    const turnProgress = maxTurns > 0
      ? (maxTurns - engineState.turnsRemaining) / maxTurns
      : 0;

    return {
      currentScore: engineState.currentScore,
      targetScore: engineState.targetScore,
      scoreProgress,
      turnsRemaining: engineState.turnsRemaining,
      totalTurns: maxTurns,
      turnProgress,
      lastRollTotal: 0, // Updated on throw
      lastDiceUsed: engineState.hand.filter(d => !d.isHeld).map(d => `d${d.sides}`),
      isWinning: scoreProgress > turnProgress,
      isComeback: scoreProgress > 0.3 && scoreProgress > turnProgress * 0.8,
      isCrushingIt: scoreProgress > turnProgress * 1.5,
      domain,
      domainName: currentDomainSlug.replace(/-/g, ' '),
      multiplier: engineState.multiplier,
    };
  }, [engineState, eventType, domain, currentDomainSlug]);

  // Ambient NPC chat - Die-rectors and NPCs comment during gameplay
  const {
    currentMessage,
    onDomainEnter,
    onVictory,
    onDefeat,
    onDiceRoll,
    onCloseToGoal,
    onFinalTurn,
    onBigRoll,
    onGuardianSlain,
    clearMessage,
  } = useAmbientChat({
    threadId: `combat-${domain}-${tier}`,
    currentDomain: currentDomainSlug,
    roomNumber: engineState?.turnNumber ?? 1,
    inCombat: true,
    inShop: false,
    playerStats: {
      heat: 0,
    },
    gameState,
  });

  // Fire domain enter on mount (Die-rector greets player)
  const domainEnterFired = useRef(false);
  useEffect(() => {
    if (!isLobby && !domainEnterFired.current) {
      domainEnterFired.current = true;
      // Small delay so UI renders first
      setTimeout(() => onDomainEnter(currentDomainSlug), 500);
    }
  }, [isLobby, onDomainEnter, currentDomainSlug]);

  // Initialize combat engine when not in lobby
  useEffect(() => {
    if (isLobby) {
      engineRef.current = null;
      setEngineState(null);
      setGuardians([]);
      setShowVictoryExplosion(false);
      return;
    }

    // Create seeded RNG
    const seed = `combat-${domain}-${tier}-${Date.now()}`;
    const rng = createSeededRng(seed);

    // Calculate item bonuses from inventory
    const itemBonuses = getBonusesFromInventory(inventoryItems);

    // Configure combat with item bonuses
    // Use actualScoreGoal which already includes boss HP and variant multiplier
    const config: CombatConfig = {
      domainId: domain,
      roomType: eventTypeToRoomType(eventType),
      targetScore: actualScoreGoal,
      maxTurns: eventType === 'boss' ? 8 : eventType === 'big' ? 6 : 5,
      bonusThrows: itemBonuses.bonusThrows,
      bonusTrades: itemBonuses.bonusTrades,
      scoreMultiplier: itemBonuses.scoreMultiplier,
      startingScore: itemBonuses.startingScore,
    };

    // Create engine
    const engine = createCombatEngine(config, rng);
    engineRef.current = engine;

    // Subscribe to state changes
    const unsubscribe = engine.subscribe((state) => {
      setEngineState({ ...state });

      // Check for victory/defeat
      if (state.phase === 'victory') {
        // Trigger victory explosion - callback fires after explosion
        setShowVictoryExplosion(true);
      } else if (state.phase === 'defeat') {
        onLose();
      }
    });

    // Set initial state
    setEngineState(engine.getState());

    // Reset visual state on new combat
    setMeteors([]);
    setImpacts([]);
    setIsProcessing(false);
    processedMeteorsRef.current.clear();
    victoryFiredRef.current = false;
    prevScoreRef.current = 0;
    prevPhaseRef.current = null;
    bestThrowScoreRef.current = 0;  // Reset best throw tracking

    // Reset feed history
    feedRef.current = [];
    onFeedUpdate?.([]);

    // Generate guardians - random 0-3 per zone
    // Guardians have die types - you must throw matching dice to destroy them
    const dieTypes: Array<4 | 6 | 8 | 10 | 12 | 20> = [4, 6, 8, 10, 12, 20];
    const numGuardians = Math.floor(Math.random() * 4); // 0, 1, 2, or 3
    const newGuardians: GuardianData[] = [];

    // Shuffle die types for variety
    const shuffledTypes = [...dieTypes].sort(() => Math.random() - 0.5);

    for (let i = 0; i < numGuardians; i++) {
      newGuardians.push({
        id: `guardian-${i}`,
        dieType: shuffledTypes[i % shuffledTypes.length],
        hp: 100,
        maxHp: 100,
        orbitAngle: (i / numGuardians) * Math.PI * 2, // Evenly spaced
        orbitSpeed: 0.2 + (i * 0.08), // Varying speeds
        orbitHeight: (i % 2 === 0 ? 0.4 : -0.4) * ((i % 3) + 1) * 0.4, // Alternating heights
        color: '', // Will use default die color
        isTargeted: false,
      });
    }
    setGuardians(newGuardians);

    return () => {
      unsubscribe();
      engineRef.current = null;
    };
  }, [isLobby, domain, eventType, tier, actualScoreGoal, onWin, onLose, eventNumber, boss]);

  // Timer countdown effect (includes swiftness bonus and variant multiplier)
  const baseTimerMs = Math.round(FLAT_EVENT_CONFIG.eventDurationMs * variantConfig.timerMultiplier);
  const totalTimerMs = baseTimerMs + statEffects.timerBonusMs;
  useEffect(() => {
    if (isLobby) {
      setTimeRemainingMs(totalTimerMs);
      timerStartRef.current = null;
      pausedTimeRef.current = 0;
      return;
    }

    // Reset timer on new combat
    setTimeRemainingMs(totalTimerMs);
    timerStartRef.current = Date.now();
    pausedTimeRef.current = 0;

    const timerInterval = setInterval(() => {
      if (isTimerPaused || !timerStartRef.current) return;

      const elapsed = Date.now() - timerStartRef.current - pausedTimeRef.current;
      const remaining = Math.max(0, totalTimerMs - elapsed);
      setTimeRemainingMs(remaining);

      // Hard fail at 0
      if (remaining === 0 && engineRef.current) {
        const state = engineRef.current.getState();
        if (state.phase !== 'victory' && state.phase !== 'defeat') {
          // Timer expired - force defeat
          onLose();
        }
      }
    }, 100);

    return () => clearInterval(timerInterval);
  }, [isLobby, onLose, totalTimerMs]);

  // Pause timer during throw animations
  const pauseStartRef = useRef<number | null>(null);
  useEffect(() => {
    const phase = engineState?.phase;
    const shouldPause = phase === 'throw' || phase === 'victory' || phase === 'defeat';

    if (shouldPause && !isTimerPaused) {
      setIsTimerPaused(true);
      pauseStartRef.current = Date.now();
    } else if (!shouldPause && isTimerPaused) {
      setIsTimerPaused(false);
      if (pauseStartRef.current) {
        pausedTimeRef.current += Date.now() - pauseStartRef.current;
        pauseStartRef.current = null;
      }
    }
  }, [engineState?.phase, isTimerPaused]);

  // Check if in grace period (first 5 seconds - accounts for swiftness bonus in total timer)
  const isInGracePeriod = timeRemainingMs > (totalTimerMs - FLAT_EVENT_CONFIG.gracePeriodMs);

  // Decay calculation effect (runs with timer, reduced by resilience)
  useEffect(() => {
    if (isLobby || isTimerPaused || !timerStartRef.current) {
      return;
    }

    const decayInterval = setInterval(() => {
      const now = Date.now();
      const elapsedMs = now - timerStartRef.current! - pausedTimeRef.current;
      const targetScore = engineRef.current?.getState()?.targetScore || actualScoreGoal;

      // Calculate current decay rate (per second) and apply resilience reduction
      const baseDecayPerSecond = calculateDecayRate(elapsedMs, targetScore);
      const decayPerSecond = baseDecayPerSecond * (1 - statEffects.decayReduction);
      const timeSinceLastTick = (now - lastDecayTickRef.current) / 1000;

      if (timeSinceLastTick > 0 && decayPerSecond > 0) {
        const decayThisTick = decayPerSecond * timeSinceLastTick;
        setAccumulatedDecay(prev => prev + decayThisTick);
      }

      lastDecayTickRef.current = now;
    }, 100);

    return () => clearInterval(decayInterval);
  }, [isLobby, isTimerPaused, actualScoreGoal, totalTimerMs, statEffects.decayReduction]);

  // Reset decay on new combat
  useEffect(() => {
    if (!isLobby) {
      setAccumulatedDecay(0);
      lastDecayTickRef.current = Date.now();
    }
  }, [isLobby, domain, tier]);

  // Population growth effect (simulates NPCs spawning over time)
  const populationBurstsFiredRef = useRef<number[]>([]);
  useEffect(() => {
    if (isLobby || isTimerPaused || !timerStartRef.current) {
      return;
    }

    // Reset on new combat
    setPopulationCount(POPULATION_CONFIG.initialCount);
    populationBurstsFiredRef.current = [];

    const popInterval = setInterval(() => {
      const elapsedMs = Date.now() - timerStartRef.current! - pausedTimeRef.current;

      setPopulationCount((prev) => {
        // Linear growth: spawnRate per second
        const baseGrowth = Math.floor((elapsedMs / 1000) * POPULATION_CONFIG.spawnRate);
        let newCount = POPULATION_CONFIG.initialCount + baseGrowth;

        // Burst spawns
        for (const burstTime of POPULATION_CONFIG.burstIntervals) {
          if (elapsedMs >= burstTime && !populationBurstsFiredRef.current.includes(burstTime)) {
            populationBurstsFiredRef.current.push(burstTime);
            newCount += POPULATION_CONFIG.burstSize;
          }
        }

        return Math.min(newCount, POPULATION_CONFIG.maxPopulation);
      });
    }, 500);

    return () => clearInterval(popInterval);
  }, [isLobby, isTimerPaused]);

  // Reset population on new combat
  useEffect(() => {
    if (!isLobby) {
      setPopulationCount(POPULATION_CONFIG.initialCount);
      populationBurstsFiredRef.current = [];
    }
  }, [isLobby, domain, tier]);

  // Calculate effective score (raw score * fury multiplier - decay, floored at 0)
  const rawScore = engineState?.currentScore || 0;
  const furyBoostedScore = rawScore * statEffects.scoreMultiplier;
  const effectiveScore = Math.max(0, Math.floor(furyBoostedScore - accumulatedDecay));

  // Victory lock: when effective score >= goal, win immediately (decay stops)
  // This overrides the engine's raw score check
  const effectiveVictoryRef = useRef(false);
  const victoryScoreRef = useRef<number | null>(null); // Capture score at victory moment
  useEffect(() => {
    if (isLobby || !engineState || effectiveVictoryRef.current) return;

    const targetScore = engineState.targetScore;
    if (effectiveScore >= targetScore && engineState.phase !== 'victory' && engineState.phase !== 'defeat') {
      // Effective score reached goal - trigger victory!
      // Capture the score NOW before decay continues during explosion animation
      effectiveVictoryRef.current = true;
      victoryScoreRef.current = effectiveScore;
      setShowVictoryExplosion(true);
    }
  }, [isLobby, effectiveScore, engineState?.targetScore, engineState?.phase]);

  // Reset effective victory flag and captured score on new combat
  useEffect(() => {
    if (!isLobby) {
      effectiveVictoryRef.current = false;
      victoryScoreRef.current = null;
    }
  }, [isLobby, domain, tier]);

  // Create a key that changes when any die's held state changes
  const handHeldKey = engineState?.hand.map(d => `${d.id}:${d.isHeld}`).join(',') ?? '';

  // Get all unheld dice
  const allUnheldDice = useMemo((): Array<{ sides: number; id: string }> => {
    if (isLobby || !engineState || engineState.hand.length === 0) return [];
    return engineState.hand
      .filter(d => !d.isHeld)
      .map(d => ({ sides: d.sides, id: d.id }));
  }, [isLobby, engineState?.hand, handHeldKey]);

  // Split dice into guardian-targeting vs planet-targeting
  // Only planet-targeting dice show in center reticle
  const reticleDice = useMemo((): Array<{ sides: number; id: string }> => {
    if (guardians.length === 0) return allUnheldDice;

    // Get guardian die types that are still alive
    const guardianDieTypes = guardians.map(g => g.dieType);

    // Count how many of each guardian type
    const guardianCounts: Record<number, number> = {};
    for (const dt of guardianDieTypes) {
      guardianCounts[dt] = (guardianCounts[dt] || 0) + 1;
    }

    // Filter out dice that will target guardians
    const planetDice: Array<{ sides: number; id: string }> = [];
    const usedCounts: Record<number, number> = {};

    for (const die of allUnheldDice) {
      const guardianCount = guardianCounts[die.sides] || 0;
      const usedCount = usedCounts[die.sides] || 0;

      if (usedCount < guardianCount) {
        // This die targets a guardian, skip from center reticle
        usedCounts[die.sides] = usedCount + 1;
      } else {
        // This die targets the planet
        planetDice.push(die);
      }
    }

    return planetDice;
  }, [allUnheldDice, guardians]);

  // Update guardian targeting based on selected dice
  // Matching dice types will target guardians instead of the planet
  useEffect(() => {
    if (isLobby || guardians.length === 0) return;

    const selectedDieTypes = allUnheldDice.map(d => d.sides);

    // Count how many of each die type are selected
    const selectedCounts: Record<number, number> = {};
    for (const sides of selectedDieTypes) {
      selectedCounts[sides] = (selectedCounts[sides] || 0) + 1;
    }

    // Update guardian targeting
    // Each guardian can only be targeted by one die of matching type
    const usedCounts: Record<number, number> = {};

    setGuardians(prev => prev.map(g => {
      const matchingSelected = selectedCounts[g.dieType] || 0;
      const alreadyUsed = usedCounts[g.dieType] || 0;

      if (matchingSelected > alreadyUsed) {
        usedCounts[g.dieType] = alreadyUsed + 1;
        return { ...g, isTargeted: true };
      }
      return { ...g, isTargeted: false };
    }));
  }, [isLobby, allUnheldDice, guardians.length]);

  // Domain scale for reticle sizing
  const domainScale = DOMAIN_PLANET_CONFIG[domain]?.scale || 1;

  // Default target when camera hasn't reported yet (front of globe)
  const DEFAULT_TARGET = { lat: 0, lng: 0 };

  // Create meteors when THROW phase transitions
  // Also handles guardian destruction - matching dice destroy guardians instead of hitting planet
  useEffect(() => {
    if (!engineState || isLobby) return;

    const currentPhase = engineState.phase;
    const previousPhase = prevPhaseRef.current;
    prevPhaseRef.current = currentPhase;

    // Only spawn meteors on transition TO throw phase
    if (currentPhase === 'throw' && previousPhase !== 'throw' && previousPhase !== null) {
      const now = Date.now();
      const newImpacts: ImpactZone[] = [];

      // Target the point on the planet that's under the HUD reticle (camera center)
      // Falls back to front of globe if camera hasn't reported yet
      const center = centerTarget ?? DEFAULT_TARGET;

      // Determine which dice target guardians vs planet
      // Count guardian die types
      const guardianDieTypes = guardians.map(g => g.dieType);
      const guardianCounts: Record<number, number> = {};
      for (const dt of guardianDieTypes) {
        guardianCounts[dt] = (guardianCounts[dt] || 0) + 1;
      }

      // Track which guardians to destroy and which dice hit planet
      const guardiansToDestroy: string[] = [];
      const usedCounts: Record<number, number> = {};

      // Get unheld dice that were thrown
      const thrownDice = engineState.hand.filter(d => !d.isHeld);

      thrownDice.forEach((die, index) => {
        const guardianCount = guardianCounts[die.sides] || 0;
        const usedCount = usedCounts[die.sides] || 0;

        if (usedCount < guardianCount) {
          // This die destroys a guardian
          usedCounts[die.sides] = usedCount + 1;

          // Find the guardian to destroy
          const targetGuardian = guardians.find(
            g => g.dieType === die.sides && !guardiansToDestroy.includes(g.id)
          );
          if (targetGuardian) {
            guardiansToDestroy.push(targetGuardian.id);
          }

          // Don't spawn meteors for guardian-targeting dice
          return;
        }

        // This die targets the planet - spawn meteors at reticle center
        const dieEffect = DICE_EFFECTS[die.sides] || DICE_EFFECTS[6];
        const meteorCount = die.rollValue ?? Math.ceil(die.sides / 3);

        // Spread scales with die type - smaller dice are more precise
        // d4=0.05, d6=0.08, d8=0.1, d10=0.12, d12=0.15, d20=0.2 (3D units)
        const spreadByDie: Record<number, number> = {
          4: 0.05, 6: 0.08, 8: 0.1, 10: 0.12, 12: 0.15, 20: 0.2
        };
        const baseSpread = spreadByDie[die.sides] || 0.1;

        // Use domain-scaled radius
        const scaledRadius = GLOBE_CONFIG.radius * domainScale;

        for (let i = 0; i < meteorCount; i++) {
          let impactPos: [number, number, number];
          let impactLat: number;
          let impactLng: number;

          // Use point3D directly if available (from raycast)
          if (centerTarget?.point3D) {
            const [cx, cy, cz] = centerTarget.point3D;

            // Create random offset in tangent plane
            // Get surface normal at center point
            const len = Math.sqrt(cx * cx + cy * cy + cz * cz);
            const nx = cx / len;
            const ny = cy / len;
            const nz = cz / len;

            // Create two tangent vectors
            // Use cross product with up vector (or right if parallel)
            let tx: number, ty: number, tz: number;
            if (Math.abs(ny) < 0.9) {
              // Cross with up vector (0, 1, 0)
              tx = nz;
              ty = 0;
              tz = -nx;
            } else {
              // Cross with right vector (1, 0, 0)
              tx = 0;
              ty = -nz;
              tz = ny;
            }
            const tLen = Math.sqrt(tx * tx + ty * ty + tz * tz);
            tx /= tLen; ty /= tLen; tz /= tLen;

            // Second tangent (cross normal with first tangent)
            const t2x = ny * tz - nz * ty;
            const t2y = nz * tx - nx * tz;
            const t2z = nx * ty - ny * tx;

            // Fun patterns based on die type!
            // Each die creates a unique impact shape
            let r1: number, r2: number;
            // Random rotation per throw so patterns don't always align with camera
            const randomRotation = Math.random() * Math.PI * 2;
            const patternAngle = (i / meteorCount) * Math.PI * 2 + randomRotation;
            const patternRadius = baseSpread * (0.3 + Math.random() * 0.7);

            switch (die.sides) {
              case 4: // Triangle burst - 3 points
                {
                  const triAngle = patternAngle + (Math.floor(i % 3) * (Math.PI * 2 / 3));
                  r1 = Math.cos(triAngle) * patternRadius;
                  r2 = Math.sin(triAngle) * patternRadius;
                }
                break;
              case 6: // Diamond/cross pattern
                {
                  const crossAngle = (Math.floor(i % 4) * (Math.PI / 2)) + (Math.random() * 0.3);
                  r1 = Math.cos(crossAngle) * patternRadius;
                  r2 = Math.sin(crossAngle) * patternRadius;
                }
                break;
              case 8: // Star burst - 8 points
                {
                  const starAngle = patternAngle + (Math.floor(i % 8) * (Math.PI / 4));
                  const starRadius = patternRadius * (i % 2 === 0 ? 1 : 0.5);
                  r1 = Math.cos(starAngle) * starRadius;
                  r2 = Math.sin(starAngle) * starRadius;
                }
                break;
              case 10: // Pentagon flower
                {
                  const pentAngle = patternAngle + (Math.floor(i % 5) * (Math.PI * 2 / 5));
                  r1 = Math.cos(pentAngle) * patternRadius;
                  r2 = Math.sin(pentAngle) * patternRadius;
                }
                break;
              case 12: // Spiral outward
                {
                  const spiralAngle = i * 0.8 + patternAngle;
                  const spiralRadius = patternRadius * (0.2 + (i / meteorCount) * 0.8);
                  r1 = Math.cos(spiralAngle) * spiralRadius;
                  r2 = Math.sin(spiralAngle) * spiralRadius;
                }
                break;
              case 20: // Chaotic explosion - double spiral
                {
                  const chaosAngle = i * 1.2 + patternAngle;
                  const chaosRadius = patternRadius * (0.3 + Math.sin(i * 0.5) * 0.4 + Math.random() * 0.3);
                  r1 = Math.cos(chaosAngle) * chaosRadius;
                  r2 = Math.sin(chaosAngle) * chaosRadius;
                }
                break;
              default: // Random scatter fallback
                r1 = (Math.random() - 0.5) * 2 * baseSpread;
                r2 = (Math.random() - 0.5) * 2 * baseSpread;
            }

            // Offset point
            const ox = cx + tx * r1 + t2x * r2;
            const oy = cy + ty * r1 + t2y * r2;
            const oz = cz + tz * r1 + t2z * r2;

            // Project back onto sphere surface
            const oLen = Math.sqrt(ox * ox + oy * oy + oz * oz);
            impactPos = [
              (ox / oLen) * scaledRadius,
              (oy / oLen) * scaledRadius,
              (oz / oLen) * scaledRadius
            ];

            // Calculate lat/lng for the impact record
            impactLat = Math.asin(impactPos[1] / scaledRadius) * (180 / Math.PI);
            impactLng = Math.atan2(impactPos[0], impactPos[2]) * (180 / Math.PI);
          } else {
            // Fallback to lat/lng method
            const offsetLat = (Math.random() - 0.5) * baseSpread * 40; // Convert to degrees
            const offsetLng = (Math.random() - 0.5) * baseSpread * 40;
            impactLat = Math.max(-85, Math.min(85, center.lat + offsetLat));
            impactLng = center.lng + offsetLng;
            if (impactLng > 180) impactLng -= 360;
            if (impactLng < -180) impactLng += 360;
            impactPos = latLngToCartesian(impactLat, impactLng, scaledRadius);
          }

          // Create impact directly (skip meteor flight animation)
          newImpacts.push({
            id: `impact-${now}-${index}-${i}`,
            position: impactPos,
            lat: impactLat,
            lng: impactLng,
            radius: METEOR_CONFIG.impactRadius * dieEffect.impactRadius,
            timestamp: now + (i * 50), // Slight stagger for visual variety
            dieType: die.sides,
            rollValue: die.rollValue ?? 1, // Scale effect by roll value
          });
        }
      });

      // Destroy targeted guardians and fire NPC triggers
      if (guardiansToDestroy.length > 0) {
        // Fire guardian slain trigger for each destroyed guardian
        for (const guardianId of guardiansToDestroy) {
          const guardian = guardians.find(g => g.id === guardianId);
          if (guardian) {
            onGuardianSlain(guardian.dieType);
          }
        }
        setGuardians(prev => prev.filter(g => !guardiansToDestroy.includes(g.id)));
      }

      // Add impacts directly (no meteor flight)
      if (newImpacts.length > 0) {
        setImpacts(prev => [...prev, ...newImpacts]);

        // Track score gain and trigger boss hit animation
        setTimeout(() => {
          const currentScore = engineRef.current?.getState()?.currentScore || 0;
          const scoreGain = currentScore - prevScoreRef.current;
          if (scoreGain > 0) {
            setLastScoreGain(scoreGain);
            prevScoreRef.current = currentScore;

            // Track best throw score for stats
            if (scoreGain > bestThrowScoreRef.current) {
              bestThrowScoreRef.current = scoreGain;
            }

            // Trigger boss hit animation if in boss zone
            if (boss) {
              setBossIsHit(true);
              setTimeout(() => setBossIsHit(false), 200);
            }
          }
        }, 100);
      }
    }
  }, [engineState?.phase, isLobby, guardians, domain, centerTarget, domainScale, onGuardianSlain, boss]);

  // Keep impacts for the duration of combat (clear only on new zone)
  // Limit to last 100 impacts - let the destruction stack!
  useEffect(() => {
    const cleanup = setInterval(() => {
      setImpacts(prev => prev.length > 100 ? prev.slice(-100) : prev);
    }, 3000);
    return () => clearInterval(cleanup);
  }, []);

  // Play impact sound when new impacts are added
  const prevImpactCount = useRef(0);
  useEffect(() => {
    if (impacts.length > prevImpactCount.current) {
      playImpact();
    }
    prevImpactCount.current = impacts.length;
  }, [impacts.length, playImpact]);

  // Play victory/defeat sounds
  const soundPlayedRef = useRef<string | null>(null);
  useEffect(() => {
    if (!engineState) return;

    if (engineState.phase === 'victory' && soundPlayedRef.current !== 'victory') {
      soundPlayedRef.current = 'victory';
      playVictory();
      playExplosion(); // Planet explosion sound
    } else if (engineState.phase === 'defeat' && soundPlayedRef.current !== 'defeat') {
      soundPlayedRef.current = 'defeat';
      playDefeat();
    } else if (engineState.phase !== 'victory' && engineState.phase !== 'defeat') {
      soundPlayedRef.current = null;
    }
  }, [engineState?.phase, playVictory, playDefeat, playExplosion]);

  // Convert engine state to HUD state format
  const combatState: RunCombatState = engineState
    ? {
        phase: engineState.phase === 'draw' || engineState.phase === 'select' ? 'draw' :
               engineState.phase === 'throw' ? 'throw' :
               engineState.phase === 'victory' ? 'victory' :
               engineState.phase === 'defeat' ? 'defeat' : 'resolve',
        hand: engineState.hand,
        holdsRemaining: engineState.holdsRemaining,
        throwsRemaining: engineState.throwsRemaining,
        targetScore: engineState.targetScore,
        currentScore: engineState.currentScore,
        multiplier: engineState.multiplier,
        turnsRemaining: engineState.turnsRemaining,
        turnNumber: engineState.turnNumber,
        enemiesSquished: engineState.enemiesSquished,
        friendlyHits: engineState.friendlyHits,
        // Time pressure system
        timePressureMultiplier: engineState.timePressureMultiplier,
        isGracePeriod: engineState.isGracePeriod,
      }
    : {
        phase: 'draw',
        hand: [],
        holdsRemaining: 2,
        throwsRemaining: 3,
        targetScore: actualScoreGoal,
        currentScore: 0,
        multiplier: 1,
        turnsRemaining: 5,
        turnNumber: 1,
        enemiesSquished: 0,
        friendlyHits: 0,
        timePressureMultiplier: 1.0,
        isGracePeriod: true,
      };

  // Generate roll notation from thrown dice (e.g., "2d6 + 1d8 = 14")
  const rollNotation = useMemo(() => {
    if (!engineState || engineState.phase !== 'throw' && engineState.phase !== 'resolve') return undefined;

    const thrownDice = engineState.hand.filter(d => !d.isHeld && d.rollValue !== null);
    if (thrownDice.length === 0) return undefined;

    // Group dice by sides
    const diceGroups: Record<number, { count: number; total: number }> = {};
    for (const die of thrownDice) {
      if (!diceGroups[die.sides]) {
        diceGroups[die.sides] = { count: 0, total: 0 };
      }
      diceGroups[die.sides].count++;
      diceGroups[die.sides].total += die.rollValue || 0;
    }

    // Build notation string (e.g., "2d6 + 1d8")
    const parts = Object.entries(diceGroups)
      .sort((a, b) => Number(b[0]) - Number(a[0])) // Sort by die size descending
      .map(([sides, { count }]) => `${count}d${sides}`);

    const total = thrownDice.reduce((sum, d) => sum + (d.rollValue || 0), 0);

    return `${parts.join(' + ')} = ${total}`;
  }, [engineState?.phase, engineState?.hand]);

  // Add NPC messages to feed when they occur
  const lastNpcMessageIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (currentMessage && currentMessage.id !== lastNpcMessageIdRef.current) {
      lastNpcMessageIdRef.current = currentMessage.id;
      const entry: FeedEntry = {
        id: `npc-${currentMessage.id}`,
        type: 'npc_chat',
        timestamp: currentMessage.timestamp,
        npcSlug: currentMessage.npcSlug,
        npcName: currentMessage.npcName,
        text: currentMessage.text,
        mood: currentMessage.mood,
      };
      feedRef.current = [entry, ...feedRef.current];
      onFeedUpdate?.(feedRef.current);
    }
  }, [currentMessage, onFeedUpdate]);

  // Add roll notation to feed when thrown
  const lastRollNotationRef = useRef<string | null>(null);
  useEffect(() => {
    if (rollNotation && rollNotation !== lastRollNotationRef.current) {
      lastRollNotationRef.current = rollNotation;
      const total = parseInt(rollNotation.split('=')[1]?.trim() || '0', 10);
      const entry: FeedEntry = {
        id: `roll-${Date.now()}`,
        type: 'roll',
        timestamp: Date.now(),
        rollNotation,
        rollTotal: total,
      };
      feedRef.current = [entry, ...feedRef.current];
      onFeedUpdate?.(feedRef.current);
    }
    // Clear when no notation (end of resolve phase)
    if (!rollNotation) {
      lastRollNotationRef.current = null;
    }
  }, [rollNotation, onFeedUpdate]);

  // Track trades (when END_TURN is dispatched with unheld dice)
  const handleEndCombatTurnWithFeed = useCallback(() => {
    const state = engineRef.current?.getState();
    if (state) {
      const unheldCount = state.hand.filter(d => !d.isHeld).length;
      if (unheldCount > 0 && state.holdsRemaining > 0) {
        // This is a trade
        const entry: FeedEntry = {
          id: `trade-${Date.now()}`,
          type: 'trade',
          timestamp: Date.now(),
          diceTraded: unheldCount,
          multiplierGained: unheldCount,
        };
        feedRef.current = [entry, ...feedRef.current];
        onFeedUpdate?.(feedRef.current);
      }
    }
    engineRef.current?.dispatch({ type: 'END_TURN' });
  }, [onFeedUpdate]);

  // Combat action handlers
  const handleToggleHold = useCallback((dieId: string) => {
    engineRef.current?.dispatch({ type: 'TOGGLE_HOLD', dieId });
  }, []);

  // Hold all dice (none selected for throwing) - atomic operation
  const handleHoldAll = useCallback(() => {
    engineRef.current?.dispatch({ type: 'HOLD_ALL' });
  }, []);

  // Release all holds (all dice selected for throwing) - atomic operation
  const handleHoldNone = useCallback(() => {
    engineRef.current?.dispatch({ type: 'HOLD_NONE' });
  }, []);

  const handleThrowDice = useCallback(() => {
    // Prevent multiple throws while processing
    if (isProcessing) return;
    setIsProcessing(true);

    engineRef.current?.dispatch({ type: 'THROW' });

    // Play dice roll sound
    playDiceRoll();

    // Get state AFTER throw to check values and throws remaining
    // Delay adjusted by game speed setting
    setTimeout(() => {
      const newState = engineRef.current?.getState();
      setIsProcessing(false); // Re-enable after processing

      if (newState) {
        // Don't fire triggers if game ended (victory/defeat)
        if (newState.phase === 'victory' || newState.phase === 'defeat') {
          clearMessage(); // Clear any active message before transition
          return;
        }

        // Get thrown dice (unheld ones that now have values)
        const thrownDice = newState.hand.filter(d => !d.isHeld && d.rollValue !== null);
        const values = thrownDice.map(d => d.rollValue!);
        const diceTypes = thrownDice.map(d => d.sides);
        const rollTotal = values.reduce((a, b) => a + b, 0);

        // Detect roll pattern and fire NPC event
        const rollPayload = detectRollRarity(values, diceTypes);
        if (rollPayload) {
          onDiceRoll(rollPayload);
        }

        // Detect draw events (special dice patterns) and show toast
        const drawEvents = detectDrawEvents(newState.hand);
        if (drawEvents.length > 0) {
          showDrawEvents(drawEvents);
        }

        // Fire situational triggers based on game state
        const scoreProgress = newState.targetScore > 0
          ? newState.currentScore / newState.targetScore
          : 0;

        // Big roll trigger (> 15 total)
        if (rollTotal > 15) {
          onBigRoll(rollTotal);
        }

        // Close to goal trigger (> 80% progress)
        if (scoreProgress > 0.8 && scoreProgress < 1) {
          onCloseToGoal();
        }

        // Final turn trigger (1-2 turns left)
        if (newState.turnsRemaining <= 2 && newState.turnsRemaining > 0) {
          onFinalTurn();
        }
      }
    }, adjustDelay(100));
  }, [isProcessing, onDiceRoll, onBigRoll, onCloseToGoal, onFinalTurn, playDiceRoll, adjustDelay, clearMessage, showDrawEvents]);

  // Victory explosion callback - fires after explosion animation
  // Uses ref to prevent multiple firings and avoid stale closure issues
  const handleVictoryExplosionComplete = useCallback(() => {
    // Guard against multiple calls
    if (victoryFiredRef.current) return;

    const state = engineRef.current?.getState();
    // Use captured victory score (frozen at moment of win) to prevent decay drift
    const finalScore = victoryScoreRef.current ?? effectiveScore;
    // Check for engine victory OR effective victory
    const isEffectiveWin = state && victoryScoreRef.current !== null;
    if (state?.phase === 'victory' || isEffectiveWin) {
      victoryFiredRef.current = true;
      // Fire victory NPC commentary before transition
      onVictory();
      // Then call the win callback - use captured score
      onWin(finalScore, {
        npcsSquished: state?.enemiesSquished || 0,
        diceThrown: (state?.turnNumber || 1) * 5,
      }, state?.turnsRemaining || 0, bestThrowScoreRef.current);
    }
  }, [onWin, clearMessage, effectiveScore]);

  // Fire defeat trigger when game is lost
  useEffect(() => {
    if (engineState?.phase === 'defeat') {
      clearMessage(); // Clear any lingering messages
      onDefeat();
    }
  }, [engineState?.phase, onDefeat, clearMessage]);

  // Toggle die hold by index (for keyboard shortcuts)
  const handleToggleDieByIndex = useCallback((index: number) => {
    const die = engineState?.hand[index];
    if (die) {
      handleToggleHold(die.id);
    }
  }, [engineState?.hand, handleToggleHold]);

  // Keyboard shortcuts (Space=throw, R=reset, 1-6=toggle die, Esc=pause)
  useKeyboardShortcuts({
    onThrow: handleThrowDice,
    onReset: handleHoldNone,
    onToggleDie: handleToggleDieByIndex,
    onPause: () => setReportOpen(true), // Reuse report dialog for now
    enabled: !isLobby && engineState?.phase !== 'victory' && engineState?.phase !== 'defeat',
  });

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        p: 2,
        gap: 1,
        position: 'relative',
      }}
    >
      {/* Top bar - Run progress (lobby) or Turn meter (combat) */}
      <CardSection
        padding={1}
        sx={{
          width: '100%',
          maxWidth: 480,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          borderRadius: 2,
        }}
      >
        {isLobby ? (
          <Typography sx={{ ...gamingFont, fontSize: '0.85rem', color: tokens.colors.text.disabled, textAlign: 'center', width: '100%' }}>
            Select an event to begin
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%' }}>
            {/* Score display with decay indicator */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TokenIcon size={20} />
                <Typography sx={{ ...gamingFont, fontSize: '1.2rem', fontWeight: 700, color: tokens.colors.text.primary }}>
                  {effectiveScore.toLocaleString()}
                </Typography>
                {/* Decay indicator - shows when decay is active */}
                {accumulatedDecay > 0 && (
                  <Typography sx={{ ...gamingFont, fontSize: '0.75rem', color: tokens.colors.error, opacity: 0.8 }}>
                    (-{Math.floor(accumulatedDecay)})
                  </Typography>
                )}
              </Box>
              <Typography sx={{ ...gamingFont, fontSize: '0.9rem', color: tokens.colors.text.secondary }}>
                / {combatState.targetScore.toLocaleString()}
              </Typography>
            </Box>
            {/* Event Timer */}
            <EventTimer
              timeRemainingMs={timeRemainingMs}
              isGracePeriod={isInGracePeriod}
              isPaused={isTimerPaused}
            />
          </Box>
        )}
      </CardSection>

      {/* Globe canvas */}
      <Paper
        ref={globeContainerRef}
        sx={{
          width: '100%',
          maxWidth: 480,
          aspectRatio: '4 / 3',
          backgroundColor: 'transparent',
          border: `2px solid ${tokens.colors.border}`,
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 3,
          boxShadow: `0 0 20px rgba(0,0,0,0.5), inset 0 0 30px rgba(0,0,0,0.3)`,
        }}
      >
        <Box sx={{ position: 'absolute', inset: 0 }}>
          <GlobeScene
            npcs={[]}
            meteors={[]}
            impacts={impacts}
            guardians={isLobby ? [] : guardians}
            onGlobeClick={() => {}}
            style="lowPoly"
            autoRotate={isLobby && !showVictoryExplosion}
            isIdle={isLobby}
            zones={[]}
            domainId={domain}
            eventNumber={eventNumber}
            showVictoryExplosion={showVictoryExplosion}
            onVictoryExplosionComplete={handleVictoryExplosionComplete}
            onCameraChange={setCameraDistance}
            onCenterTargetChange={setCenterTarget}
            boss={boss || undefined}
            bossCurrentScore={combatState.currentScore}
            bossIsHit={bossIsHit}
          />
        </Box>

        {/* Damage visualization - flash and floating numbers */}
        {!isLobby && (
          <DamageFlash impacts={impacts} scoreGained={lastScoreGain} />
        )}

        {/* Boss Hearts HUD - shows for zone 3 (boss encounters) */}
        {!isLobby && boss && (
          <BossHeartsHUD
            boss={boss}
            currentScore={combatState.currentScore}
            isHit={bossIsHit}
          />
        )}

        {/* Population Density Meter - shows current population tier */}
        {!isLobby && (
          <Box
            sx={{
              position: 'absolute',
              top: 8,
              left: 8,
              zIndex: 10,
            }}
          >
            <DensityMeter npcCount={populationCount} compact />
          </Box>
        )}

        {/* Fixed HUD Reticle - scales with zoom to match impact area on planet */}
        {!isLobby && reticleDice.length > 0 && (
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
              zIndex: 10,
            }}
          >
            <HUDReticle dice={reticleDice} zoomScale={cameraDistance} domainScale={domainScale} />
          </Box>
        )}

        {/* Domain name overlay */}
        {!isLobby && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 8,
              left: 8,
              bgcolor: 'rgba(0,0,0,0.7)',
              px: 1.5,
              py: 0.5,
              borderRadius: 1,
            }}
          >
            <Typography sx={{ ...gamingFont, fontSize: '0.8rem', color: tokens.colors.text.primary }}>
              {DOMAIN_PLANET_CONFIG[domain]?.name || 'Unknown'}
            </Typography>
          </Box>
        )}

        {/* Report and Fullscreen buttons */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 8,
            right: 8,
            display: 'flex',
            gap: 1,
            zIndex: 20,
          }}
        >
          <IconButton
            size="small"
            onClick={() => setReportOpen(true)}
            sx={{ bgcolor: tokens.colors.background.elevated, '&:hover': { bgcolor: tokens.colors.background.paper } }}
          >
            <FlagIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => {
              const container = globeContainerRef.current;
              if (!container) return;

              if (document.fullscreenElement) {
                document.exitFullscreen();
              } else {
                container.requestFullscreen();
              }
            }}
            sx={{ bgcolor: tokens.colors.background.elevated, '&:hover': { bgcolor: tokens.colors.background.paper } }}
          >
            <FullscreenIcon fontSize="small" />
          </IconButton>
        </Box>

      </Paper>

      {/* Combat HUD */}
      <CombatHUD
        combatState={combatState}
        onToggleHold={handleToggleHold}
        onHoldAll={handleHoldAll}
        onHoldNone={handleHoldNone}
        onThrow={handleThrowDice}
        onEndTurn={handleEndCombatTurnWithFeed}
        isSmall={false}
        isDisabled={isLobby}
        guardianDieTypes={guardians.map(g => g.dieType)}
        isDomainClear={isDomainClear}
        npcCount={populationCount}
      />

      {/* Report Dialog */}
      <ReportGameDialog
        open={reportOpen}
        onClose={() => setReportOpen(false)}
      />

      {/* Draw Event Toast - shows when special dice patterns proc */}
      <DrawEventToast
        event={drawEvent}
        onComplete={clearDrawEvent}
      />
    </Box>
  );
}

export default CombatTerminal;
