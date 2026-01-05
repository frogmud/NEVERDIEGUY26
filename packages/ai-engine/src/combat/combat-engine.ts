/**
 * Combat Engine - Turn-based grid combat state machine
 *
 * Manages combat phases: init → draw → select → throw → resolve → enemy_turn → check_end
 * NEVER DIE GUY
 */

import type { SeededRng } from '../core/seeded-rng';
import type { GridState, GridCell } from './grid-generator';
import type { Die, DicePool, DiceHand, Element } from './dice-hand';
import {
  generateGrid,
  getCellsByType,
  TILE_TYPES,
} from './grid-generator';
import {
  generateDicePool,
  drawHand,
  rollHand,
  toggleHold,
  discardAndDraw,
  getHandTotal,
  DEFAULT_HOLDS_PER_ROOM,
  MAX_HAND_SIZE,
} from './dice-hand';

// ============================================
// Combat Phase Types
// ============================================

export type CombatPhase =
  | 'init'        // Generate grid, spawn entities
  | 'draw'        // Draw dice from pool to hand
  | 'select'      // Player selects dice to throw/hold
  | 'throw'       // Dice animation phase
  | 'resolve'     // Process hits, calculate score
  | 'enemy_turn'  // Enemies move/attack
  | 'check_end'   // Check win/lose conditions
  | 'victory'     // Player won
  | 'defeat';     // Player lost

// ============================================
// Entity Types
// ============================================

export interface Entity {
  id: string;
  type: 'enemy' | 'friendly' | 'obstacle';
  element: Element;
  hp: number;
  maxHp: number;
  basePoints: number;
  position: { row: number; col: number };
  behavior: 'roam' | 'chase' | 'stationary';
  isAlive: boolean;
}

export type EntityMap = Map<string, Entity>;

// ============================================
// Combat State
// ============================================

export interface CombatState {
  phase: CombatPhase;
  grid: GridState;
  entities: EntityMap;

  // Dice system
  pool: DicePool;
  hand: Die[];
  holdsRemaining: number;   // "Trades" - swap dice for multiplier bonus
  throwsRemaining: number;  // Throws left this turn (2 per turn)

  // Scoring
  targetScore: number;
  currentScore: number;
  multiplier: number;       // Score multiplier (1 base, increases via trades)
  turnsRemaining: number;
  turnNumber: number;

  // Tracking
  collateralDamage: number;
  friendlyHits: number;
  enemiesSquished: number;

  // Config
  domainId: number;
  roomType: 'normal' | 'elite' | 'boss';
}

// ============================================
// Combat Commands
// ============================================

export type CombatCommand =
  | { type: 'TOGGLE_HOLD'; dieId: string }
  | { type: 'HOLD_ALL' }
  | { type: 'HOLD_NONE' }
  | { type: 'THROW' }
  | { type: 'END_TURN' }
  | { type: 'TARGET_CELL'; row: number; col: number };

// ============================================
// Combat Configuration
// ============================================

export interface CombatConfig {
  domainId: number;
  roomType: 'normal' | 'elite' | 'boss';
  targetScore: number;
  maxTurns: number;
  poolSize?: number;
  holdsPerRoom?: number;
}

const DEFAULT_CONFIG: Partial<CombatConfig> = {
  poolSize: 15,
  holdsPerRoom: DEFAULT_HOLDS_PER_ROOM,
};

// ============================================
// Score Goals by Domain/Room
// ============================================

function calculateTargetScore(domainId: number, roomType: 'normal' | 'elite' | 'boss'): number {
  const baseScore = 1000;
  const domainMultiplier = Math.pow(1.5, domainId - 1);
  const roomMultipliers = { normal: 1.0, elite: 1.5, boss: 2.0 };

  return Math.round(baseScore * domainMultiplier * roomMultipliers[roomType]);
}

function calculateMaxTurns(roomType: 'normal' | 'elite' | 'boss'): number {
  const turns = { normal: 5, elite: 6, boss: 8 };
  return turns[roomType];
}

// ============================================
// Entity Generation
// ============================================

function generateEntities(grid: GridState, rng: SeededRng): EntityMap {
  const entities: EntityMap = new Map();
  const elements: Element[] = ['Void', 'Earth', 'Death', 'Fire', 'Ice', 'Wind'];

  // Spawn enemies at SPAWN_ENEMY cells
  const enemySpawns = getCellsByType(grid, TILE_TYPES.SPAWN_ENEMY);
  for (let i = 0; i < enemySpawns.length; i++) {
    const cell = enemySpawns[i];
    const id = `enemy-${i}`;
    const element = elements[rng.rollIndex(`enemy-element-${i}`, elements.length)];

    entities.set(id, {
      id,
      type: 'enemy',
      element,
      hp: 20 + grid.domainId * 5,
      maxHp: 20 + grid.domainId * 5,
      basePoints: 100 * grid.domainId,
      position: { row: cell.row, col: cell.col },
      behavior: grid.roomType === 'boss' ? 'chase' : 'roam',
      isAlive: true,
    });

    cell.occupantId = id;
  }

  // Spawn friendlies at SPAWN_FRIENDLY cells
  const friendlySpawns = getCellsByType(grid, TILE_TYPES.SPAWN_FRIENDLY);
  for (let i = 0; i < friendlySpawns.length; i++) {
    const cell = friendlySpawns[i];
    const id = `friendly-${i}`;
    const element = elements[rng.rollIndex(`friendly-element-${i}`, elements.length)];

    entities.set(id, {
      id,
      type: 'friendly',
      element,
      hp: 15,
      maxHp: 15,
      basePoints: 50, // Penalty base if hit
      position: { row: cell.row, col: cell.col },
      behavior: 'stationary',
      isAlive: true,
    });

    cell.occupantId = id;
  }

  return entities;
}

