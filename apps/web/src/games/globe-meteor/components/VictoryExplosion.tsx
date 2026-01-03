/**
 * VictoryExplosion - Nuclear explosion effect when player wins
 *
 * Big dramatic explosion that engulfs the planet with freeze frame.
 * NEVER DIE GUY
 */

import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { GLOBE_CONFIG } from '../config';

interface VictoryExplosionProps {
  active: boolean;
  onComplete?: () => void;
}

/**
 * VictoryExplosion Component
 *
 * Massive expanding explosion that covers the planet
 */
export function VictoryExplosion({ active, onComplete }: VictoryExplosionProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [progress, setProgress] = useState(0);
  const [frozen, setFrozen] = useState(false);

  // Animation
  useEffect(() => {
    if (!active) {
      setProgress(0);
      setFrozen(false);
      return;
    }

    const startTime = Date.now();
    const expandDuration = 1500; // 1.5s expansion
    const freezePoint = 0.7; // Freeze at 70% expansion

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min(elapsed / expandDuration, 1);
      setProgress(newProgress);

      // Freeze at peak
      if (newProgress >= freezePoint && !frozen) {
        setFrozen(true);
      }

      if (newProgress < 1 && !frozen) {
        requestAnimationFrame(animate);
      } else if (newProgress >= 1) {
        onComplete?.();
      }
    };

    requestAnimationFrame(animate);
  }, [active, onComplete, frozen]);

  // Scale animation
  useFrame(() => {
    if (!groupRef.current || !active) return;

    // Explosive scale curve
    const scale = frozen
      ? 3.5 // Frozen size
      : 0.1 + progress * 4; // Rapid expansion

    groupRef.current.scale.setScalar(scale);
  });

  if (!active) return null;

  const baseRadius = GLOBE_CONFIG.radius;

  return (
    <group ref={groupRef}>
      {/* Core fireball - white hot center */}
      <mesh>
        <sphereGeometry args={[baseRadius * 0.3, 16, 16]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={frozen ? 1 : 1 - progress * 0.3}
        />
      </mesh>

      {/* Inner orange layer */}
      <mesh>
        <sphereGeometry args={[baseRadius * 0.5, 16, 16]} />
        <meshBasicMaterial
          color="#ff8800"
          transparent
          opacity={frozen ? 0.9 : 0.9 - progress * 0.2}
        />
      </mesh>

      {/* Middle red layer */}
      <mesh>
        <sphereGeometry args={[baseRadius * 0.7, 16, 16]} />
        <meshBasicMaterial
          color="#ff4400"
          transparent
          opacity={frozen ? 0.7 : 0.7 - progress * 0.2}
        />
      </mesh>

      {/* Outer red glow */}
      <mesh>
        <sphereGeometry args={[baseRadius * 0.9, 16, 16]} />
        <meshBasicMaterial
          color="#ff2200"
          transparent
          opacity={frozen ? 0.5 : 0.5 - progress * 0.2}
        />
      </mesh>

      {/* Shockwave ring 1 */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[baseRadius * 0.8, baseRadius * 1.0, 32]} />
        <meshBasicMaterial
          color="#ffaa00"
          transparent
          opacity={frozen ? 0.8 : (1 - progress) * 0.8}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Shockwave ring 2 */}
      <mesh rotation={[Math.PI / 2, 0, Math.PI / 4]}>
        <ringGeometry args={[baseRadius * 1.0, baseRadius * 1.2, 32]} />
        <meshBasicMaterial
          color="#ff6600"
          transparent
          opacity={frozen ? 0.6 : (1 - progress) * 0.6}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Vertical shockwave */}
      <mesh rotation={[0, 0, 0]}>
        <ringGeometry args={[baseRadius * 0.9, baseRadius * 1.1, 32]} />
        <meshBasicMaterial
          color="#ff8800"
          transparent
          opacity={frozen ? 0.5 : (1 - progress) * 0.5}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Outer haze */}
      <mesh>
        <sphereGeometry args={[baseRadius * 1.3, 16, 16]} />
        <meshBasicMaterial
          color="#ff4400"
          transparent
          opacity={frozen ? 0.3 : progress * 0.3}
        />
      </mesh>
    </group>
  );
}

export default VictoryExplosion;
