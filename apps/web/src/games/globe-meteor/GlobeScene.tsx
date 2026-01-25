/**
 * GlobeScene - Main 3D canvas for the globe meteor game
 *
 * This component wraps React Three Fiber's Canvas and sets up the 3D scene.
 * NEVER DIE GUY
 */

import { useRef, Suspense, useEffect, useCallback } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

import { GLOBE_CONFIG, GlobeNPC, MeteorProjectile, ImpactZone, DOMAIN_PLANET_CONFIG } from './config';
import { Planet } from './components/Planet';
import { NPCMarker } from './components/NPCMarker';
import { ZoneMarker } from './components/ZoneMarker';
import { MeteorShower } from './components/MeteorShower';
import { TargetReticle } from './components/TargetReticle';
import { DiceReticle } from './components/DiceReticle';
import { ImpactEffect } from './components/ImpactEffect';
import { GuardianGroup, type GuardianData } from './components/Guardian';
import { VictoryExplosion } from './components/VictoryExplosion';
import { BossSprite } from './components/BossSprite';
import { AsciiEffect } from './effects/AsciiEffect';
import { ZoneMarker as ZoneMarkerType } from '../../types/zones';
import type { BossDefinition } from '../../data/boss-types';

// Event sky colors - all black backgrounds for clean space look
// Zone 1: intact planet, Zone 2: damaged/mini-boss, Zone 3: Die-rector boss
const EVENT_SKY_COLORS: Record<number, { ambient: string; fog: string; intensity: number }> = {
  1: { ambient: '#ffffff', fog: '#000000', intensity: 0.30 },  // Clean white light, black sky
  2: { ambient: '#e0e0e0', fog: '#000000', intensity: 0.28 },  // Slightly dimmer
  3: { ambient: '#d0d0d0', fog: '#000000', intensity: 0.25 },  // Boss atmosphere
};

interface GlobeSceneProps {
  npcs: GlobeNPC[];
  meteors: MeteorProjectile[];
  impacts: ImpactZone[];
  onNPCHit?: (npcId: string, impactId: string) => void;
  onGlobeClick?: (lat: number, lng: number, point3D?: [number, number, number]) => void;
  targetPosition?: { lat: number; lng: number; point3D?: [number, number, number] } | null;
  /** Die type for dice-shaped reticle (4, 6, 8, 10, 12, or 20) */
  reticleDieType?: 4 | 6 | 8 | 10 | 12 | 20 | null;
  style?: 'lowPoly' | 'neonWireframe' | 'realistic' | 'retro';
  autoRotate?: boolean;
  onInteraction?: () => void;
  isIdle?: boolean; // Freeze impacts when idle
  // Zone props
  zones?: ZoneMarkerType[];
  onZoneClick?: (zone: ZoneMarkerType) => void;
  selectedZone?: ZoneMarkerType | null;
  /** Domain ID (1-6) for domain-specific planet size/color */
  domainId?: number;
  /** Event number (1-3) for sky color escalation */
  eventNumber?: number;
  /** Guardians - flat billboard enemies that orbit and protect the planet */
  guardians?: GuardianData[];
  onGuardianHit?: (guardianId: string) => void;
  /** Show victory explosion effect */
  showVictoryExplosion?: boolean;
  onVictoryExplosionComplete?: () => void;
  /** Callback when camera distance changes (for zoom-aware UI) */
  onCameraChange?: (distance: number) => void;
  /** Callback when center target changes (point on planet under reticle) */
  onCenterTargetChange?: (target: { lat: number; lng: number; point3D: [number, number, number] } | null) => void;
  /** Boss definition for boss encounters (zone 3) */
  boss?: BossDefinition;
  /** Current score for boss HP calculation */
  bossCurrentScore?: number;
  /** True when boss was just hit (triggers shake animation) */
  bossIsHit?: boolean;
  /** Enable ASCII art rendering mode */
  asciiMode?: boolean;
  /** Enable boot demo mode (auto-rotate + camera animation) */
  demoMode?: boolean;
}

/**
 * CameraTracker - Reports camera distance and center target for zoom-aware UI
 * Raycasts from camera through screen center to find the point on the planet under the reticle
 */