// ============================================
// Combat Engine Class
// ============================================

export class CombatEngine {
  private state: CombatState;
  private rng: SeededRng;
  private listeners: Set<(state: CombatState) => void> = new Set();

  constructor(config: CombatConfig, rng: SeededRng) {
    this.rng = rng;
    const fullConfig = { ...DEFAULT_CONFIG, ...config };

    // Generate grid
    const grid = generateGrid(config.domainId, config.roomType, rng);

    // Generate entities
    const entities = generateEntities(grid, rng);

    // Generate dice pool
    const pool = generateDicePool(rng, fullConfig.poolSize, config.domainId);

    // Initial hand draw
    const { hand, pool: updatedPool } = drawHand(pool, [], rng);

    // Calculate target score if not provided
    const targetScore = config.targetScore || calculateTargetScore(config.domainId, config.roomType);
    const maxTurns = config.maxTurns || calculateMaxTurns(config.roomType);

    this.state = {
      phase: 'draw',
      grid,
      entities,
      pool: updatedPool,
      hand,
      holdsRemaining: 2,              // "Trades" per room (not per turn)
      throwsRemaining: 3,             // 3 throws per turn
      targetScore,
      currentScore: 0,
      multiplier: 1,                  // Score multiplier (increases via trades)
      turnsRemaining: maxTurns,
      turnNumber: 1,
      collateralDamage: 0,
      friendlyHits: 0,
      enemiesSquished: 0,
      domainId: config.domainId,
      roomType: config.roomType,
    };
  }

  // ============================================
  // State Access
  // ============================================

  getState(): CombatState {
    return { ...this.state };
  }

  subscribe(listener: (state: CombatState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener(this.getState());
    }
  }

  // ============================================
  // Phase Transitions
  // ============================================

  private setPhase(phase: CombatPhase): void {
    this.state.phase = phase;
    this.notify();
  }

  // ============================================
  // Command Processing
  // ============================================

  dispatch(command: CombatCommand): void {
    switch (command.type) {
      case 'TOGGLE_HOLD':
        this.handleToggleHold(command.dieId);
        break;
      case 'HOLD_ALL':
        this.handleHoldAll();
        break;
      case 'HOLD_NONE':
        this.handleHoldNone();
        break;
      case 'THROW':
        this.handleThrow();
        break;
      case 'END_TURN':
        this.handleEndTurn();
        break;
      case 'TARGET_CELL':
        // For future: targeting specific grid cells
        break;
    }
  }

  private handleToggleHold(dieId: string): void {
    if (this.state.phase !== 'select' && this.state.phase !== 'draw') return;

    const result = toggleHold(this.state.hand, dieId, this.state.holdsRemaining);
    if (result) {
      this.state.hand = result.hand;
      this.state.holdsRemaining = result.holdsRemaining;
      this.setPhase('select');
    }
  }

  private handleHoldAll(): void {
    if (this.state.phase !== 'select' && this.state.phase !== 'draw') return;

    // Set all dice to held in a single atomic operation
    this.state.hand = this.state.hand.map(die => ({ ...die, isHeld: true }));
    this.setPhase('select');
  }

  private handleHoldNone(): void {
    if (this.state.phase !== 'select' && this.state.phase !== 'draw') return;

    // Set all dice to unheld in a single atomic operation
    this.state.hand = this.state.hand.map(die => ({ ...die, isHeld: false }));
    this.setPhase('select');
  }

  private handleThrow(): void {
    if (this.state.phase !== 'select' && this.state.phase !== 'draw') return;
    if (this.state.throwsRemaining <= 0) return; // No throws left

    // Roll unheld dice only
    this.state.hand = rollHand(this.state.hand, this.rng);
    this.state.throwsRemaining--;

    // Calculate score immediately from thrown dice (unheld ones only)
    // This avoids double-counting held dice that were scored in previous throws
    const thrownDice = this.state.hand.filter(d => !d.isHeld);
    const throwTotal = thrownDice.reduce((sum, d) => sum + (d.rollValue || 0), 0);
    const scoreGain = throwTotal * 10 * this.state.multiplier;
    this.state.currentScore += scoreGain;

    this.setPhase('throw');

    // Brief delay for animation, then check if more throws or end turn
    setTimeout(() => {
      if (this.state.throwsRemaining > 0) {
        // More throws available - go back to select
        this.setPhase('select');
      } else {
        // No throws left - end the turn
        this.endTurn();
      }
    }, 500);
  }

