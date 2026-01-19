/**
 * Exploration Bonus Calculator
 *
 * Calculates novelty bonuses for dialogue selection based on:
 * - Coord novelty (have we visited this npc:mood:pool:tension combination?)
 * - Template novelty (have we used this specific template?)
 * - Recency penalty (was this template used recently?)
 */

import type {
  ExplorationState,
  ExplorationConfig,
  ExplorationBonus,
  DialogueCoord,
} from './types';
import { DEFAULT_EXPLORATION_CONFIG } from './types';
import {
  isCoordVisited,
  getCoordHitCount,
  getTemplateHitCount,
  isTemplateRecent,
} from './exploration-state';

/**
 * Calculate exploration bonus for a specific coord + template combination
 */
export function calculateExplorationBonus(
  state: ExplorationState,
  coord: DialogueCoord,
  templateId: string,
  config: Partial<ExplorationConfig> = {}
): ExplorationBonus {
  const cfg = { ...DEFAULT_EXPLORATION_CONFIG, ...config };

  const coordHitCount = getCoordHitCount(state, coord);
  const templateHitCount = getTemplateHitCount(state, templateId);
  const isNovelCoord = !isCoordVisited(state, coord);
  const isNovelTemplate = templateHitCount === 0;
  const isRecent = isTemplateRecent(state, templateId);

  // Calculate coord bonus
  // Novel coords get full bonus, visited coords decay exponentially
  let coordBonus: number;
  if (isNovelCoord) {
    coordBonus = cfg.novelCoordBonus;
  } else {
    // Decay: bonus = novelBonus * (decayFactor ^ hitCount)
    coordBonus = Math.max(
      cfg.minBonus,
      cfg.novelCoordBonus * Math.pow(cfg.coordDecayFactor, coordHitCount)
    );
  }

  // Calculate template bonus
  // Novel templates get full bonus, used templates decay
  let templateBonus: number;
  if (isNovelTemplate) {
    templateBonus = cfg.novelTemplateBonus;
  } else {
    templateBonus = Math.max(
      cfg.minBonus,
      cfg.novelTemplateBonus * Math.pow(cfg.templateDecayFactor, templateHitCount)
    );
  }

  // Calculate recency penalty
  // If template was recently used, apply penalty
  const recencyPenalty = isRecent ? cfg.recencyPenalty : 1.0;

  // Calculate final multiplier
  // Combine bonuses multiplicatively, then apply recency penalty
  const rawMultiplier = coordBonus * templateBonus * recencyPenalty;

  // Clamp to min/max bounds
  const multiplier = Math.max(cfg.minBonus, Math.min(cfg.maxBonus, rawMultiplier));

  return {
    multiplier,
    components: {
      coordBonus,
      templateBonus,
      recencyPenalty,
    },
    coord,
    isNovelCoord,
    isNovelTemplate,
    coordHitCount,
    templateHitCount,
  };
}

/**
 * Apply exploration bonuses to a list of template candidates
 * Returns candidates with adjusted weights
 */
export function applyExplorationBonuses<T extends { id: string; weight: number }>(
  candidates: T[],
  state: ExplorationState,
  coord: DialogueCoord,
  config: Partial<ExplorationConfig> = {}
): Array<{ candidate: T; adjustedWeight: number; bonus: ExplorationBonus }> {
  return candidates.map((candidate) => {
    const bonus = calculateExplorationBonus(state, coord, candidate.id, config);
    const adjustedWeight = candidate.weight * bonus.multiplier;

    return {
      candidate,
      adjustedWeight,
      bonus,
    };
  });
}

/**
 * Get the best candidate after applying exploration bonuses
 * Uses weighted random selection with adjusted weights
 */
export function selectWithExplorationBonus<T extends { id: string; weight: number }>(
  candidates: T[],
  state: ExplorationState,
  coord: DialogueCoord,
  rng: () => number,
  config: Partial<ExplorationConfig> = {}
): { selected: T; bonus: ExplorationBonus } | null {
  if (candidates.length === 0) return null;

  const enhanced = applyExplorationBonuses(candidates, state, coord, config);

  // Calculate total adjusted weight
  const totalWeight = enhanced.reduce((sum, e) => sum + e.adjustedWeight, 0);

  if (totalWeight <= 0) {
    // Fallback to first candidate if all weights are 0
    return {
      selected: candidates[0],
      bonus: enhanced[0].bonus,
    };
  }

  // Weighted random selection
  let random = rng() * totalWeight;

  for (const entry of enhanced) {
    random -= entry.adjustedWeight;
    if (random <= 0) {
      return {
        selected: entry.candidate,
        bonus: entry.bonus,
      };
    }
  }

  // Fallback (shouldn't reach here)
  const last = enhanced[enhanced.length - 1];
  return {
    selected: last.candidate,
    bonus: last.bonus,
  };
}

/**
 * Debug helper: get exploration stats summary
 */
export function getExplorationStats(state: ExplorationState): {
  uniqueCoords: number;
  uniqueTemplates: number;
  totalSelections: number;
  avgHitsPerCoord: number;
  avgHitsPerTemplate: number;
} {
  const uniqueCoords = state.visitedCoords.length;
  const uniqueTemplates = Object.keys(state.templateHitCounts).length;
  const totalSelections = state.totalSelections;

  const avgHitsPerCoord = uniqueCoords > 0
    ? totalSelections / uniqueCoords
    : 0;

  const avgHitsPerTemplate = uniqueTemplates > 0
    ? totalSelections / uniqueTemplates
    : 0;

  return {
    uniqueCoords,
    uniqueTemplates,
    totalSelections,
    avgHitsPerCoord: Math.round(avgHitsPerCoord * 100) / 100,
    avgHitsPerTemplate: Math.round(avgHitsPerTemplate * 100) / 100,
  };
}
