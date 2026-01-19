/**
 * Enemy Encounter System
 *
 * Fast, skippable encounters where enemies speak as vessels for Die-rectors.
 * Seeded generation for reproducibility. Contextual dialogue based on player state.
 */

// Core types
export * from './types';

// Domain mapping
export * from './domain-mapping';

// Generator
export {
  generateEncounter,
  generateEncounterSequence,
  verifySeededGeneration,
  type GeneratorOptions,
} from './generator';

// Dialogue pools
export {
  getDialoguePool,
  selectDialogue,
  getEncounterDialogue,
} from './pools';
