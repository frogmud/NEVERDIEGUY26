/**
 * ImpactEffect - Explosion at meteor impact point
 *
 * Enhanced with old satisfying feel:
 * - Central flash burst
 * - Multiple staggered expanding rings
 * - Floating damage number that rises and fades
 * - Camera shake on big impacts
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

/**
 * ImpactEffect Component - Enhanced explosion with old satisfying feel
 *
 * Features:
 * - Central flash burst (300ms)
 * - 3 staggered expanding rings (400ms each, 100ms stagger)
 * - Floating damage number rising and fading (800ms)
 * - Camera shake proportional to die type
 */
export function ImpactEffect({ impact, onComplete, isIdle = false }: ImpactEffectProps) {
  const groupRef = useRef<THREE.Group>(null);
  const textRef = useRef<THREE.Group>(null);
  const [progress, setProgress] = useState(0);
  const shakeApplied = useRef(false);

  const { camera } = useThree();

  const dieEffect = DICE_EFFECTS[impact.dieType] || DICE_EFFECTS[6];
  const impactColor = dieEffect.color;
  const impactScale = dieEffect.aoeMultiplier;

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

  // Camera shake effect (subtle shake on impact)
  useEffect(() => {
    if (isIdle || shakeApplied.current) return;
    shakeApplied.current = true;

    // Shake intensity based on die type (d20 = more shake)
    const intensity = 0.02 + (impact.dieType / 20) * 0.03;
    const duration = 100 + (impact.dieType / 20) * 50;

    const originalPosition = camera.position.clone();
    const startTime = Date.now();

    const shake = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed > duration) {
        camera.position.copy(originalPosition);
        return;
      }

      const decay = 1 - elapsed / duration;
      const offsetX = (Math.random() - 0.5) * intensity * decay;
      const offsetY = (Math.random() - 0.5) * intensity * decay;

      camera.position.x = originalPosition.x + offsetX;
      camera.position.y = originalPosition.y + offsetY;

      requestAnimationFrame(shake);
    };

    shake();
  }, [camera, isIdle, impact.dieType]);

  // Calculate rotation to align with surface
  const rotation = useMemo(() => {
    const up = new THREE.Vector3(...normal);
    const quaternion = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 0, 1),
      up
    );
    return new THREE.Euler().setFromQuaternion(quaternion);
  }, [normal]);

  // Animate the group scale and floating text
  useFrame(() => {
    if (groupRef.current) {
      // Flash expands 1 -> 3x
      const flashScale = 1 + progress * 2;
      groupRef.current.scale.setScalar(flashScale);
    }

    if (textRef.current) {
      // Text rises upward and fades
      const textRise = progress * 0.5;
      textRef.current.position.y = textRise;
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

  const scaledRadius = impact.radius * impactScale * 0.5;

  // Ring progress with stagger (each ring starts 0.1 later)
  const ring1Progress = Math.min(Math.max(progress * 1.2, 0), 1);
  const ring2Progress = Math.min(Math.max((progress - 0.1) * 1.2, 0), 1);
  const ring3Progress = Math.min(Math.max((progress - 0.2) * 1.2, 0), 1);

  // Text fade (stays visible longer than rings)
  const textOpacity = Math.max(0, 1 - progress * 1.2);

  return (
    <group position={surfacePosition}>
      {/* Impact effects aligned to surface */}
      <group ref={groupRef} rotation={rotation}>
        {/* Central flash burst */}
        <mesh>
          <circleGeometry args={[scaledRadius, 12]} />
          <meshBasicMaterial
            color={impactColor}
            transparent
            opacity={(1 - progress) * 0.9}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Ring 1 - fastest, largest */}
        <mesh scale={[1 + ring1Progress * 2, 1 + ring1Progress * 2, 1]}>
          <ringGeometry args={[scaledRadius * 0.8, scaledRadius * 1.0, 16]} />
          <meshBasicMaterial
            color={impactColor}
            transparent
            opacity={(1 - ring1Progress) * 0.7}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Ring 2 - medium, staggered */}
        {ring2Progress > 0 && (
          <mesh scale={[1 + ring2Progress * 1.8, 1 + ring2Progress * 1.8, 1]}>
            <ringGeometry args={[scaledRadius * 0.6, scaledRadius * 0.75, 16]} />
            <meshBasicMaterial
              color="#ffffff"
              transparent
              opacity={(1 - ring2Progress) * 0.5}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}

        {/* Ring 3 - slowest, smallest */}
        {ring3Progress > 0 && (
          <mesh scale={[1 + ring3Progress * 1.5, 1 + ring3Progress * 1.5, 1]}>
            <ringGeometry args={[scaledRadius * 0.4, scaledRadius * 0.55, 16]} />
            <meshBasicMaterial
              color={impactColor}
              transparent
              opacity={(1 - ring3Progress) * 0.4}
              side={THREE.DoubleSide}
            />
          </mesh>
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
