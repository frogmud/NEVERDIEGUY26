/**
 * Guardian - Flat billboard sprite that protects the planet
 *
 * Yu-Gi-Oh style: flat 2D sprites that orbit the planet and block shots.
 * They always face the camera (billboard) but don't hide that they're flat.
 * NEVER DIE GUY
 */

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { GLOBE_CONFIG } from '../config';

export type GuardianDieType = 4 | 6 | 8 | 10 | 12 | 20;

export interface GuardianData {
  id: string;
  dieType: GuardianDieType;  // Die shape this guardian requires to destroy
  hp: number;
  maxHp: number;
  orbitAngle: number;  // Starting angle around planet (radians)
  orbitSpeed: number;  // How fast it orbits
  orbitHeight: number; // Latitude-ish offset (-1 to 1)
  color: string;
  isTargeted?: boolean; // True when a matching die is selected
}

interface GuardianProps {
  guardian: GuardianData;
  onHit?: (guardianId: string) => void;
}

// Die type to polygon vertex count (matches DiceShapes)
const DIE_SHAPES: Record<number, number> = {
  4: 3,    // Triangle (d4)
  6: 4,    // Diamond/Square (d6)
  8: 6,    // Hexagon (d8)
  10: 5,   // Pentagon (d10)
  12: 10,  // Decagon (d12)
  20: 8,   // Octagon (d20)
};

// Die type colors (from design system)
const DIE_COLORS: Record<number, string> = {
  4: '#E8663C',   // Orange - Void
  6: '#8B5A2B',   // Brown - Earth
  8: '#6B21A8',   // Purple - Death
  10: '#DC2626', // Red - Fire
  12: '#0EA5E9', // Cyan - Ice
  20: '#22C55E', // Green - Wind
};

/**
 * Single Guardian sprite
 */
export function Guardian({ guardian, onHit }: GuardianProps) {
  const groupRef = useRef<THREE.Group>(null);
  const angleRef = useRef(guardian.orbitAngle);
  const pulseRef = useRef(0);

  // Orbit distance (slightly outside planet)
  const orbitRadius = GLOBE_CONFIG.radius + 0.8;

  // Animate orbit and targeting pulse
  useFrame((_, delta) => {
    if (!groupRef.current) return;

    // Update angle
    angleRef.current += guardian.orbitSpeed * delta;

    // Calculate position on orbit
    const x = Math.cos(angleRef.current) * orbitRadius;
    const z = Math.sin(angleRef.current) * orbitRadius;
    const y = guardian.orbitHeight * 1.5; // Vertical offset

    groupRef.current.position.set(x, y, z);

    // Update pulse for targeting effect
    if (guardian.isTargeted) {
      pulseRef.current += delta * 4;
    }
  });

  const hpPercent = guardian.hp / guardian.maxHp;
  const size = 0.8 + (hpPercent * 0.4); // Base size, shrink as damaged
  const shapeVertices = DIE_SHAPES[guardian.dieType] || 6;
  const shapeColor = guardian.color || DIE_COLORS[guardian.dieType] || '#ffffff';

  // Pulse effect for targeting
  const pulseScale = guardian.isTargeted ? 1 + Math.sin(pulseRef.current) * 0.1 : 1;
  const pulseOpacity = guardian.isTargeted ? 0.6 + Math.sin(pulseRef.current) * 0.3 : 0;

  return (
    <group ref={groupRef}>
      <Billboard follow={true} lockX={false} lockY={false} lockZ={false}>
        {/* Outer targeting ring - large pulsing when targeted */}
        {guardian.isTargeted && (
          <mesh position={[0, 0, -0.02]} scale={[pulseScale, pulseScale, 1]}>
            <ringGeometry args={[size * 0.7, size * 0.9, shapeVertices]} />
            <meshBasicMaterial
              color="#FF0000"
              transparent
              opacity={pulseOpacity}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}

        {/* Main shape - filled */}
        <mesh>
          <circleGeometry args={[size * 0.5, shapeVertices]} />
          <meshBasicMaterial
            color={guardian.isTargeted ? '#FF4444' : shapeColor}
            transparent
            opacity={guardian.isTargeted ? 1 : 0.7}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Border ring - bright red when targeted */}
        <mesh position={[0, 0, 0.01]}>
          <ringGeometry args={[size * 0.48, size * 0.58, shapeVertices]} />
          <meshBasicMaterial
            color={guardian.isTargeted ? '#FFFFFF' : shapeColor}
            transparent
            opacity={1}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Die number label - only shows when targeted */}
        {guardian.isTargeted && (
          <mesh position={[0, 0, 0.02]}>
            <circleGeometry args={[size * 0.2, 16]} />
            <meshBasicMaterial
              color="#FF0000"
              transparent
              opacity={0.9}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}

        {/* Crosshair lines when targeted */}
        {guardian.isTargeted && (
          <>
            <mesh position={[0, 0, 0.03]}>
              <planeGeometry args={[size * 1.4, 0.03]} />
              <meshBasicMaterial color="#FF0000" transparent opacity={0.8} />
            </mesh>
            <mesh position={[0, 0, 0.03]} rotation={[0, 0, Math.PI / 2]}>
              <planeGeometry args={[size * 1.4, 0.03]} />
              <meshBasicMaterial color="#FF0000" transparent opacity={0.8} />
            </mesh>
          </>
        )}

        {/* HP bar */}
        {hpPercent < 1 && (
          <group position={[0, -size * 0.7, 0.02]}>
            {/* HP bar background */}
            <mesh>
              <planeGeometry args={[size, 0.08]} />
              <meshBasicMaterial color="#333333" />
            </mesh>
            {/* HP bar fill */}
            <mesh position={[(hpPercent - 1) * size * 0.5, 0, 0.01]}>
              <planeGeometry args={[size * hpPercent, 0.06]} />
              <meshBasicMaterial color={hpPercent > 0.5 ? '#44ff44' : hpPercent > 0.25 ? '#ffff44' : '#ff4444'} />
            </mesh>
          </group>
        )}
      </Billboard>
    </group>
  );
}

/**
 * Guardian group - renders multiple guardians
 */
interface GuardianGroupProps {
  guardians: GuardianData[];
  onGuardianHit?: (guardianId: string) => void;
}

export function GuardianGroup({ guardians, onGuardianHit }: GuardianGroupProps) {
  return (
    <group>
      {guardians.map((guardian) => (
        <Guardian key={guardian.id} guardian={guardian} onHit={onGuardianHit} />
      ))}
    </group>
  );
}

export default Guardian;
