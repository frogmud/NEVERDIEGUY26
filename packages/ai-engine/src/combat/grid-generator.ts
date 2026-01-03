/**
 * Grid Generator - Procedural room/grid generation for combat
 *
 * Ports the BinaryRoomLoader pattern (0,1,2,3 tiles) for grid-based combat.
 * NEVER DIE GUY
 */

import type { SeededRng } from '../core/seeded-rng';

// ============================================
// Tile Types (from BinaryRoomLoader pattern)
// ============================================

export const TILE_TYPES = {
  WALL: 0,
  FLOOR: 1,
  DESTRUCTIBLE: 2,
  DOOR: 3,
  SPAWN_ENEMY: 4,
  SPAWN_FRIENDLY: 5,
  HAZARD: 6,
} as const;

export type TileType = (typeof TILE_TYPES)[keyof typeof TILE_TYPES];

// ============================================
// Grid Cell & State Types
// ============================================

export interface GridCell {
  row: number;
  col: number;
  type: TileType;
  occupantId: string | null;
  effects: string[]; // 'fire', 'ice', 'poison', etc.
}

export interface GridState {
  cells: GridCell[][];
  rows: number;
  cols: number;
  domainId: number;
  roomType: RoomType;
}

export type RoomType = 'normal' | 'elite' | 'boss';

// ============================================
// Domain-Specific Obstacles
// ============================================

interface DomainPattern {
  hazardChance: number;
  destructibleChance: number;
  hazardType: string;
}

const DOMAIN_PATTERNS: Record<number, DomainPattern> = {
  1: { hazardChance: 0.05, destructibleChance: 0.1, hazardType: 'void' },    // Null Providence
  2: { hazardChance: 0.08, destructibleChance: 0.15, hazardType: 'earth' },  // Earth
  3: { hazardChance: 0.1, destructibleChance: 0.12, hazardType: 'shadow' },  // Shadow Keep
  4: { hazardChance: 0.12, destructibleChance: 0.1, hazardType: 'fire' },    // Infernus
  5: { hazardChance: 0.1, destructibleChance: 0.08, hazardType: 'ice' },     // Frost Reach
  6: { hazardChance: 0.15, destructibleChance: 0.05, hazardType: 'wind' },   // Aberrant
};

// ============================================
// Grid Size by Room Type
// ============================================

const GRID_SIZES: Record<RoomType, number> = {
  normal: 5,
  elite: 6,
  boss: 7,
};

// ============================================
// Spawn Configuration
// ============================================

interface SpawnConfig {
  enemies: number;
  friendlies: number;
}

const SPAWN_COUNTS: Record<RoomType, SpawnConfig> = {
  normal: { enemies: 3, friendlies: 1 },
  elite: { enemies: 5, friendlies: 1 },
  boss: { enemies: 2, friendlies: 2 }, // Fewer but tougher enemies, more friendlies
};

// ============================================
// Grid Generation Functions
// ============================================

/**
 * Generate a procedural grid for combat
 */
export function generateGrid(
  domainId: number,
  roomType: RoomType,
  rng: SeededRng
): GridState {
  const size = GRID_SIZES[roomType];
  const pattern = DOMAIN_PATTERNS[domainId] || DOMAIN_PATTERNS[1];

  // Initialize grid with walls on edges, floor inside
  const cells: GridCell[][] = [];
  for (let row = 0; row < size; row++) {
    cells[row] = [];
    for (let col = 0; col < size; col++) {
      const isEdge = row === 0 || row === size - 1 || col === 0 || col === size - 1;
      cells[row][col] = {
        row,
        col,
        type: isEdge ? TILE_TYPES.WALL : TILE_TYPES.FLOOR,
        occupantId: null,
        effects: [],
      };
    }
  }

  // Add domain-specific obstacles to interior cells
  addDomainObstacles(cells, pattern, rng);

  // Mark spawn points
  markSpawnPoints(cells, roomType, rng);

  return {
    cells,
    rows: size,
    cols: size,
    domainId,
    roomType,
  };
}

/**
 * Add hazards and destructible tiles based on domain
 */
function addDomainObstacles(
  cells: GridCell[][],
  pattern: DomainPattern,
  rng: SeededRng
): void {
  const size = cells.length;

  for (let row = 1; row < size - 1; row++) {
    for (let col = 1; col < size - 1; col++) {
      const cell = cells[row][col];
      if (cell.type !== TILE_TYPES.FLOOR) continue;

      const roll = rng.random(`obstacle-${row}-${col}`);

      if (roll < pattern.hazardChance) {
        cell.type = TILE_TYPES.HAZARD;
        cell.effects.push(pattern.hazardType);
      } else if (roll < pattern.hazardChance + pattern.destructibleChance) {
        cell.type = TILE_TYPES.DESTRUCTIBLE;
      }
    }
  }
}

