/**
 * Exploration State Management
 *
 * Handles creation, updating, and serialization of exploration state.
 */

import type { MoodType, TemplatePool } from '../core/types';
import type {
  ExplorationState,
  DialogueCoord,
  DialogueCoordComponents,
  TensionBand,
} from './types';

/**
 * Create a fresh exploration state
 */
export function createExplorationState(): ExplorationState {
  return {
    visitedCoords: [],
    coordHitCounts: {},
    templateHitCounts: {},
    recentTemplateIds: [],
    totalSelections: 0,
  };
}

/**
 * Get tension band from continuous tension value
 */
export function getTensionBand(
  tension: number,
  thresholds = {
    medium: 0.3,
    high: 0.6,
    critical: 0.85,
  }
): TensionBand {
  if (tension >= thresholds.critical) return 'critical';
  if (tension >= thresholds.high) return 'high';
  if (tension >= thresholds.medium) return 'medium';
  return 'low';
}

/**
 * Build a dialogue coordinate from components
 */
export function buildDialogueCoord(components: DialogueCoordComponents): DialogueCoord {
  const { npcSlug, mood, pool, tensionBand } = components;
  return `${npcSlug.toLowerCase()}:${mood}:${pool}:${tensionBand}`;
}

/**
 * Parse a dialogue coordinate back to components
 */
export function parseDialogueCoord(coord: DialogueCoord): DialogueCoordComponents | null {
  const parts = coord.split(':');
  if (parts.length !== 4) return null;

  const [npcSlug, mood, pool, tensionBand] = parts;

  // Validate tensionBand
  const validTensions: TensionBand[] = ['low', 'medium', 'high', 'critical'];
  if (!validTensions.includes(tensionBand as TensionBand)) return null;

  return {
    npcSlug,
    mood: mood as MoodType,
    pool: pool as TemplatePool,
    tensionBand: tensionBand as TensionBand,
  };
}

/**
 * Record a dialogue selection in the exploration state
 * Returns a new state object (immutable update)
 */
export function recordSelection(
  state: ExplorationState,
  coord: DialogueCoord,
  templateId: string,
  recentBufferSize = 10
): ExplorationState {
  // Add coord to visited if new
  const visitedCoords = state.visitedCoords.includes(coord)
    ? state.visitedCoords
    : [...state.visitedCoords, coord];

  // Increment coord hit count
  const coordHitCounts = {
    ...state.coordHitCounts,
    [coord]: (state.coordHitCounts[coord] || 0) + 1,
  };

  // Increment template hit count
  const templateHitCounts = {
    ...state.templateHitCounts,
    [templateId]: (state.templateHitCounts[templateId] || 0) + 1,
  };

  // Update recent templates (circular buffer)
  const recentTemplateIds = [templateId, ...state.recentTemplateIds].slice(0, recentBufferSize);

  return {
    visitedCoords,
    coordHitCounts,
    templateHitCounts,
    recentTemplateIds,
    totalSelections: state.totalSelections + 1,
  };
}

/**
 * Check if a coord has been visited
 */
export function isCoordVisited(state: ExplorationState, coord: DialogueCoord): boolean {
  return state.visitedCoords.includes(coord);
}

/**
 * Get hit count for a coord
 */
export function getCoordHitCount(state: ExplorationState, coord: DialogueCoord): number {
  return state.coordHitCounts[coord] || 0;
}

/**
 * Get hit count for a template
 */
export function getTemplateHitCount(state: ExplorationState, templateId: string): number {
  return state.templateHitCounts[templateId] || 0;
}

/**
 * Check if a template is in the recent buffer
 */
export function isTemplateRecent(state: ExplorationState, templateId: string): boolean {
  return state.recentTemplateIds.includes(templateId);
}

/**
 * Merge multiple exploration states (for multi-session aggregation)
 * Useful if you want to track exploration across multiple game sessions
 */
export function mergeExplorationStates(states: ExplorationState[]): ExplorationState {
  if (states.length === 0) return createExplorationState();
  if (states.length === 1) return states[0];

  const merged: ExplorationState = {
    visitedCoords: [],
    coordHitCounts: {},
    templateHitCounts: {},
    recentTemplateIds: [],
    totalSelections: 0,
  };

  for (const state of states) {
    // Union visited coords
    for (const coord of state.visitedCoords) {
      if (!merged.visitedCoords.includes(coord)) {
        merged.visitedCoords.push(coord);
      }
    }

    // Sum coord hit counts
    for (const [coord, count] of Object.entries(state.coordHitCounts)) {
      merged.coordHitCounts[coord] = (merged.coordHitCounts[coord] || 0) + count;
    }

    // Sum template hit counts
    for (const [templateId, count] of Object.entries(state.templateHitCounts)) {
      merged.templateHitCounts[templateId] = (merged.templateHitCounts[templateId] || 0) + count;
    }

    // Concatenate recent templates (will be trimmed later)
    merged.recentTemplateIds.push(...state.recentTemplateIds);

    // Sum selections
    merged.totalSelections += state.totalSelections;
  }

  // Trim recent templates to buffer size (keep most recent from combined states)
  merged.recentTemplateIds = merged.recentTemplateIds.slice(0, 10);

  return merged;
}
