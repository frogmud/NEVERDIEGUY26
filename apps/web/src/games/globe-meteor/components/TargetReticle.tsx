/**
 * TargetReticle - Aiming indicator on the globe surface
 *
 * Pulses and glows to show where meteors will impact.
 * Positioned using lat/lng coordinates on the sphere.
 * NEVER DIE GUY
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import { RETICLE_CONFIG, GLOBE_CONFIG } from '../config';
import { latLngToCartesian, getSurfaceNormal } from '../utils/sphereCoords';

interface TargetReticleProps {
  lat: number;
  lng: number;
  radius?: number;
  color?: string;
}

/**
 * TargetReticle Component
 *
 * Renders a pulsing target reticle on the globe surface.
 * The reticle is aligned to the surface normal (faces outward).
 */
export function TargetReticle({
  lat,
  lng,
  radius = RETICLE_CONFIG.outerRadius,
  color = RETICLE_CONFIG.color,
}: TargetReticleProps) {
  const groupRef = useRef<THREE.Group>(null);
  const innerRef = useRef<THREE.Mesh>(null);
  const outerRef = useRef<THREE.Mesh>(null);

  // Calculate 3D position from lat/lng
  const position = useMemo((): [number, number, number] => {
    // Slightly above surface to prevent z-fighting
    const surfaceRadius = GLOBE_CONFIG.radius + 0.02;
    return latLngToCartesian(lat, lng, surfaceRadius);
  }, [lat, lng]);

  // Get surface normal for orientation
  const normal = useMemo(() => {
    return getSurfaceNormal(lat, lng);
  }, [lat, lng]);

  // Pulsing animation
  useFrame((state) => {
    if (innerRef.current && outerRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * RETICLE_CONFIG.pulseSpeed) * 0.2 + 1;
      innerRef.current.scale.setScalar(pulse);
      const outerMat = outerRef.current.material as THREE.MeshBasicMaterial;
      if (outerMat) {
        outerMat.opacity = 0.3 + pulse * 0.2;
      }
    }
  });

  // Calculate rotation to align with surface
  const rotation = useMemo(() => {
    const up = new THREE.Vector3(...normal);
    const quaternion = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 0, 1),
      up
    );
    return new THREE.Euler().setFromQuaternion(quaternion);
  }, [normal]);

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      {/* Inner circle */}
      <mesh ref={innerRef}>
        <ringGeometry args={[0, RETICLE_CONFIG.innerRadius, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.4}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Outer ring */}
      <mesh ref={outerRef}>
        <ringGeometry
          args={[RETICLE_CONFIG.innerRadius + 0.05, radius, 32]}
        />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Crosshairs */}
      {[0, Math.PI / 2].map((angle, i) => (
        <mesh key={i} rotation={[0, 0, angle]}>
          <planeGeometry args={[radius * 2.5, 0.02]} />
          <meshBasicMaterial color={color} transparent opacity={0.8} />
        </mesh>
      ))}
    </group>
  );
}

export default TargetReticle;