/**
 * Mark spawn points for enemies and friendlies
 */
function markSpawnPoints(
  cells: GridCell[][],
  roomType: RoomType,
  rng: SeededRng
): void {
  const size = cells.length;
  const spawnConfig = SPAWN_COUNTS[roomType];

  // Get available floor cells (not hazards or destructibles)
  const floorCells: GridCell[] = [];
  for (let row = 1; row < size - 1; row++) {
    for (let col = 1; col < size - 1; col++) {
      if (cells[row][col].type === TILE_TYPES.FLOOR) {
        floorCells.push(cells[row][col]);
      }
    }
  }

  // Shuffle available cells
  const shuffled = rng.shuffle([...floorCells]);

  // Mark enemy spawns
  for (let i = 0; i < spawnConfig.enemies && i < shuffled.length; i++) {
    shuffled[i].type = TILE_TYPES.SPAWN_ENEMY;
  }

  // Mark friendly spawns (from remaining cells)
  const remainingStart = spawnConfig.enemies;
  for (
    let i = 0;
    i < spawnConfig.friendlies && remainingStart + i < shuffled.length;
    i++
  ) {
    shuffled[remainingStart + i].type = TILE_TYPES.SPAWN_FRIENDLY;
  }
}

// ============================================
// Grid Query Functions
// ============================================

/**
 * Get cell at specific row/col
 */
export function getCellAt(grid: GridState, row: number, col: number): GridCell | null {
  if (row < 0 || row >= grid.rows || col < 0 || col >= grid.cols) {
    return null;
  }
  return grid.cells[row][col];
}

/**
 * Get adjacent cells (4-directional)
 */
export function getAdjacentCells(grid: GridState, cell: GridCell): GridCell[] {
  const adjacent: GridCell[] = [];
  const directions = [
    [-1, 0], // up
    [1, 0],  // down
    [0, -1], // left
    [0, 1],  // right
  ];

  for (const [dr, dc] of directions) {
    const neighbor = getCellAt(grid, cell.row + dr, cell.col + dc);
    if (neighbor) {
      adjacent.push(neighbor);
    }
  }

  return adjacent;
}

/**
 * Get all cells of a specific type
 */
export function getCellsByType(grid: GridState, type: TileType): GridCell[] {
  const cells: GridCell[] = [];
  for (let row = 0; row < grid.rows; row++) {
    for (let col = 0; col < grid.cols; col++) {
      if (grid.cells[row][col].type === type) {
        cells.push(grid.cells[row][col]);
      }
    }
  }
  return cells;
}

/**
 * Get all walkable cells (floor and spawn points)
 */
export function getWalkableCells(grid: GridState): GridCell[] {
  const walkable: GridCell[] = [];
  const walkableTypes: TileType[] = [
    TILE_TYPES.FLOOR,
    TILE_TYPES.SPAWN_ENEMY,
    TILE_TYPES.SPAWN_FRIENDLY,
    TILE_TYPES.DOOR,
  ];

  for (let row = 0; row < grid.rows; row++) {
    for (let col = 0; col < grid.cols; col++) {
      if (walkableTypes.includes(grid.cells[row][col].type)) {
        walkable.push(grid.cells[row][col]);
      }
    }
  }
  return walkable;
}

/**
 * Check if a cell is valid for movement/placement
 */
export function isCellWalkable(cell: GridCell): boolean {
  const walkableTypes: TileType[] = [
    TILE_TYPES.FLOOR,
    TILE_TYPES.SPAWN_ENEMY,
    TILE_TYPES.SPAWN_FRIENDLY,
    TILE_TYPES.DOOR,
  ];
  return walkableTypes.includes(cell.type) && cell.occupantId === null;
}

// ============================================
// Grid Debug/Visualization
// ============================================

/**
 * Convert grid to ASCII for debugging
 */
export function gridToAscii(grid: GridState): string {
  const symbols: Record<TileType, string> = {
    [TILE_TYPES.WALL]: '#',
    [TILE_TYPES.FLOOR]: '.',
    [TILE_TYPES.DESTRUCTIBLE]: 'D',
    [TILE_TYPES.DOOR]: '+',
    [TILE_TYPES.SPAWN_ENEMY]: 'E',
    [TILE_TYPES.SPAWN_FRIENDLY]: 'F',
    [TILE_TYPES.HAZARD]: '!',
  };

  let ascii = '';
  for (let row = 0; row < grid.rows; row++) {
    for (let col = 0; col < grid.cols; col++) {
      const cell = grid.cells[row][col];
      if (cell.occupantId) {
        ascii += '@'; // Occupied cell
      } else {
        ascii += symbols[cell.type] || '?';
      }
    }
    ascii += '\n';
  }
  return ascii;
}
