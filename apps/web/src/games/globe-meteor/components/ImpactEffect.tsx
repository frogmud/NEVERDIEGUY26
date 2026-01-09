/**
 * ImpactEffect - Particle burst explosion at meteor impact point
 *
 * Simplified smoke/particle burst:
 * - Colored particles exploding outward
 * - Particles fade and slow down
 * - Floating damage number that rises and fades
 * - Subtle camera shake
 *
 * NEVER DIE GUY
 */

import { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Text } from '@react-three/drei';

import { ImpactZone, METEOR_CONFIG, GLOBE_CONFIG, DICE_EFFECTS } from '../config';
import { cartesianToLatLng, getSurfaceNormal } from '../utils/sphereCoords';

interface ImpactEffectProps {
  impact: ImpactZone;
  onComplete?: (impactId: string) => void;
  isIdle?: boolean;
}

// Generate particle burst directions (pre-computed for performance)
const PARTICLE_COUNT = 10;
const particleDirections = Array.from({ length: PARTICLE_COUNT }, (_, i) => {
  const angle = (i / PARTICLE_COUNT) * Math.PI * 2 + Math.random() * 0.3;
  const elevation = (Math.random() - 0.3) * 0.8; // Mostly outward, slight upward bias
  return {
    x: Math.cos(angle) * (0.8 + Math.random() * 0.4),
    y: elevation,
    z: Math.sin(angle) * (0.8 + Math.random() * 0.4),
    size: 0.08 + Math.random() * 0.06,
    speed: 0.8 + Math.random() * 0.4,
  };
});

/**
 * ImpactEffect Component - Particle burst with damage number
 */
export function ImpactEffect({ impact, onComplete, isIdle = false }: ImpactEffectProps) {
  const groupRef = useRef<THREE.Group>(null);
  const textRef = useRef<THREE.Group>(null);
  const particlesRef = useRef<THREE.Group>(null);
  const [progress, setProgress] = useState(0);
  const shakeApplied = useRef(false);

  const { camera } = useThree();

  const dieEffect = DICE_EFFECTS[impact.dieType] || DICE_EFFECTS[6];
  const impactColor = dieEffect.color;

  // Damage number based on die type (visual feedback)
  const damageNumber = impact.dieType;

  const { lat, lng } = useMemo(() => {
    return cartesianToLatLng(impact.position[0], impact.position[1], impact.position[2]);
  }, [impact.position]);

  const normal = useMemo(() => getSurfaceNormal(lat, lng), [lat, lng]);

  // Animation progress
  useEffect(() => {
    if (isIdle) return;

    const startTime = Date.now();
    const duration = METEOR_CONFIG.explosionDuration * 0.7; // Slightly faster

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

  // Camera shake removed for accessibility (epilepsy concerns)

  // Calculate rotation to align with surface
  const rotation = useMemo(() => {
    const up = new THREE.Vector3(...normal);
    const quaternion = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 0, 1),
      up
    );
    return new THREE.Euler().setFromQuaternion(quaternion);
  }, [normal]);

  // Animate particles and floating text
  useFrame(() => {
    if (textRef.current) {
      // Text rises upward and fades
      const textRise = progress * 0.6;
      textRef.current.position.y = textRise;
    }
  });

  // Position slightly above surface - use raw position, just nudge outward slightly
  const surfacePosition = useMemo((): [number, number, number] => {
    const [x, y, z] = impact.position;
    const length = Math.sqrt(x * x + y * y + z * z);
    // Nudge 0.05 units above surface in the same direction (preserves domain scaling)
    const scale = (length + 0.05) / length;
    return [x * scale, y * scale, z * scale];
  }, [impact.position]);

  // Text fade (stays visible longer)
  const textOpacity = Math.max(0, 1 - progress * 1.1);

  // Easing for particles (fast start, slow end)
  const easeOut = 1 - Math.pow(1 - progress, 3);

  return (
    <group position={surfacePosition}>
      {/* Particle burst aligned to surface */}
      <group ref={groupRef} rotation={rotation}>
        {/* Central flash - quick bright flash */}
        {progress < 0.3 && (
          <mesh>
            <circleGeometry args={[0.15 + progress * 0.3, 8]} />
            <meshBasicMaterial
              color={impactColor}
              transparent
              opacity={(1 - progress / 0.3) * 0.9}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}

        {/* Particle burst */}
        <group ref={particlesRef}>
          {particleDirections.map((particle, i) => {
            // Particles expand outward and fade
            const particleProgress = easeOut * particle.speed;
            const distance = particleProgress * 0.5 * (1 + impact.dieType / 20); // Bigger dice = wider spread
            const particleOpacity = Math.max(0, (1 - progress * 1.2) * 0.8);
            const particleScale = particle.size * (1 - progress * 0.5);

            return (
              <mesh
                key={i}
                position={[
                  particle.x * distance,
                  particle.y * distance * 0.5, // Flatten the y spread
                  particle.z * distance,
                ]}
              >
                <sphereGeometry args={[particleScale, 6, 6]} />
                <meshBasicMaterial
                  color={impactColor}
                  transparent
                  opacity={particleOpacity}
                />
              </mesh>
            );
          })}
        </group>

        {/* Smoke wisps - larger, more transparent particles */}
        {progress > 0.1 && progress < 0.8 && (
          <group>
            {[0, 1, 2, 3].map((i) => {
              const angle = (i / 4) * Math.PI * 2 + progress * 2;
              const smokeProgress = (progress - 0.1) / 0.7;
              const smokeDistance = smokeProgress * 0.4;
              const smokeOpacity = Math.max(0, (1 - smokeProgress) * 0.25);

              return (
                <mesh
                  key={`smoke-${i}`}
                  position={[
                    Math.cos(angle) * smokeDistance,
                    smokeProgress * 0.2,
                    Math.sin(angle) * smokeDistance,
                  ]}
                >
                  <sphereGeometry args={[0.08 + smokeProgress * 0.1, 6, 6]} />
                  <meshBasicMaterial
                    color="#ffffff"
                    transparent
                    opacity={smokeOpacity}
                  />
                </mesh>
              );
            })}
          </group>
        )}
      </group>

      {/* Floating damage number - billboarded, rises and fades */}
      <group ref={textRef}>
        <Text
          fontSize={0.25}
          color={impactColor}
          anchorX="center"
          anchorY="middle"
          fillOpacity={textOpacity}
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          {damageNumber}
        </Text>
      </group>
    </group>
  );
}

export default ImpactEffect;
