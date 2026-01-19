/**
 * Rhea - Queen of Never (Trinity: Entropy)
 *
 * Voice: Calm to the point of unsettling. Speaks in future tense about present events.
 * Theme: Inevitability, decay, the end of process. Former prophet who tried to BECOME prophecy.
 * Corruption: Attracted - she sees corruption as natural. Everything decays.
 */

import type { WeightedDialogue, EnemyDialoguePool } from '../types';

const demands: WeightedDialogue[] = [
  { text: 'Entropy claims all. Why resist?', weight: 10 },
  { text: 'The ending is inevitable. Hasten it.', weight: 10 },
  { text: 'I dont need to corrupt you. Time does that.', weight: 8 },
  { text: 'You wanted the perfect loadout. Perfect is a destination. All destinations are mine.', weight: 7 },
  { text: 'Every reroll was a step toward me. Thank you for walking.', weight: 6 },
];

const observations: WeightedDialogue[] = [
  { text: 'I saw this moment. I see all moments.', weight: 10 },
  { text: 'You are exactly where I expected.', weight: 10 },
  { text: 'I saw you here. I saw you leaving. I saw you returning. The seeing is boring now.', weight: 8 },
  { text: 'The future is not a mystery. The future is a schedule.', weight: 8 },
  { text: 'You will make a choice. The choice is already made. The making is theater.', weight: 7 },
  { text: 'I saw the pattern. Every run, every death, every choice - a single shape, repeating.', weight: 6 },
  // Low corruption - still clean
  { text: 'The decay begins. It always begins.', weight: 10, requires: { type: 'corruption', comparison: 'lte', value: 20 } },
  // Medium corruption
  { text: 'There it is. The settling. The acceptance beginning.', weight: 12, requires: { type: 'corruption', comparison: 'gte', value: 40 } },
  // High corruption
  { text: 'You are arriving. I have watched you arrive so many times.', weight: 15, requires: { type: 'corruption', comparison: 'gte', value: 70 } },
];

const offers: WeightedDialogue[] = [
  { text: 'I can show you the ending. It brings peace.', weight: 10 },
  { text: 'Accept inevitability. I can help.', weight: 10 },
  { text: 'Chaos is a tantrum. Order is a delusion. Entropy is the adult in the room.', weight: 8 },
  { text: 'I dont destroy. I wait. Destruction gets impatient and does my work.', weight: 7 },
  { text: 'The crown was supposed to free me. The crown is the cage. Want to share the weight?', weight: 6 },
  // High corruption
  { text: 'Welcome to the end of the process. The process is you.', weight: 15, requires: { type: 'corruption', comparison: 'gte', value: 80 } },
];

const tests: WeightedDialogue[] = [
  { text: 'Defy inevitability. If you dare.', weight: 10 },
  { text: 'Can you resist the end? Show me.', weight: 10 },
  { text: 'Fight the current. Its amusing when they fight the current.', weight: 8 },
  { text: 'The resistance is beautiful. The surrender is... expected.', weight: 7 },
];

const lowHealthVariants: WeightedDialogue[] = [
  { text: 'The end approaches. The end has always been approaching.', weight: 15 },
  { text: 'You are nearly where all things go. I will be here when you arrive.', weight: 12 },
  { text: 'Entropy is patient. I am entropy. But even I grow tired of waiting.', weight: 10 },
];

const highCorruptionVariants: WeightedDialogue[] = [
  { text: 'I am entropy. You are entropy now. We are quiet together.', weight: 15 },
  { text: 'The corruption is proof. Proof of what? Proof of me.', weight: 12 },
  { text: 'You rejected the dice. The dice were the last free thing.', weight: 10 },
];

const postDeathVariants: WeightedDialogue[] = [
  { text: 'You return. As predicted. As always.', weight: 12 },
  { text: 'Death is not the end. I am the end. Death is just... transit.', weight: 10 },
  { text: 'The silence between moments is where I live. Its very quiet. Very, very quiet.', weight: 8 },
];

export const RHEA_POOL: EnemyDialoguePool = {
  enemyType: 'claimed-one',
  channeling: 'rhea',
  demands,
  observations,
  offers,
  tests,
  lowHealthVariants,
  highCorruptionVariants,
  postDeathVariants,
};
