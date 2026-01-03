/**
 * MeteorShower - Animated meteor projectiles flying toward the globe
 *
 * Each die type has a unique movement pattern:
 * - d4: Straight shot (fast, direct)
 * - d6: Wobble (side to side)
 * - d8: Star burst (spread from center)
 * - d10: Wave (sinusoidal)
 * - d12: Helix (corkscrew)
 * - d20: Spiral (wide spiral down)
 *
 * Enhanced with:
 * - 720 degree spin animation
 * - Glowing trails that fade
 * - Size shrink as approaching target
 * - Machine gun stagger timing
 *
 * NEVER DIE GUY
 */

import { useMemo } from 'react';

import { MeteorProjectile, METEOR_CONFIG, DICE_EFFECTS } from '../config';

interface MeteorShowerProps {
  meteors: MeteorProjectile[];
  onImpact?: (meteorId: string, position: [number, number, number]) => void;
}

/**
 * Calculate position based on die type pattern
 */
function getMeteorPosition(meteor: MeteorProjectile): [number, number, number] {
  const { startPosition, targetPosition, progress, dieType, id } = meteor;
  const t = progress;

  // Base interpolation with acceleration
  const easeT = t * t;
  let x = startPosition[0] + (targetPosition[0] - startPosition[0]) * easeT;
  let y = startPosition[1] + (targetPosition[1] - startPosition[1]) * easeT;
  let z = startPosition[2] + (targetPosition[2] - startPosition[2]) * easeT;

  // Get a stable offset from meteor id for variation
  const idNum = parseInt(id.replace(/\D/g, ''), 10) || 0;
  const phase = (idNum * 1.7) % (Math.PI * 2);

  // Apply pattern based on die type
  switch (dieType) {
    case 4:
      // d4: Straight shot - no modification, fastest
      break;

    case 6:
      // d6: Wobble - side to side
      const wobble = Math.sin(t * 8 + phase) * 0.3 * (1 - t);
      x += wobble;
      z += Math.cos(t * 8 + phase) * 0.2 * (1 - t);
      break;

    case 8:
      // d8: Star burst - spread outward then converge
      const spread = Math.sin(t * Math.PI) * 0.5;
      x += Math.cos(phase) * spread;
      z += Math.sin(phase) * spread;
      break;

    case 10:
      // d10: Wave - sinusoidal path
      const wave = Math.sin(t * 6 + phase) * 0.4 * (1 - t * 0.5);
      x += wave;
      break;

    case 12:
      // d12: Helix - corkscrew descent
      const helixRadius = 0.4 * (1 - t);
      const helixAngle = t * 10 + phase;
      x += Math.cos(helixAngle) * helixRadius;
      z += Math.sin(helixAngle) * helixRadius;
      break;

    case 20:
      // d20: Spiral - wide spiral that tightens
      const spiralRadius = 1.0 * (1 - t);
      const spiralAngle = t * 8 + phase;
      x += Math.cos(spiralAngle) * spiralRadius;
      z += Math.sin(spiralAngle) * spiralRadius;
      break;
  }

  return [x, y, z];
}

/**
 * Single meteor - spinning die with glowing trail
 *
 * Old feel: 720 degree rotation, shrinking as it approaches, trail particles
 */
function Meteor({ meteor }: { meteor: MeteorProjectile }) {
  const dieEffect = DICE_EFFECTS[meteor.dieType] || DICE_EFFECTS[6];
  const meteorColor = dieEffect.color;
  const baseSize = meteor.size || METEOR_CONFIG.size * dieEffect.meteorScale;

  const position = useMemo(
    () => getMeteorPosition(meteor),
    [meteor.progress, meteor.startPosition, meteor.targetPosition, meteor.dieType, meteor.id]
  );

  // Get a stable rotation offset from meteor id
  const idNum = parseInt(meteor.id.replace(/\D/g, ''), 10) || 0;
  const rotationOffset = (idNum * 1.3) % (Math.PI * 2);

  // 720 degree spin (2 full rotations) over flight duration
  // Plus progressive shrink as it approaches
  const rotation = meteor.progress * Math.PI * 4 + rotationOffset;
  const scale = 1 - meteor.progress * 0.7; // Shrinks to 30% at impact
  const opacity = 1 - meteor.progress * 0.3; // Slight fade


  return (
    <group>
      {/* Trail particles - simple spheres along path */}
      {meteor.progress > 0.1 && (
        <group>
          {[0.08, 0.16, 0.24, 0.32, 0.4].map((offset, i) => {
            const trailProgress = Math.max(0, meteor.progress - offset);
            const trailMeteor = { ...meteor, progress: trailProgress };
            const trailPos = getMeteorPosition(trailMeteor);
            const trailOpacity = (0.4 - i * 0.07) * (1 - meteor.progress);
            const trailSize = baseSize * (0.8 - i * 0.12);

            return (
              <mesh key={i} position={trailPos}>
                <sphereGeometry args={[trailSize, 4, 4]} />
                <meshBasicMaterial
                  color={meteorColor}
                  transparent
                  opacity={trailOpacity}
                />
              </mesh>
            );
          })}
        </group>
      )}

      {/* Main meteor with spin */}
      <group
        position={position}
        rotation={[rotation * 0.7, rotation, rotation * 0.3]}
        scale={[scale, scale, scale]}
      >
        {/* Core meteor - die-shaped */}
        <mesh>
          <icosahedronGeometry args={[baseSize, 0]} />
          <meshBasicMaterial color={meteorColor} />
        </mesh>

        {/* Inner glow */}
        <mesh>
          <icosahedronGeometry args={[baseSize * 1.3, 0]} />
          <meshBasicMaterial
            color={meteorColor}
            transparent
            opacity={0.5 * opacity}
          />
        </mesh>

        {/* Outer glow halo */}
        <mesh>
          <sphereGeometry args={[baseSize * 2, 8, 8]} />
          <meshBasicMaterial
            color={meteorColor}
            transparent
            opacity={0.2 * opacity}
          />
        </mesh>
      </group>
    </group>
  );
}

/**
 * MeteorShower Component
 *
 * Renders all active meteors with simple optimized geometry.
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