function CameraTracker({
  onDistanceChange,
  onCenterTargetChange,
  domainId,
  planetRef,
}: {
  onDistanceChange?: (distance: number) => void;
  onCenterTargetChange?: (target: { lat: number; lng: number; point3D: [number, number, number] } | null) => void;
  domainId?: number;
  planetRef?: React.RefObject<THREE.Mesh>;
}) {
  const { camera, scene } = useThree();
  const lastDistance = useRef(0);
  const lastTarget = useRef<{ lat: number; lng: number } | null>(null);
  const lastCameraPos = useRef(new THREE.Vector3());
  const raycaster = useRef(new THREE.Raycaster());
  // Reuse Vector2 to avoid allocations
  const screenCenter = useRef(new THREE.Vector2(0, 0));

  useFrame(() => {
    // Report distance changes
    if (onDistanceChange) {
      const distance = camera.position.length();
      if (Math.abs(distance - lastDistance.current) > 0.1) {
        lastDistance.current = distance;
        onDistanceChange(distance);
      }
    }

    // Skip raycast if camera hasn't moved significantly (optimization)
    if (onCenterTargetChange) {
      const cameraMoved = camera.position.distanceTo(lastCameraPos.current) > 0.02;
      if (!cameraMoved) return;
      lastCameraPos.current.copy(camera.position);

      raycaster.current.setFromCamera(screenCenter.current, camera);

      // If we have a planet ref, raycast only that mesh (much faster)
      // Otherwise fall back to scene search
      let planetHit: THREE.Intersection | undefined;

      if (planetRef?.current) {
        const hits = raycaster.current.intersectObject(planetRef.current, false);
        planetHit = hits[0];
      } else {
        // Fallback: search scene for planet by name
        const intersects = raycaster.current.intersectObjects(scene.children, true);
        planetHit = intersects.find((hit) => hit.object.name === 'planet');
      }

      if (planetHit) {
        const point = planetHit.point;
        // Convert 3D point to lat/lng
        const len = Math.sqrt(point.x ** 2 + point.y ** 2 + point.z ** 2);
        const lat = Math.asin(point.y / len) * (180 / Math.PI);
        const lng = Math.atan2(point.x, point.z) * (180 / Math.PI);

        // Only update if changed significantly
        if (
          !lastTarget.current ||
          Math.abs(lat - lastTarget.current.lat) > 0.5 ||
          Math.abs(lng - lastTarget.current.lng) > 0.5
        ) {
          lastTarget.current = { lat, lng };
          onCenterTargetChange({
            lat,
            lng,
            point3D: [point.x, point.y, point.z],
          });
        }
      } else {
        // Camera not looking at planet
        if (lastTarget.current !== null) {
          lastTarget.current = null;
          onCenterTargetChange(null);
        }
      }
    }
  });

  return null;
}

/**
 * CameraAnimator - Animates camera for demo mode
 * Smooth zoom in/out sequence to showcase 3D nature
 */
function CameraAnimator({ enabled }: { enabled: boolean }) {
  const { camera } = useThree();
  const startTime = useRef(Date.now());
  const initialPosition = useRef(new THREE.Vector3(0, 0, 15));

  useFrame(() => {
    if (!enabled) return;

    const elapsed = (Date.now() - startTime.current) / 1000; // seconds

    // 8-second animation sequence
    // 0-2s: normal view (z=15)
    // 2-4s: zoom out (z=25)
    // 4-6s: zoom in (z=10)
    // 6-8s: return to normal (z=15)
    // 8s+: stay at normal

    let targetZ = 15; // default

    if (elapsed < 2) {
      targetZ = 15; // normal
    } else if (elapsed < 4) {
      // Zoom out
      const t = (elapsed - 2) / 2; // 0 to 1
      targetZ = 15 + (25 - 15) * t; // lerp from 15 to 25
    } else if (elapsed < 6) {
      // Zoom in
      const t = (elapsed - 4) / 2; // 0 to 1
      targetZ = 25 - (25 - 10) * t; // lerp from 25 to 10
    } else if (elapsed < 8) {
      // Return to normal
      const t = (elapsed - 6) / 2; // 0 to 1
      targetZ = 10 + (15 - 10) * t; // lerp from 10 to 15
    } else {
      targetZ = 15; // settled at normal
    }

    // Smooth lerp to target position
    const targetPosition = new THREE.Vector3(0, 0, targetZ);
    camera.position.lerp(targetPosition, 0.05); // smooth interpolation
  });

  return null;
}

/**
 * Loading fallback for Suspense
 */
function LoadingFallback() {
  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0a0a0a',
      }}
    >
      <CircularProgress color="primary" />
    </Box>
  );
}

/**
 * GlobeScene Component
 *
 * Main 3D scene for the globe meteor game.
 */
