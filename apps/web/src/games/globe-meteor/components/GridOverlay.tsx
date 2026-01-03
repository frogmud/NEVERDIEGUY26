/**
 * GridOverlay - Renders procedural combat grid on planet surface
 *
 * Maps grid cells to positions on the globe, showing:
 * - Floor tiles (walkable)
 * - Walls (impassable)
 * - Hazards (damage zones)
 * - Entity positions (enemies, friendlies)
 *
 * NEVER DIE GUY
 */

import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Instance, Instances, Billboard, Text } from '@react-three/drei';
import * as THREE from 'three';

import { GLOBE_CONFIG } from '../config';
import { latLngToCartesian, getSurfaceNormal } from '../utils/sphereCoords';
import type { GridState, GridCell, TileType } from '@ndg/ai-engine';
import type { Entity, EntityMap } from '@ndg/ai-engine';

// Grid overlay config
const GRID_CONFIG = {
  cellSize: 0.08,        // Size of each cell on globe
  cellGap: 0.01,         // Gap between cells
  elevationOffset: 0.02, // Height above globe surface
};

// Tile type colors (matching TILE_TYPES from grid-generator)
const TILE_COLORS: Record<number, string> = {
  0: '#1a1a2e',  // WALL - dark (invisible)
  1: '#2a3a4a',  // FLOOR - muted blue-gray
  2: '#4a3a2a',  // DESTRUCTIBLE - brownish
  3: '#3a4a3a',  // DOOR - greenish
  4: '#4a2a2a',  // SPAWN_ENEMY - reddish (invisible after spawn)
  5: '#2a4a2a',  // SPAWN_FRIENDLY - greenish (invisible after spawn)
  6: '#4a1a4a',  // HAZARD - purple
};

// Entity type colors
const ENTITY_COLORS: Record<string, string> = {
  enemy: '#ff4444',
  friendly: '#44ff44',
  obstacle: '#888888',
};

interface GridOverlayProps {
  grid: GridState;
  entities: EntityMap;
  centerLat: number;
  centerLng: number;
  highlightedCell?: { row: number; col: number } | null;
  onCellClick?: (row: number, col: number) => void;
}

/**
 * Convert grid row/col to lat/lng offset from center
 */
function gridToLatLng(
  row: number,
  col: number,
  gridRows: number,
  gridCols: number,
  centerLat: number,
  centerLng: number,
  cellSize: number
): { lat: number; lng: number } {
  // Center the grid on the provided lat/lng
  const rowOffset = row - gridRows / 2;
  const colOffset = col - gridCols / 2;

  // Convert to degrees (approximate, works well for small grids)
  const latOffset = rowOffset * cellSize * 30; // Scale factor for degrees
  const lngOffset = colOffset * cellSize * 30;

  return {
    lat: centerLat + latOffset,
    lng: centerLng + lngOffset,
  };
}

/**
 * GridCell Component - Single cell in the grid
 */
