/**
 * ZoneMarker - 3D representation of a zone/event on the globe surface
 *
 * Positioned using lat/lng coordinates, styled by zone type.
 * NEVER DIE GUY
 */

import { useRef, useMemo } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import { Sphere, Ring, Billboard, Text } from '@react-three/drei';
import * as THREE from 'three';

import { ZoneMarker as ZoneMarkerType } from '../../../types/zones';
import { GLOBE_CONFIG } from '../config';
import { latLngToCartesian, getSurfaceNormal } from '../utils/sphereCoords';

interface ZoneMarkerProps {
  zone: ZoneMarkerType;
  isSelected?: boolean;
  onClick?: (zone: ZoneMarkerType) => void;
}

// Zone type colors
const ZONE_COLORS = {
  stable: '#44ff44',   // Green
  elite: '#ffaa00',    // Orange
  anomaly: '#ff4444',  // Red
  cleared: '#666666',  // Gray
};

// Zone type sizes
const ZONE_SIZES = {
  stable: 0.12,
  elite: 0.15,
  anomaly: 0.18,
};

/**
 * ZoneMarker Component
 *
 * Renders a zone as a glowing sphere marker on the globe surface.
 * Shows type, tier, and selection state.
 */
export function ZoneMarker({
  zone,
  isSelected = false,
  onClick,
}: ZoneMarkerProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  // Calculate 3D position from lat/lng
  const position = useMemo((): [number, number, number] => {
    const surfaceRadius = GLOBE_CONFIG.radius + 0.15;
    return latLngToCartesian(zone.lat, zone.lng, surfaceRadius);
  }, [zone.lat, zone.lng]);

  // Get surface normal for orientation
  const normal = useMemo(() => {
    return getSurfaceNormal(zone.lat, zone.lng);
  }, [zone.lat, zone.lng]);

  // Calculate rotation to point outward from globe center
  const lookAtCenter = useMemo(() => {
    const up = new THREE.Vector3(...normal);
    return new THREE.Euler().setFromQuaternion(
      new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        up
      )
    );
  }, [normal]);

  // Colors
  const color = zone.cleared ? ZONE_COLORS.cleared : ZONE_COLORS[zone.type];
  const size = ZONE_SIZES[zone.type];

  // Pulse animation for selected zone
  useFrame((state) => {
    if (meshRef.current && isSelected) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.15;
      meshRef.current.scale.setScalar(scale);
    } else if (meshRef.current) {
      meshRef.current.scale.setScalar(1);
    }

    // Rotate selection ring
    if (ringRef.current && isSelected) {
      ringRef.current.rotation.z += 0.02;
    }
  });

  // Gentle hover animation for uncleared zones
  useFrame((state) => {
    if (meshRef.current && !zone.cleared) {
      const offset = Math.sin(state.clock.elapsedTime * 2 + zone.id.charCodeAt(0)) * 0.02;
      meshRef.current.position.y = offset;
    }
  });

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (!zone.cleared) {
      onClick?.(zone);
    }
  };

  return (
    <group position={position} rotation={lookAtCenter}>
      {/* Main marker sphere */}
      <Sphere
        ref={meshRef}
        args={[size, 16, 16]}
        onClick={handleClick}
      >
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={zone.cleared ? 0.1 : isSelected ? 0.8 : 0.4}
          metalness={0.2}
          roughness={0.5}
          transparent={zone.cleared}
          opacity={zone.cleared ? 0.5 : 1}
        />
      </Sphere>

      {/* Selection ring */}
      {isSelected && !zone.cleared && (
        <Ring
          ref={ringRef}
          args={[size * 1.5, size * 2, 32]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.6}
            side={THREE.DoubleSide}
          />
        </Ring>
      )}

      {/* Tier indicator */}
      {!zone.cleared && (
        <Billboard position={[0, size * 2.5, 0]}>
          <Text
            fontSize={0.08}
            color={color}
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.005}
            outlineColor="#000000"
          >
            {zone.type === 'anomaly' ? 'BOSS' : `T${zone.tier}`}
          </Text>
        </Billboard>
      )}

      {/* Cleared checkmark */}
      {zone.cleared && (
        <Billboard position={[0, size * 2, 0]}>
          <Text
            fontSize={0.12}
            color="#44ff44"
            anchorX="center"
            anchorY="middle"
          >
            {'\u2713'}
          </Text>
        </Billboard>
      )}

      {/* Outer glow for boss zones */}
      {zone.type === 'anomaly' && !zone.cleared && (
        <Sphere args={[size * 1.8, 16, 16]}>
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.15}
          />
        </Sphere>
      )}
    </group>
  );
}

export default ZoneMarker;