export function GlobeScene({
  npcs,
  meteors,
  impacts,
  onNPCHit,
  onGlobeClick,
  targetPosition,
  reticleDieType,
  style = 'lowPoly',
  autoRotate = false,
  onInteraction,
  isIdle = false,
  zones = [],
  onZoneClick,
  selectedZone,
  domainId,
  eventNumber = 1,
  guardians = [],
  onGuardianHit,
  showVictoryExplosion = false,
  onVictoryExplosionComplete,
  onCameraChange,
  onCenterTargetChange,
  boss,
  bossCurrentScore = 0,
  bossIsHit = false,
  asciiMode = false,
  demoMode = false,
}: GlobeSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const glRef = useRef<THREE.WebGLRenderer | null>(null);

  // Cleanup WebGL context on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (glRef.current) {
        glRef.current.dispose();
        // Only force context loss if not already lost
        const gl = glRef.current.getContext();
        if (gl && !gl.isContextLost()) {
          glRef.current.forceContextLoss();
        }
        glRef.current = null;
      }
    };
  }, []);

  // Memoize interaction handler for stable reference
  const handleInteraction = useCallback(() => {
    onInteraction?.();
  }, [onInteraction]);

  // Get sky color based on event number (1-3)
  const skyConfig = EVENT_SKY_COLORS[Math.min(Math.max(eventNumber, 1), 3)] || EVENT_SKY_COLORS[1];

  return (
    <Box
      ref={containerRef}
      sx={{ width: '100%', height: '100%' }}
      onMouseDown={handleInteraction}
      onTouchStart={handleInteraction}
    >
      <Canvas
        shadows
        style={{ background: skyConfig.fog, cursor: 'pointer' }}
        gl={{ preserveDrawingBuffer: true }}
        onCreated={({ gl }) => { glRef.current = gl; }}
      >
        <Suspense fallback={<color attach="background" args={[skyConfig.fog]} />}>
          {/* Track camera distance and center target for zoom-aware UI */}
          <CameraTracker
            onDistanceChange={onCameraChange}
            onCenterTargetChange={onCenterTargetChange}
            domainId={domainId}
          />

          {/* Camera animator for demo mode */}
          <CameraAnimator enabled={demoMode} />

          {/* Camera with orbit controls */}
          <PerspectiveCamera
            makeDefault
            position={[0, 0, GLOBE_CONFIG.camera.initialDistance]}
            fov={GLOBE_CONFIG.camera.fov}
          />
          <OrbitControls
            enableZoom
            enableRotate
            minDistance={GLOBE_CONFIG.camera.minDistance}
            maxDistance={GLOBE_CONFIG.camera.maxDistance}
            enablePan={false}
            autoRotate={autoRotate || demoMode}
            autoRotateSpeed={demoMode ? 0.3 : 0.5}
          />

          {/* Lighting - ambient color shifts based on event number */}
          <ambientLight color={skyConfig.ambient} intensity={skyConfig.intensity} />
          <directionalLight
            position={GLOBE_CONFIG.lighting.sunPosition}
            intensity={GLOBE_CONFIG.lighting.sunIntensity}
            castShadow
          />

          {/* Starfield background */}
          <Stars
            radius={100}
            depth={50}
            count={5000}
            factor={4}
            saturation={0}
            fade
          />

          {/* Atmospheric fog - tints space based on event number */}
          <fog attach="fog" args={[skyConfig.fog, 25, 80]} />

          {/* The globe */}
          <Planet
            radius={GLOBE_CONFIG.radius}
            style={style}
            onClick={onGlobeClick}
            domainId={domainId}
          />

          {/* NPCs on surface (when no zones) */}
          {zones.length === 0 && npcs.map((npc) => (
            <NPCMarker key={npc.id} npc={npc} />
          ))}

          {/* Zone markers (when zones exist) */}
          {zones.map((zone) => (
            <ZoneMarker
              key={zone.id}
              zone={zone}
              isSelected={selectedZone?.id === zone.id}
              onClick={onZoneClick}
            />
          ))}

          {/* Guardians - flat billboard enemies orbiting the planet */}
          {guardians.length > 0 && (
            <GuardianGroup guardians={guardians} onGuardianHit={onGuardianHit} />
          )}

          {/* Boss sprite - positioned above/behind the globe */}
          {boss && (
            <BossSprite
              boss={boss}
              currentScore={bossCurrentScore}
              isHit={bossIsHit}
              position={[0, 2.5, -2]}
            />
          )}

          {/* Active meteors */}
          <MeteorShower meteors={meteors} />

          {/* Impact effects - freeze when idle or victory */}
          {impacts.map((impact) => (
            <ImpactEffect key={impact.id} impact={impact} isIdle={isIdle || showVictoryExplosion} />
          ))}

          {/* Victory explosion - nuclear effect when player wins */}
          <VictoryExplosion
            active={showVictoryExplosion}
            onComplete={onVictoryExplosionComplete}
          />

          {/* Target reticle - dice-shaped when die type provided */}
          {targetPosition && reticleDieType && (
            <DiceReticle
              lat={targetPosition.lat}
              lng={targetPosition.lng}
              dieType={reticleDieType}
              point3D={targetPosition.point3D}
            />
          )}
          {targetPosition && !reticleDieType && (
            <TargetReticle lat={targetPosition.lat} lng={targetPosition.lng} />
          )}

          {/* ASCII Art Post-Processing Effect */}
          {asciiMode && (
            <AsciiEffect
              enabled={asciiMode}
              cellSize={10}
              color={DOMAIN_PLANET_CONFIG[domainId || 1]?.color || '#8b7355'}
              glowColor={DOMAIN_PLANET_CONFIG[domainId || 1]?.glowColor || '#c4a882'}
              contrast={1.8}
            />
          )}
        </Suspense>
      </Canvas>
    </Box>
  );
}

export default GlobeScene;