  private endTurn(): void {
    this.setPhase('resolve');
    // Transition to enemy turn (score was already calculated per-throw)
    this.processEnemyTurn();
  }

  private processEnemyTurn(): void {
    this.setPhase('enemy_turn');

    // Move enemies
    for (const entity of this.state.entities.values()) {
      if (entity.type === 'enemy' && entity.isAlive) {
        // Simple movement logic - can be expanded
        this.moveEntity(entity);
      }
    }

    // Check end conditions
    this.checkEndConditions();
  }

  private moveEntity(entity: Entity): void {
    // Simple roaming - move to random adjacent cell
    if (entity.behavior === 'stationary') return;

    const { row, col } = entity.position;
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    const validMoves: { row: number; col: number }[] = [];

    for (const [dr, dc] of directions) {
      const newRow = row + dr;
      const newCol = col + dc;

      if (
        newRow >= 0 && newRow < this.state.grid.rows &&
        newCol >= 0 && newCol < this.state.grid.cols
      ) {
        const cell = this.state.grid.cells[newRow][newCol];
        if (
          cell.type !== TILE_TYPES.WALL &&
          cell.type !== TILE_TYPES.HAZARD &&
          !cell.occupantId
        ) {
          validMoves.push({ row: newRow, col: newCol });
        }
      }
    }

    if (validMoves.length > 0) {
      const move = validMoves[this.rng.rollIndex(`move-${entity.id}`, validMoves.length)];

      // Clear old position
      this.state.grid.cells[row][col].occupantId = null;

      // Set new position
      entity.position = move;
      this.state.grid.cells[move.row][move.col].occupantId = entity.id;
    }
  }

  private checkEndConditions(): void {
    this.setPhase('check_end');

    // Victory: score >= target
    if (this.state.currentScore >= this.state.targetScore) {
      this.setPhase('victory');
      return;
    }

    // Defeat: no turns remaining
    this.state.turnsRemaining--;
    if (this.state.turnsRemaining <= 0) {
      this.setPhase('defeat');
      return;
    }

    // Continue: discard played dice, draw new hand
    this.startNewTurn();
  }

  private startNewTurn(): void {
    this.state.turnNumber++;
    this.state.throwsRemaining = 3; // Reset throws for new turn (3 per turn)

    // Discard and draw
    const { hand, pool } = discardAndDraw(this.state.hand, this.state.pool, this.rng);
    this.state.hand = hand;
    this.state.pool = pool;

    // If pool is empty, recycle exhausted
    if (this.state.pool.available.length < MAX_HAND_SIZE - this.state.hand.filter(d => d.isHeld).length) {
      this.state.pool.available = this.rng.shuffle([...this.state.pool.exhausted]);
      this.state.pool.exhausted = [];
    }

    this.setPhase('draw');
  }

  private handleEndTurn(): void {
    // TRADE mechanic: swap unheld dice for new ones, add to multiplier
    // Trading is always available - holdsRemaining is only for re-holding dice
    // Can only trade in select/draw phase (before throwing)
    if (this.state.phase !== 'select' && this.state.phase !== 'draw') return;

    // Count unheld dice being traded
    const unheldCount = this.state.hand.filter(d => !d.isHeld).length;
    if (unheldCount === 0) return; // Nothing to trade

    // Discard unheld dice, draw new ones
    const { hand, pool } = discardAndDraw(this.state.hand, this.state.pool, this.rng);
    this.state.hand = hand;
    this.state.pool = pool;

    // Add traded dice count to multiplier
    this.state.multiplier += unheldCount;

    // If pool is low, recycle exhausted
    if (this.state.pool.available.length < MAX_HAND_SIZE) {
      this.state.pool.available = this.rng.shuffle([
        ...this.state.pool.available,
        ...this.state.pool.exhausted,
      ]);
      this.state.pool.exhausted = [];
    }

    // Back to draw phase with new dice
    this.setPhase('draw');
  }

  // ============================================
  // Public Getters
  // ============================================

  isVictory(): boolean {
    return this.state.phase === 'victory';
  }

  isDefeat(): boolean {
    return this.state.phase === 'defeat';
  }

  isGameOver(): boolean {
    return this.isVictory() || this.isDefeat();
  }

  getScore(): number {
    return this.state.currentScore;
  }

  getTargetScore(): number {
    return this.state.targetScore;
  }

  getTurnsRemaining(): number {
    return this.state.turnsRemaining;
  }
}

// ============================================
// Factory Function
// ============================================

export function createCombatEngine(config: CombatConfig, rng: SeededRng): CombatEngine {
  return new CombatEngine(config, rng);
}
