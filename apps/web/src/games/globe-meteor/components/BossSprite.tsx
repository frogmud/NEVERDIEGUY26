/**
 * BossSprite - 3D billboard sprite for boss encounters
 *
 * Positioned above/behind the globe, facing the camera (billboard).
 * Shows the Die-rector sprite with hit animations and low HP effects.
 *
 * Based on the Guardian component pattern but for center-stage bosses.
 */

import { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { Billboard, Html } from '@react-three/drei';
import * as THREE from 'three';
import type { BossDefinition } from '../../../data/boss-types';

interface BossSpriteProps {
  boss: BossDefinition;
  currentScore: number;
  isHit?: boolean;
  position?: [number, number, number];
}

export function BossSprite({
  boss,
  currentScore,
  isHit = false,
  position = [0, 2.5, -2],
}: BossSpriteProps) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  // Load sprite texture
  const texture = useLoader(THREE.TextureLoader, boss.sprite);

  // Calculate HP state
  const totalHp = boss.maxHearts * boss.hpPerHeart;
  const currentHp = Math.max(0, totalHp - currentScore);
  const hpPercent = currentHp / totalHp;
  const isLowHp = hpPercent < 0.3;
  const isDefeated = currentHp <= 0;

  // Shake state for hit animation
  const [shakeOffset, setShakeOffset] = useState(0);
  const shakeStartTime = useRef(0);

  // Trigger shake on hit
  useEffect(() => {
    if (isHit) {
      shakeStartTime.current = Date.now();
    }
  }, [isHit]);

  // Animation frame
  useFrame(() => {
    if (!groupRef.current) return;

    // Hit shake animation (decays over 200ms)
    const timeSinceHit = Date.now() - shakeStartTime.current;
    if (timeSinceHit < 200) {
      const intensity = 1 - timeSinceHit / 200;
      const shake = Math.sin(timeSinceHit * 0.05) * 0.15 * intensity;
      groupRef.current.position.x = position[0] + shake;
    } else {
      groupRef.current.position.x = position[0];
    }

    // Low HP flicker effect
    if (isLowHp && meshRef.current) {
      const flicker = 0.7 + Math.sin(Date.now() * 0.01) * 0.3;
      (meshRef.current.material as THREE.MeshBasicMaterial).opacity = flicker;
    }

    // Defeated fade out
    if (isDefeated && meshRef.current) {
      const mat = meshRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = Math.max(0, mat.opacity - 0.02);
    }
  });

  // Sprite size based on boss scale
  const size = 3 * boss.scale;

  // Tint color for overlay effects
  const tintColor = useMemo(() => {
    if (isHit) return new THREE.Color('#ff0000');
    if (isLowHp) return new THREE.Color(boss.tint || '#ff4444');
    return null;
  }, [isHit, isLowHp, boss.tint]);

  if (isDefeated) {
    // Could add death animation here
    return null;
  }

  return (
    <group ref={groupRef} position={position}>
      <Billboard follow lockX={false} lockY={false} lockZ={false}>
        {/* Main sprite */}
        <mesh ref={meshRef}>
          <planeGeometry args={[size, size * 1.5]} />
          <meshBasicMaterial
            map={texture}
            transparent
            alphaTest={0.1}
            side={THREE.DoubleSide}
            opacity={1}
          />
        </mesh>

        {/* Damage flash overlay */}
        {isHit && (
          <mesh position={[0, 0, 0.01]}>
            <planeGeometry args={[size, size * 1.5]} />
            <meshBasicMaterial
              color="#ff0000"
              transparent
              opacity={0.4}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}

        {/* Low HP glow effect */}
        {isLowHp && !isHit && (
          <mesh position={[0, 0, -0.01]}>
            <planeGeometry args={[size * 1.2, size * 1.7]} />
            <meshBasicMaterial
              color={boss.tint || '#ff4444'}
              transparent
              opacity={0.15 + Math.sin(Date.now() * 0.005) * 0.1}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}

        {/* Shadow beneath sprite */}
        <mesh position={[0, -size * 0.75, -0.02]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[size * 0.5, 32]} />
          <meshBasicMaterial
            color="#000000"
            transparent
            opacity={0.3}
          />
        </mesh>
      </Billboard>
    </group>
  );
}

export default BossSprite;
