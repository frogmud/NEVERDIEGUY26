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
import { Box, Paper, Typography } from '@mui/material';
import { CardSection } from '../../../components/CardSection';
import { GlobeScene } from '../../../games/globe-meteor/GlobeScene';
import { CombatHUD } from '../../../games/meteor/components';
import { useAmbientChat } from '../../../hooks/useAmbientChat';
import type { DiceRollEventPayload, DiceRarity } from '../../../data/npc-chat/types';
import { tokens } from '../../../theme';
import {
  CombatEngine,
  createCombatEngine,
  type CombatState,
  type CombatConfig,
  createSeededRng,
} from '@ndg/ai-engine';
import type { RunCombatState } from '../../../contexts/RunContext';
import type { EventType } from '../../../games/meteor/gameConfig';
import type { MeteorProjectile, ImpactZone } from '../../../games/globe-meteor/config';
import type { GuardianData } from '../../../games/globe-meteor/components/Guardian';
import { GLOBE_CONFIG, METEOR_CONFIG, DICE_EFFECTS } from '../../../games/globe-meteor/config';
import { latLngToCartesian, randomSpherePoint } from '../../../games/globe-meteor/utils/sphereCoords';

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
 * Shows stacked die shapes for all unheld dice - subtle styling
 */
function HUDReticle({ dice }: { dice: Array<{ sides: number; id: string }> }) {
  const baseSize = 100; // Smaller base size

  // Sort dice by size (largest first so they render behind)
  const sortedDice = [...dice].sort((a, b) => b.sides - a.sides);

  // Get the primary color (largest die)
  const primaryColor = sortedDice.length > 0 ? getDieColor(sortedDice[0].sides) : '#4488ff';

  return (
    <Box sx={{ position: 'relative', width: baseSize, height: baseSize }}>
      {/* Stacked die shapes (largest in back) */}
      {sortedDice.map((die) => (
        <DieReticleLayer key={die.id} dieType={die.sides} baseSize={baseSize} />
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

interface CombatTerminalProps {
  domain: number;
  eventType: EventType;
  tier: number;
  scoreGoal: number;
  onWin: (score: number, stats: { npcsSquished: number; diceThrown: number }) => void;
  onLose: () => void;
  isLobby?: boolean;
  /** Callback when feed history updates */
  onFeedUpdate?: (feed: FeedEntry[]) => void;
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
  onFeedUpdate,
}: CombatTerminalProps) {
  // Combat engine ref
  const engineRef = useRef<CombatEngine | null>(null);

  // Combat state from engine
  const [engineState, setEngineState] = useState<CombatState | null>(null);

  // Feed history (persists across the combat)
  const feedRef = useRef<FeedEntry[]>([]);

  // Visual state for globe
  const [meteors, setMeteors] = useState<MeteorProjectile[]>([]);
  const [impacts, setImpacts] = useState<ImpactZone[]>([]);
  const [guardians, setGuardians] = useState<GuardianData[]>([]);
  const [showVictoryExplosion, setShowVictoryExplosion] = useState(false);
  const processedMeteorsRef = useRef<Set<string>>(new Set());
  const prevPhaseRef = useRef<string | null>(null);

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

  // Ambient NPC chat - Die-rectors and NPCs comment during gameplay
  const { currentMessage, onDomainEnter, onVictory, onDefeat, onDiceRoll } = useAmbientChat({
    threadId: `combat-${domain}-${tier}`,
    currentDomain: currentDomainSlug,
    roomNumber: engineState?.turnNumber ?? 1,
    inCombat: true,
    inShop: false,
    playerStats: {
      heat: 0,
    },
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

    // Configure combat
    const config: CombatConfig = {
      domainId: domain,
      roomType: eventTypeToRoomType(eventType),
      targetScore: scoreGoal,
      maxTurns: eventType === 'boss' ? 8 : eventType === 'big' ? 6 : 5,
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
    processedMeteorsRef.current.clear();

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
  }, [isLobby, domain, eventType, tier, scoreGoal, onWin, onLose]);

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

  // Target position ref for meteor spawning (center of view)
  const lastTargetRef = useRef<{ lat: number; lng: number } | null>(null);

  // Generate stable target position per turn for meteor impacts
  useEffect(() => {
    if (isLobby || !engineState) {
      lastTargetRef.current = null;
      return;
    }
    // Generate new target at start of each turn (draw phase)
    if (engineState.phase === 'draw' && !lastTargetRef.current) {
      lastTargetRef.current = randomSpherePoint();
    }
  }, [isLobby, engineState?.phase, engineState?.turnNumber]);

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
      const newMeteors: MeteorProjectile[] = [];

      // Use the last reticle position as center, or random if not available
      const center = lastTargetRef.current || randomSpherePoint();

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

        // This die targets the planet - spawn meteors
        const dieEffect = DICE_EFFECTS[die.sides] || DICE_EFFECTS[6];
        const meteorCount = die.rollValue ?? Math.ceil(die.sides / 3);
        const baseSpread = 15;

        for (let i = 0; i < meteorCount; i++) {
          const offsetLat = (Math.random() - 0.5) * baseSpread * 2;
          const offsetLng = (Math.random() - 0.5) * baseSpread * 2;
          const meteorLat = Math.max(-85, Math.min(85, center.lat + offsetLat));
          let meteorLng = center.lng + offsetLng;
          if (meteorLng > 180) meteorLng -= 360;
          if (meteorLng < -180) meteorLng += 360;

          const targetPos = latLngToCartesian(meteorLat, meteorLng, GLOBE_CONFIG.radius);
          const startPos: [number, number, number] = [
            targetPos[0] + (Math.random() - 0.5) * 0.5,
            8 + Math.random() * 2,
            targetPos[2] + (Math.random() - 0.5) * 0.5,
          ];

          newMeteors.push({
            id: `meteor-${now}-${index}-${i}`,
            startPosition: startPos,
            targetPosition: targetPos,
            targetLat: meteorLat,
            targetLng: meteorLng,
            progress: 0,
            size: METEOR_CONFIG.size * dieEffect.meteorScale,
            launchTime: now + (index * 100) + (i * 30),
            dieType: die.sides,
          });
        }
      });

      // Destroy targeted guardians
      if (guardiansToDestroy.length > 0) {
        setGuardians(prev => prev.filter(g => !guardiansToDestroy.includes(g.id)));
      }

      // Spawn meteors for planet-targeting dice
      if (newMeteors.length > 0) {
        setMeteors(prev => [...prev, ...newMeteors]);
      }
    }
  }, [engineState?.phase, isLobby, guardians]);

  // Meteor animation loop
  useEffect(() => {
    if (meteors.length === 0) return;

    const updateMeteors = () => {
      const now = Date.now();

      setMeteors(prevMeteors => {
        const updatedMeteors: MeteorProjectile[] = [];
        const newImpacts: ImpactZone[] = [];

        prevMeteors.forEach(meteor => {
          const dieEffect = DICE_EFFECTS[meteor.dieType] || DICE_EFFECTS[6];
          const elapsed = now - meteor.launchTime;
          const duration = 800 / dieEffect.speed;
          const progress = Math.min(elapsed / duration, 1);

          if (progress < 1) {
            updatedMeteors.push({ ...meteor, progress });
          } else if (!processedMeteorsRef.current.has(meteor.id)) {
            // Meteor has landed - create impact
            processedMeteorsRef.current.add(meteor.id);
            newImpacts.push({
              id: `impact-${meteor.id}`,
              position: meteor.targetPosition,
              lat: meteor.targetLat,
              lng: meteor.targetLng,
              radius: METEOR_CONFIG.impactRadius * dieEffect.impactRadius,
              timestamp: now,
              dieType: meteor.dieType,
            });
          }
        });

        // Add new impacts
        if (newImpacts.length > 0) {
          setImpacts(prev => [...prev, ...newImpacts]);
        }

        return updatedMeteors;
      });
    };

    const interval = setInterval(updateMeteors, 16); // ~60fps
    return () => clearInterval(interval);
  }, [meteors.length]);

  // Clear old impacts after explosion duration
  useEffect(() => {
    const cleanup = setInterval(() => {
      const now = Date.now();
      setImpacts(prev =>
        prev.filter(impact => now - impact.timestamp < METEOR_CONFIG.explosionDuration)
      );
    }, 500);
    return () => clearInterval(cleanup);
  }, []);

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
      }
    : {
        phase: 'draw',
        hand: [],
        holdsRemaining: 2,
        throwsRemaining: 3,
        targetScore: scoreGoal,
        currentScore: 0,
        multiplier: 1,
        turnsRemaining: 5,
        turnNumber: 1,
        enemiesSquished: 0,
        friendlyHits: 0,
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
    const state = engineRef.current?.getState();
    engineRef.current?.dispatch({ type: 'THROW' });

    // Get state AFTER throw to check values and throws remaining
    setTimeout(() => {
      const newState = engineRef.current?.getState();
      if (newState) {
        // Get thrown dice (unheld ones that now have values)
        const thrownDice = newState.hand.filter(d => !d.isHeld && d.rollValue !== null);
        const values = thrownDice.map(d => d.rollValue!);
        const diceTypes = thrownDice.map(d => d.sides);

        // Detect roll pattern and fire NPC event
        const rollPayload = detectRollRarity(values, diceTypes);
        if (rollPayload) {
          onDiceRoll(rollPayload);
        }

        // Check if throws exhausted - trigger game over if score not met
        if (newState.throwsRemaining === 0 && newState.currentScore < newState.targetScore) {
          // Fire defeat NPC commentary and trigger game over
          onDefeat();
          onLose();
        }
      }
    }, 100); // Small delay to let state update
  }, [onDiceRoll, onFeedUpdate, onDefeat, onLose]);

  // Victory explosion callback - fires after explosion animation
  const handleVictoryExplosionComplete = useCallback(() => {
    if (engineState?.phase === 'victory') {
      // Fire victory NPC commentary
      onVictory();
      // Then call the win callback
      onWin(engineState.currentScore, {
        npcsSquished: engineState.enemiesSquished,
        diceThrown: engineState.turnNumber * 5,
      });
    }
  }, [engineState, onWin, onVictory]);

  // Fire defeat trigger when game is lost
  useEffect(() => {
    if (engineState?.phase === 'defeat') {
      onDefeat();
    }
  }, [engineState?.phase, onDefeat]);

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
      }}
    >
      {/* Top bar - Turn meter (or lobby message) */}
      <CardSection
        padding={1}
        sx={{
          width: '100%',
          maxWidth: 480,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          borderRadius: 2,
        }}
      >
        {isLobby ? (
          <>
            <Typography sx={{ ...gamingFont, fontSize: '1rem', fontWeight: 700, color: tokens.colors.text.secondary }}>
              Ready
            </Typography>
            <Typography sx={{ ...gamingFont, fontSize: '1rem', color: tokens.colors.text.secondary }}>
              Click "New Run" to begin
            </Typography>
            <Box sx={{ width: 60 }} />
          </>
        ) : (
          <>
            <Typography sx={{ ...gamingFont, fontSize: '1rem', fontWeight: 700 }}>
              Turn {combatState.turnNumber}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
              <Typography sx={{ ...gamingFont, fontSize: '1.2rem', fontWeight: 700, color: tokens.colors.primary }}>
                {combatState.currentScore.toLocaleString()}
              </Typography>
              <Typography sx={{ ...gamingFont, fontSize: '0.85rem', color: tokens.colors.text.secondary }}>
                / {combatState.targetScore.toLocaleString()}
              </Typography>
            </Box>

            <Typography sx={{ ...gamingFont, fontSize: '1rem', color: tokens.colors.warning }}>
              {combatState.turnsRemaining} left
            </Typography>
          </>
        )}
      </CardSection>

      {/* Globe canvas */}
      <Paper
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
            meteors={meteors}
            impacts={impacts}
            guardians={isLobby ? [] : guardians}
            onGlobeClick={() => {}}
            style="lowPoly"
            autoRotate={isLobby && !showVictoryExplosion}
            isIdle={isLobby}
            zones={[]}
            domainId={domain}
            showVictoryExplosion={showVictoryExplosion}
            onVictoryExplosionComplete={handleVictoryExplosionComplete}
          />
        </Box>

        {/* Fixed HUD Reticle - centered on screen, stacked die shapes */}
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
            <HUDReticle dice={reticleDice} />
          </Box>
        )}

        {/* Grid overlay - show enemy count when in combat */}
        {!isLobby && engineState && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 8,
              left: 8,
              bgcolor: 'rgba(0,0,0,0.7)',
              px: 1,
              py: 0.5,
              borderRadius: 1,
            }}
          >
            <Typography sx={{ ...gamingFont, fontSize: '0.75rem', color: tokens.colors.text.secondary }}>
              Enemies: {Array.from(engineState.entities.values()).filter(e => e.type === 'enemy' && e.isAlive).length}
            </Typography>
          </Box>
        )}

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
      />
    </Box>
  );
}

export default CombatTerminal;
