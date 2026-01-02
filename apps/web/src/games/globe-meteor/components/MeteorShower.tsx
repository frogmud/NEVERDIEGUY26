/**
 * MeteorShower - Animated meteor projectiles flying toward the globe
 *
 * Handles multiple meteors with trails, arcing trajectories, and impact detection.
 * NEVER DIE GUY
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Trail, Sphere } from '@react-three/drei';
import * as THREE from 'three';

import { MeteorProjectile, METEOR_CONFIG, DICE_EFFECTS } from '../config';

interface MeteorShowerProps {
  meteors: MeteorProjectile[];
  onImpact?: (meteorId: string, position: [number, number, number]) => void;
}

/**
 * Single meteor with trail
 */
function Meteor({
  meteor,
  onImpact,
}: {
  meteor: MeteorProjectile;
  onImpact?: (id: string, pos: [number, number, number]) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  // Get die-specific effects
  const dieEffect = DICE_EFFECTS[meteor.dieType] || DICE_EFFECTS[6];
  const meteorColor = dieEffect.color;
  const meteorSize = meteor.size || METEOR_CONFIG.size * dieEffect.meteorScale;

  // Calculate current position based on progress (0-1)
  const currentPosition = useMemo((): [number, number, number] => {
    const { startPosition, targetPosition, progress } = meteor;

    // Bezier curve for arcing trajectory
    const t = progress;

    // Control point above the midpoint for the arc
    const midX = (startPosition[0] + targetPosition[0]) / 2;
    const midY = (startPosition[1] + targetPosition[1]) / 2 + METEOR_CONFIG.arcHeight;
    const midZ = (startPosition[2] + targetPosition[2]) / 2;

    // Quadratic bezier interpolation
    const oneMinusT = 1 - t;
    const x =
      oneMinusT * oneMinusT * startPosition[0] +
      2 * oneMinusT * t * midX +
      t * t * targetPosition[0];
    const y =
      oneMinusT * oneMinusT * startPosition[1] +
      2 * oneMinusT * t * midY +
      t * t * targetPosition[1];
    const z =
      oneMinusT * oneMinusT * startPosition[2] +
      2 * oneMinusT * t * midZ +
      t * t * targetPosition[2];

    return [x, y, z];
  }, [meteor]);

  // Check for impact
  useFrame(() => {
    if (meteor.progress >= 1 && onImpact) {
      onImpact(meteor.id, meteor.targetPosition);
    }
  });

  return (
    <Trail
      width={meteorSize * 2}
      length={METEOR_CONFIG.trailLength * dieEffect.meteorScale}
      color={new THREE.Color(meteorColor)}
      attenuation={(t) => t * t}
    >
      <Sphere
        ref={meshRef}
        args={[meteorSize, 8, 8]}
        position={currentPosition}
      >
        <meshStandardMaterial
          color={meteorColor}
          emissive={meteorColor}
          emissiveIntensity={1}
        />
      </Sphere>
    </Trail>
  );
}

/**
 * MeteorShower Component
 *
 * Renders all active meteors with trails and handles their animation.
 */
export function MeteorShower({ meteors, onImpact }: MeteorShowerProps) {
  return (
    <group>
      {meteors.map((meteor) => (
        <Meteor key={meteor.id} meteor={meteor} onImpact={onImpact} />
      ))}
    </group>
  );
}

export default MeteorShower;
