/**
 * ImpactEffect - Explosion and shockwave at meteor impact point
 *
 * Visual feedback when a meteor hits the globe surface.
 * Includes crater, explosion particles, and expanding shockwave ring.
 * NEVER DIE GUY
 */

import { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import { ImpactZone, METEOR_CONFIG, GLOBE_CONFIG, DICE_EFFECTS } from '../config';
import { cartesianToLatLng, getSurfaceNormal } from '../utils/sphereCoords';

interface ImpactEffectProps {
  impact: ImpactZone;
  onComplete?: (impactId: string) => void;
  isIdle?: boolean; // Freeze animation when idle
}

/**
 * ImpactEffect Component
 *
 * Animated explosion effect at the impact point on the globe.
 * Auto-removes itself after the animation completes.
 */
export function ImpactEffect({ impact, onComplete, isIdle = false }: ImpactEffectProps) {
  const groupRef = useRef<THREE.Group>(null);
  const shockwaveRef = useRef<THREE.Mesh>(null);
  const [progress, setProgress] = useState(0);
  const pausedAtRef = useRef<number | null>(null);

  // Get die-specific effects
  const dieEffect = DICE_EFFECTS[impact.dieType] || DICE_EFFECTS[6];
  const impactColor = dieEffect.color;
  const impactScale = dieEffect.aoeMultiplier;

  const { lat, lng } = useMemo(() => {
    return cartesianToLatLng(
      impact.position[0],
      impact.position[1],
      impact.position[2]
    );
  }, [impact.position]);

  const normal = useMemo(() => {
    return getSurfaceNormal(lat, lng);
  }, [lat, lng]);

  // Animation progress with idle freeze support
  useEffect(() => {
    // If idle, freeze at current progress
    if (isIdle) {
      if (pausedAtRef.current === null) {
        pausedAtRef.current = progress;
      }
      return;
    }

    // Resume from paused state
    const startProgress = pausedAtRef.current !== null ? pausedAtRef.current : 0;
    pausedAtRef.current = null;

    const startTime = Date.now() - startProgress * METEOR_CONFIG.explosionDuration;
    const duration = METEOR_CONFIG.explosionDuration;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min(elapsed / duration, 1);
      setProgress(newProgress);

      if (newProgress < 1) {
        requestAnimationFrame(animate);
      } else {
        onComplete?.(impact.id);
      }
    };

    const frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [impact.id, onComplete, isIdle]);

  // Calculate rotation to align with surface
  const rotation = useMemo(() => {
    const up = new THREE.Vector3(...normal);
    const quaternion = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 0, 1),
      up
    );
    return new THREE.Euler().setFromQuaternion(quaternion);
  }, [normal]);

  // Shockwave expansion
  useFrame(() => {
    if (shockwaveRef.current) {
      const scale = 1 + progress * METEOR_CONFIG.shockwaveSpeed * 2;
      shockwaveRef.current.scale.setScalar(scale);
      const mat = shockwaveRef.current.material as THREE.MeshBasicMaterial;
      if (mat) {
        mat.opacity = (1 - progress) * 0.8;
      }
    }
  });

  // Position slightly above surface
  const surfacePosition = useMemo((): [number, number, number] => {
    const [x, y, z] = impact.position;
    const length = Math.sqrt(x * x + y * y + z * z);
    const normalizedRadius = GLOBE_CONFIG.radius + 0.05;
    return [
      (x / length) * normalizedRadius,
      (y / length) * normalizedRadius,
      (z / length) * normalizedRadius,
    ];
  }, [impact.position]);

  // Scale the impact radius by die effect
  const scaledRadius = impact.radius * impactScale;

  return (
    <group ref={groupRef} position={surfacePosition} rotation={rotation}>
      {/* Central explosion flash - color varies by die type */}
      <mesh>
        <sphereGeometry args={[scaledRadius * (1 - progress * 0.5), 16, 16]} />
        <meshBasicMaterial
          color={impactColor}
          transparent
          opacity={(1 - progress) * 0.8}
        />
      </mesh>

      {/* Expanding shockwave ring - larger for high AOE dice */}
      <mesh ref={shockwaveRef}>
        <ringGeometry args={[scaledRadius * 0.8, scaledRadius, 32]} />
        <meshBasicMaterial
          color={impactColor}
          transparent
          opacity={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Crater mark (persists longer) - darker for terrain-damaging dice */}
      {progress > 0.3 && (
        <mesh>
          <circleGeometry args={[scaledRadius * 0.5 * dieEffect.terrainDamage, 16]} />
          <meshBasicMaterial
            color="#1a0a0a"
            transparent
            opacity={0.3 + dieEffect.terrainDamage * 0.4}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Particle sparks - more particles for larger explosions */}
      {progress < 0.5 &&
        [...Array(Math.floor(8 * impactScale))].map((_, i) => {
          const particleCount = Math.floor(8 * impactScale);
          const angle = (i / particleCount) * Math.PI * 2;
          const distance = scaledRadius * progress * 2;
          return (
            <mesh
              key={i}
              position={[
                Math.cos(angle) * distance,
                Math.sin(angle) * distance,
                0.1,
              ]}
            >
              <sphereGeometry args={[0.05 * impactScale * (1 - progress * 2), 4, 4]} />
              <meshBasicMaterial color={impactColor} />
            </mesh>
          );
        })}
    </group>
  );
}

export default ImpactEffect;
