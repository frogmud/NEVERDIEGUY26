/**
 * Enemy Encounter System - Core Types
 *
 * Enemies speak as vessels for Die-rectors. The player never meets
 * the shadowy masters - only their proxies and mouthpieces.
 */

// ============================================
// Die-rector Slugs (channeling sources)
// ============================================

export type DieRectorSlug =
  | 'the-one'    // Void
  | 'john'       // Earth
  | 'peter'      // Shadow
  | 'robert'     // Fire
  | 'alice'      // Ice
  | 'jane'       // Chaos
  | 'rhea'       // Entropy (Trinity)
  | 'king-james' // Paranoia (Trinity)
  | 'zero-chance'; // Death (Trinity)

// ============================================
// Enemy Types by Domain
// ============================================

export type VoidEnemy = 'nullspawn' | 'voidling' | 'echo';
export type EarthEnemy = 'golem' | 'construct' | 'machine';
export type ShadowEnemy = 'shade' | 'watcher' | 'gate-thing';
export type FireEnemy = 'ember-beast' | 'burnling' | 'ash-form';
export type IceEnemy = 'frost-spawn' | 'crystal' | 'frozen-one';
export type ChaosEnemy = 'mutant' | 'shifter' | 'aberration';
export type CorruptedEnemy = 'claimed-one' | 'marked' | 'consumed';

export type EnemyType =
  | VoidEnemy
  | EarthEnemy
  | ShadowEnemy
  | FireEnemy
  | IceEnemy
  | ChaosEnemy
  | CorruptedEnemy;

// ============================================
// Encounter Types
// ============================================

export type EncounterType = 'demand' | 'observation' | 'offer' | 'test';

export type EncounterTrigger =
  | 'low_health'
  | 'high_corruption'
  | 'many_deaths'
  | 'good_run'
  | 'random';

// ============================================
// Effects
// ============================================

export type EffectType =
  | 'favor'
  | 'corruption'
  | 'grit'
  | 'resource'
  | 'buff'
  | 'debuff'
  | 'combat_mod'
  | 'hint'
  | 'lore_unlock';

export interface EncounterEffect {
  type: EffectType;
  target?: string;        // Die-rector slug for favor, resource type for resource
  value: number;
  duration?: number;      // For buffs/debuffs (in events)
  description?: string;   // Human-readable effect description
}

// ============================================
// Encounter Options
// ============================================

export interface EncounterOption {
  id: string;
  label: string;          // COMPLY, DEFY, SKIP, etc.
  shortText: string;      // Button text
  effects: EncounterEffect[];
  isDefault?: boolean;    // Used on auto-skip
  requiresRoll?: boolean; // For test encounters
  successEffects?: EncounterEffect[];
  failEffects?: EncounterEffect[];
}

// ============================================
// Core Encounter Interface
// ============================================

export interface EnemyEncounter {
  id: string;
  type: EncounterType;
  enemy: EnemyType;
  channeling: DieRectorSlug;

  dialogue: string;           // Filtered voice text
  originalDialogue?: string;  // Pre-filter (for debugging)

  options: EncounterOption[];
  autoSkipDelay: number;      // Default 2500ms

  // Contextual
  trigger?: EncounterTrigger;

  // Visual hints
  dieRectorColor?: string;    // For eye flash effect
  voiceFilter?: string;       // Filter type applied
}

// ============================================
// Encounter Context (for generation)
// ============================================

export interface EncounterContext {
  runSeed: string;
  encounterIndex: number;
  currentDomain: number;      // 1-6

  // Player state
  playerHealth: number;       // 0-100
  corruption: number;         // 0-100
  deathCount: number;
  grit: number;

  // Favor states
  favorStates: Record<string, number>;

  // Ignored tracking
  ignoredCounts: Record<string, number>;
}

// ============================================
// Dialogue Pool Types
// ============================================

export interface DialogueCondition {
  type: 'corruption' | 'deaths' | 'health' | 'favor' | 'grit';
  comparison: 'gte' | 'lte' | 'eq';
  value: number;
  target?: string;  // For favor conditions
}

export interface WeightedDialogue {
  text: string;
  weight: number;
  requires?: DialogueCondition;
}

export interface EnemyDialoguePool {
  enemyType: EnemyType;
  channeling: DieRectorSlug;

  // By encounter type
  demands: WeightedDialogue[];
  observations: WeightedDialogue[];
  offers: WeightedDialogue[];
  tests: WeightedDialogue[];

  // Contextual variants (override normal pools when conditions met)
  lowHealthVariants?: WeightedDialogue[];
  highCorruptionVariants?: WeightedDialogue[];
  postDeathVariants?: WeightedDialogue[];
}

// ============================================
// Ignored State (cross-run tracking)
// ============================================

export interface IgnoredState {
  dieRector: DieRectorSlug;
  skipsInRow: number;
  // Thresholds: 3 = noticed, 5 = offended, 7 = hostile
}

// ============================================
// Encounter Result (after player choice)
// ============================================

export interface EncounterResult {
  encounterId: string;
  chosenOptionId: string;
  wasSkipped: boolean;
  wasAutoSkipped: boolean;
  effects: EncounterEffect[];
  rollResult?: {
    success: boolean;
    roll: number;
    threshold: number;
  };
}

// ============================================
// Speed Settings
// ============================================

export interface EncounterSpeedSettings {
  autoSkipDelay: number;      // 2500ms default, 1000-5000ms range
  typewriterSpeed: 'slow' | 'normal' | 'fast' | 'instant';
  skipOnTap: boolean;         // Default true
  showEffectPreviews: boolean; // Show +/- before selecting
}

export const DEFAULT_ENCOUNTER_SETTINGS: EncounterSpeedSettings = {
  autoSkipDelay: 2500,
  typewriterSpeed: 'normal',
  skipOnTap: true,
  showEffectPreviews: true,
};
