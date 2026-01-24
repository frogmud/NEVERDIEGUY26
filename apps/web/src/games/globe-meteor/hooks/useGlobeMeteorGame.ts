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
import {
  POPULATION_CONFIG,
  getDensityTier,
  getDensityTierConfig,
  getDensityEfficiency,
  type DensityTier,
  type BalanceDieSides,
} from '@ndg/ai-engine';

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

// Density state for population tracking
interface DensityState {
  npcCount: number;
  tier: DensityTier;
  tierConfig: ReturnType<typeof getDensityTierConfig>;
  eventStartTime: number;
  burstsFired: number[];  // Track which burst intervals have fired
}

// Increased movement speeds for more visible wandering
const MOVEMENT_SPEEDS = {
  common: 3.0,      // degrees per second (was 0.3)
  uncommon: 2.5,
  rare: 2.0,
  legendary: 1.5,
};

export function useGlobeMeteorGame(options: UseGlobeMeteorGameOptions = {}) {
  const { initialNpcCount = POPULATION_CONFIG.initialCount, initialSummons = 10, maxDice = 3 } = options;

  // Game state - start with population config initial count
  const [npcs, setNpcs] = useState<GlobeNPC[]>(() => generateNPCs(POPULATION_CONFIG.initialCount));
  const [meteors, setMeteors] = useState<MeteorProjectile[]>([]);
  const [impacts, setImpacts] = useState<ImpactZone[]>([]);
  const [targetPosition, setTargetPosition] = useState<{ lat: number; lng: number; point3D?: [number, number, number] } | null>(null);

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

  // Population density state
  const [densityState, setDensityState] = useState<DensityState>(() => ({
    npcCount: initialNpcCount,
    tier: getDensityTier(initialNpcCount),
    tierConfig: getDensityTierConfig(initialNpcCount),
    eventStartTime: Date.now(),
    burstsFired: [],
  }));

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

  // Population density spawn loop
  useEffect(() => {
    const spawnInterval = setInterval(() => {
      const now = Date.now();
      const elapsed = now - densityState.eventStartTime;

      setNpcs((prev) => {
        // Don't spawn if at max
        if (prev.length >= POPULATION_CONFIG.maxPopulation) return prev;

        // Calculate linear spawn (spawnRate NPCs per second)
        const toSpawn = POPULATION_CONFIG.spawnRate;

        // Generate new NPCs
        const newNpcs = generateSpawnedNPCs(toSpawn, prev.length);
        const updated = [...prev, ...newNpcs];

        // Update density state
        const newCount = updated.length;
        setDensityState((ds) => ({
          ...ds,
          npcCount: newCount,
          tier: getDensityTier(newCount),
          tierConfig: getDensityTierConfig(newCount),
        }));

        return updated;
      });

      // Check for burst spawns
      setDensityState((ds) => {
        const newBurstsFired = [...ds.burstsFired];
        let shouldBurst = false;

        for (const interval of POPULATION_CONFIG.burstIntervals) {
          if (elapsed >= interval && !ds.burstsFired.includes(interval)) {
            newBurstsFired.push(interval);
            shouldBurst = true;
          }
        }

        if (shouldBurst) {
          // Trigger burst spawn
          setNpcs((prev) => {
            if (prev.length >= POPULATION_CONFIG.maxPopulation) return prev;
            const burstNpcs = generateSpawnedNPCs(POPULATION_CONFIG.burstSize, prev.length);
            return [...prev, ...burstNpcs];
          });
        }

        return { ...ds, burstsFired: newBurstsFired };
      });
    }, 1000); // Every second

    return () => clearInterval(spawnInterval);
  }, [densityState.eventStartTime]);

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

  // Meteor animation - uses RAF ref shared with NPC loop
  const meteorAnimationRef = useRef<number | undefined>(undefined);

  // Handle game phase transitions when meteors land
  useEffect(() => {
    if (meteors.length === 0) {
      // All meteors have landed - transition to result phase, then select
      if (gamePhase === 'firing' || gamePhase === 'impact') {
        setGamePhase('result');
        // Auto-transition back to select after showing result
        setTimeout(() => setGamePhase('select'), 1500);
      }
    } else if (gamePhase === 'firing') {
      // At least one meteor in flight
      setGamePhase('impact');
    }
  }, [meteors.length, gamePhase]);

  // Meteor animation loop - RAF based for smooth animation
  useEffect(() => {
    if (meteors.length === 0) return;

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

      // Continue animation if meteors still exist
      meteorAnimationRef.current = requestAnimationFrame(updateMeteors);
    };

    meteorAnimationRef.current = requestAnimationFrame(updateMeteors);
    return () => {
      if (meteorAnimationRef.current) {
        cancelAnimationFrame(meteorAnimationRef.current);
      }
    };
  }, [meteors.length > 0]); // Only restart loop when meteors appear/disappear

  // Process impacts and check for NPC hits
  const processImpacts = useCallback(
    (newImpacts: ImpactZone[]) => {
      const now = Date.now();
      // Track both the hit NPC and which die type killed it
      const hitNpcsWithDie: { npc: GlobeNPC; dieType: number }[] = [];

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
              hitNpcsWithDie.push({ npc, dieType: impact.dieType });
              return false;
            }
          }
          return true;
        });
        return remaining;
      });

      // Extract just the NPCs for combo tracking
      const hitNpcs = hitNpcsWithDie.map((h) => h.npc);

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

        // Update density state when NPCs are squished
        setDensityState((prev) => {
          const newCount = prev.npcCount - hitNpcs.length;
          return {
            ...prev,
            npcCount: Math.max(0, newCount),
            tier: getDensityTier(Math.max(0, newCount)),
            tierConfig: getDensityTierConfig(Math.max(0, newCount)),
          };
        });

        // Calculate score with density efficiency
        let points = 0;
        const currentNpcCount = densityState.npcCount;

        hitNpcsWithDie.forEach(({ npc, dieType }) => {
          const basePoints = NPC_CONFIG.scoreMultiplier[npc.rarity];

          // Apply density efficiency for this die type
          // Die types are 4, 6, 8, 10, 12, 20
          const validDieType = [4, 6, 8, 10, 12, 20].includes(dieType)
            ? (dieType as BalanceDieSides)
            : (6 as BalanceDieSides);
          const densityEff = getDensityEfficiency(validDieType, currentNpcCount);

          points += Math.floor(basePoints * densityEff);
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
    [comboState, densityState.npcCount]
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
    (lat: number, lng: number, point3D?: [number, number, number]) => {
      setLastInteraction(Date.now());
      if (selectedDice.length > 0) {
        setTargetPosition({ lat, lng, point3D });
      }
    },
    [selectedDice.length]
  );

  // Launch meteors at specific coordinates (rolls all selected dice)
  // point3D is the raw clicked position - use for accurate first hit
  const launchMeteorsAt = useCallback((lat: number, lng: number, point3D?: [number, number, number]) => {
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
        // First meteor uses raw 3D point for exact hit, subsequent ones spread
        const isFirstMeteor = meteorIndex === 0;

        let meteorTargetPos: [number, number, number];
        let meteorLat = lat;
        let meteorLng = lng;

        if (isFirstMeteor && point3D) {
          // Use the exact clicked point for first meteor
          meteorTargetPos = point3D;
        } else {
          // Spread subsequent meteors around the target
          const offsetLat = isFirstMeteor ? 0 : (Math.random() - 0.5) * spread * 0.5;
          const offsetLng = isFirstMeteor ? 0 : (Math.random() - 0.5) * spread * 0.5;
          meteorLat = lat + offsetLat;
          meteorLng = lng + offsetLng;
          meteorTargetPos = latLngToCartesian(meteorLat, meteorLng, GLOBE_CONFIG.radius);
        }

        // startPos is ignored now - MeteorShower uses camera position directly
        const startPos: [number, number, number] = [0, 0, 0];

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

    // Delegate to launchMeteorsAt with stored position AND raw 3D point
    const result = launchMeteorsAt(targetPosition.lat, targetPosition.lng, targetPosition.point3D);

    // Clear target after launching
    setTargetPosition(null);

    return result;
  }, [selectedDice, targetPosition, stats.summonsLeft, launchMeteorsAt]);

  // Check if can launch
  const canLaunch = selectedDice.length > 0 && targetPosition !== null && stats.summonsLeft > 0;

  // Reset game
  const resetGame = useCallback(
    (npcCount = POPULATION_CONFIG.initialCount) => {
      const now = Date.now();
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
      // Reset density state with fresh event start time
      setDensityState({
        npcCount,
        tier: getDensityTier(npcCount),
        tierConfig: getDensityTierConfig(npcCount),
        eventStartTime: now,
        burstsFired: [],
      });
      setGamePhase('select');
      setLastRollResult(null);
      setLastInteraction(now);
    },
    [initialSummons]
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
    // Density state
    densityState,
    npcCount: npcs.length,
    densityTier: densityState.tier,
    densityTierConfig: densityState.tierConfig,

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

// Helper to spawn additional NPCs during gameplay (for density system)
function generateSpawnedNPCs(count: number, existingCount: number): GlobeNPC[] {
  const now = Date.now();
  const npcs: GlobeNPC[] = [];

  for (let i = 0; i < count; i++) {
    // Random position on globe
    const lat = (Math.random() - 0.5) * 170; // -85 to 85
    const lng = (Math.random() - 0.5) * 360; // -180 to 180

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

    npcs.push({
      id: `npc-spawn-${now}-${existingCount + i}`,
      lat,
      lng,
      rarity,
      health: rarity === 'legendary' ? 3 : 1,
      spawnLat: lat,
      spawnLng: lng,
      velocityLat: Math.cos(angle) * speed,
      velocityLng: Math.sin(angle) * speed,
      lastDirectionChange: now,
      spawnTime: now, // For spawn animation
    });
  }

  return npcs;
}

export default useGlobeMeteorGame;
