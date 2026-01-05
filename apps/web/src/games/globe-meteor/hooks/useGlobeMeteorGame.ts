/**
 * useGlobeMeteorGame - Main game logic hook for globe meteor
 *
 * Manages NPC movement, meteor launching, impact detection, and combos.
 * Supports multi-dice selection (up to 3 dice like the actual game).
 * NEVER DIE GUY
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  GlobeNPC,
  MeteorProjectile,
  ImpactZone,
  ComboState,
  NPCRarity,
  NPC_CONFIG,
  METEOR_CONFIG,
  COMBO_CONFIG,
  GLOBE_CONFIG,
  DICE_EFFECTS,
  GamePhase,
  RollResultData,
} from '../config';
import {
  fibonacciSpherePoints,
  latLngToCartesian,
  isWithinImpactRadius,
} from '../utils/sphereCoords';

export interface DiceType {
  sides: number;
  label: string;
  color: string;
}

interface UseGlobeMeteorGameOptions {
  initialNpcCount?: number;
  initialSummons?: number;
  maxDice?: number;
}

interface GameStats {
  score: number;
  npcsSquished: number;
  meteorsLaunched: number;
  maxCombo: number;
  summonsLeft: number;
}

// Increased movement speeds for more visible wandering
const MOVEMENT_SPEEDS = {
  common: 3.0,      // degrees per second (was 0.3)
  uncommon: 2.5,
  rare: 2.0,
  legendary: 1.5,
};

export function useGlobeMeteorGame(options: UseGlobeMeteorGameOptions = {}) {
  const { initialNpcCount = 25, initialSummons = 10, maxDice = 3 } = options;

  // Game state
  const [npcs, setNpcs] = useState<GlobeNPC[]>(() => generateNPCs(initialNpcCount));
  const [meteors, setMeteors] = useState<MeteorProjectile[]>([]);
  const [impacts, setImpacts] = useState<ImpactZone[]>([]);
  const [targetPosition, setTargetPosition] = useState<{ lat: number; lng: number } | null>(null);

  // Multi-dice selection (up to 3)
  const [selectedDice, setSelectedDice] = useState<DiceType[]>([]);

  const [isIdle, setIsIdle] = useState(true);
  const [lastInteraction, setLastInteraction] = useState(Date.now());

  // Stats
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    npcsSquished: 0,
    meteorsLaunched: 0,
    maxCombo: 0,
    summonsLeft: initialSummons,
  });

  // Combo state
  const [comboState, setComboState] = useState<ComboState>({
    hits: [],
    currentChain: 0,
    lastHitTime: 0,
    comboType: null,
  });

  // Game phase for turn-based flow
  const [gamePhase, setGamePhase] = useState<GamePhase>('select');

  // Last roll result for feedback display
  const [lastRollResult, setLastRollResult] = useState<RollResultData | null>(null);

  // Animation frame ref for NPC movement
  const animationRef = useRef<number | undefined>(undefined);
  const lastUpdateRef = useRef<number>(Date.now());

  // Track which meteors have already created impacts (prevent duplicates)
  const processedMeteorsRef = useRef<Set<string>>(new Set());

  // Idle detection (5 seconds of no interaction)
  useEffect(() => {
    const idleCheck = setInterval(() => {
      const now = Date.now();
      setIsIdle(now - lastInteraction > 5000);
    }, 1000);
    return () => clearInterval(idleCheck);
  }, [lastInteraction]);

  // NPC movement loop - FASTER movement
  useEffect(() => {
    const updateNPCs = () => {
      const now = Date.now();
      const delta = (now - lastUpdateRef.current) / 1000; // seconds
      lastUpdateRef.current = now;

      setNpcs((prevNpcs) =>
        prevNpcs.map((npc) => {
          const speed = MOVEMENT_SPEEDS[npc.rarity];

          // Check if it's time to change direction
          let { velocityLat, velocityLng, lastDirectionChange } = npc;
          if (now - lastDirectionChange > NPC_CONFIG.movement.directionChangeInterval) {
            // Pick new random direction
            const angle = Math.random() * Math.PI * 2;
            velocityLat = Math.cos(angle) * speed;
            velocityLng = Math.sin(angle) * speed;
            lastDirectionChange = now;
          }

          // Update position
          let newLat = npc.lat + velocityLat * delta;
          let newLng = npc.lng + velocityLng * delta;

          // Clamp latitude
          newLat = Math.max(-85, Math.min(85, newLat));

          // Wrap longitude
          if (newLng > 180) newLng -= 360;
          if (newLng < -180) newLng += 360;

          // Check wander radius from spawn
          const distFromSpawn = Math.sqrt(
            Math.pow(newLat - npc.spawnLat, 2) + Math.pow(newLng - npc.spawnLng, 2)
          );
          if (distFromSpawn > NPC_CONFIG.movement.wanderRadius) {
            // Reverse direction to head back toward spawn
            velocityLat = -velocityLat;
            velocityLng = -velocityLng;
          }

          return {
            ...npc,
            lat: newLat,
            lng: newLng,
            velocityLat,
            velocityLng,
            lastDirectionChange,
          };
        })
      );

      animationRef.current = requestAnimationFrame(updateNPCs);
    };

    animationRef.current = requestAnimationFrame(updateNPCs);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Meteor animation loop
  useEffect(() => {
    if (meteors.length === 0) {
      // All meteors have landed - transition to result phase, then select
      if (gamePhase === 'firing' || gamePhase === 'impact') {
        setGamePhase('result');
        // Auto-transition back to select after showing result
        setTimeout(() => setGamePhase('select'), 1500);
      }
      return;
    }

    // At least one meteor in flight
    if (gamePhase === 'firing') {
      setGamePhase('impact');
    }

    const updateMeteors = () => {
      const now = Date.now();

      setMeteors((prevMeteors) => {
        const updatedMeteors: MeteorProjectile[] = [];
        const newImpacts: ImpactZone[] = [];

        prevMeteors.forEach((meteor) => {
          // Get die-specific speed modifier
          const dieEffect = DICE_EFFECTS[meteor.dieType] || DICE_EFFECTS[6];
          const elapsed = now - meteor.launchTime;
          const duration = 800 / dieEffect.speed; // Faster dice = shorter flight
          const progress = Math.min(elapsed / duration, 1);

          if (progress < 1) {
            updatedMeteors.push({ ...meteor, progress });
          } else if (!processedMeteorsRef.current.has(meteor.id)) {
            // Meteor has landed - create impact (only if not already processed)
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

        // Process impacts
        if (newImpacts.length > 0) {
          setImpacts((prev) => [...prev, ...newImpacts]);
          processImpacts(newImpacts);
        }

        return updatedMeteors;
      });
    };

    const interval = setInterval(updateMeteors, 16); // ~60fps
    return () => clearInterval(interval);
  }, [meteors.length, gamePhase]);

  // Process impacts and check for NPC hits
  const processImpacts = useCallback(
    (newImpacts: ImpactZone[]) => {
      const now = Date.now();
      const hitNpcs: GlobeNPC[] = [];

      setNpcs((prevNpcs) => {
        const remaining = prevNpcs.filter((npc) => {
          for (const impact of newImpacts) {
            if (
              isWithinImpactRadius(
                npc.lat,
                npc.lng,
                impact.lat,
                impact.lng,
                METEOR_CONFIG.impactRadius * 12 // Slightly larger hit radius
              )
            ) {
              hitNpcs.push(npc);
              return false;
            }
          }
          return true;
        });
        return remaining;
      });

      // Update combo state and score
      if (hitNpcs.length > 0) {
        setComboState((prev) => {
          const newHits = hitNpcs.map((npc) => ({
            npcId: npc.id,
            timestamp: now,
            lat: npc.lat,
            lng: npc.lng,
          }));

          // Check if within combo window
          const withinWindow = now - prev.lastHitTime < COMBO_CONFIG.timeWindow;
          const newChain = withinWindow ? prev.currentChain + hitNpcs.length : hitNpcs.length;

          // Determine combo type
          let comboType: keyof typeof COMBO_CONFIG.comboTypes | null = null;
          if (newChain >= COMBO_CONFIG.comboTypes.ultra.minHits) {
            comboType = 'ultra';
          } else if (newChain >= COMBO_CONFIG.comboTypes.mega.minHits) {
            comboType = 'mega';
          } else if (newChain >= COMBO_CONFIG.comboTypes.triple.minHits) {
            comboType = 'triple';
          } else if (newChain >= COMBO_CONFIG.comboTypes.double.minHits) {
            comboType = 'double';
          }

          return {
            hits: withinWindow ? [...prev.hits, ...newHits] : newHits,
            currentChain: newChain,
            lastHitTime: now,
            comboType,
          };
        });

        // Calculate score
        let points = 0;
        hitNpcs.forEach((npc) => {
          points += NPC_CONFIG.scoreMultiplier[npc.rarity];
        });

        // Apply combo multiplier
        setStats((prev) => {
          const comboMultiplier =
            comboState.comboType
              ? COMBO_CONFIG.comboTypes[comboState.comboType].multiplier
              : 1;
          const finalPoints = Math.floor(points * comboMultiplier);

          return {
            ...prev,
            score: prev.score + finalPoints,
            npcsSquished: prev.npcsSquished + hitNpcs.length,
            maxCombo: Math.max(prev.maxCombo, comboState.currentChain + hitNpcs.length),
          };
        });
      }
    },
    [comboState]
  );

  // Clear old impacts
  useEffect(() => {
    const cleanup = setInterval(() => {
      const now = Date.now();
      setImpacts((prev) =>
        prev.filter((impact) => now - impact.timestamp < METEOR_CONFIG.explosionDuration)
      );
    }, 500);
    return () => clearInterval(cleanup);
  }, []);

  // Reset combo after timeout
  useEffect(() => {
    if (comboState.lastHitTime === 0) return;

    const timeout = setTimeout(() => {
      setComboState({
        hits: [],
        currentChain: 0,
        lastHitTime: 0,
        comboType: null,
      });
    }, COMBO_CONFIG.timeWindow);

    return () => clearTimeout(timeout);
  }, [comboState.lastHitTime]);

  // Toggle dice in hand (add or remove)
  const toggleDice = useCallback((dice: DiceType) => {
    setLastInteraction(Date.now());
    setSelectedDice((prev) => {
      const existingIndex = prev.findIndex((d) => d.label === dice.label);
      if (existingIndex >= 0) {
        // Remove it
        return prev.filter((_, i) => i !== existingIndex);
      } else if (prev.length < maxDice) {
        // Add it
        return [...prev, dice];
      }
      return prev;
    });
  }, [maxDice]);

  // Clear all selected dice
  const clearDice = useCallback(() => {
    setSelectedDice([]);
    setTargetPosition(null);
    setLastInteraction(Date.now());
  }, []);

  // Handle globe click - simplified: sets target directly if dice selected
  const handleGlobeClick = useCallback(
    (lat: number, lng: number) => {
      setLastInteraction(Date.now());
      if (selectedDice.length > 0) {
        setTargetPosition({ lat, lng });
      }
    },
    [selectedDice.length]
  );

  // Launch meteors at specific coordinates (rolls all selected dice)
  const launchMeteorsAt = useCallback((lat: number, lng: number) => {
    if (selectedDice.length === 0 || stats.summonsLeft <= 0) return null;

    setLastInteraction(Date.now());
    setGamePhase('firing');

    // Roll all selected dice
    const rolls: { die: DiceType; roll: number }[] = selectedDice.map((die) => ({
      die,
      roll: Math.floor(Math.random() * die.sides) + 1,
    }));

    const totalMeteors = rolls.reduce((sum, r) => sum + r.roll, 0);

    // Store roll result for feedback display
    const rollResult: RollResultData = {
      rolls: rolls.map(r => ({
        dieType: r.die.sides,
        label: r.die.label,
        roll: r.roll,
        color: r.die.color,
      })),
      totalMeteors,
      timestamp: Date.now(),
    };
    setLastRollResult(rollResult);

    // Calculate target position in 3D
    const now = Date.now();
    const newMeteors: MeteorProjectile[] = [];

    // Spread increases with more dice
    const baseSpread = 1.5;
    const spread = baseSpread + (selectedDice.length - 1) * 0.5;

    let meteorIndex = 0;
    for (const { die, roll } of rolls) {
      // Get die-specific effects
      const dieEffect = DICE_EFFECTS[die.sides] || DICE_EFFECTS[6];

      for (let i = 0; i < roll; i++) {
        const offsetLat = (Math.random() - 0.5) * spread * 2;
        const offsetLng = (Math.random() - 0.5) * spread * 2;
        const meteorLat = lat + offsetLat;
        const meteorLng = lng + offsetLng;
        const meteorTargetPos = latLngToCartesian(meteorLat, meteorLng, GLOBE_CONFIG.radius);

        // Start position: from camera direction (shooting into screen)
        // Camera is at z=15, globe at origin with radius 5
        // Start just in front of camera with slight spread toward target
        const spreadX = (Math.random() - 0.5) * 0.5; // Slight horizontal spread
        const spreadY = (Math.random() - 0.5) * 0.5; // Slight vertical spread
        const startPos: [number, number, number] = [
          spreadX,
          spreadY,
          14,  // Just in front of camera (z=15)
        ];

        newMeteors.push({
          id: `meteor-${now}-${meteorIndex}`,
          startPosition: startPos,
          targetPosition: meteorTargetPos,
          targetLat: meteorLat,
          targetLng: meteorLng,
          progress: 0,
          size: METEOR_CONFIG.size * dieEffect.meteorScale,
          launchTime: now + meteorIndex * 30, // Stagger launches
          dieType: die.sides,
        });
        meteorIndex++;
      }
    }

    setMeteors((prev) => [...prev, ...newMeteors]);
    setStats((prev) => ({
      ...prev,
      summonsLeft: prev.summonsLeft - 1,
      meteorsLaunched: prev.meteorsLaunched + totalMeteors,
    }));

    // Clear selected dice after firing - player must pick new dice
    setSelectedDice([]);

    return { rolls, totalMeteors };
  }, [selectedDice, stats.summonsLeft]);

  // Launch meteors (rolls all selected dice) - uses stored target position
  const launchMeteors = useCallback(() => {
    if (selectedDice.length === 0 || !targetPosition || stats.summonsLeft <= 0) return null;

    // Delegate to launchMeteorsAt with stored position
    const result = launchMeteorsAt(targetPosition.lat, targetPosition.lng);

    // Clear target after launching
    setTargetPosition(null);

    return result;
  }, [selectedDice, targetPosition, stats.summonsLeft, launchMeteorsAt]);

  // Check if can launch
  const canLaunch = selectedDice.length > 0 && targetPosition !== null && stats.summonsLeft > 0;

  // Reset game
  const resetGame = useCallback(
    (npcCount = initialNpcCount) => {
      setNpcs(generateNPCs(npcCount));
      setMeteors([]);
      setImpacts([]);
      processedMeteorsRef.current.clear(); // Clear processed meteor tracking
      setTargetPosition(null);
      setSelectedDice([]);
      setStats({
        score: 0,
        npcsSquished: 0,
        meteorsLaunched: 0,
        maxCombo: 0,
        summonsLeft: initialSummons,
      });
      setComboState({
        hits: [],
        currentChain: 0,
        lastHitTime: 0,
        comboType: null,
      });
      setGamePhase('select');
      setLastRollResult(null);
      setLastInteraction(Date.now());
    },
    [initialNpcCount, initialSummons]
  );

  return {
    // State
    npcs,
    meteors,
    impacts,
    targetPosition,
    selectedDice,
    stats,
    comboState,
    isIdle,
    canLaunch,
    maxDice,
    gamePhase,
    lastRollResult,

    // Actions
    toggleDice,
    clearDice,
    launchMeteors,
    launchMeteorsAt,
    handleGlobeClick,
    resetGame,
    setLastInteraction,
  };
}

// Helper to generate NPCs with movement data
function generateNPCs(count: number): GlobeNPC[] {
  const points = fibonacciSpherePoints(count);
  const now = Date.now();

  return points.map((point, i) => {
    // Random rarity based on weights
    const roll = Math.random();
    let rarity: NPCRarity = 'common';
    let cumulative = 0;
    for (const [r, weight] of Object.entries(NPC_CONFIG.rarityWeights)) {
      cumulative += weight;
      if (roll < cumulative) {
        rarity = r as NPCRarity;
        break;
      }
    }

    const speed = MOVEMENT_SPEEDS[rarity];
    const angle = Math.random() * Math.PI * 2;

    return {
      id: `npc-${i}`,
      lat: point.lat,
      lng: point.lng,
      rarity,
      health: rarity === 'legendary' ? 3 : 1,
      spawnLat: point.lat,
      spawnLng: point.lng,
      velocityLat: Math.cos(angle) * speed,
      velocityLng: Math.sin(angle) * speed,
      lastDirectionChange: now,
    };
  });
}

export default useGlobeMeteorGame;
