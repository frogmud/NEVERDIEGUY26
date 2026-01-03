/**
 * DiceReticle - Dice-shaped targeting indicator on the globe surface
 *
 * Shows the shape of the selected die type with pulsing animation.
 * Size scales with die type (d4=smallest, d20=largest).
 * NEVER DIE GUY
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import { GLOBE_CONFIG, DICE_EFFECTS } from '../config';
import { latLngToCartesian, getSurfaceNormal } from '../utils/sphereCoords';

interface DiceReticleProps {
  lat: number;
  lng: number;
  dieType: 4 | 6 | 8 | 10 | 12 | 20;
}

// Die type to range radius (on globe surface)
const DIE_RANGES: Record<number, number> = {
  4: 0.3,   // Smallest, precision
  6: 0.5,   // Standard
  8: 0.6,   // Medium
  10: 0.7,  // Cluster
  12: 0.9,  // Heavy
  20: 1.2,  // Cataclysm, largest
};

// Get number of sides for each die shape
function getDieSides(dieType: number): number {
  switch (dieType) {
    case 4: return 3;   // Triangle
    case 6: return 4;   // Square
    case 8: return 6;   // Hexagon
    case 10: return 5;  // Pentagon
    case 12: return 10; // Decagon
    case 20: return 8;  // Octagon
    default: return 6;
  }
}

/**
 * DiceReticle Component
 *
 * Renders a die-shaped pulsing reticle on the globe surface.
 */
export function DiceReticle({ lat, lng, dieType }: DiceReticleProps) {
  const groupRef = useRef<THREE.Group>(null);
  const innerMeshRef = useRef<THREE.Mesh>(null);
  const outerMeshRef = useRef<THREE.Mesh>(null);

  // Get die-specific color
  const dieEffect = DICE_EFFECTS[dieType] || DICE_EFFECTS[6];
  const color = dieEffect.color;
  const baseRadius = DIE_RANGES[dieType] || 0.5;
  const sides = getDieSides(dieType);

  // Calculate 3D position from lat/lng
  const position = useMemo((): [number, number, number] => {
    const surfaceRadius = GLOBE_CONFIG.radius + 0.02;
    return latLngToCartesian(lat, lng, surfaceRadius);
  }, [lat, lng]);

  // Get surface normal for orientation
  const normal = useMemo(() => {
    return getSurfaceNormal(lat, lng);
  }, [lat, lng]);

  // Calculate rotation to align with surface
  const rotation = useMemo(() => {
    const up = new THREE.Vector3(...normal);
    const quaternion = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 0, 1),
      up
    );
    return new THREE.Euler().setFromQuaternion(quaternion);
  }, [normal]);

  // Pulsing animation
  useFrame((state) => {
    if (groupRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 4) * 0.15 + 1;
      groupRef.current.scale.setScalar(pulse);
    }
    if (innerMeshRef.current) {
      const mat = innerMeshRef.current.material as THREE.MeshBasicMaterial;
      if (mat) {
        mat.opacity = 0.3 + Math.sin(state.clock.elapsedTime * 6) * 0.1;
      }
    }
    if (outerMeshRef.current) {
      const mat = outerMeshRef.current.material as THREE.MeshBasicMaterial;
      if (mat) {
        mat.opacity = 0.15 + Math.sin(state.clock.elapsedTime * 6) * 0.1;
      }
    }
  });

  // Rotation offset for d6 (diamond orientation)
  const shapeRotation = dieType === 6 ? Math.PI / 4 : 0;

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      {/* Inner shape (filled polygon) */}
      <mesh ref={innerMeshRef} rotation={[0, 0, shapeRotation]}>
        <ringGeometry args={[baseRadius * 0.5, baseRadius * 0.6, sides]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.4}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Outer shape outline (ring polygon) */}
      <mesh ref={outerMeshRef} rotation={[0, 0, shapeRotation]}>
        <ringGeometry args={[baseRadius * 0.9, baseRadius, sides]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.25}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Center dot */}
      <mesh>
        <circleGeometry args={[0.03, 8]} />
        <meshBasicMaterial color={color} transparent opacity={0.9} />
      </mesh>

      {/* Range circle (faint outer ring) */}
      <mesh>
        <ringGeometry args={[baseRadius * 1.1, baseRadius * 1.15, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.15}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

export default DiceReticle;
