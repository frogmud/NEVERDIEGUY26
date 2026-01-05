/**
 * MeteorShower - Tracer-style projectiles shooting from camera toward globe
 *
 * Simplified 2D shooter feel:
 * - Straight shots from camera POV through reticle
 * - Colored streak/tracer lines (no spinning 3D geometry)
 * - Colors based on die type
 *
 * NEVER DIE GUY
 */

import { useMemo } from 'react';
import * as THREE from 'three';

import { MeteorProjectile, DICE_EFFECTS } from '../config';

interface MeteorShowerProps {
  meteors: MeteorProjectile[];
  onImpact?: (meteorId: string, position: [number, number, number]) => void;
}

/**
 * Calculate position with linear interpolation (straight line)
 */
function getMeteorPosition(meteor: MeteorProjectile): [number, number, number] {
  const { startPosition, targetPosition, progress } = meteor;

  // Linear interpolation - straight shot
  const t = progress;
  const x = startPosition[0] + (targetPosition[0] - startPosition[0]) * t;
  const y = startPosition[1] + (targetPosition[1] - startPosition[1]) * t;
  const z = startPosition[2] + (targetPosition[2] - startPosition[2]) * t;

  return [x, y, z];
}

/**
 * Get the direction vector for orienting the streak
 */
function getDirection(meteor: MeteorProjectile): THREE.Vector3 {
  const dir = new THREE.Vector3(
    meteor.targetPosition[0] - meteor.startPosition[0],
    meteor.targetPosition[1] - meteor.startPosition[1],
    meteor.targetPosition[2] - meteor.startPosition[2]
  );
  return dir.normalize();
}

/**
 * Single meteor - colored tracer streak
 */
function Meteor({ meteor }: { meteor: MeteorProjectile }) {
  const dieEffect = DICE_EFFECTS[meteor.dieType] || DICE_EFFECTS[6];
  const meteorColor = dieEffect.color;

  const position = useMemo(
    () => getMeteorPosition(meteor),
    [meteor.progress, meteor.startPosition, meteor.targetPosition]
  );

  const direction = useMemo(
    () => getDirection(meteor),
    [meteor.startPosition, meteor.targetPosition]
  );

  // Streak length based on progress (shorter near start and end)
  const streakLength = 0.8 * Math.min(meteor.progress * 4, (1 - meteor.progress) * 4, 1);
  const streakThickness = 0.04 + (meteor.dieType / 20) * 0.03; // Thicker for bigger dice

  // Calculate rotation to align cylinder with direction
  const rotation = useMemo(() => {
    const up = new THREE.Vector3(0, 1, 0);
    const quaternion = new THREE.Quaternion().setFromUnitVectors(up, direction);
    return new THREE.Euler().setFromQuaternion(quaternion);
  }, [direction]);

  // Opacity fades slightly as it approaches target
  const opacity = 1 - meteor.progress * 0.3;

  return (
    <group position={position} rotation={rotation}>
      {/* Core streak - bright center */}
      <mesh>
        <cylinderGeometry args={[streakThickness, streakThickness, streakLength, 6]} />
        <meshBasicMaterial color={meteorColor} />
      </mesh>

      {/* Glow around streak */}
      <mesh>
        <cylinderGeometry args={[streakThickness * 2.5, streakThickness * 2.5, streakLength * 0.9, 6]} />
        <meshBasicMaterial
          color={meteorColor}
          transparent
          opacity={0.4 * opacity}
        />
      </mesh>

      {/* Outer glow - wider, softer */}
      <mesh>
        <cylinderGeometry args={[streakThickness * 5, streakThickness * 5, streakLength * 0.7, 8]} />
        <meshBasicMaterial
          color={meteorColor}
          transparent
          opacity={0.15 * opacity}
        />
      </mesh>

      {/* Trail segments behind - 3 fading segments */}
      {meteor.progress > 0.1 && (
        <>
          {[0.12, 0.24, 0.36].map((offset, i) => {
            const trailProgress = Math.max(0, meteor.progress - offset);
            const trailMeteor = { ...meteor, progress: trailProgress };
            const trailPos = getMeteorPosition(trailMeteor);
            const trailOpacity = (0.3 - i * 0.08) * (1 - meteor.progress);
            const trailLength = streakLength * (0.6 - i * 0.15);

            // Convert to local offset from current position
            const localOffset: [number, number, number] = [
              trailPos[0] - position[0],
              trailPos[1] - position[1],
              trailPos[2] - position[2],
            ];

            return (
              <mesh key={i} position={localOffset}>
                <cylinderGeometry args={[streakThickness * 1.5, streakThickness * 0.5, trailLength, 4]} />
                <meshBasicMaterial
                  color={meteorColor}
                  transparent
                  opacity={trailOpacity}
                />
              </mesh>
            );
          })}
        </>
      )}
    </group>
  );
}

/**
 * MeteorShower Component
 *
 * Renders all active meteors as tracer streaks.
 */
export function MeteorShower({ meteors }: MeteorShowerProps) {
  return (
    <group>
      {meteors.map((meteor) => (
        <Meteor key={meteor.id} meteor={meteor} />
      ))}
    </group>
  );
}

export default MeteorShower;
