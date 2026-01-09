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

import { GLOBE_CONFIG, STYLE_PRESETS, DOMAIN_PLANET_CONFIG } from '../config';
import { cartesianToLatLng } from '../utils/sphereCoords';

interface PlanetProps {
  radius?: number;
  style?: 'lowPoly' | 'neonWireframe' | 'realistic' | 'retro';
  onClick?: (lat: number, lng: number, point3D: [number, number, number]) => void;
  autoRotate?: boolean;
  /** Domain ID (1-6) to use domain-specific size and color */
  domainId?: number;
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
  domainId,
}: PlanetProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const styleConfig = STYLE_PRESETS[style];

  // Get domain-specific config if domainId provided
  const domainConfig = domainId ? DOMAIN_PLANET_CONFIG[domainId] : null;
  const effectiveRadius = domainConfig
    ? radius * domainConfig.scale
    : radius;

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
      // Pass both lat/lng AND the raw 3D point for accurate targeting
      onClick(lat, lng, [event.point.x, event.point.y, event.point.z]);
    }
  };

  // Material based on style (domain color overrides if domainId provided)
  const material = useMemo(() => {
    // Use domain-specific color if provided
    const baseColor = domainConfig?.color;

    switch (style) {
      case 'neonWireframe':
        return (
          <meshBasicMaterial
            color={baseColor || '#00e5ff'}
            wireframe={true}
            transparent
            opacity={0.8}
          />
        );

      case 'lowPoly':
        return (
          <meshStandardMaterial
            color={baseColor || '#1a1a2e'}
            flatShading={true}
            roughness={0.8}
            metalness={0.2}
          />
        );

      case 'retro':
        return (
          <meshLambertMaterial
            color={baseColor || '#2a4858'}
            flatShading={true}
          />
        );

      case 'realistic':
      default:
        return (
          <meshStandardMaterial
            color={baseColor || '#1a3a4a'}
            roughness={0.6}
            metalness={0.3}
          />
        );
    }
  }, [style, domainConfig]);

  return (
    <Sphere
      ref={meshRef}
      args={[effectiveRadius, styleConfig.segments, styleConfig.segments]}
      onClick={handleClick}
      name="planet"
    >
      {material}
    </Sphere>
  );
}

export default Planet;
