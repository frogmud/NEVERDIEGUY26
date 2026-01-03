/**
 * GlobeScene - Main 3D canvas for the globe meteor game
 *
 * This component wraps React Three Fiber's Canvas and sets up the 3D scene.
 * NEVER DIE GUY
 */

import { useRef, Suspense } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, PerspectiveCamera } from '@react-three/drei';

import { GLOBE_CONFIG, GlobeNPC, MeteorProjectile, ImpactZone } from './config';
import { Planet } from './components/Planet';
import { NPCMarker } from './components/NPCMarker';
import { ZoneMarker } from './components/ZoneMarker';
import { MeteorShower } from './components/MeteorShower';
import { TargetReticle } from './components/TargetReticle';
import { DiceReticle } from './components/DiceReticle';
import { ImpactEffect } from './components/ImpactEffect';
import { GuardianGroup, type GuardianData } from './components/Guardian';
import { VictoryExplosion } from './components/VictoryExplosion';
import { ZoneMarker as ZoneMarkerType } from '../../types/zones';

interface GlobeSceneProps {
  npcs: GlobeNPC[];
  meteors: MeteorProjectile[];
  impacts: ImpactZone[];
  onNPCHit?: (npcId: string, impactId: string) => void;
  onGlobeClick?: (lat: number, lng: number) => void;
  targetPosition?: { lat: number; lng: number } | null;
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
  /** Guardians - flat billboard enemies that orbit and protect the planet */
  guardians?: GuardianData[];
  onGuardianHit?: (guardianId: string) => void;
  /** Show victory explosion effect */
  showVictoryExplosion?: boolean;
  onVictoryExplosionComplete?: () => void;
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
  guardians = [],
  onGuardianHit,
  showVictoryExplosion = false,
  onVictoryExplosionComplete,
}: GlobeSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <Box
      ref={containerRef}
      sx={{ width: '100%', height: '100%' }}
      onMouseDown={onInteraction}
      onTouchStart={onInteraction}
    >
      <Canvas shadows>
        <Suspense fallback={null}>
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
            autoRotate={autoRotate}
            autoRotateSpeed={0.5}
          />

          {/* Lighting */}
          <ambientLight intensity={GLOBE_CONFIG.lighting.ambient} />
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
            <DiceReticle lat={targetPosition.lat} lng={targetPosition.lng} dieType={reticleDieType} />
          )}
          {targetPosition && !reticleDieType && (
            <TargetReticle lat={targetPosition.lat} lng={targetPosition.lng} />
          )}
        </Suspense>
      </Canvas>
    </Box>
  );
}

export default GlobeScene;
