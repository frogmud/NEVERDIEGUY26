/**
 * Planet - 3D sphere mesh representing the globe
 *
 * Supports multiple visual styles (lowPoly, neonWireframe, realistic, retro, ascii)
 * NEVER DIE GUY
 */

import { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree, ThreeEvent } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';
import * as THREE from 'three';

import { GLOBE_CONFIG, STYLE_PRESETS, DOMAIN_PLANET_CONFIG } from '../config';
import { cartesianToLatLng } from '../utils/sphereCoords';
import { AsciiTextureManager } from '../utils/asciiTexture';

interface PlanetProps {
  radius?: number;
  style?: 'lowPoly' | 'neonWireframe' | 'realistic' | 'retro' | 'ascii';
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

  // Get camera for dynamic lighting
  const { camera } = useThree();
  const textureManagerRef = useRef<AsciiTextureManager | null>(null);
  const lastCameraPos = useRef(new THREE.Vector3());
  const frameCount = useRef(0);

  // Create ASCII texture manager for ascii style
  // Uses higher resolution (2048x1024) for crisp APL glyphs
  const asciiTexture = useMemo(() => {
    if (style !== 'ascii') {
      textureManagerRef.current?.dispose();
      textureManagerRef.current = null;
      return null;
    }
    const colors = domainConfig || { color: '#8b7355', glowColor: '#a89078' };
    const manager = new AsciiTextureManager({
      width: 2048,
      height: 1024,
      charSize: 16,
      primaryColor: colors.color,
      glowColor: colors.glowColor,
      seed: domainId || 42,
    });
    textureManagerRef.current = manager;
    return manager.getTexture();
  }, [style, domainConfig, domainId]);

  // Update ASCII texture based on camera position
  useFrame(() => {
    if (style !== 'ascii' || !textureManagerRef.current) return;

    frameCount.current++;

    // Update every few frames to avoid performance issues
    if (frameCount.current % 3 !== 0) return;

    // Calculate light direction from camera position
    const camPos = camera.position.clone().normalize();

    // Only update if camera moved significantly
    if (camPos.distanceTo(lastCameraPos.current) > 0.02) {
      lastCameraPos.current.copy(camPos);

      // Light comes from camera direction (front-lit)
      const lightDir: [number, number, number] = [
        camPos.x * 0.5 - 0.3,
        camPos.y * 0.3 + 0.4,
        camPos.z * 0.5 + 0.5,
      ];

      textureManagerRef.current.update(lightDir, frameCount.current * 0.016);
    }
  });

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      textureManagerRef.current?.dispose();
    };
  }, []);

  // Material based on style (domain color overrides if domainId provided)
  const material = useMemo(() => {
    // Use domain-specific color if provided
    const baseColor = domainConfig?.color;

    switch (style) {
      case 'ascii':
        return (
          <meshBasicMaterial
            map={asciiTexture}
            side={THREE.FrontSide}
          />
        );

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
  }, [style, domainConfig, asciiTexture]);

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
