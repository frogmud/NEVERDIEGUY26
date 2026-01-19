/**
 * Exploration Bonus System Types
 *
 * Adapted from novelty-based exploration rewards (Pokemon Red RL approach)
 * to encourage dialogue variety by tracking dialogue "coordinates" and
 * applying decaying bonuses to novel selections.
 */

import type { MoodType, TemplatePool } from '../core/types';

/**
 * Tension level bucket for coordinate building
 */
export type TensionBand = 'low' | 'medium' | 'high' | 'critical';

/**
 * DialogueCoord: A 4-tuple identifying a unique dialogue context
 * Format: "npc:mood:pool:tensionBand"
 * Example: "mr-bones:cryptic:lore:high"
 */
export type DialogueCoord = string;

/**
 * Components that make up a DialogueCoord
 */
export interface DialogueCoordComponents {
  npcSlug: string;
  mood: MoodType;
  pool: TemplatePool;
  tensionBand: TensionBand;
}

/**
 * State tracking for exploration bonuses
 * Serializable for persistence in RunContext
 */
export interface ExplorationState {
  /** Array of all visited coordinates (serialized from Set) */
  visitedCoords: string[];

  /** Count of times each coord was selected */
  coordHitCounts: Record<string, number>;

  /** Count of times each template was selected */
  templateHitCounts: Record<string, number>;

  /** Circular buffer of recent template IDs (for recency penalty) */
  recentTemplateIds: string[];

  /** Total selection count */
  totalSelections: number;
}

/**
 * Configuration for exploration bonus calculation
 */
export interface ExplorationConfig {
  /** Bonus multiplier for completely novel coordinates (never visited) */
  novelCoordBonus: number;

  /** Bonus multiplier for novel templates at known coords */
  novelTemplateBonus: number;

  /** Decay factor per hit: bonus = baseBonus * (decayFactor ^ hitCount) */
  coordDecayFactor: number;
  templateDecayFactor: number;

  /** Minimum bonus multiplier (floor) */
  minBonus: number;

  /** Maximum bonus multiplier (ceiling) */
  maxBonus: number;

  /** Size of recent templates buffer for recency penalty */
  recentBufferSize: number;

  /** Penalty multiplier for templates in recent buffer */
  recencyPenalty: number;

  /** Tension band thresholds */
  tensionThresholds: {
    medium: number;
    high: number;
    critical: number;
  };
}

/**
 * Result of exploration bonus calculation
 */
export interface ExplorationBonus {
  /** Final multiplier to apply to template weight */
  multiplier: number;

  /** Breakdown for debugging/analytics */
  components: {
    coordBonus: number;
    templateBonus: number;
    recencyPenalty: number;
  };

  /** The coord this bonus applies to */
  coord: DialogueCoord;

  /** Whether this coord was novel (first visit) */
  isNovelCoord: boolean;

  /** Whether this template was novel at this coord */
  isNovelTemplate: boolean;

  /** Hit counts for analytics */
  coordHitCount: number;
  templateHitCount: number;
}

/**
 * Default exploration config values
 * Tuned for meaningful novelty bonuses without being dominant
 */
export const DEFAULT_EXPLORATION_CONFIG: ExplorationConfig = {
  novelCoordBonus: 2.0,       // 2x weight for new coords
  novelTemplateBonus: 1.5,    // 1.5x for new templates
  coordDecayFactor: 0.85,     // Halves after ~4 visits
  templateDecayFactor: 0.9,   // Slower decay for templates
  minBonus: 0.5,              // Never go below 0.5x
  maxBonus: 3.0,              // Cap at 3x
  recentBufferSize: 10,       // Track last 10 templates
  recencyPenalty: 0.3,        // 0.3x if recently used
  tensionThresholds: {
    medium: 0.3,
    high: 0.6,
    critical: 0.85,
  },
};
