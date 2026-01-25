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
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

import { MeteorProjectile, DICE_EFFECTS } from '../config';

// Pre-created cylinder geometries (module-level, shared across all meteors)
// Avoids 6+ geometry allocations per meteor per frame
const CORE_CYLINDER = new THREE.CylinderGeometry(1, 1, 1, 6);
const GLOW_CYLINDER = new THREE.CylinderGeometry(1, 1, 1, 6);
const OUTER_CYLINDER = new THREE.CylinderGeometry(1, 1, 1, 8);
const TRAIL_CYLINDER = new THREE.CylinderGeometry(1, 0.33, 1, 4); // Tapered for trail

interface MeteorShowerProps {
  meteors: MeteorProjectile[];
  onImpact?: (meteorId: string, position: [number, number, number]) => void;
}

/**
 * Calculate position with linear interpolation (straight line)
 * Uses camera position as actual start point for true "firing from camera" feel
 */
function getMeteorPosition(
  meteor: MeteorProjectile,
  cameraPos: THREE.Vector3
): [number, number, number] {
  const { targetPosition, progress } = meteor;

  // Use camera position as start (fire from where player is looking)
  const startX = cameraPos.x;
  const startY = cameraPos.y;
  const startZ = cameraPos.z;

  // Linear interpolation - straight shot from camera to target
  const t = progress;
  const x = startX + (targetPosition[0] - startX) * t;
  const y = startY + (targetPosition[1] - startY) * t;
  const z = startZ + (targetPosition[2] - startZ) * t;

  return [x, y, z];
}

/**
 * Get the direction vector for orienting the streak
 */
function getDirection(meteor: MeteorProjectile, cameraPos: THREE.Vector3): THREE.Vector3 {
  const dir = new THREE.Vector3(
    meteor.targetPosition[0] - cameraPos.x,
    meteor.targetPosition[1] - cameraPos.y,
    meteor.targetPosition[2] - cameraPos.z
  );
  return dir.normalize();
}

/**
 * Single meteor - colored tracer streak
 */
function Meteor({ meteor, cameraPos }: { meteor: MeteorProjectile; cameraPos: THREE.Vector3 }) {
  const dieEffect = DICE_EFFECTS[meteor.dieType] || DICE_EFFECTS[6];
  const meteorColor = dieEffect.color;

  const position = useMemo(
    () => getMeteorPosition(meteor, cameraPos),
    [meteor.progress, meteor.targetPosition, cameraPos]
  );

  const direction = useMemo(
    () => getDirection(meteor, cameraPos),
    [meteor.targetPosition, cameraPos]
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
      <mesh geometry={CORE_CYLINDER} scale={[streakThickness, streakLength, streakThickness]}>
        <meshBasicMaterial color={meteorColor} />
      </mesh>

      {/* Glow around streak */}
      <mesh geometry={GLOW_CYLINDER} scale={[streakThickness * 2.5, streakLength * 0.9, streakThickness * 2.5]}>
        <meshBasicMaterial
          color={meteorColor}
          transparent
          opacity={0.4 * opacity}
        />
      </mesh>

      {/* Outer glow - wider, softer */}
      <mesh geometry={OUTER_CYLINDER} scale={[streakThickness * 5, streakLength * 0.7, streakThickness * 5]}>
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
            const trailPos = getMeteorPosition(trailMeteor, cameraPos);
            const trailOpacity = (0.3 - i * 0.08) * (1 - meteor.progress);
            const trailLength = streakLength * (0.6 - i * 0.15);

            // Convert to local offset from current position
            const localOffset: [number, number, number] = [
              trailPos[0] - position[0],
              trailPos[1] - position[1],
              trailPos[2] - position[2],
            ];

            return (
              <mesh key={i} geometry={TRAIL_CYLINDER} position={localOffset} scale={[streakThickness * 1.5, trailLength, streakThickness * 1.5]}>
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
 * Gets camera position to fire meteors FROM the player's viewpoint.
 */
export function MeteorShower({ meteors }: MeteorShowerProps) {
  const { camera } = useThree();

  return (
    <group>
      {meteors.map((meteor) => (
        <Meteor key={meteor.id} meteor={meteor} cameraPos={camera.position} />
      ))}
    </group>
  );
}

export default MeteorShower;
