/**
 * NPCMarker - 3D representation of an NPC on the globe surface
 *
 * Positioned using lat/lng coordinates, sized/colored by rarity.
 * NEVER DIE GUY
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Cone, Billboard } from '@react-three/drei';
import * as THREE from 'three';

import { GlobeNPC, NPC_CONFIG, GLOBE_CONFIG } from '../config';
import { latLngToCartesian, getSurfaceNormal } from '../utils/sphereCoords';

interface NPCMarkerProps {
  npc: GlobeNPC;
  highlighted?: boolean;
  onClick?: (npcId: string) => void;
}

/**
 * NPCMarker Component
 *
 * Renders an NPC as a 3D marker on the globe surface.
 * The marker floats slightly above the surface and rotates to face outward.
 */
export function NPCMarker({
  npc,
  highlighted = false,
  onClick,
}: NPCMarkerProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  // Calculate 3D position from lat/lng
  const position = useMemo((): [number, number, number] => {
    // Position slightly above surface for visibility
    const surfaceRadius = GLOBE_CONFIG.radius + 0.1;
    return latLngToCartesian(npc.lat, npc.lng, surfaceRadius);
  }, [npc.lat, npc.lng]);

  // Get surface normal for orientation
  const normal = useMemo(() => {
    return getSurfaceNormal(npc.lat, npc.lng);
  }, [npc.lat, npc.lng]);

  // Size and color based on rarity
  const size = NPC_CONFIG.markerSize[npc.rarity];
  const color = NPC_CONFIG.colors[npc.rarity];

  // Gentle hover animation
  useFrame((state) => {
    if (meshRef.current) {
      const offset = Math.sin(state.clock.elapsedTime * 2 + npc.id.charCodeAt(0)) * 0.02;
      meshRef.current.position.y = offset;
    }
  });

  // Calculate rotation to point outward from globe center
  const lookAtCenter = useMemo(() => {
    const up = new THREE.Vector3(...normal);
    return new THREE.Euler().setFromQuaternion(
      new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        up
      )
    );
  }, [normal]);

  return (
    <group position={position} rotation={lookAtCenter}>
      {/* Main marker body */}
      <Cone
        ref={meshRef}
        args={[size, size * 2, 4]}
        rotation={[Math.PI, 0, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onClick?.(npc.id);
        }}
      >
        <meshStandardMaterial
          color={color}
          emissive={highlighted ? color : '#000000'}
          emissiveIntensity={highlighted ? 0.5 : 0}
          metalness={0.3}
          roughness={0.7}
        />
      </Cone>

      {/* Rarity glow ring for legendary */}
      {npc.rarity === 'legendary' && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[size * 1.2, size * 1.5, 16]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.6}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Health bar for bosses */}
      {npc.health > 1 && (
        <Billboard position={[0, size * 2.5, 0]}>
          <mesh>
            <planeGeometry args={[size * 3, size * 0.3]} />
            <meshBasicMaterial color="#333" />
          </mesh>
          <mesh position={[-size * 1.5 * (1 - npc.health / 100), 0, 0.01]}>
            <planeGeometry args={[size * 3 * (npc.health / 100), size * 0.25]} />
            <meshBasicMaterial color="#ff1744" />
          </mesh>
        </Billboard>
      )}
    </group>
  );
}

export default NPCMarker;
