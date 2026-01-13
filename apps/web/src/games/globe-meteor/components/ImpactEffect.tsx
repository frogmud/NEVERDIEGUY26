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
// Reduced count for better performance
const PARTICLE_COUNT = 12;
const particleDirections = Array.from({ length: PARTICLE_COUNT }, (_, i) => {
  const angle = (i / PARTICLE_COUNT) * Math.PI * 2 + Math.random() * 0.4;
  const elevation = (Math.random() - 0.2) * 1.0;
  return {
    x: Math.cos(angle) * (0.8 + Math.random() * 0.4),
    y: elevation,
    z: Math.sin(angle) * (0.8 + Math.random() * 0.4),
    size: 0.1 + Math.random() * 0.08,
    speed: 0.9 + Math.random() * 0.5,
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

  // Roll value for scaling (1 = min roll, dieType = max roll)
  const rollValue = impact.rollValue ?? Math.ceil(impact.dieType / 2);
  // Crater size scales dramatically with roll - small rolls = tiny, big rolls = massive
  // Range: 0.3 (rolled 1) to 2.0 (rolled max on d20)
  const intensity = 0.3 + (rollValue / 12);

  // Damage number shows the roll value
  const damageNumber = rollValue;

  const { lat, lng } = useMemo(() => {
    return cartesianToLatLng(impact.position[0], impact.position[1], impact.position[2]);
  }, [impact.position]);

  const normal = useMemo(() => getSurfaceNormal(lat, lng), [lat, lng]);

  // Animation progress - particles animate, but crater stays
  useEffect(() => {
    if (isIdle) return;

    const startTime = Date.now();
    const duration = METEOR_CONFIG.explosionDuration * 1.5; // Slower for more drama

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min(elapsed / duration, 1);
      setProgress(newProgress);

      if (newProgress < 1) {
        requestAnimationFrame(animate);
      }
      // Don't call onComplete - let craters persist!
    };

    const frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [impact.id, isIdle]);

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
      {/* Particle burst aligned to surface - ALL sizes scale with intensity */}
      <group ref={groupRef} rotation={rotation}>
        {/* Crater burn mark - fades over time instead of persistent black */}
        {progress < 0.95 && (
          <mesh>
            <circleGeometry args={[0.2 * intensity, 16]} />
            <meshBasicMaterial
              color="#1a1a1a"
              transparent
              opacity={Math.max(0, 0.5 * (1 - progress * 0.8))}
              side={THREE.FrontSide}
              depthWrite={false}
            />
          </mesh>
        )}

        {/* Central flash - scales with roll */}
        {progress < 0.5 && (
          <mesh>
            <circleGeometry args={[(0.3 + progress * 0.8) * intensity, 16]} />
            <meshBasicMaterial
              color={impactColor}
              transparent
              opacity={(1 - progress / 0.5) * Math.min(1, intensity) * 1.2}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}

        {/* Inner bright core - only on good rolls */}
        {progress < 0.25 && intensity > 0.8 && (
          <mesh>
            <circleGeometry args={[(0.1 + progress * 0.2) * intensity, 8]} />
            <meshBasicMaterial
              color="#ffffff"
              transparent
              opacity={(1 - progress / 0.25) * 0.8}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}

        {/* Expanding shockwave ring - MORE EXTREME */}
        {progress > 0.02 && progress < 0.8 && (
          <mesh>
            <ringGeometry args={[
              (0.2 + progress * 1.5) * intensity,
              (0.28 + progress * 1.6) * intensity,
              32
            ]} />
            <meshBasicMaterial
              color={impactColor}
              transparent
              opacity={Math.max(0, (1 - progress / 0.8) * 0.8 * intensity)}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}

        {/* Second shockwave - only on high rolls */}
        {intensity > 1.0 && progress > 0.1 && progress < 0.7 && (
          <mesh>
            <ringGeometry args={[
              (0.08 + (progress - 0.1) * 0.8) * intensity,
              (0.12 + (progress - 0.1) * 0.9) * intensity,
              20
            ]} />
            <meshBasicMaterial
              color="#ffffff"
              transparent
              opacity={Math.max(0, (1 - (progress - 0.1) / 0.6) * 0.3)}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}

        {/* Particle burst - scales with intensity */}
        <group ref={particlesRef}>
          {particleDirections.map((particle, i) => {
            const particleProgress = easeOut * particle.speed;
            const distance = particleProgress * 0.6 * intensity * (1 + impact.dieType / 15);
            const particleOpacity = Math.max(0, (1 - progress * 1.2) * 0.85);
            const particleScale = particle.size * intensity * (1 - progress * 0.5);

            return (
              <mesh
                key={i}
                position={[
                  particle.x * distance,
                  particle.y * distance * 0.5,
                  particle.z * distance,
                ]}
              >
                <sphereGeometry args={[particleScale, 4, 4]} />
                <meshBasicMaterial
                  color={impactColor}
                  transparent
                  opacity={particleOpacity}
                />
              </mesh>
            );
          })}
        </group>

        {/* Hot embers - only on good rolls, fewer for performance */}
        {intensity > 0.9 && progress > 0.2 && (
          <group>
            {[0, 1, 2, 3].map((i) => {
              const emberAngle = (i / 4) * Math.PI * 2 + i * 0.7;
              const emberProgress = (progress - 0.2) / 0.8;
              const emberDistance = (0.15 + emberProgress * 0.4) * intensity;
              const emberOpacity = Math.max(0, (1 - emberProgress) * 0.7);

              return (
                <mesh
                  key={`ember-${i}`}
                  position={[
                    Math.cos(emberAngle) * emberDistance,
                    emberProgress * 0.3 * intensity,
                    Math.sin(emberAngle) * emberDistance,
                  ]}
                >
                  <sphereGeometry args={[0.03 * intensity, 4, 4]} />
                  <meshBasicMaterial
                    color="#ffaa00"
                    transparent
                    opacity={emberOpacity}
                  />
                </mesh>
              );
            })}
          </group>
        )}

        {/* Smoke - fewer, only on bigger hits */}
        {intensity > 0.7 && progress > 0.15 && progress < 0.85 && (
          <group>
            {[0, 1, 2].map((i) => {
              const angle = (i / 3) * Math.PI * 2 + progress;
              const smokeProgress = (progress - 0.15) / 0.7;
              const smokeDistance = smokeProgress * 0.5 * intensity;
              const smokeOpacity = Math.max(0, (1 - smokeProgress) * 0.25);

              return (
                <mesh
                  key={`smoke-${i}`}
                  position={[
                    Math.cos(angle) * smokeDistance,
                    smokeProgress * 0.25 * intensity,
                    Math.sin(angle) * smokeDistance,
                  ]}
                >
                  <sphereGeometry args={[0.08 * intensity, 4, 4]} />
                  <meshBasicMaterial
                    color="#666666"
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
