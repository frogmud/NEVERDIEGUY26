/**
 * Exploration Bonus System
 *
 * Encourages dialogue variety by tracking "coordinates" (npc:mood:pool:tension)
 * and applying decaying bonuses to novel selections.
 */

// Types
export type {
  TensionBand,
  DialogueCoord,
  DialogueCoordComponents,
  ExplorationState,
  ExplorationConfig,
  ExplorationBonus,
} from './types';

export { DEFAULT_EXPLORATION_CONFIG } from './types';

// State management
export {
  createExplorationState,
  getTensionBand,
  buildDialogueCoord,
  parseDialogueCoord,
  recordSelection,
  isCoordVisited,
  getCoordHitCount,
  getTemplateHitCount,
  isTemplateRecent,
  mergeExplorationStates,
} from './exploration-state';

// Bonus calculation
export {
  calculateExplorationBonus,
  applyExplorationBonuses,
  selectWithExplorationBonus,
  getExplorationStats,
} from './bonus-calculator';
