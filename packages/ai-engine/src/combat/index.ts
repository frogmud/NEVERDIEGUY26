/**
 * Combat Module - Grid-based turn-based combat system
 *
 * Exports:
 * - Grid generation (procedural rooms)
 * - Dice hand management (Balatro-style play/hold)
 * - Combat engine (state machine)
 * - Scoring system (hits, combos, penalties)
 *
 * NEVER DIE GUY
 */

// Grid Generator
export {
  TILE_TYPES,
  type TileType,
  type GridCell,
  type GridState,
  type RoomType,
  generateGrid,
  getCellAt,
  getAdjacentCells,
  getCellsByType,
  getWalkableCells,
  isCellWalkable,
  gridToAscii,
} from './grid-generator';

// Dice Hand System
export {
  type DieSides,
  type Element,
  type Die,
  type DiceHand,
  type DicePool,
  MAX_HAND_SIZE,
  DEFAULT_HOLDS_PER_ROOM,
  DIE_ELEMENTS,
  generateDicePool,
  generateWeightedPool,
  drawHand,
  rollHand,
  toggleHold,
  discardAndDraw,
  getHandTotal,
  countByElement,
  getElementCombos,
  getHeldCount,
  isPoolEmpty,
  getPoolRemaining,
} from './dice-hand';

// Combat Engine
export {
  type CombatPhase,
  type Entity,
  type EntityMap,
  type CombatState,
  type CombatCommand,
  type CombatConfig,
  CombatEngine,
  createCombatEngine,
} from './combat-engine';

// Scoring System
export {
  SCORE_MODIFIERS,
  type HitResult,
  type ComboResult,
  type ElementComboResult,
  type TurnSummary,
  getElementMultiplier,
  calculateHitScore,
  calculateCombo,
  calculateElementCombo,
  calculateTurnSummary,
  calculateTargetScore,
  calculateGoldReward,
} from './scoring';

// Balance Configuration (Time Pressure, Score Tuning)
export {
  TIMER_CONFIG,
  TIMER_CONFIG_BY_ROOM,
  SCORE_CONFIG,
  type TimerConfig,
  type RoomType as BalanceRoomType,
  getTimerConfigForRoom,
  getTimePressureMultiplier,
  getEarlyFinishBonus,
  isInGracePeriod,
  calculateTargetScore as calculateBalancedTargetScore,
} from './balance-config';

// Item System (re-export from items package)
export {
  type ItemCategory,
  type ItemRarity,
  type ItemElement,
  type CombatStats,
  type EffectTrigger,
  type ItemEffect,
  type ItemDefinition,
  type RarityConfig,
  DEFAULT_COMBAT_STATS,
  RARITY_CONFIG,
  calculateShopPrice,
  validateItem,
  generateStatBlock,
  mergeItemStats,
} from '../items';
