/**
 * Multiplayer Module - Divine Drama Engine
 *
 * PartyKit integration for multiplayer racing mode.
 * Die-rectors develop opinions and intervene based on dice usage.
 *
 * NEVER DIE GUY
 */

// Favor System
export {
  type DiceEventType,
  type DiceEvent,
  type FavorState,
  type DierectorFavor,
  type PlayerFavorMap,
  type PersonalityVariance,
  FAVOR_THRESHOLDS,
  DIERECTOR_PERSONALITY,
  PANTHEON_AFFINITY,
  BASE_FAVOR_DELTAS,
  DIE_TO_DIERECTOR,
  getAffinity,
  getRivals,
  getAllies,
  getDierectorForDie,
  calculateFavorDelta,
  applyFavorDelta,
  createInitialFavorMap,
  processDiceEvent,
} from './favor-system';

// Intervention System
export {
  type InterventionType,
  type InterventionEffect,
  type InterventionEvent,
  generateIntervention,
  checkRivalrySympathy,
  getActiveEffects,
  calculateElementMultiplier,
  calculateShopModifier,
} from './intervention-system';

// Room Types (for client consumption)
export * from './room-types';