function GridCellMesh({
  cell,
  gridRows,
  gridCols,
  centerLat,
  centerLng,
  isHighlighted,
  occupant,
}: {
  cell: GridCell;
  gridRows: number;
  gridCols: number;
  centerLat: number;
  centerLng: number;
  isHighlighted: boolean;
  occupant: Entity | null;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  // Calculate position on globe surface
  const { position, rotation } = useMemo(() => {
    const { lat, lng } = gridToLatLng(
      cell.row,
      cell.col,
      gridRows,
      gridCols,
      centerLat,
      centerLng,
      GRID_CONFIG.cellSize
    );

    const surfaceRadius = GLOBE_CONFIG.radius + GRID_CONFIG.elevationOffset;
    const pos = latLngToCartesian(lat, lng, surfaceRadius);
    const normal = getSurfaceNormal(lat, lng);

    // Create rotation to align with surface
    const up = new THREE.Vector3(...normal);
    const rot = new THREE.Euler().setFromQuaternion(
      new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        up
      )
    );

    return { position: pos, rotation: rot };
  }, [cell.row, cell.col, gridRows, gridCols, centerLat, centerLng]);

  // Pulse animation for highlighted cells
  useFrame((state) => {
    if (meshRef.current && isHighlighted) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 6) * 0.1;
      meshRef.current.scale.setScalar(scale);
    } else if (meshRef.current) {
      meshRef.current.scale.setScalar(1);
    }
  });

  // Skip rendering walls (tile type 0)
  if (cell.type === 0) return null;

  const baseColor = TILE_COLORS[cell.type] || '#333333';
  const entityColor = occupant ? ENTITY_COLORS[occupant.type] : null;
  const displayColor = entityColor || baseColor;

  return (
    <group position={position} rotation={rotation}>
      {/* Cell tile */}
      <mesh ref={meshRef}>
        <boxGeometry args={[GRID_CONFIG.cellSize, 0.01, GRID_CONFIG.cellSize]} />
        <meshStandardMaterial
          color={displayColor}
          emissive={isHighlighted ? '#ffffff' : displayColor}
          emissiveIntensity={isHighlighted ? 0.5 : occupant ? 0.3 : 0.1}
          roughness={0.7}
          metalness={0.1}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Entity marker */}
      {occupant && (
        <>
          <mesh position={[0, 0.05, 0]}>
            <sphereGeometry args={[0.03, 8, 8]} />
            <meshStandardMaterial
              color={entityColor!}
              emissive={entityColor!}
              emissiveIntensity={0.5}
            />
          </mesh>

          {/* HP indicator for entities with health */}
          {occupant.hp !== undefined && (
            <Billboard position={[0, 0.1, 0]}>
              <Text
                fontSize={0.025}
                color={entityColor!}
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.002}
                outlineColor="#000000"
              >
                {`${occupant.hp}/${occupant.maxHp}`}
              </Text>
            </Billboard>
          )}

          {/* Element indicator */}
          <Billboard position={[0, 0.13, 0]}>
            <Text
              fontSize={0.02}
              color={entityColor!}
              anchorX="center"
              anchorY="middle"
            >
              {occupant.element?.slice(0, 2) || '??'}
            </Text>
          </Billboard>
        </>
      )}

      {/* Hazard effect */}
      {cell.type === 6 && (
        <mesh position={[0, 0.02, 0]}>
          <ringGeometry args={[0.02, 0.035, 8]} />
          <meshBasicMaterial color="#ff00ff" transparent opacity={0.6} />
        </mesh>
      )}

      {/* Highlight ring */}
      {isHighlighted && (
        <mesh position={[0, 0.015, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[GRID_CONFIG.cellSize * 0.4, GRID_CONFIG.cellSize * 0.5, 16]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.8} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}

/**
 * GridOverlay Component
 *
 * Renders the entire combat grid on the globe surface.
 * Shows tiles, entities, and interaction highlights.
 */
export function GridOverlay({
  grid,
  entities,
  centerLat,
  centerLng,
  highlightedCell,
  onCellClick,
}: GridOverlayProps) {
  // Build entity lookup by position
  const entityByPosition = useMemo(() => {
    const map = new Map<string, Entity>();
    for (const entity of entities.values()) {
      if (entity.isAlive) {
        const key = `${entity.position.row},${entity.position.col}`;
        map.set(key, entity);
      }
    }
    return map;
  }, [entities]);

  // Render all cells
  const cells = useMemo(() => {
    const result: React.ReactElement[] = [];

    for (let row = 0; row < grid.rows; row++) {
      for (let col = 0; col < grid.cols; col++) {
        const cell = grid.cells[row][col];
        const posKey = `${row},${col}`;
        const occupant = entityByPosition.get(posKey) || null;
        const isHighlighted = highlightedCell?.row === row && highlightedCell?.col === col;

        result.push(
          <GridCellMesh
            key={`cell-${row}-${col}`}
            cell={cell}
            gridRows={grid.rows}
            gridCols={grid.cols}
            centerLat={centerLat}
            centerLng={centerLng}
            isHighlighted={isHighlighted}
            occupant={occupant}
          />
        );
      }
    }

    return result;
  }, [grid, entityByPosition, centerLat, centerLng, highlightedCell]);

  return <group>{cells}</group>;
}

export default GridOverlay;
