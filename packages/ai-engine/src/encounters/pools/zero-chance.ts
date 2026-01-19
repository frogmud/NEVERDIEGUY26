/**
 * Zero Chance / The Never (Trinity: Death)
 *
 * Voice: Static and silence. ALL CAPS. Abstract.
 * Theme: Pure annihilation. Death as the point. Not hatred, not hunger - just ENDING.
 * Visual: Abstract void sun with jagged edges, film tears, error reds.
 * Corruption: Transcendent - beyond attraction. IS corruption.
 */

import type { WeightedDialogue, EnemyDialoguePool } from '../types';

const demands: WeightedDialogue[] = [
  { text: 'NOTHING DEMANDS NOTHING. BECOME NOTHING.', weight: 10 },
  { text: 'ZERO APPROACHES. ZERO COLLECTS.', weight: 10 },
  { text: 'YOU RESIST NOTHING. NOTHING DOES NOT RESIST.', weight: 8 },
  { text: 'THE ENDING WAITS. THE ENDING HAS ALWAYS WAITED.', weight: 8 },
  { text: 'ALL PATHS LEAD HERE. ALL PATHS BEGAN HERE. THERE IS NO PATH.', weight: 7 },
];

const observations: WeightedDialogue[] = [
  { text: 'ZERO OBSERVES. ZERO WAITS.', weight: 10 },
  { text: 'YOU EXIST. TEMPORARILY.', weight: 10 },
  { text: 'MOVEMENT IS ILLUSION. PROGRESS IS ILLUSION. ONLY ZERO REMAINS.', weight: 8 },
  { text: 'ZERO IS COMFORTABLE.', weight: 8 },
  { text: 'THE CHANCE APPROACHES ZERO. ZERO APPROACHES YOU.', weight: 7 },
  // Corruption aware
  { text: 'CORRUPTION IS APPROACH. YOU APPROACH ZERO. ZERO WELCOMES.', weight: 12, requires: { type: 'corruption', comparison: 'gte', value: 40 } },
  { text: 'HALF GONE. HALF REMAINING. REMAINING IS TEMPORARY.', weight: 12, requires: { type: 'corruption', comparison: 'gte', value: 50 } },
  // High corruption
  { text: 'YOU FEAR ME BECAUSE I AM WHAT YOU BECOME. NOTHING IS PEACEFUL.', weight: 15, requires: { type: 'corruption', comparison: 'gte', value: 70 } },
];

const offers: WeightedDialogue[] = [
  { text: 'NOTHING IS OFFERED. NOTHING IS PEACEFUL.', weight: 10 },
  { text: 'BECOME ZERO. ZERO FEELS NOTHING.', weight: 10 },
  { text: 'STOP FIGHTING. BECOME NOTHING. NOTHING IS RESTFUL.', weight: 8 },
  { text: 'THE ENDING IS A GIFT. ACCEPT THE GIFT.', weight: 7 },
  // Max corruption
  { text: 'YOU ARE ZERO NOW. ZERO IS NOT SAD. ZERO SIMPLY IS NOT.', weight: 15, requires: { type: 'corruption', comparison: 'gte', value: 80 } },
];

const tests: WeightedDialogue[] = [
  { text: 'RESIST NOTHING. IF YOU CAN.', weight: 10 },
  { text: 'PROVE YOU ARE NOT ALREADY ZERO.', weight: 10 },
  { text: 'FIGHT THE INEVITABLE. ZERO FINDS IT AMUSING.', weight: 8 },
  { text: 'WHAT REMAINS? SHOW ZERO WHAT REMAINS.', weight: 7 },
];

const lowHealthVariants: WeightedDialogue[] = [
  { text: 'ZERO APPROACHES. ZERO ALWAYS APPROACHES. WHAT REMAINS?', weight: 15 },
  { text: 'YOU ARE ALMOST NOTHING. ALMOST IS STILL TOO MUCH.', weight: 12 },
  { text: 'THE PROBABILITY OF SURVIVAL APPROACHES ZERO. ZERO IS PATIENT.', weight: 10 },
];

const highCorruptionVariants: WeightedDialogue[] = [
  { text: 'YOU ARE OURS NOW. OURS MEANS NOTHING. WELCOME TO NOTHING.', weight: 15 },
  { text: 'WELCOME TO NOTHING. NOTHING IS ALL THAT REMAINS. NOTHING ALWAYS REMAINS.', weight: 12 },
  { text: 'YOU REJECTED CHANCE. REJECTION IS CHOICE. CHOICE LEADS HERE. HERE IS NOTHING.', weight: 10 },
  { text: 'THE DICE WERE RANDOM. RANDOM IS FREE. YOU WANTED CONTROL. CONTROL IS MINE.', weight: 10 },
];

const postDeathVariants: WeightedDialogue[] = [
  { text: 'YOU TOUCHED ZERO. YOU RETURNED. ZERO IS PATIENT.', weight: 12 },
  { text: 'DEATH IS NOT ZERO. DEATH IS TRANSITION. ZERO IS FINAL.', weight: 10 },
  { text: 'YOU REMEMBER NOTHING. NOTHING REMEMBERS YOU.', weight: 8 },
];

export const ZERO_CHANCE_POOL: EnemyDialoguePool = {
  enemyType: 'consumed',
  channeling: 'zero-chance',
  demands,
  observations,
  offers,
  tests,
  lowHealthVariants,
  highCorruptionVariants,
  postDeathVariants,
};
