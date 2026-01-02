/**
 * Planet - 3D sphere mesh representing the globe
 *
 * Supports multiple visual styles (lowPoly, neonWireframe, realistic, retro)
 * NEVER DIE GUY
 */

import { useRef, useMemo } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';
import * as THREE from 'three';

import { GLOBE_CONFIG, STYLE_PRESETS } from '../config';
import { cartesianToLatLng } from '../utils/sphereCoords';

interface PlanetProps {
  radius?: number;
  style?: 'lowPoly' | 'neonWireframe' | 'realistic' | 'retro';
  onClick?: (lat: number, lng: number) => void;
  autoRotate?: boolean;
}

/**
 * Planet Component
 *
 * Renders the 3D globe with configurable visual styles.
 * Handles click detection and converts 3D intersection to lat/lng.
 */
export function Planet({
  radius = GLOBE_CONFIG.radius,
  style = 'lowPoly',
  onClick,
  autoRotate = false,
}: PlanetProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const styleConfig = STYLE_PRESETS[style];

  // Optional auto-rotation
  useFrame(() => {
    if (autoRotate && meshRef.current) {
      meshRef.current.rotation.y += GLOBE_CONFIG.rotationSpeed;
    }
  });

  // Handle click on globe surface
  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    if (onClick && event.point) {
      const { lat, lng } = cartesianToLatLng(
        event.point.x,
        event.point.y,
        event.point.z
      );
      onClick(lat, lng);
    }
  };

  // Material based on style
  const material = useMemo(() => {
    switch (style) {
      case 'neonWireframe':
        return (
          <meshBasicMaterial
            color="#00e5ff"
            wireframe={true}
            transparent
            opacity={0.8}
          />
        );

      case 'lowPoly':
        return (
          <meshStandardMaterial
            color="#1a1a2e"
            flatShading={true}
            roughness={0.8}
            metalness={0.2}
          />
        );

      case 'retro':
        return (
          <meshLambertMaterial
            color="#2a4858"
            flatShading={true}
          />
        );

      case 'realistic':
      default:
        return (
          <meshStandardMaterial
            color="#1a3a4a"
            roughness={0.6}
            metalness={0.3}
          />
        );
    }
  }, [style]);

  return (
    <Sphere
      ref={meshRef}
      args={[radius, styleConfig.segments, styleConfig.segments]}
      onClick={handleClick}
    >
      {material}
    </Sphere>
  );
}

export default Planet;
